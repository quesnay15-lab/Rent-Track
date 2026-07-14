import { initializeApp, getApps, getApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence, getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

const firebaseConfig = {
  apiKey: "AIzaSyDhu9IX9ShWRGeYn4_7GLaolFXwBOX9Js8",
  authDomain: "renttrack-a6e48.firebaseapp.com",
  projectId: "renttrack-a6e48",
  storageBucket: "renttrack-a6e48.firebasestorage.app",
  messagingSenderId: "207522227720",
  appId: "1:207522227720:web:c00a9862e63ace9d5dd3bd",
  measurementId: "G-L5L7RLVHYC"
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const auth =
  Platform.OS === "web"
    ? getAuth(app)
    : (() => {
        try {
          return initializeAuth(app, {
            persistence: getReactNativePersistence(AsyncStorage),
          });
        } catch (error) {
          return getAuth(app);
        }
      })();

export const db = getFirestore(app);