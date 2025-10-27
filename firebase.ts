// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "gen-lang-client-0896165463",
  authDomain: "parivartan-site.firebaseapp.com",
  projectId: "parivartan-site",
  storageBucket: "parivartan-site.firebasestorage.app",
  messagingSenderId: "588577174947",
  appId: "1:588577174947:web:03daa6931f1833f0289616",
  measurementId: "G-0XNMMJYHRZ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// To use other Firebase services, import them and initialize them here.
// For example:
// import { getFirestore } from "firebase/firestore";
// const db = getFirestore(app);

export { app };