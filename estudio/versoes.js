export async function hashConteudo(config){const texto=JSON.stringify(config,Object.keys(config).sort());try{const b=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(texto));return [...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('').slice(0,16);}catch{let h=2166136261;for(let i=0;i<texto.length;i++){h^=texto.charCodeAt(i);h=Math.imul(h,16777619);}return 'f'+(h>>>0).toString(16);}}
const rotulos={nome:'Nome',slogan:'Slogan',titulo:'Título',descricao:'Descrição',sobre:'Sobre',cta:'Texto dos botões',logo:'Logotipo',corPrimaria:'Cor principal',corSecundaria:'Cor profunda',corDestaque:'Cor de destaque',whatsapp:'WhatsApp',telefone:'Telefone',email:'E-mail',instagram:'Instagram',endereco:'Endereço',cidade:'Cidade',horario:'Horários',garantia:'Garantia',cro:'CRO',responsavel:'Responsável',tituloSeo:'Título SEO',descricaoSeo:'Descrição SEO',url:'URL definitiva',servicos:'Serviços',pacotes:'Pacotes',diferenciais:'Diferenciais',perguntas:'Perguntas',avaliacoes:'Avaliações',links:'Links',ed:'Edição visual',modelo:'Modelo'};
export function diferencas(a,b){const r=[];for(const k of new Set([...Object.keys(a||{}),...Object.keys(b||{})])){if(JSON.stringify(a?.[k])!==JSON.stringify(b?.[k]))r.push({campo:k,rotulo:rotulos[k]||k,antes:a?.[k],depois:b?.[k]});}return r;}
export const resumirValor=v=>v==null||v===''?'(vazio)':typeof v==='string'?(v.length>70?v.slice(0,70)+'…':v):Array.isArray(v)?v.length+' item(ns)':'edição visual';
export function criarHistoricoEdicao(limite=80){
 const pilha=[],estado={i:-1};
 return {
  iniciar(cfg){pilha.length=0;pilha.push({cfg:JSON.stringify(cfg),quando:Date.now(),rotulo:'Início da edição'});estado.i=0;},
  registrar(cfg,rotulo=''){const s=JSON.stringify(cfg);if(pilha[estado.i]?.cfg===s)return false;pilha.length=estado.i+1;pilha.push({cfg:s,quando:Date.now(),rotulo});if(pilha.length>limite){pilha.shift();}estado.i=pilha.length-1;return true;},
  podeDesfazer:()=>estado.i>0,podeRefazer:()=>estado.i<pilha.length-1,
  desfazer(){if(estado.i>0){estado.i--;return JSON.parse(pilha[estado.i].cfg);}return null;},
  refazer(){if(estado.i<pilha.length-1){estado.i++;return JSON.parse(pilha[estado.i].cfg);}return null;},
  ir(i){if(i>=0&&i<pilha.length){estado.i=i;return JSON.parse(pilha[i].cfg);}return null;},
  lista:()=>pilha.map((p,i)=>({i,quando:p.quando,rotulo:p.rotulo,atual:i===estado.i}))
 };
}
export async function criarVersao(projeto,config,{rotulo='',origem='manual'}={}){
 const hash=await hashConteudo(config);projeto.versoes??=[];const ultima=projeto.versoes.at(-1);
 if(ultima&&ultima.hash===hash)return ultima;
 const v={id:crypto.randomUUID(),numero:(ultima?.numero||0)+1,criadaEm:new Date().toISOString(),rotulo:rotulo||('Versão '+((ultima?.numero||0)+1)),origem,hash,configuracao:structuredClone(config),modeloId:config.modelo};
 projeto.versoes.push(v);projeto.versaoAtual=v.numero;return v;
}
export const versaoApresentada=(projeto,versaoId)=>(projeto.apresentacoes||[]).some(a=>a.versaoId===versaoId);
export function normalizarProjeto(projeto){
 projeto.nome??=(projeto.configuracao?.nome||'Demonstração');projeto.versoes??=[];projeto.apresentacoes??=[];projeto.historicoExportacoes??=[];projeto.status??='rascunho';
 return projeto;
}
