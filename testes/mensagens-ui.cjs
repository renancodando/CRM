/* Fluxo do sistema de mensagens na tela de Conversão, no navegador: selecionar empresa → mensagem recomendada → abrir WhatsApp → confirmar envio → registrar resposta → próxima mensagem. DADOS ARTIFICIAIS; nada é enviado (wa.me é interceptado). */
const {navClick}=require('./nav-helper.cjs');
const {chromium}=require('playwright');
const URL_=process.env.ORBITA_URL||'http://localhost:3111/';let falhas=0;const ok=(c,m)=>{console.log((c?'✔ ':'✘ ')+m);if(!c)falhas++;};
const agora=Date.now(),d=n=>new Date(agora-n*864e5).toISOString();
const emp=(i,x)=>({id:'e'+i,nome:'Empresa '+i,cidade:'Recife - PE',nicho:'celulares',etapa:'encontrada',valor:0,criada:d(30),historico:[],notas:'',contato:'',telefone:'',email:'',site:'',whatsapp:'8199999'+(1000+i),statusSite:'sem-site',servicosOferecidos:['troca de tela','bateria'],...x});
const seed={versao:2,preferencias:{nome:'Renan',cargo:'Dev',marca:'Órbita',movimento:false,qualidade:'equilibrada',contraste:false},lembretes:[],rascunhos:[],demonstracoes:[],eventos:[],propostas:[],pagamentos:[],custos:[],sessoes:[],tarefas:[],posVenda:[],experimentos:[],
 empresas:[emp(1,{nome:'ZAP CELL - Assistência Técnica de Celulares',notas:'nota 4.9 com 320 avaliações no Maps'}),emp(2,{nome:'Cell House',statusSite:'so-redes',instagram:'@cellhouse'}),emp(3,{nome:'Mundo do Celular',servicosOferecidos:[]})]};
