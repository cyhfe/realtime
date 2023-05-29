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
