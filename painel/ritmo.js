/* Ritmo de Prospecção. A arte do gráfico é a da referência (fitas, malha de
   relevo, pontos da base e o pico de cobre); cada coluna é esticada para a
   curva dos envios confirmados e o brilho de cobre vai para o dia de maior
   volume. Animações: respiração das fitas, aurora em paralaxe, batimento que
   percorre a curva (sincronizado com o ícone), cometas, faróis com raios,
   coluna de luz e brasas no pico, gotas de luz nas linhas de queda, varredura
   que acende os marcadores, ondas na base, revelação inicial e mudança suave
   de valores. Mouse, toque e teclado mostram o valor exato de cada dia. */
const TAU=Math.PI*2,X0=48,X1=638,Y0=600,Y1=756,LARG=X1-X0,ALT=Y1-Y0,BASE=750,Y_ZERO=724,Y_MAX=648,PICO_REF=427;
const CURVA_REF=[736.9,735.7,734.9,734.5,734.2,733.8,733.5,734.2,734.8,734.4,734.1,733.8,733.3,733,732.7,732.2,731.9,731.6,731.2,730.8,730.3,729.7,729,728.2,727.2,726.2,725.2,724.2,723.2,722.1,721,719.9,718.8,717.8,716.8,716,715.2,714.5,713.8,713.2,712.8,712.4,712,711.7,711.8,712,711.8,711.7,711.8,711.9,712.1,711.8,712.1,712.5,713,713.3,713.7,714.1,714.4,714.5,714.8,715.2,715.5,715.6,715.8,715.8,715.8,715.6,715.5,715.2,714.8,714.5,714.2,714.5,714.6,714.1,713.5,712.8,712.1,711.2,709.8,708.3,707.4,706.4,705.3,704.2,703.1,701.8,700.5,699.2,697.8,696.5,695.2,693.9,692.8,691.7,690.7,689.7,688.7,687.8,686.8,686.2,685.2,684.4,683.5,682.8,682.2,681.5,681.2,681.5,682.2,682.8,683.5,683.7,683.8,683.9,683.6,683.2,683.1,683.2,683.8,684.5,685.1,685.8,686.6,687.5,688.4,689.3,690.3,691.5,692.8,694.2,695.5,696.8,698.1,699.1,699.9,700.7,701.3,701.8,702.3,702.5,702.5,702.5,702.3,702.2,701.9,701.7,701.5,701.2,700.6,699.9,699.1,698.2,697.1,695.8,694.5,693,691.5,690,688.5,687.2,685.8,684.4,682.9,682.4,680.7,679,677.3,675.5,674.1,672.5,671.5,669.5,667.6,665.8,663.8,661.5,658.8,656.7,655.4,654.1,652.9,651.8,651,650.4,649.7,649.2,649.2,649.2,649.3,649.5,649.8,650.5,651.1,651.8,652.7,653.8,655.2,656.6,659.9,662.6,665,667.4,669.5,671.2,672.2,673.6,675.5,677.1,678.5,680.1,681.8,683.8,684.7,685.5,686.9,688.3,689.6,690.5,690.8,691.9,692.9,693.8,694.7,695.4,696.2,696.8,698.3,699.7,701,702.2,703.4,704.4,704.8,704.5,704,703.4,702.9,702.3,701.7,701.2,700.6,701,701.4,701.7,702,702.2,701.9,701.1,699.7,698.3,697,695.8,694.8,694.3,694.1,693.5,692.8,692.7,692.5,692.4,692.1,691.8,691.8,692,691.6,691.7,691.9,692.2,692.7,693.1,693.5,694.2,694.8,695.5,696.4,697.3,698.2,699.3,700.4,701.5,702.8,704,705.2,706.2,707.2,707.8,708.5,709,709.4,709.8,710,710.5,710.8,711.2];
const curvaRef=x=>{const i=(x-X0)/2,a=Math.max(0,Math.min(CURVA_REF.length-1,Math.floor(i))),b=Math.min(CURVA_REF.length-1,a+1),f=i-a;return CURVA_REF[a]+(CURVA_REF[b]-CURVA_REF[a])*f;};
const PONTOS_DESKTOP=[140,207.5,275,351,427,498.5,570];
const img=n=>{if(typeof Image==='undefined')return null;const i=new Image();i.decoding='async';i.src=new URL('../ativos/painel/ritmo-'+n+'.webp',import.meta.url).href;return i;};
const IMG={base:img('base'),laranja:img('laranja')};
const pronta=i=>i&&i.complete&&i.naturalWidth>0;
const easeOut=x=>1-Math.pow(1-x,3);
const ruido=i=>{const x=Math.sin(i*127.1+311.7)*43758.5453;return x-Math.floor(x);};
/* interpolação monotônica (sem ultrapassar os valores reais) */
function monotona(xs,ys){
 const n=xs.length,d=[],m=new Array(n).fill(0);
 for(let i=0;i<n-1;i++)d.push((ys[i+1]-ys[i])/(xs[i+1]-xs[i]));
 m[0]=d[0];m[n-1]=d[n-2];for(let i=1;i<n-1;i++)m[i]=d[i-1]*d[i]<=0?0:(d[i-1]+d[i])/2;
 for(let i=0;i<n-1;i++){if(d[i]===0){m[i]=m[i+1]=0;continue;}const a=m[i]/d[i],b=m[i+1]/d[i],s=a*a+b*b;if(s>9){const t=3/Math.sqrt(s);m[i]=t*a*d[i];m[i+1]=t*b*d[i];}}
 return x=>{let i=0;while(i<n-2&&x>xs[i+1])i++;const h=xs[i+1]-xs[i],t=Math.max(0,Math.min(1,(x-xs[i])/h)),t2=t*t,t3=t2*t;return (2*t3-3*t2+1)*ys[i]+(t3-2*t2+t)*h*m[i]+(-2*t3+3*t2)*ys[i+1]+(t3-t2)*h*m[i+1];};
}
/* uma coluna da arte: céu deslocado, relevo esticado até a base */
function coluna(ctx,im,xs,xd,y,larg){
 const hs=curvaRef(xs),k=im.naturalWidth/LARG,sx=(xs-X0)*k,sw=Math.max(1,larg*k);
 const cima=hs-Y0;if(cima>0)ctx.drawImage(im,sx,0,sw,cima*k,xd,Y0+(y-hs),larg,cima);
 const baixo=BASE-hs;if(baixo>0)ctx.drawImage(im,sx,cima*k,sw,baixo*k,xd,y,larg,BASE-y);
 ctx.drawImage(im,sx,(BASE-Y0)*k,sw,(Y1-BASE)*k,xd,BASE,larg,Y1-BASE);
}

