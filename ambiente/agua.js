import * as T from '../bibliotecas/three.module.min.js';

const fragmento=`precision highp float;
varying vec2 uvTela;
uniform vec2 resolucao;
uniform float tempo;
uniform float horizonte;
uniform sampler2D reflexos;
uniform vec3 foco;
uniform vec3 ampulheta;
uniform vec4 perturbacoes[12];
uniform vec4 paineis[3];
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float ruido(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1.,0.)),f.x),mix(hash(i+vec2(0.,1.)),hash(i+1.),f.x),f.y);}
float relevo(vec2 p){
 float h=sin(p.x*2.7+p.y*1.3-tempo*.55)*.045;
 h+=sin(p.x*-3.6+p.y*5.7+tempo*.69)*.028;
 h+=sin(p.x*9.4+p.y*3.1-tempo*.83)*.008;
 h+=(ruido(p*5.+vec2(tempo*.14,-tempo*.2))-.5)*.018;
 h+=(ruido(p*15.+vec2(-tempo*.08,tempo*.11))-.5)*.003;
 h+=sin(p.x*36.7+p.y*24.2+tempo*1.3)*.0018;
 h+=sin(p.x*-27.1+p.y*41.3-tempo*1.17)*.0013;
 for(int i=0;i<12;i++){
  vec4 onda=perturbacoes[i];float idade=tempo-onda.z;
  if(idade>=0.&&idade<5.5){
   vec2 origem=onda.xy;float d=length(p-origem),frente=d-idade*1.65;
   float envelope=exp(-frente*frente*11.)*exp(-idade*.83);
   h+=sin(frente*25.)*envelope*onda.w;
  }
 }
 return h;
}
vec3 reflexoObjeto(vec3 objeto,vec2 uv,vec2 distorcao){
 float distancia=objeto.y-uv.y;
 if(distancia<0.)return vec3(0.);
 vec2 amostra=vec2(uv.x,objeto.y+distancia*.84)+distorcao;
 vec4 cor=texture2D(reflexos,amostra,1.5+distancia*12.);
 float recorte=1.-smoothstep(objeto.z*.75,objeto.z*1.3,abs(uv.x-objeto.x));
 return cor.rgb*cor.a*exp(-distancia*6.)*recorte*.68;
}
void main(){
 vec2 uv=uvTela;float aspecto=resolucao.x/resolucao.y;
 float profundidade=max(.035,horizonte-uv.y);
 vec2 p=vec2((uv.x-.5)*aspecto*4./(.24+profundidade),2.5/(.24+profundidade));
 float h=relevo(p);float e=.006;
 vec3 normal=normalize(vec3((relevo(p-vec2(e,0.))-relevo(p+vec2(e,0.)))/(2.*e),1.,(relevo(p-vec2(0.,e))-relevo(p+vec2(0.,e)))/(2.*e)));
 vec3 olhar=normalize(vec3((.5-uv.x)*.25,.40,1.));
 float fresnel=pow(1.-max(0.,dot(normal,olhar)),3.);
 vec3 verde=normalize(vec3(-.8,1.7,1.2));vec3 cobre=normalize(vec3(.2,1.2,.85));
 float brilhoVerde=pow(max(0.,dot(normal,normalize(olhar+verde))),105.);
 float brilhoCobre=pow(max(0.,dot(normal,normalize(olhar+cobre))),150.);
 vec3 direcaoRefletida=reflect(-olhar,normal);
 float luzAmbiente=pow(max(0.,direcaoRefletida.z),3.)*.045;
 vec3 cor=mix(vec3(.002,.009,.009),vec3(.013,.038,.030),fresnel*.7+.1);
 cor+=vec3(.13,.37,.29)*(brilhoVerde*.75+luzAmbiente);
 cor+=vec3(.92,.65,.34)*brilhoCobre*.9;
 float trilha=.5+.5*sin(p.y*28.+h*61.);
 float feixe=exp(-pow((uv.x-foco.x+normal.x*.1)/max(.012,foco.z*.20),2.));
 float reflexoLuz=pow(max(0.,dot(normal,normalize(vec3(0.,.85,1.)))),30.);
 cor+=vec3(.68,.40,.16)*feixe*(.03+reflexoLuz*.8)*(.25+trilha*.75);
 float verdeLateral=exp(-pow((uv.x-.12+normal.z*.08)/.11,2.))+exp(-pow((uv.x-.91+normal.z*.06)/.12,2.));
 cor+=vec3(.04,.12,.09)*verdeLateral*reflexoLuz*(.3+trilha*.7);
 vec2 distorcao=normal.xz*vec2(.019,.010)*(1.+profundidade);
 cor+=reflexoObjeto(foco,uv,distorcao)+reflexoObjeto(ampulheta,uv,distorcao*.7);
 for(int i=0;i<3;i++){
  vec4 painel=paineis[i];float abaixo=painel.y-uv.y;
  float largura=1.-smoothstep(painel.z*.75,painel.z,abs(uv.x-painel.x+distorcao.x));
  if(abaixo>0.)cor+=vec3(.035,.075,.052)*exp(-abaixo*17.)*largura*(.2+reflexoLuz*.8)*painel.w;
 }
 float contato=exp(-pow((uv.y-foco.y)/.025,2.))*exp(-pow((uv.x-foco.x)/max(.025,foco.z*.7),2.));
 cor*=1.-contato*.62;
 float distanciaFoco=length(vec2((uv.x-foco.x)*aspecto,(uv.y-foco.y)*3.2));
 float circulos=pow(max(0.,sin(distanciaFoco*95.-tempo*.75)),18.)*exp(-distanciaFoco*5.5);
 cor+=vec3(.46,.30,.15)*circulos*.15*(1.-smoothstep(foco.y-.012,foco.y+.02,uv.y));
 float agua=(1.-smoothstep(horizonte-.07,horizonte+.02,uv.y));
 vec3 ambiente=vec3(.002,.011,.011)+vec3(.01,.042,.033)*exp(-length((uv-vec2(.52,.65))*vec2(1.5,1.))*.9);
 cor=mix(ambiente,cor,agua);
 cor*=mix(.55,1.,smoothstep(0.,.1,uv.x)*(1.-smoothstep(.9,1.,uv.x)));
 gl_FragColor=vec4(cor,1.);
 #include <tonemapping_fragment>
 #include <colorspace_fragment>
}`;

