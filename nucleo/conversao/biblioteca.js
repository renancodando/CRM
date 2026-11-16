/* Biblioteca de mensagens do Órbita Conversão. Cada mensagem é uma ESTRATÉGIA diferente (não um sinônimo), com as técnicas que a fundamentam, os fatos que exige e os perfis em que se encaixa melhor.
   Regras da biblioteca: um parágrafo, português do Brasil falado, intenção comercial clara (nunca fingir ser cliente), só fatos presentes na ficha, sem urgência, sem promessa de resultado e sem desconto fora das condições cadastradas.
   req: fatos exigidos (chaves de perfil.tem). perfis: onde a mensagem rende mais ('*' = qualquer). cuidado: condição que só você pode garantir antes de enviar. */
const M=(id,nome,tec,req,perfis,f,cuidado='')=>({id,nome,tec,req,perfis,f,cuidado});

export const ETAPAS={
 'primeiro-contato':{rotulo:'Primeiro contato',objetivo:'Conseguir uma primeira resposta genuína, deixando claro quem sou e por que escrevi.'},
 'retomar-contato':{rotulo:'Follow-up sem resposta',objetivo:'Uma nova tentativa com outro ângulo, sem cobrar leitura; depois disso, parar.'},
 'respondeu':{rotulo:'Respondeu / perguntou como ajudar',objetivo:'Dizer o motivo do contato com clareza e abrir uma conversa de verdade.'},
 'diagnostico':{rotulo:'Entender necessidades',objetivo:'Descobrir como os clientes chegam e o que dá trabalho, com uma pergunta por vez.'},
 'apresentar-trabalho':{rotulo:'Apresentar o trabalho',objetivo:'Explicar em poucas linhas o que eu faço e como funciona.'},
 'beneficios':{rotulo:'Benefícios do site',objetivo:'Ligar o site a um ganho concreto para esta empresa, sem prometer resultado.'},
 'pedir-demo':{rotulo:'Pedir autorização para a prévia',objetivo:'Obter um "pode mandar" antes de enviar qualquer link.'},
 'enviar-demo':{rotulo:'Enviar a prévia',objetivo:'Entregar o link com uma pergunta específica que facilite o retorno.'},
 'demo-sem-retorno':{rotulo:'Prévia enviada, sem retorno',objetivo:'Reabrir a conversa sem afirmar que a pessoa viu o site.'},
 'gostou':{rotulo:'Gostou da prévia',objetivo:'Transformar o elogio em próximo passo concreto.'},
 'preco':{rotulo:'Apresentar o preço',objetivo:'Informar o valor real com clareza e o que está incluído.'},
 'fechamento':{rotulo:'Negociação e fechamento',objetivo:'Confirmar o combinado e conduzir os passos finais sem pressão.'},
 'recuperar':{rotulo:'Recuperar conversa parada',objetivo:'Retomar com respeito quem respondeu e depois sumiu.'},
 'pos-venda':{rotulo:'Pós-venda',objetivo:'Garantir que o cliente usa o site e está satisfeito.'},
 'indicacao':{rotulo:'Indicação',objetivo:'Pedir indicações e autorização de uso do caso, sem constranger.'}
};

