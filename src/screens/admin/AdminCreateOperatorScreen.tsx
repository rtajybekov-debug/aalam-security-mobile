import React from "react";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { KeyboardAvoidingView, Platform, SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { AdminStackParamList } from "../../navigation/types";
import { adminApi } from "../../api/modules/admin";
import { AppCard } from "../../components/ui/AppCard";
import { ActionButton } from "../../components/ui/ActionButton";
import { AppInput } from "../../components/ui/AppInput";
import { toastBus } from "../../ui/feedback/toastBus";
import { useAppTheme } from "../../theme";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type FormValues = z.infer<typeof schema>;
type Props = NativeStackScreenProps<AdminStackParamList, "AdminCreateOperator">;

export const AdminCreateOperatorScreen = ({ navigation }: Props) => {
  const { tokens } = useAppTheme();
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
      await adminApi.createOperator(values);
      toastBus.show({ message: "Operator created successfully.", severity: "success" });
      navigation.navigate("AdminCreateOperatorSuccess");
    } catch {
      toastBus.show({ message: "Failed to create operator.", severity: "error" });
    }
  };

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: tokens.colors.background }]}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={[styles.title, { color: tokens.colors.onSurface }]}>Create Operator</Text>
            <Text style={[styles.subtitle, { color: tokens.colors.onSurfaceMuted }]}>
              New operator account will have access to the emergency dispatch dashboard.
            </Text>
          </View>

          <AppCard>
            <Text style={[styles.sectionLabel, { color: tokens.colors.onSurfaceMuted }]}>
              ACCOUNT DETAILS
            </Text>

            <View style={styles.form}>
              <Controller
                control={control}
                name="email"
                render={({ field: { value, onChange } }) => (
                  <AppInput
                    label="Email address"
                    placeholder="operator@organization.com"
                    value={value}
                    onChangeText={onChange}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    returnKeyType="next"
                    error={errors.email?.message}
                  />
                )}
              />

              <Controller
                control={control}
                name="password"
                render={({ field: { value, onChange } }) => (
                  <AppInput
                    label="Password"
                    placeholder="Minimum 6 characters"
                    value={value}
                    onChangeText={onChange}
                    secureTextEntry
                    returnKeyType="done"
                    error={errors.password?.message}
                    onSubmitEditing={handleSubmit(onSubmit)}
                  />
                )}
              />

              <ActionButton
                label={isSubmitting ? "Creating..." : "Create Operator"}
                onPress={handleSubmit(onSubmit)}
                loading={isSubmitting}
                disabled={isSubmitting}
                size="large"
              />
            </View>
          </AppCard>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1 },
  flex: { flex: 1 },
  scroll: { flexGrow: 1, padding: 20, gap: 16 },
  header: { gap: 4 },
  title: { fontSize: 28, fontWeight: "800", letterSpacing: -0.5 },
  subtitle: { fontSize: 14, lineHeight: 20 },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    marginBottom: 14,
  },
  form: { gap: 14 },
});
