/* Transporte do navegador para a ponte serverless. Nunca recebe tokens do GitHub; usa o cookie HttpOnly da sessão e o token CSRF da própria ponte. */
export function normalizarPonte(valor){
 let v=String(valor||'').trim().replace(/\/+$/,'');if(!v)return '/api/connect';
 if(!/^https?:\/\//i.test(v)&&!v.startsWith('/'))v='https://'+v;
 try{const u=new URL(v,location.origin);if(u.pathname==='/'||!u.pathname)u.pathname='/api/connect';return u.origin===location.origin?u.pathname:u.origin+u.pathname;}catch{return '/api/connect';}
}
export function criarTransporte(endereco){
 const base=normalizarPonte(endereco);let csrf='';
 const url=(acao,q={})=>`${base}?${new URLSearchParams({acao,...q})}`;
 async function chamar(acao,{q={},metodo='GET',corpo}={}){
  const r=await fetch(url(acao,q),{method:metodo,credentials:'same-origin',headers:{...(metodo!=='GET'?{'content-type':'application/json','x-orbita-csrf':csrf}:{})},body:corpo?JSON.stringify(corpo):undefined});
  if(r.status===429)throw Object.assign(Error('Limite de requisições atingido. Tente em 1 minuto.'),{codigo:'limite'});
  const j=await r.json().catch(()=>({}));if(!r.ok&&r.status!==200)throw Object.assign(Error(j.erro||('Falha '+r.status)),{codigo:r.status===401?'nao-autenticado':'http',http:r.status});return j;
 }
 return {
  chamar,
  base,
  loginUrl:()=>url('login'),
  // sem isso o botão mandava o usuário direto para um 404 da Vercel quando a ponte não estava publicada
  async sondar(){let r;try{r=await fetch(url('status'),{credentials:'same-origin'});}catch{throw Error('Sem resposta da ponte em '+base+'. Confira o endereço e a conexão.');}
   const tipo=r.headers.get('content-type')||'';if(r.status===404||!tipo.includes('json'))throw Error('Ponte não encontrada em '+base+' (HTTP '+r.status+'). Abra o Órbita pelo domínio da Vercel ou corrija o Endereço da ponte.');
   const j=await r.json().catch(()=>({}));if(!r.ok)throw Error(j.erro||('Ponte respondeu '+r.status));return j;},
  async status(){const j=await chamar('status');if(j.csrf)csrf=j.csrf;return j;},
  async listar(dir){return (await chamar('listar',{q:{dir}})).itens;},
  async ler(path){return (await chamar('ler',{q:{path}})).conteudo;},
  async commit({mensagem,arquivos}){return chamar('commit',{metodo:'POST',corpo:{mensagem,arquivos}});},
  async logout(){return chamar('logout',{metodo:'POST'});}
 };
}
