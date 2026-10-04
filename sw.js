const STRONG_VIBRATION = [450,120,450,120,900,160,450,120,900];

self.addEventListener('install',()=>self.skipWaiting());

self.addEventListener('activate',event=>{
  event.waitUntil(self.clients.claim());
});

self.addEventListener('push',event=>{
  const options={
    body:'지금 PC에서 근무확인을 눌러주세요.',
    icon:'./icon-192.png',
    badge:'./icon-192.png',
    tag:'work-check-'+Date.now(),
    renotify:true,
    silent:false,
    requireInteraction:true,
    // Android/Chromium에서는 지원 시 강한 반복 진동 패턴 적용.
    // iOS에서는 지원하지 않는 옵션이므로 무시되고 기본 햅틱으로 동작.
    vibrate:STRONG_VIBRATION,
    data:{url:'./'}
  };

  event.waitUntil(
    self.registration.showNotification('🔔 근무확인 시간입니다',options)
  );
});

self.addEventListener('notificationclick',event=>{
  event.notification.close();

  event.waitUntil(
    self.clients.matchAll({
      type:'window',
      includeUncontrolled:true
    }).then(list=>{
      for(const client of list){
        if('focus' in client) return client.focus();
      }
      return self.clients.openWindow('./');
    })
  );
});
