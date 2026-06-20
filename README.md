# Diamond Reply Tool Backend

Hosted backend for the Diamond Reply Assistant Chrome extension.

This repo is ready to deploy to Vercel.

## API endpoints

After deployment, your base URL will look like:

```text
https://your-project-name.vercel.app
```

Available endpoints:

```text
GET  /api/health
GET  /api/training
POST /api/suggest-replies
```

## Environment variables

Add these in Vercel under **Project Settings → Environment Variables**:

```text
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-4o-mini
```

Do not commit your API key to GitHub.

## Deploy to Vercel

1. Go to Vercel.
2. Click **Add New → Project**.
3. Import this GitHub repository:

```text
DiamondLocalMarketingCo/Diamond-Reply-Tool
```

4. Framework preset: **Other**.
5. Add the environment variables above.
6. Click **Deploy**.

## Test after deployment

Open:

```text
https://your-project-name.vercel.app/api/health
```

Expected response:

```json
{
  "ok": true,
  "service": "Diamond Reply Tool API"
}
```

Then open:

```text
https://your-project-name.vercel.app/api/training
```

Expected response:

```json
{
  "ok": true,
  "styleGuideLoaded": true,
  "examplesLoaded": 9
}
```

## Chrome extension setting

In the Diamond Reply Assistant extension popup, set **Backend URL** to your deployed base URL, with no trailing slash:

```text
https://your-project-name.vercel.app
```

Do not include `/api/suggest-replies`. The extension adds that route automatically.

## Training files

You can improve the AI replies by editing:

```text
training/style-guide.txt
training/reply-examples.json
```

After you push edits to GitHub, Vercel should redeploy automatically.

## Example API request

```bash
curl -X POST https://your-project-name.vercel.app/api/suggest-replies \
  -H "Content-Type: application/json" \
  -d '{
    "context": "Prospect said: Sometimes",
    "goal": "personal_story",
    "tone": "mostafa",
    "offer": "Free 7-day trial of the AI receptionist."
  }'
```
