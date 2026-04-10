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
import * as DocumentPicker from "expo-document-picker";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { z } from "zod";
import { CommonStackParamList } from "../../navigation/types";
import { AppInput } from "../../components/ui/AppInput";
import { ActionButton } from "../../components/ui/ActionButton";
import { useAppTheme } from "../../theme";
import { spacing } from "../../theme";
import { organizationApplicationApi } from "../../api/modules/organizationApplication";
import { toastBus } from "../../ui/feedback/toastBus";
import {
  KYRGYZ_PHONE_HINT,
  kyrgyzPhoneRequiredSchema,
  sanitizeKyrgyzPhoneInput,
} from "../../lib/kyrgyzPhone";
import { ru } from "../../locale/ru";

type Props = NativeStackScreenProps<CommonStackParamList, "RequestNewOrganization">;
type OrganizationType = "Corporate" | "Non-profit" | "Government";
type BranchDraft = { id: string; name: string; address: string };

const ORGANIZATION_TYPES: OrganizationType[] = ["Corporate", "Non-profit", "Government"];

const TYPE_LABELS: Record<OrganizationType, string> = {
  Corporate: ru.createOrgForm.typeCorporate,
  "Non-profit": ru.createOrgForm.typeNonProfit,
  Government: ru.createOrgForm.typeGov,
};

const organizationRequestSchema = z.object({
  organizationName: z.string().trim().min(1, ru.createOrgForm.orgNameRequired),
  organizationType: z.enum(["Corporate", "Non-profit", "Government"]),
  branches: z
    .array(
      z.object({
        name: z.string().trim().min(1, ru.createOrgForm.branchNameRequired),
        address: z.string().trim().min(1, ru.createOrgForm.branchAddrRequired),
      }),
    )
    .min(1, ru.createOrgForm.minBranches),
  contactEmail: z
    .string()
    .trim()
    .min(1, ru.createOrgForm.contactEmailRequired)
    .email(ru.createOrgForm.emailInvalid)
    .transform((s) => s.toLowerCase()),
  contactPhone: kyrgyzPhoneRequiredSchema,
  description: z.string().trim().optional(),
  isAuthorized: z.boolean().refine((v) => v === true, {
    message: ru.createOrgForm.authConfirm,
  }),
});

