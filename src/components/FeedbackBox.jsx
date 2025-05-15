import React from 'react';

const FeedbackBox = ({ feedback, suggestions }) => {
  return (
    <div className="p-4 bg-gray-200 rounded">
      <h2 className="text-xl font-semibold mb-2">Feedback</h2>
      <p>{feedback || 'No feedback available yet.'}</p>
      <h2 className="text-xl font-semibold mt-4 mb-2">Suggestions</h2>
      <ul className="list-disc pl-5">
        {suggestions && suggestions.length > 0 ? (
          suggestions.map((suggestion, index) => (
            <li key={index}>{suggestion}</li>
          ))
        ) : (
          <li>No suggestions available.</li>
        )}
      </ul>
    </div>
  );
};

export default FeedbackBox;