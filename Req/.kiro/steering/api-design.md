# API Design Guidelines

## RESTful Principles

- **Resource-based URLs**: Use nouns, not verbs (`/users` not `/getUsers`)
- **HTTP Methods**: Use appropriate methods (GET, POST, PUT, DELETE, PATCH)
- **Status Codes**: Return meaningful HTTP status codes
- **Consistent Naming**: Use kebab-case for URLs, camelCase for JSON

## URL Structure

```
GET    /api/users           # Get all users
GET    /api/users/:id       # Get specific user
POST   /api/users           # Create user
PUT    /api/users/:id       # Update user (full)
PATCH  /api/users/:id       # Update user (partial)
DELETE /api/users/:id       # Delete user

# Nested resources
GET    /api/users/:id/reports    # Get user's reports
POST   /api/users/:id/reports    # Create report for user
```

## Request/Response Format

### Request Headers

```
Content-Type: application/json
Authorization: Bearer <token>
Accept: application/json
```

### Success Response

```typescript
{
  "data": {
    "id": "user_123",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe"
  },
  "meta": {
    "timestamp": "2024-01-15T10:30:00Z",
    "version": "1.0"
  }
}
```

### Error Response

```typescript
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      {
        "field": "email",
        "message": "Invalid email format"
      }
    ],
    "timestamp": "2024-01-15T10:30:00Z",
    "path": "/api/users"
  }
}
```

## Pagination

```typescript
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10,
    "hasNext": true,
    "hasPrev": false
  }
}
```

## Filtering and Sorting

```
GET /api/users?filter[role]=admin&sort=-createdAt&limit=20&page=1
```

## Status Codes

- `200` - OK (GET, PUT, PATCH)
- `201` - Created (POST)
- `204` - No Content (DELETE)
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (authentication required)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `409` - Conflict (duplicate resource)
- `422` - Unprocessable Entity (business logic error)
- `500` - Internal Server Error
