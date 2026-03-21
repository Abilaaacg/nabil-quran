import React, { useState, useEffect, useRef } from 'react'
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
  const [translations, setTranslations] = useState([])
  const [loadingTafsir, setLoadingTafsir] = useState(false)
  const [activeVerse, setActiveVerse] = useState(null)
  const tafsirRef = useRef(null)

  const surahName = surahNames[num - 1] || `سورة ${num}`
  const fontSize = settings.quranFontSize || 32

  useEffect(() => {
    setLoading(true)
    setError(null)
    setVerses([])
    setActiveVerse(null)
    setTranslations([])
    fetch(`https://api.alquran.cloud/v1/surah/${num}`)
      .then(r => r.json())
      .then(data => {
        if (data.code === 200) setVerses(data.data.ayahs)
        else setError('تعذر تحميل السورة')
      })
      .catch(() => setError('تعذر الاتصال بالخادم'))
      .finally(() => setLoading(false))
  }, [num])

  // تحميل التفسير عند أول ضغط على آية
  const loadTafsir = () => {
    if (translations.length > 0) return
    setLoadingTafsir(true)
    fetch(`https://api.alquran.cloud/v1/surah/${num}/ar.muyassar`)
      .then(r => r.json())
      .then(data => {
        if (data.code === 200) setTranslations(data.data.ayahs)
      })
      .catch(() => {})
      .finally(() => setLoadingTafsir(false))
  }

  const handleVerseClick = (verseNum) => {
    if (activeVerse === verseNum) {
      setActiveVerse(null)
      return
    }
    setActiveVerse(verseNum)
    loadTafsir()
    // تمرير لقسم التفسير
    setTimeout(() => tafsirRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 200)
  }

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
          <div className="font-size-btns">
            <button onClick={() => updateSettings({ quranFontSize: Math.max(18, fontSize - 2) })}>أ−</button>
            <span className="font-size-val">{fontSize}</span>
            <button onClick={() => updateSettings({ quranFontSize: Math.min(60, fontSize + 2) })}>أ+</button>
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
            <div className="mushaf-meta">{verses.length} آية</div>
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
          <div className="error-box" style={{ margin: '20px' }}>⚠️ {error}</div>
        )}

        {/* النص المتصل */}
        {!loading && !error && (
          <>
            {Object.entries(
              verses.reduce((acc, ayah) => {
                const p = ayah.page || 1
                if (!acc[p]) acc[p] = []
                acc[p].push(ayah)
                return acc
              }, {})
            ).map(([pageNum, pageVerses]) => (
              <div key={pageNum} className="mushaf-page-block">
                <div className="mushaf-text" style={{ fontSize: `${fontSize}px` }}>
                  {pageVerses.map((ayah) => (
                    <React.Fragment key={ayah.numberInSurah}>
                      <span
                        className={`mushaf-word ${activeVerse === ayah.numberInSurah ? 'verse-highlight' : ''}`}
                        onClick={() => handleVerseClick(ayah.numberInSurah)}
                        title={`الآية ${ayah.numberInSurah} — اضغط لعرض التفسير`}
                      >
                        {ayah.text}
                      </span>
                      <VerseNum n={ayah.numberInSurah} />
                      {' '}
                    </React.Fragment>
                  ))}
                </div>
                <div className="mushaf-page-num">— {pageNum} —</div>
              </div>
            ))}

            {/* التفسير - يظهر تلقائياً عند الضغط على آية */}
            {activeVerse && (
              <div className="mushaf-tafsir" ref={tafsirRef}>
                <div className="tafsir-title">
                  تفسير الآية {activeVerse}
                  <button
                    onClick={() => setActiveVerse(null)}
                    style={{ float: 'left', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 16 }}
                  >✕</button>
                </div>
                {loadingTafsir ? (
                  <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 20 }}>
                    جاري تحميل التفسير...
                  </div>
                ) : translations[activeVerse - 1] ? (
                  <div className="tafsir-single">
                    {translations[activeVerse - 1].text}
                  </div>
                ) : (
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
