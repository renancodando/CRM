/* Composição textual determinística a partir da ficha comercial. Só usa dados informados; nunca inventa preços, avaliações, garantias, registros ou experiência. */
import {conteudos,catalogo} from './catalogo.js';
const maius=s=>s?s.charAt(0).toUpperCase()+s.slice(1):s;
const minus=s=>s?s.charAt(0).toLowerCase()+s.slice(1):s;
const juntar=l=>l.length<=1?(l[0]||''):l.slice(0,-1).join(', ')+' e '+l.at(-1);
const limpo=l=>[...new Set((l||[]).map(x=>String(x).trim().replace(/[.;]+$/,'')).filter(Boolean))];
const rotulosNicho={celulares:{negocio:'assistência técnica',alvo:'seu aparelho',verbo:'cuidar do seu celular'},odontologia:{negocio:'clínica odontológica',alvo:'seu sorriso',verbo:'cuidar da sua saúde bucal'},automotivo:{negocio:'estética automotiva',alvo:'seu veículo',verbo:'cuidar do seu carro'}};
export function termosPublicos(empresa){
 return {nome:empresa.nome,cidade:(empresa.cidade||'').trim(),diferenciais:limpo(empresa.diferenciais).slice(0,6),servicos:limpo(empresa.servicosOferecidos).slice(0,12),whatsapp:empresa.whatsapp||empresa.telefone||'',telefone:empresa.telefone||'',email:empresa.email||'',instagram:empresa.instagram||'',endereco:empresa.endereco||'',horario:empresa.horario||'',cro:empresa.cro||'',responsavel:empresa.responsavel||''};
}
const variacoesDescricao=[
 (t,n)=>t.diferenciais.length?`Na ${t.nome}, ${juntar(t.diferenciais.slice(0,3).map(minus))} fazem parte do atendimento. Converse com a equipe e saiba como ${n.verbo}.`:'',
 (t,n)=>t.diferenciais.length?`${maius(juntar(t.diferenciais.slice(0,3).map(minus)))}: é assim que a ${t.nome} trata ${n.alvo}${t.cidade?', em '+t.cidade:''}. Fale com a equipe para entender o atendimento.`:'',
 (t,n)=>t.diferenciais.length?`Se você busca ${juntar(t.diferenciais.slice(0,2).map(minus))}, a ${t.nome} está pronta para ${n.verbo}. Chame a equipe e conheça o atendimento.`:''
];
const variacoesSobre=[
 (t,n)=>`A ${t.nome} é uma ${n.negocio}${t.cidade?' em '+t.cidade:''}.${t.diferenciais.length?` Entre os pontos que a equipe destaca estão ${juntar(t.diferenciais.slice(0,4).map(minus))}.`:''}${t.servicos.length?` O atendimento inclui ${juntar(t.servicos.slice(0,4).map(minus))}.`:''}`,
 (t,n)=>`${t.nome}${t.cidade?' · '+t.cidade:''}. ${t.diferenciais.length?`${maius(juntar(t.diferenciais.slice(0,3).map(minus)))} orientam o trabalho da equipe.`:'Conheça o trabalho da equipe.'}${t.servicos.length?` Serviços: ${juntar(t.servicos.slice(0,5).map(minus))}.`:''}`,
 (t,n)=>`Conheça a ${t.nome}.${t.diferenciais.length?` A equipe destaca ${juntar(t.diferenciais.slice(0,3).map(minus))} no atendimento.`:''}${t.cidade?' Atendimento em '+t.cidade+'.':''}`
];
const variacoesCta={celulares:['Solicitar orçamento','Falar com a equipe','Chamar no WhatsApp'],odontologia:['Solicitar agendamento','Falar com a clínica','Chamar no WhatsApp'],automotivo:['Consultar horários','Falar com a equipe','Chamar no WhatsApp']};
const descServico={celulares:[[/tela|display|vidro/i,'Avaliação do conjunto de tela e das opções adequadas ao seu aparelho.'],[/bateria/i,'Verificação da bateria e orientação sobre a substituição.'],[/placa|solda|curto/i,'Análise técnica de falhas e possibilidades de reparo.'],[/conector|carga|limpeza/i,'Cuidados com conectores, componentes e limpeza técnica.']],odontologia:[[/limpeza|preven|profilax/i,'Orientações e cuidados voltados à manutenção da saúde bucal.'],[/avalia|consulta|check/i,'Conversa inicial e avaliação individual das necessidades do paciente.'],[/restaura|canal|obtura/i,'Planejamento de cuidados conforme a avaliação profissional.'],[/estet|clareamento|lente|faceta/i,'Conheça as possibilidades e suas indicações em uma avaliação.']],automotivo:[[/lavagem|lav/i,'Cuidados com as superfícies externas e o acabamento do veículo.'],[/higien|interna/i,'Avaliação das necessidades de limpeza dos tecidos e superfícies internas.'],[/polimento|polir/i,'Análise da pintura e orientação sobre as opções de acabamento.'],[/prote|vitrifica|cristal|cerâmica|ceramica/i,'Conheça os cuidados e as opções indicadas para o seu veículo.']]};
export function descricaoDoServico(nome,nicho){const regra=(descServico[nicho]||[]).find(([r])=>r.test(nome));return regra?regra[1]:`Converse com a equipe para saber como funciona ${minus(nome)}.`;}
export function sugerirTextos(empresa,modeloId,variacao=0){
 const modelo=catalogo.find(m=>m.id===modeloId)||catalogo[0],n=rotulosNicho[modelo.nicho],t=termosPublicos(empresa),base=conteudos[modelo.nicho],v=((variacao%3)+3)%3,sugestoes=[];
 const add=(campo,rotulo,valor,fonte)=>{if(valor!==undefined&&valor!==''&&!(Array.isArray(valor)&&!valor.length))sugestoes.push({campo,rotulo,valor,fonte});};
 add('nome','Nome público',t.nome,'Nome da empresa');
 add('cidade','Cidade e estado',t.cidade,'Ficha');add('whatsapp','WhatsApp público',t.whatsapp,'Ficha');add('telefone','Telefone público',t.telefone,'Ficha');add('email','E-mail público',t.email,'Ficha');add('instagram','Instagram',t.instagram&&/^https?:/.test(t.instagram)?t.instagram:t.instagram?'https://instagram.com/'+t.instagram.replace(/^@/,''):'','Ficha');add('endereco','Endereço',t.endereco,'Ficha');add('horario','Horários',t.horario,'Ficha');
 if(modelo.nicho==='odontologia'){add('cro','CRO e UF',t.cro,'Ficha (verifique)');add('responsavel','Responsável técnico',t.responsavel,'Ficha (verifique)');}
 const desc=variacoesDescricao[v](t,n);if(desc)add('descricao','Descrição de apresentação',desc,'Diferenciais informados');
 if(t.diferenciais.length||t.servicos.length)add('sobre','Sobre a empresa',variacoesSobre[v](t,n),'Diferenciais, serviços e cidade informados');
 add('cta','Texto dos botões',variacoesCta[modelo.nicho][v],'Variação por nicho');
 if(t.diferenciais.length)add('diferenciais','Diferenciais',t.diferenciais.map(maius),'Diferenciais informados');
 if(t.servicos.length)add('servicos','Serviços',t.servicos.map(nome=>({nome:maius(nome),descricao:descricaoDoServico(nome,modelo.nicho),preco:''})),'Serviços informados (descrições padrão do nicho; sem preços)');
 add('tituloSeo','Título SEO',[t.nome,t.servicos[0]?maius(t.servicos[0]):maius(n.negocio),t.cidade].filter(Boolean).join(' — '),'Nome, serviço e cidade');
 const seo=(t.diferenciais.length?`${t.nome}${t.cidade?' em '+t.cidade:''}: ${juntar(t.diferenciais.slice(0,3).map(minus))}. Fale com a equipe.`:'');if(seo)add('descricaoSeo','Descrição SEO',seo.slice(0,160),'Diferenciais informados');
 return sugestoes;
}
export function aplicarSugestoes(configuracao,sugestoes){for(const s of sugestoes)configuracao[s.campo]=typeof s.valor==='object'?structuredClone(s.valor):s.valor;return configuracao;}
