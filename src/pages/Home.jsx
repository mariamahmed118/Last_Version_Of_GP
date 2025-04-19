import { Link } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

function Home() {
  const { user } = useContext(AuthContext);

  return (
    <div className="home">
      <h1>Welcome to DebateBrawl, {user ? user.email : 'Guest'}!</h1>
      <p>Challenge yourself in a debate against an AI opponent.</p>
      <Link to="/debate/new">
        <button>Start a New Debate</button>
      </Link>
    </div>
  );
}

export default Home;