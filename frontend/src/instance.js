import axios from "axios";

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
    return Promise.reject(error);
  }
);
