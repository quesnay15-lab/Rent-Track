import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from "react-native";
import { Link, router } from "expo-router";
import CustomButton from "../../components/CustomButton";
import PasswordInput from "../../components/PasswordInput";
import { loginUser } from "../../services/authService";
import { useAuth } from "../../context/AuthContext";
import { COLORS, SPACING, RADIUS, FONT_SIZES } from "../../constants/theme";

export default function LoginScreen() {
  const { refreshUser } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      Alert.alert("Missing information", "Please enter your email and password.");
      return;
    }

    setLoading(true);
    try {
      await loginUser(email.trim(), password);
      await refreshUser();
      router.replace("/(tabs)/home");
    } catch (error) {
      Alert.alert("Login failed", error.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.logo}>RentTrack</Text>
        <Text style={styles.subtitle}>Welcome back! Log in to continue.</Text>

        <View style={styles.form}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            placeholderTextColor={COLORS.gray}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <Text style={styles.label}>Password</Text>
          <PasswordInput
            value={password}
            onChangeText={setPassword}
            placeholder="Your password"
          />

          <CustomButton
            title="Log In"
            onPress={handleLogin}
            loading={loading}
            style={styles.button}
          />

          <View style={styles.footerRow}>
            <Text style={styles.footerText}>Don't have an account? </Text>
            <Link href="/(auth)/register" style={styles.link}>
              Register
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: COLORS.white },
  container: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xl,
  },
  logo: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: "800",
    color: COLORS.primary,
    textAlign: "center",
  },
  subtitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.gray,
    textAlign: "center",
    marginTop: SPACING.xs,
    marginBottom: SPACING.xl,
  },
  form: {
    width: "100%",
  },
  label: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.black,
    fontWeight: "600",
    marginBottom: SPACING.xs,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    height: 48,
    marginBottom: SPACING.md,
    fontSize: FONT_SIZES.md,
    color: COLORS.black,
  },
  button: {
    marginTop: SPACING.sm,
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: SPACING.lg,
  },
  footerText: {
    color: COLORS.gray,
    fontSize: FONT_SIZES.sm,
  },
  link: {
    color: COLORS.primary,
    fontSize: FONT_SIZES.sm,
    fontWeight: "700",
  },
});
