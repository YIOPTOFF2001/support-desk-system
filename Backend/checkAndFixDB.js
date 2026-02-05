const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcrypt');

const dbPath = path.join(__dirname, 'tickets.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("Database connection failed:", err.message);
    process.exit(1);
  }
  console.log("Connected to database");
});

// Enable WAL mode to avoid locking issues
db.configure('busyTimeout', 5000);

// Check if is_admin column exists
db.all("PRAGMA table_info(users)", [], (err, rows) => {
  if (err) {
    console.error("Error:", err.message);
    process.exit(1);
  }

  const hasIsAdmin = rows.some(col => col.name === 'is_admin');
  console.log("\nCurrent users table columns:");
  rows.forEach(col => console.log(`  - ${col.name}`));

  if (!hasIsAdmin) {
    console.log("\nAdding is_admin column...");
    db.run("ALTER TABLE users ADD COLUMN is_admin INTEGER DEFAULT 0", (err) => {
      if (err) {
        console.error("Error adding column:", err.message);
      } else {
        console.log("✓ is_admin column added");
      }
      setAdminUser();
    });
  } else {
    console.log("\n✓ is_admin column already exists");
    setAdminUser();
  }
});

function setAdminUser() {
  const adminEmail = 'yolandaproff@gmail.com';
  
  db.all("SELECT * FROM users", [], (err, users) => {
    if (err) {
      console.error("Error fetching users:", err.message);
      db.close();
      process.exit(1);
    }

    console.log("\nCurrent users:");
    users.forEach(u => console.log(`  - ${u.email} (is_admin: ${u.is_admin || 0})`));

    // First, remove admin from all users
    db.run("UPDATE users SET is_admin = 0", [], (err) => {
      if (err) console.error("Error resetting admin:", err.message);
      
      // Then set the new admin
      db.run("UPDATE users SET is_admin = 1 WHERE email = ?", [adminEmail], function(err) {
        
        // Show updated users
        db.all("SELECT id, email, is_admin FROM users", [], (err, users) => {
          console.log("\nUpdated users:");
          users.forEach(u => console.log(`  - ${u.email} (is_admin: ${u.is_admin})`));
          db.close();
          process.exit(0);
        }users
      db.all("SELECT id, email, is_admin FROM users", [], (err, users) => {
        console.log("\nUpdated users:");
        users.forEach(u => console.log(`  - ${u.email} (is_admin: ${u.is_admin})`));
        db.close();
        process.exit(0);
      });
    });
  });
}
