import {normalizarEstado,normalizarEmpresa,etapas,novoId,validarIntegridade,colecoes,VERSAO_ESTADO} from './esquema.js';
const lerJson=bruto=>{if(bruto==null)return {ausente:true};try{return {valor:JSON.parse(bruto)};}catch(erro){return {erro:'JSON inválido: '+erro.message};}};
export function migrarDeLegado(brutoV2,brutoV1){
 const relatorio={origens:[],avisos:[],descartados:0,contagem:{}},estadoBase={};
 const v2=lerJson(brutoV2),v1=lerJson(brutoV1);let origem={};
 if(v2.valor&&typeof v2.valor==='object'){origem=v2.valor;relatorio.origens.push('orbita-prospeccao-v2');}
 else if(v2.erro){relatorio.avisos.push('O registro v2 estava ilegível ('+v2.erro+'). O texto original foi preservado no backup.');}
 const v1Dados=v1.valor&&typeof v1.valor==='object'?v1.valor:null;
 if(v1Dados&&Array.isArray(v1Dados.empresas)){
  const idsV2=new Set((Array.isArray(origem.empresas)?origem.empresas:[]).map(e=>e?.id));
  const extras=v1Dados.empresas.filter(e=>e&&typeof e==='object'&&!idsV2.has(e.id)).map(e=>({...e,origem:'legado-v1'}));
  if(extras.length){origem={...origem,empresas:[...(Array.isArray(origem.empresas)?origem.empresas:[]),...extras]};relatorio.origens.push('orbita-prospeccao-v1');relatorio.avisos.push(extras.length+' registro(s) da versão 1 foram preservados e marcados como "legado v1".');}
  for(const c of ['lembretes','rascunhos']){if(Array.isArray(v1Dados[c])){const ids=new Set((origem[c]||[]).map(i=>i?.id));const novos=v1Dados[c].filter(i=>i&&!ids.has(i.id));if(novos.length)origem={...origem,[c]:[...(origem[c]||[]),...novos]};}}
  if(!v2.valor&&v1Dados.preferencias)origem={...origem,preferencias:v1Dados.preferencias};
 }
 const antes=Array.isArray(origem.empresas)?origem.empresas.length:0;
 const estado=normalizarEstado(origem);
 estado.empresas=estado.empresas.map(e=>e.origem==='legado-v1'?{...e,origem:'legado-v1'}:e);
 relatorio.descartados=antes-estado.empresas.length;
 for(const c of colecoes)relatorio.contagem[c]=estado[c].length;
 const problemas=validarIntegridade(estado);if(problemas.length)relatorio.avisos.push(...problemas.slice(0,20));
 return {estado,relatorio};
}
export function compararContagens(a,b){return colecoes.every(c=>(a[c]||[]).length===(b[c]||[]).length)&&JSON.stringify(a.preferencias)===JSON.stringify(b.preferencias);}
export {VERSAO_ESTADO};
