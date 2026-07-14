// CRUD helpers for apartment ratings + written reviews, backed by Firebase
// Firestore so a rating left on one device is visible from any device.
// Each review is a 1-5 star rating plus an optional comment, left by a
// tenant against a specific apartment listing.

import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { db } from "./firebaseConfig";

const reviewsCollection = collection(db, "reviews");

function docToReview(docSnap) {
  return { id: docSnap.id, ...docSnap.data() };
}

// Create a new review for an apartment. If the author already reviewed
// this apartment, their existing review is updated instead of duplicated.
export async function createReview({ apartmentId, userId, userName, rating, comment }) {
  const clampedRating = Math.max(1, Math.min(5, Math.round(Number(rating) || 0)));

  const existing = await getUserReviewForApartment(apartmentId, userId);

  if (existing) {
    const updates = {
      rating: clampedRating,
      comment: comment?.trim() || "",
      date: new Date().toISOString(),
    };
    await updateDoc(doc(db, "reviews", existing.id), updates);
    return { ...existing, ...updates };
  }

  const newReview = {
    apartmentId,
    userId,
    userName: userName || "Anonymous",
    rating: clampedRating,
    comment: comment?.trim() || "",
    date: new Date().toISOString(),
  };
  const docRef = await addDoc(reviewsCollection, newReview);
  return { id: docRef.id, ...newReview };
}

// Get all reviews for a given apartment, newest first
export async function getReviewsForApartment(apartmentId) {
  const q = query(reviewsCollection, where("apartmentId", "==", apartmentId));
  const snapshot = await getDocs(q);
  return snapshot.docs
    .map(docToReview)
    .sort((a, b) => new Date(b.date) - new Date(a.date));
}

// Get { average, count } rating summary for a single apartment.
// average is rounded to 1 decimal place; 0 when there are no reviews yet.
export async function getRatingSummary(apartmentId) {
  const reviews = await getReviewsForApartment(apartmentId);
  if (reviews.length === 0) {
    return { average: 0, count: 0 };
  }
  const total = reviews.reduce((sum, r) => sum + r.rating, 0);
  return {
    average: Math.round((total / reviews.length) * 10) / 10,
    count: reviews.length,
  };
}

// Get { average, count } rating summaries for many apartments at once,
// keyed by apartmentId — handy for list screens like Home. Fetches all
// reviews once and groups them client-side to keep this to a single read.
export async function getRatingSummaries(apartmentIds) {
  const snapshot = await getDocs(reviewsCollection);
  const allReviews = snapshot.docs.map(docToReview);

  const summaries = {};
  for (const apartmentId of apartmentIds) {
    const forApartment = allReviews.filter((r) => r.apartmentId === apartmentId);
    if (forApartment.length === 0) {
      summaries[apartmentId] = { average: 0, count: 0 };
      continue;
    }
    const total = forApartment.reduce((sum, r) => sum + r.rating, 0);
    summaries[apartmentId] = {
      average: Math.round((total / forApartment.length) * 10) / 10,
      count: forApartment.length,
    };
  }
  return summaries;
}

// Find the review a specific user already left for an apartment, if any —
// used so the review form can pre-fill/edit rather than create a duplicate.
export async function getUserReviewForApartment(apartmentId, userId) {
  const q = query(
    reviewsCollection,
    where("apartmentId", "==", apartmentId),
    where("userId", "==", userId)
  );
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  return docToReview(snapshot.docs[0]);
}

// Remove a review — e.g. the author wants to take it down
export async function deleteReview(reviewId) {
  await deleteDoc(doc(db, "reviews", reviewId));
}
