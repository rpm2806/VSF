# 🌿 Vriksh Students Federation — Portal

**Official management portal for Vriksh Students Federation (VSF)**  
*"By the Students, For the Students, Of the Students"*

---

## 📖 About the Project

VRIKSH STUDENTS FEDERATION is a student-driven initiative dedicated to supporting students through unity, contribution, and collective growth. This portal is the official digital platform for managing:

- Monthly student donations & contribution tracking
- Donation receipt generation (PDF)
- Student & alumni records management
- Expense tracking with admin approval
- Announcements for members
- Student queries & support requests
- Volunteer & admin management

**Launched:** 5 September 2021  
**Monthly Contribution:** ₹30/month per student  
**Tech Stack:** Next.js 16, Prisma ORM, SQLite, Tailwind CSS, NextAuth.js

---

## 👥 User Roles

| Role | Access |
|------|--------|
| **Master Admin** | Full access — students, donations, expenses, volunteers, queries, settings |
| **Volunteer** | View/manage students, record donations |
| **Student / Alumni** | View own donations, download receipts, update profile |

---

## 🚀 Running on Any System

### Step 1 — Install Node.js (One-time)
Download and install **Node.js LTS** from:  
👉 https://nodejs.org

Verify installation:
```bash
node -v
npm -v
```

---

### Step 2 — Copy the Project Folder
Copy the entire project folder (`VrikshSF` or `VSFederation`) to your system.

> ✅ Make sure to include the `prisma/dev.db` file — it contains all your data.  
> ❌ You do NOT need to copy `node_modules` or `.next` — they will be regenerated.

---

### Step 3 — Create the `.env` File
In the **root of the project folder**, create a file named `.env` with the following content:

```env
DATABASE_URL="file:./dev.db"
AUTH_SECRET="vriksh-sf-super-secret-key-1234567890"
NEXTAUTH_URL="http://localhost:3000"
```

---

### Step 4 — Run These Commands (in order)

Open **Command Prompt** or **PowerShell** inside the project folder:

```bash
# Install all dependencies
npm install

# Set up the database (only needed once, or when DB is missing)
npx prisma db push

# Start the development server
npm run dev
```

Then open your browser and go to:  
👉 **http://localhost:3000**

---

### Step 5 — Production Build (Optional)

If you want to run in production mode (faster):

```bash
# Build the app
npm run build

# Start production server
npm run start
```

---

## 🔐 Default Admin Login

| Field | Value |
|-------|-------|
| Email | `admin@vrikshsf.org` |
| Password | *(set during first seed — ask your admin)* |

> ⚠️ Change the admin password after first login from **Settings → Change Password**

---

## 📁 Project Structure

```
VrikshSF/
├── prisma/
│   ├── schema.prisma     # Database schema
│   └── dev.db            # SQLite database (your data lives here)
├── public/
│   ├── logo.png          # VSF official logo
│   └── uploads/          # Student profile & ID proof images
├── src/
│   ├── app/              # Next.js pages & API routes
│   ├── components/       # Reusable UI components
│   └── lib/              # Utilities (db, auth, email)
├── .env                  # Environment variables (create manually)
├── .env.example          # Template for .env
└── README.md             # This file
```

---

## 🛠️ Common Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server (localhost:3000) |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npx prisma db push` | Sync database schema |
| `npx prisma studio` | Open visual database browser |

---

## 📞 Support & Contact

For technical issues or questions about the portal, contact the **VSF Admin Team** through the federation portal or reach out directly to your volunteer team.

---

*© 2021–present Vriksh Pathshala. All rights reserved.*  
*Together We Grow. Together We Support. 🌱*
