// Local-only transport. No inference or routing logic lives here.
import { request as httpRequest } from 'node:http';
import { request as httpsRequest } from 'node:https';
export const localHost = (host) => ['localhost','127.0.0.1','[::1]','::1'].includes(host);
export function localApiProxy(base = process.env.N8N_BASE_URL || 'http://127.0.0.1:5678') {
  const upstream = new URL(base);
  if (!localHost(upstream.hostname) || !['http:', 'https:'].includes(upstream.protocol)) throw new Error('N8N_BASE_URL must use a loopback hostname. The review API must never be exposed publicly.');
  return (req, res, next) => {
    const url = new URL(req.url || '/', 'http://localhost');
    if (!['/api/decisions','/api/reviews'].includes(url.pathname)) return next();
    const send = (status, error) => { if (res.headersSent) return; res.writeHead(status, {'Content-Type':'application/json','Cache-Control':'no-store'}); res.end(JSON.stringify({error})); };
    let host, origin;
    try { host = new URL(`http://${req.headers.host}`).hostname; origin = req.headers.origin ? new URL(req.headers.origin).hostname : host; } catch { return send(403,'Local host required.'); }
    if (!localHost(host) || !localHost(origin)) return send(403,'This API is available only on the local machine.');
    const decision = url.pathname === '/api/decisions';
    if (req.method !== (decision ? 'POST' : 'GET')) return send(405,'Method not allowed.');
    const target = new URL(decision ? '/webhook/decidefast-offline-decision' : '/webhook/decidefast-review-history',upstream);
    if (!decision) target.searchParams.set('limit', String(Math.max(1, Math.min(250, Number(url.searchParams.get('limit')) || 50))));
    const run = (body) => {
      const headers = {Accept:'application/json'};
      if (decision) { headers['Content-Type']='application/json'; headers['Content-Length']=String(Buffer.byteLength(body)); }
      const request = (target.protocol === 'https:' ? httpsRequest : httpRequest)(target,{method:req.method,headers},response=>{
        res.writeHead(response.statusCode || 502,{'Content-Type':response.headers['content-type'] || 'application/json','Cache-Control':'no-store'}); response.pipe(res);
      });
      request.setTimeout(115000,()=>{send(504,'Local n8n request timed out. Check Kev inference and workflow timeout settings.');request.destroy();});
      request.on('error',()=>send(503,'Local n8n is unreachable. Start n8n at N8N_BASE_URL and publish the DecideFast workflow.'));
      res.on('close',()=>request.destroy());
      request.end(body);
    };
    if (!decision) return run();
    let data = ''; let oversized = false;
    req.on('data',chunk=>{data += chunk; if(Buffer.byteLength(data)>1048576) { oversized=true;send(413,'Complaint request is too large.'); }});
    req.on('end',()=>{if(oversized)return;try {JSON.parse(data);}catch{return send(400,'Request must contain JSON.');}run(data);});
  };
}