(async()=>{
 const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
 const ctx=await b.newContext({viewport:{width:1440,height:900},reducedMotion:'reduce'});await ctx.addInitScript(`if(!localStorage.getItem('s')){localStorage.setItem('orbita-prospeccao-v2',${JSON.stringify(JSON.stringify(seed))});localStorage.setItem('s','1');}`);
 const abertos=[];await ctx.route('https://wa.me/**',r=>{abertos.push(r.request().url());r.fulfill({status:200,contentType:'text/html',body:'wa'});});await ctx.route('https://api.whatsapp.com/**',r=>{abertos.push(r.request().url());r.fulfill({status:200,contentType:'text/html',body:'wa'});});
 const p=await ctx.newPage();p.setDefaultTimeout(8000);const erros=[];p.on('pageerror',e=>erros.push('PAGE:'+e.message));p.on('console',m=>{if(m.type()==='error'&&!/404/.test(m.text()))erros.push('CONSOLE:'+m.text());});p.on('dialog',x=>x.accept('motivo'));
 const esp=ms=>p.waitForTimeout(ms),clicar=async s=>{await p.click(s);await esp(350);},txt=()=>p.textContent('#conteudo-painel');
 const estado=()=>p.evaluate(()=>new Promise(res=>{const r=indexedDB.open('orbita-dados');r.onsuccess=()=>{const t=r.result.transaction('colecoes').objectStore('colecoes');const g=t.getAll(),k=t.getAllKeys();g.onsuccess=()=>{k.onsuccess=()=>{const o={};k.result.forEach((c,i)=>o[c]=g.result[i]);res(o);};};};}));
 const abrirEmpresa=async id=>{await clicar('[data-m="conversao.aba"][data-id="conversa"]');await p.selectOption('#cv-emp',id);await esp(500);};
 await p.goto(URL_);await esp(2200);
 const menuAntes=await p.evaluate(async()=>{const m=await import('/nucleo/flow.js');return {areas:m.navegacao.length,botoes:new Set([...document.querySelectorAll('[data-secao]')].map(x=>x.dataset.secao)).size};});
 await navClick(p,'[data-secao=conversao]');await esp(600);
 const abas=await p.locator('[data-m="conversao.aba"]').count();ok(menuAntes.areas===10&&abas===10,'nenhum menu ou aba nova: 10 áreas no menu lateral e as mesmas 10 abas da Conversão ('+menuAntes.areas+'/'+abas+')');
 /* 1. mensagens diferentes para empresas diferentes */
 await abrirEmpresa('e1');const m1=await p.inputValue('#cv-texto');await abrirEmpresa('e2');const m2=await p.inputValue('#cv-texto');await abrirEmpresa('e3');const m3=await p.inputValue('#cv-texto');
 ok(/Zap Cell/.test(m1)&&/4,9/.test(m1)&&/320/.test(m1)&&!/ZAP CELL -/.test(m1),'empresa com reputação forte: mensagem usa a nota e o número de avaliações reais e o nome limpo');
 ok(/Cell House/.test(m2)&&/Instagram/.test(m2)&&!/avalia/.test(m2),'empresa só com Instagram: outra abertura e outra pergunta');
 ok(/Mundo do Celular/.test(m3)&&!/nota|avalia|Instagram/.test(m3),'empresa com poucos dados: nenhuma informação inventada');
 ok(new Set([m1.replace(/Zap Cell/g,''),m2.replace(/Cell House/g,''),m3.replace(/Mundo do Celular/g,'')]).size===3&&[m1,m2,m3].every(m=>!/R\$/.test(m)&&/site/.test(m)&&/Renan/.test(m)),'três textos diferentes, com intenção comercial clara e sem preço no primeiro contato');
 /* 2. alternativas, justificativa recolhível, seletor de situação e edição */
 await abrirEmpresa('e1');let t=await txt();
 ok(await p.locator('[data-m="conversao.alternativa"]').count()===3&&/Recomendada/.test(t)&&/Opção 2/.test(t)&&/Opção 3/.test(t),'recomendada + 2 alternativas');
 const just=p.locator('details.cv-justificativa');ok(await just.count()===1&&!(await just.evaluate(x=>x.open)),'justificativa estratégica existe e vem recolhida');
 await just.locator('summary').click();await esp(200);const jt=await just.textContent();ok(/Perfil da empresa/.test(jt)&&/Fatos da ficha/.test(jt)&&/Não sabemos/.test(jt)&&/Hipóteses/.test(jt)&&/Técnicas/.test(jt)&&/Limitações/.test(jt)&&/não garantem/.test(jt),'justificativa: perfil, fatos com origem, o que não se sabe, hipóteses, técnicas e limitações dos estudos');
 const opcoes=await p.locator('#cv-tipo option').count(),grupos=await p.locator('#cv-tipo optgroup').count();ok(grupos===3&&opcoes>=45,'seletor de situação existente ganhou a biblioteca (etapas, objeções e dúvidas) sem botão novo ('+opcoes+' opções)');
 const b1=await p.inputValue('#cv-texto');await clicar('[data-m="conversao.alternativa"][data-id="1"]');const b2=await p.inputValue('#cv-texto');await clicar('[data-m="conversao.regerar"]');const b3=await p.inputValue('#cv-texto');
 ok(b1!==b2&&b3!==b1&&b3.length>40,'alternativa e "Gerar outra sugestão" trocam a mensagem');
 await p.selectOption('#cv-tipo','bib:objecao:caro');await esp(400);ok(/Recomendada/.test(await txt())&&(await p.inputValue('#cv-texto')).length>30,'situação escolhida à mão (objeção "achou caro") traz respostas da biblioteca');
 await p.selectOption('#cv-tipo','auto');await esp(400);
 /* 3. WhatsApp aberto ≠ enviado */
 const sugerida=await p.inputValue('#cv-texto');const editada=sugerida+' Abraço!';await p.fill('#cv-texto',editada);await esp(200);
 await clicar('[data-m="conversao.whatsapp"]');await esp(700);let e=await estado();
 ok(abertos.length>=1&&decodeURIComponent(abertos.at(-1)).includes('Abraço!')&&/558199999/.test(abertos.at(-1)),'WhatsApp aberto com a mensagem editada preenchida e o número da empresa');
 ok(!(e.eventos||[]).some(x=>x.tipo==='mensagem-enviada')&&/Você enviou a mensagem\?/.test(await txt()),'abrir o WhatsApp não registra envio; o Órbita pergunta se foi enviado');
 await clicar('[data-m="conversao.confirmar-envio"]');await esp(600);e=await estado();const env=(e.eventos||[]).filter(x=>x.tipo==='mensagem-enviada');
 ok(env.length===1&&env[0].texto===editada&&/^pc-/.test(env[0].estrategia)&&env[0].tipoMsg==='primeiro-contato'&&env[0].variante&&env[0].confirmadoPeloUsuario===true,'envio registrado só após a confirmação, com texto exato, estratégia ('+env[0]?.estrategia+'), etapa e versão');
 ok(/Melhor ação agora: aguardar/.test(await txt()),'depois de enviar, o motor manda aguardar em vez de insistir');
 /* 4. resposta → interpretação → correção → próxima mensagem */
 await p.fill('#cv-resp [name=texto]','depende do valor');await clicar('#cv-resp [type=submit]');t=await txt();
 ok(/Intenção identificada: Perguntou o valor/.test(t)&&/confiança alta/.test(t)&&/Resposta recomendada/.test(t)&&/R\$ 800/.test(t)&&/R\$ 600/.test(t)&&/Ainda não viu a prévia/.test(t),'"depende do valor": intenção lida, preço respondido direto e contexto considerado (ainda não viu a prévia)');
 await p.fill('#cv-resp [name=texto]','hmm sei lá');await clicar('#cv-resp [type=submit]');t=await txt();ok(/leitura incerta/.test(t)&&await p.locator('#cv-intencao').count()===1,'resposta ambígua: o motor diz que a leitura é incerta e permite corrigir');
 await p.selectOption('#cv-intencao','momento');await esp(400);t=await txt();ok(/informada por você/.test(t)&&/Agora não \/ época complicada/.test(t)&&/Resposta recomendada/.test(t),'interpretação corrigida à mão muda as respostas sugeridas');
 await p.fill('#cv-resp [name=texto]','final de ano está complicado');await clicar('#cv-resp [type=submit]');await clicar('[data-m="conversao.usar-resposta"][data-id="0"]');const prox=await p.inputValue('#cv-texto');
 ok(prox.length>20&&!/desconto/i.test(prox)&&!/Sou o Renan/.test(prox),'"final de ano está complicado": resposta respeitosa vai para o compositor, sem desconto e sem se reapresentar');
 await clicar('#cv-resp [type=submit]');await clicar('[data-m="conversao.registrar-resposta"]');await esp(500);e=await estado();
 ok((e.eventos||[]).filter(x=>x.tipo==='resposta').length===1&&(e.eventos||[]).find(x=>x.tipo==='resposta').intencaoLida==='momento','resposta registrada no histórico com a intenção lida');
 const cont=await p.inputValue('#cv-texto');ok(cont.length>20&&!/Sou o Renan|Aqui é o Renan/.test(cont),'continuidade: a próxima mensagem responde à objeção, não recomeça a venda');
 await clicar('[data-m="conversao.whatsapp"]');await esp(500);await clicar('[data-m="conversao.confirmar-envio"]');await esp(600);e=await estado();const env2=(e.eventos||[]).filter(x=>x.tipo==='mensagem-enviada');
 ok(env2.length===2&&/^om-/.test(env2[1].estrategia)&&env2[1].tipoMsg==='objecao:momento','segunda mensagem registrada com a estratégia da objeção ('+env2[1]?.estrategia+')');
 /* 5. recusa */
 await abrirEmpresa('e2');await clicar('[data-m="conversao.whatsapp"]');await esp(400);await clicar('[data-m="conversao.confirmar-envio"]');await esp(500);
 await p.fill('#cv-resp [name=texto]','não tenho interesse');await clicar('#cv-resp [type=submit]');t=await txt();ok(/não insista/i.test(t)&&/Resposta de despedida/.test(t)&&!/Resposta recomendada/.test(t),'"não tenho interesse": só despedida, sem resposta de contorno');
 await clicar('[data-m="conversao.registrar-resposta"]');await esp(500);t=await txt();ok(/Envio bloqueado/.test(t)&&await p.locator('[data-m="conversao.whatsapp"]').isDisabled(),'recusa registrada: prospecção interrompida e envio bloqueado');
 /* 6. persistência e aprendizado */
 await p.reload();await esp(2200);await navClick(p,'[data-secao=conversao]');await esp(600);await abrirEmpresa('e1');t=await txt();ok(/Melhor ação agora: aguardar/.test(t)||(await p.inputValue('#cv-texto')).length>20,'após recarregar, a conversa continua do ponto em que parou');
 e=await estado();ok((e.eventos||[]).filter(x=>x.tipo==='mensagem-enviada').length===3&&(e.eventos||[]).filter(x=>x.tipo==='resposta').length===2,'histórico persistido no IndexedDB (3 envios confirmados, 2 respostas)');
 await clicar('[data-m="conversao.aba"][data-id="memoria"]');t=await txt();ok(/Resultado até a venda, por estratégia da primeira mensagem/.test(t)&&/associações observadas/.test(t)&&/não foram sorteadas/.test(t)&&/Recusas/.test(t)&&/evidência insuficiente/.test(t),'Memória: resultados por estratégia até a venda, com aviso de amostra insuficiente e de que associação não é causa');
 await clicar('[data-m="conversao.aba"][data-id="evidencias"]');t=await txt();ok(/Loewenstein/.test(t)&&/MacDonald/.test(t)&&/Hipótese a testar/.test(t),'Evidências: novos estudos cadastrados, psicologia reversa marcada como hipótese');
 await clicar('[data-m="conversao.aba"][data-id="lab"]');ok(await p.locator('#cv-exp [name=a] option').count()>=20,'Laboratório: mensagens da biblioteca disponíveis como variantes de experimento');
 /* 7. responsividade */
 for(const w of [320,375,768,1920]){await p.setViewportSize({width:w,height:800});await esp(250);await abrirEmpresa('e3');const lg=await p.evaluate(()=>document.documentElement.scrollWidth);ok(lg<=w+1,'sem rolagem horizontal em '+w+'px ('+lg+')');}
 ok(!erros.length,'sem erros de JavaScript'+(erros.length?': '+erros.slice(0,3).join(' | '):''));
 await b.close();console.log(falhas?falhas+' falhas':'todas aprovadas');process.exit(falhas?1:0);
})().catch(e=>{console.error(e);process.exit(1);});
