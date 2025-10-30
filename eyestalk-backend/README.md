# EyesTalk Backend

This backend server handles sending notifications to a caregiver via Telegram.

## Setup

1.  **Navigate to the `eyestalk-backend` directory.**
    ```bash
    cd eyestalk-backend
    ```

2.  **Install the dependencies:**
    ```bash
    npm install
    ```

3.  **Configure Environment Variables:**
    Create a file named `.env` in the `eyestalk-backend` directory. This file will store your secret credentials. Add the following content to it, replacing the placeholder values with your actual Telegram Bot Token and Chat ID.

    ```env
# .env file

# Replace with your Telegram Bot Token from BotFather
TELEGRAM_BOT_TOKEN="YOUR_TELEGRAM_BOT_TOKEN"

# Replace with the recipient's Telegram Chat ID from @userinfobot
TELEGRAM_CHAT_ID="YOUR_TELEGRAM_CHAT_ID"
    ```

    *   **To get a Bot Token:** Talk to the [BotFather](https://t.me/BotFather) on Telegram.
    *   **To get a Chat ID:** Talk to the [@userinfobot](https://t.me/userinfobot) on Telegram.

4.  **Start the server:**
    ```bash
    npm start
    ```

The server will run on `http://localhost:3001`. If the environment variables are not set correctly, the server will exit with an error.

## API Endpoint

### `POST /send-telegram`

Sends a message to the configured Telegram chat.

**Request Body:**

```json
{
  "message": "The message to send."
}
```

**Response (Success):**

```json
{
  "success": true,
  "data": { ... Telegram API response ... }
}
```

**Response (Error):**

```json
{
  "success": false,
  "error": "Error message."
}
```
