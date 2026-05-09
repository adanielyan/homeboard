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
3. Set `CALENDAR_ICAL_URL` to an ICS feed URL for the calendar you want to display.
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
- Calendar uses an ICS feed URL from `CALENDAR_ICAL_URL`.

## Deploying to Cloudflare

This app is already structured as a Cloudflare Worker with static assets:

- Worker entry: [src/worker/index.ts](/Users/adanielyan/Projects/homeboard/src/worker/index.ts)
- Wrangler config: [wrangler.toml](/Users/adanielyan/Projects/homeboard/wrangler.toml)
- Build command: `npm run build`
- Deploy command: `npx wrangler deploy`

For automatic deploys from GitHub, use Cloudflare Workers Builds:

1. Push this repo to GitHub and make sure the production branch is `master`.
2. In Cloudflare, go to `Workers & Pages` and import or connect this repository to a Worker named `homeboard`.
3. Set the root directory to the repository root.
4. Use `npm install` as the install command.
5. Use `npm run build` as the build command.
6. Use `npx wrangler deploy` as the deploy command.
7. In Cloudflare Worker settings, add these runtime values before the first production deploy:
   - Secrets: `APP_AUTH_TOKEN`
   - Secret or variable: `CALENDAR_ICAL_URL`
   - Variables: `WEATHER_LATITUDE`, `WEATHER_LONGITUDE`, `WEATHER_LOCATION_LABEL`, `WEATHER_TEMPERATURE_UNIT`, `WEATHER_WIND_SPEED_UNIT`, `WEATHER_PRECIPITATION_UNIT`, `PRIMARY_TIMEZONE`, `SECONDARY_TIMEZONE`, `PRIMARY_TIMEZONE_LABEL`, `SECONDARY_TIMEZONE_LABEL`, `DISPLAY_LOCALE`
8. In `Settings > Builds > Branch control`, set the production branch to `master`.

After that, each push to `master` will build and deploy automatically.
