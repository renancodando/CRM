/* Resumo visual da prospecção: lê o estado existente, não altera negócios ou histórico. */
import {icone} from './icones.js';
import {textoSeguro as t} from './utilitarios.js';
import {montarAmbiente, criarAmbiente} from './ambiente/componente.js';
const ambientes = new WeakMap();

const META_CHAVE='orbita-meta-mensagens-mes';
const META_PADRAO=500;
const ETAPAS=[
 ['encontrada','Encontradas','busca'],
 ['verificada','Verificadas','verificado'],
 ['mensagem','Mensagem enviada','aviao'],
 ['respondeu','Responderam','mensagem'],
 ['demonstracao','Demonstração enviada','monitor'],
 ['negociacao','Negociação','acordo'],
 ['proposta','Proposta enviada','dinheiro'],
 ['fechada','Fechadas','verificado']
];
const TIPOS_ATIVIDADE={
 'mensagem-enviada':['Mensagem enviada para','aviao'],
 'resposta':['Resposta recebida de','mensagem'],
 'demonstracao-apresentada':['Demonstração enviada para','monitor'],
 'proposta-enviada':['Proposta enviada para','dinheiro'],
 'venda':['Venda registrada com','verificado']
};
const inteiro=n=>new Intl.NumberFormat('pt-BR').format(n);
const dataValida=s=>{const d=new Date(s);return Number.isFinite(d.getTime())?d:null;};
const inicioDia=d=>new Date(d.getFullYear(),d.getMonth(),d.getDate());
const contar=(eventos,a,b)=>eventos.filter(e=>{const d=dataValida(e.quando);return d&&d>=a&&d<b;}).length;
const semanaInicial=hoje=>{const d=inicioDia(hoje);d.setDate(d.getDate()-((d.getDay()+6)%7));return d;};
const avancarDias=(data,n)=>{const d=new Date(data);d.setDate(d.getDate()+n);return d;};

export function obterMetaMensal(){
 try{const valor=Number(localStorage.getItem(META_CHAVE));return Number.isSafeInteger(valor)&&valor>=1&&valor<=1000000?valor:META_PADRAO;}catch{return META_PADRAO;}
}
export function salvarMetaMensal(valor){
 const n=Number(valor);
 if(!Number.isSafeInteger(n)||n<1||n>1000000)return false;
 try{localStorage.setItem(META_CHAVE,String(n));return true;}catch{return false;}
}

