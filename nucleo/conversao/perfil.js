/* Perfil comercial da empresa para personalizar mensagens. Separa FATOS (com origem), DESCONHECIDOS e HIPÓTESES. Nada aqui é inventado: o que não consta na ficha fica como desconhecido e a mensagem que dependeria disso não é oferecida. */
import {eventosDaEmpresa} from '../esquema.js';
import {lerPontuacaoPesquisa} from '../pontuacao.js';
import {condicaoVigente,condicaoPadrao} from '../ofertas/condicoes.js';

const NICHOS={
 celulares:{neg:'assistência técnica',negCurto:'assistência',negPlural:'assistências técnicas',busca:'conserto de celular',servicoPadrao:'conserto de celular'},
 odontologia:{neg:'clínica',negCurto:'clínica',negPlural:'clínicas odontológicas',busca:'dentista',servicoPadrao:'consulta'},
 automotivo:{neg:'estética automotiva',negCurto:'estética',negPlural:'estéticas automotivas',busca:'estética automotiva',servicoPadrao:'lavagem e polimento'}
};
const GENERICO={neg:'empresa',negCurto:'loja',negPlural:'pequenas empresas',busca:'o serviço de vocês',servicoPadrao:'atendimento'};
const MINUSC=new Set(['de','da','do','das','dos','e','em','para','pra']);
const reais=c=>'R$ '+(Math.round(c)/100).toLocaleString('pt-BR',{maximumFractionDigits:0});
const baixa=s=>{const t=String(s||'').trim();return t&&!/^[A-Z]{2,}\b/.test(t)?t.charAt(0).toLowerCase()+t.slice(1):t;};

