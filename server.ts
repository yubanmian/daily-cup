import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("dailycup.db");

// Initialize database
db.exec(`
  CREATE TABLE IF NOT EXISTS drink_records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    price REAL,
    calories INTEGER,
    rating INTEGER,
    notes TEXT,
    image_path TEXT,
    tags TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/records", (req, res) => {
    const records = db.prepare("SELECT * FROM drink_records ORDER BY timestamp DESC").all();
    res.json(records);
  });

  app.post("/api/records", (req, res) => {
    const { name, price, calories, rating, notes, image_path, tags } = req.body;
    const info = db.prepare(`
      INSERT INTO drink_records (name, price, calories, rating, notes, image_path, tags)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(name, price, calories, rating, notes, image_path, tags);
    res.json({ id: info.lastInsertRowid });
  });

  app.delete("/api/records/:id", (req, res) => {
    db.prepare("DELETE FROM drink_records WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
