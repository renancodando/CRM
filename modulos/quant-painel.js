import {criarQuant} from './quant.js';
import {criarQuant2} from './quant2.js';
import {dadosForm,t} from './util.js';
export function criarQuantPainel(ctx){
 const q=criarQuant(ctx),H=q.helpers,q2=criarQuant2(ctx,H);
 const principais={visao:()=>H.visao(),funil:()=>H.funilAba(),dinheiro:()=>H.dinheiroAba(),grupos:()=>H.gruposAba(),...q2.tabs};
 function abrir(aba=H.aba){
  H.aba=aba;let corpo;try{corpo=principais[aba]();}catch(e){console.error(e);corpo=`<p class="estudio-erros">Não foi possível calcular esta análise: ${t(e.message)}</p>`;}
  ctx.abrirPainel('O cérebro do seu negócio',`<div class="abas" role="tablist">${H.abas.map(([k,n])=>`<button type="button" role="tab" aria-selected="${aba===k}" class="${aba===k?'ativa':''}" data-m="quant.aba" data-id="${k}">${n}</button>`).join('')}</div>${['config','conciliacao','perguntas','conhecimento'].includes(aba)?'':H.controles()}<div class="quant-corpo">${corpo}</div>`,'ÓRBITA QUANT · SOMENTE DADOS REAIS');
  document.querySelector('#q-controles')?.addEventListener('submit',e=>{e.preventDefault();H.setControles(dadosForm(e.currentTarget));abrir(aba);});
  document.querySelector('#q-grupos')?.addEventListener('submit',e=>{e.preventDefault();H.setGrupos(dadosForm(e.currentTarget));abrir(aba);});
  document.querySelector('#q-cond')?.addEventListener('submit',e=>{e.preventDefault();document.querySelector('#q-cond-res').innerHTML=H.compararCondicoes(dadosForm(e.currentTarget));});
  q2.ligar(aba);
 }
 return {abrir,acoes:{abrir:()=>abrir(),aba:id=>abrir(id),detalhe:id=>H.detalhe(id),...q2.acoes}};
}
