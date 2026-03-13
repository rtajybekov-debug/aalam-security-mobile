import React from "react";
import { StyleSheet, View } from "react-native";
import { SkeletonCard } from "./SkeletonCard";

interface Props {
  count?: number;
}

export const SkeletonList = ({ count = 5 }: Props) => (
  <View style={styles.container}>
    {Array.from({ length: count }).map((_, index) => (
      <SkeletonCard key={index} />
    ))}
  </View>
);

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 10,
  },
});
