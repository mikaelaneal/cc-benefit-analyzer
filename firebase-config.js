// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAVYg81E9eoyllIOR1__N48fWzEOqor-L8",
  authDomain: "credit-cards-rewards-tracker.firebaseapp.com",
  projectId: "credit-cards-rewards-tracker",
  storageBucket: "credit-cards-rewards-tracker.firebasestorage.app",
  messagingSenderId: "282954536684",
  appId: "1:282954536684:web:72ca614a012f554cd437c9",
  measurementId: "G-C5ZCGZ4L5P"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
