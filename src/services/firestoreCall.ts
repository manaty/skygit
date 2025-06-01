import { collection, doc, getDoc, getDocs, getFirestore, setDoc } from "firebase/firestore";
import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: "AIzaSyDQa83bsK1bZcQglti5HGHX7kD94gMUg74",
  authDomain: "skygit-c6cca.firebaseapp.com",
  projectId: "skygit-c6cca",
  storageBucket: "skygit-c6cca.firebasestorage.app",
  messagingSenderId: "113883862579",
  appId: "1:113883862579:web:e98fb649c89e302be43546",
  measurementId: "G-6LXB6GHFVL"
};

type CallSessionType = {
  peer: string;
  repo: string;
  sdpPeers: any;
  status: string;
  updateAt: number;
}

export const getCallSessions = async () => {
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);

  const sessionsCollection = collection(db, "callSessions");

  const querySnapshot = await getDocs(sessionsCollection);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const getCallSession = async (sessionId) => {
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);

  const docRef = doc(db, "callSessions", sessionId);

  const querySnapshot = await getDoc(docRef);
  return querySnapshot;
}

export const createCallSession = async (sessionId: string, sessionData: CallSessionType) => {
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);

  const docRef = doc(db, "callSessions", sessionId);

  await setDoc(docRef, sessionData);
  return getDoc(docRef);
}