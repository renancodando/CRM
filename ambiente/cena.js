import * as T from '../bibliotecas/three.module.min.js';
import {criarAgua} from './agua.js';
import {criarAmpulheta} from './ampulheta.js';
import {criarFoco} from './foco.js';
import {criarObservatorio} from './observatorio.js';
import {consultarAmpulheta} from './tempo.js';

export function criarCena(raiz, {inicio, preferencias,aoProjetar=()=>{}}) {
 const tela=raiz.querySelector('.pr-tela-ambiente');
 let renderizador;
 try {const contexto=tela.getContext('webgl2',{alpha:true,antialias:true,powerPreference:'low-power'});if(!contexto)return null;renderizador=new T.WebGLRenderer({canvas:tela,context:contexto,alpha:true,antialias:true,powerPreference:'low-power'});} catch {return null;}
 renderizador.outputColorSpace=T.SRGBColorSpace;renderizador.toneMapping=T.ACESFilmicToneMapping;renderizador.toneMappingExposure=1.1;
 renderizador.autoClear=false;
 const pequena=matchMedia('(max-width:700px)').matches;
 const contexto=renderizador.getContext(),informacao=contexto.getExtension('WEBGL_debug_renderer_info');
 const software=informacao&&/swiftshader|llvmpipe|software|lavapipe/i.test(contexto.getParameter(informacao.UNMASKED_RENDERER_WEBGL));
 const economica=software||preferencias.qualidade==='economica'||(navigator.deviceMemory||8)<4||(navigator.hardwareConcurrency||8)<=4;
 let fator=software?.60:economica?.75:1,qualidade=preferencias.qualidade||'equilibrada',dpr=1;
 const cena=new T.Scene(),camera=new T.OrthographicCamera(-8,8,5,-5,.1,80);camera.position.set(0,0,30);
 cena.add(new T.HemisphereLight('#aed3c4','#25180e',.55));
 const cobre=new T.DirectionalLight('#ffd5a0',3.6);cobre.position.set(-5,6,9);cena.add(cobre);
 const esmeralda=new T.DirectionalLight('#8acabb',1.3);esmeralda.position.set(7,4,5);cena.add(esmeralda);
 const contraluz=new T.DirectionalLight('#ef9d50',2.2);contraluz.position.set(0,-5,-3);cena.add(contraluz);
 const ambiente=new T.Scene();ambiente.add(new T.Mesh(new T.BoxGeometry(25,18,24),new T.MeshBasicMaterial({color:'#071510',side:T.BackSide})));
 const painelLuz=(cor,intensidade,x,y,z,l,a,rotacao=0)=>{
  const painel=new T.Mesh(new T.PlaneGeometry(l,a),new T.MeshBasicMaterial({color:new T.Color(cor).multiplyScalar(intensidade),side:T.DoubleSide}));painel.position.set(x,y,z);painel.rotation.y=rotacao;ambiente.add(painel);
 };
 painelLuz('#d7f5e6',6,-7,3,3,1.8,11,.5);painelLuz('#e6fffa',4,8,1,0,.75,12,-.7);
 painelLuz('#ffe1ae',5,0,7,-3,9,1.8);painelLuz('#f1a34e',4,0,-5,4,7,.5);painelLuz('#65c9a9',1.4,-3,1,-8,7,9);
 const gerador=new T.PMREMGenerator(renderizador),mapa=gerador.fromScene(ambiente,.04,.1,60);cena.environment=mapa.texture;cena.environmentIntensity=.9;gerador.dispose();
 ambiente.traverse(n=>{n.geometry?.dispose();n.material?.dispose();});
 const ampulheta=criarAmpulheta({economica:economica||pequena}),foco=criarFoco(),observatorio=criarObservatorio({aoCarregar:()=>{sujo=true;agendar();}});cena.add(ampulheta.objeto,foco.objeto,observatorio.objeto);
 const reflexos=new T.WebGLRenderTarget(512,512,{depthBuffer:true,minFilter:T.LinearMipmapLinearFilter,magFilter:T.LinearFilter,generateMipmaps:true});reflexos.texture.colorSpace=T.SRGBColorSpace;
 const agua=criarAgua(reflexos.texture,()=>{sujo=true;agendar();});
 const geometriaPoeira=new T.BufferGeometry(),poeiraPos=new Float32Array(42*3);
 for(let i=0;i<42;i++){poeiraPos[i*3]=Math.sin(i*13.37);poeiraPos[i*3+1]=Math.cos(i*8.23);poeiraPos[i*3+2]=-2;}
 geometriaPoeira.setAttribute('position',new T.BufferAttribute(poeiraPos,3));
 const poeira=new T.Points(geometriaPoeira,new T.PointsMaterial({color:'#d8c59a',size:.013,transparent:true,opacity:.35,depthWrite:false}));cena.add(poeira);
 let largura=1,altura=1,alturaAmpulheta=250,escalaAmpulheta=1,quadro=0,ativo=false,animar=false,perdido=false,destruido=false,ultimoQuadro=0,contagem=0,lentos=0,amostras=0;
 const ponteiro={x:0,y:0},alvoPonteiro={x:0,y:0};
 let instanteVisual=null,deslocamentoMapa={x:0,y:0};
 let focoAlvo=0,reacaoFoco=0,reacaoAmpulheta=0,ultimaOnda=0,ultimoPonteiro={x:-1,y:-1},sujo=true;
 const abortar=new AbortController(),opcoes={signal:abortar.signal};
 const refletidos=[raiz.querySelector('.pr-ritmo-cena'),raiz.querySelector('.pr-recentes-cena'),raiz.querySelector('.pr-resumo-cena')];
 function posicionar(objeto,elemento,tamanho,dimensao='altura') {
  const r=elemento.getBoundingClientRect(),p=raiz.getBoundingClientRect(),unidade=10/altura;
  const escala=(dimensao==='largura'?r.width:r.height)*unidade/tamanho;
  objeto.scale.setScalar(escala);objeto.position.set((r.left-p.left+r.width/2-largura/2)*unidade,(altura/2-(r.top-p.top+r.height/2))*unidade,0);
  return {x:(r.left-p.left+r.width/2)/largura,y:1-(r.bottom-p.top)/altura,largura:r.width/largura,escala};
 }
 function projetarMarcadores(){
  cena.updateMatrixWorld(true);camera.updateMatrixWorld();
  aoProjetar(observatorio.projetar(camera).map(p=>({id:p.id,x:(p.x*.5+.5)*largura-deslocamentoMapa.x,y:(.5-p.y*.5)*altura-deslocamentoMapa.y})));
 }
 function redimensionar() {
  if(destruido)return;
  const r=raiz.getBoundingClientRect();largura=Math.max(1,r.width);altura=Math.max(1,r.height);
  const teto=qualidade==='alta'?1.65:qualidade==='economica'?.85:1.25;
  dpr=Math.max(.55,Math.min(devicePixelRatio||1,teto)*(!animar&&software?1:fator));
  const limitePixels=software?(!animar||qualidade==='alta'?1000000:300000):qualidade==='alta'?1800000:1100000;
  dpr=Math.min(dpr,Math.sqrt(limitePixels/(largura*altura)));
  renderizador.setPixelRatio(dpr);renderizador.setSize(largura,altura,false);reflexos.setSize(Math.max(1,Math.round(largura*dpr*.6)),Math.max(1,Math.round(altura*dpr*.6)));
  camera.left=-largura/altura*5;camera.right=-camera.left;camera.updateProjectionMatrix();
  agua.uniformes.resolucao.value.set(largura,altura);
  const caixaMapa=raiz.querySelector('.pr-diorama-volume').getBoundingClientRect();deslocamentoMapa={x:caixaMapa.left-r.left,y:caixaMapa.top-r.top};
  const posMapa=posicionar(observatorio.objeto,raiz.querySelector('.pr-diorama-volume'),observatorio.largura,'largura');
  agua.uniformes.observatorio.value.set(posMapa.x,posMapa.y+.013,posMapa.largura/2);
  const posFoco=posicionar(foco.objeto,raiz.querySelector('.pr-foco-alvo'),3.24,'largura');
  alturaAmpulheta=raiz.querySelector('.pr-ampulheta-volume').getBoundingClientRect().height;
  const posTempo=posicionar(ampulheta.objeto,raiz.querySelector('.pr-ampulheta-volume'),4.23);
  escalaAmpulheta=posTempo.escala;
  agua.uniformes.foco.value.set(posFoco.x,Math.max(.02,.5+(foco.objeto.position.y-1.62*posFoco.escala)/10),posFoco.largura/2);
  agua.uniformes.ampulheta.value.set(posTempo.x,posTempo.y,posTempo.largura*.65);
  agua.uniformes.horizonte.value=largura<620?.92:.49;
  refletidos.forEach((n,i)=>{const a=n.getBoundingClientRect();agua.uniformes.paineis.value[i].set((a.left-r.left+a.width/2)/largura,1-(a.bottom-r.top)/altura,a.width/largura/2,i===2?.4:1);});
  poeira.scale.set(largura/altura*4.6,3.8,1);projetarMarcadores();
  sujo=true;if(ativo&&!quadro)agendar();
 }
 const tamanho=new ResizeObserver(redimensionar);tamanho.observe(raiz);tamanho.observe(raiz.querySelector('.pr-foco-alvo'));tamanho.observe(raiz.querySelector('.pr-ampulheta-volume'));tamanho.observe(raiz.querySelector('.pr-diorama-volume'));
 function desenhar(agora) {
  quadro=0;if(!ativo||perdido||destruido)return;
  const intervalo=qualidade==='economica'||fator<.7?1000/30:1000/60;
  if(animar&&agora-ultimoQuadro<intervalo-1){agendar();return;}
  const delta=ultimoQuadro?agora-ultimoQuadro:16;ultimoQuadro=agora;
  const segundos=(Date.now()-inicio)/1000,tempo=consultarAmpulheta(inicio);
  ponteiro.x+=(alvoPonteiro.x-ponteiro.x)*.05;ponteiro.y+=(alvoPonteiro.y-ponteiro.y)*.05;
  reacaoFoco+=(focoAlvo-reacaoFoco)*.06;reacaoAmpulheta*=.97;
  if(instanteVisual==null||animar)instanteVisual=segundos;
  foco.atualizar(instanteVisual,animar?reacaoFoco:0,ponteiro);
  observatorio.atualizar(instanteVisual,ponteiro,animar);projetarMarcadores();
  ampulheta.objeto.scale.setScalar(escalaAmpulheta*(1-.1*Math.sin(tempo.virada*Math.PI)));
  ampulheta.objeto.rotation.x=.13;
  ampulheta.objeto.rotation.y=Math.sin(tempo.virada*Math.PI)*1.05+(animar?ponteiro.x*.035:0);
  ampulheta.atualizar(tempo,instanteVisual,alturaAmpulheta,dpr,reacaoAmpulheta);
  if(animar){
   for(let i=0;i<42;i++){const j=i*3;poeiraPos[j]=Math.sin(i*13.37+segundos*(.004+(i%7)*.001));poeiraPos[j+1]=Math.cos(i*8.23+segundos*(.006+(i%5)*.002));}
   geometriaPoeira.attributes.position.needsUpdate=true;
  }
  agua.uniformes.tempo.value=instanteVisual;
  renderizador.setRenderTarget(reflexos);renderizador.setClearColor(0x000000,0);renderizador.clear();renderizador.render(cena,camera);
  renderizador.setRenderTarget(null);renderizador.clear();renderizador.render(agua.cena,agua.camera);renderizador.clearDepth();renderizador.render(cena,camera);
  contagem++;sujo=false;
  if(animar&&contagem>20){
   amostras++;if(delta>intervalo*1.9)lentos++;
   if(amostras>=36){if(lentos>14&&fator>.56){fator=Math.max(.55,fator*.8);redimensionar();}amostras=0;lentos=0;}
  }
  if(animar)agendar();
 }
 function agendar(){if(!quadro&&ativo&&!destruido&&!perdido)quadro=requestAnimationFrame(desenhar);}
 function ondular(e,clique=false){
  if(!animar||!ativo)return;
  const r=raiz.getBoundingClientRect(),x=(e.clientX-r.left)/r.width,y=1-(e.clientY-r.top)/r.height;
  const agora=performance.now();
  if(!clique&&(agora-ultimaOnda<70||Math.hypot(e.clientX-ultimoPonteiro.x,e.clientY-ultimoPonteiro.y)<5))return;
  ultimaOnda=agora;ultimoPonteiro={x:e.clientX,y:e.clientY};
  const variacao=.86+.14*Math.sin(x*113+y*71+agora*.003);
  const forca=(clique?.065+(e.pressure||.5)*.04:.013)*variacao,tempo=(Date.now()-inicio)/1000;
  agua.perturbar(x,y,forca,tempo);observatorio.perturbar(x,y,forca,tempo,camera);
  alvoPonteiro.x=(x-.5)*2;alvoPonteiro.y=(y-.5)*2;
  if(clique)reacaoAmpulheta=1;
 }
 raiz.addEventListener('pointermove',e=>ondular(e),{...opcoes,passive:true});
 raiz.addEventListener('pointerdown',e=>ondular(e,true),{...opcoes,passive:true});
 raiz.addEventListener('pointerleave',()=>{alvoPonteiro.x=0;alvoPonteiro.y=0;focoAlvo=0;},opcoes);
 const alvoFoco=raiz.querySelector('.pr-foco-alvo');
 for(const tipo of ['pointerenter','focus'])alvoFoco.addEventListener(tipo,()=>{focoAlvo=1;},opcoes);
 for(const tipo of ['pointerleave','blur'])alvoFoco.addEventListener(tipo,()=>{focoAlvo=0;},opcoes);
 tela.addEventListener('webglcontextlost',e=>{e.preventDefault();perdido=true;cancelAnimationFrame(quadro);quadro=0;raiz.classList.remove('pr-com-webgl');},opcoes);
 tela.addEventListener('webglcontextrestored',()=>{perdido=false;raiz.classList.add('pr-com-webgl');sujo=true;agendar();},opcoes);
 redimensionar();
 return {
  atualizarEmpresas(empresas){observatorio.atualizarEmpresas(empresas);projetarMarcadores();sujo=true;agendar();},
  destacarEmpresa(id){observatorio.destacarEmpresa(id);sujo=true;agendar();},
  definirAtividade(novaAtividade,novoMovimento){const mudou=animar!==novoMovimento||ativo!==novaAtividade,mudouMovimento=animar!==novoMovimento;ativo=novaAtividade;animar=novoMovimento;if(mudouMovimento)redimensionar();if(!ativo){cancelAnimationFrame(quadro);quadro=0;ultimoQuadro=0;}else if(mudou||sujo){ultimoQuadro=0;agendar();}},
  definirQualidade(nova){qualidade=nova||'equilibrada';fator=software?.60:economica?.75:1;redimensionar();},
  destruir(){destruido=true;cancelAnimationFrame(quadro);tamanho.disconnect();abortar.abort();const geometrias=new Set(),materiais=new Set();for(const c of [cena,agua.cena])c.traverse(n=>{if(n.geometry)geometrias.add(n.geometry);for(const m of Array.isArray(n.material)?n.material:[n.material])if(m)materiais.add(m);});geometrias.forEach(g=>g.dispose());materiais.forEach(m=>m.dispose());agua.destruir();reflexos.dispose();mapa.dispose();observatorio.texturas.forEach(t=>t.dispose());foco.texturas.forEach(t=>t.dispose());renderizador.dispose();}
 };
}
