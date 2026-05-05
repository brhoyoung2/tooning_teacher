const { getRows, timeOverlap } = require('./_sheets');

module.exports = async function(req, res) {
  try {
    const { date, region } = req.query;
    const rows = await getRows();
    const registrations = rows.filter(r =>
      r['상태'] === '활성' &&
      r['날짜'] === date &&
      (!region || r['지역'] === region)
    );
    const slots = {};
    for (let h = 9; h <= 20; h++) {
      const key = String(h).padStart(2, '0') + ':00';
      const slotEnd = String(h + 1).padStart(2, '0') + ':00';
      const occ = registrations.filter(r => timeOverlap(r['시작시간'], r['종료시간'], key, slotEnd));
      slots[key] = {
        count: occ.length,
        instructors: occ.map(r => ({ name: r['이름'], region: r['지역'] }))
      };
    }
    res.json({ success: true, slots });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};
