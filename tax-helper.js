// tax-helper.js — 세금 도우미 (사이드 탭 + 바텀 시트)
// 부동산 임대소득 세금 참고용 안내 + 대략 계산. 장부(월세)가 있으면 자동 반영.
(function () {
  'use strict';
  if (document.getElementById('taxh-side-btn')) return;

  /* ── CSS 주입 (시트 내부는 항상 라이트) ─────────────────── */
  const s = document.createElement('style');
  s.textContent = `
    #taxh-side-btn{position:fixed;left:-52px;bottom:200px;z-index:500;width:80px;padding:16px 6px 16px 8px;background:rgba(217,119,6,.9);border:1.5px solid rgba(217,119,6,.9);border-left:none;border-radius:0 16px 16px 0;cursor:pointer;transition:left .28s cubic-bezier(.4,0,.2,1);box-shadow:2px 2px 12px rgba(0,0,0,.35);display:flex;align-items:center;justify-content:flex-end;user-select:none;-webkit-tap-highlight-color:transparent;touch-action:manipulation}
    #taxh-side-btn.peeking{left:0;justify-content:center}
    @media(hover:hover){#taxh-side-btn:hover{left:0;justify-content:center}}
    #taxh-stxt,#taxh-stxt-hid{writing-mode:vertical-rl;font-weight:900;color:#fff;font-family:'Noto Sans KR',sans-serif}
    #taxh-stxt{font-size:12px;letter-spacing:2px;display:none}
    #taxh-stxt-hid{font-size:11px;letter-spacing:2px}
    #taxh-side-btn.peeking #taxh-stxt{display:inline}
    #taxh-side-btn.peeking #taxh-stxt-hid{display:none}
    @media(hover:hover){#taxh-side-btn:hover #taxh-stxt{display:inline}#taxh-side-btn:hover #taxh-stxt-hid{display:none}}
    #taxh-side-ring{position:absolute;left:50%;top:50%;width:32px;height:32px;margin-left:-16px;margin-top:-16px;border:2px solid rgba(255,255,255,.7);border-radius:50%;pointer-events:none;display:none;animation:taxhPulse 1.5s ease-in-out infinite}
    #taxh-side-btn.peeking #taxh-side-ring{display:block}
    @media(hover:hover){#taxh-side-btn:hover #taxh-side-ring{display:block}}
    @keyframes taxhPulse{0%,100%{transform:scale(1);opacity:.6}50%{transform:scale(1.18);opacity:1}}

    #taxh-overlay{display:none;position:fixed;inset:0;background:rgba(0,0,0,.55);z-index:600}
    #taxh-overlay.show{display:block}
    #taxh-sheet{position:fixed;left:0;right:0;bottom:0;z-index:601;background:#fff;border-radius:20px 20px 0 0;max-height:92vh;max-height:92dvh;display:flex;flex-direction:column;transform:translateY(100%);transition:transform .3s cubic-bezier(.4,0,.2,1);box-shadow:0 -4px 32px rgba(0,0,0,.2)}
    #taxh-sheet.show{transform:translateY(0)}
    .taxh-hdr{display:flex;align-items:center;justify-content:space-between;padding:16px 18px 13px;border-bottom:1px solid #E2E8F0;flex-shrink:0}
    .taxh-title{font-size:16px;font-weight:900;color:#1E2D3D;display:flex;align-items:center;gap:7px}
    .taxh-title .taxh-ref{font-size:10px;font-weight:800;color:#D97706;border:1px solid #D97706;border-radius:8px;padding:1px 6px}
    .taxh-close-x{width:32px;height:32px;border-radius:50%;background:#F1F5F9;border:none;font-size:16px;cursor:pointer;display:flex;align-items:center;justify-content:center;color:#64748B;flex-shrink:0}
    .taxh-close-x:active{background:#E2E8F0}
    .taxh-body{overflow-y:auto;padding:16px 18px 52px;-webkit-overflow-scrolling:touch;overscroll-behavior:contain}
    .taxh-in{max-width:540px;margin:0 auto}

    .taxh-note{background:#FEF3C7;border:1px solid #FCD9A5;color:#92400E;font-size:12px;line-height:1.65;border-radius:10px;padding:11px 13px;margin-bottom:14px}
    .taxh-controls{display:flex;gap:10px;margin-bottom:10px;flex-wrap:wrap}
    .taxh-field{display:flex;flex-direction:column;gap:5px;flex:1;min-width:130px}
    .taxh-field>label{font-size:10px;font-weight:700;color:#64748B;text-transform:uppercase;letter-spacing:.4px}
    .taxh-field select{border:2px solid #E2E8F0;border-radius:9px;padding:10px 11px;font-size:14px;font-family:inherit;background:#fff;color:#1E293B;outline:none}
    .taxh-field select:focus{border-color:#0EA5E9}
    .taxh-toggle{display:flex;border:2px solid #E2E8F0;border-radius:9px;overflow:hidden}
    .taxh-tg{flex:1;padding:10px 6px;border:none;background:#fff;font-size:14px;font-weight:700;color:#64748B;cursor:pointer;font-family:inherit}
    .taxh-tg.on{background:#1E2D3D;color:#fff}
    .taxh-rent-box{display:flex;align-items:center;gap:8px;flex-wrap:wrap;background:#F8FAFC;border:1px solid #E2E8F0;border-radius:11px;padding:11px 13px;margin-bottom:10px}
    .taxh-rent-box .trb-lbl{font-size:12px;font-weight:700;color:#64748B;flex:1;min-width:150px;line-height:1.4}
    .taxh-rent-box input{width:140px;border:2px solid #E2E8F0;border-radius:9px;padding:9px 11px;font-size:15px;font-weight:800;text-align:right;font-family:inherit;color:#1E293B;outline:none;background:#fff;font-variant-numeric:tabular-nums}
    .taxh-rent-box input:focus{border-color:#0EA5E9}
    .taxh-rent-box .trb-reset{font-size:11px;font-weight:700;padding:8px 11px;border:1px solid #E2E8F0;border-radius:9px;background:#fff;color:#64748B;cursor:pointer;font-family:inherit;white-space:nowrap}
    .taxh-rent-box .trb-reset:active{background:#F1F5F9}
    .taxh-reg{display:flex;align-items:center;gap:8px;font-size:13px;font-weight:600;color:#1E293B;margin-bottom:14px;cursor:pointer;user-select:none;-webkit-user-select:none}
    .taxh-reg input{width:18px;height:18px;accent-color:#1E2D3D;flex-shrink:0}
    .taxh-result{background:#fff;border:1px solid #E2E8F0;border-radius:13px;padding:15px;margin-bottom:14px;box-shadow:0 2px 12px rgba(0,0,0,.05)}
    .taxh-badge{display:inline-block;font-size:11px;font-weight:800;padding:3px 9px;border-radius:8px;margin-bottom:11px}
    .taxh-badge.ok{background:#D1FAE5;color:#065F46}
    .taxh-badge.warn{background:#FEF3C7;color:#92400E}
    .taxh-row{display:flex;justify-content:space-between;align-items:center;font-size:13.5px;padding:5px 0;color:#64748B;gap:10px}
    .taxh-row b{color:#1E293B;font-weight:800;font-variant-numeric:tabular-nums}
    .taxh-row.sub{font-size:12.5px;color:#94A3B8}
    .taxh-row.sub span:last-child{font-variant-numeric:tabular-nums}
    .taxh-total{display:flex;justify-content:space-between;align-items:center;border-top:2px solid #E2E8F0;margin-top:9px;padding-top:11px;gap:10px}
    .taxh-total .tt-lbl{font-size:13.5px;font-weight:800;color:#1E2D3D}
    .taxh-total .tt-val{font-size:21px;font-weight:900;color:#DC2626;white-space:nowrap;font-variant-numeric:tabular-nums}
    .taxh-mini{font-size:11.5px;line-height:1.7;color:#94A3B8;margin-top:11px}
    .taxh-mini b{color:#64748B}
    .taxh-vat{background:#E0F2FE;border:1px solid #BAE6FD;border-radius:11px;padding:12px 13px;margin-bottom:13px}
    .taxh-vat .tv-t{font-size:12px;font-weight:800;color:#0C4A6E;margin-bottom:5px}
    .taxh-vat .tv-v{font-size:18px;font-weight:900;color:#0C4A6E;font-variant-numeric:tabular-nums}
    .taxh-vat .tv-n{font-size:11.5px;color:#0C4A6E;opacity:.9;margin-top:6px;line-height:1.55}
    .taxh-cal-t{font-size:12.5px;font-weight:800;color:#64748B;margin:6px 0 8px}
    .taxh-cal-row{display:flex;gap:11px;align-items:flex-start;padding:9px 0;border-top:1px solid #E2E8F0}
    .taxh-cal-when{font-size:12px;font-weight:800;color:#1E2D3D;background:#F0F4F8;border-radius:8px;padding:4px 9px;white-space:nowrap;flex-shrink:0;min-width:54px;text-align:center}
    .taxh-cal-txt{font-size:12.5px;color:#1E293B;line-height:1.5}
    .taxh-cal-txt .tc-sub{color:#94A3B8;font-size:11.5px}
  `;
  document.head.appendChild(s);

  /* ── HTML 주입 ───────────────────────────────────────────── */
  const wrap = document.createElement('div');
  wrap.innerHTML = `
    <div id="taxh-side-btn">
      <span id="taxh-stxt-hid">세금</span>
      <span id="taxh-stxt">세금도우미</span>
      <span id="taxh-side-ring"></span>
    </div>
    <div id="taxh-overlay"></div>
    <div id="taxh-sheet">
      <div class="taxh-hdr">
        <span class="taxh-title">🧾 세금 도우미 <span class="taxh-ref">참고용</span></span>
        <button class="taxh-close-x" id="taxh-close-x">✕</button>
      </div>
      <div class="taxh-body"><div class="taxh-in" id="taxh-content"></div></div>
    </div>
  `;
  document.body.appendChild(wrap);

  /* ── 상태 ───────────────────────────────────────────────── */
  let _thType = 'house', _thReg = false, _thRentOv = null,
      _thYear = String(new Date().getFullYear()), _thBuilt = false;

  const overlay = document.getElementById('taxh-overlay');
  const sheet   = document.getElementById('taxh-sheet');
  const sideBtn = document.getElementById('taxh-side-btn');

  /* ── 장부(월세) 데이터 접근 — 있는 페이지에서만 자동 반영 ── */
  function thData() {
    return {
      rh: (typeof rentHistData !== 'undefined' && rentHistData) ? rentHistData : {},
      u:  (typeof unitsData    !== 'undefined' && unitsData)    ? unitsData    : {},
      tx: (typeof allTx        !== 'undefined' && allTx)        ? allTx        : []
    };
  }
  function thAnnualRent(year) {
    const { rh, u, tx } = thData();
    let sum = 0; const unitsLoaded = Object.keys(u).length > 0;
    Object.entries(rh).forEach(([roomId, roomH]) => {
      if (unitsLoaded && !u[roomId]) return;
      Object.entries(roomH || {}).forEach(([ym, rec]) => {
        if (!ym || !ym.startsWith(year)) return;
        if (!rec || (!rec.paid && !rec.partial)) return;
        sum += rec.amount || (u[roomId] && u[roomId].monthlyRent || 0) * 10000 || 0;
      });
    });
    tx.forEach(t => {
      if (!t || t.type !== 'income' || !t.date || !t.date.startsWith(year)) return;
      if ((t.category || '').includes('월세')) sum += t.amount || 0;
    });
    return sum;
  }
  function thAnnualExpense(year) {
    return thData().tx.filter(t => t && t.type === 'expense' && t.date && t.date.startsWith(year))
      .reduce((s, t) => s + (t.amount || 0), 0);
  }
  function thHasLedger() { const d = thData(); return d.tx.length > 0 || Object.keys(d.rh).length > 0; }

  /* ── 시트 본문 만들기 ────────────────────────────────────── */
  function buildTaxh() {
    const nowY = new Date().getFullYear();
    let opts = '';
    for (let y = nowY; y >= nowY - 4; y--) opts += `<option value="${y}"${String(y) === _thYear ? ' selected' : ''}>${y}년</option>`;
    const autoHint = thHasLedger() ? '월세 기준 자동합산 · 관리비/보증금 제외' : '직접 입력하세요 (장부 페이지에선 자동 반영)';
    document.getElementById('taxh-content').innerHTML = `
      <div class="taxh-note">⚠️ 아래 금액은 이해를 돕기 위한 <b>대략적인 참고용</b> 계산이에요. 실제 세액은 다른 소득·공제·감면에 따라 달라집니다. 정확한 금액은 <b>홈택스</b>나 <b>세무사</b>로 확인하세요.</div>
      <div class="taxh-controls">
        <div class="taxh-field"><label>연도</label><select id="taxh-year">${opts}</select></div>
        <div class="taxh-field"><label>물건 유형</label>
          <div class="taxh-toggle">
            <button class="taxh-tg on" id="taxh-tg-h">🏠 주택</button>
            <button class="taxh-tg" id="taxh-tg-s">🏢 상가</button>
          </div>
        </div>
      </div>
      <div class="taxh-rent-box">
        <span class="trb-lbl">연간 임대수입<br><span style="font-size:10px;font-weight:600;color:#94A3B8">${autoHint}</span></span>
        <input type="text" id="taxh-rent" inputmode="numeric" placeholder="0">
        <button class="trb-reset" id="taxh-reset">↺ 자동</button>
      </div>
      <label class="taxh-reg" id="taxh-reg-wrap"><input type="checkbox" id="taxh-reg">임대사업자(렌트홈) 등록됨<span style="font-size:10px;color:#94A3B8"> · 필요경비·공제↑</span></label>
      <div class="taxh-result" id="taxh-result"></div>
      <div id="taxh-cal"></div>`;
    // 리스너
    document.getElementById('taxh-year').addEventListener('change', e => {
      _thYear = e.target.value; _thRentOv = null; setRentInput(); recalcTaxh();
    });
    document.getElementById('taxh-tg-h').addEventListener('click', () => setType('house'));
    document.getElementById('taxh-tg-s').addEventListener('click', () => setType('store'));
    document.getElementById('taxh-reg').addEventListener('change', e => { _thReg = e.target.checked; recalcTaxh(); });
    const rentInp = document.getElementById('taxh-rent');
    rentInp.addEventListener('input', function () {
      const v = this.value.replace(/[^0-9]/g, '');
      this.value = v ? Number(v).toLocaleString('ko-KR') : '';
      _thRentOv = parseInt(v || '0', 10);
      recalcTaxh();
    });
    document.getElementById('taxh-reset').addEventListener('click', () => { _thRentOv = null; setRentInput(); recalcTaxh(); });
    _thBuilt = true;
  }
  function setType(t) {
    _thType = t;
    document.getElementById('taxh-tg-h').classList.toggle('on', t === 'house');
    document.getElementById('taxh-tg-s').classList.toggle('on', t === 'store');
    document.getElementById('taxh-reg-wrap').style.display = t === 'house' ? 'flex' : 'none';
    recalcTaxh();
  }
  function setRentInput() {
    const inp = document.getElementById('taxh-rent'); if (!inp) return;
    const v = _thRentOv != null ? _thRentOv : thAnnualRent(_thYear);
    inp.value = v ? Number(v).toLocaleString('ko-KR') : '';
  }

  const fmt = n => (n || 0).toLocaleString('ko-KR');

  // 종합소득세 누진세율(2023~) — 이 소득만 단독 계산 시의 대략치
  function thComp(income) {
    const B = [[14000000,.06,0],[50000000,.15,1260000],[88000000,.24,5760000],[150000000,.35,15440000],[300000000,.38,19940000],[500000000,.40,25940000],[1000000000,.42,35940000],[Infinity,.45,65940000]];
    let rate = .06, ded = 0;
    for (const [cap, r, d] of B) { if (income <= cap) { rate = r; ded = d; break; } }
    const tax = Math.max(0, Math.round(income * rate - ded)), local = Math.round(tax * 0.1);
    return { tax, local, total: tax + local };
  }
  function recalcTaxh() {
    if (!_thBuilt) return;
    const rent = _thRentOv != null ? _thRentOv : thAnnualRent(_thYear);
    const res = document.getElementById('taxh-result');
    if (!rent) {
      res.innerHTML = `<div class="taxh-mini" style="text-align:center;padding:8px 0">${_thYear}년 임대수입이 없어요.<br>위 칸에 연간 임대수입을 직접 입력해 확인해 보세요.</div>`;
      renderTaxhCal(); return;
    }
    let html = '';
    if (_thType === 'house') {
      if (rent <= 20000000) {
        const er = _thReg ? 0.6 : 0.5, ded = _thReg ? 4000000 : 2000000;
        const income = Math.round(rent * (1 - er)), base = Math.max(0, income - ded);
        const tax = Math.round(base * 0.14), local = Math.round(tax * 0.1), total = tax + local;
        html = `<span class="taxh-badge ok">연 2천만원 이하 · 분리과세(14%) 선택 가능</span>
          <div class="taxh-row"><span>연간 임대수입</span><b>${fmt(rent)}원</b></div>
          <div class="taxh-row sub"><span>− 필요경비 (${_thReg ? '60' : '50'}%)</span><span>−${fmt(rent - income)}원</span></div>
          <div class="taxh-row sub"><span>− 기본공제</span><span>−${fmt(ded)}원</span></div>
          <div class="taxh-row"><span>과세표준</span><b>${fmt(base)}원</b></div>
          <div class="taxh-row sub"><span>소득세 (14%)</span><span>${fmt(tax)}원</span></div>
          <div class="taxh-row sub"><span>지방소득세 (10%)</span><span>${fmt(local)}원</span></div>
          <div class="taxh-total"><span class="tt-lbl">예상 세금 합계</span><span class="tt-val">${fmt(total)}원</span></div>
          <div class="taxh-mini">• 다른 소득과 합치는 <b>종합과세</b>가 더 유리하면 그쪽을 선택할 수도 있어요.<br>• 임대사업자로 등록하면 세액감면(30~75%)이 추가될 수 있어요.<br>• 기본공제 200만원은 임대 외 종합소득이 2천만원 이하일 때 적용돼요.</div>`;
      } else {
        const er = _thReg ? 0.6 : 0.5, income = Math.round(rent * (1 - er)), c = thComp(income);
        html = `<span class="taxh-badge warn">연 2천만원 초과 · 종합과세 대상</span>
          <div class="taxh-row"><span>연간 임대수입</span><b>${fmt(rent)}원</b></div>
          <div class="taxh-row sub"><span>− 필요경비 추정 (${_thReg ? '60' : '50'}%)</span><span>−${fmt(rent - income)}원</span></div>
          <div class="taxh-row"><span>임대 소득금액</span><b>${fmt(income)}원</b></div>
          <div class="taxh-total"><span class="tt-lbl">이 소득만 단독 계산 시</span><span class="tt-val">약 ${fmt(c.total)}원</span></div>
          <div class="taxh-mini">• 종합과세는 <b>근로·사업 등 다른 소득과 합산</b>해 누진세율(6~45%)이 적용돼요. 실제 세금은 위 금액보다 <b>더 나올 수 있어요.</b><br>• 정확한 계산은 세무사 상담을 권장해요.</div>`;
      }
    } else {
      const vat = Math.round(rent * 0.1), exp = thAnnualExpense(_thYear), income = Math.max(0, rent - exp), c = thComp(income);
      html = `<div class="taxh-vat"><div class="tv-t">부가가치세 (상가)</div><div class="tv-v">연 약 ${fmt(vat)}원</div><div class="tv-n">임대료의 10%예요. 보통 세입자에게 <b>따로 받아서</b> 납부하니 임대인 부담은 아니에요. 매년 <b>1월·7월</b> 신고. 간이과세자는 다를 수 있어요.</div></div>
        <span class="taxh-badge warn">상가 임대소득 · 종합과세 대상</span>
        <div class="taxh-row"><span>연간 임대수입</span><b>${fmt(rent)}원</b></div>
        <div class="taxh-row sub"><span>− 장부상 지출 (${_thYear}년)</span><span>−${fmt(exp)}원</span></div>
        <div class="taxh-row"><span>임대 소득금액</span><b>${fmt(income)}원</b></div>
        <div class="taxh-total"><span class="tt-lbl">이 소득만 단독 계산 시</span><span class="tt-val">약 ${fmt(c.total)}원</span></div>
        <div class="taxh-mini">• 상가는 금액과 무관하게 <b>종합과세</b>예요(다른 소득과 합산, 6~45%). 실제 세금은 더 나올 수 있어요.<br>• 필요경비는 장부의 지출 합계로 잡았어요(장부 페이지 기준). 실제 인정 경비와 다를 수 있어요.<br>• 정확한 계산은 세무사 상담을 권장해요.</div>`;
    }
    res.innerHTML = html;
    renderTaxhCal();
  }
  function renderTaxhCal() {
    const el = document.getElementById('taxh-cal'); if (!el) return;
    const rows = [
      ['5월', '종합소득세 신고·납부', '작년 한 해 임대소득을 신고해요 (홈택스)'],
      ['7·9월', '재산세', '지자체가 고지서를 보내줘요. 직접 계산할 필요 없어요'],
    ];
    if (_thType === 'store') rows.push(['1·7월', '부가가치세 신고', '상가 임대는 반기마다 신고해요']);
    rows.push(['12월', '종합부동산세', '보유 부동산 공시가 합계가 기준을 넘으면 대상이에요']);
    el.innerHTML = `<div class="taxh-cal-t">🗓 세금 달력</div>` + rows.map(r =>
      `<div class="taxh-cal-row"><span class="taxh-cal-when">${r[0]}</span><span class="taxh-cal-txt">${r[1]}<br><span class="tc-sub">${r[2]}</span></span></div>`).join('');
  }

  /* ── 열기 / 닫기 ─────────────────────────────────────────── */
  function thOpen() {
    sideBtn.classList.remove('peeking');
    if (!_thBuilt) buildTaxh();
    if (_thRentOv == null) setRentInput();   // 열 때마다 최신 장부 반영
    recalcTaxh();
    overlay.classList.add('show');
    sheet.classList.add('show');
    document.body.style.overflow = 'hidden';
  }
  function thClose() {
    overlay.classList.remove('show');
    sheet.classList.remove('show');
    document.body.style.overflow = '';
  }
  document.getElementById('taxh-close-x').addEventListener('click', thClose);
  overlay.addEventListener('click', thClose);

  /* ── 사이드 버튼 터치 / 마우스 분기 (brokerage-calc 패턴) ── */
  (function () {
    var peeking = false, peekTimer = null, lastTouch = 0, tx = 0, ty = 0, tmoved = false;
    sideBtn.addEventListener('touchstart', function (e) {
      tx = e.touches[0].clientX; ty = e.touches[0].clientY; tmoved = false;
    }, { passive: true });
    sideBtn.addEventListener('touchmove', function (e) {
      if (Math.abs(e.touches[0].clientX - tx) > 8 || Math.abs(e.touches[0].clientY - ty) > 8) tmoved = true;
    }, { passive: true });
    sideBtn.addEventListener('touchend', function (e) {
      if (tmoved) return;
      e.preventDefault();
      lastTouch = Date.now();
      clearTimeout(peekTimer);
      if (peeking) { peeking = false; sideBtn.classList.remove('peeking'); thOpen(); }
      else {
        peeking = true; sideBtn.classList.add('peeking');
        peekTimer = setTimeout(function () { peeking = false; sideBtn.classList.remove('peeking'); }, 2000);
      }
    }, { passive: false });
    sideBtn.addEventListener('click', function () {
      if (Date.now() - lastTouch < 300) return;
      thOpen();
    });
  })();

})();
