// brokerage-calc.js — 중개수수료 계산기 (사이드 탭 + 바텀 시트)
// 공인중개사법 시행규칙 제20조 기준 요율 적용
(function () {
  'use strict';
  if (document.getElementById('bc-side-btn')) return;

  /* ── CSS 주입 ────────────────────────────────────────────── */
  const s = document.createElement('style');
  s.textContent = `
    #bc-side-btn{
      position:fixed;left:-52px;bottom:280px;z-index:500;
      width:80px;padding:16px 6px 16px 8px;
      background:rgba(5,150,105,.85);
      border:1.5px solid rgba(5,150,105,.85);border-left:none;
      border-radius:0 16px 16px 0;
      cursor:pointer;
      transition:left .28s cubic-bezier(.4,0,.2,1);
      box-shadow:2px 2px 12px rgba(0,0,0,.35);
      display:flex;align-items:center;justify-content:flex-end;
      user-select:none;-webkit-tap-highlight-color:transparent;touch-action:manipulation;
    }
    #bc-side-btn.peeking{left:0;justify-content:center;}
    @media(hover:hover){#bc-side-btn:hover{left:0;justify-content:center;}}

    #bc-stxt,#bc-stxt-hid{
      writing-mode:vertical-rl;font-weight:900;color:#fff;
      font-family:'Noto Sans KR',sans-serif;
    }
    #bc-stxt{font-size:12px;letter-spacing:2px;display:none;}
    #bc-stxt-hid{font-size:11px;letter-spacing:2px;}

    #bc-side-btn.peeking #bc-stxt{display:inline;}
    #bc-side-btn.peeking #bc-stxt-hid{display:none;}
    @media(hover:hover){
      #bc-side-btn:hover #bc-stxt{display:inline;}
      #bc-side-btn:hover #bc-stxt-hid{display:none;}
    }

    #bc-side-ring{
      position:absolute;left:50%;top:50%;
      width:32px;height:32px;margin-left:-16px;margin-top:-16px;
      border:2px solid rgba(255,255,255,.7);border-radius:50%;
      pointer-events:none;display:none;
      animation:bcPulse 1.5s ease-in-out infinite;
    }
    #bc-side-btn.peeking #bc-side-ring{display:block;}
    @media(hover:hover){#bc-side-btn:hover #bc-side-ring{display:block;}}
    @keyframes bcPulse{
      0%,100%{transform:scale(1);opacity:.6;}
      50%{transform:scale(1.18);opacity:1;}
    }

    /* 오버레이 */
    #bc-overlay{
      display:none;position:fixed;inset:0;
      background:rgba(0,0,0,.55);z-index:600;
    }
    #bc-overlay.show{display:block;}

    /* 바텀 시트 */
    #bc-sheet{
      position:fixed;left:0;right:0;bottom:0;z-index:601;
      background:#fff;border-radius:20px 20px 0 0;
      max-height:92vh;max-height:92dvh;
      display:flex;flex-direction:column;
      transform:translateY(100%);
      transition:transform .3s cubic-bezier(.4,0,.2,1);
      box-shadow:0 -4px 32px rgba(0,0,0,.2);
    }
    #bc-sheet.show{transform:translateY(0);}

    .bc-hdr{
      display:flex;align-items:center;justify-content:space-between;
      padding:16px 18px 13px;
      border-bottom:1px solid #E2E8F0;flex-shrink:0;
    }
    .bc-title{font-size:16px;font-weight:900;color:#1E2D3D;}
    .bc-close-x{
      width:32px;height:32px;border-radius:50%;
      background:#F1F5F9;border:none;font-size:16px;
      cursor:pointer;display:flex;align-items:center;justify-content:center;
      color:#64748B;flex-shrink:0;
    }
    .bc-close-x:active{background:#E2E8F0;}

    .bc-body{
      overflow-y:auto;padding:16px 18px 52px;
      -webkit-overflow-scrolling:touch;overscroll-behavior:contain;
    }

    .bc-slbl{
      font-size:11px;font-weight:700;color:#64748B;
      text-transform:uppercase;letter-spacing:.5px;margin:0 0 6px;
    }
    .bc-seg{
      display:flex;border:2px solid #E2E8F0;
      border-radius:10px;overflow:hidden;margin-bottom:14px;
    }
    .bc-sb{
      flex:1;padding:10px 4px;border:none;background:#fff;
      font-size:13px;font-weight:600;cursor:pointer;
      font-family:inherit;color:#64748B;
      transition:background .15s,color .15s;
    }
    .bc-sb.on{background:#059669;color:#fff;}

    .bc-div{height:1px;background:#E2E8F0;margin:14px 0;}

    .bc-field{display:flex;flex-direction:column;gap:4px;margin-bottom:12px;}
    .bc-field label{
      font-size:11px;font-weight:700;color:#64748B;
      letter-spacing:.5px;text-transform:uppercase;
    }
    .bc-iw{position:relative;display:flex;align-items:center;}
    .bc-inp{
      border:2px solid #E2E8F0;border-radius:10px;
      padding:11px 52px 11px 12px;
      font-size:15px;font-family:inherit;outline:none;
      color:#1E293B;background:#FAFCFF;width:100%;
      transition:border-color .2s;font-variant-numeric:tabular-nums;
    }
    .bc-inp:focus{border-color:#0EA5E9;background:#fff;}
    .bc-iunit{
      position:absolute;right:12px;font-size:12px;
      font-weight:700;color:#94A3B8;pointer-events:none;white-space:nowrap;
    }

    .bc-btn{
      width:100%;padding:14px;background:#1E2D3D;color:#fff;
      border:none;border-radius:12px;font-size:15px;font-weight:700;
      cursor:pointer;font-family:inherit;margin-top:4px;
    }
    .bc-btn:active{opacity:.85;}

    /* 결과 카드 */
    #bc-res{
      display:none;margin-top:16px;
      background:linear-gradient(135deg,#064E3B,#047857);
      border-radius:14px;padding:18px 16px 14px;color:#fff;
    }
    #bc-res.show{display:block;}

    .bc-rrow{
      display:flex;align-items:baseline;justify-content:space-between;
      padding:5px 0;border-bottom:1px solid rgba(255,255,255,.1);
    }
    .bc-rrow:last-child{border-bottom:none;}
    .bc-rlbl{font-size:12px;color:rgba(255,255,255,.6);}
    .bc-rval{font-size:13px;font-weight:700;color:#fff;font-variant-numeric:tabular-nums;}

    .bc-rmain{
      display:flex;align-items:baseline;justify-content:space-between;
      margin-top:12px;padding-top:12px;
      border-top:1px solid rgba(255,255,255,.25);
    }
    .bc-rmlbl{font-size:13px;font-weight:700;color:rgba(255,255,255,.8);}
    .bc-rmval{font-size:24px;font-weight:900;color:#6EE7B7;font-variant-numeric:tabular-nums;}

    .bc-rnote{
      font-size:11px;color:rgba(255,255,255,.45);
      margin-top:10px;line-height:1.7;white-space:pre-line;
    }

    #bc-reset-btn{
      display:none;width:100%;padding:11px;
      background:#F1F5F9;color:#64748B;border:none;
      border-radius:10px;font-size:13px;font-weight:700;
      cursor:pointer;font-family:inherit;margin-top:10px;
    }
    #bc-reset-btn:active{background:#E2E8F0;}

    /* 수수료 법령 참조표 */
    .bc-ref-section{margin-top:28px;padding-top:20px;border-top:2px solid #E2E8F0;}
    .bc-ref-title{
      font-size:14px;font-weight:900;color:#1E2D3D;margin-bottom:14px;
      display:flex;align-items:center;gap:6px;
    }
    .bc-ref-title::before{content:'📋';font-size:15px;}
    .bc-ref-tbl{
      width:100%;border-collapse:collapse;font-size:11.5px;
      border:1.5px solid #CBD5E1;border-radius:10px;
      overflow:hidden;margin-bottom:14px;
    }
    .bc-ref-tbl th{
      background:#064E3B;color:#fff;padding:8px 6px;
      font-weight:700;text-align:center;font-size:15px;
      letter-spacing:.3px;border:1px solid #065F46;
    }
    .bc-ref-tbl th span{font-size:12px;}
    .bc-ref-tbl td{
      padding:7px 6px;text-align:center;color:#334155;
      border:1px solid #E2E8F0;font-variant-numeric:tabular-nums;
    }
    .bc-ref-tbl .bc-tbl-cat{
      background:#059669;color:#fff;font-weight:800;
      font-size:11px;text-align:center;writing-mode:vertical-rl;
      letter-spacing:2px;padding:10px 6px;
      border:1px solid #047857;
    }
    .bc-ref-tbl .bc-tbl-subcat{
      background:#ECFDF5;color:#065F46;font-weight:700;
      font-size:11px;text-align:center;
    }
    .bc-ref-tbl tbody tr:nth-child(even) td:not(.bc-tbl-cat):not(.bc-tbl-subcat){
      background:#F8FAFC;
    }
    .bc-ref-tbl tbody tr:hover td:not(.bc-tbl-cat):not(.bc-tbl-subcat){
      background:#F0FDF4;
    }
    .bc-ref-tbl .bc-tbl-section-hdr{
      background:#F1F5F9;font-weight:800;color:#1E2D3D;
      text-align:center;font-size:11.5px;padding:9px 6px;
      border:1px solid #CBD5E1;
    }
    .bc-ref-tbl .bc-tbl-note{
      background:#F8FAFC;color:#64748B;font-size:10.5px;
      text-align:left;padding:8px 10px;line-height:1.6;
    }
    .bc-ref-law{
      display:block;margin-top:12px;padding:12px 14px;
      background:linear-gradient(135deg,#064E3B,#047857);
      border-radius:10px;text-align:center;
      text-decoration:none;color:#fff;
      font-size:12px;font-weight:700;
      transition:opacity .15s;
    }
    .bc-ref-law:active{opacity:.8;}
    .bc-ref-law span{
      display:block;font-size:10.5px;font-weight:400;
      color:rgba(255,255,255,.6);margin-top:4px;
    }
  `;
  document.head.appendChild(s);

  /* ── HTML 주입 ───────────────────────────────────────────── */
  const wrap = document.createElement('div');
  wrap.innerHTML = `
    <div id="bc-side-btn">
      <span id="bc-stxt-hid">수수료</span>
      <span id="bc-stxt">수수료계산</span>
      <span id="bc-side-ring"></span>
    </div>

    <div id="bc-overlay"></div>
    <div id="bc-sheet">
      <div class="bc-hdr">
        <span class="bc-title">🏠 중개수수료 계산기</span>
        <button class="bc-close-x" id="bc-close-x">✕</button>
      </div>
      <div class="bc-body">

        <div class="bc-slbl">물건 종류</div>
        <div class="bc-seg" id="bc-type-seg">
          <button class="bc-sb on" data-t="house">주택</button>
          <button class="bc-sb" data-t="officetel">오피스텔</button>
          <button class="bc-sb" data-t="other">주택 외</button>
        </div>

        <div class="bc-slbl">거래 유형</div>
        <div class="bc-seg" id="bc-deal-seg">
          <button class="bc-sb on" data-d="sale">매매</button>
          <button class="bc-sb" data-d="jeonse">전세</button>
          <button class="bc-sb" data-d="monthly">월세</button>
        </div>

        <div class="bc-div"></div>
        <div id="bc-inputs"></div>

        <button class="bc-btn" id="bc-calc-btn">계산하기</button>

        <div id="bc-res">
          <div id="bc-res-rows"></div>
          <div class="bc-rmain">
            <span class="bc-rmlbl">상한 수수료</span>
            <span class="bc-rmval" id="bc-res-fee">—</span>
          </div>
          <div class="bc-rnote" id="bc-res-note"></div>
        </div>

        <button id="bc-reset-btn">초기화</button>

        <div class="bc-ref-section">
          <div class="bc-ref-title">중개수수료 요율표</div>

        <table class="bc-ref-tbl">
            <thead>
              <tr>
                <th colspan="4">주택의 중개 수수료 <span style="font-weight:400;font-size:11px">(부속토지 포함)</span></th>
              </tr>
              <tr>
                <th style="width:17%"><span style="font-size:13px">거래종류</span></th>
                <th><span style="font-size:13px">거래금액</span></th>
                <th style="width:22%"><span style="font-size:13px">상한요율</span></th>
                <th style="width:18%"><span style="font-size:13px">한도액</span></th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td class="bc-tbl-cat" rowspan="7">임대차 등</td>
                <td>5천만원 미만</td><td>0.5%</td><td>20만원</td>
              </tr>
              <tr><td>5천만원 이상~ 1억원 미만</td><td>0.4%</td><td>30만원</td></tr>
              <tr><td>1억원 이상~ 6억원 미만</td><td>0.3%</td><td>-</td></tr>
              <tr><td>6억원 이상~ 12억원 미만</td><td>0.4%</td><td>-</td></tr>
              <tr><td>12억원 이상~ 15억원 미만</td><td>0.5%</td><td></td></tr>
              <tr><td>15억원 이상</td><td>0.6%</td><td>-</td></tr>
              <tr style="height:0;"><td colspan="3" style="border:none;padding:0;"></td></tr>
              <tr>
                <td class="bc-tbl-cat" rowspan="7">매매·교환</td>
                <td>5천만원 미만</td><td>0.6%</td><td>25만원</td>
              </tr>
              <tr><td>5천만원 이상~ 2억원 미만</td><td>0.5%</td><td>80만원</td></tr>
              <tr><td>2억원 이상~ 9억원 미만</td><td>0.4%</td><td>-</td></tr>
              <tr><td>9억원 이상~ 12억원 미만</td><td>0.5%</td><td>-</td></tr>
              <tr><td>12억원 이상~ 15억원 미만</td><td>0.6%</td><td></td></tr>
              <tr><td>15억원 이상</td><td>0.7%</td><td>-</td></tr>
              <tr style="height:0;"><td colspan="3" style="border:none;padding:0;"></td></tr>
            </tbody>
          </table>

          <table class="bc-ref-tbl">
            <thead>
              <tr>
                <th colspan="3">주거용 오피스텔<br><span style="font-weight:400;font-size:11px">(전용 85㎡ 이하, 전용입식 부엌 및 화장실/목욕시설을 갖출것)</span></th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td class="bc-tbl-subcat" style="width:30%">임대차 등</td>
                <td colspan="2">0.5%</td>
              </tr>
              <tr>
                <td class="bc-tbl-subcat">매매·교환</td>
                <td colspan="2">0.4%</td>
              </tr>
            </tbody>
          </table>

          <table class="bc-ref-tbl">
            <thead>
              <tr>
                <th colspan="2">주택 외의 중개 수수료 <span style="font-weight:400;font-size:11px">(공장·창고 등)</span></th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td class="bc-tbl-subcat" style="width:30%">임대차/매매 등</td>
                <td>0.9% 이내에서 중개의뢰인과 공인중개사간 협의하여 결정</td>
              </tr>
            </tbody>
          </table>

          <a class="bc-ref-law" href="https://www.law.go.kr/LSW/lsSc.do?menuId=1&subMenuId=15&tabMenuId=81&query=%EA%B3%B5%EC%9D%B8%EC%A4%91%EA%B0%9C%EC%82%AC%EB%B2%95%20%EC%8B%9C%ED%96%89%EB%A0%B9%A0%B9#J20:0" target="_blank" rel="noopener noreferrer">
            📖 공인중개사법 시행규칙 제20조 (중개보수 및 실비의 한도 등)
            <span>법령 원문 보기 →</span>
          </a>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(wrap);

  /* ── 상태 ───────────────────────────────────────────────── */
  let bcType = 'house';
  let bcDeal = 'sale';

  const sideBtn  = document.getElementById('bc-side-btn');
  const overlay  = document.getElementById('bc-overlay');
  const sheet    = document.getElementById('bc-sheet');
  const resEl    = document.getElementById('bc-res');
  const resetBtn = document.getElementById('bc-reset-btn');

  /* ── 열기 / 닫기 ─────────────────────────────────────────── */
  function bcOpen() {
    sideBtn.classList.remove('peeking');
    overlay.classList.add('show');
    sheet.classList.add('show');
    document.body.style.overflow = 'hidden';
  }

  function bcClose() {
    overlay.classList.remove('show');
    sheet.classList.remove('show');
    document.body.style.overflow = '';
  }

  document.getElementById('bc-close-x').addEventListener('click', bcClose);
  overlay.addEventListener('click', bcClose);

  /* ── 세그먼트 선택 ───────────────────────────────────────── */
  document.getElementById('bc-type-seg').addEventListener('click', function (e) {
    const b = e.target.closest('.bc-sb');
    if (!b) return;
    bcType = b.dataset.t;
    this.querySelectorAll('.bc-sb').forEach(x => x.classList.remove('on'));
    b.classList.add('on');
    bcClearResult(); bcRenderInputs();
  });

  document.getElementById('bc-deal-seg').addEventListener('click', function (e) {
    const b = e.target.closest('.bc-sb');
    if (!b) return;
    bcDeal = b.dataset.d;
    this.querySelectorAll('.bc-sb').forEach(x => x.classList.remove('on'));
    b.classList.add('on');
    bcClearResult(); bcRenderInputs();
  });

  document.getElementById('bc-calc-btn').addEventListener('click', bcCalc);
  resetBtn.addEventListener('click', function () { bcClearResult(); bcRenderInputs(); });

  /* ── 입력 렌더링 ─────────────────────────────────────────── */
  function bcRenderInputs() {
    const wrap = document.getElementById('bc-inputs');
    if (bcDeal === 'monthly') {
      wrap.innerHTML = `
        <div class="bc-field">
          <label>보증금</label>
          <div class="bc-iw">
            <input class="bc-inp" id="bc-dep" type="text" inputmode="numeric" placeholder="0">
            <span class="bc-iunit">원</span>
          </div>
        </div>
        <div class="bc-field">
          <label>월 임대료</label>
          <div class="bc-iw">
            <input class="bc-inp" id="bc-mo" type="text" inputmode="numeric" placeholder="0">
            <span class="bc-iunit">원/월</span>
          </div>
        </div>`;
    } else {
      wrap.innerHTML = `
        <div class="bc-field">
          <label>${bcDeal === 'sale' ? '매매가' : '전세금'}</label>
          <div class="bc-iw">
            <input class="bc-inp" id="bc-price" type="text" inputmode="numeric" placeholder="0">
            <span class="bc-iunit">원</span>
          </div>
        </div>`;
    }
    wrap.querySelectorAll('.bc-inp').forEach(inp => {
      inp.addEventListener('input', function () {
        const v = this.value.replace(/[^0-9]/g, '');
        this.value = v ? Number(v).toLocaleString('ko-KR') : '';
      });
    });
  }

  /* ── 요율표 (공인중개사법 시행규칙 제20조) ────────────────── */
  const M = 1_000_000;

  function getRate(type, deal, amt) {
    if (type === 'house') {
      if (deal === 'sale') {
        if (amt <   50 * M) return { r: .006, cap: 250_000 };
        if (amt <  200 * M) return { r: .005, cap: 800_000 };
        if (amt <  900 * M) return { r: .004, cap: null };
        if (amt < 1200 * M) return { r: .005, cap: null };
        if (amt < 1500 * M) return { r: .006, cap: null };
        return                     { r: .007, cap: null };
      } else {  /* 임대차 */
        if (amt <   50 * M) return { r: .005, cap: 200_000 };
        if (amt <  100 * M) return { r: .004, cap: 300_000 };
        if (amt <  300 * M) return { r: .003, cap: null };
        if (amt <  600 * M) return { r: .004, cap: null };
        if (amt < 1200 * M) return { r: .005, cap: null };
        if (amt < 1500 * M) return { r: .006, cap: null };
        return                     { r: .007, cap: null };
      }
    }
    if (type === 'officetel') return { r: deal === 'sale' ? .005 : .004, cap: null };
    return { r: deal === 'sale' ? .009 : .008, cap: null }; /* 주택 외 */
  }

  /* ── 계산 ────────────────────────────────────────────────── */
  function parseKRW(id) {
    const el = document.getElementById(id);
    return el ? parseInt(el.value.replace(/[^0-9]/g, '') || '0', 10) : 0;
  }
  function fmt(n) { return n.toLocaleString('ko-KR'); }

  function bcCalc() {
    let price, dep = 0, mo = 0;

    if (bcDeal === 'monthly') {
      dep = parseKRW('bc-dep');
      mo  = parseKRW('bc-mo');
      if (!dep && !mo) { bcAlert('보증금 또는 월 임대료를 입력해주세요.'); return; }
      price = dep + mo * 100;  /* 환산보증금 */
    } else {
      price = parseKRW('bc-price');
      if (!price) { bcAlert(bcDeal === 'sale' ? '매매가를 입력해주세요.' : '전세금을 입력해주세요.'); return; }
    }

    const { r, cap } = getRate(bcType, bcDeal, price);
    let fee = Math.floor(price * r);
    if (cap && fee > cap) fee = cap;
    const feeVat = Math.floor(fee * 1.1);

    let rows = '';
    if (bcDeal === 'monthly') {
      rows += `<div class="bc-rrow"><span class="bc-rlbl">환산 거래금액</span><span class="bc-rval">${fmt(price)}원</span></div>`;
    }
    rows += `<div class="bc-rrow"><span class="bc-rlbl">적용 상한 요율</span><span class="bc-rval">${(r * 100).toFixed(1)}%</span></div>`;
    if (cap) {
      rows += `<div class="bc-rrow"><span class="bc-rlbl">한도액 적용</span><span class="bc-rval">${fmt(cap)}원</span></div>`;
    }
    rows += `<div class="bc-rrow"><span class="bc-rlbl">VAT 포함 (×1.1)</span><span class="bc-rval">${fmt(feeVat)}원</span></div>`;

    document.getElementById('bc-res-rows').innerHTML = rows;
    document.getElementById('bc-res-fee').textContent = fmt(fee) + '원';

    let note = '※ 상한 요율 이내에서 중개사와 협의 가능합니다.';
    if (bcDeal === 'monthly') note += '\n※ 환산보증금 = 보증금 + 월세 × 100';
    if (bcType === 'other')   note += '\n※ 주택 외 물건은 협의 상한 요율 기준입니다.';
    document.getElementById('bc-res-note').textContent = note;

    resEl.classList.add('show');
    resetBtn.style.display = 'block';
    setTimeout(() => resEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 80);
  }

  function bcClearResult() {
    resEl.classList.remove('show');
    resetBtn.style.display = 'none';
  }

  function bcAlert(msg) {
    if (typeof showToast === 'function') showToast(msg);
    else alert(msg);
  }

  /* ── 사이드 버튼 터치 / 마우스 분기 ─────────────────────── */
  (function () {
    var peeking = false, peekTimer = null;
    var lastTouch = 0, tx = 0, ty = 0, tmoved = false;

    sideBtn.addEventListener('touchstart', function (e) {
      tx = e.touches[0].clientX; ty = e.touches[0].clientY; tmoved = false;
    }, { passive: true });

    sideBtn.addEventListener('touchmove', function (e) {
      if (Math.abs(e.touches[0].clientX - tx) > 8 ||
          Math.abs(e.touches[0].clientY - ty) > 8) tmoved = true;
    }, { passive: true });

    sideBtn.addEventListener('touchend', function (e) {
      if (tmoved) return;
      e.preventDefault();
      lastTouch = Date.now();
      clearTimeout(peekTimer);
      if (peeking) {
        peeking = false;
        sideBtn.classList.remove('peeking');
        bcOpen();
      } else {
        peeking = true;
        sideBtn.classList.add('peeking');
        peekTimer = setTimeout(function () {
          peeking = false;
          sideBtn.classList.remove('peeking');
        }, 2000);
      }
    }, { passive: false });

    sideBtn.addEventListener('click', function () {
      if (Date.now() - lastTouch < 300) return;
      bcOpen();
    });
  })();

  /* ── 초기화 ─────────────────────────────────────────────── */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bcRenderInputs);
  } else {
    bcRenderInputs();
  }

})();
