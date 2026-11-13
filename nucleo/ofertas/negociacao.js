/* Motor de negociação financeira. Só ANALISA e sugere; nunca concede desconto, altera preço, envia proposta nem registra venda. */
import {simularOferta} from './simulador.js';
import {precoAtual} from './condicoes.js';
import {eventosDaEmpresa} from '../esquema.js';
const R=c=>(c/100).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
function historicoPrecos(estado,empresa){
 const ofertas=(estado.ofertas||[]).filter(o=>o.empresaId===empresa.id).sort((a,b)=>a.quando.localeCompare(b.quando)),props=estado.propostas.filter(p=>p.empresaId===empresa.id&&p.estado!=='cancelada');
 const apresentada=[...ofertas].reverse().find(o=>o.tipo==='apresentada'),ultimaProposta=props.filter(p=>p.estado==='enviada'||p.estado==='aceita').at(-1);
 const descontos=props.map(p=>Math.round((p.valorOriginal-p.valorFinal)*100)).filter(d=>d>0);
 return {ofertas,apresentadaCent:apresentada?apresentada.valorCent:ultimaProposta?Math.round(ultimaProposta.valorFinal*100):null,origemApresentada:apresentada?'oferta registrada':ultimaProposta?'proposta enviada':null,descontosConcedidosCent:descontos,contrapropostas:ofertas.filter(o=>o.tipo==='contraproposta')};
}
const veredito=sim=>{const c=[sim.comparacao.vsPrecoMinimo,sim.comparacao.vsHoraMinima,sim.comparacao.vsMargemDesejada];if(c.some(x=>x.disponivel&&x.abaixo)||sim.impacto.acimaDoLimite===true)return false;return c.every(x=>x.disponivel)&&!sim.resultadoEhLimiteSuperior?true:null;};
const resumo=sim=>({brutoCent:sim.brutoCent,resultadoCent:sim.resultadoCent,limiteSuperior:sim.resultadoEhLimiteSuperior,margemPct:sim.margem,retornoPorHoraCent:sim.retornoPorHoraCent,alertas:sim.alertas});
export function analisarPedidoDesconto(estado,empresa,cond,{contrapropostaCent,forma='cartao',parcelas=1,agora=Date.now()}){
 if(!Number.isInteger(contrapropostaCent)||contrapropostaCent<=0)throw Error('Informe a contraproposta em centavos inteiros.');
 const h=historicoPrecos(estado,empresa),preco=precoAtual(cond,agora),ref=h.apresentadaCent??preco,avisos=[];
 if(h.apresentadaCent==null)avisos.push('Nenhum preço foi registrado como apresentado a esta empresa; usei o preço vigente ('+R(preco)+') como referência. Registre a oferta apresentada para uma análise precisa.');
 const dentro=simularOferta(cond,{forma,valorCent:contrapropostaCent,parcelas});
 const statusMin=dentro.comparacao.vsPrecoMinimo;
 const situacao=contrapropostaCent>=ref?'igual-ou-acima':statusMin.disponivel&&statusMin.abaixo?'abaixo-do-minimo':veredito(dentro)===true?'dentro-dos-limites':veredito(dentro)===false?'fora-dos-limites':'indeterminada';
 const jaDescontou=h.descontosConcedidosCent.length>0;
 const alternativas=[];const add=(id,titulo,cen,explicacao,riscos='')=>{const sim=simularOferta(cond,cen);alternativas.push({id,titulo,cenario:cen,efeito:resumo(sim),sim,explicacao,riscos,passaLimites:veredito(sim)});};
 add('manter','Manter o preço apresentado',{forma,valorCent:ref,parcelas},`Mantém ${R(ref)}. É a opção que preserva sua margem; o risco é perder a negociação se o orçamento do cliente for firme.`,'Pode encerrar a conversa se o preço for o impedimento real.');
 if(cond.precoPixCent>0&&(forma!=='pix')&&cond.precoPixCent<ref)add('pix','Oferecer o preço no Pix',{forma:'pix',valorCent:cond.precoPixCent},`Reduz de ${R(ref)} para ${R(cond.precoPixCent)} em troca de pagamento à vista. Costuma ter taxa menor e receber mais rápido (confira suas taxas reais).`);
 if(cond.parcelasMax>1)add('parcelar','Oferecer parcelamento (mesmo preço)',{forma:'cartao',valorCent:ref,parcelas:cond.parcelasMax},`Mantém ${R(ref)} dividido em até ${cond.parcelasMax}x. Resolve restrição de caixa sem desconto, mas pode ter taxa de cartão e atrasar o recebimento.`);
 if(contrapropostaCent<ref){const entrada=Math.round(contrapropostaCent*0.5);add('entrada','Entrada + saldo',{forma:'entrada-saldo',valorCent:Math.max(ref-Math.round((ref-contrapropostaCent)/2),contrapropostaCent),entradaCent:entrada,parcelas:2},'Meio-termo: valor entre o seu e o do cliente, com metade na entrada. A parte do desconto concedido é só metade do pedido.');
  add('escopo','Reduzir o escopo de forma transparente',{forma,valorCent:contrapropostaCent,parcelas,escopoReduzidoPct:25},`Aceita ${R(contrapropostaCent)} apenas se algo concreto for retirado (ex.: menos seções ou integrações) e isso estiver descrito na proposta. Estimei 25% menos horas de desenvolvimento.`,'Só faz sentido se o escopo realmente diminuir; senão é desconto disfarçado.');
  add('contraproposta-aceita',`Aceitar ${R(contrapropostaCent)}`,{forma,valorCent:contrapropostaCent,parcelas},'Aceita a contraproposta como está.','Define um precedente de preço.');}
 alternativas.push({id:'prazo',titulo:'Negociar prazo, não preço',cenario:null,efeito:null,passaLimites:null,explicacao:'Oferecer mais tempo para pagar ou início programado não muda o preço. Só use se isso resolver a objeção real.',riscos:'Prazo longo pode atrasar seu recebimento.'});
 alternativas.push({id:'recusar',titulo:'Não aceitar a contraproposta',cenario:null,efeito:null,passaLimites:null,explicacao:'Agradecer e manter as condições. Preserva o valor do seu trabalho; pode perder esta venda.',riscos:'Perda da oportunidade.'});
 // recomendação determinística
 const descartadas=[];let rec;
 if(situacao==='igual-ou-acima')rec={id:'manter',porque:'A contraproposta é igual ou maior que o valor apresentado: não há desconto a decidir.'};
 else if(situacao==='abaixo-do-minimo'){rec={id:'recusar',porque:`${R(contrapropostaCent)} está abaixo do seu preço mínimo (${R(statusMin.minimoCent)}). Considere Pix/parcelamento no preço apresentado ou encerrar com cordialidade.`};descartadas.push({id:'contraproposta-aceita',motivo:'Abaixo do preço mínimo.'},{id:'escopo',motivo:'Mesmo reduzindo o escopo, o valor líquido ficaria abaixo do mínimo que você definiu.'});}
 else if(situacao==='dentro-dos-limites')rec={id:'contraproposta-aceita',porque:'A contraproposta respeita seu preço mínimo, margem e retorno por hora. Aceitar é financeiramente possível; a decisão é sua.'};
 else{const ordem=['pix','parcelar','entrada','escopo','manter'];const c=ordem.map(id=>alternativas.find(a=>a.id===id)).find(a=>a&&a.passaLimites===true);rec=c?{id:c.id,porque:'Primeira alternativa que respeita seus limites configurados: '+c.titulo+'.'}:{id:'manter',porque:'Nenhuma alternativa foi comprovadamente aceitável com os dados atuais (veja os valores desconhecidos). Manter o preço é o caminho mais seguro.'};}
 for(const a of alternativas)if(a.id!==rec.id&&!descartadas.some(d=>d.id===a.id))descartadas.push({id:a.id,motivo:a.passaLimites===true?'Possível, mas menos adequada que a recomendada.':a.passaLimites===false?'Viola algum limite configurado (veja o efeito financeiro).':'Não é possível confirmar que respeita seus limites (faltam dados).'});
 return {referenciaCent:ref,contrapropostaCent,descontoPedidoCent:Math.max(0,ref-contrapropostaCent),descontoPedidoPct:ref>0?Math.max(0,(ref-contrapropostaCent)/ref*100):0,situacao,historico:{descontosJaConcedidosCent:h.descontosConcedidosCent,contrapropostas:h.contrapropostas.length,jaTeveDesconto:jaDescontou},alternativas,recomendacao:rec,descartadas,avisos:[...avisos,...(jaDescontou?['Você já concedeu desconto a esta empresa antes: mais um enfraquece a âncora de preço.']:[]),...dentro.alertas],riscos:['Esta análise usa só os dados e limites que você configurou.','Nada foi alterado: aplicar qualquer opção exige sua ação e confirmação.'],simulacaoBase:dentro};
}
