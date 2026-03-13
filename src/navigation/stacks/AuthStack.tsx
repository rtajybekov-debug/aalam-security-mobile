import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { AuthStackParamList } from "../types";
import { LoginScreen } from "../../screens/common/LoginScreen";
import { RegisterScreen } from "../../screens/common/RegisterScreen";
import { ForgotPasswordScreen } from "../../screens/common/ForgotPasswordScreen";
import { ResetPasswordScreen } from "../../screens/common/ResetPasswordScreen";
import { TermsScreen } from "../../screens/common/TermsScreen";
import { PrivacyScreen } from "../../screens/common/PrivacyScreen";
import { appStackScreenOptions } from "../ui/AppStackShell";

const Stack = createNativeStackNavigator<AuthStackParamList>();

export const AuthStack = () => (
  <Stack.Navigator screenOptions={appStackScreenOptions}>
    <Stack.Screen name="Login" component={LoginScreen} options={{ title: "Login" }} />
    <Stack.Screen name="Register" component={RegisterScreen} options={{ title: "Register" }} />
    <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} options={{ title: "Reset password" }} />
    <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} options={{ title: "New password" }} />
    <Stack.Screen name="Terms" component={TermsScreen} options={{ title: "Terms of Service" }} />
    <Stack.Screen name="Privacy" component={PrivacyScreen} options={{ title: "Privacy Policy" }} />
  </Stack.Navigator>
);
