/* Plano comercial do dia. Ordem explicável por categorias (sem pontuação inventada nem "probabilidade de venda"). Não executa nada. */
import {proximaMelhorAcao} from '../negociacao/proxima-acao.js';
import {resumoNegociacao} from '../negociacao/contexto.js';
import {filaOportunidades,planoFollowUp,podeContatar} from '../conversao/dominio.js';
const CAT=[['responder-preco','Responder quem pediu valor',1,5],['responder','Responder cliente que aguarda',2,5],['publicar-demo','Publicar demonstração pronta para apresentar',3,10],['proposta','Apresentar proposta a quem solicitou',4,15],['apresentar-link','Apresentar link já publicado',5,5],['preco','Apresentar valor a quem condicionou a decisão',6,5],['follow-up','Follow-up permitido',7,5],['indefinida','Oportunidades sem próxima ação definida',8,5],['tarefa','Tarefas comerciais',9,15],['prospectar','Prospectar novas empresas elegíveis',10,20]];
export function planoDoDia(estado,{agora=Date.now(),tempoDisponivelMin=null,limiteProspeccao=5}={}){
 const itens=[],bloqueados=[];const add=(cat,emp,titulo,porque,extra={})=>{const [,rot,ordem,min]=CAT.find(c=>c[0]===cat);itens.push({categoria:cat,rotuloCategoria:rot,ordem,empresaId:emp?.id||'',empresa:emp?.nome||'',titulo,porque,minutos:min,...extra});};
 for(const e of estado.empresas){
  if(e.situacao==='nao-contatar'||e.situacao==='recusada'){bloqueados.push({empresaId:e.id,empresa:e.nome,motivo:e.situacao==='nao-contatar'?'Pediu para não ser contatada':'Recusou'});continue;}
  if(e.situacao!=='ativa'||e.etapa==='fechada')continue;
  const r=resumoNegociacao(estado,e,{agora}),pa=proximaMelhorAcao(estado,e,{agora});if(!r.contagens.enviadas&&!r.contagens.recebidas)continue;
  const dias=r.diasDesdeUltima??0;
  if(pa.acao==='apresentar-preco'&&r.aguardando==='eu')add('responder-preco',e,'Responder o valor para '+e.nome,pa.porque,{dias,acao:pa.acao});
  else if(pa.acao==='responder'||pa.acao==='oferecer-alternativa'||pa.acao==='negociar')add('responder',e,'Responder '+e.nome,pa.porque,{dias,acao:pa.acao});
  else if(pa.acao==='enviar-proposta')add('proposta',e,'Enviar proposta para '+e.nome,pa.porque,{dias,acao:pa.acao});
  else if(pa.acao==='apresentar-demo'&&r.demonstracao.publicada)add('apresentar-link',e,'Apresentar a demonstração publicada a '+e.nome,pa.porque,{dias,acao:pa.acao});
  else if(pa.acao==='apresentar-demo'||pa.acao==='personalizar-demo')add('publicar-demo',e,(r.demonstracao.existe?'Publicar a demonstração de ':'Criar a demonstração de ')+e.nome,pa.porque,{dias,acao:pa.acao});
  else if(pa.acao==='follow-up'){const fu=planoFollowUp(estado,e,agora);if(fu.permitido)add('follow-up',e,'Follow-up com '+e.nome,pa.porque,{dias,acao:pa.acao});}
  else if(!e.proximaAcao&&!['aguardar','encerrar'].includes(pa.acao)&&r.contagens.enviadas)add('indefinida',e,'Definir a próxima ação de '+e.nome,'Há conversa em andamento e nenhuma próxima ação cadastrada.',{dias,acao:pa.acao});
  else if(!e.proximaAcao&&pa.acao==='aguardar'&&r.aguardando==='cliente'&&false)add('indefinida',e,e.nome,'',{});
  if(r.demonstracao.publicada&&!r.demonstracao.apresentada&&pa.acao!=='apresentar-demo'&&!itens.some(i=>i.empresaId===e.id&&i.categoria==='apresentar-link'))add('apresentar-link',e,'Link publicado ainda não apresentado: '+e.nome,'A demonstração está no ar e nenhum envio do link foi confirmado.',{dias,acao:'apresentar-demo'});
 }
 for(const t of estado.tarefas.filter(t=>!['concluida','cancelada'].includes(t.estado))){const venc=t.prazo&&new Date(t.prazo).getTime()<=agora+864e5;if(venc)add('tarefa',estado.empresas.find(e=>e.id===t.empresaId)||null,t.titulo,'Tarefa com prazo vencido ou para hoje.',{prazo:t.prazo,acao:'tarefa'});}
 const fila=filaOportunidades(estado,{limite:limiteProspeccao});for(const f of fila.filter(x=>!itens.some(i=>i.empresaId===x.empresa.id)&&!x.empresa.primeiroContato))add('prospectar',f.empresa,'Primeiro contato com '+f.empresa.nome,`Elegível para contato (potencial ${f.q.potencial}; confiança ${f.q.confianca}%).`,{acao:'primeira-mensagem'});
 itens.sort((a,b)=>a.ordem-b.ordem||(b.dias||0)-(a.dias||0));
 let acum=0;for(const i of itens){acum+=i.minutos;i.cabeNoTempo=tempoDisponivelMin==null?null:acum<=tempoDisponivelMin;}
 itens.forEach((i,k)=>{i.posicao=k+1;});
 return {itens,bloqueados,tempoTotalMin:acum,tempoDisponivelMin,vazio:!itens.length,aviso:'Ordem por categorias de ação (do mais próximo do dinheiro e do cliente aguardando ao mais distante). Não é uma probabilidade de venda.'};
}
