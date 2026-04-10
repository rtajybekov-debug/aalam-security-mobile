import React from "react";
import { ScrollView, StyleSheet, Text } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { CommonStackParamList } from "../../navigation/types";
import { useAppTheme } from "../../theme";
import { ru } from "../../locale/ru";
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
        <Text style={[styles.body, { color: tokens.colors.onSurfaceMuted }]}>{ru.legal.termsStub}</Text>
      </AppCard>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { padding: 24, paddingBottom: 48 },
  legalCard: { borderRadius: 16 },
  body: { fontSize: 15, lineHeight: 22 },
});
