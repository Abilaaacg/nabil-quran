package com.nabilquran.app;

import android.app.AlarmManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.os.Build;
import android.util.Log;

import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import org.json.JSONObject;

/**
 * Capacitor plugin لجدولة الأذان عبر AlarmManager
 * يعمل حتى لو التطبيق مغلق تماماً
 */
@CapacitorPlugin(name = "AdhanPlugin")
public class AdhanPlugin extends Plugin {

    private static final int BASE_REQUEST_CODE = 5000;

    @PluginMethod
    public void scheduleAdhan(PluginCall call) {
        JSArray prayers = call.getArray("prayers");
        String adhanUrl = call.getString("adhanUrl", "");

        if (prayers == null || adhanUrl.isEmpty()) {
            call.reject("prayers and adhanUrl required");
            return;
        }

        Context context = getContext();
        AlarmManager am = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);

        // إلغاء الأذانات القديمة (IDs 5000-5019)
        for (int i = 0; i < 20; i++) {
            Intent intent = new Intent(context, AdhanReceiver.class);
            PendingIntent pi = PendingIntent.getBroadcast(
                context, BASE_REQUEST_CODE + i, intent,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
            );
            am.cancel(pi);
        }

        try {
            for (int i = 0; i < prayers.length(); i++) {
                JSONObject p = prayers.getJSONObject(i);
                long timeMs = p.getLong("time");
                String name = p.getString("name");

                if (timeMs <= System.currentTimeMillis()) continue;

                Intent intent = new Intent(context, AdhanReceiver.class);
                intent.putExtra("adhan_url", adhanUrl);
                intent.putExtra("prayer_name", name);

                PendingIntent pi = PendingIntent.getBroadcast(
                    context, BASE_REQUEST_CODE + i, intent,
                    PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
                );

                // جدولة الأذان — مع fallback لو الصلاحية مش متاحة
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S && !am.canScheduleExactAlarms()) {
                    // Android 12+ بدون صلاحية exact — استخدم inexact (بيشتغل بس مش دقيق 100%)
                    am.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, timeMs, pi);
                } else if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                    am.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, timeMs, pi);
                } else {
                    am.setExact(AlarmManager.RTC_WAKEUP, timeMs, pi);
                }

                Log.d("AdhanPlugin", "Scheduled adhan for " + name + " at " + timeMs);
            }
        } catch (Exception e) {
            call.reject("Error scheduling: " + e.getMessage());
            return;
        }

        call.resolve();
    }

    @PluginMethod
    public void scheduleSalawat(PluginCall call) {
        int intervalMinutes = call.getInt("intervalMinutes", 30);
        int count = call.getInt("count", 24);

        Context context = getContext();
        AlarmManager am = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);

        String[] texts = {
            "اللهم صل وسلم على نبينا محمد",
            "اللهم صل على محمد وعلى آل محمد",
            "صلوا على الحبيب محمد",
        };

        // إلغاء القديم (IDs 6000-6099)
        for (int i = 0; i < 100; i++) {
            Intent intent = new Intent(context, SalawatReceiver.class);
            PendingIntent pi = PendingIntent.getBroadcast(
                context, 6000 + i, intent,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
            );
            am.cancel(pi);
        }

        long now = System.currentTimeMillis();
        for (int i = 0; i < count && i < 100; i++) {
            long triggerAt = now + (long)(i + 1) * intervalMinutes * 60 * 1000;

            Intent intent = new Intent(context, SalawatReceiver.class);
            intent.putExtra("salawat_text", texts[i % texts.length]);

            PendingIntent pi = PendingIntent.getBroadcast(
                context, 6000 + i, intent,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
            );

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                am.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, triggerAt, pi);
            } else {
                am.set(AlarmManager.RTC_WAKEUP, triggerAt, pi);
            }
        }

        Log.d("AdhanPlugin", "Scheduled " + count + " salawat reminders every " + intervalMinutes + " min");
        call.resolve();
    }

    @PluginMethod
    public void cancelAll(PluginCall call) {
        Context context = getContext();
        AlarmManager am = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);

        // cancel adhan alarms
        for (int i = 0; i < 20; i++) {
            Intent intent = new Intent(context, AdhanReceiver.class);
            PendingIntent pi = PendingIntent.getBroadcast(
                context, BASE_REQUEST_CODE + i, intent,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
            );
            am.cancel(pi);
        }

        // cancel salawat alarms
        for (int i = 0; i < 100; i++) {
            Intent intent = new Intent(context, SalawatReceiver.class);
            PendingIntent pi = PendingIntent.getBroadcast(
                context, 6000 + i, intent,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
            );
            am.cancel(pi);
        }

        call.resolve();
    }
}
