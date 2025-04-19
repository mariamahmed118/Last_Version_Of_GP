function FeedbackBox({ feedback }) {
    return (
      <div className="feedback-box">
        <h3>Feedback</h3>
        <p>Relevance: {feedback.relevance}/10</p>
        <p>Persuasiveness: {feedback.persuasiveness}/10</p>
        <p>Consistency: {feedback.consistency}/10</p>
      </div>
    );
  }
  
  export default FeedbackBox;