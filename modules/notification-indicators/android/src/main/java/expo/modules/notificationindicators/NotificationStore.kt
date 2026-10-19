package expo.modules.notificationindicators

import android.content.Context

internal object NotificationStore {
  private const val preferences = "iris.notification.indicators"
  private const val packages = "active_packages"

  fun read(context: Context): Set<String> = context
    .getSharedPreferences(preferences, Context.MODE_PRIVATE)
    .getStringSet(packages, emptySet())
    ?.toSet()
    ?: emptySet()

  fun write(context: Context, values: Set<String>) {
    context
      .getSharedPreferences(preferences, Context.MODE_PRIVATE)
      .edit()
      .putStringSet(packages, values)
      .apply()
  }

  fun clear(context: Context) = write(context, emptySet())
}
