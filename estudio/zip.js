const tabela=Uint32Array.from({length:256},(_,indice)=>{let valor=indice;for(let i=0;i<8;i++)valor=valor&1?0xedb88320^(valor>>>1):valor>>>1;return valor>>>0;});
function crc32(dados){let valor=0xffffffff;for(const byte of dados)valor=tabela[(valor^byte)&255]^(valor>>>8);return (valor^0xffffffff)>>>0;}
export function criarZip(arquivos){
 const codificar=new TextEncoder(),partes=[],diretorio=[];let deslocamento=0,tamanhoDiretorio=0;
 for(const [caminho,conteudo] of Object.entries(arquivos)){
  if(caminho.startsWith('/')||caminho.split('/').includes('..'))throw Error('Caminho de arquivo inválido.');
  const nome=codificar.encode(caminho),dados=typeof conteudo==='string'?codificar.encode(conteudo):conteudo,crc=crc32(dados),cabecalho=new Uint8Array(30+nome.length),vista=new DataView(cabecalho.buffer);
  vista.setUint32(0,0x04034b50,true);vista.setUint16(4,20,true);vista.setUint16(6,0x800,true);vista.setUint16(12,33,true);vista.setUint32(14,crc,true);vista.setUint32(18,dados.length,true);vista.setUint32(22,dados.length,true);vista.setUint16(26,nome.length,true);cabecalho.set(nome,30);partes.push(cabecalho,dados);
  const central=new Uint8Array(46+nome.length),registro=new DataView(central.buffer);registro.setUint32(0,0x02014b50,true);registro.setUint16(4,20,true);registro.setUint16(6,20,true);registro.setUint16(8,0x800,true);registro.setUint16(14,33,true);registro.setUint32(16,crc,true);registro.setUint32(20,dados.length,true);registro.setUint32(24,dados.length,true);registro.setUint16(28,nome.length,true);registro.setUint32(42,deslocamento,true);central.set(nome,46);diretorio.push(central);deslocamento+=cabecalho.length+dados.length;tamanhoDiretorio+=central.length;
 }
 const fim=new Uint8Array(22),vista=new DataView(fim.buffer);vista.setUint32(0,0x06054b50,true);vista.setUint16(8,diretorio.length,true);vista.setUint16(10,diretorio.length,true);vista.setUint32(12,tamanhoDiretorio,true);vista.setUint32(16,deslocamento,true);return new Blob([...partes,...diretorio,fim],{type:'application/zip'});
}
export function baixarZip(nome,arquivos){const url=URL.createObjectURL(criarZip(arquivos)),link=document.createElement('a');link.href=url;link.download=nome+'.zip';document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),3000);}
