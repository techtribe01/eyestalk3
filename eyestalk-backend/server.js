require('dotenv').config();
const express = require('express');
const cors = require('cors');
const twilio = require('twilio');

// --- Environment Variable Validation ---
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;
const fallbackCaregiverPhoneNumber = process.env.CAREGIVER_PHONE_NUMBER;
const PORT = process.env.PORT || 4000;

if (!accountSid || !authToken || !twilioPhoneNumber) {
  console.error('FATAL ERROR: Missing Twilio credentials in .env file (TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER).');
  process.exit(1);
}

// --- Twilio Client Initialization ---
const client = twilio(accountSid, authToken);

// --- Express App Setup ---
const app = express();
app.use(cors()); // Allow cross-origin requests from the frontend
app.use(express.json()); // Middleware to parse JSON bodies

// --- Voice Message Templates ---
const itemTranslations = {
    food: { english: 'food', hindi: 'भोजन', tamil: 'உணவு', telugu: 'ఆహారం' },
    water: { english: 'water', hindi: 'पानी', tamil: 'தண்ணீர்', telugu: 'నీరు' },
    help: { english: 'help', hindi: 'मदद', tamil: 'உதவி', telugu: 'సహాయం' },
    outing: { english: 'an outing', hindi: 'बाहर जाना', tamil: 'வெளிச்செலவு', telugu: 'విహారయాత్ర' },
    washroom: { english: 'the washroom', hindi: 'शौचालय', tamil: 'கழிவறை', telugu: 'వాష్రూమ్' },
};

const getVoiceMessage = (item, lang) => {
    const requestedItem = itemTranslations[item]?.[lang] || itemTranslations[item]?.['english'] || 'assistance';
    switch (lang) {
        case 'hindi':
            return `नमस्ते, यह EyesTalk है। आपका मरीज़ ${requestedItem} मांग रहा है। कृपया तुरंत ध्यान दें।`;
        case 'tamil':
            return `வணக்கம், இது EyesTalk. உங்கள் நோயாளி ${requestedItem} கேட்கிறார். உடனடியாக கவனியுங்கள்.`;
        // Note: Twilio <Say> does not support Telugu. Falling back to English message.
        case 'telugu':
        case 'english':
        default:
            return `Hello, this is EyesTalk. Your patient is requesting ${requestedItem}. Please attend to them immediately.`;
    }
};

// --- API Endpoint ---
app.post('/send-voice-alert', async (req, res) => {
    const { menuItem, language, caregiverPhone } = req.body;
    const targetPhoneNumber = caregiverPhone || fallbackCaregiverPhoneNumber;

    if (!menuItem || !language || !itemTranslations[menuItem]) {
        return res.status(400).json({ success: false, message: 'Invalid request body. Missing or invalid menuItem or language.' });
    }

    if (!targetPhoneNumber) {
        return res.status(400).json({ success: false, message: 'Caregiver phone number not provided in request or environment variables.' });
    }

    const message = getVoiceMessage(menuItem, language);
    
    const voiceConfig = {
        'english': { voice: 'Polly.Raveena', language: 'en-IN' },
        'hindi': { voice: 'Polly.Aditi', language: 'hi-IN' },
        'tamil': { voice: 'Polly.Aditi', language: 'ta-IN' },
        'telugu': { voice: 'Polly.Raveena', language: 'en-IN' } // Fallback voice
    };
    
    const selectedVoice = voiceConfig[language] || voiceConfig['english'];

    const twiml = `<Response><Say voice="${selectedVoice.voice}" language="${selectedVoice.language}">${message}</Say></Response>`;
    
    console.log(`\nInitiating call to ${targetPhoneNumber}...`);
    console.log(`Language: ${language}, Voice: ${selectedVoice.voice}`);
    console.log(`TwiML Payload: ${twiml}`);
    
    try {
        const call = await client.calls.create({
            twiml: twiml,
            to: targetPhoneNumber,
            from: twilioPhoneNumber,
        });

        console.log(`Call initiated successfully. SID: ${call.sid}`);
        res.status(200).json({ success: true, message: 'Call initiated.', callSid: call.sid });

    } catch (error) {
        console.error('Error initiating Twilio call:', error.message);
        res.status(500).json({ success: false, message: 'Failed to initiate call.', error: error.message });
    }
});

// --- Start Server ---
app.listen(PORT, () => {
    console.log(`EyesTalk Backend is running on http://localhost:${PORT}`);
    console.log(`Ready to send notifications from ${twilioPhoneNumber}.`);
    if(fallbackCaregiverPhoneNumber) {
        console.log(`Fallback caregiver number is set to: ${fallbackCaregiverPhoneNumber}`);
    } else {
        console.log('No fallback caregiver number set in .env. Number must be provided in API requests.');
    }
});