# Better Golf Client - Environment Configuration

This document explains how to configure the Better Golf client application for different environments.

## Environment Variables

The application uses environment variables for configuration. Copy `env.example` to `.env.local` and configure the values for your environment.

### Required Variables

```bash
# API Configuration
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000
NEXT_PUBLIC_API_TIMEOUT=30000

# Authentication
NEXT_PUBLIC_JWT_EXPIRY_HOURS=24

# Application Settings
NEXT_PUBLIC_APP_NAME="Better Golf"
NEXT_PUBLIC_APP_VERSION="1.0.0"
```

### Optional Variables

```bash
# Feature Flags
NEXT_PUBLIC_ENABLE_REGISTRATION=true
NEXT_PUBLIC_ENABLE_GUEST_ACCESS=false
NEXT_PUBLIC_ENABLE_NOTIFICATIONS=true

# Development Settings
NEXT_PUBLIC_DEBUG_MODE=false
NEXT_PUBLIC_LOG_LEVEL=info

# External Services
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_key
NEXT_PUBLIC_ANALYTICS_ID=your_analytics_id
```

## Environment-Specific Configurations

### Development
```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000
NEXT_PUBLIC_DEBUG_MODE=true
NEXT_PUBLIC_LOG_LEVEL=debug
NEXT_PUBLIC_ENABLE_REGISTRATION=true
```

### Staging
```bash
NEXT_PUBLIC_API_BASE_URL=https://api-staging.bettergolf.com
NEXT_PUBLIC_DEBUG_MODE=false
NEXT_PUBLIC_LOG_LEVEL=info
NEXT_PUBLIC_ENABLE_REGISTRATION=true
```

### Production
```bash
NEXT_PUBLIC_API_BASE_URL=https://api.bettergolf.com
NEXT_PUBLIC_DEBUG_MODE=false
NEXT_PUBLIC_LOG_LEVEL=warn
NEXT_PUBLIC_ENABLE_REGISTRATION=false
```

## Configuration Validation

The application automatically validates configuration on startup. If critical configuration is missing or invalid, the application will log errors and may fail to start.

## Feature Flags

### Registration
- `NEXT_PUBLIC_ENABLE_REGISTRATION=true`: Shows registration page and allows new user signup
- `NEXT_PUBLIC_ENABLE_REGISTRATION=false`: Hides registration functionality

### Guest Access
- `NEXT_PUBLIC_ENABLE_GUEST_ACCESS=true`: Allows limited access without authentication
- `NEXT_PUBLIC_ENABLE_GUEST_ACCESS=false`: Requires authentication for all features

### Notifications
- `NEXT_PUBLIC_ENABLE_NOTIFICATIONS=true`: Enables in-app notifications
- `NEXT_PUBLIC_ENABLE_NOTIFICATIONS=false`: Disables notification system

## Logging Levels

- `error`: Only log errors
- `warn`: Log warnings and errors
- `info`: Log informational messages, warnings, and errors (default)
- `debug`: Log all messages including debug information

## Security Considerations

1. **Never commit `.env.local` files** - They are gitignored by default
2. **Use HTTPS in production** - Always use secure API endpoints
3. **Rotate API keys regularly** - Especially for external services
4. **Limit debug mode** - Never enable debug mode in production

## Troubleshooting

### Common Issues

1. **API Connection Failed**
   - Check `NEXT_PUBLIC_API_BASE_URL` is correct
   - Verify API server is running
   - Check network connectivity

2. **Authentication Issues**
   - Verify JWT configuration matches backend
   - Check token expiry settings

3. **Feature Not Available**
   - Check relevant feature flag is enabled
   - Verify user has required permissions

### Debug Mode

Enable debug mode for detailed logging:
```bash
NEXT_PUBLIC_DEBUG_MODE=true
NEXT_PUBLIC_LOG_LEVEL=debug
```

This will log:
- All API requests and responses
- Authentication events
- Navigation events
- Configuration details (sensitive data masked)
