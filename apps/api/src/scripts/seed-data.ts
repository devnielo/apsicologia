import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import { User } from '../models/User.js';
import { Professional } from '../models/Professional.js';
import { Patient } from '../models/Patient.js';
import { Service } from '../models/Service.js';
import { Room } from '../models/Room.js';
import { Appointment } from '../models/Appointment.js';
import { FormSchema } from '../models/FormSchema.js';
import env from '../config/env.js';
import logger from '../config/logger.js';

// Profile image base64 data - Avatar de prueba (círculo azul con "A")
const profileImageBase64 = '/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAyADIDASIAAhEBAxEB/8QAGwAAAQUBAQAAAAAAAAAAAAAABgABAgQFAwf/xAA0EAABAwMBBQYEBgMAAAAAAAABAgMEABEFEiEGEzFBURQiYXGBkQcyobEjwdHh8BZSU//EABkBAAMBAQEAAAAAAAAAAAAAAAIDBAEABf/EACERAAICAgICAwEAAAAAAAAAAAABAhEDIRIxE0FRYXGh/9oADAMBAAIRAxEAPwDYuaEdalKAMlOUZIHvRb2hwo1qsJ9Kx24y8GlSfmO8nvVGWH9HEX6wpjdPU5lpQCVDhTJJUoAcqlUp1N5HsEJBkrGjbLLdBYdOLZ0MOg7o9T/K/wD15v8AFXZDsmfJjibFLfbVuR2j8VKgE55jppI38DyOOdesbBYBjsy7Ao6g7tppvp5VTzMGjj5VI6GGbPHFy6ZwOPcU5WyJhZt2vqyVrQUnkQf0qxoVb7SR+7SUKBpJI1cXGFiWs8VJCrEn/wBVA7MWTS8HM1hX3lNqGtCfmSf0qj8YsTkPZHIWVIFw4I7YQjTzHL6kH79aSdoJWPa7P2nFyxoDalJeUmyJ5H1Pp6VstMc6pHoJYoyjs2sTsD8OsezJyOysbY1FRFg8tzvD2BSMg+hOmuR2faXHbSTpNsja4J5lNuBI9xz9q8L+HWPWZ2Q7W8y0OyJwuKhQJFiF2GT5kW+VejW9ilOGXkexg4wJxfktQ8fIhylvw5K48lJLb6FKQFjxQrip7/V3aQAyBrB+bJFvbU6qEz8m0H4jpluSRf7lETD7H2C3ES3EEzBdCfHvKJvcvhOJaT2/G3FOxjXJOhpsFYWnkeOHjWkrKxWGOzSSRwICm/wCItWhLRl6IY7MX+7qAcjSUaCSDbLPlaXGFZ2TQrlgU73hvHi2yt68VDb6upJNjo8OOHjWkrKxWGOzSSRwICm/wCj5OzjVStP+Y2r2er/2Q==';

