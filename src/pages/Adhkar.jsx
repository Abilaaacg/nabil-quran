import React from 'react'
import { Link } from 'react-router-dom'
import './Adhkar.css'

const categories = [
  { slug: 'morning', title: 'أذكار الصباح', icon: '🌅', desc: 'أذكار تقال في الصباح بعد صلاة الفجر', color: '#f3a049' },
  { slug: 'evening', title: 'أذكار المساء', icon: '🌆', desc: 'أذكار تقال في المساء بعد صلاة العصر', color: '#5b8dee' },
  { slug: 'prayer', title: 'أذكار الصلاة', icon: '🕌', desc: 'أذكار ما بعد الصلاة وأدعية التشهد', color: '#6bc077' },
  { slug: 'sleeping', title: 'أذكار النوم', icon: '🌙', desc: 'أذكار تقال عند النوم والاستيقاظ', color: '#a779e9' },
  { slug: 'tasbih', title: 'التسبيح والتهليل', icon: '📿', desc: 'سبحان الله، الحمد لله، الله أكبر', color: '#49b8c8' },
  { slug: 'food', title: 'أذكار الطعام', icon: '🍽️', desc: 'دعاء الطعام والشرب والدعاء بعده', color: '#e96979' },
]

export default function Adhkar() {
  return (
    <div className="page-container fade-in">
      <div className="page-header">
        <h1>الأذكار</h1>
        <p>أذكار وأدعية من السنة النبوية الشريفة</p>
      </div>

      <div className="adhkar-grid">
        {categories.map(cat => (
          <Link key={cat.slug} to={`/adhkar/${cat.slug}`} className="adhkar-cat-card">
            <div className="adhkar-cat-icon" style={{ background: `${cat.color}22`, color: cat.color }}>
              {cat.icon}
            </div>
            <h2>{cat.title}</h2>
            <p>{cat.desc}</p>
            <span className="adhkar-arrow">←</span>
          </Link>
        ))}
      </div>
    </div>
  )
}
