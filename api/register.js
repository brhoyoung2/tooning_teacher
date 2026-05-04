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
    const phoneRegex = /^01[0-9]\d{7,8}$/;
    if (!phoneRegex.test(data.phone.replace(/-/g, ''))) {
      return res.json({ success: false, message: '올바른 휴대폰 번호를 입력해주세요.' });
    }

    const rows = await getRows();
    const existing = rows.filter(r =>
      r['상태'] === '활성' && r['날짜'] === data.date && r['지역'] === data.region
    );
    const conflict = existing.find(r =>
      timeOverlap(r['시작시간'], r['종료시간'], data.startTime, data.endTime)
    );
    if (conflict) {
      return res.json({ success: false, message: `${conflict['이름']} 강사님이 해당 시간대에 이미 등록하셨습니다.` });
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
