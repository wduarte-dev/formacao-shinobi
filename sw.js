// O HTML e seus scripts são instalados juntos. Mídia visitada fica em outro cache.
const APP_VERSION='1.14';
const CORE='shinobi-core-'+APP_VERSION, MEDIA='shinobi-media-v1';
const scope=new URL(self.registration.scope);
const withinScope=url=>url.origin===scope.origin&&url.pathname.startsWith(scope.pathname);

async function installCore(){
  const options={cache:'reload'};
  const entry=new URL('index.html',scope);
  const html=await fetch(entry,options);
  if(!html.ok)throw Error('HTML indisponível');
  const text=await html.clone().text();
  const scripts=[...text.matchAll(/<script src="(js\/[a-z-]+\.js)"><\/script>/g)].map(match=>match[1]);
  if(!scripts.includes('js/data.js')||!scripts.includes('js/main.js'))throw Error('Scripts do jogo indisponíveis');
  const dataURL=new URL('js/data.js',scope);
  const data=await fetch(dataURL,options);
  if(!data.ok||!(await data.clone().text()).includes("const VERSION={v:'"+APP_VERSION+"'")){
    throw Error('A publicação do jogo ainda está em andamento');
  }
  const cache=await caches.open(CORE);
  const shell=['css/style.css','manifest.webmanifest','icons/icon-192.png','bg/sakura.png',
    'spr/iniciativa.png',...scripts.filter(name=>name!=='js/data.js')];
  await cache.addAll(shell.map(name=>new Request(new URL(name,scope),options)));
  await cache.put(dataURL,data);
  await cache.put(entry,html);
}
self.addEventListener('install',event=>event.waitUntil(installCore().then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil((async()=>{
  const keys=await caches.keys();
  await Promise.all(keys.filter(key=>key.startsWith('shinobi-core-')&&key!==CORE).map(key=>caches.delete(key)));
  await self.clients.claim();
})()));

async function respond(request,url){
  const core=await caches.open(CORE);
  if(request.mode==='navigate')return (await core.match(new URL('index.html',scope)))||fetch(request);
  const key=url.origin+url.pathname;
  const bundled=await core.match(key);
  if(bundled)return bundled;
  // Faixas com Range são reproduzidas pela rede. Resposta parcial não deve substituir arquivo completo.
  if(request.headers.has('range'))return fetch(request);
  const media=await caches.open(MEDIA);
  try{
    const response=await fetch(request,{cache:'no-cache'});
    if(response.ok&&response.type==='basic'){
      await media.put(key,response.clone()).catch(error=>console.warn('Cache de mídia indisponível.',error));
    }
    if(response.status<500)return response;
    return (await media.match(key))||response;
  }catch(error){
    return (await media.match(key))||(await (await caches.open('shinobi-v1')).match(url.pathname))||Response.error();
  }
}
self.addEventListener('fetch',event=>{
  const {request}=event, url=new URL(request.url);
  if(request.method==='GET'&&withinScope(url))event.respondWith(respond(request,url));
});
