import {mkdirSync,rmSync,writeFileSync,readFileSync} from 'node:fs';
import {catalogo} from '../estudio/catalogo.js';
import {criarConfiguracao,gerarProjeto} from '../estudio/gerador.js';
import {criarZip} from '../estudio/zip.js';
import {validarExportacao} from '../estudio/validacao-exportacao.js';
import {predefinicoes} from '../estudio/composicao.js';
import {sugerirTextos,aplicarSugestoes} from '../estudio/textos.js';
import {normalizarEmpresa} from '../nucleo/esquema.js';
const saida=process.argv[2];if(!saida){console.error('uso: node exportacao.mjs <diretorio>');process.exit(2);}
rmSync(saida,{recursive:true,force:true});mkdirSync(saida,{recursive:true});
const segredos=['SEGREDO-NOTA','SEGREDO-OBJECAO','SEGREDO-NECESSIDADE','SEGREDO-VALOR-777','SEGREDO-TOKEN','SEGREDO-CONVERSA'];
let falhas=0;const log=(ok,m)=>{console.log((ok?'✔ ':'✘ ')+m);if(!ok)falhas++;};
const matriz=[['padrao',null],['modular',{modo:'modular',ordem:['hero','servicos','pacotes','extras','processo','faq','sobre','avaliacoes','faixa','contato'],ocultas:['sobre'],variantes:{servicos:'lista',faq:'duas-colunas'},espaco:{secao:'amplo'}}],['sem3d',predefinicoes.tradicional.ed]];
for(const m of catalogo){
 for(const [nomeVar,ed] of matriz){
  const empresa=normalizarEmpresa({nome:'Empresa '+m.nome,cidade:'Recife - PE',nicho:m.nicho,whatsapp:'81999990001',cro:'CRO-PE 1234',responsavel:'Dra. Teste',diferenciais:['Qualidade','Confiança','Bom atendimento'],servicosOferecidos:['Serviço um','Serviço dois'],notas:segredos[0],objecoes:[segredos[1]],necessidades:[segredos[2]],valorNegociado:777,historico:[{quando:'2026-01-01',texto:segredos[5]}]});
  const c=criarConfiguracao(m.id,empresa);aplicarSugestoes(c,sugerirTextos(empresa,m.id,1));
  // dados privados "vazando" para a configuração (tentativa de contaminação)
  Object.assign(c,{notas:segredos[0],objecoes:segredos[1],valorNegociado:segredos[3],token:segredos[4],historico:segredos[5]});if(ed)c.ed=structuredClone(ed);
  const p=await gerarProjeto(c,{confirmado:true});
  const alltext=Object.values(p.arquivos).join('\n');
  log(!segredos.some(s=>alltext.includes(s)),`${m.id}/${nomeVar}: nenhum dado privado do CRM no pacote`);
  const rel=validarExportacao(p.arquivos);log(rel.erros===0,`${m.id}/${nomeVar}: validação do pacote (${rel.erros} erros)`);
  if(nomeVar==='sem3d')log(!p.arquivos['js/motor.js']&&!p.arquivos['LICENCA-THREE.txt'],`${m.id}/sem3d: arquivos 3D omitidos`);
  const dir=`${saida}/${m.id}-${nomeVar}`;mkdirSync(dir,{recursive:true});
  const blob=criarZip(p.arquivos);writeFileSync(dir+'.zip',Buffer.from(await blob.arrayBuffer()));
 }
}
console.log(falhas?falhas+' falhas':'exportação: todas as verificações passaram');process.exit(falhas?1:0);
