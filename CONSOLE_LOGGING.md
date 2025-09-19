# Console Logging Tool

This tool captures all console messages from your app running in a headless browser.

## Usage

1. **Start the dev server first:**
   ```bash
   npm run dev
   ```

2. **In another terminal, capture console logs:**
   ```bash
   npm run console:logs
   ```

## What it does

- Launches your app in a headless Chromium browser
- Captures all console messages (log, info, warn, error, debug)
- Color-codes messages by type
- Waits for the app to fully load
- Provides a summary of all messages
- Highlights errors and warnings prominently

## Example Output

```
🚀 Launching app in headless browser to capture console logs...

📄 Navigating to http://localhost:5173...

⏳ Waiting for app to fully initialize...

✅ Canvas element found - app appears to be loaded

📊 Console Log Summary:

LOG: 15 messages
INFO: 8 messages
WARN: 3 messages
ERROR: 0 messages

📈 Total: 26 console messages captured

🚨 ERRORS (0):
⚠️  WARNINGS (3):
  Warning: Component template validation...
  Warning: Missing plugin dependency...
  Warning: Deprecated API usage...
```

## Features

- **Real-time logging**: See messages as they happen
- **Color-coded output**: Easy to spot errors vs warnings vs info
- **Summary statistics**: Overview of message types
- **Error highlighting**: Prominently displays errors and warnings
- **Timeout handling**: Won't hang if app doesn't load properly

## Troubleshooting

- Make sure the dev server is running on port 5173
- The script will wait up to 30 seconds for the page to load
- If the canvas element isn't found, it will still capture console logs
- Check the browser console for any issues with the headless setup