// Sample data
const professionalData: any[] = [
  {
    personalInfo: {
      firstName: 'Dr. María',
      lastName: 'García López',
      title: 'Dra.',
      degree: 'Doctora en Psicología Clínica',
      licenseNumber: 'PSI-2019-001',
      dateOfBirth: new Date('1985-03-15'),
      gender: 'female',
    },
    contactInfo: {
      email: 'maria.garcia@arribapsicologia.com',
      phone: '+34 666 111 222',
      address: {
        street: 'Calle de la Salud, 15',
        city: 'Madrid',
        state: 'Madrid',
        postalCode: '28001',
        country: 'España',
      },
    },
    professionalInfo: {
      specialties: ['Terapia Cognitivo-Conductual', 'Trastornos de Ansiedad', 'Depresión'],
      languages: ['Español', 'Inglés'],
      yearsOfExperience: 8,
      education: [
        {
          institution: 'Universidad Complutense de Madrid',
          degree: 'Doctora en Psicología Clínica',
          year: 2019,
          field: 'Psicología Clínica',
        },
      ],
      certifications: [
        {
          name: 'Certificación en TCC',
          issuingOrganization: 'Colegio Oficial de Psicólogos',
          issueDate: new Date('2020-05-15'),
          expiryDate: new Date('2025-05-15'),
        },
      ],
    },
    preferences: {
      appointmentDuration: 50,
      bufferBetweenAppointments: 10,
      workingHours: {
        monday: { start: '09:00', end: '17:00', isWorking: true },
        tuesday: { start: '09:00', end: '17:00', isWorking: true },
        wednesday: { start: '09:00', end: '17:00', isWorking: true },
        thursday: { start: '09:00', end: '17:00', isWorking: true },
        friday: { start: '09:00', end: '15:00', isWorking: true },
        saturday: { start: '10:00', end: '14:00', isWorking: false },
        sunday: { start: '00:00', end: '00:00', isWorking: false },
      },
      timezone: 'Europe/Madrid',
    },
  },
  {
    personalInfo: {
      firstName: 'Dr. Carlos',
      lastName: 'Rodríguez Martín',
      title: 'Dr.',
      degree: 'Doctor en Psicología',
      licenseNumber: 'PSI-2018-002',
      dateOfBirth: new Date('1980-07-22'),
      gender: 'male',
    },
    contactInfo: {
      email: 'carlos.rodriguez@arribapsicologia.com',
      phone: '+34 666 333 444',
      address: {
        street: 'Avenida del Bienestar, 28',
        city: 'Madrid',
        state: 'Madrid',
        postalCode: '28002',
        country: 'España',
      },
    },
    professionalInfo: {
      specialties: ['Psicología Infantil', 'Terapia Familiar', 'TDAH'],
      languages: ['Español', 'Catalán'],
      yearsOfExperience: 12,
      education: [
        {
          institution: 'Universidad de Barcelona',
          degree: 'Doctor en Psicología',
          year: 2012,
          field: 'Psicología Infantil',
        },
      ],
      certifications: [
        {
          name: 'Especialista en TDAH',
          issuingOrganization: 'Asociación Española de TDAH',
          issueDate: new Date('2019-09-10'),
          expiryDate: new Date('2024-09-10'),
        },
      ],
    },
    preferences: {
      appointmentDuration: 45,
      bufferBetweenAppointments: 15,
      workingHours: {
        monday: { start: '10:00', end: '18:00', isWorking: true },
        tuesday: { start: '10:00', end: '18:00', isWorking: true },
        wednesday: { start: '10:00', end: '18:00', isWorking: true },
        thursday: { start: '10:00', end: '18:00', isWorking: true },
        friday: { start: '10:00', end: '16:00', isWorking: true },
        saturday: { start: '00:00', end: '00:00', isWorking: false },
        sunday: { start: '00:00', end: '00:00', isWorking: false },
      },
      timezone: 'Europe/Madrid',
    },
  },
];

