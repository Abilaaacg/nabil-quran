package com.nabilquran.app;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.media.AudioAttributes;
import android.media.MediaPlayer;
import android.net.Uri;
import android.os.PowerManager;
import android.util.Log;

/**
 * يستقبل الـ Alarm ويشغل الأذان حتى لو التطبيق مغلق
 */
public class AdhanReceiver extends BroadcastReceiver {

    private static MediaPlayer sPlayer;

    @Override
    public void onReceive(Context context, Intent intent) {
        String url = intent.getStringExtra("adhan_url");
        String prayer = intent.getStringExtra("prayer_name");
        if (url == null || url.isEmpty()) return;

        Log.d("AdhanReceiver", "Playing adhan for: " + prayer);

        // صحّي الجهاز
        PowerManager pm = (PowerManager) context.getSystemService(Context.POWER_SERVICE);
        PowerManager.WakeLock wl = pm.newWakeLock(
            PowerManager.PARTIAL_WAKE_LOCK, "nabilquran:adhan"
        );
        wl.acquire(5 * 60 * 1000L); // 5 دقائق max

        try {
            if (sPlayer != null) {
                sPlayer.stop();
                sPlayer.release();
                sPlayer = null;
            }

            sPlayer = new MediaPlayer();
            sPlayer.setAudioAttributes(
                new AudioAttributes.Builder()
                    .setUsage(AudioAttributes.USAGE_ALARM)
                    .setContentType(AudioAttributes.CONTENT_TYPE_MUSIC)
                    .build()
            );
            sPlayer.setDataSource(context, Uri.parse(url));
            sPlayer.setOnPreparedListener(mp -> mp.start());
            sPlayer.setOnCompletionListener(mp -> {
                mp.release();
                sPlayer = null;
                if (wl.isHeld()) wl.release();
            });
            sPlayer.setOnErrorListener((mp, what, extra) -> {
                mp.release();
                sPlayer = null;
                if (wl.isHeld()) wl.release();
                return true;
            });
            sPlayer.prepareAsync();
        } catch (Exception e) {
            Log.e("AdhanReceiver", "Error playing adhan", e);
            if (wl.isHeld()) wl.release();
        }
    }
}
