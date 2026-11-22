/* Painel inferior da Visão Geral: lê o estado existente, não altera negócios ou histórico. */
import {icone} from './icones.js';
import {textoSeguro as t} from './utilitarios.js';
import {iniciarAnimacoes} from './painel/animacoes.js';

const META_CHAVE='orbita-meta-mensagens-mes';
const META_PADRAO=500;
const ETAPAS=[
 ['encontrada','Encontradas','busca'],
 ['verificada','Verificadas','verificado'],
 ['mensagem','Mensagem enviada','aviao'],
 ['respondeu','Responderam','mensagem'],
 ['demonstracao','Demonstração enviada','monitor'],
 ['negociacao','Negociação','acordo'],
 ['proposta','Proposta enviada','dinheiro'],
 ['fechada','Fechadas','verificado']
];
const TIPOS_ATIVIDADE={
 'mensagem-enviada':['Mensagem enviada para','aviao'],
 'resposta':['Resposta recebida de','mensagem'],
 'demonstracao-apresentada':['Demonstração enviada para','monitor'],
 'proposta-enviada':['Proposta enviada para','dinheiro'],
 'venda':['Venda registrada com','verificado']
};
const inteiro=n=>new Intl.NumberFormat('pt-BR').format(n);
const dataValida=s=>{const d=new Date(s);return Number.isFinite(d.getTime())?d:null;};
const inicioDia=d=>new Date(d.getFullYear(),d.getMonth(),d.getDate());
const contar=(eventos,a,b)=>eventos.filter(e=>{const d=dataValida(e.quando);return d&&d>=a&&d<b;}).length;
const semanaInicial=hoje=>{const d=inicioDia(hoje);d.setDate(d.getDate()-((d.getDay()+6)%7));return d;};
const avancarDias=(data,n)=>{const d=new Date(data);d.setDate(d.getDate()+n);return d;};

export function obterMetaMensal(){
 try{const valor=Number(localStorage.getItem(META_CHAVE));return Number.isSafeInteger(valor)&&valor>=1&&valor<=1000000?valor:META_PADRAO;}catch{return META_PADRAO;}
}
export function salvarMetaMensal(valor){
 const n=Number(valor);
 if(!Number.isSafeInteger(n)||n<1||n>1000000)return false;
 try{localStorage.setItem(META_CHAVE,String(n));return true;}catch{return false;}
}