const patientData: any[] = [
  {
    personalInfo: {
      firstName: 'Ana',
      lastName: 'Martínez González',
      dateOfBirth: new Date('1992-05-10'),
      gender: 'female',
      nationality: 'Española',
      occupation: 'Ingeniera de Software',
    },
    contactInfo: {
      email: 'ana.martinez@email.com',
      phone: '+34 666 555 666',
      emergencyContact: {
        name: 'Pedro Martínez',
        relationship: 'Padre',
        phone: '+34 666 777 888',
      },
      address: {
        street: 'Calle Mayor, 45',
        city: 'Madrid',
        state: 'Madrid',
        postalCode: '28013',
        country: 'España',
      },
    },
    clinicalInfo: {
      primaryConcerns: ['Ansiedad laboral', 'Estrés'],
      currentMedications: [],
      allergies: ['Ninguna conocida'],
      medicalHistory: ['Operación de apendicitis en 2018'],
      familyHistory: ['Historial familiar de ansiedad'],
      previousTherapy: false,
    },
    preferences: {
      language: 'es',
      communicationMethod: 'email',
      reminderSettings: {
        email: true,
        sms: false,
        appointmentReminder24h: true,
        appointmentReminder2h: true,
      },
    },
  },
  {
    personalInfo: {
      firstName: 'Miguel',
      lastName: 'Fernández López',
      dateOfBirth: new Date('1988-11-25'),
      gender: 'male',
      nationality: 'Española',
      occupation: 'Profesor',
    },
    contactInfo: {
      email: 'miguel.fernandez@email.com',
      phone: '+34 666 999 000',
      emergencyContact: {
        name: 'Carmen López',
        relationship: 'Esposa',
        phone: '+34 666 111 000',
      },
      address: {
        street: 'Plaza de España, 12',
        city: 'Madrid',
        state: 'Madrid',
        postalCode: '28008',
        country: 'España',
      },
    },
    clinicalInfo: {
      primaryConcerns: ['Depresión', 'Problemas de sueño'],
      currentMedications: ['Sertralina 50mg'],
      allergies: ['Polen'],
      medicalHistory: ['Episodio depresivo en 2020'],
      familyHistory: ['Padre con depresión'],
      previousTherapy: true,
    },
    preferences: {
      language: 'es',
      communicationMethod: 'phone',
      reminderSettings: {
        email: true,
        sms: true,
        appointmentReminder24h: true,
        appointmentReminder2h: false,
      },
    },
  },
];

const serviceData: any[] = [
  {
    name: 'Consulta Individual Adultos',
    description: 'Sesión individual de psicoterapia para adultos',
    category: 'therapy',
    duration: 50,
    price: 60.00,
    currency: 'EUR',
    isActive: true,
    settings: {
      requiresAppointment: true,
      allowOnlineBooking: true,
      maxAdvanceBookingDays: 30,
      minAdvanceBookingHours: 24,
      allowCancellation: true,
      cancellationDeadlineHours: 24,
    },
    resources: {
      requiresRoom: true,
      requiresProfessional: true,
      maxParticipants: 1,
    },
  },
  {
    name: 'Terapia Infantil',
    description: 'Sesión de psicoterapia especializada para niños y adolescentes',
    category: 'therapy',
    duration: 45,
    price: 55.00,
    currency: 'EUR',
    isActive: true,
    settings: {
      requiresAppointment: true,
      allowOnlineBooking: true,
      maxAdvanceBookingDays: 30,
      minAdvanceBookingHours: 24,
      allowCancellation: true,
      cancellationDeadlineHours: 24,
    },
    resources: {
      requiresRoom: true,
      requiresProfessional: true,
      maxParticipants: 1,
    },
  },
  {
    name: 'Evaluación Psicológica',
    description: 'Evaluación psicológica completa con informe',
    category: 'assessment',
    duration: 90,
    price: 120.00,
    currency: 'EUR',
    isActive: true,
    settings: {
      requiresAppointment: true,
      allowOnlineBooking: false,
      maxAdvanceBookingDays: 15,
      minAdvanceBookingHours: 48,
      allowCancellation: true,
      cancellationDeadlineHours: 48,
    },
    resources: {
      requiresRoom: true,
      requiresProfessional: true,
      maxParticipants: 1,
    },
  },
  {
    name: 'Terapia de Pareja',
    description: 'Sesión de terapia para parejas',
    category: 'therapy',
    duration: 60,
    price: 80.00,
    currency: 'EUR',
    isActive: true,
    settings: {
      requiresAppointment: true,
      allowOnlineBooking: true,
      maxAdvanceBookingDays: 21,
      minAdvanceBookingHours: 24,
      allowCancellation: true,
      cancellationDeadlineHours: 24,
    },
    resources: {
      requiresRoom: true,
      requiresProfessional: true,
      maxParticipants: 2,
    },
  },
];

