# Cloud Deployment Guide: Render + Supabase + Upstash

Your credentials from `.env` have been wired in. Here is exactly what to configure on each platform.

---

## Step 1: Supabase — Managed PostgreSQL ✅

Your Supabase project is already provisioned. The backend connects to:
```
Host:     db.tozpptsgpodiwnsyxzde.supabase.co
Port:     5432
Database: postgres
Username: postgres
Password: A0ZwvI5DKYgFeSPs
```

**JDBC URL for Render** (copy this exactly):
```
jdbc:postgresql://db.tozpptsgpodiwnsyxzde.supabase.co:5432/postgres
```

> [!NOTE]
> Supabase requires SSL on production. If the connection is rejected, append `?sslmode=require` to the JDBC URL.

---

## Step 2: Upstash — Serverless Redis ✅

Your Upstash Redis instance is provisioned. The backend connects via the full `rediss://` TLS URL:
```
rediss://default:gQAAAAAAAan-AAIgcDE5NGMwMWJiY2Q0NDU0YWFjYjFkNzllYTY4YzVhMWM0Mw@champion-koi-109054.upstash.io:6379
```

> [!NOTE]
> The `rediss://` scheme (double-s) means SSL/TLS is enforced. Spring Boot's Lettuce client reads this from `spring.data.redis.url` and automatically enables TLS.

---

## Step 3: Deploy on Render

### 3.1 — Prepare your repository
Make sure the project is pushed to GitHub. The Render build expects these two commands:

| Field | Value |
|:---|:---|
| **Root Directory** | `land` |
| **Build Command** | `./mvnw clean package -DskipTests` |
| **Start Command** | `java -jar target/land-0.0.1-SNAPSHOT.jar` |

### 3.2 — Environment Variables on Render

Copy-paste each of these **exactly** as shown into Render's **Environment** tab:

| Variable Name | Value |
|:---|:---|
| `SPRING_DATASOURCE_URL` | `jdbc:postgresql://db.tozpptsgpodiwnsyxzde.supabase.co:5432/postgres` |
| `SPRING_DATASOURCE_USERNAME` | `postgres` |
| `SPRING_DATASOURCE_PASSWORD` | `A0ZwvI5DKYgFeSPs` |
| `REDIS_URL` | `rediss://default:gQAAAAAAAan-AAIgcDE5NGMwMWJiY2Q0NDU0YWFjYjFkNzllYTY4YzVhMWM0Mw@champion-koi-109054.upstash.io:6379` |
| `NOMBA_ACCOUNT_ID` | `f666ef9b-888e-4799-85ce-acb505b28023` |
| `NOMBA_SUB_ACCOUNT_ID` | `5a6c217c-010f-4c90-9517-382c9ec46595` |
| `NOMBA_CLIENT_KEY` | `e5e85b13-f560-4643-814e-c87435dbbc15` |
| `NOMBA_SECRET_KEY` | `8/doS7Q3w77EANpk3vpgSrc05hhOiRWp3eBs01sXyZ1AmovtZUXlmrxie+xnEF2tR4q79t0IFufMD1d4JrkT8g==` |

> [!IMPORTANT]
> **Do NOT set a `PORT` variable** — Render automatically injects it. The backend already reads `${PORT:8080}` so it will pick up Render's dynamic port automatically.

### 3.3 — Deploy
1. Click **Create Web Service** on Render.
2. Render will pull from GitHub, run `./mvnw clean package -DskipTests`, then launch the JAR.
3. The first boot will run Hibernate `ddl-auto: update` which auto-creates all tables in Supabase.
4. Once deployed, your backend URL will be something like: `https://acrewise-backend.onrender.com`

---

## Step 4: Point your Frontend to the Live Backend

Once your Render URL is live, update the Vite proxy in `acrewise_frontend/vite.config.js`:

```js
server: {
  proxy: {
    '/graphql': 'https://acrewise-backend.onrender.com',
    '/api': 'https://acrewise-backend.onrender.com',
  }
}
```

Or set a `.env` variable in your frontend:
```
VITE_API_BASE_URL=https://acrewise-backend.onrender.com
```

> [!TIP]
> For a free-tier Render instance, the first request after inactivity may take ~30 seconds (cold start). Consider upgrading to a paid plan for always-on service.