/* A contagem exige um evento de envio confirmado; abrir o WhatsApp não é envio. */
export function calcularAtividadeProspeccao(estado,agora=new Date()){
 const hoje=inicioDia(agora),amanha=avancarDias(hoje,1),semana=semanaInicial(agora),semanaAnterior=avancarDias(semana,-7);
 const mes=new Date(hoje.getFullYear(),hoje.getMonth(),1),mesAnterior=new Date(hoje.getFullYear(),hoje.getMonth()-1,1);
 const eventos=(estado.eventos||[]).filter(e=>e&&!e.revertido);
 const mensagens=eventos.filter(e=>e.tipo==='mensagem-enviada');
 const validas=mensagens.filter(e=>{const d=dataValida(e.quando);return d&&d<=agora;});
 const semanaDias=Array.from({length:7},(_,i)=>{
  const inicio=avancarDias(semana,i);
  return {nome:['Seg','Ter','Qua','Qui','Sex','Sáb','Dom'][i],quantidade:contar(validas,inicio,avancarDias(inicio,1)),futuro:inicio>agora};
 });
 const primeiroEnvio=new Map();
 for(const e of validas){if(!e.empresaId)continue;const d=dataValida(e.quando);if(!primeiroEnvio.has(e.empresaId)||d<primeiroEnvio.get(e.empresaId))primeiroEnvio.set(e.empresaId,d);}
 const respondidas=new Set();
 for(const e of eventos){if(e.tipo!=='resposta'||!primeiroEnvio.has(e.empresaId))continue;const d=dataValida(e.quando);if(d&&d>=primeiroEnvio.get(e.empresaId)&&d<=agora)respondidas.add(e.empresaId);}
 const recentes=eventos.filter(e=>TIPOS_ATIVIDADE[e.tipo]&&dataValida(e.quando)&&dataValida(e.quando)<=agora).sort((a,b)=>new Date(b.quando)-new Date(a.quando)).slice(0,3);
 const contagens=ETAPAS.map(([id,nome,desenho])=>({id,nome,desenho,quantidade:(estado.empresas||[]).filter(e=>e.etapa===id).length}));
 return {
  hoje:contar(validas,hoje,amanha),
  ontem:contar(validas,avancarDias(hoje,-1),hoje),
  semana:contar(validas,semana,avancarDias(semana,7)),
  semanaAnterior:contar(validas,semanaAnterior,semana),
  mes:contar(validas,mes,new Date(hoje.getFullYear(),hoje.getMonth()+1,1)),
  mesAnterior:contar(validas,mesAnterior,mes),
  total:mensagens.length,
  semanaDias,
  contagens,
  taxaResposta:primeiroEnvio.size?respondidas.size/primeiroEnvio.size:null,
  contatos:primeiroEnvio.size,
  responderam:respondidas.size,
  recentes
 };
}
const variacao=(atual,anterior)=>{
 if(!anterior)return '<small class="pr-kpi-variacao pr-sem-base">Sem base anterior</small>';
 const pct=Math.round((atual-anterior)/anterior*100);
 return '<small class="pr-kpi-variacao '+(pct<0?'pr-queda':pct>0?'pr-alta':'')+'">'+(pct>0?'+':'')+pct+'% vs. período anterior</small>';
};
const acaoAtributos=a=>a.m?'data-m="'+t(a.m)+'" data-id="'+t(a.id)+'"':'data-acao="'+t(a.acao)+'"';
const hora=d=>new Date(d).toLocaleString('pt-BR',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'});
const itemAcao=(a,i)=>'<button class="pr-acao" '+acaoAtributos(a)+'><span class="pr-acao-ordem">'+String(i+1).padStart(2,'0')+'</span><span class="pr-acao-texto"><strong>'+t(a.titulo)+'</strong><small>'+t(a.descricao)+'</small></span>'+icone('seta')+'</button>';
const itemOportunidade=({empresa:e,p},i)=>'<button class="pr-oportunidade" data-empresa="'+t(e.id)+'"><span class="pr-oportunidade-num">'+String(i+1).padStart(2,'0')+'</span><span class="pr-oportunidade-texto"><strong>'+t(e.nome)+'</strong><small>'+t(e.cidade)+(p.pesquisa?' · Grupo '+t(p.pesquisa.grupo)+' · evidência '+t(p.pesquisa.evidencia)+'/100':'')+'</small></span><span class="pr-pontos">'+inteiro(p.total)+' <small>pts</small></span>'+icone('seta')+'</button>';

export function renderizarPainelProspeccao(alvo,estado,visao){
 if(!alvo)return;
 const a=calcularAtividadeProspeccao(estado),meta=obterMetaMensal(),progresso=Math.round(a.mes/meta*100),limite=Math.min(100,progresso);
 const maior=Math.max(1,...a.semanaDias.map(d=>d.quantidade));
 const maiorEtapa=Math.max(1,...a.contagens.map(x=>x.quantidade));
 const emp=new Map((estado.empresas||[]).map(e=>[e.id,e]));
 const taxa=a.taxaResposta==null?'—':(a.taxaResposta*100).toLocaleString('pt-BR',{maximumFractionDigits:1})+'%';
 const html=[];
 html.push('<header class="pr-cabecalho"><div class="pr-titulo"><span class="pr-icone pr-icone-cobre">'+icone('grafico')+'</span><span><h2>Visão geral de prospecção</h2><p>Seu desempenho com dados registrados no CRM</p></span></div><button class="pr-ver" data-acao="hoje">'+icone('calendario')+' Ver hoje '+icone('seta')+'</button></header>');
 html.push('<div class="pr-kpis" aria-label="Mensagens enviadas confirmadas no CRM">');
 const kpis=[['Hoje',a.hoje,a.ontem,'aviao','cobre'],['Nesta semana',a.semana,a.semanaAnterior,'calendario','turquesa'],['Neste mês',a.mes,a.mesAnterior,'calendario','azul'],['Total geral',a.total,null,'camadas','neutro']];
 for(const [nome,valor,anterior,desenho,tom] of kpis)html.push('<div class="pr-kpi pr-'+tom+'"><span class="pr-kpi-titulo">'+icone(desenho)+t(nome)+'</span><strong>'+inteiro(valor)+'</strong>'+(anterior==null?'<small class="pr-kpi-variacao pr-sem-base">Desde o primeiro registro</small>':variacao(valor,anterior))+'</div>');
 html.push('</div>');
 html.push('<div class="pr-meta"><div class="pr-anel" style="--pr-porcentagem:'+limite+'%"><span><strong>'+inteiro(progresso)+'%</strong><small>da meta</small></span></div><div class="pr-meta-corpo"><h3>Meta de prospecção</h3><label class="pr-meta-label" for="pr-meta-valor">Meta mensal de mensagens confirmadas</label><div class="pr-meta-ajuste"><input id="pr-meta-valor" type="number" min="1" max="1000000" step="1" inputmode="numeric" value="'+meta+'" aria-label="Meta mensal de mensagens"><span>mensagens/mês</span></div><div class="pr-progresso"><span style="width:'+limite+'%"></span></div><p>'+inteiro(a.mes)+' de '+inteiro(meta)+' mensagens neste mês</p></div><div class="pr-taxa"><span>'+icone('alvo')+' Taxa de resposta</span><strong>'+taxa+'</strong><small>'+a.responderam+' de '+a.contatos+' empresas com envio registrado responderam</small></div></div>');
 html.push(montarAmbiente());
 html.push('<p class="pr-observacao">Os envios são contabilizados apenas após confirmação no Órbita. Abrir o WhatsApp não conta como mensagem enviada. A taxa considera empresas com envio confirmado e resposta posterior.</p>');
 if (!ambientes.has(alvo)) {
  alvo.innerHTML=html.join('');
  ambientes.set(alvo,criarAmbiente(alvo.querySelector('.pr-ambiente')));
 } else {
  const molde=document.createElement('template');molde.innerHTML=html.join('');
  for (const seletor of ['.pr-cabecalho','.pr-kpis','.pr-meta','.pr-observacao']) {
   const atual=alvo.querySelector(seletor),novo=molde.content.querySelector(seletor);
   if (atual.outerHTML!==novo.outerHTML) {
    if (seletor==='.pr-meta') {
     for(const texto of ['.pr-anel strong','.pr-meta-corpo>p','.pr-taxa>strong','.pr-taxa>small'])atual.querySelector(texto).textContent=novo.querySelector(texto).textContent;
     for(const estilo of ['.pr-anel','.pr-progresso>span'])atual.querySelector(estilo).style.cssText=novo.querySelector(estilo).style.cssText;
     const campo=atual.querySelector('#pr-meta-valor'),valor=novo.querySelector('#pr-meta-valor').value;
     campo.value=valor;campo.setAttribute('value',valor);
    } else atual.replaceWith(novo);
   }
  }
 }
 ambientes.get(alvo).atualizar(estado,a,visao,a.contagens,TIPOS_ATIVIDADE);
}
