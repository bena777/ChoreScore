import "./Leaderboard.css";

export const Leaderboard = ({ users, tasks, currentUser }) => {
  // Calculate scores for each user in the group. If current user is in admin group -69, include all users
  const groupUsers = currentUser?.roomate_group === -69
    ? users
    : users.filter(u => u.roomate_group === currentUser?.roomate_group);
  
  const userScores = groupUsers.map(user => {
    // Sum up scores from all completed tasks assigned to this user
    const completedTasks = tasks.filter(t => t.assignee_id === user.id && t.is_completed);
    const totalScore = completedTasks.reduce((sum, task) => sum + (task.score || 0), 0);
    
    return {
      ...user,
      totalScore
    };
  });

  // Sort by score descending (create new array to avoid mutating original)
  const sortedUsers = [...userScores].sort((a, b) => b.totalScore - a.totalScore);

  return (
    <div className="leaderboard">
      <h2>Leaderboard</h2>
      <div className="leaderboard-list">
        {sortedUsers.map((user, index) => (
          <div 
            key={user.id} 
            className={`leaderboard-item ${user.id === currentUser?.id ? 'current-user' : ''}`}
          >
            <div className="leaderboard-rank">#{index + 1}</div>
            <img 
              src={user.avatar} 
              alt={user.username} 
              className="leaderboard-avatar"
              title={user.username}
            />
            <div className="leaderboard-name">{user.username}</div>
            <div className="leaderboard-score">{user.totalScore}</div>
          </div>
        ))}
      </div>
    </div>
  );
};
