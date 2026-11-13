/* Importação de conversas coladas do WhatsApp. Preserva o texto original; quando autor, ordem ou data são incertos, marca para revisão. Importar NUNCA envia nada. */
import {novoId,registrarEvento,registrarAuditoria} from '../esquema.js';
const A=/^‎?(\d{1,2})\/(\d{1,2})\/(\d{2,4}),?\s+(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(?:-|–)\s+(.*)$/;        // Android: 12/11/2026 14:35 - Nome: texto
const I=/^‎?\[(\d{1,2})\/(\d{1,2})\/(\d{2,4}),?\s+(\d{1,2}):(\d{2})(?::(\d{2}))?\]\s*(.*)$/;                    // iOS: [12/11/2026 14:35:20] Nome: texto
const SEM_DATA=/^([^:\n]{1,40}):\s+(.+)$/;
const SISTEMA=/criptografad|mensagem apagada|mídia oculta|imagem ocultada|figurinha omitida|áudio ocultado|<arquivo|chamada de voz|chamada perdida|você foi adicionado|criou o grupo|mudou o número|apagou esta mensagem|\(arquivo anexado\)/i;
function data(d,m,a,h,mi,s){let ano=Number(a);if(ano<100)ano+=2000;const mes=Number(m),dia=Number(d);if(mes<1||mes>12||dia<1||dia>31)return null;const dt=new Date(ano,mes-1,dia,Number(h),Number(mi),Number(s||0));return Number.isNaN(dt.getTime())?null:dt.toISOString();}
function dividir(resto){const i=resto.indexOf(': ');if(i<1||i>40)return {sistema:true,texto:resto};return {nome:resto.slice(0,i).trim(),texto:resto.slice(i+2)};}
export function importarConversaWhatsApp(texto,{meuNome='',nomeCliente=''}={}){
 const original=String(texto??'');if(!original.trim())throw Error('Cole a conversa para importar.');
 const linhas=original.replace(/\r/g,'').split('\n'),brutas=[];let comData=0,semData=0;
 for(const l of linhas){
  const m=A.exec(l)||I.exec(l);
  if(m){const p=dividir(m[7]);brutas.push({...p,quando:data(m[1],m[2],m[3],m[4],m[5],m[6]),quandoTexto:`${m[1]}/${m[2]}/${m[3]} ${m[4]}:${m[5]}`,linhas:[p.texto]});comData++;continue;}
  if(!l.trim()){if(brutas.length)brutas.at(-1).linhas.push('');continue;}
  const s=SEM_DATA.exec(l);
  if(s&&(!brutas.length||brutas.at(-1).quando===null||brutas.length&&brutas.at(-1).nome===undefined)&&comData===0){brutas.push({nome:s[1].trim(),texto:s[2],quando:null,quandoTexto:'',linhas:[s[2]]});semData++;continue;}
  if(brutas.length)brutas.at(-1).linhas.push(l);else brutas.push({nome:undefined,texto:l,quando:null,quandoTexto:'',linhas:[l]});
 }
 const msgs=brutas.map(b=>({nomeOriginal:b.nome||'',texto:b.linhas.join('\n').trim(),quando:b.quando,quandoTexto:b.quandoTexto,sistema:b.sistema===true||(b.nome&&SISTEMA.test(b.linhas.join('\n'))&&b.linhas.join('\n').length<80)})).filter(m=>m.texto);
 const participantes=[...new Set(msgs.filter(m=>m.nomeOriginal&&!m.sistema).map(m=>m.nomeOriginal))];
 const norm=s=>String(s||'').normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase().trim();
 const mapa={};for(const p of participantes){if(meuNome&&norm(p)===norm(meuNome))mapa[p]='eu';else if(nomeCliente&&norm(p)===norm(nomeCliente))mapa[p]='cliente';}
 if(participantes.length===2){const [x,y]=participantes;if(mapa[x]==='eu'&&!mapa[y])mapa[y]='cliente';if(mapa[y]==='eu'&&!mapa[x])mapa[x]='cliente';if(mapa[x]==='cliente'&&!mapa[y])mapa[y]='eu';if(mapa[y]==='cliente'&&!mapa[x])mapa[x]='eu';}
 const avisos=[];let ordemDuvidosa=false;let ant=null;
 const mensagens=msgs.map((m,i)=>{
  const motivos=[];let autor=m.sistema?'sistema':m.nomeOriginal?(mapa[m.nomeOriginal]||'indefinido'):'indefinido';
  if(autor==='indefinido')motivos.push(m.nomeOriginal?'Não foi possível saber se "'+m.nomeOriginal+'" é você ou o cliente.':'Sem nome do remetente.');
  if(!m.quando&&!m.sistema)motivos.push('Sem data/hora identificada.');
  if(m.quando&&ant&&new Date(m.quando)<new Date(ant)){ordemDuvidosa=true;motivos.push('A data é anterior à mensagem anterior: ordem ou formato de data duvidoso.');}
  if(m.quando)ant=m.quando;
  return {id:novoId(),ordem:i,autor,nomeOriginal:m.nomeOriginal,texto:m.texto,quando:m.quando,quandoTexto:m.quandoTexto,revisar:motivos.length>0,motivosRevisao:motivos};
 });
 if(participantes.length>2)avisos.push('Mais de dois participantes: parece uma conversa em grupo. Revise cada remetente.');
 if(!comData&&!semData)avisos.push('Não reconheci o formato do WhatsApp. O texto foi preservado como uma única mensagem de autor indefinido; separe manualmente.');
 if(!comData)avisos.push('A conversa não tem datas e horas: a ordem é a do texto colado, e as datas não serão inventadas.');
 if(ordemDuvidosa)avisos.push('Há datas fora de ordem. Confira se o formato é dia/mês/ano.');
 const precisaRevisao=mensagens.some(m=>m.revisar);
 return {mensagens,participantes,mapa,avisos,precisaRevisao,textoOriginal:original,formato:comData?'com-data':semData?'sem-data':'desconhecido'};
}
export function aplicarMapa(resultado,mapa){
 const msgs=resultado.mensagens.map(m=>{if(m.autor==='sistema'||!m.nomeOriginal)return m;const a=mapa[m.nomeOriginal]||m.autor;const mot=m.motivosRevisao.filter(x=>!/Não foi possível saber/.test(x));return {...m,autor:a,motivosRevisao:mot,revisar:mot.length>0||a==='indefinido'};});
 return {...resultado,mapa,mensagens:msgs,precisaRevisao:msgs.some(m=>m.revisar)};
}
export function salvarConversa(estado,empresa,resultado,{confirmado=false}={}){
 if(!confirmado)throw Error('Confirme que esta é a conversa real com a empresa antes de salvar.');
 if(resultado.mensagens.some(m=>m.autor==='indefinido'))throw Error('Ainda há mensagens com autor indefinido. Revise antes de salvar.');
 const c={id:novoId(),empresaId:empresa.id,mensagens:resultado.mensagens,textoOriginal:resultado.textoOriginal,importadaEm:new Date().toISOString(),origem:'colada',consolidada:false,formato:resultado.formato};
 estado.conversas.push(c);empresa.historico.push({quando:c.importadaEm,texto:`Conversa importada (${c.mensagens.length} mensagens).`});registrarAuditoria(estado,'conversa',c.id,'Conversa importada para '+empresa.nome);return c;
}
const chave=(m)=>(m.quando||'')+'|'+m.texto.trim().toLowerCase().slice(0,80);
export function consolidarConversa(estado,empresa,conversa,{confirmado=false}={}){
 if(!confirmado)throw Error('Confirme que estas mensagens realmente foram enviadas/recebidas.');
 const existentes=new Set(estado.eventos.filter(e=>e.empresaId===empresa.id&&['mensagem-enviada','resposta'].includes(e.tipo)).map(e=>(e.quando||'')+'|'+String(e.texto||'').trim().toLowerCase().slice(0,80)));
 let criados=0,duplicados=0,semData=0;
 for(const m of conversa.mensagens){if(m.autor==='sistema')continue;const k=chave(m);if(m.quando&&existentes.has(k)){duplicados++;continue;}
  const quando=m.quando||conversa.importadaEm;if(!m.quando)semData++;
  if(m.autor==='eu')registrarEvento(estado,empresa.id,'mensagem-enviada',{texto:m.texto,confirmadoPeloUsuario:true,origem:'conversa-colada',quandoEstimado:!m.quando,conversaId:conversa.id},quando);
  else if(m.autor==='cliente')registrarEvento(estado,empresa.id,'resposta',{texto:m.texto,interesse:'desconhecido',origem:'conversa-colada',quandoEstimado:!m.quando,conversaId:conversa.id},quando);
  existentes.add(k);criados++;}
 if(criados){const evs=estado.eventos.filter(e=>e.empresaId===empresa.id&&['mensagem-enviada','resposta'].includes(e.tipo)).sort((a,b)=>a.quando.localeCompare(b.quando));const ult=evs.at(-1);if(ult&&(!empresa.ultimoContato||ult.quando>empresa.ultimoContato))empresa.ultimoContato=ult.quando;if(!empresa.primeiroContato&&evs[0])empresa.primeiroContato=evs[0].quando;}
 conversa.consolidada=true;registrarAuditoria(estado,'conversa',conversa.id,`Consolidada: ${criados} evento(s), ${duplicados} duplicado(s) ignorado(s).`);
 return {criados,duplicados,semData};
}
