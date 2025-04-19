import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { getUserDebates } from '../services/firebase';

function Profile() {
  const { user } = useContext(AuthContext);
  const [debates, setDebates] = useState([]);

  useEffect(() => {
    if (user) {
      getUserDebates(user.id).then(setDebates).catch(() => {
        // Mock data if Firebase isn't set up
        setDebates([
          { id: 'debate_123', topic: 'School Uniforms', scores: { user: 2.5 } },
        ]);
      });
    }
  }, [user]);

  return (
    <div className="profile">
      <h2>Your Debate History</h2>
      {debates.length > 0 ? (
        <ul>
          {debates.map((debate) => (
            <li key={debate.id}>
              {debate.topic} - Score: {debate.scores?.user || 'N/A'}
            </li>
          ))}
        </ul>
      ) : (
        <p>No debates yet. Start a new debate!</p>
      )}
    </div>
  );
}

export default Profile;