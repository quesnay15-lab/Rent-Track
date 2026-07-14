import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
} from "react-native";
import { router } from "expo-router";
import { useAuth } from "../../context/AuthContext";
import { subscribeToApartments } from "../../services/apartmentService";
import { getRatingSummaries } from "../../services/reviewService";
import ApartmentCard from "../../components/ApartmentCard";
import SearchBar from "../../components/SearchBar";
import Loading from "../../components/Loading";
import EmptyState from "../../components/EmptyState";
import { COLORS, SPACING, FONT_SIZES } from "../../constants/theme";

export default function HomeScreen() {
  const { profile } = useAuth();
  const [apartments, setApartments] = useState([]);
  const [ratingSummaries, setRatingSummaries] = useState({});
  const [searchText, setSearchText] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Load rating summaries whenever the apartment list changes.
  const loadRatingSummaries = useCallback(async (apartmentList) => {
    try {
      const summaries = await getRatingSummaries(
        apartmentList.map((a) => a.id)
      );
      setRatingSummaries(summaries);
    } catch (error) {
      console.log("Error loading rating summaries:", error);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    setErrorMessage("");

    const unsubscribe = subscribeToApartments(
      (data) => {
        setApartments(data);
        setLoading(false);
        setRefreshing(false);
        loadRatingSummaries(data);
      },
      (error) => {
        console.log("Error loading apartments:", error);
        setErrorMessage("Could not load apartments. Pull down to try again.");
        setLoading(false);
        setRefreshing(false);
      }
    );

    return () => unsubscribe();
  }, [loadRatingSummaries]);

  // With a live listener, pull-to-refresh doesn't need to re-fetch —
  // data is already current. We just give the UI a quick spinner beat.
  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 500);
  };

  const filteredApartments = apartments.filter((apartment) =>
    apartment.title?.toLowerCase().includes(searchText.toLowerCase())
  );

  if (loading) {
    return <Loading message="Loading apartments..." />;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={filteredApartments}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ListHeaderComponent={
          <View>
            <Text style={styles.welcome}>
              Welcome{profile?.fullName ? `, ${profile.fullName}` : ""} 👋
            </Text>
            <Text style={styles.subtitle}>Find your next apartment</Text>

            <SearchBar
              value={searchText}
              onChangeText={setSearchText}
              placeholder="Search by apartment name..."
            />

            {errorMessage ? (
              <Text style={styles.errorText}>{errorMessage}</Text>
            ) : null}
          </View>
        }
        renderItem={({ item }) => (
          <ApartmentCard
            apartment={item}
            onPress={() => router.push(`/apartment/${item.id}`)}
            ratingSummary={ratingSummaries[item.id]}
          />
        )}
        ListEmptyComponent={
          <EmptyState
            icon="business-outline"
            message={
              searchText
                ? "No apartments match your search."
                : "No apartments available right now."
            }
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
  listContent: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.xl,
  },
  welcome: {
    fontSize: FONT_SIZES.xl,
    fontWeight: "800",
    color: COLORS.black,
  },
  subtitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.gray,
    marginTop: SPACING.xs,
    marginBottom: SPACING.md,
  },
  errorText: {
    color: COLORS.danger,
    fontSize: FONT_SIZES.sm,
    marginBottom: SPACING.md,
  },
});