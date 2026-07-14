import React, { useEffect, useState } from "react";
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
import { useLocalSearchParams, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../context/AuthContext";
import {
  getApartmentById,
  createApartment,
  updateApartment,
} from "../services/apartmentService";
import CustomButton from "../components/CustomButton";
import Loading from "../components/Loading";
import { COLORS, SPACING, RADIUS, FONT_SIZES } from "../constants/theme";

// Add or edit a landlord's apartment listing.
// With no ?id= param: create mode. With ?id=<apartmentId>: edit mode.
export default function ApartmentFormScreen() {
  const { id } = useLocalSearchParams();
  const isEditing = Boolean(id);
  const { user } = useAuth();

  const [title, setTitle] = useState("");
  const [monthlyRent, setMonthlyRent] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  const [status, setStatus] = useState("Available");
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isEditing) return;
    (async () => {
      const apartment = await getApartmentById(id);
      if (apartment) {
        setTitle(apartment.title || "");
        setMonthlyRent(String(apartment.monthlyRent ?? ""));
        setDescription(apartment.description || "");
        setImage(apartment.image || "");
        setStatus(apartment.status || "Available");
      }
      setLoading(false);
    })();
  }, [id, isEditing]);

  const handleSave = async () => {
    if (!title.trim() || !monthlyRent.trim() || !description.trim() || !image.trim()) {
      Alert.alert("Missing information", "Please fill in all fields.");
      return;
    }

    setSaving(true);
    try {
      const data = {
        title: title.trim(),
        monthlyRent,
        description: description.trim(),
        image: image.trim(),
        status,
      };

      if (isEditing) {
        await updateApartment(id, data);
      } else {
        await createApartment(user.uid, data);
      }

      router.back();
    } catch (error) {
      Alert.alert("Error", error.message || "Could not save this listing.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <Loading message="Loading listing..." />;
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={22} color={COLORS.black} />
        </TouchableOpacity>

        <Text style={styles.heading}>
          {isEditing ? "Edit Listing" : "Add New Listing"}
        </Text>

        <Text style={styles.label}>Title</Text>
        <TextInput
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          placeholder="Sunny Studio Downtown"
          placeholderTextColor={COLORS.gray}
        />

        <Text style={styles.label}>Monthly Rent</Text>
        <TextInput
          style={styles.input}
          value={monthlyRent}
          onChangeText={setMonthlyRent}
          placeholder="450"
          placeholderTextColor={COLORS.gray}
          keyboardType="numeric"
        />

        <Text style={styles.label}>Description</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={description}
          onChangeText={setDescription}
          placeholder="Describe the apartment..."
          placeholderTextColor={COLORS.gray}
          multiline
        />

        <Text style={styles.label}>Image URL</Text>
        <TextInput
          style={styles.input}
          value={image}
          onChangeText={setImage}
          placeholder="https://..."
          placeholderTextColor={COLORS.gray}
          autoCapitalize="none"
        />

        <Text style={styles.label}>Status</Text>
        <View style={styles.statusRow}>
          <TouchableOpacity
            style={[styles.statusOption, status === "Available" && styles.statusOptionActive]}
            onPress={() => setStatus("Available")}
          >
            <Text style={[styles.statusText, status === "Available" && styles.statusTextActive]}>
              Available
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.statusOption, status === "Occupied" && styles.statusOptionActive]}
            onPress={() => setStatus("Occupied")}
          >
            <Text style={[styles.statusText, status === "Occupied" && styles.statusTextActive]}>
              Occupied
            </Text>
          </TouchableOpacity>
        </View>

        <CustomButton
          title={isEditing ? "Save Changes" : "Create Listing"}
          onPress={handleSave}
          loading={saving}
          style={styles.saveButton}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: COLORS.white },
  container: {
    flexGrow: 1,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.xl,
  },
  backButton: {
    marginBottom: SPACING.md,
  },
  heading: {
    fontSize: FONT_SIZES.xl,
    fontWeight: "800",
    color: COLORS.black,
    marginBottom: SPACING.lg,
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
  textArea: {
    height: 100,
    paddingTop: SPACING.sm,
    textAlignVertical: "top",
  },
  statusRow: {
    flexDirection: "row",
    marginBottom: SPACING.lg,
  },
  statusOption: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.sm,
    alignItems: "center",
    marginRight: SPACING.sm,
  },
  statusOptionActive: {
    borderColor: COLORS.primary,
    backgroundColor: "#EFF6FF",
  },
  statusText: {
    fontSize: FONT_SIZES.md,
    fontWeight: "600",
    color: COLORS.gray,
  },
  statusTextActive: {
    color: COLORS.primary,
  },
  saveButton: {
    marginTop: SPACING.sm,
  },
});
