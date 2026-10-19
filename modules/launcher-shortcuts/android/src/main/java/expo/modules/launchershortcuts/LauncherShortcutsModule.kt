package expo.modules.launchershortcuts

import android.content.Context
import android.content.pm.LauncherApps
import android.os.Build
import android.os.Process
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class LauncherShortcutsModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("LauncherShortcuts")

    Function("isAvailable") {
      if (Build.VERSION.SDK_INT < Build.VERSION_CODES.N_MR1) return@Function false
      val context = appContext.reactContext ?: return@Function false
      val launcherApps = context.getSystemService(Context.LAUNCHER_APPS_SERVICE) as? LauncherApps
        ?: return@Function false
      launcherApps.hasShortcutHostPermission()
    }

    AsyncFunction("getShortcuts") { packageName: String ->
      if (Build.VERSION.SDK_INT < Build.VERSION_CODES.N_MR1) return@AsyncFunction emptyList<Map<String, Any>>()
      val context = appContext.reactContext ?: return@AsyncFunction emptyList<Map<String, Any>>()
      val launcherApps = context.getSystemService(Context.LAUNCHER_APPS_SERVICE) as? LauncherApps
        ?: return@AsyncFunction emptyList<Map<String, Any>>()
      if (!launcherApps.hasShortcutHostPermission()) return@AsyncFunction emptyList<Map<String, Any>>()
      try {
        val query = LauncherApps.ShortcutQuery()
          .setPackage(packageName)
          .setQueryFlags(
            LauncherApps.ShortcutQuery.FLAG_MATCH_DYNAMIC or
              LauncherApps.ShortcutQuery.FLAG_MATCH_MANIFEST or
              LauncherApps.ShortcutQuery.FLAG_MATCH_PINNED,
          )
        launcherApps.getShortcuts(query, Process.myUserHandle())
          ?.asSequence()
          ?.filter { it.isEnabled && !it.shortLabel.isNullOrBlank() }
          ?.distinctBy { it.id }
          ?.take(8)
          ?.map { shortcut ->
            buildMap<String, Any> {
              put("id", shortcut.id)
              put("label", shortcut.shortLabel.toString().take(48))
              if (!shortcut.longLabel.isNullOrBlank()) {
                put("longLabel", shortcut.longLabel.toString().take(80))
              }
            }
          }
          ?.toList()
          ?: emptyList()
      } catch (_: SecurityException) {
        emptyList()
      }
    }

    AsyncFunction("startShortcut") { packageName: String, shortcutId: String ->
      if (Build.VERSION.SDK_INT < Build.VERSION_CODES.N_MR1) return@AsyncFunction false
      val context = appContext.reactContext ?: return@AsyncFunction false
      val launcherApps = context.getSystemService(Context.LAUNCHER_APPS_SERVICE) as? LauncherApps
        ?: return@AsyncFunction false
      if (!launcherApps.hasShortcutHostPermission()) return@AsyncFunction false
      try {
        launcherApps.startShortcut(
          packageName,
          shortcutId,
          null,
          null,
          Process.myUserHandle(),
        )
        true
      } catch (_: SecurityException) {
        false
      } catch (_: IllegalArgumentException) {
        false
      }
    }
  }
}
