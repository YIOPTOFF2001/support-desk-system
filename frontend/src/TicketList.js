import { useEffect, useState } from "react";

export default function TicketList({ user, ticketsUpdated }) {
  const [tickets, setTickets] = useState([]);

  const fetchTickets = async () => {
    try {
      const res = await fetch(`http://localhost:5000/tickets?user_id=${user.id}`);
      const data = await res.json();
      setTickets(data.tickets || []);
    } catch (err) {
      console.error("Error fetching tickets:", err);
    }
  };

  useEffect(() => {
    if (user) {
      fetchTickets();
    }
  }, [user, ticketsUpdated]);


  if (!tickets || !tickets.length) return <p>No tickets yet.</p>;

  // Sort tickets by priority: Urgent -> High -> Normal
  const priorityOrder = { "Urgent": 1, "High": 2, "Normal": 3 };
  const sortedTickets = [...tickets].sort((a, b) => {
    const priorityDiff = (priorityOrder[a.priority] || 999) - (priorityOrder[b.priority] || 999);
    if (priorityDiff !== 0) return priorityDiff;
    return new Date(b.created_at) - new Date(a.created_at);
  });
    <div style={{ marginTop: "20px" }}>
      <h2>Tickets</h2>
      <ul style={{ listStyle: "none", padding: 0 }}>
        {sortedTickets.map((t) => (
          <li
            key={t.id}
            style={{
              border: "1px solid #ccc",
              padding: "10px",
              marginBottom: "10px",
              borderRadius: "5px",
            }}
          >
            <strong>{t.sender}</strong> ({t.category})<br />
            <em>{t.message}</em><br />
            <small>
              Priority: {t.priority} | Status: {t.status} | Created:{" "}
              {new Date(t.created_at).toLocaleString()}
            </small>
          </li>
        ))}
      </ul>
    </div>
  );
}

  


 
