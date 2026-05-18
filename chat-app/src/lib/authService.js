import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged,
} from "firebase/auth";
import { auth } from "./firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "./firebase";

// Validate that auth is initialized
if (!auth) {
  console.error("❌ Firebase Auth is not initialized. Check your .env file credentials.");
}

// Listen to auth state changes
export const subscribeToAuthState = (callback) => {
  if (!auth) {
    callback(null);
    return () => {};
  }

  const unsubscribe = onAuthStateChanged(auth, async (user) => {
    if (user) {
      // Get user data from Firestore
      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        const userData = userDoc.exists() ? userDoc.data() : {};
        callback({
          ...user,
          ...userData,
        });
      } catch (error) {
        console.error("Error fetching user data:", error);
        callback(user);
      }
    } else {
      callback(null);
    }
  });

  return unsubscribe;
};

// Update user profile
export const updateUserProfile = async (updates) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error("No user logged in");

    // Update auth profile
    if (updates.displayName || updates.photoURL) {
      await updateProfile(user, {
        displayName: updates.displayName || user.displayName,
        photoURL: updates.photoURL || user.photoURL,
      });
    }

    // Update Firestore document
    await setDoc(
      doc(db, "users", user.uid),
      {
        ...updates,
        updatedAt: new Date(),
      },
      { merge: true }
    );

    return user;
  } catch (error) {
    console.error("Error updating user profile:", error);
    throw error;
  }
};

// Get user by UID
export const getUserById = async (uid) => {
  try {
    const userDoc = await getDoc(doc(db, "users", uid));
    return userDoc.exists() ? userDoc.data() : null;
  } catch (error) {
    console.error("Error fetching user:", error);
    throw error;
  }
};
