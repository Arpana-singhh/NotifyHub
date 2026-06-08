const config = {
  get baseUrl() {
    // Server-side (NextAuth authorize, SSR): call backend directly
    if (typeof window === 'undefined') {
      return process.env.API_BASE_URL || '';
    }
    // Client-side (browser): all requests go through the proxy
    return '/api/backend';
  },
};

export default config;
