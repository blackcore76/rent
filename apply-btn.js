// apply-btn.js — 이용신청 사이드 탭(좌측 상단) + 안내 모달
// 비로그인(구경/로그인화면) 상태에서만 노출. 로그인되면 자동 숨김.
// 목적: 구글 로그인만으로 무심코 사용자 레코드가 생기지 않도록, '이용신청→안내 모달→신청확인'
//       2단계 확인을 거쳐 명시적 사용 의사가 있을 때만 가입(=구글 로그인)되게 한다.
(function () {
  'use strict';
  if (document.getElementById('apply-side-btn')) return;

  /* ── CSS ─────────────────────────────────────────────── */
  const s = document.createElement('style');
  s.textContent = `
    /* 좌측 상단 엣지 부착 — 기존 사이드 탭(세금/수수료 등)과 동일한 peek 방식.
       대기: left:-52px(28px만 삐죽) · 펼침(.peeking/hover): left:0 */
    #apply-side-btn{position:fixed;left:-52px;top:150px;z-index:7100;width:80px;padding:16px 8px 16px 6px;background:linear-gradient(135deg,#0EA5E9,#0284C7);border:1.5px solid #0EA5E9;border-left:none;border-radius:0 16px 16px 0;cursor:pointer;transition:left .28s cubic-bezier(.4,0,.2,1);box-shadow:2px 2px 12px rgba(0,0,0,.35);display:flex;align-items:center;justify-content:flex-end;user-select:none;-webkit-tap-highlight-color:transparent;touch-action:manipulation}
    #apply-side-btn.peeking{left:0;justify-content:center}
    @media(hover:hover){#apply-side-btn:hover{left:0;justify-content:center}}
    #apply-stxt,#apply-stxt-hid{writing-mode:vertical-rl;font-weight:900;color:#fff;font-family:'Noto Sans KR',sans-serif}
    #apply-stxt{font-size:12px;letter-spacing:2px;display:none}
    #apply-stxt-hid{font-size:11px;letter-spacing:2px}
    #apply-side-btn.peeking #apply-stxt{display:inline}
    #apply-side-btn.peeking #apply-stxt-hid{display:none}
    @media(hover:hover){#apply-side-btn:hover #apply-stxt{display:inline}#apply-side-btn:hover #apply-stxt-hid{display:none}}
    #apply-side-ring{position:absolute;left:50%;top:50%;width:32px;height:32px;margin-left:-16px;margin-top:-16px;border:2px solid rgba(255,255,255,.7);border-radius:50%;pointer-events:none;display:none;animation:applyPulse 1.5s ease-in-out infinite}
    #apply-side-btn.peeking #apply-side-ring{display:block}
    @media(hover:hover){#apply-side-btn:hover #apply-side-ring{display:block}}
    @keyframes applyPulse{0%,100%{transform:scale(1);opacity:.6}50%{transform:scale(1.18);opacity:1}}

    #apply-overlay{display:none;position:fixed;inset:0;background:rgba(0,0,0,.55);z-index:7200;align-items:center;justify-content:center;padding:18px;overflow-y:auto}
    #apply-overlay.show{display:flex}
    #apply-modal{background:#fff;border-radius:20px;width:100%;max-width:400px;box-shadow:0 20px 60px rgba(0,0,0,.4);transform:translateY(14px) scale(.98);opacity:0;transition:transform .26s cubic-bezier(.4,0,.2,1),opacity .26s;max-height:92vh;max-height:92dvh;display:flex;flex-direction:column;font-family:'Noto Sans KR',system-ui,-apple-system,sans-serif}
    #apply-overlay.show #apply-modal{transform:translateY(0) scale(1);opacity:1}
    .apply-hdr{display:flex;align-items:center;justify-content:space-between;padding:17px 18px 14px;border-bottom:1px solid #E2E8F0;flex-shrink:0}
    .apply-title{font-size:16px;font-weight:900;color:#1E2D3D;display:flex;align-items:center;gap:7px}
    .apply-close-x{width:32px;height:32px;border-radius:50%;background:#F1F5F9;border:none;font-size:16px;cursor:pointer;display:flex;align-items:center;justify-content:center;color:#64748B;flex-shrink:0}
    .apply-close-x:active{background:#E2E8F0}
    .apply-body{overflow-y:auto;padding:16px 18px 18px;-webkit-overflow-scrolling:touch}
    .apply-intro{font-size:13px;color:#334155;line-height:1.7;margin-bottom:16px}
    .apply-intro b{color:#0284C7}
    .apply-steps{display:flex;flex-direction:column;gap:11px;margin-bottom:16px}
    .apply-step{display:flex;align-items:flex-start;gap:10px}
    .apply-step .n{flex-shrink:0;width:22px;height:22px;border-radius:50%;background:#E0F2FE;color:#0284C7;font-size:12px;font-weight:900;display:flex;align-items:center;justify-content:center}
    .apply-step .t{font-size:13px;color:#1E293B;line-height:1.5}
    .apply-step .t b{color:#0F172A}
    .apply-step .t .sub{font-size:11.5px;color:#94A3B8}
    .apply-note{background:#F0F9FF;border:1px solid #BAE6FD;border-radius:11px;padding:12px 13px;font-size:12px;color:#075985;line-height:1.65;margin-bottom:16px}
    .apply-note b{color:#0C4A6E}
    .apply-cta{display:flex;align-items:center;justify-content:center;gap:8px;width:100%;box-sizing:border-box;padding:14px;background:linear-gradient(135deg,#0EA5E9,#0284C7);color:#fff;font-size:14px;font-weight:900;border:none;border-radius:12px;cursor:pointer;font-family:inherit}
    .apply-cta:active{filter:brightness(.94)}
    .apply-later{display:block;width:100%;margin-top:9px;padding:11px;background:transparent;border:none;color:#94A3B8;font-size:12.5px;font-weight:700;cursor:pointer;font-family:inherit}
    .apply-foot{text-align:center;font-size:10.5px;color:#94A3B8;margin-top:12px;line-height:1.6}
  `;
  document.head.appendChild(s);

  /* ── 이용신청 사이드 버튼 ─────────────────────────────── */
  const btn = document.createElement('div');
  btn.id = 'apply-side-btn';
  btn.setAttribute('role', 'button');
  btn.setAttribute('aria-label', '이용신청');
  btn.style.display = 'none'; // 인증 상태 확인 전까지 숨김
  btn.innerHTML =
    '<span id="apply-side-ring"></span>' +
    '<span id="apply-stxt">이용신청</span>' +
    '<span id="apply-stxt-hid">이용신청</span>';
  document.body.appendChild(btn);

  /* ── 안내 모달 ────────────────────────────────────────── */
  const ov = document.createElement('div');
  ov.id = 'apply-overlay';
  ov.innerHTML = `
    <div id="apply-modal" role="dialog" aria-modal="true" aria-label="플러스홈 이용 신청">
      <div class="apply-hdr">
        <div class="apply-title">🏠 플러스홈 이용 신청</div>
        <button class="apply-close-x" aria-label="닫기">✕</button>
      </div>
      <div class="apply-body">
        <div class="apply-intro">
          <b>플러스홈</b>은 월세·임대 현황을 한 곳에서 관리하는 <b>무료</b> 서비스예요<br>
          아래 순서대로 입력하면 바로 사용할 수 있어요(일부 유료 기능)
        </div>
        <div class="apply-steps">
          <div class="apply-step"><span class="n">1</span><span class="t"><b>🗂 관리 탭</b>에서 <b>임대 건물 목록</b> 작성으로 시작해요<br><span class="sub">해당 건물 명칭 · 층수 · 호실 등</span></span></div>
          <div class="apply-step"><span class="n">2</span><span class="t"><b>🏠 세대 탭</b>에서 호실과 임대 현황을 입력해요</span></div>
          <div class="apply-step"><span class="n">3</span><span class="t"><b>💸 장부 탭</b>에서 월세 · 수입 · 지출을 기록해요</span></div>
        </div>
        <div class="apply-note">
          아래 <b>신청확인</b>을 누르면 <b>구글 계정으로 로그인</b>되고, 이름·이메일로 사용자 등록이 이뤄져요
          그때부터 바로 이용할 수 있어요 <br><b>승인 대기 없이 즉시 시작!</b>
        </div>
        <button class="apply-cta">✅ 신청확인 · 구글로 시작하기</button>
        <button class="apply-later">나중에 할게요</button>
        <div class="apply-foot">모든 저장 데이터는 사용자가 직접 백업해야 해요<br>개인정보는 본인 확인용(이름·이메일)으로만 사용해요</div>
      </div>
    </div>`;
  document.body.appendChild(ov);

  function openModal() { btn.classList.remove('peeking'); ov.classList.add('show'); }
  function closeModal() { ov.classList.remove('show'); }

  /* 사이드 버튼 터치/마우스 분기 — 기존 사이드 탭과 동일한 패턴(brokerage-calc):
     모바일 첫 탭=펼침(2초 후 자동 닫힘)·둘째 탭=열기 / 데스크톱 hover=펼침·click=열기 */
  (function () {
    var peeking = false, peekTimer = null, lastTouch = 0, tx = 0, ty = 0, tmoved = false;
    btn.addEventListener('touchstart', function (e) {
      tx = e.touches[0].clientX; ty = e.touches[0].clientY; tmoved = false;
    }, { passive: true });
    btn.addEventListener('touchmove', function (e) {
      if (Math.abs(e.touches[0].clientX - tx) > 8 || Math.abs(e.touches[0].clientY - ty) > 8) tmoved = true;
    }, { passive: true });
    btn.addEventListener('touchend', function (e) {
      if (tmoved) return;
      e.preventDefault();
      lastTouch = Date.now();
      clearTimeout(peekTimer);
      if (peeking) { peeking = false; btn.classList.remove('peeking'); openModal(); }
      else {
        peeking = true; btn.classList.add('peeking');
        peekTimer = setTimeout(function () { peeking = false; btn.classList.remove('peeking'); }, 2000);
      }
    }, { passive: false });
    btn.addEventListener('click', function () {
      if (Date.now() - lastTouch < 300) return;
      openModal();
    });
  })();

  ov.querySelector('.apply-close-x').addEventListener('click', closeModal);
  ov.querySelector('.apply-later').addEventListener('click', closeModal);
  ov.addEventListener('click', e => { if (e.target === ov) closeModal(); });
  ov.querySelector('.apply-cta').addEventListener('click', () => {
    closeModal();
    if (typeof signInGoogle === 'function') signInGoogle();
    else if (typeof auth !== 'undefined' && typeof gProv !== 'undefined')
      auth.signInWithPopup(gProv).catch(() => {});
  });

  /* ── 인증 상태에 따라 노출/숨김 ─────────────────────────
     비로그인(로그인 화면 · 구경 모드) → 표시,  로그인 → 숨김 */
  function setVisible(v) {
    btn.style.display = v ? 'flex' : 'none';
    if (!v) closeModal();
  }
  try {
    if (typeof firebase !== 'undefined' && firebase.auth) {
      firebase.auth().onAuthStateChanged(u => { setVisible(!u); });
    } else {
      setVisible(true); // 인증 라이브러리 없으면 일단 표시
    }
  } catch (e) {
    setVisible(true);
  }
})();
