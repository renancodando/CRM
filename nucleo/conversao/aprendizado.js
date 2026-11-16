/* Aprendizado com resultados reais: o que aconteceu com cada empresa depois de cada estratégia de mensagem.
   Unidade de análise = empresa (não mensagem). O resultado é o estágio MAIS AVANÇADO alcançado, para que resposta não seja confundida com venda.
   Tudo é observacional: diferenças entre estratégias podem vir do tipo de empresa abordada, não da mensagem. Só um experimento sorteado separa as duas coisas. */
import {eventosDaEmpresa} from '../esquema.js';
import {wilson} from '../quant/estatistica.js';
import {analisarEmpresa,PERFIS,pesquisaDaEmpresa} from './perfil.js';
/* Peso de cada desfecho no valor comercial. Explícito e ajustável: venda vale muito mais que resposta; recusa conta contra. */
export const PESOS_DESFECHO={venda:1,negociacao:.5,demonstracao:.3,positiva:.15,resposta:.05,silencio:0,recusa:-.2};
export const MINIMO_POR_ESTRATEGIA=15,MINIMO_TOTAL=30,K_REGULARIZACAO=10;
const ORDEM=['recusa','silencio','resposta','positiva','demonstracao','negociacao','venda'];
export function desfechoDaEmpresa(estado,empresa){
 const ev=eventosDaEmpresa(estado,empresa.id).filter(e=>!e.revertido),resp=ev.filter(e=>e.tipo==='resposta');
 if(ev.some(e=>e.tipo==='venda'||e.tipo==='proposta-aceita')||empresa.etapa==='fechada')return 'venda';
 if(ev.some(e=>e.tipo==='proposta-enviada')||['negociacao','proposta'].includes(empresa.etapa))return 'negociacao';
 if(ev.some(e=>e.tipo==='demonstracao-apresentada')||resp.some(r=>r.pediuDemo))return 'demonstracao';
 if(['recusada','nao-contatar'].includes(empresa.situacao)||ev.some(e=>e.tipo==='perda'))return 'recusa';
 if(resp.some(r=>['medio','alto'].includes(r.interesse)))return 'positiva';
 if(resp.length)return 'resposta';
 return 'silencio';
}
const DIA=864e5;
/* Empresas contatadas há menos de `diasMaturacao` e ainda sem resposta ficam "em observação": não contam como silêncio. */
export function resultadosPorEstrategia(estado,{etapa='primeiro-contato',diasMaturacao=3,agora=Date.now(),filtro=null}={}){
 const linhas=new Map(),emObservacao=[];let total=0,somaValor=0;
 for(const e of estado.empresas){
  if(filtro&&!filtro(e))continue;
  const envios=eventosDaEmpresa(estado,e.id,'mensagem-enviada').filter(m=>!m.revertido);if(!envios.length)continue;
  const m=etapa==='primeiro-contato'?envios[0]:envios.find(x=>x.tipoMsg===etapa);if(!m)continue;
  const chave=m.estrategia||'(sem estratégia registrada)',d=desfechoDaEmpresa(estado,e);
  if(d==='silencio'&&agora-new Date(m.quando)<diasMaturacao*DIA){emObservacao.push(e.id);continue;}
  if(!linhas.has(chave))linhas.set(chave,{estrategia:chave,n:0,desfechos:Object.fromEntries(ORDEM.map(o=>[o,0])),valor:0});
  const l=linhas.get(chave);l.n++;l.desfechos[d]++;l.valor+=PESOS_DESFECHO[d];total++;somaValor+=PESOS_DESFECHO[d];
 }
 const mediaGeral=total?somaValor/total:null,suficienteTotal=total>=MINIMO_TOTAL;
 const acum=(l,a)=>ORDEM.slice(ORDEM.indexOf(a)).reduce((s,k)=>s+l.desfechos[k],0);
 const out=[...linhas.values()].map(l=>{
  const respostas=acum(l,'resposta')+l.desfechos.recusa,positivas=acum(l,'positiva'),demos=acum(l,'demonstracao'),negociacoes=acum(l,'negociacao'),vendas=l.desfechos.venda;
  const taxa=(x)=>({x,n:l.n,taxa:l.n?x/l.n:null,ic:wilson(x,l.n)});
  const valorMedio=l.n?l.valor/l.n:null,regularizado=mediaGeral!=null?(l.valor+K_REGULARIZACAO*mediaGeral)/(l.n+K_REGULARIZACAO):null;
  const amostraOk=l.n>=MINIMO_POR_ESTRATEGIA;
  const nivel=!amostraOk?'evidência insuficiente':vendas>=3?'evidência preliminar (com vendas)':positivas>=3?'evidência preliminar (sem vendas suficientes)':'inconclusivo';
  return {estrategia:l.estrategia,n:l.n,desfechos:l.desfechos,resposta:taxa(respostas),positiva:taxa(positivas),demonstracao:taxa(demos),negociacao:taxa(negociacoes),venda:taxa(vendas),recusa:taxa(l.desfechos.recusa),valorMedio,valorRegularizado:regularizado,amostraOk,nivel};
 }).sort((a,b)=>(b.valorRegularizado??-9)-(a.valorRegularizado??-9)||b.n-a.n);
 const alertas=[];
 for(const l of out){if(l.amostraOk&&l.resposta.taxa>=.25&&l.venda.x===0&&l.demonstracao.x===0)alertas.push(`"${l.estrategia}" gera respostas (${l.resposta.x}/${l.n}), mas nenhuma demonstração ou venda: resposta não é resultado comercial.`);}
 return {etapa,linhas:out,total,emObservacao:emObservacao.length,mediaGeral,suficiente:suficienteTotal,alertas,
  aviso:'Dados observacionais: as empresas de cada estratégia não foram sorteadas, então a diferença pode vir do perfil das empresas e não da mensagem. Para comparar de verdade, use um experimento com sorteio.',
  criterio:`Valor comercial = média dos desfechos (venda ${PESOS_DESFECHO.venda}, negociação ${PESOS_DESFECHO.negociacao}, demonstração ${PESOS_DESFECHO.demonstracao}, resposta positiva ${PESOS_DESFECHO.positiva}, resposta ${PESOS_DESFECHO.resposta}, recusa ${PESOS_DESFECHO.recusa}), encolhida para a média geral (K=${K_REGULARIZACAO}). Só influencia a recomendação com ${MINIMO_POR_ESTRATEGIA}+ empresas na estratégia e ${MINIMO_TOTAL}+ no total.`};
}
/* Ajuste de recomendação: só existe quando há amostra; caso contrário devolve 0 e diz por quê. */
export function ajustePorResultados(estado,estrategiaId,opcoes={}){
 const r=opcoes.resultados||resultadosPorEstrategia(estado,opcoes),l=r.linhas.find(x=>x.estrategia===estrategiaId);
 if(!r.suficiente||!l||!l.amostraOk)return {bonus:0,usado:false,texto:l?`Só ${l.n} empresa(s) receberam esta estratégia (mínimo ${MINIMO_POR_ESTRATEGIA}): seus resultados ainda não mudam a recomendação.`:'Ainda sem resultados seus com esta estratégia.'};
 const bonus=Math.max(-3,Math.min(3,(l.valorRegularizado-r.mediaGeral)*20));
 return {bonus,usado:true,texto:`Nos seus dados (${l.n} empresas): ${l.venda.x} venda(s), ${l.demonstracao.x} demonstração(ões), ${l.resposta.x} resposta(s), ${l.recusa.x} recusa(s). Valor comercial regularizado ${l.valorRegularizado.toFixed(3)} contra média geral ${r.mediaGeral.toFixed(3)}. Associação, não causa.`};
}
export function resultadosPorSegmento(estado,opcoes={}){
 const grupo=e=>pesquisaDaEmpresa(e)?.grupo||'sem grupo',perfilDe=new Map(estado.empresas.map(e=>[e.id,analisarEmpresa(estado,e,{agora:opcoes.agora}).principal]));
 const chaves={grupo:[...new Set(estado.empresas.map(grupo))].sort(),nicho:[...new Set(estado.empresas.map(e=>e.nicho||'sem nicho'))].sort(),perfil:[...new Set(perfilDe.values())]};
 const por=(lista,f,rot=x=>x)=>lista.map(k=>({segmento:rot(k),...resultadosPorEstrategia(estado,{...opcoes,filtro:e=>f(e)===k})})).filter(x=>x.total);
 return {porGrupo:por(chaves.grupo,grupo,g=>g==='sem grupo'?g:'Grupo '+g),porNicho:por(chaves.nicho,e=>e.nicho||'sem nicho'),porPerfil:por(chaves.perfil,e=>perfilDe.get(e.id),k=>PERFIS[k]||k)};
}
/* Resultados por etapa da conversa: para cada etapa com envios, o desfecho das empresas que receberam cada mensagem naquela etapa. */
export function resultadosPorEtapa(estado,etapas,opcoes={}){return etapas.map(([chave,rotulo])=>({chave,rotulo,...resultadosPorEstrategia(estado,{...opcoes,etapa:chave})})).filter(x=>x.total);}
