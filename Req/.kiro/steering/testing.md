# Testing Guidelines

## Test Strategy

- **Unit Tests**: All services must have comprehensive unit tests
- **Integration Tests**: API endpoints should have integration tests
- **Coverage Target**: Minimum 80% code coverage
- **Test Structure**: Use AAA pattern (Arrange, Act, Assert)

## Testing Conventions

### File Naming

- Test files: `*.test.ts`
- Test directories: `__tests__/`
- Mock files: `__mocks__/`

### Test Structure

```typescript
describe('ServiceName', () => {
  describe('methodName', () => {
    it('should do something when condition', () => {
      // Arrange
      const input = 'test';

      // Act
      const result = service.method(input);

      // Assert
      expect(result).toBe('expected');
    });
  });
});
```

### Mocking Guidelines

- Mock external dependencies
- Use proper TypeScript types for mocks
- Clear mocks between tests with `jest.clearAllMocks()`

## Test Commands

- `npm test` - Run all tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage report
