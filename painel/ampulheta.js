/* Ampulheta: a areia escoa em exatamente 2 minutos (relógio absoluto, não soma
   de quadros), depois a peça sobe, gira 180° com rastro de faíscas, pousa com
   onda de choque e recomeça. O desenho é simétrico, então o giro é contínuo. */
export const ESCOAR=120000,GIRO=3400,CICLO_AMPULHETA=ESCOAR+GIRO;
const TAU=Math.PI*2;
/* Perfil medido na arte: [altura a partir do topo, meia-largura], topo=0, total 305. */
const PERFIL=[[17,45],[30,52.5],[55,58],[80,59],[103,53.5],[125,38],[140,18],[148,8],[152.5,4.6]];
const ALT=305,MEIO=152.5,CX=170.5,CY=169.5,AREIA=.40;
function meia(dy){ // dy de 0 a 305; interpolação de Catmull-Rom no perfil medido
 const y=Math.max(17,dy>MEIO?ALT-dy:dy);
 for(let i=1;i<PERFIL.length;i++){const [a,wa]=PERFIL[i-1],[b,wb]=PERFIL[i];if(y<=b){const p0=PERFIL[i-2]||PERFIL[i-1],p3=PERFIL[i+1]||PERFIL[i],f=(y-a)/(b-a||1);
  const m1=(wb-p0[1])/(b-p0[0]||1)*(b-a),m2=(p3[1]-wa)/(p3[0]-a||1)*(b-a),f2=f*f,f3=f2*f;
  return (2*f3-3*f2+1)*wa+(f3-2*f2+f)*m1+(-2*f3+3*f2)*wb+(f3-f2)*m2;}}
 return 4.6;
}
/* Tabela de volume (área de giro ∝ largura²) para converter volume ↔ altura. */
const PASSO=.5,TAB=[];{let v=0;for(let y=17;y<=MEIO;y+=PASSO){const w=meia(y)-3;v+=w*w*PASSO;TAB.push([y,v]);}}
const VOL=TAB[TAB.length-1][1];
const nivelSuperior=f=>{ // areia restante f (0–1) ocupa do gargalo para cima
 const alvo=VOL*AREIA*f;for(let i=TAB.length-1;i>=0;i--){if(VOL-TAB[i][1]>=alvo)return TAB[i][0];}return 19;
};
const nivelInferior=f=>{ // areia acumulada f ocupa do fundo para cima
 const alvo=VOL*AREIA*f;for(let i=0;i<TAB.length;i++){if(TAB[i][1]>=alvo)return ALT-TAB[i][0];}return MEIO;
};
export function estadoAmpulheta(ms){
 const fase=((ms%CICLO_AMPULHETA)+CICLO_AMPULHETA)%CICLO_AMPULHETA;
 return fase<ESCOAR?{fase,f:fase/ESCOAR,girando:false,restante:ESCOAR-fase}:{fase,f:1,girando:true,g:(fase-ESCOAR)/GIRO,restante:ESCOAR};
}
const ease=x=>x<.5?4*x*x*x:1-Math.pow(-2*x+2,3)/2;
const grao=(i)=>{const x=Math.sin(i*127.1)*43758.5453;return x-Math.floor(x);};

