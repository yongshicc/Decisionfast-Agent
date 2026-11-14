import { createServer } from 'node:http';
import { createReadStream, existsSync, statSync } from 'node:fs';
import { resolve, extname, sep } from 'node:path';
import { localApiProxy, localHost } from './local-proxy.mjs';
const root = resolve('dist-local');
if (!existsSync(resolve(root,'index.html'))) {console.error('Build the local frontend first: npm run build:local');process.exit(1);}
const proxy = localApiProxy();
const types = {'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.webmanifest':'application/manifest+json','.svg':'image/svg+xml','.png':'image/png','.woff2':'font/woff2','.ttf':'font/ttf','.ico':'image/x-icon','.md':'text/plain'};
const server = createServer((req,res)=>{
  try {if (!localHost(new URL(`http://${req.headers.host}`).hostname)) {res.writeHead(403);res.end('Local host required');return;}}catch{res.writeHead(403);res.end();return;}
  proxy(req,res,()=>{
    const url = new URL(req.url || '/', 'http://localhost');
    if (url.pathname.startsWith('/api/')) {res.writeHead(404,{'Content-Type':'application/json'});res.end(JSON.stringify({error:'Unknown local API route'}));return;}
    let file;
    try {file=resolve(root,`.${decodeURIComponent(url.pathname)}`);}catch{res.writeHead(400);res.end();return;}
    if (!file.startsWith(root+sep) && file !== root) {res.writeHead(403);res.end();return;}
    if (!existsSync(file)||!statSync(file).isFile()) {
      if (extname(url.pathname)) {res.writeHead(404);res.end('Not found');return;}
      file=resolve(root,'index.html');
    }
    res.writeHead(200,{'Content-Type':types[extname(file)]||'application/octet-stream','Cache-Control':file.includes(`${sep}assets${sep}`)?'public, max-age=31536000, immutable':'no-cache'});
    createReadStream(file).pipe(res);
  });
});
server.listen(Number(process.env.PORT)||3000,'127.0.0.1',()=>console.log(`DecideFast local: http://127.0.0.1:${Number(process.env.PORT)||3000}`));
