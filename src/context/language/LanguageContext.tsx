/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { LanguageCode } from '../../types';
import { translateText } from '../../utils/translator';
import { 
  MOCK_CORRESPONDENCES, 
  MOCK_INSTITUTIONAL_INBOX, 
  MOCK_SENT_MESSAGES, 
  MOCK_DOCUMENTS, 
  MOCK_CONTACTS, 
  MOCK_NOTIFICATIONS 
} from '../../constants/mocks';
import { 
  HIGHLIGHT_SLIDES,
  GOV_HIGHLIGHT_SLIDES,
  INST_HIGHLIGHT_SLIDES
} from '../../constants/data';

interface LanguageContextType {
  currentLanguage: LanguageCode;
  setCurrentLanguage: (lang: LanguageCode) => void;
  t: (text: string) => string;
  isTranslating: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Gather all dynamic app data/mock strings to execute full translation via AI
function extractTranslatableStrings(): string[] {
  const strings = new Set<string>();

  // 1. Highlight Slides
  [...HIGHLIGHT_SLIDES, ...GOV_HIGHLIGHT_SLIDES, ...INST_HIGHLIGHT_SLIDES].forEach(s => {
    if (s.title) strings.add(s.title);
    if (s.subtitle) strings.add(s.subtitle);
    if (s.btn) strings.add(s.btn);
  });

  // 2. Messages
  [...MOCK_CORRESPONDENCES, ...MOCK_INSTITUTIONAL_INBOX, ...MOCK_SENT_MESSAGES].forEach(m => {
    if (m.org) strings.add(m.org);
    if (m.preview) strings.add(m.preview);
    if (m.status) strings.add(m.status);
    if (m.details) {
      if (m.details.subject) strings.add(m.details.subject);
      if (m.details.body) strings.add(m.details.body);
    }
  });

  // 3. Documents
  MOCK_DOCUMENTS.forEach(d => {
    if (d.name) strings.add(d.name);
    if (d.validity) strings.add(d.validity);
    if (d.holder) strings.add(d.holder);
    if (d.issuer) strings.add(d.issuer);
  });

  // 4. Notifications
  MOCK_NOTIFICATIONS.forEach(n => {
    if (n.title) strings.add(n.title);
    if (n.message) strings.add(n.message);
  });

  // 5. Contacts
  MOCK_CONTACTS.forEach(c => {
    if (c.name) strings.add(c.name);
    if (c.relation) strings.add(c.relation);
    if (c.status) strings.add(c.status);
  });

  // 6. Common interface labels
  const extraUI = [
    "Não Lidas", "Lidas", "Enviadas", "Submeter", "Pesquisar", "Solicitar", "Sair",
    "A carregar plataforma oficial...", "O seu novo endereço digital oficial",
    "Receba, assine e despache correspondência governamental com validade jurídica do Estado da República de Angola.",
    "Infraestrutura Oficial Segura SME & AGT", "Cidadão", "Instituição", "Admin",
    "Login Institucional", "Login Admin", "Login", "Acesso oficial do cidadão digital",
    "Número de Agente", "Número de BI de Cidadão", "Senha de Acesso", "Entrar com BI e Senha",
    "Lida", "Não Lida", "Arquivada", "Pendente", "Pago", "Vencido", "Em processamento",
    "Login Facial", "Entrar no Portal", "Auto Preencher Demonstração",
    "1. Pedido", "2. Anexos", "3. Análise", "4. Pagamento", "5. Despacho", "6. Emissão"
  ];
  extraUI.forEach(s => strings.add(s));

  return Array.from(strings).filter(s => s && s.trim().length > 1 && isNaN(Number(s)));
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [currentLanguage, setCurrentLanguage] = useState<LanguageCode>(() => {
    const saved = localStorage.getItem('cda_current_language');
    return (saved as LanguageCode) || 'pt';
  });

  const [dynamicCache, setDynamicCache] = useState<Record<string, Record<string, string>>>(() => {
    try {
      const saved = localStorage.getItem('cda_dynamic_translation_cache');
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      return {};
    }
  });

  const [isTranslating, setIsTranslating] = useState(false);

  useEffect(() => {
    localStorage.setItem('cda_current_language', currentLanguage);
  }, [currentLanguage]);

  useEffect(() => {
    localStorage.setItem('cda_dynamic_translation_cache', JSON.stringify(dynamicCache));
  }, [dynamicCache]);

  // Translate dynamic data in the background when language changes
  useEffect(() => {
    if (currentLanguage === 'pt') return;

    // Skip if we already have cache for this language
    if (dynamicCache[currentLanguage] && Object.keys(dynamicCache[currentLanguage]).length > 0) {
      return;
    }

    const loadTranslations = async () => {
      setIsTranslating(true);
      try {
        const textsToTranslate = extractTranslatableStrings();
        const response = await fetch('/api/translate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ texts: textsToTranslate, targetLanguage: currentLanguage })
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data && Array.isArray(data.translations)) {
            const mapped: Record<string, string> = {};
            textsToTranslate.forEach((originalText, index) => {
              const translatedVal = data.translations[index];
              if (translatedVal && translatedVal !== originalText) {
                mapped[originalText.trim()] = translatedVal;
              }
            });

            setDynamicCache(prev => ({
              ...prev,
              [currentLanguage]: mapped
            }));
          }
        }
      } catch (err) {
        console.error("Failed to automatically translate app data:", err);
      } finally {
        setIsTranslating(false);
      }
    };

    loadTranslations();
  }, [currentLanguage]);

  const t = (text: string): string => {
    if (!text) return text;

    // Check if we have custom translation mapping (including PT corrections)
    const translated = translateText(text, currentLanguage);
    if (translated !== text) return translated;

    if (currentLanguage === 'pt') return text;

    const trimmed = text.trim();
    
    // 1. Check if we have an AI translation cached for this specific string and language
    const langCache = dynamicCache[currentLanguage];
    if (langCache && langCache[trimmed]) {
      return langCache[trimmed];
    }

    return text;
  };

  return (
    <LanguageContext.Provider value={{ currentLanguage, setCurrentLanguage, t, isTranslating }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
