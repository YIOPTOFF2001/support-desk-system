import { useState } from "react";
import TicketForm from "./TicketForm";
import TicketList from "./TicketList";
import Login from "./Login";
import Register from "./Register";
import AdminDashboard from "./AdminDashboard";






function App() {
  const [ticketsUpdated, setTicketsUpdated] = useState(0);
  const [currentUser, setCurrentUser] = useState(null); // add this

  // Simple toggle to switch between login and register (optional)
  const [showRegister, setShowRegister] = useState(false);

  return (
    <div className="App" style={{ padding: "20px", fontFamily: "sans-serif" }}>
      <h1>Customer Support Tickets</h1>
      
      {currentUser && (
        <div style={{ marginBottom: "20px", padding: "10px", backgroundColor: "#f0f0f0", borderRadius: "5px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <p>Logged in as: <strong>{currentUser.email}</strong> {currentUser.is_admin && "(Admin)"}</p>
          <button onClick={() => setCurrentUser(null)} style={{ padding: "8px 16px", backgroundColor: "#dc3545", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}>
            Logout
          </button>
        </div>
      )}

      {!currentUser ? (
        <>
          {showRegister ? (
            <Register onRegister={setCurrentUser} />
          ) : (
            <Login onLogin={setCurrentUser} />
          )}
          <button onClick={() => setShowRegister(!showRegister)}>
            {showRegister ? "Already have an account? Login" : "No account? Register"}
          </button>
        </>
      ) : currentUser.is_admin ? (
        <AdminDashboard currentUser={currentUser} />
      ) : (
        <>
          <TicketForm user={currentUser} onNewTicket={() => setTicketsUpdated(t => t + 1)} />
          <TicketList user={currentUser} ticketsUpdated={ticketsUpdated} />
        </>
      )}

    </div>
  );
}

export default App;
