export const DURACAO_AREIA = 180000;
export const DURACAO_VIRADA = 4600;
export const DURACAO_CICLO = DURACAO_AREIA + DURACAO_VIRADA;

export function suavizar(valor) {
 const p = Math.max(0, Math.min(1, valor));
 return p * p * p * (10 + p * (-15 + 6 * p));
}

export function consultarAmpulheta(inicio, agora = Date.now()) {
 const decorrido = Math.max(0, agora - inicio);
 const ciclo = Math.floor(decorrido / DURACAO_CICLO);
 const instante = decorrido % DURACAO_CICLO;
 const invertendo = instante >= DURACAO_AREIA;
 const virada = invertendo ? (instante - DURACAO_AREIA) / DURACAO_VIRADA : 0;
 return {
  ciclo,
  paridade: ciclo % 2,
  invertendo,
  progresso: Math.min(1, instante / DURACAO_AREIA),
  restante: invertendo ? 0 : Math.ceil((DURACAO_AREIA - instante) / 1000),
  virada,
  rotacao: (ciclo % 2) * Math.PI + suavizar(virada) * Math.PI
 };
}

export function orientarAmpulheta(virada, paridade = 0) {
 const p = suavizar(virada), arco = Math.sin(Math.PI * p);
 return {x: arco * .52, y: arco * Math.sin(p * Math.PI * 2) * .83, z: paridade * Math.PI + p * Math.PI};
}

export function formatarRestante(segundos) {
 return String(Math.floor(segundos / 60)).padStart(2, '0') + ':' + String(segundos % 60).padStart(2, '0');
}
