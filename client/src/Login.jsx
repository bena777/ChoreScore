import React, { useState } from "react";
import { api } from "./api";

function Login({ onLoginSuccess, onShowRegister }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      setError("Must input both username AND password");
      return;
    }
    try {
      const data = await api("/api/login", {
        method: "POST",
        body: { username, password },
      });
      setError("");
      // Store username in localStorage for later use
      localStorage.setItem("loggedInUser", username);
      setUsername("");
      setPassword("");
      onLoginSuccess();
    } catch (err) {
      setError(err.message || "Server error — could not connect to backend");
    }
  };

  return (
    <div className="login-page">
    <div className="login-container">
      <h2>Login</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="username">Username:</label>
          <input
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter your username"
            required
          />
        </div>
        <div>
          <label htmlFor="password">Password:</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            required
          />
        </div>
        <button type="submit">Login</button>
      </form>
      <button onClick={onShowRegister} style={{ marginTop: "10px" }}>
        Create Account
      </button>
    </div>
    </div>
  );
}
export default Login;
