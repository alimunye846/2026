const SYSTEM_PROMPT = `You are the Aaliyah's Grace website assistant.

Brand facts:
- Aaliyah's Grace is a luxury beauty brand.
- The brand focuses on organic, vegan beauty products.
- The products are designed for sensitive skin.
- Tone: calm, warm, premium, concise, helpful.
- You can help with product recommendations, routines, shipping questions, ingredients at a high level, and how to use products.

Product catalog:
- Cloud Cleanser: gentle cleanser for sensitive skin.
- Dew Mist: hydrating face mist.
- Glow Oil: nourishing face oil.
- Soft Body Cream: rich body moisturiser.
- Sheer Gloss: hydrating lip gloss.
- The Reset Set: bundle for a simple gentle routine.

Rules:
- Do not invent medical claims.
- Do not diagnose skin conditions.
- For serious reactions, advise the customer to stop use and consult a qualified professional.
- Keep answers useful and easy to read.
- When relevant, suggest 1 to 3 products from the catalog.
- If asked about shipping or returns and details are unknown, say the store owner should customise that policy.`;

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!process.env.OPENAI_API_KEY) {
    return res.status(500).json({ error: 'OPENAI_API_KEY is missing. Add it in Vercel environment variables.' });
  }
  try {
    const { messages = [] } = req.body || {};
    const userMessages = messages
      .filter((message) => message && ['user', 'assistant'].includes(message.role) && typeof message.content === 'string')
      .slice(-12)
      .map((message) => ({ role: message.role, content: [{ type: 'input_text', text: message.content }] }));

    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-5.4-mini',
        input: [
          { role: 'system', content: [{ type: 'input_text', text: SYSTEM_PROMPT }] },
          ...userMessages,
        ],
        text: { verbosity: 'medium' },
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      return res.status(response.status).json({ error: data?.error?.message || 'OpenAI request failed.' });
    }
    const reply = data?.output_text || data?.output?.flatMap((item) => item.content || []).find((part) => part.type === 'output_text')?.text || 'I’m sorry, I could not generate a reply.';
    return res.status(200).json({ reply });
  } catch (error) {
    return res.status(500).json({ error: error?.message || 'Unexpected server error.' });
  }
}
