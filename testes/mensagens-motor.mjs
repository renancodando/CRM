/* Motor de conversas: interpretação, etapa pelo histórico inteiro, continuidade, objeções, recusa, incerteza, não repetição, fluxo de envio e persistência. Nada é enviado. */
import assert from 'node:assert/strict';
import {estadoInicial,normalizarEmpresa,normalizarEstado} from '../nucleo/esquema.js';
import {confirmarEnvioMensagem,registrarResposta,registrarDemonstracaoApresentada} from '../nucleo/acoes.js';
import {garantirCondicaoInicial} from '../nucleo/ofertas/condicoes.js';
import {interpretar,recomendar,decidirEtapa,selecionar,INTENCOES} from '../nucleo/conversao/motor.js';
import {compor,validarMensagem,situacoesBiblioteca} from '../nucleo/conversao/compositor.js';
import {OBJECOES,MENSAGENS,mensagemPorId} from '../nucleo/conversao/biblioteca.js';
import {criarExperimentoConversao,distribuir,memoriaAbordagens} from '../nucleo/conversao/laboratorio.js';
import * as F from '../nucleo/conversao/fluxo.js';
import {similaridade} from '../nucleo/negociacao/mensagens.js';
let n=0;const ok=(nome,f)=>{try{f();n++;console.log('✔',nome);}catch(e){console.log('✘',nome,'\n  ',e.stack.split('\n').slice(0,5).join('\n'));process.exitCode=1;}};
const T0=Date.UTC(2026,10,10,15),A=d=>T0+d*864e5;
const URL='https://smart-tech-lavras.pages.dev';
const novo=(x={},{demo=false}={})=>{const s=estadoInicial();garantirCondicaoInicial(s);const e=normalizarEmpresa({id:'e1',nome:'Smart Tech Lavras',cidade:'Lavras - MG',nicho:'celulares',whatsapp:'(35) 99999-1111',statusSite:'sem-site',servicosOferecidos:['troca de tela','bateria'],...x});s.empresas.push(e);if(demo){s.publicacoes.push({id:'p1',empresaId:e.id,estado:'publicada',urlPublica:URL,publicadoEm:new Date(A(0)).toISOString()});s.demonstracoes.push({id:'d1',empresaId:e.id,nome:'D',urlPublica:URL,versoes:[{id:'v1',numero:1}],apresentacoes:[],status:'publicada'});}return {s,e};};
const env=(s,e,a,d)=>{confirmarEnvioMensagem(s,e,{texto:a.texto,estrategia:a.estrategia,variante:a.variante,tipo:a.tipo});s.eventos.filter(v=>v.tipo==='mensagem-enviada').at(-1).quando=new Date(A(d)).toISOString();};
const res=(s,e,t,d,x={})=>{registrarResposta(s,e,{texto:t,interesse:'medio',...x});s.eventos.filter(v=>v.tipo==='resposta').at(-1).quando=new Date(A(d)).toISOString();};
const valida=(s,e,r,d)=>{for(const a of r.alternativas){const v=validarMensagem(s,e,a.texto,{agora:A(d)});assert.ok(v.ok,a.estrategia+': '+JSON.stringify(v.problemas.filter(p=>p.nivel==='erro')));}};
ok('interpretação: 45 respostas reais de WhatsApp caem na intenção certa',()=>{
 const casos={'Quanto custa?':'depende-do-valor','depende do valor':'depende-do-valor','qual o valor':'depende-do-valor','quanto fica um site desses':'depende-do-valor',
  'achei caro':'caro','tá caro pra mim':'caro','tem desconto?':'desconto','faz por 400?':'desconto','consegue melhorar esse valor? tem como baixar':'desconto',
  'já tenho site':'ja-tem-site','ja temos um site':'ja-tem-site','uso só o instagram':'instagram-basta','instagram já resolve pra mim':'instagram-basta',
  'tô sem dinheiro agora':'sem-dinheiro','o orçamento apertado esse mês':'sem-dinheiro','final de ano está complicado':'momento','agora não, mais pra frente':'momento','mês que vem a gente vê':'momento',
  'tô sem tempo pra ver isso':'sem-tempo','muito corrido aqui':'sem-tempo','vou falar com meu sócio':'socio','quem resolve isso é o dono':'socio','vou pensar':'vou-pensar','te aviso':'vou-pensar',
  'isso é golpe?':'desconfianca','como conseguiu meu número':'desconfianca','não vejo necessidade':'sem-necessidade','meu sobrinho faz isso':'conhecido-faz',
  'tem mensalidade?':'duvida-pagamento','parcela no cartão?':'duvida-pagamento','e a hospedagem?':'duvida-hospedagem','precisa de domínio?':'duvida-dominio','e se der problema depois?':'duvida-manutencao','como funciona?':'como-funciona',
  'gostei, ficou muito bom':'gostou','adorei':'gostou','não gostei muito':'nao-gostou','achei feio':'nao-gostou','não tenho instagram':'respondeu-pergunta','pode fazer':'fechamento','pode mandar':'pediu-demo','manda o link':'pediu-demo','quero ver':'pediu-demo',
  'fechado, manda o pix':'fechamento','vamos fechar':'fechamento','paguei':'pagou','Como posso ajudar?':'como-ajudar','qual o modelo do aparelho?':'confundiu-cliente','pode sim':'permitiu',
  'mais pelo instagram e indicação':'respondeu-pergunta','ainda não temos':'respondeu-pergunta','Bom dia':'vaga'};
 for(const [t,esp] of Object.entries(casos)){const i=interpretar(t);assert.equal(i.intencao,esp,'"'+t+'" → '+i.intencao);assert.ok(INTENCOES[i.intencao]&&i.rotulo);}
 assert.equal(interpretar('não tenho interesse').intencao,'recusa');assert.equal(interpretar('não quero, obrigado').intencao,'recusa');assert.equal(interpretar('no momento não tenho interesse').intencao,'recusa-suave');
 assert.equal(interpretar('pare de me mandar mensagem').intencao,'parar');assert.equal(interpretar('não me mande mais nada').intencao,'parar');});
