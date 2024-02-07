import instance from "../instance";

export const logoutUser = () => {
  return instance.post("/api/v1/users/logout");
};
