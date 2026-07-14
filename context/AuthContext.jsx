// Provides the current logged-in user (and their profile) to the whole app.
// Wrap the app with <AuthProvider> once in app/_layout.jsx.
//
// Session state now comes from real Firebase Authentication instead of a
// locally-saved id. onAuthStateChanged fires automatically on login/logout/
// app restart, and refreshUser() is still available to force a re-fetch of
// the Firestore profile fields (e.g. right after editing name/photo/role).

import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../services/firebaseConfig";
import { getUserProfile } from "../services/authService";

const AuthContext = createContext({
  user: null,
  profile: null,
  initializing: true,
  refreshUser: async () => {},
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [initializing, setInitializing] = useState(true);

  const applyFirebaseUser = async (firebaseUser) => {
    if (firebaseUser) {
      const userProfile = await getUserProfile(firebaseUser.uid);
      setUser({ uid: firebaseUser.uid });
      setProfile(userProfile);
    } else {
      setUser(null);
      setProfile(null);
    }
  };

  // Manually re-pull the Firestore profile for whichever user is
  // currently signed in — used right after registering or editing profile
  // fields, since those don't otherwise trigger onAuthStateChanged.
  const refreshUser = async () => {
    await applyFirebaseUser(auth.currentUser);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      await applyFirebaseUser(firebaseUser);
      setInitializing(false);
    });
    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider value={{ user, profile, initializing, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
