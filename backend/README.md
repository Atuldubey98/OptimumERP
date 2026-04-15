# Backend API Documentation

This document describes the backend HTTP API for Optimum ERP.

## Base URL

- Base path: `/api/v1`
- Health check: `GET /api/v1/health`

## Authentication Model

This API uses **session-based authentication** (`express-session` + Mongo session store), not bearer JWT for normal requests.

1. Call login endpoint.
2. Store the session cookie returned by the server.
3. Send that cookie on all protected API calls.

### cURL example (login + authenticated request)

```bash
# Login and store cookies
curl -i -c cookies.txt \
  -X POST http://localhost:3000/api/v1/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"you@example.com","password":"your-password"}'

# Use stored cookies for protected endpoints
curl -i -b cookies.txt \
  http://localhost:3000/api/v1/users
```

## Authorization and Access Control

The API enforces access in layers:

- `authenticate`: user must be logged in.
- `checkOrgAuthorization`: user must belong to `:orgId` organization.
- `authorize`: org admin-only endpoints.
- `limitFreePlanOnCreateEntityForOrganization(...)`: blocks create actions on free plan limits.
- `checkPlan(["gold", "platinum"])`: required for premium actions like some `send` operations.

## Error Response Format

Errors are returned as JSON in this shape:

```json
{
  "status": false,
  "message": "Error message",
  "url": "/api/v1/...",
  "method": "GET",
  "name": "ErrorName"
}
```

## Route Map

## 1) System

| Method | Path | Auth | Notes |
|---|---|---|---|
| GET | `/api/v1/health` | No | Service health endpoint |

## 2) Users

Base: `/api/v1/users`

| Method | Path | Auth | Notes |
|---|---|---|---|
| POST | `/register` | No | Register user |
| POST | `/verify` | No | Verify registered user OTP |
| POST | `/sendVerification` | No | Resend verification link |
| POST | `/login` | No | Login and create session |
| GET | `/googleAuth` | No | Get Google OAuth authorization URI |
| POST | `/googleAuth` | No | Google auth login callback flow |
| PATCH | `/googleAuth` | Yes | Update Google auth for logged in user |
| GET | `/` | Yes | Current user |
| PATCH | `/` | Yes | Update current user |
| POST | `/logout` | Yes | Logout current user |
| POST | `/avatar` | Yes | Upload avatar, multipart field: `avatar` |
| DELETE | `/avatar` | Yes | Remove avatar |
| POST | `/reset-password` | Yes | Reset password (logged-in user) |
| POST | `/forgot-password` | No | Start forgot password flow |
| POST | `/forgot-password/reset` | No | Verify forgot password OTP/reset step |
| POST | `/:orgId/deactivate` | Yes + Admin | Deactivate organization user |
| POST | `/:orgId/activate` | Yes + Admin | Activate organization user |

## 3) Organizations

Base: `/api/v1/organizations`

| Method | Path | Auth | Notes |
|---|---|---|---|
| POST | `/` | Yes | Create organization |
| GET | `/` | Yes | List organizations for current user |
| POST | `/:orgId/logo` | Yes | Upload org logo, multipart field: `logo` |
| DELETE | `/:orgId/logo` | Yes | Remove organization logo |

All routes below are under:

`/api/v1/organizations/:orgId`

and require:

- Authenticated session
- Organization membership authorization (`checkOrgAuthorization`)

### 3.1 Organization Profile and Members

| Method | Path | Extra | Notes |
|---|---|---|---|
| GET | `/` | - | Organization details for current user |
| PATCH | `/` | - | Update organization |
| GET | `/users` | Admin | List users in org |
| POST | `/users` | Admin | Add/create org user |
| PATCH | `/users/:userId` | Admin | Update org user |
| POST | `/closeFinancialYear` | Admin | Close financial year |

### 3.2 Parties

Base: `/api/v1/organizations/:orgId/parties`

| Method | Path | Extra | Notes |
|---|---|---|---|
| GET | `/` | - | Paginated list |
| GET | `/search` | - | Search parties by name/BA |
| POST | `/` | Free-plan create limit | Create party |
| PATCH | `/:partyId` | - | Update party |
| GET | `/:partyId` | - | Read party |
| GET | `/:partyId/transactions` | - | Party transaction summary |
| GET | `/:partyId/transactions/download` | - | Download transaction summary |
| DELETE | `/:partyId` | - | Delete party |
| POST | `/import` | Admin | Import parties via CSV, multipart field: `file` |

