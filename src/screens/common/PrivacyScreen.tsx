import React from "react";
import { ScrollView, StyleSheet, Text } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { CommonStackParamList } from "../../navigation/types";
import { useAppTheme } from "../../theme";
import { AppCard } from "../../components/ui/AppCard";

type Props = NativeStackScreenProps<CommonStackParamList, "Privacy">;

export const PrivacyScreen = ({}: Props) => {
  const { tokens } = useAppTheme();

  return (
    <ScrollView
      style={[styles.root, { backgroundColor: tokens.colors.background }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <AppCard style={styles.legalCard}>
        <Text style={[styles.heading, { color: tokens.colors.onSurface }]}>Privacy Policy</Text>
        <Text style={[styles.body, { color: tokens.colors.onSurfaceMuted }]}>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur congue, elit sed feugiat
          scelerisque, augue nibh volutpat ipsum, vitae tincidunt arcu orci id est.
          {"\n\n"}
          We collect account details, device metadata, and emergency session data strictly to provide
          safety services. Location is shared only when you trigger SOS or explicitly enable sharing features.
          {"\n\n"}
          Data is encrypted in transit and retained per applicable regulations.
        </Text>
      </AppCard>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { padding: 24, paddingBottom: 48 },
  legalCard: { borderRadius: 16 },
  heading: { fontSize: 34, fontWeight: "700", marginBottom: 12, letterSpacing: -0.35 },
  body: { fontSize: 15, lineHeight: 22 },
});
