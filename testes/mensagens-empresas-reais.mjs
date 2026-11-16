/* Teste com as empresas REAIS da prospecção (arquivo privado, fora do repositório). Nada é enviado e nada é gravado: as empresas são carregadas em memória pelo mesmo importador do Órbita.
   Sem o arquivo privado, o teste é pulado. Com AMOSTRA=1, imprime exemplos (nome e mensagem; nunca telefone). */
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {estadoInicial} from '../nucleo/esquema.js';
import {garantirCondicaoInicial} from '../nucleo/ofertas/condicoes.js';
import {prepararLote} from '../nucleo/lote.js';
import {recomendar} from '../nucleo/conversao/motor.js';
import {compor,validarMensagem} from '../nucleo/conversao/compositor.js';
import {confirmarEnvioMensagem,registrarResposta} from '../nucleo/acoes.js';
import {similaridade} from '../nucleo/negociacao/mensagens.js';
const ARQ=new URL('../.prospeccao-privado/entrega_final_v4/crm/orbita_importacao_em_lote_A_B_C.csv',import.meta.url);
if(!existsSync(ARQ)){console.log('PULADO: arquivo privado da prospecção não está neste ambiente (ele não vai para o repositório).');process.exit(0);}
let n=0;const ok=(nome,f)=>{try{f();n++;console.log('✔',nome);}catch(e){console.log('✘',nome,'\n  ',e.stack.split('\n').slice(0,5).join('\n'));process.exitCode=1;}};
const T0=Date.UTC(2026,10,16,17),A=d=>T0+d*864e5;
const s=estadoInicial();garantirCondicaoInicial(s);
const lote=prepararLote(readFileSync(ARQ,'utf8').replace(/^﻿/,''),s,[{id:'celulares',nome:'celulares'}]);
for(const it of lote.itens)if(!it.erros.some(e=>e.startsWith('Nome')))s.empresas.push(it.empresa);
const antes=JSON.stringify({ev:s.eventos.length,ras:s.rascunhos.length});
const recs=s.empresas.map(e=>({e,r:recomendar(s,e,{agora:A(0)})}));
ok(`carga: ${s.empresas.length} empresas reais carregadas pelo importador do Órbita, todas contatáveis`,()=>{assert.ok(s.empresas.length>=150,'empresas: '+s.empresas.length);assert.ok(recs.every(x=>!x.r.bloqueado));});
ok('toda empresa recebe 3 alternativas de primeiro contato, diferentes entre si, válidas e sem campo vazio',()=>{
 for(const {e,r} of recs){assert.equal(r.etapa.chave,'primeiro-contato',e.nome);assert.equal(r.alternativas.length,3,e.nome+': '+r.alternativas.length);assert.equal(new Set(r.alternativas.map(a=>a.estrategia)).size,3,e.nome);
  for(const a of r.alternativas){assert.ok(!/undefined|null|NaN|\[|\{|\n/.test(a.texto),e.nome+' → '+a.texto);assert.ok(a.texto.length<=320,e.nome+': '+a.texto.length);assert.ok(!/R\$/.test(a.texto));const v=validarMensagem(s,e,a.texto,{agora:A(0)});assert.ok(v.ok,e.nome+': '+JSON.stringify(v.problemas.filter(p=>p.nivel==='erro')));}
  for(let i=0;i<3;i++)for(let j=i+1;j<3;j++)assert.ok(similaridade(r.alternativas[i].texto,r.alternativas[j].texto)<.5,e.nome+': alternativas parecidas');}});
ok('personalização real: as recomendadas variam conforme os dados de cada empresa e cada texto é único',()=>{
 const estr=new Map();for(const {r} of recs){const k=r.alternativas[0].estrategia;estr.set(k,(estr.get(k)||0)+1);}
 console.log('   estratégias recomendadas:',[...estr.entries()].sort((a,b)=>b[1]-a[1]).map(([k,v])=>k+' '+v).join(' · '));
 const perfis=new Map();for(const {r} of recs)perfis.set(r.perfil.rotuloPerfil,(perfis.get(r.perfil.rotuloPerfil)||0)+1);console.log('   perfis:',[...perfis.entries()].map(([k,v])=>k+' '+v).join(' · '));
 assert.ok(estr.size>=3,'estratégias distintas: '+estr.size);assert.ok(perfis.size>=2);assert.equal(new Set(recs.map(x=>x.r.alternativas[0].texto)).size,recs.length,'cada empresa tem um texto próprio');
 const usadas=new Set(recs.flatMap(x=>x.r.alternativas.map(a=>a.estrategia)));assert.ok(usadas.size>=8,'estratégias em uso nas 3 alternativas: '+usadas.size);});
ok('nada inventado: nota e número de avaliações só aparecem quando estão na ficha, com os mesmos números; o nome usado vem do cadastro',()=>{
 let comNota=0;for(const {e,r} of recs){const m=(e.notas||'').match(/nota\s+(\d[.,]\d)[^.;\n]{0,40}?(\d{2,5})\s+avalia/i);
  for(const a of r.alternativas){const cit=a.texto.match(/nota (\d,\d) com (\d+) avalia/);if(cit){comNota++;assert.ok(m,e.nome+': citou avaliação que não está na ficha');assert.equal(cit[1],m[1].replace('.',','));assert.equal(cit[2],m[2]);}
   const cit2=a.texto.match(/(\d{2,5}) avalia/);if(cit2)assert.ok(m&&cit2[1]===m[2],e.nome+': número de avaliações diferente da ficha');
   assert.ok(a.texto.toLowerCase().includes(r.perfil.loja.toLowerCase()),e.nome+': mensagem sem o nome da loja');assert.ok(r.perfil.loja.length>=2&&r.perfil.loja.length<=40&&!/assist[eê]ncia t[eé]cnica (de|em|especializada)|[®|]|\s(e|de|&|-)$/i.test(r.perfil.loja),'nome curto estranho: '+r.perfil.loja);}}
 console.log('   mensagens citando avaliações reais:',comNota);assert.ok(comNota>=20);});
ok('grupos A, B e C: a prioridade da pesquisa é lida da ficha e mostrada como comparação, não como probabilidade',()=>{
 const g=new Map();for(const {r} of recs){const k=r.perfil.pesquisa?.grupo||'sem grupo';g.set(k,(g.get(k)||0)+1);}console.log('   grupos:',[...g.entries()].map(([k,v])=>k+' '+v).join(' · '));
 assert.ok(g.get('A')>=20&&g.get('B')>=50&&g.get('C')>=10);const f=recs.find(x=>x.r.perfil.pesquisa).r.perfil.fatos.find(x=>/Pesquisa/.test(x.rotulo));assert.match(f.origem,/não é probabilidade/);});
ok('conversa simulada com 12 empresas reais (em memória): resposta → objeção → preço, sempre com continuidade e sem repetir',()=>{
 const roteiro=['Como posso ajudar?','ainda não temos site','depende do valor','final de ano está complicado'];
 for(const {e} of recs.filter((_,i)=>i%Math.ceil(recs.length/12)===0).slice(0,12)){let d=0;const usados=[];
  const manda=()=>{const c=compor(s,e,{agora:A(d)});assert.ok(c.alternativas.length,e.nome+' sem alternativa em d='+d+' '+c.motivoAguardar);const a=c.alternativas[0];assert.ok(!usados.includes(a.estrategia),e.nome+' repetiu '+a.estrategia);usados.push(a.estrategia);assert.ok(validarMensagem(s,e,a.texto,{agora:A(d)}).ok,a.texto);confirmarEnvioMensagem(s,e,{texto:a.texto,estrategia:a.estrategia,variante:a.variante,tipo:a.tipo});s.eventos.at(-1).quando=new Date(A(d)).toISOString();return a;};
  manda();for(const fala of roteiro){d+=.05;registrarResposta(s,e,{texto:fala,interesse:'medio'});s.eventos.filter(v=>v.tipo==='resposta').at(-1).quando=new Date(A(d)).toISOString();d+=.05;const a=manda();
   if(fala==='depende do valor')assert.match(a.texto,/R\$ 800|R\$ 600/,e.nome);if(fala==='final de ano está complicado')assert.ok(!/desconto/i.test(a.texto));}
  assert.equal(usados.length,5);}});
ok('nenhum envio real: o teste não abre WhatsApp, não cria rascunho e só registra eventos na cópia em memória',()=>{assert.equal(s.rascunhos.length,0);assert.equal(JSON.parse(antes).ras,0);});
if(process.env.AMOSTRA){console.log('\n--- amostra (sem telefones) ---');const vistos=new Set();for(const {e,r} of recs){const k=r.alternativas[0].estrategia;if(vistos.has(k))continue;vistos.add(k);console.log('\n'+r.perfil.loja+' · '+(e.cidade||'')+' · perfil: '+r.perfil.rotuloPerfil);for(const a of r.alternativas)console.log('  ['+a.rotulo+' · '+a.nome+'] '+a.texto);}}
console.log(n+' verificações aprovadas (empresas reais, nada enviado)');
