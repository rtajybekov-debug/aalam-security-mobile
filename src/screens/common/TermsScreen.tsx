import React from "react";
import { ScrollView, StyleSheet, Text } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { CommonStackParamList } from "../../navigation/types";
import { useAppTheme } from "../../theme";
import { AppCard } from "../../components/ui/AppCard";

type Props = NativeStackScreenProps<CommonStackParamList, "Terms">;

export const TermsScreen = ({}: Props) => {
  const { tokens } = useAppTheme();

  return (
    <ScrollView
      style={[styles.root, { backgroundColor: tokens.colors.background }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <AppCard style={styles.legalCard}>
        <Text style={[styles.heading, { color: tokens.colors.onSurface }]}>Terms of Service</Text>
        <Text style={[styles.body, { color: tokens.colors.onSurfaceMuted }]}>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed non diam vitae ipsum convallis
          dapibus. Praesent pretium, lorem vitae dictum euismod, nibh velit faucibus velit, vel porta
          augue libero in est.
          {"\n\n"}
          Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae;
          Duis semper, nibh at pulvinar dictum, augue nunc dignissim velit, sed gravida nunc nisl
          non odio.
          {"\n\n"}
          By continuing to use the app, you agree to these terms and all applicable local laws.
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
