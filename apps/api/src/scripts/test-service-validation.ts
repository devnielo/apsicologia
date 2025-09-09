import mongoose from 'mongoose';
import { config } from 'dotenv';
import { Service } from '../models/Service.js';

// Load environment variables
config();

async function testServiceValidation() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/apsicologia');
    console.log('✅ Connected to MongoDB');

    // Test cases for color validation
    const testCases = [
      { color: '', description: 'Empty string' },
      { color: null, description: 'Null value' },
      { color: '#FF0000', description: 'Valid 6-digit hex' },
      { color: '#FFF', description: 'Valid 3-digit hex' },
      { color: 'invalid', description: 'Invalid color format' },
      { color: '#GGGGGG', description: 'Invalid hex characters' },
    ];

    for (const testCase of testCases) {
      console.log(`\n🔍 Testing: ${testCase.description} (${testCase.color})`);
      
      try {
        const service = new Service({
          name: `Test Service - ${testCase.description}`,
          description: 'Test service for color validation',
          price: 50,
          duration: 60,
          color: testCase.color,
          categoryId: new mongoose.Types.ObjectId(),
          storageProvider: 'cloudflare-r2',
          bucketName: 'test-bucket',
          storageUrl: 'https://test.cloudflare.com'
        });

        // Validate without saving
        await service.validate();
        console.log(`✅ Valid: ${testCase.description}`);
      } catch (error: any) {
        console.log(`❌ Invalid: ${testCase.description} - ${error.message}`);
      }
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
  }
}

testServiceValidation();
