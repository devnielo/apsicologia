import mongoose from 'mongoose';
import Patient from '../models/Patient.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * Script to fix fullName field for all patients
 */
async function fixPatientNames() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/apsicologia';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // Get all patients that need fullName update
    const patients = await Patient.find({ deletedAt: null });
    
    let updatedCount = 0;
    
    console.log(`Found ${patients.length} patients to check`);
    
    for (const patient of patients) {
      // Calculate the correct fullName
      const correctFullName = `${patient.personalInfo.firstName} ${patient.personalInfo.lastName}`.trim();
      
      console.log(`Patient ${patient._id}: Current fullName: "${patient.personalInfo.fullName}", Correct: "${correctFullName}"`);
      
      // Update if different or missing
      if (patient.personalInfo.fullName !== correctFullName) {
        // Use updateOne to avoid validation issues
        await Patient.updateOne(
          { _id: patient._id },
          { 
            $set: { 
              'personalInfo.fullName': correctFullName,
              'personalInfo.age': patient.calculateAge()
            } 
          }
        );
        updatedCount++;
        console.log(`✓ Updated patient ${patient._id}`);
      } else {
        console.log(`- Patient ${patient._id} already has correct fullName`);
      }
    }

    console.log(`\n✅ Successfully updated ${updatedCount} out of ${patients.length} patient records`);
    
  } catch (error) {
    console.error('Fix patient names error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the script
fixPatientNames().then(() => {
  process.exit(0);
}).catch((error) => {
  console.error('Script failed:', error);
  process.exit(1);
});