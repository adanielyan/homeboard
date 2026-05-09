# Homeboard

Homeboard is a kiosk-friendly single-page dashboard for weather, time zones, and a shared Google Calendar. It runs as one Cloudflare Worker application with static assets served through the Cloudflare Vite plugin.

## Stack

- Preact `10.27.1`
- Vite `7.1.4`
- Tailwind CSS `4.1.13`
- Cloudflare Workers Vite plugin `1.12.3`
- Wrangler `4.34.0`

## Local setup

1. Install dependencies with `npm install`.
2. Copy [.dev.vars.example](/Users/adanielyan/Projects/homeboard/.dev.vars.example) to `.dev.vars` and fill in the real values.
3. Share your Google Calendar with the service account email as a read-only calendar member.
4. Start the app with `npm run dev`.
5. Open `http://localhost:5173/?token=YOUR_APP_AUTH_TOKEN`.

## API

- `GET /api/config`
- `GET /api/weather`
- `GET /api/calendar/events`

All API requests require `Authorization: Bearer <token>`.

## Notes

- The frontend stores the token in `sessionStorage` and removes it from the visible URL after boot.
- Weather uses Open-Meteo with lat/lon env vars.
- Calendar uses the Google Calendar REST API with a JWT service-account flow.
