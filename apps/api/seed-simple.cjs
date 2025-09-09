const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const fs = require('fs');
const path = require('path');

// Define clinical constants directly in seed script for CommonJS compatibility
const MEDICAL_CONDITIONS = [
  'Hipertensión arterial', 'Diabetes mellitus tipo 2', 'Asma bronquial', 'Artritis reumatoide',
  'Osteoporosis', 'Fibromialgia', 'Migraña crónica', 'Síndrome del intestino irritable',
  'Apnea del sueño', 'Reflujo gastroesofágico', 'Hipotiroidismo', 'Colesterol alto',
  'Enfermedad cardiovascular', 'Obesidad', 'Síndrome metabólico'
];

const ALLERGIES = [
  'Polen de gramíneas', 'Ácaros del polvo', 'Pelo de animales', 'Frutos secos',
  'Mariscos', 'Penicilina', 'Aspirina', 'Látex', 'Níquel', 'Perfumes',
  'Alimentos con gluten', 'Lactosa', 'Huevos', 'Soja'
];

const MEDICATIONS = [
  'Paracetamol', 'Ibuprofeno', 'Omeprazol', 'Simvastatina', 'Metformina',
  'Enalapril', 'Amlodipino', 'Levotiroxina', 'Sertralina', 'Lorazepam',
  'Diazepam', 'Alprazolam', 'Escitalopram', 'Venlafaxina', 'Quetiapina'
];

const SURGERIES = [
  'Apendicectomía', 'Colecistectomía', 'Hernia inguinal', 'Cesárea',
  'Artroscopia de rodilla', 'Cataratas', 'Amigdalectomía', 'Herniorrafia',
  'Colectomía', 'Mastectomía', 'Prostatectomía', 'Histerectomía'
];

const MENTAL_HEALTH_DIAGNOSES = [
  'Trastorno de ansiedad generalizada', 'Episodio depresivo mayor', 'Trastorno de pánico',
  'Fobia social', 'Trastorno obsesivo-compulsivo', 'Trastorno de estrés postraumático',
  'Trastorno bipolar', 'Trastorno límite de personalidad', 'Trastorno de la alimentación',
  'Trastorno por déficit de atención', 'Trastorno del espectro autista', 'Esquizofrenia',
  'Trastorno de adaptación', 'Trastorno de ansiedad por separación'
];

const MENTAL_HEALTH_TREATMENTS = [
  'Terapia cognitivo-conductual', 'Terapia psicodinámica', 'Terapia humanística',
  'Terapia sistémica familiar', 'Terapia de grupo', 'Mindfulness y meditación',
  'EMDR', 'Terapia dialéctica conductual', 'Terapia de aceptación y compromiso',
  'Psicoeducación', 'Terapia ocupacional', 'Arteterapia', 'Musicoterapia'
];

const MENTAL_HEALTH_STATUS = {
  active: 'active',
  stable: 'stable', 
  improving: 'improving',
  critical: 'critical'
};

const MENTAL_HEALTH_SEVERITY = {
  mild: 'mild',
  moderate: 'moderate',
  severe: 'severe'
};

// Read the full base64 image from file
const profileImagePath = path.join(__dirname, '../../profile-avatar-base64.txt');
const profileImageBase64 = fs.readFileSync(profileImagePath, 'utf8').trim();

// Simple connection
const MONGODB_URI = 'mongodb://admin:password123@localhost:27017/apsicologia?authSource=admin';

// Import actual models for Professional to ensure proper schema validation
// Use dynamic import for ES modules and fallback to simple schemas for others
let Professional, Room;

// Simple schemas for most models
const userSchema = new mongoose.Schema({}, { strict: false });
const patientSchema = new mongoose.Schema({}, { strict: false });
const serviceSchema = new mongoose.Schema({}, { strict: false });
const appointmentSchema = new mongoose.Schema({}, { strict: false });
const fileSchema = new mongoose.Schema({}, { strict: false });

const User = mongoose.model('User', userSchema);
const Patient = mongoose.model('Patient', patientSchema);
const Service = mongoose.model('Service', serviceSchema);
const Appointment = mongoose.model('Appointment', appointmentSchema);
const File = mongoose.model('File', fileSchema);

// We'll import Professional and Room models dynamically in the seedData function

// Helper function to get random items from an array
function getRandomItems(array, count) {
  if (count === 0) return [];
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.min(count, array.length));
}

