/* Agregação dos eventos brutos das demonstrações. Termos: visualização ≠ sessão estimada ≠ visitante estimado ≠ interação ≠ conversão observada. */
const INTERACOES=new Set(['botao','servico','faq','ancora','whatsapp','telefone']);
const mediana=a=>{if(!a.length)return null;const s=[...a].sort((x,y)=>x-y),m=s.length>>1;return s.length%2?s[m]:(s[m-1]+s[m])/2;};
export function agregar(eventosBrutos,{agora=Date.now()}={}){
 const vistos=new Set(),eventos=[];
 for(const e of eventosBrutos||[]){if(!e||!e.i||vistos.has(e.i))continue;vistos.add(e.i);eventos.push(e);}
 eventos.sort((a,b)=>a.ts-b.ts);
 // consentimento concedido depois da visualização anônima: o evento "sessao" liga a visualização já contada à sessão (sem contar duas vezes)
 const ligacoes=new Map(eventos.filter(e=>e.t==='sessao'&&e.s).map(e=>[e.v,e]));
 for(let k=0;k<eventos.length;k++){const e=eventos[k];if(e.t==='pagina'&&!e.s&&ligacoes.has(e.i)){const l=ligacoes.get(e.i);eventos[k]={...e,s:l.s,disp:e.disp||l.disp,org:e.org||l.org,recorrente:e.recorrente||l.recorrente};}}
 const por=t=>eventos.filter(e=>e.t===t),paginas=por('pagina');
 const sess=new Map();for(const e of eventos){if(!e.s)continue;if(!sess.has(e.s))sess.set(e.s,{id:e.s,eventos:[],disp:e.disp,org:e.org,inicio:e.ts,fim:e.ts});const s=sess.get(e.s);s.eventos.push(e);s.fim=Math.max(s.fim,e.ts);s.inicio=Math.min(s.inicio,e.ts);}
 const sessoes=[...sess.values()];
 const comConsent=paginas.filter(e=>e.s).length,semConsent=paginas.length-comConsent;
 const secoes={};for(const s of sessoes)for(const x of new Set(s.eventos.filter(e=>e.t==='secao').map(e=>e.v)))secoes[x]=(secoes[x]||0)+1;
 const cont=t=>eventos.filter(e=>e.t===t).length,contSessao=t=>sessoes.filter(s=>s.eventos.some(e=>e.t===t)).length;
 const tempos=sessoes.map(s=>s.eventos.filter(e=>e.t==='tempo').reduce((a,e)=>a+Number(e.v||0),0)).filter(x=>x>0);
 const dist=campo=>{const o={};for(const e of paginas){const k=e[campo]||'desconhecido';o[k]=(o[k]||0)+1;}return o;};
 const dias={};for(const e of paginas){const d=new Date(e.ts).toISOString().slice(0,10);dias[d]=(dias[d]||0)+1;}
 const interagiu=sessoes.filter(s=>s.eventos.some(e=>INTERACOES.has(e.t)));
 const contatos=sessoes.filter(s=>s.eventos.some(e=>e.t==='whatsapp'||e.t==='telefone'));
 const retornos=sessoes.filter(s=>s.eventos.some(e=>(e.t==='pagina'||e.t==='sessao')&&e.recorrente)).length;
 const r={
  vazio:eventos.length===0,
  visualizacoes:paginas.length,
  visualizacoesComAcompanhamento:comConsent,visualizacoesSemSessao:semConsent,
  sessoesEstimadas:sessoes.length,
  visitantesEstimados:sessoes.length?sessoes.length-retornos:null,visitantesRecorrentes:retornos,
  eventosInteracao:eventos.filter(e=>INTERACOES.has(e.t)).length,
  conversoesObservadas:{whatsapp:cont('whatsapp'),telefone:cont('telefone'),sessoesComContato:contatos.length},
  primeiroAcesso:eventos.length?eventos[0].ts:null,ultimoAcesso:eventos.length?eventos.at(-1).ts:null,
  tempo:{medianaSegundos:mediana(tempos),sessoesMedidas:tempos.length},
  secoes:Object.fromEntries(Object.entries(secoes).sort((a,b)=>b[1]-a[1])),retencaoPorSecao:sessoes.length?Object.fromEntries(Object.entries(secoes).map(([k,v])=>[k,v/sessoes.length])):{},
  interacoes:{botao:cont('botao'),servico:cont('servico'),faq:cont('faq'),ancora:cont('ancora')},
  dispositivos:dist('disp'),origens:dist('org'),linhaDoTempo:Object.entries(dias).sort().map(([dia,v])=>({dia,visualizacoes:v})),
  funil:sessoes.length?[['Sessões com acompanhamento',sessoes.length],['Viram 3 ou mais seções',sessoes.filter(s=>new Set(s.eventos.filter(e=>e.t==='secao').map(e=>e.v)).size>=3).length],['Interagiram',interagiu.length],['Clicaram em contato',contatos.length]]:[],
  recentes:eventos.slice(-20).reverse().map(e=>({quando:e.ts,tipo:e.t,valor:e.v||'',disp:e.disp||null})),
  qualidade:{eventos:eventos.length,duplicadosIgnorados:(eventosBrutos||[]).length-eventos.length,
   aviso:'Sessões e visitantes são ESTIMATIVAS por navegador, só existem quando o visitante aceitou o acompanhamento. Visualizações sem aceite são contadas de forma anônima e não formam sessão. Não identificam pessoas; o link pode ter sido encaminhado. Robôs são filtrados de forma imperfeita.'}
 };
 return r;
}
export function compararModelos(publicacoes,agregados){
 const grupos=new Map();for(const p of publicacoes){const a=agregados[p.id];if(!a||a.vazio)continue;const g=grupos.get(p.modeloId)||{modelo:p.modeloId,demos:0,visualizacoes:0,sessoes:0,contatos:0,interacoes:0};g.demos++;g.visualizacoes+=a.visualizacoes;g.sessoes+=a.sessoesEstimadas;g.contatos+=a.conversoesObservadas.sessoesComContato;g.interacoes+=a.eventosInteracao;grupos.set(p.modeloId,g);}
 return [...grupos.values()].map(g=>({...g,taxaContato:g.sessoes?g.contatos/g.sessoes:null,suficiente:g.sessoes>=20})).sort((a,b)=>b.visualizacoes-a.visualizacoes);
}
