# Firestore Security Rules

## Copy & Paste These Rules

Go to [Firebase Console](https://console.firebase.google.com) → Your Project → Firestore Database → **Rules** tab.

**Delete all existing rules** and paste exactly this (no markdown formatting):

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;
    }
    match /rooms/{roomId} {
      allow read: if request.auth != null && request.auth.uid in resource.data.memberIds;
      allow write: if request.auth != null && (
        (!resource.exists() && request.auth.uid in request.resource.data.memberIds) ||
        (resource.exists() && (request.auth.uid in resource.data.memberIds || request.auth.uid in request.resource.data.memberIds))
      );
      match /messages/{messageId} {
        allow read: if request.auth != null && request.auth.uid in get(/databases/$(database)/documents/rooms/$(roomId)).data.memberIds;
        allow create: if request.auth != null && request.auth.uid in get(/databases/$(database)/documents/rooms/$(roomId)).data.memberIds && request.resource.data.senderId == request.auth.uid;
        allow update, delete: if request.auth != null && request.resource.data.senderId == request.auth.uid;
      }
    }
  }
}
```

Then click **Publish**.

## What These Rules Do

- ✅ Authenticated users can read/write their own `/users/{uid}` document
- ✅ Users can read rooms they're members of (have `uid` in `memberIds`)
- ✅ Users can join rooms (update `memberIds`)
- ✅ Users can create/read messages only in rooms they've joined
- ✅ Users can only delete their own messages
