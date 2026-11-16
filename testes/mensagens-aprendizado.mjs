/* Aprendizado com resultados reais: desfecho por empresa, venda vale mais que resposta, amostra mínima, regularização, segmentos e influência na recomendação. */
import assert from 'node:assert/strict';
import {estadoInicial,normalizarEmpresa,registrarEvento} from '../nucleo/esquema.js';
import {confirmarEnvioMensagem,registrarResposta} from '../nucleo/acoes.js';
import {garantirCondicaoInicial} from '../nucleo/ofertas/condicoes.js';
import {PESOS_DESFECHO,MINIMO_POR_ESTRATEGIA,MINIMO_TOTAL,desfechoDaEmpresa,resultadosPorEstrategia,ajustePorResultados,resultadosPorSegmento,resultadosPorEtapa} from '../nucleo/conversao/aprendizado.js';
import {recomendar} from '../nucleo/conversao/motor.js';
let n=0;const ok=(nome,f)=>{try{f();n++;console.log('✔',nome);}catch(e){console.log('✘',nome,'\n  ',e.stack.split('\n').slice(0,5).join('\n'));process.exitCode=1;}};
const T0=Date.UTC(2026,10,10,15),A=d=>T0+d*864e5;
const base=()=>{const s=estadoInicial();garantirCondicaoInicial(s);return s;};
let seq=0;
/* cria uma empresa já contatada com a estratégia e leva até o desfecho indicado */
function caso(s,estrategia,desfecho,{dia=-30,extra={}}={}){const e=normalizarEmpresa({id:'c'+(++seq),nome:'Loja '+seq,cidade:'Lavras - MG',nicho:'celulares',whatsapp:'(35) 99999-'+String(1000+seq),statusSite:'sem-site',...extra});s.empresas.push(e);
 confirmarEnvioMensagem(s,e,{texto:'Mensagem '+estrategia,estrategia,variante:estrategia,tipo:'primeiro-contato'});s.eventos.filter(v=>v.tipo==='mensagem-enviada').at(-1).quando=new Date(A(dia)).toISOString();
 const resp=(t,i,x={})=>registrarResposta(s,e,{texto:t,interesse:i,...x});
 if(desfecho==='resposta')resp('oi','baixo');
 if(desfecho==='positiva')resp('pode falar','medio');
 if(desfecho==='demonstracao')resp('manda','medio',{pediuDemo:true});
 if(desfecho==='negociacao'){resp('manda','alto',{pediuDemo:true});registrarEvento(s,e.id,'proposta-enviada',{});}
 if(desfecho==='venda'){resp('fechado','alto');registrarEvento(s,e.id,'venda',{});}
 if(desfecho==='recusa')resp('não tenho interesse','baixo',{recusou:true});
 return e;}
const varios=(s,estrategia,dist,opc)=>{for(const [d,q] of Object.entries(dist))for(let i=0;i<q;i++)caso(s,estrategia,d,opc);};
ok('desfecho: cada empresa conta uma vez, pelo ponto mais avançado (venda > negociação > demonstração > positiva > resposta > silêncio; recusa separada)',()=>{
 const s=base();for(const d of ['silencio','resposta','positiva','demonstracao','negociacao','venda','recusa']){const e=caso(s,'pc-direta',d);assert.equal(desfechoDaEmpresa(s,e),d,d);}
 assert.ok(PESOS_DESFECHO.venda>PESOS_DESFECHO.negociacao&&PESOS_DESFECHO.negociacao>PESOS_DESFECHO.demonstracao&&PESOS_DESFECHO.demonstracao>PESOS_DESFECHO.positiva&&PESOS_DESFECHO.positiva>PESOS_DESFECHO.resposta&&PESOS_DESFECHO.recusa<0);});
ok('resposta não é venda: estratégia que gera muita resposta e nenhuma venda perde para a que vende, e o sistema avisa',()=>{
 const s=base();varios(s,'pc-curta',{resposta:14,silencio:6});varios(s,'pc-reputacao',{venda:4,demonstracao:3,silencio:13});
 const r=resultadosPorEstrategia(s,{agora:A(0)}),curta=r.linhas.find(l=>l.estrategia==='pc-curta'),rep=r.linhas.find(l=>l.estrategia==='pc-reputacao');
 assert.equal(r.total,40);assert.ok(curta.resposta.taxa>rep.resposta.taxa,'a curta tem mais respostas');assert.ok(rep.valorRegularizado>curta.valorRegularizado,'mas a que vende vale mais');assert.equal(r.linhas[0].estrategia,'pc-reputacao');
 assert.equal(rep.venda.x,4);assert.ok(rep.venda.ic.baixo>0&&rep.venda.ic.alto<1&&rep.venda.ic.baixo<.2&&rep.venda.ic.alto>.2,'IC de Wilson em volta de 20%');assert.equal(rep.nivel,'evidência preliminar (com vendas)');
 assert.ok(r.alertas.some(a=>/pc-curta/.test(a)&&/resposta não é resultado comercial/.test(a)));assert.match(r.aviso,/não foram sorteadas/);assert.match(r.criterio,/venda 1/);
 assert.ok(ajustePorResultados(s,'pc-reputacao',{agora:A(0)}).bonus>0&&ajustePorResultados(s,'pc-curta',{agora:A(0)}).bonus<0);assert.match(ajustePorResultados(s,'pc-reputacao',{agora:A(0)}).texto,/Associação, não causa/);});
