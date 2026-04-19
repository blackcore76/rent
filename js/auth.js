// js/auth.js
import { auth, provider } from './firebase-config.js';
import { signInWithPopup, signOut } from 'https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js';

// 로그인 모달 표시
function showLoginModal() {
  const modal = document.getElementById('loginModal');
  if (modal) modal.classList.add('active');
}

function hideLoginModal() {
  const modal = document.getElementById('loginModal');
  if (modal) modal.classList.remove('active');
}

// Google 로그인
async function loginWithGoogle() {
  try {
    const result = await signInWithPopup(auth, provider);
    hideLoginModal();
    return result.user;
  } catch (error) {
    console.error('로그인 에러:', error);
    alert('로그인에 실패했습니다.');
    return null;
  }
}

// 로그아웃
async function logout() {
  await signOut(auth);
}

export { showLoginModal, hideLoginModal, loginWithGoogle, logout };