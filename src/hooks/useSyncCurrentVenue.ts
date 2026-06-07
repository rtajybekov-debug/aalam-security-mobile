import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "../stores/authStore";
import { useUserSessionStore } from "../stores/userSessionStore";
import { organizationApi } from "../api/modules/organization";

/**
 * Источник правды для привязки юзера к точке — это бэк (OrganizationMember.venueId).
 * Локальный `useUserSessionStore.currentVenueId` исторически писался только
 * руками при вводе invite-кода (BindVenueScreen) и сбрасывался при logout,
 * поэтому после релогина с другого устройства/после очистки хранилища SOS уходил
 * как PERSONAL (GPS) и в UI висело «Точка: не назначена», хотя в админке
 * привязка была. Этот хук гидрирует store по приходу /organization/my:
 *  - если у юзера есть membership с venueId — синхронизирует имя/id точки
 *  - если venueId нет (OWNER, member без точки) — чистит локальную привязку
 *  - реагирует на изменения с бэка (админ убрал venue / удалил точку)
 */
export function useSyncCurrentVenue() {
  const userId = useAuthStore((s) => s.user?.id);
  const role = useAuthStore((s) => s.role);
  const currentVenueId = useUserSessionStore((s) => s.currentVenueId);
  const setVenue = useUserSessionStore((s) => s.setVenue);
  const clearVenue = useUserSessionStore((s) => s.clearVenue);

  const enabled = Boolean(userId) && role === "USER";

  const { data } = useQuery({
    queryKey: ["organizations", userId],
    queryFn: organizationApi.getMyOrganizations,
    enabled,
    staleTime: 30_000,
  });

  React.useEffect(() => {
    if (!enabled || !data) return;

    const boundMembership = data.find((m) => Boolean(m.venueId));
    if (!boundMembership) {
      if (currentVenueId !== null) {
        void clearVenue();
      }
      return;
    }

    const venue = boundMembership.organization.venues.find(
      (v) => v.id === boundMembership.venueId,
    );
    if (!venue) {
      if (currentVenueId !== null) {
        void clearVenue();
      }
      return;
    }

    if (currentVenueId !== venue.id) {
      void setVenue(venue.id, venue.name);
    }
  }, [enabled, data, currentVenueId, setVenue, clearVenue]);
}
