/* Regressão da sessão filtrada: Playwright, sem envio real de WhatsApp. */
const assert=require('node:assert/strict');
const {chromium}=require('playwright');
const {navClick}=require('./nav-helper.cjs');
const url=process.env.ORBITA_URL||'http://localhost:3111/';
const agora=new Date().toISOString();
const emp=(id,nome,grupo)=>({id,nome:'Sessao '+nome,cidade:'Lavras - MG',nicho:'celulares',etapa:'encontrada',situacao:'ativa',criada:agora,valor:0,historico:[],notas:'',whatsapp:'3599999'+(1000+Number(id.slice(1))),statusSite:'sem-site',potencial:'Potencial 80/100 · Evidência 80/100 · Grupo '+grupo});
const seed={versao:2,preferencias:{nome:'Renan',cargo:'Dev',marca:'Órbita',movimento:false,qualidade:'equilibrada',contraste:false},empresas:[emp('e1','Alfa','A'),emp('e2','Beta','A'),emp('e3','Gama','A'),emp('e4','Delta','B')],eventos:[],lembretes:[],rascunhos:[],demonstracoes:[],propostas:[],pagamentos:[],custos:[],sessoes:[],tarefas:[],posVenda:[],experimentos:[]};
(async()=>{
 const browser=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
 try{
 const ctx=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'});
 await ctx.addInitScript(s=>{if(!localStorage.getItem('seed-sessao')){localStorage.setItem('orbita-prospeccao-v2',JSON.stringify(s));localStorage.setItem('seed-sessao','1');}window.open=()=>null;},seed);
 const p=await ctx.newPage();p.setDefaultTimeout(15000);p.on('dialog',d=>d.accept());
 const click=selector=>p.locator(selector).click();
 const ids=()=>p.locator('#lista-empresas .nome-empresa').evaluateAll(ns=>ns.map(n=>n.dataset.empresa));
 const filters=async group=>{assert.equal(await p.inputValue('#filtrar-etapa'),'encontrada');assert.equal(await p.inputValue('#filtrar-grupo'),group);assert.equal(await p.inputValue('#filtrar-situacao'),'ativa');assert.equal(await p.inputValue('#buscar-empresas'),'Sessao');};
 await p.goto(url);await p.waitForSelector('#navegacao button');
 await navClick(p,'[data-secao=empresas]');
 await p.selectOption('#filtrar-etapa','encontrada');await p.selectOption('#filtrar-grupo','A');await p.selectOption('#filtrar-situacao','ativa');await p.fill('#buscar-empresas','Sessao');
 const initial=await ids();assert.equal(initial.length,3);assert(!initial.includes('e4'));
 const first=initial[0],second=initial[1];
 await click('[data-m="conversao.abrir-conversa"][data-id="'+first+'"]');
 assert.equal(await p.inputValue('#cv-emp'),first);
 await click('[data-m="conversao.whatsapp"]');
 await p.waitForSelector('#cv-texto-enviado');
 await p.waitForFunction(()=>new Promise(resolve=>{const r=indexedDB.open('orbita-dados');r.onerror=()=>resolve(false);r.onsuccess=()=>{const db=r.result;const q=db.transaction('colecoes').objectStore('colecoes').get('rascunhos');q.onsuccess=()=>{db.close();resolve((q.result||[]).some(x=>x.estadoMensagem==='whatsapp-aberto'));};q.onerror=()=>{db.close();resolve(false);};};}));
 await p.reload();await p.waitForSelector('#cv-texto-enviado');
 assert.equal(await p.inputValue('#cv-emp'),first);
 await click('[data-m="conversao.confirmar-envio"]');
 await p.waitForSelector('[data-acao="proxima-prospeccao"]:not([disabled])');
 await click('[data-acao="proxima-prospeccao"]');
 assert.equal(await p.inputValue('#cv-emp'),second);
 await click('[data-acao="voltar-prospeccao"]');await p.waitForSelector('#lista-empresas');
 await filters('A');assert.deepEqual(await ids(),initial.slice(1));
 await p.selectOption('#filtrar-grupo','B');await click('.nome-empresa[data-empresa="e4"]');
 await p.waitForSelector('#central-empresa');
 await p.goBack();await p.waitForSelector('#lista-empresas');await filters('B');assert.deepEqual(await ids(),['e4']);
 await p.reload();await p.waitForSelector('#lista-empresas');await filters('B');
 await click('.nome-empresa[data-empresa="e4"]');await click('[data-acao="voltar-prospeccao"]');await p.waitForSelector('#lista-empresas');await filters('B');
 console.log('OK: filtros A/B, WhatsApp, confirmação, próxima empresa, seta, histórico e recarregamento.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
