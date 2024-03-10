import axios, { isAxiosError } from "axios";

export const baseURL = import.meta.env.VITE_API_URL;
console.log(baseURL);
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