ok('incerteza: resposta que o motor não entende é marcada como incerta, traz candidatas e aceita correção manual',()=>{
 const i=interpretar('kkkk rapaz');assert.equal(i.intencao,'indefinida');assert.equal(i.incerta,true);assert.equal(i.confianca,'baixa');assert.ok(i.candidatas.length>=2);
 const longa=interpretar('olha eu até gostei mas tá caro e meu sócio precisa ver e final de ano é complicado');assert.equal(longa.incerta,true);assert.ok(longa.candidatas.length>=3);
 const m=interpretar('kkkk rapaz',{manual:'vou-pensar'});assert.equal(m.intencao,'vou-pensar');assert.equal(m.manual,true);assert.equal(m.incerta,false);
 const {s,e}=novo();env(s,e,recomendar(s,e,{agora:A(0)}).alternativas[0],0);const antes=JSON.stringify(s);
 const r=recomendar(s,e,{agora:A(0.2),respostaPendente:'hmm sei lá'});assert.equal(r.interpretacao.incerta,true);assert.match(r.motivo,/corrija|interpretar/i);assert.ok(r.alternativas.length>=1);
 const c=recomendar(s,e,{agora:A(0.2),respostaPendente:'hmm sei lá',intencaoManual:'caro'});assert.equal(c.etapa.chave,'objecao:caro');assert.equal(JSON.stringify(s),antes,'interpretar uma resposta ainda não registrada não altera o CRM');});
