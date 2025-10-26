import { useState, useEffect } from "react";
import Login from "./Login";
import Register from "./Register";
import "./App.css";
import { api } from "./api";
import TasksPanel from "./TasksPanel";

function App() {
  const [message, setMessage] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

  useEffect(() => {
    if (isLoggedIn) {
      api("/api")
        .then((d) => setMessage(d.message))
        .catch(() => {});
    }
  }, [isLoggedIn]);

  return (
    <div className="container">
      {!isLoggedIn ? (
        showRegister ? (
          <Register
            onRegisterSuccess={() => setShowRegister(false)}
            onBackToLogin={() => setShowRegister(false)}
          />
        ) : (
          <Login
            onLoginSuccess={() => setIsLoggedIn(true)}
            onShowRegister={() => setShowRegister(true)}
          />
        )
      ) : (
        <>
          <h1>ChoreScore</h1>
          <p>Welcome to the app!</p>
          {message && (
            <div className="api-message">
              <strong>Backend says:</strong> {message}
            </div>
          )}
          <TasksPanel />
          <button
            onClick={() => setIsLoggedIn(false)}
            style={{ marginTop: 24 }}
          >
            Logout
          </button>
        </>
      )}
    </div>
  );
}
export default App;
