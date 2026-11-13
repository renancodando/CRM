import {textoSeguro as t} from '../utilitarios.js';
export {t};
export const dia=86400000;
export const dias=(a,b=Date.now())=>Math.floor((new Date(b)-new Date(a))/dia);
export const dataCurta=v=>v?new Date(v).toLocaleDateString('pt-BR'):'—';
export const dataHora=v=>v?new Date(v).toLocaleString('pt-BR',{day:'2-digit',month:'2-digit',year:'2-digit',hour:'2-digit',minute:'2-digit'}):'—';
export const paraInputData=v=>{if(!v)return '';const d=new Date(v);return Number.isFinite(d.getTime())?new Date(d.getTime()-d.getTimezoneOffset()*60000).toISOString().slice(0,10):'';};
export const paraInputDataHora=v=>{if(!v)return '';const d=new Date(v);return Number.isFinite(d.getTime())?new Date(d.getTime()-d.getTimezoneOffset()*60000).toISOString().slice(0,16):'';};
export const dePicker=v=>v?new Date(v).toISOString():'';
export const somarDias=(n,base=new Date())=>{const d=new Date(base);d.setDate(d.getDate()+n);d.setHours(10,0,0,0);return d.toISOString();};
export const lista=v=>String(v||'').split('\n').map(x=>x.trim()).filter(Boolean);
export const dinheiro=v=>new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL',minimumFractionDigits:0,maximumFractionDigits:2}).format(Number(v)||0);
export const pct=(a,b)=>b?Math.round(a/b*1000)/10:null;
export const pctTexto=(a,b)=>b?pct(a,b).toLocaleString('pt-BR')+'%':'—';
export function campo(nome,rotulo,valor='',{tipo='text',largo=false,opcoes=null,linhas=3,dica='',obrigatorio=false,extra=''}={}){
 const v=t(valor??'');let controle;
 if(opcoes)controle=`<select name="${nome}" ${extra}>${opcoes.map(o=>`<option value="${t(o.id??o[0])}" ${String(o.id??o[0])===String(valor)?'selected':''}>${t(o.nome??o[1])}</option>`).join('')}</select>`;
 else if(tipo==='textarea')controle=`<textarea name="${nome}" rows="${linhas}" maxlength="4000" ${extra}>${v}</textarea>`;
 else controle=`<input name="${nome}" type="${tipo}" value="${v}" maxlength="${tipo==='text'?200:400}" ${obrigatorio?'required':''} ${extra}>`;
 return `<label class="campo ${largo?'largo':''}"><span>${t(rotulo)}${obrigatorio?' *':''}</span>${controle}${dica?`<small>${t(dica)}</small>`:''}</label>`;
}
export const dadosForm=f=>Object.fromEntries(new FormData(f));
export function nomeEmpresa(estado,id){return estado.empresas.find(e=>e.id===id)?.nome||'Empresa removida';}
export function linkWhatsapp(numero,texto=''){const n=String(numero||'').replace(/\D/g,'');const full=n.length===10||n.length===11?'55'+n:n;if(full.length<12||full.length>13)return '';return 'https://wa.me/'+full+(texto?'?text='+encodeURIComponent(texto):'');}
export const abrirExterno=url=>{if(url)window.open(url,'_blank','noopener,noreferrer');};
export function confirmar(texto){return window.confirm(texto);}
export function grafico_barras(itens,{formato=v=>v,rotuloAria='Gráfico'}={}){
 const max=Math.max(1,...itens.map(i=>i.valor));
 return `<div class="barras-h" role="img" aria-label="${t(rotuloAria+': '+itens.map(i=>i.rotulo+' '+formato(i.valor)).join('; '))}">${itens.map(i=>`<div class="linha-barra"><span>${t(i.rotulo)}</span><i style="--p:${(i.valor/max*100).toFixed(1)}%;${i.cor?'--cor-barra:'+i.cor:''}"></i><b>${t(i.texto??formato(i.valor))}</b></div>`).join('')}</div>`;
}
