# EyesTalk Backend Server

This server provides an API to send voice call notifications to a caregiver using Twilio.

## Setup

### 1. Install Dependencies
Open your terminal in this folder and run:
```bash
npm install
```

### 2. Configure Environment Variables (for Fallback)
The primary way to configure Twilio is now through the **Settings UI in the frontend application**. 

However, you can create a `.env` file in this directory for development purposes or to set a fallback caregiver number.

**Create a `.env` file and add the following:**
```
# Your Twilio Credentials
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=+1...

# (Optional) A fallback caregiver number if none is provided by the frontend
CAREGIVER_PHONE_NUMBER=+91...

# (Optional) Server port
PORT=4000
```
- The server **must** have the Twilio credentials (`TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER`) in the `.env` file to start.
- The caregiver phone number will be provided by the frontend. `CAREGIVER_PHONE_NUMBER` in this file acts only as a backup.


### 3. Start the Server
Run the following command:
```bash
npm start
```

The server will start on `http://localhost:4000` (or the port specified in your `.env` file). **It must be running** for the EyesTalk frontend to successfully send notifications.
