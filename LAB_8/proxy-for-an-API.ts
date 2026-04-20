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