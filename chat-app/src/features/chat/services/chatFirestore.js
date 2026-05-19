import {
  addDoc,
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  where,
} from 'firebase/firestore'
import { db } from '../../../lib/firebase'
import { DEFAULT_ROOMS } from '../../../../shared/constants/rooms'

function getDb() {
  if (!db) {
    throw new Error('Firestore is not initialized. Check Firebase configuration.')
  }

  return db
}

function normalizeRoom(docSnapshot) {
  const data = docSnapshot.data()

  return {
    id: docSnapshot.id,
    name: data.name || docSnapshot.id,
    description: data.description || 'User room',
    memberCount: Array.isArray(data.memberIds) ? data.memberIds.length : 0,
  }
}

function normalizeMessage(docSnapshot) {
  const data = docSnapshot.data()

  return {
    id: docSnapshot.id,
    text: data.text || '',
    sender: data.sender || 'User',
    senderId: data.senderId || null,
    roomId: data.roomId || '',
    createdAt: data.createdAt?.toDate?.()?.toISOString() || null,
  }
}

function buildRoomMembership(user) {
  const userName = user.userName || user.userDisplayName || user.email || 'User'
  const userDisplayName = user.userDisplayName || userName

  return {
    memberIds: arrayUnion(user.uid),
    members: {
      [user.uid]: {
        userId: user.uid,
        userName,
        userDisplayName,
        joinedAt: serverTimestamp(),
      },
    },
  }
}

export async function ensureDefaultRoomsForUser(user) {
  const firestore = getDb()

  await Promise.all(
    DEFAULT_ROOMS.map(async (room) => {
      await setDoc(
        doc(firestore, 'rooms', room.id),
        {
          name: room.name,
          description: room.description,
          updatedAt: serverTimestamp(),
          ...buildRoomMembership(user),
        },
        { merge: true }
      )
    })
  )
}

export function subscribeToUserRooms(userId, callback) {
  const firestore = getDb()
  const roomsQuery = query(
    collection(firestore, 'rooms'),
    where('memberIds', 'array-contains', userId)
  )

  return onSnapshot(
    roomsQuery,
    (snapshot) => {
      callback(snapshot.docs.map(normalizeRoom))
    },
    (error) => {
      console.error(`Failed to subscribe rooms for user ${userId}:`, error)
    }
  )
}

export async function createRoomForUser(room, user) {
  const firestore = getDb()
  const roomRef = doc(firestore, 'rooms', room.id)

  await setDoc(
    roomRef,
    {
      name: room.name,
      description: room.description || 'Custom room',
      createdBy: user.uid,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      ...buildRoomMembership(user),
    },
    { merge: true }
  )

  return room
}

export async function ensureUserInRoom(roomId, user) {
  const firestore = getDb()
  const roomRef = doc(firestore, 'rooms', roomId)

  await setDoc(
    roomRef,
    {
      updatedAt: serverTimestamp(),
      ...buildRoomMembership(user),
    },
    { merge: true }
  )
}

export function subscribeToRoomMessages(roomId, callback) {
  const firestore = getDb()
  const messagesQuery = query(
    collection(firestore, 'rooms', roomId, 'messages'),
    orderBy('createdAt', 'asc')
  )

  return onSnapshot(
    messagesQuery,
    (snapshot) => {
      callback(snapshot.docs.map(normalizeMessage))
    },
    (error) => {
      console.error(`Failed to subscribe messages for room ${roomId}:`, error)
    }
  )
}

export async function sendRoomMessage(message) {
  const firestore = getDb()
  const text = message.text?.trim()

  if (!text) {
    return
  }

  await addDoc(collection(firestore, 'rooms', message.roomId, 'messages'), {
    text,
    roomId: message.roomId,
    sender: message.sender || 'User',
    senderId: message.senderId || null,
    createdAt: serverTimestamp(),
  })

  await setDoc(
    doc(firestore, 'rooms', message.roomId),
    {
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  )
}

export async function setUserTyping(roomId, userId, displayName, isTyping) {
  const firestore = getDb()
  const typingRef = doc(firestore, 'rooms', roomId, 'typing', userId)

  if (isTyping) {
    await setDoc(typingRef, {
      userId,
      displayName,
      typingAt: serverTimestamp(),
    })
  } else {
    await deleteDoc(typingRef)
  }
}

export function subscribeToTypingUsers(roomId, callback) {
  const firestore = getDb()
  const typingQuery = query(collection(firestore, 'rooms', roomId, 'typing'))

  const unsubscribe = onSnapshot(
    typingQuery,
    (snapshot) => {
      const now = Date.now()
      const typingUsers = snapshot.docs
        .filter((doc) => {
          const typingAt = doc.data().typingAt?.toDate?.()?.getTime?.() || 0
          const isStale = now - typingAt > 3000
          return !isStale
        })
        .map((doc) => ({
          userId: doc.data().userId,
          displayName: doc.data().displayName,
        }))

      callback(typingUsers)
    },
    (error) => {
      console.error(`Failed to subscribe to typing in room ${roomId}:`, error)
    }
  )

  return unsubscribe
}

export async function deleteRoom(roomId) {
  const firestore = getDb()
  const roomRef = doc(firestore, 'rooms', roomId)

  const messagesSnapshot = await getDocs(
    collection(firestore, 'rooms', roomId, 'messages')
  )
  for (const messageDoc of messagesSnapshot.docs) {
    await deleteDoc(messageDoc.ref)
  }

  const typingSnapshot = await getDocs(collection(firestore, 'rooms', roomId, 'typing'))
  for (const typingDoc of typingSnapshot.docs) {
    await deleteDoc(typingDoc.ref)
  }

  await deleteDoc(roomRef)
}
