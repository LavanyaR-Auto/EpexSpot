# EPEX Spot Market Data Scraper

An automated data extraction framework built with **Playwright** and **TypeScript** that scrapes market data from [epexspot.com](https://www.epexspot.com/en/market-results) and exports it to CSV.

---

## Tech Stack

- [Playwright](https://playwright.dev/) — browser automation
- TypeScript
- Node.js

---

## Project Structure

```
Project_BradyTech/
├── Output/                     # CSV files saved here (auto-created, excluded from git)
├── Scripts/
│   ├── Pages/
│   │   ├── HomePage.ts         # Filter selection & data extraction
│   │   └── LoginPage.ts        # Handles navigation & CAPTCHA
│   ├── Tests/
│   │   └── ScrapeData.spec.ts  # Test entry point
│   └── Utils/
│       ├── DateUtils.ts        # Date formatting helper
│       └── Timeouts.ts         # Shared timeout constants
├── test-results/               # Playwright test reports
├── .gitignore
├── auth.json                   # Saved session cookies (auto-generated, excluded from git)
├── package.json
├── playwright.config.ts
└── Readme.md
```

---

## Setup

### 1. Initialise the project

```
npm init -y
```

### 2. Initialise Playwright

```
npm init playwright@latest
```

### 3. Run the test

```
npx playwright test
```

### 4. View last test report

```
npx playwright show-report
```

---

## How It Works

### 1. Session Management
On startup, the test automatically loads a saved session if `auth.json` exists:

```typescript
test.use({
    storageState: fs.existsSync('auth.json') ? 'auth.json' : undefined
});
```

### 2. CAPTCHA Handling
`LoginPage` navigates to the market data URL and checks if the filters page is already visible:

- **Session valid** → logs `✓ Session loaded, no CAPTCHA` and continues immediately
- **Session expired/missing** → detects the CAPTCHA, clicks the Begin button, gives you **30 seconds** to solve it manually, then saves the session to `auth.json` for future runs

### 3. Filter Selection
Filters are configured in `ScrapeData.spec.ts` via `HomePage` methods:

```typescript
await homePage.SelectTradingModality("Continuous");
await homePage.SelectDeliveryDate(0);   // 0 = today, 1 = tomorrow, -1 = yesterday
await homePage.SelectProduct("30min");
await homePage.SelectView("Table");
await homePage.SelectMarketArea("GB");
```

**Trading Modality:** `Auction` | `Continuous` | `Capacity Auction` | `Guarantees of Origin`

**Product:** `60min` | `30min` | `15min`

**View:** `Map` | `Table` | `Graph`

**Delivery Date:** number offset from today — `0` = today, `1` = tomorrow, `-1` = yesterday

### 4. Data Extraction
After filters are applied the following columns are extracted from the market results table:

| Column | Description |
|--------|-------------|
| Hours | Time slot (e.g. 00:00 - 00:30) |
| Low | Lowest price (€/MWh) |
| High | Highest price (€/MWh) |
| Last | Last traded price (€/MWh) |
| Weight Avg. | Volume-weighted average price (€/MWh) |

### 5. CSV Export
Data is saved to the `Output` folder with a timestamped filename:

```
Output/market-data-YYYY-MM-DD_HH-MM-SS.csv
```

The `Output` folder is created automatically if it does not exist. Each run produces a new file so no data is ever overwritten.

---

## Configuration

`playwright.config.ts` is configured to:
- Run in **headed mode** by default (`headless: false`) so CAPTCHA can be solved manually
- Run on **Chromium only** — Firefox and WebKit are commented out but can be enabled
- Capture traces on first retry for debugging

---

## Utilities

**DateUtils.ts** — formats dates for the delivery date filter:
```typescript
GetFormattedDate(daysToAdd: number) // returns e.g. "20 Apr. 2026"
```

**Timeouts.ts** — shared timeout constants used across the project:
```
shortwait  = 4000ms
mediumwait = 10000ms
longwait   = 20000ms
```

---

## Example Test

```typescript
test("Market Data Extraction", async ({ page, context }) => {
    const loginPage = new LoginPage(page, context);
    const homePage = new HomePage(page);

    await loginPage.NavigateToMarketData(`${BASE_URL}`);
    await homePage.SelectTradingModality("Continuous");
    await homePage.SelectDeliveryDate(0);
    await homePage.SelectProduct("30min");
    await homePage.SelectView("Table");
    await homePage.SelectMarketArea("GB");
    await homePage.ExtractTableData();
});
```

---

## Notes

- Delete `auth.json` to force a fresh login and CAPTCHA solve
- `auth.json` and `Output/` are excluded from git via `.gitignore`
- `SelectDeliveryDate` accepts a number offset — useful for extracting historical or future data