import { createContext, useState } from 'react';

export const DebateContext = createContext();

export const DebateProvider = ({ children }) => {
  const [debateState, setDebateState] = useState({
    topic: '',
    round: 1,
    userArguments: [],
    aiArguments: [],
    feedback: null,
    debateId: null,
  });

  const updateDebateState = (newState) => {
    setDebateState((prev) => ({ ...prev, ...newState }));
  };

  return (
    <DebateContext.Provider value={{ debateState, updateDebateState }}>
      {children}
    </DebateContext.Provider>
  );
};