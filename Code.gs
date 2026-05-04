// =============================================
// 투닝 강사 시간등록 서비스 - 서버 사이드
// =============================================

const SHEET_NAME = '강사시간등록';
const SPREADSHEET_ID = '1mwt1Mo8NieWipz7tYsDjGNWFbBHavA9GDYeDoB51f60';
const REGIONS = ['서울', '경기', '인천', '부산', '대구', '광주', '대전', '울산', '세종', '강원', '충북', '충남', '전북', '전남', '경북', '경남', '제주'];
const VERSION = 'v1.2.0'; // 날짜·시간 Date 객체 변환 버그 수정

// ---- 웹앱 진입점 ----
function doGet(e) {
  return HtmlService.createHtmlOutputFromFile('Index')
    .setTitle('투닝 강사 시간등록 서비스')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1.0')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

// ---- 버전 반환 ----
function getVersion() {
  return VERSION;
}

// ---- 시트 획득 ----
function getSheet_() {
  let ss;
  try { ss = SpreadsheetApp.getActiveSpreadsheet(); } catch(e) {}
  if (!ss) {
    try { ss = SpreadsheetApp.openById(SPREADSHEET_ID); } catch(e) {
      throw new Error('스프레드시트 접근 실패: ' + e.message);
    }
  }
  if (!ss) throw new Error('스프레드시트를 열 수 없습니다. 권한을 확인하세요.');

  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    const headers = [['ID', '이름', '휴대폰', '지역', '날짜', '시작시간', '종료시간', '등록일시', '상태']];
    sheet.getRange(1, 1, 1, 9).setValues(headers).setFontWeight('bold').setBackground('#FF2778').setFontColor('#ffffff');
    sheet.setFrozenRows(1);
    sheet.setColumnWidths(1, 9, 130);
    // 날짜·시간 컬럼(E,F,G)을 텍스트 형식으로 고정 → 이후 Date 변환 문제 방지
    sheet.getRange('E:G').setNumberFormat('@');
  }
  return sheet;
}

// ---- 구글시트 셀 값 정규화 (Date 객체 → 문자열) ----
function normalizeCell_(val, header) {
  if (!(val instanceof Date)) return (val === null || val === undefined) ? '' : String(val).trim();
  const tz = Session.getScriptTimeZone();
  if (header === '날짜')                     return Utilities.formatDate(val, tz, 'yyyy-MM-dd');
  if (header === '시작시간' || header === '종료시간') return Utilities.formatDate(val, tz, 'HH:mm');
  return Utilities.formatDate(val, tz, 'yyyy-MM-dd HH:mm:ss');
}

// ---- 지역 목록 반환 ----
function getRegions() {
  return REGIONS;
}

// ---- 강의 시간 등록 ----
function registerTime(data) {
  try {
    if (!data.name || !data.phone || !data.region || !data.date || !data.startTime || !data.endTime) {
      return { success: false, message: '모든 항목을 입력해주세요.' };
    }
    if (data.startTime >= data.endTime) {
      return { success: false, message: '종료 시간은 시작 시간보다 늦어야 합니다.' };
    }
    const phoneRegex = /^01[0-9]\d{7,8}$/;
    if (!phoneRegex.test(data.phone.replace(/-/g, ''))) {
      return { success: false, message: '올바른 휴대폰 번호를 입력해주세요.' };
    }

    const existing = getRegisteredTimes_({ date: data.date, region: data.region });
    const conflict = existing.find(item =>
      timeOverlap_(item['시작시간'], item['종료시간'], data.startTime, data.endTime)
    );
    if (conflict) {
      return { success: false, message: `${conflict['이름']} 강사님이 해당 시간대에 이미 등록하셨습니다.` };
    }

    const sheet = getSheet_();
    const id = Utilities.getUuid();
    const now = new Date();
    const tz = Session.getScriptTimeZone();
    const phoneFormatted = formatPhone_(data.phone);

    sheet.appendRow([
      id,
      data.name,
      phoneFormatted,
      data.region,
      data.date,       // 문자열로 저장
      data.startTime,  // 문자열로 저장
      data.endTime,    // 문자열로 저장
      Utilities.formatDate(now, tz, 'yyyy-MM-dd HH:mm:ss'),
      '활성'
    ]);

    // 방금 추가된 행의 날짜·시간 셀을 텍스트 형식으로 재지정 (자동변환 방지)
    const lastRow = sheet.getLastRow();
    sheet.getRange(lastRow, 5, 1, 3).setNumberFormat('@');

    return { success: true, message: `${data.name} 강사님의 강의 시간이 등록되었습니다! 📅` };
  } catch (e) {
    return { success: false, message: '서버 오류: ' + e.message };
  }
}

// ---- 등록된 시간 목록 반환 (공개) ----
function getRegisteredTimes(filter) {
  try {
    return getRegisteredTimes_(filter);
  } catch (e) {
    return [];
  }
}

// ---- 등록된 시간 목록 반환 (내부) ----
function getRegisteredTimes_(filter) {
  const sheet = getSheet_();
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];

  const headers = data[0];
  const rows = data.slice(1).map(row => {
    const obj = {};
    headers.forEach((h, i) => {
      obj[h] = normalizeCell_(row[i], h); // ← Date 객체 → 문자열 변환
    });
    return obj;
  }).filter(r => r['상태'] === '활성');

  if (!filter) return rows;
  return rows.filter(r => {
    if (filter.date   && r['날짜'] !== filter.date)   return false;
    if (filter.region && r['지역'] !== filter.region) return false;
    return true;
  });
}

// ---- 슬롯 상태 반환 ----
function getSlotStatus(date, region) {
  try {
    const registrations = getRegisteredTimes_({ date: date, region: region || '' });
    const slots = {};
    for (let h = 9; h <= 20; h++) {
      const key    = String(h).padStart(2, '0') + ':00';
      const slotEnd = String(h + 1).padStart(2, '0') + ':00';
      const occ = registrations.find(r =>
        timeOverlap_(r['시작시간'], r['종료시간'], key, slotEnd)
      );
      slots[key] = occ
        ? { booked: true,  name: occ['이름'], region: occ['지역'] }
        : { booked: false };
    }
    return { success: true, slots: slots };
  } catch (e) {
    return { success: false, message: e.message };
  }
}

// ---- 등록 취소 ----
function deleteRegistration(id, phone) {
  try {
    const sheet = getSheet_();
    const data = sheet.getDataRange().getValues();
    for (let i = 1; i < data.length; i++) {
      if (String(data[i][0]) === String(id)) {
        const stored = String(data[i][2]).replace(/-/g, '');
        const input  = String(phone).replace(/-/g, '');
        if (stored !== input) return { success: false, message: '휴대폰 번호가 일치하지 않습니다.' };
        sheet.getRange(i + 1, 9).setValue('삭제');
        return { success: true, message: '등록이 취소되었습니다.' };
      }
    }
    return { success: false, message: '해당 등록을 찾을 수 없습니다.' };
  } catch (e) {
    return { success: false, message: '서버 오류: ' + e.message };
  }
}

// ---- 헬퍼 ----
function timeOverlap_(start1, end1, start2, end2) {
  return String(start1) < String(end2) && String(end1) > String(start2);
}

function formatPhone_(phone) {
  const d = phone.replace(/\D/g, '');
  if (d.length === 11) return `${d.slice(0,3)}-${d.slice(3,7)}-${d.slice(7)}`;
  if (d.length === 10) return `${d.slice(0,3)}-${d.slice(3,6)}-${d.slice(6)}`;
  return phone;
}
