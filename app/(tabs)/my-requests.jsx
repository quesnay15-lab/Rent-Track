import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../context/AuthContext";
import { getUserRequests, deleteRequest } from "../../services/requestService";
import { getApartmentById } from "../../services/apartmentService";
import Loading from "../../components/Loading";
import EmptyState from "../../components/EmptyState";
import { COLORS, SPACING, RADIUS, FONT_SIZES } from "../../constants/theme";

export default function MyRequestsScreen() {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const loadRequests = useCallback(async () => {
    if (!user) return;
    try {
      setErrorMessage("");
      const userRequests = await getUserRequests(user.uid);

      // Attach the apartment's title + current status to each request so
      // the tenant can see if a place they requested got taken already
      // (e.g. another tenant was approved and it's now Occupied).
      const withApartmentNames = await Promise.all(
        userRequests.map(async (req) => {
          const apartment = await getApartmentById(req.apartmentId);
          return {
            ...req,
            apartmentTitle: apartment ? apartment.title : "Apartment removed",
            apartmentStatus: apartment ? apartment.status : null,
          };
        })
      );

      setRequests(withApartmentNames);
    } catch (error) {
      console.log("Error loading requests:", error);
      setErrorMessage("Could not load your requests. Pull down to try again.");
    }
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      (async () => {
        setLoading(true);
        await loadRequests();
        setLoading(false);
      })();
    }, [loadRequests])
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadRequests();
    setRefreshing(false);
  };

  const handleDelete = (item) => {
    Alert.alert(
      "Remove this request?",
      `If you already found a place, you can remove your request for "${item.apartmentTitle}".`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteRequest(item.id);
              setRequests((prev) => prev.filter((r) => r.id !== item.id));
            } catch (error) {
              console.log("Error deleting request:", error);
              Alert.alert("Error", "Could not remove this request. Please try again.");
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return <Loading message="Loading your requests..." />;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={requests}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ListHeaderComponent={
          <View>
            <Text style={styles.heading}>My Requests</Text>
            {errorMessage ? (
              <Text style={styles.errorText}>{errorMessage}</Text>
            ) : null}
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.apartmentTitle} numberOfLines={1}>
                {item.apartmentTitle}
              </Text>
              <TouchableOpacity
                onPress={() => handleDelete(item)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="trash-outline" size={20} color={COLORS.danger} />
              </TouchableOpacity>
            </View>
            <Text style={styles.date}>
              Requested on {formatDate(item.requestDate)}
            </Text>
            <View style={styles.badgeRow}>
              <View style={[styles.statusBadge, statusStyle(item.status)]}>
                <Text style={styles.statusText}>{item.status}</Text>
              </View>

              {item.apartmentStatus === "Occupied" && (
                <View style={styles.occupiedBadge}>
                  <Ionicons name="alert-circle" size={14} color="#B45309" />
                  <Text style={styles.occupiedText}>
                    {item.status === "Approved"
                      ? "Occupied by you"
                      : "Already occupied"}
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}
        ListEmptyComponent={
          <EmptyState
            icon="document-text-outline"
            message="You haven't submitted any rental requests yet."
          />
        }
      />
    </View>
  );
}

function formatDate(isoDate) {
  try {
    const date = new Date(isoDate);
    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch (error) {
    return isoDate;
  }
}

function statusStyle(status) {
  if (status === "Approved") return { backgroundColor: "#DCFCE7" };
  if (status === "Rejected") return { backgroundColor: "#FEE2E2" };
  return { backgroundColor: "#FEF9C3" };
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
  heading: {
    fontSize: FONT_SIZES.xl,
    fontWeight: "800",
    color: COLORS.black,
    marginBottom: SPACING.md,
  },
  errorText: {
    color: COLORS.danger,
    fontSize: FONT_SIZES.sm,
    marginBottom: SPACING.md,
  },
  card: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  apartmentTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: "700",
    color: COLORS.black,
    flex: 1,
    marginRight: SPACING.sm,
  },
  date: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray,
    marginBottom: SPACING.sm,
  },
  statusBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
  },
  statusText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: "700",
    color: COLORS.black,
  },
  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
  },
  occupiedBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEF3C7",
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
    marginLeft: SPACING.sm,
  },
  occupiedText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: "700",
    color: "#B45309",
    marginLeft: 4,
  },
});
