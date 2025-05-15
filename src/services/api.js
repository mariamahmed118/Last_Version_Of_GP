// تعديل ملف api.js لتحسين تسجيل البيانات والتأكد من استلام عناوين موضوعات صحيحة

const API_BASE_URL = 'http://localhost:8000/api';

async function getTopics(userId) {
  const validUserId = userId || 'anonymous';
  console.log(`Calling getTopics with userId: ${validUserId}`);

  try {
    const response = await fetch(`${API_BASE_URL}/get_topics`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ user_id: validUserId }),
    });

    console.log(`Response status: ${response.status}`);
    if (!response.ok) {
      const errorData = await response.text().catch(() => 'No error details');
      console.error('API Error:', response.status, errorData);
      throw new Error(`Failed to fetch topics: ${response.status} - ${errorData}`);
    }

    const data = await response.json();
    console.log('Raw API response data:', data);
    console.log('API response topics array:', data.topics);

    if (!data || !data.topics || !Array.isArray(data.topics)) {
      console.warn('Unexpected API response format:', data);
      throw new Error('Invalid response format: Expected { topics: [...] }');
    }

    // تحسين التحقق من البيانات لكل موضوع
    const validatedTopics = data.topics.map((topic, index) => {
      // تسجيل كل موضوع قبل المعالجة
      console.log(`Processing topic ${index}:`, topic);
      
      // التأكد من أن العنوان هو نص صالح وليس كائنًا أو قيمة غير صحيحة
      let title = 'Untitled Topic';
      
      if (topic.title && typeof topic.title === 'string' && topic.title.trim() !== '') {
        title = topic.title.trim();
      } else if (typeof topic === 'string' && topic.trim() !== '') {
        // في حالة كانت البيانات مجرد مصفوفة نصية وليست كائنات
        title = topic.trim();
      } else {
        title = `Topic ${index + 1}`;
      }
      
      return {
        id: topic.id || index + 1,
        title: title,
        category: topic.category || 'General',
        participants: topic.participants || 0
      };
    });

    console.log('Validated topics to return:', validatedTopics);
    return validatedTopics;
  } catch (err) {
    console.error('Fetch error:', err);
    throw err;
  }
}

async function startDebate(userId, topic, position) {
  const validUserId = userId || 'anonymous';

  const response = await fetch(`${API_BASE_URL}/start_debate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      user_id: validUserId,
      topic: topic.title || topic,
      position,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error('API Error:', response.status, errorData);
    throw new Error(`Failed to start debate: ${response.status}`);
  }

  return response.json();
}

async function getDebateState(debateId) {
  const response = await fetch(`${API_BASE_URL}/debate_state/${debateId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch debate state');
  }
  return response.json();
}

async function submitArgument(debateId, userId, argument) {
  const validUserId = userId || 'anonymous';

  const response = await fetch(`${API_BASE_URL}/submit_argument`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ debate_id: debateId, user_id: validUserId, argument }),
  });

  if (!response.ok) {
    throw new Error('Failed to submit argument');
  }

  return response.json();
}

async function getUserStats(userId) {
  const validUserId = userId || 'anonymous';

  const response = await fetch(`${API_BASE_URL}/user_stats/${validUserId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch user stats');
  }
  return response.json();
}

async function getUserDebateHistory(userId) {
  const validUserId = userId || 'anonymous';

  const response = await fetch(`${API_BASE_URL}/user_debate_history/${validUserId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch user debate history');
  }
  return response.json();
}

export {
  getTopics,
  startDebate,
  getDebateState,
  submitArgument,
  getUserStats,
  getUserDebateHistory,
};