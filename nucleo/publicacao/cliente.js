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
    const imp=await impressaoDoPacote(arquivos,cabecalhos);pub.pacoteHash=imp.pacote;
    const lista=Object.entries(arquivos).map(([caminho,c])=>({caminho,tamanho:bytesDe(c).length}));
    pub.hashes??={};pub.conteudos??={};
    for(const c of Object.keys(pub.hashes))if(!(c in arquivos)){delete pub.hashes[c];delete pub.conteudos[c];}
    const inalterado=c=>!!pub.hashes[c]&&pub.conteudos[c]===imp.arquivos[c];
    const enviarFaltantes=async(todos)=>{
     const faltam=lista.filter(a=>todos||!inalterado(a.caminho)),pacotes={};
     for(const a of faltam){pacotes[a.caminho]=await comprimir(bytesDe(arquivos[a.caminho]));a.tamanho=pacotes[a.caminho].base64.length;if(a.tamanho>4.1*1024*1024)throw Error('O arquivo '+a.caminho+' é grande demais para a ponte mesmo comprimido. Use a exportação ZIP e a publicação manual.');}
     const lotes=dividirLotes(faltam,{bytes:3.9*1024*1024});let enviados=0,reaproveitados=0;
     for(let i=0;i<lotes.length;i++){
      const corpo={projeto:ini.projeto,arquivos:lotes[i].map(a=>({caminho:a.caminho,base64:pacotes[a.caminho].base64,gz:pacotes[a.caminho].gz}))};
      let r,tent=0;while(true){try{r=await post('publicar-lote',corpo);break;}catch(e){if(++tent>=3)throw e;log('aviso','Lote '+(i+1)+' falhou ('+e.message+'); repetindo.');await espera(800*tent);}}
      Object.assign(pub.hashes,r.hashes);for(const a of lotes[i])pub.conteudos[a.caminho]=imp.arquivos[a.caminho];enviados+=r.enviados;reaproveitados+=r.jaExistiam;passo('enviando',{progresso:{lote:i+1,de:lotes.length}});
     }
     return {enviados,reaproveitados,reenviados:faltam.length};
    };
    const r1=await enviarFaltantes(false);
    log('info',`Arquivos: ${lista.length} (${r1.reenviados} enviados à ponte, ${lista.length-r1.reenviados} inalterados reaproveitados; Cloudflare já tinha ${r1.reaproveitados}).`);
    const montar=()=>{const m=Object.fromEntries(lista.map(a=>['/'+a.caminho,pub.hashes[a.caminho]]));if(Object.values(m).some(h=>!h))throw Error('Faltam hashes de alguns arquivos; tente novamente.');return m;};
    let manifesto=montar();
    passo('finalizando');
    const estadoDeploy=()=>t.chamar('publicar-estado',{q:{projeto:ini.projeto,deploy:pub.deployId}});
    const descartar=(motivo,falho,st)=>{if(falho){pub.deploysFalhos=[...(pub.deploysFalhos||[]).slice(-9),{id:pub.deployId,quando:new Date().toISOString(),estagio:st?.estagios?.find(x=>x.estado==='failure'||x.estado==='canceled')?.nome||st?.estagio||'',motivo}];}log(falho?'aviso':'info',motivo);passo(pub.etapa,{deployId:'',deployUrl:'',deployManifestoHash:''});};
    let st=null;
    if(pub.deployId){
     if(pub.deployManifestoHash!==chave(manifesto))descartar('O conteúdo mudou desde o último deploy: criando um novo.',false);
     else{try{st=await estadoDeploy();}catch(e){if(e.http===404){descartar('O deploy anterior não existe mais na Cloudflare: criando um novo.',true);}else throw e;}
      if(st&&st.falhou){descartar('O deploy anterior falhou na Cloudflare: criando um novo.',true,st);st=null;}}
    }
    if(!pub.deployId){
     const criar=async()=>{const d=await post('publicar-finalizar',{projeto:ini.projeto,manifesto,mensagem:'Órbita v'+(pub.versao||1),cabecalhos});passo('aguardando',{deployId:d.id,deployUrl:d.url,deployManifestoHash:chave(manifesto)});};
     try{await criar();}
     catch(e){if(r1.reenviados<lista.length&&!/permiss|Credencial|token|Authentication|limite/i.test(e.message)){log('aviso','A criação do deploy falhou ('+e.message+'). Reenviando todos os arquivos, pois os reaproveitados podem ter expirado na Cloudflare.');await enviarFaltantes(true);manifesto=montar();await criar();}else throw e;}
     st=null;
    }
    const limite=agora()+esperaMaxMs;
    while(true){
     if(!st)st=await estadoDeploy();
     if(st.concluido)break;
     if(st.falhou){const motivo='O deploy falhou na Cloudflare ('+(st.estagios?.find(x=>x.estado==='failure'||x.estado==='canceled')?.nome||'etapa desconhecida')+'). Ao tentar de novo, um novo deploy será criado.';descartar(motivo,true,st);throw Error(motivo);}
     if(agora()>limite){passo('aguardando',{estado:'em-processamento'});log('aviso','A Cloudflare ainda processa o deploy; verifique novamente em instantes.');return pub;}
     st=null;await espera(2500);
    }
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
async function sha256(bytes){const b=await crypto.subtle.digest('SHA-256',bytes);return [...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('');}
export async function impressaoDoPacote(arquivos,cabecalhos=''){
 const por={};for(const [c,v] of Object.entries(arquivos))por[c]=await sha256(bytesDe(v));
 const linhas=Object.keys(por).sort().map(c=>c+'\t'+por[c]);linhas.push('_headers\t'+await sha256(bytesDe(cabecalhos||'')));
 return {arquivos:por,pacote:(await sha256(bytesDe(linhas.join('\n')))).slice(0,32)};
}
function chave(m){let h=2166136261;for(const c of Object.entries(m).sort().map(e=>e.join(':')).join('|')){h^=c.charCodeAt(0);h=Math.imul(h,16777619)>>>0;}return h.toString(16)+':'+Object.keys(m).length;}
async function verificar(pub,t,espera){
 let v;for(let i=0;i<5;i++){v=await t.chamar('publicar-verificar',{q:{projeto:pub.projeto,url:pub.urlPublica}});if(v.disponivel)return v;await espera(2500);}return v;
}
export const novaPublicacao=({empresaId,demonstracaoId,projeto,modeloId,versao,versaoPacote})=>({id:novoId(),empresaId,demonstracaoId,projeto,modeloId,versao,versaoPacote,criadaEm:new Date().toISOString(),estado:'rascunho',etapa:'',urlPublica:'',deployId:'',hashes:{},conteudos:{},deploysFalhos:[],historico:[],logs:[],arquivada:false});