/* "ZAP CELL - Assistência Técnica em Celulares | Joinville" → "Zap Cell". Mantém nomes curtos como estão. */
/* pontuação da pesquisa de prospecção: campo "potencial" ou, na importação em lote, o texto das notas */
export const pesquisaDaEmpresa=empresa=>lerPontuacaoPesquisa(empresa)||lerPontuacaoPesquisa({potencial:empresa.notas||''});
export function nomeCurto(nome){
 let n=String(nome||'').replace(/[®™©️‍]|\p{Extended_Pictographic}/gu,'').replace(/\s+/g,' ').trim();if(!n)return '';
 const GEN=/^(ass?is?t[eê]ncia|conserto|consertos|loja|manuten[cç][aã]o)\b/i,DESC=/\s+(ass?is?t[eê]ncia|assitencia|conserto|consertos|manuten[cç][aã]o)\b.*$/i;
 /* "Descrição genérica | Nome" → fica o nome; "Nome - descrição" → fica o nome */
 const partes=n.split(/\s[|–—]\s|\s-\s|\s-(?=\S)|(?<=\S)-\s|\s\(|\s\/\s/).map(x=>x.trim()).filter(Boolean);
 n=(GEN.test(partes[0])&&/\s(de|em|e|para)\s/i.test(partes[0])&&partes[1]&&!GEN.test(partes[1]))?partes[1]:partes[0]||n;
 const titulo=t=>(t===t.toUpperCase()&&/[A-ZÀ-Ü]{3}/.test(t))?t.toLowerCase().split(' ').map((p,i)=>MINUSC.has(p)&&i?p:(p.replace(/[^a-zà-ü]/g,'').length<=2||!/[aeiouà-ü]/.test(p))?p.toUpperCase():p.charAt(0).toUpperCase()+p.slice(1)).join(' '):t;
 n=titulo(n);
 const cortado=n.replace(DESC,'').trim();
 if(cortado.length>=3&&!GEN.test(cortado)&&cortado!==n){const m=n.slice(cortado.length).match(/^\s+(ass?is?t[eê]ncia\s+t[eé]cnica|assitencia\s+tecnica)/i);n=(cortado.split(' ').length===1&&m)?cortado+' Assistência Técnica':cortado;}
 n=titulo(n); /* nome em maiúsculas seguido de descrição em minúsculas ("GUERRA SMART CELL Assistência...") */
 let palavras=n.split(' ');if(palavras.length>5)palavras=palavras.slice(0,4);
 while(palavras.length>1&&/^(e|&|de|do|da|em|para|ltda\.?|me|conserto|consertos)$/i.test(palavras.at(-1)))palavras.pop();
 return palavras.join(' ').replace(/[\s.,;:\-–]+$/,'');
}
const cidadeLimpa=c=>String(c||'').split(/\s[-–]\s|,|\//)[0].replace(/\s+[A-Z]{2}$/,'').trim();
export function saudacaoDoHorario(agora=Date.now()){const h=new Date(agora).getHours();return h<12?'Bom dia':h<18?'Boa tarde':'Boa noite';}

function lerAvaliacoes(empresa){
 const pr=empresa.presenca||{},q=Number(pr.avaliacoesQtd),n=Number(pr.avaliacoesNota);
 if(Number.isFinite(q)&&q>0)return {qtd:q,nota:Number.isFinite(n)&&n>0?n:null,origem:'ficha (avaliações públicas informadas)'};
 const t=String(empresa.notas||''),m=t.match(/nota\s+(\d[.,]\d)[^.;\n]{0,40}?(\d{2,5})\s+avalia/i)||null;
 if(m)return {qtd:Number(m[2]),nota:Number(m[1].replace(',','.')),origem:'notas da pesquisa'};
 const m2=t.match(/(\d[.,]\d)\s*(?:estrelas|★)[^.;\n]{0,30}?(\d{2,5})\s+avalia/i);
 if(m2)return {qtd:Number(m2[2]),nota:Number(m2[1].replace(',','.')),origem:'notas da pesquisa'};
 return null;
}
function lerSite(empresa){
 const t=String(empresa.notas||'')+' '+String(empresa.evidenciaSite||''),s=String(empresa.site||'').toLowerCase();
 if(empresa.statusSite==='possui')return {id:'possui',rotulo:'possui site próprio',origem:'ficha'};
 if(empresa.statusSite==='desatualizado')return {id:'desatualizado',rotulo:'site desatualizado',origem:'ficha'};
 if(/linktr\.ee|linktree|beacons|bio\.site|canva\.site|contate\.me|wixsite|sites\.google|lovable\.app|netlify\.app/.test(s)||/pagina_gratuita_ou_agregador|p[aá]gina gratuita|agregador de links/i.test(t))return {id:'pagina-gratuita',rotulo:'página gratuita ou agregador de links',origem:s?'ficha (link cadastrado)':'notas da pesquisa'};
 if(empresa.statusSite==='sem-site')return {id:'sem-site',rotulo:'nenhum site próprio encontrado',origem:/evid[eê]ncia/i.test(t)?'ficha (com evidência registrada)':'ficha (sem evidência registrada)'};
 if(/apenas_redes_sociais|apenas redes sociais|s[oó] redes sociais/i.test(t))return {id:'so-redes',rotulo:'apenas redes sociais encontradas',origem:'notas da pesquisa'};
 if(/nenhum_site_achado|nenhum site (pr[oó]prio )?(achado|encontrado)/i.test(t))return {id:'sem-site',rotulo:'nenhum site próprio encontrado',origem:'notas da pesquisa'};
 return {id:'desconhecido',rotulo:'situação do site não verificada',origem:''};
}
const handle=u=>{const m=String(u||'').match(/instagram\.com\/([\w.]+)/i);return m?m[1]:String(u||'').replace(/^@/,'').trim();};

export const PERFIS={
 'ja-tem-site':'Já possui site próprio',
 'site-desatualizado':'Site desatualizado',
 'pagina-gratuita':'Usa página gratuita ou agregador de links',
 'reputacao-forte':'Reputação forte sem site próprio',
 'instagram-ativo':'Presença concentrada no Instagram',
 'poucas-avaliacoes':'Poucas avaliações públicas',
 'servicos-variados':'Muitos serviços para explicar',
 'dados-escassos':'Poucos dados verificados'
};
/* Argumento central por perfil: o que muda de verdade na conversa (benefício, observação e pergunta). */
const ARGUMENTO={
 'reputacao-forte':f=>({beneficio:`mostrar as ${f.avaliacoes.qtd} avaliações e os serviços num lugar que é da ${f.loja}, e não só no Google Maps`,observacao:`a ${f.loja} tem nota ${f.notaTxt} com ${f.avaliacoes.qtd} avaliações, mas isso só aparece pra quem abre o Google Maps`,foco:'credibilidade'}),
 'instagram-ativo':f=>({beneficio:'juntar num link só o que no Instagram fica espalhado: serviços, endereço, horário e pedido de orçamento',observacao:`a ${f.loja} depende do Instagram pra mostrar o trabalho, e quem procura no Google não encontra os serviços organizados`,foco:'organização'}),
 'pagina-gratuita':f=>({beneficio:'trocar a página de links por um site próprio, com os serviços e o botão de orçamento já na primeira tela',observacao:`o link da ${f.loja} leva pra uma página de links, que não mostra os serviços nem as avaliações`,foco:'organização'}),
 'site-desatualizado':f=>({beneficio:'ter um site atual, que abre bem no celular e mostra o que vocês fazem hoje',observacao:`o site da ${f.loja} parece desatualizado em relação aos serviços de hoje`,foco:'atualização'}),
 'poucas-avaliacoes':f=>({beneficio:'apresentar a loja pra quem ainda não conhece: serviços, endereço, horário e contato num lugar só',observacao:`quem ainda não conhece a ${f.loja} encontra pouca informação antes de decidir`,foco:'apresentação'}),
 'servicos-variados':f=>({beneficio:'deixar claro tudo o que vocês fazem, pra o cliente não achar que é só '+(f.s1||'um serviço'),observacao:`a ${f.loja} faz bastante coisa, e hoje o cliente só descobre perguntando`,foco:'clareza'}),
 'ja-tem-site':f=>({beneficio:'revisar o que o site atual poderia fazer melhor',observacao:'',foco:'melhoria'}),
 'dados-escassos':f=>({beneficio:'ter um lugar próprio com serviços, endereço e pedido de orçamento pelo WhatsApp',observacao:'',foco:'descoberta'})
};

export function analisarEmpresa(estado,empresa,{agora=Date.now()}={}){
 const nicho=NICHOS[empresa.nicho]||GENERICO,loja=nomeCurto(empresa.nome),cidade=cidadeLimpa(empresa.cidade);
 const servicos=(empresa.servicosOferecidos||[]).map(s=>baixa(String(s).replace(/[.;]+$/,''))).filter(s=>s&&s.length<=60),diferenciais=(empresa.diferenciais||[]).map(s=>baixa(String(s).replace(/[.;]+$/,''))).filter(s=>s&&s.length<=90);
 const avaliacoes=lerAvaliacoes(empresa),site=lerSite(empresa),pesquisa=pesquisaDaEmpresa(empresa),ig=handle(empresa.instagram),pr=empresa.presenca||{};
 const ev=eventosDaEmpresa(estado,empresa.id),enviadas=ev.filter(e=>e.tipo==='mensagem-enviada'&&!e.revertido),respostas=ev.filter(e=>e.tipo==='resposta'&&!e.revertido);
 const demos=(estado.demonstracoes||[]).filter(d=>d.empresaId===empresa.id),demo=demos.find(d=>d.urlPublica)||null,pubs=(estado.publicacoes||[]).filter(p=>p.empresaId===empresa.id&&!p.arquivada&&p.urlPublica);
 const demoUrl=demo?.urlPublica||pubs[0]?.urlPublica||'';
 const cond=condicaoVigente(estado,agora)?.dados||condicaoPadrao(estado.config.comercial),com=estado.config.comercial||{};
 const notaTxt=avaliacoes?.nota!=null?String(avaliacoes.nota).replace('.',','):'';
 const f={loja,cidade,nicho,servicos,diferenciais,s1:servicos[0]||'',s2:servicos[1]||'',avaliacoes,notaTxt,site,instagram:ig,instagramAtivo:pr.instagramAtivo==='sim',pesquisa};
 /* perfis, do mais específico ao mais genérico */
 const perfis=[];
 if(site.id==='possui')perfis.push('ja-tem-site');
 if(site.id==='desatualizado')perfis.push('site-desatualizado');
 if(site.id==='pagina-gratuita')perfis.push('pagina-gratuita');
 if(avaliacoes&&avaliacoes.nota>=4.7&&avaliacoes.qtd>=150&&site.id!=='possui')perfis.push('reputacao-forte');
 if(ig&&site.id!=='possui')perfis.push('instagram-ativo');
 if(avaliacoes&&avaliacoes.qtd<40)perfis.push('poucas-avaliacoes');
 if(servicos.length>=4)perfis.push('servicos-variados');
 if(!perfis.length)perfis.push('dados-escassos');
 const principal=perfis[0],arg=ARGUMENTO[principal](f);
 /* fatos com origem, desconhecidos e hipóteses */
 const fatos=[],desconhecidos=[];const fato=(rotulo,valor,origem)=>valor?fatos.push({rotulo,valor,origem}):desconhecidos.push(rotulo);
 fato('Nome usado na conversa',loja,'ficha');fato('Cidade',cidade,'ficha');fato('Serviços',servicos.join(', '),'ficha');fato('Diferenciais',diferenciais.join('; '),'ficha');
 fato('Avaliações públicas',avaliacoes?`${avaliacoes.qtd} avaliações${notaTxt?', nota '+notaTxt:''}`:'',avaliacoes?.origem);fato('Instagram',ig?'@'+ig:'','ficha (perfil público, não verificado agora)');
 fato('Situação do site',site.id==='desconhecido'?'':site.rotulo,site.origem);fato('Responsável',empresa.contatoDireto==='sim'?(empresa.contato||'contato direto confirmado'):'',empresa.contato?'ficha':'');
 if(pesquisa)fatos.push({rotulo:'Pesquisa de prospecção',valor:`grupo ${pesquisa.grupo} · potencial ${pesquisa.potencial}/100 · evidência ${pesquisa.evidencia}/100`,origem:'pesquisa (não é probabilidade de compra)'});
 const hipoteses=[];
 if(site.id==='sem-site'||site.id==='so-redes')hipoteses.push('Pode existir um site que não foi encontrado: por isso as mensagens dizem "não achei", nunca "vocês não têm".');
 if(ig&&!f.instagramAtivo)hipoteses.push('O perfil do Instagram consta na ficha, mas a atividade recente não foi verificada.');
 if(empresa.contatoDireto!=='sim')hipoteses.push('Não se sabe se quem responde o WhatsApp decide sobre divulgação.');
 hipoteses.push('O interesse em ter site é desconhecido até a empresa responder.');
 const ultimaResposta=respostas.at(-1)||null,ultimaEnviada=enviadas.at(-1)||null,textoEnviado=enviadas.map(e=>e.texto||'').join(' ');
 const hist={enviadas:enviadas.length,respostas:respostas.length,ultimaResposta,ultimaEnviada,
  precoApresentado:/R\$\s*\d/.test(textoEnviado),demoEnviada:ev.some(e=>e.tipo==='demonstracao-apresentada'&&!e.revertido)||(!!demoUrl&&textoEnviado.includes(demoUrl)),
  propostaEnviada:ev.some(e=>e.tipo==='proposta-enviada'),diasDesdeUltimoEnvio:ultimaEnviada?Math.floor((agora-new Date(ultimaEnviada.quando))/864e5):null,
  familiasUsadas:[...new Set(enviadas.map(e=>e.estrategia).filter(Boolean))],idsUsados:[...new Set(enviadas.map(e=>e.variante).filter(Boolean))],perguntasFeitas:enviadas.map(e=>e.texto||'')};
 const slug=loja.normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase().replace(/[^a-z0-9]/g,'').slice(0,24);
 /* contexto de redação: só o que pode ser dito */
 const ctx={eu:(estado.preferencias?.nome||'Renan').split(' ')[0],oi:saudacaoDoHorario(agora)+'!',loja,cidade,neg:nicho.neg,negCurto:nicho.negCurto,negPlural:nicho.negPlural,busca:nicho.busca,
  s1:f.s1,s2:f.s2,servs:servicos.slice(0,3).join(', ').replace(/, ([^,]*)$/,' e $1'),dif1:diferenciais[0]||'',nota:notaTxt,aval:avaliacoes?.qtd||0,temInsta:!!ig,
  obs:arg.observacao,beneficio:arg.beneficio,demoUrl,temDemo:demos.length>0,slug,
  normal:reais(cond.precoNormalCent),promo:reais(cond.precoPromocionalCent),pix:reais(cond.precoPixCent),suporteDias:cond.suporteDias||30,
  hospDom:[com.hospedagemTexto,com.dominioTexto].filter(Boolean).join(' ')||'Domínio e hospedagem são custos à parte, pagos direto ao provedor, e eu te explico as opções antes de fechar.',
  hospedagem:com.hospedagemTexto||'A hospedagem é um custo à parte, pago direto ao provedor; eu te mostro as opções antes de fechar.',dominio:com.dominioTexto||'O domínio (o endereço do site) é registrado no nome de vocês e pago direto ao registrador; eu cuido da configuração.',
  condicoesInformadas:!!(com.hospedagemTexto&&com.dominioTexto)};
 const tem={servico:!!f.s1,doisServicos:!!f.s2,avaliacoes:!!avaliacoes&&avaliacoes.qtd>=20&&!!notaTxt,instagram:!!ig,diferencial:!!diferenciais[0],cidade:!!cidade,obs:!!arg.observacao,demo:!!demoUrl,temDemoCriada:demos.length>0,
  semSiteAchado:['sem-site','so-redes','pagina-gratuita'].includes(site.id),siteDesatualizado:site.id==='desatualizado',paginaGratuita:site.id==='pagina-gratuita',siteProprio:site.id==='possui',precoVisto:hist.precoApresentado,demoVista:hist.demoEnviada};
 return {empresaId:empresa.id,loja,cidade,nicho:empresa.nicho||'',perfis,principal,rotuloPerfil:PERFIS[principal],argumento:arg,fatos,desconhecidos,hipoteses,avaliacoes,site,pesquisa,hist,ctx,tem};
}
