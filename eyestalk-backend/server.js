const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
const port = 3001;

// --- CONFIGURATION ---
const TELEGRAM_BOT_TOKEN = '8483266791:AAHrlKQxmWrBxgcHfAC4ZN_nK4l95bP_Sbg';
const TELEGRAM_CHAT_ID = '287541730';
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
    return res.status(400).json({ success: false, error: 'Message is required' });
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

    if (data.ok) {
      console.log('Telegram message sent successfully:', data);
      res.json({ success: true, data });
    } else {
      console.error('Error sending Telegram message:', data);
      res.status(500).json({ success: false, error: 'Failed to send message via Telegram API', details: data });
    }
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

app.listen(port, () => {
  console.log(`EyesTalk backend server listening at http://localhost:${port}`);
  console.log(`You can test the server by visiting: http://localhost:${port}/`);
});