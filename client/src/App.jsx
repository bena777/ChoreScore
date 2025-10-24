import { useState, useEffect } from "react";
import Login from "./Login"; // 👈 import your Login component
import "./App.css";

function App() {
  const [message, setMessage] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    if (isLoggedIn) {
      fetch("http://localhost:5000/api")
        .then((response) => response.json())
        .then((data) => setMessage(data.message))
        .catch((err) => console.log("Server not running yet"));
    }
  }, [isLoggedIn]);
  return (
    <div className="container">
      {!isLoggedIn ? (
        <Login onLoginSuccess={() => setIsLoggedIn(true)} />
      ) : (
        <>
          <h1>ChoreScore</h1>
          <p>Welcome to the app!</p>
          {message && (
            <div className="api-message">
              <strong>Backend says:</strong> {message}
            </div>
          )}
          <button onClick={() => setIsLoggedIn(false)}>Logout</button>
        </>
      )}
    </div>
  );
}

export default App;
