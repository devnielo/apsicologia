#!/usr/bin/env tsx

import mongoose from 'mongoose';
import { User } from '../models/User.js';
import { Professional } from '../models/Professional.js';
import { Patient } from '../models/Patient.js';
import { createAdminUser } from './create-admin.js';
import seedDatabase from './seed-data.js';
import database from '../config/database.js';
import logger from '../config/logger.js';
import bcrypt from 'bcrypt';

interface InitOptions {
  skipAdmin?: boolean;
  skipSeed?: boolean;
  adminData?: {
    name: string;
    email: string;
    password: string;
    phone?: string;
  };
}

async function initializeDatabase(options: InitOptions = {}): Promise<void> {
  try {
    console.log('🚀 Initializing apsicologia Database');
    console.log('=====================================');
    
    // Connect to database
    console.log('🔧 Connecting to database...');
    await database.connect();
    console.log('✅ Database connected successfully');

    // Check if database is already initialized
    const existingUsers = await User.countDocuments();
    
    if (existingUsers > 0 && !process.env.FORCE_INIT) {
      console.log('ℹ️  Database already contains users. Skipping initialization.');
      console.log('   Use FORCE_INIT=true environment variable to force re-initialization.');
      return;
    }

    if (existingUsers > 0 && process.env.FORCE_INIT) {
      console.log('⚠️  FORCE_INIT detected. Proceeding with re-initialization...');
    }

    // Step 1: Create admin user
    if (!options.skipAdmin) {
      console.log('\n📋 Step 1: Creating admin user...');
      
      const adminData = options.adminData || {
        name: 'Administrador Principal',
        email: 'admin@arribapsicologia.com',
        password: 'SecureAdmin2024!',
        phone: '+34600000000',
      };

      let adminUser;
      try {
        adminUser = await createAdminUser(adminData);
        console.log('✅ Admin user created successfully');
      } catch (error) {
        if (error instanceof Error && error.message.includes('already exists')) {
          console.log('ℹ️  Admin user already exists, skipping...');
          // Buscar el admin existente
          adminUser = await User.findOne({ email: adminData.email });
        } else {
          throw error;
        }
      }
    } else {
      console.log('\n⏭️  Step 1: Skipping admin user creation');
    }

    // Step 2: Crear usuarios de prueba adicionales
    logger.info('👥 Creando 10 usuarios de prueba adicionales...');
    
    // Asegurar conexión a la base de datos
    await database.connect();
    
    // Datos para usuarios de prueba
    const testUsers = [
      // 3 Profesionales
      {
        name: 'Dr. Carlos Mendoza Silva',
        email: 'carlos.mendoza@arribapsicologia.com',
        phone: '+34 666 123 789',
        role: 'professional',
        password: 'Professional2024!'
      },
      {
        name: 'Dra. Ana Rodríguez López',
        email: 'ana.rodriguez@arribapsicologia.com',
        phone: '+34 666 456 123',
        role: 'professional',
        password: 'Professional2024!'
      },
      {
        name: 'Dr. Miguel Santos García',
        email: 'miguel.santos@arribapsicologia.com',
        phone: '+34 666 789 456',
        role: 'professional',
        password: 'Professional2024!'
      },
      // 7 Pacientes
      {
        name: 'María García Pérez',
        email: 'maria.garcia@email.com',
        phone: '+34 666 111 222',
        role: 'patient',
        password: 'Patient2024!'
      },
      {
        name: 'Juan Pérez Martín',
        email: 'juan.perez@email.com',
        phone: '+34 666 333 444',
        role: 'patient',
        password: 'Patient2024!'
      },
      {
        name: 'Carmen López Ruiz',
        email: 'carmen.lopez@email.com',
        phone: '+34 666 555 777',
        role: 'patient',
        password: 'Patient2024!'
      },
      {
        name: 'Pedro Martín Torres',
        email: 'pedro.martin@email.com',
        phone: '+34 666 888 999',
        role: 'patient',
        password: 'Patient2024!'
      },
      {
        name: 'Lucía Fernández Vega',
        email: 'lucia.fernandez@email.com',
        phone: '+34 666 000 111',
        role: 'patient',
        password: 'Patient2024!'
      },
      {
        name: 'Diego Ruiz Castro',
        email: 'diego.ruiz@email.com',
        phone: '+34 666 222 333',
        role: 'patient',
        password: 'Patient2024!'
      },
      {
        name: 'Sandra Torres Jiménez',
        email: 'sandra.torres@email.com',
        phone: '+34 666 444 555',
        role: 'patient',
        password: 'Patient2024!'
      }
    ];

    // Crear usuarios con validación de existencia
    let createdCount = 0;
    let skippedCount = 0;

    for (const userData of testUsers) {
      try {
        // Verificar si el usuario ya existe
        const existingUser = await User.findOne({ email: userData.email });
        
        if (existingUser) {
          logger.info(`⚠️  Usuario ya existe: ${userData.name} (${userData.email})`);
          skippedCount++;
          continue;
        }

        // Hashear contraseña
        const hashedPassword = await bcrypt.hash(userData.password, 12);

        // Crear nuevo usuario
        const newUser = new User({
          name: userData.name,
          email: userData.email,
          passwordHash: hashedPassword,
          phone: userData.phone,
          role: userData.role,
          profileImage: null, // Campo opcional para foto de perfil
          isActive: true,
          isEmailVerified: true,
          isTwoFactorEnabled: false,
          failedLoginAttempts: 0,
          preferences: {
            language: 'es',
            timezone: 'Europe/Madrid',
            notifications: {
              email: true,
              sms: false,
              push: true,
            }
          },
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        await newUser.save();
        logger.info(`✅ Usuario creado: ${userData.name} (${userData.role})`);
        createdCount++;

      } catch (error) {
        logger.error(`❌ Error creando usuario ${userData.name}:`, error);
      }
    }

    logger.info(`📊 Resumen: ${createdCount} usuarios creados, ${skippedCount} ya existían`);

    // Step 3: Crear registros Patient para usuarios con rol patient
    logger.info('🏥 Creando registros Patient para usuarios con rol patient...');
    
    // Obtener admin user para createdBy
    const adminUserForPatients = await User.findOne({ email: 'admin@arribapsicologia.com' });
    const patientUsers = await User.find({ role: 'patient' });
    let patientsCreated = 0;
    
    for (const user of patientUsers) {
      try {
        // Verificar si ya existe un registro Patient para este usuario
        const existingPatient = await Patient.findOne({ 
          $or: [
            { userId: user._id },
            { 'contactInfo.email': user.email }
          ]
        });
        
        if (existingPatient) {
          logger.info(`⚠️  Patient ya existe para usuario: ${user.name}`);
          continue;
        }

        // Crear registro Patient básico con datos más realistas
        const patientData = {
          personalInfo: {
            firstName: user.name.split(' ')[0] || 'Nombre',
            lastName: user.name.split(' ').slice(1).join(' ') || 'Apellido',
            fullName: user.name,
            dateOfBirth: new Date(1985 + Math.floor(Math.random() * 15), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
            age: 25 + Math.floor(Math.random() * 20), // Edad entre 25-45
            gender: ['male', 'female', 'prefer-not-to-say'][Math.floor(Math.random() * 3)],
            nationality: 'Española',
            maritalStatus: ['single', 'married', 'divorced'][Math.floor(Math.random() * 3)],
            occupation: ['Ingeniero', 'Médico', 'Profesor', 'Abogado', 'Comercial', 'Psicólogo'][Math.floor(Math.random() * 6)],
          },
          contactInfo: {
            email: user.email,
            phone: user.phone || `+34 6${Math.floor(Math.random() * 100000000).toString().padStart(8, '0')}`,
            preferredContactMethod: ['email', 'phone'][Math.floor(Math.random() * 2)],
            address: {
              street: `Calle ${['Mayor', 'Principal', 'Gran Vía', 'Alcalá', 'Serrano'][Math.floor(Math.random() * 5)]} ${Math.floor(Math.random() * 200) + 1}`,
              city: ['Madrid', 'Barcelona', 'Valencia', 'Sevilla'][Math.floor(Math.random() * 4)],
              postalCode: `${28000 + Math.floor(Math.random() * 1000)}`,
              state: ['Madrid', 'Barcelona', 'Valencia', 'Andalucía'][Math.floor(Math.random() * 4)],
              country: 'España',
            },
          },
          emergencyContact: {
            name: `Contacto de ${user.name.split(' ')[0]}`,
            relationship: ['Padre', 'Madre', 'Hermano', 'Cónyuge', 'Amigo'][Math.floor(Math.random() * 5)],
            phone: `+34 6${Math.floor(Math.random() * 100000000).toString().padStart(8, '0')}`,
            email: `contacto.${user.email}`,
          },
          clinicalInfo: {
            assignedProfessionals: [],
            medicalHistory: {
              conditions: [
                ['Ansiedad', 'Depresión', 'Estrés laboral', 'Trastorno del sueño', 'Fobia social'][Math.floor(Math.random() * 5)]
              ],
              medications: [],
              allergies: [],
              surgeries: [],
              hospitalizations: [],
            },
            mentalHealthHistory: {
              previousTreatments: [],
              diagnoses: [],
              riskFactors: [],
            },
            currentTreatment: {
              goals: ['Reducir ansiedad', 'Mejorar autoestima', 'Gestión del estrés'],
              startDate: new Date(),
              treatmentPlan: 'Terapia cognitivo-conductual',
              frequency: 'Semanal',
              notes: 'Paciente motivado para el tratamiento',
            },
          },
          insurance: {
            hasInsurance: Math.random() > 0.5,
            paymentMethod: ['self-pay', 'insurance'][Math.floor(Math.random() * 2)],
            primaryInsurance: {
              sessionsUsed: 0,
              authorizationRequired: false,
            },
            financialAssistance: {
              approved: false,
            },
          },
          preferences: {
            language: 'es',
            communicationPreferences: {
              appointmentReminders: true,
              reminderMethods: ['email'],
              reminderTiming: [24, 2],
              newsletters: false,
              marketingCommunications: false,
            },
            appointmentPreferences: {
              preferredTimes: [],
              preferredProfessionals: [],
              sessionFormat: ['in-person', 'video'][Math.floor(Math.random() * 2)],
              sessionDuration: 50,
            },
            portalAccess: {
              enabled: true,
              twoFactorEnabled: false,
              loginNotifications: true,
            },
          },
          gdprConsent: {
            dataProcessing: {
              consented: true,
              consentDate: new Date(),
              consentMethod: 'digital',
              consentVersion: '1.0',
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
          },
          referral: {
            source: ['self', 'physician', 'family', 'friend'][Math.floor(Math.random() * 4)],
            referralReason: 'Necesidad de apoyo psicológico',
          },
          tags: [],
          status: 'active',
          relationships: [],
          statistics: {
            totalAppointments: 0,
            completedAppointments: 0,
            cancelledAppointments: 0,
            noShowAppointments: 0,
            totalInvoiceAmount: 0,
            totalPaidAmount: 0,
          },
          episodes: [],
          administrativeNotes: [],
          userId: user._id,
          createdBy: adminUserForPatients?._id || new mongoose.Types.ObjectId(),
          version: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        const patient = new Patient(patientData);
        await patient.save();
        
        // Actualizar el usuario para linkear con el paciente
        user.patientId = patient._id;
        await user.save();
        
        logger.info(`✅ Patient creado para: ${user.name}`);
        patientsCreated++;

      } catch (error: any) {
        logger.error(`❌ Error creando Patient para ${user.name}: ${error.message}`);
        if (error.errors) {
          Object.keys(error.errors).forEach(key => {
            logger.error(`   - ${key}: ${error.errors[key].message}`);
          });
        }
      }
    }

    logger.info(`📊 Registros Patient creados: ${patientsCreated}`);

    // Mostrar resumen final
    const totalUsers = await User.countDocuments();
    const totalProfessionals = await Professional.countDocuments();
    const totalPatients = await Patient.countDocuments();
    
    console.log('\n🎉 ¡INICIALIZACIÓN COMPLETADA!');
    console.log('\n📊 RESUMEN DE LA BASE DE DATOS:');
    console.log(`   👤 Usuarios: ${totalUsers}`);
    console.log(`   👨‍⚕️ Profesionales: ${totalProfessionals}`);
    console.log(`   🏥 Pacientes: ${totalPatients}`);
    
    console.log('\n🔐 CREDENCIALES DE PRUEBA ADICIONALES:');
    console.log('👨‍⚕️ PROFESIONALES:');
    console.log('   Dr. Carlos Mendoza: carlos.mendoza@arribapsicologia.com / Professional2024!');
    console.log('   Dra. Ana Rodríguez: ana.rodriguez@arribapsicologia.com / Professional2024!');
    console.log('   Dr. Miguel Santos: miguel.santos@arribapsicologia.com / Professional2024!');
    
    console.log('\n🏥 PACIENTES:');
    console.log('   María García: maria.garcia@email.com / Patient2024!');
    console.log('   Juan Pérez: juan.perez@email.com / Patient2024!');
    console.log('   Carmen López: carmen.lopez@email.com / Patient2024!');
    console.log('   Pedro Martín: pedro.martin@email.com / Patient2024!');
    console.log('   Lucía Fernández: lucia.fernandez@email.com / Patient2024!');
    console.log('   Diego Ruiz: diego.ruiz@email.com / Patient2024!');
    console.log('   Sandra Torres: sandra.torres@email.com / Patient2024!');
    
    console.log('\n🌐 Accede a la aplicación en: http://localhost:3000');
    console.log('📋 Panel de administración: http://localhost:3000/admin');

  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    logger.error('Database initialization error:', error);
    throw error;
  } finally {
    try {
      await database.disconnect();
      console.log('✅ Database disconnected');
    } catch (error) {
      console.warn('⚠️  Warning during database disconnect:', error);
    }
  }
}

// Main execution
async function main(): Promise<void> {
  const args = process.argv.slice(2);
  
  const options: InitOptions = {
    skipAdmin: args.includes('--skip-admin'),
    skipSeed: args.includes('--skip-seed'),
  };

  // Custom admin data from environment variables
  if (process.env.ADMIN_NAME || process.env.ADMIN_EMAIL || process.env.ADMIN_PASSWORD) {
    options.adminData = {
      name: process.env.ADMIN_NAME || 'Administrador Principal',
      email: process.env.ADMIN_EMAIL || 'admin@arribapsicologia.com',
      password: process.env.ADMIN_PASSWORD || 'SecureAdmin2024!',
      phone: process.env.ADMIN_PHONE || '+34600000000',
    };
  }

  await initializeDatabase(options);
}

// Handle errors
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

// Run the script
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error('❌ Initialization failed:', error);
    process.exit(1);
  });
}

export { initializeDatabase };
export default main;