ok('amostra pequena não muda nada: abaixo do mínimo por estratégia ou no total, o bônus é zero e o motivo é dito',()=>{
 const s=base();varios(s,'pc-reputacao',{venda:3,silencio:2});const r=resultadosPorEstrategia(s,{agora:A(0)});assert.equal(r.suficiente,false);assert.equal(r.linhas[0].amostraOk,false);assert.equal(r.linhas[0].nivel,'evidência insuficiente');
 const a=ajustePorResultados(s,'pc-reputacao',{agora:A(0)});assert.equal(a.bonus,0);assert.equal(a.usado,false);assert.match(a.texto,new RegExp('mínimo '+MINIMO_POR_ESTRATEGIA));assert.equal(ajustePorResultados(s,'pc-canal',{agora:A(0)}).bonus,0);assert.ok(MINIMO_TOTAL>=30&&MINIMO_POR_ESTRATEGIA>=15);
 /* 3 vendas em 5 não vira "60% de conversão": a estimativa é encolhida para a média */
 const s2=base();varios(s2,'pc-reputacao',{venda:3,silencio:2});varios(s2,'pc-direta',{silencio:40});const l=resultadosPorEstrategia(s2,{agora:A(0)}).linhas.find(x=>x.estrategia==='pc-reputacao');assert.ok(l.valorRegularizado<l.valorMedio*.6,'regularizado '+l.valorRegularizado+' x bruto '+l.valorMedio);});
ok('contato recente sem resposta fica em observação, não conta como silêncio',()=>{
 const s=base();caso(s,'pc-direta','silencio',{dia:-1});caso(s,'pc-direta','silencio',{dia:-10});caso(s,'pc-direta','resposta',{dia:-1});const r=resultadosPorEstrategia(s,{agora:A(0)});assert.equal(r.emObservacao,1);assert.equal(r.total,2);assert.equal(r.linhas[0].desfechos.silencio,1);});
ok('os resultados mudam a recomendação: com amostra suficiente, a estratégia que vende sobe; sem amostra, a ordem por perfil é mantida',()=>{
 const alvo=()=>normalizarEmpresa({id:'alvo',nome:'Smart Tech Lavras',cidade:'Lavras - MG',nicho:'celulares',whatsapp:'(35) 99999-0001',statusSite:'sem-site',servicosOferecidos:['troca de tela','bateria']});
 const s0=base(),e0=alvo();s0.empresas.push(e0);const antes=recomendar(s0,e0,{agora:A(0)}).alternativas.map(a=>a.estrategia);assert.ok(!recomendar(s0,e0,{agora:A(0)}).alternativas[0].resultados.includes('Nos seus dados'));
 const s=base(),e=alvo();s.empresas.push(e);const pior=antes[0],melhor='pc-permissao';assert.notEqual(pior,melhor);varios(s,pior,{recusa:14,silencio:6});varios(s,melhor,{venda:8,demonstracao:6,silencio:6});
 const r=recomendar(s,e,{agora:A(0)});assert.equal(r.alternativas[0].estrategia,melhor,'recomendada: '+r.alternativas.map(a=>a.estrategia));assert.match(r.alternativas[0].porque,/Nos seus dados \(20 empresas\): 8 venda/);assert.notEqual(r.alternativas[0].estrategia,pior);});
ok('segmentos: resultados separados por prioridade da pesquisa (A/B/C), nicho, perfil da empresa e etapa da conversa',()=>{
 const s=base();varios(s,'pc-reputacao',{venda:2,silencio:3},{extra:{potencial:'Potencial 82/100 · evidência 75/100 · Grupo A',notas:'nota 4.9 com 300 avaliações no Maps'}});varios(s,'pc-reputacao',{silencio:4},{extra:{potencial:'Potencial 61/100 · evidência 55/100 · Grupo C',nicho:'informatica'}});
 const seg=resultadosPorSegmento(s,{agora:A(0)}),g=Object.fromEntries(seg.porGrupo.map(x=>[x.segmento,x]));assert.ok(g['Grupo A']&&g['Grupo C'],Object.keys(g).join());assert.equal(g['Grupo A'].linhas[0].venda.x,2);assert.equal(g['Grupo C'].linhas[0].venda.x,0);
 assert.deepEqual(seg.porNicho.map(x=>x.segmento).sort(),['celulares','informatica']);assert.ok(seg.porPerfil.some(x=>/reputação forte/i.test(x.segmento)));
 const e=s.empresas[0];confirmarEnvioMensagem(s,e,{texto:'Fica R$ 800',estrategia:'pr-direto',variante:'pr-direto',tipo:'preco'});const et=resultadosPorEtapa(s,[['preco','Informar o preço'],['fechamento','Fechamento']],{agora:A(0)});assert.equal(et.length,1);assert.equal(et[0].chave,'preco');assert.equal(et[0].linhas[0].estrategia,'pr-direto');assert.equal(et[0].linhas[0].venda.x,1);});
console.log(n+' verificações aprovadas');
