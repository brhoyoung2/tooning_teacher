const { google } = require('googleapis');

const SPREADSHEET_ID = '1mwt1Mo8NieWipz7tYsDjGNWFbBHavA9GDYeDoB51f60';
const SHEET_NAME = '강사요청';

module.exports = async function(req, res) {
  try {
    const { schoolName, teacherName, phone, date, startTime, endTime, classCount, note } = req.body;
    if (!schoolName || !teacherName || !phone || !date || !classCount) {
      return res.json({ success: false, message: '필수 항목을 모두 입력해주세요.' });
    }

    const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT);
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    const sheets = google.sheets({ version: 'v4', auth });

    const id = Math.random().toString(36).substr(2, 9) + Date.now();
    const now = new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' });

    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: SHEET_NAME + '!A:K',
      valueInputOption: 'RAW',
      insertDataOption: 'INSERT_ROWS',
      requestBody: {
        values: [[id, schoolName, teacherName, phone, date, startTime || '', endTime || '', classCount, note || '', now, '대기']]
      }
    });

    res.json({ success: true, message: '강사 요청이 접수되었습니다. 담당자가 연락드리겠습니다.' });
  } catch (e) {
    res.status(500).json({ success: false, message: '서버 오류: ' + e.message });
  }
};
