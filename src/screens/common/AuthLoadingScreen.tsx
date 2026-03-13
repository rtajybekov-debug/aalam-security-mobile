import React from "react";
import { LoadingState } from "../../components/state/LoadingState";
import { ScreenContainer } from "../../navigation/ui/ScreenContainer";

export const AuthLoadingScreen = () => {
  return (
    <ScreenContainer>
      <LoadingState label="Checking session..." caption="Restoring your secure access." />
    </ScreenContainer>
  );
};

