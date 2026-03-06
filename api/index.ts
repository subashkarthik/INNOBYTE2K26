import express, { Request, Response } from "express";
import pg from "pg";
import nodemailer from "nodemailer";
import { GoogleSpreadsheet } from "google-spreadsheet";
import { JWT } from "google-auth-library";

const { Pool } = pg;

// ─── Lazy Initializers ────────────────────────────────────────────────────────
let _pool: pg.Pool | null = null;
function getPool() {
  if (!_pool) {
    if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is missing");
    _pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.DATABASE_URL.includes('supabase') || process.env.DATABASE_URL.includes('neon') || process.env.DATABASE_URL.includes('aiven')
        ? { rejectUnauthorized: false } 
        : false,
      connectionTimeoutMillis: 5000,
      idleTimeoutMillis: 10000,
      max: 10,
    });
    _pool.on('error', (err) => console.error('💥 PostgreSQL Client Error:', err.message));
  }
  return _pool;
}

let _transporter: any = null;
function getTransporter() {
  if (!_transporter) {
    if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) return null;
    _transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });
  }
  return _transporter;
}

let _googleSheetDoc: GoogleSpreadsheet | null = null;
async function getGoogleSheet() {
  if (!_googleSheetDoc) {
    const sheetId = process.env.GOOGLE_SHEET_ID;
    const credsStr = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
    if (!sheetId || !credsStr) return null;
    try {
      const creds = JSON.parse(credsStr);
      const auth = new JWT({
        email: creds.client_email,
        key: creds.private_key,
        scopes: ["https://www.googleapis.com/auth/spreadsheets"],
      });
      _googleSheetDoc = new GoogleSpreadsheet(sheetId, auth);
      await _googleSheetDoc.loadInfo();
    } catch (e: any) {
      console.error("❌ Google Sheets Lazy Init Failed:", e.message);
      return null;
    }
  }
  return _googleSheetDoc;
}

// ─── Admin Auth ───────────────────────────────────────────────────────────────
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "innobyte@admin2026";
const validTokens = new Set<string>();

const generateToken = () =>
  Math.random().toString(36).substring(2) + Date.now().toString(36) + Math.random().toString(36).substring(2);

const requireAuth = (req: Request, res: Response, next: any) => {
  const auth = req.headers.authorization || "";
  const token = auth.replace("Bearer ", "");
  if (!token || !validTokens.has(token)) {
    res.status(410).json({ success: false, message: "Unauthorized or token expired" });
    return;
  }
  next();
};

