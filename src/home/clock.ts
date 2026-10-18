// Match Detent: phone-controlled hour cycle, with no leading zero in 12-hour mode.
export function clockTime(date: Date, uses24hourClock: boolean): string {
  const hour = uses24hourClock
    ? String(date.getHours()).padStart(2, "0")
    : String(date.getHours() % 12 || 12);
  return `${hour}:${String(date.getMinutes()).padStart(2, "0")}`;
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
