import {normalizarEmpresa} from './esquema.js';
import {encontrarDuplicidades} from './duplicidades.js';
export function lerCSV(texto){
 const t=String(texto||'').replace(/^\uFEFF/,'');const sep=(t.split('\n')[0].match(/;/g)||[]).length>(t.split('\n')[0].match(/,/g)||[]).length?';':(t.split('\n')[0].includes('\t')?'\t':',');
 const linhas=[];let campo='',linha=[],aspas=false;
 for(let i=0;i<t.length;i++){const c=t[i];
  if(aspas){if(c==='"'&&t[i+1]==='"'){campo+='"';i++;}else if(c==='"')aspas=false;else campo+=c;}
  else if(c==='"'&&!campo)aspas=true;else if(c===sep){linha.push(campo);campo='';}else if(c==='\n'||c==='\r'){if(c==='\r'&&t[i+1]==='\n')i++;linha.push(campo);campo='';if(linha.some(x=>x.trim()))linhas.push(linha);linha=[];}else campo+=c;}
 linha.push(campo);if(linha.some(x=>x.trim()))linhas.push(linha);return linhas;
}
const apelidos={nome:['nome','empresa','razao social','negocio'],cidade:['cidade','cidade/uf','municipio','cidade e estado'],contato:['contato','responsavel','proprietario','dono','pessoa'],whatsapp:['whatsapp','zap','celular'],telefone:['telefone','fone','tel'],email:['email','e-mail'],site:['site','website','url'],instagram:['instagram','insta'],nicho:['nicho','segmento','categoria'],endereco:['endereco','endereço'],notas:['notas','observacoes','observação','obs','anotacoes']};
const sem=v=>String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
export function mapearColunas(cabecalho){const m={};cabecalho.forEach((h,i)=>{const n=sem(h);for(const [campo,lista] of Object.entries(apelidos))if(lista.some(a=>sem(a)===n)&&!(campo in m))m[campo]=i;});return m;}
export function prepararLote(texto,estado,nichosValidos=[]){
 const linhas=lerCSV(texto);if(linhas.length<2)return {itens:[],erro:'Informe uma linha de cabeçalho e ao menos uma empresa.'};
 const mapa=mapearColunas(linhas[0]);if(!('nome' in mapa))return {itens:[],erro:'Não encontrei a coluna "nome" (ou "empresa") no cabeçalho.'};
 const itens=[],vistos=[];
 for(const [i,l] of linhas.slice(1).entries()){
  const cru=Object.fromEntries(Object.entries(mapa).map(([campo,col])=>[campo,String(l[col]||'').trim().slice(0,4000)]));
  const erros=[];if(!cru.nome)erros.push('Nome obrigatório.');if(!cru.cidade)erros.push('Cidade ausente.');
  if(cru.nicho){const alvo=nichosValidos.find(n=>sem(n.nome)===sem(cru.nicho)||n.id===sem(cru.nicho));cru.nicho=alvo?alvo.id:'';}
  if(cru.site&&!/^https?:\/\//i.test(cru.site))cru.site='https://'+cru.site;
  const empresa=normalizarEmpresa({...cru,fonte:'Importação em lote'});
  const dups=encontrarDuplicidades(empresa,[...estado.empresas,...vistos]);
  vistos.push(empresa);
  itens.push({linha:i+2,empresa,erros,duplicidades:dups.map(d=>({id:d.empresa.id,nome:d.empresa.nome,motivos:d.motivos,forca:d.forca,naPlanilha:!estado.empresas.includes(d.empresa)})),acao:erros.some(e=>e.startsWith('Nome'))?'ignorar':dups.length?'ignorar':'importar'});
 }
 return {itens,erro:''};
}
