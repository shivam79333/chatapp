# Backend

This folder contains the Node.js backend server.

## What It Has Now

- Express server
- Socket.io server
- A health route at `GET /health`
- Basic realtime message broadcasting

## File Structure

```txt
backend/
  src/index.js          Starts Express, HTTP server, and Socket.io
  src/config/env.js     Reads simple environment variables
  src/sockets/          Socket.io event handlers
  src/services/         Firestore message logic
  src/utils/            Small backend helper functions
```

## Run Backend

```bash
npm run dev
```

The backend runs on `http://127.0.0.1:4000` by default.

## Message Events

Client sends:

```js
socket.emit('message:send', {
  text: 'Hello',
  sender: 'Guest',
  roomId: 'general',
})
```

Server broadcasts:

```js
socket.on('message:receive', (message) => {
  console.log(message)
})
```

## Firestore Setup

Create `backend/.env` from `backend/.env.example`, then add your Firebase
service account values:

```bash
cp backend/.env.example backend/.env
```

The backend uses Firebase Admin SDK, so these secrets stay on the server and are
not exposed to React.

Messages are stored here:

```txt
rooms/{roomId}/messages/{messageId}
```

Each message stores:

- `text`
- `sender`
- `roomId`
- `createdAt`
