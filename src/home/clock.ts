// Numeric formatting guarantees 00:00 rather than locale-specific 24:00 at midnight.
export function clockTime(date: Date): string {
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}
export function clockDate(date: Date): string {
  const days = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
  const months = [
    "jan",
    "feb",
    "mar",
    "apr",
    "may",
    "jun",
    "jul",
    "aug",
    "sep",
    "oct",
    "nov",
    "dec",
  ];
  return `${days[date.getDay()]} ${date.getDate()} ${months[date.getMonth()]}`;
}
