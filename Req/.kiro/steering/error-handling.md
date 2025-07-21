# Error Handling Guidelines

## Error Strategy

- **Centralized Error Handling**: Use middleware for consistent error responses
- **Structured Errors**: Always return consistent error format
- **Logging**: Log all errors with context using Winston logger
- **User-Friendly Messages**: Never expose internal errors to users

## Error Types

### Business Logic Errors

```typescript
class BusinessError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 400,
  ) {
    super(message);
    this.name = 'BusinessError';
  }
}

// Usage
throw new BusinessError('Email already exists', 'EMAIL_EXISTS', 409);
```

### Validation Errors

```typescript
// Use Zod for validation
const result = schema.safeParse(data);
if (!result.success) {
  throw new ValidationError('Invalid input', result.error.issues);
}
```

### Database Errors

```typescript
try {
  await prisma.user.create(data);
} catch (error) {
  logError(error, 'UserService.createUser', { email: data.email });

  if (error.code === 'P2002') {
    throw new BusinessError('Email already exists', 'EMAIL_EXISTS', 409);
  }

  throw new Error('Database operation failed');
}
```

## Error Response Format

```typescript
{
  "error": {
    "code": "EMAIL_EXISTS",
    "message": "Email already exists",
    "details": "The provided email is already registered in the system",
    "timestamp": "2024-01-15T10:30:00Z",
    "path": "/api/users",
    "requestId": "req_123456"
  }
}
```

## Error Middleware

```typescript
export const errorHandler = (error: Error, req: Request, res: Response, next: NextFunction) => {
  // Log error with context
  logError(error, req.path, {
    method: req.method,
    userId: req.user?.id,
    body: req.body,
  });

  // Handle different error types
  if (error instanceof BusinessError) {
    return res.status(error.statusCode).json({
      error: {
        code: error.code,
        message: error.message,
        timestamp: new Date().toISOString(),
        path: req.path,
      },
    });
  }

  // Default error response
  res.status(500).json({
    error: {
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred',
      timestamp: new Date().toISOString(),
      path: req.path,
    },
  });
};
```
