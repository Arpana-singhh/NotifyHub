type HeadersMap = Record<string, string>;

const AUTH_TOKEN_KEY = "authToken";

class AxiosService {
  static getJsonHeader = (): HeadersMap => {
    return {
      "Content-Type": "application/json",
      Accept: "application/json",
    };
  };

  static getToken = (): string | null => {
    if (typeof window === "undefined") return null;

    return localStorage.getItem(AUTH_TOKEN_KEY) || sessionStorage.getItem(AUTH_TOKEN_KEY);
  };

  static setToken = (token: string, rememberMe: boolean): void => {
    if (rememberMe) {
      sessionStorage.removeItem(AUTH_TOKEN_KEY);
      localStorage.setItem(AUTH_TOKEN_KEY, token);
      return;
    }

    localStorage.removeItem(AUTH_TOKEN_KEY);
    sessionStorage.setItem(AUTH_TOKEN_KEY, token);
  };

  static clearToken = (): void => {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    sessionStorage.removeItem(AUTH_TOKEN_KEY);
  };
}

export default AxiosService;
