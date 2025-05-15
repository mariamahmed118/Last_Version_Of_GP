import { db } from './firebase';
import { doc, setDoc, getDoc, collection, query, where, getDocs, updateDoc, increment, Timestamp, orderBy } from 'firebase/firestore';

export const createUserDocument = async (userData) => {
  const userRef = doc(db, 'users', userData.uid);
  await setDoc(userRef, {
    ...userData,
    remainingFreeDebates: 45,
    totalDebates: 0,
    wins: 0,
    losses: 0,
    draws: 0,
  }, { merge: true });
};

export const isUsernameAvailable = async (username) => {
  const usersRef = collection(db, 'users');
  const q = query(usersRef, where('username', '==', username));
  const querySnapshot = await getDocs(q);
  return querySnapshot.empty;
};

export const getUserDocument = async (uid) => {
  const userRef = doc(db, 'users', uid);
  const userSnap = await getDoc(userRef);

  if (userSnap.exists()) {
    return userSnap.data();
  } else {
    return null;
  }
};

export const updateUserDocument = async (uid, data) => {
  const userRef = doc(db, 'users', uid);
  await updateDoc(userRef, data);
};

export const getUserDebates = async (uid) => {
  const debatesRef = collection(db, 'debates');
  const q = query(debatesRef, where('participants', 'array-contains', uid));
  const querySnapshot = await getDocs(q);

  const debates = [];
  querySnapshot.forEach((doc) => {
    const data = doc.data();
    debates.push({
      id: doc.id,
      topic: data.topic,
      opponent: data.participants.find((p) => p.userId !== uid)?.displayName || 'Unknown',
      date: data.createdAt.toDate().toLocaleDateString(),
      result: data.status === 'ongoing' ? 'ongoing' : (data.winner === uid ? 'win' : (data.loser === uid ? 'loss' : 'draw')),
    });
  });

  return debates;
};

export const getUserStats = async (uid) => {
  const userRef = doc(db, 'users', uid);
  const userSnap = await getDoc(userRef);

  if (userSnap.exists()) {
    const userData = userSnap.data();
    return {
      totalDebates: userData.totalDebates || 0,
      wins: userData.wins || 0,
      losses: userData.losses || 0,
      draws: userData.draws || 0,
      remainingFreeDebates: userData.remainingFreeDebates || 45,
    };
  } else {
    throw new Error('User not found');
  }
};

export const createDebate = async (topic, userId, opponentId) => {
  const debateRef = doc(collection(db, 'debates'));
  const userSnap = await getDoc(doc(db, 'users', userId));
  const opponentSnap = await getDoc(doc(db, 'users', opponentId));

  if (!userSnap.exists() || !opponentSnap.exists()) {
    throw new Error('User or opponent not found');
  }

  const userData = userSnap.data();
  const opponentData = opponentSnap.data();

  await setDoc(debateRef, {
    topic,
    createdAt: Timestamp.now(),
    status: 'ongoing',
    participants: [
      {
        userId: userId,
        displayName: userData.name,
      },
      {
        userId: opponentId,
        displayName: opponentData.name,
      },
    ],
    winner: null,
    loser: null,
  });

  await updateDoc(doc(db, 'users', userId), {
    remainingFreeDebates: increment(-1),
    totalDebates: increment(1),
  });

  await updateDoc(doc(db, 'users', opponentId), {
    remainingFreeDebates: increment(-1),
    totalDebates: increment(1),
  });

  return debateRef.id;
};

export const addDebateMessage = async (debateId, userId, content, isAIAssisted) => {
  const messageRef = doc(collection(db, `debateMessages/${debateId}/messages`));
  await setDoc(messageRef, {
    userId,
    content,
    timestamp: Timestamp.now(),
    isAIAssisted,
  });
};

export const getDebateMessages = async (debateId) => {
  const messagesRef = collection(db, `debateMessages/${debateId}/messages`);
  const q = query(messagesRef, orderBy('timestamp'));
  const querySnapshot = await getDocs(q);

  const messages = [];
  querySnapshot.forEach((doc) => {
    messages.push({ id: doc.id, ...doc.data() });
  });

  return messages;
};

export const completeDebate = async (debateId, winnerId, loserId) => {
  const debateRef = doc(db, 'debates', debateId);
  await updateDoc(debateRef, {
    status: 'completed',
    winner: winnerId,
    loser: loserId,
  });

  await updateDoc(doc(db, 'users', winnerId), {
    wins: increment(1),
  });

  await updateDoc(doc(db, 'users', loserId), {
    losses: increment(1),
  });
};