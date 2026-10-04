// Site content backed by Firebase: Firestore holds blog posts and events, Auth handles the admin sign-in.
// The Firebase SDK is loaded on demand, so pages that never touch this data don't download it.
import { firebaseConfig, isFirebaseConfigured } from '../firebase-config.js';

export { isFirebaseConfigured };

// Blog categories: the stored id, its display name, and the one-line description on the Blog page.
// Changing this list also needs the matching list in firestore.rules (isValidPost) updated.
export const blogCategories = [
  { id: 'student-life', label: 'Student life', description: 'Exams, pressure, and finding balance between studies and the rest of life.' },
  { id: 'coping-skills', label: 'Coping skills', description: 'Practical tools for anxiety, low mood, stress, and building resilience.' },
  { id: 'wellbeing', label: 'Wellbeing', description: 'Rest, relationships, and a healthier pace of life.' },
  { id: 'club-news', label: 'Club news', description: 'Updates, announcements, and recaps from Mind Over Matter.' },
];

export const categories = blogCategories.map((category) => category.id);

export function categoryLabel(id) {
  return blogCategories.find((category) => category.id === id)?.label ?? id;
}
export const eventTypes = ['Workshop', 'Support group', 'Social', 'Talk', 'Awareness', 'Other'];

const DEFAULT_AUTHOR = 'Mind Over Matter';
const WORDS_PER_MINUTE = 200;
const COVER_MAX_WIDTH = 1200;
// Firestore documents are capped at 1 MiB; keep the embedded cover image well under that.
const COVER_MAX_CHARS = 700_000;

// Firebase is split so each visitor downloads only what they need: the database for everyone reading posts
// and events, and the sign-in module only on the admin page. Each part loads once and is then reused.
let appPromise;
let databasePromise;
let authPromise;

function loadApp() {
  appPromise ??= import('firebase/app').then(({ initializeApp }) => initializeApp(firebaseConfig));
  return appPromise;
}

function loadDatabase() {
  databasePromise ??= Promise.all([loadApp(), import('firebase/firestore')])
    .then(([app, firestore]) => ({ firestore, db: firestore.getFirestore(app) }));
  return databasePromise;
}

function loadAuth() {
  authPromise ??= Promise.all([loadApp(), import('firebase/auth')])
    .then(([app, auth]) => ({ auth, authInstance: auth.getAuth(app) }));
  return authPromise;
}

/* ---------- Blog posts ---------- */

const dateFormat = new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

