import {eventosDaEmpresa} from './esquema.js';
const fracaoInteresse={alto:1,medio:.6,baixo:.25,nenhum:0};
export function pontuarEmpresa(empresa,estado,pesos=estado.config.pesos){
 const criterios=[],verificar=[];
 const eventos=id=>eventosDaEmpresa(estado,empresa.id,id);
 const adicionar=(chave,nome,maximo,pontos,atendido,detalhe)=>criterios.push({chave,nome,maximo,pontos:Math.round(pontos*10)/10,atendido,detalhe});
 const ps=Number(pesos.semSite)||0;
 if(empresa.statusSite==='sem-site')adicionar('semSite','Sem site próprio confirmado',ps,ps,true,'Confirmado como sem site.');
 else if(empresa.statusSite==='desatualizado')adicionar('semSite','Sem site próprio confirmado',ps,ps*.6,true,'Site desatualizado: pontuação parcial.');
 else{adicionar('semSite','Sem site próprio confirmado',ps,0,false,empresa.statusSite==='possui'?'A empresa possui site.':'Ainda não verificado.');if(empresa.statusSite==='desconhecido')verificar.push('Confirmar se a empresa possui site próprio.');}
 const pc=Number(pesos.contatoDireto)||0;
 if(empresa.contatoDireto==='sim')adicionar('contatoDireto','Contato direto com proprietário ou responsável',pc,pc,true,'Contato direto registrado.');
 else{adicionar('contatoDireto','Contato direto com proprietário ou responsável',pc,0,false,empresa.contatoDireto==='nao'?'Sem acesso direto ao responsável.':'Ainda não verificado.');if(empresa.contatoDireto==='desconhecido')verificar.push('Descobrir se há contato direto com o proprietário ou responsável.');}
 const pr=Number(pesos.resposta)||0,respostas=eventos('resposta').length;
 adicionar('resposta','Resposta à abordagem',pr,respostas?pr:0,respostas>0,respostas?respostas+' resposta(s) registrada(s).':(eventos('mensagem-enviada').length?'Mensagem enviada, sem resposta registrada.':'Nenhuma abordagem confirmada.'));
 const pi=Number(pesos.interesse)||0,f=fracaoInteresse[empresa.interesse];
 adicionar('interesse','Interesse comercial demonstrado',pi,f?pi*f:0,f>0,empresa.interesse==='desconhecido'?'Interesse ainda não avaliado.':'Interesse: '+empresa.interesse+'.');
 if(empresa.interesse==='desconhecido')verificar.push('Registrar o nível de interesse demonstrado.');
 const pd=Number(pesos.demonstracao)||0;
 adicionar('demonstracao','Solicitação de demonstração',pd,empresa.solicitouDemo?pd:0,empresa.solicitouDemo,empresa.solicitouDemo?'A empresa pediu uma demonstração.':'Nenhum pedido registrado.');
 const maximo=criterios.reduce((s,c)=>s+c.maximo,0),total=criterios.reduce((s,c)=>s+c.pontos,0);
 return {total:Math.round(total*10)/10,maximo,percentual:maximo?Math.round(total/maximo*100):0,criterios,verificar,aviso:'Pontuação de prioridade por regras. Não é probabilidade de venda.'};
}
const dia=86400000,agora=()=>Date.now();
const diasDesde=d=>d?Math.floor((agora()-new Date(d).getTime())/dia):null;
const ativa=e=>e.situacao==='ativa'&&e.etapa!=='fechada';
export function contatoPermitido(e){return e.situacao!=='nao-contatar'&&e.situacao!=='recusada';}
export function montarRadar(estado,filtros={}){
 const emp=estado.empresas.filter(e=>(!filtros.nicho||e.nicho===filtros.nicho)&&(!filtros.cidade||e.cidade.toLowerCase().includes(filtros.cidade.toLowerCase()))&&(!filtros.uf||new RegExp('[-,/ ]\\s*'+filtros.uf+'\\s*$','i').test(e.cidade))&&(!filtros.etapa||e.etapa===filtros.etapa)&&(!filtros.interesse||e.interesse===filtros.interesse)&&(!filtros.desde||new Date(e.criada)>=new Date(filtros.desde))&&(!filtros.ate||new Date(e.criada)<=new Date(filtros.ate+'T23:59:59')));
 const pontuadas=emp.map(e=>({empresa:e,pontuacao:pontuarEmpresa(e,estado)})).filter(x=>!filtros.minimo||x.pontuacao.total>=Number(filtros.minimo));
 const grupos={prioritarias:[],aguardando:[],interessadas:[],demoSemRetorno:[],paradas:[],atrasados:[],propostasVencendo:[],precisamAcao:[]};
 const auto=estado.config.automacoes;
 for(const x of pontuadas){
  const e=x.empresa;if(!ativa(e)||!contatoPermitido(e))continue;
  const ultimoMsg=eventosDaEmpresa(estado,e.id,'mensagem-enviada').at(-1),ultimaResposta=eventosDaEmpresa(estado,e.id,'resposta').at(-1);
  if(x.pontuacao.total>=50)grupos.prioritarias.push(x);
  if(e.etapa==='mensagem'&&ultimoMsg&&!(ultimaResposta&&ultimaResposta.quando>=ultimoMsg.quando))grupos.aguardando.push({...x,dias:diasDesde(ultimoMsg.quando)});
  if(['medio','alto'].includes(e.interesse))grupos.interessadas.push(x);
  const demo=eventosDaEmpresa(estado,e.id,'demonstracao-apresentada').at(-1);
  if(demo&&!(ultimaResposta&&ultimaResposta.quando>=demo.quando)&&diasDesde(demo.quando)>=1)grupos.demoSemRetorno.push({...x,dias:diasDesde(demo.quando)});
  const parado=diasDesde(e.etapaEm);if(['negociacao','proposta'].includes(e.etapa)&&parado>=(auto.diasNegociacaoParada||7))grupos.paradas.push({...x,dias:parado});
  if(e.retornoEm&&new Date(e.retornoEm)<new Date())grupos.atrasados.push({...x,dias:diasDesde(e.retornoEm)});
  if(!e.proximaAcao&&!e.retornoEm)grupos.precisamAcao.push(x);
 }
 for(const p of estado.propostas||[]){if(!['enviada','criada'].includes(p.estado)||!p.validade)continue;const restam=Math.ceil((new Date(p.validade)-agora())/dia);const e=estado.empresas.find(x=>x.id===p.empresaId);if(e&&restam<=(auto.diasPropostaAviso||2))grupos.propostasVencendo.push({empresa:e,proposta:p,dias:restam});}
 for(const g of Object.values(grupos))g.sort((a,b)=>(b.pontuacao?.total||0)-(a.pontuacao?.total||0));
 return {grupos,total:pontuadas.length,pontuadas};
}
