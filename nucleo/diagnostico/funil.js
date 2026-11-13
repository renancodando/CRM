/* Funil comercial detalhado com 19 etapas OBSERVÁVEIS. Cada empresa tem um conjunto de etapas alcançadas (não uma sequência obrigatória): vendas sem demonstração, por exemplo, são registradas como caminho alternativo. */
import {eventosDaEmpresa} from '../esquema.js';
import {qualificar,podeContatar} from '../conversao/dominio.js';
import {wilson,fisherExato} from '../quant/estatistica.js';
import {valoresEmTexto} from '../negociacao/contexto.js';
import {normal} from '../conversao/linguagem.js';
export const ETAPAS=[['encontrada','Empresas encontradas'],['qualificada','Empresas qualificadas'],['elegivel','Elegíveis para contato'],['primeira-mensagem','Primeira mensagem enviada'],['resposta','Resposta recebida'],['resposta-positiva','Resposta positiva'],['conversa','Conversa comercial iniciada'],['demo-oferecida','Demonstração oferecida'],['demo-aceita','Demonstração aceita'],['demo-criada','Demonstração criada'],['demo-publicada','Demonstração publicada'],['link-apresentado','Link apresentado'],['acesso','Acesso observado'],['preco','Preço apresentado'],['objecao','Objeção recebida'],['negociacao','Negociação'],['proposta','Proposta apresentada'],['venda','Venda confirmada'],['pagamento','Pagamento recebido']];
const ROT=Object.fromEntries(ETAPAS);
export const TRANSICOES=[['encontrada','qualificada'],['qualificada','elegivel'],['elegivel','primeira-mensagem'],['primeira-mensagem','resposta'],['resposta','resposta-positiva'],['resposta-positiva','conversa'],['conversa','demo-oferecida'],['demo-oferecida','demo-aceita'],['demo-aceita','demo-criada'],['demo-criada','demo-publicada'],['demo-publicada','link-apresentado'],['link-apresentado','acesso'],['conversa','preco'],['preco','proposta'],['proposta','venda'],['venda','pagamento']];
const reOferta=/pr[eé]via|demonstra|mostrar (como )?(fica|ficaria)|montar (um|uma)/i;
export function etapasAlcancadas(estado,empresa){
 const ev=eventosDaEmpresa(estado,empresa.id),at={},quando={};const marca=(id,q)=>{at[id]=true;if(q&&(!quando[id]||q<quando[id]))quando[id]=q;};
 marca('encontrada',empresa.criada);
 const q=qualificar(estado,empresa);if(['alto','medio'].includes(q.potencial)&&q.confianca>=40)marca('qualificada',empresa.criada);
 const enviadas=ev.filter(e=>e.tipo==='mensagem-enviada'),respostas=ev.filter(e=>e.tipo==='resposta'),apres=ev.filter(e=>e.tipo==='demonstracao-apresentada');
 if((empresa.situacao==='ativa'&&podeContatar(empresa).ok)||enviadas.length)marca('elegivel',empresa.criada);
 if(enviadas.length)marca('primeira-mensagem',enviadas[0].quando);
 if(respostas.length)marca('resposta',respostas[0].quando);
 const pos=respostas.find(r=>['medio','alto'].includes(r.interesse)||r.pediuDemo);if(pos)marca('resposta-positiva',pos.quando);
 if(respostas.length&&enviadas.some(m=>m.quando>respostas[0].quando))marca('conversa',respostas[0].quando);
 const oferta=enviadas.find(m=>reOferta.test(m.texto||''));if(oferta||apres.length||respostas.some(r=>r.pediuDemo))marca('demo-oferecida',(oferta||apres[0]||respostas[0]).quando);
 if(respostas.some(r=>r.pediuDemo)||(oferta&&respostas.some(r=>r.quando>oferta.quando&&['medio','alto'].includes(r.interesse))))marca('demo-aceita',respostas.find(r=>r.pediuDemo)?.quando||oferta.quando);
 const demos=estado.demonstracoes.filter(d=>d.empresaId===empresa.id);if(demos.length)marca('demo-criada',demos[0].criado||demos[0].criada);
 const pubs=estado.publicacoes.filter(p=>p.empresaId===empresa.id&&p.publicadoEm);if(pubs.length)marca('demo-publicada',pubs[0].publicadoEm);
 if(apres.length)marca('link-apresentado',apres[0].quando);
 const rast=pubs.map(p=>estado.rastreios.find(r=>r.publicacaoId===p.id)).filter(Boolean);if(rast.some(r=>r.resumo?.visualizacoes>0))marca('acesso',rast.find(r=>r.resumo?.visualizacoes>0).atualizadoEm);
 const ofertas=estado.ofertas.filter(o=>o.empresaId===empresa.id),props=estado.propostas.filter(p=>p.empresaId===empresa.id&&p.estado!=='cancelada');
 const precoMsg=enviadas.find(m=>valoresEmTexto(m.texto).length);if(ofertas.some(o=>o.tipo==='apresentada')||precoMsg||ev.some(e=>e.tipo==='proposta-enviada'))marca('preco',ofertas.find(o=>o.tipo==='apresentada')?.quando||precoMsg?.quando||ev.find(e=>e.tipo==='proposta-enviada').quando);
 if(estado.conversao?.registrosObjecao?.some(o=>o.empresaId===empresa.id)||respostas.some(r=>/caro|sem dinheiro|vou pensar|nao preciso|ja tenho|sobrinho/.test(normal(r.texto))))marca('objecao',respostas.find(r=>/caro|sem dinheiro|vou pensar|nao preciso|ja tenho|sobrinho/.test(normal(r.texto)))?.quando);
 if(ofertas.some(o=>o.tipo==='contraproposta')||respostas.some(r=>/desconto|faz por|mais barato|baixar/.test(normal(r.texto)))||empresa.etapa==='negociacao')marca('negociacao');
 if(ev.some(e=>e.tipo==='proposta-enviada'))marca('proposta',ev.find(e=>e.tipo==='proposta-enviada').quando);
 if(ev.some(e=>e.tipo==='venda'||e.tipo==='proposta-aceita')||empresa.etapa==='fechada')marca('venda',ev.find(e=>e.tipo==='venda'||e.tipo==='proposta-aceita')?.quando);
 if(estado.pagamentos.some(p=>p.empresaId===empresa.id&&p.estado==='confirmado'))marca('pagamento',estado.pagamentos.find(p=>p.empresaId===empresa.id&&p.estado==='confirmado').quando);
 return {at,quando,primeiraMensagem:enviadas[0],estrategia:enviadas[0]?.estrategia||'',valorOferecido:ofertas.find(o=>o.tipo==='apresentada')?.valorCent??(precoMsg?valoresEmTexto(precoMsg.texto)[0]:null)};
}
export const faixaPreco=c=>c==null?'sem-preço':c<60000?'até R$ 600':c<=80000?'R$ 600–800':'acima de R$ 800';
const DIM={
 empresa:(e)=>e.id,nicho:e=>e.nicho||'(sem nicho)',cidade:e=>(e.cidade||'').split(/[-,]/)[0].trim()||'(sem cidade)',origem:e=>e.fonte||'(sem origem)',
 periodo:(e,r)=>r.primeiraMensagem?.quando?r.primeiraMensagem.quando.slice(0,7):'(sem contato)',abordagem:(e,r)=>r.estrategia||'(sem abordagem)',
 modelo:(e,r,estado)=>estado.demonstracoes.find(d=>d.empresaId===e.id)?.modeloId||estado.demonstracoes.find(d=>d.empresaId===e.id)?.modelo||'(sem demonstração)',faixa:(e,r)=>faixaPreco(r.valorOferecido)
};
export const DIMENSOES=Object.keys(DIM);
export function calcularFunil(estado,{filtro=null,agrupar=null,minimo=10}={}){
 const linhas=estado.empresas.map(e=>({e,r:etapasAlcancadas(estado,e)})).filter(x=>!filtro||filtro(x.e,x.r));
 const grupo=(ls)=>{const cont=Object.fromEntries(ETAPAS.map(([id])=>[id,ls.filter(x=>x.r.at[id]).length]));
  const trans=TRANSICOES.map(([a,b])=>{const den=cont[a],num=ls.filter(x=>x.r.at[a]&&x.r.at[b]).length;return {de:a,para:b,rotulo:`${ROT[a]} → ${ROT[b]}`,denominador:den,numerador:num,taxa:den?num/den:null,ic:wilson(num,den),suficiente:den>=minimo};});
  const pulos=ls.filter(x=>x.r.at.venda&&!x.r.at['demo-criada']).length;
  const caminhos=new Map();for(const x of ls.filter(x=>x.r.at.venda)){const seq=ETAPAS.map(([id])=>id).filter(id=>x.r.at[id]&&x.r.quando[id]).sort((a,b)=>String(x.r.quando[a]).localeCompare(String(x.r.quando[b]))||ETAPAS.findIndex(z=>z[0]===a)-ETAPAS.findIndex(z=>z[0]===b));const k=seq.join(' › ');caminhos.set(k,(caminhos.get(k)||0)+1);}
  return {empresas:ls.length,contagens:cont,transicoes:trans,vendasSemDemonstracao:pulos,caminhosDeVenda:[...caminhos.entries()].map(([sequencia,n])=>({sequencia:sequencia.split(' › ').map(i=>ROT[i]),n})).sort((a,b)=>b.n-a.n)};};
 const base=grupo(linhas);
 if(!agrupar)return {...base,aviso:'Etapas são alcançadas de forma independente: nem toda venda passa por todas. Taxas usam como denominador as empresas que alcançaram a etapa anterior da transição.'};
 if(!DIM[agrupar])throw Error('Dimensão desconhecida: '+agrupar);
 const g=new Map();for(const x of linhas){const k=DIM[agrupar](x.e,x.r,estado);if(!g.has(k))g.set(k,[]);g.get(k).push(x);}
 return {...base,agrupadoPor:agrupar,grupos:[...g.entries()].map(([chave,ls])=>({chave,...grupo(ls)})).sort((a,b)=>b.empresas-a.empresas),aviso:'Comparações entre grupos são observacionais: os grupos podem diferir em outros fatores além do que está sendo agrupado.'};
}
export function compararTaxa(a,b){if(!a.denominador||!b.denominador)return null;const p=fisherExato(a.numerador,a.denominador-a.numerador,b.numerador,b.denominador-b.numerador);return {diferenca:a.taxa-b.taxa,p,suficiente:a.suficiente&&b.suficiente};}
