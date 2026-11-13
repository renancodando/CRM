/* Protocolo Órbita Connect v1: definição única das operações. Os esquemas JSON em /esquemas são gerados daqui (testes/connect gera e confere). */
export const VERSAO_PROTOCOLO='1.0';
export const TAMANHO_MAX_OPERACAO=60000;
export const ISO=/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d+)?)?(Z|[+-]\d{2}:\d{2})$/;
const DATA=/^\d{4}-\d{2}-\d{2}$/;
const t=(max=500,o={})=>({tipo:'string',max,...o}),n=(o={})=>({tipo:'inteiro',...o}),b=()=>({tipo:'booleano'}),l=(item,max=30)=>({tipo:'lista',item,max}),e=(vals,o={})=>({tipo:'enum',vals,...o}),d=(o={})=>({tipo:'data',...o}),dh=(o={})=>({tipo:'datahora',...o});
const NICHOS=['celulares','odontologia','automotivo'];
const camposEmpresa={nome:t(180),nicho:e(NICHOS),cidade:t(120),estado:t(2,{min:2}),whatsapp:t(30),telefone:t(30),email:t(160),contato:t(120),instagram:t(200),endereco:t(250),site:t(250),statusSite:e(['desconhecido','sem-site','possui','desatualizado']),evidenciaSite:t(400),fonte:t(250),verificadoEm:d(),notas:t(2000),diferenciais:l(t(200),12),servicosOferecidos:l(t(120),20),potencial:t(300),abordagem:t(120),proximaAcao:t(200),retornoEm:dh(),interesse:e(['desconhecido','nenhum','baixo','medio','alto']),contatoDireto:e(['sim','nao','desconhecido']),responsavel:t(120),cro:t(30)};
const refEmpresa={empresaId:t(80,{opcional:true}),empresaRef:{tipo:'objeto',campos:{nome:t(180),cidade:t(120),whatsapp:t(30),telefone:t(30),email:t(160),instagram:t(200),site:t(250)},opcional:true}};
export const operacoes={
 'empresa.criar':{rotulo:'Cadastrar empresa',categoria:'cadastro',sensivel:false,campos:{dados:{tipo:'objeto',campos:camposEmpresa,obrigatorios:['nome','cidade']}}},
 'empresa.atualizar':{rotulo:'Atualizar empresa',categoria:'cadastro',sensivel:false,campos:{...refEmpresa,versaoEsperada:n({min:0,opcional:true}),base:{tipo:'objeto',livre:true,opcional:true},dados:{tipo:'objeto',campos:camposEmpresa,obrigatorios:[]}}},
 'empresa.etapa':{rotulo:'Atualizar etapa',categoria:'pipeline',sensivel:false,campos:{...refEmpresa,etapa:e(['encontrada','verificada','mensagem','respondeu','demonstracao','negociacao','proposta']),ocorreuEm:dh(),justificativa:t(300,{opcional:true})}},
 'empresa.situacao':{rotulo:'Alterar situação',categoria:'pipeline',sensivel:false,campos:{...refEmpresa,situacao:e(['ativa','perdida','recusada','pausada','nao-contatar']),motivo:t(300,{opcional:true}),ocorreuEm:dh()}},
 'conversa.mensagem_enviada':{rotulo:'Registrar mensagem enviada',categoria:'conversa',sensivel:false,campos:{...refEmpresa,texto:t(2000),ocorreuEm:dh(),canal:e(['whatsapp','telefone','email','instagram','presencial','outro']),estrategia:t(60,{opcional:true}),confirmadoPeloUsuario:{tipo:'booleano',exigeVerdadeiro:true}}},
 'conversa.resposta_recebida':{rotulo:'Registrar resposta recebida',categoria:'conversa',sensivel:false,campos:{...refEmpresa,texto:t(2000,{opcional:true}),ocorreuEm:dh({opcional:true}),canal:e(['whatsapp','telefone','email','instagram','presencial','outro'],{opcional:true}),interesse:e(['desconhecido','nenhum','baixo','medio','alto'],{opcional:true}),pediuDemonstracao:b(),pediuParar:b(),recusou:b(),interpretacao:t(500,{opcional:true})}},
 'demonstracao.apresentada':{rotulo:'Registrar demonstração apresentada',categoria:'estudio',sensivel:true,campos:{...refEmpresa,demonstracaoId:t(80),versaoId:t(80,{opcional:true}),ocorreuEm:dh(),confirmadoPeloUsuario:{tipo:'booleano',exigeVerdadeiro:true}}},
 'demonstracao.link_registrado':{rotulo:'Registrar link de demonstração',categoria:'estudio',sensivel:false,campos:{demonstracaoId:t(80),url:t(300)}},
 'proposta.criar':{rotulo:'Criar proposta',categoria:'financeiro',sensivel:true,campos:{...refEmpresa,valorOriginalCentavos:n({min:0}),valorFinalCentavos:n({min:1}),demonstracaoId:t(80,{opcional:true}),escopo:t(1000,{opcional:true}),condicoesPagamento:t(400,{opcional:true}),validade:dh({opcional:true})}},
 'venda.registrar':{rotulo:'Registrar venda fechada',categoria:'financeiro',sensivel:true,campos:{...refEmpresa,valorContratadoCentavos:n({min:1}),propostaId:t(80,{opcional:true}),formaPagamento:t(120,{opcional:true}),condicoes:t(400,{opcional:true}),ocorreuEm:dh(),confirmadoPeloUsuario:{tipo:'booleano',exigeVerdadeiro:true}}},
 'pagamento.registrar':{rotulo:'Registrar pagamento recebido',categoria:'financeiro',sensivel:true,campos:{...refEmpresa,propostaId:t(80,{opcional:true}),valorCentavos:n({min:1}),recebidoEm:dh(),forma:t(60,{opcional:true}),observacao:t(300,{opcional:true}),confirmadoPeloUsuario:{tipo:'booleano',exigeVerdadeiro:true}}},
 'custo.registrar':{rotulo:'Registrar custo',categoria:'financeiro',sensivel:false,campos:{...refEmpresa,descricao:t(160),valorCentavos:n({min:1}),ocorreuEm:dh(),categoria:e(['comercial','projeto','operacional','ferramenta','hospedagem','taxa','imposto','antecipacao'],{opcional:true}),formaPagamento:t(60,{opcional:true})}},
 'sessao.registrar':{rotulo:'Registrar horas de trabalho',categoria:'tempo',sensivel:false,campos:{...refEmpresa,atividade:e(['prospeccao','pesquisa','mensagens','negociacao','demonstracao','desenvolvimento','personalizacao','publicacao','suporte','alteracoes','posvenda']),inicio:dh({opcional:true}),duracaoMinutos:n({min:1,max:1440}),observacao:t(300,{opcional:true})}},
 'tarefa.criar':{rotulo:'Criar tarefa',categoria:'tarefas',sensivel:false,campos:{...refEmpresa,titulo:t(160),descricao:t(600,{opcional:true}),prazo:dh({opcional:true}),prazoSomenteData:d({opcional:true}),prioridade:e(['baixa','media','alta'],{opcional:true}),categoria:t(60,{opcional:true}),duracaoHoras:{tipo:'numero',min:0,max:500,opcional:true},dependeDe:l(t(80),10)}},
 'tarefa.atualizar':{rotulo:'Atualizar tarefa',categoria:'tarefas',sensivel:false,campos:{tarefaId:t(80),estado:e(['aberta','em-andamento','concluida','cancelada'],{opcional:true}),prazo:dh({opcional:true}),observacao:t(300,{opcional:true})}},
 'conversao.rascunho_mensagem':{rotulo:'Salvar rascunho de mensagem (não envia)',categoria:'conversao',sensivel:false,campos:{...refEmpresa,texto:t(2000),abordagem:t(60,{opcional:true}),porque:t(600,{opcional:true})}},
 'conversao.objecao_registrada':{rotulo:'Registrar objeção do cliente',categoria:'conversao',sensivel:false,campos:{...refEmpresa,objecao:t(60),texto:t(1000,{opcional:true}),ocorreuEm:dh({opcional:true})}},
 'conversao.consentimento':{rotulo:'Registrar consentimento/revogação por canal',categoria:'conversao',sensivel:true,campos:{...refEmpresa,canal:e(['whatsapp','telefone','email','instagram','presencial']),estado:e(['autorizado','revogado','desconhecido']),origemConsentimento:t(300,{opcional:true}),confirmadoPeloUsuario:{tipo:'booleano',exigeVerdadeiro:true}}},
 'conversao.experimento_criar':{rotulo:'Criar experimento de conversão (sem distribuir nem enviar)',categoria:'conversao',sensivel:false,campos:{nome:t(120),hipotese:t(500),criterio:e(['resposta','resposta-positiva','demonstracao-aceita','venda']),nMinimoPorVariante:n({min:10,opcional:true}),variantes:l({tipo:'objeto',campos:{nome:t(80),abordagem:t(60,{opcional:true}),texto:t(1000,{opcional:true})},obrigatorios:['nome']},4)}},
 'reversao.solicitar':{rotulo:'Solicitar reversão de uma operação',categoria:'reversao',sensivel:true,campos:{operacaoId:t(80),motivo:t(300)}}
};
const camposOp={protocolo:t(10),id:t(80),tipo:t(60),origem:t(60),criadaEm:dh(),dependeDe:l(t(80),10),contexto:{tipo:'objeto',livre:true,opcional:true},comentario:t(500,{opcional:true})};
function validarCampo(nome,def,valor,erros,caminho){
 const ref=caminho+nome;
 if(valor===undefined||valor===null){if(def.opcional||def.tipo==='booleano'&&false)return;if(def.tipo==='lista'||def.tipo==='booleano'&&true&&false)return;return void (def.opcional||erros.push(`${ref}: obrigatório`));}
 switch(def.tipo){
  case 'string':if(typeof valor!=='string')return void erros.push(`${ref}: deve ser texto`);if(valor.length>def.max)erros.push(`${ref}: no máximo ${def.max} caracteres`);if(def.min&&valor.length<def.min)erros.push(`${ref}: mínimo ${def.min} caracteres`);if(!valor.trim())erros.push(`${ref}: vazio`);if(/<script|javascript:|data:text\/html/i.test(valor))erros.push(`${ref}: conteúdo não permitido`);break;
  case 'inteiro':if(!Number.isInteger(valor))return void erros.push(`${ref}: deve ser inteiro (valores monetários em centavos inteiros)`);if(def.min!=null&&valor<def.min)erros.push(`${ref}: mínimo ${def.min}`);if(def.max!=null&&valor>def.max)erros.push(`${ref}: máximo ${def.max}`);break;
  case 'numero':if(typeof valor!=='number'||!Number.isFinite(valor))return void erros.push(`${ref}: deve ser número`);if(def.min!=null&&valor<def.min)erros.push(`${ref}: mínimo ${def.min}`);if(def.max!=null&&valor>def.max)erros.push(`${ref}: máximo ${def.max}`);break;
  case 'booleano':if(typeof valor!=='boolean')erros.push(`${ref}: deve ser verdadeiro/falso`);else if(def.exigeVerdadeiro&&valor!==true)erros.push(`${ref}: precisa ser true (confirmação explícita do usuário)`);break;
  case 'enum':if(!def.vals.includes(valor))erros.push(`${ref}: valor inválido "${valor}" (aceitos: ${def.vals.join(', ')})`);break;
  case 'data':if(typeof valor!=='string'||!DATA.test(valor)||Number.isNaN(Date.parse(valor)))erros.push(`${ref}: use data absoluta AAAA-MM-DD (datas relativas como "amanhã" não são aceitas)`);break;
  case 'datahora':if(typeof valor!=='string'||!ISO.test(valor)||Number.isNaN(Date.parse(valor)))erros.push(`${ref}: use data e hora ISO 8601 absolutas com fuso (ex.: 2026-11-14T09:00:00-03:00)`);break;
  case 'lista':if(!Array.isArray(valor))return void erros.push(`${ref}: deve ser lista`);if(valor.length>def.max)erros.push(`${ref}: no máximo ${def.max} itens`);valor.forEach((v,i)=>validarCampo('['+i+']',def.item,v,erros,ref));break;
  case 'objeto':{if(typeof valor!=='object'||Array.isArray(valor))return void erros.push(`${ref}: deve ser objeto`);if(def.livre){if(JSON.stringify(valor).length>4000)erros.push(`${ref}: grande demais`);break;}for(const k of Object.keys(valor))if(!(k in def.campos))erros.push(`${ref}.${k}: campo desconhecido`);for(const [k,dd] of Object.entries(def.campos))validarCampo(k,{...dd,opcional:dd.opcional||!(def.obrigatorios||[]).includes(k)},valor[k],erros,ref+'.');break;}
 }
}
export function validarOperacao(op){
 const erros=[];if(!op||typeof op!=='object'||Array.isArray(op))return {ok:false,erros:['A operação precisa ser um objeto JSON.']};
 if(JSON.stringify(op).length>TAMANHO_MAX_OPERACAO)return {ok:false,erros:['Operação grande demais.']};
 if(String(op.protocolo||'').split('.')[0]!==VERSAO_PROTOCOLO.split('.')[0])erros.push(`protocolo: versão incompatível (suportada: ${VERSAO_PROTOCOLO})`);
 const def=Object.hasOwn(operacoes,op.tipo)?operacoes[op.tipo]:null;if(!def)erros.push(`tipo: operação desconhecida "${op.tipo}"`);
 const base=Object.keys(camposOp);for(const k of Object.keys(op))if(!base.includes(k)&&!(def&&k in def.campos))erros.push(`${k}: campo não permitido nesta operação`);
 for(const [k,dd] of Object.entries(camposOp))validarCampo(k,k==='dependeDe'||k==='criadaEm'&&false?{...dd,opcional:true}:dd,op[k],erros,'');
 if(def){for(const [k,dd] of Object.entries(def.campos)){const v=op[k];validarCampo(k,dd.tipo==='lista'||dd.tipo==='booleano'&&!dd.exigeVerdadeiro?{...dd,opcional:true}:dd,v,erros,'');}
  if(def.campos.empresaRef&&!op.empresaId&&!op.empresaRef&&!['tarefa.criar','custo.registrar','sessao.registrar'].includes(op.tipo))erros.push('empresaId ou empresaRef: informe a empresa');
  if(op.tipo==='tarefa.criar'&&!op.prazo&&!op.prazoSomenteData&&false)erros.push('prazo');
  if(op.tipo==='proposta.criar'&&op.valorFinalCentavos>op.valorOriginalCentavos)erros.push('valorFinalCentavos: não pode superar o valor original');}
 if(typeof op.origem==='string'&&!/^[a-z0-9:_-]{2,60}$/i.test(op.origem))erros.push('origem: formato inválido');
 return {ok:!erros.length,erros};
}
export function esquemaJSON(tipo){
 const conv=d=>{switch(d.tipo){case 'string':return {type:'string',maxLength:d.max,...(d.min?{minLength:d.min}:{})};case 'inteiro':return {type:'integer',...(d.min!=null?{minimum:d.min}:{}),...(d.max!=null?{maximum:d.max}:{})};case 'numero':return {type:'number',...(d.min!=null?{minimum:d.min}:{}),...(d.max!=null?{maximum:d.max}:{})};case 'booleano':return d.exigeVerdadeiro?{const:true}:{type:'boolean'};case 'enum':return {enum:d.vals};case 'data':return {type:'string',pattern:'^\\d{4}-\\d{2}-\\d{2}$'};case 'datahora':return {type:'string',pattern:ISO.source};case 'lista':return {type:'array',maxItems:d.max,items:conv(d.item)};case 'objeto':return d.livre?{type:'object'}:{type:'object',additionalProperties:false,properties:Object.fromEntries(Object.entries(d.campos).map(([k,v])=>[k,conv(v)])),...(d.obrigatorios?.length?{required:d.obrigatorios}:{})};}};
 const def=operacoes[tipo],props={...Object.fromEntries(Object.entries(camposOp).map(([k,v])=>[k,conv(v)])),...Object.fromEntries(Object.entries(def.campos).map(([k,v])=>[k,conv(v)]))};props.tipo={const:tipo};props.protocolo={type:'string',pattern:'^1\\.\\d+$'};
 const req=['protocolo','id','tipo','origem','criadaEm',...Object.entries(def.campos).filter(([k,v])=>!v.opcional&&v.tipo!=='lista'&&!(v.tipo==='booleano'&&!v.exigeVerdadeiro)&&!['empresaId','empresaRef'].includes(k)).map(([k])=>k)];
 return {$schema:'https://json-schema.org/draft/2020-12/schema',$id:`orbita-connect/${tipo}.schema.json`,title:def.rotulo,type:'object',additionalProperties:false,properties:props,required:req};
}
export const todosEsquemas=()=>Object.fromEntries(Object.keys(operacoes).map(k=>[k,esquemaJSON(k)]));
