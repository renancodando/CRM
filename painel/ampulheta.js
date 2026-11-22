/* Ampulheta do Fluxo Comercial.
   Vidro, tampas e reflexos são camadas recortadas da arte de referência; a areia
   usa a textura da própria foto, remapeada linha a linha conforme o nível.
   Ciclo: a areia escoa em exatamente 2 minutos (relógio absoluto), depois uma
   sequência de 7,6 s: último grão, filigrana de luz no contorno, levitação,
   anéis orbitais em 3D, giro de 180° com a areia rolando pelo gargalo, clarão,
   descida com mola, impacto na rocha e onda de luz que reacende a areia. */
export const ESCOAR=120000,GIRO=7600,CICLO_AMPULHETA=ESCOAR+GIRO;
const TAU=Math.PI*2;
const CX=1588.5,CY=359,IX=1520,IY=200,IW=138,IH=320;      // pixels da arte
const OX=1417,OY=160,HX=1488,HY=182,HW=184,HH=350;           // halo do repouso                                      // canto do canvas (341 × 371)
const LX=CX-OX,LY=CY-OY;                                   // centro no canvas
const P=[[209,40],[214,48],[221,48],[226,47],[233,51],[242,56.5],[251,59.5],[262,60.5],[275,60.5],[287,59.5],[296,54],[305,47.5],[314,40.5],[320,35],[326,29.5],[332,26],[338,21.5],[344,16.5],[350,14],[356,11],[359,9.5],[365,11.5],[371,12.5],[380,16.5],[386,21],[392,25.5],[398,30.5],[404,34.5],[410,39.5],[416,43.5],[422,47.5],[431,52.5],[440,56.5],[449,59.5],[458,60.5],[470,60.5],[479,59.5],[485,57.5],[491,54.5],[497,50]];
const w=y=>{if(y<=P[0][0])return P[0][1];for(let i=1;i<P.length;i++)if(y<=P[i][0]){const [a,wa]=P[i-1],[b,wb]=P[i];return wa+(wb-wa)*(y-a)/(b-a);}return P.at(-1)[1];};
const wi=y=>Math.max(1.2,w(y)-4.2);
const NECK=359,TOPO_I=229,FUNDO_I=496,BASE_MONTE=494,INCL=.43,L0=286;
/* volumes (fatias de π·r²) */
const PASSO=.5;
const volTopo=[];{let v=0;for(let y=NECK;y>=TOPO_I;y-=PASSO){v+=Math.PI*wi(y)**2*PASSO;volTopo.push([y,v]);}}
const volFundo=[];{let v=0;for(let y=FUNDO_I;y>=NECK;y-=PASSO){v+=Math.PI*wi(y)**2*PASSO;volFundo.push([y,v]);}}
const busca=(tab,v)=>{for(const [y,a] of tab)if(a>=v)return y;return tab.at(-1)[0];};
const VOL=volTopo.find(([y])=>y<=L0)[1];
const R0=wi(BASE_MONTE),CONE_MAX=Math.PI/3*INCL*R0**3;
function geometria(f){
 const top=Math.max(0,1-f)*VOL,lt=top>0?busca(volTopo,top):NECK;
 const vb=Math.min(1,f)*VOL;let apice=FUNDO_I,base=FUNDO_I,raio=0,corpo=FUNDO_I;
 if(vb>0){if(vb<=CONE_MAX){raio=Math.cbrt(3*vb/(Math.PI*INCL));base=BASE_MONTE;apice=base-raio*INCL;}
  else{corpo=busca(volFundo,vb-CONE_MAX);base=corpo;raio=wi(corpo);apice=corpo-raio*INCL;}}
 return {lt,apice,base,raio,corpo,vazio:top<=0};
}
export function estadoAmpulheta(ms){
 const fase=((ms%CICLO_AMPULHETA)+CICLO_AMPULHETA)%CICLO_AMPULHETA;
 return fase<ESCOAR?{fase,f:fase/ESCOAR,girando:false,restante:ESCOAR-fase}:{fase,f:1,girando:true,g:(fase-ESCOAR)/GIRO,s:(fase-ESCOAR)/1000,restante:ESCOAR};
}
/* camadas da arte */
const img=n=>{if(typeof Image==='undefined')return null;const i=new Image();i.decoding='async';i.src=new URL('../ativos/painel/ampulheta-'+n+'.webp',import.meta.url).href;return i;};
const IMG={vidro:img('vidro'),areia:img('areia'),reflexo:img('reflexo'),halo:img('halo')};
const pronta=i=>i&&i.complete&&i.naturalWidth>0;
const ruido=i=>{const x=Math.sin(i*127.1+311.7)*43758.5453;return x-Math.floor(x);};
const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));
const fase=(s,a,b)=>clamp((s-a)/(b-a));
const io=x=>x<.5?4*x*x*x:1-Math.pow(-2*x+2,3)/2;
const sai=x=>1-Math.pow(1-x,3);

