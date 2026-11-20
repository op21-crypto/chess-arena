// Firebase Web SDK integration for Google / Gmail Authentication
// Project: arena-e49f1

export const firebaseConfig = {
  apiKey: "AIzaSyCt1mVfba7ydMIzUOwgJLPX-xBKdIsn5YY",
  authDomain: "arena-e49f1.firebaseapp.com",
  projectId: "arena-e49f1",
  storageBucket: "arena-e49f1.firebasestorage.app",
  messagingSenderId: "737563478630",
  appId: "1:737563478630:web:fb05508c698614eb397ba7",
  measurementId: "G-711SQ0PLWT"
};

let firebaseModulesPromise = null;

export async function loadFirebaseModules() {
  if (!firebaseModulesPromise) {
    firebaseModulesPromise = (async () => {
      try {
        const { initializeApp, getApps, getApp } = await import(
          /* @vite-ignore */ 'https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js'
        );
        const {
          getAuth,
          GoogleAuthProvider,
          signInWithPopup
        } = await import(
          /* @vite-ignore */ 'https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js'
        );

        const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
        const auth = getAuth(app);
        const googleProvider = new GoogleAuthProvider();
        googleProvider.setCustomParameters({ prompt: 'select_account' });

        return { app, auth, googleProvider, signInWithPopup };
      } catch (err) {
        console.error('Failed to dynamically load Firebase modules from Google CDN:', err);
        throw err;
      }
    })();
  }
  return firebaseModulesPromise;
}

export async function signInWithFirebaseGoogle() {
  const { auth, googleProvider, signInWithPopup } = await loadFirebaseModules();
  const result = await signInWithPopup(auth, googleProvider);
  const user = result.user;
  const idToken = await user.getIdToken();

  return {
    email: user.email,
    name: user.displayName || user.email?.split('@')[0],
    avatar: user.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.displayName || 'player'}`,
    uid: user.uid,
    idToken
  };
}
