/* Composição modular opcional. Sem a chave `ed` na configuração, nada aqui altera os modelos originais. */
export const secoes=[
 {id:'hero',nome:'Apresentação (topo)',obrigatoria:true,posicao:'inicio',ancora:'inicio'},
 {id:'servicos',nome:'Serviços',ancora:'servicos'},
 {id:'pacotes',nome:'Pacotes',nichos:['automotivo']},
 {id:'extras',nome:'Destaques do modelo'},
 {id:'processo',nome:'Como funciona',ancora:'processo'},
 {id:'sobre',nome:'Sobre',ancora:'sobre'},
 {id:'avaliacoes',nome:'Avaliações autorizadas'},
 {id:'faixa',nome:'Faixa de chamada'},
 {id:'faq',nome:'Dúvidas frequentes',ancora:'duvidas'},
 {id:'contato',nome:'Contato e atendimento',obrigatoria:true,posicao:'fim',ancora:'contato'}
];
export const ordemPadrao=secoes.map(s=>s.id);
export const variantes={
 cabecalho:[['padrao','Original do modelo'],['centrado','Centralizado'],['compacto','Compacto']],
 hero:[['padrao','Original do modelo'],['centralizado','Centralizado']],
 servicos:[['padrao','Original do modelo'],['lista','Em lista'],['destaque','Primeiro em destaque']],
 faq:[['padrao','Original do modelo'],['duas-colunas','Duas colunas']],
 rodape:[['padrao','Original do modelo'],['simples','Simples']]
};
export const espacos=[['padrao','Original'],['compacto','Compacto'],['amplo','Amplo']];
export const larguras=[['padrao','Original'],['estreita','Estreita'],['larga','Larga']];
export const predefinicoes={
 tradicional:{nome:'Tradicional',descricao:'Leitura direta, sem cena 3D e com animações mínimas.',ed:{efeitos3d:{ativo:false},animacoes:{reduzir:true,cursor:false}}},
 premium:{nome:'Premium',descricao:'Mais respiro, títulos maiores e sombras suaves.',ed:{espaco:{secao:'amplo'},tipografia:{titulos:108},visual:{brilho:102,contraste:104,saturacao:104}}},
 imersiva:{nome:'Imersiva',descricao:'Cena 3D e movimentos em destaque, com mais espaço.',ed:{espaco:{secao:'amplo'},efeitos3d:{ativo:true},animacoes:{reduzir:false,cursor:true}}}
};
export const contratos={
 hero:{requer:['nome'],oferece:'#inicio'},servicos:{requer:['servicos'],oferece:'#servicos'},faq:{requer:['perguntas'],oferece:'#duvidas'},avaliacoes:{requer:['avaliacoes autorizadas']},pacotes:{nichos:['automotivo']},processo:{oferece:'#processo'},sobre:{oferece:'#sobre'},contato:{requer:['whatsapp'],oferece:'#contato'}
};
const incompativeis=[]; // preenchido por verificação visual: {modelo,chave,valor,motivo}
export const edPadrao=()=>({modo:'original',ordem:[...ordemPadrao],ocultas:[],variantes:{},tipografia:{},espaco:{},largura:'padrao',visual:{},animacoes:{},efeitos3d:{}});
const num=(v,min,max)=>{const n=Number(v);return Number.isFinite(n)?Math.min(max,Math.max(min,Math.round(n))):undefined;};
export function sanitizarEd(ed){
 if(!ed||typeof ed!=='object')return null;const s={};
 if(ed.modo==='modular')s.modo='modular';
 if(Array.isArray(ed.ordem)){const o=[...new Set(ed.ordem.filter(x=>ordemPadrao.includes(x)))];for(const id of ordemPadrao)if(!o.includes(id))o.push(id);const ordenada=['hero',...o.filter(x=>x!=='hero'&&x!=='contato'),'contato'];if(JSON.stringify(ordenada)!==JSON.stringify(ordemPadrao))s.ordem=ordenada;}
 const ocultas=Array.isArray(ed.ocultas)?[...new Set(ed.ocultas.filter(x=>ordemPadrao.includes(x)&&!secoes.find(y=>y.id===x).obrigatoria))]:[];if(ocultas.length)s.ocultas=ocultas;
 const v={};for(const [k,lista] of Object.entries(variantes)){const x=ed.variantes?.[k];if(x&&x!=='padrao'&&lista.some(l=>l[0]===x))v[k]=x;}if(Object.keys(v).length)s.variantes=v;
 const tip={};const a=num(ed.tipografia?.titulos,85,130),b=num(ed.tipografia?.texto,90,120);if(a&&a!==100)tip.titulos=a;if(b&&b!==100)tip.texto=b;if(['500','600','700','800'].includes(String(ed.tipografia?.peso)))tip.peso=String(ed.tipografia.peso);if(Object.keys(tip).length)s.tipografia=tip;
 const esp={};if(['compacto','amplo'].includes(ed.espaco?.secao))esp.secao=ed.espaco.secao;if(['esquerda','centro'].includes(ed.espaco?.alinhamento))esp.alinhamento=ed.espaco.alinhamento;const r=num(ed.espaco?.raio,0,32);if(r!==undefined&&ed.espaco?.raio!==''&&ed.espaco?.raio!==undefined)esp.raio=r;if(Object.keys(esp).length)s.espaco=esp;
 if(['estreita','larga'].includes(ed.largura))s.largura=ed.largura;
 const vis={};for(const k of ['brilho','contraste','saturacao']){const n=num(ed.visual?.[k],70,130);if(n&&n!==100)vis[k]=n;}if(Object.keys(vis).length)s.visual=vis;
 const an={};if(ed.animacoes?.reduzir===true)an.reduzir=true;if(ed.animacoes?.cursor===false)an.cursor=false;if(Object.keys(an).length)s.animacoes=an;
 if(ed.efeitos3d?.ativo===false)s.efeitos3d={ativo:false};
 return Object.keys(s).length?s:null;
}
export const ehPadrao=ed=>!sanitizarEd(ed);
export function validarComposicao(ed,modelo,c={}){
 const erros=[],avisos=[],s=sanitizarEd(ed)||{};
 for(const id of s.ocultas||[]){const sec=secoes.find(x=>x.id===id);if(sec.nichos&&!sec.nichos.includes(modelo.nicho))avisos.push(`"${sec.nome}" não existe neste modelo.`);}
 if(s.modo==='modular'&&s.ordem){if(s.ordem[0]!=='hero')erros.push('A apresentação precisa ser a primeira seção.');if(s.ordem.at(-1)!=='contato')erros.push('O contato precisa ser a última seção.');}
 if(!(c.servicos?.length)&&!(s.ocultas||[]).includes('servicos'))avisos.push('Sem serviços informados, a seção de serviços ficará vazia.');
 for(const [k,v] of Object.entries(s.variantes||{}))for(const i of incompativeis)if(i.modelo===modelo.id&&i.chave===k&&i.valor===v)erros.push(i.motivo);
 if(s.efeitos3d?.ativo===false&&modelo.id==='blue'||s.efeitos3d?.ativo===false&&modelo.id==='brisa')avisos.push('Sem efeitos 3D, a água procedural deste modelo também é desativada.');
 return {erros,avisos};
}
/* --- manipulação de blocos HTML (sections e dialog balanceados) --- */
function fimBalanceado(html,inicio,tag){const abre=new RegExp('<'+tag+'\\b','g'),fecha=new RegExp('</'+tag+'>','g');let prof=0,pos=inicio;for(;;){abre.lastIndex=pos;fecha.lastIndex=pos;const a=abre.exec(html),f=fecha.exec(html);if(!f)return -1;if(a&&a.index<f.index){prof++;pos=a.index+1+tag.length;}else{prof--;pos=f.index+tag.length+3;if(prof===0)return pos;}}}
export function dividirBlocos(html){
 const blocos=[],re=/<(section|dialog)\b[^>]*>/g;let m;
 while((m=re.exec(html))){const fim=fimBalanceado(html,m.index,m[1]);if(fim<0)break;blocos.push({inicio:m.index,fim,html:html.slice(m.index,fim),tag:m[1]});re.lastIndex=fim;}
 return blocos;
}
export function classificarBloco(b){
 const classe=(b.html.match(/^<[a-z]+[^>]*class="([^"]*)"/)||[])[1]||'',id=(b.html.match(/^<[a-z]+[^>]*\sid="([^"]*)"/)||[])[1]||'';
 if(b.tag==='dialog'||/faixa-atendimento/.test(classe)||id==='contato')return 'contato';
 if(/\bhero\b/.test(classe)||id==='inicio')return 'hero';
 if(id==='servicos')return 'servicos';if(id==='processo')return 'processo';if(id==='sobre')return 'sobre';if(id==='duvidas')return 'faq';
 if(/pacotes-site/.test(classe))return 'pacotes';if(/avaliacoes-site/.test(classe))return 'avaliacoes';if(/faixa-site/.test(classe))return 'faixa';
 return 'extras';
}
function removerAncoras(html,ids){let r=html;for(const id of ids)r=r.replace(new RegExp('<a\\b[^>]*href="#'+id+'"[^>]*>[\\s\\S]*?</a>','g'),'');return r;}
export function aplicarComposicao(mainHtml,ed,modelo){
 const s=sanitizarEd(ed);if(!s)return {html:mainHtml,ancorasRemovidas:[]};
 const blocos=dividirBlocos(mainHtml).map(b=>({...b,chave:classificarBloco(b)}));
 const ocultas=new Set(s.ocultas||[]);let html;
 if(s.modo==='modular'){
  const ordem=s.ordem||ordemPadrao,agrupado=Object.fromEntries(ordemPadrao.map(k=>[k,blocos.filter(b=>b.chave===k).map(b=>b.html).join('')]));
  html=ordem.filter(k=>!ocultas.has(k)).map(k=>agrupado[k]).join('');
 }else{
  html=mainHtml;for(const b of blocos.filter(b=>ocultas.has(b.chave)).sort((x,y)=>y.inicio-x.inicio))html=html.slice(0,b.inicio)+html.slice(b.fim);
 }
 const removidas=[...ocultas].map(k=>secoes.find(x=>x.id===k)?.ancora).filter(Boolean);
 return {html,ancorasRemovidas:removidas};
}
export function limparAncoras(html,ids){return removerAncoras(html,ids);}
export function cssEdicao(ed,variacoesCss=''){
 const s=sanitizarEd(ed);if(!s)return '';const r=[];
 if(s.tipografia?.titulos)r.push(`main h1,main h2,main h3{zoom:${s.tipografia.titulos/100}}`);
 if(s.tipografia?.texto)r.push(`main p,main li,main summary,.rodape-site{zoom:${s.tipografia.texto/100}}`);
 if(s.tipografia?.peso)r.push(`main h1,main h2,main h3{font-weight:${s.tipografia.peso}}`);
 if(s.espaco?.secao)r.push(`main .secao{padding-block:${s.espaco.secao==='amplo'?'clamp(88px,11vw,150px)':'clamp(36px,5vw,64px)'}}`);
 if(s.espaco?.alinhamento==='centro')r.push('.hero-texto,.titulo-bloco>div{text-align:center}.acoes-hero{justify-content:center}');
 if(s.espaco?.raio!==undefined)r.push(`.servico,.pacote,.grade-pacotes article,details,.botao-site,.beneficios>div,.grade-avaliacoes figure{border-radius:${s.espaco.raio}px}`);
 if(s.largura)r.push(`.limite{max-width:${s.largura==='estreita'?'1020px':'1440px'}}`);
 if(s.visual){const f=[];if(s.visual.brilho)f.push(`brightness(${s.visual.brilho/100})`);if(s.visual.contraste)f.push(`contrast(${s.visual.contraste/100})`);if(s.visual.saturacao)f.push(`saturate(${s.visual.saturacao/100})`);r.push(`.hero-arte{filter:${f.join(' ')}}`);}
 if(s.animacoes?.reduzir)r.push('*,*::before,*::after{animation-duration:.001ms!important;animation-iteration-count:1!important;transition-duration:.001ms!important;scroll-behavior:auto!important}');
 const v=s.variantes||{};
 if(v.cabecalho==='centrado')r.push('.cabecalho-site .limite{flex-direction:column;align-items:center;gap:12px;text-align:center}.cabecalho-site nav{justify-content:center}');
 if(v.cabecalho==='compacto')r.push('.cabecalho-site{padding-block:0}.cabecalho-site .limite{min-height:0;padding-block:8px}.cabecalho-site .marca-site small{display:none}');
 if(v.hero==='centralizado')r.push('@media(min-width:900px){.hero-grade{grid-template-columns:1fr!important;justify-items:center;text-align:center}.hero-texto{max-width:860px}.acoes-hero{justify-content:center}.hero-arte{width:min(100%,760px)}}');
 if(v.servicos==='lista')r.push('.grade-servicos{grid-template-columns:1fr!important}.grade-servicos .servico{display:grid;grid-template-columns:auto 1fr;align-items:center;gap:6px 22px}');
 if(v.servicos==='destaque')r.push('@media(min-width:760px){.grade-servicos .servico:first-child{grid-column:1/-1}}');
 if(v.faq==='duas-colunas')r.push('@media(min-width:900px){.faq-grade>div:last-child{columns:2;column-gap:28px}.faq-grade details{break-inside:avoid}}');
 if(v.rodape==='simples')r.push('.rodape-site .limite>div:not(:first-child){display:none}.rodape-site .limite{justify-content:center;text-align:center}');
 return '/* Personalizações do editor */\n'+r.join('\n')+'\n'+variacoesCss;
}
export const scriptControleAnimacao=ed=>{const s=sanitizarEd(ed);if(!s?.animacoes)return '';const bloqueios=[];if(s.animacoes.reduzir)bloqueios.push('prefers-reduced-motion');if(s.animacoes.cursor===false)bloqueios.push('pointer:fine');
 return `(()=>{const original=window.matchMedia.bind(window),forcar=${JSON.stringify(Object.fromEntries([...(s.animacoes.reduzir?[['prefers-reduced-motion',true]]:[]),...(s.animacoes.cursor===false?[['pointer:fine',false]]:[])]))};window.matchMedia=consulta=>{const r=original(consulta);for(const [chave,valor] of Object.entries(forcar))if(consulta.includes(chave)){return {matches:chave==='prefers-reduced-motion'?(consulta.includes('reduce')?valor:!valor):valor,media:consulta,addEventListener(){},removeEventListener(){},addListener(){},removeListener(){},onchange:null,dispatchEvent(){return false}};}return r;};})();\n`;};
