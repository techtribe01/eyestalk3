require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
const port = 3001;

// --- CONFIGURATION ---
const { TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID } = process.env;

if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
  console.error(
    'FATAL ERROR: TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID must be set in a .env file in the eyestalk-backend directory.'
  );
  process.exit(1);
}
// ---------------------

// More robust CORS setup to allow requests from any origin
const corsOptions = {
  origin: '*',
  methods: ['POST', 'GET', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
};
app.use(cors(corsOptions));

// Use modern express.json() middleware for parsing JSON bodies
app.use(express.json());

// Add a root route for health checks to confirm the server is running
app.get('/', (req, res) => {
  res.status(200).send('EyesTalk backend is running and healthy.');
});

app.post('/send-telegram', async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res
      .status(400)
      .json({ success: false, error: 'Message is required' });
  }

  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
  const payload = {
    chat_id: TELEGRAM_CHAT_ID,
    text: message,
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (response.ok && data.ok) {
      console.log('Telegram message sent successfully:', data);
      res.json({ success: true, data });
    } else {
      console.error('Error sending Telegram message:', data);
      res.status(response.status).json({
        success: false,
        error: 'Failed to send message via Telegram API',
        details: data,
      });
    }
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

app.listen(port, () => {
  console.log(`EyesTalk backend server listening at http://localhost:${port}`);
  console.log('Ensure you have a .env file with TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID.');
  console.log(`You can test the server by visiting: http://localhost:${port}/`);
});
