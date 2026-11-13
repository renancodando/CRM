/* Extensões do laboratório científico: dimensionamento de amostra, poder, segmentação, replicação interna, critérios de interrupção e resultado econômico. Preserva e reutiliza os cálculos de nucleo/conversao/laboratorio.js. */
import {resultadoExperimentoConversao,criarExperimentoConversao} from '../conversao/laboratorio.js';
import {eventosDaEmpresa} from '../esquema.js';
import {wilson,fisherExato} from '../quant/estatistica.js';
import {condicaoVigente} from '../ofertas/condicoes.js';
export function zInverso(p){ // Acklam
 if(p<=0||p>=1)throw Error('p fora de (0,1)');const a=[-39.69683028665376,220.9460984245205,-275.9285104469687,138.357751867269,-30.66479806614716,2.506628277459239],b=[-54.47609879822406,161.5858368580409,-155.6989798598866,66.80131188771972,-13.28068155288572],c=[-0.007784894002430293,-0.3223964580411365,-2.400758277161838,-2.549732539343734,4.374664141464968,2.938163982698783],d=[0.007784695709041462,0.3224671290700398,2.445134137142996,3.754408661907416];
 const pl=.02425;let q,r;if(p<pl){q=Math.sqrt(-2*Math.log(p));return (((((c[0]*q+c[1])*q+c[2])*q+c[3])*q+c[4])*q+c[5])/((((d[0]*q+d[1])*q+d[2])*q+d[3])*q+1);}
 if(p>1-pl){q=Math.sqrt(-2*Math.log(1-p));return -(((((c[0]*q+c[1])*q+c[2])*q+c[3])*q+c[4])*q+c[5])/((((d[0]*q+d[1])*q+d[2])*q+d[3])*q+1);}
 q=p-.5;r=q*q;return (((((a[0]*r+a[1])*r+a[2])*r+a[3])*r+a[4])*r+a[5])*q/(((((b[0]*r+b[1])*r+b[2])*r+b[3])*r+b[4])*r+1);
}
const phi=z=>{const t=1/(1+.2316419*Math.abs(z)),d=.3989423*Math.exp(-z*z/2),p=d*t*(.3193815+t*(-.3565638+t*(1.781478+t*(-1.821256+t*1.330274))));return z>0?1-p:p;};
export function tamanhoAmostra(p1,p2,{alfa=.05,poder=.8}={}){
 if(!(p1>=0&&p1<=1&&p2>=0&&p2<=1)||p1===p2)throw Error('Informe duas taxas diferentes entre 0 e 1.');
 const za=zInverso(1-alfa/2),zb=zInverso(poder),pm=(p1+p2)/2,n=Math.pow(za*Math.sqrt(2*pm*(1-pm))+zb*Math.sqrt(p1*(1-p1)+p2*(1-p2)),2)/Math.pow(p1-p2,2);
 return {porGrupo:Math.ceil(n),total:Math.ceil(n)*2,alfa,poder,aviso:'Aproximação normal para duas proporções. Com taxas baixas, o necessário pode ser grande: prefira medir efeitos relevantes.'};
}
export function poderEstatistico(p1,p2,nPorGrupo,{alfa=.05}={}){
 if(p1===p2||nPorGrupo<2)return {poder:alfa};const za=zInverso(1-alfa/2),pm=(p1+p2)/2,se0=Math.sqrt(2*pm*(1-pm)/nPorGrupo),se1=Math.sqrt((p1*(1-p1)+p2*(1-p2))/nPorGrupo),d=Math.abs(p1-p2);
 return {poder:Math.min(1,Math.max(0,phi((d-za*se0)/se1))),n:nPorGrupo};
}
export const PRESETS=[
 {id:'tamanho',titulo:'Mensagem curta vs detalhada',hipotese:'Mensagens mais curtas geram mais respostas positivas que mensagens detalhadas.',variantes:[{nome:'Curta',abordagem:'baixo-atrito'},{nome:'Detalhada',abordagem:'direta'}],criterio:'resposta-positiva'},
 {id:'abordagem',titulo:'Direta vs consultiva',hipotese:'A abordagem consultiva gera mais resposta positiva que a direta.',variantes:[{nome:'Direta',abordagem:'direta'},{nome:'Consultiva',abordagem:'consultiva'}],criterio:'resposta-positiva'},
 {id:'demo',titulo:'Demonstração oferecida vs apresentada',hipotese:'Enviar a prévia já pronta gera mais demonstrações aceitas que apenas oferecê-la.',variantes:[{nome:'Oferece prévia',abordagem:'baixo-atrito'},{nome:'Envia prévia',abordagem:'demonstracao'}],criterio:'demonstracao-aceita'},
 {id:'beneficio',titulo:'Benefício principal vs apresentação ampla',hipotese:'Citar um único benefício concreto gera mais resposta que listar vários.',variantes:[{nome:'Um benefício',abordagem:'diagnostico'},{nome:'Apresentação ampla',abordagem:'direta'}],criterio:'resposta-positiva'},
 {id:'pergunta',titulo:'Perguntas iniciais diferentes',hipotese:'Uma pergunta sobre como chegam os clientes gera mais resposta que uma pergunta sobre ter site.',variantes:[{nome:'Como chegam clientes',abordagem:'consultiva'},{nome:'Tem site?',abordagem:'direta'}],criterio:'resposta'},
 {id:'condicao',titulo:'Condições comerciais diferentes',hipotese:'Apresentar Pix + parcelamento junto do preço aumenta propostas aceitas.',variantes:[{nome:'Preço único',abordagem:'direta'},{nome:'Preço + Pix + parcelas',abordagem:'direta'}],criterio:'venda'},
 {id:'followup',titulo:'Momento do follow-up',hipotese:'Um follow-up em 3 dias gera mais respostas que em 7 dias.',variantes:[{nome:'Follow-up em 3 dias',abordagem:'baixo-atrito'},{nome:'Follow-up em 7 dias',abordagem:'baixo-atrito'}],criterio:'resposta'}
];
export function criarDePreset(estado,presetId,extra={}){const p=PRESETS.find(x=>x.id===presetId);if(!p)throw Error('Preset desconhecido.');return criarExperimentoConversao(estado,{nome:extra.nome||p.titulo,hipotese:p.hipotese,criterio:p.criterio,variantes:p.variantes,nMinimoPorVariante:extra.nMinimoPorVariante||20,nicho:extra.nicho||''});}
function economicos(estado,exp,variante,cond){
 const ids=exp.atribuicoes.filter(a=>a.varianteId===variante.id).map(a=>a.empresaId),enviadas=ids.filter(id=>eventosDaEmpresa(estado,id,'mensagem-enviada').some(m=>m.experimentoId===exp.id));
 const receita=estado.pagamentos.filter(p=>enviadas.includes(p.empresaId)&&p.estado==='confirmado').reduce((s,p)=>s+Math.round(Number(p.valor)*100),0);
 const horas=estado.sessoes.filter(s=>enviadas.includes(s.empresaId)).reduce((t,s)=>t+(Number(s.duracaoMin)||0)/60,0),vh=cond?.valorMinimoHoraCent;
 const custo=vh==null?null:Math.round(horas*vh),custosDiretos=estado.custos.filter(c=>enviadas.includes(c.empresaId)).reduce((s,c)=>s+Math.round(Number(c.valor)*100),0);
 return {enviadas:enviadas.length,receitaCent:receita,horasRegistradas:horas,custoComercialCent:custo,custosDiretosCent:custosDiretos,resultadoCent:custo==null?null:receita-custo-custosDiretos,receitaPorMensagemCent:enviadas.length?Math.round(receita/enviadas.length):null,aviso:custo==null?'Defina o valor mínimo por hora para estimar o custo comercial.':horas===0?'Nenhuma hora registrada para estas empresas: o custo comercial pode estar subestimado.':''};
}
export function analisarExperimentoAvancado(estado,exp,{agora=Date.now(),limiteDano=.15}={}){
 const base=resultadoExperimentoConversao(estado,exp),cond=condicaoVigente(estado,agora)?.dados;
 const eco=exp.variantes.map(v=>({variante:v.nome,...economicos(estado,exp,v,cond)}));
 const linhas=base.linhas,minimo=exp.nMinimoPorVariante;
 const porEmpresa=new Map();const ok=(id)=>{const ev=eventosDaEmpresa(estado,id);const crit=exp.criterio;return crit==='resposta'?ev.some(e=>e.tipo==='resposta'):crit==='resposta-positiva'?ev.some(e=>e.tipo==='resposta'&&(['medio','alto'].includes(e.interesse)||e.pediuDemo)):crit==='demonstracao-aceita'?ev.some(e=>e.tipo==='resposta'&&e.pediuDemo)||ev.some(e=>e.tipo==='demonstracao-apresentada'):ev.some(e=>e.tipo==='venda'||e.tipo==='proposta-aceita');};
 const seg={};for(const a of exp.atribuicoes){const enviou=eventosDaEmpresa(estado,a.empresaId,'mensagem-enviada').find(m=>m.experimentoId===exp.id);if(!enviou)continue;const e=estado.empresas.find(x=>x.id===a.empresaId),k=e?.nicho||'(sem nicho)';((seg[k]??={})[a.varianteId]??={n:0,x:0});seg[k][a.varianteId].n++;if(ok(a.empresaId))seg[k][a.varianteId].x++;porEmpresa.set(a.empresaId,{varianteId:a.varianteId,quando:enviou.quando,sucesso:ok(a.empresaId)});}
 const segmentacao=Object.entries(seg).map(([nicho,m])=>({nicho,variantes:Object.fromEntries(exp.variantes.map(v=>[v.nome,{n:m[v.id]?.n||0,sucesso:m[v.id]?.x||0,taxa:m[v.id]?.n?m[v.id].x/m[v.id].n:null}])),suficiente:exp.variantes.every(v=>(m[v.id]?.n||0)>=minimo/2)}));
 // validação interna fora da amostra: primeira metade (cronológica) vs segunda
 const ord=[...porEmpresa.values()].sort((a,b)=>a.quando.localeCompare(b.quando)),meio=Math.floor(ord.length/2),metade=(arr)=>{const t=Object.fromEntries(exp.variantes.map(v=>[v.id,{n:0,x:0}]));for(const o of arr){t[o.varianteId].n++;if(o.sucesso)t[o.varianteId].x++;}return t;};
 let replicacao={disponivel:false,motivo:'Poucos envios para dividir em duas metades (mínimo 2×'+minimo+' por variante).'};
 if(exp.variantes.length===2&&ord.length>=4*minimo){const h1=metade(ord.slice(0,meio)),h2=metade(ord.slice(meio)),[v1,v2]=exp.variantes,d=h=>(h[v1.id].x/h[v1.id].n)-(h[v2.id].x/h[v2.id].n);const a=d(h1),b=d(h2);replicacao={disponivel:true,primeiraMetade:a,segundaMetade:b,mesmoSentido:Math.sign(a)===Math.sign(b),texto:Math.sign(a)===Math.sign(b)?'A diferença aparece com o mesmo sinal nas duas metades do período.':'A diferença muda de sinal entre as metades: resultado instável, não confie.'};}
 // critérios de interrupção
 const interr=[];
 const dano=linhas.filter(l=>l.enviadas>=5).find(l=>l.pediuParar/l.enviadas>limiteDano);if(dano)interr.push({tipo:'dano',texto:`A variante "${dano.variante.nome}" gerou pedidos para parar em ${(dano.pediuParar/dano.enviadas*100).toFixed(0)}% dos envios (acima de ${(limiteDano*100)}%). Considere interromper por respeito aos contatos.`});
 if(base.veredito.tipo==='evidencia')interr.push({tipo:'evidencia',texto:'Foi atingido o critério estatístico planejado: pode encerrar e validar em um novo lote.'});
 if(linhas.every(l=>l.enviadas>=minimo)&&base.veredito.tipo==='inconclusivo'){const ts=linhas.filter(l=>l.taxa!=null);if(ts.length===2){const pw=poderEstatistico(ts[0].taxa,ts[1].taxa,minimo);interr.push({tipo:'inconclusivo',texto:`O mínimo planejado foi atingido sem diferença clara. Com as taxas observadas, o poder era de ${(pw.poder*100).toFixed(0)}%: encerrar como inconclusivo é legítimo.`});}}
 const tem=linhas.filter(l=>l.taxa!=null);let amostra=null;if(tem.length===2&&tem[0].taxa!==tem[1].taxa&&tem[0].taxa>0&&tem[1].taxa>0){try{amostra=tamanhoAmostra(tem[0].taxa,tem[1].taxa);}catch{}}
 const difAbs=base.comparacao?.diferencaAbs,difRel=base.comparacao?.diferencaRel;
 return {...base,economico:eco,segmentacao,replicacao,interrupcao:interr,amostraNecessaria:amostra,diferencas:base.comparacao?{absoluta:difAbs,relativa:difRel,ic:base.comparacao.ic}:null,
  confundidores:{nichoBalanceado:segmentacao.length<=1||segmentacao.every(s=>{const v=Object.values(s.variantes).map(x=>x.n);return Math.max(...v)-Math.min(...v)<=Math.max(2,Math.max(...v)*.3);}),texto:'A distribuição por sorteio estratificado reduz confundidores conhecidos (nicho); fatores não medidos (horário, quem leu) continuam possíveis.'},
  objetivoPrincipal:'Para decidir, considere vendas, receita e custo comercial — não só a taxa de resposta (veja "economico").',
  aviso:'Nenhuma variante é declarada vencedora só por ter recebido mais respostas.'};
}
