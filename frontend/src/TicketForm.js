import { useState } from "react";
import "./TicketForm.css";

export default function TicketForm({ user, onNewTicket }) {
  const [sender, setSender] = useState("");
  const [message, setMessage] = useState("");
  const [category, setCategory] = useState("Uncategorized");
 

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("http://localhost:5000/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: user.id, sender, message, category}),
      });

      if (!res.ok) {
        console.error("Error response:", res.status, res.statusText);
        return;
      }

      const data = await res.json();
      console.log("Ticket created:", data);
      onNewTicket();

      setSender("");
      setMessage("");
      setCategory("Uncategorized");
    } catch (err) {
      console.error("Error creating ticket:", err);
    }
  };

  return (
    <form className="ticket-form" onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Your Name"
        value={sender}
        onChange={(e) => setSender(e.target.value)}
        required
      />
      <textarea
        placeholder="Describe your issue..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        required
      ></textarea>

      <select value={category} onChange={(e) => setCategory(e.target.value)}>
        <option value="Uncategorized">Uncategorized - Normal Priority</option>
        <option value="Support">Support - High Priority</option>
        <option value="Billing">Billing - Urgent Priority</option>
        <option value="Feedback">Feedback - Normal Priority</option>
      </select>
      
      <button type="submit">Create Ticket</button>
    </form>
  );
}