function caminhoInterior(ctx){ctx.beginPath();for(let y=TOPO_I;y<=FUNDO_I;y+=1.5)ctx.lineTo(-wi(y),y-CY);for(let y=FUNDO_I;y>=TOPO_I;y-=1.5)ctx.lineTo(wi(y),y-CY);ctx.closePath();}
function caminhoExterno(ctx){ctx.beginPath();for(let y=209;y<=497;y+=1.5)ctx.lineTo(-w(y)-1,y-CY);ctx.lineTo(-61,498-CY);ctx.lineTo(-61,514-CY);ctx.lineTo(61,514-CY);ctx.lineTo(61,498-CY);for(let y=497;y>=209;y-=1.5)ctx.lineTo(w(y)+1,y-CY);ctx.closePath();}
/* uma linha da textura da foto esticada para a largura do interior */
function linha(ctx,ys,meiaFonte,yd,meiaDest,alt=1){
 const i=IMG.areia,k=2;if(meiaFonte<=.3||meiaDest<=.3)return;
 ctx.drawImage(i,(CX-meiaFonte-IX)*k,(ys-IY)*k,meiaFonte*2*k,2,-meiaDest,yd-CY,meiaDest*2,alt);
}
function areia(ctx,f,t,intens=1){
 const g=geometria(f);
 if(!pronta(IMG.areia))return g;
 ctx.save();caminhoInterior(ctx);ctx.clip();
 /* bulbo de cima: superfície remapeada (297 → nível, 358 → gargalo) */
 if(!g.vazio){const L=g.lt,alt=NECK-L;for(let y=L;y<NECK;y+=.5){const s=297+(y-L)/alt*61;linha(ctx,s,wi(s),y,wi(y),.75);}
  /* cratera que afunda no centro conforme escoa */
  const cr=Math.min(wi(L)*.55,6+f*40),dp=Math.min(7,1+f*10);
  let gr=ctx.createRadialGradient(0,L-CY+dp*.6,0,0,L-CY+dp*.6,cr);gr.addColorStop(0,'rgba(60,22,6,.55)');gr.addColorStop(.7,'rgba(90,40,12,.18)');gr.addColorStop(1,'rgba(90,40,12,0)');ctx.fillStyle=gr;ctx.beginPath();ctx.ellipse(0,L-CY+dp*.6,cr,dp+2,0,0,TAU);ctx.fill();
  ctx.globalCompositeOperation='lighter';ctx.strokeStyle='rgba(255,225,170,.35)';ctx.lineWidth=.8;ctx.beginPath();ctx.ellipse(0,L-CY+.5,cr,dp*.5+1,0,Math.PI*.05,Math.PI*.95);ctx.stroke();
  /* grãos escorregando para a cratera */
  for(let i=0;i<10;i++){const k=(t*.35+ruido(i))%1,lado=i%2?1:-1,x=lado*(wi(L)-2)*(1-k),y=L-CY+1+k*dp;ctx.fillStyle='rgba(255,230,180,'+(.5*(1-k))+')';ctx.fillRect(x,y,1,1);}
  ctx.globalCompositeOperation='source-over';}
 /* bulbo de baixo: corpo com textura densa + monte cônico da foto */
 if(g.raio>0){
  for(let y=g.corpo;y<FUNDO_I+1;y+=.5){const s=320+((y-g.corpo)%36);linha(ctx,s,wi(s),y,wi(y),.75);}
  const h=g.base-g.apice;for(let y=g.apice;y<g.base;y+=.5){const q=(y-g.apice)/h,s=473+q*21,mf=clamp((s-473)/21)*47+.5;linha(ctx,s,mf,y,Math.max(.6,q*g.raio),.75);}
 }
 ctx.restore();
 /* brilho de brasa no monte e cintilação dos grãos */
 ctx.save();ctx.globalCompositeOperation='lighter';
 if(g.raio>0){const yy=g.apice+Math.max(4,(g.base-g.apice)*.55)-CY,rr=Math.max(14,g.raio*.9),gr=ctx.createRadialGradient(0,yy,0,0,yy,rr);gr.addColorStop(0,'rgba(255,246,222,'+(.55*intens)+')');gr.addColorStop(.35,'rgba(255,196,120,'+(.28*intens)+')');gr.addColorStop(1,'rgba(255,150,60,0)');ctx.fillStyle=gr;ctx.fillRect(-rr,yy-rr,rr*2,rr*2);}
 for(let i=0;i<70;i++){const cima=i<36;if(cima&&g.vazio)continue;if(!cima&&g.raio<=0)continue;
  const y=cima?g.lt+ruido(i*3.3)*(NECK-g.lt-2):g.apice+3+ruido(i*3.3)*(FUNDO_I-g.apice-3),x=(ruido(i*7.9)*2-1)*(wi(y)-3)*(cima?1:clamp((y-g.apice)/Math.max(1,g.base-g.apice))),a=Math.sin(t*(2+ruido(i)*3)+i*2.1);
  if(a<.55)continue;const al=(a-.55)*2.2*intens;ctx.fillStyle='rgba(255,244,215,'+al+')';ctx.fillRect(x-.6,y-CY-.6,1.2,1.2);if(a>.93){ctx.fillRect(x-2,y-CY-.25,4,.5);ctx.fillRect(x-.25,y-CY-2,.5,4);}}
 ctx.restore();
 return g;
}
/* fio de areia, grãos caindo e respingos no monte */
function fio(ctx,g,t,f){
 if(!g||g.vazio)return;
 const y0=NECK-CY+1,y1=g.apice-CY,len=y1-y0;if(len<=0)return;
 ctx.save();ctx.globalCompositeOperation='lighter';
 let gr=ctx.createLinearGradient(0,y0,0,y1);gr.addColorStop(0,'rgba(255,238,200,.95)');gr.addColorStop(.6,'rgba(255,210,150,.75)');gr.addColorStop(1,'rgba(255,190,110,.9)');
 ctx.strokeStyle='rgba(255,170,80,.12)';ctx.lineWidth=7;ctx.beginPath();ctx.moveTo(0,y0);ctx.lineTo(0,y1);ctx.stroke();
 ctx.strokeStyle=gr;ctx.lineWidth=1.25+Math.sin(t*37)*.18;ctx.beginPath();ctx.moveTo(0,y0);for(let y=y0;y<=y1;y+=6)ctx.lineTo(Math.sin(y*.3+t*21)*.35,y);ctx.lineTo(0,y1);ctx.stroke();
 for(let i=0;i<34;i++){const k=(t*(1.1+ruido(i)*.5)+ruido(i*5))%1,y=y0+k*k*len,x=(ruido(i*9)-.5)*(1+k*2.2);ctx.fillStyle='rgba(255,236,196,'+(.9-k*.4)+')';ctx.fillRect(x-.5,y,1,1.6);}
 /* respingos rolando pelas encostas */
 for(let i=0;i<16;i++){const per=.55+ruido(i*2)*.5,k=((t+ruido(i*4)*per)%per)/per,lado=i%2?1:-1,ang=.35+ruido(i*6)*.5,vx=lado*(5+ruido(i)*9),x=vx*k*3,y=y1-Math.sin(ang)*14*k+28*k*k;ctx.fillStyle='rgba(255,226,170,'+(.85*(1-k))+')';ctx.fillRect(x,y-1,1.1,1.1);}
 /* deslizamentos ocasionais na encosta */
 const ciclo=(t%5.3)/5.3;if(ciclo<.18&&g.raio>6){const k=ciclo/.18,lado=Math.floor(t/5.3)%2?1:-1;for(let j=0;j<8;j++){const q=clamp(k-j*.03),x=lado*q*g.raio*.85,y=y1+q*(g.base-g.apice);ctx.fillStyle='rgba(255,230,180,'+(.6*(1-j/8))+')';ctx.fillRect(x,y,1.3,1);}}
 /* clarão no gargalo */
 gr=ctx.createRadialGradient(0,0,0,0,0,9);gr.addColorStop(0,'rgba(255,240,210,.8)');gr.addColorStop(1,'rgba(255,170,80,0)');ctx.fillStyle=gr;ctx.fillRect(-9,-9,18,18);
 ctx.restore();
}
/* anel em 3D projetado; desenha só a metade de trás ou da frente */
function anel(ctx,R,inclX,inclZ,giro,metade,cor,alfa,eletrons,t){
 const ci=Math.cos(inclX),si=Math.sin(inclX),cz=Math.cos(inclZ),sz=Math.sin(inclZ),pt=a=>{let x=Math.cos(a)*R,y=0,z=Math.sin(a)*R;const y2=y*ci-z*si,z2=y*si+z*ci;return [x*cz-y2*sz,x*sz+y2*cz,z2];};
 ctx.lineCap='round';
 for(let i=0;i<72;i++){const a=i/72*TAU+giro,b=(i+1)/72*TAU+giro,p=pt(a),q=pt(b);if((p[2]<0)!==(metade==='tras'))continue;const fr=metade==='tras'?.35:1;
  ctx.strokeStyle='rgba('+cor+','+alfa*fr+')';ctx.lineWidth=1.3;ctx.beginPath();ctx.moveTo(p[0],p[1]);ctx.lineTo(q[0],q[1]);ctx.stroke();}
 for(let e=0;e<eletrons;e++){const a=t*(1.6+e*.4)+e*TAU/eletrons,p=pt(a);if((p[2]<0)!==(metade==='tras'))continue;const g=ctx.createRadialGradient(p[0],p[1],0,p[0],p[1],7);g.addColorStop(0,'rgba(255,250,235,'+alfa+')');g.addColorStop(1,'rgba('+cor+',0)');ctx.fillStyle=g;ctx.fillRect(p[0]-7,p[1]-7,14,14);}
}
/* filigrana de luz percorrendo o contorno do vidro */
function filigrana(ctx,p,alfa){
 if(p<=0||alfa<=0)return;ctx.save();ctx.globalCompositeOperation='lighter';
 const ate=497-(497-209)*p;
 for(const lado of [-1,1]){ctx.strokeStyle='rgba(255,205,130,'+(.85*alfa)+')';ctx.lineWidth=1.4;ctx.shadowColor='rgba(255,170,80,.9)';ctx.shadowBlur=6;ctx.beginPath();for(let y=497;y>=ate;y-=2)ctx.lineTo(lado*(w(y)-.5),y-CY);ctx.stroke();
  const hx=lado*w(ate),hy=ate-CY,g=ctx.createRadialGradient(hx,hy,0,hx,hy,10);g.addColorStop(0,'rgba(255,250,230,'+alfa+')');g.addColorStop(1,'rgba(255,180,90,0)');ctx.shadowBlur=0;ctx.fillStyle=g;ctx.fillRect(hx-10,hy-10,20,20);}
 ctx.restore();
}
/* grãos rolando dentro do vidro durante o giro, sob a gravidade local */
const graos=Array.from({length:90},(_,i)=>({u:ruido(i*1.7),v:ruido(i*2.9),s:.6+ruido(i*3.7)*.9}));
function rolagem(ctx,theta,intens,t,cima){
 if(intens<=0)return;ctx.save();caminhoInterior(ctx);ctx.clip();ctx.globalCompositeOperation='lighter';
 const gy=Math.cos(theta);  // componente da gravidade ao longo do eixo local
 for(let i=0;i<graos.length;i++){const g=graos[i],k=(t*(.55+g.s*.4)+g.u)%1;
  const yy=cima?-126+k*122:8+k*122,ww=Math.max(1,wi(yy+CY)-2),x=clamp((g.v*2-1)*ww*.92+Math.sin(theta)*k*10*gy,-ww,ww);
  ctx.fillStyle='rgba(255,'+(210+g.s*30|0)+',150,'+(.75*intens*Math.sin(k*Math.PI))+')';ctx.fillRect(x,yy,g.s+.4,g.s+.4);}
 ctx.restore();
}
function desenharPeca(ctx,f,t,intensAreia,flipAreia){
 if(pronta(IMG.vidro))ctx.drawImage(IMG.vidro,IX-CX,IY-CY,IW,IH);
 let g;
 if(flipAreia){ctx.save();ctx.scale(1,-1);g=areia(ctx,f,t,intensAreia);ctx.restore();}
 else g=areia(ctx,f,t,intensAreia);
 if(pronta(IMG.reflexo)){ctx.save();ctx.globalCompositeOperation='screen';ctx.drawImage(IMG.reflexo,IX-CX,IY-CY,IW,IH);ctx.restore();}
 return g;
}
const faiscas=Array.from({length:70},(_,i)=>({a:ruido(i)*TAU,y:ruido(i+11)*300-150,r:46+ruido(i+5)*34,v:.7+ruido(i+7)*1.3,s:.6+ruido(i+3)*1.4}));
const poeira=Array.from({length:40},(_,i)=>({x:(ruido(i*4.1)-.5)*130,v:.4+ruido(i*2.3),s:.5+ruido(i*5.1)}));

