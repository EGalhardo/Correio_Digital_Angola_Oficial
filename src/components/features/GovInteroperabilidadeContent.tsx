import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Building2, 
  Plus, 
  Search, 
  MapPin, 
  Users, 
  Mail, 
  Activity, 
  Clock, 
  Cpu, 
  CheckCircle, 
  Power, 
  X, 
  Edit, 
  SlidersHorizontal,
  ChevronDown,
  Trash2,
  Trash,
  Phone,
  User,
  Briefcase,
  Shield,
  UploadCloud
} from 'lucide-react';

import { Institution } from '../../types';
import { useInstitutions } from '../../services/institutionStore';

const MUNICIPALITIES_BY_PROVINCE: { [key: string]: string[] } = {
  'Todas': ['Todos'],
  'Luanda': ['Todos', 'Viana', 'Belas', 'Cazenga', 'Cacuaco', 'Talatona', 'Ingombota', 'Maianga'],
  'Benguela': ['Todos', 'Benguela', 'Lobito', 'Catumbela', 'Baía Farta'],
  'Huíla': ['Todos', 'Lubango', 'Chibia', 'Humpata'],
  'Cabinda': ['Todos', 'Cabinda', 'Cacongo', 'Buco-Zau'],
  'Bengo': ['Todos', 'Dande', 'Ambriz'],
  'Huambo': ['Todos', 'Huambo', 'Bailundo']
};

const CITIES_BY_PROVINCE: { [key: string]: string[] } = {
  'Luanda': ['Luanda (Capital)', 'Talatona', 'Belas', 'Cacuaco', 'Viana'],
  'Benguela': ['Benguela (Capital)', 'Lobito', 'Catumbela', 'Baía Farta'],
  'Huíla': ['Lubango (Capital)', 'Chibia', 'Humpata'],
  'Cabinda': ['Cabinda (Capital)', 'Lândana', 'Buco-Zau'],
  'Bengo': ['Caxito (Capital)', 'Ambriz'],
  'Huambo': ['Huambo (Capital)', 'Bailundo']
};

const COMMUNES_BY_MUNICIPALITY: { [key: string]: string[] } = {
  'Viana': ['Viana Sede', 'Calumbo', 'Estalagem', 'Baia'],
  'Belas': ['Quenguela', 'Barra do Kwanza', 'Cabolombo'],
  'Cazenga': ['Cazenga Sede', 'Hoji ya Henda', 'Tala Hadi'],
  'Cacuaco': ['Cacuaco Sede', 'Kicolo', 'Funda'],
  'Talatona': ['Talatona Sede', 'Benfica', 'Lar do Patriota'],
  'Ingombota': ['Ingombota Sede', 'Patrice Lumumba', 'Maculusso', 'Ilha do Cabo'],
  'Maianga': ['Maianga Sede', 'Cassequel', 'Prenda', 'Rocha Pinto'],
  'Benguela': ['Benguela Sede', 'Zona Comercial'],
  'Lobito': ['Lobito Sede', 'Canata', 'Egito Praia'],
  'Catumbela': ['Catumbela Sede', 'Biópio', 'Gama'],
  'Baía Farta': ['Baía Farta Sede', 'Dombe Grande'],
  'Lubango': ['Lubango Sede', 'Arimba', 'Hoque'],
  'Chibia': ['Chibia Sede', 'Capunda Cavilongo'],
  'Humpata': ['Humpata Sede', 'Neves'],
  'Cabinda': ['Cabinda Sede', 'Malembo', 'Tanto-Zinze'],
  'Cacongo': ['Lândana Sede', 'Massabi'],
  'Buco-Zau': ['Buco-Zau Sede', 'Inhuca'],
  'Dande': ['Caxito Sede', 'Barra do Dande', 'Mabubas'],
  'Ambriz': ['Ambriz Sede', 'Tabi', 'Bela Vista'],
  'Huambo': ['Huambo Sede', 'Calima', 'Chipipa'],
  'Bailundo': ['Bailundo Sede', 'Hengue', 'Lunge']
};

const INSTITUTION_TYPES = [
  'Ministério',
  'Instituto Público',
  'Administração Geral',
  'Serviço de Migração/Segurança',
  'Empresa Pública',
  'Gabinete Provincial',
  'Administração Municipal',
  'Administração Comunal'
];

const mapTypeToCategory = (type: string): 'Finanças' | 'Infraestrutura' | 'Serviços' | 'Segurança' | 'Saúde' | 'Justiça' => {
  if (type === 'Administração Geral') return 'Finanças';
  if (type === 'Empresa Pública') return 'Infraestrutura';
  if (type === 'Serviço de Migração/Segurança') return 'Segurança';
  if (type === 'Ministério') return 'Justiça';
  if (type === 'Instituto Público') return 'Saúde';
  return 'Serviços';
};

const generateSigla = (fullName: string): string => {
  const wordsToSkip = ['de', 'da', 'do', 'das', 'dos', 'e', 'a', 'o', 'para', 'em', 'público', 'pública'];
  const sigla = fullName
    .split(/\s+/)
    .filter(word => {
      const w = word.toLowerCase().replace(/[^a-z0-9áéíóúâêôãõç]/g, '');
      return w && !wordsToSkip.includes(w);
    })
    .map(word => (word[0] || ''))
    .join('')
    .toUpperCase();
  if (sigla.length >= 2) return sigla;
  return fullName.substring(0, 4).toUpperCase();
};

interface GovInteroperabilidadeContentProps {
  onLog?: (action: string, type: 'info' | 'warning' | 'critical' | 'success') => void;
}