ok('personalização: empresas com perfis diferentes recebem primeiras mensagens diferentes (abertura, pergunta e argumento)',()=>{
 const casos={reputacao:novo({nome:'ZAP CELL - Assistência Técnica',notas:'nota 4.9 com 320 avaliações no Maps'}),instagram:novo({nome:'Cell House',statusSite:'so-redes',instagram:'@cellhouse'}),
  links:novo({nome:'Dr. Phone',statusSite:'pagina-gratuita',site:'https://linktr.ee/drphone',instagram:'@drphone'}),antigo:novo({nome:'Fix Center',statusSite:'desatualizado',site:'https://fixcenter.com.br'}),
  escasso:novo({nome:'Mundo do Celular',statusSite:'',servicosOferecidos:[]}),previa:novo({nome:'Smart Tech Lavras'},{demo:true})};
 const rec=Object.fromEntries(Object.entries(casos).map(([k,{s,e}])=>{const r=recomendar(s,e,{agora:A(0)});assert.equal(r.etapa.chave,'primeiro-contato');assert.equal(r.alternativas.length,3,k);assert.equal(new Set(r.alternativas.map(a=>a.estrategia)).size,3);valida(s,e,r,0);return [k,r];}));
 assert.ok(new Set(Object.values(rec).map(r=>r.alternativas[0].estrategia)).size>=5,'recomendadas: '+Object.values(rec).map(r=>r.alternativas[0].estrategia).join(', '));
 assert.equal(rec.reputacao.alternativas[0].estrategia,'pc-reputacao');assert.match(rec.reputacao.alternativas[0].texto,/Zap Cell.*4,9.*320/);assert.ok(!/ASSIST|ZAP CELL -/.test(rec.reputacao.alternativas[0].texto));
 assert.match(rec.instagram.alternativas[0].texto,/Instagram/);assert.ok(!Object.values(rec.escasso.alternativas).some(a=>/nota|avalia|Instagram/.test(a.texto)),'empresa sem dados não recebe fato inventado');
 assert.ok(rec.previa.alternativas.some(a=>a.estrategia==='pc-previa-pronta'));assert.ok(!rec.escasso.alternativas.some(a=>a.estrategia==='pc-previa-pronta'),'não promete prévia que não existe');
 for(const r of Object.values(rec))for(let i=0;i<3;i++)for(let j=i+1;j<3;j++)assert.ok(similaridade(r.alternativas[i].texto,r.alternativas[j].texto)<.5,'alternativas parecidas demais');
 assert.match(rec.reputacao.alternativas[0].porque,/perfil desta empresa/);assert.ok(rec.reputacao.alternativas[0].tecnicas.every(t=>t.nome&&t.grau)&&rec.reputacao.alternativas[0].evidencias.every(v=>v.ref&&v.grau&&v.limitacoes));
 assert.ok(rec.reputacao.perfil.fatos.some(f=>/avalia/i.test(f.rotulo))&&rec.escasso.perfil.desconhecidos.length>=3&&rec.escasso.perfil.hipoteses.length>=1);});
ok('NEGOCIAÇÃO COMPLETA com continuidade: do primeiro contato ao pagamento, sem recomeçar a venda, sem repetir mensagem e com preço só quando perguntado',()=>{
 const {s,e}=novo({notas:'nota 4.8 com 210 avaliações no Maps'},{demo:true});let d=0;const usadas=[],passos=[];
 const passo=(resposta,espChave,cheque)=>{if(resposta){d+=.1;res(s,e,resposta,d);}d+=.1;const r=recomendar(s,e,{agora:A(d)});assert.equal(r.etapa?.chave,espChave,'após "'+resposta+'": '+r.etapa?.chave+' · '+r.motivo);assert.ok(r.alternativas.length>=2,espChave+': '+r.alternativas.length+' alternativa(s)');valida(s,e,r,d);
  const a=r.alternativas[0];assert.ok(!usadas.includes(a.estrategia),'repetiu '+a.estrategia);for(const t of usadas.map(id=>id))void t;cheque?.(r,a);usadas.push(a.estrategia);passos.push([resposta||'(início)',espChave,a.estrategia,a.texto]);env(s,e,a,d);return r;};
 passo('', 'primeiro-contato',(r,a)=>{assert.ok(!/R\$/.test(a.texto));});
 passo('Como posso ajudar?','respondeu',(r,a)=>{assert.equal(r.interpretacao.intencao,'como-ajudar');assert.ok(!/^(bom dia|boa tarde|boa noite)/i.test(a.texto));});
 passo('ainda não temos site, o pessoal acha a gente pelo Google mesmo','beneficios');
 passo('pode mandar','enviar-demo',(r,a)=>{assert.ok(a.texto.includes(URL),'envia o link publicado');});
 registrarDemonstracaoApresentada(s,e,s.demonstracoes[0],{versaoId:'v1',link:URL});
 passo('gostei, ficou muito bom','gostou',(r,a)=>{assert.ok(!a.texto.includes('Sou o Renan'));});
 passo('quanto fica?','objecao:depende-do-valor',(r,a)=>{assert.match(a.texto,/R\$ 800/);assert.match(a.texto,/R\$ 600/);assert.match(r.motivo,/prévia já foi enviada/);});
 passo('achei caro','objecao:caro',(r,a)=>{assert.ok(!/desconto|faço por|baixo pra/i.test(a.texto),'não oferece desconto não autorizado');});
 passo('tem mensalidade?','objecao:duvida-pagamento',(r,a)=>{assert.match(a.texto,/único|uma vez|assinatura|mensalidade/i);});
 passo('fechado, como eu pago?','fechamento',(r,a)=>{assert.equal(r.interpretacao.intencao,'fechamento');});
 passo('paguei, segue o comprovante','fechamento',(r,a)=>{assert.equal(r.interpretacao.intencao,'pagou');assert.equal(a.estrategia,'fc-recebido');});
 assert.equal(new Set(usadas).size,usadas.length);const textos=passos.map(p=>p[3]);for(let i=0;i<textos.length;i++)for(let j=i+1;j<textos.length;j++)assert.ok(similaridade(textos[i],textos[j])<.55,'mensagens '+i+' e '+j+' parecidas');
 assert.equal(textos.filter(t=>/Sou o Renan|Aqui é o Renan/.test(t)).length,1,'só se apresenta uma vez');assert.equal(textos.slice(0,5).filter(t=>/R\$/.test(t)).length,0,'não fala de preço antes de perguntarem');
 const evs=s.eventos.filter(v=>v.tipo==='mensagem-enviada');assert.ok(evs.every(v=>v.estrategia&&v.tipoMsg&&v.variante),'cada envio guarda estratégia, etapa e versão');
 e.etapa='fechada';const pv=recomendar(s,e,{agora:A(d+10)});assert.equal(pv.etapa.chave,'pos-venda');});
