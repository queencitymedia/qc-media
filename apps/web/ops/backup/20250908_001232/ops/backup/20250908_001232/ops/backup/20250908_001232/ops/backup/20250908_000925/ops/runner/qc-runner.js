/* qc-runner.js — Node-based runner (no admin, no URLACL). */
const http = require('http');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const BASE = path.join(process.env.USERPROFILE || process.env.HOMEPATH || '', 'qc-media','apps','web');
const PORT_START = parseInt(process.env.QC_RUNNER_PORT || process.argv[2] || '5680',10);
const DEV_PORT   = parseInt(process.env.QC_DEV_PORT || '3000',10);
const LOG_FILE   = path.join(BASE,'ops','smoke','qc-boot.log');
function log(...a){const l=`[runner ${new Date().toISOString()}] ${a.join(' ')}`;console.log(l);try{fs.appendFileSync(LOG_FILE,l+'\n')}catch{}}

function tryListen(start,max=10){return new Promise(res=>{let p=start;const go=()=>{const srv=http.createServer(handler);srv.on('error',e=>{if((e.code==='EADDRINUSE'||e.code==='EACCES')&&p<start+max){p++;go()}else{res({ok:false,port:p,error:e})}});srv.listen(p,'127.0.0.1',()=>res({ok:true,port:p,srv}))});go()})}

async function handler(req,res){try{
  if(req.method==='GET'&&req.url==='/health')return json(res,200,{ok:true,port:serverPort});
  if(req.method==='POST'&&req.url.startsWith('/webhook/qc-run')){
    const raw=await readBody(req);let payload=null;try{payload=JSON.parse(raw||'{}')}catch{}
    if(!payload||payload.mode!=='jobs'||!Array.isArray(payload.jobs))return json(res,400,{ok:false,error:'bad payload'});
    const results=[];for(const j of payload.jobs){try{switch(j.kind){
      case'write_files':results.push({kind:'write_files',ok:await execWriteFiles(j.files||[])});break;
      case'run_script': results.push({kind:'run_script', ok:await execRunScript(j.script||'')});break;
      case'probe':      results.push({kind:'probe',      ok:true,data:await execProbe(j.urls||[])});break;
      case'start_dev':  results.push({kind:'start_dev',  ok:await execStartDev(j.devPort||DEV_PORT)});break;
      case'smoke_next': results.push({kind:'smoke_next', ok:true,data:await execSmokeNext(j.devPort||DEV_PORT)});break;
      case'report':     results.push({kind:'report',     ok:true,title:j.title||''});break;
      default:          results.push({kind:j.kind,ok:false,error:'unknown kind'})}}catch(e){results.push({kind:j.kind,ok:false,error:String(e&&e.message||e)})}}
    return json(res,200,{ok:true,results})}
  return json(res,404,{ok:false,error:'not found'})}catch(e){log('ERR',e.message);return json(res,500,{ok:false,error:'server'})}}

function readBody(r){return new Promise(s=>{let d='';r.on('data',c=>d+=c);r.on('end',()=>s(d))})}
function json(res,c,o){const s=JSON.stringify(o);res.writeHead(c,{'Content-Type':'application/json'});res.end(s)}
async function execWriteFiles(fsList){for(const f of fsList){const p=path.join(BASE,f.path);fs.mkdirSync(path.dirname(p),{recursive:true});fs.writeFileSync(p,String(f.content??''),'utf8');log('write',f.path)}return true}
async function execRunScript(sc){if(!sc||!sc.trim())return true;return new Promise(r=>{const ps=spawn('powershell.exe',['-NoLogo','-NoProfile','-ExecutionPolicy','Bypass','-Command',`cd "${BASE}"; ${sc}`],{windowsHide:false});ps.on('exit',()=>r(true))})}
async function execProbe(us){const one=u=>new Promise(r=>{const q=http.get(u,res=>{r({url:u,status:res.statusCode});res.resume()});q.on('error',()=>r({url:u,status:0}))});return Promise.all((us||[]).map(one))}
async function execStartDev(p){const ok=await httpGet200(`http://127.0.0.1:${p}/api/health`).catch(()=>false);if(ok)return true;log('start dev',p);spawn('powershell.exe',['-NoLogo','-NoProfile','-ExecutionPolicy','Bypass','-Command',`cd "${BASE}"; if(Test-Path package.json){npm run dev}`}],{detached:true});for(let i=0;i<20;i++){await delay(1000);if(await httpGet200(`http://127.0.0.1:${p}/api/health`).catch(()=>false))return true}return false}
async function execSmokeNext(p){const root=`http://127.0.0.1:${p}`;const r1=await httpGetCode(root).catch(()=>0);const r2=await httpGetCode(root+'/api/offers').catch(()=>0);let r3=0;try{r3=await httpPostCode(root+'/api/offers',{title:'Untitled'})}catch{}return{root:r1,list:r2,post:r3}}
function httpGet200(u){return new Promise((res,rej)=>{const q=http.get(u,r=>{r.resume();res(r.statusCode===200)});q.on('error',rej)})}
function httpGetCode(u){return new Promise(res=>{const q=http.get(u,r=>{const c=r.statusCode;r.resume();res(c)});q.on('error',()=>res(0))})}
function httpPostCode(u,b){const d=Buffer.from(JSON.stringify(b||{}));return new Promise(res=>{const url=new URL(u);const q=http.request({hostname:url.hostname,port:url.port,path:url.pathname,method:'POST',headers:{'Content-Type':'application/json','Content-Length':d.length}},r=>{r.resume();res(r.statusCode||0)});q.on('error',()=>res(0));q.write(d);q.end()})}
function delay(ms){return new Promise(r=>setTimeout(r,ms))}
let serverPort=PORT_START;(async()=>{const r=await tryListen(PORT_START,10);if(!r.ok){log('FATAL',String(r.error&&r.error.message||r.error));process.exit(1)}serverPort=r.port;log('listening',serverPort)})();