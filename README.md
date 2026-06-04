# Elio Tax Pipeline

AI-powered Slack bot that generates live UI components using Google Gemini in real-time.

## Overview

Mention the bot in Slack with a UI request (e.g., "create a green button"), and it automatically generates clean HTML/CSS code, commits it to GitHub, and serves a live preview.

## Features

- **Slack Integration**: Respond to mentions with AI-generated components
- **Gemini-Powered**: Uses Google's Gemini 2.5 Flash model for instant code generation
- **Automated Workflow**: Auto-commits changes and pushes to GitHub
- **Live Preview**: Serves generated HTML on port 3000

## Quick Start

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set environment variables** (.env):
   ```
   SLACK_BOT_TOKEN=xoxb-...
   SLACK_APP_TOKEN=xapp-...
   GEMINI_API_KEY=...
   GH_TOKEN=...
   PORT=3000
   ```

3. **Run locally**:
   ```bash
   npm start
   ```

## Deployment

Built with Docker for seamless deployment:

```bash
docker build -t elio-tax-pipeline .
docker run -p 3000:3000 --env-file .env elio-tax-pipeline
```

## Tech Stack

- **Runtime**: Node.js 20 (TypeScript)
- **Bot Framework**: Slack Bolt
- **AI Model**: Google Gemini 2.5 Flash
- **Version Control**: Git + GitHub API
- **Container**: Docker

## How It Works

1. User mentions bot in Slack with UI request
2. Gemini generates valid HTML/CSS code
3. Code writes to `index.html`
4. Changes auto-commit and push to GitHub
5. Web server serves live preview on `/`

## License

ISC