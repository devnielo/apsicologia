const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// Simple connection
const MONGODB_URI = 'mongodb://admin:password123@localhost:27017/apsicologia?authSource=admin';

// Simple schemas
const userSchema = new mongoose.Schema({}, { strict: false });
const professionalSchema = new mongoose.Schema({}, { strict: false });
const patientSchema = new mongoose.Schema({}, { strict: false });
const serviceSchema = new mongoose.Schema({}, { strict: false });
const roomSchema = new mongoose.Schema({}, { strict: false });

const User = mongoose.model('User', userSchema);
const Professional = mongoose.model('Professional', professionalSchema);
const Patient = mongoose.model('Patient', patientSchema);
const Service = mongoose.model('Service', serviceSchema);
const Room = mongoose.model('Room', roomSchema);

async function seedData() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data (except admin user)
    await Professional.deleteMany({});
    await Patient.deleteMany({});
    await Service.deleteMany({});
    await Room.deleteMany({});
    // Also clear users that are not admin
    await User.deleteMany({ role: { $ne: 'admin' } });
    console.log('🗑️ Cleared existing seed data');
    
    // Drop indexes that might cause conflicts
    try {
      await Patient.collection.dropIndex('episodes.episodeId_1');
      console.log('🗑️ Dropped episodes.episodeId_1 index');
    } catch (error) {
      console.log('ℹ️ Index episodes.episodeId_1 does not exist or already dropped');
    }

    // Create professional 1
    let user1 = await User.findOne({ email: 'maria.garcia@arribapsicologia.com' });
    if (!user1) {
      const hashedPassword1 = await bcrypt.hash('Professional2024!', 12);
      user1 = new User({
        email: 'maria.garcia@arribapsicologia.com',
        passwordHash: hashedPassword1,
        name: 'Dr. María García López',
        phone: '+34 666 111 222',
        role: 'professional',
        isActive: true
      });
      await user1.save();
      console.log('✅ Created user: Dr. María García López');
    } else {
      console.log('ℹ️ User already exists: Dr. María García López');
    }

    let professional1 = await Professional.findOne({ userId: user1._id });
     if (!professional1) {
       professional1 = new Professional({
         userId: user1._id,
         name: 'Dr. María García López',
         email: 'maria.garcia@arribapsicologia.com',
         phone: '+34 666 111 222',
         licenseNumber: 'PSI-2015-001',
         specialties: ['Terapia Cognitivo-Conductual', 'Trastornos de Ansiedad', 'Depresión'],
         bio: 'Doctora en Psicología Clínica con 8 años de experiencia',
         title: 'Dra.',
         yearsOfExperience: 8,
         services: [],
         defaultServiceDuration: 60,
         weeklyAvailability: [
           { dayOfWeek: 1, startTime: '09:00', endTime: '17:00', isAvailable: true },
           { dayOfWeek: 2, startTime: '09:00', endTime: '17:00', isAvailable: true },
           { dayOfWeek: 3, startTime: '09:00', endTime: '17:00', isAvailable: true },
           { dayOfWeek: 4, startTime: '09:00', endTime: '17:00', isAvailable: true },
           { dayOfWeek: 5, startTime: '09:00', endTime: '17:00', isAvailable: true }
         ],
         bufferMinutes: 15,
         timezone: 'Europe/Madrid',
         assignedRooms: [],
         vacations: [],
         settings: {
           allowOnlineBooking: true,
           requireApproval: false,
           notificationPreferences: {
             email: true,
             sms: false,
             push: true
           }
         }
       });
       await professional1.save();
       console.log('✅ Created professional: Dr. María García López');
     } else {
       console.log('ℹ️ Professional already exists: Dr. María García López');
     }
     user1.professionalId = professional1._id;
     await user1.save();

    // Create professional 2
    let user2 = await User.findOne({ email: 'carlos.rodriguez@arribapsicologia.com' });
    if (!user2) {
      const hashedPassword2 = await bcrypt.hash('Professional2024!', 12);
      user2 = new User({
        email: 'carlos.rodriguez@arribapsicologia.com',
        passwordHash: hashedPassword2,
        name: 'Dr. Carlos Rodríguez Martín',
        phone: '+34 666 333 444',
        role: 'professional',
        isActive: true
      });
      await user2.save();
      console.log('✅ Created user: Dr. Carlos Rodríguez Martín');
    } else {
      console.log('ℹ️ User already exists: Dr. Carlos Rodríguez Martín');
    }

    let professional2 = await Professional.findOne({ userId: user2._id });
     if (!professional2) {
       professional2 = new Professional({
         userId: user2._id,
         name: 'Dr. Carlos Rodríguez Martín',
         email: 'carlos.rodriguez@arribapsicologia.com',
         phone: '+34 666 333 444',
         licenseNumber: 'PSI-2018-002',
         specialties: ['Psicología Infantil', 'Terapia Familiar', 'TDAH'],
         bio: 'Doctor en Psicología con 12 años de experiencia especializado en terapia infantil y familiar',
         title: 'Dr.',
         yearsOfExperience: 12,
         services: [],
         defaultServiceDuration: 60,
         weeklyAvailability: [
           { dayOfWeek: 1, startTime: '10:00', endTime: '18:00', isAvailable: true },
           { dayOfWeek: 2, startTime: '10:00', endTime: '18:00', isAvailable: true },
           { dayOfWeek: 3, startTime: '10:00', endTime: '18:00', isAvailable: true },
           { dayOfWeek: 4, startTime: '10:00', endTime: '18:00', isAvailable: true },
           { dayOfWeek: 5, startTime: '10:00', endTime: '16:00', isAvailable: true }
         ],
         bufferMinutes: 10,
         timezone: 'Europe/Madrid',
         assignedRooms: [],
         vacations: [],
         settings: {
           allowOnlineBooking: true,
           requireApproval: true,
           notificationPreferences: {
             email: true,
             sms: true,
             push: true
           }
         }
       });
       await professional2.save();
       console.log('✅ Created professional: Dr. Carlos Rodríguez Martín');
     } else {
       console.log('ℹ️ Professional already exists: Dr. Carlos Rodríguez Martín');
     }
     user2.professionalId = professional2._id;
     await user2.save();

    // Create patient 1
    let userP1 = await User.findOne({ email: 'ana.martinez@email.com' });
    if (!userP1) {
      const hashedPasswordP1 = await bcrypt.hash('Patient2024!', 12);
      userP1 = new User({
        email: 'ana.martinez@email.com',
        passwordHash: hashedPasswordP1,
        name: 'Ana Martínez González',
        phone: '+34 666 555 666',
        role: 'patient',
        isActive: true
      });
      await userP1.save();
      console.log('✅ Created user: Ana Martínez González');
    } else {
      console.log('ℹ️ User already exists: Ana Martínez González');
    }

    let patient1 = await Patient.findOne({ 'contactInfo.email': 'ana.martinez@email.com' });
    if (!patient1) {
      patient1 = new Patient({
        personalInfo: {
          firstName: 'Ana',
          lastName: 'Martínez González',
          dateOfBirth: new Date('1992-05-10'),
          gender: 'female',
          nationality: 'Española',
          occupation: 'Ingeniera de Software'
        },
        contactInfo: {
          email: 'ana.martinez@email.com',
          phone: '+34 666 555 666',
          emergencyContact: {
            name: 'Pedro Martínez',
            relationship: 'Padre',
            phone: '+34 666 777 888'
          },
          address: {
            street: 'Calle Mayor, 42',
            city: 'Madrid',
            state: 'Madrid',
            postalCode: '28013',
            country: 'España'
          }
        },
        medicalInfo: {
          allergies: ['Polen'],
          medications: [],
          medicalHistory: ['Operación de apendicitis en 2018'],
          familyHistory: ['Historial familiar de ansiedad'],
          previousTherapy: false,
          assignedProfessionals: [professional1._id]
        },
        episodes: []
      });
      await patient1.save();
      console.log('✅ Created patient: Ana Martínez González');
    } else {
      console.log('ℹ️ Patient already exists: Ana Martínez González');
    }
    userP1.patientId = patient1._id;
    await userP1.save();

    // Create patient 2
    let userP2 = await User.findOne({ email: 'miguel.fernandez@email.com' });
    if (!userP2) {
      const hashedPasswordP2 = await bcrypt.hash('Patient2024!', 12);
      userP2 = new User({
        email: 'miguel.fernandez@email.com',
        passwordHash: hashedPasswordP2,
        name: 'Miguel Fernández López',
        phone: '+34 666 999 000',
        role: 'patient',
        isActive: true
      });
      await userP2.save();
      console.log('✅ Created user: Miguel Fernández López');
    } else {
      console.log('ℹ️ User already exists: Miguel Fernández López');
    }

    let patient2 = await Patient.findOne({ 'contactInfo.email': 'miguel.fernandez@email.com' });
    if (!patient2) {
      patient2 = new Patient({
        personalInfo: {
          firstName: 'Miguel',
          lastName: 'Fernández López',
          dateOfBirth: new Date('1985-11-30'),
          gender: 'male',
          nationality: 'Española',
          idNumber: '87654321B',
          idType: 'dni',
          maritalStatus: 'married',
          occupation: 'Profesor'
        },
        contactInfo: {
          email: 'miguel.fernandez@email.com',
          phone: '+34 666 444 555',
          preferredContactMethod: 'phone',
          address: {
            street: 'Plaza de España, 8',
            city: 'Barcelona',
            postalCode: '08014',
            country: 'España'
          }
        },
        emergencyContact: {
          name: 'Carmen López',
          relationship: 'Esposa',
          phone: '+34 666 777 888'
        },
        clinicalInfo: {
          assignedProfessionals: [professional2._id],
          medicalHistory: {
            conditions: ['Depresión', 'Insomnio'],
            medications: [
              {
                name: 'Sertralina',
                dosage: '50mg',
                frequency: 'Diaria',
                startDate: new Date('2024-01-01'),
                active: true
              }
            ],
            allergies: [],
            surgeries: [],
            hospitalizations: []
          },
          mentalHealthHistory: {
            previousTreatments: [
              {
                type: 'therapy',
                startDate: new Date('2023-06-01'),
                endDate: new Date('2023-12-01'),
                reason: 'Depresión',
                outcome: 'Mejoría parcial'
              }
            ],
            diagnoses: [],
            riskFactors: []
          },
          currentTreatment: {
            goals: ['Reducir síntomas depresivos', 'Mejorar calidad del sueño'],
            startDate: new Date()
          }
        },
        episodes: [],
        insurance: {
          hasInsurance: true,
          paymentMethod: 'insurance'
        },
        preferences: {
          language: 'es',
          communicationPreferences: {
            appointmentReminders: true,
            reminderMethods: ['phone', 'sms'],
            reminderTiming: [24, 2],
            newsletters: true,
            marketingCommunications: false
          }
        }
      });
      await patient2.save();
      console.log('✅ Created patient: Miguel Fernández López');
    } else {
      console.log('ℹ️ Patient already exists: Miguel Fernández López');
    }
    userP2.patientId = patient2._id;
    await userP2.save();

    // Create services
    const services = [
      {
        name: 'Consulta Individual Adultos',
        description: 'Sesión individual de psicoterapia para adultos',
        category: 'therapy',
        duration: 50,
        price: 60.00,
        currency: 'EUR',
        isActive: true
      },
      {
        name: 'Terapia Infantil',
        description: 'Sesión de psicoterapia especializada para niños y adolescentes',
        category: 'therapy',
        duration: 45,
        price: 55.00,
        currency: 'EUR',
        isActive: true
      },
      {
        name: 'Evaluación Psicológica',
        description: 'Evaluación psicológica completa con informe',
        category: 'assessment',
        duration: 90,
        price: 120.00,
        currency: 'EUR',
        isActive: true
      }
    ];

    for (const serviceData of services) {
      const service = new Service(serviceData);
      await service.save();
      console.log(`💼 Created service: ${service.name}`);
    }

    // Create rooms
    const rooms = [
      {
        name: 'Consulta 1',
        description: 'Sala principal para consultas individuales',
        type: 'physical',
        capacity: 3,
        isActive: true,
        location: {
          building: 'Edificio Principal',
          floor: 1,
          roomNumber: '101'
        }
      },
      {
        name: 'Consulta 2',
        description: 'Sala adaptada para terapia infantil',
        type: 'physical',
        capacity: 4,
        isActive: true,
        location: {
          building: 'Edificio Principal',
          floor: 1,
          roomNumber: '102'
        }
      },
      {
        name: 'Sala Virtual Principal',
        description: 'Sala virtual para videoconsultas',
        type: 'virtual',
        capacity: 10,
        isActive: true,
        virtualConfig: {
          platform: 'jitsi',
          roomId: 'sala-virtual-principal',
          requiresPassword: true
        }
      }
    ];

    for (const roomData of rooms) {
      const room = new Room(roomData);
      await room.save();
      console.log(`🏢 Created room: ${room.name}`);
    }

    console.log('\n🎉 SEED DATA CREATED SUCCESSFULLY!');
    console.log('👥 Professionals: 2');
    console.log('🏥 Patients: 2');
    console.log('💼 Services: 3');
    console.log('🏢 Rooms: 3');
    
    console.log('\n🔐 TEST CREDENTIALS:');
    console.log('👤 Admin: admin@arribapsicologia.com / SecureAdmin2024!');
    console.log('👨‍⚕️ Professional 1: maria.garcia@arribapsicologia.com / Professional2024!');
    console.log('👨‍⚕️ Professional 2: carlos.rodriguez@arribapsicologia.com / Professional2024!');
    console.log('🏥 Patient 1: ana.martinez@email.com / Patient2024!');
    console.log('🏥 Patient 2: miguel.fernandez@email.com / Patient2024!');

  } catch (error) {
    console.error('❌ Seeding error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB');
    process.exit(0);
  }
}

seedData();
