import {icone} from '../icones.js';
import {obterFoco} from './dados.js';
import {criarRitmo} from './ritmo.js';
import {criarMarcadores} from './marcadores.js';
import {consultarAmpulheta, formatarRestante} from './tempo.js';

export function montarAmbiente() {
 return `<section class="pr-ambiente" aria-label="Ambiente de prospecção interativo">
  <canvas class="pr-tela-ambiente" aria-hidden="true"></canvas>
  <div class="pr-conteudo-ambiente">
   <section class="pr-resumo-cena" aria-label="Resumo comercial registrado">
    <div class="pr-marca-cena"><svg viewBox="0 0 70 60" aria-hidden="true"><ellipse cx="35" cy="30" rx="30" ry="15" transform="rotate(-38 35 30)"/><ellipse cx="35" cy="30" rx="24" ry="22" transform="rotate(-38 35 30)"/><circle cx="57" cy="11" r="2"/></svg><div><h3 data-pr-marca>Órbita</h3><p>Central de Prospecção Ativa</p></div></div>
    <div class="pr-medidas-cena">
     <div>${icone('aviao')}<span><strong data-pr-enviadas>0</strong><small>Mensagens enviadas</small></span></div>
     <div>${icone('mensagem')}<span><strong data-pr-respostas>0</strong><small>Respostas recebidas</small></span></div>
     <div>${icone('acordo')}<span><strong data-pr-negociacoes>0</strong><small>Negociações</small></span></div>
     <div>${icone('verificado')}<span><strong data-pr-vendas>0</strong><small>Vendas fechadas</small></span></div>
    </div>
   </section>
   <section class="pr-diorama-cena" aria-label="Observatório de oportunidades">
    <div class="pr-diorama-volume" aria-hidden="true"></div>
    <div class="pr-pinos-acessiveis" role="group" aria-label="Empresas no observatório" hidden></div>
    <button class="pr-marcador-radar pr-balao-mapa" data-acao="empresas">${icone('alvo')}<span><strong><b data-pr-radar>0</b> empresas</strong><small>no radar</small></span></button>
    <button class="pr-marcador-negocio pr-balao-mapa" data-etapa="negociacao">${icone('brilho')}<span><strong><b data-pr-mapa-negociacao>0</b> em negociação</strong><small>Etapa atual</small></span></button>
    <button class="pr-marcador-venda pr-balao-mapa" data-acao="hoje">${icone('verificado')}<span><strong><b data-pr-venda-semana>0</b> vendas</strong><small>nesta semana</small></span></button>
    <span class="pr-rosa-ventos" aria-hidden="true">N</span>
   </section>
   <section class="pr-foco-cena" aria-labelledby="pr-titulo-foco">
    <div class="pr-suporte-foco" aria-hidden="true"><i></i><i></i><i></i></div>
    <button type="button" class="pr-foco-alvo" data-pr-foco>
     <span class="pr-foco-sobretitulo" id="pr-titulo-foco">Foco da Semana</span>
     <strong data-pr-foco-titulo>Nova oportunidade</strong>
     <span class="pr-foco-detalhe" data-pr-foco-detalhe>Cadastre uma empresa para começar.</span>
     <span class="pr-foco-abrir">Explorar prioridade ${icone('seta')}</span>
    </button>
    <p class="pr-foco-origem">Prioridade atual do CRM</p>
   </section>
   <section class="pr-fluxo-cena" aria-labelledby="pr-titulo-fluxo">
    <header>${icone('relogio')}<div><h3 id="pr-titulo-fluxo">Fluxo Comercial</h3><p>Empresas na etapa atual</p></div></header>
    <div class="pr-fluxo-objetos"><div class="pr-funil-vivo" data-pr-funil></div>
     <figure class="pr-ampulheta-cena">
      <div class="pr-ampulheta-volume" aria-hidden="true"><div class="pr-ampulheta-reserva"><i class="pr-vidro-superior"></i><i class="pr-vidro-inferior"></i><b></b><b></b><span></span></div></div>
      <figcaption><time data-pr-tempo>03:00</time><span>Ciclo de areia</span></figcaption>
      <details class="pr-detalhes-tempo"><summary aria-label="Sobre o ciclo de três minutos">${icone('relogio')}</summary><p>A areia escoa por 180 segundos. A ampulheta se inverte e recomeça. Este ciclo é visual e não executa ações no CRM.</p></details>
     </figure>
    </div>
   </section>
   <section class="pr-ritmo-cena pr-painel-flutuante" aria-labelledby="pr-titulo-ritmo">
    <header>${icone('grafico')}<div><h3 id="pr-titulo-ritmo">Ritmo de Prospecção</h3><p>Envios confirmados · <strong data-pr-total-ritmo>0</strong> no período</p></div></header>
    <label class="pr-periodo-ritmo"><span class="pr-so-leitura">Período do ritmo de prospecção</span><select aria-label="Período do ritmo de prospecção"><option value="semana">Esta semana</option><option value="semana-anterior">Semana anterior</option><option value="mes">Mês atual</option><option value="anterior">Mês anterior</option><option value="todos">Todo o período</option></select>${icone('baixo')}</label>
    <div class="pr-grafico-vivo"><div class="pr-escala"><span data-pr-escala>1</span><span>0</span></div>
     <svg viewBox="0 0 720 180" preserveAspectRatio="none" role="img" aria-label="Mensagens confirmadas por dia">
      <defs><linearGradient id="pr-gradiente-area" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#38cbb5" stop-opacity=".37"/><stop offset="1" stop-color="#159481" stop-opacity="0"/></linearGradient><linearGradient id="pr-gradiente-linha"><stop stop-color="#44a995"/><stop offset=".35" stop-color="#7af8d6"/><stop offset=".62" stop-color="#ffc789"/><stop offset="1" stop-color="#64e8d0"/></linearGradient><filter id="pr-brilho-curva" x="-30%" y="-80%" width="160%" height="260%"><feGaussianBlur stdDeviation="4"/></filter></defs>
      <path class="pr-grade-grafico" d="M18 20H702 M18 65H702 M18 111H702 M18 157H702"/>
      <path class="pr-curva-profunda"/><path class="pr-area-curva"/><path class="pr-curva"/><path class="pr-curva-particulas" pathLength="1000"/>
      <g class="pr-pontos-grafico"></g><line class="pr-guia-grafico" y1="13" y2="157" opacity="0"/><circle class="pr-ponto-ativo" r="6" opacity="0"/>
     </svg>
     <div class="pr-tooltip" hidden><strong></strong><span></span></div>
     <p class="pr-sem-envios" data-pr-sem-envios>Nenhum envio confirmado neste período.</p>
    </div>
    <div class="pr-dias-ritmo" aria-label="Explorar dias do gráfico"></div>
    <label class="pr-explorar-ritmo"><span>Explorar cada dia</span><input type="range" min="0" max="6" step="1" value="0" aria-label="Dia do gráfico de mensagens"></label>
    <span class="pr-so-leitura pr-ritmo-leitura" role="status" aria-live="polite"></span>
   </section>
   <section class="pr-recentes-cena pr-painel-flutuante" aria-labelledby="pr-titulo-recentes">
    <header>${icone('brilho')}<div><h3 id="pr-titulo-recentes">Movimentações Recentes</h3><p>Seu histórico confirmado</p></div><span class="pr-sinal-local"><i></i> No CRM</span></header>
    <div data-pr-recentes></div><button class="pr-historico-cena" data-acao="hoje">Ver histórico ${icone('seta')}</button>
   </section>
  </div>
  <div class="pr-borda-agua" aria-hidden="true"></div>
 </section>`;
}

