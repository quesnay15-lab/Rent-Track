import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  Alert,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../context/AuthContext";
import { getApartmentById } from "../../services/apartmentService";
import { createRequest } from "../../services/requestService";
import {
  getReviewsForApartment,
  getRatingSummary,
  getUserReviewForApartment,
  createReview,
} from "../../services/reviewService";
import CustomButton from "../../components/CustomButton";
import Loading from "../../components/Loading";
import StarRating from "../../components/StarRating";
import { COLORS, SPACING, RADIUS, FONT_SIZES } from "../../constants/theme";

export default function ApartmentDetailsScreen() {
  const { id } = useLocalSearchParams();
  const { user, profile } = useAuth();
  const [apartment, setApartment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [reviews, setReviews] = useState([]);
  const [ratingSummary, setRatingSummary] = useState({ average: 0, count: 0 });
  const [myRating, setMyRating] = useState(0);
  const [myComment, setMyComment] = useState("");
  const [existingReviewId, setExistingReviewId] = useState(null);
  const [submittingReview, setSubmittingReview] = useState(false);

  const loadReviews = useCallback(async () => {
    const [reviewList, summary] = await Promise.all([
      getReviewsForApartment(id),
      getRatingSummary(id),
    ]);
    setReviews(reviewList);
    setRatingSummary(summary);

    if (user) {
      const mine = await getUserReviewForApartment(id, user.uid);
      if (mine) {
        setExistingReviewId(mine.id);
        setMyRating(mine.rating);
        setMyComment(mine.comment);
      }
    }
  }, [id, user]);

  useEffect(() => {
    (async () => {
      try {
        const data = await getApartmentById(id);
        setApartment(data);
        await loadReviews();
      } catch (error) {
        console.log("Error loading apartment:", error);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const handleSubmitReview = async () => {
    if (!user) return;
    if (myRating < 1) {
      Alert.alert("Add a rating", "Please tap a star to rate this apartment.");
      return;
    }

    setSubmittingReview(true);
    try {
      await createReview({
        apartmentId: apartment.id,
        userId: user.uid,
        userName: profile?.fullName || "Anonymous",
        rating: myRating,
        comment: myComment,
      });
      await loadReviews();
      Alert.alert(
        "Thanks!",
        existingReviewId ? "Your review has been updated." : "Your review has been posted."
      );
    } catch (error) {
      console.log("Error submitting review:", error);
      Alert.alert("Error", "Could not submit your review. Please try again.");
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleRequestToRent = async () => {
    if (!user) return;

    setSubmitting(true);
    try {
      await createRequest(apartment.id, user.uid);
      Alert.alert(
        "Request Submitted",
        "Your rental request has been sent successfully.",
        [
          {
            text: "View My Requests",
            onPress: () => router.replace("/(tabs)/my-requests"),
          },
          { text: "OK" },
        ]
      );
    } catch (error) {
      console.log("Error creating request:", error);
      Alert.alert("Error", "Could not submit your request. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <Loading message="Loading apartment..." />;
  }

  if (!apartment) {
    return (
      <View style={styles.notFound}>
        <Text style={styles.notFoundText}>Apartment not found.</Text>
        <CustomButton title="Go Back" onPress={() => router.back()} />
      </View>
    );
  }

  const isAvailable = apartment.status === "Available";
  const isOwnListing = apartment.landlordId && apartment.landlordId === user?.uid;
  const canMessageLandlord =
    apartment.landlordId && !isOwnListing && profile?.role !== "landlord";
  const canReview = !!user && !isOwnListing;

  const handleMessageLandlord = () => {
    router.push(`/chat/${apartment.id}__${user.uid}`);
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Image
          source={{ uri: apartment.image }}
          style={styles.image}
          resizeMode="cover"
        />

        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={COLORS.black} />
        </TouchableOpacity>

        <View style={styles.content}>
          <Text style={styles.title}>{apartment.title}</Text>
          <Text style={styles.rent}>${apartment.monthlyRent} / month</Text>

          <View style={styles.ratingSummaryRow}>
            <StarRating rating={ratingSummary.average} size={16} />
            <Text style={styles.ratingSummaryText}>
              {ratingSummary.count > 0
                ? `${ratingSummary.average} · ${ratingSummary.count} review${ratingSummary.count === 1 ? "" : "s"}`
                : "No reviews yet"}
            </Text>
          </View>

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

          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>{apartment.description}</Text>

          <View style={styles.divider} />

          <Text style={styles.sectionTitle}>Ratings &amp; Reviews</Text>

          {reviews.length === 0 ? (
            <Text style={styles.noReviewsText}>
              No reviews yet — be the first to share your experience.
            </Text>
          ) : (
            reviews.map((review) => (
              <View key={review.id} style={styles.reviewCard}>
                <View style={styles.reviewHeaderRow}>
                  <Text style={styles.reviewerName} numberOfLines={1}>
                    {review.userName}
                  </Text>
                  <Text style={styles.reviewDate}>{formatDate(review.date)}</Text>
                </View>
                <StarRating rating={review.rating} size={14} style={styles.reviewStars} />
                {review.comment ? (
                  <Text style={styles.reviewComment}>{review.comment}</Text>
                ) : null}
              </View>
            ))
          )}

          {canReview && (
            <View style={styles.reviewForm}>
              <Text style={styles.reviewFormLabel}>
                {existingReviewId ? "Update your review" : "Write a review"}
              </Text>
              <StarRating
                rating={myRating}
                size={30}
                interactive
                onChange={setMyRating}
                style={styles.reviewFormStars}
              />
              <TextInput
                style={styles.reviewInput}
                value={myComment}
                onChangeText={setMyComment}
                placeholder="Share your experience with this apartment (optional)"
                placeholderTextColor={COLORS.gray}
                multiline
              />
              <CustomButton
                title={existingReviewId ? "Update Review" : "Submit Review"}
                onPress={handleSubmitReview}
                loading={submittingReview}
                variant="outline"
              />
            </View>
          )}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        {isOwnListing ? (
          <CustomButton
            title="Edit Listing"
            onPress={() => router.push(`/apartment-form?id=${apartment.id}`)}
          />
        ) : (
          <>
            <CustomButton
              title={isAvailable ? "Request to Rent" : "Not Available"}
              onPress={handleRequestToRent}
              loading={submitting}
              disabled={!isAvailable}
            />
            {canMessageLandlord && (
              <CustomButton
                title="Message Landlord"
                onPress={handleMessageLandlord}
                variant="outline"
                style={styles.messageButton}
              />
            )}
          </>
        )}
      </View>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  scrollContent: {
    paddingBottom: SPACING.xl,
  },
  image: {
    width: "100%",
    height: 260,
    backgroundColor: COLORS.lightGray,
  },
  backButton: {
    position: "absolute",
    top: SPACING.lg,
    left: SPACING.lg,
    backgroundColor: COLORS.white,
    width: 40,
    height: 40,
    borderRadius: RADIUS.full,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  content: {
    padding: SPACING.lg,
  },
  title: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: "800",
    color: COLORS.black,
  },
  rent: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.primary,
    fontWeight: "700",
    marginTop: SPACING.xs,
    marginBottom: SPACING.sm,
  },
  badge: {
    alignSelf: "flex-start",
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
    marginBottom: SPACING.lg,
  },
  badgeText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: "700",
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: "700",
    color: COLORS.black,
    marginBottom: SPACING.xs,
  },
  description: {
    fontSize: FONT_SIZES.md,
    color: COLORS.gray,
    lineHeight: 22,
  },
  ratingSummaryRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.md,
  },
  ratingSummaryText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray,
    marginLeft: SPACING.xs,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: SPACING.lg,
  },
  noReviewsText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.gray,
  },
  reviewCard: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  reviewHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  reviewerName: {
    fontSize: FONT_SIZES.md,
    fontWeight: "700",
    color: COLORS.black,
    flex: 1,
    marginRight: SPACING.sm,
  },
  reviewDate: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray,
  },
  reviewStars: {
    marginBottom: 4,
  },
  reviewComment: {
    fontSize: FONT_SIZES.md,
    color: COLORS.gray,
    lineHeight: 20,
  },
  reviewForm: {
    marginTop: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
  },
  reviewFormLabel: {
    fontSize: FONT_SIZES.md,
    fontWeight: "700",
    color: COLORS.black,
    marginBottom: SPACING.sm,
  },
  reviewFormStars: {
    marginBottom: SPACING.md,
  },
  reviewInput: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    minHeight: 70,
    textAlignVertical: "top",
    fontSize: FONT_SIZES.md,
    color: COLORS.black,
    marginBottom: SPACING.md,
  },
  footer: {
    padding: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  messageButton: {
    marginTop: SPACING.sm,
  },
  notFound: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: SPACING.lg,
  },
  notFoundText: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.gray,
    marginBottom: SPACING.md,
  },
});
