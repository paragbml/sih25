// Offline data management for HealthATM+
export interface PatientRecord {
  id: string;
  name: string;
  age: number;
  phone: string;
  lastVisit: string;
  conditions: string[];
  medications: string[];
  vitals?: {
    bloodPressure?: string;
    temperature?: number;
    heartRate?: number;
    weight?: number;
  };
}

export interface MedicineRecord {
  id: string;
  name: string;
  genericName?: string;
  category: string;
  stock: boolean;
  pharmacy: string;
  price?: number;
  lastUpdated: string;
}

export interface ConsultationRecord {
  id: string;
  patientId: string;
  symptoms: string[];
  diagnosis?: string;
  prescription?: string[];
  followUp?: string;
  status: 'pending' | 'completed' | 'queued';
  timestamp: string;
}

// Mock data for offline functionality
export const OFFLINE_PATIENTS: PatientRecord[] = [
  {
    id: 'pat001',
    name: 'ਰਮਨਜੀਤ ਸਿੰਘ',
    age: 45,
    phone: '9876543210',
    lastVisit: '2025-01-10',
    conditions: ['ਹਾਈ ਬਲੱਡ ਪ੍ਰੈਸ਼ਰ', 'ਡਾਇਬੀਟਿਸ'],
    medications: ['Metformin', 'Amlodipine'],
    vitals: {
      bloodPressure: '140/90',
      temperature: 98.6,
      heartRate: 75,
      weight: 70
    }
  },
  {
    id: 'pat002', 
    name: 'ਸੁਰਿੰਦਰ ਕੌਰ',
    age: 38,
    phone: '9876543211',
    lastVisit: '2025-01-08',
    conditions: ['ਅਸਥਮਾ'],
    medications: ['Salbutamol Inhaler'],
    vitals: {
      temperature: 99.1,
      heartRate: 82
    }
  },
  {
    id: 'pat003',
    name: 'ਜਗਦੀਪ ਸਿੰਘ',
    age: 62,
    phone: '9876543212', 
    lastVisit: '2025-01-05',
    conditions: ['ਆਰਥਰਾਇਟਿਸ', 'ਹਾਈ ਬਲੱਡ ਪ੍ਰੈਸ਼ਰ'],
    medications: ['Diclofenac', 'Lisinopril']
  }
];

export const OFFLINE_MEDICINES: MedicineRecord[] = [
  {
    id: 'med001',
    name: 'Paracetamol',
    genericName: 'Acetaminophen',
    category: 'ਦਰਦ ਦੀ ਦਵਾਈ',
    stock: true,
    pharmacy: 'Nabha Medical Store',
    price: 15,
    lastUpdated: '2025-01-12'
  },
  {
    id: 'med002',
    name: 'Metformin',
    genericName: 'Metformin HCl',
    category: 'ਡਾਇਬੀਟਿਸ',
    stock: true,
    pharmacy: 'Punjab Pharmacy',
    price: 45,
    lastUpdated: '2025-01-11'
  },
  {
    id: 'med003',
    name: 'Amlodipine',
    genericName: 'Amlodipine Besylate',
    category: 'ਬਲੱਡ ਪ੍ਰੈਸ਼ਰ',
    stock: false,
    pharmacy: 'Village Clinic',
    price: 32,
    lastUpdated: '2025-01-10'
  },
  {
    id: 'med004',
    name: 'Aspirin',
    genericName: 'Acetylsalicylic Acid',
    category: 'ਦਰਦ ਦੀ ਦਵਾਈ',
    stock: true,
    pharmacy: 'Nabha Medical Store', 
    price: 18,
    lastUpdated: '2025-01-12'
  },
  {
    id: 'med005',
    name: 'Salbutamol Inhaler',
    genericName: 'Salbutamol Sulfate',
    category: 'ਸਾਹ ਦੀ ਬਿਮਾਰੀ',
    stock: true,
    pharmacy: 'Punjab Pharmacy',
    price: 120,
    lastUpdated: '2025-01-11'
  },
  {
    id: 'med006',
    name: 'Insulin',
    genericName: 'Human Insulin',
    category: 'ਡਾਇਬੀਟਿਸ',
    stock: true,
    pharmacy: 'District Hospital',
    price: 280,
    lastUpdated: '2025-01-09'
  }
];

