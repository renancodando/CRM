/* Seis abordagens de primeira mensagem, proposta de valor, modelo recomendado e feedback de demonstração. Só usa fatos verificados da ficha; nada de promessas, urgência ou prova social inventada. */
import {auditarMensagem} from './linguagem.js';
import {tecnicaPorId,estudoPorId,graus} from './evidencias.js';
import {catalogo} from '../../estudio/catalogo.js';
import {podeContatar} from './dominio.js';
const rot={celulares:{negocio:'assistência técnica',plural:'assistências técnicas',cliente:'quem precisa consertar o celular',servicoEx:'troca de tela e bateria'},odontologia:{negocio:'clínica',plural:'clínicas',cliente:'pacientes novos',servicoEx:'avaliação e tratamentos'},automotivo:{negocio:'estética automotiva',plural:'estéticas automotivas',cliente:'quem quer cuidar do carro',servicoEx:'lavagem e polimento'}};
const cap=s=>s?s.charAt(0).toUpperCase()+s.slice(1):s,baixa=s=>s?s.charAt(0).toLowerCase()+s.slice(1):s;
const un=t=>t.replace(/\s+/g,' ').replace(/\s([.,!?])/g,'$1').trim();
function fatos(empresa){
 const r=rot[empresa.nicho]||{negocio:'empresa',plural:'pequenas empresas',cliente:'seus clientes',servicoEx:'seus serviços'},cidade=String(empresa.cidade||'').split(/[-,/]/)[0].trim();
 const verificadoSemSite=empresa.statusSite==='sem-site'&&/evid[eê]ncia/i.test(empresa.notas||'');
 return {r,cidade,pessoa:(empresa.contato||'').split(' ')[0],nome:empresa.nome,servicos:empresa.servicosOferecidos,dif:empresa.diferenciais,semSiteVerificado:verificadoSemSite,desatualizado:empresa.statusSite==='desatualizado',instagramAtivo:empresa.presenca?.instagramAtivo==='sim',avaliacoes:empresa.presenca?.avaliacoesQtd>0?{q:empresa.presenca.avaliacoesQtd,n:empresa.presenca.avaliacoesNota}:null};
}
const saud=(f,v)=>[`Oi${f.pessoa?', '+f.pessoa:''}, tudo bem?`,`Olá${f.pessoa?', '+f.pessoa:''}, tudo bem?`,`${f.pessoa?f.pessoa+', ':'Olá, '}tudo bem?`][v%3];
const quem=(autor,f,v)=>[`Aqui é ${autor}, desenvolvo sites para ${f.r.plural}`,`Me chamo ${autor} e faço sites para ${f.r.plural}`,`Sou ${autor}, desenvolvedor de sites para ${f.r.plural}`][v%3];
const motivo=f=>f.servicos.length?`Vi que a ${f.nome} trabalha com ${f.servicos.slice(0,2).map(baixa).join(' e ')}${f.cidade?' em '+f.cidade:''}`:f.cidade?`Encontrei a ${f.nome} em ${f.cidade}`:`Encontrei a ${f.nome}`;
const T=(ids)=>ids.map(id=>({id,nome:tecnicaPorId(id).nome,grau:graus[tecnicaPorId(id).grau]}));
const evid=(ids)=>[...new Set(ids.flatMap(id=>tecnicaPorId(id).evidencias))].map(id=>{const e=estudoPorId(id);return {id,ref:`${e.autores} (${e.ano})`,grau:graus[e.grau],limitacoes:e.limitacoes};});
export function observacaoVerificavel(empresa){
 const f=fatos(empresa);
 if(f.semSiteVerificado)return `não encontrei um site próprio da ${f.nome} (${(empresa.notas.match(/evid[^\n]*/i)||[''])[0].slice(0,80)})`;
 if(f.desatualizado)return `o site da ${f.nome} parece desatualizado em relação aos serviços e ao uso no celular`;
 if(f.instagramAtivo&&empresa.statusSite!=='possui')return `a ${f.nome} é bem ativa no Instagram, mas não vi um site próprio com serviços e contato em um só lugar`;
 if(f.avaliacoes&&f.avaliacoes.q>=5)return `a ${f.nome} tem ${f.avaliacoes.q} avaliações públicas${f.avaliacoes.n?' (nota '+f.avaliacoes.n+')':''}`;
 return '';
}
export function gerarAbordagens(estado,empresa,{demo=null,autor=estado.preferencias.nome||'Renan',variante=0}={}){
 const f=fatos(empresa),perm=podeContatar(empresa,'whatsapp'),out=[],v=variante,obs=observacaoVerificavel(empresa);
 const item=(id,nome,estrategia,texto,extra)=>{const t=un(texto);out.push({id,nome,estrategia,mensagem:t,auditoria:auditarMensagem(t,{primeiraMensagem:true}),disponivel:true,variante:v,...extra});};
 const nao=(id,nome,motivoIndisp)=>out.push({id,nome,estrategia:null,mensagem:'',disponivel:false,motivoIndisponivel:motivoIndisp});
 // A direta e transparente
 item('A','Direta e transparente','direta',`${saud(f,v)} ${quem(autor,f,v)}. ${motivo(f)} e queria perguntar se faz sentido eu te mostrar como poderia ficar um site simples para vocês, com serviços e contato em um só lugar.`,{
  porque:'Apresenta quem sou, o motivo específico e a intenção comercial logo no início, sem esconder a oferta (credibilidade).',tecnicas:T(['transparencia','personalizacao','fluencia']),evidencias:evid(['transparencia','personalizacao','fluencia']),
  pontosNegativos:['Pode ser recebida como mensagem comercial e ignorada.','Sem pergunta de interesse real, a resposta pode ser só "ok".'],
  proximas:{positivo:'Perguntar o que é mais importante no site para a empresa e oferecer ver uma prévia.',pergunta:'Responder objetivamente e devolver uma pergunta.',recusa:'Agradecer e registrar a recusa.',silencio:'Um único follow-up com novo ângulo após o intervalo configurado.'}});
 // B consultiva
 item('B','Consultiva','consultiva',`${saud(f,v)} ${quem(autor,f,v)}, então já aviso o contexto: sou eu quem faz os sites. ${f.servicos.length?`Vi que a ${f.nome} faz ${f.servicos.slice(0,2).map(baixa).join(' e ')}. `:''}Uma curiosidade honesta: hoje os clientes costumam encontrar vocês mais pelo Instagram, pelo WhatsApp ou por indicação?`,{
  porque:'Abre com uma pergunta real sobre o negócio e deixa claro o meu contexto profissional, sem fingir ser cliente.',tecnicas:T(['consultiva','transparencia','adaptativa']),evidencias:evid(['consultiva','transparencia','adaptativa']),
  pontosNegativos:['A resposta pode ser cortês e não levar a negócio.','Exige conversar mais antes de qualquer oferta.'],
  proximas:{positivo:'Conectar a resposta a um benefício concreto e oferecer uma prévia.',pergunta:'Responder e voltar à pergunta de necessidade.',recusa:'Agradecer e encerrar.',silencio:'Retomar com uma pergunta diferente, sem cobrar resposta.'}});
 // C demonstração
 if(demo&&demo.urlPublica)item('C','Por demonstração','demonstracao',`${saud(f,v)} ${quem(autor,f,v)}. ${motivo(f)} e deixei pronta uma prévia de como o site da ${f.nome} poderia ficar. Posso te mandar o link para você dar uma olhada?`,{
  porque:'Já existe uma demonstração personalizada e publicada; a mensagem pede permissão antes de enviar o link (evita link inesperado).',tecnicas:T(['reciprocidade-previa','proximo-passo-pequeno','personalizacao']),evidencias:evid(['reciprocidade-previa','proximo-passo-pequeno','personalizacao']),
  pontosNegativos:['Trabalho de produção antes de haver interesse.','Se o contato é frio, pode parecer intrusivo.'],
  proximas:{positivo:'Enviar o link, pedir feedback depois de alguns dias.',pergunta:'Responder e reiterar a permissão.',recusa:'Agradecer e arquivar a prévia.',silencio:'Não enviar o link; um único follow-up.'}});
 else nao('C','Por demonstração','Ainda não há uma demonstração personalizada com link publicado confirmado para esta empresa. Crie e publique uma no Estúdio e registre o link.');
 // D diagnóstico
 if(obs)item('D','Por diagnóstico','diagnostico',`${saud(f,v)} ${quem(autor,f,v)}. Ao pesquisar, ${obs}. Não sei se isso é um problema para vocês, por isso pergunto: faria sentido eu te mostrar uma ideia de como ficaria?`,{
  porque:'Parte de uma observação verificável da ficha e admite que não sabe se é problema, sem afirmar perda de vendas.',tecnicas:T(['transparencia','personalizacao','reducao-pressao']),evidencias:evid(['transparencia','personalizacao','reducao-pressao']),
  pontosNegativos:['Se a observação estiver errada, perde credibilidade: confirme antes.','Pode soar como crítica.'],
  proximas:{positivo:'Perguntar como os clientes encontram a empresa e oferecer a prévia.',pergunta:'Mostrar a evidência da observação.',recusa:'Agradecer.',silencio:'Um follow-up com outra observação verdadeira.'}});
 else nao('D','Por diagnóstico','Não há observação verificável registrada (site sem evidência, atividade no Instagram, avaliações). Verifique e registre antes de usar esta abordagem.');
 // E baixo atrito
 item('E','Baixo atrito','baixo-atrito',`${saud(f,v)} ${quem(autor,f,v)}. ${motivo(f)}. Só uma pergunta rápida: faz sentido eu te mostrar uma prévia de site para a ${f.nome}, ou esse assunto não é prioridade agora?`,{
  porque:'Pede uma única decisão pequena e oferece uma saída fácil, o que reduz o esforço de responder.',tecnicas:T(['fluencia','proximo-passo-pequeno','reducao-pressao']),evidencias:evid(['fluencia','proximo-passo-pequeno','reducao-pressao']),
  pontosNegativos:['Resposta "agora não" é fácil de dar.','Oferece a saída negativa explicitamente: teste se aumenta ou reduz respostas.'],
  proximas:{positivo:'Enviar a prévia (ou combinar de montá-la) e pedir feedback.',pergunta:'Responder e repetir a pergunta curta.',recusa:'Agradecer e registrar.',silencio:'Um follow-up curto em outro dia/horário.'}});
 // F autonomia
 item('F','Autonomia e baixa pressão','autonomia',`${saud(f,v)} ${quem(autor,f,v)}. ${motivo(f)}. Se um site para a ${f.nome} for algo que vocês já pensaram, posso te mostrar uma ideia; se não fizer sentido agora, tudo bem, é uma decisão totalmente de vocês.`,{
  porque:'Reconhece a autonomia do empresário para reduzir a sensação de pressão (reatância). Não provoca nem usa falso desinteresse.',tecnicas:T(['reducao-pressao','autonomia-explicita','transparencia']),evidencias:evid(['reducao-pressao','autonomia-explicita','transparencia']),
  pontosNegativos:['Evidência de que a frase de liberdade aumenta a aceitação é contestada: trate como hipótese a testar.','Pode soar passivo; não é "psicologia reversa" de provocar.'],
  proximas:{positivo:'Perguntar o que é mais importante e oferecer a prévia.',pergunta:'Responder objetivamente.',recusa:'Agradecer sem insistir.',silencio:'Um follow-up com valor concreto, ou encerrar.'}});
 return {permissao:perm,abordagens:out,aviso:perm.ok?(perm.aviso||''):'Contato bloqueado: '+perm.motivo,observacao:obs};
}
/* ---------- proposta de valor ---------- */
export function propostaDeValor(empresa,{demo=null,config=null}={}){
 const c=demo?.configuracao||{},tem=(x)=>!!(c[x]||empresa[x]),s=c.servicos?.length||empresa.servicosOferecidos.length,r=rot[empresa.nicho]||{negocio:'empresa'};
 const itens=[
  {recurso:'WhatsApp integrado',beneficio:'Facilita o cliente pedir um orçamento em um toque.',disponivel:!!(c.whatsapp||empresa.whatsapp),falta:'Cadastrar o WhatsApp público da empresa.'},
  {recurso:'Serviços organizados',beneficio:`Ajuda o cliente a entender quais serviços a ${r.negocio} realiza.`,disponivel:s>0,falta:'Informar os serviços realmente oferecidos.'},
  {recurso:'Localização e horário',beneficio:'Facilita encontrar a loja e saber quando há atendimento.',disponivel:!!((c.endereco||empresa.endereco)&&(c.horario||empresa.horario)),falta:'Cadastrar endereço e horários reais.'},
  {recurso:'Informações de garantia',beneficio:'Reduz dúvidas, desde que a garantia seja real.',disponivel:!!c.garantia,falta:'Só mencionar se a empresa informar a política real de garantia.'},
  {recurso:'Responsividade',beneficio:'Facilita o acesso pelo celular.',disponivel:true,falta:''},
  {recurso:'SEO local básico',beneficio:'Cria condições para a empresa ser encontrada por nome e cidade, sem prometer posição no Google.',disponivel:!!(c.cidade||empresa.cidade),falta:'Cadastrar cidade.'},
  {recurso:'Site profissional próprio',beneficio:'Apresenta o negócio em um canal próprio, além das redes sociais.',disponivel:true,falta:''},
  {recurso:'Portfólio e avaliações reais',beneficio:'Apoia a construção de confiança com provas verdadeiras.',disponivel:!!(c.avaliacoes&&c.avaliacoes.length&&c.avaliacoes.every(a=>a.autorizada)),falta:'Só usar avaliações reais e autorizadas.'}
 ];
 const evitar=[['Aumentar suas vendas / faturamento','Sem evidência: o site cria condições, não garante resultado.'],['Primeiro lugar no Google','Posição não pode ser prometida.'],['Você está perdendo clientes','Sem evidência de perda, é ameaça infundada.'],['Site "exclusivo" / "inovador"','Adjetivos sem prova.'],['Garantia ou prazo que não estão cadastrados','Só prometa o que está em proposta.'],['Depoimentos ou números de clientes','Só com casos reais e autorizados.']];
 return {usar:itens.filter(i=>i.disponivel),indisponiveis:itens.filter(i=>!i.disponivel),evitar,nota:'Somente benefícios que o projeto entrega com os dados verificados são listados como utilizáveis.'};
}
/* ---------- modelo do Estúdio ---------- */
const sinais={precision:['precis','qualidade','confian','profission','direto','organiz'],oficina:['tecnic','laudo','bancada','especializ','componente','placa'],pronto:['atendimento','acolh','bom atendimento','proxim','familia'],sorriso:['acolh','cuidado','famil','humaniz','crianca'],clara:['ciencia','tecnolog','clinic','moderno','preven'],essenza:['classic','tradic','sofistic','estetica','harmon'],blue:['rapid','pratic','energi','pacote','express'],impacto:['esport','performance','protecao','vitrifica','tecnic'],brisa:['tranquil','sofistic','premium','cuidado','spa']};
export function recomendarModelo(empresa){
 const lista=catalogo.filter(m=>!empresa.nicho||m.nicho===empresa.nicho),txt=(empresa.diferenciais.join(' ')+' '+empresa.servicosOferecidos.join(' ')+' '+empresa.potencial).normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase();
 const pont=lista.map(m=>{const hit=(sinais[m.id]||[]).filter(s=>txt.includes(s));return {modelo:m,pontos:hit.length,sinais:hit};}).sort((a,b)=>b.pontos-a.pontos);
 const sem=!pont.some(p=>p.pontos>0);
 return {ranking:pont.map((p,i)=>({id:p.modelo.id,nome:p.modelo.nome,estilo:p.modelo.estilo,pontos:p.pontos,porque:p.pontos?`Os diferenciais/serviços cadastrados mencionam ${p.sinais.join(', ')}, que combinam com o estilo "${p.modelo.estilo}".`:`Sem sinal específico na ficha; estilo "${p.modelo.estilo}".`})),sem,aviso:sem?'A ficha não traz sinais para distinguir os modelos. A escolha é sua; mostrar duas opções e perguntar a preferência é uma boa forma de descobrir.':'Recomendação por regras de correspondência com os diferenciais informados, não por previsão de venda.'};
}
export function sugestoesDeFeedback(texto){
 const n=String(texto||'').normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase(),s=[];const add=(re,acao)=>{if(re.test(n))s.push(acao);};
 add(/cor|azul|verde|vermelh|escur|claro/,'Ajustar a paleta (cores) no Estúdio e reenviar a nova versão.');add(/logo|marca/,'Pedir o logotipo em SVG/PNG e aplicar.');add(/foto|imagem/,'Pedir fotos reais da empresa (o modelo não usa imagens genéricas).');add(/texto|escrev|fala|descric/,'Revisar os textos com a empresa e atualizar serviços e descrição.');add(/preco|valor|caro/,'Retomar pelo valor percebido e opções de escopo/pagamento antes de mudar o preço.');add(/servico|falt/,'Atualizar a lista de serviços conforme o que a empresa realmente faz.');add(/telefone|whats|contato|endereco|horario/,'Corrigir contatos, endereço e horários com os dados reais.');add(/gostei|ficou bom|legal|bonito/,'Agradecer, perguntar se faria algum ajuste e propor o próximo passo (proposta).');add(/nao gostei|nao curti|feio/,'Perguntar o que mais incomodou antes de refazer; pode ser outro modelo.');
 return s.length?s:['Perguntar de forma aberta o que ficou bom e o que mudaria; o feedback não permitiu inferir ajustes.'];
}
