import instance from "../instance";
import { organizationUrl } from "./utils";

export const createOrg = (organization) => {
  return instance.post(organizationUrl, organization);
};

export const getOrgs = () => {
  return instance.get(organizationUrl);
};
