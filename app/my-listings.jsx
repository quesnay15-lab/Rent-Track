import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { router, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../context/AuthContext";
import { getApartmentsByLandlord, deleteApartment } from "../services/apartmentService";
import { getRatingSummaries } from "../services/reviewService";
import CustomButton from "../components/CustomButton";
import Loading from "../components/Loading";
import EmptyState from "../components/EmptyState";
import StarRating from "../components/StarRating";
import { COLORS, SPACING, RADIUS, FONT_SIZES } from "../constants/theme";

// A landlord's own listings, with the ability to add, edit, and delete.
export default function MyListingsScreen() {
  const { user } = useAuth();
  const [apartments, setApartments] = useState([]);
  const [ratingSummaries, setRatingSummaries] = useState({});
  const [loading, setLoading] = useState(true);

  const loadListings = useCallback(async () => {
    if (!user) return;
    const data = await getApartmentsByLandlord(user.uid);
    setApartments(data);
    const summaries = await getRatingSummaries(data.map((a) => a.id));
    setRatingSummaries(summaries);
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      (async () => {
        setLoading(true);
        await loadListings();
        setLoading(false);
      })();
    }, [loadListings])
  );

  const handleDelete = (apartment) => {
    Alert.alert(
      "Delete this listing?",
      `"${apartment.title}" will be permanently removed.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            await deleteApartment(apartment.id);
            setApartments((prev) => prev.filter((a) => a.id !== apartment.id));
          },
        },
      ]
    );
  };

  if (loading) {
    return <Loading message="Loading your listings..." />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="arrow-back" size={22} color={COLORS.black} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Listings</Text>
        <View style={{ width: 22 }} />
      </View>

      <FlatList
        data={apartments}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <CustomButton
            title="+ Add New Listing"
            onPress={() => router.push("/apartment-form")}
            style={styles.addButton}
          />
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Image source={{ uri: item.image }} style={styles.image} resizeMode="cover" />
            <View style={styles.cardBody}>
              <Text style={styles.title} numberOfLines={1}>
                {item.title}
              </Text>
              <Text style={styles.rent}>${item.monthlyRent} / month</Text>
              <Text style={styles.status}>{item.status}</Text>

              <View style={styles.ratingRow}>
                <StarRating
                  rating={ratingSummaries[item.id]?.average || 0}
                  size={14}
                />
                <Text style={styles.ratingText}>
                  {ratingSummaries[item.id]?.count
                    ? `${ratingSummaries[item.id].average} (${ratingSummaries[item.id].count} review${ratingSummaries[item.id].count === 1 ? "" : "s"})`
                    : "No reviews yet"}
                </Text>
              </View>

              <View style={styles.actionsRow}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => router.push(`/apartment-form?id=${item.id}`)}
                >
                  <Ionicons name="create-outline" size={18} color={COLORS.primary} />
                  <Text style={styles.actionText}>Edit</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleDelete(item)}
                >
                  <Ionicons name="trash-outline" size={18} color={COLORS.danger} />
                  <Text style={[styles.actionText, { color: COLORS.danger }]}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <EmptyState
            icon="business-outline"
            message="You haven't posted any listings yet. Tap 'Add New Listing' to get started."
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: "700",
    color: COLORS.black,
  },
  listContent: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.xl,
  },
  addButton: {
    marginBottom: SPACING.lg,
  },
  card: {
    flexDirection: "row",
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.md,
    overflow: "hidden",
  },
  image: {
    width: 100,
    height: 100,
    backgroundColor: COLORS.lightGray,
  },
  cardBody: {
    flex: 1,
    padding: SPACING.md,
  },
  title: {
    fontSize: FONT_SIZES.md,
    fontWeight: "700",
    color: COLORS.black,
  },
  rent: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary,
    fontWeight: "600",
    marginTop: 2,
  },
  status: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray,
    marginTop: 2,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  ratingText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray,
    marginLeft: SPACING.xs,
  },
  actionsRow: {
    flexDirection: "row",
    marginTop: SPACING.sm,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: SPACING.lg,
  },
  actionText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary,
    fontWeight: "600",
    marginLeft: 4,
  },
});