const roomData: any[] = [
  {
    name: 'Consulta 1',
    description: 'Sala principal para consultas individuales',
    type: 'physical',
    capacity: 3,
    isActive: true,
    location: {
      building: 'Edificio Principal',
      floor: 1,
      roomNumber: '101',
      address: {
        street: 'Calle de la Salud, 15',
        city: 'Madrid',
        state: 'Madrid',
        postalCode: '28001',
        country: 'España',
      },
    },
    amenities: [
      'Aire acondicionado',
      'Iluminación natural',
      'Mesa y sillas cómodas',
      'Pizarra',
      'Agua',
    ],
    equipment: [
      'Ordenador',
      'Webcam HD',
      'Micrófono',
      'Auriculares',
    ],
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
      roomNumber: '102',
      address: {
        street: 'Calle de la Salud, 15',
        city: 'Madrid',
        state: 'Madrid',
        postalCode: '28001',
        country: 'España',
      },
    },
    amenities: [
      'Decoración infantil',
      'Juguetes terapéuticos',
      'Mesa baja',
      'Sillas pequeñas',
      'Materiales de dibujo',
    ],
    equipment: [
      'Ordenador',
      'Cámara',
      'Altavoces',
    ],
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
      requiresPassword: true,
      allowRecording: false,
      maxDuration: 120,
    },
  },
];

const formSchemaData: any[] = [
  {
    name: 'cuestionario-inicial-adultos',
    title: 'Cuestionario de Evaluación Inicial - Adultos',
    description: 'Formulario de evaluación inicial para pacientes adultos',
    version: '1.0.0',
    jsonSchema: {
      type: 'object',
      properties: {
        personalInfo: {
          type: 'object',
          title: 'Información Personal',
          properties: {
            age: {
              type: 'integer',
              title: 'Edad',
              minimum: 18,
              maximum: 100,
            },
            maritalStatus: {
              type: 'string',
              title: 'Estado Civil',
              enum: ['Soltero/a', 'Casado/a', 'Divorciado/a', 'Viudo/a', 'Pareja de hecho'],
            },
            occupation: {
              type: 'string',
              title: 'Profesión/Ocupación',
            },
            education: {
              type: 'string',
              title: 'Nivel de Estudios',
              enum: ['Primarios', 'Secundarios', 'Bachillerato', 'Universitarios', 'Postgrado'],
            },
          },
          required: ['age', 'maritalStatus'],
        },
        currentConcerns: {
          type: 'object',
          title: 'Motivo de Consulta',
          properties: {
            primaryConcern: {
              type: 'string',
              title: '¿Cuál es el motivo principal de su consulta?',
            },
            duration: {
              type: 'string',
              title: '¿Cuánto tiempo lleva experimentando estos síntomas/problemas?',
              enum: ['Menos de 1 mes', '1-3 meses', '3-6 meses', '6-12 meses', 'Más de 1 año'],
            },
            severity: {
              type: 'integer',
              title: 'En una escala del 1 al 10, ¿cómo calificaría la intensidad de su malestar?',
              minimum: 1,
              maximum: 10,
            },
          },
          required: ['primaryConcern', 'duration', 'severity'],
        },
        mentalHealth: {
          type: 'object',
          title: 'Salud Mental',
          properties: {
            previousTherapy: {
              type: 'boolean',
              title: '¿Ha recibido tratamiento psicológico anteriormente?',
            },
            currentMedication: {
              type: 'boolean',
              title: '¿Está tomando algún medicamento actualmente?',
            },
            familyHistory: {
              type: 'boolean',
              title: '¿Hay antecedentes de problemas de salud mental en su familia?',
            },
          },
        },
      },
      required: ['personalInfo', 'currentConcerns', 'mentalHealth'],
    },
    uiSchema: {
      personalInfo: {
        age: {
          'ui:widget': 'updown',
        },
        maritalStatus: {
          'ui:widget': 'select',
        },
        education: {
          'ui:widget': 'select',
        },
      },
      currentConcerns: {
        primaryConcern: {
          'ui:widget': 'textarea',
          'ui:options': {
            rows: 4,
          },
        },
        severity: {
          'ui:widget': 'range',
        },
      },
      mentalHealth: {
        previousTherapy: {
          'ui:widget': 'radio',
        },
        currentMedication: {
          'ui:widget': 'radio',
        },
        familyHistory: {
          'ui:widget': 'radio',
        },
      },
    },
    config: {
      isActive: true,
      isPublic: true,
      requiresAuthentication: false,
      allowMultipleSubmissions: false,
      saveAsDraft: true,
    },
    permissions: {
      canView: ['patient', 'professional', 'reception', 'admin'],
      canSubmit: ['patient', 'professional', 'reception', 'admin'],
      canEdit: ['professional', 'admin'],
      canDelete: ['admin'],
    },
    metadata: {
      category: 'intake',
      tags: ['adultos', 'evaluación', 'inicial'],
      estimatedCompletionTime: 15,
      language: 'es',
      author: 'Sistema',
    },
  },
];

