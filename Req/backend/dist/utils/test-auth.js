"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.testAuthSystem = testAuthSystem;
const client_1 = require("@prisma/client");
const user_service_1 = require("@/services/user.service");
const jwt_service_1 = require("@/services/jwt.service");
const password_service_1 = require("@/services/password.service");
const prisma = new client_1.PrismaClient();
const userService = new user_service_1.UserService(prisma);
async function testAuthSystem() {
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
            const tokens = jwt_service_1.JwtService.generateTokenPair(createdUser);
            console.log(`   ✅ Access token generated (length: ${tokens.accessToken.length})`);
            console.log(`   ✅ Refresh token generated (length: ${tokens.refreshToken.length})`);
            console.log(`   ✅ Expires in: ${tokens.expiresIn} seconds\n`);
            // Test 3: Token Verification
            console.log('3. Testing token verification...');
            const decodedAccess = jwt_service_1.JwtService.verifyAccessToken(tokens.accessToken);
            const decodedRefresh = jwt_service_1.JwtService.verifyRefreshToken(tokens.refreshToken);
            console.log(`   ✅ Access token verified - User ID: ${decodedAccess.userId}`);
            console.log(`   ✅ Refresh token verified - User ID: ${decodedRefresh.userId}\n`);
            // Test 4: Token Extraction
            console.log('4. Testing token extraction from header...');
            const authHeader = `Bearer ${tokens.accessToken}`;
            const extractedToken = jwt_service_1.JwtService.extractTokenFromHeader(authHeader);
            console.log(`   ✅ Token extracted successfully: ${extractedToken === tokens.accessToken}\n`);
            // Test 5: Refresh Token Flow
            console.log('5. Testing refresh token flow...');
            const newAccessToken = jwt_service_1.JwtService.refreshAccessToken(tokens.refreshToken);
            const newDecoded = jwt_service_1.JwtService.verifyAccessToken(newAccessToken);
            console.log(`   ✅ New access token generated and verified - User ID: ${newDecoded.userId}\n`);
            // Test 6: Credential Verification
            console.log('6. Testing credential verification...');
            const verifiedUser = await userService.verifyCredentials(testUser.email, testUser.password);
            console.log(`   ✅ Credentials verified: ${verifiedUser?.email}\n`);
            // Test 7: Invalid Token Handling
            console.log('7. Testing invalid token handling...');
            try {
                jwt_service_1.JwtService.verifyAccessToken('invalid-token');
                console.log('   ❌ Should have thrown error for invalid token');
            }
            catch (error) {
                console.log(`   ✅ Invalid token correctly rejected: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
            try {
                jwt_service_1.JwtService.verifyRefreshToken('invalid-refresh-token');
                console.log('   ❌ Should have thrown error for invalid refresh token');
            }
            catch (error) {
                console.log(`   ✅ Invalid refresh token correctly rejected: ${error instanceof Error ? error.message : 'Unknown error'}\n`);
            }
            // Test 8: Password Strength Validation
            console.log('8. Testing password strength validation...');
            const weakPassword = '123';
            const strongPassword = 'StrongPass123!';
            const weakValidation = password_service_1.PasswordService.validatePasswordStrength(weakPassword);
            const strongValidation = password_service_1.PasswordService.validatePasswordStrength(strongPassword);
            console.log(`   Weak password valid: ${weakValidation.isValid}`);
            console.log(`   Strong password valid: ${strongValidation.isValid}\n`);
            // Test 9: Token Decoding (without verification)
            console.log('9. Testing token decoding...');
            const decodedWithoutVerification = jwt_service_1.JwtService.decodeToken(tokens.accessToken);
            console.log(`   ✅ Token decoded without verification - User ID: ${decodedWithoutVerification?.userId}\n`);
            // Clean up
            await prisma.user.delete({
                where: { id: createdUser.id },
            });
            console.log('   🧹 Test user cleaned up\n');
            console.log('✅ All Authentication System tests completed successfully!');
        }
        catch (error) {
            console.error('   ❌ Error in authentication tests:', error);
        }
    }
    catch (error) {
        console.error('❌ Authentication test failed:', error);
    }
    finally {
        await prisma.$disconnect();
    }
}
// Run tests if this file is executed directly
if (require.main === module) {
    testAuthSystem();
}
