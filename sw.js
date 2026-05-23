// Service Worker — 월세 관리 앱
// 정적 자산 캐시 + 외부 SDK/폰트 캐시 + Firebase API는 항상 네트워크

const VERSION = 'v1';
const CACHE_NAME = `rent-app-${VERSION}`;

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
