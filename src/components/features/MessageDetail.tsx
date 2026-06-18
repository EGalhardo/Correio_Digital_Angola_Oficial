/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, Fragment } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, 
  LogOut,
  Calendar, 
  Clock, 
  MapPin, 
  Check, 
  ShieldCheck, 
  FileText, 
  Info,
  Fingerprint,
  QrCode,
  Tag,
  UserCheck,
  ShieldAlert,
  AlertTriangle,
  Hash,
  Inbox,
  Eye,
  CheckCircle,
  MessageSquare,
  Search,
  CheckSquare,
  XCircle,
  AlertOctagon,
  Archive,
  CornerUpRight,
  GitCommit,
  History,
  Bell,
  Scroll,
  Receipt,
  Megaphone,
  FolderOpen,
  Landmark,
  Key,
  Award,
  User,
  Coins,
  Scale,
  Lock,
  EyeOff,
  Share2,
  Paperclip,
  Send,
  RefreshCw,
  Sparkles,
  ArrowRight,
  Plus,
  Trash2,
  Undo,
  Redo,
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  Quote,
  Eraser
} from 'lucide-react';
import { Message, SENSITIVITY_LEVELS, SensitivityConfig, PRIORITY_CONFIGS } from '../../types';
import { generateProtocol, generateTimelineEvents, getCategoryMetadata } from '../../utils/protocolGenerator';
import { GovernmentAIPanel } from './GovernmentAIPanel';
import { VideoSessionPanel } from './VideoSessionPanel';
import { useLanguage } from '../../hooks/useLanguage';

