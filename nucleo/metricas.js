const h=36e5;
export function wilson(x,n,z=1.96){if(!n)return null;const p=x/n,d=1+z*z/n,c=p+z*z/(2*n),m=z*Math.sqrt(p*(1-p)/n+z*z/(4*n*n));return {baixo:Math.max(0,(c-m)/d),alto:Math.min(1,(c+m)/d)};}
export function testeDuasProporcoes(x1,n1,x2,n2){if(!n1||!n2)return null;const p=(x1+x2)/(n1+n2),ep=Math.sqrt(p*(1-p)*(1/n1+1/n2));if(!ep)return {z:0,p:1};const z=(x1/n1-x2/n2)/ep;const phi=v=>{const t=1/(1+.2316419*Math.abs(v)),d=.3989423*Math.exp(-v*v/2),pr=d*t*(.3193815+t*(-.3565638+t*(1.781478+t*(-1.821256+t*1.330274))));return v>0?1-pr:pr;};return {z,p:Math.min(1,2*(1-phi(Math.abs(z))))};}
const mediaDe=l=>l.length?l.reduce((a,b)=>a+b,0)/l.length:null;
const mediana=l=>{if(!l.length)return null;const s=[...l].sort((a,b)=>a-b),m=Math.floor(s.length/2);return s.length%2?s[m]:(s[m-1]+s[m])/2;};
export const faixasPreco=[[0,500,'Até R$ 499'],[500,800,'R$ 500 a 799'],[800,1200,'R$ 800 a 1.199'],[1200,Infinity,'R$ 1.200 ou mais']];
const faixa=v=>v==null?'Sem valor informado':faixasPreco.find(([a,b])=>v>=a&&v<b)?.[2]||'Sem valor informado';
export function calcularLaboratorio(estado,{desde='',ate='',nicho='',agora=Date.now()}={}){
 const porEmpresa=new Map();for(const ev of estado.eventos.filter(x=>!x.revertido)){if(!porEmpresa.has(ev.empresaId))porEmpresa.set(ev.empresaId,[]);porEmpresa.get(ev.empresaId).push(ev);}
 const t0=desde?new Date(desde).getTime():-Infinity,t1=ate?new Date(ate+'T23:59:59').getTime():Infinity;
 const linhas=[];
 for(const e of estado.empresas){
  if(nicho&&e.nicho!==nicho)continue;const evs=(porEmpresa.get(e.id)||[]).slice().sort((a,b)=>a.quando.localeCompare(b.quando)),msgs=evs.filter(x=>x.tipo==='mensagem-enviada');
  if(!msgs.length)continue;const primeira=new Date(msgs[0].quando).getTime();if(primeira<t0||primeira>t1)continue;
  const resp=evs.filter(x=>x.tipo==='resposta'&&x.quando>=msgs[0].quando),demo=evs.filter(x=>x.tipo==='demonstracao-apresentada'),prop=evs.filter(x=>x.tipo==='proposta-enviada'),venda=evs.find(x=>x.tipo==='venda'||x.tipo==='proposta-aceita'),perda=evs.filter(x=>x.tipo==='perda').at(-1);
  const etapas=new Set(evs.filter(x=>x.tipo==='etapa').map(x=>x.para));etapas.add(e.etapa);
  const interessada=resp.length>0&&(['medio','alto'].includes(e.interesse)||resp.some(r=>['medio','alto'].includes(r.interesse)||r.pediuDemo));
  const negociou=etapas.has('negociacao')||etapas.has('proposta')||etapas.has('fechada')||prop.length>0;
  const valorProp=estado.propostas.filter(p=>p.empresaId===e.id).at(-1)?.valorFinal;
  linhas.push({empresa:e,nicho:e.nicho||'sem-nicho',estrategia:msgs[0].estrategia||'sem estratégia',tipoMsg:msgs[0].tipoMsg||'',primeira,respondeu:resp.length>0,interessada,demo:demo.length>0,negociou,fechou:!!venda&&(e.etapa==='fechada'||evs.some(x=>x.tipo==='venda')||estado.propostas.some(p=>p.empresaId===e.id&&p.estado==='aceita')),proposta:prop.length>0,perda:perda?.motivo||'',horasResposta:resp.length?(new Date(resp[0].quando)-new Date(msgs[0].quando))/h:null,diasFechamento:evs.find(x=>x.tipo==='venda')?.tempoAteFechamentoDias??null,valor:e.valorNegociado??valorProp??msgs.at(-1)?.valorOferecido??null});
 }
 const cont=linhas.length,responderam=linhas.filter(l=>l.respondeu).length,interessadas=linhas.filter(l=>l.interessada).length,comDemo=linhas.filter(l=>l.demo).length,negociaram=linhas.filter(l=>l.negociou).length,fecharam=linhas.filter(l=>l.fechou).length;
 const taxa=(x,n)=>({x,n,taxa:n?x/n:null,ic:wilson(x,n)});
 const funil=[{id:'contatadas',nome:'Empresas contatadas (mensagem confirmada)',n:cont},{id:'responderam',nome:'Responderam',n:responderam},{id:'interessadas',nome:'Demonstraram interesse',n:interessadas},{id:'demo',nome:'Receberam demonstração',n:comDemo},{id:'negociaram',nome:'Chegaram à negociação',n:negociaram},{id:'fecharam',nome:'Fecharam',n:fecharam}];
 const grupo=(chave,rotulo=x=>x)=>{const m=new Map();for(const l of linhas){const k=chave(l);if(!m.has(k))m.set(k,[]);m.get(k).push(l);}return [...m].map(([k,ls])=>({chave:k,rotulo:rotulo(k),n:ls.length,resposta:taxa(ls.filter(l=>l.respondeu).length,ls.length),fechamento:taxa(ls.filter(l=>l.fechou).length,ls.length)})).sort((a,b)=>b.n-a.n);};
 const vendas=estado.eventos.filter(e=>e.tipo==='venda'),pagos=estado.pagamentos.filter(p=>p.estado==='confirmado'&&new Date(p.quando).getTime()>=t0&&new Date(p.quando).getTime()<=t1);
 const aceitas=estado.propostas.filter(p=>p.estado==='aceita'),valoresVenda=linhas.filter(l=>l.fechou&&l.valor).map(l=>l.valor);
 const horas=linhas.map(l=>l.horasResposta).filter(x=>x!=null),diasF=linhas.map(l=>l.diasFechamento).filter(x=>x!=null);
 const perdas=new Map();for(const l of linhas)if(l.perda)perdas.set(l.perda,(perdas.get(l.perda)||0)+1);
 const cadastradas=estado.empresas.length;
 return {cadastradas,contatadas:cont,funil,resposta:taxa(responderam,cont),interesse:taxa(interessadas,responderam),demonstracao:taxa(comDemo,cont),negociacao:taxa(negociaram,cont),fechamento:taxa(fecharam,cont),
  ticketMedio:mediaDe(valoresVenda),nVendas:valoresVenda.length,receitaRecebida:pagos.reduce((s,p)=>s+Number(p.valor),0),nPagamentos:pagos.length,tempoRespostaHoras:{media:mediaDe(horas),mediana:mediana(horas),n:horas.length},tempoFechamentoDias:{media:mediaDe(diasF),mediana:mediana(diasF),n:diasF.length},
  porNicho:grupo(l=>l.nicho),porEstrategia:grupo(l=>l.estrategia),porFaixa:grupo(l=>faixa(l.valor)),motivosPerda:[...perdas].map(([motivo,n])=>({motivo,n})).sort((a,b)=>b.n-a.n),
  serie:serieMensal(linhas),linhas};
}
function serieMensal(linhas){const m=new Map();for(const l of linhas){const d=new Date(l.primeira),k=d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0');if(!m.has(k))m.set(k,{mes:k,contatadas:0,responderam:0,fecharam:0});const r=m.get(k);r.contatadas++;if(l.respondeu)r.responderam++;if(l.fechou)r.fecharam++;}return [...m.values()].sort((a,b)=>a.mes.localeCompare(b.mes));}
export const AMOSTRA_MINIMA=20;
export function resultadoExperimento(estado,exp){
 const resultados=exp.variantes.map(v=>{const msgs=estado.eventos.filter(e=>e.tipo==='mensagem-enviada'&&e.experimentoId===exp.id&&e.variante===v.id);const empresas=[...new Set(msgs.map(m=>m.empresaId))];
  const resp=empresas.filter(id=>estado.eventos.some(e=>e.empresaId===id&&e.tipo==='resposta'&&e.quando>=msgs.find(m=>m.empresaId===id).quando));
  const fech=empresas.filter(id=>estado.eventos.some(e=>e.empresaId===id&&e.tipo==='venda'));
  return {variante:v,n:empresas.length,respostas:resp.length,fechamentos:fech.length,taxa:empresas.length?resp.length/empresas.length:null,ic:wilson(resp.length,empresas.length)};});
 const ord=resultados.filter(r=>r.n>0).sort((a,b)=>b.taxa-a.taxa);let veredito={tipo:'amostra',texto:'Ainda não há dados suficientes.'};
 if(ord.length>=2){const [a,b]=ord,suficiente=resultados.every(r=>r.n>=AMOSTRA_MINIMA);const z=testeDuasProporcoes(a.respostas,a.n,b.respostas,b.n);
  if(!suficiente)veredito={tipo:'amostra',texto:`Amostra insuficiente: cada variante precisa de pelo menos ${AMOSTRA_MINIMA} empresas contatadas (menor: ${Math.min(...resultados.map(r=>r.n))}). Nenhuma vencedora declarada.`,z};
  else if(z.p<0.05)veredito={tipo:'indicio',texto:`Indício de diferença: "${a.variante.nome}" respondeu mais (p≈${z.p.toFixed(3)}). Continue acompanhando; isso não garante o mesmo resultado no futuro.`,vencedora:a.variante.id,z};
  else veredito={tipo:'empate',texto:`Sem diferença estatística clara entre as variantes (p≈${z.p.toFixed(2)}).`,z};}
 return {resultados,veredito};
}
