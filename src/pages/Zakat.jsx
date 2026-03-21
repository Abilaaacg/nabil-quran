import React, { useState } from 'react'
import './Zakat.css'

export default function Zakat() {
  const [gold, setGold] = useState('')
  const [silver, setSilver] = useState('')
  const [cash, setCash] = useState('')
  const [debts, setDebts] = useState('')
  const [goldPrice, setGoldPrice] = useState('3000')
  const [silverPrice, setSilverPrice] = useState('35')
  const [pricesOpen, setPricesOpen] = useState(false)
  const [result, setResult] = useState(null)

  function calculate() {
    const gp = parseFloat(goldPrice) || 0
    const sp = parseFloat(silverPrice) || 0
    const totalAssets =
      (parseFloat(gold) || 0) * gp +
      (parseFloat(silver) || 0) * sp +
      (parseFloat(cash) || 0) -
      (parseFloat(debts) || 0)
    const goldNisab = 85 * gp
    const silverNisab = 595 * sp
    const nisab = Math.min(goldNisab, silverNisab)
    const obligatory = totalAssets >= nisab
    const zakatDue = obligatory ? totalAssets * 0.025 : 0

    setResult({ totalAssets, nisab, goldNisab, silverNisab, zakatDue, obligatory })
  }

  function fmt(n) {
    return n.toLocaleString('ar-EG', { maximumFractionDigits: 2 })
  }

  return (
    <div className="zakat-page">
      <div className="zakat-header">
        <h1 className="zakat-title">حاسبة الزكاة</h1>
        <p className="zakat-subtitle">احسب زكاة مالك بدقة وسهولة</p>
      </div>

      <div className="zakat-form">
        {/* Assets section */}
        <div className="zakat-card">
          <h2 className="section-title">
            <span className="section-icon">💰</span>
            الأصول
          </h2>
          <div className="input-group">
            <label className="input-label">
              الذهب
              <span className="input-unit">جرام</span>
            </label>
            <input
              className="zakat-input"
              type="number"
              min="0"
              placeholder="٠"
              value={gold}
              onChange={e => setGold(e.target.value)}
            />
          </div>
          <div className="input-group">
            <label className="input-label">
              الفضة
              <span className="input-unit">جرام</span>
            </label>
            <input
              className="zakat-input"
              type="number"
              min="0"
              placeholder="٠"
              value={silver}
              onChange={e => setSilver(e.target.value)}
            />
          </div>
          <div className="input-group">
            <label className="input-label">
              النقود والمدخرات
              <span className="input-unit">ج.م</span>
            </label>
            <input
              className="zakat-input"
              type="number"
              min="0"
              placeholder="٠"
              value={cash}
              onChange={e => setCash(e.target.value)}
            />
          </div>
        </div>

        {/* Debts section */}
        <div className="zakat-card">
          <h2 className="section-title">
            <span className="section-icon">📋</span>
            الديون
          </h2>
          <div className="input-group">
            <label className="input-label">
              الديون المستحقة
              <span className="input-unit">ج.م</span>
            </label>
            <input
              className="zakat-input"
              type="number"
              min="0"
              placeholder="٠"
              value={debts}
              onChange={e => setDebts(e.target.value)}
            />
            <p className="input-hint">تُخصم الديون من إجمالي الأصول قبل احتساب الزكاة</p>
          </div>
        </div>

        {/* Collapsible prices section */}
        <div className="zakat-card">
          <button
            className="collapsible-header"
            onClick={() => setPricesOpen(o => !o)}
            aria-expanded={pricesOpen}
          >
            <h2 className="section-title no-margin">
              <span className="section-icon">⚖️</span>
              أسعار المعادن
            </h2>
            <span className={`collapse-arrow ${pricesOpen ? 'open' : ''}`}>▼</span>
          </button>
          {pricesOpen && (
            <div className="collapsible-body">
              <p className="prices-note">يمكنك تعديل الأسعار وفق أحدث أسعار السوق</p>
              <div className="input-group">
                <label className="input-label">
                  سعر الذهب
                  <span className="input-unit">ج.م / جرام</span>
                </label>
                <input
                  className="zakat-input"
                  type="number"
                  min="0"
                  value={goldPrice}
                  onChange={e => setGoldPrice(e.target.value)}
                />
              </div>
              <div className="input-group">
                <label className="input-label">
                  سعر الفضة
                  <span className="input-unit">ج.م / جرام</span>
                </label>
                <input
                  className="zakat-input"
                  type="number"
                  min="0"
                  value={silverPrice}
                  onChange={e => setSilverPrice(e.target.value)}
                />
              </div>
            </div>
          )}
        </div>

        <button className="calculate-btn" onClick={calculate}>
          احسب الزكاة
        </button>

        {/* Result card */}
        {result !== null && (
          <div className={`result-card ${result.obligatory ? 'result-due' : 'result-not-due'}`}>
            <div className="result-header">
              <span className="result-icon">{result.obligatory ? '✅' : 'ℹ️'}</span>
              <h3 className="result-verdict">
                {result.obligatory ? 'الزكاة واجبة عليك' : 'الزكاة غير واجبة عليك'}
              </h3>
            </div>

            <div className="result-rows">
              <div className="result-row">
                <span className="result-label">إجمالي الأصول الصافية</span>
                <span className="result-value">{fmt(result.totalAssets)} ج.م</span>
              </div>
              <div className="result-row">
                <span className="result-label">نصاب الفضة (الأدنى)</span>
                <span className="result-value">{fmt(result.nisab)} ج.م</span>
              </div>
              <div className="result-row result-row-nisabs">
                <span className="result-label">نصاب الذهب (٨٥ جم)</span>
                <span className="result-value muted">{fmt(result.goldNisab)} ج.م</span>
              </div>
              <div className="result-row result-row-nisabs">
                <span className="result-label">نصاب الفضة (٥٩٥ جم)</span>
                <span className="result-value muted">{fmt(result.silverNisab)} ج.م</span>
              </div>
            </div>

            {result.obligatory && (
              <div className="zakat-amount-box">
                <p className="zakat-amount-label">مقدار الزكاة المستحقة</p>
                <p className="zakat-amount">{fmt(result.zakatDue)} ج.م</p>
                <p className="zakat-rate">٢.٥٪ — ربع العُشر (٢٥ من كل ألف)</p>
              </div>
            )}
          </div>
        )}

        {/* Info section */}
        <div className="zakat-info-card">
          <h3 className="info-title">ما هي الزكاة والنصاب؟</h3>
          <p className="info-text">
            <strong>النصاب</strong> هو الحد الأدنى للمال الذي تجب فيه الزكاة. يُستخدم نصاب الفضة
            (٥٩٥ جرامًا) لأنه الأدنى والأيسر للمسلمين، وهو الأشيع في الفتوى المعاصرة.
          </p>
          <p className="info-text">
            <strong>مقدار الزكاة</strong> ٢.٥٪ من إجمالي المال الصافي (بعد خصم الديون)، شريطة
            بلوغ النصاب ومرور الحول (سنة هجرية كاملة).
          </p>
          <p className="info-text">
            <strong>تنبيه:</strong> هذه الحاسبة للاسترشاد فقط. استشر عالمًا متخصصًا لمعرفة أحكام
            زكاتك بدقة.
          </p>
        </div>
      </div>
    </div>
  )
}
