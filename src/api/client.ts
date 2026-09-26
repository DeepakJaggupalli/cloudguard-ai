import { config } from '../config/environment';

class ApiClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = config.apiBaseUrl;
  }

  // Simulated network latency for mock mode to test loading states cleanly
  async mockDelay(ms = 80): Promise<void> {
    if (config.useMockData) {
      await new Promise((resolve) => setTimeout(resolve, ms));
    }
  }

  async get<T>(endpoint: string): Promise<T> {
    if (config.useMockData) {
      throw new Error(`Mock mode active. Real GET to ${endpoint} intercepted.`);
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API Error [${response.status}] ${endpoint}: ${errorText}`);
    }

    return response.json();
  }

  async post<T>(endpoint: string, body?: unknown): Promise<T> {
    if (config.useMockData) {
      throw new Error(`Mock mode active. Real POST to ${endpoint} intercepted.`);
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API Error [${response.status}] ${endpoint}: ${errorText}`);
    }

    return response.json();
  }
}

export const apiClient = new ApiClient();
