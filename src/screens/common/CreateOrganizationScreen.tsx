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
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CommonStackParamList } from "../../navigation/types";
import { organizationApi } from "../../api/modules/organization";
import { AppInput } from "../../components/ui/AppInput";
import { ActionButton } from "../../components/ui/ActionButton";
import { toastBus } from "../../ui/feedback/toastBus";
import { useAppTheme } from "../../theme";

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.enum(["PERSONAL", "BUSINESS"]),
});

type FormValues = z.infer<typeof schema>;
type Props = NativeStackScreenProps<CommonStackParamList, "CreateOrganization">;

export const CreateOrganizationScreen = ({ navigation }: Props) => {
  const { tokens } = useAppTheme();
  const queryClient = useQueryClient();
  const {
    control,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", type: "BUSINESS" },
  });

  const typeValue = watch("type");

  const createMutation = useMutation({
    mutationFn: organizationApi.create,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["organizations"] });
      toastBus.show({ message: "Organization created.", severity: "success" });
      navigation.replace("OrganizationVenues", {
        organizationId: data.id,
        organizationName: data.name,
      });
    },
    onError: () => {
      toastBus.show({ message: "Failed to create organization.", severity: "error" });
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
            ORGANIZATION TYPE
          </Text>
          <View style={styles.typeRow}>
            <Controller
              control={control}
              name="type"
              render={({ field: { onChange, value } }) => (
                <>
                  <Pressable
                    onPress={() => onChange("PERSONAL")}
                    style={[
                      styles.typeOption,
                      {
                        backgroundColor:
                          value === "PERSONAL"
                            ? tokens.colors.primary + "20"
                            : tokens.colors.surface,
                        borderColor:
                          value === "PERSONAL" ? tokens.colors.primary : tokens.colors.border,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.typeLabel,
                        {
                          color:
                            value === "PERSONAL"
                              ? tokens.colors.primary
                              : tokens.colors.onSurfaceMuted,
                        },
                      ]}
                    >
                      Personal
                    </Text>
                    <Text
                      style={[
                        styles.typeHint,
                        { color: tokens.colors.onSurfaceMuted },
                      ]}
                    >
                      Solo use
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={() => onChange("BUSINESS")}
                    style={[
                      styles.typeOption,
                      {
                        backgroundColor:
                          value === "BUSINESS"
                            ? tokens.colors.primary + "20"
                            : tokens.colors.surface,
                        borderColor:
                          value === "BUSINESS" ? tokens.colors.primary : tokens.colors.border,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.typeLabel,
                        {
                          color:
                            value === "BUSINESS"
                              ? tokens.colors.primary
                              : tokens.colors.onSurfaceMuted,
                        },
                      ]}
                    >
                      Business
                    </Text>
                    <Text
                      style={[
                        styles.typeHint,
                        { color: tokens.colors.onSurfaceMuted },
                      ]}
                    >
                      Café, club, venue
                    </Text>
                  </Pressable>
                </>
              )}
            />
          </View>

          <Text style={[styles.sectionLabel, { color: tokens.colors.onSurfaceMuted, marginTop: 24 }]}>
            ORGANIZATION NAME
          </Text>
          <Controller
            control={control}
            name="name"
            render={({ field: { onChange, value } }) => (
              <AppInput
                label="Name"
                placeholder={typeValue === "BUSINESS" ? "My Cafe" : "My Account"}
                value={value}
                onChangeText={onChange}
                error={errors.name?.message}
                autoComplete="organization"
              />
            )}
          />

          <ActionButton
            label={createMutation.isPending ? "Creating..." : "Create"}
            onPress={handleSubmit(onSubmit)}
            loading={createMutation.isPending}
            disabled={createMutation.isPending || isSubmitting}
            size="large"
            style={styles.submit}
          />
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
    marginBottom: 10,
  },
  typeRow: { flexDirection: "row", gap: 12, marginBottom: 8 },
  typeOption: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    gap: 2,
    minHeight: 48,
  },
  typeLabel: { fontSize: 14, fontWeight: "700" },
  typeHint: { fontSize: 11 },
  submit: { marginTop: 24 },
});
