import { Outlet } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import ChatWidget from "../bot";
import MainLayout from "./main-layout";

const OrgChatbotLayout = () => {
  const { user } = useAuth();
  const currentPlan = user?.limits || {};
  const bot = currentPlan?.bot ?? false;
  return (
    <MainLayout>
      {bot && <ChatWidget />}
      <Outlet />
    </MainLayout>
  );
};

export default OrgChatbotLayout;
