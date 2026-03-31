export default async function handler(req, res) {
  // Only accept POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.POE_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'API key not configured' });
  }

  const { messages } = req.body;
  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'Invalid messages payload' });
  }

  try {
    const poeRes = await fetch('https://api.poe.com/bot/SelenisAI/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'SelenisAI',
        messages: messages,
        stream: false,
      }),
    });

    if (!poeRes.ok) {
      const errText = await poeRes.text();
      console.error('Poe API error:', poeRes.status, errText);
      return res.status(poeRes.status).json({
        error: `Poe API returned ${poeRes.status}`,
      });
    }

    const data = await poeRes.json();
    const reply = data?.choices?.[0]?.message?.content ?? '';

    return res.status(200).json({ reply });

  } catch (err) {
    console.error('Proxy error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
