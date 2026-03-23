import './NewsTicker.css'

const NEWS = [
  '🕌 تم إصلاح الأذان — يعمل حتى لو التطبيق مغلق',
  '🏆 جديد: المسابقة الإسلامية — نافس الذكاء الاصطناعي واكسب نقاط',
  '🎓 جديد: دروس ومحاضرات فيديو من أفضل العلماء',
  '📿 السبحة الإلكترونية بتصميم جديد',
  '🤖 المساعد الذكي نور يجيب على أي سؤال ديني',
  '🔔 تذكير صلي على النبي ﷺ كل 5 دقائق',
  '⚙️ تحكم كامل في إعدادات الإشعارات',
  '🌅 +20 ذكر جديد في أذكار الصباح والمساء',
  '💬 تحيات م. أحمد نبيل — شكراً لدعمكم',
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
