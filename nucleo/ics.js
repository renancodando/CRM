const esc=v=>String(v??'').replace(/\\/g,'\\\\').replace(/;/g,'\;').replace(/,/g,'\\,').replace(/\r?\n/g,'\\n');
const fmt=d=>new Date(d).toISOString().replace(/[-:]/g,'').replace(/\.\d{3}/,'');
function dobrar(linha){const partes=[];let l=linha;while(l.length>73){partes.push(l.slice(0,73));l=' '+l.slice(73);}partes.push(l);return partes.join('\r\n');}
export function gerarICS(lembretes,nomeEmpresa=()=>'' ){
 const linhas=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//renancodando//Orbita//PT','CALSCALE:GREGORIAN','METHOD:PUBLISH','X-WR-CALNAME:Órbita — Próximas ações'];
 for(const l of lembretes){if(!l?.quando||!Number.isFinite(new Date(l.quando).getTime()))continue;const inicio=new Date(l.quando),fim=new Date(inicio.getTime()+1800000),empresa=nomeEmpresa(l.empresa);
  linhas.push('BEGIN:VEVENT','UID:'+String(l.id).replace(/[^\w-]/g,'')+'@orbita.local','DTSTAMP:'+fmt(new Date()),'DTSTART:'+fmt(inicio),'DTEND:'+fmt(fim),'SUMMARY:'+esc(l.titulo),...(empresa?['DESCRIPTION:'+esc('Empresa: '+empresa)]:[]),'BEGIN:VALARM','ACTION:DISPLAY','DESCRIPTION:'+esc(l.titulo),'TRIGGER:-PT15M','END:VALARM','END:VEVENT');}
 linhas.push('END:VCALENDAR');return linhas.map(dobrar).join('\r\n')+'\r\n';
}
