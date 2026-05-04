const { getRows } = require('./_sheets');

module.exports = async function(req, res) {
  try {
    const { date, region } = req.query;
    const rows = await getRows();
    const result = rows.filter(r => {
      if (r['상태'] !== '활성') return false;
      if (date && r['날짜'] !== date) return false;
      if (region && r['지역'] !== region) return false;
      return true;
    });
    res.json(result);
  } catch (e) {
    res.status(500).json([]);
  }
};
