require('dotenv').config();

const requiredSecret = process.env.JWT_SECRET || 'dev-only-change-me';

module.exports = {
  env: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT || 3000),
  appName: process.env.APP_NAME || 'MyPastorAdmin',
  appOrigin: process.env.APP_ORIGIN || 'http://localhost:3000',
  jwtSecret: requiredSecret,
  seedDemo: String(process.env.SEED_DEMO || 'true').toLowerCase() === 'true',
  fellowshipName: process.env.FELLOWSHIP_NAME || 'MyPastorAdmin Church',
  pastorName: process.env.PASTOR_NAME || 'Pastor',
  timezone: process.env.TIMEZONE || 'Europe/London',
  ai: {
    anthropicKey: process.env.ANTHROPIC_API_KEY || '',
    model: process.env.AI_MODEL || 'claude-sonnet-4-6'
  }
};