export function GovInteroperabilidadeContent({ onLog }: GovInteroperabilidadeContentProps) {
  const { institutions, setInstitutions } = useInstitutions();
  
  // Filtering states
  const [searchTerm, setSearchTerm] = useState('');
  const [filterProvince, setFilterProvince] = useState('Todas');
  const [filterMunicipio, setFilterMunicipio] = useState('Todos');
  const [filterCategory, setFilterCategory] = useState('Todas');
  const [filterStatus, setFilterStatus] = useState('Todos');

  // Modal active states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingInstitution, setEditingInstitution] = useState<Institution | null>(null);
  const [selectedInstHistory, setSelectedInstHistory] = useState<Institution | null>(null);

  // Form states
  const [formName, setFormName] = useState('');
  const [formFullName, setFormFullName] = useState('');
  const [formCategory, setFormCategory] = useState<'Finanças' | 'Infraestrutura' | 'Serviços' | 'Segurança' | 'Saúde' | 'Justiça'>('Finanças');
  const [formTypeInst, setFormTypeInst] = useState('Ministério');
  const [formProvince, setFormProvince] = useState('Luanda');
  const [formCidade, setFormCidade] = useState('Luanda (Capital)');
  const [formMunicipio, setFormMunicipio] = useState('Ingombota');
  const [formComuna, setFormComuna] = useState('Ingombota Sede');
  
  // Custom states matching the design image
  const [formAddress, setFormAddress] = useState('');
  const [formContactEmail, setFormContactEmail] = useState('');
  const [formContactPhone, setFormContactPhone] = useState('');
  const [formResponsibleName, setFormResponsibleName] = useState('');
  const [formResponsibleRole, setFormResponsibleRole] = useState('');
  const [formInstCode, setFormInstCode] = useState('');
  const [formStatusLocal, setFormStatusLocal] = useState<'Ativa' | 'Inativa'>('Ativa');
  const [formLogoFile, setFormLogoFile] = useState<File | null>(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Municipalities options based on selection
  const currentMunicipalities = useMemo(() => {
    return MUNICIPALITIES_BY_PROVINCE[filterProvince] || ['Todos'];
  }, [filterProvince]);

  const formMunicipalities = useMemo(() => {
    return MUNICIPALITIES_BY_PROVINCE[formProvince]?.filter(m => m !== 'Todos') || ['Viana'];
  }, [formProvince]);

  const formCities = useMemo(() => {
    return CITIES_BY_PROVINCE[formProvince] || ['Sede'];
  }, [formProvince]);

  const formCommunes = useMemo(() => {
    return COMMUNES_BY_MUNICIPALITY[formMunicipio] || ['Sede'];
  }, [formMunicipio]);

  // Handle open create modal
  const openCreateModal = () => {
    setFormName('');
    setFormFullName('');
    setFormCategory('Finanças');
    setFormTypeInst('Ministério');
    setFormProvince('Luanda');
    setFormCidade('Luanda (Capital)');
    setFormMunicipio('Ingombota');
    setFormComuna('Ingombota Sede');
    setFormAddress('');
    setFormContactEmail('');
    setFormContactPhone('');
    setFormResponsibleName('');
    setFormResponsibleRole('');
    setFormInstCode('');
    setFormStatusLocal('Ativa');
    setFormLogoFile(null);
    setIsCreateModalOpen(true);
  };

  // Handle open edit modal
  const openEditModal = (inst: Institution) => {
    setEditingInstitution(inst);
    setFormName(inst.name);
    setFormFullName(inst.fullName);
    setFormCategory(inst.category);
    setFormTypeInst(inst.typeInst || 'Ministério');
    setFormProvince(inst.province);
    setFormCidade(inst.cidade || (CITIES_BY_PROVINCE[inst.province] ? CITIES_BY_PROVINCE[inst.province][0] : 'Sede'));
    setFormMunicipio(inst.municipio);
    setFormComuna(inst.comuna || (COMMUNES_BY_MUNICIPALITY[inst.municipio] ? COMMUNES_BY_MUNICIPALITY[inst.municipio][0] : 'Sede'));
    setFormAddress((inst as any).address || '');
    setFormContactEmail((inst as any).contactEmail || `geral@${inst.name.toLowerCase()}.gov.ao`);
    setFormContactPhone((inst as any).contactPhone || '+244 923 000 000');
    setFormResponsibleName((inst as any).responsibleName || 'Dr. António Fernando');
    setFormResponsibleRole((inst as any).responsibleRole || 'Director Geral');
    setFormInstCode((inst as any).instCode || `${inst.name.toUpperCase()}-001`);
    setFormStatusLocal(inst.status);
    setFormLogoFile(null);
  };

  // Save new institution
  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formFullName) return;

    const computedSigla = formName || generateSigla(formFullName);
    const assignedCategory = mapTypeToCategory(formTypeInst);

    const newInst: Institution = {
      id: `inst-${computedSigla.toLowerCase()}-${Math.floor(Math.random() * 900) + 100}`,
      name: computedSigla,
      fullName: formFullName,
      category: assignedCategory,
      province: formProvince,
      municipio: formMunicipio,
      status: formStatusLocal,
      totalCorrespondence: 0,
      totalAgents: Math.floor(Math.random() * 35) + 10,
      lastActivity: "Criado agora",
      responseRate: "100%",
      typeInst: formTypeInst,
      cidade: formCidade,
      comuna: formComuna,
      address: formAddress || "Sede do Orgão",
      registrationDate: new Date().toLocaleDateString('pt-PT'),
      aiUsageRate: "85%",
      performanceScore: "95.2%",
      contactEmail: formContactEmail || `geral@${computedSigla.toLowerCase()}.gov.ao`,
      contactPhone: formContactPhone || "+244 923 000 000",
      responsibleName: formResponsibleName || "Dr. António Fernando",
      responsibleRole: formResponsibleRole || "Director Geral",
      instCode: formInstCode || `${computedSigla.toUpperCase()}-001`,
    };

    setInstitutions([newInst, ...institutions]);
    setIsCreateModalOpen(false);
    if (onLog) onLog(`INSTITUIÇÃO CRIADA: ${newInst.name} (${newInst.fullName})`, 'success');
  };

  // Save changes to institution
  const handleEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingInstitution || !formFullName) return;

    const computedSigla = formName || generateSigla(formFullName);
    const assignedCategory = mapTypeToCategory(formTypeInst);

    setInstitutions(institutions.map(inst => {
      if (inst.id === editingInstitution.id) {
        return {
          ...inst,
          name: computedSigla,
          fullName: formFullName,
          category: assignedCategory,
          province: formProvince,
          municipio: formMunicipio,
          typeInst: formTypeInst,
          cidade: formCidade,
          comuna: formComuna,
          status: formStatusLocal,
          address: formAddress,
          contactEmail: formContactEmail,
          contactPhone: formContactPhone,
          responsibleName: formResponsibleName,
          responsibleRole: formResponsibleRole,
          instCode: formInstCode,
        };
      }
      return inst;
    }));

    setEditingInstitution(null);
    if (onLog) onLog(`INSTITUIÇÃO ATUALIZADA: ${computedSigla}`, 'info');
  };

  // Toggle activation status
  const toggleStatus = (inst: Institution) => {
    const newStatus = inst.status === 'Ativa' ? 'Inativa' : 'Ativa';
    setInstitutions(institutions.map(i => {
      if (i.id === inst.id) {
        return { ...i, status: newStatus };
      }
      return i;
    }));

    if (onLog) onLog(`INSTITUIÇÃO ${newStatus === 'Ativa' ? 'ACTIVADA' : 'DESACTIVADA'}: ${inst.name}`, newStatus === 'Ativa' ? 'success' : 'warning');
  };

  // Toggle status from inside detail dossier
  const handleToggleInsideDossier = () => {
    if (!selectedInstHistory) return;
    const inst = selectedInstHistory;
    const newStatus = inst.status === 'Ativa' ? 'Inativa' : 'Ativa';
    
    setInstitutions(prev => prev.map(i => i.id === inst.id ? { ...i, status: newStatus } : i));
    setSelectedInstHistory(prev => prev ? { ...prev, status: newStatus } : null);

    if (onLog) onLog(`INSTITUIÇÃO ${newStatus === 'Ativa' ? 'ACTIVADA' : 'DESACTIVADA'}: ${inst.name}`, newStatus === 'Ativa' ? 'success' : 'warning');
  };

  // Aggregated analytics/metrics derived from the current set of institutions
  const metrics = useMemo(() => {
    const totalInsts = institutions.length;
    const activeInsts = institutions.filter(i => i.status === 'Ativa').length;
    const totalCorr = institutions.reduce((sum, inst) => sum + inst.totalCorrespondence, 0);
    
    const parsedAiRate = institutions.map(i => parseFloat(i.aiUsageRate || '0'));
    const totalAiRate = parsedAiRate.reduce((sum, val) => sum + val, 0);
    const avgAiUsage = totalInsts > 0 ? (totalAiRate / totalInsts).toFixed(1) : "0";

    const parsedPerf = institutions.map(i => parseFloat(i.performanceScore || i.responseRate || '0'));
    const totalPerf = parsedPerf.reduce((sum, val) => sum + val, 0);
    const avgPerformance = totalInsts > 0 ? (totalPerf / totalInsts).toFixed(1) : "0";

    return {
      totalInsts,
      activeInsts,
      totalCorr,
      avgAiUsage,
      avgPerformance
    };
  }, [institutions]);

  // Main filtered institutions list
  const filteredInstitutions = useMemo(() => {
    return institutions.filter(inst => {
      // Search
      const matchSearch = String(inst.name).toLowerCase().includes(searchTerm.toLowerCase()) ||
                          String(inst.fullName).toLowerCase().includes(searchTerm.toLowerCase());
      if (!matchSearch) return false;

      // Province filter
      if (filterProvince !== 'Todas' && inst.province !== filterProvince) return false;

      // Municipio filter
      if (filterMunicipio !== 'Todos' && inst.municipio !== filterMunicipio) return false;

      // Category filter
      if (filterCategory !== 'Todas' && inst.category !== filterCategory) return false;

      // Status filter
      if (filterStatus !== 'Todos') {
        const targetStatus = filterStatus === 'Ativas' ? 'Ativa' : 'Inativa';
        if (inst.status !== targetStatus) return false;
      }

      return true;
    });
  }, [institutions, searchTerm, filterProvince, filterMunicipio, filterCategory, filterStatus]);

  // Paginated elements
  const paginatedInstitutions = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredInstitutions.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredInstitutions, currentPage]);

  const totalPages = Math.ceil(filteredInstitutions.length / itemsPerPage) || 1;

  // Mocked activity logs for details
  const activityHistory = useMemo(() => [
    { desc: "Credenciais de API sincronizadas com sucesso pelo barramento", time: "Há 5 mins", user: "AGENTE_ADMIN_40" },
    { desc: "Assinatura eletrónica renovada e selada digitalmente", time: "Há 12 mins", user: "AUTORIDADE_SER_SME" },
    { desc: "Tráfego de 1.450 correspondências processadas na fila normal", time: "Há 1 hora", user: "SISTEMA_BOT" },
    { desc: "Auditoria de segurança de chaves realizada pelo Gabinete de Operações", time: "Há 1 dia", user: "GAB_SEG_AUT" }
  ], []);

  return (
    <div className="pb-32 font-sans text-xs">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 py-8 border-b border-slate-100 mb-8 font-sans">
        <div>
          <h1 className="text-xl md:text-3xl font-black text-slate-900 tracking-tighter italic uppercase leading-none font-sans">
            Gestão Institucional
          </h1>
          <div className="text-slate-400 font-black text-[9px] uppercase tracking-widest mt-1.5 flex items-center gap-2 italic">
            <div className="w-1 h-2 bg-indigo-600 rounded-full" />
            Cadastro Administrativo Nacional &bull; Províncias e Ministérios Integrados
          </div>
        </div>

        <button
          onClick={openCreateModal}
          className="px-6 py-3 bg-indigo-950 hover:bg-indigo-900 border border-indigo-950 text-white font-black text-[10px] uppercase tracking-widest rounded-xl shadow-md transition-all shrink-0 cursor-pointer flex items-center gap-2"
        >
          <Plus size={14} strokeWidth={3} /> Registar Instituição
        </button>
      </div>

      {/* Metrics Cards row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {/* Total Instituições */}
        <div className="bg-white border border-slate-200 rounded-[24px] p-5 flex items-center gap-4 shadow-xs select-none">
          <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-[#4f46e5] shrink-0">
            <Building2 size={24} className="stroke-[2.5]" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block leading-none">Instituições Integradas</span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-xl font-black text-slate-800 font-mono leading-none">{metrics.totalInsts}</span>
              <span className="text-[9.5px] font-extrabold text-[#4f46e5]">({metrics.activeInsts} Ativas)</span>
            </div>
            <p className="text-[9.5px] text-slate-450 mt-1 leading-normal font-sans">Unidades operacionais</p>
          </div>
        </div>

        {/* Volume de Correspondência Estatal */}
        <div className="bg-white border border-slate-200 rounded-[24px] p-5 flex items-center gap-4 shadow-xs select-none">
          <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 shrink-0">
            <Mail size={24} className="stroke-[2.5]" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block leading-none">Volume de Correio</span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-xl font-black text-slate-800 font-mono leading-none">{metrics.totalCorr.toLocaleString()}</span>
              <span className="text-[9.5px] text-emerald-600 font-extrabold">+12.4%</span>
            </div>
            <p className="text-[9.5px] text-slate-450 mt-1 leading-normal font-sans">Transações efetuadas</p>
          </div>
        </div>

        {/* Média de Utilização de IA */}
        <div className="bg-white border border-slate-200 rounded-[24px] p-5 flex items-center gap-4 shadow-xs select-none">
          <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600 shrink-0">
            <Cpu size={24} className="stroke-[2.5]" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block leading-none">Utilização de IA</span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-xl font-black text-slate-800 font-mono leading-none">{metrics.avgAiUsage}%</span>
              <span className="text-[9px] text-purple-600 font-black uppercase tracking-wider bg-purple-50 px-1.5 py-0.5 rounded-lg border border-purple-100">Inteligente</span>
            </div>
            <p className="text-[9.5px] text-slate-450 mt-1 leading-normal font-sans">Automação assistida</p>
          </div>
        </div>

        {/* Desempenho Geral do Ecossistema */}
        <div className="bg-white border border-slate-200 rounded-[24px] p-5 flex items-center gap-4 shadow-xs select-none">
          <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600 shrink-0">
            <CheckCircle size={24} className="stroke-[2.5]" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block leading-none">Desempenho Geral</span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-xl font-black text-slate-800 font-mono leading-none">{metrics.avgPerformance}%</span>
              <span className="text-[9.5px] text-amber-600 font-extrabold">SLA</span>
            </div>
            <p className="text-[9.5px] text-slate-450 mt-1 leading-normal font-sans">Taxa de resolução média</p>
          </div>
        </div>
      </div>

      {/* Advanced Filter Box */}
      <div className="bg-white border border-slate-200 rounded-[24px] p-6 mb-8">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-4 mb-4">
          <SlidersHorizontal size={14} className="text-indigo-600" />
          <h3 className="text-[11px] font-black uppercase text-slate-900 tracking-wider">
            Painel Geral de Filtros e Busca
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {/* Search Dropdown replacing input */}
          <div className="space-y-1.5 col-span-1 md:col-span-2">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Localizar Instituição (Sigla/Nome)</label>
            <div className="relative">
              <select
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-[11px] font-bold text-slate-800 outline-none focus:border-slate-850 cursor-pointer appearance-none"
              >
                <option value="">Todas as Instituições</option>
                {institutions.map(inst => (
                  <option key={inst.id} value={inst.name}>{inst.name} - {inst.fullName}</option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                <ChevronDown size={14} />
              </div>
            </div>
          </div>

          {/* Province */}
          <div className="space-y-1.5">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Província</label>
            <select
              value={filterProvince}
              onChange={(e) => {
                setFilterProvince(e.target.value);
                setFilterMunicipio('Todos');
                setCurrentPage(1);
              }}
              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-[11px] font-bold text-slate-700 outline-none focus:border-slate-850 cursor-pointer"
            >
              {Object.keys(MUNICIPALITIES_BY_PROVINCE).map(prov => (
                <option key={prov} value={prov}>{prov === 'Todas' ? 'Todas' : prov}</option>
              ))}
            </select>
          </div>

          {/* Municipio */}
          <div className="space-y-1.5">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Município</label>
            <select
              value={filterMunicipio}
              onChange={(e) => { setFilterMunicipio(e.target.value); setCurrentPage(1); }}
              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-[11px] font-bold text-slate-700 outline-none focus:border-slate-850 cursor-pointer"
              disabled={filterProvince === 'Todas'}
            >
              {currentMunicipalities.map(mun => (
                <option key={mun} value={mun}>{mun}</option>
              ))}
            </select>
          </div>

          {/* Category */}
          <div className="space-y-1.5">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Categoria</label>
            <select
              value={filterCategory}
              onChange={(e) => { setFilterCategory(e.target.value); setCurrentPage(1); }}
              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-[11px] font-bold text-slate-700 outline-none focus:border-slate-850 cursor-pointer"
            >
              <option value="Todas">Todas as Categorias</option>
              <option value="Finanças">Finanças / Tributos</option>
              <option value="Infraestrutura">Infraestrutura</option>
              <option value="Justiça">Justiça</option>
              <option value="Saúde">Saúde</option>
              <option value="Segurança">Segurança</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mt-4 pt-4 border-t border-slate-100">
          <div className="space-y-1.5">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Estado</label>
            <div className="flex gap-2">
              {['Todos', 'Ativas', 'Inativas'].map(st => (
                <button
                  key={st}
                  onClick={() => { setFilterStatus(st); setCurrentPage(1); }}
                  className={`px-4 py-2 border rounded-xl text-[10px] font-black uppercase tracking-wider transition-colors cursor-pointer ${
                    filterStatus === st 
                      ? 'bg-slate-900 border-slate-900 text-white' 
                      : 'bg-white border-slate-200 text-slate-655 hover:bg-slate-50'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Beautiful tabular list layout replacing the card grid */}
      <div className="space-y-6">
        {paginatedInstitutions.length > 0 ? (
          <div className="overflow-x-auto rounded-[24px] bg-white max-h-[600px] border border-slate-200 shadow-xs">
            <table className="mobile-data-table w-full text-left border-collapse text-[10px] md:text-xs">
              <thead className="sticky top-0 z-10 bg-[#0c2340] text-indigo-100 text-[8.5px] md:text-[10px] font-extrabold uppercase tracking-widest border-b border-slate-705">
                <tr>
                  <th className="py-4 px-4 rounded-l-[20px]">Instituição</th>
                  <th className="py-4 px-4">Localização</th>
                  <th className="py-4 px-4">Responsável</th>
                  <th className="py-4 px-4 text-center">Trabalhadores</th>
                  <th className="py-4 px-4 text-center">Correspondência</th>
                  <th className="py-4 px-4 text-center">Utilização da IA</th>
                  <th className="py-4 px-4 text-center">Estado</th>
                  <th className="py-4 px-4 text-center rounded-r-[20px] w-[210px]">Ações</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-100">
                {paginatedInstitutions.map((inst) => (
                  <tr key={inst.id} className="text-[#334155] hover:bg-slate-50/70 transition-all">
                    <td className="py-4 px-4 font-bold text-slate-900">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-950 text-white flex items-center justify-center font-mono font-black text-xs uppercase shadow-sm shrink-0 select-none border border-slate-800">
                          {inst.name.slice(0, 3)}
                        </div>
                        <div className="min-w-0">
                          <span className="font-display font-black text-slate-800 block uppercase leading-none text-xs tracking-tight">{inst.fullName}</span>
                          <span className="text-[10px] text-slate-400 block mt-1.5 font-bold">
                            {inst.name} &bull; <span className="text-[#4f46e5] font-black">{inst.typeInst || inst.category}</span>
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 font-bold text-slate-755">
                      <div className="flex items-center gap-1.5 text-xs">
                        <MapPin size={12} className="text-slate-400 shrink-0" />
                        <span>{inst.province} &bull; {inst.municipio}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      {inst.responsibleName ? (
                        <div>
                          <span className="font-bold text-slate-850 block text-xs leading-none">{inst.responsibleName}</span>
                          <span className="text-[9.5px] text-slate-400 block mt-1 font-semibold">{inst.responsibleRole}</span>
                        </div>
                      ) : (
                        <span className="text-slate-300 italic text-[10px]">Não atribuído</span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-center font-mono font-extrabold text-slate-700 text-xs">
                      {inst.totalAgents}
                    </td>
                    <td className="py-4 px-4 text-center font-mono font-extrabold text-slate-700 text-xs text-nowrap">
                      {inst.totalCorrespondence.toLocaleString()}
                    </td>
                    <td className="py-4 px-4 text-center">
                      <div className="flex flex-col items-center justify-center min-w-[80px]">
                        <span className="font-mono font-black text-[#4f46e5] text-xs">{inst.aiUsageRate || '0%'}</span>
                        <div className="w-12 h-1.5 bg-slate-100 rounded-full mt-1 overflow-hidden">
                          <div 
                            className="h-full bg-[#4f46e5] rounded-full" 
                            style={{ width: inst.aiUsageRate || '0%' }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-black uppercase border tracking-wider shrink-0 select-none ${
                        inst.status === 'Ativa' 
                          ? 'bg-emerald-50 border-emerald-100 text-emerald-700' 
                          : 'bg-rose-50 border-rose-100 text-rose-700'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${inst.status === 'Ativa' ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                        {inst.status === 'Ativa' ? 'Ativa' : 'Suspensa'}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => openEditModal(inst)}
                          className="px-2 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 hover:text-slate-900 rounded-lg text-[9px] font-extrabold uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-1"
                          title="Editar Ficha"
                        >
                          <Edit size={10} className="stroke-[2.5]" />
                          Editar
                        </button>
                        <button
                          onClick={() => setSelectedInstHistory(inst)}
                          className="px-2 py-1.5 bg-indigo-50/50 hover:bg-indigo-50 border border-indigo-100 text-[#4f46e5] rounded-lg text-[9px] font-extrabold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1"
                          title="Dossiê de Desempenho"
                        >
                          <Activity size={10} className="stroke-[2.5]" />
                          Dossiê
                        </button>
                        <button
                          onClick={() => toggleStatus(inst)}
                          className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                            inst.status === 'Ativa'
                              ? 'bg-rose-50 border-rose-100 text-rose-600 hover:bg-rose-100/40'
                              : 'bg-emerald-50 border-emerald-100 text-emerald-600 hover:bg-emerald-100/40'
                          }`}
                          title={inst.status === 'Ativa' ? 'Suspender Instituição' : 'Ativar Instituição'}
                        >
                          <Power size={11} className="stroke-[2.5]" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 bg-white border border-slate-200 rounded-[32px] text-center text-slate-400 italic font-sans shadow-3xs text-xs">
            Nenhuma instituição governamental corresponde aos filtros aplicados.
          </div>
        )}

        {/* Pagination bar */}
        {totalPages > 1 && (
          <div className="bg-white border border-slate-205 rounded-[32px] p-6 flex items-center justify-between text-[11px] font-bold shadow-3xs">
            <span className="text-slate-400">Páginas {currentPage} de {totalPages}</span>
            <div className="flex gap-2">
              <button 
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} 
                disabled={currentPage === 1}
                className="px-3.5 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-650 rounded-xl disabled:opacity-50 transition-colors cursor-pointer"
              >
                Anterior
              </button>
              <button 
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} 
                disabled={currentPage === totalPages}
                className="px-3.5 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-650 rounded-xl disabled:opacity-50 transition-colors cursor-pointer"
              >
                Seguinte
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Creation and Modification Drawer Dialog */}
      <AnimatePresence>
        {(isCreateModalOpen || editingInstitution) && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { setIsCreateModalOpen(false); setEditingInstitution(null); }}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[600]"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[92%] max-w-4xl bg-white rounded-[32px] overflow-hidden shadow-2xl z-[601] border border-slate-100 flex flex-col max-h-[95vh]"
            >
              <div className="bg-[#0b1329] text-white p-6 md:px-10 md:py-6 relative flex-shrink-0 select-none flex items-center gap-4">
                <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center border border-white/20 shrink-0">
                  <Building2 size={22} className="text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base md:text-[23px] font-black uppercase italic tracking-tighter text-white m-0 leading-none mb-1">
                    {editingInstitution ? 'Editar Instituição' : 'Criar Instituição'}
                  </h3>
                  <p className="text-[10px] font-black text-indigo-200/80 uppercase tracking-widest leading-none m-0 mt-1">
                    REGISTE OS DADOS DA NOVA INSTITUIÇÃO NO SISTEMA
                  </p>
                </div>
                <button 
                  onClick={() => { setIsCreateModalOpen(false); setEditingInstitution(null); }}
                  className="absolute right-6 top-6 md:right-10 md:top-7 text-slate-400 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-2 border-none cursor-pointer transition-all flex items-center justify-center w-8 h-8"
                  type="button"
                  title="Fechar"
                >
                  <X size={15} />
                </button>
              </div>

              <form 
                onSubmit={editingInstitution ? handleEdit : handleCreate} 
                className="p-6 md:p-10 space-y-6 overflow-y-auto custom-scrollbar flex-1 text-left"
              >
                
                {/* 1. DADOS INSTITUCIONAIS */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-[#4f46e5]">
                    <Building2 size={15} className="stroke-[2.5]" />
                    <span className="font-extrabold text-[11px] uppercase tracking-widest">Dados Institucionais</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                    {/* NOME INSTITUCIONAL COMPLETO */}
                    <div className="grid gap-1.5 md:col-span-5 text-left">
                      <label className="text-[10px] font-black text-slate-450 uppercase tracking-widest ml-1">Nome Institucional Completo *</label>
                      <input 
                        type="text" 
                        required
                        value={formFullName}
                        onChange={(e) => setFormFullName(e.target.value)}
                        placeholder="Ex: Serviço de Migração e Estrangeiros"
                        className="w-full bg-white border border-slate-200 focus:border-[#4f46e5]/30 focus:ring-1 focus:ring-[#4f46e5]/30 rounded-[14px] px-4 py-3.5 text-xs font-bold text-slate-850 outline-none transition-all placeholder:text-slate-350"
                      />
                    </div>

                    {/* SIGLA INSTITUCIONAL */}
                    <div className="grid gap-1.5 md:col-span-3 text-left">
                      <label className="text-[10px] font-black text-slate-450 uppercase tracking-widest ml-1">Sigla Institucional *</label>
                      <input 
                        type="text" 
                        required
                        value={formName}
                        onChange={(e) => setFormName(e.target.value)}
                        placeholder="Ex: SME"
                        className="w-full bg-white border border-slate-200 focus:border-[#4f46e5]/30 focus:ring-1 focus:ring-[#4f46e5]/30 rounded-[14px] px-4 py-3.5 text-xs font-bold text-slate-855 outline-none transition-all placeholder:text-slate-350"
                      />
                    </div>

                    {/* TIPO DE INSTITUIÇÃO */}
                    <div className="grid gap-1.5 md:col-span-4 text-left">
                      <label className="text-[10px] font-black text-slate-450 uppercase tracking-widest ml-1">Tipo de Instituição *</label>
                      <div className="relative">
                        <select
                          value={formTypeInst}
                          onChange={(e) => setFormTypeInst(e.target.value)}
                          className="w-full bg-white border border-slate-200 focus:border-[#4f46e5]/30 focus:ring-1 focus:ring-[#4f46e5]/30 rounded-[14px] pl-4 pr-10 py-3.5 text-xs font-bold text-slate-850 outline-none appearance-none cursor-pointer transition-all"
                        >
                          <option value="" disabled>Selecione o tipo</option>
                          {INSTITUTION_TYPES.map(type => (
                            <option key={type} value={type}>{type}</option>
                          ))}
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-[9px]">
                          ▼
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t border-dashed border-slate-150" />

                {/* 2. LOCALIZAÇÃO */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-[#4f46e5]">
                    <MapPin size={15} className="stroke-[2.5]" />
                    <span className="font-extrabold text-[11px] uppercase tracking-widest">Localização</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                    {/* PROVÍNCIA */}
                    <div className="grid gap-1.5 md:col-span-4 text-left">
                      <label className="text-[10px] font-black text-slate-455 uppercase tracking-widest ml-1">Província *</label>
                      <div className="relative">
                        <select
                          value={formProvince}
                          onChange={(e) => {
                            const nextProvince = e.target.value;
                            setFormProvince(nextProvince);
                            
                            const list = MUNICIPALITIES_BY_PROVINCE[nextProvince] || [];
                            const nextMuni = list[1] || list[0] || '';
                            setFormMunicipio(nextMuni);

                            const cities = CITIES_BY_PROVINCE[nextProvince] || ['Sede'];
                            setFormCidade(cities[0] || 'Sede');

                            const communes = COMMUNES_BY_MUNICIPALITY[nextMuni] || ['Sede'];
                            setFormComuna(communes[0] || 'Sede');
                          }}
                          className="w-full bg-white border border-slate-200 focus:border-[#4f46e5]/30 focus:ring-1 focus:ring-[#4f46e5]/30 rounded-[14px] pl-4 pr-10 py-3.5 text-xs font-bold text-slate-850 outline-none appearance-none cursor-pointer transition-all"
                        >
                          {Object.keys(MUNICIPALITIES_BY_PROVINCE).filter(p => p !== 'Todas').map(prov => (
                            <option key={prov} value={prov}>{prov}</option>
                          ))}
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-[9px]">
                          ▼
                        </div>
                      </div>
                    </div>

                    {/* CIDADE */}
                    <div className="grid gap-1.5 md:col-span-4 text-left">
                      <label className="text-[10px] font-black text-slate-455 uppercase tracking-widest ml-1">Cidade *</label>
                      <div className="relative">
                        <select
                          value={formCidade}
                          onChange={(e) => setFormCidade(e.target.value)}
                          className="w-full bg-white border border-slate-200 focus:border-[#4f46e5]/30 focus:ring-1 focus:ring-[#4f46e5]/30 rounded-[14px] pl-4 pr-10 py-3.5 text-xs font-bold text-slate-850 outline-none appearance-none cursor-pointer transition-all"
                        >
                          {formCities.map(city => (
                            <option key={city} value={city}>{city}</option>
                          ))}
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-[9px]">
                          ▼
                        </div>
                      </div>
                    </div>

                    {/* MUNICÍPIO */}
                    <div className="grid gap-1.5 md:col-span-4 text-left">
                      <label className="text-[10px] font-black text-slate-455 uppercase tracking-widest ml-1">Município *</label>
                      <div className="relative">
                        <select
                          value={formMunicipio}
                          onChange={(e) => {
                            const nextMuni = e.target.value;
                            setFormMunicipio(nextMuni);
                            
                            const communes = COMMUNES_BY_MUNICIPALITY[nextMuni] || ['Sede'];
                            setFormComuna(communes[0] || 'Sede');
                          }}
                          className="w-full bg-white border border-slate-200 focus:border-[#4f46e5]/30 focus:ring-1 focus:ring-[#4f46e5]/30 rounded-[14px] pl-4 pr-10 py-3.5 text-xs font-bold text-slate-850 outline-none appearance-none cursor-pointer transition-all"
                        >
                          {formMunicipalities.map(m => (
                            <option key={m} value={m}>{m}</option>
                          ))}
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-[9px]">
                          ▼
                        </div>
                      </div>
                    </div>

                    {/* COMUNA */}
                    <div className="grid gap-1.5 md:col-span-4 text-left">
                      <label className="text-[10px] font-black text-slate-455 uppercase tracking-widest ml-1">Comuna *</label>
                      <div className="relative">
                        <select
                          value={formComuna}
                          onChange={(e) => setFormComuna(e.target.value)}
                          className="w-full bg-white border border-slate-200 focus:border-[#4f46e5]/30 focus:ring-1 focus:ring-[#4f46e5]/30 rounded-[14px] pl-4 pr-10 py-3.5 text-xs font-bold text-slate-850 outline-none appearance-none cursor-pointer transition-all"
                        >
                          {formCommunes.map(c => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-[9px]">
                          ▼
                        </div>
                      </div>
                    </div>

                    {/* ENDEREÇO INSTITUCIONAL */}
                    <div className="grid gap-1.5 md:col-span-8 text-left">
                      <label className="text-[10px] font-black text-slate-455 uppercase tracking-widest ml-1">Endereço Institucional</label>
                      <input 
                        type="text" 
                        value={formAddress}
                        onChange={(e) => setFormAddress(e.target.value)}
                        placeholder="Ex: Rua Rainha Ginga nº 120, Luanda"
                        className="w-full bg-white border border-slate-200 focus:border-[#4f46e5]/30 focus:ring-1 focus:ring-[#4f46e5]/30 rounded-[14px] px-4 py-3.5 text-xs font-bold text-slate-850 outline-none transition-all placeholder:text-slate-350"
                      />
                    </div>
                  </div>
                </div>

                <div className="border-t border-dashed border-slate-150" />

                {/* 3. CONTACTOS */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-[#4f46e5]">
                    <Phone size={15} className="stroke-[2.5]" />
                    <span className="font-extrabold text-[11px] uppercase tracking-widest">Contactos</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* EMAIL INSTITUCIONAL */}
                    <div className="grid gap-1.5 text-left">
                      <label className="text-[10px] font-black text-slate-455 uppercase tracking-widest ml-1">Email Institucional *</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                          <Mail size={16} />
                        </span>
                        <input 
                          type="email" 
                          required
                          value={formContactEmail}
                          onChange={(e) => setFormContactEmail(e.target.value)}
                          placeholder="Ex: geral@sme.gov.ao"
                          className="w-full bg-white border border-slate-200 focus:border-[#4f46e5]/30 focus:ring-1 focus:ring-[#4f46e5]/30 rounded-[14px] pl-11 pr-4 py-3.5 text-xs font-bold text-slate-850 outline-none transition-all placeholder:text-slate-350"
                        />
                      </div>
                    </div>

                    {/* TELEFONE INSTITUCIONAL */}
                    <div className="grid gap-1.5 text-left">
                      <label className="text-[10px] font-black text-slate-455 uppercase tracking-widest ml-1">Telefone Institucional *</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                          <Phone size={16} />
                        </span>
                        <input 
                          type="text" 
                          required
                          value={formContactPhone}
                          onChange={(e) => setFormContactPhone(e.target.value)}
                          placeholder="Ex: +244 923 000 000"
                          className="w-full bg-white border border-slate-200 focus:border-[#4f46e5]/30 focus:ring-1 focus:ring-[#4f46e5]/30 rounded-[14px] pl-11 pr-4 py-3.5 text-xs font-bold text-slate-850 outline-none transition-all placeholder:text-slate-350 font-mono"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t border-dashed border-slate-150" />

                {/* 4. RESPONSÁVEL INSTITUCIONAL */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-[#4f46e5]">
                    <User size={15} className="stroke-[2.5]" />
                    <span className="font-extrabold text-[11px] uppercase tracking-widest">Responsável Institucional</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* NOME DO RESPONSÁVEL */}
                    <div className="grid gap-1.5 text-left">
                      <label className="text-[10px] font-black text-slate-455 uppercase tracking-widest ml-1">Nome do Responsável *</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                          <User size={16} />
                        </span>
                        <input 
                          type="text" 
                          required
                          value={formResponsibleName}
                          onChange={(e) => setFormResponsibleName(e.target.value)}
                          placeholder="Ex: Dr. António Fernando"
                          className="w-full bg-white border border-slate-200 focus:border-[#4f46e5]/30 focus:ring-1 focus:ring-[#4f46e5]/30 rounded-[14px] pl-11 pr-4 py-3.5 text-xs font-bold text-slate-850 outline-none transition-all placeholder:text-slate-350"
                        />
                      </div>
                    </div>

                    {/* CARGO DO RESPONSÁVEL */}
                    <div className="grid gap-1.5 text-left">
                      <label className="text-[10px] font-black text-slate-455 uppercase tracking-widest ml-1">Cargo do Responsável *</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                          <Briefcase size={16} />
                        </span>
                        <input 
                          type="text" 
                          required
                          value={formResponsibleRole}
                          onChange={(e) => setFormResponsibleRole(e.target.value)}
                          placeholder="Ex: Ex: Director Geral"
                          className="w-full bg-white border border-slate-200 focus:border-[#4f46e5]/30 focus:ring-1 focus:ring-[#4f46e5]/30 rounded-[14px] pl-11 pr-4 py-3.5 text-xs font-bold text-slate-850 outline-none transition-all placeholder:text-slate-350"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t border-dashed border-slate-150" />

                {/* 5. IDENTIFICAÇÃO E LOGÓTIPO GRID ROW */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                  {/* IDENTIFICAÇÃO (Left Span 5) */}
                  <div className="md:col-span-5 space-y-4">
                    <div className="flex items-center gap-2 text-[#4f46e5]">
                      <Shield size={15} className="stroke-[2.5]" />
                      <span className="font-extrabold text-[11px] uppercase tracking-widest">Identificação no Sistema</span>
                    </div>

                    <div className="grid gap-4">
                      {/* CÓDIGO INSTITUCIONAL */}
                      <div className="grid gap-1.5 text-left">
                        <label className="text-[10px] font-black text-slate-455 uppercase tracking-widest ml-1">Código Institucional *</label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                            <Phone size={16} />
                          </span>
                          <input 
                            type="text" 
                            required
                            value={formInstCode}
                            onChange={(e) => setFormInstCode(e.target.value)}
                            placeholder="Ex: SME-001"
                            className="w-full bg-white border border-slate-200 focus:border-[#4f46e5]/30 focus:ring-1 focus:ring-[#4f46e5]/30 rounded-[14px] pl-11 pr-4 py-3.5 text-xs font-bold text-slate-850 outline-none transition-all placeholder:text-slate-350 font-mono"
                          />
                        </div>
                        <p className="text-[10px] text-slate-400 leading-normal m-0 select-none block text-left font-medium">
                          Identificador único da instituição no sistema.
                        </p>
                      </div>

                      {/* ESTADO DA INSTITUIÇÃO */}
                      <div className="grid gap-1.5 text-left">
                        <label className="text-[10px] font-black text-slate-455 uppercase tracking-widest ml-1">Estado da Instituição *</label>
                        <div className="relative">
                          <select
                            value={formStatusLocal}
                            onChange={(e) => setFormStatusLocal(e.target.value as any)}
                            className="w-full bg-white border border-slate-200 focus:border-[#4f46e5]/30 focus:ring-1 focus:ring-[#4f46e5]/30 rounded-[14px] pl-4 pr-10 py-3.5 text-xs font-bold text-slate-850 outline-none appearance-none cursor-pointer transition-all"
                          >
                            <option value="Ativa">Ativa</option>
                            <option value="Inativa">Inativa</option>
                          </select>
                          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-[9px]">
                            ▼
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* LOGÓTIPO (Right Span 7) */}
                  <div className="md:col-span-7 space-y-4">
                    <div className="flex items-center gap-2 text-[#4f46e5]">
                      <UploadCloud size={15} className="stroke-[2.5]" />
                      <span className="font-extrabold text-[11px] uppercase tracking-widest">Logótipo Institucional</span>
                    </div>

                    <div className="border-2 border-dashed border-slate-200 hover:border-[#4f46e5]/30 rounded-[20px] p-6 text-center transition-all bg-slate-50/10 hover:bg-slate-50/40 flex flex-col items-center justify-center gap-2 cursor-pointer h-[155px] relative">
                      <UploadCloud size={28} className="text-[#4f46e5]" />
                      <p className="text-[11px] text-slate-600 leading-normal m-0 max-w-[200px]">
                        Arraste o logótipo para aqui ou <span className="text-[#4f46e5] font-extrabold underline">clique para selecionar</span>
                      </p>
                      <p className="text-[9px] text-slate-400 leading-normal m-0 select-none">
                        Formatos suportados: PNG, JPG, SVG<br />Tamanho máximo: 2MB
                      </p>
                      <input 
                        type="file"
                        accept=".png,.jpg,.jpeg,.svg"
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setFormLogoFile(file);
                          }
                        }}
                      />
                      {formLogoFile && (
                        <div className="absolute inset-0 bg-white/95 rounded-[20px] flex items-center justify-center p-4 gap-2 border border-emerald-500">
                          <CheckCircle size={18} className="text-emerald-500 shrink-0" />
                          <div className="text-left overflow-hidden">
                            <p className="text-xs font-bold text-slate-800 truncate m-0 max-w-[180px]">{formLogoFile.name}</p>
                            <p className="text-[10px] text-slate-400 m-0">{(formLogoFile.size / 1024).toFixed(1)} KB</p>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); setFormLogoFile(null); }}
                            className="text-red-500 hover:text-red-700 bg-transparent border-0 cursor-pointer ml-auto hover:scale-105 transition-transform"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="border-t border-dashed border-slate-150 pt-2" />

                {/* Actions Row */}
                <div className="pt-2 shrink-0 flex items-center justify-between gap-4">
                  <button
                    type="button"
                    onClick={() => { setIsCreateModalOpen(false); setEditingInstitution(null); }}
                    className="px-6 py-3.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-[20px] font-extrabold text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <X size={15} />
                    Cancelar
                  </button>

                  <button
                    type="submit"
                    className="flex-1 bg-[#4f46e5] hover:bg-[#4338ca] text-white py-3.5 rounded-[20px] font-black text-xs uppercase tracking-widest shadow-xl shadow-[#4f46e5]/15 flex items-center justify-center gap-2.5 transition-all duration-300 cursor-pointer active:scale-98 font-sans border-0"
                  >
                    <CheckCircle size={15} className="stroke-[3]" />
                    {editingInstitution ? 'Guardar Instituição' : 'Criar Instituição'}
                  </button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Interoperability Activity History Modal */}
      <AnimatePresence>
        {selectedInstHistory && (() => {
          const aiUsageVal = parseFloat(selectedInstHistory.aiUsageRate || '80');
          const manualUsageVal = 100 - aiUsageVal;
          
          return (
            <>
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedInstHistory(null)}
                className="fixed inset-0 bg-slate-900/35 backdrop-blur-xs z-[600]"
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[95%] max-w-2xl bg-white rounded-[32px] overflow-hidden shadow-2xl z-[601] border border-slate-100 font-sans"
              >
                {/* Banner Header */}
                <div className="bg-[#0c2340] text-indigo-100 p-6 relative">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center font-mono font-black text-sm uppercase text-white shadow-inner select-none border border-white/10">
                      {selectedInstHistory.name.slice(0, 3)}
                    </div>
                    <div>
                      <span className="text-[10px] font-black tracking-widest uppercase text-indigo-300 block leading-none">
                        Dossiê de Performance & Auditoria Síncrona
                      </span>
                      <h3 className="text-base md:text-lg font-black uppercase tracking-tight text-white mt-1 border-0 leading-none">
                        {selectedInstHistory.fullName}
                      </h3>
                      <p className="text-[10.5px] text-slate-400 font-bold mt-1 block">
                        Código: <span className="font-mono">{selectedInstHistory.instCode || 'N/A'}</span> &bull; {selectedInstHistory.typeInst || selectedInstHistory.category}
                      </p>
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => setSelectedInstHistory(null)}
                    className="absolute right-6 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white border-0 rounded-full p-2.5 cursor-pointer transition-colors"
                  >
                    <X size={14} />
                  </button>
                </div>

                <div className="p-6 md:p-8 space-y-6">
                  {/* Two Columns Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Column 1: Identificação e Contactos */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-1.5 text-[#4f46e5] border-b border-slate-100 pb-1.5">
                        <User size={13} className="stroke-[2.5]" />
                        <span className="font-extrabold text-[10px] uppercase tracking-wider block">Ficha Institucional & Representantes</span>
                      </div>

                      <div className="space-y-3.5 text-[11px] font-medium text-slate-600">
                        <div>
                          <span className="text-[8.5px] font-bold text-slate-400 uppercase tracking-widest block mb-0.5">Responsável Institucional</span>
                          <span className="font-black text-slate-800 block text-xs">{selectedInstHistory.responsibleName || 'Não atribuído'}</span>
                          <span className="text-[10px] text-slate-400 font-bold block mt-0.5">{selectedInstHistory.responsibleRole}</span>
                        </div>

                        <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-50">
                          <div>
                            <span className="text-[8.5px] font-bold text-slate-400 uppercase tracking-widest block mb-0.5">Telefone</span>
                            <span className="font-mono font-extrabold text-slate-750">{selectedInstHistory.contactPhone || '+244 923 000 000'}</span>
                          </div>
                          <div>
                            <span className="text-[8.5px] font-bold text-slate-400 uppercase tracking-widest block mb-0.5">Email Oficial</span>
                            <span className="font-extrabold text-slate-750 truncate block leading-normal" title={selectedInstHistory.contactEmail}>{selectedInstHistory.contactEmail || 'N/A'}</span>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-slate-50">
                          <span className="text-[8.5px] font-bold text-slate-400 uppercase tracking-widest block mb-0.5">Localização da Unidade</span>
                          <div className="flex items-start gap-1 font-bold text-slate-700 leading-normal">
                            <MapPin size={11} className="text-slate-400 shrink-0 mt-0.5" />
                            <span>{selectedInstHistory.province}, {selectedInstHistory.municipio} {selectedInstHistory.comuna ? `(${selectedInstHistory.comuna})` : ''}</span>
                          </div>
                        </div>

                        <div className="flex justify-between items-center bg-slate-50 rounded-xl p-3 border border-slate-100 mt-2">
                          <div>
                            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block leading-none">DATA DE REGISTO</span>
                            <span className="font-mono font-black text-slate-800 text-xs mt-1 block leading-none">{selectedInstHistory.registrationDate || '12/03/2025'}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block leading-none">STATUS DO ECOSSISTEMA</span>
                            <span className={`inline-flex items-center gap-1 mt-1 font-mono font-black text-[9px] uppercase leading-none ${selectedInstHistory.status === 'Ativa' ? 'text-emerald-700' : 'text-rose-700'}`}>
                              <span className={`w-1 h-1 rounded-full ${selectedInstHistory.status === 'Ativa' ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                              {selectedInstHistory.status === 'Ativa' ? 'Ativa' : 'Suspensa'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Column 2: Estatísticas de Processamento & IA */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-1.5 text-[#4f46e5] border-b border-slate-100 pb-1.5">
                        <Cpu size={13} className="stroke-[2.5]" />
                        <span className="font-extrabold text-[10px] uppercase tracking-wider block">Volumetria & Automatização Inteligente</span>
                      </div>

                      <div className="flex justify-between items-center bg-slate-50 p-3.5 border border-slate-100 rounded-xl text-[10px] font-bold gap-4">
                        <div className="space-y-1">
                          <span className="text-[8.5px] font-black text-slate-450 uppercase tracking-widest block leading-none">TRABALHADORES</span>
                          <span className="text-base text-slate-900 font-mono font-black block leading-none">{selectedInstHistory.totalAgents} agentes</span>
                        </div>
                        <div className="space-y-1 text-right">
                          <span className="text-[8.5px] font-black text-slate-455 uppercase tracking-widest block leading-none">SLA DESEMPENHO</span>
                          <span className="text-base text-emerald-600 font-mono font-black block leading-none">{selectedInstHistory.performanceScore || selectedInstHistory.responseRate || '95%'}</span>
                        </div>
                      </div>

                      {/* Minimalist Split Progress Bars showing IA vs Manual */}
                      <div className="bg-slate-50/50 p-3.5 border border-slate-100 rounded-xl space-y-4">
                        {/* IA progress block */}
                        <div>
                          <div className="flex justify-between text-[10px] font-extrabold mb-1">
                            <span className="text-indigo-650 uppercase tracking-wide">Utilização da IA</span>
                            <span className="font-mono text-slate-800">{aiUsageVal}%</span>
                          </div>
                          <div className="h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200/50">
                            <div 
                              className="h-full bg-[#4f46e5] rounded-full transition-all duration-500"
                              style={{ width: `${aiUsageVal}%` }}
                            />
                          </div>
                        </div>

                        {/* Manual progress block */}
                        <div>
                          <div className="flex justify-between text-[10px] font-extrabold mb-1">
                            <span className="text-amber-600 uppercase tracking-wide">Tratamento Manual</span>
                            <span className="font-mono text-slate-800">{manualUsageVal.toFixed(0)}%</span>
                          </div>
                          <div className="h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200/50">
                            <div 
                              className="h-full bg-amber-500 rounded-full transition-all duration-500"
                              style={{ width: `${manualUsageVal}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Timeline activity summary */}
                      <div className="space-y-1">
                        <span className="text-[8.5px] font-black text-slate-400 uppercase tracking-widest block mb-2 leading-none">Último Registo Operacional</span>
                        <div className="p-2.5 bg-slate-50/30 border border-slate-100 rounded-xl relative overflow-hidden text-[10px]">
                          <p className="font-bold text-slate-705 leading-normal">Fluxo de correspondência processado com sucesso pelo barramento seguro nacional.</p>
                          <div className="flex items-center gap-2 mt-1.5 font-mono text-[8.5px] text-slate-400">
                            <span className="font-bold text-[#4f46e5]">AGENTE_AUTOMATED_SISTEMA</span>
                            <span>&bull;</span>
                            <span>{selectedInstHistory.lastActivity}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Footer control panel actions */}
                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-4">
                    <button
                      onClick={handleToggleInsideDossier}
                      className={`px-4.5 py-3 rounded-xl text-[10px] font-extrabold uppercase tracking-widest transition-all cursor-pointer flex items-center gap-2 border leading-none ${
                        selectedInstHistory.status === 'Ativa'
                          ? 'bg-rose-50 hover:bg-rose-100/70 border-rose-100 text-rose-700'
                          : 'bg-emerald-50 hover:bg-emerald-100/70 border-emerald-100 text-emerald-700'
                      }`}
                    >
                      <Power size={11} className="stroke-[2.5]" />
                      {selectedInstHistory.status === 'Ativa' ? 'Suspender Unidade' : 'Ativar Unidade'}
                    </button>

                    <button
                      onClick={() => setSelectedInstHistory(null)}
                      className="px-5 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-extrabold text-[10px] uppercase tracking-widest transition-colors cursor-pointer border-0 leading-none"
                    >
                      Fechar Dossier
                    </button>
                  </div>
                </div>
              </motion.div>
            </>
          );
        })()}
      </AnimatePresence>

    </div>
  );
}
