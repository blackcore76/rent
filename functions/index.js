const { onSchedule } = require('firebase-functions/v2/scheduler');
const { onRequest } = require('firebase-functions/v2/https');
const { defineString } = require('firebase-functions/params');
const { initializeApp } = require('firebase-admin/app');
const { getDatabase } = require('firebase-admin/database');
const { getMessaging } = require('firebase-admin/messaging');

initializeApp({ databaseURL: 'https://rent-4d521-default-rtdb.firebaseio.com' });

// 수동 테스트 트리거 보호용 (functions/.env 의 TEST_SECRET 값)
const TEST_SECRET = defineString('TEST_SECRET');

// 만료 D-day 몇 일 전에 알릴지 — 각 값마다 유닛당 딱 한 번씩만 발송(중복 방지)
const THRESHOLDS = [30, 14, 7, 3, 1, 0];

const REGION = 'asia-northeast3';

// Cloud Functions 런타임은 기본적으로 UTC라서 new Date().setHours(0,0,0,0)를 쓰면
// KST 자정~오전 9시 사이엔 "오늘"이 실제 한국 날짜보다 하루 전으로 계산되는 버그가 있었음.
// contractEnd("YYYY-MM-DD")는 항상 KST 캘린더 날짜를 의미하므로, "오늘"도 KST 기준
// 캘린더 날짜를 UTC 자정으로 고정해서 같은 기준으로 비교한다.
function kstTodayUTCMidnight() {
  const kst = new Date(Date.now() + 9 * 60 * 60 * 1000);
  return new Date(Date.UTC(kst.getUTCFullYear(), kst.getUTCMonth(), kst.getUTCDate()));
}

async function runExpiryCheck() {
  const db = getDatabase();
  const root = (await db.ref('rent_app').once('value')).val() || {};
  const today = kstTodayUTCMidnight();

  const results = [];

  for (const uid of Object.keys(root)) {
    const userNode = root[uid] || {};

    // 토큰 key(RTDB-safe로 치환된 값) <-> 실제 토큰 문자열 쌍을 순서 보장하며 추출
    const tokenPairs = Object.entries(userNode.fcmTokens || {}).filter(([, v]) => v && v.token);
    if (!tokenPairs.length) continue;
    const tokenKeys = tokenPairs.map(([k]) => k);
    const tokens = tokenPairs.map(([, v]) => v.token);

    for (const bid of Object.keys(userNode)) {
      if (bid === '_buildings' || bid === 'fcmTokens') continue;
      const bldName = userNode._buildings?.[bid]?.name || '';
      const units = userNode[bid]?.units || {};

      for (const roomId of Object.keys(units)) {
        const unit = units[roomId];
        if (!unit || unit.status !== 'rented' || !unit.contractEnd) continue;

        // contractEnd="YYYY-MM-DD" → 그 캘린더 날짜의 UTC 자정으로 명시적으로 고정
        // (런타임 타임존에 의존하지 않도록 today와 동일한 방식으로 앵커링)
        const [ey, em, ed] = unit.contractEnd.split('-').map(Number);
        const end = new Date(Date.UTC(ey, em - 1, ed));
        const dl = Math.round((end - today) / 86400000);

        if (!THRESHOLDS.includes(dl)) continue;
        if (unit.lastNotifiedDl === dl) continue; // 이 임계값으로는 이미 발송함

        const title = dl === 0
          ? `⚠️ 오늘 계약 만료 — ${bldName} ${roomId}호`
          : `⚠️ 계약 만료 D-${dl} — ${bldName} ${roomId}호`;
        const body = `${unit.tenantName || '임차인'} · 만료일 ${unit.contractEnd}`;

        try {
          // data-only 메시지로 보낸다: notification 필드를 넣으면 브라우저가 자체적으로
          // 한 번 자동 표시하고 onBackgroundMessage에서 또 한 번 표시해 알림이 중복되는
          // 문제가 있어서, 표시는 전적으로 클라이언트 코드(onBackgroundMessage/onMessage)가
          // 직접 showNotification을 호출하도록 한다.
          const resp = await getMessaging().sendEachForMulticast({
            tokens,
            data: {
              title,
              body,
              link: `https://plushome.kr/units.html?room=${roomId}`,
            },
            webpush: { headers: { Urgency: 'high' } },
          });

          // 무효화된 토큰 정리 (앱 삭제/알림 차단 등)
          const deadKeys = [];
          resp.responses.forEach((r, i) => {
            const code = r.error?.code;
            if (!r.success && (code === 'messaging/registration-token-not-registered' || code === 'messaging/invalid-registration-token')) {
              deadKeys.push(tokenKeys[i]);
            }
          });
          if (deadKeys.length) {
            const rm = {};
            deadKeys.forEach(k => { rm[k] = null; });
            await db.ref(`rent_app/${uid}/fcmTokens`).update(rm);
          }

          await db.ref(`rent_app/${uid}/${bid}/units/${roomId}/lastNotifiedDl`).set(dl);
          results.push({ uid, bid, roomId, dl, sent: resp.successCount, failed: resp.failureCount });
        } catch (e) {
          results.push({ uid, bid, roomId, dl, error: e.message });
        }
      }
    }
  }

  return results;
}

// 매일 아침 9시(KST) 자동 실행
exports.checkContractExpiry = onSchedule(
  { schedule: 'every day 09:00', timeZone: 'Asia/Seoul', region: REGION },
  async () => {
    const results = await runExpiryCheck();
    console.log('checkContractExpiry:', JSON.stringify(results));
  }
);

// 수동 테스트용 — 브라우저에서 ?key=TEST_SECRET 붙여서 즉시 실행 확인
exports.testContractExpiry = onRequest({ region: REGION }, async (req, res) => {
  if (req.query.key !== TEST_SECRET.value()) {
    res.status(403).send('forbidden');
    return;
  }
  const results = await runExpiryCheck();
  console.log('testContractExpiry:', JSON.stringify(results));
  res.json({ ok: true, count: results.length, results });
});
