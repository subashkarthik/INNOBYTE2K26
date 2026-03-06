import "dotenv/config";
import express, { Request, Response } from "express";
import { createServer as createViteServer } from "vite";
import pg from "pg";
import path from "path";
import { fileURLToPath } from "url";
import multer from "multer";
import fs from "fs";
import { Resend } from "resend";

const { Pool } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ─── PostgreSQL Database ──────────────────────────────────────────────────────
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('supabase') || process.env.DATABASE_URL?.includes('neon') || process.env.DATABASE_URL?.includes('aiven')
    ? { rejectUnauthorized: false } 
    : false,
  connectionTimeoutMillis: 5000, // 5 seconds to connect
  idleTimeoutMillis: 10000,     // 10 seconds idle
  max: 10,                      // max connections
});

// Initialize Table
const initDB = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS registrations (
        id                 SERIAL PRIMARY KEY,
        reg_id             TEXT UNIQUE,
        full_name          TEXT,
        college_name       TEXT,
        department         TEXT,
        year               TEXT,
        email              TEXT,
        phone              TEXT,
        events_json        TEXT,
        payment_screenshot TEXT,
        created_at         TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log("✅  PostgreSQL Database ready");
  } catch (err) {
    console.error("❌  Database initialization failed:", err);
  }
};
initDB();

pool.on('error', (err) => {
  console.error('💥 Unexpected error on idle PostgreSQL client:', err.message);
});

// ─── Resend (Email) ───────────────────────────────────────────────────────────
// Get free API key → https://resend.com  (3000 emails/month free)
const resendApiKey = process.env.RESEND_API_KEY || "";
const resend = resendApiKey ? new Resend(resendApiKey) : null;
const FROM_EMAIL   = process.env.FROM_EMAIL       || "onboarding@resend.dev";
const ADMIN_EMAIL  = process.env.ADMIN_EMAIL       || "";
if (resend) console.log("✅  Email (Resend) ready");
else        console.log("⚠️   Resend not set — emails skipped (set RESEND_API_KEY)");

// ─── SheetDB (Google Sheets, no code) ────────────────────────────────────────
// Connect your Sheet → https://sheetdb.io  → copy the API URL
const SHEETDB_URL = process.env.SHEETDB_URL || "";
if (SHEETDB_URL) console.log("✅  Google Sheets (SheetDB) ready");
else             console.log("⚠️   SheetDB not set — sheet skipped (set SHEETDB_URL)");

// ─── Admin Auth ───────────────────────────────────────────────────────────────
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "innobyte@admin2026";
// Simple in-memory token store (sufficient for a local/small deployment)
const validTokens = new Set<string>();

const generateToken = () =>
  Math.random().toString(36).substring(2) + Date.now().toString(36) + Math.random().toString(36).substring(2);

const requireAuth = (req: Request, res: Response, next: any) => {
  const auth = req.headers.authorization || "";
  const token = auth.replace("Bearer ", "");
  if (!token || !validTokens.has(token)) {
    res.status(401).json({ success: false, message: "Unauthorized" });
    return;
  }
  next();
};

