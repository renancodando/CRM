/* Telefones, contatos por papel e links do WhatsApp. Estrutura válida NÃO é WhatsApp confirmado, e papel (ex.: proprietário) só existe com origem registrada. */
const DDDS=new Set('11 12 13 14 15 16 17 18 19 21 22 24 27 28 31 32 33 34 35 37 38 41 42 43 44 45 46 47 48 49 51 53 54 55 61 62 63 64 65 66 67 68 69 71 73 74 75 77 79 81 82 83 84 85 86 87 88 89 91 92 93 94 95 96 97 98 99'.split(' '));
export const PAPEIS=[['principal','Contato principal'],['proprietario','Proprietário'],['socio','Sócio'],['comercial','Responsável comercial'],['atendimento','Atendimento'],['outro','Outro contato verificado']];
const mascara=(ddd,n)=>`(${ddd}) ${n.length===9?n.slice(0,5)+'-'+n.slice(5):n.slice(0,4)+'-'+n.slice(4)}`;
export function normalizarTelefoneBR(bruto){
 const original=String(bruto??'').trim(),avisos=[];let d=original.replace(/\D/g,'');
 const inval=m=>({original,digitos:d,e164:'',ddd:'',tipo:'',estruturaValida:false,motivo:m,avisos,exibicao:original});
 if(!d)return inval('Número vazio.');
 if(d.startsWith('00'))d=d.slice(2);
 if(d.startsWith('55')&&d.length>=12&&d.length<=13)d=d.slice(2);
 else if(d.startsWith('0')&&(d.length===11||d.length===12))d=d.slice(1);
 if(d.length!==10&&d.length!==11)return inval('Quantidade de dígitos incompatível com número brasileiro com DDD (10 ou 11 dígitos).');
 const ddd=d.slice(0,2),n=d.slice(2);if(!DDDS.has(ddd))return inval('DDD inexistente: '+ddd+'.');
 if(/^(\d)\1+$/.test(n))return inval('Número com todos os dígitos iguais.');
 let tipo;
 if(n.length===9){if(n[0]!=='9')return inval('Celular com 9 dígitos deve começar com 9.');tipo='celular';}
 else if(/^[2-5]/.test(n)){tipo='fixo';avisos.push('Telefone fixo: confirme se a empresa atende por WhatsApp neste número.');}
 else if(/^[6-9]/.test(n)){tipo='celular-sem-nono-digito';avisos.push('Número de 8 dígitos começando com 6–9 pode ser um celular sem o nono dígito. O Órbita NÃO adiciona o 9 por conta própria: confira o número.');}
 else return inval('Número inválido.');
 return {original,digitos:d,e164:'55'+d,ddd,tipo,estruturaValida:tipo!=='celular-sem-nono-digito',motivo:tipo==='celular-sem-nono-digito'?'Possível celular sem o nono dígito: confira antes de usar.':'',avisos,exibicao:mascara(ddd,n)};
}
export function contatosDaEmpresa(empresa){
 const lista=[],vistos=new Set();
 const add=(c)=>{const norm=normalizarTelefoneBR(c.numero);const chave=norm.e164||('x'+c.numero);if(vistos.has(chave))return;vistos.add(chave);lista.push({id:c.id,papel:c.papel||'principal',rotulo:(PAPEIS.find(p=>p[0]===(c.papel||'principal'))||PAPEIS[0])[1],nome:c.nome||'',numero:c.numero,norm,origem:c.origem||'',verificado:!!c.verificado,whatsappConfirmado:!!c.whatsappConfirmado,canal:c.canal||'whatsapp'});};
 for(const c of Array.isArray(empresa.contatos)?empresa.contatos:[])if(c&&c.numero)add({...c,id:c.id||'c-'+String(c.numero).replace(/\D/g,'')});
 if(empresa.whatsapp)add({id:'ficha-whatsapp',papel:'principal',nome:empresa.contato||'',numero:empresa.whatsapp,origem:'ficha da empresa (WhatsApp)',verificado:!!empresa.verificadoEm,whatsappConfirmado:!!empresa.whatsappConfirmadoEm});
 if(empresa.telefone)add({id:'ficha-telefone',papel:'principal',nome:empresa.contato||'',numero:empresa.telefone,origem:'ficha da empresa (telefone)',verificado:!!empresa.verificadoEm,whatsappConfirmado:false});
 return lista;
}
export function adicionarContato(empresa,{papel='outro',nome='',numero,origem='',verificado=false}){
 if(!PAPEIS.some(p=>p[0]===papel))throw Error('Papel inválido.');const n=normalizarTelefoneBR(numero);if(!n.estruturaValida)throw Error(n.motivo||'Número inválido.');
 if(['proprietario','socio','comercial'].includes(papel)&&!String(origem).trim())throw Error('Informe a origem da informação (ex.: "ele mesmo me disse", "site da empresa") antes de classificar este contato como '+PAPEIS.find(p=>p[0]===papel)[1].toLowerCase()+'.');
 empresa.contatos??=[];if(empresa.contatos.some(c=>normalizarTelefoneBR(c.numero).e164===n.e164))throw Error('Este número já está cadastrado.');
 const c={id:'c-'+n.e164,papel,nome:String(nome).trim(),numero:n.exibicao,origem:String(origem).trim(),verificado:!!verificado,whatsappConfirmado:false,criadoEm:new Date().toISOString()};empresa.contatos.push(c);
 empresa.historico?.push({quando:c.criadoEm,texto:`Contato adicionado: ${nome||n.exibicao} (${PAPEIS.find(p=>p[0]===papel)[1]}).`});return c;
}
export function confirmarWhatsApp(empresa,e164,{origem='resposta recebida'}={}){
 const c=(empresa.contatos||[]).find(x=>normalizarTelefoneBR(x.numero).e164===e164);if(c){c.whatsappConfirmado=true;c.whatsappConfirmadoEm=new Date().toISOString();c.whatsappConfirmadoOrigem=origem;}
 const ficha=normalizarTelefoneBR(empresa.whatsapp).e164===e164;if(ficha)empresa.whatsappConfirmadoEm=new Date().toISOString();return !!(c||ficha);
}
export function linkWhatsAppDireto(e164,texto=''){
 if(!/^55\d{10,11}$/.test(String(e164||'')))return {url:'',erro:'Número sem estrutura brasileira válida.'};
 const t=String(texto).replace(/\r\n?/g,'\n'),cod=encodeURIComponent(t),url=`https://wa.me/${e164}${t?'?text='+cod:''}`;
 return {url,tamanho:url.length,aviso:url.length>1800?'O texto é longo: alguns aplicativos podem cortar o link. Prefira copiar e colar.':'',texto:t};
}
