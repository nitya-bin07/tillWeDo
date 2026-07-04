# TillWeDo 💍

**Save Together. Stay Together.**

TillWeDo is an India-first shared-savings platform for couples. Two partners link their accounts, lock money into a joint vault each month, and watch it grow with interest — released together on their wedding day, or forfeited on a breakup, exactly as agreed up front.

Built on the **MERN** stack (MongoDB · Express · React · Node).

---

## 🌐 Live Demo

- **Frontend:** [till-we-do.vercel.app](https://till-we-do.vercel.app)
- **Backend API:** [tillwedo-production.up.railway.app](https://tillwedo-production.up.railway.app)

> ⚠️ This is a work-in-progress deployment. Payments (Razorpay) and file uploads (Cloudinary) are not yet configured in production — those routes will return errors/mock data until live keys are added. Email verification currently only delivers to the developer's own inbox (Resend sandbox mode, pending domain verification).

---

## ✨ Features

- **Couple accounts** — invite a partner with a code; link into a shared account.
- **Joint savings vault** — set each partner's monthly contribution, interval, and start date.
- **Automatic interest** — balances accrue interest monthly via scheduled jobs.
- **Contribution tracking** — full history of every cycle with per-partner status.
- **Marriage payout** — upload a marriage certificate; once an admin approves, the vault (savings + interest) is paid out.
- **Breakup safeguard** — a cooling-off period with a live countdown before any forfeiture is finalised.
- **Secure payments** — Razorpay integration for contributions (orders, signature verification, webhooks).
- **Admin console** — platform stats, proof review (approve/reject), and vault oversight.
- **Auth done right** — JWT sessions, email/OTP verification, password reset, rate limiting.

---

## 🧱 Tech Stack

**Frontend**
- React (Vite)
- React Router
- Tailwind CSS v4
- Framer Motion
- Axios
- lucide-react (icons)

**Backend**
- Node.js + Express
- MongoDB (Atlas) + Mongoose
- JWT (jsonwebtoken) + bcryptjs
- Joi (validation), Helmet, CORS, express-rate-limit
- Multer (uploads)
- node-cron (scheduled jobs)

**Integrations**
- Razorpay (payments)
- Cloudinary (file/image storage)
- Resend (transactional email, HTTP API — falls back to Nodemailer/SMTP, then console logging in dev)

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** 18+ and npm
- A **MongoDB Atlas** cluster (free tier works) — or a local MongoDB
- (Optional) Razorpay test keys, a Cloudinary account, and a Resend API key — the app runs without them in development via built-in fallbacks.

### 1. Clone

```bash
git clone https://github.com/<your-username>/tillwedo.git
cd tillwedo
```

### 2. Backend

```bash
cd backend
npm install
cp .env.example .env      # then fill in the values (see below)
npm run dev
```

You should see:

```
✅ MongoDB Atlas connected
🚀 TillWeDo API running in development mode on port 5000
🕒 Cron jobs scheduled
```

### 3. Frontend

In a second terminal:

```bash
cd frontend
npm install
cp .env.example .env      # set VITE_API_URL if your backend isn't on :5000
npm run dev
```

Open **http://localhost:5173**.

---

## 🔑 Environment Variables

### `backend/.env`

| Variable | Required | Description |
| --- | --- | --- |
| `PORT` | no | API port (default `5000`) |
| `NODE_ENV` | no | `development` / `production` |
| `MONGO_URI` | **yes** | MongoDB connection string |
| `JWT_SECRET` | **yes** | Long random string for signing tokens |
| `CLIENT_URL` | no | Frontend origin for CORS (default `http://localhost:5173`) |
| `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` | no | Razorpay test/live keys |
| `RAZORPAY_WEBHOOK_SECRET` | no | Secret for verifying Razorpay webhooks |
| `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` | no | Cloudinary credentials |
| `RESEND_API_KEY` | no | [Resend](https://resend.com) API key — preferred email provider. Sends over HTTPS, so it works on hosts (Railway, Render, etc.) that block outbound SMTP ports. |
| `EMAIL_FROM` | no | Sender address, e.g. `TillWeDo <no-reply@yourdomain.com>`. Without a Resend-verified domain, use Resend's sandbox sender `onboarding@resend.dev` (only delivers to the email the Resend account was created with). |
| `EMAIL_HOST` / `EMAIL_PORT` / `EMAIL_SECURE` / `EMAIL_USER` / `EMAIL_PASS` | no | SMTP fallback (Nodemailer), only used if `RESEND_API_KEY` is not set. Note: many cloud hosts block outbound SMTP ports — this generally only works for local development. |

> Without any email provider configured, the app falls back to logging emails/OTPs to the server console — so you can develop end-to-end with just `MONGO_URI` and `JWT_SECRET`. Email sending never blocks a request/response; failures are logged and the request still completes.

> **Note:** accounts must complete OTP email verification (`isVerified: true`) before they can log in — `POST /auth/login` rejects unverified accounts with a `403 EMAIL_NOT_VERIFIED` error.

### `frontend/.env`

| Variable | Description |
| --- | --- |
| `VITE_API_URL` | Backend API base URL (default `http://localhost:5000/api/v1`) |

---

## 📁 Project Structure

```
tillwedo/
├── backend/
│   ├── config/        # db, cloudinary, razorpay
│   ├── models/        # Mongoose schemas
│   ├── middleware/    # auth, validation, rate limiting, uploads, errors
│   ├── controllers/   # request handlers
│   ├── routes/        # Express routers
│   ├── services/      # email, interest, payout, forfeiture, notifications
│   ├── jobs/          # scheduled cron tasks
│   ├── utils/         # helpers
│   ├── app.js         # Express app
│   └── server.js      # entry point
└── frontend/
    └── src/
        ├── api/         # Axios API layer
        ├── components/  # common, layout, vault, couple, admin
        ├── context/     # Auth, Couple, Vault providers
        ├── hooks/       # useAuth, useVault, useBreakupTimer
        ├── pages/       # route pages (+ admin/)
        └── utils/       # formatters
```

---

## 🧭 How It Works

1. **Sign up** and verify your email with the OTP.
2. **Invite your partner** with a code (or join with theirs).
3. **Create a vault** — set each partner's monthly amount and schedule.
4. **Contribute** — funds accumulate and earn interest automatically.
5. **On marriage** — submit proof; once approved, the vault pays out to both partners.
6. **On breakup** — a cooling-off period runs before funds are forfeited per the agreement.

---

## 📄 License

This project is released under the MIT License. See `LICENSE` for details.

---

## 🙏 Acknowledgements

Built with care on the MERN stack. Payments by Razorpay, media by Cloudinary, email by Resend.