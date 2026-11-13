import {sanitizarEd} from './composicao.js';
export const escapar=valor=>String(valor??'').replace(/[&<>"']/g,letra=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[letra]));
export function enderecoSeguro(valor){try{const url=new URL(String(valor||'').trim());return ['https:','http:'].includes(url.protocol)&&!url.username&&!url.password?url.href:'';}catch{return '';}}
export function telefonePublico(valor){const numero=String(valor||'').replace(/\D/g,'');if(/^(\d)\1+$/.test(numero))return '';if(numero.length===10||numero.length===11)return '55'+numero;return numero.startsWith('55')&&[12,13].includes(numero.length)?numero:'';}
export function logoSeguro(valor){
 const texto=String(valor||'').trim();if(!texto)return '';
 if(texto.length>40000||!/^<svg\b/i.test(texto)||/<!|<\?|&(?:#|[a-z])|javascript:|data:|https?:/i.test(texto.replace(/xmlns=["']http:\/\/www\.w3\.org\/2000\/svg["']/g,'')))return '';
 const tags=new Set(['svg','g','path','circle','ellipse','rect','line','polyline','polygon','defs','linearGradient','radialGradient','stop','title']);
 const atributos=new Set(['xmlns','viewBox','width','height','x','y','x1','x2','y1','y2','cx','cy','r','rx','ry','d','points','fill','fill-rule','stroke','stroke-width','stroke-linecap','stroke-linejoin','opacity','transform','id','offset','stop-color','stop-opacity','gradientTransform','gradientUnits','role','aria-label']);
 for(const tag of texto.matchAll(/<\/?([\w:-]+)([^<>]*?)\/?\s*>/g)){
  if(!tags.has(tag[1]))return '';
  const resto=tag[2].replace(/([\w:-]+)\s*=\s*(["'])(.*?)\2/g,(_,nome,aspas,conteudo)=>atributos.has(nome)&&!/[<>]/.test(conteudo)&&(!/url\(/i.test(conteudo)||/^url\(#[\w-]+\)$/.test(conteudo))?'':' INVALIDO ');
  if(resto.trim())return '';
 }
 return texto;
}
export const corSegura=(valor,padrao)=>/^#[0-9a-f]{6}$/i.test(String(valor))?valor:padrao;
export const jsonSeguro=valor=>JSON.stringify(valor).replace(/</g,'\\u003c').replace(/\u2028/g,'\\u2028').replace(/\u2029/g,'\\u2029');
export function configuracaoPublica(dados,modelo){
 const texto=chave=>String(dados?.[chave]||'').trim().slice(0,6000);
 const lista=(chave,campos)=>Array.isArray(dados?.[chave])?dados[chave].slice(0,30).map(item=>Object.fromEntries(campos.map(campo=>[campo,String(item[campo]||'').slice(0,1500)]))):[];
 return {modelo:modelo.id,nicho:modelo.nicho,nome:texto('nome'),logo:logoSeguro(dados?.logo),slogan:texto('slogan'),titulo:texto('titulo'),descricao:texto('descricao'),sobre:texto('sobre'),corPrimaria:corSegura(dados?.corPrimaria,modelo.cores[0]),corSecundaria:corSegura(dados?.corSecundaria,modelo.cores[1]),corDestaque:corSegura(dados?.corDestaque,modelo.cores[2]),whatsapp:texto('whatsapp'),telefone:texto('telefone'),email:texto('email'),instagram:enderecoSeguro(dados?.instagram),endereco:texto('endereco'),cidade:texto('cidade'),horario:texto('horario'),garantia:texto('garantia'),cro:texto('cro'),responsavel:texto('responsavel'),tituloSeo:texto('tituloSeo'),descricaoSeo:texto('descricaoSeo'),url:enderecoSeguro(dados?.url),servicos:lista('servicos',['nome','descricao','preco']),pacotes:lista('pacotes',['nome','descricao','preco']),diferenciais:Array.isArray(dados?.diferenciais)?dados.diferenciais.slice(0,12).map(item=>String(item).slice(0,300)):[],perguntas:lista('perguntas',['pergunta','resposta']),avaliacoes:lista('avaliacoes',['nome','texto']).filter((_,indice)=>dados.avaliacoes[indice].autorizada===true).map(item=>({...item,autorizada:true})),links:lista('links',['nome','url']).map(item=>({...item,url:enderecoSeguro(item.url)})).filter(item=>item.url),cta:texto('cta'),...(sanitizarEd(dados?.ed)?{ed:sanitizarEd(dados.ed)}:{})};
}
export function contraste(uma,outra){
 const luminancia=cor=>{const canais=cor.slice(1).match(/../g).map(valor=>parseInt(valor,16)/255).map(valor=>valor<=.04045?valor/12.92:((valor+.055)/1.055)**2.4);return canais[0]*.2126+canais[1]*.7152+canais[2]*.0722;};
 const a=luminancia(uma),b=luminancia(outra);return (Math.max(a,b)+.05)/(Math.min(a,b)+.05);
}
export function validarPublicacao(configuracao,confirmado){const erros=[];if(!configuracao.nome)erros.push('Informe o nome real da empresa.');if(!telefonePublico(configuracao.whatsapp))erros.push('Informe um WhatsApp válido, com DDD.');if(!configuracao.cidade)erros.push('Informe cidade e estado.');if(!configuracao.servicos.length)erros.push('Informe os serviços realmente oferecidos.');if(configuracao.nicho==='odontologia'&&(!configuracao.cro||!configuracao.responsavel))erros.push('Preencha CRO e responsável profissional da clínica.');if(contraste(configuracao.corPrimaria,configuracao.modelo==='impacto'?'#171b1f':'#ffffff')<4.5)erros.push('Ajuste a cor principal para garantir contraste legível nos botões.');if(contraste(configuracao.corSecundaria,'#ffffff')<4.5)erros.push('Ajuste a cor profunda para manter a leitura dos painéis e rodapé.');if(!confirmado)erros.push('Confirme que os dados são públicos, verdadeiros e autorizados.');return erros;}
