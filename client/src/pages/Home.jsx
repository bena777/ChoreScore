import { Link } from "react-router-dom";
import "./Dashboard.css";

export default function Home() {
  return (
    <div className="App" style={{ padding: 24 }}>
      <section style={{ maxWidth: 800, margin: "40px auto 24px" }}>
        <h2 style={{ marginBottom: 8 }}>
          Roommate Responsibilities; Simplified
        </h2>
        <p style={{ lineHeight: 1.6 }}>
          ChoreScore is a light and easy-to-use web application which serves to
          make students’ dorm lives easier. Join for free today!
        </p>
      </section>

      <section style={{ display: "grid", gap: 16, justifyItems: "center" }}>
        <div style={{ display: "flex", gap: 12 }}>
          <Link to="/login">
            <button className="add-btn" style={{ padding: "10px 16px" }}>
              Sign In
            </button>
          </Link>
          <Link to="/register">
            <button className="edit-btn" style={{ padding: "10px 16px" }}>
              Create Account
            </button>
          </Link>
        </div>
        <small style={{ opacity: 0.8 }}>
          New here? Create an account to get started.
        </small>
      </section>
    </div>
  );
}
