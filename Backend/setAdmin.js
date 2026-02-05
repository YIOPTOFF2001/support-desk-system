const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'tickets.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("Database connection failed:", err.message);
    process.exit(1);
  }
});

db.configure('busyTimeout', 5000);

const adminEmail = 'yolandaproff@gmail.com';

// Remove admin from all users, then set new admin
db.serialize(() => {
  db.run("UPDATE users SET is_admin = 0", (err) => {
    if (err) console.error("Error resetting admin:", err.message);
  });

  db.run("UPDATE users SET is_admin = 1 WHERE email = ?", [adminEmail], function(err) {
    if (err) {
      console.error("Error updating admin:", err.message);
    } else {
      console.log(`✓ Set ${adminEmail} as admin`);
    }
  });

  db.all("SELECT id, email, is_admin FROM users", [], (err, users) => {
    console.log("\nUpdated users:");
    users.forEach(u => console.log(`  - ${u.email} (is_admin: ${u.is_admin})`));
    db.close();
  });
});
