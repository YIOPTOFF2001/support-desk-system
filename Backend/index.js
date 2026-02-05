const express = require("express");
const db = require("./db");
const cors = require("cors"); // import cors

const app = express(); 
app.use(cors()); // allow cross-origin requests

const PORT = 5000;

// Middleware to parse JSON
app.use(cors());
app.use(express.json()); 


// Middleware to authenticate user from headers
app.use((req, res, next) => {
  const userId = req.headers["user-id"];

  if (!userId) {
    return next();
  }

  db.get(
    "SELECT id, email, is_admin FROM users WHERE id = ?",
    [userId],
    (err, user) => {
      if (user) {
        req.user = user;
      }
      next();
    }
  );
});


// POST Routes to create a new ticket
app.post("/tickets", (req, res) => {
    const { user_id, sender, message, category } = req.body;

  // Auto-assign priority based on category
  let priority = 'Normal';
  const categoryType = category || 'Uncategorized';
  if (categoryType === 'Billing') {
    priority = 'Urgent';
  } else if (categoryType === 'Support') {
    priority = 'High';
  }

  const query = `INSERT INTO tickets (user_id, sender, message, category, priority, status) VALUES (?, ?, ?, ?, ?, 'Open')`;

  db.run(query, [user_id, sender, message, categoryType, priority], function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({ id: this.lastID, sender, message, category: categoryType, priority: priority, status: 'Open' });
    });
});
// Middleware to check admin access
function requireAdmin(req, res, next) {
  const { is_admin } = req.user;

  if (!is_admin) {
    return res.status(403).json({ error: "Admin access only" });
  }

  next();
}

// GET Route to fetch all tickets (admin only)
app.get("/admin/tickets", requireAdmin, (req, res) => {
  db.all("SELECT * FROM tickets ORDER BY CASE priority WHEN 'Urgent' THEN 1 WHEN 'High' THEN 2 WHEN 'Normal' THEN 3 END, created_at DESC", [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// PATCH Route to update ticket status and priority (admin only)
app.patch("/admin/tickets/:id", requireAdmin, (req, res) => {
  const { status, priority } = req.body;
  const ticketId = req.params.id;

  db.run(
    `UPDATE tickets SET status = ?, priority = ? WHERE id = ?`,
    [status, priority, ticketId],
    function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      res.json({ success: true });
    }
  );
});


// GET Route to fetch all tickets
app.get("/tickets", (req, res) => {

    const { user_id } = req.query;
    const query = `SELECT * FROM tickets WHERE user_id = ?`;
    db.all(query, [user_id], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ tickets: rows });
    });
});
// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

// Update ticket status
app.patch("/tickets/:id", (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const query = "UPDATE tickets SET status = ? WHERE id = ?";
  db.run(query, [status, id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Ticket updated", id, status });
  });
});

// Register a new user
const bcrypt = require("bcrypt");

app.post("/register", async (req, res) => {
  const { name, email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  const query = `INSERT INTO users (name, email, password) VALUES (?, ?, ?)`;
  db.run(query, [name, email, hashedPassword], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ id: this.lastID, name, email });
  });
});

// User login
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  const query = `SELECT * FROM users WHERE email = ?`;
  db.get(query, [email], async (err, user) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!user) return res.status(400).json({ error: "User not found" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ error: "Incorrect password" });

    res.json({ id: user.id, name: user.name, email: user.email, is_admin: user.is_admin });
  });
});





