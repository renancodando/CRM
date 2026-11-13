(()=>{
 const reduzir=matchMedia('(prefers-reduced-motion: reduce)'),limiteDensidade=Math.min(devicePixelRatio||1,1.25);
 const vertices='attribute vec2 posicao;varying vec2 coordenada;void main(){coordenada=posicao*.5+.5;gl_Position=vec4(posicao,0.,1.);}';
 const fragmentos=`precision mediump float;varying vec2 coordenada;uniform float tempo;uniform float brisa;uniform vec2 resolucao;uniform vec2 ponteiro;uniform vec3 impulsos[4];
 float acaso(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
 float ruido(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(acaso(i),acaso(i+vec2(1.,0.)),f.x),mix(acaso(i+vec2(0.,1.)),acaso(i+vec2(1.)),f.x),f.y);}
 float altura(vec2 p){
  float t=tempo*.3;
  float ondulacao=sin(p.x*12.+p.y*7.-t*2.4)*.008+sin(p.x*21.-p.y*17.+t*3.)*.004;
  ondulacao+=(ruido(p*14.+vec2(t,-t*.7))-.5)*.014+(ruido(p*29.+vec2(-t*.4,t*.8))-.5)*.006;
  float distancia=length((p-vec2(.53,.54))*vec2(1.,1.3));
  float fase=mod(tempo,4.8),idade=max(0.,fase-3.4),raio=idade*.6;
  float pulso=sin(distancia*87.-idade*29.)*exp(-pow((distancia-raio)*8.,2.))*(1.-smoothstep(.7,1.4,idade));
  ondulacao+=pulso*.012*step(3.4,fase)*brisa;
  for(int i=0;i<4;i++){float idadeImpulso=tempo-impulsos[i].z;float d=distance(p,impulsos[i].xy);float frente=exp(-pow((d-idadeImpulso*.42)*9.,2.));float decaimento=exp(-idadeImpulso*.9)*step(0.,idadeImpulso)*step(idadeImpulso,6.);ondulacao+=sin(d*76.-idadeImpulso*23.)*frente*decaimento*.018;}
  float vento=exp(-dot((p-ponteiro)*vec2(2.,3.),(p-ponteiro)*vec2(2.,3.)));ondulacao+=sin(p.x*43.+p.y*17.-tempo*1.3)*vento*.0025;
  return ondulacao;
 }
 void main(){
  vec2 uv=coordenada;float aspecto=resolucao.x/resolucao.y;vec2 p=vec2((uv.x-.5)*aspecto,uv.y);p.x=p.x/aspecto+.5;
  float plano=smoothstep(.03,.32,uv.y)*(1.-smoothstep(.59,.83,uv.y));float silhueta=1.-smoothstep(.38,.64,length((uv-vec2(.51,.4))*vec2(.92,1.5)));
  vec2 agua=vec2(p.x,(p.y-.18)*2.1);float h=altura(agua);float eps=.003;
  vec3 normal=normalize(vec3((altura(agua+vec2(eps,0.))-h)*-26.,(altura(agua+vec2(0.,eps))-h)*-18.,1.));
  vec3 luz=normalize(vec3(-.55,.7,1.25)),vista=normalize(vec3(0.,-.75,1.));float difusa=max(0.,dot(normal,luz));float fresnel=.025+.975*pow(1.-max(0.,dot(normal,vista)),5.);
  float espelho=pow(max(0.,dot(normal,normalize(luz+vista))),92.);float espelhoLongo=pow(max(0.,dot(normal,normalize(vec3(.4,.35,1.)))),28.);
  float caustica=pow(1.-abs(sin((agua.x+normal.x*.09)*45.+(agua.y+normal.y*.09)*21.)),13.);
  vec3 fundo=mix(vec3(.026,.18,.36),vec3(.43,.65,.52),brisa),reflexo=mix(vec3(.41,.75,.94),vec3(.91,.96,.83),brisa);
  vec3 cor=fundo*(.7+difusa*.3)+reflexo*(fresnel*.22+espelho*.65+espelhoLongo*.13+caustica*.035);
  float linha=abs(sin(agua.y*42.+normal.y*2.8));float anel=pow(1.-linha,16.);cor+=reflexo*anel*.06;
  float transparencia=plano*silhueta*mix(.45,.7,brisa);transparencia*=smoothstep(0.,.08,uv.x)*(1.-smoothstep(.93,1.,uv.x));
  gl_FragColor=vec4(cor,transparencia);
 }`;
 document.querySelectorAll('canvas[data-agua]').forEach(tela=>{
  const gl=tela.getContext('webgl',{alpha:true,antialias:false,premultipliedAlpha:false,powerPreference:'low-power',preserveDrawingBuffer:false});if(!gl)return;
  function compilar(tipo,codigo){const shader=gl.createShader(tipo);gl.shaderSource(shader,codigo);gl.compileShader(shader);if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS)){gl.deleteShader(shader);return null;}return shader;}
  const vertex=compilar(gl.VERTEX_SHADER,vertices),fragment=compilar(gl.FRAGMENT_SHADER,fragmentos);if(!vertex||!fragment){tela.style.display='none';return;}
  const programa=gl.createProgram();gl.attachShader(programa,vertex);gl.attachShader(programa,fragment);gl.linkProgram(programa);if(!gl.getProgramParameter(programa,gl.LINK_STATUS)){tela.style.display='none';return;}
  gl.useProgram(programa);const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);const posicao=gl.getAttribLocation(programa,'posicao');gl.enableVertexAttribArray(posicao);gl.vertexAttribPointer(posicao,2,gl.FLOAT,false,0,0);
  const uniformes=Object.fromEntries(['tempo','brisa','resolucao','ponteiro','impulsos[0]'].map(nome=>[nome,gl.getUniformLocation(programa,nome)]));
  gl.uniform1f(uniformes.brisa,tela.dataset.agua==='brisa'?1:0);
  let tempo=0,quadro=0,anterior=0,ultimo=0,visivel=false,perdido=false,ultimoImpulso=-3,indiceImpulso=0;
  const impulsos=new Float32Array([.5,.5,-20,.5,.5,-20,.5,.5,-20,.5,.5,-20]),ponteiro=[.5,.55],arte=tela.closest('.hero-arte')||tela.parentElement;
  function desenhar(){if(perdido)return;gl.useProgram(programa);gl.uniform1f(uniformes.tempo,tempo);gl.uniform2f(uniformes.resolucao,tela.width,tela.height);gl.uniform2f(uniformes.ponteiro,...ponteiro);gl.uniform3fv(uniformes['impulsos[0]'],impulsos);gl.drawArrays(gl.TRIANGLES,0,6);}
  function redimensionar(){const retangulo=tela.getBoundingClientRect();tela.width=Math.max(1,Math.min(840,Math.round(retangulo.width*limiteDensidade)));tela.height=Math.max(1,Math.min(440,Math.round(retangulo.height*limiteDensidade)));gl.viewport(0,0,tela.width,tela.height);desenhar();}
  function animar(agora){if(!visivel||document.hidden||reduzir.matches||perdido){quadro=0;return;}quadro=requestAnimationFrame(animar);if(agora-ultimo<42)return;if(anterior)tempo+=Math.min(.08,(agora-anterior)/1000);anterior=agora;ultimo=agora;desenhar();}
  function sincronizar(){cancelAnimationFrame(quadro);anterior=0;if(visivel&&!document.hidden&&!reduzir.matches&&!perdido)quadro=requestAnimationFrame(animar);else desenhar();}
  function interagir(evento,forcar=false){const area=tela.getBoundingClientRect();ponteiro[0]=Math.min(1,Math.max(0,(evento.clientX-area.left)/area.width));ponteiro[1]=(1-Math.min(1,Math.max(0,(evento.clientY-area.top)/area.height))-.18)*2.1;if(!reduzir.matches&&(forcar||tempo-ultimoImpulso>.9)){const indice=indiceImpulso++%4;impulsos[indice*3]=ponteiro[0];impulsos[indice*3+1]=ponteiro[1];impulsos[indice*3+2]=tempo;ultimoImpulso=tempo;}}
  arte.addEventListener('pointermove',evento=>interagir(evento),{passive:true});arte.addEventListener('pointerdown',evento=>interagir(evento,true),{passive:true});
  new ResizeObserver(redimensionar).observe(tela);new IntersectionObserver(entradas=>{visivel=entradas[0].isIntersecting;sincronizar();},{rootMargin:'40px'}).observe(tela);document.addEventListener('visibilitychange',sincronizar);reduzir.addEventListener('change',sincronizar);
  tela.addEventListener('webglcontextlost',evento=>{evento.preventDefault();perdido=true;cancelAnimationFrame(quadro);tela.classList.remove('agua-pronta');});
  redimensionar();tela.classList.add('agua-pronta');
 });
})();