/* A contagem exige um evento de envio confirmado; abrir o WhatsApp não é envio. */
export function calcularAtividadeProspeccao(estado,agora=new Date()){
 const hoje=inicioDia(agora),amanha=avancarDias(hoje,1),semana=semanaInicial(agora),semanaAnterior=avancarDias(semana,-7);
 const mes=new Date(hoje.getFullYear(),hoje.getMonth(),1),mesAnterior=new Date(hoje.getFullYear(),hoje.getMonth()-1,1);
 const eventos=(estado.eventos||[]).filter(e=>e&&!e.revertido);
 const mensagens=eventos.filter(e=>e.tipo==='mensagem-enviada');
 const validas=mensagens.filter(e=>{const d=dataValida(e.quando);return d&&d<=agora;});
 const semanaDias=Array.from({length:7},(_,i)=>{
  const inicio=avancarDias(semana,i);
  return {nome:['Seg','Ter','Qua','Qui','Sex','Sáb','Dom'][i],quantidade:contar(validas,inicio,avancarDias(inicio,1)),futuro:inicio>agora};
 });
 const primeiroEnvio=new Map();
 for(const e of validas){if(!e.empresaId)continue;const d=dataValida(e.quando);if(!primeiroEnvio.has(e.empresaId)||d<primeiroEnvio.get(e.empresaId))primeiroEnvio.set(e.empresaId,d);}
 const respondidas=new Set();
 for(const e of eventos){if(e.tipo!=='resposta'||!primeiroEnvio.has(e.empresaId))continue;const d=dataValida(e.quando);if(d&&d>=primeiroEnvio.get(e.empresaId)&&d<=agora)respondidas.add(e.empresaId);}
 const recentes=eventos.filter(e=>TIPOS_ATIVIDADE[e.tipo]&&dataValida(e.quando)&&dataValida(e.quando)<=agora).sort((a,b)=>new Date(b.quando)-new Date(a.quando)).slice(0,3);
 const contagens=ETAPAS.map(([id,nome,desenho])=>({id,nome,desenho,quantidade:(estado.empresas||[]).filter(e=>e.etapa===id).length}));
 return {
  hoje:contar(validas,hoje,amanha),
  ontem:contar(validas,avancarDias(hoje,-1),hoje),
  semana:contar(validas,semana,avancarDias(semana,7)),
  semanaAnterior:contar(validas,semanaAnterior,semana),
  mes:contar(validas,mes,new Date(hoje.getFullYear(),hoje.getMonth()+1,1)),
  mesAnterior:contar(validas,mesAnterior,mes),
  total:mensagens.length,
  semanaDias,
  contagens,
  taxaResposta:primeiroEnvio.size?respondidas.size/primeiroEnvio.size:null,
  contatos:primeiroEnvio.size,
  responderam:respondidas.size,
  recentes
 };
}
/* ---------------------------------------------------------------------------
   Painel inferior no desenho da referência (Órbita). Coordenadas em pixels da
   arte original (1672 × 941); o CSS converte com --k, então a composição
   escala inteira no desktop e vira módulos empilhados no celular.
--------------------------------------------------------------------------- */
const ORIGEM={kpi:[44,230],cupula:[395,86],fluxo:[1250,118],ritmo:[44,576],foco:[660,555],mov:[1048,575]};
const tx=(mod,x,base,fonte,classe,conteudo,extra='',ls=0)=>{const [ox,oy]=Array.isArray(mod)?mod:ORIGEM[mod];return '<span class="pv-t '+classe+'" style="--x:'+(x-ox)+';--b:'+(base-oy)+';--f:'+fonte+(ls?';--ls:'+ls+'em':'')+'"'+extra+'>'+conteudo+'</span>';};
const caixa=(mod,x,y,w,h)=>{const [ox,oy]=Array.isArray(mod)?mod:ORIGEM[mod];return 'style="--x:'+(x-ox)+';--y:'+(y-oy)+';--w:'+w+';--h:'+h+'"';};
const DESENHOS_MOV={
 'mensagem-enviada':['Mensagem enviada','aviao'],
 'resposta':['Resposta registrada','mensagem'],
 'demonstracao-apresentada':['Demonstração enviada','monitor'],
 'proposta-enviada':['Proposta enviada','documento'],
 'proposta-aceita':['Proposta aceita','verificado'],
 'venda':['Venda registrada','trofeu'],
 'negociacao':['Negociação em andamento','acordo']
};
/* Ícones de traço no mesmo estilo da arte (laranja, linha fina). */
const ICONES_PV={
 aviao:'<path d="M21.5 3.2 2.8 10.4l6.9 2.7m11.8-9.9-8.2 17.1-3.6-7.2m11.8-9.9L9.7 13.1"/>',
 mensagem:'<path d="M4.5 5h15a2 2 0 0 1 2 2v8.5a2 2 0 0 1-2 2h-8l-4.6 3.4v-3.4H4.5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z"/><circle cx="8" cy="11.3" r=".6"/><circle cx="12" cy="11.3" r=".6"/><circle cx="16" cy="11.3" r=".6"/>',
 acordo:'<path d="m1.8 8.8 3.6-3.4 3.4 1.2 3-1.6 3 .2 3.2-1 4.2 3.8M1.8 8.8l4.4 6.3m-4.4-6.3 1.6 5.7m14.8-7.6-4.6.3-3.9 3.2 1.2 1.4 3.2-1.6 4.6 4.3m0 0-2 1.8-3-2.6m5-.7 1-2.9m-6 4.2-1.6 1.6-2.6-2.4m4.2.8-1.8 1.8-2.2-1.9m-1.9-.1-1.5 1.6"/>',
 documento:'<path d="M6 2.5h8.5L19 7v14.5H6Zm8.5 0V7H19M9 11h7M9 14.5h7M9 18h5"/>',
 verificado:'<path d="m8 12.2 2.8 2.8 5.4-6M21.5 12a9.5 9.5 0 1 1-19 0 9.5 9.5 0 0 1 19 0Z"/>',
 trofeu:'<path d="M7 3.5h10v5.2a5 5 0 0 1-10 0Zm0 1.8H3.8c0 3.4 1.4 5 3.6 5.3M17 5.3h3.2c0 3.4-1.4 5-3.6 5.3M12 13.7v3.6m-3.6 3.6h7.2l-.8-3.6H9.2Z"/>',
 monitor:'<path d="M3 4h18v12H3Zm5 16.5h8M12 16v4.5"/>',
 alvo2:'<circle cx="12" cy="12" r="7.5"/><circle cx="12" cy="12" r="3.2"/><path d="M12 1.5v5M12 17.5v5M1.5 12h5M17.5 12h5"/>',
 coroa:'<path d="m3 7.5 4.6 4.2L12 5l4.4 6.7L21 7.5l-1.8 10.5H4.8Zm1.8 13h14.4"/>',
 brilho:'<path d="M12 2.5c.6 4.6 2.9 7 9.5 9.5-6.6 2.5-8.9 4.9-9.5 9.5-.6-4.6-2.9-7-9.5-9.5 6.6-2.5 8.9-4.9 9.5-9.5Z"/>'
};
const ipv=(nome,classe='')=>'<svg class="pv-icone '+classe+'" viewBox="0 0 24 24" aria-hidden="true">'+(ICONES_PV[nome]||ICONES_PV.brilho)+'</svg>';

