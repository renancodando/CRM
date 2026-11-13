/* Condições comerciais versionadas, em centavos inteiros. Campo desconhecido = null (nunca zero). Reaproveita config.comercial (em reais) só como migração/compatibilidade. */
import {novoId,registrarAuditoria} from '../esquema.js';
import {aCentavos,deCentavos} from '../quant/financas.js';
export const DESCONHECIVEIS={
 taxaCartaoPct:'taxa do cartão (%)',taxaCartaoFixaCent:'tarifa fixa do cartão',taxaPixPct:'taxa do Pix (%)',taxaPixFixaCent:'tarifa fixa do Pix',impostoPct:'impostos (%)',
 horasDesenvolvimento:'horas de desenvolvimento',horasSuporte:'horas de suporte esperadas',valorMinimoHoraCent:'valor mínimo por hora',margemDesejadaPct:'margem desejada (%)',precoMinimoCent:'preço mínimo aceitável',limiteDescontoPct:'limite de desconto (%)',
 custoDominioCent:'custo de domínio',custoHospedagemCent:'custo de hospedagem',custoManutencaoCent:'custo de manutenção',custoOutrosCent:'outros custos',recebimentoCartao:'regra de recebimento do cartão'
};
export function condicaoPadrao(comercial={}){
 return {
  precoNormalCent:aCentavos(comercial.precoNormal??0),precoPromocionalCent:aCentavos(comercial.precoPromocional??0),precoPixCent:aCentavos(comercial.precoPix??0),
  parcelasMax:Number(comercial.parcelasMax)||1,jurosParcelasTotalPct:Number(comercial.jurosParcelas)||0,promocaoAte:comercial.promocaoAte||null,
  suporteDias:Number(comercial.suporteDias)||0,prazoEntregaDias:Number(comercial.prazoEntregaDias)||0,validadeDias:Number(comercial.validadeDias)||7,
  suporteTexto:comercial.suporte||'',pagamentoTexto:comercial.pagamento||'',
  ...Object.fromEntries(Object.keys(DESCONHECIVEIS).map(k=>[k,null]))
 };
}
const hash=o=>{let h=2166136261;for(const c of JSON.stringify(o,Object.keys(o).sort())){h^=c.charCodeAt(0);h=Math.imul(h,16777619)>>>0;}return h.toString(16);};
export function validarCondicao(d){
 const erros=[],avisos=[];const cent=k=>d[k]!=null&&(!Number.isInteger(d[k])||d[k]<0)&&erros.push(`${DESCONHECIVEIS[k]||k}: use centavos inteiros não negativos.`);
 for(const k of ['precoNormalCent','precoPromocionalCent','precoPixCent'])if(!Number.isInteger(d[k])||d[k]<0)erros.push('Preço inválido: '+k+'.');
 for(const k of ['taxaCartaoFixaCent','taxaPixFixaCent','valorMinimoHoraCent','precoMinimoCent','custoDominioCent','custoHospedagemCent','custoManutencaoCent','custoOutrosCent'])cent(k);
 for(const k of ['taxaCartaoPct','taxaPixPct','impostoPct','margemDesejadaPct','limiteDescontoPct'])if(d[k]!=null&&!(d[k]>=0&&d[k]<100))erros.push(`${DESCONHECIVEIS[k]}: informe de 0 a 99,99.`);
 for(const k of ['horasDesenvolvimento','horasSuporte'])if(d[k]!=null&&!(d[k]>=0&&d[k]<=2000))erros.push(`${DESCONHECIVEIS[k]}: valor inválido.`);
 if(d.precoPromocionalCent>d.precoNormalCent)erros.push('O preço promocional não pode superar o preço normal.');
 if(d.precoPixCent>d.precoPromocionalCent&&d.precoPromocionalCent>0)avisos.push('O preço no Pix está acima do promocional: confira.');
 if(d.precoMinimoCent!=null&&d.precoPixCent>0&&d.precoMinimoCent>d.precoPixCent)avisos.push('O preço mínimo está acima do preço no Pix: o Pix nunca poderá ser oferecido sem ficar abaixo do mínimo.');
 if(!(d.parcelasMax>=1&&d.parcelasMax<=24))erros.push('Parcelas entre 1 e 24.');
 return {erros,avisos};
}
export const versoesCondicoes=estado=>[...(estado.condicoes||[])].sort((a,b)=>a.numero-b.numero);
export function condicaoVigente(estado,agora=Date.now()){const v=versoesCondicoes(estado).filter(c=>new Date(c.vigenteDesde).getTime()<=agora);return v.at(-1)||null;}
export function garantirCondicaoInicial(estado){
 if(estado.condicoes?.length)return condicaoVigente(estado);
 const dados=condicaoPadrao(estado.config?.comercial),c={id:novoId(),numero:1,criadaEm:new Date().toISOString(),vigenteDesde:new Date(0).toISOString(),motivo:'Migrada de Configurações comerciais',dados,hash:hash(dados),origem:'migracao'};
 estado.condicoes=[c];return c;
}
export function salvarCondicao(estado,dados,{motivo='',vigenteDesde=null}={}){
 const atual=garantirCondicaoInicial(estado),v=validarCondicao(dados);if(v.erros.length)throw Error(v.erros.join(' '));
 const h=hash(dados);if(atual.hash===h)return {condicao:atual,nova:false,avisos:v.avisos};
 const c={id:novoId(),numero:Math.max(...estado.condicoes.map(x=>x.numero))+1,criadaEm:new Date().toISOString(),vigenteDesde:vigenteDesde||new Date().toISOString(),motivo,dados:structuredClone(dados),hash:h,origem:'usuario'};
 estado.condicoes.push(c);
 const cm=estado.config.comercial;cm.precoNormal=deCentavos(dados.precoNormalCent);cm.precoPromocional=deCentavos(dados.precoPromocionalCent);cm.precoPix=deCentavos(dados.precoPixCent);cm.parcelasMax=dados.parcelasMax;cm.jurosParcelas=dados.jurosParcelasTotalPct;cm.suporteDias=dados.suporteDias;cm.prazoEntregaDias=dados.prazoEntregaDias;cm.validadeDias=dados.validadeDias;if(dados.suporteTexto)cm.suporte=dados.suporteTexto;if(dados.pagamentoTexto)cm.pagamento=dados.pagamentoTexto;
 registrarAuditoria(estado,'condicao',c.id,'Condições comerciais v'+c.numero+(motivo?': '+motivo:''));return {condicao:c,nova:true,avisos:v.avisos};
}
export const promocaoVigente=(d,agora=Date.now())=>!d.promocaoAte||new Date(d.promocaoAte+'T23:59:59').getTime()>=agora;
export function precoAtual(d,agora=Date.now()){return promocaoVigente(d,agora)?d.precoPromocionalCent:d.precoNormalCent;}
export function registrarOferta(estado,empresa,{tipo,valorCent,forma='',parcelas=1,condicaoId='',propostaId='',nota='',confirmadoPeloUsuario=false,origem='usuario'}){
 if(!['apresentada','contraproposta','negociada'].includes(tipo))throw Error('Tipo de oferta inválido.');if(!confirmadoPeloUsuario)throw Error('Confirme que esta oferta realmente foi apresentada/recebida.');if(!Number.isInteger(valorCent)||valorCent<=0)throw Error('Valor inválido.');
 const o={id:novoId(),empresaId:empresa.id,tipo,valorCent,forma,parcelas,condicaoId,propostaId,nota,quando:new Date().toISOString(),origem,confirmadoPeloUsuario:true};estado.ofertas.push(o);
 empresa.historico.push({quando:o.quando,texto:`Oferta ${tipo}: ${(valorCent/100).toLocaleString('pt-BR',{style:'currency',currency:'BRL'})}${forma?' · '+forma:''}.`});return o;
}
