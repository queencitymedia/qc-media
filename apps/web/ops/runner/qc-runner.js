'use strict';
const http = require('http');
const fs   = require('fs');
const path = require('path');

const PORT = parseInt(process.argv[2] || process.env.PORT || '5680', 10);
const ROOT = process.cwd();

function sendJson(res, code, obj){
  const body = Buffer.from(JSON.stringify(obj));
  res.writeHead(code, {'Content-Type':'application/json','Content-Length':body.length});
  res.end(body);
}
function readBody(req){
  return new Promise((resolve,reject)=>{
    const chunks=[]; req.on('data',c=>chunks.push(c));
    req.on('end',()=>{ try{ resolve(Buffer.concat(chunks).toString('utf8')); } catch(e){ reject(e); }});
    req.on('error',reject);
  });
}
async function handleRun(req,res){
  try{
    const text = await readBody(req);
    const payload = text ? JSON.parse(text) : {};
    const jobs = Array.isArray(payload.jobs) ? payload.jobs : [];
    let results = [];
    for(const job of jobs){
      if(job.kind === 'write_files'){
        const files = Array.isArray(job.files) ? job.files : [];
        for(const f of files){
          const rel = f.path.replace(/\\/g,'/');
          const full = path.join(ROOT, rel);
          fs.mkdirSync(path.dirname(full), {recursive:true});
          fs.writeFileSync(full, String(f.content ?? ''), {encoding:'utf8'});
        }
        results.push({kind:'write_files', ok:true, count:files.length});
      } else if(job.kind === 'probe'){
        // simple success echo; client should do real probes
        results.push({kind:'probe', ok:true, count:(job.urls||[]).length});
      } else {
        results.push({kind:job.kind||'unknown', ok:false, msg:'unsupported'});
      }
    }
    return sendJson(res, 200, {ok:true, results});
  } catch(e){
    return sendJson(res, 400, {ok:false, error:String(e && e.message || e)});
  }
}

const server = http.createServer((req,res)=>{
  if(req.method === 'GET' && req.url === '/health'){ return sendJson(res,200,{ok:true,port:PORT}); }
  if(req.method === 'POST' && req.url === '/run'){ return handleRun(req,res); }
  sendJson(res,404,{ok:false, msg:'not found'});
});

server.listen(PORT, '0.0.0.0', ()=> {
  // console.log('QC Runner listening on', PORT);
});