ok('objeções: cada objeção ou dúvida gera 2 a 3 respostas diferentes, válidas e sem desconto não autorizado',()=>{
 const frases={'sem-dinheiro':'tô sem dinheiro agora',momento:'final de ano está complicado','sem-tempo':'tô sem tempo pra ver isso','ja-tem-site':'já tenho site','instagram-basta':'uso só o instagram','depende-do-valor':'depende do valor',caro:'achei caro',desconto:'tem desconto?','vou-pensar':'vou pensar',socio:'vou falar com meu sócio',desconfianca:'isso é golpe?','sem-necessidade':'não vejo necessidade','conhecido-faz':'meu sobrinho faz isso','duvida-pagamento':'tem mensalidade?','duvida-hospedagem':'e a hospedagem?','duvida-manutencao':'e se der problema depois?','duvida-dominio':'precisa de domínio?','como-funciona':'como funciona?','nao-gostou':'não gostei muito'};
 for(const [k,frase] of Object.entries(frases)){assert.ok(OBJECOES[k],k);const {s,e}=novo();env(s,e,recomendar(s,e,{agora:A(0)}).alternativas[0],0);res(s,e,frase,0.2);const r=recomendar(s,e,{agora:A(0.3)});
  assert.equal(r.etapa.chave,'objecao:'+k,frase+' → '+r.etapa.chave);assert.ok(r.alternativas.length>=2,k+': '+r.alternativas.length);assert.equal(new Set(r.alternativas.map(a=>a.estrategia)).size,r.alternativas.length);valida(s,e,r,0.3);
  if(k!=='desconto')for(const a of r.alternativas)assert.ok(!/\bdesconto\b/i.test(a.texto),k+' ofereceu desconto: '+a.texto);
  for(const a of r.alternativas)assert.ok(!/R\$ (?!1\.230|800|600)/.test(a.texto),'valor fora das condições: '+a.texto);}
 const {s,e}=novo();env(s,e,recomendar(s,e,{agora:A(0)}).alternativas[0],0);res(s,e,'tem desconto?',0.2);const r=recomendar(s,e,{agora:A(0.3)});for(const a of r.alternativas)assert.ok(!/R\$ [1-5]\d\d\b(?!\.)/.test(a.texto.replace(/R\$ 600|R\$ 800/g,'')),'inventou valor menor: '+a.texto);});
ok('"depende do valor": considera se a empresa viu a prévia, se já recebeu o preço e se já recebeu proposta',()=>{
 let {s,e}=novo();env(s,e,recomendar(s,e,{agora:A(0)}).alternativas[0],0);res(s,e,'depende do valor',0.2);let r=recomendar(s,e,{agora:A(0.3)});assert.equal(r.alternativas[0].estrategia,'ov-direto-previa');assert.match(r.motivo,/Ainda não viu a prévia/);assert.match(r.alternativas[0].texto,/R\$ 800.*R\$ 600.*prévia/);
 ({s,e}=novo({}, {demo:true}));env(s,e,{texto:'Segue a prévia: '+URL,estrategia:'ed-direta',variante:'ed-direta',tipo:'enviar-demo'},0);res(s,e,'depende do valor',0.2);r=recomendar(s,e,{agora:A(0.3)});assert.equal(r.alternativas[0].estrategia,'ov-apos-demo');assert.match(r.motivo,/prévia já foi enviada/);
 ({s,e}=novo());env(s,e,{texto:'O site fica R$ 800, ou R$ 600 no Pix.',estrategia:'pr-direto',variante:'pr-direto',tipo:'preco'},0);res(s,e,'depende do valor',0.2);r=recomendar(s,e,{agora:A(0.3)});assert.match(r.motivo,/já foi informado/);assert.ok(['ov-confirma','ov-o-que-pesa'].includes(r.alternativas[0].estrategia));assert.ok(!r.alternativas.some(a=>['ov-direto-previa','ov-ancora','ov-expectativa'].includes(a.estrategia)),'não reapresenta o preço como novidade');});
