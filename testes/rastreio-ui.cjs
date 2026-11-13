/* Snippet REAL no navegador → Worker REAL (R2 simulado em memória) → agregação REAL. O coletor/Cloudflare são simulados por interceptação de rede; nada aqui é validado em produção. */
const {chromium}=require('playwright');const crypto=require('crypto');
let falhas=0;const ok=(c,m)=>{console.log((c?'✔ ':'✘ ')+m);if(!c)falhas++;};
const SEG='segredo-de-teste',TOK='token-leitura-teste',D1='demoumabcdef0001',D2='demodoisabcdef002';
const UA='Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36';
const chave=d=>crypto.createHmac('sha256',SEG).update(d).digest('hex').slice(0,24);
function r2(){const m=new Map();return {m,async put(k,v){m.set(k,v);},async get(k){return m.has(k)?{text:async()=>m.get(k)}:null;},async list({prefix}){return {objects:[...m.keys()].filter(k=>k.startsWith(prefix)).sort().map(key=>({key})),truncated:false};},async delete(k){for(const x of [].concat(k))m.delete(x);}};}
(async()=>{
 const {criarWorker}=await import('../rastreio/worker.js'),{gerarSnippet}=await import('../nucleo/rastreio/snippet.js'),{agregar}=await import('../nucleo/rastreio/agregar.js');
 const {estadoInicial,normalizarEmpresa}=await import('../nucleo/esquema.js'),{sugestoesDemonstracao}=await import('../nucleo/rastreio/regras.js');
 const env={DADOS:r2(),SEGREDO:SEG,TOKEN_LEITURA:TOK,RETENCAO_DIAS:'90'},worker=criarWorker();let posts=0;
 const html=(demo,modo)=>`<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Demo</title></head><body><main><section id="hero" style="height:700px">Hero</section><section id="servicos" style="height:700px">Serviços <a id="serv" href="#">Troca de tela</a></section><section id="faq" style="height:700px"><details><summary id="sumario">Prazo?</summary>3 dias</details></section><section id="contato" style="height:700px"><a id="wa" href="https://wa.me/5581999991111">WhatsApp</a></section></main><script>${gerarSnippet({url:'https://coletor.test',demo,chave:chave(demo),modo})}</script><script>document.addEventListener('click',function(e){if(e.target.closest&&e.target.closest('#wa,#serv'))e.preventDefault();});</script></body></html>`;
 const b=await chromium.launch();
 async function novo({webdriver=false}={}){const ctx=await b.newContext({viewport:{width:390,height:800},userAgent:UA});if(!webdriver===true)await ctx.addInitScript(()=>{Object.defineProperty(navigator,'webdriver',{get:()=>false});});
  await ctx.route('https://coletor.test/**',async route=>{const rq=route.request();if(rq.method()==='POST')posts++;const r=await worker.fetch(new Request(rq.url(),{method:rq.method(),body:rq.method()==='POST'?rq.postData():undefined,headers:{'user-agent':UA,'cf-connecting-ip':'9.9.9.'+(posts%250)}}),env);const h={};r.headers.forEach((v,k)=>h[k]=v);route.fulfill({status:r.status,headers:h,body:await r.text()});});
  await ctx.route('https://demo.test/**',route=>{const u=new URL(route.request().url());const demo=u.pathname.includes('d2')?D2:D1,modo=u.searchParams.get('modo')||'agregado';route.fulfill({status:200,contentType:'text/html',body:html(demo,modo)});});
  const p=await ctx.newPage();p.setDefaultTimeout(6000);p.erros=[];p.on('pageerror',e=>p.erros.push(e.message));return {ctx,p};}
 const flush=async p=>{await p.evaluate(()=>window.dispatchEvent(new Event('pagehide')));await p.waitForTimeout(350);};
 const ler=async(d)=>{const r=await worker.fetch(new Request('https://coletor.test/r?d='+d,{headers:{authorization:'Bearer '+TOK}}),env);return agregar((await r.json()).eventos);};
 const limpar=()=>{env.DADOS.m.clear();posts=0;};
 /* A) modo agregado, aceitar SEM recarregar e SEM flush prévio */
 limpar();let {ctx,p}=await novo();await p.goto('https://demo.test/d1?modo=agregado');await p.waitForTimeout(400);
 ok(posts===0,'agregado: nada é enviado antes de qualquer envio/aceite (a visualização espera na fila)');
 await p.click('#orb-s');await p.waitForTimeout(500);let a=await ler(D1);
 ok(a.visualizacoes===1&&a.sessoesEstimadas===1&&a.visualizacoesSemSessao===0,`aceite sem recarregar: 1 visualização contabilizada, 1 sessão, 0 sem sessão (${a.visualizacoes}/${a.sessoesEstimadas}/${a.visualizacoesSemSessao})`);
 await ctx.close();
 /* B) agregado: visualização anônima JÁ enviada, depois aceite; depois revogar/aceitar várias vezes */
 limpar();({ctx,p}=await novo());await p.goto('https://demo.test/d1?modo=agregado');await p.waitForTimeout(300);await flush(p);a=await ler(D1);
 ok(a.visualizacoes===1&&a.visualizacoesSemSessao===1&&a.sessoesEstimadas===0,'agregado: visualização anônima já contada (sem sessão)');
 await p.click('#orb-s');await p.waitForTimeout(500);a=await ler(D1);
 ok(a.visualizacoes===1&&a.visualizacoesSemSessao===0&&a.sessoesEstimadas===1,`após o aceite a MESMA visualização é ligada à sessão, sem duplicar (${a.visualizacoes} view / ${a.sessoesEstimadas} sessão)`);
 let antes=posts;await p.evaluate(()=>window.orbitaAcompanhamento.revogar());await p.click('#wa');await flush(p);a=await ler(D1);
 ok(a.conversoesObservadas.whatsapp===0&&posts===antes,'revogado: clique no WhatsApp NÃO é enviado e nada trafega');
 await p.evaluate(()=>window.orbitaAcompanhamento.reabrir());await p.waitForTimeout(200);await p.click('#orb-s');await p.waitForTimeout(400);await p.click('#wa');await flush(p);a=await ler(D1);
 ok(a.visualizacoes===1,`várias alterações de consentimento não duplicam a visualização (${a.visualizacoes})`);ok(a.conversoesObservadas.whatsapp===1,'após reaceitar, o clique no WhatsApp é registrado');
 ok(!(await p.evaluate(()=>document.cookie)),'sem cookies');await ctx.close();
 /* C) modo consentimento estrito */
 limpar();({ctx,p}=await novo());await p.goto('https://demo.test/d1?modo=consentimento');await p.waitForTimeout(300);await flush(p);
 ok(posts===0,'consentimento estrito: nada é enviado sem aceite (nem a visualização)');
 await p.click('#orb-s');await p.waitForTimeout(500);a=await ler(D1);ok(a.visualizacoes===1&&a.sessoesEstimadas===1,'aceite sem recarregar: a visita é contabilizada na hora');
 await p.click('#orb-s').catch(()=>{});await ctx.close();
 /* D) recusa: nada, em ambos os modos, nem após recarregar */
 for(const modo of ['agregado','consentimento']){limpar();({ctx,p}=await novo());await p.goto('https://demo.test/d1?modo='+modo);await p.waitForTimeout(300);await p.click('#orb-n');await p.click('#wa');await flush(p);
  ok(posts===0&&env.DADOS.m.size===0,`recusa (${modo}): nada é enviado nem a visualização anônima ainda não enviada`);
  await p.reload();await p.waitForTimeout(300);await p.click('#wa');await flush(p);ok(posts===0&&await p.locator('#orb-ac').count()===0,`recusa (${modo}): lembrada após recarregar, sem faixa e sem eventos`);await ctx.close();}
 /* E) funil completo, sessão, seções, WhatsApp */
 limpar();({ctx,p}=await novo());await p.goto('https://demo.test/d1?modo=agregado');await p.waitForTimeout(300);await p.click('#orb-s');await p.waitForTimeout(300);
 for(const s of ['#servicos','#faq','#contato'])await p.evaluate(x=>document.querySelector(x).scrollIntoView(),s).then(()=>p.waitForTimeout(400));
 await p.evaluate(()=>document.querySelector('#servicos').scrollIntoView());await p.waitForTimeout(250);await p.click('#serv');await p.evaluate(()=>document.querySelector('#faq').scrollIntoView());await p.waitForTimeout(250);await p.click('#sumario');await p.evaluate(()=>document.querySelector('#contato').scrollIntoView());await p.waitForTimeout(250);await p.click('#wa');await flush(p);a=await ler(D1);
 ok(a.sessoesEstimadas===1&&a.visualizacoes===1,'funil: 1 sessão, 1 visualização');ok(['hero','servicos','faq','contato'].every(k=>k in a.secoes)&&!('wa' in a.secoes)&&!('sumario' in a.secoes),'funil: só seções reais vistas ('+Object.keys(a.secoes).join(',')+')');ok(a.interacoes.servico>=1&&a.interacoes.faq>=1,'funil: cliques em serviço e FAQ');
 ok(a.conversoesObservadas.whatsapp===1&&a.conversoesObservadas.sessoesComContato===1,'funil: clique no WhatsApp contabilizado como conversão observada');ok(JSON.stringify(a.funil.map(x=>x[1]))==='[1,1,1,1]','funil de interação: sessão → 3+ seções → interagiu → contato ('+JSON.stringify(a.funil.map(x=>x[1]))+')');ok(a.dispositivos.celular>=1,'dispositivo em categoria ampla (celular)');
 const e1=await ctx.cookies();ok(e1.length===0,'nenhum cookie criado');
 /* F) identificação das demonstrações acessadas e chave forjada */
 const p2=await ctx.newPage();await p2.goto('https://demo.test/d2?modo=agregado');await p2.waitForTimeout(300);ok(await p2.locator('#orb-ac').count()===0,'consentimento já concedido é lembrado (sem nova faixa)');await flush(p2);
 const a1=await ler(D1),a2=await ler(D2);ok(a1.visualizacoes===1&&a2.visualizacoes===1,'cada demonstração recebe só as próprias visualizações');
 const forjado=await p2.evaluate(async d=>{const r=await fetch('https://coletor.test/e',{method:'POST',body:JSON.stringify({d,k:'0'.repeat(24),s:null,e:[{i:'forjado001',t:'pagina',ts:Date.now()}]}),headers:{'content-type':'text/plain'}});return r.status;},D2);
 ok(forjado===403&&(await ler(D2)).visualizacoes===1,'evento com chave forjada é recusado (403) e não altera os números');
 /* G) regras comerciais recebem os dados (demonstração acessada + clique no contato) */
 const est=estadoInicial(),emp=normalizarEmpresa({id:'e1',nome:'Smart Tech',cidade:'Lavras - MG',whatsapp:'35999991111'});est.empresas.push(emp);const sug=sugestoesDemonstracao(est,emp,{id:'p1',demonstracaoId:'d1',estado:'publicada',modeloId:'blue'},a1,{agora:Date.now()});
 ok(sug.some(s=>s.id==='clique-contato')&&sug.some(s=>s.id==='nao-apresentada'),'regras comerciais recebem o clique no contato e a demonstração ainda não apresentada');
 await ctx.close();
 /* H) robô/automação é ignorado */
 limpar();({ctx,p}=await novo({webdriver:true}));await p.goto('https://demo.test/d1?modo=agregado');await p.waitForTimeout(300);ok(await p.locator('#orb-ac').count()===0,'automação (navigator.webdriver): sem faixa');await flush(p);ok(posts===0,'automação: nenhum evento enviado');await ctx.close();
 await b.close();console.log(falhas?falhas+' falhas':'todas aprovadas');process.exit(falhas?1:0);
})().catch(e=>{console.error(e);process.exit(1);});
