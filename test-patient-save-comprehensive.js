const axios = require('axios');

// Test comprehensive patient save functionality
const API_BASE_URL = 'http://localhost:3001/api/v1';

// Test data for different sections
const testUpdates = {
  personalInfo: {
    personalInfo: {
      firstName: 'Test Update',
      lastName: 'Personal Info',
      dateOfBirth: '1990-01-01'
    }
  },
  contactInfo: {
    contactInfo: {
      email: 'updated@test.com',
      phone: '+34 666 999 888'
    }
  },
  emergencyContact: {
    emergencyContact: {
      name: 'Updated Emergency Contact',
      relationship: 'Spouse',
      phone: '+34 777 888 999'
    }
  },
  communication: {
    preferences: {
      communicationPreferences: {
        preferredMethod: 'email',
        language: 'es',
        allowMarketing: false
      }
    }
  },
  appointments: {
    preferences: {
      appointmentPreferences: {
        reminderTime: 24,
        preferredTime: 'morning',
        allowOnlineBooking: true
      }
    }
  },
  portal: {
    preferences: {
      portalAccess: {
        enabled: true,
        allowDocumentDownload: true,
        allowAppointmentScheduling: false
      }
    }
  },
  privacy: {
    gdprConsent: {
      dataProcessing: true,
      marketing: false,
      thirdPartySharing: false
    }
  },
  billing: {
    billing: {
      insuranceProvider: 'Test Insurance',
      policyNumber: 'POL123456',
      copayAmount: 25
    }
  },
  tags: {
    tags: [
      { name: 'Test Tag', color: '#ff0000', description: 'Test description' }
    ]
  }
};

async function testPatientSave() {
  try {
    console.log('🧪 Testing Patient Save Functionality...\n');

    // First, get a test patient ID
    const patientsResponse = await axios.get(`${API_BASE_URL}/patients`, {
      headers: {
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NmM3YjI4ZjEyMzQ1Njc4OTBhYmNkZWYiLCJlbWFpbCI6ImFkbWluQGFycmliYXBzaWNvbG9naWEuY29tIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzI1MTk2Mzg1LCJleHAiOjE3MjUyODI3ODV9.example'
      }
    });

    if (!patientsResponse.data.patients || patientsResponse.data.patients.length === 0) {
      console.log('❌ No patients found. Please ensure test data exists.');
      return;
    }

    const testPatientId = patientsResponse.data.patients[0]._id;
    console.log(`📋 Using test patient ID: ${testPatientId}\n`);

    // Test each section save
    for (const [sectionName, updateData] of Object.entries(testUpdates)) {
      try {
        console.log(`🔄 Testing ${sectionName} save...`);
        
        const response = await axios.put(
          `${API_BASE_URL}/patients/${testPatientId}`,
          updateData,
          {
            headers: {
              'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NmM3YjI4ZjEyMzQ1Njc4OTBhYmNkZWYiLCJlbWFpbCI6ImFkbWluQGFycmliYXBzaWNvbG9naWEuY29tIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzI1MTk2Mzg1LCJleHAiOjE3MjUyODI3ODV9.example',
              'Content-Type': 'application/json'
            }
          }
        );

        if (response.status === 200) {
          console.log(`✅ ${sectionName} save successful`);
        } else {
          console.log(`⚠️ ${sectionName} save returned status: ${response.status}`);
        }
      } catch (error) {
        console.log(`❌ ${sectionName} save failed:`, error.response?.data || error.message);
      }
    }

    console.log('\n🎉 Patient save functionality test completed!');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

// Run the test
testPatientSave();
