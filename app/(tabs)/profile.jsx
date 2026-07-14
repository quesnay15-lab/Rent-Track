import React, { useState } from "react";
import { View, Text, Image, StyleSheet, Alert } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../context/AuthContext";
import { logoutUser } from "../../services/authService";
import CustomButton from "../../components/CustomButton";
import { COLORS, SPACING, RADIUS, FONT_SIZES } from "../../constants/theme";

export default function ProfileScreen() {
  const { user, profile, refreshUser } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logoutUser();
      await refreshUser();
      router.replace("/(auth)/login");
    } catch (error) {
      Alert.alert("Error", "Could not log out. Please try again.");
    } finally {
      setLoggingOut(false);
    }
  };

  const initials = (profile?.fullName || user?.email || "?")
    .trim()
    .charAt(0)
    .toUpperCase();

  return (
    <View style={styles.container}>
      {profile?.photoUri ? (
        <Image source={{ uri: profile.photoUri }} style={styles.avatarImage} />
      ) : (
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
      )}

      <Text style={styles.name}>{profile?.fullName || "RentTrack User"}</Text>
      <Text style={styles.email}>{user?.email}</Text>
      {profile?.role && (
        <View style={styles.roleBadge}>
          <Text style={styles.roleBadgeText}>
            {profile.role === "landlord" ? "Landlord" : "Tenant"}
          </Text>
        </View>
      )}

      <View style={styles.infoCard}>
        <View style={styles.infoRow}>
          <Ionicons name="person-outline" size={20} color={COLORS.gray} />
          <View style={styles.infoTextGroup}>
            <Text style={styles.infoLabel}>Full Name</Text>
            <Text style={styles.infoValue}>
              {profile?.fullName || "Not set"}
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.infoRow}>
          <Ionicons name="mail-outline" size={20} color={COLORS.gray} />
          <View style={styles.infoTextGroup}>
            <Text style={styles.infoLabel}>Email</Text>
            <Text style={styles.infoValue}>{user?.email}</Text>
          </View>
        </View>
      </View>

      {profile?.role === "landlord" && (
        <CustomButton
          title="My Listings"
          onPress={() => router.push("/my-listings")}
          variant="outline"
          style={styles.editButton}
        />
      )}

      <CustomButton
        title="Edit Profile"
        onPress={() => router.push("/edit-profile")}
        variant="outline"
        style={styles.editButton}
      />

      <CustomButton
        title="Log Out"
        onPress={handleLogout}
        loading={loggingOut}
        variant="outline"
        style={styles.logoutButton}
      />
    </View>
  );
}

const AVATAR_SIZE = 90;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
    alignItems: "center",
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xl * 1.5,
  },
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: SPACING.md,
  },
  avatarImage: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    backgroundColor: COLORS.lightGray,
    marginBottom: SPACING.md,
  },
  avatarText: {
    fontSize: 36,
    fontWeight: "800",
    color: COLORS.white,
  },
  name: {
    fontSize: FONT_SIZES.xl,
    fontWeight: "800",
    color: COLORS.black,
  },
  email: {
    fontSize: FONT_SIZES.md,
    color: COLORS.gray,
    marginTop: 4,
    marginBottom: SPACING.md,
  },
  roleBadge: {
    backgroundColor: "#EFF6FF",
    paddingHorizontal: SPACING.md,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
    marginBottom: SPACING.lg,
  },
  roleBadgeText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: "700",
    color: COLORS.primary,
  },
  infoCard: {
    width: "100%",
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  infoTextGroup: {
    marginLeft: SPACING.md,
  },
  infoLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray,
  },
  infoValue: {
    fontSize: FONT_SIZES.md,
    color: COLORS.black,
    fontWeight: "600",
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: SPACING.md,
  },
  editButton: {
    width: "100%",
    marginBottom: SPACING.md,
  },
  logoutButton: {
    width: "100%",
  },
});
