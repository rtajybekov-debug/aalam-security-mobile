import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { UserStackParamList } from "../../navigation/types";
import { useAppTheme } from "../../theme";
import { spacing } from "../../theme";
import { AppInput } from "../../components/ui/AppInput";
import { ActionButton } from "../../components/ui/ActionButton";
import { useUserSessionStore } from "../../stores/userSessionStore";
import { toastBus } from "../../ui/feedback/toastBus";
import { ru } from "../../locale/ru";

type Props = NativeStackScreenProps<UserStackParamList, "UserSetupPin">;

export const SetupPinScreen = ({ navigation }: Props) => {
  const { tokens } = useAppTheme();
  const setPin = useUserSessionStore((s) => s.setPin);
  const [step, setStep] = useState<"enter" | "confirm">("enter");
  const [pin, setPinValue] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();

  const handleContinue = () => {
    if (pin.length !== 4) {
      setError(ru.setupPin.pinDigits);
      return;
    }
    setError(undefined);
    setStep("confirm");
    setConfirmPin("");
  };

  const handleSave = async () => {
    if (confirmPin.length !== 4) {
      setError(ru.setupPin.pinDigits);
      return;
    }
    if (pin !== confirmPin) {
      setError(ru.setupPin.pinMismatch);
      return;
    }
    setError(undefined);
    setLoading(true);
    try {
      await setPin(pin);
      toastBus.show({ message: ru.setupPin.saved, severity: "success" });
      navigation.goBack();
    } catch {
      toastBus.show({ message: ru.setupPin.failed, severity: "error" });
      setError(ru.setupPin.saveFail);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    setStep("enter");
    setConfirmPin("");
    setError(undefined);
  };

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: tokens.colors.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboard}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={[styles.subtitle, { color: tokens.colors.onSurfaceMuted }]}>
            {step === "enter" ? ru.setupPin.enterSub : ru.setupPin.confirmSub}
          </Text>

          {step === "enter" ? (
            <>
              <AppInput
                label={ru.setupPin.pin}
                value={pin}
                onChangeText={(t) => {
                  const digits = t.replace(/\D/g, "").slice(0, 4);
                  setPinValue(digits);
                  setError(undefined);
                }}
                placeholder="••••"
                keyboardType="number-pad"
                secureTextEntry
                maxLength={4}
                error={error}
                editable={!loading}
              />
              <ActionButton
                label={ru.setupPin.enable2fa}
                onPress={handleContinue}
                disabled={pin.length !== 4}
                accessibilityLabel={ru.setupPin.continueA11y}
              />
            </>
          ) : (
            <>
              <AppInput
                label={ru.setupPin.confirmPin}
                value={confirmPin}
                onChangeText={(t) => {
                  const digits = t.replace(/\D/g, "").slice(0, 4);
                  setConfirmPin(digits);
                  setError(undefined);
                }}
                placeholder="••••"
                keyboardType="number-pad"
                secureTextEntry
                maxLength={4}
                error={error}
                editable={!loading}
              />
              <View style={styles.row}>
                <ActionButton
                  variant="secondary"
                  label={ru.setupPin.back}
                  onPress={handleBack}
                  disabled={loading}
                  style={styles.half}
                />
                <ActionButton
                  label={ru.setupPin.enable2fa}
                  onPress={handleSave}
                  loading={loading}
                  disabled={confirmPin.length !== 4}
                  style={styles.half}
                  accessibilityLabel={ru.setupPin.saveA11y}
                />
              </View>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1 },
  keyboard: { flex: 1 },
  scrollContent: { flexGrow: 1, padding: spacing.formPadding, gap: spacing.lg },
  subtitle: { fontSize: 15, lineHeight: 22 },
  row: { flexDirection: "row", gap: spacing.md },
  half: { flex: 1 },
});
