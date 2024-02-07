import instance from "../instance";
import { registerUrl } from "./utils";

export const registerUser = (newUser) => {
  return instance.post(registerUrl, newUser);
};
