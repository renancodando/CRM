/* Animações do painel inferior. Um único laço desenha somente o que está
   visível; tudo é suspenso fora da tela, em aba oculta ou com movimento pausado.
   Cada canvas desenha em pixels da arte original (1672 × 941). */
import {desenharAmpulheta,estadoAmpulheta,CICLO_AMPULHETA} from './ampulheta.js';
import {criarRitmo} from './ritmo.js';

const TAU=Math.PI*2;
const aleatorio=semente=>()=>{semente=(semente*16807)%2147483647;return (semente-1)/2147483646;};
const ease=x=>x<.5?4*x*x*x:1-Math.pow(-2*x+2,3)/2;
const CENTRO_ESF=[836-660,690-555],RAIO_ESF=116;

function ajustar(canvas,refL,refA,qual){
 const r=canvas.getBoundingClientRect();if(!r.width||!r.height)return null;
 const dpr=Math.min(devicePixelRatio||1,qual==='alta'?2:qual==='economica'?1:1.5);
 const w=Math.round(r.width*dpr),h=Math.round(r.height*dpr);
 if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;}
 const ctx=canvas.getContext('2d');ctx.setTransform(w/refL,0,0,h/refA,0,0);return {ctx,w,h,css:r};
}

/* ---------------- Cúpula ---------------- */
function cupula(){
 const r=aleatorio(7),brilhos=Array.from({length:70},()=>({a:r()*TAU,d:Math.sqrt(r()),f:.6+r()*1.8,p:r()*TAU,c:r()<.75?0:1}));
 const brasas=Array.from({length:26},()=>({t:r(),x:(r()-.5)*40,v:.6+r()*.8,s:.6+r()*1.4}));
 return (ctx,t,dados)=>{
  ctx.clearRect(0,0,867,504);
  ctx.globalCompositeOperation='lighter';
  /* aurora suave no céu da cúpula */
  for(let i=0;i<3;i++){const x=180+i*190+Math.sin(t*.13+i*2)*60,y=70+Math.sin(t*.21+i)*18;const g=ctx.createRadialGradient(x,y,0,x,y,150);g.addColorStop(0,'rgba(40,190,170,.07)');g.addColorStop(1,'rgba(40,190,170,0)');ctx.fillStyle=g;ctx.beginPath();ctx.ellipse(x,y,170,46,Math.sin(t*.1+i)*.25,0,TAU);ctx.fill();}
  /* feixe: núcleo vivo e pulsos descendo */
  const bx=441,pico=204,resp=.75+.25*Math.sin(t*2.1);
  let g=ctx.createLinearGradient(bx-6,0,bx+6,0);g.addColorStop(0,'rgba(255,150,60,0)');g.addColorStop(.5,'rgba(255,190,120,'+(.35*resp)+')');g.addColorStop(1,'rgba(255,150,60,0)');ctx.fillStyle=g;ctx.fillRect(bx-6,0,12,pico);
  for(let i=0;i<3;i++){const y=((t*.38+i/3)%1)*pico;const gp=ctx.createRadialGradient(bx,y,0,bx,y,16);gp.addColorStop(0,'rgba(255,230,190,.85)');gp.addColorStop(1,'rgba(255,140,50,0)');ctx.fillStyle=gp;ctx.fillRect(bx-16,y-16,32,32);}
  /* clarão do pico com raios girando */
  g=ctx.createRadialGradient(bx,pico,0,bx,pico,70*resp);g.addColorStop(0,'rgba(255,220,160,.75)');g.addColorStop(.25,'rgba(255,150,60,.35)');g.addColorStop(1,'rgba(255,120,40,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(bx,pico,70,0,TAU);ctx.fill();
  ctx.save();ctx.translate(bx,pico);ctx.rotate(t*.15);
  for(let i=0;i<8;i++){ctx.rotate(TAU/8);const len=(i%2?36:62)*(.8+.2*Math.sin(t*3+i));const gr=ctx.createLinearGradient(0,0,len,0);gr.addColorStop(0,'rgba(255,220,170,.55)');gr.addColorStop(1,'rgba(255,160,80,0)');ctx.fillStyle=gr;ctx.beginPath();ctx.moveTo(0,-1.1);ctx.lineTo(len,0);ctx.lineTo(0,1.1);ctx.fill();}
  ctx.restore();
  /* brasas subindo do pico */
  for(const b of brasas){const k=(b.t+t*.09*b.v)%1,y=pico-k*120,x=bx+b.x*(1+k)+Math.sin(t*2+b.t*9)*6;ctx.fillStyle='rgba(255,'+(170+60*(1-k)|0)+',110,'+(.7*(1-k))+')';ctx.beginPath();ctx.arc(x,y,b.s*(1-k*.5),0,TAU);ctx.fill();}
  /* cintilação do lago */
  for(const s of brilhos){const x=441+Math.cos(s.a)*s.d*255,y=316+Math.sin(s.a)*s.d*52,a=Math.max(0,Math.sin(t*s.f+s.p));if(a<.35)continue;const al=(a-.35)*1.3;ctx.fillStyle=s.c?'rgba(255,190,120,'+al*.8+')':'rgba(120,255,225,'+al*.7+')';ctx.fillRect(x-.8,y-.4,1.6+a*3,.8);}
  /* órbita: dois cometas com cauda */
  const ocx=435,ocy=286,orx=376,ory=84;
  for(let c=0;c<2;c++){const base=t*.32+c*Math.PI;for(let i=0;i<46;i++){const a=base-i*.018,x=ocx+Math.cos(a)*orx,y=ocy+Math.sin(a)*ory,fundo=Math.sin(a)<0?.35:1,al=(1-i/46)*fundo;ctx.fillStyle='rgba(255,'+(175+i)+',105,'+al*.9+')';ctx.beginPath();ctx.arc(x,y,2.6*(1-i/52),0,TAU);ctx.fill();}
   const a=base,x=ocx+Math.cos(a)*orx,y=ocy+Math.sin(a)*ory,gh=ctx.createRadialGradient(x,y,0,x,y,18);gh.addColorStop(0,'rgba(255,230,180,'+(Math.sin(a)<0?.35:.9)+')');gh.addColorStop(1,'rgba(255,140,50,0)');ctx.fillStyle=gh;ctx.fillRect(x-18,y-18,36,36);}
  /* varredura de luz na borda frontal da plataforma */
  const va=((t*.12)%1)*Math.PI;for(let i=0;i<30;i++){const a=va+i*.012,x=441-Math.cos(a)*418,y=356+Math.sin(a)*96,al=(1-i/30)*.55;ctx.fillStyle='rgba(255,190,120,'+al+')';ctx.fillRect(x-1.5,y-1,3,2);}
  /* reflexo deslizando pelo vidro da cúpula */
  const sa=Math.PI*(1.08+((t*.05)%1)*.84);ctx.lineCap='round';
  for(let i=0;i<18;i++){const a=sa+i*.012,x=441+Math.cos(a)*428,y=322+Math.sin(a)*238;ctx.fillStyle='rgba(200,255,245,'+(.2*Math.sin(i/18*Math.PI))+')';ctx.beginPath();ctx.arc(x,y,2.2,0,TAU);ctx.fill();}
  /* anéis no chão de cada pino */
  for(let i=0;i<dados.pinos;i++){const [px,py]=PIN[i];const k=(t*.5+i*.137)%1;ctx.strokeStyle=(dados.quentes?.[i]?'rgba(255,170,90,':'rgba(90,255,220,')+(.6*(1-k))+')';ctx.lineWidth=1.2;ctx.beginPath();ctx.ellipse(px,py,4+k*20,1.5+k*6,0,0,TAU);ctx.stroke();}
  ctx.globalCompositeOperation='source-over';
 };
}
const PIN=[[553,346],[645,355],[718,325],[1015,340],[1117,361],[1200,355],[610,449],[1050,437],[455,374]].map(([x,y])=>[x-395,y-86]);

/* ---------------- Funil ---------------- */
function funil(){
 const aneis=[[1397,230,133,16],[1395,262,121,13],[1393,315,111,12],[1393,368,100,11],[1392,420,84,10],[1393,472,70,9]].map(([x,y,rx,ry])=>[x-1250,y-118,rx,ry]);
 const r=aleatorio(11),gotas=Array.from({length:40},()=>({t:r(),a:r()*TAU,v:.5+r()*.7,s:.5+r()}));
 return (ctx,t)=>{
  ctx.clearRect(0,0,422,448);ctx.globalCompositeOperation='lighter';
  aneis.forEach(([x,y,rx,ry],i)=>{
   const yb=y+30+i*1.2,laranja=i/5,cor=(al)=>'rgba('+(90+165*laranja|0)+','+(240-70*laranja|0)+','+(215-120*laranja|0)+','+al+')';
   /* cometa percorrendo o aro frontal */
   const fase=((t*(.16+i*.025)+i*.31)%1)*Math.PI;
   for(let k=0;k<34;k++){const a=fase-k*.03;if(a<0)break;const px=x-Math.cos(a)*rx*.97,py=yb+Math.sin(a)*ry*1.25;ctx.fillStyle=cor(.75*(1-k/34));ctx.beginPath();ctx.arc(px,py,1.9*(1-k/40),0,TAU);ctx.fill();}
   /* respiração do aro superior */
   ctx.strokeStyle=cor(.12+.1*Math.sin(t*1.7+i));ctx.lineWidth=2.2;ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,TAU);ctx.stroke();
  });
  /* partículas descendo pelo funil */
  for(const g of gotas){const k=(g.t+t*.07*g.v)%1,i=k*5,i0=Math.floor(i),f=i-i0,a0=aneis[i0],a1=aneis[Math.min(5,i0+1)];
   const rx=a0[2]+(a1[2]-a0[2])*f,y=a0[1]+(a1[1]-a0[1])*f+18,ang=g.a+t*.6*g.v,x=a0[0]+Math.cos(ang)*rx*.8,yy=y+Math.sin(ang)*8;
   const al=Math.sin(k*Math.PI)*(Math.sin(ang)>0?.8:.3);ctx.fillStyle='rgba(255,'+(230-k*70|0)+','+(200-k*110|0)+','+al+')';ctx.beginPath();ctx.arc(x,yy,g.s,0,TAU);ctx.fill();}
  ctx.globalCompositeOperation='source-over';
 };
}