const dentro=(e,a,b)=>{const d=dataValida(e.quando);return d&&d>=a&&d<b;};
/* Indicadores da referência, calculados só com eventos confirmados do CRM. */
export function calcularPainelOrbita(estado,agora=new Date()){
 const base=calcularAtividadeProspeccao(estado,agora);
 const hoje=inicioDia(agora),semana=semanaInicial(agora),fimSemana=avancarDias(semana,7);
 const mes=new Date(hoje.getFullYear(),hoje.getMonth(),1),mesSeguinte=new Date(hoje.getFullYear(),hoje.getMonth()+1,1),mesAnterior=new Date(hoje.getFullYear(),hoje.getMonth()-1,1);
 const eventos=(estado.eventos||[]).filter(e=>e&&!e.revertido&&dataValida(e.quando)&&dataValida(e.quando)<=agora);
 const empresas=estado.empresas||[];
 const unicas=(lista)=>new Set(lista.map(e=>e.empresaId||e.id)).size;
 const vendaEv=e=>e.tipo==='venda'||(e.tipo==='etapa'&&e.para==='fechada');
 const negEv=e=>e.tipo==='etapa'&&(e.para==='negociacao'||e.para==='proposta');
 const periodo=(filtro,a,b,unico)=>{const l=eventos.filter(e=>filtro(e)&&dentro(e,a,b));return unico?unicas(l):l.length;};
 const par=(filtro,unico)=>({atual:periodo(filtro,mes,mesSeguinte,unico),anterior:periodo(filtro,mesAnterior,mes,unico)});
 const kpis={
  enviadas:par(e=>e.tipo==='mensagem-enviada'),
  respostas:par(e=>e.tipo==='resposta'),
  negociacoes:par(negEv,true),
  vendas:par(vendaEv,true)
 };
 const conta=ids=>empresas.filter(e=>ids.includes(e.etapa)).length;
 const fluxo=[
  ['Encontradas','encontrada',conta(['encontrada'])],
  ['Verificadas','verificada',conta(['verificada'])],
  ['Contato','mensagem',conta(['mensagem'])],
  ['Resposta','respondeu',conta(['respondeu','demonstracao'])],
  ['Negociação','negociacao',conta(['negociacao','proposta'])],
  ['Venda','fechada',conta(['fechada'])]
 ];
 const movimentos=eventos.filter(e=>DESENHOS_MOV[e.tipo]||negEv(e)).sort((a,b)=>new Date(b.quando)-new Date(a.quando)).slice(0,4).map(e=>({...e,chave:negEv(e)?'negociacao':e.tipo}));
 const peso={fechada:5,proposta:4,negociacao:4,demonstracao:3,respondeu:3,mensagem:2,verificada:1,encontrada:0};
 const ultimo=new Map();for(const e of eventos){const q=String(e.quando);if(!ultimo.has(e.empresaId)||q>ultimo.get(e.empresaId))ultimo.set(e.empresaId,q);}
 const pinos=empresas.filter(e=>e.situacao!=='nao-contatar').slice().sort((a,b)=>(peso[b.etapa]??0)-(peso[a.etapa]??0)||String(ultimo.get(b.id)||'').localeCompare(String(ultimo.get(a.id)||''))).slice(0,9)
  .map(e=>({id:e.id,nome:e.nome,etapa:e.etapa,quente:['negociacao','proposta','fechada'].includes(e.etapa)}));
 return {
  ...base,
  kpis,fluxo,movimentos,pinos,
  radar:empresas.length,
  emNegociacao:conta(['negociacao','proposta']),
  vendasSemana:periodo(vendaEv,semana,fimSemana,true),
  hojeIndice:(agora.getDay()+6)%7
 };
}

