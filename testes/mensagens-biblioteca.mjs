/* Biblioteca de mensagens do Órbita: quantidade, variedade real, linguagem, ausência de dados inventados e ligação com as evidências. */
import assert from 'node:assert/strict';
import {estadoInicial,normalizarEmpresa} from '../nucleo/esquema.js';
import {garantirCondicaoInicial} from '../nucleo/ofertas/condicoes.js';
import {analisarEmpresa,nomeCurto,PERFIS} from '../nucleo/conversao/perfil.js';
import {ETAPAS,MENSAGENS,OBJECOES,TODAS,mensagemPorId} from '../nucleo/conversao/biblioteca.js';
import {auditarMensagem} from '../nucleo/conversao/linguagem.js';
import {tecnicaPorId,estudoPorId,tecnicas,estudos,graus} from '../nucleo/conversao/evidencias.js';
import {similaridade} from '../nucleo/negociacao/mensagens.js';
let n=0;const ok=(nome,f)=>{try{f();n++;console.log('✔',nome);}catch(e){console.log('✘',nome,'\n  ',e.stack.split('\n').slice(0,4).join('\n'));process.exitCode=1;}};
const T0=Date.UTC(2026,10,10,15);
const perfilDe=(x={},{demo=false,cfg=null}={})=>{const s=estadoInicial();garantirCondicaoInicial(s);if(cfg)Object.assign(s.config.comercial,cfg);const e=normalizarEmpresa({id:'e1',nome:'Smart Tech Lavras',cidade:'Lavras - MG',nicho:'celulares',whatsapp:'(35) 99999-1111',...x});s.empresas.push(e);if(demo)s.demonstracoes.push({id:'d1',empresaId:e.id,nome:'D',urlPublica:'https://smart-tech-lavras.pages.dev',versoes:[{id:'v1',numero:1}],apresentacoes:[],status:'publicada'});return analisarEmpresa(s,e,{agora:T0});};
const RICO=perfilDe({statusSite:'sem-site',servicosOferecidos:['troca de tela','bateria','conector de carga','placa'],diferenciais:['conserto no mesmo dia'],instagram:'@smarttech',notas:'nota 4.9 com 320 avaliações no Maps'},{demo:true}),POBRE=perfilDe({});
const render=(m,p)=>m.f(p.ctx).replace(/\s+/g,' ').trim();
const aplicaveis=p=>TODAS.filter(m=>m.req.every(r=>p.tem[r]));
ok('quantidade: pelo menos 10 abordagens por etapa principal e 5 respostas por objeção ou dúvida; ids únicos',()=>{
 assert.ok(Object.keys(ETAPAS).length>=15);for(const k of Object.keys(ETAPAS)){assert.ok(MENSAGENS[k]?.length>=10,k+': '+(MENSAGENS[k]?.length||0));}
 assert.ok(Object.keys(OBJECOES).length>=18);for(const [k,o] of Object.entries(OBJECOES)){assert.ok(o.respostas.length>=5,k+': '+o.respostas.length);assert.ok(o.rotulo&&o.tipo);}
 assert.equal(new Set(TODAS.map(m=>m.id)).size,TODAS.length);assert.ok(TODAS.length>=250,'total '+TODAS.length);assert.equal(mensagemPorId('pc-reputacao').etapa,'primeiro-contato');});
ok('situações pedidas: todas as situações do pedido têm etapa ou objeção correspondente',()=>{
 for(const k of ['primeiro-contato','respondeu','diagnostico','apresentar-trabalho','beneficios','pedir-demo','enviar-demo','demo-sem-retorno','gostou','preco','fechamento','recuperar','retomar-contato','pos-venda','indicacao'])assert.ok(ETAPAS[k],k);
 for(const k of ['sem-dinheiro','sem-tempo','sem-interesse','ja-tem-site','instagram-basta','duvida-pagamento','duvida-hospedagem','duvida-manutencao','duvida-dominio','depende-do-valor','momento'])assert.ok(OBJECOES[k],k);});
ok('variedade REAL: dentro de cada etapa as mensagens não são sinônimos (similaridade baixa) e cobrem várias técnicas',()=>{
 const por={};for(const m of TODAS)(por[m.etapa]??=[]).push(m);
 for(const [et,l] of Object.entries(por)){let parecidas=0;for(let i=0;i<l.length;i++)for(let j=i+1;j<l.length;j++)if(similaridade(render(l[i],RICO),render(l[j],RICO))>=.5)parecidas++;
  assert.ok(parecidas<=(/hospedagem|dominio/.test(et)?1:0),et+': '+parecidas+' par(es) parecidos');
  assert.ok(new Set(l.map(m=>m.nome)).size===l.length,et+': nomes de estratégia repetidos');
  assert.ok(new Set(l.flatMap(m=>m.tec)).size>=(et.startsWith('objecao:')?3:5),et+': poucas técnicas distintas');}});
