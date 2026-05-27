// shared.js — Firebase 초기화 + 공통 유틸
// index.html / units.html / expense.html / admin.html / admin-master.html 공통

const MASTER_UID='unGRVYWhmcMmEbYbWjAL8Y1pXVP2';
const FC={apiKey:"AIzaSyBHMCPX13coKBA9cu72K4k9WKYQQjVA7IA",authDomain:"rent-4d521.firebaseapp.com",databaseURL:"https://rent-4d521-default-rtdb.firebaseio.com",projectId:"rent-4d521",storageBucket:"rent-4d521.firebasestorage.app",messagingSenderId:"922087443394",appId:"1:922087443394:web:ff78188fc5ab967287645b"};
firebase.initializeApp(FC);
const db=firebase.database(),auth=firebase.auth(),gProv=new firebase.auth.GoogleAuthProvider();

// ── 건물 선택 유틸 ──
function getCurBid(uid){return localStorage.getItem("rbid_"+uid)||"main"}
function setCurBid(uid,bid){localStorage.setItem("rbid_"+uid,bid)}
function sortedBids(bd){return Object.keys(bd).sort((a,b)=>(bd[a]?.order||0)-(bd[b]?.order||0))}

// ── 다중 건물 마이그레이션 ──
async function migrateToMultiBldg(uid){
  if(localStorage.getItem("mig_"+uid))return;
  const snap=await db.ref("rent_app/"+uid+"/_buildings").once("value");
  if(snap.exists()){localStorage.setItem("mig_"+uid,"1");return;}
  let bname=localStorage.getItem("rent_aptname")||"내 건물";
  try{
    const bs=await db.ref("rent_app/"+uid+"/buildings").once("value");
    if(bs.exists()){const v=Object.values(bs.val());if(v.length&&v[0]?.name)bname=v[0].name}
  }catch(e){}
  const OLD=["units","rent_history","config","transactions","notes","buildings"];
  for(const p of OLD){
    try{
      const s=await db.ref("rent_app/"+uid+"/"+p).once("value");
      if(s.exists()){
        await db.ref("rent_app/"+uid+"/main/"+p).set(s.val());
        await db.ref("rent_app/"+uid+"/"+p).remove();
      }
    }catch(e){}
  }
  await db.ref("rent_app/"+uid+"/_buildings/main").set({id:"main",name:bname,order:0,createdAt:new Date().toISOString()});
  localStorage.setItem("mig_"+uid,"1");
}

// ── 사용자 접근 제어 ──
async function checkUserAccess(user){
  const ref=db.ref("_users/"+user.uid);
  const snap=await ref.once("value");
  let status;
  if(!snap.exists()){
    await ref.set({uid:user.uid,displayName:user.displayName||"",email:user.email||"",photoURL:user.photoURL||"",status:"pending",createdAt:new Date().toISOString()});
    status="pending";
  }else{
    status=snap.val().status||"pending";
  }
  if(status==="active")return true;
  if(status==="rejected"){
    const ss=document.getElementById("status-screen");
    document.getElementById("ss-email").textContent=user.email||"";
    document.getElementById("ss-icon").textContent="🚫";
    document.getElementById("ss-title").textContent="사용 승인이 거부됐습니다";
    document.getElementById("ss-msg").textContent="자세한 사항은 관리자에게 문의하세요.";
    ss.style.display="flex";
    return false;
  }
  return "readonly";
}

// ── 계약 만료 알림 ──
function maybeShowAlerts(){
  if(readOnly)return;
  const KEY="ca_cnt";
  if(parseInt(sessionStorage.getItem(KEY)||"0")>=3)return;
  let alerts;try{alerts=JSON.parse(sessionStorage.getItem("ca_alerts")||"null");}catch(e){return;}
  if(!alerts?.length)return;
  sessionStorage.setItem(KEY,parseInt(sessionStorage.getItem(KEY)||"0")+1);
  showContractToasts(alerts);
}
function showContractToasts(alerts){
  const prev=document.getElementById("ca-wrap");if(prev)prev.remove();
  const wrap=document.createElement("div");
  wrap.id="ca-wrap";
  wrap.style.cssText="position:fixed;top:16px;left:50%;transform:translateX(-50%);z-index:9999;display:flex;flex-direction:column;gap:6px;align-items:center;pointer-events:none";
  alerts.forEach((a,i)=>{
    const el=document.createElement("div");
    const room=a.bldName?`${a.bldName} ${a.room}호`:`${a.room}호`;
    el.textContent=`⚠ ${room} · ${a.name} · D-${a.dl}`;
    el.style.cssText="background:#e74c3c;color:#fff;padding:9px 18px;border-radius:8px;font-size:13px;font-weight:700;box-shadow:0 4px 12px rgba(0,0,0,.25);white-space:nowrap;opacity:0;transition:opacity .3s";
    wrap.appendChild(el);
    setTimeout(()=>el.style.opacity="1",i*120);
  });
  document.body.appendChild(wrap);
  setTimeout(()=>{
    wrap.querySelectorAll("div").forEach(el=>el.style.opacity="0");
    setTimeout(()=>wrap.remove(),400);
  },3500);
}

