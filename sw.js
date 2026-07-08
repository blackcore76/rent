// Service Worker — 월세 관리 앱
// 정적 자산 캐시 + 외부 SDK/폰트 캐시 + Firebase API는 항상 네트워크
// + FCM 백그라운드 푸시 (계약 만료 알림)

const VERSION = 'v4';
const CACHE_NAME = `rent-app-${VERSION}`;

// ══════════════════════════════════════════
// Firebase Cloud Messaging — 백그라운드 알림
// (별도 SW를 등록하면 scope가 겹쳐 충돌하므로 이 SW에 합쳐서 처리)
// ══════════════════════════════════════════
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyBHMCPX13coKBA9cu72K4k9WKYQQjVA7IA",
  authDomain: "rent-4d521.firebaseapp.com",
  databaseURL: "https://rent-4d521-default-rtdb.firebaseio.com",
  projectId: "rent-4d521",
  storageBucket: "rent-4d521.firebasestorage.app",
  messagingSenderId: "922087443394",
  appId: "1:922087443394:web:ff78188fc5ab967287645b"
});
const messaging = firebase.messaging();

messaging.onBackgroundMessage(payload => {
  const { title, body } = payload.notification || {};
  const link = payload.fcmOptions?.link || payload.data?.link || './units.html';
  self.registration.showNotification(title || 'PlusHome', {
    body: body || '',
    icon: './icon-192.png',
    badge: './icon-192.png',
    data: { link },
    tag: 'contract-expiry',
    renotify: true,
  });
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  const link = event.notification.data?.link || './units.html';
  event.waitUntil((async () => {
    // 기존에 열려있는 탭이 있으면 재사용하되, 알림이 가리키는 방(room)으로 반드시 이동시킨다
    // (focus만 하면 그 탭이 이전에 보고 있던 엉뚱한 방 화면 그대로 남아있게 됨)
    const allClients = await clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const client of allClients) {
      if ('navigate' in client) {
        try { await client.navigate(link); } catch (e) {}
        return client.focus();
      }
    }
    return clients.openWindow(link);
  })());
});

// 사전 캐싱할 앱 셸 (첫 설치 시)
const APP_SHELL = [
  './',
  './index.html',
  './units.html',
  './expense.html',
  './admin.html',
  './admin-master.html',
  './backup.html',
  './restore.html',
  './guide.html',
  './common.css?v=1',
  './shared.js?v=2',
  './db-paths.js',
  './manifest.json',
  './favicon.png',
  './icon-192.png',
  './icon-512.png',
  './logo.png',
];

// 캐시 우회 호스트 (실시간 데이터/인증/스토리지 업로드는 절대 캐시 안 함)
const BYPASS_HOSTS = [
  'rent-4d521-default-rtdb.firebaseio.com',
  'firebaseio.com',
  'identitytoolkit.googleapis.com',
  'securetoken.googleapis.com',
  'firebasestorage.googleapis.com',
];

// 캐시 우선 호스트 (Firebase SDK, 폰트 등 거의 안 바뀜)
const CDN_HOSTS = [
  'www.gstatic.com',
  'fonts.googleapis.com',
  'fonts.gstatic.com',
  'cdnjs.cloudflare.com',
];

self.addEventListener('install', e => {
  e.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    // Promise.allSettled → 일부 실패해도 SW 설치 진행
    await Promise.allSettled(
      APP_SHELL.map(url =>
        fetch(url, { cache: 'reload' })
          .then(res => res.ok && cache.put(url, res))
          .catch(() => {})
      )
    );
    return self.skipWaiting();
  })());
});

self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(
      keys
        .filter(k => k.startsWith('rent-app-') && k !== CACHE_NAME)
        .map(k => caches.delete(k))
    );
    await self.clients.claim();
  })());
});

self.addEventListener('message', e => {
  if (e.data === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);

  // 1) 우회: 실시간 DB / 인증 / 스토리지 업로드
  if (BYPASS_HOSTS.some(h => url.hostname === h || url.hostname.endsWith('.' + h))) return;

  // 2) 같은 출처: Stale-While-Revalidate
  if (url.origin === self.location.origin) {
    e.respondWith(swr(e.request));
    return;
  }

  // 3) CDN (Firebase SDK / 폰트): Cache-First
  if (CDN_HOSTS.includes(url.hostname)) {
    e.respondWith(cacheFirst(e.request));
    return;
  }

  // 기본: 네트워크
});

async function swr(req) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(req);
  const network = fetch(req)
    .then(res => {
      if (res && res.ok) cache.put(req, res.clone()).catch(() => {});
      return res;
    })
    .catch(() => cached);
  return cached || network;
}

async function cacheFirst(req) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(req);
  if (cached) return cached;
  try {
    const res = await fetch(req);
    if (res && res.ok) cache.put(req, res.clone()).catch(() => {});
    return res;
  } catch {
    return cached || Response.error();
  }
}
