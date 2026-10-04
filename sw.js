const STRONG_VIBRATION=[450,120,450,120,900,160,450,120,900];
self.addEventListener('install',()=>self.skipWaiting());
self.addEventListener('activate',event=>event.waitUntil(self.clients.claim()));
self.addEventListener('push',event=>event.waitUntil((async()=>{
  await self.registration.showNotification('🔔 근무확인 시간입니다',{body:'지금 PC에서 근무확인을 눌러주세요.',icon:'./icon-192.png',badge:'./icon-192.png',tag:'work-check-reminder',renotify:true,silent:false,requireInteraction:true,vibrate:STRONG_VIBRATION,data:{url:'./'}});
  for(const client of await self.clients.matchAll({type:'window',includeUncontrolled:true})) client.postMessage({type:'REFRESH_STATUS'});
})()));
self.addEventListener('notificationclick',event=>{
  event.notification.close();
  event.waitUntil((async()=>{
    for(const client of await self.clients.matchAll({type:'window',includeUncontrolled:true})){
      if('focus' in client){client.postMessage({type:'REFRESH_STATUS'});return client.focus();}
    }
    return self.clients.openWindow('./');
  })());
});
