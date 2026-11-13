/* Análises compostas sobre a camada central: agrupamentos, rentabilidade, decomposição, atribuição, jornadas, fluxo de caixa, capacidade, metas, anomalias e concentração. */
import {construirModelo,ev,filtrarEmpresas,dentro,reg,grupoAtividade,ESTADO} from './modelo.js';
import {soma,media,mediana,wilson,fisherExato,atipicosIQR,atipicosMAD,kaplanMeier,herfindahl,concentracao,descrever,mannWhitney} from './estatistica.js';
import {reais,aCentavos,margem,retornoPorHora,dividirParcelas} from './financas.js';
import {calcular} from './metricas.js';
const nome=(m,id)=>m.empresas.get(id)?.nome||'?';
export const dimensoes={nicho:e=>e.nicho||'(sem nicho)',cidade:e=>(e.cidade||'(sem cidade)').split(/[-,/]/)[0].trim(),uf:e=>(String(e.cidade||'').match(/[-,/ ]\s*([A-Za-z]{2})\s*$/)||[])[1]?.toUpperCase()||'(sem UF)',fonte:e=>e.fonte||'(sem origem)',statusSite:e=>e.statusSite,contatoDireto:e=>e.contatoDireto};
export function modeloVendido(m,empresaId){const p=m.propostas.filter(x=>x.empresaId===empresaId&&x.estado==='aceita').at(-1);const d=p&&m.demos.get(p.demonstracaoId);return d?.modeloId||null;}
export function modelosApresentados(m,empresaId){return [...new Set(ev(m,empresaId,'demonstracao-apresentada').map(e=>m.demos.get(e.demonstracaoId)?.modeloId).filter(Boolean))];}
export function modeloEscolhido(m,empresaId){const e=m.empresas.get(empresaId);return e?.modelo||e?.modeloEstudio||null;}
function chaveEmpresa(m,e,dim){if(dim in dimensoes)return [dimensoes[dim](e)];if(dim==='estrategia')return [ev(m,e.id,'mensagem-enviada')[0]?.estrategia||'(sem estratégia)'];if(dim==='versao')return [ev(m,e.id,'mensagem-enviada')[0]?.variante||'(sem versão)'];if(dim==='modelo')return [modeloVendido(m,e.id)||'(sem modelo vendido)'];if(dim==='modeloApresentado')return modelosApresentados(m,e.id).length?modelosApresentados(m,e.id):['(nenhum apresentado)'];if(dim==='etapa')return [e.etapa];if(dim==='situacao')return [e.situacao];if(dim==='diaSemana'){const t=ev(m,e.id,'mensagem-enviada')[0]?.t;return [t==null?'(sem contato)':['dom','seg','ter','qua','qui','sex','sáb'][new Date(t).getDay()]];}if(dim==='hora'){const t=ev(m,e.id,'mensagem-enviada')[0]?.t;return [t==null?'(sem contato)':String(new Date(t).getHours()).padStart(2,'0')+'h'];}return ['(?)'];}
/* Agrupa EMPRESAS (cada empresa entra uma vez por grupo; receita não é multiplicada) */
export function agrupar(m,dim,filtros={},periodo={de:null,ate:null}){
 const grupos=new Map();
 for(const e of filtrarEmpresas(m,filtros)){
  const msgs=ev(m,e.id,'mensagem-enviada'),contatada=msgs.length&&dentro(msgs[0].t,periodo);
  const pags=m.pagamentos.filter(p=>p.empresaId===e.id&&dentro(p.t,periodo)),cust=m.custos.filter(c=>c.empresaId===e.id&&dentro(c.t,periodo)),ses=m.sessoes.filter(s=>s.empresaId===e.id&&dentro(s.t,periodo));
  const vend=ev(m,e.id).find(x=>x.tipo==='venda'||x.tipo==='proposta-aceita'),temAlgo=contatada||pags.length||cust.length||ses.length;
  if(!temAlgo)continue;
  const prop=m.propostas.filter(x=>x.empresaId===e.id&&x.estado==='aceita').at(-1);
  const linha={e,contatada:!!contatada,respondeu:contatada&&ev(m,e.id,'resposta').some(r=>r.t>=msgs[0].t),demo:contatada&&ev(m,e.id,'demonstracao-apresentada').length>0,proposta:contatada&&ev(m,e.id,'proposta-enviada').length>0,vendeu:contatada&&!!vend,recebido:soma(pags.map(p=>p.centavos)),custos:soma(cust.map(c=>c.centavos)),temCusto:cust.length>0,horas:soma(ses.map(s=>s.horas)),temHoras:ses.length>0,contratado:prop?prop.final:null,desconto:prop&&prop.orig>0?(prop.orig-prop.final)/prop.orig:null,diasFechamento:vend&&msgs[0]?(vend.t-msgs[0].t)/864e5:null};
  for(const k of chaveEmpresa(m,e,dim)){if(!grupos.has(k))grupos.set(k,[]);grupos.get(k).push(linha);}
 }
 return [...grupos].map(([chave,ls])=>{const cont=ls.filter(l=>l.contatada),vend=cont.filter(l=>l.vendeu),rec=soma(ls.map(l=>l.recebido)),cus=soma(ls.map(l=>l.custos)),hr=soma(ls.map(l=>l.horas)),contr=ls.filter(l=>l.contratado!=null&&l.vendeu).map(l=>l.contratado);
  const temC=ls.some(l=>l.temCusto),temH=ls.some(l=>l.temHoras);
  return {chave,empresas:ls.length,contatadas:cont.length,responderam:cont.filter(l=>l.respondeu).length,demos:cont.filter(l=>l.demo).length,propostas:cont.filter(l=>l.proposta).length,vendas:vend.length,
   taxaResposta:cont.length?cont.filter(l=>l.respondeu).length/cont.length:null,icResposta:wilson(cont.filter(l=>l.respondeu).length,cont.length),taxaFechamento:cont.length?vend.length/cont.length:null,icFechamento:wilson(vend.length,cont.length),
   recebido:rec,contratado:soma(contr),ticket:contr.length?Math.round(soma(contr)/contr.length):null,ticketMediano:contr.length?mediana(contr):null,descontoMedio:media(ls.map(l=>l.desconto).filter(x=>x!=null)),custos:temC?cus:null,horas:temH?hr:null,
   resultado:temC||rec>0?rec-cus:null,margem:rec>0&&temC?margem(rec,cus):null,retornoHora:temH&&hr>0&&(temC||rec>0)?retornoPorHora(rec-cus,hr):null,diasFechamento:mediana(ls.map(l=>l.diasFechamento).filter(x=>x!=null)),
   semCusto:ls.some(l=>l.vendeu)&&!temC,semHoras:ls.some(l=>l.vendeu)&&!temH,registros:ls.map(l=>reg('empresa',l.e.id,l.e.nome,{empresaId:l.e.id}))};}).sort((a,b)=>b.contatadas-a.contatadas||b.recebido-a.recebido);
}
/* Rentabilidade por projeto (empresa com proposta aceita) */
export function rentabilidadeProjetos(m){
 const cfg=m.config.quant,linhas=[];
 for(const [id,e] of m.empresas){const prop=m.propostas.filter(x=>x.empresaId===id&&x.estado==='aceita').at(-1);if(!prop)continue;
  const pags=m.pagamentos.filter(p=>p.empresaId===id),rec=soma(pags.map(p=>p.centavos)),cust=m.custos.filter(c=>c.empresaId===id),ses=m.sessoes.filter(s=>s.empresaId===id),horas=soma(ses.map(s=>s.horas)),pv=m.posVenda.filter(x=>x.empresaId===id);
  const horasSuporte=soma(ses.filter(s=>grupoAtividade(s.atividade)==='pos').map(s=>s.horas)),custo=soma(cust.map(c=>c.centavos)),res=rec-custo;
  const faltas=[];if(!ses.length)faltas.push('nenhuma hora registrada neste projeto');if(!cust.length)faltas.push('nenhum custo registrado neste projeto');if(!rec)faltas.push('nenhum pagamento confirmado');
  const vh=cfg.valorHoraCent,custoTrabalho=vh!=null&&horas?Math.round(horas*vh):null;
  linhas.push({empresaId:id,nome:e.nome,propostaId:prop.id,modelo:modeloVendido(m,id),acordado:prop.final,original:prop.orig,descontoPct:prop.orig>0?(prop.orig-prop.final)/prop.orig*100:null,recebido:rec,custos:cust.length?custo:null,horas:ses.length?horas:null,horasSuporte:ses.length?horasSuporte:null,
   resultado:cust.length||rec?res:null,margem:rec&&cust.length?margem(rec,custo):null,retornoHora:ses.length&&horas>0?retornoPorHora(res,horas):null,resultadoEconomico:custoTrabalho!=null?res-custoTrabalho:null,
   precoMinimo:cust.length?custo:null,precoParaHora:vh!=null&&ses.length?custo+Math.round(horas*vh):null,precoParaMargem:cfg.margemAlvo!=null&&cust.length&&cfg.margemAlvo<1?Math.ceil(custo/(1-cfg.margemAlvo)):null,
   abaixoMinimo:cust.length?prop.final<custo:null,suporteAberto:pv.some(x=>x.estado!=='concluido'),faltas,estadoRentabilidade:faltas.length?`parcial: ${faltas.join('; ')}`:'completo'});}
 return linhas;
}
/* Decomposição preço-volume-mix (grupos comuns) com novos/perdidos; soma exata. valores em centavos */
export function decomposicaoPVM(g0,g1){ // g: {chave:{n,receita}}
 const ch0=Object.keys(g0),ch1=Object.keys(g1),comuns=ch0.filter(k=>k in g1&&g0[k].n>0&&g1[k].n>0),novos=ch1.filter(k=>!comuns.includes(k)&&g1[k].n>0),perdidos=ch0.filter(k=>!comuns.includes(k)&&g0[k].n>0);
 const N0=soma(comuns.map(k=>g0[k].n)),N1=soma(comuns.map(k=>g1[k].n)),R0=soma(comuns.map(k=>g0[k].receita));
 const p0=k=>g0[k].receita/g0[k].n,p1=k=>g1[k].receita/g1[k].n;
 const volume=N0?(N1-N0)*R0/N0:0,mix=N0&&N1?soma(comuns.map(k=>N1*(g1[k].n/N1-g0[k].n/N0)*p0(k))):0,preco=soma(comuns.map(k=>g1[k].n*(p1(k)-p0(k))));
 const novo=soma(novos.map(k=>g1[k].receita)),perdido=-soma(perdidos.map(k=>g0[k].receita));
 const total0=soma(ch0.map(k=>g0[k].receita)),total1=soma(ch1.map(k=>g1[k].receita)),delta=total1-total0,soma_=volume+mix+preco+novo+perdido;
 return {total0,total1,delta,efeitos:{volume,mix,preco,novosGrupos:novo,gruposPerdidos:perdido},residuo:delta-soma_,comuns,novos,perdidos,metodo:'Preço-volume-mix sobre grupos presentes nos dois períodos; grupos novos/perdidos separados. Efeito contábil, não causal.'};
}
/* Shapley exato para Receita = N × Plista × (1 − d) */
export function shapleyReceita(f0,f1){
 const nomes=Object.keys(f0),v=S=>nomes.reduce((acc,k)=>acc*(S.has(k)?f1[k]:f0[k]),1),fat=n=>n<=1?1:n*fat(n-1);
 const out={};for(const k of nomes){let s=0;const outros=nomes.filter(x=>x!==k);for(let mask=0;mask<1<<outros.length;mask++){const S=new Set(outros.filter((_,i)=>mask>>i&1));const peso=fat(S.size)*fat(nomes.length-S.size-1)/fat(nomes.length);const S2=new Set(S);S2.add(k);s+=peso*(v(S2)-v(S));}out[k]=s;}
 const total=v(new Set(nomes))-v(new Set());return {contribuicoes:out,total,residuo:total-soma(Object.values(out)),metodo:'Valor de Shapley: média da contribuição marginal de cada fator em todas as ordens de substituição do período inicial para o final (distribui as interações entre fatores).'};
}
export function decomporPeriodos(m,p0,p1,filtros={},dim='nicho'){
 const g=(p)=>{const r={};for(const e of filtrarEmpresas(m,filtros)){const k=chaveEmpresa(m,e,dim)[0];const vs=ev(m,e.id).filter(x=>(x.tipo==='venda'||x.tipo==='proposta-aceita')&&dentro(x.t,p))[0];if(!vs)continue;const prop=m.propostas.filter(x=>x.empresaId===e.id&&x.estado==='aceita').at(-1);if(!prop)continue;(r[k]??={n:0,receita:0,lista:0});r[k].n++;r[k].receita+=prop.final;r[k].lista+=prop.orig;}return r;};
 const g0=g(p0),g1=g(p1),pvm=decomposicaoPVM(g0,g1);
 const agg=(x)=>{const N=soma(Object.values(x).map(v=>v.n)),R=soma(Object.values(x).map(v=>v.receita)),L=soma(Object.values(x).map(v=>v.lista));return {N,Plista:N?L/N:0,K:L?R/L:0,R};};
 const a0=agg(g0),a1=agg(g1),sh=a0.N&&a1.N&&a0.Plista&&a1.Plista?shapleyReceita({volume:a0.N,precoLista:a0.Plista,fatorDesconto:a0.K},{volume:a1.N,precoLista:a1.Plista,fatorDesconto:a1.K}):null;
 return {pvm,shapley:sh,agregados:[a0,a1],grupos:[g0,g1],disponivel:!!(a0.N||a1.N),aviso:'As contribuições são contábeis: mostram de onde a variação veio nos números, não por que o cliente comprou.'};
}
/* Atribuição descritiva multitoque */
export function atribuicao(m,{meiaVidaDias=null}={}){
 const metodos=['primeiro','ultimo','linear','temporal'],porMetodo=Object.fromEntries(metodos.map(k=>[k,{}])),vendasAtr=[];
 for(const [id] of m.empresas){const v=ev(m,id).find(x=>x.tipo==='venda'||x.tipo==='proposta-aceita');if(!v)continue;const prop=m.propostas.filter(x=>x.empresaId===id&&x.estado==='aceita').at(-1);const valor=prop?prop.final:(v.valor!=null?aCentavos(v.valor):null);if(valor==null)continue;
  const toques=ev(m,id).filter(x=>['mensagem-enviada','demonstracao-apresentada','proposta-enviada'].includes(x.tipo)&&x.t<=v.t);if(!toques.length)continue;
  const rot=t=>t.tipo==='mensagem-enviada'?'mensagem: '+(t.estrategia||'sem estratégia'):t.tipo==='demonstracao-apresentada'?'demonstração: '+(m.demos.get(t.demonstracaoId)?.modeloId||'?'):'proposta enviada';
  const peso={primeiro:toques.map((_,i)=>i===0?1:0),ultimo:toques.map((_,i)=>i===toques.length-1?1:0),linear:toques.map(()=>1/toques.length),temporal:meiaVidaDias?toques.map(t=>.5**((v.t-t.t)/864e5/meiaVidaDias)):null};
  for(const k of metodos){const w=peso[k];if(!w)continue;const sw=soma(w),cred=w.map(x=>Math.floor(valor*x/sw));let resto=valor-soma(cred);for(let i=cred.length-1;i>=0&&resto>0;i--)if(w[i]>0){cred[i]++;resto--;}toques.forEach((t,i)=>{if(cred[i]){const r=rot(t);porMetodo[k][r]=(porMetodo[k][r]||0)+cred[i];}});}
  vendasAtr.push({empresaId:id,valor,toques:toques.length});}
 const ranking=Object.fromEntries(metodos.filter(k=>Object.keys(porMetodo[k]).length).map(k=>[k,Object.entries(porMetodo[k]).sort((a,b)=>b[1]-a[1])]));
 const tops=Object.values(ranking).map(r=>r[0]?.[0]);const concordam=tops.length>1&&tops.every(t=>t===tops[0]);
 return {porMetodo,ranking,vendas:vendasAtr,totalAtribuido:Object.fromEntries(metodos.map(k=>[k,soma(Object.values(porMetodo[k]))])),totalVendas:soma(vendasAtr.map(v=>v.valor)),concordam,temporalConfigurado:!!meiaVidaDias,aviso:'Crédito atribuído é uma regra de repartição do valor da venda entre as interações registradas; não é receita causada por uma mensagem ou demonstração.'};
}
/* Jornadas e mineração de processos */
const rotuloEvento=e=>({'mensagem-enviada':'Mensagem','resposta':'Resposta','demonstracao-apresentada':'Demonstração','proposta-enviada':'Proposta','proposta-aceita':'Aceite','venda':'Venda','pagamento':'Pagamento','perda':'Perda','proposta-recusada':'Recusa'}[e.tipo]);
export function jornadas(m,filtros={}){
 const out=[];for(const e of filtrarEmpresas(m,filtros)){const passos=ev(m,e.id).map(x=>({r:rotuloEvento(x),t:x.t,id:x.id})).filter(x=>x.r);if(!passos.length)continue;out.push({empresa:e,passos,sequencia:passos.map(x=>x.r),resultado:passos.some(x=>x.r==='Venda'||x.r==='Aceite')?'vendeu':passos.some(x=>x.r==='Perda'||x.r==='Recusa')?'perdeu':'em andamento',duracaoDias:(passos.at(-1).t-passos[0].t)/864e5});}
 return out;
}
export function variantesProcesso(js){const c=new Map();for(const j of js){const k=j.sequencia.join(' → ');if(!c.has(k))c.set(k,{sequencia:k,n:0,vendas:0,perdas:0,empresas:[]});const v=c.get(k);v.n++;if(j.resultado==='vendeu')v.vendas++;if(j.resultado==='perdeu')v.perdas++;v.empresas.push(j.empresa.id);}return [...c.values()].sort((a,b)=>b.n-a.n);}
export function matrizTransicao(js){const c={};for(const j of js)for(let i=0;i<j.sequencia.length-1;i++){const a=j.sequencia[i],b=j.sequencia[i+1];(c[a]??={})[b]=(c[a][b]||0)+1;}return c;}
export function fluxosSankey(js){const l=new Map();for(const j of js)for(let i=0;i<j.passos.length-1;i++){const k=`${i}:${j.sequencia[i]}|${i+1}:${j.sequencia[i+1]}`;l.set(k,(l.get(k)||0)+1);}return [...l].map(([k,n])=>{const [a,b]=k.split('|');return {de:a,para:b,n};});}
export function sobrevivencia(m,{evento,filtros={}}){ // evento: 'resposta' | 'venda'
 const obs=[];for(const e of filtrarEmpresas(m,filtros)){const msgs=ev(m,e.id,'mensagem-enviada');if(!msgs.length)continue;const t0=msgs[0].t;const alvo=ev(m,e.id).find(x=>(evento==='venda'?(x.tipo==='venda'||x.tipo==='proposta-aceita'):x.tipo===evento)&&x.t>=t0);const encerrada=ev(m,e.id,'perda').length>0||['nao-contatar','recusada','perdida'].includes(e.situacao);
  if(alvo)obs.push({t:(alvo.t-t0)/864e5,evento:true,empresaId:e.id});else obs.push({t:((encerrada?(ev(m,e.id,'perda').at(-1)?.t||m.agora):m.agora)-t0)/864e5,evento:false,empresaId:e.id,encerrada});}
 return {km:kaplanMeier(obs),obs};
}
/* Fluxo de caixa */
export function fluxoCaixa(m,periodo={de:null,ate:null}){
 const si=m.config.quant.saldoInicial,ent=m.pagamentos.filter(p=>dentro(p.t,periodo)).map(p=>({tipo:'entrada',id:p.id,quando:p.quando,t:p.t,valor:p.centavos,empresaId:p.empresaId,rotulo:nome(m,p.empresaId)})),sai=m.custos.filter(c=>dentro(c.t,periodo)).map(c=>({tipo:'saida',id:c.id,quando:c.quando,t:c.t,valor:-c.centavos,empresaId:c.empresaId,rotulo:c.descricao}));
 const linha=[...ent,...sai].sort((a,b)=>a.t-b.t);const E=soma(ent.map(x=>x.valor)),S=-soma(sai.map(x=>x.valor));
 let saldo=si?si.valorCent:null;const serie=linha.map(l=>{if(saldo!=null)saldo+=l.valor;return {...l,saldo};});
 const parcelas=[];for(const p of m.propostas.filter(x=>x.estado==='aceita'))for(const c of p.cronograma||[]){const paga=!!c.pagamentoId;parcelas.push({propostaId:p.id,empresaId:p.empresaId,id:c.id,vencimento:c.vencimento,valor:aCentavos(c.valor),paga,vencida:!paga&&new Date(c.vencimento).getTime()<m.agora});}
 const semCronograma=m.propostas.filter(x=>x.estado==='aceita'&&!(x.cronograma||[]).length).map(x=>({propostaId:x.id,empresaId:x.empresaId,pendente:Math.max(0,x.final-soma(m.pagamentos.filter(y=>y.propostaId===x.id).map(y=>y.centavos)))})).filter(x=>x.pendente>0);
 return {saldoInicialInformado:!!si,saldoInicial:si?si.valorCent:null,entradas:E,saidas:S,fluxoLiquido:E-S,saldoFinal:si?si.valorCent+E-S:null,serie,parcelasAReceber:parcelas.filter(x=>!x.paga),parcelasVencidas:parcelas.filter(x=>x.vencida),aReceberSemData:semCronograma,
  aviso:si?'':'Saldo inicial não informado: o saldo absoluto da operação não pode ser calculado corretamente; mostramos apenas o fluxo líquido do período.'};
}
export function agruparTempo(linhas,gran='mes'){const k=t=>{const d=new Date(t);if(gran==='dia')return d.toISOString().slice(0,10);if(gran==='ano')return String(d.getFullYear());if(gran==='semana'){const x=new Date(d);x.setDate(d.getDate()-((d.getDay()+6)%7));return x.toISOString().slice(0,10);}return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0');};const mp=new Map();for(const l of linhas){const c=k(l.t);if(!mp.has(c))mp.set(c,{periodo:c,entradas:0,saidas:0});const r=mp.get(c);if(l.valor>0)r.entradas+=l.valor;else r.saidas-=l.valor;}return [...mp.values()].sort((a,b)=>a.periodo.localeCompare(b.periodo));}
/* Concentração e Pareto */
export function concentracaoReceita(m,dim='empresa',periodo={de:null,ate:null}){
 const mp=new Map();for(const p of m.pagamentos.filter(x=>dentro(x.t,periodo))){const e=m.empresas.get(p.empresaId);if(!e)continue;const k=dim==='empresa'?e.nome:dim==='modelo'?(modeloVendido(m,e.id)||'(sem modelo)'):dim==='estrategia'?(ev(m,e.id,'mensagem-enviada')[0]?.estrategia||'(sem estratégia)'):chaveEmpresa(m,e,dim)[0];mp.set(k,(mp.get(k)||0)+p.centavos);}
 const itens=[...mp].map(([chave,valor])=>({chave,valor})).sort((a,b)=>b.valor-a.valor),v=itens.map(i=>i.valor),tot=soma(v);let acc=0;const pareto=itens.map(i=>({...i,pct:tot?i.valor/tot:null,acum:(acc+=i.valor)/tot}));
 return {itens:pareto,total:tot,cr1:concentracao(v,1),cr3:concentracao(v,3),hhi:herfindahl(v),n:itens.length};
}
/* Metas */
export const tiposMeta={receita:{nome:'Receita recebida',metrica:'valor_recebido',unid:'R$'},resultado:{nome:'Resultado financeiro',metrica:'resultado_financeiro',unid:'R$'},vendas:{nome:'Vendas',metrica:'vendas',unid:'vendas'},contatos:{nome:'Empresas contatadas',metrica:'empresas_contatadas',unid:'empresas'},demonstracoes:{nome:'Demonstrações apresentadas',metrica:'empresas_demo',unid:'empresas'},horas:{nome:'Horas trabalhadas',metrica:'horas',unid:'h'},retorno_hora:{nome:'Retorno por hora',metrica:'retorno_por_hora',unid:'R$/h'}};
export function acompanharMeta(m,meta,agora=m.agora){
 const def=tiposMeta[meta.tipo],per={de:new Date(meta.de).getTime(),ate:new Date(meta.ate).getTime()},r=calcular(m,def.metrica,{},per),realizado=r.valor,alvo=def.unid.startsWith('R$')?meta.alvo*100:meta.alvo;
 const dec=Math.max(0,Math.min(agora,per.ate)-per.de)/864e5,rest=Math.max(0,per.ate-agora)/864e5,faltante=realizado==null?alvo:Math.max(0,alvo-realizado);
 const cumulativa=!['retorno_hora'].includes(meta.tipo);
 return {meta,def,realizado,estado:r.estado,alvo,percentual:realizado!=null&&alvo?realizado/alvo*100:null,faltante,diasRestantes:Math.ceil(rest),ritmoDiario:cumulativa&&realizado!=null&&dec>0?realizado/dec:null,necessarioPorDia:cumulativa&&rest>0?faltante/rest:null,
  vendasNecessarias:meta.valorUnitario&&faltante>0&&['receita','resultado'].includes(meta.tipo)?Math.ceil(faltante/(meta.valorUnitario*100)):null,passos:r.passos,registros:r.registros,aviso:'Valores "necessários" são exigências matemáticas para atingir a meta, não previsão de fechamento.'};
}
/* Anomalias */
export function anomalias(m,{limiteDesconto}={}){
 const lim=limiteDesconto??m.config.quant.limiteDescontoPct,out=[];
 const props=m.propostas.filter(p=>['enviada','aceita'].includes(p.estado)&&p.orig>0);const desc=props.map(p=>(p.orig-p.final)/p.orig*100);
 const a=atipicosMAD(desc);a.indices.forEach(i=>out.push({tipo:'desconto-atipico',nivel:'investigar',titulo:`Desconto fora do padrão: ${nome(m,props[i].empresaId)} (${desc[i].toFixed(1)}%)`,referencia:`mediana ${mediana(desc).toFixed(1)}% e MAD ${(descrever(desc).n?mad2(desc):0).toFixed(1)}`,registros:[reg('proposta',props[i].id,nome(m,props[i].empresaId),{empresaId:props[i].empresaId})],limitacao:'Poucas propostas deixam o critério instável; investigue, não exclua.'}));
 props.forEach((p,i)=>{if(desc[i]>lim)out.push({tipo:'desconto-acima-limite',nivel:'alerta',titulo:`Desconto de ${desc[i].toFixed(1)}% acima do limite configurado (${lim}%): ${nome(m,p.empresaId)}`,referencia:`limite ${lim}%`,registros:[reg('proposta',p.id,nome(m,p.empresaId),{empresaId:p.empresaId})],limitacao:'O limite é uma configuração sua.'});});
 const rent=rentabilidadeProjetos(m);const hs=rent.filter(r=>r.horas!=null).map(r=>r.horas);atipicosIQR(hs).indices.forEach(i=>{const r=rent.filter(x=>x.horas!=null)[i];out.push({tipo:'projeto-longo',nivel:'investigar',titulo:`Projeto com horas muito acima dos demais: ${r.nome} (${r.horas.toFixed(1)} h)`,referencia:`IQR sobre ${hs.length} projetos`,registros:[reg('empresa',r.empresaId,r.nome,{empresaId:r.empresaId})],limitacao:'Exige ao menos 4 projetos com horas.'});});
 const pr=Object.entries({a:[],b:[]});void pr;
 return out;
}
const mad2=v=>{const md=mediana(v);return mediana(v.map(x=>Math.abs(x-md)));};
export function mudancaTaxa(m,p0,p1,id='taxa_resposta'){const a=calcular(m,id,{},p0),b=calcular(m,id,{},p1);if(!a.denominador||!b.denominador)return {possivel:false,motivo:'Um dos períodos não tem empresas contatadas.'};const p=fisherExato(a.numerador,a.denominador-a.numerador,b.numerador,b.denominador-b.numerador);const suf=a.denominador>=10&&b.denominador>=10;return {possivel:true,antes:a.valor,depois:b.valor,diferencaPP:b.valor-a.valor,p,n0:a.denominador,n1:b.denominador,suficiente:suf,conclusao:!suf?'Amostra insuficiente em pelo menos um período: a diferença pode ser acaso.':p<.05?'Diferença improvável de ser acaso (teste exato de Fisher), mas não prova causa.':'Diferença compatível com variação aleatória.',registros:[...a.registros,...b.registros]};}
/* Capacidade, filas, caminho crítico e priorização */
export function capacidade(m,{horizonteSemanas=4}={}){
 const cfg=m.config.quant,abertas=m.tarefas.filter(t=>!['concluida','cancelada'].includes(t.estado)),semDur=abertas.filter(t=>t.duracaoH==null),comDur=abertas.filter(t=>t.duracaoH!=null);
 const comprometido=soma(comDur.map(t=>t.duracaoH)),disp=cfg.horasSemanaDisponiveis!=null?cfg.horasSemanaDisponiveis*horizonteSemanas:null;
 const concl=m.tarefas.filter(t=>t.estado==='concluida'&&t.concluidaEm&&t.criadaEm),ciclo=concl.map(t=>(new Date(t.concluidaEm)-new Date(t.criadaEm))/864e5);
 const janela=concl.length?(Math.max(...concl.map(t=>new Date(t.concluidaEm).getTime()))-Math.min(...concl.map(t=>new Date(t.criadaEm).getTime())))/864e5:0;
 const lambda=janela>0?concl.length/janela:null,W=media(ciclo),L=lambda!=null&&W!=null?lambda*W:null;
 return {abertas:abertas.length,semDuracao:semDur.map(t=>t.id),comprometidoH:comDur.length?comprometido:null,disponivelH:disp,ocupacao:disp&&comDur.length?comprometido/disp:null,sobrecarga:disp!=null&&comprometido>disp,cicloMedioDias:W,cicloMedianoDias:mediana(ciclo),taxaConclusaoPorDia:lambda,littleL:L,wipObservado:abertas.length,littleOk:L!=null&&concl.length>=5,
  aviso:disp==null?'Horas disponíveis por semana não informadas: capacidade e ocupação não podem ser calculadas.':'',littleNota:concl.length<5?'Lei de Little exige histórico de pelo menos 5 tarefas concluídas com datas; sem isso, não é aplicada.':'L = λ·W só é válida em regime estável (entrada ≈ saída); compare L com o WIP observado.'};
}
export function caminhoCritico(tarefas){
 const mp=new Map(tarefas.map(t=>[t.id,t])),faltam=tarefas.filter(t=>t.duracaoH==null).map(t=>t.id);if(faltam.length)return {possivel:false,motivo:'Durações ausentes em '+faltam.length+' tarefa(s); o caminho crítico não pode ser calculado sem inventar durações.',faltam};
 const ef=new Map(),pred=new Map(),visit=new Set(),stack=new Set();let ciclo=false;
 const f=id=>{if(ef.has(id))return ef.get(id);if(stack.has(id)){ciclo=true;return 0;}stack.add(id);const t=mp.get(id);let es=0,p=null;for(const d of t.dependeDe||[]){if(!mp.has(d))continue;const v=f(d);if(v>es){es=v;p=d;}}stack.delete(id);pred.set(id,p);const v=es+t.duracaoH;ef.set(id,v);return v;};
 tarefas.forEach(t=>f(t.id));if(ciclo)return {possivel:false,motivo:'Há dependência circular entre as tarefas.'};
 const fim=[...ef].sort((a,b)=>b[1]-a[1])[0];if(!fim)return {possivel:false,motivo:'Sem tarefas.'};const caminho=[];let c=fim[0];while(c){caminho.unshift(c);c=pred.get(c);}
 return {possivel:true,duracaoTotalH:fim[1],caminho,termino:Object.fromEntries(ef)};
}
export function priorizarTarefas(tarefas,horasDisponiveis){ // mochila 0/1 exata: maximiza valor (centavos) informado, só tarefas com duração e valor conhecidos
 const el=tarefas.filter(t=>t.duracaoH>0&&t.valorCent>0&&!['concluida','cancelada'].includes(t.estado)),ign=tarefas.filter(t=>!el.includes(t)&&!['concluida','cancelada'].includes(t.estado));
 if(horasDisponiveis==null)return {possivel:false,motivo:'Horas disponíveis não informadas.'};
 const u=4,W=Math.floor(horasDisponiveis*u),w=el.map(t=>Math.max(1,Math.round(t.duracaoH*u))),dp=Array.from({length:el.length+1},()=>new Array(W+1).fill(0));
 for(let i=1;i<=el.length;i++)for(let c=0;c<=W;c++){dp[i][c]=dp[i-1][c];if(w[i-1]<=c)dp[i][c]=Math.max(dp[i][c],dp[i-1][c-w[i-1]]+el[i-1].valorCent);}
 const esc=[];let c=W;for(let i=el.length;i>0;i--)if(dp[i][c]!==dp[i-1][c]){esc.push(el[i-1]);c-=w[i-1];}
 return {possivel:true,escolhidas:esc.reverse(),valorTotal:dp[el.length][W],horasUsadas:soma(esc.map(t=>t.duracaoH)),ignoradasPorFaltaDeDados:ign.map(t=>t.id),metodo:'Programação inteira (mochila 0/1) exata sobre durações e valores informados por você; não usa probabilidades.'};
}
