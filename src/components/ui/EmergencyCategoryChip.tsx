import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import {
  AlertTriangle,
  Car,
  CloudLightning,
  Flame,
  Hospital,
  LifeBuoy,
} from "lucide-react-native";
import { useAppTheme } from "../../theme";
import { radius, spacing } from "../../theme";

export type EmergencyCategory =
  | "medical"
  | "fire"
  | "natural"
  | "accident"
  | "violence"
  | "rescue";

const CATEGORY_LABELS: Record<EmergencyCategory, string> = {
  medical: "Medical",
  fire: "Fire",
  natural: "Natural disaster",
  accident: "Accident",
  violence: "Violence",
  rescue: "Rescue",
};

const CATEGORY_ICON: Record<
  EmergencyCategory,
  React.ComponentType<{ size?: number; color?: string; strokeWidth?: number }>
> = {
  medical: Hospital,
  fire: Flame,
  natural: CloudLightning,
  accident: Car,
  violence: AlertTriangle,
  rescue: LifeBuoy,
};

interface Props {
  selected?: EmergencyCategory | null;
  onSelect?: (id: EmergencyCategory) => void;
}

export const EmergencyCategoryChip = ({ selected, onSelect }: Props) => {
  const { tokens } = useAppTheme();

  const categories = Object.keys(CATEGORY_LABELS) as EmergencyCategory[];

  return (
    <View style={styles.wrap}>
      <Text style={[styles.title, { color: tokens.colors.onSurface }]}>
        What&apos;s your emergency?
      </Text>
      <View style={styles.grid}>
        {categories.map((id) => {
          const isSelected = selected === id;
          const color = tokens.colors.category[id];
          const Icon = CATEGORY_ICON[id];
          return (
            <Pressable
              key={id}
              onPress={() => onSelect?.(id)}
              style={({ pressed }) => [
                styles.chip,
                {
                  backgroundColor: tokens.colors.surface,
                  borderColor: isSelected ? color : tokens.colors.border,
                  borderWidth: isSelected ? 2 : 1,
                  opacity: pressed ? 0.85 : 1,
                },
              ]}
              accessibilityRole="button"
              accessibilityLabel={`${CATEGORY_LABELS[id]} emergency`}
            >
              <View style={[styles.iconCircle, { backgroundColor: color }]}>
                <Icon size={16} color="#FFFFFF" strokeWidth={2} />
              </View>
              <Text
                style={[styles.label, { color: tokens.colors.onSurface }]}
                numberOfLines={1}
              >
                {CATEGORY_LABELS[id]}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: { gap: spacing.sm },
  title: { fontSize: 16, fontWeight: "700" as const },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.round,
    gap: spacing.sm,
    minHeight: 44,
  },
  iconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  label: { fontSize: 13, fontWeight: "600", flex: 1 },
});
