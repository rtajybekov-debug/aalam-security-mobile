import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { CloudOff } from "lucide-react-native";
import { useOfflineFlush } from "../../hooks/useOfflineFlush";
import { ru } from "../../locale/ru";

export const OfflineBanner = () => {
  const { isOnline, pendingQueueLength } = useOfflineFlush();

  if (isOnline && pendingQueueLength === 0) {
    return null;
  }

  const message = isOnline
    ? ru.offline.flushing.replace("{count}", String(pendingQueueLength))
    : pendingQueueLength > 0
      ? ru.offline.offlineWithQueue.replace("{count}", String(pendingQueueLength))
      : ru.offline.offline;

  return (
    <View pointerEvents="none" style={styles.wrapper}>
      <View style={styles.banner}>
        <CloudOff size={16} color="#FDE047" strokeWidth={2} />
        <Text style={styles.text} numberOfLines={2}>
          {message}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    alignItems: "center",
    paddingTop: 56,
    zIndex: 1000,
  },
  banner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#1C1E2A",
    borderColor: "#FDE04733",
    borderWidth: 1,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 999,
    maxWidth: "90%",
  },
  text: {
    color: "#FDE047",
    fontSize: 12,
    flexShrink: 1,
  },
});
