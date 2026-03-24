// نظام الأذان والإشعارات — مبسّط ومضمون
import * as adhan from 'adhan'

const PRAYERS = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha']
const AR = { fajr: 'الفجر', dhuhr: 'الظهر', asr: 'العصر', maghrib: 'المغرب', isha: 'العشاء' }

function getPrayerTimes(lat, lng, method, date) {
  const coords = new adhan.Coordinates(lat, lng)
  const fn = adhan.CalculationMethod[method || 'Egyptian']
  const params = fn ? fn() : adhan.CalculationMethod.Egyptian()
  return new adhan.PrayerTimes(coords, date || new Date(), params)
}

// ─── الإشعارات (تعمل على الويب والموبايل) ─────────────────────────
export async function initNotifications(settings) {
  if (!settings.location) return

  // === 1. إشعارات الصلاة عبر Capacitor (Android) ===
  try {
    const { LocalNotifications } = await import('@capacitor/local-notifications')

    const perm = await LocalNotifications.requestPermissions()
    if (perm.display === 'denied') return

    // إنشاء القنوات
    await LocalNotifications.createChannel({ id: 'adhan', name: 'الأذان', importance: 5, sound: 'default', vibration: true }).catch(() => {})
    await LocalNotifications.createChannel({ id: 'salawat', name: 'صلي على النبي', importance: 3, sound: 'default', vibration: true }).catch(() => {})

    // إلغاء الإشعارات القديمة
    const oldIds = Array.from({ length: 300 }, (_, i) => ({ id: i + 1 }))
    await LocalNotifications.cancel({ notifications: oldIds }).catch(() => {})

    const now = new Date()
    const notifs = []

    // === إشعارات الصلاة (يومين) ===
    if (settings.adhanEnabled) {
      const minBefore = settings.notifMinutesBefore ?? 5

      for (let d = 0; d < 2; d++) {
        const day = new Date(now)
        day.setDate(day.getDate() + d)
        const pt = getPrayerTimes(settings.location.lat, settings.location.lng, settings.calcMethod, day)

        PRAYERS.forEach((key, i) => {
          const time = pt[key]
          if (!time || time <= now) return
          const id = d * 10 + i * 2 + 1

          // إشعار وقت الأذان
          notifs.push({
            id,
            title: `🕌 حان وقت صلاة ${AR[key]}`,
            body: 'حيّ على الصلاة ، حيّ على الفلاح',
            schedule: { at: time, allowWhileIdle: true },
            channelId: 'adhan',
            sound: 'default',
          })

          // إشعار قبل الأذان
          if (minBefore > 0) {
            const before = new Date(time.getTime() - minBefore * 60000)
            if (before > now) {
              notifs.push({
                id: id + 1,
                title: `⏰ ${AR[key]} بعد ${minBefore} دقائق`,
                body: `استعد لصلاة ${AR[key]}`,
                schedule: { at: before, allowWhileIdle: true },
                channelId: 'adhan',
              })
            }
          }
        })
      }
    }

    // === صلي على النبي ===
    if (settings.salawatEnabled) {
      const interval = settings.salawatInterval ?? 30
      const texts = [
        'اللهم صل وسلم على نبينا محمد ﷺ',
        'اللهم صل على محمد وعلى آل محمد ﷺ',
        'صلوا على الحبيب محمد ﷺ',
      ]
      const count = Math.min(Math.floor(720 / interval), 50)
      for (let i = 0; i < count; i++) {
        notifs.push({
          id: 100 + i,
          title: '🤲 صلي على النبي ﷺ',
          body: texts[i % texts.length],
          schedule: { at: new Date(now.getTime() + (i + 1) * interval * 60000), allowWhileIdle: true },
          channelId: 'salawat',
        })
      }
    }

    if (notifs.length) {
      await LocalNotifications.schedule({ notifications: notifs })
      console.log(`✅ جدولة ${notifs.length} إشعار`)
    }
  } catch (e) {
    // مش native — عادي
    console.log('Notifications: not on native platform')
  }

  // === 2. Web Notification Permission (للموقع) ===
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission()
  }
}

// ─── تشغيل صوت أذان (للويب — setTimeout) ─────────────────────────
export function setupWebAdhan(settings, audioRef) {
  if (!settings.adhanEnabled || !settings.location) return []
  if (window.Capacitor?.isNativePlatform?.()) return [] // native يستخدم AlarmManager

  const ADHAN_URLS = {
    makkah: 'https://www.islamcan.com/audio/adhan/azan1.mp3',
    madinah: 'https://www.islamcan.com/audio/adhan/azan2.mp3',
    egypt: 'https://www.islamcan.com/audio/adhan/azan3.mp3',
    mishary: 'https://www.islamcan.com/audio/adhan/azan4.mp3',
    turkish: 'https://www.islamcan.com/audio/adhan/azan5.mp3',
  }

  const now = new Date()
  const pt = getPrayerTimes(settings.location.lat, settings.location.lng, settings.calcMethod, now)
  const today = now.toDateString()
  const soundUrl = ADHAN_URLS[settings.adhanSound || 'makkah'] || ADHAN_URLS.makkah
  const timers = []

  const playAdhan = (key) => {
    const playKey = `adhan_${today}_${key}`
    if (localStorage.getItem(playKey)) return
    localStorage.setItem(playKey, '1')
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null }
    const audio = new Audio(soundUrl)
    audio.volume = 1.0
    audio.play().catch(() => {})
    audioRef.current = audio

    // Web notification كمان
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(`🕌 حان وقت صلاة ${AR[key]}`, { body: 'حيّ على الصلاة ، حيّ على الفلاح' })
    }
  }

  for (const key of PRAYERS) {
    const pTime = pt[key]
    if (!pTime) continue
    const ms = pTime.getTime() - now.getTime()
    if (ms > 0 && ms < 86400000) {
      timers.push(setTimeout(() => playAdhan(key), ms))
    } else if (ms >= -30000 && ms <= 0) {
      playAdhan(key)
    }
  }

  return timers
}
