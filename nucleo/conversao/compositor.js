/* Compositor do Órbita Conversão: junta contexto, estratégia e texto. Gera SUGESTÕES; a qualidade textual é interna e NÃO é probabilidade de venda. */
import {eventosDaEmpresa} from '../esquema.js';
import {gerarMensagem,sugerirTipo,tiposMensagem} from '../mensagens.js';
import {qualificar,podeContatar,estadoConversa,rotuloEstadoConversa,planoFollowUp} from './dominio.js';
import {auditarMensagem,normal} from './linguagem.js';
import {gerarAbordagens} from './abordagens.js';
import {recomendarAbordagem} from './laboratorio.js';
import {resumoNegociacao,valoresEmTexto} from '../negociacao/contexto.js';
import {interpretarNegociacao} from '../negociacao/interpretacao.js';
import {proximaMelhorAcao} from '../negociacao/proxima-acao.js';
import {gerarMensagemContinuidade,similaridade} from '../negociacao/mensagens.js';
import {contatosDaEmpresa} from '../contatos.js';
import {condicaoVigente,precoAtual,condicaoPadrao} from '../ofertas/condicoes.js';
const condDe=(estado,agora)=>condicaoVigente(estado,agora)?.dados||condicaoPadrao(estado.config.comercial);
import {tecnicaPorId,estudoPorId,graus} from './evidencias.js';
export {tiposMensagem};
const ORIGENS={confirmada:'Confirmada',usuario:'Fornecida por você',publica:'Pública, não verificada',inferida:'Inferida',desconhecida:'Desconhecida'};
export const rotuloOrigem=o=>ORIGENS[o]||o;
/* ---------- contexto com origem e confiabilidade de cada dado ---------- */
export function montarContexto(estado,empresa){
 const verificada=!!empresa.verificadoEm,cs=contatosDaEmpresa(empresa),resumo=resumoNegociacao(estado,empresa),cond=condDe(estado,Date.now());
 const o=(valor,quando)=>!valor||(Array.isArray(valor)&&!valor.length)?'desconhecida':verificada&&quando!==false?'confirmada':'usuario';
 const campos=[
  ['nome','Nome',empresa.nome,'usuario'],['cidade','Cidade',empresa.cidade,o(empresa.cidade)],['nicho','Nicho',empresa.nicho,o(empresa.nicho,false)],
  ['servicos','Serviços',(empresa.servicosOferecidos||[]).join(', '),o(empresa.servicosOferecidos)],['diferenciais','Diferenciais',(empresa.diferenciais||[]).join(', '),o(empresa.diferenciais)],
  ['responsavel','Responsável',empresa.responsavel||empresa.contato,empresa.responsavel||empresa.contato?(empresa.contatoDireto==='sim'?'confirmada':'usuario'):'desconhecida'],
  ['site','Site próprio',empresa.statusSite==='tem-site'?(empresa.site||'sim'):empresa.statusSite==='sem-site'?'sem site (conforme sua verificação)':'',empresa.statusSite==='tem-site'||empresa.statusSite==='sem-site'?(/evid[eê]ncia/i.test(empresa.notas||'')?'confirmada':'publica'):'desconhecida'],
  ['instagram','Instagram',empresa.instagram,empresa.instagram?'publica':'desconhecida'],
  ['avaliacoes','Avaliações públicas',empresa.presenca?.avaliacoesQtd?`${empresa.presenca.avaliacoesQtd} avaliação(ões)${empresa.presenca.avaliacoesNota?', nota '+empresa.presenca.avaliacoesNota:''}`:'',empresa.presenca?.avaliacoesQtd?'publica':'desconhecida'],
  ['auditoria','Auditoria digital',empresa.auditoria?.realizadaEm?'realizada em '+new Date(empresa.auditoria.realizadaEm).toLocaleDateString('pt-BR'):'',empresa.auditoria?.realizadaEm?'confirmada':'desconhecida']
 ].map(([chave,rotulo,valor,origem])=>({chave,rotulo,valor:valor||'',origem}));
 const pubs=estado.publicacoes.filter(p=>p.empresaId===empresa.id&&!p.arquivada&&p.urlPublica);
 return {campos,contatos:cs,resumo,oferta:cond?{precoCent:precoAtual(cond),pixCent:cond.precoPixCent,parcelas:cond.parcelasMax,suporteDias:cond.suporteDias,promocaoAte:cond.promocaoAte}:null,demonstracao:resumo.demonstracao,publicacoes:pubs,qualificacao:qualificar(estado,empresa),desconhecidos:campos.filter(c=>c.origem==='desconhecida').map(c=>c.rotulo)};
}
/* ---------- estágio e objetivo ---------- */
export function estagioComercial(estado,empresa,agora=Date.now()){
 const r=resumoNegociacao(estado,empresa,{agora}),it=interpretarNegociacao(estado,empresa,{agora}),L=id=>it.leituras.some(x=>x.id===id||x.id.startsWith(id));
 let id,objetivo;
 if(!podeContatar(empresa,'whatsapp').ok||L('recusa')||['recusada','perdida'].includes(empresa.situacao)){id='recusa';objetivo='Respeitar a decisão e encerrar com cordialidade.';}
 else if(r.propostas.some(p=>p.estado==='aceita')||L('fechamento')){id='aceite';objetivo='Formalizar a proposta e combinar o pagamento.';}
 else if(L('obj-')||L('desconto')){id='objecao';objetivo='Compreender a objeção e negociar sem pressão.';}
 else if(L('interesse-condicionado')||L('preco')||r.propostas.length){id='interesse-comercial';objetivo='Apresentar as condições com clareza.';}
 else if(r.demonstracao.apresentada){id='demonstracao-enviada';objetivo='Esclarecer dúvidas e recolher o que ele mudaria.';}
 else if(it.resumo.contagens.recebidas&&(L('interesse')||it.resumo.ultima?.autor==='cliente')&&(empresa.solicitouDemo||r.demonstracao.existe)){id='pedido-demonstracao';objetivo='Apresentar o projeto preparado.';}
 else if(r.contagens.recebidas&&(L('interesse')||L('necessidade')||L('duvidas'))){id='interesse';objetivo='Facilitar o próximo passo concreto.';}
 else if(r.contagens.enviadas&&!r.contagens.recebidas){id='sem-resposta';objetivo='Avaliar se um follow-up útil é adequado agora.';}
 else if(r.contagens.recebidas){id='interesse';objetivo='Entender a necessidade antes de oferecer algo.';}
 else{id='primeiro-contato';objetivo='Iniciar uma conversa legítima.';}
 const rot={'primeiro-contato':'Primeiro contato',interesse:'Interesse','pedido-demonstracao':'Pedido de demonstração','demonstracao-enviada':'Demonstração enviada','interesse-comercial':'Interesse comercial',objecao:'Objeção',aceite:'Aceite',recusa:'Recusa','sem-resposta':'Ausência de resposta'}[id];
 return {id,rotulo:rot,objetivo};
}
/* ---------- estratégia explicável ---------- */
export function montarEstrategia(estado,empresa,agora=Date.now()){
 const est=estagioComercial(estado,empresa,agora),pa=proximaMelhorAcao(estado,empresa,{agora}),it=interpretarNegociacao(estado,empresa,{agora}),ctx=montarContexto(estado,empresa),rec=recomendarAbordagem(estado,empresa),perm=podeContatar(empresa,'whatsapp');
 const ab=gerarAbordagens(estado,empresa).abordagens.find(a=>a.id===rec.recomendada);
 const evid=(ab?.evidencias||[]).map(e=>({ref:e.ref,grau:e.grau,limitacoes:e.limitacoes}));
 const tecnicas=(ab?.tecnicas||[]);
 const faltantes=[...ctx.desconhecidos.map(x=>x+' desconhecido(a)'),...(it.naoSabemos||[]).slice(0,3)];
 const limites=['Evidência científica majoritariamente indireta para este contexto (WhatsApp, pequenas empresas): trate como hipótese a testar.','A qualidade textual interna não é probabilidade de venda.'];
 if(!ctx.contatos.some(c=>c.norm.estruturaValida))limites.push('Não há número com estrutura válida cadastrado.');
 const riscos=[...(pa.evitar||[]),...(perm.ok&&perm.aviso?[perm.aviso]:[])];
 return {estagio:est,objetivo:est.objetivo,acao:{id:pa.acao,rotulo:pa.rotulo,porque:pa.porque},abordagem:{id:rec.recomendada,nome:ab?.nome||'',modo:rec.modo,porque:rec.porque,tecnicas,evidencias:evid,pontosNegativos:ab?.pontosNegativos||[]},proximoPasso:pa.proximoAvanco||'',descartadas:pa.descartadas||[],evitar:pa.evitar||[],riscos,faltantes,limitacoes:limites,bloqueio:perm.ok?null:perm.motivo,leituras:it.leituras};
}
/* ---------- alternativas de mensagem ---------- */
const variacao=(texto,porque,rotulo,extra={})=>({rotulo,texto,porque,...extra});
export function compor(estado,empresa,{tipo='auto',tamanho='media',formalidade='neutra',demoId='',experimento=null,varianteExperimento='',agora=Date.now(),opcaoNegociacao='manter',linkProposta='',validadeProposta='',objetivo=''}={}){
 const perm=podeContatar(empresa,'whatsapp'),res=resumoNegociacao(estado,empresa,{agora}),pa=proximaMelhorAcao(estado,empresa,{agora});
 const demos=estado.demonstracoes.filter(d=>d.empresaId===empresa.id),demo=demos.find(d=>d.id===demoId)||demos.find(d=>d.urlPublica)||null,autor=estado.preferencias.nome||'Renan';
 const out={tipoUsado:tipo,bloqueado:!perm.ok,motivoBloqueio:perm.ok?'':perm.motivo,alternativas:[],aguardar:false,avisos:[]};
 if(!perm.ok)return out;
 const ultResp=eventosDaEmpresa(estado,empresa.id,'resposta').at(-1);
 if(experimento&&varianteExperimento){const v=experimento.variantes.find(x=>x.id===varianteExperimento);if(v?.texto){const t=v.texto.replace(/\{nome\}/g,empresa.nome).replace(/\{pessoa\}/g,(empresa.contato||'').split(' ')[0]||'').replace(/\{cidade\}/g,empresa.cidade).replace(/\s+/g,' ').trim();out.alternativas.push(variacao(t,'Texto da variante "'+v.nome+'" do experimento "'+experimento.nome+'".','Variante do experimento',{estrategia:v.nome,variante:v.id,experimentoId:experimento.id}));out.tipoUsado='experimento';return out;}
  if(v&&v.motor!==undefined){const tipoE=tipo==='auto'?sugerirTipo(estado,empresa):tipo,g=gerarMensagem(empresa,{tipo:tipoE,variante:v.motor,demo,comercial:estado.config.comercial,ultimaResposta:ultResp?.texto,autor});out.alternativas.push(variacao(g.texto,'Variante "'+v.nome+'" do experimento "'+experimento.nome+'".','Variante do experimento',{estrategia:g.estrategia,variante:v.id,experimentoId:experimento.id,tipo:tipoE,faltando:g.faltando}));out.tipoUsado='experimento';return out;}}
 const C=(objetivo,tam)=>gerarMensagemContinuidade(estado,empresa,{objetivo,tamanho:tam,formalidade,opcaoNegociacao,agora,linkProposta,validadeProposta});
 if(tipo==='auto'){
  if(!res.contagens.enviadas&&!res.contagens.recebidas){
   const rec=recomendarAbordagem(estado,empresa),ab=gerarAbordagens(estado,empresa,{demo,autor}).abordagens,pick=id=>ab.find(a=>a.id===id&&a.disponivel);
   const sorteio=estado.experimentos.filter(x=>x.conv&&x.ativo).map(x=>({x,a:x.atribuicoes.find(a=>a.empresaId===empresa.id&&!a.enviada)})).find(o=>o.a),vSort=sorteio?sorteio.x.variantes.find(v=>v.id===sorteio.a.varianteId):null,porSorteio=vSort?ab.find(a=>a.estrategia===vSort.abordagem&&a.disponivel):null;
   const r=porSorteio||pick(rec.recomendada)||pick('A'),dir=pick(r?.id==='A'?'E':'A'),con=pick(r?.id==='B'?'F':'B');
   if(r)out.alternativas.push(variacao(r.mensagem,porSorteio?'Abordagem sorteada no experimento "'+sorteio.x.nome+'": use esta para manter o experimento válido. '+r.porque:r.porque,porSorteio?'Sorteada no experimento':'Recomendada',{estrategia:r.estrategia,abordagem:r.id,evidencias:r.evidencias,tecnicas:r.tecnicas,pontosNegativos:r.pontosNegativos,proximas:r.proximas,...(porSorteio?{experimentoId:sorteio.x.id,variante:vSort.id,sorteado:true}:{})}));
   if(dir)out.alternativas.push(variacao(dir.mensagem,dir.porque,'Mais direta',{estrategia:dir.estrategia,abordagem:dir.id,tecnicas:dir.tecnicas,pontosNegativos:dir.pontosNegativos}));
   if(con)out.alternativas.push(variacao(con.mensagem,con.porque,'Mais consultiva',{estrategia:con.estrategia,abordagem:con.id,tecnicas:con.tecnicas,pontosNegativos:con.pontosNegativos}));
   out.tipoUsado='primeiro-contato';
  }else{
   const r=C(objetivo||'auto',tamanho);
   if(r.texto==null){out.aguardar=true;out.motivoAguardar=r.porque;}
   else{out.alternativas.push(variacao(r.texto,r.porque,'Recomendada',{estrategia:'continuidade',objetivo:r.objetivo,auditoria:r.auditoria,repeticao:r.repeticao}));
    const curta=C(r.objetivo,'curta'),obj2=r.objetivo==='pergunta'?'alternativa':'pergunta',cons=C(r.objetivo==='encerrar'?'encerrar':obj2,'media');
    if(curta.texto&&curta.texto!==r.texto)out.alternativas.push(variacao(curta.texto,'Mesma decisão estratégica em uma frase curta e fácil de responder.','Mais direta',{estrategia:'continuidade-curta',objetivo:r.objetivo}));
    if(cons.texto&&cons.texto!==r.texto&&r.objetivo!=='encerrar')out.alternativas.push(variacao(cons.texto,obj2==='pergunta'?'Em vez de oferecer, faz uma pergunta que ajuda a entender a necessidade.':'Abre espaço para o cliente dizer o que cabe, antes de qualquer ajuste.','Mais consultiva',{estrategia:'continuidade-consultiva',objetivo:obj2}));}
  }
 }else{
  const comum={demo,comercial:estado.config.comercial,ultimaResposta:ultResp?.texto,autor},nomes=['Direta','Consultiva','Personalizada'];
  const g=[0,1,2].map(i=>gerarMensagem(empresa,{tipo,variante:i,...comum}));
  out.alternativas.push(variacao(g[0].texto,'Modelo do catálogo para esta situação, preenchido com os dados reais da empresa.','Recomendada',{estrategia:g[0].estrategia,variante:0,tipo,faltando:g[0].faltando}));
  out.alternativas.push(variacao(g[1].texto,'Variação com pergunta aberta, mais consultiva.','Mais consultiva',{estrategia:g[1].estrategia,variante:1,tipo,faltando:g[1].faltando}));
  out.alternativas.push(variacao(g[2].texto,'Variação com personalização a partir de fatos da ficha, mais direta ao ponto.','Mais direta',{estrategia:g[2].estrategia,variante:2,tipo,faltando:g[2].faltando}));
 }
 out.sugestaoTipo=sugerirTipo(estado,empresa);out.acao=pa.acao;return out;
}
/* ---------- validação factual e qualidade textual ---------- */
export function validarMensagem(estado,empresa,texto,{contatoId='',demoId='',agora=Date.now()}={}){
 const t=String(texto||''),problemas=[],ok=(nivel,x)=>problemas.push({nivel,texto:x});
 const cs=contatosDaEmpresa(empresa),c=cs.find(x=>x.id===contatoId)||cs[0],cond=condDe(estado,agora),perm=podeContatar(empresa,'whatsapp');
 if(!t.trim())ok('erro','A mensagem está vazia.');
 if(!perm.ok)ok('erro','Contato bloqueado: '+perm.motivo);else if(perm.aviso)ok('aviso',perm.aviso);
 if(!c)ok('erro','Nenhum número cadastrado.');else if(!c.norm.estruturaValida)ok('erro',c.norm.motivo);else if(!c.whatsappConfirmado)ok('info','Número com estrutura válida, mas o WhatsApp deste número ainda não foi confirmado.');
 if(/\[inserir|\{[a-z]+\}|\[link/i.test(t))ok('erro','Há um campo a preencher (colchetes ou chaves) na mensagem.');
 const urls=[...t.matchAll(/https?:\/\/[^\s)]+/g)].map(m=>m[0].replace(/[.,;!?]+$/,''));
 const conhecidos=new Set([...estado.publicacoes.filter(p=>p.empresaId===empresa.id&&p.urlPublica).map(p=>p.urlPublica.replace(/\/$/,'')),...estado.demonstracoes.filter(d=>d.empresaId===empresa.id&&d.urlPublica).map(d=>d.urlPublica.replace(/\/$/,''))]);
 for(const u of urls){if(!conhecidos.has(u.replace(/\/$/,'')))ok('aviso','O link '+u+' não é uma demonstração publicada desta empresa no Órbita: confira.');}
 if(!urls.length&&/\b(link|abaixo|segue o site)\b/i.test(t)&&!/nao tem link/.test(normal(t)))ok('aviso','A mensagem fala de um link, mas não há link nela.');
 const valores=valoresEmTexto(t);if(valores.length){const vig=cond?[cond.precoNormalCent,cond.precoPromocionalCent,cond.precoPixCent]:[];const ofertas=estado.ofertas.filter(o=>o.empresaId===empresa.id).map(o=>o.valorCent);for(const v of valores)if(!vig.includes(v)&&!ofertas.includes(v))ok('aviso','O valor R$ '+(v/100).toLocaleString('pt-BR')+' não coincide com as condições vigentes nem com ofertas registradas: confirme antes de enviar.');}
 if(valores.length&&!res_precoAutorizado(estado,empresa))ok('info','Esta empresa ainda não recebeu preço registrado: confirme que quer falar de valor agora.');
 const dem=[...t.matchAll(/(demonstra|prévia|previa)/gi)].length&&!estado.demonstracoes.some(d=>d.empresaId===empresa.id)&&/\b(preparei|montei|deixei pronta|já está pronta|segue)\b/i.test(t);if(dem)ok('aviso','A mensagem diz que há uma demonstração pronta, mas não existe demonstração desta empresa.');
 if(/vi (que )?(voc[eê]s|o seu|a sua) (instagram|site)|(seu|vosso) instagram/i.test(t)&&!empresa.instagram&&!empresa.site)ok('aviso','A mensagem cita Instagram/site que não constam na ficha da empresa.');
 if(/visualizou|viu o (site|link)|abriu o (site|link)/i.test(t))ok('erro','Não afirme que o cliente viu o site: uma visita não identifica quem abriu.');
 const aud=auditarMensagem(t,{max:520,primeiraMensagem:!estado.eventos.some(e=>e.empresaId===empresa.id&&e.tipo==='mensagem-enviada')});for(const e of aud.erros)ok('erro',e);for(const a of aud.avisos)ok('aviso',a);
 const ant=estado.eventos.filter(e=>e.empresaId===empresa.id&&e.tipo==='mensagem-enviada'&&!e.revertido).slice(-5).map(e=>e.texto);const sim=Math.max(0,...ant.map(a=>similaridade(t,a)));if(sim>=.6)ok('aviso','Muito parecida com uma mensagem que você já enviou ('+Math.round(sim*100)+'% de similaridade).');
 const rec=estado.eventos.some(e=>e.empresaId===empresa.id&&e.tipo==='resposta'&&(e.recusou||e.pediuParar));if(rec)ok('erro','Há registro de recusa: não envie nova oferta.');
 const q=qualidadeTextual(t,{empresa,aud,sim});
 return {ok:!problemas.some(p=>p.nivel==='erro'),problemas,qualidade:q,auditoria:aud,caracteres:t.length};
}
const res_precoAutorizado=(estado,empresa)=>resumoNegociacao(estado,empresa).precoApresentado!=null||estado.eventos.some(e=>e.empresaId===empresa.id&&e.tipo==='resposta'&&/valor|pre[cç]o|quanto/i.test(e.texto||''));
export function qualidadeTextual(t,{empresa,aud,sim=0}){
 const n=normal(t),len=t.trim().length,f=[];const add=(rotulo,peso,ganho,nota)=>f.push({rotulo,peso,ganho,nota});
 add('Tamanho adequado',20,len>=60&&len<=420?20:len>0&&len<=600?10:0,len+' caracteres');
 add('Uma pergunta ou próximo passo simples',20,(t.match(/\?/g)||[]).length===1?20:(t.match(/\?/g)||[]).length>1?8:/\b(posso|quer|me diz|me conta|me avisa)\b/.test(n)?14:0,'');
 const nome=normal(empresa?.nome||'').split(' ')[0],serv=(empresa?.servicosOferecidos||[]).map(normal).filter(Boolean),cid=normal(String(empresa?.cidade||'').split(/[-,]/)[0]);
 add('Referência concreta à empresa',20,(nome&&n.includes(nome))||serv.some(s=>n.includes(s))||(cid&&n.includes(cid))?20:0,'');
 add('Sem clichês, urgência ou promessas',20,aud.ok&&!aud.avisos.length?20:aud.ok?12:0,'');
 add('Sem pressão e sem repetição',10,sim<.6&&!/\b(agora|hoje|ultima chance|so ate)\b/.test(n)?10:0,'');
 add('Texto corrido, sem excesso de pontuação',10,!/!{2,}|\n\n|[A-Z]{6,}/.test(t)?10:4,'');
 const nota=f.reduce((s,x)=>s+x.ganho,0);return {nota,de:100,fatores:f,aviso:'Pontuação interna de qualidade do texto. NÃO é probabilidade de resposta ou de venda.'};
}