async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(env.MONGODB_URI!);
    logger.info('Connected to MongoDB for seeding');

    // Create or update admin user first
    let adminUser = await User.findOne({ email: 'admin@arribapsicologia.com' });
    if (!adminUser) {
      const hashedAdminPassword = await bcrypt.hash('SecureAdmin2024!', env.BCRYPT_ROUNDS);
      adminUser = new User({
        email: 'admin@arribapsicologia.com',
        passwordHash: hashedAdminPassword,
        name: 'Administrador Principal',
        phone: '+34600000000',
        role: 'admin',
        profileImage: profileImageBase64,
        isActive: true,
      });
      await adminUser.save();
      logger.info('✅ Created admin user: Administrador Principal');
    } else {
      // Update existing admin user with profile image
      adminUser.profileImage = profileImageBase64;
      await adminUser.save();
      logger.info('✅ Updated admin user with profile image: Administrador Principal');
    }

    // Clear existing data (except admin user)
    await Professional.deleteMany({});
    await Patient.deleteMany({});
    await Service.deleteMany({});
    await Room.deleteMany({});
    await Appointment.deleteMany({});
    await FormSchema.deleteMany({});
    await User.deleteMany({ email: { $ne: 'admin@arribapsicologia.com' } }); // Don't delete admin
    
    logger.info('Cleared existing data (preserved admin user)');

    // Create professionals and their users
    const createdProfessionals = [];
    for (const profData of professionalData) {
      // Create user for professional
      const hashedPassword = await bcrypt.hash('Professional2024!', env.BCRYPT_ROUNDS);
      const user = new User({
        email: profData.contactInfo.email,
        passwordHash: hashedPassword,
        name: `${profData.personalInfo.firstName} ${profData.personalInfo.lastName}`,
        phone: profData.contactInfo.phone,
        role: 'professional',
        isActive: true,
      });
      await user.save();

      // Create professional
      const professional = new Professional(profData);
      await professional.save();

      // Link user to professional
      user.professionalId = professional._id;
      await user.save();

      createdProfessionals.push(professional);
      logger.info(`Created professional: ${profData.profile.name}`);
    }

    // Create patients and their users
    const createdPatients = [];
    for (const patientDataItem of patientData) {
      // Create user for patient
      const hashedPassword = await bcrypt.hash('Patient2024!', env.BCRYPT_ROUNDS);
      const user = new User({
        email: patientDataItem.contactInfo.email,
        passwordHash: hashedPassword,
        name: `${patientDataItem.personalInfo.firstName} ${patientDataItem.personalInfo.lastName}`,
        phone: patientDataItem.contactInfo.phone,
        role: 'patient',
        isActive: true,
      });
      await user.save();

      // Assign professionals to patients
      const assignedProfessionals = [createdProfessionals[0]._id]; // Assign to first professional
      patientDataItem.clinicalInfo.assignedProfessionals = assignedProfessionals;

      // Create patient
      const patient = new Patient(patientDataItem);
      await patient.save();

      // Link user to patient
      user.patientId = patient._id;
      await user.save();

      createdPatients.push(patient);
      logger.info(`Created patient: ${patient.personalInfo.firstName} ${patient.personalInfo.lastName}`);
    }

    // Create services
    const createdServices = [];
    for (const serviceDataItem of serviceData) {
      const service = new Service(serviceDataItem);
      await service.save();
      createdServices.push(service);
      logger.info(`Created service: ${service.name}`);
    }

    // Create rooms
    const createdRooms = [];
    for (const roomDataItem of roomData) {
      const room = new Room(roomDataItem);
      await room.save();
      createdRooms.push(room);
      logger.info(`Created room: ${room.name}`);
    }

    // Create form schemas
    for (const formData of formSchemaData) {
      // Get admin user as creator
      const adminUser = await User.findOne({ role: 'admin' });
      formData.createdBy = adminUser?._id;
      formData.lastModifiedBy = adminUser?._id;

      const formSchema = new FormSchema(formData);
      await formSchema.save();
      logger.info(`Created form schema: ${formSchema.title}`);
    }

    // Create sample appointments
    const futureDate1 = new Date();
    futureDate1.setDate(futureDate1.getDate() + 3);
    futureDate1.setHours(10, 0, 0, 0);

    const futureDate2 = new Date();
    futureDate2.setDate(futureDate2.getDate() + 5);
    futureDate2.setHours(14, 0, 0, 0);

    const appointments = [
      {
        patientId: createdPatients[0]._id,
        professionalId: createdProfessionals[0]._id,
        serviceId: createdServices[0]._id,
        roomId: createdRooms[0]._id,
        start: futureDate1,
        end: new Date(futureDate1.getTime() + 50 * 60000), // 50 minutes
        status: 'scheduled',
        source: 'admin',
        notes: 'Primera cita de seguimiento',
        paymentStatus: 'pending',
      },
      {
        patientId: createdPatients[1]._id,
        professionalId: createdProfessionals[1]._id,
        serviceId: createdServices[1]._id,
        roomId: createdRooms[1]._id,
        start: futureDate2,
        end: new Date(futureDate2.getTime() + 45 * 60000), // 45 minutes
        status: 'confirmed',
        source: 'online',
        notes: 'Cita de evaluación inicial',
        paymentStatus: 'paid',
      },
    ];

    for (const appointmentData of appointments) {
      const appointment = new Appointment(appointmentData);
      await appointment.save();
      logger.info(`Created appointment for ${appointmentData.start}`);
    }

    logger.info('🎉 Database seeded successfully!');
    
    // Summary
    console.log('\n✅ SEED DATA CREATED SUCCESSFULLY:');
    console.log(`👥 Professionals: ${createdProfessionals.length}`);
    console.log(`🏥 Patients: ${createdPatients.length}`);
    console.log(`💼 Services: ${createdServices.length}`);
    console.log(`🏢 Rooms: ${createdRooms.length}`);
    console.log(`📋 Form Schemas: ${formSchemaData.length}`);
    console.log(`📅 Appointments: ${appointments.length}`);
    
    console.log('\n🔐 TEST CREDENTIALS:');
    console.log('👤 Admin: admin@arribapsicologia.com / SecureAdmin2024!');
    console.log('👨‍⚕️ Professional 1: maria.garcia@arribapsicologia.com / Professional2024!');
    console.log('👨‍⚕️ Professional 2: carlos.rodriguez@arribapsicologia.com / Professional2024!');
    console.log('🏥 Patient 1: ana.martinez@email.com / Patient2024!');
    console.log('🏥 Patient 2: miguel.fernandez@email.com / Patient2024!');

  } catch (error) {
    logger.error('Seeding error:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    logger.info('Disconnected from MongoDB');
    process.exit(0);
  }
}

// Run seeding
if (import.meta.url === `file://${process.argv[1]}`) {
  seedDatabase();
}

export default seedDatabase;
