/* Script injetado somente nas prévias do editor. Nunca é incluído nos projetos exportados. */
export function scriptPonte(){return `(()=>{
 const secoes=[['.cabecalho-site','cabecalho'],['.hero','hero'],['.servicos-site','servicos'],['.pacotes-site','pacotes'],['.processo-site','processo'],['.sobre-site','sobre'],['.avaliacoes-site','avaliacoes'],['.faq-site','faq'],['.faixa-site','faixa'],['.faixa-atendimento,.dialogo-atendimento','contato'],['.rodape-site','rodape']];
 let mapa=[],alvo=null;const estilo=document.createElement('style');estilo.textContent='[data-ed-sobre]{outline:2px dashed #e4a269!important;outline-offset:3px;cursor:pointer!important}[data-ed-sel]{outline:2px solid #4cc9a7!important;outline-offset:3px}';document.head.append(estilo);
 const norm=t=>String(t||'').replace(/\\s+/g,'').toLowerCase();
 function textoDe(el){const texto=norm(el.textContent);if(!texto||texto.length>900)return null;const achou=mapa.find(m=>norm(m.texto)===texto)||(texto.length>3?mapa.find(m=>{const n=norm(m.texto);return n.includes(texto)&&texto.length>=n.length*.6;}):null);return achou?{tipo:'texto',campo:achou.campo}:null;}
 function alvoDe(e){const origem=e.target;if(!(origem instanceof Element))return null;let p=origem;while(p&&p!==document.body){const r=textoDe(p);if(r)return {el:p,r};p=p.parentElement;}
  const arte=origem.closest('.hero-arte');if(arte)return {el:arte,r:{tipo:'arte'}};
  for(const [sel,id] of secoes){const s=origem.closest(sel);if(s)return {el:s,r:{tipo:'secao',secao:id}};}return null;}
 document.addEventListener('mouseover',e=>{const a=alvoDe(e);if(alvo)alvo.removeAttribute('data-ed-sobre');alvo=a?.el||null;alvo?.setAttribute('data-ed-sobre','');},true);
 document.addEventListener('click',e=>{const a=alvoDe(e);if(!a)return;e.preventDefault();e.stopPropagation();document.querySelectorAll('[data-ed-sel]').forEach(n=>n.removeAttribute('data-ed-sel'));a.el.setAttribute('data-ed-sel','');parent.postMessage({orbitaEditor:true,...a.r},'*');},true);
 document.addEventListener('submit',e=>e.preventDefault(),true);
 addEventListener('message',e=>{if(e.source!==parent||!e.data?.orbitaEditor)return;if(e.data.mapa)mapa=e.data.mapa;if(e.data.rolar){const el=document.querySelector(e.data.rolar);el?.scrollIntoView({behavior:'smooth',block:'center'});}});
 parent.postMessage({orbitaEditor:true,tipo:'pronto'},'*');
})();`;}
