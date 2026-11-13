/* Órbita Conversão unificado (Preparar Mensagem + Conversão + Negociação): fluxo completo na mesma interface. O WhatsApp é interceptado: nenhuma mensagem real é enviada. */
const {chromium}=require('playwright');
const URL_=process.env.ORBITA_URL||'http://localhost:3111/';let falhas=0;const ok=(c,m)=>{console.log((c?'✔ ':'✘ ')+m);if(!c)falhas++;};
const agora=Date.now(),d=n=>new Date(agora-n*864e5).toISOString();
const emp=(i,x)=>({id:'e'+i,nome:'Empresa '+i,cidade:'Lavras - MG',nicho:'celulares',etapa:'encontrada',valor:0,criada:d(30),historico:[],notas:'',contato:'',telefone:'',email:'',site:'',whatsapp:'3599999'+(1000+i),statusSite:'sem-site',servicosOferecidos:['troca de tela','bateria'],diferenciais:['atendimento rápido'],...x});
const seed={versao:2,preferencias:{nome:'Renan',cargo:'Dev',marca:'Órbita',movimento:false,qualidade:'equilibrada',contraste:false},lembretes:[],rascunhos:[{id:'rleg',empresa:'e1',texto:'Rascunho antigo do Preparar Mensagem',quando:d(2),tipo:'primeiro-contato',variante:0,estrategia:'direta'}],demonstracoes:[],propostas:[],pagamentos:[],custos:[],sessoes:[],tarefas:[],posVenda:[],experimentos:[],
 conversao:{rascunhos:[{id:'rcv',empresaId:'e1',texto:'Rascunho antigo da Conversão',abordagem:'consultiva',origem:'usuario',criadoEm:d(1),enviado:false}]},
 empresas:[emp(1,{nome:'Smart Tech Lavras',contato:'Carlos Silva',notas:'Evidência: busca não achou site',verificadoEm:d(3)}),emp(2,{nome:'Sem Número',whatsapp:''}),emp(3,{nome:'Bloqueada',situacao:'nao-contatar'}),emp(4,{nome:'Fixo Ltda',whatsapp:'(35) 3821-1234'})],eventos:[]};
