/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mic, Globe, ChevronDown, Check } from 'lucide-react';
import { useSession } from '../../services/sessionStore';
import { AppNotification, AppMode, LanguageCode, LANGUAGE_OPTIONS } from '../../types';
import { useLanguage } from '../../hooks/useLanguage';
import { LazyImage } from '../ui/LazyImage';
import type { JSX } from 'react';

interface HeaderProps {
  setTab: (id: string) => void;
  iaLiveActive: boolean;
  startIaVoice: () => void;
  stopIaVoice: () => void;
  notifications: AppNotification[];
  showNotifications: boolean;
  setShowNotifications: (show: boolean) => void;
  userProfilePhoto?: string;
  NotificationDropdown: () => JSX.Element;
  isChatOpen: boolean;
  setIsChatOpen: (open: boolean) => void;
  appMode: AppMode;
  emergencyMode?: boolean;
  isOnline: boolean;
  onClickConnectivity: () => void;
  offlineQueueLength: number;
  tab?: string;
  currentLanguage: LanguageCode;
  setCurrentLanguage: (lang: LanguageCode) => void;
}

function LanguageSelectorDropdown({
  currentLanguage,
  setCurrentLanguage
}: {
  currentLanguage: LanguageCode;
  setCurrentLanguage: (lang: LanguageCode) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const activeOption = LANGUAGE_OPTIONS.find(opt => opt.code === currentLanguage) || LANGUAGE_OPTIONS[0];

  return (
    <div className="relative shrink-0 flex items-center" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-3.5 py-2 rounded-full hover:bg-slate-100/50 transition-all border border-slate-200 bg-white text-[#0c2340] font-black shadow-xs active:scale-98"
        style={{ cursor: 'pointer' }}
      >
        <Globe size={16} className="text-[#0055ff] shrink-0" strokeWidth={2.4} />
        <span className="text-[11px] font-black uppercase text-slate-800 tracking-tight font-sans">
          {activeOption.flagCode}
        </span>
        <ChevronDown size={11} className={`text-slate-400 transition-transform duration-200 shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-[290px] bg-white rounded-[26px] shadow-[0_20px_50px_rgba(15,23,42,0.12)] border border-slate-100/90 p-3.5 z-[160] overflow-hidden">
          <div className="max-h-[360px] overflow-y-auto custom-scrollbar flex flex-col gap-1 pr-[1px]">
            {LANGUAGE_OPTIONS.map((option) => {
              const isSelected = option.code === currentLanguage;
              return (
                <button
                  key={option.code}
                  type="button"
                  onClick={() => {
                    setCurrentLanguage(option.code);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 text-left transition-all outline-none rounded-[18px] ${
                    isSelected 
                      ? 'bg-[#ecf3fe] text-[#0055ff] font-extrabold' 
                      : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900 border-b border-slate-100/60 last:border-b-0'
                  }`}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <span className={`text-[10px] w-10 h-7 flex items-center justify-center rounded-lg font-black shrink-0 tracking-wider transition-colors ${
                      isSelected ? 'bg-white text-[#0055ff]' : 'bg-[#f1f5f9] text-[#475569]'
                    }`}>
                      {option.flagCode}
                    </span>
                    <span className={`text-[13px] tracking-tight truncate ${isSelected ? 'text-[#0055ff] font-black' : 'text-[#0f172a] font-extrabold'}`}>
                      {option.code === 'pt' ? 'Português (AO)' : option.label}
                    </span>
                  </div>
                  {isSelected && (
                    <Check size={14} className="text-[#0055ff] shrink-0 mr-1" strokeWidth={3.5} />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export function Header({ 
  setTab, 
  iaLiveActive, 
  startIaVoice, 
  stopIaVoice, 
  notifications, 
  showNotifications, 
  setShowNotifications,
  NotificationDropdown,
  isChatOpen,
  setIsChatOpen,
  appMode,
  emergencyMode = false,
  isOnline,
  onClickConnectivity,
  offlineQueueLength,
  tab,
  currentLanguage,
  setCurrentLanguage
}: HeaderProps) {
  const { user, activeProfile } = useSession();
  const { t: translate } = useLanguage();
  const isGov = appMode !== 'user';
  const isAdmin = appMode === 'admin';
  const isInst = appMode === 'institution';
  const hasEmergencyBanner = emergencyMode && isGov;

  const getSectionLabel = () => {
    if (isAdmin) {
      switch (tab) {
        case 'gov-dashboard': return 'Administração Central';
        case 'gov-interoperabilidade': return 'Gestão Institucional';
        case 'gov-correspondencias': return 'Correspondências Nacionais';
        case 'gov-contatos': return 'Cadastro de Cidadãos';
        case 'gov-trabalhadores': return 'Operadores do Sistema';
        case 'gov-relatorio': return 'Centro de Relatórios';
        case 'gov-ia': return 'Assistência IA Nacional';
        case 'gov-seguranca': return 'Auditoria e Segurança';
        case 'gov-perfil': return 'Conta Administrativa';
        case 'gov-documentos':
        case 'gov-docs': return 'Emissão Documental';
        case 'historico': return 'Histórico Operacional';
        case 'notificacoes': return 'Centro de Notificações';
        default: return 'Administração Central';
      }
    }

    if (isInst) {
      switch (tab) {
        case 'home': return 'Área Institucional';
        case 'correspondencias': return 'Correio Institucional';
        case 'gov-contatos': return 'Trabalhadores da Instituição';
        case 'inst-qrcode': return 'Validação por QR Code';
        case 'inst-ai-assistant': return 'Assistência IA Institucional';
        case 'perfil': return 'Conta Institucional';
        case 'qr-code': return 'Documentos Institucionais';
        case 'historico': return 'Histórico Institucional';
        case 'notificacoes': return 'Notificações Institucionais';
        default: return 'Área Institucional';
      }
    }

    switch (tab) {
      case 'home': return 'Área do Cidadão';
      case 'correspondencias': return 'Correio Digital';
      case 'documentos': return 'Documentos e Tramitações';
      case 'qr-code': return 'QR Code';
      case 'pasta-digital': return 'Pasta Digital';
      case 'historico': return 'Meu Histórico';
      case 'notificacoes': return 'Centro de Notificações';
      case 'solicitar-documento': return 'Solicitar Documento';
      case 'contatos':
      case 'contactos': return 'Círculo de Confiança';
      case 'perfil': return 'Minha Conta';
      case 'mensagem': return 'Detalhe da Correspondência';
      case 'documento': return 'Detalhe do Documento';
      case 'instituicao': return 'Ficha Institucional';
      default: return 'Área do Cidadão';
    }
  };

  const getMainTitle = () => {
    if (isAdmin) return activeProfile.role;
    if (isInst) return activeProfile.institutionName || `Olá, ${user.firstName}`;
    return `Olá, ${user.firstName}`;
  };

  const handleMicClick = () => {
    if (!isChatOpen) {
      setIsChatOpen(true);
      startIaVoice();
    } else {
      // If voice is active, close everything. If not, just start voice.
      if (iaLiveActive) {
        stopIaVoice();
        setIsChatOpen(false);
      } else {
        startIaVoice();
      }
    }
  };

  const getThemeColorClass = (activeClass: string, inactiveClass: string) => {
    if (iaLiveActive) return activeClass;
    return inactiveClass;
  };

  return (
    <>
      {/* Mobile AppBar */}
      <header 
        style={{ top: hasEmergencyBanner ? '32px' : '0' }}
        className={`md:hidden fixed left-0 right-0 h-16 border-b px-4 flex items-center justify-between z-50 transition-all bg-white ${
        isAdmin ? 'border-slate-100 text-slate-900 shadow-sm' : 
        isInst ? 'border-red-200 text-slate-900' : 'text-slate-900 border-line/40'
      }`}>
        <div className="flex items-center" onClick={() => setTab(isAdmin ? 'gov-dashboard' : 'home')}>
          <LazyImage 
            src="https://i.postimg.cc/Rq5TKbdk/Correio-Digital-Angola.png" 
            alt="Correio Digital" 
            priority={true}
            placeholder="skeleton"
            style={{ height: '46px', width: 'auto', objectFit: 'contain', cursor: 'pointer' }}
          />
          {isAdmin && (
            <span className={`ml-2 text-[8px] font-black uppercase px-1.5 py-0.5 rounded leading-none bg-slate-900 text-white`}>
              Admin
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {/* Connectivity Pill Button Mobile */}
          <button
            type="button"
            onClick={onClickConnectivity}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[9px] font-black uppercase tracking-wider transition-all pointer-events-auto cursor-pointer shrink-0 ${
              isOnline 
                ? 'bg-[#e6fdf5] text-[#00925d] border-[#bbf7e1] hover:bg-[#d8f9ed]' 
                : 'bg-amber-50 text-amber-900 border-amber-200 hover:bg-amber-100 animate-pulse'
            }`}
          >
            <div className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-[#00dd82]' : 'bg-amber-500'}`} />
            <span>{isOnline ? 'Online' : 'Offline'}</span>
            {offlineQueueLength > 0 && (
              <span className="bg-amber-600 text-white font-mono rounded-full px-1 min-w-[12px] h-[12px] flex items-center justify-center text-[7px] leading-none shrink-0 font-bold">
                {offlineQueueLength}
              </span>
            )}
          </button>

          <LanguageSelectorDropdown currentLanguage={currentLanguage} setCurrentLanguage={setCurrentLanguage} />

          <button 
            disabled={currentLanguage !== 'pt'}
            onClick={currentLanguage === 'pt' ? handleMicClick : undefined}
            className={`relative flex items-center justify-center p-2 rounded-full transition-all focus:outline-none ${
              currentLanguage !== 'pt' ? 'opacity-30 cursor-not-allowed' : ''
            } ${
              iaLiveActive ? (isAdmin ? 'bg-red-500/15' : isInst ? 'bg-red-600/10' : 'bg-primary/10') : 'active:bg-slate-50'
            }`}
            title={currentLanguage === 'pt' ? "Conversar com IA (Voz)" : "Voz indisponível em dialetos regionais"}
          >
            {iaLiveActive && (
              <motion.div
                initial={{ scale: 0.8, opacity: 0.5 }}
                animate={{ scale: 1.4, opacity: 0 }}
                transition={{ repeat: Infinity, duration: 1.5, ease: "easeOut" }}
                className={`absolute inset-0 rounded-full ${isAdmin ? 'bg-red-500/20' : isInst ? 'bg-red-600/20' : 'bg-primary/20'}`}
              />
            )}
            <Mic 
              size={17} 
              className={`relative z-10 transition-colors duration-300 ${
                iaLiveActive ? (isAdmin ? 'text-red-650' : isInst ? 'text-red-600' : 'text-primary') : (isAdmin ? 'text-slate-700' : 'text-slate-600')
              }`} 
            />
          </button>
          
          <div className="relative flex items-center justify-center">
            {user.avatarUrl ? (
              <LazyImage
                src={user.avatarUrl}
                alt="Perfil"
                priority={true}
                placeholder="skeleton"
                style={{
                  width: '2rem',
                  height: '2rem',
                  borderRadius: '9999px',
                  objectFit: 'cover',
                  border: '1px solid #e2e8f0',
                  marginLeft: '0.25rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                className="ring-2 ring-primary/5 hover:ring-primary/20"
              />
            ) : null}
            {notifications.length > 0 && (
              <div className="bg-red-600 text-white font-black text-[6px] min-w-[10px] h-[10px] px-0.5 flex items-center justify-center rounded-full ring-1 ring-white absolute -top-0.5 -right-0.5 z-10 shadow-sm pointer-events-none leading-none">
                {notifications.length}
              </div>
            )}
            <NotificationDropdown />
          </div>
        </div>
      </header>

      {/* Desktop Greeting Header */}
      <div 
        style={{ top: hasEmergencyBanner ? '32px' : '0' }}
        className={`px-4 py-3 md:px-8 md:pt-6 md:pb-2 border-b flex justify-between items-center transition-all sticky z-20 ${
        isAdmin ? 'bg-white border-slate-100 text-slate-900 shadow-sm' : 
        'bg-white border-line/5'
      }`}>
        <div className="flex-1">
          <small className={`text-[10px] md:text-sm font-black uppercase tracking-[0.1em] block mb-0.5 ${
            isAdmin ? 'text-slate-600' : 'text-slate-600'
          }`}>
            {translate(getSectionLabel())}
          </small>
          <h2 className={`text-lg md:text-3xl font-black leading-none tracking-tight ${
            isAdmin ? 'text-slate-900' : 'text-primary'
          }`}>
            {translate(getMainTitle())}
          </h2>
        </div>
        
        <div className="hidden md:flex items-center gap-4">
          {/* Connectivity Pill Button Desktop */}
          <button
            type="button"
            onClick={onClickConnectivity}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-full border text-[11px] font-black uppercase tracking-wider transition-all pointer-events-auto cursor-pointer ${
              isOnline 
                ? 'bg-[#e6fdf5] text-[#00925d] border-[#bbf7e1] hover:bg-[#d8f9ed]' 
                : 'bg-amber-50 text-amber-900 border-amber-200 hover:bg-amber-100 animate-pulse'
            }`}
            style={{ cursor: 'pointer' }}
          >
            <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-[#00dd82]' : 'bg-amber-500'}`} />
            <span>{isOnline ? 'Online' : 'Offline'}</span>
            {offlineQueueLength > 0 && (
              <span className="bg-amber-600 text-white font-mono rounded-full px-1.5 min-w-[16px] h-[16px] flex items-center justify-center text-[9px] leading-none shrink-0 font-bold">
                {offlineQueueLength}
              </span>
            )}
          </button>

          <LanguageSelectorDropdown currentLanguage={currentLanguage} setCurrentLanguage={setCurrentLanguage} />

          <button 
            disabled={currentLanguage !== 'pt'}
            onClick={currentLanguage === 'pt' ? handleMicClick : undefined}
            className={`relative flex items-center justify-center p-2 rounded-full transition-all focus:outline-none ${
              currentLanguage !== 'pt' ? 'opacity-30 cursor-not-allowed' : ''
            } ${
              iaLiveActive ? (isAdmin ? 'bg-red-500/15' : isInst ? 'bg-red-600/10' : 'bg-primary/10') : 'hover:bg-slate-50 hover:bg-opacity-10'
            }`}
            title={currentLanguage === 'pt' ? "Conversar com IA (Voz)" : "Voz indisponível em dialetos regionais"}
          >
            {iaLiveActive && (
              <motion.div
                initial={{ scale: 0.8, opacity: 0.5 }}
                animate={{ scale: 1.5, opacity: 0 }}
                transition={{ repeat: Infinity, duration: 1.5, ease: "easeOut" }}
                className={`absolute inset-0 rounded-full ${isAdmin ? 'bg-red-500/30' : isInst ? 'bg-red-600/30' : 'bg-primary/30'}`}
              />
            )}
            <Mic 
              size={19} 
              className={`relative z-10 transition-colors duration-300 ${
                iaLiveActive ? (isAdmin ? 'text-red-650' : isInst ? 'text-red-600' : 'text-primary') : (isAdmin ? 'text-slate-700' : 'text-slate-700')
              }`} 
            />
          </button>
          
          <div className="relative flex items-center">
            {user.avatarUrl ? (
              <LazyImage
                src={user.avatarUrl}
                alt="Perfil"
                priority={true}
                placeholder="skeleton"
                style={{
                  width: '2.5rem',
                  height: '2.5rem',
                  borderRadius: '9999px',
                  objectFit: 'cover',
                  border: '2px solid white',
                  cursor: 'pointer',
                }}
                className="ring-2 ring-primary/10 hover:ring-primary/30 shadow-sm transition-all"
              />
            ) : null}
            {notifications.length > 0 && (
              <div className="bg-red-600 text-white font-black text-[7.5px] min-w-[12px] h-[12px] px-0.5 flex items-center justify-center rounded-full ring-1 ring-white absolute -top-0.5 -right-0.5 z-10 shadow-sm pointer-events-none leading-none">
                {notifications.length}
              </div>
            )}
            <NotificationDropdown />
          </div>
        </div>
      </div>
    </>
  );
}
