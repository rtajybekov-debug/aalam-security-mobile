import React from "react";
import { StyleSheet, View } from "react-native";
import { ru } from "../../locale/ru";
import { StatusStateCard } from "./StatusStateCard";

interface Props {
  title?: string;
  message?: string;
  onRetry?: () => void;
  retryLabel?: string;
}

export const ErrorState = ({
  title = ru.errors.networkTitle,
  message = ru.errors.networkMessage,
  onRetry,
  retryLabel = ru.errors.retry,
}: Props) => {
  return (
    <View style={styles.container}>
      <StatusStateCard
        badge={title}
        badgeColor="#93C5FD"
        message={message}
        actionLabel={onRetry ? retryLabel : undefined}
        onAction={onRetry}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, alignItems: "center", justifyContent: "center" },
});
