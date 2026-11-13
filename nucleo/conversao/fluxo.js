/* Ciclo de vida da mensagem no Órbita Conversão: rascunho → preparada → copiada → WhatsApp aberto → envio confirmado → resposta registrada. SÓ a confirmação explícita registra o envio. */
import {novoId,registrarEvento,registrarAuditoria,eventosDaEmpresa} from '../esquema.js';
import {confirmarEnvioMensagem,registrarResposta} from '../acoes.js';
import {podeContatar,conv,estadoConversa} from './dominio.js';
import {contatosDaEmpresa,linkWhatsAppDireto,confirmarWhatsApp} from '../contatos.js';
export const MOTOR_VERSAO='conversao-2.0';
export const ESTADOS_MENSAGEM=[['rascunho','Rascunho'],['preparada','Preparada'],['copiada','Copiada'],['whatsapp-aberto','WhatsApp aberto'],['envio-confirmado','Envio confirmado'],['resposta-registrada','Resposta registrada'],['encerrada','Encerrada'],['cancelada','Cancelada']];
export const rotuloEstadoMensagem=id=>ESTADOS_MENSAGEM.find(e=>e[0]===id)?.[1]||id;
const agora=()=>new Date().toISOString();
const ORDEM=ESTADOS_MENSAGEM.map(e=>e[0]);
export function salvarRascunho(estado,empresa,{id='',texto,tipo='',variante=0,estrategia='',alternativa='',porque='',auditoria=null,experimentoId='',contatoId='',textoSugerido='',origem='usuario'}){
 if(!String(texto||'').trim())throw Error('Escreva a mensagem antes de salvar.');
 let r=id?estado.rascunhos.find(x=>x.id===id):null;
 if(!r){r={id:novoId(),empresa:empresa.id,criadoEm:agora(),estadoMensagem:'rascunho',historicoEstados:[{estado:'rascunho',quando:agora()}],origem};estado.rascunhos.push(r);}
 else if(['envio-confirmado','resposta-registrada','encerrada'].includes(r.estadoMensagem))throw Error('Esta mensagem já foi enviada: crie um novo rascunho.');
 Object.assign(r,{texto:String(texto),quando:agora(),tipo,variante,estrategia,alternativa,porque,auditoria,experimentoId,contatoId,textoSugerido:textoSugerido||r.textoSugerido||'',motorVersao:MOTOR_VERSAO});return r;
}
export function marcarEstadoMensagem(estado,rascunhoId,novo,extra={}){
 const r=estado.rascunhos.find(x=>x.id===rascunhoId);if(!r)throw Error('Mensagem não encontrada.');if(!ORDEM.includes(novo))throw Error('Estado inválido.');
 if(r.estadoMensagem===novo)return r;
 if(novo==='envio-confirmado'&&!extra._confirmacao)throw Error('O envio só é registrado pela confirmação explícita.');
 r.estadoMensagem=novo;(r.historicoEstados??=[]).push({estado:novo,quando:agora(),...(extra.nota?{nota:extra.nota}:{})});r.quando=agora();return r;
}
export function prepararParaWhatsApp(estado,empresa,rascunho,{contatoId=''}={}){
 const perm=podeContatar(empresa,'whatsapp');if(!perm.ok)return {ok:false,motivo:perm.motivo};
 if(!String(rascunho.texto||'').trim())return {ok:false,motivo:'Escreva a mensagem antes de abrir o WhatsApp.'};
 const cs=contatosDaEmpresa(empresa),c=cs.find(x=>x.id===contatoId)||cs.find(x=>x.norm.estruturaValida);
 if(!c)return {ok:false,motivo:'Nenhum número com estrutura válida cadastrado. Cadastre o WhatsApp da empresa com DDD.'};
 if(!c.norm.estruturaValida)return {ok:false,motivo:c.norm.motivo||'Número inválido.'};
 const l=linkWhatsAppDireto(c.norm.e164,rascunho.texto);if(!l.url)return {ok:false,motivo:l.erro};
 return {ok:true,url:l.url,aviso:l.aviso,contato:c,numero:c.norm.e164,avisosNumero:c.norm.avisos,whatsappConfirmado:c.whatsappConfirmado,permissao:perm};
}
export function registrarAberturaWhatsApp(estado,rascunhoId,{contato,numero}){
 const r=marcarEstadoMensagem(estado,rascunhoId,'whatsapp-aberto');r.contatoId=contato.id;r.contatoRotulo=contato.rotulo;r.numero=numero;r.abertoEm=agora();return r;
}
export const pendentesDeConfirmacao=(estado,empresaId='')=>estado.rascunhos.filter(r=>r.estadoMensagem==='whatsapp-aberto'&&(!empresaId||r.empresa===empresaId));
export function confirmarEnvioDoRascunho(estado,empresa,rascunhoId,{texto,retornoDias=null,registrarDemonstracao=null}={}){
 const r=estado.rascunhos.find(x=>x.id===rascunhoId);if(!r)throw Error('Mensagem não encontrada.');
 if(['envio-confirmado','resposta-registrada','encerrada'].includes(r.estadoMensagem))throw Error('O envio desta mensagem já foi confirmado.');
 const final=String(texto??r.texto).trim();if(!final)throw Error('Informe o texto exato que foi enviado.');
 const ec=estadoConversa(estado,empresa),retorno=retornoDias?new Date(Date.now()+retornoDias*864e5).toISOString():null;
 const ev=confirmarEnvioMensagem(estado,empresa,{texto:final,estrategia:r.estrategia||'',variante:String(r.variante??''),tipo:r.tipo||'',experimentoId:r.experimentoId||'',extra:{canal:'whatsapp',contatoId:r.contatoId||'',contatoRotulo:r.contatoRotulo||'',numero:r.numero||'',estagio:ec.estado,alternativa:r.alternativa||'',motorVersao:r.motorVersao||MOTOR_VERSAO,rascunhoId:r.id,textoSugerido:r.textoSugerido&&r.textoSugerido!==final?r.textoSugerido:'',editadoNoEnvio:!!(r.textoSugerido&&r.textoSugerido!==final),proximaAcao:empresa.proximaAcao||'',followUpEm:retorno||''}});
 r.texto=final;r.eventoId=ev.id;r.confirmadoEm=ev.quando;marcarEstadoMensagem(estado,rascunhoId,'envio-confirmado',{_confirmacao:true});
 if(retorno){empresa.retornoEm=retorno;empresa.proximaAcao='Retomar a conversa se não houver resposta';estado.lembretes.push({id:novoId(),titulo:'Retomar conversa · '+empresa.nome,quando:retorno,empresa:empresa.id,concluido:false,origem:'envio'});estado.notificacoesLidas=false;}
 return ev;
}
export function cancelarEnvio(estado,rascunhoId,{nota=''}={}){const r=estado.rascunhos.find(x=>x.id===rascunhoId);if(!r)throw Error('Mensagem não encontrada.');if(['envio-confirmado','resposta-registrada','encerrada'].includes(r.estadoMensagem))throw Error('Mensagem já enviada.');return marcarEstadoMensagem(estado,rascunhoId,'cancelada',{nota});}
export function voltarParaRascunho(estado,rascunhoId){const r=estado.rascunhos.find(x=>x.id===rascunhoId);if(!r)throw Error('Mensagem não encontrada.');if(['envio-confirmado','resposta-registrada','encerrada'].includes(r.estadoMensagem))throw Error('Mensagem já enviada.');r.estadoMensagem='rascunho';(r.historicoEstados??=[]).push({estado:'rascunho',quando:agora()});return r;}
export function corrigirTextoEnviado(estado,eventoId,novoTexto,{motivo='texto alterado no WhatsApp'}={}){
 const ev=estado.eventos.find(e=>e.id===eventoId&&e.tipo==='mensagem-enviada');if(!ev)throw Error('Mensagem enviada não encontrada.');const t=String(novoTexto||'').trim();if(!t)throw Error('Informe o texto.');if(t===ev.texto)return ev;
 (ev.correcoes??=[]).push({quando:agora(),textoAnterior:ev.texto,motivo});ev.texto=t;ev.corrigidoEm=agora();
 const r=estado.rascunhos.find(x=>x.eventoId===eventoId);if(r)r.texto=t;
 registrarAuditoria(estado,'mensagem',eventoId,'Texto enviado corrigido: '+motivo);return ev;
}
export function registrarRespostaDaConversa(estado,empresa,{texto,interesse,pediuDemo=false,naoReceber=false,recusou=false,numero=''}){
 const antes=estado.eventos.length;registrarResposta(estado,empresa,{texto,interesse,pediuDemo,naoReceber,recusou});
 const ev=estado.eventos.slice(antes).find(e=>e.tipo==='resposta');if(ev&&numero){ev.numero=numero;ev.canal='whatsapp';confirmarWhatsApp(empresa,numero,{origem:'resposta recebida'});}
 const ult=[...estado.rascunhos].reverse().find(r=>r.empresa===empresa.id&&r.estadoMensagem==='envio-confirmado');if(ult)marcarEstadoMensagem(estado,ult.id,'resposta-registrada');
 return ev;
}
export function encerrarConversa(estado,empresaId){for(const r of estado.rascunhos.filter(x=>x.empresa===empresaId&&['envio-confirmado','resposta-registrada'].includes(x.estadoMensagem)))marcarEstadoMensagem(estado,r.id,'encerrada');}
