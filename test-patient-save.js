const axios = require('axios');

async function testPatientSave() {
  try {
    // First login to get auth token
    const loginResponse = await axios.post('http://localhost:3001/api/v1/auth/login', {
      email: 'admin@arribapsicologia.com',
      password: 'SecureAdmin2024!'
    });
    
    const token = loginResponse.data.data.accessToken;
    console.log('✅ Login successful');
    
    // Get a patient to test with
    const patientsResponse = await axios.get('http://localhost:3001/api/v1/patients', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const patients = patientsResponse.data.data.patients;
    if (patients.length === 0) {
      console.log('❌ No patients found');
      return;
    }
    
    const testPatient = patients[0];
    console.log(`✅ Found test patient: ${testPatient.personalInfo.fullName}`);
    
    // Test updating medical history
    const updateData = {
      clinicalInfo: {
        ...testPatient.clinicalInfo,
        medicalHistory: {
          ...testPatient.clinicalInfo.medicalHistory,
          conditions: ['Test condition added via API']
        }
      }
    };
    
    console.log('📤 Sending update request...');
    const updateResponse = await axios.put(`http://localhost:3001/api/v1/patients/${testPatient._id}`, updateData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ Update successful:', updateResponse.data.message);
    
    // Verify the update
    const verifyResponse = await axios.get(`http://localhost:3001/api/v1/patients/${testPatient._id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const updatedPatient = verifyResponse.data.data.patient;
    console.log('✅ Verification - Updated conditions:', updatedPatient.clinicalInfo.medicalHistory.conditions);
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testPatientSave();
