/* Estatística real sobre observações reais. Funções puras; amostras vazias devolvem null (desconhecido), nunca 0. */
export const soma=v=>v.reduce((a,b)=>a+b,0);
export const media=v=>v.length?soma(v)/v.length:null;
export const mediaPonderada=(v,w)=>{const sw=soma(w);return v.length&&v.length===w.length&&sw?soma(v.map((x,i)=>x*w[i]))/sw:null;};
export const ordenar=v=>[...v].sort((a,b)=>a-b);
export function percentil(v,p){if(!v.length)return null;const s=ordenar(v),h=(s.length-1)*p/100,i=Math.floor(h),f=h-i;return s[i]+(i+1<s.length?f*(s[i+1]-s[i]):0);}
export const mediana=v=>percentil(v,50);
export function moda(v){if(!v.length)return null;const c=new Map();v.forEach(x=>c.set(x,(c.get(x)||0)+1));const m=Math.max(...c.values());if(m===1&&v.length>1)return [];return [...c].filter(([,n])=>n===m).map(([x])=>x).sort((a,b)=>a-b);}
export function variancia(v,amostral=true){if(v.length<(amostral?2:1))return null;const m=media(v);return soma(v.map(x=>(x-m)**2))/(v.length-(amostral?1:0));}
export const desvio=(v,a=true)=>{const x=variancia(v,a);return x==null?null:Math.sqrt(x);};
export const coefVariacao=v=>{const m=media(v),d=desvio(v);return m&&d!=null?d/Math.abs(m):null;};
export const amplitude=v=>v.length?Math.max(...v)-Math.min(...v):null;
export const quartis=v=>({q1:percentil(v,25),q2:percentil(v,50),q3:percentil(v,75)});
export const iqr=v=>v.length?percentil(v,75)-percentil(v,25):null;
export function assimetria(v){if(v.length<3)return null;const m=media(v),d=desvio(v,false);if(!d)return 0;return soma(v.map(x=>((x-m)/d)**3))/v.length;}
export function mad(v){if(!v.length)return null;const m=mediana(v);return mediana(v.map(x=>Math.abs(x-m)));}
export function atipicosIQR(v,k=1.5){if(v.length<4)return {limites:null,indices:[]};const q1=percentil(v,25),q3=percentil(v,75),i=q3-q1,lo=q1-k*i,hi=q3+k*i;return {limites:[lo,hi],indices:v.map((x,j)=>(x<lo||x>hi)?j:-1).filter(j=>j>=0)};}
export function atipicosMAD(v,limite=3.5){if(v.length<4)return {indices:[]};const m=mediana(v),d=mad(v);if(!d)return {indices:[]};return {indices:v.map((x,j)=>Math.abs(.6745*(x-m)/d)>limite?j:-1).filter(j=>j>=0)};}
export function histograma(v,classes){if(!v.length)return [];const mn=Math.min(...v),mx=Math.max(...v),k=classes||Math.max(1,Math.ceil(Math.log2(v.length)+1)),l=(mx-mn)/k||1,b=Array.from({length:k},(_,i)=>({de:mn+i*l,ate:mn+(i+1)*l,n:0}));v.forEach(x=>{const i=Math.min(k-1,Math.floor((x-mn)/l));b[i].n++;});return b;}
export function descrever(v){const n=v.length;if(!n)return {n:0};return {n,media:media(v),mediana:mediana(v),moda:moda(v),desvio:desvio(v),variancia:variancia(v),cv:coefVariacao(v),minimo:Math.min(...v),maximo:Math.max(...v),amplitude:amplitude(v),...quartis(v),iqr:iqr(v),assimetria:assimetria(v),atipicos:atipicosIQR(v).indices};}
export function pearson(x,y){const n=x.length;if(n<3||n!==y.length)return null;const mx=media(x),my=media(y);let sxy=0,sx=0,sy=0;for(let i=0;i<n;i++){sxy+=(x[i]-mx)*(y[i]-my);sx+=(x[i]-mx)**2;sy+=(y[i]-my)**2;}return sx&&sy?sxy/Math.sqrt(sx*sy):null;}
export function postos(v){const idx=v.map((x,i)=>[x,i]).sort((a,b)=>a[0]-b[0]),r=new Array(v.length);let i=0;while(i<idx.length){let j=i;while(j+1<idx.length&&idx[j+1][0]===idx[i][0])j++;const p=(i+j)/2+1;for(let k=i;k<=j;k++)r[idx[k][1]]=p;i=j+1;}return r;}
export const spearman=(x,y)=>pearson(postos(x),postos(y));
export function wilson(x,n,z=1.96){if(!n)return null;const p=x/n,d=1+z*z/n,c=p+z*z/(2*n),m=z*Math.sqrt(p*(1-p)/n+z*z/(4*n*n));return {baixo:Math.max(0,(c-m)/d),alto:Math.min(1,(c+m)/d)};}
const lgamma=n=>{let s=0;for(let i=2;i<=n;i++)s+=Math.log(i);return s;};
const logC=(n,k)=>lgamma(n)-lgamma(k)-lgamma(n-k);
export function fisherExato(a,b,c,d){const n=a+b+c+d,r1=a+b,c1=a+c,lp=x=>logC(r1,x)+logC(n-r1,c1-x)-logC(n,c1),obs=lp(a);let p=0;for(let x=Math.max(0,c1-(n-r1));x<=Math.min(r1,c1);x++){const l=lp(x);if(l<=obs+1e-9)p+=Math.exp(l);}return Math.min(1,p);}
export const oddsRatio=(a,b,c,d)=>(b*c)?(a*d)/(b*c):null;
export const tamanhoEfeitoH=(p1,p2)=>2*Math.asin(Math.sqrt(p1))-2*Math.asin(Math.sqrt(p2));
export function holm(ps){const idx=ps.map((p,i)=>[p,i]).sort((a,b)=>a[0]-b[0]),m=ps.length,adj=new Array(m);let max=0;idx.forEach(([p,i],k)=>{max=Math.max(max,Math.min(1,(m-k)*p));adj[i]=max;});return adj;}
function prng(seed){let s=seed>>>0||1;return()=>{s=(s*1664525+1013904223)>>>0;return s/4294967296;};}
export function bootstrapIC(v,estat=media,{B=2000,nivel=.95,semente=12345}={}){if(v.length<5)return null;const r=prng(semente),est=[];for(let b=0;b<B;b++){const am=Array.from({length:v.length},()=>v[Math.floor(r()*v.length)]);est.push(estat(am));}const s=ordenar(est.filter(x=>x!=null));return {baixo:percentil(s,(1-nivel)/2*100),alto:percentil(s,(1+nivel)/2*100),B,metodo:'bootstrap percentil sobre as observações reais'};}
export function mannWhitney(a,b){if(a.length<3||b.length<3)return null;const todos=[...a,...b],r=postos(todos),ra=soma(r.slice(0,a.length)),u=ra-a.length*(a.length+1)/2,mu=a.length*b.length/2,sd=Math.sqrt(a.length*b.length*(todos.length+1)/12),z=sd?(u-mu)/sd:0,phi=v=>{const t=1/(1+.2316419*Math.abs(v)),d=.3989423*Math.exp(-v*v/2),pr=d*t*(.3193815+t*(-.3565638+t*(1.781478+t*(-1.821256+t*1.330274))));return v>0?1-pr:pr;};return {u,z,p:Math.min(1,2*(1-phi(Math.abs(z)))),efeito:1-2*u/(a.length*b.length)};}
export function kaplanMeier(obs){ // obs: [{t:duração, evento:boolean}] (evento=false => ainda em observação/censurada)
 const ts=[...new Set(obs.filter(o=>o.evento).map(o=>o.t))].sort((a,b)=>a-b);let S=1;const curva=[{t:0,S:1,emRisco:obs.length}];
 for(const t of ts){const risco=obs.filter(o=>o.t>=t).length,ev=obs.filter(o=>o.t===t&&o.evento).length;S*=1-ev/risco;curva.push({t,S,emRisco:risco,eventos:ev});}
 const medio=curva.find(c=>c.S<=.5);return {curva,medianaT:medio?medio.t:null,n:obs.length,eventos:obs.filter(o=>o.evento).length,censuradas:obs.filter(o=>!o.evento).length};}
export function regressaoLinear(x,y){const n=x.length;if(n<5||n!==y.length)return null;const mx=media(x),my=media(y);let sxy=0,sxx=0;for(let i=0;i<n;i++){sxy+=(x[i]-mx)*(y[i]-my);sxx+=(x[i]-mx)**2;}if(!sxx)return null;const b=sxy/sxx,a=my-b*mx,res=x.map((xi,i)=>y[i]-(a+b*xi)),sst=soma(y.map(v=>(v-my)**2)),r2=sst?1-soma(res.map(r=>r*r))/sst:null;return {a,b,r2,n,residuos:res};}
export function mediaMovel(v,k){return v.map((_,i)=>i+1<k?null:media(v.slice(i+1-k,i+1)));}
export function herfindahl(partes){const t=soma(partes);if(!t)return null;return soma(partes.map(p=>(p/t*100)**2));}
export function concentracao(partes,k){const t=soma(partes);if(!t)return null;return soma(ordenar(partes).reverse().slice(0,k))/t;}
