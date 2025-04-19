import { useState, useContext } from 'react';
import { DebateContext } from '../context/DebateContext';
import { submitArgument } from '../services/api';

function ArgumentForm({ debateId }) {
  const { debateState, updateDebateState } = useContext(DebateContext);
  const [argument, setArgument] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!argument.trim()) return;

    try {
      const response = await submitArgument(debateId, argument);
      updateDebateState({
        userArguments: [...debateState.userArguments, argument],
        aiArguments: [...debateState.aiArguments, response.aiResponse],
        feedback: response.feedback,
        round: debateState.round + 1,
      });
      setArgument('');
    } catch (error) {
      console.error('Error submitting argument:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="argument-form">
      <textarea
        value={argument}
        onChange={(e) => setArgument(e.target.value)}
        placeholder="Enter your argument..."
      />
      <button type="submit">Submit</button>
    </form>
  );
}

export default ArgumentForm;