const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const fs = require('fs').promises;
const path = require('path');
const config = require('./config');

const app = express();
const port = 3001;

// Load nodemailer only if email is enabled
let nodemailer = null;
if (config.email.enabled) {
  try {
    nodemailer = require('nodemailer');
  } catch (error) {
    console.log('⚠️  Nodemailer not available. Email notifications disabled.');
    config.email.enabled = false;
  }
}

// Create logs directory if it doesn't exist
const LOGS_DIR = path.join(__dirname, 'notifications_log');
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


// Initialize logs directory
(async () => {
  try {
    await fs.mkdir(LOGS_DIR, { recursive: true });
  } catch (error) {
    console.log('Logs directory already exists or error creating it:', error.message);
  }
})();

// Utility function to log notifications
async function logNotification(type, message, status, details = null) {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    type,
    message,
    status,
    details
  };
  
  try {
    const logFile = path.join(LOGS_DIR, `notifications_${new Date().toISOString().split('T')[0]}.json`);
    let logs = [];
    
    try {
      const existingLogs = await fs.readFile(logFile, 'utf8');
      logs = JSON.parse(existingLogs);
    } catch (error) {
      // File doesn't exist yet, start with empty array
    }
    
    logs.push(logEntry);
    await fs.writeFile(logFile, JSON.stringify(logs, null, 2));
    console.log(`📝 Logged ${type} notification:`, logEntry);
  } catch (error) {
    console.error('Error logging notification:', error);
  }
}

// Send Telegram notification
async function sendTelegramNotification(message) {
  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
  const payload = {
    chat_id: TELEGRAM_CHAT_ID,
    text: message,
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    
    if (data.ok) {
      await logNotification('telegram', message, 'success', data);
      return { success: true, method: 'telegram', data };
    } else {
      await logNotification('telegram', message, 'failed', data);
      throw new Error(`Telegram API error: ${data.description}`);
    }
  } catch (error) {
    await logNotification('telegram', message, 'error', error.message);
    throw error;
  }
}

// Send Email notification
async function sendEmailNotification(message) {
  try {
    const transporter = nodemailer.createTransport(EMAIL_CONFIG);
    
    const mailOptions = {
      from: EMAIL_CONFIG.auth.user,
      to: NOTIFICATION_RECIPIENTS.email,
      subject: '🚨 EyesTalk Alert - Assistance Required',
      html: `
        <h2>🚨 EyesTalk Notification</h2>
        <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
        <p><strong>Message:</strong> ${message}</p>
        <p><strong>Device:</strong> EyesTalk Communication System</p>
        <hr>
        <p><em>This is an automated notification from EyesTalk. Please respond promptly.</em></p>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    await logNotification('email', message, 'success', info);
    return { success: true, method: 'email', data: info };
  } catch (error) {
    await logNotification('email', message, 'error', error.message);
    throw error;
  }
}

// Send Browser notification (for real-time alerts)
async function sendBrowserNotification(message) {
  // This logs the notification and could trigger WebSocket/SSE in future
  const notification = {
    id: Date.now(),
    message,
    timestamp: new Date().toISOString(),
    read: false
  };
  
  await logNotification('browser', message, 'success', notification);
  return { success: true, method: 'browser', data: notification };
}

// Send WhatsApp notification via API (if configured)
async function sendWhatsAppNotification(message) {
  // This is a placeholder for WhatsApp Business API
  // You can integrate with services like Twilio, WhatsApp Business API, etc.
  try {
    // Example using Twilio (would need API keys)
    // const twilioSid = process.env.TWILIO_SID;
    // const twilioToken = process.env.TWILIO_TOKEN;
    
    // For now, we'll simulate success and log it
    const whatsappMessage = `🚨 *EyesTalk Alert*\n\n${message}\n\nTime: ${new Date().toLocaleString()}\n\n_Please respond promptly._`;
    
    await logNotification('whatsapp', whatsappMessage, 'simulated', { phone: NOTIFICATION_RECIPIENTS.phone });
    console.log('📱 WhatsApp notification simulated:', whatsappMessage);
    
    return { success: true, method: 'whatsapp', data: { simulated: true, message: whatsappMessage } };
  } catch (error) {
    await logNotification('whatsapp', message, 'error', error.message);
    throw error;
  }
}

// Main notification endpoint - tries multiple methods
app.post('/send-notification', async (req, res) => {
  const { message, methods = ['telegram', 'email', 'browser', 'whatsapp'] } = req.body;

  if (!message) {
    return res.status(400).json({ success: false, error: 'Message is required' });
  }

  const results = [];
  let hasSuccess = false;

  // Try each notification method
  for (const method of methods) {
    try {
      let result;
      
      switch (method) {
        case 'telegram':
          result = await sendTelegramNotification(message);
          break;
        case 'email':
          result = await sendEmailNotification(message);
          break;
        case 'browser':
          result = await sendBrowserNotification(message);
          break;
        case 'whatsapp':
          result = await sendWhatsAppNotification(message);
          break;
        default:
          continue;
      }
      
      results.push(result);
      hasSuccess = true;
      
    } catch (error) {
      results.push({
        success: false,
        method,
        error: error.message
      });
    }
  }

  // Always log to file system as backup
  await logNotification('system', message, hasSuccess ? 'delivered' : 'failed', results);

  if (hasSuccess) {
    res.json({
      success: true,
      message: 'Notification sent successfully via one or more methods',
      results
    });
  } else {
    res.status(500).json({
      success: false,
      error: 'Failed to send notification via all methods',
      results
    });
  }
});

// Legacy endpoint for backward compatibility
app.post('/send-telegram', async (req, res) => {
  const { message } = req.body;
  
  try {
    const result = await sendTelegramNotification(message);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get notification logs
app.get('/notifications/logs', async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const logFile = path.join(LOGS_DIR, `notifications_${today}.json`);
    
    try {
      const logs = await fs.readFile(logFile, 'utf8');
      res.json({ success: true, logs: JSON.parse(logs) });
    } catch (error) {
      res.json({ success: true, logs: [], message: 'No logs found for today' });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get notification history (last 7 days)
app.get('/notifications/history', async (req, res) => {
  try {
    const allLogs = [];
    const today = new Date();
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const logFile = path.join(LOGS_DIR, `notifications_${dateStr}.json`);
      
      try {
        const logs = await fs.readFile(logFile, 'utf8');
        allLogs.push(...JSON.parse(logs));
      } catch (error) {
        // File doesn't exist for this date, continue
      }
    }
    
    // Sort by timestamp (newest first)
    allLogs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    res.json({ success: true, logs: allLogs });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.listen(port, () => {
  console.log(`EyesTalk backend server listening at http://localhost:${port}`);
  console.log(`You can test the server by visiting: http://localhost:${port}/`);
});