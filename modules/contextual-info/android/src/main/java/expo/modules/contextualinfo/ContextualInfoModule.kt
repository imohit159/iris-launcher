package expo.modules.contextualinfo

import android.Manifest
import android.app.AlarmManager
import android.content.Context
import android.content.pm.PackageManager
import android.provider.CalendarContract
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class ContextualInfoModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("ContextualInfo")

    AsyncFunction("getNextAlarm") {
      val context = appContext.reactContext ?: return@AsyncFunction null
      val alarm = context.getSystemService(Context.ALARM_SERVICE) as? AlarmManager
      alarm?.nextAlarmClock?.triggerTime
    }

    AsyncFunction("getNextCalendarEvent") {
      val context = appContext.reactContext ?: return@AsyncFunction null
      if (context.checkSelfPermission(Manifest.permission.READ_CALENDAR) != PackageManager.PERMISSION_GRANTED) {
        return@AsyncFunction null
      }
      val now = System.currentTimeMillis()
      val end = now + 7L * 24L * 60L * 60L * 1000L
      val uri = CalendarContract.Instances.CONTENT_URI.buildUpon()
        .appendPath(now.toString())
        .appendPath(end.toString())
        .build()
      val projection = arrayOf(
        CalendarContract.Instances.TITLE,
        CalendarContract.Instances.BEGIN,
        CalendarContract.Instances.EVENT_LOCATION,
      )
      context.contentResolver.query(
        uri,
        projection,
        null,
        null,
        "${CalendarContract.Instances.BEGIN} ASC",
      )?.use { cursor ->
        if (!cursor.moveToFirst()) return@AsyncFunction null
        val title = cursor.getString(0)?.trim().orEmpty()
        val start = cursor.getLong(1)
        if (title.isEmpty()) return@AsyncFunction null
        val location = cursor.getString(2)?.trim().orEmpty()
        buildMap<String, Any> {
          put("title", title.take(80))
          put("startAt", start)
          if (location.isNotEmpty()) put("location", location.take(80))
        }
      }
    }
  }
}
