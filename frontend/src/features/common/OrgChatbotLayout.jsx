import { Outlet } from "react-router-dom";
import ChatWidget from "../bot";
import useAuth from "../../hooks/useAuth";
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
