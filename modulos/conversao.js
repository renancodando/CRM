/* Órbita Conversão: painel de qualificação, conversa, objeções, valor, laboratório, funil, memória, treino e evidências. Nada é enviado automaticamente. */
import {t,campo,dadosForm,dataHora,confirmar,linkWhatsapp,abrirExterno,somarDias} from './util.js';
import {tabela} from './graficos.js';
import {confirmarEnvioMensagem,registrarResposta,registrarDemonstracaoApresentada} from '../nucleo/acoes.js';
import {novoId,eventosDaEmpresa} from '../nucleo/esquema.js';
import {conv,qualificar,filaOportunidades,estadoConversa,rotuloEstadoConversa,proximoPasso,planoFollowUp,podeContatar,canais,registrarConsentimento,consentimento} from '../nucleo/conversao/dominio.js';
import {gerarAbordagens,propostaDeValor,recomendarModelo,sugestoesDeFeedback} from '../nucleo/conversao/abordagens.js';
import {auditarMensagem,objecoes,analisarResposta,contextoResposta,responderObjecao} from '../nucleo/conversao/linguagem.js';
import {criarExperimentoConversao,elegiveis,distribuir,resultadoExperimentoConversao,registrarDesvio,diagnosticarFunil,memoriaAbordagens,recomendarAbordagem,registrarRecomendacao,cenarios,avaliarTreino,registrarTreino,criterios} from '../nucleo/conversao/laboratorio.js';
import {estudos,tecnicas,graus,proibicoes,citacao,estudoPorId} from '../nucleo/conversao/evidencias.js';
import {criarConversa} from './conversa.js';
const abas=[['conversa','Conversa'],['fila','Fila'],['objecoes','Objeções'],['valor','Valor e Estúdio'],['lab','Laboratório'],['funil','Funil'],['memoria','Memória'],['treino','Treino'],['evidencias','Evidências'],['config','Consentimento e limites']];
const pc=v=>v==null?'—':(v*100).toFixed(1).replace('.',',')+'%';
export function criarConversao(ctx){
 const {obterEstado,salvar,avisar,abrirPainel}=ctx,estado=()=>obterEstado();
 let aba='conversa',empId='',expSel='',cenSel=cenarios[0].id,avalTreino=null,respTreino='';
 const conversa=criarConversa(ctx,()=>abrir(aba));
 const emp=()=>conversa.empresaAtual();
 const selEmpresa=(nome='empresa')=>`<label class="campo"><span>Empresa</span><select name="${nome}" id="cv-emp"><option value="">Selecione…</option>${estado().empresas.filter(e=>e.situacao!=='excluida').map(e=>`<option value="${t(e.id)}" ${e.id===conversa.estadoLocal.empId?'selected':''}>${t(e.nome)} · ${t(e.cidade)}</option>`).join('')}</select></label>`;
 const aviso=txt=>`<p class="ajuda">${t(txt)}</p>`;
 const selo=(txt,cl='pausada')=>`<span class="selo-situacao ${cl}">${t(txt)}</span>`;
 /* ---------- fila ---------- */
 function fila(){
  const f=filaOportunidades(estado(),{limite:30});
  return `${aviso('Pontuação explicável: só conta o que você sabe. Fatores sem informação aparecem como "desconhecido" e reduzem a confiança — não valem zero. Empresas com duplicidade, recusadas, sem contato permitido ou de baixo potencial não entram.')}${f.length?f.map((x,i)=>`<article class="cartao-exp"><div class="cabecalho-lista"><h4>${i+1}. ${t(x.empresa.nome)} ${selo(x.q.potencial,x.q.potencial==='alto'?'ativa':'pausada')}</h4><small>${t(x.empresa.cidade)} · nota ${x.q.nota}/100 · confiança ${x.q.confianca}%</small></div><details><summary>Por que esta posição?</summary><ul>${x.q.fatores.map(ft=>`<li><b>${t(ft.nome)}</b> (peso ${ft.peso}): ${ft.valor==null?'<em>desconhecido</em>':Math.round(ft.valor*100)+'%'} — ${t(ft.detalhe)}</li>`).join('')}</ul></details><div class="acoes-linha"><button type="button" class="botao-principal" data-m="conversao.abrir-conversa" data-id="${t(x.empresa.id)}">Conversar e converter</button></div></article>`).join(''):'<p class="vazio">Nenhuma empresa elegível agora. Cadastre empresas com site/serviços/contato ou registre consentimento.</p>'}`;
 }
 /* ---------- objeções ---------- */
 function objecoesAba(){
  return aviso('Catálogo de objeções com resposta respeitosa. Recusas claras (incluindo "pare") encerram o contato: não há resposta de "contorno".')+objecoes.map(o=>`<details class="cartao-exp"><summary><b>${t(o.rotulo)}</b> ${o.recusa?selo('recusa — não insistir','perdida'):''} <small>${t(o.categoria)}</small></summary><p><b>O que pode significar:</b> ${o.hipoteses.map(t).join(' · ')}</p><p><b>Não sabemos:</b> ${o.naoSabemos.map(t).join(' · ')}</p><p><b>Próximo passo:</b> ${t(o.proximoPasso)}</p><p><b>Evitar:</b> ${t(o.evitar)}</p><p><b>Quando encerrar:</b> ${t(o.encerrar)}</p></details>`).join('');
 }
 /* ---------- valor / Estúdio ---------- */
 function valor(){
  const e=emp(),est=estado();let h=`<form id="cv-sel">${selEmpresa()}</form>`;if(!e)return h+aviso('Escolha uma empresa.');
  const demos=est.demonstracoes.filter(d=>d.empresaId===e.id),demo=demos.at(-1)||null,pv=propostaDeValor(e,{demo,config:est.config.comercial}),mod=recomendarModelo(e);
  h+=`<h3>Proposta de valor (só o que o projeto entrega)</h3><ul>${pv.usar.map(i=>`<li><b>${t(i.recurso)}</b> → ${t(i.beneficio)}${i.falta?` <small>(falta: ${t(i.falta)})</small>`:''}</li>`).join('')}</ul>${pv.indisponiveis.length?`<details><summary>Indisponíveis agora (${pv.indisponiveis.length})</summary><ul>${pv.indisponiveis.map(i=>`<li>${t(i.recurso)}: ${t(i.falta)}</li>`).join('')}</ul></details>`:''}<p><b>Argumentos a evitar:</b> ${pv.evitar.map(t).join(' · ')}</p><p class="ajuda">${t(pv.nota)}</p>`;
  h+=`<h3>Modelo sugerido para o Estúdio</h3><ol>${mod.ranking.slice(0,3).map(m=>`<li><b>${t(m.nome)}</b> — ${t(m.porque)}</li>`).join('')}</ol><p class="ajuda">${t(mod.aviso)}</p>`;
  h+=`<h3>Demonstrações desta empresa</h3>${demos.length?demos.map(d=>`<p>${t(d.nome||d.id)} · ${t(d.status||'')} ${d.urlPublica?'· <a href="'+t(d.urlPublica)+'" target="_blank" rel="noopener noreferrer">link</a>':'· sem link publicado'}</p>`).join(''):'<p class="vazio">Nenhuma ainda. Crie no Estúdio de Sites; ele nunca marca como publicada sem sua confirmação.</p>'}<div class="acoes-linha"><button type="button" data-m="estudio.criar" data-id="${t(e.id)}">Abrir Estúdio</button></div>`;
  h+=`<h3>Feedback do cliente sobre a demonstração</h3><form id="cv-fb"><label class="campo largo"><span>Cole o feedback recebido</span><textarea name="texto" rows="3" maxlength="1500"></textarea></label><button type="submit">Traduzir em ajustes</button></form><div id="cv-fb-out"></div>`;
  return h;
 }
 /* ---------- laboratório ---------- */
 function lab(){
  const est=estado(),exps=est.experimentos.filter(x=>x.conv),ab=gerarAbordagens(est,est.empresas[0]||{nome:'x',cidade:'x',historico:[]}).abordagens;
  const letras=[['direta','A · Direta e transparente'],['consultiva','B · Consultiva'],['demonstracao','C · Com demonstração'],['diagnostico','D · Diagnóstico'],['baixo-atrito','E · Baixo atrito'],['autonomia','F · Autonomia']];
  let h=aviso('Experimento controlado: a hipótese, o critério de sucesso e o tamanho mínimo ficam fixados antes. As empresas são sorteadas (estratificado por nicho) só entre as que podem ser contatadas. Resposta ≠ venda. Com amostra pequena, nenhuma vencedora é declarada.');
  h+=`<form id="cv-exp" class="grade-formulario">${campo('nome','Nome do experimento','',{obrigatorio:true})}${campo('hipotese','Hipótese (o que você espera e por quê)','',{largo:true,obrigatorio:true})}${campo('criterio','Critério de sucesso',criterios['resposta-positiva']&&'resposta-positiva',{opcoes:Object.entries(criterios)})}${campo('a','Variante 1','direta',{opcoes:letras})}${campo('b','Variante 2','consultiva',{opcoes:letras})}${campo('min','Mensagens mínimas por variante','20',{tipo:'number'})}${campo('nicho','Nicho (opcional)','')}<button class="botao-principal" type="submit">Criar experimento</button></form>`;
  h+=exps.length?exps.map(x=>{const r=resultadoExperimentoConversao(est,x),el=elegiveis(est,x).length;
   return `<article class="cartao-exp"><div class="cabecalho-lista"><h4>${t(x.nome)} ${selo(r.veredito.tipo,r.veredito.tipo==='evidencia'?'ativa':'pausada')}</h4><small>${t(criterios[x.criterio])} · mínimo ${x.nMinimoPorVariante}/variante · ${x.analises.length}/${x.olhadas} análises planejadas</small></div><p><b>Hipótese:</b> ${t(x.hipotese)}</p><p>${t(r.observacao)}</p>${tabela(['Variante','Atribuídas','Enviadas','Sucesso','Taxa (IC 95%)','Respostas','Vendas','Recusas'],r.linhas.map(l=>[l.variante.nome,l.atribuidas,l.enviadas,l.sucesso,l.enviadas?pc(l.taxa)+' ('+pc(l.ic?.baixo)+'–'+pc(l.ic?.alto)+')':'—',l.respostas,l.vendas,l.recusas]))}<p><b>${t(r.veredito.texto)}</b></p>${r.comparacao?`<p class="ajuda">Diferença ${pc(r.comparacao.diferencaAbs)} (IC ${pc(r.comparacao.ic?.baixo)} a ${pc(r.comparacao.ic?.alto)}); p=${r.comparacao.p.toFixed(3)}; h de Cohen=${r.comparacao.h.toFixed(2)}. ${t(r.comparacao.metodo)}</p>`:''}${r.alertas.map(a=>`<p class="alerta-duplicidade" role="note">${t(a)}</p>`).join('')}${x.desvios.length?`<p><b>Desvios:</b> ${x.desvios.map(d=>t(d.texto)).join(' · ')}</p>`:''}
   <div class="acoes-linha"><button type="button" data-m="conversao.sortear" data-id="${x.id}" ${el?'':'disabled'}>Sortear ${el} empresa(s) elegível(is)</button><button type="button" data-m="conversao.analisar" data-id="${x.id}">Registrar uma análise</button><button type="button" data-m="conversao.desvio" data-id="${x.id}">Registrar desvio</button><button type="button" data-m="conversao.encerrar-exp" data-id="${x.id}">Encerrar</button></div></article>`;}).join(''):'<p class="vazio">Nenhum experimento de conversão. Sugestão de primeiro: A (direta) vs B (consultiva) com critério "resposta positiva".</p>';
  return h;
 }
 /* ---------- funil ---------- */
 function funil(){
  const d=diagnosticarFunil(estado()),est=conv(estado()).estimativa;
  let h=aviso('O diagnóstico usa apenas eventos reais registrados (mensagens confirmadas, respostas, etc.). Ele aponta hipóteses, não causas comprovadas.');
  if(est)h+=`<div class="alerta-duplicidade" role="note"><b>Estimativa informada por você (não são resultados registrados):</b> ${est.contatos||'?'} contatos, ~${est.semResposta??'?'} sem resposta, ~${est.respondeuSumiu??'?'} responderam e sumiram, ~${est.recusas??'?'} recusaram. Use apenas como hipótese inicial; registre os envios reais para medir.</div>`;
  h+=`<form id="cv-est" class="grade-formulario">${campo('contatos','Contatos já feitos (estimativa)',est?.contatos||'',{tipo:'number'})}${campo('semResposta','Sem resposta (estimativa)',est?.semResposta||'',{tipo:'number'})}${campo('respondeuSumiu','Responderam e sumiram (estimativa)',est?.respondeuSumiu||'',{tipo:'number'})}${campo('recusas','Recusaram (estimativa)',est?.recusas||'',{tipo:'number'})}<button type="submit">Guardar como hipótese</button></form>`;
  h+=tabela(['Etapa','Base','Avançaram','Taxa (IC 95%)','Base suficiente?'],d.passos.map(p=>[p.de+' → '+p.para,p.denominador,p.numerador,p.denominador?pc(p.taxa)+' ('+pc(p.ic?.baixo)+'–'+pc(p.ic?.alto)+')':'—',p.suficiente?'sim':'não (mín. 10)']));
  if(!d.possivel)return h+`<p class="vazio">${t(d.motivo)}</p>`;
  const g=d.gargalo;return h+`<article class="cartao-exp"><h4>Maior queda observada: ${t(g.de)} → ${t(g.para)}</h4><p>${t(g.evidencia)} Confiança na leitura: ${t(g.confianca)}.</p><p><b>Explicações possíveis (hipóteses):</b></p><ul>${g.alternativas.map(x=>`<li>${t(x)}</li>`).join('')}</ul><p><b>Próximo experimento:</b> ${t(g.proximoExperimento)}</p><p><b>Métrica:</b> ${t(g.metrica)}</p>${d.comparacao?`<p>${t(d.comparacao.texto)} (p=${d.comparacao.p.toFixed(3)})</p>`:''}<p class="ajuda">${t(d.aviso)}</p></article>`;
 }
 /* ---------- memória ---------- */
 function memoria(){
  const m=memoriaAbordagens(estado()),h=conv(estado()).historicoRecomendacoes;
  return aviso('Memória comercial: associações observadas nos seus próprios envios. Taxas pequenas são encolhidas em direção à média geral para não superestimar poucas amostras. Isto não prova que a abordagem causa o resultado.')+(m.linhas.length?tabela(['Abordagem','Envios','Resp. positivas','Taxa (IC 95%)','Estimativa regularizada','Amostra ok?'],m.linhas.map(l=>[l.abordagem,l.n,l.positivas,pc(l.taxa)+' ('+pc(l.ic?.baixo)+'–'+pc(l.ic?.alto)+')',pc(l.regularizada),l.amostraOk?'sim':'não (mín. 15)'])):'<p class="vazio">Nenhum envio com abordagem registrada ainda.</p>')+`<h3>Histórico de recomendações</h3>${h.length?h.slice().reverse().slice(0,15).map(x=>`<p><small>${t(dataHora(x.quando))}</small> · ${t(x.recomendada)} (${t(x.modo)}) — ${t(x.porque)}</p>`).join(''):'<p class="vazio">Sem recomendações registradas.</p>'}`;
 }
 /* ---------- treino ---------- */
 function treino(){
  const c=cenarios.find(x=>x.id===cenSel),sims=conv(estado()).simulacoes;
  return `<div class="alerta-duplicidade" role="note"><b>Simulação com cliente FICTÍCIO.</b> Nada aqui altera empresas, eventos ou métricas reais.</div><form id="cv-treino"><label class="campo"><span>Cenário</span><select name="cen" id="cv-cen">${cenarios.map(x=>`<option value="${x.id}" ${x.id===cenSel?'selected':''}>${t(x.titulo)}</option>`).join('')}</select></label><p><b>${t(c.cliente)}</b> diz: “${t(c.fala)}”</p><label class="campo largo"><span>Sua resposta</span><textarea name="resp" rows="3" maxlength="800">${t(respTreino)}</textarea></label><button class="botao-principal" type="submit">Avaliar</button></form>${avalTreino?`<article class="cartao-exp"><h4>Nota ${avalTreino.nota}/100</h4><ul>${avalTreino.pontos.map(p=>`<li>✔ ${t(p)}</li>`).join('')}${avalTreino.feedback.map(p=>`<li>⚠ ${t(p)}</li>`).join('')}</ul><p><b>Dica:</b> ${t(avalTreino.dica)}</p></article>`:''}<p class="ajuda">${sims.length} treino(s) salvos${sims.length?' · média '+Math.round(sims.reduce((s,x)=>s+x.nota,0)/sims.length):''}.</p>`;
 }
 /* ---------- evidências ---------- */
 function evidencias(){
  return aviso('Biblioteca de evidências: só referências reais, com o grau de aplicabilidade ao seu contexto (primeiro contato comercial por WhatsApp com pequenas empresas). Nenhuma técnica está marcada como diretamente comprovada para este caso. "Verificação" mostra se a referência foi confirmada em fonte online nesta construção.')+`<h3>Técnicas</h3>`+tecnicas.map(x=>`<details class="cartao-exp"><summary><b>${t(x.nome)}</b> ${selo(graus[x.grau])}</summary><p><b>Como usar:</b> ${t(x.como||'')}</p><p><b>Riscos:</b> ${t(x.riscos||'')}</p><p><b>Evitar:</b> ${t(x.evitar||'')}</p><p><b>Estudos:</b> ${x.evidencias.map(id=>t(estudoPorId(id)?.autores+' ('+estudoPorId(id)?.ano+')')).join('; ')||'—'}</p></details>`).join('')+`<h3>Referências</h3><ul>${estudos.map(e=>`<li>${t(citacao(e))} <small>[${t(graus[e.grau])} · verificação: ${t(e.verificacao||'—')}]</small><br><small>Aplicação: ${t(e.aplicacao||'—')} · Limitações: ${t(e.limitacoes||'—')}</small></li>`).join('')}</ul><h3>Nunca fazer</h3><ul>${proibicoes.map(p=>`<li>${t(p)}</li>`).join('')}</ul>`;
 }
 /* ---------- config / consentimento ---------- */
 function config(){
  const c=conv(estado()).config.follow,bloq=estado().empresas.filter(e=>e.situacao==='nao-contatar'||Object.values(e.consentimento||{}).some(x=>x.estado==='revogado'));
  const e=emp();
  return aviso('Limites de follow-up e consentimento por canal. O Órbita não envia nada sozinho, não faz envio em massa e respeita a política do WhatsApp (business.whatsapp.com/policy). Um número publicado na internet não é consentimento.')+`<form id="cv-follow" class="grade-formulario">${campo('intervalos','Intervalos entre tentativas (dias, separados por vírgula)',c.intervalosDias.join(', '))}${campo('max','Máximo de tentativas sem resposta',String(c.maxTentativas),{tipo:'number'})}<button type="submit">Salvar limites</button></form><h3>Consentimento por canal</h3><form id="cv-sel">${selEmpresa()}</form>${e?`<form id="cv-cons" class="grade-formulario">${campo('canal','Canal','whatsapp',{opcoes:canais})}${campo('estado','Situação','autorizado',{opcoes:[['autorizado','Autorizado (ele pediu/aceitou contato)'],['revogado','Revogado (pediu para parar)'],['desconhecido','Desconhecido']]})}${campo('origem','Origem (obrigatória se autorizado)','',{largo:true,dica:'Ex.: "pediu orçamento por WhatsApp em 12/11"'})}<button class="botao-principal" type="submit">Registrar</button></form><p>${canais.map(([k,n])=>`${t(n)}: ${t(consentimento(e,k).estado)}`).join(' · ')}</p>`:''}<h3>Lista de não contatar (${bloq.length})</h3>${bloq.length?bloq.map(b=>`<p>${t(b.nome)} — ${t(b.situacao==='nao-contatar'?'não contatar':'consentimento revogado')}</p>`).join(''):'<p class="vazio">Ninguém bloqueado.</p>'}<h3>IA/LLM opcional</h3><p class="ajuda">Esta versão não usa nenhuma API de IA: todas as recomendações são regras determinísticas explicáveis. Seu assistente externo (ChatGPT/Claude) pode propor rascunhos via Órbita Connect, mas só você confirma e envia.</p>`;
 }
 const tabs={fila,conversa:()=>conversa.html(),objecoes:objecoesAba,valor,lab,funil,memoria,treino,evidencias,config};
 function abrir(a=aba,id){
  aba=a;if(id)conversa.definirEmpresa(id);
  abrirPainel('Da primeira mensagem ao fechamento, com método',`<div class="abas" role="tablist">${abas.map(([k,n])=>`<button type="button" role="tab" aria-selected="${aba===k}" class="${aba===k?'ativa':''}" data-m="conversao.aba" data-id="${k}">${n}</button>`).join('')}</div>${tabs[aba]()}`,'ÓRBITA CONVERSÃO');
  const q=s=>document.querySelector(s),f=(s,fn)=>q(s)?.addEventListener('submit',ev=>{ev.preventDefault();try{fn(dadosForm(ev.currentTarget),ev.currentTarget);}catch(x){avisar(x.message);}});
  q('#cv-emp')?.addEventListener('change',ev=>{conversa.definirEmpresa(ev.target.value);abrir(aba);});
  if(aba==='conversa')conversa.ligar(q,f);
  q('#cv-cen')?.addEventListener('change',ev=>{cenSel=ev.target.value;avalTreino=null;respTreino='';abrir('treino');});
  f('#cv-fb',d=>{const s=sugestoesDeFeedback(d.texto);q('#cv-fb-out').innerHTML=Array.isArray(s)?`<ul>${s.map(x=>`<li>${t(typeof x==='string'?x:x.texto||x.ajuste||JSON.stringify(x))}</li>`).join('')}</ul>`:`<p>${t(s.aviso||s.texto||'Sem ajustes concretos: o feedback é vago. Pergunte o que mais chamou atenção.')}</p>${(s.sugestoes||s.ajustes||[]).map(x=>`<p>• ${t(typeof x==='string'?x:x.texto||x.ajuste)}</p>`).join('')}`;});
  f('#cv-exp',d=>{const ab=g=>({nome:g,abordagem:g});const x=criarExperimentoConversao(estado(),{nome:d.nome,hipotese:d.hipotese,criterio:d.criterio,variantes:[ab(d.a),ab(d.b)],nMinimoPorVariante:Number(d.min)||20,nicho:d.nicho.trim()});if(d.a===d.b){estado().experimentos.pop();throw Error('Escolha duas abordagens diferentes.');}salvar();avisar('Experimento criado. Nenhuma empresa foi sorteada ainda.');abrir('lab');});
  f('#cv-est',d=>{const n=k=>d[k]===''?null:Math.max(0,Number(d[k])||0);conv(estado()).estimativa={contatos:n('contatos'),semResposta:n('semResposta'),respondeuSumiu:n('respondeuSumiu'),recusas:n('recusas'),informadaEm:new Date().toISOString(),tipo:'estimativa-do-usuario'};salvar();avisar('Guardada como hipótese. Não entra nas métricas reais.');abrir('funil');});
  f('#cv-follow',d=>{const iv=d.intervalos.split(',').map(x=>Number(x.trim())).filter(x=>x>=1&&x<=90);if(!iv.length)throw Error('Informe ao menos um intervalo em dias (1 a 90).');const cf=conv(estado()).config.follow;cf.intervalosDias=iv;cf.maxTentativas=Math.min(6,Math.max(1,Number(d.max)||3));salvar();avisar('Limites salvos.');abrir('config');});
  f('#cv-cons',d=>{const e2=emp();if(d.estado==='revogado'&&!confirmar('Revogar bloqueia o contato com esta empresa. Continuar?'))return;registrarConsentimento(estado(),e2,d.canal,{estado:d.estado,origem:d.origem,nota:'registrado por você'});salvar();avisar('Consentimento registrado.');abrir('config');});
  f('#cv-treino',d=>{respTreino=d.resp;const c=cenarios.find(x=>x.id===cenSel);avalTreino=avaliarTreino(c,d.resp);registrarTreino(estado(),c.id,d.resp,avalTreino);salvar();abrir('treino');});
 }
 const acoes={
  aba:id=>abrir(id),
  'abrir-conversa':(id,alvo)=>abrirConversa(id,{tipo:alvo?.dataset?.extra||''}),
  ...conversa.acoes,
  sortear:id=>{const x=estado().experimentos.find(y=>y.id===id),el=elegiveis(estado(),x);if(!confirmar(`Sortear ${el.length} empresa(s) entre as variantes? O sorteio é registrado e não pode ser refeito para as mesmas empresas. Nenhuma mensagem será enviada.`))return;distribuir(estado(),x,el.map(e=>e.id));salvar();avisar('Empresas distribuídas. Abra cada uma na aba Conversa; a abordagem sorteada será usada.');abrir('lab');},
  analisar:id=>{const x=estado().experimentos.find(y=>y.id===id);resultadoExperimentoConversao(estado(),x,{registrarOlhada:true});salvar();abrir('lab');},
  desvio:id=>{const m=window.prompt('Descreva o desvio do protocolo:','');if(!m)return;registrarDesvio(estado(),estado().experimentos.find(y=>y.id===id),m);salvar();abrir('lab');},
  'encerrar-exp':id=>{const x=estado().experimentos.find(y=>y.id===id);if(!confirmar('Encerrar este experimento? Os resultados ficam guardados.'))return;x.ativo=false;x.fim=new Date().toISOString();salvar();abrir('lab');}
 };
 function abrirConversa(id,opts={}){conversa.definirEmpresa(id,opts);abrir('conversa');}
 return {abrir,abrirConversa,acoes};
}
