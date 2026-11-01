(()=>{
const KEY='aryes-demo-v2',$=s=>document.querySelector(s);
const ld=()=>{try{return JSON.parse(localStorage.getItem(KEY))||{}}catch{return{}}};
const dayOf=t=>new Date(t).toLocaleDateString('sv-SE');
const pairs=marks=>{const o=[],byE={};marks.forEach(m=>(byE[m.employeeId]??=[]).push(m));for(const l of Object.values(byE)){l.sort((a,b)=>a.timestamp.localeCompare(b.timestamp));for(let i=0;i<l.length-1;i++)if(l[i].kind==='IN'&&l[i+1].kind==='OUT'){const h=(new Date(l[i+1].timestamp)-new Date(l[i].timestamp))/36e5;if(h>0&&h<24)o.push({e:l[i].employeeId,inM:l[i],day:dayOf(l[i].timestamp),h});i++}}return o};
const tag=(s,t='')=>`<span class="tag ${t}">${s}</span>`;
// Modo oscuro
const setTheme=d=>{document.documentElement.classList.toggle('dark',d);try{localStorage.setItem('aryes-theme',d?'d':'l')}catch{}};
setTheme(localStorage.getItem('aryes-theme')==='d');
$('#themeBtn').onclick=()=>setTheme(!document.documentElement.classList.contains('dark'));
function download(name,text,type){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([text],{type}));a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),2000)}
function demoData(){
 const c=document.createElement('canvas');c.width=c.height=120;const x=c.getContext('2d');x.fillStyle='#cfd9ea';x.fillRect(0,0,120,120);x.fillStyle='#7b8ca4';x.beginPath();x.arc(60,48,22,0,7);x.fill();x.fillRect(25,80,70,40);const photo=c.toDataURL('image/jpeg',.6);
 const names=[['María González','Cajera','Ventas',3200000],['Carlos Benítez','Depósito','Logística',3500000],['Lucía Ferreira','Administrativa','Administración',4200000],['Diego Acosta','Vendedor','Ventas',3000000],['Ana Villalba','Supervisora','Ventas',5500000]];
 const d={settings:{company:'ARYES · DEMO LOCAL',currency:'PYG',lat:-25.2867,lng:-57.647,radiusMeters:150,monthlyHours:208,overtimeFactor:1.5,ipsEmployeePercent:9},employees:[],shifts:[],marks:[],leaves:[]};
 const id=()=>crypto.randomUUID(),p=n=>String(n).padStart(2,'0');
 names.forEach(([name,role,sector,salary],i)=>d.employees.push({id:id(),name,document:String(4100000+i*37211),role,sector,salary,active:true,createdAt:new Date().toISOString()}));
 for(let k=9;k>=0;k--){const dt=new Date();dt.setDate(dt.getDate()-k);if(dt.getDay()===0)continue;const ds=dt.toLocaleDateString('sv-SE');
  d.employees.forEach((e,i)=>{if(k===3&&i===3)return;d.shifts.push({id:id(),employeeId:e.id,date:ds,start:'07:00',end:'16:00',breakMinutes:60});
   const late=Math.random()<.25?5+Math.floor(Math.random()*25):Math.floor(Math.random()*4),extra=Math.random()<.3?Math.floor(Math.random()*90):0;
   const a=new Date(dt);a.setHours(7,late,0,0);const b=new Date(dt);b.setHours(16,extra,0,0);if(k===0&&b>new Date())return d.marks.push({id:id(),employeeId:e.id,kind:'IN',timestamp:(a<new Date()?a:new Date()).toISOString(),lat:-25.2867,lng:-57.647,accuracy:12,distanceMeters:8,status:'EN_ZONA',photo});
   [['IN',a],['OUT',b]].forEach(([kind,t])=>d.marks.push({id:id(),employeeId:e.id,kind,timestamp:t.toISOString(),lat:-25.2867,lng:-57.647,accuracy:12,distanceMeters:Math.round(Math.random()*40),status:'EN_ZONA',photo}))})}
 const t=new Date(),f=new Date(t);f.setDate(t.getDate()+2);d.leaves.push({id:id(),employeeId:d.employees[3].id,type:'Reposo médico',from:t.toLocaleDateString('sv-SE'),to:f.toLocaleDateString('sv-SE'),notes:'Certificado presentado',status:'Registrada'});
 localStorage.setItem(KEY,JSON.stringify(d));location.reload()}
