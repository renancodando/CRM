import {estadoInicial,normalizarEstado,colecoes,validarIntegridade} from './esquema.js';
import {migrarDeLegado,compararContagens} from './migracao.js';
import {montarBackup,resumoSha} from './backup.js';
const NOME='orbita-dados',CHAVE_V2='orbita-prospeccao-v2',CHAVE_V1='orbita-prospeccao-v1',CHAVE_RESERVA='orbita-prospeccao-v3-reserva';
let banco=null,modo='memoria',fila=null,pendente=false,ultimoErro=null,aoErro=()=>{};
const promessa=req=>new Promise((ok,erro)=>{req.onsuccess=()=>ok(req.result);req.onerror=()=>erro(req.error);});
function abrir(){return new Promise((ok,erro)=>{if(!globalThis.indexedDB)return erro(Error('IndexedDB indisponível'));const r=indexedDB.open(NOME,1);r.onupgradeneeded=()=>{const d=r.result;for(const s of ['colecoes','meta','legado'])d.createObjectStore(s);d.createObjectStore('backups',{keyPath:'id'});};r.onsuccess=()=>ok(r.result);r.onerror=()=>erro(r.error);r.onblocked=()=>erro(Error('Banco bloqueado por outra aba.'));});}
const tx=(lojas,tipo='readonly')=>banco.transaction(lojas,tipo);
async function lerTudo(){
 const t=tx(['colecoes']),loja=t.objectStore('colecoes'),bruto={};
 const chaves=await promessa(loja.getAllKeys()),valores=await promessa(loja.getAll());chaves.forEach((c,i)=>bruto[c]=valores[i]);return bruto;
}
function separar(estado){const {...resto}=estado;const itens={};for(const c of colecoes){itens[c]=resto[c];delete resto[c];}itens.raiz=resto;return itens;}
function juntar(bruto){const raiz=bruto.raiz||{},est={...raiz};for(const c of colecoes)est[c]=bruto[c]||[];return normalizarEstado(est);}
async function gravarTudo(estado){
 const itens=separar(estado),t=tx(['colecoes'],'readwrite'),loja=t.objectStore('colecoes');
 for(const [k,v] of Object.entries(itens))loja.put(JSON.parse(JSON.stringify(v)),k);
 await new Promise((ok,erro)=>{t.oncomplete=ok;t.onerror=()=>erro(t.error);t.onabort=()=>erro(t.error||Error('Gravação abortada'));});
}
export async function carregarEstado(){
 const avisos=[];let estado,migracao=null;
 try{banco=await Promise.race([abrir(),new Promise((_,erro)=>setTimeout(()=>erro(Error('tempo esgotado ao abrir o banco')),6000))]);modo='idb';}catch(erro){modo='reserva';avisos.push('O armazenamento estruturado (IndexedDB) não está disponível neste navegador ou modo. Os dados serão guardados em um espaço reduzido. Exporte backups com frequência.');}
 if(modo==='idb'){
  try{
   const meta=await promessa(tx(['meta']).objectStore('meta').get('migracao'));
   if(meta?.status==='concluida'){const bruto=await lerTudo();estado=juntar(bruto);migracao=meta;}
   else{
    let brutoV2=null,brutoV1=null;try{brutoV2=localStorage.getItem(CHAVE_V2);brutoV1=localStorage.getItem(CHAVE_V1);}catch{}
    const resultado=migrarDeLegado(brutoV2,brutoV1);estado=resultado.estado;
    const t=tx(['legado','backups'],'readwrite'),agora=new Date().toISOString();
    if(brutoV2!=null)t.objectStore('legado').put({chave:CHAVE_V2,texto:brutoV2,guardadoEm:agora},CHAVE_V2);
    if(brutoV1!=null)t.objectStore('legado').put({chave:CHAVE_V1,texto:brutoV1,guardadoEm:agora},CHAVE_V1);
    t.objectStore('backups').put({id:'pre-migracao-'+agora,criadoEm:agora,motivo:'antes-da-migracao',texto:JSON.stringify({v2:brutoV2,v1:brutoV1}),tipo:'legado'});
    await new Promise((ok,erro)=>{t.oncomplete=ok;t.onerror=()=>erro(t.error);});
    await gravarTudo(estado);
    const lido=juntar(await lerTudo());
    if(!compararContagens(estado,lido))throw Error('A verificação da migração falhou: as contagens divergem.');
    migracao={status:'concluida',versao:3,concluidaEm:new Date().toISOString(),origens:resultado.relatorio.origens,contagem:resultado.relatorio.contagem,hashOrigem:await resumoSha((brutoV2||'')+(brutoV1||''))};
    await promessa(tx(['meta'],'readwrite').objectStore('meta').put(migracao,'migracao'));
    avisos.push(...resultado.relatorio.avisos);
    if(resultado.relatorio.origens.length)avisos.unshift('Seus dados anteriores foram migrados com segurança. Os registros originais continuam guardados como cópia de recuperação.');
   }
  }catch(erro){
   console.error(erro);modo='reserva';ultimoErro=erro;avisos.push('Não foi possível usar o armazenamento estruturado ('+erro.message+'). Seus dados antigos não foram alterados.');
  }
 }
 if(modo==='reserva'){
  try{const bruto=localStorage.getItem(CHAVE_RESERVA)||localStorage.getItem(CHAVE_V2);estado=bruto?migrarDeLegado(bruto,null).estado:estadoInicial();}catch{estado=estadoInicial();}
 }
 estado??=estadoInicial();
 try{await navigator.storage?.persist?.();}catch{}
 return {estado,avisos,modo,migracao};
}
export function aoFalhar(fn){aoErro=fn;}
export function salvarEstado(estado){
 if(modo==='memoria')return Promise.resolve();
 pendente=true;if(fila)return fila;
 fila=(async()=>{await new Promise(r=>setTimeout(r,120));
  while(pendente){pendente=false;try{if(modo==='idb')await gravarTudo(estado);else localStorage.setItem(CHAVE_RESERVA,JSON.stringify(estado));ultimoErro=null;}catch(erro){ultimoErro=erro;aoErro(erro);}}
  fila=null;})();
 return fila;
}
export const modoArmazenamento=()=>modo;
export const ultimoErroArmazenamento=()=>ultimoErro;
export async function criarBackupInterno(estado,motivo='automatico'){
 if(modo!=='idb')return null;const agora=new Date().toISOString(),texto=await montarBackup(estado,motivo);
 const t=tx(['backups'],'readwrite'),loja=t.objectStore('backups');loja.put({id:'bk-'+agora,criadoEm:agora,motivo,tipo:'estado',texto});
 await new Promise((ok,erro)=>{t.oncomplete=ok;t.onerror=()=>erro(t.error);});await podarBackups(20);return agora;
}
async function podarBackups(max){const todos=await listarBackups(),estados=todos.filter(b=>b.tipo==='estado');for(const b of estados.slice(max)){tx(['backups'],'readwrite').objectStore('backups').delete(b.id);}}
export async function listarBackups(){if(modo!=='idb')return [];const todos=await promessa(tx(['backups']).objectStore('backups').getAll());return todos.map(b=>({id:b.id,criadoEm:b.criadoEm,motivo:b.motivo,tipo:b.tipo,tamanho:b.texto.length})).sort((a,b)=>b.criadoEm.localeCompare(a.criadoEm));}
export async function lerBackupInterno(id){if(modo!=='idb')return null;return (await promessa(tx(['backups']).objectStore('backups').get(id)))?.texto||null;}
export async function lerLegado(){if(modo!=='idb')return [];return promessa(tx(['legado']).objectStore('legado').getAll());}
export async function garantirBackupDiario(estado){const ultimo=(await listarBackups()).find(b=>b.tipo==='estado');if(!ultimo||Date.now()-new Date(ultimo.criadoEm)>864e5)return criarBackupInterno(estado,'diario');return null;}
export async function infoArmazenamento(){let persistente=null,uso=null,cota=null;try{persistente=await navigator.storage?.persisted?.();const e=await navigator.storage?.estimate?.();uso=e?.usage;cota=e?.quota;}catch{}return {modo,persistente,uso,cota};}
