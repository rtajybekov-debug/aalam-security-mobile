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

const schema = z.object({
  email: z.string().email("Enter a valid email"),
});

type FormValues = z.infer<typeof schema>;
type Props = NativeStackScreenProps<AuthStackParamList, "ForgotPassword">;

export const ForgotPasswordScreen = ({ navigation }: Props) => {
  const { tokens } = useAppTheme();
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "" },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      await authApi.forgotPassword(values.email);
      toastBus.show({
        message: "If an account exists, you will receive reset instructions.",
        severity: "success",
      });
      navigation.navigate("Login");
    } catch {
      toastBus.show({ message: "Request failed. Try again.", severity: "error" });
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
          <Text style={[styles.title, { color: tokens.colors.onSurface }]}>Reset password</Text>
          <Text style={[styles.subtitle, { color: tokens.colors.onSurfaceMuted }]}>
            Enter your email and we’ll send you a link to reset your password.
          </Text>

          <View style={styles.form}>
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, value } }) => (
                <AppInput
                  label="Email"
                  autoCapitalize="none"
                  keyboardType="email-address"
                  placeholder="you@example.com"
                  value={value}
                  onChangeText={onChange}
                  error={errors.email?.message}
                  autoComplete="email"
                />
              )}
            />
            <ActionButton
              label={isSubmitting ? "Sending..." : "Send reset link"}
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
