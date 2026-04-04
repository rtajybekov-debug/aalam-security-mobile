import React from "react";
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { UserStackParamList } from "../../navigation/types";
import { useAppTheme } from "../../theme";
import { spacing } from "../../theme";
import { ActionButton } from "../../components/ui/ActionButton";

type Props = NativeStackScreenProps<UserStackParamList, "UserBillingPlans">;

type BillingPeriod = "monthly" | "yearly";

type Plan = {
  id: string;
  name: string;
  monthlyPrice: number;
  description: string;
  isPopular?: boolean;
};

const PLANS: Plan[] = [
  { id: "basic", name: "Basic", monthlyPrice: 3900, description: "Entry package for individuals." },
  { id: "pro", name: "Pro", monthlyPrice: 7900, description: "Most chosen for family coverage.", isPopular: true },
  { id: "business", name: "Business", monthlyPrice: 12900, description: "For teams and businesses." },
  { id: "enterprise", name: "Enterprise", monthlyPrice: 19900, description: "Custom SLA and priority support." },
];

export const UserBillingPlansScreen = ({ navigation }: Props) => {
  const { tokens } = useAppTheme();
  const [period, setPeriod] = React.useState<BillingPeriod>("monthly");
  const [selectedPlanId, setSelectedPlanId] = React.useState("pro");

  const selectedPlan = React.useMemo(
    () => PLANS.find((plan) => plan.id === selectedPlanId) ?? PLANS[1],
    [selectedPlanId],
  );

  const getDisplayedPrice = React.useCallback(
    (plan: Plan) => {
      if (period === "monthly") return plan.monthlyPrice;
      return Math.round(plan.monthlyPrice * 10.5);
    },
    [period],
  );

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: tokens.colors.background }]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.title, { color: tokens.colors.onSurface }]}>Choose Your Plan</Text>
        <Text style={[styles.subtitle, { color: tokens.colors.onSurfaceMuted }]}>
          {period === "monthly" ? "Monthly billing selected." : "Yearly billing selected."}
        </Text>

        <View style={[styles.toggleWrap, { backgroundColor: tokens.colors.surface, borderColor: tokens.colors.border }]}>
          <Pressable
            style={[
              styles.toggleBtn,
              period === "monthly" && styles.toggleBtnActive,
            ]}
            onPress={() => setPeriod("monthly")}
          >
            <Text style={[styles.toggleText, { color: period === "monthly" ? "#0A0A0A" : tokens.colors.onSurfaceMuted }]}>
              Monthly
            </Text>
          </Pressable>
          <Pressable
            style={[
              styles.toggleBtn,
              period === "yearly" && styles.toggleBtnActive,
            ]}
            onPress={() => setPeriod("yearly")}
          >
            <Text style={[styles.toggleText, { color: period === "yearly" ? "#0A0A0A" : tokens.colors.onSurfaceMuted }]}>
              Yearly
            </Text>
          </Pressable>
        </View>

        <View style={styles.cards}>
          {PLANS.map((plan) => {
            const selected = plan.id === selectedPlanId;
            return (
              <Pressable
                key={plan.id}
                style={[
                  styles.planCard,
                  {
                    backgroundColor: tokens.colors.surface,
                    borderColor: selected ? "#84CC16" : tokens.colors.border,
                  },
                ]}
                onPress={() => setSelectedPlanId(plan.id)}
              >
                <View style={styles.planHead}>
                  <Text style={[styles.planName, { color: tokens.colors.onSurface }]}>{plan.name}</Text>
                  {plan.isPopular ? <Text style={styles.popular}>POPULAR</Text> : null}
                </View>
                <Text style={[styles.planPrice, { color: tokens.colors.onSurface }]}>
                  {getDisplayedPrice(plan)} c / {period === "monthly" ? "month" : "year"}
                </Text>
                <Text style={[styles.planDesc, { color: tokens.colors.onSurfaceMuted }]}>{plan.description}</Text>
              </Pressable>
            );
          })}
        </View>

        <ActionButton
          label="Customize plan with add-ons"
          onPress={() =>
            navigation.navigate("UserBillingAddons", {
              planName: selectedPlan.name,
              basePrice: getDisplayedPrice(selectedPlan),
            })
          }
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { flex: 1 },
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl * 2,
    gap: 10,
  },
  title: { fontSize: 24, fontWeight: "700", letterSpacing: -0.3 },
  subtitle: { fontSize: 11, fontWeight: "500" },
  toggleWrap: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 4,
    flexDirection: "row",
    gap: 6,
  },
  toggleBtn: {
    flex: 1,
    borderRadius: 9,
    paddingVertical: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#111827",
  },
  toggleBtnActive: {
    backgroundColor: "#C4F82A",
  },
  toggleText: {
    fontSize: 12,
    fontWeight: "700",
  },
  cards: { gap: 6, marginTop: 2 },
  planCard: {
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 10,
    gap: 2,
  },
  planHead: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  planName: { fontSize: 15, fontWeight: "700" },
  popular: { fontSize: 10, fontWeight: "700", color: "#84CC16" },
  planPrice: { fontSize: 14, fontWeight: "700" },
  planDesc: { fontSize: 12, fontWeight: "500" },
});