export function criarAmbiente(alvo) {
 const abortar = new AbortController(), sinal = {signal: abortar.signal};
 const reduzir = matchMedia('(prefers-reduced-motion: reduce)'), ponteiro = matchMedia('(pointer: fine)');
 let inicio;
 let cena, carregando, visivel = false, destruido = false, estadoAtual, ultimaHora = '';
 const podeAnimar = () => visivel && !document.hidden && !document.body.classList.contains('modal-aberto') && !reduzir.matches && !document.documentElement.classList.contains('movimento-pausado');
 const ritmo = criarRitmo(alvo.querySelector('.pr-ritmo-cena'), {podeAnimar});
 const marcadores=criarMarcadores(alvo.querySelector('.pr-pinos-acessiveis'),{destacar:id=>cena?.destacarEmpresa(id)});
 function atualizarTempo() {
  const tempo = consultarAmpulheta(inicio ?? Date.now()), texto = tempo.invertendo ? 'Invertendo' : formatarRestante(tempo.restante);
  if (texto !== ultimaHora) {
   ultimaHora = texto; alvo.querySelector('[data-pr-tempo]').textContent = texto;
   alvo.querySelector('[data-pr-tempo]').setAttribute('aria-label', tempo.invertendo ? 'Ampulheta se invertendo' : `${tempo.restante} segundos restantes no ciclo visual`);
   alvo.dataset.faseAreia = tempo.invertendo ? 'virada' : 'escoando';
   alvo.style.setProperty('--pr-angulo-ampulheta', tempo.rotacao + 'rad');
   alvo.style.setProperty('--pr-areia-superior', (tempo.paridade ? tempo.progresso : 1 - tempo.progresso) * 100 + '%');
   alvo.style.setProperty('--pr-areia-inferior', (tempo.paridade ? 1 - tempo.progresso : tempo.progresso) * 100 + '%');
  }
 }
 function ajustarAtividade() {
  const ativo = visivel && !document.hidden && !document.body.classList.contains('modal-aberto');
  alvo.classList.toggle('pr-ambiente-dormindo', !ativo || !podeAnimar());
  cena?.definirAtividade(ativo, podeAnimar()); ritmo.ajustarMovimento();
  if (ativo) {atualizarTempo(); if (estadoAtual) ritmo.atualizar(estadoAtual);}
 }
 async function prepararCena() {
  if (carregando || cena || destruido) return;
  carregando = import('./cena.js').then(({criarCena}) => {
   if (destruido) return;
   cena = criarCena(alvo, {inicio, preferencias: estadoAtual?.preferencias || {}, aoProjetar:pontos=>marcadores.posicionar(pontos)});
   cena?.atualizarEmpresas(estadoAtual?.empresas||[]);
   alvo.classList.add(cena ? 'pr-com-webgl' : 'pr-sem-webgl');
   ajustarAtividade();
  }).catch(() => alvo.classList.add('pr-sem-webgl'));
  await carregando;
 }
 const observador = new IntersectionObserver(entradas => {
  visivel = entradas[0].isIntersecting;
  if (visivel && inicio == null) inicio = Date.now();
  if (visivel) void prepararCena();
  ajustarAtividade();
 }, {rootMargin: '90px'});
 observador.observe(alvo);
 const mutacoes = new MutationObserver(ajustarAtividade);
 mutacoes.observe(document.documentElement, {attributes: true, attributeFilter: ['class']});
 mutacoes.observe(document.body, {attributes: true, attributeFilter: ['class']});
 reduzir.addEventListener('change', ajustarAtividade, sinal);
 document.addEventListener('visibilitychange', ajustarAtividade, sinal);
 document.addEventListener('orbita:preferencias', e => {cena?.definirQualidade(e.detail?.qualidade); ajustarAtividade();}, sinal);
 let ultimoReflexo = 0;
 alvo.addEventListener('pointermove', e => {
  if (!podeAnimar() || !ponteiro.matches || performance.now() - ultimoReflexo < 35) return;
  ultimoReflexo = performance.now();
  const painel = e.target.closest('.pr-painel-flutuante,.pr-foco-alvo,.pr-funil-degrau');
  if (!painel) return;
  const r = painel.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
  painel.style.setProperty('--pr-reflexo-x', x * 100 + '%'); painel.style.setProperty('--pr-reflexo-y', y * 100 + '%');
  painel.style.setProperty('--pr-inclinacao-x', (y - .5) * -1.5 + 'deg'); painel.style.setProperty('--pr-inclinacao-y', (x - .5) * 2 + 'deg');
 }, {...sinal, passive: true});
 alvo.addEventListener('pointerleave', () => alvo.querySelectorAll('[style*="--pr-inclinacao"]').forEach(n => {n.style.setProperty('--pr-inclinacao-x', '0deg'); n.style.setProperty('--pr-inclinacao-y', '0deg');}), sinal);
 const timer = setInterval(() => {if (visivel && !document.hidden) atualizarTempo();}, 1000);
 return {
  atualizar(estado, atividade, visao, etapas, tipos) {
   estadoAtual = estado;
   marcadores.atualizar(estado.empresas||[],etapas);
   const foco = obterFoco(estado, visao), botao = alvo.querySelector('[data-pr-foco]');
   for (const chave of ['m', 'id', 'acao']) delete botao.dataset[chave];
   if (foco.m) {botao.dataset.m = foco.m; botao.dataset.id = foco.id || '';} else botao.dataset.acao = foco.acao || 'hoje';
   alvo.querySelector('[data-pr-foco-titulo]').textContent = foco.titulo;
   alvo.querySelector('[data-pr-foco-detalhe]').textContent = foco.detalhe;
   botao.setAttribute('aria-label', 'Foco da Semana: ' + foco.titulo + '. ' + foco.detalhe);
   alvo.querySelector('[data-pr-marca]').textContent = estado.preferencias?.marca || 'Órbita';
   const escrever = (chave, valor) => {alvo.querySelector(`[data-pr-${chave}]`).textContent = valor.toLocaleString('pt-BR');};
   escrever('radar', (estado.empresas || []).length);
   escrever('mapa-negociacao', atividade.contagens.find(e => e.id === 'negociacao')?.quantidade || 0);
   const hoje=new Date(),inicioSemana=new Date(hoje.getFullYear(),hoje.getMonth(),hoje.getDate()-((hoje.getDay()+6)%7));
   escrever('venda-semana',(estado.eventos||[]).filter(e=>!e.revertido&&e.tipo==='venda'&&new Date(e.quando)>=inicioSemana&&new Date(e.quando)<=hoje).length);
   escrever('enviadas', atividade.total); escrever('respostas', (estado.eventos || []).filter(e => !e.revertido && e.tipo === 'resposta' && new Date(e.quando) <= new Date()).length);
   escrever('negociacoes', atividade.contagens.find(e => e.id === 'negociacao')?.quantidade || 0);
   escrever('vendas', atividade.contagens.find(e => e.id === 'fechada')?.quantidade || 0);
   const funil = alvo.querySelector('[data-pr-funil]');
   if (!funil.children.length) for (const etapa of etapas) {
    const b = document.createElement('button'); b.type = 'button'; b.className = 'pr-funil-degrau'; b.dataset.etapa = etapa.id;
    b.innerHTML = icone(etapa.desenho) + '<span></span><strong></strong>'; b.querySelector('span').textContent = etapa.nome; funil.append(b);
   }
   [...funil.children].forEach((b, i) => {
    const etapa = atividade.contagens[i]; b.querySelector('strong').textContent = etapa.quantidade.toLocaleString('pt-BR');
    b.setAttribute('aria-label', etapa.nome + ': ' + etapa.quantidade + ' empresas. Abrir etapa.');
    b.style.setProperty('--pr-degrau', i); b.style.setProperty('--pr-largura-degrau', 100 - i * 5 + '%');
   });
   const lista = alvo.querySelector('[data-pr-recentes]'), empresas = new Map((estado.empresas || []).map(e => [e.id, e]));
   lista.replaceChildren();
   if (!atividade.recentes.length) {const p = document.createElement('p'); p.className = 'pr-historico-vazio'; p.textContent = 'Suas próximas interações aparecerão aqui após serem registradas.'; lista.append(p);}
   for (const evento of atividade.recentes) {
    const empresa = empresas.get(evento.empresaId), [descricao, desenho] = tipos[evento.tipo];
    const linha = document.createElement(empresa ? 'button' : 'div'); linha.className = 'pr-movimentacao';
    if (empresa) {linha.type = 'button'; linha.dataset.empresa = empresa.id;}
    linha.innerHTML = icone(desenho) + '<span><strong></strong><small></small></span><time></time>';
    linha.querySelector('strong').textContent = empresa?.nome || 'Empresa não cadastrada';
    linha.querySelector('small').textContent = descricao.replace(/ (para|de|com)$/, '');
    const hora = linha.querySelector('time'); hora.dateTime = evento.quando;
    hora.textContent = new Date(evento.quando).toLocaleString('pt-BR', {day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'});
    lista.append(linha);
   }
   ritmo.atualizar(estado); cena?.atualizarEmpresas(estado.empresas||[]); atualizarTempo(); ajustarAtividade();
  },
  destruir() {destruido = true; clearInterval(timer); observador.disconnect(); mutacoes.disconnect(); abortar.abort(); ritmo.destruir(); marcadores.destruir(); cena?.destruir();}
 };
}