ok('"final de ano está complicado": respeita o momento; oferece retomada futura, esclarecimento ou encerramento, nunca pressão ou desconto',()=>{
 const {s,e}=novo();env(s,e,recomendar(s,e,{agora:A(0)}).alternativas[0],0);res(s,e,'final de ano está complicado',0.2);const r=recomendar(s,e,{agora:A(0.3)});assert.equal(r.etapa.chave,'objecao:momento');
 const t=r.alternativas.map(a=>a.texto).join(' ');assert.match(t,/volte|te chamo|quando|data|mais pra frente|sem pressa/i);assert.ok(!/desconto|aproveit|só até|última|garant/i.test(t));assert.ok(OBJECOES.momento.respostas.some(m=>/data|quando/i.test(m.nome))&&OBJECOES.momento.respostas.length>=5);});
ok('"já tenho site": sem saber qual é o site, primeiro pergunta; só opina sobre o site quando a ficha registra um',()=>{
 let {s,e}=novo();env(s,e,recomendar(s,e,{agora:A(0)}).alternativas[0],0);res(s,e,'já tenho site',0.2);let r=recomendar(s,e,{agora:A(0.3)});assert.equal(r.etapa.chave,'objecao:ja-tem-site');assert.match(r.motivo,/não registra site/);assert.ok(r.alternativas.some(a=>a.estrategia==='oj-qual'));
 for(let k=0;k<6;k++)assert.ok(!recomendar(s,e,{agora:A(0.3),rodada:k}).alternativas.some(a=>a.estrategia==='oj-sincero'),'não opina sobre site que não viu');
 ({s,e}=novo({statusSite:'desatualizado',site:'https://smarttech.com.br'}));env(s,e,recomendar(s,e,{agora:A(0)}).alternativas[0],0);res(s,e,'já tenho site',0.2);r=recomendar(s,e,{agora:A(0.3)});assert.match(r.motivo,/realmente viu/);
 const todas=[0,1,2,3,4].flatMap(k=>recomendar(s,e,{agora:A(0.3),rodada:k}).alternativas);assert.ok(todas.some(a=>a.estrategia==='oj-sincero'&&/realmente abriu/.test(a.cuidado)));assert.ok(!todas.some(a=>a.estrategia==='oj-qual'));});
ok('"não tenho interesse": respeita a decisão; só despedida, sem contorno; depois de registrada a recusa, o contato fica bloqueado',()=>{
 const {s,e}=novo();env(s,e,recomendar(s,e,{agora:A(0)}).alternativas[0],0);
 const p=recomendar(s,e,{agora:A(0.2),respostaPendente:'não tenho interesse'});assert.equal(p.encerrar,true);assert.equal(p.interpretacao.intencao,'recusa');assert.ok(p.alternativas.length>=2&&p.alternativas.every(a=>a.despedida));
 for(const a of p.alternativas){assert.ok(!/\?/.test(a.texto)||/chamar|procur/i.test(a.texto),'despedida não faz pergunta de venda: '+a.texto);assert.ok(!/R\$|prévia pronta|só uma coisa|antes de ir|tem certeza/i.test(a.texto),a.texto);}
 assert.ok(!p.alternativas.some(a=>a.estrategia==='os-futuro'),'recusa firme não pede para voltar');
 const suave=recomendar(s,e,{agora:A(0.2),respostaPendente:'no momento não tenho interesse'});assert.equal(suave.interpretacao.intencao,'recusa-suave');assert.ok([0,1,2].flatMap(k=>recomendar(s,e,{agora:A(0.2),respostaPendente:'no momento não tenho interesse',rodada:k}).alternativas).some(a=>a.estrategia==='os-futuro'),'recusa por enquanto: pergunta se pode voltar');
 res(s,e,'não tenho interesse',0.3,{recusou:true});const d=recomendar(s,e,{agora:A(5)});assert.equal(d.bloqueado,true);assert.equal(d.alternativas.length,0);const c=compor(s,e,{agora:A(5)});assert.equal(c.bloqueado,true);assert.equal(c.alternativas.length,0);
 const x=novo();env(x.s,x.e,recomendar(x.s,x.e,{agora:A(0)}).alternativas[0],0);const parar=recomendar(x.s,x.e,{agora:A(0.2),respostaPendente:'pare de me mandar mensagem'});assert.equal(parar.encerrar,true);assert.equal(parar.alternativas.length,0);assert.match(parar.motivo,/bloqueado/);});
