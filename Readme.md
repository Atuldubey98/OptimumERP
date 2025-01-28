# Optimum ERP

Optimum ERP is a robust enterprise resource planning (ERP) solution built using the MERN stack (MongoDB, Express.js, React.js, and Node.js). This project is designed to streamline and automate various business processes, including expense management, product management, quotation handling, purchase and sales operations, GST compliance, and expense categorization.

---

## Features

- **Expense Management**: Easily track and organize expenses to maintain better financial control.
- **Product Management**: Efficiently manage product details, inventory, and pricing.
- **Quotation Handling**: Generate, customize, and manage professional quotations for clients.
- **Purchase and Sales Operations**: Streamline and automate purchasing and sales workflows.
- **GST Compliance**: Simplify Goods and Services Tax (GST) calculations and management.
- **Expense Categorization**: Categorize and analyze expenses for better financial insights.
- **User Authentication**: Secure login system with support for Google Authentication.
- **PDF Generation**: Generate professional invoices, reports, and quotations in PDF format.
- **Role-Based Access Control (RBAC)**: Assign roles and permissions to ensure secure and efficient user management.
- **Notification System**: Notify users with system alerts and updates.
- **Audit Trails**: Maintain detailed logs of system activities to ensure accountability and transparency.
- **Multi-Tenancy**: Manage multiple businesses or organizations within the same platform.

---

## Technologies Used

- **Frontend**:
  - React.js: For building responsive and dynamic user interfaces.
  - Chakra UI: For designing modern, accessible, and responsive UI components.
  - Framer Motion: For smooth and interactive animations.

- **Backend**:
  - Node.js: A scalable runtime for server-side scripting.
  - Express.js: Lightweight web framework for building RESTful APIs.

- **Database**:
  - MongoDB: NoSQL database for scalable and flexible data storage.
  - Mongoose: Object Data Modeling (ODM) library for MongoDB to simplify schema management and validation.

- **Utilities**:
  - Nodemailer: For email notifications and SMTP integration.
  - PDFShift API: For professional-grade PDF generation.
  - Cloudinary: For cloud-based image and file management.

---

## Environment Variables

Configure the following environment variables to run the application successfully:

```
NODE_ENV=           # Environment mode (development, production)
MONGO_URI=          # MongoDB connection string
SESSION_SECRET=     # Secret key for session management
NODE_MAILER_USER_NAME= # Email username for Nodemailer
NODE_MAILER_APP_PASSWORD= # App password for Nodemailer
NODE_MAILER_HOST=   # Email host (e.g., smtp.gmail.com)
GOOGLE_AUTH_CLIENT_ID= # Google OAuth Client ID
GOOGLE_AUTH_CLIENT_SECRET= # Google OAuth Client Secret
VITE_APP_URL=       # Frontend URL of the application
PDF_SHIFT_API_KEY=  # PDFShift API key for PDF generation
CLOUDINARY_NAME=    # Your Cloudinary account name
CLOUDINARY_API_KEY= # Your Cloudinary API key
CLOUDINARY_API_SECRET= # Your Cloudinary API secret
```

---

## Hosting and Deployment

Optimum ERP is hosted at [https://www.optimumerp.biz/](https://www.optimumerp.biz/) and is deployed using modern DevOps practices to ensure reliability, scalability, and high performance.

### Steps to Deploy:

1. Create a `.env.development` file for development or `.env` for production using the environment variables provided above.
2. Install dependencies:
   ```
   npm install
   ```
3. Build the application:
   ```
   npm run build
   ```

4. For development, run:
   - Backend server:
     ```
     npm run dev:backend
     ```
   - Frontend server:
     ```
     npm run dev:frontend
     ```

5. For production, start the server:
   ```
   npm start
   ```

These commands will spin up the backend and frontend servers, making the application fully functional.

---

## Contributing

Contributions to Optimum ERP are encouraged! If you encounter issues or have ideas for new features, please open an issue or submit a pull request.

### Contribution Guidelines:

1. Fork the repository.
2. Create a new branch for your feature or bug fix.
3. Commit your changes with clear and concise messages.
4. Push your branch to your forked repository.
5. Submit a pull request with a detailed description of your changes.

---

## Contact

For inquiries or support, please contact the project owner at [atuldubey017@gmail.com](mailto:atuldubey017@gmail.com).

---

Optimum ERP is built to empower businesses by optimizing operations, enhancing efficiency, and driving growth.

