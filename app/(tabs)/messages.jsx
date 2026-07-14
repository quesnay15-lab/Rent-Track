import React, { useCallback, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from "react-native";
import { router, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../context/AuthContext";
import { getApartmentById, getApartmentsByLandlord } from "../../services/apartmentService";
import { getUserProfile } from "../../services/authService";
import {
  getConversationsForTenant,
  getConversationsForApartments,
} from "../../services/messageService";
import Loading from "../../components/Loading";
import EmptyState from "../../components/EmptyState";
import { COLORS, SPACING, RADIUS, FONT_SIZES } from "../../constants/theme";

export default function MessagesScreen() {
  const { user, profile } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  const isLandlord = profile?.role === "landlord";

  const loadConversations = useCallback(async () => {
    if (!user) return;

    let threads = [];
    if (isLandlord) {
      const ownApartments = await getApartmentsByLandlord(user.uid);
      const apartmentIds = ownApartments.map((a) => a.id);
      threads = await getConversationsForApartments(apartmentIds);
    } else {
      threads = await getConversationsForTenant(user.uid);
    }

    // Attach display info (apartment title, other party's name) for the list
    const enriched = await Promise.all(
      threads.map(async (thread) => {
        const apartment = await getApartmentById(thread.apartmentId);
        let otherPartyName = "";
        if (isLandlord) {
          const tenantProfile = await getUserProfile(thread.tenantId);
          otherPartyName = tenantProfile?.fullName || "Tenant";
        } else {
          const landlordProfile = apartment?.landlordId
            ? await getUserProfile(apartment.landlordId)
            : null;
          otherPartyName = landlordProfile?.fullName || "Landlord";
        }
        return {
          ...thread,
          apartmentTitle: apartment?.title || "Apartment removed",
          otherPartyName,
        };
      })
    );

    setConversations(enriched);
  }, [user, isLandlord]);

  useFocusEffect(
    useCallback(() => {
      (async () => {
        setLoading(true);
        await loadConversations();
        setLoading(false);
      })();
    }, [loadConversations])
  );

  if (loading) {
    return <Loading message="Loading messages..." />;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={conversations}
        keyExtractor={(item) => `${item.apartmentId}__${item.tenantId}`}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={<Text style={styles.heading}>Messages</Text>}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => router.push(`/chat/${item.apartmentId}__${item.tenantId}`)}
          >
            <View style={styles.avatar}>
              <Ionicons name="person" size={22} color={COLORS.primary} />
            </View>
            <View style={styles.textGroup}>
              <Text style={styles.name} numberOfLines={1}>
                {item.otherPartyName}
              </Text>
              <Text style={styles.apartmentTitle} numberOfLines={1}>
                {item.apartmentTitle}
              </Text>
              <Text style={styles.lastMessage} numberOfLines={1}>
                {item.lastMessage.text}
              </Text>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <EmptyState
            icon="chatbubbles-outline"
            message={
              isLandlord
                ? "No messages from tenants yet."
                : "Message a landlord from an apartment's details page to start a conversation."
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
  heading: {
    fontSize: FONT_SIZES.xl,
    fontWeight: "800",
    color: COLORS.black,
    marginBottom: SPACING.md,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.full,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: SPACING.md,
  },
  textGroup: {
    flex: 1,
  },
  name: {
    fontSize: FONT_SIZES.md,
    fontWeight: "700",
    color: COLORS.black,
  },
  apartmentTitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary,
    marginTop: 1,
  },
  lastMessage: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray,
    marginTop: 2,
  },
});
