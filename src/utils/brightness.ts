/**
 * Wrapper for expo-brightness. Gracefully degrades if the package is not installed.
 * Run `npx expo install expo-brightness` to enable Stealth Mode brightness control.
 */

export type BrightnessModule = {
  getBrightnessAsync: () => Promise<number>;
  setBrightnessAsync: (value: number) => Promise<void>;
  requestPermissionsAsync: () => Promise<{ status: string }>;
};

let brightnessModule: BrightnessModule | null = null;

try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  brightnessModule = require("expo-brightness") as BrightnessModule;
} catch {
  // expo-brightness not installed
}

export const isBrightnessAvailable = (): boolean => brightnessModule !== null;

export const getBrightnessAsync = async (): Promise<number> => {
  if (!brightnessModule) return 1;
  return brightnessModule.getBrightnessAsync();
};

export const setBrightnessAsync = async (value: number): Promise<void> => {
  if (!brightnessModule) return;
  await brightnessModule.setBrightnessAsync(value);
};

export const requestBrightnessPermissionsAsync = async (): Promise<{ status: string }> => {
  if (!brightnessModule) return { status: "denied" };
  return brightnessModule.requestPermissionsAsync();
};
