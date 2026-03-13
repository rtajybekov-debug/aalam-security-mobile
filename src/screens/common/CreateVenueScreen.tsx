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
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CommonStackParamList } from "../../navigation/types";
import { venueApi } from "../../api/modules/organization";
import { AppInput } from "../../components/ui/AppInput";
import { ActionButton } from "../../components/ui/ActionButton";
import { toastBus } from "../../ui/feedback/toastBus";
import { useAppTheme } from "../../theme";

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  address: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;
type Props = NativeStackScreenProps<CommonStackParamList, "CreateVenue">;

export const CreateVenueScreen = ({ route, navigation }: Props) => {
  const { tokens } = useAppTheme();
  const { organizationId, organizationName } = route.params;
  const queryClient = useQueryClient();
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", address: "" },
  });

  const createMutation = useMutation({
    mutationFn: (payload: FormValues) =>
      venueApi.create(organizationId, {
        name: payload.name,
        address: payload.address || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["venues", organizationId] });
      toastBus.show({ message: "Venue added.", severity: "success" });
      navigation.goBack();
    },
    onError: () => {
      toastBus.show({ message: "Failed to add venue.", severity: "error" });
    },
  });

  const onSubmit = (values: FormValues) => {
    createMutation.mutate(values);
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
          <Text style={[styles.orgLabel, { color: tokens.colors.onSurfaceMuted }]}>
            {organizationName}
          </Text>
          <Text style={[styles.title, { color: tokens.colors.onSurface }]}>Add venue</Text>
        </View>

        <View
          style={[
            styles.card,
            {
              backgroundColor: tokens.colors.surface,
              borderColor: tokens.colors.border,
            },
          ]}
        >
          <View style={styles.form}>
            <Controller
              control={control}
              name="name"
              render={({ field: { onChange, value } }) => (
                <AppInput
                  label="Venue name"
                  placeholder="Main Hall"
                  value={value}
                  onChangeText={onChange}
                  error={errors.name?.message}
                  autoComplete="off"
                />
              )}
            />
            <Controller
              control={control}
              name="address"
              render={({ field: { onChange, value } }) => (
                <AppInput
                  label="Address (optional)"
                  placeholder="123 Main St"
                  value={value || ""}
                  onChangeText={onChange}
                  autoComplete="street-address"
                />
              )}
            />
            <ActionButton
              label={createMutation.isPending ? "Adding..." : "Add venue"}
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
  header: { marginBottom: 20, gap: 4 },
  orgLabel: { fontSize: 12, fontWeight: "600" },
  title: { fontSize: 24, fontWeight: "800" },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
  },
  form: { gap: 14 },
  submit: { marginTop: 8 },
});
