
export function cn(...inputs: (string | undefined | null | false)[]) {
  return inputs.filter(Boolean).join(" ");
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat("ar-MA", {
    style: "currency",
    currency: "MAD",
  }).format(amount);
}

/** "YYYY-MM" key for a Date or for an expense date string ("YYYY-MM-DD"). */
export function monthKey(date: Date | string): string {
  if (typeof date === "string") return date.substring(0, 7);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

/** "YYYY-MM" key for the month we are currently in. */
export function currentMonthKey(): string {
  return monthKey(new Date());
}

/** "2026-08" → "August 2026" (or "August" when year is dropped). */
export function formatMonthLabel(key: string, withYear = true): string {
  return new Date(`${key}-01T12:00:00Z`).toLocaleDateString("en-US", {
    month: "long",
    ...(withYear ? { year: "numeric" } : {}),
    timeZone: "UTC",
  });
}

/** First day of the month after `key`, e.g. "2026-08" → "September 1". */
export function nextMonthStartLabel(key: string): string {
  const [y, m] = key.split("-").map(Number);
  const next = new Date(Date.UTC(m === 12 ? y + 1 : y, m === 12 ? 0 : m, 1));
  return next.toLocaleDateString("en-US", { month: "long", day: "numeric", timeZone: "UTC" });
}

export function getErrorMessage(error: any): string {
  const message = error?.message || error?.error_description || "An unexpected error occurred";
  if (message === "Failed to fetch") {
    return "Unable to connect to the server. Please check your internet connection.";
  }
  return message;
}
