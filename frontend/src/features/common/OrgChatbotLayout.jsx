import { Outlet } from "react-router-dom";
import { Suspense } from "react";
import useAuth from "../../hooks/useAuth";
import useCurrentOrgCurrency from "../../hooks/useCurrentOrgCurrency";
import ChatWidget from "../bot";
import MainLayout from "./main-layout";
import FullLoader from "./FullLoader";

const OrgChatbotLayout = () => {
  const { user } = useAuth();
  const { setting } = useCurrentOrgCurrency();
  const currentFeatures = user?.features || {};
  const hasPlanFeature = currentFeatures?.bot ?? false;
  const isBotEnabled = setting?.assistant?.enabled ?? true;
  const showBot = hasPlanFeature && isBotEnabled;

  return (
    <MainLayout>
      {showBot && <ChatWidget />}
      <Suspense fallback={<FullLoader />}>
        <Outlet />
      </Suspense>
    </MainLayout>
  );
};

export default OrgChatbotLayout;
