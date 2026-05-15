# Zaib Stock Watcher

Polls one or more zaibonline.com (Shopify) products and emails you when a watched
size comes back in stock.

## How it works

Shopify serves per-variant availability at `<product-url>.js` (plain JSON). No browser /
Selenium needed — the script `fetch`es that endpoint for each product, checks the watched
sizes, compares to the last run (`state.json`), and emails on a `not available -> available`
flip. A size counts as available if **any** variant carrying it is in stock (covers products
that split a size across sub-variants like "M (W/Sleeves)" / "M (Without Sleeves)").

## Setup

1. Install deps:
   ```
   npm install
   ```
2. Create config:
   ```
   cp config.example.json config.json
   ```
   Edit `config.json`:
   - `products` — array of zaibonline.com product URLs to watch (add/remove freely)
   - `watchSizes` — sizes to watch, e.g. `["M", "L"]` or all of `["XS","S","M","L","XL","XXL"]`
   - `intervalMinutes` — poll interval
   - `email.user` — your Gmail address
   - `email.appPassword` — Gmail App Password (16 chars; spaces ok)
   - `email.to` — where alerts go

## Test the email

Sends one test email and exits — confirms creds work before you rely on it:
```
node check.js --test
```

## Run

Foreground:
```
node check.js
```

Background (survives terminal close, logs to file):
```
nohup node check.js > watcher.log 2>&1 &
```
Stop background run: `pkill -f check.js`. Watch log: `tail -f watcher.log`

## Notes

- One email per size per flip — it won't spam while a size stays in stock. If a size sells
  out again, the next time it returns you get a fresh alert.
- On the first run for a newly-added product, any already-available watched size triggers an
  email immediately.
- `state.json` is auto-created, keyed per product. Delete it to reset everything.
- If an alert email fails all 3 retries, that size's state is rolled back so the next poll
  re-attempts the email (no missed alert). All failures are logged.
