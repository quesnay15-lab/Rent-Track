import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  onSnapshot,
} from "firebase/firestore";
import { db } from "./firebaseConfig";
import { SAMPLE_APARTMENTS } from "../constants/sampleApartments";

const apartmentsCollection = collection(db, "apartments");

let seeded = false;

async function seedIfEmpty() {
  if (seeded) return;

  const snapshot = await getDocs(apartmentsCollection);
  if (!snapshot.empty) {
    seeded = true;
    return;
  }

  await Promise.all(
    SAMPLE_APARTMENTS.map((apartment) => {
      const { id, ...data } = apartment;
      return addDoc(apartmentsCollection, data);
    })
  );

  seeded = true;
}

function docToApartment(docSnap) {
  return { id: docSnap.id, ...docSnap.data() };
}

// One-time fetch — kept for any callers that don't need live updates.
export async function getApartments() {
  await seedIfEmpty();
  const snapshot = await getDocs(apartmentsCollection);
  return snapshot.docs.map(docToApartment);
}

// Live listener — used by the tenant home screen.
export function subscribeToApartments(onUpdate, onError) {
  let unsubscribe = () => {};
  let cancelled = false;

  seedIfEmpty()
    .then(() => {
      if (cancelled) return;

      unsubscribe = onSnapshot(
        apartmentsCollection,
        (snapshot) => {
          onUpdate(snapshot.docs.map(docToApartment));
        },
        (error) => {
          console.error("subscribeToApartments error:", error);
          onError?.(error);
        }
      );
    })
    .catch((error) => {
      console.error("seedIfEmpty error:", error);
      onError?.(error);
    });

  return () => {
    cancelled = true;
    unsubscribe();
  };
}

export async function getApartmentById(apartmentId) {
  if (!apartmentId) return null;
  const ref = doc(db, "apartments", apartmentId);
  const snapshot = await getDoc(ref);
  return snapshot.exists() ? docToApartment(snapshot) : null;
}

export async function getApartmentsByLandlord(landlordId) {
  const q = query(apartmentsCollection, where("landlordId", "==", landlordId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(docToApartment);
}

export async function createApartment(landlordId, data) {
  const newApartment = {
    landlordId,
    title: data.title,
    monthlyRent: Number(data.monthlyRent) || 0,
    description: data.description,
    image: data.image,
    status: data.status || "Available",
  };
  const docRef = await addDoc(apartmentsCollection, newApartment);
  return { id: docRef.id, ...newApartment };
}

export async function updateApartment(apartmentId, updates) {
  const ref = doc(db, "apartments", apartmentId);
  const existing = await getDoc(ref);
  if (!existing.exists()) {
    throw new Error("Apartment not found.");
  }

  const cleanUpdates = { ...updates };
  if (cleanUpdates.monthlyRent !== undefined) {
    cleanUpdates.monthlyRent = Number(cleanUpdates.monthlyRent) || 0;
  }

  await updateDoc(ref, cleanUpdates);
  return { id: apartmentId, ...existing.data(), ...cleanUpdates };
}

export async function deleteApartment(apartmentId) {
  const ref = doc(db, "apartments", apartmentId);
  await deleteDoc(ref);
}