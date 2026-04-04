import { NativeStackNavigationOptions } from "@react-navigation/native-stack";
import { AppStackHeader } from "../../components/navigation/AppStackHeader";

export const appStackScreenOptions: NativeStackNavigationOptions = {
  headerShadowVisible: false,
  headerBackVisible: false,
  header: (props) => <AppStackHeader {...props} />,
  contentStyle: {
    backgroundColor: "transparent",
  },
};
