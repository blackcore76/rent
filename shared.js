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
function signInGoogle(){auth.signInWithPopup(gProv).catch(e=>showToast("❗ "+e.message))}

// ── 메뉴 유틸 ──
function toggleMenu(){const el=document.getElementById("user-menu");if(el)el.classList.toggle("show")}
function closeMenu(){const el=document.getElementById("user-menu");if(el)el.classList.remove("show")}
document.addEventListener("click",e=>{if(!e.target.closest("#av-wrap")&&!e.target.closest("#user-menu"))closeMenu()});

// ── HTML 이스케이프 ──
function esc(s){return String(s||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}

// ── 금액 포맷 (만원 단위 → 원 표시) ──
function fmtWon(v){if(!v)return"—";return(v*10000).toLocaleString("ko-KR")+"원"}

// ── 토스트 ──
let tTm;function showToast(m){const t=document.getElementById("toast");t.textContent=m;t.classList.add("show");clearTimeout(tTm);tTm=setTimeout(()=>t.classList.remove("show"),2800)}

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
    const blob=await new Promise(res=>canvas.toBlob(b=>res(b),"image/jpeg",0.82));
    return blob||file;
  }catch{return file;}
}
