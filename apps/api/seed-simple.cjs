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

    // Clear existing data
    await Appointment.deleteMany({});
    await Professional.deleteMany({});
    await Patient.deleteMany({});
    await Service.deleteMany({});
    await Room.deleteMany({});
    await User.deleteMany({});
    console.log('🗑️ Cleared existing seed data');

    // Create admin user first
    let adminUser = await User.findOne({ email: 'admin@arribapsicologia.com' });
    if (!adminUser) {
      const hashedAdminPassword = await bcrypt.hash('SecureAdmin2024!', 12);
      adminUser = new User({
        email: 'admin@arribapsicologia.com',
        passwordHash: hashedAdminPassword,
        name: 'Administrador Principal',
        phone: '+34600000000',
        role: 'admin',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      await adminUser.save();
      console.log('✅ Created admin user: Administrador Principal');
    } else {
      console.log('ℹ️ Admin user already exists: Administrador Principal');
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

    // Crear 30 pacientes adicionales
    const additionalPatients = [];
    const firstNames = ['Carlos', 'María', 'José', 'Carmen', 'Antonio', 'Isabel', 'Manuel', 'Pilar', 'Francisco', 'Dolores', 'David', 'Teresa', 'Jesús', 'Ana', 'Javier', 'Cristina', 'Daniel', 'Marta', 'Rafael', 'Laura', 'Fernando', 'Silvia', 'Sergio', 'Patricia', 'Alejandro', 'Beatriz', 'Pablo', 'Rocío', 'Adrián', 'Natalia'];
    const lastNames = ['García', 'Rodríguez', 'González', 'Fernández', 'López', 'Martínez', 'Sánchez', 'Pérez', 'Gómez', 'Martín', 'Jiménez', 'Ruiz', 'Hernández', 'Díaz', 'Moreno', 'Muñoz', 'Álvarez', 'Romero', 'Alonso', 'Gutiérrez', 'Navarro', 'Torres', 'Domínguez', 'Vázquez', 'Ramos', 'Gil', 'Ramírez', 'Serrano', 'Blanco', 'Suárez'];
    const cities = ['Madrid', 'Barcelona', 'Valencia', 'Sevilla', 'Zaragoza', 'Málaga', 'Murcia', 'Palma', 'Las Palmas', 'Bilbao'];
    const conditions = ['Ansiedad', 'Depresión', 'Estrés', 'Insomnio', 'Fobias', 'TOC', 'TDAH', 'Trastorno bipolar'];
    const occupations = ['Ingeniero', 'Profesor', 'Médico', 'Abogado', 'Comercial', 'Administrativo', 'Enfermero', 'Psicólogo', 'Contador', 'Diseñador'];

    for (let i = 0; i < 30; i++) {
      const firstName = firstNames[i];
      const lastName = lastNames[i];
      const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i + 3}@email.com`;
      const phone = `+34 6${String(Math.floor(Math.random() * 100000000)).padStart(8, '0')}`;
      const city = cities[i % cities.length];
      const condition = conditions[i % conditions.length];
      const occupation = occupations[i % occupations.length];
      const birthYear = 1970 + Math.floor(Math.random() * 35);
      const gender = i % 2 === 0 ? 'male' : 'female';
      const professionalId = i % 2 === 0 ? professional1._id : professional2._id;
      
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
          maritalStatus: ['single', 'married', 'divorced'][Math.floor(Math.random() * 3)],
          occupation: occupation
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
            conditions: [condition],
            medications: Math.random() > 0.5 ? [{
              name: ['Sertralina', 'Escitalopram', 'Lorazepam', 'Diazepam'][Math.floor(Math.random() * 4)],
              dosage: ['25mg', '50mg', '100mg'][Math.floor(Math.random() * 3)],
              frequency: 'Diaria',
              startDate: new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
              active: true
            }] : [],
            allergies: Math.random() > 0.7 ? [{
              name: ['Polen', 'Ácaros', 'Penicilina'][Math.floor(Math.random() * 3)],
              severity: ['mild', 'moderate', 'severe'][Math.floor(Math.random() * 3)],
              reaction: 'Reacción alérgica'
            }] : [],
            surgeries: [],
            hospitalizations: []
          },
          mentalHealthHistory: {
            previousTreatments: Math.random() > 0.6 ? [{
              type: 'therapy',
              startDate: new Date(2023, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
              endDate: new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
              reason: condition,
              outcome: ['Mejoría', 'Mejoría parcial', 'Sin cambios'][Math.floor(Math.random() * 3)]
            }] : [],
            diagnoses: [],
            riskFactors: []
          },
          currentTreatment: {
            goals: [`Reducir síntomas de ${condition.toLowerCase()}`, 'Mejorar calidad de vida'],
            startDate: new Date()
          }
        },
        episodes: [],
        insurance: {
          hasInsurance: Math.random() > 0.3,
          paymentMethod: Math.random() > 0.5 ? 'insurance' : 'private'
        },
        preferences: {
          language: 'es',
          communicationPreferences: {
            appointmentReminders: true,
            reminderMethods: ['email', 'sms'],
            reminderTiming: [24, 2],
            newsletters: Math.random() > 0.5,
            marketingCommunications: Math.random() > 0.7
          }
        },
        gdprConsent: {
          hasConsented: true,
          consentDate: new Date(),
          consentVersion: '1.0'
        },
        tags: [condition.toLowerCase()],
        status: 'active',
        notes: [],
        relationships: [],
        referrals: [],
        statistics: {
          totalAppointments: Math.floor(Math.random() * 10),
          completedAppointments: Math.floor(Math.random() * 8),
          cancelledAppointments: Math.floor(Math.random() * 2),
          noShowAppointments: Math.floor(Math.random() * 2),
          totalPayments: Math.floor(Math.random() * 1000),
          outstandingBalance: Math.floor(Math.random() * 200)
        },
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
    
    // Crear citas para aproximadamente 60% de los pacientes
    const patientsWithHistory = allPatients.slice(0, Math.floor(allPatients.length * 0.6));
    
    for (const patient of patientsWithHistory) {
      const numAppointments = Math.floor(Math.random() * 8) + 1; // 1-8 citas por paciente
      const assignedProfessional = patient.clinicalInfo.assignedProfessionals[0];
      const professional = professionals.find(p => p._id.equals(assignedProfessional));
      
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
        const hasInsurance = patient.insurance?.hasInsurance;
        const insuranceAmount = hasInsurance ? basePrice * 0.7 : 0;
        const copayAmount = hasInsurance ? basePrice * 0.3 : 0;
        const totalAmount = hasInsurance ? copayAmount : basePrice;

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
            insuranceAmount: insuranceAmount,
            insuranceProvider: hasInsurance ? 'Sanitas' : undefined,
            copayAmount: copayAmount,
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
            insuranceClaimed: status === 'completed' && hasInsurance
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
      
      const stats = {
        totalAppointments: patientAppointments.length,
        completedAppointments: patientAppointments.filter(apt => apt.status === 'completed').length,
        cancelledAppointments: patientAppointments.filter(apt => apt.status === 'cancelled').length,
        noShowAppointments: patientAppointments.filter(apt => apt.status === 'no_show').length,
        totalPayments: patientAppointments
          .filter(apt => apt.paymentStatus === 'paid')
          .reduce((sum, apt) => sum + apt.pricing.totalAmount, 0),
        outstandingBalance: patientAppointments
          .filter(apt => apt.paymentStatus === 'pending')
          .reduce((sum, apt) => sum + apt.pricing.totalAmount, 0)
      };
      
      await Patient.findByIdAndUpdate(patient._id, { statistics: stats });
    }

    console.log('\n🎉 SEED DATA CREATED SUCCESSFULLY!');
    console.log('👥 Professionals: 2');
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
