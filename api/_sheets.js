const { google } = require('googleapis');

const SPREADSHEET_ID = '1mwt1Mo8NieWipz7tYsDjGNWFbBHavA9GDYeDoB51f60';
const SHEET_NAME = '강사시간등록';
const HEADERS = ['ID', '이름', '휴대폰', '지역', '날짜', '시작시간', '종료시간', '등록일시', '상태'];

async function getSheets() {
  const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT);
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  return google.sheets({ version: 'v4', auth });
}

async function getRows() {
  const sheets = await getSheets();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: SHEET_NAME,
    valueRenderOption: 'FORMATTED_VALUE',
  });
  const rows = res.data.values || [];
  if (rows.length <= 1) return [];
  return rows.slice(1).map(row => {
    const obj = {};
    HEADERS.forEach((h, i) => { obj[h] = String(row[i] || '').trim(); });
    return obj;
  });
}

async function appendRow(values) {
  const sheets = await getSheets();
  await sheets.spreadsheets.values.append({
    spreadsheetId: SPREADSHEET_ID,
    range: SHEET_NAME + '!A:I',
    valueInputOption: 'RAW',
    insertDataOption: 'INSERT_ROWS',
    requestBody: { values: [values] },
  });
}

async function updateRowStatus(rowIndex, status) {
  const sheets = await getSheets();
  await sheets.spreadsheets.values.update({
    spreadsheetId: SPREADSHEET_ID,
    range: `${SHEET_NAME}!I${rowIndex + 2}`,
    valueInputOption: 'RAW',
    requestBody: { values: [[status]] },
  });
}

function timeOverlap(s1, e1, s2, e2) {
  return String(s1) < String(e2) && String(e1) > String(s2);
}

function formatPhone(phone) {
  const d = phone.replace(/\D/g, '');
  if (d.length === 11) return `${d.slice(0,3)}-${d.slice(3,7)}-${d.slice(7)}`;
  if (d.length === 10) return `${d.slice(0,3)}-${d.slice(3,6)}-${d.slice(6)}`;
  return phone;
}

module.exports = { getRows, appendRow, updateRowStatus, timeOverlap, formatPhone };
