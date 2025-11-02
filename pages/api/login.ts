import type { NextApiRequest, NextApiResponse } from 'next';

/**
 * Helper to parse a simple CSV string into an array of objects. This parser
 * handles quoted fields and commas inside quoted values. It returns an array
 * of objects where the keys are taken from the header row.
 */
function parseCsv(csv: string): Record<string, string>[] {
  const lines = csv.trim().split(/\r?\n/);
  const header = lines[0]
    .split(/,(?=(?:[^\"]*\"[^\"]*\")*[^\"]*$)/)
    .map((h) => h.replace(/^\"|\"$/g, '').trim());
  const rows: Record<string, string>[] = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i]
      .split(/,(?=(?:[^\"]*\"[^\"]*\")*[^\"]*$)/)
      .map((c) => c.replace(/^\"|\"$/g, '').trim());
    const record: Record<string, string> = {};
    header.forEach((key, idx) => {
      record[key] = cols[idx] ?? '';
    });
    rows.push(record);
  }
  return rows;
}

/**
 * Attempts to fetch the user table from a Google Sheet. Supports two modes:
 *
 * 1. Public CSV export (no credentials): requires `SHEET_ID` and optionally
 *    `SHEET_GID`. It fetches the CSV via `export?format=csv` and parses it.
 *
 * 2. Private access via service account: requires both
 *    `GOOGLE_SERVICE_ACCOUNT_EMAIL` and `GOOGLE_SERVICE_PRIVATE_KEY` along
 *    with `SHEET_ID`. This mode uses the `googleapis` library to read the
 *    sheet. Note: this code will only run if the library is installed and
 *    the environment allows outbound requests.
 */
async function getUsersFromSheet(): Promise<Record<string, string>[]> {
  const sheetId = process.env.SHEET_ID;
  const gid = process.env.SHEET_GID || '0';
  const svcEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const svcKey = process.env.GOOGLE_SERVICE_PRIVATE_KEY;
  if (!sheetId) {
    throw new Error('SHEET_ID environment variable is not set');
  }
  // If no service account credentials are provided, fall back to public CSV
  if (!svcEmail || !svcKey) {
    const url = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${gid}`;
    const resp = await fetch(url);
    if (!resp.ok) {
      throw new Error(`Failed to fetch sheet (status ${resp.status})`);
    }
    const csvText = await resp.text();
    return parseCsv(csvText);
  }
  // Service account mode: dynamically import googleapis to reduce bundle size
  const { google } = await import('googleapis');
  const auth = new google.auth.JWT(
    svcEmail,
    undefined,
    // The private key may contain escaped newlines (\n). Replace them with real newlines.
    svcKey.replace(/\\n/g, '\n'),
    ['https://www.googleapis.com/auth/spreadsheets.readonly']
  );
  const sheets = google.sheets({ version: 'v4', auth });
  const range = process.env.SHEET_RANGE || 'Usuarios!A1:Z';
  const result = await sheets.spreadsheets.values.get({ spreadsheetId: sheetId, range });
  const values = result.data.values || [];
  if (values.length === 0) return [];
  const header = values[0].map((h: any) => String(h).trim());
  const rows = values.slice(1).map((row: any[]) => {
    const record: Record<string, string> = {};
    header.forEach((key: string, idx: number) => {
      record[key] = row[idx] != null ? String(row[idx]) : '';
    });
    return record;
  });
  return rows;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Missing credentials' });
  }
  try {
    const users = await getUsersFromSheet();
    // Normalize header names to match expected keys. The sheet should contain
    // columns like `email`, `senha` (password), `status`, `maxCompanies`, `maxDevices` etc.
    // We perform a case-insensitive comparison to find matching user.
    const found = users.find((u) =>
      u.email?.toLowerCase() === String(email).toLowerCase() &&
      (u.senha || u.password)?.trim() === String(password)
    );
    if (!found) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    // Check for user status (ativo) if present
    if (found.status && found.status.toLowerCase() !== 'ativo') {
      return res.status(403).json({ message: 'User is not active' });
    }
    // Determine companies list. For demo purposes, generate generic names
    const maxCompanies = found.maxCompanies ? parseInt(found.maxCompanies, 10) || 1 : 1;
    const maxDevices = found.maxDevices ? parseInt(found.maxDevices, 10) || 1 : 1;
    const companies: string[] = [];
    for (let i = 1; i <= maxCompanies; i++) {
      companies.push(`Empresa ${i}`);
    }
    // Issue a fake JWT token; in production you would sign a real token
    return res.status(200).json({
      token: 'fake-jwt-token',
      companies,
      maxCompanies,
      maxDevices,
    });
  } catch (err: any) {
    console.error('Login error', err);
    return res.status(500).json({ message: 'Failed to authenticate', error: err.message || String(err) });
  }
}