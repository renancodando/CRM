(()=>{
 let preparacao;
 async function preparar(T){
  if(preparacao)return preparacao;
  preparacao=(async()=>{
   const dados=window.GeometriaAutomovel;if(!dados||!window.DecompressionStream)throw Error('Geometria 3D indisponível.');
   const texto=atob(dados.conteudo),compactado=new Uint8Array(texto.length);for(let i=0;i<texto.length;i++)compactado[i]=texto.charCodeAt(i);
   const fluxo=new Blob([compactado]).stream().pipeThrough(new DecompressionStream('gzip')),binario=await new Response(fluxo).arrayBuffer();
   return dados.partes.map(parte=>{
    const origem=new Int16Array(binario,parte.posicoes,parte.vertices*3),normalOrigem=new Int16Array(binario,parte.normais,parte.vertices*3),posicoes=new Float32Array(origem.length),normais=new Float32Array(origem.length);
    for(let i=0;i<origem.length;i++){posicoes[i]=origem[i]/32767*parte.escala[i%3]+parte.centro[i%3];normais[i]=normalOrigem[i]/32767;}
    const geometria=new T.BufferGeometry();geometria.setAttribute('position',new T.BufferAttribute(posicoes,3));geometria.setAttribute('normal',new T.BufferAttribute(normais,3));
    const indices=parte.bits===16?new Uint16Array(binario,parte.faces,parte.indices):new Uint32Array(binario,parte.faces,parte.indices);geometria.setIndex(new T.BufferAttribute(indices,1));geometria.computeBoundingSphere();
    return {nome:parte.nome,geometria};
   });
  })();return preparacao;
 }
 window.criarAutomovelDetalhado=async function(tipo,grupo,{T,material,metal,malha}){
  const partes=await preparar(T),azul=tipo==='blue',carro=new T.Group(),modelo=new T.Group();grupo.add(carro);carro.add(modelo);modelo.rotation.y=Math.PI/2;
  const pintura=material(azul?'#0759c7':'#111519',{metalness:.88,roughness:azul ? .28 : .24,clearcoat:.75,clearcoatRoughness:.15,envMapIntensity:1.0});
  const aco=metal('#a8b4bf',{roughness:.29,envMapIntensity:1.1}),cromado=metal('#ced6dd',{roughness:.18}),borracha=material('#111316',{roughness:.81}),plastico=material('#0b1117',{roughness:.52,metalness:.1});
  const vidro=material('#101820',{metalness:.12,roughness:.13,clearcoat:1,clearcoatRoughness:.08,envMapIntensity:.55});
  const farois=material('#b9d1df',{roughness:.10,metalness:.42,clearcoat:1,emissive:'#d3eaff',emissiveIntensity:.22}),leds=material('#e5f8ff',{emissive:'#a4ddff',emissiveIntensity:2,roughness:.16}),traseiras=material('#8f1018',{emissive:'#c4131e',emissiveIntensity:.3,roughness:.15});
  const freios=metal(azul?'#aeb8b9':'#af7725',{roughness:.4}),discos=metal('#798188',{roughness:.5});
  for(const parte of partes){const nome=parte.nome;let acabamento=plastico;if(nome==='body')acabamento=pintura;else if(nome==='glass')acabamento=vidro;else if(nome==='tire')acabamento=borracha;else if(nome.startsWith('rim')||nome==='trim'||nome==='metal'||nome==='wheel')acabamento=aco;else if(nome==='chrome'||nome==='nuts')acabamento=cromado;else if(nome==='lights')acabamento=farois;else if(nome==='leds')acabamento=leds;else if(nome==='lights_red')acabamento=traseiras;else if(nome==='brake')acabamento=discos;else if(nome==='brakes')acabamento=freios;const objeto=malha(parte.geometria,acabamento,modelo);objeto.name=nome;}
  if(!azul){const espuma=new T.InstancedMesh(new T.SphereGeometry(1,10,8),material('#f5fafb',{roughness:.57,clearcoat:.25}),460),matriz=new T.Matrix4();for(let i=0;i<460;i++){const a=i*2.399,r=.009+(i%9)*.003,x=-2.28+Math.sin(a)*.17+(i%7)*.065,z=-.97+(i*37%200)/100,y=.018+Math.abs(Math.sin(a))*.035;matriz.compose(new T.Vector3(x,y,z),new T.Quaternion(),new T.Vector3(r*1.3,r*.7,r));espuma.setMatrixAt(i,matriz);}carro.add(espuma);}
  carro.position.y=-.20;carro.rotation.y=-.06;return {objeto:carro,tamanho:5.8,carro:true};
 };
})();