/* ---------------- Esfera do foco ---------------- */
function raio(r,x1,y1,x2,y2,desvio,prof,pts){
 if(prof===0){pts.push([x2,y2]);return;}
 const mx=(x1+x2)/2+(r()-.5)*desvio,my=(y1+y2)/2+(r()-.5)*desvio;
 raio(r,x1,y1,mx,my,desvio/2,prof-1,pts);raio(r,mx,my,x2,y2,desvio/2,prof-1,pts);
}
function foco(){
 const [cx,cy]=CENTRO_ESF;let rnd=aleatorio(3),raios=[],proximo=0;
 const faiscas=Array.from({length:34},(_,i)=>({a:i/34*TAU,r:124+(i%5)*4,v:.25+(i%7)*.05,s:.7+(i%3)*.5}));
 return (ctx,t)=>{
  ctx.clearRect(0,0,355,335);
  if(t>proximo){proximo=t+.12+rnd()*.35;if(raios.length<7){const a=rnd()*TAU,b=a+Math.PI*(.5+rnd()),r1=RAIO_ESF*(.2+rnd()*.5),r2=RAIO_ESF*(.82+rnd()*.14);const pts=[[cx+Math.cos(a)*r1,cy+Math.sin(a)*r1]];raio(rnd,pts[0][0],pts[0][1],cx+Math.cos(b)*r2,cy+Math.sin(b)*r2,70,5,pts);raios.push({pts,nasce:t,vida:.35+rnd()*.9,teal:rnd()<.22,ramo:rnd()<.5});}}
  raios=raios.filter(x=>t-x.nasce<x.vida);
  ctx.save();ctx.beginPath();ctx.arc(cx,cy,RAIO_ESF-2,0,TAU);ctx.clip();
  ctx.globalCompositeOperation='lighter';
  /* núcleo pulsante e cáusticas girando */
  const p=.65+.35*Math.sin(t*1.6)+.12*Math.sin(t*5.3);
  let g=ctx.createRadialGradient(cx,cy+30,0,cx,cy+30,RAIO_ESF*1.1);g.addColorStop(0,'rgba(255,170,80,'+.22*p+')');g.addColorStop(.6,'rgba(255,120,40,'+.08*p+')');g.addColorStop(1,'rgba(255,120,40,0)');ctx.fillStyle=g;ctx.fillRect(cx-RAIO_ESF,cy-RAIO_ESF,RAIO_ESF*2,RAIO_ESF*2);
  for(let i=0;i<5;i++){ctx.strokeStyle='rgba(255,200,140,'+(.06+.04*Math.sin(t+i))+')';ctx.lineWidth=1.4;ctx.beginPath();ctx.ellipse(cx,cy,RAIO_ESF*(.45+i*.11),RAIO_ESF*(.2+i*.08),t*(.12+i*.03)+i,0,Math.PI*1.2);ctx.stroke();}
  /* raios internos */
  for(const x of raios){const v=(t-x.nasce)/x.vida,al=v<.15?v/.15:1-(v-.15)/.85,fl=.7+.3*Math.sin(t*60+x.nasce*99);
   for(const [lw,a] of [[5,.12],[2.2,.4],[.9,.95]]){ctx.strokeStyle=x.teal?'rgba(110,255,225,'+a*al*fl+')':'rgba(255,'+(a>.5?225:170)+',120,'+a*al*fl+')';ctx.lineWidth=lw;ctx.beginPath();x.pts.forEach(([px,py],i)=>i?ctx.lineTo(px,py):ctx.moveTo(px,py));ctx.stroke();}}
  ctx.restore();
  ctx.globalCompositeOperation='lighter';
  /* borda viva e brilho percorrendo o contorno */
  const ba=t*.7;for(let i=0;i<40;i++){const a=ba-i*.02;ctx.fillStyle='rgba(255,215,160,'+(.55*(1-i/40))+')';ctx.beginPath();ctx.arc(cx+Math.cos(a)*(RAIO_ESF-1),cy+Math.sin(a)*(RAIO_ESF-1),1.8*(1-i/50),0,TAU);ctx.fill();}
  g=ctx.createRadialGradient(cx,cy,RAIO_ESF-8,cx,cy,RAIO_ESF+16);g.addColorStop(0,'rgba(255,150,60,0)');g.addColorStop(.45,'rgba(255,160,70,'+.16*p+')');g.addColorStop(1,'rgba(255,150,60,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(cx,cy,RAIO_ESF+16,0,TAU);ctx.fill();
  /* faíscas em órbita inclinada */
  for(const f of faiscas){const a=f.a+t*f.v,x=cx+Math.cos(a)*f.r,y=cy+Math.sin(a)*f.r*.3-Math.cos(a)*14,frente=Math.sin(a)>0;if(!frente&&Math.hypot(x-cx,y-cy)<RAIO_ESF)continue;ctx.fillStyle='rgba(255,'+(frente?220:170)+',140,'+(frente?.85:.35)+')';ctx.beginPath();ctx.arc(x,y,f.s,0,TAU);ctx.fill();}
  /* ondas concêntricas na água da base */
  const by=253;for(let i=0;i<5;i++){const k=(t*.16+i/5)%1;ctx.strokeStyle='rgba(255,175,95,'+(.5*(1-k)*Math.min(1,k*5))+')';ctx.lineWidth=1.3;ctx.beginPath();ctx.ellipse(176,by,40+k*135,(40+k*135)*.13,0,0,TAU);ctx.stroke();}
  /* coluna de luz refletida */
  g=ctx.createLinearGradient(0,by,0,335);g.addColorStop(0,'rgba(255,190,110,'+.35*p+')');g.addColorStop(1,'rgba(255,150,60,0)');ctx.fillStyle=g;for(let i=0;i<9;i++){const y=by+6+i*9,w=3+Math.sin(t*4+i*1.7)*2.5+i*.6;ctx.fillRect(176-w,y,w*2,2.4);}
  ctx.globalCompositeOperation='source-over';
 };
}

/* ---------------- Água do primeiro plano (desktop) ---------------- */
function agua(palco){
 const r=aleatorio(5),pontos=Array.from({length:150},()=>({x:r()*1672,y:r()*161,f:.5+r()*2,p:r()*TAU,v:(r()-.5)*6}));
 const ondas=[];palco.addEventListener('pointermove',e=>{const rc=palco.getBoundingClientRect(),k=1672/rc.width,x=(e.clientX-rc.left)*k,y=(e.clientY-rc.top)*k+86-780;if(y<0||y>161)return;const ag=performance.now()/1e3;if(ondas.length&&ag-ondas[ondas.length-1].t<.09)return;ondas.push({x,y,t:ag});if(ondas.length>24)ondas.shift();},{passive:true});
 return (ctx,t)=>{
  ctx.clearRect(0,0,1672,161);ctx.globalCompositeOperation='lighter';
  for(const s of pontos){const x=(s.x+s.v*t+1672)%1672,a=Math.sin(t*s.f+s.p);if(a<.2)continue;const perto=Math.abs(x-836)<260,al=(a-.2)*(perto?.9:.55)*(s.y/161*.7+.3);ctx.fillStyle=perto?'rgba(255,200,130,'+al+')':'rgba(110,240,220,'+al+')';ctx.fillRect(x-a*3,s.y,a*6+1,1);}
  for(let i=0;i<3;i++){const k=(t*.07+i/3)%1,rx=190+k*330;ctx.strokeStyle='rgba(255,170,90,'+(.28*(1-k))+')';ctx.lineWidth=1;ctx.beginPath();ctx.ellipse(836,28,rx,rx*.12,0,0,TAU);ctx.stroke();}
  for(const o of ondas){const k=t-o.t;if(k>2.2)continue;for(let j=0;j<2;j++){const rr=k*60-j*14;if(rr<=0)continue;ctx.strokeStyle='rgba(140,255,230,'+(.35*(1-k/2.2))+')';ctx.lineWidth=1;ctx.beginPath();ctx.ellipse(o.x,o.y,rr,rr*.22,0,0,TAU);ctx.stroke();}}
  ctx.globalCompositeOperation='source-over';
 };
}

/* ---------------- Ciclo de vida ---------------- */
function criar(alvo){
 const palco=alvo.querySelector('.pv-palco');
 const q=s=>alvo.querySelector(s);
 const camadas=[
  {el:q('.pv-agua'),L:1672,A:161,f:agua(palco),so:'replica'},
  {el:q('.pv-cupula .pv-fx'),L:867,A:504,f:cupula()},
  {el:q('.pv-fluxo .pv-fx'),L:422,A:448,f:funil()},
  {el:q('.pv-foco .pv-fx'),L:355,A:335,f:foco()},
  {el:q('.pv-ampulheta canvas'),L:341,A:341,f:(ctx,t,d,ag)=>desenharAmpulheta(ctx,ag)}
 ];
 const ritmo=criarRitmo(q('.pv-ritmo'),palco);
 const reduzir=matchMedia('(prefers-reduced-motion: reduce)');
 const inicio=performance.now();
 let dados={pinos:0},visivel=true,quadro=0,ultimo=0,qual='equilibrada',suja=true;
 const parado=()=>reduzir.matches||document.documentElement.classList.contains('movimento-pausado');
 const replica=()=>palco.classList.contains('pv-replica');
 function quadroDe(agora){
  const t=(agora-inicio)/1000;
  for(const c of camadas){if(!c.el||(c.so==='replica'&&!replica()))continue;const a=ajustar(c.el,c.L,c.A,qual);if(!a)continue;c.f(a.ctx,parado()?4.2:t,dados,agora-inicio);}
  ritmo.desenhar(parado()?4.2:t,qual,parado());
  const ea=estadoAmpulheta(agora-inicio),fig=q('[data-pv-relogio]');
  if(fig){const s=Math.ceil(ea.restante/1000),txt=ea.girando?'Ampulheta girando para um novo ciclo de 2 minutos':'Ampulheta: '+Math.floor(s/60)+' min '+(s%60)+' s restantes de 2 minutos';if(s%10===0&&fig.textContent!==txt)fig.textContent=txt;}
 }
 function laco(agora){
  quadro=0;if(!visivel||document.hidden)return;
  if(parado()){quadroDe(agora);quadro=setTimeout(()=>laco(performance.now()),1000);return;}
  const intervalo=qual==='economica'?40:qual==='alta'?0:24;
  if(agora-ultimo>=intervalo||suja){ultimo=agora;suja=false;quadroDe(agora);}
  quadro=requestAnimationFrame(laco);
 }
 function retomar(){if(quadro){cancelAnimationFrame(quadro);clearTimeout(quadro);quadro=0;}suja=true;laco(performance.now());}
 const io=new IntersectionObserver(es=>{visivel=es.some(e=>e.isIntersecting);if(visivel)retomar();},{rootMargin:'120px'});io.observe(palco);
 const modo=()=>{const w=palco.clientWidth;palco.classList.toggle('pv-replica',w>=980);palco.style.setProperty('--u',(w/1672)+'');suja=true;};
 new ResizeObserver(()=>{modo();if(!quadro)retomar();}).observe(palco);modo();
 document.addEventListener('visibilitychange',retomar);
 document.addEventListener('orbita:preferencias',e=>{qual=e.detail?.qualidade||qual;retomar();});
 reduzir.addEventListener?.('change',retomar);
 return {atualizar(d){dados=d;if(d.qualidade)qual=d.qualidade;ritmo.dados(d.dias,d.hoje);suja=true;if(!quadro&&visivel)retomar();}};
}
export function iniciarAnimacoes(alvo,dados){if(!alvo.__pv)alvo.__pv=criar(alvo);alvo.__pv.atualizar(dados);}
export {CICLO_AMPULHETA};
