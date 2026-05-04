const { getRows, updateRowStatus } = require('./_sheets');

module.exports = async function(req, res) {
  try {
    const { id, phone } = req.body;
    const rows = await getRows();
    const idx = rows.findIndex(r => String(r['ID']) === String(id));
    if (idx === -1) {
      return res.json({ success: false, message: '해당 등록을 찾을 수 없습니다.' });
    }
    const stored = String(rows[idx]['휴대폰']).replace(/-/g, '');
    const input = String(phone).replace(/-/g, '');
    if (stored !== input) {
      return res.json({ success: false, message: '휴대폰 번호가 일치하지 않습니다.' });
    }
    await updateRowStatus(idx, '삭제');
    res.json({ success: true, message: '등록이 취소되었습니다.' });
  } catch (e) {
    res.status(500).json({ success: false, message: '서버 오류: ' + e.message });
  }
};
