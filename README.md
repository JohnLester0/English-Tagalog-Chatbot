# Kuwentuhan Bot

Filipino / English / Taglish chatbot with jokes and stories.

## Requirements
- Node.js/npm
- Python 3.10+ (Python 3.12 recommended)

## Run on Windows, Linux, or macOS
1. Extract this ZIP.
2. Open a terminal in the `Chatbot` folder (the folder containing `package.json`).
3. Run:

```bash
npm run dev
```

The first run automatically creates a Python virtual environment, installs `requirements.txt`, and copies `.env.example` to `.env` if needed. The first run may take a few minutes and requires an internet connection to install Python packages.

Open http://127.0.0.1:8000. Stop the server with Ctrl+C.

If Python is not found, install Python 3 and enable **Add Python to PATH** on Windows, then reopen your terminal. If npm is not found, install Node.js.

## Pages
- `/` chat app (language modes, jokes, stories, thumbs up/down)
- `/admin` stats + CSV export (needs `ADMIN_TOKEN`)
- `/health` status check

## Configuration
Review `.env` for provider and API settings. Never share a `.env` file containing private API keys.