// Removes the formatting marks used in posts (## headings, **bold**, [links](…), - bullets, > quotes)
// so automatic summaries read as plain sentences.
function plainText(text) {
  return text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/^\s*(#{2,3}|[-*]|\d+[.)]|>)\s+/gm, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function toPost(id, data) {
  const paragraphs = data.body.split(/\n\s*\n/).map((text) => plainText(text)).filter(Boolean);
  const words = data.body.split(/\s+/).filter(Boolean).length;
  const createdAt = data.createdAt?.toDate() ?? new Date();
  return {
    slug: id,
    title: data.title,
    category: data.category,
    author: data.author || DEFAULT_AUTHOR,
    date: dateFormat.format(createdAt),
    createdAt,
    updatedAt: data.updatedAt?.toDate() ?? null,
    readTime: `${Math.max(1, Math.round(words / WORDS_PER_MINUTE))} min read`,
    coverLabel: categoryLabel(data.category),
    coverImage: data.coverImage || null,
    excerpt: data.excerpt || `${paragraphs[0]?.slice(0, 180) ?? ''}${paragraphs[0]?.length > 180 ? '…' : ''}`,
    content: paragraphs,
    // Raw values, so the admin editor can be filled in exactly as saved.
    rawExcerpt: data.excerpt || '',
    body: data.body,
  };
}

function cleanPost({ title, category, author, excerpt, body, coverImage }) {
  return {
    title: title.trim(),
    category,
    author: author.trim() || DEFAULT_AUTHOR,
    excerpt: excerpt.trim(),
    body: body.trim(),
    coverImage: coverImage || null,
  };
}

export async function fetchPosts() {
  const { firestore, db } = await loadDatabase();
  const { collection, getDocs, orderBy, query } = firestore;
  const snapshot = await getDocs(query(collection(db, 'posts'), orderBy('createdAt', 'desc')));
  return snapshot.docs.map((doc) => toPost(doc.id, doc.data()));
}

export async function createPost(fields) {
  const { firestore, db } = await loadDatabase();
  await firestore.addDoc(firestore.collection(db, 'posts'), { ...cleanPost(fields), createdAt: firestore.serverTimestamp() });
}

export async function updatePost(id, fields) {
  const { firestore, db } = await loadDatabase();
  await firestore.updateDoc(firestore.doc(db, 'posts', id), { ...cleanPost(fields), updatedAt: firestore.serverTimestamp() });
}

export async function removePost(id) {
  const { firestore, db } = await loadDatabase();
  await firestore.deleteDoc(firestore.doc(db, 'posts', id));
}

/* ---------- Events ---------- */
// Dates are stored as "YYYY-MM-DD" and times as "HH:MM" (or ""), so they sort correctly as text and never shift
// between time zones.

function toEvent(id, data) {
  return {
    id,
    title: data.title,
    type: data.type,
    description: data.description || '',
    date: data.date,
    time: data.time || '',
    venue: data.venue || '',
  };
}

function cleanEvent({ title, type, description, date, time, venue }) {
  return {
    title: title.trim(),
    type,
    description: description.trim(),
    date,
    time: time || '',
    venue: venue.trim(),
  };
}

export async function fetchEvents() {
  const { firestore, db } = await loadDatabase();
  const { collection, getDocs, orderBy, query } = firestore;
  const snapshot = await getDocs(query(collection(db, 'events'), orderBy('date', 'asc')));
  return snapshot.docs.map((doc) => toEvent(doc.id, doc.data()));
}

export async function createEvent(fields) {
  const { firestore, db } = await loadDatabase();
  await firestore.addDoc(firestore.collection(db, 'events'), { ...cleanEvent(fields), createdAt: firestore.serverTimestamp() });
}

export async function updateEvent(id, fields) {
  const { firestore, db } = await loadDatabase();
  await firestore.updateDoc(firestore.doc(db, 'events', id), { ...cleanEvent(fields), updatedAt: firestore.serverTimestamp() });
}

export async function removeEvent(id) {
  const { firestore, db } = await loadDatabase();
  await firestore.deleteDoc(firestore.doc(db, 'events', id));
}

/* ---------- Contact messages ---------- */
// Anyone can send a message; only admins can read, mark, or delete them (see firestore.rules).

export const messageTopics = ['General question', 'Peer counselling', 'Membership', 'Partnership', 'Events', 'Other'];

function toMessage(id, data) {
  return {
    id,
    name: data.name,
    email: data.email,
    topic: data.topic,
    message: data.message,
    read: Boolean(data.read),
    createdAt: data.createdAt?.toDate() ?? new Date(),
  };
}

export async function sendMessage({ name, email, topic, message }) {
  const { firestore, db } = await loadDatabase();
  await firestore.addDoc(firestore.collection(db, 'messages'), {
    name: name.trim(),
    email: email.trim(),
    topic,
    message: message.trim(),
    read: false,
    createdAt: firestore.serverTimestamp(),
  });
}

export async function fetchMessages() {
  const { firestore, db } = await loadDatabase();
  const { collection, getDocs, orderBy, query } = firestore;
  const snapshot = await getDocs(query(collection(db, 'messages'), orderBy('createdAt', 'desc')));
  return snapshot.docs.map((doc) => toMessage(doc.id, doc.data()));
}

export async function setMessageRead(id, read) {
  const { firestore, db } = await loadDatabase();
  await firestore.updateDoc(firestore.doc(db, 'messages', id), { read });
}

export async function removeMessage(id) {
  const { firestore, db } = await loadDatabase();
  await firestore.deleteDoc(firestore.doc(db, 'messages', id));
}

/* ---------- Admin sign-in ---------- */

// Calls back with { user, isAdmin, adminName } whenever the sign-in state changes; returns an unsubscribe function.
// adminName comes from the "name" field of the user's document in the "admins" collection.
export function watchAdmin(callback) {
  let unsubscribe = () => {};
  let cancelled = false;

  Promise.all([loadAuth(), loadDatabase()]).then(([{ auth, authInstance }, { firestore, db }]) => {
    if (cancelled) return;
    unsubscribe = auth.onAuthStateChanged(authInstance, async (user) => {
      if (!user) {
        callback({ user: null, isAdmin: false, adminName: '' });
        return;
      }
      try {
        const adminDoc = await firestore.getDoc(firestore.doc(db, 'admins', user.uid));
        const name = adminDoc.exists() ? adminDoc.data().name : '';
        callback({ user, isAdmin: adminDoc.exists(), adminName: typeof name === 'string' ? name.trim() : '' });
      } catch {
        callback({ user, isAdmin: false, adminName: '' });
      }
    });
  });

  return () => {
    cancelled = true;
    unsubscribe();
  };
}

// Sessions are kept only for the current browser tab, so closing the tab or browser signs the admin out.
export async function signIn(email, password) {
  const { auth, authInstance } = await loadAuth();
  await auth.setPersistence(authInstance, auth.browserSessionPersistence);
  await auth.signInWithEmailAndPassword(authInstance, email, password);
}

// Emails a password reset link. Firebase does not reveal whether the address has an account.
export async function resetPassword(email) {
  const { auth, authInstance } = await loadAuth();
  await auth.sendPasswordResetEmail(authInstance, email);
}

export async function signOut() {
  const { auth, authInstance } = await loadAuth();
  await auth.signOut(authInstance);
}

/* ---------- Helpers ---------- */

// Shrinks an uploaded image to a compressed JPEG data URL small enough to store inside the post.
export async function compressCover(file) {
  const url = URL.createObjectURL(file);
  try {
    const image = await new Promise((resolve, reject) => {
      const element = new Image();
      element.onload = () => resolve(element);
      element.onerror = () => reject(new Error('That file could not be read as an image.'));
      element.src = url;
    });

    let width = Math.min(COVER_MAX_WIDTH, image.naturalWidth);
    for (let attempt = 0; attempt < 6; attempt += 1) {
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = Math.round((image.naturalHeight / image.naturalWidth) * width);
      canvas.getContext('2d').drawImage(image, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.75);
      if (dataUrl.length <= COVER_MAX_CHARS) return dataUrl;
      width = Math.round(width * 0.75);
    }
    throw new Error('That image is too large even after compressing. Try a smaller one.');
  } finally {
    URL.revokeObjectURL(url);
  }
}

export function describeError(error) {
  const code = error?.code ?? '';
  if (code === 'auth/invalid-credential' || code === 'auth/wrong-password' || code === 'auth/user-not-found') {
    return 'That email and password don’t match an admin account.';
  }
  if (code === 'auth/too-many-requests') return 'Too many attempts. Please wait a few minutes and try again.';
  if (code === 'auth/invalid-email') return 'That doesn’t look like a valid email address.';
  if (code === 'auth/network-request-failed') return 'Can’t reach the sign-in service. Check your internet connection.';
  if (code === 'permission-denied') {
    return 'The database refused this change. Check this account is listed in "admins" and that the latest security rules are published.';
  }
  if (code === 'unavailable') return 'Can’t reach the database. Check your internet connection.';
  return error?.message || 'Something went wrong. Please try again.';
}
