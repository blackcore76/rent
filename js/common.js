// js/common.js
import { auth, db } from './firebase-config.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js';
import { doc, getDoc, setDoc } from 'https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js';

// 스토리지 키
const STORAGE_KEYS = { 
  BUILDINGS: 'building_data', 
  UNITS: 'units_data', 
  MEMO: 'memo_data', 
  PAYMENTS: 'payments_data' 
};

// 전역 변수
let currentUser = null;
let currentBuilding = '조아빌';
let currentYearMonth = '2026-04';
let unitsData = [];
let paymentsData = {};

// 기본 세대 생성
function generateDefaultUnits() {
  const units = [];
  [2,3,4].forEach(floor => {
    [1,2,3,4,5,6].forEach(num => {
      const unitNum = `${floor}0${num}`;
      units.push({
        id: unitNum, number: unitNum, tenant: '', phone1: '', phone2: '',
        rent: 500000, deposit: 5000000, contractStart: '', contractEnd: '',
        isVacant: true, moveInDate: null, moveOutDate: null, memo: '', photos: []
      });
    });
  });
  return units;
}

// 데이터 로드
function loadData() {
  const savedBuilding = localStorage.getItem(`${STORAGE_KEYS.BUILDINGS}_${currentYearMonth}`);
  if (savedBuilding) { currentBuilding = savedBuilding; }
  
  const savedUnits = localStorage.getItem(`${STORAGE_KEYS.UNITS}_${currentBuilding}`);
  if (savedUnits && savedUnits !== '[]') {
    unitsData = JSON.parse(savedUnits);
  } else {
    unitsData = generateDefaultUnits();
    saveUnitsData();
  }
  
  const savedPayments = localStorage.getItem(`${STORAGE_KEYS.PAYMENTS}_${currentBuilding}`);
  paymentsData = savedPayments ? JSON.parse(savedPayments) : {};
}

function saveUnitsData() {
  localStorage.setItem(`${STORAGE_KEYS.UNITS}_${currentBuilding}`, JSON.stringify(unitsData));
}

function savePaymentsData() {
  localStorage.setItem(`${STORAGE_KEYS.PAYMENTS}_${currentBuilding}`, JSON.stringify(paymentsData));
}

function getPaymentStatus(unitId, yearMonth) {
  return paymentsData[yearMonth]?.[unitId] ?? true;
}

function setPaymentStatus(unitId, yearMonth, isPaid) {
  if (!paymentsData[yearMonth]) paymentsData[yearMonth] = {};
  paymentsData[yearMonth][unitId] = isPaid;
  savePaymentsData();
}

// 인증 상태 감지
function initAuth(updateUIFunction) {
  onAuthStateChanged(auth, (user) => {
    currentUser = user;
    loadData();
    if (updateUIFunction) updateUIFunction(user);
  });
}

export { 
  auth, db, STORAGE_KEYS,
  currentUser, currentBuilding, currentYearMonth, unitsData, paymentsData,
  generateDefaultUnits, loadData, saveUnitsData, savePaymentsData,
  getPaymentStatus, setPaymentStatus, initAuth
};