const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect('mongodb://admin:password123@localhost:27017/apsicologia?authSource=admin', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Patient Schema (simplified)
const patientSchema = new mongoose.Schema({
  personalInfo: {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    fullName: String,
    dateOfBirth: { type: Date, required: true },
    age: Number,
    gender: {
      type: String,
      enum: ['male', 'female', 'non-binary', 'other', 'prefer-not-to-say'],
      required: true,
    },
    nationality: String,
    idNumber: String,
    idType: {
      type: String,
      enum: ['dni', 'nie', 'passport', 'other'],
    },
    maritalStatus: {
      type: String,
      enum: ['single', 'married', 'divorced', 'widowed', 'separated', 'domestic-partner'],
    },
    occupation: String,
    employer: String,
  },
  contactInfo: {
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    alternativePhone: String,
    preferredContactMethod: {
      type: String,
      enum: ['email', 'phone', 'sms', 'whatsapp'],
      default: 'email',
    },
    address: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      postalCode: { type: String, required: true },
      state: String,
      country: { type: String, default: 'España' },
    },
  },
  emergencyContact: {
    name: { type: String, required: true },
    relationship: { type: String, required: true },
    phone: { type: String, required: true },
    email: String,
  },
  gdprConsent: {
    dataProcessing: {
      consented: { type: Boolean, required: true },
      consentDate: { type: Date, required: true },
      consentMethod: { type: String, default: 'digital' },
      consentVersion: { type: String, default: '1.0' },
      witnessedBy: mongoose.Schema.Types.ObjectId,
      notes: String,
    },
    marketingCommunications: {
      consented: { type: Boolean, default: false },
      consentDate: Date,
      method: { type: String, default: 'digital' },
    },
    dataSharing: {
      healthcareProfessionals: { type: Boolean, default: true },
      insuranceProviders: { type: Boolean, default: false },
      emergencyContacts: { type: Boolean, default: true },
      researchPurposes: { type: Boolean, default: false },
      consentDate: { type: Date, default: Date.now },
    },
    rightToErasure: {
      requested: { type: Boolean, default: false },
    },
    dataPortability: {},
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended', 'archived'],
    default: 'active',
  },
  statistics: {
    totalAppointments: { type: Number, default: 0 },
    completedAppointments: { type: Number, default: 0 },
    cancelledAppointments: { type: Number, default: 0 },
    noShowAppointments: { type: Number, default: 0 },
    totalInvoiceAmount: { type: Number, default: 0 },
    totalPaidAmount: { type: Number, default: 0 },
  },
  tags: { type: [String], default: [] },
  relationships: { type: [String], default: [] },
  administrativeNotes: { type: [String], default: [] },
  episodes: { type: [String], default: [] },
  createdBy: mongoose.Schema.Types.ObjectId,
}, {
  timestamps: true,
});

