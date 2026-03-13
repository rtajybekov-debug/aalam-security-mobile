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
import { useAuthStore } from "../../stores/authStore";
import { AppInput } from "../../components/ui/AppInput";
import { ActionButton } from "../../components/ui/ActionButton";
import { toastBus } from "../../ui/feedback/toastBus";
import { useAppTheme } from "../../theme";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type FormValues = z.infer<typeof schema>;
type Props = NativeStackScreenProps<AuthStackParamList, "Register">;

export const RegisterScreen = ({ navigation }: Props) => {
  const { tokens } = useAppTheme();
  const register = useAuthStore((state) => state.register);
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      await register(values.email, values.password);
      toastBus.show({ message: "Account created successfully.", severity: "success" });
    } catch {
      toastBus.show({ message: "Registration failed. Please try again.", severity: "error" });
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
        {/* Logo */}
        <View style={styles.logoWrap}>
          <View style={[styles.logoBadge, { backgroundColor: tokens.colors.primary }]}>
            <Text style={styles.logoText}>SOS</Text>
          </View>
          <Text style={[styles.appName, { color: tokens.colors.onSurface }]}>Create account</Text>
          <Text style={[styles.appTagline, { color: tokens.colors.onSurfaceMuted }]}>
            Join the emergency response platform
          </Text>
        </View>

        {/* Card */}
        <View
          style={[
            styles.card,
            {
              backgroundColor: tokens.colors.surface,
              borderColor: tokens.colors.border,
              shadowColor: tokens.colors.onSurface,
            },
          ]}
        >
          <Text style={[styles.cardTitle, { color: tokens.colors.onSurface }]}>Sign up</Text>
          <Text style={[styles.cardSubtitle, { color: tokens.colors.onSurfaceMuted }]}>
            Enter your details to get started.
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
                  returnKeyType="next"
                  placeholder="you@example.com"
                  value={value}
                  onChangeText={onChange}
                  error={errors.email?.message}
                  autoComplete="email"
                />
              )}
            />

            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, value } }) => (
                <AppInput
                  label="Password"
                  secureTextEntry
                  returnKeyType="done"
                  placeholder="Minimum 6 characters"
                  value={value}
                  onChangeText={onChange}
                  error={errors.password?.message}
                  autoComplete="new-password"
                  onSubmitEditing={handleSubmit(onSubmit)}
                />
              )}
            />

            <Text style={[styles.agreeText, { color: tokens.colors.onSurfaceMuted }]}>
              By creating an account you agree to our{" "}
              <Text
                style={[styles.agreeLink, { color: tokens.colors.primary }]}
                onPress={() => navigation.navigate("Terms")}
              >
                Terms
              </Text>{" "}
              and{" "}
              <Text
                style={[styles.agreeLink, { color: tokens.colors.primary }]}
                onPress={() => navigation.navigate("Privacy")}
              >
                Privacy Policy
              </Text>
              .
            </Text>

            <ActionButton
              label={isSubmitting ? "Creating account..." : "Create account"}
              disabled={isSubmitting}
              loading={isSubmitting}
              onPress={handleSubmit(onSubmit)}
              size="large"
            />
          </View>
        </View>

        {/* Login link */}
        <Pressable
          onPress={() => navigation.navigate("Login")}
          style={styles.linkWrap}
          accessibilityRole="link"
          accessibilityLabel="Go to login"
        >
          <Text style={[styles.linkText, { color: tokens.colors.onSurfaceMuted }]}>
            Already have an account?{" "}
            <Text style={[styles.linkAccent, { color: tokens.colors.primary }]}>Sign in</Text>
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
    justifyContent: "center",
    padding: 24,
    gap: 24,
  },
  logoWrap: {
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },
  logoBadge: {
    width: 64,
    height: 64,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 4,
  },
  logoText: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 22,
    letterSpacing: 1,
  },
  appName: {
    fontSize: 26,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  appTagline: {
    fontSize: 13,
    fontWeight: "500",
  },
  card: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 24,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: -0.3,
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 20,
  },
  form: {
    gap: 14,
  },
  agreeText: { fontSize: 12, lineHeight: 18 },
  agreeLink: { fontWeight: "600" },
  linkWrap: {
    alignItems: "center",
    paddingVertical: 8,
  },
  linkText: {
    fontSize: 14,
  },
  linkAccent: {
    fontWeight: "700",
  },
});
