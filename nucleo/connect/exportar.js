/* Exportação autorizada para consulta externa. Só o que está marcado em "Dados compartilhados"; valores monetários em centavos; sempre com data, versão e escopo. */
import {VERSAO_PROTOCOLO} from './protocolo.js';
import {versaoDados} from './motor.js';
import {construirModelo,periodoPadrao} from '../quant/modelo.js';
import {metricas,calcular,formatarValor} from '../quant/metricas.js';
import {aCentavos} from '../quant/financas.js';
import {gerarRelatorio} from '../quant/relatorio.js';
const PAGINA=200;
const pick=(o,ks)=>Object.fromEntries(ks.filter(k=>o[k]!==undefined).map(k=>[k,o[k]]));
const hash=t=>{let h=2166136261;for(let i=0;i<t.length;i++){h^=t.charCodeAt(i);h=Math.imul(h,16777619);}return (h>>>0).toString(16);};
export function exportarAutorizado(estado,agora=new Date()){
 const cfg=estado.config.connect,c=cfg.compartilhado,vd=versaoDados(estado),geradoEm=agora.toISOString(),arquivos={},indice=[];
 const escopo=Object.entries(c).filter(([,v])=>v).map(([k])=>k);
 const pagina=(nome,regs,extra={})=>{const n=Math.max(1,Math.ceil(regs.length/PAGINA));for(let i=0;i<n;i++){const caminho=`saida/exportacoes/${nome}-${String(i+1).padStart(4,'0')}.json`,corpo={protocolo:VERSAO_PROTOCOLO,entidade:nome,geradoEm,versaoDados:vd,escopo,total:regs.length,pagina:i+1,paginas:n,aviso:'Dados do navegador do usuário no momento de geradoEm. Se geradoEm for antigo, os dados podem estar desatualizados.',...extra,registros:regs.slice(i*PAGINA,(i+1)*PAGINA)};arquivos[caminho]=JSON.stringify(corpo,null,1);indice.push({arquivo:caminho,entidade:nome,total:regs.length});}};
 if(c.empresas){const base=['id','nome','nicho','cidade','whatsapp','telefone','email','contato','instagram','site','statusSite','etapa','etapaEm','situacao','interesse','potencial','diferenciais','servicosOferecidos','proximaAcao','retornoEm','primeiroContato','ultimoContato','fonte','verificadoEm','criada','rev','modelo','solicitouDemo'];
  pagina('empresas',estado.empresas.map(e=>({...pick(e,base),...(c.notas?{notas:e.notas}:{}),...(c.financeiro?{valorEstimadoCentavos:aCentavos(e.valor),valorNegociadoCentavos:e.valorNegociado==null?null:aCentavos(e.valorNegociado)}:{})})));
  pagina('demonstracoes',estado.demonstracoes.map(d=>({id:d.id,empresaId:d.empresaId,modeloId:d.modeloId,nome:d.nome||'',status:d.status||'rascunho',urlPublica:d.urlPublica||'',publicacaoVerificada:!!d.publicacaoVerificada,versoes:(d.versoes||[]).map(v=>({id:v.id,numero:v.numero,criadaEm:v.criadaEm})),apresentacoes:(d.apresentacoes||[]).map(a=>({quando:a.quando,versao:a.versao}))})));}
 if(c.historico)pagina('historico',estado.eventos.filter(e=>!e.revertido).map(e=>({...pick(e,['id','empresaId','tipo','quando','registradoEm','origem','operacaoId','estrategia','variante','interesse','de','para','motivo','situacao','demonstracaoId']),...(e.texto?{texto:String(e.texto).slice(0,600)}:{})})));
 if(c.tarefas){pagina('tarefas',estado.tarefas.map(t=>pick(t,['id','titulo','descricao','empresaId','prazo','prazoSomenteData','prioridade','categoria','duracaoH','dependeDe','estado','criadaEm','concluidaEm'])));pagina('lembretes',estado.lembretes.map(l=>pick(l,['id','titulo','quando','empresa','concluido','tarefaId'])));pagina('sessoes',estado.sessoes.map(s=>pick(s,['id','empresaId','atividade','inicio','fim','duracaoMin','manual'])));}
 if(c.financeiro){pagina('propostas',estado.propostas.map(p=>({id:p.id,empresaId:p.empresaId,demonstracaoId:p.demonstracaoId,estado:p.estado,versao:p.versao,valorOriginalCentavos:aCentavos(p.valorOriginal),valorFinalCentavos:aCentavos(p.valorFinal),validade:p.validade,criadaEm:p.criadaEm})));
  pagina('pagamentos',estado.pagamentos.map(p=>({id:p.id,empresaId:p.empresaId,propostaId:p.propostaId,valorCentavos:aCentavos(p.valor),estado:p.estado,recebidoEm:p.quando,forma:p.forma||'',origem:p.origem||'usuario',conciliado:estado.extratos.some(x=>x.conciliacoes.some(k=>k.pagamentoId===p.id))})));
  pagina('custos',estado.custos.map(k=>({id:k.id,descricao:k.descricao,categoria:k.categoria||'',valorCentavos:aCentavos(k.valor),quando:k.quando,empresaId:k.empresaId||''})));}
 if(c.indicadores){const m=construirModelo(estado,agora.getTime()),per=['mes','ano','todo'].map(t=>periodoPadrao(t,agora)),out={};for(const p of per){out[p.tipo]={periodo:p.rotulo,parcial:!!p.parcial,indicadores:Object.fromEntries(metricas.map(d=>{const r=calcular(m,d.id,{},p);return [d.id,{nome:d.nome,valor:r.valor,estado:r.estado,unidade:d.unidade,formatado:formatarValor(r),numerador:r.numerador,denominador:r.denominador,limitacoes:r.limitacoes}];}))};}
  arquivos['saida/exportacoes/indicadores-0001.json']=JSON.stringify({protocolo:VERSAO_PROTOCOLO,entidade:'indicadores',geradoEm,versaoDados:vd,escopo,periodos:out,observacao:'Valores monetários dos indicadores estão em centavos quando a unidade é R$.'},null,1);indice.push({arquivo:'saida/exportacoes/indicadores-0001.json',entidade:'indicadores',total:metricas.length});}
 if(c.relatorios){const r=gerarRelatorio(estado,periodoPadrao('mes',agora),{agora});arquivos['saida/exportacoes/relatorio-mes-0001.json']=JSON.stringify({protocolo:VERSAO_PROTOCOLO,entidade:'relatorio',geradoEm,versaoDados:vd,escopo,relatorio:r},null,1);indice.push({arquivo:'saida/exportacoes/relatorio-mes-0001.json',entidade:'relatorio',total:1});}
 const manifesto={protocolo:VERSAO_PROTOCOLO,geradoEm,versaoDados:vd,escopo,arquivos:indice.map(i=>({...i,hash:hash(arquivos[i.arquivo])})),privacidade:'Nada fora do escopo autorizado é exportado. Documentos pessoais, senhas, credenciais e anexos privados nunca são exportados.'};
 arquivos['saida/manifesto.json']=JSON.stringify(manifesto,null,1);
 return {arquivos,manifesto,versaoDados:vd,geradoEm};
}
export const hashArquivo=hash;
