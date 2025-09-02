// Clinical data predefined options for consistent data entry

// Medical conditions (most common in psychology practice)
export const MEDICAL_CONDITIONS = [
  'Hipertensión',
  'Diabetes',
  'Asma',
  'Artritis',
  'Migraña',
  'Ansiedad',
  'Depresión',
  'Insomnio',
  'Fibromialgia',
  'Hipotiroidismo',
  'Colesterol alto',
  'Gastritis',
  'Reflujo gastroesofágico',
  'Obesidad',
  'Síndrome del intestino irritable',
  'Apnea del sueño',
  'Osteoporosis',
  'Epilepsia',
  'Enfermedad cardiovascular',
  'Trastornos tiroideos',
] as const;

// Common allergies
export const ALLERGIES = [
  'Polen',
  'Ácaros',
  'Penicilina',
  'Aspirina',
  'Frutos secos',
  'Mariscos',
  'Látex',
  'Níquel',
  'Picaduras de insectos',
  'Pelo de animales',
  'Polvo',
  'Moho',
  'Huevos',
  'Leche',
  'Gluten',
  'Soja',
  'Sulfitos',
  'Colorantes alimentarios',
  'Perfumes',
  'Productos químicos',
] as const;

// Common medications (especially relevant for psychology practice)
export const MEDICATIONS = [
  'Paracetamol',
  'Ibuprofeno',
  'Omeprazol',
  'Simvastatina',
  'Metformina',
  'Losartán',
  'Sertralina',
  'Lorazepam',
  'Diazepam',
  'Atorvastatina',
  'Amlodipino',
  'Levotiroxina',
  'Escitalopram',
  'Paroxetina',
  'Venlafaxina',
  'Alprazolam',
  'Clonazepam',
  'Quetiapina',
  'Risperidona',
  'Aripiprazol',
  'Lamotrigina',
  'Ácido valproico',
  'Litio',
  'Melatonina',
] as const;

// Common surgical procedures
export const SURGERIES = [
  'Apendicectomía',
  'Colecistectomía',
  'Cesárea',
  'Artroscopia',
  'Cataratas',
  'Hernia inguinal',
  'Amigdalectomía',
  'Histerectomía',
  'Bypass gástrico',
  'Marcapasos',
  'Prótesis de cadera',
  'Prótesis de rodilla',
  'Cirugía cardíaca',
  'Mastectomía',
  'Prostatectomía',
  'Cirugía de columna',
  'Extracción de vesícula',
  'Cirugía de tiroides',
  'Septoplastia',
  'Cirugía de varices',
] as const;

// Mental health diagnoses (DSM-5 based, Spanish terminology)
export const MENTAL_HEALTH_DIAGNOSES = [
  'Trastorno de ansiedad generalizada',
  'Depresión mayor',
  'Trastorno bipolar',
  'TDAH',
  'Trastorno obsesivo-compulsivo',
  'Trastorno de pánico',
  'Fobia social',
  'Trastorno límite de la personalidad',
  'Trastorno de estrés postraumático',
  'Trastorno de la alimentación',
  'Esquizofrenia',
  'Trastorno esquizoafectivo',
  'Trastorno de adaptación',
  'Trastorno de ansiedad por separación',
  'Agorafobia',
  'Fobias específicas',
  'Trastorno de la personalidad narcisista',
  'Trastorno de la personalidad antisocial',
  'Trastorno del espectro autista',
  'Trastorno de déficit de atención',
  'Trastorno de conducta',
  'Trastorno negativista desafiante',
  'Mutismo selectivo',
  'Tricotilomanía',
  'Trastorno explosivo intermitente',
] as const;

// Mental health treatment approaches
export const MENTAL_HEALTH_TREATMENTS = [
  'Terapia cognitivo-conductual',
  'Terapia psicodinámica',
  'Terapia familiar',
  'Mindfulness',
  'EMDR',
  'Terapia de grupo',
  'Terapia de pareja',
  'Terapia dialéctica conductual',
  'Terapia de aceptación y compromiso',
  'Psicoterapia interpersonal',
  'Arteterapia',
  'Musicoterapia',
  'Terapia gestalt',
  'Terapia humanística',
  'Terapia sistémica',
  'Terapia narrativa',
  'Terapia breve centrada en soluciones',
  'Hipnoterapia',
  'Biofeedback',
  'Terapia de exposición',
  'Desensibilización sistemática',
  'Reestructuración cognitiva',
  'Entrenamiento en habilidades sociales',
  'Terapia de activación conductual',
] as const;

// Mental health status options
export const MENTAL_HEALTH_STATUS = {
  ACTIVE: 'active',
  STABLE: 'stable',
  IMPROVING: 'improving',
  CRITICAL: 'critical',
} as const;

// Mental health severity levels
export const MENTAL_HEALTH_SEVERITY = {
  MILD: 'mild',
  MODERATE: 'moderate',
  SEVERE: 'severe',
} as const;

// Treatment frequency options
export const TREATMENT_FREQUENCY = {
  DAILY: 'daily',
  WEEKLY: 'weekly',
  BIWEEKLY: 'biweekly',
  MONTHLY: 'monthly',
  AS_NEEDED: 'as-needed',
} as const;

// Status labels for display
export const MENTAL_HEALTH_STATUS_LABELS = {
  [MENTAL_HEALTH_STATUS.ACTIVE]: 'En tratamiento',
  [MENTAL_HEALTH_STATUS.STABLE]: 'Estable',
  [MENTAL_HEALTH_STATUS.IMPROVING]: 'Mejorando',
  [MENTAL_HEALTH_STATUS.CRITICAL]: 'Crítico',
} as const;

export const MENTAL_HEALTH_SEVERITY_LABELS = {
  [MENTAL_HEALTH_SEVERITY.MILD]: 'Leve',
  [MENTAL_HEALTH_SEVERITY.MODERATE]: 'Moderado',
  [MENTAL_HEALTH_SEVERITY.SEVERE]: 'Severo',
} as const;

export const TREATMENT_FREQUENCY_LABELS = {
  [TREATMENT_FREQUENCY.DAILY]: 'Diario',
  [TREATMENT_FREQUENCY.WEEKLY]: 'Semanal',
  [TREATMENT_FREQUENCY.BIWEEKLY]: 'Quincenal',
  [TREATMENT_FREQUENCY.MONTHLY]: 'Mensual',
  [TREATMENT_FREQUENCY.AS_NEEDED]: 'Según necesidad',
} as const;
