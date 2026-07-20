// footer.js — 전 페이지 공통 하단 푸터
// 헤더처럼 fixed 아님, 각 페이지 콘텐츠 맨 아래에 삽입됨.
// 페이지마다 테마(라이트/다크)가 달라 공용 CSS 변수에 의존하지 않고 스타일을 자체 내장함.
// 수정 시 이 파일만 고치면 전 페이지에 반영됨.
(function(){
  var year = new Date().getFullYear();
  var KAKAO_ID = 'plushome1';
  // 개인 카카오톡 ID는 공식 웹 딥링크가 없어 클릭 시 ID 복사로 대체.
  // 추후 카카오톡 채널로 전환되면 <a href="https://pf.kakao.com/_xxxx"> 형태로 교체.
  var html =
    '<footer class="ph-footer">' +
      '<style>' +
        '.ph-footer{margin-top:32px;padding:22px 16px 30px;background:linear-gradient(135deg,#0A1628,#1A2B3C);text-align:center}' +
        '.ph-footer-inner{max-width:640px;margin:0 auto;color:#94A3B8;font-size:12px;line-height:1.8}' +
        '.ph-footer-name{font-weight:700;color:#E2E8F0;font-size:13px;margin-bottom:4px}' +
        '.ph-footer-copy{margin-top:8px;color:#64748B}' +
        '.ph-footer a{color:#94A3B8;text-decoration:none}' +
        '.ph-footer a:hover{text-decoration:underline}' +
        '.ph-kakao{cursor:pointer;border-bottom:1px dotted #94A3B8}' +
        '.ph-kakao:hover{color:#E2E8F0}' +
      '</style>' +
      '<div class="ph-footer-inner">' +
        '<div class="ph-footer-name">플러스홈</div>' +
        '<div class="ph-footer-line">사업자등록번호 104-46-02119</div>' +
        '<div class="ph-footer-line">대전광역시 중구 유천로42번길 6, 302호(유천동)</div>' +
        '<div class="ph-footer-line">전화 010-3309-6321 · <span class="ph-kakao" id="ph-kakao-btn">카카오톡 ' + KAKAO_ID + '</span> · <a href="mailto:admin@plushome.kr">이메일 admin@plushome.kr</a></div>' +
        '<div class="ph-footer-copy">© ' + year + ' PlusHome. All rights reserved.</div>' +
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
})();
