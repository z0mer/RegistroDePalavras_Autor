// ========================================
// FIREBASE CONFIGURATION
// ========================================

const firebaseConfig = {
    apiKey: "AIzaSyClgtgavP88SZNJ-J2v32nFCRzuahI-INE",
    authDomain: "registrodepalavras.firebaseapp.com",
    projectId: "registrodepalavras",
    storageBucket: "registrodepalavras.firebasestorage.app",
    messagingSenderId: "908021304531",
    appId: "1:908021304531:web:0b489e1b9ac2f5ef3c59A4",
    measurementId: "G-67RF9KM1Z8"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize Firestore
const db = firebase.firestore();

// Initialize Auth
const auth = firebase.auth();
const googleProvider = new firebase.auth.GoogleAuthProvider();

// Current user
let currentUser = null;

console.log('🔥 Firebase inicializado com sucesso!');
