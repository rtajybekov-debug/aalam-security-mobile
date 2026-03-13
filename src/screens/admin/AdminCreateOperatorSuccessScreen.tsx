import React from "react";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { SafeAreaView, StyleSheet, Text, View } from "react-native";
import { AdminStackParamList } from "../../navigation/types";
import { ActionButton } from "../../components/ui/ActionButton";
import { useAppTheme } from "../../theme";

type Props = NativeStackScreenProps<AdminStackParamList, "AdminCreateOperatorSuccess">;

export const AdminCreateOperatorSuccessScreen = ({ navigation }: Props) => {
  const { tokens } = useAppTheme();
  return (
    <SafeAreaView style={[styles.root, { backgroundColor: tokens.colors.background }]}>
      <View style={styles.content}>
        <View style={[styles.iconWrap, { backgroundColor: "#DCFCE7" }]}>
          <Text style={styles.icon}>✓</Text>
        </View>
        <Text style={[styles.title, { color: tokens.colors.onSurface }]}>Operator Created</Text>
        <Text style={[styles.subtitle, { color: tokens.colors.onSurfaceMuted }]}>
          The new operator account is ready. They can sign in and access the dispatch dashboard.
        </Text>
        <ActionButton
          label="Back to Admin Panel"
          onPress={() => navigation.navigate("AdminTabs")}
        />
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
    padding: 32,
    gap: 14,
  },
  iconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  icon: { fontSize: 40, color: "#166534" },
  title: { fontSize: 24, fontWeight: "800", textAlign: "center", letterSpacing: -0.3 },
  subtitle: { fontSize: 14, textAlign: "center", lineHeight: 22, maxWidth: 300 },
});
