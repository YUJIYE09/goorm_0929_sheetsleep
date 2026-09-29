import http from 'node:http';
import {createReadStream, statSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const mime = {'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.jpg':'image/jpeg','.png':'image/png','.wav':'audio/wav','.json':'application/json'};
const server = http.createServer((req,res)=>{
  let pathname;
  try { pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname); }
  catch { res.writeHead(400).end('Bad request'); return; }
  const relative=pathname==='/'?'web-preview.html':pathname.slice(1);
  const file=path.resolve(root,relative);
  if(file!==root&&!file.startsWith(root+path.sep)){res.writeHead(403).end('Forbidden');return;}
  try { if(!statSync(file).isFile())throw new Error(); }
  catch { res.writeHead(404).end('Not found');return; }
  res.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream','Cache-Control':'no-store'});
  createReadStream(file).pipe(res);
});
const port=Number(process.env.PORT||4173);
server.listen(port,'127.0.0.1',()=>console.log(`ShiftSleep preview: http://127.0.0.1:${port}`));
