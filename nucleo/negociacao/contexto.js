/* Dossiê comercial: linha do tempo unificada e resumo da negociação. Distingue o que foi REALMENTE enviado/recebido (confirmado) de rascunhos e sugestões. */
import {eventosDaEmpresa} from '../esquema.js';
import {estadoConversa,rotuloEstadoConversa,conv} from '../conversao/dominio.js';
import {normal} from '../conversao/linguagem.js';
const DIA=864e5;
export const reRS=/R\$\s*(\d{1,3}(?:\.\d{3})+|\d+)(?:,(\d{2}))?/g;
export function valoresEmTexto(t){const o=[];for(const m of String(t||'').matchAll(reRS))o.push(Math.round(Number(m[1].replace(/\./g,'')+'.'+(m[2]||'00'))*100));return o;}
export function linhaDoTempo(estado,empresa){
 const it=[],id=empresa.id;
 const push=(o)=>it.push({confirmado:true,origem:'crm',...o});
 const consolidadas=new Set(estado.conversas.filter(c=>c.empresaId===id&&c.consolidada).map(c=>c.id));
 for(const e of eventosDaEmpresa(estado,id)){
  if(e.tipo==='mensagem-enviada')push({id:e.id,quando:e.quando,tipo:'mensagem-enviada',autor:'eu',texto:e.texto||'',origem:e.origem||'crm',meta:{estrategia:e.estrategia,experimentoId:e.experimentoId}});
  else if(e.tipo==='resposta')push({id:e.id,quando:e.quando,tipo:'resposta',autor:'cliente',texto:e.texto||'',origem:e.origem||'crm',meta:{interesse:e.interesse,pediuDemo:e.pediuDemo}});
  else if(e.tipo==='demonstracao-apresentada')push({id:e.id,quando:e.quando,tipo:'demonstracao-apresentada',autor:'eu',texto:'Demonstração apresentada'+(e.link?': '+e.link:''),meta:{demonstracaoId:e.demonstracaoId,link:e.link}});
  else if(['proposta-enviada','proposta-aceita'].includes(e.tipo))push({id:e.id,quando:e.quando,tipo:e.tipo,autor:e.tipo==='proposta-enviada'?'eu':'cliente',texto:(e.tipo==='proposta-enviada'?'Proposta enviada':'Proposta aceita (confirmada por você)')+(e.valor?' · R$ '+e.valor:''),meta:{valor:e.valor}});
  else if(e.tipo==='perda')push({id:e.id,quando:e.quando,tipo:'perda',autor:'sistema',texto:'Perda registrada: '+(e.motivo||'sem motivo'),meta:{motivo:e.motivo}});
  else if(e.tipo==='venda')push({id:e.id,quando:e.quando,tipo:'venda',autor:'sistema',texto:'Venda confirmada'});
 }
 for(const c of estado.conversas.filter(c=>c.empresaId===id&&!consolidadas.has(c.id)))for(const m of c.mensagens)if(m.autor==='eu'||m.autor==='cliente')push({id:m.id,quando:m.quando||c.importadaEm,tipo:m.autor==='eu'?'mensagem-enviada':'resposta',autor:m.autor,texto:m.texto,origem:'conversa-colada',meta:{quandoEstimado:!m.quando}});
 for(const o of estado.ofertas.filter(o=>o.empresaId===id))push({id:o.id,quando:o.quando,tipo:'oferta-'+o.tipo,autor:o.tipo==='contraproposta'?'cliente':'eu',texto:`Oferta ${o.tipo}: R$ ${(o.valorCent/100).toLocaleString('pt-BR',{minimumFractionDigits:2})}${o.forma?' · '+o.forma:''}`,meta:{valorCent:o.valorCent}});
 for(const r of estado.rascunhos.filter(r=>(r.empresa||r.empresaId)===id&&!['envio-confirmado','resposta-registrada','encerrada','cancelada'].includes(r.estadoMensagem)))push({id:r.id,quando:r.quando||r.criadoEm||new Date(0).toISOString(),tipo:'rascunho',autor:'eu',texto:r.texto,confirmado:false,origem:r.origem||'usuario',meta:{estadoMensagem:r.estadoMensagem||'rascunho'}});
 for(const o of conv(estado).registrosObjecao.filter(o=>o.empresaId===id))push({id:o.id,quando:o.quando,tipo:'objecao',autor:'cliente',texto:'Objeção registrada: '+o.objecao+(o.texto?' — '+o.texto:''),meta:{objecao:o.objecao}});
 for(const p of estado.publicacoes.filter(p=>p.empresaId===id&&p.publicadoEm))push({id:'pub'+p.id,quando:p.publicadoEm,tipo:'publicacao',autor:'sistema',texto:'Demonstração publicada: '+p.urlPublica,meta:{publicacaoId:p.id}});
 return it.sort((a,b)=>String(a.quando).localeCompare(String(b.quando)));
}
export function resumoNegociacao(estado,empresa,{agora=Date.now()}={}){
 const lt=linhaDoTempo(estado,empresa),reais=lt.filter(x=>x.confirmado&&['mensagem-enviada','resposta'].includes(x.tipo)),ult=reais.at(-1),minhas=reais.filter(x=>x.autor==='eu'),deles=reais.filter(x=>x.autor==='cliente');
 const ofertas=estado.ofertas.filter(o=>o.empresaId===empresa.id).sort((a,b)=>a.quando.localeCompare(b.quando));
 const porOferta=[...ofertas].reverse().find(o=>o.tipo==='apresentada'),propostas=estado.propostas.filter(p=>p.empresaId===empresa.id&&p.estado!=='cancelada'),porProposta=propostas.filter(p=>['enviada','aceita'].includes(p.estado)).at(-1);
 let preco=null;
 if(porOferta)preco={valorCent:porOferta.valorCent,origem:'oferta registrada',quando:porOferta.quando};
 else if(porProposta)preco={valorCent:Math.round(porProposta.valorFinal*100),origem:'proposta enviada',quando:porProposta.atualizadaEm};
 else{for(const m of [...minhas].reverse()){const v=valoresEmTexto(m.texto);if(v.length){preco={valorCent:v[0],origem:'mensagem enviada',quando:m.quando};break;}}}
 const demos=estado.demonstracoes.filter(d=>d.empresaId===empresa.id),pubs=estado.publicacoes.filter(p=>p.empresaId===empresa.id&&!p.arquivada),apres=lt.filter(x=>x.tipo==='demonstracao-apresentada');
 const ec=estadoConversa(estado,empresa,agora);
 const aguardando=!ult?null:ult.autor==='eu'?'cliente':'eu';
 return {empresaId:empresa.id,estagio:{id:ec.estado,rotulo:rotuloEstadoConversa(ec.estado),evidencias:ec.evidencias},situacao:empresa.situacao,
  contagens:{enviadas:minhas.length,recebidas:deles.length,rascunhos:lt.filter(x=>x.tipo==='rascunho').length,objecoes:lt.filter(x=>x.tipo==='objecao').length},
  ultima:ult?{autor:ult.autor,quando:ult.quando,texto:ult.texto}:null,aguardando,diasDesdeUltima:ult?Math.floor((agora-new Date(ult.quando).getTime())/DIA):null,
  precoApresentado:preco,descontosConcedidosCent:propostas.map(p=>Math.round((p.valorOriginal-p.valorFinal)*100)).filter(d=>d>0),contrapropostas:ofertas.filter(o=>o.tipo==='contraproposta').map(o=>o.valorCent),
  propostas:propostas.map(p=>({id:p.id,estado:p.estado,valorFinal:p.valorFinal,validade:p.validade})),
  demonstracao:{existe:demos.length>0,publicada:pubs.some(p=>['publicada','publicada-sem-verificacao'].includes(p.estado)),urlPublica:pubs.find(p=>p.urlPublica)?.urlPublica||'',apresentada:apres.length>0,ultimaApresentacao:apres.at(-1)?.quando||null},
  motivoPerda:empresa.motivoPerda||'',proximaAcaoCadastrada:empresa.proximaAcao||'',linhaDoTempo:lt};
}
export function detectarCompromissos(texto){
 const t=normal(texto),o=[];const pad=[[/te (envio|mando|passo|encaminho)\b[^.?!]{0,60}/,'Enviar algo prometido'],[/vou (te )?(enviar|mandar|montar|preparar|criar|fazer)\b[^.?!]{0,60}/,'Fazer algo prometido'],[/(volto|retorno|te chamo|falo com voce)\b[^.?!]{0,40}(amanha|segunda|terca|quarta|quinta|sexta|semana|hoje|depois)[^.?!]{0,20}/,'Retornar no prazo combinado']];
 for(const [re,rot] of pad){const m=re.exec(t);if(m)o.push({rotulo:rot,trecho:m[0].trim()});}return o;
}
