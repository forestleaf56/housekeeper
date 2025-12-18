// api/housekeeper.js
export default async function handler(req, res) {
  // 1. Security: Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // 2. Security: Ensure API Key exists in Vercel Environment Variables
  if (!process.env.OPENAI_API_KEY) {
    return res.status(500).json({ error: 'Missing OPENAI_API_KEY in Vercel Settings' });
  }

  const { messages } = req.body;

  try {
    // 3. Call OpenAI (Server-to-Server)
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: messages,
        temperature: 0.7, // Warm and helpful tone
        max_tokens: 2000
      })
    });

    const data = await response.json();

    // 4. Send the clean answer back to the frontend
    return res.status(200).json(data);

  } catch (error) {
    return res.status(500).json({ error: 'Error communicating with OpenAI' });
  }
}
