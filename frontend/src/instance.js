import axios, { isAxiosError } from "axios";

const instance = axios.create({
  baseURL: "http://localhost:9000",
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
