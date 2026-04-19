import { Outlet } from "react-router-dom";
import ChatWidget from "../bot";
import useAuth from "../../hooks/useAuth";
import MainLayout from "./main-layout";

const OrgChatbotLayout = () => {
  const { user } = useAuth();

  const currentPlan = user?.currentPlan || {};
  const limits = currentPlan?.limits || {};
  const bot = limits?.bot ?? false;
  return (
    <MainLayout>
      <ChatWidget />
      <Outlet />
    </MainLayout>
  );
};

export default OrgChatbotLayout;
