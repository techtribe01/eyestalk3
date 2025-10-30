// EyesTalk Notification Configuration
// Copy this file and customize for your needs

module.exports = {
  // Telegram Configuration
  telegram: {
    enabled: true,
    botToken: process.env.TELEGRAM_BOT_TOKEN || '8483266791:AAHrlKQxmWrBxgcHfAC4ZN_nK4l95bP_Sbg',
    chatId: process.env.TELEGRAM_CHAT_ID || '287541730'
  },

  // Email Configuration (Gmail example)
  email: {
    enabled: false, // Set to true when you have valid email credentials
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER || 'your-email@gmail.com',
      pass: process.env.EMAIL_APP_PASSWORD || 'your-16-digit-app-password'
    },
    recipient: process.env.CAREGIVER_EMAIL || 'caregiver@example.com'
  },

  // WhatsApp Configuration (via Twilio or WhatsApp Business API)
  whatsapp: {
    enabled: false, // Set to true when you have API credentials
    provider: 'twilio', // 'twilio' or 'whatsapp-business'
    accountSid: process.env.TWILIO_ACCOUNT_SID || '',
    authToken: process.env.TWILIO_AUTH_TOKEN || '',
    fromNumber: process.env.TWILIO_WHATSAPP_NUMBER || 'whatsapp:+14155238886',
    toNumber: process.env.CAREGIVER_WHATSAPP || 'whatsapp:+1234567890'
  },

  // SMS Configuration (via Twilio)
  sms: {
    enabled: false, // Set to true when you have Twilio credentials
    accountSid: process.env.TWILIO_ACCOUNT_SID || '',
    authToken: process.env.TWILIO_AUTH_TOKEN || '',
    fromNumber: process.env.TWILIO_PHONE_NUMBER || '',
    toNumber: process.env.CAREGIVER_PHONE || '+1234567890'
  },

  // Browser/System notifications (always enabled)
  browser: {
    enabled: true,
    logToFile: true
  },

  // Default notification methods to try (in order)
  defaultMethods: ['browser', 'telegram', 'email', 'whatsapp', 'sms'],

  // Notification settings
  settings: {
    retryAttempts: 3,
    retryDelay: 2000, // 2 seconds
    logRetentionDays: 30
  }
};