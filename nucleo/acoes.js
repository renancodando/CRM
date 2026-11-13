import {registrarEvento,registrarAuditoria,moverEtapa,eventosDaEmpresa,novoId} from './esquema.js';
const ordem=['encontrada','verificada','mensagem','respondeu','demonstracao','negociacao','proposta','fechada'];
const antes=(a,b)=>ordem.indexOf(a)<ordem.indexOf(b);
const agoraISO=()=>new Date().toISOString();
const somar=(n)=>{const d=new Date();d.setDate(d.getDate()+n);d.setHours(10,0,0,0);return d.toISOString();};
export function confirmarEnvioMensagem(estado,empresa,{texto,estrategia='',variante='',tipo='',demonstracaoId='',experimentoId='',extra={}}){
 if(!texto?.trim())throw Error('Informe o texto da mensagem enviada.');
 if(empresa.situacao==='nao-contatar')throw Error('Esta empresa está marcada como "não contatar".');
 const quando=agoraISO(),ev=registrarEvento(estado,empresa.id,'mensagem-enviada',{...extra,texto:texto.trim(),estrategia,variante,tipoMsg:tipo,demonstracaoId,experimentoId,valorOferecido:empresa.valorNegociado??null,confirmadoPeloUsuario:true},quando);
 if(!empresa.primeiroContato)empresa.primeiroContato=quando;empresa.ultimoContato=quando;if(estrategia)empresa.abordagem=estrategia;
 empresa.historico.push({quando,texto:'Mensagem enviada (confirmada por você)'+(tipo?' · '+tipo:'')+'.'});
 if(antes(empresa.etapa,'mensagem')&&empresa.situacao==='ativa')moverEtapa(estado,empresa,'mensagem','envio');
 return ev;
}
export function registrarResposta(estado,empresa,{texto='',interesse,pediuDemo=false,naoReceber=false,responsavel=false,recusou=false}){
 const quando=agoraISO(),ultimaEnvio=eventosDaEmpresa(estado,empresa.id,'mensagem-enviada').at(-1);
 const ev=registrarEvento(estado,empresa.id,'resposta',{texto:texto.trim(),interesse:interesse||empresa.interesse,pediuDemo,responsavel,tempoRespostaHoras:ultimaEnvio?Math.max(0,Math.round((new Date(quando)-new Date(ultimaEnvio.quando))/36e5*10)/10):null},quando);
 empresa.ultimoContato=quando;if(!empresa.primeiroContato)empresa.primeiroContato=quando;
 if(interesse&&interesse!=='desconhecido')empresa.interesse=interesse;if(pediuDemo)empresa.solicitouDemo=true;if(responsavel)empresa.contatoDireto='sim';
 empresa.historico.push({quando,texto:'Resposta registrada: '+(texto.trim().slice(0,140)||'sem texto')+'.'});
 if(antes(empresa.etapa,'respondeu')&&empresa.situacao==='ativa')moverEtapa(estado,empresa,'respondeu','resposta');
 if(naoReceber)marcarNaoContatar(estado,empresa,'Pediu para não receber novas mensagens.');
 else if(recusou)registrarPerda(estado,empresa,{motivo:'Recusou a proposta',detalhe:texto,situacao:'recusada'});
 return ev;
}
export function marcarNaoContatar(estado,empresa,motivo=''){empresa.situacao='nao-contatar';empresa.historico.push({quando:agoraISO(),texto:'Marcada como não contatar. '+motivo});registrarEvento(estado,empresa.id,'contato',{acao:'nao-contatar',motivo});registrarAuditoria(estado,'situacao',empresa.id,empresa.nome+': não contatar');}
export function registrarPerda(estado,empresa,{motivo,detalhe='',situacao='perdida'}){
 if(!motivo)throw Error('Informe o motivo.');const quando=agoraISO();empresa.situacao=situacao;empresa.motivoPerda=motivo+(detalhe?' — '+detalhe.slice(0,300):'');empresa.retornoEm='';
 empresa.historico.push({quando,texto:(situacao==='recusada'?'Recusou':'Oportunidade perdida')+': '+motivo+'.'});registrarEvento(estado,empresa.id,'perda',{motivo,detalhe,situacao,etapa:empresa.etapa,tempoAteFimDias:Math.round((new Date(quando)-new Date(empresa.primeiroContato||empresa.criada))/864e5*10)/10});
 for(const p of estado.propostas)if(p.empresaId===empresa.id&&['criada','enviada'].includes(p.estado)&&situacao==='recusada'){p.estado='recusada';p.historico.push({quando,texto:'Recusada pelo cliente.'});}
 registrarAuditoria(estado,'perda',empresa.id,empresa.nome+': '+motivo);
}
export function reativar(estado,empresa){empresa.situacao='ativa';empresa.motivoPerda='';empresa.historico.push({quando:agoraISO(),texto:'Oportunidade reativada.'});registrarAuditoria(estado,'situacao',empresa.id,empresa.nome+' reativada');}
export function registrarDemonstracaoApresentada(estado,empresa,demo,{versaoId,link='',mensagem=''}){
 const quando=agoraISO(),versao=(demo.versoes||[]).find(v=>v.id===versaoId);
 const ev=registrarEvento(estado,empresa.id,'demonstracao-apresentada',{demonstracaoId:demo.id,versaoId,versao:versao?.numero,link,confirmadoPeloUsuario:true},quando);
 demo.apresentacoes=[...(demo.apresentacoes||[]),{id:novoId(),quando,versaoId,versao:versao?.numero,link}];demo.status='apresentada';
 empresa.ultimoContato=quando;empresa.historico.push({quando,texto:`Demonstração "${demo.nome||demo.id}" apresentada (versão ${versao?.numero||'?'}).`});
 if(antes(empresa.etapa,'demonstracao')&&empresa.situacao==='ativa')moverEtapa(estado,empresa,'demonstracao','demonstracao');
 return ev;
}
export function sugerirProximaAcao(estado,empresa){
 const e=empresa;if(e.situacao==='nao-contatar')return {texto:'Não contatar. Nenhuma ação sugerida.',dias:null};
 if(e.situacao==='pausada')return {texto:'Oportunidade pausada. Defina quando retomar.',dias:null};
 if(['perdida','recusada'].includes(e.situacao))return {texto:'Encerrada. Registre o aprendizado no Laboratório de Vendas.',dias:null};
 const mapa={encontrada:['Verificar se possui site e identificar o responsável.',1],verificada:['Preparar e enviar a primeira mensagem.',1],mensagem:['Retomar a conversa caso não haja resposta.',3],respondeu:['Responder e avaliar a necessidade; oferecer a demonstração.',1],demonstracao:['Perguntar o que achou da demonstração.',3],negociacao:['Apresentar a condição comercial e esclarecer objeções.',2],proposta:['Acompanhar a decisão sobre a proposta.',2],fechada:['Confirmar pagamento e iniciar o pós-venda.',1]};
 const [texto,d]=mapa[e.etapa]||mapa.encontrada;return {texto,dias:d};
}
export function criarProposta(estado,empresa,dados,comercial){
 const base=Number(dados.valorOriginal??comercial.precoNormal)||0,final=Number(dados.valorFinal??comercial.precoPromocional)||0;
 const p={id:novoId(),empresaId:empresa.id,demonstracaoId:dados.demonstracaoId||'',versao:1,estado:'criada',criadaEm:agoraISO(),atualizadaEm:agoraISO(),
  escopo:dados.escopo||'',funcionalidades:dados.funcionalidades||[],valorOriginal:base,desconto:Math.max(0,base-final),valorFinal:final,valorPix:Number(dados.valorPix??comercial.precoPix)||0,parcelasMax:Number(dados.parcelasMax??comercial.parcelasMax)||1,jurosParcelas:Number(comercial.jurosParcelas)||0,condicoesPagamento:dados.condicoesPagamento??comercial.pagamento,prazoEntregaDias:Number(dados.prazoEntregaDias??comercial.prazoEntregaDias)||0,validade:dados.validade||somar(Number(comercial.validadeDias)||7),suporte:dados.suporte??comercial.suporte,suporteDias:Number(dados.suporteDias??comercial.suporteDias)||0,dominio:dados.dominio||'',hospedagem:dados.hospedagem||'',condicoesAdicionais:dados.condicoesAdicionais||'',historico:[{quando:agoraISO(),texto:'Proposta criada.'}],versoes:[]};
 estado.propostas.push(p);empresa.historico.push({quando:p.criadaEm,texto:'Proposta criada ('+p.valorFinal+').'});return p;
}
export function mudarEstadoProposta(estado,proposta,novo,{confirmado=false,motivo=''}={}){
 const empresa=estado.empresas.find(e=>e.id===proposta.empresaId),quando=agoraISO();
 if(['aceita','recusada'].includes(novo)&&!confirmado)throw Error('Confirme manualmente a decisão do cliente antes de registrar.');
 proposta.estado=novo;proposta.atualizadaEm=quando;proposta.historico.push({quando,texto:'Estado: '+novo+(motivo?' — '+motivo:'')+'.'});
 if(!empresa)return;
 if(novo==='enviada'){registrarEvento(estado,empresa.id,'proposta-enviada',{propostaId:proposta.id,valor:proposta.valorFinal,confirmadoPeloUsuario:true},quando);empresa.valorNegociado=proposta.valorFinal;empresa.ultimoContato=quando;if(antes(empresa.etapa,'proposta')&&empresa.situacao==='ativa')moverEtapa(estado,empresa,'proposta','proposta');empresa.historico.push({quando,texto:'Proposta enviada (confirmada por você).'});}
 if(novo==='aceita'){registrarEvento(estado,empresa.id,'proposta-aceita',{propostaId:proposta.id,valor:proposta.valorFinal,confirmadoPeloUsuario:true},quando);empresa.valorNegociado=proposta.valorFinal;empresa.historico.push({quando,texto:'Proposta aceita (confirmada por você).'});if(empresa.etapa!=='fechada')moverEtapa(estado,empresa,'fechada','proposta');abrirPosVenda(estado,empresa,proposta);}
 if(novo==='recusada'){registrarEvento(estado,empresa.id,'proposta-recusada',{propostaId:proposta.id,motivo},quando);registrarPerda(estado,empresa,{motivo:motivo||'Proposta recusada',situacao:'recusada'});}
}
export function abrirPosVenda(estado,empresa,proposta){
 if(estado.posVenda.some(p=>p.empresaId===empresa.id&&p.propostaId===(proposta?.id||'')))return null;
 const pv={id:novoId(),empresaId:empresa.id,propostaId:proposta?.id||'',demonstracaoId:proposta?.demonstracaoId||'',estado:'em-andamento',criadoEm:agoraISO(),entregueEm:'',suporteAte:'',suporteDias:proposta?.suporteDias||0,pendencias:[],alteracoes:[],observacoes:''};
 estado.posVenda.push(pv);return pv;
}
export function totalPago(estado,propostaId){return estado.pagamentos.filter(p=>p.propostaId===propostaId&&p.estado==='confirmado').reduce((s,p)=>s+Number(p.valor||0),0);}
export function registrarPagamento(estado,empresa,{propostaId='',valor,forma='',parcela='',confirmado=false,observacao='',quando}){
 if(!confirmado)throw Error('Marque a confirmação de que o valor foi realmente recebido.');const v=Number(valor);if(!(v>0))throw Error('Informe um valor maior que zero.');
 const q=quando||agoraISO(),pg={id:novoId(),empresaId:empresa.id,propostaId,valor:v,forma,parcela,estado:'confirmado',confirmadoEm:agoraISO(),quando:q,observacao};estado.pagamentos.push(pg);
 registrarEvento(estado,empresa.id,'pagamento',{pagamentoId:pg.id,propostaId,valor:v,confirmadoPeloUsuario:true},q);empresa.historico.push({quando:q,texto:'Pagamento recebido (confirmado por você): '+v+'.'});
 return pg;
}
export function fecharVenda(estado,empresa,{valor,condicoes='',confirmado=false,propostaId=''}){
 if(!confirmado)throw Error('Confirme que o cliente aceitou antes de fechar a venda.');const v=Number(valor);if(!(v>0))throw Error('Informe o valor negociado.');
 const quando=agoraISO();empresa.valorNegociado=v;empresa.condicoes=condicoes;
 const prop=estado.propostas.find(p=>p.id===propostaId);if(prop&&prop.estado!=='aceita')mudarEstadoProposta(estado,prop,'aceita',{confirmado:true});
 registrarEvento(estado,empresa.id,'venda',{valor:v,propostaId,tempoAteFechamentoDias:Math.round((new Date(quando)-new Date(empresa.primeiroContato||empresa.criada))/864e5*10)/10,confirmadoPeloUsuario:true},quando);
 if(empresa.etapa!=='fechada')moverEtapa(estado,empresa,'fechada','venda');empresa.situacao='ativa';empresa.historico.push({quando,texto:'Venda fechada por '+v+' (confirmada por você).'});
 abrirPosVenda(estado,empresa,prop);registrarAuditoria(estado,'venda',empresa.id,empresa.nome+': venda fechada');
}
