# Optimum ERP

Optimum ERP is a comprehensive enterprise resource planning (ERP) solution built using the MERN stack (MongoDB, Express.js, React.js, and Node.js). This project aims to streamline and automate various business processes, including expense management, product management, quotation handling, purchase and sales operations, GST management, and expense categorization.

## Features

- **Expense Management**: Track and organize expenses for better financial control.
- **Product Management**: Efficiently manage product information, inventory, and pricing.
- **Quotation Handling**: Generate and manage quotations for clients.
- **Purchase and Sales Operations**: Streamline the purchasing and sales processes.
- **GST Management**: Comply with Goods and Services Tax (GST) regulations.
- **Expense Categorization**: Categorize expenses for better analysis and reporting.
- **User Authentication**: Secure login system with support for Google Authentication.
- **PDF Generation**: Generate professional invoices, reports, and quotations in PDF format.
- **Role-Based Access Control**: Assign roles and permissions for efficient user management.
- **Notification System**: Keep users updated with system notifications and alerts.
- **Audit Trails**: Maintain detailed logs of system activities for accountability and transparency.
- **Multi-Tenancy**: Support for managing multiple businesses within the same system.

## Technologies Used

- **MongoDB**: NoSQL database for data storage.
- **Mongoose**: ODM library for MongoDB to simplify data modeling and schema validation.
- **Express.js**: Web application framework for Node.js.
- **React.js**: JavaScript library for building user interfaces.
- **Node.js**: JavaScript runtime environment for server-side scripting.
- **Chakra UI**: For designing modern and responsive user interfaces.
- **Framer Motion**: For smooth and interactive animations.
- **Mongoose**: Database management.
- **PDF Generation**: Currently using external service [https://docs.pdfshift.io/](https://docs.pdfshift.io/).

## Environment Variables

The following environment variables are required for the application to run successfully:

```
NODE_ENV=           # Environment mode (development, production)
MONGO_URI=          # MongoDB connection string
SESSION_SECRET=     # Secret key for session management
NODE_MAILER_USER_NAME= # Email username for nodemailer
NODE_MAILER_APP_PASSWORD= # App password for nodemailer
NODE_MAILER_HOST=   # Email host (e.g., smtp.gmail.com)
GOOGLE_AUTH_CLIENT_ID= # Client ID for Google OAuth
GOOGLE_AUTH_CLIENT_SECRET= # Client Secret for Google OAuth
VITE_APP_URL=       # Frontend URL of the application
PDF_SHIFT_API_KEY=  # PDF Shift API key for PDF generation 
```

## Hosting and Deployment

Optimum ERP is hosted on [https://www.optimumerp.biz/](https://www.optimumerp.biz/). The application is deployed using modern DevOps practices to ensure reliability, scalability, and high performance.

## Contributing

Contributions to Optimum ERP are welcome! If you find any issues or have suggestions for improvements, please open an issue or submit a pull request.

To contribute:

1. Fork the repository.
2. Create a new branch for your feature or bug fix.
3. Commit your changes and push them to your branch.
4. Submit a pull request with a detailed description of your changes.

## Contact

For more information or inquiries about Optimum ERP, please contact the project owner at [Support](mailto\:atuldubey017@gmail.com).

---

Optimum ERP is designed to be a powerful, user-friendly, and scalable solution for businesses looking to optimize their operations and drive growth.
