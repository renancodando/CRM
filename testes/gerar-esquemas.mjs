import {writeFileSync,readFileSync,existsSync} from 'node:fs';
import {todosEsquemas,operacoes,VERSAO_PROTOCOLO} from '../nucleo/connect/protocolo.js';
const modo=process.argv[2];const e=todosEsquemas();let dif=0;
for(const [tipo,esq] of Object.entries(e)){const f=new URL(`../esquemas/${tipo}.schema.json`,import.meta.url),txt=JSON.stringify(esq,null,1)+'\n';if(modo==='--conferir'){if(!existsSync(f)||readFileSync(f,'utf8')!==txt){dif++;console.log('DESATUALIZADO:',tipo);}}else writeFileSync(f,txt);}
const indice={protocolo:VERSAO_PROTOCOLO,operacoes:Object.fromEntries(Object.entries(operacoes).map(([k,v])=>[k,{rotulo:v.rotulo,categoria:v.categoria,sensivel:v.sensivel,esquema:`esquemas/${k}.schema.json`}]))};
const fi=new URL('../esquemas/indice.json',import.meta.url),ti=JSON.stringify(indice,null,1)+'\n';if(modo==='--conferir'){if(readFileSync(fi,'utf8')!==ti){dif++;console.log('DESATUALIZADO: indice');}console.log(dif?dif+' esquemas desatualizados':'esquemas JSON em dia com o protocolo');process.exit(dif?1:0);}else{writeFileSync(fi,ti);console.log(Object.keys(e).length+' esquemas gerados');}
