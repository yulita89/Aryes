/* ARYES · almacenamiento en Supabase. Reutiliza la lógica de demo-api.js y solo cambia dónde se guardan los datos. */
(()=>{
const C=window.ARYES_CONFIG||{};if(!C.supabaseUrl||!C.supabaseKey||!window.supabase)return;
window.aryesCloud=true;
const sb=supabase.createClient(C.supabaseUrl,C.supabaseKey),T=['employees','shifts','marks','leaves','obras','assign'];
const DEF={company:'Aryes Energías',currency:'PYG',lat:null,lng:null,radiusMeters:150,monthlyHours:208,overtimeFactor:1.5,ipsEmployeePercent:9};
const ck=r=>{if(r.error)throw Error(r.error.message);return r.data};
let cache=null,snap={};
// Login
const ready=new Promise(async ok=>{
 if((await sb.auth.getSession()).data.session)return ok();
 const o=document.createElement('div');o.style.cssText='position:fixed;inset:0;z-index:99;background:#f4f6fa;display:grid;place-items:center;padding:20px';
 o.innerHTML='<form style="background:#fff;padding:28px;border-radius:18px;box-shadow:0 10px 40px #0002;width:min(380px,100%);display:grid;gap:12px;font-family:inherit"><img src="/logo.png" style="width:120px;margin:0 auto"><input class="input" name="e" type="email" placeholder="Correo" required autocomplete="username"><input class="input" name="p" type="password" placeholder="Contraseña" required autocomplete="current-password"><button class="primary">Ingresar</button><small id="le" style="color:#e33b62;min-height:1em"></small></form>';
 document.body.append(o);
 o.querySelector('form').onsubmit=async ev=>{ev.preventDefault();const f=new FormData(ev.target),r=await sb.auth.signInWithPassword({email:f.get('e'),password:f.get('p')});if(r.error)o.querySelector('#le').textContent='Correo o contraseña incorrectos';else{o.remove();ok()}}
});
const b=document.createElement('button');b.className='ghost';b.textContent='Salir';b.onclick=async()=>{await sb.auth.signOut();location.reload()};document.querySelector('#themeBtn')?.before(b);
const ser=d=>{const m={settings:{1:JSON.stringify(d.settings)}};T.forEach(t=>{m[t]={};(d[t]||[]).forEach(r=>m[t][r.id]=JSON.stringify(r))});return m};
async function fetchAll(){
 const [s,...rs]=await Promise.all([sb.from('settings').select('data').eq('id',1).maybeSingle(),...T.map(t=>sb.from(t).select('id,data').order('created_at'))]);
 const d={settings:{...DEF,...(ck(s)?.data||{})}};T.forEach((t,i)=>d[t]=ck(rs[i]).map(r=>({...r.data,id:r.id})));
 cache=d;snap=ser(d);return d}
window.aryesStore={
 async load(force){await ready;if(force||!cache)await fetchAll();return cache},
 async save(d){try{
  for(const m of d.marks)if(String(m.photo||'').startsWith('data:')){const blob=await (await fetch(m.photo)).blob();ck(await sb.storage.from('fotos').upload(m.id+'.jpg',blob,{contentType:'image/jpeg',upsert:true}));m.photo=sb.storage.from('fotos').getPublicUrl(m.id+'.jpg').data.publicUrl}
  const cur=ser(d),jobs=[];
  const sd=cur.settings[1]!==snap.settings[1];if(sd)jobs.push(sb.from('settings').upsert({id:1,data:d.settings}));
  for(const t of T){const up=(d[t]||[]).filter(r=>cur[t][r.id]!==snap[t][r.id]).map(({id,...data})=>({id,data}));if(up.length)jobs.push(sb.from(t).upsert(up));const del=Object.keys(snap[t]).filter(id=>!(id in cur[t]));if(del.length)jobs.push(sb.from(t).delete().in('id',del))}
  (await Promise.all(jobs)).forEach(ck);snap=cur}catch(e){cache=null;throw e}}
};
})();
