import React, { useState, useEffect, useRef } from 'react'
import { useApp } from '../context/AppContext'
import './Qibla.css'

const MECCA = { lat: 21.4225, lng: 39.8262 }

function getQiblaBearing(lat, lng) {
  const lat1 = lat * Math.PI / 180
  const lat2 = MECCA.lat * Math.PI / 180
  const dLng = (MECCA.lng - lng) * Math.PI / 180
  const x = Math.sin(dLng) * Math.cos(lat2)
  const y = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng)
  return (Math.atan2(x, y) * 180 / Math.PI + 360) % 360
}

export default function Qibla() {
  const { settings, updateSettings } = useApp()
  const [qibla, setQibla] = useState(null)        // bearing to Mecca in degrees
  const [heading, setHeading] = useState(null)     // device compass heading
  const [permission, setPermission] = useState('idle') // idle | granted | denied
  const [locError, setLocError] = useState(null)
  const [accuracy, setAccuracy] = useState(null)
  const watchRef = useRef(null)

  const location = settings.location

  // احسب الاتجاه لما يكون عندنا موقع
  useEffect(() => {
    if (location?.lat && location?.lng) {
      setQibla(getQiblaBearing(location.lat, location.lng))
    }
  }, [location])

  // احصل على الموقع لو مش موجود
  useEffect(() => {
    if (!location) {
      setLocError('جاري تحديد موقعك...')
      navigator.geolocation?.getCurrentPosition(
        pos => {
          const { latitude: lat, longitude: lng } = pos.coords
          updateSettings({ location: { lat, lng, city: '' } })
          setLocError(null)
        },
        () => setLocError('تعذر تحديد الموقع — اذهب لصفحة الصلاة وحدد موقعك أولاً'),
        { timeout: 8000 }
      )
    }
  }, [])

  // تفعيل البوصلة
  const startCompass = async () => {
    // iOS 13+ يحتاج إذن
    if (typeof DeviceOrientationEvent?.requestPermission === 'function') {
      try {
        const res = await DeviceOrientationEvent.requestPermission()
        if (res !== 'granted') { setPermission('denied'); return }
      } catch { setPermission('denied'); return }
    }
    setPermission('granted')
    window.addEventListener('deviceorientationabsolute', handleOrientation, true)
    window.addEventListener('deviceorientation', handleOrientation, true)
  }

  const handleOrientation = (e) => {
    // webkitCompassHeading على iOS، alpha على Android
    const h = e.webkitCompassHeading ?? (e.absolute ? 360 - (e.alpha || 0) : null)
    if (h !== null) setHeading(h)
  }

  useEffect(() => {
    startCompass()
    return () => {
      window.removeEventListener('deviceorientationabsolute', handleOrientation, true)
      window.removeEventListener('deviceorientation', handleOrientation, true)
    }
  }, [])

  // زاوية دوران السهم نحو القبلة
  const arrowAngle = heading !== null && qibla !== null
    ? (qibla - heading + 360) % 360
    : qibla ?? 0

  const hasCompass = heading !== null
  const distance = location
    ? Math.round(Math.acos(
        Math.sin(location.lat * Math.PI / 180) * Math.sin(MECCA.lat * Math.PI / 180) +
        Math.cos(location.lat * Math.PI / 180) * Math.cos(MECCA.lat * Math.PI / 180) *
        Math.cos((MECCA.lng - location.lng) * Math.PI / 180)
      ) * 6371)
    : null

  return (
    <div className="page-container fade-in">
      <div className="page-header">
        <h1>🧭 القبلة</h1>
        <p>اتجاه الكعبة المشرفة</p>
      </div>

      {locError && (
        <div className="prayer-error mb-4">⚠️ {locError}</div>
      )}

      {qibla !== null && (
        <>
          {/* البوصلة */}
          <div className="compass-wrap">
            <div
              className="compass-ring"
              style={{ transform: hasCompass ? `rotate(${-heading}deg)` : 'none' }}
            >
              <span className="compass-dir north">ش</span>
              <span className="compass-dir east">ش</span>
              <span className="compass-dir south">ج</span>
              <span className="compass-dir west">غ</span>
              {/* خطوط الدرجات */}
              {[...Array(36)].map((_, i) => (
                <div
                  key={i}
                  className={`tick ${i % 9 === 0 ? 'tick-major' : ''}`}
                  style={{ transform: `rotate(${i * 10}deg)` }}
                />
              ))}
            </div>

            {/* السهم نحو القبلة */}
            <div
              className="qibla-arrow-wrap"
              style={{ transform: `rotate(${arrowAngle}deg)` }}
            >
              <div className="qibla-arrow">
                <div className="arrow-head">🕋</div>
                <div className="arrow-tail" />
              </div>
            </div>

            {/* المركز */}
            <div className="compass-center">
              <span>{Math.round(qibla)}°</span>
            </div>
          </div>

          {/* معلومات */}
          <div className="qibla-info">
            {hasCompass ? (
              <div className="qibla-status active">🟢 البوصلة نشطة — وجّه هاتفك حتى يشير 🕋 نحو القبلة</div>
            ) : (
              <div className="qibla-status">📐 اتجاه القبلة: {Math.round(qibla)}° من الشمال</div>
            )}
            {distance && (
              <div className="qibla-distance">المسافة إلى مكة المكرمة: {distance.toLocaleString('ar-EG')} كم</div>
            )}
            {location && (
              <div className="qibla-coords">
                {location.city && <span>{location.city} · </span>}
                {location.lat?.toFixed(4)}°، {location.lng?.toFixed(4)}°
              </div>
            )}
          </div>

          {permission === 'denied' && (
            <div className="prayer-error mt-4">
              ⚠️ تعذر الوصول للبوصلة — أذن للتطبيق بالوصول لمستشعر الاتجاه من إعدادات الجهاز
            </div>
          )}
        </>
      )}
    </div>
  )
}
