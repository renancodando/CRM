import * as T from './bibliotecas/three.module.min.js';

export function iniciarUniverso(preferencias){
 const tela=document.querySelector('#universo'),palco=document.querySelector('.palco-globo');
 const reduzir=matchMedia('(prefers-reduced-motion: reduce)'),ponteiroFino=matchMedia('(pointer:fine)');
 const renderizador=new T.WebGLRenderer({canvas:tela,alpha:true,antialias:true,powerPreference:'low-power'});
 renderizador.outputColorSpace=T.SRGBColorSpace;renderizador.toneMapping=T.ACESFilmicToneMapping;renderizador.toneMappingExposure=1.05;
 const cena=new T.Scene(),camera=new T.OrthographicCamera(-8,8,5,-5,.1,80);camera.position.set(0,0,30);
 const conjunto=new T.Group();cena.add(conjunto);
 cena.add(new T.HemisphereLight(0xc0d6ed,0x35261d,.65));
 const luzAzul=new T.DirectionalLight(0xb4d6ff,2.4);luzAzul.position.set(4,3,8);cena.add(luzAzul);
 const luzQuente=new T.DirectionalLight(0xffc18c,2.6);luzQuente.position.set(-5,1,6);cena.add(luzQuente);
 const luzBase=new T.PointLight(0xffb573,19,20,2);luzBase.position.set(-.45,-3,3);cena.add(luzBase);
 const sala=new T.Scene();sala.add(new T.Mesh(new T.BoxGeometry(20,15,18),new T.MeshBasicMaterial({color:'#111925',side:T.BackSide})));
 function painelDeLuz(cor,forca,x,y,z,largura,altura,rotacao=0){const plano=new T.Mesh(new T.PlaneGeometry(largura,altura),new T.MeshBasicMaterial({color:new T.Color(cor).multiplyScalar(forca),side:T.DoubleSide}));plano.position.set(x,y,z);plano.rotation.y=rotacao;sala.add(plano);}
 painelDeLuz('#c5e1ff',5,8,2,-4,2,9,Math.PI/2);painelDeLuz('#ffe0ba',5,-8,1,-4,1,8,Math.PI/2);painelDeLuz('#b3ccf1',2,-1,6,-6,8,1);painelDeLuz('#f2ac6b',2,0,-5,-6,6,.4);
 const gerador=new T.PMREMGenerator(renderizador),reflexos=gerador.fromScene(sala,.06,.1,60);cena.environment=reflexos.texture;cena.environmentIntensity=.9;gerador.dispose();sala.traverse(objeto=>{objeto.geometry?.dispose();objeto.material?.dispose();});
 const texturas=[];
 function brilho(cor){const desenho=document.createElement('canvas');desenho.width=desenho.height=96;const contexto=desenho.getContext('2d'),gradiente=contexto.createRadialGradient(48,48,0,48,48,48);gradiente.addColorStop(0,'#ffffff');gradiente.addColorStop(.1,cor);gradiente.addColorStop(.35,cor+'65');gradiente.addColorStop(1,cor+'00');contexto.fillStyle=gradiente;contexto.fillRect(0,0,96,96);const textura=new T.CanvasTexture(desenho);texturas.push(textura);return textura;}
 const brilhoAzul=brilho('#8cbfff'),brilhoOuro=brilho('#ffb675');
 function halo(textura,tamanho,opacidade=.4){const objeto=new T.Sprite(new T.SpriteMaterial({map:textura,transparent:true,opacity:opacidade,blending:T.AdditiveBlending,depthWrite:false}));objeto.scale.setScalar(tamanho);return objeto;}
 function metal(cor,opcoes={}){return new T.MeshStandardMaterial({color:cor,metalness:.9,roughness:.25,...opcoes});}
 const centro=new T.Vector3(-.45,.32,0),planeta=new T.Group();planeta.position.copy(centro);conjunto.add(planeta);
 const corpo=new T.Mesh(new T.SphereGeometry(3.16,80,56),new T.MeshPhysicalMaterial({color:'#8798a9',metalness:.18,roughness:.49,clearcoat:.28,clearcoatRoughness:.3}));planeta.add(corpo);
 new T.TextureLoader().load('ativos/terra.webp',textura=>{
  textura.colorSpace=T.SRGBColorSpace;textura.anisotropy=Math.min(4,renderizador.capabilities.getMaxAnisotropy());texturas.push(textura);corpo.material.map=textura;corpo.material.needsUpdate=true;
  const desenho=document.createElement('canvas');desenho.width=textura.image.width;desenho.height=textura.image.height;const contexto=desenho.getContext('2d',{willReadFrequently:true});contexto.drawImage(textura.image,0,0);const pixels=contexto.getImageData(0,0,desenho.width,desenho.height).data,posicoes=[],cores=[],cor=new T.Color();
  for(let i=0;i<19000;i++){
   const y=1-2*(i+.5)/19000,angulo=i*2.39996323,latitude=Math.acos(y),u=((angulo/(Math.PI*2))%1+1)%1,v=1-latitude/Math.PI,x=Math.floor(u*(desenho.width-1)),linha=Math.floor((1-v)*(desenho.height-1)),indice=(linha*desenho.width+x)*4;
   const terra=pixels[indice+1]>pixels[indice+2]*.76&&pixels[indice]>pixels[indice+2]*.55;
   if(!terra&&i%7!==0)continue;
   posicoes.push(-Math.cos(angulo)*Math.sin(latitude)*3.19,y*3.19,Math.sin(angulo)*Math.sin(latitude)*3.19);
   cor.set(terra?'#a4cdf5':'#456181');cor.multiplyScalar(terra?.65+pixels[indice+1]/380:.45);cores.push(...cor.toArray());
  }
  const geometria=new T.BufferGeometry();geometria.setAttribute('position',new T.Float32BufferAttribute(posicoes,3));geometria.setAttribute('color',new T.Float32BufferAttribute(cores,3));
  planeta.add(new T.Points(geometria,new T.PointsMaterial({vertexColors:true,size:.024,sizeAttenuation:true,transparent:true,opacity:.7,depthWrite:false})));desenhar();
 });
 const grade=[];
 for(let latitude=-60;latitude<=60;latitude+=20){const y=Math.sin(latitude*Math.PI/180)*3.185,raio=Math.cos(latitude*Math.PI/180)*3.185;for(let j=0;j<128;j++){const a=j/128*Math.PI*2,b=(j+1)/128*Math.PI*2;grade.push(Math.cos(a)*raio,y,Math.sin(a)*raio,Math.cos(b)*raio,y,Math.sin(b)*raio);}}
 for(let meridiano=0;meridiano<12;meridiano++){const a=meridiano/12*Math.PI;for(let j=0;j<128;j++){const p=j/128*Math.PI*2,q=(j+1)/128*Math.PI*2;grade.push(Math.cos(p)*Math.cos(a)*3.185,Math.sin(p)*3.185,Math.cos(p)*Math.sin(a)*3.185,Math.cos(q)*Math.cos(a)*3.185,Math.sin(q)*3.185,Math.cos(q)*Math.sin(a)*3.185);}}
 planeta.add(new T.LineSegments(new T.BufferGeometry().setAttribute('position',new T.Float32BufferAttribute(grade,3)),new T.LineBasicMaterial({color:'#8eaccb',transparent:true,opacity:.13,depthWrite:false})));
 const atmosfera=new T.Mesh(new T.SphereGeometry(3.205,64,48),new T.ShaderMaterial({transparent:true,depthWrite:false,vertexShader:'varying vec3 normalLocal;void main(){normalLocal=normalize(normalMatrix*normal);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:'precision mediump float;varying vec3 normalLocal;void main(){vec3 n=normalize(normalLocal);float borda=pow(1.-max(0.,n.z),3.5);float quente=smoothstep(.1,.8,-n.x);vec3 cor=mix(vec3(.48,.7,1.),vec3(1.,.65,.38),quente);float reflexo=pow(max(0.,dot(n,normalize(vec3(-.6,.6,1.)))),70.);gl_FragColor=vec4(cor+reflexo*.6,borda*.8+reflexo*.18);}'}));planeta.add(atmosfera);
 const aura=halo(brilhoAzul,9.1,.13);aura.position.set(centro.x,centro.y,-1.5);conjunto.add(aura);
 const orbitaDourada=metal('#c7ac9b',{roughness:.21,transparent:true,opacity:.77,side:T.DoubleSide});
 const orbitas=[],viajantes=[];
 [[5.5,1.1,.12,-.32],[5.45,1.34,-.18,.22],[4.97,1.42,.19,-.08]].forEach(([raio,x,y,z],i)=>{
  const orbita=new T.Group();orbita.position.copy(centro);orbita.rotation.set(x,y,z);
  orbita.add(new T.Mesh(new T.RingGeometry(raio-.052,raio+.052,240),i===0?orbitaDourada:metal('#8da4bf',{roughness:.19,transparent:true,opacity:.45,side:T.DoubleSide})));
  const borda=new T.Mesh(new T.TorusGeometry(raio,.014,6,240),metal(i===0?'#d8c7b7':'#91b6e3',{roughness:.17}));orbita.add(borda);conjunto.add(orbita);orbitas.push(orbita);
  for(let j=0;j<(i===0?5:2);j++){const ponto=halo(i===0?brilhoOuro:brilhoAzul,j===0?.38:.16,j===0?.8:.5);orbita.add(ponto);viajantes.push({ponto,raio,velocidade:(i%2?-.045:.055),fase:j*1.3+i});}
 });
 const plataforma=new T.Group();plataforma.position.set(centro.x,-3.45,.1);plataforma.rotation.x=.10;conjunto.add(plataforma);
 const base=new T.Mesh(new T.CylinderGeometry(6.32,6.36,.36,128),[metal('#718196',{metalness:.62,roughness:.25,emissive:'#1d2b40',emissiveIntensity:.3}),metal('#3b4c64',{metalness:.65,roughness:.3}),metal('#27354a',{roughness:.4})]);plataforma.add(base);
 const bordaInferior=new T.Mesh(new T.TorusGeometry(6.35,.018,8,192),metal('#d9c5ad',{roughness:.19,emissive:'#8a5838',emissiveIntensity:.22}));bordaInferior.rotation.x=Math.PI/2;bordaInferior.position.y=-.18;plataforma.add(bordaInferior);
 const divisorias=new T.InstancedMesh(new T.BoxGeometry(.013,.2,.02),metal('#92a7bf',{roughness:.27}),128),marcador=new T.Object3D();for(let i=0;i<128;i++){const a=i/128*Math.PI*2;marcador.position.set(Math.cos(a)*6.356,0,Math.sin(a)*6.356);marcador.rotation.y=-a;marcador.updateMatrix();divisorias.setMatrixAt(i,marcador.matrix);}plataforma.add(divisorias);
 for(let i=0;i<4;i++){
  const raio=6.31-i*.11,anel=new T.Mesh(new T.TorusGeometry(raio,i===0?.025:.012,8,192),metal(i%2?'#6a7f98':'#d1b092',{roughness:.2,emissive:i===0?'#925325':'#000000',emissiveIntensity:.17}));anel.rotation.x=Math.PI/2;anel.position.y=.13+i*.002;plataforma.add(anel);
 }
 const circuloInterno=new T.Mesh(new T.RingGeometry(3.08,3.2,128),new T.MeshBasicMaterial({color:'#8daed6',transparent:true,opacity:.16,side:T.DoubleSide}));circuloInterno.rotation.x=-Math.PI/2;circuloInterno.position.y=.132;plataforma.add(circuloInterno);
 const marcas=new T.InstancedMesh(new T.BoxGeometry(.014,.016,.15),metal('#9eabc1',{roughness:.32}),96),auxiliar=new T.Object3D();for(let i=0;i<96;i++){const a=i/96*Math.PI*2;auxiliar.position.set(Math.cos(a)*6.15,.137,Math.sin(a)*6.15);auxiliar.rotation.y=-a;auxiliar.updateMatrix();marcas.setMatrixAt(i,auxiliar.matrix);}plataforma.add(marcas);
 const suporte=new T.Mesh(new T.CylinderGeometry(3.25,3.25,1.02,80,1,true),new T.ShaderMaterial({transparent:true,depthWrite:false,side:T.DoubleSide,uniforms:{tempo:{value:0}},vertexShader:'varying vec2 coordenada;void main(){coordenada=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:'precision mediump float;varying vec2 coordenada;uniform mediump float tempo;void main(){float haste=pow(max(0.,sin(coordenada.x*31.4159)),18.);float fluxo=.5+.5*sin(coordenada.y*23.-tempo*.9);float borda=pow(1.-abs(coordenada.y-.5)*2.,.5);gl_FragColor=vec4(.46,.71,1.,(.012+haste*.065+fluxo*.012)*borda);}'}));suporte.position.set(centro.x,-2.9,-.15);conjunto.add(suporte);
 const fonte=halo(brilhoOuro,2.35,.85);fonte.position.set(centro.x,-3.33,4);conjunto.add(fonte);const nucleoLuz=halo(brilhoOuro,.28,1);nucleoLuz.position.copy(fonte.position);conjunto.add(nucleoLuz);
 const reflexoHorizontal=halo(brilhoOuro,1,.45);reflexoHorizontal.position.copy(fonte.position);reflexoHorizontal.scale.set(5,.055,1);conjunto.add(reflexoHorizontal);
 const poeiraPosicoes=[],sementes=[];for(let i=0;i<90;i++){poeiraPosicoes.push((Math.random()-.5)*17,(Math.random()-.5)*9,-4+Math.random()*5);sementes.push(Math.random());}
 const geometriaPoeira=new T.BufferGeometry();geometriaPoeira.setAttribute('position',new T.Float32BufferAttribute(poeiraPosicoes,3));geometriaPoeira.setAttribute('semente',new T.Float32BufferAttribute(sementes,1));
 const materialPoeira=new T.ShaderMaterial({transparent:true,depthWrite:false,blending:T.AdditiveBlending,uniforms:{tempo:{value:0}},vertexShader:'attribute float semente;uniform mediump float tempo;varying float transparencia;void main(){vec3 p=position;p.y+=sin(tempo*.12+semente*23.)*.17;p.x+=sin(tempo*.08+semente*17.)*.2;vec4 vista=modelViewMatrix*vec4(p,1.);gl_Position=projectionMatrix*vista;gl_PointSize=1.+semente*1.4;transparencia=.12+semente*.3;}',fragmentShader:'precision mediump float;varying float transparencia;void main(){float raio=length(gl_PointCoord-.5);gl_FragColor=vec4(.85,.78,.66,exp(-raio*raio*22.)*transparencia);}'});conjunto.add(new T.Points(geometriaPoeira,materialPoeira));
 let tempo=0,anterior=0,ultimoQuadro=0,quadro=0,foco='',energia=0,pronto=false;
 const ponteiro=new T.Vector2();
 function redimensionar(){const area=tela.getBoundingClientRect(),larguraMundo=innerWidth<700?13.4:16,alturaMundo=larguraMundo*area.height/area.width;camera.left=-larguraMundo/2;camera.right=larguraMundo/2;camera.top=alturaMundo/2;camera.bottom=-alturaMundo/2;camera.updateProjectionMatrix();renderizador.setPixelRatio(preferencias.qualidade==='alta'?Math.min(devicePixelRatio,1.8):preferencias.qualidade==='economica'?.85:Math.min(devicePixelRatio,1.35));renderizador.setSize(area.width,area.height,false);desenhar();}
 function desenhar(){energia=T.MathUtils.lerp(energia,foco?1:0,.06);planeta.rotation.y=tempo*.035-.3;planeta.rotation.z=-.12;viajantes.forEach(item=>{const a=tempo*item.velocidade*(1+energia*.3)+item.fase;item.ponto.position.set(Math.cos(a)*item.raio,Math.sin(a)*item.raio,.025);});suporte.material.uniforms.tempo.value=tempo;materialPoeira.uniforms.tempo.value=tempo;fonte.material.opacity=.7+Math.sin(tempo*.9)*.07+energia*.14;luzBase.intensity=19+energia*8;conjunto.rotation.y=T.MathUtils.lerp(conjunto.rotation.y,ponteiroFino.matches?ponteiro.x*.018:0,.03);conjunto.rotation.x=T.MathUtils.lerp(conjunto.rotation.x,ponteiroFino.matches?ponteiro.y*.009:0,.03);renderizador.render(cena,camera);}
 function animar(agora){if(!preferencias.movimento||reduzir.matches||document.hidden){quadro=0;return;}quadro=requestAnimationFrame(animar);const intervalo=preferencias.qualidade==='alta'?23:preferencias.qualidade==='economica'?50:33;if(agora-ultimoQuadro<intervalo)return;if(anterior)tempo+=Math.min((agora-anterior)/1000,.08);anterior=agora;ultimoQuadro=agora;desenhar();}
 function sincronizar(){cancelAnimationFrame(quadro);anterior=0;if(preferencias.movimento&&!reduzir.matches&&!document.hidden)quadro=requestAnimationFrame(animar);else desenhar();}
 new ResizeObserver(redimensionar).observe(palco);addEventListener('resize',redimensionar);document.addEventListener('visibilitychange',sincronizar);reduzir.addEventListener('change',sincronizar);
 palco.addEventListener('pointermove',e=>{if(!ponteiroFino.matches)return;const area=palco.getBoundingClientRect();ponteiro.set((e.clientX-area.left)/area.width*2-1,(e.clientY-area.top)/area.height*2-1);});palco.addEventListener('pointerleave',()=>ponteiro.set(0,0));
 document.addEventListener('orbita:preferencias',e=>{Object.assign(preferencias,e.detail);redimensionar();sincronizar();});document.addEventListener('orbita:foco',e=>{foco=e.detail;if(!preferencias.movimento||reduzir.matches)desenhar();});
 tela.addEventListener('webglcontextlost',e=>{e.preventDefault();cancelAnimationFrame(quadro);document.body.classList.remove('cena-pronta');});
 redimensionar();sincronizar();pronto=true;document.body.classList.add('cena-pronta');document.dispatchEvent(new CustomEvent('orbita:cena-pronta'));
 return {redimensionar};
}
