# 🌿 Vriksh Students Federation (VSF) Portal

[![Next.js](https://img.shields.io/badge/Next.js-15%2B-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5%2B-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-teal?style=for-the-badge&logo=prisma)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-blue?style=for-the-badge&logo=postgresql)](https://neon.tech/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)

An enterprise-grade, secure, full-stack student management and donation verification portal developed for the **Vriksh Students Federation**. This system digitizes organization directories, secures personal identification documents, automates transactional accounting ledger workflows, and triggers customized real-time email alerts.

🌐 **Live Production Link:** [https://vriksh-sf.vercel.app](https://vriksh-sf.vercel.app)

---

## 🏗️ System Architecture

```mermaid
graph TD
    Client[Browser Client / React 19] -->|HTTPS Requests| NextAPI[Next.js Serverless API Routes]
    NextAPI -->|Authentication Middleware| NextAuth[NextAuth.js v5 - RBAC]
    NextAPI -->|Type-Safe Queries| Prisma[Prisma Client ORM]
    Prisma -->|Pooled Connections| Neon[Neon Serverless PostgreSQL]
    NextAPI -->|SMTP Protocol| Nodemailer[Nodemailer / Gmail SMTP]
    NextAPI -->|Secure Image Proxy / REST| Cloudinary[Cloudinary Private Secure Bucket]
    
    subgraph Client Panel
        UI[Tailwind CSS & shadcn/ui]
        Framer[Framer Motion Animations]
        Excel[Client-Side XML Excel Generator]
    end
```

---

## 🌟 Key Capabilities & Features

### 🔒 Secure Document Verification Pipeline
* **Cloudinary Private Storage**: Fully integrates with Cloudinary using a secure, private bucket directory for sensitive items (e.g. Aadhaar cards, profile pictures).
* **Next.js Secure Image Proxy Route (`/api/secure-image`)**: Implemented a server-side authentication check. Images are never directly public; they are fetched as binary buffers from Cloudinary by the server and streamed back only to authenticated admins.

### 📧 Automated Transactional Email Engine
* **Student Approved Welcome**: Approval of a pending student profile automatically triggers an email containing their dynamically generated, unique `Federation ID` and secure portal access details.
* **Verifications & Dynamic PDF Receipts**: Admin approval of a payment automatically compiles a styled transactional receipt, renders it to a secure PDF buffer, and emails it directly as an attachment to the student's Gmail account using Gmail SMTP.

### 📊 Branded Excel Directory Exports
* **Excel Workbook Generation**: Replaced standard raw CSV exports with a high-fidelity XML-based Excel workbook (`.xls`) styled in VSF's emerald green corporate design.
* **Precise Formatting**: Correctly handles formatting to prevent Excel from removing leading zeros in key digits like Aadhaar Numbers and Phone Numbers.

### 🛡️ Data Normalization & Integrity
* **Enforced Uppercasing**: Integrated global string capitalization filters in database controllers and client forms, standardizing historical records and ensuring consistent database entries.
* **Soft-Delete Architecture**: Outfitted the data models with `deletedAt` timestamps, enabling system recycle-bins for secure recovery and preventing hard-deletion of transaction records.

---

## 🔑 Role-Based Access Control (RBAC) Matrix

| Feature / Page | Master Admin | Volunteer | Student / Alumni |
| :--- | :---: | :---: | :---: |
| **View Own Dashboard & Fee Receipts** | ✅ | ✅ | ✅ |
| **Manage Profile Settings & Add Donations** | ✅ | ✅ | ✅ |
| **Manage Student Directories** | ✅ | ✅ | ❌ |
| **Verify Fee Receipts & Generate PDF Invoices** | ✅ | ✅ | ❌ |
| **Manage Volunteers & Master Expenses** | ✅ | ❌ | ❌ |
| **Access System Settings & Recycle Bins** | ✅ | ❌ | ❌ |

---

## ⚙️ Environment Configuration Template

To run this application locally or deploy it to Vercel, create a `.env` file in the root folder with the following variables:

```env
# ─── DATABASE (Neon PostgreSQL) ───
DATABASE_URL="postgresql://user:pass@host-pooler.neon.tech/db?sslmode=require&pgbouncer=true"
DIRECT_URL="postgresql://user:pass@host.neon.tech/db?sslmode=require"

# ─── SECURITY & NEXTAUTH ───
AUTH_SECRET="your-32-character-auth-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# ─── CLOUDINARY CLOUD STORAGE ───
CLOUDINARY_CLOUD_NAME="your-cloudinary-cloud-name"
CLOUDINARY_API_KEY="your-cloudinary-api-key"
CLOUDINARY_API_SECRET="your-cloudinary-api-secret"

# ─── TRANSACTIONAL GMAIL SMTP ───
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-16-character-google-app-password"
SMTP_FROM='"Vriksh Students Federation" <your-email@gmail.com>'
```

---

## 🛠️ Step-by-Step Installation & Local Run Guide

Follow these steps to run the VSF portal locally on your system:

### 1. Prerequisite Setup
Ensure that you have **Node.js LTS (v20+)** installed on your system. Verify with:
```bash
node -v
npm -v
```

### 2. Clone the Repository & Install Packages
```bash
# Clone the repository
git clone https://github.com/rpm2806/VSF.git
cd VSF

# Install dependencies
npm install
```

### 3. Sync Your Database Models
Ensure your `.env` is loaded with your Neon PG URLs, then run Prisma to sync your schemas:
```bash
npx prisma db push
```

### 4. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) inside your web browser!

### 5. Production Compilation
To verify build readiness or compile for production:
```bash
npm run build
npm run start
```

---

## ⚖️ License & Copyright
Developed by **Rupam Kumar** for the Vriksh Students Federation. All rights reserved.  
*Together We Grow. Together We Support.* 🌱