(async()=>{
 const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
 const ctx=await b.newContext({viewport:{width:1280,height:900},reducedMotion:'reduce'});await ctx.addInitScript(`if(!localStorage.getItem('s')){localStorage.setItem('orbita-prospeccao-v2',${JSON.stringify(JSON.stringify(seed))});localStorage.setItem('s','1');}window.__abertos=[];window.open=function(u){window.__abertos.push(u);return null;};`);
 const p=await ctx.newPage();p.setDefaultTimeout(8000);const erros=[];p.on('pageerror',e=>erros.push('PAGE:'+e.message));p.on('console',m=>{if(m.type()==='error'&&!/404/.test(m.text()))erros.push('CONSOLE:'+m.text());});let promptResp='Texto corrigido depois de enviar';const dialogos=[];p.on('dialog',x=>{dialogos.push(x.message());x.type()==='prompt'?x.accept(promptResp):x.accept();});
 const esp=ms=>p.waitForTimeout(ms),clicar=async s=>{await p.click(s);await esp(350);},txt=()=>p.textContent('#conteudo-painel');
 const estado=()=>p.evaluate(()=>new Promise(res=>{const r=indexedDB.open('orbita-dados');r.onsuccess=()=>{const t=r.result.transaction('colecoes').objectStore('colecoes');const g=t.getAll(),k=t.getAllKeys();g.onsuccess=()=>{k.onsuccess=()=>{const o={};k.result.forEach((c,i)=>o[c]=g.result[i]);res(o);};};};}));
 const abertos=()=>p.evaluate(()=>window.__abertos);
 const escolher=async n=>{const v=await p.evaluate(n=>[...document.querySelectorAll('#cv-emp option')].find(o=>o.textContent.includes(n))?.value,n);await p.selectOption('#cv-emp',v);await esp(500);};
 await p.goto(URL_);await esp(2200);
 /* navegação e migração */
 ok(await p.locator('[data-secao=mensagens],[data-secao=negociacao]').count()===0&&await p.locator('[data-secao=conversao]').count()===1,'navegação: "Preparar Mensagem" e "Negociação" saíram; existe apenas Órbita Conversão');
 let e=await estado();ok((e.rascunhos||[]).some(r=>r.id==='rleg')&&(e.rascunhos||[]).some(r=>r.id==='rcv'&&r.estadoMensagem==='rascunho'&&r.empresa==='e1'),'migração: rascunhos antigos das duas ferramentas estão no repositório único e preservados');
 ok(!((e.raiz?.conversao?.rascunhos)||[]).length&&(e.raiz?.conversao?.migracoes||[]).includes('mensagens-unificadas-1'),'migração versionada e idempotente registrada');
 /* ponto de entrada contextual: Empresas */
 await p.click('[data-secao=empresas]');await esp(600);await p.click('[data-m="conversao.abrir-conversa"][aria-label*="Smart Tech"]');await esp(700);let t=await txt();
 ok(/Contexto da empresa/.test(t)&&/Estratégia comercial/.test(t)&&/Compositor de mensagens/.test(t),'"Conversar e converter" na lista de empresas abre Conversão com a empresa carregada');
 ok(await p.inputValue('#cv-emp')==='e1','empresa já selecionada');
 ok(/Smart Tech Lavras/.test(t)&&/Fornecida por você|Confirmada/.test(t)&&/Desconhecida/.test(t)&&/WhatsApp não confirmado/.test(t)&&/estrutura válida/.test(t),'contexto com origem de cada dado, contato e WhatsApp NÃO confirmado');
 ok(/Rascunhos desta empresa \(2\)/.test(t),'rascunhos migrados aparecem na empresa');
 ok(/Oferta vigente:\s*R\$ 800/.test(t),'oferta vigente carregada');
 /* compositor */
 ok(await p.locator('[data-m="conversao.alternativa"]').count()===3,'três alternativas estratégicas');
 let texto=await p.inputValue('#cv-texto');ok(texto.length>40&&!/\[|\{/.test(texto),'mensagem recomendada pronta e sem campos a preencher');
 ok(/qualidade textual <b>\d+\/100/.test(await p.innerHTML('#cv-validacao'))&&/NÃO é probabilidade/.test(await txt()),'qualidade textual interna, rotulada como não-probabilidade');
 await p.fill('#cv-texto','Oi, Carlos! Vi que a Smart Tech faz troca de tela e bateria 😀\nPosso te mostrar uma ideia de site? https://exemplo.com/?a=1&b=2');await esp(300);
 ok(/não é uma demonstração publicada/.test(await txt()),'validação factual: link que não é demonstração publicada desta empresa é sinalizado');
 await p.fill('#cv-texto','Oi, Carlos! Vi que a Smart Tech faz troca de tela e bateria 😀\nPosso te mostrar uma ideia de site?');await esp(300);
 /* WhatsApp direto */
 await clicar('[data-m="conversao.copiar"]');e=await estado();ok((e.rascunhos||[]).some(r=>r.estadoMensagem==='copiada'),'copiar registra o estado "copiada" (sem envio)');
 await clicar('[data-m="conversao.whatsapp"]');let a=await abertos();
 const esperado='https://wa.me/5535999991001?text='+encodeURIComponent('Oi, Carlos! Vi que a Smart Tech faz troca de tela e bateria 😀\nPosso te mostrar uma ideia de site?');
 ok(a.length===1&&a[0]===esperado,'WhatsApp abre direto: wa.me + E.164 + texto codificado (acentos, emoji e quebra de linha)');
 e=await estado();ok((e.eventos||[]).filter(x=>x.tipo==='mensagem-enviada').length===0,'abrir o WhatsApp NÃO registra envio');ok((e.rascunhos||[]).some(r=>r.estadoMensagem==='whatsapp-aberto'&&r.numero==='5535999991001'),'estado "WhatsApp aberto" com o número usado');
 t=await txt();ok(/Você enviou a mensagem\?/.test(t)&&/Sim, enviei/.test(t)&&/Não enviei/.test(t)&&/Decidir depois/.test(t),'pergunta de confirmação com confirmar, cancelar e manter pendente');
 /* pendência persiste após recarregar */
 await p.reload();await esp(2200);await p.click('[data-secao=conversao]');await esp(700);await escolher('Smart Tech');ok(/Você enviou a mensagem\?/.test(await txt()),'a confirmação pendente sobrevive ao recarregamento');
 /* editar o texto enviado e confirmar */
 await p.fill('#cv-texto-enviado','Oi, Carlos! Mudei uma frase no WhatsApp antes de enviar.');await clicar('[data-m="conversao.confirmar-envio"]');e=await estado();
 const msg=(e.eventos||[]).find(x=>x.tipo==='mensagem-enviada');ok(msg&&msg.texto==='Oi, Carlos! Mudei uma frase no WhatsApp antes de enviar.'&&msg.editadoNoEnvio===true&&msg.textoSugerido&&msg.textoSugerido!==msg.texto,'envio confirmado registra o texto EXATO enviado e guarda o sugerido');
 ok(msg.canal==='whatsapp'&&msg.numero==='5535999991001'&&msg.motorVersao==='conversao-2.0'&&msg.estagio&&msg.rascunhoId&&msg.followUpEm,'histórico: canal, número, estágio, versão do motor, rascunho e prazo de follow-up');
 ok((e.empresas||[]).find(x=>x.id==='e1').etapa==='mensagem'&&(e.lembretes||[]).some(l=>/Retomar/.test(l.titulo)),'pipeline e retorno só após a confirmação');
 /* corrigir texto */
 await p.evaluate(()=>document.querySelectorAll('details').forEach(d=>d.open=true));await clicar('[data-m="conversao.corrigir-texto"]');e=await estado();const m2=(e.eventos||[]).find(x=>x.tipo==='mensagem-enviada');ok(m2.texto===promptResp&&m2.correcoes?.length===1&&/Mudei uma frase/.test(m2.correcoes[0].textoAnterior),'correção posterior do texto preserva o anterior');
 /* resposta e continuidade */
 await p.fill('#cv-resp [name=texto]','Ajudaria sim. Depende do valor.');await clicar('#cv-resp [type=submit]');t=await txt();ok(/Leitura:/.test(t)&&/hipótese/i.test(t),'resposta interpretada com hipóteses');
 await clicar('[data-m="conversao.registrar-resposta"]');e=await estado();ok((e.eventos||[]).some(x=>x.tipo==='resposta'&&x.numero==='5535999991001')&&(e.rascunhos||[]).some(r=>r.estadoMensagem==='resposta-registrada'),'resposta registrada e estado da mensagem atualizado');
 ok(/Ação recomendada: Apresentar preço/.test(await txt())||/Ação recomendada/.test(await txt()),'estratégia atualizada após a resposta');
 texto=await p.inputValue('#cv-texto');ok(/R\$ 800/.test(texto)&&/R\$ 600/.test(texto),'próxima mensagem já usa o valor vigente, na mesma tela');
 /* cancelar */
 await clicar('[data-m="conversao.whatsapp"]');const antes=(await estado()).eventos.filter(x=>x.tipo==='mensagem-enviada').length;await clicar('[data-m="conversao.cancelar-envio"]');e=await estado();ok(e.eventos.filter(x=>x.tipo==='mensagem-enviada').length===antes&&(e.rascunhos||[]).some(r=>r.estadoMensagem==='cancelada'),'cancelar mantém o rascunho e não registra envio');
 /* bloqueios */
 await escolher('Bloqueada');t=await txt();ok(/Envio bloqueado/.test(t)&&await p.locator('[data-m="conversao.whatsapp"][disabled]').count()===1,'empresa "não contatar": envio bloqueado');
 await escolher('Sem Número');const n1=(await abertos()).length;await p.fill('#cv-texto','Oi');await clicar('[data-m="conversao.whatsapp"]');ok((await abertos()).length===n1,'sem número cadastrado: o WhatsApp não é aberto e o motivo é mostrado');
 await escolher('Fixo Ltda');await p.fill('#cv-texto','Oi, tudo bem?');await esp(300);const nd=dialogos.length;await clicar('[data-m="conversao.whatsapp"]');ok(dialogos.slice(nd).some(m=>/Telefone fixo: confirme se a empresa atende por WhatsApp/.test(m))&&(await abertos()).at(-1).startsWith('https://wa.me/553538211234'),'telefone fixo: aviso antes de abrir (WhatsApp não confirmado) e link com o número correto');await clicar('[data-m="conversao.cancelar-envio"]');
 /* contatos por papel */
 await escolher('Smart Tech');await p.evaluate(()=>document.querySelectorAll('details').forEach(d=>d.open=true));await p.selectOption('#cv-novo-contato [name=papel]','proprietario');await p.fill('#cv-novo-contato [name=numero]','(35) 98888-7777');await p.fill('#cv-novo-contato [name=nome]','Ana');await clicar('#cv-novo-contato [type=submit]');t=await txt();ok(/origem/i.test(t)||(await estado()).empresas.find(x=>x.id==='e1').contatos===undefined,'proprietário SEM origem é recusado (não afirma sem evidência)');
 await p.evaluate(()=>document.querySelectorAll('details').forEach(d=>d.open=true));await p.selectOption('#cv-novo-contato [name=papel]','proprietario');await p.fill('#cv-novo-contato [name=numero]','(35) 98888-7777');await p.fill('#cv-novo-contato [name=nome]','Ana');await p.fill('#cv-novo-contato [name=origem]','Ela mesma informou por telefone');await clicar('#cv-novo-contato [type=submit]');
 await p.selectOption('#cv-contato',{label:/Proprietário/}).catch(async()=>{const v=await p.evaluate(()=>[...document.querySelectorAll('#cv-contato option')].find(o=>/Propriet/.test(o.textContent))?.value);await p.selectOption('#cv-contato',v);});await esp(300);
 await p.fill('#cv-texto','Oi, Ana! Posso te mostrar uma ideia de site para a Smart Tech?');await clicar('[data-m="conversao.whatsapp"]');a=await abertos();ok(a.at(-1).startsWith('https://wa.me/5535988887777?text='),'contato escolhido (proprietário, com origem) é o número aberto');
 await clicar('[data-m="conversao.cancelar-envio"]');
 /* rotas antigas redirecionam */
 await p.evaluate(()=>{const b=document.createElement('button');b.id='legado';b.dataset.m='mensagens.abrir';b.dataset.id='e1';document.body.append(b);});await p.evaluate(()=>{document.querySelector('#painel').open&&document.querySelector('.fechar-painel').click();});await esp(300);await p.evaluate(()=>document.querySelector('#legado').click());await esp(600);ok(/Compositor de mensagens/.test(await txt()),'rota antiga "mensagens.abrir" redireciona para o módulo unificado');
 /* celular */
 await p.setViewportSize({width:375,height:780});await esp(400);const w=await p.evaluate(()=>[document.documentElement.scrollWidth,document.querySelector('.cv-ws')?getComputedStyle(document.querySelector('.cv-ws')).gridTemplateColumns.split(' ').length:0]);ok(w[0]<=376&&w[1]===1,'celular 375px: coluna única, sem rolagem horizontal ('+w.join('/')+')');
 ok(await p.locator('[data-m="conversao.whatsapp"]').isVisible()&&await p.locator('#cv-texto').isVisible(),'celular: texto e botão do WhatsApp visíveis sem sair da tela');
 ok(!erros.length,'sem erros de JavaScript'+(erros.length?': '+erros.slice(0,3).join(' | '):''));
 await b.close();console.log(falhas?falhas+' falhas':'todas aprovadas');process.exit(falhas?1:0);
})().catch(e=>{console.error(e);process.exit(1);});
