/* Prepara o pacote do Estúdio para a hospedagem: só arquivos do site, aviso discreto de demonstração, noindex, cabeçalhos e (opcional) acompanhamento. */
import {gerarSnippet} from '../rastreio/snippet.js';
const EXCLUIDOS=/^(vercel\.json|netlify\.toml|LEIA-ME\.md|MANIFESTO-INTEGRIDADE\.json)$/;
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const cabecalhosDemonstracao=()=>'/*\n  X-Robots-Tag: noindex, nofollow\n  X-Content-Type-Options: nosniff\n  Referrer-Policy: strict-origin-when-cross-origin\n  X-Frame-Options: SAMEORIGIN\n';
export const nomeDoProjeto=(empresa,existentes=[])=>{
 const base=String(empresa?.nome||'demo').normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'');
 const cidade=String(empresa?.cidade||'').split(/[-,]/)[0].normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'');
 let nome=[base,cidade].filter(Boolean).join('-').replace(/-+/g,'-').slice(0,50).replace(/-+$/,'')||'demo';
 if(!existentes.includes(nome))return nome;let i=2;while(existentes.includes(nome.slice(0,46)+'-'+i))i++;return nome.slice(0,46)+'-'+i;
};
export function prepararParaPublicar(arquivos,{empresa=null,autor='o desenvolvedor',rastreio=null,liberada=false}={}){
 const saida={};
 for(const [n,c] of Object.entries(arquivos)){if(EXCLUIDOS.test(n))continue;saida[n]=c;}
 let html=String(saida['index.html']||'');
 if(!liberada){
  if(!/name="robots" content="noindex/i.test(html))html=html.replace('</head>','<meta name="robots" content="noindex, nofollow"></head>');
  saida['robots.txt']='User-agent: *\nDisallow: /\n';saida['sitemap.xml']='<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>';
 }
 if(!/id="orbita-demo-aviso"/.test(html)&&!liberada){
  const aviso=`<div id="orbita-demo-aviso" style="position:fixed;left:8px;bottom:8px;z-index:2147482999;max-width:calc(100vw - 96px);background:#000a;color:#fff;font:11px/1.35 system-ui,sans-serif;padding:5px 9px;border-radius:999px;pointer-events:none">Demonstração criada por ${esc(autor)}${empresa?.nome?' para '+esc(empresa.nome):''} · não é o site oficial da empresa</div>`;
  html=html.includes('</body>')?html.replace('</body>',aviso+'</body>'):html+aviso;
 }
 if(rastreio?.url&&rastreio?.demo&&rastreio?.chave){
  saida['js/orbita-rastreio.js']=gerarSnippet({url:rastreio.url,demo:rastreio.demo,chave:rastreio.chave,modo:rastreio.modo||'agregado'});
  if(!/orbita-rastreio\.js/.test(html))html=html.replace('</head>','<script defer src="js/orbita-rastreio.js"></script></head>');
 }
 saida['index.html']=html;
 const lista=Object.entries(saida).map(([caminho,c])=>({caminho,tamanho:typeof c==='string'?new TextEncoder().encode(c).length:c.length}));
 return {arquivos:saida,cabecalhos:cabecalhosDemonstracao(),lista,tamanho:lista.reduce((s,x)=>s+x.tamanho,0)};
}
