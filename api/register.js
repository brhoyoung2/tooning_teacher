const { getRows, appendRow, timeOverlap, formatPhone } = require('./_sheets');

module.exports = async function(req, res) {
  try {
    const data = req.body;
    if (!data.name || !data.phone || !data.region || !data.date || !data.startTime || !data.endTime) {
      return res.json({ success: false, message: '모든 항목을 입력해주세요.' });
    }
    if (data.startTime >= data.endTime) {
      return res.json({ success: false, message: '종료 시간은 시작 시간보다 늦어야 합니다.' });
    }
    const phoneClean = data.phone.replace(/-/g, '');
    const phoneRegex = /^01[0-9]\d{7,8}$/;
    if (!phoneRegex.test(phoneClean)) {
      return res.json({ success: false, message: '올바른 휴대폰 번호를 입력해주세요.' });
    }

    const rows = await getRows();
    // 동일 강사(같은 번호)의 당일 시간 중복만 차단 — 다른 강사는 같은 시간 등록 가능
    const myRows = rows.filter(r =>
      r['상태'] === '활성' &&
      r['날짜'] === data.date &&
      String(r['휴대폰']).replace(/-/g, '') === phoneClean
    );
    const selfConflict = myRows.find(r =>
      timeOverlap(r['시작시간'], r['종료시간'], data.startTime, data.endTime)
    );
    if (selfConflict) {
      return res.json({ success: false, message: '이미 해당 시간대에 등록하셨습니다.' });
    }

    const id = Math.random().toString(36).substr(2, 9) + Date.now();
    const now = new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' });
    const phoneFormatted = formatPhone(data.phone);

    await appendRow([id, data.name, phoneFormatted, data.region, data.date, data.startTime, data.endTime, now, '활성']);
    res.json({ success: true, message: `${data.name} 강사님의 강의 시간이 등록되었습니다!` });
  } catch (e) {
    res.status(500).json({ success: false, message: '서버 오류: ' + e.message });
  }
};
