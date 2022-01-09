import { getFirestore } from "firebase/firestore";
import { initializeApp } from "firebase/app";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: `${process.env.REACT_APP_FB_KEY}`,
  authDomain: "marketplace-app-97cf9.firebaseapp.com",
  projectId: "marketplace-app-97cf9",
  storageBucket: "marketplace-app-97cf9.appspot.com",
  messagingSenderId: "230459913336",
  appId: "1:230459913336:web:df9e1e02535e7c93fc298d",
};

// Initialize Firebase
initializeApp(firebaseConfig);

// exports db
export const db = getFirestore();
