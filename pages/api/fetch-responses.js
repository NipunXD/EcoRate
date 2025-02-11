import { google } from "googleapis";
import path from "path";

const SERVICE_ACCOUNT_FILE = path.resolve(
  process.cwd(),
  "keys/ecorate-442312-171a3bd88a1d.json"
);
const SPREADSHEET_ID = "1PdANpU_Kn8KNkSuVVo3OZLgCLUAJyBn4eLZbo5ShkVs"; // Replace with your sheet ID
const RANGE_NAME = "My new form"; // Replace with your range

export default async function handler(req, res) {
  try {
    const auth = new google.auth.GoogleAuth({
      keyFile: SERVICE_ACCOUNT_FILE,
      scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
    });

    const sheets = google.sheets({ version: "v4", auth });
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: RANGE_NAME,
    });

    const rows = response.data.values;

    if (!rows || rows.length === 0) {
      return res.status(404).json({ error: "No data found in the spreadsheet." });
    }

    const columns = rows[0];
    const data = rows.slice(1).map((row) =>
      columns.reduce((acc, col, idx) => {
        acc[col] = row[idx] || null;
        return acc;
      }, {})
    );

    return res.status(200).json({ columns, data });
  } catch (error) {
    console.error("Error fetching data from Google Sheets:", error.message);
    res.status(500).json({ error: "Failed to fetch data from Google Sheets." });
  }
}
