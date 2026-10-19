package expo.modules.mediacontrols

import android.content.ComponentName
import android.content.Context
import android.media.MediaMetadata
import android.media.session.MediaController
import android.media.session.MediaSessionManager
import android.os.Build
import android.provider.Settings
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class MediaControlsModule : Module() {
  private val listenerClass =
    "expo.modules.notificationindicators.IrisNotificationListenerService"

  override fun definition() = ModuleDefinition {
    Name("MediaControls")

    Function("isAccessGranted") {
      val context = appContext.reactContext ?: return@Function false
      val enabled = Settings.Secure.getString(
        context.contentResolver,
        "enabled_notification_listeners",
      ) ?: return@Function false
      enabled.split(":").any { value ->
        ComponentName.unflattenFromString(value)?.packageName == context.packageName
      }
    }

    AsyncFunction("getState") {
      val context = appContext.reactContext ?: return@AsyncFunction null
      if (Build.VERSION.SDK_INT < Build.VERSION_CODES.LOLLIPOP) return@AsyncFunction null
      val controller = findController(context) ?: return@AsyncFunction null
      val metadata = controller.metadata
      val state = controller.playbackState
      val actions = state?.actions ?: 0L
      buildMap<String, Any> {
        put("packageName", controller.packageName)
        put("title", metadata?.getString(MediaMetadata.METADATA_KEY_TITLE)?.take(120) ?: "")
        metadata?.getString(MediaMetadata.METADATA_KEY_ARTIST)?.takeIf { it.isNotBlank() }?.let {
          put("artist", it.take(120))
        }
        put(
          "playing",
          state?.state == android.media.session.PlaybackState.STATE_PLAYING ||
            state?.state == android.media.session.PlaybackState.STATE_BUFFERING,
        )
        put(
          "canPlay",
          actions and android.media.session.PlaybackState.ACTION_PLAY != 0L,
        )
        put(
          "canPause",
          actions and android.media.session.PlaybackState.ACTION_PAUSE != 0L,
        )
        put(
          "canNext",
          actions and android.media.session.PlaybackState.ACTION_SKIP_TO_NEXT != 0L,
        )
        put(
          "canPrevious",
          actions and android.media.session.PlaybackState.ACTION_SKIP_TO_PREVIOUS != 0L,
        )
      }
    }

    AsyncFunction("control") { action: String ->
      val context = appContext.reactContext ?: return@AsyncFunction false
      val controller = findController(context) ?: return@AsyncFunction false
      when (action) {
        "play" -> controller.transportControls.play()
        "pause" -> controller.transportControls.pause()
        "next" -> controller.transportControls.skipToNext()
        "previous" -> controller.transportControls.skipToPrevious()
        else -> return@AsyncFunction false
      }
      true
    }
  }

  private fun findController(context: Context): MediaController? {
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.LOLLIPOP) return null
    val manager = context.getSystemService(Context.MEDIA_SESSION_SERVICE) as? MediaSessionManager
      ?: return null
    return try {
      val component = ComponentName(context.packageName, listenerClass)
      manager.getActiveSessions(component)
        .firstOrNull { it.metadata != null || it.playbackState != null }
    } catch (_: SecurityException) {
      null
    }
  }
}
