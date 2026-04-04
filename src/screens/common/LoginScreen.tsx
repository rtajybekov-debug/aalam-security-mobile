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
type Props = NativeStackScreenProps<AuthStackParamList, "Login">;

export const LoginScreen = ({ navigation }: Props) => {
  const { tokens } = useAppTheme();
  const login = useAuthStore((state) => state.login);
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
      await login(values.email, values.password);
      toastBus.show({ message: "Signed in successfully.", severity: "success" });
    } catch {
      toastBus.show({ message: "Invalid email or password.", severity: "error" });
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
          <Text style={[styles.title, { color: tokens.colors.onSurface }]}>Welcome back</Text>
          <Text style={[styles.subtitle, { color: tokens.colors.onSurfaceMuted }]}>
            Sign in to continue
          </Text>
        </View>

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
                value={value}
                onChangeText={onChange}
                error={errors.password?.message}
                autoComplete="current-password"
                onSubmitEditing={handleSubmit(onSubmit)}
              />
            )}
          />

          <Pressable
            onPress={() => navigation.navigate("ForgotPassword")}
            style={styles.forgotWrap}
            accessibilityRole="link"
          >
            <Text style={[styles.forgotText, { color: tokens.colors.primary }]}>
              Forgot password?
            </Text>
          </Pressable>

          <ActionButton
            label={isSubmitting ? "Signing in..." : "Login"}
            disabled={isSubmitting}
            loading={isSubmitting}
            onPress={handleSubmit(onSubmit)}
            size="large"
          />

          <ActionButton
            variant="secondary"
            label="Register"
            onPress={() => navigation.navigate("Register")}
            size="large"
          />
        </View>

        <View style={styles.footer}>
          <Pressable
            style={styles.legalWrap}
            accessibilityRole="link"
          >
            <Text
              style={[styles.legalLink, { color: tokens.colors.onSurfaceMuted }]}
              onPress={() => navigation.navigate("Terms")}
            >
              Terms
            </Text>
            <Text style={[styles.legalDot, { color: tokens.colors.onSurfaceMuted }]}>·</Text>
            <Text
              style={[styles.legalLink, { color: tokens.colors.onSurfaceMuted }]}
              onPress={() => navigation.navigate("Privacy")}
            >
              Privacy
            </Text>
          </Pressable>
        </View>
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
    marginBottom: 32,
  },
  title: {
    fontSize: 34,
    fontWeight: "800",
    letterSpacing: -0.8,
    fontStyle: "italic",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
  },
  form: {
    gap: 16,
  },
  forgotWrap: {
    alignSelf: "flex-end",
    marginTop: -6,
    marginBottom: 4,
  },
  forgotText: {
    fontSize: 14,
    fontWeight: "600",
  },
  footer: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
    paddingTop: 32,
    paddingBottom: 8,
  },
  legalWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  legalLink: {
    fontSize: 14,
    fontWeight: "500",
  },
  legalDot: {
    fontSize: 14,
  },
});
