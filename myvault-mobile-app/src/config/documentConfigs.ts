// src/config/documentConfigs.ts

export type DocumentType = 'id_card' | 'driving_license' | 'passport' | 'birth_certificate';

export interface DocumentConfig {
  id: string;
  type: DocumentType;
  title: string;
  storageKey: string;
  icon: string;
  addButtonText: string;
}

export const ID_CARD_CONFIG: DocumentConfig = {
  id: 'national_id',
  type: 'id_card',
  title: 'National Identity Card',
  storageKey: 'single_digital_id',
  icon: '🆔',
  addButtonText: 'Tap to add your National ID Card',
};

export const DRIVING_LICENSE_CONFIG: DocumentConfig = {
  id: 'driving_license',
  type: 'driving_license',
  title: 'Driving License',
  storageKey: 'single_driving_license',
  icon: '🚗',
  addButtonText: 'Tap to add your Driving License',
};

// Add more configs here as you create new document types
// export const PASSPORT_CONFIG: DocumentConfig = {
//   id: 'passport',
//   type: 'passport',
//   title: 'Passport',
//   storageKey: 'single_passport',
//   icon: '🛂',
//   addButtonText: 'Tap to add your Passport',
// };

export const ALL_DOCUMENT_CONFIGS: DocumentConfig[] = [
  ID_CARD_CONFIG,
  DRIVING_LICENSE_CONFIG,
];