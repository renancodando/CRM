import * as T from '../bibliotecas/three.module.min.js';

export function criarObservatorio({aoCarregar=()=>{}}={}){
 const objeto=new T.Group(),texturas=[],uniformes={tempo:{value:0},arte:{value:null},ponteiro:{value:new T.Vector2()},pronto:{value:0}};
 const geometria=new T.PlaneGeometry(9.6,5.3,64,32),vertices=geometria.attributes.position;
 for(let i=0;i<vertices.count;i++){
  const x=vertices.getX(i)/4.8,y=vertices.getY(i)/2.65;
  vertices.setZ(i,Math.sqrt(Math.max(0,1-x*x-y*y))*.24);
 }
 const material=new T.ShaderMaterial({transparent:true,depthWrite:false,toneMapped:false,uniforms:uniformes,
  vertexShader:'varying vec2 coordenada;void main(){coordenada=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
  fragmentShader:`precision highp float;varying vec2 coordenada;uniform sampler2D arte;uniform float tempo;uniform float pronto;uniform vec2 ponteiro;
  void main(){vec2 uv=vec2(coordenada.x,mix(.055,.94,coordenada.y));vec4 original=texture2D(arte,uv);if(original.a<.005||pronto<.5)discard;
   float corAgua=smoothstep(.004,.035,original.g-original.r)*(1.-smoothstep(.55,.64,uv.y))*smoothstep(.23,.3,uv.y);
   float fluxo=sin(uv.x*97.+uv.y*37.-tempo*.35)+sin(uv.x*41.-uv.y*87.+tempo*.29)*.5;
   vec2 refracao=vec2(sin(uv.y*83.+tempo*.31),fluxo)*.00065*corAgua;
   vec4 amostra=texture2D(arte,uv+refracao);float luz=1.+sin(tempo*.8+uv.x*3.)*.015*corAgua;
   gl_FragColor=vec4(amostra.rgb*luz,amostra.a);
   #include <colorspace_fragment>
  }`});
 const camada=new T.Mesh(geometria,material);camada.renderOrder=2;objeto.add(camada);
 new T.TextureLoader().load(new URL('../ativos/ambiente/observatorio.webp',import.meta.url).href,textura=>{textura.colorSpace=T.SRGBColorSpace;textura.anisotropy=4;texturas.push(textura);uniformes.arte.value=textura;uniformes.pronto.value=1;aoCarregar();});
 const pinos=new T.Group();objeto.add(pinos);
 const posicoes=[[-3.15,-.3],[-2.1,.4],[-.58,.25],[1.62,.25],[3.3,-.4],[2.45,-1.27],[.6,-1.5],[-2.4,-1.3],[-3.7,-.9]];
 let ultimaLista=null;
 function atualizarEmpresas(empresas){
  const assinatura=empresas.slice(0,9).map(e=>e.id).join('|');if(assinatura===ultimaLista)return;ultimaLista=assinatura;
  for(const pino of [...pinos.children]){pinos.remove(pino);pino.traverse(o=>{o.geometry?.dispose();o.material?.dispose();});}
  empresas.slice(0,9).forEach((empresa,i)=>{
   const [x,y]=posicoes[i],pino=new T.Group(),cor=i%3?'#51c7b2':'#e2bb80';
   const cabeca=new T.Mesh(new T.SphereGeometry(.061,16,12),new T.MeshStandardMaterial({color:cor,emissive:cor,emissiveIntensity:.5,roughness:.23,metalness:.3}));cabeca.scale.y=1.15;cabeca.position.y=.16;pino.add(cabeca);
   const ponta=new T.Mesh(new T.ConeGeometry(.048,.14,16),cabeca.material);ponta.rotation.z=Math.PI;ponta.position.y=.065;pino.add(ponta);pino.position.set(x,y,.45);pinos.add(pino);
  });aoCarregar();
 }
 function atualizar(tempo,ponteiro){uniformes.tempo.value=tempo;uniformes.ponteiro.value.set(ponteiro.x,ponteiro.y);objeto.rotation.y=ponteiro.x*.007;objeto.rotation.x=ponteiro.y*.003;}
 return{objeto,largura:9.6,atualizar,atualizarEmpresas,texturas};
}
