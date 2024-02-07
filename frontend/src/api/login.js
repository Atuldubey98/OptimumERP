import instance from "../instance";
import { currentUserUrl, loginUrl } from "./utils";

export const loginUser = (user) => {
  return instance.post(loginUrl, user);
};
export const currentUser = () => {
  return instance.get(currentUserUrl);
};
