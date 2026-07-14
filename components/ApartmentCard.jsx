import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { COLORS, SPACING, RADIUS, FONT_SIZES } from "../constants/theme";
import StarRating from "./StarRating";

// Displays a single apartment summary on the Home screen.
// ratingSummary is optional: { average, count } — pass it in if the
// caller has already loaded review data (see Home screen), so cards
// don't each fetch reviews individually.
export default function ApartmentCard({ apartment, onPress, ratingSummary }) {
  const isAvailable = apartment.status === "Available";
  const hasRatings = ratingSummary && ratingSummary.count > 0;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      <Image
        source={{ uri: apartment.image }}
        style={styles.image}
        resizeMode="cover"
      />
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={1}>
          {apartment.title}
        </Text>
        <Text style={styles.rent}>${apartment.monthlyRent} / month</Text>

        <View style={styles.ratingRow}>
          <StarRating rating={hasRatings ? ratingSummary.average : 0} size={14} />
          <Text style={styles.ratingText}>
            {hasRatings
              ? `${ratingSummary.average} (${ratingSummary.count})`
              : "No reviews yet"}
          </Text>
        </View>

        <View style={styles.footerRow}>
          <View
            style={[
              styles.badge,
              { backgroundColor: isAvailable ? "#DCFCE7" : "#FEE2E2" },
            ]}
          >
            <Text
              style={[
                styles.badgeText,
                { color: isAvailable ? "#15803D" : "#B91C1C" },
              ]}
            >
              {apartment.status}
            </Text>
          </View>

          <TouchableOpacity style={styles.button} onPress={onPress}>
            <Text style={styles.buttonText}>View Details</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.md,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  image: {
    width: "100%",
    height: 160,
    backgroundColor: COLORS.lightGray,
  },
  info: {
    padding: SPACING.md,
  },
  title: {
    fontSize: FONT_SIZES.lg,
    fontWeight: "700",
    color: COLORS.black,
    marginBottom: SPACING.xs,
  },
  rent: {
    fontSize: FONT_SIZES.md,
    color: COLORS.primary,
    fontWeight: "600",
    marginBottom: SPACING.sm,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.sm,
  },
  ratingText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray,
    marginLeft: SPACING.xs,
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  badge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
  },
  badgeText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: "600",
  },
  button: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.sm,
    fontWeight: "600",
  },
});
