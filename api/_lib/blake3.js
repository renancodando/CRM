/* BLAKE3 (modo hash, 32 bytes) em JavaScript puro, sem dependências. Usado só no servidor para calcular os hashes de assets do Cloudflare Pages. */
'use strict';
const IV=[0x6A09E667,0xBB67AE85,0x3C6EF372,0xA54FF53A,0x510E527F,0x9B05688C,0x1F83D9AB,0x5BE0CD19];
const PERM=[2,6,3,10,7,0,4,13,1,11,12,5,9,14,15,8];
const CHUNK_START=1,CHUNK_END=2,PARENT=4,ROOT=8,CHUNK=1024;
const rotr=(x,n)=>((x>>>n)|(x<<(32-n)))>>>0;
function g(s,a,b,c,d,mx,my){s[a]=(s[a]+s[b]+mx)>>>0;s[d]=rotr(s[d]^s[a],16);s[c]=(s[c]+s[d])>>>0;s[b]=rotr(s[b]^s[c],12);s[a]=(s[a]+s[b]+my)>>>0;s[d]=rotr(s[d]^s[a],8);s[c]=(s[c]+s[d])>>>0;s[b]=rotr(s[b]^s[c],7);}
function comprimir(cv,bloco,contador,tam,flags){
 const s=[...cv,IV[0],IV[1],IV[2],IV[3],contador>>>0,Math.floor(contador/4294967296)>>>0,tam,flags];let m=bloco.slice();
 for(let r=0;r<7;r++){
  g(s,0,4,8,12,m[0],m[1]);g(s,1,5,9,13,m[2],m[3]);g(s,2,6,10,14,m[4],m[5]);g(s,3,7,11,15,m[6],m[7]);
  g(s,0,5,10,15,m[8],m[9]);g(s,1,6,11,12,m[10],m[11]);g(s,2,7,8,13,m[12],m[13]);g(s,3,4,9,14,m[14],m[15]);
  if(r<6)m=PERM.map(i=>m[i]);
 }
 return Array.from({length:8},(_,i)=>(s[i]^s[i+8])>>>0);
}
function palavras(bytes,ini,fim){const w=new Array(16).fill(0);for(let i=ini;i<fim;i++){const k=i-ini;w[k>>2]|=bytes[i]<<(8*(k&3));}return w.map(x=>x>>>0);}
function cvDoChunk(bytes,ini,fim,indice,raiz){
 let cv=IV.slice();const tam=fim-ini,blocos=Math.max(1,Math.ceil(tam/64));
 for(let b=0;b<blocos;b++){const bi=ini+b*64,bf=Math.min(fim,bi+64),ultimo=b===blocos-1;let f=(b===0?CHUNK_START:0)|(ultimo?CHUNK_END:0);if(ultimo&&raiz)f|=ROOT;cv=comprimir(cv,palavras(bytes,bi,bf),indice,bf-bi,f);}
 return cv;
}
const pai=(e,d,raiz)=>comprimir(IV,[...e,...d],0,64,PARENT|(raiz?ROOT:0));
function hex(cv){let o='';for(const w of cv)for(let i=0;i<4;i++)o+=((w>>>(8*i))&255).toString(16).padStart(2,'0');return o;}
function blake3Hex(entrada){
 const bytes=typeof entrada==='string'?Buffer.from(entrada,'utf8'):entrada,n=bytes.length;
 if(n<=CHUNK)return hex(cvDoChunk(bytes,0,n,0,true));
 const total=Math.ceil(n/CHUNK),pilha=[];
 for(let c=0;c<total-1;c++){let cv=cvDoChunk(bytes,c*CHUNK,(c+1)*CHUNK,c,false),t=c+1;while((t&1)===0){cv=pai(pilha.pop(),cv,false);t>>=1;}pilha.push(cv);}
 let cv=cvDoChunk(bytes,(total-1)*CHUNK,n,total-1,false);
 while(pilha.length){const esq=pilha.pop();cv=pai(esq,cv,pilha.length===0);if(pilha.length===0)return hex(cv);}
 return hex(cv);
}
module.exports={blake3Hex};
