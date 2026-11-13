import {eventosDaEmpresa} from './esquema.js';
import {contatoPermitido} from './pontuacao.js';
import {totalPago} from './acoes.js';
const dia=864e5,dias=(d,b=Date.now())=>Math.floor((b-new Date(d).getTime())/dia);
export const tiposAutomacao=[['retornoDemo','Sugerir retorno após demonstração enviada'],['negociacaoParada','Identificar negociações sem movimentação'],['propostaVencendo','Avisar sobre propostas próximas do vencimento'],['proximaAcao','Sugerir próxima ação pelo estágio'],['cadastroIncompleto','Identificar cadastros incompletos'],['suporteVencendo','Destacar suporte próximo do fim']];
export function cadastroIncompleto(e){const f=[];if(!e.whatsapp&&!e.telefone)f.push('contato (WhatsApp ou telefone)');if(!e.nicho)f.push('nicho');if(e.statusSite==='desconhecido')f.push('status do site');if(!e.contato)f.push('responsável');if(!e.cidade)f.push('cidade');return f;}
export function gerarSugestoes(estado,agora=Date.now()){
 const cfg=estado.config.automacoes,saida=[],dispensadas=estado.dispensadas||{};
 const add=(tipo,e,texto,acao,prioridade=2,chave='')=>{const id=tipo+':'+(e?.id||'')+':'+chave;if(dispensadas[id]&&dispensadas[id]>agora)return;saida.push({id,tipo,empresaId:e?.id||'',empresa:e?.nome||'',texto,acao,prioridade});};
 for(const e of estado.empresas){
  if(!contatoPermitido(e)||e.situacao!=='ativa'||e.etapa==='fechada')continue;
  const evs=eventosDaEmpresa(estado,e.id);
  if(cfg.retornoDemo){const d=evs.filter(x=>x.tipo==='demonstracao-apresentada').at(-1);if(d&&!evs.some(x=>x.tipo==='resposta'&&x.quando>=d.quando)&&dias(d.quando,agora)>=cfg.diasRetornoDemo)add('retornoDemo',e,`Demonstração enviada há ${dias(d.quando,agora)} dias sem resposta. Prepare um retorno.`,{m:'mensagens.abrir',id:e.id,extra:'sem-resposta-demo'},3,d.id);}
  if(cfg.negociacaoParada&&['negociacao','proposta'].includes(e.etapa)&&dias(e.etapaEm,agora)>=cfg.diasNegociacaoParada)add('negociacaoParada',e,`Sem movimentação há ${dias(e.etapaEm,agora)} dias em ${e.etapa==='proposta'?'proposta enviada':'negociação'}.`,{m:'mensagens.abrir',id:e.id,extra:'retomada'},3,e.etapaEm);
  if(cfg.proximaAcao&&!e.proximaAcao&&!e.retornoEm&&e.etapa!=='encontrada')add('proximaAcao',e,'Sem próxima ação definida. Agende um retorno.',{m:'empresa.retorno',id:e.id},1);
  if(cfg.cadastroIncompleto){const f=cadastroIncompleto(e);if(f.length>=2)add('cadastroIncompleto',e,'Cadastro incompleto: falta '+f.slice(0,3).join(', ')+'.',{m:'empresa.abrir',id:e.id},0);}
 }
 if(cfg.propostaVencendo)for(const p of estado.propostas){if(!['criada','enviada'].includes(p.estado)||!p.validade)continue;const restam=Math.ceil((new Date(p.validade).getTime()-agora)/dia),e=estado.empresas.find(x=>x.id===p.empresaId);if(e&&restam<=cfg.diasPropostaAviso)add('propostaVencendo',e,restam<0?'Proposta vencida há '+(-restam)+' dia(s). Atualize a validade ou encerre.':'Proposta vence em '+restam+' dia(s).',{m:'propostas.abrir',id:p.id},3,p.id);}
 if(cfg.suporteVencendo)for(const pv of estado.posVenda){if(!pv.suporteAte||pv.estado==='concluido')continue;const restam=Math.ceil((new Date(pv.suporteAte).getTime()-agora)/dia),e=estado.empresas.find(x=>x.id===pv.empresaId);if(e&&restam<=cfg.diasSuporteAviso)add('suporteVencendo',e,restam<0?'Período de suporte terminou há '+(-restam)+' dia(s).':'Suporte termina em '+restam+' dia(s).',{m:'financeiro.posvenda',id:pv.id},2,pv.id);}
 return saida.sort((a,b)=>b.prioridade-a.prioridade);
}
export function montarHoje(estado,agora=Date.now()){
 const fimHoje=new Date(agora);fimHoje.setHours(23,59,59,999);const ok=e=>e.situacao==='ativa'&&contatoPermitido(e);
 const g={contatarHoje:[],atrasados:[],demosProduzir:[],demosSemResposta:[],propostasAguardando:[],negociacoesPrioritarias:[],posVenda:[]};
 for(const e of estado.empresas){if(!ok(e)||e.etapa==='fechada')continue;
  const evs=eventosDaEmpresa(estado,e.id),r=e.retornoEm?new Date(e.retornoEm).getTime():null;
  if(r&&r<new Date(agora).setHours(0,0,0,0))g.atrasados.push({empresa:e,dias:dias(r,agora)});
  else if(r&&r<=fimHoje.getTime())g.contatarHoje.push({empresa:e,motivo:e.proximaAcao||'Retorno agendado para hoje'});
  else if(!r&&e.etapa==='verificada'&&!evs.some(x=>x.tipo==='mensagem-enviada'))g.contatarHoje.push({empresa:e,motivo:'Verificada, ainda sem primeira mensagem'});
  const temDemo=estado.demonstracoes.some(d=>d.empresaId===e.id);
  if((e.solicitouDemo||['medio','alto'].includes(e.interesse))&&!temDemo)g.demosProduzir.push({empresa:e,motivo:e.solicitouDemo?'Pediu demonstração':'Interesse '+e.interesse});
  const d=evs.filter(x=>x.tipo==='demonstracao-apresentada').at(-1);if(d&&!evs.some(x=>x.tipo==='resposta'&&x.quando>=d.quando))g.demosSemResposta.push({empresa:e,dias:dias(d.quando,agora)});
  if(e.etapa==='negociacao'&&(e.interesse==='alto'||e.valorNegociado))g.negociacoesPrioritarias.push({empresa:e,dias:dias(e.etapaEm,agora)});
 }
 for(const p of estado.propostas)if(p.estado==='enviada'){const e=estado.empresas.find(x=>x.id===p.empresaId);if(e&&ok(e))g.propostasAguardando.push({empresa:e,proposta:p,dias:dias(p.atualizadaEm,agora)});}
 for(const pv of estado.posVenda){const e=estado.empresas.find(x=>x.id===pv.empresaId);if(!e||pv.estado==='concluido')continue;const abertas=[...pv.pendencias,...pv.alteracoes].filter(x=>!x.feito).length;if(abertas||pv.estado==='em-andamento')g.posVenda.push({empresa:e,posVenda:pv,abertas});}
 return g;
}
export function resumoFinanceiro(estado){
 const aceitas=estado.propostas.filter(p=>p.estado==='aceita');const negociado=aceitas.reduce((s,p)=>s+p.valorFinal,0)||0;
 const recebido=estado.pagamentos.filter(p=>p.estado==='confirmado').reduce((s,p)=>s+Number(p.valor),0);
 const pendente=aceitas.reduce((s,p)=>s+Math.max(0,p.valorFinal-totalPago(estado,p.id)),0);
 const custos=estado.custos.reduce((s,c)=>s+Number(c.valor||0),0);
 return {negociado,recebido,pendente,custos,liquido:recebido-custos,aceitas:aceitas.length};
}
