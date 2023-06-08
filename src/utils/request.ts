import axios, { AxiosRequestConfig } from "axios";
import { BASE_URL } from "./const";

export interface RequestApiConfig extends AxiosRequestConfig {
  method: string;
  endPoint: string;
  token?: string;
}

export function requestApi({
  method,
  endPoint,
  token,
  ...rest
}: RequestApiConfig) {
  return axios({
    method,
    url: endPoint,
    baseURL: BASE_URL,
    headers: {
      Authorization: token ? `Bearer ${token}` : undefined,
    },
    ...rest,
  });
}
