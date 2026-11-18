import assert from 'node:assert/strict';
import {calcularAtividadeProspeccao} from '../painel-prospeccao.js';
const d=(dia,hora=12)=>new Date(2026,10,dia,hora).toISOString();
const agora=new Date(2026,10,17,21);
const estado={
 empresas:[
  {id:'a',etapa:'mensagem'},
  {id:'b',etapa:'respondeu'},
  {id:'c',etapa:'fechada'},
  {id:'d',etapa:'encontrada'}
 ],
 eventos:[
  {id:'1',empresaId:'a',tipo:'mensagem-enviada',quando:d(17)},
  {id:'2',empresaId:'a',tipo:'mensagem-enviada',quando:d(17,14)},
  {id:'3',empresaId:'a',tipo:'resposta',quando:d(17,15)},
  {id:'4',empresaId:'b',tipo:'mensagem-enviada',quando:d(16)},
  {id:'5',empresaId:'b',tipo:'resposta',quando:d(16,15)},
  {id:'6',empresaId:'d',tipo:'mensagem-enviada',quando:d(10)},
  {id:'7',empresaId:'d',tipo:'resposta',quando:d(9)},
  {id:'8',empresaId:'a',tipo:'mensagem-enviada',quando:d(15),revertido:true},
  {id:'9',empresaId:'b',tipo:'mensagem-enviada',quando:d(2)},
  {id:'10',empresaId:'c',tipo:'mensagem-enviada',quando:d(31)}
 ]
};
const r=calcularAtividadeProspeccao(estado,agora);
assert.equal(r.hoje,2,'duas mensagens confirmadas hoje');
assert.equal(r.ontem,1);
assert.equal(r.semana,3,'semana civil começa na segunda-feira');
assert.equal(r.semanaAnterior,1,'o envio de 10/11 pertence à semana anterior');
assert.equal(r.mes,5,'registros futuros não entram no mês atual');
assert.equal(r.mesAnterior,0);
assert.equal(r.total,6,'total histórico inclui evento futuro confirmado e exclui revertidos');
assert.equal(r.contatos,3,'empresas únicas não multiplicam o denominador');
assert.equal(r.responderam,2,'resposta anterior ao primeiro envio não conta');
assert.equal(r.taxaResposta,2/3);
assert.equal(r.semanaDias[0].quantidade,1,'segunda-feira');
assert.equal(r.semanaDias[1].quantidade,2,'terça-feira');
assert.equal(r.contagens.find(x=>x.id==='fechada').quantidade,1);
assert.equal(r.recentes[0].tipo,'resposta');
const vazio=calcularAtividadeProspeccao({eventos:[],empresas:[]},agora);
assert.equal(vazio.total,0);
assert.equal(vazio.taxaResposta,null,'sem dados não se inventa taxa de resposta');
assert.equal(vazio.semanaDias.length,7);
console.log('Painel de prospecção: métricas e funil validados.');