// Calculate age method
patientSchema.methods.calculateAge = function() {
  const today = new Date();
  const birthDate = new Date(this.personalInfo.dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
};

// Get full name method
patientSchema.methods.getFullName = function() {
  return `${this.personalInfo.firstName} ${this.personalInfo.lastName}`;
};

// Pre-save middleware
patientSchema.pre('save', function(next) {
  if (this.isModified('personalInfo.firstName') || this.isModified('personalInfo.lastName')) {
    this.personalInfo.fullName = this.getFullName();
  }
  
  if (this.isModified('personalInfo.dateOfBirth')) {
    this.personalInfo.age = this.calculateAge();
  }
  
  next();
});

const Patient = mongoose.model('Patient', patientSchema);

// Test patients data
const testPatients = [
  {
    personalInfo: {
      firstName: 'Ana',
      lastName: 'García López',
      dateOfBirth: new Date('1985-03-15'),
      gender: 'female',
      nationality: 'Española',
      idNumber: '12345678A',
      idType: 'dni',
      maritalStatus: 'married',
      occupation: 'Profesora',
      employer: 'IES Madrid Centro',
    },
    contactInfo: {
      email: 'ana.garcia@email.com',
      phone: '+34 600 123 456',
      preferredContactMethod: 'email',
      address: {
        street: 'Calle Gran Vía, 25, 3º A',
        city: 'Madrid',
        postalCode: '28013',
        state: 'Madrid',
        country: 'España',
      },
    },
    emergencyContact: {
      name: 'Carlos García',
      relationship: 'Esposo',
      phone: '+34 600 654 321',
      email: 'carlos.garcia@email.com',
    },
  },
  {
    personalInfo: {
      firstName: 'Miguel',
      lastName: 'Rodríguez Sánchez',
      dateOfBirth: new Date('1992-07-22'),
      gender: 'male',
      nationality: 'Española',
      idNumber: '87654321B',
      idType: 'dni',
      maritalStatus: 'single',
      occupation: 'Ingeniero de Software',
      employer: 'TechCorp Madrid',
    },
    contactInfo: {
      email: 'miguel.rodriguez@email.com',
      phone: '+34 611 234 567',
      preferredContactMethod: 'phone',
      address: {
        street: 'Avenida de América, 45, 2º B',
        city: 'Madrid',
        postalCode: '28028',
        state: 'Madrid',
        country: 'España',
      },
    },
    emergencyContact: {
      name: 'Carmen Sánchez',
      relationship: 'Madre',
      phone: '+34 600 987 654',
      email: 'carmen.sanchez@email.com',
    },
  },
  {
    personalInfo: {
      firstName: 'Laura',
      lastName: 'Martínez Fernández',
      dateOfBirth: new Date('1978-11-08'),
      gender: 'female',
      nationality: 'Española',
      idNumber: '11223344C',
      idType: 'dni',
      maritalStatus: 'divorced',
      occupation: 'Psicóloga',
      employer: 'Centro de Salud Mental',
    },
    contactInfo: {
      email: 'laura.martinez@email.com',
      phone: '+34 622 345 678',
      preferredContactMethod: 'whatsapp',
      address: {
        street: 'Calle Serrano, 78, 1º C',
        city: 'Madrid',
        postalCode: '28006',
        state: 'Madrid',
        country: 'España',
      },
    },
    emergencyContact: {
      name: 'Pedro Martínez',
      relationship: 'Hermano',
      phone: '+34 633 456 789',
      email: 'pedro.martinez@email.com',
    },
  },
  {
    personalInfo: {
      firstName: 'David',
      lastName: 'López Ruiz',
      dateOfBirth: new Date('1995-01-30'),
      gender: 'male',
      nationality: 'Española',
      idNumber: '55667788D',
      idType: 'dni',
      maritalStatus: 'single',
      occupation: 'Estudiante',
      employer: 'Universidad Complutense',
    },
    contactInfo: {
      email: 'david.lopez@email.com',
      phone: '+34 644 567 890',
      preferredContactMethod: 'sms',
      address: {
        street: 'Calle Alcalá, 123, 4º D',
        city: 'Madrid',
        postalCode: '28009',
        state: 'Madrid',
        country: 'España',
      },
    },
    emergencyContact: {
      name: 'María Ruiz',
      relationship: 'Madre',
      phone: '+34 655 678 901',
      email: 'maria.ruiz@email.com',
    },
  },
  {
    personalInfo: {
      firstName: 'Carmen',
      lastName: 'Jiménez Torres',
      dateOfBirth: new Date('1988-09-12'),
      gender: 'female',
      nationality: 'Española',
      idNumber: '99887766E',
      idType: 'dni',
      maritalStatus: 'married',
      occupation: 'Enfermera',
      employer: 'Hospital La Paz',
    },
    contactInfo: {
      email: 'carmen.jimenez@email.com',
      phone: '+34 666 789 012',
      preferredContactMethod: 'email',
      address: {
        street: 'Plaza de España, 10, 5º A',
        city: 'Madrid',
        postalCode: '28008',
        state: 'Madrid',
        country: 'España',
      },
    },
    emergencyContact: {
      name: 'Antonio Jiménez',
      relationship: 'Esposo',
      phone: '+34 677 890 123',
      email: 'antonio.jimenez@email.com',
    },
  },
];

async function createTestPatients() {
  try {
    console.log('Conectando a MongoDB...');
    
    // Wait for connection to be established
    await mongoose.connection.asPromise();
    console.log('Conexión establecida');
    
    // Get admin user ID (assuming it exists from seed)
    const adminUser = await mongoose.connection.db.collection('users').findOne({ email: 'admin@arribapsicologia.com' });
    if (!adminUser) {
      console.error('Admin user not found. Please run seed script first.');
      process.exit(1);
    }
    
    console.log('Creando pacientes de prueba...');
    
    for (let i = 0; i < testPatients.length; i++) {
      const patientData = testPatients[i];
      
      // Add required fields
      patientData.gdprConsent = {
        dataProcessing: {
          consented: true,
          consentDate: new Date(),
          consentMethod: 'digital',
          consentVersion: '1.0',
          witnessedBy: adminUser._id,
          notes: 'Consentimiento otorgado durante el registro inicial',
        },
        marketingCommunications: {
          consented: false,
          consentDate: new Date(),
          method: 'digital',
        },
        dataSharing: {
          healthcareProfessionals: true,
          insuranceProviders: false,
          emergencyContacts: true,
          researchPurposes: false,
          consentDate: new Date(),
        },
        rightToErasure: {
          requested: false,
        },
        dataPortability: {},
      };
      
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
      // Skip episodes for now - will be added later via API
      patientData.episodes = [];
      patientData.createdBy = adminUser._id;
      
      // Check if patient already exists
      const existingPatient = await Patient.findOne({ 'contactInfo.email': patientData.contactInfo.email });
      if (existingPatient) {
        console.log(`Paciente ${patientData.personalInfo.firstName} ${patientData.personalInfo.lastName} ya existe, saltando...`);
        continue;
      }
      
      const patient = new Patient(patientData);
      await patient.save();
      
      console.log(`✓ Paciente creado: ${patient.personalInfo.fullName} (${patient.contactInfo.email})`);
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
createTestPatients();