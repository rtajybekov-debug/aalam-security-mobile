import { useEffect, useRef, useState } from "react";
import { useEmergencyStore } from "../stores/emergencyStore";
import { networkService } from "../services/networkService";
import { emergencyApi } from "../api/modules/emergency";

/**
 * Watches network connectivity and, on reconnect, drains the persisted
 * location queue against the server. Also exposes the current connectivity
 * state so the UI can render an offline banner.
 *
 * Hydration of AsyncStorage queues runs on first mount; the call is idempotent
 * because the store guards against repeated hydration via isOfflineQueuesHydrated.
 */
export const useOfflineFlush = () => {
  const [isOnline, setIsOnline] = useState(true);
  const isFlushingRef = useRef(false);
  const isOnlineRef = useRef(true);

  const pendingQueueLength = useEmergencyStore((state) => state.pendingLocationQueue.length);

  useEffect(() => {
    void useEmergencyStore.getState().hydrateOfflineQueues();
  }, []);

  useEffect(() => {
    isOnlineRef.current = isOnline;
  }, [isOnline]);

  useEffect(() => {
    const flush = async () => {
      if (isFlushingRef.current) return;
      isFlushingRef.current = true;
      try {
        while (true) {
          if (!isOnlineRef.current) break;
          const queue = useEmergencyStore.getState().pendingLocationQueue;
          if (queue.length === 0) break;
          const point = queue[0];
          try {
            await emergencyApi.sendLocation(point.sessionId, {
              latitude: point.latitude,
              longitude: point.longitude,
              accuracy: point.accuracy,
            });
            await useEmergencyStore.getState().dequeueLocations(1);
          } catch {
            // Stop on first failure — we'll resume on the next reconnect.
            break;
          }
        }
      } finally {
        isFlushingRef.current = false;
      }
    };

    const unsubscribe = networkService.subscribe((online) => {
      setIsOnline(online);
      if (online) {
        void flush();
      }
    });

    return unsubscribe;
  }, []);

  // Re-attempt flush when the queue grows while online (e.g. capture fails then
  // the next attempt succeeds: we want to keep draining without waiting for a
  // network event).
  useEffect(() => {
    if (!isOnline || pendingQueueLength === 0 || isFlushingRef.current) return;
    let cancelled = false;
    const tick = async () => {
      if (cancelled) return;
      if (isFlushingRef.current) return;
      isFlushingRef.current = true;
      try {
        const queue = useEmergencyStore.getState().pendingLocationQueue;
        if (queue.length === 0) return;
        const point = queue[0];
        await emergencyApi.sendLocation(point.sessionId, {
          latitude: point.latitude,
          longitude: point.longitude,
          accuracy: point.accuracy,
        });
        await useEmergencyStore.getState().dequeueLocations(1);
      } catch {
        // Swallow: NetInfo subscription will retry on next reconnect.
      } finally {
        isFlushingRef.current = false;
      }
    };
    void tick();
    return () => {
      cancelled = true;
    };
  }, [isOnline, pendingQueueLength]);

  return { isOnline, pendingQueueLength };
};
