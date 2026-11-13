export const tiposMensagem=[
 ['primeiro-contato','Primeiro contato'],['pergunta-inicial','Pergunta inicial sobre a empresa'],['proprietario','Abordagem ao proprietário'],['necessidades','Investigar necessidades'],['apresentar-site','Apresentar um site já desenvolvido'],['enviar-demo','Enviar demonstração'],['sem-resposta-demo','Visualizou e não respondeu'],['interessado','Cliente interessado'],['objecao-preco','Objeção de preço'],['sem-investir','Não pode investir agora'],['condicao','Apresentar a condição comercial'],['retomada','Retomar negociação'],['fechamento','Fechamento'],['pos-venda','Pós-venda']
];
const reais=v=>'R$ '+Number(v).toLocaleString('pt-BR',{maximumFractionDigits:0});
const nichoTxt={celulares:{negocio:'assistência técnica',plural:'assistências técnicas',cliente:'quem precisa consertar o celular'},odontologia:{negocio:'clínica',plural:'clínicas',cliente:'pacientes'},automotivo:{negocio:'estética automotiva',plural:'estéticas automotivas',cliente:'quem quer cuidar do carro'}};
const primeiroNome=n=>String(n||'').trim().split(/\s+/)[0]||'';
const juntar=(l)=>l.length<=1?l[0]||'':l.slice(0,-1).join(', ')+' e '+l.at(-1);
const baixa=s=>s?s.charAt(0).toLowerCase()+s.slice(1):s;
export function contextoMensagem(empresa,{demo,proposta,comercial,ultimaResposta,marca,autor}={}){
 const n=nichoTxt[empresa.nicho]||{negocio:'empresa',plural:'negócios locais',cliente:'seus clientes'};
 const dif=empresa.diferenciais.slice(0,3).map(baixa);
 return {autor:autor||'Renan',plural:n.plural,nome:empresa.nome,pessoa:primeiroNome(empresa.contato),cidade:String(empresa.cidade||'').split(/[-,/]/)[0].trim(),negocio:n.negocio,cliente:n.cliente,dif,difTexto:dif.length?juntar(dif):'',link:demo?.urlPublica||'',demoNome:demo?.nome||'',valorNormal:comercial?.precoNormal,valorPromo:comercial?.precoPromocional,valorPix:comercial?.precoPix,parcelas:comercial?.parcelasMax,suporte:comercial?.suporte||'',proposta,resposta:ultimaResposta||'',assinatura:marca||''};
}
const oi=(c,v)=>[`Oi${c.pessoa?', '+c.pessoa:''}, tudo bem?`,`Olá${c.pessoa?', '+c.pessoa:''}! Tudo bem?`,`${c.pessoa?c.pessoa+', ':''}tudo bem por aí?`][v%3].replace(/^, /,'');
const com=(c)=>c.difTexto?`Pelo que percebi do trabalho de vocês, ${c.difTexto} aparecem como pontos fortes.`:'';
const modelosTexto={
 'primeiro-contato':[
  c=>`${oi(c,0)} Aqui é ${c.autor}, desenvolvo sites para ${c.plural}${c.cidade?' em '+c.cidade:''}. Vi a ${c.nome} e queria entender: vocês já têm um site próprio hoje?`,
  c=>`${oi(c,1)} Me chamo ${c.autor} e trabalho criando sites para ${c.plural}. Estava conhecendo a ${c.nome} e fiquei curioso: o pessoal costuma encontrar vocês pela internet ou mais por indicação?`,
  c=>`${oi(c,2)} Sou ${c.autor}, faço sites para ${c.plural}. ${com(c)||`Conheci a ${c.nome} e achei que um site bem feito poderia ajudar ${c.cliente} a chegar até vocês.`} Posso te fazer uma pergunta rápida?`],
 'pergunta-inicial':[
  c=>`${oi(c,0)} Antes de qualquer coisa, queria entender melhor a ${c.nome}: hoje, como novos clientes costumam chegar até vocês?`,
  c=>`${oi(c,1)} Estou conhecendo o trabalho da ${c.nome}. Posso te perguntar como vocês recebem a maioria dos contatos hoje — Instagram, WhatsApp, indicação?`,
  c=>`${oi(c,2)} Uma dúvida rápida: a ${c.nome} já tem um site ou hoje o atendimento é só pelas redes e WhatsApp?`],
 'proprietario':[
  c=>`${oi(c,0)} Estou falando com o responsável pela ${c.nome}? Se não for você, poderia me indicar quem cuida da divulgação da empresa? É um assunto rápido sobre presença na internet.`,
  c=>`${oi(c,1)} Procuro o proprietário ou a pessoa que decide sobre a divulgação da ${c.nome}. Seria você? Queria mostrar uma ideia de site, sem compromisso.`,
  c=>`${oi(c,2)} Poderia me ajudar a falar com quem cuida da parte de marketing e site da ${c.nome}? Tenho uma ideia que pode ser útil para o negócio.`],
 'necessidades':[
  c=>`${oi(c,0)} Para eu não te mandar nada genérico, me conta: o que seria mais importante num site da ${c.nome} — receber mais pedidos de orçamento, mostrar os serviços ou passar mais confiança?`,
  c=>`${oi(c,1)} Se a ${c.nome} tivesse um site hoje, o que você gostaria que ele resolvesse primeiro? Assim eu preparo algo realmente pensado para vocês.`,
  c=>`${oi(c,2)} Qual é a maior dificuldade para ${c.cliente} encontrar e entrar em contato com a ${c.nome} hoje?`],
 'apresentar-site':[
  c=>`${oi(c,0)} Já deixei pronta uma ideia de site para a ${c.nome}${c.difTexto?', destacando '+c.difTexto:''}. Posso te mandar o link para você dar uma olhada, sem compromisso?`,
  c=>`${oi(c,1)} Montei uma demonstração de site pensando na ${c.nome}${c.difTexto?' e em '+c.difTexto:''}. Quer ver? É só te enviar o link.`,
  c=>`${oi(c,2)} Preparei um exemplo de como a ${c.nome} poderia aparecer na internet. Se fizer sentido, te mando o link e você me diz o que achou.`],
 'enviar-demo':[
  c=>`${oi(c,0)} Segue o site que preparei para a ${c.nome}: ${c.link||'[inserir o link publicado]'} . ${c.difTexto?`Destaquei ${c.difTexto}. `:''}Dá uma olhada e me conta o que achou, ajusto o que precisar.`,
  c=>`${oi(c,1)} Aqui está a demonstração: ${c.link||'[inserir o link publicado]'} . Abre bem no celular também. O que você mudaria?`,
  c=>`${oi(c,2)} Terminei a demonstração do site da ${c.nome}: ${c.link||'[inserir o link publicado]'} . Fica à vontade para dizer o que gostou e o que quer diferente.`],
 'sem-resposta-demo':[
  c=>`${oi(c,0)} Passando para saber se você conseguiu ver o site que enviei para a ${c.nome}. Se algo não ficou claro ou quiser mudar alguma parte, me avisa.`,
  c=>`${oi(c,1)} Queria saber o que você achou da demonstração${c.link?' ('+c.link+')':''}. Se preferir, posso explicar por aqui os pontos principais.`,
  c=>`${oi(c,2)} Sei que o dia a dia é corrido. Se der, me diz só se o site faz sentido para a ${c.nome} ou se prefere outra direção. Sem pressão.`],
 'interessado':[
  c=>`${oi(c,0)} Que bom que gostou! Para eu ajustar certinho para a ${c.nome}, pode me confirmar WhatsApp, endereço e os serviços que quer destacar?`,
  c=>`${oi(c,1)} Ótimo! O próximo passo é eu alinhar com você os textos e as informações da ${c.nome}. Podemos conversar rapidinho hoje?`,
  c=>`${oi(c,2)} Fico feliz que fez sentido${c.resposta?' ('+c.resposta.slice(0,60)+')':''}. Se quiser, já te explico como funciona o valor e o prazo.`],
 'objecao-preco':[
  c=>`${oi(c,0)} Entendo, valor é um ponto importante. O site é pagamento único, sem mensalidade pelo desenvolvimento, e ${c.suporte?baixa(c.suporte):'inclui suporte inicial'} Se quiser, vejo uma condição que caiba melhor.`,
  c=>`${oi(c,1)} Faz sentido você olhar com cuidado. Posso te mostrar como ficam as formas de pagamento${c.parcelas>1?' (dá para parcelar em até '+c.parcelas+'x)':''}. O que pesa mais para você: o valor total ou a parcela?`,
  c=>`${oi(c,2)} Obrigado por ser transparente. Se o valor não cabe agora, me diz o que seria viável e eu vejo o que consigo ajustar no escopo.`],
 'sem-investir':[
  c=>`${oi(c,0)} Sem problema, entendo. Deixo a demonstração guardada e te procuro mais para frente, pode ser? Quando você acha que faz sentido eu voltar a falar?`,
  c=>`${oi(c,1)} Tranquilo! Se mudar o momento da ${c.nome}, é só me chamar. Posso retomar com você em algumas semanas, se preferir.`,
  c=>`${oi(c,2)} Agradeço a conversa. Fica à vontade para me chamar quando quiser. Se for útil, te aviso caso eu tenha alguma condição diferente.`],
 'condicao':[
  c=>`${oi(c,0)} Sobre o investimento: o site da ${c.nome} fica em ${reais(c.valorPromo)}${c.valorPix?', ou '+reais(c.valorPix)+' no Pix':''}${c.valorNormal?' (valor normal '+reais(c.valorNormal)+')':''}, pagamento único pelo desenvolvimento${c.suporte?', com '+baixa(c.suporte).replace(/\.$/,''):''}. Posso te enviar a proposta organizada?`,
  c=>`${oi(c,1)} Resumindo a condição: ${reais(c.valorPromo)}${c.parcelas>1?' em até '+c.parcelas+'x':''}${c.valorPix?' ou '+reais(c.valorPix)+' no Pix':''}. ${c.suporte||''} Quer que eu formalize em uma proposta?`,
  c=>`${oi(c,2)} Falando de valores com clareza: ${reais(c.valorPromo)}${c.valorPix?' (ou '+reais(c.valorPix)+' no Pix)':''}, pagamento único. Se fizer sentido, preparo a proposta com prazo e o que está incluso.`],
 'retomada':[
  c=>`${oi(c,0)} Voltando ao site da ${c.nome}: ainda faz sentido para você? Se tiver alguma dúvida ou algo travando, me conta que eu ajudo.`,
  c=>`${oi(c,1)} Retomando nossa conversa. Teve tempo de pensar sobre o site${c.link?' ('+c.link+')':''}? Posso ajustar o que for preciso.`,
  c=>`${oi(c,2)} Queria saber como ficou a decisão sobre o site da ${c.nome}. Se não for o momento, tudo bem, só me avisa para eu organizar aqui.`],
 'fechamento':[
  c=>`${oi(c,0)} Combinado! Vou começar os ajustes do site da ${c.nome}. Para fechar: confirmando ${c.proposta?reais(c.proposta.valorFinal):'o valor combinado'}, te passo os dados para o pagamento e já organizo o cronograma.`,
  c=>`${oi(c,1)} Perfeito, vamos fechar então. Te mando o resumo do que ficou combinado e a forma de pagamento. Qualquer ponto, me avisa antes.`,
  c=>`${oi(c,2)} Que bom! Fechamos o site da ${c.nome}. Vou te enviar o resumo com prazo e pagamento para você conferir.`],
 'pos-venda':[
  c=>`${oi(c,0)} O site da ${c.nome} já está no ar${c.link?': '+c.link:''}. Dá uma olhada com calma e me avisa se algo precisar de ajuste${c.suporte?' — '+baixa(c.suporte).replace(/\.$/,'')+'.':'.'}`,
  c=>`${oi(c,1)} Passando para saber se está tudo certo com o site. Qualquer alteração pequena, é só me chamar.`,
  c=>`${oi(c,2)} Como está o site da ${c.nome}? Se quiser ajustar textos, fotos ou contatos, me manda por aqui.`]
};
export function gerarMensagem(empresa,{tipo='primeiro-contato',variante=0,...extra}={}){
 const c=contextoMensagem(empresa,extra),lista=modelosTexto[tipo]||modelosTexto['primeiro-contato'],i=((variante%lista.length)+lista.length)%lista.length;
 const texto=lista[i](c).replace(/\s+/g,' ').replace(/\s([.,!?])/g,'$1').replace(/:\s\./g,':').trim();
 const estrategia=['direta','curiosidade','consultiva'][i];
 return {texto,tipo,variante:i,estrategia,faltando:/\[inserir/.test(texto)?['link publicado da demonstração']:[],totalVariantes:lista.length};
}
export function sugerirTipo(estado,empresa){
 const evs=estado.eventos.filter(e=>e.empresaId===empresa.id);
 const ult=t=>evs.filter(e=>e.tipo===t).at(-1);
 if(empresa.etapa==='fechada')return 'pos-venda';
 if(empresa.etapa==='proposta'||empresa.etapa==='negociacao')return evs.some(e=>e.tipo==='proposta-enviada')?'retomada':'condicao';
 const d=ult('demonstracao-apresentada'),r=ult('resposta');
 if(d&&!(r&&r.quando>d.quando))return 'sem-resposta-demo';
 if(d&&r)return 'interessado';
 if(r&&(empresa.solicitouDemo||['medio','alto'].includes(empresa.interesse)))return 'enviar-demo';
 if(r)return 'necessidades';
 if(ult('mensagem-enviada'))return 'retomada';
 return empresa.contatoDireto==='nao'?'proprietario':'primeiro-contato';
}
