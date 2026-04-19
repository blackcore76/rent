// js/firebase-config.js
import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js';
import { getAuth, GoogleAuthProvider } from 'https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js';

// 🔥 여기에 본인 Firebase 프로젝트 정보를 입력하세요!
const firebaseConfig = {
  apiKey: "AIzaSyBHMCPX13coKBA9cu72K4k9WKYQQjVA7IA",
  authDomain: "rent-4d521.firebaseapp.com",
  projectId: "rent-4d521",
  storageBucket: "rent-4d521.firebasestorage.app",
  messagingSenderId: "922087443394",
  appId: "1:922087443394:web:37c0c13c62431b1a87645b"
};

// 초기화
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
const db = getFirestore(app);

export { auth, provider, db };