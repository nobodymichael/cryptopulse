const CACHE="crypto-pulse-v1";
const CORE=["./","./index.html","./styles.css","./app.js","./manifest.webmanifest","./assets/icon.svg"];
self.addEventListener("install",e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE))));
self.addEventListener("activate",e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k))))));
self.addEventListener("fetch",e=>{if(e.request.method!=="GET")return;e.respondWith(fetch(e.request).then(r=>{const copy=r.clone();caches.open(CACHE).then(c=>c.put(e.request,copy));return r}).catch(()=>caches.match(e.request)))});
// Push events will be enabled after VAPID keys and subscription storage are configured.
self.addEventListener("push",e=>{if(!e.data)return;const d=e.data.json();e.waitUntil(self.registration.showNotification(d.title||"Crypto Pulse AI",{body:d.body||"Ważne wydarzenie na rynku krypto",icon:"./assets/icon.svg",badge:"./assets/icon.svg",data:{url:d.url||"./"}}))});
self.addEventListener("notificationclick",e=>{e.notification.close();e.waitUntil(clients.openWindow(e.notification.data?.url||"./"))});