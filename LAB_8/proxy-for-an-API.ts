interface AuthStrategy {
  getAuthHeaders(): Promise<Record<string, string>>;
  handleResponse?(response: Response): Promise<boolean>; // For token renewal logic
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
