/* Simulador de ofertas. Tudo em centavos inteiros. Componente desconhecido NUNCA vira zero: o resultado é marcado como limite superior e lista o que falta. */
import {dividirParcelas,amortizacaoPrice,margem,retornoPorHora,descontoPercentual} from '../quant/financas.js';
import {DESCONHECIVEIS} from './condicoes.js';
const soma=a=>a.reduce((s,x)=>s+x,0);
const pct=(v,p)=>Math.round(v*p/100);
export function simularOferta(cond,cen){
 const {forma='cartao',valorCent,parcelas=1,entradaCent=0,escopoReduzidoPct=0,manutencaoMensalCent=0,mesesManutencao=0}=cen;
 if(!Number.isInteger(valorCent)||valorCent<=0)throw Error('Informe o valor da oferta em centavos inteiros.');
 const falta=new Set(),usa=k=>{if(cond[k]==null){falta.add(k);return null;}return cond[k];};
 const alertas=[],fluxo=[];
 // taxas por forma de recebimento
 const taxa=(base,tipo)=>{const p=usa(tipo==='pix'?'taxaPixPct':'taxaCartaoPct'),f=usa(tipo==='pix'?'taxaPixFixaCent':'taxaCartaoFixaCent');if(p==null||f==null)return {cent:null,conhecido:false};return {cent:pct(base,p)+f,conhecido:true};};
 let taxas,parcelasInfo=null;
 if(forma==='pix'){taxas=taxa(valorCent,'pix');fluxo.push({dias:0,cent:valorCent,descricao:'Pix à vista'});}
 else if(forma==='cartao'){
  taxas=taxa(valorCent,'cartao');if(parcelas>cond.parcelasMax)alertas.push(`Acima do máximo de ${cond.parcelasMax} parcelas configurado.`);
  const juros=cond.jurosParcelasTotalPct||0,totalCliente=parcelas>1?Math.round(valorCent*(1+juros/100)):valorCent;
  parcelasInfo={parcelas,totalClienteCent:totalCliente,valorParcelaCent:dividirParcelas(totalCliente,parcelas)[0],jurosTotalPct:juros};
  const regra=usa('recebimentoCartao');
  if(regra==='parcelado'){const ps=dividirParcelas(valorCent,parcelas);ps.forEach((p,i)=>fluxo.push({dias:30*(i+1),cent:p,descricao:`Parcela ${i+1}/${parcelas} (antes das taxas)`}));}
  else if(regra==='a-vista-30d')fluxo.push({dias:30,cent:valorCent,descricao:'Recebimento integral em ~30 dias (antes das taxas)'});
  else alertas.push('Defina a regra de recebimento do cartão para ver o fluxo de caixa. O fluxo não foi calculado.');
 }else if(forma==='entrada-saldo'){
  if(!(entradaCent>0&&entradaCent<valorCent))throw Error('A entrada deve ser maior que zero e menor que o valor total.');
  const t1=taxa(entradaCent,'pix'),t2=taxa(valorCent-entradaCent,'cartao');taxas={cent:t1.conhecido&&t2.conhecido?t1.cent+t2.cent:null,conhecido:t1.conhecido&&t2.conhecido};
  fluxo.push({dias:0,cent:entradaCent,descricao:'Entrada (Pix)'});const resto=valorCent-entradaCent;fluxo.push({dias:30,cent:resto,descricao:'Saldo (cartão, antes das taxas)'});
 }else throw Error('Forma de pagamento desconhecida.');
 const imposto=(()=>{const p=usa('impostoPct');return p==null?null:pct(valorCent,p);})();
 const liquidoParcial=valorCent-(taxas.cent??0)-(imposto??0),liquidoExato=taxas.conhecido&&imposto!=null;
 const cd=['custoDominioCent','custoHospedagemCent','custoManutencaoCent','custoOutrosCent'].map(usa),custosConhecidos=cd.every(x=>x!=null),custos=soma(cd.map(x=>x??0));
 const horasDev=usa('horasDesenvolvimento'),horasSup=usa('horasSuporte'),horas=horasDev!=null&&horasSup!=null?horasDev*(1-escopoReduzidoPct/100)+horasSup:null;
 const resultado=liquidoParcial-custos,exatoRes=liquidoExato&&custosConhecidos;
 const precoMin=usa('precoMinimoCent'),horaMin=usa('valorMinimoHoraCent'),margemAlvo=usa('margemDesejadaPct'),limDesc=usa('limiteDescontoPct');
 const m=margem(valorCent,valorCent-resultado),rph=horas>0?retornoPorHora(resultado,horas):null;
 const cmp={
  vsPrecoMinimo:precoMin==null?{disponivel:false,motivo:'Defina o preço mínimo aceitável.'}:{disponivel:true,minimoCent:precoMin,diferencaCent:valorCent-precoMin,abaixo:valorCent<precoMin},
  vsHoraMinima:horaMin==null||rph==null?{disponivel:false,motivo:horaMin==null?'Defina o valor mínimo por hora.':'Faltam as horas estimadas.'}:{disponivel:true,minimoCent:horaMin,retornoCent:Math.round(rph),abaixo:rph<horaMin,limiteSuperior:!exatoRes},
  vsMargemDesejada:margemAlvo==null||m==null?{disponivel:false,motivo:margemAlvo==null?'Defina a margem desejada.':'Margem não calculável.'}:{disponivel:true,alvoPct:margemAlvo,margemPct:m*100,abaixo:m*100<margemAlvo,limiteSuperior:!exatoRes}
 };
 // impacto do desconto sobre os preços de referência
 const imp=ref=>ref>0?{referenciaCent:ref,diferencaCent:ref-valorCent,pct:descontoPercentual(ref,valorCent)*100}:null;
 const impacto={sobreNormal:imp(cond.precoNormalCent),sobrePromocional:imp(cond.precoPromocionalCent),acimaDoLimite:limDesc!=null&&cond.precoNormalCent>0?descontoPercentual(cond.precoNormalCent,valorCent)*100>limDesc:null};
 if(cmp.vsPrecoMinimo.abaixo)alertas.push('Abaixo do preço mínimo aceitável.');if(impacto.acimaDoLimite)alertas.push('Desconto acima do limite configurado.');
 if(falta.size)alertas.push('Valores desconhecidos não foram assumidos como zero: '+[...falta].map(k=>DESCONHECIVEIS[k]).join(', ')+'. Os resultados abaixo são limites superiores.');
 const recorrente=manutencaoMensalCent>0?{mensalBrutoCent:manutencaoMensalCent,meses:mesesManutencao,totalCent:manutencaoMensalCent*mesesManutencao,aviso:'Manutenção opcional: taxas, impostos e custo de tempo não foram estimados.'}:null;
 return {entrada:{forma,valorCent,parcelas,entradaCent,escopoReduzidoPct},brutoCent:valorCent,parcelasInfo,taxasCent:taxas.cent,taxasConhecidas:taxas.conhecido,impostoCent:imposto,liquidoCent:liquidoParcial,liquidoEhLimiteSuperior:!liquidoExato,custosDiretosCent:custos,custosConhecidos,
  resultadoCent:resultado,resultadoEhLimiteSuperior:!exatoRes,margem:m==null?null:m*100,horas,retornoPorHoraCent:rph==null?null:Math.round(rph),fluxo,recorrente,comparacao:cmp,impacto,alertas,desconhecidos:[...falta],exato:exatoRes&&!falta.has('recebimentoCartao')};
}
export const cenariosPadrao=(cond)=>[{id:'cartao-promocional',titulo:'Cartão — preço promocional',forma:'cartao',valorCent:cond.precoPromocionalCent,parcelas:cond.parcelasMax},{id:'pix',titulo:'Pix à vista',forma:'pix',valorCent:cond.precoPixCent}].filter(c=>c.valorCent>0);
export const compararCenarios=(cond,cenarios)=>cenarios.map(c=>({...c,sim:simularOferta(cond,c)}));
