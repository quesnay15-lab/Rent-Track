import AsyncStorage from "@react-native-async-storage/async-storage";
import { SAMPLE_APARTMENTS } from "../constants/sampleApartments";

const KEYS = {
  USERS: "renttrack_users",
  CURRENT_USER_ID: "renttrack_current_user_id",
  APARTMENTS: "renttrack_apartments",
  REQUESTS: "renttrack_requests",
  MESSAGES: "renttrack_messages",
  REVIEWS: "renttrack_reviews",
};

async function readJSON(key, fallback) {
  const raw = await AsyncStorage.getItem(key);
  if (raw === null) return fallback;
  try {
    return JSON.parse(raw);
  } catch (error) {
    return fallback;
  }
}

async function writeJSON(key, value) {
  await AsyncStorage.setItem(key, JSON.stringify(value));
}

// ---- Users ----

export async function getUsers() {
  return readJSON(KEYS.USERS, []);
}

export async function saveUsers(users) {
  await writeJSON(KEYS.USERS, users);
}

// ---- Current session ----

export async function getCurrentUserId() {
  return AsyncStorage.getItem(KEYS.CURRENT_USER_ID);
}

export async function setCurrentUserId(uid) {
  await AsyncStorage.setItem(KEYS.CURRENT_USER_ID, uid);
}

export async function clearCurrentUserId() {
  await AsyncStorage.removeItem(KEYS.CURRENT_USER_ID);
}

// ---- Apartments (seeded once from sample data) ----

export async function getApartmentsRaw() {
  const existing = await readJSON(KEYS.APARTMENTS, null);
  if (existing && existing.length > 0) {
    return existing;
  }
  await writeJSON(KEYS.APARTMENTS, SAMPLE_APARTMENTS);
  return SAMPLE_APARTMENTS;
}

export async function saveApartments(apartments) {
  await writeJSON(KEYS.APARTMENTS, apartments);
}

// ---- Messages (chat between a tenant and a listing's landlord) ----

export async function getMessagesRaw() {
  return readJSON(KEYS.MESSAGES, []);
}

export async function saveMessages(messages) {
  await writeJSON(KEYS.MESSAGES, messages);
}

// ---- Requests ----

export async function getRequests() {
  return readJSON(KEYS.REQUESTS, []);
}

export async function saveRequests(requests) {
  await writeJSON(KEYS.REQUESTS, requests);
}

// ---- Reviews (star ratings + written feedback on apartment listings) ----

export async function getReviews() {
  return readJSON(KEYS.REVIEWS, []);
}

export async function saveReviews(reviews) {
  await writeJSON(KEYS.REVIEWS, reviews);
}