// ─── SSE Client Store ─────────────────────────────────────────────────────────
const sseClients = new Set<Response>();
function broadcastSSE(data: object) {
  const payload = `data: ${JSON.stringify(data)}\n\n`;
  for (const client of sseClients) {
    try { client.write(payload); } catch (_) { sseClients.delete(client); }
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
async function getTotal(): Promise<number> {
  const result = await pool.query("SELECT COUNT(*) as c FROM registrations");
  return parseInt(result.rows[0].c, 10);
}

async function sendEmails(
  fullName: string, regId: string, email: string,
  college: string, dept: string, year: string,
  phone: string, events: any[]
) {
  if (!resend) return;
  const eventList = events.map((e: any) =>
    `<li><b>${e.name}</b>${e.teamName ? ` — Team: <i>${e.teamName}</i>` : ""}${e.count > 1 ? ` (${e.count} members)` : ""}</li>`
  ).join("");

  // Student confirmation email
  resend.emails.send({
    from: `INNOBYTE2K26 <${FROM_EMAIL}>`,
    to: [email],
    subject: `🎉 Registration Confirmed — ${regId} | INNOBYTE2K26`,
    html: `
      <div style="font-family:Inter,sans-serif;max-width:600px;margin:auto;background:#0f172a;color:#e2e8f0;border-radius:16px;overflow:hidden">
        <div style="background:linear-gradient(135deg,#8b5cf6,#06b6d4);padding:32px;text-align:center">
          <h1 style="margin:0;font-size:28px;color:#fff;letter-spacing:-1px">INNOBYTE<span>2K26</span></h1>
          <p style="margin:8px 0 0;color:#e0e7ff;font-size:14px">ES College of Engineering and Technology</p>
        </div>
        <div style="padding:32px">
          <h2 style="color:#a78bfa;margin-top:0">You're In, ${fullName}! 🚀</h2>
          <p style="color:#94a3b8">Your registration for INNOBYTE2K26 on <b>27 March 2026</b> is confirmed.</p>
          <div style="background:#1e293b;border:1px solid #334155;border-radius:12px;padding:24px;text-align:center;margin:24px 0">
            <p style="margin:0;font-size:11px;text-transform:uppercase;letter-spacing:3px;color:#64748b">Your Registration ID</p>
            <p style="margin:8px 0 0;font-size:36px;font-weight:900;font-family:monospace;color:#a78bfa">${regId}</p>
          </div>
          <h3 style="color:#e2e8f0;margin-bottom:8px">Events Registered:</h3>
          <ul style="color:#94a3b8;padding-left:20px;line-height:2">${eventList}</ul>
          <hr style="border:none;border-top:1px solid #334155;margin:24px 0">
          <p style="color:#64748b;font-size:13px;text-align:center">
            📅 <b style="color:#e2e8f0">27 March 2026</b> &nbsp;|&nbsp; 8:30 AM onwards<br>
            📍 ES College of Engineering and Technology, Villupuram
          </p>
          <p style="color:#475569;font-size:12px;text-align:center;margin-top:16px">
            Questions? Mail us at <a href="mailto:innobyte@escollege.edu.in" style="color:#a78bfa">innobyte@escollege.edu.in</a>
          </p>
        </div>
      </div>`,
  }).catch((e: any) => console.error("Student email failed:", e?.message));

  // Admin notification email
  if (ADMIN_EMAIL) {
    const eventNames = events.map((e: any) => e.name).join(", ");
    resend.emails.send({
      from: `INNOBYTE Bot <${FROM_EMAIL}>`,
      to: [ADMIN_EMAIL],
      subject: `[New Registration] ${fullName} — ${regId}`,
      text: [
        "New Registration\n",
        `Name:     ${fullName}`,
        `Reg ID:   ${regId}`,
        `College:  ${college}`,
        `Dept:     ${dept} / ${year} Year`,
        `Email:    ${email}`,
        `Phone:    ${phone}`,
        `Events:   ${eventNames}`,
      ].join("\n"),
    }).catch((e: any) => console.error("Admin email failed:", e?.message));
  }
}

async function appendToSheet(row: Record<string, string>) {
  if (!SHEETDB_URL) return;
  fetch(SHEETDB_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Accept": "application/json" },
    body: JSON.stringify({ data: row }),
  }).catch((e) => console.error("SheetDB append failed:", e?.message));
}

// ─── File Uploads ─────────────────────────────────────────────────────────────
const isVercel = !!process.env.VERCEL;
const uploadDir = isVercel ? "/tmp/uploads" : path.join(__dirname, "uploads");

// Use memoryStorage on Vercel to avoid filesystem issues
const storage = isVercel 
  ? multer.memoryStorage() 
  : multer.diskStorage({
      destination: (_req, _file, cb) => {
        if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
        cb(null, uploadDir);
      },
      filename: (_req, file, cb) => {
        const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        cb(null, `${file.fieldname}-${unique}${path.extname(file.originalname)}`);
      },
    });

const upload = multer({ storage });

// ─── Server ───────────────────────────────────────────────────────────────────
const app = express();
export default app;

app.use(express.json());
app.use("/uploads", express.static(uploadDir));

// ─── Health check ─────────────────────────────────────────────────────────────
app.get("/api/health", async (_req, res) => {
  try {
    const start = Date.now();
    await pool.query("SELECT 1");
    res.json({ status: "ok", db: "connected", latency: `${Date.now() - start}ms` });
  } catch (err: any) {
    res.status(500).json({ status: "error", message: err.message });
  }
});

// Admin Login
app.post("/api/admin/login", (req: Request, res: Response) => {
  const { password } = req.body;
  if (password === ADMIN_PASSWORD) {
    const token = generateToken();
    validTokens.add(token);
    // Auto-expire token after 8 hours
    setTimeout(() => validTokens.delete(token), 8 * 60 * 60 * 1000);
    res.json({ success: true, token });
  } else {
    res.status(401).json({ success: false, message: "Invalid password" });
  }
});

// Stats — simpler endpoint for polling fallback
app.get("/api/stats/total", async (_req: Request, res: Response) => {
  try {
    res.json({ success: true, total: await getTotal() });
  } catch (err) {
    res.status(500).json({ success: false, message: "Database error" });
  }
});

// SSE — real-time live feed (Warning: limited support on Vercel)
app.get("/api/events/stream", async (req: Request, res: Response) => {
  try {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders();
    res.write(`data: ${JSON.stringify({ type: "init", total: await getTotal() })}\n\n`);
    sseClients.add(res);
    req.on("close", () => sseClients.delete(res));
  } catch (err) {
    console.error("SSE init failed:", err);
    if (!res.headersSent) res.status(500).end();
  }
});

// Register — main endpoint
app.post("/api/register", upload.single("paymentScreenshot"), async (req: Request, res: Response) => {
  try {
    const { fullName, collegeName, department, year, email, phone, events } = req.body;
    if (!events) { res.status(400).json({ success: false, message: "No events selected" }); return; }

    let parsedEvents: any[] = [];
    try { parsedEvents = JSON.parse(events); } catch { parsedEvents = []; }

    const isMemory = !!(req.file && 'buffer' in req.file);
    let paymentScreenshot = null;

    if (req.file) {
      if (isMemory) {
        // Vercel / Memory Storage mode
        paymentScreenshot = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
      } else {
        // Disk Storage mode
        paymentScreenshot = `/uploads/${req.file.filename}`;
      }
    }

    const regId = `INN26-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    // 1 — Save to PostgreSQL
    await pool.query(`
      INSERT INTO registrations
        (reg_id, full_name, college_name, department, year, email, phone, events_json, payment_screenshot)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    `, [regId, fullName, collegeName, department, year, email, phone, events, paymentScreenshot]);

    const total = await getTotal();

    // 2 — Real-time SSE broadcast
    broadcastSSE({ type: "new_registration", regId, fullName, collegeName, department, year, events: parsedEvents, total, timestamp: new Date().toISOString() });

    // 3 — Send emails (non-blocking)
    sendEmails(fullName, regId, email, collegeName, department, year, phone, parsedEvents);

    // 4 — Append to Google Sheet via SheetDB (non-blocking)
    // NOTE: We DO NOT send the Base64 screenshot to SheetDB 
    // because it exceeds Google Sheets cell limits and request size.
    appendToSheet({
      reg_id:     regId,
      full_name:  fullName,
      college:    collegeName,
      department,
      year,
      email,
      phone,
      events:     parsedEvents.map((e: any) => e.name).join(", "),
      payment:    paymentScreenshot ? "UPLOADED (View in Admin)" : "MISSING",
      timestamp:  new Date().toISOString(),
    });

    res.json({ success: true, regId });
  } catch (error: any) {
    console.error("Registration error:", error.message);
    res.status(500).json({ success: false, message: "Registration failed. Please try again." });
  }
});

// All registrations (for admin dashboard — requires auth)
app.get("/api/registrations", requireAuth, async (_req: Request, res: Response) => {
  try {
    const result = await pool.query("SELECT * FROM registrations ORDER BY created_at DESC");
    res.json(result.rows);
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete registration (admin only)
app.delete("/api/registrations/:id", requireAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await pool.query("DELETE FROM registrations WHERE reg_id = $1", [id]);
    if (result.rowCount && result.rowCount > 0) {
      broadcastSSE({ type: "registration_deleted", regId: id, total: await getTotal() });
      res.json({ success: true });
    } else {
      res.status(404).json({ success: false, message: "Registration not found." });
    }
  } catch (error: any) {
    console.error("Delete error:", error.message);
    res.status(500).json({ success: false, message: "Server error during deletion." });
  }
});

// Stats (requires auth)
app.get("/api/stats", requireAuth, async (_req: Request, res: Response) => {
  try {
    const result = await pool.query("SELECT * FROM registrations");
    const rows = result.rows;
    const byYear: Record<string, number> = {};
    const byDept: Record<string, number> = {};
    const byEvent: Record<string, number> = {};
    for (const r of rows) {
      byYear[r.year] = (byYear[r.year] || 0) + 1;
      byDept[r.department] = (byDept[r.department] || 0) + 1;
      try {
        for (const e of JSON.parse(r.events_json || "[]"))
          byEvent[e.name] = (byEvent[e.name] || 0) + 1;
      } catch (_) {}
    }
    res.json({
      total: rows.length,
      byYear: Object.entries(byYear).map(([name, value]) => ({ name, value })),
      byDept: Object.entries(byDept).map(([name, value]) => ({ name, value })),
      byEvent: Object.entries(byEvent).map(([name, value]) => ({ name, value })),
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Admin Trends (requires auth)
app.get("/api/admin/trends", requireAuth, async (_req: Request, res: Response) => {
  try {
    const result = await pool.query(`
      SELECT TO_CHAR(created_at, 'YYYY-MM-DD') as date, COUNT(*) as count 
      FROM registrations 
      GROUP BY date 
      ORDER BY date ASC
    `);
    res.json(result.rows);
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Admin Broadcast (requires auth)
app.post("/api/admin/broadcast", requireAuth, async (req: Request, res: Response) => {
  const { subject, message } = req.body;
  if (!resend) return res.status(503).json({ success: false, message: "Email service not configured" });
  if (!subject || !message) return res.status(400).json({ success: false, message: "Subject and message required" });

  try {
    const result = await pool.query("SELECT email FROM registrations");
    const emails = result.rows.map(r => r.email);

    if (emails.length === 0) return res.json({ success: true, count: 0 });

    // Batch emails in groups of 50 to respect rate limits if any
    const batchSize = 50;
    for (let i = 0; i < emails.length; i += batchSize) {
      const batch = emails.slice(i, i + batchSize);
      await resend.emails.send({
        from: `INNOBYTE2K26 Admin <${FROM_EMAIL}>`,
        to: batch,
        subject: subject,
        html: `
          <div style="font-family:sans-serif;max-width:600px;margin:auto;padding:20px;border:1px solid #eee;border-radius:10px">
            <h2 style="color:#8b5cf6">INNOBYTE2K26 Update</h2>
            <div style="line-height:1.6;color:#444">
              ${message.replace(/\n/g, '<br>')}
            </div>
            <hr style="border:none;border-top:1px solid #eee;margin:20px 0">
            <p style="font-size:12px;color:#999">You are receiving this because you registered for INNOBYTE2K26.</p>
          </div>
        `,
      });
    }

    res.json({ success: true, count: emails.length });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Vite (dev) / static (prod)
// Move this to top level too
if (process.env.NODE_ENV === "production" && !process.env.VITE_DEV) {
  app.use(express.static(path.join(__dirname, "dist")));
  app.get("*", (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(__dirname, "dist", "index.html"));
  });
}

// Global Error Handler (Ensures all errors return JSON)
app.use((err: any, _req: Request, res: Response, _next: any) => {
  console.error("💥 Server Error:", err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
    error: process.env.NODE_ENV === "development" ? err.stack : undefined
  });
});

async function startServer() {
  const PORT = Number(process.env.PORT) || 3000;

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({ server: { middlewareMode: true }, appType: "spa" });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (_req, res) => res.sendFile(path.join(__dirname, "dist", "index.html")));
  }

  const server = app.listen(PORT, "0.0.0.0", () => {
    console.log(`\n🚀  Server running → http://localhost:${PORT}\n`);
  });

  // Graceful Shutdown
  const shutdown = () => {
    console.log('\nShutting down gracefully...');
    server.close(async () => {
      await pool.end();
      console.log('PostgreSQL connection pool closed.');
      process.exit(0);
    });
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

if (process.env.NODE_ENV !== "production" || (!process.env.VERCEL && !process.env.VITE_DEV)) {
  startServer();
}
