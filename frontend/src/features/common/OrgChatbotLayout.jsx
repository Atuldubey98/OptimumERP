import { Navigate, Outlet } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import ChatWidget from "../bot";
import MainLayout from "./main-layout";
import useCurrentOrgCurrency from "../../hooks/useCurrentOrgCurrency";

const OrgChatbotLayout = () => {
  const { user } = useAuth();
  const currentPlan = user?.limits || {};
  const bot = currentPlan?.bot ?? false;
  const { setting} = useCurrentOrgCurrency();
  if(!setting) {
    return <Navigate to="/organizations" />
  }
  return (
    <MainLayout>
      {bot && <ChatWidget />}
      <Outlet />
    </MainLayout>
  );
};

export default OrgChatbotLayout;
