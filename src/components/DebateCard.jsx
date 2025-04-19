import { useContext } from 'react';
import { DebateContext } from '../context/DebateContext';
import ArgumentForm from './ArgumentForm';
import AIArgument from './AIArgument';
import FeedbackBox from './FeedbackBox';

function DebateCard({ debateId }) {
  const { debateState } = useContext(DebateContext);

  return (
    <div className="debate-card">
      <h2>{debateState.topic || 'Loading...'}</h2>
      <p>Round: {debateState.round || 1}/5</p>
      <ArgumentForm debateId={debateId} />
      {debateState.aiArguments.map((arg, index) => (
        <AIArgument key={index} argument={arg} />
      ))}
      {debateState.feedback && <FeedbackBox feedback={debateState.feedback} />}
    </div>
  );
}

export default DebateCard;