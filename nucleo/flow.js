/* Órbita Flow: organização e dados reais do dashboard. */
import {pontuarEmpresa} from './pontuacao.js';
import {montarHoje} from './automacoes.js';
import {podeContatar} from './conversao/dominio.js';
export const navegacao=[
 ['geral','Visão Geral','inicio','Principal'],
 ['hoje','Hoje e Radar','raio','Principal',[['hoje','Hoje e Radar','raio'],['diagnostico','Diagnóstico e plano do dia','grafico'],['lembretes','Lembretes','sino']]],
 ['empresas','Empresas','camadas','Principal'],['pipeline','Pipeline','pipeline','Principal'],
 ['conversao','Conversão','mensagem','Comercial e produção',[['conversao','Conversas e mensagens','mensagem'],['ofertas','Ofertas e propostas','dinheiro'],['propostas','Propostas','dinheiro']]],
 ['estudio','Estúdio de Sites','brilho','Comercial e produção',[['estudio','Projetos e modelos','brilho'],['modelos','Modelos clássicos','modelos'],['publicacoes','Publicações e rastreamento','aviao']]],
 ['financeiro','Financeiro','dinheiro','Comercial e produção'],
 ['inteligencia','Inteligência','grafico','Comercial e produção',[['quant','Órbita Quant','grafico'],['laboratorio','Laboratório','grafico'],['relatorios','Relatórios','grafico']]],
 ['connect','Órbita Connect','aviao','Sistema'],
 ['configuracoes','Configurações','engrenagem','Sistema',[['configuracoes','Preferências','engrenagem'],['dados','Dados e segurança','verificado']]]
];
export const rotasNavegacao=navegacao.flatMap(([id,,,,sub])=>sub?sub.map(f=>f[0]):[id]);
export const paiDaRota=rota=>navegacao.find(([id,,,,sub])=>sub?sub.some(f=>f[0]===rota):id===rota)?.[0]||'';
const vetada=e=>/NÃO aprovado para nova abordagem|Já prospectada anteriormente|Já contatada segundo|NÃO abordar antes de revisão/i.test([e.notas,e.proximaAcao].join(' '));
const ativa=e=>e.situacao==='ativa'&&e.etapa!=='fechada';
export function montarVisaoGeral(estado,empresasPeriodo=estado.empresas,agora=Date.now()){
 const pontuadas=estado.empresas.map(empresa=>({empresa,p:pontuarEmpresa(empresa,estado)}));
 const grupos={A:0,B:0,C:0};for(const x of pontuadas){if(x.p.pesquisa)grupos[x.p.pesquisa.grupo]++;}
 const recentes=new Map(),enviadas=new Set();for(const ev of estado.eventos||[]){if(ev.revertido||!['resposta','mensagem-enviada'].includes(ev.tipo))continue;if(ev.tipo==='mensagem-enviada')enviadas.add(ev.empresaId);const ant=recentes.get(ev.empresaId);if(!ant||String(ev.quando)>=String(ant.quando))recentes.set(ev.empresaId,ev);}
 const elegiveis=pontuadas.filter(({empresa:e})=>ativa(e)&&podeContatar(e).ok&&!vetada(e)&&e.statusSite!=='possui'&&!e.primeiroContato&&!enviadas.has(e.id)&&!recentes.has(e.id)&&['encontrada','verificada'].includes(e.etapa));
 const ordem={A:0,B:1,C:2};elegiveis.sort((a,b)=>(ordem[a.p.pesquisa?.grupo]??3)-(ordem[b.p.pesquisa?.grupo]??3)||(b.p.pesquisa?.evidencia??0)-(a.p.pesquisa?.evidencia??0)||b.p.total-a.p.total||a.empresa.nome.localeCompare(b.empresa.nome,'pt-BR'));
 const destaques=elegiveis.filter(x=>x.p.pesquisa?.grupo==='A'||x.p.total>=50).slice(0,3);
 const hoje=montarHoje(estado,agora),acoes=[],ids=new Set();
 const add=(e,titulo,descricao,m,id=e?.id)=>{if(e&&(!ativa(e)||!podeContatar(e).ok||ids.has(e.id)))return;if(e)ids.add(e.id);acoes.push({titulo,descricao,empresaId:e?.id||'',m,id:id||''});};
 for(const x of hoje.demosProduzir.filter(x=>x.empresa.solicitouDemo))add(x.empresa,'Criar demonstração',x.empresa.nome+' · pediu uma demonstração','estudio.criar');
 for(const e of estado.empresas)if(recentes.get(e.id)?.tipo==='resposta')add(e,'Responder empresa',e.nome+' · última interação foi uma resposta','conversao.abrir-conversa');
 for(const x of hoje.atrasados)add(x.empresa,'Revisar retorno atrasado',x.empresa.nome+' · '+x.dias+' dia(s)','empresa.retorno');
 for(const x of hoje.propostasAguardando)add(x.empresa,'Acompanhar proposta',x.empresa.nome+' · aguardando decisão','propostas.abrir',x.proposta.id);
 for(const x of hoje.negociacoesPrioritarias)add(x.empresa,'Continuar negociação',x.empresa.nome,'conversao.abrir-conversa');
 for(const x of hoje.demosSemResposta)add(x.empresa,'Acompanhar demonstração',x.empresa.nome+' · '+x.dias+' dia(s) sem resposta','conversao.abrir-conversa');
 for(const x of hoje.contatarHoje)add(x.empresa,'Revisar contato de hoje',x.empresa.nome+' · '+x.motivo,'conversao.abrir-conversa');
 if(elegiveis.length)acoes.push({titulo:'Iniciar prospecção',descricao:elegiveis.length+' oportunidade(s) novas para revisar',acao:'prospectar',empresaId:''});
 if(!acoes.length)acoes.push({titulo:'Nova oportunidade',descricao:'Cadastre uma empresa para começar.',acao:'nova-empresa',empresaId:''});
 const contagens=[['Prospecção',['encontrada','verificada']],['Contato',['mensagem','respondeu']],['Negociação',['demonstracao','negociacao','proposta']],['Fechamento',['fechada']]].map(([nome,etapas])=>({nome,quantidade:empresasPeriodo.filter(e=>etapas.includes(e.etapa)).length}));
 const pagamentos=(estado.pagamentos||[]).filter(p=>p.estado==='confirmado'&&!p.revertido);
 return {grupos,destaques,fila:elegiveis,acoes,principal:acoes[0],contagens,recebido:pagamentos.reduce((s,p)=>s+(Number(p.valor)||0),0),negociacoes:empresasPeriodo.filter(e=>e.etapa==='negociacao').length,total:estado.empresas.length,lembretes:(estado.lembretes||[]).filter(l=>!l.concluido).length};
}
