import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { loginUser, signupUser } from '../services/firebase';
import { useNavigate } from 'react-router-dom';

function AuthForm() {
  const { login } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignup, setIsSignup] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const userCredential = isSignup
        ? await signupUser(email, password)
        : await loginUser(email, password);
      login(userCredential.user.email, userCredential.user.uid);
      navigate('/');
    } catch (error) {
      console.error(`${isSignup ? 'Signup' : 'Login'} failed:`, error);
    }
  };

  return (
    <div className="auth-form">
      <h2>{isSignup ? 'Sign Up' : 'Login'}</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
        />
        <button type="submit">{isSignup ? 'Sign Up' : 'Login'}</button>
      </form>
      <button onClick={() => setIsSignup(!isSignup)}>
        Switch to {isSignup ? 'Login' : 'Sign Up'}
      </button>
    </div>
  );
}

export default AuthForm;