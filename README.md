# AcreWise: Decentralized Escrow, Rent & Multi-Unit Tenancy Automation Platform

AcreWise is a next-generation real-world asset (RWA) rent coordination and escrow payment automation dashboard. Built on top of Spring Boot (Java), React (Vite), PostgreSQL, Redis, and a custom gRPC microservice topology, AcreWise leverages **Nomba Sandbox Fintech API integration** to model virtual accounts, multi-step credit card and bank transfer checkout systems, utility meter mapping, POS card-reader hardware syncing, currency exchanges, and secure tenant-landlord property chatrooms.

This system provides a full sandbox environment that mocks and simulates live banking processes, offering compliance and automated reconciliation pipelines for real estate assets in Nigeria and global FX transfer corridors.

---

## Table of Contents
1. [Core Features & Workspace Roles](#1-core-features--workspace-roles)
2. [Fintech API Implementations (Nomba Suite)](#2-fintech-api-implementations-nomba-suite)
3. [System Architecture & Backend Flow](#3-system-architecture--backend-flow)
4. [Database Domain Schemas (JPA mapping)](#4-database-domain-schemas-jpa-mapping)
5. [Installation & Project Execution](#5-installation--project-execution)
6. [Nomba Webhook Signature Hashing & Verification](#6-nomba-webhook-signature-hashing--verification)
7. [Step-by-Step Simulation Guidelines](#7-step-by-step-simulation-guidelines)
8. [Troubleshooting & FAQs](#8-troubleshooting--faqs)

---

## 1. Core Features & Workspace Roles

AcreWise implements a strict security partition between **Property Landlords** and **Renting Tenants**. This ensures data isolation and clean dashboard views tailored to the active user's permissions:

### Property Landlord View
*   **Properties Hub**: Real-time interface to create, list, and inspect physical buildings. Supports designating buildings as multi-unit (e.g. 8 rooms or 8 flats), specifying prices, area coordinates, and compiling verified listing verification certificates.
*   **Lease Agreements Console**: Form to establish binding tenancies by matching a listed property to a tenant's email address. Integrated with Nomba Sandbox for instant virtual account provisioning.
*   **Purchase Escrows Vault**: Real-time tracking of transaction balances for assets listed as `SALE`. Tracks funds held secure by AcreWise's Escrow Service until released by both parties.
*   **POS Terminals Hub**: Displays assigned physical card readers and POS terminals linked to the landlord's sub-accounts. Enables matching offline walk-in card payments to rent ledgers.
*   **Payouts & Utilities Terminal**: Allows landlords to pay power tokens (IKEDC/EKEDC), cable subscriptions (DSTV/GOTV), and swap accumulated NGN rent revenues into global USD or GBP accounts using current FX rates.
*   **Unmatched Inflow Reconciliation**: Audit log of direct bank transfers that do not contain a recognized lease reference. Landlords can manually map these inflows to arrears.

### Renting Tenant View
*   **My Lease Ledger**: Personal tenant portal showing rented property details, assigned caretaker contacts, linked utility meter accounts, and active balance ledger sheets (including arrears and overpayment credits).
*   **Rent / Buy Marketplace**: Clean consumer catalog displaying all available listed houses. Multi-unit listings display the remaining units count (e.g. `3 left`), and hide automatically once fully let or sold.
*   **Digital Multi-Checkout**: Settle rent dues or buy houses directly inside the dashboard using:
    *   *Debit Cards*: Simulates full authorize card details, PIN inputs, and multi-step OTP validation check (using `123456`).
    *   *Flash Transfers*: Renders bank transfer numbers, names, and lets tenants simulate instant payment confirmations.
*   **Receipts Locker**: Secure vault storing chronological transaction receipts with options to view digital compliance slips.
*   **Locked Chatrooms**: Private communication channel mapped to the property, locked to the landlord and active tenants only.

---

## 2. Fintech API Implementations (Nomba Suite)

AcreWise relies heavily on the **Nomba Sandbox API suite** to facilitate payment processing, virtual accounts, and payouts. The following Nomba endpoints are integrated and simulated within our console gateway:

### 2.1 Authentication APIs
*   **POST** `/v1/auth/token/issue`
    *   *Purpose*: Obtains a valid OAuth2 Access Token using client ID and client secret credentials.
    *   *Implementation*: Handled by `NombaAuthService.java` with a 2-second timeout to prevent networking hangs, caching valid tokens inside a `ConcurrentHashMap` for high-throughput endpoint requests.

### 2.2 Accounts & Balance APIs
*   **GET** `/v1/accounts`
    *   *Purpose*: Retrieves root landlord parent account details, including bank codes and profiles.
*   **GET** `/v1/accounts/virtual/filter`
    *   *Purpose*: Returns a filtered list of all active virtual account entities registered under the sub-account.
*   **GET** `/v1/accounts/balance/parent`
    *   *Purpose*: Fetches parent account balance to check total consolidated ledger holdings.
*   **GET** `/v1/accounts/balance/{subAccountId}`
    *   *Purpose*: Fetches current balances for landlord sub-accounts.

### 2.3 Virtual Account APIs
*   **POST** `/v1/accounts/virtual`
    *   *Purpose*: Generates unique virtual bank account references mapped to parent accounts.
*   **POST** `/v1/accounts/virtual/{subAccountId}`
    *   *Purpose*: Creates virtual accounts tied to a specific sub-account. Used during lease agreement provisioning to give each tenant a dedicated NGN bank destination.
*   **PUT** `/v1/accounts/virtual/{accountId}`
    *   *Purpose*: Modifies virtual account profiles (e.g., updating names or contact details).
*   **DELETE** `/v1/accounts/virtual/{accountId}`
    *   *Purpose*: Expires or revokes a virtual account to prevent further inflows once a tenancy terminates.

### 2.4 Online Checkout APIs
*   **POST** `/v1/checkout/order`
    *   *Purpose*: Creates checkout orders in Nomba's gateway matching the listing price.
*   **POST** `/v1/checkout/charge/card`
    *   *Purpose*: Charges a customer's debit card using tokenized credentials, triggering OTP challenges.
*   **GET** `/v1/checkout/transaction/{transactionId}`
    *   *Purpose*: Verifies the completion status of checkout orders.
*   **POST** `/v1/checkout/refund`
    *   *Purpose*: Initiates transaction refunds for canceled lease escrows.

### 2.5 POS Terminals APIs
*   **GET** `/v1/terminals/sub-account/{subAccountId}`
    *   *Purpose*: Syncs and lists physical terminal devices assigned to sub-accounts, capturing serial numbers and device models.

### 2.6 FX Swaps & Utility APIs
*   **POST** `/v1/fx/rate`
    *   *Purpose*: Resolves current exchange rates for NGN to USD/GBP currency swaps.
*   **POST** `/v1/fx/swap`
    *   *Purpose*: Executes exchanges, moving balances between currency sub-ledgers.
*   **POST** `/v1/bills/vend`
    *   *Purpose*: Vends electricity tokens or renews cable channels for property utility meters.

---

## 3. System Architecture & Backend Flow

AcreWise uses a decoupled architecture designed for scale and developer debugging. The core components communicate as follows:

```
[ Vite React Frontend ] (Port 5173)
         │
         │ (HTTP / GraphQL / Rest)
         ▼
[ Spring Boot Core Backend ] (Port 8080)
         │
         ├──► [ PostgreSQL Database ] (Port 5432) ──► (Stores UserProfiles, Properties, Chat, Receipts)
         │
         ├──► [ Redis Server ] (Port 6379) ─────────► (Handles webhook idempotency keys)
         │
         ├──► [ gRPC Escrow Service ] (Port 9090) ──► (Handles multi-signature transaction holds)
         │
         └──► [ Nomba API Sandbox ] (External API Proxy with Mock Fallbacks)
```

1.  **React Frontend**: Provides a tailwind-styled single-page console application. Leverages GraphQL for state querying/mutations, and requests sandbox endpoint execution logs from the backend controller.
2.  **Spring Boot Backend**: Serves as the security compliance gate. Orchestrates data storage, runs background webhook audits, and communicates with Redis to prevent duplicate webhook processing.
3.  **gRPC Escrow Microservice**: Handles locking, release, and recovery configurations for properties listed under `SALE` contracts.

---

## 4. Database Domain Schemas (JPA Mapping)

We use Spring Data JPA to coordinate domain records within PostgreSQL:

### UserProfile
Maps registered emails to active permissions roles:
```java
@Entity
@Table(name = "user_profiles")
public class UserProfile {
    @Id
    private UUID id;
    private String email;
    private String role; // "TENANT" or "LANDLORD"
    private String name;
}
```

### Property
Represents buildings, supporting multi-unit properties and meter integrations:
```java
@Entity
@Table(name = "properties")
public class Property {
    @Id
    private UUID id;
    private String title;
    private String type; // "RENT" or "SALE"
    private String status; // "LISTED", "LET", "SOLD", "UNDER_ESCROW"
    private String verificationStatus; // "PENDING", "VERIFIED"
    private String meterNumber;
    private String meterProvider;
    private String area;
    private String buildingType;
    private BigDecimal price;
    private String caretakerName;
    private String caretakerEmail;
    private String caretakerPhone;
    private Integer totalUnits;
    private Integer availableUnits;
}
```

### Tenancy
Records active lease agreements and Nomba virtual accounts:
```java
@Entity
@Table(name = "tenancies")
public class Tenancy {
    @Id
    private UUID id;
    @ManyToOne
    private Property property;
    private String tenantId; // Tenant email string
    private BigDecimal rentAmount;
    private String frequency; // "MONTHLY", "ANNUAL"
    private LocalDate nextDueDate;
    private BigDecimal balance; // Negative represents arrears
    private String nombaVirtualAccountId;
}
```

### ChatMessage
Private communication logs locked to properties:
```java
@Entity
@Table(name = "chat_messages")
public class ChatMessage {
    @Id
    private UUID id;
    private UUID propertyId;
    private String senderEmail;
    private String senderRole;
    private String message;
    private Instant createdAt;
}
```

### Receipt
VA vault receipt lockers:
```java
@Entity
@Table(name = "receipts")
public class Receipt {
    @Id
    private UUID id;
    private String title;
    private String category; // "RENT", "UTILITY", "CABLE", "FX"
    private BigDecimal amount;
    private String reference;
    private String details;
    private String tenantEmail;
    private Instant createdAt;
}
```

---

## 5. Installation & Project Execution

### Prerequisites
*   Java JDK 21
*   Node.js v18+ & npm
*   PostgreSQL & Redis Server active locally.

### 5.1 Backend Spring Boot Configuration
Configure your PostgreSQL, Redis, and Nomba API credentials inside `land/src/main/resources/application.properties`:

```properties
spring.application.name=land
spring.graphql.graphiql.enabled=true

# Database Config
spring.datasource.url=jdbc:postgresql://localhost:5432/acrewise
spring.datasource.username=postgres
spring.datasource.password=postgres
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true

# Redis Config
spring.data.redis.host=localhost
spring.data.redis.port=6379

# Nomba Sandbox Settings
nomba.api.client-key=e5e85b13-f560-4643-814e-c87435dbbc15
nomba.api.secret-key=8/doS7Q3w77EANpk3vpgSrc05hhOiRWp3eBs01sXyZ1AmovtZUXlmrxie+xnEF2tR4q79t0IFufMD1d4JrkT8g==
nomba.api.account-id=f666ef9b-888e-4799-85ce-acb505b28023
nomba.api.sub-account-id=5a6c217c-010f-4c90-9517-382c9ec46595
```

Build and run the backend server:
```bash
cd reflow/land
./mvnw clean compile
./mvnw spring-boot:run
```
The server starts listening on `http://localhost:8080` (GraphQL endpoint is `http://localhost:8080/graphql`).

### 5.2 Frontend React Configuration
Navigate to the frontend folder, install dependencies, and launch the dev build:
```bash
cd reflow/acrewise_frontend
npm install
npm run dev
```
The Vite interface launches on `http://localhost:5173/`.

---

## 6. Nomba Webhook Signature Hashing & Verification

Nomba signs incoming webhook notification calls using **HMAC-SHA256** signatures for audit protection. AcreWise verifies these webhook signatures before processing transactions.

### Concatenation Format
The signature payload string is concatenated using the following order:
```
eventType:requestId:userId:walletId:transactionId:type:time:responseCode:timestamp
```

### Hashing Mechanism (Java Implementation)
```java
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.Base64;

public class WebhookSignatureVerifier {
    public static boolean verify(String secretKey, String payload, String signatureHeader) throws Exception {
        Mac sha256HMAC = Mac.getInstance("HmacSHA256");
        SecretKeySpec secretKeySpec = new SecretKeySpec(
            secretKey.getBytes(StandardCharsets.UTF_8), 
            "HmacSHA256"
        );
        sha256HMAC.init(secretKeySpec);
        byte[] hashBytes = sha256HMAC.doFinal(payload.getBytes(StandardCharsets.UTF_8));
        String computedSignature = Base64.getEncoder().encodeToString(hashBytes);
        return computedSignature.equals(signatureHeader);
    }
}
```

---

## 7. Step-by-Step Simulation Guidelines

Follow this walkthrough to test all features end-to-end:

### Step 1: Open the Portal Access Gate
1.  Navigate to `http://localhost:5173/` in your browser.
2.  Click **Launch Console Portal**.
3.  Choose the **Register Profile** tab. Enter your email (e.g. `landlord@reflow.com`), select **Property Landlord**, and click **Register & Settle**.
4.  If the database is empty, click the **Seed Demo Dataset** button to auto-populate landlords, properties, and webhooks.

### Step 2: List a Multi-Unit Property
1.  On the Landlord tab, click **Properties Hub** in the sidebar.
2.  Click **Create & List Property**.
3.  Enter the building title (e.g. `Hostel Block A`), select **RENT**, enter price `250000`, set **Total Rooms / Flats** to `3`, and select status **`LISTED`**. Click **List Property**.
4.  Verify that it displays on your Properties list showing `3 of 3 available`.

### Step 3: Switch Workspaces & Open Marketplace
1.  Use the **Active Workspace Role** widget in the sidebar to switch to **Tenant**.
2.  Your profile view changes to Tenant. Click **Rent / Buy Marketplace** in the sidebar.
3.  You will see `Hostel Block A` listed. Note the tag: `3 left`.

### Step 4: Secure Checkout (Nomba portal)
1.  Click **Rent / Buy via Nomba** on the property card.
2.  The **Nomba Multi-Checkout Portal** opens.
3.  Select **Credit Card Pay**.
4.  Enter details (Card Number, CVV, PIN), click **Authorize Pay**.
5.  Type OTP `123456` and click **Submit OTP**.
6.  Upon validation success:
    *   The transaction receipt is generated in the tenant's **Receipts Locker**.
    *   The property units count decrements to `2 left`.
    *   An active tenancy lease ledger is generated for the tenant.

### Step 5: Test Chatrooms & Caretakers
1.  Go back to **Landlord** workspace.
2.  In the Properties Hub, click **Assign Caretaker** on your property. Input caretaker name, email, and phone, then click **Assign**.
3.  Switch back to **Tenant** workspace. The caretaker details immediately show up on your ledger.
4.  Click **Landlord Chat** to send a direct compliance message. Go back to Landlord tab to reply.

---

## 8. Troubleshooting & FAQs

#### Q1: Why is my virtual account provisioning stuck on "Provisioning..."?
*   *Cause*: The system is attempting to connect to the live Nomba Sandbox API, which might be blocked by local firewall or network restrictions.
*   *Solution*: We have configured a 2-second connection timeout. If the request fails or times out, the backend automatically intercepts the exception and serves the mock fallback payload. Simply wait 2 seconds.

#### Q2: I listed a property, but it's not showing up on the tenant marketplace.
*   *Cause*: The property status was set to `LET`, `SOLD`, or `UNDER_ESCROW` during listing creation, or the available units count is `0`.
*   *Solution*: The marketplace catalog filters properties that have status `LISTED` or are partially let (`availableUnits > 0`). Ensure your property status is set to `LISTED` during creation.

#### Q3: How do I test the gRPC Escrow Service?
*   *Cause*: Escrow holds require the gRPC server to be running on port `9090`.
*   *Solution*: The backend boot script automatically launches the gRPC server process in Spring Boot. Verify that port `9090` is bound using netstat.

---
*Developed by AcreWise engineering team for secure compliance, automated audits, and fintech orchestration.*
