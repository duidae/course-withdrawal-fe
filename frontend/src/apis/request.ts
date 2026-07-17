import axios from "axios";

const baseURL = import.meta.env.VITE_API_BASE_URL ?? "";

let config = {};

if (baseURL !== "") {
  config = {
    baseURL: import.meta.env.VITE_API_BASE_URL,
    withCredentials: true,
  };
}

export const request = axios.create(config);
