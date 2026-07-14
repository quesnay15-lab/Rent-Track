import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, FONT_SIZES, SPACING } from "../constants/theme";

// Shown when a list (apartments, requests) has no items to display.
export default function EmptyState({ icon = "home-outline", message }) {
  return (
    <View style={styles.container}>
      <Ionicons name={icon} size={48} color={COLORS.border} />
      <Text style={styles.text}>{message || "Nothing to show yet"}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: SPACING.xl * 2,
  },
  text: {
    marginTop: SPACING.sm,
    color: COLORS.gray,
    fontSize: FONT_SIZES.md,
    textAlign: "center",
  },
});
