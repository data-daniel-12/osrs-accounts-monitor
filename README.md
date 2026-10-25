# 🍀 LuckyCharm Accounts • OSRS Live Availability Monitor

[![Live Demo](https://img.shields.io/badge/Demo-Vercel%20Production-success?style=for-the-badge&logo=vercel)](https://osrs-accounts-monitor.vercel.app)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-blue?style=for-the-badge&logo=node.js)](https://nodejs.org)
[![Express](https://img.shields.io/badge/Express-5.x-black?style=for-the-badge&logo=express)](https://expressjs.com)
[![Status](https://img.shields.io/badge/OSRS_Sync-Active-gold?style=for-the-badge)](https://osrs-accounts-monitor.vercel.app/api/status)

A modern, high-performance real-time monitor, webhook engine, and public REST API for **Old School RuneScape (OSRS)** account availability. Styled with the official design aesthetics of [LuckyCharmGold](https://luckycharmgold.com/).

---

## 🌐 Live Production Demo

* **Web Dashboard:** [https://osrs-accounts-monitor.vercel.app](https://osrs-accounts-monitor.vercel.app)
* **Live In-Stock API:** [https://osrs-accounts-monitor.vercel.app/api/availability?format=simple&only_in_stock=true](https://osrs-accounts-monitor.vercel.app/api/availability?format=simple&only_in_stock=true)
* **Monitor Health & Status:** [https://osrs-accounts-monitor.vercel.app/api/status](https://osrs-accounts-monitor.vercel.app/api/status)

---

## ⚡ The Challenge & How It Works

When coordinating account sales, boosting, and leveling services, account builds (combat stats, quests like Barrows Gloves, untradeables) and pricing remain largely static, while supplier **Available** inventory changes dynamically.

Suppliers often share stock as a read-only Google Spreadsheet:
> `https://docs.google.com/spreadsheets/d/1LLjq5dvk6-jGYYjodozsk7x1BFPhHKje9jNGM68GpQM/edit#gid=0`

### Zero-Credentials Google Sheets Live Sync
Because external viewers have read-only access without edit rights to install Google Apps Scripts, this service queries the **Google Visualization API (`/gviz/tq`)**:
```text
https://docs.google.com/spreadsheets/d/{SHEET_ID}/gviz/tq?tqx=out:json&sheet={SHEET_NAME}
```
This endpoint extracts structured JSON directly from the live spreadsheet without requiring API keys, Google Cloud console projects, or credentials.

---

## ✨ Features & Architecture

### 🎨 1. LuckyCharmGold Design System
- **Typography:** Google Fonts [`Freeman`](https://fonts.google.com/specimen/Freeman) for bold gaming headings and [`Epilogue`](https://fonts.google.com/specimen/Epilogue) for clean body typography.
- **Color Palette:** Deep obsidian background (`#0B0B0B` / `#141414`), Lucky Charm clover green (`#00C853`), and golden gradient pill buttons (`#FFCF4A` ➔ `#FFBB01`).
- **Brand Identity:** Integrated official [logo.webp](./public/logo.webp) in the responsive navigation bar.

### 🌐 2. Dual-Language Support (i18n)
- **Default Language:** English (`🇺🇸 EN`).
- **Interactive Selector:** Dropdown `<select>` with custom country flags allowing seamless switching between English and Spanish (`🇪🇸 ES`).
- **Full Coverage:** Metric titles, table headers, filter placeholders, badges, modal notices, and empty states update dynamically on change.

### ⚡ 3. Real-Time Account Filtering & Rapid Order Copying
- **Search Engine:** Filter by build characteristics (`99 strength`, `94 magic`, `barrows gloves`, `fire cape`, `piety`, `zulrah`, `HCIM`), specific Google Sheet row numbers, or category.
- **Stock Toggle:** One-click toggle between "In Stock Only" and "All Cataloged Accounts".
- **One-Click Order Copying:** Generates pre-formatted inquiry text with row reference, category, and price for instant pasting into Discord or WhatsApp trade channels:
  ```text
  🍀 [LuckyCharm Order Request]
  Account: 60 Attack Piety Pure
  Category: Piety
  Price: $180
  Sheet Row: #24
  Link: https://osrs-accounts-monitor.vercel.app
  ```

### 🔔 4. Automated Discord Webhook Engine
- Configurable Webhook URL with test dispatch button.
- Rich Discord Embeds with color-coded status badges:
  - 🟢 **New Stock:** Account was at `0` and now has stock.
  - 📈 **Stock Increased:** Supplier added additional accounts.
  - 🔴 **Sold Out:** All units for that build were claimed.
  - 📉 **Stock Decreased:** Units purchased.

### 🔌 5. Developer & Integrations Hub (Bottom Section)
Keeps the main navigation uncluttered while offering a dedicated bottom hub containing:
- Discord Webhook configuration and live dispatch test.
- Interactive API endpoint documentation and curl examples.
- Audit trail displaying the last 150 inventory changes with timestamps, row numbers, and delta quantities.

---

## 🛠️ Tech Stack & Deployment

| Layer | Technology |
|---|---|
| **Frontend** | Semantic HTML5, Vanilla Modern CSS, ES6+ JavaScript |
| **Backend** | Node.js (v18+), Express 5, CORS |
| **Data Ingestion** | Google Visualization API (`/gviz/tq`) |
| **Serverless Deployment** | Vercel Serverless Functions (`api/index.js` + `vercel.json`) |
| **Caching** | Pre-seeded static catalog (`accounts_catalog.json`) for sub-50ms cold starts |

---

## 🚀 Getting Started (Local Development)

### Prerequisites
* [Node.js](https://nodejs.org/) v18.0.0 or higher
* npm (bundled with Node.js)

### Installation
```bash
# 1. Clone the repository
git clone https://github.com/data-daniel-12/osrs-accounts-monitor.git
cd osrs-accounts-monitor

# 2. Install dependencies
npm install

# 3. Start the local server
npm start
```

Open your browser at:  
👉 **`http://localhost:3000`**

---

## ☁️ Deploying to Vercel

The repository includes a ready-to-deploy [`vercel.json`](./vercel.json) configuration:

```json
{
  "rewrites": [
    { "source": "/api/(.*)", "destination": "/api/index.js" }
  ]
}
```

### Automatic Deployment
```bash
# Login to Vercel
npx vercel login

# Deploy directly to production
npx vercel --prod --yes
```

---

## 📡 REST API Reference

All endpoints return standard JSON and support CORS for cross-origin integration.

### 1. Simple Availability Map (Lightweight)
Query only the in-stock account rows for bots and fast synchronization:
```http
GET /api/availability?format=simple&only_in_stock=true
```
**Response:**
```json
{
  "7": 1,
  "8": 8,
  "9": 10,
  "10": 11,
  "11": 15,
  "18": 6,
  "23": 1,
  "24": 7
}
```
*(Keys correspond to the exact row numbers in the supplier's Google Sheet).*

### 2. Array of Tuples
```http
GET /api/availability?format=pairs&only_in_stock=true
```
**Response:**
```json
[[7, 1], [8, 8], [9, 10], [10, 11], [11, 15], [18, 6]]
```

### 3. Full Accounts Catalog
Retrieve full account details (build stats, supplies, category, price) merged with live stock:
```http
GET /api/accounts?only_available=true
```
**Response:**
```json
{
  "total": 61,
  "lastSyncTime": "2026-10-25T21:25:43.034Z",
  "accounts": [
    {
      "row": 8,
      "id": 2,
      "category": "Pures",
      "available": 8,
      "price": 60,
      "priceFormatted": "$60",
      "supplies": "50m",
      "build": "50 attack 99 str 99 range 94 mage 43-44 prayer 75-80 hp - Mith gloves - dt done"
    }
  ]
}
```

### 4. Monitor Status & Health
```http
GET /api/status
```
**Response:**
```json
{
  "online": true,
  "lastSyncTime": "2026-10-25T21:25:43.034Z",
  "lastSyncSuccess": true,
  "lastError": null,
  "pollIntervalSeconds": 15,
  "totalAccounts": 116,
  "inStockAccounts": 61,
  "hasDiscordWebhook": false
}
```

### 5. Server-Sent Events (SSE Stream)
```http
GET /api/stream
```
Connect via SSE to receive real-time push events whenever stock levels change without polling.

---

## 📂 Project Structure

```text
├── api/
│   └── index.js             # Vercel serverless function entrypoint
├── public/
│   ├── index.html           # LuckyCharmGold themed web dashboard
│   ├── style.css            # Custom CSS (Freeman, Epilogue, gold theme)
│   ├── app.js               # Frontend controller (i18n, search, copy order)
│   └── logo.webp            # LuckyCharmGold brand logo asset
├── accounts_catalog.json    # Cached static catalog for instant cold starts
├── config.json              # Local configuration (interval, webhook URLs)
├── monitor.py               # Standalone Python monitor alternative
├── server.js                # Express backend, poller engine, & webhook handler
├── vercel.json              # Vercel routing and serverless rewrites
├── .gitignore               # Ignored files (node_modules, .vercel, logs)
└── package.json             # Node dependencies and project scripts
```

---

## 📄 License
This project is open-source and available under the [ISC License](./package.json).
