// js/home.js
import { auth, currentUser, currentBuilding, currentYearMonth, unitsData, paymentsData, loadData, initAuth } from './common.js';
import { showLoginModal, hideLoginModal, loginWithGoogle, logout } from './auth.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js';

// DOM 요소
const buildingNameInput = document.getElementById('buildingName');
const monthPicker = document.getElementById('monthPicker');
const memoBtn = document.getElementById('memoBtn');
const fabBtn = document.getElementById('fabBtn');
const loginStatus = document.getElementById('loginStatus');
const headerLoginBtn = document.getElementById('headerLoginBtn');

// UI 업데이트
function updateUI(user) {
  if (user) {
    loginStatus.innerHTML = `<img src="${user.photoURL || ''}" onerror="this.style.display='none'"><span>👤 ${user.displayName || user.email}</span>`;
    headerLoginBtn.textContent = '로그아웃';
    headerLoginBtn.className = 'small-logout-btn';
    buildingNameInput.disabled = false;
    memoBtn.disabled = false;
    fabBtn.disabled = false;
  } else {
    loginStatus.innerHTML = '<span>🔓</span><span>로그인이 필요합니다</span>';
    headerLoginBtn.textContent = '로그인';
    headerLoginBtn.className = 'small-login-btn';
    buildingNameInput.disabled = true;
    memoBtn.disabled = true;
    fabBtn.disabled = true;
  }
}

// 대시보드 업데이트
function updateDashboard() {
  const vacantUnits = unitsData.filter(u => u.isVacant);
  document.getElementById('vacancyRate').innerHTML = `${Math.round((vacantUnits.length/unitsData.length)*100)}%`;
  document.getElementById('unpaidCount').innerHTML = `${vacantUnits.length}건`;
  document.getElementById('expiringCount').innerHTML = `0건`;
  document.getElementById('requestCount').innerHTML = `0건`;
  
  const totalRent = unitsData.filter(u => !u.isVacant).reduce((sum, u) => sum + u.rent, 0);
  document.getElementById('monthlyIncome').innerHTML = `₩ ${totalRent.toLocaleString()}`;
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
    // 월 변경 시 처리
    console.log('월 변경:', e.target.value);
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
});

document.getElementById('closeLoginModal')?.addEventListener('click', () => {
  hideLoginModal();
});

// 초기화
initMonthPicker();
initAuth(updateUI);
loadData();
updateDashboard();