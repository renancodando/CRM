/* Transporte do navegador para a ponte serverless. Nunca recebe tokens do GitHub; usa o cookie HttpOnly da sessão e o token CSRF da própria ponte. */
export function criarTransporte(base='/api/connect'){
 let csrf='';
 const url=(acao,q={})=>`${base}?${new URLSearchParams({acao,...q})}`;
 async function chamar(acao,{q={},metodo='GET',corpo}={}){
  const r=await fetch(url(acao,q),{method:metodo,credentials:'same-origin',headers:{...(metodo!=='GET'?{'content-type':'application/json','x-orbita-csrf':csrf}:{})},body:corpo?JSON.stringify(corpo):undefined});
  if(r.status===429)throw Object.assign(Error('Limite de requisições atingido. Tente em 1 minuto.'),{codigo:'limite'});
  const j=await r.json().catch(()=>({}));if(!r.ok&&r.status!==200)throw Object.assign(Error(j.erro||('Falha '+r.status)),{codigo:r.status===401?'nao-autenticado':'http'});return j;
 }
 return {
  chamar,
  loginUrl:()=>url('login'),
  async status(){const j=await chamar('status');if(j.csrf)csrf=j.csrf;return j;},
  async listar(dir){return (await chamar('listar',{q:{dir}})).itens;},
  async ler(path){return (await chamar('ler',{q:{path}})).conteudo;},
  async commit({mensagem,arquivos}){return chamar('commit',{metodo:'POST',corpo:{mensagem,arquivos}});},
  async logout(){return chamar('logout',{metodo:'POST'});}
 };
}
