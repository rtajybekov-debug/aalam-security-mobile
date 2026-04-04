import React from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { UserStackParamList } from "../../navigation/types";
import { useAuthStore } from "../../stores/authStore";
import { AppInput } from "../../components/ui/AppInput";
import { ActionButton } from "../../components/ui/ActionButton";
import { toastBus } from "../../ui/feedback/toastBus";
import { spacing } from "../../theme";
import { useAppTheme } from "../../theme";

type Props = NativeStackScreenProps<UserStackParamList, "UserEditDetails">;

export const UserEditDetailsScreen = ({ navigation }: Props) => {
  const { tokens } = useAppTheme();
  const user = useAuthStore((state) => state.user);

  const [name, setName] = React.useState(() => {
    const email = user?.email ?? "";
    return email.includes("@") ? email.split("@")[0] : "";
  });
  const [email, setEmail] = React.useState(user?.email ?? "");
  const [phone, setPhone] = React.useState("");
  const [isSaving, setIsSaving] = React.useState(false);

  const onSave = async () => {
    setIsSaving(true);
    try {
      // Placeholder action until profile update endpoint is wired.
      await new Promise((resolve) => setTimeout(resolve, 300));
      toastBus.show({ message: "Profile details updated.", severity: "success" });
      navigation.goBack();
    } catch {
      toastBus.show({ message: "Failed to save profile details.", severity: "error" });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: tokens.colors.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboard}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.content}
        >
          <Text style={[styles.title, { color: tokens.colors.onSurface }]}>Edit details</Text>

          <AppInput
            label="Name"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
            autoCorrect={false}
            editable={!isSaving}
          />
          <AppInput
            label="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            editable={!isSaving}
          />
          <AppInput
            label="Phone"
            value={phone}
            onChangeText={(v) => setPhone(v)}
            keyboardType="phone-pad"
            autoCapitalize="none"
            autoCorrect={false}
            editable={!isSaving}
          />

          <ActionButton
            label="Save changes"
            onPress={() => void onSave()}
            loading={isSaving}
            disabled={isSaving}
            accessibilityLabel="Save profile details"
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1 },
  keyboard: { flex: 1 },
  content: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xl,
    gap: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    letterSpacing: -0.3,
  },
});