window.afterRender=(view,st)=>{
 const c=$('#content');
 if(view==='dashboard'){
  const pr=pairs(st.marks),days=[];for(let k=6;k>=0;k--){const dt=new Date();dt.setDate(dt.getDate()-k);days.push(dt.toLocaleDateString('sv-SE'))}
  const tot=days.map(d=>pr.filter(p=>p.day===d).reduce((s,p)=>s+p.h,0)),max=Math.max(1,...tot);
  const t=days[6],onL=(st.leaves||[]).filter(l=>l.from<=t&&l.to>=t),
  late=pr.filter(p=>p.day===t).length;
  c.insertAdjacentHTML('beforeend',`<div class="two"><section class="panel"><h2>Horas trabajadas · últimos 7 días</h2><div class="bars">${tot.map((h,i)=>`<div><b>${h?h.toFixed(0)+' h':''}</b><i style="height:${h/max*100}%"></i>${new Date(days[i]+'T12:00').toLocaleDateString('es-PY',{weekday:'short'})}</div>`).join('')}</div></section><section class="panel"><h2>En permiso / ausentes hoy</h2>${onL.length?onL.map(l=>`<div class="listline"><span>${aryes.esc(st.employees.find(e=>e.id===l.employeeId)?.name||'—')}</span>${tag(aryes.esc(l.type),'warn')}</div>`).join(''):'<p class="muted">Nadie registrado en ausencia hoy.</p>'}</section></div>`);
 }
 if(view==='employees'){
  c.querySelector('.heading').insertAdjacentHTML('afterend','<input class="input search" id="q" placeholder="🔍 Buscar por nombre, cargo, sector o documento">');
  $('#q').oninput=e=>{const q=e.target.value.toLowerCase();c.querySelectorAll('tbody tr').forEach(r=>r.hidden=!r.textContent.toLowerCase().includes(q))}
 }
 if(view==='reports'){
  const m=window.reportMonth||new Date().toLocaleDateString('sv-SE').slice(0,7),pr=pairs(st.marks.filter(x=>dayOf(x.timestamp).startsWith(m)));
  const rows=pr.map(p=>{const s=st.shifts.find(s=>s.employeeId===p.e&&s.date===p.day);if(!s)return null;const t=new Date(p.inM.timestamp),mins=Math.round(t.getHours()*60+t.getMinutes()-(+s.start.slice(0,2)*60+ +s.start.slice(3)));return mins>5?{n:st.employees.find(e=>e.id===p.e)?.name||'',d:p.day,mins}:null}).filter(Boolean);
  const sum={};rows.forEach(r=>{(sum[r.n]??={n:r.n,c:0,m:0}).c++;sum[r.n].m+=r.mins});
  const list=Object.values(sum).sort((a,b)=>b.m-a.m);
  c.insertAdjacentHTML('beforeend',`<section class="panel"><h2>Tardanzas del mes (más de 5 min)</h2>${list.length?`<div class="tablewrap"><table class="table"><thead><tr><th>Funcionario</th><th>Veces</th><th>Minutos acumulados</th></tr></thead><tbody>${list.map(r=>`<tr><td>${aryes.esc(r.n)}</td><td>${r.c}</td><td>${tag(r.m+' min',r.m>60?'bad':'warn')}</td></tr>`).join('')}</tbody></table></div><div class="toolbar" style="margin-top:12px"><button class="ghost" id="tardCsv">↧ Descargar tardanzas CSV</button></div>`:'<p class="muted">Sin tardanzas (requiere turnos cargados).</p>'}</section>`);
  const b=$('#tardCsv');if(b)b.onclick=()=>download('tardanzas-'+m+'.csv','\ufeff'+[['Funcionario','Fecha','Minutos tarde'],...rows.map(r=>[r.n,r.d,r.mins])].map(r=>r.map(v=>'"'+String(v).replaceAll('"','""')+'"').join(';')).join('\r\n'),'text/csv')
 }
 if(view==='settings'){
  c.insertAdjacentHTML('beforeend',`<section class="panel" style="max-width:850px"><h2>Datos y copias de seguridad</h2><p>Los datos viven solo en este navegador. Descargá una copia para no perderlos o pasarlos a otro dispositivo.</p><div class="steps"><button class="ghost" id="bkExp">↧ Exportar copia (JSON)</button><label class="ghost" style="cursor:pointer">↑ Importar copia<input id="bkImp" type="file" accept="application/json" style="display:none"></label><button class="ghost" id="bkDemo">✨ Cargar datos de ejemplo</button><button class="ghost" id="bkReset" style="color:#e33b62">🗑 Borrar todo</button></div></section>`);
  if(window.aryesCloud)['#bkImp','#bkDemo','#bkReset'].forEach(s=>{const n=$(s);(n.closest('label')||n).remove()});
  $('#bkExp').onclick=()=>download('aryes-copia-'+new Date().toLocaleDateString('sv-SE')+'.json',JSON.stringify(window.aryesCloud?st:JSON.parse(localStorage.getItem(KEY)||'{}')),'application/json');
  $('#bkImp').onchange=async e=>{try{const d=JSON.parse(await e.target.files[0].text());if(!Array.isArray(d.employees)||!d.settings)throw 0;if(!confirm('Esto reemplaza los datos actuales. ¿Continuar?'))return;localStorage.setItem(KEY,JSON.stringify(d));location.reload()}catch{aryes.notify('Archivo de copia inválido')}};
  $('#bkDemo').onclick=()=>{if(confirm('Se reemplazarán los datos actuales por datos de ejemplo. ¿Continuar?'))demoData()};
  $('#bkReset').onclick=()=>{if(confirm('¿Borrar TODOS los datos de este navegador?')){localStorage.removeItem(KEY);location.reload()}}
 }
};
})();

