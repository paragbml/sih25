import React, { useState, useEffect, useRef } from 'react';
import { 
  Heart, 
  Camera, 
  MessageCircle, 
  Search, 
  Phone, 
  Video,
  Wifi,
  WifiOff,
  Volume2,
  Languages,
  User,
  Calendar,
  Stethoscope,
  Pill,
  MapPin,
  TrendingUp
} from 'lucide-react';

// Language data
const languages = {
  en: {
    title: "HealthATM+",
    subtitle: "Your Village Clinic",
    startCheckup: "Start My Health Check-Up",
    scanQR: "Scan Patient QR Code",
    symptoms: "Check Symptoms",
    teleconsult: "Talk to Doctor",
    medicines: "Find Medicines",
    metrics: "Our Impact",
    offline: "Offline Mode",
    online: "Online",
    speak: "Listen",
    switchLang: "ਪੰਜਾਬੀ",
    scanningCode: "Scanning QR Code...",
    patientInfo: "Patient Information",
    lastVisit: "Last Visit",
    symptomQuestion: "How are you feeling today?",
    excellent: "Excellent",
    good: "Good", 
    fair: "Fair",
    poor: "Poor",
    next: "Next",
    searchMedicine: "Search for medicine...",
    inStock: "In Stock",
    outOfStock: "Out of Stock",
    callDoctor: "Call Doctor",
    videoCall: "Video Call",
    messageQueue: "Message Queue",
    patientsServed: "Patients Served",
    villagesCovered: "Villages Covered",
    consultations: "Teleconsultations",
    success: "Success Rate"
  },
  pa: {
    title: "ਹੈਲਥਏਟੀਐੱਮ+",
    subtitle: "ਤੁਹਾਡਾ ਪਿੰਡ ਕਲੀਨਿਕ",
    startCheckup: "ਸਿਹਤ ਜਾਂਚ ਸ਼ੁਰੂ ਕਰੋ",
    scanQR: "ਮਰੀਜ਼ QR ਕੋਡ ਸਕੈਨ ਕਰੋ",
    symptoms: "ਲੱਛਣ ਜਾਂਚੋ",
    teleconsult: "ਡਾਕਟਰ ਨਾਲ ਗੱਲ ਕਰੋ",
    medicines: "ਦਵਾਈਆਂ ਲੱਭੋ",
    metrics: "ਸਾਡਾ ਪ੍ਰਭਾਵ",
    offline: "ਔਫਲਾਈਨ ਮੋਡ",
    online: "ਔਨਲਾਈਨ",
    speak: "ਸੁਣੋ",
    switchLang: "English",
    scanningCode: "QR ਕੋਡ ਸਕੈਨ ਕੀਤਾ ਜਾ ਰਿਹਾ ਹੈ...",
    patientInfo: "ਮਰੀਜ਼ ਦੀ ਜਾਣਕਾਰੀ",
    lastVisit: "ਆਖਰੀ ਮੁਲਾਕਾਤ",
    symptomQuestion: "ਤੁਸੀਂ ਅੱਜ ਕਿਵੇਂ ਮਹਿਸੂਸ ਕਰ ਰਹੇ ਹੋ?",
    excellent: "ਬਹੁਤ ਵਧੀਆ",
    good: "ਚੰਗਾ",
    fair: "ਠੀਕ",
    poor: "ਮਾੜਾ",
    next: "ਅਗਲਾ",
    searchMedicine: "ਦਵਾਈ ਖੋਜੋ...",
    inStock: "ਸਟਾਕ ਵਿੱਚ ਹੈ",
    outOfStock: "ਸਟਾਕ ਖਤਮ",
    callDoctor: "ਡਾਕਟਰ ਨੂੰ ਫੋਨ ਕਰੋ",
    videoCall: "ਵੀਡੀਓ ਕਾਲ",
    messageQueue: "ਸੰਦੇਸ਼ ਕਤਾਰ",
    patientsServed: "ਮਰੀਜ਼ਾਂ ਦੀ ਸੇਵਾ ਕੀਤੀ",
    villagesCovered: "ਪਿੰਡਾਂ ਵਿੱਚ ਸੇਵਾ",
    consultations: "ਟੈਲੀਕੰਸਲਟੇਸ਼ਨ",
    success: "ਸਫਲਤਾ ਦਰ"
  }
};