function contorno(ctx,recuo=0){
 ctx.beginPath();
 for(let y=17;y<=ALT-17;y+=1.5)ctx.lineTo(-meia(y)+recuo,y-MEIO);
 for(let y=ALT-17;y>=17;y-=1.5)ctx.lineTo(meia(y)-recuo,y-MEIO);
 ctx.closePath();
}
function tampa(ctx,y,inv){
 const w=61;ctx.save();ctx.translate(0,y);if(inv)ctx.scale(1,-1);
 let g=ctx.createLinearGradient(-w,0,w,0);g.addColorStop(0,'#160d07');g.addColorStop(.18,'#5a321a');g.addColorStop(.36,'#d58d50');g.addColorStop(.5,'#6d3c1d');g.addColorStop(.78,'#a8662f');g.addColorStop(1,'#140b06');
 ctx.fillStyle=g;ctx.beginPath();ctx.moveTo(-w,5);ctx.lineTo(-w,15);ctx.ellipse(0,15,w,5.5,0,Math.PI,0,true);ctx.lineTo(w,5);ctx.ellipse(0,5,w,5.5,0,0,Math.PI,true);ctx.closePath();ctx.fill();
 g=ctx.createRadialGradient(-15,3,2,0,5,w);g.addColorStop(0,'#ffcf98');g.addColorStop(.35,'#8a4c23');g.addColorStop(1,'#2a160a');ctx.fillStyle=g;ctx.beginPath();ctx.ellipse(0,5,w,5.5,0,0,TAU);ctx.fill();
 ctx.fillStyle='#120a06';ctx.beginPath();ctx.ellipse(0,5,w-12,3.4,0,0,TAU);ctx.fill();
 ctx.lineWidth=1;ctx.strokeStyle='rgba(255,226,180,.9)';ctx.beginPath();ctx.ellipse(0,5,w-.5,5.2,0,Math.PI*1.02,Math.PI*1.98);ctx.stroke();
 ctx.strokeStyle='rgba(255,180,100,.85)';ctx.beginPath();ctx.ellipse(0,15,w,5.5,0,.05,Math.PI-.05);ctx.stroke();ctx.strokeStyle='rgba(255,200,150,.25)';ctx.beginPath();ctx.ellipse(0,10,w,5.5,0,.05,Math.PI-.05);ctx.stroke();
 ctx.strokeStyle='rgba(255,210,160,.35)';ctx.beginPath();ctx.ellipse(0,5,w-12,3.4,0,0,TAU);ctx.stroke();
 ctx.restore();
}
function areia(ctx,f,t,fluindo){
 const topo=nivelSuperior(1-f),fundo=nivelInferior(f);
 const cor=(y0,y1)=>{const g=ctx.createLinearGradient(0,y0-MEIO,0,y1-MEIO);g.addColorStop(0,'#f9c98c');g.addColorStop(.25,'#d98a45');g.addColorStop(1,'#7c3b14');return g;};
 ctx.save();contorno(ctx,3.2);ctx.clip();
 /* areia de cima, com cratera que afunda conforme escoa */
 if(f<1){const prof=Math.min(14,4+f*26);ctx.fillStyle=cor(topo,MEIO);ctx.beginPath();const w=meia(topo);ctx.moveTo(-w-2,topo-MEIO);
  for(let x=-w;x<=w;x+=2){const k=x/w;ctx.lineTo(x,topo-MEIO+prof*(1-k*k)*(f>0?1:0));}
  ctx.lineTo(w+2,topo-MEIO);ctx.lineTo(8,0);ctx.lineTo(-8,0);ctx.closePath();ctx.fill();}
 /* monte de baixo */
 if(f>0){const w=meia(fundo),monte=Math.min(16,3+f*22);ctx.fillStyle=cor(fundo-monte,ALT-19);ctx.beginPath();ctx.moveTo(-70,ALT-19-MEIO);ctx.lineTo(-70,fundo-MEIO);
  for(let x=-w-4;x<=w+4;x+=2){const k=Math.max(-1,Math.min(1,x/(w+4)));ctx.lineTo(x,fundo-MEIO-monte*(1-k*k)*(1-.3*k*k));}
  ctx.lineTo(70,fundo-MEIO);ctx.lineTo(70,ALT-19-MEIO);ctx.closePath();ctx.fill();}
 /* textura de grãos fixa */
 for(let i=0;i<420;i++){const sup=i%2===0;if(sup&&f>=1)continue;if(!sup&&f<=0)continue;const y0=sup?topo+2:fundo-14,y1=sup?MEIO-2:ALT-19,y=y0+grao(i*3.1)*(y1-y0),w=meia(y)-4,x=(grao(i*7.7)*2-1)*w,l=grao(i*1.3);ctx.fillStyle=l>.6?'rgba(255,225,170,.55)':'rgba(70,30,8,.35)';ctx.fillRect(x,y-MEIO,1,1);}
 /* brilho quente no monte e na superfície */
 ctx.globalCompositeOperation='lighter';
 if(f>0){const yb=fundo-Math.min(16,3+f*22)-MEIO,h=ctx.createRadialGradient(0,yb+6,0,0,yb+6,46);h.addColorStop(0,'rgba(255,245,215,.9)');h.addColorStop(.3,'rgba(255,190,110,.45)');h.addColorStop(1,'rgba(255,140,60,0)');ctx.fillStyle=h;ctx.fillRect(-60,yb-40,120,90);}
 if(f<1){const w=meia(topo);const h=ctx.createLinearGradient(0,topo-MEIO-2,0,topo-MEIO+8);h.addColorStop(0,'rgba(255,230,180,0)');h.addColorStop(.5,'rgba(255,230,180,.55)');h.addColorStop(1,'rgba(255,230,180,0)');ctx.fillStyle=h;ctx.fillRect(-w,topo-MEIO-2,w*2,10);}
 for(let i=0;i<90;i++){const sup=i<45&&f<1,y0=sup?topo+4:fundo-2,y1=sup?MEIO-6:ALT-22;if(!sup&&f<=0)continue;const y=y0+grao(i)*(y1-y0),w=meia(y)-5,x=(grao(i+50)*2-1)*w,a=Math.max(0,Math.sin(t*3+i*1.7));if(a<.5)continue;ctx.fillStyle='rgba(255,240,200,'+(a-.5)*1.4+')';ctx.fillRect(x,y-MEIO,1.2,1.2);}
 ctx.restore();
 /* fio de areia e grãos caindo */
 if(fluindo&&f<1){const yb=fundo-Math.min(16,3+f*22)-MEIO;ctx.globalCompositeOperation='lighter';
  const g=ctx.createLinearGradient(0,0,0,yb);g.addColorStop(0,'rgba(255,215,150,.95)');g.addColorStop(1,'rgba(255,170,80,.6)');ctx.strokeStyle=g;ctx.lineWidth=1.6+Math.sin(t*40)*.3;ctx.beginPath();ctx.moveTo(0,-2);ctx.lineTo(Math.sin(t*23)*.4,yb);ctx.stroke();
  for(let i=0;i<14;i++){const k=(t*1.7+i/14)%1,y=k*yb;ctx.fillStyle='rgba(255,230,180,'+(1-k*.5)+')';ctx.fillRect((grao(i+t%1)-.5)*3,y,1.3,1.3);}
  const sp=ctx.createRadialGradient(0,yb,0,0,yb,18);sp.addColorStop(0,'rgba(255,210,140,.55)');sp.addColorStop(1,'rgba(255,150,60,0)');ctx.fillStyle=sp;ctx.fillRect(-18,yb-18,36,36);}
 ctx.globalCompositeOperation='source-over';
}
let T=0;
function vidro(ctx,brilho){
 /* corpo translúcido */
 contorno(ctx);let g=ctx.createLinearGradient(-60,0,60,0);g.addColorStop(0,'rgba(120,200,210,.07)');g.addColorStop(.5,'rgba(10,20,22,.10)');g.addColorStop(1,'rgba(120,200,210,.06)');ctx.fillStyle=g;ctx.fill();
 /* contorno com luz quente embaixo e fria em cima */
 g=ctx.createLinearGradient(0,-140,0,140);g.addColorStop(0,'rgba(210,245,250,.75)');g.addColorStop(.5,'rgba(255,200,140,.85)');g.addColorStop(1,'rgba(255,175,100,.9)');ctx.strokeStyle=g;ctx.lineWidth=1.6;contorno(ctx);ctx.stroke();
 ctx.strokeStyle='rgba(255,255,255,.07)';ctx.lineWidth=4;contorno(ctx,2.5);ctx.stroke();ctx.strokeStyle='rgba(255,236,210,.35)';ctx.lineWidth=1;contorno(ctx,5);ctx.stroke();
 /* reflexos verticais */
 ctx.globalCompositeOperation='lighter';
 for(const s of [-1,1])for(const [y0,y1] of [[30,128],[178,276]]){g=ctx.createLinearGradient(0,y0-MEIO,0,y1-MEIO);g.addColorStop(0,'rgba(255,255,255,0)');g.addColorStop(.5,'rgba(255,255,255,'+(s<0?.5:.18)+')');g.addColorStop(1,'rgba(255,255,255,0)');ctx.strokeStyle=g;ctx.lineWidth=s<0?3:2;ctx.beginPath();for(let y=y0;y<=y1;y+=3)ctx.lineTo(s*(meia(y)-(s<0?9:7)),y-MEIO);ctx.stroke();}
 /* luz quente refletida no bulbo inferior */
 g=ctx.createRadialGradient(0,110,0,0,110,95);g.addColorStop(0,'rgba(255,170,80,.30)');g.addColorStop(1,'rgba(255,120,40,0)');ctx.fillStyle=g;contorno(ctx);ctx.fill();
 /* poeira dourada flutuando */
 for(let i=0;i<46;i++){const ty=17+grao(i*5.3)*271,w=meia(ty)-6,x=(grao(i*9.1)*2-1)*w+Math.sin(T*.6+i)*2,y=ty-MEIO+Math.sin(T*.4+i*2)*3,a=.35+.65*Math.max(0,Math.sin(T*1.7+i*3));ctx.fillStyle='rgba(255,214,160,'+a*.75+')';ctx.fillRect(x,y,1.1,1.1);}
 /* brilho interno do gargalo */
 const rb=40*brilho;g=ctx.createRadialGradient(0,0,0,0,0,rb);g.addColorStop(0,'rgba(255,200,130,.55)');g.addColorStop(1,'rgba(255,140,60,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(0,0,rb,0,TAU);ctx.fill();
 ctx.globalCompositeOperation='source-over';
}

const faiscas=Array.from({length:60},(_,i)=>({a:grao(i)*TAU,v:.6+grao(i+9)*1.4,r:60+grao(i+3)*70,s:.6+grao(i+5)*1.6}));
export function desenharAmpulheta(ctx,ms){
 const e=estadoAmpulheta(ms),t=ms/1000;T=t;
 ctx.clearRect(0,0,341,341);
 let ang=0,esc=1,sobe=0,carga=0,pouso=0;
 if(e.girando){const g=e.g;
  if(g<.16)carga=g/.16;
  else if(g<.82){const k=ease((g-.16)/.66);carga=1-k*.4;ang=Math.PI*k;esc=1-.36*Math.sin(Math.PI*k);sobe=-26*Math.sin(Math.PI*k);}
  else{pouso=(g-.82)/.18;ang=Math.PI;carga=.6*(1-pouso);}
 }
 /* halo de fundo */
 ctx.globalCompositeOperation='lighter';
 let g=ctx.createRadialGradient(CX,CY+sobe,0,CX,CY+sobe,150);g.addColorStop(0,'rgba(255,160,70,'+(.16+.25*carga)+')');g.addColorStop(1,'rgba(255,120,40,0)');ctx.fillStyle=g;ctx.fillRect(0,0,341,341);
 ctx.globalCompositeOperation='source-over';
 ctx.save();ctx.translate(CX,CY+sobe);ctx.rotate(ang);ctx.scale(esc,esc);
 if(!e.girando)areia(ctx,e.f,t,true);
 else{/* depois da metade do giro a areia escorre para o gargalo: o estado inicial espelhado */
  const k=ang/Math.PI,a1=Math.max(0,Math.min(1,(.62-k)/.24));
  if(a1>0){ctx.globalAlpha=a1;areia(ctx,1,t,false);}
  if(a1<1){ctx.globalAlpha=1-a1;ctx.save();ctx.scale(1,-1);areia(ctx,0,t,false);ctx.restore();}
  ctx.globalAlpha=1;}
 vidro(ctx,1+carga*.8+(e.girando?0:.15*Math.sin(t*2)));
 tampa(ctx,-MEIO,false);tampa(ctx,MEIO,true);
 ctx.restore();
 /* coreografia do giro: redemoinho de faíscas, rastro nas tampas, anel e choque */
 if(e.girando){ctx.globalCompositeOperation='lighter';const g0=e.g;
  for(const f of faiscas){const a=f.a+t*f.v*3,rr=f.r*(.6+.4*carga),x=CX+Math.cos(a)*rr,y=CY+sobe+Math.sin(a)*rr*.45;ctx.fillStyle='rgba(255,'+(190+40*Math.sin(a)|0)+',120,'+(.85*carga)+')';ctx.beginPath();ctx.arc(x,y,f.s*carga,0,TAU);ctx.fill();}
  if(g0>.16&&g0<.9){for(const lado of [-1,1])for(let i=0;i<22;i++){const k=Math.max(0,ease(Math.min(1,(g0-.16)/.66))-i*.012),a=Math.PI*k,rr=MEIO*(1-.36*Math.sin(Math.PI*k)),x=CX-Math.sin(a)*rr*lado,y=CY-26*Math.sin(Math.PI*k)+Math.cos(a)*rr*lado*-1;ctx.fillStyle='rgba(255,'+(220-i*4)+',150,'+(.8*(1-i/22))+')';ctx.beginPath();ctx.arc(x,y,3.2*(1-i/26),0,TAU);ctx.fill();}}
  if(g0>.4&&g0<.62){const k=(g0-.4)/.22;ctx.strokeStyle='rgba(255,220,170,'+(1-k)+')';ctx.lineWidth=2.5*(1-k)+.5;ctx.beginPath();ctx.ellipse(CX,CY-26,40+k*150,(40+k*150)*.32,0,0,TAU);ctx.stroke();}
  if(pouso>0){const by=CY+MEIO;for(let j=0;j<3;j++){const k=Math.min(1,pouso*1.3-j*.15);if(k<=0)continue;ctx.strokeStyle='rgba(255,190,110,'+(.8*(1-k))+')';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(CX,by,55+k*115,(55+k*115)*.14,0,0,TAU);ctx.stroke();}
   for(let i=0;i<26;i++){const a=Math.PI+grao(i)*Math.PI,v=40+grao(i+7)*70,x=CX+Math.cos(a)*v*pouso*1.4,y=by+Math.sin(a)*v*pouso*.6+60*pouso*pouso;ctx.fillStyle='rgba(255,210,150,'+(1-pouso)+')';ctx.fillRect(x,y,1.6,1.6);}}
  ctx.globalCompositeOperation='source-over';}
}
