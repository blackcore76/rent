// js/payments.js
import { auth, currentBuilding, currentYearMonth, unitsData, paymentsData, loadData, getPaymentStatus, setPaymentStatus, initAuth } from './common.js';
import { showLoginModal, hideLoginModal, loginWithGoogle, logout } from './auth.js';

// DOM 요소
const buildingNameInput = document.getElementById('buildingName');
const monthPicker = document.getElementById('monthPicker');
const memoBtn = document.getElementById('memoBtn');
const loginStatus = document.getElementById('loginStatus');
const headerLoginBtn = document.getElementById('headerLoginBtn');
const paymentContainer = document.getElementById('paymentContainer');

// UI 업데이트
function updateUI(user) {
  if (user) {
    loginStatus.innerHTML = `<img src="${user.photoURL || ''}" onerror="this.style.display='none'"><span>👤 ${user.displayName || user.email}</span>`;
    headerLoginBtn.textContent = '로그아웃';
    headerLoginBtn.className = 'small-logout-btn';
    buildingNameInput.disabled = false;
    memoBtn.disabled = false;
  } else {
    loginStatus.innerHTML = '<span>🔓</span><span>로그인이 필요합니다</span>';
    headerLoginBtn.textContent = '로그인';
    headerLoginBtn.className = 'small-login-btn';
    buildingNameInput.disabled = true;
    memoBtn.disabled = true;
  }
  updatePaymentView();
}

// 납부 관리 화면 업데이트
function updatePaymentView() {
  const occupiedUnits = unitsData.filter(u => !u.isVacant);
  
  if (occupiedUnits.length === 0) {
    paymentContainer.innerHTML = '<div style="text-align:center; padding:40px; color:#94a3b8;">📭 임대중인 세대가 없습니다</div>';
    return;
  }
  
  paymentContainer.innerHTML = `
    <h3 style="margin-bottom:16px;">💰 ${currentYearMonth} 월세 납부 현황</h3>
    <div style="background:#f8fafc; border-radius:16px; padding:8px;">
      ${occupiedUnits.map(unit => {
        const isPaid = getPaymentStatus(unit.id, currentYearMonth);
        return `
          <div class="payment-unit-item">
            <div><strong>${unit.number}호</strong><br><small>${unit.tenant || '미기입'}</small></div>
            <div>
              <span class="payment-badge ${isPaid ? 'payment-paid' : 'payment-unpaid'}">
                ${isPaid ? '✅ 납부완료' : '❌ 미납'}
              </span>
              <button class="toggle-payment" data-id="${unit.id}" ${!auth.currentUser ? 'disabled' : ''}>
                ${isPaid ? '미납으로 변경' : '납부완료로 변경'}
              </button>
            </div>
          </div>
        `;
      }).join('')}
    </div>
    <div class="form-group" style="margin-top:16px;">
      <label>📝 월별 한줄 메모</label>
      <textarea id="monthlyMemo" rows="2" placeholder="이번달 특이사항을 입력하세요..." ${!auth.currentUser ? 'disabled' : ''}></textarea>
      <button id="saveMonthlyMemo" class="btn-primary" style="margin-top:8px; width:100%;" ${!auth.currentUser ? 'disabled' : ''}>메모 저장</button>
    </div>
  `;
  
  // 저장된 월별 메모 불러오기
  const savedMemo = localStorage.getItem(`monthly_memo_${currentBuilding}_${currentYearMonth}`) || '';
  const monthlyMemo = document.getElementById('monthlyMemo');
  if (monthlyMemo) monthlyMemo.value = savedMemo;
  
  // 납부 상태 토글 버튼
  document.querySelectorAll('.toggle-payment').forEach(btn => {
    btn.addEventListener('click', () => {
      if (!auth.currentUser) { showLoginModal(); return; }
      const unitId = btn.dataset.id;
      const currentStatus = getPaymentStatus(unitId, currentYearMonth);
      setPaymentStatus(unitId, currentYearMonth, !currentStatus);
      updatePaymentView();
    });
  });
  
  // 월별 메모 저장
  const saveBtn = document.getElementById('saveMonthlyMemo');
  if (saveBtn) {
    saveBtn.addEventListener('click', () => {
      if (!auth.currentUser) { showLoginModal(); return; }
      const memo = document.getElementById('monthlyMemo').value;
      localStorage.setItem(`monthly_memo_${currentBuilding}_${currentYearMonth}`, memo);
      alert('메모가 저장되었습니다!');
    });
  }
}

// 월 선택기 초기화
function initMonthPicker() {
  const today = new Date();
  for (let i = -5; i <= 5; i++) {
    const date = new Date(today.getFullYear(), today.getMonth() + i, 1);
    const yearMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    monthPicker.innerHTML += `<option value="${yearMonth}">${date.getFullYear()}년 ${date.getMonth()+1}월</option>`;
  }
  monthPicker.value = currentYearMonth;
  monthPicker.addEventListener('change', (e) => {
    window.currentYearMonth = e.target.value;
    updatePaymentView();
  });
}

// 이벤트 리스너
headerLoginBtn.addEventListener('click', () => {
  if (auth.currentUser) {
    logout();
  } else {
    showLoginModal();
  }
});

document.getElementById('googleLoginBtn')?.addEventListener('click', async () => {
  await loginWithGoogle();
  updatePaymentView();
});

document.getElementById('closeLoginModal')?.addEventListener('click', () => {
  hideLoginModal();
});

// 초기화
initMonthPicker();
initAuth(updateUI);
loadData();
updatePaymentView();