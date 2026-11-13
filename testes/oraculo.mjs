import {createHash} from 'node:crypto';
import {writeFileSync,readFileSync,existsSync} from 'node:fs';
import {catalogo} from '../estudio/catalogo.js';
import {criarConfiguracao,gerarProjeto} from '../estudio/gerador.js';
const hash=t=>createHash('sha256').update(typeof t==='string'?t:JSON.stringify(t)).digest('hex').slice(0,16);
const saida={};
for(const m of catalogo){
 const p=await gerarProjeto(criarConfiguracao(m.id),{previa:true});
 saida[m.id]={preview:hash(p.preview),arquivos:Object.fromEntries(Object.entries(p.arquivos).map(([k,v])=>[k,hash(v)]))};
}
const alvo=process.argv[2];
if(alvo==='--gravar'){writeFileSync(new URL('./oraculo-referencia.json',import.meta.url),JSON.stringify(saida,null,1));console.log('referência gravada');}
else{
 const ref=JSON.parse(readFileSync(new URL('./oraculo-referencia.json',import.meta.url),'utf8'));let falhas=0;
 for(const id of Object.keys(ref)){if(JSON.stringify(ref[id])!==JSON.stringify(saida[id])){falhas++;console.log('DIFERENTE:',id);}}
 console.log(falhas?falhas+' modelos alterados':'OK — os nove modelos geram saída idêntica à referência');process.exit(falhas?1:0);
}
