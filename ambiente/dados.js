const nomesDias = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const inicioDia = d => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const avancar = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
const chaveDia = d => [d.getFullYear(), d.getMonth(), d.getDate()].join('-');

export function montarSerieMensagens(estado, periodo = 'semana', agora = new Date()) {
 const hoje = inicioDia(agora), segunda = avancar(hoje, -((hoje.getDay() + 6) % 7));
 const eventos = (estado.eventos || []).filter(e => e && !e.revertido && e.tipo === 'mensagem-enviada' && Number.isFinite(new Date(e.quando).getTime()) && new Date(e.quando) <= agora);
 let inicio = segunda, fim = avancar(segunda, 7);
 if (periodo === 'semana-anterior') {inicio = avancar(segunda, -7); fim = segunda;}
 if (periodo === 'mes' || periodo === 'anterior') {
  const deslocamento = periodo === 'anterior' ? -1 : 0;
  inicio = new Date(hoje.getFullYear(), hoje.getMonth() + deslocamento, 1);
  fim = new Date(hoje.getFullYear(), hoje.getMonth() + deslocamento + 1, 1);
 }
 if (periodo === 'todos') {
  inicio = eventos.length ? inicioDia(new Date(eventos.reduce((menor, e) => Math.min(menor, new Date(e.quando).getTime()), Infinity))) : segunda;
  fim = avancar(hoje, 1);
 }
 const totais = new Map();
 for (const e of eventos) {const data = new Date(e.quando), chave = chaveDia(data); totais.set(chave, (totais.get(chave) || 0) + 1);}
 const serie = [];
 for (let data = new Date(inicio); data < fim; data = avancar(data, 1)) {
  serie.push({nome: nomesDias[data.getDay()], data: chaveDia(data), rotulo: data.toLocaleDateString('pt-BR', {weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric'}), quantidade: totais.get(chaveDia(data)) || 0, futuro: data > agora});
 }
 return {serie, total: serie.reduce((s, d) => s + d.quantidade, 0), inicio, fim};
}

export function obterFoco(estado, visao) {
 const prioridade = visao?.principal;
 if (prioridade) return {...prioridade, detalhe: prioridade.descricao || ''};
 const empresa = (estado.empresas || []).find(e => e.situacao === 'ativa' && e.etapa === 'negociacao');
 if (empresa) return {titulo: 'Continuar negociação', detalhe: empresa.nome, m: 'conversao.abrir-conversa', id: empresa.id};
 return {titulo: 'Nova oportunidade', detalhe: 'Cadastre uma empresa para começar.', acao: 'nova-empresa'};
}
