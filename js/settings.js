// js/settings.js
import { auth, currentBuilding, unitsData, paymentsData, loadData, saveUnitsData, savePaymentsData, initAuth } from './common.js';
import { showLoginModal, hideLoginModal, loginWithGoogle, logout } from './auth.js';

// DOM 요소
const buildingNameInput = document.getElementById('buildingName');
const monthPicker = document.getElementById('monthPicker');
const memoBtn = document.getElementById('memoBtn');
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
  } else {
    loginStatus.innerHTML = '<span>🔓</span><span>로그인이 필요합니다</span>';
    headerLoginBtn.textContent = '로그인';
    headerLoginBtn.className = 'small-login-btn';
    buildingNameInput.disabled = true;
    memoBtn.disabled = true;
  }
}

// 데이터 내보내기
function exportData() {
  const data = {
    building: currentBuilding,
    units: unitsData,
    payments: paymentsData,
    exportDate: new Date().toISOString()
  };
  
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `backup_${currentBuilding}_${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
  alert('데이터가 내보내졌습니다!');
}

// 데이터 가져오기
function importData(file) {
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target.result);
      
      if (data.units) {
        localStorage.setItem(`units_data_${data.building || currentBuilding}`, JSON.stringify(data.units));
      }
      if (data.payments) {
        localStorage.setItem(`payments_data_${data.building || currentBuilding}`, JSON.stringify(data.payments));
      }
      
      alert('데이터를 가져왔습니다. 페이지를 새로고침합니다.');
      location.reload();
    } catch (error) {
      alert('잘못된 파일 형식입니다.');
    }
  };
  reader.readAsText(file);
}

// 데이터 초기화
function resetAllData() {
  if (confirm('⚠️ 정말 모든 데이터를 초기화하시겠습니까?\n\n이 작업은 되돌릴 수 없습니다!')) {
    if (confirm('마지막 확인입니다. 모든 데이터가 영구 삭제됩니다.')) {
      localStorage.clear();
      alert('모든 데이터가 초기화되었습니다. 페이지를 새로고침합니다.');
      location.reload();
    }
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

document.getElementById('exportDataBtn')?.addEventListener('click', () => {
  if (!auth.currentUser) { showLoginModal(); return; }
  exportData();
});

document.getElementById('importDataBtn')?.addEventListener('click', () => {
  if (!auth.currentUser) { showLoginModal(); return; }
  document.getElementById('importFile').click();
});

document.getElementById('importFile')?.addEventListener('change', (e) => {
  if (e.target.files[0]) {
    importData(e.target.files[0]);
  }
});

document.getElementById('resetDataBtn')?.addEventListener('click', () => {
  if (!auth.currentUser) { showLoginModal(); return; }
  resetAllData();
});

buildingNameInput.addEventListener('change', (e) => {
  if (!auth.currentUser) { showLoginModal(); return; }
  console.log('건물명 변경:', e.target.value);
});

// 초기화
initMonthPicker();
initAuth(updateUI);
loadData();