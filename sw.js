const SW_VERSION = 'v3';

self.addEventListener('install',e=>{
  self.skipWaiting();
});

self.addEventListener('activate',e=>{
  e.waitUntil(self.clients.claim());
});

self.addEventListener('push',e=>{
  e.waitUntil(
    self.registration.showNotification('🔔 근무확인 시간입니다',{
      body:'지금 근무확인을 눌러주세요.',
      icon:'./icon-192.png',
      badge:'./icon-192.png',
      tag:'work-check-'+Date.now(),
      renotify:true,
      silent:false,
      requireInteraction:true,
      data:{url:'./'}
    })
  );
});

self.addEventListener('notificationclick',e=>{
  e.notification.close();
  e.waitUntil((async()=>{
    const list=await self.clients.matchAll({
      type:'window',
      includeUncontrolled:true
    });

    for(const client of list){
      if('focus' in client){
        return client.focus();
      }
    }

    return self.clients.openWindow('./');
  })());
});
