import { FieldValue } from 'firebase-admin/firestore'
import { getFirestoreDb } from '../config/firebaseAdmin.js'

const MESSAGE_LIMIT = 50

function messageCollection(db, roomId) {
  return db.collection('rooms').doc(roomId).collection('messages')
}

function serializeMessage(doc) {
  const data = doc.data()

  return {
    id: doc.id,
    text: data.text,
    sender: data.sender,
    roomId: data.roomId,
    createdAt: data.createdAt?.toDate?.().toISOString() || data.createdAt,
  }
}

export function createMessageService() {
  const db = getFirestoreDb()

  return {
    async saveMessage(message) {
      const docRef = await messageCollection(db, message.roomId).add({
        text: message.text,
        sender: message.sender,
        roomId: message.roomId,
        createdAt: FieldValue.serverTimestamp(),
      })

      const savedMessage = await docRef.get()

      return serializeMessage(savedMessage)
    },

    async getRoomMessages(roomId) {
      const snapshot = await messageCollection(db, roomId)
        .orderBy('createdAt', 'asc')
        .limit(MESSAGE_LIMIT)
        .get()

      return snapshot.docs.map(serializeMessage)
    },
  }
}
