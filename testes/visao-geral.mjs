import assert from 'node:assert/strict';
import {navegacao,rotasNavegacao,paiDaRota,montarVisaoGeral} from '../nucleo/flow.js';
import {estadoInicial,normalizarEmpresa} from '../nucleo/esquema.js';
import {lerPontuacaoPesquisa,pontuarEmpresa} from '../nucleo/pontuacao.js';
const orig=['geral','hoje','empresas','pipeline','estudio','propostas','laboratorio','quant','conversao','ofertas','diagnostico','publicacoes','connect','financeiro','modelos','lembretes','relatorios','dados','configuracoes'];
assert.equal(navegacao.length,10);assert.deepEqual([...rotasNavegacao].sort(),orig.sort());assert.equal(paiDaRota('publicacoes'),'estudio');assert.equal(paiDaRota('dados'),'configuracoes');
const s=estadoInicial();const add=(id,p,e,extra={})=>s.empresas.push(normalizarEmpresa({id,nome:id,cidade:'Cidade - ES',potencial:'Grupo A original · potencial '+p+'/100 · evidência '+e+'/100.',...extra}));
add('A1',83,95);add('A2',87,63);add('site',99,99,{statusSite:'possui'});add('bloqueada',99,99,{situacao:'nao-contatar'});add('historica',99,99,{notas:'NÃO aprovado para nova abordagem'});add('contatada',99,99,{primeiroContato:'2026-11-12T10:00:00Z'});add('resposta',70,80,{etapa:'respondeu'});
s.eventos.push({id:'r',empresaId:'resposta',tipo:'resposta',quando:'2026-11-15T10:00:00Z'});s.pagamentos.push({valor:100,estado:'confirmado'},{valor:900,estado:'estornado'});
const v=montarVisaoGeral(s);assert.equal(v.total,7);assert.equal(v.grupos.A,7);assert.deepEqual(v.destaques.map(x=>x.empresa.id),['A1','A2']);assert.equal(v.principal.titulo,'Responder empresa');assert.equal(v.principal.id,'resposta');assert.equal(v.recebido,100);assert.equal(v.contagens.reduce((a,x)=>a+x.quantidade,0),7);assert.equal(v.fila.length,2);
// Grupos importados sem escores devem ser preservados sem criar pontuação fictícia.
const pendente=normalizarEmpresa({id:'sem-escores',nome:'Classificação sem escore',cidade:'Atibaia - SP',potencial:'Grupo A — prioridade comercial provisória da lista; confirmação pendente.'});
const leitura=lerPontuacaoPesquisa(pendente);
assert.equal(leitura?.grupo,'A');assert.equal(leitura?.potencial,null);assert.equal(leitura?.evidencia,null);
const semNotas=estadoInicial();semNotas.empresas.push(pendente);
assert.equal(montarVisaoGeral(semNotas).grupos.A,1);
assert.equal(pontuarEmpresa(pendente,semNotas).comercial,0);
const vazio=montarVisaoGeral(estadoInicial());assert.equal(vazio.total,0);assert.equal(vazio.principal.acao,'nova-empresa');assert.equal(vazio.destaques.length,0);
console.log('Órbita Flow: rotas, prioridades, bloqueios, valores e estados vazios verificados.');
