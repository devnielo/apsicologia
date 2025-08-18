const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/apsicologia', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Import models
const User = require('./apps/api/src/models/User.js');
const Patient = require('./apps/api/src/models/Patient.js');

async function createSimplePatients() {
  try {
    console.log('Conexión establecida');
    console.log('Creando pacientes de prueba...');

    // Find admin user
    const adminUser = await User.findOne({ email: 'admin@apsicologia.com' });
    if (!adminUser) {
      console.error('Usuario admin no encontrado');
      return;
    }

    const patientsData = [
      {
        personalInfo: {
          firstName: 'Ana',
          lastName: 'García López',
          dateOfBirth: new Date('1985-03-15'),
          gender: 'female',
          nationality: 'Spanish',
          idNumber: '12345678A',
          idType: 'dni',
          maritalStatus: 'single',
          occupation: 'Ingeniera',
          education: 'university',
          languages: ['Spanish', 'English']
        },
        contactInfo: {
          email: 'ana.garcia@email.com',
          phone: '+34 600 123 456',
          preferredContactMethod: 'email',
          address: {
            street: 'Calle Mayor 123',
            city: 'Madrid',
            postalCode: '28001',
            country: 'Spain'
          }
        },
        emergencyContact: {
          name: 'María García',
          relationship: 'Madre',
          phone: '+34 600 654 321',
          email: 'maria.garcia@email.com'
        }
      },
      {
        personalInfo: {
          firstName: 'Carlos',
          lastName: 'Rodríguez Martín',
          dateOfBirth: new Date('1990-07-22'),
          gender: 'male',
          nationality: 'Spanish',
          idNumber: '87654321B',
          idType: 'dni',
          maritalStatus: 'married',
          occupation: 'Profesor',
          education: 'university',
          languages: ['Spanish']
        },
        contactInfo: {
          email: 'carlos.rodriguez@email.com',
          phone: '+34 600 789 012',
          preferredContactMethod: 'phone',
          address: {
            street: 'Avenida de la Paz 45',
            city: 'Barcelona',
            postalCode: '08001',
            country: 'Spain'
          }
        },
        emergencyContact: {
          name: 'Laura Martín',
          relationship: 'Esposa',
          phone: '+34 600 345 678',
          email: 'laura.martin@email.com'
        }
      },
      {
        personalInfo: {
          firstName: 'María',
          lastName: 'López Fernández',
          dateOfBirth: new Date('1978-11-08'),
          gender: 'female',
          nationality: 'Spanish',
          idNumber: '11223344C',
          idType: 'dni',
          maritalStatus: 'divorced',
          occupation: 'Médica',
          education: 'university',
          languages: ['Spanish', 'French']
        },
        contactInfo: {
          email: 'maria.lopez@email.com',
          phone: '+34 600 456 789',
          preferredContactMethod: 'email',
          address: {
            street: 'Plaza del Sol 8',
            city: 'Valencia',
            postalCode: '46001',
            country: 'Spain'
          }
        },
        emergencyContact: {
          name: 'Pedro López',
          relationship: 'Hermano',
          phone: '+34 600 987 654',
          email: 'pedro.lopez@email.com'
        }
      }
    ];

    for (const patientData of patientsData) {
      // Add required fields
      patientData.status = 'active';
      patientData.statistics = {
        totalAppointments: 0,
        completedAppointments: 0,
        cancelledAppointments: 0,
        noShowAppointments: 0,
        totalInvoiceAmount: 0,
        totalPaidAmount: 0,
      };
      patientData.tags = [];
      patientData.relationships = [];
      patientData.administrativeNotes = [];
      patientData.episodes = [];
      patientData.createdBy = adminUser._id;
      
      // Add clinical info with required currentTreatment
      patientData.clinicalInfo = {
        currentTreatment: {
          startDate: new Date(),
          goals: ['Evaluación inicial']
        }
      };
      
      // Add GDPR consent
      patientData.gdprConsent = {
        dataProcessing: {
          consented: true,
          consentDate: new Date(),
          consentMethod: 'digital',
          consentVersion: '1.0'
        }
      };

      // Check if patient already exists
      const existingPatient = await Patient.findOne({ 'contactInfo.email': patientData.contactInfo.email });
      if (existingPatient) {
        console.log(`Paciente ${patientData.personalInfo.firstName} ${patientData.personalInfo.lastName} ya existe, saltando...`);
        continue;
      }

      const patient = new Patient(patientData);
      await patient.save();
      
      console.log(`✓ Paciente creado: ${patient.personalInfo.firstName} ${patient.personalInfo.lastName} (${patient.contactInfo.email})`);
    }

    console.log('\n¡Todos los pacientes de prueba han sido creados exitosamente!');
    
    // Show summary
    const totalPatients = await Patient.countDocuments();
    console.log(`Total de pacientes en la base de datos: ${totalPatients}`);

  } catch (error) {
    console.error('Error creando pacientes de prueba:', error);
  } finally {
    mongoose.connection.close();
  }
}

// Run the script
createSimplePatients();