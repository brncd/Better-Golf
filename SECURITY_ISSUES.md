# Security Issues - Better Golf Application

## Critical Security Issue: Hardcoded JWT Secret

### Issue Description
The JWT secret key is currently hardcoded in the backend configuration file, which poses a significant security risk.

### Location
- **File**: `Api/appsettings.Development.json`
- **Configuration**: `JwtSettings.SecretKey`

### Current Implementation
```json
{
  "JwtSettings": {
    "SecretKey": "your-very-long-secret-key-here-make-it-at-least-256-bits-long-for-security",
    "Issuer": "BetterGolf",
    "Audience": "BetterGolfUsers",
    "ExpirationMinutes": 60
  }
}
```

### Security Risks
1. **Source Code Exposure**: The secret key is visible in version control
2. **Environment Leakage**: Development secrets may accidentally be used in production
3. **Unauthorized Access**: Anyone with access to the codebase can generate valid JWT tokens
4. **Compliance Issues**: Violates security best practices and compliance requirements

### Recommended Solutions

#### 1. Environment Variables (Immediate Fix)
Move the JWT secret to environment variables:

**appsettings.Development.json:**
```json
{
  "JwtSettings": {
    "SecretKey": "",
    "Issuer": "BetterGolf",
    "Audience": "BetterGolfUsers",
    "ExpirationMinutes": 60
  }
}
```

**Environment Variable:**
```bash
export JWT_SECRET_KEY="your-secure-secret-key-here"
```

**Program.cs Update:**
```csharp
builder.Services.Configure<JwtSettings>(options =>
{
    builder.Configuration.GetSection("JwtSettings").Bind(options);
    // Override with environment variable if available
    var envSecret = Environment.GetEnvironmentVariable("JWT_SECRET_KEY");
    if (!string.IsNullOrEmpty(envSecret))
    {
        options.SecretKey = envSecret;
    }
});
```

#### 2. Azure Key Vault (Production Recommended)
For production environments, use Azure Key Vault or similar secret management service:

```csharp
builder.Configuration.AddAzureKeyVault(
    new Uri($"https://{keyVaultName}.vault.azure.net/"),
    new DefaultAzureCredential());
```

#### 3. Docker Secrets (Container Deployment)
For containerized deployments, use Docker secrets:

```yaml
version: '3.8'
services:
  api:
    image: better-golf-api
    secrets:
      - jwt_secret
    environment:
      - JWT_SECRET_KEY_FILE=/run/secrets/jwt_secret

secrets:
  jwt_secret:
    external: true
```

### Implementation Priority
- **High Priority**: Remove hardcoded secret from appsettings.Development.json
- **Medium Priority**: Implement environment variable solution
- **Long-term**: Migrate to proper secret management service

### Additional Security Recommendations

#### 1. JWT Token Rotation
Implement token rotation mechanism:
- Short-lived access tokens (15-30 minutes)
- Refresh tokens for extended sessions
- Token blacklisting for logout

#### 2. Enhanced JWT Configuration
```json
{
  "JwtSettings": {
    "SecretKey": "", // From environment
    "Issuer": "BetterGolf",
    "Audience": "BetterGolfUsers",
    "AccessTokenExpirationMinutes": 15,
    "RefreshTokenExpirationDays": 7,
    "Algorithm": "HS256",
    "ValidateIssuer": true,
    "ValidateAudience": true,
    "ValidateLifetime": true,
    "ValidateIssuerSigningKey": true
  }
}
```

#### 3. Security Headers
Add security headers to API responses:
```csharp
app.Use(async (context, next) =>
{
    context.Response.Headers.Add("X-Content-Type-Options", "nosniff");
    context.Response.Headers.Add("X-Frame-Options", "DENY");
    context.Response.Headers.Add("X-XSS-Protection", "1; mode=block");
    context.Response.Headers.Add("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
    await next();
});
```

### Testing Security Changes
1. Verify JWT tokens are still generated correctly
2. Test authentication flows with new secret management
3. Ensure no hardcoded secrets remain in codebase
4. Validate token expiration and refresh mechanisms

### Compliance Notes
- This fix addresses OWASP Top 10 security risks
- Meets requirements for SOC 2 Type II compliance
- Aligns with NIST Cybersecurity Framework guidelines

---

**Created**: 2025-09-16  
**Priority**: Critical  
**Assigned**: Backend Development Team  
**Status**: Pending Implementation
