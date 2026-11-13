import {relacoes,registrarAuditoria,novoId,normalizarEmpresa} from './esquema.js';
const semAcento=v=>String(v??'').normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase();
export function telefoneNormalizado(v){let n=String(v||'').replace(/\D/g,'');if(n.startsWith('55')&&n.length>=12)n=n.slice(2);if(n.length<10||n.length>11)return '';if(/^(\d)\1+$/.test(n))return '';return n;}
export function variantesTelefone(v){const n=telefoneNormalizado(v);if(!n)return [];const r=[n];if(n.length===11&&n[2]==='9')r.push(n.slice(0,2)+n.slice(3));if(n.length===10)r.push(n.slice(0,2)+'9'+n.slice(2));return r;}
export function emailNormalizado(v){const e=String(v||'').trim().toLowerCase();return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e)?e:'';}
export function dominioSite(v){try{const u=new URL(/^https?:/i.test(v)?v:'https://'+String(v).trim());const h=u.hostname.replace(/^www\./,'').toLowerCase();if(!h.includes('.'))return '';if(/(instagram|facebook|wa\.me|linktr\.ee|whatsapp)/.test(h))return '';return h;}catch{return '';}}
export function perfilSocial(v){const s=String(v||'').trim();if(!s)return '';const m=s.match(/(?:instagram\.com|facebook\.com)\/([\w.\-]+)/i);const h=m?m[1]:s.replace(/^@/,'').replace(/[^\w.\-]/g,'');return h&&!/^(p|reel|explore)$/i.test(h)?semAcento(h):'';}
const ruido=new Set(['ltda','me','mei','eireli','epp','sa','da','de','do','das','dos','e','&','a','o','the','cia','comercio','servicos','empresa','grupo']);
export function nomeNormalizado(v){return semAcento(v).replace(/[^a-z0-9\s]/g,' ').split(/\s+/).filter(p=>p&&!ruido.has(p)).join(' ');}
function levenshtein(a,b){const m=a.length,n=b.length;if(!m)return n;if(!n)return m;let anterior=Array.from({length:n+1},(_,i)=>i);for(let i=1;i<=m;i++){const atual=[i];for(let j=1;j<=n;j++)atual[j]=Math.min(anterior[j]+1,atual[j-1]+1,anterior[j-1]+(a[i-1]===b[j-1]?0:1));anterior=atual;}return anterior[n];}
export function similaridade(a,b){if(!a||!b)return 0;if(a===b)return 1;return 1-levenshtein(a,b)/Math.max(a.length,b.length);}
export function cidadeNormalizada(v){return semAcento(v).replace(/[^a-z\s]/g,' ').replace(/\s+/g,' ').trim();}
export function compararEmpresas(a,b){
 const motivos=[];let forca=0;
 const ta=[...variantesTelefone(a.whatsapp),...variantesTelefone(a.telefone)],tb=[...variantesTelefone(b.whatsapp),...variantesTelefone(b.telefone)];
 if(ta.some(x=>tb.includes(x))){motivos.push('Mesmo WhatsApp ou telefone');forca=Math.max(forca,95);}
 const ea=emailNormalizado(a.email),eb=emailNormalizado(b.email);if(ea&&ea===eb){motivos.push('Mesmo e-mail');forca=Math.max(forca,90);}
 const da=dominioSite(a.site),db=dominioSite(b.site);if(da&&da===db){motivos.push('Mesmo domínio de site');forca=Math.max(forca,85);}
 const pa=perfilSocial(a.instagram),pb=perfilSocial(b.instagram);if(pa&&pa===pb){motivos.push('Mesmo perfil social');forca=Math.max(forca,85);}
 const na=nomeNormalizado(a.nome),nb=nomeNormalizado(b.nome),mesmaCidade=cidadeNormalizada(a.cidade)&&cidadeNormalizada(a.cidade)===cidadeNormalizada(b.cidade);
 if(na&&na===nb){motivos.push(mesmaCidade?'Mesmo nome na mesma cidade':'Mesmo nome');forca=Math.max(forca,mesmaCidade?80:60);}
 else if(na&&nb&&mesmaCidade&&similaridade(na,nb)>=.82){motivos.push('Nome semelhante na mesma cidade');forca=Math.max(forca,65);}
 return motivos.length?{motivos,forca}:null;
}
export function encontrarDuplicidades(candidata,empresas,ignorarId=''){
 const r=[];for(const e of empresas){if(e.id===ignorarId||e.id===candidata.id)continue;const c=compararEmpresas(candidata,e);if(c)r.push({empresa:e,...c});}
 return r.sort((x,y)=>y.forca-x.forca);
}
export function listarGruposDuplicados(empresas){
 const pares=[];for(let i=0;i<empresas.length;i++)for(let j=i+1;j<empresas.length;j++){const c=compararEmpresas(empresas[i],empresas[j]);if(c)pares.push({a:empresas[i],b:empresas[j],...c});}
 return pares.sort((x,y)=>y.forca-x.forca);
}
const camposEscalares=['cidade','contato','telefone','whatsapp','email','site','instagram','endereco','fonte','nicho','cro','responsavel','horario','potencial','abordagem','proximaAcao','retornoEm','condicoes','motivoPerda','primeiroContato','ultimoContato'];
export function mesclarEmpresas(estado,idPrincipal,idSecundaria){
 const p=estado.empresas.find(e=>e.id===idPrincipal),s=estado.empresas.find(e=>e.id===idSecundaria);
 if(!p||!s||p===s)throw Error('Selecione duas empresas diferentes.');
 const copia=structuredClone(s),anteriorRelacionados={};
 for(const c of camposEscalares)if(!p[c]&&s[c])p[c]=s[c];
 if(p.statusSite==='desconhecido')p.statusSite=s.statusSite;if(p.interesse==='desconhecido')p.interesse=s.interesse;if(p.contatoDireto==='desconhecido')p.contatoDireto=s.contatoDireto;
 p.solicitouDemo=p.solicitouDemo||s.solicitouDemo;p.valor=p.valor||s.valor;if(p.valorNegociado==null)p.valorNegociado=s.valorNegociado;if(!p.modelo)p.modelo=s.modelo;
 for(const c of ['links','diferenciais','servicosOferecidos','necessidades','objecoes'])p[c]=[...new Set([...(p[c]||[]),...(s[c]||[])])];
 if(s.notas)p.notas=[p.notas,'— Mesclado de '+s.nome+': '+s.notas].filter(Boolean).join('\n\n');
 p.historico=[...p.historico,...s.historico.map(h=>({...h,texto:h.texto+' (de '+s.nome+')'}))].sort((a,b)=>new Date(a.quando)-new Date(b.quando));
 p.historico.push({quando:new Date().toISOString(),texto:'Registro de '+s.nome+' mesclado a esta empresa.'});
 if(s.situacao==='nao-contatar')p.situacao='nao-contatar';
 const ordem=etapa=>['encontrada','verificada','mensagem','respondeu','demonstracao','negociacao','proposta','fechada'].indexOf(etapa);if(ordem(s.etapa)>ordem(p.etapa)&&p.situacao==='ativa'){p.etapa=s.etapa;p.etapaEm=s.etapaEm;}
 for(const [colecao,campo] of relacoes){anteriorRelacionados[colecao]=[];for(const item of estado[colecao]||[])if(item[campo]===idSecundaria){item[campo]=idPrincipal;anteriorRelacionados[colecao].push(item.id);}}
 estado.empresas=estado.empresas.filter(e=>e!==s);
 estado.lixeira.push({id:novoId(),tipo:'empresas',item:copia,excluidoEm:new Date().toISOString(),motivo:'mesclada',mescladaEm:idPrincipal,relacionados:anteriorRelacionados});
 registrarAuditoria(estado,'mesclagem',idPrincipal,s.nome+' mesclada em '+p.nome);
 return p;
}
export function excluirEmpresa(estado,id){
 const e=estado.empresas.find(x=>x.id===id);if(!e)return null;const rel={};
 for(const [colecao,campo] of relacoes){rel[colecao]=(estado[colecao]||[]).filter(i=>i[campo]===id);estado[colecao]=(estado[colecao]||[]).filter(i=>i[campo]!==id);}
 estado.empresas=estado.empresas.filter(x=>x!==e);
 estado.lixeira.push({id:novoId(),tipo:'empresas',item:e,excluidoEm:new Date().toISOString(),motivo:'excluida',relacionados:rel});
 registrarAuditoria(estado,'exclusao',id,e.nome+' enviada para a lixeira');return e;
}
export function restaurarDaLixeira(estado,idLixeira){
 const entrada=estado.lixeira.find(x=>x.id===idLixeira);if(!entrada)return null;
 if(entrada.tipo==='empresas'){
  if(estado.empresas.some(e=>e.id===entrada.item.id))throw Error('Já existe uma empresa com este identificador.');
  estado.empresas.push(normalizarEmpresa(entrada.item));
  if(entrada.motivo==='excluida')for(const [colecao,itens] of Object.entries(entrada.relacionados||{}))for(const i of itens)if(!(estado[colecao]||[]).some(x=>x.id===i.id))estado[colecao].push(i);
 }else if(entrada.colecao)estado[entrada.colecao].push(entrada.item);
 estado.lixeira=estado.lixeira.filter(x=>x!==entrada);registrarAuditoria(estado,'restauracao',entrada.item.id,'Registro restaurado da lixeira');return entrada.item;
}