### 3.3 Products

Base: `/api/v1/organizations/:orgId/products`

| Method | Path | Extra | Notes |
|---|---|---|---|
| GET | `/` | - | List products |
| POST | `/bulk` | - | Bulk create products |
| POST | `/` | Free-plan create limit | Create product |
| PATCH | `/:productId` | - | Update product |
| GET | `/:productId` | - | Read product |
| DELETE | `/:productId` | - | Delete product |

### 3.4 Product Categories

Base: `/api/v1/organizations/:orgId/productCategories`

| Method | Path | Extra | Notes |
|---|---|---|---|
| POST | `/` | Free-plan create limit | Create category |
| GET | `/search` | - | Search categories |
| GET | `/` | - | List categories |
| GET | `/:id` | - | Read category |
| PATCH | `/:id` | - | Update category |
| DELETE | `/:id` | - | Delete category |

### 3.5 Quotes

Base: `/api/v1/organizations/:orgId/quotes`

| Method | Path | Extra | Notes |
|---|---|---|---|
| POST | `/` | Free-plan create limit | Create quote |
| GET | `/nextQuoteNo` | - | Get next quote sequence |
| GET | `/export` | - | Export quote data |
| GET | `/` | - | Paginated list |
| GET | `/:id` | - | Read quote |
| PATCH | `/:id` | - | Update quote |
| DELETE | `/:id` | - | Delete quote |
| GET | `/:id/view` | - | HTML view |
| GET | `/:id/download` | - | Download document |
| POST | `/:id/convertToInvoice` | Free-plan create limit on invoices | Convert quote to invoice |
| POST | `/:id/send` | Gold/Platinum | Send quote |

### 3.6 Invoices

Base: `/api/v1/organizations/:orgId/invoices`

| Method | Path | Extra | Notes |
|---|---|---|---|
| POST | `/` | Free-plan create limit | Create invoice |
| GET | `/nextSequence` | - | Get next invoice sequence |
| GET | `/export` | - | Export invoice data |
| GET | `/` | - | Paginated list |
| GET | `/:id` | - | Read invoice |
| PATCH | `/:id` | - | Update invoice |
| DELETE | `/:id` | - | Delete invoice |
| GET | `/:id/view` | - | HTML view |
| GET | `/:id/download` | - | Download invoice |
| POST | `/:id/payment` | - | Register payment |
| POST | `/:id/send` | Gold/Platinum | Send invoice |

### 3.7 Proforma Invoices

Base: `/api/v1/organizations/:orgId/proformaInvoices`

| Method | Path | Extra | Notes |
|---|---|---|---|
| POST | `/` | Free-plan create limit | Create proforma invoice |
| GET | `/nextProformaInvoiceNo` | - | Get next sequence |
| GET | `/export` | - | Export data |
| GET | `/` | - | List proforma invoices |
| GET | `/:id` | - | Read proforma invoice |
| PATCH | `/:id` | - | Update proforma invoice |
| DELETE | `/:id` | - | Delete proforma invoice |
| GET | `/:id/view` | - | HTML view |
| GET | `/:id/download` | - | Download document |
| POST | `/:id/convertToInvoice` | Free-plan create limit on invoices | Convert to invoice |
| POST | `/:id/send` | Gold/Platinum | Send proforma invoice |

### 3.8 Purchases

Base: `/api/v1/organizations/:orgId/purchases`

| Method | Path | Extra | Notes |
|---|---|---|---|
| POST | `/` | Free-plan create limit | Create purchase |
| GET | `/export` | - | Export purchase data |
| GET | `/` | - | List purchases |
| GET | `/:id` | - | Read purchase |
| PATCH | `/:id` | - | Update purchase |
| DELETE | `/:id` | - | Delete purchase |
| GET | `/:id/view` | - | HTML view |
| GET | `/:id/download` | - | Download purchase |
| POST | `/:id/payment` | - | Register payment |
| POST | `/:id/send` | Gold/Platinum | Send purchase |

### 3.9 Purchase Orders

Base: `/api/v1/organizations/:orgId/purchaseOrders`

