import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import './Surah.css'

const surahNames = [
  'الفاتحة','البقرة','آل عمران','النساء','المائدة','الأنعام','الأعراف','الأنفال',
  'التوبة','يونس','هود','يوسف','الرعد','إبراهيم','الحجر','النحل','الإسراء','الكهف',
  'مريم','طه','الأنبياء','الحج','المؤمنون','النور','الفرقان','الشعراء','النمل','القصص',
  'العنكبوت','الروم','لقمان','السجدة','الأحزاب','سبأ','فاطر','يس','الصافات','ص',
  'الزمر','غافر','فصلت','الشورى','الزخرف','الدخان','الجاثية','الأحقاف','محمد','الفتح',
  'الحجرات','ق','الذاريات','الطور','النجم','القمر','الرحمن','الواقعة','الحديد','المجادلة',
  'الحشر','الممتحنة','الصف','الجمعة','المنافقون','التغابن','الطلاق','التحريم','الملك','القلم',
  'الحاقة','المعارج','نوح','الجن','المزمل','المدثر','القيامة','الإنسان','المرسلات','النبأ',
  'النازعات','عبس','التكوير','الانفطار','المطففين','الانشقاق','البروج','الطارق','الأعلى',
  'الغاشية','الفجر','البلد','الشمس','الليل','الضحى','الشرح','التين','العلق','القدر',
  'البينة','الزلزلة','العاديات','القارعة','التكاثر','العصر','الهمزة','الفيل','قريش',
  'الماعون','الكوثر','الكافرون','النصر','المسد','الإخلاص','الفلق','الناس',
]

export default function Surah() {
  const { surahNumber } = useParams()
  const num = parseInt(surahNumber)
  const { settings, updateSettings } = useApp()
  const [verses, setVerses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showTranslation, setShowTranslation] = useState(false)
  const [translations, setTranslations] = useState([])

  const surahName = surahNames[num - 1] || `سورة ${num}`

  useEffect(() => {
    setLoading(true)
    setError(null)
    fetch(`https://api.alquran.cloud/v1/surah/${num}`)
      .then(r => r.json())
      .then(data => {
        if (data.code === 200) {
          setVerses(data.data.ayahs)
        } else {
          setError('تعذر تحميل السورة')
        }
      })
      .catch(() => setError('تعذر الاتصال بالخادم'))
      .finally(() => setLoading(false))
  }, [num])

  useEffect(() => {
    if (showTranslation && translations.length === 0) {
      fetch(`https://api.alquran.cloud/v1/surah/${num}/ar.muyassar`)
        .then(r => r.json())
        .then(data => {
          if (data.code === 200) setTranslations(data.data.ayahs)
        })
        .catch(() => {})
    }
  }, [showTranslation, num])

  const fontSize = settings.quranFontSize || 30

  return (
    <div className="page-container fade-in">
      <div className="surah-header">
        <Link to="/quran" className="back-btn">← القرآن الكريم</Link>
        <h1>{surahName}</h1>
        <div className="surah-controls">
          <button
            className="btn btn-secondary"
            onClick={() => setShowTranslation(t => !t)}
          >
            {showTranslation ? '🔤 إخفاء التفسير' : '🔤 عرض التفسير'}
          </button>
          <div className="font-controls">
            <button
              className="btn-icon"
              onClick={() => updateSettings({ quranFontSize: Math.max(20, fontSize - 2) })}
            >أ-</button>
            <span>{fontSize}px</span>
            <button
              className="btn-icon"
              onClick={() => updateSettings({ quranFontSize: Math.min(50, fontSize + 2) })}
            >أ+</button>
          </div>
        </div>
      </div>

      {num !== 9 && (
        <div className="basmala">
          بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
        </div>
      )}

      {loading && (
        <div className="loading-container">
          <div className="spinner" />
          <p>جاري التحميل...</p>
        </div>
      )}

      {error && (
        <div className="error-box">
          <p>⚠️ {error}</p>
        </div>
      )}

      {!loading && !error && (
        <div className="verses-container">
          {verses.map((ayah, i) => (
            <div key={ayah.numberInSurah} className="verse-item">
              <div
                className="verse-text arabic-text"
                style={{ fontSize: `${fontSize}px` }}
              >
                {ayah.text}
                <span className="verse-number"> ﴿{ayah.numberInSurah}﴾</span>
              </div>
              {showTranslation && translations[i] && (
                <div className="verse-translation">
                  {translations[i].text}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="surah-nav">
        {num > 1 && (
          <Link to={`/quran/${num - 1}`} className="btn btn-secondary">
            ← السورة السابقة
          </Link>
        )}
        {num < 114 && (
          <Link to={`/quran/${num + 1}`} className="btn btn-secondary">
            السورة التالية →
          </Link>
        )}
      </div>
    </div>
  )
}
