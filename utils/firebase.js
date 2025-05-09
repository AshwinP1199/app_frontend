import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBrzbkjzOCZvssygywPFKSezrFjyEZ2r8c",
  authDomain: "besideme-dea1f.firebaseapp.com",
  projectId: "besideme-dea1f",
  storageBucket: "besideme-dea1f.appspot.com",
  messagingSenderId: "16225162804",
  appId: "1:16225162804:web:12d141f0fded0444205c61",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const storage = getStorage(app);
