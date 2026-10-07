// v11: preserve alerts during routine status sync; report notification runtime version.
const BASIC_VIBRATION=[500,200,500];
const REPEATED_VIBRATION=[450,120,450,120,900,160,450,120,900];
const MODE_CACHE='work-check-notification-settings';
const MODE_KEY=new URL('./notification-vibration-mode',self.registration.scope).href;
async function readMode(){
  try{const response=await (await caches.open(MODE_CACHE)).match(MODE_KEY);return response&&await response.text()==='pattern'?'pattern':'system';}
  catch{return 'system';}
}
async function showNotice(test=false,requestedMode){
  const mode=requestedMode||await readMode();
  const options={body:test?'이 알림을 길게 눌러 소리·진동 설정을 확인하세요.':'지금 PC에서 근무확인을 눌러주세요.',
    icon:'./icon-192.png',badge:'./icon-192.png',
    tag:test?'work-check-vibration-test':'work-check-reminder',renotify:true,silent:false,
    requireInteraction:true,timestamp:Date.now(),data:{url:'./',test,createdAt:Date.now()}};
  options.vibrate=mode==='pattern'?REPEATED_VIBRATION:BASIC_VIBRATION;
  await self.registration.showNotification(test?'진동 확인 · '+(mode==='pattern'?'반복 패턴':'기본 패턴'):'🔔 근무확인 시간입니다',options);
}
self.addEventListener('install',()=>self.skipWaiting());
self.addEventListener('activate',event=>event.waitUntil(self.clients.claim()));
self.addEventListener('message',event=>{
  if(!['SET_VIBRATION_MODE','TEST_NOTIFICATION','GET_VERSION'].includes(event.data?.type)) return;
  event.waitUntil((async()=>{
    try{
      const mode=event.data.mode==='pattern'?'pattern':'system';
      if(event.data.type==='SET_VIBRATION_MODE') await (await caches.open(MODE_CACHE)).put(MODE_KEY,new Response(mode));
      if(event.data.type==='TEST_NOTIFICATION') await showNotice(true,mode);
      event.ports[0]?.postMessage({ok:true,version:11,mode:await readMode()});
    }catch(e){event.ports[0]?.postMessage({ok:false,error:e.message});}
  })());
});
self.addEventListener('push',event=>event.waitUntil((async()=>{
  await showNotice();
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
