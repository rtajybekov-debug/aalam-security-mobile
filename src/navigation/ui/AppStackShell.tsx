import { NativeStackNavigationOptions } from "@react-navigation/native-stack";

export const appStackScreenOptions: NativeStackNavigationOptions = {
  headerShadowVisible: false,
  headerBackVisible: true,
  headerTitleAlign: "left",
  contentStyle: {
    backgroundColor: "transparent",
  },
};