// ── 데모 배너 ──
function showDemoBanner(){
  if(document.getElementById("demo-banner"))return;
  const b=document.createElement("div");
  b.id="demo-banner";
  b.style.cssText="position:fixed;top:100px;left:0;right:0;z-index:150;background:linear-gradient(135deg,rgba(14,165,233,.18),rgba(14,165,233,.06));border-bottom:1px solid rgba(14,165,233,.35);padding:8px 16px;display:flex;align-items:center;justify-content:space-between";
  const btn=cu
    ?`<button onclick="auth.signOut()" style="background:rgba(14,165,233,.2);border:1px solid rgba(14,165,233,.4);border-radius:8px;padding:5px 12px;color:#0EA5E9;font-size:11px;font-weight:700;cursor:pointer;font-family:inherit">🚪 로그아웃</button>`
    :`<button onclick="sessionStorage.removeItem('guestDemo');location.reload()" style="background:rgba(14,165,233,.2);border:1px solid rgba(14,165,233,.4);border-radius:8px;padding:5px 12px;color:#0EA5E9;font-size:11px;font-weight:700;cursor:pointer;font-family:inherit">🔑 로그인</button>`;
  b.innerHTML=`<span style="font-size:12px;font-weight:700;color:#0EA5E9">👀 구경 모드 · 데모 데이터 표시 중</span>${btn}`;
  document.body.appendChild(b);
  document.querySelector(".content").style.marginTop="136px";
}

// ── 쓰기 권한 확인 ──
function guardWrite(){if(!readOnly)return true;showToast("⏳ 승인 후 이용 가능합니다");return false;}

