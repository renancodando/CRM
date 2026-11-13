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
const abas=[['fila','Fila'],['conversa','Conversa'],['objecoes','Objeções'],['valor','Valor e Estúdio'],['lab','Laboratório'],['funil','Funil'],['memoria','Memória'],['treino','Treino'],['evidencias','Evidências'],['config','Consentimento e limites']];
const pc=v=>v==null?'—':(v*100).toFixed(1).replace('.',',')+'%';
export function criarConversao(ctx){
 const {obterEstado,salvar,avisar,abrirPainel}=ctx,estado=()=>obterEstado();
 let aba='fila',empId='',abSel='',textoResposta='',analise=null,expSel='',cenSel=cenarios[0].id,avalTreino=null,respTreino='';
 const emp=()=>estado().empresas.find(e=>e.id===empId)||null;
 const selEmpresa=(nome='empresa')=>`<label class="campo"><span>Empresa</span><select name="${nome}" id="cv-emp"><option value="">Selecione…</option>${estado().empresas.filter(e=>e.situacao!=='excluida').map(e=>`<option value="${t(e.id)}" ${e.id===empId?'selected':''}>${t(e.nome)} · ${t(e.cidade)}</option>`).join('')}</select></label>`;
 const aviso=txt=>`<p class="ajuda">${t(txt)}</p>`;
 const selo=(txt,cl='pausada')=>`<span class="selo-situacao ${cl}">${t(txt)}</span>`;
 /* ---------- fila ---------- */
 function fila(){
  const f=filaOportunidades(estado(),{limite:30});
  return `${aviso('Pontuação explicável: só conta o que você sabe. Fatores sem informação aparecem como "desconhecido" e reduzem a confiança — não valem zero. Empresas com duplicidade, recusadas, sem contato permitido ou de baixo potencial não entram.')}${f.length?f.map((x,i)=>`<article class="cartao-exp"><div class="cabecalho-lista"><h4>${i+1}. ${t(x.empresa.nome)} ${selo(x.q.potencial,x.q.potencial==='alto'?'ativa':'pausada')}</h4><small>${t(x.empresa.cidade)} · nota ${x.q.nota}/100 · confiança ${x.q.confianca}%</small></div><details><summary>Por que esta posição?</summary><ul>${x.q.fatores.map(ft=>`<li><b>${t(ft.nome)}</b> (peso ${ft.peso}): ${ft.valor==null?'<em>desconhecido</em>':Math.round(ft.valor*100)+'%'} — ${t(ft.detalhe)}</li>`).join('')}</ul></details><div class="acoes-linha"><button type="button" class="botao-principal" data-m="conversao.abrir-conversa" data-id="${t(x.empresa.id)}">Preparar conversa</button></div></article>`).join(''):'<p class="vazio">Nenhuma empresa elegível agora. Cadastre empresas com site/serviços/contato ou registre consentimento.</p>'}`;
 }
 /* ---------- conversa ---------- */
 function conversa(){
  const e=emp(),est=estado();
  let h=`<form id="cv-sel">${selEmpresa()}</form>`;if(!e)return h+aviso('Escolha uma empresa para ver o estado da conversa e as abordagens.');
  const q=qualificar(est,e),ec=estadoConversa(est,e),perm=podeContatar(e,'whatsapp'),pas=proximoPasso(ec.estado),fu=planoFollowUp(est,e);
  const rec=recomendarAbordagem(est,e),ab=gerarAbordagens(est,e,{demo:est.demonstracoes.filter(d=>d.empresaId===e.id).at(-1)||null});
  const exp=est.experimentos.filter(x=>x.conv&&x.ativo).map(x=>({x,a:x.atribuicoes.find(a=>a.empresaId===e.id&&!a.enviada)})).find(o=>o.a);
  if(exp&&!abSel){const v=exp.x.variantes.find(v=>v.id===exp.a.varianteId);const hit=ab.abordagens.find(a=>a.estrategia===v?.abordagem);if(hit)abSel=hit.id;}
  if(!abSel)abSel=rec.recomendada;
  h+=`<div class="resumo-relatorio quatro"><div class="numero-relatorio"><small>Estado</small><strong>${t(rotuloEstadoConversa(ec.estado))}</strong></div><div class="numero-relatorio"><small>Potencial</small><strong>${t(q.potencial)} (${q.nota})</strong></div><div class="numero-relatorio"><small>Confiança</small><strong>${q.confianca}%</strong></div><div class="numero-relatorio"><small>Contato</small><strong>${perm.ok?'permitido':'bloqueado'}</strong></div></div>`;
  h+=`<p><b>Próximo passo sugerido:</b> ${t(pas)}</p><p class="ajuda">Evidências do estado: ${ec.evidencias.map(t).join(' · ')||'—'}. O Órbita nunca infere "venda fechada": isso só acontece pela confirmação explícita.</p>`;
  if(!perm.ok)h+=`<div class="alerta-risco"><strong>Contato bloqueado:</strong> ${t(perm.motivo)}</div>`;else if(perm.aviso)h+=`<div class="alerta-duplicidade" role="note">${t(perm.aviso)}</div>`;
  if(exp)h+=`<div class="alerta-duplicidade" role="note">Esta empresa foi sorteada no experimento "${t(exp.x.nome)}": use a abordagem sorteada para manter o experimento válido. Se enviar outra, registre um desvio.</div>`;
  h+=`<h3>Abordagem recomendada: ${t(rec.recomendada)}</h3><p>${t(rec.porque)}</p>`;
  h+=`<div class="abas" role="tablist" aria-label="Abordagens">${ab.abordagens.map(a=>`<button type="button" role="tab" aria-selected="${abSel===a.id}" class="${abSel===a.id?'ativa':''}" data-m="conversao.abordagem" data-id="${a.id}" ${a.disponivel?'':'disabled'}>${a.id} · ${t(a.nome)}${a.id===rec.recomendada?' ★':''}</button>`).join('')}</div>`;
  const a=ab.abordagens.find(x=>x.id===abSel)||ab.abordagens[0];
  if(!a.disponivel)return h+aviso(a.indisponivel||'Abordagem indisponível para esta empresa.');
  h+=`<article class="cartao-exp"><label class="campo largo"><span>Mensagem (uma só, em um parágrafo — edite à vontade)</span><textarea id="cv-texto" rows="5" maxlength="1200">${t(a.mensagem)}</textarea></label><div id="cv-audit">${auditoriaHtml(a.auditoria)}</div>
  <div class="acoes-linha"><button type="button" data-m="conversao.copiar">Copiar</button><button type="button" data-m="conversao.whatsapp" ${perm.ok?'':'disabled'}>Abrir no WhatsApp (não registra envio)</button><button type="button" data-m="conversao.rascunho">Salvar rascunho</button><button type="button" class="botao-principal" data-m="conversao.enviei" data-id="${a.id}" ${perm.ok?'':'disabled'}>Confirmo que enviei</button></div>
  <details><summary>Por que esta mensagem?</summary><p>${t(a.porque)}</p><p><b>Técnicas:</b> ${a.tecnicas.map(x=>t(x.nome)+' ('+t(x.grau)+')').join('; ')}</p><ul>${a.evidencias.map(x=>`<li>${t(x.ref)} — <em>${t(x.grau)}</em>. Limitações: ${t(x.limitacoes)}</li>`).join('')}</ul><p><b>Pontos negativos:</b> ${a.pontosNegativos.map(t).join(' · ')}</p></details>
  <details><summary>E depois? (próxima mensagem conforme a resposta)</summary><ul><li><b>Interesse:</b> ${t(a.proximas.positivo)}</li><li><b>Pergunta:</b> ${t(a.proximas.pergunta)}</li><li><b>Recusa:</b> ${t(a.proximas.recusa)}</li><li><b>Silêncio:</b> ${t(a.proximas.silencio)}</li></ul></details></article>`;
  h+=`<h3>Quando responderem</h3><form id="cv-resp"><label class="campo largo"><span>Cole a resposta recebida</span><textarea name="texto" rows="3" maxlength="1500">${t(textoResposta)}</textarea></label><button class="botao-principal" type="submit">Interpretar</button></form>${analise?analiseHtml(e):''}`;
  h+=`<h3>Follow-up</h3><p>${fu.permitido?selo('liberado','ativa'):selo('aguarde')} ${t(fu.motivo)}${fu.tipo?' Tipo sugerido: '+t(fu.tipo)+'.':''}${fu.restantes!=null?' Tentativas restantes: '+fu.restantes+'.':''}</p>`;
  return h;
 }
 const auditoriaHtml=a=>`<ul class="lista-simples">${a.erros.map(x=>`<li class="erro">✖ ${t(x)}</li>`).join('')}${a.avisos.map(x=>`<li>⚠ ${t(x)}</li>`).join('')}${a.ok&&!a.avisos.length?'<li>✔ Sem clichês, urgência ou promessas.</li>':''}<li><small>${a.tamanho} caracteres</small></li></ul>`;
 function analiseHtml(e){
  const a=analise,r=a.principal?responderObjecao(a,contextoResposta(estado(),e)):null;
  return `<article class="cartao-exp"><p class="ajuda">${t(a.aviso)}</p><p><b>Leitura:</b> ${a.principal?t(a.principal.rotulo):'sem objeção específica detectada'} · interesse ${t(a.interesse)} · estado sugerido: ${t(rotuloEstadoConversa(a.estadoSugerido||'resposta-recebida'))}${a.ambigua?' · <b>ambígua</b>':''}</p>${a.hipoteses.length?`<ul>${a.hipoteses.map(x=>`<li>${t(x.texto)} <small>(confiança ${t(x.confianca)})</small></li>`).join('')}</ul>`:''}${a.naoSabemos?.length?`<p><b>O que não sabemos:</b> ${a.naoSabemos.map(t).join(' · ')}</p>`:''}${a.perguntasEsclarecedoras?.length?`<p><b>Pergunte:</b> ${a.perguntasEsclarecedoras.map(t).join(' / ')}</p>`:''}
  ${r?(r.naoInsistir?`<div class="alerta-risco"><strong>Recusa:</strong> não insista. ${t(r.principal.texto)}</div>`:['principal','curta','direta'].map(k=>`<label class="campo largo"><span>Resposta ${k}</span><textarea rows="3" readonly>${t(r[k].texto)}</textarea><small>${r[k].auditoria.ok?'✔ linguagem ok':'⚠ '+t(r[k].auditoria.erros.join(' '))}</small></label>`).join('')):''}
  <p><b>Evitar:</b> ${t(a.evitar||'')} · <b>Encerrar quando:</b> ${t(a.quandoEncerrar||'')}</p>
  <div class="acoes-linha"><button class="botao-principal" type="button" data-m="conversao.registrar-resposta">Registrar esta resposta no CRM</button></div></article>`;
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
 const tabs={fila,conversa,objecoes:objecoesAba,valor,lab,funil,memoria,treino,evidencias,config};
 function abrir(a=aba,id){
  aba=a;if(id)empId=id;
  abrirPainel('Da primeira mensagem ao fechamento, com método',`<div class="abas" role="tablist">${abas.map(([k,n])=>`<button type="button" role="tab" aria-selected="${aba===k}" class="${aba===k?'ativa':''}" data-m="conversao.aba" data-id="${k}">${n}</button>`).join('')}</div>${tabs[aba]()}`,'ÓRBITA CONVERSÃO');
  const q=s=>document.querySelector(s),f=(s,fn)=>q(s)?.addEventListener('submit',ev=>{ev.preventDefault();try{fn(dadosForm(ev.currentTarget),ev.currentTarget);}catch(x){avisar(x.message);}});
  q('#cv-emp')?.addEventListener('change',ev=>{empId=ev.target.value;abSel='';analise=null;abrir(aba);});
  q('#cv-cen')?.addEventListener('change',ev=>{cenSel=ev.target.value;avalTreino=null;respTreino='';abrir('treino');});
  q('#cv-texto')?.addEventListener('input',ev=>{const a=auditarMensagem(ev.target.value,{primeiraMensagem:true});q('#cv-audit').innerHTML=auditoriaHtml(a);});
  f('#cv-resp',d=>{textoResposta=d.texto;analise=analisarResposta(d.texto);abrir('conversa');});
  f('#cv-fb',d=>{const s=sugestoesDeFeedback(d.texto);q('#cv-fb-out').innerHTML=Array.isArray(s)?`<ul>${s.map(x=>`<li>${t(typeof x==='string'?x:x.texto||x.ajuste||JSON.stringify(x))}</li>`).join('')}</ul>`:`<p>${t(s.aviso||s.texto||'Sem ajustes concretos: o feedback é vago. Pergunte o que mais chamou atenção.')}</p>${(s.sugestoes||s.ajustes||[]).map(x=>`<p>• ${t(typeof x==='string'?x:x.texto||x.ajuste)}</p>`).join('')}`;});
  f('#cv-exp',d=>{const ab=g=>({nome:g,abordagem:g});const x=criarExperimentoConversao(estado(),{nome:d.nome,hipotese:d.hipotese,criterio:d.criterio,variantes:[ab(d.a),ab(d.b)],nMinimoPorVariante:Number(d.min)||20,nicho:d.nicho.trim()});if(d.a===d.b){estado().experimentos.pop();throw Error('Escolha duas abordagens diferentes.');}salvar();avisar('Experimento criado. Nenhuma empresa foi sorteada ainda.');abrir('lab');});
  f('#cv-est',d=>{const n=k=>d[k]===''?null:Math.max(0,Number(d[k])||0);conv(estado()).estimativa={contatos:n('contatos'),semResposta:n('semResposta'),respondeuSumiu:n('respondeuSumiu'),recusas:n('recusas'),informadaEm:new Date().toISOString(),tipo:'estimativa-do-usuario'};salvar();avisar('Guardada como hipótese. Não entra nas métricas reais.');abrir('funil');});
  f('#cv-follow',d=>{const iv=d.intervalos.split(',').map(x=>Number(x.trim())).filter(x=>x>=1&&x<=90);if(!iv.length)throw Error('Informe ao menos um intervalo em dias (1 a 90).');const cf=conv(estado()).config.follow;cf.intervalosDias=iv;cf.maxTentativas=Math.min(6,Math.max(1,Number(d.max)||3));salvar();avisar('Limites salvos.');abrir('config');});
  f('#cv-cons',d=>{const e2=emp();if(d.estado==='revogado'&&!confirmar('Revogar bloqueia o contato com esta empresa. Continuar?'))return;registrarConsentimento(estado(),e2,d.canal,{estado:d.estado,origem:d.origem,nota:'registrado por você'});salvar();avisar('Consentimento registrado.');abrir('config');});
  f('#cv-treino',d=>{respTreino=d.resp;const c=cenarios.find(x=>x.id===cenSel);avalTreino=avaliarTreino(c,d.resp);registrarTreino(estado(),c.id,d.resp,avalTreino);salvar();abrir('treino');});
 }
 const acoes={
  aba:id=>abrir(id),
  'abrir-conversa':id=>{abSel='';analise=null;abrir('conversa',id);},
  abordagem:id=>{abSel=id;abrir('conversa');},
  copiar:async()=>{const v=document.querySelector('#cv-texto')?.value||'';try{await navigator.clipboard.writeText(v);avisar('Copiado. Nada foi registrado como enviado.');}catch{avisar('Selecione o texto e copie manualmente.');}},
  whatsapp:()=>{const e=emp(),v=document.querySelector('#cv-texto')?.value||'';const l=linkWhatsapp(e.whatsapp||e.telefone,v);if(!l)return avisar('Cadastre um WhatsApp válido com DDD na empresa.');abrirExterno(l);avisar('WhatsApp aberto com o texto. Nada foi registrado como enviado: confirme depois de enviar.');},
  rascunho:()=>{const e=emp(),v=document.querySelector('#cv-texto')?.value||'';if(!v.trim())return;conv(estado()).rascunhos.push({id:novoId(),empresaId:e.id,texto:v,abordagem:abSel,origem:'usuario',criadoEm:new Date().toISOString(),enviado:false,auditoria:auditarMensagem(v,{primeiraMensagem:true})});salvar();avisar('Rascunho salvo (não enviado).');},
  enviei:id=>{const e=emp(),v=document.querySelector('#cv-texto')?.value||'',est=estado(),perm=podeContatar(e,'whatsapp');if(!perm.ok)return avisar(perm.motivo);
   const aud=auditarMensagem(v,{primeiraMensagem:!eventosDaEmpresa(est,e.id,'mensagem-enviada').length});if(!aud.ok&&!confirmar('A auditoria encontrou problemas:\n- '+aud.erros.join('\n- ')+'\n\nRegistrar mesmo assim?'))return;
   if(perm.nivel==='sem-registro'&&!confirmar('Não há consentimento registrado para esta empresa neste canal. Um número publicado não é consentimento. Você confirma que está fazendo um contato comercial legítimo e que vai respeitar um pedido para parar?'))return;
   const ab=gerarAbordagens(est,e).abordagens.find(a=>a.id===id),exp=est.experimentos.filter(x=>x.conv&&x.ativo).map(x=>({x,a:x.atribuicoes.find(a=>a.empresaId===e.id&&!a.enviada)})).find(o=>o.a);
   let expId='',varId='';if(exp){const vr=exp.x.variantes.find(v=>v.id===exp.a.varianteId);if(vr?.abordagem===ab.estrategia){expId=exp.x.id;varId=vr.id;exp.a.enviada=true;}else if(confirmar('Esta empresa foi sorteada para outra abordagem. Registrar um DESVIO do experimento e seguir sem contá-la como enviada nele?'))registrarDesvio(est,exp.x,`${e.nome}: enviada abordagem ${ab.estrategia} em vez de ${vr?.abordagem}`);else return;}
   confirmarEnvioMensagem(est,e,{texto:v,estrategia:ab.estrategia,variante:varId,tipo:'conversao-'+id,experimentoId:expId});registrarRecomendacao(est,recomendarAbordagem(est,e));
   if(confirmar('Agendar retorno em '+(conv(est).config.follow.intervalosDias[0])+' dias se não houver resposta?')){const q=somarDias(conv(est).config.follow.intervalosDias[0]);e.retornoEm=q;est.lembretes.push({id:novoId(),titulo:'Retomar conversa · '+e.nome,quando:q,empresa:e.id,concluido:false,origem:'conversao'});est.notificacoesLidas=false;}
   salvar();avisar('Envio registrado (confirmado por você).');abrir('conversa');},
  'registrar-resposta':()=>{const e=emp(),a=analise;if(!a)return;registrarResposta(estado(),e,{texto:a.texto,interesse:a.interesse,pediuDemo:!!a.pediuDemo,naoReceber:!!a.pediuParar,recusou:!!a.recusaClara});salvar();analise=null;textoResposta='';avisar(a.pediuParar?'Resposta registrada e contato bloqueado (pediu para parar).':'Resposta registrada. O estado da conversa foi atualizado com base nos eventos.');abrir('conversa');},
  sortear:id=>{const x=estado().experimentos.find(y=>y.id===id),el=elegiveis(estado(),x);if(!confirmar(`Sortear ${el.length} empresa(s) entre as variantes? O sorteio é registrado e não pode ser refeito para as mesmas empresas. Nenhuma mensagem será enviada.`))return;distribuir(estado(),x,el.map(e=>e.id));salvar();avisar('Empresas distribuídas. Abra cada uma na aba Conversa; a abordagem sorteada será usada.');abrir('lab');},
  analisar:id=>{const x=estado().experimentos.find(y=>y.id===id);resultadoExperimentoConversao(estado(),x,{registrarOlhada:true});salvar();abrir('lab');},
  desvio:id=>{const m=window.prompt('Descreva o desvio do protocolo:','');if(!m)return;registrarDesvio(estado(),estado().experimentos.find(y=>y.id===id),m);salvar();abrir('lab');},
  'encerrar-exp':id=>{const x=estado().experimentos.find(y=>y.id===id);if(!confirmar('Encerrar este experimento? Os resultados ficam guardados.'))return;x.ativo=false;x.fim=new Date().toISOString();salvar();abrir('lab');}
 };
 return {abrir,acoes};
}
