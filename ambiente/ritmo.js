import {montarSerieMensagens} from './dados.js';
const NS = 'http://www.w3.org/2000/svg';
const limites = {esquerda: 18, direita: 702, alto: 20, base: 157};
const criarSvg = (nome, atributos = {}) => {
 const no = document.createElementNS(NS, nome);
 for (const [chave, valor] of Object.entries(atributos)) no.setAttribute(chave, valor);
 return no;
};

export function tracarCurva(pontos) {
 if (!pontos.length) return '';
 if (pontos.length === 1) return `M ${pontos[0].x} ${pontos[0].y}`;
 const inclinacoes = pontos.slice(1).map((p, i) => (p.y - pontos[i].y) / (p.x - pontos[i].x || 1));
 const tangentes = pontos.map((_, i) => i === 0 ? inclinacoes[0] : i === pontos.length - 1 ? inclinacoes.at(-1) : inclinacoes[i - 1] * inclinacoes[i] <= 0 ? 0 : 2 / (1 / inclinacoes[i - 1] + 1 / inclinacoes[i]));
 return pontos.slice(1).reduce((d, p, j) => {
  const anterior = pontos[j], intervalo = (p.x - anterior.x) / 3;
  return d + ` C ${anterior.x + intervalo} ${anterior.y + tangentes[j] * intervalo}, ${p.x - intervalo} ${p.y - tangentes[j + 1] * intervalo}, ${p.x} ${p.y}`;
 }, `M ${pontos[0].x} ${pontos[0].y}`);
}

