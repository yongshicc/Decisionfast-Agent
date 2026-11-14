import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { localApiProxy } from './local-proxy.mjs';
const listen = server => new Promise(resolve=>server.listen(0,'127.0.0.1',()=>resolve(server.address().port)));
test('loopback proxy forwards exact input, 202, review queries and upstream errors',async()=>{
 const upstream=createServer((req,res)=>{let input='';req.on('data',v=>input+=v);req.on('end',()=>{res.setHeader('Content-Type','application/json');if(req.url.startsWith('/webhook/decidefast-review-history')){assert.equal(req.url,'/webhook/decidefast-review-history?limit=50');res.end(JSON.stringify({rows:[],returned:0,total_matching:0}));return;}assert.equal(req.url,'/webhook/decidefast-offline-decision');const body=JSON.parse(input);res.statusCode=body.complaint==='error'?502:202;res.end(JSON.stringify(body.complaint==='error'?{error:'Real upstream test failure'}:{echo:body,decision:'HUMAN_REVIEW',probability:.5}));});});
 const port=await listen(upstream);const proxy=localApiProxy(`http://127.0.0.1:${port}`);const server=createServer((q,s)=>proxy(q,s,()=>{s.writeHead(404);s.end();}));const local=await listen(server);
 try {const body={complaint_id:'TEST-ONLY',complaint:'proxy test fixture'};let res=await fetch(`http://127.0.0.1:${local}/api/decisions`,{method:'POST',body:JSON.stringify(body)});assert.equal(res.status,202);assert.deepEqual((await res.json()).echo,body);res=await fetch(`http://127.0.0.1:${local}/api/reviews?limit=50`);assert.deepEqual((await res.json()).rows,[]);res=await fetch(`http://127.0.0.1:${local}/api/decisions`,{method:'POST',body:JSON.stringify({...body,complaint:'error'})});assert.equal(res.status,502);assert.equal((await res.json()).error,'Real upstream test failure');res=await fetch(`http://127.0.0.1:${local}/api/reviews`,{headers:{Origin:'https://public.example'}});assert.equal(res.status,403); }finally{server.closeAllConnections();upstream.closeAllConnections();server.close();upstream.close();}
});
test('rejects non-local n8n targets',()=>assert.throws(()=>localApiProxy('https://public.example'),/loopback/));
