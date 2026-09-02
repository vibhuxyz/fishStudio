// The business runs entirely on India time. Services run with TZ=UTC and
// admins may open the panel from a laptop on any timezone, so a bare
// `new Date(x).toLocaleString()` silently shows whoever is looking a time in
// their own zone — which is how "the timestamps look wrong" bug reports start.
// Every customer-invisible timestamp (orders, audit logs, assignment times)
// should go through one of these so it always reads in IST.
const IST_TIMEZONE = "Asia/Kolkata";
const IST_LOCALE = "en-IN";

/** e.g. "2 Sept 2026" — for dates where the time of day doesn't matter. */
export function formatIstDate(
  value: string | number | Date | null | undefined,
  options: Intl.DateTimeFormatOptions = { day: "numeric", month: "short", year: "numeric" },
): string {
  if (value === null || value === undefined || value === "") return "";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString(IST_LOCALE, { ...options, timeZone: IST_TIMEZONE });
}

/** e.g. "2 Sept 2026, 4:35 pm" — for order placed / status change moments. */
export function formatIstDateTime(
  value: string | number | Date | null | undefined,
  options: Intl.DateTimeFormatOptions = {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  },
): string {
  if (value === null || value === undefined || value === "") return "";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString(IST_LOCALE, { ...options, timeZone: IST_TIMEZONE });
}
