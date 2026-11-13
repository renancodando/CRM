/* Consulta em português: pergunta → representação estruturada e segura → execução sobre a camada analítica. Sem eval, sem IA, somente leitura. */
import {construirModelo,periodoPadrao,ev,filtrarEmpresas,dentro,reg} from './modelo.js';
import {agrupar,rentabilidadeProjetos,fluxoCaixa} from './analises.js';
import {calcular,formatarValor,metricas} from './metricas.js';
import {reais,aCentavos} from './financas.js';
import {soma} from './estatistica.js';
const sem=t=>String(t||'').normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase();
export const catalogoMetricas=[
 {id:'receita',nome:'receita recebida',sin:['receita recebida','receita','recebi','recebido','faturamento recebido','quanto recebi'],metrica:'valor_recebido',campo:'recebido',unid:'R$'},
 {id:'resultado',nome:'resultado financeiro',sin:['resultado financeiro','resultado','lucro'],metrica:'resultado_financeiro',campo:'resultado',unid:'R$'},
 {id:'custos',nome:'custos',sin:['custos','custo','gastei','gasto','gastos','despesas'],metrica:'custos',campo:'custos',unid:'R$'},
 {id:'resposta',nome:'taxa de resposta',sin:['taxa de resposta','respostas','mais respostas','resposta'],metrica:'taxa_resposta',campo:'taxaResposta',unid:'%'},
 {id:'conversao',nome:'taxa de fechamento',sin:['conversao','taxa de fechamento','fechamento','converte'],metrica:'taxa_fechamento',campo:'taxaFechamento',unid:'%'},
 {id:'vendas',nome:'vendas',sin:['vendas','mais vendas','vendeu','vendeu mais','vendas concluidas'],metrica:'vendas',campo:'vendas',unid:'vendas'},
 {id:'ticket',nome:'ticket médio',sin:['ticket medio','ticket'],metrica:'ticket_medio',campo:'ticket',unid:'R$'},
 {id:'retorno_hora',nome:'retorno por hora',sin:['retorno por hora','retorno/hora','retorno hora'],metrica:'retorno_por_hora',campo:'retornoHora',unid:'R$/h'},
 {id:'horas',nome:'horas trabalhadas',sin:['horas trabalhadas','horas','tempo investido','tempo dedicado'],metrica:'horas',campo:'horas',unid:'h'},
 {id:'margem',nome:'margem',sin:['margem'],metrica:'margem',campo:'margem',unid:'%'},
 {id:'contatadas',nome:'empresas contatadas',sin:['empresas contatadas','contatei','contatadas'],metrica:'empresas_contatadas',campo:'contatadas',unid:'empresas'},
 {id:'mensagens',nome:'mensagens enviadas',sin:['mensagens enviadas','mensagens'],metrica:'mensagens_enviadas',campo:null,unid:'mensagens'}
];
const dims=[['modelo',['modelo de site','modelo','modelos']],['nicho',['nicho','segmento']],['cidade',['cidade']],['uf',['estado','uf']],['estrategia',['estrategia','abordagem']],['fonte',['fonte','origem']],['mes',['mes','por mes','mensal']],['etapa',['etapa']]];
const nichos=[['celulares',['assistencia tecnica','assistencias tecnicas','celular','celulares']],['odontologia',['odontologia','dentista','clinica odontologica']],['automotivo',['estetica automotiva','automotivo','automotiva']]];
export function interpretar(pergunta,estado){
 const q=' '+sem(pergunta).replace(/[?!.,;]/g,' ')+' ',interp={pergunta,intencao:null,metrica:null,agrupamento:null,periodo:'todo',filtros:{},ordem:'desc',limite:null,predicado:null,notas:[]};
 const hoje=new Date();
 if(/ (neste|nesse|no) mes | mes atual /.test(q))interp.periodo='mes';else if(/ mes passado | mes anterior /.test(q))interp.periodo='mes-anterior';else if(/ ultimo trimestre | neste trimestre /.test(q))interp.periodo='trimestre';else if(/ ultimos? seis meses /.test(q))interp.periodo='6m';else if(/ ultimos? tres meses /.test(q))interp.periodo='3m';else if(/ (neste|nesse|no) ano | este ano /.test(q))interp.periodo='ano';else if(/ (esta|nesta) semana /.test(q))interp.periodo='semana';else if(/ hoje /.test(q))interp.periodo='dia';else if(/ (todo o periodo|todo o historico|desde o inicio) /.test(q))interp.periodo='todo';
 for(const [id,sins] of nichos)if(sins.some(s=>q.includes(' '+s+' ')||q.includes(' '+s)))interp.filtros.nicho=id;
 const cidades=[...new Set((estado?.empresas||[]).map(e=>(e.cidade||'').split(/[-,/]/)[0].trim()).filter(Boolean))];for(const c of cidades)if(q.includes(' '+sem(c)+' '))interp.filtros.cidade=c;
 const pct=q.match(/desconto (?:superior|maior|acima) (?:a|de) (\d+)\s*(?:%|por cento)?/);
 if(pct){interp.intencao='lista';interp.predicado={tipo:'desconto-acima',valor:Number(pct[1])};interp.metrica='propostas';}
 else if(/ pagamentos? atrasados? | parcelas? vencidas? /.test(q)){interp.intencao='lista';interp.predicado={tipo:'pagamentos-atrasados'};}
 else if(/ ainda nao responderam | sem resposta | nao responderam /.test(q)){interp.intencao='lista';interp.predicado={tipo:'sem-resposta'};if(/ receberam demonstrac/.test(q))interp.predicado.comDemo=true;}
 else if(/ receberam demonstrac/.test(q)){interp.intencao='lista';interp.predicado={tipo:'com-demo'};}
 else if(/resultado economico abaixo|resultado abaixo|abaixo do minimo/.test(q)){interp.intencao='lista';interp.predicado={tipo:'abaixo-minimo'};}
 else if(/ nao fecharam | nao fechou /.test(q)&&/ tempo | horas /.test(q)){interp.intencao='escalar';interp.metrica='horas';interp.filtros.somenteNaoFecharam=true;}
 if(!interp.intencao){
  let best=null;for(const mt of catalogoMetricas)for(const s of mt.sin){if(q.includes(' '+sem(s)+' ')||q.includes(' '+sem(s))){if(!best||s.length>best.len)best={mt,len:s.length};}}
  if(/gastei com ferramentas|ferramentas/.test(q)){interp.intencao='escalar';interp.metrica='custos';interp.filtros.categoria='ferramenta';}
  else if(best)interp.metrica=best.mt.id;
  const comparativo=/ qual | quais | maior | menor | melhor | pior | mais /.test(q),dim=dims.find(([,s])=>s.some(x=>q.includes(' '+x+' ')||q.includes(' '+x)));
  if(interp.metrica){if(dim&&(comparativo||/ por /.test(q))){interp.intencao='ranking';interp.agrupamento=dim[0];interp.limite=/ qual /.test(q)&&!/ quais /.test(q)?1:null;if(/ menor | pior /.test(q))interp.ordem='asc';}else if(!interp.intencao)interp.intencao='escalar';}
 }
 if(!interp.intencao)return {ok:false,interp,sugestoes:['Tente: "Qual modelo de site gerou o maior retorno por hora neste mês?"','Tente: "Quanto recebi neste mês?"','Tente: "Quais empresas ainda não responderam?"','Ou use os filtros estruturados abaixo.']};
 return {ok:true,interp};
}
function periodoDe(tipo,agora=new Date()){if(tipo==='mes-anterior'){const r=periodoPadrao('mes',new Date(agora.getFullYear(),agora.getMonth()-1,15));return r;}if(tipo==='6m'||tipo==='3m'){const n=tipo==='6m'?6:3,de=new Date(agora.getFullYear(),agora.getMonth()-n,agora.getDate());return {tipo,de:de.getTime(),ate:agora.getTime(),completo:true,rotulo:`${de.toLocaleDateString('pt-BR')} a ${agora.toLocaleDateString('pt-BR')}`};}return periodoPadrao(tipo,agora);}
export function descreverInterpretacao(i){const mt=catalogoMetricas.find(x=>x.id===i.metrica);return [['Intenção',{escalar:'valor único',ranking:'ranking por grupo',lista:'lista de registros'}[i.intencao]],['Métrica',mt?.nome||i.predicado?.tipo||i.metrica||'—'],['Agrupamento',i.agrupamento||'—'],['Período',i.periodo],['Filtros',Object.entries(i.filtros).map(([k,v])=>k+': '+v).join('; ')||'nenhum'],['Ordenação',i.intencao==='ranking'?(i.ordem==='desc'?'maior para menor':'menor para maior'):'—'],['Limite',i.limite||'sem limite'],['Condição',i.predicado?JSON.stringify(i.predicado):'—']];}
export function executar(estado,interp,agora=new Date()){
 const m=construirModelo(estado,agora.getTime()),per=periodoDe(interp.periodo,agora),res={interp,periodo:per,limitacoes:[],registros:[],tabela:[],grafico:null,calculo:'',resposta:''};
 const f={};if(interp.filtros.nicho)f.nicho=interp.filtros.nicho;if(interp.filtros.cidade)f.cidade=interp.filtros.cidade;
 const mt=catalogoMetricas.find(x=>x.id===interp.metrica);
 if(interp.intencao==='escalar'){
  if(interp.filtros.somenteNaoFecharam){const ids=new Set(filtrarEmpresas(m,f).filter(e=>!ev(m,e.id).some(x=>x.tipo==='venda'||x.tipo==='proposta-aceita')).map(e=>e.id)),ss=m.sessoes.filter(s=>s.empresaId&&ids.has(s.empresaId)&&dentro(s.t,per));if(!m.sessoes.length){res.resposta='Não é possível responder: nenhuma sessão de trabalho foi registrada.';res.limitacoes.push('Falta registrar horas.');return res;}const h=soma(ss.map(s=>s.horas));res.resposta=`Foram registradas ${h.toLocaleString('pt-BR',{maximumFractionDigits:2})} h em empresas que não fecharam (${new Set(ss.map(s=>s.empresaId)).size} empresas).`;res.calculo='Σ duração das sessões vinculadas a empresas sem venda confirmada.';res.registros=ss.map(s=>reg('sessao',s.id,s.atividade,{empresaId:s.empresaId,horas:s.horas}));res.limitacoes.push('Sessões sem empresa vinculada não entram.');return res;}
  if(interp.metrica==='custos'&&interp.filtros.categoria){const cs=m.custos.filter(c=>dentro(c.t,per)&&(c.categoria===interp.filtros.categoria||c.tipo==='ferramenta'));if(!m.custos.length){res.resposta='Não há custos registrados.';return res;}const tot=soma(cs.map(c=>c.centavos));res.resposta=`Gastos com ${interp.filtros.categoria}: ${reais(tot)} em ${cs.length} lançamento(s).`;res.calculo=`Σ ${cs.map(c=>reais(c.centavos)).join(' + ')||'0'} = ${reais(tot)}`;res.registros=cs.map(c=>reg('custo',c.id,c.descricao,{valorCent:c.centavos,quando:c.quando}));return res;}
  const r=calcular(m,mt.metrica,f,per);res.resposta=`${mt.nome[0].toUpperCase()+mt.nome.slice(1)}: ${formatarValor(r)} (${per.rotulo}).`;res.calculo=r.passos.join(' ');res.registros=r.registros;res.limitacoes=r.limitacoes;res.tabela=[[mt.nome,formatarValor(r)]];if(r.valor==null)res.resposta+=' Motivo: '+r.passos[0];return res;
 }
 if(interp.intencao==='ranking'){
  if(interp.agrupamento==='mes'){const mp=new Map();const add=(t,v)=>{const d=new Date(t),k=d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0');mp.set(k,(mp.get(k)||0)+v);};if(interp.metrica==='receita')m.pagamentos.filter(p=>dentro(p.t,per)).forEach(p=>add(p.t,p.centavos));else if(interp.metrica==='custos')m.custos.filter(c=>dentro(c.t,per)).forEach(c=>add(c.t,c.centavos));else if(interp.metrica==='vendas')m.eventos.filter(e=>(e.tipo==='venda'||e.tipo==='proposta-aceita')&&dentro(e.t,per)).forEach(e=>add(e.t,1));else{res.resposta='Agrupamento mensal disponível para receita, custos e vendas.';res.limitacoes.push(res.resposta);return res;}const l=[...mp].sort((a,b)=>a[0].localeCompare(b[0]));res.tabela=l.map(([k,v])=>[k,mt.unid==='R$'?reais(v):v]);res.grafico={tipo:'barras',itens:l.map(([k,v])=>({rotulo:k,valor:v}))};res.resposta=l.length?`${mt.nome} por mês: ${l.map(([k,v])=>k+' '+(mt.unid==='R$'?reais(v):v)).join('; ')}.`:'Sem dados no período.';res.calculo='Soma dos registros por mês de ocorrência.';return res;}
  if(!mt.campo){res.resposta='Este indicador não possui agrupamento por grupo.';return res;}
  const g=agrupar(m,interp.agrupamento,f,per).filter(x=>x[mt.campo]!=null);if(!g.length){res.resposta='Não há dados suficientes para esse ranking: '+(mt.campo==='retornoHora'?'é preciso registrar horas e resultado por grupo.':'nenhum grupo possui o indicador calculável no período.');res.limitacoes.push(res.resposta);return res;}
  g.sort((a,b)=>interp.ordem==='desc'?b[mt.campo]-a[mt.campo]:a[mt.campo]-b[mt.campo]);const l=interp.limite?g.slice(0,interp.limite):g;const fmt=v=>mt.unid==='%'?(v*100).toFixed(1)+'%':mt.unid==='R$'||mt.unid==='R$/h'?reais(Math.round(v)):v.toLocaleString('pt-BR',{maximumFractionDigits:2});
  res.tabela=l.map(x=>[x.chave,fmt(x[mt.campo]),`n=${x.contatadas} contatadas`]);res.grafico={tipo:'barras',itens:l.map(x=>({rotulo:x.chave,valor:x[mt.campo]}))};res.registros=l.flatMap(x=>x.registros);
  res.resposta=`${l[0].chave} apresenta ${interp.ordem==='desc'?'o maior':'o menor'} valor de ${mt.nome}: ${fmt(l[0][mt.campo])} (${l[0].contatadas} empresa(s) contatada(s)).`;res.calculo=`Indicador "${mt.nome}" calculado por ${interp.agrupamento}; cada empresa entra uma vez no seu grupo.`;
  if(l[0].contatadas<10)res.limitacoes.push('Amostra pequena: com menos de 10 empresas contatadas o ranking pode mudar a cada novo registro.');if(g.length<2)res.limitacoes.push('Só existe um grupo com dados; não há comparação.');res.limitacoes.push('Ranking observacional: não indica que o grupo causou o resultado.');return res;
 }
 const p=interp.predicado||{},emps=filtrarEmpresas(m,f);let l=[];
 if(p.tipo==='sem-resposta')l=emps.filter(e=>{const msg=ev(m,e.id,'mensagem-enviada')[0];return msg&&!ev(m,e.id,'resposta').some(r=>r.t>=msg.t)&&(!p.comDemo||ev(m,e.id,'demonstracao-apresentada').length)&&e.situacao==='ativa';});
 else if(p.tipo==='com-demo')l=emps.filter(e=>ev(m,e.id,'demonstracao-apresentada').length);
 else if(p.tipo==='desconto-acima'){const ps=m.propostas.filter(x=>x.orig>0&&(x.orig-x.final)/x.orig*100>p.valor&&emps.some(e=>e.id===x.empresaId));res.tabela=ps.map(x=>[m.empresas.get(x.empresaId)?.nome,((x.orig-x.final)/x.orig*100).toFixed(1)+'%',reais(x.orig)+' → '+reais(x.final)]);res.registros=ps.map(x=>reg('proposta',x.id,m.empresas.get(x.empresaId)?.nome,{empresaId:x.empresaId,valorCent:x.final}));res.resposta=ps.length?`${ps.length} proposta(s) com desconto acima de ${p.valor}%.`:`Nenhuma proposta com desconto acima de ${p.valor}%.`;res.calculo='desconto = (valor original − valor final) ÷ valor original.';return res;}
 else if(p.tipo==='pagamentos-atrasados'){const fc=fluxoCaixa(m);const ps=fc.parcelasVencidas;res.tabela=ps.map(x=>[m.empresas.get(x.empresaId)?.nome,x.vencimento,reais(x.valor)]);res.registros=ps.map(x=>reg('proposta',x.propostaId,m.empresas.get(x.empresaId)?.nome,{empresaId:x.empresaId,valorCent:x.valor}));res.resposta=ps.length?`${ps.length} parcela(s) vencida(s) e não pagas.`:'Nenhuma parcela vencida registrada.';res.limitacoes.push('Só considera parcelas com vencimento cadastrado no cronograma da proposta.');if(fc.aReceberSemData.length)res.limitacoes.push(fc.aReceberSemData.length+' proposta(s) aceita(s) com saldo pendente não têm cronograma: não é possível dizer se estão atrasadas.');return res;}
 else if(p.tipo==='abaixo-minimo'){const min=estado.config.quant.minimoResultadoCent;if(min==null){res.resposta='Não é possível responder: o resultado mínimo não foi configurado em Quant → Configuração.';res.limitacoes.push(res.resposta);return res;}const rs=rentabilidadeProjetos(m).filter(r=>r.resultado!=null&&r.resultado<min);res.tabela=rs.map(r=>[r.nome,reais(r.resultado)]);res.registros=rs.map(r=>reg('empresa',r.empresaId,r.nome,{empresaId:r.empresaId}));res.resposta=rs.length?`${rs.length} projeto(s) abaixo de ${reais(min)}.`:'Nenhum projeto abaixo do mínimo configurado.';return res;}
 res.tabela=l.map(e=>[e.nome,e.cidade,e.etapa]);res.registros=l.map(e=>reg('empresa',e.id,e.nome,{empresaId:e.id}));res.resposta=l.length?`${l.length} empresa(s): ${l.slice(0,8).map(e=>e.nome).join(', ')}${l.length>8?'…':''}.`:'Nenhuma empresa corresponde.';res.calculo='Filtro aplicado sobre eventos reais registrados.';return res;
}
export function pergunta(estado,texto,agora){const i=interpretar(texto,estado);return i.ok?{...i,resultado:executar(estado,i.interp,agora)}:i;}
