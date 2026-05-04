const { getRows } = require('./_sheets');

module.exports = async function(req, res) {
  try {
    const { startDate, endDate, region } = req.query;
    if (!startDate || !endDate) return res.json({ success: false, message: '날짜 범위 필요' });

    const rows = await getRows();
    const result = {};

    const cur = new Date(startDate + 'T00:00:00');
    const end = new Date(endDate + 'T00:00:00');
    while (cur <= end) {
      const d = cur.getFullYear() + '-' + String(cur.getMonth()+1).padStart(2,'0') + '-' + String(cur.getDate()).padStart(2,'0');
      result[d] = [];
      cur.setDate(cur.getDate() + 1);
    }

    rows.forEach(function(r) {
      if (r['상태'] !== '활성') return;
      const date = r['날짜'];
      if (!result.hasOwnProperty(date)) return;
      if (region && r['지역'] !== region) return;
      result[date].push({ '이름': r['이름'], '지역': r['지역'], '시작시간': r['시작시간'], '종료시간': r['종료시간'], 'ID': r['ID'] });
    });

    res.json({ success: true, data: result });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};
