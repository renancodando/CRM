export const POSICOES_PINOS=Object.freeze([
 [-3.15,-.3],[-2.4,-.7],[-1.1,.6],[.7,.6],[3.2,-.3],[2.35,-1.35],[1.3,-1.45],[-2.,-1.3],[-3.7,-.9]
].map(p=>Object.freeze(p)));

export function selecionarMarcadores(empresas=[]){
 const ids=new Set(),selecionadas=[];
 for(const empresa of empresas){
  if(!empresa?.id)continue;
  const id=String(empresa.id);if(ids.has(id))continue;ids.add(id);
  selecionadas.push({id,nome:String(empresa.nome||'Empresa sem nome'),etapa:String(empresa.etapa||''),posicao:POSICOES_PINOS[selecionadas.length]});
  if(selecionadas.length===POSICOES_PINOS.length)break;
 }
 return selecionadas;
}

export function criarMarcadores(alvo,{destacar=()=>{}}={}){
 const botoes=new Map(),abortar=new AbortController(),eventos={signal:abortar.signal};
 let sequencia=0;
 const obter=e=>e.target.closest('[data-pr-pino]');
 const revelar=botao=>{
  if(!botao)return;
  botao.classList.remove('pr-pino-dispensado');botao.querySelector('[role="tooltip"]').setAttribute('aria-hidden','false');destacar(botao.dataset.empresa);
 };
 const recolher=botao=>{
  if(!botao)return;
  botao.querySelector('[role="tooltip"]').setAttribute('aria-hidden','true');destacar('');
 };
 alvo.addEventListener('pointerover',e=>revelar(obter(e)),eventos);
 alvo.addEventListener('pointerout',e=>{const b=obter(e);if(b&&!b.contains(e.relatedTarget)&&document.activeElement!==b)recolher(b);},eventos);
 alvo.addEventListener('focusin',e=>revelar(obter(e)),eventos);
 alvo.addEventListener('focusout',e=>{const b=obter(e);if(b&&!b.contains(e.relatedTarget))recolher(b);},eventos);
 alvo.addEventListener('keydown',e=>{if(e.key!=='Escape')return;const b=obter(e);if(b){b.classList.add('pr-pino-dispensado');recolher(b);}},eventos);
 function atualizar(empresas,etapas=[]){
  const itens=selecionarMarcadores(empresas),etapasPorId=new Map(etapas.map(e=>[e.id,e.nome])),ids=new Set(itens.map(e=>e.id));
  for(const [id,b]of botoes)if(!ids.has(id)){if(document.activeElement===b)destacar('');b.remove();botoes.delete(id);}
  alvo.hidden=!itens.length;
  for(const empresa of itens){
   let b=botoes.get(empresa.id);
   if(!b){
    b=document.createElement('button');b.type='button';b.className='pr-pino-empresa';b.dataset.prPino='';b.dataset.empresa=empresa.id;
    const icone=document.createElement('span');icone.className='pr-pino-alvo';icone.setAttribute('aria-hidden','true');
    const dica=document.createElement('span');dica.className='pr-pino-info';dica.id='pr-pino-info-'+(++sequencia);dica.setAttribute('role','tooltip');dica.setAttribute('aria-hidden','true');dica.append(document.createElement('strong'),document.createElement('small'));
    b.setAttribute('aria-describedby',dica.id);b.append(icone,dica);botoes.set(empresa.id,b);alvo.append(b);
   }
   const etapa=etapasPorId.get(empresa.etapa)||'Etapa não informada';
   b.setAttribute('aria-label',empresa.nome+' · '+etapa+'. Abrir empresa.');
   b.querySelector('strong').textContent=empresa.nome;b.querySelector('small').textContent=etapa;
   b.dataset.alinhamento=empresa.posicao[0]<-2?'inicio':empresa.posicao[0]>2?'fim':'centro';
   if(!b.dataset.projetado){b.style.left=(empresa.posicao[0]/9.6+.5)*100+'%';b.style.top=(.5-(empresa.posicao[1]+.16)/5.3)*100+'%';}
  }
 }
 function posicionar(pontos){
  for(const ponto of pontos){
   const b=botoes.get(ponto.id);if(!b)continue;
   const transformacao=`translate3d(${ponto.x.toFixed(2)}px,${ponto.y.toFixed(2)}px,0) translate(-50%,-65%)`;
   if(b.style.transform===transformacao)continue;
   b.dataset.projetado='true';b.style.left='0';b.style.top='0';b.style.transform=transformacao;
  }
 }
 return{atualizar,posicionar,destruir(){abortar.abort();botoes.clear();}};
}
