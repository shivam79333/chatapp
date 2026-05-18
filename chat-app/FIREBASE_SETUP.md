# Firebase Authentication & Firestore Setup Guide

## 📋 What's Been Set Up

Your messaging website now has full Firebase integration with:
- ✅ Firebase Authentication (Email/Password)
- ✅ Firestore Database (Real-time messaging)
- ✅ User Profiles & Management
- ✅ Auth Context for global state management

---

## 🚀 Getting Started

### 1. Configure Environment Variables

Add your Firebase credentials to `.env` file:

```env
VITE_API_URL=http://localhost:4000
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain_here
VITE_FIREBASE_PROJECT_ID=your_project_id_here
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket_here
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id_here
VITE_FIREBASE_APP_ID=your_app_id_here
```

Get these values from: https://console.firebase.google.com/ → Project Settings

### 2. Set Up Firestore Rules (Optional but Recommended)

In Firebase Console → Firestore → Rules, add:

```firestore
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection - each user can only read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;
    }

    // Conversations - users can read/write if they're a participant
    match /conversations/{conversationId} {
      allow read, write: if request.auth.uid in resource.data.participants;
    }

    // Messages - users can read/write if in the conversation
    match /messages/{messageId} {
      allow read: if get(/databases/$(database)/documents/conversations/$(resource.data.conversationId)).data.participants.hasAny([request.auth.uid]);
      allow create: if request.auth.uid == request.resource.data.senderId;
      allow update, delete: if request.auth.uid == resource.data.senderId;
    }
  }
}
```

---

## 📁 File Structure

```
src/
├── lib/
│   ├── firebase.js              # Firebase initialization
│   ├── authService.js           # Authentication functions
│   └── firestoreService.js      # Firestore database functions
├── features/chat/
│   ├── hooks/
│   │   └── useAuth.jsx         # Auth context & hook
│   ├── pages/
│   │   ├── LoginPage.jsx       # Login UI
│   │   ├── SignUpPage.jsx      # Signup UI
│   │   └── ChatPage.jsx        # Main chat interface
│   └── components/
│       ├── UserProfile.jsx     # User menu & settings
│       └── ... (other components)
└── App.jsx                      # App root with auth routing
```

---

## 🔐 Authentication Functions

### Sign Up
```javascript
import { signUp } from '@/lib/authService';

const user = await signUp(email, password, displayName);
```

### Sign In
```javascript
import { signIn } from '@/lib/authService';

const user = await signIn(email, password);
```

### Sign Out
```javascript
import { logOut } from '@/lib/authService';

await logOut();
```

### Reset Password
```javascript
import { resetPassword } from '@/lib/authService';

await resetPassword(email);
```

---

## 💬 Firestore Functions

### Add a Message
```javascript
import { addMessage } from '@/lib/firestoreService';

const messageId = await addMessage(conversationId, userId, "Hello!");
```

### Listen to Messages (Real-time)
```javascript
import { subscribeToMessages } from '@/lib/firestoreService';

useEffect(() => {
  const unsubscribe = subscribeToMessages(conversationId, (messages) => {
    setMessages(messages);
  });

  return unsubscribe; // Cleanup
}, [conversationId]);
```

### Create Conversation
```javascript
import { createConversation } from '@/lib/firestoreService';

const conversationId = await createConversation(userId, participantId, name);
```

### Get User's Conversations (Real-time)
```javascript
import { subscribeToUserConversations } from '@/lib/firestoreService';

useEffect(() => {
  const unsubscribe = subscribeToUserConversations(userId, (conversations) => {
    setConversations(conversations);
  });

  return unsubscribe;
}, [userId]);
```

---

## 🎯 Using Auth Context in Components

```javascript
import { useAuth } from '@/features/chat/hooks/useAuth';

export default function MyComponent() {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) return <div>Loading...</div>;

  if (!isAuthenticated) return <div>Please log in</div>;

  return <div>Welcome, {user.displayName}!</div>;
}
```

---

## 🧪 Testing the Setup

1. **Start your app:**
   ```bash
   npm run dev
   ```

2. **Test Sign Up:**
   - Visit the app (should show signup page)
   - Create an account with email/password
   - Check Firebase Console → Authentication to see your user

3. **Test Sign In:**
   - Log out from UserProfile menu
   - Log back in with your credentials

4. **Test Firestore:**
   - Open Firebase Console → Firestore Database
   - Create a test conversation and message
   - Verify data appears in the console

---

## ⚠️ Security Notes

- ✅ API keys are now in `.env` (not committed to Git)
- ✅ `.env` is in `.gitignore` to prevent exposure
- ✅ Firestore rules restrict data access
- ✅ Messages can only be deleted/edited by their creator
- ✅ Users can only access their own conversations

---

## 🐛 Common Issues

**Issue:** "Auth not initialized"
- **Solution:** Make sure `.env` is configured before starting the app

**Issue:** "User data not saving to Firestore"
- **Solution:** Check Firestore rules in Firebase Console. They might be too restrictive.

**Issue:** "Real-time updates not working"
- **Solution:** Verify the `unsubscribe` function is being returned in useEffect cleanup

---

## 📚 Next Steps

1. Update `ChatPage.jsx` to use `useAuth()` hook
2. Integrate `UserProfile.jsx` into your chat header
3. Use Firestore functions to replace any backend API calls for messaging
4. Add more Firestore features (typing indicators, read receipts, etc.)

---

**Need help?** Check Firebase docs: https://firebase.google.com/docs/web/setup
