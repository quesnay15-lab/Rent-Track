import React from "react";
import { Redirect } from "expo-router";
import { useAuth } from "../context/AuthContext";
import Loading from "../components/Loading";

// The very first screen. It waits for AuthContext to check whether a user
// is already logged in (stored locally), then sends them to the right place.
export default function Index() {
  const { user, initializing } = useAuth();

  if (initializing) {
    return <Loading message="Starting RentTrack..." />;
  }

  if (user) {
    return <Redirect href="/(tabs)/home" />;
  }

  return <Redirect href="/(auth)/login" />;
}
