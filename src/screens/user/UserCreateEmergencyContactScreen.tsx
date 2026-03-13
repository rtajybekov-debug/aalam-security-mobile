import React from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { UserStackParamList } from "../../navigation/types";
import { emergencyContactsApi } from "../../api/modules/emergencyContacts";
import { AppInput } from "../../components/ui/AppInput";
import { ActionButton } from "../../components/ui/ActionButton";
import { toastBus } from "../../ui/feedback/toastBus";
import { useAppTheme } from "../../theme";

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  phone: z.string().optional(),
  email: z.union([z.string().email("Enter a valid email"), z.literal("")]).optional(),
  isTrusted: z.boolean(),
});

type FormValues = z.infer<typeof schema>;
type Props = NativeStackScreenProps<UserStackParamList, "UserCreateEmergencyContact">;

export const UserCreateEmergencyContactScreen = ({ navigation }: Props) => {
  const { tokens } = useAppTheme();
  const queryClient = useQueryClient();
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", phone: "", email: "", isTrusted: false },
  });

  const createMutation = useMutation({
    mutationFn: emergencyContactsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["emergency-contacts"] });
      toastBus.show({ message: "Contact added.", severity: "success" });
      navigation.goBack();
    },
    onError: () => {
      toastBus.show({ message: "Failed to add contact.", severity: "error" });
    },
  });

  const onSubmit = (values: FormValues) => {
    createMutation.mutate({
      name: values.name,
      phone: values.phone || undefined,
      email: values.email || undefined,
      isTrusted: values.isTrusted,
    });
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
          <Text style={[styles.sectionLabel, { color: tokens.colors.onSurfaceMuted }]}>
            CONTACT DETAILS
          </Text>
          <Text style={[styles.hint, { color: tokens.colors.onSurfaceMuted }]}>
            At least phone or email is required for notifications.
          </Text>

          <View style={styles.form}>
            <Controller
              control={control}
              name="name"
              render={({ field: { onChange, value } }) => (
                <AppInput
                  label="Name"
                  placeholder="John Doe"
                  value={value}
                  onChangeText={onChange}
                  error={errors.name?.message}
                  autoComplete="name"
                />
              )}
            />
            <Controller
              control={control}
              name="phone"
              render={({ field: { onChange, value } }) => (
                <AppInput
                  label="Phone"
                  placeholder="+1 234 567 8900"
                  value={value || ""}
                  onChangeText={onChange}
                  keyboardType="phone-pad"
                  error={errors.phone?.message}
                />
              )}
            />
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, value } }) => (
                <AppInput
                  label="Email"
                  placeholder="john@example.com"
                  value={value || ""}
                  onChangeText={onChange}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  error={errors.email?.message}
                />
              )}
            />
            <Controller
              control={control}
              name="isTrusted"
              render={({ field: { onChange, value } }) => (
                <View style={[styles.switchRow, { borderColor: tokens.colors.border }]}>
                  <View style={styles.switchLabel}>
                    <Text style={[styles.switchTitle, { color: tokens.colors.onSurface }]}>
                      Trusted contact
                    </Text>
                    <Text style={[styles.switchHint, { color: tokens.colors.onSurfaceMuted }]}>
                      Can see your live location during SOS
                    </Text>
                  </View>
                  <Switch
                    value={value}
                    onValueChange={onChange}
                    trackColor={{ false: tokens.colors.border, true: tokens.colors.primary + "60" }}
                    thumbColor={value ? tokens.colors.primary : tokens.colors.onSurfaceMuted}
                  />
                </View>
              )}
            />
            <ActionButton
              label={createMutation.isPending ? "Adding..." : "Add contact"}
              onPress={handleSubmit(onSubmit)}
              loading={createMutation.isPending}
              disabled={createMutation.isPending || isSubmitting}
              size="large"
              style={styles.submit}
            />
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { flexGrow: 1, padding: 20, paddingBottom: 40 },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  hint: { fontSize: 13, lineHeight: 18, marginBottom: 20 },
  form: { gap: 14 },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    marginVertical: 8,
  },
  switchLabel: { flex: 1, marginRight: 16 },
  switchTitle: { fontSize: 15, fontWeight: "600" },
  switchHint: { fontSize: 12, marginTop: 2, lineHeight: 16 },
  submit: { marginTop: 8 },
});
