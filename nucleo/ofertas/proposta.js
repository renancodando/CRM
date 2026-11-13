/* Proposta profissional para o cliente. Recebe apenas dados voltados ao cliente: custos internos, margem, preço mínimo e estratégia nunca entram aqui. */
import {simularOferta} from './simulador.js';
import {promocaoVigente} from './condicoes.js';
const esc=v=>String(v??'').replace(/[&<>"']/g,l=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[l]));
const R=c=>(c/100).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
const dataBR=v=>v?new Date(v).toLocaleDateString('pt-BR'):'—';
const ROTULO={cartao:'Cartão',pix:'Pix à vista','entrada-saldo':'Entrada + saldo'};
export function validadeVerdadeira(cond,{agora=Date.now(),dias}={}){
 const d=new Date(agora+(dias??cond.validadeDias??7)*864e5);let fim=d;
 if(cond.promocaoAte&&promocaoVigente(cond,agora)){const p=new Date(cond.promocaoAte+'T23:59:59');if(p<fim)fim=p;}
 return fim.toISOString();
}
export function alternativasParaCliente(cond,cenarios){
 return cenarios.map((c,i)=>{const sim=simularOferta(cond,c);const alt={id:c.id||'alt'+(i+1),titulo:c.titulo||ROTULO[c.forma],forma:c.forma,valorCent:c.valorCent,parcelas:c.parcelas||1,descricao:c.descricaoCliente||''};
  if(c.forma==='cartao'&&sim.parcelasInfo&&c.parcelas>1)Object.assign(alt,{parcelaCent:sim.parcelasInfo.valorParcelaCent,totalCent:sim.parcelasInfo.totalClienteCent});
  if(c.forma==='entrada-saldo')Object.assign(alt,{entradaCent:c.entradaCent,saldoCent:c.valorCent-c.entradaCent});
  return alt;});
}
export function htmlPropostaPremium(p,empresa,{autor='',marca='',alternativas=[],aviso=''}={}){
 const alts=alternativas.length?alternativas:[{titulo:'Valor',forma:'cartao',valorCent:Math.round(p.valorFinal*100),parcelas:p.parcelasMax||1}];
 const cartao=a=>{const detalhe=a.forma==='entrada-saldo'?`<small>Entrada de ${R(a.entradaCent)} e saldo de ${R(a.saldoCent)}</small>`:a.parcelaCent&&a.parcelas>1?`<small>ou ${a.parcelas}x de ${R(a.parcelaCent)}${a.totalCent>a.valorCent?` (total ${R(a.totalCent)})`:''}</small>`:'';return `<article class="alt"><h3>${esc(a.titulo)}</h3><strong>${R(a.valorCent)}</strong>${detalhe}${a.descricao?`<p>${esc(a.descricao)}</p>`:''}</article>`;};
 const lista=(t,itens)=>itens?.length?`<section><h2>${t}</h2><ul>${itens.map(i=>`<li>${esc(i)}</li>`).join('')}</ul></section>`:'';
 return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>Proposta — ${esc(empresa.nome)}</title><style>
:root{--tinta:#101a26;--suave:#566474;--linha:#dde3ea;--cor:#1f6f5c;--fundo:#f3f5f8}*{box-sizing:border-box}body{margin:0;background:var(--fundo);color:var(--tinta);font:16px/1.65 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif}
.pagina{max-width:860px;margin:0 auto;padding:clamp(16px,4vw,40px)}header{background:linear-gradient(135deg,#0f2a3d,#1f6f5c);color:#fff;border-radius:20px;padding:clamp(24px,6vw,48px)}header small{letter-spacing:.14em;text-transform:uppercase;opacity:.8;font-size:12px}header h1{margin:.3em 0 .2em;font-size:clamp(26px,6vw,40px);line-height:1.1}header p{margin:0;opacity:.9}
section{background:#fff;border:1px solid var(--linha);border-radius:16px;padding:clamp(18px,4vw,30px);margin-top:16px}h2{margin:0 0 .6em;font-size:14px;letter-spacing:.1em;text-transform:uppercase;color:var(--cor)}ul{padding-left:1.2em;margin:.2em 0}li{margin:.25em 0}
.alts{display:grid;gap:12px;grid-template-columns:repeat(auto-fit,minmax(220px,1fr))}.alt{border:1px solid var(--linha);border-radius:14px;padding:16px;background:#fafcfb}.alt h3{margin:0 0 .3em;font-size:15px}.alt strong{display:block;font-size:28px;line-height:1.1}.alt small{display:block;color:var(--suave);margin-top:4px}.alt p{margin:.6em 0 0;color:var(--suave);font-size:14px}
.validade{display:inline-block;margin-top:14px;padding:6px 12px;border-radius:999px;background:#e8f3ef;color:#14463a;font-size:14px}.nota{font-size:13px;color:var(--suave);margin-top:20px}footer{text-align:center;color:var(--suave);font-size:13px;padding:24px 0}
@media print{body{background:#fff}header{background:#1f6f5c!important;-webkit-print-color-adjust:exact;print-color-adjust:exact}section{break-inside:avoid}}</style></head><body><div class="pagina">
<header><small>${esc(marca||autor||'Proposta comercial')}</small><h1>Proposta para ${esc(empresa.nome)}</h1><p>${esc(empresa.cidade||'')}${p.criadaEm?' · emitida em '+dataBR(p.criadaEm):''}</p></header>
<section><h2>O que será entregue</h2><p>${esc(p.escopo).replace(/\n/g,'<br>')||'Escopo a definir.'}</p></section>${lista('Incluído',p.funcionalidades)}
<section><h2>Investimento</h2><div class="alts">${alts.map(cartao).join('')}</div>${p.validade?`<span class="validade">Condições válidas até ${dataBR(p.validade)}</span>`:''}${p.condicoesPagamento?`<p>${esc(p.condicoesPagamento)}</p>`:''}</section>
<section><h2>Prazo e suporte</h2><ul>${p.prazoEntregaDias?`<li>Entrega em ${p.prazoEntregaDias} dia(s) após a aprovação e o recebimento das informações.</li>`:''}${p.suporte?`<li>${esc(p.suporte)}</li>`:''}${p.limiteAlteracoes?`<li>${esc(p.limiteAlteracoes)}</li>`:''}${p.dominio?`<li>Domínio: ${esc(p.dominio)}</li>`:''}${p.hospedagem?`<li>Hospedagem: ${esc(p.hospedagem)}</li>`:''}${(p.recorrentes||[]).map(r=>`<li>${esc(r)}</li>`).join('')}</ul></section>
${p.condicoesAdicionais?`<section><h2>Condições adicionais</h2><p>${esc(p.condicoesAdicionais).replace(/\n/g,'<br>')}</p></section>`:''}
<p class="nota">${esc(aviso||'Este documento é informativo e não substitui contrato. A aceitação e os pagamentos são combinados diretamente entre as partes.')}</p><footer>${esc(autor?'Elaborada por '+autor:'')}</footer></div></body></html>`;
}
