import { useEffect, useState } from 'react'

const isNative = () =>
  typeof window !== 'undefined' &&
  (window.Capacitor?.isNativePlatform?.() || navigator.userAgent?.includes('CapacitorWebView'))

export default function PermissionRequest() {
  const [asked, setAsked] = useState(() => localStorage.getItem('perms_asked') === '1')

  useEffect(() => {
    if (asked || !isNative()) return
    requestAll()
  }, [asked])

  async function requestAll() {
    try {
      // إشعارات
      const { LocalNotifications } = await import('@capacitor/local-notifications')
      await LocalNotifications.requestPermissions()

      // قناة الأذان
      await LocalNotifications.createChannel({
        id: 'adhan-channel', name: 'الأذان وتنبيهات الصلاة',
        importance: 5, sound: 'default', vibration: true,
      }).catch(() => {})

      await LocalNotifications.createChannel({
        id: 'salawat-channel', name: 'صلي على النبي ﷺ',
        importance: 3, sound: 'default', vibration: true,
      }).catch(() => {})

      // موقع
      try {
        const { Geolocation } = await import('@capacitor/geolocation')
        await Geolocation.requestPermissions()
      } catch {}

      // Exact Alarm permission (Android 12+)
      try {
        const { registerPlugin } = await import('@capacitor/core')
        const AdhanPlugin = registerPlugin('AdhanPlugin')
        await AdhanPlugin.checkExactAlarmPermission?.().catch(() => {})
      } catch {}

    } catch (e) {
      console.warn('Permission request:', e)
    }
    localStorage.setItem('perms_asked', '1')
    setAsked(true)
  }

  return null
}
