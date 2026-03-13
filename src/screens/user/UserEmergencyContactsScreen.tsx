import React from "react";
import {
  FlatList,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { UserStackParamList } from "../../navigation/types";
import { emergencyContactsApi, EmergencyContact } from "../../api/modules/emergencyContacts";
import { ActionButton } from "../../components/ui/ActionButton";
import { EmptyState } from "../../components/state/EmptyState";
import { SkeletonList } from "../../components/state/SkeletonList";
import { toastBus } from "../../ui/feedback/toastBus";
import { useAppTheme } from "../../theme";

type Props = NativeStackScreenProps<UserStackParamList, "UserEmergencyContacts">;

export const UserEmergencyContactsScreen = ({ navigation }: Props) => {
  const { tokens } = useAppTheme();
  const queryClient = useQueryClient();
  const { data: contacts, isLoading, isError, refetch } = useQuery({
    queryKey: ["emergency-contacts"],
    queryFn: emergencyContactsApi.list,
  });

  const deleteMutation = useMutation({
    mutationFn: emergencyContactsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["emergency-contacts"] });
      toastBus.show({ message: "Contact removed.", severity: "success" });
    },
    onError: () => {
      toastBus.show({ message: "Failed to remove contact.", severity: "error" });
    },
  });

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.root, { backgroundColor: tokens.colors.background }]}>
        <View style={styles.content}>
          <SkeletonList count={4} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: tokens.colors.background }]}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: tokens.colors.onSurface }]}>Emergency Contacts</Text>
          <Text style={[styles.subtitle, { color: tokens.colors.onSurfaceMuted }]}>
            People to notify when you trigger SOS
          </Text>
        </View>

        {contacts && contacts.length > 0 ? (
          <FlatList
            data={contacts}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
            renderItem={({ item }) => (
              <View
                style={[
                  styles.contactCard,
                  {
                    backgroundColor: tokens.colors.surface,
                    borderColor: tokens.colors.border,
                  },
                ]}
              >
                <View style={styles.contactInfo}>
                  <Text style={[styles.contactName, { color: tokens.colors.onSurface }]}>
                    {item.name}
                  </Text>
                  {item.phone ? (
                    <Text style={[styles.contactDetail, { color: tokens.colors.onSurfaceMuted }]}>
                      {item.phone}
                    </Text>
                  ) : null}
                  {item.email ? (
                    <Text style={[styles.contactDetail, { color: tokens.colors.onSurfaceMuted }]}>
                      {item.email}
                    </Text>
                  ) : null}
                  {item.isTrusted ? (
                    <View
                      style={[
                        styles.trustedBadge,
                        { backgroundColor: tokens.colors.primary + "20" },
                      ]}
                    >
                      <Text style={[styles.trustedText, { color: tokens.colors.primary }]}>
                        Trusted (sees live location)
                      </Text>
                    </View>
                  ) : null}
                </View>
                <ActionButton
                  variant="ghost"
                  size="small"
                  label="Remove"
                  onPress={() => deleteMutation.mutate(item.id)}
                  disabled={deleteMutation.isPending}
                />
              </View>
            )}
          />
        ) : (
          <EmptyState
            title="No emergency contacts"
            subtitle="Add trusted people to notify when you trigger SOS"
          />
        )}

        <ActionButton
          label="Add contact"
          onPress={() => navigation.navigate("UserCreateEmergencyContact")}
          style={styles.addButton}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { flex: 1, padding: 20 },
  header: { marginBottom: 20, gap: 4 },
  title: { fontSize: 24, fontWeight: "800" },
  subtitle: { fontSize: 14, lineHeight: 20 },
  list: { gap: 12, paddingBottom: 20 },
  contactCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    gap: 12,
  },
  contactInfo: { flex: 1, gap: 4 },
  contactName: { fontSize: 16, fontWeight: "700" },
  contactDetail: { fontSize: 13 },
  trustedBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginTop: 6,
  },
  trustedText: { fontSize: 11, fontWeight: "600" },
  addButton: { marginTop: "auto" },
});