// ===== Obras, asignaciones e IPS/MJT/Banco =====
(()=>{
const $=s=>document.querySelector(s),KEY='aryes-demo-v2',DAYS=['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'],E=s=>aryes.esc(s);
const ld=()=>{try{return JSON.parse(localStorage.getItem(KEY))||{}}catch{return{}}};
const mut=fn=>{const d=ld();fn(d);localStorage.setItem(KEY,JSON.stringify(d))};
const csv=(name,rows)=>{const a=document.createElement('a');a.href=URL.createObjectURL(new Blob(['\ufeff'+rows.map(r=>r.map(v=>'"'+String(v??'').replaceAll('"','""')+'"').join(';')).join('\r\n')],{type:'text/csv;charset=utf-8'}));a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),2000)};
const tbl=(h,r)=>`<div class="panel tablewrap">${r.length?`<table class="table"><thead><tr>${h.map(x=>`<th>${x}</th>`).join('')}</tr></thead><tbody>${r.join('')}</tbody></table>`:'<div class="empty">Sin datos todavía</div>'}</div>`;
const head=(t,p,b='')=>`<div class="heading"><div><h1>${t}</h1><p>${p}</p></div><div class="steps" style="margin:0">${b}</div></div>`;
const today=()=>new Date().toLocaleDateString('sv-SE'),mon=()=>today().slice(0,7);
const emp=id=>aryes.state().employees.find(e=>e.id===id)?.name||'—';
const dayTxt=a=>[1,2,3,4,5,6,0].filter(d=>a.days.includes(d)).map(d=>DAYS[d]).join(' · ');
const active=a=>(!a.from||a.from<=today())&&(!a.to||a.to>=today());
window.extraLabels={obras:'Obras y asignaciones',legal:'IPS · MJT · Banco'};
window.extraRoutes={obras(){
 const st=aryes.state(),obras=st.obras||[],asg=st.assign||[],dow=new Date().getDay();
 const hoy=obras.map(o=>({o,l:asg.filter(a=>a.obraId===o.id&&a.days.includes(dow)&&active(a))}));
 $('#content').innerHTML=head('Obras y asignaciones','Definí en qué obra trabaja cada funcionario y qué días',`<button class="ghost" data-x="exp">↧ CSV</button><button class="ghost" data-x="obra">＋ Nueva obra</button><button class="primary" data-x="asg">＋ Asignar personal</button>`)
 +`<section class="panel"><h2>Hoy (${DAYS[dow]}) en cada obra</h2>${hoy.length?hoy.map(x=>`<div class="listline"><span><strong>${E(x.o.name)}</strong><div class="muted">${E(x.o.address||'')}</div></span><span>${x.l.length?x.l.map(a=>`<span class="tag ok">${E(emp(a.employeeId))}</span>`).join(' '):'<span class="muted">Sin personal hoy</span>'}</span></div>`).join(''):'<p class="muted">Creá una obra para empezar.</p>'}</section>`
 +'<h2 style="font-size:16px">Asignaciones</h2>'+tbl(['Obra','Funcionario','Días','Período','Acción'],asg.map(a=>`<tr><td>${E(obras.find(o=>o.id===a.obraId)?.name||'—')}</td><td>${E(emp(a.employeeId))}</td><td>${dayTxt(a)}</td><td>${a.from||'—'} → ${a.to||'sin fin'}</td><td><button class="ghost" data-del="${a.id}">Quitar</button></td></tr>`))
 +(obras.length?'<h2 style="font-size:16px;margin-top:22px">Obras</h2>'+tbl(['Obra','Dirección','Estado','Acción'],obras.map(o=>`<tr><td><strong>${E(o.name)}</strong></td><td>${E(o.address||'')}</td><td><span class="tag ${o.active?'ok':'bad'}">${o.active?'Activa':'Cerrada'}</span></td><td><button class="ghost" data-tog="${o.id}">${o.active?'Cerrar':'Reabrir'}</button></td></tr>`)):'')
},
legal(){
 const st=aryes.state(),m=window.legalMonth||mon(),pe=st.settings.ipsEmployerPercent??16.5,miss=st.employees.filter(e=>!e.ips||!e.mjt||!e.bank||!e.account).length;
 const banks=['','Itaú','Continental','Familiar','Visión','BNF','Basa','Sudameris','GNB','Ueno','Atlas','Otro'];
 $('#content').innerHTML=head('IPS · MJT · Banco','Datos laborales y archivos para presentar y pagar',`<label class="field">Mes <input class="input" type="month" id="legM" value="${m}"></label><button class="ghost" data-x="ips">↧ Planilla IPS</button><button class="ghost" data-x="mjt">↧ Planilla MJT</button><button class="primary" data-x="bank">↧ Pago bancario</button>`)
 +`<div class="notice warning">Montos estimativos sobre el salario base + horas extra estimadas de la demo. Aporte patronal IPS: ${pe}% (editable en el archivo exportado). Verificá formato y tasas con tu contador antes de presentar a IPS, MTESS/MJT o al banco.</div>${miss?`<div class="notice">${miss} funcionario(s) con datos incompletos.</div>`:''}`
 +tbl(['Funcionario','Nº IPS','Nº MJT','Banco','Cuenta','Tipo'],st.employees.map(e=>`<tr><td><strong>${E(e.name)}</strong><div class="muted">${E(e.document||'')}</div></td><td><input class="input" data-id="${e.id}" data-f="ips" value="${E(e.ips||'')}" placeholder="Nº asegurado"></td><td><input class="input" data-id="${e.id}" data-f="mjt" value="${E(e.mjt||'')}" placeholder="Nº MJT"></td><td><select class="select" data-id="${e.id}" data-f="bank">${banks.map(b=>`<option ${b===(e.bank||'')?'selected':''}>${b}</option>`).join('')}</select></td><td><input class="input" data-id="${e.id}" data-f="account" value="${E(e.account||'')}" placeholder="Nº de cuenta"></td><td><select class="select" data-id="${e.id}" data-f="acctType">${['Caja de ahorro','Cuenta corriente'].map(t=>`<option ${t===(e.acctType||'Caja de ahorro')?'selected':''}>${t}</option>`).join('')}</select></td></tr>`));
}};
document.addEventListener('change',async e=>{const t=e.target;if(t.id==='legM'){window.legalMonth=t.value;window.extraRoutes.legal();return}if(!t.dataset.f)return;const f=t.dataset.f,v=t.value.trim();await demoApi('/employees/'+t.dataset.id,{method:'PATCH',body:JSON.stringify({[f]:v})});const x=aryes.state().employees.find(q=>q.id===t.dataset.id);if(x)x[f]=v;aryes.notify('Dato guardado')});
document.addEventListener('click',async e=>{const b=e.target.closest('button');if(!b)return;const st=aryes.state();
 if(b.dataset.del){await demoApi('/assign/'+b.dataset.del,{method:'DELETE'});await aryes.refresh();return}
 if(b.dataset.tog){{const o=st.obras.find(o=>o.id===b.dataset.tog);await demoApi('/obras/'+o.id,{method:'PATCH',body:JSON.stringify({active:!o.active})})}await aryes.refresh();return}
 const x=b.dataset.x;if(!x)return;
 if(x==='obra')aryes.modal('Nueva obra',`<div class="formgrid"><label class="field">Nombre de la obra <input class="input" name="name" required maxlength="100"></label><label class="field">Dirección / zona <input class="input" name="address" maxlength="150"></label></div>`,async f=>{await demoApi('/obras',{method:'POST',body:JSON.stringify({name:f.get('name'),address:f.get('address'),active:true})})});
 if(x==='asg'){const ob=(st.obras||[]).filter(o=>o.active),em=st.employees.filter(e=>e.active);if(!ob.length||!em.length)return aryes.notify('Primero creá una obra y un funcionario');
  aryes.modal('Asignar personal a obra',`<div class="formgrid"><label class="field">Obra <select class="select" name="obraId">${ob.map(o=>`<option value="${o.id}">${E(o.name)}</option>`).join('')}</select></label><label class="field">Funcionario <select class="select" name="employeeId">${em.map(o=>`<option value="${o.id}">${E(o.name)}</option>`).join('')}</select></label><label class="field">Desde <input class="input" type="date" name="from" value="${today()}"></label><label class="field">Hasta (opcional) <input class="input" type="date" name="to"></label></div><div class="steps">${[1,2,3,4,5,6,0].map(d=>`<label class="pill"><input type="checkbox" name="d" value="${d}" ${d>=1&&d<=5?'checked':''}> ${DAYS[d]}</label>`).join('')}</div>`,async f=>{const days=f.getAll('d').map(Number);if(!days.length)throw Error('Elegí al menos un día');if(f.get('to')&&f.get('to')<f.get('from'))throw Error('Fechas inválidas');await demoApi('/assign',{method:'POST',body:JSON.stringify({obraId:f.get('obraId'),employeeId:f.get('employeeId'),days,from:f.get('from'),to:f.get('to')})})})}
 if(x==='exp')csv('obras-asignaciones.csv',[['Obra','Funcionario','Días','Desde','Hasta'],...(st.assign||[]).map(a=>[(st.obras||[]).find(o=>o.id===a.obraId)?.name,emp(a.employeeId),dayTxt(a),a.from,a.to])]);
 if(['ips','mjt','bank'].includes(x)){const m=window.legalMonth||mon(),p=await demoApi('/payroll?month='+m),r=Object.fromEntries(p.rows.map(q=>[q.employeeId,q])),pe=st.settings.ipsEmployerPercent??16.5,ip=st.settings.ipsEmployeePercent??9;
  if(x==='ips')csv('planilla-ips-'+m+'.csv',[['Funcionario','Documento','Nº IPS','Salario imponible','Aporte obrero %','Aporte obrero','Aporte patronal %','Aporte patronal','Total a depositar'],...st.employees.filter(e=>e.active).map(e=>{const g=r[e.id]?.gross??e.salary,o=Math.round(g*ip/100),pt=Math.round(g*pe/100);return[e.name,e.document,e.ips,g,ip,o,pe,pt,o+pt]})]);
  if(x==='mjt')csv('planilla-mjt-'+m+'.csv',[['Funcionario','Documento','Nº MJT','Cargo','Sector','Salario base','Horas extra','Estado'],...st.employees.map(e=>[e.name,e.document,e.mjt,e.role,e.sector,e.salary,r[e.id]?.overtime??0,e.active?'Activo':'Inactivo'])]);
  if(x==='bank'){const l=st.employees.filter(e=>e.active&&e.bank&&e.account);if(!l.length)return aryes.notify('Cargá banco y cuenta de los funcionarios');csv('pago-bancario-'+m+'.csv',[['Funcionario','Documento','Banco','Tipo de cuenta','Cuenta','Monto neto (Gs.)'],...l.map(e=>[e.name,e.document,e.bank,e.acctType||'Caja de ahorro',e.account,r[e.id]?.net??e.salary])])}}
});
})();
