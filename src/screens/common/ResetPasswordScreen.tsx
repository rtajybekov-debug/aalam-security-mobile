import React from "react";
import {
  KeyboardAvoidingView,
  Platform,
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

const schema = z
  .object({
    newPassword: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Passwords do not match",
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
      toastBus.show({ message: "Invalid reset link.", severity: "error" });
      return;
    }
    try {
      await authApi.resetPassword(token, values.newPassword);
      toastBus.show({ message: "Password reset. You can sign in now.", severity: "success" });
      navigation.navigate("Login");
    } catch {
      toastBus.show({ message: "Reset failed. Link may have expired.", severity: "error" });
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
        <View
          style={[
            styles.card,
            {
              backgroundColor: tokens.colors.surface,
              borderColor: tokens.colors.border,
            },
          ]}
        >
          <Text style={[styles.title, { color: tokens.colors.onSurface }]}>Set new password</Text>
          <Text style={[styles.subtitle, { color: tokens.colors.onSurfaceMuted }]}>
            Enter your new password below.
          </Text>

          <View style={styles.form}>
            <Controller
              control={control}
              name="newPassword"
              render={({ field: { onChange, value } }) => (
                <AppInput
                  label="New password"
                  secureTextEntry
                  placeholder="••••••••"
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
                  label="Confirm password"
                  secureTextEntry
                  placeholder="••••••••"
                  value={value}
                  onChangeText={onChange}
                  error={errors.confirmPassword?.message}
                  autoComplete="new-password"
                />
              )}
            />
            <ActionButton
              label={isSubmitting ? "Resetting..." : "Reset password"}
              disabled={isSubmitting}
              loading={isSubmitting}
              onPress={handleSubmit(onSubmit)}
              size="large"
            />
          </View>
        </View>

        <ActionButton
          variant="ghost"
          label="Back to login"
          onPress={() => navigation.navigate("Login")}
          style={styles.back}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: {
    flexGrow: 1,
    padding: 24,
    gap: 16,
    marginTop: 80,
  },
  card: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 24,
  },
  title: { fontSize: 22, fontWeight: "800", marginBottom: 8 },
  subtitle: { fontSize: 14, lineHeight: 20, marginBottom: 24 },
  form: { gap: 14 },
  back: { alignSelf: "center", marginTop: 8 },
});
