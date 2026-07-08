# AcreWise — How to Use Guide

> **Live URLs**
> - 🌐 Frontend: [https://acrewise.vercel.app](https://acrewise.vercel.app)
> - ⚙️ Backend API: [https://acrewise-9zrp.onrender.com](https://acrewise-9zrp.onrender.com)
> - 📊 GraphQL Playground: [https://acrewise-9zrp.onrender.com/graphiql](https://acrewise-9zrp.onrender.com/graphiql)

---

## What is AcreWise?

AcreWise is a full-stack PropTech platform for the Nigerian rental and property sale market. It connects **landlords** and **tenants** and handles:

- Property listings (rent & sale) with photos, prices, and rent schedules
- Automated rent payments via **Nomba virtual accounts**
- **Purchase Escrow** — buyer funds held securely until landlord releases them
- Utility bill payments (electricity, airtime, cable TV, betting)
- Payouts to bank accounts
- **Live FX conversion** of NGN prices to 10+ global currencies
- POS terminal management
- Property-locked chatrooms between landlord and tenant
- Receipt / audit vault

---

## Tech Stack

| Layer | Technology |
|:---|:---|
| Frontend | React + Vite + Tailwind CSS |
| Backend | Spring Boot 4 (Java 21) |
| Database | Supabase PostgreSQL (Transaction Pooler) |
| Cache / Sessions | Upstash Redis |
| Payments | Nomba API (virtual accounts, card, flash) |
| FX Rates | Frankfurter Open API |
| Deployment | Vercel (frontend) · Render (backend) |

---

## Getting Started

### 1. Open the App

Navigate to [https://acrewise.vercel.app](https://acrewise.vercel.app).

### 2. Register or Log In

Click **Get Started** then **Register**.

| Field | Notes |
|:---|:---|
| Name | Your full name |
| Email | Used as your unique ID |
| Role | `TENANT` or `LANDLORD` |

> You can upgrade from TENANT to LANDLORD later from your profile.

Click **Login** on subsequent visits — just enter your email.

---

## Landlord Dashboard

After logging in as a **Landlord** you will see the left sidebar with these tabs:

---

### Overview

Shows a summary dashboard with total properties listed, active tenancies, total rent collected, and escrow funds held.

Click **Initialize Demo Data** to seed sample properties, landlords, and leases into the database for testing.

---

### Properties

Lists all your properties. For each property you can:

- **Link Meter** — bind an electricity meter (IKEDC, EKEDC, etc.) to the property
- **Assign Caretaker** — add a caretaker name, email, and phone number
- **Chat** — open a private chat with the tenant

#### Listing a New Property

Click **+ List Property** (top right). Fill in:

| Field | Required | Notes |
|:---|:---|:---|
| Property Title | Yes | e.g. "Eko Atlantic Penthouse, Unit 4B" |
| Property Photo | No | Click the dashed box to **upload a photo from your device** (JPG/PNG/WEBP, max 5MB). Preview shows immediately. |
| Listing Type | Yes | `RENT` or `SALE` |
| Status | Yes | `LISTED` = visible on marketplace |
| Area / Location | Yes | e.g. "Lekki Phase 1" |
| Building Type | Yes | e.g. "Duplex", "Penthouse" |
| Listing Price (NGN) | Yes | Annual rent or sale price |
| Total Rooms / Flats | Yes | Number of available units |
| First Payment (NGN) | No | Amount tenant pays upfront to secure the property (RENT only) |
| Payment Frequency | No | Monthly / Every 6 Months / Annual (RENT only) |
| Annual Projections Yr 1–5 | No | Expected rent per year for the next 5 years (RENT only) |
| Ownership Document URL | No | Private link to your C of O / deed. Never shown publicly. Activates the **"Assured by AcreWise"** gold badge on your listing. |
| Invite Tenant Email | No | Instantly link an existing tenant to this property |

Click **List Property** to publish.

---

### Leases

Shows all active tenancy records. Each card displays the tenant ID, rent amount and frequency, next due date, arrears balance, and virtual account number.

Click **Pay Now** to simulate a payment for any tenancy.

---

### Purchase Escrows

#### What is a Purchase Escrow?

When a tenant buys a **SALE** property on the marketplace, their payment is NOT sent directly to you. It is locked in a Nomba virtual account and stays in **HELD** state. The funds only move when you take action.

Each escrow card shows:
- Status: `HELD` / `RELEASED` / `REJECTED`
- Buyer email
- Virtual account ID
- Amount held in NGN

#### Release Funds

Click **Release Funds** then Confirm in the modal.

What happens:
1. Property status changes to `SOLD`
2. Funds are disbursed to your account
3. A receipt is generated in your vault

#### Reject

Click **Reject** then Confirm in the modal.

What happens:
1. Escrow is cancelled
2. Property is relisted on the marketplace as `LISTED`
3. Buyer gets their money back via Nomba dispute flow

---

### Unmatched Queue

Shows incoming payments that could not be automatically matched to a tenancy (wrong amount or wrong account). You can manually reconcile them here.

---

### Payouts

Transfer money from your Nomba wallet to any Nigerian bank account.

1. Select bank code (e.g. GTBank = `058`)
2. Enter account number then click **Verify** to confirm the account name
3. Enter amount and your transaction PIN
4. Click **Send Payout**

---

### Utilities

Pay bills directly from the AcreWise dashboard using Nomba.

| Type | Details |
|:---|:---|
| Electricity | Enter meter number, select DISCO, enter amount to vend token |
| Airtime / Data | Select carrier, enter phone number, select plan |
| Cable TV | Select DSTV/GOTV/Startimes, verify smartcard, pick package |
| Betting | Fund SportyBet/BetKing/1xBet accounts by customer ID |

---

### POS Terminals

Manage physical Nomba card readers assigned to your landlord account. Click **Sync Nomba Terminals** to refresh the list from Nomba's API.

> **What is a POS Terminal?**
> A POS (Point of Sale) terminal is a physical card machine that tenants can use to pay rent in-person at your office or property gate. AcreWise integrates with Nomba's terminal management API so landlords can track which devices are assigned to them.

---

### Chat

Private locked chatrooms between you and each tenant, organised per property. Select a property from the left panel, type and send messages.

---

### Developer Console

Playground for testing the Nomba API directly from the dashboard.

- **API Playground** — select any Nomba API endpoint, edit the JSON request body, and click Execute. The raw response is displayed.
- **Webhook Simulator** — simulate a `payment_success` event to test your reconciliation engine. Logs show matched/unmatched status, reference, and amount.

---

## Tenant Dashboard

---

### My Rent

Displays your active tenancy cards showing property name, rent amount and frequency, next due date, and current balance or arrears.

Click **Pay Rent** to open checkout. Choose:
- **Payment method**: Flash transfer (virtual account) or Card (saved cards or new card)
- **Amount option**: Exact, partial underpay, overpay, or custom amount

Follow the OTP prompt if required.

---

### Houses Marketplace

Browse all properties listed for rent or sale.

#### FX Currency Converter

At the top right of the marketplace, a live **NGN to currency** converter shows the current exchange rate. Select from:
`USD · EUR · GBP · CAD · AUD · JPY · CNY · INR · ZAR · GHS`

Each property card displays:
- Property photo (if uploaded by landlord)
- **"Assured by AcreWise"** amber badge (if landlord submitted ownership documents)
- Price in NGN plus converted price in your selected currency
- First payment amount for RENT listings
- 5-year rent projection (Year 1 to Year 5)
- Number of units available

#### Renting a Property

Click **Rent via Nomba**. The checkout modal opens showing the First Payment amount (if set by landlord) or the full price. Pay via Flash or Card. On success, a tenancy is created automatically. Your next rent payment is scheduled per the landlord's frequency (monthly / biannual / annual). A receipt is saved to your vault.

#### Buying a Property

Click **Buy via Nomba Escrow**. The checkout modal opens showing the full property price. The funds are held in escrow and are NOT sent to the landlord immediately. The property is marked `UNDER_ESCROW` and removed from the marketplace. The landlord reviews and releases or rejects from their escrow tab. A receipt is saved to your vault.

---

### Receipts Vault

A chronological list of all your payment receipts including rent payments, escrow deposits, utility bills, and payout confirmations.

Click any receipt to view full details.

---

### Chat

Pick a property channel and message your landlord directly.

---

## Environment Variables

If deploying your own instance, set these on Render:

```
SPRING_DATASOURCE_URL=jdbc:postgresql://aws-1-us-west-2.pooler.supabase.com:6543/postgres?sslmode=require
SPRING_DATASOURCE_USERNAME=postgres.<your-project-ref>
SPRING_DATASOURCE_PASSWORD=<your-supabase-password>
REDIS_URL=rediss://default:<token>@<host>.upstash.io:6379
NOMBA_ACCOUNT_ID=<your-nomba-account-id>
NOMBA_SUB_ACCOUNT_ID=<your-nomba-sub-account-id>
NOMBA_CLIENT_KEY=<your-nomba-client-key>
NOMBA_SECRET_KEY=<your-nomba-secret-key>
```

---

## Running Locally

**Backend**
```bash
cd land
./mvnw spring-boot:run
# Runs on http://localhost:8080
# GraphiQL at http://localhost:8080/graphiql
```

**Frontend**
```bash
cd acrewise_frontend
npm install
npm run dev
# Runs on http://localhost:5173
# Vite proxies /graphql and /api to localhost:8080
```

---

## Nomba APIs Used

| Feature | Nomba Endpoint |
|:---|:---|
| Rent payment flash | `POST /v1/transfers/virtual-accounts` |
| Card payment | `POST /v1/checkout/cards/charge` |
| Card OTP | `POST /v1/checkout/cards/otp` |
| Account verification | `POST /v1/transfers/banks/account` |
| Bank payout | `POST /v1/transfers/banks` |
| FX rate query | `POST /v1/fx/rate` |
| Electricity vend | `POST /v1/bills/electricity` |
| Airtime top-up | `POST /v1/bills/airtime` |
| Data bundle | `POST /v1/bills/data` |
| Cable TV | `POST /v1/bills/cabletv` |
| Betting fund | `POST /v1/bills/betting` |
| POS terminals | `GET /v1/terminals` |
| Webhook inbound | `POST /api/webhooks/nomba` |

---

## Architecture

```
Browser (Vercel)
    │  POST /graphql  →  proxied to Render by vercel.json
    │  POST /api/*    →  proxied to Render by vercel.json
    ▼
Spring Boot on Render
    ├── /graphql                      Spring GraphQL (schema-first)
    ├── /api/webhooks/nomba           Nomba payment event receiver
    ├── /api/nomba-sandbox/execute    Proxied Nomba API calls
    │
    ├── PostgreSQL via Supabase Transaction Pooler (port 6543, SSL)
    └── Redis via Upstash (TLS, port 6379)
```

---

*Built for the Nigerian property market · Powered by Nomba*
