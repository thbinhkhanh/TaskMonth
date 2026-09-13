import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCVQOYcyd6bpEDVMqA_KO4E9iKv3CfYRGg",
  authDomain: "taskmonth.firebaseapp.com",
  projectId: "taskmonth",
  storageBucket: "taskmonth.firebasestorage.app",
  messagingSenderId: "147557082854",
  appId: "1:147557082854:web:996089b8c991c7c9c83d27"
};

const app = initializeApp(firebaseConfig);

// Thay "export className db" bằng "export const db"
export const db = getFirestore(app);