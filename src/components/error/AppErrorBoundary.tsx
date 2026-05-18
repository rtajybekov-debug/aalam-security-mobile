import React, { Component, ErrorInfo, PropsWithChildren } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { AlertTriangle } from "lucide-react-native";
import { ru } from "../../locale/ru";
import { telemetry } from "../../services/telemetry";

interface State {
  hasError: boolean;
  error: Error | null;
}

export class AppErrorBoundary extends Component<PropsWithChildren, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    telemetry.captureException(error, { componentStack: info.componentStack });
    if (__DEV__) {
      console.error("[ErrorBoundary]", error, info);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <View style={styles.iconWrap}>
            <AlertTriangle size={32} color="#DC2626" strokeWidth={2} />
          </View>
          <Text style={styles.title}>{ru.misc.errorTitle}</Text>
          <Text style={styles.message}>
            {this.state.error?.message ?? ru.misc.errorFallback}
          </Text>
          <Pressable
            style={({ pressed }) => [styles.button, pressed && { opacity: 0.8 }]}
            onPress={() => this.setState({ hasError: false, error: null })}
            accessibilityRole="button"
            accessibilityLabel={ru.misc.tryAgainA11y}
          >
            <Text style={styles.buttonText}>{ru.misc.tryAgain}</Text>
          </Pressable>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0A0A0A",
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
    gap: 12,
  },
  iconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#3F1D1D",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#FFFFFF",
    textAlign: "center",
  },
  message: {
    fontSize: 14,
    color: "#A1A1AA",
    textAlign: "center",
    lineHeight: 22,
  },
  button: {
    marginTop: 12,
    backgroundColor: "#C4F82A",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 32,
  },
  buttonText: {
    color: "#0A0A0A",
    fontWeight: "700",
    fontSize: 15,
  },
});
