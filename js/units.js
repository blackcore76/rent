// js/units.js
import { auth, currentUser, currentBuilding, currentYearMonth, unitsData, paymentsData, loadData, saveUnitsData, setPaymentStatus, initAuth } from './common.js';
import { showLoginModal, hideLoginModal, loginWithGoogle, logout } from './auth.js';

// DOM 요소
const buildingNameInput = document.getElementById('buildingName');
const monthPicker = document.getElementById('monthPicker');
const memoBtn = document.getElementById('memoBtn');
const fabBtn = document.getElementById('fabBtn');
const loginStatus = document.getElementById('loginStatus');
const headerLoginBtn = document.getElementById('headerLoginBtn');
const unitListContainer = document.getElementById('unitListContainer');

let tempPhotos = [];
let editingUnitId = null;

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
  showUnitList();
}

// 세대 목록 표시
function showUnitList() {
  if (!unitsData || unitsData.length === 0) {
    unitListContainer.innerHTML = '<div style="text-align:center; padding:40px; color:#94a3b8;">📭 등록된 세대가 없습니다<br><small>+ 버튼을 눌러 추가하세요</small></div>';
    return;
  }
  
  unitListContainer.innerHTML = unitsData.map(unit => `
    <div class="unit-list-item">
      <div class="unit-list-header">
        <span class="unit-number-badge">🏠 ${unit.number}호</span>
        <span class="unit-status ${unit.isVacant ? 'status-vacant' : 'status-occupied'}">
          ${unit.isVacant ? '🔴 공실' : '🟢 임대중'}
        </span>
      </div>
      <div class="unit-info">
        <div><strong>임차인</strong><br>${unit.tenant || '-'}</div>
        <div><strong>연락처</strong><br>${unit.phone1 || '-'}${unit.phone2 ? `<br>${unit.phone2}` : ''}</div>
        <div><strong>월세/보증금</strong><br>${unit.rent.toLocaleString()} / ${unit.deposit.toLocaleString()}</div>
        <div><strong>계약기간</strong><br>${unit.contractStart || '-'} ~ ${unit.contractEnd || '-'}</div>
      </div>
      ${unit.memo ? `<div style="font-size:12px; color:#64748b; margin-bottom:12px;">📝 ${unit.memo}</div>` : ''}
      ${unit.photos?.length ? `<div style="font-size:12px; color:#2563eb;">📎 계약서 ${unit.photos.length}장</div>` : ''}
      <div class="unit-actions">
        <button class="btn-secondary edit-unit" data-id="${unit.id}" ${!auth.currentUser ? 'disabled' : ''}>✏️ 수정</button>
        <button class="btn-danger delete-unit" data-id="${unit.id}" ${!auth.currentUser ? 'disabled' : ''}>🗑️ 삭제</button>
      </div>
    </div>
  `).join('');
  
  // 수정 버튼 이벤트
  document.querySelectorAll('.edit-unit').forEach(btn => {
    btn.addEventListener('click', () => openEditUnitForm(btn.dataset.id));
  });
  
  // 삭제 버튼 이벤트
  document.querySelectorAll('.delete-unit').forEach(btn => {
    btn.addEventListener('click', () => deleteUnit(btn.dataset.id));
  });
}

// 세대 저장
function saveUnit() {
  if (!auth.currentUser) { showLoginModal(); return; }
  
  const unitNumber = document.getElementById('unitNumber').value;
  if (!unitNumber) { alert('호수를 선택해주세요!'); return; }
  
  const isVacant = document.querySelector('#statusToggle .toggle-btn.active').dataset.status === 'vacant';
  
  const unitData = {
    id: unitNumber,
    number: unitNumber,
    tenant: document.getElementById('tenantName').value,
    phone1: document.getElementById('phone1').value,
    phone2: document.getElementById('phone2').value,
    deposit: parseInt(document.getElementById('depositAmount').value) || 0,
    rent: parseInt(document.getElementById('rentAmount').value) || 0,
    contractStart: document.getElementById('contractStart').value,
    contractEnd: document.getElementById('contractEnd').value,
    moveInDate: document.getElementById('moveInDate').value || null,
    moveOutDate: document.getElementById('moveOutDate').value || null,
    memo: document.getElementById('unitMemo').value,
    isVacant: isVacant,
    photos: tempPhotos,
    requests: []
  };
  
  const index = unitsData.findIndex(u => u.id === unitNumber);
  if (index !== -1) {
    unitsData[index] = { ...unitsData[index], ...unitData };
  } else {
    unitsData.push(unitData);
  }
  
  if (!isVacant) {
    const isPaid = document.querySelector('#paymentToggle .toggle-btn.active').dataset.payment === 'paid';
    setPaymentStatus(unitNumber, currentYearMonth, isPaid);
  }
  
  saveUnitsData();
  closeUnitFormModal();
  showUnitList();
  alert('저장되었습니다!');
}

