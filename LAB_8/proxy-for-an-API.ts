interface AuthStrategy {
  getAuthHeaders(): Promise<Record<string, string>>;
  handleResponse?(response: Response): Promise<boolean>;
}

// API Key Strategy
class ApiKeyStrategy implements AuthStrategy {
  constructor(private apiKey: string, private headerName: string = 'X-API-Key') {}

  async getAuthHeaders() {
    return { [this.headerName]: this.apiKey };
  }
}

// JWT Strategy
class JwtStrategy implements AuthStrategy {
  constructor(private token: string) {}

  async getAuthHeaders() {
    return { 'Authorization': `Bearer ${this.token}` };
  }
}

// OAuth2 Strategy (with Auto-Renewal)
class OAuth2Strategy implements AuthStrategy {
  private accessToken: string | null = null;

  constructor(private refreshUrl: string, private clientId: string) {}

  private async refresh() {
    console.log("Refreshing OAuth token...");
    this.accessToken = "new_mock_token_123"; 
  }

  async getAuthHeaders() {
    if (!this.accessToken) await this.refresh();
    return { 'Authorization': `Bearer ${this.accessToken}` };
  }

  async handleResponse(response: Response): Promise<boolean> {
    if (response.status === 401) {
      await this.refresh();
      return true;
    }
    return false;
  }
}

class AuthProxy {
  private strategy: AuthStrategy;

  constructor(strategy: AuthStrategy) {
    this.strategy = strategy;
  }

  setStrategy(strategy: AuthStrategy) {
    this.strategy = strategy;
  }

  async request(url: string, options: RequestInit = {}): Promise<Response> {
    const authHeaders = await this.strategy.getAuthHeaders();
    
    const requestOptions: RequestInit = {
      ...options,
      headers: {
        ...options.headers,
        ...authHeaders,
        'Content-Type': 'application/json',
      },
    };

    console.log(`[Proxy] Requesting: ${url}`);
    let response = await fetch(url, requestOptions);

    if (this.strategy.handleResponse) {
      const shouldRetry = await this.strategy.handleResponse(response);
      if (shouldRetry) {
        console.log("[Proxy] Retrying request after auth update...");
        const newHeaders = await this.strategy.getAuthHeaders();
        response = await fetch(url, { ...requestOptions, headers: { ...requestOptions.headers, ...newHeaders } });
      }
    }

    return response;
  }
}