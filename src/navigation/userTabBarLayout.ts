import { useSafeAreaInsets } from "react-native-safe-area-context";

/**
 * Pencil 7MxmM — dark pill + gradient scrim. Content height ≈ pill pad + tab + icon + gap + label.
 */
export const USER_TAB_BAR_PILL_MIN_HEIGHT = 62;

/** Outer scrim: top padding (Pencil padding [12,21,21,21]) */
export const USER_TAB_BAR_PADDING_TOP = 12;

export const USER_TAB_BAR_PADDING_HORIZONTAL = 21;

/**
 * Inner padding under the pill, above the safe area (Pencil bottom 21 before home indicator).
 * Combined with `useSafeAreaInsets().bottom` in the tab bar container.
 */
export const USER_TAB_BAR_PADDING_BOTTOM_INNER = 21;

/**
 * Vertical space taken by the floating tab bar from the bottom of the screen
 * (safe area + padding + pill). Use for ScrollView `paddingBottom` on tab screens.
 */
export function userTabBarOccupiedHeight(insetsBottom: number): number {
  return (
    USER_TAB_BAR_PADDING_TOP +
    USER_TAB_BAR_PILL_MIN_HEIGHT +
    USER_TAB_BAR_PADDING_BOTTOM_INNER +
    insetsBottom
  );
}

/**
 * Extra `paddingBottom` for scroll/list content on User tab screens so the last
 * pixels stay above the floating tab bar + system navigation.
 */
export function useUserTabBarBottomInset(): number {
  const { bottom } = useSafeAreaInsets();
  return userTabBarOccupiedHeight(bottom);
}
