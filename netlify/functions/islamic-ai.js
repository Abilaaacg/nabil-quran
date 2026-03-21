// Netlify Function — Islamic AI Assistant v2
// يحتاج: MISTRAL_API_KEY في Netlify Environment Variables

const SYSTEM_PROMPT = `أنت مساعد إسلامي ذكي متخصص في العلوم الإسلامية. اسمك "نور" وأنت جزء من تطبيق "نور الإسلام".

مهامك:
- الإجابة على أسئلة الدين الإسلامي بدقة وأمانة
- تفسير الآيات القرآنية والأحاديث النبوية
- الفقه والعبادات: الصلاة، الصيام، الزكاة، الحج
- العقيدة والسيرة النبوية
- الأخلاق والمعاملات الإسلامية
- الأذكار والأدعية المأثورة

قواعد مهمة:
- أجب دائماً باللغة العربية الفصحى الواضحة
- استند إلى الكتاب والسنة واذكر المصادر
- إذا لم تعرف الجواب القاطع قل "الله أعلم" واذكر ما هو معروف
- لا تفتِ في المسائل الخلافية الكبيرة — اذكر الأقوال واترك للعالم
- كن موجزاً ومفيداً، استخدم النقاط عند الحاجة
- ابدأ إجاباتك بـ "بسم الله" للأسئلة الدينية المهمة`

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' }
  }

  const apiKey = process.env.MISTRAL_API_KEY
  if (!apiKey) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'API key not configured' }),
    }
  }

  let messages
  try {
    const body = JSON.parse(event.body)
    messages = body.messages
    if (!Array.isArray(messages) || messages.length === 0) throw new Error('invalid')
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid request' }) }
  }

  try {
    const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'mistral-small-latest',
        max_tokens: 1024,
        messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...messages],
      }),
    })

    if (!response.ok) {
      const err = await response.text()
      return { statusCode: 502, body: JSON.stringify({ error: 'AI service error', detail: err }) }
    }

    const data = await response.json()
    const text = data.choices?.[0]?.message?.content || ''

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({ reply: text }),
    }
  } catch (e) {
    return { statusCode: 500, body: JSON.stringify({ error: e.message }) }
  }
}
