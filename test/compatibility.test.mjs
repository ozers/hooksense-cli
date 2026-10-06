import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { createServer } from 'node:http';
import { once } from 'node:events';
import { spawn } from 'node:child_process';
import { WebSocketServer } from 'ws';
import { createLoginServer } from '../dist/lib/login-server.js';

const listen = async (server) => { server.listen(0, '127.0.0.1'); await once(server, 'listening'); return `http://127.0.0.1:${server.address().port}`; };
const close = async (server) => { server.closeAllConnections?.(); await new Promise(r=>server.close(r)); };

test('CLI matches current authentication, live feed, and local replay contracts', async t => {
  const home = await mkdtemp(`${tmpdir()}/hooksense-cli-test-`);
  process.env.HOME = home; process.env.XDG_CONFIG_HOME = home;
  const { config, setToken } = await import('../dist/lib/config.js');
  assert.ok(config.path.startsWith(home), 'never use real CLI credentials');
  const token = 'test.session.signature';
  setToken(token);
  const api = await import('../dist/lib/api.js');
  const { connectWebSocket } = await import('../dist/lib/ws.js');
  let seen = [];
  const captured = {id:'req-1', method:'POST', headers:{'content-type':'application/json','content-length':'999','x-signature':'example'}, queryParams:{event:'created'}, body:'{"ok":true}'};
  const backend = createServer((req,res) => {
    seen.push({url:req.url,cookie:req.headers.cookie});
    res.setHeader('Content-Type','application/json');
    if(req.url === '/api/requests/req-1') res.end(JSON.stringify(captured));
    else if(req.url?.includes('/requests?')) {res.statusCode=401;res.end('{"error":"Session expired"}');}
    else res.end('[]');
  });
  const base = await listen(backend); process.env.HOOKSENSE_API = base + '/';
  t.after(async()=>{await close(backend);await rm(home,{recursive:true,force:true});});
  await t.test('HTTP sends session and surfaces failures instead of empty lists',async()=>{
    await api.listEndpoints(); assert.equal(seen.at(-1).cookie,`token=${token}`);
    await assert.rejects(api.getRequests('private'),/Session expired/);
  });
  await t.test('browser form POST logs in; URL tokens and foreign origins fail',async()=>{
    let received;
    const server=createLoginServer('https://hooksense.com',value=>received=value);const url=await listen(server);
    try {
      assert.equal((await fetch(url+'/callback?token=leaked')).status,404);
      assert.equal((await fetch(url+'/callback')).status,405);
      const options={method:'POST',headers:{origin:'https://evil.example','content-type':'application/x-www-form-urlencoded'},body:`token=${token}`};
      assert.equal((await fetch(url+'/callback',options)).status,403);assert.equal(received,undefined);
      options.headers.origin='https://hooksense.com';
      assert.equal((await fetch(url+'/callback',options)).status,200);assert.equal(received,token);
    } finally {await close(server);}
  });
  await t.test('private WebSocket sends cookie and delivers events',async()=>{
    const wss=new WebSocketServer({server:backend});
    wss.once('connection',(socket,req)=>{assert.equal(req.headers.cookie,`token=${token}`);socket.send(JSON.stringify({type:'new_request',request:captured}));});
    let client;
    const received=await new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(Error('No event')),3000);client=connectWebSocket({slug:'private',onMessage:data=>{clearTimeout(timer);resolve(data);}});});
    assert.equal(received.request.id,'req-1');client.close();await new Promise(r=>wss.close(r));
  });
  await t.test('policy rejection stops reconnect loop',async()=>{
    const wss=new WebSocketServer({server:backend});let count=0;
    wss.on('connection',socket=>{count++;socket.close(1008,'Not authorized');});
    let client;
    const message=await new Promise(resolve=>{client=connectWebSocket({slug:'private',onMessage(){},onFatal:resolve});});
    assert.match(message,/Not authorized/);await new Promise(r=>setTimeout(r,1200));assert.equal(count,1);client.close();await new Promise(r=>wss.close(r));
  });
  await t.test('replay command fetches payload then reaches a real localhost handler',async()=>{
    let received;
    const target=createServer(async(req,res)=>{let body='';for await(const chunk of req)body+=chunk;received={url:req.url,body,signature:req.headers['x-signature']};res.end('replayed');});
    const url=await listen(target);
    try {
      const child=spawn(process.execPath,['dist/index.js','replay','req-1','--forward',url+'/webhook'],{env:process.env});
      let output='';child.stdout.on('data',d=>output+=d);child.stderr.on('data',d=>output+=d);
      const [code]=await once(child,'exit');assert.equal(code,0,output);
      assert.deepEqual(received,{url:'/webhook?event=created',body:captured.body,signature:'example'});
      assert.ok(!seen.some(r=>r.url.includes('/replay')),'must not use server-side replay');
    } finally {await close(target);}
  });
});
