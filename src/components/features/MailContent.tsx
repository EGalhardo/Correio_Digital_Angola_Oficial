/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, 
  Send, 
  ShieldCheck, 
  Mail, 
  Plus, 
  Clock, 
  Search, 
  Fingerprint,
  Bell,
  Scroll,
  ShieldAlert,
  Receipt,
  Megaphone,
  FolderOpen,
  Landmark,
  CheckSquare,
  Key,
  Award,
  User,
  Coins,
  Scale,
  FileText,
  Lock,
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
  Quote,
  Eraser,
  Trash2,
  Paperclip
} from 'lucide-react';
import { Message, SENSITIVITY_LEVELS, PRIORITY_CONFIGS, LanguageCode } from '../../types';
import { getCategoryMetadata } from '../../utils/protocolGenerator';
import { translateText } from '../../utils/translator';
import { useLanguage } from '../../hooks/useLanguage';
import { VideoSessionPanel } from './VideoSessionPanel';

const getOrgBadgeStyles = (org: string) => {
  const o = org.toUpperCase();
  if (o.includes('SOC') || o.includes('EMERGÊNCIA')) {
    return 'bg-red-50 text-red-700 border-red-200';
  } else if (o === 'AGT' || o.includes('FINANÇAS') || o.includes('MINFIN') || o.includes('CONTRIBUINTE')) {
    return 'bg-amber-50 text-amber-800 border-amber-200';
  } else if (o === 'SME' || o.includes('MIGRAÇÃO') || o.includes('ESTRANGEIROS')) {
    return 'bg-blue-50 text-blue-800 border-blue-200';
  } else if (o === 'MINJUS' || o.includes('JUSTIÇA') || o.includes('REGISTO') || o.includes('CONSERVATÓRIA')) {
    return 'bg-teal-50 text-teal-800 border-teal-200';
  } else if (o.includes('TRIBUNAL') || o.includes('SUPREMO') || o.includes('COMARCA')) {
    return 'bg-fuchsia-50 text-fuchsia-800 border-fuchsia-200';
  } else if (o === 'ENDE' || o.includes('ELETRICIDADE') || o.includes('FORÇA')) {
    return 'bg-orange-50 text-orange-850 border-orange-200';
  } else if (o === 'EPAL' || o.includes('ÁGUA')) {
    return 'bg-sky-50 text-sky-850 border-sky-200';
  }
  return 'bg-slate-50 text-slate-700 border-slate-200';
};

