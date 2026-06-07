import { useEffect } from "react";
import { useEmergencyStore } from "../stores/emergencyStore";
import { useOperatorStore } from "../stores/operatorStore";
import { useWebsocketStore } from "../stores/websocketStore";
import { socketService } from "../services/socketService";
import { sosSoundService } from "../services/sosSoundService";
import { useAuthStore } from "../stores/authStore";
import { EmergencySession } from "../types/emergency";
import { toastBus } from "../ui/feedback/toastBus";
import { ru } from "../locale/ru";

export const useEmergencySocketEvents = () => {
  const token = useAuthStore((state) => state.accessToken);
  const role = useAuthStore((state) => state.role);
  const setConnected = useWebsocketStore((state) => state.setConnected);
  const setReconnecting = useWebsocketStore((state) => state.setReconnecting);
  const markEvent = useWebsocketStore((state) => state.markEvent);
  const setActiveSession = useEmergencyStore((state) => state.setActiveSession);
  const setSelectedSession = useOperatorStore((state) => state.setSelectedSession);
  const setLiveLocation = useOperatorStore((state) => state.setLiveLocation);
  const upsertActiveSession = useOperatorStore((state) => state.upsertActiveSession);
  const setLiveLocationForSession = useOperatorStore((state) => state.setLiveLocationForSession);

  useEffect(() => {
    if (!token) {
      socketService.disconnect();
      setConnected(false);
      setReconnecting(false);
      return;
    }

    const socket = socketService.connect(token);
    const onConnect = () => {
      setConnected(true);
      setReconnecting(false);
    };
    const onDisconnect = () => setConnected(false);
    const onReconnectAttempt = () => setReconnecting(true);
    const onConnectError = (err: Error) => {
      const msg = err?.message ?? "";
      if (msg.includes("401") || msg.toLowerCase().includes("unauthorized") || msg.toLowerCase().includes("auth")) {
        useAuthStore.getState().logout();
      }
    };
    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("reconnect_attempt", onReconnectAttempt);
    socket.on("connect_error", onConnectError);

    const onSessionEvent = (payload: EmergencySession) => {
      markEvent();
      if (role === "USER") {
        // A CLOSED status always clears. Otherwise only refresh the session
        // that is still active locally — never revive one we've already
        // cleared (e.g. after an operator/admin closed it).
        if (payload.status === "CLOSED") {
          setActiveSession(null);
        } else {
          const current = useEmergencyStore.getState().activeSession;
          if (current && current.id === payload.id) {
            setActiveSession(payload);
          }
        }
      }
      if (role === "OPERATOR") {
        if (payload.status !== "CLOSED") {
          setSelectedSession(payload);
        }
        upsertActiveSession(payload);
      }
    };

    const onEmergencyNew = async (payload: EmergencySession) => {
      markEvent();
      if (role === "OPERATOR") {
          await sosSoundService.playAlarm();
      }
      onSessionEvent(payload);
    };

    const onSessionClosed = (payload: EmergencySession) => {
      markEvent();
      if (role === "USER") {
        setActiveSession(null);
      }
      if (role === "OPERATOR") {
        upsertActiveSession(payload);
        // Clear selectedSession if it's the one being closed
        const current = useOperatorStore.getState().selectedSession;
        if (current?.id === payload.id) {
          setSelectedSession(null);
        }
      }
    };

    socket.on("emergency:new", onEmergencyNew);
    socket.on("emergency:assigned", onSessionEvent);
    socket.on("emergency:in_progress", onSessionEvent);
    socket.on("emergency:closed", onSessionClosed);
    socket.on("emergency:reassigned", onSessionEvent);
    const onLocationUpdate = (payload: {
      session: EmergencySession;
      location: { latitude: number; longitude: number; accuracy: number };
    }) => {
      markEvent();
      if (role === "USER") {
        // Guard against the revive race: the native tracker can emit one last
        // location update right after the session was closed. Only apply it if
        // this session is still the active one, and clear on CLOSED.
        const current = useEmergencyStore.getState().activeSession;
        if (current && current.id === payload.session.id) {
          if (payload.session.status === "CLOSED") {
            setActiveSession(null);
          } else {
            setActiveSession(payload.session);
          }
        }
      }
      if (role === "OPERATOR") {
        setSelectedSession(payload.session);
        setLiveLocation(payload.location);
        upsertActiveSession(payload.session);
        setLiveLocationForSession(payload.session.id, payload.location);
      }
    };

    socket.on("emergency:location_update", onLocationUpdate);

    const onSubscriptionApproved = (_payload: {
      requestId: string;
      expiresAt: string | null;
    }) => {
      markEvent();
      if (role === "USER") {
        void useAuthStore.getState().refreshMe();
        toastBus.show({
          message: ru.subscriptionRequest.approvedToast,
          severity: "success",
        });
      }
    };
    const onSubscriptionRejected = (payload: {
      requestId: string;
      reason: string | null;
    }) => {
      markEvent();
      if (role === "USER") {
        toastBus.show({
          message: payload.reason
            ? `${ru.subscriptionRequest.rejectedToast}: ${payload.reason}`
            : ru.subscriptionRequest.rejectedToast,
          severity: "error",
        });
      }
    };
    socket.on("subscription:approved", onSubscriptionApproved);
    socket.on("subscription:rejected", onSubscriptionRejected);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("reconnect_attempt", onReconnectAttempt);
      socket.off("connect_error", onConnectError);
      socket.off("emergency:new", onEmergencyNew);
      socket.off("emergency:assigned", onSessionEvent);
      socket.off("emergency:in_progress", onSessionEvent);
      socket.off("emergency:closed", onSessionClosed);
      socket.off("emergency:reassigned", onSessionEvent);
      socket.off("emergency:location_update", onLocationUpdate);
      socket.off("subscription:approved", onSubscriptionApproved);
      socket.off("subscription:rejected", onSubscriptionRejected);
    };
  }, [
    markEvent,
    role,
    setActiveSession,
    setConnected,
    setLiveLocation,
    setLiveLocationForSession,
    setReconnecting,
    setSelectedSession,
    upsertActiveSession,
    token,
  ]);
};
