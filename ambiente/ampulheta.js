import * as T from '../bibliotecas/three.module.min.js';
import {orientarAmpulheta} from './tempo.js';

const ALTURA = 1.91;
export function raioDaAmpulheta(y) {
 const altura = Math.abs(y);
 const pontos = [[0, .052], [.14, .082], [.34, .16], [.58, .32], [.88, .53], [1.15, .65], [1.43, .68], [1.67, .61], [1.91, .48]];
 for (let i = 1; i < pontos.length; i++) if (altura <= pontos[i][0]) {
  const a = pontos[i - 1], b = pontos[i], p = (altura - a[0]) / (b[0] - a[0]);
  return a[1] + (b[1] - a[1]) * p;
 }
 return .48;
}

export function criarAmpulheta({economica = false} = {}) {
 const conjunto = new T.Group(), movimento = new T.Group(); conjunto.add(movimento);
 const metal = new T.MeshStandardMaterial({color: '#a77b46', metalness: .95, roughness: .23});
 const escuro = new T.MeshStandardMaterial({color: '#18352d', metalness: .94, roughness: .2});
 const borda = new T.MeshStandardMaterial({color: '#d6b47b', metalness: .94, roughness: .17});
 const perfil = Array.from({length: 109}, (_, i) => {const y = -ALTURA + i / 108 * ALTURA * 2;return new T.Vector2(raioDaAmpulheta(y), y);});
 const vidro = new T.Mesh(new T.LatheGeometry(perfil, economica ? 40 : 64), new T.MeshPhysicalMaterial({color: '#f4fcf8', metalness: 0, roughness: .055, transmission: .82, thickness: .06, ior: 1.46, clearcoat: 1, clearcoatRoughness: .05, attenuationColor: '#9ec5b2', attenuationDistance: 7, transparent: true, opacity: .38, side: T.DoubleSide, depthWrite: false, envMapIntensity: 1.15}));
 vidro.material.onBeforeCompile = shader => {
  shader.fragmentShader=shader.fragmentShader.replace('#include <opaque_fragment>', '#include <opaque_fragment>\n gl_FragColor.a*=.10+.90*pow(1.-abs(dot(normal,normalize(vViewPosition))),2.4);');
 };
 vidro.material.forceSinglePass=true;
 vidro.renderOrder = 3; movimento.add(vidro);
 for (const sinal of [-1, 1]) {
  const tampa = new T.Group(); tampa.position.y = sinal * 1.94; movimento.add(tampa);
  for (const [r, h, y, material] of [[.57,.10,0,escuro],[.60,.035,sinal*.055,borda],[.52,.025,-sinal*.06,metal]]) {
   const peca = new T.Mesh(new T.CylinderGeometry(r,r,h,64),material);peca.position.y = y;tampa.add(peca);
  }
  const aro = new T.Mesh(new T.TorusGeometry(.575,.018,8,72),borda);aro.rotation.x = Math.PI/2;aro.position.y = sinal*.06;tampa.add(aro);
  const marcas=new T.InstancedMesh(new T.BoxGeometry(.012,.014,.028),metal,48),auxiliar=new T.Object3D();
  for(let i=0;i<48;i++){
   const a=i/48*Math.PI*2;auxiliar.position.set(Math.cos(a)*.567,sinal*.073,Math.sin(a)*.567);auxiliar.rotation.y=-a;auxiliar.updateMatrix();marcas.setMatrixAt(i,auxiliar.matrix);
  }
  tampa.add(marcas);
 }
 const quantidade = economica ? 5200 : 9000, candidatos = Math.ceil(quantidade * 1.45), superior = [], inferior = [];
 let semente = 1729;
 const aleatorio = () => {semente = (Math.imul(semente,1664525)+1013904223)>>>0;return semente/4294967296;};
 while (superior.length < candidatos) {
  const y = .075 + aleatorio() * 1.76, x = (aleatorio() - .5) * 1.36, z = (aleatorio() - .5) * 1.36;
  if (Math.hypot(x,z) > raioDaAmpulheta(y)-.034) continue;
  superior.push(new T.Vector3(x,y,z)); inferior.push(new T.Vector3(-x,-y,z));
 }
 const ordenar = (nuvem, gravidade, inclinacao) => nuvem.map((p,i) => ({i,v:p.dot(gravidade)+inclinacao*Math.sqrt(Math.max(0,p.lengthSq()-p.dot(gravidade)**2))})).sort((a,b)=>a.v-b.v).slice(0,quantidade).map(v=>nuvem[v.i]);
 const origem = ordenar(superior,new T.Vector3(0,1,0),-.14);
 const destino = ordenar(inferior,new T.Vector3(0,1,0),.42);
 const quadros = [], euler = new T.Euler(), q = new T.Quaternion();
 for(let i=0;i<=20;i++){
  const p = i/20, angulos = orientarAmpulheta(p);euler.set(angulos.x,angulos.y,angulos.z);q.setFromEuler(euler).invert();
  const gravidade = new T.Vector3(0,1,0).applyQuaternion(q);
  const ordenados = i===0?destino:i===20?origem.map(p=>new T.Vector3(-p.x,-p.y,p.z)):ordenar(inferior,gravidade,.42+(-.14-.42)*p);
  quadros.push(Float32Array.from(ordenados.flatMap(p=>[p.x,p.y,p.z])));
 }
 const posicoes = new Float32Array((quantidade+45)*3), sementes = new Float32Array(quantidade+45);
 for(let i=0;i<sementes.length;i++)sementes[i]=aleatorio();
 const geometria = new T.BufferGeometry();geometria.setAttribute('position',new T.BufferAttribute(posicoes,3).setUsage(T.DynamicDrawUsage));geometria.setAttribute('semente',new T.BufferAttribute(sementes,1));
 const material = new T.ShaderMaterial({transparent:true,depthWrite:true,uniforms:{escala:{value:45},brilho:{value:1},fluxo:{value:1}},vertexShader:`attribute float semente;varying float tom;varying float altura;uniform float escala;void main(){vec4 p=modelViewMatrix*vec4(position,1.);gl_Position=projectionMatrix*p;gl_PointSize=clamp(escala*(.75+semente*.65),1.1,4.8);tom=semente;altura=position.y;}`,fragmentShader:`precision highp float;varying float tom;varying float altura;uniform float brilho;void main(){vec2 p=gl_PointCoord*2.-1.;float r=dot(p,p);if(r>1.)discard;float luz=.43+.57*sqrt(1.-r);float centelha=pow(max(0.,1.-length(p-vec2(-.35,.4))),8.);vec3 areia=mix(vec3(.40,.22,.065),vec3(.98,.76,.40),tom*.55+.35);areia*=luz*brilho;areia+=vec3(1.,.87,.59)*centelha*.6;gl_FragColor=vec4(areia,smoothstep(1.,.6,r));}`});
 const graos = new T.Points(geometria,material);graos.frustumCulled=false;movimento.add(graos);
 const pos = new T.Vector3();
 let ultimaTransferencia=-1,ultimaParidade=-1;
 function atualizar(tempo,segundos,alturaEmPixels,dpr,reacao=0) {
  const angulos=orientarAmpulheta(tempo.virada,tempo.paridade);movimento.rotation.set(angulos.x,angulos.y,angulos.z);
  material.uniforms.escala.value = alturaEmPixels/4.2*.026*dpr;
  material.uniforms.brilho.value = 1.10 + Math.sin(segundos*1.2)*.025 + reacao*.15;
  const sinal = tempo.paridade ? -1:1;
  if(tempo.invertendo){
   const trecho=Math.min(19,Math.floor(tempo.virada*20)),p=tempo.virada*20-trecho,a=quadros[trecho],b=quadros[trecho+1];
   for(let i=0;i<quantidade*3;i+=3){posicoes[i]=(a[i]+(b[i]-a[i])*p)*sinal;posicoes[i+1]=(a[i+1]+(b[i+1]-a[i+1])*p)*sinal;posicoes[i+2]=a[i+2]+(b[i+2]-a[i+2])*p;}
   geometria.setDrawRange(0,quantidade);ultimaTransferencia=-1;
  }else{
   const transferidos=Math.floor(tempo.progresso*quantidade),restantes=quantidade-transferidos;
   if(transferidos!==ultimaTransferencia||tempo.paridade!==ultimaParidade){
    for(let i=0;i<quantidade;i++){
     const p=i<restantes?origem[i]:destino[i-restantes];posicoes[i*3]=p.x*sinal;posicoes[i*3+1]=p.y*sinal;posicoes[i*3+2]=p.z;
    }
    ultimaTransferencia=transferidos;ultimaParidade=tempo.paridade;
   }
   const fluxo=tempo.progresso<.9975;
   const alturaPilha=transferidos?destino[Math.min(quantidade-1,transferidos-1)].y:-1.82;
   for(let i=0;i<45;i++){
    const k=quantidade+i,queda=(segundos*(1.5+sementes[k]*.5)+i*.618)%1;
    const y=-.02+alturaPilha*queda*queda;
    pos.set((sementes[k]-.5)*.019*(1+queda),y,Math.sin(i*2.399+segundos*3)*.008);
    posicoes[k*3]=pos.x*sinal;posicoes[k*3+1]=pos.y*sinal;posicoes[k*3+2]=pos.z;
   }
   geometria.setDrawRange(0,quantidade+(fluxo?45:0));
  }
  geometria.attributes.position.needsUpdate=true;
 }
 return {objeto:conjunto,atualizar,altura:4.2};
}
