# OptimumERP 🚀

> **Your complete, privacy-first business management suite — powered by local AI.**

OptimumERP is an all-in-one ERP platform built for modern businesses. Manage your invoicing, purchases, inventory, expenses, contacts, and financial reporting from a single, elegant interface. What sets it apart: a built-in AI assistant that understands your business and works entirely on your own infrastructure — your data never leaves your servers.

---

## 🌐 Live Demo

Try OptimumERP right now — no installation required:

**👉 [https://optimumerp.onrender.com/](https://optimumerp.onrender.com/)**

> [!NOTE]
> The demo is hosted on Render's free tier. The server spins down when inactive, so **the first request may take 30–60 seconds** to respond while it wakes up. Subsequent requests will be fast.

---

## ✨ What You Can Do with OptimumERP

### 🤖 AI Business Assistant (Chatbot)
Talk to your business data in plain English. The AI assistant is context-aware and deeply integrated with every module.

- **Create documents via chat** — Say *"Create an invoice for Acme Corp for 5 units of Product X"* and it's done.
- **Search & retrieve** — Ask *"Find all unpaid invoices from last month"* or *"Show me the ledger for Acme Corp"*.
- **Generate reports** — Request *"Download the profit & loss report for this quarter"*.
- **Manage parties & contacts** — Create customers, suppliers, or contacts through natural language.
- **Track expenses** — Log and categorize expenses via conversation.
- **Payment vouchers** — Record receipts and payments just by describing them.
- **Send documents by email** — Ask the AI to send an invoice or quote to a customer.
- **Business performance** — Ask *"How is my business doing this month?"* and get instant stats.
- Supports **Ollama** (fully local, privacy-preserving) and **Grok** AI providers, configurable per organization.
- Persistent, titled **conversation history** — pick up where you left off.
- Real-time **streaming responses** with status indicators so you always know what the AI is doing.

---

### 📄 Invoices
- Create, edit, and delete professional invoices.
- Track invoice **status**: Draft, Sent, or Pending.
- Attach a **Purchase Order number and date** to each invoice.
- Set **due dates** and monitor outstanding payments.
- Record **payments** directly against an invoice with linked payment vouchers.
- View the **outstanding balance** on each invoice at a glance.
- **Convert Quotes or Proforma Invoices** into invoices in one click.
- Download invoices as **PDF documents** or view them as formatted HTML.
- **Email invoices** directly to customers (Gold/Platinum plan).
- **Export** your full invoice list to Excel/CSV.
- Auto-incrementing **sequential invoice numbering** per financial year with customizable prefixes.

---

### 📋 Quotes / Estimates
- Create and manage **quotations** for potential customers.
- Full status lifecycle: **Draft → Pending → Sent → Accepted → Declined**.
- **Convert accepted quotes to invoices** instantly.
- Download, view, and email quotes just like invoices.
- Export quote data for reporting.

---

### 🧾 Proforma Invoices
- Generate **proforma invoices** to confirm orders before formal billing.
- **Convert proforma invoices to final invoices** when ready.
- Full download, view, email, and export support.

---

### 🛒 Purchase Orders
- Raise **purchase orders** against your suppliers (parties).
- Status tracking: **Draft, Sent, Paid**.
- Add discounts at the order level.
- Download, email, and export purchase orders.

---

### 🏪 Purchases (Bills)
- Record **vendor bills / purchase documents** when goods or services are received.
- Track payment status: **Paid or Unpaid**.
- Record payments against purchases and track the outstanding balance.
- Download and view purchase documents. Email to relevant parties.

---

### 🔁 Recurring Invoices
- Set up **automatically repeating invoices** for subscriptions, retainers, or regular clients.
- Flexible intervals: **Daily, Weekly, Monthly, Quarterly, Semi-annually, Tri-annually, or Yearly**.
- Control the exact **day of the month** or **day of the week** for weekly recurrences.
- Define a **start date, end date, and next occurrence**.
- Automatically generates **invoices and/or proforma invoices** on schedule.
- **Pause, resume, or cancel** a recurring invoice at any time.
- Track the full history of all generated invoices from a single recurring template.
- Catch-up logic: if the system is down for a period, it will generate all missed invoices on restart.

---

### 💰 Expenses
- Log business expenses with **amount, date, and description**.
- Organize expenses with custom **expense categories**.
- Filter and search expenses by category.
- Full **CRUD management** for both expenses and their categories.

---

### 🏦 Payment Vouchers
- Record **receipt vouchers** (money received) and **payment vouchers** (money paid out).
- Link vouchers to specific invoices or purchases.
- Track **payment mode** (cash, bank transfer, UPI, etc.).
- Maintain a complete **voucher log** with sequential numbering per financial year.
- View all vouchers associated with any invoice or purchase.

---

### 📊 Dashboard
- Get an at-a-glance **summary of your business health** the moment you log in.
- Real-time statistics including total revenue, outstanding receivables, and recent activity.

---

### 📈 Reports
- Generate and **download multiple report types** covering your financial data.
- Export reports for accounting, audit, or analysis.

---

### 📦 Products & Inventory
- Maintain a **product catalog** with both goods and services.
- Store **cost price, selling price, description, and SKU/code** for every item.
- Assign products to **categories** and **units of measure**.
- **Bulk upload products** via CSV — the system processes them in the background and notifies you when done.
- Products auto-populate in billing documents for fast invoice creation.

---

### 📐 Units of Measure (UoM)
- Define your own **custom units of measure** (e.g., kg, pcs, hrs, boxes).
- Assign units to products and use them consistently across all billing documents.

---

### 🤝 Parties (Customers & Suppliers)
- Maintain a unified **parties directory** covering both customers and vendors.
- Store **billing address, shipping address, GST number, and PAN number**.
- View a complete **transaction ledger** for any party — all their invoices, purchases, and payments in one view.
- **Download the ledger** as a document.
- **Bulk import parties** from a CSV file — processed asynchronously with a completion notification.
- Search parties instantly by name or billing address.

---

### 👥 Contacts
- Maintain a **contact directory** linked to parties.
- Store name, email, telephone, and contact type.
- Associate multiple contacts with a single party.
- Search contacts by name or type.

---

### 💸 Taxes
- Create **custom tax rates** (GST, IGST, SGST, CGST, VAT, Cess, and more).
- Support for both **single taxes and grouped tax slabs**.
- Taxes are applied at the line-item level on all billing documents.
- Enable or disable taxes without deleting them.

---

### 🏢 Organizations & Multi-Org Support
- Create and manage **multiple organizations** from a single account.
- Each organization has its own complete data silo: parties, products, invoices, settings, and more.
- Set up your organization profile with name, address, GST/PAN, logo, bank details, telephone, email, and website.
- Bank details and UPI QR codes can optionally be **printed on documents**.
- Upload and display your **company logo** on all printed documents.

---

### 👤 User Management & Access Control
- **Role-based access control**: Admin and User roles per organization.
- Admins can **invite, activate, and deactivate** team members.
- Each user can belong to multiple organizations.
- **Plan-based feature gating**: Free, Gold, and Platinum plans control create limits and premium features like email sending.

---

### 🔐 Authentication & Security
- **Session-based authentication** — no tokens floating around in local storage.
- **OTP email verification** on registration to confirm identity.
- **Forgot password flow** with time-limited OTP reset.
- **Google SSO (Single Sign-On)** support — log in with your Google account.
- Secure **password reset** for logged-in users.
- Upload and manage a personal **avatar/profile picture**.

---

### ⚙️ Application Settings (Per Organization)
- Set your **currency** and **locale** (e.g., INR, USD, en-IN, en-US) for consistent formatting across the app.
- Define and manage your **financial year** start and end dates.
- **Close a financial year** and roll over to a new one — sequence counters reset automatically.
- Configure **document number prefixes** for invoices, quotes, purchase orders, proforma invoices, and payment vouchers.
- Manage a **pool of prefixes** per document type for flexible numbering schemes.
- Set **default terms and conditions** for each document type (invoices, quotes, purchase orders, proforma invoices).
- Configure **default unit of measure and tax** for new line items.
- Choose a **default print template** style.
- Toggle **bank details and UPI QR code** visibility on printed documents.
- Add a custom **email signature** for outgoing messages.
- Configure up to **3 AI providers** (Ollama or Grok) per organization — switch between them or keep backups.
- Configure up to **3 SMTP/email providers** (Gmail, Brevo, etc.) per organization for sending documents.

---

### 📧 Email & Notifications
- **Send invoices, quotes, proforma invoices, purchase orders, and purchases** directly by email to parties.
- Emails are rendered from **professional HTML templates** using EJS.
- OTP and system notification emails are sent automatically.
- In-app **notification center** with categorized alerts (info, warning, error, success).
- Unread notification counter keeps you up to date.

---

### 📋 Activity Log & Audit Trail
- Every document action (created, updated, sent) is recorded in an **activity log**.
- An **audit trail** tracks all changes across all models, including what changed and who changed it.
- Per-document history is always accessible.

---

### 📊 Stats & Analytics
- View **organization-wide statistics** with aggregated data across all modules.
- Track document counts, transaction volumes, and financial performance metrics.

---

### 📁 Bulk Operations & Background Jobs
- **Bulk upload parties and products** via CSV files.
- Jobs are processed asynchronously in the **background** so you can keep working.
- Job status tracking: Pending → In Progress → Completed / Failed.
- You receive an **in-app notification with results** (success count, failure count) once the job finishes.

---

### 🧾 Document Printing & PDF
- **Download any document** (invoice, quote, proforma, purchase order, purchase) as a print-ready PDF.
- **In-app HTML preview** of any document before downloading or sending.
- Choose from multiple **print templates** per organization.
- Optional bank details and UPI QR code on printed documents.
- Documents include all standard fields: line items, tax breakdown, shipping charges, terms, notes, and your company branding.

---

### 🌐 Internationalization (i18n)
- The interface supports **multiple languages** through a built-in internationalization system.
- Language files are served dynamically.

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB with Mongoose ODM |
| **Frontend** | React 18, Vite, Ant Design |
| **AI Engine** | Ollama (local LLM) / Grok |
| **Scheduling** | Node-cron (recurring invoices, bulk jobs) |
| **Email** | Nodemailer with EJS templates |
| **Auth** | Express-Session + MongoDB session store, Google OAuth 2.0 |
| **Deployment** | Docker, Docker Compose, PM2 (ecosystem config included) |

---

## 🏗 Architecture Highlights

- **Privacy-first design** — AI processing runs locally via Ollama; no sensitive financial data is sent to external services unless you configure an external provider.
- **Multi-organization** — One account, many companies. Full data isolation between organizations.
- **Financial year aware** — All documents, sequences, and transactions are scoped to a financial year.
- **Configurable storage** — File uploads (logos, avatars, import files) are stored on your own server's filesystem at a configurable path.
- **Structured logging** — Persistent log files for observability and debugging.
- **Transaction-safe operations** — Critical bulk operations and financial writes use MongoDB transactions for data integrity.

---

## 📜 License

This project is licensed under the **MIT License**. See the [LICENSE](./LICENSE) file for details.