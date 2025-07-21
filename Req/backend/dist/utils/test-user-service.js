"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.testUserService = testUserService;
const client_1 = require("@prisma/client");
const user_service_1 = require("@/services/user.service");
const password_service_1 = require("@/services/password.service");
const prisma = new client_1.PrismaClient();
const userService = new user_service_1.UserService(prisma);
async function testUserService() {
    try {
        console.log('🧪 Testing User Service...\n');
        // Test 1: Password encryption
        console.log('1. Testing password encryption...');
        const testPassword = 'TestPassword123!';
        const hashedPassword = await password_service_1.PasswordService.hashPassword(testPassword);
        const isValid = await password_service_1.PasswordService.verifyPassword(testPassword, hashedPassword);
        console.log(`   ✅ Password hashed and verified: ${isValid}\n`);
        // Test 2: Password strength validation
        console.log('2. Testing password strength validation...');
        const weakPassword = '123';
        const strongPassword = 'StrongPass123!';
        const weakValidation = password_service_1.PasswordService.validatePasswordStrength(weakPassword);
        const strongValidation = password_service_1.PasswordService.validatePasswordStrength(strongPassword);
        console.log(`   Weak password valid: ${weakValidation.isValid}`);
        console.log(`   Weak password errors: ${weakValidation.errors.join(', ')}`);
        console.log(`   Strong password valid: ${strongValidation.isValid}\n`);
        // Test 3: Create user
        console.log('3. Testing user creation...');
        const testUser = {
            email: 'test@example.com',
            password: 'TestPassword123!',
            firstName: 'Test',
            lastName: 'User',
        };
        try {
            // Clean up any existing test user
            await prisma.user.deleteMany({
                where: { email: testUser.email },
            });
            const createdUser = await userService.createUser(testUser);
            console.log(`   ✅ User created: ${createdUser.email} (ID: ${createdUser.id})\n`);
            // Test 4: Get user by email
            console.log('4. Testing get user by email...');
            const foundUser = await userService.getUserByEmail(testUser.email);
            console.log(`   ✅ User found: ${foundUser?.email}\n`);
            // Test 5: Verify credentials
            console.log('5. Testing credential verification...');
            const verifiedUser = await userService.verifyCredentials(testUser.email, testUser.password);
            console.log(`   ✅ Credentials verified: ${verifiedUser?.email}\n`);
            // Test 6: Update user
            console.log('6. Testing user update...');
            const updatedUser = await userService.updateUser(createdUser.id, {
                firstName: 'Updated',
                lastName: 'Name',
            });
            console.log(`   ✅ User updated: ${updatedUser.firstName} ${updatedUser.lastName}\n`);
            // Test 7: Get users list
            console.log('7. Testing users list...');
            const usersList = await userService.getUsers(1, 10);
            console.log(`   ✅ Users list retrieved: ${usersList.users.length} users, total: ${usersList.total}\n`);
            // Clean up
            await prisma.user.delete({
                where: { id: createdUser.id },
            });
            console.log('   🧹 Test user cleaned up\n');
        }
        catch (error) {
            console.error('   ❌ Error in user operations:', error);
        }
        console.log('✅ All User Service tests completed!');
    }
    catch (error) {
        console.error('❌ Test failed:', error);
    }
    finally {
        await prisma.$disconnect();
    }
}
// Run tests if this file is executed directly
if (require.main === module) {
    testUserService();
}
