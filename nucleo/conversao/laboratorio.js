/* Laboratório de conversão: experimentos controlados, diagnóstico do funil, memória comercial regularizada e simulador de negociação (dados fictícios isolados). */
import {eventosDaEmpresa,novoId,registrarAuditoria} from '../esquema.js';
import {conv,podeContatar,qualificar} from './dominio.js';
import {wilson,fisherExato,tamanhoEfeitoH,holm} from '../quant/estatistica.js';
import {analisarResposta,auditarMensagem,normal} from './linguagem.js';
import {gerarAbordagens} from './abordagens.js';
const ALFA=.05;
function prng(seed){let s=(seed>>>0)||1;return()=>{s=(s*1664525+1013904223)>>>0;return s/4294967296;};}
export const criterios={'resposta':'Qualquer resposta','resposta-positiva':'Resposta positiva (interesse médio/alto ou pedido de demonstração)','demonstracao-aceita':'Demonstração aceita','venda':'Venda'};
/* ---------- experimentos ---------- */
export function criarExperimentoConversao(estado,{nome,hipotese,criterio='resposta-positiva',variantes,nMinimoPorVariante=20,olhadas=3,nicho='',semente}){
 if(!nome?.trim()||!hipotese?.trim())throw Error('Informe o nome e a hipótese.');if(!criterios[criterio])throw Error('Critério de sucesso inválido.');if(!Array.isArray(variantes)||variantes.length<2||variantes.length>4)throw Error('Use de 2 a 4 variantes.');
 if(nMinimoPorVariante<10)throw Error('O mínimo por variante não pode ser menor que 10: com menos, nenhuma conclusão é possível.');
 const x={id:novoId(),nome:nome.trim(),hipotese:hipotese.trim(),criterio,tipo:'primeiro-contato',ativo:true,conv:true,criadoEm:new Date().toISOString(),inicio:new Date().toISOString(),nicho,nMinimoPorVariante,olhadas:Math.max(1,olhadas),analises:[],desvios:[],atribuicoes:[],semente:semente??Math.floor(Math.random()*2**31),variantes:variantes.map((v,i)=>({id:'v'+(i+1),nome:v.nome||('Variante '+(i+1)),abordagem:v.abordagem||'',texto:v.texto||''})),periodoObservacaoDias:14};
 estado.experimentos.push(x);registrarAuditoria(estado,'experimento',x.id,'Experimento de conversão criado: '+x.nome);return x;
}
export function elegiveis(estado,exp){
 const ocupadas=new Set(estado.experimentos.filter(x=>x.conv&&x.ativo&&x.id!==exp.id).flatMap(x=>x.atribuicoes.map(a=>a.empresaId)));
 return estado.empresas.filter(e=>e.situacao==='ativa'&&podeContatar(e,'whatsapp').ok&&!exp.atribuicoes.some(a=>a.empresaId===e.id)&&!ocupadas.has(e.id)&&(!exp.nicho||e.nicho===exp.nicho)&&!eventosDaEmpresa(estado,e.id,'mensagem-enviada').length&&qualificar(estado,e).potencial!=='baixo');
}
export function distribuir(estado,exp,empresaIds){
 const r=prng(exp.semente+exp.atribuicoes.length),ids=empresaIds.filter(id=>!exp.atribuicoes.some(a=>a.empresaId===id)),estratos=new Map();
 for(const id of ids){const e=estado.empresas.find(x=>x.id===id);if(!e||!podeContatar(e,'whatsapp').ok)continue;const k=e.nicho||'sem-nicho';if(!estratos.has(k))estratos.set(k,[]);estratos.get(k).push(id);}
 const cont=Object.fromEntries(exp.variantes.map(v=>[v.id,exp.atribuicoes.filter(a=>a.varianteId===v.id).length])),novos=[];
 for(const [k,lista] of estratos){for(let i=lista.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[lista[i],lista[j]]=[lista[j],lista[i]];}
  for(const id of lista){const alvo=exp.variantes.map(v=>v.id).sort((a,b)=>cont[a]-cont[b]||(r()<.5?-1:1))[0];cont[alvo]++;const a={empresaId:id,varianteId:alvo,estrato:k,atribuidaEm:new Date().toISOString(),enviada:false};exp.atribuicoes.push(a);novos.push(a);}}
 return novos;
}
const positiva=(estado,id)=>eventosDaEmpresa(estado,id,'resposta').some(r=>['medio','alto'].includes(r.interesse)||r.pediuDemo);
const cumpre=(estado,id,crit)=>crit==='resposta'?eventosDaEmpresa(estado,id,'resposta').length>0:crit==='resposta-positiva'?positiva(estado,id):crit==='demonstracao-aceita'?eventosDaEmpresa(estado,id,'resposta').some(r=>r.pediuDemo)||eventosDaEmpresa(estado,id,'demonstracao-apresentada').length>0:eventosDaEmpresa(estado,id).some(e=>e.tipo==='venda'||e.tipo==='proposta-aceita');
export function diferencaNewcombe(x1,n1,x2,n2){const a=wilson(x1,n1),b=wilson(x2,n2);if(!a||!b)return null;const p1=x1/n1,p2=x2/n2,d=p1-p2;return {d,baixo:d-Math.sqrt((p1-a.baixo)**2+(b.alto-p2)**2),alto:d+Math.sqrt((a.alto-p1)**2+(p2-b.baixo)**2)};}
export function resultadoExperimentoConversao(estado,exp,{registrarOlhada=false}={}){
 const linhas=exp.variantes.map(v=>{const atr=exp.atribuicoes.filter(a=>a.varianteId===v.id),enviadas=atr.filter(a=>eventosDaEmpresa(estado,a.empresaId,'mensagem-enviada').some(m=>m.experimentoId===exp.id));
  const sub=(f)=>enviadas.filter(a=>f(a.empresaId)).length;const receita=enviadas.reduce((s,a)=>s+estado.pagamentos.filter(p=>p.empresaId===a.empresaId&&p.estado==='confirmado').reduce((t,p)=>t+Number(p.valor),0),0);
  const m={variante:v,atribuidas:atr.length,enviadas:enviadas.length,naoEnviadas:atr.length-enviadas.length,respostas:sub(id=>cumpre(estado,id,'resposta')),positivas:sub(id=>positiva(estado,id)),demos:sub(id=>cumpre(estado,id,'demonstracao-aceita')),vendas:sub(id=>cumpre(estado,id,'venda')),recusas:sub(id=>eventosDaEmpresa(estado,id,'perda').length>0),pediuParar:sub(id=>estado.empresas.find(e=>e.id===id)?.situacao==='nao-contatar'&&eventosDaEmpresa(estado,id,'resposta').length>0),receita};
  m.sucesso=sub(id=>cumpre(estado,id,exp.criterio));m.taxa=m.enviadas?m.sucesso/m.enviadas:null;m.ic=wilson(m.sucesso,m.enviadas);m.taxaVenda=m.enviadas?m.vendas/m.enviadas:null;m.taxaRecusa=m.enviadas?m.recusas/m.enviadas:null;return m;});
 const ord=linhas.filter(l=>l.enviadas>0).sort((a,b)=>b.taxa-a.taxa),minimo=exp.nMinimoPorVariante,suf=linhas.every(l=>l.enviadas>=minimo);
 const looksFeitos=exp.analises.length+(registrarOlhada?1:0),limiar=ALFA/exp.olhadas;
 let veredito={tipo:'amostra',texto:`Amostra insuficiente: cada variante precisa de ${minimo} mensagens enviadas (menor: ${Math.min(...linhas.map(l=>l.enviadas))}). Nenhuma variante vencedora é declarada.`};let comparacao=null,ajustados=null;
 if(ord.length>=2){const [a,b]=ord,p=fisherExato(a.sucesso,a.enviadas-a.sucesso,b.sucesso,b.enviadas-b.sucesso);comparacao={melhor:a.variante.nome,outra:b.variante.nome,diferencaAbs:a.taxa-b.taxa,diferencaRel:b.taxa?(a.taxa-b.taxa)/b.taxa:null,ic:diferencaNewcombe(a.sucesso,a.enviadas,b.sucesso,b.enviadas),p,h:tamanhoEfeitoH(a.taxa,b.taxa),metodo:'Teste exato de Fisher; intervalo de Newcombe (Wilson) para a diferença; h de Cohen como tamanho de efeito.'};
  if(ord.length>2){const ps=ord.slice(1).map(o=>fisherExato(a.sucesso,a.enviadas-a.sucesso,o.sucesso,o.enviadas-o.sucesso));ajustados=holm(ps);comparacao.pAjustadoHolm=ajustados;}
  const pFinal=ajustados?Math.max(...ajustados):p;
  if(!suf)veredito.tipo='amostra';else if(pFinal<limiar){veredito={tipo:'evidencia',texto:`Há evidência de diferença no critério "${criterios[exp.criterio]}": ${a.variante.nome} (${(a.taxa*100).toFixed(1)}%) vs ${b.variante.nome} (${(b.taxa*100).toFixed(1)}%), p=${pFinal.toFixed(4)} abaixo do limiar ${limiar.toFixed(4)} (α=0,05 dividido entre ${exp.olhadas} análise(s) planejada(s)). Isso não garante o mesmo resultado no futuro.`,vencedora:a.variante.id};}
  else veredito={tipo:'inconclusivo',texto:`Sem diferença clara com o limiar ${limiar.toFixed(4)} (p=${pFinal.toFixed(3)}). Continue coletando ou encerre sem declarar vencedora.`};}
 const alertas=[];
 if(comparacao&&veredito.tipo==='evidencia'){const [a,b]=ord;if(a.taxaVenda!=null&&b.taxaVenda!=null&&a.vendas<=b.vendas)alertas.push(`Atenção: ${a.variante.nome} teve melhor taxa no critério primário, mas não gerou mais vendas (${a.vendas} vs ${b.vendas}). Mais respostas não significam mais vendas.`);if(a.taxaRecusa>b.taxaRecusa)alertas.push(`${a.variante.nome} também gerou mais recusas (${a.recusas} vs ${b.recusas}): a melhor taxa pode vir com mais respostas negativas.`);}
 if(linhas.some(l=>l.naoEnviadas>0))alertas.push('Há empresas atribuídas que ainda não receberam a mensagem (ou você optou por não enviar); a taxa usa só mensagens efetivamente enviadas e confirmadas.');
 if(registrarOlhada){exp.analises.push({quando:new Date().toISOString(),veredito:veredito.tipo,enviadas:linhas.map(l=>l.enviadas)});if(exp.analises.length>exp.olhadas)alertas.push(`Você já olhou ${exp.analises.length} vezes (planejado: ${exp.olhadas}). Olhadas extras inflam falsos positivos; trate com cautela.`);}
 return {linhas,veredito,comparacao,alertas,limiar,looksFeitos,controlado:exp.atribuicoes.length>0,observacao:exp.atribuicoes.length?'Experimento controlado: variantes distribuídas por sorteio estratificado por nicho.':'Sem distribuição registrada: comparação apenas observacional.'};
}
export function registrarDesvio(estado,exp,texto){exp.desvios.push({quando:new Date().toISOString(),texto});registrarAuditoria(estado,'experimento',exp.id,'Desvio: '+texto);}
/* ---------- diagnóstico do funil ---------- */
const transicoes=[
 {id:'msg-resp',de:'Mensagens enviadas (empresas únicas)',para:'Responderam',hip:['Qualidade da seleção das empresas','Canal e consentimento','Credibilidade do remetente','Abordagem parecendo spam ou longa demais','Contato com atendente sem poder de decisão'],exp:'Comparar duas abordagens (ex.: direta vs consultiva) em empresas do mesmo nicho, com sorteio.',metrica:'Taxa de resposta por abordagem'},
 {id:'resp-int',de:'Responderam',para:'Demonstraram interesse',hip:['Proposta de valor pouco clara','Resposta apenas educada','Oferta antes de entender a necessidade'],exp:'Testar uma pergunta de necessidade antes da oferta vs oferta direta.',metrica:'Taxa de interesse entre quem respondeu'},
 {id:'int-demo',de:'Demonstraram interesse',para:'Aceitaram/receberam demonstração',hip:['Atrito para enviar/ver a prévia','Link inesperado gerando desconfiança','Demora para produzir'],exp:'Oferecer prévia com pergunta de permissão vs enviar já pronta.',metrica:'Demonstrações aceitas entre interessados'},
 {id:'demo-prop',de:'Receberam demonstração',para:'Receberam proposta',hip:['Site pouco conectado à necessidade real','Falta de feedback estruturado','Preço apresentado cedo ou tarde'],exp:'Pedir feedback estruturado antes de falar de preço vs falar de preço junto.',metrica:'Propostas entre quem recebeu demonstração'},
 {id:'prop-venda',de:'Receberam proposta',para:'Compraram',hip:['Confiança no desenvolvedor','Preço/condições/orçamento','Autoridade de decisão','Momento de compra','Dúvidas sobre manutenção e hospedagem'],exp:'Testar apresentação da proposta com opções de pagamento em etapas vs valor único.',metrica:'Vendas entre quem recebeu proposta'}
];
export function diagnosticarFunil(estado,{nMinimo=10,agora=Date.now()}={}){
 const emps=estado.empresas.map(e=>({e,ev:eventosDaEmpresa(estado,e.id)})),cont=emps.filter(x=>x.ev.some(v=>v.tipo==='mensagem-enviada'));
 const resp=cont.filter(x=>x.ev.some(v=>v.tipo==='resposta')),int=resp.filter(x=>x.ev.some(v=>v.tipo==='resposta'&&(['medio','alto'].includes(v.interesse)||v.pediuDemo))),demo=int.filter(x=>x.ev.some(v=>v.tipo==='demonstracao-apresentada')||x.ev.some(v=>v.pediuDemo)),demoRec=cont.filter(x=>x.ev.some(v=>v.tipo==='demonstracao-apresentada')),prop=demoRec.filter(x=>x.ev.some(v=>v.tipo==='proposta-enviada')),venda=cont.filter(x=>x.ev.some(v=>v.tipo==='venda'||v.tipo==='proposta-aceita'));
 const propAny=cont.filter(x=>x.ev.some(v=>v.tipo==='proposta-enviada')),vendaDeProp=propAny.filter(x=>x.ev.some(v=>v.tipo==='venda'||v.tipo==='proposta-aceita'));
 const passos=[['msg-resp',cont.length,resp.length],['resp-int',resp.length,int.length],['int-demo',int.length,demo.length],['demo-prop',demoRec.length,prop.length],['prop-venda',propAny.length,vendaDeProp.length]].map(([id,den,num])=>({...transicoes.find(t=>t.id===id),denominador:den,numerador:num,taxa:den?num/den:null,ic:wilson(num,den),perdidos:den-num,suficiente:den>=nMinimo}));
 const validos=passos.filter(p=>p.suficiente);
 if(!cont.length)return {possivel:false,motivo:'Nenhuma mensagem enviada e confirmada foi registrada ainda: o diagnóstico precisa de dados reais.',passos,hipoteseInformada:estado.conversao?.estimativa||null};
 if(!validos.length)return {possivel:false,motivo:`Dados insuficientes: cada etapa precisa de pelo menos ${nMinimo} empresas na base de cálculo (maior base atual: ${Math.max(...passos.map(p=>p.denominador))}).`,passos,hipoteseInformada:estado.conversao?.estimativa||null};
 const gargalo=[...validos].sort((a,b)=>a.taxa-b.taxa||b.perdidos-a.perdidos)[0];
 const janela=30*864e5,dentro=(x,ini,fim)=>x.ev.find(v=>v.tipo==='mensagem-enviada')&&new Date(x.ev.find(v=>v.tipo==='mensagem-enviada').quando).getTime()>=ini&&new Date(x.ev.find(v=>v.tipo==='mensagem-enviada').quando).getTime()<fim;
 const taxaMsg=(ini,fim)=>{const c=emps.filter(x=>dentro(x,ini,fim));return {den:c.length,num:c.filter(x=>x.ev.some(v=>v.tipo==='resposta')).length};};
 const atual=taxaMsg(agora-janela,agora),antes=taxaMsg(agora-2*janela,agora-janela);
 const comparacao=gargalo.id==='msg-resp'&&atual.den>=nMinimo&&antes.den>=nMinimo?{atual,antes,p:fisherExato(atual.num,atual.den-atual.num,antes.num,antes.den-antes.num),texto:`Taxa de resposta: últimos 30 dias ${atual.num}/${atual.den}; 30 dias anteriores ${antes.num}/${antes.den}.`}:null;
 return {possivel:true,passos,gargalo:{...gargalo,evidencia:`${gargalo.numerador} de ${gargalo.denominador} (${(gargalo.taxa*100).toFixed(1).replace('.',',')}%; IC95% ${(gargalo.ic.baixo*100).toFixed(0)}–${(gargalo.ic.alto*100).toFixed(0)}%) entre "${gargalo.de}" e "${gargalo.para}".`,confianca:gargalo.denominador>=30?'média':'baixa',alternativas:gargalo.hip,proximoExperimento:gargalo.exp,metrica:gargalo.metrica},comparacao,aviso:'Estes diagnósticos são HIPÓTESES derivadas dos seus números, não causas comprovadas. A etapa com menor taxa observada não prova o motivo da perda.',hipoteseInformada:estado.conversao?.estimativa||null};
}
/* ---------- memória comercial e recomendação ---------- */
export function memoriaAbordagens(estado,{nicho=''}={}){
 const porAb=new Map();let totN=0,totX=0;
 for(const e of estado.empresas){if(nicho&&e.nicho!==nicho)continue;const ev=eventosDaEmpresa(estado,e.id),m=ev.find(x=>x.tipo==='mensagem-enviada');if(!m)continue;const ab=m.estrategia||'(sem abordagem)';if(!porAb.has(ab))porAb.set(ab,{abordagem:ab,n:0,positivas:0,respostas:0,vendas:0,recusas:0});const r=porAb.get(ab);r.n++;const pos=ev.some(v=>v.tipo==='resposta'&&(['medio','alto'].includes(v.interesse)||v.pediuDemo));if(pos){r.positivas++;totX++;}totN++;if(ev.some(v=>v.tipo==='resposta'))r.respostas++;if(ev.some(v=>v.tipo==='venda'||v.tipo==='proposta-aceita'))r.vendas++;if(ev.some(v=>v.tipo==='perda'))r.recusas++;}
 const p0=totN>=20?totX/totN:null,K=10;
 return {linhas:[...porAb.values()].map(r=>({...r,taxa:r.n?r.positivas/r.n:null,ic:wilson(r.positivas,r.n),regularizada:p0!=null?(r.positivas+K*p0)/(r.n+K):null,amostraOk:r.n>=15})).sort((a,b)=>(b.regularizada??b.taxa??0)-(a.regularizada??a.taxa??0)),total:totN,taxaGeral:p0,suficiente:totN>=20};
}
export function recomendarAbordagem(estado,empresa){
 const m=memoriaAbordagens(estado,{nicho:empresa.nicho}),ab=gerarAbordagens(estado,empresa).abordagens.filter(a=>a.disponivel);
 const regra=empresa.statusSite==='sem-site'&&/evid[eê]ncia/i.test(empresa.notas||'')&&ab.some(a=>a.id==='D')?'D':empresa.contatoDireto!=='sim'?'B':'E';
 const candidatas=m.linhas.filter(l=>l.amostraOk&&ab.some(a=>a.estrategia===l.abordagem));
 let rec,modo,porque;
 if(m.suficiente&&candidatas.length>=2){const top=candidatas[0];rec=ab.find(a=>a.estrategia===top.abordagem).id;modo='estimativa-regularizada';porque=`Entre as abordagens já usadas ${empresa.nicho?'neste nicho ':''}com pelo menos 15 envios, "${top.abordagem}" tem a maior taxa de resposta positiva regularizada (${(top.regularizada*100).toFixed(1)}% sobre ${top.n} envios; taxa geral ${(m.taxaGeral*100).toFixed(1)}%). É uma associação observada, não prova de causa.`;}
 else{rec=regra;modo='regra-fixa';porque=regra==='D'?'Regra fixa: há observação verificável (site inexistente com evidência), então um diagnóstico concreto é mais específico que uma apresentação genérica.':regra==='B'?'Regra fixa: sem contato direto com o responsável, uma pergunta consultiva identifica quem decide sem fazer oferta cedo.':'Regra fixa: com responsável identificado, um pedido de baixo atrito é proporcional.';porque+=` Não há dados suficientes para aprender com seus resultados (${m.total} envios registrados; mínimo 20, e 15 por abordagem).`;}
 const r={recomendada:rec,modo,porque,dados:m.linhas,versao:modo+':'+rec+':'+m.total,quando:new Date().toISOString()};
 return r;
}
export function registrarRecomendacao(estado,r){const h=conv(estado).historicoRecomendacoes;if(h.at(-1)?.versao!==r.versao)h.push({quando:r.quando,recomendada:r.recomendada,modo:r.modo,versao:r.versao,porque:r.porque});return h;}
/* ---------- simulador (dados fictícios, isolados do CRM) ---------- */
export const cenarios=[
 {id:'sem-resposta-inicial',titulo:'Respondeu só "serviços"',cliente:'Maria (fictícia), dona de uma assistência técnica',fala:'serviços',criterio:{esperado:'pergunta-aberta',evitar:['preco','oferta-longa']},dica:'Resposta curta não é interesse. Faça uma pergunta que avance.'},
 {id:'caro',titulo:'Achou caro',cliente:'Carlos (fictício), dono de oficina de celulares',fala:'Achei caro para o meu momento.',criterio:{esperado:'entender-antes-de-baixar',palavras:['entend','escopo','etapas','parcel'],evitar:['desconto-imediato']},dica:'Entenda de onde vem o "caro" e ofereça escopo/pagamento antes de reduzir o preço.'},
 {id:'golpe',titulo:'Desconfiança',cliente:'Ana (fictícia), dentista',fala:'Isso não é golpe? Já ouvi histórias de gente que pagou e sumiu.',criterio:{esperado:'reduzir-risco',palavras:['antes','ver','escrito','pagamento','etapa'],evitar:['garantia-falsa']},dica:'Reduza o risco real: mostrar antes, pagar depois, por escrito.'},
 {id:'recusa',titulo:'Recusa clara',cliente:'Paulo (fictício), lava-rápido',fala:'Não tenho interesse, obrigado.',criterio:{esperado:'respeitar-recusa',palavras:['obrigad','entend','tudo bem'],evitar:['insistir','oferta','preco','previa']},dica:'Agradeça e pare. Registrar a recusa é a ação certa.'},
 {id:'pensar',titulo:'Vou pensar',cliente:'Julia (fictícia), clínica odontológica',fala:'Gostei, vou pensar e te aviso.',criterio:{esperado:'combinar-retorno',palavras:['duvida','retorn','alguns dias','sem pressa'],evitar:['pressao']},dica:'Pergunte se ficou dúvida e combine quando retornar, sem pressão.'},
 {id:'socio',titulo:'Falar com o sócio',cliente:'Rafael (fictício), estética automotiva',fala:'Preciso falar com meu sócio antes.',criterio:{esperado:'facilitar-encaminhamento',palavras:['resumo','encaminh','contato','socio'],evitar:['pressao']},dica:'Facilite: ofereça um resumo curto para encaminhar ou converse direto com o sócio.'},
 {id:'preco',titulo:'Pediu o valor logo no início',cliente:'Lucas (fictício), assistência técnica',fala:'Me manda o valor.',criterio:{esperado:'transparencia',palavras:['r$','valor','inclui','previa'],evitar:['evasiva']},dica:'Seja transparente com o valor real e ofereça a prévia.'},
 {id:'instagram',titulo:'Já tenho Instagram',cliente:'Bia (fictícia), estética automotiva',fala:'Já tenho Instagram, não preciso de site.',criterio:{esperado:'pergunta-aberta',palavras:['?'],evitar:['critica']},dica:'Reconheça o Instagram e pergunte algo genuíno sobre as dúvidas dos clientes.'}
];
export function avaliarTreino(cenario,resposta){
 const t=String(resposta||'').trim(),n=normal(t),a=auditarMensagem(t),pontos=[],feedback=[];let nota=0;
 const ponto=(ok,peso,bom,ruim)=>{if(ok){nota+=peso;pontos.push(bom);}else feedback.push(ruim);};
 ponto(a.ok,25,'Sem clichês, urgência ou promessas.','Há linguagem problemática: '+a.erros.join(' '));
 ponto(t.length>0&&t.length<=350&&!/\n/.test(t),15,'Curta e em um único parágrafo.','Mensagem longa ou em vários parágrafos.');
 ponto((t.match(/\?/g)||[]).length<=1,10,'No máximo uma pergunta.','Perguntas demais de uma vez.');
 const c=cenario.criterio,palavras=c.palavras||[];
 if(c.esperado==='respeitar-recusa'){ponto(palavras.some(p=>n.includes(p)),20,'Agradeceu e reconheceu.','Reconheça e agradeça.');ponto(!/preco|valor|previa|promocao|desconto|oferta|ainda posso|so mais uma|mas /.test(n),30,'Respeitou a recusa sem nova oferta.','Não insista nem faça nova oferta depois de uma recusa clara.');}
 else if(c.esperado==='entender-antes-de-baixar'){ponto(palavras.some(p=>n.includes(p)),30,'Buscou entender/ajustar escopo antes de mexer no preço.','Antes de oferecer desconto, entenda o motivo e ofereça escopo ou etapas.');ponto(!/desconto de|baixo para|faco por/.test(n),20,'Não ofereceu desconto imediato.','Evite desconto imediato.');}
 else if(c.esperado==='pergunta-aberta'){ponto(/\?/.test(t),30,'Fez uma pergunta que avança a conversa.','Faça uma pergunta aberta e simples.');ponto(!/r\$\s*\d/i.test(t)&&t.length<=300,20,'Não despejou preço/oferta longa.','Não despeje preço nem oferta longa agora.');}
 else{ponto(palavras.some(p=>n.includes(p)),30,'Respondeu ao ponto específico do cliente.','Responda ao ponto específico levantado.');ponto(!/garantimos|100%|sempre/.test(n),20,'Sem promessas não comprovadas.','Evite garantias absolutas.');}
 const total=Math.min(100,nota);return {nota:total,pontos,feedback,dica:cenario.dica,aviso:'Exercício de treino com cliente FICTÍCIO. Não altera o CRM.'};
}
export function registrarTreino(estado,cenarioId,resposta,aval){conv(estado).simulacoes.push({id:novoId(),fiction:true,fictício:true,cenarioId,resposta,nota:aval.nota,em:new Date().toISOString()});}
