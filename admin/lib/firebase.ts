// Firebase configuration
import { initializeApp } from 'firebase/app';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
    apiKey: "AIzaSyCCfJ7SSxZhzNZtTJVOfsvNg-JONHLGTQs",
    authDomain: "login-with-anyone.firebaseapp.com",
    projectId: "login-with-anyone",
    storageBucket: "login-with-anyone.firebasestorage.app",
    messagingSenderId: "421547516120",
    appId: "1:421547516120:web:4b1437ebc35e0465137ad"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Storage
export const storage = getStorage(app);
