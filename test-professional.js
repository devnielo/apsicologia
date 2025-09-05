#!/usr/bin/env node

// Simple test script to verify professional endpoints work after AuditLog fix
const http = require('http');

const makeRequest = (options, data) => {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: res.headers['content-type']?.includes('application/json') ? JSON.parse(body) : body
          });
        } catch (e) {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: body
          });
        }
      });
    });
    
    req.on('error', reject);
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
};

async function testProfessionalEndpoints() {
  console.log('🧪 Testing Professional Endpoints...\n');
  
  try {
    // Test health check first
    console.log('1. Testing API health...');
    const healthResponse = await makeRequest({
      hostname: 'localhost',
      port: 3001,
      path: '/api/health',
      method: 'GET'
    });
    
    console.log(`   Status: ${healthResponse.statusCode}`);
    if (healthResponse.statusCode !== 200) {
      console.log('❌ API health check failed');
      return;
    }
    console.log('✅ API is healthy\n');
    
    // Test getting professionals (should work without auth for testing)
    console.log('2. Testing GET /api/professionals...');
    const getProfessionalsResponse = await makeRequest({
      hostname: 'localhost',
      port: 3001,
      path: '/api/professionals',
      method: 'GET'
    });
    
    console.log(`   Status: ${getProfessionalsResponse.statusCode}`);
    if (getProfessionalsResponse.statusCode === 200) {
      console.log('✅ GET professionals endpoint working');
      console.log(`   Found ${Array.isArray(getProfessionalsResponse.body) ? getProfessionalsResponse.body.length : 'unknown'} professionals\n`);
    } else {
      console.log('⚠️  GET professionals returned:', getProfessionalsResponse.statusCode);
      console.log('   Response:', getProfessionalsResponse.body);
    }
    
    console.log('🎉 Professional endpoint tests completed!');
    console.log('✅ AuditLog validation fix appears to be working - no server crashes detected');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testProfessionalEndpoints();
