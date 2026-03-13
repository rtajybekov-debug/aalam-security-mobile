import React from "react";
import { Linking, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList, UserTabParamList } from "../../navigation/types";
import { useAppTheme } from "../../theme";
import { AppCard } from "../../components/ui/AppCard";
import { ActionButton } from "../../components/ui/ActionButton";

type TabNav = BottomTabNavigationProp<UserTabParamList>;
type RootNav = NativeStackNavigationProp<RootStackParamList>;

const EMERGENCY_NUMBER = "911";

const TIPS = [
  "Stay calm and speak clearly when calling emergency services.",
  "Provide your exact location and any landmarks if possible.",
  "Share your SOS session with operators so they can track your position.",
  "Keep your phone charged and location services enabled during an emergency.",
  "If you can't speak, use the in-app SOS button — operators will receive your location.",
];

export const UserSafetyScreen = () => {
  const { tokens } = useAppTheme();
  const tabNav = useNavigation<TabNav>();
  const rootNav = useNavigation<RootNav>();

  const callEmergency = () => {
    Linking.openURL(`tel:${EMERGENCY_NUMBER}`);
  };

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: tokens.colors.background }]}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        style={styles.scroll}
      >
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: tokens.colors.onSurface }]}>
          Safety & Tips
        </Text>
        <Text style={[styles.subtitle, { color: tokens.colors.onSurfaceMuted }]}>
          Quick actions and guidance for emergencies
        </Text>
      </View>

      {/* Quick actions */}
      <View style={[styles.section, { borderColor: tokens.colors.border }]}>
        <Text style={[styles.sectionTitle, { color: tokens.colors.onSurfaceMuted }]}>
          QUICK ACTIONS
        </Text>
        <AppCard
          onPress={callEmergency}
          style={StyleSheet.flatten([styles.actionCard, { borderColor: tokens.colors.danger + "40" }])}
        >
          <View style={styles.actionRow}>
            <View style={[styles.iconWrap, { backgroundColor: tokens.colors.danger + "20" }]}>
              <Text style={styles.icon}>📞</Text>
            </View>
            <View style={styles.actionText}>
              <Text style={[styles.actionLabel, { color: tokens.colors.onSurface }]}>
                Call Emergency
              </Text>
              <Text style={[styles.actionHint, { color: tokens.colors.onSurfaceMuted }]}>
                Dial {EMERGENCY_NUMBER} for police, fire, or ambulance
              </Text>
            </View>
          </View>
        </AppCard>
        <ActionButton
          variant="primary"
          label="Go to SOS Home"
          onPress={() => tabNav.navigate("Home")}
          accessibilityLabel="Go to Home to trigger SOS"
        />
        <ActionButton
          variant="secondary"
          label="Emergency Contacts"
          onPress={() => rootNav.navigate("User", { screen: "UserEmergencyContacts" })}
          accessibilityLabel="Manage emergency contacts"
        />
      </View>

      {/* Emergency tips */}
      <View style={[styles.section, { borderColor: tokens.colors.border }]}>
        <Text style={[styles.sectionTitle, { color: tokens.colors.onSurfaceMuted }]}>
          EMERGENCY TIPS
        </Text>
        {TIPS.map((tip, i) => (
          <View
            key={i}
            style={[
              styles.tipRow,
              { backgroundColor: tokens.colors.surface, borderColor: tokens.colors.border },
            ]}
          >
            <View style={[styles.tipBullet, { backgroundColor: tokens.colors.primary }]} />
            <Text style={[styles.tipText, { color: tokens.colors.onSurface }]}>{tip}</Text>
          </View>
        ))}
      </View>

      {/* Profile link */}
      <View style={styles.footer}>
        <Pressable
          onPress={() => rootNav.navigate("Common", { screen: "Profile" })}
          style={styles.footerLink}
          accessibilityRole="link"
          accessibilityLabel="Open profile"
        >
          <Text style={[styles.footerText, { color: tokens.colors.onSurfaceMuted }]}>
            Profile & account settings
          </Text>
          <Text style={[styles.footerArrow, { color: tokens.colors.primary }]}>→</Text>
        </Pressable>
      </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { flex: 1 },
  content: { padding: 20, paddingBottom: 40, gap: 24 },
  header: { gap: 4 },
  title: { fontSize: 26, fontWeight: "800", letterSpacing: -0.5 },
  subtitle: { fontSize: 14, lineHeight: 20 },
  section: {
    borderTopWidth: 1,
    paddingTop: 16,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.8,
  },
  actionCard: {
    borderWidth: 1,
    borderLeftWidth: 4,
  },
  actionRow: { flexDirection: "row", alignItems: "center", gap: 14 },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  icon: { fontSize: 24 },
  actionText: { flex: 1, gap: 2 },
  actionLabel: { fontSize: 16, fontWeight: "700" },
  actionHint: { fontSize: 12, lineHeight: 16 },
  tipRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  tipBullet: { width: 6, height: 6, borderRadius: 3, marginTop: 6 },
  tipText: { flex: 1, fontSize: 14, lineHeight: 20 },
  footer: { paddingTop: 8 },
  footerLink: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
  },
  footerText: { fontSize: 14 },
  footerArrow: { fontSize: 16, fontWeight: "700" },
});
