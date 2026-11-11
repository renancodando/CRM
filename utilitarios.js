export const textoSeguro=valor=>String(valor??'').replace(/[&<>"']/g,letra=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[letra]));
export const normalizar=valor=>String(valor??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
export const moeda=valor=>new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL',maximumFractionDigits:0}).format(Number(valor)||0);
export function baixarArquivo(nome,conteudo,tipo='text/plain;charset=utf-8'){const endereco=URL.createObjectURL(new Blob([conteudo],{type:tipo})),link=document.createElement('a');link.href=endereco;link.download=nome;document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(endereco),2000);}
export function dataLocal(valor){const data=new Date(valor);return new Date(data.getTime()-data.getTimezoneOffset()*60000).toISOString().slice(0,16);}
export function dataHumana(valor){const data=new Date(valor),hoje=new Date(),mesmoDia=data.toDateString()===hoje.toDateString();return (mesmoDia?'Hoje':data.toLocaleDateString('pt-BR',{day:'2-digit',month:'short'}))+', '+data.toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'});}
