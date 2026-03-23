package com.nabilquran.app;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.util.Log;

/**
 * يستقبل BOOT_COMPLETED — لإعادة جدولة الأذان بعد إعادة تشغيل الجهاز
 * الجدولة الفعلية تتم من JS عند فتح التطبيق
 */
public class BootReceiver extends BroadcastReceiver {
    @Override
    public void onReceive(Context context, Intent intent) {
        if (Intent.ACTION_BOOT_COMPLETED.equals(intent.getAction())) {
            Log.d("BootReceiver", "Device booted — adhan will be rescheduled when app opens");
        }
    }
}
