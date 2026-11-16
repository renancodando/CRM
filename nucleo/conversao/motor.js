/* Motor de conversas do Órbita: interpreta a resposta recebida, decide a etapa pelo histórico inteiro e escolhe até três estratégias realmente diferentes da biblioteca.
   Determinístico e local. Quando a leitura é incerta, diz que é incerta e aceita correção manual (intencaoManual). Nunca envia nada. */
import {eventosDaEmpresa} from '../esquema.js';
import {podeContatar,conv} from './dominio.js';
import {normal,analisarResposta,auditarMensagem} from './linguagem.js';
import {analisarEmpresa} from './perfil.js';
import {ETAPAS,MENSAGENS,OBJECOES,mensagemPorId} from './biblioteca.js';
import {tecnicaPorId,estudoPorId,graus} from './evidencias.js';
import {ajustePorResultados,resultadosPorEstrategia} from './aprendizado.js';
import {similaridade} from '../negociacao/mensagens.js';
export const VERSAO_BIBLIOTECA='b1';

export const INTENCOES={
 parar:'Pediu para não receber mais mensagens',recusa:'Recusou','recusa-suave':'Recusou por enquanto',
 fechamento:'Quer fechar',pagou:'Informou pagamento',desconto:'Pediu desconto',caro:'Achou caro','depende-do-valor':'Perguntou o valor',
 'duvida-pagamento':'Dúvida sobre pagamento','duvida-hospedagem':'Dúvida sobre hospedagem','duvida-dominio':'Dúvida sobre domínio','duvida-manutencao':'Dúvida sobre manutenção','como-funciona':'Perguntou como funciona',
 'ja-tem-site':'Disse que já tem site','instagram-basta':'Disse que o Instagram basta','sem-dinheiro':'Sem dinheiro agora',momento:'Agora não / época complicada','sem-tempo':'Sem tempo',
 socio:'Precisa falar com outra pessoa','vou-pensar':'Vai pensar',desconfianca:'Desconfiança','sem-necessidade':'Não vê necessidade','conhecido-faz':'Um conhecido faz',
 gostou:'Gostou','nao-gostou':'Não gostou da prévia','pediu-demo':'Pediu para ver / autorizou o envio',permitiu:'Deu abertura para continuar','confundiu-cliente':'Achou que era cliente','como-ajudar':'Perguntou como pode ajudar',
 'respondeu-pergunta':'Respondeu à pergunta',vaga:'Resposta curta ou vaga',indefinida:'Não consegui interpretar'
};
/* ordem = prioridade. Cada regra: [intenção, expressão sobre o texto normalizado (sem acento, minúsculo)] */
const REGRAS=[
 ['fechamento',/\b(fechado|vamos fechar|bora fechar|pode fazer|pode comecar|quero contratar|quero fechar|quero o site|quero sim|manda (a |o )?(chave|pix)|qual (a |o )?(chave|pix)|como (eu )?(faco pra |faco para )?pag(o|ar))\b/],
 ['pagou',/\b(paguei|fiz o pix|ja fiz o pix|transferi|mandei o comprovante|segue o comprovante|pix feito)\b/],
 ['desconto',/\b(desconto|faz por|abaixa|baixar o valor|mais barato|ultimo preco|melhor preco|tem como (baixar|fazer por|melhorar))\b/],
 ['caro',/\b(muito caro|esta caro|ta caro|caro demais|achei caro|valor alto|salgado|puxado|pesado)\b/],
 ['duvida-hospedagem',/\b(hospedagem|hospedar|servidor|onde fica hospedado)\b/],
 ['duvida-dominio',/\b(dominio|endereco do site|ponto com|com br|registro br|nome do site)\b/],
 ['duvida-manutencao',/\b(manutencao|suporte|se der problema|alterar depois|mudar depois|atualizar depois|e se eu quiser mudar)\b/],
 ['duvida-pagamento',/\b(mensalidade|mensal|todo mes|parcel|cartao|boleto|forma de pagamento|formas de pagamento|como e o pagamento|paga como|a vista)\b/],
 ['depende-do-valor',/\b(quanto|qual (e )?(o )?valor|valor\b|preco|custa|custo|investimento|orcamento do site|depende do valor|depende do preco)\b/],
 ['ja-tem-site',/(?<!\b(nao|nem|nunca|ainda nao) )\b(ja tenho (um )?site|ja temos (um )?site|tenho site|temos site|ja possuo site|ja possuimos)\b/],
 ['instagram-basta',/(?<!\b(nao|nem|nunca) )\b(so uso (o )?insta|uso (so )?(o )?instagram|instagram (ja )?(basta|resolve|e suficiente|da conta)|ja tenho (o )?insta|tenho instagram|pelo insta mesmo|so instagram)\b/],
 ['sem-dinheiro',/\b(sem dinheiro|nao tenho dinheiro|sem grana|sem condicoes|nao posso pagar|sem verba|orcamento apertado|apertado|sem caixa|nao cabe no bolso)\b/],
 ['sem-tempo',/\b(sem tempo|nao tenho tempo|corrido|correria|ocupado|ocupada|atarefad|cheio de servico|muito servico)\b/],
 ['momento',/\b(fim de ano|final de ano|agora nao|no momento nao|por enquanto nao|mes complicado|periodo complicado|mais pra frente|mais para frente|depois a gente ve|outra hora|ano que vem|mes que vem|depois do carnaval)\b/],
 ['socio',/\b(socio|socia|meu marido|minha esposa|meu pai|minha mae|meu chefe|o dono|a dona|proprietario|nao sou eu que|nao e comigo|falar com (o|a) )\b/],
 ['vou-pensar',/\b(vou pensar|deixa eu pensar|vou ver|te aviso|depois eu vejo|vou analisar|qualquer coisa (eu )?(te )?(chamo|aviso|falo))\b/],
 ['desconfianca',/\b(golpe|fraude|nao confio|desconfi|e seguro|e confiavel|quem e voce|de onde voce|como conseguiu meu numero|onde pegou meu)\b/],
 ['conhecido-faz',/\b(sobrinho|meu primo|meu filho|minha filha|um amigo faz|conhecido faz|ja tenho quem faca|ja tem quem faz)\b/],
 ['sem-necessidade',/\b(nao vejo necessidade|nao preciso de site|nao precisa|movimento (esta|ta) bom|ja tenho cliente|nao sinto falta)\b/],
 ['nao-gostou',/\b(nao gostei|nao curti|nao ficou (muito )?(bom|legal|bonito)|achei feio|ficou feio|ficou estranho|nao me agradou|nao achei (muito )?(bom|legal|bonito)|nao (e|era) (bem )?(isso|o que eu))\b/],
 ['gostou',/(?<!\b(nao|nem|nunca) )\b(gostei|adorei|amei|curti|ficou (muito )?(bom|bonito|legal|top|otimo|lindo|show|massa|bacana|profissional)|achei (muito )?(bom|bonito|legal|top|otimo)|muito bom|ficou show|parabens)\b/],
 ['pediu-demo',/\b(pode mandar|manda ai|manda sim|pode enviar|envia|me mostra|mostra ai|quero ver|deixa eu ver|tem (algum )?(exemplo|modelo)|manda o link|pode fazer a previa|faz ai)\b/],
 ['como-funciona',/\b(como funciona|como seria|como e isso|explica melhor|pode explicar|me explica|como voce faz)\b/],
 ['confundiu-cliente',/\b(qual (o |e o )?(aparelho|modelo|celular|defeito|problema)|o que (aconteceu|houve) com|traz aqui|pode trazer|qual marca)\b/],
 ['como-ajudar',/\b(como posso (te )?ajudar|em que posso|posso ajudar|pois nao|do que se trata|qual seria|sobre o que|quem fala|quem e\b|pode falar|diga|fala ai|pode dizer)\b/],
 ['permitiu',/^(pode|pode sim|claro|sim|sim pode|pode perguntar|pode contar|conta|conta ai|manda|opa|opa pode|sim claro|uhum|ok pode|pode ser|fala)\b/],
 ['respondeu-pergunta',/\b(google|instagram|insta|indicacao|boca a boca|passando na frente|whatsapp|zap|facebook|ainda nao|nao temos|nao tenho site|nao tem site|mais conserto|mais venda|troca de tela|bateria|a maioria|geralmente|normalmente)\b/],
 ['vaga',/^(oi|ola|ok|bom dia|boa tarde|boa noite|tudo bem|tudo sim|blz|beleza|opa|e ai)( tudo bem)?\??$/]
];
export function interpretar(texto,{manual=''}={}){
 const n=normal(texto),a=analisarResposta(texto);
 if(manual&&INTENCOES[manual])return {intencao:manual,rotulo:INTENCOES[manual],confianca:'informada por você',incerta:false,sinais:[],candidatas:[manual],analise:a,manual:true};
 if(!n)return {intencao:'indefinida',rotulo:INTENCOES.indefinida,confianca:'baixa',incerta:true,sinais:[],candidatas:[],analise:a};
 if(a.pediuParar)return {intencao:'parar',rotulo:INTENCOES.parar,confianca:'alta',incerta:false,sinais:[a.trecho],candidatas:['parar'],analise:a};
 if(a.recusaClara){const suave=/\b(agora|no momento|por enquanto|por ora|ainda nao|hoje nao)\b/.test(n);return {intencao:suave?'recusa-suave':'recusa',rotulo:INTENCOES[suave?'recusa-suave':'recusa'],confianca:suave?'media':'alta',incerta:false,sinais:[a.trecho],candidatas:suave?['recusa-suave','momento','recusa']:['recusa'],analise:a};}
 const achadas=[];for(const [id,re] of REGRAS){const m=n.match(re);if(m)achadas.push({id,trecho:m[0]});}
 if(!achadas.length)return {intencao:'indefinida',rotulo:INTENCOES.indefinida,confianca:'baixa',incerta:true,sinais:[],candidatas:['respondeu-pergunta','como-ajudar','vaga'],analise:a};
 const principal=achadas[0],fortes=['fechamento','pagou','desconto','caro','depende-do-valor','ja-tem-site','gostou','pediu-demo','duvida-hospedagem','duvida-dominio','duvida-manutencao','duvida-pagamento'];
 const palavras=n.split(' ').length,incerta=achadas.length>=3||(['permitiu','vaga','respondeu-pergunta'].includes(principal.id)&&palavras>12);
 return {intencao:principal.id,rotulo:INTENCOES[principal.id],confianca:incerta?'baixa':fortes.includes(principal.id)&&achadas.length===1?'alta':'media',incerta,sinais:achadas.map(x=>x.trecho),candidatas:[...new Set(achadas.map(x=>x.id))].slice(0,4),analise:a};
}
/* ---------- etapa pela conversa inteira ---------- */
const OBJ_POR_INTENCAO={desconto:'desconto',caro:'caro','depende-do-valor':'depende-do-valor','duvida-pagamento':'duvida-pagamento','duvida-hospedagem':'duvida-hospedagem','duvida-dominio':'duvida-dominio','duvida-manutencao':'duvida-manutencao','como-funciona':'como-funciona','ja-tem-site':'ja-tem-site','instagram-basta':'instagram-basta','sem-dinheiro':'sem-dinheiro',momento:'momento','sem-tempo':'sem-tempo',socio:'socio','vou-pensar':'vou-pensar',desconfianca:'desconfianca','sem-necessidade':'sem-necessidade','conhecido-faz':'conhecido-faz','nao-gostou':'nao-gostou',recusa:'sem-interesse','recusa-suave':'sem-interesse'};
export function decidirEtapa(estado,empresa,perfil,{agora=Date.now(),intencaoManual='',respostaPendente=''}={}){
 const pend=String(respostaPendente||'').trim(),h=pend?{...perfil.hist,respostas:perfil.hist.respostas+1,ultimaResposta:{texto:pend}}:perfil.hist,follow=conv(estado).config.follow,ev=eventosDaEmpresa(estado,empresa.id).filter(e=>!e.revertido&&['mensagem-enviada','resposta'].includes(e.tipo)),ult=ev.at(-1)||null;
 const base={interpretacao:null,aguardar:false,encerrar:false,motivo:'',preferidas:[],excluidas:[],condicoes:[]};
 if(empresa.etapa==='fechada')return {...base,chave:'pos-venda',motivo:'Venda registrada: a conversa agora é de pós-venda e indicação.'};
 if(!h.enviadas&&!h.respostas)return {...base,chave:'primeiro-contato',preferidas:perfil.tem.demo?['pc-previa-pronta']:[],motivo:perfil.tem.demo?'Nenhuma mensagem confirmada para esta empresa. Já existe uma prévia publicada: oferecer para mostrar é o pedido mais concreto.':'Nenhuma mensagem confirmada para esta empresa.'};
 if(ult?.tipo==='resposta'||intencaoManual||pend){
  let it=interpretar(h.ultimaResposta?.texto||'',{manual:intencaoManual||(!pend&&h.ultimaResposta?.intencaoInformada)||''});
  /* "pode fazer", "quero sim" antes de qualquer preço ou prévia é permissão para mostrar, não fechamento */
  if(it.intencao==='fechamento'&&!it.manual&&!h.precoApresentado&&!h.demoEnviada&&!/\b(fechado|fechar|contratar|pix|pag(o|ar|amento))\b/.test(normal(h.ultimaResposta?.texto||'')))it={...it,intencao:'pediu-demo',rotulo:INTENCOES['pediu-demo'],confianca:'media',sinais:[...it.sinais,'ainda sem preço nem prévia nesta conversa']};
  const ultMinha=normal(h.ultimaEnviada?.texto||''),ultId=h.ultimaEnviada?.estrategia||'';
  /* "pode", "sim" logo depois de eu oferecer mostrar a prévia é autorização para mostrar */
  if(it.intencao==='permitiu'&&!it.manual&&!['pc-observacao','fu-observacao'].includes(ultId)&&/\b(previa|link|te mostr|mostrar|exemplo|como ficaria)\b/.test(ultMinha))it={...it,intencao:'pediu-demo',rotulo:INTENCOES['pediu-demo'],sinais:[...it.sinais,'veio depois de você oferecer mostrar']};
  /* resposta que nenhuma regra reconhece, logo depois de uma pergunta minha, provavelmente é a resposta a essa pergunta: segue incerta e corrigível */
  if(it.intencao==='indefinida'&&!it.manual&&/\?/.test(h.ultimaEnviada?.texto||'')&&normal(h.ultimaResposta?.texto||'').split(' ').length>=3)it={...it,intencao:'respondeu-pergunta',rotulo:INTENCOES['respondeu-pergunta'],confianca:'baixa',incerta:true,sinais:['veio depois de uma pergunta sua']};
  const semObs=['pc-observacao','fu-observacao'].includes(ultId)?[]:['ra-observacao'],semPrevia=perfil.tem.demo?['ra-previa']:['ra-previa-pronta'];
  const i=it.intencao,r={...base,interpretacao:it};
  if(i==='parar')return {...r,chave:'',encerrar:true,motivo:'A empresa pediu para parar. Registre a resposta: o contato será bloqueado. Nenhuma mensagem é sugerida.'};
  if(i==='recusa'||i==='recusa-suave')return {...r,chave:'objecao:sem-interesse',encerrar:true,condicoes:[i==='recusa-suave'?'recusa-suave':'recusa-firme'],motivo:i==='recusa'?'Recusa clara: só uma despedida cordial é adequada. Depois disso, não envie mais nada.':'Recusa por enquanto: despedida cordial; só volte se a própria empresa autorizar um contato futuro.'};
  if(i==='pagou')return {...r,chave:'fechamento',preferidas:['fc-recebido','fc-dados'],motivo:'A empresa informou o pagamento: confira na sua conta antes de confirmar.'};
  if(i==='fechamento')return {...r,chave:'fechamento',preferidas:h.precoApresentado?['fc-passos','fc-resumo','fc-forma']:['fc-resumo','fc-forma','fc-passos'],excluidas:['fc-recebido','fc-proposta','fc-duvida','fc-limite'],motivo:'Sinal de fechamento: confirmar o combinado e os próximos passos, sem reabrir a venda.'};
  if(i==='depende-do-valor'){const c=h.demoEnviada?'com-demo':'sem-demo',p=h.precoApresentado?'preco-ja-dito':'preco-novo';return {...r,chave:'objecao:depende-do-valor',condicoes:[c,p],preferidas:h.precoApresentado?['ov-confirma','ov-o-que-pesa']:h.demoEnviada?['ov-apos-demo']:['ov-direto-previa'],motivo:h.precoApresentado?`O valor já foi informado nesta conversa${h.propostaEnviada?' e a proposta já foi enviada':''}: não repita a apresentação. Confirme o mesmo valor e descubra o que pesa na decisão. ${h.demoEnviada?'A prévia já foi enviada.':'A empresa ainda não viu a prévia.'}`:`Perguntou o valor: responda direto, sem rodeios. ${h.demoEnviada?'A prévia já foi enviada, então o valor é do site que ela conhece.':'Ainda não viu a prévia: informe o valor e ofereça mostrar.'}`};}
  if(i==='ja-tem-site')return {...r,chave:'objecao:ja-tem-site',condicoes:[perfil.tem.siteProprio||perfil.tem.siteDesatualizado?'site-conhecido':'site-desconhecido'],motivo:perfil.tem.siteProprio||perfil.tem.siteDesatualizado?'A ficha registra um site: fale só do que você realmente viu nele.':'A ficha não registra site: antes de argumentar, descubra qual é e olhe.'};
  if(OBJ_POR_INTENCAO[i])return {...r,chave:'objecao:'+OBJ_POR_INTENCAO[i],motivo:`${OBJECOES[OBJ_POR_INTENCAO[i]].tipo==='duvida'?'Dúvida objetiva: responda o que foi perguntado antes de qualquer outra coisa.':'Objeção: entender o motivo antes de argumentar; desconto não é a primeira resposta.'}`};
  if(i==='gostou')return {...r,chave:'gostou',preferidas:h.precoApresentado?['gs-seguir','gs-proposta','gs-o-que']:['gs-ajustes','gs-preco','gs-o-que'],excluidas:h.precoApresentado?['gs-preco']:[],motivo:h.demoEnviada?'Elogio depois da prévia: transformar em próximo passo.':'Resposta positiva: avançar um passo.'};
  if(i==='pediu-demo')return perfil.tem.demo?{...r,chave:'enviar-demo',motivo:'A empresa autorizou e a prévia está publicada: envie o link com uma pergunta específica.'}:{...r,chave:'pedir-demo',preferidas:['pd-prazo','pd-insumo','pd-foco'],excluidas:['pd-pronta','pd-simples','pd-mostrar','pd-curiosidade','pd-seguranca'],motivo:'A empresa quer ver, mas ainda não há prévia publicada: combine o prazo e crie no Estúdio.'};
  if(i==='confundiu-cliente')return {...r,chave:'respondeu',preferidas:['ra-esclarece'],motivo:'A empresa entendeu que você é cliente: esclareça já, para não criar falsa expectativa.'};
  if(i==='permitiu'&&['pc-observacao','fu-observacao'].includes(ultId)&&perfil.tem.obs)return {...r,chave:'respondeu',preferidas:['ra-observacao'],motivo:'Ela deu abertura depois da sua observação: entregue agora o que você prometeu contar.'};
  if(h.demoEnviada)return {...r,chave:h.precoApresentado?'fechamento':'gostou',preferidas:h.precoApresentado?['fc-falta-algo','fc-duvida']:['gs-o-que','gs-mandaria','gs-ajustes'],excluidas:['fc-recebido','fc-proposta','fc-passos'],motivo:'A prévia já foi enviada: a conversa continua a partir dela, sem recomeçar a apresentação.'};
  if(h.respostas>=3)return {...r,chave:'pedir-demo',motivo:'Já houve conversa suficiente: o próximo passo natural é mostrar a prévia.'};
  if(h.respostas===2)return {...r,chave:i==='respondeu-pergunta'?'beneficios':'apresentar-trabalho',excluidas:perfil.tem.demo?['at-processo','at-ver-antes','at-sem-trabalho']:[],motivo:'Segunda resposta: ligar o que ela contou ao que o site resolve, em poucas linhas.'};
  if(i==='respondeu-pergunta')return {...r,chave:'respondeu',preferidas:['ra-ponte','ra-reputacao','ra-insta','ra-dor'],excluidas:['ra-esclarece','ra-direto',...semObs,...semPrevia],motivo:'Ela respondeu à sua pergunta: reconheça a resposta e diga por que perguntou.'+(it.incerta?' Leitura incerta: confira a resposta e corrija a interpretação se preciso.':'')};
  if(i==='como-ajudar'||i==='vaga'||i==='permitiu')return {...r,chave:'respondeu',preferidas:perfil.tem.demo?['ra-previa-pronta','ra-direto','ra-resumo']:['ra-direto','ra-resumo','ra-formato'],excluidas:['ra-esclarece','ra-ponte',...semObs,...semPrevia],motivo:perfil.tem.demo?'Ela abriu espaço e a prévia já está publicada: diga o motivo do contato e peça para mandar o link.':'Ela abriu espaço: diga o motivo do contato com clareza e faça uma pergunta.'};
  return {...r,chave:'respondeu',excluidas:['ra-esclarece',...semObs,...semPrevia],motivo:'Não consegui interpretar com segurança: leia a resposta e, se preciso, corrija a interpretação abaixo.'};
 }
 /* última mensagem foi minha */
 const dias=h.diasDesdeUltimoEnvio??0,esperar=follow.intervalosDias[Math.min(Math.max(h.enviadas-1,0),follow.intervalosDias.length-1)]??3;
 if(!h.respostas){
  if(h.enviadas>follow.maxTentativas)return {...base,chave:'',encerrar:true,aguardar:true,motivo:`Já foram ${h.enviadas} mensagens sem resposta (limite de ${follow.maxTentativas} follow-ups). Insistir vira spam: encerre esta prospecção.`};
  if(dias<esperar)return {...base,chave:h.demoEnviada?'demo-sem-retorno':'retomar-contato',aguardar:true,motivo:`Melhor aguardar: a última mensagem foi há ${dias} dia(s) e o intervalo combinado é de ${esperar}.`};
  return {...base,chave:h.demoEnviada?'demo-sem-retorno':'retomar-contato',preferidas:h.enviadas>=follow.maxTentativas?[h.demoEnviada?'vn-encerrar':'fu-retirada']:[],motivo:h.enviadas>=follow.maxTentativas?'Última tentativa: uma retirada respeitosa fecha o ciclo e deixa a porta aberta.':'Sem resposta: uma nova tentativa com outro ângulo, sem cobrar leitura.'};
 }
 if(dias<esperar)return {...base,chave:h.demoEnviada?'demo-sem-retorno':'recuperar',aguardar:true,motivo:`Melhor aguardar: você respondeu há ${dias} dia(s) e a empresa ainda pode retornar (intervalo de ${esperar} dia(s)).`};
 return {...base,chave:h.demoEnviada?'demo-sem-retorno':'recuperar',motivo:'A empresa respondeu antes e a conversa parou: retomar com respeito, sem recomeçar do zero.'};
}
/* ---------- seleção ---------- */
const listaDe=chave=>chave.startsWith('objecao:')?(OBJECOES[chave.slice(8)]?.respostas||[]):(MENSAGENS[chave]||[]);
export const rotuloDaChave=chave=>chave.startsWith('objecao:')?(OBJECOES[chave.slice(8)]?.rotulo||chave):(ETAPAS[chave]?.rotulo||chave);
const MAPA_EXPERIMENTO={direta:'pc-direta',consultiva:'pc-canal',demonstracao:'pc-previa-pronta',diagnostico:'pc-observacao','baixo-atrito':'pc-curta',autonomia:'pc-permissao'};
function fatosUsados(m,perfil){const rot={servico:'serviços',doisServicos:'serviços',avaliacoes:'avaliações públicas',instagram:'Instagram',diferencial:'diferencial',cidade:'cidade',obs:'observação do perfil',demo:'prévia publicada',semSiteAchado:'situação do site',siteDesatualizado:'situação do site',paginaGratuita:'página de links',precoVisto:'preço já informado',demoVista:'prévia já enviada'};return [...new Set(m.req.map(r=>rot[r]).filter(Boolean))];}
export function selecionar(estado,empresa,chave,{perfil=null,agora=Date.now(),rodada=0,preferidas=[],excluidas=[],condicoes=[],max=3}={}){
 perfil=perfil||analisarEmpresa(estado,empresa,{agora});const c=perfil.ctx,tem=perfil.tem,h=perfil.hist;
 const jaDitas=h.perguntasFeitas.slice(-6),resultados=chave==='primeiro-contato'?resultadosPorEstrategia(estado,{agora}):null;
 const cand=[];
 for(const m of listaDe(chave)){
  if(excluidas.includes(m.id))continue;
  if(m.soSe&&![].concat(m.soSe).every(k=>condicoes.includes(k)))continue;
  if(!m.req.every(r=>tem[r]))continue;
  if(h.idsUsados.includes(m.id)||h.familiasUsadas.includes(m.id))continue;
  const texto=m.f(c).replace(/\s+/g,' ').trim();
  if(jaDitas.some(t=>similaridade(texto,t)>=.55))continue;
  const aud=auditarMensagem(texto,{primeiraMensagem:chave==='primeiro-contato'});if(!aud.ok)continue;
  const afin=m.perfis.includes(perfil.principal)?3:m.perfis.some(p=>perfil.perfis.includes(p))?2:m.perfis.includes('*')?1:0;if(!afin)continue;
  const pref=preferidas.indexOf(m.id),aj=chave==='primeiro-contato'?ajustePorResultados(estado,m.id,{agora,resultados}):{bonus:0,usado:false,texto:''};
  const pontos=afin+fatosUsados(m,perfil).length*.5+(pref>=0?4-pref*.5:0)+aj.bonus;
  cand.push({m,texto,aud,afin,pontos,aj});
 }
 cand.sort((a,b)=>b.pontos-a.pontos||0);
 if(!cand.length)return [];
 /* diversidade: cada alternativa seguinte é a que menos repete técnicas das já escolhidas */
 const inicio=rodada%cand.length,escolhidas=[cand[inicio]];
 const resto=cand.filter((_,i)=>i!==inicio);
 while(escolhidas.length<max&&resto.length){
  const usadas=new Set(escolhidas.flatMap(x=>x.m.tec));
  resto.sort((a,b)=>(a.m.tec.filter(t=>usadas.has(t)).length-b.m.tec.filter(t=>usadas.has(t)).length)||b.pontos-a.pontos);
  escolhidas.push(resto.shift());
 }
 return escolhidas.map((x,i)=>{
  const tecnicas=x.m.tec.map(id=>{const t=tecnicaPorId(id);return t?{id,nome:t.nome,grau:graus[t.grau]}:null;}).filter(Boolean);
  const evidencias=[...new Set(x.m.tec.flatMap(id=>tecnicaPorId(id)?.evidencias||[]))].map(id=>{const e=estudoPorId(id);return e?{id,ref:`${e.autores} (${e.ano})`,grau:graus[e.grau],limitacoes:e.limitacoes}:null;}).filter(Boolean);
  const usados=fatosUsados(x.m,perfil);
  const porque=`${x.m.nome}. ${i===0?(x.afin===3?`Combina com o perfil desta empresa (${perfil.rotuloPerfil.toLowerCase()}).`:'É a que melhor se encaixa nos dados disponíveis.'):'Estratégia diferente da recomendada.'}${usados.length?' Usa: '+usados.join(', ')+'.':''}${x.aj.usado?' '+x.aj.texto:''}${x.m.cuidado?' Atenção: '+x.m.cuidado:''}`;
  return {rotulo:i===0?'Recomendada':'Opção '+(i+1),texto:x.texto,porque,nome:x.m.nome,estrategia:x.m.id,variante:x.m.id,tipo:chave,mensagemId:x.m.id,tecnicas,evidencias,cuidado:x.m.cuidado,auditoria:x.aud,fatosUsados:usados,resultados:x.aj.texto,preferida:preferidas.includes(x.m.id),pontosNegativos:[]};
 });
}
/* ---------- recomendação completa ---------- */
export function recomendar(estado,empresa,{agora=Date.now(),rodada=0,intencaoManual='',etapaManual='',experimentoSorteado=null,respostaPendente=''}={}){
 const perm=podeContatar(empresa,'whatsapp'),perfil=analisarEmpresa(estado,empresa,{agora});
 const out={bloqueado:!perm.ok,motivoBloqueio:perm.ok?'':perm.motivo,perfil,etapa:null,alternativas:[],aguardar:false,encerrar:false,motivo:'',interpretacao:null};
 if(!perm.ok)return out;
 const d=etapaManual?{chave:etapaManual,interpretacao:null,aguardar:false,encerrar:false,motivo:'Situação escolhida por você.',preferidas:[],excluidas:[],condicoes:[perfil.hist.demoEnviada?'com-demo':'sem-demo',perfil.hist.precoApresentado?'preco-ja-dito':'preco-novo',perfil.tem.siteProprio||perfil.tem.siteDesatualizado?'site-conhecido':'site-desconhecido','recusa-suave']}:decidirEtapa(estado,empresa,perfil,{agora,intencaoManual,respostaPendente});
 Object.assign(out,{etapa:d.chave?{chave:d.chave,rotulo:rotuloDaChave(d.chave),objetivo:d.chave.startsWith('objecao:')?'Responder com respeito ao que a empresa disse.':ETAPAS[d.chave]?.objetivo||''}:null,aguardar:d.aguardar,encerrar:d.encerrar,motivo:d.motivo,interpretacao:d.interpretacao});
 if(perfil.tem.siteProprio&&d.chave==='primeiro-contato'){out.avisoPerfil='A ficha diz que a empresa já possui site: confira antes de abordar; a prospecção pode não fazer sentido.';}
 if(!d.chave||(d.aguardar&&!etapaManual))return out;
 let preferidas=d.preferidas;
 if(experimentoSorteado&&d.chave==='primeiro-contato'){const alvo=mensagemPorId(experimentoSorteado.abordagem)?experimentoSorteado.abordagem:MAPA_EXPERIMENTO[experimentoSorteado.abordagem];if(alvo)preferidas=[alvo];}
 out.alternativas=selecionar(estado,empresa,d.chave,{perfil,agora,rodada,preferidas,excluidas:d.excluidas,condicoes:d.condicoes});
 if(d.encerrar)out.alternativas=out.alternativas.slice(0,3).map((a,i)=>({...a,rotulo:i===0?'Despedida':'Opção '+(i+1),despedida:true}));
 return out;
}
