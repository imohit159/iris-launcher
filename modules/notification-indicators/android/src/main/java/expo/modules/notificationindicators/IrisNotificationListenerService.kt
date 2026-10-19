package expo.modules.notificationindicators

import android.service.notification.NotificationListenerService
import android.service.notification.StatusBarNotification

class IrisNotificationListenerService : NotificationListenerService() {
  override fun onNotificationPosted(sbn: StatusBarNotification) {
    updatePackage(sbn.packageName, add = true)
  }

  override fun onNotificationRemoved(sbn: StatusBarNotification) {
    val active = activeNotifications
      ?.map(StatusBarNotification::getPackageName)
      ?.toSet()
      ?: emptySet()
    NotificationStore.write(this, active)
  }

  override fun onListenerDisconnected() {
    NotificationStore.clear(this)
    super.onListenerDisconnected()
  }

  private fun updatePackage(packageName: String, add: Boolean) {
    if (packageName == applicationContext.packageName) return
    val active = NotificationStore.read(this).toMutableSet()
    if (add) active.add(packageName) else active.remove(packageName)
    NotificationStore.write(this, active)
  }
}
