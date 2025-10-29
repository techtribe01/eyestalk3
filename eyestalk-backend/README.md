# EyesTalk Backend

This backend server handles sending notifications to a caregiver via Telegram.

## Setup

1.  Navigate to the `eyestalk-backend` directory.
2.  Install the dependencies:
    ```bash
    npm install
    ```
3.  Start the server:
    ```bash
    npm start
    ```

The server will run on `http://localhost:3001`.

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