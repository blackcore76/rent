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

async function runExpiryCheck() {
  const db = getDatabase();
  const root = (await db.ref('rent_app').once('value')).val() || {};
  const today = new Date();
  today.setHours(0, 0, 0, 0);

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

        const end = new Date(unit.contractEnd);
        end.setHours(0, 0, 0, 0);
        const dl = Math.round((end - today) / 86400000);

        if (!THRESHOLDS.includes(dl)) continue;
        if (unit.lastNotifiedDl === dl) continue; // 이 임계값으로는 이미 발송함

        const title = dl === 0
          ? `⚠️ 오늘 계약 만료 — ${bldName} ${roomId}호`
          : `⚠️ 계약 만료 D-${dl} — ${bldName} ${roomId}호`;
        const body = `${unit.tenantName || '임차인'} · 만료일 ${unit.contractEnd}`;

        try {
          const resp = await getMessaging().sendEachForMulticast({
            tokens,
            notification: { title, body },
            webpush: {
              notification: { icon: 'https://plushome.kr/icon-192.png' },
              fcmOptions: { link: `https://plushome.kr/units.html?room=${roomId}` },
            },
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
  res.json({ ok: true, count: results.length, results });
});
