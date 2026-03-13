import React from "react";
import { ActionButton } from "../ui/ActionButton";

interface Props {
  onPress: () => void;
  label?: string;
}

export const RetryButton = ({ onPress, label = "Try again" }: Props) => (
  <ActionButton variant="secondary" label={label} onPress={onPress} />
);
