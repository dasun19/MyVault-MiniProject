// src/config/documentConfigs.ts

export type DocumentType = 'id_card' | 'driving_license' | 'a_l_certificate' ;

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
  icon: '',
  addButtonText: 'Tap to add your National ID Card',
};

export const DRIVING_LICENSE_CONFIG: DocumentConfig = {
  id: 'driving_license',
  type: 'driving_license',
  title: 'Driving License',
  storageKey: 'single_driving_license',
  icon: '',
  addButtonText: 'Tap to add your Driving License',
};

// Add more configs here as you create new document types
export const A_L_CERTIFICATE_CONFIG: DocumentConfig = {
  id: 'a_l_certificate',
  type: 'a_l_certificate',
  title: 'G.C.E. A/L Certificate',
  storageKey: 'single_a_l_certificate',
  icon: '',
  addButtonText: 'Tap to add your G.C.E. A/L Certificate',
};

export const ALL_DOCUMENT_CONFIGS: DocumentConfig[] = [
  ID_CARD_CONFIG,
  DRIVING_LICENSE_CONFIG,
  A_L_CERTIFICATE_CONFIG,
];