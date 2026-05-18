export const currentRoom = {
  id: 'general',
  name: 'general',
  description: 'Welcome to the main discussion room.',
  memberCount: 18,
}

export const previewMessages = [
  {
    id: 'msg-1',
    sender: 'Aarav',
    initials: 'AR',
    time: '10:24 AM',
    text: 'This is where room messages will appear after Socket.io is connected.',
    accentClass: 'bg-indigo-500',
  },
  {
    id: 'msg-2',
    sender: 'Meera',
    initials: 'ME',
    time: '10:26 AM',
    text: 'The UI is static for now, but the structure is ready for rooms, users, and messages.',
    accentClass: 'bg-emerald-500',
  },
  {
    id: 'msg-3',
    sender: 'Kabir',
    initials: 'KB',
    time: '10:27 AM',
    text: 'On mobile, the rooms move above the chat so the screen still feels usable.',
    accentClass: 'bg-amber-500',
  },
  {
    id: 'msg-4',
    sender: 'You',
    initials: 'YU',
    time: '10:28 AM',
    text: 'Next steps can be input state, Socket.io connection, then Firestore message history.',
    accentClass: 'bg-rose-500',
    isOwn: true,
  },
]
