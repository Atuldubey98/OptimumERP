import axios, { isAxiosError } from "axios";

export const baseURL = import.meta.env.PROD ? "http://api.optimumerp.biz" :  "http://localhost:3000";
const instance = axios.create({
  baseURL,
  withCredentials: true,
});
export default instance;

instance.interceptors.response.use(
  function (response) {
    return response;
  },
  function (error) {
    if (
      isAxiosError(error) &&
      error.response?.status === 401 &&
      window.location.pathname !== "/"
    )
      window.location.href = "/";
    
    return Promise.reject(error);
  }
);