ok('sem resposta: aguarda o intervalo, muda de ângulo a cada tentativa, encerra com retirada respeitosa e para no limite',()=>{
 const {s,e}=novo({notas:'nota 4.8 com 210 avaliações no Maps'});const a1=recomendar(s,e,{agora:A(0)}).alternativas[0];env(s,e,a1,0);
 let r=recomendar(s,e,{agora:A(1)});assert.equal(r.aguardar,true);assert.equal(r.alternativas.length,0);assert.match(r.motivo,/aguardar/i);
 r=recomendar(s,e,{agora:A(3.1)});assert.equal(r.etapa.chave,'retomar-contato');assert.equal(r.aguardar,false);assert.ok(r.alternativas.length>=2);assert.ok(r.alternativas.every(a=>a.estrategia!==a1.estrategia&&similaridade(a.texto,a1.texto)<.55));assert.ok(!r.alternativas.some(a=>/voc[eê] (viu|leu|recebeu)|não respondeu|ainda aguardo/i.test(a.texto)),'não cobra leitura');env(s,e,r.alternativas[0],3.1);
 r=recomendar(s,e,{agora:A(5)});assert.equal(r.aguardar,true);r=recomendar(s,e,{agora:A(10.2)});const a3=r.alternativas[0];assert.ok(![a1.estrategia,s.eventos.filter(v=>v.tipo==='mensagem-enviada')[1].estrategia].includes(a3.estrategia),'terceira mensagem com outro ângulo');env(s,e,a3,10.2);
 r=recomendar(s,e,{agora:A(20)});assert.equal(r.aguardar,true,'respeita o intervalo de 14 dias');r=recomendar(s,e,{agora:A(24.5)});assert.equal(r.alternativas[0].estrategia,'fu-retirada');assert.match(r.motivo,/Última tentativa/);env(s,e,r.alternativas[0],24.5);r=recomendar(s,e,{agora:A(60)});assert.equal(r.encerrar,true);assert.equal(r.alternativas.length,0);assert.match(r.motivo,/spam|encerre/i);});
ok('"Gerar outra sugestão" (rodada) troca a recomendada sem repetir, e a situação escolhida à mão usa a biblioteca',()=>{
 const {s,e}=novo({notas:'nota 4.8 com 210 avaliações no Maps',instagram:'@smart'});const vistas=new Set();for(let k=0;k<6;k++){const r=recomendar(s,e,{agora:A(0),rodada:k});vistas.add(r.alternativas[0].estrategia);}assert.ok(vistas.size>=5,'recomendadas distintas em 6 rodadas: '+vistas.size);
 assert.ok(situacoesBiblioteca.etapas.length>=15&&situacoesBiblioteca.objecoes.length>=18);
 {const x=novo();env(x.s,x.e,recomendar(x.s,x.e,{agora:A(0)}).alternativas[0],0);const r=recomendar(x.s,x.e,{agora:A(0.2),respostaPendente:'pode fazer'});assert.equal(r.interpretacao.intencao,'pediu-demo','"pode fazer" sem preço nem prévia é permissão, não fechamento');assert.equal(r.etapa.chave,'pedir-demo');}
 for(const [tipo] of [...situacoesBiblioteca.etapas,...situacoesBiblioteca.objecoes]){const c=compor(s,e,{tipo,agora:A(0)});if(['bib:enviar-demo','bib:demo-sem-retorno'].includes(tipo)){assert.equal(c.alternativas.length,0);assert.ok(c.avisos.some(a=>/prévia publicada/.test(a)),'sem prévia publicada, explica por que não há mensagem');continue;}assert.ok(c.alternativas.length>=1,tipo+' sem mensagem');assert.equal(c.alternativas[0].tipo,tipo.slice(4));for(const a of c.alternativas)assert.ok(mensagemPorId(a.estrategia),a.estrategia);}
 const d=novo({},{demo:true}),cd=compor(d.s,d.e,{tipo:'bib:enviar-demo',agora:A(0)});assert.ok(cd.alternativas.length>=2&&cd.alternativas.every(a=>a.texto.includes(URL)));});
