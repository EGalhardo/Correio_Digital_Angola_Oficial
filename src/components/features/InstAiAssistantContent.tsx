/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Bot, 
  Eye, 
  Activity, 
  MessageSquare, 
  Users, 
  CheckCircle2, 
  Clock, 
  Trash2, 
  Send, 
  Check, 
  ChevronRight, 
  Upload, 
  FileText, 
  BookOpen, 
  Plus, 
  Settings, 
  HelpCircle, 
  AlertCircle,
  Pencil,
  ToggleLeft,
  ToggleRight,
  ShieldCheck,
  Search,
  CheckCircle,
  X,
  FileCode,
  Sparkles,
  Globe,
  Sliders,
  RefreshCw,
  Info,
  Save,
  ArrowLeft
} from 'lucide-react';

interface InstAiAssistantProps {
  addAuditLog?: (action: string, type: 'info' | 'success' | 'warning' | 'critical') => void;
  setTab?: (tab: string) => void;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  time: string;
  delivered?: boolean;
}

interface KnowledgeItem {
  id: string;
  name: string;
  size: string;
  type?: string;
  uploadedAt: string;
  status: 'Processado' | 'Indexando' | 'Em Processamento';
}

interface InteractionLog {
  id: string;
  citizenName: string;
  bi: string;
  topic: string;
  satisfaction: 'Alta' | 'Média' | 'Baixa';
  time: string;
  messagesCount: number;
}

interface ToolIntegration {
  id: string;
  name: string;
  description: string;
  category: string;
  active: boolean;
}