// Mock data for offline functionality
const mockPatientData = {
  name: "ਰਮਨਜੀਤ ਸਿੰਘ",
  age: 45,
  lastVisit: "2025-01-10",
  conditions: ["ਹਾਈ ਬਲੱਡ ਪ੍ਰੈਸ਼ਰ", "ਡਾਇਬੀਟਿਸ"]
};

const mockMedicines = [
  { name: "Paracetamol", stock: true, pharmacy: "Nabha Medical Store" },
  { name: "Metformin", stock: true, pharmacy: "Punjab Pharmacy" },
  { name: "Amlodipine", stock: false, pharmacy: "Village Clinic" },
  { name: "Aspirin", stock: true, pharmacy: "Nabha Medical Store" }
];

function App() {
  const [currentLang, setCurrentLang] = useState<'en' | 'pa'>('pa');
  const [currentSection, setCurrentSection] = useState('landing');
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isScanning, setIsScanning] = useState(false);
  const [patientData, setPatientData] = useState(null);
  const [symptomStep, setSymptomStep] = useState(0);
  const [networkSpeed, setNetworkSpeed] = useState('good');
  const [searchTerm, setSearchTerm] = useState('');
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const t = languages[currentLang];

  // Network monitoring
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Text-to-speech functionality
  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = currentLang === 'pa' ? 'pa-IN' : 'en-IN';
      window.speechSynthesis.speak(utterance);
    }
  };

  // QR Scanner simulation
  const startQRScan = async () => {
    setIsScanning(true);
    try {
      // Simulate camera access and QR scanning
      setTimeout(() => {
        setPatientData(mockPatientData);
        setIsScanning(false);
        setCurrentSection('patient-info');
      }, 3000);
    } catch (error) {
      setIsScanning(false);
      alert('Camera access denied or not available');
    }
  };

  // Symptom questions
  const symptomQuestions = [
    {
      question: t.symptomQuestion,
      options: [t.excellent, t.good, t.fair, t.poor]
    }
  ];

  // Filter medicines based on search
  const filteredMedicines = mockMedicines.filter(med =>
    med.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Main navigation
  const NavigationBar = () => (
    <nav className="bg-blue-800 text-white p-4 sticky top-0 z-50">
      <div className="flex justify-between items-center max-w-4xl mx-auto">
        <div className="flex items-center space-x-2">
          <Heart className="w-6 h-6 text-red-400" />
          <h1 className="text-lg font-bold">{t.title}</h1>
        </div>
        
        <div className="flex items-center space-x-2">
          {/* Network status */}
          <div className="flex items-center space-x-1">
            {isOnline ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
            <span className="text-xs">{isOnline ? t.online : t.offline}</span>
          </div>
          
          {/* Language switcher */}
          <button
            onClick={() => setCurrentLang(currentLang === 'en' ? 'pa' : 'en')}
            className="flex items-center space-x-1 bg-blue-700 px-2 py-1 rounded text-sm"
            aria-label="Switch language"
          >
            <Languages className="w-4 h-4" />
            <span>{t.switchLang}</span>
          </button>
        </div>
      </div>
    </nav>
  );

  // Landing section
  const LandingSection = () => (
    <section className="bg-gradient-to-b from-blue-50 to-white py-12">
      <div className="max-w-4xl mx-auto text-center px-4">
        <div className="mb-8">
          <Heart className="w-24 h-24 text-blue-600 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-gray-900 mb-2">{t.title}</h2>
          <p className="text-xl text-gray-600">{t.subtitle}</p>
        </div>
        
        <button
          onClick={() => {
            setCurrentSection('services');
            speak(t.startCheckup);
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg text-xl font-semibold flex items-center mx-auto space-x-2 min-h-12 min-w-48"
          aria-label={t.startCheckup}
        >
          <Heart className="w-6 h-6" />
          <span>{t.startCheckup}</span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              speak(t.startCheckup);
            }}
            className="ml-2 p-1"
            aria-label={t.speak}
          >
            <Volume2 className="w-5 h-5" />
          </button>
        </button>
      </div>
    </section>
  );

  // Services grid
  const ServicesSection = () => (
    <section className="py-12 bg-white">
      <div className="max-w-4xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* QR Scanner */}
          <button
            onClick={() => {
              setCurrentSection('qr-scanner');
              speak(t.scanQR);
            }}
            className="bg-green-100 hover:bg-green-200 p-6 rounded-lg text-center border border-green-300 min-h-32"
          >
            <Camera className="w-12 h-12 text-green-600 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-green-800">{t.scanQR}</h3>
            <button
              onClick={(e) => {
                e.stopPropagation();
                speak(t.scanQR);
              }}
              className="mt-2 p-1"
              aria-label={t.speak}
            >
              <Volume2 className="w-4 h-4" />
            </button>
          </button>

          {/* Symptom Checker */}
          <button
            onClick={() => {
              setCurrentSection('symptoms');
              speak(t.symptoms);
            }}
            className="bg-orange-100 hover:bg-orange-200 p-6 rounded-lg text-center border border-orange-300 min-h-32"
          >
            <Stethoscope className="w-12 h-12 text-orange-600 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-orange-800">{t.symptoms}</h3>
            <button
              onClick={(e) => {
                e.stopPropagation();
                speak(t.symptoms);
              }}
              className="mt-2 p-1"
              aria-label={t.speak}
            >
              <Volume2 className="w-4 h-4" />
            </button>
          </button>

          {/* Teleconsultation */}
          <button
            onClick={() => {
              setCurrentSection('teleconsult');
              speak(t.teleconsult);
            }}
            className="bg-blue-100 hover:bg-blue-200 p-6 rounded-lg text-center border border-blue-300 min-h-32"
          >
            <MessageCircle className="w-12 h-12 text-blue-600 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-blue-800">{t.teleconsult}</h3>
            <button
              onClick={(e) => {
                e.stopPropagation();
                speak(t.teleconsult);
              }}
              className="mt-2 p-1"
              aria-label={t.speak}
            >
              <Volume2 className="w-4 h-4" />
            </button>
          </button>

          {/* Medicine Finder */}
          <button
            onClick={() => {
              setCurrentSection('medicines');
              speak(t.medicines);
            }}
            className="bg-purple-100 hover:bg-purple-200 p-6 rounded-lg text-center border border-purple-300 min-h-32"
          >
            <Pill className="w-12 h-12 text-purple-600 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-purple-800">{t.medicines}</h3>
            <button
              onClick={(e) => {
                e.stopPropagation();
                speak(t.medicines);
              }}
              className="mt-2 p-1"
              aria-label={t.speak}
            >
              <Volume2 className="w-4 h-4" />
            </button>
          </button>
        </div>

        <div className="text-center mt-8">
          <button
            onClick={() => setCurrentSection('metrics')}
            className="bg-gray-100 hover:bg-gray-200 px-6 py-3 rounded-lg text-gray-800 font-medium"
          >
            <TrendingUp className="w-5 h-5 inline mr-2" />
            {t.metrics}
          </button>
        </div>
      </div>
    </section>
  );

  // QR Scanner section
  const QRScannerSection = () => (
    <section className="py-12 bg-gray-50 min-h-screen">
      <div className="max-w-2xl mx-auto px-4 text-center">
        <h2 className="text-2xl font-bold mb-6">{t.scanQR}</h2>
        
        {!isScanning ? (
          <div className="bg-white p-8 rounded-lg shadow-md">
            <Camera className="w-24 h-24 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-6">Point your camera at the patient's QR code</p>
            <button
              onClick={startQRScan}
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-lg text-lg font-semibold min-h-12"
            >
              Start Scanning
            </button>
          </div>
        ) : (
          <div className="bg-black rounded-lg p-8 text-white">
            <div className="w-64 h-64 mx-auto border-2 border-green-400 rounded-lg flex items-center justify-center mb-4">
              <div className="animate-pulse text-center">
                <Camera className="w-12 h-12 mx-auto mb-2" />
                <p>{t.scanningCode}</p>
              </div>
            </div>
          </div>
        )}
        
        <button
          onClick={() => setCurrentSection('services')}
          className="mt-6 text-blue-600 hover:underline"
        >
          ← Back to Services
        </button>
      </div>
    </section>
  );

  // Patient info section
  const PatientInfoSection = () => (
    <section className="py-12 bg-gray-50">
      <div className="max-w-2xl mx-auto px-4">
        <h2 className="text-2xl font-bold mb-6 text-center">{t.patientInfo}</h2>
        
        {patientData && (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center mb-4">
              <User className="w-8 h-8 text-blue-600 mr-3" />
              <div>
                <h3 className="text-xl font-semibold">{patientData.name}</h3>
                <p className="text-gray-600">Age: {patientData.age}</p>
              </div>
            </div>
            
            <div className="mb-4">
              <div className="flex items-center mb-2">
                <Calendar className="w-5 h-5 text-gray-500 mr-2" />
                <span className="font-medium">{t.lastVisit}: {patientData.lastVisit}</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium">Medical Conditions:</h4>
              {patientData.conditions.map((condition, index) => (
                <span key={index} className="inline-block bg-red-100 text-red-800 px-2 py-1 rounded text-sm mr-2">
                  {condition}
                </span>
              ))}
            </div>
            
            <div className="mt-6 space-y-3">
              <button
                onClick={() => setCurrentSection('symptoms')}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium"
              >
                Continue to Symptom Check
              </button>
            </div>
          </div>
        )}
        
        <button
          onClick={() => setCurrentSection('services')}
          className="mt-6 text-blue-600 hover:underline block mx-auto"
        >
          ← Back to Services
        </button>
      </div>
    </section>
  );

  // Symptoms section
  const SymptomsSection = () => (
    <section className="py-12 bg-gray-50">
      <div className="max-w-2xl mx-auto px-4">
        <h2 className="text-2xl font-bold mb-6 text-center">{t.symptoms}</h2>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          {symptomStep < symptomQuestions.length ? (
            <div>
              <h3 className="text-lg font-semibold mb-6">
                {symptomQuestions[symptomStep].question}
                <button
                  onClick={() => speak(symptomQuestions[symptomStep].question)}
                  className="ml-2 p-1 text-gray-500"
                  aria-label={t.speak}
                >
                  <Volume2 className="w-5 h-5" />
                </button>
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                {symptomQuestions[symptomStep].options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      speak(option);
                      setSymptomStep(symptomStep + 1);
                    }}
                    className="bg-gray-100 hover:bg-gray-200 p-4 rounded-lg text-center border min-h-16"
                  >
                    {option}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        speak(option);
                      }}
                      className="ml-2 p-1"
                      aria-label={t.speak}
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-4">Assessment Complete</h3>
              <p className="text-gray-600 mb-6">Based on your responses, we recommend speaking with a healthcare professional.</p>
              <button
                onClick={() => setCurrentSection('teleconsult')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium"
              >
                {t.teleconsult}
              </button>
            </div>
          )}
        </div>
        
        <button
          onClick={() => setCurrentSection('services')}
          className="mt-6 text-blue-600 hover:underline block mx-auto"
        >
          ← Back to Services
        </button>
      </div>
    </section>
  );

  // Teleconsultation section
  const TeleconsultSection = () => (
    <section className="py-12 bg-gray-50">
      <div className="max-w-2xl mx-auto px-4">
        <h2 className="text-2xl font-bold mb-6 text-center">{t.teleconsult}</h2>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="text-center mb-6">
            <div className="flex items-center justify-center mb-4">
              {isOnline ? <Wifi className="w-8 h-8 text-green-500" /> : <WifiOff className="w-8 h-8 text-red-500" />}
            </div>
            <p className="text-gray-600">
              Network Status: {isOnline ? 'Connected' : 'Offline'}
            </p>
          </div>

          <div className="space-y-4">
            {isOnline && networkSpeed === 'good' && (
              <button className="w-full bg-green-600 hover:bg-green-700 text-white py-4 rounded-lg flex items-center justify-center space-x-2 min-h-16">
                <Video className="w-6 h-6" />
                <span className="text-lg font-medium">{t.videoCall}</span>
              </button>
            )}
            
            {isOnline && (
              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-lg flex items-center justify-center space-x-2 min-h-16">
                <Phone className="w-6 h-6" />
                <span className="text-lg font-medium">{t.callDoctor}</span>
              </button>
            )}
            
            <button className="w-full bg-orange-600 hover:bg-orange-700 text-white py-4 rounded-lg flex items-center justify-center space-x-2 min-h-16">
              <MessageCircle className="w-6 h-6" />
              <span className="text-lg font-medium">{t.messageQueue}</span>
              <span className="text-sm opacity-80">(Offline Available)</span>
            </button>
          </div>
        </div>
        
        <button
          onClick={() => setCurrentSection('services')}
          className="mt-6 text-blue-600 hover:underline block mx-auto"
        >
          ← Back to Services
        </button>
      </div>
    </section>
  );

  // Medicines section
  const MedicinesSection = () => (
    <section className="py-12 bg-gray-50">
      <div className="max-w-2xl mx-auto px-4">
        <h2 className="text-2xl font-bold mb-6 text-center">{t.medicines}</h2>
        
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder={t.searchMedicine}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
            />
          </div>
          
          <div className="space-y-3">
            {filteredMedicines.map((medicine, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold text-lg">{medicine.name}</h3>
                    <p className="text-gray-600 flex items-center">
                      <MapPin className="w-4 h-4 mr-1" />
                      {medicine.pharmacy}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      medicine.stock
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {medicine.stock ? t.inStock : t.outOfStock}
                  </span>
                </div>
              </div>
            ))}
          </div>
          
          {filteredMedicines.length === 0 && (
            <p className="text-gray-500 text-center py-8">No medicines found</p>
          )}
        </div>
        
        <button
          onClick={() => setCurrentSection('services')}
          className="text-blue-600 hover:underline block mx-auto"
        >
          ← Back to Services
        </button>
      </div>
    </section>
  );

  // Metrics section
  const MetricsSection = () => (
    <section className="py-12 bg-blue-50">
      <div className="max-w-4xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12 text-blue-900">{t.metrics}</h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">12,000+</div>
            <p className="text-gray-600">{t.patientsServed}</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">85</div>
            <p className="text-gray-600">{t.villagesCovered}</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <div className="text-3xl font-bold text-orange-600 mb-2">5,400+</div>
            <p className="text-gray-600">{t.consultations}</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">94%</div>
            <p className="text-gray-600">{t.success}</p>
          </div>
        </div>
        
        <div className="text-center mt-12">
          <h3 className="text-xl font-semibold text-blue-900 mb-4">
            Expanding Healthcare Access Across Rural Punjab
          </h3>
          <p className="text-gray-700 max-w-2xl mx-auto">
            HealthATM+ is bridging the healthcare gap in rural communities through technology, 
            providing accessible medical services where they're needed most.
          </p>
        </div>
        
        <button
          onClick={() => setCurrentSection('services')}
          className="mt-8 text-blue-600 hover:underline block mx-auto"
        >
          ← Back to Services
        </button>
      </div>
    </section>
  );

  // Render current section
  const renderCurrentSection = () => {
    switch (currentSection) {
      case 'services': return <ServicesSection />;
      case 'qr-scanner': return <QRScannerSection />;
      case 'patient-info': return <PatientInfoSection />;
      case 'symptoms': return <SymptomsSection />;
      case 'teleconsult': return <TeleconsultSection />;
      case 'medicines': return <MedicinesSection />;
      case 'metrics': return <MetricsSection />;
      default: return <LandingSection />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <NavigationBar />
      
      <main>
        {renderCurrentSection()}
      </main>
      
      {/* Quick navigation */}
      {currentSection !== 'landing' && (
        <button
          onClick={() => setCurrentSection('landing')}
          className="fixed bottom-6 right-6 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 z-50"
          aria-label="Go to home"
        >
          <Heart className="w-6 h-6" />
        </button>
      )}
    </div>
  );
}

export default App;