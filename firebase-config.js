// Firebase web app config (Firebase console → Project settings → Your apps → SDK setup).
// These values are public by design: access is controlled by the rules in firestore.rules, not by hiding them.
export const firebaseConfig = {
  apiKey: 'AIzaSyB8CJG5abrxX5wcCcnOZ2wgFZlZ5DKUiIY',
  authDomain: 'mindovermatter-93d7b.firebaseapp.com',
  projectId: 'mindovermatter-93d7b',
  storageBucket: 'mindovermatter-93d7b.firebasestorage.app',
  messagingSenderId: '439637831340',
  appId: '1:439637831340:web:caf284ef7884fac27ab909',
  measurementId: 'G-H7LHCM28XQ',
};

export const isFirebaseConfigured = !firebaseConfig.apiKey.startsWith('YOUR_');