const STATE_STYLING: Record<string, { bg: string; text: string; border: string; bgDot: string; textIcon: string }> = {
  'Recebida': { bg: 'bg-slate-50', text: 'text-slate-800', border: 'border-slate-200', bgDot: 'bg-slate-150', textIcon: 'text-slate-600' },
  'Entregue': { bg: 'bg-blue-50', text: 'text-blue-800', border: 'border-blue-100', bgDot: 'bg-blue-100/60', textIcon: 'text-blue-600' },
  'Visualizada': { bg: 'bg-teal-50', text: 'text-teal-800', border: 'border-teal-100', bgDot: 'bg-teal-100/60', textIcon: 'text-teal-600' },
  'Confirmada': { bg: 'bg-indigo-50', text: 'text-indigo-800', border: 'border-indigo-100', bgDot: 'bg-indigo-100/60', textIcon: 'text-indigo-600' },
  'Respondida': { bg: 'bg-purple-50', text: 'text-purple-800', border: 'border-purple-100', bgDot: 'bg-purple-100/60', textIcon: 'text-purple-600' },
  'Em análise': { bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-100', bgDot: 'bg-amber-150', textIcon: 'text-amber-600' },
  'Aprovada': { bg: 'bg-emerald-50', text: 'text-emerald-800', border: 'border-emerald-100', bgDot: 'bg-emerald-100/65', textIcon: 'text-emerald-600' },
  'Rejeitada': { bg: 'bg-red-50', text: 'text-red-800', border: 'border-red-100', bgDot: 'bg-red-100/60', textIcon: 'text-red-650' },
  'Contestada': { bg: 'bg-rose-50', text: 'text-rose-800', border: 'border-rose-100', bgDot: 'bg-rose-100/60', textIcon: 'text-rose-650' },
  'Expirada': { bg: 'bg-zinc-50', text: 'text-zinc-800', border: 'border-zinc-200', bgDot: 'bg-zinc-150', textIcon: 'text-zinc-600' },
  'Arquivada': { bg: 'bg-neutral-50', text: 'text-neutral-800', border: 'border-neutral-200', bgDot: 'bg-neutral-155', textIcon: 'text-neutral-600' },
  'Encaminhada': { bg: 'bg-sky-50', text: 'text-sky-800', border: 'border-sky-100', bgDot: 'bg-sky-110', textIcon: 'text-sky-600' },
};

const CATEGORY_STYLING: Record<string, {
  bg: string;
  text: string;
  border: string;
  badge: string;
  circleBg: string;
  circleBorder: string;
}> = {
  'Notificação': {
    bg: 'bg-indigo-50 border-indigo-100 text-indigo-800',
    text: 'text-indigo-800',
    border: 'border-indigo-200',
    badge: 'bg-indigo-100/70 text-indigo-850',
    circleBg: 'bg-indigo-600 text-white',
    circleBorder: 'border-indigo-600 ring-indigo-100',
  },
  'Ofício': {
    bg: 'bg-slate-50 border-slate-200 text-slate-800',
    text: 'text-slate-800',
    border: 'border-slate-300',
    badge: 'bg-slate-100/70 text-slate-850',
    circleBg: 'bg-slate-600 text-white',
    circleBorder: 'border-slate-500 ring-slate-100',
  },
  'Multa': {
    bg: 'bg-rose-50 border-rose-100 text-rose-800',
    text: 'text-rose-800',
    border: 'border-rose-200',
    badge: 'bg-rose-100/75 text-rose-850 border-rose-200',
    circleBg: 'bg-rose-600 text-white',
    circleBorder: 'border-rose-500 ring-rose-100',
  },
  'Fatura': {
    bg: 'bg-amber-50 border-amber-100 text-amber-800',
    text: 'text-amber-805',
    border: 'border-amber-200',
    badge: 'bg-amber-100/70 text-amber-800',
    circleBg: 'bg-amber-650 text-white',
    circleBorder: 'border-amber-500 ring-amber-100',
  },
  'Convocatória': {
    bg: 'bg-purple-50 border-purple-100 text-purple-800',
    text: 'text-purple-800',
    border: 'border-purple-200',
    badge: 'bg-purple-100/70 text-purple-850',
    circleBg: 'bg-purple-600 text-white',
    circleBorder: 'border-purple-500 ring-purple-100',
  },
  'Processo Administrativo': {
    bg: 'bg-cyan-50 border-cyan-100 text-cyan-800',
    text: 'text-cyan-800',
    border: 'border-cyan-200',
    badge: 'bg-cyan-100/70 text-cyan-850',
    circleBg: 'bg-cyan-600 text-white',
    circleBorder: 'border-cyan-500 ring-cyan-100',
  },
  'Documento Bancário': {
    bg: 'bg-emerald-50 border-emerald-100 text-emerald-800',
    text: 'text-emerald-800',
    border: 'border-emerald-200',
    badge: 'bg-emerald-100/70 text-emerald-850',
    circleBg: 'bg-emerald-600 text-white',
    circleBorder: 'border-emerald-500 ring-emerald-100',
  },
  'Declaração': {
    bg: 'bg-teal-50 border-teal-150 text-teal-800',
    text: 'text-teal-805',
    border: 'border-teal-200',
    badge: 'bg-teal-100/70 text-teal-850',
    circleBg: 'bg-teal-600 text-white',
    circleBorder: 'border-teal-500 ring-teal-100',
  },
  'Licença': {
    bg: 'bg-lime-50 border-lime-150 text-lime-900',
    text: 'text-lime-900',
    border: 'border-lime-200',
    badge: 'bg-lime-100/70 text-lime-900',
    circleBg: 'bg-lime-600 text-white',
    circleBorder: 'border-lime-500 ring-lime-100',
  },
  'Certificado': {
    bg: 'bg-orange-50 border-orange-100 text-orange-800',
    text: 'text-orange-805',
    border: 'border-orange-200',
    badge: 'bg-orange-100/70 text-orange-850',
    circleBg: 'bg-orange-605 text-white',
    circleBorder: 'border-orange-500 ring-orange-100',
  },
  'Petição do Cidadão': {
    bg: 'bg-fuchsia-50 border-fuchsia-100 text-fuchsia-800',
    text: 'text-fuchsia-800',
    border: 'border-fuchsia-200',
    badge: 'bg-fuchsia-100/65 text-fuchsia-850',
    circleBg: 'bg-fuchsia-600 text-white',
    circleBorder: 'border-fuchsia-500 ring-fuchsia-100',
  },
  'Documento Fiscal': {
    bg: 'bg-pink-50 border-pink-100 text-pink-800',
    text: 'text-pink-805',
    border: 'border-pink-200',
    badge: 'bg-pink-100/70 text-pink-850',
    circleBg: 'bg-pink-600 text-white',
    circleBorder: 'border-pink-500 ring-pink-100',
  },
  'Documento Judicial': {
    bg: 'bg-zinc-100 border-zinc-200 text-zinc-900',
    text: 'text-zinc-900',
    border: 'border-zinc-300',
    badge: 'bg-zinc-200 text-zinc-900',
    circleBg: 'bg-zinc-600 text-white',
    circleBorder: 'border-zinc-500 ring-zinc-100',
  }
};

function renderCategoryIcon(iconName: string, size = 16) {
  switch (iconName) {
    case 'Bell': return <Bell size={size} />;
    case 'Scroll': return <Scroll size={size} />;
    case 'ShieldAlert': return <ShieldAlert size={size} />;
    case 'Receipt': return <Receipt size={size} />;
    case 'Megaphone': return <Megaphone size={size} />;
    case 'FolderOpen': return <FolderOpen size={size} />;
    case 'Landmark': return <Landmark size={size} />;
    case 'CheckSquare': return <CheckSquare size={size} />;
    case 'Key': return <Key size={size} />;
    case 'Award': return <Award size={size} />;
    case 'User': return <User size={size} />;
    case 'Coins': return <Coins size={size} />;
    case 'Scale': return <Scale size={size} />;
    default: return <FileText size={size} />;
  }
}

function renderStateIcon(state: string, size = 14) {
  switch (state) {
    case 'Recebida': return <Inbox size={size} />;
    case 'Entregue': return <Check size={size} />;
    case 'Visualizada': return <Eye size={size} />;
    case 'Confirmada': return <CheckCircle size={size} />;
    case 'Respondida': return <MessageSquare size={size} />;
    case 'Em análise': return <Search size={size} />;
    case 'Aprovada': return <CheckSquare size={size} />;
    case 'Rejeitada': return <XCircle size={size} />;
    case 'Contestada': return <AlertOctagon size={size} />;
    case 'Expirada': return <Clock size={size} />;
    case 'Arquivada': return <Archive size={size} />;
    case 'Encaminhada': return <CornerUpRight size={size} />;
    default: return <GitCommit size={size} />;
  }
}

interface MessageDetailProps {
  selectedMessage: Message;
  setSelectedMessage: (msg: Message | null) => void;
  setTab: (tab: string) => void;
  handleReply: (msg: Message) => void;
  onUpdateMessage?: (msg: Message) => void;
  onDeleteMessage?: (id: number) => void;
  onRestoreMessage?: (id: number) => void;
  isDeleted?: boolean;
}

export function MessageDetail({
  selectedMessage,
  setSelectedMessage,
  setTab,
  handleReply,
  onUpdateMessage,
  onDeleteMessage,
  onRestoreMessage,
  isDeleted,
}: MessageDetailProps) {
  const { t } = useLanguage();
  const messageDate = selectedMessage.date && selectedMessage.date.includes('/')
    ? selectedMessage.date
    : (selectedMessage.protocol?.officialIssueDate || '02/06/2026');

  const messageTime = selectedMessage.date && selectedMessage.date.includes(':')
    ? selectedMessage.date
    : (selectedMessage.protocol?.officialTime || '10:45');

  const getMessageLocality = (msg: Message) => {
    return 'Rua Deolinda Rodrigues, n-227, Benfica, Luanda';
  };
  const messageLocality = getMessageLocality(selectedMessage);

  const [activeAction, setActiveAction] = useState<string | null>(null);
  const [showQRValidation, setShowQRValidation] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [showAIPanel, setShowAIPanel] = useState(false);
  const [showAdvancedData, setShowAdvancedData] = useState(false);
  const [detailReplyText, setDetailReplyText] = useState('');
  const [isReplyingInDetails, setIsReplyingInDetails] = useState(false);
  const [detailReplySuccess, setDetailReplySuccess] = useState<{
    protocolNumber: string;
    timestamp: string;
    text: string;
    digitalSeal: string;
    documentHash: string;
    files?: { name: string; size: string }[];
  } | null>(null);

  const [inlineAttachedFiles, setInlineAttachedFiles] = useState<{ name: string; size: string }[]>([]);

  const handleInlineFileAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const isFileExist = (name: string) => inlineAttachedFiles.some(f => f.name === name);
      const newFiles: { name: string; size: string }[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (!isFileExist(file.name)) {
          const sz = file.size;
          let sizeStr = '';
          if (sz < 1024) {
            sizeStr = `${sz} B`;
          } else if (sz < 1024 * 1024) {
            sizeStr = `${(sz / 1024).toFixed(1)} KB`;
          } else {
            sizeStr = `${(sz / (1024 * 1024)).toFixed(1)} MB`;
          }
          newFiles.push({ name: file.name, size: sizeStr });
        }
      }
      setInlineAttachedFiles(prev => [...prev, ...newFiles]);
    }
  };

  const handleInlineFileRemove = (name: string) => {
    setInlineAttachedFiles(prev => prev.filter(f => f.name !== name));
  };

  // States for the 8 official government actions requested
  const [activeOfficialAction, setActiveOfficialAction] = useState<string | null>(null);
  const [successProtocol, setSuccessProtocol] = useState<{
    protocolNumber: string;
    actionName: string;
    details: string;
    timestamp: string;
    digitalSeal: string;
    documentHash: string;
  } | null>(null);

  const [replyText, setReplyText] = useState('');
  const [editorBold, setEditorBold] = useState(false);
  const [editorItalic, setEditorItalic] = useState(false);
  const [editorUnderline, setEditorUnderline] = useState(false);
  const [editorFont, setEditorFont] = useState('sans-serif');
  const [editorFontSize, setEditorFontSize] = useState('base');
  const [editorAlignment, setEditorAlignment] = useState('left');
  const [editorColor, setEditorColor] = useState('#1e293b');
  const [editorIsQuote, setEditorIsQuote] = useState(false);
  const [editorListType, setEditorListType] = useState<string | null>(null);

  const [textHistory, setTextHistory] = useState<string[]>(['']);
  const [historyIndex, setHistoryIndex] = useState(0);

  const updateReplyText = (newText: string) => {
    setReplyText(newText);
    const updatedHistory = textHistory.slice(0, historyIndex + 1);
    if (updatedHistory[updatedHistory.length - 1] !== newText) {
      const nextHistory = [...updatedHistory, newText];
      if (nextHistory.length > 25) {
        nextHistory.shift();
      }
      setTextHistory(nextHistory);
      setHistoryIndex(nextHistory.length - 1);
    }
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const prevIndex = historyIndex - 1;
      setHistoryIndex(prevIndex);
      setReplyText(textHistory[prevIndex]);
    }
  };

  const handleRedo = () => {
    if (historyIndex < textHistory.length - 1) {
      const nextIndex = historyIndex + 1;
      setHistoryIndex(nextIndex);
      setReplyText(textHistory[nextIndex]);
    }
  };

  const clearFormatting = () => {
    setEditorBold(false);
    setEditorItalic(false);
    setEditorUnderline(false);
    setEditorFont('sans-serif');
    setEditorFontSize('base');
    setEditorAlignment('left');
    setEditorColor('#1e293b');
    setEditorIsQuote(false);
    setEditorListType(null);
  };

  const [detailEditorBold, setDetailEditorBold] = useState(false);
  const [detailEditorItalic, setDetailEditorItalic] = useState(false);
  const [detailEditorUnderline, setDetailEditorUnderline] = useState(false);
  const [detailEditorFont, setDetailEditorFont] = useState('sans-serif');
  const [detailEditorFontSize, setDetailEditorFontSize] = useState('base');
  const [detailEditorAlignment, setDetailEditorAlignment] = useState('left');
  const [detailEditorColor, setDetailEditorColor] = useState('#1e293b');
  const [detailEditorIsQuote, setDetailEditorIsQuote] = useState(false);
  const [detailEditorListType, setDetailEditorListType] = useState<string | null>(null);

  const [detailTextHistory, setDetailTextHistory] = useState<string[]>(['']);
  const [detailHistoryIndex, setDetailHistoryIndex] = useState(0);

  const updateDetailReplyText = (newText: string) => {
    setDetailReplyText(newText);
    const updatedHistory = detailTextHistory.slice(0, detailHistoryIndex + 1);
    if (updatedHistory[updatedHistory.length - 1] !== newText) {
      const nextHistory = [...updatedHistory, newText];
      if (nextHistory.length > 25) {
        nextHistory.shift();
      }
      setDetailTextHistory(nextHistory);
      setDetailHistoryIndex(nextHistory.length - 1);
    }
  };

  const handleDetailUndo = () => {
    if (detailHistoryIndex > 0) {
      const prevIndex = detailHistoryIndex - 1;
      setDetailHistoryIndex(prevIndex);
      setDetailReplyText(detailTextHistory[prevIndex]);
    }
  };

  const handleDetailRedo = () => {
    if (detailHistoryIndex < detailTextHistory.length - 1) {
      const nextIndex = detailHistoryIndex + 1;
      setDetailHistoryIndex(nextIndex);
      setDetailReplyText(detailTextHistory[nextIndex]);
    }
  };

  const clearDetailFormatting = () => {
    setDetailEditorBold(false);
    setDetailEditorItalic(false);
    setDetailEditorUnderline(false);
    setDetailEditorFont('sans-serif');
    setDetailEditorFontSize('base');
    setDetailEditorAlignment('left');
    setDetailEditorColor('#1e293b');
    setDetailEditorIsQuote(false);
    setDetailEditorListType(null);
  };

  const [confirmReadCheckbox, setConfirmReadCheckbox] = useState(false);
  const [signatureMethod, setSignatureMethod] = useState('BI-DIGITAL');
  const [signaturePin, setSignaturePin] = useState('');
  const [signatureDraw, setSignatureDraw] = useState(false);
  const [revisionReason, setRevisionReason] = useState('Divergência de Valores');
  const [revisionJustification, setRevisionJustification] = useState('');
  const [contestJustification, setContestJustification] = useState('');
  const [contestCategory, setContestCategory] = useState('Atos Administrativos');
  const [attachedFileName, setAttachedFileName] = useState('');
  const [attachedFileBase64, setAttachedFileBase64] = useState<string | null>(null);
  const [scheduleDate, setScheduleDate] = useState('2026-05-25');
  const [scheduleMode, setScheduleMode] = useState('Videoconferência');
  const [scheduleLocation, setScheduleLocation] = useState('Posto Central AGT (Luanda)');
  const [forwardTarget, setForwardTarget] = useState('Ministério das Finanças');
  const [forwardJustification, setForwardJustification] = useState('');
  const [isSubmittingAction, setIsSubmittingAction] = useState(false);

  const handleOfficialActionSubmit = (actionName: string) => {
    setIsSubmittingAction(true);
    
    setTimeout(() => {
      const newProtocol = generateProtocol(
        selectedMessage.org,
        'message',
        selectedMessage.id,
        `${actionName}: ${selectedMessage.details?.subject || selectedMessage.preview}`
      );
      const now = new Date();
      const timestampStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
      const dmyStr = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`;
      const fullTimestamp = `${dmyStr} ${timestampStr}`;

      let detailsText = '';
      let auditLogAction = '';
      let newState = selectedMessage.details?.state || 'Recebida';

      if (actionName === 'Responder') {
        detailsText = `Resposta oficial enviada com o seguinte teor: "${replyText.substring(0, 80)}${replyText.length > 80 ? '...' : ''}"`;
        auditLogAction = `Resposta Oficial submetida via Plataforma (Prot: ${newProtocol.protocolNumber})`;
        newState = 'Respondida';
        setReplyText('');
      } else if (actionName === 'Confirmar leitura') {
        detailsText = `Leitura confirmada oficialmente sob termo de responsabilidade civil e administrativa.`;
        auditLogAction = `Aviso de Receção e Leitura Confirmada (Prot: ${newProtocol.protocolNumber})`;
        newState = 'Visualizada';
        setConfirmReadCheckbox(false);
      } else if (actionName === 'Assinar documento') {
        detailsText = `Documento assinado digitalmente com sucesso usando credenciais ${signatureMethod} (PIN autenticado).`;
        auditLogAction = `Assinatura Digital Qualificada aposta (Prot: ${newProtocol.protocolNumber})`;
        newState = 'Aprovada';
        setSignaturePin('');
        setSignatureDraw(false);
      } else if (actionName === 'Solicitar revisão') {
        detailsText = `Solicitada revisão de conteúdo pelo motivo: ${revisionReason}. Justificação: "${revisionJustification.substring(0, 70)}..."`;
        auditLogAction = `Pedido de Revisão Administrativa: ${revisionReason} (Prot: ${newProtocol.protocolNumber})`;
        newState = 'Em análise';
        setRevisionJustification('');
      } else if (actionName === 'Contestação') {
        detailsText = `Contestação formal interposta na categoria: ${contestCategory}. Fundamentação: "${contestJustification.substring(0, 70)}..."`;
        auditLogAction = `Contestação e Impugnação Administrativa registada (Prot: ${newProtocol.protocolNumber})`;
        newState = 'Contestada';
        setContestJustification('');
      } else if (actionName === 'Anexar documento') {
        detailsText = `Documento "${attachedFileName || 'comprovativo_oficial.pdf'}" anexado e armazenado com custódia segura do Estado.`;
        auditLogAction = `Documento Anexo submetido: ${attachedFileName || 'comprovativo_oficial.pdf'} (Prot: ${newProtocol.protocolNumber})`;
        setAttachedFileName('');
        setAttachedFileBase64(null);
      } else if (actionName === 'Agendar atendimento') {
        detailsText = `Atendimento agendado para o dia ${scheduleDate} por via ${scheduleMode} em ${scheduleLocation}.`;
        auditLogAction = `Agendamento de Atendimento Oficial registado para ${scheduleDate} - ${scheduleLocation} (Prot: ${newProtocol.protocolNumber})`;
      } else if (actionName === 'Encaminhar pedido') {
        detailsText = `Processo/Correspondência encaminhada formalmente para: ${forwardTarget}. Nota de despacho: "${forwardJustification.substring(0, 60)}..."`;
        auditLogAction = `Encaminhamento de Pedido deferido para ${forwardTarget} (Prot: ${newProtocol.protocolNumber})`;
        newState = 'Encaminhada';
        setForwardJustification('');
      }

      const logEntry = `${timestampStr} - ${auditLogAction}`;
      const updatedLogs = [...(selectedMessage.auditLogs || []), logEntry];

      if (onUpdateMessage) {
        onUpdateMessage({
          ...selectedMessage,
          details: selectedMessage.details ? {
            ...selectedMessage.details,
            state: newState
          } : undefined,
          auditLogs: updatedLogs
        });
      }

      setSuccessProtocol({
        protocolNumber: newProtocol.protocolNumber,
        actionName,
        details: detailsText,
        timestamp: fullTimestamp,
        digitalSeal: newProtocol.digitalSeal,
        documentHash: newProtocol.documentHash
      });

      setIsSubmittingAction(false);
      setActiveOfficialAction(null);
    }, 1500);
  };

  const sensitivityLevel = selectedMessage.sensitivity || 'Público';
  const sensConfig = SENSITIVITY_LEVELS[sensitivityLevel];

  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [isSessionExpired, setIsSessionExpired] = useState(false);
  const [isReauthenticating, setIsReauthenticating] = useState(false);
  const [isWindowFocused, setIsWindowFocused] = useState(true);
  const [shareBlockedNotice, setShareBlockedNotice] = useState<string | null>(null);

  const messagePriority = selectedMessage.priorityScale || 'Normal';
  const prioConfig = PRIORITY_CONFIGS[messagePriority];
  const [deadlineSecondsLeft, setDeadlineSecondsLeft] = useState<number | null>(null);

  useEffect(() => {
    if (selectedMessage.deadlineHoursRemaining !== undefined) {
      setDeadlineSecondsLeft(selectedMessage.deadlineHoursRemaining * 3600);
    } else {
      setDeadlineSecondsLeft(null);
    }
  }, [selectedMessage.id, selectedMessage.deadlineHoursRemaining]);

  useEffect(() => {
    if (deadlineSecondsLeft === null) return;
    if (deadlineSecondsLeft <= 0) return;

    const interval = setInterval(() => {
      setDeadlineSecondsLeft(prev => (prev !== null && prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(interval);
  }, [deadlineSecondsLeft]);

  const formatDeadlineRemaining = (totalSecs: number) => {
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    
    // Satisfy exact requested phrase "Prazo restante: 48 horas" when minutes & seconds are 0
    if (mins === 0 && secs === 0) {
      return `Prazo restante: ${hrs} horas`;
    }
    return `Prazo restante: ${hrs} horas, ${mins}m e ${secs}s`;
  };

  useEffect(() => {
    const handleFocus = () => setIsWindowFocused(true);
    const handleBlur = () => setIsWindowFocused(false);

    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);

    return () => {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
    };
  }, []);

  const addAuditLogToMessage = (actionName: string) => {
    if (!onUpdateMessage) return;
    const now = new Date();
    const formattedTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const logText = `${formattedTime} - ${actionName}`;
    const currentLogs = selectedMessage.auditLogs || [];
    if (currentLogs.includes(logText)) return;
    const updatedMsg = {
      ...selectedMessage,
      auditLogs: [...currentLogs, logText]
    };
    onUpdateMessage(updatedMsg);
  };

  useEffect(() => {
    setIsSessionExpired(false);
    setIsReauthenticating(false);
    setShareBlockedNotice(null);
    
    if (sensConfig && sensConfig.sessionTimeoutSeconds > 0) {
      setTimeLeft(sensConfig.sessionTimeoutSeconds);
    } else {
      setTimeLeft(null);
    }
  }, [selectedMessage.id, sensitivityLevel]);

  useEffect(() => {
    if (timeLeft === null) return;
    if (timeLeft <= 0) {
      setIsSessionExpired(true);
      const now = new Date();
      const formattedTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      const logText = `${formattedTime} - Sessão expirada (${sensConfig.level})`;
      if (onUpdateMessage) {
        const currentLogs = selectedMessage.auditLogs || [];
        if (!currentLogs.some(log => log.includes('Sessão expirada'))) {
          onUpdateMessage({
            ...selectedMessage,
            auditLogs: [...currentLogs, logText]
          });
        }
      }
      return;
    }

    const interval = setInterval(() => {
      setTimeLeft(prev => (prev !== null ? prev - 1 : null));
    }, 1000);

    return () => clearInterval(interval);
  }, [timeLeft, selectedMessage.id]);

  const handleReauthenticate = () => {
    setIsReauthenticating(true);
    setTimeout(() => {
      setIsReauthenticating(false);
      setIsSessionExpired(false);
      if (sensConfig && sensConfig.sessionTimeoutSeconds > 0) {
        setTimeLeft(sensConfig.sessionTimeoutSeconds);
      }
      addAuditLogToMessage(`Acesso renovado via BI Digital (${sensConfig.level})`);
    }, 2000);
  };

  useEffect(() => {
    const hasVisualized = selectedMessage.auditLogs?.some(log => log.includes('Documento visualizado'));
    if (!hasVisualized) {
      addAuditLogToMessage('Documento visualizado');
    }
  }, [selectedMessage.id]);

  const triggerVerification = () => {
    setShowQRValidation(true);
    setIsValidating(true);
    setTimeout(() => {
      setIsValidating(false);
    }, 850);
  };

  const protocol = selectedMessage.protocol || generateProtocol(
    selectedMessage.org,
    'message',
    selectedMessage.id,
    selectedMessage.details?.subject || selectedMessage.preview
  );

  if (activeAction === 'Ver detalhes') {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -15 }}
        className="space-y-6 pt-2 pb-6 text-left"
      >
        <div className="flex items-center">
          <button 
            type="button"
            onClick={() => setActiveAction(null)}
            className="text-[#384e6e] hover:text-slate-900 hover:bg-slate-100/60 p-2 rounded-full transition-all cursor-pointer flex items-center justify-center border-0 outline-none"
            title="Voltar"
          >
            <ArrowLeft size={24} />
          </button>
        </div>

        <div className="bg-white p-8 md:p-11 rounded-[24px] border border-slate-300 shadow-[0_8px_30px_rgb(0,0,0,0.03)] selection:bg-indigo-100 select-text">
          <div className="flex items-center gap-3 mb-8 text-[#0c2340]">
            <FileText size={24} className="text-[#0c2340]" />
            <span className="font-sans font-extrabold text-[#0c2340] text-base md:text-lg">Conteúdo do Documento</span>
          </div>
          {selectedMessage.details?.body && selectedMessage.details.body.trim().length > 0 ? (
            <div className="space-y-6 text-slate-700 text-sm md:text-[15px] leading-relaxed tracking-wide font-sans">
              {selectedMessage.details.body.split('\n\n').map((paragraph, bgIdx) => {
                const lines = paragraph.split('\n');
                return (
                  <p key={bgIdx} className="font-medium text-slate-700">
                    {lines.map((line, lineIdx) => (
                      <React.Fragment key={lineIdx}>
                        {t(line)}
                        {lineIdx < lines.length - 1 && <br />}
                      </React.Fragment>
                    ))}
                  </p>
                );
              })}
            </div>
          ) : (
            <div className="space-y-6 text-slate-700 text-sm md:text-[15px] leading-relaxed tracking-wide font-sans">
              <p className="font-medium text-slate-700">
                {t("Prezado(a) cidadão(ã),")}<br /><br />
                {t(selectedMessage.preview) || t("Informamos que foi registada uma nova correspondência oficial associada à sua identidade digital no Correio Digital de Angola.")}<br /><br />
                {t("Os serviços públicos integrados de telecomunicações e tecnologias digitais continuam a reforçar a proximidade dos cidadãos aos órgãos e instituições do Estado angolano com toda a segurança, autenticidade e validade legal garantida por lei.")}<br /><br />
                {t("Atenciosamente,")}<br />
                {t("Secretaria do Correio Digital Angola")}
              </p>
            </div>
          )}

          {/* Divider and Reply Section */}
          <div className="mt-8 pt-8 border-t border-slate-200">
            {detailReplySuccess ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 space-y-4"
              >
                <div className="flex items-center gap-2.5 text-emerald-800">
                  <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center">
                    <Check size={16} strokeWidth={3} />
                  </div>
                  <div>
                    <h5 className="font-extrabold text-sm uppercase tracking-wide leading-none">Resposta Enviada com Sucesso</h5>
                    <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest font-mono">Registo Criptográfico Selado</span>
                  </div>
                </div>

                <div className="bg-white border border-emerald-100 p-4 rounded-xl space-y-3 text-xs text-slate-700">
                  <div>
                    <span className="text-[9px] font-black text-slate-450 block uppercase">Protocolo de Resposta</span>
                    <span className="font-mono font-bold text-primary block text-[13px]">{detailReplySuccess.protocolNumber}</span>
                  </div>
                  <div>
                    <span className="text-[9px] font-black text-slate-450 block uppercase">Teor Enviado</span>
                    <p className="bg-slate-50 border border-slate-150 p-2.5 rounded-lg font-mono text-slate-700 leading-relaxed max-h-32 overflow-y-auto">
                      {detailReplySuccess.text}
                    </p>
                  </div>
                  {detailReplySuccess.files && detailReplySuccess.files.length > 0 && (
                    <div>
                      <span className="text-[9px] font-black text-slate-450 block uppercase mb-1">Ficheiros Oficiais Anexados ({detailReplySuccess.files.length})</span>
                      <div className="space-y-1 bg-slate-50 border border-slate-150 p-2.5 rounded-lg">
                        {detailReplySuccess.files.map((file, fIdx) => (
                          <div key={fIdx} className="flex items-center gap-2 text-[10.5px] font-mono text-slate-600 leading-none">
                            <span className="text-emerald-500 font-extrabold text-xs">✓</span>
                            <span className="font-semibold truncate max-w-[200px] md:max-w-xs">{file.name}</span>
                            <span className="text-slate-400 text-[9.5px]">({file.size})</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3 pt-2 border-t border-dashed border-slate-150">
                    <div>
                      <span className="text-[9px] font-black text-slate-450 block uppercase">Data & Hora Registo</span>
                      <span className="font-bold text-slate-850 font-mono">{detailReplySuccess.timestamp}</span>
                    </div>
                    <div>
                      <span className="text-[9px] font-black text-slate-450 block uppercase">Estado Operacional</span>
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-purple-100 text-purple-800 border border-purple-200 leading-none inline-block">
                        Respondida
                      </span>
                    </div>
                  </div>
                  <div>
                    <span className="text-[9px] font-black text-slate-450 block uppercase">Selo Digital Institucional</span>
                    <span className="font-mono text-[8px] text-slate-500 break-all block truncate">{detailReplySuccess.digitalSeal}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setDetailReplySuccess(null)}
                  className="px-4 py-2 text-xs font-bold text-emerald-800 hover:text-emerald-950 bg-emerald-100 hover:bg-emerald-200 rounded-lg transition-all cursor-pointer active:scale-95 border border-emerald-300"
                >
                  Criar Nova Resposta
                </button>
              </motion.div>
            ) : isReplyingInDetails ? (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="space-y-4 text-left"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black tracking-widest text-[#0c2340] uppercase font-mono block">
                    Elaboração de Resposta Oficial
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setIsReplyingInDetails(false);
                      setDetailReplyText('');
                    }}
                    className="text-xs font-bold text-slate-500 hover:text-slate-800 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 transition-all cursor-pointer"
                  >
                    Cancelar
                  </button>
                </div>

                {sensConfig.level === 'Ultra Restrito' ? (
                  <div className="bg-red-50 border border-red-200 text-red-00 p-4 rounded-xl flex items-start gap-2 text-xs font-bold">
                    <Lock size={16} className="text-red-500 shrink-0 mt-0.5 animate-pulse" />
                    <div>
                      <span>Este documento possui sensibilidade crítica de nível <strong>Ultra Restrito</strong>.</span>
                      <p className="text-[10px] text-red-700 mt-1 font-semibold leading-relaxed">
                        A resposta a este documento está bloqueada por motivos regulamentares e de confidencialidade de Estado.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      {/* Rich text Toolbar for details view, styled exactly like the attached image */}
                      <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-white border border-slate-200 rounded-2xl mb-2 shadow-sm">
                        {/* Undo / Redo */}
                        <div className="flex items-center gap-0.5">
                          <button
                            type="button"
                            onClick={handleDetailUndo}
                            disabled={detailHistoryIndex === 0}
                            title="Desfazer (Undo)"
                            className={`p-2 rounded-xl hover:bg-slate-200/80 active:scale-95 transition-all ${
                              detailHistoryIndex === 0 ? 'text-slate-300 cursor-not-allowed' : 'text-slate-650 hover:text-slate-900'
                            }`}
                          >
                            <Undo size={14} className="stroke-[2.5]" />
                          </button>
                          <button
                            type="button"
                            onClick={handleDetailRedo}
                            disabled={detailHistoryIndex >= detailTextHistory.length - 1}
                            title="Refazer (Redo)"
                            className={`p-2 rounded-xl hover:bg-slate-200/80 active:scale-95 transition-all ${
                              detailHistoryIndex >= detailTextHistory.length - 1 ? 'text-slate-300 cursor-not-allowed' : 'text-slate-650 hover:text-slate-900'
                            }`}
                          >
                            <Redo size={14} className="stroke-[2.5]" />
                          </button>
                        </div>

                        <div className="w-[1px] h-4 bg-slate-200 mx-0.5" />

                        {/* Font Family Selector Dropdown */}
                        <div className="relative">
                          <select
                            value={detailEditorFont}
                            onChange={(e) => setDetailEditorFont(e.target.value)}
                            className="bg-transparent text-slate-700 text-xs font-semibold py-1 pl-2 pr-5 border border-transparent rounded-xl hover:bg-slate-200/60 cursor-pointer focus:outline-none appearance-none font-sans"
                          >
                            <option value="sans-serif">Sans Serif</option>
                            <option value="serif">Serif (Editorial)</option>
                            <option value="monospace">Monospace</option>
                          </select>
                          <div className="absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-[8px] font-black">▼</div>
                        </div>

                        <div className="w-[1px] h-4 bg-slate-200 mx-0.5" />

                        {/* Font Size Selector Dropdown "tT" */}
                        <div className="relative flex items-center">
                          <span className="text-[10px] font-black mr-1 text-slate-500">tT</span>
                          <select
                            value={detailEditorFontSize}
                            onChange={(e) => setDetailEditorFontSize(e.target.value)}
                            className="bg-transparent text-slate-700 text-xs font-semibold py-1 pl-1.5 pr-4 border border-transparent rounded-xl hover:bg-slate-200/60 cursor-pointer focus:outline-none appearance-none font-sans"
                          >
                            <option value="sm">Pequeno</option>
                            <option value="base">Normal</option>
                            <option value="lg">Grande</option>
                            <option value="xl">Título</option>
                          </select>
                          <div className="absolute right-1 top-1/2 -translate-y-1/2 pointer-events-none text-slate-405 text-[8px] font-black">▼</div>
                        </div>

                        <div className="w-[1px] h-4 bg-slate-200 mx-0.5" />

                        {/* Inline formatting styles B, I, U */}
                        <div className="flex items-center gap-0.5">
                          <button
                            type="button"
                            onClick={() => setDetailEditorBold(!detailEditorBold)}
                            title="Negrito (Bold)"
                            className={`p-1.5 rounded-xl active:scale-95 transition-all font-black text-xs min-w-[28px] flex items-center justify-center ${
                              detailEditorBold 
                                ? 'bg-indigo-100/80 text-indigo-700 border border-indigo-200/30' 
                                : 'text-slate-655 hover:bg-slate-200/60 hover:text-slate-900'
                            }`}
                          >
                            <Bold size={13} className="stroke-[3]" />
                          </button>

                          <button
                            type="button"
                            onClick={() => setDetailEditorItalic(!detailEditorItalic)}
                            title="Itálico (Italic)"
                            className={`p-1.5 rounded-xl active:scale-95 transition-all font-black text-xs min-w-[28px] flex items-center justify-center ${
                              detailEditorItalic 
                                ? 'bg-indigo-100/80 text-indigo-700 border border-indigo-200/30' 
                                : 'text-slate-655 hover:bg-slate-200/60 hover:text-slate-900'
                            }`}
                          >
                            <Italic size={13} className="stroke-[3]" />
                          </button>

                          <button
                            type="button"
                            onClick={() => setDetailEditorUnderline(!detailEditorUnderline)}
                            title="Sublinhado (Underline)"
                            className={`p-1.5 rounded-xl active:scale-95 transition-all font-black text-xs min-w-[28px] flex items-center justify-center ${
                              detailEditorUnderline 
                                ? 'bg-indigo-100/80 text-indigo-700 border border-indigo-200/30' 
                                : 'text-slate-655 hover:bg-slate-200/60 hover:text-slate-900'
                            }`}
                          >
                            <Underline size={13} className="stroke-[3]" />
                          </button>
                        </div>

                        <div className="w-[1px] h-4 bg-slate-200 mx-0.5" />

                        {/* Font Color Selection */}
                        <div className="relative group">
                          <button
                            type="button"
                            title="Cor do Texto"
                            className="p-1.5 rounded-xl text-slate-650 hover:bg-slate-200/60 hover:text-slate-900 active:scale-95 transition-all flex items-center gap-1"
                          >
                            <span className="font-extrabold text-xs border-b-2 leading-none" style={{ borderColor: detailEditorColor }}>A</span>
                            <span className="text-[6px]">▼</span>
                          </button>
                          <div className="absolute left-0 top-8 hidden group-hover:flex group-focus-within:flex flex-col bg-white border border-slate-200 rounded-xl p-2 shadow-xl z-20 min-w-[130px] gap-1">
                            <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest px-1">Cor da Fonte</span>
                            <div className="grid grid-cols-5 gap-1 pt-1">
                              {[
                                { label: 'Slate', value: '#1e293b', bgClass: 'bg-slate-800' },
                                { label: 'Red', value: '#dc2626', bgClass: 'bg-red-600' },
                                { label: 'Blue', value: '#2563eb', bgClass: 'bg-blue-600' },
                                { label: 'Green', value: '#16a34a', bgClass: 'bg-green-600' },
                                { label: 'Gold', value: '#ca8a04', bgClass: 'bg-yellow-600' }
                              ].map((color) => (
                                <button
                                  key={color.value}
                                  type="button"
                                  onClick={() => setDetailEditorColor(color.value)}
                                  title={color.label}
                                  className={`w-3.5 h-3.5 rounded-full border transition-all ${color.bgClass} ${
                                    detailEditorColor === color.value ? 'ring-2 ring-indigo-500 ring-offset-1 border-white' : 'border-black/5'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="w-[1px] h-4 bg-slate-200 mx-0.5" />

                        {/* Paragraph Alignment Selector Button Row */}
                        <div className="flex items-center gap-0.5">
                          {[
                            { val: 'left', icon: <AlignLeft size={13} />, title: 'Alinhar à Esquerda' },
                            { val: 'center', icon: <AlignCenter size={13} />, title: 'Alinhar ao Centro' },
                            { val: 'right', icon: <AlignRight size={13} />, title: 'Alinhar à Direita' },
                            { val: 'justify', icon: <AlignJustify size={13} />, title: 'Justificar' }
                          ].map((align) => (
                            <button
                              key={align.val}
                              type="button"
                              onClick={() => setDetailEditorAlignment(align.val)}
                              title={align.title}
                              className={`p-1.5 rounded-xl active:scale-95 transition-all text-slate-655 ${
                                detailEditorAlignment === align.val 
                                  ? 'bg-indigo-100/85 text-indigo-700 border border-indigo-200/30' 
                                  : 'hover:bg-slate-200/60 hover:text-slate-900'
                              }`}
                            >
                              {align.icon}
                            </button>
                          ))}
                        </div>

                        <div className="w-[1px] h-4 bg-slate-200 mx-0.5" />

                        {/* List Type Bullet/Ordered Toggles */}
                        <div className="flex items-center gap-0.5">
                          <button
                            type="button"
                            onClick={() => {
                              if (detailEditorListType === 'bullet') {
                                setDetailEditorListType(null);
                              } else {
                                setDetailEditorListType('bullet');
                                if (!detailReplyText.trim().startsWith('•') && !detailReplyText.trim().startsWith('-')) {
                                  updateDetailReplyText(`• ` + detailReplyText);
                                }
                              }
                            }}
                            title="Lista de Marcadores (Bullets)"
                            className={`p-1.5 rounded-xl active:scale-95 transition-all ${
                              detailEditorListType === 'bullet'
                                ? 'bg-indigo-100/85 text-indigo-700 border border-indigo-200/30'
                                : 'text-slate-605 hover:bg-slate-200/60 hover:text-slate-900'
                            }`}
                          >
                            <List size={13} />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (detailEditorListType === 'ordered') {
                                setDetailEditorListType(null);
                              } else {
                                setDetailEditorListType('ordered');
                                if (!/^\d+\./.test(detailReplyText.trim())) {
                                  updateDetailReplyText(`1. ` + detailReplyText);
                                }
                              }
                            }}
                            title="Lista Numerada"
                            className={`p-1.5 rounded-xl active:scale-95 transition-all ${
                              detailEditorListType === 'ordered'
                                ? 'bg-indigo-100/85 text-indigo-700 border border-indigo-200/30'
                                : 'text-slate-605 hover:bg-slate-200/60 hover:text-slate-900'
                            }`}
                          >
                            <ListOrdered size={13} />
                          </button>
                        </div>

                        <div className="w-[1px] h-4 bg-slate-200 mx-0.5" />

                        {/* Blockquote Quote */}
                        <button
                          type="button"
                          onClick={() => setDetailEditorIsQuote(!detailEditorIsQuote)}
                          title="Formatar como Citação (Blockquote)"
                          className={`p-1.5 rounded-xl active:scale-95 transition-all ${
                            detailEditorIsQuote
                              ? 'bg-indigo-100/85 text-indigo-700 border border-indigo-200/30'
                              : 'text-slate-605 hover:bg-slate-200/60 hover:text-slate-900'
                          }`}
                        >
                          <Quote size={13} />
                        </button>

                        {/* Clear formatting Eraser */}
                        <button
                          type="button"
                          onClick={clearDetailFormatting}
                          title="Limpar Formatação"
                          className="p-1.5 rounded-xl text-slate-600 hover:bg-slate-250 hover:text-red-650 hover:bg-red-50/70 active:scale-95 transition-all ml-auto"
                        >
                          <Eraser size={13} />
                        </button>
                      </div>

                      <textarea
                        value={detailReplyText}
                        onChange={(e) => updateDetailReplyText(e.target.value)}
                        placeholder="Escreva aqui a sua resposta oficial..."
                        rows={12}
                        className={`w-full bg-slate-50 border border-slate-300 rounded-xl p-3.5 text-xs md:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#0c2340]/20 focus:border-[#0c2340] shadow-inner transition-all min-h-[260px] ${
                          detailEditorFont === 'serif' ? 'font-serif' : detailEditorFont === 'monospace' ? 'font-mono' : 'font-sans'
                        } ${
                          detailEditorFontSize === 'sm' ? 'text-xs' : detailEditorFontSize === 'lg' ? 'text-base md:text-lg' : detailEditorFontSize === 'xl' ? 'text-lg md:text-xl font-bold' : 'text-sm'
                        } ${
                          detailEditorAlignment === 'center' ? 'text-center' : detailEditorAlignment === 'right' ? 'text-right' : detailEditorAlignment === 'justify' ? 'text-justify' : 'text-left'
                        }`}
                        style={{
                          fontWeight: detailEditorBold ? 'bold' : 'normal',
                          fontStyle: detailEditorItalic ? 'italic' : 'normal',
                          textDecoration: detailEditorUnderline ? 'underline' : 'none',
                          color: detailEditorColor,
                          borderLeft: detailEditorIsQuote ? '4px solid #6366f1' : undefined,
                          paddingLeft: detailEditorIsQuote ? '1rem' : undefined,
                        }}
                      />
                    </div>

                    <div className="flex flex-col gap-3">
                      {inlineAttachedFiles.length > 0 && (
                        <div className="flex flex-wrap gap-2 p-3 bg-slate-50 border border-slate-205 rounded-2xl">
                          {inlineAttachedFiles.map((file, fIdx) => (
                            <div 
                              key={fIdx} 
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-xl shadow-xs text-[11px] font-bold text-slate-700"
                            >
                              <FileText size={13} className="text-[#0c2340]/80 shrink-0" />
                              <span className="truncate max-w-[160px] select-none">{file.name}</span>
                              <span className="text-[9px] text-slate-400 font-mono select-none">({file.size})</span>
                              <button 
                                type="button"
                                onClick={() => handleInlineFileRemove(file.name)}
                                className="p-0.5 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded transition-colors cursor-pointer ml-1"
                                title="Remover anexo"
                              >
                                <Trash2 size={11} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            if (!detailReplyText.trim()) return;

                            const newProtocol = generateProtocol(
                              selectedMessage.org,
                              'message',
                              selectedMessage.id,
                              `Resposta: ${selectedMessage.details?.subject || selectedMessage.preview}`
                            );
                            const now = new Date();
                            const timestampStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
                            const dmyStr = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`;
                            const fullTimestamp = `${dmyStr} ${timestampStr}`;

                            const filesListLog = inlineAttachedFiles.length > 0 
                              ? ` contendo ${inlineAttachedFiles.length} anexo(s) [${inlineAttachedFiles.map(f => f.name).join(', ')}]`
                              : '';
                            const auditLogAction = `Resposta Oficial submetida via Conteúdo do Documento (Prot: ${newProtocol.protocolNumber})${filesListLog}`;
                            const logEntry = `${timestampStr} - ${auditLogAction}`;
                            const updatedLogs = [...(selectedMessage.auditLogs || []), logEntry];

                            if (onUpdateMessage) {
                              onUpdateMessage({
                                ...selectedMessage,
                                details: selectedMessage.details ? {
                                  ...selectedMessage.details,
                                  state: 'Respondida'
                                } : {
                                  subject: selectedMessage.preview,
                                  body: selectedMessage.preview,
                                  state: 'Respondida'
                                },
                                auditLogs: updatedLogs
                              });
                            }

                            setDetailReplySuccess({
                              protocolNumber: newProtocol.protocolNumber,
                              timestamp: fullTimestamp,
                              text: detailReplyText,
                              digitalSeal: newProtocol.digitalSeal,
                              documentHash: newProtocol.documentHash,
                              files: inlineAttachedFiles
                            });

                            setDetailReplyText('');
                            setInlineAttachedFiles([]);
                            setIsReplyingInDetails(false);
                          }}
                          disabled={!detailReplyText.trim()}
                          className="flex items-center gap-2 px-5 py-2.5 bg-[#0c2340] text-white font-extrabold text-xs md:text-sm rounded-full shadow-md hover:bg-[#152e4d] transition-all hover:scale-[1.02] active:scale-95 cursor-pointer disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed"
                        >
                          <Send size={14} className="text-white" />
                          <span>Enviar Resposta Oficial</span>
                        </button>

                        <label 
                          className="flex items-center justify-center p-2.5 bg-transparent hover:bg-slate-100/70 text-[#0c2340] hover:text-indigo-700 rounded-full transition-all cursor-pointer active:scale-95 border border-slate-300 relative group"
                          title="Anexar múltiplos ficheiros"
                        >
                          <Paperclip size={16} className="stroke-[2.5]" />
                          <input
                            type="file"
                            multiple
                            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.xlsx"
                            className="hidden"
                            onChange={handleInlineFileAdd}
                          />
                          {inlineAttachedFiles.length > 0 && (
                            <span className="absolute -top-1.5 -right-1.5 bg-[#0c2340] text-white font-black text-[9px] w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                              {inlineAttachedFiles.length}
                            </span>
                          )}
                        </label>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            ) : (
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="text-left">
                  <h5 className="font-extrabold text-sm text-slate-900 leading-none">Precisa responder a este documento?</h5>
                  <p className="text-xs text-slate-550 font-semibold mt-1">Envie uma resposta formal assinada registando um protocolo associado.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsReplyingInDetails(true)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-full font-black text-xs md:text-sm shadow-md transition-all cursor-pointer hover:scale-[1.02] active:scale-95 ${
                    sensConfig.level === 'Ultra Restrito'
                      ? 'bg-slate-100 text-slate-400 border border-slate-205 cursor-not-allowed'
                      : 'bg-[#0c2340] text-white hover:bg-[#152e4d]'
                  }`}
                  disabled={sensConfig.level === 'Ultra Restrito'}
                >
                  <Send size={14} className="text-white" />
                  <span>{sensConfig.level === 'Ultra Restrito' ? 'Resposta Bloqueada' : 'Responder ao Documento'}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <div className="flex items-center justify-between gap-3">
        <button 
          onClick={() => {
            setTab('correspondencias');
            setSelectedMessage(null);
          }}
          className="text-[#384e6e] hover:text-slate-900 hover:bg-slate-100/60 p-2 rounded-full transition-all cursor-pointer flex items-center justify-center border-0 outline-none"
          title="Voltar ao Correio"
        >
          <ArrowLeft size={24} />
        </button>
        
        <div className="flex items-center gap-2">
          {isDeleted ? (
            <button
              onClick={() => {
                if (onRestoreMessage) {
                  onRestoreMessage(selectedMessage.id);
                  setTab('correspondencias');
                  setSelectedMessage(null);
                }
              }}
              className="px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-extrabold text-sm rounded-xl transition-all active:scale-95 flex items-center gap-1.5 border-0 cursor-pointer"
            >
              Restaurar do Arquivo
            </button>
          ) : (
            <button
              onClick={() => {
                if (onDeleteMessage) {
                  if (confirm("Deseja realmente arquivar esta correspondência oficial?")) {
                    onDeleteMessage(selectedMessage.id);
                    setTab('correspondencias');
                    setSelectedMessage(null);
                  }
                }
              }}
              className="px-4 py-2 bg-red-50 hover:bg-red-105 text-red-650 font-extrabold text-sm rounded-xl transition-all active:scale-95 flex items-center gap-1.5 border-0 cursor-pointer"
            >
              <Trash2 size={14} />
              Arquivar
            </button>
          )}

          <button 
            onClick={() => {
              if (sensConfig.level === 'Ultra Restrito') {
                setShareBlockedNotice('Bloqueado: Política de Controle de Compartilhamento proíbe reencaminhar ou responder a documentos de nível Ultra Restrito.');
                setTimeout(() => setShareBlockedNotice(null), 5000);
                return;
              }
              addAuditLogToMessage('Resposta enviada');
              handleReply(selectedMessage);
            }}
            className={`px-4 py-2 rounded-xl font-extrabold text-sm transition-all active:scale-95 flex items-center gap-1.5 border-0 cursor-pointer ${
              sensConfig.level === 'Ultra Restrito' 
                ? 'text-red-500 bg-red-50 hover:bg-red-100/30' 
                : 'text-primary hover:bg-primary/5 bg-transparent'
            }`}
          >
            {sensConfig.level === 'Ultra Restrito' && <Lock size={14} />}
            {sensConfig.level === 'Ultra Restrito' ? 'Responder Bloqueado' : 'Responder'}
          </button>
        </div>
      </div>

      {shareBlockedNotice && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="bg-red-50 border border-red-200 text-red-800 p-3.5 rounded-2xl flex items-center gap-2.5 text-xs font-bold"
        >
          <Lock size={16} className="text-red-500 shrink-0 animate-pulse" />
          <span>{shareBlockedNotice}</span>
        </motion.div>
      )}



      <section className={`border border-line rounded-2xl p-5 bg-white shadow-sm relative overflow-hidden select-none print:hidden ${sensConfig.screenshotProtection ? 'selection:bg-transparent' : ''}`}>
        <AnimatePresence mode="wait">
          {activeOfficialAction ? (
            <motion.div
              key="official-action-form"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6 text-left"
            >
              {/* Header */}
              <div className="flex items-center gap-3 pb-4 border-b border-slate-150">
                <button
                  type="button"
                  onClick={() => {
                    setActiveOfficialAction(null);
                  }}
                  className="flex items-center justify-center w-10 h-10 bg-white border-2 border-[#d1dbe5] rounded-full text-[#384e6e] hover:bg-slate-50 transition-all shadow-md cursor-pointer hover:scale-105 active:scale-95"
                  title="Voltar"
                >
                  <ArrowLeft size={16} className="text-[#384e6e]" />
                </button>
                <div className="text-left">
                  <h4 className="font-extrabold text-[#111A2E] text-sm md:text-base flex items-center gap-1.5 uppercase tracking-wide">
                     Trâmite Oficial: {activeOfficialAction}
                  </h4>
                  <p className="text-[9px] text-slate-500 uppercase tracking-widest font-black leading-none mt-0.5">
                     Formalização Digital com Validade Jurídica
                  </p>
                </div>
              </div>

              {/* Responder Form */}
              {activeOfficialAction === 'Responder' && (
                <div className="space-y-4">
                  <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl text-xs text-slate-600 leading-relaxed font-semibold">
                    Configure a sua resposta formal. O envio deste formulário regista automaticamente um novo protocolo governamental associado ao seu processo.
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1.5">Corpo do Ofício de Resposta</label>
                    
                    {/* Rich text Toolbar styled exactly like the attached image */}
                    <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-white border border-slate-200 rounded-2xl mb-2 shadow-sm">
                      {/* Undo / Redo */}
                      <div className="flex items-center gap-0.5">
                        <button
                          type="button"
                          onClick={handleUndo}
                          disabled={historyIndex === 0}
                          title="Desfazer (Undo)"
                          className={`p-2 rounded-xl hover:bg-slate-200/80 active:scale-95 transition-all ${
                            historyIndex === 0 ? 'text-slate-300 cursor-not-allowed' : 'text-slate-650 hover:text-slate-900'
                          }`}
                        >
                          <Undo size={14} className="stroke-[2.5]" />
                        </button>
                        <button
                          type="button"
                          onClick={handleRedo}
                          disabled={historyIndex >= textHistory.length - 1}
                          title="Refazer (Redo)"
                          className={`p-2 rounded-xl hover:bg-slate-200/80 active:scale-95 transition-all ${
                            historyIndex >= textHistory.length - 1 ? 'text-slate-300 cursor-not-allowed' : 'text-slate-650 hover:text-slate-900'
                          }`}
                        >
                          <Redo size={14} className="stroke-[2.5]" />
                        </button>
                      </div>

                      <div className="w-[1px] h-4 bg-slate-200 mx-0.5" />

                      {/* Font Family Selector Dropdown */}
                      <div className="relative">
                        <select
                          value={editorFont}
                          onChange={(e) => setEditorFont(e.target.value)}
                          className="bg-transparent text-slate-700 text-xs font-semibold py-1 pl-2 pr-5 border border-transparent rounded-xl hover:bg-slate-200/60 cursor-pointer focus:outline-none appearance-none font-sans"
                        >
                          <option value="sans-serif">Sans Serif</option>
                          <option value="serif">Serif (Editorial)</option>
                          <option value="monospace">Monospace</option>
                        </select>
                        <div className="absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-[8px] font-black">▼</div>
                      </div>

                      <div className="w-[1px] h-4 bg-slate-200 mx-0.5" />

                      {/* Font Size Selector Dropdown "tT" */}
                      <div className="relative flex items-center">
                        <span className="text-[10px] font-black mr-1 text-slate-500">tT</span>
                        <select
                          value={editorFontSize}
                          onChange={(e) => setEditorFontSize(e.target.value)}
                          className="bg-transparent text-slate-700 text-xs font-semibold py-1 pl-1.5 pr-4 border border-transparent rounded-xl hover:bg-slate-200/60 cursor-pointer focus:outline-none appearance-none font-sans"
                        >
                          <option value="sm">Pequeno</option>
                          <option value="base">Normal</option>
                          <option value="lg">Grande</option>
                          <option value="xl">Título</option>
                        </select>
                        <div className="absolute right-1 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-[8px] font-black">▼</div>
                      </div>

                      <div className="w-[1px] h-4 bg-slate-200 mx-0.5" />

                      {/* Inline formatting styles B, I, U */}
                      <div className="flex items-center gap-0.5">
                        <button
                          type="button"
                          onClick={() => setEditorBold(!editorBold)}
                          title="Negrito (Bold)"
                          className={`p-1.5 rounded-xl active:scale-95 transition-all font-black text-xs min-w-[28px] flex items-center justify-center ${
                            editorBold 
                              ? 'bg-indigo-100/80 text-indigo-700 border border-indigo-200/30' 
                              : 'text-slate-655 hover:bg-slate-200/60 hover:text-slate-900'
                          }`}
                        >
                          <Bold size={13} className="stroke-[3]" />
                        </button>

                        <button
                          type="button"
                          onClick={() => setEditorItalic(!editorItalic)}
                          title="Itálico (Italic)"
                          className={`p-1.5 rounded-xl active:scale-95 transition-all font-black text-xs min-w-[28px] flex items-center justify-center ${
                            editorItalic 
                              ? 'bg-indigo-100/80 text-indigo-700 border border-indigo-200/30' 
                              : 'text-slate-655 hover:bg-slate-200/60 hover:text-slate-900'
                          }`}
                        >
                          <Italic size={13} className="stroke-[3]" />
                        </button>

                        <button
                          type="button"
                          onClick={() => setEditorUnderline(!editorUnderline)}
                          title="Sublinhado (Underline)"
                          className={`p-1.5 rounded-xl active:scale-95 transition-all font-black text-xs min-w-[28px] flex items-center justify-center ${
                            editorUnderline 
                              ? 'bg-indigo-100/80 text-indigo-700 border border-indigo-200/30' 
                              : 'text-slate-655 hover:bg-slate-200/60 hover:text-slate-900'
                          }`}
                        >
                          <Underline size={13} className="stroke-[3]" />
                        </button>
                      </div>

                      <div className="w-[1px] h-4 bg-slate-200 mx-0.5" />

                      {/* Font Color Selection */}
                      <div className="relative group">
                        <button
                          type="button"
                          title="Cor do Texto"
                          className="p-1.5 rounded-xl text-slate-650 hover:bg-slate-200/60 hover:text-slate-900 active:scale-95 transition-all flex items-center gap-1"
                        >
                          <span className="font-extrabold text-xs border-b-2 leading-none" style={{ borderColor: editorColor }}>A</span>
                          <span className="text-[6px]">▼</span>
                        </button>
                        <div className="absolute left-0 top-8 hidden group-hover:flex group-focus-within:flex flex-col bg-white border border-slate-200 rounded-xl p-2 shadow-xl z-20 min-w-[130px] gap-1">
                          <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest px-1">Cor da Fonte</span>
                          <div className="grid grid-cols-5 gap-1 pt-1">
                            {[
                              { label: 'Slate', value: '#1e293b', bgClass: 'bg-slate-800' },
                              { label: 'Red', value: '#dc2626', bgClass: 'bg-red-600' },
                              { label: 'Blue', value: '#2563eb', bgClass: 'bg-blue-600' },
                              { label: 'Green', value: '#16a34a', bgClass: 'bg-green-600' },
                              { label: 'Gold', value: '#ca8a04', bgClass: 'bg-yellow-600' }
                            ].map((color) => (
                              <button
                                key={color.value}
                                type="button"
                                onClick={() => setEditorColor(color.value)}
                                title={color.label}
                                className={`w-3.5 h-3.5 rounded-full border transition-all ${color.bgClass} ${
                                  editorColor === color.value ? 'ring-2 ring-indigo-500 ring-offset-1 border-white' : 'border-black/5'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="w-[1px] h-4 bg-slate-200 mx-0.5" />

                      {/* Paragraph Alignment Selector Button Row */}
                      <div className="flex items-center gap-0.5">
                        {[
                          { val: 'left', icon: <AlignLeft size={13} />, title: 'Alinhar à Esquerda' },
                          { val: 'center', icon: <AlignCenter size={13} />, title: 'Alinhar ao Centro' },
                          { val: 'right', icon: <AlignRight size={13} />, title: 'Alinhar à Direita' },
                          { val: 'justify', icon: <AlignJustify size={13} />, title: 'Justificar' }
                        ].map((align) => (
                          <button
                            key={align.val}
                            type="button"
                            onClick={() => setEditorAlignment(align.val)}
                            title={align.title}
                            className={`p-1.5 rounded-xl active:scale-95 transition-all text-slate-655 ${
                              editorAlignment === align.val 
                                ? 'bg-indigo-100/85 text-indigo-700 border border-indigo-200/30' 
                                : 'hover:bg-slate-200/60 hover:text-slate-900'
                            }`}
                          >
                            {align.icon}
                          </button>
                        ))}
                      </div>

                      <div className="w-[1px] h-4 bg-slate-200 mx-0.5" />

                      {/* List Type Bullet/Ordered Toggles */}
                      <div className="flex items-center gap-0.5">
                        <button
                          type="button"
                          onClick={() => {
                            if (editorListType === 'bullet') {
                              setEditorListType(null);
                            } else {
                              setEditorListType('bullet');
                              if (!replyText.trim().startsWith('•') && !replyText.trim().startsWith('-')) {
                                updateReplyText(`• ` + replyText);
                              }
                            }
                          }}
                          title="Lista de Marcadores (Bullets)"
                          className={`p-1.5 rounded-xl active:scale-95 transition-all ${
                            editorListType === 'bullet'
                              ? 'bg-indigo-100/85 text-indigo-700 border border-indigo-200/30'
                              : 'text-slate-605 hover:bg-slate-200/60 hover:text-slate-900'
                          }`}
                        >
                          <List size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (editorListType === 'ordered') {
                              setEditorListType(null);
                            } else {
                              setEditorListType('ordered');
                              if (!/^\d+\./.test(replyText.trim())) {
                                updateReplyText(`1. ` + replyText);
                              }
                            }
                          }}
                          title="Lista Numerada"
                          className={`p-1.5 rounded-xl active:scale-95 transition-all ${
                            editorListType === 'ordered'
                              ? 'bg-indigo-100/85 text-indigo-700 border border-indigo-200/30'
                              : 'text-slate-605 hover:bg-slate-200/60 hover:text-slate-900'
                          }`}
                        >
                          <ListOrdered size={13} />
                        </button>
                      </div>

                      <div className="w-[1px] h-4 bg-slate-200 mx-0.5" />

                      {/* Blockquote Quote */}
                      <button
                        type="button"
                        onClick={() => setEditorIsQuote(!editorIsQuote)}
                        title="Formatar como Citação (Blockquote)"
                        className={`p-1.5 rounded-xl active:scale-95 transition-all ${
                          editorIsQuote
                            ? 'bg-indigo-100/85 text-indigo-700 border border-indigo-200/30'
                            : 'text-slate-605 hover:bg-slate-200/60 hover:text-slate-900'
                        }`}
                      >
                        <Quote size={13} />
                      </button>

                      {/* Clear formatting Eraser */}
                      <button
                        type="button"
                        onClick={clearFormatting}
                        title="Limpar Formatação"
                        className="p-1.5 rounded-xl text-slate-600 hover:bg-slate-250 hover:text-red-650 hover:bg-red-50/70 active:scale-95 transition-all ml-auto"
                      >
                        <Eraser size={13} />
                      </button>
                    </div>

                    <textarea
                      value={replyText}
                      onChange={(e) => updateReplyText(e.target.value)}
                      placeholder="Introduza a sua mensagem de resposta formal aqui..."
                      rows={6}
                      className={`w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs md:text-sm font-semibold focus:outline-none focus:border-indigo-500 shadow-inner h-44 resize-y transition-all ${
                        editorFont === 'serif' ? 'font-serif' : editorFont === 'monospace' ? 'font-mono' : 'font-sans'
                      } ${
                        editorFontSize === 'sm' ? 'text-xs' : editorFontSize === 'lg' ? 'text-base md:text-lg' : editorFontSize === 'xl' ? 'text-lg md:text-xl font-bold' : 'text-sm'
                      } ${
                        editorAlignment === 'center' ? 'text-center' : editorAlignment === 'right' ? 'text-right' : editorAlignment === 'justify' ? 'text-justify' : 'text-left'
                      }`}
                      style={{
                        fontWeight: editorBold ? 'bold' : 'normal',
                        fontStyle: editorItalic ? 'italic' : 'normal',
                        textDecoration: editorUnderline ? 'underline' : 'none',
                        color: editorColor,
                        borderLeft: editorIsQuote ? '4px solid #6366f1' : undefined,
                        paddingLeft: editorIsQuote ? '1rem' : undefined,
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Confirmar leitura Form */}
              {activeOfficialAction === 'Confirmar leitura' && (
                <div className="space-y-4">
                  <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl text-xs text-slate-600 leading-relaxed font-semibold">
                     A confirmação de leitura oficial constitui um documento oficial de <strong className="text-slate-900">Aviso de Receção (AR)</strong> que comprova legalmente perante o órgão emissor que tomou conhecimento integral dos termos deste documento.
                  </div>

                  <label className="flex items-start gap-3 bg-indigo-50/40 border border-indigo-150 p-4 rounded-2xl cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={confirmReadCheckbox}
                      onChange={(e) => setConfirmReadCheckbox(e.target.checked)}
                      className="mt-1 w-4.5 h-4.5 rounded text-primary focus:ring-0 active:scale-95 transition-all text-xs"
                    />
                    <div className="text-xs font-bold text-slate-700 leading-relaxed">
                       Declaro formalmente, para todos os efeitos de lei civil e administrativa, que efetuei a leitura integral e compreendi todos os prazos, obrigações e termos jurídicos descritos nesta correspondência oficial emitida por <strong className="text-primary">{selectedMessage.org}</strong>.
                    </div>
                  </label>
                </div>
              )}

              {/* Assinar documento Form */}
              {activeOfficialAction === 'Assinar documento' && (
                <div className="space-y-4">
                  <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl text-xs text-slate-650 leading-relaxed font-semibold">
                     Aplique a sua assinatura digital qualificada ao documento em conformidade com as normas regulamentares de identidade digital de Angola.
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 block">Canal Chave de Identidade</label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setSignatureMethod('BI-DIGITAL')}
                        className={`p-3 rounded-2xl border text-xs font-black uppercase flex flex-col items-center justify-center gap-1.5 transition-all ${
                          signatureMethod === 'BI-DIGITAL' 
                            ? 'bg-primary border-primary text-white shadow shadow-primary/25' 
                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        <Fingerprint size={16} /> Key Móvel BI Digital
                      </button>
                      <button
                        type="button"
                        onClick={() => setSignatureMethod('ICP-AO')}
                        className={`p-3 rounded-2xl border text-xs font-black uppercase flex flex-col items-center justify-center gap-1.5 transition-all ${
                          signatureMethod === 'ICP-AO' 
                            ? 'bg-primary border-primary text-white shadow shadow-primary/25' 
                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        <Lock size={16} /> Certificado ICP-AO
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 block text-center">Código PIN Governamental (4 dígitos)</label>
                    <input
                      type="password"
                      maxLength={4}
                      value={signaturePin}
                      onChange={(e) => setSignaturePin(e.target.value.replace(/\D/g, ''))}
                      placeholder="••••"
                      className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-center text-sm font-black font-mono tracking-[0.5em] w-32 focus:outline-none focus:border-indigo-500 block mx-auto"
                    />
                  </div>

                  <div className="border border-slate-200 border-dashed rounded-2xl p-4 flex flex-col items-center justify-center bg-slate-50/50">
                    <div className="text-[8.5px] font-black text-slate-400 uppercase tracking-widest mb-1">Rubricar Assinatura Criptográfica</div>
                    <div 
                      onClick={() => setSignatureDraw(true)}
                      className="w-full h-20 bg-white border border-slate-200 rounded-xl flex items-center justify-center cursor-crosshair text-[11px] text-slate-500 font-semibold"
                    >
                      {signatureDraw ? (
                        <span className="font-mono text-[10px] text-slate-800 font-extrabold flex items-center gap-1.5">
                          ✍︎ {selectedMessage.org.replace(/[^a-zA-Z ]/g, "").substring(0, 10)}... Rubrica Eletrónica Ativa
                        </span>
                      ) : (
                        <span>Clique para autenticar rubrica manuscrita digitalizada</span>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Solicitar revisão Form */}
              {activeOfficialAction === 'Solicitar revisão' && (
                <div className="space-y-4">
                  <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl text-xs text-slate-650 leading-relaxed font-semibold">
                     Submeta um pedido de revisão administrativa caso identifique dados incorretos, valores em divergência ou erros fundamentais de processamento de facto.
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 block">Motivo Fundamental</label>
                    <select
                      value={revisionReason}
                      onChange={(e) => setRevisionReason(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs md:text-sm font-bold text-slate-700 focus:outline-none"
                    >
                      <option value="Divergência de Valores">Divergência de Valores / Montantes</option>
                      <option value="Dados de Identificação Incorretos">Dados de Identificação Incorretos</option>
                      <option value="Inconformidade Legal Fundamentada">Inconformidade Legal Fundamentada</option>
                      <option value="Duplicidade de Notificação Tributária">Duplicidade de Notificação Tributária</option>
                      <option value="Outro Motivo Administrativo">Outro Motivo Administrativo</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 block">Exposição dos Factos Fundamentados</label>
                    <textarea
                      value={revisionJustification}
                      onChange={(e) => setRevisionJustification(e.target.value)}
                      placeholder="Descreva minuciosamente a sua reclamação fundamentada..."
                      rows={4}
                      className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl p-3 text-xs md:text-sm font-semibold focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              )}

              {/* Contestação Form */}
              {activeOfficialAction === 'Contestação' && (
                <div className="space-y-4">
                  <div className="bg-red-50/50 border border-red-200 p-4 rounded-2xl text-xs text-red-855 leading-relaxed font-semibold flex gap-2.5 items-start">
                    <AlertTriangle size={18} className="text-red-500 shrink-0" />
                    <span>
                      A interposição de contestação oficial perante atos administrativos suspende os prazos de execução sob as leis de contencioso fiscal em vigor. Os seus dados e termos de fundamentação serão enviados diretamente à Procuradoria Geral.
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 block">Enquadramento Especial Jurídico</label>
                    <select
                      value={contestCategory}
                      onChange={(e) => setContestCategory(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs md:text-sm font-bold text-slate-705 focus:outline-none"
                    >
                      <option value="Atos Administrativos Legais">Atos Administrativos Legais / Desoneração</option>
                      <option value="Sanções e Multas Pecuniárias">Sanções e Multas Pecuniárias / Coimas</option>
                      <option value="Cobrança Fiscal Coativa AGT">Cobrança Fiscal Coativa AGT</option>
                      <option value="Decisões de Titularidade Pública">Decisões de Titularidade Pública / Caducidades</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 block">Substanciação da Defesa</label>
                    <textarea
                      value={contestJustification}
                      onChange={(e) => setContestJustification(e.target.value)}
                      placeholder="Indique as irregularidades ou vícios de forma que anulam o ato administrativo..."
                      rows={4}
                      className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl p-3 text-xs md:text-sm font-semibold focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {/* Anexar documento Form */}
              {activeOfficialAction === 'Anexar documento' && (
                <div className="space-y-4">
                  <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl text-xs text-slate-650 leading-relaxed font-semibold">
                    Anexe documentos comprovativos adicionais de sustentação da sua correspondência oficial em formato digital certificado.
                  </div>

                  <div className="border border-slate-200 border-dashed rounded-2xl p-6 bg-slate-50/50 text-center flex flex-col items-center justify-center hover:border-indigo-400 hover:bg-indigo-50/[0.05] transition-all cursor-pointer relative">
                    <input
                      type="file"
                      id="gov-file-uploader-nested"
                      accept=".pdf,.jpeg,.jpg,.png"
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setAttachedFileName(file.name);
                        }
                      }}
                    />
                    <Paperclip size={22} className="text-slate-400 mb-2 animate-bounce" />
                    <span className="text-[11px] font-black text-slate-700 block uppercase">Selecionar Ficheiro Oficial</span>
                    <span className="text-[10px] text-slate-400 mt-1 block">PDF, JPG ou PNG em custódia até 15MB</span>
                    
                    {attachedFileName && (
                      <div className="mt-4 bg-emerald-50 text-emerald-800 text-xs font-black uppercase inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-emerald-100 shadow-3xs">
                        <Check size={12} /> {attachedFileName} (Carregado com Sucesso)
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Agendar atendimento Form */}
              {activeOfficialAction === 'Agendar atendimento' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl text-xs text-slate-650 leading-relaxed font-semibold md:col-span-2">
                     Agende uma sessão presencial ou virtual assistida com o técnico representativo designado pelo órgão correspondente.
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 block">Data Escolhida</label>
                    <input
                      type="date"
                      value={scheduleDate}
                      onChange={(e) => setScheduleDate(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs md:text-sm font-bold text-slate-700 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 block">Modo de Sessão</label>
                    <select
                      value={scheduleMode}
                      onChange={(e) => setScheduleMode(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs md:text-sm font-bold text-slate-700"
                    >
                      <option value="Videoconferência">Videoconferência Segura SEPE</option>
                      <option value="Presencial Assistido">Presencial Físico Assistido</option>
                    </select>
                  </div>

                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 block">Posto Avançado / Balcão</label>
                    <select
                      value={scheduleLocation}
                      onChange={(e) => setScheduleLocation(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs md:text-sm font-bold text-slate-700"
                    >
                      <option value="Posto Central AGT (Luanda)">Posto Central AGT (Luanda)</option>
                      <option value="Balcão Único do Cidadão - Talatona">Balcão Único do Cidadão - Talatona</option>
                      <option value="Gabinete de Atendimento Provincial de Benguela">Gabinete de Atendimento Provincial de Benguela</option>
                      <option value="Atendimento Digital Exclusivo">Atendimento Virtual Presencial (Câmaras SEPE)</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Encaminhar pedido Form */}
              {activeOfficialAction === 'Encaminhar pedido' && (
                <div className="space-y-4">
                  <div className="bg-slate-50 border border-slate-150 p-4 rounded-2xl text-xs text-slate-600 leading-relaxed font-semibold">
                    Despache e delegue a responsabilidade de análise desta correspondência oficial para outra entidade ou representante legal.
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 block">Destinação Governamental</label>
                    <select
                      value={forwardTarget}
                      onChange={(e) => setForwardTarget(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs md:text-sm font-bold text-slate-700"
                    >
                      <option value="Ministério das Finanças">Ministério das Finanças (MINFIN)</option>
                      <option value="Procuradoria Geral da República">Procuradoria Geral da República (PGR)</option>
                      <option value="Gabinete do Governador de Luanda">Gabinete do Governador de Luanda</option>
                      <option value="Direção Geral da AGT">Direção Geral de Auditoria AGT</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 block">Despacho de Encaminhamento</label>
                    <textarea
                      value={forwardJustification}
                      onChange={(e) => setForwardJustification(e.target.value)}
                      placeholder="Redija as notas de justificação e responsabilidade..."
                      rows={4}
                      className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl p-3 text-xs md:text-sm font-semibold focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {/* Form buttons */}
              <div className="flex gap-3 pt-4 border-t border-slate-150">
                <button
                  type="button"
                  onClick={() => setActiveOfficialAction(null)}
                  className="flex-1 py-3 bg-slate-100 font-extrabold text-xs text-slate-700 border border-slate-200 rounded-xl hover:bg-slate-200 active:scale-95 transition-all uppercase"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  disabled={isSubmittingAction || (activeOfficialAction === 'Responder' && !replyText) || (activeOfficialAction === 'Confirmar leitura' && !confirmReadCheckbox) || (activeOfficialAction === 'Assinar documento' && !signaturePin)}
                  onClick={() => handleOfficialActionSubmit(activeOfficialAction)}
                  className="flex-1 py-3 bg-primary font-black text-xs text-white rounded-xl shadow-lg hover:bg-primary/95 active:scale-95 transition-all text-center flex items-center justify-center gap-2 uppercase disabled:opacity-50 disabled:scale-100"
                >
                  {isSubmittingAction ? (
                    <>
                      <div className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                      A PROCESSAR...
                    </>
                  ) : (
                    <>
                      <Send size={13} />
                      Submeter Trâmite
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          ) : successProtocol ? (
            <motion.div
              key="official-action-success"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-6 text-left"
            >
              <div className="flex flex-col items-center text-center p-6 bg-emerald-50 border border-emerald-200 rounded-3xl relative overflow-hidden">
                <div className="w-14 h-14 rounded-full bg-emerald-500 text-white flex items-center justify-center mb-4 shadow-lg shadow-emerald-250 animate-bounce">
                  <Check size={26} strokeWidth={3} />
                </div>
                <h3 className="text-emerald-900 font-black text-sm uppercase tracking-wider leading-none">Trâmite Registado</h3>
                <p className="text-emerald-850 text-[9px] font-black mt-1 uppercase tracking-widest leading-none">Auto-Protocolo Governamental Ativo</p>
                <p className="text-slate-500 text-[10.5px] mt-2 max-w-sm leading-relaxed">
                  A sua ação de <strong>"{successProtocol.actionName}"</strong> foi registada e selada legalmente de forma imutável nos servidores centrais do Estado angolano.
                </p>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4.5 space-y-4">
                <div className="flex justify-between items-center pb-3 border-b border-rose-100">
                  <div>
                    <span className="text-[9.5px] font-black tracking-widest text-slate-450 uppercase font-mono">REGISTO DE PROTOCOLO</span>
                    <div className="text-primary font-black text-sm font-mono tracking-tight mt-0.5">{successProtocol.protocolNumber}</div>
                  </div>
                  <span className="bg-emerald-100 text-emerald-850 text-[8px] font-black px-2 py-0.5 rounded border border-emerald-200 uppercase tracking-wider font-mono">
                    VERIFICADO
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-4 text-xs font-semibold text-slate-700">
                  <div>
                    <span className="text-[10px] font-black text-slate-400 block uppercase mb-0.5">Ação Efetuada</span>
                    <span className="font-extrabold text-slate-800 uppercase text-[10.5px]">{successProtocol.actionName}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-black text-slate-400 block uppercase mb-0.5">Data Registro Oficial</span>
                    <span className="font-extrabold text-slate-800 font-mono text-[10.5px]">{successProtocol.timestamp}</span>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-[10px] font-black text-slate-400 block uppercase mb-0.5">Detalhes da Transação</span>
                    <p className="text-[11px] text-slate-600 font-bold mt-0.5 leading-relaxed bg-white border border-slate-150 p-2.5 rounded-lg font-mono">
                      {successProtocol.details}
                    </p>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-[10px] font-black text-slate-400 block uppercase mb-0.5">Assinatura Digital de Validação (Selo)</span>
                    <div className="bg-slate-900 text-slate-300 p-2 rounded-lg font-mono text-[8.5px] break-all border border-slate-850 truncate leading-none mt-0.5 flex items-center gap-1.5">
                      <Fingerprint size={10} className="text-emerald-400 shrink-0" />
                      {successProtocol.digitalSeal}
                    </div>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-[10px] font-black text-slate-400 block uppercase mb-0.5">Hash SHA-256 de Autoria</span>
                    <span className="font-mono text-[8.5px] text-slate-500 bg-white/70 p-1 rounded border border-slate-150 block break-all leading-none mt-0.5 truncate select-all">{successProtocol.documentHash}</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSuccessProtocol(null)}
                className="w-full py-3.5 bg-primary hover:opacity-90 text-white font-black text-xs uppercase rounded-xl transition-all shadow-lg active:scale-95"
              >
                Concluir e Voltar
              </button>
            </motion.div>
          ) : activeAction ? (
            <motion.div 
              key="action-view"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="flex items-center gap-3 pb-4 border-b border-line">
                <button 
                  onClick={() => setActiveAction(null)}
                  className="flex items-center justify-center w-10 h-10 bg-white border-2 border-[#d1dbe5] rounded-full text-[#384e6e] hover:bg-slate-50 transition-all shadow-md cursor-pointer hover:scale-105 active:scale-95"
                  title="Voltar"
                >
                  <ArrowLeft size={16} className="text-[#384e6e]" />
                </button>
                <div>
                  <h4 className="font-bold text-primary">{activeAction}</h4>
                  <p className="text-sm text-slate-600 uppercase tracking-wider">{selectedMessage.org}</p>
                </div>
              </div>

              {['Ler notificacao', 'Ler boletim', 'Abrir resultado', 'Ler resultado', 'Mais informacoes'].includes(activeAction) ? (
                <div className="space-y-6">
                  <div className="bg-white p-8 md:p-10 rounded-3xl border border-line shadow-sm">
                    <div className="flex items-center gap-3 mb-6 text-[#0c2340]">
                      <FileText size={22} className="text-[#0c2340]" />
                      <span className="font-sans font-extrabold text-[#0c2340] text-base md:text-lg">Conteúdo do Documento</span>
                    </div>
                    {selectedMessage.details?.body && selectedMessage.details.body.trim().length > 0 ? (
                      <div className="space-y-6 text-[#334155] text-sm md:text-[15px] leading-relaxed tracking-wide">
                        {selectedMessage.details.body.split('\n\n').map((paragraph, bgIdx) => {
                          const lines = paragraph.split('\n');
                          return (
                            <p key={bgIdx} className="font-medium text-slate-700">
                              {lines.map((line, lineIdx) => (
                                <React.Fragment key={lineIdx}>
                                  {t(line)}
                                  {lineIdx < lines.length - 1 && <br />}
                                </React.Fragment>
                              ))}
                            </p>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="space-y-6 text-slate-700 text-sm md:text-[15px] leading-relaxed tracking-wide font-sans">
                        <p className="font-medium text-slate-700">
                          {t("Prezado(a) cidadão(ã),")}<br /><br />
                          {t(selectedMessage.preview) || t("Informamos que foi registada uma nova correspondência oficial associada à sua identidade digital no Correio Digital de Angola.")}<br /><br />
                          {t("Os serviços públicos integrados de telecomunicações e tecnologias digitais continuam a reforçar a proximidade dos cidadãos aos órgãos e instituições do Estado angolano com toda a segurança, autenticidade e validade legal garantida por lei.")}<br /><br />
                          {t("Atenciosamente,")}<br />
                          {t("Secretaria do Correio Digital Angola")}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* 13 MANDATORY DIGITAL PROTOCOL FIELDS */}
                  <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 space-y-6">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-rose-100">
                      <div>
                        <h4 className="font-black text-[10px] tracking-widest text-slate-400 uppercase font-mono">
                          REGISTRO DE PROTOCOLO GOVERNAMENTAL
                        </h4>
                        <div className="text-primary font-black text-lg font-mono tracking-tight mt-1">
                          {protocol.protocolNumber}
                        </div>
                      </div>
                      <div className="bg-primary/10 border border-primary/20 px-3 py-1 rounded-full text-primary text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 shrink-0">
                        <Fingerprint size={12} className="animate-pulse" />
                        PROTOCOLO VALIDADE DIGITAL
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-5 gap-x-6 text-left">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">ID Interno</span>
                        <span className="text-xs font-mono font-bold text-slate-700">{protocol.internalId}</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Número de Protocolo</span>
                        <span className="text-xs font-mono font-black text-indigo-700">{protocol.protocolNumber}</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Instituição Emissora</span>
                        <span className="text-xs font-bold text-slate-800">{protocol.issuerInstitution}</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Data Oficial de Emissão</span>
                        <span className="text-xs font-bold text-slate-800">{protocol.officialIssueDate}</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Hora Oficial</span>
                        <span className="text-xs font-mono font-bold text-slate-800">{protocol.officialTime}</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Responsável Emissor</span>
                        <span className="text-xs font-bold text-slate-800">{protocol.issuerResponsible}</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Categoria</span>
                        <span className="text-xs font-bold text-primary">{protocol.category}</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Tipo de Documento</span>
                        <span className="text-xs font-bold text-slate-800">{protocol.documentType}</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Estado Atual</span>
                        <span className="text-xs font-bold text-slate-800">{protocol.currentState}</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Prioridade</span>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-md inline-block ${
                          protocol.priority === 'Alta' ? 'bg-red-100 text-red-800' : 'bg-slate-100 text-slate-800'
                        }`}>{protocol.priority}</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Data Limite</span>
                        <span className="text-xs font-bold text-slate-800">{protocol.deadlineDate}</span>
                      </div>
                      {protocol.archiveReference && (
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Referência de Arquivo</span>
                          <span className="text-xs font-mono font-black text-slate-800">{protocol.archiveReference}</span>
                        </div>
                      )}
                      {protocol.archiveLocation && (
                        <div className="md:col-span-2 lg:col-span-3">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Localização Formal do Arquivo</span>
                          <span className="text-xs font-bold text-slate-800 break-words">{protocol.archiveLocation}</span>
                        </div>
                      )}
                    </div>

                    {/* INFO ADICIONAL DE CONTROLO DE PRAZO & CONSEQUÊNCIA */}
                    <div className="mt-6 p-4 bg-amber-50/50 border border-amber-200/60 rounded-2xl flex flex-col gap-3 text-xs text-slate-700 text-left">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <span className="text-[10px] uppercase font-black tracking-widest text-slate-650 flex items-center gap-1">
                          <AlertTriangle size={13} className="text-amber-600" /> Prioridade & Prazos Oficiais ({prioConfig.priority})
                        </span>
                        {deadlineSecondsLeft !== null && (
                          <span className="font-mono text-[10px] font-black text-rose-650 animate-pulse bg-white border border-rose-100 px-2 py-0.5 rounded-md shadow-3xs uppercase">
                            {formatDeadlineRemaining(deadlineSecondsLeft)}
                          </span>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <span className="text-[9px] font-bold text-slate-400 block uppercase">Consequência Administrativa</span>
                          <p className="text-[11px] leading-relaxed font-semibold italic text-slate-650 mt-0.5">"{prioConfig.consequence}"</p>
                        </div>
                        <div>
                          <span className="text-[9px] font-bold text-slate-400 block uppercase">Notificações por Atraso</span>
                          <div className="space-y-0.5 mt-0.5">
                            {prioConfig.escalationLevels.map((lvl, idx) => (
                              <div key={idx} className="text-[10px] font-medium text-slate-600">• {lvl}</div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* SEÇÃO DOCUMENTO VERIFICADO */}
                    <div className="pt-5 border-t border-slate-200 space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-emerald-500 text-white flex items-center justify-center shadow-md shadow-emerald-200">
                          <ShieldCheck size={18} />
                        </div>
                        <div>
                          <h4 className="text-xs font-black uppercase tracking-[0.05em] text-slate-900 leading-none">Documento Verificado</h4>
                          <p className="text-[10px] text-emerald-800 font-medium mt-0.5">Assinatura Digital Institucional Completa</p>
                        </div>
                        <span className="ml-auto bg-emerald-500 text-white font-mono text-[8px] font-black px-2 py-0.5 rounded uppercase leading-none tracking-wider font-bold">
                          AUTÊNTICO & INTEGRAL
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-medium bg-emerald-50/40 p-4 border border-emerald-100/80 rounded-2xl">
                        <div>
                          <span className="text-slate-400 text-[9px] font-black uppercase block tracking-wider mb-0.5">Selo Digital Institucional</span>
                          <span className="font-mono text-slate-800 break-all">{protocol.digitalSeal}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 text-[9px] font-black uppercase block tracking-wider mb-0.5">Certificado Digital Emissor</span>
                          <span className="text-slate-850 font-bold">{protocol.institutionalCertificate}</span>
                        </div>
                        <div className="md:col-span-2">
                          <span className="text-slate-400 text-[9px] font-black uppercase block tracking-wider mb-0.5">Hash de Integridade do Documento</span>
                          <span className="font-mono text-[10px] text-slate-700 bg-white/80 p-1.5 border border-emerald-100/50 rounded block break-all">{protocol.documentHash}</span>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-5 items-center justify-between bg-white p-4 border border-slate-200 rounded-2xl">
                        <div className="flex-1 min-w-0 space-y-1.5 text-left">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Assinatura Criptográfica Emissora</span>
                          <div className="bg-slate-900 text-slate-350 p-2.5 rounded-xl text-[10px] font-mono break-all border border-slate-850 flex items-center gap-2">
                            <Fingerprint size={14} className="text-emerald-400 shrink-0" />
                            <span className="text-slate-400">{protocol.digitalSignature}</span>
                          </div>
                        </div>
                        <div 
                          onClick={triggerVerification}
                          className="flex flex-col items-center shrink-0 border border-slate-200 bg-emerald-50/20 p-2 text-center rounded-xl shadow-sm cursor-pointer hover:bg-emerald-50/50 hover:border-emerald-300 active:scale-95 transition-all group"
                        >
                          <img 
                            src={protocol.qrCodeUrl} 
                            alt="QR Protocolo"
                            className="w-16 h-16 object-contain transition-transform group-hover:scale-105"
                            referrerPolicy="no-referrer"
                          />
                          <span className="text-[7.5px] font-mono text-emerald-700 uppercase mt-1.5 tracking-wider font-black flex items-center gap-1 leading-none">
                            <QrCode size={8} /> VALIDAR QR
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* VIDEOATENDIMENTO OFICIAL COMPLEMENTAR */}
                  <VideoSessionPanel message={selectedMessage} />

                  {/* AUTOMATIC TIMELINE OF CORRESPONDENCE EVENTS */}
                  <div className="bg-white p-6 rounded-3xl border border-slate-200 space-y-5">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                      <div className="flex items-center gap-2.5 text-left">
                        <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-750">
                          <History size={16} />
                        </div>
                        <div>
                          <h4 className="font-extrabold text-sm text-slate-900 leading-snug">Cronologia & Estado da Correspondência</h4>
                          <p className="text-[10px] text-slate-400 font-bold leading-normal">Linha de vida governamental qualificada pelo protocolo</p>
                        </div>
                      </div>
                      <span className="bg-indigo-55 border border-indigo-110 px-2.5 py-0.5 rounded-full text-indigo-700 font-mono text-[9px] font-black">
                        {(selectedMessage.stateHistory || generateTimelineEvents(selectedMessage, protocol)).length} Estados
                      </span>
                    </div>

                    <div className="pl-1 pt-2 relative">
                      {/* Vertical line connecting all points */}
                      <div className="absolute left-[17px] top-6 bottom-6 w-0.5 border-l-2 border-dashed border-slate-200" />

                      <div className="space-y-6">
                        {(selectedMessage.stateHistory || generateTimelineEvents(selectedMessage, protocol)).map((evt, idx) => {
                          const config = STATE_STYLING[evt.state] || {
                            bg: 'bg-slate-50',
                            text: 'text-slate-800',
                            border: 'border-slate-200',
                            bgDot: 'bg-slate-150',
                            textIcon: 'text-slate-500'
                          };

                          return (
                            <div key={idx} className="relative pl-10 flex flex-col items-start text-left group">
                              {/* Left icon bubble */}
                              <div className={`absolute left-0 top-0 w-8 h-8 rounded-full border-2 border-white ${config.bgDot} flex items-center justify-center ${config.textIcon} shadow-sm z-10 transition-transform duration-300 group-hover:scale-110`}>
                                {renderStateIcon(evt.state, 13)}
                              </div>

                              <div className="flex flex-wrap items-center gap-2">
                                {/* State chip */}
                                <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold border leading-none tracking-tight uppercase ${config.bg} ${config.text} ${config.border}`}>
                                  {evt.state}
                                </span>

                                {/* Timestamp */}
                                <span className="text-[9px] font-mono font-bold text-slate-400">
                                  {evt.date} às {evt.time}
                                </span>
                              </div>

                              {/* Responsible */}
                              <div className="mt-1 flex items-center gap-1.5 text-slate-600">
                                <UserCheck size={11} className="text-slate-450 shrink-0" />
                                <span className="text-[10px] font-bold text-slate-700 leading-none">
                                  {evt.responsible}
                                </span>
                              </div>

                              {/* Description */}
                              <p className="text-[11px] text-slate-500 font-medium mt-1 leading-relaxed max-w-xl">
                                {evt.description}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* COMPLETENESS AUDIT TRAIL LOGS */}
                  <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200 space-y-4">
                    <div className="flex items-center gap-2.5 pb-2 border-b border-slate-200 text-left">
                      <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center">
                        <History size={16} className="text-emerald-400" />
                      </div>
                      <div>
                        <h4 className="font-extrabold text-sm text-slate-900 leading-snug">Registo Geral de Auditoria Governamental</h4>
                        <p className="text-[10px] text-slate-400 font-bold leading-normal">Histórico cronológico detalhado por ações operacionais</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2 text-left bg-white p-4 border border-slate-150 rounded-2xl font-mono text-xs text-slate-700 shadow-sm max-h-48 overflow-y-auto">
                      {(selectedMessage.auditLogs || []).map((log, lIdx) => (
                        <div key={lIdx} className="flex items-start gap-2 py-1 border-b border-dashed border-slate-100 last:border-0 leading-relaxed">
                          <span className="text-emerald-650 font-black">▶</span>
                          <span>{log}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-5 bg-primary/5 rounded-2xl border border-primary/10 flex items-start gap-4">
                    <ShieldCheck size={24} className="text-primary shrink-0 mt-0.5" />
                    <div>
                      <p className="text-base font-bold text-primary mb-1">Documento Autenticado</p>
                      <p className="text-sm text-primary/70 leading-tight">
                        Este conteúdo foi extraído diretamente da base oficial do Estado Angolano e possui plena validade jurídica como prova digital.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-slate-50 p-5 rounded-2xl border border-line">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Info size={20} className="text-primary" />
                      </div>
                      <div className="font-bold text-primary">Processando Solicitação</div>
                    </div>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      A funcionalidade <strong>"{activeAction}"</strong> está a carregar os dados seguros da base governamental. 
                      Este processo garante que toda a informação apresentada é oficial e verificada em tempo real.
                    </p>
                  </div>

                  <div className="grid gap-3">
                    <div className="p-4 border border-line rounded-xl flex items-center justify-between">
                      <div className="text-sm font-semibold text-slate-700">Estado do Pedido</div>
                      <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-green-50 text-green-700 border border-green-100">Verificado</span>
                    </div>
                    <div className="p-4 border border-line rounded-xl flex items-center justify-between">
                      <div className="text-sm font-semibold text-slate-700">Autenticação Digital</div>
                      <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-100">Encriptado</span>
                    </div>
                  </div>
                </div>
              )}

              <button 
                onClick={() => setActiveAction(null)}
                className="w-full bg-primary text-white py-3 rounded-xl font-bold shadow-md hover:opacity-90 transition-all flex items-center justify-center gap-2"
              >
                {['Ver detalhes', 'Ler notificacao', 'Ler boletim', 'Abrir resultado', 'Ler resultado', 'Mais informacoes'].includes(activeAction) ? 'Fechar Leitura' : 'OK, Entendi'}
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="detail-view"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <div className="pb-4 border-b border-line mb-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm md:text-lg font-bold text-primary uppercase tracking-tight">{selectedMessage.org}</h3>
                  <div className="text-slate-600 text-[10px] md:text-xs font-semibold uppercase tracking-wider mt-0.5">
                    Canal oficial de correspondência verificado
                  </div>
                </div>
                
                {/* Metadados obrigatórios do correio: Data, Hora e Localidade */}
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-slate-705 bg-white border border-slate-300 rounded-[18px] p-2.5 px-4 shadow-3xs">
                  <div className="flex items-center gap-2 min-w-0">
                    <Calendar size={13} className="text-indigo-650 shrink-0" />
                    <div>
                      <span className="text-[8px] font-black text-slate-400 block uppercase tracking-wider font-display leading-none">Data</span>
                      <span className="text-xs font-bold text-slate-800 font-mono mt-0.5 block leading-none">{messageDate}</span>
                    </div>
                  </div>
                  <div className="w-[1px] h-5 bg-slate-200 hidden sm:block" />
                  <div className="flex items-center gap-2 min-w-0">
                    <Clock size={13} className="text-indigo-650 shrink-0" />
                    <div>
                      <span className="text-[8px] font-black text-slate-400 block uppercase tracking-wider font-display leading-none">Hora</span>
                      <span className="text-xs font-bold text-slate-800 font-mono mt-0.5 block leading-none">{messageTime}</span>
                    </div>
                  </div>
                  <div className="w-[1px] h-5 bg-slate-200 hidden sm:block" />
                  <div className="flex items-center gap-2 min-w-0">
                    <MapPin size={13} className="text-indigo-650 shrink-0" />
                    <div>
                      <span className="text-[8px] font-black text-slate-400 block uppercase tracking-wider font-display leading-none">Localidade</span>
                      <span className="text-xs font-bold text-slate-850 mt-0.5 block md:max-w-md leading-relaxed">{messageLocality}</span>
                    </div>
                  </div>
                </div>
              </div>
              <p className="text-slate-700 mb-6 leading-relaxed font-medium text-[11px] md:text-base">{t(selectedMessage.preview)}</p>
              
              {selectedMessage.details && (
                <div className="space-y-6">
                  <div className="bg-white rounded-3xl border border-line p-5 md:p-8 shadow-sm flex flex-col lg:flex-row gap-8 items-stretch text-left">
                    {/* Informações do Protocolo (Lado Esquerdo) */}
                    <div className="flex-1 flex flex-col justify-between items-start">
                      <div className="w-full">
                        <div className="flex items-center gap-4 mb-6">
                          <div className={`w-14 h-14 rounded-full flex items-center justify-center shrink-0 shadow-lg transition-transform hover:scale-105 ${
                            (selectedMessage.details.state?.toLowerCase().includes('pendente') ?? false) 
                            ? 'bg-orange-500 shadow-orange-100' 
                            : 'bg-green-500 shadow-green-100'
                          }`}>
                            {(selectedMessage.details.state?.toLowerCase().includes('pendente') ?? false) ? (
                              <Clock className="text-white w-7 h-7" />
                            ) : (
                              <Check className="text-white w-7 h-7" strokeWidth={3} />
                            )}
                          </div>
                          <div>
                            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest leading-none mb-1">{t("Guia de Benefícios")}</h3>
                            <h2 className="text-base md:text-2xl font-extrabold text-primary leading-tight">
                              {t(selectedMessage.details.subject)}
                            </h2>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5 w-full">
                          <div className="flex items-center gap-3 text-slate-700">
                            <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 border border-slate-200">
                              <Fingerprint size={16} className="text-indigo-600" />
                            </div>
                            <div>
                              <small className="text-indigo-600 text-[9px] md:text-xs font-black uppercase tracking-[0.15em] block leading-none mb-1">Nº Protocolo Nacional</small>
                              <div className="text-xs md:text-sm font-mono font-black text-indigo-700 truncate">{protocol.protocolNumber}</div>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 text-slate-700">
                            <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center shrink-0 border border-blue-600">
                              <Calendar size={16} className="text-white" />
                            </div>
                            <div>
                              <small className="text-slate-500 text-[9px] md:text-xs font-black uppercase tracking-[0.15em] block leading-none mb-1">Data de Emissão (Data)</small>
                              <div className="text-xs md:text-sm font-bold text-primary">{messageDate}</div>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 text-slate-700">
                            <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center shrink-0 border border-blue-600">
                              <Clock size={16} className="text-white" />
                            </div>
                            <div>
                              <small className="text-slate-500 text-[9px] md:text-xs font-black uppercase tracking-[0.15em] block leading-none mb-1">Hora de Registo (Hora)</small>
                              <div className="text-xs md:text-sm font-bold text-primary">{messageTime}</div>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 text-slate-700">
                            <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center shrink-0 border border-blue-600">
                              <MapPin size={16} className="text-white" />
                            </div>
                            <div>
                              <small className="text-slate-500 text-[9px] md:text-xs font-black uppercase tracking-[0.15em] block leading-none mb-1">{t("Localidade de Tramitação")}</small>
                              <div className="text-xs md:text-sm font-bold text-primary">{t(messageLocality)}</div>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 text-slate-700">
                            <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center shrink-0 border border-blue-600">
                              <Calendar size={16} className="text-white" />
                            </div>
                            <div>
                              <small className="text-slate-500 text-[9px] md:text-xs font-black uppercase tracking-[0.15em] block leading-none mb-1">{t("Prazo Limite Regulamentar")}</small>
                              <div className="text-xs md:text-sm font-bold text-primary">{t(selectedMessage.details.deadline || '')}</div>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 text-slate-700">
                            <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center shrink-0 border border-blue-600">
                              <Clock size={16} className="text-white" />
                            </div>
                            <div>
                              <small className="text-slate-500 text-[9px] md:text-xs font-black uppercase tracking-[0.15em] block leading-none mb-1">{t("Estado do Documento")}</small>
                              <div className="text-xs md:text-sm font-bold text-orange-700 flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-pulse" />
                                {t(selectedMessage.details.state || '')}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 text-slate-700">
                            <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center shrink-0 border border-blue-600">
                              <MapPin size={16} className="text-white" />
                            </div>
                            <div>
                              <small className="text-slate-500 text-[9px] md:text-xs font-black uppercase tracking-[0.15em] block leading-none mb-1">{t("Entidade Emissora")}</small>
                              <div className="text-xs md:text-sm font-bold text-primary leading-tight">{t(selectedMessage.org)}</div>
                            </div>
                          </div>

                          {/* Tipo de Correspondência Oficial */}
                          {(() => {
                            const meta = getCategoryMetadata(protocol.category);
                            const style = CATEGORY_STYLING[meta.name] || CATEGORY_STYLING['Ofício'];
                            return (
                              <div className="flex items-start gap-4 text-slate-700 md:col-span-2">
                                <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border bg-blue-600 border-blue-600 text-white">
                                  {renderCategoryIcon(meta.icon, 16)}
                                </div>
                                <div>
                                  <small className="text-slate-505 text-[9px] md:text-xs font-black uppercase tracking-[0.15em] block leading-none mb-1">Tipo de Correspondência</small>
                                  <div className="flex flex-wrap items-center gap-2 mt-0.5">
                                    <span className={`text-xs md:text-sm font-bold leading-none ${style.text}`}>{meta.name}</span>
                                    <span className="bg-red-50 px-1.5 py-0.5 rounded text-[8px] font-bold text-red-650 tracking-wider font-mono uppercase">Prioridade: {meta.priority}</span>
                                  </div>
                                </div>
                              </div>
                            );
                          })()}
                        </div>
                      </div>

                      {/* Botão de Ver detalhes Completos */}
                      <div className="w-full pt-6 border-t border-slate-150 flex justify-start mt-6">
                        <button
                          type="button"
                          onClick={() => {
                            setActiveAction('Ver detalhes');
                            addAuditLogToMessage('Visualizou detalhes completos do documento');
                          }}
                          className="text-xs font-black uppercase tracking-wider text-white bg-blue-950 hover:bg-blue-900 px-5 py-3 rounded-full shadow-md flex items-center gap-2 transition-all cursor-pointer hover:scale-[1.02] active:scale-95 font-bold"
                        >
                          <Eye size={13} className="text-white" />
                          Ver detalhes Completos
                        </button>
                      </div>
                    </div>

                    {/* QR Code de Protocolo (Lado Direito) */}
                    <div className="flex flex-col items-center justify-center p-6 bg-white rounded-3xl border border-line/60 lg:w-[280px] shrink-0 self-center lg:self-stretch">
                      <div className="text-[10px] font-extrabold text-slate-500 uppercase tracking-[0.2em] mb-4">QR CODE DE PROTOCOLO</div>
                      <div 
                        onClick={triggerVerification}
                        className="p-3 bg-white border border-line/40 rounded-2xl shadow-md group relative overflow-hidden text-center w-full cursor-pointer hover:border-emerald-350 hover:bg-emerald-50/10 transition-all active:scale-95 flex flex-col items-center justify-center"
                      >
                        <motion.img 
                          src={protocol.qrCodeUrl} 
                          alt="QR Code Seguro" 
                          className="w-32 h-32 md:w-36 md:h-36 object-contain transition-transform duration-500 group-hover:scale-105 mx-auto"
                          referrerPolicy="no-referrer"
                        />
                        <div className="text-[9px] font-mono text-indigo-700 font-extrabold uppercase mt-3 tracking-widest break-all">
                          {protocol.protocolNumber}
                        </div>
                        <span className="text-[8px] font-mono text-emerald-700 uppercase mt-2 tracking-wider font-extrabold flex items-center gap-1 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded">
                          <QrCode size={9} /> CLIQUE PARA VALIDAR
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* WATERMARK SECURE OVERLAY */}
        {sensConfig.screenshotProtection && (
          <div className="absolute inset-0 pointer-events-none opacity-[0.03] select-none grid grid-cols-2 sm:grid-cols-3 gap-8 p-4 overflow-hidden z-25" style={{ transform: 'rotate(-12deg) scale(1.15)' }}>
            {Array.from({ length: 18 }).map((_, i) => (
              <div key={i} className="font-mono text-[9px] font-black uppercase text-slate-900 whitespace-nowrap text-center tracking-widest leading-none">
                009874562LA041<br/>
                GOV_CORREIO_COPIAPROIBIDA<br/>
                {sensConfig.level} LEVEL
              </div>
            ))}
          </div>
        )}

        {/* SCREENSHOT BLUR Defocus Guard */}
        {!isWindowFocused && sensConfig.screenshotProtection && (
          <div className="absolute inset-0 bg-slate-200/90 backdrop-blur-lg z-40 flex flex-col items-center justify-center p-6 text-center select-none pointer-events-auto transition-all duration-300">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center mb-3 shadow-md">
              <EyeOff size={22} className="text-red-500" />
            </div>
            <h3 className="text-slate-900 font-mono font-black text-sm uppercase tracking-wider">Visualização Suspensa</h3>
            <p className="text-slate-500 text-xs mt-1 max-w-xs leading-relaxed">Proteção ativa contra captura de ecrã para documentos {sensConfig.level}. Volte a focar a janela para continuar.</p>
          </div>
        )}

        {/* EXPIRATION SESSION LOCK OVERLAY */}
        {isSessionExpired && (
          <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-md z-50 flex flex-col items-center justify-center p-6 text-center select-none pointer-events-auto">
            <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 text-red-500 flex items-center justify-center mb-4 animate-bounce">
              <Lock size={32} />
            </div>
            <h3 className="text-white font-mono font-black text-base uppercase tracking-wider">Sessão Documental Expirada</h3>
            <p className="text-slate-400 text-xs max-w-sm mt-2 leading-relaxed">
              Este documento possui sensibilidade <span className="text-red-400 font-extrabold">{sensConfig.level}</span>. Por segurança regulamentar, a sessão ativa fechou após {sensConfig.sessionTimeout}.
            </p>
            
            <button 
              onClick={handleReauthenticate}
              disabled={isReauthenticating}
              className="mt-6 font-mono font-black text-xs uppercase bg-red-600 hover:bg-red-500 text-white rounded-xl py-3 px-6 active:scale-95 transition-all shadow-lg flex items-center gap-2"
            >
              {isReauthenticating ? (
                <>
                  <div className="w-4.5 h-4.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  A REAUTENTICAR COM BI...
                </>
              ) : (
                <>
                  <UserCheck size={14} />
                  REAUTENTICAR COM BI DIGITAL
                </>
              )}
            </button>
          </div>
        )}
      </section>

      {/* MODAL DE VALIDAÇÃO DE QR CODE */}
      <AnimatePresence>
        {showQRValidation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
            onClick={() => setShowQRValidation(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 15, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 15, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className="bg-white rounded-3xl border border-slate-150 shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden text-left"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="bg-slate-900 p-6 text-white flex justify-between items-center shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                    <QrCode size={18} className="text-white" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-xs uppercase tracking-wider">Verificador de Autenticidade</h3>
                    <p className="text-[9px] text-slate-400 font-mono tracking-tight">{protocol.protocolNumber}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowQRValidation(false)}
                  className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/25 transition-all text-white/80 text-xs font-bold font-mono"
                >
                  ✕
                </button>
              </div>

              {/* Body */}
              <div className="p-6 space-y-6 overflow-y-auto flex-1 min-h-0">
                {isValidating ? (
                  <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
                    <div className="w-10 h-10 rounded-full border-4 border-slate-200 border-t-emerald-500 animate-spin" />
                    <div>
                      <h4 className="font-extrabold text-slate-800 text-sm">Consultando Infraestrutura de Chaves Públicas</h4>
                      <p className="text-xs text-slate-400 mt-1 font-medium">Validando carimbo de tempo & certificado da entidade emissora...</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-5">
                    {/* Status badge and description */}
                    <div className="bg-emerald-50 border border-emerald-150 p-4 rounded-2xl flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-md">
                        <Check size={16} strokeWidth={3} />
                      </div>
                      <div>
                        <span className="bg-emerald-600 text-white text-[8px] font-black tracking-widest px-1.5 py-0.5 rounded uppercase leading-none inline-block">
                          ASSINATURA CÔNJUGE VALIDADE
                        </span>
                        <h4 className="font-black text-slate-900 text-xs mt-1 leading-snug">Autenticidade e Integridade Confirmadas</h4>
                        <p className="text-[11px] text-slate-600 font-medium leading-relaxed mt-1">
                          Este documento foi assinado digitalmente por um certificado de assinatura qualificada associado ao cargo oficial da República de Angola e não sofreu modificações desde a sua emissão.
                        </p>
                      </div>
                    </div>

                    {/* Verification Details List */}
                    <div className="space-y-3.5 divide-y divide-slate-100">
                      <div className="pt-0 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <span className="text-slate-400 font-extrabold text-[10px] uppercase tracking-wider">Emissor Autorizado</span>
                        <span className="text-slate-850 text-xs font-black text-right">
                          {protocol.issuerInstitution}
                        </span>
                      </div>

                      <div className="pt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <span className="text-slate-400 font-extrabold text-[10px] uppercase tracking-wider">Responsável Técnico</span>
                        <span className="text-slate-700 text-xs font-bold text-right">
                          {protocol.issuerResponsible}
                        </span>
                      </div>

                      <div className="pt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <span className="text-slate-400 font-extrabold text-[10px] uppercase tracking-wider">Data de Assinatura</span>
                        <span className="text-slate-850 font-mono text-xs font-bold text-right">
                          {protocol.signatureDate}
                        </span>
                      </div>

                      <div className="pt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <span className="text-slate-400 font-extrabold text-[10px] uppercase tracking-wider">Selo Digital Institucional</span>
                        <span className="text-slate-850 font-mono text-xs font-bold text-right">
                          {protocol.digitalSeal}
                        </span>
                      </div>

                      <div className="pt-3">
                        <span className="text-slate-400 font-extrabold text-[10px] uppercase tracking-wider block mb-1">Hash Criptográfico (SHA-256)</span>
                        <span className="text-slate-700 font-mono text-[10px] break-all block leading-relaxed bg-slate-50 p-2 border border-slate-100 rounded-lg">
                          {protocol.documentHash}
                        </span>
                      </div>

                      <div className="pt-3">
                        <span className="text-slate-400 font-extrabold text-[10px] uppercase tracking-wider block mb-1">Certificado Qualificado</span>
                        <span className="text-slate-700 font-mono text-[10px] break-all block leading-relaxed bg-slate-50 p-2 border border-slate-100 rounded-lg">
                          {protocol.institutionalCertificate}
                        </span>
                      </div>

                      <div className="pt-3">
                        <span className="text-slate-400 font-extrabold text-[10px] uppercase tracking-wider block mb-1.5">Validade Jurídica Regulamentar</span>
                        <p className="text-slate-655 text-[11px] font-medium leading-relaxed bg-indigo-50/40 p-2.5 border border-indigo-100/50 rounded-lg text-left">
                          {protocol.legalValidity}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="bg-slate-50 border-t border-slate-100 p-5 flex justify-end">
                <button
                  onClick={() => setShowQRValidation(false)}
                  className="bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs px-5 py-2.5 rounded-xl active:scale-95 transition-all shadow-md"
                >
                  Fechar Validação
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
