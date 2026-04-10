import React from "react";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { SafeAreaView, StyleSheet, Text, View } from "react-native";
import { CircleCheck } from "lucide-react-native";
import { AdminStackParamList } from "../../navigation/types";
import { ActionButton } from "../../components/ui/ActionButton";
import { useAppTheme } from "../../theme";
import { ru } from "../../locale/ru";

type Props = NativeStackScreenProps<AdminStackParamList, "AdminCreateOperatorSuccess">;

export const AdminCreateOperatorSuccessScreen = ({ navigation }: Props) => {
  const { tokens } = useAppTheme();
  return (
    <SafeAreaView style={[styles.root, { backgroundColor: tokens.colors.background }]}>
      <View style={styles.content}>
        <View style={[styles.iconWrap, { backgroundColor: "#DCFCE7" }]}>
          <CircleCheck size={40} color="#166534" strokeWidth={2} />
        </View>
        <Text style={[styles.title, { color: tokens.colors.onSurface }]}>{ru.admin.successTitle}</Text>
        <Text style={[styles.subtitle, { color: tokens.colors.onSurfaceMuted }]}>{ru.admin.successSub}</Text>
        <ActionButton
          label={ru.operatorScreens.adminBack}
          onPress={() => navigation.navigate("AdminTabs")}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
    gap: 14,
  },
  iconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  title: { fontSize: 24, fontWeight: "800", textAlign: "center", letterSpacing: -0.3 },
  subtitle: { fontSize: 14, textAlign: "center", lineHeight: 22, maxWidth: 300 },
});
