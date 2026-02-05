import { useEffect, useState } from "react";
import "./AdminDashboard.css";



function AdminDashboard({ currentUser }) {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser || !currentUser.is_admin) return;

    fetch("http://localhost:5000/admin/tickets", {
      headers: { "user-id": currentUser.id },
    })
      .then((res) => res.json())
      .then((data) => {
        setTickets(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch tickets:", err);
        setLoading(false);
      });
  }, [currentUser]);

  if (!currentUser || !currentUser.is_admin) {
    return <p>Access denied: Admins only.</p>;
  }

  if (loading) return <p>Loading tickets...</p>;

  // Sort tickets by priority: Urgent -> High -> Normal
  const priorityOrder = { "Urgent": 1, "High": 2, "Normal": 3 };
  const sortedTickets = [...tickets].sort((a, b) => {
    const priorityDiff = (priorityOrder[a.priority] || 999) - (priorityOrder[b.priority] || 999);
    if (priorityDiff !== 0) return priorityDiff;
    // If same priority, sort by creation date (newest first)
    return new Date(b.created_at) - new Date(a.created_at);
  });

  const updateTicket = (ticketId, field, value) => {
    fetch(`http://localhost:5000/admin/tickets/${ticketId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "user-id": currentUser.id,
      },
      body: JSON.stringify({ [field]: value }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setTickets((prev) => {
            const updated = prev.map((t) =>
              t.id === ticketId ? { ...t, [field]: value } : t
            );
            return updated;
          });
        }
      })
      .catch((err) => console.error(err));
  };

  return (
    <div className="admin-dashboard">
    <div style={{ padding: "20px" }}>
      <h2>Admin Dashboard</h2>
      <table border="1" cellPadding="8" style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Sender</th>
            <th>Message</th>
            <th>Type</th>
            <th>Priority</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {sortedTickets.map((t) => (
            <tr key={t.id}>
              <td>{t.id}</td>
              <td>{t.sender}</td>
              <td>{t.message}</td>
              <td>{t.category}</td>
              <td>
                <select
                  value={t.priority}
                  onChange={(e) =>
                    updateTicket(t.id, "priority", e.target.value)
                  }
                  disabled
                >
                  <option value="Normal">Normal</option>
                  <option value="High">High</option>
                  <option value="Urgent">Urgent</option>
                </select>
              </td>
              <td>
                <select
                  value={t.status}
                  onChange={(e) =>
                    updateTicket(t.id, "status", e.target.value)
                  }
                >
                  <option value="Open">Open</option>
                  <option value="Closed">Closed</option>
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    </div>
  );
}

export default AdminDashboard;

