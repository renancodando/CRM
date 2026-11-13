/* Sincronização com o repositório privado via transporte (ponte serverless). Local primeiro: aplica e persiste antes de publicar confirmações. */
import {processarOperacao,reprocessarDependencias,versaoDados} from './motor.js';
import {exportarAutorizado,hashArquivo} from './exportar.js';
import {VERSAO_PROTOCOLO} from './protocolo.js';
const LOTE=40;
const nomeId=n=>n.replace(/\.json$/,'');
export function estadoSync(estado){const s=estado.config.connect.sync;s.hashes??={};s.tentativas??=0;return s;}
export async function sincronizar(estado,transporte,{salvar=async()=>{},agora=()=>new Date(),forcarExportacao=false}={}){
 const sync=estadoSync(estado),rel={lidas:0,aplicadas:0,revisao:0,rejeitadas:0,conflitos:0,publicadas:0,exportacoes:0,erros:[]};
 let st;try{st=await transporte.status();}catch(e){return falha(estado,sync,'rede','Não foi possível contatar a ponte: '+e.message,rel);}
 if(!st?.autenticado)return falha(estado,sync,'nao-autenticado','Sessão não autenticada. Entre com sua conta GitHub em Configuração.',rel);
 try{
  const [pend,conf]=await Promise.all([transporte.listar('entrada/pendentes'),transporte.listar('saida/confirmacoes')]);
  const feitas=new Set(conf.map(x=>nomeId(x.nome))),novas=pend.filter(x=>x.nome.endsWith('.json')&&!feitas.has(nomeId(x.nome))).slice(0,LOTE);
  for(const f of novas){rel.lidas++;let op,txt;try{txt=await transporte.ler(f.caminho);if(txt.length>70000)throw Error('arquivo grande demais');op=JSON.parse(txt);}catch(e){op={id:nomeId(f.nome),tipo:'?',_corrompida:e.message};}
   if(op&&op.id&&op.id!==nomeId(f.nome)&&!op._corrompida)op={...op,_idDiferenteDoArquivo:true};
   const c=processarOperacao(estado,op._corrompida?{__invalida:op._corrompida,id:op.id}:op,{recebidaEm:agora().toISOString()});
   const reg=estado.operacoes.find(o=>o.id===(op.id||nomeId(f.nome)));if(reg){reg.arquivo=f.caminho;}
   if(c.estado==='aplicada')rel.aplicadas++;else if(c.estado==='aguardando-revisao')rel.revisao++;else if(c.estado==='conflito')rel.conflitos++;else if(c.estado==='rejeitada')rel.rejeitadas++;}
  reprocessarDependencias(estado);
  await salvar();
  const arquivos={},publicar=[];
  for(const o of estado.operacoes){if(!o.arquivo)continue;const terminal=['aplicada','rejeitada','revertida','aguardando-revisao','conflito','pendente-dependencia'].includes(o.estado);if(!terminal||o.publicadaEstado===o.estado)continue;
   arquivos[`saida/confirmacoes/${o.id}.json`]=JSON.stringify({protocolo:VERSAO_PROTOCOLO,id:'conf_'+o.id,operacaoId:o.id,tipo:o.tipo,estado:o.estado,aplicada:o.estado==='aplicada',processadoEm:o.processadaEm,mensagem:o.mensagem||'',registros:o.registros||[],erros:o.erros||[],conflitos:o.conflitos||[],revisao:o.revisao||null,versaoDados:versaoDados(estado),publicadoEm:agora().toISOString()},null,1);publicar.push(o);
   if(['aplicada','rejeitada','revertida'].includes(o.estado)){const ym=agora().toISOString().slice(0,7);arquivos[o.arquivo]=null;arquivos[`entrada/processadas/${ym}/${o.id}.json`]=JSON.stringify(o.payload||{},null,1);}}
  const exp=exportarAutorizado(estado,agora());let mudou=0;for(const [p,c] of Object.entries(exp.arquivos)){const h=hashArquivo(c);if(forcarExportacao||sync.hashes[p]!==h){arquivos[p]=c;sync.hashes[p]=h;mudou++;}}
  const antigos=Object.keys(sync.hashes).filter(p=>!(p in exp.arquivos));for(const p of antigos){arquivos[p]=null;delete sync.hashes[p];}
  arquivos['saida/estado-sync.json']=JSON.stringify({protocolo:VERSAO_PROTOCOLO,ultimaSincronizacao:agora().toISOString(),versaoDados:exp.versaoDados,nivel:estado.config.connect.nivel,operacoesPendentesRevisao:estado.operacoes.filter(o=>o.estado==='aguardando-revisao').length},null,1);
  if(Object.keys(arquivos).length>1||publicar.length){await transporte.commit({mensagem:`Órbita: ${publicar.length} confirmação(ões), ${mudou} exportação(ões)`,arquivos});}
  for(const o of publicar)o.publicadaEstado=o.estado;rel.publicadas=publicar.length;rel.exportacoes=mudou;
  Object.assign(sync,{ultima:agora().toISOString(),versaoDados:exp.versaoDados,erro:'',tentativas:0,proxima:null,usuario:st.usuarioId});await salvar();
  return {ok:true,...rel};
 }catch(e){return falha(estado,sync,e.codigo||'falha',e.message,rel);}
}
function falha(estado,sync,codigo,msg,rel){sync.erro=msg;sync.codigoErro=codigo;sync.tentativas=(sync.tentativas||0)+1;sync.proxima=new Date(Date.now()+Math.min(3600e3,30e3*2**Math.min(sync.tentativas,7))).toISOString();return {ok:false,codigo,erro:msg,...rel};}
