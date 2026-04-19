// js/calendar.js
import { auth, currentBuilding, unitsData, loadData, initAuth } from './common.js';
import { showLoginModal, hideLoginModal, loginWithGoogle, logout } from './auth.js';

// DOM 요소
const buildingNameInput = document.getElementById('buildingName');
const monthPicker = document.getElementById('monthPicker');
const memoBtn = document.getElementById('memoBtn');
const loginStatus = document.getElementById('loginStatus');
const headerLoginBtn = document.getElementById('headerLoginBtn');
const calendarGrid = document.getElementById('calendarGrid');
const currentMonthYearSpan = document.getElementById('currentMonthYear');
const eventListContent = document.getElementById('eventListContent');
const prevMonthBtn = document.getElementById('prevMonth');
const nextMonthBtn = document.getElementById('nextMonth');

let currentDate = new Date();

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
  renderCalendar();
}

// 이벤트 수집
function collectEvents() {
  const events = [];
  const today = new Date();
  
  unitsData.forEach(unit => {
    // 입주 예정일
    if (unit.moveInDate) {
      events.push({
        date: unit.moveInDate,
        title: `${unit.number}호 입주`,
        desc: `임차인: ${unit.tenant || '미정'}`,
        type: 'movein',
        unitId: unit.id
      });
    }
    // 퇴실 예정일
    if (unit.moveOutDate) {
      events.push({
        date: unit.moveOutDate,
        title: `${unit.number}호 퇴실`,
        desc: `임차인: ${unit.tenant || '미정'}`,
        type: 'moveout',
        unitId: unit.id
      });
    }
    // 계약 만료일 (임대중인 경우)
    if (!unit.isVacant && unit.contractEnd) {
      const endDate = new Date(unit.contractEnd);
      const daysLeft = Math.ceil((endDate - today) / (1000 * 60 * 60 * 24));
      if (daysLeft <= 30 && daysLeft >= 0) {
        events.push({
          date: unit.contractEnd,
          title: `${unit.number}호 계약만료`,
          desc: `D-${daysLeft} | 임차인: ${unit.tenant || '미정'}`,
          type: 'contract',
          unitId: unit.id
        });
      }
    }
  });
  
  return events;
}

// 캘린더 렌더링
function renderCalendar() {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  
  currentMonthYearSpan.textContent = `${year}년 ${month + 1}월`;
  
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDayOfWeek = firstDay.getDay();
  const totalDays = lastDay.getDate();
  
  const events = collectEvents();
  
  // 요일 헤더
  const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
  let html = weekdays.map(day => `<div class="calendar-weekday">${day}</div>`).join('');
  
  // 빈 칸 채우기
  for (let i = 0; i < startDayOfWeek; i++) {
    html += `<div class="calendar-day"></div>`;
  }
  
  // 날짜 채우기
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  
  for (let day = 1; day <= totalDays; day++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const hasEvent = events.some(e => e.date === dateStr);
    const isToday = dateStr === todayStr;
    
    html += `
      <div class="calendar-day ${isToday ? 'today' : ''} ${hasEvent ? 'has-event' : ''}" data-date="${dateStr}">
        <div class="day-number">${day}</div>
        ${hasEvent ? '<div class="event-dot"></div>' : ''}
      </div>
    `;
  }
  
  calendarGrid.innerHTML = html;
  
  // 날짜 클릭 이벤트
  document.querySelectorAll('.calendar-day[data-date]').forEach(day => {
    day.addEventListener('click', () => {
      const date = day.dataset.date;
      renderEventsForDate(date);
    });
  });
  
  // 기본으로 오늘 날짜 이벤트 표시
  renderEventsForDate(todayStr);
}

// 특정 날짜의 이벤트 표시
function renderEventsForDate(date) {
  const events = collectEvents();
  const dayEvents = events.filter(e => e.date === date);
  
  if (dayEvents.length === 0) {
    eventListContent.innerHTML = '<div style="text-align:center; padding:20px; color:#94a3b8;">📅 등록된 일정이 없습니다</div>';
    return;
  }
  
  eventListContent.innerHTML = dayEvents.map(event => `
    <div class="event-item">
      <div class="event-date">${event.date.split('-').slice(1).join('/')}</div>
      <div class="event-content">
        <div class="event-title">${event.title}</div>
        <div class="event-desc">${event.desc}</div>
      </div>
      <span class="event-badge event-${event.type}">
        ${event.type === 'movein' ? '🏠 입주' : event.type === 'moveout' ? '🚪 퇴실' : '📄 만료'}
      </span>
    </div>
  `).join('');
}

// 월 변경
function changeMonth(delta) {
  currentDate.setMonth(currentDate.getMonth() + delta);
  renderCalendar();
}

// 월 선택기 초기화
function initMonthPicker() {
  const today = new Date();
  for (let i = -5; i <= 5; i++) {
    const date = new Date(today.getFullYear(), today.getMonth() + i, 1);
    const yearMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    monthPicker.innerHTML += `<option value="${yearMonth}">${date.getFullYear()}년 ${date.getMonth()+1}월</option>`;
  }
  monthPicker.value = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
  monthPicker.addEventListener('change', (e) => {
    const [year, month] = e.target.value.split('-');
    currentDate = new Date(parseInt(year), parseInt(month) - 1, 1);
    renderCalendar();
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
  renderCalendar();
});

document.getElementById('closeLoginModal')?.addEventListener('click', () => {
  hideLoginModal();
});

prevMonthBtn.addEventListener('click', () => changeMonth(-1));
nextMonthBtn.addEventListener('click', () => changeMonth(1));

buildingNameInput.addEventListener('change', (e) => {
  if (!auth.currentUser) { showLoginModal(); return; }
  // 건물명 변경 처리
  console.log('건물명 변경:', e.target.value);
});

// 초기화
initMonthPicker();
initAuth(updateUI);
loadData();
renderCalendar();