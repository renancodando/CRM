import {criarEmpresa,abrirFormularioNova} from './empresa.js';
import {criarTrabalho} from './trabalho.js';
import {criarPropostas} from './propostas.js';
import {criarLaboratorio} from './laboratorio.js';
import {criarFinanceiro} from './financeiro.js';
import {criarDados} from './dados.js';
import {criarQuantPainel} from './quant-painel.js';
import {criarConnect} from './connect.js';
import {criarConversao} from './conversao.js';
import {criarPublicacoes} from './publicacoes.js';
import {criarOfertas} from './ofertas.js';
import {criarDiagnostico} from './diagnostico.js';
export function criarModulos(ctx,arranque){
 const m={};Object.assign(ctx,{modulos:m});
 m.empresa=criarEmpresa(ctx);ctx.empresa=m.empresa;
 m.trabalho=criarTrabalho(ctx);m.propostas=criarPropostas(ctx);m.laboratorio=criarLaboratorio(ctx);m.financeiro=criarFinanceiro(ctx);m.dados=criarDados(ctx,arranque);m.quant=criarQuantPainel(ctx);m.connect=criarConnect(ctx);m.conversao=criarConversao(ctx);m.publicacoes=criarPublicacoes(ctx);m.ofertas=criarOfertas(ctx);m.diagnostico=criarDiagnostico(ctx);
 /* rotas antigas redirecionadas para o módulo unificado */
 const para=(id,alvo)=>m.conversao.abrirConversa(id,{tipo:alvo?.dataset?.extra||''});
 const rotas={mensagens:{abrir:para},negociacao:{abrir:para},empresa:m.empresa.acoes,trabalho:m.trabalho.acoes,propostas:m.propostas.acoes,laboratorio:m.laboratorio.acoes,financeiro:m.financeiro.acoes,dados:m.dados.acoes,quant:m.quant.acoes,connect:m.connect.acoes,conversao:m.conversao.acoes,publicacoes:m.publicacoes.acoes,ofertas:m.ofertas.acoes,diagnostico:m.diagnostico.acoes,estudio:{criar:id=>ctx.estudio.abrirGaleria(id),demo:id=>ctx.estudio.abrirDemonstracao(id)}};
 return {m,nova:()=>abrirFormularioNova(ctx),despachar(chave,id,alvo){const [mod,acao]=chave.split('.');const f=rotas[mod]?.[acao];if(!f)return false;Promise.resolve(f(id,alvo)).catch(e=>ctx.avisar(e.message||'Não foi possível concluir a ação.'));return true;}};
}
