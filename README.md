# 🍀 LuckyCharm Accounts • OSRS Live Availability Monitor

A lightweight, high-performance real-time monitor and webhook dispatcher for **Old School RuneScape (OSRS)** account availability, styled after the [LuckyCharmGold](https://luckycharmgold.com/) gaming store.

---

## ⚡ Overview

When managing account boosting, leveling, or sales, account builds, quest requirements, and pricing remain static, while the **Available** stock changes dynamically.

Since the supplier spreadsheet is read-only, this service leverages the Google Visualization API (`/gviz/tq`) to poll the live spreadsheet externally without requiring editor permissions or Google Apps Scripts.

### Key Features
* **LuckyCharmGold UI:** Built with official LCG design tokens, fonts (`Freeman` & `Epilogue`), and gold gradient pill buttons.
* **Instant Filtering & Search:** Rapidly search by build stats (e.g. `99 strength`, `94 magic`, `barrows gloves`), category, or row number.
* **One-Click Order Copying:** Generates formatted order messages ready for instant negotiation on Discord or WhatsApp.
* **Language Selector:** Toggle between English (default) and Spanish via header dropdown selector.
* **Discord Webhook Simulator:** Automatically sends rich Discord embeds whenever stock changes or new accounts drop.
* **REST API & SSE:** Query lightweight availability maps or connect via Server-Sent Events for real-time sync.
* **Ready for Local & Vercel:** Deploy to Vercel in seconds with zero extra configuration.

---

## 🚀 Quick Start (Local)

### Prerequisites
* Node.js (v18 or higher)
* npm

### Installation
```bash
# Clone or open the repository directory
cd OSRS

# Install dependencies
npm install

# Start the monitor server
npm start
```

Open your browser at:
👉 **[http://localhost:3000](http://localhost:3000)**

---

## ☁️ Deploy to Vercel

This repository is pre-configured for Vercel Serverless deployment via `vercel.json` and `api/index.js`.

1. Push this repository to GitHub or GitLab.
2. Go to [Vercel](https://vercel.com/) and click **Add New Project**.
3. Import your repository and click **Deploy**.
4. Vercel automatically deploys the static dashboard and mounts `/api/*` serverless routes.

---

## 🔌 API Reference

Integrate live availability directly into your custom bots, backend services, or databases.

### 1. Simple Availability Map (Lightweight)
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
  "18": 6
}
```
*(Keys represent the exact Google Spreadsheet row numbers).*

### 2. Array of Pairs
```http
GET /api/availability?format=pairs&only_in_stock=true
```
**Response:** `[[7, 1], [8, 8], [9, 10], [10, 11]]`

### 3. Full Accounts Catalog
```http
GET /api/accounts?only_available=true
```
Returns all accounts with static columns (`category`, `build`, `supplies`, `price`) merged with dynamic `available` stock.

### 4. Server-Sent Events (SSE)
```http
GET /api/stream
```
Push events stream emitted in real time whenever stock levels change.

### 5. Static Catalog Export
* **JSON:** [`accounts_catalog.json`](./accounts_catalog.json) (auto-generated in root)
* **CSV:** `GET /api/export/catalog.csv`

---

## 🔔 Discord Webhook Configuration

1. In your Discord server: `Channel Settings` ➔ `Integrations` ➔ `Webhooks` ➔ `New Webhook` ➔ `Copy Webhook URL`.
2. Scroll to the **Webhook & API Integration** section at the bottom of the page.
3. Paste the URL into the **Discord Webhook URL** field and click **Test Discord Webhook**.
4. Click **Save Configuration**. Instant alerts will now fire whenever accounts change stock!

---

## 📂 Project Structure

```text
├── api/
│   └── index.js             # Vercel serverless entry point
├── public/
│   ├── index.html           # LuckyCharmGold themed dashboard
│   ├── style.css            # Stylesheet (Freeman & Epilogue typography)
│   ├── app.js               # Client controller (i18n, search, SSE)
│   └── logo.webp            # LuckyCharmGold official brand logo
├── accounts_catalog.json    # Cached static catalog for data cross-referencing
├── config.json              # Local polling & webhook configuration
├── monitor.py               # Standalone Python alternative script
├── server.js                # Express backend, poller, & webhook engine
├── vercel.json              # Vercel routing configuration
├── .gitignore               # Git ignore rules
└── package.json             # Project dependencies & scripts
```

---

## 📜 License
ISC
