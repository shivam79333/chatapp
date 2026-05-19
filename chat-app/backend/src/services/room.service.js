import { getFirestoreDb } from '../config/firebaseAdmin.js'

export function createRoomService() {
  const db = getFirestoreDb()
  const roomsCollection = db.collection('rooms')

  return {
    async addUserToRoom(roomId, userId, userName, userDisplayName) {
      try {
        const roomRef = roomsCollection.doc(roomId)
        await roomRef.set(
          {
            members: {
              [userId]: {
                userId,
                userName,
                userDisplayName,
                joinedAt: new Date(),
              },
            },
          },
          { merge: true }
        )
        return true
      } catch (error) {
        console.error(`Failed to add user to room ${roomId}:`, error)
        throw error
      }
    },

    async getUserRooms(userId) {
      try {
        const snapshot = await roomsCollection
          .where(`members.${userId}`, '!=', null)
          .get()

        return snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
      } catch (error) {
        console.error(`Failed to get user rooms for ${userId}:`, error)
        return []
      }
    },

    async removeUserFromRoom(roomId, userId) {
      try {
        const roomRef = roomsCollection.doc(roomId)
        await roomRef.update({
          [`members.${userId}`]: null,
        })
        return true
      } catch (error) {
        console.error(`Failed to remove user from room ${roomId}:`, error)
        throw error
      }
    },

    async getRoomInfo(roomId) {
      try {
        const doc = await roomsCollection.doc(roomId).get()
        if (doc.exists) {
          return { id: doc.id, ...doc.data() }
        }
        return null
      } catch (error) {
        console.error(`Failed to get room info for ${roomId}:`, error)
        return null
      }
    },
  }
}
