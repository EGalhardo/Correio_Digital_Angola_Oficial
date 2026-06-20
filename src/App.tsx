/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Loader2, Scan, Mail, QrCode, Users, User, Shield, ShieldAlert, Lock, Fingerprint, Smartphone, Key, ShieldCheck, Camera, Wifi, WifiOff, Database, RefreshCw, Signal, AlertTriangle, X, Mic, ArrowLeft, Check, CheckCircle, IdCard, UserPlus, ChevronRight, Lightbulb } from 'lucide-react';

// Components
import {
  Sidebar,
  MobileNavBar,
  Header,
  AIChatAssistant,
  NotificationDropdown,
  NotificationsCenterContent,
  ActivityCenterContent,
  AddContactModal,
  DeleteContactModal,
  InviteConfirmModal,
  HomeContent,
  MailContent,
  DocumentsContent,
  WalletContent,
  ContactsContent,
  ProfileContent,
  MessageDetail,
  DocumentDetail,
  GovDashboard,
  GovEmissaoContent,
  GovDocsContent,
  GovInteroperabilidadeContent,
  GovContactsContent,
  GovPerfilContent,
  GovSegurancaContent,
  GovRelatorioContent,
  GovCorrespondenciasContent,
  PastaDigitalContent,
  SolicitarDocumentoContent,
  RegisterStepper,
  VoiceGuideAssistant,
  InstitutionDetail,
  InstQrCodeContent,
  InstAiAssistantContent,
  GovIaContent,
  NotificationDetailModal,
  VideoSessionPage,
} from './components';

// UI Components
import { LazyImage } from './components/ui/LazyImage';

// Constants & Types
import { 
  INBOX, 
  INSTITUTIONAL_INBOX,
  SENT_MESSAGES, 
  DOCUMENTS, 
  INITIAL_CONTACTS, 
  HIGHLIGHT_SLIDES,
  NOTIFICATIONS,
} from './constants/data';
import { 
  MOCK_USER_REQUESTS, 
  MOCK_DOC_REQUESTS, 
  MOCK_AUDIT_LOGS, 
  MOCK_GOV_CORRESPONDENCES,
  MOCK_SESSION_USER
} from './constants/mocks';
import { Message, Document, Contact, AppNotification, AppMode, UserRequest, DocRequest, Correspondence, LanguageCode } from './types';
import { ensureProtocolOnMessage, ensureProtocolOnDocument, generateProtocol } from './utils/protocolGenerator';
import { OfflineManager, OfflineAction } from './utils/offlineManager';
import { supabaseService, hasValidSupabaseKeys, resolveInstitutionCode, resolveCitizenBi } from './services/supabaseService';
import { supabase } from './lib/supabaseClient';
import { useSession } from './services/sessionStore';
import { VideoSessionService } from './services/videoSessionService';
import { useLanguage } from './hooks/useLanguage';
import { startImagePreloading, subscribeToPreload } from './utils/imagePreloader';
import { shouldAutoSeedSupabase, shouldUseLocalBootstrap, shouldUseMockFallback } from './config/runtime';


