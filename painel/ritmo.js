/* Ritmo de Prospecção: cordilheira luminosa de mensagens confirmadas por dia.
   Camadas: cristas fantasmas em paralaxe, malha de relevo, área, linha com
   gradiente teal→cobre no pico, partículas correndo pela curva, faróis nos
   picos, brasas subindo do maior dia, varredura de luz, ondas na base e dica
   ao passar o mouse ou focar cada dia. */
const TAU=Math.PI*2;
/* Na composição de desktop os pontos seguem a arte (x da referência 140…570
   dentro do quadro 48…638); no celular seguem os rótulos dos dias. */
const PONTOS_REF=[140,211.7,283.3,355,426.7,498.3,570].map(x=>(x-48)/590);
const easeOut=x=>1-Math.pow(1-x,3);
const curva=(pts)=>{ // Catmull-Rom → Bézier
 const p=[[pts[0][0]-(pts[1][0]-pts[0][0]),pts[0][1]],...pts,[pts.at(-1)[0]+(pts.at(-1)[0]-pts.at(-2)[0]),pts.at(-1)[1]]];
 const seg=[];for(let i=1;i<p.length-2;i++){const [x0,y0]=p[i-1],[x1,y1]=p[i],[x2,y2]=p[i+1],[x3,y3]=p[i+2];seg.push([x1,y1,x1+(x2-x0)/6,y1+(y2-y0)/6,x2-(x3-x1)/6,y2-(y3-y1)/6,x2,y2]);}
 return seg;
};
const amostrar=(seg,n=8)=>{const o=[];for(const [x0,y0,c1x,c1y,c2x,c2y,x1,y1] of seg)for(let i=0;i<n;i++){const t=i/n,u=1-t;o.push([u*u*u*x0+3*u*u*t*c1x+3*u*t*t*c2x+t*t*t*x1,u*u*u*y0+3*u*u*t*c1y+3*u*t*t*c2y+t*t*t*y1]);}const l=seg.at(-1);o.push([l[6],l[7]]);return o;};

