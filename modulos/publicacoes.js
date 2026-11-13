/* Publicações no Cloudflare Pages, acompanhamento de acessos e integrações. Toda ação sensível pede confirmação; credenciais nunca passam pelo navegador. */
import {t,campo,dadosForm,dataHora,confirmar,linkWhatsapp,abrirExterno} from './util.js';
import {tabela,barras,linhas,funil} from './graficos.js';
import {criarTransporte} from '../nucleo/connect/transporte.js';
import {criarPublicador,novaPublicacao,impressaoDoPacote} from '../nucleo/publicacao/cliente.js';
import {prepararParaPublicar,nomeDoProjeto} from '../nucleo/publicacao/preparar.js';
import {auditarPrivacidade} from '../nucleo/publicacao/privacidade.js';
import {agregar,compararModelos} from '../nucleo/rastreio/agregar.js';
import {sugestoesDemonstracao} from '../nucleo/rastreio/regras.js';
import {novoId,eventosDaEmpresa} from '../nucleo/esquema.js';
const abas=[['publicacoes','Publicações'],['acompanhamento','Acompanhamento'],['integracoes','Integrações']];
const rotuloEstado={rascunho:'Rascunho',publicando:'Publicando','em-processamento':'Em processamento',publicada:'Publicada','publicada-sem-verificacao':'Publicada (link não verificado)','registrada-manual':'Registrada manualmente',falhou:'Falhou',arquivada:'Arquivada'};
const classe=e=>e==='publicada'?'ativa':e==='falhou'?'perdida':'pausada';
const pc=v=>v==null?'—':(v*100).toFixed(0)+'%';
export function criarPublicacoes(ctx){
 const {obterEstado,salvar,avisar,abrirPainel}=ctx,estado=()=>obterEstado();
 let aba='publicacoes',sel='',statusCf=null,statusRast=null,carregando='',transporte=null,publicador=null,progresso=null;
 const tr=()=>transporte??=criarTransporte('/api/connect'),pb=()=>publicador??=criarPublicador({transporte:tr()});
 const selo=e=>`<span class="selo-situacao ${classe(e)}">${t(rotuloEstado[e]||e)}</span>`;
 const emp=id=>estado().empresas.find(e=>e.id===id);
 const pubs=()=>estado().publicacoes.filter(p=>!p.arquivada).sort((a,b)=>String(b.atualizadoEm||b.criadaEm).localeCompare(String(a.atualizadoEm||a.criadaEm)));
 async function garantirSessao(){try{const s=await tr().status();if(!s.autenticado)throw Error('Entre com sua conta no Órbita Connect (aba Configuração) para usar a publicação automática.');return true;}catch(e){throw Error(e.message.includes('Falha')?'A ponte serverless não respondeu. Confira a implantação na Vercel.':e.message);}}
 /* ---------- publicar ---------- */
 async function publicar({demo,empresa,arquivos,versao}){
  const est=estado();let pub=est.publicacoes.find(p=>p.demonstracaoId===demo.id&&!p.arquivada);
  try{await garantirSessao();const st=await pb().status();statusCf=st;if(!st.configurada||st.tokenAtivo===false)throw Error(st.configurada?'O token da Cloudflare foi recusado. Veja Integrações → Cloudflare.':'A Cloudflare ainda não está configurada no servidor. Veja Integrações.');}
  catch(e){avisar(e.message);abrir('integracoes');return null;}
  const existentes=est.publicacoes.filter(p=>p.demonstracaoId!==demo.id).map(p=>p.projeto);
  const projeto=pub?.projeto||nomeDoProjeto(empresa,existentes);
  let rast=pub?.rastreio||null;
  if(est.config.publicacao.rastreioAtivo){try{const s=statusRast=await tr().chamar('rastreio-status');if(s.configurado&&s.coletorAtivo){const c=await tr().chamar('rastreio-credencial',{metodo:'POST',corpo:{demo:rast?.demo}});rast={demo:c.demo,chave:c.chave,url:c.url,modo:est.config.publicacao.modoRastreio};}else avisar('Acompanhamento desativado: o coletor não está ativo. A demonstração será publicada sem medição.');}catch(e){avisar('Acompanhamento indisponível ('+e.message+'). Publicando sem medição.');rast=null;}}
  const pronto=prepararParaPublicar(arquivos,{empresa,autor:est.preferencias.nome||'o desenvolvedor',rastreio:rast});
  const audit=auditarPrivacidade(pronto.arquivos,{empresa,empresas:est.empresas});
  if(audit.erros){mostrarAuditoria(audit,projeto);return null;}
  if(!est.config.publicacao.automatica&&!confirmar(`Publicar a demonstração de "${empresa.nome}" em https://${projeto}.pages.dev?\n\nO site fica acessível a quem tiver o link (sem indexação no Google) até você excluir. ${pronto.lista.length} arquivos, ${(pronto.tamanho/1e6).toFixed(1)} MB.`))return null;
  const imp=await impressaoDoPacote(pronto.arquivos,pronto.cabecalhos);
  if(!pub){pub=novaPublicacao({empresaId:empresa.id,demonstracaoId:demo.id,projeto,modeloId:demo.modeloId,versao:versao?.numero||1,versaoPacote:imp.pacote});est.publicacoes.push(pub);}
  else{pub.versao=versao?.numero||(pub.versao||0)+1;pub.versaoPacote=imp.pacote;}
  pub.rastreio=rast;pub.empresaNome=empresa.nome;salvar();
  progresso={pub,texto:'Preparando…'};abrir('publicacoes');
  try{
   await pb().publicar(pub,{arquivos:pronto.arquivos,cabecalhos:pronto.cabecalhos,aoEtapa:p=>{progresso={pub:p,texto:{iniciando:'Conectando à Cloudflare…',enviando:`Enviando arquivos${p.progresso?` (${p.progresso.lote}/${p.progresso.de})`:''}…`,finalizando:'Criando o deploy…',aguardando:'Aguardando a Cloudflare publicar…',verificando:'Verificando se o link responde…',concluida:'Concluído'}[p.etapa]||p.etapa};if(sel===''||true)atualizarProgresso();salvar();}});
   pub.historico.push({quando:new Date().toISOString(),versao:pub.versao,deployId:pub.deployId,hashPacote:pub.pacoteHash||pub.versaoPacote,arquivos:pronto.lista.length,tamanho:pronto.tamanho});
   if(pub.estado==='publicada'){demo.urlPublica=pub.urlPublica;demo.publicacaoVerificada=true;demo.status='publicada';demo.linkCadastrado=pub.urlPublica;}
   salvar();progresso=null;avisar(pub.estado==='publicada'?'Publicado e verificado: '+pub.urlPublica:pub.estado==='em-processamento'?'A Cloudflare ainda está processando. Verifique em instantes.':'Publicado, mas o link ainda não respondeu. Tente verificar novamente.');abrir('publicacoes');return pub;
  }catch(e){progresso=null;salvar();avisar('Publicação interrompida: '+e.message+' Você pode tentar de novo; os arquivos já enviados não serão reenviados.');abrir('publicacoes');return null;}
 }
 function atualizarProgresso(){const el=document.querySelector('#pub-progresso');if(el&&progresso)el.textContent=progresso.texto;}
 function mostrarAuditoria(a,projeto){abrirPainel('Antes de publicar',`<div class="relatorio-exportacao"><strong>Verificação de privacidade e integridade</strong><ul>${a.itens.map(i=>`<li class="${i.nivel}">${i.nivel==='ok'?'✔':i.nivel==='aviso'?'⚠':'✖'} ${t(i.texto)}</li>`).join('')}</ul></div><p class="ajuda">Corrija os itens com ✖ no Estúdio e tente de novo. Nada foi publicado.</p>`,'PUBLICAÇÕES');}
 /* ---------- painéis ---------- */
 function listaPub(){
  const l=pubs();
  return (progresso?`<div class="alerta-duplicidade" role="status" aria-live="polite"><strong>Publicando ${t(progresso.pub.projeto)}</strong> · <span id="pub-progresso">${t(progresso.texto)}</span></div>`:'')+(l.length?l.map(p=>{const e=emp(p.empresaId),url=p.urlPublica;
   return `<article class="cartao-exp"><div class="cabecalho-lista"><h4>${t(e?.nome||p.empresaNome||'Empresa')} ${selo(p.estado)}</h4><small>${t(p.projeto)} · modelo ${t(p.modeloId||'—')} · v${p.versao||1}${p.publicadoEm?' · publicada em '+t(dataHora(p.publicadoEm)):''}${p.ultimaVerificacao?' · verificada '+t(dataHora(p.ultimaVerificacao)):''}</small></div>
   ${url?`<p><a href="${t(url)}" target="_blank" rel="noopener noreferrer">${t(url)}</a></p>`:'<p class="ajuda">Sem link ainda.</p>'}${p.erro?`<p class="erro">${t(p.erro)}</p>`:''}
   <div class="acoes-linha">${url?`<button type="button" data-m="publicacoes.abrir-site" data-id="${p.id}">Abrir site</button><button type="button" data-m="publicacoes.copiar" data-id="${p.id}">Copiar link</button><button type="button" data-m="publicacoes.mensagem" data-id="${p.id}">Preparar mensagem</button><button type="button" data-m="publicacoes.verificar" data-id="${p.id}">Verificar disponibilidade</button>`:''}<button type="button" data-m="publicacoes.republicar" data-id="${p.id}">Editar e republicar</button><button type="button" data-m="publicacoes.versoes" data-id="${p.id}">Versões</button><button type="button" data-m="publicacoes.arquivar" data-id="${p.id}">Arquivar</button><button type="button" class="perigo" data-m="publicacoes.excluir" data-id="${p.id}">Excluir…</button></div>
   ${sel===p.id?detalhesPub(p):''}</article>`;}).join(''):'<p class="vazio">Nenhuma publicação ainda. No Estúdio, abra uma demonstração e use "Publicar no Cloudflare".</p>');
 }
 function detalhesPub(p){
  return `<div class="detalhe-pub"><h5>Histórico de versões publicadas</h5>${p.historico?.length?tabela(['Versão','Quando','Deploy','Arquivos'],p.historico.slice().reverse().map(h=>['v'+h.versao,dataHora(h.quando),String(h.deployId||'').slice(0,8),h.arquivos])):'<p class="ajuda">Sem versões registradas.</p>'}<div id="pub-deploys"><button type="button" data-m="publicacoes.deploys" data-id="${p.id}">Consultar versões na Cloudflare</button></div><h5>Registro de operações</h5>${(p.logs||[]).length?`<ul>${p.logs.slice().reverse().map(l=>`<li class="${l.nivel==='erro'?'erro':''}">${t(dataHora(l.quando))} — ${t(l.texto)}</li>`).join('')}</ul>`:'<p class="ajuda">Sem registros.</p>'}</div>`;
 }
 function acompanhamento(){
  const l=pubs().filter(p=>p.rastreio),est=estado();
  if(!l.length)return '<p class="vazio">Nenhuma demonstração com acompanhamento. Ative em Integrações e publique de novo.</p>';
  const ags=Object.fromEntries(l.map(p=>[p.id,est.rastreios.find(r=>r.publicacaoId===p.id)?.resumo||null]));
  const comp=compararModelos(l,ags),vendidas=l.map(p=>({p,vendeu:est.eventos.some(e=>e.empresaId===p.empresaId&&(e.tipo==='venda'||e.tipo==='proposta-aceita'))}));
  const grp=(v)=>{const g=vendidas.filter(x=>x.vendeu===v&&ags[x.p.id]&&!ags[x.p.id].vazio);return {n:g.length,viz:g.reduce((s,x)=>s+ags[x.p.id].visualizacoes,0),sess:g.reduce((s,x)=>s+ags[x.p.id].sessoesEstimadas,0)};};
  return `<p class="ajuda">Todos os números vêm de eventos reais recebidos pelo coletor. Sessões e visitantes são <b>estimativas por navegador</b> (só com consentimento) e nunca identificam pessoas; o link pode ter sido encaminhado.</p><div class="acoes-linha"><button type="button" class="botao-principal" data-m="publicacoes.atualizar-todas">Atualizar métricas</button></div>
  ${tabela(['Demonstração','Visualizações','Sessões est.','Interações','Contato','Último acesso'],l.map(p=>{const a=ags[p.id];return [`${emp(p.empresaId)?.nome||p.projeto}`,a?a.visualizacoes:'—',a?a.sessoesEstimadas:'—',a?a.eventosInteracao:'—',a?a.conversoesObservadas.sessoesComContato:'—',a?.ultimoAcesso?dataHora(a.ultimoAcesso):'sem acessos'];}))}
  ${comp.length?`<h4>Comparação entre modelos</h4>${tabela(['Modelo','Demos','Visualizações','Sessões','Taxa de contato','Amostra'],comp.map(c=>[c.modelo,c.demos,c.visualizacoes,c.sessoes,pc(c.taxaContato),c.suficiente?'ok':'insuficiente (<20 sessões)']))}`:''}
  <h4>Demonstrações que resultaram ou não em venda</h4>${tabela(['Grupo','Demos com dados','Visualizações','Sessões est.'],[['Com venda',...Object.values(grp(true))],['Sem venda',...Object.values(grp(false))]])}<p class="ajuda">Comparação descritiva: poucos casos e muitos fatores não medidos. Não indica causa.</p>
  ${l.map(p=>cartaoAcompanhamento(p,ags[p.id])).join('')}`;
 }
 function cartaoAcompanhamento(p,a){
  const e=emp(p.empresaId),est=estado();if(!e)return '';
  const sug=sugestoesDemonstracao(est,e,p,a||agregar([]),{rastreioAtivo:!!p.rastreio});
  const apres=eventosDaEmpresa(est,e.id,'demonstracao-apresentada').filter(x=>!x.demonstracaoId||x.demonstracaoId===p.demonstracaoId);
  const corpo=!a||a.vazio?'<p class="vazio">Nenhum evento recebido ainda. (Ausência de dados não prova que ninguém abriu o link.)</p>':`<div class="resumo-relatorio quatro"><div class="numero-relatorio"><small>Visualizações</small><strong>${a.visualizacoes}</strong></div><div class="numero-relatorio"><small>Sessões estimadas</small><strong>${a.sessoesEstimadas}</strong></div><div class="numero-relatorio"><small>Visitantes estimados</small><strong>${a.visitantesEstimados??'—'}</strong></div><div class="numero-relatorio"><small>Interações</small><strong>${a.eventosInteracao}</strong></div></div>
   ${linhas([{nome:'Visualizações',pontos:a.linhaDoTempo.map(d=>({x:d.dia.slice(5),y:d.visualizacoes}))}],{titulo:'Visualizações por dia'})}
   ${barras(Object.entries(a.secoes).map(([k,v])=>({rotulo:k,valor:v})),{titulo:'Seções vistas (sessões)'})}${a.funil.length?funil(a.funil.map(([nome,n])=>({nome,n})),{titulo:'Funil de interação'}):''}
   <p>Dispositivos: ${Object.entries(a.dispositivos).map(([k,v])=>t(k)+' '+v).join(' · ')||'—'} · Origem: ${Object.entries(a.origens).map(([k,v])=>t(k)+' '+v).join(' · ')||'—'}</p><p>Primeiro acesso observado: ${a.primeiroAcesso?t(dataHora(a.primeiroAcesso)):'—'} · último: ${a.ultimoAcesso?t(dataHora(a.ultimoAcesso)):'—'}${a.tempo.medianaSegundos!=null?' · tempo mediano de interação: '+Math.round(a.tempo.medianaSegundos)+'s ('+a.tempo.sessoesMedidas+' sessões)':''}</p>
   <details><summary>Eventos recentes</summary>${tabela(['Quando','Tipo','Detalhe','Dispositivo'],a.recentes.map(r=>[dataHora(r.quando),r.tipo,r.valor,r.disp||'—']))}</details><p class="ajuda">${t(a.qualidade.aviso)}</p>`;
  return `<article class="cartao-exp"><div class="cabecalho-lista"><h4>${t(e.nome)}</h4><small>${t(p.urlPublica||'')}</small></div><p>Link apresentado: ${apres.length?apres.map(x=>t(dataHora(x.quando))).join(', '):'<em>ainda não confirmado por você</em>'}</p>${corpo}${sug.length?`<h5>Sugestões (hipóteses, não provas)</h5>${sug.map(s=>`<div class="alerta-duplicidade" role="note"><b>${t(s.titulo)}</b><br>${t(s.fato)} <em>${t(s.hipotese)}</em><br><small>Evidência: ${s.evidencia.map(t).join('; ')} · confiança ${t(s.confianca)}${s.faltam.length?' · falta saber: '+s.faltam.map(t).join('; '):''}</small><br>➜ ${t(s.acao)}</div>`).join('')}`:''}
  <div class="acoes-linha"><button type="button" data-m="publicacoes.atualizar" data-id="${p.id}">Atualizar</button><button type="button" class="perigo" data-m="publicacoes.excluir-dados" data-id="${p.id}">Excluir dados de acompanhamento…</button></div></article>`;
 }
 function integracoes(){
  const c=estado().config.publicacao,s=statusCf,r=statusRast;
  return `<h3>Cloudflare Pages</h3><p class="ajuda">As credenciais ficam só em variáveis de ambiente do servidor (Vercel). O navegador nunca as vê.</p>${s?`<div class="resumo-relatorio quatro"><div class="numero-relatorio"><small>Configurada</small><strong>${s.configurada?'sim':'não'}</strong></div><div class="numero-relatorio"><small>Token</small><strong>${s.tokenAtivo===true?'ativo':s.tokenAtivo===false?'recusado':'—'}</strong></div><div class="numero-relatorio"><small>Conta</small><strong>${t(s.conta||'—')}</strong></div><div class="numero-relatorio"><small>Projetos</small><strong>${s.projetos??'—'}</strong></div></div>${s.erro?`<p class="erro">${t(s.erro)}</p>`:''}${(s.orientacao||[]).map(o=>`<p>➜ ${t(o)}</p>`).join('')}<p class="ajuda">Limites (conferir plano atual): até ${s.limites?.arquivosPorDeploy} arquivos por deploy, ${s.limites?.tamanhoArquivoMiB} MiB por arquivo. ${t(s.limites?.observacao||'')}</p>`:'<p class="vazio">Conexão ainda não testada.</p>'}<div class="acoes-linha"><button type="button" class="botao-principal" data-m="publicacoes.testar">${carregando==='cf'?'Testando…':'Testar conexão'}</button></div>
  <form id="pub-cfg" class="grade-formulario"><label class="campo largo"><span><input type="checkbox" name="automatica" ${c.automatica?'checked':''}> Publicar sem pedir nova confirmação ao usar "Publicar no Cloudflare"</span><small>A validação de privacidade continua obrigatória.</small></label><label class="campo largo"><span><input type="checkbox" name="rastreioAtivo" ${c.rastreioAtivo?'checked':''}> Acompanhar acessos das próximas demonstrações</span></label>${campo('modoRastreio','Modo de acompanhamento',c.modoRastreio,{opcoes:[['agregado','Contagem anônima de visualizações sem aceite; sessões e interações só com aceite'],['consentimento','Nada é medido sem aceite']]})}<button type="submit">Salvar</button></form>
  <h3>Acompanhamento (Cloudflare Worker + R2)</h3>${r?`<p>${r.configurado?(r.coletorAtivo?'✔ Coletor ativo em '+t(r.endereco):'✖ Coletor configurado, mas não responde.'):'Coletor não configurado.'}${r.retencaoDias?' Retenção: '+r.retencaoDias+' dias.':''}</p>${(r.orientacao||[]).map(o=>`<p>➜ ${t(o)}</p>`).join('')}`:'<p class="vazio">Não testado.</p>'}<div class="acoes-linha"><button type="button" data-m="publicacoes.testar-coletor">Testar coletor</button></div>`;
 }
 const tabs={publicacoes:listaPub,acompanhamento,integracoes};
 function abrir(a=aba,id){
  aba=a;if(id)sel=id;
  abrirPainel('Do projeto ao link, com acompanhamento',`<div class="abas" role="tablist">${abas.map(([k,n])=>`<button type="button" role="tab" aria-selected="${aba===k}" class="${aba===k?'ativa':''}" data-m="publicacoes.aba" data-id="${k}">${n}</button>`).join('')}</div>${tabs[aba]()}`,'PUBLICAÇÕES');
  document.querySelector('#pub-cfg')?.addEventListener('submit',ev=>{ev.preventDefault();const d=dadosForm(ev.currentTarget),c=estado().config.publicacao;c.automatica=ev.currentTarget.elements.automatica.checked;c.rastreioAtivo=ev.currentTarget.elements.rastreioAtivo.checked;c.modoRastreio=d.modoRastreio;salvar();avisar('Configurações salvas.');abrir('integracoes');});
 }
 async function atualizar(p){
  const est=estado();if(!p.rastreio)throw Error('Esta demonstração não tem acompanhamento.');await garantirSessao();
  const j=await tr().chamar('rastreio-ler',{q:{demo:p.rastreio.demo}});const resumo=agregar(j.eventos);let r=est.rastreios.find(x=>x.publicacaoId===p.id);if(!r){r={id:novoId(),publicacaoId:p.id};est.rastreios.push(r);}Object.assign(r,{atualizadoEm:new Date().toISOString(),resumo,truncado:!!j.truncado});salvar();return resumo;
 }
 const P=id=>estado().publicacoes.find(p=>p.id===id);
 const acoes={
  aba:id=>abrir(id),
  'abrir-site':id=>abrirExterno(P(id).urlPublica),
  copiar:async id=>{try{await navigator.clipboard.writeText(P(id).urlPublica);avisar('Link copiado. Nada foi registrado como enviado.');}catch{avisar('Selecione e copie o link manualmente.');}},
  mensagem:id=>{const p=P(id);ctx.modulos.negociacao.abrir(p.empresaId,'mensagem',{objetivo:'demo'});},
  verificar:async id=>{const p=P(id);try{await garantirSessao();const v=await pb().verificar(p);p.verificacao=v;p.ultimaVerificacao=v.verificadoEm;if(v.disponivel&&p.estado==='publicada-sem-verificacao')p.estado='publicada';(p.logs??=[]).push({quando:v.verificadoEm,nivel:v.disponivel?'info':'aviso',texto:v.disponivel?'Link respondeu HTTP '+v.status+(v.noindex?' (noindex confirmado)':''):'Link não respondeu.'});salvar();avisar(v.disponivel?'O link está respondendo.':'O link não respondeu agora. Tente novamente em instantes.');}catch(e){avisar(e.message);}abrir('publicacoes');},
  republicar:id=>{ctx.estudio.abrirDemonstracao(P(id).demonstracaoId);},
  versoes:id=>{sel=sel===id?'':id;abrir('publicacoes');},
  deploys:async id=>{const p=P(id);const alvo=document.querySelector('#pub-deploys');try{await garantirSessao();const d=await pb().listarDeploys(p.projeto);alvo.innerHTML=d.length?`<div class="area-tabela"><table class="tabela-empresas"><thead><tr><th>Deploy</th><th>Criado</th><th>Estado</th><th>Ação</th></tr></thead><tbody>${d.map(x=>`<tr><td>${t(x.id.slice(0,8))}</td><td>${t(dataHora(x.criado))}</td><td>${t(x.estado||'—')}</td><td><button type="button" data-m="publicacoes.restaurar" data-id="${t(p.id)}|${t(x.id)}">Restaurar</button></td></tr>`).join('')}</tbody></table></div>`:'<p class="ajuda">Nenhum deploy encontrado.</p>';}catch(e){avisar(e.message);}},
  restaurar:async v=>{const [id,dep]=v.split('|'),p=P(id);if(!confirmar('Restaurar este deploy como versão ativa de '+p.projeto+'? A Cloudflare só permite isso para deploys de produção anteriores.'))return;try{await pb().restaurar(p.projeto,dep);(p.logs??=[]).push({quando:new Date().toISOString(),nivel:'info',texto:'Deploy '+dep.slice(0,8)+' restaurado.'});salvar();avisar('Versão restaurada.');}catch(e){avisar(e.message);}abrir('publicacoes');},
  arquivar:id=>{const p=P(id);if(!confirmar('Arquivar esta publicação? O site continua no ar; ela só sai da lista.'))return;p.arquivada=true;p.estadoAntes=p.estado;salvar();abrir('publicacoes');},
  excluir:async id=>{const p=P(id);const txt=window.prompt(`Excluir o projeto "${p.projeto}" da Cloudflare apaga o site e o endereço ${p.urlPublica}. Isso não pode ser desfeito.\n\nPara confirmar, digite o nome do projeto:`,'');if(txt!==p.projeto)return avisar('Exclusão cancelada.');try{await garantirSessao();await pb().excluirProjeto(p.projeto);p.arquivada=true;p.estado='arquivada';p.urlPublica='';(p.logs??=[]).push({quando:new Date().toISOString(),nivel:'info',texto:'Projeto excluído da Cloudflare.'});salvar();avisar('Projeto excluído.');}catch(e){avisar(e.message);}abrir('publicacoes');},
  atualizar:async id=>{try{await atualizar(P(id));avisar('Métricas atualizadas.');}catch(e){avisar(e.message);}abrir('acompanhamento');},
  'atualizar-todas':async()=>{let n=0,falhas=[];for(const p of pubs().filter(x=>x.rastreio)){try{await atualizar(p);n++;}catch(e){falhas.push(e.message);}}avisar(n+' atualizada(s)'+(falhas.length?'; falhas: '+falhas[0]:'.'));abrir('acompanhamento');},
  'excluir-dados':async id=>{const p=P(id);if(!confirmar('Excluir TODOS os eventos de acompanhamento desta demonstração no coletor?'))return;try{await garantirSessao();await tr().chamar('rastreio-excluir',{metodo:'POST',corpo:{demo:p.rastreio.demo,confirmacao:'EXCLUIR DADOS '+p.rastreio.demo}});const r=estado().rastreios.findIndex(x=>x.publicacaoId===p.id);if(r>=0)estado().rastreios.splice(r,1);salvar();avisar('Dados de acompanhamento excluídos.');}catch(e){avisar(e.message);}abrir('acompanhamento');},
  testar:async()=>{carregando='cf';abrir('integracoes');try{await garantirSessao();statusCf=await pb().status();}catch(e){statusCf={configurada:false,erro:e.message,orientacao:[]};}carregando='';abrir('integracoes');},
  'testar-coletor':async()=>{try{await garantirSessao();statusRast=await tr().chamar('rastreio-status');}catch(e){statusRast={configurado:false,orientacao:[e.message]};}abrir('integracoes');}
 };
 return {abrir,acoes,publicar};
}
