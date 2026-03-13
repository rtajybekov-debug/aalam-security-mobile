import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, View } from "react-native";
import { useAppTheme } from "../../theme";

export const SkeletonCard = () => {
  const { tokens } = useAppTheme();
  const shimmer = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, { toValue: 1, duration: 900, useNativeDriver: true }),
        Animated.timing(shimmer, { toValue: 0, duration: 900, useNativeDriver: true }),
      ]),
    ).start();
  }, [shimmer]);

  const shimmerStyle = {
    opacity: shimmer.interpolate({ inputRange: [0, 1], outputRange: [0.5, 1] }),
  };

  return (
    <View style={[styles.card, { backgroundColor: tokens.colors.surface, borderColor: tokens.colors.border }]}>
      <Animated.View style={shimmerStyle}>
        <View style={[styles.pill, { backgroundColor: tokens.colors.surfaceVariant }]} />
        <View style={[styles.lineLong, { backgroundColor: tokens.colors.surfaceVariant }]} />
        <View style={[styles.lineShort, { backgroundColor: tokens.colors.surfaceVariant }]} />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    height: 108,
    width: "100%",
    padding: 14,
    borderWidth: 1,
    gap: 10,
  },
  pill: { width: 84, height: 20, borderRadius: 999 },
  lineLong: { width: "80%", height: 12, borderRadius: 6, marginTop: 2 },
  lineShort: { width: "50%", height: 12, borderRadius: 6 },
});
