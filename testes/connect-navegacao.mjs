/* Regressão: sincronização e respostas assíncronas não tomam a tela. */
import assert from 'node:assert/strict';
import {estadoInicial} from '../nucleo/esquema.js';
import {criarConnect} from '../modulos/connect.js';
let contexto='EMPRESAS',aberto=true,fechando=false,aberturas=0,gravacoes=0,avisos=[],pedidos=0,liberar;
const painel={get open(){return aberto;},classList:{contains:c=>c==='fechando'&&fechando}};
globalThis.document={hidden:false,querySelector:s=>s==='#painel'?painel:s==='#contexto-painel'?{textContent:contexto}:null,querySelectorAll:()=>[]};
globalThis.fetch=async()=>{pedidos++;return new Promise(r=>{liberar=()=>r({ok:true,status:200,json:async()=>({autenticado:false})});});};
const estado=estadoInicial();estado.config.connect.modo='automatico';
const c=criarConnect({obterEstado:()=>estado,salvar:()=>{gravacoes++;},avisar:t=>avisos.push(t),icone:()=>'',abrirPainel:(_t,_h,ctx)=>{aberturas++;contexto=ctx;aberto=true;fechando=false;}});
const sync=()=>c.acoes.sincronizar();
const espera=()=>new Promise(r=>setTimeout(r,0));
let p=sync();assert.equal(aberturas,0,'sincronização não troca Empresas por Connect');await espera();liberar();await p;assert.equal(contexto,'EMPRESAS');assert.equal(aberturas,0);assert.ok(gravacoes>0);assert.equal(pedidos,1);
c.abrir('visao');assert.equal(contexto,'ÓRBITA CONNECT');let antes=aberturas;
p=sync();assert.equal(aberturas,antes+1,'atualiza Connect quando realmente aberto');contexto='CONVERSÃO';await espera();liberar();await p;assert.equal(contexto,'CONVERSÃO');assert.equal(aberturas,antes+1,'fim da sincronização não toma Conversão');
c.abrir('visao');antes=aberturas;p=sync();fechando=true;await espera();liberar();await p;assert.equal(aberturas,antes+1,'não cancela o fechamento em andamento');
aberto=false;fechando=false;p=sync();await espera();liberar();await p;assert.equal(aberturas,antes+1,'não reabre painel fechado');
c.abrir('config');antes=aberturas;p=c.acoes.verificar();contexto='EMPRESAS';await espera();liberar();await p;assert.equal(aberturas,antes,'verificação tardia não toma outra tela');
console.log('OK: sincronização continua; Empresas, Conversão e painel fechado são preservados.');
