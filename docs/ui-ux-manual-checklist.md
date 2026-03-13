# UI/UX Manual Checklist

## USER role
- Login and Register forms validate and submit correctly.
- SOS button supports long-press and confirm dialog trigger.
- Haptics fire on SOS press and on confirmed trigger.
- Active emergency screen shows status, timer, and close action feedback.
- History loads skeleton, list, and empty state correctly.
- Emergency details opens from history item and shows status badge.

## OPERATOR role
- Dashboard renders websocket/heartbeat card and active sessions list.
- Session details supports claim/start progress/resolve actions.
- Resolve modal validates required resolution note.
- Live map shows marker, follows location updates, and handles no-location fallback.
- History renders status chips and resolution text.

## ADMIN role
- Admin home CTA opens create operator flow.
- Create operator form validates and displays submit loading.
- Success screen returns to admin home.

## Common/System
- Profile shows account card and logout action.
- Forbidden screen shows role-safe sign-out path.
- Offline screen renders retry CTA and explanatory message.
- Splash and AuthLoading screens use unified loading visuals.

## Theme/Accessibility
- Verify light mode and dark mode across all role screens.
- Verify touch targets remain >= 44px for all critical actions.
- Verify screen reader labels on SOS, resolve, claim/start progress, and logout.
- Verify reduced motion disables SOS pulse/heartbeat animations.

## Device/Performance
- Verify small screens (e.g., 4.7 inch) for clipping and overflow.
- Verify list scrolling remains smooth with 50+ items.
- Verify SOS animation performance and map transitions remain responsive.
