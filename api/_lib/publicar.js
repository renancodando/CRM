/* Ações de publicação da ponte (Cloudflare Pages). A autenticação, a origem e o CSRF já foram verificados por api/connect.js antes de chegar aqui. */
'use strict';
const {criarCliente,nomeProjeto,nomeValido,LIM}=require('./cloudflare.js');
const ERR=(m,s=400)=>Object.assign(Error(m),{status:s,publico:true});
const mascarar=id=>id?id.slice(0,4)+'…'+id.slice(-4):'';
function cliente(e,f){return criarCliente({contaId:String(e.CLOUDFLARE_ACCOUNT_ID||'').trim(),token:String(e.CLOUDFLARE_API_TOKEN||'').trim(),f});}
function projetoDe(e,v){const n=String(v||'');if(!nomeValido(n))throw ERR('Nome de projeto inválido.');const p=String(e.ORBITA_PAGES_PREFIX||'').trim();if(p&&!n.startsWith(p))throw ERR('O projeto não pertence ao prefixo permitido ('+p+').',403);return n;}
function hostPermitido(url,subdominio){let u;try{u=new URL(url);}catch{return null;}if(u.protocol!=='https:'||u.username||u.password||u.port)return null;if(!subdominio||!/^[a-z0-9-]+\.pages\.dev$/.test(subdominio))return null;return u.hostname===subdominio||u.hostname.endsWith('.'+subdominio)?u:null;}
async function verificarLink(url,subdominio,f){
 const u=hostPermitido(url,subdominio);if(!u)throw ERR('Endereço não permitido para verificação (somente o domínio .pages.dev do projeto).');
 const ctl=new AbortController(),t=setTimeout(()=>ctl.abort(),8000);
 try{const r=await f(u.href,{redirect:'manual',signal:ctl.signal,headers:{'user-agent':'Orbita-Verificador/1.0'}});clearTimeout(t);const texto=r.ok?(await r.text()).slice(0,200000):'';
  return {status:r.status,disponivel:r.ok,noindex:/name=["']robots["'][^>]*noindex/i.test(texto),titulo:(/<title>([^<]{0,200})/i.exec(texto)||[])[1]||'',tamanho:texto.length,verificadoEm:new Date().toISOString()};}
 catch(x){clearTimeout(t);return {status:0,disponivel:false,erro:x.name==='AbortError'?'Tempo esgotado.':'Sem resposta.',verificadoEm:new Date().toISOString()};}
}
const LIMITE_LOTE=4400000;
async function tratar(acao,{e,f,url,corpo,metodo}){
 const q=url.searchParams;
 if(acao==='publicar-status'){
  const configurada=!!(e.CLOUDFLARE_ACCOUNT_ID&&e.CLOUDFLARE_API_TOKEN);
  const base={configurada,conta:mascarar(String(e.CLOUDFLARE_ACCOUNT_ID||'')),prefixo:e.ORBITA_PAGES_PREFIX||'',limites:{arquivosPorDeploy:LIM.arquivos,tamanhoArquivoMiB:25,observacao:'Confira os limites atuais do seu plano na documentação da Cloudflare.'}};
  if(!configurada)return {status:200,corpo:{...base,orientacao:['Crie um token em Cloudflare → Meu perfil → Tokens de API com a permissão "Cloudflare Pages: Editar" restrita à sua conta.','Na Vercel, defina CLOUDFLARE_ACCOUNT_ID e CLOUDFLARE_API_TOKEN (Environment Variables, escopo Production, marcadas como sensíveis) e faça um novo deploy.']}};
  try{const c=cliente(e,f),v=await c.verificarToken();let projetos=null,erroProjetos='';try{projetos=(await c.listarProjetos()).length;}catch(x){erroProjetos=x.message;}return {status:200,corpo:{...base,tokenAtivo:v.ativo,tokenExpira:v.expira,projetos,acessoPages:erroProjetos?false:true,erroPages:erroProjetos}};}
  catch(x){return {status:200,corpo:{...base,tokenAtivo:false,erro:x.message,orientacao:['Gere um novo token e atualize CLOUDFLARE_API_TOKEN na Vercel; depois faça um novo deploy.']}};}
 }
 const c=cliente(e,f);
 if(acao==='publicar-iniciar'&&metodo==='POST'){const nome=projetoDe(e,nomeProjeto(corpo.nome));if(!nome)throw ERR('Informe um nome de projeto.');const p=await c.garantirProjeto(nome);return {status:200,corpo:{projeto:p.nome,subdominio:p.subdominio,url:'https://'+p.subdominio,criado:p.criado}};}
 if(acao==='publicar-lote'&&metodo==='POST'){const nome=projetoDe(e,corpo.projeto);return {status:200,corpo:await c.enviarLote(nome,corpo.arquivos)};}
 if(acao==='publicar-finalizar'&&metodo==='POST'){const nome=projetoDe(e,corpo.projeto);const d=await c.finalizar(nome,corpo.manifesto,{mensagem:corpo.mensagem||'Órbita',cabecalhos:typeof corpo.cabecalhos==='string'?corpo.cabecalhos.slice(0,2000):''});return {status:200,corpo:d};}
 if(acao==='publicar-estado'){const nome=projetoDe(e,q.get('projeto'));return {status:200,corpo:await c.statusDeploy(nome,String(q.get('deploy')||'').replace(/[^a-f0-9-]/gi,''))};}
 if(acao==='publicar-deploys'){const nome=projetoDe(e,q.get('projeto'));return {status:200,corpo:{deploys:await c.listarDeploys(nome)}};}
 if(acao==='publicar-projetos'){const p=String(e.ORBITA_PAGES_PREFIX||'');return {status:200,corpo:{projetos:(await c.listarProjetos()).filter(x=>!p||x.nome.startsWith(p))}};}
 if(acao==='publicar-verificar'){const nome=projetoDe(e,q.get('projeto'));const p=await c.obterProjeto(nome);if(!p)throw ERR('Projeto não encontrado.',404);return {status:200,corpo:await verificarLink(q.get('url'),p.subdominio,f)};}
 if(acao==='publicar-restaurar'&&metodo==='POST'){const nome=projetoDe(e,corpo.projeto);return {status:200,corpo:await c.rollback(nome,String(corpo.deploy||'').replace(/[^a-f0-9-]/gi,''))};}
 if(acao==='publicar-excluir'&&metodo==='POST'){const nome=projetoDe(e,corpo.projeto);
  if(corpo.deploy){if(corpo.confirmacao!=='EXCLUIR '+nome)throw ERR('Confirmação ausente.');await c.excluirDeploy(nome,String(corpo.deploy).replace(/[^a-f0-9-]/gi,''));return {status:200,corpo:{ok:true,removido:'deploy'}};}
  if(corpo.confirmacao!=='EXCLUIR PROJETO '+nome)throw ERR('Confirmação ausente.');await c.excluirProjeto(nome);return {status:200,corpo:{ok:true,removido:'projeto'}};}
 throw ERR('Ação de publicação desconhecida.',404);
}
module.exports={tratar,verificarLink,hostPermitido,LIMITE_LOTE,mascarar};
