// easymode-side.js — 이지모드 사이드 버튼 (동적 주입)
// 사용: <script>window.EM_SIDE_ACTION = function(){ ... };</script>
//       <script src="easymode-side.js"></script>
(function () {
  'use strict';
  if (document.getElementById('em-side-btn')) return;

  var action = window.EM_SIDE_ACTION || function(){};

  /* ── CSS ── */
  var s = document.createElement('style');
  s.textContent = `
    #em-side-btn{
      position:fixed;left:-52px;bottom:200px;z-index:500;
      width:80px;padding:16px 6px 16px 8px;
      background:rgba(255,202,40,.8);
      border:1.5px solid rgba(255,202,40,.8);border-left:none;
      border-radius:0 16px 16px 0;
      cursor:pointer;
      transition:left .28s cubic-bezier(.4,0,.2,1);
      box-shadow:2px 2px 12px rgba(0,0,0,.35);
      display:flex;align-items:center;justify-content:flex-end;
      user-select:none;-webkit-tap-highlight-color:transparent;touch-action:manipulation;
    }
    #em-side-btn.peeking{left:0;justify-content:center;}
    @media(hover:hover){#em-side-btn:hover{left:0;justify-content:center;}}
    #em-side-btn.on{background:rgba(255,202,40,.8);}

    #em-side-txt,#em-side-txt-hidden{
      writing-mode:vertical-rl;font-weight:900;color:#000;
      font-family:'Noto Sans KR',sans-serif;
    }
    #em-side-txt{font-size:13px;letter-spacing:3px;display:none;}
    #em-side-txt-hidden{font-size:11px;letter-spacing:2px;}

    #em-side-btn.on #em-side-txt,
    #em-side-btn.on #em-side-txt-hidden{color:#fff;}

    #em-side-btn.peeking #em-side-txt{display:inline;}
    #em-side-btn.peeking #em-side-txt-hidden{display:none;}
    @media(hover:hover){
      #em-side-btn:hover #em-side-txt{display:inline;}
      #em-side-btn:hover #em-side-txt-hidden{display:none;}
    }

    #em-side-ring{
      position:absolute;left:50%;top:50%;
      width:34px;height:34px;margin-left:-17px;margin-top:-17px;
      border:2px solid rgba(0,0,0,.55);border-radius:50%;
      pointer-events:none;display:none;
      animation:emRingPulse 1.5s ease-in-out infinite;
    }
    #em-side-btn.peeking #em-side-ring{display:block;}
    @media(hover:hover){#em-side-btn:hover #em-side-ring{display:block;}}
    #em-side-btn.on #em-side-ring{border-color:rgba(255,255,255,.75);}
    @keyframes emRingPulse{
      0%,100%{transform:scale(1);opacity:.6;}
      50%{transform:scale(1.15);opacity:1;}
    }
  `;
  document.head.appendChild(s);

  /* ── HTML ── */
  var btn = document.createElement('div');
  btn.id = 'em-side-btn';
  btn.innerHTML = '<span id="em-side-txt-hidden">모드전환</span><span id="em-side-txt">이지모드</span><span id="em-side-ring"></span>';
  document.body.appendChild(btn);

  /* ── 터치 / 마우스 분기 ── */
  var peekTimer = null, peeking = false, lastTouchTime = 0;
  var touchStartX = 0, touchStartY = 0, touchMoved = false;

  btn.addEventListener('touchstart', function (e) {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
    touchMoved = false;
  }, { passive: true });

  btn.addEventListener('touchmove', function (e) {
    if (Math.abs(e.touches[0].clientX - touchStartX) > 8 ||
        Math.abs(e.touches[0].clientY - touchStartY) > 8) touchMoved = true;
  }, { passive: true });

  btn.addEventListener('touchend', function (e) {
    if (touchMoved) return;
    e.preventDefault();
    lastTouchTime = Date.now();
    clearTimeout(peekTimer);
    if (peeking) {
      peeking = false;
      btn.classList.remove('peeking');
      action();
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
    if (Date.now() - lastTouchTime < 300) return;
    action();
  });
})();
