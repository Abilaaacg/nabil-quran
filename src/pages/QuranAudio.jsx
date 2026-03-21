import React, { useState, useRef, useEffect } from 'react'
import './QuranAudio.css'

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

// قائمة القراء - URLs متحققة من mp3quran.net API
const RECITERS = [
  { id: 'afs',     name: 'مشاري راشد العفاسي',      server: 'https://server8.mp3quran.net/afs/' },
  { id: 'sds',     name: 'عبد الرحمن السديس',        server: 'https://server11.mp3quran.net/sds/' },
  { id: 'maher',   name: 'ماهر المعيقلي',            server: 'https://server12.mp3quran.net/maher/' },
  { id: 'husr',    name: 'محمود خليل الحصري',        server: 'https://server13.mp3quran.net/husr/' },
  { id: 'minsh',   name: 'محمد صديق المنشاوي',       server: 'https://server10.mp3quran.net/minsh/' },
  { id: 'ayyub',   name: 'محمد أيوب',                server: 'https://server8.mp3quran.net/ayyub/' },
  { id: 's_gmd',   name: 'سعد الغامدي',              server: 'https://server7.mp3quran.net/s_gmd/' },
  { id: 'qtm',     name: 'ناصر القطامي',             server: 'https://server6.mp3quran.net/qtm/' },
  { id: 'ajm',     name: 'أحمد العجمي',              server: 'https://server10.mp3quran.net/ajm/' },
  { id: 'basit',   name: 'عبد الباسط عبد الصمد',     server: 'https://server7.mp3quran.net/basit/' },
  { id: 'jbrl',    name: 'محمد جبريل',               server: 'https://server8.mp3quran.net/jbrl/' },
  { id: 'jleel',   name: 'خالد الجليل',              server: 'https://server10.mp3quran.net/jleel/' },
  { id: 'mhsny',   name: 'محمد المحيسني',            server: 'https://server11.mp3quran.net/mhsny/' },
  { id: 'a_klb',   name: 'عادل الكلباني',            server: 'https://server8.mp3quran.net/a_klb/' },
  { id: 'akdr',    name: 'إبراهيم الأخضر',           server: 'https://server6.mp3quran.net/akdr/' },
  { id: 'abkr',    name: 'إدريس أبكر',               server: 'https://server6.mp3quran.net/abkr/' },
  { id: 'qht',     name: 'خالد القحطاني',            server: 'https://server10.mp3quran.net/qht/' },
  { id: 'balilah', name: 'بندر بليله',               server: 'https://server6.mp3quran.net/balilah/' },
  { id: 'kurdi',   name: 'رعد محمد الكردي',          server: 'https://server6.mp3quran.net/kurdi/' },
  { id: 'wdee3',   name: 'وديع اليمني',              server: 'https://server6.mp3quran.net/wdee3/' },
  { id: 'islam',   name: 'إسلام صبحي',               server: 'https://server14.mp3quran.net/islam/Rewayat-Hafs-A-n-Assem/' },
  { id: 'tblawi',  name: 'محمد الطبلاوي',            server: 'https://server12.mp3quran.net/tblawi/' },
]

function pad(n) {
  return String(n).padStart(3, '0')
}