export function criarAgua(textura) {
 const perturbacoes=Array.from({length:12},()=>new T.Vector4(0,0,-100,0));
 const uniformes={resolucao:{value:new T.Vector2(1000,600)},tempo:{value:0},horizonte:{value:.82},reflexos:{value:textura},foco:{value:new T.Vector3(.5,.12,.14)},ampulheta:{value:new T.Vector3(.93,.43,.07)},perturbacoes:{value:perturbacoes},paineis:{value:Array.from({length:3},()=>new T.Vector4(0,0,0,0))}};
 const material=new T.ShaderMaterial({uniforms:uniformes,vertexShader:'varying vec2 uvTela;void main(){uvTela=uv;gl_Position=vec4(position.xy,0.,1.);}',fragmentShader:fragmento,depthWrite:false,depthTest:false});
 const cena=new T.Scene(),camera=new T.Camera();cena.add(new T.Mesh(new T.PlaneGeometry(2,2),material));
 let proxima=0;
 function perturbar(x,y,forca,tempo) {
  const aspecto=uniformes.resolucao.value.x/uniformes.resolucao.value.y,profundidade=Math.max(.035,uniformes.horizonte.value-y);
  const px=(x-.5)*aspecto*4/(.24+profundidade),py=2.5/(.24+profundidade);
  perturbacoes[proxima].set(px,py,tempo,forca);proxima=(proxima+1)%perturbacoes.length;
 }
 return {cena,camera,uniformes,perturbar};
}
