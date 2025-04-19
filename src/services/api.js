import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api',
});

export const startDebate = async (topic) => {
  // Mock response for now
  return Promise.resolve({
    topic,
    id: 'debate_123',
  });
};

export const submitArgument = async (debateId, argument) => {
  // Mock response
  return Promise.resolve({
    aiResponse: `AI Response: I counter your argument "${argument}" with a point about equality.`,
    feedback: {
      relevance: 8,
      persuasiveness: 7,
      consistency: 9,
    },
  });
};