// ── 인증 유틸 ──
function isInAppBrowser(){
  const ua=navigator.userAgent;
  const isStandalone=window.navigator.standalone===true||window.matchMedia("(display-mode:standalone)").matches;
  if(isStandalone)return false;
  return /KAKAOTALK|NAVER|Line\/|Instagram|FBAN|FBAV|Twitter|NaverMailApp|Snapchat/i.test(ua)||
         (/Android/.test(ua)&&/wv\b/.test(ua))||
         (/iPhone|iPad/.test(ua)&&!/Safari\//.test(ua)&&/AppleWebKit/.test(ua));
}
function signInGoogle(){
  if(isInAppBrowser()){
    showToast("⚠️ 앱 내 브라우저에서는 구글 로그인이 차단됩니다.<br>Chrome 또는 Safari로 열어주세요.",5000);
    return;
  }
  auth.signInWithPopup(gProv).catch(e=>showToast("❗ "+e.message));
}

// ── 메뉴 유틸 ──
function toggleMenu(){const el=document.getElementById("user-menu");if(el)el.classList.toggle("show")}
function closeMenu(){const el=document.getElementById("user-menu");if(el)el.classList.remove("show")}
document.addEventListener("click",e=>{if(!e.target.closest("#av-wrap")&&!e.target.closest("#user-menu"))closeMenu()});

// ── HTML 이스케이프 ──
function esc(s){return String(s||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}

// ── 금액 포맷 (만원 단위 → 원 표시) ──
function fmtWon(v){if(!v)return"—";return(v*10000).toLocaleString("ko-KR")+"원"}

// ── 토스트 ──
let tTm;function showToast(m,dur=2800){const t=document.getElementById("toast");t.innerHTML=m;t.classList.add("show");clearTimeout(tTm);tTm=setTimeout(()=>t.classList.remove("show"),dur)}

// ── 실수 방지 블라인드 덮개 ──
const _blindTimers=new WeakMap();
function liftBlind(blind){blind.classList.add("lifted");const old=_blindTimers.get(blind);if(old)clearTimeout(old);const t=setTimeout(()=>{blind.classList.remove("lifted");_blindTimers.delete(blind);},2200);_blindTimers.set(blind,t);}

// ── 이미지 압축 (모바일 업로드용, 최대 1920px JPEG 0.82) ──
async function compressImage(file){
  if(!file.type.startsWith("image/"))return file;
  try{
    const bitmap=await createImageBitmap(file);
    const MAX=1920;let w=bitmap.width,h=bitmap.height;
    if(w>MAX||h>MAX){if(w>=h){h=Math.round(h*MAX/w);w=MAX;}else{w=Math.round(w*MAX/h);h=MAX;}}
    const canvas=document.createElement("canvas");canvas.width=w;canvas.height=h;
    canvas.getContext("2d").drawImage(bitmap,0,0,w,h);bitmap.close();
    const blob=await Promise.race([
      new Promise(res=>canvas.toBlob(b=>res(b),"image/jpeg",0.82)),
      new Promise(res=>setTimeout(()=>res(null),10000))
    ]);
    return blob||file;
  }catch{return file;}
}

// ── 최근 N개월 Set (rent_history 필터링용) ──
function getRecentMonthsSet(n=12){
  const months=new Set();
  const now=new Date();
  for(let i=0;i<n;i++){
    const d=new Date(now.getFullYear(),now.getMonth()-i,1);
    months.add(`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`);
  }
  return months;
}

// ── 코치마크 (도움말) 공통 렌더러 ──
// defs: [{key, el}, ...]  /  CM_DATA: { key:{title,body}, ... }
function showCoachMarks(defs, CM_DATA){
  const HDR=108,BTN=80,vh=window.innerHeight;
  const vis=defs.filter(s=>{
    if(!s.el)return false;
    const r=s.el.getBoundingClientRect();
    if(!r.height)return false;
    const h=Math.min(r.bottom,vh-BTN)-Math.max(r.top,HDR);
    return h>0&&h/r.height>=0.5;
  });
  if(!vis.length&&defs.length)vis.push(defs[0]);
  const wrap=document.getElementById('cm-marks');
  if(!wrap)return;
  wrap.innerHTML='';
  vis.forEach(s=>{
    const d=CM_DATA[s.key];if(!d)return;
    const r=s.el.getBoundingClientRect();
    const mark=document.createElement('div');
    mark.className='cm-mark';
    mark.style.top=Math.max(r.top+10+(s.topOffset||0),HDR+8)+'px';
    mark.innerHTML=`<div class="cm-mtitle">${d.title}</div><div class="cm-mbody">${d.body}</div>`;
    wrap.appendChild(mark);
  });
  document.getElementById('cm-overlay').classList.add('show');
  requestAnimationFrame(()=>{
    let floor=HDR+8;
    wrap.querySelectorAll('.cm-mark').forEach(m=>{
      let top=parseFloat(m.style.top);
      if(top<floor)top=floor;
      m.style.top=top+'px';
      floor=top+m.getBoundingClientRect().height+10;
    });
  });
}
function closeCoachMarks(){const el=document.getElementById('cm-overlay');if(el)el.classList.remove('show');}

// ── Service Worker 등록 (정적 자산 캐시 / 오프라인 대응) ──
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // 첫 설치인지(=기존 컨트롤러 없음) 새 SW 활성화 후 한 번만 리로드
    const hadController = !!navigator.serviceWorker.controller;
    let _reloaded = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (_reloaded || !hadController) return;
      _reloaded = true;
      location.reload();
    });
    navigator.serviceWorker.register('sw.js').catch(() => {});
  });
}

// ── demo-data.js 지연 로딩 (구경 모드 진입 시점에만) ──
let _demoLoading=null;
function ensureDemoLoaded(){
  if(typeof DEMO!=="undefined")return Promise.resolve();
  if(_demoLoading)return _demoLoading;
  _demoLoading=new Promise((resolve,reject)=>{
    const s=document.createElement("script");
    s.src="demo-data.js?v=2";
    s.onload=()=>resolve();
    s.onerror=()=>reject(new Error("demo-data.js 로드 실패"));
    document.head.appendChild(s);
  });
  return _demoLoading;
}
