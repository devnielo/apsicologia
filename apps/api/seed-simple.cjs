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
    console.log('🗑️ Cleared existing seed data');

    // Create professional 1
    const hashedPassword1 = await bcrypt.hash('Professional2024!', 12);
    const user1 = new User({
      email: 'maria.garcia@arribapsicologia.com',
      passwordHash: hashedPassword1,
      name: 'Dr. María García López',
      phone: '+34 666 111 222',
      role: 'professional',
      isActive: true
    });
    await user1.save();

    const professional1 = new Professional({
      personalInfo: {
        firstName: 'Dr. María',
        lastName: 'García López',
        title: 'Dra.',
        degree: 'Doctora en Psicología Clínica',
        licenseNumber: 'PSI-2019-001',
        dateOfBirth: new Date('1985-03-15'),
        gender: 'female'
      },
      contactInfo: {
        email: 'maria.garcia@arribapsicologia.com',
        phone: '+34 666 111 222',
        address: {
          street: 'Calle de la Salud, 15',
          city: 'Madrid',
          state: 'Madrid',
          postalCode: '28001',
          country: 'España'
        }
      },
      professionalInfo: {
        specialties: ['Terapia Cognitivo-Conductual', 'Trastornos de Ansiedad', 'Depresión'],
        languages: ['Español', 'Inglés'],
        yearsOfExperience: 8
      }
    });
    await professional1.save();
    user1.professionalId = professional1._id;
    await user1.save();
    console.log('👨‍⚕️ Created Dr. María García López');

    // Create professional 2
    const hashedPassword2 = await bcrypt.hash('Professional2024!', 12);
    const user2 = new User({
      email: 'carlos.rodriguez@arribapsicologia.com',
      passwordHash: hashedPassword2,
      name: 'Dr. Carlos Rodríguez Martín',
      phone: '+34 666 333 444',
      role: 'professional',
      isActive: true
    });
    await user2.save();

    const professional2 = new Professional({
      personalInfo: {
        firstName: 'Dr. Carlos',
        lastName: 'Rodríguez Martín',
        title: 'Dr.',
        degree: 'Doctor en Psicología',
        licenseNumber: 'PSI-2018-002',
        dateOfBirth: new Date('1980-07-22'),
        gender: 'male'
      },
      contactInfo: {
        email: 'carlos.rodriguez@arribapsicologia.com',
        phone: '+34 666 333 444',
        address: {
          street: 'Avenida del Bienestar, 28',
          city: 'Madrid',
          state: 'Madrid',
          postalCode: '28002',
          country: 'España'
        }
      },
      professionalInfo: {
        specialties: ['Psicología Infantil', 'Terapia Familiar', 'TDAH'],
        languages: ['Español', 'Catalán'],
        yearsOfExperience: 12
      }
    });
    await professional2.save();
    user2.professionalId = professional2._id;
    await user2.save();
    console.log('👨‍⚕️ Created Dr. Carlos Rodríguez Martín');

    // Create patient 1
    const hashedPasswordP1 = await bcrypt.hash('Patient2024!', 12);
    const userP1 = new User({
      email: 'ana.martinez@email.com',
      passwordHash: hashedPasswordP1,
      name: 'Ana Martínez González',
      phone: '+34 666 555 666',
      role: 'patient',
      isActive: true
    });
    await userP1.save();

    const patient1 = new Patient({
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
          street: 'Calle Mayor, 45',
          city: 'Madrid',
          state: 'Madrid',
          postalCode: '28013',
          country: 'España'
        }
      },
      clinicalInfo: {
        primaryConcerns: ['Ansiedad laboral', 'Estrés'],
        currentMedications: [],
        allergies: ['Ninguna conocida'],
        medicalHistory: ['Operación de apendicitis en 2018'],
        familyHistory: ['Historial familiar de ansiedad'],
        previousTherapy: false,
        assignedProfessionals: [professional1._id]
      }
    });
    await patient1.save();
    userP1.patientId = patient1._id;
    await userP1.save();
    console.log('🏥 Created Ana Martínez González');

    // Create patient 2
    const hashedPasswordP2 = await bcrypt.hash('Patient2024!', 12);
    const userP2 = new User({
      email: 'miguel.fernandez@email.com',
      passwordHash: hashedPasswordP2,
      name: 'Miguel Fernández López',
      phone: '+34 666 999 000',
      role: 'patient',
      isActive: true
    });
    await userP2.save();

    const patient2 = new Patient({
      personalInfo: {
        firstName: 'Miguel',
        lastName: 'Fernández López',
        dateOfBirth: new Date('1988-11-25'),
        gender: 'male',
        nationality: 'Española',
        occupation: 'Profesor'
      },
      contactInfo: {
        email: 'miguel.fernandez@email.com',
        phone: '+34 666 999 000',
        emergencyContact: {
          name: 'Carmen López',
          relationship: 'Esposa',
          phone: '+34 666 111 000'
        },
        address: {
          street: 'Plaza de España, 12',
          city: 'Madrid',
          state: 'Madrid',
          postalCode: '28008',
          country: 'España'
        }
      },
      clinicalInfo: {
        primaryConcerns: ['Depresión', 'Problemas de sueño'],
        currentMedications: ['Sertralina 50mg'],
        allergies: ['Polen'],
        medicalHistory: ['Episodio depresivo en 2020'],
        familyHistory: ['Padre con depresión'],
        previousTherapy: true,
        assignedProfessionals: [professional2._id]
      }
    });
    await patient2.save();
    userP2.patientId = patient2._id;
    await userP2.save();
    console.log('🏥 Created Miguel Fernández López');

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
