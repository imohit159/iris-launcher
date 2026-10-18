package expo.modules.dialfeedback

import android.content.Context
import android.media.AudioAttributes
import android.media.AudioManager
import android.media.SoundPool
import android.util.Log
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class DialFeedbackModule : Module() {
  private var pool: SoundPool? = null
  private var audio: AudioManager? = null
  private var sample = 0
  @Volatile private var ready = false
  private var reportedPlayback = false

  override fun definition() = ModuleDefinition {
    Name("DialFeedback")
    OnCreate {
      val context = appContext.reactContext ?: return@OnCreate
      audio = context.getSystemService(Context.AUDIO_SERVICE) as AudioManager
      val attributes = AudioAttributes.Builder()
        .setUsage(AudioAttributes.USAGE_ASSISTANCE_SONIFICATION)
        .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
        .build()
      pool = SoundPool.Builder().setMaxStreams(4).setAudioAttributes(attributes).build().also { sound ->
        sound.setOnLoadCompleteListener { _, _, status ->
          ready = status == 0
          if (status != 0) Log.w("IrisDialFeedback", "Click sample failed to load: $status")
        }
        sample = sound.load(context, R.raw.iris_click, 1)
      }
    }
    Function("click") {
      // Iris controls this sample independently of Android's optional touch sounds.
      // Silent and vibrate modes still take precedence over the app setting.
      if (ready && audio?.ringerMode == AudioManager.RINGER_MODE_NORMAL) {
        val stream = pool?.play(sample, 1f, 1f, 1, 0, 1f) ?: 0
        if (stream == 0) Log.w("IrisDialFeedback", "Click playback could not start")
        if (BuildConfig.DEBUG && stream != 0 && !reportedPlayback) {
          reportedPlayback = true
          Log.d("IrisDialFeedback", "Click sample loaded and playback started")
        }
      }
      null
    }
    OnDestroy {
      ready = false
      pool?.release()
      pool = null
      audio = null
    }
  }
}
