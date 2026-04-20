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
├── Scripts/
│   ├── Pages/
│   │   ├── LoginPage.ts        # Handles navigation & CAPTCHA
│   │   └── HomePage.ts         # Filter selection & data extraction
│   ├── Tests/
│   │   └── ScrapeData.spec.ts  # Test entry point
│   └── Utils/
│       ├── AuthManager.ts      # Session save/load (cookies)
│       ├── DateUtils.ts        # Date formatting helpers
│       └── Timeouts.ts         # Shared timeout constants
├── test-results/               # CSV output saved here
├── auth.json                   # Saved session cookies (auto-generated)
├── playwright.config.ts
└── README.md
```

---

## Setup

### Prerequisites

- Node.js (v18+)
- npm

### Install Dependencies

# Initialise the project
npm init -y

# Initialise Playwright
npm init playwright@latest

---

## Running the Test
npx playwright test --headed --project=chromium

The `--headed` flag is required so you can manually solve the CAPTCHA when it appears.

---

## How It Works

### 1. Session Management
On startup, the test checks if `auth.json` exists and loads the saved session automatically:

```typescript
test.use({
    storageState: fs.existsSync('auth.json') ? 'auth.json' : undefined
});
```

### 2. CAPTCHA Handling
The `LoginPage` navigates to the market data URL and checks if the filters page is already loaded:
- **Session valid** → logs `✓ Session loaded, no CAPTCHA` and continues
- **Session expired/missing** → detects the CAPTCHA, clicks the Begin button, logs a warning, gives you **30 seconds** to solve it manually, then saves the session to `auth.json`

### 3. Filter Selection
Filters are configured via `HomePage` methods:

```typescript
await homePage.SelectTradingModality("Continuous");
await homePage.SelectDeliveryDate(0);       // 0 = today, 1 = tomorrow, etc.
await homePage.SelectProduct("30min");
await homePage.SelectView("Table");
await homePage.SelectMarketArea("GB");
```

**Trading Modality options:** `Auction` | `Continuous` | `Capacity Auction` | `Guarantees of Origin`

**Product options:** `60min` | `30min` | `15min`

**View options:** `Map` | `Table` | `Graph`

**Delivery Date:** Pass a number — `0` for today, `1` for tomorrow, `-1` for yesterday

### 4. Data Extraction
After filters are applied, the following columns are extracted:

| Column | Description |
|--------|-------------|
| Hours | Time slot (e.g. 00:00 - 00:30) |
| Low | Lowest price (€/MWh) |
| High | Highest price (€/MWh) |
| Last | Last traded price (€/MWh) |
| Weight Avg. | Volume-weighted average price (€/MWh) |

### 5. CSV Export
Data is saved to:
```
test-results/market-data-YYYY-MM-DD_HH-MM-SS.csv
```

Each run creates a new timestamped file so historical data is preserved.

---

## Example Test

```typescript
test("Market Data Extraction", async ({ page, context }) => {
    const loginPage = new LoginPage(page, context);
    const homePage = new HomePage(page);

    await loginPage.NavigateToMarketData(`${BASE_URL}`);
    await homePage.SelectTradingModality("Continuous");
    await homePage.SelectDeliveryDate(0);   // today
    await homePage.SelectProduct("30min");
    await homePage.SelectView("Table");
    await homePage.SelectMarketArea("GB");
    await homePage.ExtractTableData();
});
```

---

## Notes

- On first run, delete `auth.json` if it exists to force a fresh login and CAPTCHA solve
- Run the tests in `--headed` mode for manual CAPTCHA solving
- CSV files are timestamped so each run's data is saved separately
- `SelectDeliveryDate` accepts a number offset from today — useful for extracting historical or future data