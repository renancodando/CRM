const segredos=[/ghp_[A-Za-z0-9]{20,}/,/github_pat_[A-Za-z0-9_]{20,}/,/sk-[A-Za-z0-9]{20,}/,/AKIA[0-9A-Z]{16}/,/-----BEGIN [A-Z ]*PRIVATE KEY-----/,/(?:senha|password|token|secret)\s*[:=]\s*["'][^"']{6,}/i];
const textual=c=>typeof c==='string';
export function validarExportacao(arquivos,{url=''}={}){
 const itens=[],ok=(t)=>itens.push({nivel:'ok',texto:t}),erro=t=>itens.push({nivel:'erro',texto:t}),aviso=t=>itens.push({nivel:'aviso',texto:t});
 const nomes=new Set(Object.keys(arquivos)),html=arquivos['index.html']||'';
 if(!html)erro('index.html ausente.');else ok('index.html presente.');
 const faltando=new Set(),cruzadas=new Set(),externos=new Set();
 const lerRefs=(texto,base)=>{for(const m of texto.matchAll(/\b(?:src|href)=["']([^"'#][^"']*)["']/g)){const r=m[1];if(/^(https?:|mailto:|tel:|data:|javascript:)/i.test(r)){if(/\b(src|rel="stylesheet")/.test(m[0])||/<(script|link|img|iframe)\b[^>]*\b(src|href)=["']https?:/i.test(texto.slice(Math.max(0,m.index-60),m.index+m[0].length))){if(/^https?:/i.test(r)&&/<(script|img|iframe)\b|rel="stylesheet"/i.test(texto.slice(Math.max(0,m.index-80),m.index+m[0].length)))externos.add(r);}continue;}
   if(r.includes('../')||/^\/(estudio|bibliotecas|ativos)/.test(r)||/^(estudio|bibliotecas|ativos)\//.test(r))cruzadas.add(r);const alvo=r.split('?')[0];if(!nomes.has(alvo)&&!nomes.has(alvo.replace(/^\.\//,'')))faltando.add(r);}};
 lerRefs(html);
 for(const [n,c] of Object.entries(arquivos)){if(!textual(c))continue;if(/\.css$/.test(n)){for(const m of c.matchAll(/url\(\s*["']?(https?:[^)"']+)/g))externos.add(m[1]);for(const m of c.matchAll(/@import\s+(?:url\()?["']?(https?:[^"')]+)/g))externos.add(m[1]);}
  if(/\.js$/.test(n)){for(const m of c.matchAll(/\b(?:importScripts|fetch|XMLHttpRequest)\b[^;]{0,80}(https?:\/\/[^"'`\s)]+)/g))externos.add(m[1]);}
  for(const re of segredos)if(re.test(c))erro('Possível credencial ou segredo em '+n+'.');}
 faltando.size?erro('Recursos internos ausentes: '+[...faltando].join(', ')):ok('Todos os recursos internos existem no pacote.');
 cruzadas.size?erro('Dependência fora do projeto: '+[...cruzadas].join(', ')):ok('Sem dependências de outros diretórios ou do Órbita.');
 externos.size?erro('Recursos externos carregados: '+[...externos].slice(0,5).join(', ')):ok('Nenhum recurso externo é carregado.');
 const ids=new Set([...html.matchAll(/\sid="([^"]+)"/g)].map(m=>m[1])),quebrados=[...new Set([...html.matchAll(/href="#([^"]+)"/g)].map(m=>m[1]))].filter(a=>a&&!ids.has(a));
 quebrados.length?erro('Links internos quebrados: #'+quebrados.join(', #')):ok('Links internos válidos.');
 const usaThree=nomes.has('js/motor.js');if(usaThree&&!nomes.has('LICENCA-THREE.txt'))erro('Licença do Three.js ausente.');else if(usaThree)ok('Licença do Three.js incluída.');
 if(nomes.has('js/carro.js')){nomes.has('LICENCA-MODELO-3D.md')?ok('Atribuição do modelo 3D (CC BY 4.0) incluída.'):erro('Atribuição do modelo 3D ausente.');if(!/vicent091036/.test(html))aviso('A atribuição do modelo 3D deve permanecer visível no rodapé.');}
 for(const n of ['robots.txt','sitemap.xml','vercel.json','netlify.toml','LEIA-ME.md','assets/icones/marca.svg'])nomes.has(n)?null:erro('Arquivo esperado ausente: '+n);
 const noindex=/name="robots" content="noindex/.test(html),canon=/rel="canonical"/.test(html);
 if(url)canon&&!noindex?ok('Canonical definido e indexação liberada para a URL informada.'):erro('URL informada, mas canonical/indexação não aplicados.');else noindex?ok('Demonstração protegida com noindex até a URL definitiva ser informada.'):erro('Sem URL definitiva, mas a página não está com noindex.');
 try{JSON.parse(arquivos['vercel.json']);ok('vercel.json válido.');}catch{erro('vercel.json inválido.');}
 const tamanho=Object.values(arquivos).reduce((s,c)=>s+(textual(c)?new Blob([c]).size:c.length),0);ok('Tamanho total: '+(tamanho/1e6).toFixed(2)+' MB em '+nomes.size+' arquivos.');
 return {itens,erros:itens.filter(i=>i.nivel==='erro').length,avisos:itens.filter(i=>i.nivel==='aviso').length,tamanho};
}
export async function manifesto(arquivos){
 const enc=new TextEncoder(),linhas={};for(const [n,c] of Object.entries(arquivos)){const dados=typeof c==='string'?enc.encode(c):c;const h=await crypto.subtle.digest('SHA-256',dados);linhas[n]=[...new Uint8Array(h)].map(x=>x.toString(16).padStart(2,'0')).join('');}
 return JSON.stringify({gerador:'Órbita · Estúdio de Sites',geradoEm:new Date().toISOString(),sha256:linhas},null,1);
}
