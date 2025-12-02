import { Link } from "react-router-dom";
import "./Dashboard.css";

export default function Home() {
	return (
		<div className="App" style={{ padding: 24 }}>
			<section style={{ maxWidth: 800, margin: "24px auto" }}>
				<h2 style={{ marginBottom: 8 }}>Roommate Responsibilities: Simplified (or smth)</h2>
				<p style={{ lineHeight: 1.6 }}>
					Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. 
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

			<section style={{ maxWidth: 900, margin: "32px auto" }}>
				<div style={{ display: "grid", gap: 16 }}>
					<div style={{ border: "1px solid #eee", borderRadius: 8, padding: 16 }}>
						<h3>Great Point #1</h3>
						<p>
							Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
						</p>
					</div>
					<div style={{ border: "1px solid #eee", borderRadius: 8, padding: 16 }}>
						<h3>Great Point #2</h3>
						<p>
							Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. 
						</p>
					</div>
					<div style={{ border: "1px solid #eee", borderRadius: 8, padding: 16 }}>
						<h3>Great Point #3</h3>
						<p>
							Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
						</p>
					</div>
				</div>
			</section>
		</div>
	);
}
