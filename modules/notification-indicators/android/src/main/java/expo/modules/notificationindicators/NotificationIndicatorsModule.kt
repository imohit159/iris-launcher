package expo.modules.notificationindicators

import android.content.ComponentName
import android.content.Intent
import android.provider.Settings
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class NotificationIndicatorsModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("NotificationIndicators")

    AsyncFunction("isAccessGranted") {
      val context = appContext.reactContext ?: return@AsyncFunction false
      val enabled = Settings.Secure.getString(
        context.contentResolver,
        "enabled_notification_listeners",
      ) ?: return@AsyncFunction false
      enabled.split(":").any { value ->
        ComponentName.unflattenFromString(value)?.packageName == context.packageName
      }
    }

    AsyncFunction("getActivePackages") {
      val context = appContext.reactContext ?: return@AsyncFunction emptyList<String>()
      NotificationStore.read(context).toList()
    }

    Function("openSettings") {
      val context = appContext.reactContext ?: return@Function null
      context.startActivity(
        Intent(Settings.ACTION_NOTIFICATION_LISTENER_SETTINGS)
          .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK),
      )
      null
    }

    AsyncFunction("clear") {
      val context = appContext.reactContext ?: return@AsyncFunction null
      NotificationStore.clear(context)
      null
    }
  }
}
