// CRUD helpers for rental requests, backed by Firebase Firestore so a
// tenant's request (and its status) is visible to the landlord — and to
// the tenant themselves — from any device.

import {
  collection,
  doc,
  addDoc,
  getDocs,
  deleteDoc,
  query,
  where,
} from "firebase/firestore";
import { db } from "./firebaseConfig";

const requestsCollection = collection(db, "requests");

function docToRequest(docSnap) {
  return { id: docSnap.id, ...docSnap.data() };
}

// Create a new rental request for an apartment
export async function createRequest(apartmentId, userId) {
  const newRequest = {
    apartmentId,
    userId,
    requestDate: new Date().toISOString(),
    status: "Pending",
  };
  const docRef = await addDoc(requestsCollection, newRequest);
  return { id: docRef.id, ...newRequest };
}

// Get all requests submitted by a specific user, newest first
export async function getUserRequests(userId) {
  const q = query(requestsCollection, where("userId", "==", userId));
  const snapshot = await getDocs(q);
  return snapshot.docs
    .map(docToRequest)
    .sort((a, b) => new Date(b.requestDate) - new Date(a.requestDate));
}

// Remove a request — e.g. the user already found a place elsewhere
// and no longer needs to track this request.
export async function deleteRequest(requestId) {
  await deleteDoc(doc(db, "requests", requestId));
}
