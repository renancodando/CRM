const {chromium}=require('playwright');const assert=require('assert');const fs=require('fs');
const URL_=process.env.ORBITA_URL||'http://localhost:3111/';
const v2={versao:2,empresas:[{id:'a1',nome:'Alfa Cell',cidade:'Recife - PE',contato:'João',telefone:'81 99999-1111',etapa:'negociacao',valor:900,criada:'2026-01-02T10:00:00.000Z',historico:[{quando:'2026-01-02T10:00:00.000Z',texto:'Oportunidade cadastrada.'}],notas:'nota original',modelo:null,nicho:'celulares'},{id:'a2',nome:'Beta Odonto',cidade:'Natal - RN',etapa:'encontrada',valor:0,criada:'2026-02-02T10:00:00.000Z',historico:[],notas:''}],lembretes:[{id:'l1',titulo:'Ligar para Alfa',quando:'2026-12-05T10:00:00.000Z',empresa:'a1',concluido:false}],rascunhos:[{id:'r1',empresa:'a1',texto:'Olá João',quando:'2026-01-03T10:00:00.000Z'}],demonstracoes:[{id:'d1',empresaId:'a1',modeloId:'precision',criado:'2026-01-04T10:00:00.000Z',atualizado:'2026-01-04T10:00:00.000Z',status:'rascunho',exportacoes:0,urlPublica:'',configuracao:{modelo:'precision',nicho:'celulares',nome:'Alfa Cell',servicos:[{nome:'Tela',descricao:'x',preco:''}],perguntas:[],diferenciais:['Qualidade'],avaliacoes:[],links:[]}}],preferencias:{nome:'Renan',cargo:'Desenvolvedor',marca:'Minha Marca',movimento:true,qualidade:'equilibrada',contraste:false},notificacoesLidas:true};
const bruto=JSON.stringify(v2);let falhas=0;const ok=(c,m)=>{console.log((c?'✔ ':'✘ ')+m);if(!c)falhas++;};
const lerIDB=(p,loja,chave)=>p.evaluate(([l,c])=>new Promise((res,rej)=>{const r=indexedDB.open('orbita-dados');r.onsuccess=()=>{const g=r.result.transaction(l).objectStore(l).get(c);g.onsuccess=()=>res(g.result);g.onerror=()=>rej(g.error);};r.onerror=()=>rej(r.error);}),[loja,chave]);
const semear=(valor)=>`if(!localStorage.getItem('seed-feito')){localStorage.setItem('orbita-prospeccao-v2',${JSON.stringify(valor)});localStorage.setItem('seed-feito','1');}`;
(async()=>{
 const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
 // 1. migração de dados reais
 let ctx=await b.newContext({viewport:{width:1440,height:900}});await ctx.addInitScript(semear(bruto));let p=await ctx.newPage();const erros=[];p.on('pageerror',e=>erros.push(e.message));p.on('dialog',d=>d.accept());
 await p.goto(URL_);await p.waitForTimeout(1800);
 ok(await p.textContent('[data-total]')==='2','migração: as 2 empresas aparecem no painel inicial');
 ok(await p.textContent('[data-marca]')==='Minha Marca','migração: preferências (marca) preservadas');
 ok(await p.evaluate(()=>localStorage.getItem('orbita-prospeccao-v2'))===bruto,'chave antiga v2 permanece byte a byte idêntica');
 const leg=await lerIDB(p,'legado','orbita-prospeccao-v2');ok(leg?.texto===bruto,'cópia integral do texto original guardada no IndexedDB (legado)');
 const meta1=await lerIDB(p,'meta','migracao');ok(meta1?.status==='concluida'&&meta1.contagem.empresas===2&&meta1.contagem.demonstracoes===1,'meta de migração concluída com contagens corretas');
 // 2. edição persiste após recarregar; migração não repete
 await p.click('[data-secao=empresas]');await p.waitForTimeout(300);await p.click('.nome-empresa >> text=Alfa Cell');await p.waitForTimeout(400);
 await p.click('[data-aba-btn=historico]');await p.fill('[name=notas]','nota editada pelo teste');await p.click('#central-empresa [type=submit]');await p.waitForTimeout(700);
 await p.reload();await p.waitForTimeout(1800);
 await p.click('[data-secao=empresas]');await p.waitForTimeout(300);await p.click('.nome-empresa >> text=Alfa Cell');await p.waitForTimeout(400);await p.click('[data-aba-btn=historico]');
 ok(await p.inputValue('[name=notas]')==='nota editada pelo teste','edição persiste após recarregar a página');
 const meta2=await lerIDB(p,'meta','migracao');ok(meta2.concluidaEm===meta1.concluidaEm,'migração idempotente: não reexecutou após recarregar');
 // demonstração e rascunho preservados
 const col=await p.evaluate(()=>new Promise(res=>{const r=indexedDB.open('orbita-dados');r.onsuccess=()=>{const g=r.result.transaction('colecoes').objectStore('colecoes').getAll();g.onsuccess=()=>res(g.result.map(x=>Array.isArray(x)?x.length:null));};}));
 ok(JSON.stringify(col).includes('1'),'demonstração, lembrete e rascunho presentes no banco');
 // 3. falha de gravação → aviso para exportar backup
 await p.evaluate(()=>{const o=IDBObjectStore.prototype.put;IDBObjectStore.prototype.put=function(...a){if(this.name==='colecoes')throw new Error('falha simulada');return o.apply(this,a);};});
 await p.fill('[name=notas]','nova edição');await p.click('#central-empresa [type=submit]');await p.waitForTimeout(1200);
 ok(/backup/i.test(await p.textContent('#aviso')),'falha de gravação gera aviso para exportar backup');
 ok(erros.length===0,'sem erros de JavaScript no fluxo ('+erros.join('|')+')');
 // 4. backup → importação em um perfil novo
 await p.evaluate(()=>{});await ctx.close();
 ctx=await b.newContext({viewport:{width:1440,height:900},acceptDownloads:true});await ctx.addInitScript(semear(bruto));p=await ctx.newPage();p.on('dialog',d=>d.accept());await p.goto(URL_);await p.waitForTimeout(1800);
 await p.click('[data-secao=dados]');await p.waitForTimeout(600);
 const [dl]=await Promise.all([p.waitForEvent('download'),p.click('[data-m="dados.backup"]')]);const caminho='/tmp/orbita-backup-teste.json';await dl.saveAs(caminho);
 const conteudo=JSON.parse(fs.readFileSync(caminho,'utf8'));ok(conteudo.formato==='orbita-backup'&&conteudo.versao===3&&conteudo.dados.empresas.length===2&&!!conteudo.checksum,'backup v3 exportado com checksum e 2 empresas');
 // perfil limpo importa
 const c2=await b.newContext({viewport:{width:1440,height:900}});const q=await c2.newPage();q.on('dialog',d=>d.accept());await q.goto(URL_);await q.waitForTimeout(1500);
 ok(await q.textContent('[data-total]')==='0','perfil novo começa vazio');
 await q.click('[data-secao=dados]');await q.waitForTimeout(500);await q.click('[data-m="dados.aba"][data-id=importar]');await q.waitForTimeout(300);await q.setInputFiles('#arquivo-importar',caminho);await q.waitForTimeout(700);
 ok(/Novos/.test(await q.textContent('#previa-importacao')),'importação mostra prévia antes de aplicar');
 await q.click('#aplicar-importacao');await q.waitForTimeout(1200);
 ok(await q.textContent('[data-total]')==='2','importação aplicada: 2 empresas no perfil novo');
 await q.reload();await q.waitForTimeout(1500);ok(await q.textContent('[data-total]')==='2','dados importados persistem após recarregar');
 // 5. lixeira: excluir e restaurar pela interface
 await q.click('[data-secao=empresas]');await q.waitForTimeout(300);await q.click('.nome-empresa >> text=Beta Odonto');await q.waitForTimeout(400);await q.click('[data-m="empresa.excluir"]');await q.waitForTimeout(600);
 ok(await q.textContent('[data-total]')==='1','exclusão envia para a lixeira (1 empresa restante)');
 await q.keyboard.press('Escape');await q.waitForTimeout(300);await q.click('[data-secao=dados]');await q.waitForTimeout(400);await q.click('[data-m="dados.aba"][data-id=lixeira]');await q.waitForTimeout(300);await q.click('[data-m="dados.restaurar"]');await q.waitForTimeout(700);
 ok(await q.textContent('[data-total]')==='2','restauração da lixeira devolve a empresa');
 await c2.close();await ctx.close();
 // 6. v2 corrompido
 ctx=await b.newContext({viewport:{width:1440,height:900}});await ctx.addInitScript(semear('{quebrado'));p=await ctx.newPage();const e3=[];p.on('pageerror',e=>e3.push(e.message));await p.goto(URL_);await p.waitForTimeout(1800);
 ok(await p.textContent('[data-total]')==='0'&&e3.length===0,'v2 corrompido: o app abre sem erro');
 ok(await p.evaluate(()=>localStorage.getItem('orbita-prospeccao-v2'))==='{quebrado','v2 corrompido permanece intocado no localStorage');
 const leg2=await lerIDB(p,'legado','orbita-prospeccao-v2');ok(leg2?.texto==='{quebrado','texto corrompido preservado no banco para recuperação');
 await p.click('[data-secao=dados]');await p.waitForTimeout(500);ok(/ilegível/.test(await p.textContent('#conteudo-painel')),'aviso de dados antigos ilegíveis exibido');await ctx.close();
 // 7. sem IndexedDB
 ctx=await b.newContext({viewport:{width:1440,height:900}});await ctx.addInitScript(`Object.defineProperty(window,'indexedDB',{value:undefined});`+semear(bruto));p=await ctx.newPage();await p.goto(URL_);await p.waitForTimeout(1800);
 ok(await p.textContent('[data-total]')==='2','sem IndexedDB: dados do v2 ainda carregam (modo reserva)');
 await p.click('[data-secao=dados]');await p.waitForTimeout(500);ok(/Reserva local/.test(await p.textContent('#conteudo-painel')),'modo reserva sinalizado ao usuário');await ctx.close();
 // 8. movimento reduzido em perfil limpo
 ctx=await b.newContext({viewport:{width:1440,height:900},reducedMotion:'reduce'});p=await ctx.newPage();await p.goto(URL_);await p.waitForTimeout(1500);
 ok(await p.evaluate(()=>document.documentElement.classList.contains('movimento-pausado')),'movimento reduzido do sistema respeitado em perfil novo');await ctx.close();
 await b.close();console.log(falhas?falhas+' falhas':'armazenamento: todas as verificações passaram');process.exit(falhas?1:0);
})();
