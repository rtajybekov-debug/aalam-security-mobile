import React from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { AuthStackParamList } from "../../navigation/types";
import { authApi } from "../../api/modules/auth";
import { AppInput } from "../../components/ui/AppInput";
import { ActionButton } from "../../components/ui/ActionButton";
import { toastBus } from "../../ui/feedback/toastBus";
import { useAppTheme } from "../../theme";
import { ru } from "../../locale/ru";

const schema = z
  .object({
    newPassword: z
      .string()
      .min(12, ru.validation.passwordMin)
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/, ru.validation.passwordComplexity),
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: ru.validation.passwordsMismatch,
    path: ["confirmPassword"],
  });

type FormValues = z.infer<typeof schema>;
type Props = NativeStackScreenProps<AuthStackParamList, "ResetPassword">;

export const ResetPasswordScreen = ({ route, navigation }: Props) => {
  const { tokens } = useAppTheme();
  const token = route.params?.token ?? "";
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { newPassword: "", confirmPassword: "" },
  });

  const onSubmit = async (values: FormValues) => {
    if (!token) {
      toastBus.show({ message: ru.auth.invalidResetLink, severity: "error" });
      return;
    }
    try {
      await authApi.resetPassword(token, values.newPassword);
      toastBus.show({ message: ru.auth.passwordResetOk, severity: "success" });
      navigation.navigate("Login");
    } catch {
      toastBus.show({ message: ru.auth.resetFailed, severity: "error" });
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.root, { backgroundColor: tokens.colors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={[styles.title, { color: tokens.colors.onSurface }]}>{ru.auth.changePasswordTitle}</Text>
          <Text style={[styles.subtitle, { color: tokens.colors.onSurfaceMuted }]}>
            {ru.auth.changePasswordSubtitle}
          </Text>
        </View>

        <View style={styles.form}>
          <Controller
            control={control}
            name="newPassword"
            render={({ field: { onChange, value } }) => (
              <AppInput
                label={ru.auth.newPassword}
                secureTextEntry
                returnKeyType="next"
                value={value}
                onChangeText={onChange}
                error={errors.newPassword?.message}
                autoComplete="new-password"
              />
            )}
          />
          <Controller
            control={control}
            name="confirmPassword"
            render={({ field: { onChange, value } }) => (
              <AppInput
                label={ru.auth.confirmPasswordLabel}
                secureTextEntry
                returnKeyType="done"
                value={value}
                onChangeText={onChange}
                error={errors.confirmPassword?.message}
                autoComplete="new-password"
                onSubmitEditing={handleSubmit(onSubmit)}
              />
            )}
          />

          <ActionButton
            label={isSubmitting ? ru.auth.resetting : ru.auth.resetPassword}
            disabled={isSubmitting}
            loading={isSubmitting}
            onPress={handleSubmit(onSubmit)}
            size="large"
          />
        </View>

        <Pressable
          onPress={() => navigation.navigate("Login")}
          style={styles.backWrap}
          accessibilityRole="link"
        >
          <Text style={[styles.backText, { color: tokens.colors.onSurfaceMuted }]}>
            {ru.auth.backToLogin}
          </Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 80,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 28,
  },
  title: {
    fontSize: 34,
    fontWeight: "800",
    letterSpacing: -0.8,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
  },
  form: {
    gap: 16,
  },
  backWrap: {
    alignItems: "center",
    paddingVertical: 20,
  },
  backText: {
    fontSize: 14,
    fontWeight: "500",
  },
});
