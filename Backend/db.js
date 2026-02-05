const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const dbPath = path.join(__dirname, "tickets.db");
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) console.error("Database connection failed:", err.message);
  else console.log("Connected to SQLite database");
});

db.serialize(() => {
  // Create users table
  db.run(
    `CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      is_admin INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
    (err) => {
      if (err) console.error("Failed to create users table:", err.message);
      else console.log("Users table ready");
    }
  );

  // Create tickets table
  db.run(
    `CREATE TABLE IF NOT EXISTS tickets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      sender TEXT,
      message TEXT,
      category TEXT,
      priority TEXT,
      status TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )`,
    (err) => {
      if (err) console.error("Failed to create tickets table:", err.message);
      else console.log("Tickets table ready");
    }
  );

  // Set admin user on startup
  db.run("UPDATE users SET is_admin = 0", () => {
    db.run("UPDATE users SET is_admin = 1 WHERE email = ?", ['yolandaproff@gmail.com'], (err) => {
      if (!err) console.log("✓ Admin user set to yolandaproff@gmail.com");
    });
  });
});

module.exports = db;
