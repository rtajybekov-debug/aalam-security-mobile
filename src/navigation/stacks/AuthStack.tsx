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
import { ru } from "../../locale/ru";

const Stack = createNativeStackNavigator<AuthStackParamList>();

export const AuthStack = () => (
  <Stack.Navigator screenOptions={appStackScreenOptions}>
    <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
    <Stack.Screen name="Register" component={RegisterScreen} options={{ headerShown: false }} />
    <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} options={{ title: ru.nav.resetPassword }} />
    <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} options={{ title: ru.nav.newPassword }} />
    <Stack.Screen name="Terms" component={TermsScreen} options={{ title: ru.nav.terms }} />
    <Stack.Screen name="Privacy" component={PrivacyScreen} options={{ title: ru.nav.privacy }} />
  </Stack.Navigator>
);
