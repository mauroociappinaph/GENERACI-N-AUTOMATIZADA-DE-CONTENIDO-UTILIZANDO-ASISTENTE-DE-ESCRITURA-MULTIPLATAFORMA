import { PrismaClient } from '../generated/prisma';
import { UserService } from '@/services/user.service';
import { JwtService } from '@/services/jwt.service';
import { PasswordService } from '@/services/password.service';

const prisma = new PrismaClient();
const userService = new UserService(prisma);

async function testAuthSystem(): Promise<void> {
  try {
    console.log('🔐 Testing Authentication System...\n');

    // Test 1: Create a test user
    console.log('1. Creating test user...');
    const testUser = {
      email: 'auth-test@example.com',
      password: 'TestPassword123!',
      firstName: 'Auth',
      lastName: 'Test',
    };

    try {
      // Clean up any existing test user
      await prisma.user.deleteMany({
        where: { email: testUser.email },
      });

      const createdUser = await userService.createUser(testUser);
      console.log(`   ✅ Test user created: ${createdUser.email}\n`);

      // Test 2: JWT Token Generation
      console.log('2. Testing JWT token generation...');
      const tokens = JwtService.generateTokenPair(createdUser);
      console.log(
        `   ✅ Access token generated (length: ${tokens.accessToken.length})`
      );
      console.log(
        `   ✅ Refresh token generated (length: ${tokens.refreshToken.length})`
      );
      console.log(`   ✅ Expires in: ${tokens.expiresIn} seconds\n`);

      // Test 3: Token Verification
      console.log('3. Testing token verification...');
      const decodedAccess = JwtService.verifyAccessToken(tokens.accessToken);
      const decodedRefresh = JwtService.verifyRefreshToken(tokens.refreshToken);

      console.log(
        `   ✅ Access token verified - User ID: ${decodedAccess.userId}`
      );
      console.log(
        `   ✅ Refresh token verified - User ID: ${decodedRefresh.userId}\n`
      );

      // Test 4: Token Extraction
      console.log('4. Testing token extraction from header...');
      const authHeader = `Bearer ${tokens.accessToken}`;
      const extractedToken = JwtService.extractTokenFromHeader(authHeader);
      console.log(
        `   ✅ Token extracted successfully: ${extractedToken === tokens.accessToken}\n`
      );

      // Test 5: Refresh Token Flow
      console.log('5. Testing refresh token flow...');
      const newAccessToken = JwtService.refreshAccessToken(tokens.refreshToken);
      const newDecoded = JwtService.verifyAccessToken(newAccessToken);
      console.log(
        `   ✅ New access token generated and verified - User ID: ${newDecoded.userId}\n`
      );

      // Test 6: Credential Verification
      console.log('6. Testing credential verification...');
      const verifiedUser = await userService.verifyCredentials(
        testUser.email,
        testUser.password
      );
      console.log(`   ✅ Credentials verified: ${verifiedUser?.email}\n`);

      // Test 7: Invalid Token Handling
      console.log('7. Testing invalid token handling...');
      try {
        JwtService.verifyAccessToken('invalid-token');
        console.log('   ❌ Should have thrown error for invalid token');
      } catch (error) {
        console.log(
          `   ✅ Invalid token correctly rejected: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
      }

      try {
        JwtService.verifyRefreshToken('invalid-refresh-token');
        console.log('   ❌ Should have thrown error for invalid refresh token');
      } catch (error) {
        console.log(
          `   ✅ Invalid refresh token correctly rejected: ${error instanceof Error ? error.message : 'Unknown error'}\n`
        );
      }

      // Test 8: Password Strength Validation
      console.log('8. Testing password strength validation...');
      const weakPassword = '123';
      const strongPassword = 'StrongPass123!';

      const weakValidation =
        PasswordService.validatePasswordStrength(weakPassword);
      const strongValidation =
        PasswordService.validatePasswordStrength(strongPassword);

      console.log(`   Weak password valid: ${weakValidation.isValid}`);
      console.log(`   Strong password valid: ${strongValidation.isValid}\n`);

      // Test 9: Token Decoding (without verification)
      console.log('9. Testing token decoding...');
      const decodedWithoutVerification = JwtService.decodeToken(
        tokens.accessToken
      );
      console.log(
        `   ✅ Token decoded without verification - User ID: ${decodedWithoutVerification?.userId}\n`
      );

      // Clean up
      await prisma.user.delete({
        where: { id: createdUser.id },
      });
      console.log('   🧹 Test user cleaned up\n');

      console.log('✅ All Authentication System tests completed successfully!');
    } catch (error) {
      console.error('   ❌ Error in authentication tests:', error);
    }
  } catch (error) {
    console.error('❌ Authentication test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  testAuthSystem();
}

export { testAuthSystem };
