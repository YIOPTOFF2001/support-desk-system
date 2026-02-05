const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'tickets.db');
const db = new sqlite3.Database(dbPath);

db.run("UPDATE tickets SET priority = 'High' WHERE id IN (13, 14)", function(err) {
  if (err) {
    console.error('Error:', err.message);
  } else {
    console.log('✓ Updated 2 Support tickets to High priority');
  }
  db.close();
});
