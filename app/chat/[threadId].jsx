import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Image,
} from "react-native";
import { useLocalSearchParams, router, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../context/AuthContext";
import { getApartmentById } from "../../services/apartmentService";
import { getUserProfile } from "../../services/authService";
import { getThreadMessages, sendMessage } from "../../services/messageService";
import Loading from "../../components/Loading";
import { COLORS, SPACING, RADIUS, FONT_SIZES } from "../../constants/theme";

// threadId is "<apartmentId>__<tenantId>" — see services/messageService.js
export default function ChatScreen() {
  const { threadId } = useLocalSearchParams();
  const [apartmentId, tenantId] = String(threadId).split("__");
  const { user, profile } = useAuth();

  const [apartment, setApartment] = useState(null);
  const [otherProfile, setOtherProfile] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const listRef = useRef(null);

  const isLandlordViewing = profile?.role === "landlord";

  const loadThread = useCallback(async () => {
    const apt = await getApartmentById(apartmentId);
    setApartment(apt);

    // Figure out who the "other person" in this conversation is, and
    // grab their full profile (name, photo, role) to show in the header.
    if (isLandlordViewing) {
      const tenantProfile = await getUserProfile(tenantId);
      setOtherProfile(
        tenantProfile || { fullName: "Tenant", role: "tenant" }
      );
    } else if (apt?.landlordId) {
      const landlordProfile = await getUserProfile(apt.landlordId);
      setOtherProfile(
        landlordProfile || { fullName: "Landlord", role: "landlord" }
      );
    }

    const thread = await getThreadMessages(apartmentId, tenantId);
    setMessages(thread);
  }, [apartmentId, tenantId, isLandlordViewing]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      await loadThread();
      setLoading(false);
    })();
  }, [loadThread]);

  // Refresh whenever the screen regains focus (e.g. after switching accounts
  // to reply as the other party on the same device)
  useFocusEffect(
    useCallback(() => {
      loadThread();
    }, [loadThread])
  );

  const handleSend = async () => {
    if (!text.trim()) return;

    setSending(true);
    try {
      await sendMessage({
        apartmentId,
        tenantId,
        senderId: user.uid,
        senderRole: profile?.role || "tenant",
        text: text.trim(),
      });
      setText("");
      await loadThread();
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return <Loading message="Loading conversation..." />;
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={80}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="arrow-back" size={22} color={COLORS.black} />
        </TouchableOpacity>

        {otherProfile?.photoUri ? (
          <Image source={{ uri: otherProfile.photoUri }} style={styles.headerAvatarImage} />
        ) : (
          <View style={styles.headerAvatar}>
            <Text style={styles.headerAvatarText}>
              {(otherProfile?.fullName || "?").trim().charAt(0).toUpperCase()}
            </Text>
          </View>
        )}

        <View style={styles.headerText}>
          <View style={styles.headerNameRow}>
            <Text style={styles.headerName} numberOfLines={1}>
              {otherProfile?.fullName || "Chat"}
            </Text>
            {otherProfile?.role && (
              <View style={styles.headerRoleBadge}>
                <Text style={styles.headerRoleBadgeText}>
                  {otherProfile.role === "landlord" ? "Landlord" : "Tenant"}
                </Text>
              </View>
            )}
          </View>
          <Text style={styles.headerSubtitle} numberOfLines={1}>
            {apartment?.title || "Apartment"}
          </Text>
        </View>
      </View>

      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messagesList}
        onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
        renderItem={({ item }) => {
          const isMine = item.senderId === user.uid;
          return (
            <View
              style={[
                styles.bubble,
                isMine ? styles.bubbleMine : styles.bubbleTheirs,
              ]}
            >
              <Text style={isMine ? styles.bubbleTextMine : styles.bubbleTextTheirs}>
                {item.text}
              </Text>
            </View>
          );
        }}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            No messages yet — say hello 👋
          </Text>
        }
      />

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={text}
          onChangeText={setText}
          placeholder="Type a message..."
          placeholderTextColor={COLORS.gray}
          multiline
        />
        <TouchableOpacity
          style={styles.sendButton}
          onPress={handleSend}
          disabled={sending || !text.trim()}
        >
          <Ionicons name="send" size={18} color={COLORS.white} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: COLORS.white },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: SPACING.md,
  },
  headerAvatarImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.lightGray,
    marginLeft: SPACING.md,
  },
  headerAvatarText: {
    fontSize: FONT_SIZES.md,
    fontWeight: "800",
    color: COLORS.white,
  },
  headerText: {
    marginLeft: SPACING.sm,
    flex: 1,
  },
  headerNameRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerName: {
    fontSize: FONT_SIZES.lg,
    fontWeight: "700",
    color: COLORS.black,
    marginRight: SPACING.xs,
    flexShrink: 1,
  },
  headerRoleBadge: {
    backgroundColor: "#EFF6FF",
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: RADIUS.full,
  },
  headerRoleBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: COLORS.primary,
  },
  headerSubtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray,
  },
  messagesList: {
    padding: SPACING.lg,
    flexGrow: 1,
  },
  emptyText: {
    textAlign: "center",
    color: COLORS.gray,
    marginTop: SPACING.xl,
  },
  bubble: {
    maxWidth: "78%",
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.lg,
    marginBottom: SPACING.sm,
  },
  bubbleMine: {
    alignSelf: "flex-end",
    backgroundColor: COLORS.primary,
    borderBottomRightRadius: 4,
  },
  bubbleTheirs: {
    alignSelf: "flex-start",
    backgroundColor: COLORS.lightGray,
    borderBottomLeftRadius: 4,
  },
  bubbleTextMine: {
    color: COLORS.white,
    fontSize: FONT_SIZES.md,
  },
  bubbleTextTheirs: {
    color: COLORS.black,
    fontSize: FONT_SIZES.md,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    padding: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.lg,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    maxHeight: 100,
    fontSize: FONT_SIZES.md,
    color: COLORS.black,
    marginRight: SPACING.sm,
  },
  sendButton: {
    width: 42,
    height: 42,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
  },
});
