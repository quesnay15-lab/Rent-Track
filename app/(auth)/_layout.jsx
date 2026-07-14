import React from "react";
import { Stack } from "expo-router";

// Stack for the unauthenticated flow: Login and Register.
export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
    </Stack>
  );
}
