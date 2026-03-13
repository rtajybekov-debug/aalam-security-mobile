import NetInfo from "@react-native-community/netinfo";

export const networkService = {
  subscribe(callback: (isOnline: boolean) => void) {
    return NetInfo.addEventListener((state) => {
      callback(Boolean(state.isConnected && state.isInternetReachable !== false));
    });
  },
};
