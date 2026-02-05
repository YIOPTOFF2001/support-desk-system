const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'tickets.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("Database connection failed:", err.message);
    process.exit(1);
  }
  console.log("Checking Support tickets priority...\n");
});

db.all("SELECT id, sender, category, priority, status FROM tickets WHERE category = 'Support' ORDER BY id DESC", [], (err, rows) => {
  if (err) {
    console.error("Error:", err.message);
  } else {
    console.log("All Support tickets:");
    rows.forEach(t => console.log(`  - ID ${t.id}: ${t.sender} - ${t.priority} priority (Status: ${t.status})`));
  }
  db.close();
});