export function desenharAmpulheta(ctx,ms){
 const e=estadoAmpulheta(ms),t=ms/1000;
 ctx.clearRect(0,0,341,371);
 const rocha=LY+156;  // topo da rocha sob a base, no canvas
 if(!e.girando){
  /* repouso: halo da foto, vidro, areia, fio e respiração de luz */
  if(pronta(IMG.halo))ctx.drawImage(IMG.halo,HX-OX,HY-OY,HW,HH);
  ctx.save();ctx.translate(LX,LY);
  const g=desenharPeca(ctx,e.f,t,1,false);
  fio(ctx,g,t,e.f);
  /* pulso de tempo a cada 30 s e no último segundo */
  const pul=(e.fase%30000)/1000;if(pul<1.4){const k=pul/1.4;ctx.globalCompositeOperation='lighter';ctx.strokeStyle='rgba(255,210,150,'+(.45*(1-k))+')';ctx.lineWidth=1.2;ctx.beginPath();ctx.ellipse(0,0,6+k*70,(6+k*70)*.28,0,0,TAU);ctx.stroke();ctx.globalCompositeOperation='source-over';}
  ctx.restore();
  return;
 }
 /* ---------------- sequência do giro ---------------- */
 const s=e.s;
 const carga=fase(s,0,.8),levita=io(fase(s,.8,1.8)),gira=io(fase(s,1.8,4.6)),desce=fase(s,4.6,5.6),impacto=fase(s,5.6,6.6),renasce=fase(s,6.6,7.6);
 let lift=-26*levita;if(s>=4.6){const d=sai(desce);lift=-26*(1-d);if(s>5.6){const q=s-5.6;lift=-3.2*Math.exp(-q*5)*Math.sin(q*18);}}
 const escala=1-.46*Math.sin(Math.PI*gira);
 const theta=Math.PI*gira,trocou=theta>Math.PI/2,ang=trocou?theta-Math.PI:theta;
 const anelA=clamp(levita*1.2)*(1-clamp((s-4.8)/.8));
 const halo=1-clamp(s/0.9)+clamp((s-6.8)/.8);
 ctx.save();
 if(pronta(IMG.halo)&&halo>0){ctx.globalAlpha=clamp(halo);ctx.drawImage(IMG.halo,HX-OX,HY-OY,HW,HH);ctx.globalAlpha=1;}
 /* brilho de fundo */
 ctx.globalCompositeOperation='lighter';
 const brilho=.1+.35*carga*(1-gira*.3)+.4*Math.sin(Math.PI*fase(s,3,3.4));
 let gr=ctx.createRadialGradient(LX,LY+lift,0,LX,LY+lift,160);gr.addColorStop(0,'rgba(255,165,70,'+brilho+')');gr.addColorStop(1,'rgba(255,120,40,0)');ctx.fillStyle=gr;ctx.fillRect(0,0,341,371);
 /* poeira subindo da rocha durante a levitação */
 if(s>.8&&s<4.8)for(const p of poeira){const k=((s-.8)*p.v*.35+p.s)%1;ctx.fillStyle='rgba(255,200,140,'+(.5*(1-k)*anelA)+')';ctx.fillRect(LX+p.x*(1+k*.5),rocha-k*120,1.2,1.2);}
 ctx.globalCompositeOperation='source-over';
 ctx.translate(LX,LY+lift);
 /* metade de trás dos anéis e da hélice de faíscas */
 if(anelA>0){ctx.globalCompositeOperation='lighter';
  anel(ctx,76,1.32,-.22,t*1.9*(1+gira*2),'tras','255,190,110',.8*anelA,3,t);
  anel(ctx,70,1.15,.38,-t*2.4*(1+gira*2),'tras','110,240,215',.65*anelA,2,t);
  for(const f of faiscas){const a=f.a+t*f.v*2.2,z=Math.sin(a);if(z>=0)continue;ctx.fillStyle='rgba(255,'+(190+f.s*30|0)+',120,'+(.45*anelA)+')';ctx.fillRect(Math.cos(a)*f.r*.95,((f.y+t*40*f.v)%300+300)%300-150,f.s,f.s);}
  ctx.globalCompositeOperation='source-over';}
 /* a peça: rastro de movimento, depois a peça nítida */
 ctx.save();ctx.scale(escala,escala);
 if(gira>0&&gira<1){for(let k=3;k>=1;k--){const th=Math.PI*io(fase(s-k*.035,1.8,4.6)),tr=th>Math.PI/2;ctx.save();ctx.rotate(tr?th-Math.PI:th);ctx.globalAlpha=.16;if(pronta(IMG.vidro))ctx.drawImage(IMG.vidro,IX-CX,IY-CY,IW,IH);ctx.restore();}ctx.globalAlpha=1;}
 ctx.rotate(ang);
 const fArea=trocou?0:1;
 const intens=1+carga*.6+renasce*(1-renasce)*2.2;
 desenharPeca(ctx,fArea,t,intens,false);
 if(gira>0&&gira<1)rolagem(ctx,ang,Math.sin(Math.PI*gira),t,trocou);
 /* filigrana de luz no contorno (carga) e onda que sobe ao renascer */
 filigrana(ctx,sai(carga),1-fase(s,1.2,2.2));
 if(renasce>0){ctx.save();caminhoExterno(ctx);ctx.clip();ctx.globalCompositeOperation='lighter';const yb=160-renasce*330;const g2=ctx.createLinearGradient(0,yb-26,0,yb+26);g2.addColorStop(0,'rgba(255,220,170,0)');g2.addColorStop(.5,'rgba(255,236,200,.55)');g2.addColorStop(1,'rgba(255,220,170,0)');ctx.fillStyle=g2;ctx.fillRect(-70,yb-26,140,52);ctx.restore();}
 /* clarão do gargalo no fim da carga */
 if(carga>0&&s<1.6){ctx.save();ctx.globalCompositeOperation='lighter';const k=Math.sin(Math.PI*fase(s,.4,1.4));const g3=ctx.createRadialGradient(0,0,0,0,0,40);g3.addColorStop(0,'rgba(255,248,225,'+.9*k+')');g3.addColorStop(1,'rgba(255,170,80,0)');ctx.fillStyle=g3;ctx.fillRect(-40,-40,80,80);ctx.restore();}
 ctx.restore();
 /* metade da frente dos anéis, hélice e rastros das tampas */
 ctx.globalCompositeOperation='lighter';
 if(anelA>0){
  anel(ctx,76,1.32,-.22,t*1.9*(1+gira*2),'frente','255,190,110',.9*anelA,3,t);
  anel(ctx,70,1.15,.38,-t*2.4*(1+gira*2),'frente','110,240,215',.75*anelA,2,t);
  for(const f of faiscas){const a=f.a+t*f.v*2.2,z=Math.sin(a);if(z<0)continue;ctx.fillStyle='rgba(255,'+(200+f.s*30|0)+',140,'+(.9*anelA)+')';ctx.beginPath();ctx.arc(Math.cos(a)*f.r*.95,((f.y+t*40*f.v)%300+300)%300-150,f.s*.9,0,TAU);ctx.fill();}
 }
 if(gira>0&&gira<1){for(const lado of [-1,1])for(let i=0;i<26;i++){const th=Math.PI*io(fase(s-i*.012,1.8,4.6)),sc=1-.46*Math.sin(th),x=-Math.sin(th)*150*sc*lado,y=Math.cos(th)*150*sc*lado;ctx.fillStyle='rgba(255,'+(230-i*4)+',170,'+(.85*(1-i/26))+')';ctx.beginPath();ctx.arc(x,y,3.4*(1-i/30),0,TAU);ctx.fill();}}
 /* clarão na troca (peça na horizontal) e faixa anamórfica */
 const cl=Math.max(0,1-Math.abs(s-3.2)/.32);
 if(cl>0){const g4=ctx.createRadialGradient(0,0,0,0,0,110);g4.addColorStop(0,'rgba(255,250,236,'+cl+')');g4.addColorStop(.25,'rgba(255,205,130,'+.55*cl+')');g4.addColorStop(1,'rgba(255,150,60,0)');ctx.fillStyle=g4;ctx.fillRect(-170,-170,340,340);
  const g5=ctx.createLinearGradient(-170,0,170,0);g5.addColorStop(0,'rgba(255,200,140,0)');g5.addColorStop(.5,'rgba(255,240,220,'+.8*cl+')');g5.addColorStop(1,'rgba(255,200,140,0)');ctx.fillStyle=g5;ctx.fillRect(-170,-1.5,340,3);
  ctx.strokeStyle='rgba(255,230,190,'+.7*cl+')';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(0,0,40+(1-cl)*120,(40+(1-cl)*120)*.3,0,0,TAU);ctx.stroke();}
 /* anéis colapsando em luz no gargalo durante a descida */
 if(s>4.6&&s<5.6){const k=fase(s,4.6,5.5);for(let j=0;j<2;j++){ctx.strokeStyle='rgba(255,215,160,'+(.7*(1-k))+')';ctx.lineWidth=1.4;ctx.beginPath();ctx.ellipse(0,0,(76-j*6)*(1-k),(20-j*4)*(1-k)+1,j?.38:-.22,0,TAU);ctx.stroke();}}
 ctx.restore();
 /* impacto na rocha: ondas, faíscas com quique, rocha acesa */
 if(impacto>0&&impacto<1){ctx.save();ctx.globalCompositeOperation='lighter';
  for(let j=0;j<3;j++){const k=clamp(impacto*1.25-j*.14);if(k<=0)continue;ctx.strokeStyle='rgba(255,196,120,'+(.85*(1-k))+')';ctx.lineWidth=2.2*(1-k)+.4;ctx.beginPath();ctx.ellipse(LX,rocha,58+k*95,(58+k*95)*.13,0,0,TAU);ctx.stroke();}
  const gr2=ctx.createRadialGradient(LX,rocha,0,LX,rocha,90);gr2.addColorStop(0,'rgba(255,210,140,'+(.7*(1-impacto))+')');gr2.addColorStop(1,'rgba(255,140,50,0)');ctx.fillStyle=gr2;ctx.fillRect(LX-90,rocha-50,180,100);
  for(let i=0;i<40;i++){const a=Math.PI+ruido(i)*Math.PI,v=50+ruido(i+7)*90,q=impacto*1.1,x=LX+Math.cos(a)*v*q,y=rocha+Math.sin(a)*v*q*.7+95*q*q;if(y>rocha+4)continue;ctx.fillStyle='rgba(255,'+(200+ruido(i)*50|0)+',150,'+(1-impacto)+')';ctx.fillRect(x,y,1.6,1.6);}
  ctx.restore();}
}
