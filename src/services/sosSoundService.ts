import { Audio, InterruptionModeIOS, InterruptionModeAndroid } from "expo-av";

const ALARM_SOURCE = require("../../assets/sounds/alarm.mp3");

async function ensureAudioMode() {
  await Audio.setAudioModeAsync({
    allowsRecordingIOS: false,
    playsInSilentModeIOS: true,
    staysActiveInBackground: true,
    shouldDuckAndroid: false,
    playThroughEarpieceAndroid: false,
    interruptionModeIOS: InterruptionModeIOS.DoNotMix,
    interruptionModeAndroid: InterruptionModeAndroid.DoNotMix,
  });
}

export const sosSoundService = {
  async playAlarm(): Promise<void> {
    try {
      await ensureAudioMode();
      const { sound } = await Audio.Sound.createAsync(ALARM_SOURCE);
      await sound.playAsync();
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish && !status.isLooping) {
          sound.unloadAsync().catch(() => {});
        }
      });
    } catch (e) {
      if (__DEV__) console.warn("[sosSoundService] playAlarm error:", e);
    }
  },
};