ok('linguagem: toda mensagem aplicável passa na auditoria, cabe em um parágrafo curto e não deixa campo vazio (empresa com muitos dados e com poucos)',()=>{
 for(const p of [RICO,POBRE])for(const m of aplicaveis(p)){const t=render(m,p),a=auditarMensagem(t,{primeiraMensagem:m.etapa==='primeiro-contato'});
  assert.ok(a.ok,m.id+': '+a.erros.join(' '));assert.ok(!/undefined|null|NaN|\[|\]|\{|\}|\n/.test(t),m.id+': campo vazio → '+t);assert.ok(t.length>=20&&t.length<=300,m.id+': '+t.length+' caracteres');assert.ok(t.split(/[.!?]+\s/).length<=5,m.id+': frases demais');}});
ok('linguagem humana: sem publicidade, formalidade, elogio genérico, pressão ou urgência inventada',()=>{
 const proibido=/solu[cç][aã]o inovadora|potencializ|alavanc|presen[cç]a digital|prezad|venho por meio|parab[eé]ns pelo|excelente trabalho|[uú]ltima chance|s[oó] hoje|s[oó] at[eé] (amanh[aã]|sexta|hoje)|vagas limitadas|[uú]ltimas vagas|garant(o|imos|ia de) (resultado|cliente|venda)|dobr(ar|o) (os |as )?(clientes|vendas)|promo[cç][aã]o rel[aâ]mpago|imperd[ií]vel|n[aã]o perca|aproveite|100%|!!/i;
 for(const p of [RICO,POBRE])for(const m of aplicaveis(p)){const t=render(m,p);assert.ok(!proibido.test(t),m.id+' → '+t);}});
