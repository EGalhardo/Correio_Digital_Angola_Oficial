/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Bot, Clock, Activity, Users, Database, BookOpen, MessageSquare, ArrowRight, ChevronRight, CheckCircle, 
  Search, Sliders, Play, Settings, Upload, FileText, Check, Sparkles, TrendingUp, Cpu, Landmark,
  ShieldCheck, ShieldAlert, Key, Lock, AlertTriangle, HelpCircle, RefreshCw, BarChart2, Plus, Trash2, HeartPulse, Scale, DollarSign
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

interface GovIaContentProps {
  onLog?: (action: string, type: 'info' | 'success' | 'warning' | 'critical') => void;
}

export function GovIaContent({ onLog }: GovIaContentProps) {
  // Toast notification state
  const [showToast, setShowToast] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string>('');
  const [toastType, setToastType] = useState<'success' | 'info' | 'warning'>('success');

  // Interactive configurations
  const [mainModel, setMainModel] = useState<string>('GPT-4o');
  const [isAssistantActive, setIsAssistantActive] = useState<boolean>(true);
  const [selectedRange, setSelectedRange] = useState<string>('7d'); // '7d' or '30d'
  
  // Base numbers that can increase when adding items
  const [knowledgeBasesCount, setKnowledgeBasesCount] = useState<number>(127);
  const [totalDocsCount, setTotalDocsCount] = useState<number>(186450);

  // Search filter for integrated institutions
  const [institutionsSearch, setInstitutionsSearch] = useState<string>('');

  // Modals state
  const [isManageKnowledgeOpen, setIsManageKnowledgeOpen] = useState<boolean>(false);
  const [isManageModelsOpen, setIsManageModelsOpen] = useState<boolean>(false);
  const [isTestModalOpen, setIsTestModalOpen] = useState<boolean>(false);
  
  // Custom Toast helper
  const triggerToast = (msg: string, type: 'success' | 'info' | 'warning' = 'success') => {
    setToastMessage(msg);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  // Helper function to play a soft tick / interaction audio
  const playInteractionSound = (type: 'click' | 'success' | 'alert') => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      
      if (type === 'click') {
        osc.frequency.setValueAtTime(600, audioCtx.currentTime);
        gain.gain.setValueAtTime(0.015, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.08);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.08);
      } else if (type === 'success') {
        osc.frequency.setValueAtTime(450, audioCtx.currentTime);
        osc.frequency.setValueAtTime(900, audioCtx.currentTime + 0.08);
        gain.gain.setValueAtTime(0.02, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.25);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.25);
      } else if (type === 'alert') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(220, audioCtx.currentTime);
        osc.frequency.setValueAtTime(150, audioCtx.currentTime + 0.12);
        gain.gain.setValueAtTime(0.03, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.3);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.3);
      }
    } catch {
      // Audio context may be blocked by user gesture restrictions, ignore
    }
  };

  // Chat/Test AI Assistant Simulation State
  const [testMessages, setTestMessages] = useState([
    { sender: 'assistant', text: 'Olá! Sou o Assistente IA Nacional de Angola. Posso consultar as bases de conhecimento integradas de todas as secretarias e ministérios para lhe responder. Como posso ajudar?' }
  ]);
  const [testInput, setTestInput] = useState<string>('');
  const [isAiTyping, setIsAiTyping] = useState<boolean>(false);

  const simulateAiTypingResponse = (query: string) => {
    setIsAiTyping(true);
    setTimeout(() => {
      let reply = 'Interoperabilidade confirmada. A analisar os documentos guardados... ';
      const lower = query.toLowerCase();
      if (lower.includes('nif') || lower.includes('imposto')) {
        reply = 'Segundo as diretrizes do Ministério das Finanças (AGT), para obter o NIF de cidadão nacional, necessita de apresentar o Bilhete de Identidade original válido e um comprovativo de morada ou residência. A taxa de emissão é gratuita.';
      } else if (lower.includes('bilhete') || lower.includes('identidade') || lower.includes('bi')) {
        reply = 'Dando resposta através das bases do Ministério da Justiça e dos Direitos Humanos, o agendamento de Bilhete de Identidade (BI) pode ser coordenado online no portal do cidadão ou em qualquer posto do SIAC nas respetivas províncias.';
      } else if (lower.includes('saúde') || lower.includes('vacina') || lower.includes('médico')) {
        reply = 'No âmbito do Serviço Nacional de Saúde de Angola (MINSA), campanhas de vacinação ativa e consultas de rotina estão indexadas localmente para agendamento direto via código único do Correio Digital.';
      } else {
        reply = `Com base nas informações federadas da inteligência artificial: Processámos com sucesso a sua questão sobre "${query}". Os sistemas centrais do Conselho Digital de Angola (CDA) retornaram status operativo normal com 100% de precisão.`;
      }
      setTestMessages(prev => [...prev, { sender: 'assistant', text: reply }]);
      setIsAiTyping(false);
      playInteractionSound('success');
    }, 1200);
  };

  // Simulated Institution State for Column 1
  const [institutions, setInstitutions] = useState([
    { id: '1', name: 'Ministério da Justiça', icon: Scale, status: 'Activo', docs: '25.400', lastUpdated: 'Atualizado há 2 dias', count: 25400 },
    { id: '2', name: 'Ministério da Saúde', icon: HeartPulse, status: 'Activo', docs: '41.200', lastUpdated: 'Atualizado há 1 dia', count: 41200 },
    { id: '3', name: 'Ministério da Educação', icon: BookOpen, status: 'Activo', docs: '35.100', lastUpdated: 'Atualizado hoje', count: 35100 },
    { id: '4', name: 'Ministério das Finanças', icon: DollarSign, status: 'Activo', docs: '18.900', lastUpdated: 'Atualizado há 3 dias', count: 18900 },
    { id: '5', name: 'Ministério da Administração Pública', icon: Landmark, status: 'Activo', docs: '12.450', lastUpdated: 'Atualizado há 1 dia', count: 12450 },
  ]);

  // Form for adding custom connected institution
  const [newInstName, setNewInstName] = useState<string>('');
  const [newInstDocs, setNewInstDocs] = useState<string>('5.000');

  const handleAddInstitution = () => {
    if (!newInstName.trim()) {
      triggerToast('Insira o nome da instituição', 'warning');
      return;
    }
    const newId = (institutions.length + 1).toString();
    const instDocsParsed = parseInt(newInstDocs.replace(/\D/g, '')) || 5000;
    const item = {
      id: newId,
      name: newInstName,
      icon: Landmark,
      status: 'Activo',
      docs: Number(instDocsParsed).toLocaleString('pt-PT'),
      lastUpdated: 'Atualizado agora mesmo',
      count: instDocsParsed
    };
    setInstitutions(prev => [...prev, item]);
    setKnowledgeBasesCount(prev => prev + 1);
    setTotalDocsCount(prev => prev + instDocsParsed);
    setNewInstName('');
    triggerToast(`Instituição "${newInstName}" integrada e indexada com sucesso!`, 'success');
    if (onLog) onLog(`Nova instituição integrada no portal IA: ${newInstName}`, 'success');
    playInteractionSound('success');
  };

  // Knowledge base list simulation
  const [knowledgeBases, setKnowledgeBases] = useState([
    { id: 'k1', title: 'Perguntas Frequentes (FAQ)', type: 'Conversações', count: '24.785', docs: 24785 },
    { id: 'k2', title: 'Procedimentos', type: 'Manuais Operacionais', count: '12.340', docs: 12340 },
    { id: 'k3', title: 'Leis e Regulamentos', type: 'Legislação Oficial', count: '8.976', docs: 8976 },
    { id: 'k4', title: 'Formulários e Modelos', type: 'Documentos Padrão', count: '4.215', docs: 4215 }
  ]);

  const [newKbTitle, setNewKbTitle] = useState<string>('');
  const [newKbType, setNewKbType] = useState<string>('Procedimento Manual');
  const [newKbCount, setNewKbCount] = useState<string>('1.500');

  const handleAddKb = () => {
    if (!newKbTitle.trim()) {
      triggerToast('Insira o título da base de conhecimento', 'warning');
      return;
    }
    const parsedCount = parseInt(newKbCount.replace(/\D/g, '')) || 1000;
    const newBase = {
      id: 'kb_' + Date.now(),
      title: newKbTitle,
      type: newKbType,
      count: parsedCount.toLocaleString('pt-PT'),
      docs: parsedCount
    };
    setKnowledgeBases(prev => [...prev, newBase]);
    setTotalDocsCount(prev => prev + parsedCount);
    setNewKbTitle('');
    setIsManageKnowledgeOpen(false);
    triggerToast(`Base "${newKbTitle}" carregada para vetorização!`, 'success');
    if (onLog) onLog(`Base de vetorização de IA atualizada: ${newKbTitle} (${parsedCount} docs)`, 'success');
    playInteractionSound('success');
  };

  // IA Model stats simulation
  const [modelsList, setModelsList] = useState([
    { id: 'm1', name: 'GPT-4o', maker: 'OpenAI', status: 'Activo', share: '68,4%', cost: '2.145.320 Kz', selected: true },
    { id: 'm2', name: 'Claude 3.5', maker: 'Anthropic', status: 'Activo', share: '18,7%', cost: '612.450 Kz', selected: false },
    { id: 'm3', name: 'Gemini 1.5 Pro', maker: 'Google', status: 'Activo', share: '9,2%', cost: '325.780 Kz', selected: false },
    { id: 'm4', name: 'Modelo Local (Llama 3.1)', maker: 'Meta (CDA Server)', status: 'Activo', share: '3,7%', cost: '85.120 Kz', selected: false },
  ]);

  const selectActiveModel = (id: string, name: string) => {
    setModelsList(prev => prev.map(m => ({ ...m, selected: m.id === id })));
    setMainModel(name);
    triggerToast(`Modelo principal alterado para ${name}!`, 'success');
    playInteractionSound('success');
    if (onLog) onLog(`Modelo de IA modificado para: ${name}`, 'info');
  };

  // Recharts Chart Data (Weekly Volume of Conversations)
  const chartDataWeekly = [
    { name: '01 Jun', volume: 15400, responseTime: 1.9 },
    { name: '02 Jun', volume: 18500, responseTime: 1.85 },
    { name: '03 Jun', volume: 22100, responseTime: 1.81 },
    { name: '04 Jun', volume: 20400, responseTime: 1.82 },
    { name: '05 Jun', volume: 24500, responseTime: 1.79 },
    { name: '06 Jun', volume: 25680, responseTime: 1.76 },
    { name: '07 Jun', volume: 23652, responseTime: 1.82 },
  ];

  const chartDataMonthly = [
    { name: 'W1 Ago', volume: 68000, responseTime: 2.1 },
    { name: 'W2 Ago', volume: 84000, responseTime: 1.95 },
    { name: 'W3 Ago', volume: 91000, responseTime: 1.88 },
    { name: 'W4 Ago', volume: 112000, responseTime: 1.8 },
  ];

  const currentChartData = useMemo(() => {
    return selectedRange === '7d' ? chartDataWeekly : chartDataMonthly;
  }, [selectedRange]);

  // Filtered list of institutions based on search term
  const filteredInstitutions = useMemo(() => {
    return institutions.filter(inst => inst.name.toLowerCase().includes(institutionsSearch.toLowerCase()));
  }, [institutions, institutionsSearch]);

  return (
    <div className="pb-24 text-left animate-fadeIn space-y-6 w-full max-w-none mx-auto px-1 sm:px-2">
      
      {/* Toast Alert Success Display */}
      <AnimatePresence>
        {showToast && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-4 right-4 z-50 rounded-2xl p-4 shadow-xl text-white flex items-center gap-3 border transition-all duration-300 font-sans ${
              toastType === 'success' ? 'bg-emerald-600 border-emerald-500' :
              toastType === 'warning' ? 'bg-amber-600 border-amber-500' : 'bg-blue-600 border-blue-500'
            }`}
          >
            <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center font-bold">
              <Check size={14} className="stroke-[3]" />
            </div>
            <div>
              <p className="m-0 leading-tight font-black text-xs uppercase tracking-wider">Ação Automatizada</p>
              <p className="text-[10px] text-white/90 font-medium m-0 mt-0.5">{toastMessage}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* HEADER HERO AREA */}
      <div id="ai-central-header" className="bg-white border border-slate-200 text-slate-800 rounded-[24px] p-6 shadow-xs relative overflow-hidden">
        {/* Background visual graphics */}
        <div className="absolute right-0 top-0 w-96 h-96 bg-blue-50/50 rounded-full blur-3xl -z-1" />
        <div className="absolute left-1/4 bottom-0 w-80 h-80 bg-indigo-50/40 rounded-full blur-3xl -z-1 shrink-0" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          
          <div className="flex items-start gap-4">
            <div className="p-3 bg-gradient-to-br from-indigo-500 to-indigo-600 text-white rounded-2xl shadow-md shrink-0">
              <Bot size={32} className="animate-pulse" />
            </div>
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 border border-slate-200 rounded-full text-[10px] font-sans tracking-wide uppercase font-black text-slate-600">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                  Conselho Digital de Angola
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-full text-[9px] font-mono tracking-wider font-extrabold uppercase">
                  IA NACIONAL
                </span>
              </div>
              <h1 className="text-2xl md:text-3xl font-black text-[#0c2340] tracking-tight m-0 font-sans mt-2">
                ASSISTÊNCIA IA
              </h1>
              <p className="text-xs md:text-sm text-slate-500 font-semibold leading-relaxed max-w-3xl m-0">
                Assistente IA Nacional do Correio Digital de Angola. Um único assistente inteligente que acede às bases de conhecimento de todas as instituições para fornecer respostas precisas, rápidas e integradas aos cidadãos.
              </p>
            </div>
          </div>

          <div className="flex flex-row md:flex-row items-center gap-3 self-start lg:self-center shrink-0">
            {/* Clock status */}
            <div className="bg-slate-50 border border-slate-200 rounded-[18px] p-3 text-right flex items-center gap-2.5 shadow-3xs">
              <Clock size={16} className="text-indigo-500 animate-spin-slow" />
              <div className="text-left">
                <span className="text-[9px] font-semibold text-slate-400 block uppercase tracking-wider">Última atualização</span>
                <span className="text-xs text-slate-800 font-black font-sans leading-none">Hoje às 18:45</span>
              </div>
            </div>

            {/* Simulated Live Chat button */}
            <button
              onClick={() => {
                playInteractionSound('success');
                setIsTestModalOpen(true);
              }}
              className="px-5 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-[16px] text-xs font-black uppercase tracking-wider transition-all hover:shadow-md cursor-pointer border-0 flex items-center gap-2"
            >
              <Sparkles size={14} className="stroke-[2.5]" />
              <span>Testar IA</span>
            </button>
          </div>

        </div>

        {/* Gray separator line */}
        <div className="h-[1px] bg-slate-200/60 my-5" />

        {/* Mode Toggle & System Active Controls */}
        <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between font-sans">
          
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider">Modulação de Execução:</span>
            <div className="flex items-center gap-2 bg-slate-100 border border-slate-200 rounded-[16px] p-1 shadow-inner">
              <button 
                onClick={() => { playInteractionSound('click'); setIsAssistantActive(true); triggerToast('Serviço de IA Nacional Activado na rede.', 'success'); }}
                className={`px-3.5 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border-0 cursor-pointer ${isAssistantActive ? 'bg-indigo-600 text-white shadow-xs' : 'bg-transparent text-slate-500 hover:text-slate-800'}`}
              >
                Ativo / Em Operação
              </button>
              <button 
                onClick={() => { playInteractionSound('alert'); setIsAssistantActive(false); triggerToast('Serviço de IA suspenso temporariamente.', 'warning'); }}
                className={`px-3.5 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border-0 cursor-pointer ${!isAssistantActive ? 'bg-orange-600 text-white shadow-xs' : 'bg-transparent text-slate-500 hover:text-orange-600'}`}
              >
                Suspenso
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-slate-400">Canal de Ingressos:</span>
            <span className="px-2.5 py-1 bg-emerald-50 border border-emerald-150 text-emerald-700 text-[10px] font-black rounded-lg uppercase tracking-wider">
              ONLINE
            </span>
          </div>

        </div>

      </div>

      {/* TOP ROW OF 6 KPI MODULES */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        
        {/* KPI 1 : Modelo Principal */}
        <div 
          onClick={() => setIsManageModelsOpen(true)}
          className="bg-white border border-slate-200 p-4.5 rounded-[20px] shadow-3xs cursor-pointer hover:border-indigo-300 transition-all text-left relative group overflow-hidden"
        >
          <div className="absolute right-0 bottom-0 translate-y-3 translate-x-3 text-slate-100 group-hover:text-indigo-100 transition-colors pointer-events-none pr-1">
            <Bot size={58} />
          </div>
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Modelo Principal</span>
          <span className="text-[11px] font-semibold text-indigo-600 block mt-0.5">Em utilização</span>
          <span className="text-base md:text-lg font-black text-[#0a2342] block mt-1 tracking-tight">{mainModel}</span>
        </div>

        {/* KPI 2 : Estado do Assistente */}
        <div className="bg-white border border-slate-200 p-4.5 rounded-[20px] shadow-3xs text-left relative overflow-hidden">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Estado do Assistente</span>
          <span className="text-[11px] font-semibold text-slate-500 block mt-0.5">Sistema</span>
          <div className="flex items-center gap-2 mt-2">
            <span className={`w-2.5 h-2.5 rounded-full ${isAssistantActive ? 'bg-emerald-500 animate-pulse' : 'bg-orange-500'}`} />
            <span className={`text-base font-black uppercase tracking-wide ${isAssistantActive ? 'text-emerald-700' : 'text-orange-600'}`}>
              {isAssistantActive ? 'Activo' : 'Pausado'}
            </span>
          </div>
        </div>

        {/* KPI 3 : Instituições Integradas */}
        <div className="bg-white border border-slate-200 p-4.5 rounded-[20px] shadow-3xs text-left relative overflow-hidden">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Instituições Integradas</span>
          <span className="text-[11px] font-semibold text-slate-500 block mt-0.5">Total</span>
          <span className="text-2xl md:text-3xl font-black text-[#0a2342] block mt-1 tracking-tight">{institutions.length + 122}</span>
        </div>

        {/* KPI 4 : Bases de Conhecimento */}
        <div 
          onClick={() => setIsManageKnowledgeOpen(true)}
          className="bg-white border border-slate-200 p-4.5 rounded-[20px] shadow-3xs cursor-pointer hover:border-indigo-300 transition-all text-left relative overflow-hidden"
        >
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Bases de Conhecimento</span>
          <span className="text-[11px] font-semibold text-indigo-600 block mt-0.5">Integradas</span>
          <span className="text-2xl md:text-3xl font-black text-[#0a2342] block mt-1 tracking-tight">{knowledgeBasesCount}</span>
        </div>

        {/* KPI 5 : Conversas Hoje */}
        <div className="bg-white border border-slate-200 p-4.5 rounded-[20px] shadow-3xs text-left relative overflow-hidden">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Conversas Hoje</span>
          <span className="text-[11px] font-semibold text-slate-500 block mt-0.5">Total</span>
          <span className="text-2xl md:text-3xl font-black text-[#0a2342] block mt-1 tracking-tight">24.532</span>
        </div>

        {/* KPI 6 : Taxa de Resolução */}
        <div className="bg-white border border-slate-200 p-4.5 rounded-[20px] shadow-3xs text-left relative overflow-hidden">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Taxa de Resolução</span>
          <span className="text-[11px] font-semibold text-emerald-600 block mt-0.5">Global</span>
          <span className="text-2xl md:text-3xl font-black text-emerald-700 block mt-1 tracking-tight">94,7%</span>
        </div>

      </div>

      {/* STEP BY STEP DIAGRAM SECTION */}
      <div className="bg-slate-50 border border-slate-200/80 rounded-[24px] p-6 text-left relative overflow-hidden">
        <h3 className="text-xs md:text-xs font-black text-slate-400 uppercase tracking-widest block mb-4">
          Como funciona o Assistente IA Nacional?
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 items-center">
          
          {/* Step 1 */}
          <div className="flex items-center gap-4 bg-white border border-slate-200/60 p-4 rounded-2xl relative shadow-3xs">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold shrink-0">
              <Users size={22} />
            </div>
            <div className="text-left">
              <span className="text-[10px] font-black text-[#0c2340] block">1. Utilizador faz pergunta</span>
              <span className="text-[9px] text-slate-500 block mt-0.5">Cidadão interage com Assistente IA Nacional</span>
            </div>
            <div className="hidden md:block absolute -right-4 z-20 text-slate-400">
              <ChevronRight size={20} className="stroke-[3]" />
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex items-center gap-4 bg-white border border-slate-200/60 p-4 rounded-2xl relative shadow-3xs">
            <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center font-bold shrink-0">
              <Bot size={22} className="animate-pulse" />
            </div>
            <div className="text-left">
              <span className="text-[10px] font-black text-[#0c2340] block">2. Identificação da intenção</span>
              <span className="text-[9px] text-slate-500 block mt-0.5">A IA analisa e identifica tema e ministério</span>
            </div>
            <div className="hidden md:block absolute -right-4 z-20 text-slate-400">
              <ChevronRight size={20} className="stroke-[3]" />
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex items-center gap-4 bg-white border border-slate-200/60 p-4 rounded-2xl relative shadow-3xs">
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold shrink-0">
              <Database size={22} />
            </div>
            <div className="text-left">
              <span className="text-[10px] font-black text-[#0c2340] block">3. Consulta às bases</span>
              <span className="text-[9px] text-slate-500 block mt-0.5">Acede aos vetores da instituição relevante</span>
            </div>
            <div className="hidden md:block absolute -right-4 z-20 text-slate-400">
              <ChevronRight size={20} className="stroke-[3]" />
            </div>
          </div>

          {/* Step 4 */}
          <div className="flex items-center gap-4 bg-white border border-slate-200/60 p-4 rounded-2xl relative shadow-3xs">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold shrink-0">
              <Cpu size={22} />
            </div>
            <div className="text-left">
              <span className="text-[10px] font-black text-[#0c2340] block">4. Gera resposta precisa</span>
              <span className="text-[9px] text-slate-500 block mt-0.5">Compila informações e gera contextualização</span>
            </div>
            <div className="hidden md:block absolute -right-4 z-20 text-slate-400">
              <ChevronRight size={20} className="stroke-[3]" />
            </div>
          </div>

          {/* Step 5 */}
          <div className="flex items-center gap-4 bg-white border border-slate-200/60 p-4 rounded-2xl relative shadow-3xs">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold shrink-0">
              <CheckCircle size={22} />
            </div>
            <div className="text-left">
              <span className="text-[10px] font-black text-[#0c2340] block">5. Resposta ao utilizador</span>
              <span className="text-[9px] text-slate-500 block mt-0.5">Entrega resposta clara com fontes referidas</span>
            </div>
          </div>

        </div>

      </div>

      {/* MIDDLE LAYOUT GRID: 3 COLUMNS */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* COL 1: INSTITUIÇÕES INTEGRADAS */}
        <div className="bg-white border border-slate-200 rounded-[24px] p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="space-y-0.5">
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">Integração Federada</span>
                <h2 className="text-sm font-black text-[#0c2340] uppercase tracking-wide">Instituições Integradas</h2>
              </div>
              <button 
                onClick={() => triggerToast('Filtro de visualização geral activado', 'info')}
                className="text-[10px] font-extrabold text-indigo-600 hover:text-indigo-800 transition-all bg-indigo-50/50 border border-indigo-100/50 px-2.5 py-1 rounded-md mt-1 cursor-pointer"
              >
                Ver todas →
              </button>
            </div>

            {/* Live Search Ministry Bar */}
            <div className="my-3 relative">
              <input
                type="text"
                placeholder="Pesquisar instituição..."
                value={institutionsSearch}
                onChange={(e) => setInstitutionsSearch(e.target.value)}
                className="w-full bg-slate-50 hover:bg-slate-100/70 focus:bg-white text-xs text-slate-800 placeholder-slate-400 border border-slate-200 focus:border-indigo-400 px-3.5 py-2.5 rounded-xl outline-none transition-all pr-8"
              />
              <Search size={14} className="text-slate-400 absolute right-3 top-3.5" />
            </div>

            {/* List with search & interaction */}
            <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
              {filteredInstitutions.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-450 font-bold space-y-1">
                  <p>Nenhuma instituição coincide.</p>
                  <button 
                    onClick={() => setInstitutionsSearch('')}
                    className="text-indigo-600 cursor-pointer text-[10px] underline"
                  >
                    Limpar pesquisa
                  </button>
                </div>
              ) : (
                filteredInstitutions.map((inst) => {
                  const IconComponent = inst.icon;
                  return (
                    <div 
                      key={inst.id} 
                      className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200/50 hover:border-slate-300 rounded-2xl group transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-white rounded-xl text-[#0c2340] border border-slate-200 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-all shrink-0">
                          <IconComponent size={16} />
                        </div>
                        <div className="text-left">
                          <span className="text-[11px] font-black text-slate-800 block group-hover:text-indigo-950 transition-colors">{inst.name}</span>
                          <span className="text-[9px] text-slate-500 font-medium block">{inst.lastUpdated}</span>
                        </div>
                      </div>
                      <div className="text-right flex items-center gap-3 shrink-0">
                        <div className="text-left md:text-right hidden sm:block">
                          <span className="text-[10px] font-mono font-black text-slate-800 block">{inst.docs} docs</span>
                          <span className="text-[8px] font-bold text-slate-400 block tracking-widest uppercase">Indexados</span>
                        </div>
                        <span className="px-2 py-0.5 bg-green-50 text-green-600 border border-green-150 text-[9px] font-black rounded-md uppercase">
                          {inst.status}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Quick Input to Add New simulated institution */}
          <div className="mt-4 pt-4 border-t border-slate-150 bg-slate-50/50 p-3 rounded-2xl border border-dashed border-slate-200">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-2">Simular nova integração</span>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Nome (ex: Ministério...) "
                value={newInstName}
                onChange={(e) => setNewInstName(e.target.value)}
                className="flex-1 bg-white border border-slate-200 px-3 py-1.5 text-xs rounded-xl outline-none"
              />
              <button
                onClick={handleAddInstitution}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold border-0 cursor-pointer flex items-center gap-1"
              >
                <Plus size={14} />
                <span>Adicionar</span>
              </button>
            </div>
          </div>

        </div>

        {/* COL 2: BASES DE CONHECIMENTO */}
        <div className="bg-white border border-slate-200 rounded-[24px] p-5 shadow-xs flex flex-col justify-between">
          
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="space-y-0.5">
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">Vetorização e Index</span>
                <h2 className="text-sm font-black text-[#0c2340] uppercase tracking-wide">Bases de Conhecimento</h2>
              </div>
              <span className="text-[11px] font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                {totalDocsCount.toLocaleString('pt-PT')} Docs
              </span>
            </div>

            <div className="space-y-3 mt-4">
              {knowledgeBases.map((kb) => (
                <div key={kb.id} className="flex items-center justify-between p-3.5 border border-slate-150 bg-white rounded-xl shadow-3xs hover:border-slate-200 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg shrink-0">
                      <FileText size={16} />
                    </div>
                    <div className="text-left">
                      <span className="text-xs font-black text-slate-800 block">{kb.title}</span>
                      <span className="text-[9px] text-slate-400 font-bold block uppercase mt-0.5">{kb.type}</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs font-mono font-black text-indigo-700 block">{kb.count}</span>
                    <span className="text-[8px] font-bold text-slate-400 block tracking-widest uppercase">Ficheiros / FAQ</span>
                  </div>
                </div>
              ))}

              {/* Sinc status block */}
              <div className="p-3.5 bg-emerald-50/50 border border-emerald-150 rounded-2xl flex items-center justify-between text-left">
                <div className="flex items-center gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping shrink-0" />
                  <div>
                    <span className="text-[10px] font-black text-emerald-800 block">Sincronização Ativa de Vetores</span>
                    <span className="text-[9px] text-emerald-600 font-medium block">Última sincronização geral: Hoje às 08:20</span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    playInteractionSound('success');
                    triggerToast('Resincronização e otimização de vetores concluída!', 'success');
                  }}
                  className="p-1 px-2.5 bg-white border border-emerald-200 hover:border-emerald-300 text-emerald-700 rounded-lg text-[9px] font-black uppercase tracking-wider cursor-pointer shadow-3xs"
                >
                  Sincronizar
                </button>
              </div>

            </div>
          </div>

          <button
            onClick={() => {
              playInteractionSound('click');
              setIsManageKnowledgeOpen(true);
            }}
            className="w-full mt-4 py-3 bg-slate-50 hover:bg-slate-100 text-[#0c2340] border border-slate-200 rounded-[16px] text-xs font-black uppercase tracking-wider transition-all duration-200 cursor-pointer flex items-center justify-center gap-2"
          >
            <Upload size={14} className="text-slate-500" />
            <span>Gerir Bases de Conhecimento</span>
          </button>

        </div>

        {/* COL 3: MONITORIZAÇÃO DA IA (HOJE) */}
        <div className="bg-white border border-slate-200 rounded-[24px] p-5 shadow-xs flex flex-col justify-between">
          
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="space-y-0.5">
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">Auditoria Operativa</span>
                <h2 className="text-sm font-black text-[#0c2340] uppercase tracking-wide">Monitorização da IA (Hoje)</h2>
              </div>
              <select
                className="bg-slate-100 hover:bg-slate-200/80 border-0 text-[10px] font-extrabold uppercase text-slate-600 rounded-lg px-2 py-1 outline-none cursor-pointer"
                onChange={(e) => triggerToast(`Visualização mudada para: ${e.target.value === 'today' ? 'Hoje' : 'Período Completo'}`)}
              >
                <option value="today">Hoje</option>
                <option value="all">Sempre</option>
              </select>
            </div>

            {/* Dashboard Subgrid with 6 blocks matching the image precisely */}
            <div className="grid grid-cols-2 gap-3 mt-4">
              
              {/* Stat 1 */}
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/50 text-left">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Perguntas Respondidas</span>
                <span className="text-base font-black text-slate-800 font-mono block mt-1">24.532</span>
                <span className="text-[9px] text-[#00a859] font-bold block mt-0.5">↑ 12,4% vs ontem</span>
              </div>

              {/* Stat 2 */}
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/50 text-left">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Tempo Médio Resposta</span>
                <span className="text-base font-black text-slate-800 font-mono block mt-1">1,8s</span>
                <span className="text-[9px] text-[#00a859] font-bold block mt-0.5">↓ 0,3s vs ontem</span>
              </div>

              {/* Stat 3 */}
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/50 text-left">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Taxa de Sucesso</span>
                <span className="text-base font-black text-indigo-700 font-mono block mt-1">94,7%</span>
                <span className="text-[9px] text-[#00a859] font-bold block mt-0.5">↑ 2,1% vs ontem</span>
              </div>

              {/* Stat 4 */}
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/50 text-left">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Utilizadores Atendidos</span>
                <span className="text-base font-black text-slate-800 font-mono block mt-1">18.752</span>
                <span className="text-[9px] text-[#00a859] font-bold block mt-0.5">↑ 15,8% vs ontem</span>
              </div>

              {/* Stat 5 */}
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/50 text-left">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Docs Consultados</span>
                <span className="text-base font-black text-slate-800 font-mono block mt-1">31.225</span>
                <span className="text-[9px] text-[#00a859] font-bold block mt-0.5">↑ 18,6% vs ontem</span>
              </div>

              {/* Stat 6 */}
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/50 text-left">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Taxa de Escalonamento</span>
                <span className="text-base font-black text-orange-600 font-mono block mt-1">5,3%</span>
                <span className="text-[9px] text-[#00a859] font-bold block mt-0.5">↓ 1,2% para humano</span>
              </div>

            </div>
          </div>

          <button
            onClick={() => triggerToast('A redirecionar para relatórios consolidados do IA...', 'info')}
            className="w-full mt-4 py-3 bg-[#0c2340] hover:bg-[#1a3a60] text-white rounded-[16px] text-xs font-black uppercase tracking-wider transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 border-0"
          >
            <BarChart2 size={14} className="text-slate-200" />
            <span>Ver relatório completo</span>
          </button>

        </div>

      </div>

      {/* BOTTOM LAYOUT GRID: 3 COLUMNS */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* BOTTOM COL 1: MODELOS DE IA */}
        <div className="bg-white border border-slate-200 rounded-[24px] p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="space-y-0.5">
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">Configuração de Motor LLM</span>
                <h2 className="text-sm font-black text-[#0c2340] uppercase tracking-wide">Modelos de IA</h2>
              </div>
              <span className="text-[9px] px-2 py-0.5 bg-indigo-50 border border-indigo-100 text-indigo-700 font-black rounded uppercase">
                Motor Ativo
              </span>
            </div>

            <div className="space-y-2 mt-4">
              {modelsList.map((modelItem) => (
                <div 
                  key={modelItem.id}
                  onClick={() => selectActiveModel(modelItem.id, modelItem.name)}
                  className={`p-3.5 border rounded-2xl text-left cursor-pointer transition-all flex items-center justify-between ${
                    modelItem.selected 
                      ? 'border-indigo-500 bg-indigo-50/50 shadow-sm' 
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg shrink-0 ${modelItem.selected ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                      <Bot size={15} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-slate-800">{modelItem.name}</span>
                        {modelItem.selected && (
                          <span className="px-1.5 py-0.2 bg-emerald-100 text-emerald-800 text-[8px] font-black uppercase rounded">
                            Ativo
                          </span>
                        )}
                      </div>
                      <span className="text-[9px] text-slate-400 block font-medium">Desenvolvidor: {modelItem.maker}</span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-xs font-mono font-black text-slate-700 block">{modelItem.cost} <span className="text-[8px] text-slate-400 font-normal">/hora</span></span>
                    <span className="text-[9px] text-[#00a859] font-black block">Quota {modelItem.share}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => {
              playInteractionSound('click');
              setIsManageModelsOpen(true);
            }}
            className="w-full mt-4 py-3 bg-slate-50 hover:bg-slate-100 text-[#0c2340] border border-slate-200 rounded-[16px] text-xs font-black uppercase tracking-wider transition-all duration-200 cursor-pointer flex items-center justify-center gap-2"
          >
            <Settings size={14} className="text-slate-500" />
            <span>Gerir Modelos de IA</span>
          </button>

        </div>

        {/* BOTTOM COL 2: VOLUME DE CONVERSAS (LINE CHART) */}
        <div className="bg-white border border-slate-200 rounded-[24px] p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="space-y-0.5">
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">Frequência e Saturação</span>
                <h2 className="text-sm font-black text-[#0c2340] uppercase tracking-wide">Volume de Conversas</h2>
              </div>
              <div className="flex items-center gap-1 bg-slate-100 border border-slate-200 p-0.5 rounded-lg">
                <button
                  onClick={() => { playInteractionSound('click'); setSelectedRange('7d'); }}
                  className={`px-2 py-1 text-[9px] font-black rounded border-0 cursor-pointer ${selectedRange === '7d' ? 'bg-indigo-600 text-white' : 'bg-transparent text-slate-500'}`}
                >
                  7 Dias
                </button>
                <button
                  onClick={() => { playInteractionSound('click'); setSelectedRange('30d'); }}
                  className={`px-2 py-1 text-[9px] font-black rounded border-0 cursor-pointer ${selectedRange === '30d' ? 'bg-indigo-600 text-white' : 'bg-transparent text-slate-500'}`}
                >
                  Mensal
                </button>
              </div>
            </div>

            {/* Recharts Area Chart depicting beautiful vectors */}
            <div className="h-[180px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={currentChartData} margin={{ top: 10, right: 5, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={9} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={9} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', background: '#FFFFFF', border: '1px solid #e2e8f0', fontSize: '11px', textAlign: 'left' }}
                  />
                  <Area type="monotone" dataKey="volume" stroke="#4f46e5" strokeWidth={2.5} fillOpacity={1} fill="url(#colorVolume)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Metrics under line chart */}
            <div className="grid grid-cols-3 gap-2 border-t border-slate-100 pt-3.5 mt-2">
              <div className="text-left">
                <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider block">Total Periodo</span>
                <span className="text-xs font-black text-slate-800 tracking-tight block mt-0.5">
                  {selectedRange === '7d' ? '145.832' : '355.000'}
                </span>
              </div>
              <div className="text-left">
                <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider block">Média Diária</span>
                <span className="text-xs font-black text-indigo-700 tracking-tight block mt-0.5">
                  {selectedRange === '7d' ? '20.833' : '11.833'}
                </span>
              </div>
              <div className="text-left">
                <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider block">Pico Diário</span>
                <span className="text-xs font-black text-slate-800 tracking-tight block mt-0.5">
                  {selectedRange === '7d' ? '25.680 (06 Jun)' : '32.100 (W4)'}
                </span>
              </div>
            </div>

          </div>

        </div>

        {/* BOTTOM COL 3: TOP TEMAS MAIS CONSULTADOS */}
        <div className="bg-white border border-slate-200 rounded-[24px] p-5 shadow-xs flex flex-col justify-between font-sans">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="space-y-0.5">
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">Assuntos e Tendências</span>
                <h2 className="text-sm font-black text-[#0c2340] uppercase tracking-wide">Top Temas Mais Consultados</h2>
              </div>
              <span className="text-[9px] font-mono bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-md font-bold uppercase">
                Hoje
              </span>
            </div>

            <div className="space-y-3.5 mt-4">
              
              {/* Tema 1 */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-bold text-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] w-5 h-5 rounded-full bg-indigo-50 text-indigo-700 flex items-center justify-center font-extrabold font-mono">1</span>
                    <span>Documentos de Identificação</span>
                  </div>
                  <span>3.245 <span className="text-[10px] text-slate-400 font-normal">(13,2%)</span></span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-600 rounded-full" style={{ width: '13.2%' }} />
                </div>
              </div>

              {/* Tema 2 */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-bold text-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] w-5 h-5 rounded-full bg-indigo-50 text-indigo-700 flex items-center justify-center font-extrabold font-mono">2</span>
                    <span>Processos e Requerimentos</span>
                  </div>
                  <span>2.876 <span className="text-[10px] text-slate-400 font-normal">(11,7%)</span></span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500 rounded-full" style={{ width: '11.7%' }} />
                </div>
              </div>

              {/* Tema 3 */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-bold text-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] w-5 h-5 rounded-full bg-indigo-50 text-indigo-700 flex items-center justify-center font-extrabold font-mono">3</span>
                    <span>Saúde e Serviços</span>
                  </div>
                  <span>2.456 <span className="text-[10px] text-slate-400 font-normal">(10,0%)</span></span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: '10%' }} />
                </div>
              </div>

              {/* Tema 4 */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-bold text-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] w-5 h-5 rounded-full bg-indigo-50 text-indigo-700 flex items-center justify-center font-extrabold font-mono">4</span>
                    <span>Educação e Bolsas</span>
                  </div>
                  <span>2.134 <span className="text-[10px] text-slate-400 font-normal">(8,7%)</span></span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-teal-500 rounded-full" style={{ width: '8.7%' }} />
                </div>
              </div>

              {/* Tema 5 */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-bold text-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] w-5 h-5 rounded-full bg-indigo-50 text-indigo-700 flex items-center justify-center font-extrabold font-mono">5</span>
                    <span>Impostos e Taxas</span>
                  </div>
                  <span>1.987 <span className="text-[10px] text-slate-400 font-normal">(8,1%)</span></span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-slate-500 rounded-full" style={{ width: '8.1%' }} />
                </div>
              </div>

            </div>
          </div>

          <button
            onClick={() => triggerToast('Carregando classificação integral de tópicos...', 'info')}
            className="w-full mt-4 py-3 bg-slate-50 hover:bg-slate-100 text-[#0c2340] border border-slate-200 rounded-[16px] text-xs font-black uppercase tracking-wider transition-all duration-200 cursor-pointer flex items-center justify-center gap-2"
          >
            <span>Ver todos os temas</span>
            <ArrowRight size={14} className="text-slate-400" />
          </button>

        </div>

      </div>

      {/* FOOTER GENERAL SECURITY POLICIES */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-slate-100 border border-slate-200 p-5 rounded-[24px] text-left">
        
        <div className="flex items-start gap-3 bg-white p-4 rounded-xl shadow-3xs border border-slate-150">
          <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-lg shrink-0">
            <ShieldCheck size={20} />
          </div>
          <div>
            <h4 className="text-xs font-black text-[#0c2340] uppercase tracking-wide">Segurança e Privacidade</h4>
            <p className="text-[10px] text-slate-500 mt-1 leading-normal font-semibold">
              Todos os dados são geridos centralmente e tratados em conformidade stricta com a Lei de Proteção de Dados de Angola.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3 bg-white p-4 rounded-xl shadow-3xs border border-slate-150">
          <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-lg shrink-0">
            <Lock size={20} />
          </div>
          <div>
            <h4 className="text-xs font-black text-[#0c2340] uppercase tracking-wide">Encriptação E2E</h4>
            <p className="text-[10px] text-slate-500 mt-1 leading-normal font-semibold">
              Encriptação ativa de ponta a ponta. Todas as comunicações digitais e requisições de documentos são blindadas.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3 bg-white p-4 rounded-xl shadow-3xs border border-slate-150">
          <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg shrink-0">
            <Key size={20} />
          </div>
          <div>
            <h4 className="text-xs font-black text-[#0c2340] uppercase tracking-wide">Acesso Controlado</h4>
            <p className="text-[10px] text-slate-500 mt-1 leading-normal font-semibold">
              Permissões distribuídas e categorizadas estritamente por função administrativa ou perfil institucional.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3 bg-white p-4 rounded-xl shadow-3xs border border-slate-150">
          <div className="p-2.5 bg-[#0c2340]/5 text-[#0c2340] rounded-lg shrink-0">
            <Activity size={20} />
          </div>
          <div>
            <h4 className="text-xs font-black text-[#0c2340] uppercase tracking-wide">Auditoria Completa</h4>
            <p className="text-[10px] text-slate-500 mt-1 leading-normal font-semibold">
              Todos os acessos e transações operativas são integrados e anotados sob logs imutáveis na secção de Auditoria.
            </p>
          </div>
        </div>

      </div>


      {/* MODAL 1: GERIR BASES DE CONHECIMENTO */}
      {isManageKnowledgeOpen && (
        <div className="fixed inset-0 bg-[#0c2340]/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-[24px] max-w-md w-full p-6 shadow-2xl border border-slate-100 text-left space-y-4">
            
            <div className="flex items-center justify-between pb-3 border-b border-gray-150">
              <div className="flex items-center gap-2">
                <Database className="text-indigo-600" size={20} />
                <span className="text-sm font-black text-[#0c2340] uppercase tracking-wider">Nova Base de Conhecimento</span>
              </div>
              <button 
                onClick={() => setIsManageKnowledgeOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer bg-slate-50 rounded-full border-0"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 font-sans">
              
              {/* Form entries */}
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-450 uppercase tracking-wider block">Título da Base de Dados</label>
                <input
                  type="text"
                  placeholder="Ex: Regulamento Interno da AGT..."
                  value={newKbTitle}
                  onChange={(e) => setNewKbTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-xs text-slate-800"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-450 uppercase tracking-wider block">Categoria do Conteúdo</label>
                <select
                  value={newKbType}
                  onChange={(e) => setNewKbType(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-xs text-slate-800 outline-none"
                >
                  <option value="Perguntas Frequentes">Perguntas Frequentes (FAQ)</option>
                  <option value="Procedimento e Instrução">Procedimentos e Portarias</option>
                  <option value="Decreto e Legislação">Leis e Regulamentos Oficiais</option>
                  <option value="Modelos Administrativos">Formulários e Modelos</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-450 uppercase tracking-wider block">Quantidade de Documentos (Estimada)</label>
                <input
                  type="text"
                  placeholder="Ex: 1.500"
                  value={newKbCount}
                  onChange={(e) => setNewKbCount(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-xs text-slate-800 font-mono"
                />
              </div>

              <div className="p-3 bg-indigo-50 text-indigo-800 rounded-xl space-y-1 text-left">
                <span className="text-[10px] font-black block uppercase tracking-wider">⚠️ Processamento Vetorial Automatizado</span>
                <span className="text-[9px] block font-semibold leading-normal">
                  Ao salvar, o sistema fará a leitura e conversão OCR dos ficheiros em chunks semânticos optimizados do assistente de inteligência artificial.
                </span>
              </div>

            </div>

            <div className="flex items-center gap-3 pt-3">
              <button
                onClick={() => setIsManageKnowledgeOpen(false)}
                className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-black uppercase tracking-wider rounded-xl cursor-pointer border-0"
              >
                Voltar
              </button>
              <button
                onClick={handleAddKb}
                className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black uppercase tracking-wider rounded-xl cursor-pointer border-0 shadow-sm"
              >
                Vetorizar e Guardar
              </button>
            </div>

          </div>
        </div>
      )}


      {/* MODAL 2: GERIR/Visualizar Detalhes dos MODELOS DE IA */}
      {isManageModelsOpen && (
        <div className="fixed inset-0 bg-[#0c2340]/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-[24px] max-w-lg w-full p-6 shadow-2xl border border-slate-100 text-left space-y-4">
            
            <div className="flex items-center justify-between pb-3 border-b border-gray-150">
              <div className="flex items-center gap-2">
                <Bot className="text-indigo-600 animate-pulse" size={20} />
                <span className="text-sm font-black text-[#0c2340] uppercase tracking-wider text-left">Federeção dos Modelos LLM</span>
              </div>
              <button 
                onClick={() => setIsManageModelsOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer bg-slate-50 rounded-full border-0"
              >
                ✕
              </button>
            </div>

            <div className="text-xs text-slate-500 font-medium leading-relaxed space-y-3">
              <p>
                O Conselho Digital de Angola possui redundância activa de grandes modelos de linguagem (LMs) para garantir custos escaláveis, zero-latency e conformidade de dados.
              </p>

              <div className="space-y-2 mt-4 max-h-[220px] overflow-y-auto">
                {modelsList.map((m) => (
                  <div key={m.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-slate-800">
                    <div className="text-left font-sans">
                      <span className="text-xs font-black block">{m.name}</span>
                      <span className="text-[9px] text-slate-400 block font-bold uppercase">{m.maker}</span>
                    </div>
                    <div className="text-right flex items-center gap-3 font-sans shrink-0">
                      <div>
                        <span className="text-[9px] font-bold text-slate-500 block">Quota Hoje</span>
                        <span className="text-xs font-mono font-black text-indigo-700 block">{m.share}</span>
                      </div>
                      <button
                        onClick={() => selectActiveModel(m.id, m.name)}
                        className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider cursor-pointer border-0 transition-colors ${
                          m.selected 
                            ? 'bg-emerald-600 text-white' 
                            : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
                        }`}
                      >
                        {m.selected ? 'Activo' : 'Ativar'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-250 text-amber-900 text-[10px] sm:text-[11px] font-semibold leading-relaxed text-left flex items-start gap-2">
                <AlertTriangle size={16} className="text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-extrabold uppercase tracking-wide block">Taxas e Regulação de Tokens</span>
                  <span>O processamento local (Llama 3.1) no servidor central de Luanda é prioritário para dados confidenciais e requisições offline. Motores externos (GPT-4o) utilizam relays encriptados.</span>
                </div>
              </div>

            </div>

            <button
              onClick={() => setIsManageModelsOpen(false)}
              className="w-full py-3 bg-[#0c2340] hover:bg-[#1a3a60] text-white text-xs font-black uppercase tracking-wider rounded-xl cursor-pointer border-0"
            >
              Concluir
            </button>

          </div>
        </div>
      )}


      {/* MODAL 3: TESTAR INTELIGÊNCIA ARTIFICIAL (LIVE CHAT PLAYGROUND) */}
      {isTestModalOpen && (
        <div className="fixed inset-0 bg-[#0c2340]/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn font-sans">
          <div className="bg-white rounded-[28px] max-w-xl w-full p-6 shadow-2xl border border-slate-100 text-left flex flex-col h-[520px]">
            
            {/* Modal header */}
            <div className="flex items-center justify-between pb-3 border-b border-gray-150 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold relative shrink-0">
                  <Bot size={20} />
                  <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full absolute -top-0.5 -right-0.5 border-2 border-white animate-pulse" />
                </div>
                <div className="text-left font-sans">
                  <span className="text-xs font-black text-[#0c2340] block uppercase tracking-wide">Testar Assistente IA</span>
                  <span className="text-[10px] text-slate-400 font-bold block">Canal Federado de Angola • Sandbox Ativa</span>
                </div>
              </div>
              <button 
                onClick={() => {
                  playInteractionSound('click');
                  setIsTestModalOpen(false);
                }}
                className="p-1 px-2 text-slate-400 hover:text-slate-600 cursor-pointer bg-slate-50 rounded-full border-0 text-sm font-black"
              >
                ✕
              </button>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1 text-xs">
              {testMessages.map((msg, i) => (
                <div 
                  key={i} 
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`p-4 rounded-2xl max-w-[85%] text-left line-clamp-none ${
                    msg.sender === 'user'
                      ? 'bg-indigo-600 text-white rounded-tr-none'
                      : 'bg-slate-100 text-slate-800 rounded-tl-none border border-slate-200/50'
                  }`}>
                    <span className="block font-sans select-text">{msg.text}</span>
                  </div>
                </div>
              ))}

              {isAiTyping && (
                <div className="flex justify-start">
                  <div className="p-3 bg-slate-100 text-slate-500 rounded-2xl rounded-tl-none border border-slate-200/50 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    <span className="text-[10px] font-bold">Assistente está a processar vetores...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Quick suggested queries */}
            <div className="pb-3 flex flex-wrap gap-1.5 shrink-0">
              <button 
                onClick={() => { playInteractionSound('click'); setTestInput('Quais os documentos para o NIF?'); }}
                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-[9px] font-black uppercase tracking-wider cursor-pointer border-0"
              >
                requisitos NIF ?
              </button>
              <button 
                onClick={() => { playInteractionSound('click'); setTestInput('Agendamento de Bilhete de Identidade'); }}
                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-[9px] font-black uppercase tracking-wider cursor-pointer border-0"
              >
                Agendar BI ?
              </button>
              <button 
                onClick={() => { playInteractionSound('click'); setTestInput('Vacinas do Ministério da Saúde'); }}
                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-[9px] font-black uppercase tracking-wider cursor-pointer border-0"
              >
                MINSA vacinas ?
              </button>
            </div>

            {/* Input area */}
            <div className="flex gap-2 shrink-0 border-t border-slate-100 pt-3">
              <input
                type="text"
                placeholder="Introduza a sua pergunta operatória..."
                value={testInput}
                onChange={(e) => setTestInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && testInput.trim()) {
                    playInteractionSound('click');
                    const text = testInput;
                    setTestMessages(prev => [...prev, { sender: 'user', text }]);
                    setTestInput('');
                    simulateAiTypingResponse(text);
                  }
                }}
                className="flex-1 bg-slate-50 border border-slate-200 px-4 py-3 text-xs rounded-xl outline-none text-slate-800"
              />
              <button
                onClick={() => {
                  if (!testInput.trim()) return;
                  playInteractionSound('click');
                  const text = testInput;
                  setTestMessages(prev => [...prev, { sender: 'user', text }]);
                  setTestInput('');
                  simulateAiTypingResponse(text);
                }}
                className="px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black uppercase tracking-wider border-0 cursor-pointer"
              >
                Enviar
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