export function criarRitmo(alvo, {podeAnimar = () => true} = {}) {
 const svg = alvo.querySelector('svg'), curva = alvo.querySelector('.pr-curva'), preenchimento = alvo.querySelector('.pr-area-curva');
 const profundidade = alvo.querySelector('.pr-curva-profunda'), particulas = alvo.querySelector('.pr-curva-particulas');
 const pontosSvg = alvo.querySelector('.pr-pontos-grafico'), botoes = alvo.querySelector('.pr-dias-ritmo');
 const seletor = alvo.querySelector('select'), explorador = alvo.querySelector('input[type="range"]');
 const tooltip = alvo.querySelector('.pr-tooltip'), guia = alvo.querySelector('.pr-guia-grafico'), selecionado = alvo.querySelector('.pr-ponto-ativo');
 let estado, serie = [], pontos = [], antigos = [], quadro = 0, foco = -1, inicio = 0, destruir = false;
 const abortar = new AbortController(), opcoes = {signal: abortar.signal};
 const emSemana = () => seletor.value.startsWith('semana');
 const retirarFoco = () => {foco = -1; tooltip.hidden = true; guia.setAttribute('opacity', '0'); selecionado.setAttribute('opacity', '0'); botoes.querySelectorAll('button').forEach(b => b.removeAttribute('aria-current'));};
 function mostrarDia(indice, anunciar = false) {
  indice = Math.max(0, Math.min(serie.length - 1, indice));
  const dia = serie[indice], ponto = pontos[indice];
  if (!dia || !ponto) return;
  foco = indice; explorador.value = indice;
  explorador.setAttribute('aria-valuetext', `${dia.rotulo}: ${dia.quantidade} ${dia.quantidade === 1 ? 'mensagem' : 'mensagens'}`);
  tooltip.hidden = false;
  tooltip.querySelector('strong').textContent = dia.quantidade + (dia.quantidade === 1 ? ' mensagem' : ' mensagens');
  tooltip.querySelector('span').textContent = dia.rotulo + (dia.futuro ? ' · dia futuro' : '');
  tooltip.style.setProperty('--pr-tooltip-x', Math.max(22, Math.min(78, ponto.x / 7.2)) + '%');
  guia.setAttribute('x1', ponto.x); guia.setAttribute('x2', ponto.x); guia.setAttribute('opacity', '1');
  selecionado.setAttribute('cx', ponto.x); selecionado.setAttribute('cy', ponto.y); selecionado.setAttribute('opacity', '1');
  botoes.querySelectorAll('button').forEach(b => {if (Number(b.dataset.dia) === indice) b.setAttribute('aria-current', 'date'); else b.removeAttribute('aria-current');});
  if (anunciar) alvo.querySelector('.pr-ritmo-leitura').textContent = `${dia.rotulo}: ${dia.quantidade} mensagens confirmadas.`;
 }
 function desenhar(atuais) {
  const d = tracarCurva(atuais);
  curva.setAttribute('d', d); profundidade.setAttribute('d', d); particulas.setAttribute('d', d);
  preenchimento.setAttribute('d', d + ` L ${limites.direita} ${limites.base} L ${limites.esquerda} ${limites.base} Z`);
  [...pontosSvg.children].forEach(n => {const i=Number(n.dataset.indice);n.setAttribute('cx', atuais[i]?.x ?? 0); n.setAttribute('cy', atuais[i]?.y ?? limites.base);});
 }
 function transicionar(agora) {
  if (destruir) return;
  const p = Math.min(1, (agora - inicio) / 650), suavidade = 1 - (1 - p) ** 3;
  desenhar(pontos.map((v, i) => ({x: v.x, y: antigos[i].y + (v.y - antigos[i].y) * suavidade})));
  if (p < 1 && podeAnimar()) quadro = requestAnimationFrame(transicionar);
  else {quadro = 0; desenhar(pontos);}
 }
 function atualizar(novoEstado) {
  estado = novoEstado;
  const dados = montarSerieMensagens(estado, seletor.value), anterior = pontos;
  const assinatura = seletor.value + '|' + dados.serie.map(d => d.data + ':' + d.quantidade + ':' + d.futuro).join('|');
  if (assinatura === alvo.dataset.serie) return;
  alvo.dataset.serie = assinatura; serie = dados.serie;
  const maximo = serie.reduce((maior, d) => Math.max(maior, d.quantidade), 1);
  const passos = Math.max(1, serie.length - 1);
  pontos = serie.map((d, i) => ({x: limites.esquerda + i / passos * (limites.direita - limites.esquerda), y: limites.base - d.quantidade / maximo * (limites.base - limites.alto)}));
  antigos = pontos.map((p, i) => ({x: p.x, y: anterior.length ? anterior[Math.round(i / passos * (anterior.length - 1))].y : limites.base}));
  svg.setAttribute('aria-label', `${dados.total} mensagens confirmadas no período. Escala vertical de zero a ${maximo}. Use os dias ou o controle abaixo para explorar cada valor.`);
  alvo.querySelector('[data-pr-total-ritmo]').textContent = dados.total.toLocaleString('pt-BR');
  alvo.querySelector('[data-pr-escala]').textContent = maximo.toLocaleString('pt-BR');
  alvo.querySelector('[data-pr-sem-envios]').hidden = dados.total !== 0;
  alvo.classList.toggle('pr-ritmo-vazio', dados.total === 0);
  explorador.max = Math.max(0, serie.length - 1); explorador.value = 0;
  const marcadores = pontos.length <= 60 ? pontos.map((_, i) => i) : Array.from({length:60},(_,i)=>Math.round(i/59*(pontos.length-1)));
  pontosSvg.replaceChildren(...marcadores.map(i => criarSvg('circle', {cx:pontos[i].x,cy:pontos[i].y,'data-indice':i,r:serie.length>40?2:3.5,class:serie[i].futuro?'pr-ponto-futuro':''})));
  botoes.replaceChildren();
  const indices = [...new Set(Array.from({length: Math.min(7, serie.length)}, (_, i) => Math.round(i / Math.max(1, Math.min(7, serie.length) - 1) * (serie.length - 1))))];
  for (const i of indices) {
   const b = document.createElement('button'); b.type = 'button'; b.dataset.dia = i;
   b.textContent = emSemana() ? serie[i].nome : serie[i].rotulo.match(/\d{2}\/\d{2}/)?.[0] || serie[i].nome;
   b.setAttribute('aria-label', `${serie[i].rotulo}, ${serie[i].quantidade} mensagens${serie[i].futuro ? ', dia futuro' : ''}`);
   if (serie[i].futuro) b.classList.add('pr-dia-futuro');
   botoes.append(b);
  }
  retirarFoco(); cancelAnimationFrame(quadro); desenhar(antigos);
  if (podeAnimar() && anterior.length) {inicio = performance.now(); quadro = requestAnimationFrame(transicionar);} else desenhar(pontos);
 }
 seletor.addEventListener('change', () => atualizar(estado), opcoes);
 const apontarDia = e => {
  const r = svg.getBoundingClientRect(), x = (e.clientX - r.left) / r.width * 720;
  mostrarDia(Math.round((x - limites.esquerda) / (limites.direita - limites.esquerda) * Math.max(0, serie.length - 1)));
 };
 svg.addEventListener('pointermove', apontarDia, {...opcoes, passive: true});
 svg.addEventListener('pointerdown', apontarDia, {...opcoes, passive: true});
 svg.addEventListener('pointerleave', () => {if (!alvo.contains(document.activeElement)) retirarFoco();}, opcoes);
 botoes.addEventListener('click', e => {const b = e.target.closest('button'); if (b) mostrarDia(Number(b.dataset.dia), true);}, opcoes);
 botoes.addEventListener('focusin', e => {if (e.target.dataset.dia != null) mostrarDia(Number(e.target.dataset.dia), true);}, opcoes);
 explorador.addEventListener('input', () => mostrarDia(Number(explorador.value), true), opcoes);
 explorador.addEventListener('focus', () => mostrarDia(Number(explorador.value), true), opcoes);
 return {atualizar, ajustarMovimento() {if (!podeAnimar()) {cancelAnimationFrame(quadro); quadro = 0; desenhar(pontos);}}, destruir() {destruir = true; cancelAnimationFrame(quadro); abortar.abort();}};
}
