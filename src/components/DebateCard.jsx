import React, { useState } from 'react';

const DebateCard = ({ topic, onStartDebate }) => {
  const [position, setPosition] = useState('for');

  return (
    <div className="p-4 bg-white rounded shadow">
      <h2 className="text-lg font-semibold">{topic}</h2>
      <div className="mt-2">
        <label className="mr-2">Position:</label>
        <select
          value={position}
          onChange={(e) => setPosition(e.target.value)}
          className="border rounded p-1"
        >
          <option value="for">For</option>
          <option value="against">Against</option>
        </select>
      </div>
      <button
        onClick={() => onStartDebate(topic, position)}
        className="mt-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
      >
        Start Debate
      </button>
    </div>
  );
};

export default DebateCard;