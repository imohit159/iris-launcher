package expo.modules.dialfeedback

import android.content.Context
import android.media.AudioManager
import android.provider.Settings
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class DialFeedbackModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("DialFeedback")
    Function("click") {
      val context = appContext.reactContext ?: return@Function
      val audio = context.getSystemService(Context.AUDIO_SERVICE) as AudioManager
      if (audio.ringerMode == AudioManager.RINGER_MODE_NORMAL &&
        Settings.System.getInt(context.contentResolver, Settings.System.SOUND_EFFECTS_ENABLED, 1) != 0) {
        audio.playSoundEffect(AudioManager.FX_KEY_CLICK)
      }
    }
  }
}
