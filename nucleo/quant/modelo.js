/* Camada analítica central: todas as telas e relatórios leem daqui. Nada é inventado: o que não existe vira estado explícito. */
import {aCentavos} from './financas.js';
export const ESTADO={ok:'ok',zero:'zero comprovado',desconhecido:'informação desconhecida',naoRegistrado:'informação não registrada',naoAplicavel:'não aplicável',insuficiente:'informação insuficiente para análise'};
export const atividades=[['prospeccao','Prospecção','comercial'],['pesquisa','Pesquisa de empresas','comercial'],['mensagens','Preparação de mensagens','comercial'],['negociacao','Negociação','comercial'],['demonstracao','Criação de demonstrações','producao'],['desenvolvimento','Desenvolvimento','producao'],['personalizacao','Personalização','producao'],['publicacao','Publicação','producao'],['suporte','Suporte','pos'],['alteracoes','Alterações solicitadas','pos'],['posvenda','Pós-venda','pos']];
export const grupoAtividade=id=>atividades.find(a=>a[0]===id)?.[2]||null;
export const categoriasCusto=[['comercial','Comercial (aquisição)'],['projeto','Projeto'],['operacional','Operacional'],['ferramenta','Ferramenta'],['hospedagem','Hospedagem/domínio'],['taxa','Taxa de pagamento'],['imposto','Imposto'],['antecipacao','Antecipação']];
const T=v=>v?new Date(v).getTime():null;
export function periodoPadrao(tipo,ref=new Date()){
 const d=new Date(ref),ano=d.getFullYear(),m=d.getMonth();let de,ate;
 if(tipo==='dia'){de=new Date(ano,m,d.getDate());ate=new Date(ano,m,d.getDate(),23,59,59,999);}
 else if(tipo==='semana'){const dow=(d.getDay()+6)%7;de=new Date(ano,m,d.getDate()-dow);ate=new Date(de.getFullYear(),de.getMonth(),de.getDate()+6,23,59,59,999);}
 else if(tipo==='mes'){de=new Date(ano,m,1);ate=new Date(ano,m+1,0,23,59,59,999);}
 else if(tipo==='trimestre'){const q=Math.floor(m/3)*3;de=new Date(ano,q,1);ate=new Date(ano,q+3,0,23,59,59,999);}
 else if(tipo==='semestre'){const q=m<6?0:6;de=new Date(ano,q,1);ate=new Date(ano,q+6,0,23,59,59,999);}
 else if(tipo==='ano'){de=new Date(ano,0,1);ate=new Date(ano,11,31,23,59,59,999);}
 else return {tipo:'todo',de:null,ate:null,completo:true,rotulo:'Todo o histórico'};
 const completo=ate.getTime()<=ref.getTime();return {tipo,de:de.getTime(),ate:ate.getTime(),completo,parcial:!completo,rotulo:`${de.toLocaleDateString('pt-BR')} a ${ate.toLocaleDateString('pt-BR')}`};
}
export function periodoEquivalente(p,ref=new Date()){ // período anterior de mesma duração; se p é parcial, compara só o mesmo trecho decorrido
 if(p.tipo==='todo'||p.de==null)return null;const dur=(p.parcial?ref.getTime():p.ate)-p.de,anterior={tipo:p.tipo,de:null,ate:null};
 const d=new Date(p.de);let de;if(p.tipo==='mes')de=new Date(d.getFullYear(),d.getMonth()-1,1);else if(p.tipo==='trimestre')de=new Date(d.getFullYear(),d.getMonth()-3,1);else if(p.tipo==='semestre')de=new Date(d.getFullYear(),d.getMonth()-6,1);else if(p.tipo==='ano')de=new Date(d.getFullYear()-1,0,1);else de=new Date(p.de-(p.ate-p.de+1));
 anterior.de=de.getTime();anterior.ate=anterior.de+dur;anterior.rotulo=`${new Date(anterior.de).toLocaleDateString('pt-BR')} a ${new Date(anterior.ate).toLocaleDateString('pt-BR')}`;anterior.parcialComparavel=p.parcial;return anterior;
}
const dentro=(t,p)=>t!=null&&(p.de==null||t>=p.de)&&(p.ate==null||t<=p.ate);
export function construirModelo(estado,agora=Date.now()){
 const empresas=new Map(estado.empresas.map(e=>[e.id,e]));
 const eventos=estado.eventos.map(e=>({...e,t:T(e.quando),tr:T(e.registradoEm)})).filter(e=>e.t!=null&&empresas.has(e.empresaId)).sort((a,b)=>a.t-b.t);
 const porEmpresa=new Map();for(const e of eventos){if(!porEmpresa.has(e.empresaId))porEmpresa.set(e.empresaId,[]);porEmpresa.get(e.empresaId).push(e);}
 const pagamentos=estado.pagamentos.filter(p=>p.estado==='confirmado').map(p=>({...p,t:T(p.quando),centavos:aCentavos(p.valor)}));
 const propostas=estado.propostas.map(p=>({...p,orig:aCentavos(p.valorOriginal),final:aCentavos(p.valorFinal)}));
 const custos=estado.custos.map(c=>({...c,t:T(c.quando),centavos:aCentavos(c.valor)}));
 const sessoes=estado.sessoes.filter(s=>s.fim||s.duracaoMin!=null).map(s=>({...s,t:T(s.inicio),horas:(s.duracaoMin??0)/60}));
 const demos=new Map(estado.demonstracoes.map(d=>[d.id,d]));
 return {estado,agora,empresas,eventos,porEmpresa,pagamentos,propostas,custos,sessoes,demos,posVenda:estado.posVenda,tarefas:estado.tarefas,config:estado.config};
}
export const ev=(m,empresaId,tipo)=>(m.porEmpresa.get(empresaId)||[]).filter(e=>!tipo||e.tipo===tipo);
export function filtrarEmpresas(m,f={}){
 return [...m.empresas.values()].filter(e=>(!f.nicho||e.nicho===f.nicho)&&(!f.cidade||e.cidade.toLowerCase().includes(f.cidade.toLowerCase()))&&(!f.uf||new RegExp('[-,/ ]\\s*'+f.uf+'\\s*$','i').test(e.cidade))&&(!f.fonte||(e.fonte||'')===f.fonte)&&(!f.statusSite||e.statusSite===f.statusSite)&&(!f.contatoDireto||e.contatoDireto===f.contatoDireto)&&(!f.empresaId||e.id===f.empresaId)&&(!f.estrategia||ev(m,e.id,'mensagem-enviada')[0]?.estrategia===f.estrategia)&&(!f.modelo||[...m.demos.values()].some(d=>d.empresaId===e.id&&d.modeloId===f.modelo)));
}
export const rotuloEmpresa=e=>e.nome;
export const reg=(tipo,id,rotulo,extra={})=>({tipo,id,rotulo,...extra});
export {dentro};