// Common symptoms in Punjabi for offline triage
export const SYMPTOM_CATEGORIES = {
  'ਸਿਰ ਦਰਦ': {
    severity: ['ਹਲਕਾ', 'ਮੱਧਮ', 'ਗੰਭੀਰ'],
    duration: ['1-2 ਘੰਟੇ', '1 ਦਿਨ', '2-3 ਦਿਨ', '1 ਹਫ਼ਤੇ ਤੋਂ ਜ਼ਿਆਦਾ'],
    recommendations: {
      mild: 'ਪਾਰਾਸਿਟਾਮੋਲ ਲਓ ਅਤੇ ਆਰਾਮ ਕਰੋ',
      moderate: 'ਡਾਕਟਰ ਨਾਲ ਸਲਾਹ ਕਰੋ',
      severe: 'ਤੁਰੰਤ ਡਾਕਟਰੀ ਸਹਾਇਤਾ ਲਓ'
    }
  },
  'ਬੁਖਾਰ': {
    severity: ['99-100°F', '100-102°F', '102°F ਤੋਂ ਜ਼ਿਆਦਾ'],
    duration: ['1 ਦਿਨ', '2-3 ਦਿਨ', '3 ਦਿਨ ਤੋਂ ਜ਼ਿਆਦਾ'],
    recommendations: {
      mild: 'ਪਾਣੀ ਪੀਓ ਅਤੇ ਆਰਾਮ ਕਰੋ',
      moderate: 'ਪਾਰਾਸਿਟਾਮੋਲ ਲਓ ਅਤੇ ਮਾਨੀਟਰ ਕਰੋ',
      severe: 'ਤੁਰੰਤ ਡਾਕਟਰ ਨੂੰ ਮਿਲੋ'
    }
  },
  'ਖਾਂਸੀ': {
    severity: ['ਸੁੱਕੀ ਖਾਂਸੀ', 'ਬਲਗ਼ਮ ਨਾਲ', 'ਖੂਨ ਨਾਲ'],
    duration: ['1-2 ਦਿਨ', '1 ਹਫ਼ਤਾ', '2 ਹਫ਼ਤੇ ਤੋਂ ਜ਼ਿਆਦਾ'],
    recommendations: {
      mild: 'ਗਰਮ ਪਾਣੀ ਅਤੇ ਸ਼ਹਿਦ ਲਓ',
      moderate: 'ਖਾਂਸੀ ਦੀ ਦਵਾਈ ਲਓ',
      severe: 'ਤੁਰੰਤ ਡਾਕਟਰੀ ਜਾਂਚ ਕਰਵਾਓ'
    }
  },
  'ਪੇਟ ਦਰਦ': {
    severity: ['ਹਲਕਾ', 'ਮੱਧਮ', 'ਤੀਬਰ'],
    duration: ['30 ਮਿੰਟ', '2-3 ਘੰਟੇ', '6 ਘੰਟੇ ਤੋਂ ਜ਼ਿਆਦਾ'],
    recommendations: {
      mild: 'ਹਲਕਾ ਖਾਣਾ ਖਾਓ ਅਤੇ ਆਰਾਮ ਕਰੋ',
      moderate: 'ENO ਜਾਂ ਪੇਟ ਦੀ ਦਵਾਈ ਲਓ',
      severe: 'ਤੁਰੰਤ ਹਸਪਤਾਲ ਜਾਓ'
    }
  }
};

// Offline data management class
export class OfflineDataManager {
  private dbName = 'healthatm-offline-data';
  private version = 1;
  private db: IDBDatabase | null = null;

  constructor() {
    this.initializeDB();
  }

  private async initializeDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        this.seedInitialData();
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Create object stores
        if (!db.objectStoreNames.contains('patients')) {
          const patientStore = db.createObjectStore('patients', { keyPath: 'id' });
          patientStore.createIndex('name', 'name', { unique: false });
          patientStore.createIndex('phone', 'phone', { unique: true });
        }

        if (!db.objectStoreNames.contains('medicines')) {
          const medicineStore = db.createObjectStore('medicines', { keyPath: 'id' });
          medicineStore.createIndex('name', 'name', { unique: false });
          medicineStore.createIndex('category', 'category', { unique: false });
        }

        if (!db.objectStoreNames.contains('consultations')) {
          const consultationStore = db.createObjectStore('consultations', { keyPath: 'id' });
          consultationStore.createIndex('patientId', 'patientId', { unique: false });
          consultationStore.createIndex('status', 'status', { unique: false });
        }