| Method | Path | Extra | Notes |
|---|---|---|---|
| POST | `/` | Free-plan create limit | Create purchase order |
| GET | `/nextPurchaseOrderNo` | - | Get next sequence |
| GET | `/export` | - | Export purchase order data |
| GET | `/` | - | Paginated list |
| GET | `/:id` | - | Read purchase order |
| PATCH | `/:id` | - | Update purchase order |
| DELETE | `/:id` | - | Delete purchase order |
| GET | `/:id/view` | - | HTML view |
| GET | `/:id/download` | - | Download document |
| POST | `/:id/send` | Gold/Platinum | Send purchase order |

### 3.10 Expenses

Base: `/api/v1/organizations/:orgId/expenses`

| Method | Path | Extra | Notes |
|---|---|---|---|
| GET | `/` | - | Paginated list |
| POST | `/` | Free-plan create limit | Create expense |
| GET | `/:expenseId` | - | Read expense |
| PATCH | `/:expenseId` | - | Update expense |
| DELETE | `/:expenseId` | - | Delete expense |

### 3.11 Expense Categories

Base: `/api/v1/organizations/:orgId/expenseCategories`

| Method | Path | Extra | Notes |
|---|---|---|---|
| GET | `/` | - | List expense categories |
| POST | `/` | Free-plan create limit | Create expense category |
| PATCH | `/:categoryId` | - | Update expense category |
| GET | `/:categoryId` | - | Read expense category |
| DELETE | `/:categoryId` | - | Delete expense category |

### 3.12 Contacts

Base: `/api/v1/organizations/:orgId/contacts`

| Method | Path | Extra | Notes |
|---|---|---|---|
| POST | `/` | Free-plan create limit | Create contact |
| GET | `/` | - | List contacts |
| GET | `/:id` | - | Read contact |
| PATCH | `/:id` | - | Update contact |
| DELETE | `/:id` | - | Delete contact |

### 3.13 Dashboard

Base: `/api/v1/organizations/:orgId/dashboard`

| Method | Path | Extra |
|---|---|---|
| GET | `/` | Dashboard summary |

### 3.14 Reports

Base: `/api/v1/organizations/:orgId/reports`

| Method | Path | Extra |
|---|---|---|
| GET | `/:reportType` | Get report by type |
| GET | `/:reportType/download` | Download report by type |

### 3.15 Settings

Base: `/api/v1/organizations/:orgId/settings`

| Method | Path | Extra |
|---|---|---|
| GET | `/` | Get organization settings |
| PATCH | `/` | Update organization settings |

### 3.16 Taxes

Base: `/api/v1/organizations/:orgId/taxes`

| Method | Path | Extra |
|---|---|---|
| POST | `/` | Create tax |
| GET | `/` | List taxes |
| PATCH | `/:id` | Toggle tax enable/disable |
| DELETE | `/:id` | Delete tax |

### 3.17 UMs (Units of Measure)

Base: `/api/v1/organizations/:orgId/ums`

| Method | Path | Extra |
|---|---|---|
| POST | `/` | Free-plan create limit, create UM |
| GET | `/` | List all UMs |
| PATCH | `/:id` | Update UM |
| DELETE | `/:id` | Remove UM |

### 3.18 Stats

Base: `/api/v1/organizations/:orgId/stats`

| Method | Path | Extra |
|---|---|---|
| GET | `/` | Organization statistics |

## 4) Properties

Base: `/api/v1/property`

| Method | Path | Auth | Notes |
|---|---|---|---|
| GET | `/:name` | Yes | Read system property by name |

## 5) Translation Route (Defined but not mounted in app)

A translation route file exists with this endpoint:

| Method | Path |
|---|---|
| GET | `/api/v1/translations/:lng/:ns.json` |

Current app/router setup does not mount this route, so it is not active unless added to `app.js`.

## File Upload Endpoints

These endpoints expect `multipart/form-data`:

- `POST /api/v1/users/avatar` with field `avatar`
- `POST /api/v1/organizations/:orgId/logo` with field `logo`
- `POST /api/v1/organizations/:orgId/parties/import` with field `file` (CSV)

## Notes for Consumers

- Most business endpoints are organization-scoped under `/api/v1/organizations/:orgId/...`.
- Response payload structures vary per controller/entity.
- For request body contracts, inspect DTOs in `backend/src/dto` and controller validations.