ok('fluxo de envio: abrir o WhatsApp NÃO registra envio; só a confirmação manual registra, com estratégia, etapa, versão e texto exato',()=>{
 const {s,e}=novo();const c=compor(s,e,{agora:A(0)}),a=c.alternativas[0];
 const r=F.salvarRascunho(s,e,{texto:a.texto,tipo:a.tipo,variante:a.variante,estrategia:a.estrategia,alternativa:a.rotulo,porque:a.porque,textoSugerido:a.texto});
 const p=F.prepararParaWhatsApp(s,e,r);assert.ok(p.ok&&/wa\.me|whatsapp/.test(p.url)&&p.url.includes(encodeURIComponent(a.texto).slice(0,30)),'link do WhatsApp com a mensagem preenchida');
 F.registrarAberturaWhatsApp(s,r.id,{contato:p.contato,numero:p.numero});assert.equal(s.eventos.filter(v=>v.tipo==='mensagem-enviada').length,0,'WhatsApp aberto não é envio');assert.equal(F.pendentesDeConfirmacao(s,e.id).length,1);assert.equal(recomendar(s,e,{agora:A(0)}).etapa.chave,'primeiro-contato','sem confirmação, a conversa não avança');
 F.confirmarEnvioDoRascunho(s,e,r.id,{texto:a.texto+' Abraço!'});const ev=s.eventos.filter(v=>v.tipo==='mensagem-enviada');assert.equal(ev.length,1);assert.equal(ev[0].estrategia,a.estrategia);assert.equal(ev[0].tipoMsg,'primeiro-contato');assert.equal(ev[0].variante,a.variante);assert.equal(ev[0].texto,a.texto+' Abraço!');assert.equal(ev[0].confirmadoPeloUsuario,true);
 assert.equal(memoriaAbordagens(s).linhas[0].abordagem,a.estrategia,'a memória comercial enxerga a estratégia da biblioteca');assert.equal(recomendar(s,e,{agora:A(0.1)}).aguardar,true);});
ok('persistência: depois de salvar e reabrir o estado, a conversa continua do mesmo ponto com a mesma recomendação; a correção manual da intenção fica gravada',()=>{
 const {s,e}=novo();env(s,e,recomendar(s,e,{agora:A(0)}).alternativas[0],0);res(s,e,'hmm sei lá',0.2);s.eventos.filter(v=>v.tipo==='resposta').at(-1).intencaoInformada='vou-pensar';
 const antes=recomendar(s,e,{agora:A(0.3)});assert.equal(antes.etapa.chave,'objecao:vou-pensar');assert.equal(antes.interpretacao.manual,true);
 const s2=normalizarEstado(JSON.parse(JSON.stringify(s))),e2=s2.empresas.find(x=>x.id===e.id),depois=recomendar(s2,e2,{agora:A(0.3)});
 assert.deepEqual(depois.alternativas.map(a=>[a.estrategia,a.texto]),antes.alternativas.map(a=>[a.estrategia,a.texto]));assert.equal(depois.etapa.chave,antes.etapa.chave);assert.equal(s2.eventos.filter(v=>v.tipo==='mensagem-enviada')[0].estrategia,s.eventos.filter(v=>v.tipo==='mensagem-enviada')[0].estrategia);});
ok('experimento sorteado: a abordagem sorteada vira a recomendada e o envio fica ligado ao experimento (variantes antigas e da biblioteca)',()=>{
 const {s,e}=novo({notas:'nota 4.8 com 210 avaliações no Maps'});const x=criarExperimentoConversao(s,{nome:'Curta x reputação',hipotese:'Reputação gera mais conversa',variantes:[{nome:'Curta',abordagem:'baixo-atrito'},{nome:'Reputação',abordagem:'pc-reputacao'}],semente:7});distribuir(s,x,[e.id]);
 const v=x.variantes.find(k=>k.id===x.atribuicoes[0].varianteId),alvo=v.abordagem==='baixo-atrito'?'pc-curta':'pc-reputacao',c=compor(s,e,{agora:A(0)});
 assert.equal(c.alternativas[0].estrategia,alvo);assert.equal(c.alternativas[0].rotulo,'Sorteada no experimento');assert.equal(c.alternativas[0].experimentoId,x.id);assert.equal(c.alternativas[0].variante,v.id);assert.match(c.alternativas[0].porque,/manter o experimento válido/);
 const y=novo({statusSite:''});const x2=criarExperimentoConversao(y.s,{nome:'Prévia',hipotese:'h',variantes:[{nome:'Prévia',abordagem:'demonstracao'},{nome:'Prévia 2',abordagem:'pc-previa-pronta'}],semente:3});distribuir(y.s,x2,[y.e.id]);const c2=compor(y.s,y.e,{agora:A(0)});assert.ok(c2.alternativas.length>=1&&c2.alternativas[0].rotulo==='Recomendada');assert.ok(c2.avisos.some(a=>/não se aplica/.test(a)),'avisa quando a variante sorteada não cabe nos dados da empresa');});
