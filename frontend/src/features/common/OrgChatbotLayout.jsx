import { Outlet } from "react-router-dom";
import { Suspense } from "react";
import useAuth from "../../hooks/useAuth";
import ChatWidget from "../bot";
import MainLayout from "./main-layout";
import FullLoader from "./FullLoader";

const OrgChatbotLayout = () => {
  const { user } = useAuth();
  const currentFeatures = user?.features || {};
  const bot = currentFeatures?.bot ?? false;
  return (
    <MainLayout>
      {bot && <ChatWidget />}
      <Suspense fallback={<FullLoader />}>
        <Outlet />
      </Suspense>
    </MainLayout>
  );
};

export default OrgChatbotLayout;
