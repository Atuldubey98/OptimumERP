import axios, { isAxiosError } from "axios";
import i18n from './i18n';
export const baseURL = import.meta.env.VITE_API_URL;
console.log({baseURL});

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

instance.interceptors.request.use(
  (config) => {
    const language = i18n.language || 'en';
    config.headers['Accept-Language'] = language;
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);