ok('etapa pelo histórico inteiro: quem já viu a prévia e o preço não volta para a apresentação',()=>{
 const {s,e}=novo({}, {demo:true});env(s,e,{texto:'Oi, sou o Renan, faço site.',estrategia:'pc-direta',variante:'pc-direta',tipo:'primeiro-contato'},0);res(s,e,'pode mandar',0.1);env(s,e,{texto:'Segue: '+URL,estrategia:'ed-direta',variante:'ed-direta',tipo:'enviar-demo'},0.2);res(s,e,'quanto fica',0.3);env(s,e,{texto:'Fica R$ 800, ou R$ 600 no Pix.',estrategia:'ov-apos-demo',variante:'ov-apos-demo',tipo:'objecao:depende-do-valor'},0.4);res(s,e,'ok',0.5);
 const r=recomendar(s,e,{agora:A(0.6)});assert.equal(r.etapa.chave,'fechamento');assert.match(r.motivo,/sem recomeçar/);assert.ok(!r.alternativas.some(a=>/Sou o Renan|faço site pra/.test(a.texto)));
 const d=decidirEtapa(s,e,r.perfil,{agora:A(9)});assert.equal(d.chave,'fechamento');
 env(s,e,r.alternativas[0],0.6);const depois=recomendar(s,e,{agora:A(5)});assert.equal(depois.etapa.chave,'demo-sem-retorno');assert.ok(depois.alternativas.every(a=>!['ed-direta','ov-apos-demo'].includes(a.estrategia)));
 assert.ok(selecionar(s,e,'preco',{agora:A(5)}).every(a=>mensagemPorId(a.estrategia).etapa==='preco'));assert.ok(MENSAGENS.recuperar.length>=10);});
ok('continuidade fina: "pode sim" depois de oferecer a prévia envia o link; "como posso ajudar?" retoma a prévia já pronta; resposta a uma pergunta minha não vira recomeço',()=>{
 let {s,e}=novo({},{demo:true});let r=recomendar(s,e,{agora:A(0)});assert.equal(r.alternativas[0].estrategia,'pc-previa-pronta');env(s,e,r.alternativas[0],0);
 let p=recomendar(s,e,{agora:A(0.1),respostaPendente:'pode sim'});assert.equal(p.interpretacao.intencao,'pediu-demo');assert.equal(p.etapa.chave,'enviar-demo');assert.ok(p.alternativas.every(a=>a.texto.includes(URL)));
 p=recomendar(s,e,{agora:A(0.1),respostaPendente:'Como posso ajudar?'});assert.equal(p.alternativas[0].estrategia,'ra-previa-pronta');assert.match(p.alternativas[0].texto,/deixei pronta uma prévia/);assert.ok(!p.alternativas.some(a=>a.estrategia==='ra-previa'),'não oferece montar o que já está montado');
 ({s,e}=novo({statusSite:'so-redes',instagram:'@loja'}));r=recomendar(s,e,{agora:A(0)});assert.equal(r.alternativas[0].estrategia,'pc-instagram');env(s,e,r.alternativas[0],0);
 p=recomendar(s,e,{agora:A(0.1),respostaPendente:'pelo direct mesmo, um por um'});assert.equal(p.interpretacao.intencao,'respondeu-pergunta');assert.equal(p.interpretacao.incerta,true);assert.equal(p.etapa.chave,'respondeu');assert.ok(!p.alternativas.some(a=>['ra-observacao','ra-direto','ra-esclarece'].includes(a.estrategia)),'não entrega observação que não foi prometida: '+p.alternativas.map(a=>a.estrategia));assert.ok(!p.alternativas.some(a=>/Sou o Renan|Aqui é o Renan/.test(a.texto)));
 for(const k of ['apresentar-trabalho','beneficios','respondeu','diagnostico','pedir-demo'])for(const m of MENSAGENS[k])if(!['ra-direto','ra-esclarece','pd-curiosidade'].includes(m.id))assert.match(m.f(r.perfil.ctx),/\?/,m.id+': termina sem pergunta e deixa a conversa parada');});
console.log(n+' verificações aprovadas');
