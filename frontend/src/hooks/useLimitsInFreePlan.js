import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import instance from "../instance";
import useAuth from "./useAuth";

export default function useLimitsInFreePlan({ key, orgId }) {
  const { orgId: paramsOrgId } = useParams();
  const [limits, setLimits] = useState({});
  useEffect(() => {
    (async () => {
      const { data } = await instance.get(
        `/api/v1/organizations/${orgId || paramsOrgId}`
      );
      setLimits(data.data.relatedDocsCount || {});
    })();
  }, []);
  const { user } = useAuth();
  const userLimits = user?.limits || {};
  const currentEntityLimit = userLimits[key] || 0;
  const currentUserEntityLimit = limits[key];
  return {
    disable: currentUserEntityLimit
      ? currentUserEntityLimit >= currentEntityLimit
      : false,
    currentEntityLimit,
    currentUserEntityLimit,
  };
}
