type HeadersMap = Record<string, string>;

class AxiosService {
  static getJsonHeader = (): HeadersMap => {
    return {
      "Content-Type": "application/json",
      Accept: "application/json",
    };
  };
}

export default AxiosService;
