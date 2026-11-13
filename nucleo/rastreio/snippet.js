/* Gera o script de acompanhamento que vai DENTRO do site da demonstração publicada. Recebe só o endereço do coletor, um identificador opaco e uma chave de assinatura; nunca dados do CRM. */
const esc=v=>JSON.stringify(String(v)).replace(/</g,'\\u003c');
export function gerarSnippet({url,demo,chave,modo='agregado'}){
 return `/* Acompanhamento de demonstração. Sem cookies, sem fingerprinting, sem texto digitado. Recusar não afeta o funcionamento do site. */
(function(){'use strict';
var URL_=${esc(url)},DEMO=${esc(demo)},CHAVE=${esc(chave)},MODO=${esc(modo)},KC='orb-acompanhamento',KS='orb-sessao';
function lerC(){try{return localStorage.getItem(KC);}catch(e){return null;}}
function gravarC(v){try{if(v)localStorage.setItem(KC,v);else localStorage.removeItem(KC);}catch(e){}}
function sessaoId(){try{var s=sessionStorage.getItem(KS);if(!s){s=rnd(12);sessionStorage.setItem(KS,s);}return s;}catch(e){return null;}}
function rnd(n){var a='abcdefghijklmnopqrstuvwxyz0123456789',o='';try{var b=new Uint8Array(n);crypto.getRandomValues(b);for(var i=0;i<n;i++)o+=a[b[i]%36];}catch(e){for(var j=0;j<n;j++)o+=a[Math.floor(Math.random()*36)];}return o;}
var robo=/bot|crawl|spider|headless|preview|facebookexternalhit|whatsapp\\/|slurp|lighthouse|pagespeed|curl|wget|python|node-fetch/i.test(navigator.userAgent||'')||navigator.webdriver===true;
if(robo||!URL_||!DEMO)return;
var consent=lerC(),fila=[],ativo=0,visivel=document.visibilityState==='visible',ultAtv=Date.now(),ms=0,vistas={},iniSec={},enviado=false;
function dispositivo(){var w=Math.min(screen.width||innerWidth,innerWidth||9999);return w<700?'celular':w<1100?'tablet':'computador';}
function origem(){var r=document.referrer||'',q=location.search;if(/utm_source=([a-z]+)/i.test(q)){var u=RegExp.$1.toLowerCase();if(/whats/.test(u))return 'whatsapp';if(/insta/.test(u))return 'instagram';}
 if(!r)return 'direto';try{var h=new URL(r).hostname;if(/wa\\.me|whatsapp/.test(h))return 'whatsapp';if(/instagram/.test(h))return 'instagram';if(/google|bing|duckduckgo/.test(h))return 'busca';if(h===location.hostname)return 'interno';}catch(e){}return 'outro';}
function pode(tipo){return consent==='sim'||(MODO==='agregado'&&tipo==='pagina'&&consent!=='nao');}
function reg(tipo,v,extra){if(!pode(tipo))return;var e={i:rnd(10),t:tipo,ts:Date.now()};if(v!=null)e.v=String(v).slice(0,40);if(extra)for(var k in extra)e[k]=extra[k];fila.push(e);if(fila.length>=12)enviar();}
function enviar(fim){if(!fila.length||enviado&&fim)return;var corpo=JSON.stringify({d:DEMO,k:CHAVE,s:consent==='sim'?sessaoId():null,disp:dispositivo(),org:origem(),e:fila.splice(0,40)});
 try{if(navigator.sendBeacon&&fim){navigator.sendBeacon(URL_+'/e',new Blob([corpo],{type:'text/plain'}));return;}fetch(URL_+'/e',{method:'POST',body:corpo,headers:{'content-type':'text/plain'},keepalive:true,mode:'cors',credentials:'omit'}).catch(function(){});}catch(e){}}
function tempo(){var agora=Date.now();if(visivel&&agora-ultAtv<30000)ms+=agora-(tempo.u||agora);tempo.u=agora;}
setInterval(tempo,2000);function ativ(){ultAtv=Date.now();}['pointerdown','scroll','keydown','touchstart'].forEach(function(n){addEventListener(n,ativ,{passive:true});});
document.addEventListener('visibilitychange',function(){tempo();visivel=document.visibilityState==='visible';if(!visivel){reg('tempo',Math.round(ms/1000));ms=0;enviar(true);}});
addEventListener('pagehide',function(){tempo();reg('tempo',Math.round(ms/1000));ms=0;enviar(true);});
function observar(){if(!('IntersectionObserver' in window))return;var io=new IntersectionObserver(function(es){es.forEach(function(en){var id=en.target.id||en.target.getAttribute('data-secao')||en.target.className.split(' ')[0];if(en.isIntersecting&&en.intersectionRatio>=.4&&!vistas[id]){vistas[id]=1;reg('secao',id);}});},{threshold:[.4]});document.querySelectorAll('main section, main [id], section[id], footer').forEach(function(n){io.observe(n);});}
document.addEventListener('click',function(ev){var a=ev.target&&ev.target.closest&&ev.target.closest('a,button,summary,[role=button]');if(!a)return;var href=a.getAttribute('href')||'';
 if(/wa\\.me|api\\.whatsapp|whatsapp\\.com/.test(href))return reg('whatsapp',a.getAttribute('data-evento')||'botao');
 if(/^tel:/.test(href))return reg('telefone','ligar');if(a.tagName==='SUMMARY'||a.getAttribute('aria-expanded')!=null&&a.closest('[class*=faq],#faq'))return reg('faq',(a.textContent||'').trim().slice(0,30));
 if(a.closest('[class*=servico],#servicos'))return reg('servico',(a.textContent||'').trim().slice(0,30));
 if(href.charAt(0)==='#')return reg('ancora',href.slice(1,30));reg('botao',(a.textContent||'').trim().slice(0,30));},true);
function faixa(){if(consent||document.getElementById('orb-ac'))return;var d=document.createElement('div');d.id='orb-ac';d.setAttribute('role','dialog');d.setAttribute('aria-label','Acompanhamento da demonstração');
 d.style.cssText='position:fixed;left:8px;right:8px;bottom:44px;max-width:420px;z-index:2147483000;background:#111c;color:#fff;font:13px/1.4 system-ui,sans-serif;padding:10px 12px;border-radius:12px;backdrop-filter:blur(8px)';
 d.innerHTML='Esta demonstração mede, de forma anônima, quais partes foram vistas e clicadas (sem cookies, sem seu nome). Você aceita?<div style="margin-top:8px;display:flex;gap:8px"><button id="orb-s" style="padding:6px 12px;border-radius:8px;border:0;background:#fff;color:#111;cursor:pointer">Aceitar</button><button id="orb-n" style="padding:6px 12px;border-radius:8px;border:1px solid #fff8;background:transparent;color:#fff;cursor:pointer">Recusar</button></div>';
 document.body.appendChild(d);document.getElementById('orb-s').onclick=function(){escolher('sim');};document.getElementById('orb-n').onclick=function(){escolher('nao');};}
function escolher(v){consent=v;gravarC(v);var d=document.getElementById('orb-ac');if(d)d.remove();if(v==='sim'){reg('consentimento','sim');}else{fila=[];}}
window.orbitaAcompanhamento={revogar:function(){consent='nao';gravarC('nao');fila=[];try{sessionStorage.removeItem(KS);}catch(e){}},estado:function(){return consent;},reabrir:function(){gravarC(null);consent=null;faixa();}};
function iniciar(){reg('pagina',location.pathname.slice(0,40),{recorrente:consent==='sim'&&!!(function(){try{return localStorage.getItem('orb-visto');}catch(e){}})()});try{if(consent==='sim')localStorage.setItem('orb-visto','1');}catch(e){}observar();faixa();}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',iniciar);else iniciar();
setInterval(function(){enviar();},15000);
})();
`;
}
