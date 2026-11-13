/* Coletor de eventos das demonstrações (Cloudflare Worker + R2). Recebe só identificadores opacos e eventos mínimos. Não guarda IP, país, user-agent nem dados do CRM. */
const TIPOS=new Set(['pagina','secao','botao','servico','faq','ancora','whatsapp','telefone','tempo','consentimento','sessao']);
const DISP=new Set(['celular','tablet','computador']),ORG=new Set(['direto','whatsapp','instagram','busca','interno','outro']);
const ROBO=/bot|crawl|spider|headless|preview|facebookexternalhit|whatsapp\/|slurp|lighthouse|pagespeed|curl|wget|python|node-fetch|go-http|java\//i;
const LIM={corpo:8192,eventos:40,porMinutoIp:120,porMinutoDemo:600,idadeMaxMs:864e5,leituraObjetos:2000};
const enc=new TextEncoder();
async function hmacHex(segredo,texto){const k=await crypto.subtle.importKey('raw',enc.encode(segredo),{name:'HMAC',hash:'SHA-256'},false,['sign']);return [...new Uint8Array(await crypto.subtle.sign('HMAC',k,enc.encode(texto)))].map(b=>b.toString(16).padStart(2,'0')).join('');}
function iguais(a,b){a=String(a);b=String(b);if(a.length!==b.length)return false;let r=0;for(let i=0;i<a.length;i++)r|=a.charCodeAt(i)^b.charCodeAt(i);return r===0;}
const cors={'access-control-allow-origin':'*','access-control-allow-methods':'POST, OPTIONS','access-control-allow-headers':'content-type','access-control-max-age':'86400'};
const resp=(corpo,status=200,extra={})=>new Response(corpo==null?null:JSON.stringify(corpo),{status,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store','x-content-type-options':'nosniff',...extra}});
const limpo=s=>String(s??'').replace(/[\u0000-\u001f\u007f<>]/g,'').slice(0,40);
export function criarWorker({agora=()=>Date.now(),aleatorio=()=>Math.random().toString(36).slice(2,10)}={}){
 const contadores=new Map();
 function limitar(chave,max,t){const b=(contadores.get(chave)||[]).filter(x=>t-x<60000);b.push(t);contadores.set(chave,b);if(contadores.size>5000)for(const k of contadores.keys()){contadores.delete(k);break;}return b.length<=max;}
 async function autorizado(req,env){const a=req.headers.get('authorization')||'';return !!env.TOKEN_LEITURA&&iguais(a,'Bearer '+env.TOKEN_LEITURA);}
 async function coletar(req,env){
  const t=agora();if((req.headers.get('user-agent')||'').match(ROBO))return new Response(null,{status:204,headers:cors});
  const txt=await req.text();if(txt.length>LIM.corpo)return resp({erro:'grande'},413,cors);let c;try{c=JSON.parse(txt);}catch{return resp({erro:'json'},400,cors);}
  if(!c||typeof c.d!=='string'||!/^[a-z0-9]{12,32}$/.test(c.d)||typeof c.k!=='string')return resp({erro:'invalido'},400,cors);
  const esperado=(await hmacHex(env.SEGREDO,c.d)).slice(0,24);if(!iguais(c.k,esperado))return resp({erro:'chave'},403,cors);
  const ip=req.headers.get('cf-connecting-ip')||'x';if(!limitar('i:'+c.d+ip,LIM.porMinutoIp,t)||!limitar('d:'+c.d,LIM.porMinutoDemo,t))return resp({erro:'limite'},429,{...cors,'retry-after':'60'});
  const lista=Array.isArray(c.e)?c.e.slice(0,LIM.eventos):[],ok=[];
  for(const e of lista){if(!e||typeof e!=='object'||!TIPOS.has(e.t)||!/^[a-z0-9]{6,16}$/.test(String(e.i||'')))continue;const ts=Number(e.ts);if(!Number.isFinite(ts)||Math.abs(t-ts)>LIM.idadeMaxMs)continue;
   const o={i:e.i,t:e.t,ts};if(e.v!=null)o.v=limpo(e.v);if(e.t==='tempo'){const s=Number(e.v);if(!(s>=0&&s<=14400))continue;o.v=String(Math.round(s));}if(e.t==='sessao'&&!/^[a-z0-9]{6,16}$/.test(String(e.v||'')))continue;if((e.t==='pagina'||e.t==='sessao')&&e.recorrente===true)o.recorrente=true;ok.push(o);}
  if(!ok.length)return new Response(null,{status:204,headers:cors});
  const d=new Date(t),dia=d.toISOString().slice(0,10),hora=d.toISOString().slice(11,19).replace(/:/g,'');
  const obj={r:t,s:/^[a-z0-9]{6,16}$/.test(String(c.s||''))?c.s:null,disp:DISP.has(c.disp)?c.disp:null,org:ORG.has(c.org)?c.org:null,e:ok};
  await env.DADOS.put(`e/${c.d}/${dia}/${hora}-${aleatorio()}.json`,JSON.stringify(obj),{httpMetadata:{contentType:'application/json'}});
  return new Response(null,{status:204,headers:cors});
 }
 async function ler(req,env,url){
  if(!await autorizado(req,env))return resp({erro:'nao-autorizado'},401);const d=url.searchParams.get('d');if(!/^[a-z0-9]{12,32}$/.test(d||''))return resp({erro:'demo'},400);
  const desde=url.searchParams.get('desde')||'0000-00-00',eventos=[];let cursor,n=0,truncado=false;
  do{const l=await env.DADOS.list({prefix:`e/${d}/`,cursor,limit:500});for(const o of l.objects){if(o.key.split('/')[2]<desde.slice(0,10))continue;if(++n>LIM.leituraObjetos){truncado=true;break;}const x=await env.DADOS.get(o.key);if(!x)continue;let j;try{j=JSON.parse(await x.text());}catch{continue;}for(const e of j.e||[])eventos.push({...e,s:j.s,disp:j.disp,org:j.org,r:j.r});}
   cursor=l.truncated&&!truncado?l.cursor:undefined;}while(cursor);
  return resp({demo:d,eventos,truncado,geradoEm:agora()});
 }
 async function excluir(req,env,url){
  if(!await autorizado(req,env))return resp({erro:'nao-autorizado'},401);const d=url.pathname.split('/')[2];if(!/^[a-z0-9]{12,32}$/.test(d||''))return resp({erro:'demo'},400);
  let cursor,total=0;do{const l=await env.DADOS.list({prefix:`e/${d}/`,cursor,limit:500});if(l.objects.length){await env.DADOS.delete(l.objects.map(o=>o.key));total+=l.objects.length;}cursor=l.truncated?l.cursor:undefined;}while(cursor);
  return resp({removidos:total});
 }
 async function expirar(env){
  const dias=Number(env.RETENCAO_DIAS)||90,corte=new Date(agora()-dias*864e5).toISOString().slice(0,10);let cursor,total=0;
  do{const l=await env.DADOS.list({prefix:'e/',cursor,limit:500});const velhas=l.objects.filter(o=>o.key.split('/')[2]<corte).map(o=>o.key);if(velhas.length){await env.DADOS.delete(velhas);total+=velhas.length;}cursor=l.truncated?l.cursor:undefined;}while(cursor);
  return total;
 }
 return {
  async fetch(req,env){
   const url=new URL(req.url);
   if(req.method==='OPTIONS')return new Response(null,{status:204,headers:cors});
   try{
    if(url.pathname==='/e'&&req.method==='POST')return await coletar(req,env);
    if(url.pathname==='/r'&&req.method==='GET')return await ler(req,env,url);
    if(url.pathname.startsWith('/d/')&&req.method==='DELETE')return await excluir(req,env,url);
    if(url.pathname==='/saude')return resp({ok:true,retencaoDias:Number(env.RETENCAO_DIAS)||90});
    return resp({erro:'nao-encontrado'},404);
   }catch(x){return resp({erro:'interno'},500,cors);}
  },
  async scheduled(_ev,env){return expirar(env);},
  expirar
 };
}
export default criarWorker();
