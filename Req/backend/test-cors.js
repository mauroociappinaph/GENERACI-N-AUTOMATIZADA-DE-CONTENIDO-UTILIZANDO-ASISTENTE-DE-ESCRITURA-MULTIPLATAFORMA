#!/usr/bin/env node

/**
 * Simple CORS test script
 * Run this to test if CORS is working properly
 */

const http = require('http');

const testCors = async () => {
  console.log('🧪 Testing CORS configuration...\n');

  // Test 1: OPTIONS request (preflight)
  console.log('1. Testing OPTIONS request (CORS preflight)...');

  const optionsRequest = new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/login',
      method: 'OPTIONS',
      headers: {
        Origin: 'http://localhost:3000',
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type',
      },
    };

    const req = http.request(options, res => {
      console.log(`   Status: ${res.statusCode}`);
      console.log(
        `   Access-Control-Allow-Origin: ${res.headers['access-control-allow-origin'] || 'Not set'}`
      );
      console.log(
        `   Access-Control-Allow-Methods: ${res.headers['access-control-allow-methods'] || 'Not set'}`
      );
      console.log(
        `   Access-Control-Allow-Headers: ${res.headers['access-control-allow-headers'] || 'Not set'}`
      );

      if (res.statusCode === 200 || res.statusCode === 204) {
        console.log('   ✅ OPTIONS request successful\n');
        resolve(true);
      } else {
        console.log('   ❌ OPTIONS request failed\n');
        resolve(false);
      }
    });

    req.on('error', err => {
      console.log(`   ❌ Error: ${err.message}\n`);
      resolve(false);
    });

    req.end();
  });

  const optionsResult = await optionsRequest;

  // Test 2: GET request to API root
  console.log('2. Testing GET request to API root...');

  const getRequest = new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: '/api',
      method: 'GET',
      headers: {
        Origin: 'http://localhost:3000',
      },
    };

    const req = http.request(options, res => {
      console.log(`   Status: ${res.statusCode}`);
      console.log(
        `   Access-Control-Allow-Origin: ${res.headers['access-control-allow-origin'] || 'Not set'}`
      );

      let data = '';
      res.on('data', chunk => {
        data += chunk;
      });

      res.on('end', () => {
        if (res.statusCode === 200) {
          console.log('   ✅ GET request successful');
          try {
            const json = JSON.parse(data);
            console.log(`   Response: ${json.message}\n`);
          } catch (e) {
            console.log(`   Response: ${data.substring(0, 100)}...\n`);
          }
          resolve(true);
        } else {
          console.log('   ❌ GET request failed\n');
          resolve(false);
        }
      });
    });

    req.on('error', err => {
      console.log(`   ❌ Error: ${err.message}\n`);
      resolve(false);
    });

    req.end();
  });

  const getResult = await getRequest;

  // Summary
  console.log('📊 Test Summary:');
  console.log(
    `   CORS Preflight: ${optionsResult ? '✅ Working' : '❌ Failed'}`
  );
  console.log(`   API Access: ${getResult ? '✅ Working' : '❌ Failed'}`);

  if (optionsResult && getResult) {
    console.log('\n🎉 CORS configuration appears to be working correctly!');
    console.log('   You can now try your frontend login again.');
  } else {
    console.log('\n⚠️  CORS issues detected. Make sure:');
    console.log('   1. Backend server is running on port 5000');
    console.log('   2. No firewall is blocking the connection');
    console.log('   3. Check the server logs for any errors');
  }
};

// Run the test
testCors().catch(console.error);
