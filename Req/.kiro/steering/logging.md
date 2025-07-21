# Logging Guidelines

## Logging Strategy

- **Winston Logger**: Use the centralized logger from `@/utils/logger`
- **Log Levels**: error, warn, info, http, debug
- **Structured Logging**: Always use structured data for better searchability
- **Performance Logging**: Track slow operations (>1000ms)

## Usage Examples

### Basic Logging

```typescript
import logger, { logError, logBusinessEvent, logPerformance } from '@/utils/logger';

// Info logging
logger.info('User created successfully', { userId: user.id, email: user.email });

// Error logging with context
logError(error, 'UserService.createUser', { email: userData.email });

// Business events
logBusinessEvent('USER_REGISTERED', { userId: user.id }, user.id);

// Performance monitoring
const start = Date.now();
// ... operation
logPerformance('database.query', Date.now() - start, { query: 'getUserById' });
```

### HTTP Request Logging

```typescript
// Already configured in middleware
import { httpLogger } from '@/utils/logger';
app.use(httpLogger);
```

## Log Structure

### Error Logs

- Always include stack trace
- Add relevant context (userId, operation, input data)
- Use appropriate log level

### Business Event Logs

- Track important user actions
- Include user context when available
- Use consistent event naming

### Performance Logs

- Log operations > 1000ms as warnings
- Include operation details
- Track database queries and external API calls

## File Organization

- Error logs: `logs/error-YYYY-MM-DD.log`
- Combined logs: `logs/combined-YYYY-MM-DD.log`
- Log rotation: 14 days retention, 20MB max file size
