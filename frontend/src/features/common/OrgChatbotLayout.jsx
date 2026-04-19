import { Outlet } from "react-router-dom";
import ChatWidget from "../bot";
import useAuth from "../../hooks/useAuth";

const OrgChatbotLayout = () => {
  const { user } = useAuth();

  const currentPlan = user?.currentPlan || {};
  const limits = currentPlan?.limits || {};
  const bot = limits?.bot ?? false;
  return (
    <>
      <ChatWidget />
      <Outlet />
    </>
  );
};

export default OrgChatbotLayout;
