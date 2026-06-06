# OptimumERP Database Schema Documentation

This document describes the Mongoose schemas used in the OptimumERP backend database.

## Table of Contents

- [Core / User Management](#core--user-management)
  - [user](#user)
  - [organization](#organization)
  - [organization_user](#organization_user)
  - [otp](#otp)
  - [user_activated_plan](#user_activated_plan)
- [Contacts & Parties](#contacts--parties)
  - [contact](#contact)
  - [party](#party)
- [Inventory & Products](#inventory--products)
  - [product](#product)
  - [product_category](#product_category)
  - [ums](#ums)
- [Financial Documents](#financial-documents)
  - [invoice](#invoice)
  - [proforma_invoice](#proforma_invoice)
  - [purchase](#purchase)
  - [purchase_order](#purchase_order)
  - [quotes](#quotes)
  - [recurring_invoice](#recurring_invoice)
- [Expenses](#expenses)
  - [expense](#expense)
  - [expense_category](#expense_category)
- [Transactions & Accounting](#transactions--accounting)
  - [transaction](#transaction)
  - [payment_voucher](#payment_voucher)
  - [taxes](#taxes)
- [System & Communication](#system--communication)
  - [activity](#activity)
  - [audit_log](#audit_log)
  - [chat](#chat)
  - [job](#job)
  - [notification](#notification)
  - [properties](#properties)
  - [template](#template)

---

## Shared Sub-schemas / Fields

Some schemas (Invoice, Proforma Invoice, Purchase, Purchase Order, Quotes, Recurring Invoice) inherit standard billing fields defined in `common.model.js`.

### `financialYear` (Sub-document)
- **`start`**: `Date` (required)
- **`end`**: `Date` (required)

### `billItem` (Sub-document)
- **`name`**: `String` (required)
- **`price`**: `Number` (required, default: `0`)
- **`code`**: `String` (optional)
- **`quantity`**: `Number` (required, default: `0`)
- **`um`**: `Types.ObjectId` (required, ref: `"ums"`)
- **`tax`**: `Types.ObjectId` (required, ref: `"taxes"`)
- **`product`**: `Types.ObjectId` (optional, ref: `"product"`)

### `baseBillFields` (Inherited Fields)
- **`party`**: `Types.ObjectId` (required, ref: `"party"`)
- **`billingAddress`**: `String` (required)
- **`total`**: `Number` (required, default: `0`)
- **`totalTax`**: `Number` (required, default: `0`)
- **`shippingCharges`**: `Number` (default: `0`, min: `0`)
- **`taxCategories`**: `Object` (default: `{}`, validating numeric values `value >= 0`)
- **`description`**: `String` (default: `"Thanks for the business."`)
- **`terms`**: `String` (optional)
- **`org`**: `Types.ObjectId` (required, ref: `"organization"`)
- **`items`**: `[billItem]` (required)
- **`date`**: `Date` (default: `now`)
- **`num`**: `String` (default: `""`)
- **`sequence`**: `Number` (optional)
- **`prefix`**: `String` (default: `""`)
- **`createdBy`**: `Types.ObjectId` (required, ref: `"user"`)
- **`updatedBy`**: `Types.ObjectId` (optional, ref: `"user"`)
- **`financialYear`**: `financialYear` (required)

---

## Core / User Management

### `user`
* **File:** `user.model.js`
* **Mongoose Model:** `user`
* **Mongoose Collection:** `users`
* **Schema Fields:**
  * **`name`**: `String` (required, min: `3`, max: `60`)
  * **`email`**: `String` (required, unique, lowercase, trimmed)
  * **`password`**: `String` (optional, select: `false`)
  * **`active`**: `Boolean` (default: `true`)
  * **`verifiedEmail`**: `Boolean` (required, default: `false`)
  * **`googleId`**: `String` (optional)
  * **`avatar`**: `String` (optional)
  * **`attributes`**: `Object` containing `{ googleAccessToken, googleRefreshToken, picture }`
* **Timestamps:** `true` (createdAt, updatedAt)
* **Version Key:** `false`

### `organization`
* **File:** `org.model.js`
* **Mongoose Model:** `organization`
* **Mongoose Collection:** `organizations`
* **Schema Fields:**
  * **`name`**: `String` (required, min: `2`, max: `80`)
  * **`alias`**: `String` (required, max: `80`)
  * **`address`**: `String` (required)
  * **`gstNo`**: `String` (optional)
  * **`timezone`**: `String` (required)
  * **`location`**: `Object` containing `{ countryCode3, stateCode }`
  * **`createdBy`**: `Types.ObjectId` (required, ref: `"user"`, indexed)
  * **`logo`**: `String` (optional)
  * **`panNo`**: `String` (optional)
  * **`telephone`**: `String` (optional)
  * **`email`**: `String` (optional)
  * **`web`**: `String` (optional)
  * **`bank`**: `Object` containing:
    * `name`: `String` (max: `80`)
    * `accountHolderName`: `String` (max: `80`)
    * `ifscCode`: `String`
    * `accountNo`: `Number`
    * `upi`: `String`
  * **`relatedDocsCount`**: `Object` storing document count metrics for various collections (contacts, invoices, expenses, etc.) with a default of `0`.
* **Timestamps:** `true` (createdAt, updatedAt)
* **Version Key:** `false`

### `organization_user`
* **File:** `orgUser.model.js`
* **Mongoose Model:** `organization_user`
* **Mongoose Collection:** `organization_users`
* **Schema Fields:**
  * **`org`**: `Types.ObjectId` (required, ref: `"organization"`)
  * **`user`**: `Types.ObjectId` (required, ref: `"user"`)
  * **`role`**: `String` (required, enum: `["user", "admin"]`, default: `"user"`)
* **Timestamps:** `true` (createdAt, updatedAt)
* **Version Key:** `false`

### `otp`
* **File:** `otp.model.js`
* **Mongoose Model:** `otp`
* **Mongoose Collection:** `otps`
* **Schema Fields:**
  * **`user`**: `Types.ObjectId` (required, ref: `"user"`)
  * **`otp`**: `String` (required)
  * **`type`**: `String` (required, enum: `["register", "forgotPassword"]`, default: `"forgotPassword"`)
  * **`expiresAt`**: `Date` (required, default: `Date.now`)
  * **`isVerified`**: `Boolean` (default: `false`)
* **Timestamps:** `true` (createdAt, updatedAt)
* **Version Key:** `false`

### `user_activated_plan`
* **File:** `userActivatedPlans.model.js`
* **Mongoose Model:** `user_activated_plan`
* **Mongoose Collection:** `user_activated_plans`
* **Schema Fields:**
  * **`user`**: `Types.ObjectId` (required, ref: `"user"`, unique)
  * **`plan`**: `String` (enum: `["free", "gold", "platinum"]`, default: `process.env.DEFAULT_USER_PLAN || "free"`)
  * **`purchasedBy`**: `Types.ObjectId` (required, ref: `"user"`)
  * **`expiresOn`**: `Date` (optional)
  * **`purchasedOn`**: `Date` (optional)
* **Timestamps:** `true` (createdAt, updatedAt)
* **Version Key:** `false`

---

## Contacts & Parties

### `contact`
* **File:** `contacts.model.js`
* **Mongoose Model:** `contact`
* **Mongoose Collection:** `contacts`
* **Schema Fields:**
  * **`org`**: `Types.ObjectId` (required, ref: `"organization"`)
  * **`createdBy`**: `Types.ObjectId` (required, ref: `"user"`)
  * **`email`**: `String` (required)
  * **`party`**: `Types.ObjectId` (optional, ref: `"party"`, validated to ensure party exists)
  * **`telephone`**: `String` (optional)
  * **`name`**: `String` (required)
  * **`type`**: `String` (optional, validated against `CONTACT_TYPES` property)
  * **`updatedBy`**: `String` (optional, ref: `"user"`)
* **Timestamps:** `true` (createdAt, updatedAt)
* **Version Key:** `false`
* **Indices:**
  * Text Index on `{ name, type }`
  * `{ org: 1, createdAt: -1 }`
  * `{ org: 1, party: 1 }`
  * `{ org: 1, email: 1 }`

### `party`
* **File:** `party.model.js`
* **Mongoose Model:** `party`
* **Mongoose Collection:** `parties`
* **Schema Fields:**
  * **`name`**: `String` (required, min: `2`, max: `80`)
  * **`shippingAddress`**: `String` (optional, max: `150`)
  * **`billingAddress`**: `String` (required, min: `3`, max: `150`)
  * **`gstNo`**: `String` (optional)
  * **`createdBy`**: `Types.ObjectId` (required, ref: `"user"`)
  * **`updatedBy`**: `Types.ObjectId` (optional, ref: `"user"`)
  * **`panNo`**: `String` (optional)
  * **`org`**: `Types.ObjectId` (required, ref: `"organization"`)
* **Timestamps:** `true` (createdAt, updatedAt)
* **Version Key:** `false`
* **Indices:**
  * Text Index on `{ name: "text" }`
  * `{ org: 1, createdAt: -1 }`

---

## Inventory & Products

### `product`
* **File:** `product.model.js`
* **Mongoose Model:** `Product`
* **Mongoose Collection:** `products`
* **Schema Fields:**
  * **`name`**: `String` (required)
  * **`costPrice`**: `Number` (default: `0`)
  * **`sellingPrice`**: `Number` (default: `0`)
  * **`description`**: `String` (default: `""`)
  * **`category`**: `Types.ObjectId` (ref: `"product_category"`)
  * **`type`**: `String` (required, enum: `["service", "goods"]`)
  * **`code`**: `String` (optional)
  * **`org`**: `Types.ObjectId` (required, ref: `"organization"`)
  * **`um`**: `Types.ObjectId` (required, ref: `"ums"`)
  * **`createdBy`**: `Types.ObjectId` (required, ref: `"user"`)
  * **`updatedBy`**: `Types.ObjectId` (optional, ref: `"user"`)
* **Timestamps:** `true` (createdAt, updatedAt)
* **Version Key:** `false`
* **Indices:**
  * Text Index on `{ name, description }`
  * `{ org: 1, createdAt: -1 }`

### `product_category`
* **File:** `productCategory.model.js`
* **Mongoose Model:** `product_category`
* **Mongoose Collection:** `product_categories`
* **Schema Fields:**
  * **`name`**: `String` (required, min: `3`, max: `30`)
  * **`description`**: `String` (default: `""`, min: `3`, max: `80`)
  * **`enabled`**: `Boolean` (default: `true`)
  * **`org`**: `Types.ObjectId` (required, ref: `"organization"`)
* **Timestamps:** `true` (createdAt, updatedAt)
* **Version Key:** `false`

### `ums`
* **File:** `um.model.js`
* **Mongoose Model:** `ums`
* **Mongoose Collection:** `ums`
* **Schema Fields:**
  * **`name`**: `String` (required, max: `20`)
  * **`description`**: `String` (optional, max: `80`)
  * **`unit`**: `String` (required, max: `10`)
  * **`enabled`**: `Boolean` (required, default: `true`)
  * **`createdBy`**: `Types.ObjectId` (required, ref: `"user"`)
  * **`updatedBy`**: `Types.ObjectId` (optional, ref: `"user"`)
  * **`org`**: `Types.ObjectId` (required, ref: `"organization"`)
* **Timestamps:** `true` (createdAt, updatedAt)
* **Indices:**
  * Text Index on `{ name, unit }`
  * `{ org: 1, createdAt: -1 }`

---

## Financial Documents

### `invoice`
* **File:** `invoice.model.js`
* **Mongoose Model:** `invoice`
* **Mongoose Collection:** `invoices`
* **Schema Fields:**
  * *Inherits all `baseBillFields` (party validation ensures it matches the organization).*
  * **`paymentVouchers`**: `[Types.ObjectId]` (ref: `"payment_voucher"`, default: `[]`)
  * **`paymentVoucherBalance`**: `Number` (default: `0`)
  * **`poNo`**: `String` (default: `""`)
  * **`poDate`**: `Date` (optional)
  * **`dueDate`**: `Date` (optional)
  * **`sequence`**: `Number` (required)
  * **`status`**: `String` (enum: `["draft", "sent", "pending"]`, default: `"sent"`)
* **Timestamps:** `true` (createdAt, updatedAt)
* **Version Key:** `false`
* **Indices:**
  * Text Index on `{ description, poNo }`
  * `{ num: 1 }`
  * `{ org: 1, createdAt: -1 }`
  * `{ org: 1, party: 1 }`
  * `{ org: 1, "financialYear.start": 1, sequence: 1 }` (unique index)

### `proforma_invoice`
* **File:** `proformaInvoice.model.js`
* **Mongoose Model:** `proforma_invoice`
* **Mongoose Collection:** `proforma_invoices`
* **Schema Fields:**
  * *Inherits all `baseBillFields`.*
  * **`poNo`**: `String` (default: `""`)
  * **`poDate`**: `Date` (optional)
  * **`sequence`**: `Number` (required, min: `1`)
  * **`num`**: `String` (required)
  * **`status`**: `String` (enum: `["draft", "sent", "pending"]`, default: `"sent"`)
  * **`converted`**: `Types.ObjectId` (optional, ref: `"invoice"`)
* **Timestamps:** `true` (createdAt, updatedAt)
* **Version Key:** `false`
* **Indices:**
  * Text Index on `{ description, poNo }`
  * `{ num: 1 }`
  * `{ org: 1, createdAt: -1 }`
  * `{ org: 1, party: 1 }`
  * `{ org: 1, "financialYear.start": 1, sequence: 1 }` (unique index)

### `purchase`
* **File:** `purchase.model.js`
* **Mongoose Model:** `purchase`
* **Mongoose Collection:** `purchases`
* **Schema Fields:**
  * *Inherits all `baseBillFields`.*
  * **`paymentVouchers`**: `[Types.ObjectId]` (ref: `"payment_voucher"`, default: `[]`)
  * **`paymentVoucherBalance`**: `Number` (default: `0`)
  * **`num`**: `String` (required)
  * **`status`**: `String` (enum: `["paid", "unpaid"]`, default: `"sent"`)
* **Timestamps:** `true` (createdAt, updatedAt)
* **Version Key:** `false`
* **Indices:**
  * Text Index on `{ description }`
  * `{ num: 1 }`
  * `{ org: 1, createdAt: -1 }`
  * `{ org: 1, party: 1 }`

### `purchase_order`
* **File:** `purchaseOrder.model.js`
* **Mongoose Model:** `purchase_order`
* **Mongoose Collection:** `purchase_orders`
* **Schema Fields:**
  * *Inherits all `baseBillFields`.*
  * **`discount`**: `Number` (default: `0`, min: `0`, max: `100`)
  * **`sequence`**: `Number` (required)
  * **`num`**: `String` (required)
  * **`status`**: `String` (enum: `["draft", "sent", "paid"]`, default: `"sent"`)
* **Timestamps:** `true` (createdAt, updatedAt)
* **Version Key:** `false`
* **Indices:**
  * Text Index on `{ description }`
  * `{ num: 1 }`
  * `{ org: 1, createdAt: -1 }`
  * `{ org: 1, party: 1 }`
  * `{ org: 1, "financialYear.start": 1, sequence: 1 }` (unique index)

### `quotes`
* **File:** `quotes.model.js`
* **Mongoose Model:** `quotes`
* **Mongoose Collection:** `quotes`
* **Schema Fields:**
  * *Inherits all `baseBillFields`.*
  * **`converted`**: `Types.ObjectId` (optional, ref: `"invoice"`)
  * **`sequence`**: `Number` (required)
  * **`status`**: `String` (enum: `["draft", "pending", "sent", "accepted", "declined"]`, default: `"draft"`)
* **Timestamps:** `true` (createdAt, updatedAt)
* **Version Key:** `false`
* **Indices:**
  * Text Index on `{ description }`
  * `{ num: 1 }`
  * `{ org: 1, createdAt: -1 }`
  * `{ org: 1, party: 1 }`
  * `{ org: 1, "financialYear.start": 1, sequence: 1 }` (unique index)

### `recurring_invoice`
* **File:** `recurringInvoice.model.js`
* **Mongoose Model:** `recurring_invoice`
* **Mongoose Collection:** `recurring_invoices`
* **Schema Fields:**
  * *Inherits all `baseBillFields`.*
  * **`poNo`**: `String` (default: `""`)
  * **`poDate`**: `Date` (optional)
  * **`status`**: `String` (required, enum: `["paused", "active", "cancelled"]`, default: `"active"`)
  * **`interval`**: `String` (required, enum: `["weekly", "monthly", "yearly", "quarterly", "triannually", "semiannually", "half_yearly", "daily"]`)
  * **`startDate`**: `Date` (required)
  * **`endDate`**: `Date` (required)
  * **`nextOccurrence`**: `Date` (required)
  * **`lastGeneratedDate`**: `Date` (optional)
  * **`dateOfEveryMonth`**: `Number` (optional)
  * **`dayOfEveryWeek`**: `String` (optional, enum: `["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"]`)
  * **`generateInvoice`**: `Boolean` (required, default: `true`)
  * **`generateProformaInvoice`**: `Boolean` (required, default: `false`)
  * **`invoices`**: `[Types.ObjectId]` (ref: `"invoice"`, default: `[]`)
  * **`proformaInvoices`**: `[Types.ObjectId]` (ref: `"proforma_invoice"`, default: `[]`)
  * **`totalGenerated`**: `Number` (default: `0`)
* **Timestamps:** `true` (createdAt, updatedAt)
* **Version Key:** `false`
* **Indices:**
  * Text Index on `{ description, poNo }`
  * `{ org: 1, createdAt: -1 }`
  * `{ org: 1, party: 1 }`

---

## Expenses

### `expense`
* **File:** `expense.model.js`
* **Mongoose Model:** `expense`
* **Mongoose Collection:** `expenses`
* **Schema Fields:**
  * **`description`**: `String` (required, max: `150`)
  * **`org`**: `Types.ObjectId` (required, ref: `"organization"`)
  * **`amount`**: `Number` (required)
  * **`category`**: `Types.ObjectId` (optional, ref: `"expense_category"`)
  * **`date`**: `Date` (required, default: `Date.now`)
* **Timestamps:** `true` (createdAt, updatedAt)
* **Version Key:** `false`
* **Indices:**
  * Text Index on `{ description }`
  * `{ org: 1, category: 1 }`

### `expense_category`
* **File:** `expenseCategory.model.js`
* **Mongoose Model:** `expense_category`
* **Mongoose Collection:** `expense_categories`
* **Schema Fields:**
  * **`name`**: `String` (required, max: `80`)
  * **`description`**: `String` (optional, max: `150`)
  * **`enabled`**: `Boolean` (default: `true`)
  * **`org`**: `Types.ObjectId` (required, ref: `"organization"`)
  * **`createdBy`**: `Types.ObjectId` (optional, ref: `"user"`)
  * **`updatedBy`**: `Types.ObjectId` (optional, ref: `"user"`)
* **Timestamps:** `true` (createdAt, updatedAt)
* **Version Key:** `false`
* **Indices:**
  * Text Index on `{ name }`
  * `{ org: 1, createdAt: -1 }`

---

## Transactions & Accounting

### `transaction`
* **File:** `transaction.model.js`
* **Mongoose Model:** `transaction`
* **Mongoose Collection:** `transactions`
* **Schema Fields:**
  * **`org`**: `Types.ObjectId` (required, ref: `"organization"`)
  * **`createdBy`**: `Types.ObjectId` (required, ref: `"user"`)
  * **`updatedBy`**: `Types.ObjectId` (optional, ref: `"user"`)
  * **`docModel`**: `String` (required, enum: `["invoice", "purchase", "expense", "quotes", "proforma_invoice", "purchase_order", "payment_voucher"]`)
  * **`total`**: `Number` (default: `0`)
  * **`totalTax`**: `Number` (default: `0`)
  * **`shippingCharges`**: `Number` (default: `0`)
  * **`party`**: `Types.ObjectId` (optional, ref: `"party"`)
  * **`financialYear`**: `Object` containing `{ start (Date, required), end (Date, required) }` (required)
  * **`doc`**: `Types.ObjectId` (required, refPath: `"docModel"`)
  * **`date`**: `Date` (required, default: `getTodayDate` - representing the start of the day)
  * **`voucherType`**: `String` (enum: `["receipt", "payment"]` - optional)
* **Timestamps:** `true` (createdAt, updatedAt)
* **Version Key:** `false`
* **Indices:**
  * `{ org: 1, createdAt: -1 }`
  * `{ org: 1, party: 1, date: -1 }`
  * `{ org: 1, date: -1 }`
  * `{ org: 1, docModel: 1, doc: 1 }` (unique index)

### `payment_voucher`
* **File:** `paymentVoucher.model.js`
* **Mongoose Model:** `payment_voucher`
* **Mongoose Collection:** `payment_vouchers`
* **Schema Fields:**
  * **`org`**: `Types.ObjectId` (required, ref: `"organization"`)
  * **`party`**: `Types.ObjectId` (optional, ref: `"party"`)
  * **`createdBy`**: `Types.ObjectId` (required, ref: `"user"`)
  * **`updatedBy`**: `Types.ObjectId` (optional, ref: `"user"`)
  * **`voucherType`**: `String` (required, enum: `["receipt", "payment"]`)
  * **`amount`**: `Number` (required, min: `0`)
  * **`paymentMode`**: `String` (validated against `"PAYMENT_METHODS"` property)
  * **`description`**: `String` (max length: `200`, default: `""`)
  * **`date`**: `Date` (default: `Date.now`)
  * **`refDoc`**: `Types.ObjectId` (optional, refPath: `"refDocModel"`)
  * **`refDocModel`**: `String` (optional, enum: `["invoice", "purchase"]`)
  * **`financialYear`**: `Object` containing `{ start (Date, required), end (Date, required) }` (required)
  * **`num`**: `String` (default: `""`)
  * **`sequence`**: `Number` (required)
  * **`prefix`**: `String` (default: `""`)
* **Timestamps:** `true` (createdAt, updatedAt)
* **Version Key:** `false`
* **Indices:**
  * `{ org: 1, createdAt: -1 }`
  * `{ "financialYear.start": 1, "financialYear.end": -1 }`
  * `{ num: 1 }`

### `taxes`
* **File:** `tax.model.js`
* **Mongoose Model:** `taxes`
* **Mongoose Collection:** `taxes`
* **Schema Fields:**
  * **`name`**: `String` (required, max: `20`)
  * **`org`**: `Types.ObjectId` (required, ref: `"organization"`)
  * **`description`**: `String` (optional, max: `80`)
  * **`type`**: `String` (required, enum: `["single", "grouped"]`, default: `"single"`)
  * **`category`**: `String` (required, enum: `["igst", "sgst", "cgst", "vat", "cess", "sal", "none", "others"]`)
  * **`children`**: `[Types.ObjectId]` (ref: `"taxes"`, required)
  * **`percentage`**: `Number` (required, default: `0`, min: `0`, max: `100`)
  * **`createdBy`**: `Types.ObjectId` (required, ref: `"user"`)
  * **`enabled`**: `Boolean` (required, default: `true`)
* **Mongoose Collection Name:** `taxes`
* **Indices:**
  * Text Index on `{ name }`
  * `{ org: 1, createdAt: -1 }`

---

## System & Communication

### `activity`
* **File:** `activity.model.js`
* **Mongoose Model:** `activity`
* **Mongoose Collection:** `activities`
* **Schema Fields:**
  * **`org`**: `Types.ObjectId` (required, ref: `"organization"`, indexed)
  * **`user`**: `Types.ObjectId` (required, ref: `"user"`)
  * **`docModel`**: `String` (required, enum: `["invoice", "purchase", "expense", "quotes", "proforma_invoice", "purchase_order", "payment_voucher"]`)
  * **`doc`**: `Types.ObjectId` (required, refPath: `"docModel"`)
  * **`action`**: `String` (required, enum: `["created", "updated", "sent"]`)
  * **`message`**: `String` (required)
  * **`data`**: `Object` containing `{ messageId: String, to: [String], cc: [String], html: String, body: String }`
* **Timestamps:** `{ createdAt: "at", updatedAt: false }`
* **Version Key:** `false`
* **Indices:**
  * `{ org: 1, doc: 1, at: -1 }`

### `audit_log`
* **File:** `auditLog.model.js`
* **Mongoose Model:** `audit_log`
* **Mongoose Collection:** `audit_logs`
* **Schema Fields:**
  * **`org`**: `Types.ObjectId` (required, ref: `"organization"`, indexed)
  * **`user`**: `Types.ObjectId` (required, ref: `"user"`)
  * **`docModel`**: `String` (required)
  * **`doc`**: `Types.ObjectId` (required)
  * **`action`**: `String` (required)
  * **`changes`**: `Mixed` (optional)
* **Timestamps:** `{ createdAt: "at", updatedAt: false }`
* **Version Key:** `false`
* **Indices:**
  * `{ org: 1, doc: 1, at: -1 }`

### `chat`
* **File:** `chat.model.js`
* **Mongoose Model:** `chat`
* **Mongoose Collection:** `chats`
* **Schema Fields:**
  * **`org`**: `Types.ObjectId` (required, ref: `"organization"`)
  * **`user`**: `Types.ObjectId` (required, ref: `"user"`)
  * **`title`**: `String` (default: `"New conversation"`)
  * **`messages`**: Array of items containing:
    * `role`: `String` (required, enum: `["system", "user", "assistant", "tool"]`)
    * `content`: `String` (optional)
    * `images`: `[String]`
    * `tool_calls`: `[Object]`
    * `tool_call_id`: `String`
    * `downloads`: `[Object]`
    * `createdAt`: `Date` (default: `Date.now`)
  * **`isActive`**: `Boolean` (default: `true`)
* **Timestamps:** `true` (createdAt, updatedAt)
* **Version Key:** `false`
* **Indices:**
  * Text Index on `{ title }`
  * `{ org: 1, user: 1, updatedAt: -1 }`

### `job`
* **File:** `job.model.js`
* **Mongoose Model:** `job`
* **Mongoose Collection:** `jobs`
* **Schema Fields:**
  * **`type`**: `String` (required, enum: `["bulk_upload"]`)
  * **`status`**: `String` (enum: `["pending", "in_progress", "completed", "failed"]`, default: `"pending"`)
  * **`createdBy`**: `Types.ObjectId` (required, ref: `"user"`)
  * **`org`**: `Types.ObjectId` (required, ref: `"organization"`)
  * **`metadata`**: `Schema.Types.Mixed` (optional)
* **Timestamps:** `true` (createdAt, updatedAt)
* **Version Key:** `false`

### `notification`
* **File:** `notification.model.js`
* **Mongoose Model:** `notification`
* **Mongoose Collection:** `notifications`
* **Schema Fields:**
  * **`org`**: `Types.ObjectId` (required, ref: `"organization"`)
  * **`user`**: `Types.ObjectId` (required, ref: `"user"`)
  * **`title`**: `String` (required)
  * **`message`**: `String` (required)
  * **`type`**: `String` (enum: `["info", "warning", "error", "success"]`, default: `"info"`)
  * **`isRead`**: `Boolean` (default: `false`)
  * **`data`**: `Object` (optional)
* **Timestamps:** `true` (createdAt, updatedAt)
* **Version Key:** `false`

### `properties`
* **File:** `properties.model.js`
* **Mongoose Model:** `properties`
* **Mongoose Collection:** `properties`
* **Schema Fields:**
  * **`name`**: `String` (required, unique)
  * **`value`**: `Mixed` (required)
* **Version Key:** `false`

### `setting`
* **File:** `settings.model.js`
* **Mongoose Model:** `setting`
* **Mongoose Collection:** `settings`
* **Schema Fields:**
  * **`org`**: `Types.ObjectId` (required, ref: `"organization"`, unique)
  * **`transactionPrefix`**: `Object` containing `{ invoice: String, quotation: String, purchaseOrder: String, proformaInvoice: String, saleOrder: String, paymentVoucher: String }`
  * **`prefixes`**: `Object` containing `{ invoice: [String], quotation: [String], purchaseOrder: [String], proformaInvoice: [String], paymentVoucher: [String] }`
  * **`currency`**: `String` (required, default: `"INR"`)
  * **`localeCode`**: `String` (required, default: `"en-IN"`)
  * **`financialYear`**: `Object` containing `{ start (Date, required), end (Date, required) }` (required)
  * **`sequenceCounters`**: `Object` containing `{ invoice, quotation, purchaseOrder, proformaInvoice, saleOrder, paymentVoucher, unReadNotifications }` storing numeric counters.
  * **`printSettings`**: `Object` containing:
    * `bank`: `Boolean` (default: `false`)
    * `upiQr`: `Boolean` (default: `false`)
    * `defaultTemplate`: `String` (default: `"simple"`, validated against `"TEMPLATES_CONFIG"` property)
  * **`receiptDefaults`**: `Object` containing:
    * `um`: `Types.ObjectId` (required, ref: `"ums"`)
    * `tax`: `Types.ObjectId` (required, ref: `"taxes"`)
  * **`aiProviders`**: `[Object]` (maximum `3` allowed) containing `{ provider (enum: ["grok", "ollama"]), fields (apiKey: String), name (String, required), isActive (Boolean, default: false) }`
  * **`smtpProviders`**: `[Object]` (maximum `3` allowed) containing `{ provider (enum: ["gmail", "brevo"]), fields: { user, pass, port, secure }, name (String, required), isActive (Boolean, default: false) }`
  * **`signature`**: `String` (optional)
* **Indices:**
  * `{ org: 1, "aiProviders.name": 1 }` (unique)

### `template`
* **File:** `template.model.js`
* **Mongoose Model:** `template`
* **Mongoose Collection:** `templates`
* **Schema Fields:**
  * **`name`**: `String` (required, trimmed)
  * **`type`**: `String` (required, enum: `["term", "email"]`)
  * **`content`**: `String` (required)
  * **`org`**: `Types.ObjectId` (required, ref: `"organization"`)
  * **`createdBy`**: `Types.ObjectId` (required, ref: `"user"`)
  * **`updatedBy`**: `Types.ObjectId` (optional, ref: `"user"`)
  * **`isDefault`**: `Boolean` (default: `false`)
* **Timestamps:** `true` (createdAt, updatedAt)
* **Version Key:** `false`
* **Indices:**
  * `{ org: 1, type: 1 }`
  * `{ type: 1 }`
  * `{ org: 1, createdAt: -1 }`
