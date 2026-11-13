/* Como as características das primeiras mensagens se associam a respostas e vendas. Observacional: sinaliza vieses e nunca trata diferença de taxa como eficácia comprovada. */
import {eventosDaEmpresa} from '../esquema.js';
import {wilson,fisherExato,holm} from '../quant/estatistica.js';
import {auditarMensagem,normal} from '../conversao/linguagem.js';
import {valoresEmTexto} from '../negociacao/contexto.js';
import {similaridade} from '../negociacao/mensagens.js';
const beneficios=/(cliente|orcamento|whatsapp|celular|encontr|agendar|pedir|aparecer|google|confian|rapido|facil)/g;
export function caracteristicas(estado,empresa){
 const ev=eventosDaEmpresa(estado,empresa.id),env=ev.filter(e=>e.tipo==='mensagem-enviada'),m=env[0];if(!m)return null;
 const t=m.texto||'',n=normal(t),d=new Date(m.quando),res=ev.filter(e=>e.tipo==='resposta');
 const nome=normal(empresa.nome).split(' ')[0],serv=(empresa.servicosOferecidos||[]).map(normal).filter(Boolean);
 const personal=!!(nome&&n.includes(nome))||serv.some(s=>n.includes(s))||(empresa.cidade&&n.includes(normal(empresa.cidade.split(/[-,]/)[0])));
 const aud=auditarMensagem(t,{primeiraMensagem:true});
 const f=env[1]?(new Date(env[1].quando)-d)/864e5:null,prox=env.slice(1).map((x,i)=>similaridade(x.texto||'',env[i].texto||''));
 return {empresaId:empresa.id,nicho:empresa.nicho||'(sem nicho)',
  tamanho:t.length<=160?'curta (≤160)':t.length<=320?'média (161–320)':'longa (>320)',
  pergunta:(t.match(/\?/g)||[]).length?'com pergunta':'sem pergunta',
  beneficios:(()=>{const k=new Set(n.match(beneficios)||[]).size;return k===0?'0 benefícios':k<=2?'1–2 benefícios':'3+ benefícios';})(),
  clareza:aud.erros.length||aud.avisos.length>1?'com problemas de linguagem':'limpa',
  preco:valoresEmTexto(t).length?'preço na 1ª mensagem':'sem preço na 1ª',
  demo:/previa|demonstra|mostrar (como )?(fica|ficaria)|montar (um|uma)/.test(n)?'oferece demonstração':'não oferece demonstração',
  abordagem:m.estrategia||'(sem abordagem)',personalizacao:personal?'personalizada com fatos':'genérica',
  horario:d.getHours()<12?'manhã':d.getHours()<18?'tarde':'noite',dia:['dom','seg','ter','qua','qui','sex','sáb'][d.getDay()],
  followUp:env.length===1?'nenhum':env.length===2?'1 follow-up':'2+ follow-ups',tempoFollowUp:f==null?'sem follow-up':f<=2?'até 2 dias':f<=5?'3–5 dias':'mais de 5 dias',
  repeticao:prox.some(s=>s>=.6)?'repetiu texto':'sem repetição',
  respondeu:res.length>0,positiva:res.some(r=>['medio','alto'].includes(r.interesse)||r.pediuDemo),venda:ev.some(e=>e.tipo==='venda'||e.tipo==='proposta-aceita')||empresa.etapa==='fechada'};
}
export const FEATURES=[['tamanho','Tamanho da mensagem'],['pergunta','Presença de pergunta'],['beneficios','Benefícios mencionados'],['clareza','Clareza/linguagem'],['preco','Momento do preço'],['demo','Oferta de demonstração'],['abordagem','Tipo de abordagem'],['personalizacao','Personalização baseada em fatos'],['horario','Horário do envio'],['dia','Dia da semana'],['followUp','Número de follow-ups'],['tempoFollowUp','Tempo até o follow-up'],['repeticao','Repetição de mensagens']];
function mantelHaenszel(linhas,feature,A,B,desfecho){
 const por=new Map();for(const l of linhas){if(l[feature]!==A&&l[feature]!==B)continue;if(!por.has(l.nicho))por.set(l.nicho,[0,0,0,0]);const s=por.get(l.nicho),a=l[feature]===A,y=l[desfecho];if(a&&y)s[0]++;else if(a)s[1]++;else if(y)s[2]++;else s[3]++;}
 let num=0,den=0,usadas=0;for(const [a,b,c,d] of por.values()){const n=a+b+c+d;if(n<2||(a+b)===0||(c+d)===0)continue;num+=a*d/n;den+=b*c/n;usadas++;}return usadas&&den>0?{oddsRatio:num/den,estratos:usadas}:null;
}
export function analisarMensagens(estado,{desfecho='respondeu',minimo=10}={}){
 const linhas=estado.empresas.map(e=>caracteristicas(estado,e)).filter(Boolean),total=linhas.length;
 if(!total)return {possivel:false,motivo:'Nenhuma primeira mensagem confirmada foi registrada ainda.',total};
 const taxaGeral=linhas.filter(l=>l[desfecho]).length/total,tabelas=[];
 for(const [f,rot] of FEATURES){
  const g=new Map();for(const l of linhas){if(!g.has(l[f]))g.set(l[f],{valor:l[f],n:0,x:0});const o=g.get(l[f]);o.n++;if(l[desfecho])o.x++;}
  const grupos=[...g.values()].map(o=>({...o,taxa:o.n?o.x/o.n:null,ic:wilson(o.x,o.n),suficiente:o.n>=minimo})).sort((a,b)=>b.n-a.n);
  let teste=null,vies=[];
  if(grupos.length>=2){const [a,b]=grupos;if(a.n>=minimo&&b.n>=minimo){const p=fisherExato(a.x,a.n-a.x,b.x,b.n-b.x),mh=mantelHaenszel(linhas,f,a.valor,b.valor,desfecho);teste={entre:[a.valor,b.valor],diferenca:a.taxa-b.taxa,p,oddsRatioAjustadoPorNicho:mh};
   const nichos=[...new Set(linhas.map(l=>l.nicho))];if(nichos.length>1){const fa=linhas.filter(l=>l[f]===a.valor),fb=linhas.filter(l=>l[f]===b.valor);const dif=Math.max(...nichos.map(nc=>Math.abs(fa.filter(l=>l.nicho===nc).length/fa.length-fb.filter(l=>l.nicho===nc).length/fb.length)));if(dif>.25)vies.push(`Os grupos têm composição de nicho muito diferente (até ${Math.round(dif*100)} pontos de diferença): o nicho pode explicar parte da diferença.`);}}}
  if(grupos.some(x=>!x.suficiente))vies.push('Algum grupo tem menos de '+minimo+' empresas: taxas instáveis.');
  vies.push('Não houve sorteio: empresas e mensagens foram escolhidas por você (viés de seleção possível).');
  tabelas.push({id:f,rotulo:rot,grupos,teste,vies});
 }
 const ps=tabelas.map(t=>t.teste?.p).filter(p=>p!=null),aj=ps.length?holm(ps):[];let k=0;for(const t of tabelas)if(t.teste)t.teste.pAjustadoHolm=aj[k++];
 return {possivel:true,total,desfecho,taxaGeral,tabelas,achados:tabelas.filter(t=>t.teste&&t.teste.pAjustadoHolm<.05).map(t=>`${t.rotulo}: diferença observada entre "${t.teste.entre[0]}" e "${t.teste.entre[1]}" (p ajustado ${t.teste.pAjustadoHolm.toFixed(3)}), mesmo após corrigir ${ps.length} comparações. Isso é uma ASSOCIAÇÃO; teste com sorteio no Laboratório antes de mudar sua rotina.`),
  aviso:'Diferenças de taxa de resposta entre grupos não provam que uma característica da mensagem causa a resposta. Resposta ≠ venda.'};
}
