/* Sincronização com o repositório privado via transporte (ponte serverless). Local primeiro: aplica e persiste antes de publicar confirmações. */
import {processarOperacao,reprocessarDependencias,versaoDados} from './motor.js';
import {exportarAutorizado,hashArquivo} from './exportar.js';
import {VERSAO_PROTOCOLO} from './protocolo.js';
const LOTE=40;
const LIMITE_ARQUIVOS=30,LIMITE_CORPO=1800000;
// Cada grupo (confirmação + arquivamento + remoção) é indivisível. Confirmações locais só são marcadas após o commit remoto.
export async function publicarEmLotes(transporte,grupos,mensagem){
 let lote={},callbacks=[];
 const tamanho=o=>new TextEncoder().encode(JSON.stringify({mensagem,arquivos:o})).length;
 const enviar=async()=>{if(!Object.keys(lote).length)return;await transporte.commit({mensagem,arquivos:lote});for(const cb of callbacks)await cb();lote={};callbacks=[];};
 for(const g of grupos){const arquivos=g.arquivos||{};if(!Object.keys(arquivos).length)continue;const junto={...lote,...arquivos};if(Object.keys(junto).length>LIMITE_ARQUIVOS||tamanho(junto)>LIMITE_CORPO)await enviar();if(Object.keys(arquivos).length>LIMITE_ARQUIVOS||tamanho(arquivos)>LIMITE_CORPO)throw Error('Grupo de arquivos excede o limite seguro de sincronização.');Object.assign(lote,arquivos);if(g.confirmar)callbacks.push(g.confirmar);}
 await enviar();
}
const nomeId=n=>n.replace(/\.json$/,'');
export function estadoSync(estado){const s=estado.config.connect.sync;s.hashes??={};s.tentativas??=0;return s;}
export async function sincronizar(estado,transporte,{salvar=async()=>{},agora=()=>new Date(),forcarExportacao=false}={}){
 const sync=estadoSync(estado),rel={lidas:0,aplicadas:0,revisao:0,rejeitadas:0,conflitos:0,publicadas:0,exportacoes:0,erros:[]};
 let st;try{st=await transporte.status();}catch(e){return falha(estado,sync,'rede','Não foi possível contatar a ponte: '+e.message,rel);}
 if(!st?.autenticado)return falha(estado,sync,'nao-autenticado','Sessão não autenticada. Entre com sua conta GitHub em Configuração.',rel);
 try{
  const [pend,conf,exportados]=await Promise.all([transporte.listar('entrada/pendentes'),transporte.listar('saida/confirmacoes'),transporte.listar('saida/exportacoes')]);
  const caminhosPendentes=new Set(pend.map(f=>f.caminho)),caminhosExportados=new Set(exportados.map(f=>f.caminho));
  const feitas=new Set(conf.map(x=>nomeId(x.nome))),novas=pend.filter(x=>x.nome.endsWith('.json')&&!feitas.has(nomeId(x.nome))).slice(0,LOTE);
  for(const f of novas){rel.lidas++;let op,txt;try{txt=await transporte.ler(f.caminho);if(txt.length>70000)throw Error('arquivo grande demais');op=JSON.parse(txt);}catch(e){op={id:nomeId(f.nome),tipo:'?',_corrompida:e.message};}
   if(op&&op.id&&op.id!==nomeId(f.nome)&&!op._corrompida)op={...op,_idDiferenteDoArquivo:true};
   const c=processarOperacao(estado,op._corrompida?{__invalida:op._corrompida,id:op.id}:op,{recebidaEm:agora().toISOString()});
   const reg=estado.operacoes.find(o=>o.id===(op.id||nomeId(f.nome)));if(reg){reg.arquivo=f.caminho;}
   if(c.estado==='aplicada')rel.aplicadas++;else if(c.estado==='aguardando-revisao')rel.revisao++;else if(c.estado==='conflito')rel.conflitos++;else if(c.estado==='rejeitada')rel.rejeitadas++;}
  reprocessarDependencias(estado);
  await salvar();
  const grupos=[];
  for(const o of estado.operacoes){if(!o.arquivo)continue;const terminal=['aplicada','rejeitada','revertida','aguardando-revisao','conflito','pendente-dependencia'].includes(o.estado);if(!terminal||o.publicadaEstado===o.estado)continue;
   const arquivos={};arquivos[`saida/confirmacoes/${o.id}.json`]=JSON.stringify({protocolo:VERSAO_PROTOCOLO,id:'conf_'+o.id,operacaoId:o.id,tipo:o.tipo,estado:o.estado,aplicada:o.estado==='aplicada',processadoEm:o.processadaEm,mensagem:o.mensagem||'',registros:o.registros||[],erros:o.erros||[],conflitos:o.conflitos||[],revisao:o.revisao||null,versaoDados:versaoDados(estado),publicadoEm:agora().toISOString()},null,1);
   if(['aplicada','rejeitada','revertida'].includes(o.estado)){const ym=(o.processadaEm||agora().toISOString()).slice(0,7);if(caminhosPendentes.has(o.arquivo)){arquivos[o.arquivo]=null;arquivos[`entrada/processadas/${ym}/${o.id}.json`]=JSON.stringify(o.payload||{},null,1);}}
   grupos.push({arquivos,confirmar:async()=>{o.publicadaEstado=o.estado;rel.publicadas++;await salvar();}});}
  await publicarEmLotes(transporte,grupos,'Órbita: confirmações e arquivamento');
  const exp=exportarAutorizado(estado,agora()),hashesNovos={},exports=[],forcar=forcarExportacao||sync.formatoLotes!==1;let mudou=0;
  for(const [p,c] of Object.entries(exp.arquivos)){const h=hashArquivo(c);hashesNovos[p]=h;if(p==='saida/manifesto.json')continue;if(forcar||sync.hashes[p]!==h||!caminhosExportados.has(p)){exports.push({arquivos:{[p]:c}});mudou++;}}
  // Publica páginas primeiro; manifesto e heartbeat só após todas as páginas terem sido gravadas.
  for(const p of caminhosExportados){if(!(p in exp.arquivos)){exports.push({arquivos:{[p]:null}});}}
  await publicarEmLotes(transporte,exports,'Órbita: exportações autorizadas');
  const heartbeat=!sync.ultimoCommit||agora().getTime()-new Date(sync.ultimoCommit).getTime()>6*3600e3;
  if(forcar||mudou||exports.length||rel.publicadas||heartbeat||sync.hashes['saida/manifesto.json']!==hashesNovos['saida/manifesto.json']){
   const arquivos={'saida/manifesto.json':exp.arquivos['saida/manifesto.json'],'saida/estado-sync.json':JSON.stringify({protocolo:VERSAO_PROTOCOLO,ultimaSincronizacao:agora().toISOString(),versaoDados:exp.versaoDados,nivel:estado.config.connect.nivel,operacoesPendentesRevisao:estado.operacoes.filter(o=>o.estado==='aguardando-revisao').length},null,1)};
   await transporte.commit({mensagem:'Órbita: manifesto e estado da sincronização',arquivos});sync.ultimoCommit=agora().toISOString();}
  sync.hashes=hashesNovos;sync.formatoLotes=1;rel.exportacoes=mudou;
  Object.assign(sync,{ultima:agora().toISOString(),versaoDados:exp.versaoDados,erro:'',tentativas:0,proxima:null,usuario:st.usuarioId});await salvar();
  return {ok:true,...rel};
 }catch(e){return falha(estado,sync,e.codigo||'falha',e.message,rel);}
}
function falha(estado,sync,codigo,msg,rel){sync.erro=msg;sync.codigoErro=codigo;sync.tentativas=(sync.tentativas||0)+1;sync.proxima=new Date(Date.now()+Math.min(3600e3,30e3*2**Math.min(sync.tentativas,7))).toISOString();return {ok:false,codigo,erro:msg,...rel};}
