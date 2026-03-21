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

// أرقام الآيات بشكل دائري للمصحف
function VerseNum({ n }) {
  return <span className="mushaf-verse-num">﴾{n}﴿</span>
}

export default function Surah() {
  const { surahNumber } = useParams()
  const num = parseInt(surahNumber)
  const { settings, updateSettings } = useApp()
  const [verses, setVerses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showTranslation, setShowTranslation] = useState(false)
  const [translations, setTranslations] = useState([])
  const [activeVerse, setActiveVerse] = useState(null)

  const surahName = surahNames[num - 1] || `سورة ${num}`
  const fontSize = settings.quranFontSize || 32

  useEffect(() => {
    setLoading(true)
    setError(null)
    setVerses([])
    setActiveVerse(null)
    fetch(`https://api.alquran.cloud/v1/surah/${num}`)
      .then(r => r.json())
      .then(data => {
        if (data.code === 200) setVerses(data.data.ayahs)
        else setError('تعذر تحميل السورة')
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

  return (
    <div className="mushaf-layout fade-in">

      {/* شريط التحكم */}
      <div className="mushaf-toolbar">
        <Link to="/quran" className="back-btn">← القرآن</Link>

        <div className="mushaf-title">
          <span className="mushaf-surah-name">{surahName}</span>
          {verses.length > 0 && (
            <span className="mushaf-verse-count">{verses.length} آية</span>
          )}
        </div>

        <div className="mushaf-controls">
          <button
            className={`ctrl-btn ${showTranslation ? 'active' : ''}`}
            onClick={() => setShowTranslation(t => !t)}
            title="التفسير الميسر"
          >
            تفسير
          </button>
          <div className="font-size-btns">
            <button onClick={() => updateSettings({ quranFontSize: Math.max(22, fontSize - 2) })}>أ-</button>
            <button onClick={() => updateSettings({ quranFontSize: Math.min(52, fontSize + 2) })}>أ+</button>
          </div>
        </div>
      </div>

      {/* صفحة المصحف */}
      <div className="mushaf-page">

        {/* عنوان السورة */}
        <div className="mushaf-surah-header">
          <div className="mushaf-header-decoration">
            <span className="header-line" />
            <span className="header-title">{surahName}</span>
            <span className="header-line" />
          </div>
          {verses.length > 0 && (
            <div className="mushaf-meta">
              {verses.length} آية
            </div>
          )}
        </div>

        {/* البسملة */}
        {num !== 9 && num !== 1 && !loading && verses.length > 0 && (
          <div className="mushaf-basmala">
            بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ
          </div>
        )}

        {loading && (
          <div className="loading-container">
            <div className="spinner" />
            <p>جاري تحميل السورة...</p>
          </div>
        )}

        {error && (
          <div className="error-box" style={{ margin: '20px' }}>
            ⚠️ {error}
          </div>
        )}

        {/* النص المتصل - شكل المصحف */}
        {!loading && !error && (
          <>
            <div
              className="mushaf-text"
              style={{ fontSize: `${fontSize}px` }}
            >
              {verses.map((ayah) => (
                <React.Fragment key={ayah.numberInSurah}>
                  <span
                    className={`mushaf-word ${activeVerse === ayah.numberInSurah ? 'verse-highlight' : ''}`}
                    onClick={() => setActiveVerse(
                      activeVerse === ayah.numberInSurah ? null : ayah.numberInSurah
                    )}
                  >
                    {ayah.text}
                  </span>
                  <VerseNum n={ayah.numberInSurah} />
                  {' '}
                </React.Fragment>
              ))}
            </div>

            {/* التفسير - يظهر للآية المختارة أو كامل السورة */}
            {showTranslation && (
              <div className="mushaf-tafsir">
                <div className="tafsir-title">التفسير الميسر</div>
                {activeVerse ? (
                  // تفسير آية محددة
                  translations[activeVerse - 1] && (
                    <div className="tafsir-single">
                      <span className="tafsir-ayah-num">الآية {activeVerse}:</span>
                      <span>{translations[activeVerse - 1].text}</span>
                    </div>
                  )
                ) : (
                  // كل التفسير
                  translations.map((t, i) => (
                    <div key={i} className="tafsir-item">
                      <span className="tafsir-ayah-num">({i + 1})</span>
                      {t.text}
                    </div>
                  ))
                )}
                {translations.length === 0 && (
                  <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 20 }}>
                    جاري تحميل التفسير...
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* تنقل بين السور */}
        <div className="mushaf-nav">
          {num > 1 && (
            <Link to={`/quran/${num - 1}`} className="nav-btn">
              ← {surahNames[num - 2]}
            </Link>
          )}
          {num < 114 && (
            <Link to={`/quran/${num + 1}`} className="nav-btn">
              {surahNames[num]} →
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
