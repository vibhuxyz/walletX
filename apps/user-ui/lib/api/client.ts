import axios, { AxiosHeaders } from "axios";
import { getDeviceHeaders } from "../api/auth";

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

export const api = axios.create({
  baseURL: BASE,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const deviceHeaders = getDeviceHeaders();

  if (!config.headers) {
    config.headers = new AxiosHeaders();
  }

  Object.entries(deviceHeaders).forEach(([key, value]) => {
    if (value) {
      config.headers.set(key, value);
    }
  });

  return config;
});

// ✅ DO NOT REDIRECT HERE
api.interceptors.response.use(
  (res) => res,
  (error) => {
    return Promise.reject(error); // just pass error
  },
);