function renderCategoryIcon(iconName: string, size = 10) {
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

interface MailContentProps {
  isComposing: boolean;
  setIsComposing: (composing: boolean) => void;
  composeData: { to: string; subject: string; body: string; attachments?: string[] };
  setComposeData: (data: { to: string; subject: string; body: string; attachments?: string[] }) => void;
  handleSendMessage: () => void;
  unreadTotal: number;
  correspondenciaTab: string;
  setCorrespondenciaTab: (tab: string) => void;
  inbox: Message[];
  sentMessages: Message[];
  searchMail: string;
  setSearchMail: (search: string) => void;
  filteredMessages: Message[];
  handleSelectMessage: (msg: Message) => void;
  setTab: (tab: string) => void;
  bi: string;
  isInst?: boolean;
  onDeleteMessage?: (id: number) => void;
  onRestoreMessage?: (id: number) => void;
  deletedMessageIds?: number[];
  currentLanguage?: LanguageCode;
}

export function MailContent({
  isComposing,
  setIsComposing,
  composeData,
  setComposeData,
  handleSendMessage,
  unreadTotal,
  correspondenciaTab,
  setCorrespondenciaTab,
  inbox,
  sentMessages,
  searchMail,
  setSearchMail,
  filteredMessages,
  handleSelectMessage,
  setTab,
  bi,
  isInst,
  onDeleteMessage,
  onRestoreMessage,
  deletedMessageIds = [],
  currentLanguage: propLanguage = 'pt'
}: MailContentProps) {
  const { currentLanguage, t } = useLanguage();
  const [showVideoPage, setShowVideoPage] = useState(false);
  const [editorBold, setEditorBold] = useState(false);
  const [editorItalic, setEditorItalic] = useState(false);
  const [editorUnderline, setEditorUnderline] = useState(false);
  const [editorFont, setEditorFont] = useState('sans-serif');
  const [editorFontSize, setEditorFontSize] = useState('base');
  const [editorAlignment, setEditorAlignment] = useState('left');
  const [editorColor, setEditorColor] = useState('#1e293b');
  const [editorIsQuote, setEditorIsQuote] = useState(false);
  const [editorListType, setEditorListType] = useState<string | null>(null);

  const [textHistory, setTextHistory] = useState<string[]>([composeData.body || '']);
  const [historyIndex, setHistoryIndex] = useState(0);

  const [provincia, setProvincia] = useState('Luanda');
  const [cidade, setCidade] = useState('Luanda');
  const [municipio, setMunicipio] = useState('Benfica');

  const PROVINCIAS_OPCOES = [
    { value: 'Luanda', label: 'Luanda' },
    { value: 'Benguela', label: 'Benguela' },
    { value: 'Huíla', label: 'Huíla' },
    { value: 'Cabinda', label: 'Cabinda' },
  ];

  const CIDADES_OPCOES: Record<string, { value: string; label: string }[]> = {
    Luanda: [
      { value: 'Luanda', label: 'Luanda' },
      { value: 'Talatona', label: 'Talatona' },
      { value: 'Cacuaco', label: 'Cacuaco' },
      { value: 'Viana', label: 'Viana' }
    ],
    Benguela: [
      { value: 'Benguela', label: 'Benguela' },
      { value: 'Lobito', label: 'Lobito' },
      { value: 'Catumbela', label: 'Catumbela' }
    ],
    Huíla: [
      { value: 'Lubango', label: 'Lubango' },
      { value: 'Humpata', label: 'Humpata' },
      { value: 'Chibia', label: 'Chibia' }
    ],
    Cabinda: [
      { value: 'Cabinda', label: 'Cabinda' },
      { value: 'Cacongo', label: 'Cacongo' }
    ]
  };

  const MUNICIPIOS_OPCOES: Record<string, { value: string; label: string }[]> = {
    Luanda: [
      { value: 'Benfica', label: 'Benfica' },
      { value: 'Belas', label: 'Belas' },
      { value: 'Sambizanga', label: 'Sambizanga' },
      { value: 'Cazenga', label: 'Cazenga' }
    ],
    Talatona: [
      { value: 'Talatona Centro', label: 'Talatona Centro' },
      { value: 'Camama', label: 'Camama' }
    ],
    Cacuaco: [
      { value: 'Cacuaco Sede', label: 'Cacuaco Sede' },
      { value: 'Kicolo', label: 'Kicolo' }
    ],
    Viana: [
      { value: 'Viana Sede', label: 'Viana Sede' },
      { value: 'Estalagem', label: 'Estalagem' }
    ],
    Benguela: [
      { value: 'Benguela Sede', label: 'Benguela Sede' },
      { value: 'Baía Farta', label: 'Baía Farta' }
    ],
    Lobito: [
      { value: 'Lobito Sede', label: 'Lobito Sede' },
      { value: 'Canata', label: 'Canata' }
    ],
    Catumbela: [
      { value: 'Catumbela Sede', label: 'Catumbela Sede' }
    ],
    Lubango: [
      { value: 'Lubango Sede', label: 'Lubango Sede' },
      { value: 'Arriba', label: 'Arriba' }
    ],
    Humpata: [
      { value: 'Humpata Sede', label: 'Humpata Sede' }
    ],
    Chibia: [
      { value: 'Chibia Sede', label: 'Chibia Sede' }
    ],
    Cabinda: [
      { value: 'Cabinda Sede', label: 'Cabinda Sede' },
      { value: 'Landana', label: 'Landana' }
    ],
    Cacongo: [
      { value: 'Cacongo Sede', label: 'Cacongo Sede' }
    ]
  };

  useEffect(() => {
    if (isComposing) {
      setTextHistory([composeData.body || '']);
      setHistoryIndex(0);
    }
  }, [isComposing]);

  const updateBodyText = (newText: string) => {
    setComposeData({ ...composeData, body: newText });
    const nextHistory = textHistory.slice(0, historyIndex + 1);
    setTextHistory([...nextHistory, newText]);
    setHistoryIndex(nextHistory.length);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const prevIdx = historyIndex - 1;
      setHistoryIndex(prevIdx);
      setComposeData({ ...composeData, body: textHistory[prevIdx] });
    }
  };

  const handleRedo = () => {
    if (historyIndex < textHistory.length - 1) {
      const nextIdx = historyIndex + 1;
      setHistoryIndex(nextIdx);
      setComposeData({ ...composeData, body: textHistory[nextIdx] });
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

  const handleFileAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const currentList = composeData.attachments || [];
      const newFiles: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (!currentList.includes(file.name)) {
          newFiles.push(file.name);
        }
      }
      setComposeData({
        ...composeData,
        attachments: [...currentList, ...newFiles]
      });
    }
  };

  const handleFileRemove = (name: string) => {
    const currentList = composeData.attachments || [];
    setComposeData({
      ...composeData,
      attachments: currentList.filter(f => f !== name)
    });
  };

  if (isComposing) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div className="flex items-center gap-4 mb-2">
          <button 
            onClick={() => setIsComposing(false)}
            className="flex items-center justify-center w-10 h-10 bg-white border-2 border-[#d1dbe5] rounded-full text-[#384e6e] hover:bg-slate-50 transition-all shadow-md cursor-pointer hover:scale-105 active:scale-95 shrink-0"
            aria-label="Voltar"
            title="Voltar ao Correio"
          >
            <ArrowLeft size={16} className="text-[#384e6e]" />
          </button>
          <div>
            <h3 className="text-base md:text-xl font-black text-primary leading-none">Nova Mensagem</h3>
            <p className="text-[9px] md:text-[10px] text-slate-700 font-black uppercase tracking-widest mt-1">Comunicação Oficial Directa</p>
          </div>
        </div>

        <div className="bg-white border border-line rounded-[24px] md:rounded-[32px] p-5 md:p-10 shadow-sm space-y-5 md:space-y-6">
          {isInst ? (
            <div className="grid grid-cols-1 gap-5 md:gap-6">
              <div className="space-y-2">
                <label className="text-[10px] md:text-sm font-black text-slate-600 uppercase tracking-widest pl-1">
                  Destinatário
                </label>
                <div className="relative">
                  <input 
                    type="text"
                    placeholder="Introduza o N-BI"
                    value={composeData.to}
                    onChange={(e) => setComposeData({ ...composeData, to: e.target.value })}
                    className="w-full bg-white border border-line rounded-2xl px-5 py-3.5 md:py-4 text-xs md:text-sm font-mono font-bold text-primary focus:ring-4 focus:ring-primary/5 transition-all outline-none"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] md:text-sm font-black text-slate-600 uppercase tracking-widest pl-1">Assunto</label>
                <input 
                  type="text"
                  placeholder="Qual o tema da sua mensagem?"
                  value={composeData.subject}
                  onChange={(e) => setComposeData({ ...composeData, subject: e.target.value })}
                  className="w-full bg-white border border-line rounded-2xl px-5 py-3.5 md:py-4 text-xs md:text-sm font-bold text-primary focus:ring-4 focus:ring-primary/5 transition-all outline-none"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-5 md:space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-5 md:gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] md:text-sm font-black text-slate-600 uppercase tracking-widest pl-1">
                    Destinatário Institucional
                  </label>
                  <div className="relative">
                    <select 
                      value={composeData.to}
                      onChange={(e) => setComposeData({ ...composeData, to: e.target.value })}
                      className="w-full bg-white border border-line rounded-2xl px-5 py-3.5 md:py-4 text-xs md:text-sm font-bold text-primary focus:ring-4 focus:ring-primary/5 transition-all outline-none appearance-none cursor-pointer"
                    >
                      <option value="">Selecione uma instituição...</option>
                      {["SME", "AGT", "ENDE", "EPAL", "Tribunal", "Hospital", "Registo Civil", "INE"].map(org => (
                        <option key={org} value={org}>{org}</option>
                      ))}
                    </select>
                    <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                      <ArrowLeft className="-rotate-90" size={14} />
                    </div>
                  </div>
                </div>
 
                <div className="space-y-2">
                  <label className="text-[10px] md:text-sm font-black text-slate-600 uppercase tracking-widest pl-1">
                    Província
                  </label>
                  <div className="relative">
                    <select 
                      value={provincia}
                      onChange={(e) => {
                        const val = e.target.value;
                        setProvincia(val);
                        const firstCity = CIDADES_OPCOES[val]?.[0]?.value || '';
                        setCidade(firstCity);
                        const listM = MUNICIPIOS_OPCOES[firstCity] || MUNICIPIOS_OPCOES[val] || [];
                        setMunicipio(listM[0]?.value || '');
                      }}
                      className="w-full bg-white border border-line rounded-2xl px-5 py-3.5 md:py-4 text-xs md:text-sm font-bold text-primary focus:ring-4 focus:ring-primary/5 transition-all outline-none appearance-none cursor-pointer"
                    >
                      {PROVINCIAS_OPCOES.map(prov => (
                        <option key={prov.value} value={prov.value}>{prov.label}</option>
                      ))}
                    </select>
                    <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                      <ArrowLeft className="-rotate-90" size={14} />
                    </div>
                  </div>
                </div>
 
                <div className="space-y-2">
                  <label className="text-[10px] md:text-sm font-black text-slate-600 uppercase tracking-widest pl-1">
                    Cidade
                  </label>
                  <div className="relative">
                    <select 
                      value={cidade}
                      onChange={(e) => {
                        const val = e.target.value;
                        setCidade(val);
                        const listM = MUNICIPIOS_OPCOES[val] || [];
                        setMunicipio(listM[0]?.value || '');
                      }}
                      className="w-full bg-white border border-line rounded-2xl px-5 py-3.5 md:py-4 text-xs md:text-sm font-bold text-primary focus:ring-4 focus:ring-primary/5 transition-all outline-none appearance-none cursor-pointer"
                    >
                      {(CIDADES_OPCOES[provincia] || []).map(cid => (
                        <option key={cid.value} value={cid.value}>{cid.label}</option>
                      ))}
                    </select>
                    <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                      <ArrowLeft className="-rotate-90" size={14} />
                    </div>
                  </div>
                </div>
 
                <div className="space-y-2">
                  <label className="text-[10px] md:text-sm font-black text-slate-600 uppercase tracking-widest pl-1">
                    Município
                  </label>
                  <div className="relative">
                    <select 
                      value={municipio}
                      onChange={(e) => setMunicipio(e.target.value)}
                      className="w-full bg-white border border-line rounded-2xl px-5 py-3.5 md:py-4 text-xs md:text-sm font-bold text-primary focus:ring-4 focus:ring-primary/5 transition-all outline-none appearance-none cursor-pointer"
                    >
                      {(MUNICIPIOS_OPCOES[cidade] || MUNICIPIOS_OPCOES[provincia] || []).map(mun => (
                        <option key={mun.value} value={mun.value}>{mun.label}</option>
                      ))}
                    </select>
                    <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                      <ArrowLeft className="-rotate-90" size={14} />
                    </div>
                  </div>
                </div>
              </div>
 
              <div className="space-y-2">
                <label className="text-[10px] md:text-sm font-black text-slate-600 uppercase tracking-widest pl-1">Assunto</label>
                <input 
                  type="text"
                  placeholder="Qual o tema da sua mensagem?"
                  value={composeData.subject}
                  onChange={(e) => setComposeData({ ...composeData, subject: e.target.value })}
                  className="w-full bg-white border border-line rounded-2xl px-5 py-3.5 md:py-4 text-xs md:text-sm font-bold text-primary focus:ring-4 focus:ring-primary/5 transition-all outline-none"
                />
              </div>
            </div>
          )}
 
          <div className="space-y-2">
            <label className="text-[10px] md:text-sm font-black text-slate-600 uppercase tracking-widest pl-1">Conteúdo da Mensagem</label>
            
            {/* Rich text Toolbar for composing, styled exactly like the official responder */}
            <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-white border border-slate-200 rounded-2xl mb-2 shadow-xs">
              {/* Undo / Redo */}
              <div className="flex items-center gap-0.5">
                <button
                  type="button"
                  onClick={handleUndo}
                  disabled={historyIndex === 0}
                  title="Desfazer (Undo)"
                  className={`p-2 rounded-xl hover:bg-slate-200/80 active:scale-95 transition-all ${
                    historyIndex === 0 ? 'text-slate-300 cursor-not-allowed' : 'text-slate-600 hover:text-slate-900'
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
                    historyIndex >= textHistory.length - 1 ? 'text-slate-300 cursor-not-allowed' : 'text-slate-600 hover:text-slate-900'
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
                      ? 'bg-indigo-100/80 text-indigo-755 border border-indigo-200/30' 
                      : 'text-slate-650 hover:bg-slate-200/60 hover:text-slate-900'
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
                      ? 'bg-indigo-100/80 text-indigo-755 border border-indigo-200/30' 
                      : 'text-slate-650 hover:bg-slate-200/60 hover:text-slate-900'
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
                      ? 'bg-indigo-100/80 text-indigo-755 border border-indigo-200/30' 
                      : 'text-slate-650 hover:bg-slate-200/60 hover:text-slate-900'
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
                  className="p-1.5 rounded-xl text-slate-600 hover:bg-slate-200/60 hover:text-slate-900 active:scale-95 transition-all flex items-center gap-1 cursor-pointer"
                >
                  <span className="font-extrabold text-xs border-b-2 leading-none" style={{ borderColor: editorColor }}>A</span>
                  <span className="text-[6px]">▼</span>
                </button>
                <div className="absolute left-0 top-8 hidden group-hover:flex group-focus-within:flex flex-col bg-white border border-slate-200 rounded-xl p-2 shadow-xl z-20 min-w-[130px] gap-1 text-left">
                  <span className="text-[8px] font-bold text-slate-400 select-none uppercase tracking-widest px-1">Cor da Fonte</span>
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
                        className={`w-3.5 h-3.5 rounded-full border transition-all cursor-pointer ${color.bgClass} ${
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
                    className={`p-1.5 rounded-xl active:scale-95 transition-all text-slate-600 cursor-pointer ${
                      editorAlignment === align.val 
                        ? 'bg-indigo-100/85 text-indigo-755 border border-indigo-200/30' 
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
                      if (!composeData.body.trim().startsWith('•') && !composeData.body.trim().startsWith('-')) {
                        updateBodyText(`• ` + composeData.body);
                      }
                    }
                  }}
                  title="Lista de Marcadores (Bullets)"
                  className={`p-1.5 rounded-xl active:scale-95 transition-all cursor-pointer ${
                    editorListType === 'bullet'
                      ? 'bg-indigo-100/85 text-indigo-755 border border-indigo-200/30'
                      : 'text-slate-600 hover:bg-slate-200/60 hover:text-slate-900'
                  }`}
                >
                  <List size={13} />
                </button>
              </div>

              <div className="w-[1px] h-4 bg-slate-200 mx-0.5" />

              {/* Blockquote Toggle */}
              <button
                type="button"
                onClick={() => setEditorIsQuote(!editorIsQuote)}
                title="Citação (Blockquote)"
                className={`p-1.5 rounded-xl active:scale-95 transition-all cursor-pointer ${
                  editorIsQuote
                    ? 'bg-indigo-100/85 text-indigo-755 border border-indigo-200/30'
                    : 'text-slate-600 hover:bg-slate-200/60 hover:text-slate-900'
                }`}
              >
                <Quote size={13} />
              </button>

              {/* Clear formatting Eraser */}
              <button
                type="button"
                onClick={clearFormatting}
                title="Limpar Formatação"
                className="p-1.5 rounded-xl text-slate-600 hover:bg-slate-200 hover:text-red-650 hover:bg-red-50/70 active:scale-95 transition-all ml-auto cursor-pointer"
              >
                <Eraser size={13} />
              </button>
            </div>

            <textarea 
              rows={8}
              placeholder="Descreva detalhadamente o seu pedido ou informação..."
              value={composeData.body}
              onChange={(e) => updateBodyText(e.target.value)}
              className={`w-full bg-white border border-line rounded-2xl px-5 py-3.5 md:py-4 text-xs md:text-sm font-semibold focus:ring-4 focus:ring-primary/5 transition-all outline-none resize-none leading-relaxed ${
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

          {/* List of Attached Files */}
          {composeData.attachments && composeData.attachments.length > 0 && (
            <div className="flex flex-wrap gap-2 p-3.5 bg-slate-50 border border-slate-200 rounded-2xl mt-4">
              {composeData.attachments.map((fileName, fIdx) => (
                <div 
                  key={fIdx} 
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-xl shadow-xs text-[11px] font-bold text-slate-700 animate-fadeIn"
                >
                  <FileText size={13} className="text-[#0c2340]/80 shrink-0" />
                  <span className="truncate max-w-[160px] select-none">{fileName}</span>
                  <span className="text-[9px] text-slate-400 font-mono select-none">(150 KB)</span>
                  <button 
                    type="button"
                    onClick={() => handleFileRemove(fileName)}
                    className="p-0.5 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded transition-colors cursor-pointer ml-1"
                    title="Remover anexo"
                  >
                    <Trash2 size={11} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="pt-2 md:pt-4 flex flex-col md:flex-row gap-3 md:gap-4 items-center">
            <button 
              onClick={handleSendMessage}
              disabled={!composeData.to || !composeData.subject || !composeData.body}
              className="w-full md:flex-[2] bg-primary text-white py-4 rounded-2xl font-black text-sm md:text-base shadow-xl shadow-primary/25 hover:bg-primary/95 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-2 md:gap-3 cursor-pointer"
            >
              <Send size={18} />
              Enviar Mensagem Oficial
            </button>

            <label 
              className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-4 bg-white hover:bg-slate-50 text-slate-700 font-extrabold text-sm rounded-2xl transition-all cursor-pointer active:scale-95 border border-slate-300 relative shadow-sm shrink-0"
              title="Anexar múltiplos ficheiros"
            >
              <Paperclip size={18} className="stroke-[2.5] text-slate-500" />
              <span>Anexar Ficheiros</span>
              <input
                type="file"
                multiple
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.xlsx"
                className="hidden"
                onChange={handleFileAdd}
              />
              {composeData.attachments && composeData.attachments.length > 0 && (
                <span className="bg-primary text-white font-black text-[10px] w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-xs ml-1 shrink-0">
                  {composeData.attachments.length}
                </span>
              )}
            </label>

            <button 
              onClick={() => {
                if(confirm("Deseja descartar este rascunho?")) setIsComposing(false);
              }}
              className="w-full md:flex-1 py-4 px-8 rounded-2xl font-bold text-xs md:text-sm text-slate-500 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Descartar
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  if (showVideoPage) {
    return (
      <section className="space-y-6 animate-fadeIn">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowVideoPage(false)}
              className="w-10 h-10 md:w-12 md:h-12 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl flex items-center justify-center transition-all active:scale-95 border border-slate-200"
              title="Voltar ao Correio"
            >
              <ArrowLeft size={18} className="md:w-5 md:h-5" />
            </button>
            <div>
              <h3 className="text-lg md:text-2xl font-black text-primary leading-tight">Video Atendimento</h3>
              <p className="text-[10px] md:text-sm text-slate-600 font-black uppercase tracking-widest">Canais de Conferência Governamental por Vídeo</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-300 rounded-[32px] p-6 md:p-8 shadow-sm">
          <VideoSessionPanel />
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 md:w-12 md:h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
            <Mail size={20} className="md:w-6 md:h-6" />
          </div>
          <div>
            <h3 className="text-lg md:text-2xl font-black text-primary leading-tight">{translateText("Correio Digital", currentLanguage)}</h3>
            <p className="text-[10px] md:text-sm text-slate-600 font-black uppercase tracking-widest">{unreadTotal} {translateText("mensagens por ler", currentLanguage)}</p>
          </div>
        </div>
        <button 
          onClick={() => setIsComposing(true)}
          className="bg-primary text-white rounded-2xl px-6 py-3.5 flex items-center justify-center gap-3 shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all text-xs md:text-sm font-black"
        >
          <Plus size={18} />
          {translateText("Nova Mensagem", currentLanguage)}
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-4 px-1 text-[10px] font-black uppercase tracking-widest">
        <button 
          onClick={() => setShowVideoPage(true)} 
          className="bg-indigo-50 hover:bg-indigo-150 text-indigo-755 border border-indigo-205 rounded-xl px-3.5 py-1.5 flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer text-[10px] font-black uppercase tracking-widest"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
          Video Atendimento
        </button>
        {isInst && <button onClick={() => setTab('inst-qrcode')} className="cda-link-text">{translateText("Validação QR", currentLanguage)}</button>}
      </div>

      {/* Filters & Tabs Container */}
      <div className="bg-white border border-slate-300 rounded-[32px] p-2.5 shadow-sm flex flex-col lg:flex-row gap-3">
        <div className="flex flex-wrap md:flex-nowrap gap-1.5 p-1 bg-white border border-slate-200 rounded-2xl lg:min-w-[500px] w-full lg:w-auto">
          {[
            { id: 'lidas', label: 'Lidas', count: inbox.filter(m => !deletedMessageIds.includes(m.id) && !m.unread).length },
            { id: 'naoLidas', label: 'Não Lidas', count: inbox.filter(m => !deletedMessageIds.includes(m.id) && m.unread).length },
            { id: 'enviadas', label: 'Enviadas', count: sentMessages.filter(m => !deletedMessageIds.includes(m.id)).length },
            { id: 'excluidas', label: 'Arquivadas', count: [...inbox, ...sentMessages].filter(m => deletedMessageIds.includes(m.id)).length }
          ].map(t => {
            const isActive = correspondenciaTab === t.id;
            let activeStyle = '';
            let badgeStyle = '';

            if (isActive) {
              if (t.id === 'lidas') {
                activeStyle = 'bg-emerald-600 text-white shadow-md shadow-emerald-200 ring-2 ring-emerald-600';
                badgeStyle = 'bg-white text-emerald-700';
              } else if (t.id === 'naoLidas') {
                activeStyle = 'bg-red-600 text-white shadow-md shadow-red-200 ring-2 ring-red-600';
                badgeStyle = 'bg-white text-red-600';
              } else if (t.id === 'enviadas') {
                activeStyle = 'bg-blue-600 text-white shadow-md shadow-blue-200 ring-2 ring-blue-600';
                badgeStyle = 'bg-white text-blue-600';
              } else if (t.id === 'excluidas') {
                activeStyle = 'bg-rose-600 text-white shadow-md shadow-rose-200 ring-2 ring-rose-600';
                badgeStyle = 'bg-white text-rose-600';
              }
            } else {
              activeStyle = 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50';
              if (t.id === 'lidas') {
                badgeStyle = 'bg-emerald-600 text-white';
              } else if (t.id === 'naoLidas') {
                badgeStyle = 'bg-red-600 text-white';
              } else if (t.id === 'enviadas') {
                badgeStyle = 'bg-blue-600 text-white';
              } else if (t.id === 'excluidas') {
                badgeStyle = 'bg-rose-600 text-white';
              }
            }

            return (
              <button 
                key={t.id}
                onClick={() => setCorrespondenciaTab(t.id)}
                className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-[11px] md:text-xs font-black uppercase tracking-tight transition-all border-0 cursor-pointer ${activeStyle}`}
              >
                {translateText(t.label, currentLanguage)}
                {t.count > 0 && (
                  <span className={`px-2 py-0.5 rounded-md text-[9.5px] font-black ${badgeStyle}`}>
                    {t.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-550" size={16} />
          <input 
            type="text"
            placeholder={translateText("Pesquisar correspondência oficial...", currentLanguage)}
            value={searchMail}
            onChange={(e) => setSearchMail(e.target.value)}
            className="w-full bg-white border border-slate-300 rounded-2xl pl-12 pr-4 py-3 md:py-3.5 text-xs md:text-sm font-bold text-slate-900 focus:ring-4 focus:ring-primary/10 focus:bg-white focus:border-primary/30 transition-all outline-none placeholder:text-slate-500"
          />
        </div>
      </div>

      {/* Message List */}
      <div className="bg-white rounded-[32px] p-6 md:p-8 shadow-sm space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 pb-6">
          <div>
            <h4 className="font-black text-slate-900 text-lg md:text-xl italic uppercase tracking-tight flex items-center gap-2">
              <Mail size={20} className="text-indigo-600" />
              {isInst ? 'Correio Institucional: Expediente de Entrada' : 'Correio Oficial Digital: Caixa de Entrada'}
            </h4>
            <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider mt-1">
              {isInst ? 'Gestão de submissões de cidadãos, requerimentos e auditorias pendentes de resposta' : 'Consulta e acompanhamento de certidões, avisos, pendências tributárias e faturas oficiais'}
            </p>
          </div>
        </div>

        {filteredMessages.length > 0 ? (
          <div className="overflow-auto rounded-[24px] bg-slate-50/20 custom-scrollbar max-h-[500px]">
            <table className="mobile-data-table w-full text-left border-collapse min-w-[900px]">
              <thead className="sticky top-0 z-10 bg-primary">
                <tr className="bg-primary text-white text-[10px] font-black uppercase tracking-widest">
                  <th className="py-4 px-5 rounded-l-2xl">{isInst ? 'CIDADÃO / REQUERENTE' : 'ÓRGÃO EMISSOR'}</th>
                  <th className="py-4 px-5">ASSUNTO TEMA</th>
                  <th className="py-4 px-5">CONTEÚDO / DETALHE</th>
                  <th className="py-4 px-5">DATA DE EXPIRAÇÃO</th>
                  <th className="py-4 px-5 text-center">HORA / DATA</th>
                  <th className="py-4 px-5 text-center">PRIORIDADE</th>
                  <th className="py-4 px-5 text-center rounded-r-2xl">AÇÕES</th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {filteredMessages.map((item) => {
                  const isUrgente = item.status === 'Urgente' || item.priorityScale === 'Crítico' || item.priorityScale === 'Urgente';
                  return (
                    <tr key={item.id} className="text-xs text-[#334155] hover:bg-slate-50/60 transition-colors">
                      {/* Cidadão / Órgão Emissor Column */}
                      <td className="py-5 px-5">
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${
                              item.unread 
                                ? 'bg-red-600 text-white border border-red-605' 
                                : 'bg-emerald-600 text-white border border-emerald-605'
                            }`}>
                              {t(item.unread ? 'Não Lida' : 'Lida')}
                            </span>
                            <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border ${getOrgBadgeStyles(item.org)}`}>
                              {t(item.org.toUpperCase().startsWith('SOC - ') ? 'SOC' : item.org)}
                            </span>
                            <span className="text-[9px] font-bold text-slate-400 font-mono">ID: #{item.id}</span>
                            {item.unread && (
                              <span className="w-1.5 h-1.5 rounded-full bg-[#f87171] inline-block animate-pulse shrink-0" />
                            )}
                          </div>
                          <div className="font-black italic text-slate-900 text-[11px] md:text-sm uppercase tracking-tight leading-none">
                            {t(isInst 
                              ? item.org
                                  .replace(/^Cidadão:\s*Cidadão:\s*/i, '')
                                  .replace(/^CIDADÃO:\s*CIDADÃO:\s*/i, '')
                                  .replace(/^CIDADÃO:\s*Cidadão:\s*/i, '')
                                  .replace(/^Cidadão:\s*CIDADÃO:\s*/i, '')
                                  .replace(/^Cidadão:\s*/i, '')
                                  .replace(/^CIDADÃO:\s*/i, '')
                              : (item.org.startsWith('SOC - ') 
                                  ? item.org.replace('SOC - ', '') 
                                  : `ÓRGÃO: ${item.org}`
                                )
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Assunto Tema Column */}
                      <td className="py-5 px-5">
                        <div className="space-y-1 text-left">
                          <div className="font-extrabold text-[#1e293b] text-xs md:text-sm tracking-tight">
                            {t(item.details?.subject || item.preview.substring(0, 30))}
                          </div>
                          <div className="text-[9px] text-[#94a3b8] font-black uppercase tracking-widest leading-none">
                            {isInst ? 'REQUERIMENTO FISCAL' : (item.protocol?.category || 'NOTIFICAÇÃO DIGITAL')}
                          </div>
                        </div>
                      </td>

                      {/* Conteúdo / Detalhe Column */}
                      <td className="py-5 px-5">
                        <div className="text-[#64748b] text-[11px] font-medium max-w-[280px] break-words whitespace-normal leading-relaxed" title={t(item.preview)}>
                          {t(item.preview)}
                        </div>
                      </td>

                      {/* Data de Expiração Column */}
                      <td className="py-5 px-5">
                        <div className="flex items-center">
                          <span className="inline-flex items-center gap-1.5 text-[#e05252] text-[9px] font-semibold tracking-wider font-sans">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#f87171] animate-pulse shrink-0" />
                            EXPIRA: {item.details?.deadline || item.protocol?.deadlineDate || '30 DE JUNHO DE 2026'}
                          </span>
                        </div>
                      </td>

                      {/* Hora / Data Column */}
                      <td className="py-5 px-5 text-center">
                        <div className="text-slate-800 font-bold font-mono text-[11px] tracking-tight">
                          {item.protocol?.officialTime || '11:00'}
                          <div className="text-[9.5px] font-bold text-slate-400 font-sans mt-0.5">{item.date}</div>
                        </div>
                      </td>

                      {/* Prioridade Column */}
                      <td className="py-5 px-5 text-center">
                        <span className={`text-[9px] font-black uppercase tracking-widest leading-none inline-block ${
                          isUrgente
                            ? 'text-[#e05252]'
                            : 'text-indigo-600'
                        }`}>
                          {isUrgente ? 'Urgente' : 'Normal'}
                        </span>
                      </td>

                      {/* Ações Column */}
                      <td className="py-5 px-5 text-center">
                        <div className="flex items-center justify-center gap-3">
                          <button
                            type="button"
                            onClick={() => handleSelectMessage(item)}
                            className="text-[9.5px] font-black uppercase text-indigo-650 hover:text-indigo-850 transition-colors tracking-widest hover:underline cursor-pointer bg-transparent border-0 outline-none"
                          >
                            {isInst ? 'ANALISAR' : 'ABRIR'}
                          </button>
                          {correspondenciaTab === 'excluidas' ? (
                            <button
                              type="button"
                              onClick={() => onRestoreMessage && onRestoreMessage(item.id)}
                              className="text-[9.5px] font-black uppercase text-emerald-600 hover:text-emerald-700 transition-colors tracking-widest hover:underline cursor-pointer bg-transparent border-0 outline-none"
                            >
                              Restaurar
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                if (confirm("Tem a certeza que deseja arquivar esta correspondência oficial?")) {
                                  onDeleteMessage && onDeleteMessage(item.id);
                                }
                              }}
                              className="text-[9.5px] font-black uppercase text-rose-600 hover:text-rose-800 transition-colors tracking-widest hover:underline cursor-pointer bg-transparent border-0 outline-none"
                            >
                              Arquivar
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-[24px] md:rounded-[32px] p-12 md:p-20 text-center space-y-4">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto shadow-sm text-slate-200">
              <Mail size={32} />
            </div>
            <div>
              <h4 className="text-base md:text-lg font-black text-slate-600 uppercase">Silêncio de Comunicações</h4>
              <p className="text-xs md:text-sm text-slate-600 font-bold">
                {searchMail ? `Nenhuma mensagem localizada para "${searchMail}"` : 'Todas as correspondências oficiais e petições encontram-se despachadas.'}
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
