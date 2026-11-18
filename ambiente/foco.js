import * as T from '../bibliotecas/three.module.min.js';

export function criarFoco() {
 const objeto=new T.Group(), esfera=new T.Group();objeto.add(esfera);
 const metal=new T.MeshStandardMaterial({color:'#976530',metalness:.96,roughness:.26});
 const ouro=new T.MeshStandardMaterial({color:'#c89a59',metalness:.94,roughness:.19});
 const verde=new T.MeshStandardMaterial({color:'#091e18',metalness:.82,roughness:.24});
 const casca=new T.MeshStandardMaterial({color:'#0b2520',metalness:.87,roughness:.22,emissive:'#b66d21',emissiveIntensity:.12});
 const estadoLuz={value:0};
 casca.onBeforeCompile=shader=>{
  shader.uniforms.interacao=estadoLuz;
  shader.vertexShader='varying vec3 posicaoLocal;\n'+shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nposicaoLocal=position;');
  shader.fragmentShader=`varying vec3 posicaoLocal;uniform float interacao;
  float ruidoFoco(vec3 p){vec3 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);vec3 s=vec3(7.,157.,113.);float n=dot(i,s);return mix(mix(mix(fract(sin(n)*43758.5453),fract(sin(n+7.)*43758.5453),f.x),mix(fract(sin(n+157.)*43758.5453),fract(sin(n+164.)*43758.5453),f.x),f.y),mix(mix(fract(sin(n+113.)*43758.5453),fract(sin(n+120.)*43758.5453),f.x),mix(fract(sin(n+270.)*43758.5453),fract(sin(n+277.)*43758.5453),f.x),f.y),f.z);}
  `+shader.fragmentShader;
  shader.fragmentShader=shader.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
   vec3 p=posicaoLocal*3.8;float n=ruidoFoco(p)+.5*ruidoFoco(p*2.03)+.22*ruidoFoco(p*4.13);
   float veio=1.-smoothstep(.004,.035,abs(n-.85));float terra=smoothstep(.59,1.08,n);
   diffuseColor.rgb=mix(vec3(.004,.012,.010),vec3(.016,.033,.023),terra);
   diffuseColor.rgb=mix(diffuseColor.rgb,vec3(.53,.30,.09),veio*.68);
  `).replace('#include <emissivemap_fragment>',`#include <emissivemap_fragment>\ntotalEmissiveRadiance*=veio*(.65+interacao*.8);`);
 };
 const nucleo=new T.Mesh(new T.SphereGeometry(1.25,64,44),casca);esfera.add(nucleo);
 const vidro=new T.Mesh(new T.SphereGeometry(1.283,64,44),new T.MeshPhysicalMaterial({color:'#e2f1da',transmission:1,opacity:1,transparent:true,thickness:.09,ior:1.46,roughness:.045,clearcoat:1,clearcoatRoughness:.05,envMapIntensity:.85,depthWrite:false}));vidro.renderOrder=4;esfera.add(vidro);
 for(let i=0;i<3;i++){
  const anel=new T.Mesh(new T.TorusGeometry(1.42+i*.055,i===0?.027:.013,8,128,Math.PI*(i===0?1.74:1.18)),i===0?ouro:metal);
  anel.rotation.set(.13+i*.17,.07+i*.37,-.2+i*1.9);esfera.add(anel);
 }
 for(let i=0;i<5;i++){
  const y=(i-2)*.38,r=Math.sqrt(1.25**2-y**2),pontos=[];
  for(let j=0;j<=96;j++){const a=j/96*Math.PI*2;pontos.push(new T.Vector3(Math.cos(a)*r,y,Math.sin(a)*r));}
  const linha=new T.Line(new T.BufferGeometry().setFromPoints(pontos),new T.LineBasicMaterial({color:'#927346',transparent:true,opacity:.18}));esfera.add(linha);
 }
 const base=new T.Group();base.position.y=-1.51;objeto.add(base);
 for(const [r,h,y,m] of [[1.29,.11,0,verde],[1.34,.032,-.063,ouro],[1.18,.13,.09,metal],[1.2,.025,.163,ouro],[1.42,.024,-.092,metal]]){
  const peca=new T.Mesh(new T.CylinderGeometry(r,r*1.02,h,80),m);peca.position.y=y;base.add(peca);
 }
 for(const r of [1.03,1.13,1.27,1.36]){
  const anel=new T.Mesh(new T.TorusGeometry(r,.008,6,96),ouro);anel.rotation.x=Math.PI/2;anel.position.y=.17;base.add(anel);
 }
 const marcas=new T.InstancedMesh(new T.BoxGeometry(.011,.012,.065),ouro,72),aux=new T.Object3D();
 for(let i=0;i<72;i++){const a=i/72*Math.PI*2;aux.position.set(Math.cos(a)*1.26,.183,Math.sin(a)*1.26);aux.rotation.y=-a;aux.updateMatrix();marcas.setMatrixAt(i,aux.matrix);}base.add(marcas);
 const fulgor=new T.PointLight('#ffb34c',4,5,2);fulgor.position.set(0,-1.15,1);objeto.add(fulgor);
 function atualizar(tempo,reacao,ponteiro={x:0,y:0}){
  esfera.position.y=.035*Math.sin(tempo*.78)+.009*Math.sin(tempo*1.37);
  esfera.rotation.y=tempo*.018+ponteiro.x*.025;
  esfera.rotation.x=ponteiro.y*.012;
  estadoLuz.value=reacao;fulgor.intensity=3.3+Math.sin(tempo*1.17)*.35+reacao*1.2;
  casca.emissiveIntensity=.12+reacao*.08;
 }
 return {objeto,atualizar,altura:3.25};
}