const animarNumero=(el,valor)=>{const de=Number(el.dataset.v||0);el.dataset.v=valor;if(de===valor||matchMedia('(prefers-reduced-motion: reduce)').matches||document.documentElement.classList.contains('movimento-pausado')){el.textContent=inteiro(valor);return;}const t0=performance.now(),dur=900;const passo=a=>{const k=Math.min(1,(a-t0)/dur),e=1-Math.pow(1-k,3);el.textContent=inteiro(Math.round(de+(valor-de)*e));if(k<1)requestAnimationFrame(passo);};requestAnimationFrame(passo);};
const pilula=({atual,anterior})=>{
 if(!anterior){return atual?['↑ +'+inteiro(atual),'pv-alta',inteiro(atual)+' a mais que no mês anterior, que não teve registros']:['+0','','Sem registros neste mês e no anterior'];}
 const pct=Math.round((atual-anterior)/anterior*100);
 return [(pct>0?'↑ +':pct<0?'↓ −':'')+Math.abs(pct)+'%',pct>0?'pv-alta':pct<0?'pv-queda':'',(pct>0?'+':'')+pct+'% em relação ao mês anterior'];
};
const relativo=(quando,agora=Date.now())=>{
 const m=Math.max(0,Math.round((agora-new Date(quando))/60000));
 if(m<1)return 'agora';if(m<60)return 'há '+m+' min';const h=Math.round(m/60);if(h<24)return 'há '+h+' h';const d=Math.round(h/24);return d<30?'há '+d+(d===1?' dia':' dias'):new Date(quando).toLocaleDateString('pt-BR',{day:'2-digit',month:'short'});
};

/* Posições dos pinos sobre a ilha (pixels da arte). */
export const PINOS=[[553,346],[645,355],[718,325],[1015,340],[1117,361],[1200,355],[610,449],[1050,437],[455,374]];
const ROTULOS_KPI=[['enviadas','Mensagens enviadas','aviao',{acao:'mensagens'}],['respostas','Respostas recebidas','mensagem',{acao:'conversao'}],['negociacoes','Negociações','acordo',{etapa:'negociacao'}],['vendas','Vendas fechadas','trofeu',{etapa:'fechada'}]];
const LINHAS_KPI=[[275,296],[351,372],[428,450],[505,528]];
const ANEIS=[[1337,1451,234.5,15,16.5],[1340,1451,288.5,15,16.5],[1349,1445,341,14.8,16],[1357,1444,393,14,16],[1361,1452,443,11,16],[1371,1433,493,14.3,15.5]];
const ANEIS_CAIXA=[[1262,210,268,36],[1270,262,252,40],[1282,315,228,40],[1294,368,206,40],[1308,420,176,40],[1322,472,148,40]];
const DIAS_X=[115,196,274,352.5,430.5,509,587.5];
const atr=o=>o.acao?'data-acao="'+o.acao+'"':'data-etapa="'+o.etapa+'"';

