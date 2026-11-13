/* Orquestra a publicação: ponte autenticada → projeto → lotes de assets → deployment → espera → verificação do link. Retomável e protegida contra clique duplo. */
import {novoId} from '../esquema.js';
const bytesDe=c=>typeof c==='string'?new TextEncoder().encode(c):c;
function paraBase64(bytes){let s='';const T=0x8000;for(let i=0;i<bytes.length;i+=T)s+=String.fromCharCode.apply(null,bytes.subarray(i,i+T));return btoa(s);}
export const LOTE={bytes:3.3*1024*1024,arquivos:60};
async function comprimir(bytes){if(typeof CompressionStream==='undefined'||bytes.length<2048)return {base64:paraBase64(bytes),gz:false};const cs=new CompressionStream('gzip'),w=cs.writable.getWriter();w.write(bytes);w.close();const buf=new Uint8Array(await new Response(cs.readable).arrayBuffer());return buf.length<bytes.length?{base64:paraBase64(buf),gz:true}:{base64:paraBase64(bytes),gz:false};}
export function dividirLotes(lista,{bytes=LOTE.bytes,arquivos=LOTE.arquivos}={}){
 const lotes=[];let atual=[],tam=0;for(const a of lista){if(atual.length&&(tam+a.tamanho>bytes||atual.length>=arquivos)){lotes.push(atual);atual=[];tam=0;}atual.push(a);tam+=a.tamanho;}if(atual.length)lotes.push(atual);return lotes;
}
export function criarPublicador({transporte,espera=ms=>new Promise(r=>setTimeout(r,ms)),agora=()=>Date.now()}){
 const emAndamento=new Set();
 const t=transporte;
 const post=(acao,corpo)=>t.chamar(acao,{metodo:'POST',corpo});
 return {
  async status(){return t.chamar('publicar-status');},
  emAndamento:id=>emAndamento.has(id),
  async publicar(pub,{arquivos,cabecalhos='',aoEtapa=()=>{},esperaMaxMs=150000}){
   if(emAndamento.has(pub.id))throw Object.assign(Error('Esta publicação já está em andamento.'),{codigo:'duplicado'});
   emAndamento.add(pub.id);
   const passo=(etapa,extra={})=>{pub.etapa=etapa;Object.assign(pub,extra);pub.atualizadoEm=new Date().toISOString();try{aoEtapa(pub);}catch{}};
   const log=(nivel,texto)=>{pub.logs=[...(pub.logs||[]).slice(-39),{quando:new Date().toISOString(),nivel,texto}];};
   try{
    passo('iniciando',{erro:'',estado:'publicando'});
    const ini=await post('publicar-iniciar',{nome:pub.projeto});
    passo('enviando',{projeto:ini.projeto,subdominio:ini.subdominio,urlPublica:'https://'+ini.subdominio,projetoCriado:ini.criado});log('info',ini.criado?'Projeto criado na Cloudflare.':'Projeto existente reutilizado.');
    const lista=Object.entries(arquivos).map(([caminho,c])=>({caminho,tamanho:bytesDe(c).length}));
    const pacotes={};
    pub.hashes??={};
    if(pub.hashesVersao!==pub.versaoPacote){pub.hashes={};pub.hashesVersao=pub.versaoPacote;}
    const faltam=lista.filter(a=>!pub.hashes[a.caminho]);for(const a of faltam){pacotes[a.caminho]=await comprimir(bytesDe(arquivos[a.caminho]));a.tamanho=pacotes[a.caminho].base64.length;if(a.tamanho>4.1*1024*1024)throw Error('O arquivo '+a.caminho+' é grande demais para a ponte mesmo comprimido. Use a exportação ZIP e a publicação manual.');}
    const lotes=dividirLotes(faltam,{bytes:3.9*1024*1024});let enviados=0,reaproveitados=0;
    for(let i=0;i<lotes.length;i++){
     const corpo={projeto:ini.projeto,arquivos:lotes[i].map(a=>({caminho:a.caminho,base64:pacotes[a.caminho].base64,gz:pacotes[a.caminho].gz}))};
     let r,tent=0;while(true){try{r=await post('publicar-lote',corpo);break;}catch(e){if(++tent>=3)throw e;log('aviso','Lote '+(i+1)+' falhou ('+e.message+'); repetindo.');await espera(800*tent);}}
     Object.assign(pub.hashes,r.hashes);enviados+=r.enviados;reaproveitados+=r.jaExistiam;passo('enviando',{progresso:{lote:i+1,de:lotes.length}});
    }
    log('info',`Arquivos: ${lista.length} (${enviados} enviados, ${reaproveitados} já existiam).`);
    const manifesto=Object.fromEntries(lista.map(a=>['/'+a.caminho,pub.hashes[a.caminho]]));
    if(Object.values(manifesto).some(h=>!h))throw Error('Faltam hashes de alguns arquivos; tente novamente.');
    passo('finalizando');
    if(!pub.deployId||pub.deployManifestoHash!==chave(manifesto)){const d=await post('publicar-finalizar',{projeto:ini.projeto,manifesto,mensagem:'Órbita v'+(pub.versao||1),cabecalhos});passo('aguardando',{deployId:d.id,deployUrl:d.url,deployManifestoHash:chave(manifesto)});}
    const limite=agora()+esperaMaxMs;let st;
    while(true){st=await t.chamar('publicar-estado',{q:{projeto:ini.projeto,deploy:pub.deployId}});if(st.concluido||st.falhou)break;if(agora()>limite){passo('aguardando',{estado:'em-processamento'});log('aviso','A Cloudflare ainda processa o deploy; verifique novamente em instantes.');return pub;}await espera(2500);}
    if(st.falhou)throw Error('O deploy falhou na Cloudflare ('+(st.estagios.find(s=>s.estado==='failure')?.nome||'etapa desconhecida')+').');
    passo('verificando');const v=await verificar(pub,t,espera);
    passo('concluida',{estado:v.disponivel?'publicada':'publicada-sem-verificacao',verificacao:v,publicadoEm:new Date().toISOString(),ultimaVerificacao:v.verificadoEm});log(v.disponivel?'info':'aviso',v.disponivel?'Link verificado: responde HTTP '+v.status+'.':'Deploy concluído, mas o link ainda não respondeu. Tente verificar novamente.');
    return pub;
   }catch(e){log('erro',e.message);passo(pub.etapa||'erro',{estado:'falhou',erro:e.message});throw e;}
   finally{emAndamento.delete(pub.id);}
  },
  verificar:pub=>verificar(pub,t,espera),
  async listarDeploys(projeto){return (await t.chamar('publicar-deploys',{q:{projeto}})).deploys;},
  async restaurar(projeto,deploy){return post('publicar-restaurar',{projeto,deploy});},
  async excluirDeploy(projeto,deploy){return post('publicar-excluir',{projeto,deploy,confirmacao:'EXCLUIR '+projeto});},
  async excluirProjeto(projeto){return post('publicar-excluir',{projeto,confirmacao:'EXCLUIR PROJETO '+projeto});}
 };
}
function chave(m){let h=2166136261;for(const c of Object.entries(m).sort().map(e=>e.join(':')).join('|')){h^=c.charCodeAt(0);h=Math.imul(h,16777619)>>>0;}return h.toString(16)+':'+Object.keys(m).length;}
async function verificar(pub,t,espera){
 let v;for(let i=0;i<5;i++){v=await t.chamar('publicar-verificar',{q:{projeto:pub.projeto,url:pub.urlPublica}});if(v.disponivel)return v;await espera(2500);}return v;
}
export const novaPublicacao=({empresaId,demonstracaoId,projeto,modeloId,versao,versaoPacote})=>({id:novoId(),empresaId,demonstracaoId,projeto,modeloId,versao,versaoPacote,criadaEm:new Date().toISOString(),estado:'rascunho',etapa:'',urlPublica:'',deployId:'',hashes:{},hashesVersao:versaoPacote,historico:[],logs:[],arquivada:false});
