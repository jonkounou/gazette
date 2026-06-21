import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  projectId: "gen-lang-client-0563086444",
  appId: "1:127948260782:web:3cdd21f079a4b1d3c2f43f",
  apiKey: "AIzaSyDAhJzFly6ib_JM3Et17PBybr6k2Jbsh7w",
  authDomain: "gen-lang-client-0563086444.firebaseapp.com",
  storageBucket: "gen-lang-client-0563086444.firebasestorage.app",
  messagingSenderId: "127948260782"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
