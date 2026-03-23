// خدمة الأذان والإشعارات — مثل تطبيق أنا مسلم
import * as adhan from 'adhan'

const isNative = () =>
  typeof window !== 'undefined' &&
  (window.Capacitor?.isNativePlatform?.() || navigator.userAgent?.includes('CapacitorWebView'))

let LN = null
async function getPlugin() {
  if (LN) return LN
  if (!isNative()) return null
  try {
    const m = await import('@capacitor/local-notifications')
    LN = m.LocalNotifications
    return LN
  } catch { return null }
}

const PRAYERS = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha']
const AR = { fajr: 'الفجر', dhuhr: 'الظهر', asr: 'العصر', maghrib: 'المغرب', isha: 'العشاء' }

function getPrayerTimes(lat, lng, method, date) {
  const coords = new adhan.Coordinates(lat, lng)
  const fn = adhan.CalculationMethod[method || 'Egyptian']
  const params = fn ? fn() : adhan.CalculationMethod.Egyptian()
  return new adhan.PrayerTimes(coords, date || new Date(), params)
}

// ─── جدولة إشعارات الصلاة (يومين) ──────────────────────────────
export async function schedulePrayerNotifications(settings) {
  console.log('🔔 schedulePrayerNotifications called', {
    isNative: isNative(),
    hasLocation: !!settings.location,
    adhanEnabled: settings.adhanEnabled,
    calcMethod: settings.calcMethod,
  })
  const ln = await getPlugin()
  if (!ln) { console.log('⚠️ LocalNotifications plugin not available'); return }
  if (!settings.location) { console.log('⚠️ No location set'); return }

  try {
    const perm = await ln.requestPermissions()
    if (perm.display === 'denied') return

    // قناة الأذان — أعلى أهمية
    await ln.createChannel({
      id: 'adhan-channel',
      name: 'الأذان وتنبيهات الصلاة',
      importance: 5,
      sound: 'default',
      vibration: true,
      lights: true,
      lightColor: '#6bc077',
    }).catch(() => {})

    // إلغاء القديم
    await ln.cancel({ notifications: Array.from({ length: 30 }, (_, i) => ({ id: i + 1 })) }).catch(() => {})

    if (!settings.adhanEnabled) return

    const now = new Date()
    const minBefore = settings.notifMinutesBefore ?? 5
    const notifs = []

    // جدول يومين (اليوم + بكره)
    for (let d = 0; d < 2; d++) {
      const day = new Date(now)
      day.setDate(day.getDate() + d)
      const pt = getPrayerTimes(settings.location.lat, settings.location.lng, settings.calcMethod, day)

      PRAYERS.forEach((key, i) => {
        const time = pt[key]
        if (!time || time <= now) return
        const base = d * 15 + i * 3

        // إشعار عند الأذان
        notifs.push({
          id: base + 1,
          title: `🕌 الله أكبر — حان وقت صلاة ${AR[key]}`,
          body: `حيّ على الصلاة ، حيّ على الفلاح`,
          schedule: { at: time, allowWhileIdle: true },
          channelId: 'adhan-channel',
          smallIcon: 'ic_launcher',
          sound: 'default',
        })

        // إشعار قبل الأذان
        if (minBefore > 0) {
          const before = new Date(time.getTime() - minBefore * 60000)
          if (before > now) {
            notifs.push({
              id: base + 2,
              title: `${AR[key]} بعد ${minBefore} دقائق`,
              body: `استعد لصلاة ${AR[key]}`,
              schedule: { at: before, allowWhileIdle: true },
              channelId: 'adhan-channel',
              smallIcon: 'ic_launcher',
            })
          }
        }
      })
    }

    if (notifs.length) {
      await ln.schedule({ notifications: notifs })
      console.log(`✅ Scheduled ${notifs.length} prayer notifications`)
      notifs.forEach(n => console.log(`  📌 ${n.title} @ ${new Date(n.schedule.at).toLocaleTimeString('ar-EG')}`))
    } else {
      console.log('⚠️ No prayer notifications to schedule (all prayers passed)')
    }
  } catch (e) {
    console.error('❌ Prayer notifications FAILED:', e)
  }
}

// ─── صلي على النبي ──────────────────────────────────────────────
export async function scheduleSalawatReminders(settings) {
  const ln = await getPlugin()
  if (!ln) return

  try {
    await ln.createChannel({
      id: 'salawat-channel',
      name: 'صلي على النبي ﷺ',
      importance: 3,
      sound: 'default',
      vibration: true,
    }).catch(() => {})

    await ln.cancel({ notifications: Array.from({ length: 200 }, (_, i) => ({ id: i + 100 })) }).catch(() => {})

    if (!settings.salawatEnabled) return

    const interval = settings.salawatInterval ?? 5
    const now = new Date()
    const texts = [
      'اللهم صل وسلم على نبينا محمد ﷺ',
      'اللهم صل على محمد وعلى آل محمد ﷺ',
      'صلوا على الحبيب محمد ﷺ',
      'اللهم صل وسلم وبارك على سيدنا محمد ﷺ',
      'من صلى عليّ صلاة صلى الله عليه بها عشرا ﷺ',
    ]

    const count = Math.min(Math.floor(720 / interval), 144)
    const notifs = []
    for (let i = 0; i < count; i++) {
      notifs.push({
        id: 100 + i,
        title: '🤲 صلي على النبي ﷺ',
        body: texts[i % texts.length],
        schedule: { at: new Date(now.getTime() + (i + 1) * interval * 60000), allowWhileIdle: true },
        channelId: 'salawat-channel',
        smallIcon: 'ic_notification',
      })
    }
    if (notifs.length) await ln.schedule({ notifications: notifs })
  } catch (e) {
    console.warn('Salawat:', e)
  }
}

// ─── جدولة الأذان الصوتي (native — يشتغل والتطبيق مغلق) ─────────
export async function scheduleNativeAdhan(settings) {
  if (!isNative() || !settings.location || !settings.adhanEnabled) return
  try {
    const { registerPlugin } = await import('@capacitor/core')
    const AdhanPlugin = registerPlugin('AdhanPlugin')

    const ADHAN_URLS = {
      makkah:  'https://www.islamcan.com/audio/adhan/azan1.mp3',
      madinah: 'https://www.islamcan.com/audio/adhan/azan2.mp3',
      egypt:   'https://www.islamcan.com/audio/adhan/azan3.mp3',
      mishary: 'https://www.islamcan.com/audio/adhan/azan4.mp3',
      turkish: 'https://www.islamcan.com/audio/adhan/azan5.mp3',
    }

    const now = new Date()
    const prayers = []

    for (let d = 0; d < 2; d++) {
      const day = new Date(now)
      day.setDate(day.getDate() + d)
      const pt = getPrayerTimes(settings.location.lat, settings.location.lng, settings.calcMethod, day)
      for (const key of PRAYERS) {
        const t = pt[key]
        if (t && t.getTime() > now.getTime()) {
          prayers.push({ time: t.getTime(), name: AR[key] })
        }
      }
    }

    await AdhanPlugin.scheduleAdhan({
      prayers,
      adhanUrl: ADHAN_URLS[settings.adhanSound || 'makkah'] || ADHAN_URLS.makkah,
    })
  } catch (e) {
    console.warn('Native adhan scheduling:', e)
  }
}

// ─── تشغيل الكل ─────────────────────────────────────────────────
export async function initNotifications(settings) {
  await schedulePrayerNotifications(settings)
  await scheduleSalawatReminders(settings)
  await scheduleNativeAdhan(settings)
}
