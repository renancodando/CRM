/* Domínio do Órbita Conversão: consentimento, qualificação explicável, máquina de estados da conversa e follow-up sem spam. Funções puras sobre o estado do CRM. */
import {eventosDaEmpresa,registrarEvento,registrarAuditoria,novoId} from '../esquema.js';
import {listarGruposDuplicados} from '../duplicidades.js';
export const canais=[['whatsapp','WhatsApp'],['telefone','Telefone'],['email','E-mail'],['instagram','Instagram'],['presencial','Presencial']];
export const configPadrao=()=>({pesos:{site:20,presencaDigital:10,avaliacoes:8,servicos:8,melhoriaConcreta:14,canalPublico:6,responsavel:12,historico:6,adequacao:6,demanda:10},follow:{intervalosDias:[3,7,14],maxTentativas:3,diasSemRespostaParaEstado:3},sensivelAoPreco:'depois-do-interesse'});
export function conv(estado){const c=(estado.conversao??={});c.rascunhos??=[];c.historicoRecomendacoes??=[];c.simulacoes??=[];c.registrosObjecao??=[];c.config=configCompleta(c.config);return c;}
function configCompleta(c={}){const p=configPadrao();return {pesos:{...p.pesos,...c.pesos},follow:{...p.follow,...c.follow},sensivelAoPreco:c.sensivelAoPreco||p.sensivelAoPreco};}
/* ---------- consentimento ---------- */
export function consentimento(empresa,canal){return empresa.consentimento?.[canal]||{estado:'desconhecido',origem:'',em:'',nota:''};}
export function registrarConsentimento(estado,empresa,canal,{estado:novo,origem='',nota=''}){
 if(!canais.some(c=>c[0]===canal))throw Error('Canal inválido.');if(!['autorizado','revogado','desconhecido'].includes(novo))throw Error('Estado de consentimento inválido.');
 if(novo==='autorizado'&&!origem.trim())throw Error('Informe a origem do consentimento (ex.: "pediu contato pelo WhatsApp em 12/11").');
 empresa.consentimento={...(empresa.consentimento||{}),[canal]:{estado:novo,origem:origem.trim(),nota:nota.trim(),em:new Date().toISOString()}};
 empresa.historico.push({quando:new Date().toISOString(),texto:`Consentimento (${canal}): ${novo}${origem?' — '+origem:''}.`});registrarEvento(estado,empresa.id,'consentimento',{canal,estado:novo,origem});
 if(novo==='revogado'&&empresa.situacao==='ativa'){empresa.situacao='nao-contatar';empresa.historico.push({quando:new Date().toISOString(),texto:'Contato bloqueado após revogação de consentimento.'});}
 registrarAuditoria(estado,'consentimento',empresa.id,`${empresa.nome}: ${canal} ${novo}`);return empresa.consentimento[canal];
}
export function podeContatar(empresa,canal='whatsapp'){
 if(empresa.situacao==='nao-contatar')return {ok:false,nivel:'bloqueado',motivo:'A empresa está marcada como "não contatar".'};
 if(empresa.situacao==='recusada')return {ok:false,nivel:'bloqueado',motivo:'A empresa recusou. Não envie novas abordagens comerciais.'};
 const c=consentimento(empresa,canal);
 if(c.estado==='revogado')return {ok:false,nivel:'bloqueado',motivo:'O consentimento neste canal foi revogado.'};
 if(c.estado==='autorizado')return {ok:true,nivel:'autorizado',motivo:'Consentimento registrado: '+(c.origem||'sem origem'),aviso:''};
 return {ok:true,nivel:'sem-registro',motivo:'Sem consentimento registrado para este canal.',aviso:'Um número publicado na internet não é consentimento. Prossiga apenas se você tiver base legítima para este contato e respeite a política do canal (WhatsApp Business: https://business.whatsapp.com/policy). Você precisa confirmar essa base ao registrar o envio.'};
}
/* ---------- qualificação ---------- */
const pesoMax=p=>Object.values(p).reduce((a,b)=>a+b,0);
export function qualificar(estado,empresa){
 const cfg=conv(estado).config,P=cfg.pesos,ev=eventosDaEmpresa(estado,empresa.id),pr=empresa.presenca||{};
 const f=[];const add=(chave,nome,valor,detalhe,verificado=true)=>f.push({chave,nome,peso:P[chave]||0,valor,detalhe,verificado});
 const semEvid=/evid[eê]ncia/i.test(empresa.notas||'');
 add('site','Situação do site',empresa.statusSite==='sem-site'?(semEvid?.95:.7):empresa.statusSite==='desatualizado'?.75:empresa.statusSite==='possui'?.2:null,empresa.statusSite==='desconhecido'?'Não verificado: não presumimos que não tenha site.':empresa.statusSite==='sem-site'&&!semEvid?'Marcado como sem site, mas sem evidência registrada (confiança menor).':'Status: '+empresa.statusSite,empresa.statusSite!=='desconhecido');
 add('presencaDigital','Presença digital ativa',pr.instagramAtivo==='sim'?.9:pr.instagramAtivo==='nao'?.35:empresa.instagram?.5:null,pr.instagramAtivo?'Atividade recente no Instagram: '+pr.instagramAtivo:empresa.instagram?'Perfil informado, atividade não verificada.':'Sem informação.',!!pr.instagramAtivo);
 const q=Number(pr.avaliacoesQtd),n=Number(pr.avaliacoesNota);
 add('avaliacoes','Avaliações públicas',Number.isFinite(q)&&q>0&&Number.isFinite(n)?Math.min(1,q/20)*(n>=4?1:n>=3.5?.7:.4):pr.avaliacoesQtd===0?.2:null,Number.isFinite(q)&&q>0?`${q} avaliação(ões), nota ${n||'?'}`:'Não informado.',Number.isFinite(q)&&q>=0&&pr.avaliacoesQtd!==undefined&&pr.avaliacoesQtd!=='');
 add('servicos','Serviços conhecidos',empresa.servicosOferecidos.length>=3?1:empresa.servicosOferecidos.length?.6:null,empresa.servicosOferecidos.length?empresa.servicosOferecidos.length+' serviço(s) informado(s)':'Nenhum serviço informado.',empresa.servicosOferecidos.length>0);
 const demo=empresa.servicosOferecidos.length>0&&(empresa.diferenciais.length>0||empresa.statusSite!=='desconhecido');
 add('melhoriaConcreta','Melhoria concreta demonstrável',demo?(empresa.statusSite==='sem-site'||empresa.statusSite==='desatualizado'?1:.6):null,demo?'Há dados para uma demonstração personalizada.':'Faltam serviços/diferenciais para personalizar uma demonstração.',demo);
 const canal=!!(empresa.whatsapp||empresa.telefone||empresa.email||empresa.instagram);
 add('canalPublico','Canal comercial público',canal?.8:.1,canal?'Há canal de contato cadastrado (público ou informado).':'Nenhum canal cadastrado.',true);
 add('responsavel','Responsável identificado',empresa.contatoDireto==='sim'?1:empresa.contato?.6:empresa.contatoDireto==='nao'?.15:null,empresa.contatoDireto==='sim'?'Contato direto confirmado.':empresa.contato?'Nome informado, sem confirmação de poder de decisão.':'Responsável não identificado.',empresa.contatoDireto!=='desconhecido');
 const resp=ev.filter(e=>e.tipo==='resposta'),msg=ev.filter(e=>e.tipo==='mensagem-enviada'),ref=ev.some(e=>e.tipo==='perda');
 add('historico','Histórico comigo',ref?0:resp.length?.9:msg.length?.45:null,ref?'Houve recusa/perda registrada.':resp.length?'Já respondeu antes.':msg.length?'Contatada, sem resposta.':'Sem histórico.',msg.length>0||resp.length>0);
 add('adequacao','Adequação ao meu produto',['celulares','odontologia','automotivo'].includes(empresa.nicho)?1:empresa.nicho?.5:null,empresa.nicho?'Nicho: '+empresa.nicho:'Nicho não definido.',!!empresa.nicho);
 add('demanda','Evidência de demanda',pr.demanda==='sim'?1:pr.demanda==='nao'?.1:null,pr.demanda?'Demanda: '+pr.demanda:'Sem evidência de demanda registrada.',!!pr.demanda);
 const conhecidos=f.filter(x=>x.valor!=null&&x.verificado!==false||x.valor!=null),pesoConhecido=conhecidos.reduce((s,x)=>s+x.peso,0),total=pesoMax(P);
 const nota=pesoConhecido?conhecidos.reduce((s,x)=>s+x.peso*x.valor,0)/pesoConhecido:null,confianca=total?pesoConhecido/total:0;
 const bloqueio=podeContatar(empresa,'whatsapp');
 let potencial=nota==null||confianca<.4?'indefinido':nota>=.65?'alto':nota>=.4?'médio':'baixo';
 const motivosPro=f.filter(x=>x.valor!=null&&x.valor>=.7).map(x=>x.nome+': '+x.detalhe),motivosContra=f.filter(x=>x.valor!=null&&x.valor<.4).map(x=>x.nome+': '+x.detalhe);
 const verificar=f.filter(x=>x.valor==null).map(x=>x.nome+' — '+x.detalhe);
 const canalRec=consentimento(empresa,'whatsapp').estado==='autorizado'&&empresa.whatsapp?'whatsapp':empresa.email?'email':empresa.whatsapp?'whatsapp':empresa.instagram?'instagram':empresa.telefone?'telefone':null;
 const argumento=empresa.statusSite==='sem-site'?'Ter um canal próprio onde os clientes encontram serviços e contato.':empresa.statusSite==='desatualizado'?'Atualizar o site para refletir serviços reais e facilitar o contato pelo celular.':empresa.servicosOferecidos.length?'Mostrar os serviços da empresa de forma organizada, com contato em um toque.':'Entender primeiro como os clientes encontram a empresa hoje.';
 return {nota:nota==null?null:Math.round(nota*100),confianca:Math.round(confianca*100),potencial,fatores:f,motivosPro,motivosContra,verificar,canalRecomendado:canalRec,permissao:bloqueio,melhorArgumento:argumento,
  proximoPasso:!bloqueio.ok?'Não abordar: '+bloqueio.motivo:potencial==='indefinido'?'Verificar os dados que faltam antes de abordar.':potencial==='baixo'?'Provavelmente não vale o tempo agora; reavalie se surgirem novos dados.':'Preparar a primeira mensagem com um fato verificado da empresa.',
  aviso:'Prioridade comercial calculada por regras. Não é probabilidade de venda: ainda não foi calibrada com resultados reais.'};
}
export function filaOportunidades(estado,{limite=30,canal='whatsapp'}={}){
 const dupes=new Set();for(const p of listarGruposDuplicados(estado.empresas))dupes.add(p.b.id);
 return estado.empresas.filter(e=>!dupes.has(e.id)&&e.situacao==='ativa'&&!['fechada'].includes(e.etapa)).map(e=>({empresa:e,q:qualificar(estado,e)})).filter(x=>x.q.permissao.ok&&x.q.potencial!=='baixo').sort((a,b)=>(b.q.nota??-1)*(b.q.confianca/100)-(a.q.nota??-1)*(a.q.confianca/100)).slice(0,limite);
}
/* ---------- máquina de estados ---------- */
export const estadosConversa=[['empresa-identificada','Empresa identificada'],['empresa-qualificada','Empresa qualificada'],['contato-autorizado','Contato comercial autorizado'],['primeira-mensagem-preparada','Primeira mensagem preparada'],['primeira-mensagem-enviada','Primeira mensagem enviada'],['sem-resposta','Sem resposta'],['resposta-inicial','Resposta inicial'],['interesse-identificado','Interesse identificado'],['necessidade-identificada','Necessidade identificada'],['responsavel-identificado','Responsável comercial identificado'],['demonstracao-oferecida','Demonstração oferecida'],['demonstracao-aceita','Demonstração aceita'],['demonstracao-apresentada','Demonstração apresentada'],['demonstracao-visualizada','Demonstração visualizada (confirmada)'],['objecao-recebida','Objeção recebida'],['negociacao','Negociação'],['proposta-apresentada','Proposta apresentada'],['venda-fechada','Venda fechada'],['venda-perdida','Venda perdida'],['contato-pausado','Contato pausado'],['nao-contatar','Não contatar']];
export const rotuloEstadoConversa=id=>estadosConversa.find(e=>e[0]===id)?.[1]||id;
export function estadoConversa(estado,empresa,agora=Date.now()){
 const ev=eventosDaEmpresa(estado,empresa.id),ult=t=>ev.filter(e=>e.tipo===t).at(-1),has=t=>ev.some(e=>e.tipo===t),cfg=conv(estado).config;
 const evid=[];const r=(id,motivo)=>({estado:id,evidencias:[...evid,motivo]});
 if(empresa.situacao==='nao-contatar')return r('nao-contatar','Situação do cadastro');
 if(ev.some(e=>e.tipo==='venda'||e.tipo==='proposta-aceita'))return r('venda-fechada','Evento de venda confirmado por você');
 if(['perdida','recusada'].includes(empresa.situacao))return r('venda-perdida','Situação: '+empresa.situacao+(empresa.motivoPerda?' — '+empresa.motivoPerda:''));
 if(empresa.situacao==='pausada')return r('contato-pausado','Situação do cadastro');
 const prop=ult('proposta-enviada'),obj=ev.filter(e=>e.tipo==='objecao').at(-1),demoEv=ult('demonstracao-apresentada'),resp=ult('resposta'),msg=ult('mensagem-enviada');
 if(prop){const depois=obj&&obj.t>prop.t||obj&&obj.quando>prop.quando;return r(depois?'negociacao':'proposta-apresentada','Proposta enviada em '+new Date(prop.quando).toLocaleDateString('pt-BR')+(depois?' e objeção posterior':''));}
 if(obj&&(!demoEv||obj.quando>=demoEv.quando))return r('objecao-recebida','Objeção registrada: '+(obj.categoria||obj.texto||'').toString().slice(0,60));
 if(has('demonstracao-visualizada'))return r('demonstracao-visualizada','Visualização confirmada por você');
 if(demoEv)return r('demonstracao-apresentada','Apresentação confirmada em '+new Date(demoEv.quando).toLocaleDateString('pt-BR'));
 if(resp?.pediuDemo||empresa.solicitouDemo)return r('demonstracao-aceita','A empresa pediu uma demonstração');
 if(ev.some(e=>e.tipo==='mensagem-enviada'&&e.estrategia==='demonstracao'))return r('demonstracao-oferecida','Mensagem de oferta de demonstração enviada');
 if(empresa.contatoDireto==='sim'&&resp)return r('responsavel-identificado','Contato direto com o responsável confirmado');
 if(empresa.necessidades.length&&resp)return r('necessidade-identificada','Necessidades registradas: '+empresa.necessidades.length);
 if(resp&&['medio','alto'].includes(resp.interesse||empresa.interesse))return r('interesse-identificado','Interesse registrado: '+(resp.interesse||empresa.interesse));
 if(resp)return r('resposta-inicial','Resposta registrada (sem sinal de interesse confirmado)');
 if(msg){const dias=(agora-new Date(msg.quando).getTime())/864e5;return dias>=cfg.follow.diasSemRespostaParaEstado?r('sem-resposta',`${Math.floor(dias)} dia(s) sem resposta após a última mensagem`):r('primeira-mensagem-enviada','Mensagem enviada em '+new Date(msg.quando).toLocaleDateString('pt-BR'));}
 if(conv(estado).rascunhos.some(x=>x.empresaId===empresa.id&&!x.enviadaEm))return r('primeira-mensagem-preparada','Há mensagem preparada (ainda não enviada)');
 if(consentimento(empresa,'whatsapp').estado==='autorizado')return r('contato-autorizado','Consentimento registrado');
 const q=qualificar(estado,empresa);if(['alto','médio'].includes(q.potencial))return r('empresa-qualificada','Potencial '+q.potencial+' (confiança '+q.confianca+'%)');
 return r('empresa-identificada','Cadastro');
}
const proximos={
 'empresa-identificada':{acao:'Verificar dados',descricao:'Confirme se tem site, quem decide e um canal público.',evitar:'Abordar sem saber nada específico da empresa.',encerrar:'Se não houver canal de contato legítimo.'},
 'empresa-qualificada':{acao:'Registrar base de contato e preparar a primeira mensagem',descricao:'Registre consentimento/origem do contato e escolha uma abordagem.',evitar:'Mensagem genérica de apresentação.',encerrar:''},
 'contato-autorizado':{acao:'Preparar a primeira mensagem',descricao:'Use um fato verificado da empresa e um próximo passo pequeno.',evitar:'Oferta e preço na primeira mensagem.',encerrar:''},
 'primeira-mensagem-preparada':{acao:'Revisar e enviar por você',descricao:'Edite e envie pelo canal; depois confirme o envio no Órbita.',evitar:'Registrar como enviada antes de enviar.',encerrar:''},
 'primeira-mensagem-enviada':{acao:'Aguardar',descricao:'Dê tempo para responder; programe um retorno.',evitar:'Mandar "viu minha mensagem?".',encerrar:''},
 'sem-resposta':{acao:'Um follow-up com novo ângulo',descricao:'Siga o plano de follow-up (limite de tentativas).',evitar:'Repetir a mesma mensagem.',encerrar:'Ao atingir o limite de tentativas configurado.'},
 'resposta-inicial':{acao:'Classificar a resposta e fazer uma pergunta que avance',descricao:'Respostas curtas ("sim", "serviços") não indicam compra.',evitar:'Despejar preço ou apresentação longa.',encerrar:'Se pedir para parar.'},
 'interesse-identificado':{acao:'Descobrir a necessidade e oferecer uma prévia',descricao:'Pergunte o que mais pesa hoje e ofereça ver um exemplo.',evitar:'Falar de preço antes de a empresa ver valor.',encerrar:''},
 'necessidade-identificada':{acao:'Ligar a necessidade a um benefício concreto',descricao:'Mostre como o site resolve exatamente aquilo.',evitar:'Prometer resultado comercial.',encerrar:''},
 'responsavel-identificado':{acao:'Oferecer a demonstração',descricao:'Já fala com quem decide: proponha ver a prévia.',evitar:'Insistir em reunião longa.',encerrar:''},
 'demonstracao-oferecida':{acao:'Aguardar o aceite',descricao:'Não envie o link antes de haver interesse.',evitar:'Mandar link não solicitado.',encerrar:'Se recusar.'},
 'demonstracao-aceita':{acao:'Criar e enviar a demonstração',descricao:'Personalize com dados verificados e registre a versão apresentada.',evitar:'Registrar como apresentada sem confirmar o envio.',encerrar:''},
 'demonstracao-apresentada':{acao:'Pedir feedback',descricao:'Pergunte o que ficou bom e o que mudaria.',evitar:'Falar de preço antes do feedback.',encerrar:''},
 'demonstracao-visualizada':{acao:'Conversar sobre ajustes e valor',descricao:'Responda ao feedback e proponha condições.',evitar:'Pressionar por decisão imediata.',encerrar:''},
 'objecao-recebida':{acao:'Responder à objeção com respeito',descricao:'Identifique se é preço, confiança, timing, autoridade ou recusa.',evitar:'Contra-argumentar uma recusa clara.',encerrar:'Se for recusa definitiva.'},
 'negociacao':{acao:'Negociar por interesses',descricao:'Explore escopo, etapas e condições antes de baixar preço.',evitar:'Desconto automático.',encerrar:''},
 'proposta-apresentada':{acao:'Acompanhar a decisão',descricao:'Combine um prazo e um canal para o retorno.',evitar:'Cobranças repetidas.',encerrar:'Quando a validade vencer sem retorno.'},
 'venda-fechada':{acao:'Pós-venda',descricao:'Confirme pagamento (por você) e inicie entrega.',evitar:'Registrar pagamento sem confirmação.',encerrar:''},
 'venda-perdida':{acao:'Registrar o aprendizado',descricao:'Anote o motivo e não insista.',evitar:'Novas abordagens comerciais.',encerrar:'Já encerrada.'},
 'contato-pausado':{acao:'Aguardar a data combinada',descricao:'Retome só quando combinado.',evitar:'Contato antes da data.',encerrar:''},
 'nao-contatar':{acao:'Nenhuma',descricao:'A empresa não deve receber novas mensagens comerciais.',evitar:'Qualquer abordagem.',encerrar:'Encerrada.'}
};
export const proximoPasso=id=>proximos[id]||proximos['empresa-identificada'];
/* ---------- follow-up ---------- */
export function planoFollowUp(estado,empresa,agora=Date.now()){
 const cfg=conv(estado).config.follow,ev=eventosDaEmpresa(estado,empresa.id),perm=podeContatar(empresa,'whatsapp');
 if(!perm.ok)return {permitido:false,motivo:perm.motivo,encerrar:true};
 const ultMsg=ev.filter(e=>e.tipo==='mensagem-enviada').at(-1);if(!ultMsg)return {permitido:false,motivo:'Nenhuma mensagem enviada ainda: não há o que retomar.'};
 const ultResp=ev.filter(e=>e.tipo==='resposta').at(-1),desde=ultResp&&ultResp.quando>=ultMsg.quando?null:ultMsg;
 if(!desde){if(empresa.retornoEm&&new Date(empresa.retornoEm).getTime()>agora)return {permitido:false,motivo:'Retorno combinado para '+new Date(empresa.retornoEm).toLocaleDateString('pt-BR')+'.',aguardar:true};return {permitido:true,tipo:'resposta-pendente',motivo:'A empresa respondeu: responda ao que foi dito em vez de fazer follow-up genérico.',tentativas:0};}
 const tentativas=ev.filter(e=>e.tipo==='mensagem-enviada'&&e.quando>=(ultResp?.quando||'')).length;
 if(tentativas>=cfg.maxTentativas)return {permitido:false,motivo:`Limite de ${cfg.maxTentativas} tentativa(s) atingido sem resposta. Encerre a oportunidade com uma mensagem gentil ou apenas pare.`,encerrar:true,tentativas};
 const intervalo=cfg.intervalosDias[Math.min(tentativas-1,cfg.intervalosDias.length-1)]??7,proxima=new Date(new Date(ultMsg.quando).getTime()+intervalo*864e5),podeAgora=proxima.getTime()<=agora;
 const tipos=['novo-angulo','valor-concreto','encerramento-gentil'];
 return {permitido:podeAgora,motivo:podeAgora?'Intervalo cumprido.':'Aguarde até '+proxima.toLocaleDateString('pt-BR')+' (intervalo configurado de '+intervalo+' dias).',tentativas,proximaData:proxima.toISOString(),tipo:tipos[Math.min(tentativas-1,2)],restantes:cfg.maxTentativas-tentativas};
}
