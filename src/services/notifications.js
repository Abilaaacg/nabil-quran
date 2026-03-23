// خدمة الإشعارات — تعمل حتى لو التطبيق مغلق
import * as adhan from 'adhan'

const isNative = () =>
  typeof window !== 'undefined' &&
  (window.Capacitor?.isNativePlatform?.() || navigator.userAgent?.includes('CapacitorWebView'))

let LN = null // LocalNotifications

async function getPlugin() {
  if (LN) return LN
  if (!isNative()) return null
  try {
    const m = await import('@capacitor/local-notifications')
    LN = m.LocalNotifications
    return LN
  } catch { return null }
}

const PRAYER_KEYS = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha']
const PRAYER_AR = { fajr: 'الفجر', dhuhr: 'الظهر', asr: 'العصر', maghrib: 'المغرب', isha: 'العشاء' }
const PRAYER_ICONS = { fajr: '🌙', dhuhr: '☀️', asr: '🌤', maghrib: '🌇', isha: '🌙' }

// ─── حساب أوقات الصلاة ────────────────────────────────────────
function calcTimes(lat, lng, methodId) {
  const coords = new adhan.Coordinates(lat, lng)
  const methodFn = adhan.CalculationMethod[methodId]
  const params = methodFn ? methodFn() : adhan.CalculationMethod.Egyptian()
  const pt = new adhan.PrayerTimes(coords, new Date(), params)
  return { fajr: pt.fajr, sunrise: pt.sunrise, dhuhr: pt.dhuhr, asr: pt.asr, maghrib: pt.maghrib, isha: pt.isha }
}

// ─── جدولة إشعارات الصلاة ──────────────────────────────────────
export async function schedulePrayerNotifications(settings) {
  const ln = await getPlugin()
  if (!ln || !settings.location) return

  try {
    await ln.requestPermissions()

    // قناة إشعارات الصلاة
    await ln.createChannel({
      id: 'prayer-notifs',
      name: 'تنبيهات الصلاة',
      importance: 5,
      sound: 'default',
      vibration: true,
    }).catch(() => {})

    // إلغاء الإشعارات القديمة (1-20: اليوم + بكره)
    await ln.cancel({ notifications: Array.from({ length: 20 }, (_, i) => ({ id: i + 1 })) }).catch(() => {})

    if (!settings.adhanEnabled) return

    const now = new Date()
    const minutesBefore = settings.notifMinutesBefore ?? 5
    const notifications = []

    // جدول إشعارات اليوم + بكره (عشان لو كل صلوات اليوم عدت)
    for (let dayOffset = 0; dayOffset <= 1; dayOffset++) {
      const day = new Date(now)
      day.setDate(day.getDate() + dayOffset)
      const times = calcTimes(settings.location.lat, settings.location.lng, settings.calcMethod || 'Egyptian')
      // لو بكره: احسب أوقات بكره
      if (dayOffset === 1) {
        const tomorrow = new Date(now)
        tomorrow.setDate(tomorrow.getDate() + 1)
        const coords = new adhan.Coordinates(settings.location.lat, settings.location.lng)
        const methodFn = adhan.CalculationMethod[settings.calcMethod || 'Egyptian']
        const params = methodFn ? methodFn() : adhan.CalculationMethod.Egyptian()
        const pt2 = new adhan.PrayerTimes(coords, tomorrow, params)
        Object.assign(times, { fajr: pt2.fajr, dhuhr: pt2.dhuhr, asr: pt2.asr, maghrib: pt2.maghrib, isha: pt2.isha })
      }

      PRAYER_KEYS.forEach((key, idx) => {
        const pt = times[key]
        if (!pt) return
        const baseId = dayOffset * 10

        // إشعار قبل الصلاة
        if (minutesBefore > 0) {
          const preBefore = new Date(pt.getTime() - minutesBefore * 60 * 1000)
          if (preBefore > now) {
            notifications.push({
              id: baseId + idx + 1,
              title: `${PRAYER_ICONS[key]} ${PRAYER_AR[key]} بعد ${minutesBefore} دقائق`,
              body: `استعد لصلاة ${PRAYER_AR[key]}`,
              schedule: { at: preBefore, allowWhileIdle: true },
              channelId: 'prayer-notifs',
              smallIcon: 'ic_notification',
            })
          }
        }

        // إشعار عند وقت الصلاة
        if (pt > now) {
          notifications.push({
            id: baseId + idx + 6,
            title: `🕌 حان وقت صلاة ${PRAYER_AR[key]}`,
            body: `حيّ على الصلاة — حيّ على الفلاح`,
            schedule: { at: pt, allowWhileIdle: true },
            channelId: 'prayer-notifs',
            smallIcon: 'ic_notification',
          })
        }
      })
    }

    if (notifications.length) await ln.schedule({ notifications })
  } catch (e) {
    console.warn('Prayer notifications error:', e)
  }
}

// ─── إشعارات "صلي على النبي" ──────────────────────────────────
export async function scheduleSalawatReminders(settings) {
  const ln = await getPlugin()
  if (!ln) return

  try {
    // قناة صلي على النبي
    await ln.createChannel({
      id: 'salawat-channel',
      name: 'صلي على النبي',
      importance: 3,
      sound: 'default',
      vibration: true,
    }).catch(() => {})

    // إلغاء الإشعارات القديمة (100-400)
    await ln.cancel({ notifications: Array.from({ length: 300 }, (_, i) => ({ id: i + 100 })) }).catch(() => {})

    if (!settings.salawatEnabled) return

    const intervalMin = settings.salawatInterval ?? 5
    const now = new Date()
    const notifications = []

    const salawatTexts = [
      'اللهم صل وسلم على نبينا محمد ﷺ',
      'اللهم صل على محمد وعلى آل محمد ﷺ',
      'صلوا على الحبيب محمد ﷺ',
      'اللهم صل وسلم وبارك على سيدنا محمد ﷺ',
      'من صلى عليّ صلاة صلى الله عليه بها عشرا ﷺ',
    ]

    // جدول إشعارات لمدة 12 ساعة
    const count = Math.min(Math.floor((12 * 60) / intervalMin), 200)
    for (let i = 0; i < count; i++) {
      const at = new Date(now.getTime() + (i + 1) * intervalMin * 60 * 1000)
      notifications.push({
        id: 100 + i,
        title: '🤲 صلي على النبي ﷺ',
        body: salawatTexts[i % salawatTexts.length],
        schedule: { at, allowWhileIdle: true },
        channelId: 'salawat-channel',
        smallIcon: 'ic_notification',
      })
    }

    if (notifications.length) await ln.schedule({ notifications })
  } catch (e) {
    console.warn('Salawat notifications error:', e)
  }
}

// ─── إلغاء كل الإشعارات ──────────────────────────────────────
export async function cancelAllNotifications() {
  const ln = await getPlugin()
  if (!ln) return
  try {
    const all = Array.from({ length: 400 }, (_, i) => ({ id: i + 1 }))
    await ln.cancel({ notifications: all }).catch(() => {})
  } catch {}
}

// ─── تشغيل كل الإشعارات حسب الإعدادات ────────────────────────
export async function initNotifications(settings) {
  await schedulePrayerNotifications(settings)
  await scheduleSalawatReminders(settings)
}
