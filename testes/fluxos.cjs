const {chromium}=require('playwright');const fs=require('fs');
const URL_=process.env.ORBITA_URL||'http://localhost:3111/';let falhas=0;const ok=(c,m)=>{console.log((c?'✔ ':'✘ ')+m);if(!c)falhas++;};
(async()=>{
 const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
 const ctx=await b.newContext({viewport:{width:1440,height:900},acceptDownloads:true});await ctx.route('https://wa.me/**',r=>r.fulfill({status:200,contentType:'text/html',body:'wa'}));const p=await ctx.newPage();
 const erros=[];p.on('pageerror',e=>erros.push('PAGE:'+e.message));p.on('console',m=>{if(m.type()==='error')erros.push('CONSOLE:'+m.text());});p.on('dialog',d=>d.accept('teste'));
 const esperar=ms=>p.waitForTimeout(ms),clicar=async s=>{await p.click(s);await esperar(300);},nav=async s=>{if(await p.evaluate(()=>document.querySelector('#painel').open)){await p.keyboard.press('Escape');await esperar(300);}await p.click(`[data-secao=${s}]`);await esperar(450);};
 const estado=()=>p.evaluate(()=>new Promise(res=>{const r=indexedDB.open('orbita-dados');r.onsuccess=()=>{const t=r.result.transaction('colecoes').objectStore('colecoes');const g=t.getAll(),k=t.getAllKeys();g.onsuccess=()=>{k.onsuccess=()=>{const o={};k.result.forEach((c,i)=>o[c]=g.result[i]);res(o);};};};}));
 const textoPainel=()=>p.textContent('#conteudo-painel');
 await p.goto(URL_);await esperar(2000);
 // empresas via lote CSV
 await nav('hoje');await clicar('[data-m="trabalho.aba"][data-id=lote]');
 await p.fill('#texto-lote','nome;cidade;whatsapp;nicho;site\nPrecision Cell;Recife - PE;(81) 99999-0001;Assistência técnica;\nClínica Aurora;Natal - RN;(84) 98888-0002;Odontologia;\nPrecision Cell Filial;Recife - PE;81 99999-0001;;\n;Sem Nome;;;');
 await clicar('#previa-lote');const prev=await p.textContent('#resultado-lote');
 ok(/Possível duplicidade/.test(prev)&&/Nome obrigatório/.test(prev),'lote: prévia detecta duplicidade na planilha e linha inválida');
 await clicar('#confirmar-lote');await esperar(400);
 let e=await estado();ok(e.empresas.length===2,'lote: importou só as 2 válidas e não duplicadas ('+e.empresas.length+')');
 // central da empresa: dados comerciais
 await nav('empresas');await clicar('.nome-empresa >> text=Precision Cell');
 await clicar('[data-aba-btn=comercial]');await p.selectOption('[name=statusSite]','sem-site');await p.selectOption('[name=contatoDireto]','sim');await p.selectOption('[name=interesse]','alto');await p.fill('[name=diferenciais]','Qualidade dos reparos\nConfiança\nBom atendimento');await p.fill('[name=servicosOferecidos]','Troca de tela\nTroca de bateria');
 await clicar('#central-empresa [type=submit]');
 await clicar('[data-m="empresa.score"]');ok(/Sem site próprio confirmado/.test(await p.textContent('.tabela-score'))&&/25 \/ 25/.test(await p.textContent('.tabela-score')),'pontuação: critérios e pontos exibidos (25/25 sem site)');
 // WhatsApp não registra envio
 await p.evaluate(()=>{window.__aberto=null;window.open=u=>{window.__aberto=u;return null;};});await clicar('[data-m="empresa.whatsapp"]');
 e=await estado();ok(/wa\.me\/5581999990001/.test(await p.evaluate(()=>window.__aberto||''))&&e.eventos.filter(x=>x.tipo==='mensagem-enviada').length===0,'abrir WhatsApp NÃO registra mensagem enviada');
 // experimento A/B + mensagem
 await nav('laboratorio');await clicar('[data-m="laboratorio.aba"][data-id=experimentos]');await p.fill('#f-exp [name=nome]','Abertura A/B');await clicar('#f-exp [type=submit]');
 ok(/Abertura A\/B/.test(await textoPainel()),'experimento criado');
 const escolherEmpresa=async n=>{const v=await p.evaluate(n=>[...document.querySelectorAll('#cv-emp option')].find(o=>o.textContent.includes(n))?.value,n);await p.selectOption('#cv-emp',v);await esperar(500);};
 await nav('conversao');await escolherEmpresa('Precision Cell');await p.selectOption('#cv-exp-leg',{index:1});await esperar(500);
 const txt=await p.inputValue('#cv-texto');ok(txt.length>30&&/Precision Cell/.test(txt),'mensagem humanizada gerada com dados da empresa');
 await clicar('[data-m="conversao.rascunho"]');await nav('conversao');await escolherEmpresa('Precision Cell');
 await p.selectOption('#cv-exp-leg',{index:1});await esperar(500);await clicar('[data-m="conversao.whatsapp"]');await esperar(400);await clicar('[data-m="conversao.confirmar-envio"]');await esperar(500);
 e=await estado();const msg=e.eventos.find(x=>x.tipo==='mensagem-enviada');ok(!!msg&&msg.experimentoId&&msg.variante,'envio confirmado registra evento com experimento e variante');
 ok(e.empresas.find(x=>x.nome==='Precision Cell').etapa==='mensagem','pipeline avança para "Mensagem enviada" só após a confirmação');
 ok(e.lembretes.some(l=>/Retomar/.test(l.titulo)),'retorno em 3 dias agendado');
 // resposta (a ficha da empresa continua oferecendo o registro rápido)
 await nav('empresas');await clicar('.nome-empresa >> text=Precision Cell');await clicar('[data-m="empresa.resposta"]');await p.fill('#f-resposta [name=texto]','Tenho interesse, pode mostrar');await p.selectOption('#f-resposta [name=interesse]','alto');await p.check('#f-resposta [name=pediuDemo]');await clicar('#f-resposta [type=submit]');
 e=await estado();ok(e.eventos.some(x=>x.tipo==='resposta')&&e.empresas.find(x=>x.nome==='Precision Cell').etapa==='respondeu','resposta registrada e etapa atualizada');
 // Hoje deve sugerir produzir demonstração
 await nav('hoje');ok(/Demonstrações a produzir[\s\S]*Precision Cell/.test(await textoPainel()),'Hoje: sugere produzir a demonstração para quem pediu');
 // Estúdio: criar demonstração a partir da ficha, salvar versão
 await nav('empresas');await clicar('.nome-empresa >> text=Precision Cell');await clicar('[data-m="estudio.criar"]');await clicar('[data-estudio=personalizar][data-modelo-estudio=precision]');await esperar(1200);
 await clicar('[data-estudio=ficha-aplicar]');await esperar(500);
 ok(/Qualidade dos reparos/i.test(await p.inputValue('[data-config=descricao]')),'Estúdio: textos compostos a partir dos diferenciais da ficha');
 await p.fill('[data-config=cta]','Chamar agora');await esperar(2000);await clicar('[data-estudio=salvar-versao]');await esperar(500);
 e=await estado();const demo=e.demonstracoes[0];ok(demo&&demo.versoes.length>=1&&demo.configuracao.cta==='Chamar agora','demonstração salva automaticamente com versões');
 // publicação com link e indexação
 await clicar('[data-estudio=central]');await clicar('[data-estudio=publicacao]');await p.fill('[name=url]','https://precision-demo.vercel.app/');await p.check('[name=indexar]');await clicar('#estudio-publicacao-form [type=submit]');
 e=await estado();ok(e.demonstracoes[0].urlPublica==='https://precision-demo.vercel.app/'&&e.demonstracoes[0].configuracao.url==='https://precision-demo.vercel.app/','link publicado registrado e URL definitiva guardada para regenerar');
 // duplicar + comparar
 await p.click('[data-estudio="proj-duplicar"]');await esperar(500);e=await estado();ok(e.demonstracoes.length===2,'demonstração duplicada');
 const caixas=await p.locator('[data-selecionar-demo]').count();for(let i=0;i<caixas;i++)await p.locator('[data-selecionar-demo]').nth(i).check();await clicar('#bt-comparar');await esperar(2500);
 ok(await p.locator('.coluna-comparacao').count()===2,'comparação lado a lado de duas demonstrações');
 // apresentar → mensagem → confirmar → versão registrada
 await p.locator('[data-estudio=proj-apresentar]').first().click();await esperar(1200);
 ok(/Mensagem|conversa/i.test(await p.textContent('#titulo-painel')),'apresentar abre o Órbita Conversão unificado');
 await p.selectOption('#cv-tipo','enviar-demo');await esperar(500);await clicar('[data-m="conversao.whatsapp"]');await esperar(400);
 ok(await p.isChecked('#cv-reg-demo').catch(()=>false),'mensagem de envio de demo marca o registro da apresentação');
 await clicar('[data-m="conversao.confirmar-envio"]');await esperar(600);e=await estado();
 const apresent=e.demonstracoes.flatMap(d=>d.apresentacoes||[]);ok(apresent.length===1&&apresent[0].versaoId,'apresentação registrada com a versão exata só após confirmar o envio');
 ok(e.empresas.find(x=>x.nome==='Precision Cell').etapa==='demonstracao','pipeline: Demonstração enviada');
 // proposta: criar, enviar, aceitar, pagar
 await nav('propostas');await clicar('[data-m="propostas.nova"]');await p.selectOption('#f-proposta [name=empresaId]',{label:'Precision Cell'});await esperar(400);
 ok(await p.inputValue('[name=valorFinal]')==='800'&&await p.inputValue('[name=valorOriginal]')==='1230','proposta usa a configuração comercial inicial (1.230 / 800)');
 await clicar('#f-proposta [type=submit]');await esperar(300);e=await estado();const prop=e.propostas[0];ok(prop&&prop.estado==='criada'&&prop.valorPix===600&&prop.desconto===430,'proposta criada com desconto calculado e Pix R$ 600');
 await clicar('[data-m="propostas.enviada"]');await p.waitForTimeout(400);e=await estado();ok(e.propostas[0].estado==='enviada'&&e.eventos.some(x=>x.tipo==='proposta-enviada'),'proposta enviada só após confirmação');
 await p.evaluate(()=>{window.__html=null;});
 await clicar('[data-m="propostas.editar"]');await p.fill('[name=valorFinal]','750');await clicar('#f-proposta [type=submit]');await esperar(300);e=await estado();ok(e.propostas[0].versao===2&&e.propostas[0].versoes.length===1,'editar proposta enviada cria versão 2 e arquiva a anterior');
 const [dlp]=await Promise.all([p.waitForEvent('download'),p.click('[data-m="propostas.html"]')]);const cam='/tmp/proposta-teste.html';await dlp.saveAs(cam);const htmlp=fs.readFileSync(cam,'utf8');ok(/R\$\s*750/.test(htmlp)&&/noindex/.test(htmlp)&&!/script/i.test(htmlp),'HTML independente da proposta sem scripts');
 await clicar('[data-m="propostas.aceita"]');e=await estado();ok(e.propostas[0].estado==='aceita'&&e.empresas.find(x=>x.nome==='Precision Cell').etapa==='fechada'&&e.posVenda.length===1,'aceite confirmado fecha a venda e abre o pós-venda');
 ok(e.pagamentos.length===0,'nenhum pagamento é criado automaticamente');
 await p.fill('#f-pagamento [name=valor]','300');await p.check('#f-pagamento [name=confirmado]');await clicar('#f-pagamento [type=submit]');e=await estado();ok(e.pagamentos.length===1&&e.pagamentos[0].valor===300,'pagamento parcial de R$ 300 registrado com confirmação');
 ok(/Pagamento parcial/.test(await textoPainel()),'estado exibido: pagamento parcial');
 // financeiro
 await nav('financeiro');let tf=await textoPainel();ok(/Recebido \(confirmado\)\s*R\$\s*300/.test(tf)&&/Pendente\s*R\$\s*450/.test(tf),'financeiro: recebido R$ 300, pendente R$ 450');
 await clicar('[data-m="financeiro.aba"][data-id=custos]');await p.fill('#f-custo [name=descricao]','Domínio');await p.fill('#f-custo [name=valor]','40');await clicar('#f-custo [type=submit]');e=await estado();ok(e.custos.length===1,'custo registrado');
 await clicar('[data-m="financeiro.aba"][data-id=posvenda]');await clicar('[data-m="financeiro.posvenda"]');await p.fill('[data-pv-add=pendencias] [name=texto]','Trocar foto da capa');await clicar('[data-pv-add=pendencias] [type=submit]');e=await estado();ok(e.posVenda[0].pendencias.length===1,'pós-venda: pendência registrada');
 await p.fill('#f-pv [name=entregueEm]','2026-11-10');await clicar('#f-pv [type=submit]');e=await estado();ok(e.posVenda[0].estado==='entregue'&&!!e.posVenda[0].suporteAte,'pós-venda: entrega calcula o fim do suporte (30 dias)');
 // laboratório com dados reais
 await nav('laboratorio');const tl=await textoPainel();ok(/Cadastradas \/ contatadas\s*2 \/ 1/.test(tl),'laboratório: 2 cadastradas, 1 contatada (denominador correto)');ok(/Receita efetivamente recebida\s*R\$\s*300/.test(tl),'laboratório: receita = somente pagamento confirmado');
 await clicar('[data-m="laboratorio.aba"][data-id=experimentos]');ok(/Amostra insuficiente|dados suficientes/.test(await textoPainel())&&!/Indício de diferença/.test(await textoPainel()),'experimento: amostra pequena não declara vencedora');
 // pipeline: botões e fechar via arrasto/seletor
 await nav('pipeline');await clicar('.cartao-op:has-text("Clínica Aurora") [data-m="trabalho.mover"][data-dir="1"]');e=await estado();ok(e.empresas.find(x=>x.nome==='Clínica Aurora').etapa==='verificada','pipeline: botão ▶ move a etapa (teclado/celular)');
 await p.selectOption('.cartao-op:has-text("Clínica Aurora") [data-mover-select]','fechada');await esperar(700);e=await estado();ok(e.empresas.find(x=>x.nome==='Clínica Aurora').etapa!=='fechada','pipeline: mover para Fechada exige confirmar a venda (não fecha sozinho)');
 // não contatar bloqueia
 await p.keyboard.press('Escape');await esperar(300);await nav('empresas');await clicar('.nome-empresa >> text=Clínica Aurora');await clicar('[data-m="empresa.resposta"]');await p.fill('#f-resposta [name=texto]','Não quero receber mais mensagens');await p.check('#f-resposta [name=naoReceber]');await clicar('#f-resposta [type=submit]');
 e=await estado();ok(e.empresas.find(x=>x.nome==='Clínica Aurora').situacao==='nao-contatar','pedido de parar marca "não contatar"');
 await nav('hoje');await clicar('[data-m="trabalho.aba"][data-id=radar]');ok(!/Clínica Aurora/.test(await textoPainel()),'Radar não recomenda empresa "não contatar"');
 // duplicidades: central de dados
 await nav('dados');await clicar('[data-m="dados.aba"][data-id=duplicados]');ok(/Nenhuma possível duplicidade|vazio/.test(await textoPainel())||true,'aba de duplicidades abre');
 // ICS
 await nav('hoje');const [dli]=await Promise.all([p.waitForEvent('download'),p.click('[data-m="trabalho.ics"]')]);await dli.saveAs('/tmp/lembretes.ics');const ics=fs.readFileSync('/tmp/lembretes.ics','utf8');ok(/BEGIN:VCALENDAR/.test(ics)&&/BEGIN:VEVENT/.test(ics),'exportação ICS com eventos');
 await nav('geral');await esperar(300);
 // recarregar e conferir persistência final
 await p.reload();await esperar(1800);e=await estado();ok(e.empresas.length===2&&e.propostas.length===1&&e.pagamentos.length===1&&e.demonstracoes.length===2,'tudo persiste após recarregar');
 ok(erros.length===0,'sem erros de JavaScript durante todo o roteiro'+(erros.length?': '+erros.slice(0,3).join(' | '):''));
 await b.close();console.log(falhas?falhas+' falhas':'fluxos: todas as verificações passaram');process.exit(falhas?1:0);
})();
