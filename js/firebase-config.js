// ============================================
// FIREBASE CONFIGURATION - NEXUSINVEST
// ============================================
// This file initializes Firebase services for the NexusInvest platform
// Storage is disabled - using external image hosting instead

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBV9cIyhlF6AmXHyyW4oSbK4qF8yIDvKgY",
  authDomain: "nexusinvest-9c2bd.firebaseapp.com",
  projectId: "nexusinvest-9c2bd",
  storageBucket: "nexusinvest-9c2bd.firebasestorage.app",
  messagingSenderId: "352516330840",
  appId: "1:352516330840:web:5d4d0d1bc4baaea9ecc12d"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = firebase.auth();
const db = firebase.firestore();

// Note: Storage is disabled (requires billing upgrade)
// Using external image hosting services instead (Cloudinary/ImgBB)
// Uncomment below when you upgrade to Blaze plan:
// const storage = firebase.storage();

// Enable offline persistence using the new recommended method
// This removes the deprecation warning
try {
  firebase.firestore().enablePersistence({ synchronizeTabs: true });
} catch (err) {
  if (err.code === 'failed-precondition') {
    console.log('Multiple tabs open, persistence can only be enabled in one tab at a time.');
  } else if (err.code === 'unimplemented') {
    console.log('The current browser does not support persistence.');
  }
}

// Export for use in other files
window.auth = auth;
window.db = db;

// Storage will be null until billing is upgraded
window.storage = null;

// Log initialization status
console.log('Firebase initialized successfully');
console.log('Authentication: Enabled');
console.log('Firestore: Enabled');
console.log('Storage: Disabled (using external hosting)');
