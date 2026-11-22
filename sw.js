// sw.js — deixa o jogo instalável e jogável offline SEM travar versão velha.
// Estratégia "rede primeiro": com internet sempre busca o arquivo novo (o que subiu pro GitHub entra na hora);
// guarda uma cópia; sem internet, usa a cópia (ignorando o ?v= que o index.html põe nos scripts).
const C = 'shinobi-v1';   // o conteúdo muda sozinho (rede primeiro); só troque o nome se a estratégia mudar
self.addEventListener('install', e => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));
self.addEventListener('fetch', e => {
  const r = e.request, u = new URL(r.url);
  if (r.method !== 'GET' || u.origin !== location.origin) return;   // fonte do Google etc.: segue normal
  e.respondWith(fetch(r,{cache:'no-cache'}).then(res => {
    if (res.ok && res.type === 'basic') { const cp = res.clone(); caches.open(C).then(c => c.put(u.pathname, cp)); }
    return res;
  }).catch(() => caches.match(u.pathname).then(m => m || (r.mode === 'navigate' ? caches.match(new URL('./', location).pathname) : Response.error()))));
});
