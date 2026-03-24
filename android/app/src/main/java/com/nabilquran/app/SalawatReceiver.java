package com.nabilquran.app;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.media.AudioAttributes;
import android.media.MediaPlayer;
import android.media.RingtoneManager;
import android.net.Uri;
import android.os.PowerManager;
import android.speech.tts.TextToSpeech;
import android.util.Log;

import java.util.Locale;

/**
 * يشغل صوت "صلي على النبي" حتى لو التطبيق مغلق
 * يستخدم TTS (Text-to-Speech) لنطق الرسالة بصوت
 */
public class SalawatReceiver extends BroadcastReceiver {

    @Override
    public void onReceive(Context context, Intent intent) {
        String text = intent.getStringExtra("salawat_text");
        if (text == null) text = "اللهم صل وسلم على نبينا محمد";

        Log.d("SalawatReceiver", "Salawat reminder: " + text);

        // صحّي الجهاز
        PowerManager pm = (PowerManager) context.getSystemService(Context.POWER_SERVICE);
        PowerManager.WakeLock wl = pm.newWakeLock(
            PowerManager.PARTIAL_WAKE_LOCK, "nabilquran:salawat"
        );
        wl.acquire(30 * 1000L);

        // شغل صوت الإشعار الافتراضي
        try {
            Uri notifSound = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_NOTIFICATION);
            MediaPlayer mp = new MediaPlayer();
            mp.setAudioAttributes(
                new AudioAttributes.Builder()
                    .setUsage(AudioAttributes.USAGE_NOTIFICATION)
                    .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
                    .build()
            );
            mp.setDataSource(context, notifSound);
            mp.setOnPreparedListener(p -> p.start());
            mp.setOnCompletionListener(p -> {
                p.release();
                // بعد صوت الإشعار — انطق النص بـ TTS
                speakSalawat(context, text, wl);
            });
            mp.prepareAsync();
        } catch (Exception e) {
            Log.e("SalawatReceiver", "Error", e);
            speakSalawat(context, text, wl);
        }
    }

    private void speakSalawat(Context context, String text, PowerManager.WakeLock wl) {
        TextToSpeech tts = new TextToSpeech(context, status -> {
            if (status == TextToSpeech.SUCCESS) {
                // TTS موجود — نتحكم في اللغة
            }
        });

        // استنى TTS يبدأ واتكلم
        new android.os.Handler(android.os.Looper.getMainLooper()).postDelayed(() -> {
            try {
                tts.setLanguage(new Locale("ar"));
                tts.speak(text, TextToSpeech.QUEUE_FLUSH, null, "salawat");
                tts.setOnUtteranceCompletedListener(utteranceId -> {
                    tts.shutdown();
                    if (wl.isHeld()) wl.release();
                });
            } catch (Exception e) {
                tts.shutdown();
                if (wl.isHeld()) wl.release();
            }
        }, 500);
    }
}
