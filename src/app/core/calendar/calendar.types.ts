/**
 * Plain-data representation of one calendar entry the agenda renders.
 *
 * Dates are serialized as ISO 8601 strings (not Date objects) so the
 * TransferState handoff from server SSR → browser hydration round-trips
 * through JSON cleanly. The browser deserializes them into Date instances
 * only when it actually needs to format a date for display.
 */
export interface CalendarEvent {
  uid: string;
  start: string;
  end: string;
  summary: string;
  location?: string;
  description?: string;
  allDay: boolean;
}
