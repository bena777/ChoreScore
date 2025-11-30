import { Link } from "react-router-dom";
import "./Dashboard.css";

export default function Home() {
	return (
		<div className="App" style={{ padding: 24 }}>
			<header className="dashboard-header">ChoreScore</header>
			<section style={{ maxWidth: 800, margin: "24px auto" }}>
				<h2 style={{ marginBottom: 8 }}>Simplify Family Chores</h2>
				<p style={{ lineHeight: 1.6 }}>
					ChoreScore helps families organize tasks, assign responsibilities, and
					keep everyone accountable with an easy, gamified dashboard. Track
					progress, set due dates, and reward effort — all in one place.
				</p>
			</section>

			<section style={{ display: "grid", gap: 16, justifyItems: "center" }}>
				<div style={{ display: "flex", gap: 12 }}>
					<Link to="/login">
						<button className="edit-btn" style={{ padding: "10px 16px" }}>
							Sign In
						</button>
					</Link>
					<Link to="/register">
						<button className="add-btn" style={{ padding: "10px 16px" }}>
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
						<h3>Assign and Track Tasks</h3>
						<p>
							Create chores, set due dates, and assign them to family members.
							See everything in a clear, drag-and-drop board.
						</p>
					</div>
					<div style={{ border: "1px solid #eee", borderRadius: 8, padding: 16 }}>
						<h3>Motivate with Scores</h3>
						<p>
							Add scores to tasks to prioritize and motivate. Celebrate
							completed chores with points and rewards.
						</p>
					</div>
					<div style={{ border: "1px solid #eee", borderRadius: 8, padding: 16 }}>
						<h3>Designed for Families</h3>
						<p>
							Simple, friendly, and effective — ChoreScore keeps the household
							running smoothly without the hassle.
						</p>
					</div>
				</div>
			</section>
		</div>
	);
}
