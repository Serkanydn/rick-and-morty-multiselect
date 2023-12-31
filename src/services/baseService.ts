import axios, { AxiosRequestConfig, AxiosResponse } from "axios";

class BaseService {
  #baseUrl: string;
  #options: AxiosRequestConfig;
  constructor(baseUrl: string) {
    this.#baseUrl = baseUrl;
    this.#options = {
      headers: { "Content-Type": "application/json" },
    };
  }
  get<T>(options: AxiosRequestConfig = {}): Promise<AxiosResponse<T>> {
    return axios.get<T>(this.#baseUrl, {
      ...this.#options,
      ...options,
    });
  }
}

export default BaseService;
