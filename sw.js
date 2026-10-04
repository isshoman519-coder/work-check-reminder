self.addEventListener('install',()=>self.skipWaiting());
self.addEventListener('activate',e=>e.waitUntil(self.clients.claim()));
self.addEventListener('push',e=>{e.waitUntil(self.registration.showNotification('🔔 근무확인 시간입니다',{body:'지금 PC에서 근무확인을 눌러주세요.',icon:'./icon-192.png',badge:'./icon-192.png',tag:'work-check-'+Date.now(),renotify:true,silent:false,requireInteraction:true}))});
self.addEventListener('notificationclick',e=>{e.notification.close();e.waitUntil(self.clients.matchAll({type:'window',includeUncontrolled:true}).then(list=>list.length?list[0].focus():self.clients.openWindow('./')))})
