import axios, { isAxiosError } from "axios";

export const baseURL = import.meta.env.PROD
  ? "https://erp-mern.onrender.com"
  : "http://localhost:9000";
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
      window.location.pathname !== "/login"
    )
      window.location.href = "/login";
    
    return Promise.reject(error);
  }
);