// ─── SSE (Limited in Serverless) ─────────────────────────────────────────────
const sseClients = new Set<Response>();
function broadcastSSE(data: object) {
  const payload = `data: ${JSON.stringify(data)}\n\n`;
  for (const client of sseClients) {
    try { client.write(payload); } catch (_) { sseClients.delete(client); }
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
async function getTotal(): Promise<number> {
  const pool = getPool();
  const result = await pool.query("SELECT COUNT(*) as c FROM registrations");
  return parseInt(result.rows[0].c, 10);
}

async function sendEmails(
  fullName: string, regId: string, email: string,
  college: string, dept: string, year: string,
  phone: string, events: any[]
) {
  const transporter = getTransporter();
  if (!transporter) return;

  const FROM_EMAIL = process.env.GMAIL_USER;
  const ADMIN_EMAIL = process.env.COORDINATOR_EMAIL;

  const eventList = events.map((e: any) =>
    `<li><b>${e.name}</b>${e.teamName ? ` — Team: <i>${e.teamName}</i>` : ""}${e.count > 1 ? ` (${e.count} members)` : ""}</li>`
  ).join("");

  try {
    await transporter.sendMail({
      from: `"INNOBYTE2K26" <${FROM_EMAIL}>`,
      to: email,
      subject: `🎉 Registration Confirmed — ${regId} | INNOBYTE2K26`,
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:auto;background:#0f172a;color:#e2e8f0;border-radius:16px;overflow:hidden">
          <div style="background:linear-gradient(135deg,#8b5cf6,#06b6d4);padding:32px;text-align:center">
            <h1 style="margin:0;font-size:28px;color:#fff">INNOBYTE<span>2K26</span></h1>
          </div>
          <div style="padding:32px">
            <h2 style="color:#a78bfa">You're In, ${fullName}! 🚀</h2>
            <div style="background:#1e293b;padding:24px;text-align:center;margin:24px 0;border-radius:12px">
              <p style="margin:0;font-size:11px;color:#64748b;text-transform:uppercase">Reg ID</p>
              <p style="margin:8px 0 0;font-size:36px;font-weight:900;color:#a78bfa">${regId}</p>
            </div>
            <ul>${eventList}</ul>
            <p style="text-align:center;font-size:12px;color:#64748b">27 March 2026 | ES College, Villupuram</p>
          </div>
        </div>`,
    });
  } catch (e: any) { console.error("Email Error:", e.message); }

  if (ADMIN_EMAIL) {
    try {
      await transporter.sendMail({
        from: `"INNOBYTE Bot" <${FROM_EMAIL}>`,
        to: ADMIN_EMAIL,
        subject: `[New Registration] ${fullName}`,
        text: `New Registration: ${fullName} (${regId})\nCollege: ${college}\nDept: ${dept}\nEvents: ${events.map(e => e.name).join(", ")}`,
      });
    } catch (e: any) { console.error("Admin Email Error:", e.message); }
  }
}

async function appendToSheet(row: Record<string, string>) {
  const doc = await getGoogleSheet();
  if (!doc) return;
  try {
    const sheet = doc.sheetsByIndex[0];
    await sheet.addRow(row);
  } catch (e: any) { console.error("Sheet Error:", e.message); }
}

// ─── Server Setup ─────────────────────────────────────────────────────────────
const app = express();
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// ─── Routes ───────────────────────────────────────────────────────────────────

app.get("/api/ping", (_req, res) => res.json({ status: "ok", time: new Date().toISOString() }));

app.get("/api/health", async (_req, res) => {
  try {
    const start = Date.now();
    await getPool().query("SELECT 1");
    res.json({ status: "ok", db: "connected", latency: `${Date.now() - start}ms` });
  } catch (err: any) {
    res.status(500).json({ status: "error", message: err.message });
  }
});

app.post("/api/admin/login", (req, res) => {
  const { password } = req.body;
  if (password === ADMIN_PASSWORD) {
    const token = generateToken();
    validTokens.add(token);
    setTimeout(() => validTokens.delete(token), 8 * 60 * 60 * 1000);
    res.json({ success: true, token });
  } else {
    res.status(401).json({ success: false, message: "Invalid password" });
  }
});

app.get("/api/stats/total", async (_req, res) => {
  try { res.json({ success: true, total: await getTotal() }); }
  catch (err) { res.status(500).json({ success: false }); }
});

app.get("/api/events/stream", async (req, res) => {
  try {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders();
    res.write(`data: ${JSON.stringify({ type: "init", total: await getTotal() })}\n\n`);
    sseClients.add(res);
    req.on("close", () => sseClients.delete(res));
  } catch (_) { if (!res.headersSent) res.status(500).end(); }
});

// Register - JSON based, no Multer
app.post("/api/register", async (req, res) => {
  try {
    const { fullName, collegeName, department, year, email, phone, events, paymentScreenshot } = req.body;
    if (!events) return res.status(400).json({ success: false, message: "No events selected" });

    const parsedEvents = typeof events === 'string' ? JSON.parse(events) : events;
    const regId = `INN26-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    // 1 — PostgreSQL
    await getPool().query(`
      INSERT INTO registrations (reg_id, full_name, college_name, department, year, email, phone, events_json, payment_screenshot)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    `, [regId, fullName, collegeName, department, year, email, phone, JSON.stringify(parsedEvents), paymentScreenshot]);

    const total = await getTotal();
    broadcastSSE({ type: "new_registration", regId, fullName, collegeName, department, year, events: parsedEvents, total, timestamp: new Date().toISOString() });

    // 2 — Email & Sheets (awaited for Vercel/Serverless reliability)
    await sendEmails(fullName, regId, email, collegeName, department, year, phone, parsedEvents);
    await appendToSheet({
      reg_id: regId,
      full_name: fullName,
      college: collegeName,
      department,
      year,
      email,
      phone,
      events: parsedEvents.map((e: any) => e.name).join(", "),
      payment: paymentScreenshot ? "UPLOADED (View in Admin)" : "MISSING",
      timestamp: new Date().toISOString(),
    });

    res.json({ success: true, regId });
  } catch (error: any) {
    console.error("💥 Registration Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

app.get("/api/registrations", requireAuth, async (_req, res) => {
  try {
    const result = await getPool().query("SELECT * FROM registrations ORDER BY created_at DESC");
    res.json(result.rows);
  } catch (error: any) { res.status(500).json({ success: false, message: error.message }); }
});

app.delete("/api/registrations/:id", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await getPool().query("DELETE FROM registrations WHERE reg_id = $1", [id]);
    if (result.rowCount && result.rowCount > 0) {
      broadcastSSE({ type: "registration_deleted", regId: id, total: await getTotal() });
      res.json({ success: true });
    } else res.status(404).json({ success: false });
  } catch (error: any) { res.status(500).json({ success: false }); }
});

app.get("/api/stats", requireAuth, async (_req, res) => {
  try {
    const result = await getPool().query("SELECT * FROM registrations");
    const rows = result.rows;
    const byYear: Record<string, number> = {};
    const byDept: Record<string, number> = {};
    const byEvent: Record<string, number> = {};
    for (const r of rows) {
      byYear[r.year] = (byYear[r.year] || 0) + 1;
      byDept[r.department] = (byDept[r.department] || 0) + 1;
      try {
        for (const e of JSON.parse(r.events_json || "[]")) byEvent[e.name] = (byEvent[e.name] || 0) + 1;
      } catch (_) {}
    }
    res.json({
      total: rows.length,
      byYear: Object.entries(byYear).map(([name, value]) => ({ name, value })),
      byDept: Object.entries(byDept).map(([name, value]) => ({ name, value })),
      byEvent: Object.entries(byEvent).map(([name, value]) => ({ name, value })),
    });
  } catch (error: any) { res.status(500).json({ success: false }); }
});

export default app;
