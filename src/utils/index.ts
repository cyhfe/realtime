import { AUTH_BASE_URL, BASE_URL } from "./const";

const localStorageKey = "__auth_provider_token__";

export function getToken() {
  return window.localStorage.getItem(localStorageKey);
}

export function setToken(token: string) {
  return window.localStorage.setItem(localStorageKey, token);
}

export function removeToken() {
  return window.localStorage.removeItem(localStorageKey);
}

interface AnyObject {
  [key: string]: any;
}
interface RequestOption {
  method?: string;
  data?: AnyObject;
  token?: string;
  headers?: AnyObject;
  [key: string]: any;
}

export function requestAuth(
  endpoint: string,
  {
    method,
    data,
    token,
    headers: customHeaders,
    ...customConfig
  }: RequestOption = {}
) {
  const config: RequestInit = {
    method: method ?? "GET",
    body: data ? JSON.stringify(data) : undefined,
    // @ts-ignore
    headers: {
      Authorization: token ? `Bearer ${token}` : undefined,
      "Content-Type": data ? "application/json" : undefined,
      ...customHeaders,
    },
    ...customConfig,
  };
  return fetch(AUTH_BASE_URL + endpoint, config);
}

export function request(
  endpoint: string,
  {
    method,
    data,
    token,
    headers: customHeaders,
    ...customConfig
  }: RequestOption = {}
) {
  const config: RequestInit = {
    method: method ?? "GET",
    body: data ? JSON.stringify(data) : undefined,
    // @ts-ignore
    headers: {
      Authorization: token ? `Bearer ${token}` : undefined,
      "Content-Type": data ? "application/json" : undefined,
      ...customHeaders,
    },
    ...customConfig,
  };

  return fetch(BASE_URL + endpoint, config);
}

