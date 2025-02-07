// Initialize Firebase
const firebaseConfig = {
    apiKey: "AIzaSyAVYg81E9eoyllIOR1__N48fWzEOqor-L8",
    authDomain: "credit-cards-rewards-tracker.firebaseapp.com",
    projectId: "credit-cards-rewards-tracker",
    storageBucket: "credit-cards-rewards-tracker.fappspot.com",
    messagingSenderId: "282954536684",
    appId: "1:282954536684:web:72ca614a012f554cd437c9",
    measurementId: "G-C5ZCGZ4L5P"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();
