import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyD6XaujVBBvvJLh9ashlpJWIQuN1hOTb1g",
  authDomain: "dsproject-c32dd.firebaseapp.com",
  projectId: "dsproject-c32dd",
  storageBucket: "dsproject-c32dd.firebasestorage.app",
  messagingSenderId: "177492141507",
  appId: "1:177492141507:web:6dc3b8e62b0f543ef68976",
  measurementId: "G-XKCV9T6W7E"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export default app;