// 세대 수정 폼 열기
function openEditUnitForm(unitId) {
  if (!auth.currentUser) { showLoginModal(); return; }
  
  const unit = unitsData.find(u => u.id === unitId);
  if (!unit) return;
  
  editingUnitId = unitId;
  tempPhotos = [...(unit.photos || [])];
  
  document.getElementById('unitFormTitle').innerText = '✏️ 세대 정보 수정';
  document.getElementById('unitNumber').value = unit.number;
  document.getElementById('unitNumber').disabled = true;
  document.getElementById('tenantName').value = unit.tenant || '';
  document.getElementById('phone1').value = unit.phone1 || '';
  document.getElementById('phone2').value = unit.phone2 || '';
  document.getElementById('depositAmount').value = unit.deposit;
  document.getElementById('rentAmount').value = unit.rent;
  document.getElementById('contractStart').value = unit.contractStart || '';
  document.getElementById('contractEnd').value = unit.contractEnd || '';
  document.getElementById('moveInDate').value = unit.moveInDate || '';
  document.getElementById('moveOutDate').value = unit.moveOutDate || '';
  document.getElementById('unitMemo').value = unit.memo || '';
  
  const statusBtn = unit.isVacant ? '[data-status="vacant"]' : '[data-status="occupied"]';
  document.querySelector(`#statusToggle .toggle-btn${statusBtn}`).click();
  
  if (!unit.isVacant) {
    const currentPaid = true; // 기본값
    const paymentBtn = currentPaid ? '[data-payment="paid"]' : '[data-payment="unpaid"]';
    document.querySelector(`#paymentToggle .toggle-btn${paymentBtn}`).click();
  }
  
  updatePhotoPreview();
  document.getElementById('unitFormModal').classList.add('active');
}

// 세대 삭제
function deleteUnit(unitId) {
  if (!auth.currentUser) { showLoginModal(); return; }
  if (confirm('정말 삭제하시겠습니까?')) {
    const index = unitsData.findIndex(u => u.id === unitId);
    if (index !== -1) {
      unitsData.splice(index, 1);
      saveUnitsData();
      showUnitList();
    }
  }
}

// 폼 닫기
function closeUnitFormModal() {
  tempPhotos = [];
  editingUnitId = null;
  document.getElementById('unitFormTitle').innerText = '➕ 세대 정보 입력';
  document.getElementById('unitNumber').value = '';
  document.getElementById('unitNumber').disabled = false;
  document.getElementById('tenantName').value = '';
  document.getElementById('phone1').value = '';
  document.getElementById('phone2').value = '';
  document.getElementById('depositAmount').value = '5000000';
  document.getElementById('rentAmount').value = '500000';
  document.getElementById('contractStart').value = '';
  document.getElementById('contractEnd').value = '';
  document.getElementById('moveInDate').value = '';
  document.getElementById('moveOutDate').value = '';
  document.getElementById('unitMemo').value = '';
  document.getElementById('photoPreview').innerHTML = '';
  document.querySelector('#statusToggle .toggle-btn[data-status="vacant"]').click();
  document.getElementById('unitFormModal').classList.remove('active');
}

// 사진 처리
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
  });
}

function updatePhotoPreview() {
  const previewDiv = document.getElementById('photoPreview');
  previewDiv.innerHTML = tempPhotos.map((photo, index) => `
    <div class="photo-item" data-index="${index}">
      <img src="${photo}" alt="계약서">
      <button class="photo-delete" data-index="${index}">×</button>
    </div>
  `).join('');
  
  document.querySelectorAll('.photo-item').forEach(item => {
    item.addEventListener('click', (e) => {
      if (e.target.classList.contains('photo-delete')) return;
      const img = item.querySelector('img');
      document.getElementById('viewerImage').src = img.src;
      document.getElementById('imageViewer').classList.add('active');
    });
  });
  
  document.querySelectorAll('.photo-delete').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (!auth.currentUser) { showLoginModal(); return; }
      const index = parseInt(btn.dataset.index);
      tempPhotos.splice(index, 1);
      updatePhotoPreview();
    });
  });
}

function setupPhotoUpload() {
  const uploadArea = document.getElementById('photoUploadArea');
  const photoInput = document.getElementById('photoInput');
  
  uploadArea.addEventListener('click', () => {
    if (!auth.currentUser) { showLoginModal(); return; }
    photoInput.click();
  });
  
  photoInput.addEventListener('change', async (e) => {
    if (!auth.currentUser) { showLoginModal(); return; }
    for (const file of Array.from(e.target.files)) {
      if (file.type.startsWith('image/')) {
        tempPhotos.push(await fileToBase64(file));
      }
    }
    updatePhotoPreview();
    photoInput.value = '';
  });
}

// 토글 버튼 초기화
function initToggles() {
  const statusBtns = document.querySelectorAll('#statusToggle .toggle-btn');
  const paymentBtns = document.querySelectorAll('#paymentToggle .toggle-btn');
  
  statusBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      if (!auth.currentUser) { showLoginModal(); return; }
      statusBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const isVacant = btn.dataset.status === 'vacant';
      document.getElementById('paymentToggleGroup').style.display = isVacant ? 'none' : 'block';
    });
  });
  
  paymentBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      if (!auth.currentUser) { showLoginModal(); return; }
      paymentBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });
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
  showUnitList();
});

document.getElementById('closeLoginModal')?.addEventListener('click', () => {
  hideLoginModal();
});

buildingNameInput.addEventListener('change', (e) => {
  if (!auth.currentUser) { showLoginModal(); return; }
  // 건물명 변경 처리
  console.log('건물명 변경:', e.target.value);
});

fabBtn.addEventListener('click', () => {
  if (!auth.currentUser) { showLoginModal(); return; }
  closeUnitFormModal();
  document.getElementById('unitFormModal').classList.add('active');
});

document.getElementById('saveUnitBtn')?.addEventListener('click', saveUnit);
document.getElementById('closeUnitFormBtn')?.addEventListener('click', closeUnitFormModal);
document.getElementById('imageViewer')?.addEventListener('click', () => {
  document.getElementById('imageViewer').classList.remove('active');
});

// 초기화
initMonthPicker();
setupPhotoUpload();
initToggles();
initAuth(updateUI);
loadData();
showUnitList();