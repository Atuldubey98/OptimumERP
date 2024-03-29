export const registerUrl = "/api/v1/users/register";
export const loginUrl = "/api/v1/users/login";
export const currentUserUrl = "/api/v1/users";
export const organizationUrl = "/api/v1/organizations";
export const getPartyUrl = (orgId) =>
  `/api/v1/organizations/${orgId}/parties`;
