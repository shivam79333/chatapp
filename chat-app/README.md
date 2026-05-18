# Realtime Multi-Room Chat App

This project is being built step by step with:

- React + Vite for the browser UI
- Tailwind CSS for styling
- Socket.io for realtime chat events
- Firebase Firestore for message persistence

## Current Step

Only the project structure is prepared. Chat features are not implemented yet.

## Folder Structure

```txt
chat-app/
  src/                 Frontend React app
    app/               Top-level app component
    features/chat/     Chat screens, components, mock data, hooks, and services
      components/      Sidebar, header, message list, message row, input
      data/            Temporary static data used before backend integration
      pages/           Page-level chat screen
    lib/               Browser SDK setup, such as Firebase
    shared/            Frontend-only reusable components and utilities

  backend/             Node.js backend scaffold
    src/config/        Environment and Firebase Admin setup
    src/sockets/       Socket.io event handlers
    src/services/      Firestore/message/room logic
    src/utils/         Backend helper functions

  shared/              Constants used by both frontend and backend
```

## Scripts

```bash
npm run dev
```

Runs the React frontend.

```bash
npm run dev:backend
```

Runs the backend scaffold. It does not start Socket.io yet.

## Environment Files

Copy the examples before adding real values:

```bash
cp .env.example .env
cp backend/.env.example backend/.env
```

Do not commit real Firebase keys or service account secrets.

## Next Setup Steps

1. Install Tailwind CSS and connect it to Vite.
2. Install Socket.io packages for frontend and backend.
3. Install Firebase packages and connect Firestore.
4. Start implementing rooms and messages one small feature at a time.
