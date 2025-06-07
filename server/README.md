# PigeonRTC Server

Backend server for PigeonRTC - AI Agent Marketplace

## Features

- User authentication (JWT)
- Role-based access control (User, Developer, Admin)
- Email verification
- Password reset
- Rate limiting
- API documentation (OpenAPI/Swagger)
- Production-ready configuration

## Prerequisites

- Node.js 16+ and npm
- MongoDB 4.4+
- Redis (for rate limiting)
- SMTP server (SendGrid, Amazon SES, etc.)

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy `.env.example` to `.env` and update with your configuration
4. For production, copy `.env.production` and update with production values

## Development

```bash
# Start development server
npm run dev

# Run tests
npm test

# Lint code
npm run lint
```

## Production Deployment

1. Set up environment variables in `.env.production`
2. Install PM2 globally:
   ```bash
   npm install -g pm2
   ```
3. Start the production server:
   ```bash
   npm run setup:production
   npm run start:production
   ```
4. Set up PM2 to start on system boot:
   ```bash
   pm2 startup
   pm2 save
   ```

## API Documentation

API documentation is available in OpenAPI 3.0 format in `docs/openapi.yaml`.

To view the interactive documentation:

1. Start the development server
2. Visit `http://localhost:4010/graphql` for GraphQL Playground
3. Or import `docs/openapi.yaml` into Postman/Swagger UI

## Rate Limiting

- Public endpoints: 100 requests/minute per IP
- Authentication endpoints: 10 requests/15 minutes per IP
- API Key endpoints: 5000 requests/hour per key

## Security

- All passwords are hashed using bcrypt
- JWT tokens expire after 1 day
- CSRF protection enabled
- Rate limiting on all endpoints
- Input validation on all routes
- CORS configured for production domains

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| NODE_ENV | Environment (development/production) | development |
| PORT | Server port | 4010 |
| MONGODB_URI | MongoDB connection string | - |
| JWT_SECRET | Secret for JWT signing | - |
| JWT_EXPIRES_IN | JWT expiration time | 1d |
| EMAIL_HOST | SMTP server host | - |
| EMAIL_PORT | SMTP server port | 587 |
| EMAIL_USER | SMTP username | - |
| EMAIL_PASS | SMTP password | - |
| EMAIL_FROM | Sender email | PigeonRTC <noreply@pigeonrtc.com> |
| FRONTEND_URL | Frontend URL for email links | http://localhost:3000 |

## License

MIT
