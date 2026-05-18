import React from "react";
import { ActivityIndicator, Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { MapPin } from "lucide-react-native";
import { useBackgroundLocationPermission } from "../../hooks/useBackgroundLocationPermission";
import { ru } from "../../locale/ru";

/**
 * Global, iOS-only rationale modal that surfaces after foreground location is
 * granted and a session has gone active. Coordinates lifecycle with
 * useBackgroundLocationPermission — the hook decides if/when the modal shows,
 * the component just renders it and proxies button presses back to the hook.
 *
 * If the OS has already denied background (the upgrade dialog won't reappear),
 * the secondary CTA pivots to "Open Settings" so the user has an out.
 */
export const BackgroundLocationPrompt = () => {
  const { isVisible, isRequesting, status, request, dismiss, openSettings } =
    useBackgroundLocationPermission();

  if (!isVisible) {
    return null;
  }

  const secondaryLabel = status === "denied" ? ru.backgroundLocation.openSettings : ru.backgroundLocation.later;
  const onSecondary = status === "denied" ? openSettings : dismiss;

  return (
    <Modal visible animationType="fade" transparent onRequestClose={dismiss}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <View style={styles.iconWrap}>
            <MapPin size={28} color="#C4F82A" strokeWidth={2.2} />
          </View>
          <Text style={styles.title}>{ru.backgroundLocation.title}</Text>
          <Text style={styles.body}>{ru.backgroundLocation.body}</Text>
          <Pressable
            style={({ pressed }) => [
              styles.primaryBtn,
              pressed && { opacity: 0.85 },
              isRequesting && { opacity: 0.6 },
            ]}
            disabled={isRequesting}
            onPress={() => void request()}
            accessibilityRole="button"
            accessibilityLabel={ru.backgroundLocation.allow}
          >
            {isRequesting ? (
              <ActivityIndicator color="#0A0A0A" />
            ) : (
              <Text style={styles.primaryText}>{ru.backgroundLocation.allow}</Text>
            )}
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.secondaryBtn, pressed && { opacity: 0.7 }]}
            onPress={onSecondary}
            accessibilityRole="button"
            accessibilityLabel={secondaryLabel}
          >
            <Text style={styles.secondaryText}>{secondaryLabel}</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  card: {
    width: "100%",
    maxWidth: 360,
    backgroundColor: "#1C1E2A",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#2A2E3A",
    padding: 24,
    alignItems: "center",
    gap: 12,
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#1A2E05",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
    textAlign: "center",
  },
  body: {
    fontSize: 14,
    lineHeight: 20,
    color: "#A1A1AA",
    textAlign: "center",
  },
  primaryBtn: {
    width: "100%",
    marginTop: 12,
    backgroundColor: "#C4F82A",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    minHeight: 48,
    justifyContent: "center",
  },
  primaryText: {
    color: "#0A0A0A",
    fontWeight: "700",
    fontSize: 15,
  },
  secondaryBtn: {
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  secondaryText: {
    color: "#A1A1AA",
    fontSize: 14,
    fontWeight: "500",
  },
});
