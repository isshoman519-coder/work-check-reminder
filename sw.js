// v12: platform-specific push tags, with existing notification settings and status sync.
const REMINDER_TAG='work-check-reminder';
const userAgent=self.navigator.userAgent||'';
const IS_IOS=/iPhone|iPad|iPod/i.test(userAgent);
const IS_ANDROID=/Android/i.test(userAgent);
let iosNotice=Promise.resolve();
const BASIC_VIBRATION=[500,200,500];
const REPEATED_VIBRATION=[450,120,450,120,900,160,450,120,900];
const ANDROID_VIBRATION=[500,200,500,200,900];
const MODE_CACHE='work-check-notification-settings';
const MODE_KEY=new URL('./notification-vibration-mode',self.registration.scope).href;
async function readMode(){
  try{const response=await (await caches.open(MODE_CACHE)).match(MODE_KEY);return response&&await response.text()==='pattern'?'pattern':'system';}
  catch{return 'system';}
}
async function showNotice(test=false,requestedMode){
  const mode=requestedMode||await readMode();
  const tag=test?'work-check-vibration-test':IS_IOS||IS_ANDROID?REMINDER_TAG+'-'+crypto.randomUUID():REMINDER_TAG;
  const options={body:test?'이 알림을 길게 눌러 소리·진동 설정을 확인하세요.':'지금 PC에서 근무확인을 눌러주세요.',
    icon:'./icon-192.png',badge:'./icon-192.png',
    tag,renotify:!IS_IOS,silent:false,
    requireInteraction:true,timestamp:Date.now(),data:{url:'./',test,createdAt:Date.now()}};
  if(!IS_IOS) options.vibrate=mode==='pattern'?(IS_ANDROID?ANDROID_VIBRATION:REPEATED_VIBRATION):BASIC_VIBRATION;
  await self.registration.showNotification(test?'진동 확인 · '+(mode==='pattern'?'반복 패턴':'기본 패턴'):'🔔 근무확인 시간입니다',options);
  if(IS_IOS&&!test){
    try{
      const notices=await self.registration.getNotifications();
      for(const notice of notices){
        if(notice.tag!==tag&&(notice.tag===REMINDER_TAG||notice.tag.startsWith(REMINDER_TAG+'-'))) notice.close();
      }
    }catch{}
  }
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
      event.ports[0]?.postMessage({ok:true,version:12,mode:await readMode()});
    }catch(e){event.ports[0]?.postMessage({ok:false,error:e.message});}
  })());
});
self.addEventListener('push',event=>event.waitUntil((async()=>{
  if(IS_IOS){
    const notice=iosNotice.then(()=>showNotice());
    iosNotice=notice.catch(()=>{});
    await notice;
  }else{
    await showNotice();
  }
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