export function criarRitmo(secao,palco){
 const caixa=secao.querySelector('.pv-grafico'),tela=caixa.querySelector('canvas'),dica=caixa.querySelector('.pv-dica'),botoes=[...secao.querySelectorAll('.pv-dia')];
 let dias=Array.from({length:7},(_,i)=>({nome:['Seg','Ter','Qua','Qui','Sex','Sáb','Dom'][i],quantidade:0})),hoje=0,sel=null,hover=null,valores=new Array(7).fill(0),alvos=new Array(7).fill(0),entrada=null,mouseX=null;
 const brasas=Array.from({length:30},(_,i)=>({s:Math.sin(i*91.7)*.5+.5,v:.5+(Math.sin(i*13.1)*.5+.5)*.9,x:(Math.sin(i*7.3))*14,r:.6+(Math.sin(i*3.7)*.5+.5)*1.4}));
 const particulas=Array.from({length:26},(_,i)=>({k:i/26,v:.05+(i%5)*.012}));
 function selecionar(i,anunciar){sel=i;botoes.forEach((b,j)=>{b.classList.toggle('pv-sel',j===i);b.setAttribute('aria-pressed',String(j===i));});if(anunciar)mostrarDica(i);}
 function mostrarDica(i){if(i==null){dica.hidden=true;return;}const d=dias[i];dica.hidden=false;dica.innerHTML='<strong>'+d.nome+'</strong><span>'+d.quantidade+(d.quantidade===1?' mensagem':' mensagens')+(d.futuro?' · ainda não chegou':'')+'</span>';dica.dataset.i=i;}
 botoes.forEach((b,i)=>{b.addEventListener('click',()=>selecionar(i,true));b.addEventListener('mouseenter',()=>{hover=i;mostrarDica(i);});b.addEventListener('mouseleave',()=>{hover=null;mostrarDica(null);});b.addEventListener('focus',()=>{hover=i;mostrarDica(i);});b.addEventListener('blur',()=>{hover=null;mostrarDica(null);});
  b.addEventListener('keydown',e=>{const d=e.key==='ArrowRight'?1:e.key==='ArrowLeft'?-1:0;if(d){e.preventDefault();botoes[(i+d+7)%7].focus();}});});
 caixa.addEventListener('pointermove',e=>{const r=tela.getBoundingClientRect();mouseX=(e.clientX-r.left)/r.width;const xs=posicoes();let m=0;xs.forEach((x,i)=>{if(Math.abs(x-mouseX)<Math.abs(xs[m]-mouseX))m=i;});hover=m;mostrarDica(m);});
 caixa.addEventListener('pointerleave',()=>{mouseX=null;hover=null;mostrarDica(null);});
 function posicoes(){
  if(palco.classList.contains('pv-replica'))return PONTOS_REF;
  const r=tela.getBoundingClientRect();return botoes.map(b=>{const q=b.getBoundingClientRect();return (q.left+q.width/2-r.left)/r.width;});
 }
 let ultimoQual='';
 function desenhar(t,qual,parado){
  const r=tela.getBoundingClientRect();if(!r.width)return;
  const dpr=Math.min(devicePixelRatio||1,qual==='alta'?2:qual==='economica'?1:1.5),W=r.width,H=r.height;
  if(tela.width!==Math.round(W*dpr)||tela.height!==Math.round(H*dpr)){tela.width=Math.round(W*dpr);tela.height=Math.round(H*dpr);}
  const ctx=tela.getContext('2d');ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,W,H);
  if(entrada==null)entrada=t;
  const intro=parado?1:easeOut(Math.min(1,(t-entrada)/1.6));
  for(let i=0;i<7;i++)valores[i]+=(alvos[i]-valores[i])*(parado?1:.08);
  const yB=H*.94,yT=H*.17,max=Math.max(1,...alvos),xs=posicoes();
  const amb=(x,fase,amp)=>Math.sin(x*.035+t*.7+fase)*amp+Math.sin(x*.011-t*.4+fase*2)*amp*.8;
  const yDe=(v,i)=>yB-(yB-yT)*(.1+.9*v/max)*intro;
  const pts=xs.map((f,i)=>[f*W,yDe(valores[i],i)]);
  const todos=[[0,yB-(yB-yT)*.16*intro],...pts,[W,yB-(yB-yT)*.2*intro]];
  const linha=amostrar(curva(todos),10).map(([x,y])=>[x,y+amb(x,0,(alvos.every(v=>!v)?5.5:1.3))*intro]);
  let iMax=0;alvos.forEach((v,i)=>{if(v>alvos[iMax])iMax=i;});const temPico=alvos[iMax]>0;
  const xPico=pts[iMax][0];
  /* cristas fantasmas em paralaxe */
  for(let c=3;c>=1;c--){const desl=c*9,esc=.55+c*.1;ctx.beginPath();ctx.moveTo(0,yB);linha.forEach(([x,y])=>ctx.lineTo(x,yB-(yB-y)*esc*(1+.06*Math.sin(t*.6+c+x*.01))-desl*.4));ctx.lineTo(W,yB);ctx.closePath();
   const g=ctx.createLinearGradient(0,yT,0,yB);g.addColorStop(0,'rgba(60,220,190,'+(.05+.02*c)+')');g.addColorStop(1,'rgba(20,90,90,0)');ctx.fillStyle=g;ctx.fill();
   ctx.strokeStyle='rgba(90,240,210,'+(.1+.04*(3-c))+')';ctx.lineWidth=1;ctx.beginPath();linha.forEach(([x,y],i)=>{const yy=yB-(yB-y)*esc*(1+.06*Math.sin(t*.6+c+x*.01))-desl*.4;i?ctx.lineTo(x,yy):ctx.moveTo(x,yy);});ctx.stroke();}
  /* área e malha de relevo recortadas sob a curva */
  ctx.save();ctx.beginPath();ctx.moveTo(0,yB);linha.forEach(([x,y])=>ctx.lineTo(x,y));ctx.lineTo(W,yB);ctx.closePath();ctx.clip();
  let g=ctx.createLinearGradient(0,yT,0,yB);g.addColorStop(0,'rgba(70,225,195,.30)');g.addColorStop(.6,'rgba(25,120,110,.12)');g.addColorStop(1,'rgba(10,50,50,0)');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
  if(temPico){g=ctx.createRadialGradient(xPico,pts[iMax][1],0,xPico,pts[iMax][1],W*.2);g.addColorStop(0,'rgba(255,170,80,.42)');g.addColorStop(.5,'rgba(255,130,50,.14)');g.addColorStop(1,'rgba(255,120,40,0)');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);}
  ctx.globalCompositeOperation='lighter';
  for(let k=1;k<9;k++){ctx.strokeStyle='rgba(110,240,215,'+(.12-k*.011)+')';ctx.lineWidth=.8;ctx.beginPath();linha.forEach(([x,y],i)=>{const yy=y+k*k*1.25+Math.sin(x*.05+t*1.1+k)*1.2;i?ctx.lineTo(x,yy):ctx.moveTo(x,yy);});ctx.stroke();}
  for(let x=(t*14)%11;x<W;x+=11){const perto=temPico?Math.max(0,1-Math.abs(x-xPico)/(W*.16)):0;ctx.strokeStyle=perto>0?'rgba(255,190,120,'+(.05+.18*perto)+')':'rgba(110,240,215,.06)';ctx.lineWidth=.7;ctx.beginPath();ctx.moveTo(x,yT-10);ctx.lineTo(x+(x-W/2)*.04,yB);ctx.stroke();}
  /* varredura de luz */
  const vx=((t*.16)%1.3-.15)*W;g=ctx.createLinearGradient(vx-40,0,vx+40,0);g.addColorStop(0,'rgba(140,255,230,0)');g.addColorStop(.5,'rgba(140,255,230,.16)');g.addColorStop(1,'rgba(140,255,230,0)');ctx.fillStyle=g;ctx.fillRect(vx-40,0,80,H);
  ctx.restore();
  ctx.globalCompositeOperation='lighter';
  /* linha principal com brilho */
  g=ctx.createLinearGradient(0,0,W,0);const pf=temPico?Math.min(.98,Math.max(.02,xPico/W)):.5;
  g.addColorStop(0,'rgba(70,215,190,.9)');g.addColorStop(Math.max(0,pf-.13),'rgba(110,250,220,1)');g.addColorStop(pf,temPico?'rgba(255,200,130,1)':'rgba(120,255,225,1)');g.addColorStop(Math.min(1,pf+.13),'rgba(110,250,220,1)');g.addColorStop(1,'rgba(70,215,190,.9)');
  for(const [lw,a] of [[7,.12],[3.2,.28],[1.6,1]]){ctx.strokeStyle=g;ctx.globalAlpha=a;ctx.lineWidth=lw;ctx.lineJoin='round';ctx.beginPath();linha.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.stroke();}
  ctx.globalAlpha=1;
  /* partículas correndo pela curva */
  for(const p of particulas){const k=(p.k+t*p.v)%1,idx=Math.floor(k*(linha.length-1)),[x,y]=linha[idx];for(let j=0;j<6;j++){const q=linha[Math.max(0,idx-j*2)];ctx.fillStyle='rgba(200,255,240,'+(.55*(1-j/6))+')';ctx.beginPath();ctx.arc(q[0],q[1],1.6*(1-j/7),0,TAU);ctx.fill();}}
  /* faróis: picos locais e dia escolhido */
  pts.forEach(([x,y],i)=>{const v=alvos[i],pico=v>0&&(i===0||v>=alvos[i-1])&&(i===6||v>=alvos[i+1]),foco=i===sel||i===hover;if(!pico&&!foco)return;const laranja=temPico&&i===iMax;const cor=laranja?[255,190,110]:[90,255,220],pul=.5+.5*Math.sin(t*2.4+i);
   let h=ctx.createRadialGradient(x,y,0,x,y,26+pul*8);h.addColorStop(0,'rgba('+cor+','+(laranja?.9:.75)+')');h.addColorStop(.35,'rgba('+cor+',.25)');h.addColorStop(1,'rgba('+cor+',0)');ctx.fillStyle=h;ctx.beginPath();ctx.arc(x,y,34,0,TAU);ctx.fill();
   const k=(t*.8+i*.3)%1;ctx.strokeStyle='rgba('+cor+','+(.7*(1-k))+')';ctx.lineWidth=1.2;ctx.beginPath();ctx.arc(x,y,5+k*16,0,TAU);ctx.stroke();
   ctx.fillStyle='rgba(255,255,255,.95)';ctx.beginPath();ctx.arc(x,y,3.2,0,TAU);ctx.fill();ctx.strokeStyle='rgba('+cor+',1)';ctx.lineWidth=2;ctx.beginPath();ctx.arc(x,y,5.4,0,TAU);ctx.stroke();
   ctx.strokeStyle='rgba('+cor+',.22)';ctx.lineWidth=1;ctx.setLineDash([2,3]);ctx.beginPath();ctx.moveTo(x,y+8);ctx.lineTo(x,yB);ctx.stroke();ctx.setLineDash([]);
   if(laranja){/* coluna de luz e brasas */const c=ctx.createLinearGradient(0,y-60,0,y);c.addColorStop(0,'rgba(255,180,90,0)');c.addColorStop(1,'rgba(255,200,130,.45)');ctx.fillStyle=c;ctx.fillRect(x-1.5,y-60,3,60);
    for(const b of brasas){const kk=(b.s+t*.25*b.v)%1,bx=x+b.x*(.3+kk)+Math.sin(t*2+b.s*20)*4,by=y-kk*H*.6;ctx.fillStyle='rgba(255,'+(200-kk*80|0)+',120,'+(.85*(1-kk))+')';ctx.beginPath();ctx.arc(bx,by,b.r*(1-kk*.6),0,TAU);ctx.fill();}}});
  /* ondas na base sob o pico */
  if(temPico)for(let j=0;j<3;j++){const k=(t*.35+j/3)%1;ctx.strokeStyle='rgba(255,180,100,'+(.4*(1-k))+')';ctx.lineWidth=1;ctx.beginPath();ctx.ellipse(xPico,yB,8+k*60,2+k*7,0,0,TAU);ctx.stroke();}
  /* guia do mouse */
  if(mouseX!=null){const x=mouseX*W;ctx.strokeStyle='rgba(200,255,240,.25)';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,yB);ctx.stroke();}
  ctx.globalCompositeOperation='source-over';
  /* posição da dica */
  const di=dica.hidden?null:Number(dica.dataset.i);if(di!=null&&pts[di]){dica.style.left=(pts[di][0]/W*100)+'%';dica.style.top=Math.max(0,pts[di][1]-8)+'px';}
 }
 return {
  dados(novos,h){dias=novos;hoje=h;alvos=novos.map(d=>d.quantidade);if(sel==null)selecionar(h,false);botoes.forEach((b,i)=>b.querySelector('span').textContent=novos[i].nome);},
  desenhar
 };
}
