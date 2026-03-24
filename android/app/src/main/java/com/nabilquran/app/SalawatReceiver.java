package com.nabilquran.app;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.os.PowerManager;
import android.speech.tts.TextToSpeech;
import android.util.Log;

import java.util.Locale;

public class SalawatReceiver extends BroadcastReceiver {

    @Override
    public void onReceive(Context context, Intent intent) {
        final String text = intent.getStringExtra("salawat_text") != null
            ? intent.getStringExtra("salawat_text")
            : "اللهم صل وسلم على نبينا محمد";

        Log.d("SalawatReceiver", "Salawat: " + text);

        final PowerManager pm = (PowerManager) context.getSystemService(Context.POWER_SERVICE);
        final PowerManager.WakeLock wl = pm.newWakeLock(PowerManager.PARTIAL_WAKE_LOCK, "nabilquran:salawat");
        wl.acquire(30000L);

        final TextToSpeech[] holder = new TextToSpeech[1];
        holder[0] = new TextToSpeech(context, new TextToSpeech.OnInitListener() {
            @Override
            public void onInit(int status) {
                if (status == TextToSpeech.SUCCESS) {
                    holder[0].setLanguage(new Locale("ar"));
                    holder[0].speak(text, TextToSpeech.QUEUE_FLUSH, null, "salawat_utterance");
                    holder[0].setOnUtteranceCompletedListener(new TextToSpeech.OnUtteranceCompletedListener() {
                        @Override
                        public void onUtteranceCompleted(String utteranceId) {
                            holder[0].shutdown();
                            if (wl.isHeld()) wl.release();
                        }
                    });
                } else {
                    if (wl.isHeld()) wl.release();
                }
            }
        });
    }
}
