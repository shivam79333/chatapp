# Firestore Security Rules

## For Development (Simple & Permissive)

Go to [Firebase Console](https://console.firebase.google.com) → Your Project → Firestore Database → **Rules** tab.

**Delete all existing rules** and paste exactly this:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

Then click **Publish**.

**This rule:** ✅ Allows any authenticated user to read/write any document. Perfect for development.

---

## For Production (Stricter Security)

Once testing is complete, use these rules:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;
    }
    match /rooms/{roomId} {
      allow read: if request.auth != null && request.auth.uid in resource.data.memberIds;
      allow write: if request.auth != null;
      match /messages/{messageId} {
        allow read: if request.auth != null && request.auth.uid in get(/databases/$(database)/documents/rooms/$(roomId)).data.memberIds;
        allow create: if request.auth != null && request.resource.data.senderId == request.auth.uid;
        allow delete: if request.auth != null && request.resource.data.senderId == request.auth.uid;
      }
    }
  }
}
```
