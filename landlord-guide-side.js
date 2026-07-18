// landlord-guide-side.js — 임대인 가이드 사이드 탭 버튼 (동적 주입)
// 클릭 시 landlord-guide.html로 이동
(function () {
  'use strict';
  if (document.getElementById('lg-side-btn')) return;

  /* ── CSS 주입 ────────────────────────────────────────────── */
  const s = document.createElement('style');
  s.textContent = `
    #lg-side-btn{
      position:fixed;left:-52px;bottom:360px;z-index:500;
      width:80px;padding:16px 6px 16px 8px;
      background:rgba(37,99,235,.85);
      border:1.5px solid rgba(37,99,235,.85);border-left:none;
      border-radius:0 16px 16px 0;
      cursor:pointer;
      transition:left .28s cubic-bezier(.4,0,.2,1);
      box-shadow:2px 2px 12px rgba(0,0,0,.35);
      display:flex;align-items:center;justify-content:flex-end;
      user-select:none;-webkit-tap-highlight-color:transparent;touch-action:manipulation;
    }
    #lg-side-btn.peeking{left:0;justify-content:center;}
    @media(hover:hover){#lg-side-btn:hover{left:0;justify-content:center;}}

    #lg-stxt,#lg-stxt-hid{
      writing-mode:vertical-rl;font-weight:900;color:#fff;
      font-family:'Noto Sans KR',sans-serif;
    }
    #lg-stxt{font-size:12px;letter-spacing:2px;display:none;}
    #lg-stxt-hid{font-size:11px;letter-spacing:2px;}

    #lg-side-btn.peeking #lg-stxt{display:inline;}
    #lg-side-btn.peeking #lg-stxt-hid{display:none;}
    @media(hover:hover){
      #lg-side-btn:hover #lg-stxt{display:inline;}
      #lg-side-btn:hover #lg-stxt-hid{display:none;}
    }

    #lg-side-ring{
      position:absolute;left:50%;top:50%;
      width:32px;height:32px;margin-left:-16px;margin-top:-16px;
      border:2px solid rgba(255,255,255,.7);border-radius:50%;
      pointer-events:none;display:none;
      animation:lgPulse 1.5s ease-in-out infinite;
    }
    #lg-side-btn.peeking #lg-side-ring{display:block;}
    @media(hover:hover){#lg-side-btn:hover #lg-side-ring{display:block;}}
    @keyframes lgPulse{
      0%,100%{transform:scale(1);opacity:.6;}
      50%{transform:scale(1.18);opacity:1;}
    }
  `;
  document.head.appendChild(s);

  /* ── HTML 주입 ───────────────────────────────────────────── */
  const btn = document.createElement('div');
  btn.id = 'lg-side-btn';
  btn.innerHTML = `
    <span id="lg-stxt-hid">가이드</span>
    <span id="lg-stxt">임대가이드</span>
    <span id="lg-side-ring"></span>
  `;
  document.body.appendChild(btn);

  function lgOpen() {
    location.href = 'landlord-guide.html';
  }

  /* ── 사이드 버튼 터치 / 마우스 분기 ─────────────────────── */
  let peeking = false, peekTimer = null;
  let lastTouch = 0, tx = 0, ty = 0, tmoved = false;

  btn.addEventListener('touchstart', function (e) {
    tx = e.touches[0].clientX; ty = e.touches[0].clientY; tmoved = false;
  }, { passive: true });

  btn.addEventListener('touchmove', function (e) {
    if (Math.abs(e.touches[0].clientX - tx) > 8 ||
        Math.abs(e.touches[0].clientY - ty) > 8) tmoved = true;
  }, { passive: true });

  btn.addEventListener('touchend', function (e) {
    if (tmoved) return;
    e.preventDefault();
    lastTouch = Date.now();
    clearTimeout(peekTimer);
    if (peeking) {
      peeking = false;
      btn.classList.remove('peeking');
      lgOpen();
    } else {
      peeking = true;
      btn.classList.add('peeking');
      peekTimer = setTimeout(function () {
        peeking = false;
        btn.classList.remove('peeking');
      }, 2000);
    }
  }, { passive: false });

  btn.addEventListener('click', function () {
    if (Date.now() - lastTouch < 300) return;
    lgOpen();
  });
})();
