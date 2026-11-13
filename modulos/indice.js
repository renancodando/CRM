import {criarEmpresa,abrirFormularioNova} from './empresa.js';
import {criarTrabalho} from './trabalho.js';
import {criarMensagens} from './mensagens.js';
import {criarPropostas} from './propostas.js';
import {criarLaboratorio} from './laboratorio.js';
import {criarFinanceiro} from './financeiro.js';
import {criarDados} from './dados.js';
export function criarModulos(ctx,arranque){
 const m={};Object.assign(ctx,{modulos:m});
 m.empresa=criarEmpresa(ctx);ctx.empresa=m.empresa;
 m.trabalho=criarTrabalho(ctx);m.mensagens=criarMensagens(ctx);m.propostas=criarPropostas(ctx);m.laboratorio=criarLaboratorio(ctx);m.financeiro=criarFinanceiro(ctx);m.dados=criarDados(ctx,arranque);
 const rotas={empresa:m.empresa.acoes,trabalho:m.trabalho.acoes,mensagens:m.mensagens.acoes,propostas:m.propostas.acoes,laboratorio:m.laboratorio.acoes,financeiro:m.financeiro.acoes,dados:m.dados.acoes,estudio:{criar:id=>ctx.estudio.abrirGaleria(id),demo:id=>ctx.estudio.abrirDemonstracao(id)}};
 return {m,nova:()=>abrirFormularioNova(ctx),despachar(chave,id,alvo){const [mod,acao]=chave.split('.');const f=rotas[mod]?.[acao];if(!f)return false;Promise.resolve(f(id,alvo)).catch(e=>ctx.avisar(e.message||'Não foi possível concluir a ação.'));return true;}};
}
