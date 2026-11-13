/* Espaço de conversa do Órbita Conversão: Contexto da empresa · Estratégia comercial · Compositor de mensagens, na mesma tela. Nada é enviado nem registrado como enviado sem confirmação explícita. */
import {t,campo,dataHora,confirmar,abrirExterno,somarDias} from './util.js';
import {registrarDemonstracaoApresentada,registrarPerda,marcarNaoContatar} from '../nucleo/acoes.js';
import {conv,podeContatar} from '../nucleo/conversao/dominio.js';
import {registrarDesvio,registrarRecomendacao,recomendarAbordagem} from '../nucleo/conversao/laboratorio.js';
import {analisarResposta,contextoResposta,responderObjecao} from '../nucleo/conversao/linguagem.js';
import {montarContexto,montarEstrategia,compor,validarMensagem,tiposMensagem,rotuloOrigem} from '../nucleo/conversao/compositor.js';
import * as F from '../nucleo/conversao/fluxo.js';
import {PAPEIS,adicionarContato,contatosDaEmpresa} from '../nucleo/contatos.js';
import {importarConversaWhatsApp,aplicarMapa,salvarConversa,consolidarConversa} from '../nucleo/negociacao/conversa.js';
const nivelIcone={erro:'✖',aviso:'⚠',info:'ℹ'};
export function criarConversa(ctx,reabrir){
 const {obterEstado,salvar,avisar}=ctx,estado=()=>obterEstado();
 const L={objetivo:'',registrarDemo:false,empId:'',tipo:'auto',alt:0,tamanho:'media',formalidade:'neutra',contatoId:'',demoId:'',expId:'',varExp:'',rascunhoId:'',texto:'',textoBase:'',opcaoNegociacao:'manter',resposta:'',analise:null,previa:null,gerado:null,secao:''};
 const emp=()=>estado().empresas.find(e=>e.id===L.empId)||null;
 const selo=(txt,cl='pausada')=>`<span class="selo-situacao ${cl}">${t(txt)}</span>`;
 function definirEmpresa(id,{tipo='',rascunhoId='',objetivo='',opcaoNegociacao=''}={}){
  if(id&&id!==L.empId){Object.assign(L,{empId:id,tipo:'auto',alt:0,contatoId:'',demoId:'',expId:'',varExp:'',rascunhoId:'',texto:'',textoBase:'',resposta:'',analise:null,previa:null,gerado:null,objetivo:'',registrarDemo:false});}
  if(tipo)L.tipo=tipo;if(opcaoNegociacao)L.opcaoNegociacao=opcaoNegociacao;if(objetivo)L.objetivo=objetivo;
  const e=emp();if(e&&!L.demoId&&ctx.demoPreferida){L.demoId=ctx.demoPreferida.demoId;L.registrarDemo=true;}
  if(rascunhoId){const r=estado().rascunhos.find(x=>x.id===rascunhoId);if(r){L.empId=r.empresa;L.rascunhoId=r.id;L.texto=r.texto;L.textoBase=r.textoSugerido||r.texto;L.tipo=r.tipo||'auto';L.contatoId=r.contatoId||'';}}
 }
 function gerar(){const e=emp();if(!e)return;const est=estado(),exp=est.experimentos.find(x=>x.id===L.expId)||null;
  const c=compor(est,e,{tipo:L.tipo,tamanho:L.tamanho,formalidade:L.formalidade,demoId:L.demoId,experimento:exp,varianteExperimento:L.varExp,opcaoNegociacao:L.opcaoNegociacao,objetivo:L.objetivo});L.gerado=c;
  if(!L.rascunhoId&&c.alternativas.length){const a=c.alternativas[Math.min(L.alt,c.alternativas.length-1)];L.texto=a.texto;L.textoBase=a.texto;}
 }
 const pendentes=()=>F.pendentesDeConfirmacao(estado(),L.empId);
 /* ---------- contexto ---------- */
 function htmlContexto(e){
  const c=montarContexto(estado(),e),r=c.resumo,tl=r.linhaDoTempo.slice(-6).reverse();
  return `<ul class="cv-campos">${c.campos.filter(x=>x.valor||x.origem==='desconhecida').map(x=>`<li><b>${t(x.rotulo)}:</b> ${x.valor?t(x.valor):'<em>não informado</em>'} <small class="origem o-${x.origem}">${t(rotuloOrigem(x.origem))}</small></li>`).join('')}</ul>
  <h5>Contatos</h5>${c.contatos.length?`<ul class="cv-campos">${c.contatos.map(k=>`<li><b>${t(k.rotulo)}</b>${k.nome?' · '+t(k.nome):''}: ${t(k.norm.estruturaValida?k.norm.exibicao:k.numero)} <small class="origem ${k.norm.estruturaValida?'o-usuario':'o-desconhecida'}">${k.norm.estruturaValida?'estrutura válida':'inválido'} · WhatsApp ${k.whatsappConfirmado?'confirmado':'não confirmado'}${k.origem?' · origem: '+t(k.origem):''}</small></li>`).join('')}</ul>`:'<p class="ajuda">Nenhum número cadastrado.</p>'}
  <details><summary>Adicionar contato</summary><form id="cv-novo-contato" class="grade-formulario">${campo('papel','Papel','outro',{opcoes:PAPEIS})}${campo('nome','Nome','')}${campo('numero','Número com DDD','',{obrigatorio:true})}${campo('origem','Origem da informação','',{dica:'Obrigatória para proprietário, sócio e responsável comercial.'})}<button type="submit">Salvar contato</button></form></details>
  <p><b>Oferta vigente:</b> ${c.oferta?`R$ ${(c.oferta.precoCent/100).toLocaleString('pt-BR')} · Pix R$ ${(c.oferta.pixCent/100).toLocaleString('pt-BR')} · até ${c.oferta.parcelas}x · ${c.oferta.suporteDias} dias de suporte`:'—'}</p>
  <p><b>Demonstração:</b> ${r.demonstracao.publicada?`<a href="${t(r.demonstracao.urlPublica)}" target="_blank" rel="noopener noreferrer">publicada</a> (${r.demonstracao.apresentada?'apresentada em '+t(dataHora(r.demonstracao.ultimaApresentacao)):'ainda não apresentada'})`:r.demonstracao.existe?'criada, ainda não publicada':'não criada'}</p>
  <p><b>Última interação:</b> ${r.ultima?`${r.ultima.autor==='eu'?'você':'cliente'} · ${t(dataHora(r.ultima.quando))}`:'nenhuma'} · <b>Aguardando:</b> ${r.aguardando==='eu'?'você':r.aguardando==='cliente'?'o cliente':'—'} · <b>Próxima ação cadastrada:</b> ${t(e.proximaAcao||'—')}</p>
  <p><b>Respostas:</b> ${r.contagens.recebidas} · <b>Objeções registradas:</b> ${r.contagens.objecoes} · <b>Propostas:</b> ${r.propostas.length}</p>
  <h5>Histórico</h5>${tl.length?`<ol class="linha-do-tempo">${tl.map(x=>`<li class="${x.confirmado?'':'rascunho'}"><small>${t(dataHora(x.quando))} · ${x.autor==='eu'?'você':x.autor==='cliente'?'cliente':'sistema'} · ${t(x.tipo)}${x.confirmado?'':' · <b>NÃO ENVIADO</b>'}${x.meta?.quandoEstimado?' (data estimada)':''}</small><p>${t(x.texto).replace(/\n/g,'<br>')}</p>${x.tipo==='mensagem-enviada'&&x.confirmado&&String(x.id).length>8?`<button type="button" class="pequeno" data-m="conversao.corrigir-texto" data-id="${t(x.id)}">Corrigir texto enviado</button>`:''}</li>`).join('')}</ol>`:'<p class="vazio">Sem histórico ainda.</p>'}
  <details><summary>Linha do tempo completa e leitura do contexto</summary>${leituraHtml(e)}</details>
  <details><summary>Importar conversa do WhatsApp</summary>${importarHtml(e)}</details>`;
 }
 function leituraHtml(e){
  const est=montarEstrategia(estado(),e);
  return est.leituras.length?est.leituras.map(l=>`<article class="cartao-exp"><h6>${t(l.categoria)} · confiança ${t(l.confianca)}</h6><p><b>Fato:</b> ${t(l.fato)}</p><p><b>Hipótese:</b> ${t(l.hipotese)}</p>${l.faltam?.length?`<p><b>Falta saber:</b> ${l.faltam.map(t).join('; ')}</p>`:''}${l.alternativas?.length?`<p><b>Alternativas:</b> ${l.alternativas.map(t).join('; ')}</p>`:''}</article>`).join(''):'<p class="ajuda">Sem leituras: não há histórico de conversa.</p>';
 }
 function importarHtml(e){
  let h=`<p class="ajuda">Cole a conversa copiada do WhatsApp. O original é preservado e o que for incerto fica marcado para revisão. Importar não envia nada.</p><form id="cv-imp"><label class="campo largo"><span>Conversa</span><textarea name="texto" rows="6" maxlength="60000" placeholder="12/11/2026 14:35 - Nome: mensagem"></textarea></label>${campo('meu','Seu nome na conversa','')}<button type="submit">Analisar conversa</button></form>`;
  const p=L.previa;if(p){h+=p.avisos.map(a=>`<div class="alerta-duplicidade" role="note">${t(a)}</div>`).join('')+`<form id="cv-mapa" class="grade-formulario">${p.participantes.map(n=>`<label class="campo"><span>“${t(n)}” é…</span><select name="${t(n)}"><option value="">Selecione</option><option value="eu" ${p.mapa[n]==='eu'?'selected':''}>Eu</option><option value="cliente" ${p.mapa[n]==='cliente'?'selected':''}>O cliente</option></select></label>`).join('')}<button type="submit">Aplicar</button></form><ol class="linha-do-tempo">${p.mensagens.map(m=>`<li class="${m.revisar?'rascunho':''}"><small>${t(m.autor)}${m.quandoTexto?' · '+t(m.quandoTexto):''}${m.revisar?' · <b>REVISAR</b>: '+m.motivosRevisao.map(t).join(' '):''}</small><p>${t(m.texto).replace(/\n/g,'<br>')}</p></li>`).join('')}</ol><label class="campo largo"><span><input type="checkbox" id="cv-conf-imp"> Confirmo que esta é a conversa real com esta empresa</span></label><div class="acoes-linha"><button type="button" class="botao-principal" data-m="conversao.salvar-conversa" ${p.precisaRevisao?'disabled':''}>Salvar conversa</button></div>`;}
  const salvas=estado().conversas.filter(c=>c.empresaId===e.id);if(salvas.length)h+=`<h6>Conversas salvas</h6>${salvas.map(c=>`<p>${t(dataHora(c.importadaEm))} · ${c.mensagens.length} mensagens · ${c.consolidada?'consolidada':'<button type="button" data-m="conversao.consolidar" data-id="'+t(c.id)+'">Consolidar em eventos reais</button>'}</p>`).join('')}`;
  return h;
 }
 /* ---------- estratégia ---------- */
 function htmlEstrategia(e){
  const x=montarEstrategia(estado(),e);
  return `${x.bloqueio?`<div class="alerta-risco"><strong>Contato bloqueado:</strong> ${t(x.bloqueio)}</div>`:''}
  <p><b>Estágio:</b> ${t(x.estagio.rotulo)} · <b>Objetivo imediato:</b> ${t(x.objetivo)}</p>
  <p><b>Ação recomendada: ${t(x.acao.rotulo)}.</b> ${t(x.acao.porque)}</p>
  <p><b>Estratégia de abordagem:</b> ${t(x.abordagem.nome||x.abordagem.id)} <small>(${x.abordagem.modo==='regra-fixa'?'regra fixa explicada':'estimativa dos seus resultados'})</small><br>${t(x.abordagem.porque)}</p>
  ${x.proximoPasso?`<p><b>Próximo passo:</b> ${t(x.proximoPasso)}</p>`:''}
  ${x.acao.id==='negociar'?'<div class="acoes-linha"><button type="button" data-m="conversao.ofertas">Analisar o pedido de desconto (Ofertas)</button></div>':''}
  <details><summary>Evidências, limitações e alternativas</summary>
   ${x.abordagem.tecnicas.length?`<p><b>Técnicas:</b> ${x.abordagem.tecnicas.map(k=>t(k.nome)+' ('+t(k.grau)+')').join('; ')}</p>`:''}
   ${x.abordagem.evidencias.length?`<ul>${x.abordagem.evidencias.map(v=>`<li>${t(v.ref)} — <em>${t(v.grau)}</em>. Limitações: ${t(v.limitacoes)}</li>`).join('')}</ul>`:''}
   <p><b>Limitações:</b> ${x.limitacoes.map(t).join(' · ')}</p>${x.abordagem.pontosNegativos.length?`<p><b>Pontos negativos desta abordagem:</b> ${x.abordagem.pontosNegativos.map(t).join(' · ')}</p>`:''}
   ${x.riscos.length?`<p><b>Riscos / evitar:</b> ${x.riscos.map(t).join(' · ')}</p>`:''}${x.faltantes.length?`<p><b>Dados faltantes:</b> ${x.faltantes.map(t).join(' · ')}</p>`:''}
   <p><b>Por que não as outras ações:</b></p><ul>${x.descartadas.slice(0,8).map(d=>`<li>${t(d.rotulo)}: ${t(d.motivo)}</li>`).join('')}</ul></details>`;
 }
 /* ---------- compositor ---------- */
 const bolha=txt=>`<div class="cv-previa" aria-label="Prévia da mensagem"><div class="bolha">${t(txt).replace(/\n/g,'<br>')||'<em>(vazia)</em>'}</div></div>`;
 const validacaoHtml=v=>`<div id="cv-valid"><p class="ajuda">${v.caracteres} caracteres · qualidade textual <b>${v.qualidade.nota}/100</b> <small>(${t(v.qualidade.aviso)})</small></p><ul class="lista-simples">${v.problemas.map(p=>`<li class="${p.nivel==='erro'?'erro':''}">${nivelIcone[p.nivel]} ${t(p.texto)}</li>`).join('')||'<li>✔ Nenhum problema factual ou de linguagem encontrado.</li>'}</ul></div>`;
 function htmlConfirmacao(e){
  const p=pendentes();if(!p.length)return '';const r=p[0];
  return `<div class="alerta-duplicidade" role="alertdialog" aria-label="Confirmar envio"><strong>Você enviou a mensagem?</strong> O WhatsApp foi aberto${r.contatoRotulo?' para '+t(r.contatoRotulo):''} (${t(r.numero||'')}). Só a sua confirmação registra o envio.<label class="campo largo"><span>Texto exatamente como foi enviado (edite se mudou no WhatsApp)</span><textarea id="cv-texto-enviado" rows="4" maxlength="4000">${t(r.texto)}</textarea></label>
   <label><input type="checkbox" id="cv-agendar" checked> Agendar retorno em ${t(String(conv(estado()).config.follow.intervalosDias[0]))} dias se não houver resposta</label>${demoSel(e,true)}
   <div class="acoes-linha"><button type="button" class="botao-principal" data-m="conversao.confirmar-envio" data-id="${t(r.id)}">Sim, enviei</button><button type="button" data-m="conversao.cancelar-envio" data-id="${t(r.id)}">Não enviei (cancelar)</button><button type="button" data-m="conversao.manter-pendente">Decidir depois</button></div></div>`;
 }
 const demoSel=(e,confirmacao)=>{const demos=estado().demonstracoes.filter(d=>d.empresaId===e.id);if(!demos.length)return '';const d=demos.find(x=>x.id===L.demoId)||demos.find(x=>x.urlPublica)||demos[0];
  if(confirmacao)return `<label><input type="checkbox" id="cv-reg-demo" ${L.registrarDemo?'checked':''}> Registrar que a demonstração${d?.urlPublica?' (link publicado)':''} foi apresentada nesta mensagem</label>`;
  return `<label class="campo"><span>Demonstração relacionada</span><select id="cv-demo">${['',...demos.map(x=>x.id)].map(id=>`<option value="${t(id)}" ${id===(L.demoId||'')?'selected':''}>${id?t(demos.find(x=>x.id===id).nome||id):'(nenhuma)'}</option>`).join('')}</select></label>`;};
 function htmlCompositor(e){
  const est=estado(),c=L.gerado,alt=c?.alternativas||[],perm=podeContatar(e,'whatsapp'),cs=contatosDaEmpresa(e),exps=est.experimentos.filter(x=>x.ativo&&!x.conv);
  const v=validarMensagem(est,e,L.texto,{contatoId:L.contatoId,demoId:L.demoId});
  const contatoSel=cs.length?`<label class="campo"><span>Enviar para</span><select id="cv-contato">${cs.map(k=>`<option value="${t(k.id)}" ${k.id===(L.contatoId||cs.find(x=>x.norm.estruturaValida)?.id)?'selected':''}>${t(k.rotulo)}${k.nome?' · '+t(k.nome):''} — ${t(k.norm.estruturaValida?k.norm.exibicao:k.numero+' (inválido)')}</option>`).join('')}</select></label>`:'<p class="ajuda">Cadastre um número para abrir o WhatsApp.</p>';
  return `${htmlConfirmacao(e)}${!perm.ok?`<div class="alerta-risco"><strong>Envio bloqueado:</strong> ${t(perm.motivo)}</div>`:''}
  <div class="grade-formulario"><label class="campo"><span>Situação / tipo de mensagem</span><select id="cv-tipo"><option value="auto" ${L.tipo==='auto'?'selected':''}>Automático — pelo contexto da conversa</option>${tiposMensagem.map(([k,n])=>`<option value="${k}" ${L.tipo===k?'selected':''}>${t(n)}</option>`).join('')}</select></label>
  <label class="campo"><span>Tamanho</span><select id="cv-tam">${[['curta','Curta'],['media','Média'],['detalhada','Detalhada']].map(([k,n])=>`<option value="${k}" ${L.tamanho===k?'selected':''}>${n}</option>`).join('')}</select></label><label class="campo"><span>Tom</span><select id="cv-tom">${[['informal','Informal'],['neutra','Neutro'],['formal','Formal']].map(([k,n])=>`<option value="${k}" ${L.formalidade===k?'selected':''}>${n}</option>`).join('')}</select></label>
  ${exps.length?`<label class="campo"><span>Experimento (opcional)</span><select id="cv-exp-leg"><option value="">(nenhum)</option>${exps.map(x=>`<option value="${t(x.id)}" ${x.id===L.expId?'selected':''}>${t(x.nome)}</option>`).join('')}</select></label>`:''}</div>
  ${c?.aguardar?`<div class="alerta-duplicidade" role="note"><b>Melhor ação agora: aguardar.</b> ${t(c.motivoAguardar||'')} Você ainda pode escolher uma situação acima para escrever mesmo assim.</div>`:''}
  ${alt.length?`<div class="abas" role="tablist" aria-label="Alternativas de mensagem">${alt.map((a,i)=>`<button type="button" role="tab" aria-selected="${L.alt===i}" class="${L.alt===i?'ativa':''}" data-m="conversao.alternativa" data-id="${i}">${t(a.rotulo)}</button>`).join('')}</div>${alt[L.alt]?`<p class="ajuda">${t(alt[L.alt].porque||'')}</p>`:''}`:''}
  <label class="campo largo"><span>Mensagem (edite à vontade)</span><textarea id="cv-texto" rows="6" maxlength="4000">${t(L.texto)}</textarea></label>
  <div id="cv-validacao">${validacaoHtml(v)}</div><div id="cv-previa">${bolha(L.texto)}</div>
  ${contatoSel}${demoSel(e,false)}
  <div class="acoes-linha"><button type="button" data-m="conversao.regerar">Gerar outra sugestão</button><button type="button" data-m="conversao.copiar">Copiar</button><button type="button" data-m="conversao.rascunho">Salvar rascunho</button><button type="button" class="botao-principal" data-m="conversao.whatsapp" ${perm.ok?'':'disabled'}>Abrir WhatsApp e enviar</button></div>
  <p class="ajuda">O WhatsApp abre com o texto preenchido. <b>Nada é enviado por aqui</b>; depois você confirma se enviou.</p>
  ${rascunhosHtml(e)}${respostaHtml(e)}${resultadoHtml(e)}`;
 }
 function rascunhosHtml(e){const rs=estado().rascunhos.filter(r=>r.empresa===e.id&&!['envio-confirmado','resposta-registrada','encerrada'].includes(r.estadoMensagem));return rs.length?`<details><summary>Rascunhos desta empresa (${rs.length})</summary>${rs.map(r=>`<p><small>${t(F.rotuloEstadoMensagem(r.estadoMensagem))} · ${t(dataHora(r.quando))}</small><br>${t(r.texto.slice(0,160))}${r.texto.length>160?'…':''} <button type="button" class="pequeno" data-m="conversao.usar-rascunho" data-id="${t(r.id)}">Abrir</button> <button type="button" class="pequeno" data-m="conversao.excluir-rascunho" data-id="${t(r.id)}">Excluir</button></p>`).join('')}</details>`:'';}
 function respostaHtml(e){
  const a=L.analise,r=a?.principal?responderObjecao(a,contextoResposta(estado(),e,{demo:estado().demonstracoes.find(d=>d.empresaId===e.id&&d.urlPublica)||null,autor:estado().preferencias.nome||'Renan'})):null;
  return `<h4>Quando o cliente responder</h4><form id="cv-resp"><label class="campo largo"><span>Cole a resposta recebida</span><textarea name="texto" rows="3" maxlength="2000">${t(L.resposta)}</textarea></label><button type="submit">Interpretar resposta</button></form>
  ${a?`<article class="cartao-exp"><p class="ajuda">${t(a.aviso)}</p><p><b>Leitura:</b> ${a.principal?t(a.principal.rotulo):'sem objeção específica'} · interesse ${t(a.interesse)}${a.ambigua?' · <b>ambígua</b>':''}</p>${a.hipoteses.length?`<ul>${a.hipoteses.map(h=>`<li>${t(h.texto)} <small>(confiança ${t(h.confianca)})</small></li>`).join('')}</ul>`:''}${a.naoSabemos?.length?`<p><b>Não sabemos:</b> ${a.naoSabemos.map(t).join(' · ')}</p>`:''}${a.perguntasEsclarecedoras?.length?`<p><b>Pergunte:</b> ${a.perguntasEsclarecedoras.map(t).join(' / ')}</p>`:''}
   ${r?(r.naoInsistir?`<div class="alerta-risco"><strong>Recusa:</strong> não insista. ${t(r.principal.texto)}</div>`:['principal','curta','direta'].map(k=>`<label class="campo largo"><span>Resposta ${k}</span><textarea rows="3" readonly>${t(r[k].texto)}</textarea><small>${r[k].auditoria.ok?'✔ linguagem ok':'⚠ '+t(r[k].auditoria.erros.join(' '))}</small><button type="button" class="pequeno" data-m="conversao.usar-resposta" data-id="${k}">Usar no compositor</button></label>`).join('')):''}
   <div class="acoes-linha"><button type="button" class="botao-principal" data-m="conversao.registrar-resposta">Registrar resposta no CRM</button><button type="button" data-m="conversao.proxima">Preparar a próxima mensagem</button></div></article>`:''}`;
 }
 function resultadoHtml(e){return `<details><summary>Registrar resultado da conversa</summary><div class="acoes-linha"><button type="button" data-m="conversao.resultado" data-id="proposta">Ir para Ofertas e propostas</button><button type="button" data-m="conversao.resultado" data-id="perdida">Registrar como perdida…</button><button type="button" data-m="conversao.resultado" data-id="nao-contatar">Marcar como não contatar</button><button type="button" data-m="conversao.resultado" data-id="encerrar">Encerrar a conversa (mantém o histórico)</button></div></details>`;}
 /* ---------- renderização ---------- */
 function html(){
  const est=estado(),sel=`<label class="campo"><span>Empresa</span><select id="cv-emp"><option value="">Selecione…</option>${est.empresas.filter(e=>e.situacao!=='excluida').map(e=>`<option value="${t(e.id)}" ${e.id===L.empId?'selected':''}>${t(e.nome)} · ${t(e.cidade)}${e.situacao==='nao-contatar'?' (não contatar)':''}</option>`).join('')}</select></label>`;
  const e=emp();if(!e)return `<form id="cv-sel">${sel}</form><p class="vazio">Escolha uma empresa para ver o contexto, a estratégia e preparar a mensagem. Ou abra a <b>Fila</b> para escolher por prioridade.</p>`;
  if(!L.gerado)gerar();
  const aberto=window.innerWidth>=900;
  return `<form id="cv-sel">${sel}</form><div class="cv-ws"><div class="cv-lado"><details class="cv-area" ${aberto?'open':''}><summary><h3>Contexto da empresa</h3></summary>${htmlContexto(e)}</details><details class="cv-area" open><summary><h3>Estratégia comercial</h3></summary>${htmlEstrategia(e)}</details></div><section class="cv-compositor" aria-label="Compositor de mensagens"><h3>Compositor de mensagens</h3>${htmlCompositor(e)}</section></div>`;
 }
 function ligar(q,f){
  q('#cv-tipo')?.addEventListener('change',ev=>{L.tipo=ev.target.value;L.objetivo='';L.rascunhoId='';L.alt=0;L.gerado=null;L.texto='';reabrir();});
  q('#cv-tam')?.addEventListener('change',ev=>{L.tamanho=ev.target.value;L.rascunhoId='';L.gerado=null;L.texto='';reabrir();});
  q('#cv-tom')?.addEventListener('change',ev=>{L.formalidade=ev.target.value;L.rascunhoId='';L.gerado=null;L.texto='';reabrir();});
  q('#cv-exp-leg')?.addEventListener('change',ev=>{L.expId=ev.target.value;const x=estado().experimentos.find(k=>k.id===L.expId);L.varExp=x?x.variantes.slice().sort((a,b)=>estado().eventos.filter(v=>v.experimentoId===x.id&&v.variante===a.id).length-estado().eventos.filter(v=>v.experimentoId===x.id&&v.variante===b.id).length)[0].id:'';L.rascunhoId='';L.gerado=null;L.texto='';reabrir();});
  q('#cv-demo')?.addEventListener('change',ev=>{L.demoId=ev.target.value;L.registrarDemo=!!ev.target.value;L.gerado=null;if(!L.rascunhoId)L.texto='';reabrir();});
  q('#cv-contato')?.addEventListener('change',ev=>{L.contatoId=ev.target.value;atualizarValidacao(q);});
  q('#cv-texto')?.addEventListener('input',ev=>{L.texto=ev.target.value;atualizarValidacao(q);});
  f('#cv-resp',d=>{L.resposta=d.texto;L.analise=analisarResposta(d.texto);reabrir();});
  f('#cv-imp',d=>{L.previa=importarConversaWhatsApp(d.texto,{meuNome:d.meu.trim()||(estado().preferencias.nome||''),nomeCliente:emp().contato||''});reabrir();});
  f('#cv-mapa',d=>{L.previa=aplicarMapa(L.previa,Object.fromEntries(Object.entries(d).filter(([,v])=>v)));reabrir();});
  f('#cv-novo-contato',d=>{adicionarContato(emp(),{papel:d.papel,nome:d.nome,numero:d.numero,origem:d.origem});salvar();avisar('Contato salvo.');reabrir();});
 }
 function atualizarValidacao(q){const e=emp();const v=validarMensagem(estado(),e,L.texto,{contatoId:L.contatoId,demoId:L.demoId});q('#cv-validacao').innerHTML=validacaoHtml(v);q('#cv-previa').innerHTML=bolha(L.texto);}
 /* ---------- ações ---------- */
 const textoAtual=()=>document.querySelector('#cv-texto')?.value??L.texto;
 function rascunhoAtual(alt){const e=emp(),a=L.gerado?.alternativas?.[L.alt];L.texto=textoAtual();
  const r=F.salvarRascunho(estado(),e,{id:L.rascunhoId,texto:L.texto,tipo:a?.tipo||(L.tipo==='auto'?'':L.tipo),variante:a?.variante??0,estrategia:a?.estrategia||'',alternativa:a?.rotulo||'',porque:a?.porque||'',auditoria:validarMensagem(estado(),e,L.texto).auditoria,experimentoId:a?.experimentoId||L.expId,contatoId:L.contatoId||document.querySelector('#cv-contato')?.value||'',textoSugerido:L.textoBase||a?.texto||''});L.rascunhoId=r.id;return r;}
 const acoes={
  ofertas:()=>ctx.modulos.ofertas.abrir(emp().id,'negociar'),
  alternativa:i=>{L.alt=Number(i);const a=L.gerado.alternativas[L.alt];L.rascunhoId='';L.texto=a.texto;L.textoBase=a.texto;reabrir();},
  regerar:()=>{L.rascunhoId='';L.texto='';L.gerado=null;L.alt=0;const x=estado().experimentos.find(k=>k.id===L.expId);if(x&&x.variantes.length>1){const i=x.variantes.findIndex(v=>v.id===L.varExp);L.varExp=x.variantes[(i+1)%x.variantes.length].id;}reabrir();},
  copiar:async()=>{try{const r=rascunhoAtual();F.marcarEstadoMensagem(estado(),r.id,'copiada');salvar();await navigator.clipboard.writeText(L.texto);avisar('Copiado. Nada foi registrado como enviado.');}catch(x){avisar(x.message==='Escreva a mensagem antes de salvar.'?x.message:'Selecione o texto e copie manualmente.');}},
  rascunho:()=>{try{const r=rascunhoAtual();if(r.estadoMensagem==='rascunho')F.marcarEstadoMensagem(estado(),r.id,'preparada');F.voltarParaRascunho(estado(),r.id);salvar();avisar('Rascunho salvo (não enviado).');reabrir();}catch(x){avisar(x.message);}},
  whatsapp:()=>{try{const e=emp(),v=validarMensagem(estado(),e,textoAtual(),{contatoId:L.contatoId,demoId:L.demoId});if(v.problemas.some(p=>p.nivel==='erro')&&!confirmar('Há problemas na mensagem:\n- '+v.problemas.filter(p=>p.nivel==='erro').map(p=>p.texto).join('\n- ')+'\n\nAbrir o WhatsApp mesmo assim?'))return;
   const r=rascunhoAtual(),cid=document.querySelector('#cv-contato')?.value||L.contatoId;if(r.estadoMensagem==='rascunho')F.marcarEstadoMensagem(estado(),r.id,'preparada');const p=F.prepararParaWhatsApp(estado(),e,r,{contatoId:cid});if(!p.ok)return avisar(p.motivo);
   if(p.avisosNumero?.length&&!confirmar(p.avisosNumero.join('\n')+'\n\nAbrir mesmo assim?'))return;
   F.registrarAberturaWhatsApp(estado(),r.id,{contato:p.contato,numero:p.numero});salvar();abrirExterno(p.url);avisar('WhatsApp aberto com o texto. Nada foi registrado: confirme abaixo se enviou.'+(p.aviso?' '+p.aviso:''));reabrir();}catch(x){avisar(x.message);}},
  'confirmar-envio':id=>{try{const e=emp(),texto=document.querySelector('#cv-texto-enviado')?.value,dias=document.querySelector('#cv-agendar')?.checked?conv(estado()).config.follow.intervalosDias[0]:null;const r=estado().rascunhos.find(x=>x.id===id);
   const demoSel=document.querySelector('#cv-demo')?.value||L.demoId,reg=document.querySelector('#cv-reg-demo')?.checked&&demoSel;
   const sort=estado().experimentos.filter(x=>x.conv&&x.ativo).map(x=>({x,a:x.atribuicoes.find(a=>a.empresaId===e.id&&!a.enviada)})).find(o=>o.a);
   if(sort&&r.experimentoId!==sort.x.id){if(!confirmar('Esta empresa foi sorteada para outra abordagem no experimento "'+sort.x.nome+'". Registrar um DESVIO do protocolo e seguir (a empresa não conta como enviada nele)?'))return;registrarDesvio(estado(),sort.x,e.nome+': enviada abordagem '+(r.estrategia||'diferente')+' em vez da sorteada');}
   else if(sort&&r.experimentoId===sort.x.id)sort.a.enviada=true;
   const primeira=!estado().eventos.some(v=>v.empresaId===e.id&&v.tipo==='mensagem-enviada');
   const ev=F.confirmarEnvioDoRascunho(estado(),e,id,{texto,retornoDias:dias});if(primeira)registrarRecomendacao(estado(),recomendarAbordagem(estado(),e));
   if(reg){const d=estado().demonstracoes.find(x=>x.id===demoSel);if(d){registrarDemonstracaoApresentada(estado(),e,d,{versaoId:d.versoes?.at(-1)?.id||'',link:d.urlPublica||''});ctx.demoPreferida=null;L.registrarDemo=false;}}
   Object.assign(L,{rascunhoId:'',texto:'',textoBase:'',gerado:null,alt:0});salvar();avisar('Envio registrado (confirmado por você). Pipeline e histórico atualizados.');reabrir();}catch(x){avisar(x.message);}},
  'cancelar-envio':id=>{try{F.cancelarEnvio(estado(),id,{nota:'Usuário informou que não enviou.'});salvar();avisar('Envio cancelado. O rascunho foi mantido.');reabrir();}catch(x){avisar(x.message);}},
  'manter-pendente':()=>{avisar('Mantida pendente: a confirmação continuará aparecendo nesta empresa.');},
  'usar-rascunho':id=>{definirEmpresa('',{rascunhoId:id});L.gerado=null;L.alt=0;reabrir();},
  'excluir-rascunho':id=>{if(!confirmar('Excluir este rascunho? O histórico de mensagens enviadas não é afetado.'))return;const s=estado();s.rascunhos=s.rascunhos.filter(r=>r.id!==id);if(L.rascunhoId===id){L.rascunhoId='';L.texto='';}salvar();reabrir();},
  'corrigir-texto':id=>{const ev=estado().eventos.find(x=>x.id===id);const novo=window.prompt('Texto exatamente como foi enviado no WhatsApp:',ev?.texto||'');if(novo==null)return;try{F.corrigirTextoEnviado(estado(),id,novo);salvar();avisar('Texto corrigido; o anterior ficou guardado no histórico.');reabrir();}catch(x){avisar(x.message);}},
  'registrar-resposta':()=>{const e=emp(),a=L.analise;if(!a)return;const cont=contatosDaEmpresa(e).find(c=>c.id===L.contatoId)||contatosDaEmpresa(e).find(c=>c.norm.estruturaValida);if(a.pediuParar&&!confirmar('Esta resposta pede para parar. O contato será bloqueado. Continuar?'))return;F.registrarRespostaDaConversa(estado(),e,{texto:a.texto,interesse:a.interesse,pediuDemo:!!a.pediuDemo,naoReceber:!!a.pediuParar,recusou:!!a.recusaClara,numero:cont?.norm.e164||''});salvar();L.analise=null;L.resposta='';L.gerado=null;L.rascunhoId='';L.texto='';avisar(a.pediuParar?'Resposta registrada e contato bloqueado.':'Resposta registrada. O estágio da conversa foi atualizado.');reabrir();},
  proxima:()=>{L.analise=null;L.gerado=null;L.rascunhoId='';L.texto='';L.tipo='auto';L.alt=0;reabrir();document.querySelector('.cv-compositor')?.scrollIntoView({behavior:'smooth',block:'start'});},
  'usar-resposta':k=>{const e=emp();const r=responderObjecao(L.analise,contextoResposta(estado(),e,{autor:estado().preferencias.nome||'Renan'}));if(r&&r[k]){L.rascunhoId='';L.texto=r[k].texto;L.textoBase=r[k].texto;reabrir();}},
  resultado:k=>{const e=emp();if(k==='proposta')return ctx.modulos.ofertas.abrir(e.id,'proposta');if(k==='perdida'){const m=window.prompt('Motivo declarado (ou "desconhecido"):','');if(m==null)return;registrarPerda(estado(),e,{motivo:m||'desconhecido',situacao:'perdida'});salvar();avisar('Registrada como perdida.');return reabrir();}if(k==='nao-contatar'){if(!confirmar('Marcar "'+e.nome+'" como não contatar? O envio será bloqueado.'))return;marcarNaoContatar(estado(),e,'Marcado na conversa.');salvar();return reabrir();}if(k==='encerrar'){F.encerrarConversa(estado(),e.id);salvar();avisar('Conversa encerrada; o histórico foi mantido.');reabrir();}},
  'salvar-conversa':()=>{if(!document.querySelector('#cv-conf-imp')?.checked)return avisar('Marque a confirmação.');try{salvarConversa(estado(),emp(),L.previa,{confirmado:true});salvar();L.previa=null;avisar('Conversa salva. Para contar nas métricas, use "Consolidar".');reabrir();}catch(x){avisar(x.message);}},
  consolidar:id=>{const c=estado().conversas.find(x=>x.id===id);if(!confirmar('Criar eventos de envio/resposta a partir desta conversa? Faça apenas se as mensagens realmente aconteceram.'))return;try{const r=consolidarConversa(estado(),emp(),c,{confirmado:true});salvar();avisar(`${r.criados} evento(s) criados, ${r.duplicados} duplicado(s) ignorado(s).`);}catch(x){avisar(x.message);}reabrir();}
 };
 return {html,ligar,acoes,definirEmpresa,gerar,estadoLocal:L,empresaAtual:emp};
}
