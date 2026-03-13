import React, { useCallback } from "react";
import {
  FlatList,
  ListRenderItemInfo,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useQuery } from "@tanstack/react-query";
import { CommonStackParamList } from "../../navigation/types";
import { organizationApi, OrganizationMember } from "../../api/modules/organization";
import { ActionButton } from "../../components/ui/ActionButton";
import { EmptyState } from "../../components/state/EmptyState";
import { SkeletonList } from "../../components/state/SkeletonList";
import { useAppTheme } from "../../theme";

type Props = NativeStackScreenProps<CommonStackParamList, "MyOrganizations">;

const ROLE_LABELS: Record<string, string> = {
  OWNER: "Owner",
  MANAGER: "Manager",
  OPERATOR: "Operator",
  MEMBER: "Member",
};

const OrgCard = React.memo(
  ({
    item,
    tokens,
    onPress,
  }: {
    item: OrganizationMember;
    tokens: ReturnType<typeof useAppTheme>["tokens"];
    onPress: (item: OrganizationMember) => void;
  }) => (
    <Pressable
      onPress={() => onPress(item)}
      style={[
        styles.card,
        {
          backgroundColor: tokens.colors.surface,
          borderColor: tokens.colors.border,
        },
      ]}
      accessibilityRole="button"
      accessibilityLabel={`Open ${item.organization.name}`}
    >
      <View style={styles.cardContent}>
        <Text style={[styles.orgName, { color: tokens.colors.onSurface }]} numberOfLines={1}>
          {item.organization.name}
        </Text>
        <View style={styles.meta}>
          <View
            style={[
              styles.roleBadge,
              { backgroundColor: tokens.colors.primary + "20", borderColor: tokens.colors.primary },
            ]}
          >
            <Text style={[styles.roleText, { color: tokens.colors.primary }]}>
              {ROLE_LABELS[item.role] ?? item.role}
            </Text>
          </View>
          <Text style={[styles.venueCount, { color: tokens.colors.onSurfaceMuted }]}>
            {item.organization.venues?.length ?? 0} venue
            {(item.organization.venues?.length ?? 0) !== 1 ? "s" : ""}
          </Text>
        </View>
      </View>
      <Text style={[styles.chevron, { color: tokens.colors.onSurfaceMuted }]}>›</Text>
    </Pressable>
  )
);
OrgCard.displayName = "OrgCard";

export const MyOrganizationsScreen = ({ navigation }: Props) => {
  const { tokens } = useAppTheme();
  const { data: memberships, isLoading, isError, refetch } = useQuery({
    queryKey: ["organizations"],
    queryFn: organizationApi.getMyOrganizations,
  });

  const onOrgPress = useCallback(
    (item: OrganizationMember) => {
      navigation.navigate("OrganizationVenues", {
        organizationId: item.organizationId,
        organizationName: item.organization.name,
      });
    },
    [navigation]
  );

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<OrganizationMember>) => (
      <OrgCard item={item} tokens={tokens} onPress={onOrgPress} />
    ),
    [tokens, onOrgPress]
  );

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
          <Text style={[styles.title, { color: tokens.colors.onSurface }]}>My Organizations</Text>
          <Text style={[styles.subtitle, { color: tokens.colors.onSurfaceMuted }]}>
            Manage venues and operators
          </Text>
        </View>

        {memberships && memberships.length > 0 ? (
          <FlatList
            data={memberships}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
            ListFooterComponent={
              <ActionButton
                variant="secondary"
                label="Create organization"
                onPress={() => navigation.navigate("CreateOrganization")}
                style={styles.createButton}
              />
            }
          />
        ) : (
          <>
            <EmptyState
              title="No organizations"
              subtitle="Create a business organization to add venues and operators"
            />
            <ActionButton
              label="Create organization"
              onPress={() => navigation.navigate("CreateOrganization")}
              style={styles.createButton}
            />
          </>
        )}
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
  list: { gap: 12, paddingBottom: 24 },
  card: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    minHeight: 48,
  },
  cardContent: { flex: 1, gap: 6 },
  orgName: { fontSize: 16, fontWeight: "700" },
  meta: { flexDirection: "row", alignItems: "center", gap: 10 },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  roleText: { fontSize: 11, fontWeight: "700" },
  venueCount: { fontSize: 12 },
  chevron: { fontSize: 24, fontWeight: "300", marginLeft: 8 },
  createButton: { marginTop: 8 },
});