async function seedData() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Import Professional and Room models dynamically
    try {
      const professionalModule = await import('./src/models/Professional.js');
      const roomModule = await import('./src/models/Room.js');
      Professional = professionalModule.Professional;
      Room = roomModule.Room;
      console.log('✅ Imported Professional and Room models');
    } catch (error) {
      console.log('⚠️ Could not import ES modules, using fallback schemas');
      // Fallback to simple schemas if import fails
      const professionalSchema = new mongoose.Schema({}, { strict: false });
      const roomSchema = new mongoose.Schema({}, { strict: false });
      Professional = mongoose.model('Professional', professionalSchema);
      Room = mongoose.model('Room', roomSchema);
    }

    // First check and update admin user before clearing data
    let adminUser = await User.findOne({ email: 'admin@arribapsicologia.com' });
    if (adminUser) {
      console.log('🔄 Updating existing admin user with profile image...');
      adminUser.profileImage = profileImageBase64;
      adminUser.updatedAt = new Date();
      await adminUser.save();
      console.log('✅ Updated admin user with profile image: Administrador Principal');
    }

    // Clear existing data (except admin user)
    await Appointment.deleteMany({});
    await Professional.deleteMany({});
    await Patient.deleteMany({});
    await Service.deleteMany({});
    await Room.deleteMany({});
    await File.deleteMany({});
    await User.deleteMany({ email: { $ne: 'admin@arribapsicologia.com' } }); // Don't delete admin
    console.log('🗑️ Cleared existing seed data (preserved admin user)');

    // Create admin user if it doesn't exist
    adminUser = await User.findOne({ email: 'admin@arribapsicologia.com' });
    if (!adminUser) {
      const hashedAdminPassword = await bcrypt.hash('SecureAdmin2024!', 12);
      adminUser = new User({
        email: 'admin@arribapsicologia.com',
        passwordHash: hashedAdminPassword,
        name: 'Administrador Principal',
        phone: '+34600000000',
        role: 'admin',
        profileImage: profileImageBase64,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      await adminUser.save();
      console.log('✅ Created admin user: Administrador Principal');
    }
    
    // Drop indexes that might cause conflicts
    try {
      await Patient.collection.dropIndex('episodeId_1');
      console.log('🗑️ Dropped episodeId_1 index');
    } catch (error) {
      console.log('ℹ️ Index episodeId_1 does not exist or already dropped');
    }

    // Create reception user for admin access
    let receptionUser = await User.findOne({ email: 'recepcion@arribapsicologia.com' });
    if (!receptionUser) {
      const hashedReceptionPassword = await bcrypt.hash('Reception2024!', 12);
      receptionUser = new User({
        email: 'recepcion@arribapsicologia.com',
        passwordHash: hashedReceptionPassword,
        name: 'Recepción Principal',
        phone: '+34600000001',
        role: 'reception',
        profileImage: profileImageBase64,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      await receptionUser.save();
      console.log('✅ Created reception user: Recepción Principal');
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
        profileImage: profileImageBase64,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
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
         title: 'Psicóloga',
         yearsOfExperience: 8,
         services: [], // Will be updated after services are created
         defaultServiceDuration: 60,
         weeklyAvailability: [
          { dayOfWeek: 1, startTime: '09:00', endTime: '17:00', isAvailable: true },
          { dayOfWeek: 2, startTime: '09:00', endTime: '17:00', isAvailable: true },
          { dayOfWeek: 3, startTime: '09:00', endTime: '17:00', isAvailable: true },
          { dayOfWeek: 4, startTime: '09:00', endTime: '17:00', isAvailable: true },
          { dayOfWeek: 5, startTime: '09:00', endTime: '17:00', isAvailable: true }
        ],
         vacations: [],
         breaks: [],
         timezone: 'Europe/Madrid',
         bufferMinutes: 15,
         telehealthEnabled: true,
         isActive: true,
         status: 'active',
         isAcceptingNewPatients: true,
         color: '#3B82F6',
         languages: ['es'],
         currency: 'EUR',
         acceptsOnlinePayments: true,
         paymentMethods: ['cash', 'card'],
         totalReviews: 0,
         totalAppointments: 0,
         completionRate: 0,
         stats: {
           totalPatients: 0,
           activePatients: 0,
           totalAppointments: 0,
           completedAppointments: 0,
           cancelledAppointments: 0,
           noShowAppointments: 0,
           averageRating: 0,
           totalReviews: 0,
           completionRate: 0
         },
         createdAt: new Date(),
         updatedAt: new Date()
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
        profileImage: profileImageBase64,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
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
         title: 'Psicólogo',
         yearsOfExperience: 12,
         services: [], // Will be updated after services are created
         defaultServiceDuration: 60,
         weeklyAvailability: [
          { dayOfWeek: 1, startTime: '10:00', endTime: '18:00', isAvailable: true },
          { dayOfWeek: 2, startTime: '10:00', endTime: '18:00', isAvailable: true },
          { dayOfWeek: 3, startTime: '10:00', endTime: '18:00', isAvailable: true },
          { dayOfWeek: 4, startTime: '10:00', endTime: '18:00', isAvailable: true },
          { dayOfWeek: 5, startTime: '10:00', endTime: '16:00', isAvailable: true }
        ],
         vacations: [],
         breaks: [],
         timezone: 'Europe/Madrid',
         bufferMinutes: 10,
         telehealthEnabled: true,
         isActive: true,
         status: 'active',
         isAcceptingNewPatients: true,
         color: '#10B981',
         languages: ['es'],
         currency: 'EUR',
         acceptsOnlinePayments: true,
         paymentMethods: ['cash', 'card', 'transfer'],
         totalReviews: 0,
         totalAppointments: 0,
         completionRate: 0,
         stats: {
           totalPatients: 0,
           activePatients: 0,
           totalAppointments: 0,
           completedAppointments: 0,
           cancelledAppointments: 0,
           noShowAppointments: 0,
           averageRating: 0,
           totalReviews: 0,
           completionRate: 0
         },
         createdAt: new Date(),
         updatedAt: new Date()
       });
       await professional2.save();
       console.log('✅ Created professional: Dr. Carlos Rodríguez Martín');
     } else {
       console.log('ℹ️ Professional already exists: Dr. Carlos Rodríguez Martín');
     }
     user2.professionalId = professional2._id;
     await user2.save();

    // Create patient users
    let patientUser1 = await User.findOne({ email: 'ana.martinez@email.com' });
    if (!patientUser1) {
      const hashedPatientPassword1 = await bcrypt.hash('Patient2024!', 12);
      patientUser1 = new User({
        email: 'ana.martinez@email.com',
        passwordHash: hashedPatientPassword1,
        name: 'Ana Martínez García',
        phone: '+34 666 555 777',
        role: 'patient',
        profileImage: profileImageBase64,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      await patientUser1.save();
      console.log('✅ Created patient user: Ana Martínez García');
    } else {
      console.log('ℹ️ Patient user already exists: Ana Martínez García');
    }

    let patientUser2 = await User.findOne({ email: 'miguel.fernandez@email.com' });
    if (!patientUser2) {
      const hashedPatientPassword2 = await bcrypt.hash('Patient2024!', 12);
      patientUser2 = new User({
        email: 'miguel.fernandez@email.com',
        passwordHash: hashedPatientPassword2,
        name: 'Miguel Fernández López',
        phone: '+34 666 888 999',
        role: 'patient',
        profileImage: profileImageBase64,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      await patientUser2.save();
      console.log('✅ Created patient user: Miguel Fernández López');
    } else {
      console.log('ℹ️ Patient user already exists: Miguel Fernández López');
    }

    // Create services - Complete structure matching Service.ts model
    const services = [
      {
        name: 'Terapia Online',
        description: 'Sesión de terapia psicológica mediante videollamada. Realizamos sesiones virtuales con la misma calidad y profesionalismo que las presenciales.',
        durationMinutes: 55,
        price: 70,
        currency: 'EUR',
        color: '#3B82F6',
        category: 'Terapia Individual',
        tags: ['online', 'videollamada', 'virtual', 'terapia-individual'],
        isActive: true,
        isOnlineAvailable: true,
        requiresApproval: false,
        availableTo: [], // Available to all professionals
        isPubliclyBookable: true,
        priceDetails: {
          basePrice: 70,
          discountedPrice: 65, // 5€ discount for online sessions
          discounts: [
            {
              name: 'Primera sesión',
              percentage: 20,
              validFrom: new Date('2024-01-01'),
              validUntil: new Date('2024-12-31')
            },
            {
              name: 'Estudiantes',
              percentage: 15,
              validFrom: new Date('2024-01-01'),
              validUntil: new Date('2024-12-31')
            }
          ]
        },
        settings: {
          maxAdvanceBookingDays: 90,
          minAdvanceBookingHours: 2,
          allowSameDayBooking: true,
          bufferBefore: 5,
          bufferAfter: 5,
          maxConcurrentBookings: 1,
          requiresIntake: false,
          intakeFormId: null
        },
        preparation: {
          instructions: 'Asegúrese de tener una conexión estable a internet, un espacio privado y tranquilo, y la aplicación de videollamada instalada.',
          requiredDocuments: [],
          recommendedDuration: 15 // 15 minutes before appointment
        },
        followUp: {
          instructions: 'Se enviará un resumen de la sesión y ejercicios recomendados por email en las próximas 24 horas.',
          scheduledTasks: ['Enviar resumen de sesión', 'Programar ejercicios de seguimiento'],
          recommendedGap: 7 // 1 week until next appointment
        },
        stats: {
          totalBookings: 0,
          completedBookings: 0,
          cancelledBookings: 0,
          averageRating: null,
          totalRevenue: 0
        },
        deletedAt: null,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Terapia Presencial - Alicante',
        description: 'Sesión de terapia psicológica en consulta física en Alicante. Atención personalizada en un entorno profesional y confidencial.',
        durationMinutes: 55,
        price: 80,
        currency: 'EUR',
        color: '#10B981',
        category: 'Terapia Individual',
        tags: ['presencial', 'consulta', 'alicante', 'fisica', 'terapia-individual'],
        isActive: true,
        isOnlineAvailable: false,
        requiresApproval: true,
        availableTo: [],
        isPubliclyBookable: false,
        priceDetails: {
          basePrice: 80,
          discountedPrice: null,
          discounts: [
            {
              name: 'Paquete 4 sesiones',
              percentage: 10,
              validFrom: new Date('2024-01-01'),
              validUntil: new Date('2024-12-31')
            },
            {
              name: 'Paquete 8 sesiones',
              percentage: 15,
              validFrom: new Date('2024-01-01'),
              validUntil: new Date('2024-12-31')
            }
          ]
        },
        settings: {
          maxAdvanceBookingDays: 60,
          minAdvanceBookingHours: 24,
          allowSameDayBooking: false,
          bufferBefore: 10,
          bufferAfter: 10,
          maxConcurrentBookings: 1,
          requiresIntake: true,
          intakeFormId: null // Will be set when intake forms are created
        },
        preparation: {
          instructions: 'Llegue 10 minutos antes de su cita. Traiga su documento de identidad y cualquier informe médico relevante si es su primera visita.',
          requiredDocuments: ['DNI/NIE', 'Tarjeta sanitaria'],
          recommendedDuration: 30 // 30 minutes before appointment
        },
        followUp: {
          instructions: 'Se programará la siguiente cita al finalizar la sesión. Recibirá recordatorios 48h y 24h antes de cada cita.',
          scheduledTasks: ['Programar siguiente cita', 'Enviar recordatorios', 'Actualizar historial clínico'],
          recommendedGap: 14 // 2 weeks until next appointment
        },
        stats: {
          totalBookings: 0,
          completedBookings: 0,
          cancelledBookings: 0,
          averageRating: null,
          totalRevenue: 0
        },
        deletedAt: null,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Terapia de Pareja',
        description: 'Sesión especializada en terapia de pareja para mejorar la comunicación y resolver conflictos relacionales.',
        durationMinutes: 75,
        price: 120,
        currency: 'EUR',
        color: '#F59E0B',
        category: 'Terapia de Pareja',
        tags: ['pareja', 'relaciones', 'comunicacion', 'conflictos'],
        isActive: true,
        isOnlineAvailable: true,
        requiresApproval: true,
        availableTo: [], // Available to all professionals
        isPubliclyBookable: true,
        priceDetails: {
          basePrice: 120,
          discountedPrice: null,
          discounts: [
            {
              name: 'Paquete 6 sesiones',
              percentage: 12,
              validFrom: new Date('2024-01-01'),
              validUntil: new Date('2024-12-31')
            }
          ]
        },
        settings: {
          maxAdvanceBookingDays: 45,
          minAdvanceBookingHours: 48,
          allowSameDayBooking: false,
          bufferBefore: 15,
          bufferAfter: 15,
          maxConcurrentBookings: 1,
          requiresIntake: true,
          intakeFormId: null
        },
        preparation: {
          instructions: 'Ambos miembros de la pareja deben completar el cuestionario de evaluación inicial por separado antes de la primera sesión.',
          requiredDocuments: ['Cuestionario de evaluación relacional'],
          recommendedDuration: 45 // 45 minutes before appointment
        },
        followUp: {
          instructions: 'Se asignarán ejercicios específicos para trabajar en casa entre sesiones. Seguimiento mediante comunicación escrita si es necesario.',
          scheduledTasks: ['Asignar ejercicios para casa', 'Programar seguimiento', 'Evaluar progreso'],
          recommendedGap: 10 // 10 days until next appointment
        },
        stats: {
          totalBookings: 0,
          completedBookings: 0,
          cancelledBookings: 0,
          averageRating: null,
          totalRevenue: 0
        },
        deletedAt: null,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Evaluación Psicológica',
        description: 'Evaluación psicológica completa con aplicación de tests y elaboración de informe detallado.',
        durationMinutes: 90,
        price: 150,
        currency: 'EUR',
        color: '#8B5CF6',
        category: 'Evaluación',
        tags: ['evaluacion', 'tests', 'informe', 'diagnostico'],
        isActive: true,
        isOnlineAvailable: false,
        requiresApproval: true,
        availableTo: [],
        isPubliclyBookable: false,
        priceDetails: {
          basePrice: 150,
          discountedPrice: null,
          discounts: []
        },
        settings: {
          maxAdvanceBookingDays: 30,
          minAdvanceBookingHours: 72,
          allowSameDayBooking: false,
          bufferBefore: 20,
          bufferAfter: 30,
          maxConcurrentBookings: 1,
          requiresIntake: true,
          intakeFormId: null
        },
        preparation: {
          instructions: 'Traiga toda la documentación médica y psicológica previa. Descanse bien la noche anterior y evite alcohol o sustancias que puedan afectar el rendimiento.',
          requiredDocuments: ['Informes médicos previos', 'Informes psicológicos anteriores', 'Lista de medicamentos actuales'],
          recommendedDuration: 60 // 1 hour before appointment
        },
        followUp: {
          instructions: 'El informe estará disponible en 7-10 días laborables. Se programará una sesión de devolución para explicar los resultados.',
          scheduledTasks: ['Elaborar informe', 'Programar sesión de devolución', 'Enviar informe'],
          recommendedGap: 10 // 10 days for report delivery session
        },
        stats: {
          totalBookings: 0,
          completedBookings: 0,
          cancelledBookings: 0,
          averageRating: null,
          totalRevenue: 0
        },
        deletedAt: null,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    const createdServices = [];
    for (const serviceData of services) {
      const service = new Service(serviceData);
      await service.save();
      createdServices.push(service);
      console.log(`💼 Created service: ${service.name} (${service.price}${service.currency}, ${service.durationMinutes}min)`);
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

    const createdRooms = [];
    for (const roomData of rooms) {
      const room = new Room(roomData);
      await room.save();
      createdRooms.push(room);
      console.log(`🏢 Created room: ${room.name}`);
    }

    // Assign services and rooms to professionals after they are created
    console.log('\n📋 Assigning services and rooms to professionals...');
    
    // Assign both services and rooms to professional1 (María García)
    professional1.services = createdServices.map(service => service._id);
    professional1.assignedRooms = [createdRooms[0]._id, createdRooms[2]._id]; // Consulta 1 + Sala Virtual
    professional1.defaultRoom = createdRooms[0]._id; // Consulta 1 as default
    await professional1.save();
    console.log(`✅ Assigned ${createdServices.length} services and ${professional1.assignedRooms.length} rooms to ${professional1.name}`);

    // Assign both services and rooms to professional2 (Carlos Rodríguez) 
    professional2.services = createdServices.map(service => service._id);
    professional2.assignedRooms = [createdRooms[1]._id, createdRooms[2]._id]; // Consulta 2 + Sala Virtual
    professional2.defaultRoom = createdRooms[1]._id; // Consulta 2 as default
    await professional2.save();
    console.log(`✅ Assigned ${createdServices.length} services and ${professional2.assignedRooms.length} rooms to ${professional2.name}`);

    // Crear 3 profesionales adicionales primero
    const professionalNames = [
      { firstName: 'Elena', lastName: 'Navarro Ruiz', title: 'Psicóloga', specialties: ['Terapia de Pareja', 'Sexología', 'Mediación Familiar'], experience: 15 },
      { firstName: 'Roberto', lastName: 'Morales Vega', title: 'Psicólogo', specialties: ['Neuropsicología', 'Rehabilitación Cognitiva', 'Demencias'], experience: 10 },
      { firstName: 'Carmen', lastName: 'Jiménez Soto', title: 'Psicóloga', specialties: ['Psicología Forense', 'Evaluación Pericial', 'Victimología'], experience: 18 },
    ];

    const additionalProfessionals = [];
    for (let i = 0; i < professionalNames.length; i++) {
      const prof = professionalNames[i];
      const email = `${prof.firstName.toLowerCase()}.${prof.lastName.split(' ')[0].toLowerCase()}@arribapsicologia.com`;
      const hashedPassword = await bcrypt.hash('Professional2024!', 12);
      
      const profUser = new User({
        email: email,
        passwordHash: hashedPassword,
        name: `${prof.title} ${prof.firstName} ${prof.lastName}`,
        phone: `+34 6${String(Math.floor(Math.random() * 100000000)).padStart(8, '0')}`,
        role: 'professional',
        profileImage: profileImageBase64,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      await profUser.save();
      console.log(`✅ Created user: ${prof.title} ${prof.firstName} ${prof.lastName}`);

      const professional = new Professional({
        userId: profUser._id,
        name: `${prof.title} ${prof.firstName} ${prof.lastName}`,
        email: email,
        phone: profUser.phone,
        licenseNumber: `PSI-${2020 + i}-00${3 + i}`,
        specialties: prof.specialties,
        bio: `${prof.title} con ${prof.experience} años de experiencia`,
        title: prof.title,
        yearsOfExperience: prof.experience,
        services: createdServices.map(service => service._id),
        defaultServiceDuration: 60,
        weeklyAvailability: [
          { dayOfWeek: 1, startTime: '09:00', endTime: '17:00', isAvailable: true },
          { dayOfWeek: 2, startTime: '09:00', endTime: '17:00', isAvailable: true },
          { dayOfWeek: 3, startTime: '09:00', endTime: '17:00', isAvailable: true },
          { dayOfWeek: 4, startTime: '09:00', endTime: '17:00', isAvailable: true },
          { dayOfWeek: 5, startTime: '09:00', endTime: '16:00', isAvailable: true }
        ],
        bufferMinutes: Math.floor(Math.random() * 10) + 10,
        timezone: 'Europe/Madrid',
        assignedRooms: [createdRooms[Math.floor(Math.random() * 2)]._id, createdRooms[2]._id], // Random physical room + virtual room
        defaultRoom: createdRooms[Math.floor(Math.random() * 2)]._id, // Random physical room as default
        vacations: [],
        settings: {
          allowOnlineBooking: Math.random() > 0.5,
          requireApproval: Math.random() > 0.5,
          notificationPreferences: {
            email: true,
            sms: Math.random() > 0.5,
            push: true
          }
        },
        createdAt: new Date(),
        updatedAt: new Date()
      });
      await professional.save();
      console.log(`✅ Created professional: ${prof.title} ${prof.firstName} ${prof.lastName}`);
      
      profUser.professionalId = professional._id;
      await profUser.save();
      additionalProfessionals.push(professional);
    }

    // Crear 50 pacientes adicionales con datos más variados
    const additionalPatients = [];
    const firstNames = ['Carlos', 'María', 'José', 'Carmen', 'Antonio', 'Isabel', 'Manuel', 'Pilar', 'Francisco', 'Dolores', 'David', 'Teresa', 'Jesús', 'Ana', 'Javier', 'Cristina', 'Daniel', 'Marta', 'Rafael', 'Laura', 'Fernando', 'Silvia', 'Sergio', 'Patricia', 'Alejandro', 'Beatriz', 'Pablo', 'Rocío', 'Adrián', 'Natalia', 'Diego', 'Lucía', 'Ángel', 'Rosa', 'Juan', 'Inés', 'Miguel', 'Sofía', 'Rubén', 'Alba', 'Álvaro', 'Nerea', 'Marcos', 'Irene', 'Gonzalo', 'Claudia', 'Víctor', 'Paula', 'Iván', 'Elena'];
    const lastNames = ['García', 'Rodríguez', 'González', 'Fernández', 'López', 'Martínez', 'Sánchez', 'Pérez', 'Gómez', 'Martín', 'Jiménez', 'Ruiz', 'Hernández', 'Díaz', 'Moreno', 'Muñoz', 'Álvarez', 'Romero', 'Alonso', 'Gutiérrez', 'Navarro', 'Torres', 'Domínguez', 'Vázquez', 'Ramos', 'Gil', 'Ramírez', 'Serrano', 'Blanco', 'Suárez', 'Castillo', 'Ortega', 'Delgado', 'Castro', 'Vargas', 'Ortiz', 'Rubio', 'Medina', 'Soto', 'Contreras', 'Aguilar', 'Herrera', 'Mendoza', 'Guerrero', 'Rojas', 'Medina', 'Cruz', 'Flores', 'Espinoza', 'Rivera'];
    const cities = ['Madrid', 'Barcelona', 'Valencia', 'Sevilla', 'Zaragoza', 'Málaga', 'Murcia', 'Palma', 'Las Palmas', 'Bilbao', 'Alicante', 'Córdoba', 'Valladolid', 'Vigo', 'Gijón', 'Hospitalet', 'Granada', 'Elche', 'Oviedo', 'Badalona'];
    const conditions = ['Ansiedad', 'Depresión', 'Estrés', 'Insomnio', 'Fobias', 'TOC', 'TDAH', 'Trastorno bipolar', 'Duelo', 'Trauma', 'Adicciones', 'Trastornos alimentarios', 'Autoestima', 'Habilidades sociales', 'Control de ira'];
    const occupations = ['Ingeniero', 'Profesor', 'Médico', 'Abogado', 'Comercial', 'Administrativo', 'Enfermero', 'Psicólogo', 'Contador', 'Diseñador', 'Arquitecto', 'Periodista', 'Chef', 'Artista', 'Mecánico', 'Policía', 'Bombero', 'Veterinario', 'Farmacéutico', 'Electricista', 'Plomero', 'Traductor', 'Programador', 'Consultor', 'Vendedor'];
    const genders = ['male', 'female', 'non-binary', 'other'];
    const statuses = ['active', 'inactive', 'discharged', 'transferred'];
    const maritalStatuses = ['single', 'married', 'divorced', 'widowed', 'separated', 'domestic-partner'];
    
    // Create sample consent documents
    const consentDocuments = [];
    
    // Informed Consent Document
    const informedConsentDoc = new File({
      fileName: 'consentimiento-informado-v2.1.pdf',
      originalFileName: 'consentimiento-informado-v2.1.pdf',
      mimeType: 'application/pdf',
      fileSize: 245760, // ~240KB
      category: 'consent',
      description: 'Documento de Consentimiento Informado para Tratamiento Psicológico',
      tags: ['consentimiento', 'informado', 'tratamiento', 'psicologia'],
      uploadedBy: adminUser._id,
      permissions: {
        visibility: 'private',
        userPermissions: [],
        rolePermissions: [
          { role: 'admin', permissions: ['read', 'write', 'delete'] },
          { role: 'professional', permissions: ['read'] }
        ]
      },
      digitalSignature: {
        isSigned: false,
        signatureMethod: 'digital'
      },
      metadata: {
        documentType: 'informed_consent',
        version: '2.1',
        language: 'es',
        jurisdiction: 'España',
        effectiveDate: new Date('2024-01-01'),
        expirationDate: new Date('2025-12-31')
      },
      createdAt: new Date(),
      updatedAt: new Date()
    });
    await informedConsentDoc.save();
    consentDocuments.push(informedConsentDoc);
    console.log('📄 Created consent document: Consentimiento Informado');

    // Privacy Policy Document
    const privacyPolicyDoc = new File({
      fileName: 'politica-privacidad-v1.3.pdf',
      originalFileName: 'politica-privacidad-v1.3.pdf',
      mimeType: 'application/pdf',
      fileSize: 189440, // ~185KB
      category: 'consent',
      description: 'Política de Privacidad y Protección de Datos GDPR',
      tags: ['privacidad', 'gdpr', 'proteccion-datos'],
      uploadedBy: adminUser._id,
      permissions: {
        visibility: 'private',
        userPermissions: [],
        rolePermissions: [
          { role: 'admin', permissions: ['read', 'write', 'delete'] },
          { role: 'professional', permissions: ['read'] }
        ]
      },
      digitalSignature: {
        isSigned: false,
        signatureMethod: 'digital'
      },
      metadata: {
        documentType: 'privacy_policy',
        version: '1.3',
        language: 'es',
        jurisdiction: 'España',
        effectiveDate: new Date('2024-03-01')
      },
      createdAt: new Date(),
      updatedAt: new Date()
    });
    await privacyPolicyDoc.save();
    consentDocuments.push(privacyPolicyDoc);
    console.log('📄 Created consent document: Política de Privacidad');

    // Telehealth Consent Document
    const telehealthConsentDoc = new File({
      fileName: 'consentimiento-telesalud-v1.0.pdf',
      originalFileName: 'consentimiento-telesalud-v1.0.pdf',
      mimeType: 'application/pdf',
      fileSize: 156672, // ~153KB
      category: 'consent',
      description: 'Consentimiento para Sesiones de Telesalud y Videollamadas',
      tags: ['telesalud', 'videollamada', 'online'],
      uploadedBy: adminUser._id,
      permissions: {
        visibility: 'private',
        userPermissions: [],
        rolePermissions: [
          { role: 'admin', permissions: ['read', 'write', 'delete'] },
          { role: 'professional', permissions: ['read'] }
        ]
      },
      digitalSignature: {
        isSigned: false,
        signatureMethod: 'digital'
      },
      metadata: {
        documentType: 'telehealth_consent',
        version: '1.0',
        language: 'es',
        jurisdiction: 'España',
        effectiveDate: new Date('2024-02-01')
      },
      createdAt: new Date(),
      updatedAt: new Date()
    });
    await telehealthConsentDoc.save();
    consentDocuments.push(telehealthConsentDoc);
    console.log('📄 Created consent document: Consentimiento Telesalud');

    // Combinar todos los profesionales (originales + nuevos)
    const allProfessionals = [professional1, professional2, ...additionalProfessionals];

    for (let i = 0; i < 50; i++) {
      const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
      const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
      const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i + 3}@email.com`;
      const phone = `+34 6${String(Math.floor(Math.random() * 100000000)).padStart(8, '0')}`;
      const city = cities[Math.floor(Math.random() * cities.length)];
      const condition = conditions[Math.floor(Math.random() * conditions.length)];
      const occupation = occupations[Math.floor(Math.random() * occupations.length)];
      const birthYear = 1950 + Math.floor(Math.random() * 55); // Edades 18-74 años
      const gender = genders[Math.floor(Math.random() * genders.length)];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const maritalStatus = maritalStatuses[Math.floor(Math.random() * maritalStatuses.length)];
      const professionalId = allProfessionals[Math.floor(Math.random() * allProfessionals.length)]._id;
      
      // Calcular edad basada en fecha de nacimiento
      const dateOfBirth = new Date(birthYear, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1);
      const today = new Date();
      const age = today.getFullYear() - dateOfBirth.getFullYear() - 
        (today.getMonth() < dateOfBirth.getMonth() || 
         (today.getMonth() === dateOfBirth.getMonth() && today.getDate() < dateOfBirth.getDate()) ? 1 : 0);

      const additionalPatient = new Patient({
        personalInfo: {
          firstName: firstName,
          lastName: lastName,
          fullName: `${firstName} ${lastName}`,
          dateOfBirth: dateOfBirth,
          age: age,
          gender: gender,
          nationality: 'Española',
          idNumber: `${String(Math.floor(Math.random() * 100000000)).padStart(8, '0')}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}`,
          idType: 'dni',
          maritalStatus: maritalStatus,
          occupation: occupation,
          profilePicture: Math.random() > 0.4 ? profileImageBase64 : null  // 60% tienen foto, 40% no
        },
        contactInfo: {
          email: email,
          phone: phone,
          preferredContactMethod: ['email', 'phone', 'sms'][Math.floor(Math.random() * 3)],
          address: {
            street: `Calle ${Math.floor(Math.random() * 100) + 1}, ${Math.floor(Math.random() * 50) + 1}`,
            city: city,
            postalCode: String(Math.floor(Math.random() * 50000) + 1000).padStart(5, '0'),
            state: city,
            country: 'España'
          }
        },
        emergencyContact: {
          name: `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`,
          relationship: ['Padre', 'Madre', 'Hermano', 'Hermana', 'Cónyuge', 'Hijo', 'Hija'][Math.floor(Math.random() * 7)],
          phone: `+34 6${String(Math.floor(Math.random() * 100000000)).padStart(8, '0')}`
        },
        clinicalInfo: {
          primaryProfessional: professionalId,
          assignedProfessionals: [professionalId],
          medicalHistory: {
            conditions: getRandomItems(MEDICAL_CONDITIONS, Math.floor(Math.random() * 3) + 1),
            medications: getRandomItems(MEDICATIONS, Math.floor(Math.random() * 2) + 1),
            allergies: getRandomItems(ALLERGIES, Math.floor(Math.random() * 2)),
            surgeries: getRandomItems(SURGERIES, Math.floor(Math.random() * 2)),
            notes: '<p>Historial médico sin complicaciones relevantes. Paciente colaborativo durante la evaluación inicial.</p>'
          },
          mentalHealthHistory: {
            diagnoses: getRandomItems(MENTAL_HEALTH_DIAGNOSES, Math.floor(Math.random() * 2) + 1),
            previousTreatments: getRandomItems(MENTAL_HEALTH_TREATMENTS, Math.floor(Math.random() * 3) + 1),
            currentStatus: Object.values(MENTAL_HEALTH_STATUS)[Math.floor(Math.random() * Object.values(MENTAL_HEALTH_STATUS).length)],
            severity: Object.values(MENTAL_HEALTH_SEVERITY)[Math.floor(Math.random() * Object.values(MENTAL_HEALTH_SEVERITY).length)],
            notes: '<p>Evolución favorable con el tratamiento actual. Se observa mejoría en el estado de ánimo y reducción de síntomas ansiosos.</p>'
          },
          currentTreatment: {
            treatmentPlan: `<h3>Plan de Tratamiento Integral</h3>
              <p><strong>Objetivos principales:</strong></p>
              <ul>
                <li>Reducir niveles de ansiedad mediante técnicas de relajación</li>
                <li>Mejorar patrones de sueño y establecer rutinas saludables</li>
                <li>Fortalecer estrategias de afrontamiento</li>
                <li>Aumentar autoestima y confianza personal</li>
              </ul>
              <p><strong>Metodología:</strong> Terapia cognitivo-conductual combinada con técnicas de mindfulness</p>
              <p><strong>Duración estimada:</strong> 6 meses con sesiones semanales</p>
              <p><strong>Evaluación:</strong> Revisión mensual del progreso con escalas validadas</p>`,
            goals: ['Reducir ansiedad', 'Mejorar sueño', 'Aumentar autoestima', 'Fortalecer relaciones'],
            startDate: new Date(Date.now() - Math.floor(Math.random() * 90) * 24 * 60 * 60 * 1000),
            expectedDuration: ['3 meses', '6 meses', '1 año'][Math.floor(Math.random() * 3)],
            frequency: ['weekly', 'biweekly'][Math.floor(Math.random() * 2)],
            notes: '<p>Paciente muestra excelente adherencia al tratamiento. Se recomienda continuar con el plan establecido.</p>',
            sessions: [
              {
                sessionId: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 1 week ago
                duration: 60,
                type: 'individual',
                status: 'completed',
                professionalId: allProfessionals[0]._id,
                notes: `<h3>Sesión de Evaluación Inicial</h3>
                  <p><strong>Objetivos de la sesión:</strong></p>
                  <ul>
                    <li>Establecer rapport terapéutico</li>
                    <li>Evaluar estado mental actual</li>
                    <li>Identificar objetivos de tratamiento</li>
                  </ul>
                  <p><strong>Observaciones:</strong> Paciente colaborativo, muestra insight sobre su situación. Presenta síntomas de ansiedad moderada.</p>
                  <p><strong>Intervenciones:</strong> Psicoeducación sobre ansiedad, introducción a técnicas de respiración.</p>`,
                objectives: ['Establecer rapport', 'Evaluación inicial', 'Definir objetivos'],
                homework: '<p>Practicar ejercicios de respiración diafragmática 10 minutos diarios</p>',
                nextSessionPlan: '<p>Continuar con psicoeducación y comenzar técnicas de relajación progresiva</p>',
                mood: {
                  before: { level: 3, description: 'Ansioso y preocupado' },
                  after: { level: 6, description: 'Más tranquilo y esperanzado' }
                },
                progress: {
                  rating: 7,
                  observations: 'Buena disposición al cambio, comprende los conceptos explicados'
                },
                createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
                updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
              },
              {
                sessionId: `session_${Date.now() + 1}_${Math.random().toString(36).substr(2, 9)}`,
                date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
                duration: 50,
                type: 'individual',
                status: 'completed',
                professionalId: allProfessionals[0]._id,
                notes: `<h3>Sesión de Seguimiento</h3>
                  <p><strong>Revisión de tareas:</strong> Paciente completó ejercicios de respiración con buenos resultados.</p>
                  <p><strong>Trabajo en sesión:</strong></p>
                  <ul>
                    <li>Identificación de pensamientos automáticos negativos</li>
                    <li>Técnicas de reestructuración cognitiva</li>
                    <li>Práctica de relajación muscular progresiva</li>
                  </ul>
                  <p><strong>Progreso observado:</strong> Reducción notable en síntomas de ansiedad, mejor calidad de sueño.</p>`,
                objectives: ['Revisar tareas', 'Reestructuración cognitiva', 'Relajación muscular'],
                homework: '<p>Registro de pensamientos automáticos durante situaciones de estrés. Continuar con ejercicios de respiración.</p>',
                nextSessionPlan: '<p>Trabajar en exposición gradual a situaciones temidas</p>',
                mood: {
                  before: { level: 5, description: 'Estable, algo ansioso' },
                  after: { level: 7, description: 'Relajado y motivado' }
                },
                progress: {
                  rating: 8,
                  observations: 'Excelente progreso, paciente muy comprometido con el proceso'
                },
                createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
                updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
              }
            ]
          }
        },
        payment: {
          preferredMethod: Math.random() > 0.2 ? 'card' : 'cash',
          billingNotes: ''
        },
        preferences: {
          language: 'es',
          communicationPreferences: {
            appointmentReminders: Math.random() > 0.2,
            reminderMethods: getRandomItems(['email', 'sms', 'phone'], Math.floor(Math.random() * 2) + 1),
            newsletters: Math.random() > 0.5,
            marketingCommunications: Math.random() > 0.7,
            preferredContactTimes: Math.random() > 0.6 ? ['morning'] : ['afternoon', 'evening']
          },
          appointmentPreferences: {
            preferredTimes: getRandomItems([
              { day: 'monday', startTime: '09:00', endTime: '12:00' },
              { day: 'tuesday', startTime: '14:00', endTime: '17:00' },
              { day: 'wednesday', startTime: '10:00', endTime: '13:00' },
              { day: 'thursday', startTime: '15:00', endTime: '18:00' },
              { day: 'friday', startTime: '09:00', endTime: '11:00' }
            ], Math.floor(Math.random() * 3) + 1),
            preferredServices: [], // Will be populated after services are created
            cancellationNotice: [24, 48, 72][Math.floor(Math.random() * 3)],
            waitingListOptIn: Math.random() > 0.4,
            notes: Math.random() > 0.5 ? 'Flexibilidad en horarios de tarde' : undefined
          },
          portalAccess: {
            enabled: Math.random() > 0.2,
            lastLogin: Math.random() > 0.5 ? new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000) : undefined,
            passwordLastChanged: new Date(Date.now() - Math.floor(Math.random() * 90) * 24 * 60 * 60 * 1000),
            twoFactorEnabled: Math.random() > 0.8,
            loginNotifications: Math.random() > 0.3
          }
        },
        gdprConsent: {
          dataProcessing: {
            consented: true,
            consentDate: new Date(Date.now() - Math.floor(Math.random() * 60) * 24 * 60 * 60 * 1000),
            consentMethod: 'digital',
            consentVersion: '2.1',
            witnessedBy: professionalId,
            notes: 'Consentimiento registrado durante el proceso de registro inicial'
          },
          marketingCommunications: {
            consented: Math.random() > 0.4,
            consentDate: Math.random() > 0.4 ? new Date(Date.now() - Math.floor(Math.random() * 60) * 24 * 60 * 60 * 1000) : undefined,
            withdrawnDate: Math.random() > 0.8 ? new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000) : undefined,
            method: 'digital'
          },
          dataSharing: {
            healthcareProfessionals: true,
            emergencyContacts: true,
            researchPurposes: Math.random() > 0.7,
            consentDate: new Date(Date.now() - Math.floor(Math.random() * 60) * 24 * 60 * 60 * 1000)
          },
          rightToErasure: {
            requested: false,
            requestDate: undefined,
            processedDate: undefined,
            processedBy: undefined,
            retentionReason: undefined,
            notes: undefined
          },
          dataPortability: {
            lastExportDate: Math.random() > 0.9 ? new Date(Date.now() - Math.floor(Math.random() * 180) * 24 * 60 * 60 * 1000) : undefined,
            exportFormat: Math.random() > 0.9 ? 'JSON' : undefined,
            exportedBy: Math.random() > 0.9 ? professionalId : undefined
          }
        },
        
        // Signed Consent Documents (Global/Shared)
        signedConsentDocuments: [
          {
            documentId: informedConsentDoc._id,
            documentType: 'informed_consent',
            documentTitle: 'Consentimiento Informado para Tratamiento Psicológico',
            signedDate: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000),
            signedBy: professionalId,
            createdBy: professionalId,
            lastModifiedBy: Math.random() > 0.3 ? professionalId : adminUser._id,
            version: Math.floor(Math.random() * 3) + 1,
            signatureMethod: 'digital',
            documentVersion: '2.1',
            isActive: true,
            expirationDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 año
            notes: 'Consentimiento firmado durante la primera consulta',
            metadata: {
              ipAddress: `192.168.1.${Math.floor(Math.random() * 254) + 1}`,
              userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
              location: 'Madrid, España',
              deviceInfo: 'Desktop - Chrome'
            }
          },
          ...(Math.random() > 0.6 ? [{
            documentId: privacyPolicyDoc._id,
            documentType: 'privacy_policy',
            documentTitle: 'Política de Privacidad y Protección de Datos',
            signedDate: new Date(Date.now() - Math.floor(Math.random() * 20) * 24 * 60 * 60 * 1000),
            signedBy: professionalId,
            signatureMethod: 'digital',
            documentVersion: '1.3',
            isActive: true,
            notes: 'Aceptación de política de privacidad actualizada'
          }] : []),
          ...(Math.random() > 0.8 ? [{
            documentId: telehealthConsentDoc._id,
            documentType: 'telehealth_consent',
            documentTitle: 'Consentimiento para Sesiones de Telesalud',
            signedDate: new Date(Date.now() - Math.floor(Math.random() * 15) * 24 * 60 * 60 * 1000),
            signedBy: professionalId,
            signatureMethod: 'digital',
            documentVersion: '1.0',
            isActive: true,
            notes: 'Autorización para sesiones virtuales por videollamada'
          }] : [])
        ],
        tags: Math.random() > 0.3 ? [{
          name: ['VIP', 'Seguimiento especial', 'Primera consulta', 'Urgente', 'Derivado'][Math.floor(Math.random() * 5)],
          category: ['clinical', 'administrative', 'billing'][Math.floor(Math.random() * 3)],
          color: ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6'][Math.floor(Math.random() * 6)],
          addedBy: professionalId,
          addedDate: new Date()
        }] : [],
        status: status,
        relationships: [],
        referral: {
          source: ['self', 'physician', 'family', 'friend', 'online'][Math.floor(Math.random() * 5)],
          referralDate: new Date(2024, Math.floor(Math.random() * 6), Math.floor(Math.random() * 28) + 1),
          referralReason: `Necesidad de tratamiento para ${condition.toLowerCase()}`
        },
        administrativeNotes: Math.random() > 0.5 ? [{
          noteId: `NOTE-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          content: `<h4>Nota Administrativa</h4><p><strong>Fecha:</strong> ${new Date().toLocaleDateString('es-ES')}</p><p><strong>Observaciones:</strong></p><ul><li>Paciente puntual en las citas</li><li>Comunicación fluida con el equipo</li><li>Cumple con los protocolos establecidos</li></ul><p><em>Nota registrada por el equipo administrativo</em></p>`,
          category: 'general',
          isPrivate: false,
          addedBy: professionalId,
          addedDate: new Date(),
          lastModified: new Date(),
          lastModifiedBy: professionalId
        }] : [],
        statistics: {
          totalAppointments: 0,
          completedAppointments: 0,
          cancelledAppointments: 0,
          noShowAppointments: 0,
          firstAppointmentDate: null,
          lastAppointmentDate: null,
          totalInvoiceAmount: 0,
          totalPaidAmount: 0,
          averageSessionRating: 0
        },
        createdBy: adminUser._id,
        lastModifiedBy: Math.random() > 0.5 ? adminUser._id : professionalId,
        version: Math.floor(Math.random() * 3) + 1,
        createdAt: new Date(Date.now() - Math.floor(Math.random() * 90) * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000)
      });
      
      await additionalPatient.save();
      additionalPatients.push(additionalPatient);
      console.log(`✅ Created additional patient: ${firstName} ${lastName}`);
    }

    // Crear citas históricas para algunos pacientes (no todos)
    const allPatients = [...additionalPatients];
    const allServices = await Service.find({});
    const allRooms = await Room.find({});
    const professionals = [professional1, professional2];
    
    const appointmentStatuses = ['completed', 'completed', 'completed', 'cancelled', 'no_show'];
    const sessionTypes = ['initial', 'follow_up', 'follow_up', 'follow_up', 'assessment'];
    const professionalNotes = [
      'Paciente muestra progreso significativo en el manejo de la ansiedad. Continuar con técnicas de respiración.',
      'Sesión productiva. Paciente ha implementado estrategias de afrontamiento discutidas en sesiones anteriores.',
      'Evaluación inicial completada. Recomendado plan de tratamiento de 12 sesiones.',
      'Paciente reporta mejora en patrones de sueño. Ajustar frecuencia de sesiones.',
      'Sesión enfocada en técnicas de mindfulness. Paciente receptivo a nuevas estrategias.',
      'Revisión de objetivos terapéuticos. Paciente ha alcanzado metas intermedias.',
      'Sesión de seguimiento. Mantener estrategias actuales, paciente estable.',
      'Trabajo en habilidades sociales. Paciente muestra mayor confianza.',
      'Sesión de crisis manejada exitosamente. Paciente en estado estable.',
      'Evaluación de progreso trimestral. Resultados positivos en todas las áreas.'
    ];

    const createdAppointments = [];
    
    // Crear citas para todos los pacientes
    const patientsWithHistory = allPatients;
    
    // Actualizar referencias de profesionales (usar allProfessionals ya definido)
    
    for (const patient of patientsWithHistory) {
      const numAppointments = Math.floor(Math.random() * 8) + 1; // 1-8 citas por paciente
      const assignedProfessional = patient.clinicalInfo.assignedProfessionals[0];
      const professional = allProfessionals.find(p => p._id.equals(assignedProfessional));
      
      if (!professional) continue;

      for (let i = 0; i < numAppointments; i++) {
        // Generar fechas en los últimos 6 meses
        const daysAgo = Math.floor(Math.random() * 180) + 7; // 7-187 días atrás
        const appointmentDate = new Date();
        appointmentDate.setDate(appointmentDate.getDate() - daysAgo);
        appointmentDate.setHours(9 + Math.floor(Math.random() * 8), 0, 0, 0); // 9:00-17:00
        
        const service = allServices[Math.floor(Math.random() * allServices.length)];
        const room = allRooms[Math.floor(Math.random() * (allRooms.length - 1))]; // Excluir sala virtual
        const status = appointmentStatuses[Math.floor(Math.random() * appointmentStatuses.length)];
        const sessionType = i === 0 ? 'initial' : sessionTypes[Math.floor(Math.random() * sessionTypes.length)];
        
        const endTime = new Date(appointmentDate);
        endTime.setMinutes(appointmentDate.getMinutes() + service.duration);
        
        const basePrice = service.price;
        const totalAmount = basePrice;

        const appointment = new Appointment({
          patientId: patient._id,
          professionalId: professional._id,
          serviceId: service._id,
          roomId: room._id,
          startTime: appointmentDate,
          endTime: endTime,
          duration: service.duration,
          timezone: 'Europe/Madrid',
          status: status,
          paymentStatus: status === 'completed' ? 'paid' : (status === 'cancelled' ? 'refunded' : 'pending'),
          source: ['admin', 'professional', 'public_booking'][Math.floor(Math.random() * 3)],
          bookingMethod: ['online', 'phone', 'in_person'][Math.floor(Math.random() * 3)],
          
          pricing: {
            basePrice: basePrice,
            discountAmount: 0,
            totalAmount: totalAmount,
            currency: 'EUR'
          },
          
          patientInfo: {
            name: `${patient.personalInfo.firstName} ${patient.personalInfo.lastName}`,
            email: patient.contactInfo.email,
            phone: patient.contactInfo.phone,
            dateOfBirth: patient.personalInfo.dateOfBirth,
            emergencyContact: patient.emergencyContact ? {
              name: patient.emergencyContact.name,
              phone: patient.emergencyContact.phone,
              relationship: patient.emergencyContact.relationship
            } : undefined
          },
          
          notes: status === 'completed' ? {
            professionalNotes: professionalNotes[Math.floor(Math.random() * professionalNotes.length)],
            patientNotes: Math.random() > 0.7 ? 'Me siento mejor después de la sesión' : undefined
          } : (status === 'cancelled' ? {
            cancellationReason: ['Enfermedad', 'Conflicto de horario', 'Emergencia familiar'][Math.floor(Math.random() * 3)]
          } : undefined),
          
          forms: {
            intakeCompleted: i === 0 ? true : false,
            preSessionCompleted: Math.random() > 0.3,
            postSessionCompleted: status === 'completed' ? Math.random() > 0.5 : false
          },
          
          reminders: {
            sms: { sent: true, sentAt: new Date(appointmentDate.getTime() - 24 * 60 * 60 * 1000) },
            email: { sent: true, sentAt: new Date(appointmentDate.getTime() - 24 * 60 * 60 * 1000) },
            push: { sent: false }
          },
          
          attendance: status === 'completed' ? {
            patientArrived: true,
            patientArrivedAt: new Date(appointmentDate.getTime() - 5 * 60 * 1000),
            professionalPresent: true,
            sessionStarted: true,
            sessionStartedAt: appointmentDate,
            sessionEnded: true,
            sessionEndedAt: endTime,
            actualDuration: service.duration + Math.floor(Math.random() * 10) - 5 // ±5 minutos
          } : (status === 'no_show' ? {
            patientArrived: false,
            professionalPresent: true,
            sessionStarted: false,
            sessionEnded: false
          } : {}),
          
          followUp: status === 'completed' && Math.random() > 0.5 ? {
            recommendedFrequency: ['weekly', 'biweekly', 'monthly'][Math.floor(Math.random() * 3)],
            homeworkAssigned: Math.random() > 0.6 ? 'Practicar técnicas de respiración diariamente' : undefined
          } : undefined,
          
          feedback: status === 'completed' && Math.random() > 0.4 ? {
            patientRating: Math.floor(Math.random() * 2) + 4, // 4-5 estrellas
            overallSatisfaction: Math.floor(Math.random() * 2) + 4,
            patientComment: Math.random() > 0.7 ? 'Muy satisfecho con la sesión' : undefined
          } : undefined,
          
          compliance: {
            consentSigned: true,
            consentSignedAt: i === 0 ? appointmentDate : undefined,
            hipaaCompliant: true,
            documentationComplete: status === 'completed',
            billingCoded: status === 'completed'
          },
          
          metadata: {
            sessionType: sessionType,
            treatmentPlan: i === 0 ? `Plan de tratamiento para ${patient.clinicalInfo.medicalHistory.conditions[0]}` : undefined,
            referralSource: i === 0 ? ['Médico de cabecera', 'Autoremisión', 'Familiar', 'Internet'][Math.floor(Math.random() * 4)] : undefined
          },
          
          attachments: []
        });
        
        // Manejar cancelaciones
        if (status === 'cancelled') {
          appointment.cancellation = {
            cancelledBy: Math.random() > 0.5 ? patient.userId : professional.userId,
            cancelledAt: new Date(appointmentDate.getTime() - 2 * 60 * 60 * 1000),
            reason: appointment.notes?.cancellationReason || 'Motivos personales',
            refundAmount: totalAmount,
            refundProcessed: true,
            rescheduleOffered: true
          };
        }
        
        await appointment.save();
        createdAppointments.push(appointment);
      }
      
      console.log(`📅 Created ${numAppointments} appointments for ${patient.personalInfo.firstName} ${patient.personalInfo.lastName}`);
    }

    // Actualizar estadísticas de pacientes basadas en citas reales
    for (const patient of patientsWithHistory) {
      const patientAppointments = createdAppointments.filter(apt => apt.patientId.equals(patient._id));
      
      const sortedAppointments = patientAppointments.sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
      
      const stats = {
        totalAppointments: patientAppointments.length,
        completedAppointments: patientAppointments.filter(apt => apt.status === 'completed').length,
        cancelledAppointments: patientAppointments.filter(apt => apt.status === 'cancelled').length,
        noShowAppointments: patientAppointments.filter(apt => apt.status === 'no_show').length,
        firstAppointmentDate: sortedAppointments.length > 0 ? sortedAppointments[0].startTime : null,
        lastAppointmentDate: sortedAppointments.length > 0 ? sortedAppointments[sortedAppointments.length - 1].startTime : null,
        totalInvoiceAmount: patientAppointments
          .reduce((sum, apt) => sum + apt.pricing.totalAmount, 0),
        totalPaidAmount: patientAppointments
          .filter(apt => apt.paymentStatus === 'paid')
          .reduce((sum, apt) => sum + apt.pricing.totalAmount, 0),
        averageSessionRating: patientAppointments.length > 0 
          ? Math.round((Math.random() * 2 + 3) * 10) / 10 // 3.0-5.0 
          : 0
      };
      
      await Patient.findByIdAndUpdate(patient._id, { statistics: stats });
    }

    console.log('\n🎉 SEED DATA CREATED SUCCESSFULLY!');
    console.log(`👥 Professionals: ${2 + additionalProfessionals.length}`);
    console.log(`🏥 Patients: ${2 + additionalPatients.length}`);
    console.log('💼 Services: 3');
    console.log('🏢 Rooms: 3');
    console.log(`📅 Appointments: ${createdAppointments.length}`);
    console.log(`👥 Patients with history: ${patientsWithHistory.length}`);
    
    console.log('\n🔐 TEST CREDENTIALS:');
    console.log('👤 Admin: admin@arribapsicologia.com / SecureAdmin2024!');
    console.log('👨‍⚕️ Professional 1: maria.garcia@arribapsicologia.com / Professional2024!');
    console.log('👨‍⚕️ Professional 2: carlos.rodriguez@arribapsicologia.com / Professional2024!');
    console.log('🏥 Patient 1: ana.martinez@email.com / Patient2024!');
    console.log('🏥 Patient 2: miguel.fernandez@email.com / Patient2024!');
    console.log(`🏥 Additional Patients: ${additionalPatients.length} patients created with various test data`);

  } catch (error) {
    console.error('❌ Seeding error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB');
    process.exit(0);
  }
}

seedData();
