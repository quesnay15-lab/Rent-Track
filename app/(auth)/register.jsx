import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from "react-native";
import { Link, router } from "expo-router";
import CustomButton from "../../components/CustomButton";
import PasswordInput from "../../components/PasswordInput";
import { registerUser } from "../../services/authService";
import { useAuth } from "../../context/AuthContext";
import { COLORS, SPACING, RADIUS, FONT_SIZES } from "../../constants/theme";

export default function RegisterScreen() {
  const { refreshUser } = useAuth();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("tenant");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!fullName.trim() || !email.trim() || !password) {
      Alert.alert("Missing information", "Please fill in all fields.");
      return;
    }
    if (password.length < 6) {
      Alert.alert("Weak password", "Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    try {
      await registerUser(fullName.trim(), email.trim(), password, role);
      await refreshUser();
      router.replace("/(tabs)/home");
    } catch (error) {
      Alert.alert("Registration failed", error.message || "Something went wrong. Please try again.");
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
        <Text style={styles.subtitle}>Create an account to get started.</Text>

        <View style={styles.form}>
          <Text style={styles.label}>I am a...</Text>
          <View style={styles.roleRow}>
            <TouchableOpacity
              style={[styles.roleOption, role === "tenant" && styles.roleOptionActive]}
              onPress={() => setRole("tenant")}
            >
              <Text style={[styles.roleText, role === "tenant" && styles.roleTextActive]}>
                Tenant
              </Text>
              <Text style={[styles.roleSubtext, role === "tenant" && styles.roleTextActive]}>
                Looking for a place
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.roleOption, role === "landlord" && styles.roleOptionActive]}
              onPress={() => setRole("landlord")}
            >
              <Text style={[styles.roleText, role === "landlord" && styles.roleTextActive]}>
                Landlord
              </Text>
              <Text style={[styles.roleSubtext, role === "landlord" && styles.roleTextActive]}>
                Listing a property
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>Full Name</Text>
          <TextInput
            style={styles.input}
            value={fullName}
            onChangeText={setFullName}
            placeholder="Juan Dela Cruz"
            placeholderTextColor={COLORS.gray}
          />

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
            placeholder="At least 6 characters"
          />

          <CustomButton
            title="Create Account"
            onPress={handleRegister}
            loading={loading}
            style={styles.button}
          />

          <View style={styles.footerRow}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <Link href="/(auth)/login" style={styles.link}>
              Log In
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
  roleRow: {
    flexDirection: "row",
    marginBottom: SPACING.md,
  },
  roleOption: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.sm,
    alignItems: "center",
    marginRight: SPACING.sm,
  },
  roleOptionActive: {
    borderColor: COLORS.primary,
    backgroundColor: "#EFF6FF",
  },
  roleText: {
    fontSize: FONT_SIZES.md,
    fontWeight: "700",
    color: COLORS.gray,
  },
  roleSubtext: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray,
    marginTop: 2,
  },
  roleTextActive: {
    color: COLORS.primary,
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
