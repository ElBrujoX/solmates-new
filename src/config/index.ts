interface Config {
  mongodb_uri: string;
  jwt_secret: string;
  api_key: string;
  rate_limits: {
    analytics: { windowMs: number; max: number };
    reports: { windowMs: number; max: number };
  };
}

const config: { [key: string]: Config } = {
  development: {
    mongodb_uri: process.env.MONGODB_URI || '',
    jwt_secret: process.env.JWT_SECRET || '',
    api_key: process.env.API_KEY || '',
    rate_limits: {
      analytics: { windowMs: 15 * 60 * 1000, max: 100 },
      reports: { windowMs: 5 * 60 * 1000, max: 50 }
    }
  },
  production: {
    mongodb_uri: process.env.MONGODB_URI || '',
    jwt_secret: process.env.JWT_SECRET || '',
    api_key: process.env.API_KEY || '',
    rate_limits: {
      analytics: { windowMs: 15 * 60 * 1000, max: 50 },
      reports: { windowMs: 5 * 60 * 1000, max: 20 }
    }
  }
};

export default config[process.env.NODE_ENV || 'development']; 