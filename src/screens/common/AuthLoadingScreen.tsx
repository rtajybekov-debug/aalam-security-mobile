import React from "react";
import { LoadingState } from "../../components/state/LoadingState";
import { ScreenContainer } from "../../navigation/ui/ScreenContainer";
import { ru } from "../../locale/ru";

export const AuthLoadingScreen = () => {
  return (
    <ScreenContainer>
      <LoadingState label={ru.system.authLoading} caption={ru.system.authCaption} />
    </ScreenContainer>
  );
};

