// Firebase console → Project settings → Your apps → Web app → firebaseConfig.
// These values identify the project and are not secret; access is protected by firestore.rules.
export const firebaseConfig = {
  apiKey: 'AIzaSyB9ZYIvpMzFbpNXf0f-wKAIxN4CjAb-Ncg',
  authDomain: 'what2watch-51a3b.firebaseapp.com',
  projectId: 'what2watch-51a3b',
  storageBucket: 'what2watch-51a3b.firebasestorage.app',
  messagingSenderId: '152026140831',
  appId: '1:152026140831:web:bcf28265b6589e896712aa'
};

// Shared list name for the family.
export const HOUSEHOLD = 'family';

// Google accounts allowed to sign in (lowercase). Must match the list in firestore.rules,
// which is the real enforcement — this one only shows a friendly message.
export const ALLOWED_EMAILS = [
  'person1@gmail.com',
  'person2@gmail.com'
];
