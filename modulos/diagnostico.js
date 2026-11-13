/* Diagnóstico comercial: plano do dia, funil detalhado, gargalos, análise de mensagens e laboratório científico. Associações e hipóteses, nunca causas. */
import {t,campo,dadosForm,dataHora,confirmar} from './util.js';
import {tabela,barras,funil as graficoFunil} from './graficos.js';
import {planoDoDia} from '../nucleo/diagnostico/plano-dia.js';
import {calcularFunil,ETAPAS,DIMENSOES,compararTaxa} from '../nucleo/diagnostico/funil.js';
import {diagnosticarGargalos} from '../nucleo/diagnostico/gargalos.js';
import {analisarMensagens,FEATURES} from '../nucleo/diagnostico/mensagens-analise.js';
import {analisarExperimentoAvancado,tamanhoAmostra,poderEstatistico,PRESETS,criarDePreset} from '../nucleo/diagnostico/laboratorio-avancado.js';
import {elegiveis,distribuir} from '../nucleo/conversao/laboratorio.js';
const abas=[['hoje','Plano do dia'],['funil','Funil'],['gargalos','Gargalos'],['mensagens','Mensagens'],['lab','Laboratório']];
const pc=v=>v==null?'—':(v*100).toFixed(1).replace('.',',')+'%';
const ic=x=>x?` (${pc(x.baixo)}–${pc(x.alto)})`:'';
const R=c=>c==null?'—':(c/100).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
export function criarDiagnostico(ctx){
 const {obterEstado,salvar,avisar,abrirPainel}=ctx,estado=()=>obterEstado();
 let aba='hoje',agrup='',dias='',tempo=60,desfecho='respondeu',expSel='';
 function hoje(){
  const p=planoDoDia(estado(),{tempoDisponivelMin:tempo||null});
  return `<p class="ajuda">${t(p.aviso)}</p><form id="dg-tempo" class="grade-formulario">${campo('tempo','Tempo disponível hoje (minutos)',String(tempo),{tipo:'number'})}<button type="submit">Aplicar</button></form>
  ${p.vazio?'<p class="vazio">Nada urgente hoje. Cadastre empresas elegíveis ou registre conversas para ver prioridades.</p>':`<ol class="plano-dia">${p.itens.map(i=>`<li class="${i.cabeNoTempo===false?'fora-do-tempo':''}"><div><b>${i.posicao}. ${t(i.titulo)}</b> <small>${t(i.rotuloCategoria)} · ~${i.minutos} min${i.cabeNoTempo===false?' · não cabe no seu tempo':''}</small><p>${t(i.porque)}</p></div>${i.empresaId?`<button type="button" class="botao-principal" data-m="diagnostico.abrir-emp" data-id="${t(i.empresaId)}|${t(i.categoria)}">Abrir</button>`:''}</li>`).join('')}</ol><p>Tempo total estimado: ${p.tempoTotalMin} min.</p>`}
  ${p.bloqueados.length?`<h4>Não contatar (${p.bloqueados.length})</h4><p class="ajuda">${p.bloqueados.map(b=>t(b.empresa)+' — '+t(b.motivo)).join(' · ')}</p>`:''}`;
 }
 function funilAba(){
  const f=calcularFunil(estado(),{agrupar:agrup||null});
  let h=`<p class="ajuda">${t(f.aviso)}</p><form id="dg-agr" class="grade-formulario">${campo('agrupar','Comparar por',agrup,{opcoes:[['','(sem comparação)'],...DIMENSOES.filter(d=>d!=='empresa').map(d=>[d,{nicho:'Nicho',cidade:'Cidade',origem:'Origem do contato',periodo:'Período (mês do 1º contato)',abordagem:'Abordagem',modelo:'Modelo de site',faixa:'Faixa de preço'}[d]])]})}<button type="submit">Aplicar</button></form>`;
  h+=graficoFunil(ETAPAS.map(([id,nome])=>({nome,n:f.contagens[id]})),{titulo:'Funil comercial'});
  h+=tabela(['Transição','Base','Avançaram','Taxa (IC 95%)','Amostra'],f.transicoes.map(x=>[x.rotulo,x.denominador,x.numerador,x.denominador?pc(x.taxa)+ic(x.ic):'—',x.suficiente?'ok':'pequena']));
  if(f.vendasSemDemonstracao)h+=`<p>${f.vendasSemDemonstracao} venda(s) sem demonstração criada (caminho alternativo).</p>`;
  if(f.caminhosDeVenda.length)h+=`<h4>Caminhos das vendas</h4><ul>${f.caminhosDeVenda.map(c=>`<li>${c.n}× ${c.sequencia.map(t).join(' › ')}</li>`).join('')}</ul>`;
  if(f.grupos)h+=`<h4>Comparação</h4>`+tabela(['Grupo','Empresas','1ª mensagem','Resposta','Positiva','Preço','Proposta','Venda'],f.grupos.map(g=>[g.chave,g.empresas,g.contagens['primeira-mensagem'],g.contagens.resposta,g.contagens['resposta-positiva'],g.contagens.preco,g.contagens.proposta,g.contagens.venda]))+'<p class="ajuda">Comparação observacional: grupos pequenos oscilam muito.</p>';
  return h;
 }
 function gargalosAba(){
  const g=diagnosticarGargalos(estado(),{dias:dias?Number(dias):null});
  return `<p class="ajuda">Cada item mostra a base de cálculo, a taxa com intervalo de confiança e o que NÃO sabemos. São associações e hipóteses, não causas.</p><form id="dg-per" class="grade-formulario">${campo('dias','Período',dias,{opcoes:[['','Todo o histórico'],['30','Últimos 30 dias'],['90','Últimos 90 dias']]})}<button type="submit">Aplicar</button></form>${g.map(x=>`<article class="cartao-exp"><h4>${t(x.titulo)} ${x.suficiente?'':'<span class="selo-situacao pausada">dados insuficientes</span>'}</h4><p><b>${t(x.rotuloTaxa)}</b>${x.taxa!=null?' = '+pc(x.taxa)+ic(x.ic):''} · período: ${t(x.periodo)}</p><p class="ajuda">Base (denominador): ${t(x.descricaoDenominador)}.</p><p>${t(x.natureza)}</p>${x.suficiente?`${x.comparacoes.grupos.length>1?`<p>Por ${t(x.comparacoes.por)}: ${x.comparacoes.grupos.map(c=>`${t(c.chave)} ${c.numerador}/${c.denominador}`).join(' · ')}${x.comparacoes.teste?` — diferença ${(x.comparacoes.teste.diferenca*100).toFixed(0)} pp, p=${x.comparacoes.teste.p.toFixed(3)} (${t(x.comparacoes.teste.natureza)})`:''}</p>`:''}<details><summary>Hipóteses, alternativas e o que falta</summary><p><b>Hipóteses plausíveis:</b> ${x.hipoteses.map(t).join('; ')}</p><p><b>Explicações alternativas:</b> ${x.explicacoesAlternativas.map(t).join('; ')}</p><p><b>Dados que faltam:</b> ${x.dadosFaltantes.map(t).join('; ')}</p><p><b>Experimento recomendado:</b> ${t(x.experimentoRecomendado)}</p><p><b>Ação prática:</b> ${t(x.acaoPratica)}</p></details>`:`<p class="ajuda">Dados que faltam: ${x.dadosFaltantes.map(t).join('; ')}</p>`}</article>`).join('')}`;
 }
 function mensagensAba(){
  const a=analisarMensagens(estado(),{desfecho});
  if(!a.possivel)return `<p class="vazio">${t(a.motivo)}</p>`;
  return `<p class="ajuda">${t(a.aviso)}</p><form id="dg-des" class="grade-formulario">${campo('desfecho','Desfecho',desfecho,{opcoes:[['respondeu','Respondeu'],['positiva','Resposta positiva'],['venda','Venda']]})}<button type="submit">Aplicar</button></form><p>${a.total} primeiras mensagens · taxa geral ${pc(a.taxaGeral)}.</p>${a.achados.length?`<div class="alerta-duplicidade" role="note"><b>Achados (associação):</b><ul>${a.achados.map(x=>`<li>${t(x)}</li>`).join('')}</ul></div>`:'<p>Nenhuma diferença se sustenta após corrigir as comparações múltiplas.</p>'}${a.tabelas.map(tb=>`<details><summary><b>${t(tb.rotulo)}</b></summary>${tabela(['Grupo','Empresas','Sucessos','Taxa (IC 95%)'],tb.grupos.map(g=>[g.valor,g.n,g.x,pc(g.taxa)+ic(g.ic)]))}${tb.teste?`<p>${t(tb.teste.entre[0])} vs ${t(tb.teste.entre[1])}: diferença ${(tb.teste.diferenca*100).toFixed(0)} pp, p=${tb.teste.p.toFixed(3)}, p ajustado (Holm)=${tb.teste.pAjustadoHolm?.toFixed(3)}${tb.teste.oddsRatioAjustadoPorNicho?`, razão de chances ajustada por nicho=${tb.teste.oddsRatioAjustadoPorNicho.oddsRatio.toFixed(2)}`:''}</p>`:''}${tb.vies.map(v=>`<p class="ajuda">⚠ ${t(v)}</p>`).join('')}</details>`).join('')}`;
 }
 function labAba(){
  const est=estado(),exps=est.experimentos.filter(x=>x.conv);
  let h=`<p class="ajuda">Complementa o laboratório de Conversão. O objetivo principal deve considerar vendas, receita e custo comercial, não só respostas.</p><h4>Calculadora de amostra</h4><form id="dg-amostra" class="grade-formulario">${campo('p1','Taxa atual esperada (%)','10',{tipo:'number'})}${campo('p2','Taxa que gostaria de detectar (%)','20',{tipo:'number'})}<button type="submit">Calcular</button></form><div id="dg-amostra-out"></div>
  <h4>Criar a partir de um modelo</h4><form id="dg-preset" class="grade-formulario">${campo('preset','Modelo',PRESETS[0].id,{opcoes:PRESETS.map(p=>[p.id,p.titulo])})}<button type="submit">Criar experimento</button></form>
  <h4>Análise avançada</h4>`;
  if(!exps.length)return h+'<p class="vazio">Nenhum experimento de conversão. Crie um acima.</p>';
  h+=`<form id="dg-exp" class="grade-formulario">${campo('exp','Experimento',expSel||exps[0].id,{opcoes:exps.map(x=>[x.id,x.nome])})}<button type="submit">Analisar</button></form>`;
  const x=exps.find(e=>e.id===(expSel||exps[0].id));if(x){const r=analisarExperimentoAvancado(est,x);
   h+=`<article class="cartao-exp"><h4>${t(x.nome)}</h4><p><b>${t(r.veredito.texto)}</b></p><p>${t(r.objetivoPrincipal)}</p>${r.diferencas?`<p>Diferença absoluta ${pc(r.diferencas.absoluta)}${r.diferencas.relativa!=null?', relativa '+pc(r.diferencas.relativa):''}${ic(r.diferencas.ic?{baixo:r.diferencas.ic.baixo,alto:r.diferencas.ic.alto}:null)}</p>`:''}${r.amostraNecessaria?`<p>Para detectar a diferença observada com 80% de poder: ~${r.amostraNecessaria.porGrupo} por variante.</p>`:''}
   <h5>Resultado econômico</h5>${tabela(['Variante','Enviadas','Receita','Horas','Custo comercial','Resultado'],r.economico.map(e=>[e.variante,e.enviadas,R(e.receitaCent),e.horasRegistradas.toFixed(1),R(e.custoComercialCent),R(e.resultadoCent)]))}${r.economico.some(e=>e.aviso)?`<p class="ajuda">${r.economico.map(e=>t(e.aviso)).filter(Boolean)[0]||''}</p>`:''}
   <h5>Segmentação por nicho</h5>${r.segmentacao.length?tabela(['Nicho',...x.variantes.map(v=>v.nome),'Amostra'],r.segmentacao.map(s=>[s.nicho,...x.variantes.map(v=>{const o=s.variantes[v.nome];return o.n?`${o.sucesso}/${o.n}`:'—';}),s.suficiente?'ok':'pequena'])):'<p class="ajuda">Sem envios ainda.</p>'}
   <h5>Validação interna (primeira vs segunda metade)</h5><p>${r.replicacao.disponivel?t(r.replicacao.texto):t(r.replicacao.motivo)}</p><h5>Critérios de interrupção</h5>${r.interrupcao.length?`<ul>${r.interrupcao.map(i=>`<li>${t(i.texto)}</li>`).join('')}</ul>`:'<p class="ajuda">Nenhum critério acionado.</p>'}<p class="ajuda">${t(r.confundidores.texto)}</p></article>`;}
  return h;
 }
 const tabs={hoje,funil:funilAba,gargalos:gargalosAba,mensagens:mensagensAba,lab:labAba};
 function abrir(a=aba){
  aba=a;abrirPainel('Onde está o seu caminho para a venda',`<div class="abas" role="tablist">${abas.map(([k,n])=>`<button type="button" role="tab" aria-selected="${aba===k}" class="${aba===k?'ativa':''}" data-m="diagnostico.aba" data-id="${k}">${n}</button>`).join('')}</div>${tabs[aba]()}`,'DIAGNÓSTICO');
  const q=s=>document.querySelector(s),f=(s,fn)=>q(s)?.addEventListener('submit',ev=>{ev.preventDefault();try{fn(dadosForm(ev.currentTarget),ev.currentTarget);}catch(x){avisar(x.message);}});
  f('#dg-tempo',d=>{tempo=Math.max(0,Number(d.tempo)||0);abrir('hoje');});f('#dg-agr',d=>{agrup=d.agrupar;abrir('funil');});f('#dg-per',d=>{dias=d.dias;abrir('gargalos');});f('#dg-des',d=>{desfecho=d.desfecho;abrir('mensagens');});f('#dg-exp',d=>{expSel=d.exp;abrir('lab');});
  f('#dg-amostra',d=>{const a=Number(d.p1)/100,b=Number(d.p2)/100;try{const r=tamanhoAmostra(a,b);q('#dg-amostra-out').innerHTML=`<p>Cerca de <b>${r.porGrupo}</b> mensagens por variante (${r.total} no total) para 80% de poder e 5% de significância. Com 20 por variante o poder seria de ${(poderEstatistico(a,b,20).poder*100).toFixed(0)}%.</p><p class="ajuda">${t(r.aviso)}</p>`;}catch(e){avisar(e.message);}});
  f('#dg-preset',d=>{const x=criarDePreset(estado(),d.preset);salvar();expSel=x.id;avisar('Experimento criado. Sorteie as empresas na aba Laboratório de Órbita Conversão.');abrir('lab');});
 }
 const acoes={aba:id=>abrir(id),'abrir-emp':v=>{const [id,cat]=v.split('|');ctx.modulos.negociacao.abrir(id,['proposta','preco','responder-preco','responder','follow-up','apresentar-link'].includes(cat)?'mensagem':'resumo');},abrir:()=>abrir('hoje')};
 return {abrir,acoes};
}
