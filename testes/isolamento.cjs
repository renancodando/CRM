const {chromium}=require('playwright');const http=require('http');const fs=require('fs');const path=require('path');const {execFileSync}=require('child_process');
const base=process.argv[2];const tipos={'.html':'text/html;charset=utf-8','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.json':'application/json','.xml':'application/xml','.txt':'text/plain','.md':'text/markdown','.toml':'text/plain'};
function servir(dir){return new Promise(ok=>{const s=http.createServer((rq,rs)=>{let f=path.join(dir,decodeURIComponent(rq.url.split('?')[0]));if(f.endsWith('/'))f+='index.html';if(!f.startsWith(dir)||!fs.existsSync(f)){rs.writeHead(404);rs.end('nao');return;}rs.writeHead(200,{'content-type':tipos[path.extname(f)]||'application/octet-stream'});rs.end(fs.readFileSync(f));}).listen(0,()=>ok(s));});}
(async()=>{
 const zips=fs.readdirSync(base).filter(f=>f.endsWith('.zip')).sort();let falhas=0;
 const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
 for(const z of zips){
  const nome=z.replace('.zip',''),dir=path.join(base,'x-'+nome);fs.rmSync(dir,{recursive:true,force:true});fs.mkdirSync(dir);
  execFileSync('python3',['-I','-c','import zipfile,sys;z=zipfile.ZipFile(sys.argv[1]);assert z.testzip() is None;z.extractall(sys.argv[2])',path.join(base,z),dir]);
  const srv=await servir(dir),porta=srv.address().port;
  for(const [rotulo,vp,webgl] of [['desktop',{width:1440,height:900},true],['celular',{width:390,height:844},true],['sem-webgl',{width:1024,height:800},false]]){
   const ctx=await b.newContext({viewport:vp});const p=await ctx.newPage();
   if(!webgl)await p.addInitScript(()=>{const o=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(t,...r){if(/webgl/.test(t))return null;return o.call(this,t,...r);};});
   const falhasReq=[],externas=[],erros=[];
   p.on('requestfailed',r=>falhasReq.push(r.url()));p.on('response',r=>{if(r.status()>=400)falhasReq.push(r.status()+' '+r.url());});
   p.on('request',r=>{const u=r.url();if(!u.startsWith('http://localhost:'+porta)&&!u.startsWith('data:')&&!u.startsWith('blob:'))externas.push(u);});
   p.on('pageerror',e=>erros.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!(!webgl&&/Error creating WebGL context/.test(m.text())))erros.push(m.text());});
   await p.goto('http://localhost:'+porta+'/');await p.waitForTimeout(1800);
   for(let y=0;y<4000;y+=700){await p.mouse.wheel(0,700);await p.waitForTimeout(120);}await p.evaluate(()=>scrollTo(0,0));await p.waitForTimeout(500);
   const info=await p.evaluate(()=>({canvas:document.querySelectorAll('canvas').length,h1:!!document.querySelector('h1'),largura:document.documentElement.scrollWidth,vw:innerWidth,ids:[...document.querySelectorAll('a[href^="#"]')].filter(a=>a.getAttribute('href').length>1&&!document.getElementById(a.getAttribute('href').slice(1))).length}));
   const shot=await p.screenshot();
   const erroLocal=[];
   if(falhasReq.length)erroLocal.push('requisições falhas: '+falhasReq.slice(0,3));if(externas.length)erroLocal.push('requisições externas: '+externas.slice(0,3));if(erros.length)erroLocal.push('erros JS: '+erros.slice(0,2));
   if(!info.h1)erroLocal.push('sem h1');if(info.ids)erroLocal.push(info.ids+' âncoras quebradas');if(info.largura>info.vw+2)erroLocal.push('rolagem horizontal '+info.largura+'>'+info.vw);
   if(rotulo==='desktop'&&!/sem3d/.test(nome)&&!info.canvas)erroLocal.push('cena 3D ausente');
   if(shot.length<30000)erroLocal.push('captura quase vazia ('+shot.length+')');
   if(erroLocal.length){falhas++;console.log('✘',nome,rotulo,erroLocal.join(' | '));}else console.log('✔',nome,rotulo,'canvas='+info.canvas);
   await ctx.close();
  }
  srv.close();
 }
 await b.close();console.log(falhas?falhas+' falhas':'isolamento: todos os pacotes funcionam sozinhos');process.exit(falhas?1:0);
})();
