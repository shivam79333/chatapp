import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  deleteDoc,
  doc,
  updateDoc,
  getDocs,
} from "firebase/firestore";
import { db } from "./firebase";

// Messages collection reference
const messagesCollection = collection(db, "messages");
const conversationsCollection = collection(db, "conversations");

// Add a new message
export const addMessage = async (conversationId, senderId, text) => {
  try {
    const docRef = await addDoc(messagesCollection, {
      conversationId,
      senderId,
      text,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error("Error adding message:", error);
    throw error;
  }
};

// Get messages for a conversation (real-time)
export const subscribeToMessages = (conversationId, callback) => {
  const q = query(
    messagesCollection,
    where("conversationId", "==", conversationId),
    orderBy("createdAt", "asc")
  );

  const unsubscribe = onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    }));
    callback(messages);
  });

  return unsubscribe;
};

// Delete a message
export const deleteMessage = async (messageId) => {
  try {
    await deleteDoc(doc(messagesCollection, messageId));
  } catch (error) {
    console.error("Error deleting message:", error);
    throw error;
  }
};

// Update a message
export const updateMessage = async (messageId, text) => {
  try {
    await updateDoc(doc(messagesCollection, messageId), {
      text,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error updating message:", error);
    throw error;
  }
};

// Create or get a conversation
export const createConversation = async (userId, participantId, name) => {
  try {
    const docRef = await addDoc(conversationsCollection, {
      participants: [userId, participantId],
      name: name || `Chat with ${participantId}`,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error("Error creating conversation:", error);
    throw error;
  }
};

// Get user's conversations (real-time)
export const subscribeToUserConversations = (userId, callback) => {
  const q = query(
    conversationsCollection,
    where("participants", "array-contains", userId)
  );

  const unsubscribe = onSnapshot(q, (snapshot) => {
    const conversations = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    }));
    callback(conversations);
  });

  return unsubscribe;
};

// Delete a conversation
export const deleteConversation = async (conversationId) => {
  try {
    await deleteDoc(doc(conversationsCollection, conversationId));
  } catch (error) {
    console.error("Error deleting conversation:", error);
    throw error;
  }
};

// Get all conversations (one-time fetch)
export const getConversations = async (userId) => {
  try {
    const q = query(
      conversationsCollection,
      where("participants", "array-contains", userId)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    }));
  } catch (error) {
    console.error("Error fetching conversations:", error);
    throw error;
  }
};
