const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const fs = require('fs');
const path = require('path');

// Read the full base64 image from file
const profileImagePath = path.join(__dirname, '../../profile-avatar-base64.txt');
const profileImageBase64 = fs.readFileSync(profileImagePath, 'utf8').trim();

// Simple connection
const MONGODB_URI = 'mongodb://admin:password123@localhost:27017/apsicologia?authSource=admin';

// Simple schemas
const userSchema = new mongoose.Schema({}, { strict: false });
const professionalSchema = new mongoose.Schema({}, { strict: false });
const patientSchema = new mongoose.Schema({}, { strict: false });
const serviceSchema = new mongoose.Schema({}, { strict: false });
const roomSchema = new mongoose.Schema({}, { strict: false });
const appointmentSchema = new mongoose.Schema({}, { strict: false });

const User = mongoose.model('User', userSchema);
const Professional = mongoose.model('Professional', professionalSchema);
const Patient = mongoose.model('Patient', patientSchema);
const Service = mongoose.model('Service', serviceSchema);
const Room = mongoose.model('Room', roomSchema);
const Appointment = mongoose.model('Appointment', appointmentSchema);

async function seedData() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

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

    // Create services
    const services = [
      {
        name: 'Consulta Individual Adultos',
        description: 'Sesión individual de psicoterapia para adultos',
        category: 'therapy',
        duration: 50,
        price: 60.00,
        currency: 'EUR',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Terapia Infantil',
        description: 'Sesión de psicoterapia especializada para niños y adolescentes',
        category: 'therapy',
        duration: 45,
        price: 55.00,
        currency: 'EUR',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Evaluación Psicológica',
        description: 'Evaluación psicológica completa con informe',
        category: 'assessment',
        duration: 90,
        price: 120.00,
        currency: 'EUR',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
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

    // Crear 3 profesionales adicionales primero
    const professionalNames = [
      { firstName: 'Elena', lastName: 'Navarro Ruiz', title: 'Dra.', specialties: ['Terapia de Pareja', 'Sexología', 'Mediación Familiar'], experience: 15 },
      { firstName: 'Roberto', lastName: 'Morales Vega', title: 'Dr.', specialties: ['Neuropsicología', 'Rehabilitación Cognitiva', 'Demencias'], experience: 10 },
      { firstName: 'Carmen', lastName: 'Jiménez Soto', title: 'Dra.', specialties: ['Psicología Forense', 'Evaluación Pericial', 'Victimología'], experience: 18 },
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
        licenseNumber: `PSI-${2020 + i}-00${i + 3}`,
        specialties: prof.specialties,
        bio: `${prof.title} en Psicología con ${prof.experience} años de experiencia`,
        title: prof.title,
        yearsOfExperience: prof.experience,
        services: [],
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
        assignedRooms: [],
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
            conditions: [condition, ...(Math.random() > 0.6 ? [['Hipertensión', 'Diabetes tipo 2', 'Migraña', 'Asma'][Math.floor(Math.random() * 4)]] : [])],
            medications: Math.random() > 0.4 ? [
              {
                name: ['Sertralina', 'Escitalopram', 'Lorazepam', 'Diazepam', 'Alprazolam'][Math.floor(Math.random() * 5)],
                dosage: ['25mg', '50mg', '100mg', '0.5mg', '1mg'][Math.floor(Math.random() * 5)],
                frequency: ['Diaria', 'Dos veces al día', 'Según necesidad', 'Cada 12 horas'][Math.floor(Math.random() * 4)],
                prescribedBy: ['Dr. García', 'Dra. Martínez', 'Dr. López', 'Dra. Rodríguez'][Math.floor(Math.random() * 4)],
                startDate: new Date(2024, Math.floor(Math.random() * 8), Math.floor(Math.random() * 28) + 1),
                endDate: Math.random() > 0.7 ? new Date(2024, Math.floor(Math.random() * 12) + 6, Math.floor(Math.random() * 28) + 1) : undefined,
                active: Math.random() > 0.2,
                notes: Math.random() > 0.5 ? ['Tomar con alimentos', 'Evitar alcohol', 'Reducir dosis gradualmente si es necesario'][Math.floor(Math.random() * 3)] : undefined
              },
              ...(Math.random() > 0.7 ? [{
                name: ['Ibuprofeno', 'Paracetamol', 'Omeprazol'][Math.floor(Math.random() * 3)],
                dosage: ['400mg', '500mg', '20mg'][Math.floor(Math.random() * 3)],
                frequency: 'Según necesidad',
                prescribedBy: 'Médico de familia',
                startDate: new Date(2024, Math.floor(Math.random() * 6), Math.floor(Math.random() * 28) + 1),
                active: true
              }] : [])
            ] : [],
            allergies: Math.random() > 0.6 ? [
              {
                type: ['medication', 'food', 'environmental'][Math.floor(Math.random() * 3)],
                allergen: ['Penicilina', 'Frutos secos', 'Polen', 'Ácaros', 'Mariscos', 'Aspirina'][Math.floor(Math.random() * 6)],
                severity: ['mild', 'moderate', 'severe'][Math.floor(Math.random() * 3)],
                reaction: ['Erupciones cutáneas', 'Dificultad respiratoria', 'Hinchazón', 'Picor', 'Urticaria'][Math.floor(Math.random() * 5)],
                notes: Math.random() > 0.5 ? 'Paciente lleva pulsera de alerta médica' : undefined
              },
              ...(Math.random() > 0.8 ? [{
                type: 'environmental',
                allergen: 'Polvo doméstico',
                severity: 'mild',
                reaction: 'Estornudos y congestión nasal'
              }] : [])
            ] : [],
            surgeries: Math.random() > 0.8 ? [{
              procedure: ['Apendicectomía', 'Colecistectomía', 'Cirugía de rodilla', 'Cesárea'][Math.floor(Math.random() * 4)],
              date: new Date(2018 + Math.floor(Math.random() * 6), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
              hospital: ['Hospital Universitario', 'Clínica San Carlos', 'Hospital Gregorio Marañón'][Math.floor(Math.random() * 3)],
              surgeon: ['Dr. Fernández', 'Dra. Sánchez', 'Dr. Moreno'][Math.floor(Math.random() * 3)],
              notes: 'Cirugía sin complicaciones, recuperación normal'
            }] : [],
            hospitalizations: Math.random() > 0.9 ? [{
              reason: ['Neumonía', 'Crisis de ansiedad severa', 'Síncope', 'Dolor torácico'][Math.floor(Math.random() * 4)],
              admissionDate: new Date(2022 + Math.floor(Math.random() * 2), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
              dischargeDate: new Date(2022 + Math.floor(Math.random() * 2), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 3),
              hospital: ['Hospital La Paz', 'Hospital Clínico San Carlos', 'Hospital 12 de Octubre'][Math.floor(Math.random() * 3)],
              notes: 'Evolución favorable, seguimiento ambulatorio'
            }] : []
          },
          mentalHealthHistory: {
            previousTreatments: Math.random() > 0.5 ? [
              {
                type: ['therapy', 'medication', 'hospitalization'][Math.floor(Math.random() * 3)],
                provider: Math.random() > 0.5 ? ['Centro de Salud Mental', 'Psicólogo privado', 'Hospital Psiquiátrico'][Math.floor(Math.random() * 3)] : undefined,
                startDate: new Date(2020 + Math.floor(Math.random() * 3), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
                endDate: Math.random() > 0.3 ? new Date(2021 + Math.floor(Math.random() * 3), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1) : undefined,
                reason: condition,
                outcome: Math.random() > 0.5 ? ['Mejoría significativa', 'Mejoría parcial', 'Sin cambios'][Math.floor(Math.random() * 3)] : undefined,
                notes: Math.random() > 0.5 ? 'Tratamiento previo documentado' : undefined
              }
            ] : [],
            diagnoses: condition ? [{
              condition: condition,
              diagnosedBy: 'Dr. García López',
              diagnosisDate: new Date(2023, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
              icdCode: `F${Math.floor(Math.random() * 99).toString().padStart(2, '0')}.${Math.floor(Math.random() * 9)}`,
              status: ['active', 'resolved', 'in-remission', 'chronic'][Math.floor(Math.random() * 4)],
              severity: ['mild', 'moderate', 'severe'][Math.floor(Math.random() * 3)],
              notes: 'Diagnóstico confirmado tras evaluación clínica'
            }] : [],
            riskFactors: Math.random() > 0.7 ? [{
              factor: ['Estrés laboral', 'Problemas familiares', 'Duelo', 'Cambios vitales'][Math.floor(Math.random() * 4)],
              level: ['low', 'moderate', 'high'][Math.floor(Math.random() * 3)],
              notes: 'Evaluado durante entrevista inicial',
              assessedDate: new Date(),
              assessedBy: professionalId
            }] : []
          },
          currentTreatment: {
            treatmentPlan: `Plan de tratamiento cognitivo-conductual para ${condition.toLowerCase()}`,
            goals: [
              `Reducir síntomas de ${condition.toLowerCase()}`,
              'Mejorar calidad de vida',
              'Desarrollar estrategias de afrontamiento',
              ...(Math.random() > 0.5 ? ['Mejorar relaciones interpersonales', 'Incrementar autoestima'] : [])
            ],
            startDate: new Date(2024, Math.floor(Math.random() * 8), Math.floor(Math.random() * 28) + 1),
            expectedDuration: ['3 meses', '6 meses', '1 año', 'Indefinido'][Math.floor(Math.random() * 4)],
            frequency: ['Semanal', 'Quincenal', 'Mensual'][Math.floor(Math.random() * 3)],
            notes: Math.random() > 0.5 ? 'Paciente muestra motivación para el cambio' : undefined
          }
        },
        episodes: [
          {
            date: new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
            description: 'Paciente reporta episodio de ansiedad severa',
            duration: '2 horas',
            severity: 'severe',
            impact: 'alta',
            notes: 'Paciente requirió atención médica de emergencia'
          },
          ...(Math.random() > 0.7 ? [{
            date: new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
            description: 'Paciente experimenta episodio de depresión',
            duration: '3 días',
            severity: 'moderate',
            impact: 'media',
            notes: 'Paciente requirió apoyo emocional de familiares y amigos'
          }] : [])
        ],
        billing: {
          paymentMethod: Math.random() > 0.2 ? 'stripe' : 'cash',
          preferredPaymentMethod: Math.random() > 0.2 ? 'card' : 'cash',
          stripeCustomerId: Math.random() > 0.2 ? `cus_${Math.random().toString(36).substring(7)}` : undefined,
          billingNotes: ''
        },
        preferences: {
          language: 'es',
          communicationPreferences: {
            appointmentReminders: true,
            reminderMethods: ['email', 'sms'],
            reminderTiming: [24, 2],
            newsletters: Math.random() > 0.5,
            marketingCommunications: Math.random() > 0.7
          },
          appointmentPreferences: {
            preferredTimes: [{
              dayOfWeek: Math.floor(Math.random() * 5) + 1, // Lunes a Viernes
              startTime: '09:00',
              endTime: '17:00'
            }],
            preferredProfessionals: [professionalId],
            sessionFormat: ['in-person', 'video', 'any'][Math.floor(Math.random() * 3)],
            sessionDuration: [45, 50, 60][Math.floor(Math.random() * 3)],
            bufferBetweenSessions: Math.random() > 0.5 ? 15 : undefined,
            notes: Math.random() > 0.5 ? 'Preferencias de horario flexibles' : undefined
          },
          portalAccess: {
            enabled: Math.random() > 0.3,
            lastLogin: Math.random() > 0.5 ? new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000) : undefined,
            passwordLastChanged: new Date(Date.now() - Math.floor(Math.random() * 90) * 24 * 60 * 60 * 1000),
            twoFactorEnabled: Math.random() > 0.8,
            loginNotifications: true
          }
        },
        preferences: {
          language: 'es',
          communicationPreferences: {
            appointmentReminders: true,
            reminderMethods: ['email', 'sms'],
            reminderTiming: [24, 2],
            newsletters: Math.random() > 0.5,
            marketingCommunications: Math.random() > 0.7
          },
          appointmentPreferences: {
            preferredTimes: [{
              dayOfWeek: Math.floor(Math.random() * 5) + 1, // Lunes a Viernes
              startTime: '09:00',
              endTime: '17:00'
            }],
            preferredProfessionals: [professionalId],
            sessionFormat: ['in-person', 'video', 'any'][Math.floor(Math.random() * 3)],
            sessionDuration: [45, 50, 60][Math.floor(Math.random() * 3)],
            bufferBetweenSessions: Math.random() > 0.5 ? 15 : undefined,
            notes: Math.random() > 0.5 ? 'Preferencias de horario flexibles' : undefined
          },
          portalAccess: {
            enabled: Math.random() > 0.3,
            lastLogin: Math.random() > 0.5 ? new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000) : undefined,
            passwordLastChanged: new Date(Date.now() - Math.floor(Math.random() * 90) * 24 * 60 * 60 * 1000),
            twoFactorEnabled: Math.random() > 0.8,
            loginNotifications: true
          }
        },
        gdprConsent: {
          dataProcessing: {
            consented: true,
            consentDate: new Date(Date.now() - Math.floor(Math.random() * 60) * 24 * 60 * 60 * 1000),
            consentMethod: 'digital',
            consentVersion: '1.0',
            witnessedBy: professionalId,
            notes: 'Consentimiento registrado durante el proceso de registro'
          },
          marketingCommunications: {
            consented: Math.random() > 0.4,
            consentDate: Math.random() > 0.4 ? new Date(Date.now() - Math.floor(Math.random() * 60) * 24 * 60 * 60 * 1000) : undefined,
            method: 'digital'
          },
          dataSharing: {
            healthcareProfessionals: true,
            insuranceProviders: false,
            emergencyContacts: true,
            researchPurposes: Math.random() > 0.7,
            consentDate: new Date(Date.now() - Math.floor(Math.random() * 60) * 24 * 60 * 60 * 1000)
          },
          rightToErasure: {
            requested: false
          },
          dataPortability: {}
        },
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
        administrativeNotes: [],
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
        createdAt: new Date(),
        updatedAt: new Date()
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
            billingCoded: status === 'completed',
            insuranceClaimed: false
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