        if (!db.objectStoreNames.contains('offline-queue')) {
          db.createObjectStore('offline-queue', { keyPath: 'id', autoIncrement: true });
        }
      };
    });
  }

  private async seedInitialData(): Promise<void> {
    try {
      // Seed patients
      const patientStore = this.getStore('patients', 'readwrite');
      for (const patient of OFFLINE_PATIENTS) {
        await this.addToStore(patientStore, patient);
      }

      // Seed medicines
      const medicineStore = this.getStore('medicines', 'readwrite');
      for (const medicine of OFFLINE_MEDICINES) {
        await this.addToStore(medicineStore, medicine);
      }

      console.log('Offline data seeded successfully');
    } catch (error) {
      console.error('Failed to seed offline data:', error);
    }
  }

  private getStore(storeName: string, mode: IDBTransactionMode = 'readonly'): IDBObjectStore {
    if (!this.db) {
      throw new Error('Database not initialized');
    }
    const transaction = this.db.transaction([storeName], mode);
    return transaction.objectStore(storeName);
  }

  private addToStore(store: IDBObjectStore, data: any): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = store.put(data);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Patient management
  async getPatient(id: string): Promise<PatientRecord | null> {
    return new Promise((resolve, reject) => {
      const store = this.getStore('patients');
      const request = store.get(id);
      
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  async searchPatients(query: string): Promise<PatientRecord[]> {
    return new Promise((resolve, reject) => {
      const store = this.getStore('patients');
      const request = store.getAll();
      
      request.onsuccess = () => {
        const patients = request.result.filter((patient: PatientRecord) =>
          patient.name.toLowerCase().includes(query.toLowerCase()) ||
          patient.phone.includes(query)
        );
        resolve(patients);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async addPatient(patient: PatientRecord): Promise<void> {
    const store = this.getStore('patients', 'readwrite');
    return this.addToStore(store, patient);
  }

  // Medicine management
  async searchMedicines(query: string): Promise<MedicineRecord[]> {
    return new Promise((resolve, reject) => {
      const store = this.getStore('medicines');
      const request = store.getAll();
      
      request.onsuccess = () => {
        const medicines = request.result.filter((medicine: MedicineRecord) =>
          medicine.name.toLowerCase().includes(query.toLowerCase()) ||
          medicine.category.toLowerCase().includes(query.toLowerCase())
        );
        resolve(medicines);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async getMedicinesByCategory(category: string): Promise<MedicineRecord[]> {
    return new Promise((resolve, reject) => {
      const store = this.getStore('medicines');
      const index = store.index('category');
      const request = index.getAll(category);
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async updateMedicineStock(medicineId: string, inStock: boolean): Promise<void> {
    const store = this.getStore('medicines', 'readwrite');
    const getRequest = store.get(medicineId);
    
    return new Promise((resolve, reject) => {
      getRequest.onsuccess = () => {
        const medicine = getRequest.result;
        if (medicine) {
          medicine.stock = inStock;
          medicine.lastUpdated = new Date().toISOString();
          
          const updateRequest = store.put(medicine);
          updateRequest.onsuccess = () => resolve();
          updateRequest.onerror = () => reject(updateRequest.error);
        } else {
          reject(new Error('Medicine not found'));
        }
      };
      getRequest.onerror = () => reject(getRequest.error);
    });
  }

  // Consultation management
  async addConsultation(consultation: ConsultationRecord): Promise<void> {
    const store = this.getStore('consultations', 'readwrite');
    return this.addToStore(store, consultation);
  }

  async getConsultationsByPatient(patientId: string): Promise<ConsultationRecord[]> {
    return new Promise((resolve, reject) => {
      const store = this.getStore('consultations');
      const index = store.index('patientId');
      const request = index.getAll(patientId);
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // Offline queue management
  async queueOfflineAction(action: any): Promise<void> {
    const store = this.getStore('offline-queue', 'readwrite');
    const queueItem = {
      ...action,
      timestamp: new Date().toISOString(),
      synced: false
    };
    
    return this.addToStore(store, queueItem);
  }

  async getOfflineQueue(): Promise<any[]> {
    return new Promise((resolve, reject) => {
      const store = this.getStore('offline-queue');
      const request = store.getAll();
      
      request.onsuccess = () => {
        const unsynced = request.result.filter(item => !item.synced);
        resolve(unsynced);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async markAsSynced(queueId: number): Promise<void> {
    const store = this.getStore('offline-queue', 'readwrite');
    const getRequest = store.get(queueId);
    
    return new Promise((resolve, reject) => {
      getRequest.onsuccess = () => {
        const item = getRequest.result;
        if (item) {
          item.synced = true;
          const updateRequest = store.put(item);
          updateRequest.onsuccess = () => resolve();
          updateRequest.onerror = () => reject(updateRequest.error);
        } else {
          resolve(); // Item already deleted or doesn't exist
        }
      };
      getRequest.onerror = () => reject(getRequest.error);
    });
  }
}

// Symptom assessment helper
export function assessSymptom(symptom: string, severity: string, duration: string) {
  const category = SYMPTOM_CATEGORIES[symptom];
  if (!category) {
    return {
      recommendation: 'ਡਾਕਟਰ ਨਾਲ ਸਲਾਹ ਕਰੋ',
      urgency: 'medium',
      category: 'ਅਗਿਆਤ'
    };
  }

  // Determine urgency based on severity and duration
  let urgency: 'low' | 'medium' | 'high' = 'medium';
  let recommendationKey: 'mild' | 'moderate' | 'severe' = 'moderate';

  if (severity === category.severity[0] && duration === category.duration[0]) {
    urgency = 'low';
    recommendationKey = 'mild';
  } else if (severity === category.severity[2] || duration === category.duration[2]) {
    urgency = 'high';
    recommendationKey = 'severe';
  }

  return {
    recommendation: category.recommendations[recommendationKey],
    urgency,
    category: symptom,
    severity,
    duration
  };
}

// Export singleton instance
export const offlineDataManager = new OfflineDataManager();