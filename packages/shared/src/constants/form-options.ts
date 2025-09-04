export const COUNTRIES = [
  { value: 'ES', label: 'España' },
  { value: 'PT', label: 'Portugal' },
  { value: 'FR', label: 'Francia' },
  { value: 'IT', label: 'Italia' },
  { value: 'DE', label: 'Alemania' },
  { value: 'UK', label: 'Reino Unido' },
  { value: 'US', label: 'Estados Unidos' },
  { value: 'CA', label: 'Canadá' },
  { value: 'AR', label: 'Argentina' },
  { value: 'BR', label: 'Brasil' },
  { value: 'CL', label: 'Chile' },
  { value: 'CO', label: 'Colombia' },
  { value: 'MX', label: 'México' },
  { value: 'PE', label: 'Perú' },
  { value: 'VE', label: 'Venezuela' },
  { value: 'UY', label: 'Uruguay' },
  { value: 'EC', label: 'Ecuador' },
  { value: 'BO', label: 'Bolivia' },
  { value: 'PY', label: 'Paraguay' },
  { value: 'OTHER', label: 'Otro' },
] as const;

export const SPAIN_PROVINCES = [
  { value: 'A_CORUNA', label: 'A Coruña' },
  { value: 'ALAVA', label: 'Álava' },
  { value: 'ALBACETE', label: 'Albacete' },
  { value: 'ALICANTE', label: 'Alicante' },
  { value: 'ALMERIA', label: 'Almería' },
  { value: 'ASTURIAS', label: 'Asturias' },
  { value: 'AVILA', label: 'Ávila' },
  { value: 'BADAJOZ', label: 'Badajoz' },
  { value: 'BARCELONA', label: 'Barcelona' },
  { value: 'BURGOS', label: 'Burgos' },
  { value: 'CACERES', label: 'Cáceres' },
  { value: 'CADIZ', label: 'Cádiz' },
  { value: 'CANTABRIA', label: 'Cantabria' },
  { value: 'CASTELLON', label: 'Castellón' },
  { value: 'CEUTA', label: 'Ceuta' },
  { value: 'CIUDAD_REAL', label: 'Ciudad Real' },
  { value: 'CORDOBA', label: 'Córdoba' },
  { value: 'CUENCA', label: 'Cuenca' },
  { value: 'GIRONA', label: 'Girona' },
  { value: 'GRANADA', label: 'Granada' },
  { value: 'GUADALAJARA', label: 'Guadalajara' },
  { value: 'GUIPUZCOA', label: 'Guipúzcoa' },
  { value: 'HUELVA', label: 'Huelva' },
  { value: 'HUESCA', label: 'Huesca' },
  { value: 'ISLAS_BALEARES', label: 'Islas Baleares' },
  { value: 'JAEN', label: 'Jaén' },
  { value: 'LA_RIOJA', label: 'La Rioja' },
  { value: 'LAS_PALMAS', label: 'Las Palmas' },
  { value: 'LEON', label: 'León' },
  { value: 'LLEIDA', label: 'Lleida' },
  { value: 'LUGO', label: 'Lugo' },
  { value: 'MADRID', label: 'Madrid' },
  { value: 'MALAGA', label: 'Málaga' },
  { value: 'MELILLA', label: 'Melilla' },
  { value: 'MURCIA', label: 'Murcia' },
  { value: 'NAVARRA', label: 'Navarra' },
  { value: 'OURENSE', label: 'Ourense' },
  { value: 'PALENCIA', label: 'Palencia' },
  { value: 'PONTEVEDRA', label: 'Pontevedra' },
  { value: 'SALAMANCA', label: 'Salamanca' },
  { value: 'SANTA_CRUZ_DE_TENERIFE', label: 'Santa Cruz de Tenerife' },
  { value: 'SEGOVIA', label: 'Segovia' },
  { value: 'SEVILLA', label: 'Sevilla' },
  { value: 'SORIA', label: 'Soria' },
  { value: 'TARRAGONA', label: 'Tarragona' },
  { value: 'TERUEL', label: 'Teruel' },
  { value: 'TOLEDO', label: 'Toledo' },
  { value: 'VALENCIA', label: 'Valencia' },
  { value: 'VALLADOLID', label: 'Valladolid' },
  { value: 'VIZCAYA', label: 'Vizcaya' },
  { value: 'ZAMORA', label: 'Zamora' },
  { value: 'ZARAGOZA', label: 'Zaragoza' },
] as const;

export const GENDER_OPTIONS = [
  { value: 'male', label: 'Masculino' },
  { value: 'female', label: 'Femenino' },
  { value: 'non-binary', label: 'No binario' },
  { value: 'other', label: 'Otro' },
  { value: 'prefer-not-to-say', label: 'Prefiero no decir' },
] as const;

