import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { CommonStackParamList } from "../../navigation/types";
import { useAppTheme } from "../../theme";

type Props = NativeStackScreenProps<CommonStackParamList, "Privacy">;

export const PrivacyScreen = ({ navigation }: Props) => {
  const { tokens } = useAppTheme();

  return (
    <ScrollView
      style={[styles.root, { backgroundColor: tokens.colors.background }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Text style={[styles.title, { color: tokens.colors.onSurface }]}>Privacy Policy</Text>
      <Text style={[styles.updated, { color: tokens.colors.onSurfaceMuted }]}>
        Last updated: March 2025
      </Text>

      <View style={styles.section}>
        <Text style={[styles.heading, { color: tokens.colors.onSurface }]}>1. Data we collect</Text>
        <Text style={[styles.body, { color: tokens.colors.onSurfaceMuted }]}>
          We collect your email, account credentials, location data when you activate an SOS alert,
          and emergency contact information you provide. Location is shared only during active
          emergency sessions with assigned operators.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={[styles.heading, { color: tokens.colors.onSurface }]}>2. How we use it</Text>
        <Text style={[styles.body, { color: tokens.colors.onSurfaceMuted }]}>
          Data is used to provide the emergency alert service, notify operators, display your
          location during incidents, and improve our service. We do not sell your data to third
          parties.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={[styles.heading, { color: tokens.colors.onSurface }]}>3. Retention</Text>
        <Text style={[styles.body, { color: tokens.colors.onSurfaceMuted }]}>
          Session and location data is retained for incident records and may be required for legal
          or safety purposes. You can request deletion of your account and associated data.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={[styles.heading, { color: tokens.colors.onSurface }]}>4. Contact</Text>
        <Text style={[styles.body, { color: tokens.colors.onSurfaceMuted }]}>
          For privacy inquiries: privacy@alarm-sos.com.
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
