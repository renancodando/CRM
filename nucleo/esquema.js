export const VERSAO_ESTADO=3;
export const etapas=[
 {id:'encontrada',nome:'Encontrada',icone:'alvo'},{id:'verificada',nome:'Verificada',icone:'busca'},{id:'mensagem',nome:'Mensagem enviada',curto:'Mensagem',icone:'aviao'},{id:'respondeu',nome:'Respondeu',icone:'mensagem'},{id:'demonstracao',nome:'Demonstração enviada',curto:'Demonstração',icone:'monitor'},{id:'negociacao',nome:'Negociação',icone:'acordo'},{id:'proposta',nome:'Proposta enviada',curto:'Proposta',icone:'dinheiro'},{id:'fechada',nome:'Fechada',icone:'verificado'}
];
export const situacoes=[{id:'ativa',nome:'Ativa'},{id:'perdida',nome:'Oportunidade perdida'},{id:'recusada',nome:'Recusada'},{id:'pausada',nome:'Pausada'},{id:'nao-contatar',nome:'Não contatar'}];
export const statusSite=[{id:'desconhecido',nome:'Desconhecido'},{id:'sem-site',nome:'Sem site confirmado'},{id:'possui',nome:'Possui site'},{id:'desatualizado',nome:'Site desatualizado'}];
export const niveisInteresse=[{id:'desconhecido',nome:'Desconhecido'},{id:'nenhum',nome:'Nenhum'},{id:'baixo',nome:'Baixo'},{id:'medio',nome:'Médio'},{id:'alto',nome:'Alto'}];
export const tiposEvento=['mensagem-enviada','resposta','demonstracao-apresentada','proposta-enviada','proposta-aceita','proposta-recusada','pagamento','etapa','perda','contato','venda','nota'];
export const relacoes=[['lembretes','empresa'],['rascunhos','empresa'],['demonstracoes','empresaId'],['eventos','empresaId'],['propostas','empresaId'],['pagamentos','empresaId'],['posVenda','empresaId'],['custos','empresaId'],['sessoes','empresaId'],['tarefas','empresaId'],['decisoes','empresaId']];
export const colecoes=['empresas','lembretes','rascunhos','demonstracoes','eventos','propostas','pagamentos','posVenda','custos','experimentos','lixeira','auditoria','mensagensSalvas','sessoes','tarefas','decisoes','metas','conhecimento','operacoes','consultas','fechamentos','extratos'];
export const configuracaoPadrao=()=>({
 quant:{valorHoraCent:null,margemAlvo:null,minimoResultadoCent:null,taxaDescontoAnual:null,saldoInicial:null,horasSemanaDisponiveis:null,limiteDescontoPct:30,diasSemRegistro:14},
 pesos:{semSite:25,contatoDireto:20,resposta:15,interesse:20,demonstracao:20},
 comercial:{precoNormal:1230,precoPromocional:800,precoPix:600,parcelasMax:12,jurosParcelas:0,suporteDias:30,prazoEntregaDias:7,validadeDias:7,pagamento:'Pagamento único pelo desenvolvimento.',suporte:'Um mês de suporte e pequenas alterações.'},
 automacoes:{retornoDemo:true,negociacaoParada:true,propostaVencendo:true,proximaAcao:true,cadastroIncompleto:true,suporteVencendo:true,diasRetornoDemo:3,diasNegociacaoParada:7,diasPropostaAviso:2,diasSuporteAviso:7}
});
export const novoId=()=>(globalThis.crypto?.randomUUID?.()||'id-'+Date.now().toString(36)+Math.random().toString(36).slice(2,10));
const lista=v=>Array.isArray(v)?v.map(x=>String(x).trim()).filter(Boolean):typeof v==='string'?v.split(/\n|;/).map(x=>x.trim()).filter(Boolean):[];
export function normalizarEmpresa(e){
 const etapa=etapas.some(x=>x.id===e.etapa)?e.etapa:'encontrada';
 return {
  nome:'',cidade:'',contato:'',telefone:'',email:'',site:'',valor:0,notas:'',nicho:'',modelo:null,historico:[],
  ...e,etapa,id:String(e.id||novoId()),criada:Number.isFinite(new Date(e.criada).getTime())?e.criada:new Date().toISOString(),
  historico:Array.isArray(e.historico)?e.historico:[],valor:Number(e.valor)||0,
  whatsapp:e.whatsapp||'',instagram:e.instagram||'',endereco:e.endereco||'',fonte:e.fonte||'',verificadoEm:e.verificadoEm||'',links:lista(e.links),
  cro:e.cro||'',responsavel:e.responsavel||'',horario:e.horario||'',
  statusSite:statusSite.some(x=>x.id===e.statusSite)?e.statusSite:'desconhecido',
  potencial:e.potencial||'',diferenciais:lista(e.diferenciais),servicosOferecidos:lista(e.servicosOferecidos),necessidades:lista(e.necessidades),objecoes:lista(e.objecoes),
  interesse:niveisInteresse.some(x=>x.id===e.interesse)?e.interesse:'desconhecido',contatoDireto:['sim','nao'].includes(e.contatoDireto)?e.contatoDireto:'desconhecido',
  solicitouDemo:e.solicitouDemo===true,abordagem:e.abordagem||'',primeiroContato:e.primeiroContato||'',ultimoContato:e.ultimoContato||'',
  proximaAcao:e.proximaAcao||'',retornoEm:e.retornoEm||'',etapaEm:e.etapaEm||[...(Array.isArray(e.historico)?e.historico:[])].reverse().find(h=>/^Movida para/.test(h?.texto||''))?.quando||e.criada||new Date().toISOString(),
  valorNegociado:e.valorNegociado===undefined||e.valorNegociado===''?null:Number(e.valorNegociado),condicoes:e.condicoes||'',motivoPerda:e.motivoPerda||'',
  situacao:situacoes.some(x=>x.id===e.situacao)?e.situacao:'ativa',faixaPreco:e.faixaPreco||''
 };
}
export function estadoInicial(){
 const base={versao:VERSAO_ESTADO,preferencias:{nome:'Renan',cargo:'Desenvolvedor',marca:'Órbita',movimento:!(globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches),qualidade:'equilibrada',contraste:false},notificacoesLidas:true,config:configuracaoPadrao()};
 for(const c of colecoes)base[c]=[];return base;
}
export function normalizarEstado(bruto){
 const base=estadoInicial(),origem=bruto&&typeof bruto==='object'?bruto:{};
 for(const c of colecoes)base[c]=Array.isArray(origem[c])?origem[c].filter(x=>x&&typeof x==='object'):[];
 base.empresas=base.empresas.map(normalizarEmpresa);
 base.preferencias={...base.preferencias,...(origem.preferencias||{})};
 const cfg=origem.config||{};base.config={quant:{...base.config.quant,...cfg.quant},pesos:{...base.config.pesos,...cfg.pesos},comercial:{...base.config.comercial,...cfg.comercial},automacoes:{...base.config.automacoes,...cfg.automacoes}};
 base.notificacoesLidas=origem.notificacoesLidas!==false?true:false;
 for(const [chave,valor] of Object.entries(origem))if(!(chave in base)&&chave!=='versao')base[chave]=valor;
 return base;
}
export function validarIntegridade(estado){
 const problemas=[],ids=new Set(estado.empresas.map(e=>e.id));
 if(ids.size!==estado.empresas.length)problemas.push('Existem empresas com identificadores repetidos.');
 for(const [colecao,campo] of relacoes)for(const item of estado[colecao]||[]){if(item[campo]&&!ids.has(item[campo]))problemas.push(`${colecao}: registro "${item.id||'?'}" aponta para empresa inexistente.`);}
 const demos=new Set((estado.demonstracoes||[]).map(d=>d.id));
 for(const p of estado.propostas||[])if(p.demonstracaoId&&!demos.has(p.demonstracaoId))problemas.push(`propostas: "${p.id}" aponta para demonstração inexistente.`);
 const propostas=new Set((estado.propostas||[]).map(p=>p.id));
 for(const p of estado.pagamentos||[])if(p.propostaId&&!propostas.has(p.propostaId))problemas.push(`pagamentos: "${p.id}" aponta para proposta inexistente.`);
 return problemas;
}
export function registrarAuditoria(estado,tipo,alvo,resumo){estado.auditoria.push({id:novoId(),quando:new Date().toISOString(),tipo,alvo,resumo});if(estado.auditoria.length>1500)estado.auditoria.splice(0,estado.auditoria.length-1500);}
export function registrarEvento(estado,empresaId,tipo,dados={},quando=new Date().toISOString()){const ev={origem:'usuario',...dados,id:novoId(),empresaId,tipo,quando,registradoEm:new Date().toISOString()};estado.eventos.push(ev);return ev;}
export function eventosDaEmpresa(estado,id,tipo){return estado.eventos.filter(e=>e.empresaId===id&&(!tipo||e.tipo===tipo));}
export function moverEtapa(estado,empresa,etapa,origem='manual'){
 if(empresa.etapa===etapa)return false;const anterior=empresa.etapa;empresa.etapa=etapa;empresa.etapaEm=new Date().toISOString();
 empresa.historico.push({quando:empresa.etapaEm,texto:'Movida para '+(etapas.find(x=>x.id===etapa)?.nome||etapa)+'.'});
 registrarEvento(estado,empresa.id,'etapa',{de:anterior,para:etapa,origem});registrarAuditoria(estado,'etapa',empresa.id,empresa.nome+': '+anterior+' → '+etapa);return true;
}
