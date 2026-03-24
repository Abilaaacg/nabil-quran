import './NewsTicker.css'

const NEWS = [
  '📱 تحديث جديد: تم إصلاح عرض التطبيق على جميع الموبايلات',
  '🕌 الأذان والإشعارات تعمل بشكل مضمون الآن',
  '🏆 جديد: المسابقة الإسلامية — نافس الذكاء الاصطناعي',
  '🎓 جديد: دروس ومحاضرات من الشعراوي والنابلسي والعوضي',
  '📿 السبحة الإلكترونية + عداد التسبيح',
  '🤖 المساعد الذكي نور يجيب على أي سؤال ديني',
  '🔔 تذكير صلي على النبي ﷺ',
  '✨ 14 ميزة إسلامية شاملة في تطبيق واحد',
  '💚 تحيات م. أحمد نبيل — جزاكم الله خيراً',
]

export default function NewsTicker() {
  return (
    <div className="ticker-wrap">
      <div className="ticker-content">
        {NEWS.map((item, i) => (
          <span key={i} className="ticker-item">{item}</span>
        ))}
        {NEWS.map((item, i) => (
          <span key={`d${i}`} className="ticker-item">{item}</span>
        ))}
      </div>
    </div>
  )
}
