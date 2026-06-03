// PlusHome 만료 임박 알림 스크립트
// 매일 08:00 KST — GitHub Actions cron으로 실행
const admin = require('firebase-admin');
const https = require('https');

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID   = process.env.TELEGRAM_CHAT_ID;

// Firebase 초기화
// GitHub Secrets에서 \n이 실제 줄바꿈으로 저장되는 경우 처리
let serviceAccount;
try {
  serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
} catch(e) {
  serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT.replace(/\n/g, '\\n'));
}
// PEM 형식에는 실제 줄바꿈이 필요 — 이스케이프된 \n을 실제 줄바꿈으로 복원
if (serviceAccount.private_key) {
  serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
}
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

  // 관리 사용자 목록
  const usersSnap = await db.ref('master_admin/users').once('value');
  const users = Object.values(usersSnap.val() || {});
  if (!users.length) {
    await send('ℹ️ PlusHome: 등록된 관리 사용자 없음');
    return;
  }

  // 삭제(dismissed) 이력
  const notesSnap = await db.ref('master_admin/expiry_notes').once('value');
  const notes = notesSnap.val() || {};

  const results = [];

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
          bldName:    bld.name || bid,
          room:       x.room,
          tenant:     x.tenantName || '(미등록)',
          end:        x.contractEnd,
          dl,
        });
      }
    }

    if (userItems.length) {
      userItems.sort((a, b) => a.dl - b.dl);
      results.push({ name: u.name, items: userItems });
    }
  }

  if (!results.length) {
    await send(`✅ PlusHome 알림 (${dateStr})\n30일 이내 만료 임박 없음`);
    return;
  }

  const total = results.reduce((s, r) => s + r.items.length, 0);
  let msg = `📋 <b>PlusHome 만료 임박 알림</b> (${dateStr})\n\n`;

  for (const r of results) {
    msg += `👤 <b>${esc(r.name)}</b>\n`;
    for (const it of r.items) {
      const flag = it.dl <= 7 ? ' 🔴' : '';
      msg += `  🏠 ${esc(it.bldName)} ${esc(String(it.room))}호 · ${esc(it.tenant)} · ~${esc(it.end)} (D-${it.dl})${flag}\n`;
    }
    msg += '\n';
  }

  msg += `총 <b>${total}건</b>`;
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