export function criarRitmo(secao,palco){
 const caixa=secao.querySelector('.pv-grafico'),tela=caixa.querySelector('canvas'),dica=caixa.querySelector('.pv-dica'),botoes=[...secao.querySelectorAll('.pv-dia')];
 let tAnt=null,dias=Array.from({length:7},(_,i)=>({nome:['Seg','Ter','Qua','Qui','Sex','Sáb','Dom'][i],quantidade:0})),hoje=0,sel=null,hover=null,valores=new Array(7).fill(0),alvos=new Array(7).fill(0),entrada=null,mouseX=null,ultimoBatimento=-1;
 const brasas=Array.from({length:36},(_,i)=>({s:ruido(i),v:.5+ruido(i+9)*.9,x:(ruido(i+3)-.5)*30,r:.5+ruido(i+5)*1.3}));
 const cometas=Array.from({length:18},(_,i)=>({k:i/18,v:.035+ruido(i)*.03}));
 const faiscas=[];
 function selecionar(i,anunciar){sel=i;botoes.forEach((b,j)=>{b.classList.toggle('pv-sel',j===i);b.setAttribute('aria-pressed',String(j===i));});if(anunciar)mostrarDica(i);}
 function mostrarDica(i){if(i==null){dica.hidden=true;return;}const d=dias[i];dica.hidden=false;dica.innerHTML='<strong>'+d.nome+'</strong><span>'+d.quantidade+(d.quantidade===1?' mensagem':' mensagens')+(d.futuro?' · ainda não chegou':'')+'</span>';dica.dataset.i=i;}
 botoes.forEach((b,i)=>{b.addEventListener('click',()=>selecionar(i,true));b.addEventListener('mouseenter',()=>{hover=i;mostrarDica(i);});b.addEventListener('mouseleave',()=>{hover=null;mostrarDica(null);});b.addEventListener('focus',()=>{hover=i;mostrarDica(i);});b.addEventListener('blur',()=>{hover=null;mostrarDica(null);});
  b.addEventListener('keydown',e=>{const d=e.key==='ArrowRight'?1:e.key==='ArrowLeft'?-1:0;if(d){e.preventDefault();botoes[(i+d+7)%7].focus();}});});
 const xRef=cx=>X0+cx*LARG;
 function posicoes(){
  if(palco.classList.contains('pv-replica'))return PONTOS_DESKTOP;
  const r=tela.getBoundingClientRect();return botoes.map(b=>{const q=b.getBoundingClientRect();return xRef((q.left+q.width/2-r.left)/r.width);});
 }
 caixa.addEventListener('pointermove',e=>{const r=tela.getBoundingClientRect();mouseX=xRef((e.clientX-r.left)/r.width);const xs=posicoes();let m=0;xs.forEach((x,i)=>{if(Math.abs(x-mouseX)<Math.abs(xs[m]-mouseX))m=i;});hover=m;mostrarDica(m);});
 caixa.addEventListener('pointerleave',()=>{mouseX=null;hover=null;mostrarDica(null);});

 function desenhar(t,qual,parado){
  const r=tela.getBoundingClientRect();if(!r.width)return;
  const dpr=Math.min(devicePixelRatio||1,qual==='alta'?2:qual==='economica'?1:1.5),W=r.width,H=r.height;
  if(tela.width!==Math.round(W*dpr)||tela.height!==Math.round(H*dpr)){tela.width=Math.round(W*dpr);tela.height=Math.round(H*dpr);}
  const ctx=tela.getContext('2d'),sx=W/LARG*dpr,sy=H/ALT*dpr;ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,tela.width,tela.height);
  ctx.setTransform(sx,0,0,sy,-X0*sx,-Y0*sy);
  if(entrada==null)entrada=t;
  const intro=parado?1:easeOut(Math.min(1,(t-entrada)/1.8));
  const dt=tAnt==null?1:Math.min(1,Math.max(0,t-tAnt));tAnt=t;const kl=parado?1:1-Math.exp(-dt*5);for(let i=0;i<7;i++)valores[i]+=(alvos[i]-valores[i])*kl;
  const max=Math.max(...alvos),vazio=max<=0,xs=posicoes();
  const yDia=v=>vazio?Y_ZERO:Y_ZERO-(Y_ZERO-Y_MAX)*(v/max);
  const ys=valores.map(v=>Y_ZERO+(yDia(v)-Y_ZERO)*intro);
  const f=monotona([X0,...xs,X1],[Math.min(Y_ZERO+7,ys[0]+20),...ys,Math.min(Y_ZERO+7,ys[6]+14)]);
  const amp=vazio?3.2:1.4;
  const y=x=>f(x)+(Math.sin(x*.045+t*1.15)*amp+Math.sin(x*.013-t*.55)*amp*.8)*(x>X0+4&&x<X1-4?1:.4);
  let iMax=0;alvos.forEach((v,i)=>{if(v>alvos[iMax])iMax=i;});const xm=xs[iMax];
  const passo=qual==='economica'?4:qual==='alta'?1.5:2;
  ctx.save();ctx.beginPath();ctx.rect(X0,Y0-40,LARG*intro+.5,ALT+40);ctx.clip();
  /* 1. arte da referência, coluna a coluna */
  if(pronta(IMG.base)){for(let x=X0;x<X1;x+=passo)coluna(ctx,IMG.base,x,x,y(x),passo+.6);
   /* aurora em paralaxe: a mesma arte, fase diferente, em tela */
   ctx.globalCompositeOperation='screen';ctx.globalAlpha=.1;for(let x=X0;x<X1;x+=passo*2){const yy=y(x)-5-Math.sin(x*.03-t*.9)*4;coluna(ctx,IMG.base,x,x,yy,passo*2+.6);}ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';}
  /* 2. brilho de cobre transplantado para o dia de maior volume */
  if(!vazio&&pronta(IMG.laranja)){const dx=xm-PICO_REF;for(let x=Math.max(X0,xm-110);x<Math.min(X1,xm+110);x+=passo){const xsrc=x-dx;if(xsrc<X0||xsrc>=X1)continue;coluna(ctx,IMG.laranja,xsrc,x,y(x),passo+.6);}}
  ctx.globalCompositeOperation='lighter';
  /* 3. coluna do dia escolhido */
  if(sel!=null){const xc=xs[sel],g=ctx.createLinearGradient(xc-26,0,xc+26,0);g.addColorStop(0,'rgba(80,240,210,0)');g.addColorStop(.5,'rgba(80,240,210,.09)');g.addColorStop(1,'rgba(80,240,210,0)');ctx.fillStyle=g;ctx.fillRect(xc-26,y(xc),52,BASE-y(xc));}
  /* 4. batimento percorrendo a curva a cada 3,2 s */
  const bt=(t%3.2)/3.2,bx=X0-60+bt*(LARG+120);
  for(let x=Math.max(X0,bx-70);x<Math.min(X1,bx+8);x+=1.5){const k=1-(bx-x)/70;if(k<0)continue;const perto=!vazio&&Math.abs(x-xm)<60;ctx.fillStyle=perto?'rgba(255,215,150,'+(.55*k*k)+')':'rgba(170,255,235,'+(.5*k*k)+')';ctx.fillRect(x,y(x)-1.2,1.6,2.4);}
  if(!vazio){const cruzou=Math.floor(t/3.2)*3.2+((xm-X0+60)/(LARG+120))*3.2;if(t>=cruzou&&ultimoBatimento<cruzou){ultimoBatimento=cruzou;for(let i=0;i<26;i++){const a=-Math.PI*ruido(i+t)-.05;faiscas.push({x:xm,y:y(xm),vx:Math.cos(a)*(20+ruido(i*3+t)*60),vy:Math.sin(a)*(30+ruido(i*5+t)*60),n:t});}}}
  /* 5. cometas fluindo pela curva */
  for(const c of cometas){const k=(c.k+t*c.v)%1,x0=X0+k*LARG;for(let j=0;j<9;j++){const x=x0-j*2.2;if(x<X0)break;const perto=!vazio&&Math.abs(x-xm)<55;ctx.fillStyle=(perto?'rgba(255,225,170,':'rgba(205,255,240,')+(.6*(1-j/9))+')';ctx.beginPath();ctx.arc(x,y(x),1.3*(1-j/11),0,TAU);ctx.fill();}}
  /* 6. pontos da base cintilando e pulso na base */
  for(let i=0;i<24;i++){const x=X0+12+i*24.6+ruido(i)*6,a=Math.max(0,Math.sin(t*1.7+i*1.3));ctx.fillStyle='rgba(220,255,245,'+(.15+.5*a*a)+')';ctx.beginPath();ctx.arc(x,BASE,.9+a*.6,0,TAU);ctx.fill();}
  const pb=(t*.22)%1;const gpb=ctx.createRadialGradient(X0+pb*LARG,BASE,0,X0+pb*LARG,BASE,30);gpb.addColorStop(0,'rgba(120,255,225,.35)');gpb.addColorStop(1,'rgba(120,255,225,0)');ctx.fillStyle=gpb;ctx.fillRect(X0+pb*LARG-30,BASE-8,60,16);
  /* 7. varredura de luz */
  const vx=X0-50+((t*.13)%1)*(LARG+100);const gv=ctx.createLinearGradient(vx-34,0,vx+34,0);gv.addColorStop(0,'rgba(140,255,230,0)');gv.addColorStop(.5,'rgba(140,255,230,.10)');gv.addColorStop(1,'rgba(140,255,230,0)');ctx.fillStyle=gv;ctx.fillRect(vx-34,Y0,68,BASE-Y0);
  /* 8. faróis nos picos (anéis como na arte) */
  xs.forEach((x,i)=>{const v=alvos[i],pico=v>0&&(i===0||v>=alvos[i-1])&&(i===6||v>=alvos[i+1]),foco=i===sel||i===hover;if(!pico&&!foco)return;
   const yy=y(x),cobre=!vazio&&i===iMax,cor=cobre?'255,196,120':'110,255,226',pul=.5+.5*Math.sin(t*2.6+i*1.3),varre=Math.max(0,1-Math.abs(vx-x)/26);
   let h=ctx.createRadialGradient(x,yy,0,x,yy,cobre?30:13);h.addColorStop(0,'rgba('+cor+','+(cobre?.42:.4)*(.8+.2*pul+varre*.6)+')');h.addColorStop(.4,'rgba('+cor+',.12)');h.addColorStop(1,'rgba('+cor+',0)');ctx.fillStyle=h;ctx.fillRect(x-32,yy-32,64,64);
   for(let j=0;j<2;j++){const k=(t*.7+i*.21+j*.5)%1;ctx.strokeStyle='rgba('+cor+','+(.38*(1-k))+')';ctx.lineWidth=.9;ctx.beginPath();ctx.arc(x,yy,6+k*(cobre?26:16),0,TAU);ctx.stroke();}
   ctx.strokeStyle='rgba('+cor+',.9)';ctx.lineWidth=1.6;ctx.beginPath();ctx.arc(x,yy,5,0,TAU);ctx.stroke();ctx.fillStyle='rgba('+(cobre?'255,240,215':'200,255,245')+','+(.55+varre*.4)+')';ctx.beginPath();ctx.arc(x,yy,3.2,0,TAU);ctx.fill();
   /* linha de queda com gotas de luz */
   ctx.strokeStyle='rgba('+cor+',.16)';ctx.lineWidth=.6;ctx.beginPath();ctx.moveTo(x,yy+7);ctx.lineTo(x,BASE);ctx.stroke();
   for(let j=0;j<2;j++){const k=(t*.5+j*.5+i*.13)%1,gy=yy+7+k*(BASE-yy-7);ctx.fillStyle='rgba('+cor+','+(.7*(1-k))+')';ctx.fillRect(x-.6,gy,1.2,2.2);}
   if(cobre){/* raios girando, coluna de luz e brasas */
    ctx.save();ctx.translate(x,yy);ctx.rotate(t*.25);for(let j=0;j<10;j++){ctx.rotate(TAU/10);const len=(j%2?12:26)*(.75+.25*Math.sin(t*3+j));const g=ctx.createLinearGradient(0,0,len,0);g.addColorStop(0,'rgba(255,220,170,.38)');g.addColorStop(1,'rgba(255,170,90,0)');ctx.fillStyle=g;ctx.beginPath();ctx.moveTo(0,-.7);ctx.lineTo(len,0);ctx.lineTo(0,.7);ctx.fill();}ctx.restore();
    const gc=ctx.createLinearGradient(0,yy-48,0,yy);gc.addColorStop(0,'rgba(255,190,110,0)');gc.addColorStop(1,'rgba(255,210,150,.4)');ctx.fillStyle=gc;ctx.fillRect(x-1.2,yy-48,2.4,48);
    for(const b of brasas){const kk=(b.s+t*.22*b.v)%1,ex=x+b.x*(.25+kk)+Math.sin(t*2+b.s*20)*3,ey=yy-kk*52;ctx.fillStyle='rgba(255,'+(205-kk*80|0)+',120,'+(.85*(1-kk))+')';ctx.beginPath();ctx.arc(ex,ey,b.r*(1-kk*.6),0,TAU);ctx.fill();}
    for(let j=0;j<3;j++){const k=(t*.4+j/3)%1;ctx.strokeStyle='rgba(255,190,110,'+(.4*(1-k))+')';ctx.lineWidth=.8;ctx.beginPath();ctx.ellipse(x,BASE,6+k*44,1.5+k*4,0,0,TAU);ctx.stroke();}}
  });
  /* 9. faíscas do batimento no pico */
  for(let i=faiscas.length-1;i>=0;i--){const p=faiscas[i],a=t-p.n;if(a>1.1||a<0){faiscas.splice(i,1);continue;}const px=p.x+p.vx*a,py=p.y+p.vy*a+70*a*a;ctx.fillStyle='rgba(255,'+(220-a*60|0)+',150,'+(1-a/1.1)+')';ctx.fillRect(px,py,1.3,1.3);}
  /* 10. guia do mouse */
  if(mouseX!=null){ctx.strokeStyle='rgba(200,255,240,.22)';ctx.lineWidth=.8;ctx.beginPath();ctx.moveTo(mouseX,Y0+20);ctx.lineTo(mouseX,BASE);ctx.stroke();}
  /* ponta da revelação inicial */
  if(intro<1){const hx=X0+LARG*intro,g=ctx.createRadialGradient(hx,y(hx),0,hx,y(hx),18);g.addColorStop(0,'rgba(220,255,245,.9)');g.addColorStop(1,'rgba(120,255,225,0)');ctx.fillStyle=g;ctx.fillRect(hx-18,y(hx)-18,36,36);}
  ctx.restore();
  /* posição da dica */
  const di=dica.hidden?null:Number(dica.dataset.i);if(di!=null&&xs[di]!=null){dica.style.left=((xs[di]-X0)/LARG*100)+'%';dica.style.top=Math.max(0,(y(xs[di])-Y0)/ALT*H-10)+'px';}
 }
 return {
  dados(novos,h){dias=novos;hoje=h;alvos=novos.map(d=>d.quantidade);if(sel==null)selecionar(h,false);botoes.forEach((b,i)=>b.querySelector('span').textContent=novos[i].nome);},
  desenhar
 };
}