export const MENSAGENS={
 'primeiro-contato':[
  M('pc-direta','Direta e transparente',['transparencia','reducao-pressao'],['semSiteAchado'],['*'],c=>`${c.oi} Sou o ${c.eu}, faço site pra ${c.negPlural}. Vou ser direto pra não tomar seu tempo: procurei a ${c.loja} no Google e não achei um site de vocês. Faz sentido eu te mostrar como ficaria um, só pra você ver?`),
  M('pc-canal','Pergunta sobre como o cliente chega',['consultiva','perguntas','transparencia'],[],['dados-escassos','poucas-avaliacoes','*'],c=>`${c.oi} Aqui é o ${c.eu}, trabalho fazendo site pra ${c.negPlural}. Uma dúvida rápida sobre a ${c.loja}: o cliente novo de vocês chega mais pelo Google, pelo Instagram ou por indicação?`),
  M('pc-reputacao','Reputação que só aparece no Maps',['personalizacao','curiosidade','transparencia'],['avaliacoes'],['reputacao-forte'],c=>`${c.oi} Sou o ${c.eu}, faço site pra ${c.negPlural}. Vi que a ${c.loja} tem nota ${c.nota} com ${c.aval} avaliações no Google, coisa que leva tempo pra construir. Fiquei com uma dúvida: quem não abre o Maps consegue ver essas avaliações em algum outro lugar?`),
  M('pc-instagram','Instagram como vitrine',['personalizacao','consultiva','transparencia'],['instagram'],['instagram-ativo'],c=>`${c.oi} Aqui é o ${c.eu}, faço site pra ${c.negPlural}. Vi o Instagram da ${c.loja} e me veio uma dúvida: quando alguém quer ${c.s1?'saber de '+c.s1:'um orçamento'}, vocês respondem um por um no direct ou já tem algum lugar com isso organizado?`,'Abra o Instagram da empresa antes de enviar: a mensagem diz que você viu o perfil.'),
  M('pc-linkbio','Página de links no lugar de site',['personalizacao','consultiva','transparencia'],['paginaGratuita'],['pagina-gratuita'],c=>`${c.oi} Sou o ${c.eu}, faço site pra ${c.negPlural}. Vi que o link da ${c.loja} leva pra uma página de links. Queria te perguntar: quem clica ali chega no WhatsApp já sabendo o que vocês fazem ou ainda pergunta tudo do zero?`),
  M('pc-desatualizado','Site que parou no tempo',['personalizacao','consultiva','transparencia'],['siteDesatualizado'],['site-desatualizado'],c=>`${c.oi} Aqui é o ${c.eu}, trabalho com site pra ${c.negPlural}. Entrei no site da ${c.loja} pelo celular e fiquei com a impressão de que ele não mostra tudo o que vocês fazem hoje. Vocês ainda atualizam ele ou ficou parado?`),
  M('pc-permissao','Pedido de permissão para uma pergunta',['proximo-passo-pequeno','autonomia-explicita','transparencia'],[],['*'],c=>`${c.oi} Aqui é o ${c.eu}, faço site pra ${c.negPlural}. Posso te fazer uma pergunta rápida sobre a ${c.loja}? É coisa de um minuto, e se não fizer sentido eu não insisto.`),
  M('pc-talvez-nao-precise','Talvez vocês nem precisem (retirada honesta)',['retirada','reducao-pressao','transparencia'],[],['reputacao-forte','instagram-ativo','*'],c=>`${c.oi} Sou o ${c.eu}, faço site pra ${c.negPlural}. Sendo sincero, nem toda loja precisa de site, e pode ser o caso da ${c.loja}. Por isso pergunto antes de oferecer qualquer coisa: hoje falta cliente novo chegando ou o movimento já está do jeito que vocês querem?`),
  M('pc-observacao','Observação específica (lacuna de curiosidade)',['curiosidade','personalizacao','proximo-passo-pequeno'],['obs'],['reputacao-forte','pagina-gratuita','instagram-ativo','servicos-variados'],c=>`${c.oi} Sou o ${c.eu}, faço site pra ${c.negPlural}. Estava olhando as ${c.negPlural} de ${c.cidade||'sua região'} e reparei numa coisa na ${c.loja} que acho que vale você saber. Posso te contar?`),
  M('pc-previa-pronta','Prévia já pronta',['reciprocidade-previa','proximo-passo-pequeno','transparencia'],['demo'],['*'],c=>`${c.oi} Aqui é o ${c.eu}, faço site pra ${c.negPlural}. Montei uma prévia de como poderia ficar o site da ${c.loja}${c.servs?', com '+c.servs+' e botão de orçamento no WhatsApp':''}. Posso te mandar o link pra você dar uma olhada?`),
  M('pc-oferta-previa','Oferta de montar a prévia',['reciprocidade-previa','reducao-risco','transparencia'],[],['*'],c=>`${c.oi} Sou o ${c.eu}, faço site pra ${c.negPlural}. Queria montar uma prévia do site da ${c.loja} pra você ver como ficaria, sem custo e sem você precisar decidir nada. Posso fazer e te mandar?`,'Só envie se você realmente for montar a prévia caso a empresa aceite.'),
  M('pc-servico','Pergunta sobre o serviço mais procurado',['personalizacao','perguntas','transparencia'],['doisServicos'],['servicos-variados','*'],c=>`${c.oi} Aqui é o ${c.eu}, faço site pra ${c.negPlural}. Vi que a ${c.loja} faz ${c.s1} e ${c.s2}. Me tira uma dúvida: o que mais chega de pedido no WhatsApp de vocês, ${c.s1} ou outra coisa?`),
  M('pc-apresentacao','Quem ainda não conhece a loja',['consultiva','confianca-inicial','transparencia'],['cidade'],['poucas-avaliacoes','dados-escassos'],c=>`${c.oi} Sou o ${c.eu}, faço site pra ${c.negPlural}. Achei a ${c.loja} pesquisando ${c.negCurto} em ${c.cidade}. Uma dúvida sincera: quem ainda não conhece vocês consegue ver em algum lugar os serviços, o endereço e como pedir orçamento, tudo junto?`),
  M('pc-curta','Pergunta de sim ou não',['fluencia','transparencia'],[],['dados-escassos','*'],c=>`${c.oi} Sou o ${c.eu} e faço site pra ${c.negPlural}. A ${c.loja} já tem site ou ainda não?`),
  M('pc-decisor','Quem cuida dessa parte',['transparencia','consultiva'],[],['*'],c=>`${c.oi} Aqui é o ${c.eu}, faço site pra ${c.negPlural}. Queria falar sobre o site da ${c.loja} com quem cuida dessa parte. É com você mesmo ou tem outra pessoa?`),
  M('pc-diferencial','Diferencial que não aparece',['personalizacao','curiosidade','transparencia'],['diferencial','cidade'],['servicos-variados','reputacao-forte','*'],c=>`${c.oi} Sou o ${c.eu}, faço site pra ${c.negPlural}. Vi que a ${c.loja} trabalha com ${c.dif1}. Isso aparece em algum lugar pra quem está pesquisando ${c.negCurto} em ${c.cidade}, ou a pessoa só descobre quando chama no WhatsApp?`)
 ],
 'retomar-contato':[
  M('fu-escolha','Dá a escolha de continuar ou parar',['autonomia-explicita','reducao-pressao'],[],['*'],c=>`${c.oi} Aqui é o ${c.eu} de novo, do site pra ${c.negPlural}. Sei que mensagem de desconhecido a gente deixa pra depois. Só queria saber: faz sentido eu te mostrar uma ideia pra ${c.loja} ou prefere que eu não insista?`),
  M('fu-observacao','Entrega a observação de uma vez',['reciprocidade-previa','personalizacao'],['obs'],['reputacao-forte','pagina-gratuita','instagram-ativo','servicos-variados'],c=>`${c.oi} ${c.eu} aqui. Te escrevi outro dia sobre a ${c.loja}. O que eu queria te mostrar era isso: ${c.obs}. Se quiser, te explico em duas linhas o que dá pra fazer com isso.`),
  M('fu-sim-nao','Pergunta de sim ou não',['fluencia','autonomia-explicita'],[],['*'],c=>`${c.oi} Uma pergunta de sim ou não: a ${c.loja} tem interesse em ter um site próprio? Se a resposta for não, eu paro por aqui.`),
  M('fu-retirada','Retirada respeitosa',['retirada','reducao-pressao'],[],['*'],c=>`${c.oi} É o ${c.eu}, do site pra ${c.negPlural}. Como não tive retorno, imagino que não seja o momento, e tudo bem. Vou deixar quieto. Se um dia quiser ver como ficaria o site da ${c.loja}, é só me chamar.`),
  M('fu-previa','Mostrar em vez de explicar',['reciprocidade-previa','proximo-passo-pequeno'],['demo'],['*'],c=>`${c.oi} ${c.eu} aqui. Em vez de explicar, preferi mostrar: montei uma prévia do site da ${c.loja}. Posso te mandar o link?`),
  M('fu-decisor','Talvez seja outra pessoa',['consultiva','reducao-pressao'],[],['*'],c=>`${c.oi} Aqui é o ${c.eu}. Talvez eu tenha escrito pra pessoa errada: quem cuida da divulgação da ${c.loja}? Se me passar o contato, falo direto com ela e não te incomodo mais.`),
  M('fu-horario','Pergunta o melhor horário',['reducao-pressao','proximo-passo-pequeno'],[],['*'],c=>`${c.oi} ${c.eu} de novo. Imagino que te peguei no meio do atendimento da outra vez. Tem um horário melhor pra eu te fazer uma pergunta rápida sobre a ${c.loja}?`),
  M('fu-reputacao','Avaliações como ativo',['personalizacao','enquadramento'],['avaliacoes'],['reputacao-forte'],c=>`${c.oi} Aqui é o ${c.eu}. Fiquei pensando nas ${c.aval} avaliações da ${c.loja}: isso leva anos pra construir e hoje trabalha só dentro do Google Maps. Quer ver como ficaria num site de vocês?`),
  M('fu-bio','Ideia para o link da bio',['personalizacao','proximo-passo-pequeno'],['instagram'],['instagram-ativo','pagina-gratuita'],c=>`${c.oi} ${c.eu} aqui, do site pra ${c.negPlural}. Uma ideia simples pra ${c.loja}: transformar o link da bio do Instagram numa página com serviços e orçamento. Te mostro como ficaria?`),
  M('fu-curta','Curta e direta',['fluencia','autonomia-explicita'],[],['*'],c=>`${c.oi} É o ${c.eu}. Só confirmando pra não ficar te enchendo: site pra ${c.loja}, tem interesse ou não é a hora?`)
 ],
 'respondeu':[
  M('ra-direto','Direto ao ponto',['transparencia','consultiva'],['semSiteAchado'],['*'],c=>`Valeu por responder. Vou direto: eu faço site pra ${c.negPlural} e não achei um da ${c.loja}. Queria entender se isso é uma coisa que vocês já pensaram em ter ou se nunca foi prioridade.`),
  M('ra-ponte','Agradece e faz a ponte com o motivo',['escuta','consultiva','transparencia'],[],['*'],c=>`Entendi, obrigado por contar. Pergunto porque eu faço site pra ${c.negPlural}: hoje, quando alguém quer saber o que vocês consertam e quanto custa, a pessoa precisa chamar no WhatsApp pra descobrir?`),
  M('ra-observacao','Entrega a observação prometida',['curiosidade','personalizacao','transparencia'],['obs'],['reputacao-forte','pagina-gratuita','instagram-ativo','servicos-variados'],c=>`Obrigado. O que eu reparei foi isso: ${c.obs}. Eu faço site pra ${c.negPlural} e acho que dá pra aproveitar melhor isso. Quer que eu te explique em duas linhas como?`),
  M('ra-esclarece','Esclarece que não é cliente',['transparencia','reducao-pressao'],[],['*'],c=>`Opa, deixa eu esclarecer pra não te fazer perder tempo: não é conserto. Sou o ${c.eu} e faço site pra ${c.negPlural}. Queria só saber se a ${c.loja} tem interesse em ter um site próprio. Se não tiver, tranquilo.`),
  M('ra-dor','Pergunta o que toma tempo',['consultiva','perguntas'],[],['instagram-ativo','servicos-variados','*'],c=>`Boa. Me diz uma coisa: o que mais toma tempo de vocês no WhatsApp hoje, responder preço, explicar endereço e horário, ou é outra coisa?`),
  M('ra-formato','Deixa escolher como ver',['autonomia-explicita','proximo-passo-pequeno'],[],['*'],c=>`Obrigado pelo retorno. Eu faço site pra ${c.negPlural} e queria te mostrar uma ideia pra ${c.loja}, mas só se fizer sentido pra você. Prefere que eu explique por aqui em poucas linhas ou te mande um exemplo pronto pra olhar?`),
  M('ra-previa','Propõe montar a prévia',['reciprocidade-previa','reducao-risco'],[],['*'],c=>`Valeu. Então é o seguinte: eu monto uma prévia do site da ${c.loja} com os serviços de vocês e te mando. Você olha com calma e me diz se gostou. Posso fazer?`),
  M('ra-previa-pronta','Retoma a prévia que já está pronta',['reciprocidade-previa','transparencia','proximo-passo-pequeno'],['demo'],['*'],c=>`Valeu por responder. É rápido: eu faço site pra ${c.negPlural} e deixei pronta uma prévia de como ficaria o da ${c.loja}. Posso te mandar o link pra você olhar quando der?`),
  M('ra-reputacao','Liga a resposta às avaliações',['personalizacao','enquadramento'],['avaliacoes'],['reputacao-forte'],c=>`Obrigado por responder. Perguntei porque a ${c.loja} tem ${c.aval} avaliações com nota ${c.nota}, e hoje isso só aparece pra quem abre o Google Maps. Já pensaram em ter uma página própria mostrando isso junto com os serviços?`),
  M('ra-decisor','Confirma quem decide',['consultiva','reducao-pressao'],[],['*'],c=>`Perfeito. Só pra eu não te encher com coisa que não é contigo: é você quem decide essa parte de divulgação da ${c.loja} ou é melhor eu falar com outra pessoa?`),
  M('ra-resumo','Resumo do que faço',['fluencia','transparencia'],[],['*'],c=>`Resumindo o que eu faço: um site simples pra ${c.loja}, com os serviços, o endereço, o horário e um botão que já abre o WhatsApp de vocês pra orçamento. Quer ver um exemplo de como fica?`),
  M('ra-insta','Site junto com o Instagram',['personalizacao','enquadramento'],['instagram'],['instagram-ativo'],c=>`Legal. Pergunto porque vi que vocês estão no Instagram. O site não substitui ele, só junta num lugar o que no Insta fica espalhado: serviços, endereço e orçamento. Faz sentido eu te mostrar como ficaria?`)
 ],
 'diagnostico':[
  M('dn-origem','De onde vêm os clientes',['consultiva','perguntas'],[],['*'],c=>`Me conta uma coisa: de cada dez clientes novos da ${c.loja}, mais ou menos quantos chegam pela internet e quantos por indicação ou passando na frente?`),
  M('dn-repetidas','Perguntas que mais se repetem',['consultiva','perguntas'],[],['instagram-ativo','servicos-variados','*'],c=>`Quais são as perguntas que vocês mais respondem no WhatsApp? ${c.s1?'Preço de '+c.s1+', prazo, endereço?':'Preço, prazo, endereço?'}`),
  M('dn-servico','Serviço que mais querem vender',['consultiva','personalizacao'],['doisServicos'],['servicos-variados','*'],c=>`Qual serviço vocês mais gostariam de vender hoje: ${c.s1}, ${c.s2} ou outro que pouca gente sabe que vocês fazem?`),
  M('dn-horario','Quem chama fora do horário',['consultiva','aversao-perda'],[],['*'],c=>`Quando alguém chama fora do horário, a pessoa costuma esperar a resposta ou vocês sentem que ela acaba indo em outra ${c.negCurto}?`),
  M('dn-tentativas','O que já tentaram',['escuta','consultiva'],[],['*'],c=>`Vocês já tentaram ter site, anúncio ou algo assim antes? Se sim, o que não funcionou?`),
  M('dn-google','Como aparecem no Google',['curiosidade','consultiva'],['cidade'],['*'],c=>`Quando alguém pesquisa "${c.busca} em ${c.cidade}" no Google, você sabe se a ${c.loja} aparece e o que aparece dela?`),
  M('dn-utilidade','O que seria mais útil',['consultiva','autonomia-explicita'],[],['*'],c=>`Se a ${c.loja} tivesse um site amanhã, o que seria mais útil pra vocês: mostrar os serviços, mostrar as avaliações ou facilitar o pedido de orçamento?`),
  M('dn-diferencial','Por que escolhem vocês',['escuta','consultiva'],['cidade'],['*'],c=>`O que faz o cliente escolher a ${c.loja} e não outra ${c.negCurto} de ${c.cidade}? Pergunto porque é isso que eu colocaria em destaque.`),
  M('dn-garantia','Garantia e confiança',['consultiva','reducao-risco'],[],['*'],c=>`Vocês dão garantia nos serviços? Pergunto porque é uma das coisas que o cliente procura antes de fechar, e nem sempre aparece.`),
  M('dn-volume','Dão conta dos orçamentos',['consultiva','perguntas'],[],['reputacao-forte','instagram-ativo','*'],c=>`Hoje vocês conseguem responder todo mundo que pede orçamento ou tem dia que fica mensagem pra trás?`),
  M('dn-decisor','Quem cuida da divulgação',['consultiva'],[],['*'],c=>`Só pra eu entender: essa parte de divulgação quem cuida é você, um sócio ou alguém de fora?`)
 ],
 'apresentar-trabalho':[
  M('at-simples','O que é, em uma frase',['fluencia','transparencia'],[],['*'],c=>`Eu faço site sob medida pra ${c.negPlural}. No caso da ${c.loja}, seria uma página com os serviços, o endereço, o horário e um botão de orçamento que já cai no WhatsApp de vocês. Eu monto tudo, vocês só aprovam. Quer ver como ficaria?`),
  M('at-processo','Como funciona o processo',['reducao-risco','transparencia'],[],['*'],c=>`Funciona assim: eu monto o site da ${c.loja} com as informações que já são públicas, te mando pra ver, você pede os ajustes e só depois a gente fala de fechar. Você não precisa escrever nem configurar nada. Posso montar a prévia?`),
  M('at-ver-antes','Mostrar antes de cobrar',['reducao-risco','reciprocidade-previa'],[],['*'],c=>`Meu jeito de trabalhar é mostrar antes de cobrar. Eu monto uma prévia do site da ${c.loja} e você decide olhando o site pronto, não uma promessa. Topa ver a prévia?`),
  M('at-pagamento-unico','Pagamento único, sem mensalidade',['transparencia','reducao-risco'],[],['*'],c=>`É um site feito pra ${c.loja}, com pagamento único pelo desenvolvimento e um mês de pequenos ajustes incluído. Não é assinatura e não tem mensalidade minha. Quer que eu te mostre como ficaria antes de falar de valor?`),
  M('at-orcamento','Feito para gerar pedido de orçamento',['enquadramento','personalizacao'],[],['*'],c=>`O que eu faço é um site pensado pra facilitar o pedido de orçamento: a pessoa vê o serviço, clica e já cai no WhatsApp de vocês com a mensagem pronta. Hoje como esse pedido chega pra vocês?`),
  M('at-celular','Pensado para o celular',['fluencia','enquadramento'],[],['site-desatualizado','*'],c=>`Eu faço o site pensando em quem abre pelo celular. Fica leve, com os serviços na primeira tela e o botão do WhatsApp sempre à mão. Quer ver um exemplo abrindo pelo seu celular?`),
  M('at-quem-sou','Quem conversa é quem faz',['confianca-inicial','transparencia'],[],['*'],c=>`Sou desenvolvedor e trabalho sozinho, então quem conversa com você é quem faz o site. Foco em ${c.negPlural}, por isso o site já sai com o que importa nesse ramo: serviço, garantia, endereço e orçamento rápido. Faz sentido eu te mostrar como ficaria o da ${c.loja}?`),
  M('at-conteudo','O que entra no site',['personalizacao','fluencia'],['servico'],['servicos-variados','*'],c=>`No site da ${c.loja} entrariam: ${c.servs}, a localização no mapa, o horário, as formas de contato e, se vocês quiserem, as avaliações do Google. Tudo numa página só. Faltou alguma coisa que você colocaria?`),
  M('at-sem-trabalho','Não dá trabalho para vocês',['fluencia','reducao-risco'],[],['*'],c=>`A parte boa é que não dá trabalho pra vocês. Eu levanto as informações, monto, publico e te mando o link. Sua parte é só me dizer o que quer mudar. Posso começar pela prévia?`),
  M('at-vs-instagram','Complementa o Instagram',['enquadramento','personalizacao'],['instagram'],['instagram-ativo'],c=>`O Instagram mostra o dia a dia, mas não organiza. O site que eu faço é o lugar fixo da ${c.loja}: quem chega já vê o que vocês fazem, onde fica e como pedir orçamento, sem precisar rolar postagem. Quer ver a diferença na prática?`),
  M('at-exemplo','Mostrar um exemplo real',['prova-social','proximo-passo-pequeno'],[],['*'],c=>`Posso te mostrar um exemplo real do que eu faço pra você ver o padrão. Aí você me diz se é o tipo de coisa que serviria pra ${c.loja}. Posso mandar?`,'Só envie se você tiver um site seu, publicado, para mostrar.')
 ],
 'beneficios':[
  M('bn-repetidas','Menos perguntas repetidas',['enquadramento','fluencia'],[],['instagram-ativo','servicos-variados','*'],c=>`Um ganho prático é responder menos a mesma pergunta. Com serviços, endereço e horário no site, quem chama no WhatsApp já chega sabendo o básico. Qual pergunta vocês mais respondem hoje?`),
  M('bn-avaliacoes','Avaliações à vista',['prova-social','personalizacao'],['avaliacoes'],['reputacao-forte'],c=>`Vocês já têm ${c.aval} avaliações com nota ${c.nota}. No site isso fica na cara de quem ainda está decidindo onde fechar, em vez de ficar só no Maps. Quer ver como isso ficaria na página?`),
  M('bn-endereco-proprio','Um endereço que é de vocês',['enquadramento','aversao-perda'],[],['instagram-ativo','pagina-gratuita','*'],c=>`Instagram e Google são de terceiros e mudam as regras quando querem. O site é o único endereço que é da ${c.loja} mesmo, e todo o resto pode apontar pra ele. Faz sentido pra vocês ter esse endereço próprio?`),
  M('bn-um-clique','Orçamento em um clique',['fluencia','enquadramento'],[],['*'],c=>`O cliente escolhe o serviço e cai direto no WhatsApp com a mensagem pronta${c.s1?', tipo "quero orçamento de '+c.s1+'"':''}. Menos vai e volta pra vocês e pra ele. Quer ver isso funcionando numa prévia?`),
  M('bn-confianca','Segurança para quem não conhece',['confianca-inicial','reducao-risco'],[],['poucas-avaliacoes','dados-escassos','*'],c=>`Pra quem nunca foi na ${c.loja}, um site com endereço, horário, garantia e avaliações passa mais segurança antes de fechar o serviço. Hoje o cliente novo chega mais por indicação ou pesquisando?`),
  M('bn-google','Um lugar oficial para o Google mostrar',['transparencia','enquadramento'],[],['*'],c=>`Eu não prometo posição no Google, ninguém pode prometer. O que o site faz é dar ao Google e ao cliente um lugar oficial da ${c.loja}, com as informações claras. Quer ver como ficaria esse lugar oficial?`),
  M('bn-servicos-ocultos','Serviços que o cliente não imagina',['personalizacao','enquadramento'],['servico'],['servicos-variados'],c=>`Dá pra destacar os serviços que o cliente nem imagina que vocês fazem, em vez de ele achar que é só ${c.s1}. Tem algum serviço que vocês fazem e pouca gente sabe?`),
  M('bn-fora-horario','Informação com a loja fechada',['aversao-perda','enquadramento'],[],['*'],c=>`Pelo que eu vi, quem procura a ${c.loja} fora do horário não acha serviço nem contato organizados em lugar nenhum. O site fica mostrando isso enquanto a loja está fechada. Chega muita mensagem fora do horário aí?`),
  M('bn-link-unico','Um link só para tudo',['fluencia','personalizacao'],[],['instagram-ativo','pagina-gratuita','*'],c=>`Em vez de mandar endereço, horário e lista de serviço toda vez, vocês mandam um link só. Serve pro Instagram, pro Google e pro status do WhatsApp. Quer ver como ficaria esse link?`),
  M('bn-custo-unico','Custo que não se repete',['justica-preco','transparencia'],[],['*'],c=>`E é um custo que não se repete: paga uma vez pelo desenvolvimento e o site fica sendo de vocês. Quer saber o valor ou prefere ver a prévia primeiro?`),
  M('bn-percepcao','Como a loja é percebida',['confianca-inicial','enquadramento'],[],['reputacao-forte','*'],c=>`Quando o cliente compara duas lojas, a que tem um site organizado tende a parecer mais estruturada. Não muda o serviço de vocês, muda como ele é visto antes da primeira visita. Quer ver como a ${c.loja} apareceria?`)
 ],
 'pedir-demo':[
  M('pd-simples','Pedido simples',['proximo-passo-pequeno','reciprocidade-previa'],[],['*'],c=>`Posso montar uma prévia do site da ${c.loja} e te mandar o link? Você olha quando puder e me diz o que achou.`),
  M('pd-pronta','Já está pronta',['reciprocidade-previa','proximo-passo-pequeno'],['demo'],['*'],c=>`Já deixei uma prévia do site da ${c.loja} pronta. Posso te mandar o link por aqui?`),
  M('pd-mostrar','Mostrar em vez de explicar',['reducao-risco','retirada'],[],['*'],c=>`Que tal eu te mostrar em vez de explicar? Monto a prévia da ${c.loja} e você decide só depois de ver. Se não gostar, é só me falar e eu não toco mais no assunto.`),
  M('pd-formato','Link ou prints',['autonomia-explicita','fluencia'],[],['*'],c=>`Prefere que eu te mande o link da prévia pra abrir no celular ou uns prints das telas aqui mesmo no WhatsApp?`),
  M('pd-prazo','Combina o prazo',['proximo-passo-pequeno','transparencia'],[],['*'],c=>`Consigo montar a prévia da ${c.loja} em um ou dois dias. Te mando por aqui quando ficar pronta, pode ser?`,'Só envie se você conseguir cumprir esse prazo.'),
  M('pd-insumo','Pede a logo (pequeno compromisso)',['proximo-passo-pequeno','personalizacao'],[],['*'],c=>`Pra prévia ficar com a cara da ${c.loja}, me manda a logo ou uma foto da fachada? Com isso eu já monto e te envio.`),
  M('pd-foco','Prévia focada no que importa',['personalizacao','escuta'],['servico'],['servicos-variados','*'],c=>`Pelo que você me contou, eu montaria a prévia destacando ${c.s1} e o botão de orçamento. Posso fazer assim e te mandar?`),
  M('pd-seguranca','Avisa que o link é seguro',['confianca-inicial','reducao-risco'],[],['*'],c=>`Vou te mandar um link, e já aviso pra você não estranhar: é só a página da prévia, não pede cadastro nem senha. Posso enviar?`),
  M('pd-decisor','Para ver com quem decide',['consultiva','proximo-passo-pequeno'],[],['*'],c=>`Posso te mandar a prévia pra você ver junto com quem decide aí? Assim vocês já olham os dois de uma vez.`),
  M('pd-horario','Melhor horário para olhar',['reducao-pressao','fluencia'],[],['*'],c=>`Qual o melhor horário pra eu te mandar a prévia, pra você conseguir olhar com calma e não no meio do atendimento?`),
  M('pd-curiosidade','Só para matar a curiosidade',['retirada','curiosidade'],[],['*'],c=>`Se você achar que não é o momento, sem problema. Mas se quiser só matar a curiosidade de como a ${c.loja} ficaria num site, eu te mando a prévia e pronto.`)
 ],
 'enviar-demo':[
  M('ed-simples','Link e pedido de opinião',['fluencia','escuta'],['demo'],['*'],c=>`Aqui está a prévia do site da ${c.loja}: ${c.demoUrl} Dá uma olhada pelo celular mesmo e me diz o que você mudaria.`),
  M('ed-conteudo','Diz o que tem dentro',['personalizacao','escuta'],['demo'],['*'],c=>`Prontinho, esse é o link: ${c.demoUrl} Coloquei ${c.servs||'os serviços'} e o botão de orçamento no WhatsApp. O que ficou faltando na sua opinião?`),
  M('ed-pergunta','Uma pergunta específica',['perguntas','fluencia'],['demo'],['servicos-variados','*'],c=>`Segue a prévia: ${c.demoUrl} Uma pergunta só: os serviços que eu coloquei estão certos ou tem algum que vocês não fazem mais?`),
  M('ed-rascunho','É rascunho, pode criticar',['reducao-pressao','escuta'],['demo'],['*'],c=>`Como combinado, o link da prévia: ${c.demoUrl} É uma primeira versão, então pode criticar à vontade. Textos, cores e fotos eu ajusto.`),
  M('ed-botao','Convida a testar o botão',['proximo-passo-pequeno','personalizacao'],['demo'],['*'],c=>`Aqui o link: ${c.demoUrl} Sugestão: clica no botão de orçamento pra ver como a mensagem chegaria no WhatsApp de vocês.`),
  M('ed-sem-pressa','Sem pressa para responder',['reducao-pressao','autonomia-explicita'],['demo'],['*'],c=>`Link da prévia da ${c.loja}: ${c.demoUrl} Não precisa responder agora. Quando conseguir olhar, me fala só se ficou parecido com o que você imaginava.`),
  M('ed-decisor','Para todos que decidem',['consultiva','escuta'],['demo'],['*'],c=>`Segue o link pra você e quem mais decide aí: ${c.demoUrl} Se quiserem, eu anoto os pontos dos dois e ajusto de uma vez.`),
  M('ed-conferir','Pede para conferir os dados',['transparencia','proximo-passo-pequeno'],['demo'],['*'],c=>`Está aqui: ${c.demoUrl} Usei o endereço e o horário que estão no Google. Confere pra mim se continuam valendo?`),
  M('ed-expectativa','Era isso que você imaginava',['escuta','perguntas'],['demo'],['*'],c=>`Olha como ficou a ${c.loja}: ${c.demoUrl} A primeira tela mostra os serviços e o WhatsApp. Era isso que você tinha em mente ou eu passei longe?`),
  M('ed-tres-coisas','Três coisas para mexer',['escuta','proximo-passo-pequeno'],['demo'],['*'],c=>`Prévia no ar: ${c.demoUrl} Ainda é rascunho, sem domínio próprio. Me diz as três coisas que você mais mexeria.`)
 ],
 'demo-sem-retorno':[
  M('vn-abriu','O link funcionou?',['fluencia','reducao-pressao'],['demoVista'],['*'],c=>`${c.oi} Passando só pra saber se o link da prévia funcionou direitinho aí no seu celular.`),
  M('vn-sincero','Pode dizer que não gostou',['retirada','escuta'],['demoVista'],['*'],c=>`Sobre a prévia da ${c.loja}: se achou que não ficou bom, pode falar sem cerimônia. Prefiro saber o que não agradou do que ficar no escuro.`),
  M('vn-ajuste','Ajuste feito na prévia',['reciprocidade-previa','personalizacao'],['demoVista'],['*'],c=>`Fiz um ajuste na prévia da ${c.loja}${c.s1?' pensando em '+c.s1:''}. Quer que eu te mande o link de novo?`,'Só envie se você realmente ajustou a prévia.'),
  M('vn-encerrar','Fecha o ciclo com respeito',['retirada','autonomia-explicita'],['demoVista'],['*'],c=>`Como não tive retorno sobre a prévia, vou entender que agora não é prioridade pra ${c.loja}, e tudo bem. Deixo o link guardado. Se um dia fizer sentido, é só me chamar.`),
  M('vn-faltou','Faltou alguma informação?',['consultiva','perguntas'],['demoVista'],['*'],c=>`Uma pergunta rápida sobre a prévia: faltou alguma informação pra você conseguir decidir, tipo valor ou prazo?`),
  M('vn-prints','Oferece prints',['fluencia','reducao-risco'],['demoVista'],['*'],c=>`Se preferir, eu te mando uns prints das telas aqui no WhatsApp, pra não precisar abrir link. Quer?`),
  M('vn-depois','Combinar outro momento',['reducao-pressao','autonomia-explicita'],['demoVista'],['*'],c=>`Sei que a rotina da loja é corrida. Quer que eu volte a falar disso em outro momento? Me diz um dia bom e eu não incomodo antes.`),
  M('vn-vale-continuar','Vale eu continuar?',['retirada','consultiva'],['demoVista'],['*'],c=>`Pensei em duas melhorias pra prévia da ${c.loja}. Antes de mexer, queria saber: vale a pena eu continuar ou você prefere deixar isso pra depois?`),
  M('vn-opcoes','Três opções numeradas',['fluencia','autonomia-explicita'],['demoVista'],['*'],c=>`Só pra eu me organizar: sobre o site da ${c.loja}, você prefere que eu (1) ajuste alguma coisa na prévia, (2) te passe os valores ou (3) deixe quieto por enquanto?`),
  M('vn-decisor','Outra pessoa decide?',['consultiva','reducao-pressao'],['demoVista'],['*'],c=>`Mostrou a prévia pra mais alguém aí? Se a decisão for de outra pessoa, posso explicar direto pra ela e te poupar esse trabalho.`)
 ],
 'gostou':[
  M('gs-o-que','O que mais agradou',['escuta','perguntas'],[],['*'],c=>`Que bom que gostou. O que mais te agradou? Pergunto pra manter isso na versão final.`),
  M('gs-no-ar','Como deixar no ar de verdade',['proximo-passo-pequeno','transparencia'],[],['*'],c=>`Fico feliz. Quer que eu te passe como funciona pra deixar ele no ar de verdade, com o endereço da ${c.loja}?`),
  M('gs-ajustes','Acertar antes de falar de valor',['escuta','reducao-pressao'],[],['*'],c=>`Boa. Antes de falar de valor: tem algo que você mudaria? Prefiro acertar o site primeiro.`),
  M('gs-preco','Passa o valor direto',['transparencia','ancoragem-honesta'],[],['*'],c=>`Que bom. É pagamento único: ${c.promo}, ou ${c.pix} à vista no Pix. Já inclui um mês de pequenos ajustes. Quer que eu te explique o que entra?`),
  M('gs-seguir','Próximo passo simples',['proximo-passo-pequeno','fluencia'],[],['*'],c=>`Legal que curtiu. O próximo passo é simples: você me passa os ajustes, eu finalizo e publico. Quer seguir?`),
  M('gs-mandaria','Já mandaria para um cliente?',['perguntas','escuta'],[],['*'],c=>`Obrigado. Me diz uma coisa: do jeito que está, você já mandaria esse link pra um cliente ou ainda falta algo pra isso?`),
  M('gs-completa','Versão completa antes do valor',['reciprocidade-previa','personalizacao'],[],['reputacao-forte','*'],c=>`Show. Quer que eu coloque as avaliações do Google e as fotos da loja antes de te passar os valores? Aí você vê a versão completa.`),
  M('gs-decisor','Quem bate o martelo',['consultiva'],[],['*'],c=>`Que bom. Só pra alinhar: é você quem bate o martelo ou vale eu mandar o link pra mais alguém ver também?`),
  M('gs-proposta','Proposta por escrito',['transparencia','reducao-risco'],[],['*'],c=>`Fico contente. Posso te mandar a proposta por escrito, com valor, o que está incluído e o prazo? Aí você analisa sem pressa.`),
  M('gs-endereco','Definir o endereço do site',['proximo-passo-pequeno','personalizacao'],[],['*'],c=>`Boa. Se quiser, a gente já define o endereço do site, tipo ${c.slug||'nomedaloja'}.com.br. Quer que eu veja se está disponível?`)
 ],
 'preco':[
  M('pr-direto','Valor direto',['transparencia','fluencia'],[],['*'],c=>`O valor é ${c.promo} em pagamento único, ou ${c.pix} à vista no Pix. Inclui o site pronto e um mês de pequenos ajustes.`),
  M('pr-ancora','Valor normal e condição atual',['ancoragem-honesta','transparencia'],[],['*'],c=>`O valor normal do projeto é ${c.normal}. A condição atual é ${c.promo}, e à vista no Pix fica ${c.pix}. Pagamento único, com um mês de pequenos ajustes.`),
  M('pr-incluso','O que entra no valor',['justica-preco','transparencia'],[],['*'],c=>`Fica ${c.promo}, ou ${c.pix} no Pix. Nesse valor entra o site completo da ${c.loja}, a publicação e um mês de pequenos ajustes. Não tem mensalidade minha.`),
  M('pr-antes-da-demo','Responde e oferece a prévia',['transparencia','reducao-risco'],[],['*'],c=>`Te respondo direto: ${c.promo} em pagamento único, ou ${c.pix} à vista no Pix. Se quiser, antes de decidir eu te mostro uma prévia do site da ${c.loja} pra você ver pelo que estaria pagando.`),
  M('pr-unico','Um pagamento só',['justica-preco','enquadramento'],[],['*'],c=>`É um pagamento só: ${c.pix} no Pix ou ${c.promo} nas outras formas. Depois disso o site é de vocês, sem mensalidade pra mim.`),
  M('pr-conta','Devolve a conta para o cliente',['enquadramento','perguntas'],[],['*'],c=>`Pra você ter uma ideia de proporção: o site custa ${c.pix} no Pix, uma vez só. Quantos serviços a mais ele precisaria trazer pra se pagar, na conta de vocês?`),
  M('pr-duas','Duas formas, mesmo site',['autonomia-explicita','transparencia'],[],['*'],c=>`Tenho duas formas: ${c.pix} à vista no Pix, ou ${c.promo} nas demais formas de pagamento. O site e o suporte são os mesmos nas duas.`),
  M('pr-cabe','Pergunta se cabe',['transparencia','escuta'],[],['*'],c=>`Faz sentido querer saber o valor antes. É ${c.promo}, ou ${c.pix} no Pix, pagamento único. Com esse número na mão, o site cabe no que você tinha em mente?`),
  M('pr-apos-demo','Valor do site que você viu',['transparencia','ancoragem-honesta'],['demoVista'],['*'],c=>`Sobre o valor do site que te mandei: ${c.promo}, ou ${c.pix} à vista no Pix. Pagamento único, já com um mês de pequenos ajustes.`),
  M('pr-custos','Valor e custos à parte',['transparencia','justica-preco'],[],['*'],c=>`O desenvolvimento sai por ${c.promo}, ou ${c.pix} no Pix, pago uma vez. ${c.hospDom}`,'Confira se a frase sobre hospedagem e domínio corresponde à sua condição real.'),
  M('pr-proposta','Valor e proposta por escrito',['transparencia','reducao-risco'],[],['*'],c=>`O valor é ${c.promo}, ou ${c.pix} no Pix. Quer que eu te mande isso numa proposta por escrito, com tudo que está incluído?`)
 ],
 'fechamento':[
  M('fc-passos','Passo a passo do fechamento',['fluencia','transparencia'],[],['*'],c=>`Fechado então. O passo a passo: você me confirma os dados da ${c.loja}, eu finalizo o site e publico. O pagamento pode ser por Pix. Posso te mandar a chave?`),
  M('fc-resumo','Resumo do combinado',['transparencia','reducao-risco'],[],['*'],c=>`Pra confirmar o que combinamos: site da ${c.loja}, ${c.pix} à vista no Pix (ou ${c.promo} nas outras formas), pagamento único e um mês de pequenos ajustes. Está certo assim?`),
  M('fc-falta-algo','Falta alguma informação?',['reducao-pressao','consultiva'],[],['*'],c=>`Do meu lado está tudo pronto pra finalizar. Falta alguma informação pra você decidir, ou posso seguir?`),
  M('fc-forma','Escolha da forma de pagamento',['autonomia-explicita','fluencia'],[],['*'],c=>`Como fica melhor pra você: ${c.pix} à vista no Pix ou ${c.promo} na outra forma?`),
  M('fc-dados','Dados para finalizar',['proximo-passo-pequeno','fluencia'],[],['*'],c=>`Pra finalizar eu preciso de três coisas: a logo, o horário de funcionamento e o WhatsApp que vai receber os orçamentos. Consegue me mandar?`),
  M('fc-endereco','Escolha do endereço',['proximo-passo-pequeno','personalizacao'],[],['*'],c=>`Qual endereço você prefere pro site? Me diz duas opções de nome e eu verifico se estão livres.`),
  M('fc-duvida','Tira dúvida de quem ia pensar',['escuta','reducao-pressao'],[],['*'],c=>`Você comentou que ia pensar. Tem alguma dúvida que eu possa tirar pra facilitar a decisão, seja ela qual for?`),
  M('fc-recebido','Pagamento recebido',['transparencia','fluencia'],[],['*'],c=>`Recebi, obrigado. Agora eu finalizo o site da ${c.loja} e te mando pra aprovar antes de publicar.`,'Só envie depois de conferir o pagamento na sua conta.'),
  M('fc-proposta','Proposta enviada',['transparencia','reducao-pressao'],[],['*'],c=>`Te mandei a proposta com valor, itens e prazo. Lê com calma e me diz se algum ponto precisa ser ajustado.`,'Só envie se a proposta já foi enviada.'),
  M('fc-limite','Limite sincero do valor',['justica-preco','transparencia'],[],['*'],c=>`Prefiro ser sincero: abaixo de ${c.pix} no Pix eu não consigo, porque é o mesmo site e o mesmo mês de ajustes. Se couber assim, a gente fecha; se não couber agora, sem problema nenhum.`)
 ],
 'recuperar':[
  M('rc-retomar','Ainda faz sentido?',['reducao-pressao','autonomia-explicita'],[],['*'],c=>`${c.oi} Tudo certo por aí? A gente tinha começado a conversar sobre o site da ${c.loja} e eu não quis ficar insistindo. Ainda faz sentido retomar ou mudou alguma coisa?`),
  M('rc-devendo','Fiquei devendo a prévia',['reciprocidade-previa','proximo-passo-pequeno'],['demo'],['*'],c=>`${c.oi} Fiquei devendo te mostrar a prévia da ${c.loja}. Posso te mandar agora?`),
  M('rc-retirada','Considera encerrado',['retirada','reducao-pressao'],[],['*'],c=>`${c.oi} Como a conversa parou, vou considerar que o site não é prioridade pra ${c.loja} agora. Sem problema nenhum. Se mudar, é só me dar um alô.`),
  M('rc-aprender','Pergunta o motivo para aprender',['escuta','perguntas'],[],['*'],c=>`${c.oi} Uma curiosidade, pra eu aprender: o que fez você deixar o site pra depois? Foi o valor, o momento ou não viu tanta utilidade? Qualquer resposta me ajuda.`),
  M('rc-atualizei','Prévia atualizada',['reciprocidade-previa','curiosidade'],['demo'],['*'],c=>`${c.oi} Atualizei a prévia da ${c.loja}. Quer ver como ficou?`,'Só envie se você realmente atualizou a prévia.'),
  M('rc-opcoes','Três caminhos',['autonomia-explicita','fluencia'],[],['*'],c=>`${c.oi} Sobre o site da ${c.loja}, o que fica melhor pra você: retomar agora, eu te chamar mês que vem ou encerrar o assunto?`),
  M('rc-valor','Relembra a condição',['transparencia','justica-preco'],['precoVisto'],['*'],c=>`${c.oi} Só relembrando, caso tenha ficado dúvida: o site da ${c.loja} é pagamento único, ${c.pix} no Pix, com um mês de ajustes. Quer seguir ou prefere deixar pra depois?`),
  M('rc-decisor','Conversou com quem decide?',['consultiva','escuta'],[],['*'],c=>`${c.oi} Conseguiu conversar com quem decide aí sobre o site? Se surgiu alguma dúvida, me fala que eu respondo.`),
  M('rc-arquivar','Posso arquivar a prévia?',['retirada','fluencia'],['demo'],['*'],c=>`${c.oi} Ainda quer ver o site da ${c.loja} ou posso arquivar a prévia?`),
  M('rc-empatia','Não quero ser mais uma pendência',['reducao-pressao','autonomia-explicita'],[],['*'],c=>`${c.oi} Sei que loja não para. Não quero ser mais uma coisa pra você resolver, então me diz só se continuo te esperando ou se deixo o assunto de lado.`)
 ],
 'pos-venda':[
  M('pv-entrega','Entrega do site',['transparencia','escuta'],['demo'],['*'],c=>`Site da ${c.loja} no ar: ${c.demoUrl} Dá uma conferida geral e me fala qualquer ajuste. Vocês têm um mês de pequenas alterações incluído.`),
  M('pv-divulgar','Onde colocar o link',['fluencia','reciprocidade-previa'],[],['*'],c=>`Dica pra aproveitar o site: coloca o link na bio do Instagram, no perfil do Google e no status do WhatsApp. É por esses lugares que o cliente chega nele.`),
  M('pv-semana','Como foi a primeira semana',['escuta','perguntas'],[],['*'],c=>`${c.oi} Faz uma semana que o site da ${c.loja} está no ar. Algum cliente já comentou ou pediu orçamento por ele?`),
  M('pv-ajustes','Lembra do mês de ajustes',['reciprocidade-previa','transparencia'],[],['*'],c=>`${c.oi} Lembrando que o mês de pequenos ajustes ainda está valendo. Quer mudar algum texto, foto ou serviço?`),
  M('pv-google','Site no perfil do Google',['reciprocidade-previa','fluencia'],[],['*'],c=>`Uma coisa que ajuda: colocar o endereço do site no Perfil da Empresa no Google. Quer que eu te explique como faz?`),
  M('pv-opiniao','Pede opinião sincera',['escuta','perguntas'],[],['*'],c=>`${c.oi} Posso te pedir uma opinião sincera? O que você achou do processo todo, do primeiro contato até a entrega? Quero melhorar.`),
  M('pv-fim-suporte','Fim do mês de ajustes',['transparencia','reducao-pressao'],[],['*'],c=>`${c.oi} O mês de ajustes do site da ${c.loja} está chegando ao fim. Tem alguma alteração que você queira fazer antes?`),
  M('pv-depoimento','Pede um depoimento',['prova-social','autonomia-explicita'],[],['*'],c=>`${c.oi} Se você ficou satisfeito com o site, toparia me mandar uma frase curta contando como foi? Uso só com a sua autorização.`),
  M('pv-novidade','Serviço novo no site',['personalizacao','reciprocidade-previa'],[],['*'],c=>`${c.oi} Se a ${c.loja} começar a oferecer algum serviço novo, me avisa que eu te digo como incluir no site.`),
  M('pv-obrigado','Agradecimento',['fluencia'],[],['*'],c=>`Obrigado pela confiança. Qualquer coisa com o site, é só me chamar por aqui.`)
 ],
 'indicacao':[
  M('in-direta','Pedido direto',['perguntas','reciprocidade-previa'],[],['*'],c=>`${c.oi} Você conhece outro dono de loja que também poderia querer um site como o da ${c.loja}? Se puder me passar o contato, eu agradeço.`),
  M('in-outra-cidade','Colega de outra cidade',['reducao-pressao','perguntas'],[],['*'],c=>`${c.oi} Uma pergunta: tem algum colega do ramo, de outra cidade, que você acha que se interessaria? De outra cidade pra não virar concorrência pra vocês.`),
  M('in-elogio','Se alguém elogiar',['fluencia','prova-social'],[],['*'],c=>`Se alguém elogiar o site da ${c.loja}, pode passar meu contato. Me ajuda bastante.`),
  M('in-exemplo','Usar como exemplo',['autonomia-explicita','prova-social'],[],['*'],c=>`${c.oi} Posso usar o site da ${c.loja} como exemplo quando eu for mostrar meu trabalho pra outras lojas?`),
  M('in-lembra','Lembra de alguém?',['perguntas','fluencia'],[],['*'],c=>`${c.oi} Estou procurando outras lojas pra fazer site. Lembra de alguém que valha eu procurar?`),
  M('in-nome','Posso dizer que foi você',['transparencia','prova-social'],[],['*'],c=>`Se você indicar alguém, me avisa o nome pra eu dizer que foi você quem indicou. Facilita muito a conversa.`),
  M('in-vizinho','Vizinho ou fornecedor',['perguntas','personalizacao'],[],['*'],c=>`${c.oi} Seu fornecedor ou algum vizinho de loja tem site? Se não tiver, me apresenta?`),
  M('in-grupo','Grupo de lojistas',['prova-social','autonomia-explicita'],[],['*'],c=>`${c.oi} Você participa de algum grupo de lojistas? Se achar que cabe, pode compartilhar o site da ${c.loja} lá e dizer quem fez.`),
  M('in-retribuir','Oferece retribuir',['reciprocidade-previa','escuta'],[],['*'],c=>`Obrigado de novo pela parceria. Se eu puder retribuir indicando a ${c.loja} pra alguém, me fala como vocês preferem ser indicados.`),
  M('in-avaliacao','Pede uma avaliação',['prova-social','proximo-passo-pequeno'],[],['*'],c=>`${c.oi} Uma avaliação sua sobre o meu trabalho ajudaria muito. Te mando o link?`,'Só envie se você tiver um perfil público para receber avaliações.')
 ]
};

