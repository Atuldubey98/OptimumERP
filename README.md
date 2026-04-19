# OptimumERP 🚀
> **Local-First Enterprise Resource Planning with Integrated LLM Intelligence.**

OptimumERP is a modern, privacy-centric ERP suite designed to handle Invoicing, Inventory, and Financial reporting. By leveraging **Ollama**, it allows businesses to use AI for automation without sending sensitive financial data to the cloud.

---

## ✨ Key Features

- **🤖 Local AI (Ollama):** Natural language handlers for creating Bills and Parties locally.
- **💼 Financial Operations:** Full support for Invoices, Quotes, Proforma, and Purchase Orders.
- **📈 Advanced Reporting:** Real-time dashboard stats and PDF/Excel exports.
- **🔐 Enterprise Security:** Role-based access, Session-based auth, and OTP verification.
- **📂 Storage & Logs:** Configurable network storage for uploads and persistent logging.
- **📧 Automated Mailer:** Built-in EJS templates for system notifications and OTPs.

---

## 🛠 Tech Stack

- **Backend:** Node.js, Express, MongoDB (Mongoose)
- **AI Engine:** Ollama (Local LLM)
- **Frontend:** React 18, Vite, Ant Design
- **Task Scheduling:** Node-cron for automated workflows

---

## 🚀 Installation & Setup

### 1. Prerequisites
- Node.js (v18+)
- MongoDB (Local or Atlas)
- [Ollama](https://ollama.ai/) installed and running.

### 2. Environment Configuration
Create a `.env` file in the `backend/` directory and populate it with the following:

```env
# Database & Security
MONGO_URI=mongodb://localhost:27017/optimumerp
SESSION_SECRET=your_random_secret_string

# Email Configuration (Nodemailer)
NODE_MAILER_USER_NAME=your_email@gmail.com
NODE_MAILER_APP_PASSWORD=your_app_specific_password
NODE_MAILER_HOST=smtp.gmail.com

# AI / LLM Configuration
OLLAMA_API_KEY=not_required_for_local_usually
OLLAMA_TEXT_MODEL=llama3  # or mistral

# App Settings
VITE_GOOGLE_SSO_ENABLED=false
IMPORT_CRON_SCHEDULE=false
DEFAULT_USER_PLAN=free
LOG_FILE_PATH=./logs/app.log
NETWORK_STORAGE_PATH=./uploads