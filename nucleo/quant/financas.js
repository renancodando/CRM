/* Matemática financeira sobre valores em centavos inteiros e datas reais. Arredondamento explícito: meio para cima (Math.round) ao final de cada operação monetária. */
export const aCentavos=r=>Math.round(Number(r)*100);
export const deCentavos=c=>c/100;
export const arredondar=c=>Math.round(c);
export function reais(c){if(c==null)return '—';return (c/100).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});}
export const parseMoedaBR=t=>{let s=String(t??'').trim().replace(/[R$\s]/g,'');if(!s)return null;let neg=false;if(/^\(.*\)$/.test(s)){neg=true;s=s.slice(1,-1);}if(s.startsWith('-')){neg=!neg;s=s.slice(1);}if(s.endsWith('-')){neg=!neg;s=s.slice(0,-1);}
 if(/^\d{1,3}(\.\d{3})*(,\d{1,2})?$/.test(s))s=s.replace(/\./g,'').replace(',','.');else if(/^\d+,\d{1,2}$/.test(s))s=s.replace(',','.');else if(/^\d+(\.\d{1,2})?$/.test(s)){}else return null;const v=Math.round(parseFloat(s)*100);return neg?-v:v;};
export function descontoPercentual(original,final){return original>0?(original-final)/original:null;}
export function dividirParcelas(totalCent,n){const base=Math.floor(totalCent/n),resto=totalCent-base*n;return Array.from({length:n},(_,i)=>base+(i<resto?1:0));}
export const taxaEquivalente=(i,fracao)=>(1+i)**fracao-1; // ex.: mensal→anual: fracao=12
export const jurosSimples=(P,i,n)=>Math.round(P*(1+i*n));
export const jurosCompostos=(P,i,n)=>Math.round(P*(1+i)**n);
export const valorPresente=(fv,i,n)=>fv/(1+i)**n;
export const valorFuturo=(pv,i,n)=>pv*(1+i)**n;
const dias=(a,b)=>(new Date(b)-new Date(a))/864e5;
/* fluxo: [{quando, valor(centavos, + entrada / − saída)}]; taxaAnual: configurada pelo usuário; base 365 dias */
export function vpl(fluxo,taxaAnual,dataBase){if(!fluxo.length)return null;const t0=dataBase||fluxo.map(f=>f.quando).sort()[0];return fluxo.reduce((s,f)=>s+f.valor/(1+taxaAnual)**(dias(t0,f.quando)/365),0);}
export function tir(fluxo){if(fluxo.length<2||!fluxo.some(f=>f.valor>0)||!fluxo.some(f=>f.valor<0))return null;const t0=fluxo.map(f=>f.quando).sort()[0],f=r=>fluxo.reduce((s,x)=>s+x.valor/(1+r)**(dias(t0,x.quando)/365),0);let lo=-.99,hi=10;if(f(lo)*f(hi)>0)return null;for(let i=0;i<200;i++){const m=(lo+hi)/2;if(f(lo)*f(m)<=0)hi=m;else lo=m;}return (lo+hi)/2;}
export function payback(fluxo){const o=[...fluxo].sort((a,b)=>a.quando.localeCompare(b.quando));let acc=0;for(const f of o){acc+=f.valor;if(acc>=0&&o.some(x=>x.valor<0))return {quando:f.quando,dias:dias(o[0].quando,f.quando)};}return null;}
export function amortizacaoPrice(P,i,n){if(i===0)return dividirParcelas(P,n).map((p,k)=>({k:k+1,parcela:p,juros:0,amortizacao:p}));const pmt=P*i/(1-(1+i)**-n);let saldo=P;return Array.from({length:n},(_,k)=>{const j=saldo*i,a=pmt-j;saldo-=a;return {k:k+1,parcela:Math.round(pmt),juros:Math.round(j),amortizacao:Math.round(a),saldo:Math.max(0,Math.round(saldo))};});}
export const margem=(receita,custo)=>receita>0?(receita-custo)/receita:null;
export const markup=(receita,custo)=>custo>0?(receita-custo)/custo:null;
export const retornoPorHora=(resultadoCent,horas)=>horas>0?resultadoCent/horas:null;
export const pontoEquilibrio=(custoFixo,precoUnit,custoVarUnit)=>precoUnit>custoVarUnit?custoFixo/(precoUnit-custoVarUnit):null;
export const margemSeguranca=(receita,pe)=>receita>0?(receita-pe)/receita:null;
export const roi=(ganho,custo)=>custo>0?(ganho-custo)/custo:null;
export const precoMinimo=(custoCent)=>custoCent;
export const precoParaMargem=(custoCent,margemAlvo)=>margemAlvo>=0&&margemAlvo<1?Math.ceil(custoCent/(1-margemAlvo)):null;
export const precoParaHora=(custoCent,horas,valorHoraCent)=>Math.ceil(custoCent+horas*valorHoraCent);
/* Valor líquido de um recebimento: nominal − taxa percentual − tarifa fixa (valores informados pelo usuário) */
export const valorLiquido=(nominal,{taxaPct=0,tarifaCent=0}={})=>Math.round(nominal*(1-taxaPct/100))-tarifaCent;