/* ---------- objeções e dúvidas: cinco respostas de estratégias diferentes para cada uma ---------- */
const R=(id,nome,tec,f,{req=[],cuidado='',soSe=''}={})=>({id,nome,tec,req,perfis:['*'],f,cuidado,soSe});
export const OBJECOES={
 'sem-dinheiro':{rotulo:'Sem dinheiro agora',tipo:'objecao',respostas:[
  R('od-retomar','Respeita e combina retomada',['reducao-pressao','autonomia-explicita'],c=>`Entendo, e não vou insistir. Só pra eu me organizar: quer que eu te procure de novo mais pra frente? Se sim, me diz um mês bom.`),
  R('od-condicao','Esclarece a condição real',['transparencia','justica-preco'],c=>`Tranquilo. Só pra você ter a informação completa: é pagamento único de ${c.pix} no Pix, sem mensalidade. Se mesmo assim não couber agora, eu entendo e a gente deixa pra outro momento.`),
  R('od-diagnostico','Caixa ou valor percebido?',['escuta','perguntas'],c=>`Compreendo. Me ajuda a entender: é mais uma questão de caixa neste mês ou você ainda não vê o site valendo esse investimento? As duas respostas são válidas.`),
  R('od-guardar','Guarda a prévia',['reciprocidade-previa','reducao-pressao'],c=>`Sem problema. Deixo a prévia da ${c.loja} guardada e não mexo nela. Quando o momento melhorar, é só me chamar que a gente retoma de onde parou.`,{req:['temDemoCriada']}),
  R('od-encerrar','Encerra com cordialidade',['retirada','reducao-pressao'],c=>`Entendido, obrigado pela sinceridade. Vou deixar quieto por aqui. Se um dia quiser retomar, meu contato fica com você.`)
 ]},
 'momento':{rotulo:'Agora não / época complicada',tipo:'objecao',respostas:[
  R('om-quando','Pergunta quando voltar',['autonomia-explicita','reducao-pressao'],c=>`Faz sentido, tem época que aperta mesmo. Prefere que eu volte a falar com você no começo do mês que vem ou mais pra frente?`),
  R('om-sem-pressa','Tira a pressa da decisão',['reducao-pressao','transparencia'],c=>`Entendo, e não vou te apressar. Quando ficar melhor pra você, a gente conversa. Quer que eu te chame ou prefere me procurar?`),
  R('om-previa','Deixa a prévia pronta enquanto isso',['reciprocidade-previa','reducao-risco'],c=>`Sem pressa. Quer que eu deixe a prévia pronta enquanto isso, pra quando você puder ver com calma?`),
  R('om-data','Combina uma data',['proximo-passo-pequeno','reducao-pressao'],c=>`Combinado. Me diz só uma data aproximada e eu te chamo nela, sem ficar mandando mensagem antes.`),
  R('om-motivo','Correria ou caixa?',['escuta','perguntas'],c=>`Tudo bem. É a correria da loja ou é o caixa que está apertado agora? Pergunto só pra saber quando faz sentido voltar.`)
 ]},
 'sem-tempo':{rotulo:'Falta de tempo',tipo:'objecao',respostas:[
  R('ot-pouco','Mostra que exige pouco',['fluencia','reducao-risco'],c=>`Imagino a correria. Do seu lado é pouca coisa: uns cinco minutos pra me dizer o que mudar na prévia. O resto eu faço.`),
  R('ot-sozinho','Eu faço tudo sozinho',['reciprocidade-previa','reducao-pressao'],c=>`Tranquilo. Que tal eu montar tudo sozinho e você só olhar quando sobrar um tempo? Não precisa parar nada aí.`),
  R('ot-horario','Pergunta o melhor horário',['autonomia-explicita','reducao-pressao'],c=>`Sem problema. Qual o melhor dia e horário pra eu te chamar, quando a loja estiver mais calma?`),
  R('ot-audio','Oferece um áudio curto',['fluencia','autonomia-explicita'],c=>`Entendo. Se preferir, eu te mando um áudio de um minuto explicando e você ouve quando der.`),
  R('ot-link','Só o link para abrir depois',['proximo-passo-pequeno','reducao-pressao'],c=>`Combinado, não vou tomar seu tempo agora. Posso te mandar só o link da prévia pra você abrir quando quiser?`)
 ]},
 'sem-interesse':{rotulo:'Não tem interesse',tipo:'recusa',respostas:[
  R('os-obrigado','Agradece e encerra',['retirada','reducao-pressao'],c=>`Tudo bem, obrigado por responder. Não vou mais te incomodar com isso. Sucesso aí com a ${c.loja}.`),
  R('os-contato','Encerra e deixa o contato',['retirada','reducao-pressao'],c=>`Entendido, agradeço a sinceridade. Fica o meu contato caso um dia precise. Um abraço.`),
  R('os-curta','Encerramento curto',['fluencia','retirada'],c=>`Sem problema. Obrigado pelo retorno, bom trabalho pra vocês.`),
  R('os-porta','Encerra deixando a porta aberta',['retirada','autonomia-explicita'],c=>`Combinado, não insisto. Se um dia quiser ver como ficaria um site da ${c.loja}, é só chamar.`),
  R('os-futuro','Pergunta se pode voltar no futuro',['autonomia-explicita','reducao-pressao'],c=>`Tranquilo. Você prefere que eu não toque mais no assunto ou posso te procurar de novo daqui a uns meses?`,{soSe:'recusa-suave'})
 ]},
 'ja-tem-site':{rotulo:'Já tem site',tipo:'objecao',respostas:[
  R('oj-qual','Pergunta qual é o endereço',['escuta','transparencia'],c=>`Que bom, eu não sabia. Qual é o endereço? Queria dar uma olhada, até pra não te oferecer algo que você já tem.`,{soSe:'site-desconhecido'}),
  R('oj-resultado','Pergunta se traz orçamento',['consultiva','perguntas'],c=>`Legal. E ele está trazendo pedido de orçamento ou fica mais como um cartão de visita?`),
  R('oj-sincero','Opinião sincera sobre o site atual',['personalizacao','reciprocidade-previa'],c=>`Eu vi o site de vocês. Posso ser sincero? Pelo celular ele não deixa claro ${c.s1?'o serviço de '+c.s1:'os serviços'} nem tem um botão de orçamento à vista. Se quiser, te mostro numa prévia o que eu mudaria.`,{soSe:'site-conhecido',cuidado:'Só envie se você realmente abriu o site atual e viu isso.'}),
  R('oj-manutencao','Quem cuida do site hoje',['consultiva','perguntas'],c=>`Entendi. Quem fez o site ainda dá manutenção ou ele está parado desde que ficou pronto?`),
  R('oj-encerrar','Reconhece e encerra',['retirada','reducao-pressao'],c=>`Perfeito, então essa parte já está resolvida. Não vou insistir. Se um dia quiser uma segunda opinião sobre ele, me chama.`)
 ]},
 'instagram-basta':{rotulo:'Instagram é suficiente',tipo:'objecao',respostas:[
  R('oi-google','E quem procura no Google?',['consultiva','perguntas'],c=>`Faz sentido, o Instagram funciona bem pra muita loja. Uma dúvida sincera: quem não tem Instagram ou procura direto no Google consegue achar os serviços e o WhatsApp de vocês?`),
  R('oi-junto','Entra junto, não no lugar',['enquadramento','reducao-pressao'],c=>`Concordo que o Insta ajuda bastante. O site não entra no lugar dele, entra junto: vira o link da bio, com serviços, endereço e orçamento num lugar só.`),
  R('oi-direct','Trabalho de responder no direct',['consultiva','enquadramento'],c=>`Entendo. Hoje, quando alguém pergunta preço no direct, vocês respondem um por um? É nessa parte que o site tira trabalho.`),
  R('oi-concorda','Concorda e se retira',['retirada','reducao-pressao'],c=>`Tranquilo. Se o Instagram já traz o movimento que vocês querem, realmente pode não ser prioridade. Se um dia sentir falta de aparecer no Google também, me chama.`),
  R('oi-proprio','O perfil não é de vocês',['aversao-perda','enquadramento'],c=>`Justo. Só um ponto pra pensar: o perfil é do Instagram, não de vocês. O site é o endereço que fica com a ${c.loja} independente da rede.`)
 ]},
 'depende-do-valor':{rotulo:'Depende do valor / quanto custa',tipo:'interesse',respostas:[
  R('ov-direto-previa','Valor direto e oferta de prévia',['transparencia','reducao-risco'],c=>`Justo. É ${c.promo} em pagamento único, ou ${c.pix} à vista no Pix. Quer ver uma prévia do site da ${c.loja} antes, pra avaliar se vale?`,{soSe:['sem-demo','preco-novo']}),
  R('ov-apos-demo','Valor do site que já viu',['transparencia','escuta'],c=>`Claro. O site que te mandei fica ${c.promo}, ou ${c.pix} no Pix, pagamento único com um mês de ajustes. Cabe no que você imaginava?`,{soSe:['com-demo','preco-novo']}),
  R('ov-expectativa','Valor e pergunta a expectativa',['transparencia','perguntas'],c=>`Te passo já: ${c.pix} no Pix ou ${c.promo} nas outras formas, uma vez só. Qual valor você tinha em mente? Pergunto pra ser sincero sobre o que dá pra fazer.`,{soSe:'preco-novo'}),
  R('ov-autonomia','Valor com liberdade para recusar',['transparencia','autonomia-explicita'],c=>`Valor: ${c.promo}, ou ${c.pix} à vista no Pix. Não tem mensalidade minha. Se achar que não compensa pra ${c.loja}, pode me falar sem problema.`,{soSe:'preco-novo'}),
  R('ov-ancora','Valor normal e condição atual',['ancoragem-honesta','transparencia'],c=>`O projeto normalmente sai por ${c.normal}. A condição atual é ${c.promo}, e no Pix ${c.pix}. Te explico o que entra nesse valor?`,{soSe:'preco-novo'}),
  R('ov-confirma','Confirma o valor já dito e pergunta se cabe',['transparencia','escuta'],c=>`É aquele valor que te passei: ${c.promo}, ou ${c.pix} à vista no Pix, uma vez só e sem mensalidade minha. Ficou dentro do que você imaginava ou fora?`,{soSe:'preco-ja-dito'}),
  R('ov-o-que-pesa','Pergunta o que pesa na decisão',['escuta','perguntas'],c=>`Entendo. Sobre o valor que te passei, o que pesa mais pra você decidir: o valor em si ou saber se o site vai trazer retorno pra ${c.loja}?`,{soSe:'preco-ja-dito'}),
  R('ov-entrega','Lembra o que entra no valor',['justica-preco','transparencia'],c=>`Faz sentido pesar o valor. Naquele valor que te passei entra o site completo da ${c.loja}, a publicação e um mês de pequenos ajustes, sem mensalidade minha. Tem alguma parte disso que você queria entender melhor?`,{soSe:'preco-ja-dito'}),
  R('ov-ver-antes','Propõe ver antes de decidir pelo valor',['reducao-risco','reciprocidade-previa'],c=>`Justo, valor só faz sentido olhando o que se leva. Quer que eu monte a prévia do site da ${c.loja} pra você decidir vendo?`,{soSe:['preco-ja-dito','sem-demo']}),
  R('ov-autonomia-2','Deixa livre para dizer que não cabe',['autonomia-explicita','reducao-pressao'],c=>`Sem problema. Se o valor que te passei não couber agora, pode me dizer com sinceridade que eu não insisto. Se couber, eu te explico o próximo passo.`,{soSe:'preco-ja-dito'})
 ]},
 'caro':{rotulo:'Achou caro',tipo:'objecao',respostas:[
  R('oc-comparacao','Caro comparado com o quê?',['escuta','perguntas'],c=>`Entendo. Comparado com o quê você achou caro? Pergunto porque às vezes a comparação é com site de mensalidade, e o meu é pagamento único.`),
  R('oc-valer','O que faria valer',['consultiva','perguntas'],c=>`Faz sentido pesar o valor. Me diz: o que precisaria ter no site pra você sentir que vale os ${c.pix}?`),
  R('oc-limite','Limite sincero',['justica-preco','transparencia'],c=>`Compreendo. O ${c.pix} no Pix é o menor valor que eu consigo fazer mantendo a qualidade. Se não couber agora, sem problema, a gente deixa pra depois.`),
  R('oc-unico','Pagamento que não se repete',['enquadramento','reducao-pressao'],c=>`Justo. Pensa assim: é um pagamento só, e o site continua no ar depois. Mas se pra ${c.loja} não fecha a conta agora, eu respeito.`),
  R('oc-itens','Explica item por item',['justica-preco','transparencia'],c=>`Entendo. Prefere que eu te explique item por item o que está incluído, pra você julgar melhor se o valor faz sentido?`)
 ]},
 'desconto':{rotulo:'Pediu desconto',tipo:'objecao',respostas:[
  R('ox-pix','Aponta a condição do Pix',['ancoragem-honesta','transparencia'],c=>`Consigo te oferecer a condição do Pix, que já baixa de ${c.promo} pra ${c.pix}. Abaixo disso eu não consigo sem tirar coisa do site.`),
  R('ox-entrega','Mantém o valor e reforça a entrega',['justica-preco','transparencia'],c=>`Entendo o pedido. Em vez de baixar o valor, prefiro garantir o que entrego: site completo e um mês de ajustes por ${c.pix} no Pix. Fecha assim?`),
  R('ox-quanto','Pergunta o valor pensado',['escuta','perguntas'],c=>`Qual valor você tinha pensado? Te digo com sinceridade se dá ou não.`),
  R('ox-menor','Já é o menor valor',['ancoragem-honesta','reducao-pressao'],c=>`O ${c.pix} no Pix já é o valor mais baixo, saindo do normal de ${c.normal}. Se ainda assim não der, eu entendo e fica o convite pra quando puder.`),
  R('ox-sincero','Limite sincero',['justica-preco','transparencia'],c=>`Prefiro ser sincero: abaixo de ${c.pix} no Pix eu não consigo, porque é o mesmo site e o mesmo mês de ajustes. Se couber assim, a gente fecha.`)
 ]},
 'vou-pensar':{rotulo:'Vai pensar',tipo:'objecao',respostas:[
  R('op-duvida','Oferece tirar dúvida',['escuta','reducao-pressao'],c=>`Claro, pensa com calma. Tem alguma dúvida que eu possa tirar agora pra ajudar na decisão?`),
  R('op-quem-chama','Quem chama quem',['autonomia-explicita','reducao-pressao'],c=>`Tranquilo. Quer que eu te chame em alguns dias ou prefere me procurar quando decidir?`),
  R('op-peso','O que mais pesa',['consultiva','perguntas'],c=>`Sem pressa. Só me diz o que mais pesa na decisão, valor, momento ou outra coisa, pra eu saber se posso ajudar em algo.`),
  R('op-previa','Deixa a prévia no ar',['reciprocidade-previa','reducao-pressao'],c=>`Combinado. Deixo a prévia no ar pra você rever quando quiser.`,{req:['demo']}),
  R('op-nao','Pode dizer não',['retirada','autonomia-explicita'],c=>`Fica à vontade. Se a resposta for não, pode me dizer também, não fico chateado e paro de te chamar.`)
 ]},
 'socio':{rotulo:'Precisa falar com sócio / não decide',tipo:'objecao',respostas:[
  R('oo-resumo','Resumo para encaminhar',['fluencia','reciprocidade-previa'],c=>`Faz todo sentido decidir junto. Quer que eu te mande um resumo curto com link, valor e o que entra, pra você encaminhar?`),
  R('oo-direto','Oferece falar direto',['consultiva','reducao-pressao'],c=>`Claro. Se ajudar, posso explicar direto pra quem decide e tirar as dúvidas dele.`),
  R('oo-antecipa','Antecipa a pergunta do sócio',['escuta','perguntas'],c=>`Tranquilo. O que você acha que ele vai perguntar primeiro? Já te deixo com a resposta.`),
  R('oo-quando','Combina quando voltar',['reducao-pressao','autonomia-explicita'],c=>`Combinado. Quando vocês costumam conversar sobre isso? Te chamo depois, sem atropelar.`),
  R('oo-uma-msg','Tudo numa mensagem só',['fluencia','transparencia'],c=>`Perfeito. Te mando a prévia e os valores numa mensagem só, fácil de encaminhar.`)
 ]},
 'desconfianca':{rotulo:'Desconfiança / medo de golpe',tipo:'objecao',respostas:[
  R('og-justa','Reconhece e explica quem é',['confianca-inicial','transparencia'],c=>`Pergunta justa, tem muito golpe por aí. Sou o ${c.eu}, desenvolvedor, e faço contato direto assim com ${c.negPlural}. Não peço nada adiantado pra te mostrar a prévia.`),
  R('og-ver-antes','Vê antes de pagar',['reducao-risco','transparencia'],c=>`Entendo a desconfiança. Por isso eu mostro o site pronto antes de falar em pagamento: você vê o trabalho primeiro.`),
  R('og-exemplo','Mostra um trabalho real',['prova-social','reducao-risco'],c=>`Sem problema em desconfiar. Posso te mandar um site que eu já fiz pra você conferir que é real?`,{cuidado:'Só envie se você tiver um site seu, publicado, para mostrar.'}),
  R('og-sem-dados','Não pede dado nenhum',['confianca-inicial','reducao-risco'],c=>`Faz bem em perguntar. Eu não peço senha, cadastro nem dado nenhum. É só um site pra sua loja, que você aprova antes de pagar.`),
  R('og-ligacao','Oferece uma ligação',['confianca-inicial','autonomia-explicita'],c=>`Tranquilo. Se preferir, a gente faz uma ligação rápida ou chamada de vídeo pra você ver com quem está falando.`)
 ]},
 'sem-necessidade':{rotulo:'Não vê necessidade',tipo:'objecao',respostas:[
  R('on-concorda','Concorda e pergunta',['retirada','consultiva'],c=>`Pode ser que não precise mesmo. Só por curiosidade: hoje o movimento vem mais de cliente antigo e indicação?`),
  R('on-google','E quem não conhece?',['consultiva','perguntas'],c=>`Entendo. E quem ainda não conhece a ${c.loja} e pesquisa no Google, encontra vocês com facilidade?`),
  R('on-encerrar','Encerra com respeito',['retirada','reducao-pressao'],c=>`Justo, se está funcionando bem assim, não faz sentido mexer. Fico à disposição se um dia mudar de ideia.`),
  R('on-previa','Mostra sem custo',['reciprocidade-previa','reducao-risco'],c=>`Tranquilo. Se quiser só ver como ficaria, eu monto a prévia e você decide olhando. Se não quiser, sem problema nenhum.`),
  R('on-reputacao','Avaliações que já existem',['personalizacao','enquadramento'],c=>`Faz sentido. O ponto que me chamou atenção foi outro: vocês já têm ${c.aval} avaliações com nota ${c.nota}, e isso poderia trabalhar por vocês fora do Maps também. Mas se não for prioridade, eu entendo.`,{req:['avaliacoes']})
 ]},
 'conhecido-faz':{rotulo:'Um conhecido faz',tipo:'objecao',respostas:[
  R('ok-otimo','Reconhece e se coloca à disposição',['retirada','reducao-pressao'],c=>`Ótimo, se já tem quem faça fica mais fácil. Se por acaso não sair do papel, me chama que eu te mostro uma prévia.`),
  R('ok-prazo','Pergunta se já está andando',['consultiva','perguntas'],c=>`Legal. Ele já começou ou ainda está só combinado? Pergunto porque essas coisas costumam ficar pra depois.`),
  R('ok-comparar','Oferece uma prévia para comparar',['reciprocidade-previa','autonomia-explicita'],c=>`Tranquilo. Se quiser uma segunda opção pra comparar, eu monto uma prévia e você escolhe a que achar melhor.`),
  R('ok-encerrar','Encerra',['retirada','fluencia'],c=>`Perfeito, então você está bem servido. Sucesso com o site.`),
  R('ok-ajuda','Oferece ajuda pontual',['reciprocidade-previa','escuta'],c=>`Bacana. Se ele precisar de uma opinião sobre como organizar os serviços e o botão de orçamento, posso dar um toque sem custo.`)
 ]},
 'nao-gostou':{rotulo:'Não gostou da prévia',tipo:'objecao',respostas:[
  R('ng-o-que','Pergunta o que incomodou',['escuta','perguntas'],c=>`Obrigado pela sinceridade, é isso que me ajuda. O que mais te incomodou: as cores, as fotos ou o jeito que os serviços aparecem?`),
  R('ng-refaco','Refaz a parte que não agradou',['reciprocidade-previa','reducao-risco'],c=>`Sem problema, a prévia serve justamente pra isso. Me diz o que não agradou e eu refaço essa parte pra você ver de novo.`),
  R('ng-referencia','Pede uma referência',['perguntas','personalizacao'],c=>`Entendi. Tem algum site que você acha bonito, de qualquer ramo? Me manda que eu uso como referência pra ajustar o da ${c.loja}.`),
  R('ng-caminho','O que estava no caminho certo',['escuta','consultiva'],c=>`Valeu por falar. Teve alguma parte que você achou que estava no caminho certo, ou prefere que eu comece de outro jeito?`),
  R('ng-livre','Deixa livre para parar',['autonomia-explicita','retirada'],c=>`Tudo bem, agradeço por ter olhado. Se preferir que eu não mexa mais nisso, é só falar. Se quiser, eu ajusto o que você apontar.`)
 ]},
 'duvida-pagamento':{rotulo:'Dúvida sobre pagamento',tipo:'duvida',respostas:[
  R('dp-unico','Pagamento único',['transparencia','fluencia'],c=>`É pagamento único: ${c.pix} à vista no Pix, ou ${c.promo} nas outras formas. Não tem mensalidade minha.`),
  R('dp-fica','Paga uma vez e o site fica',['justica-preco','transparencia'],c=>`Você paga uma vez pelo desenvolvimento e o site fica com vocês. No Pix sai ${c.pix}.`),
  R('dp-formas','Formas e pergunta a preferência',['autonomia-explicita','transparencia'],c=>`O pagamento é único: ${c.pix} no Pix ou ${c.promo} nas outras formas. Como você prefere pagar?`),
  R('dp-nao-assinatura','Não é assinatura',['transparencia','reducao-risco'],c=>`Não é assinatura. É um valor só, ${c.promo}, ou ${c.pix} se for à vista no Pix, e inclui um mês de pequenos ajustes.`),
  R('dp-pix','Melhor condição no Pix',['ancoragem-honesta','fluencia'],c=>`Aceito Pix, que tem a melhor condição (${c.pix}). Nas outras formas o valor é ${c.promo}. O que fica melhor pra você?`)
 ]},
 'duvida-hospedagem':{rotulo:'Dúvida sobre hospedagem',tipo:'duvida',respostas:[
  R('dh-direta','Resposta direta',['transparencia'],c=>`${c.hospedagem}`,{cuidado:'Confira se esta é a sua condição real de hospedagem. Você pode definir o texto em Propostas › Condições comerciais.'}),
  R('dh-separa','Separa desenvolvimento e hospedagem',['transparencia','justica-preco'],c=>`São duas coisas separadas: o valor que te passei é do desenvolvimento do site, pago uma vez. ${c.hospedagem}`,{cuidado:'Confira se esta é a sua condição real de hospedagem. Você pode definir o texto em Propostas › Condições comerciais.'}),
  R('dh-configuro','Eu cuido da parte técnica',['reducao-risco','fluencia'],c=>`Boa pergunta. Essa parte técnica fica comigo: eu configuro, publico e te entrego o site no ar, você não precisa mexer em nada. Quer que eu te explique como fica o custo disso no caso da ${c.loja}?`,{cuidado:'Se a empresa disser que sim, responda com a sua condição real de hospedagem.'}),
  R('dh-escrito','Valores por escrito antes de decidir',['transparencia','reducao-risco'],c=>`Pra não ficar nada no ar, eu te passo por escrito, antes de você decidir, tudo que envolve hospedagem e quanto custa. Assim não aparece surpresa depois. Pode ser?`),
  R('dh-ja-tem','Pergunta se já têm hospedagem',['escuta','perguntas'],c=>`Depende de uma coisa: vocês já têm alguma hospedagem ou domínio contratado hoje, ou seria tudo do zero? Pergunto pra te responder certo, sem chutar.`)
 ]},
 'duvida-manutencao':{rotulo:'Dúvida sobre manutenção',tipo:'duvida',respostas:[
  R('dm-mes','Um mês incluído',['transparencia','reducao-risco'],c=>`Você tem um mês de pequenos ajustes incluído. Depois disso o site continua no ar normalmente; se quiser mudar algo, a gente combina na hora.`),
  R('dm-pouca','Quase não exige manutenção',['fluencia','reducao-risco'],c=>`O site não precisa de manutenção constante. O que costuma mudar é preço, horário ou serviço, e no primeiro mês eu ajusto sem custo.`),
  R('dm-depois','Depois do primeiro mês',['transparencia','justica-preco'],c=>`No primeiro mês, qualquer ajuste pequeno é por minha conta. Passado esse prazo, você me chama quando precisar e eu te passo o valor antes de fazer.`),
  R('dm-sem-mensalidade','Sem mensalidade de manutenção',['transparencia','justica-preco'],c=>`Não cobro mensalidade de manutenção. O combinado é um mês de pequenas alterações incluído, e depois só se você pedir alguma mudança.`),
  R('dm-tranquilo','O que exige atenção',['reducao-risco','transparencia'],c=>`Fica tranquilo: o site continua funcionando sem você precisar mexer. A manutenção é só quando vocês quiserem atualizar alguma informação.`)
 ]},
 'duvida-dominio':{rotulo:'Dúvida sobre domínio',tipo:'duvida',respostas:[
  R('dd-direta','Resposta direta',['transparencia'],c=>`${c.dominio}`,{cuidado:'Confira se esta é a sua condição real de domínio. Você pode definir o texto em Propostas › Condições comerciais.'}),
  R('dd-o-que-e','Explica o que é domínio',['fluencia','transparencia'],c=>`Domínio é só o endereço do site, tipo ${c.slug||'nomedaloja'}.com.br. ${c.dominio}`,{cuidado:'Confira se esta é a sua condição real de domínio. Você pode definir o texto em Propostas › Condições comerciais.'}),
  R('dd-escolhe','Você escolhe o nome',['autonomia-explicita','proximo-passo-pequeno'],c=>`O nome quem escolhe é você. Me fala como gostaria que fosse o endereço da ${c.loja} e eu verifico se está livre e quanto custa o registro, antes de qualquer decisão.`),
  R('dd-de-voces','O endereço fica no nome da loja',['justica-preco','reducao-risco'],c=>`O importante é o endereço ficar no nome da ${c.loja}, e não no meu: se um dia vocês trocarem de profissional, o domínio continua com vocês. Eu só faço a configuração.`,{cuidado:'Só envie se você realmente registra o domínio no nome do cliente.'}),
  R('dd-ja-tem','Pergunta se já têm um',['escuta','perguntas'],c=>`Vocês já têm algum domínio registrado? Se tiverem, eu aproveito o que já existe. Se não, eu te explico as opções e o custo antes de fechar.`)
 ]},
 'como-funciona':{rotulo:'Como funciona?',tipo:'duvida',respostas:[
  R('cf-passos','Três passos',['fluencia','transparencia'],c=>`Funciona em três passos: eu monto uma prévia do site da ${c.loja}, você pede os ajustes, e depois de aprovar eu publico. Você não precisa configurar nada.`),
  R('cf-conteudo','O que o site tem',['personalizacao','fluencia'],c=>`É um site com os serviços da ${c.loja}, endereço, horário e um botão de orçamento que abre o WhatsApp de vocês. Eu monto tudo e te mando pra aprovar.`),
  R('cf-previa','Explica mostrando',['reciprocidade-previa','reducao-risco'],c=>`O mais fácil é te mostrar: eu monto a prévia da ${c.loja} e você entende vendo. Posso fazer?`),
  R('cf-valor','Como funciona e quanto custa',['transparencia','ancoragem-honesta'],c=>`Eu faço o site, você aprova e ele vai pro ar. O pagamento é único, ${c.promo} ou ${c.pix} no Pix, com um mês de pequenos ajustes.`),
  R('cf-pergunta','Devolve uma pergunta',['consultiva','perguntas'],c=>`Eu monto o site inteiro e te mando pra aprovar. Pra eu te explicar do jeito certo: o que você mais gostaria que o site resolvesse pra ${c.loja}?`)
 ]}
};
export const TODAS=[...Object.entries(MENSAGENS).flatMap(([etapa,l])=>l.map(m=>({...m,etapa}))),...Object.entries(OBJECOES).flatMap(([obj,o])=>o.respostas.map(m=>({...m,etapa:'objecao:'+obj})))];
export const mensagemPorId=id=>TODAS.find(m=>m.id===id)||null;
