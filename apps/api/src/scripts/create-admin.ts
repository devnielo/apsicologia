#!/usr/bin/env tsx

import mongoose from 'mongoose';
import { User } from '../models/User.js';
import database from '../config/database.js';

interface AdminData {
  name: string;
  email: string;
  password: string;
  phone?: string;
}

async function createAdminUser(data: AdminData): Promise<void> {
  try {
    console.log('🔧 Connecting to database...');
    await database.connect();
    console.log('✅ Database connected successfully');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ 
      email: data.email.toLowerCase(),
      role: 'admin' 
    });

    if (existingAdmin) {
      console.log(`⚠️  Admin user with email ${data.email} already exists`);
      console.log(`   ID: ${existingAdmin._id}`);
      console.log(`   Name: ${existingAdmin.name}`);
      console.log(`   Created: ${existingAdmin.createdAt}`);
      return;
    }

    // Create new admin user
    console.log('👤 Creating admin user...');
    
    const adminUser = new User({
      name: data.name,
      email: data.email.toLowerCase(),
      passwordHash: data.password, // Will be hashed by pre-save middleware
      phone: data.phone,
      role: 'admin',
      isEmailVerified: true, // Admin is pre-verified
      isActive: true,
      preferences: {
        language: 'es',
        timezone: 'Europe/Madrid',
        notifications: {
          email: true,
          sms: false,
          push: true,
        }
      }
    });

    const savedUser = await adminUser.save();
    
    console.log('✅ Admin user created successfully!');
    console.log('📋 User Details:');
    console.log(`   ID: ${savedUser._id}`);
    console.log(`   Name: ${savedUser.name}`);
    console.log(`   Email: ${savedUser.email}`);
    console.log(`   Role: ${savedUser.role}`);
    console.log(`   Phone: ${savedUser.phone || 'Not provided'}`);
    console.log(`   Created: ${savedUser.createdAt}`);
    console.log(`   Email Verified: ${savedUser.isEmailVerified}`);
    console.log('');
    console.log('🎯 You can now login with these credentials:');
    console.log(`   Email: ${savedUser.email}`);
    console.log(`   Password: [provided password]`);
    
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    
    if (error instanceof mongoose.Error.ValidationError) {
      console.error('Validation errors:');
      Object.values(error.errors).forEach(err => {
        console.error(`  - ${err.message}`);
      });
    }
    
    throw error;
  } finally {
    // Close database connection
    try {
      await database.disconnect();
      console.log('✅ Database disconnected');
    } catch (error) {
      console.warn('⚠️  Warning during database disconnect:', error);
    }
    
    process.exit(0);
  }
}

// Main execution
async function main(): Promise<void> {
  console.log('🚀 apsicologia Admin User Creator');
  console.log('=====================================');
  
  // Get command line arguments
  const args = process.argv.slice(2);
  
  // Default admin data - you can customize this
  const adminData: AdminData = {
    name: args[0] || 'Administrador Principal',
    email: args[1] || 'admin@arribapsicologia.com',
    password: args[2] || 'admin123!@#',
    phone: args[3] || '+34600000000',
  };
  
  console.log('👤 Admin user data:');
  console.log(`   Name: ${adminData.name}`);
  console.log(`   Email: ${adminData.email}`);
  console.log(`   Phone: ${adminData.phone}`);
  console.log(`   Password: ${'*'.repeat(adminData.password.length)}`);
  console.log('');
  
  // Validate email domain
  if (!adminData.email.includes('@arribapsicologia.com')) {
    console.warn('⚠️  Warning: Email should use @arribapsicologia.com domain');
  }
  
  await createAdminUser(adminData);
}

// Handle errors
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

// Run the script
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });
}

export { createAdminUser };
export default main;
