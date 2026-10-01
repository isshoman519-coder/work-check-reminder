self.addEventListener('install',()=>self.skipWaiting());
self.addEventListener('activate',e=>e.waitUntil(self.clients.claim()));
self.addEventListener('push',e=>{
  e.waitUntil(self.registration.showNotification('🔔 근무확인 시간입니다',{
    body:'지금 근무확인을 눌러주세요.',icon:'icon-192.png',requireInteraction:true}));
});
self.addEventListener('notificationclick',e=>{
  e.notification.close();
  e.waitUntil(self.clients.matchAll({type:'window'}).then(l=>l.length?l[0].focus():self.clients.openWindow(self.registration.scope)));
});
