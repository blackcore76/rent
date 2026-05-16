// ── 구경 모드 데모 데이터 ──
// pending 사용자가 앱을 둘러볼 때 보여주는 허수 데이터입니다.
// 이 파일만 수정하면 구경 모드에서 보이는 내용이 바뀝니다.

const DEMO = {
  // ── 건물 목록 ──
  bldgsData: {
    main: { id:"main", name:"나빌레라", order:0, createdAt:"2024-01-01T00:00:00.000Z" }
  },

  // ── 호실 레이아웃 ──
  layout: {
    "2": ["201","202","203","204","205","206"],
    "3": ["301","302","303","304","305","306"],
    "4": ["401","402","403","404","405","406"]
  },

  // ── 세대 정보 ──
  // 필드명: room, floor, status("rented"|"vacant"), roomType, rentType,
  //         tenantName, tenantName2, tenantPhone, tenantPhone2,
  //         depositAmount(만원), monthlyRent(만원), contractStart, contractEnd, memo
  units: {
    "201":{ room:"201",floor:2,status:"rented", roomType:"oneroom",rentType:"monthly",tenantName:"김민준",tenantName2:"",tenantPhone:"010-1234-5678",tenantPhone2:"",depositAmount:500,monthlyRent:45,contractStart:"2024-03-01",contractEnd:"2026-02-28",memo:"베란다 방충망 수리 요청" },
    "202":{ room:"202",floor:2,status:"rented", roomType:"oneroom",rentType:"monthly",tenantName:"이서연",tenantName2:"",tenantPhone:"010-2345-6789",tenantPhone2:"",depositAmount:500,monthlyRent:45,contractStart:"2024-06-01",contractEnd:"2026-05-31",memo:"" },
    "203":{ room:"203",floor:2,status:"rented", roomType:"tworoom",rentType:"monthly",tenantName:"박지호",tenantName2:"",tenantPhone:"010-3456-7890",tenantPhone2:"",depositAmount:300,monthlyRent:40,contractStart:"2025-01-01",contractEnd:"2026-12-31",memo:"주차 2대" },
    "204":{ room:"204",floor:2,status:"vacant", roomType:"oneroom",rentType:"monthly",tenantName:"",      tenantName2:"",tenantPhone:"",             tenantPhone2:"",depositAmount:0,  monthlyRent:0, contractStart:"",           contractEnd:"",           memo:"" },
    "205":{ room:"205",floor:2,status:"rented", roomType:"oneroom",rentType:"monthly",tenantName:"최수아",tenantName2:"",tenantPhone:"010-5678-9012",tenantPhone2:"",depositAmount:500,monthlyRent:50,contractStart:"2023-09-01",contractEnd:"2025-08-31",memo:"" },
    "206":{ room:"206",floor:2,status:"rented", roomType:"oneroom",rentType:"monthly",tenantName:"정하윤",tenantName2:"",tenantPhone:"010-6789-0123",tenantPhone2:"",depositAmount:300,monthlyRent:38,contractStart:"2025-04-01",contractEnd:"2027-03-31",memo:"" },
    "301":{ room:"301",floor:3,status:"rented", roomType:"oneroom",rentType:"monthly",tenantName:"강도현",tenantName2:"",tenantPhone:"010-7890-1234",tenantPhone2:"",depositAmount:500,monthlyRent:48,contractStart:"2024-08-01",contractEnd:"2026-07-31",memo:"" },
    "302":{ room:"302",floor:3,status:"rented", roomType:"tworoom",rentType:"monthly",tenantName:"윤지아",tenantName2:"",tenantPhone:"010-8901-2345",tenantPhone2:"",depositAmount:500,monthlyRent:48,contractStart:"2024-11-01",contractEnd:"2026-10-31",memo:"반려동물(고양이)" },
    "303":{ room:"303",floor:3,status:"vacant", roomType:"oneroom",rentType:"monthly",tenantName:"",      tenantName2:"",tenantPhone:"",             tenantPhone2:"",depositAmount:0,  monthlyRent:0, contractStart:"",           contractEnd:"",           memo:"리모델링 예정" },
    "304":{ room:"304",floor:3,status:"rented", roomType:"oneroom",rentType:"monthly",tenantName:"임서준",tenantName2:"",tenantPhone:"010-9012-3456",tenantPhone2:"",depositAmount:300,monthlyRent:42,contractStart:"2025-02-01",contractEnd:"2027-01-31",memo:"" },
    "305":{ room:"305",floor:3,status:"rented", roomType:"oneroom",rentType:"monthly",tenantName:"한채원",tenantName2:"",tenantPhone:"010-0123-4567",tenantPhone2:"010-9999-8888",depositAmount:500,monthlyRent:48,contractStart:"2024-05-01",contractEnd:"2026-04-30",memo:"" },
    "306":{ room:"306",floor:3,status:"rented", roomType:"oneroom",rentType:"monthly",tenantName:"오준서",tenantName2:"",tenantPhone:"010-1357-2468",tenantPhone2:"",depositAmount:300,monthlyRent:40,contractStart:"2025-07-01",contractEnd:"2027-06-30",memo:"" },
    "401":{ room:"401",floor:4,status:"rented", roomType:"tworoom",rentType:"monthly",tenantName:"신예린",tenantName2:"",tenantPhone:"010-2468-1357",tenantPhone2:"",depositAmount:500,monthlyRent:52,contractStart:"2024-01-01",contractEnd:"2025-12-31",memo:"" },
    "402":{ room:"402",floor:4,status:"rented", roomType:"oneroom",rentType:"monthly",tenantName:"배태양",tenantName2:"",tenantPhone:"010-3579-2468",tenantPhone2:"",depositAmount:500,monthlyRent:52,contractStart:"2024-10-01",contractEnd:"2026-09-30",memo:"" },
    "403":{ room:"403",floor:4,status:"rented", roomType:"oneroom",rentType:"monthly",tenantName:"류하나",tenantName2:"",tenantPhone:"010-4680-3579",tenantPhone2:"",depositAmount:300,monthlyRent:45,contractStart:"2025-03-01",contractEnd:"2027-02-28",memo:"" },
    "404":{ room:"404",floor:4,status:"vacant", roomType:"oneroom",rentType:"monthly",tenantName:"",      tenantName2:"",tenantPhone:"",             tenantPhone2:"",depositAmount:0,  monthlyRent:0, contractStart:"",           contractEnd:"",           memo:"" },
    "405":{ room:"405",floor:4,status:"rented", roomType:"oneroom",rentType:"monthly",tenantName:"조민아",tenantName2:"",tenantPhone:"010-5791-4680",tenantPhone2:"",depositAmount:500,monthlyRent:50,contractStart:"2024-07-01",contractEnd:"2026-06-30",memo:"" },
    "406":{ room:"406",floor:4,status:"rented", roomType:"oneroom",rentType:"monthly",tenantName:"문기찬",tenantName2:"",tenantPhone:"010-6802-5791",tenantPhone2:"",depositAmount:300,monthlyRent:42,contractStart:"2025-05-01",contractEnd:"2027-04-30",memo:"" }
  },

  // ── 납부 이력 ──
  // { roomId: { "YYYY-MM": { paid:bool, room, yearMonth, amount } } }
  rentHistory: {
    "201":{ "2026-01":{paid:true,room:"201",yearMonth:"2026-01",amount:450000},"2026-02":{paid:true,room:"201",yearMonth:"2026-02",amount:450000},"2026-03":{paid:true,room:"201",yearMonth:"2026-03",amount:450000},"2026-04":{paid:true,room:"201",yearMonth:"2026-04",amount:450000},"2026-05":{paid:false,room:"201",yearMonth:"2026-05",amount:450000} },
    "202":{ "2026-01":{paid:true,room:"202",yearMonth:"2026-01",amount:450000},"2026-02":{paid:true,room:"202",yearMonth:"2026-02",amount:450000},"2026-03":{paid:true,room:"202",yearMonth:"2026-03",amount:450000},"2026-04":{paid:true,room:"202",yearMonth:"2026-04",amount:450000},"2026-05":{paid:true,room:"202",yearMonth:"2026-05",amount:450000} },
    "203":{ "2026-01":{paid:true,room:"203",yearMonth:"2026-01",amount:400000},"2026-02":{paid:true,room:"203",yearMonth:"2026-02",amount:400000},"2026-03":{paid:true,room:"203",yearMonth:"2026-03",amount:400000},"2026-04":{paid:false,room:"203",yearMonth:"2026-04",amount:400000},"2026-05":{paid:false,room:"203",yearMonth:"2026-05",amount:400000} },
    "205":{ "2026-01":{paid:true,room:"205",yearMonth:"2026-01",amount:500000},"2026-02":{paid:true,room:"205",yearMonth:"2026-02",amount:500000},"2026-03":{paid:true,room:"205",yearMonth:"2026-03",amount:500000},"2026-04":{paid:true,room:"205",yearMonth:"2026-04",amount:500000},"2026-05":{paid:true,room:"205",yearMonth:"2026-05",amount:500000} },
    "206":{ "2026-01":{paid:true,room:"206",yearMonth:"2026-01",amount:380000},"2026-02":{paid:true,room:"206",yearMonth:"2026-02",amount:380000},"2026-03":{paid:true,room:"206",yearMonth:"2026-03",amount:380000},"2026-04":{paid:true,room:"206",yearMonth:"2026-04",amount:380000},"2026-05":{paid:true,room:"206",yearMonth:"2026-05",amount:380000} },
    "301":{ "2026-01":{paid:true,room:"301",yearMonth:"2026-01",amount:480000},"2026-02":{paid:true,room:"301",yearMonth:"2026-02",amount:480000},"2026-03":{paid:true,room:"301",yearMonth:"2026-03",amount:480000},"2026-04":{paid:true,room:"301",yearMonth:"2026-04",amount:480000},"2026-05":{paid:false,room:"301",yearMonth:"2026-05",amount:480000} },
    "302":{ "2026-01":{paid:true,room:"302",yearMonth:"2026-01",amount:480000},"2026-02":{paid:true,room:"302",yearMonth:"2026-02",amount:480000},"2026-03":{paid:true,room:"302",yearMonth:"2026-03",amount:480000},"2026-04":{paid:true,room:"302",yearMonth:"2026-04",amount:480000},"2026-05":{paid:true,room:"302",yearMonth:"2026-05",amount:480000} },
    "304":{ "2026-01":{paid:true,room:"304",yearMonth:"2026-01",amount:420000},"2026-02":{paid:true,room:"304",yearMonth:"2026-02",amount:420000},"2026-03":{paid:true,room:"304",yearMonth:"2026-03",amount:420000},"2026-04":{paid:true,room:"304",yearMonth:"2026-04",amount:420000},"2026-05":{paid:true,room:"304",yearMonth:"2026-05",amount:420000} },
    "305":{ "2026-01":{paid:true,room:"305",yearMonth:"2026-01",amount:480000},"2026-02":{paid:true,room:"305",yearMonth:"2026-02",amount:480000},"2026-03":{paid:true,room:"305",yearMonth:"2026-03",amount:480000},"2026-04":{paid:false,room:"305",yearMonth:"2026-04",amount:480000},"2026-05":{paid:false,room:"305",yearMonth:"2026-05",amount:480000} },
    "306":{ "2026-01":{paid:true,room:"306",yearMonth:"2026-01",amount:400000},"2026-02":{paid:true,room:"306",yearMonth:"2026-02",amount:400000},"2026-03":{paid:true,room:"306",yearMonth:"2026-03",amount:400000},"2026-04":{paid:true,room:"306",yearMonth:"2026-04",amount:400000},"2026-05":{paid:true,room:"306",yearMonth:"2026-05",amount:400000} },
    "401":{ "2026-01":{paid:true,room:"401",yearMonth:"2026-01",amount:520000},"2026-02":{paid:true,room:"401",yearMonth:"2026-02",amount:520000},"2026-03":{paid:true,room:"401",yearMonth:"2026-03",amount:520000},"2026-04":{paid:true,room:"401",yearMonth:"2026-04",amount:520000},"2026-05":{paid:true,room:"401",yearMonth:"2026-05",amount:520000} },
    "402":{ "2026-01":{paid:true,room:"402",yearMonth:"2026-01",amount:520000},"2026-02":{paid:true,room:"402",yearMonth:"2026-02",amount:520000},"2026-03":{paid:true,room:"402",yearMonth:"2026-03",amount:520000},"2026-04":{paid:true,room:"402",yearMonth:"2026-04",amount:520000},"2026-05":{paid:false,room:"402",yearMonth:"2026-05",amount:520000} },
    "403":{ "2026-01":{paid:true,room:"403",yearMonth:"2026-01",amount:450000},"2026-02":{paid:true,room:"403",yearMonth:"2026-02",amount:450000},"2026-03":{paid:true,room:"403",yearMonth:"2026-03",amount:450000},"2026-04":{paid:true,room:"403",yearMonth:"2026-04",amount:450000},"2026-05":{paid:true,room:"403",yearMonth:"2026-05",amount:450000} },
    "405":{ "2026-01":{paid:true,room:"405",yearMonth:"2026-01",amount:500000},"2026-02":{paid:true,room:"405",yearMonth:"2026-02",amount:500000},"2026-03":{paid:true,room:"405",yearMonth:"2026-03",amount:500000},"2026-04":{paid:true,room:"405",yearMonth:"2026-04",amount:500000},"2026-05":{paid:true,room:"405",yearMonth:"2026-05",amount:500000} },
    "406":{ "2026-01":{paid:true,room:"406",yearMonth:"2026-01",amount:420000},"2026-02":{paid:true,room:"406",yearMonth:"2026-02",amount:420000},"2026-03":{paid:true,room:"406",yearMonth:"2026-03",amount:420000},"2026-04":{paid:true,room:"406",yearMonth:"2026-04",amount:420000},"2026-05":{paid:true,room:"406",yearMonth:"2026-05",amount:420000} }
  },

  // ── 메모 (index.html) ──
  notes: {
    "1746000001":{ id:1746000001, content:"4월 수도세 납부 완료", createdAt:"2026-04-30T10:00:00.000Z" },
    "1746000002":{ id:1746000002, content:"303호 퇴실 후 리모델링 일정 협의 필요", createdAt:"2026-05-02T09:30:00.000Z" },
    "1746000003":{ id:1746000003, content:"소방 점검: 5월 20일 오전 10시", createdAt:"2026-05-10T14:00:00.000Z" }
  },

  // ── 수입·지출 내역 (expense.html) ──
  // 필드명: id, type("income"|"expense"), category, amount(원), date("YYYY-MM-DD"), memo
  transactions: [
    { id:1001, type:"income",  category:"월세",       amount:795000, date:"2026-05-05", memo:"2층 5개호 5월 월세" },
    { id:1002, type:"income",  category:"월세",       amount:826000, date:"2026-05-06", memo:"3층 5개호 5월 월세" },
    { id:1003, type:"income",  category:"월세",       amount:839000, date:"2026-05-07", memo:"4층 5개호 5월 월세" },
    { id:1004, type:"income",  category:"관리비",     amount:180000, date:"2026-05-10", memo:"5월 공용 관리비" },
    { id:1005, type:"expense", category:"수리비",     amount:85000,  date:"2026-05-08", memo:"201호 방충망 교체" },
    { id:1006, type:"expense", category:"세금/공과금",amount:132000, date:"2026-05-12", memo:"5월 전기료" },
    { id:1007, type:"expense", category:"청소비",     amount:80000,  date:"2026-05-15", memo:"공용 복도 청소" },
    { id:1008, type:"income",  category:"월세",       amount:400000, date:"2026-04-08", memo:"203호 4월 월세 늦납" },
    { id:1009, type:"income",  category:"월세",       amount:795000, date:"2026-04-05", memo:"2층 5개호 4월 월세" },
    { id:1010, type:"income",  category:"월세",       amount:826000, date:"2026-04-06", memo:"3층 5개호 4월 월세" },
    { id:1011, type:"income",  category:"월세",       amount:839000, date:"2026-04-07", memo:"4층 5개호 4월 월세" },
    { id:1012, type:"expense", category:"수리비",     amount:220000, date:"2026-04-18", memo:"3층 공용 배관 누수 수리" },
    { id:1013, type:"expense", category:"인건비",     amount:150000, date:"2026-04-30", memo:"4월 청소 인건비" },
    { id:1014, type:"income",  category:"관리비",     amount:180000, date:"2026-04-10", memo:"4월 공용 관리비" },
    { id:1015, type:"expense", category:"보험료",     amount:95000,  date:"2026-03-15", memo:"건물 화재보험" }
  ],

  // ── 전화번호부 (admin.html) ──
  // 필드명: id, name, category("tenant"|"vendor"|"agency"|"other"), phone, phone2, memo
  phonebook: {
    "pb001":{ id:"pb001", name:"김민준",         category:"tenant", phone:"010-1234-5678", phone2:"",              memo:"201호" },
    "pb002":{ id:"pb002", name:"이서연",         category:"tenant", phone:"010-2345-6789", phone2:"",              memo:"202호" },
    "pb003":{ id:"pb003", name:"박지호",         category:"tenant", phone:"010-3456-7890", phone2:"",              memo:"203호" },
    "pb004":{ id:"pb004", name:"최수아",         category:"tenant", phone:"010-5678-9012", phone2:"",              memo:"205호 계약 갱신 예정" },
    "pb005":{ id:"pb005", name:"강도현",         category:"tenant", phone:"010-7890-1234", phone2:"",              memo:"301호" },
    "pb006":{ id:"pb006", name:"한채원",         category:"tenant", phone:"010-0123-4567", phone2:"010-9999-8888", memo:"305호 비상연락처 등록됨" },
    "pb007":{ id:"pb007", name:"신예린",         category:"tenant", phone:"010-2468-1357", phone2:"",              memo:"401호" },
    "pb008":{ id:"pb008", name:"조아빌 공인중개사", category:"agency", phone:"02-123-4567",  phone2:"010-1111-2222", memo:"공실 매물 의뢰 중" },
    "pb009":{ id:"pb009", name:"고려 수리센터",  category:"vendor", phone:"010-3333-4444", phone2:"",              memo:"배관·전기 전문" },
    "pb010":{ id:"pb010", name:"클린 청소서비스", category:"vendor", phone:"010-5555-6666", phone2:"",              memo:"공용부 청소 담당" }
  },

  // ── 건물정보카드 (index.html 메인 하단) ──
  // 필드명: id, name, entranceCode, masterCode, manageFee, address, createdAt
  bldInfo: {
    "bi001": {
      id:"bi001",
      name:"나빌레라",
      address:"서울시 마포구 와우산로 123",
      entranceCode:"1234#",
      masterCode:"9876*",
      manageFee:"국민은행 123-456-789012 (예금주: 나빌레라)",
      createdAt:"2024-01-01T00:00:00.000Z"
    }
  }
};
