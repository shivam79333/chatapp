# Firestore Security Rules

Copy the rules below to your Firebase Console → Firestore Database → Rules:

```firestore
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    // Allow authenticated users to read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;
    }

    // Rooms: authenticated users can read/write rooms they're members of
    match /rooms/{roomId} {
      allow read: if request.auth != null && request.auth.uid in resource.data.memberIds;
      allow write: if request.auth != null && (
        // Create room: can create if user is in memberIds
        (!resource.exists() && request.auth.uid in request.resource.data.memberIds) ||
        // Update room: can update if already a member or being added as member
        (resource.exists() && (
          request.auth.uid in resource.data.memberIds ||
          request.auth.uid in request.resource.data.memberIds
        ))
      );

      // Messages in room: authenticated users can read/write if they're members of the room
      match /messages/{messageId} {
        allow read: if request.auth != null && request.auth.uid in get(/databases/$(database)/documents/rooms/$(roomId)).data.memberIds;
        allow create: if request.auth != null && 
          request.auth.uid in get(/databases/$(database)/documents/rooms/$(roomId)).data.memberIds &&
          request.resource.data.senderId == request.auth.uid;
        allow update, delete: if request.auth != null && request.resource.data.senderId == request.auth.uid;
      }
    }
  }
}
```

## Steps to Apply Rules:

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Navigate to **Firestore Database** → **Rules**
4. Replace the existing rules with the ones above
5. Click **Publish**

That's it! Your chat app should now work.
