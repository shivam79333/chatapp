// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCbUTyNnOsrYDmmhca3pTtt2x-aBxT1pyc",
  authDomain: "chat-app-6deb8.firebaseapp.com",
  projectId: "chat-app-6deb8",
  storageBucket: "chat-app-6deb8.firebasestorage.app",
  messagingSenderId: "559056514034",
  appId: "1:559056514034:web:04d241287b4da2f5e0996b",
  measurementId: "G-T60XMJEVC4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);