function montar(alvo){
 alvo.classList.add('pv-painel');
 const h=[];
 h.push('<div class="pv-palco">');
 h.push('<div class="pv-placa" aria-hidden="true"></div><canvas class="pv-agua" aria-hidden="true"></canvas>');
 /* Indicadores */
 h.push('<section class="pv-m pv-kpi" aria-label="Indicadores do mês"><div class="pv-fundo" aria-hidden="true"></div>');
 ROTULOS_KPI.forEach(([chave,rotulo,desenho,acao],i)=>{
  const [bn,bl]=LINHAS_KPI[i],y=[244,320,397,474][i];
  h.push('<button class="pv-alvo pv-kpi-linha" '+atr(acao)+' '+caixa('kpi',58,y,334,70)+' data-pv-kpi="'+chave+'"></button>');
    h.push(tx('kpi',136,bn-.5,23.5,'pv-num','0',' data-pv-n="'+chave+'" aria-hidden="true"'));
  h.push(tx('kpi',136,bl,16.5,'pv-rot',rotulo,' aria-hidden="true"',-.035));
  h.push('<span class="pv-pilula" aria-hidden="true" data-pv-pc="'+chave+'" '+caixa('kpi',302,[250,327,404,481][i],86,42)+'><img src="ativos/painel/selo.webp" alt=""><b data-pv-p="'+chave+'">—</b></span>');
 });
 h.push('</section>');
 /* Cúpula */
 h.push('<section class="pv-m pv-cupula" aria-label="Radar de oportunidades"><div class="pv-fundo" aria-hidden="true"></div><canvas class="pv-fx" aria-hidden="true"></canvas><div class="pv-pinos"></div>');
 h.push('<button class="pv-balao pv-b-radar" data-acao="empresas" '+caixa('cupula',527,213,202,65)+'><span class="pv-balao-ic" aria-hidden="true">'+ipv('alvo2')+'</span>'+tx([527,213],590,241.5,18.5,'pv-b1','<b data-pv="radar">0</b> empresas')+tx([527,213],590,262.7,14.8,'pv-b2','no radar')+'</button>');
 h.push('<button class="pv-balao pv-b-neg" data-etapa="negociacao" '+caixa('cupula',990,236,209,63)+'><span class="pv-balao-ic" aria-hidden="true">'+ipv('coroa')+'</span>'+tx([990,236],1050,262.4,16.4,'pv-b1','<b data-pv="neg">0</b> em negociação')+tx([990,236],1050,283,14.1,'pv-b2','Em andamento')+'</button>');
 h.push('<button class="pv-balao pv-b-venda" data-etapa="fechada" '+caixa('cupula',738,397,173,66)+'><span class="pv-balao-ic" aria-hidden="true">'+ipv('verificado')+'</span>'+tx([738,397],802,425.5,18.5,'pv-b1','<b data-pv="vendas">0</b> <i data-pv="vendas-rot">vendas</i>','',.03)+tx([738,397],802,447,14.7,'pv-b2','esta semana')+'</button>');
 h.push('</section>');
 /* Fluxo comercial + ampulheta */
 h.push('<section class="pv-m pv-fluxo" aria-labelledby="pv-tit-fluxo"><div class="pv-fundo" aria-hidden="true"></div><canvas class="pv-fx" aria-hidden="true"></canvas>');
 h.push(tx('fluxo',1312,158,19.5,'pv-tit','Fluxo Comercial',' id="pv-tit-fluxo" role="heading" aria-level="3"',-.014)+tx('fluxo',1312,180,14,'pv-sub','Evolução das oportunidades','',-.015));
 ANEIS.forEach(([xr,xn,b,fr,fn],i)=>{h.push('<button class="pv-alvo pv-anel" data-pv-anel="'+i+'" '+caixa('fluxo',...ANEIS_CAIXA[i])+'></button>'+tx('fluxo',xr,b,fr,'pv-anel-rot','',' data-pv-ar="'+i+'" aria-hidden="true"')+tx('fluxo',xn,b,fn,'pv-anel-num','0',' data-pv-an="'+i+'" aria-hidden="true"'));});
 h.push('<figure class="pv-ampulheta" '+caixa('fluxo',1417,160,341,371)+'><canvas aria-hidden="true"></canvas><figcaption class="pv-so-leitor"><span data-pv-relogio>Ampulheta de 2 minutos</span></figcaption></figure>');
 h.push('</section>');
 /* Ritmo de prospecção */
 h.push('<section class="pv-m pv-ritmo" aria-labelledby="pv-tit-ritmo"><div class="pv-fundo" aria-hidden="true"></div>');
 h.push('<span class="pv-pulso" aria-hidden="true" '+caixa('ritmo',58,590,62,48)+'><img src="ativos/painel/ritmo-icone.webp" alt=""><svg viewBox="0 0 62 48"><path pathLength="100" d="M12 26H25L28 22L31 26L36 8L43 40L47 22L50 26H56"/></svg></span>');
 h.push('<div class="pv-ritmo-cab">'+tx('ritmo',135,611.8,19,'pv-tit','Ritmo de Prospecção',' id="pv-tit-ritmo" role="heading" aria-level="3"',-.03)+tx('ritmo',135,630,13.5,'pv-sub','Atividade ao longo da semana','',-.036)+'</div>');
 h.push('<div class="pv-grafico" '+caixa('ritmo',48,600,590,156)+'><canvas aria-hidden="true"></canvas><div class="pv-dica" hidden></div></div>');
 h.push('<div class="pv-dias" role="group" aria-label="Mensagens confirmadas por dia desta semana">');
 DIAS_X.forEach((x,i)=>h.push('<button class="pv-dia" data-pv-dia="'+i+'" style="--cx:'+(x-ORIGEM.ritmo[0])+'"><span>'+['Seg','Ter','Qua','Qui','Sex','Sáb','Dom'][i]+'</span></button>'));
 h.push('</div></section>');
 /* Foco da semana */
 h.push('<section class="pv-m pv-foco" aria-label="Foco da semana"><div class="pv-fundo" aria-hidden="true"></div><canvas class="pv-fx" aria-hidden="true"></canvas>');
 h.push('<button class="pv-foco-alvo" data-pv-foco '+caixa('foco',728,600,216,180)+'>'+tx([728,600],836,679,19.3,'pv-foco-1','Foco da Semana')+tx([728,600],836,705,18,'pv-foco-2','',' data-pv="foco"',-.02)+'</button>');
 h.push('</section>');
 h.push('</div>');
 alvo.innerHTML=h.join('');
}