ok('primeiro contato: intenção comercial clara, sem fingir ser cliente, sem preço, sem link, fácil de responder (termina em pergunta)',()=>{
 for(const p of [RICO,POBRE])for(const m of MENSAGENS['primeiro-contato'].filter(m=>m.req.every(r=>p.tem[r]))){const t=render(m,p);
  assert.ok(/\bsite\b/i.test(t),m.id+': não deixa claro que o assunto é site');assert.ok(/sou o|aqui é o|me chamo|renan/i.test(t),m.id+': não se apresenta');
  assert.ok(!/R\$|\bpix\b|desconto|promo[cç]/i.test(t),m.id+': fala de preço');assert.ok(!/https?:\/\//.test(t),m.id+': link sem autorização');
  assert.ok(!/(quanto (custa|fica)|fa(z|zem) or[cç]amento|meu (celular|aparelho|iphone)|preciso (de um|consertar|trocar)|voc[eê]s (consertam|arrumam|trocam))/i.test(t),m.id+': parece cliente');
  assert.ok(/\?/.test(t),m.id+': sem pergunta');}});
ok('condições comerciais: só os valores vigentes (R$ 1.230 / R$ 800 / R$ 600), pagamento único, um mês de ajustes; nada de parcelamento, desconto extra ou prazo promocional',()=>{
 for(const m of aplicaveis(RICO)){const t=render(m,RICO);for(const v of t.match(/R\$\s?\d[\d.]*\d(,\d\d)?/g)||[])assert.ok(['R$ 1.230','R$ 800','R$ 600'].includes(v.replace(/\s+/,' ')),m.id+': valor estranho '+v);
  assert.ok(!/\d+\s?x\b|parcel(o|a em|amos)|sem juros|entrada de|desconto de|% de desconto|mais barato pra voc[eê]|s[oó] at[eé]|v[aá]lid[oa] at[eé]/i.test(t),m.id+' → '+t);}
 const comPreco=aplicaveis(RICO).filter(m=>/R\$/.test(render(m,RICO)));assert.ok(comPreco.length>=20);assert.ok(comPreco.some(m=>/pagamento único|uma vez só|pago uma vez/.test(render(m,RICO))));assert.ok(aplicaveis(RICO).some(m=>/um mês de (pequenos ajustes|pequenas alterações)/.test(render(m,RICO))));});
ok('condições comerciais: mudou o preço na configuração, mudou em todas as mensagens',()=>{const p=perfilDe({statusSite:'sem-site'},{cfg:null});assert.equal(p.ctx.promo,'R$ 800');assert.equal(p.ctx.pix,'R$ 600');assert.equal(p.ctx.normal,'R$ 1.230');
 const q=perfilDe({},{cfg:{hospedagemTexto:'A hospedagem fica por minha conta no primeiro ano.',dominioTexto:'O domínio custa cerca de R$ 40 por ano, pago por vocês ao Registro.br.'}});assert.equal(render(mensagemPorId('dh-direta'),q),'A hospedagem fica por minha conta no primeiro ano.');assert.match(render(mensagemPorId('dd-o-que-e'),q),/R\$ 40 por ano/);assert.match(mensagemPorId('dh-direta').cuidado,/condição real/);});
ok('nada inventado: mensagem só cita avaliação, Instagram, serviço, diferencial, cidade ou prévia quando o dado existe na ficha',()=>{
 for(const m of aplicaveis(POBRE)){const t=render(m,POBRE);assert.ok(!/nota \d|\d+ avalia[cç][oõ]es|instagram de voc[eê]s|vi (o|no) instagram|pages\.dev|troca de tela|mesmo dia/i.test(t),m.id+' → '+t);}
 for(const m of TODAS.filter(m=>m.req.includes('avaliacoes')))assert.match(render(m,RICO),/4,9|320/,m.id);
 for(const m of TODAS.filter(m=>m.req.includes('demo')))assert.ok(RICO.tem.demo&&!POBRE.tem.demo);
 assert.ok(!POBRE.tem.avaliacoes&&!POBRE.tem.instagram&&!POBRE.tem.servico&&!POBRE.tem.demo);
 assert.ok(POBRE.desconhecidos.length>=3&&POBRE.hipoteses.length>=1&&RICO.fatos.every(f=>f.rotulo&&f.valor&&f.origem));});
ok('site: sem verificação a mensagem diz "não achei", nunca afirma que a empresa não tem site',()=>{
 for(const p of [RICO,POBRE])for(const m of aplicaveis(p)){const t=render(m,p);assert.ok(!/voc[eê]s n[aã]o t[eê]m (um )?site|a loja n[aã]o tem site|sem site nenhum/i.test(t),m.id+' → '+t);}});
ok('personalização: o perfil muda a abertura, o argumento e o benefício; nome da loja limpo',()=>{
 assert.equal(nomeCurto('ZAP CELL - Assistência Técnica de Celulares'),'Zap Cell');assert.equal(nomeCurto('GUERRA SMART CELL Assistência Técnica de Celulares e Acessórios'),'Guerra Smart Cell');assert.equal(nomeCurto('UP! CASE JF'),'UP! Case JF');assert.equal(nomeCurto('Loja de Acessórios e Assistência Técnica em Celulares | Ourocell'),'Ourocell');assert.equal(RICO.principal,'reputacao-forte');assert.equal(POBRE.principal,'dados-escassos');assert.notEqual(RICO.argumento.beneficio,POBRE.argumento.beneficio);
 const insta=perfilDe({statusSite:'so-redes',instagram:'@loja',servicosOferecidos:['troca de tela']});assert.ok(insta.perfis.includes('instagram-ativo'));assert.ok(Object.keys(PERFIS).length>=8);
 const usaPerfil=MENSAGENS['primeiro-contato'].filter(m=>!m.perfis.includes('*'));assert.ok(usaPerfil.length>=6,'mensagens de primeiro contato específicas de perfil');});
ok('ciência: cada mensagem aponta técnicas cadastradas; cada técnica tem grau e estudo; psicologia reversa aparece só como retirada honesta e marcada como hipótese',()=>{
 for(const m of TODAS){assert.ok(m.tec.length>=1,m.id);for(const id of m.tec){const t=tecnicaPorId(id);assert.ok(t,m.id+': técnica '+id);assert.ok(graus[t.grau],id);}}
 for(const t of tecnicas)for(const e of t.evidencias||[])assert.ok(estudoPorId(e),t.id+': estudo '+e);
 for(const e of estudos){assert.ok(e.autores&&e.ano&&e.titulo&&e.limitacoes&&graus[e.grau],e.id);assert.ok(e.doi||e.url||/livro/i.test(e.tipo),e.id+': sem DOI, URL nem indicação de livro');}
 const ret=tecnicaPorId('retirada');assert.equal(ret.grau,'hipotese');assert.ok(TODAS.filter(m=>m.tec.includes('retirada')).length>=8);
 for(const id of ['curiosidade','perguntas','escuta','enquadramento','aversao-perda','justica-preco','confianca-inicial','reciprocidade-previa','autonomia-explicita','reducao-risco'])assert.ok(TODAS.some(m=>m.tec.includes(id)),'técnica sem uso: '+id);});
ok('aversão à perda sem medo artificial: nenhuma mensagem ameaça, exagera perda ou cita número de clientes perdidos',()=>{
 for(const m of aplicaveis(RICO)){const t=render(m,RICO);assert.ok(!/perdendo (muito|dinheiro|clientes todo)|vai (falir|fechar|quebrar)|concorrente(s)? (est[aã]o|vai|v[aã]o) (roubar|tomar)|\d+% dos clientes|\d+ clientes por (dia|m[eê]s)/i.test(t),m.id+' → '+t);}});
console.log(n+' verificações aprovadas · '+TODAS.length+' mensagens na biblioteca');
