const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const {writeFileSync}=require('node:fs');
let AxeBuilder;try{AxeBuilder=require('@axe-core/playwright').default;}catch{}
(async()=>{
 const navegador=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||undefined,args:['--no-sandbox','--enable-unsafe-swiftshader','--use-angle=swiftshader']}),resultado={},erros=[];
 try{
  const contexto=await navegador.newContext({viewport:{width:1440,height:1000},reducedMotion:'reduce',hasTouch:true});
  await contexto.addInitScript(()=>{window.__ondasObservatorio=[];const nomes=new WeakMap(),gl=WebGL2RenderingContext.prototype,obter=gl.getUniformLocation,enviar=gl.uniform4fv;gl.getUniformLocation=function(p,n){const v=obter.call(this,p,n);if(v)nomes.set(v,n);return v;};gl.uniform4fv=function(l,v,...r){if(this.canvas.classList.contains('pr-tela-ambiente')&&nomes.get(l)?.startsWith('ondasInternas'))window.__ondasObservatorio=Array.from(v);return enviar.call(this,l,v,...r);};});
  const pagina=await contexto.newPage();pagina.on('pageerror',e=>erros.push(e.message));pagina.on('console',m=>{if(m.type()==='error')erros.push(m.text().slice(0,600));});
  await pagina.goto(process.env.ORBITA_URL||'http://localhost:3111');await pagina.waitForSelector('.pr-ambiente');
  assert.equal(await pagina.locator('[data-pr-pino]').count(),0);
  await pagina.locator('[data-pr-foco]').click();await pagina.locator('#nova-empresa [name="nome"]').fill('Empresa de teste do observatório');await pagina.locator('#nova-empresa [name="cidade"]').fill('Cidade de teste');await pagina.locator('#nova-empresa [type="submit"]').click();
  await pagina.waitForSelector('#central-empresa');await pagina.keyboard.press('Escape');await pagina.waitForFunction(()=>!document.querySelector('#painel').open);
  const pino=pagina.locator('[data-pr-pino]');await pino.waitFor();assert.equal(await pino.count(),1);const id=await pino.getAttribute('data-empresa');
  await pino.focus();assert.equal(await pino.locator('[role="tooltip"]').getAttribute('aria-hidden'),'false');assert.ok((await pino.getAttribute('aria-label')).includes('Empresa de teste do observatório'));
  await pagina.keyboard.press('Escape');assert.equal(await pino.locator('[role="tooltip"]').getAttribute('aria-hidden'),'true');
  await pagina.keyboard.press('Enter');await pagina.waitForSelector('#central-empresa');assert.equal(await pagina.locator('#titulo-painel').textContent(),'Empresa de teste do observatório');await pagina.keyboard.press('Escape');await pagina.waitForFunction(()=>!document.querySelector('#painel').open);
  await pino.click();await pagina.waitForSelector('#central-empresa');assert.equal(await pagina.locator('#central-empresa [name="nome"]').inputValue(),'Empresa de teste do observatório');await pagina.keyboard.press('Escape');await pagina.waitForFunction(()=>!document.querySelector('#painel').open);
  const caixa=await pino.boundingBox();await pagina.touchscreen.tap(caixa.x+caixa.width/2,caixa.y+caixa.height/2);await pagina.waitForSelector('#central-empresa');await pagina.keyboard.press('Escape');await pagina.waitForFunction(()=>!document.querySelector('#painel').open);
  resultado.empresa='Cadastro pela interface, marcador com a empresa real do estado, tooltip, Escape, Enter, clique e toque abrem a central existente.';console.log(resultado.empresa);
  await pagina.evaluate(async id=>{const {estadoInicial,normalizarEmpresa}=await import('/nucleo/esquema.js'),{montarVisaoGeral}=await import('/nucleo/flow.js'),{renderizarPainelProspeccao}=await import('/painel-prospeccao.js');const estado=estadoInicial();estado.empresas=Array.from({length:12},(_,i)=>normalizarEmpresa({id:i?'marcador-'+i:id,nome:i===8?'<img src=x onerror="window.__nomeExecutou=true">':'Empresa de teste '+i,cidade:'Cidade de teste',etapa:'encontrada'}));window.__canvasMarcadores=document.querySelector('.pr-tela-ambiente');window.__dadosMarcadores=estado;renderizarPainelProspeccao(document.querySelector('#painel-prospeccao'),estado,montarVisaoGeral(estado));},id);
  assert.equal(await pagina.locator('[data-pr-pino]').count(),9);assert.equal(await pagina.locator('.pr-pinos-acessiveis img').count(),0);assert.equal(await pagina.evaluate(()=>!!window.__nomeExecutou),false);
  for(const largura of [320,375,390,430,768,1024,1440,1920]){
   await pagina.setViewportSize({width:largura,height:1000});await pagina.mouse.move(0,0);await pagina.evaluate(()=>document.activeElement?.blur());await pagina.locator('.pr-diorama-cena').scrollIntoViewIfNeeded();await pagina.waitForTimeout(130);
   const fora=await pagina.evaluate(()=>[...document.querySelectorAll('[data-pr-pino]')].map(b=>{const r=b.getBoundingClientRect(),alvo=document.elementFromPoint(r.x+r.width/2,r.y+r.height/2);return{nome:b.getAttribute('aria-label'),visivel:r.width>=24&&r.height>=24&&r.left>=0&&r.right<=innerWidth&&alvo?.closest('[data-pr-pino]')===b};}).filter(p=>!p.visivel));
   assert.deepEqual(fora,[],largura+'px: todos os marcadores podem receber o toque');
  }
  resultado.telas='Nove marcadores sem sobreposição dos controles em 320, 375, 390, 430, 768, 1024, 1440 e 1920px.';console.log(resultado.telas);
  const primeiro=pagina.locator('[data-pr-pino]').first();await primeiro.focus();
  const auditoria=AxeBuilder?await new AxeBuilder({page:pagina}).include('.pr-ambiente').withTags(['wcag2a','wcag2aa','wcag21aa']).analyze():null;
  if(auditoria)assert.deepEqual(auditoria.violations.map(v=>({id:v.id,nos:v.nodes.map(n=>n.html)})),[]);resultado.acessibilidade=auditoria?'Nenhuma violação WCAG detectada.':'Auditoria automática não executada: axe não instalado.';
  await pagina.setViewportSize({width:1440,height:1000});await pagina.emulateMedia({reducedMotion:'no-preference'});await pagina.locator('#controle-movimento').click();await pagina.locator('.pr-diorama-cena').scrollIntoViewIfNeeded();
  await pagina.waitForFunction(()=>!document.querySelector('.pr-ambiente').classList.contains('pr-ambiente-dormindo'));
  const volume=await pagina.locator('.pr-diorama-volume').boundingBox(),antes=await pagina.evaluate(()=>JSON.stringify(window.__ondasObservatorio));
  await pagina.touchscreen.tap(volume.x+volume.width*.52,volume.y+volume.height*.55);await pagina.waitForFunction(a=>JSON.stringify(window.__ondasObservatorio)!==a,antes,{timeout:20000});
  assert.ok((await pagina.evaluate(()=>window.__ondasObservatorio)).some((v,i)=>i%4===3&&v>0));assert.equal(await pagina.locator('#painel').evaluate(p=>p.open),false);assert.equal(await pagina.evaluate(()=>window.__canvasMarcadores===document.querySelector('.pr-tela-ambiente')),true);
  resultado.agua='Toque no lago interno recebido pelo shader sem abrir painéis; instância gráfica preservada.';console.log(resultado.agua);
  await pagina.locator('#controle-movimento').click();await pagina.evaluate(()=>document.activeElement?.blur());await pagina.locator('.pr-ambiente').scrollIntoViewIfNeeded();
  if(process.env.ORBITA_CAPTURA)await pagina.locator('.pr-ambiente').screenshot({path:process.env.ORBITA_CAPTURA});
  assert.deepEqual(erros,[]);if(process.env.ORBITA_RELATORIO)writeFileSync(process.env.ORBITA_RELATORIO,JSON.stringify(resultado,null,2));console.log(JSON.stringify(resultado));
 }finally{await navegador.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
