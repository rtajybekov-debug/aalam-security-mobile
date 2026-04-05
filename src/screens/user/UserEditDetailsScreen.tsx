import React from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { UserStackParamList } from "../../navigation/types";
import { usersApi } from "../../api/modules/users";
import { useAuthStore } from "../../stores/authStore";
import { AppInput } from "../../components/ui/AppInput";
import { ActionButton } from "../../components/ui/ActionButton";
import { toastBus } from "../../ui/feedback/toastBus";
import { spacing } from "../../theme";
import { useAppTheme } from "../../theme";
import {
  KYRGYZ_PHONE_HINT,
  kyrgyzPhoneOptionalSchema,
  sanitizeKyrgyzPhoneInput,
} from "../../lib/kyrgyzPhone";
import type { UpdateUserMePayload } from "../../types/user";

const schema = z.object({
  displayName: z.string().trim().min(1, "Name is required"),
  phone: kyrgyzPhoneOptionalSchema,
});

type FormValues = z.infer<typeof schema>;
type Props = NativeStackScreenProps<UserStackParamList, "UserEditDetails">;

export const UserEditDetailsScreen = ({ navigation }: Props) => {
  const { tokens } = useAppTheme();
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { displayName: "", phone: "" },
  });

  React.useEffect(() => {
    if (!user) return;
    const fallbackName =
      user.displayName?.trim() ||
      (user.email.includes("@") ? user.email.split("@")[0] : user.email);
    reset({
      displayName: fallbackName,
      phone: user.phone ? sanitizeKyrgyzPhoneInput(user.phone) : "",
    });
  }, [user, reset]);

  const onSubmit = async (values: FormValues) => {
    try {
      const payload: UpdateUserMePayload = {
        displayName: values.displayName.trim(),
        phone: values.phone.trim() === "" ? "" : values.phone.trim(),
      };
      const updated = await usersApi.patchMe(payload);
      setUser(updated);
      toastBus.show({ message: "Profile details updated.", severity: "success" });
      navigation.goBack();
    } catch {
      toastBus.show({ message: "Failed to save profile details.", severity: "error" });
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

          <Controller
            control={control}
            name="displayName"
            render={({ field: { onChange, value } }) => (
              <AppInput
                label="Name"
                value={value}
                onChangeText={onChange}
                autoCapitalize="words"
                autoCorrect={false}
                editable={!isSubmitting}
                error={errors.displayName?.message}
              />
            )}
          />
          <AppInput
            label="Email (read-only)"
            value={user?.email ?? ""}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            editable={false}
          />
          <Controller
            control={control}
            name="phone"
            render={({ field: { onChange, value } }) => (
              <AppInput
                label="Phone (optional)"
                value={value}
                onChangeText={(v) => onChange(sanitizeKyrgyzPhoneInput(v))}
                keyboardType="phone-pad"
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isSubmitting}
                error={errors.phone?.message}
                hint={KYRGYZ_PHONE_HINT}
              />
            )}
          />

          <ActionButton
            label="Save changes"
            onPress={() => void handleSubmit(onSubmit)()}
            loading={isSubmitting}
            disabled={isSubmitting}
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
