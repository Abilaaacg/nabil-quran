// Netlify Function — Islamic AI Assistant
// يحتاج: ANTHROPIC_API_KEY في Netlify Environment Variables

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

  const apiKey = process.env.ANTHROPIC_API_KEY
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
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1024,
        system: SYSTEM_PROMPT,
        messages,
      }),
    })

    if (!response.ok) {
      const err = await response.text()
      return { statusCode: 502, body: JSON.stringify({ error: 'AI service error', detail: err }) }
    }

    const data = await response.json()
    const text = data.content?.[0]?.text || ''

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
