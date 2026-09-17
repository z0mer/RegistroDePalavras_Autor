// ========================================
// FIREBASE CONFIGURATION
// ========================================

const firebaseConfig = {
    apiKey: "AIzaSyACgigeu7G8SZNJ-JZv32nFCRzuahL-1NE",
    authDomain: "registrodepalavras.firebaseapp.com",
    projectId: "registrodepalavras",
    storageBucket: "registrodepalavras.firebasestorage.app",
    messagingSenderId: "985281364531",
    appId: "1:985281364531:web:0b439e1b9ac2f5ef3c5946",
    measurementId: "G-67RP3KM128"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize Firestore
const db = firebase.firestore();

// Initialize Auth
const auth = firebase.auth();
const googleProvider = new firebase.auth.GoogleAuthProvider();

console.log('🔥 Firebase inicializado com sucesso!');