export const RequestNewOrganizationScreen = ({ navigation }: Props) => {
  const { tokens } = useAppTheme();
  const [organizationName, setOrganizationName] = React.useState("");
  const [organizationType, setOrganizationType] = React.useState<OrganizationType>("Corporate");
  const [isTypeOpen, setIsTypeOpen] = React.useState(false);
  const [branches, setBranches] = React.useState<BranchDraft[]>([
    { id: "branch-1", name: "", address: "" },
  ]);
  const [contactEmail, setContactEmail] = React.useState("");
  const [contactPhone, setContactPhone] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [isAuthorized, setIsAuthorized] = React.useState(true);
  const [attachments, setAttachments] = React.useState<DocumentPicker.DocumentPickerAsset[]>([]);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const updateBranch = (id: string, field: "name" | "address", value: string) => {
    setBranches((prev) =>
      prev.map((branch) => (branch.id === id ? { ...branch, [field]: value } : branch)),
    );
  };

  const addBranch = () => {
    setBranches((prev) => [
      ...prev,
      { id: `branch-${Date.now()}-${prev.length + 1}`, name: "", address: "" },
    ]);
  };

  const removeBranch = (id: string) => {
    setBranches((prev) => (prev.length > 1 ? prev.filter((branch) => branch.id !== id) : prev));
  };

  const hasValidBranches = branches.every(
    (branch) => branch.name.trim().length > 0 && branch.address.trim().length > 0,
  );

  const requiredDone =
    organizationName.trim().length > 0 &&
    hasValidBranches &&
    contactEmail.trim().length > 0 &&
    contactPhone.trim().length > 0 &&
    isAuthorized;

  const onPickDocuments = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        multiple: true,
        copyToCacheDirectory: true,
        type: [
          "application/pdf",
          "application/msword",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ],
      });

      if (result.canceled || result.assets.length === 0) return;

      setAttachments((prev) => {
        const next = [...prev];
        for (const asset of result.assets) {
          if (!next.some((existing) => existing.uri === asset.uri)) {
            next.push(asset);
          }
        }
        return next;
      });

      toastBus.show({
        message: `${ru.createOrgForm.filesAttached} ${result.assets.length}`,
        severity: "success",
      });
    } catch {
      toastBus.show({ message: ru.createOrgForm.pickDocFail, severity: "error" });
    }
  };

  const removeAttachment = (uri: string) => {
    setAttachments((prev) => prev.filter((asset) => asset.uri !== uri));
  };

  const onSubmit = async () => {
    const parsed = organizationRequestSchema.safeParse({
      organizationName,
      organizationType,
      branches: branches.map((b) => ({ name: b.name, address: b.address })),
      contactEmail,
      contactPhone: sanitizeKyrgyzPhoneInput(contactPhone),
      description: description.trim() || undefined,
      isAuthorized,
    });

    if (!parsed.success) {
      const msg = parsed.error.issues[0]?.message ?? ru.createOrgForm.formError;
      toastBus.show({ message: msg, severity: "warning" });
      return;
    }

    const d = parsed.data;
    setIsSubmitting(true);
    try {
      await organizationApplicationApi.create({
        organizationName: d.organizationName,
        organizationType: d.organizationType,
        branches: d.branches.map((b) => ({
          name: b.name,
          address: b.address,
        })),
        contactEmail: d.contactEmail,
        contactPhone: d.contactPhone,
        description: d.description,
        attachments:
          attachments.length > 0
            ? attachments.map((a) => ({
                fileName: a.name ?? "document",
                mimeType: a.mimeType ?? "application/octet-stream",
                sizeBytes: a.size ?? undefined,
              }))
            : undefined,
      });
      toastBus.show({ message: ru.createOrgForm.submitOk, severity: "success" });
      navigation.navigate("OrganizationRequestSubmitted");
    } catch {
      toastBus.show({ message: ru.createOrgForm.submitFail, severity: "error" });
    } finally {
      setIsSubmitting(false);
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
        <Text style={[styles.title, { color: tokens.colors.onSurface }]}>{ru.createOrgForm.title}</Text>
        <Text style={[styles.intro, { color: tokens.colors.onSurfaceMuted }]}>{ru.createOrgForm.intro}</Text>

        <AppInput
          label={ru.createOrgForm.orgNameLabel}
          value={organizationName}
          onChangeText={setOrganizationName}
          autoComplete="organization"
        />

        <Text style={[styles.fieldLabel, { color: tokens.colors.onSurfaceMuted }]}>
          {ru.createOrgForm.orgTypeLabel}
        </Text>
        <Pressable
          style={[styles.selectRow, { backgroundColor: tokens.colors.surface, borderColor: tokens.colors.border }]}
          onPress={() => setIsTypeOpen((v) => !v)}
        >
          <Text style={[styles.selectValue, { color: tokens.colors.onSurface }]}>
            {TYPE_LABELS[organizationType]}
          </Text>
          <Text style={[styles.chevron, { color: tokens.colors.onSurfaceMuted }]}>{isTypeOpen ? "▴" : "▾"}</Text>
        </Pressable>
        {isTypeOpen ? (
          <View style={[styles.optionsWrap, { backgroundColor: tokens.colors.surface, borderColor: tokens.colors.border }]}>
            {ORGANIZATION_TYPES.map((type) => (
              <Pressable
                key={type}
                style={styles.optionRow}
                onPress={() => {
                  setOrganizationType(type);
                  setIsTypeOpen(false);
                }}
              >
                <Text
                  style={[
                    styles.optionText,
                    { color: type === organizationType ? tokens.colors.primary : tokens.colors.onSurface },
                  ]}
                >
                  {TYPE_LABELS[type]}
                </Text>
              </Pressable>
            ))}
          </View>
        ) : null}

        <Text style={[styles.fieldLabel, { color: tokens.colors.onSurfaceMuted }]}>
          {ru.createOrgForm.branchesLabel}
        </Text>
        <View style={styles.branchesWrap}>
          {branches.map((branch, index) => (
            <View
              key={branch.id}
              style={[
                styles.branchCard,
                { backgroundColor: tokens.colors.surface, borderColor: tokens.colors.border },
              ]}
            >
              <View style={styles.branchCardHeader}>
                <Text style={[styles.branchTitle, { color: tokens.colors.onSurface }]}>
                  {ru.createOrgForm.branchTitle} {index + 1}
                </Text>
                {branches.length > 1 ? (
                  <Pressable onPress={() => removeBranch(branch.id)} hitSlop={8}>
                    <Text style={[styles.removeBranchText, { color: tokens.colors.danger }]}>
                      {ru.createOrgForm.remove}
                    </Text>
                  </Pressable>
                ) : null}
              </View>
              <AppInput
                label={ru.createOrgForm.branchNameLabel}
                value={branch.name}
                onChangeText={(v) => updateBranch(branch.id, "name", v)}
              />
              <AppInput
                label={ru.createOrgForm.branchAddrLabel}
                value={branch.address}
                onChangeText={(v) => updateBranch(branch.id, "address", v)}
                autoComplete="street-address"
              />
            </View>
          ))}
        </View>
        <ActionButton variant="secondary" size="small" label={ru.createOrgForm.addBranch} onPress={addBranch} />

        <AppInput
          label={ru.createOrgForm.contactEmailLabel}
          value={contactEmail}
          onChangeText={setContactEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />
        <AppInput
          label={ru.createOrgForm.contactPhoneLabel}
          value={contactPhone}
          onChangeText={(v) => setContactPhone(sanitizeKyrgyzPhoneInput(v))}
          keyboardType="phone-pad"
          autoCapitalize="none"
          autoCorrect={false}
          hint={KYRGYZ_PHONE_HINT}
        />

        <View style={styles.descriptionBlock}>
          <Text style={[styles.fieldLabel, { color: tokens.colors.onSurfaceMuted }]}>
            {ru.createOrgForm.descOptional}
          </Text>
          <AppInput
            label={ru.createOrgForm.contextLabel}
            value={description}
            onChangeText={setDescription}
          />
          <View style={styles.uploadRow}>
            <Pressable
              style={[styles.uploadButton, { backgroundColor: tokens.colors.surface, borderColor: tokens.colors.border }]}
              onPress={() => void onPickDocuments()}
              accessibilityRole="button"
              accessibilityLabel={ru.createOrgForm.uploadA11y}
            >
              <Text style={[styles.uploadButtonText, { color: "#93C5FD" }]}>{ru.createOrgForm.addAttachment}</Text>
            </Pressable>
            <Text style={[styles.uploadHint, { color: tokens.colors.onSurfaceMuted }]}>
              {ru.createOrgForm.filesHint}
            </Text>
          </View>
          {attachments.length > 0 ? (
            <View style={styles.attachmentList}>
              {attachments.map((asset) => (
                <View
                  key={asset.uri}
                  style={[
                    styles.attachmentItem,
                    { backgroundColor: tokens.colors.surface, borderColor: tokens.colors.border },
                  ]}
                >
                  <Text style={[styles.attachmentName, { color: tokens.colors.onSurface }]} numberOfLines={1}>
                    {asset.name ?? "document"}
                  </Text>
                  <Pressable onPress={() => removeAttachment(asset.uri)} hitSlop={8}>
                    <Text style={[styles.removeAttachmentText, { color: tokens.colors.danger }]}>
                      {ru.createOrgForm.remove}
                    </Text>
                  </Pressable>
                </View>
              ))}
            </View>
          ) : null}
        </View>

        <Pressable style={styles.checkboxRow} onPress={() => setIsAuthorized((v) => !v)}>
          <View style={[styles.checkbox, { backgroundColor: isAuthorized ? "#C4F82A" : tokens.colors.surface }]}>
            {isAuthorized ? <Text style={styles.checkboxTick}>✓</Text> : null}
          </View>
          <Text style={[styles.checkboxText, { color: tokens.colors.onSurfaceMuted }]}>
            {ru.createOrgForm.authCheckbox}
          </Text>
        </Pressable>

        <ActionButton
          label={isSubmitting ? ru.createOrgForm.submitting : ru.createOrgForm.submit}
          onPress={() => void onSubmit()}
          disabled={!requiredDone || isSubmitting}
          loading={isSubmitting}
          style={styles.submit}
        />
        <Text style={[styles.caption, { color: tokens.colors.onSurfaceMuted }]}>
          {ru.createOrgForm.submitCaption}
        </Text>
        <View style={styles.legalRow}>
          <Text style={[styles.legalLink, { color: tokens.colors.onSurfaceMuted }]}>
            {ru.createOrgForm.legalTerms}
          </Text>
          <Text style={[styles.legalDot, { color: tokens.colors.border }]}>·</Text>
          <Text style={[styles.legalLink, { color: tokens.colors.onSurfaceMuted }]}>
            {ru.createOrgForm.legalPrivacy}
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xl,
    gap: 7,
  },
  title: { fontSize: 24, fontWeight: "700", letterSpacing: -0.3 },
  intro: { fontSize: 12, fontWeight: "500", lineHeight: 18, marginBottom: 2 },
  fieldLabel: { fontSize: 11, fontWeight: "600", marginBottom: 2 },
  selectRow: {
    borderRadius: 12,
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 2,
  },
  selectValue: { fontSize: 12, fontWeight: "500" },
  chevron: { fontSize: 12, fontWeight: "600" },
  optionsWrap: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: "hidden",
    marginTop: -1,
  },
  optionRow: {
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  optionText: { fontSize: 12, fontWeight: "500" },
  branchesWrap: { gap: 8, marginTop: 2 },
  branchCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 10,
    gap: 8,
  },
  branchCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  branchTitle: { fontSize: 12, fontWeight: "700" },
  removeBranchText: { fontSize: 12, fontWeight: "600" },
  descriptionBlock: { marginTop: 2, gap: 2 },
  uploadRow: {
    gap: 8,
    marginTop: 2,
  },
  uploadButton: {
    alignSelf: "flex-start",
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  uploadButtonText: {
    fontSize: 11,
    fontWeight: "600",
  },
  uploadHint: {
    fontSize: 10,
    fontWeight: "500",
  },
  attachmentList: {
    gap: 6,
    marginTop: 2,
  },
  attachmentItem: {
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  attachmentName: {
    flex: 1,
    fontSize: 12,
    fontWeight: "500",
  },
  removeAttachmentText: {
    fontSize: 12,
    fontWeight: "600",
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    marginTop: 2,
  },
  checkbox: {
    width: 16,
    height: 16,
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxTick: { fontSize: 10, color: "#0A0A0A", fontWeight: "700" },
  checkboxText: { flex: 1, fontSize: 11, fontWeight: "500", lineHeight: 16 },
  submit: { marginTop: 4 },
  caption: { fontSize: 10, textAlign: "center", marginTop: 2 },
  legalRow: { flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 8, marginTop: 2 },
  legalLink: { fontSize: 11, fontWeight: "500" },
  legalDot: { fontSize: 11, fontWeight: "500" },
});
