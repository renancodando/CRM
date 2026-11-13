/* Auditoria de privacidade e identificação do pacote ANTES de publicar uma demonstração. Nada aqui depende do DOM. */
import {validarExportacao} from '../../estudio/validacao-exportacao.js';
const segredos=[/ghp_[A-Za-z0-9]{20,}/,/github_pat_[A-Za-z0-9_]{20,}/,/sk-[A-Za-z0-9]{20,}/,/AKIA[0-9A-Z]{16}/,/-----BEGIN [A-Z ]*PRIVATE KEY-----/,/CLOUDFLARE_API_TOKEN|CLOUDFLARE_ACCOUNT_ID|RASTREIO_SECRET|SESSION_SECRET|GITHUB_APP_PRIVATE_KEY/,/(?:senha|password|token|secret)\s*[:=]\s*["'][^"']{6,}/i];
const rastroCRM=/orbita-prospeccao|orbita-banco|indexedDB|x-orbita-csrf|api\/connect|\/nucleo\/|\/modulos\/|\/estudio\//i;
const estrategia=/pre[cç]o m[ií]nimo|margem de lucro|margem desejada|estrat[eé]gia de negocia|custo interno|limite de desconto/i;
const digitos=v=>String(v||'').replace(/\D/g,'');
const textuais=a=>Object.entries(a).filter(([,c])=>typeof c==='string');
export function auditarPrivacidade(arquivos,{empresa=null,empresas=[],liberada=false,exigirAviso=true}={}){
 const itens=[],ok=t=>itens.push({nivel:'ok',texto:t}),erro=t=>itens.push({nivel:'erro',texto:t}),aviso=t=>itens.push({nivel:'aviso',texto:t});
 const base=validarExportacao(arquivos,{url:liberada?'https://definitivo.exemplo/':''});
 for(const i of base.itens){if(/vercel\.json/.test(i.texto))continue;if(/Arquivo esperado ausente: (vercel\.json|netlify\.toml|LEIA-ME\.md)/.test(i.texto))continue;if(/^(Se|URL informada)/.test(i.texto)||/canonical|indexa/i.test(i.texto))continue;itens.push(i);}
 const txt=textuais(arquivos);
 const achouSegredo=txt.filter(([,c])=>segredos.some(r=>r.test(c))).map(([n])=>n);achouSegredo.length?erro('Possível credencial ou variável secreta em: '+achouSegredo.join(', ')):ok('Nenhuma credencial encontrada.');
 const achouCRM=txt.filter(([n,c])=>!/^js\/orbita-rastreio\.js$/.test(n)&&rastroCRM.test(c)).map(([n])=>n);achouCRM.length?erro('Referências ao Órbita/CRM em: '+achouCRM.join(', ')):ok('Sem dependências ou referências ao CRM.');
 const est=txt.filter(([,c])=>estrategia.test(c)).map(([n])=>n);est.length?erro('Termos de estratégia comercial interna em: '+est.join(', ')):ok('Sem termos de estratégia de negociação interna.');
 if(empresa){
  const internos=[empresa.notas,empresa.proximaAcao,empresa.motivoPerda,empresa.condicoes,...(empresa.historico||[]).map(h=>h.texto)].map(x=>String(x||'').trim()).filter(x=>x.length>=12);
  const vazou=internos.filter(s=>txt.some(([,c])=>c.includes(s)));vazou.length?erro('Texto interno da ficha da empresa aparece no site ('+vazou.length+' trecho(s)). Remova notas, histórico e observações internas.'):ok('Notas e histórico internos não aparecem no site.');
  const outras=empresas.filter(e=>e.id!==empresa.id),alien=[];
  for(const e of outras){const ds=[digitos(e.whatsapp),digitos(e.telefone)].filter(d=>d.length>=10);const ext=[e.email,e.instagram].map(x=>String(x||'').toLowerCase()).filter(x=>x.length>=6);
   if(txt.some(([,c])=>{const dc=digitos(c);return ds.some(d=>dc.includes(d.slice(-10)));})||txt.some(([,c])=>ext.some(x=>c.toLowerCase().includes(x))))alien.push(e.nome);}
  alien.length?erro('Contato de OUTRA empresa do CRM aparece no site: '+alien.slice(0,3).join(', ')):ok('Nenhum contato de outras empresas.');
  const html=arquivos['index.html']||'',zap=digitos(empresa.whatsapp);
  if(zap){const ult=zap.slice(-9);digitos(html).includes(ult)||txt.some(([n,c])=>/configuracao\.js$/.test(n)&&digitos(c).includes(ult))?ok('WhatsApp público da empresa presente.'):aviso('O WhatsApp cadastrado na ficha não aparece no site. Confira os contatos públicos.');}
  else aviso('A empresa não tem WhatsApp cadastrado; o botão de contato pode não funcionar.');
  const nome=String(empresa.nome||'').trim();nome&&!(arquivos['index.html']||'').includes(nome.replace(/&/g,'&amp;'))?aviso('O nome da empresa não aparece literalmente em index.html. Confira se está correto.'):ok('Nome da empresa conferido.');
 }
 const html=arquivos['index.html']||'',robots=arquivos['robots.txt']||'';
 if(!liberada){/name="robots" content="noindex/i.test(html)?ok('Indexação desativada no HTML (noindex).'):erro('A demonstração precisa de noindex.');/Disallow:\s*\//.test(robots)?ok('robots.txt bloqueia a indexação.'):erro('robots.txt deve bloquear a indexação da demonstração.');}
 if(exigirAviso)/id="orbita-demo-aviso"/.test(html)?ok('Aviso discreto de demonstração não oficial presente.'):erro('Aviso de demonstração não oficial ausente.');
 const grandes=Object.entries(arquivos).filter(([,c])=>(typeof c==='string'?c.length:c.length)>25*1024*1024);grandes.length?erro('Arquivo acima de 25 MiB: '+grandes[0][0]):ok('Nenhum arquivo acima do limite de 25 MiB.');
 const n=Object.keys(arquivos).length;n>20000?erro('Mais de 20.000 arquivos.'):ok(n+' arquivo(s) no pacote.');
 return {itens,erros:itens.filter(i=>i.nivel==='erro').length,avisos:itens.filter(i=>i.nivel==='aviso').length};
}
