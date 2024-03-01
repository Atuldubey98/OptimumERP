import { Suspense, lazy } from "react";
import { Route, Routes } from "react-router-dom";
import AdminPage from "./features/admin";
import FullLoader from "./features/common/FullLoader";
import TransactionSettingsPage from "./features/common/transaction-settings";
import ExpenseCategoriePage from "./features/expense-categories";
import CreatePurchasePage from "./features/purchase/create";
import PurchasePage from "./features/purchase/list";
const DashboardPage = lazy(() => import("./features/dashboard"));
const LoginPage = lazy(() => import("./features/login"));
const OrgPage = lazy(() => import("./features/organizations"));
const RegisterPage = lazy(() => import("./features/register"));
const CustomersPage = lazy(() => import("./features/customers"));
const ProductsPage = lazy(() => import("./features/products"));
const EstimatesPage = lazy(() => import("./features/estimates/list"));
const CreateEstimatePage = lazy(() => import("./features/estimates/create"));
const NotFoundPage = lazy(() => import("./features/common/NotFoundPage"));
const CreateInvoicePage = lazy(() => import("./features/invoices/create"));
const InvoicesPage = lazy(() => import("./features/invoices/list"));
const ReportsPage = lazy(() => import("./features/reports"));
const ExpensesPage = lazy(() => import("./features/expenses"));
export default function App() {
  return (
    <Suspense fallback={<FullLoader />}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route
          path="/transaction-settings"
          element={<TransactionSettingsPage />}
        />
        <Route path="/:orgId">
          <Route element={<DashboardPage />} path="dashboard" />
          <Route element={<ProductsPage />} path="products" />
          <Route element={<CustomersPage />} path="customers" />
          <Route element={<ExpensesPage />} path="expenses" />
          <Route element={<ExpenseCategoriePage />} path="expense-categories" />
          <Route path="estimates">
            <Route element={<EstimatesPage />} path="" />
            <Route element={<CreateEstimatePage />} path="create" />
            <Route element={<CreateEstimatePage />} path=":quoteId/edit" />
          </Route>
          <Route path="invoices">
            <Route element={<InvoicesPage />} path="" />
            <Route element={<CreateInvoicePage />} path="create" />
            <Route element={<CreateInvoicePage />} path=":invoiceId/edit" />
          </Route>
          <Route path="purchases">
            <Route element={<PurchasePage />} path="" />
            <Route element={<CreatePurchasePage />} path="create" />
            <Route element={<CreatePurchasePage />} path=":purchaseId/edit" />
          </Route>
        </Route>
        <Route path="/organizations" element={<OrgPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/reports">
          <Route path="" element={<ReportsPage />} />
          <Route path=":reportType" element={<ReportsPage />} />
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
}