export default function App() {
  const { currentLanguage, setCurrentLanguage, t } = useLanguage();

  const [stage, setStage] = useState(() => {
    if (localStorage.getItem('skip_splash_and_show_login') === 'true') {
      localStorage.removeItem('skip_splash_and_show_login');
      return 'login';
    }
    return 'splash';
  });
  const [triggerRefetch, setTriggerRefetch] = useState(0);
  const [tab, setTab] = useState('home');
  const [selectedInstitution, setSelectedInstitution] = useState<string | null>(null);
  const [showAccessModal, setShowAccessModal] = useState(false);
  const [accessModalTitle, setAccessModalTitle] = useState('');
  const [accessModalMessage, setAccessModalMessage] = useState('');
  
  // Persisted States
  const [userRequests, setUserRequests] = useState<UserRequest[]>(() => {
    if (shouldUseLocalBootstrap()) {
      const saved = localStorage.getItem('gov_user_requests');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error('Failed to parse gov_user_requests:', e);
        }
      }
    }
    return shouldUseMockFallback() ? [...MOCK_USER_REQUESTS] : [];
  });

  const [inbox, setInbox] = useState<Message[]>(() => {
    const baseItems = shouldUseMockFallback() ? [...INBOX] : [];
    if (!shouldUseLocalBootstrap()) {
      return baseItems.map(ensureProtocolOnMessage);
    }
    const saved = localStorage.getItem('correio_digital_inbox');
    let items: Message[] = [];
    if (!saved) {
      items = baseItems;
    } else {
      try {
        const parsed = JSON.parse(saved);
        const existingIds = new Set(parsed.map((m: any) => m.id));
        const newItems = baseItems.filter(m => !existingIds.has(m.id));
        items = [...parsed, ...newItems];
      } catch (e) {
        items = baseItems;
      }
    }
    return items.map(ensureProtocolOnMessage);
  });

  const [docInbox, setDocInbox] = useState<Message[]>(() => {
    const baseItems = shouldUseMockFallback() ? [...INBOX].map(m => ({ ...m, id: m.id + 10000 })) : [];
    if (!shouldUseLocalBootstrap()) {
      return baseItems.map(ensureProtocolOnMessage);
    }
    const saved = localStorage.getItem('documentos_digital_inbox');
    let items: Message[] = [];
    if (!saved) {
      items = baseItems;
    } else {
      try {
        const parsed = JSON.parse(saved);
        const existingIds = new Set(parsed.map((m: any) => m.id));
        const newItems = baseItems.filter(m => !existingIds.has(m.id));
        items = [...parsed, ...newItems];
      } catch (e) {
        items = baseItems;
      }
    }
    return items.map(ensureProtocolOnMessage);
  });

  const [instInbox, setInstInbox] = useState<Message[]>(() => {
    const baseItems = shouldUseMockFallback() ? [...INSTITUTIONAL_INBOX] : [];
    if (!shouldUseLocalBootstrap()) {
      return baseItems.map(ensureProtocolOnMessage).filter(m => m.id !== 1003);
    }
    const saved = localStorage.getItem('correio_digital_inst_inbox');
    let items: Message[] = [];
    if (!saved) {
      items = baseItems;
    } else {
      try {
        const parsed = JSON.parse(saved);
        const existingIds = new Set(parsed.map((m: any) => m.id));
        const newItems = baseItems.filter(m => !existingIds.has(m.id));
        items = [...parsed, ...newItems];
      } catch (e) {
        items = baseItems;
      }
    }
    return items.map(ensureProtocolOnMessage).filter(m => m.id !== 1003);
  });

  const [instDocInbox, setInstDocInbox] = useState<Message[]>(() => {
    const baseItems = shouldUseMockFallback() ? [...INSTITUTIONAL_INBOX].map(m => ({ ...m, id: m.id + 10000 })) : [];
    if (!shouldUseLocalBootstrap()) {
      return baseItems.map(ensureProtocolOnMessage).filter(m => m.id !== 10003 && m.id !== 1003);
    }
    const saved = localStorage.getItem('documentos_digital_inst_inbox');
    let items: Message[] = [];
    if (!saved) {
      items = baseItems;
    } else {
      try {
        const parsed = JSON.parse(saved);
        const existingIds = new Set(parsed.map((m: any) => m.id));
        const newItems = baseItems.filter(m => !existingIds.has(m.id));
        items = [...parsed, ...newItems];
      } catch (e) {
        items = baseItems;
      }
    }
    return items.map(ensureProtocolOnMessage).filter(m => m.id !== 10003 && m.id !== 1003);
  });
  
  const [sentMessages, setSentMessages] = useState<Message[]>(() => {
    const baseItems = shouldUseMockFallback() ? [...SENT_MESSAGES] : [];
    if (!shouldUseLocalBootstrap()) {
      return baseItems.map(ensureProtocolOnMessage);
    }
    const saved = localStorage.getItem('correio_digital_sent');
    let items = baseItems;
    if (saved) {
      try {
        items = JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse correio_digital_sent:', e);
      }
    }
    return items.map(ensureProtocolOnMessage);
  });

  const [docSentMessages, setDocSentMessages] = useState<Message[]>(() => {
    const baseItems = shouldUseMockFallback() ? [...SENT_MESSAGES].map(m => ({ ...m, id: m.id + 10000 })) : [];
    if (!shouldUseLocalBootstrap()) {
      return baseItems.map(ensureProtocolOnMessage);
    }
    const saved = localStorage.getItem('documentos_digital_sent');
    let items = baseItems;
    if (saved) {
      try {
        items = JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse documentos_digital_sent:', e);
      }
    }
    return items.map(ensureProtocolOnMessage);
  });

  const [deletedMessageIds, setDeletedMessageIds] = useState<number[]>(() => {
    const saved = localStorage.getItem('correio_digital_deleted_message_ids');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse correio_digital_deleted_message_ids:', e);
      }
    }
    return [12];
  });

  useEffect(() => {
    localStorage.setItem('correio_digital_deleted_message_ids', JSON.stringify(deletedMessageIds));
  }, [deletedMessageIds]);

  const handleDeleteMessage = (id: number) => {
    if (!deletedMessageIds.includes(id)) {
      setDeletedMessageIds([...deletedMessageIds, id]);
      const baseId = id >= 10000 ? id - 10000 : id;
      if (isOnline && hasValidSupabaseKeys()) {
        supabaseService.updateMessageState(baseId, { state_indicator: 'Arquivada' }).catch(() => {});
        supabaseService.insertMessageStateEvent({
          messageId: baseId,
          state: 'Arquivada',
          responsible: user.name,
          description: 'Correspondência arquivada pelo utilizador no portal.'
        }).catch(() => {});
      }
    }
  };

  const handleRestoreMessage = (id: number) => {
    setDeletedMessageIds(deletedMessageIds.filter(mid => mid !== id));
    const baseId = id >= 10000 ? id - 10000 : id;
    if (isOnline && hasValidSupabaseKeys()) {
      supabaseService.updateMessageState(baseId, { state_indicator: 'Ativa' }).catch(() => {});
      supabaseService.insertMessageStateEvent({
        messageId: baseId,
        state: 'Restaurada',
        responsible: user.name,
        description: 'Correspondência restaurada do arquivo.'
      }).catch(() => {});
    }
  };

  const [contacts, setContacts] = useState<Contact[]>(() => {
    if (shouldUseLocalBootstrap()) {
      const saved = localStorage.getItem('correio_digital_contacts');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error('Failed to parse correio_digital_contacts:', e);
        }
      }
    }
    return shouldUseMockFallback() ? [...INITIAL_CONTACTS] : [];
  });

  const [documents, setDocuments] = useState<Document[]>(() => {
    const baseItems = shouldUseMockFallback() ? [...DOCUMENTS] : [];
    if (!shouldUseLocalBootstrap()) {
      return baseItems.map(ensureProtocolOnDocument);
    }
    const saved = localStorage.getItem('correio_digital_documents');
    let items = baseItems;
    if (saved) {
      try {
        items = JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse correio_digital_documents:', e);
      }
    }
    return items.map(ensureProtocolOnDocument);
  });

  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    if (shouldUseLocalBootstrap()) {
      const saved = localStorage.getItem('correio_digital_notifications');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error('Failed to parse correio_digital_notifications:', e);
        }
      }
    }
    return shouldUseMockFallback() ? [...NOTIFICATIONS] : [];
  });

  const [auditLogs, setAuditLogs] = useState<any[]>(() => {
    if (shouldUseLocalBootstrap()) {
      const saved = localStorage.getItem('gov_audit_logs');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error('Failed to parse gov_audit_logs:', e);
        }
      }
    }
    return shouldUseMockFallback() ? [...MOCK_AUDIT_LOGS] : [];
  });

  const [correspondences, setCorrespondences] = useState<Correspondence[]>(() => {
    if (shouldUseLocalBootstrap()) {
      const saved = localStorage.getItem('gov_correspondences');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error('Failed to parse gov_correspondences:', e);
        }
      }
    }
    return shouldUseMockFallback() ? [...MOCK_GOV_CORRESPONDENCES] : [];
  });

  useEffect(() => {
    localStorage.setItem('gov_correspondences', JSON.stringify(correspondences));
  }, [correspondences]);

  const [emergencyMode, setEmergencyMode] = useState(() => {
    return localStorage.getItem('gov_emergency_mode') === 'true';
  });

  const [docRequests, setDocRequests] = useState<DocRequest[]>(() => {
    if (shouldUseLocalBootstrap()) {
      const saved = localStorage.getItem('gov_doc_requests');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error('Failed to parse gov_doc_requests:', e);
        }
      }
    }
    return shouldUseMockFallback() ? [...MOCK_DOC_REQUESTS] : [];
  });

  const [bi, setBiLocal] = useState(() => {
    if (shouldUseLocalBootstrap()) {
      return localStorage.getItem('correio_digital_bi') || MOCK_SESSION_USER.bi;
    }
    return MOCK_SESSION_USER.bi;
  });

  const [phone, setPhoneLocal] = useState(() => {
    if (shouldUseLocalBootstrap()) {
      return localStorage.getItem('correio_digital_phone') || MOCK_SESSION_USER.phone;
    }
    return MOCK_SESSION_USER.phone;
  });

  const [nif, setNifLocal] = useState(() => {
    if (shouldUseLocalBootstrap()) {
      return localStorage.getItem('correio_digital_nif') || MOCK_SESSION_USER.nif;
    }
    return MOCK_SESSION_USER.nif;
  });

  const [passport, setPassportLocal] = useState(() => {
    if (shouldUseLocalBootstrap()) {
      return localStorage.getItem('correio_digital_passport') || MOCK_SESSION_USER.passport;
    }
    return MOCK_SESSION_USER.passport;
  });

  const [verificationStatus, setVerificationStatus] = useState(() => {
    if (shouldUseLocalBootstrap()) {
      return localStorage.getItem('correio_digital_verification_status') || 'Totalmente verificado';
    }
    return 'Totalmente verificado';
  });

  const [hasFacialAuth, setHasFacialAuth] = useState(() => {
    if (shouldUseLocalBootstrap()) {
      return localStorage.getItem('correio_digital_has_facial_auth') === 'false' ? false : true;
    }
    return true;
  });

  const [hasTwoFactor, setHasTwoFactor] = useState(() => {
    if (shouldUseLocalBootstrap()) {
      return localStorage.getItem('correio_digital_has_two_factor') === 'true';
    }
    return false;
  });

  const [govPin, setGovPin] = useState(() => {
    if (shouldUseLocalBootstrap()) {
      return localStorage.getItem('correio_digital_gov_pin') || '1234';
    }
    return '1234';
  });

  const [profileName, setProfileNameLocal] = useState(() => {
    if (shouldUseLocalBootstrap()) {
      return localStorage.getItem('correio_digital_profile_name') || MOCK_SESSION_USER.name;
    }
    return MOCK_SESSION_USER.name;
  });

  const [userBirthDate, setUserBirthDateLocal] = useState(() => {
    if (shouldUseLocalBootstrap()) {
      return localStorage.getItem('correio_digital_birth_date') || MOCK_SESSION_USER.birthDate;
    }
    return MOCK_SESSION_USER.birthDate;
  });

  const [userFiliation, setUserFiliationLocal] = useState(() => {
    if (shouldUseLocalBootstrap()) {
      return localStorage.getItem('correio_digital_filiation') || MOCK_SESSION_USER.filiation;
    }
    return MOCK_SESSION_USER.filiation;
  });

  const [userMaritalStatus, setUserMaritalStatusLocal] = useState(() => {
    if (shouldUseLocalBootstrap()) {
      return localStorage.getItem('correio_digital_marital_status') || MOCK_SESSION_USER.maritalStatus;
    }
    return MOCK_SESSION_USER.maritalStatus;
  });

  // Wrapper functions to keep local states synced to master SessionStore
  const setBi = (val: string | ((prev: string) => string)) => {
    const resolved = typeof val === 'function' ? (val as Function)(bi) : val;
    setBiLocal(resolved);
    if (updateUserFields) updateUserFields({ bi: resolved });
  };

  const setPhone = (val: string | ((prev: string) => string)) => {
    const resolved = typeof val === 'function' ? (val as Function)(phone) : val;
    setPhoneLocal(resolved);
    if (updateUserFields) updateUserFields({ phone: resolved });
  };

  const setNif = (val: string | ((prev: string) => string)) => {
    const resolved = typeof val === 'function' ? (val as Function)(nif) : val;
    setNifLocal(resolved);
    if (updateUserFields) updateUserFields({ nif: resolved });
  };

  const setPassport = (val: string | ((prev: string) => string)) => {
    const resolved = typeof val === 'function' ? (val as Function)(passport) : val;
    setPassportLocal(resolved);
    if (updateUserFields) updateUserFields({ passport: resolved });
  };

  const setProfileName = (val: string | ((prev: string) => string)) => {
    const resolved = typeof val === 'function' ? (val as Function)(profileName) : val;
    setProfileNameLocal(resolved);
    if (updateUserFields) updateUserFields({ name: resolved });
  };

  const setUserBirthDate = (val: string | ((prev: string) => string)) => {
    const resolved = typeof val === 'function' ? (val as Function)(userBirthDate) : val;
    setUserBirthDateLocal(resolved);
    if (updateUserFields) updateUserFields({ birthDate: resolved });
  };

  const setUserFiliation = (val: string | ((prev: string) => string)) => {
    const resolved = typeof val === 'function' ? (val as Function)(userFiliation) : val;
    setUserFiliationLocal(resolved);
    if (updateUserFields) updateUserFields({ filiation: resolved });
  };

  const setUserMaritalStatus = (val: string | ((prev: string) => string)) => {
    const resolved = typeof val === 'function' ? (val as Function)(userMaritalStatus) : val;
    setUserMaritalStatusLocal(resolved);
    if (updateUserFields) updateUserFields({ maritalStatus: resolved });
  };

  const applyDemoPresetForMode = (mode: AppMode, includePassword = false) => {
    const preset = DEMO_CREDENTIALS[mode];
    setBiLocal(preset.identifier);
    setPhoneLocal(preset.phone);
    setNifLocal(preset.nif);
    setPassportLocal(preset.passport);
    setProfileNameLocal(preset.profileName);
    setUserBirthDateLocal(preset.birthDate);
    setUserFiliationLocal(preset.filiation);
    setUserMaritalStatusLocal(preset.maritalStatus);
    setVerificationStatus(preset.verificationStatus);
    setHasTwoFactor(preset.hasTwoFactor);
    setHasFacialAuth(preset.hasFacialAuth);
    setGovPin(preset.govPin);
    if (includePassword) setLoginPasswordInput(preset.password);
    updateUserFields?.({
      bi: preset.identifier,
      phone: preset.phone,
      nif: preset.nif,
      passport: preset.passport,
      name: preset.profileName,
      birthDate: preset.birthDate,
      filiation: preset.filiation,
      maritalStatus: preset.maritalStatus,
    });
  };

  useEffect(() => {
    localStorage.setItem('correio_digital_bi', bi);
  }, [bi]);

  useEffect(() => {
    localStorage.setItem('correio_digital_phone', phone);
  }, [phone]);

  useEffect(() => {
    localStorage.setItem('correio_digital_nif', nif);
  }, [nif]);

  useEffect(() => {
    localStorage.setItem('correio_digital_passport', passport);
  }, [passport]);

  useEffect(() => {
    localStorage.setItem('correio_digital_verification_status', verificationStatus);
  }, [verificationStatus]);

  useEffect(() => {
    localStorage.setItem('correio_digital_has_facial_auth', String(hasFacialAuth));
  }, [hasFacialAuth]);

  useEffect(() => {
    localStorage.setItem('correio_digital_has_two_factor', String(hasTwoFactor));
  }, [hasTwoFactor]);

  useEffect(() => {
    localStorage.setItem('correio_digital_gov_pin', govPin);
  }, [govPin]);

  useEffect(() => {
    localStorage.setItem('correio_digital_profile_name', profileName);
  }, [profileName]);

  useEffect(() => {
    localStorage.setItem('correio_digital_birth_date', userBirthDate);
  }, [userBirthDate]);

  useEffect(() => {
    localStorage.setItem('correio_digital_filiation', userFiliation);
  }, [userFiliation]);

  useEffect(() => {
    localStorage.setItem('correio_digital_marital_status', userMaritalStatus);
  }, [userMaritalStatus]);

  // UI States
  const [loginSubMode, setLoginSubMode] = useState<'normal' | 'two-factor' | 'face-capture' | 'register'>('normal');
  const [loginError, setLoginError] = useState<string | null>(null);

  const [showVoiceGuide, setShowVoiceGuide] = useState(false);
  const [highlightSteps, setHighlightSteps] = useState(false);
  const [loginPasswordInput, setLoginPasswordInput] = useState('');
  const [enteredOtp, setEnteredOtp] = useState('');
  const [enteredPin, setEnteredPin] = useState('');
  const [faceProgress, setFaceProgress] = useState(0);
  const [isFaceScanning, setIsFaceScanning] = useState(false);
  const [demoFaceTemplateLoaded, setDemoFaceTemplateLoaded] = useState(false);
  const [demoFaceTemplateMeta, setDemoFaceTemplateMeta] = useState<{ capturedAt: string; identifier: string } | null>(null);
  const [faceCaptureHint, setFaceCaptureHint] = useState('Posicione o rosto no centro da moldura.');
  const [faceCaptureError, setFaceCaptureError] = useState<string | null>(null);
  const [webcamReady, setWebcamReady] = useState(false);
  const [webcamPermissionDenied, setWebcamPermissionDenied] = useState(false);
  const loginFaceVideoRef = useRef<HTMLVideoElement | null>(null);
  const loginFaceCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const loginFaceStreamRef = useRef<MediaStream | null>(null);
  const [isAddingContact, setIsAddingContact] = useState(false);
  const [contactToDelete, setContactToDelete] = useState<Contact | null>(null);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [messageSource, setMessageSource] = useState('correspondencias');
  
  // Mic Activation State (UI only)
  const [iaLiveActive, setIaLiveActive] = useState(false);
  const startIaVoice = () => setIaLiveActive(true);
  const stopIaVoice = () => setIaLiveActive(false);
  
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const { user, appMode, setAppMode, activeProfile, updateUserFields } = useSession();
  const isGovMode = appMode === 'admin';
  const isInstMode = appMode === 'institution';
  const institutionCode = resolveInstitutionCode(activeProfile.institutionName);

  useEffect(() => {
    if (stage === 'login' || stage === 'splash') {
      applyDemoPresetForMode(appMode, false);
      setLoginPasswordInput('');
      setEnteredOtp('');
      setEnteredPin('');
      setLoginError(null);
    }
  }, [appMode, stage]);

  const DEMO_CREDENTIALS = {
    user: {
      identifier: '009874562LA041',
      password: 'Demo@2026',
      profileName: 'Edlasio Galhardo',
      phone: '+244 923 000 111',
      nif: '5401329188',
      passport: 'AO-P129384',
      birthDate: '12/03/1995',
      filiation: 'António Galhardo & Maria Conceição',
      maritalStatus: 'Solteiro',
      verificationStatus: 'Totalmente verificado',
      hasTwoFactor: true,
      hasFacialAuth: true,
      govPin: '1234',
    },
    institution: {
      identifier: 'AGT-9921-SR',
      password: 'Instituicao@2026',
      profileName: 'Edlasio Galhardo',
      phone: '+244 923 456 789',
      nif: '5401329188',
      passport: 'AO-P129384',
      birthDate: '12/03/1995',
      filiation: 'António Galhardo & Maria Conceição',
      maritalStatus: 'Solteiro',
      verificationStatus: 'Agente AGT Verificado',
      hasTwoFactor: false,
      hasFacialAuth: true,
      govPin: '7788',
    },
    admin: {
      identifier: 'ADM-8812-OP',
      password: 'Admin@2026',
      profileName: 'Edlasio Galhardo',
      phone: '+244 923 456 789',
      nif: '5401329188',
      passport: 'AO-P129384',
      birthDate: '12/03/1995',
      filiation: 'António Galhardo & Maria Conceição',
      maritalStatus: 'Solteiro',
      verificationStatus: 'Administrador Geral / Central',
      hasTwoFactor: false,
      hasFacialAuth: true,
      govPin: '9900',
    }
  } as const;

  const getDemoFaceStorageKey = () => {
    const identifier = (bi || DEMO_CREDENTIALS[appMode].identifier || 'anon').toUpperCase().replace(/\s+/g, '');
    return `cda_demo_face_${appMode}_${identifier}`;
  };

  const computeFaceSignature = (canvas: HTMLCanvasElement): number[] => {
    const temp = document.createElement('canvas');
    temp.width = 16;
    temp.height = 16;
    const ctx = temp.getContext('2d');
    if (!ctx) return [];
    ctx.drawImage(canvas, 0, 0, temp.width, temp.height);
    const { data } = ctx.getImageData(0, 0, temp.width, temp.height);
    const signature: number[] = [];
    for (let i = 0; i < data.length; i += 4) {
      const gray = Math.round((data[i] + data[i + 1] + data[i + 2]) / 3);
      signature.push(gray);
    }
    return signature;
  };

  const compareFaceSignatures = (a: number[], b: number[]) => {
    if (!a.length || !b.length || a.length !== b.length) return 999;
    const totalDiff = a.reduce((sum, value, index) => sum + Math.abs(value - b[index]), 0);
    return totalDiff / a.length;
  };

  const stopLoginFaceCamera = () => {
    if (loginFaceStreamRef.current) {
      loginFaceStreamRef.current.getTracks().forEach(track => track.stop());
      loginFaceStreamRef.current = null;
    }
    if (loginFaceVideoRef.current) {
      loginFaceVideoRef.current.srcObject = null;
    }
    setWebcamReady(false);
  };

  const readStoredDemoFace = () => {
    try {
      const raw = localStorage.getItem(getDemoFaceStorageKey());
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  };

  const captureLoginFaceFrame = () => {
    const video = loginFaceVideoRef.current;
    const canvas = loginFaceCanvasRef.current;
    if (!video || !canvas || video.videoWidth === 0 || video.videoHeight === 0) return null;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageDataUrl = canvas.toDataURL('image/jpeg', 0.85);
    const signature = computeFaceSignature(canvas);
    return { imageDataUrl, signature };
  };
  
  // Sincronização Unidirecional de Session para os estados locais do App.tsx
  useEffect(() => {
    if (user) {
      setBiLocal(prev => prev !== user.bi ? user.bi : prev);
      setPhoneLocal(prev => prev !== user.phone ? user.phone : prev);
      setNifLocal(prev => prev !== user.nif ? user.nif : prev);
      setPassportLocal(prev => prev !== user.passport ? user.passport : prev);
      setProfileNameLocal(prev => prev !== user.name ? user.name : prev);
      setUserBirthDateLocal(prev => prev !== user.birthDate ? user.birthDate : prev);
      setUserFiliationLocal(prev => prev !== user.filiation ? user.filiation : prev);
      setUserMaritalStatusLocal(prev => prev !== user.maritalStatus ? user.maritalStatus : prev);
    }
  }, [user]);

  useEffect(() => {
    setLoginError(null);
  }, [loginSubMode, appMode]);
  
  const [correspondenciaTab, setCorrespondenciaTab] = useState('naoLidas');
  const [videoSessionCount, setVideoSessionCount] = useState(0);
  const [isComposing, setIsComposing] = useState(false);
  const [composeData, setComposeData] = useState<{ to: string; subject: string; body: string; attachments?: string[] }>({ to: '', subject: '', body: '', attachments: [] });

  const [documentosTab, setDocumentosTab] = useState('naoLidas');
  const [isDocComposing, setIsDocComposing] = useState(false);
  const [docComposeData, setDocComposeData] = useState({ to: '', subject: '', body: '' });

  const [contactForm, setContactForm] = useState({ name: '', bi: '', relation: '', phone: '', type: 'Normal' as 'Normal' | 'Emergência' });
  const [activeSlide, setActiveSlide] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [showInviteConfirm, setShowInviteConfirm] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [searchMail, setSearchMail] = useState('');
  const [searchDocMail, setSearchDocMail] = useState('');
  const [searchDoc, setSearchDoc] = useState('');
  const [searchContact, setSearchContact] = useState('');
  const [showSensitiveData, setShowSensitiveData] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [activeNotificationModal, setActiveNotificationModal] = useState<AppNotification | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Offline and Local Caching states
  const [isOnline, setIsOnline] = useState(() => typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [simulatedOffline, setSimulatedOffline] = useState(() => localStorage.getItem('gov_simulated_offline') === 'true');
  const [offlineQueue, setOfflineQueue] = useState<OfflineAction[]>(() => OfflineManager.getQueue());
  const [activeFallback, setActiveFallback] = useState<{ channel: 'SMS' | 'USSD' | 'PUSH'; message: string; protocol: string } | null>(null);
  const [showOfflineManagerWidget, setShowOfflineManagerWidget] = useState(false);

  const [successProtocolModal, setSuccessProtocolModal] = useState<{
    protocolNumber: string;
    org: string;
    subject: string;
    digitalSignature: string;
    documentHash: string;
    officialIssueDate: string;
    officialTime: string;
  } | null>(null);

  useEffect(() => {
    if (successProtocolModal) {
      setTimeout(() => {
        const canvas = document.getElementById('protocol-qrcode-canvas') as HTMLCanvasElement;
        if (canvas) {
          import('qrcode').then((QRCode) => {
            QRCode.toCanvas(canvas, JSON.stringify({
              protocolNumber: successProtocolModal.protocolNumber,
              type: "Correspondência",
              org: successProtocolModal.org,
              subject: successProtocolModal.subject,
              date: successProtocolModal.officialIssueDate,
              time: successProtocolModal.officialTime,
              hash: successProtocolModal.documentHash,
              signature: successProtocolModal.digitalSignature
            }), {
              width: 170,
              margin: 1,
              color: {
                dark: '#0f172a',
                light: '#ffffff'
              }
            }, (error) => {
              if (error) console.error(error);
            });
          }).catch(err => {
            console.error('Failed to import qrcode dynamic module:', err);
          });
        }
      }, 150);
    }
  }, [successProtocolModal]);

  // Synchronize local profile state shifts to Supabase in real-time
  useEffect(() => {
    if (stage !== 'app' || !isOnline || !hasValidSupabaseKeys()) return;
    
    const handler = setTimeout(() => {
      console.log('CADA: Gravando actualizações de perfil no Supabase...');
      supabaseService.upsertProfile({
        bi,
        name: profileName,
        phone,
        nif,
        passport,
        birth_date: userBirthDate,
        filiation: userFiliation,
        marital_status: userMaritalStatus,
        role: appMode === 'admin' ? 'admin' : appMode === 'institution' ? 'institution' : 'user'
      }).catch(err => {
        console.error('Erro ao sincronizar perfil com o Supabase:', err);
      });
    }, 1000); // 1-second debounce to avoid excessive writes while typing
    
    return () => clearTimeout(handler);
  }, [profileName, phone, nif, passport, userBirthDate, userFiliation, userMaritalStatus, appMode, bi, isOnline]);

  // Demo facial login: load stored local profile and initialize camera when entering the flow
  useEffect(() => {
    let mounted = true;

    const startCamera = async () => {
      if (loginSubMode !== 'face-capture') return;
      setFaceCaptureError(null);
      setWebcamPermissionDenied(false);
      setFaceCaptureHint('Posicione o rosto no centro da moldura.');
      const stored = readStoredDemoFace();
      setDemoFaceTemplateLoaded(!!stored);
      setDemoFaceTemplateMeta(stored ? { capturedAt: stored.capturedAt, identifier: stored.identifier } : null);

      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false });
        if (!mounted) {
          stream.getTracks().forEach(track => track.stop());
          return;
        }
        loginFaceStreamRef.current = stream;
        if (loginFaceVideoRef.current) {
          loginFaceVideoRef.current.srcObject = stream;
          await loginFaceVideoRef.current.play().catch(() => {});
        }
        setWebcamReady(true);
      } catch (error) {
        console.error('Erro ao abrir câmara de demonstração facial:', error);
        setWebcamPermissionDenied(true);
        setFaceCaptureError('Não foi possível aceder à câmara. Verifique as permissões do navegador.');
      }
    };

    if (loginSubMode === 'face-capture') {
      startCamera();
    } else {
      stopLoginFaceCamera();
      setFaceProgress(0);
      setIsFaceScanning(false);
      setDemoFaceTemplateLoaded(false);
      setDemoFaceTemplateMeta(null);
      setFaceCaptureError(null);
    }

    return () => {
      mounted = false;
      if (loginSubMode !== 'face-capture') {
        stopLoginFaceCamera();
      }
    };
  }, [loginSubMode, appMode, bi]);

  // Automatic transition upon successful login facial recognition
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (loginSubMode === 'face-capture' && faceProgress === 100) {
      if (emergencyMode && !isInstMode && !isGovMode && (bi.toLowerCase().includes('002931298') || bi.toLowerCase().includes('edlasio') || profileName.toLowerCase().includes('edlasio'))) {
        setLoginError("Autenticação Biométrica Recusada: Chaves Faciais Suspensas por Ordem do Protocolo SOC-AN-2026!");
        setFaceProgress(0);
        setIsFaceScanning(false);
        return;
      }
      timer = setTimeout(() => {
        stopLoginFaceCamera();
        setStage('app');
        addAuditLog('Acesso concedido via Biometria Facial Local de Demonstração', 'success');
      }, 800);
    }
    return () => clearTimeout(timer);
  }, [faceProgress, loginSubMode, emergencyMode, bi, isInstMode, isGovMode, profileName]);

  // Auto-scroll to top on tab/stage change
  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTo({ top: 0, behavior: 'instant' });
    }
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [tab, stage]);

  // Safe redirect if tab is 'instituicao' but no institution is selected (avoids setState during render)
  useEffect(() => {
    if (tab === 'instituicao' && !selectedInstitution) {
      setTab('home');
    }
  }, [tab, selectedInstitution]);

  // Persistence Effects
  useEffect(() => {
    localStorage.setItem('gov_user_requests', JSON.stringify(userRequests));
  }, [userRequests]);

  useEffect(() => {
    localStorage.setItem('correio_digital_inbox', JSON.stringify(inbox));
  }, [inbox]);

  useEffect(() => {
    localStorage.setItem('documentos_digital_inbox', JSON.stringify(docInbox));
  }, [docInbox]);

  useEffect(() => {
    localStorage.setItem('correio_digital_inst_inbox', JSON.stringify(instInbox));
  }, [instInbox]);

  useEffect(() => {
    localStorage.setItem('documentos_digital_inst_inbox', JSON.stringify(instDocInbox));
  }, [instDocInbox]);

  useEffect(() => {
    localStorage.setItem('correio_digital_sent', JSON.stringify(sentMessages));
  }, [sentMessages]);

  useEffect(() => {
    localStorage.setItem('documentos_digital_sent', JSON.stringify(docSentMessages));
  }, [docSentMessages]);

  useEffect(() => {
    localStorage.setItem('correio_digital_contacts', JSON.stringify(contacts));
  }, [contacts]);

  useEffect(() => {
    localStorage.setItem('correio_digital_documents', JSON.stringify(documents));
  }, [documents]);

  useEffect(() => {
    localStorage.setItem('correio_digital_notifications', JSON.stringify(notifications));
  }, [notifications]);

  // Network Offline Observer with Simulated Controls and Auto-Sync
  useEffect(() => {
    const updateOnlineStatus = () => {
      const liveOn = navigator.onLine;
      const finalOn = liveOn && !simulatedOffline;
      setIsOnline(finalOn);
      
      if (finalOn) {
        // Trigger background auto sync when connection returns
        handleAutomaticSync();
      }
    };

    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
    
    // Initial check
    updateOnlineStatus();

    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
    };
  }, [simulatedOffline]);

  // Automatic Local Caching of messages & documents as requested: "Cache local" & "Leitura offline"
  useEffect(() => {
    if (inbox.length > 0) {
      OfflineManager.cacheMessages(inbox);
    }
  }, [inbox]);

  useEffect(() => {
    if (documents.length > 0) {
      OfflineManager.cacheDocuments(documents);
    }
  }, [documents]);

  const handleAutomaticSync = () => {
    const queue = OfflineManager.getQueue();
    if (queue.length === 0) return;

    addAuditLog(`Sincronização em segundo plano iniciada (${queue.length} acções na fila)`, 'info');
    
    // In a real application, we would call API endpoints for each queued action.
    // For this prototype, all actions are successfully processed into the active states.
    setTimeout(() => {
      OfflineManager.setQueue([]);
      setOfflineQueue([]);
      
      // Auto backup
      OfflineManager.createAutomaticBackup();
      
      addAuditLog(`Sincronização concluída: ${queue.length} acções propagadas com o Registo de Identidade Digital`, 'success');
      
      // Notify citizen user
      const newNotif: AppNotification = {
        id: Number(`${Date.now()}${Math.floor(Math.random() * 1000)}`),
        type: 'success',
        title: 'Sincronização Finalizada',
        message: `${queue.length} acções offline foram consolidadas com a base central. Backup de emergência v1.2 atualizado.`,
        time: 'Agora',
        targetTab: 'home'
      };
      setNotifications(prev => [newNotif, ...prev]);
    }, 1500);
  };

  useEffect(() => {
    localStorage.setItem('correio_digital_bi', bi);
  }, [bi]);

  useEffect(() => {
    localStorage.setItem('correio_digital_phone', phone);
  }, [phone]);

  useEffect(() => {
    localStorage.setItem('gov_doc_requests', JSON.stringify(docRequests));
  }, [docRequests]);

  useEffect(() => {
    localStorage.setItem('gov_audit_logs', JSON.stringify(auditLogs));
  }, [auditLogs]);

  useEffect(() => {
    localStorage.setItem('gov_emergency_mode', emergencyMode.toString());
  }, [emergencyMode]);

  useEffect(() => {
    localStorage.setItem('gov_app_mode', appMode);
  }, [appMode]);

  // Automatic Supabase state background loading & synchronization
  useEffect(() => {
    if (stage !== 'app' || !isOnline || !hasValidSupabaseKeys()) return;

    let isSubscribed = true;

    async function loadSupabaseData() {
      try {
        console.log('CADA: Carregando dados integrados do Supabase...');
        
        // Auto-seed check: Check if messages are empty for this user, seed all default data if database is fresh
        const dbMessagesTest = await supabaseService.getMessages(bi);
        if (shouldAutoSeedSupabase() && (dbMessagesTest === null || dbMessagesTest.length === 0)) {
          console.log('CADA: Nenhum dado de mensagens encontrado para este utilizador no Supabase. Efetuando semeadura automática...');
          const seedPayload = {
            profile: {
              bi,
              name: profileName,
              phone,
              nif,
              passport,
              birthDate: userBirthDate,
              filiation: userFiliation,
              maritalStatus: userMaritalStatus
            },
            inbox,
            docInbox,
            sentMessages,
            contacts,
            documents,
            userRequests,
            docRequests,
            auditLogs,
            notifications,
            correspondences,
            institutionInbox: INSTITUTIONAL_INBOX,
            institutionCode,
          };
          await supabaseService.seedAll(seedPayload);
          console.log('CADA: Semeadura automática para o Supabase concluída!');
        }

        // 1. Fetch Profile
        const dbProfile = await supabaseService.getProfile(bi);
        if (dbProfile && isSubscribed) {
          const isCanonicalCitizen = appMode === 'user' && bi === DEMO_CREDENTIALS.user.identifier;
          const canonicalPreset = DEMO_CREDENTIALS.user;
          const dbNameMismatch = isCanonicalCitizen && dbProfile.name && dbProfile.name !== canonicalPreset.profileName;

          if (dbNameMismatch) {
            console.warn('CADA: Perfil remoto divergente do utilizador canónico. A repor identidade de demonstração.');
            applyDemoPresetForMode('user', false);
            supabaseService.upsertProfile({
              bi: canonicalPreset.identifier,
              name: canonicalPreset.profileName,
              phone: canonicalPreset.phone,
              nif: canonicalPreset.nif,
              passport: canonicalPreset.passport,
              birth_date: canonicalPreset.birthDate,
              filiation: canonicalPreset.filiation,
              marital_status: canonicalPreset.maritalStatus,
              role: 'user'
            }).catch(err => console.error('Erro ao restaurar perfil canónico:', err));
          } else {
            if (dbProfile.name) setProfileName(dbProfile.name);
            if (dbProfile.phone) setPhone(dbProfile.phone);
            if (dbProfile.nif) setNif(dbProfile.nif);
            if (dbProfile.passport) setPassport(dbProfile.passport);
            if (dbProfile.birth_date) {
              // Convert yyyy-mm-dd to dd/mm/yyyy for state compatibility
              const parts = dbProfile.birth_date.split('-');
              if (parts.length === 3) {
                setUserBirthDate(`${parts[2]}/${parts[1]}/${parts[0]}`);
              }
            }
            if (dbProfile.filiation) setUserFiliation(dbProfile.filiation);
            if (dbProfile.marital_status) setUserMaritalStatus(dbProfile.marital_status);
          }
        }

        // 2. Fetch Citizen Messages / Institution Messages / Sent messages
        const dbMessages = await supabaseService.getMessages(bi);
        if (dbMessages && isSubscribed) {
          const isDocumentMailboxMessage = (message: Message) => {
            const actionFlags = message.details?.actions || [];
            const compositeText = `${message.preview} ${message.details?.subject || ''}`.toLowerCase();
            return actionFlags.includes('__DOC__')
              || (message.id >= 10000 && /fatura|certid|documento|passaporte|bi digital|carta de condução|vacina|receita|guia|tramita/.test(compositeText));
          };
          const incoming = dbMessages.filter(m => !isDocumentMailboxMessage(m)).map(ensureProtocolOnMessage);
          const docs = dbMessages.filter(m => isDocumentMailboxMessage(m)).map(ensureProtocolOnMessage);
          setInbox(incoming);
          setDocInbox(docs);
        } else if (isSubscribed) {
          setInbox([]);
          setDocInbox([]);
        }

        const sentSenderKey = isInstMode ? institutionCode : isGovMode ? 'CDA' : bi;
        const dbSentMessages = await supabaseService.getSentMessagesBySender(sentSenderKey);
        if (dbSentMessages && isSubscribed) {
          setSentMessages(dbSentMessages.filter(m => m.id < 10000).map(ensureProtocolOnMessage));
          setDocSentMessages(dbSentMessages.filter(m => m.id >= 10000).map(ensureProtocolOnMessage));
        } else if (isSubscribed) {
          setSentMessages([]);
          setDocSentMessages([]);
        }

        if (isInstMode) {
          const dbInstitutionMessages = await supabaseService.getInstitutionMessages(institutionCode);
          if (dbInstitutionMessages && isSubscribed) {
            setInstInbox(dbInstitutionMessages.map(ensureProtocolOnMessage));
            setInstDocInbox(dbInstitutionMessages.map(ensureProtocolOnMessage).map(m => ({ ...m, id: m.id + 10000 })));
          } else if (isSubscribed) {
            setInstInbox([]);
            setInstDocInbox([]);
          }
        }

        // 3. Fetch Documents
        const dbDocs = await supabaseService.getDocuments(bi);
        if (dbDocs && isSubscribed) {
          setDocuments(dbDocs);
        }

        // 4. Fetch Contacts
        const dbContacts = await supabaseService.getContacts(bi);
        if (dbContacts && isSubscribed) {
          setContacts(dbContacts);
        }

        // 5. Fetch User requests
        const dbUserRequests = await supabaseService.getUserRequests(isGovMode ? undefined : bi);
        if (dbUserRequests && isSubscribed) {
          setUserRequests(dbUserRequests);
        }

        // 6. Fetch Doc Requests
        const dbDocRequests = await supabaseService.getDocRequests(isGovMode ? undefined : bi);
        if (dbDocRequests && isSubscribed) {
          setDocRequests(dbDocRequests);
        }

        // 7. Fetch Notifications
          const notificationTarget = isGovMode ? 'CDA' : isInstMode ? institutionCode : bi;
        const dbNotifs = await supabaseService.getNotifications(notificationTarget);
        if (dbNotifs && isSubscribed) {
          setNotifications(dbNotifs);
        } else if (isSubscribed) {
          setNotifications([]);
        }

        // 8. Fetch Audit Logs
        const dbLogs = await supabaseService.getAuditLogs();
        if (dbLogs && isSubscribed) {
          setAuditLogs(dbLogs);
        } else if (isSubscribed) {
          setAuditLogs([]);
        }

        // 9. Fetch Official Correspondences
        const dbCorrespondences = await supabaseService.getCorrespondences();
        if (dbCorrespondences && isSubscribed) {
          setCorrespondences(dbCorrespondences);
        } else if (isSubscribed) {
          setCorrespondences([]);
        }

        console.log('CADA: Sincronização e carregamento do Supabase efectuados com sucesso!');
      } catch (err) {
        console.error('Erro na sincronização em segundo plano do Supabase:', err);
      }
    }

    loadSupabaseData();

    // Subscribe to all changes in Supabase realtime
    const channel = supabase
      .channel('schema-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, () => {
        console.log('CADA: Supabase Realtime detectou alteração em mensagens!');
        setTriggerRefetch(t => t + 1);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'documents' }, () => {
        console.log('CADA: Supabase Realtime detectou alteração em documentos!');
        setTriggerRefetch(t => t + 1);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'document_requests' }, () => {
        console.log('CADA: Supabase Realtime detectou alteração em document_requests!');
        setTriggerRefetch(t => t + 1);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'user_requests' }, () => {
        console.log('CADA: Supabase Realtime detectou alteração em user_requests!');
        setTriggerRefetch(t => t + 1);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => {
        console.log('CADA: Supabase Realtime detectou alteração em perfis!');
        setTriggerRefetch(t => t + 1);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'contacts' }, () => {
        console.log('CADA: Supabase Realtime detectou alteração em contactos!');
        setTriggerRefetch(t => t + 1);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications' }, () => {
        console.log('CADA: Supabase Realtime detectou alteração em notificações!');
        setTriggerRefetch(t => t + 1);
      })
      .subscribe();

    return () => {
      isSubscribed = false;
      supabase.removeChannel(channel);
    };
  }, [stage, bi, isOnline, triggerRefetch, appMode, institutionCode]);

  const runAuditAndSincronizacaoCompleta = () => {
    let fixesCount = 0;
    let dupesCount = 0;

    // 1. Audit e De-duplicação de Caixa de Entrada do Cidadão
    let finalCleanInbox: Message[] = [];
    setInbox(prev => {
      const ids = new Set<number>();
      const uniques: Message[] = [];
      prev.forEach(m => {
        if (!m.org || m.org.trim() === '') {
          m.org = 'AGT'; // Corrige: atribui emissor padrão
          fixesCount++;
        }
        if (!ids.has(m.id)) {
          ids.add(m.id);
          uniques.push(m);
        } else {
          dupesCount++;
        }
      });
      finalCleanInbox = uniques;
      return uniques;
    });

    // 2. Audit e De-duplicação de Caixa de Documentos do Cidadão
    setDocInbox(prev => {
      const ids = new Set<number>();
      const uniques: Message[] = [];
      prev.forEach(m => {
        if (!m.org || m.org.trim() === '') {
          m.org = 'SME'; // Corrige: atribui emissor padrão
          fixesCount++;
        }
        if (!ids.has(m.id)) {
          ids.add(m.id);
          uniques.push(m);
        } else {
          dupesCount++;
        }
      });

      // 5. Garantir sincronização real-time inteligente do estado das mensagens sem aninhamento perigoso
      const inboxReadStatus = new Map<number, number>();
      finalCleanInbox.forEach(m => {
        const baseId = m.id >= 10000 ? m.id - 10000 : m.id;
        inboxReadStatus.set(baseId, m.unread || 0);
      });

      const updatedDocInbox = uniques.map(m => {
        const baseId = m.id >= 10000 ? m.id - 10000 : m.id;
        if (inboxReadStatus.has(baseId)) {
          const desiredUnread = inboxReadStatus.get(baseId)!;
          if (m.unread !== desiredUnread) {
            fixesCount++;
            return { ...m, unread: desiredUnread, status: desiredUnread === 0 ? 'Lida' : 'Não Lida' };
          }
        }
        return m;
      });

      return updatedDocInbox;
    });

    // 3. Audit e De-duplicação de Correspondências de Instituição / Administração
    setInstInbox(prev => {
      const ids = new Set<number>();
      const uniques: Message[] = [];
      prev.forEach(m => {
        if (!m.org || m.org.trim() === '') {
          m.org = 'Cidadão';
          fixesCount++;
        }
        if (!ids.has(m.id)) {
          ids.add(m.id);
          uniques.push(m);
        } else {
          dupesCount++;
        }
      });
      return uniques;
    });

    setInstDocInbox(prev => {
      const ids = new Set<number>();
      const uniques: Message[] = [];
      prev.forEach(m => {
        if (!m.org || m.org.trim() === '') {
          m.org = 'Cidadão';
          fixesCount++;
        }
        if (!ids.has(m.id)) {
          ids.add(m.id);
          uniques.push(m);
        } else {
          dupesCount++;
        }
      });
      return uniques;
    });

    // 4. Audit, Higienização e De-duplicação da Tabela de Correspondências Governamental
    setCorrespondences(prev => {
      const ids = new Set<string>();
      const uniques: any[] = [];
      prev.forEach(c => {
        if (!c.sender || c.sender.trim() === '') {
          c.sender = 'AGT';
          fixesCount++;
        }
        if (!c.recipient || c.recipient.trim() === '') {
          c.recipient = 'Edlasio Galhardo';
          fixesCount++;
        }
        const stringId = String(c.id);
        if (!ids.has(stringId)) {
          ids.add(stringId);
          uniques.push(c);
        } else {
          dupesCount++;
        }
      });
      return uniques;
    });

    // 6. Audit e De-duplicação de Documentos na QR Code
    setDocuments(prev => {
      const codes = new Set<string>();
      const uniques: Document[] = [];
      prev.forEach(d => {
        if (!d.code || d.code.trim() === '') {
          d.code = `CDA-REP-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
          fixesCount++;
        }
        if (!d.holder || d.holder !== profileName) {
          d.holder = profileName;
          fixesCount++;
        }
        if (!codes.has(d.code)) {
          codes.add(d.code);
          uniques.push(d);
        } else {
          dupesCount++;
        }
      });
      return uniques;
    });

    // 7. Audit e De-duplicação de Contactos de Confiança
    setContacts(prev => {
      const bis = new Set<string>();
      const uniques: Contact[] = [];
      prev.forEach(c => {
        if (!c.bi || c.bi.trim() === '') {
          c.bi = `ANG-CONTACT-${Math.floor(Math.random() * 900000 + 100000)}`;
          fixesCount++;
        }
        if (!bis.has(c.bi)) {
          bis.add(c.bi);
          uniques.push(c);
        } else {
          dupesCount++;
        }
      });
      return uniques;
    });

    // 8. Audit e De-duplicação de Solicitações (Requests) de Cidadãos / Docs de Governo
    setDocRequests(prev => {
      const ids = new Set<number>();
      const uniques: DocRequest[] = [];
      prev.forEach(r => {
        if (!ids.has(r.id)) {
          ids.add(r.id);
          uniques.push(r);
        } else {
          dupesCount++;
        }
      });
      return uniques;
    });

    setUserRequests(prev => {
      const ids = new Set<number>();
      const uniques: UserRequest[] = [];
      prev.forEach(r => {
        if (!ids.has(r.id)) {
          ids.add(r.id);
          uniques.push(r);
        } else {
          dupesCount++;
        }
      });
      return uniques;
    });

    // 9. Audit de Notificações
    setNotifications(prev => {
      const ids = new Set<number>();
      const uniques: AppNotification[] = [];
      prev.forEach(n => {
        if (!ids.has(n.id)) {
          ids.add(n.id);
          uniques.push(n);
        } else {
          dupesCount++;
        }
      });
      return uniques;
    });

    // Criar registo de auditoria com certificado
    const logMsg = `AUDITORIA_SISTEMA: Sincronização concluída. ${fixesCount} inconsistências resolvidas e ${dupesCount} registos duplicados consolidados para o cidadão ${profileName}.`;
    addAuditLog(logMsg, 'success');

    // Verificar se a auditoria já foi executada nesta sessão (evita duplicação)
    const auditSessionKey = `cda_audit_completed_${bi}`;
    const alreadyAudited = localStorage.getItem(auditSessionKey);
    
    // Apenas adiciona notificação se ainda não foi feita a auditoria nesta sessão
    if (!alreadyAudited) {
      // Marcar que a auditoria foi executada para esta sessão
      localStorage.setItem(auditSessionKey, new Date().toISOString());
      
      // Emitir uma notificação oficial de sucesso (apenas uma vez por sessão)
      const checkNotif: AppNotification = {
        id: Number(`99099${Math.floor(Math.random() * 1000)}`),
        title: 'Auditoria CADA Concluída',
        message: `Encontradas e corrigidas ${fixesCount} inconsistências leves e ${dupesCount} dados duplicados nos domínios. Base de dados certificada 100% íntegra.`,
        time: 'Agora',
        type: 'success',
        targetTab: 'home'
      };
      setNotifications(prev => [checkNotif, ...prev]);
    }
  };

  // Lifecycle Effects
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    
    // Executa a auditoria geral e sincronização completa dos dados da plataforma
    // Apenas executa se ainda não foi executada nesta sessão
    const auditSessionKey = `cda_audit_completed_${bi}`;
    const alreadyExecuted = localStorage.getItem(auditSessionKey);
    
    if (!alreadyExecuted) {
      runAuditAndSincronizacaoCompleta();
    }

    const timer = setTimeout(() => {
      setPageLoading(false);
    }, 2000); // Reduced a bit for better UX
    return () => clearTimeout(timer);
  }, []);

  // Intelligent Advertising Image Preloading in the background
  useEffect(() => {
    // Start background image preloading silently
    startImagePreloading();

    // Subscribe to preloading updates to register stats into the Audit Logs
    const unsubscribe = subscribeToPreload((stats) => {
      if (stats.progress.isCompleted) {
        const total = stats.progress.total;
        const loaded = stats.progress.loaded;
        const failed = stats.progress.failed;
        if (failed > 0) {
          addAuditLog(`[Image Preloader] Pré-carregamento de imagens concluído: ${loaded}/${total} carregadas, ${failed} falhas de ligação guardadas para nova tentativa`, 'warning');
        } else {
          addAuditLog(`[Image Preloader] Todas as ${total} imagens publicitárias pré-carregadas e guardadas em cache com sucesso (Sistemas: Utilizador, Instituição, Administração)`, 'success');
        }
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const slideInterval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % HIGHLIGHT_SLIDES.length);
    }, 5500);
    return () => clearInterval(slideInterval);
  }, []);

  useEffect(() => {
    if (stage === 'splash') {
      const timer = setTimeout(() => setStage('login'), 5000);
      return () => clearTimeout(timer);
    }
  }, [stage]);

  // Derived Memos
  const currentInbox = isInstMode ? instInbox : inbox;
  const unreadTotal = useMemo(() => currentInbox.filter(msg => !deletedMessageIds.includes(msg.id)).reduce((sum, msg) => sum + (msg.unread || 0), 0), [currentInbox, deletedMessageIds]);

  const currentDocInbox = isInstMode ? instDocInbox : docInbox;
  const unreadDocTotal = useMemo(() => currentDocInbox.reduce((sum, msg) => sum + (msg.unread || 0), 0), [currentDocInbox]);

  const filteredMessages = useMemo(() => {
    let base: Message[] = [];
    if (correspondenciaTab === "excluidas") {
      const allMsgs = [...currentInbox, ...sentMessages];
      base = allMsgs.filter(item => deletedMessageIds.includes(item.id));
    } else {
      if (correspondenciaTab === "enviadas") {
        base = sentMessages.filter(item => !deletedMessageIds.includes(item.id));
      } else if (correspondenciaTab === "lidas") {
        base = currentInbox.filter(item => !deletedMessageIds.includes(item.id) && !item.unread);
      } else {
        base = currentInbox.filter(item => !deletedMessageIds.includes(item.id) && item.unread);
      }
    }

    if (!searchMail.trim()) return base;
    
    const term = searchMail.toLowerCase();
    return base.filter(m => 
      (m.org?.toLowerCase().includes(term) ?? false) || 
      (m.preview?.toLowerCase().includes(term) ?? false) ||
      (m.details?.subject?.toLowerCase().includes(term) ?? false)
    );
  }, [correspondenciaTab, currentInbox, sentMessages, searchMail, deletedMessageIds]);

  const filteredDocMessages = useMemo(() => {
    let base: Message[] = [];
    if (documentosTab === "enviadas") base = docSentMessages;
    else if (documentosTab === "lidas") base = currentDocInbox.filter((item) => !item.unread);
    else base = currentDocInbox.filter((item) => item.unread);

    if (!searchDocMail.trim()) return base;
    
    const term = searchDocMail.toLowerCase();
    return base.filter(m => 
      (m.org?.toLowerCase().includes(term) ?? false) || 
      (m.preview?.toLowerCase().includes(term) ?? false) ||
      (m.details?.subject?.toLowerCase().includes(term) ?? false)
    );
  }, [documentosTab, currentDocInbox, docSentMessages, searchDocMail]);

  const filteredDocs = useMemo(() => {
    if (!searchDoc.trim()) return documents;
    const term = searchDoc.toLowerCase();
    return documents.filter(doc => 
      (doc.name?.toLowerCase().includes(term) ?? false) || 
      (doc.code?.toLowerCase().includes(term) ?? false) ||
      (doc.issuer?.toLowerCase().includes(term) ?? false)
    );
  }, [documents, searchDoc]);

  const filteredContacts = useMemo(() => {
    if (!searchContact.trim()) return contacts;
    const term = searchContact.toLowerCase();
    return contacts.filter(c => 
      (c.name?.toLowerCase().includes(term) ?? false) || 
      (c.bi?.toLowerCase().includes(term) ?? false) ||
      (c.relation?.toLowerCase().includes(term) ?? false)
    );
  }, [contacts, searchContact]);

  const addAuditLog = (action: string, type: 'info' | 'warning' | 'critical' | 'success' = 'info') => {
    const actorLabel = isGovMode
      ? activeProfile.role
      : isInstMode
        ? (activeProfile.institutionName || user.name)
        : user.name;
    const newLog = {
      id: `${Date.now()}-${Math.floor(Math.random() * 10000000)}`,
      action,
      user: actorLabel,
      timestamp: new Date().toLocaleString('pt-AO'),
      type
    };
    setAuditLogs(prev => [newLog, ...prev]);
    supabaseService.insertAuditLog(newLog).catch(() => {});
  };

  // Handlers
  const handleSelectMessage = (message: Message) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setSelectedMessage(message);
    if (isOnline && hasValidSupabaseKeys()) {
      const baseId = message.id >= 10000 ? message.id - 10000 : message.id;
      supabaseService.getMessageStateHistory(baseId).then((history) => {
        if (history && history.length > 0) {
          setSelectedMessage((prev) => prev ? {
            ...prev,
            stateHistory: history.map((event: any) => ({
              state: event.state,
              date: new Date(event.event_date).toLocaleDateString('pt-AO'),
              time: event.event_time?.slice(0,5) || '',
              responsible: event.responsible,
              description: event.description,
            }))
          } : prev);
        }
      }).catch(() => {});
    }
    setMessageSource(correspondenciaTab === 'enviadas' ? 'enviados' : 'correspondencias');
    
    if (message.unread) {
      const baseId = message.id >= 10000 ? message.id - 10000 : message.id;
      
      // Sincronização em tempo real de estado "Lida" em todos os arrays da plataforma
      setInbox(prev => prev.map(m => {
        const mBase = m.id >= 10000 ? m.id - 10000 : m.id;
        return mBase === baseId ? { ...m, unread: 0, status: 'Lida' } : m;
      }));
      setDocInbox(prev => prev.map(m => {
        const mBase = m.id >= 10000 ? m.id - 10000 : m.id;
        return mBase === baseId ? { ...m, unread: 0, status: 'Lida' } : m;
      }));
      setInstInbox(prev => prev.map(m => {
        const mBase = m.id >= 10000 ? m.id - 10000 : m.id;
        return mBase === baseId ? { ...m, unread: 0, status: 'Lida' } : m;
      }));
      setInstDocInbox(prev => prev.map(m => {
        const mBase = m.id >= 10000 ? m.id - 10000 : m.id;
        return mBase === baseId ? { ...m, unread: 0, status: 'Lida' } : m;
      }));
      
      // Sincronização em tempo real com as correspondências de Governo / Administração
      setCorrespondences(prev => prev.map(c => {
        const isSmeMatch = (baseId === 2 && c.subject.toLowerCase().includes('passaporte') && c.recipient.toLowerCase().includes('edlasio'));
        const subjectMatch = c.subject.toLowerCase() === (message.details?.subject || '').toLowerCase();
        if (isSmeMatch || subjectMatch) {
          return { ...c, status: 'Lida' as any };
        }
        return c;
      }));

      if (isOnline && hasValidSupabaseKeys()) {
        supabaseService.updateMessageState(baseId, { unread: false, status: 'Lida' }).catch(() => {});
        supabaseService.insertMessageStateEvent({
          messageId: baseId,
          state: 'Visualizada',
          responsible: user.name,
          description: 'Correspondência aberta e marcada como lida.'
        }).catch(() => {});
      }

      // Registo de auditoria certificado para provar sincronização
      addAuditLog(`Sincronização: Correspondência ID ${baseId} marcada como lida em todas as visões (Cidadão, Instituição, Administração)`, 'success');
    }
    
    setTab('mensagem');
  };

  const handleUpdateMessage = (updatedMsg: Message) => {
    setSelectedMessage(updatedMsg);
    setInbox(prev => prev.map(m => m.id === updatedMsg.id ? updatedMsg : m));
    setInstInbox(prev => prev.map(m => m.id === updatedMsg.id ? updatedMsg : m));
    setSentMessages(prev => prev.map(m => m.id === updatedMsg.id ? updatedMsg : m));
    if (isOnline && hasValidSupabaseKeys()) {
      supabaseService.updateMessageState(updatedMsg.id >= 10000 ? updatedMsg.id - 10000 : updatedMsg.id, {
        unread: !!updatedMsg.unread,
        status: updatedMsg.status,
        preview: updatedMsg.preview,
        subject: updatedMsg.details?.subject,
        body: updatedMsg.details?.body,
        deadline_text: updatedMsg.details?.deadline,
        state_indicator: updatedMsg.details?.state,
        actions: updatedMsg.details?.actions,
      }).catch(() => {});
    }
  };

  const handleLogout = (clearAll = false) => {
    if (clearAll) {
      localStorage.clear();
      window.location.reload();
    } else {
      addAuditLog(`Sessão terminada pelo utilizador (${appMode})`, 'info');
      setLoginPasswordInput('');
      setEnteredOtp('');
      setEnteredPin('');
      setLoginError(null);
      localStorage.setItem('skip_splash_and_show_login', 'true');
      window.location.reload();
    }
  };

  const handleNavigateToVideoAtendimento = () => {
    // Load video session count before navigating
    const loadVideoCount = async () => {
      try {
        const sessions = await VideoSessionService.listSessions();
        const count = sessions.filter(s => s.status !== 'concluida' && s.status !== 'cancelada').length;
        setVideoSessionCount(count);
      } catch (e) {
        console.warn('Failed to load video session count:', e);
      }
    };
    loadVideoCount();
    setTab('video-atendimento');
  };
  const handleSendMessage = () => {
    if (!composeData.to || !composeData.subject || !composeData.body) return;
    
    const messageId = Number(`${Date.now()}${Math.floor(Math.random() * 1000)}`);
    const protocol = generateProtocol(composeData.to, 'message', messageId, composeData.subject);

    const newMessage: Message = {
      id: messageId,
      org: composeData.to,
      preview: composeData.subject,
      date: "hoje",
      status: "Informativo",
      details: {
        subject: composeData.subject,
        body: composeData.body,
        deadline: "Sem prazo",
        state: "Entregue & Autenticado",
        actions: ["Ver detalhes"],
        attachments: composeData.attachments || []
      },
      protocol: protocol
    };

    setSentMessages(prev => [newMessage, ...prev]);
    setIsComposing(false);
    setComposeData({ to: '', subject: '', body: '', attachments: [] });

    const protocolData = {
      protocolNumber: protocol.protocolNumber,
      org: composeData.to,
      subject: composeData.subject,
      digitalSignature: protocol.digitalSignature || `RSA-AO-2026-CHANCELAR-${protocol.protocolNumber}`,
      documentHash: protocol.documentHash || 'SHA256:d82ebd908e09f87c6533010b9876274',
      officialIssueDate: protocol.officialIssueDate || new Date().toLocaleDateString('pt-PT'),
      officialTime: protocol.officialTime || new Date().toLocaleTimeString('pt-PT').substring(0, 5)
    };
    setSuccessProtocolModal(protocolData);

    if (!isOnline) {
      const q = OfflineManager.queueAction('SEND_MESSAGE', { messageId, to: composeData.to, subject: composeData.subject });
      setOfflineQueue(OfflineManager.getQueue());
      
      const fallback = OfflineManager.triggerFallback('SMS', `Enviar Correspondência: ${composeData.subject}`);
      setActiveFallback({ channel: 'SMS', message: fallback.message, protocol: fallback.protocol });
      
      addAuditLog(`Ação Offline: Mensagem guardada em fila local. Canal SMS ativo.`, 'warning');
    } else {
      addAuditLog(`Correspondência enviada com Protocolo ${protocol.protocolNumber}`, 'info');
      OfflineManager.createAutomaticBackup();
      // Sync to Supabase
      const isOfficialDispatch = isInstMode || isGovMode;
      const sendPromise = isOfficialDispatch
        ? supabaseService.sendOfficialMessage(newMessage, composeData.to, isInstMode ? institutionCode : 'CDA')
        : supabaseService.sendCitizenMessage(newMessage, bi, composeData.to);
      sendPromise
        .then(async () => {
          // Store protocol in database for QR code reference
          await supabaseService.insertDigitalProtocol(protocol);
          
          await supabaseService.insertMessageStateEvent({
            messageId,
            state: 'Enviada',
            responsible: user.name,
            description: `Correspondência enviada para ${composeData.to}.`
          });
          if (isOfficialDispatch) {
            await supabaseService.insertNotification({
              title: 'Nova Correspondência Oficial',
              message: `${newMessage.preview} foi disponibilizada no seu endereço digital oficial.`,
              type: 'info',
              targetTab: 'correspondencias'
            }, composeData.to);
          } else {
            await supabaseService.insertNotification({
              title: 'Nova Solicitação do Cidadão',
              message: `${user.name} enviou uma nova correspondência para ${composeData.to}.`,
              type: 'info',
              targetTab: 'correspondencias'
            }, resolveInstitutionCode(composeData.to));
          }
        })
        .catch(() => {});
    }
  };

  const handleReply = (msg: Message) => {
    setComposeData({
      to: msg.org,
      subject: `RE: ${msg.details?.subject || msg.preview.substring(0, 30)}`,
      body: `\n\n--------------------------------\nEm resposta à mensagem de ${msg.date}:\n"${msg.preview}"`,
      attachments: []
    });
    setTab('correspondencias');
    setIsComposing(true);
  };

  const handleSendDocMessage = () => {
    if (!docComposeData.to || !docComposeData.subject || !docComposeData.body) return;
    
    const messageId = Number(`${Date.now()}${Math.floor(Math.random() * 1000)}`);
    const protocol = generateProtocol(docComposeData.to, 'message', messageId, docComposeData.subject);

    const newMessage: Message = {
      id: messageId,
      org: docComposeData.to,
      preview: docComposeData.subject,
      date: "hoje",
      status: "Informativo",
      details: {
        subject: docComposeData.subject,
        body: docComposeData.body,
        deadline: "Sem prazo",
        state: "Entregue & Autenticado",
        actions: ["Ver detalhes", "__DOC__"]
      },
      protocol: protocol
    };

    setDocSentMessages(prev => [newMessage, ...prev]);
    setIsDocComposing(false);
    setDocComposeData({ to: '', subject: '', body: '' });

    const protocolData = {
      protocolNumber: protocol.protocolNumber,
      org: docComposeData.to,
      subject: docComposeData.subject,
      digitalSignature: protocol.digitalSignature || `RSA-AO-2026-CHANCELAR-${protocol.protocolNumber}`,
      documentHash: protocol.documentHash || 'SHA256:d82ebd908e09f87c6533010b9876274',
      officialIssueDate: protocol.officialIssueDate || new Date().toLocaleDateString('pt-PT'),
      officialTime: protocol.officialTime || new Date().toLocaleTimeString('pt-PT').substring(0, 5)
    };
    setSuccessProtocolModal(protocolData);

    if (!isOnline) {
      const q = OfflineManager.queueAction('SEND_DOCUMENT', { messageId, to: docComposeData.to, subject: docComposeData.subject });
      setOfflineQueue(OfflineManager.getQueue());
      
      const fallback = OfflineManager.triggerFallback('SMS', `Enviar Documento: ${docComposeData.subject}`);
      setActiveFallback({ channel: 'SMS', message: fallback.message, protocol: fallback.protocol });
      
      addAuditLog(`Ação Offline: Documento guardado em fila local. Canal SMS ativo.`, 'warning');
    } else {
      addAuditLog(`Documento enviado com Protocolo ${protocol.protocolNumber}`, 'info');
      OfflineManager.createAutomaticBackup();
      const isOfficialDispatch = isInstMode || isGovMode;
      const sendPromise = isOfficialDispatch
        ? supabaseService.sendOfficialMessage(newMessage, docComposeData.to, isInstMode ? institutionCode : 'CDA')
        : supabaseService.sendCitizenMessage(newMessage, bi, docComposeData.to);
      sendPromise
        .then(async () => {
          // Store protocol in database for QR code reference
          await supabaseService.insertDigitalProtocol(protocol);
          
          await supabaseService.insertMessageStateEvent({
            messageId,
            state: 'Enviado',
            responsible: user.name,
            description: `Documento/tramitação enviada para ${docComposeData.to}.`
          });
          if (isOfficialDispatch) {
            await supabaseService.insertNotification({
              title: 'Novo Documento / Tramitação',
              message: `${newMessage.preview} foi disponibilizado no seu canal oficial.`,
              type: 'info',
              targetTab: 'documentos'
            }, docComposeData.to);
          } else {
            await supabaseService.insertNotification({
              title: 'Novo Documento Submetido',
              message: `${user.name} submeteu uma nova tramitação para ${docComposeData.to}.`,
              type: 'info',
              targetTab: 'documentos'
            }, resolveInstitutionCode(docComposeData.to));
          }
        })
        .catch(() => {});
    }
  };

  const handleDocReply = (msg: Message) => {
    setDocComposeData({
      to: msg.org,
      subject: `RE: ${msg.details?.subject || msg.preview.substring(0, 30)}`,
      body: `\n\n--------------------------------\nEm resposta ao documento de ${msg.date}:\n"${msg.preview}"`
    });
    setTab('documentos');
    setIsDocComposing(true);
  };

  const handleDeleteContact = () => {
    if (contactToDelete) {
      setContacts(prev => prev.filter(c => c.id !== contactToDelete.id));
      
      if (!isOnline) {
        OfflineManager.queueAction('DELETE_CONTACT', { id: contactToDelete.id, name: contactToDelete.name });
        setOfflineQueue(OfflineManager.getQueue());
        const fallback = OfflineManager.triggerFallback('PUSH', `Remover Contacto: ${contactToDelete.name}`);
        setActiveFallback({ channel: 'PUSH', message: fallback.message, protocol: fallback.protocol });
        addAuditLog(`Ação Offline: Remoção de contacto guardada. Fallback Push ativo.`, 'warning');
      } else {
        addAuditLog(`Contacto removido: ${contactToDelete.name}`, 'warning');
        OfflineManager.createAutomaticBackup();
        // Background sync to Supabase
        supabaseService.deleteContact(contactToDelete.id).catch(() => {});
      }
      
      setContactToDelete(null);
    }
  };

  const handleAddContact = () => {
    if (!contactForm.name || !contactForm.bi) return;
    const newContact = {
      id: Number(`${Date.now()}${Math.floor(Math.random() * 1000)}`),
      name: contactForm.name,
      bi: contactForm.bi,
      relation: contactForm.relation || "Contato",
      status: "Confirmado",
      type: contactForm.type || "Normal",
      phone: contactForm.phone || "",
    };

    setContacts(prev => [newContact, ...prev]);

    if (!isOnline) {
      OfflineManager.queueAction('ADD_CONTACT', { name: contactForm.name, bi: contactForm.bi });
      setOfflineQueue(OfflineManager.getQueue());
      const fallback = OfflineManager.triggerFallback('USSD', `Adicionar Contacto: ${contactForm.name}`);
      setActiveFallback({ channel: 'USSD', message: fallback.message, protocol: fallback.protocol });
      addAuditLog(`Ação Offline: Adição de contacto guardada em fila. Canal USSD ativo (*141*9#).`, 'warning');
    } else {
      addAuditLog(`Novo contacto adicionado: ${contactForm.name}`, 'success');
      OfflineManager.createAutomaticBackup();
      // Background sync to Supabase
      supabaseService.insertContact(newContact, bi).catch(() => {});
    }

    setIsAddingContact(false);
    setContactForm({ name: '', bi: '', relation: '', phone: '', type: 'Normal' });
  };

  const handleUpdateContactType = (id: number, newType: 'Normal' | 'Emergência') => {
    setContacts(prev => prev.map(c => {
      if (c.id === id) {
        const updated = { ...c, type: newType };
        // Sync update
        supabaseService.insertContact(updated, bi).catch(() => {});
        return updated;
      }
      return c;
    }));
    addAuditLog(`Prioridade do contacto atualizada para ${newType}`, 'info');
  };

  const handleEmitDocument = (doc: Document, notification: AppNotification) => {
    setDocuments(prev => [doc, ...prev]);
    setNotifications(prev => [notification, ...prev]);
    
    // Also send a formal message to the inbox to simulate real correspondence
    const newMessage: Message = {
      id: Number(`${Date.now()}${Math.floor(Math.random() * 1000)}`),
      org: doc.issuer.split(' - ')[0], // Get AGT from AGT - Administração...
      preview: `Novo documento emitido: ${doc.name}`,
      date: "Agora",
      status: "Oficial",
      unread: 1,
      details: {
        subject: `Emissão de ${doc.name}`,
        body: `Prezado(a) ${doc.holder},\n\nInformamos que um novo documento (${doc.name}) foi emitido pela nossa instituição e já se encontra disponível na sua QR Code.\n\nCódigo de Autenticação: ${doc.code}\nData de Emissão: ${doc.issuedAt}\n\nEste é um procedimento automático do Correio Digital de Angola.`,
        attachments: [doc.name],
        actions: ['Ver na Carteira', '__DOC__']
      }
    };

    // If the issued document is for the currently logged in user, update their local inbox
    if (doc.number === bi) {
      setInbox(prev => [newMessage, ...prev]);
    }
    
    // Close the request if it exists in the userRequests pool
    setUserRequests(prev => prev.map(req => 
      (req.bi === doc.number && doc.name.toLowerCase().includes(req.type.toLowerCase())) ? { ...req, status: 'concluido' } : req
    ));

    if (!isOnline) {
      OfflineManager.queueAction('EMIT_DOCUMENT', { docId: doc.code, name: doc.name, holder: doc.holder });
      setOfflineQueue(OfflineManager.getQueue());
      const fallback = OfflineManager.triggerFallback('PUSH', `Emissão de Documento: ${doc.name}`);
      setActiveFallback({ channel: 'PUSH', message: fallback.message, protocol: fallback.protocol });
      addAuditLog(`Ação Offline: Emissão de ${doc.name} enfileirada. Fallback Push ativo.`, 'warning');
    } else {
      // Sync document, companion message, and notification alert to Supabase
      if (hasValidSupabaseKeys()) {
        supabaseService.insertDocument(doc, doc.number).catch(err => console.error(err));
        supabaseService.sendOfficialMessage(newMessage, doc.number, doc.issuer.split(' - ')[0])
          .then(() => supabaseService.insertMessageStateEvent({
            messageId: newMessage.id,
            state: 'Entregue',
            responsible: doc.issuer,
            description: `Documento ${doc.name} disponibilizado ao cidadão.`
          }))
          .catch(err => console.error(err));
        supabaseService.insertNotification({
          title: notification.title,
          message: notification.message,
          type: notification.type,
          targetTab: notification.targetTab
        }, doc.number).catch(err => console.error(err));
      }
      addAuditLog(`Emissão de Documento: ${doc.name} para ${doc.holder} (BI: ${doc.number})`, 'success');
      OfflineManager.createAutomaticBackup();
    }
  };

  const handleCreateRequest = (type: string, priority: 'Alta' | 'Média' | 'Baixa' = 'Média') => {
    const newReq: UserRequest = {
      id: Number(`${Date.now()}${Math.floor(Math.random() * 1000)}`),
      user: 'Edlasio Galhardo', // Currently logged in user
      type,
      priority,
      time: 'Agora',
      status: 'pendente',
      bi: bi
    };
    setUserRequests(prev => [newReq, ...prev]);

    // Format new notification correctly satisfying AppNotification type
    const newNotif: AppNotification = {
      id: Number(`${Date.now()}${Math.floor(Math.random() * 1000)}`),
      title: 'Solicitação Enviada',
      message: `O seu pedido de ${type} foi enviado à AGT.`,
      time: 'Agora',
      type: 'info',
      targetTab: 'home'
    };
    setNotifications(prev => [newNotif, ...prev]);

    if (!isOnline) {
      OfflineManager.queueAction('CREATE_REQUEST', { type, priority });
      setOfflineQueue(OfflineManager.getQueue());
      const fallback = OfflineManager.triggerFallback('USSD', `Solicitar ${type} via USSD (*141*9#)`);
      setActiveFallback({ channel: 'USSD', message: fallback.message, protocol: fallback.protocol });
      addAuditLog(`Ação Offline: Pedido de ${type} anexado ao buffer. Fallback USSD físico iniciado (*141*9#).`, 'warning');
    } else {
      // Sync query request and notification alert to Supabase
      if (hasValidSupabaseKeys()) {
        supabaseService.insertUserRequest(newReq).catch(err => console.error(err));
        supabaseService.insertNotification({
          title: newNotif.title,
          message: newNotif.message,
          type: newNotif.type,
          targetTab: newNotif.targetTab
        }, bi).catch(err => console.error(err));
      }
      addAuditLog(`Nova solicitação de ${type} enviada à AGT`, 'info');
      OfflineManager.createAutomaticBackup();
    }
  };

  const getPageContentDescription = (currentTab: string) => {
    switch (currentTab) {
      case 'home':
        return `Você está no Painel Principal do Correio Digital de Angola.
O utilizador logado é ${profileName} com Bilhete de Identidade ${bi}.
Neste painel, há um alerta oficial sobre emergência civil e um painel lateral onde se listam as Instituições Conectadas como a AGT, SME, ENDE, EPAL e INE.
Status de verificação da conta: ${verificationStatus}.
Serviços ativos: Notificações em tempo real e interconexão garantida.`;
      
      case 'correspondencias':
        const unreadCount = inbox.filter(m => m.status === 'Não Lida').length;
        const messagesSummary = inbox.slice(0, 3).map(m => `- De: ${m.sender || m.org}, Assunto: ${m.subject || m.preview}, Status: ${m.status}`).join('\n');
        return `Você está na aba de Correspondência Oficial (Recebidas).
Total de correspondências na caixa de entrada: ${inbox.length} mensagens, das quais ${unreadCount} não foram lidas.
Aqui estão algumas correspondências em destaque no ecrã:
${messagesSummary || 'Nenhuma mensagem recente.'}`;
      
      case 'video-atendimento':
        return (
          <VideoSessionPage
            onBack={() => setTab('correspondencias')}
            onNavigateToMail={() => setTab('correspondencias')}
            addAuditLog={addAuditLog}
          />
        );
      case 'documentos':
        const docUnreadCount = docInbox.filter(m => m.status === 'Não Lida').length;
        const docMessagesSummary = docInbox.slice(0, 3).map(m => `- Serviço: ${m.sender || m.org}, Assunto: ${m.subject || m.preview}, Status: ${m.status}`).join('\n');
        return `Você está na aba de Documentos e Tramitações Oficiais (Facturas e Certidões).
Nesta secção, consulte as faturas de serviços básicos ou recibos eletrónicos emitidos de Angola.
Você tem ${docInbox.length} itens recebidos nas suas tramitações, sendo ${docUnreadCount} não abertos. 
Últimas tramitações na tela:
${docMessagesSummary || 'Nenhum documento de trâmite pendente.'}`;
      
      case 'qr-code':
        const docsSummary = documents.map(d => `- ${d.name} (Número: ${d.number || 'Não Aplicável'})`).join('\n');
        return `Você está na QR Code Offline e Segura.
Nela estão armazenados eletronicamente os seguintes documentos civis do cidadão ${profileName}:
${docsSummary || 'Nenhum documento adicionado.'}
As credenciais têm assinatura criptográfica ativa e um código QR de integridade visualizado para validação por fiscais de estado.`;
      
      case 'pasta-digital':
        return `Você está na Pasta Digital Integrada.
Nesta área estão organizados os dossiers, certidões, anexos certificados e comprovativos históricos associados ao perfil ${profileName}.`;

      case 'historico':
        return `Você está no Centro de Histórico Operacional.
Aqui pode acompanhar correspondências, documentos, notificações e solicitações recentes do perfil ativo no Correio Digital Angola.`;

      case 'notificacoes':
        return `Você está no Centro de Notificações.
Nesta secção são apresentados alertas, confirmações de emissão, respostas institucionais e avisos operacionais associados ao perfil atual.`;
      
      case 'contactos':
      case 'contatos':
        const contactsSummary = contacts.map(c => `- Nome: ${c.name}, Grau: ${c.relation}, Telefone: ${c.phone || 'Sem telefone'}, Tipo: ${c.type || 'Normal'}, Estado: ${c.status}`).join('\n');
        return `Você está nos Contactos de Emergência e Conexões Familiares.
Aqui estão cadastrados familiares e vizinhos confiáveis que o governo de Angola pode avisar de forma automatizada em cenários de contingência nacional.
Contactos guardados no seu perfil:
${contactsSummary || 'Nenhum contacto cadastrado.'}`;
      
      case 'perfil':
        return `Você está na secção do Meu Perfil de Cidadão do Correio Digital de Angola.
Ficha civil do titular:
- Nome Completo: ${profileName}
- Número de Bilhete de Identidade (BI): ${bi}
- Telemóvel Registado: ${phone}
- Número de Identificação Fiscal (NIF): ${nif}
- Passaporte Diplomático/Regular: ${passport}
- Filiação: ${userFiliation}
- Data de Nascimento: ${userBirthDate}
- Estado Civil: ${userMaritalStatus}
- Nível de Verificação: ${verificationStatus}`;
        
      default:
        return 'Página informativa geral do utilizador no Correio Digital de Angola.';
    }
  };

  const logSecurityEvent = (action: string, type: 'info' | 'warning' | 'critical' | 'success' = 'info') => {
    addAuditLog(action, type);
  };

  const handleUpdateDocRequest = (requestId: number, newStatus: 'Aprovado' | 'Rejeitado') => {
    const request = docRequests.find(r => r.id === requestId);
    if (!request) return;

    setDocRequests(prev => prev.map(r => r.id === requestId ? { ...r, status: newStatus } : r));
    
    // Persist request status update directly on Supabase
    if (isOnline && hasValidSupabaseKeys()) {
      supabase
        .from('document_requests')
        .update({ status: newStatus })
        .eq('id', requestId)
        .then(({ error }) => {
          if (error) console.error('Erro ao atualizar estado da solicitação no Supabase:', error);
          else {
            supabaseService.insertAuditLog({
              action: `DOC_REQUEST_${newStatus.toUpperCase()}: ${request.docType} / ${request.userName}`,
              user: user.name,
              type: newStatus === 'Aprovado' ? 'success' : 'warning'
            }).catch(() => {});
          }
        });
    }

    if (newStatus === 'Aprovado') {
      const newDoc: Document = {
        name: request.docType,
        validity: 'VITALÍCIO',
        code: `CDA-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
        holder: request.userName,
        number: request.userBi,
        issuer: `${request.institution} - Emissão Automática`,
        issuedAt: new Date().toLocaleDateString('pt-AO')
      };
      
      setDocuments(prev => [newDoc, ...prev]);
      
      const systemMsg: Message = {
        id: Number(`${Date.now()}${Math.floor(Math.random() * 1000)}`),
        org: request.institution,
        preview: `A sua solicitação de ${request.docType} foi aprovada.`,
        date: "Agora",
        status: "Oficial",
        unread: 1,
        details: {
          subject: `${request.docType} Aprovado`,
          body: `Prezado(a) ${request.userName},\n\nA sua solicitação para a emissão do documento ${request.docType} foi analisada e aprovada com sucesso.\n\nO documento já se encontra disponível na sua QR Code para consulta e utilização oficial.`,
          actions: ['Ver na Carteira', '__DOC__']
        }
      };
      
      if (request.userBi === bi) {
        setInbox(prev => [systemMsg, ...prev]);
        setNotifications(prev => [{
          id: Number(`${Date.now()}${Math.floor(Math.random() * 1000)}`),
          title: 'Documento Aprovado',
          message: `O seu pedido de ${request.docType} foi aprovado e emitido.`,
          time: 'Agora',
          type: 'success',
          targetTab: 'correspondencias'
        }, ...prev]);
      }
      
      // Persist documents, companion messages, and alerts in Supabase for the citizen
      if (isOnline && hasValidSupabaseKeys()) {
        supabaseService.insertDocument(newDoc, request.userBi).catch(err => console.error(err));
        supabaseService.sendOfficialMessage(systemMsg, request.userBi, request.institution)
          .then(() => supabaseService.insertMessageStateEvent({
            messageId: systemMsg.id,
            state: 'Aprovada',
            responsible: request.institution,
            description: `Solicitação de ${request.docType} aprovada e disponibilizada ao cidadão.`
          }))
          .catch(err => console.error(err));
        supabaseService.insertNotification({
          title: 'Documento Aprovado',
          message: `O seu pedido de ${request.docType} foi aprovado e emitido.`,
          type: 'success',
          targetTab: 'qr-code'
        }, request.userBi).catch(err => console.error(err));
      }
      
      addAuditLog(`DOC_APPROVED: ${request.docType} para ${request.userName} emitido via sistema.`, 'success');
    } else {
      if (isOnline && hasValidSupabaseKeys()) {
        supabaseService.insertNotification({
          title: 'Solicitação Rejeitada',
          message: `O pedido de ${request.docType} foi rejeitado e requer regularização complementar.`,
          type: 'warning',
          targetTab: 'historico'
        }, request.userBi).catch(() => {});
      }
      addAuditLog(`DOC_REJECTED: Solicitação de ${request.docType} para ${request.userName} rejeitada.`, 'warning');
    }
  };

  const handleCreateDocRequest = (docType: string, institution: string) => {
    const newReq: DocRequest = {
      id: Number(`${Date.now()}${Math.floor(Math.random() * 1000)}`),
      userName: 'Edlasio Galhardo',
      userBi: bi,
      docType,
      institution,
      date: new Date().toLocaleDateString('pt-AO'),
      status: 'Pendente'
    };
    setDocRequests(prev => [newReq, ...prev]);

    // Persist new document request on Supabase
    if (isOnline && hasValidSupabaseKeys()) {
      supabaseService.insertDocRequest(newReq)
        .then(() => supabaseService.insertNotification({
          title: 'Nova Solicitação de Documento',
          message: `${docType} solicitado por ${newReq.userName}.`,
          type: 'info',
          targetTab: 'gov-docs'
        }, 'CDA'))
        .catch(err => console.error('Erro ao salvar nova solicitação no Supabase:', err));
    }

    addAuditLog(`SOLICITATION_SENT: Pedido de ${docType} à ${institution} enviado pelo cidadão.`, 'info');
  };

  // Rendering Helpers
  const renderContent = () => {
    switch (tab) {
      case 'home':
        return (
          <HomeContent
            activeSlide={activeSlide}
            setActiveSlide={setActiveSlide}
            isMobile={isMobile}
            setTab={setTab}
            unreadTotal={unreadTotal}
            inbox={currentInbox}
            sentMessages={sentMessages}
            handleSelectMessage={handleSelectMessage}
            onCreateRequest={handleCreateRequest}
            isInst={isInstMode}
            onDoubleClickInstitution={isGovMode ? undefined : (name) => {
              setSelectedInstitution(name);
              setTab('instituicao');
            }}
            currentLanguage={currentLanguage}
          />
        );
      case 'instituicao':
        if (!selectedInstitution) {
          return null;
        }
        return (
          <InstitutionDetail
            institutionName={selectedInstitution}
            inbox={currentInbox}
            sentMessages={sentMessages}
            docInbox={currentDocInbox}
            onBack={() => {
              setSelectedInstitution(null);
              setTab('home');
            }}
            onSelectMessage={handleSelectMessage}
          />
        );
      case 'correspondencias':
        return (
          <MailContent
            isComposing={isComposing}
            setIsComposing={setIsComposing}
            composeData={composeData}
            setComposeData={setComposeData}
            handleSendMessage={handleSendMessage}
            unreadTotal={unreadTotal}
            correspondenciaTab={correspondenciaTab}
            setCorrespondenciaTab={setCorrespondenciaTab}
            inbox={currentInbox}
            sentMessages={sentMessages}
            searchMail={searchMail}
            setSearchMail={setSearchMail}
            filteredMessages={filteredMessages}
            handleSelectMessage={handleSelectMessage}
            setTab={setTab}
            bi={bi}
            isInst={isInstMode}
            onDeleteMessage={handleDeleteMessage}
            onRestoreMessage={handleRestoreMessage}
            deletedMessageIds={deletedMessageIds}
            onNavigateToVideoAtendimento={handleNavigateToVideoAtendimento}
            videoSessionCount={videoSessionCount}
            currentLanguage={currentLanguage}
          />
        );
      case 'video-atendimento':
        return (
          <VideoSessionPage
            onBack={() => setTab('correspondencias')}
            onNavigateToMail={() => setTab('correspondencias')}
            addAuditLog={addAuditLog}
          />
        );
      case 'documentos':
        return (
          <DocumentsContent
            isComposing={isDocComposing}
            setIsComposing={setIsDocComposing}
            composeData={docComposeData}
            setComposeData={setDocComposeData}
            handleSendMessage={handleSendDocMessage}
            unreadTotal={unreadDocTotal}
            correspondenciaTab={documentosTab}
            setCorrespondenciaTab={setDocumentosTab}
            inbox={currentDocInbox}
            sentMessages={docSentMessages}
            searchMail={searchDocMail}
            setSearchMail={setSearchDocMail}
            filteredMessages={filteredDocMessages}
            handleSelectMessage={handleSelectMessage}
            setTab={setTab}
            bi={bi}
            isInst={isInstMode}
            currentLanguage={currentLanguage}
          />
        );
      case 'mensagem':
        if (!selectedMessage) return null;
        return (
          <MessageDetail
            selectedMessage={selectedMessage}
            setSelectedMessage={setSelectedMessage}
            setTab={setTab}
            handleReply={handleReply}
            onUpdateMessage={handleUpdateMessage}
            onDeleteMessage={handleDeleteMessage}
            onRestoreMessage={handleRestoreMessage}
            isDeleted={deletedMessageIds.includes(selectedMessage.id)}
          />
        );
      case 'qr-code':
        if (isInstMode) {
          return (
          <GovDocsContent 
            documents={documents} 
            requests={docRequests} 
            onUpdateStatus={handleUpdateDocRequest}
            setTab={setTab}
          />
          );
        }
        return (
          <WalletContent
            filteredDocs={filteredDocs}
            searchDoc={searchDoc}
            setSearchDoc={setSearchDoc}
            setSelectedDoc={setSelectedDoc}
            setTab={setTab}
            logSecurityEvent={logSecurityEvent}
            docRequests={docRequests.filter(r => r.userBi === bi)}
            onCreateRequest={handleCreateDocRequest}
            emergencyMode={emergencyMode}
            currentLanguage={currentLanguage}
          />
        );
      case 'documento':
        if (!selectedDoc) return null;
        return (
          <DocumentDetail
            selectedDoc={selectedDoc}
            setSelectedDoc={setSelectedDoc}
            setTab={setTab}
            logSecurityEvent={logSecurityEvent}
          />
        );
      case 'solicitar-documento':
        return (
          <SolicitarDocumentoContent
            setTab={setTab}
            bi={bi}
            nif={nif}
            onEmitDocument={handleEmitDocument}
            isOnline={isOnline}
            addAuditLog={addAuditLog}
          />
        );
      case 'pasta-digital':
        return (
          <PastaDigitalContent
            documents={documents}
            docRequests={docRequests.filter(r => r.userBi === bi)}
            onCreateRequest={handleCreateDocRequest}
            setSelectedDoc={setSelectedDoc}
            setTab={setTab}
            logSecurityEvent={logSecurityEvent}
            emergencyMode={emergencyMode}
            correspondences={correspondences}
          />
        );
      case 'historico':
        return (
          <ActivityCenterContent
            appMode={appMode}
            messages={currentInbox}
            sentMessages={sentMessages}
            documents={documents}
            docRequests={isGovMode ? docRequests : docRequests.filter(r => r.userBi === bi)}
            userRequests={isGovMode ? userRequests : userRequests.filter(r => r.bi === bi)}
            correspondences={correspondences}
            notifications={notifications}
            auditLogs={auditLogs}
            setTab={setTab}
          />
        );
      case 'notificacoes':
        return (
          <NotificationsCenterContent
            notifications={notifications}
            setTab={setTab}
            appMode={appMode}
          />
        );
      case 'inst-qrcode':
        return (
          <InstQrCodeContent
            documents={documents}
            messages={isInstMode
              ? [...instInbox, ...instDocInbox, ...sentMessages, ...docSentMessages]
              : [...inbox, ...docInbox, ...sentMessages, ...docSentMessages]}
            onSelectMessage={handleSelectMessage}
            addAuditLog={addAuditLog}
            setTab={setTab}
          />
        );
      case 'inst-ai-assistant':
        return (
          <InstAiAssistantContent
            addAuditLog={addAuditLog}
            setTab={setTab}
          />
        );
      case 'contatos':
      case 'contactos':
        return appMode === 'institution' ? (
          <GovContactsContent
            appMode={appMode}
            bi={bi}
            setBi={setBi}
            nif={nif}
            setNif={setNif}
            phone={phone}
            setPhone={setPhone}
            passport={passport}
            setPassport={setPassport}
            profileName={profileName}
            setProfileName={setProfileName}
            userBirthDate={userBirthDate}
            setUserBirthDate={setUserBirthDate}
            userFiliation={userFiliation}
            setUserFiliation={setUserFiliation}
            userMaritalStatus={userMaritalStatus}
            setUserMaritalStatus={setUserMaritalStatus}
            verificationStatus={verificationStatus}
            setVerificationStatus={setVerificationStatus}
            hasFacialAuth={hasFacialAuth}
            setHasFacialAuth={setHasFacialAuth}
            hasTwoFactor={hasTwoFactor}
            setHasTwoFactor={setHasTwoFactor}
            govPin={govPin}
            setGovPin={setGovPin}
            addAuditLog={addAuditLog}
            auditLogs={auditLogs}
          />
        ) : (
          <ContactsContent
            contacts={contacts}
            filteredContacts={filteredContacts}
            searchContact={searchContact}
            setSearchContact={setSearchContact}
            setIsAddingContact={setIsAddingContact}
            setContactToDelete={setContactToDelete}
            onUpdateContactType={handleUpdateContactType}
          />
        );
      case 'perfil':
        return (
          <ProfileContent
            isInst={isInstMode}
            showSensitiveData={showSensitiveData}
            setShowSensitiveData={setShowSensitiveData}
            bi={bi}
            phone={phone}
            nif={nif}
            passport={passport}
            verificationStatus={verificationStatus}
            hasFacialAuth={hasFacialAuth}
            hasTwoFactor={hasTwoFactor}
            govPin={govPin}
            profileName={profileName}
            userBirthDate={userBirthDate}
            userFiliation={userFiliation}
            userMaritalStatus={userMaritalStatus}
            setBi={setBi}
            setPhone={setPhone}
            setNif={setNif}
            setPassport={setPassport}
            setVerificationStatus={setVerificationStatus}
            setHasFacialAuth={setHasFacialAuth}
            setHasTwoFactor={setHasTwoFactor}
            setGovPin={setGovPin}
            contactsCount={contacts.length}
            setTab={setTab}
            handleLogout={handleLogout}
            inbox={inbox}
            docInbox={docInbox}
            sentMessages={sentMessages}
            contactsList={contacts}
            documentsList={documents}
            userRequests={userRequests}
            docRequests={docRequests}
            auditLogs={auditLogs}
            addAuditLog={addAuditLog}
          />
        );
      case 'gov-dashboard':
        return (
          <GovDashboard 
            onNavigate={setTab} 
            documents={documents} 
            emergencyMode={emergencyMode} 
            appMode={appMode} 
            userRequests={userRequests}
            isMobile={isMobile}
            logSecurityEvent={logSecurityEvent}
            bi={bi}
            setBi={setBi}
            profileName={profileName}
            setProfileName={setProfileName}
            userBirthDate={userBirthDate}
            setUserBirthDate={setUserBirthDate}
            userFiliation={userFiliation}
            setUserFiliation={setUserFiliation}
            userMaritalStatus={userMaritalStatus}
            setUserMaritalStatus={setUserMaritalStatus}
            addAuditLog={addAuditLog}
          />
        );
      case 'gov-emissao':
        return (
          <GovEmissaoContent 
            onEmit={handleEmitDocument} 
            recentDocuments={documents} 
            emergencyMode={emergencyMode} 
            userRequests={userRequests.filter(r => r.status !== 'concluido')}
          />
        );
      case 'gov-correspondencias':
        return (
          <GovCorrespondenciasContent 
            correspondences={correspondences}
            onNavigate={setTab}
            onAddCorrespondence={async (newCor) => {
              setCorrespondences(prev => [newCor, ...prev]);
              addAuditLog(`Novo Expediente Enviado: ${newCor.id} de ${newCor.sender} para ${newCor.recipient}`, 'success');
              
              const resolvedBi = resolveCitizenBi(newCor.recipient);
              const isDatabaseFlow = isOnline && hasValidSupabaseKeys();

              if (isDatabaseFlow) {
                try {
                  // 1. Persist the official correspondence record
                  await supabaseService.insertCorrespondence(newCor);
                } catch (err) {
                  console.error('Erro ao salvar expediente no Supabase:', err);
                }
              }

              // 2. Generate protocol for the message
              const protocol = generateProtocol(newCor.sender, 'message', newCor.id, newCor.subject);
              
              // 3. Build the official citizen MailMessage
              const newMailMessage: Message = {
                id: parseInt(newCor.id.replace(/\D/g, '')) || Math.floor(Math.random() * 1000000),
                org: newCor.sender,
                preview: newCor.subject,
                date: `${newCor.date} 12:00`,
                unread: 1,
                status: 'Urgente',
                details: {
                  subject: newCor.subject,
                  body: newCor.body,
                  deadline: `${newCor.date}`,
                  state: 'Pendente',
                  actions: ['Visualizar', 'Baixar Recibo'],
                  attachments: [protocol.archiveReference || 'referencia_arquivistica.cda']
                },
                protocol
              };

              // Map protocol & timelines correctly using our utility helper
              const finalMessageObj = ensureProtocolOnMessage(newMailMessage);

              // 4. Update the matching citizen's inbox locally if they are the active user
              if (resolvedBi === bi) {
                setInbox(prev => [finalMessageObj, ...prev]);
              }

              if (isDatabaseFlow) {
                try {
                  // 5. Send/persist official message in 'messages' table with correct recipient_bi
                  await supabaseService.sendOfficialMessage(finalMessageObj, resolvedBi, newCor.sender);

                  // 5.1 Store protocol for QR code reference
                  await supabaseService.insertDigitalProtocol(protocol);

                  // 6. Create citizen notification linked to their correct target_bi
                  await supabaseService.insertNotification({
                    title: 'Nova Correspondência Civil',
                    message: `Recebeu um novo expediente oficial da instituição ${newCor.sender}.`,
                    type: 'info',
                    targetTab: 'correspondencias'
                  }, resolvedBi);

                  // 7. Insert official Message State History Events in 'message_state_history'
                  const baseMsgId = finalMessageObj.id >= 10000 ? finalMessageObj.id - 10000 : finalMessageObj.id;
                  
                  // "Enviada" event
                  await supabaseService.insertMessageStateEvent({
                    messageId: baseMsgId,
                    state: 'Enviada',
                    responsible: `${newCor.institution || 'GOV'}_DELEGADO`,
                    description: 'Mensagem oficial expedida pelo barramento de interoperabilidade da instituição.'
                  });

                  // "Entregue" event
                  await supabaseService.insertMessageStateEvent({
                    messageId: baseMsgId,
                    state: 'Entregue / Disponibilizada',
                    responsible: 'SYSTEM_CDA',
                    description: 'Correspondência digital disponibilizada com sucesso na caixa de entrada do cidadão.'
                  });

                  // Trigger refetch so citizen updates counters, notifications, and inbox messages in realtime from the database!
                  setTriggerRefetch(t => t + 1);
                } catch (err) {
                  console.error('Erro no fluxo integrado de envio do Supabase:', err);
                }
              }
            }}
            onUpdateStatus={(id, newStatus) => {
              setCorrespondences(prev => prev.map(c => c.id === id ? { ...c, status: newStatus as any } : c));
              addAuditLog(`Expediente ${id} marcado como ${newStatus}`, 'info');

              const matchedCor = correspondences.find(c => c.id === id);
              if (matchedCor && isOnline && hasValidSupabaseKeys()) {
                const updated = { ...matchedCor, status: newStatus };
                supabaseService.insertCorrespondence(updated).catch(err => console.error('Erro ao atualizar estado do expediente no Supabase:', err));
              }
            }}
          />
        );
      case 'gov-docs':
      case 'gov-documentos':
        return (
          <GovDocsContent 
            documents={documents} 
            requests={docRequests} 
            onUpdateStatus={handleUpdateDocRequest}
            setTab={setTab}
          />
        );
      case 'gov-contatos':
        return (
          <GovContactsContent
            appMode={appMode}
            bi={bi}
            setBi={setBi}
            nif={nif}
            setNif={setNif}
            phone={phone}
            setPhone={setPhone}
            passport={passport}
            setPassport={setPassport}
            profileName={profileName}
            setProfileName={setProfileName}
            userBirthDate={userBirthDate}
            setUserBirthDate={setUserBirthDate}
            userFiliation={userFiliation}
            setUserFiliation={setUserFiliation}
            userMaritalStatus={userMaritalStatus}
            setUserMaritalStatus={setUserMaritalStatus}
            verificationStatus={verificationStatus}
            setVerificationStatus={setVerificationStatus}
            hasFacialAuth={hasFacialAuth}
            setHasFacialAuth={setHasFacialAuth}
            hasTwoFactor={hasTwoFactor}
            setHasTwoFactor={setHasTwoFactor}
            govPin={govPin}
            setGovPin={setGovPin}
            addAuditLog={addAuditLog}
            auditLogs={auditLogs}
          />
        );
      case 'gov-trabalhadores':
        return (
          <GovContactsContent
            appMode="admin-workers"
            bi={bi}
            setBi={setBi}
            nif={nif}
            setNif={setNif}
            phone={phone}
            setPhone={setPhone}
            passport={passport}
            setPassport={setPassport}
            profileName={profileName}
            setProfileName={setProfileName}
            userBirthDate={userBirthDate}
            setUserBirthDate={setUserBirthDate}
            userFiliation={userFiliation}
            setUserFiliation={setUserFiliation}
            userMaritalStatus={userMaritalStatus}
            setUserMaritalStatus={setUserMaritalStatus}
            verificationStatus={verificationStatus}
            setVerificationStatus={setVerificationStatus}
            hasFacialAuth={hasFacialAuth}
            setHasFacialAuth={setHasFacialAuth}
            hasTwoFactor={hasTwoFactor}
            setHasTwoFactor={setHasTwoFactor}
            govPin={govPin}
            setGovPin={setGovPin}
            addAuditLog={addAuditLog}
            auditLogs={auditLogs}
          />
        );
      case 'gov-perfil':
        return (
          <GovPerfilContent 
            logs={auditLogs} 
            emergencyMode={emergencyMode} 
            bi={bi}
            phone={phone}
            nif={nif}
            passport={passport}
            profileName={profileName}
            userBirthDate={userBirthDate}
            userFiliation={userFiliation}
            userMaritalStatus={userMaritalStatus}
            hasFacialAuth={hasFacialAuth}
            hasTwoFactor={hasTwoFactor}
            govPin={govPin}
            onToggleEmergency={(active) => {
              setEmergencyMode(active);
              addAuditLog(active ? 'PROTOCOLO DE EMERGÊNCIA ACTIVADO' : 'Protocolo de Emergência Desativado', active ? 'critical' : 'warning');
              
              // If activated, send a system-wide high priority message to all users
              if (active) {
                const systemAlert: Message = {
                  id: Number(`${Date.now()}999`),
                  org: 'SOC - SEGURANÇA NACIONAL',
                  preview: 'ALERTA DE SEGURANÇA: Protocolo SOC-AN-2026 Ativado',
                  date: "Agora",
                  status: "CRÍTICO",
                  unread: 1,
                  details: {
                    subject: 'Protocolo de Emergência de Segurança Digital',
                    body: 'Exmo(a) Cidadão(ã),\n\nInformamos que foi ativado o protocolo de segurança SOC-AN-2026. Por motivos de segurança nacional, algumas emissões de documentos digitais estão temporariamente suspensas.\n\nEsta medida visa garantir a integridade dos seus dados e a segurança da rede CDA. Por favor, mantenha-se atento a novas comunicações oficiais.\n\nAtenciosamente,\nCentro de Operações de Segurança Nacional',
                    actions: ['Confirmar Leitura']
                  }
                };
                setInbox(prev => [systemAlert, ...prev]);
                setNotifications(prev => [{
                  id: Number(`${Date.now()}${Math.floor(Math.random() * 1000)}`),
                  title: 'ALERTA NACIONAL',
                  message: 'Protocolo de Emergência Activado pelo SOC',
                  time: 'Agora',
                  type: 'warning',
                  targetTab: 'correspondencias'
                }, ...prev]);
              }
            }} 
          />
        );
      case 'gov-stats':
        return null; // Removido ou integrado no painel principal
      case 'gov-interoperabilidade':
        return <GovInteroperabilidadeContent onLog={addAuditLog} />;
      case 'gov-relatorio':
        return (
          <GovRelatorioContent 
            correspondences={correspondences}
            auditLogs={auditLogs}
          />
        );
      case 'gov-ia':
        return (
          <GovIaContent onLog={addAuditLog} />
        );
      case 'gov-seguranca':
        return (
          <GovSegurancaContent 
            emergencyMode={emergencyMode}
            onToggleEmergencyMode={(enabled) => {
              setEmergencyMode(enabled);
              localStorage.setItem('gov_emergency_mode', enabled ? 'true' : 'false');
              
              if (enabled) {
                // Add Audit logs
                addAuditLog('PROTOCOLO SOC-AN-2026 ATIVADO: Bloqueio Identitário e Chaves Criptográficas Encriptadas', 'critical');
                
                // Add Notification to citizen
                setNotifications(prev => [{
                  id: Number(`${Date.now()}${Math.floor(Math.random() * 1000)}`),
                  title: 'ALERTA SOC-AN-2026 UNIFICADO',
                  message: 'Protocolo de Emergência Ciber-Defensiva Ativado. Chaves Faciais e Biométricas de Edlasio Galhardo Temporariamente Suspensas / Bloqueadas para Salvaguarda de Soberania Digital!',
                  time: 'Agora',
                  type: 'warning',
                  targetTab: 'home'
                }, ...prev]);

                // Despacho de Mensagem na Inbox (Mail)
                const dateAO = new Date().toLocaleDateString('pt-AO');
                const timeAO = new Date().toLocaleTimeString('pt-AO');
                const emergencyRoom = "Gabinete de Gestão de Crises - Luanda, Angola";

                const killSwitchMessage: Message = {
                  id: 2026911,
                  org: "SOC",
                  preview: "ALERTA CRÍTICO: ATIVAÇÃO PROTOCOLO NACIONAL SOC-AN-2026",
                  date: `${dateAO} ${timeAO}`,
                  unread: 1,
                  status: 'Crítico',
                  details: {
                    subject: "ALERTA CRÍTICO: ATIVAÇÃO PROTOCOLO NACIONAL SOC-AN-2026",
                    body: `PROT: SOC-AN-2026\nDATA: ${dateAO}\nHORA: ${timeAO}\nLOCALIZAÇÃO: ${emergencyRoom}\n\nATENÇÃO CIDADÃO: Por directiva da tutela de Defesa e Soberania Digital, as chaves de acesso facial e credenciais criptográficas associadas à entidade legal 'Edlasio Galhardo' foram quarentenadas preventivamente. O seu acesso biométrico ao barramento estatal permanece temporariamente suspenso para salvaguarda de integridade.`,
                    deadline: "IMEDIATO",
                    state: "Quarentena Activa",
                    actions: ["Ver Protocolo", "Baixar Auto de Suspensão"]
                  },
                  protocol: {
                    internalId: "INT-SOC-AN-2026",
                    protocolNumber: "SOC-AN-2026",
                    issuerInstitution: "SOC - CENTRO DE SEGURANÇA NACIONAL",
                    officialIssueDate: dateAO,
                    officialTime: timeAO,
                    issuerResponsible: "Gabinete de Crise",
                    category: "Cibernética",
                    documentType: "Protocolo Nacional",
                    currentState: "Suspenso",
                    priority: "Crítica",
                    deadlineDate: dateAO,
                    qrCodeUrl: "",
                    digitalSignature: "VALIDA",
                    documentHash: "sha256-6bd19ac268c2-emergency-protocol-block-key-strict"
                  }
                };

                setInbox(prev => [killSwitchMessage, ...prev]);

                // Suspend the active citizen profile status indicator
                setVerificationStatus('Acesso Biométrico Suspenso / Chaves Bloqueadas para Salvaguarda de Soberania');
              } else {
                addAuditLog('PROTOCOLO SOC-AN-2026 DESATIVADO: Restabelecimento Geral de Credenciais Faciais', 'success');
                setVerificationStatus('Totalmente verificado');
              }
            }}
          />
        );

      default:
        return null;
    }
  };

  if (pageLoading) {
    return (
      <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-white">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="text-primary"
        >
          <Loader2 size={48} />
        </motion.div>
      </div>
    );
  }

  if (stage === 'splash') {
    return (
      <section className="min-h-screen bg-white grid place-items-center relative">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center z-10 w-full max-w-md px-8"
        >
          <LazyImage 
            src="https://i.postimg.cc/cCkwskty/Logomarca-Correio-Digital.png" 
            alt="Correio Digital Logo" 
            priority={true}
            placeholder="skeleton"
            className="w-64 md:w-80 h-auto mx-auto mb-12"
            style={{ 
              width: '16rem', 
              height: 'auto',
              marginBottom: '3rem',
              marginLeft: 'auto',
              marginRight: 'auto',
            }}
          />
          <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden border border-slate-100">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ duration: 5, ease: "linear" }}
              className="h-full bg-primary rounded-full"
            />
          </div>
          <motion.p className="text-slate-500 text-[10px] md:text-xs font-black uppercase tracking-[0.2em] mt-4">
            {t("A carregar plataforma oficial...")}
          </motion.p>
        </motion.div>
      </section>
    );
  }

  if (stage === 'login') {
    const handleDemoAutofill = () => {
      const preset = DEMO_CREDENTIALS[appMode];
      setBi(preset.identifier);
      setLoginPasswordInput(preset.password);
      setProfileName(preset.profileName);
      setPhone(preset.phone);
      setNif(preset.nif);
      setPassport(preset.passport);
      setUserBirthDate(preset.birthDate);
      setUserFiliation(preset.filiation);
      setUserMaritalStatus(preset.maritalStatus);
      setVerificationStatus(preset.verificationStatus);
      setHasTwoFactor(preset.hasTwoFactor);
      setHasFacialAuth(preset.hasFacialAuth);
      setGovPin(preset.govPin);
      setLoginError(null);
      addAuditLog(`AUTO_FILL_DEMO: Credenciais de demonstração carregadas para ${appMode}`, 'info');
    };

    const handleDemoFaceCapture = async () => {
      if (emergencyMode && !isInstMode && !isGovMode && (bi.toLowerCase().includes('002931298') || bi.toLowerCase().includes('edlasio') || profileName.toLowerCase().includes('edlasio'))) {
        setLoginError("Autenticação Biométrica Recusada: Credenciais e chaves biométricas bloqueadas temporariamente ao abrigo do protocolo SOC-AN-2026. Acesso Suspenso para Salvaguarda de Soberania.");
        addAuditLog("Interrupção de segurança: captura facial recusada (SOC-AN-2026)", "critical");
        return;
      }
      const captured = captureLoginFaceFrame();
      if (!captured) {
        setFaceCaptureError('Não foi possível capturar a imagem facial. Aguarde a ativação da câmara e tente novamente.');
        return;
      }

      setFaceCaptureError(null);
      setFaceProgress(20);
      setIsFaceScanning(true);
      setFaceCaptureHint(demoFaceTemplateLoaded ? 'A comparar o rosto capturado com o perfil local armazenado...' : 'A registar o rosto localmente neste dispositivo...');
      addAuditLog('Iniciou digitalização biométrica facial no portal', 'info');

      const finalize = (progress: number) => new Promise(resolve => setTimeout(() => {
        setFaceProgress(progress);
        resolve(true);
      }, 220));

      await finalize(45);
      await finalize(75);

      if (demoFaceTemplateLoaded) {
        const stored = readStoredDemoFace();
        const diff = stored?.signature ? compareFaceSignatures(captured.signature, stored.signature) : 999;
        if (!stored || diff > 22) {
          setIsFaceScanning(false);
          setFaceProgress(0);
          setFaceCaptureHint('Rosto não reconhecido neste dispositivo.');
          setFaceCaptureError('A validação facial local falhou. Tente novamente ou registe um novo rosto de demonstração.');
          addAuditLog(`DEMO_FACE_LOGIN_FAIL: Correspondência local não validada para ${appMode}`, 'warning');
          return;
        }
        setFaceCaptureHint('Rosto reconhecido com sucesso no dispositivo.');
        await finalize(100);
        setIsFaceScanning(false);
        addAuditLog(`DEMO_FACE_LOGIN_SUCCESS: Correspondência facial validada localmente para ${appMode}`, 'success');
        return;
      }

      const storagePayload = {
        identifier: (bi || DEMO_CREDENTIALS[appMode].identifier).toUpperCase(),
        profileMode: appMode,
        displayName: profileName,
        capturedAt: new Date().toLocaleString('pt-AO'),
        imageDataUrl: captured.imageDataUrl,
        signature: captured.signature,
      };
      localStorage.setItem(getDemoFaceStorageKey(), JSON.stringify(storagePayload));
      setDemoFaceTemplateLoaded(true);
      setDemoFaceTemplateMeta({ capturedAt: storagePayload.capturedAt, identifier: storagePayload.identifier });
      setFaceCaptureHint('Rosto demo registado neste dispositivo com sucesso.');
      await finalize(100);
      setIsFaceScanning(false);
      addAuditLog(`DEMO_FACE_ENROLLED: Rosto local de demonstração registado para ${appMode}`, 'success');
    };

    const handleClearDemoFace = () => {
      localStorage.removeItem(getDemoFaceStorageKey());
      setDemoFaceTemplateLoaded(false);
      setDemoFaceTemplateMeta(null);
      setFaceCaptureHint('Registo facial demo removido deste dispositivo.');
      setFaceCaptureError(null);
      setFaceProgress(0);
      addAuditLog(`DEMO_FACE_RESET: Registo facial local removido para ${appMode}`, 'warning');
    };

    const handleLoginSubmit = () => {
      if (emergencyMode && !isInstMode && !isGovMode && (bi.toLowerCase().includes('002931298') || bi.toLowerCase().includes('edlasio') || profileName.toLowerCase().includes('edlasio'))) {
        setLoginError("Credenciais e chaves biométricas suspensas / bloqueadas temporariamente ao abrigo do protocolo SOC-AN-2026 para salvaguarda de soberania digital nacional.");
        addAuditLog("BLOQUEIO IDENTITÁRIO: Tentativa de login por Edlasio Galhardo suspensa (SOC-AN-2026)", "critical");
        return;
      }
      if (hasTwoFactor) {
        setLoginSubMode('two-factor');
      } else {
        setStage('app');
        addAuditLog('Login de Cidadão via Autenticação Segura', 'success');
      }
    };

    return (
      <section className="min-h-screen p-6 bg-slate-50 flex items-center justify-center font-sans">
        <div className="max-w-[1100px] w-full mx-auto grid grid-cols-1 md:grid-cols-[1.2fr_1fr] gap-6 items-stretch">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className={`hidden md:flex bg-white rounded-[40px] ${loginSubMode === 'face-capture' ? 'p-8 min-h-[480px]' : 'p-12 min-h-[580px]'} border border-slate-100 flex-col items-center justify-center text-center shadow-sm h-full relative overflow-hidden transition-all duration-300`}
          >
            <div className="absolute top-0 right-0 w-80 h-80 bg-primary/2 rounded-full -mr-40 -mt-40 blur-3xl pointer-events-none" />
            
            {showVoiceGuide ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full relative z-10"
              >
                <VoiceGuideAssistant
                  onScrollDown={() => {
                    const el = document.getElementById('cda-login-form-container');
                    if (el) {
                      el.scrollIntoView({ behavior: 'smooth' });
                    } else {
                      window.scrollTo({ top: 350, behavior: 'smooth' });
                    }
                  }}
                  onFocusSteps={() => {
                    setHighlightSteps(true);
                    setTimeout(() => setHighlightSteps(false), 5000);
                  }}
                  onCollapseStart={() => {
                    setLoginSubMode('register');
                  }}
                  onCloseAssistant={() => {
                    setShowVoiceGuide(false);
                  }}
                />
              </motion.div>
            ) : (
              <div className="flex flex-col items-center relative z-10">
                <LazyImage
                  src="https://i.postimg.cc/cCkwskty/Logomarca-Correio-Digital.png" 
                  alt="Correio Digital" 
                  priority={true}
                  placeholder="skeleton"
                  className={loginSubMode === 'face-capture' ? "w-48 h-auto mb-4" : "w-72 h-auto mb-8"}
                />
                <h1 className={`${loginSubMode === 'face-capture' ? 'text-xl md:text-2xl mb-2' : 'text-2xl md:text-3xl mb-4'} font-black text-slate-900 leading-tight italic uppercase tracking-tight`}>
                  {t("O seu novo endereço digital oficial")}
                </h1>
                <p className="text-slate-500 leading-relaxed max-w-sm text-sm font-semibold">
                  {t("Receba, assine e despache correspondência governamental com validade jurídica do Estado da República de Angola.")}
                </p>
                <div className={`${loginSubMode === 'face-capture' ? 'mt-4' : 'mt-8'} flex flex-col items-center`}>
                  <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-100 rounded-full text-[10px] text-slate-400 font-extrabold uppercase tracking-widest">
                    <ShieldCheck size={14} className="text-emerald-500" /> {t("Infraestrutura Oficial Segura SME & AGT")}
                  </div>
                </div>
              </div>
            )}
          </motion.div>

          <motion.div 
            id="cda-login-form-container"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className={`bg-white rounded-[40px] ${loginSubMode === 'face-capture' ? 'p-5 md:p-6 min-h-[480px]' : 'p-8 md:p-12 min-h-[580px]'} shadow-xl border border-slate-100 flex flex-col justify-between h-full transition-all duration-300 relative ${
              highlightSteps 
                ? 'ring-4 ring-blue-500 ring-offset-4 shadow-[0_0_30px_rgba(37,99,235,0.35)] scale-[1.01]' 
                : ''
            }`}
          >
            <AnimatePresence mode="wait">
              {loginError && (
                <motion.div 
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="bg-red-50 border border-red-200/60 text-red-700 px-4 py-3 rounded-2xl text-[10.5px] font-bold flex items-start gap-2 mb-4 leading-normal animate-fadeIn"
                >
                  <AlertTriangle size={15} className="text-red-500 shrink-0 mt-0.5 animate-bounce" />
                  <div>
                    <span className="font-extrabold block">ACESSO NEGADO / PROTOCOLO CRÍTICO</span>
                    {loginError}
                  </div>
                </motion.div>
              )}

              {loginSubMode === 'normal' && (
                <motion.div
                  key="login-normal"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6 flex-1 flex flex-col justify-center animate-fadeIn"
                >
                  {/* Tabs layout exactly matching the image */}
                  <div className="flex items-center justify-center gap-8 text-[11px] font-black uppercase tracking-widest border-b border-slate-100 pb-3 mb-2">
                    <button
                      type="button"
                      onClick={() => {
                        setAppMode('user');
                        setTab('home');
                        setLoginSubMode('normal');
                        setStage('login');
                      }}
                      className={`transition-all cursor-pointer bg-transparent border-none pb-2.5 relative font-extrabold ${appMode === 'user' ? 'text-primary' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                      {t("Cidadão")}
                      {appMode === 'user' && (
                        <span className="absolute bottom-0 left-0 right-0 h-[3px] bg-primary rounded-full animate-fadeIn" />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setAppMode('institution');
                        setTab('home');
                        setLoginSubMode('normal');
                        setStage('login');
                      }}
                      className={`transition-all cursor-pointer bg-transparent border-none pb-2.5 relative font-extrabold ${appMode === 'institution' ? 'text-primary' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                      {t("Instituição")}
                      {appMode === 'institution' && (
                        <span className="absolute bottom-0 left-0 right-0 h-[3px] bg-primary rounded-full animate-fadeIn" />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setAppMode('admin');
                        setTab('gov-dashboard');
                        setLoginSubMode('normal');
                        setStage('login');
                      }}
                      className={`transition-all cursor-pointer bg-transparent border-none pb-2.5 relative font-extrabold ${appMode === 'admin' ? 'text-primary' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                      {t("Admin")}
                      {appMode === 'admin' && (
                        <span className="absolute bottom-0 left-0 right-0 h-[3px] bg-primary rounded-full animate-fadeIn" />
                      )}
                    </button>
                  </div>

                  <div className="text-center space-y-2">
                    {/* Centered User Avatar exactly like the first image */}
                    <div className="flex justify-center mb-1">
                      <div className="w-16 h-16 rounded-full bg-[#f0f4f9] flex items-center justify-center border border-slate-100 shadow-3xs">
                        <User className="text-[#0c2340]" size={24} />
                      </div>
                    </div>

                    <h2 className="text-3xl font-black text-[#0c2340] tracking-tight uppercase leading-none">
                      LOGIN
                    </h2>
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest leading-none mt-1">
                      {isInstMode ? t('Canal oficial das instituições aderentes') : isGovMode ? t('Acesso reservado à administração central') : t('Acesso oficial do cidadão digital')}
                    </p>
                  </div>

                  <div className="space-y-4 pt-1">
                    {/* Input wrapper with Icon on left exactly like image 1 */}
                    <div className="grid gap-1.5 text-left">
                      <span className="text-[10px] text-slate-505 font-extrabold tracking-wider uppercase">
                        {(isInstMode || isGovMode) ? t("Número de Agente") : t("Número de BI de Cidadão")}
                      </span>
                      <div className="flex items-center gap-3.5 bg-white border border-slate-200 focus-within:border-[#0c2340] focus-within:ring-1 focus-within:ring-[#0c2340] rounded-[16px] px-3.5 py-1.5 transition-all">
                        <div className="w-11 h-11 bg-[#f0f4f9] text-[#1e3a8a] rounded-xl flex items-center justify-center shrink-0">
                          <IdCard size={20} className="text-[#2563eb]" />
                        </div>
                        <input 
                          className="w-full bg-transparent font-mono font-bold tracking-wider text-slate-800 border-none outline-none text-sm placeholder-slate-400"
                          value={bi}
                          onChange={(e) => setBi(e.target.value.toUpperCase())}
                          placeholder={isInstMode ? "AGT-9921-SR" : isGovMode ? "ADM-8812-OP" : "009874562LA041"}
                          maxLength={14}
                        />
                      </div>
                    </div>

                    <div className="grid gap-1.5 text-left">
                      <span className="text-[10px] text-slate-505 font-extrabold tracking-wider uppercase">
                        {t("Senha de Acesso")}
                      </span>
                      <div className="flex items-center gap-3.5 bg-white border border-slate-200 focus-within:border-[#0c2340] focus-within:ring-1 focus-within:ring-[#0c2340] rounded-[16px] px-3.5 py-1.5 transition-all">
                        <div className="w-11 h-11 bg-[#f0f4f9] text-[#1e3a8a] rounded-xl flex items-center justify-center shrink-0">
                          <Lock size={18} className="text-[#2563eb]" />
                        </div>
                        <input 
                          type="password"
                          className="w-full bg-transparent font-bold tracking-wider text-slate-800 border-none outline-none text-sm placeholder-slate-400"
                          placeholder="••••••••••••"
                          value={loginPasswordInput}
                          onChange={(e) => setLoginPasswordInput(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="pt-2 flex flex-col gap-4">
                      {/* Button ENTRAR NO PORTAL */}
                      <button 
                        onClick={handleLoginSubmit}
                        className="w-full bg-[#0c2340] hover:bg-slate-900 text-white rounded-[16px] py-4 font-black text-xs uppercase tracking-widest shadow-lg shadow-[#0c2340]/15 hover:opacity-95 transition-all cursor-pointer border-none"
                      >
                        {t("Entrar no Portal")}
                      </button>

                      {/* Button AUTO PREENCHER DEMONSTRAÇÃO */}
                      <div className="flex flex-col items-stretch">
                        <button
                          type="button"
                          onClick={handleDemoAutofill}
                          className="w-full bg-white hover:bg-slate-50 text-blue-600 border border-blue-600 rounded-[16px] py-3.5 font-bold text-xs uppercase tracking-widest transition-all cursor-pointer"
                        >
                          {t("Auto Preencher Demonstração")}
                        </button>
                      </div>

                      {/* Separador Horizontal Moderno "Ou" */}
                      <div className="relative flex items-center py-1">
                        <div className="flex-grow border-t border-slate-200"></div>
                        <span className="flex-shrink mx-4 text-slate-455 text-[10px] font-black uppercase tracking-[0.2em] bg-white px-3 select-none">{t("Ou")}</span>
                        <div className="flex-grow border-t border-slate-200"></div>
                      </div>

                      {/* Credentials sub text below separator */}
                      <div className="space-y-3">
                        <p className="text-[10px] text-slate-505 font-extrabold text-center uppercase tracking-wider">
                          {isInstMode ? t('Credenciais de apresentação profissional') : isGovMode ? t('Credenciais de apresentação corporativa') : t('CREDENCIAIS DE APRESENTAÇÃO DO CIDADÃO')}
                        </p>

                        {/* Button LOGIN FACIAL */}
                        <button 
                          type="button"
                          onClick={() => {
                            if (emergencyMode && !isInstMode && !isGovMode && (bi.toLowerCase().includes('002931298') || bi.toLowerCase().includes('edlasio') || profileName.toLowerCase().includes('edlasio'))) {
                              setLoginError(t("Autenticação Biométrica Recusada: Credenciais e chaves biométricas bloqueadas temporariamente ao abrigo do protocolo SOC-AN-2026."));
                              addAuditLog("Interrupção de segurança: tentativa de login facial suspensa (SOC-AN-2026)", "critical");
                              return;
                            }
                            setFaceProgress(0);
                            setLoginSubMode('face-capture');
                            addAuditLog('Iniciado Login Biométrico Facial', 'info');
                          }}
                          className="w-full bg-[#f8fafc] hover:bg-slate-100 text-[#2563eb] border border-slate-200 rounded-[16px] py-4 font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-3 cursor-pointer shadow-3xs"
                        >
                          <Fingerprint size={18} className="text-[#2563eb] shrink-0" />
                          {t("Login Facial")}
                        </button>
                      </div>

                      {/* Footer border and buttons for Citizen */}
                      <div className="pt-4 mt-1 border-t border-slate-100 flex items-center justify-between">
                        <button
                          type="button"
                          onClick={() => {
                            setLoginSubMode('register');
                          }}
                          className="text-slate-600 hover:text-[#0c2340] transition-colors bg-transparent border-none cursor-pointer text-[10px] font-black uppercase tracking-widest font-sans flex items-center gap-1.5"
                        >
                          <UserPlus size={14} className="text-[#2563eb]" />
                          {t("Registar")}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setAccessModalTitle('Recuperação de Credenciais');
                            setAccessModalMessage('Para recuperar a sua senha ou o seu código de segurança governamental (PIN), por favor dirija-se a um guiché físico de atendimento do SME, AGT ou contacte a linha oficial de suporte do Correio Digital de Angola.');
                            setShowAccessModal(true);
                          }}
                          className="text-slate-650 hover:text-[#0c2340] transition-colors bg-transparent border-none cursor-pointer text-[10px] font-black uppercase tracking-widest font-sans flex items-center gap-1.5"
                        >
                          <Lock size={14} className="text-[#2563eb]" />
                          {t("Esqueci Senha")}
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {loginSubMode === 'two-factor' && (
                <motion.div
                  key="login-2fa"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6 flex-1 flex flex-col justify-center text-center animate-fadeIn"
                >
                  {/* Top Avatar Circle exactly like Image 2 */}
                  <div className="mx-auto w-20 h-20 bg-[#f0f9ff] text-blue-600 rounded-full flex items-center justify-center shadow-xs border border-blue-100 mb-2">
                    <Smartphone size={32} className="text-[#2563eb]" />
                  </div>
                  
                  <div>
                    <h3 className="text-2xl font-black text-[#0c2340] uppercase tracking-tight">{t("Autenticação de canais")}</h3>
                    <p className="text-slate-500 text-xs font-semibold max-w-sm mx-auto mt-1 leading-relaxed">
                      {t("Enviámos um SMS com o código aleatório temporário (OTP) para o telemóvel associado:")}{' '}
                      <strong className="text-[#2563eb] font-extrabold font-mono">{phone.replace(/\d{3} \d{3}$/, '*** ***')}</strong>
                    </p>
                  </div>

                  <div className="space-y-6">
                    <div className="text-center space-y-2">
                      <span className="text-[11px] text-slate-500 font-extrabold uppercase tracking-wider">{t("Insira o código de 6 dígitos enviado por SMS")}</span>
                      
                      {/* OTP field container card with 6 slots like Image 2 */}
                      <div className="relative py-4 max-w-md mx-auto bg-[#fafbfc]/50 border border-slate-100 rounded-2xl p-4 shadow-3xs">
                        {/* Hidden input overlay */}
                        <input 
                          type="tel"
                          pattern="[0-9]*"
                          maxLength={6}
                          value={enteredOtp}
                          onChange={(e) => setEnteredOtp(e.target.value.replace(/\D/g, ''))}
                          className="absolute inset-0 opacity-0 cursor-text w-full h-full z-20"
                          autoFocus
                        />
                        {/* 6 Grid visual indicators */}
                        <div className="grid grid-cols-6 gap-2.5">
                          {[0, 1, 2, 3, 4, 5].map((idx) => {
                            const val = enteredOtp[idx] || '';
                            const isFocused = enteredOtp.length === idx;
                            return (
                              <div
                                key={idx}
                                className={`h-14 rounded-xl bg-white border flex items-center justify-center font-mono font-black text-xl transition-all ${
                                  isFocused 
                                    ? 'border-blue-500 ring-2 ring-blue-100 scale-102 shadow-xs' 
                                    : 'border-slate-200 text-slate-800'
                                }`}
                              >
                                {val ? val : <span className="text-slate-300 font-normal leading-none">-</span>}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Simultaion notification badge like Image 2 */}
                    <div className="bg-blue-50/50 border border-blue-100/70 rounded-2xl p-4 flex items-center gap-3.5 text-left max-w-md mx-auto">
                      <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center shrink-0">
                        <Lightbulb className="text-white fill-[#fcd34d]" size={18} />
                      </div>
                      <div className="text-xs">
                        <h5 className="font-extrabold text-[#0c2340] leading-none mb-0.5">Dica de Simulação:</h5>
                        <p className="text-slate-500 font-semibold leading-normal">
                          O código de teste recebido por canais é <strong className="text-blue-700 font-mono font-extrabold text-sm select-all">123456</strong>
                        </p>
                      </div>
                    </div>

                    {/* Actions precisely styled with Cancel & Validar buttons like Image 2 */}
                    <div className="pt-2 grid grid-cols-2 gap-4 max-w-md mx-auto">
                      <button 
                        onClick={() => setLoginSubMode('normal')}
                        className="py-3.5 bg-white border border-slate-200 text-slate-600 font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-slate-50 transition-all cursor-pointer shadow-3xs"
                      >
                        {t("Cancelar")}
                      </button>
                      <button 
                        onClick={() => {
                          if (enteredOtp === '123456' || enteredOtp.length === 6) {
                            setStage('app');
                            addAuditLog('Login concluído com factor duplo SMS', 'success');
                          } else {
                            alert(t("Código de verificação OTP incorrecto. Utilize o código de simulação 123456."));
                          }
                        }}
                        className="py-3.5 bg-[#0c2340] hover:bg-slate-900 border-none text-white font-black text-xs uppercase tracking-widest rounded-2xl flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md"
                      >
                        {t("Validar OTP")}
                        <ChevronRight size={14} className="stroke-[2.5]" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              {loginSubMode === 'face-capture' && (
                <motion.div
                  key="login-face"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-4 flex-1 flex flex-col justify-center text-center p-2 relative"
                >
                  {/* Badge top */}
                  <div className="inline-flex items-center gap-1 bg-blue-50/70 border border-blue-100/50 px-3 py-1 rounded-full text-blue-600 font-extrabold text-[9px] uppercase tracking-[0.15em] mx-auto w-fit">
                    <Shield size={11} className="text-blue-500" />
                    {t("LOGIN FACIAL")}
                  </div>

                  {/* Title & Subtitle with relative Back button on left */}
                  <div className="space-y-1 relative">
                    <div className="flex items-center justify-center gap-2 relative">
                      <button
                        type="button"
                        onClick={() => {
                          setLoginSubMode('normal');
                          addAuditLog('Sair do login facial', 'info');
                        }}
                        className="absolute left-1 p-1.5 hover:bg-slate-100 rounded-full transition-all text-slate-500 hover:text-slate-800 border-0 cursor-pointer flex items-center justify-center focus:outline-none"
                        title={t("Voltar")}
                      >
                        <ArrowLeft size={18} />
                      </button>
                      <h2 className="text-xl md:text-2xl font-black text-[#0f172a] tracking-tight leading-none">
                        {t("Login Facial")}
                      </h2>
                    </div>
                    <p className="text-slate-500 text-[11px] font-semibold max-w-sm mx-auto leading-normal px-8">
                      {t("Registe o seu padrão facial tridimensional codificado na infraestrutura do")} <strong className="font-extrabold text-blue-600">SME</strong>.
                    </p>
                  </div>

                  {/* Circle Scanning area */}
                  <div className="relative flex justify-center py-1">
                    <div className="relative w-38 h-38 rounded-full flex items-center justify-center bg-white shadow-lg">
                      {/* SVG Ring Progress */}
                      <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none z-10" viewBox="0 0 100 100">
                        <circle
                          cx="50"
                          cy="50"
                          r="46"
                          fill="none"
                          stroke="#f1f5f9"
                          strokeWidth="2.5"
                        />
                        <circle
                          cx="50"
                          cy="50"
                          r="46"
                          fill="none"
                          stroke="#2563eb"
                          strokeWidth="3"
                          strokeDasharray={`${2 * Math.PI * 46}`}
                          strokeDashoffset={`${2 * Math.PI * 46 * (1 - faceProgress / 100)}`}
                          className="transition-all duration-150 ease-out"
                          strokeLinecap="round"
                        />
                        {/* Indicator Slider Dot */}
                        {faceProgress > 0 && faceProgress < 100 && (
                          <circle
                            cx={50 + 46 * Math.cos((faceProgress / 100) * 2 * Math.PI - Math.PI / 2)}
                            cy={50 + 46 * Math.sin((faceProgress / 100) * 2 * Math.PI - Math.PI / 2)}
                            r="2.5"
                            fill="#3b82f6"
                            className="shadow-sm"
                          />
                        )}
                      </svg>

                      {/* Main dark vector circle */}
                      <div className="w-32 h-32 rounded-full overflow-hidden bg-gradient-to-b from-[#0f172a] to-[#1e1b4b] relative flex items-center justify-center border-4 border-white shadow-inner z-5">
                        {/* Faint Tech Grid */}
                        <div className="absolute inset-0 bg-[linear-gradient(to_right,#334155_1px,transparent_1px),linear-gradient(to_bottom,#334155_1px,transparent_1px)] bg-[size:10px_10px] opacity-25" />

                        {/* Scanner Laser Bar */}
                        {isFaceScanning && (
                          <div 
                            className="absolute top-0 left-0 right-0 h-1 bg-blue-500 shadow-[0_0_12px_rgba(59,130,246,0.9)] z-20 pointer-events-none" 
                            style={{
                              animation: 'scan-motion 2.5s infinite ease-in-out',
                              position: 'absolute'
                            }} 
                          />
                        )}

                        {/* Bracket Corners */}
                        <div className="absolute top-4 left-4 w-3.5 h-3.5 border-t border-l border-white rounded-tl-xs opacity-80 pointer-events-none" />
                        <div className="absolute top-4 right-4 w-3.5 h-3.5 border-t border-r border-white rounded-tr-xs opacity-80 pointer-events-none" />
                        <div className="absolute bottom-4 left-4 w-3.5 h-3.5 border-b border-l border-white rounded-bl-xs opacity-80 pointer-events-none" />
                        <div className="absolute bottom-4 right-4 w-3.5 h-3.5 border-b border-r border-white rounded-br-xs opacity-80 pointer-events-none" />

                        {webcamReady ? (
                          <video
                            ref={loginFaceVideoRef}
                            autoPlay
                            playsInline
                            muted
                            className="w-[105%] h-[105%] object-cover absolute inset-0 opacity-95 z-10 scale-95"
                          />
                        ) : (
                          <img 
                            src="/src/assets/images/login_facial_1780856940336.png" 
                            alt="Vetor Facial Biométrico" 
                            className="w-[105%] h-[105%] object-cover absolute inset-0 opacity-90 pointer-events-none z-10 scale-95" 
                            referrerPolicy="no-referrer"
                          />
                        )}
                        <canvas ref={loginFaceCanvasRef} className="hidden" />

                        {/* Overlapping Camera button indicator */}
                        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-7 h-7 rounded-full bg-slate-950/70 border border-white/20 flex items-center justify-center text-white z-20 shadow-lg">
                          <Camera size={10} className={isFaceScanning ? "animate-pulse text-blue-400" : webcamReady ? "text-emerald-300" : "text-slate-200"} />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Verification Status Banner */}
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5 justify-center">
                      <CheckCircle size={13} className={faceProgress === 100 ? "text-emerald-500" : isFaceScanning ? "text-blue-500 animate-spin" : "text-emerald-500"} />
                      <span className="text-emerald-600 font-extrabold uppercase tracking-widest text-[8.5px] font-sans">
                        {faceProgress === 100 ? (demoFaceTemplateLoaded ? t("Face local validada") : t("Face demo registada")) : isFaceScanning ? `${t("A processar")}: ${faceProgress}%` : demoFaceTemplateLoaded ? t("Pronto para validação local") : t("Pronto para registo local")}
                      </span>
                    </div>
                    <p className="text-slate-400 text-[9.5px] font-semibold">
                      {t(faceCaptureHint)}
                    </p>
                    {demoFaceTemplateMeta && (
                      <p className="text-[8px] text-slate-400 font-mono uppercase tracking-wider">
                        {t("Demo local registada em")} {demoFaceTemplateMeta.capturedAt}
                      </p>
                    )}
                    {faceCaptureError && (
                      <p className="text-[9px] text-red-600 font-bold">{t(faceCaptureError)}</p>
                    )}
                    {webcamPermissionDenied && (
                      <p className="text-[9px] text-amber-600 font-bold">{t("A câmara está bloqueada. Autorize o acesso para usar o login facial demo.")}</p>
                    )}
                  </div>

                  {/* Main Action Buttons */}
                  <div className="space-y-2.5">
                    <button
                      type="button"
                      disabled={isFaceScanning || !webcamReady}
                      onClick={handleDemoFaceCapture}
                      className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-5 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-blue-500/15 hover:opacity-95 active:scale-95 transition-all disabled:opacity-40 disabled:scale-100 disabled:shadow-none cursor-pointer border-0"
                    >
                      <Fingerprint size={14} />
                      {demoFaceTemplateLoaded ? t('VALIDAR FACE LOCAL') : t('REGISTAR FACE NESTE DISPOSITIVO')}
                    </button>
                    <div className="flex flex-wrap items-center justify-center gap-3 text-[9px] font-black uppercase tracking-widest">
                      <button
                        type="button"
                        onClick={handleDemoAutofill}
                        className="text-slate-400 hover:text-primary transition-colors cursor-pointer bg-transparent border-0"
                      >
                        {t("Auto Preencher Demonstração")}
                      </button>
                      {demoFaceTemplateLoaded && (
                        <button
                          type="button"
                          onClick={handleClearDemoFace}
                          className="text-rose-500 hover:text-rose-700 transition-colors cursor-pointer bg-transparent border-0"
                        >
                          {t("Limpar Face Demo")}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Encryption Footer label */}
                  <div className="flex items-center justify-center gap-1.5 text-slate-400 text-[8.5px] font-bold">
                    <Lock size={11} className="text-slate-400" />
                    <span>{t("Modo demonstração: a face é guardada localmente neste dispositivo.")}</span>
                  </div>
                </motion.div>
              )}

              {loginSubMode === 'register' && (
                <motion.div
                  key="login-register"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex-1 flex flex-col justify-center"
                >
                  <RegisterStepper 
                    onCancel={() => setLoginSubMode('normal')} 
                    onSuccess={() => setLoginSubMode('normal')}
                    addAuditLog={addAuditLog}
                  />
                </motion.div>
              )}


            </AnimatePresence>
          </motion.div>
        </div>

        {/* Modal de Detalhes Adicionais (Registar / Esqueci Senha) */}
        <AnimatePresence>
          {showAccessModal && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowAccessModal(false)}
                className="fixed inset-0 bg-slate-950/65 backdrop-blur-sm z-[300]"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="fixed inset-x-4 bottom-4 md:bottom-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:max-w-sm bg-white rounded-[32px] shadow-2xl z-[301] overflow-hidden border border-slate-100 text-left font-sans flex flex-col max-h-[85vh]"
              >
                {/* Header */}
                <div className="bg-gradient-to-r from-slate-900 to-indigo-950 p-6 text-white relative">
                  <button
                    onClick={() => setShowAccessModal(false)}
                    className="absolute top-5 right-5 p-1.5 hover:bg-white/10 rounded-full transition-all cursor-pointer border-0 text-white bg-transparent flex items-center justify-center placeholder:hidden"
                    type="button"
                  >
                    <X size={18} />
                  </button>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/10 rounded-[14px] flex items-center justify-center text-white border border-white/20">
                      <Shield size={20} className="text-indigo-200" />
                    </div>
                    <div>
                      <div className="text-[8px] font-black uppercase tracking-[0.2em] text-indigo-300 font-bold">Correio Digital de Angola</div>
                      <h3 className="text-base font-black italic tracking-tight uppercase leading-none mt-1">
                        {accessModalTitle}
                      </h3>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 md:p-8 space-y-4 overflow-y-auto custom-scrollbar">
                  <p className="text-slate-600 text-xs font-semibold leading-relaxed">
                    {accessModalMessage}
                  </p>
                  
                  <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex gap-3 text-left">
                    <ShieldCheck size={18} className="text-primary shrink-0 mt-0.5" />
                    <div className="space-y-0.5">
                      <p className="text-[10px] font-black text-slate-800 uppercase tracking-tight">Segurança Validada pelo Estado</p>
                      <p className="text-[9px] text-slate-450 font-medium leading-relaxed uppercase">
                        Todas as transações e acessos a este portal estão associados de forma única à sua identidade civil nacional.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setShowAccessModal(false)}
                    className="px-6 py-3 bg-primary hover:bg-indigo-700 text-white rounded-xl font-black text-[10px] uppercase tracking-widest transition-all cursor-pointer border-0 shadow-lg shadow-primary/10"
                  >
                    Compreendido
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Floating Voice Guide Assistant for Mobile Screens */}
        {showVoiceGuide && (
          <div className="fixed bottom-6 right-6 z-[150] max-w-sm w-[calc(100vw-32px)] md:hidden block">
            <VoiceGuideAssistant
              onScrollDown={() => {
                const el = document.getElementById('cda-login-form-container');
                if (el) {
                  el.scrollIntoView({ behavior: 'smooth' });
                } else {
                  window.scrollTo({ top: 350, behavior: 'smooth' });
                }
              }}
              onFocusSteps={() => {
                setHighlightSteps(true);
                setTimeout(() => setHighlightSteps(false), 5000);
              }}
              onCollapseStart={() => {
                setLoginSubMode('register');
              }}
              onCloseAssistant={() => {
                setShowVoiceGuide(false);
              }}
            />
          </div>
        )}
      </section>
    );
  }


  return (
    <main className={`min-h-screen bg-bg text-primary md:flex md:gap-5 md:p-5 font-sans selection:bg-primary selection:text-white transition-all ${emergencyMode && isGovMode ? 'pt-[32px] md:pt-[44px]' : ''}`}>
      {/* Navigation */}
      <AnimatePresence>
        {emergencyMode && isGovMode && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 32, opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="fixed top-0 left-0 right-0 z-[2000] bg-red-600 text-white flex items-center justify-center gap-3 overflow-hidden shadow-2xl"
          >
            <ShieldAlert size={16} className="animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] italic">MODO DE EMERGÊNCIA ACTIVO - OPERAÇÕES RESTRITAS</span>
            <ShieldAlert size={16} className="animate-pulse" />
          </motion.div>
        )}
      </AnimatePresence>
      
      <Sidebar 
        tab={tab} 
        setTab={setTab} 
        setSelectedMessage={setSelectedMessage} 
        setSelectedDoc={setSelectedDoc}
        handleLogout={handleLogout}
        appMode={appMode}
        setAppMode={setAppMode}
        setStage={(s) => {
          setStage(s);
          if (s === 'splash') {
            setLoginSubMode('normal');
          }
        }}
        currentLanguage={currentLanguage}
      />
      <MobileNavBar 
        tab={tab} 
        setTab={setTab} 
        setSelectedMessage={setSelectedMessage} 
        setSelectedDoc={setSelectedDoc}
        appMode={appMode}
        currentLanguage={currentLanguage}
      />

      <div className="flex-1 md:bg-white md:rounded-[24px] md:shadow-xl md:border-2 md:border-[#D1D5DB] md:overflow-hidden flex flex-col min-h-screen md:min-h-0 relative">
        <div className={emergencyMode && isGovMode ? 'md:mt-0' : ''}>
          <Header 
            setTab={setTab} 
            tab={tab}
            currentLanguage={currentLanguage}
            setCurrentLanguage={setCurrentLanguage}
            iaLiveActive={iaLiveActive} 
            startIaVoice={startIaVoice} 
            stopIaVoice={stopIaVoice} 
            notifications={notifications}
            showNotifications={showNotifications}
            setShowNotifications={setShowNotifications}
            isChatOpen={isChatOpen}
            setIsChatOpen={setIsChatOpen}
            appMode={appMode}
            emergencyMode={emergencyMode}
            isOnline={isOnline}
            onClickConnectivity={() => {
              setOfflineQueue(OfflineManager.getQueue());
              setShowOfflineManagerWidget(!showOfflineManagerWidget);
            }}
            offlineQueueLength={offlineQueue.length}
            NotificationDropdown={() => (
              <NotificationDropdown 
                showNotifications={showNotifications} 
                setShowNotifications={setShowNotifications} 
                notifications={notifications} 
                setTab={setTab} 
                setSelectedDoc={setSelectedDoc} 
                onClickNotification={(n) => {
                  setActiveNotificationModal(n);
                  setNotifications((prev) => prev.filter((item) => item.id !== n.id));
                  setShowNotifications(false);
                }}
                onDeleteNotification={(id) => {
                  setNotifications((prev) => prev.filter((item) => item.id !== id));
                }}
              />
            )}
          />
        </div>

        {/* Content Area */}
        <div 
          ref={contentRef}
          className={`flex-1 px-4 pb-32 md:p-8 overflow-y-auto custom-scrollbar ${emergencyMode && isGovMode ? 'pt-[104px] md:pt-1' : (isGovMode ? 'pt-16 md:pt-1' : 'pt-16 md:pt-4')}`}
        >
          <div className="max-w-[1400px] mx-auto">
            {renderContent()}
          </div>
        </div>
      </div>

      <AIChatAssistant 
        isOpen={isChatOpen}
        onClose={() => {
          setIsChatOpen(false);
          stopIaVoice();
        }}
        currentLanguage={currentLanguage}
        iaLiveActive={iaLiveActive} 
        stopIaVoice={stopIaVoice}
        appMode={appMode}
        onCreateRequest={handleCreateRequest}
        onNavigate={setTab}
        activeTab={tab}
        pageContextHint={getPageContentDescription(tab)}
      />

      <AddContactModal 
        isAddingContact={isAddingContact} 
        setIsAddingContact={setIsAddingContact} 
        contactForm={contactForm} 
        setContactForm={setContactForm} 
        onAddContact={handleAddContact} 
      />

      <InviteConfirmModal 
        showInviteConfirm={showInviteConfirm} 
        setShowInviteConfirm={setShowInviteConfirm} 
        contactForm={contactForm} 
        handleAddContact={handleAddContact} 
      />

      <DeleteContactModal 
        contactToDelete={contactToDelete} 
        setContactToDelete={setContactToDelete} 
        handleDeleteContact={handleDeleteContact} 
      />

      {/* --- OFFLINE & FALLBACK INTERACTIVE MANAGER WIDGET --- */}
      <div className="fixed bottom-20 md:bottom-6 right-6 z-[9999] flex flex-col items-end gap-3 pointer-events-none select-none">
        {/* Active Fallback Alert Overlay */}
        <AnimatePresence>
          {activeFallback && (
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              className="bg-slate-900 border border-amber-500/30 text-white rounded-2xl p-4 shadow-2xl max-w-sm pointer-events-auto"
            >
              <div className="flex items-start gap-3">
                <div className="p-2 bg-amber-500/15 text-amber-500 rounded-xl">
                  {activeFallback.channel === 'SMS' ? <Mail size={18} /> : activeFallback.channel === 'USSD' ? <Signal size={18} /> : <Smartphone size={18} />}
                </div>
                <div className="flex-1 min-w-0 font-sans">
                  <span className="font-extrabold text-[10px] uppercase tracking-widest text-amber-500 block">Canal Alternativo Acionado ({activeFallback.channel})</span>
                  <p className="text-xs text-slate-200 mt-1 leading-relaxed font-semibold">{activeFallback.message}</p>
                  <div className="mt-2.5 flex items-center justify-between border-t border-slate-800 pt-2 text-[10px] text-slate-400 font-mono">
                    <span>Protocolo: {activeFallback.protocol}</span>
                    <button
                      type="button"
                      onClick={() => setActiveFallback(null)}
                      className="text-amber-500 hover:underline font-bold uppercase tracking-wider cursor-pointer"
                    >
                      Dispensar
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>

      {/* Connectivity Central Modal */}
      <AnimatePresence>
        {showOfflineManagerWidget && (
          <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-[99999] flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-[32px] border border-slate-200 shadow-2xl w-full max-w-sm overflow-hidden text-left mx-3"
            >
              <div className="p-5 bg-slate-950 text-white flex justify-between items-center">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-primary/20 text-primary rounded-xl">
                    <Database size={18} />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-[12px] uppercase tracking-wider text-white font-sans">Gestor Híbrido de Conectividade</h4>
                    <span className="text-[9px] uppercase tracking-widest text-slate-400 block font-sans">Cache Local, Redundância SMS & USSD</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowOfflineManagerWidget(false)}
                  className="text-white/60 hover:text-white p-1 rounded-full hover:bg-white/10"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-4 space-y-4">
                {/* Simulated Switch toggle */}
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 flex items-center justify-between">
                  <div className="font-sans block text-left">
                    <span className="font-bold text-xs text-slate-800 block">Simular Perda de Internet</span>
                    <span className="text-[10px] text-slate-400 leading-tight block mt-0.5">Teste de cache, fallbacks SMS/USSD.</span>
                  </div>

                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={simulatedOffline}
                      onChange={(e) => {
                        const val = e.target.checked;
                        setSimulatedOffline(val);
                        localStorage.setItem('gov_simulated_offline', String(val));
                        addAuditLog(val ? 'Modo de Conectividade: Simulação Offline Ativada' : 'Modo de Conectividade: Voltando ao estado Online', val ? 'warning' : 'success');
                      }}
                      className="sr-only peer" 
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>

                {/* Queue details */}
                <div className="space-y-2 text-left">
                  <div className="flex justify-between items-center font-sans">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">Fila de Ações ({offlineQueue.length})</span>
                    <button
                      type="button"
                      onClick={() => {
                        OfflineManager.setQueue([]);
                        setOfflineQueue([]);
                        addAuditLog('Fila de ações offline limpa manualmente', 'warning');
                      }}
                      className="text-[9px] font-bold text-rose-600 hover:underline uppercase tracking-wide cursor-pointer"
                    >
                      Limpar
                    </button>
                  </div>

                  {offlineQueue.length === 0 ? (
                    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 text-center text-slate-400 font-sans">
                      <Database className="mx-auto text-slate-300 mb-2" size={22} />
                      <p className="text-[11px] font-semibold">Nenhuma ação pendente.</p>
                      <p className="text-[9px] mt-0.5 leading-relaxed">Ações offline serão sincronizadas automaticamente.</p>
                    </div>
                  ) : (
                    <div className="max-h-32 overflow-y-auto space-y-1.5 border border-slate-100 bg-slate-50 rounded-2xl p-2.5">
                      {offlineQueue.map((item) => (
                        <div key={item.id} className="p-2 bg-white rounded-lg border border-slate-150 flex items-center justify-between text-left font-sans">
                          <div>
                            <span className="text-[10px] font-bold text-slate-800 block uppercase font-mono">{item.type}</span>
                            <span className="text-[9px] text-slate-400 block mt-0.5">{new Date(item.timestamp).toLocaleTimeString('pt-AO')}</span>
                          </div>
                          <span className="text-[8px] bg-amber-100 border border-amber-200 text-amber-800 font-extrabold uppercase px-1.5 py-0.5 rounded-full font-mono">Pendente</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Channel Redundancy Info */}
                <div className="bg-indigo-50/50 border border-indigo-100 rounded-2xl p-4 font-sans text-left">
                  <span className="text-[11px] font-extrabold text-[#1e293b] flex items-center gap-1.5 uppercase tracking-wide">
                    <Signal size={14} className="text-primary animate-pulse" /> Canais Redundantes
                  </span>
                  <ul className="text-[10px] text-slate-500 font-bold space-y-1 mt-2 list-disc pl-4 leading-normal">
                    <li><strong className="text-primary">SMS:</strong> Dados compactados para número curto governamental.</li>
                    <li><strong className="text-primary">USSD:</strong> Código *141*9# para certidões sem internet.</li>
                  </ul>
                </div>
              </div>

              {/* Action feet */}
              <div className="p-4 bg-slate-50 border-t border-slate-150 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowOfflineManagerWidget(false)}
                  className="flex-1 py-2.5 bg-white border border-slate-200 text-slate-700 font-bold text-[10px] uppercase tracking-widest rounded-xl hover:bg-slate-100 cursor-pointer"
                >
                  Fechar
                </button>
                <button
                  type="button"
                  disabled={offlineQueue.length === 0}
                  onClick={() => {
                    handleAutomaticSync();
                    setShowOfflineManagerWidget(false);
                  }}
                  className={`flex-1 py-2.5 font-bold text-[10px] uppercase tracking-widest rounded-xl flex items-center justify-center gap-1 cursor-pointer border-0 ${
                    offlineQueue.length > 0 
                      ? 'bg-primary text-white hover:opacity-95 shadow-md' 
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  <RefreshCw size={12} className={offlineQueue.length > 0 ? 'animate-spin' : ''} />
                  Sincronizar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal de Sucesso com Selo de QR Code Gov */}
      <AnimatePresence>
        {successProtocolModal && (
          <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-[99999] flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: -20 }}
              className="bg-white rounded-[32px] border border-slate-200 shadow-2xl w-full max-w-md overflow-hidden text-left mx-4 my-8"
            >
              <div className="p-6 bg-gradient-to-r from-blue-900 to-indigo-950 text-white relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl font-sans"></div>
                <div className="flex items-center gap-3 relative z-10 font-sans">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center text-white shrink-0 shadow-lg shadow-emerald-500/20">
                    <Check size={22} className="stroke-[2.5]" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm uppercase tracking-wide text-white">Correspondência Enviada</h4>
                    <span className="text-[10px] uppercase font-mono tracking-widest text-[#93c5fd] block mt-0.5">Selo Criptográfico de Emissão CDA</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSuccessProtocolModal(null)}
                  className="absolute top-6 right-6 text-white/60 hover:text-white p-1 rounded-full hover:bg-white/10 z-20 cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-5 space-y-4">
                <p className="text-slate-600 text-[11px] text-center leading-relaxed font-semibold font-sans px-2">
                  A correspondência governamental foi autenticada e enviada! O sistema gerou o selo digital oficial com QR Code de rastreio integrado abaixo.
                </p>

                {/* Selo Físico Timbrado Preview */}
                <div className="border border-slate-200 bg-slate-50/50 rounded-2xl p-5 relative overflow-hidden flex flex-col items-center justify-center font-sans">
                  <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-yellow-500 via-yellow-405 to-black"></div>
                  
                  {/* Angola Republic seal mock style */}
                  <div className="flex items-center gap-1.5 mb-4 text-[10px] font-black text-[#0f172a] uppercase tracking-wider">
                    <Shield size={14} className="text-yellow-600 shrink-0" />
                    <span>República de Angola &bull; Ministério CDA</span>
                  </div>

                  {/* QR Canvas Container */}
                  <div className="bg-white p-3.5 rounded-2xl border border-slate-150 shadow-sm relative flex items-center justify-center">
                    <canvas id="protocol-qrcode-canvas" className="w-[140px] h-[140px]" />
                    {/* Inner secure shield icon overlay for gorgeous layout */}
                    <div className="absolute w-8 h-8 rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-center text-white shadow-md top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    </div>
                  </div>

                  {/* Protocol Details */}
                  <div className="mt-4 text-center space-y-1">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block font-sans">Código do Protocolo Nacional</span>
                    <p className="text-xs font-black text-indigo-650 font-mono tracking-wider uppercase select-all">
                      {successProtocolModal.protocolNumber}
                    </p>
                  </div>
                </div>

                {/* Cripto Specs info */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2.5 font-mono text-[9.5px] text-slate-650">
                  <div className="flex justify-between border-b border-slate-100 pb-1.5">
                    <span className="text-slate-400 font-bold uppercase tracking-wider text-[8.5px]">Assunto:</span>
                    <span className="text-slate-700 font-extrabold text-right truncate max-w-[240px]">{successProtocolModal.subject}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 pb-1.5">
                    <span className="text-slate-400 font-bold uppercase tracking-wider text-[8.5px]">Órgão Destino:</span>
                    <span className="text-slate-700 font-extrabold text-right truncate max-w-[240px]">{successProtocolModal.org}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 pb-1.5">
                    <span className="text-slate-400 font-bold uppercase tracking-wider text-[8.5px]">Data de Emissão:</span>
                    <span className="text-slate-700 font-extrabold">{successProtocolModal.officialIssueDate} às {successProtocolModal.officialTime}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 pb-1.5">
                    <span className="text-slate-400 font-bold uppercase tracking-wider text-[8.5px]">Assinatura Digital RSA-AO:</span>
                    <span className="text-slate-500 font-medium truncate max-w-[200px]">{successProtocolModal.digitalSignature}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-bold uppercase tracking-wider text-[8.5px]">Hash SHA-256 de Acervo:</span>
                    <span className="text-slate-500 font-medium truncate max-w-[200px]">{successProtocolModal.documentHash}</span>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="p-4 bg-slate-50 border-t border-slate-150 flex flex-col gap-2 font-sans">
                <button
                  type="button"
                  onClick={() => setSuccessProtocolModal(null)}
                  className="w-full py-3 bg-primary text-white font-extrabold text-[10px] uppercase tracking-widest rounded-xl hover:opacity-95 shadow-md shadow-primary/10 cursor-pointer text-center active:scale-[0.98] transition-all border-0 font-sans"
                >
                  Concluir Envio
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const canvas = document.getElementById('protocol-qrcode-canvas') as HTMLCanvasElement;
                    if (canvas) {
                      const url = canvas.toDataURL('image/png');
                      const link = document.createElement('a');
                      link.download = `selo-oficial-${successProtocolModal.protocolNumber}.png`;
                      link.href = url;
                      link.click();
                      addAuditLog(`Selo do Protocolo ${successProtocolModal.protocolNumber} exportado para impressão física`, 'success');
                    }
                  }}
                  className="w-full py-2.5 bg-white border border-slate-200 text-slate-600 font-extrabold text-[10px] uppercase tracking-widest rounded-xl hover:bg-slate-100 cursor-pointer flex items-center justify-center gap-1.5 shadow-sm active:scale-[0.98] transition-all"
                >
                  <ArrowLeft size={12} className="rotate-90 text-indigo-600" />
                  Descarregar Selo
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Detalhe de Notificação Modificada Popup */}
      <NotificationDetailModal
        notification={activeNotificationModal}
        onClose={() => setActiveNotificationModal(null)}
        onNavigateToTab={(targetTab) => {
          setTab(targetTab);
          setSelectedDoc(null);
        }}
      />
    </main>
  );
}
