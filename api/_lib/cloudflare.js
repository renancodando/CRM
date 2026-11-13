/* Cliente do Cloudflare Pages (Direct Upload). Roda só no servidor; as credenciais vêm de variáveis de ambiente e nunca saem daqui. fetch é injetável para testes com mocks. */
'use strict';
const zlib=require('node:zlib');
const {blake3Hex}=require('./blake3.js');
const API='https://api.cloudflare.com/client/v4';
const LIM={arquivos:20000,tamanhoArquivo:25*1024*1024,loteBytes:3.2*1024*1024,loteArquivos:100,tentativas:3,timeoutMs:12000};
const TIPOS={html:'text/html; charset=utf-8',css:'text/css; charset=utf-8',js:'text/javascript; charset=utf-8',mjs:'text/javascript; charset=utf-8',json:'application/json',svg:'image/svg+xml',png:'image/png',jpg:'image/jpeg',jpeg:'image/jpeg',webp:'image/webp',gif:'image/gif',ico:'image/x-icon',woff2:'font/woff2',woff:'font/woff',txt:'text/plain; charset=utf-8',xml:'application/xml',md:'text/markdown; charset=utf-8',glb:'model/gltf-binary',webmanifest:'application/manifest+json'};
const PROIBIDOS=/(^|\/)(\.env[^/]*|\.git(\/|$)|\.ds_store|id_rsa[^/]*|[^/]*\.pem|[^/]*\.key|node_modules\/|\.npmrc|\.netrc|credentials[^/]*)/i;
const orient={
 10000:'Token sem permissão ou inválido. Gere um token com a permissão "Cloudflare Pages: Editar" para esta conta.',
 9109:'Token sem acesso a este recurso. Confira a permissão "Cloudflare Pages: Editar" e a conta selecionada.',
 8000007:'Projeto não encontrado nesta conta.',8000000:'Erro interno da Cloudflare. Tente novamente em instantes.',
 8000018:'Limite de projetos da conta atingido. Exclua demonstrações antigas ou use um plano maior.',8000024:'Nome de projeto já usado.',
 8000011:'Nome de projeto já usado por outra conta (os nomes de Pages são globais). Escolha outro nome.'
};
function erroCf(status,corpo,contexto){
 const e=corpo?.errors?.[0],cod=e?.code,msg=orient[cod]||(status===401?'Credencial recusada pela Cloudflare (401). Verifique CLOUDFLARE_API_TOKEN.':status===403?'Permissão insuficiente na Cloudflare (403). Verifique as permissões do token.':status===429?'Limite de requisições da Cloudflare atingido. Aguarde e tente novamente.':status>=500?'A Cloudflare está indisponível no momento. Tente novamente.':(e?.message||'Falha na Cloudflare ('+status+').'));
 return Object.assign(Error(msg),{status:status===401||status===403?502:status===429?429:status===404?404:502,cf:{status,codigo:cod,mensagem:e?.message},contexto,publico:true,recuperavel:status===429||status>=500});
}
function nomeProjeto(texto){
 const s=String(texto||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'').slice(0,58).replace(/-+$/,'');
 return s;
}
const nomeValido=n=>typeof n==='string'&&n.length>=1&&n.length<=58&&/^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/.test(n);
function extensao(c){const m=/\.([A-Za-z0-9]+)$/.exec(c);return m?m[1].toLowerCase():'';}
function validarCaminho(c){
 if(typeof c!=='string'||!c||c.length>250)return 'caminho inválido';if(c.startsWith('/')||c.includes('\\')||c.includes('//')||c.split('/').some(p=>p==='..'||p==='.'||p===''))return 'caminho inválido: '+c.slice(0,60);
 if(PROIBIDOS.test(c))return 'arquivo não permitido na publicação: '+c.slice(0,60);if(!/^[\w.\-\/@+ ]+$/.test(c))return 'caracteres não permitidos no caminho: '+c.slice(0,60);return '';
}
/* hash de asset: BLAKE3(base64(conteúdo)+extensão), 32 hex. Algoritmo conforme o comportamento do wrangler; confirme na documentação atual antes de depender de implantações reais. */
function hashAsset(caminho,bytes){return blake3Hex(Buffer.from(bytes).toString('base64')+extensao(caminho)).slice(0,32);}
function criarCliente({contaId,token,f=globalThis.fetch,espera=ms=>new Promise(r=>setTimeout(r,ms))}){
 if(!contaId||!token)throw Object.assign(Error('Cloudflare não configurada no servidor (CLOUDFLARE_ACCOUNT_ID e CLOUDFLARE_API_TOKEN).'),{status:503,publico:true,naoConfigurada:true});
 if(!/^[a-f0-9]{32}$/i.test(contaId))throw Object.assign(Error('CLOUDFLARE_ACCOUNT_ID inválido (esperado 32 caracteres hexadecimais).'),{status:503,publico:true,naoConfigurada:true});
 async function req(url,{metodo='GET',corpo,formulario,auth=token,tentativas=LIM.tentativas,contexto=''}={}){
  let ultimo;
  for(let t=1;t<=tentativas;t++){
   const ctl=new AbortController(),timer=setTimeout(()=>ctl.abort(),LIM.timeoutMs);
   try{
    const headers={authorization:'Bearer '+auth};let body;if(formulario)body=formulario;else if(corpo!==undefined){headers['content-type']='application/json';body=JSON.stringify(corpo);}
    const r=await f(url,{method:metodo,headers,body,signal:ctl.signal});clearTimeout(timer);
    let j=null;try{j=await r.json();}catch{}
    if(r.ok&&(j==null||j.success!==false))return j;
    ultimo=erroCf(r.status,j,contexto);if(!ultimo.recuperavel)throw ultimo;
   }catch(e){clearTimeout(timer);if(e.cf&&!e.recuperavel)throw e;ultimo=e.cf?e:Object.assign(Error(e.name==='AbortError'?'Tempo esgotado ao falar com a Cloudflare.':'Falha de rede ao falar com a Cloudflare.'),{status:504,publico:true,recuperavel:true,timeout:e.name==='AbortError'});}
   if(t<tentativas)await espera(300*2**(t-1));
  }
  throw ultimo;
 }
 const base=`${API}/accounts/${contaId}/pages/projects`;
 return {
  hashAsset,
  async verificarToken(){const j=await req(`${API}/user/tokens/verify`,{contexto:'verificar'});return {ativo:j?.result?.status==='active',expira:j?.result?.expires_on||null};},
  async listarProjetos(){const j=await req(base+'?per_page=100',{contexto:'listar'});return (j.result||[]).map(p=>({nome:p.name,subdominio:p.subdomain,criado:p.created_on,ramoProducao:p.production_branch}));},
  async obterProjeto(nome){try{const j=await req(`${base}/${nome}`,{contexto:'projeto'});const p=j.result;return {nome:p.name,subdominio:p.subdomain,ramoProducao:p.production_branch,dominios:p.domains||[],ultimo:p.latest_deployment?.id||null};}catch(e){if(e.status===404)return null;throw e;}},
  async criarProjeto(nome){if(!nomeValido(nome))throw Object.assign(Error('Nome de projeto inválido.'),{status:400,publico:true});const j=await req(base,{metodo:'POST',corpo:{name:nome,production_branch:'main'},contexto:'criar'});const p=j.result;return {nome:p.name,subdominio:p.subdomain,ramoProducao:p.production_branch||'main'};},
  async garantirProjeto(nome){const e=await this.obterProjeto(nome);if(e)return {...e,criado:false};return {...(await this.criarProjeto(nome)),criado:true};},
  async tokenUpload(nome){const j=await req(`${base}/${nome}/upload-token`,{contexto:'token-upload'});const jwt=j?.result?.jwt;if(!jwt)throw Object.assign(Error('A Cloudflare não devolveu o token de envio.'),{status:502,publico:true});return jwt;},
  async enviarLote(nome,arquivos){
   if(!Array.isArray(arquivos)||!arquivos.length)throw Object.assign(Error('Lote vazio.'),{status:400,publico:true});
   if(arquivos.length>LIM.loteArquivos)throw Object.assign(Error('Lote com arquivos demais.'),{status:400,publico:true});
   const itens=[];let total=0;
   for(const a of arquivos){const v=validarCaminho(a.caminho);if(v)throw Object.assign(Error(v),{status:400,publico:true});if(typeof a.base64!=='string'||!/^[A-Za-z0-9+/]*={0,2}$/.test(a.base64))throw Object.assign(Error('Conteúdo inválido: '+a.caminho),{status:400,publico:true});
    let bytes=Buffer.from(a.base64,'base64');if(a.gz===true){try{bytes=zlib.gunzipSync(bytes,{maxOutputLength:LIM.tamanhoArquivo+1});}catch{throw Object.assign(Error('Conteúdo comprimido inválido ou grande demais: '+a.caminho),{status:400,publico:true});}}if(bytes.length>LIM.tamanhoArquivo)throw Object.assign(Error('Arquivo acima de 25 MiB: '+a.caminho),{status:413,publico:true});total+=bytes.length;itens.push({caminho:a.caminho,bytes,hash:hashAsset(a.caminho,bytes),tipo:TIPOS[extensao(a.caminho)]||'application/octet-stream'});}
   if(total>LIM.loteBytes*8)throw Object.assign(Error('Lote grande demais; envie em partes menores.'),{status:413,publico:true});
   const jwt=await this.tokenUpload(nome),hashes=[...new Set(itens.map(i=>i.hash))];
   const faltando=(await req(`${API}/pages/assets/check-missing`,{metodo:'POST',auth:jwt,corpo:{hashes},contexto:'check-missing'})).result||[];
   const falta=new Set(faltando),paraEnviar=[],vistos=new Set();for(const i of itens)if(falta.has(i.hash)&&!vistos.has(i.hash)){vistos.add(i.hash);paraEnviar.push({key:i.hash,value:i.bytes.toString('base64'),metadata:{contentType:i.tipo},base64:true});}
   if(paraEnviar.length)await req(`${API}/pages/assets/upload`,{metodo:'POST',auth:jwt,corpo:paraEnviar,contexto:'upload'});
   return {hashes:Object.fromEntries(itens.map(i=>[i.caminho,i.hash])),enviados:paraEnviar.length,jaExistiam:hashes.length-paraEnviar.length};
  },
  async finalizar(nome,manifesto,{ramo='main',mensagem='Órbita',cabecalhos=''}={}){
   const chaves=Object.keys(manifesto||{});if(!chaves.length)throw Object.assign(Error('Manifesto vazio.'),{status:400,publico:true});if(chaves.length>LIM.arquivos)throw Object.assign(Error('Arquivos demais (limite de '+LIM.arquivos+').'),{status:413,publico:true});
   for(const k of chaves){const v=validarCaminho(k.replace(/^\//,''));if(v||!k.startsWith('/'))throw Object.assign(Error('Manifesto inválido: '+k.slice(0,60)),{status:400,publico:true});if(!/^[a-f0-9]{32}$/.test(manifesto[k]))throw Object.assign(Error('Hash inválido no manifesto.'),{status:400,publico:true});}
   const jwt=await this.tokenUpload(nome);await req(`${API}/pages/assets/upsert-hashes`,{metodo:'POST',auth:jwt,corpo:{hashes:[...new Set(Object.values(manifesto))]},contexto:'upsert'});
   const fd=new FormData();fd.append('manifest',JSON.stringify(manifesto));fd.append('branch',ramo);fd.append('commit_message',String(mensagem).slice(0,100));if(cabecalhos)fd.append('_headers',new Blob([cabecalhos],{type:'text/plain'}),'_headers');
   const j=await req(`${base}/${nome}/deployments`,{metodo:'POST',formulario:fd,tentativas:2,contexto:'deploy'});const d=j.result;
   return {id:d.id,url:d.url,ambiente:d.environment,estagio:d.latest_stage?.name,estado:d.latest_stage?.status};
  },
  async statusDeploy(nome,id){const j=await req(`${base}/${nome}/deployments/${id}`,{contexto:'status'});const d=j.result,e=d.latest_stage||{};return {id:d.id,url:d.url,aliases:d.aliases||[],ambiente:d.environment,estagio:e.name,estado:e.status,concluido:e.name==='deploy'&&e.status==='success',falhou:e.status==='failure',estagios:(d.stages||[]).map(s=>({nome:s.name,estado:s.status,fim:s.ended_on||null}))};},
  async listarDeploys(nome){const j=await req(`${base}/${nome}/deployments?per_page=25`,{contexto:'deploys'});return (j.result||[]).map(d=>({id:d.id,url:d.url,ambiente:d.environment,criado:d.created_on,estado:d.latest_stage?.status,estagio:d.latest_stage?.name}));},
  async rollback(nome,id){const j=await req(`${base}/${nome}/deployments/${id}/rollback`,{metodo:'POST',corpo:{},tentativas:1,contexto:'rollback'});return {id:j.result.id,url:j.result.url};},
  async excluirDeploy(nome,id){await req(`${base}/${nome}/deployments/${id}`,{metodo:'DELETE',tentativas:1,contexto:'excluir-deploy'});return true;},
  async excluirProjeto(nome){await req(`${base}/${nome}`,{metodo:'DELETE',tentativas:1,contexto:'excluir-projeto'});return true;}
 };
}
module.exports={criarCliente,nomeProjeto,nomeValido,validarCaminho,hashAsset,extensao,LIM,TIPOS};
