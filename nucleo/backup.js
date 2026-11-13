import {normalizarEstado,normalizarEmpresa,etapas,colecoes,validarIntegridade,registrarAuditoria,novoId} from './esquema.js';
import {encontrarDuplicidades} from './duplicidades.js';
export const LIMITE_BYTES=25e6;
export async function resumoSha(texto){try{const b=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(texto));return [...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('');}catch{let h=2166136261;for(let i=0;i<texto.length;i++){h^=texto.charCodeAt(i);h=Math.imul(h,16777619);}return 'fnv-'+(h>>>0).toString(16);}}
export async function montarBackup(estado,motivo='manual'){
 const dados=JSON.stringify(estado);const checksum=await resumoSha(dados);
 return JSON.stringify({formato:'orbita-backup',versao:3,aplicacao:'Órbita',geradoEm:new Date().toISOString(),motivo,contagem:Object.fromEntries(colecoes.map(c=>[c,(estado[c]||[]).length])),checksum,dados:estado},null,1);
}
const camposObrigatorios={empresas:e=>typeof e.id==='string'&&typeof e.nome==='string'&&e.nome.trim()&&Array.isArray(e.historico||[])&&Number.isFinite(Number(e.valor??0)),lembretes:i=>typeof i.id==='string'&&typeof i.titulo==='string'&&Number.isFinite(new Date(i.quando).getTime()),rascunhos:i=>typeof i.id==='string'&&typeof i.texto==='string',demonstracoes:d=>typeof d.id==='string'&&typeof d.empresaId==='string'&&d.configuracao&&typeof d.configuracao==='object'&&Array.isArray(d.configuracao.servicos||[])};
export async function lerBackup(texto){
 if(typeof texto!=='string'||texto.length>LIMITE_BYTES)return {erro:'Arquivo grande demais ou inválido.'};
 let bruto;try{bruto=JSON.parse(texto);}catch{return {erro:'O arquivo não é um JSON válido.'};}
 let dados=bruto,versaoOrigem=bruto?.versao,avisos=[];
 if(bruto?.formato==='orbita-backup'){dados=bruto.dados;if(bruto.checksum){const calculado=await resumoSha(JSON.stringify(dados));if(calculado!==bruto.checksum)avisos.push('A verificação de integridade (checksum) não confere: o arquivo pode ter sido alterado. Revise antes de importar.');}}
 if(!dados||typeof dados!=='object'||![1,2,3].includes(Number(dados.versao)))return {erro:'Este arquivo não parece ser um backup do Órbita (versão não reconhecida).'};
 if(!Array.isArray(dados.empresas))return {erro:'O backup não contém a lista de empresas.'};
 const invalidos={};const limpo={...dados};
 for(const [c,ok] of Object.entries(camposObrigatorios)){const lista=Array.isArray(dados[c])?dados[c]:[];const validos=lista.filter(i=>i&&typeof i==='object'&&ok(i));if(validos.length!==lista.length)invalidos[c]=lista.length-validos.length;limpo[c]=validos;}
 const estadoImportado=normalizarEstado(limpo);
 const semEtapa=estadoImportado.empresas.filter(e=>!etapas.some(x=>x.id===e.etapa)).length;if(semEtapa)avisos.push(semEtapa+' empresa(s) com etapa desconhecida foram ajustadas para "Encontrada".');
 return {estadoImportado,versaoOrigem,invalidos,avisos};
}
const mesmo=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
export function prepararImportacao(estadoAtual,lido){
 const {estadoImportado:imp}=lido,plano={colecoes:{},conflitos:[],possiveisDuplicados:[]};
 for(const c of colecoes){if(c==='auditoria')continue;const atuais=new Map(estadoAtual[c].map(i=>[i.id,i]));const r={novos:[],iguais:0,conflitos:[]};
  for(const i of imp[c]){if(!i.id){continue;}const a=atuais.get(i.id);if(!a)r.novos.push(i);else if(mesmo(a,i))r.iguais++;else r.conflitos.push({id:i.id,atual:a,importado:i,resolucao:'manter'});}
  plano.colecoes[c]=r;}
 for(const n of plano.colecoes.empresas.novos){const d=encontrarDuplicidades(n,estadoAtual.empresas);if(d.length)plano.possiveisDuplicados.push({importada:n,existente:d[0].empresa,motivos:d[0].motivos});}
 plano.preferencias=false;return plano;
}
export function aplicarImportacao(estado,lido,plano,{incluirNovos=true}={}){
 const resultado={adicionados:0,substituidos:0,duplicadosComoNovos:0};
 for(const c of colecoes){if(c==='auditoria')continue;const r=plano.colecoes[c];if(incluirNovos)for(const i of r.novos){estado[c].push(i);resultado.adicionados++;}
  for(const k of r.conflitos){const indice=estado[c].findIndex(x=>x.id===k.id);if(k.resolucao==='importado'&&indice>=0){estado.lixeira.push({id:novoId(),tipo:c,colecao:c,item:estado[c][indice],excluidoEm:new Date().toISOString(),motivo:'substituido-por-importacao'});estado[c][indice]=k.importado;resultado.substituidos++;}
   else if(k.resolucao==='ambos'){const copia={...structuredClone(k.importado),id:novoId()};if(c==='empresas')copia.nome=copia.nome+' (importada)';estado[c].push(copia);resultado.adicionados++;}}}
 registrarAuditoria(estado,'importacao','backup',`Importação: ${resultado.adicionados} novos, ${resultado.substituidos} substituídos.`);
 return resultado;
}
export function empresasParaCSV(empresas,nomeEtapa){
 const esc=v=>{let t=String(v??'');if(/^[=+\-@\t\r]/.test(t))t="'"+t;return '"'+t.replace(/"/g,'""')+'"';};
 const cab=['Empresa','Cidade','Nicho','Contato','WhatsApp','Telefone','E-mail','Instagram','Site','Etapa','Situação','Interesse','Valor estimado','Valor negociado','Primeiro contato','Último contato','Retorno','Anotações'];
 return '﻿'+[cab,...empresas.map(e=>[e.nome,e.cidade,e.nicho,e.contato,e.whatsapp,e.telefone,e.email,e.instagram,e.site,nomeEtapa(e.etapa),e.situacao,e.interesse,e.valor,e.valorNegociado??'',e.primeiroContato,e.ultimoContato,e.retornoEm,e.notas])].map(l=>l.map(esc).join(';')).join('\r\n');
}