function atualizar(alvo,d,estado,visao){
 const $=s=>alvo.querySelector(s),inteiroF=n=>inteiro(n||0);
 for(const [chave,rotulo] of ROTULOS_KPI.map(x=>[x[0],x[1]])){
  const k=d.kpis[chave],[texto,classe,titulo]=pilula(k);
  animarNumero($('[data-pv-n="'+chave+'"]'),k.atual||0);
  $('[data-pv-p="'+chave+'"]').textContent=texto;const p=$('[data-pv-pc="'+chave+'"]');p.className='pv-pilula '+classe;p.title=titulo;
  $('[data-pv-kpi="'+chave+'"]').setAttribute('aria-label',inteiroF(k.atual)+' '+rotulo.toLowerCase()+' neste mês. '+titulo+'.');
 }
 animarNumero($('[data-pv="radar"]'),d.radar);
 $('[data-pv="neg"]').textContent=inteiroF(d.emNegociacao);
 $('[data-pv="vendas"]').textContent=inteiroF(d.vendasSemana);
 $('[data-pv="vendas-rot"]').textContent=d.vendasSemana===1?'venda':'vendas';
 d.fluxo.forEach(([nome,etapa,n],i)=>{$('[data-pv-ar="'+i+'"]').textContent=nome;animarNumero($('[data-pv-an="'+i+'"]'),n);const b=$('[data-pv-anel="'+i+'"]');b.dataset.etapa=etapa;b.setAttribute('aria-label',nome+': '+inteiroF(n)+(n===1?' empresa':' empresas')+' na etapa atual');});
 /* Pinos: um por empresa (até 9), em posições ilustrativas da ilha. */
 $('.pv-pinos').innerHTML=d.pinos.map((p,i)=>{const [x,y]=PINOS[i];return '<button class="pv-pino'+(p.quente?' pv-quente':'')+'" data-empresa="'+t(p.id)+'" style="--x:'+(x-ORIGEM.cupula[0])+';--y:'+(y-ORIGEM.cupula[1])+';--i:'+i+'" aria-label="'+t(p.nome)+'"><span class="pv-pino-rot">'+t(p.nome)+'</span></button>';}).join('');
 /* Foco */
 const a=visao?.principal||{titulo:'Nova oportunidade',descricao:'Cadastre uma empresa para começar.',acao:'nova-empresa'};
 const foco=$('[data-pv-foco]');delete foco.dataset.acao;delete foco.dataset.m;delete foco.dataset.id;
 if(a.m){foco.dataset.m=a.m;foco.dataset.id=a.id||'';}else foco.dataset.acao=a.acao;
 $('[data-pv="foco"]').textContent=a.titulo;foco.setAttribute('aria-label','Foco da semana: '+a.titulo+'. '+(a.descricao||''));foco.title=a.descricao||'';
 /* Ritmo: dados entregues ao gráfico animado. */
 const dias=$('.pv-dias');
 d.semanaDias.forEach((dia,i)=>{const b=dias.children[i];b.setAttribute('aria-label',dia.nome+': '+dia.quantidade+(dia.quantidade===1?' mensagem confirmada':' mensagens confirmadas')+(dia.futuro?' (dia ainda não chegou)':''));b.classList.toggle('pv-hoje',i===d.hojeIndice);b.classList.toggle('pv-futuro',dia.futuro);});
 iniciarAnimacoes(alvo,{dias:d.semanaDias,hoje:d.hojeIndice,pinos:d.pinos.length,quentes:d.pinos.map(p=>p.quente),qualidade:estado.preferencias?.qualidade});
}

export function renderizarPainelProspeccao(alvo,estado,visao){
 if(!alvo)return;
 if(!alvo.querySelector('.pv-palco'))montar(alvo);
 atualizar(alvo,calcularPainelOrbita(estado),estado,visao);
}
