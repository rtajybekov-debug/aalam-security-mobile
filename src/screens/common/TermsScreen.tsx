import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { CommonStackParamList } from "../../navigation/types";
import { useAppTheme } from "../../theme";

type Props = NativeStackScreenProps<CommonStackParamList, "Terms">;

export const TermsScreen = ({ navigation }: Props) => {
  const { tokens } = useAppTheme();

  return (
    <ScrollView
      style={[styles.root, { backgroundColor: tokens.colors.background }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Text style={[styles.title, { color: tokens.colors.onSurface }]}>Terms of Service</Text>
      <Text style={[styles.updated, { color: tokens.colors.onSurfaceMuted }]}>
        Last updated: March 2025
      </Text>

      <View style={styles.section}>
        <Text style={[styles.heading, { color: tokens.colors.onSurface }]}>1. Acceptance</Text>
        <Text style={[styles.body, { color: tokens.colors.onSurfaceMuted }]}>
          By using Alarm SOS, you agree to these terms. The service provides emergency alert and
          response coordination for individuals and businesses.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={[styles.heading, { color: tokens.colors.onSurface }]}>2. Service</Text>
        <Text style={[styles.body, { color: tokens.colors.onSurfaceMuted }]}>
          Alarm SOS allows users to send SOS alerts with location sharing. Operators receive
          notifications and can coordinate response. We do not guarantee response time or outcome.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={[styles.heading, { color: tokens.colors.onSurface }]}>3. Responsibility</Text>
        <Text style={[styles.body, { color: tokens.colors.onSurfaceMuted }]}>
          In life-threatening emergencies, always call local emergency services (e.g. 112, 911).
          Alarm SOS is a supplement, not a replacement, for official emergency response.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={[styles.heading, { color: tokens.colors.onSurface }]}>4. Contact</Text>
        <Text style={[styles.body, { color: tokens.colors.onSurfaceMuted }]}>
          For questions about these terms, contact support@alarm-sos.com.
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { padding: 24, paddingBottom: 48 },
  title: { fontSize: 26, fontWeight: "800", marginBottom: 4 },
  updated: { fontSize: 13, marginBottom: 24 },
  section: { marginBottom: 24 },
  heading: { fontSize: 17, fontWeight: "700", marginBottom: 8 },
  body: { fontSize: 15, lineHeight: 22 },
});
