// footer.js — 전 페이지 공통 하단 푸터 + 개인정보처리방침 모달
// 헤더처럼 fixed 아님, 각 페이지 콘텐츠 맨 아래에 삽입됨.
// 페이지마다 테마(라이트/다크)가 달라 공용 CSS 변수에 의존하지 않고 스타일을 자체 내장함.
// 수정 시 이 파일만 고치면 전 페이지에 반영됨.
(function(){
  var year = new Date().getFullYear();
  var KAKAO_ID = 'plushome1';
  // 개인 카카오톡 ID는 공식 웹 딥링크가 없어 클릭 시 ID 복사로 대체.
  // 추후 카카오톡 채널로 전환되면 <a href="https://pf.kakao.com/_xxxx"> 형태로 교체.

  var PRIVACY_TEXT =
"플러스홈의 개인정보 취급방침\n" +
"\n" +
"[제1장 총칙]\n" +
"\n" +
"제1조 목적\n" +
"본 개인정보처리방침은 플러스홈(이하 \"회사\")이 이용자의 개인정보를 수집·이용·보관·보호하는 방식 및\n" +
"이용자의 권리를 안내함을 목적으로 합니다. 회사는 「개인정보 보호법」 등 관련 법령을 준수합니다.\n" +
"\n" +
"제2조 개인정보의 수집 및 이용 목적\n" +
"(1) 회사는 다음 목적에 따라 개인정보를 수집·이용합니다.\n" +
"    가. 회원 가입 및 본인확인\n" +
"    나. 계약의 체결·이행 및 서비스 제공\n" +
"    다. 사용자 문의·민원 처리\n" +
"    라. 서비스 개선·통계 분석·품질 향상\n" +
"    마. 선택적 광고 및 마케팅 안내 (필요 시)\n" +
"(2) 회사는 민감정보를 별도 동의 없이 처리하지 않습니다.\n" +
"\n" +
"제3조 수집하는 개인정보 항목\n" +
"(1) 필수 수집 항목은 다음과 같습니다.\n" +
"    가. 이름, 이메일, 프로필 사진(Google 로그인)\n" +
"    나. 고유식별자(UID)\n" +
"    다. 기기 푸시 토큰(FCM, 알림 기능 이용 시)\n" +
"    라. 임차인 이름·연락처(임대관리 데이터)\n" +
"    마. 결제 기록(결제 기능 도입 시)\n" +
"(2) 회사는 이용자의 Google 로그인 UID를 기준으로 서비스를 구분하여 제공하며,\n" +
"    수집한 개인정보를 명시된 목적 외 다른 용도로 저장·활용하지 않습니다.\n" +
"\n" +
"제4조 개인정보 수집 방법\n" +
"(1) 회사는 다음의 방법으로 개인정보를 수집합니다.\n" +
"    가. 홈페이지 가입 및 서비스 이용 과정\n" +
"    나. 상담 및 이벤트 참여\n" +
"    다. 서비스 이용 중 자동 생성되는 데이터\n" +
"\n" +
"제5조 로컬 저장소(Local Storage)의 운영\n" +
"(1) 회사는 로그인 상태 유지 및 이용 편의 제공을 위해 브라우저의 로컬 저장소(localStorage,\n" +
"    sessionStorage)를 사용합니다. 별도의 쿠키(Cookie)는 사용하지 않습니다.\n" +
"(2) 로컬 저장소에 저장된 정보는 이용자가 브라우저 설정을 통해 직접 삭제할 수 있으며,\n" +
"    삭제 시 일부 서비스 이용에 제한이 있을 수 있습니다.\n" +
"\n" +
"\n" +
"[제2장 개인정보의 제공 및 위탁]\n" +
"\n" +
"제1조 개인정보의 제3자 제공\n" +
"(1) 회사는 다음을 제외하고 개인정보를 제3자에게 제공하지 않습니다.\n" +
"    가. 이용자 동의가 있는 경우\n" +
"    나. 법령의 규정에 따른 요청이 있는 경우\n" +
"(2) 필요 시 제공 대상·목적·항목을 별도 안내하고 동의를 받습니다.\n" +
"\n" +
"제2조 개인정보 처리업무의 위탁\n" +
"(1) 회사는 안정적인 서비스 제공을 위해 다음과 같이 개인정보 처리를 위탁하고 있습니다.\n" +
"    가. Google Firebase(회원 인증, 데이터베이스, 스토리지, 푸시 알림 운영) — Google LLC\n" +
"(2) 회사는 다음 업무를 향후 필요 시 외부에 위탁할 수 있습니다.\n" +
"    가. 고객 지원 및 상담\n" +
"    나. 결제 시스템 운영\n" +
"    다. SMS/이메일 발송\n" +
"    라. 시스템 개발·유지보수\n" +
"(3) 위탁 시 개인정보 보호 의무를 계약에 명시하고 관리·감독합니다.\n" +
"\n" +
"\n" +
"[제3장 이용자의 권리]\n" +
"\n" +
"제1조 이용자의 권리\n" +
"(1) 이용자는 언제든지 다음을 요청할 수 있습니다.\n" +
"    가. 정정 또는 삭제\n" +
"    나. 처리 정지\n" +
"    다. 동의 철회 및 탈퇴\n" +
"(2) 요청은 아래 연락처를 통해 관리자와의 직접 통화, 카카오톡, 이메일로 접수·처리됩니다.\n" +
"\n" +
"\n" +
"[제4장 개인정보의 보유 및 파기]\n" +
"\n" +
"제1조 개인정보 보유 및 이용 기간\n" +
"(1) 회사는 이용자의 서비스 탈퇴 또는 이용 중지 요청 시 지체없이 개인정보를 파기합니다.\n" +
"    단, 관계 법령에 따라 보존할 필요가 있는 경우 해당 기간 동안 보관합니다.\n" +
"(2) 이용자의 개인정보 및 임대관리 데이터는 회사가 관리하는 Google Firebase(인증, 데이터베이스,\n" +
"    스토리지) 클라우드 인프라에 보관되며, 회사 외 제3자가 임의로 접근할 수 없도록 관리됩니다.\n" +
"\n" +
"제2조 개인정보 파기 절차 및 방법\n" +
"회사는 다음의 방법으로 개인정보를 파기합니다.\n" +
"    가. 전자 파일: 복구 불가능한 방식으로 삭제\n" +
"    나. 서면 문서: 분쇄 또는 소각\n" +
"\n" +
"\n" +
"[제5장 개인정보 보호조치]\n" +
"\n" +
"제1조 기술적·관리적 조치\n" +
"회사는 개인정보 보호를 위해 아래 조치를 적용합니다.\n" +
"    가. 암호화 저장 및 전송 보안\n" +
"    나. 접근 통제 및 권한 제한\n" +
"    다. 보안 시스템 운영 및 침입 차단\n" +
"    라. 정기 점검 및 임직원 보안 교육\n" +
"\n" +
"제2조 14세 미만 아동의 개인정보 보호\n" +
"회사는 법정대리인 동의 없이 14세 미만 아동의 개인정보를 수집하지 않습니다.\n" +
"\n" +
"\n" +
"[제6장 개인정보 보호책임자 및 기타]\n" +
"\n" +
"제1조 의견 및 불만 처리\n" +
"개인정보 관련 문의 및 신고는 아래 창구로 접수되며, 확인 후 신속히 처리합니다.\n" +
"\n" +
"제2조 개인정보 보호책임자\n" +
"(1) 이름 : 조연호\n" +
"(2) 연락처 : 010-3309-6321\n" +
"(3) 이메일 : admin@plushome.kr\n" +
"\n" +
"제3조 권익침해 구제방법\n" +
"이용자는 개인정보 침해로 인한 상담 및 피해 구제를 아래 기관에 문의할 수 있습니다.\n" +
"    가. 개인정보분쟁조정위원회 (1833-6972, www.kopico.go.kr)\n" +
"    나. 개인정보침해신고센터 (국번없이 182, privacy.go.kr)\n" +
"    다. 대검찰청 사이버수사과 (국번없이 1301, www.spo.go.kr)\n" +
"    라. 경찰청 사이버수사국 (국번없이 182, ecrm.police.go.kr)\n" +
"\n" +
"제4조 개인정보처리방침 변경 안내\n" +
"본 방침은 법령 및 서비스 변경에 따라 수정될 수 있으며 변경 시 홈페이지에 공지합니다.\n" +
"\n" +
"부칙\n" +
"이 개인정보처리방침은 2026년 06월 01일부터 시행합니다.";

  var html =
    '<footer class="ph-footer">' +
      '<style>' +
        '.ph-footer{margin-top:20px;padding:14px 16px 16px;background:linear-gradient(135deg,#0A1628,#1A2B3C);text-align:center}' +
        '.ph-footer-inner{max-width:640px;margin:0 auto;color:#CBD5E1;font-size:12.5px;line-height:1.65}' +
        '.ph-footer-name{font-weight:700;color:#E2E8F0;font-size:14.5px;margin-bottom:2px}' +
        '.ph-footer-copy{margin-top:10px;color:#64748B;font-size:11px}' +
        '.ph-footer a{color:#F5A623;text-decoration:underline}' +
        '.ph-footer a:hover{color:#FFC069}' +
        '.ph-kakao{cursor:pointer;color:#F5A623;text-decoration:underline}' +
        '.ph-kakao:hover{color:#FFC069}' +
        '.ph-sep{color:#475569;margin:0 6px}' +
        '.ph-privacy-link{cursor:pointer;text-decoration:underline}' +
        '.ph-privacy-link:hover{color:#94A3B8}' +
      '</style>' +
      '<div class="ph-footer-inner">' +
        '<div class="ph-footer-name">플러스홈 (104-46-02119)</div>' +
        '<div class="ph-footer-line">대전광역시 중구 유천로42번길 6, 302호<span class="ph-sep">/</span><a href="tel:010-3309-6321">010-3309-6321</a></div>' +
        '<div class="ph-footer-line"><span class="ph-kakao" id="ph-kakao-btn">카톡 ' + KAKAO_ID + '</span><span class="ph-sep">/</span><a href="mailto:admin@plushome.kr">메일 admin@plushome.kr</a></div>' +
        '<div class="ph-footer-copy">© ' + year + ' PlusHome. All rights reserved.<span class="ph-sep">·</span><span class="ph-privacy-link" id="ph-privacy-btn">개인정보처리방침</span></div>' +
      '</div>' +
    '</footer>';

  var cs = document.currentScript;
  if (cs && cs.insertAdjacentHTML) {
    cs.insertAdjacentHTML('beforebegin', html);
  } else {
    document.body.insertAdjacentHTML('beforeend', html);
  }

  function showToast(msg){
    var t = document.createElement('div');
    t.textContent = msg;
    t.style.cssText = 'position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:#1F2937;color:#fff;padding:10px 18px;border-radius:20px;font-size:13px;z-index:99999;box-shadow:0 4px 16px rgba(0,0,0,.3);pointer-events:none';
    document.body.appendChild(t);
    setTimeout(function(){ t.remove(); }, 2200);
  }

  var kakaoBtn = document.getElementById('ph-kakao-btn');
  if (kakaoBtn) {
    kakaoBtn.addEventListener('click', function(){
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(KAKAO_ID)
          .then(function(){ showToast('카카오톡 ID 복사됨: ' + KAKAO_ID + ' (검색해서 추가해주세요)'); })
          .catch(function(){ showToast('카카오톡 ID: ' + KAKAO_ID); });
      } else {
        showToast('카카오톡 ID: ' + KAKAO_ID);
      }
    });
  }

  // ── 개인정보처리방침 모달 ──
  var modalHtml =
    '<div id="ph-privacy-overlay" style="display:none;position:fixed;inset:0;background:rgba(10,22,40,.72);z-index:99998;padding:24px 16px;overflow-y:auto">' +
      '<style>' +
        '.ph-privacy-box{max-width:640px;margin:0 auto;background:#fff;border-radius:16px;box-shadow:0 20px 60px rgba(0,0,0,.4);overflow:hidden}' +
        '.ph-privacy-hd{display:flex;align-items:center;justify-content:space-between;padding:16px 20px;border-bottom:1px solid #E2E8F0;position:sticky;top:0;background:#fff}' +
        '.ph-privacy-hd h2{font-size:15px;font-weight:700;color:#1E293B;margin:0}' +
        '.ph-privacy-close{cursor:pointer;border:none;background:#F0F4F8;color:#64748B;width:30px;height:30px;border-radius:50%;font-size:16px;line-height:1;display:flex;align-items:center;justify-content:center}' +
        '.ph-privacy-close:hover{background:#E2E8F0;color:#1E293B}' +
        '.ph-privacy-body{padding:20px;white-space:pre-wrap;font-size:12.5px;line-height:1.75;color:#334155;max-height:70vh;overflow-y:auto}' +
      '</style>' +
      '<div class="ph-privacy-box">' +
        '<div class="ph-privacy-hd"><h2>개인정보처리방침</h2><button class="ph-privacy-close" id="ph-privacy-close" aria-label="닫기">✕</button></div>' +
        '<div class="ph-privacy-body" id="ph-privacy-body"></div>' +
      '</div>' +
    '</div>';

  document.body.insertAdjacentHTML('beforeend', modalHtml);
  document.getElementById('ph-privacy-body').textContent = PRIVACY_TEXT;

  var overlay = document.getElementById('ph-privacy-overlay');

  function openPrivacy(){
    overlay.style.display = 'block';
    document.body.style.overflow = 'hidden';
  }
  function closePrivacy(){
    overlay.style.display = 'none';
    document.body.style.overflow = '';
  }

  var privacyBtn = document.getElementById('ph-privacy-btn');
  if (privacyBtn) privacyBtn.addEventListener('click', openPrivacy);

  document.getElementById('ph-privacy-close').addEventListener('click', closePrivacy);
  overlay.addEventListener('click', function(e){
    if (e.target === overlay) closePrivacy();
  });
  document.addEventListener('keydown', function(e){
    if (e.key === 'Escape' && overlay.style.display === 'block') closePrivacy();
  });
})();
