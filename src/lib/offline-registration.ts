// Only this wrapper registers the app-shell service worker.
export async function registerOffline() {
 if (!('serviceWorker' in navigator)) return;
 const host=window.location.hostname.toLowerCase();
 const platform= /\.(lovable\.app|gpt-eng\.com|gptengineer\.run)$/.test(host);
 const label=host.split('.')[0] || '';
 const preview=platform&&(/^(?:id-preview|preview)(?:-[a-z0-9]+)?--.+$/.test(label)||/^project--.+-dev$/.test(label));
 const blocked=!import.meta.env.PROD||window.self!==window.top||preview||host==='lovableproject.com'||host.endsWith('.lovableproject.com')||host==='lovableproject-dev.com'||host.endsWith('.lovableproject-dev.com')||host==='beta.lovable.dev'||host.endsWith('.beta.lovable.dev')||new URLSearchParams(window.location.search).get('sw')==='off';
 if(blocked) { const registrations=await navigator.serviceWorker.getRegistrations(); await Promise.all(registrations.filter(r=>[r.active,r.waiting,r.installing].some(w=>w&&new URL(w.scriptURL).pathname==='/sw.js')).map(r=>r.unregister()));return; }
 const registration=await navigator.serviceWorker.register('/sw.js');
 registration.addEventListener('updatefound',()=>{const worker=registration.installing;worker?.addEventListener('statechange',()=>{if(worker.state==='installed'&&navigator.serviceWorker.controller)worker.postMessage({type:'SKIP_WAITING'});});});
}
