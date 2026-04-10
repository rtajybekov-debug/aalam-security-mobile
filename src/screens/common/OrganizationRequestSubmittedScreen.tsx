import React from "react";
import { SafeAreaView, StyleSheet, Text, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { CommonStackParamList, RootStackParamList } from "../../navigation/types";
import { ActionButton } from "../../components/ui/ActionButton";
import { useAppTheme } from "../../theme";
import { spacing } from "../../theme";
import { ru } from "../../locale/ru";

type Props = NativeStackScreenProps<CommonStackParamList, "OrganizationRequestSubmitted">;

export const OrganizationRequestSubmittedScreen = ({ navigation }: Props) => {
  const { tokens } = useAppTheme();

  const onBackHome = () => {
    const rootNav = navigation.getParent<import("@react-navigation/native-stack").NativeStackNavigationProp<RootStackParamList>>();
    rootNav?.navigate("User");
  };

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: tokens.colors.background }]}>
      <View style={styles.content}>
        <View style={styles.successIconWrap}>
          <Text style={styles.successIcon}>✓</Text>
        </View>
        <Text style={[styles.title, { color: tokens.colors.onSurface }]}>{ru.requestSubmitted.title}</Text>
        <Text style={[styles.message, { color: tokens.colors.onSurfaceMuted }]}>{ru.requestSubmitted.body}</Text>
        <ActionButton label={ru.requestSubmitted.backHome} onPress={onBackHome} />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 14,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  successIconWrap: {
    width: 74,
    height: 74,
    borderRadius: 37,
    borderWidth: 1,
    borderColor: "#166534",
    backgroundColor: "#052E16",
    justifyContent: "center",
    alignItems: "center",
  },
  successIcon: {
    color: "#86EFAC",
    fontSize: 30,
    fontWeight: "700",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    letterSpacing: -0.3,
  },
  message: {
    fontSize: 14,
    fontWeight: "500",
    textAlign: "center",
    lineHeight: 21,
  },
});
