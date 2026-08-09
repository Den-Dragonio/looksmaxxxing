import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCiVi5GLfR4Wa2nGnQLoTQHHiQOzF0si9k",
  authDomain: "looksmaxizm.firebaseapp.com",
  projectId: "looksmaxizm",
  storageBucket: "looksmaxizm.firebasestorage.app",
  messagingSenderId: "333869448544",
  appId: "1:333869448544:web:d3989dc2b5abf233833205",
  measurementId: "G-68FL6QPQFV"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);

export { app, analytics, db };
