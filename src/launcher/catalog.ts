export type App = { label: string; packageName: string; icon: string };
export function catalog(items: App[]): App[] {
  return [
    ...new Map(
      items
        .filter(
          (app) =>
            app.packageName &&
            app.label &&
            app.packageName !== "com.irislauncher",
        )
        .map((app) => [app.packageName, app]),
    ).values(),
  ].sort((a, b) => a.label.localeCompare(b.label));
}
export function search(
  items: App[],
  query: string,
  categories: Record<string, string> = {},
): App[] {
  const normalized = query.trim().toLocaleLowerCase();
  return items.filter((app) =>
    app.label.toLocaleLowerCase().includes(normalized) ||
    (categories[app.packageName] ?? "").toLocaleLowerCase().includes(normalized),
  );
}
export function favorites(items: App[], ids: string[]): App[] {
  return items.filter((app) => ids.includes(app.packageName));
}
export function iconUri(icon: string): string {
  return /^(file:|content:|data:)/.test(icon)
    ? icon
    : icon.startsWith("/")
      ? `file://${icon}`
      : `data:image/png;base64,${icon}`;
}
export function letterIndex(items: App[], letter: string): number {
  return items.findIndex((app) =>
    app.label.toLocaleUpperCase().startsWith(letter),
  );
}
