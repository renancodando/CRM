const {chromium}=require('playwright');
const larguras=[320,375,390,430,768,1024,1440,1920];
(async()=>{
 const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});let falhas=0;
 const ctx=await b.newContext({viewport:{width:1440,height:900},reducedMotion:'reduce'});
 const erros=[];
 for(const l of larguras){
  const p=await ctx.newPage();await p.setViewportSize({width:l,height:l<500?844:900});p.on('pageerror',e=>erros.push(l+': '+e.message));p.on('dialog',d=>d.accept('x'));
  await p.goto('http://localhost:3111/');await p.waitForTimeout(1200);
  const semH=await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+2);
  const painel=async(nome,abrir)=>{await abrir();await p.waitForTimeout(450);const r=await p.evaluate(()=>{const d=document.querySelector('#painel');if(!d?.open)return {aberto:false};const el=d.querySelector('#conteudo-painel');const estouros=[...el.querySelectorAll('*')].filter(n=>{const r=n.getBoundingClientRect();return r.width>0&&r.right>d.getBoundingClientRect().right+2&&!n.closest('.area-tabela,.colunas-kanban,.estudio-tela,.estudio-dispositivos,.etapas-pipeline,iframe,.abas,.estudio-abas,.estudio-miniatura');}).slice(0,3).map(n=>n.tagName+'.'+(n.className||'').toString().slice(0,30));return {aberto:true,estouros,larguraPainel:d.getBoundingClientRect().width};});if(!r.aberto||r.estouros.length){falhas++;console.log('✘',l,nome,JSON.stringify(r));}await p.keyboard.press('Escape');await p.waitForTimeout(250);};
  if(!semH){falhas++;console.log('✘',l,'página principal com rolagem horizontal');}
  const abrirMenu=async()=>{if(l<=820){await p.click('.abrir-menu');await p.waitForTimeout(250);}};
  for(const sec of ['hoje','empresas','pipeline','mensagens','estudio','propostas','laboratorio','financeiro','dados','relatorios','quant','connect']){
   await painel(sec,async()=>{await abrirMenu();await p.click(`[data-secao=${sec}]`);});
  }
  // nova empresa e central
  await painel('nova-empresa',async()=>{await p.evaluate(()=>document.querySelector('.acao-orbital.prospectar').click());});
  console.log('· largura',l,'verificada');await p.close();
 }
 console.log(erros.length?'erros JS: '+JSON.stringify(erros.slice(0,3)):'sem erros JS');console.log(falhas?falhas+' falhas':'responsividade: nenhuma tela estoura a largura');await b.close();process.exit(falhas?1:0);
})();
