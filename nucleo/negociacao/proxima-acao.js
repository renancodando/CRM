/* Próxima melhor ação. Recomenda DECISÕES (não só textos), explica o porquê, o que foi descartado e qual seria o próximo avanço. Nunca executa nada. */
import {interpretarNegociacao} from './interpretacao.js';
import {planoFollowUp,podeContatar} from '../conversao/dominio.js';
const TODAS=[['responder','Responder'],['perguntar','Fazer uma pergunta'],['apresentar-demo','Apresentar uma demonstração'],['personalizar-demo','Personalizar melhor a demonstração'],['explicar-valor','Explicar o valor do produto'],['apresentar-preco','Apresentar preço'],['enviar-proposta','Enviar proposta'],['negociar','Negociar condições'],['oferecer-alternativa','Oferecer alternativa'],['aguardar','Aguardar'],['follow-up','Realizar follow-up'],['encerrar','Encerrar a negociação']];
export const rotuloAcao=id=>TODAS.find(a=>a[0]===id)?.[1]||id;
export function proximaMelhorAcao(estado,empresa,{agora=Date.now()}={}){
 const it=interpretarNegociacao(estado,empresa,{agora}),r=it.resumo,L=id=>it.leituras.find(x=>x.id===id),tem=id=>!!L(id);
 const perm=podeContatar(empresa,'whatsapp'),fu=planoFollowUp(estado,empresa,agora);
 const descartadas=[];const desc=(acao,motivo)=>{if(!descartadas.some(d=>d.acao===acao))descartadas.push({acao,rotulo:rotuloAcao(acao),motivo});};
 let acao,porque,avanco,evitar=[],detalhe={};
 const bloqueada=!perm.ok||tem('recusa')||['recusada','perdida'].includes(empresa.situacao);
 if(bloqueada){acao='encerrar';porque=tem('recusa')?'O cliente recusou ou pediu para parar. Insistir não é adequado.':!perm.ok?'Contato bloqueado: '+perm.motivo:'A oportunidade está encerrada ('+empresa.situacao+').';avanco='Registrar o motivo da perda para aprender com ele.';evitar=['Qualquer nova tentativa de venda','Mensagens de "só mais uma vez"'];for(const [a] of TODAS)if(a!=='encerrar')desc(a,'Bloqueado: o cliente recusou ou o contato não é permitido.');}
 else if(tem('fechamento')&&r.aguardando==='eu'){acao='enviar-proposta';porque='O cliente usou linguagem de fechamento e está aguardando você. A venda só será registrada quando você confirmar.';avanco='Proposta aceita e pagamento combinado.';evitar=['Registrar venda antes da confirmação','Mudar condições já combinadas sem avisar'];}
 else if(tem('desconto')&&r.aguardando==='eu'){acao='negociar';porque='O cliente pediu desconto/contraproposta. Analise o efeito financeiro antes de responder.';avanco='Acordar condição que preserve sua margem (Pix, parcelamento ou escopo).';evitar=['Conceder desconto sem calcular o impacto','Repetir o mesmo preço sem alternativa'];detalhe={abrir:'ofertas'};}
 else if(tem('interesse-condicionado')||tem('preco')){
  if(!r.precoApresentado){acao='apresentar-preco';porque='O cliente condicionou ou perguntou o valor e nenhum preço foi registrado como apresentado.';avanco='Cliente avalia o valor e responde com decisão, dúvida ou contraproposta.';evitar=['Enrolar sem dar o número','Prometer resultado financeiro'];if(r.demonstracao.publicada&&!r.demonstracao.apresentada)detalhe.sugestao='Há uma demonstração publicada ainda não apresentada: o valor fica mais concreto com ela.';}
  else{acao=r.aguardando==='eu'?'oferecer-alternativa':'aguardar';porque=r.aguardando==='eu'?`O preço já foi apresentado (R$ ${(r.precoApresentado.valorCent/100).toLocaleString('pt-BR')}). Repetir não ajuda: descubra o que cabe e ofereça Pix ou parcelamento.`:'O preço já foi apresentado e a vez é do cliente.';avanco='Cliente indica um orçamento ou aceita uma condição.';evitar=['Repetir a mesma mensagem de preço','Baixar o preço sem entender o orçamento'];desc('apresentar-preco','O preço já foi apresentado.');}
 }
 else if(r.aguardando==='eu'&&r.ultima){const interesse=tem('interesse')||tem('necessidade');
  if(tem('duvidas')||r.ultima.texto.includes('?')){acao='responder';porque='O cliente fez uma pergunta e aguarda sua resposta.';avanco='Dúvida resolvida e próximo passo combinado.';}
  else if(interesse&&!r.demonstracao.existe){acao='personalizar-demo';porque='Há interesse e ainda não existe demonstração para esta empresa. Uma prévia concreta ajuda mais que mais explicação.';avanco='Prévia criada e apresentada com sua confirmação.';detalhe={abrir:'estudio'};}
  else if(interesse&&r.demonstracao.publicada&&!r.demonstracao.apresentada){acao='apresentar-demo';porque='A demonstração já está publicada e ainda não foi apresentada ao cliente.';avanco='Cliente vê a prévia e dá retorno.';detalhe={url:r.demonstracao.urlPublica};}
  else if(interesse&&r.demonstracao.existe&&!r.demonstracao.publicada){acao='apresentar-demo';porque='Existe demonstração, mas ainda não foi publicada. Publique e depois apresente.';avanco='Link publicado e apresentado.';detalhe={abrir:'publicacoes'};}
  else if(tem('obj-caro')||L('obj-sem-dinheiro')){acao='oferecer-alternativa';porque='Objeção de valor: ofereça formas de pagamento antes de qualquer desconto.';avanco='Cliente aceita uma condição.';}
  else{acao='responder';porque='A última mensagem é do cliente e ainda não foi respondida.';avanco='Conversa avança para o próximo passo.';}
 }
 else if(r.aguardando==='cliente'){
  if(fu.permitido){acao='follow-up';porque='Sem resposta; o intervalo configurado foi cumprido (tentativa '+((fu.tentativas||0)+1)+').';avanco='Resposta, ou encerramento cordial se não houver retorno.';evitar=['Repetir a mensagem anterior','Cobrar resposta'];}
  else if(fu.encerrar){acao='encerrar';porque=fu.motivo;avanco='Registrar a oportunidade como sem resposta.';desc('follow-up','Limite de tentativas atingido.');}
  else{acao='aguardar';porque=fu.motivo;avanco='Esperar o prazo configurado.';desc('follow-up','Ainda dentro do intervalo: '+fu.motivo);}
 }
 else{acao=r.contagens.enviadas?'aguardar':'perguntar';porque=r.contagens.enviadas?'Sem informação suficiente para agir.':'Ainda não há conversa: comece com uma pergunta simples ou a abordagem recomendada.';avanco='Primeira resposta do cliente.';}
 for(const [a] of TODAS){if(a===acao)continue;if(descartadas.some(d=>d.acao===a))continue;
  const m={'apresentar-preco':r.precoApresentado?'O preço já foi apresentado.':'Não há pedido de preço ainda.','enviar-proposta':'Não há sinal de fechamento.','encerrar':'Não houve recusa nem esgotamento de tentativas.','follow-up':r.aguardando==='eu'?'A vez é sua de responder, não de cobrar.':'Fora do intervalo/limite configurado.','aguardar':'Há uma ação útil agora.','negociar':'Não houve pedido de desconto.','apresentar-demo':r.demonstracao.apresentada?'A demonstração já foi apresentada.':'Ainda não há sinal que justifique.','personalizar-demo':'Não é o gargalo agora.','explicar-valor':'Não é o gargalo agora.','perguntar':'Já há conversa; uma pergunta isolada não resolve o ponto atual.','oferecer-alternativa':'Não há objeção de valor registrada.','responder':'Não há mensagem do cliente aguardando.'}[a];desc(a,m||'Não se aplica agora.');}
 return {acao,rotulo:rotuloAcao(acao),porque,descartadas,proximoAvanco:avanco,evitar,detalhe,leituras:it.leituras.map(l=>({id:l.id,fato:l.fato,confianca:l.confianca})),resumo:{aguardando:r.aguardando,diasDesdeUltima:r.diasDesdeUltima,precoApresentado:r.precoApresentado},aviso:'Recomendação por regras explicáveis. Nada foi enviado nem alterado.'};
}
