import * as T from '../bibliotecas/three.module.min.js';
import {selecionarMarcadores} from './marcadores.js';

export function criarObservatorio({aoCarregar=()=>{}}={}){
 const objeto=new T.Group(),texturas=[],ondas=Array.from({length:8},()=>new T.Vector4(0,0,-100,0)),uniformes={tempo:{value:0},arte:{value:null},ponteiro:{value:new T.Vector2()},pronto:{value:0},entrada:{value:0},ondasInternas:{value:ondas}};
 const raio=new T.Raycaster(),alvoRaio=new T.Vector2(),projecao=new T.Vector3();
 let ondaAtual=0,empresaDestacada='';
 const geometria=new T.PlaneGeometry(9.6,5.3,64,32),vertices=geometria.attributes.position;
 for(let i=0;i<vertices.count;i++){
  const x=vertices.getX(i)/4.8,y=vertices.getY(i)/2.65;
  vertices.setZ(i,Math.sqrt(Math.max(0,1-x*x-y*y))*.24);
 }
 const material=new T.ShaderMaterial({transparent:true,depthWrite:false,toneMapped:false,uniforms:uniformes,
  vertexShader:'varying vec2 coordenada;void main(){coordenada=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
  fragmentShader:`precision highp float;varying vec2 coordenada;uniform sampler2D arte;uniform float tempo;uniform float pronto;uniform float entrada;uniform vec2 ponteiro;uniform vec4 ondasInternas[8];
  void main(){vec2 uv=vec2(coordenada.x,mix(.055,.94,coordenada.y));vec4 original=texture2D(arte,uv);if(original.a<.005||pronto<.5)discard;
   float corAgua=smoothstep(.004,.035,original.g-original.r)*(1.-smoothstep(.55,.64,uv.y))*smoothstep(.23,.3,uv.y);
   float fluxo=sin(uv.x*97.+uv.y*37.-tempo*.35)+sin(uv.x*41.-uv.y*87.+tempo*.29)*.5;
   vec2 refracao=vec2(sin(uv.y*83.+tempo*.31),fluxo)*.00065;
   if(corAgua>.01)for(int i=0;i<8;i++){vec4 onda=ondasInternas[i];float idade=tempo-onda.z;if(idade>=0.&&idade<5.){vec2 delta=(uv-onda.xy)*vec2(1.8,3.);float frente=length(delta)-idade*.12;float envoltoria=exp(-frente*frente*1100.)*exp(-idade*.72);refracao+=normalize(delta+vec2(.00001))*sin(frente*135.)*envoltoria*onda.w*.025;}}
   refracao*=corAgua;
   float nuvem=exp(-dot((uv-vec2(.68,.74))/vec2(.17,.11),(uv-vec2(.68,.74))/vec2(.17,.11)));
   refracao+=vec2(sin(tempo*.045)*.0015,cos(tempo*.035)*.0004)*nuvem;
   vec4 amostra=texture2D(arte,uv+refracao);float luz=1.+sin(tempo*.8+uv.x*3.)*.015*corAgua;
   gl_FragColor=vec4(amostra.rgb*luz,amostra.a*entrada);
   #include <colorspace_fragment>
  }`});
 const camada=new T.Mesh(geometria,material);camada.renderOrder=2;objeto.add(camada);
 new T.TextureLoader().load(new URL('../ativos/ambiente/observatorio.webp',import.meta.url).href,textura=>{textura.colorSpace=T.SRGBColorSpace;textura.anisotropy=4;texturas.push(textura);uniformes.arte.value=textura;uniformes.pronto.value=1;aoCarregar();});
 const pinos=new T.Group();objeto.add(pinos);
 let ultimaLista=null;
 function atualizarEmpresas(empresas){
  const selecionadas=selecionarMarcadores(empresas),assinatura=selecionadas.map(e=>e.id).join('|');if(assinatura===ultimaLista)return;ultimaLista=assinatura;
  for(const pino of [...pinos.children]){pinos.remove(pino);pino.traverse(o=>{o.geometry?.dispose();o.material?.dispose();});}
  selecionadas.forEach((empresa,i)=>{
   const [x,y]=empresa.posicao,pino=new T.Group(),cor=i%3?'#51c7b2':'#e2bb80';
   const cabeca=new T.Mesh(new T.SphereGeometry(.061,16,12),new T.MeshStandardMaterial({color:cor,emissive:cor,emissiveIntensity:.5,roughness:.23,metalness:.3}));cabeca.scale.y=1.15;cabeca.position.y=.16;pino.add(cabeca);
   const ponta=new T.Mesh(new T.ConeGeometry(.048,.14,16),cabeca.material);ponta.rotation.z=Math.PI;ponta.position.y=.065;pino.add(ponta);pino.position.set(x,y,.45);pino.userData.empresaId=empresa.id;pino.userData.material=cabeca.material;pinos.add(pino);
  });aoCarregar();
 }
 function destacarEmpresa(id){empresaDestacada=id;}
 function projetar(camera){
  return pinos.children.map(pino=>{projecao.set(0,.16,0);pino.localToWorld(projecao);projecao.project(camera);return{id:pino.userData.empresaId,x:projecao.x,y:projecao.y};});
 }
 function perturbar(x,y,forca,tempo,camera){
  if(uniformes.pronto.value<.5)return;
  alvoRaio.set(x*2-1,y*2-1);raio.setFromCamera(alvoRaio,camera);
  const ponto=raio.intersectObject(camada,false)[0];if(!ponto?.uv)return;
  ondas[ondaAtual].set(ponto.uv.x,.055+ponto.uv.y*(.94-.055),tempo,forca);ondaAtual=(ondaAtual+1)%ondas.length;
 }
 function atualizar(tempo,ponteiro,movimento=true){
  uniformes.tempo.value=tempo;uniformes.ponteiro.value.set(ponteiro.x,ponteiro.y);
  if(uniformes.pronto.value)uniformes.entrada.value=movimento?Math.min(1,uniformes.entrada.value+.08):1;
  objeto.rotation.y=ponteiro.x*.007;objeto.rotation.x=ponteiro.y*.003;
  for(const pino of pinos.children){const selecionado=pino.userData.empresaId===empresaDestacada,escala=selecionado&&movimento?1.18:1;pino.scale.setScalar(pino.scale.x+(escala-pino.scale.x)*(movimento?.14:1));pino.userData.material.emissiveIntensity=selecionado?1.15:.5;}
 }
 return{objeto,largura:9.6,atualizar,atualizarEmpresas,destacarEmpresa,projetar,perturbar,texturas};
}
