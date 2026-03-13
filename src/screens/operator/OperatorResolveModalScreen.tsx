import React from "react";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { KeyboardAvoidingView, Platform, SafeAreaView, StyleSheet, Text, View } from "react-native";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { OperatorStackParamList } from "../../navigation/types";
import { dispatchApi } from "../../api/modules/dispatch";
import { ActionButton } from "../../components/ui/ActionButton";
import { AppInput } from "../../components/ui/AppInput";
import { toastBus } from "../../ui/feedback/toastBus";
import { useAppTheme } from "../../theme";

const schema = z.object({
  resolution: z.string().min(1, "Resolution note is required"),
});

type FormValues = z.infer<typeof schema>;
type Props = NativeStackScreenProps<OperatorStackParamList, "OperatorResolveModal">;

export const OperatorResolveModalScreen = ({ route, navigation }: Props) => {
  const { tokens } = useAppTheme();
  const { sessionId } = route.params;
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { resolution: "" },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      await dispatchApi.resolve(sessionId, values.resolution);
      toastBus.show({ message: "Session resolved successfully.", severity: "success" });
      navigation.goBack();
    } catch {
      toastBus.show({ message: "Failed to resolve session.", severity: "error" });
    }
  };

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: tokens.colors.background }]}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.content}>
          <Text style={[styles.title, { color: tokens.colors.onSurface }]}>Resolve Session</Text>
          <Text style={[styles.subtitle, { color: tokens.colors.onSurfaceMuted }]}>
            Provide a resolution note before closing this emergency session.
          </Text>

          <Controller
            control={control}
            name="resolution"
            render={({ field: { value, onChange } }) => (
              <AppInput
                label="Resolution note"
                placeholder="Describe how the emergency was resolved..."
                value={value}
                onChangeText={onChange}
                multiline
                numberOfLines={6}
                error={errors.resolution?.message}
                style={styles.textarea}
                textAlignVertical="top"
              />
            )}
          />

          <View style={styles.actions}>
            <ActionButton
              variant="secondary"
              label="Cancel"
              onPress={() => navigation.goBack()}
              style={styles.cancelBtn}
            />
            <ActionButton
              variant="danger"
              label={isSubmitting ? "Saving..." : "Resolve"}
              onPress={handleSubmit(onSubmit)}
              loading={isSubmitting}
              disabled={isSubmitting}
              style={styles.resolveBtn}
              accessibilityLabel="Confirm session resolution"
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1 },
  flex: { flex: 1 },
  content: { flex: 1, padding: 20, gap: 16 },
  title: { fontSize: 24, fontWeight: "800", letterSpacing: -0.3 },
  subtitle: { fontSize: 14, lineHeight: 20 },
  textarea: { minHeight: 140 },
  actions: { flexDirection: "row", gap: 12, marginTop: 8 },
  cancelBtn: { flex: 1 },
  resolveBtn: { flex: 2 },
});
