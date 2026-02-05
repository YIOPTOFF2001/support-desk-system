const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'tickets.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("Database connection failed:", err.message);
    process.exit(1);
  }
  console.log("Connected to database - fixing ticket priorities...\n");
});

// Update all tickets with correct priority based on category
db.serialize(() => {
  // Update Billing tickets to Urgent
  db.run("UPDATE tickets SET priority = 'Urgent' WHERE category = 'Billing'", function(err) {
    if (err) {
      console.error("Error updating Billing tickets:", err.message);
    } else {
      console.log(`✓ Updated ${this.changes} Billing ticket(s) to Urgent priority`);
    }
  });

  // Update Support tickets to High
  db.run("UPDATE tickets SET priority = 'High' WHERE category = 'Support'", function(err) {
    if (err) {
      console.error("Error updating Support tickets:", err.message);
    } else {
      console.log(`✓ Updated ${this.changes} Support ticket(s) to High priority`);
    }
  });

  // Update Feedback and Uncategorized tickets to Normal
  db.run("UPDATE tickets SET priority = 'Normal' WHERE category IN ('Feedback', 'Uncategorized')", function(err) {
    if (err) {
      console.error("Error updating Feedback/Uncategorized tickets:", err.message);
    } else {
      console.log(`✓ Updated ${this.changes} Feedback/Uncategorized ticket(s) to Normal priority`);
    }
  });

  // Show all tickets
  setTimeout(() => {
    db.all("SELECT id, sender, category, priority FROM tickets ORDER BY id DESC", [], (err, rows) => {
      if (err) {
        console.error("Error fetching tickets:", err.message);
      } else {
        console.log("\nAll tickets:");
        rows.forEach(t => console.log(`  - ID ${t.id}: ${t.sender} (${t.category}) - ${t.priority} priority`));
      }
      db.close();
    });
  }, 500);
});