export default function QuranAudio() {
  const [selectedReciter, setSelectedReciter] = useState(RECITERS[0])
  const [selectedSurah, setSelectedSurah] = useState(1)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [search, setSearch] = useState('')
  const [reciterSearch, setReciterSearch] = useState('')
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(80)
  const audioRef = useRef(null)

  const audioUrl = `${selectedReciter.server}${pad(selectedSurah)}.mp3`

  const filteredSurahs = surahNames
    .map((name, i) => ({ name, number: i + 1 }))
    .filter(s => s.name.includes(search) || String(s.number).includes(search))

  const filteredReciters = RECITERS.filter(r => r.name.includes(reciterSearch))

  const playSurah = (num, reciter = selectedReciter) => {
    setSelectedSurah(num)
    setHasError(false)
    setIsLoading(true)
    setIsPlaying(false)
    setProgress(0)

    // تأخير قليل لتحديث الـ src
    setTimeout(() => {
      if (audioRef.current) {
        audioRef.current.load()
        audioRef.current.volume = volume / 100
        audioRef.current.play()
          .then(() => { setIsPlaying(true); setIsLoading(false) })
          .catch(() => { setIsLoading(false); setHasError(true) })
      }
    }, 150)
  }

  const togglePlay = () => {
    if (!audioRef.current) return
    if (isPlaying) {
      audioRef.current.pause()
    } else {
      setHasError(false)
      audioRef.current.play()
        .then(() => setIsPlaying(true))
        .catch(() => setHasError(true))
    }
  }

  const playNext = () => {
    const next = selectedSurah < 114 ? selectedSurah + 1 : 1
    playSurah(next)
  }

  const playPrev = () => {
    const prev = selectedSurah > 1 ? selectedSurah - 1 : 114
    playSurah(prev)
  }

  const changeReciter = (reciter) => {
    setSelectedReciter(reciter)
    setIsPlaying(false)
    setProgress(0)
    setHasError(false)
    // إذا كانت سورة محددة وكانت تشغل، أعد التشغيل بالقارئ الجديد
  }

  const handleTimeUpdate = () => {
    if (audioRef.current && audioRef.current.duration) {
      setProgress((audioRef.current.currentTime / audioRef.current.duration) * 100)
    }
  }

  const handleSeek = (e) => {
    if (audioRef.current && audioRef.current.duration) {
      const rect = e.currentTarget.getBoundingClientRect()
      const x = e.clientX - rect.left
      const ratio = x / rect.width
      audioRef.current.currentTime = ratio * audioRef.current.duration
    }
  }

  const handleVolumeChange = (e) => {
    const v = parseInt(e.target.value)
    setVolume(v)
    if (audioRef.current) audioRef.current.volume = v / 100
  }

  function formatDuration(sec) {
    if (!sec || isNaN(sec)) return '0:00'
    const m = Math.floor(sec / 60)
    const s = Math.floor(sec % 60)
    return `${m}:${String(s).padStart(2, '0')}`
  }

  return (
    <div className="page-container fade-in">
      <div className="page-header">
        <h1>🎙️ القراء</h1>
        <p>استمع لتلاوات القرآن الكريم من كبار القراء</p>
      </div>

      {/* Player */}
      <div className="audio-player card mb-4">
        <div className="now-playing">
          <div className="player-surah-name">{surahNames[selectedSurah - 1]}</div>
          <div className="player-reciter">🎙️ {selectedReciter.name}</div>
        </div>

        {hasError && (
          <div className="player-error">
            ⚠️ تعذر تحميل الصوت. جرب قارئًا آخر أو سورة أخرى.
          </div>
        )}

        <audio
          ref={audioRef}
          src={audioUrl}
          onEnded={playNext}
          onPlay={() => { setIsPlaying(true); setIsLoading(false) }}
          onPause={() => setIsPlaying(false)}
          onWaiting={() => setIsLoading(true)}
          onCanPlay={() => setIsLoading(false)}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={() => setDuration(audioRef.current?.duration || 0)}
          onError={() => { setIsLoading(false); setHasError(true); setIsPlaying(false) }}
          preload="none"
        />

        {/* Progress Bar */}
        <div className="progress-bar" onClick={handleSeek}>
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>
        <div className="progress-times">
          <span>{audioRef.current ? formatDuration(audioRef.current.currentTime) : '0:00'}</span>
          <span>{formatDuration(duration)}</span>
        </div>

        {/* Controls */}
        <div className="player-controls">
          <button className="player-btn" onClick={playPrev} title="السورة السابقة">⏮</button>
          <button
            className="player-btn play-btn"
            onClick={togglePlay}
            disabled={isLoading}
          >
            {isLoading ? <span className="mini-spinner" /> : isPlaying ? '⏸' : '▶'}
          </button>
          <button className="player-btn" onClick={playNext} title="السورة التالية">⏭</button>
        </div>

        {/* Volume */}
        <div className="volume-row">
          <span>🔇</span>
          <input
            type="range"
            min="0"
            max="100"
            value={volume}
            onChange={handleVolumeChange}
            className="volume-slider"
          />
          <span>🔊</span>
        </div>
      </div>

      {/* Reciter Selection */}
      <div className="card mb-4">
        <h3 className="section-title">اختر القارئ</h3>
        <div className="mb-4" style={{ marginBottom: 10 }}>
          <input
            type="text"
            className="search-input"
            placeholder="ابحث عن قارئ..."
            value={reciterSearch}
            onChange={e => setReciterSearch(e.target.value)}
          />
        </div>
        <div className="reciters-grid">
          {filteredReciters.map(r => (
            <button
              key={r.id}
              className={`reciter-btn ${selectedReciter.id === r.id ? 'active' : ''}`}
              onClick={() => changeReciter(r)}
            >
              🎙️ {r.name}
            </button>
          ))}
        </div>
      </div>

      {/* Surah List */}
      <div className="mb-4">
        <input
          type="text"
          className="search-input"
          placeholder="ابحث عن سورة..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <div className="audio-surah-list">
        {filteredSurahs.map(s => (
          <button
            key={s.number}
            className={`audio-surah-item ${selectedSurah === s.number ? 'active' : ''}`}
            onClick={() => playSurah(s.number)}
          >
            <span className="audio-surah-num">{s.number}</span>
            <span className="audio-surah-name">{s.name}</span>
            <span className="audio-play-icon">
              {selectedSurah === s.number
                ? isLoading ? '⏳'
                : isPlaying ? '🔊' : '▶'
                : '▶'}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}
