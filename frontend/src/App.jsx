import { Route, Routes } from "react-router-dom";
import DashboardPage from "./features/dashboard";
import CustomersPage from "./features/customers";
import LoginPage from "./features/login";
import RegisterPage from "./features/register";
import OrgPage from "./features/organizations";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/:orgId">
        <Route element={<DashboardPage />} path="dashboard" />
        <Route element={<CustomersPage />} path="customers" />
      </Route>
      <Route path="/organizations" element={<OrgPage />} />
      <Route path="/register" element={<RegisterPage />} />
    </Routes>
  );
}