export const OCCUPATION_OPTIONS = [
  { value: 'student', label: 'Estudiante' },
  { value: 'employed', label: 'Empleado/a' },
  { value: 'self_employed', label: 'Autónomo/a' },
  { value: 'unemployed', label: 'Desempleado/a' },
  { value: 'retired', label: 'Jubilado/a' },
  { value: 'homemaker', label: 'Ama/o de casa' },
  { value: 'healthcare', label: 'Sanitario/a' },
  { value: 'education', label: 'Educación' },
  { value: 'technology', label: 'Tecnología' },
  { value: 'business', label: 'Negocio/Empresarial' },
  { value: 'arts', label: 'Arte/Cultura' },
  { value: 'service', label: 'Servicios' },
  { value: 'other', label: 'Otro' },
] as const;

export const MARITAL_STATUS_OPTIONS = [
  { value: 'single', label: 'Soltero/a' },
  { value: 'married', label: 'Casado/a' },
  { value: 'divorced', label: 'Divorciado/a' },
  { value: 'widowed', label: 'Viudo/a' },
  { value: 'separated', label: 'Separado/a' },
  { value: 'domestic_partnership', label: 'Pareja de hecho' },
  { value: 'other', label: 'Otro' },
] as const;

export const EMERGENCY_CONTACT_RELATIONSHIP_OPTIONS = [
  { value: 'parent', label: 'Padre/Madre' },
  { value: 'spouse', label: 'Cónyuge' },
  { value: 'partner', label: 'Pareja' },
  { value: 'sibling', label: 'Hermano/a' },
  { value: 'child', label: 'Hijo/a' },
  { value: 'friend', label: 'Amigo/a' },
  { value: 'relative', label: 'Familiar' },
  { value: 'guardian', label: 'Tutor/a' },
  { value: 'other', label: 'Otro' },
] as const;

export const PAYMENT_METHOD_OPTIONS = [
  { value: 'cash', label: 'Efectivo' },
  { value: 'card', label: 'Tarjeta' },
  { value: 'transfer', label: 'Transferencia' },
  { value: 'online', label: 'Pago online' },
] as const;

export const PATIENT_STATUS_OPTIONS = [
  { value: 'active', label: 'Activo' },
  { value: 'inactive', label: 'Inactivo' },
  { value: 'discharged', label: 'Dado de alta' },
  { value: 'transferred', label: 'Transferido' },
  { value: 'any', label: 'Cualquiera' },
] as const;

export const SESSION_FORMAT_OPTIONS = [
  { value: 'in-person', label: 'Presencial' },
  { value: 'video', label: 'Video' },
  { value: 'phone', label: 'Teléfono' },
  { value: 'any', label: 'Cualquiera' },
] as const;

// Type helpers
export type CountryCode = typeof COUNTRIES[number]['value'];
export type ProvinceCode = typeof SPAIN_PROVINCES[number]['value'];
export type GenderOption = typeof GENDER_OPTIONS[number]['value'];
export type OccupationOption = typeof OCCUPATION_OPTIONS[number]['value'];
export type MaritalStatusOption = typeof MARITAL_STATUS_OPTIONS[number]['value'];
export type EmergencyContactRelationship = typeof EMERGENCY_CONTACT_RELATIONSHIP_OPTIONS[number]['value'];
export type PaymentMethodOption = typeof PAYMENT_METHOD_OPTIONS[number]['value'];
export type PatientStatusOption = typeof PATIENT_STATUS_OPTIONS[number]['value'];
export type SessionFormatOption = typeof SESSION_FORMAT_OPTIONS[number]['value'];

// Clinical data suggestions
export const COMMON_CONCERNS = [
  'Ansiedad',
  'Depresión',
  'Estrés',
  'Insomnio',
  'Ataques de pánico',
  'Fobias',
  'Trastornos alimentarios',
  'Problemas de autoestima',
  'Duelo',
  'Problemas de pareja',
  'Problemas familiares',
  'Adicciones',
  'Trastorno bipolar',
  'TOC (Trastorno Obsesivo Compulsivo)',
  'TEPT (Trastorno de Estrés Postraumático)',
  'TDAH',
  'Problemas de conducta',
  'Burnout',
  'Trastornos de personalidad'
] as const;

export const COMMON_MEDICATIONS = [
  'Sertralina',
  'Paroxetina',
  'Fluoxetina',
  'Escitalopram',
  'Venlafaxina',
  'Duloxetina',
  'Mirtazapina',
  'Bupropión',
  'Alprazolam',
  'Lorazepam',
  'Diazepam',
  'Clonazepam',
  'Quetiapina',
  'Risperidona',
  'Aripiprazol',
  'Lamotrigina',
  'Valproato',
  'Litio',
  'Metilfenidato',
  'Atomoxetina'
] as const;

export const COMMON_ALLERGIES = [
  'Penicilina',
  'Aspirina',
  'Ibuprofeno',
  'Frutos secos',
  'Mariscos',
  'Huevos',
  'Leche',
  'Gluten',
  'Soja',
  'Látex',
  'Polen',
  'Ácaros del polvo',
  'Pelo de animales',
  'Sulfamidas',
  'Contraste radiológico',
  'Anestésicos locales',
  'Codeína',
  'Morfina'
] as const;
