const {chromium}=require('playwright');
let AxeBuilder;try{AxeBuilder=require('@axe-core/playwright').default;}catch{}
const assert=require('node:assert/strict');
const {writeFileSync}=require('node:fs');
(async()=>{
const b=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||undefined,args:['--no-sandbox','--enable-unsafe-swiftshader','--use-angle=swiftshader']});
const relatorio={};
try{
 const contexto=await b.newContext({viewport:{width:1440,height:1000},reducedMotion:'reduce',hasTouch:true});const p=await contexto.newPage(),erros=[];p.on('pageerror',e=>erros.push(e.message));p.on('console',m=>{if(m.type()==='error')erros.push(m.text().slice(0,500));});
 await p.addInitScript(()=>{
  window.__graficos={desenhos:0,ondas:[]};const nomes=new WeakMap(),gl=WebGL2RenderingContext.prototype;
  const localizar=gl.getUniformLocation;gl.getUniformLocation=function(programa,nome){const v=localizar.call(this,programa,nome);if(v)nomes.set(v,nome);return v;};
  const uniforme=gl.uniform4fv;gl.uniform4fv=function(local,valores,...resto){if(this.canvas.classList.contains('pr-tela-ambiente')&&nomes.get(local)?.startsWith('perturbacoes'))window.__graficos.ondas=Array.from(valores);return uniforme.call(this,local,valores,...resto);};
  for(const nome of ['drawArrays','drawElements','drawElementsInstanced']){const original=gl[nome];gl[nome]=function(...args){if(this.canvas.classList.contains('pr-tela-ambiente'))window.__graficos.desenhos++;return original.apply(this,args);};}
 });
 await p.goto(process.env.ORBITA_URL||'http://localhost:3111');await p.waitForSelector('.pr-ambiente');await p.evaluate(()=>window.scrollTo({top:750,behavior:'instant'}));await p.waitForSelector('.pr-com-webgl');await p.waitForTimeout(500);
 const a11y=AxeBuilder?await new AxeBuilder({page:p}).include('.pr-ambiente').withTags(['wcag2a','wcag2aa','wcag21aa']).analyze():{violations:[]};relatorio.acessibilidade=a11y.violations.map(v=>({id:v.id,descricao:v.help,nos:v.nodes.map(n=>({html:n.html.slice(0,250),erro:n.failureSummary}))}));if(AxeBuilder){assert.deepEqual(relatorio.acessibilidade,[]);console.log('WCAG: nenhuma violação na área nova.');}else relatorio.acessibilidade='Não executada: @axe-core/playwright não instalado.';
 for(const largura of [320,375,390,430,768,1024,1440,1920]){
  await p.setViewportSize({width:largura,height:1000});await p.waitForTimeout(90);
  const limites=await p.evaluate(()=>{const e=document.querySelector('.pr-ambiente'),r=e.getBoundingClientRect();return{pagina:document.documentElement.scrollWidth<=innerWidth+1,controles:[...e.querySelectorAll('button,input,select,summary')].every(n=>{const b=n.getBoundingClientRect();return !b.width||(b.left>=r.left-2&&b.right<=r.right+2);})};});
  assert.ok(limites.pagina&&limites.controles,largura+'px: controles dentro da tela');
 }
 await p.setViewportSize({width:1440,height:1000});await p.evaluate(()=>window.scrollTo({top:750,behavior:'instant'}));
 relatorio.responsividade='320, 375, 390, 430, 768, 1024, 1440 e 1920px';
 const estadoTeste=await p.evaluate(async()=>{
  const {estadoInicial,normalizarEmpresa}=await import('/nucleo/esquema.js'),{montarVisaoGeral}=await import('/nucleo/flow.js'),{renderizarPainelProspeccao}=await import('/painel-prospeccao.js');
  const e=estadoInicial();e.empresas.push(normalizarEmpresa({id:'empresa-teste',nome:'Empresa de teste visual',etapa:'negociacao',situacao:'ativa',whatsapp:'',interesse:'alto'}));
  const agora=new Date(),segunda=new Date(agora.getFullYear(),agora.getMonth(),agora.getDate()-((agora.getDay()+6)%7),10);
  for(let dia=0;dia<3;dia++)for(let i=0;i<dia+1;i++){const data=new Date(segunda);data.setDate(data.getDate()+dia);if(data<=agora)e.eventos.push({id:dia+'-'+i,tipo:'mensagem-enviada',empresaId:'empresa-teste',quando:data.toISOString()});}
  e.eventos.push({id:'resposta-teste',tipo:'resposta',empresaId:'empresa-teste',quando:new Date().toISOString()});
  e.eventos.push({id:'revertido',tipo:'mensagem-enviada',empresaId:'empresa-teste',quando:segunda.toISOString(),revertido:true});
  window.__canvasMantido=document.querySelector('.pr-tela-ambiente');renderizarPainelProspeccao(document.querySelector('#painel-prospeccao'),e,montarVisaoGeral(e));
  return {total:e.eventos.filter(e=>!e.revertido&&e.tipo==='mensagem-enviada').length,mes:agora.getMonth()};
 });
 assert.equal(Number(await p.locator('[data-pr-total-ritmo]').textContent()),estadoTeste.total);assert.equal(await p.evaluate(()=>window.__canvasMantido===document.querySelector('.pr-tela-ambiente')),true);assert.ok((await p.locator('[data-pr-foco-detalhe]').textContent()).includes('Empresa de teste'));assert.equal(await p.locator('.pr-movimentacao').count(),3);
 const d=await p.locator('.pr-curva').getAttribute('d');assert.ok(new Set(d.match(/[-\d.]+/g)).size>5);
 await p.locator('.pr-dias-ritmo button').nth(1).focus();assert.equal(await p.locator('.pr-tooltip strong').textContent(),'2 mensagens');
 await p.locator('.pr-periodo-ritmo select').selectOption('semana-anterior');assert.equal(await p.locator('[data-pr-total-ritmo]').textContent(),'0');await p.locator('.pr-periodo-ritmo select').selectOption('semana');
 relatorio.dados='Valores confirmados, evento revertido excluído, prioridade e histórico reais do estado recebido; canvas preservado.';
 await p.emulateMedia({reducedMotion:'no-preference'});await p.locator('#controle-movimento').click();await p.evaluate(()=>window.scrollTo({top:750,behavior:'instant'}));await p.waitForTimeout(400);
 const antes=await p.evaluate(()=>window.__graficos.desenhos);await p.waitForFunction(antes=>window.__graficos.desenhos>antes,antes,{timeout:15000});
 const r=await p.locator('.pr-ambiente').boundingBox();await p.mouse.move(r.x+r.width*.52,r.y+r.height*.975);await p.mouse.down();await p.mouse.up();await p.waitForTimeout(250);
 const ondas=await p.evaluate(()=>window.__graficos.ondas);assert.ok(ondas.some((v,i)=>i%4===3&&v>0),'perturbação enviada ao shader');const antesToque=await p.evaluate(()=>JSON.stringify(window.__graficos.ondas)),rt=await p.locator('.pr-ambiente').boundingBox();await p.touchscreen.tap(rt.x+rt.width*.4,rt.y+rt.height*.975);await p.waitForFunction(anterior=>JSON.stringify(window.__graficos.ondas)!==anterior,antesToque,{timeout:15000});relatorio.agua='Ondas enviadas aos uniformes WebGL por mouse, clique e toque.';
 await p.locator('#controle-movimento').click();await p.evaluate(()=>window.scrollTo({top:750,behavior:'instant'}));await p.waitForTimeout(200);const parado1=await p.evaluate(()=>window.__graficos.desenhos);await p.waitForTimeout(300);const parado2=await p.evaluate(()=>window.__graficos.desenhos);assert.equal(parado1,parado2,'pausa suspende GPU');
 await p.locator('#controle-movimento').click();await p.setViewportSize({width:1440,height:500});await p.evaluate(()=>window.scrollTo({top:0,behavior:'instant'}));await p.waitForTimeout(300);const fora1=await p.evaluate(()=>window.__graficos.desenhos);await p.waitForTimeout(300);const fora2=await p.evaluate(()=>window.__graficos.desenhos);assert.equal(fora1,fora2,'fora da tela suspende GPU');
 relatorio.desempenho='Renderiza em movimento; suspende chamadas WebGL na pausa e fora da tela.';assert.deepEqual(erros,[]);
 await p.setViewportSize({width:1440,height:1000});await p.emulateMedia({reducedMotion:'reduce'});await p.evaluate(()=>window.scrollTo({top:750,behavior:'instant'}));await p.waitForTimeout(150);if(process.env.ORBITA_CAPTURA)await p.locator('.pr-ambiente').screenshot({path:process.env.ORBITA_CAPTURA});
 if(process.env.ORBITA_RELATORIO)writeFileSync(process.env.ORBITA_RELATORIO,JSON.stringify(relatorio,null,2));console.log(JSON.stringify(relatorio));
}finally{await b.close();}

})().catch(erro=>{console.error(erro);process.exitCode=1;});
