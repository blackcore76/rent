// PlusHome 만료 임박 + 신규 승인 대기 알림 스크립트
// GitHub Actions cron으로 실행 — 08:00 / 12:00 / 16:00 / 20:00 KST
const admin = require('firebase-admin');
const https = require('https');

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID   = process.env.TELEGRAM_CHAT_ID;

// Firebase 초기화 (base64 디코딩 — 줄바꿈 문제 원천 차단)
const serviceAccount = JSON.parse(
  Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT, 'base64').toString('utf8')
);
admin.initializeApp({
  credential:  admin.credential.cert(serviceAccount),
  databaseURL: 'https://rent-4d521-default-rtdb.firebaseio.com',
});
const db = admin.database();

async function main() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const dateStr = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, '0'),
    String(today.getDate()).padStart(2, '0'),
  ].join('-');

  // 현재 KST 시각 (UTC+9)
  const nowUTC = new Date();
  const kstHour = ((nowUTC.getUTCHours() + 9) % 24);
  const timeStr = `${String(kstHour).padStart(2, '0')}:${String(nowUTC.getUTCMinutes()).padStart(2, '0')}`;

  // ── 1. 만료 임박 조회 ─────────────────────────────────────────────
  const usersSnap = await db.ref('master_admin/users').once('value');
  const users = Object.values(usersSnap.val() || {});

  const notesSnap = await db.ref('master_admin/expiry_notes').once('value');
  const notes = notesSnap.val() || {};

  const expiryResults = [];

  for (const u of users) {
    const bldsSnap = await db.ref(`rent_app/${u.uid}/_buildings`).once('value');
    const blds = bldsSnap.val() || { main: { name: '건물' } };

    const userItems = [];

    for (const [bid, bld] of Object.entries(blds)) {
      const [uSnap, rlSnap] = await Promise.all([
        db.ref(`rent_app/${u.uid}/${bid}/units`).once('value'),
        db.ref(`rent_app/${u.uid}/${bid}/config/roomLayout`).once('value'),
      ]);

      const units   = Object.values(uSnap.val() || {});
      const rl      = rlSnap.val() || null;
      const rlRooms = rl ? new Set(Object.values(rl).flat().map(String)) : null;

      const filtered = (rlRooms ? units.filter(x => rlRooms.has(String(x.room))) : units)
        .filter(x => x.status === 'rented' && x.contractEnd);

      for (const x of filtered) {
        const end = new Date(x.contractEnd);
        end.setHours(0, 0, 0, 0);
        const dl = Math.ceil((end - today) / 864e5);
        if (dl < 0 || dl > 30) continue;
        if (notes[u.uid]?.[bid]?.[String(x.room)]?.dismissed) continue;

        userItems.push({
          bldName: bld.name || bid,
          room:    x.room,
          tenant:  x.tenantName || '(미등록)',
          end:     x.contractEnd,
          dl,
        });
      }
    }

    if (userItems.length) {
      userItems.sort((a, b) => a.dl - b.dl);
      expiryResults.push({ name: u.name, items: userItems });
    }
  }

  // ── 2. 신규 승인 대기 조회 ────────────────────────────────────────
  const pendingSnap = await db.ref('_users').once('value');
  const pendingAll  = pendingSnap.val() || {};
  const pendingList = Object.values(pendingAll)
    .filter(u => (u.status || 'pending') === 'pending')
    .sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));

  // ── 3. 메세지 조합 ────────────────────────────────────────────────
  let msg = `🏠 <b>PlusHome 알림</b>  ${dateStr} ${timeStr} KST\n`;
  msg += `━━━━━━━━━━━━━━━━━━━━\n\n`;

  // 만료 임박
  msg += `📋 <b>계약 만료 임박 (30일 이내)</b>\n`;
  if (!users.length) {
    msg += `  ℹ️ 등록된 관리 사용자 없음\n`;
  } else if (!expiryResults.length) {
    msg += `  ✅ 만료 임박 없음\n`;
  } else {
    const total = expiryResults.reduce((s, r) => s + r.items.length, 0);
    for (const r of expiryResults) {
      msg += `  👤 <b>${esc(r.name)}</b>\n`;
      for (const it of r.items) {
        const flag = it.dl <= 7 ? ' 🔴' : it.dl <= 14 ? ' 🟡' : '';
        msg += `    🏠 ${esc(it.bldName)} ${esc(String(it.room))}호 · ${esc(it.tenant)} · ~${esc(it.end)} (D-${it.dl})${flag}\n`;
      }
    }
    msg += `  ▸ 총 <b>${total}건</b>\n`;
  }

  msg += `\n`;

  // 신규 승인 대기
  msg += `🔔 <b>신규 사용자 승인 대기</b>\n`;
  if (!pendingList.length) {
    msg += `  ✅ 대기 중인 사용자 없음\n`;
  } else {
    for (const u of pendingList) {
      const name  = esc(u.displayName || '(이름없음)');
      const email = esc(u.email || '');
      const since = u.createdAt
        ? new Date(u.createdAt).toISOString().slice(0, 10)
        : '';
      msg += `  ⏳ <b>${name}</b>${email ? ` (${email})` : ''}${since ? ` · 요청일 ${since}` : ''}\n`;
    }
    msg += `  ▸ 총 <b>${pendingList.length}명</b> 대기 중\n`;
  }

  await send(msg, 'HTML');
}

function esc(s) {
  return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function send(text, parseMode = '') {
  return new Promise((resolve, reject) => {
    const payload = { chat_id: CHAT_ID, text };
    if (parseMode) payload.parse_mode = parseMode;
    const body = JSON.stringify(payload);
    const req = https.request({
      hostname: 'api.telegram.org',
      path:     `/bot${BOT_TOKEN}/sendMessage`,
      method:   'POST',
      headers:  { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) },
    }, res => {
      let data = '';
      res.on('data', d => data += d);
      res.on('end', () => {
        const r = JSON.parse(data);
        if (!r.ok) console.error('Telegram error:', r);
        resolve(r);
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => db.app.delete());