export function InstAiAssistantContent({ addAuditLog, setTab }: InstAiAssistantProps) {
  // Navigation Sub Tab State
  const [activeSubTab, setActiveSubTab] = useState<'config' | 'knowledge' | 'history'>('config');

  useEffect(() => {
    const scrollParent = () => {
      window.scrollTo({ top: 0, behavior: 'instant' });
      // Find the scrollable content container (e.g., class with overflow-y-auto)
      const contentAreas = document.querySelectorAll('.overflow-y-auto');
      contentAreas.forEach(el => {
        el.scrollTo({ top: 0, behavior: 'instant' });
      });
      // Also scroll parent elements
      let parent = document.getElementById('inst-ai-assistant-root');
      while (parent) {
        parent.scrollTo?.({ top: 0, behavior: 'instant' });
        parent = parent.parentElement;
      }
    };
    
    // Run immediately and after a short timeout to ensure layout/mounting is complete
    scrollParent();
    const timer = setTimeout(scrollParent, 100);
    return () => clearTimeout(timer);
  }, []);

  // Configuration States
  const [assistantName, setAssistantName] = useState<string>('Assistente AGT');
  const [description, setDescription] = useState<string>(
    'Assistente virtual da Administração Geral Tributária que ajuda cidadãos e empresas com serviços fiscais, impostos, NIF, multas e declarações.'
  );
  const [model, setModel] = useState<string>('GPT-4o');
  const [temperature, setTemperature] = useState<string>('0.2');
  const [language, setLanguage] = useState<string>('Português (Portugal)');

  // Temporary edit states
  const [tempName, setTempName] = useState<string>('Assistente AGT');
  const [tempDescription, setTempDescription] = useState<string>(
    'Assistente virtual da Administração Geral Tributária que ajuda cidadãos e empresas com serviços fiscais, impostos, NIF, multas e declarações.'
  );
  const [tempModel, setTempModel] = useState<string>('GPT-4o');
  const [tempTemperature, setTempTemperature] = useState<string>('0.2');
  const [tempLanguage, setTempLanguage] = useState<string>('Português (Portugal)');

  // Instructions State
  const [instructions, setInstructions] = useState<string>(
    `Você é o assistente oficial da Administração Geral Tributária (AGT).\n\nResponda apenas sobre assuntos relacionados com:\n- NIF\n- Impostos\n- Multas fiscais\n- Declarações fiscais\n- Taxas\n- Certidões fiscais\n- Processos fiscais`
  );
  const [tempInstructions, setTempInstructions] = useState<string>(instructions);

  // Is Editing Name inline state
  const [isEditingNameInline, setIsEditingNameInline] = useState<boolean>(false);

  // Automatic Context States (Checkboxes)
  const [contextConfig, setContextConfig] = useState({
    readMail: true,
    readProcessStatus: true,
    readTaxpayerData: true,
    readSchedules: true,
    readHistory: true,
    readAttachments: true,
  });

  // Preview Modal state
  const [isPreviewOpen, setIsPreviewOpen] = useState<boolean>(false);

  // Chat message state (for testing)
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'm1',
      sender: 'user',
      text: 'Quais documentos preciso para obter o NIF?',
      time: '21:29',
      delivered: true,
    },
    {
      id: 'm2',
      sender: 'bot',
      text: "Para obter o NIF, você precisa apresentar os seguintes documentos:\n\n• Bilhete de Identidade\n• Comprovativo de Residência\n• Declaração de Actividade (se aplicável)\n\nO pedido pode ser feito presencialmente num serviço da AGT ou online através do Portal das Finanças.",
      time: '21:29',
    }
  ]);
  const [chatInput, setChatInput] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const chatBottomRef = useRef<HTMLDivElement | null>(null);

  // Preview channel Chat message state (Inside modal)
  const [previewMessages, setPreviewMessages] = useState<ChatMessage[]>([
    {
      id: 'pm1',
      sender: 'bot',
      text: 'Olá! Sou o Assistente IA oficial integrado nos serviços públicos. Posso ajudá-lo hoje com o seu NIF, impostos, multas fiscais ou agendamentos?',
      time: '11:02',
    }
  ]);
  const [previewInput, setPreviewInput] = useState<string>('');
  const [isPreviewTyping, setIsPreviewTyping] = useState<boolean>(false);
  const previewChatBottomRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  // Knowledge Base Files state
  const [knowledgeFiles, setKnowledgeFiles] = useState<KnowledgeItem[]>([
    { id: 'kb1', name: 'Regulamento_Institucional.pdf', size: '2.4 MB', type: 'PDF', uploadedAt: '15/06/2026 14:32', status: 'Processado' },
    { id: 'kb2', name: 'Manual_Atendimento.docx', size: '1.1 MB', type: 'DOCX', uploadedAt: '15/06/2026 11:18', status: 'Processado' },
    { id: 'kb3', name: 'Politica_Privacidade.pdf', size: '890 KB', type: 'PDF', uploadedAt: '14/06/2026 16:45', status: 'Processado' },
    { id: 'kb4', name: 'Perguntas_Frequentes.txt', size: '320 KB', type: 'TXT', uploadedAt: '14/06/2026 09:20', status: 'Processado' },
    { id: 'kb5', name: 'Procedimentos_Fiscais.pdf', size: '3.2 MB', type: 'PDF', uploadedAt: '11/06/2026 10:05', status: 'Em Processamento' }
  ]);

  // Authorized API Tools integration state
  const [tools, setTools] = useState<ToolIntegration[]>([
    { id: 't1', name: 'Validador de NIF', description: 'Valida a autenticidade e situação cadastral do contribuinte junto ao banco de dados estatal.', category: 'Serviços de Cadastro', active: true },
    { id: 't2', name: 'Emissor de DLI (Documento de Liquidação)', description: 'Permite que a IA gere referências de pagamento de multas ou guias voluntárias.', category: 'Finanças & Cobrança', active: true },
    { id: 't3', name: 'Verificador de Estado de Processos', description: 'Consulta andamentos de petições, recursos e defesas de multas tributárias.', category: 'Contencioso', active: true },
    { id: 't4', name: 'Verificação de Dívidas Ativas', description: 'Examina restrições ou pendências de débitos fiscais em execução judicial.', category: 'Finanças & Cobrança', active: false },
    { id: 't5', name: 'Gerenciador de Agendamentos', description: 'Interface para marcar atendimentos presenciais com auditores nas repartições regionais.', category: 'Apoio ao Cidadão', active: true },
    { id: 't6', name: 'Geração Certidões de Quitação', description: 'Emite o PDF autenticado digitalmente confirmando a ausência de dívidas ativas.', category: 'Serviços de Cadastro', active: false },
  ]);

  // Conversation logs history
  const [interactionLogs] = useState<InteractionLog[]>([
    { id: 'log-1', citizenName: 'Edlasio Galhardo', bi: '009874562LA041', topic: 'Consulta de NIF e Isenções', satisfaction: 'Alta', time: 'Há 12 minutos', messagesCount: 8 },
    { id: 'log-2', citizenName: 'Maria Antónia', bi: '008812342LA011', topic: 'Reclamação de Multa Comercial', satisfaction: 'Alta', time: 'Há 45 minutos', messagesCount: 14 },
    { id: 'log-3', citizenName: 'José Kalunga', bi: '007712342LA021', topic: 'Obtenção de Modelo 1 Simplificado', satisfaction: 'Média', time: 'Há 2 horas', messagesCount: 6 },
    { id: 'log-4', citizenName: 'António Nzaji', bi: '001224851BA034', topic: 'Atendimento Prévio Registral', satisfaction: 'Alta', time: 'Há 1 dia', messagesCount: 5 },
    { id: 'log-5', citizenName: 'Filomena da Rocha', bi: '001144821LA091', topic: 'Contestação de Imposto Predial', satisfaction: 'Baixa', time: 'Há 2 dias', messagesCount: 19 }
  ]);

  // Toast Alerts State
  const [toast, setToast] = useState<{ text: string; type: 'success' | 'info' | 'warning' } | null>(null);

  const triggerToast = (text: string, type: 'success' | 'info' | 'warning' = 'success') => {
    setToast({ text, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // Scroll logic for testing chats
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isTyping]);

  useEffect(() => {
    previewChatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [previewMessages, isPreviewTyping]);

  // Synchronize temp state
  useEffect(() => {
    setTempName(assistantName);
    setTempDescription(description);
    setTempModel(model);
    setTempTemperature(temperature);
    setTempLanguage(language);
  }, [assistantName, description, model, temperature, language]);

  // Action: Save configuration forms
  const handleSaveGeneralConfig = () => {
    setAssistantName(tempName);
    setDescription(tempDescription);
    setModel(tempModel);
    setTemperature(tempTemperature);
    setLanguage(tempLanguage);
    setIsEditingNameInline(false);

    triggerToast('Configuração Geral salva com sucesso!', 'success');
    addAuditLog?.(`Configurações de IA modificadas: Nome (${tempName}), Modelo (${tempModel}), Temp (${tempTemperature})`, 'success');
  };

  // Action: Save IA prompt instructions
  const handleSaveInstructions = () => {
    setInstructions(tempInstructions);
    triggerToast('Instruções operacionais aplicadas com sucesso!', 'success');
    addAuditLog?.('Instruções operacionais do Assistente de IA atualizadas por agente autorizado.', 'success');
  };

  // Action: Add selected or dropped file to base
  const handleUploadFileInstance = (file: File) => {
    const existing = knowledgeFiles.find(f => f.name.toLowerCase() === file.name.toLowerCase());
    if (existing) {
      triggerToast('Este documento já está registrado na base de conhecimento.', 'warning');
      return;
    }

    const today = new Date();
    const formattedDate = `${today.getDate().toString().padStart(2, '0')}/${(today.getMonth() + 1).toString().padStart(2, '0')}/${today.getFullYear()} ${today.getHours().toString().padStart(2, '0')}:${today.getMinutes().toString().padStart(2, '0')}`;

    // Get formatted file size
    const sizeInMB = file.size / (1024 * 1024);
    const sizeStr = sizeInMB < 0.1 
      ? `${(file.size / 1024).toFixed(0)} KB` 
      : `${sizeInMB.toFixed(1)} MB`;

    // Extract file extension and support general file types
    let ext = file.name.split('.').pop()?.toUpperCase() || 'PDF';
    // Clean ext limit to 5 chars
    if (ext.length > 5) ext = ext.substring(0, 4);

    const newDoc: KnowledgeItem = {
      id: `doc-${Date.now()}`,
      name: file.name,
      type: ext,
      size: sizeStr,
      uploadedAt: formattedDate,
      status: 'Em Processamento'
    };

    setKnowledgeFiles(prev => [newDoc, ...prev]);
    triggerToast(`Documento "${file.name}" carregado para processamento.`, 'success');
    addAuditLog?.(`Novo documento anexado ao conhecimento do Assistente: ${file.name}`, 'success');

    // Simulate complete index status
    setTimeout(() => {
      setKnowledgeFiles(current => current.map(f => f.id === newDoc.id ? { ...f, status: 'Processado' } : f));
    }, 4500);
  };

  const handleFileSelectChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleUploadFileInstance(files[0]);
    }
    // reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Action: Delete document from database
  const handleDeleteFile = (id: string, name: string) => {
    setKnowledgeFiles(prev => prev.filter(f => f.id !== id));
    triggerToast(`Documento "${name}" excluído da base assistente.`, 'info');
    addAuditLog?.(`Documento removido da base IA: ${name}`, 'warning');
  };

  // Action: Toggle custom API tools
  const handleToggleTool = (id: string) => {
    const targetTool = tools.find(t => t.id === id);
    if (!targetTool) return;

    const nextState = !targetTool.active;
    
    setTools(current => current.map(t => {
      if (t.id === id) {
        return { ...t, active: nextState };
      }
      return t;
    }));

    // Trigger toast and audit log outside the pure updater function
    triggerToast(`Ferramenta "${targetTool.name}" ${nextState ? 'ativada' : 'desativada'}.`, nextState ? 'success' : 'info');
    addAuditLog?.(`Integração de ferramenta de IA alterada: ${targetTool.name} (${nextState ? 'Ativa' : 'Inativa'})`, 'info');
  };

  // BOT SIMULATION LOGIC
  const runSimulatedResponse = (query: string, setMessagesList: React.Dispatch<React.SetStateAction<ChatMessage[]>>, setTypingState: (s: boolean) => void) => {
    const normalized = query.toLowerCase().trim();
    let reply = '';

    if (normalized.includes('olá') || normalized.includes('bom dia') || normalized.includes('boa tarde')) {
      reply = `Olá! Sou o ${assistantName}, assistente virtual oficial de atendimento da instituição. Posso ajudá-lo com consultas fiscais, declarações, NIF, multas e certidões. Como posso auxiliar hoje?`;
    } else if (normalized.includes('nif') || normalized.includes('obter') || normalized.includes('documentos')) {
      reply = `Para a obtenção ou regularização de NIF junto à ${assistantName === 'Assistente AGT' ? 'Administração Geral Tributária' : assistantName}:\n\n• Cidadãos Nacionais: É obrigatório apresentar o Bilhete de Identidade (BI) original e o Comprovativo de Residência.\n• Cidadãos Estrangeiros: Requer Cópia do Passaporte Válido e Carta de Residência Fiscal.\n\nPode processar diretamente online de forma gratuita pelo Portal das Finanças ou mediante marcação numa Repartição Fiscal credenciada.`;
    } else if (normalized.includes('multa') || normalized.includes('pagar') || normalized.includes('juro') || normalized.includes('dli')) {
      reply = `As multas fiscais ativas podem ser localizadas pelo seu NIF. O pagamento requer a emissão do DLI (Documento de Liquidação de Impostos) contendo a Referência Única de Pagamento. Pode liquidar nos canais Multicaixa (Banco de Origem) ou na rede de agências bancárias autorizadas. Deseja que eu emita uma guia para você?`;
    } else if (normalized.includes('imposto') || normalized.includes('iva') || normalized.includes('irt')) {
      reply = `Os impostos declarativos como IVA e IRT seguem calendários oficiais mensais estabelecidos pelo Ministério das Finanças da República de Angola. Pode examinar suas faturas e guias em processamento pelo painel Correio Oficial.`;
    } else {
      reply = `Percebi sua questão relacionada com "${query}". Como sou um assistente treinado para fins burocráticos e regulamentações públicas, posso confirmar as diretrizes com base nos manuais ativos da instituição. Prefere consultar as certidões emitidas ou falar com um atendente humano?`;
    }

    setTypingState(true);
    setTimeout(() => {
      setTypingState(false);
      setMessagesList(prev => [...prev, {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: reply,
        time: new Date().toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' }),
      }]);
    }, 1200);
  };

  // Testing Console Send Chat
  const handleSendTestChatMessage = () => {
    if (!chatInput.trim()) return;
    const userMsg: ChatMessage = {
      id: `chat-${Date.now()}`,
      sender: 'user',
      text: chatInput,
      time: new Date().toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' }),
      delivered: true,
    };

    setChatMessages(prev => [...prev, userMsg]);
    const inputToProcess = chatInput;
    setChatInput('');
    runSimulatedResponse(inputToProcess, setChatMessages, setIsTyping);
  };

  // Preview Modal Send Chat
  const handleSendPreviewMessage = () => {
    if (!previewInput.trim()) return;
    const userMsg: ChatMessage = {
      id: `prev-${Date.now()}`,
      sender: 'user',
      text: previewInput,
      time: new Date().toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' }),
      delivered: true,
    };

    setPreviewMessages(prev => [...prev, userMsg]);
    const inputToProcess = previewInput;
    setPreviewInput('');
    runSimulatedResponse(inputToProcess, setPreviewMessages, setIsPreviewTyping);
  };

  const activeCheckboxesCount = Object.values(contextConfig).filter(Boolean).length;

  return (
    <div className="space-y-6 max-w-none w-full pb-12 text-[#1e293b] font-sans antialiased" id="inst-ai-assistant-root">
      
      {/* Dynamic Action Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className={`fixed top-5 right-5 z-[200] max-w-sm px-4 py-3.5 rounded-2xl shadow-none flex items-center gap-3 border text-xs font-bold leading-tight ${
              toast.type === 'success' 
                ? 'bg-[#0c2340] border-[#1e3a60] text-[#10b981]' 
                : toast.type === 'warning'
                ? 'bg-amber-500 border-amber-600 text-white'
                : 'bg-[#0f172a] border-slate-800 text-slate-200'
            }`}
          >
            <CheckCircle className="shrink-0 w-4 h-4 text-emerald-400" />
            <span>{toast.text}</span>
            <button onClick={() => setToast(null)} className="ml-auto hover:text-white p-0.5 bg-transparent border-none cursor-pointer">
              <X size={14} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CABEÇALHO DA PÁGINA (PAGE HEADER) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-4 px-1" id="ia-header-section">
        <div className="text-left">
          <h1 className="text-2xl md:text-[28px] font-black text-slate-800 tracking-tight m-0 leading-tight">
            IA
          </h1>
          <p className="text-xs md:text-sm text-slate-500 font-bold mt-1.5">
            Configure e gerencie o assistente virtual da sua instituição.
          </p>
        </div>

        {/* State and Preview Trigger */}
        <div className="flex items-center gap-3">
          {setTab && (
            <button
              onClick={() => setTab('home')}
              className="bg-slate-50 hover:bg-slate-100 text-slate-800 rounded-xl px-4 py-2 border border-slate-200 text-xs font-black uppercase tracking-widest transition-all cursor-pointer flex items-center gap-2 shadow-xs active:scale-95"
            >
              <ArrowLeft size={14} strokeWidth={2.5} />
              Voltar ao Painel
            </button>
          )}

          {/* Badge de Estado: Active status blinker */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-full text-[10px] font-black text-emerald-850 select-none tracking-wider shadow-none">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            ● ATIVO
          </div>

          <button
            type="button"
            onClick={() => setIsPreviewOpen(true)}
            className="bg-[#0c2340] hover:bg-slate-900 text-white py-2.5 px-5 rounded-lg text-xs font-black uppercase tracking-wider inline-flex items-center gap-2 transition-all cursor-pointer shadow-none border-none"
            id="preview-assistant-btn"
          >
            <Eye size={14} className="stroke-[2.5]" />
            <span>PRÉ-VISUALIZAR ASSISTENTE</span>
          </button>
        </div>
      </div>

      {/* PRIMEIRA LINHA DE CARTÕES (TOP TWO WIDE CARDS LADO A LADO) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* CARTÃO 1: INFORMAÇÕES DO ASSISTENTE (Left) */}
        <div className="bg-white border border-[#0c2340]/15 rounded-[20px] p-6 shadow-none flex flex-col md:flex-row items-center md:items-start gap-6">
          {/* Circular logo: Institutional circular avatar */}
          <div className="w-20 h-20 md:w-[84px] md:h-[84px] bg-[#0c2340] text-white rounded-full flex flex-col items-center justify-center shrink-0 border border-indigo-950/25 shadow-none select-none">
            <span className="font-serif font-black text-2xl tracking-tighter">AGT</span>
            <span className="text-[5.5px] font-black uppercase tracking-widest text-[#94a3b8] mt-1 text-center leading-none">
              Tributária
            </span>
          </div>

          <div className="flex-1 min-w-0 text-center md:text-left space-y-2">
            <div className="flex items-center justify-center md:justify-start gap-2.5">
              {isEditingNameInline ? (
                <div className="flex items-center gap-1">
                  <input
                    type="text"
                    className="bg-slate-50 border border-slate-200 text-xs font-bold text-[#0c2340] px-2.5 py-1 rounded-lg outline-none max-w-[140px]"
                    value={tempName}
                    onChange={(e) => setTempName(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleSaveGeneralConfig(); }}
                    autoFocus
                  />
                  <button 
                    onClick={handleSaveGeneralConfig}
                    className="p-1 text-emerald-600 hover:bg-emerald-50 rounded border-none bg-transparent cursor-pointer font-bold text-[10px]"
                  >
                    OK
                  </button>
                  <button 
                    onClick={() => { setTempName(assistantName); setIsEditingNameInline(false); }}
                    className="p-1 text-slate-400 hover:bg-slate-50 rounded border-none bg-transparent cursor-pointer font-bold text-[10px]"
                  >
                    ESC
                  </button>
                </div>
              ) : (
                <>
                  <h2 className="text-xl font-black text-[#0c2340] tracking-tight m-0 leading-none">{assistantName}</h2>
                  <button
                    onClick={() => setIsEditingNameInline(true)}
                    className="p-1 bg-transparent border-none cursor-pointer text-slate-450 hover:text-slate-800 transition-colors"
                    title="Editar Nome do Assistente"
                  >
                    <Pencil size={13} className="stroke-[2.5]" />
                  </button>
                </>
              )}
            </div>
            
            <p className="text-xs text-slate-700 font-bold leading-relaxed max-w-md">
              {description}
            </p>

            {/* Badges Informativos organized horizontally like Image 2 */}
            <div className="grid grid-cols-4 gap-2 pt-4 border-t border-slate-100">
              <div className="flex items-center gap-2">
                <div className="text-indigo-600 bg-indigo-50 w-7 h-7 rounded-lg flex items-center justify-center shrink-0">
                  <Bot size={14} className="stroke-[2.5]" />
                </div>
                <div className="text-left">
                  <span className="block text-[8px] font-bold text-slate-400 uppercase tracking-wider leading-none">Modelo</span>
                  <span className="font-extrabold text-[#0c2340] text-xs block mt-0.5">{model}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="text-purple-600 bg-purple-50 w-7 h-7 rounded-lg flex items-center justify-center shrink-0">
                  <Globe size={14} className="stroke-[2.5]" />
                </div>
                <div className="text-left">
                  <span className="block text-[8px] font-bold text-slate-400 uppercase tracking-wider leading-none">Idioma</span>
                  <span className="font-extrabold text-[#0c2340] text-xs block mt-0.5">Português</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="text-slate-500 bg-slate-50 w-7 h-7 rounded-lg flex items-center justify-center shrink-0">
                  <Sliders size={14} className="stroke-[2.5]" />
                </div>
                <div className="text-left">
                  <span className="block text-[8px] font-bold text-slate-400 uppercase tracking-wider leading-none">Temp</span>
                  <span className="font-extrabold text-[#0c2340] text-xs block mt-0.5">{temperature}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="text-emerald-600 bg-emerald-50 w-7 h-7 rounded-lg flex items-center justify-center shrink-0">
                  <ShieldCheck size={14} className="stroke-[2.5]" />
                </div>
                <div className="text-left">
                  <span className="block text-[8px] font-bold text-slate-400 uppercase tracking-wider leading-none">Estado</span>
                  <span className="font-bold text-emerald-700 text-xs block mt-0.5">Ativo</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CARTÃO 2: ESTATÍSTICAS (Right) */}
        <div className="bg-white border border-[#0c2340]/15 rounded-[20px] p-6 shadow-none flex flex-col justify-between">
          <div className="flex justify-between items-center mb-4 pb-1">
            <span className="text-xs font-black text-[#0c2340] tracking-widest uppercase">
              ESTATÍSTICAS
            </span>

            {/* Simulated monthly Filter dropdown */}
            <div className="relative">
              <select className="bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-extrabold text-[10px] uppercase tracking-wider px-3 py-1.5 rounded-lg cursor-pointer outline-none appearance-none pr-8 transition-colors">
                <option>Este mês</option>
                <option>Últimos 3 meses</option>
                <option>Ano corrente</option>
              </select>
              <span className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-[10px] font-bold">
                ▼
              </span>
            </div>
          </div>

          {/* 4 Internal statistics cards with custom distinct themes and details matching design */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            {/* Conversations stats card (Lilac/Violet block) */}
            <div className="bg-[#FAF9FF] border border-[#0c2340]/15 rounded-xl p-3.5 text-left hover:shadow-none transition-shadow">
              <div className="w-8 h-8 bg-purple-100 text-[#534980] rounded-lg flex items-center justify-center mb-2 shadow-none">
                <MessageSquare size={16} className="stroke-[2.5]" />
              </div>
              <span className="block font-black text-xl text-[#0c2340] tracking-tight leading-none">1.248</span>
              <span className="text-[10px] font-extrabold text-[#534980] uppercase tracking-tight mt-1.5 block">Conversas</span>
            </div>

            {/* Users stats card (Blue/Sky block) */}
            <div className="bg-[#F8FAFF] border border-[#0c2340]/15 rounded-xl p-3.5 text-left hover:shadow-none transition-shadow">
              <div className="w-8 h-8 bg-sky-100 text-[#284a7a] rounded-lg flex items-center justify-center mb-2 shadow-none">
                <Users size={16} className="stroke-[2.5]" />
              </div>
              <span className="block font-black text-xl text-[#0c2340] tracking-tight leading-none">865</span>
              <span className="text-[10px] font-extrabold text-[#284a7a] uppercase tracking-tight mt-1.5 block">Utilizadores</span>
            </div>

            {/* Resolutions stats card (Green/Emerald block) */}
            <div className="bg-[#F5FDF8] border border-[#0c2340]/15 rounded-xl p-3.5 text-left hover:shadow-none transition-shadow">
              <div className="w-8 h-8 bg-emerald-100 text-[#1e6136] rounded-lg flex items-center justify-center mb-2 shadow-none">
                <CheckCircle2 size={16} className="stroke-[2.5]" />
              </div>
              <span className="block font-black text-xl text-[#0c2340] tracking-tight leading-none">92%</span>
              <span className="text-[10px] font-extrabold text-[#1e6136] uppercase tracking-tight mt-1.5 block">Resoluções</span>
            </div>

            {/* Average time stats card (Orange/Amber block) */}
            <div className="bg-[#FFFDF9] border border-[#0c2340]/15 rounded-xl p-3.5 text-left hover:shadow-none transition-shadow">
              <div className="w-8 h-8 bg-amber-100 text-[#7c542c] rounded-lg flex items-center justify-center mb-2 shadow-none">
                <Clock size={16} className="stroke-[2.5]" />
              </div>
              <span className="block font-black text-xl text-[#0c2340] tracking-tight leading-none">2m 34s</span>
              <span className="text-[10px] font-extrabold text-[#7c542c] uppercase tracking-tight mt-1.5 block">Tempo médio</span>
            </div>
          </div>
        </div>
      </div>

      {/* CENTRAL CONTENT GRID (CONFIGURAÇÃO GERAL & BASE DE CONHECIMENTO SIDE-BY-SIDE) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch mt-2">
        {/* COLUNA ESQUERDA - CONFIGURAÇÃO GERAL (5 spans) */}
        <div className="lg:col-span-5 bg-white border border-slate-200/90 rounded-[24px] p-6.5 shadow-none flex flex-col justify-between text-left h-full min-h-[580px]">
          <div className="flex-1 flex flex-col justify-between gap-5">
            {/* Cabecalho da Configuração conforme a imagem */}
            <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
              <div className="w-12 h-12 rounded-[18px] bg-indigo-50/70 flex items-center justify-center text-indigo-600 border border-indigo-100/40 shrink-0">
                <Settings size={22} className="text-indigo-600 stroke-[2.2]" />
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-black text-[#0c2340] tracking-wider uppercase leading-none">
                  CONFIGURAÇÃO GERAL
                </h3>
                <span className="text-[11px] text-slate-500 font-semibold leading-relaxed mt-1 block">
                  Configure as definições básicas do seu assistente.
                </span>
              </div>
            </div>

            {/* Inputs Principais */}
            <div className="flex-grow flex flex-col gap-6.5">
              {/* Nome do Assistente Input */}
              <div className="space-y-2.5 text-left">
                <label className="text-[10.5px] font-black text-slate-500 uppercase tracking-widest pl-0.5 block leading-none">
                  NOME DO ASSISTENTE
                </label>
                <input
                  type="text"
                  className="w-full bg-[#f8fafc]/40 border border-slate-200 focus:border-indigo-500 rounded-xl px-4 py-4 text-xs font-semibold text-slate-800 outline-none transition-all shadow-xs"
                  placeholder="Ex: Assistente AGT"
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                />
              </div>

              {/* Instrução Textarea */}
              <div className="space-y-2.5 text-left flex-1 flex flex-col">
                <label className="text-[10.5px] font-black text-slate-500 uppercase tracking-widest pl-0.5 block leading-none">
                  INSTRUÇÃO
                </label>
                <textarea
                  className="w-full flex-grow bg-[#f8fafc]/40 border border-slate-200 focus:border-indigo-500 rounded-xl px-4 py-4 text-xs font-semibold text-slate-800 outline-none transition-all leading-relaxed resize-none shadow-xs min-h-[220px] lg:min-h-[265px]"
                  placeholder="Descreva a função operativa..."
                  value={tempDescription}
                  onChange={(e) => setTempDescription(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Botão de Gravar Alterações com ícone */}
          <div className="pt-4 border-t border-slate-100 mt-4">
            <button
              type="button"
              onClick={handleSaveGeneralConfig}
              className="w-full bg-[#403be6] hover:bg-[#312cbd] text-white py-4 rounded-[16px] font-extrabold text-[11px] uppercase tracking-widest transition-all cursor-pointer border-none flex items-center justify-center gap-2.5 shadow-xs active:scale-98"
            >
              <Save size={14} className="stroke-[2.5]" />
              GUARDAR ALTERAÇÕES
            </button>
          </div>
        </div>

        {/* COLUNA DIREITA - BASE DE CONHECIMENTO (7 spans) */}
        <div 
          className={`lg:col-span-7 bg-white border rounded-[24px] p-6.5 shadow-none flex flex-col justify-between text-left transition-all duration-200 relative h-full min-h-[580px] ${
            isDragging 
              ? 'border-indigo-500 bg-indigo-50/10 ring-2 ring-indigo-500/15 scale-[1.005]' 
              : 'border-[#0c2340]/15'
          }`}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={(e) => {
            e.preventDefault();
            setIsDragging(false);
          }}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            const files = e.dataTransfer.files;
            if (files && files.length > 0) {
              handleUploadFileInstance(files[0]);
            }
          }}
        >
          {/* Hidden File Input supporting several file formats */}
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept=".pdf,.docx,.doc,.txt,.png,.jpg,.jpeg,.gif,.xls,.xlsx"
            onChange={handleFileSelectChange}
            id="kb-file-input-uploader"
          />

          <div>
            <div className="pb-3 border-b border-slate-100 flex items-center justify-between gap-4 text-left">
              <div>
                <h3 className="text-sm font-black text-[#0c2340] tracking-wider uppercase m-0 leading-none">
                  BASE DE CONHECIMENTO
                </h3>
                <p className="text-[11px] text-slate-400 font-semibold tracking-tight mt-1 bg-transparent max-w-lg leading-snug">
                  Gerencie os documentos que a IA utiliza como fonte de conhecimento institucional. Todos os documentos são processados e indexados para pesquisa semântica.
                </p>
              </div>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2.5 bg-[#4f46e5] hover:bg-indigo-700 text-white rounded-xl text-xs font-black uppercase tracking-wider inline-flex items-center gap-1.5 transition-all cursor-pointer border-none shrink-0"
              >
                <Plus size={14} className="stroke-[3]" />
                <span>Adicionar Documento</span>
              </button>
            </div>

            {/* Document list table with vertical scroll functionality */}
            <div className="overflow-x-auto overflow-y-auto max-h-[305px] mt-4 pr-1 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
              <table className="mobile-data-table w-full text-left text-xs border-collapse">
                <thead className="sticky top-0 bg-white z-10 shadow-[0_1px_0_0_rgba(241,245,249,1)]">
                  <tr className="border-b border-indigo-50/50 text-slate-400 uppercase tracking-widest text-[9px] font-extrabold bg-white">
                    <th className="py-2.5 px-1 pb-2 font-black">Nome do Documento</th>
                    <th className="py-2.5 px-1 pb-2 text-center font-black">Tipo</th>
                    <th className="py-2.5 px-1 pb-2 text-center font-black">Data de Carga</th>
                    <th className="py-2.5 px-1 pb-2 text-center font-black">Tamanho</th>
                    <th className="py-2.5 px-1 pb-2 text-center font-black">Estado</th>
                    <th className="py-2.5 px-1 pb-2 text-right font-black">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {knowledgeFiles.map(file => {
                    const isImg = ['JPG', 'JPEG', 'PNG', 'GIF', 'WEBP'].includes(file.type || '');
                    const isDoc = ['DOC', 'DOCX'].includes(file.type || '');
                    const isPdf = file.type === 'PDF';
                    
                    return (
                      <tr key={file.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                        <td className="py-2 px-1 font-bold text-slate-800 flex items-center gap-2.5">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border text-[8px] font-black tracking-tighter uppercase ${
                            isPdf 
                              ? 'bg-rose-50 border-rose-200/40 text-rose-600' 
                              : isImg
                              ? 'bg-emerald-50 border-emerald-200/40 text-emerald-600'
                              : isDoc
                              ? 'bg-indigo-50 border-indigo-200/40 text-indigo-600'
                              : 'bg-amber-50 border-amber-200/40 text-amber-700'
                          }`}>
                            <span>{file.type || 'PDF'}</span>
                          </div>
                          <span className="truncate max-w-[145px] text-xs font-bold text-slate-700" title={file.name}>
                            {file.name}
                          </span>
                        </td>
                        <td className="py-2 px-1 text-center font-mono font-extrabold text-slate-450 uppercase text-[9.5px]">
                          {file.type || 'PDF'}
                        </td>
                        <td className="py-2 px-1 text-center font-semibold text-slate-500 whitespace-nowrap">
                          {file.uploadedAt}
                        </td>
                        <td className="py-2 px-1 text-center font-bold text-slate-650">
                          {file.size}
                        </td>
                        <td className="py-2 px-1 text-center">
                          {file.status === 'Processado' ? (
                            <span className="bg-emerald-50 border border-emerald-200/60 text-emerald-600 rounded-md text-[8.5px] font-extrabold px-2 py-0.5 inline-flex items-center gap-1 uppercase tracking-wide">
                              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full inline-block" />
                              Processado
                            </span>
                          ) : (
                            <span className="bg-indigo-50 border border-indigo-200/60 text-indigo-700 rounded-md text-[8.5px] font-extrabold px-2 py-0.5 inline-flex items-center gap-1 uppercase tracking-wide animate-pulse">
                              <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full inline-block animate-ping" />
                              Em Processamento
                            </span>
                          )}
                        </td>
                        <td className="py-2 px-1">
                          <div className="flex items-center justify-end gap-1.5">
                            <button className="p-1 hover:bg-slate-50 text-slate-400 hover:text-[#0c2340] rounded border-none bg-transparent cursor-pointer" title="Visualizar">
                              <Eye size={13} className="stroke-[2.5]" />
                            </button>
                            <button className="p-1 hover:bg-slate-50 text-slate-400 hover:text-indigo-600 rounded border-none bg-transparent cursor-pointer" title="Recarregar">
                              <RefreshCw size={12} className="stroke-[2.5]" />
                            </button>
                            <button 
                              onClick={() => handleDeleteFile(file.id, file.name)}
                              className="p-1 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded border-none bg-transparent cursor-pointer" 
                              title="Remover"
                            >
                              <Trash2 size={13} className="stroke-[2.5]" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {knowledgeFiles.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400 uppercase font-black tracking-widest text-[10px]">
                        Nenhum documento na base de conhecimento
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Table pagination stats footer */}
          <div className="flex items-center justify-between text-[10px] font-extrabold text-slate-450 border-t border-slate-105 pt-2.5 mt-1 uppercase tracking-wider">
            <span>{knowledgeFiles.length} documentos</span>
            <div className="flex items-center gap-4">
              <span>Página 1 de 1</span>
              <div className="flex items-center gap-1">
                <button className="p-1 text-slate-300 hover:text-slate-800 disabled:opacity-40 border-none bg-transparent cursor-pointer" disabled>
                  ◀
                </button>
                <button className="p-1 text-slate-300 hover:text-slate-800 disabled:opacity-40 border-none bg-transparent cursor-pointer" disabled>
                  ▶
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RODAPÉ INFORMATIVO ("Como Funciona" Alert box strictly matching layout) */}
      <div className="bg-indigo-50/40 border border-indigo-100 rounded-xl p-4 flex items-start gap-3 mt-2 text-left" id="comofunciona-alert-box">
        <div className="w-7 h-7 rounded-full bg-indigo-50 border border-indigo-150 flex items-center justify-center text-indigo-600 shrink-0 mt-0.5">
          <Info className="w-4 h-4 text-indigo-600" />
        </div>
        <div>
          <p className="text-[11px] text-indigo-950 font-bold leading-relaxed uppercase tracking-tight m-0">
            <strong className="text-indigo-900 font-extrabold mr-1.5">Como funciona:</strong>
            Os documentos são processados automaticamente após o upload e ficam disponíveis para a IA consultar durante as conversas. Ao remover um documento, a IA deixa imediatamente de utilizar esse conteúdo como fonte de conhecimento.
          </p>
        </div>
      </div>

      {/* THE COMPREHENSIVE FLOATING WEB CHAT PREVIEW MODAL */}
      <AnimatePresence>
        {isPreviewOpen && (
          <div className="fixed inset-0 bg-[#0c2340]/40 backdrop-blur-xs z-[300] flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.93, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.93, opacity: 0 }}
              className="bg-white rounded-[24px] border border-[#0c2340]/15 shadow-none w-full max-w-md h-[550px] flex flex-col justify-between overflow-hidden relative"
            >
              {/* Modal chat Header */}
              <div className="bg-[#0c2340] text-white p-5 flex items-center justify-between select-none">
                <div className="flex items-center gap-3 text-left">
                  {/* Avatar circular */}
                  <div className="w-9 h-9 bg-indigo-900 rounded-full flex items-center justify-center font-bold text-xs shrink-0 select-none uppercase tracking-tighter border border-white/20">
                    AGT
                  </div>
                  
                  <div>
                    <h4 className="font-extrabold text-[#f8fafc] text-xs m-0 tracking-tight">{assistantName}</h4>
                    <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-widest leading-none block mt-0.5">
                      ● Assistente Governamental
                    </span>
                  </div>
                </div>

                <button 
                  onClick={() => setIsPreviewOpen(false)}
                  className="p-1.5 hover:bg-white/10 text-slate-300 hover:text-white rounded-lg transition-colors border-none bg-transparent cursor-pointer"
                  title="Fechar pré-visualização"
                >
                  <X size={18} className="stroke-[2.5]" />
                </button>
              </div>

              {/* Model chat body scrolling messages */}
              <div className="flex-1 bg-slate-50/65 overflow-y-auto p-4 space-y-3.5 custom-scrollbar">
                {previewMessages.map(msg => {
                  const isUser = msg.sender === 'user';
                  return (
                    <div key={msg.id} className={`flex items-start gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}>
                      {!isUser && (
                        <div className="w-6.5 h-6.5 bg-[#0c2340] text-white rounded-full flex items-center justify-center shrink-0 text-[8px] font-black uppercase shadow-none select-none">
                          AGT
                        </div>
                      )}
                      
                      <div className={`max-w-[80%] rounded-2xl px-3.5 py-3 text-xs leading-relaxed text-left shadow-none ${
                        isUser
                          ? 'bg-purple-100 text-[#0c2340] border border-purple-200/40 rounded-tr-none font-semibold'
                          : (msg.sender === 'bot' && (msg.text.includes("Para obter o NIF") || (msg.text.includes("Bilhete de Identidade") && msg.text.includes("Comprovativo de Residência"))))
                            ? 'bg-[#0c2340] text-white rounded-tl-none font-bold whitespace-pre-line shadow-none'
                            : 'bg-white text-slate-850 rounded-tl-none font-semibold whitespace-pre-line border border-slate-150'
                      }`}>
                        <p className="m-0 leading-relaxed">{msg.text}</p>
                        <span className={`block text-[7.5px] font-mono leading-none ${
                          isUser 
                            ? 'text-purple-400' 
                            : (msg.sender === 'bot' && (msg.text.includes("Para obter o NIF") || (msg.text.includes("Bilhete de Identidade") && msg.text.includes("Comprovativo de Residência"))))
                              ? 'text-slate-300' 
                              : 'text-slate-400'
                        } mt-1 text-right font-black select-none`}>
                          {msg.time}
                        </span>
                      </div>
                    </div>
                  );
                })}

                {isPreviewTyping && (
                  <div className="flex items-start gap-2.5">
                    <div className="w-6.5 h-6.5 bg-[#0c2340] text-white rounded-full flex items-center justify-center shrink-0 text-[8px] font-black uppercase">
                      AGT
                    </div>
                    <div className="bg-white rounded-2xl rounded-tl-none px-3.5 py-2.5 border border-slate-150 shadow-none">
                      <div className="flex gap-1 items-center justify-center py-1">
                        <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={previewChatBottomRef} />
              </div>

              {/* Modal chat bottom input bar */}
              <div className="p-3.5 bg-white border-t border-slate-100 space-y-1">
                <div className="relative">
                  <input
                    type="text"
                    className="w-full bg-[#f8fafc] border border-slate-205 focus:border-[#0c2340] rounded-xl pl-3.5 pr-10 py-3 text-xs text-slate-800 outline-none transition-all placeholder:text-slate-400 font-bold"
                    placeholder="Escreva a sua pergunta tributária..."
                    value={previewInput}
                    onChange={(e) => setPreviewInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleSendPreviewMessage(); }}
                  />

                  <button
                    onClick={handleSendPreviewMessage}
                    disabled={!previewInput.trim() || isPreviewTyping}
                    className="absolute right-1 top-1/2 -translate-y-1/2 w-8 h-8 bg-[#0c2340] hover:bg-slate-900 text-white rounded-full flex items-center justify-center transition-all border-none cursor-pointer"
                  >
                    <Send size={11} className="stroke-[2.5]" />
                  </button>
                </div>
                <div className="text-center pt-1 select-none">
                  <span className="text-[7.5px] text-slate-400 font-black uppercase tracking-wider">
                    Administração Geral Tributária — Correio Oficial
                  </span>
                </div>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
