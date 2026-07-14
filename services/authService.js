import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateEmail,
} from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "./firebaseConfig";
import { uploadImageAsync } from "./uploadImage";

function friendlyAuthError(error) {
  const code = error?.code || "";
  if (code.includes("email-already-in-use")) {
    return "An account with this email already exists.";
  }
  if (code.includes("invalid-email")) {
    return "Please enter a valid email address.";
  }
  if (code.includes("weak-password")) {
    return "Password should be at least 6 characters.";
  }
  if (
    code.includes("wrong-password") ||
    code.includes("invalid-credential") ||
    code.includes("user-not-found")
  ) {
    return "Incorrect email or password.";
  }
  if (code.includes("requires-recent-login")) {
    return "Please log out and log back in before changing your email.";
  }
  if (code.includes("network-request-failed")) {
    return "Network error — please check your internet connection.";
  }
  return error?.message || "Something went wrong. Please try again.";
}

// Create a new account and log the user in immediately.
// role is either "tenant" (default) or "landlord".
export async function registerUser(fullName, email, password, role = "tenant") {
  try {
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    const uid = credential.user.uid;

    await setDoc(doc(db, "users", uid), {
      fullName,
      email,
      role,
      photoUri: null,
    });

    return { uid, email };
  } catch (error) {
    throw new Error(friendlyAuthError(error));
  }
}

// Log an existing user in
export async function loginUser(email, password) {
  try {
    const credential = await signInWithEmailAndPassword(auth, email, password);
    return { uid: credential.user.uid, email: credential.user.email };
  } catch (error) {
    throw new Error(friendlyAuthError(error));
  }
}

// Log the current user out
export async function logoutUser() {
  await signOut(auth);
}

// Fetch a user's profile by id
export async function getUserProfile(uid) {
  if (!uid) return null;
  const snapshot = await getDoc(doc(db, "users", uid));
  if (!snapshot.exists()) return null;
  const data = snapshot.data();
  return {
    uid,
    fullName: data.fullName,
    email: data.email,
    photoUri: data.photoUri || null,
    role: data.role || "tenant",
  };
}

// Update a user's profile info (full name, email, and/or profile photo)
export async function updateUserProfile(uid, updates) {
  try {
    const ref = doc(db, "users", uid);
    const cleanUpdates = { ...updates };

    // If a new local photo was picked (a file on this device), upload it
    // to Firebase Storage first so the URL works from any device.
    if (cleanUpdates.photoUri && !cleanUpdates.photoUri.startsWith("http")) {
      cleanUpdates.photoUri = await uploadImageAsync(
        cleanUpdates.photoUri,
        `profile-photos/${uid}.jpg`
      );
    }

    if (cleanUpdates.email && auth.currentUser) {
      await updateEmail(auth.currentUser, cleanUpdates.email);
    }

    await updateDoc(ref, cleanUpdates);

    const snapshot = await getDoc(ref);
    const data = snapshot.data();
    return {
      uid,
      fullName: data.fullName,
      email: data.email,
      photoUri: data.photoUri || null,
      role: data.role || "tenant",
    };
  } catch (error) {
    throw new Error(friendlyAuthError(error));
  }
}
