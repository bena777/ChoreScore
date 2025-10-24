import { useState } from "react";

function Register({ onRegisterSuccess, onBackToLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [first_name, setFirstName] = useState("");
  const [last_name, setLastName] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password || !first_name || !last_name) {
      setError("Must input all fields");
      return;
    }

    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
    setError(
      "Password must be at least 8 characters long, include one uppercase letter, one number, and one special character."
    );
    return;
  }



    try {
      const response = await fetch("http://localhost:5000/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, first_name, last_name }),
      });

      const data = await response.json();
      if (!response.ok) {
        setError(data.message || "Registration failed");
        return;
      }

      setSuccess("Account created successfully! You can now log in.");
      setError("");
      setUsername("");
      setPassword("");
      onRegisterSuccess();
    } catch (err) {
      setError("Server error — could not connect to backend");
    }
  };

  return (
    <div className="register-container">
      <h2>Create Account</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {success && <p style={{ color: "green" }}>{success}</p>}

      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="username">Username:</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Choose a username"
            required
          />
        </div>
        <div>
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Choose a password"
            required
          />
        </div>
        <div>
          <label htmlFor="first_name">First Name:</label>
          <input
            type="text"
            id="first_name"
            value={first_name}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="What is your first name?"
            required
          />
        </div>
        <div>
          <label htmlFor="last_name">Last Name:</label>
          <input
            type="text"
            id="last_name"
            value={last_name}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="What is your last name?"
            required
          />
        </div>
        <button type="submit">Register</button>
      </form>

      <button onClick={onBackToLogin} style={{ marginTop: "10px" }}>
        Back to Login
      </button>
    </div>
  );
}

export default Register;
