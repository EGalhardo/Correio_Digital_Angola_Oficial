import React from "react";
import { 
  CheckCircle2, 
  ShieldCheck, 
  History, 
  Settings, 
  Lock, 
  ChevronRight, 
  Users, 
  Smartphone, 
  IdCard, 
  Check 
} from "lucide-react";

import { Contact, Document } from '../../types';

interface CitizenProfileProps {
  userProfilePhoto: string;
  setIsPrefsOpen: (open: boolean) => void;
  setPrefSubTab: (tab: string) => void;
  setIsConfiguringSecurity: (configuring: boolean) => void;
  setTab: (tab: string) => void;
  profileName: string;
  bi: string;
  phone: string;
  email?: string;
  userFiliation?: string;
  contactsList?: Contact[];
  documentsList?: Document[];
  correspondencesCount?: number;
  institutionsCount?: number;
  lastAccess?: string;
}

export const CitizenProfile: React.FC<CitizenProfileProps> = ({
  userProfilePhoto,
  setIsPrefsOpen,
  setPrefSubTab,
  setIsConfiguringSecurity,
  setTab,
  profileName,
  bi,
  phone,
  email,
  userFiliation = 'António Galhardo & Maria Conceição',
  contactsList = [],
  documentsList = [],
  correspondencesCount = 0,
  institutionsCount = 0,
  lastAccess = 'Hoje às 18:45',
}) => {
  const parents = userFiliation ? userFiliation.split('&').map(p => p.trim()) : [];
  const prioritizedContacts = [...contactsList].sort((a, b) => {
    const emergencyBoost = (value?: string) => value === 'Emergência' ? 1 : 0;
    return emergencyBoost(b.type) - emergencyBoost(a.type);
  });
  const fallbackContacts = [
    { name: parents[1] || 'Maria Conceição', relation: 'Familiar (Pai/Mãe)' },
    { name: parents[0] || 'António Galhardo', relation: 'Familiar (Pai/Mãe)' }
  ];
  const visibleContacts = [0, 1].map((index) => {
    const contact = prioritizedContacts[index];
    if (contact) {
      return {
        name: contact.name,
        relation: contact.relation || (contact.type === 'Emergência' ? 'Contacto de Emergência' : 'Contacto Autorizado')
      };
    }
    return fallbackContacts[index];
  });
  const derivedEmail = email || `${profileName.toLowerCase().replace(/\s+/g, '.')}@cidadao.ao`;
  const visibleDocuments = documentsList.length > 0
    ? documentsList.slice(0, 3).map((doc) => ({ name: doc.name, status: 'Activo' }))
    : [
        { name: 'B.I. Digital', status: 'Activo' },
        { name: 'Passaporte Digital', status: 'Activo' },
        { name: 'Carta de Condução', status: 'Activo' }
      ];

  return (
    <section className="space-y-6 text-slate-950 animate-fade-in font-sans">
      
      {/* Header row as seen in screenshot 3 */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-100 pb-5 mb-2 gap-4">
        <div>
          <span className="text-xs uppercase font-bold tracking-widest text-slate-400">Minha Conta</span>
          <h1 className="text-2xl md:text-3xl font-black text-slate-950 tracking-tight">Bem-vindo, {profileName.split(' ')[0]}</h1>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-100 rounded-full text-emerald-700 font-extrabold text-[11px] uppercase tracking-wider">
          <CheckCircle2 size={14} className="text-emerald-600 fill-emerald-100" />
          <span>Conta verificada e activa</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-1 space-y-6 text-left">
          
          {/* Photo Card with profile stats */}
          <div className="bg-white border border-slate-200 rounded-[32px] p-6 flex flex-col items-center text-center relative overflow-hidden shadow-sm">
            <div className="absolute top-0 inset-x-0 h-2 bg-slate-900" />
            
            <div className="relative mt-4 mb-4">
              <div className="w-32 h-32 md:w-36 md:h-36 rounded-[28px] border border-slate-150 p-1 bg-white relative">
                {userProfilePhoto ? (
                  <img 
                    src={userProfilePhoto} 
                    alt={profileName} 
                    className="w-full h-full rounded-[22px] object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : null}
                <div className="absolute -bottom-1 -right-1 text-white p-1.5 rounded-xl border-2 border-white bg-emerald-500 shadow-md">
                  <Check size={16} strokeWidth={3} />
                </div>
              </div>
            </div>

            <h3 className="text-xl font-black text-slate-950 tracking-tight mb-1 uppercase">{profileName}</h3>
            <div className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-[9px] font-black uppercase tracking-wider mb-6 border border-emerald-100">
              <ShieldCheck size={11} className="text-emerald-600" />
              CIDADÃO VERIFICADO
            </div>

            {/* ESTATÍSTICAS DA CONTA */}
            <div className="w-full space-y-4 text-left bg-slate-50/50 rounded-2xl p-4 border border-slate-100">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2 mb-2">Estatísticas da Conta</h4>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 font-medium">Documentos Digitais</span>
                <span className="font-extrabold text-slate-900 bg-white border border-slate-200 px-2 py-0.5 rounded-md">{documentsList.length}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 font-medium">Correspondências</span>
                <span className="font-extrabold text-slate-900 bg-white border border-slate-200 px-2 py-0.5 rounded-md">{correspondencesCount}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 font-medium">Instituições Ligadas</span>
                <span className="font-extrabold text-slate-900 bg-white border border-slate-200 px-2 py-0.5 rounded-md">{institutionsCount}</span>
              </div>
              <div className="flex justify-between items-center text-xs pt-1 border-t border-dashed border-slate-200">
                <span className="text-slate-400 font-medium text-[10px]">Último Acesso</span>
                <span className="font-bold text-slate-600">{lastAccess}</span>
              </div>
            </div>
          </div>

          {/* NÍVEL DE CONFIANÇA */}
          <div className="bg-white border border-slate-200 rounded-[32px] p-6 text-left shadow-sm">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Nível de Confiança</h4>
            
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center border border-emerald-100 shrink-0">
                <ShieldCheck size={24} />
              </div>
              <div>
                <div className="text-2xl font-black text-slate-950 tracking-tight">98%</div>
                <div className="text-[10px] font-black text-emerald-600 uppercase tracking-wider bg-emerald-50 rounded-md px-1.5 py-0.5 w-max">Muito Alto</div>
              </div>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mb-2">
              <div className="bg-emerald-500 h-full rounded-full" style={{ width: '98%' }} />
            </div>
            <p className="text-[11px] text-slate-500 font-semibold italic">A sua identidade digital está protegida pelo sistema de segurança nacional de Angola.</p>
          </div>

          {/* ACTIVIDADE RECENTE LOGS */}
          <div className="bg-white border border-slate-200 rounded-[32px] p-6 text-left shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Actividade Recente</h4>
              <span className="w-2 h-2 rounded-full bg-emerald-505 bg-emerald-500 animate-pulse" />
            </div>

            <div className="space-y-3">
              {[
                { action: 'BI actualizado', desc: 'Ficha civil sincronizada', time: 'Hoje às 10:32', type: 'success' },
                { action: 'Nova correspondência da AGT', desc: 'Notificação electrónica', time: 'Hoje às 09:15', type: 'info' },
                { action: 'Passaporte validado', desc: 'Homologação pelo SME', time: 'Ontem às 16:45', type: 'success' },
                { action: 'Factura da ENDE recebida', desc: 'Pagamento de utilidade integrado', time: 'Ontem às 11:20', type: 'warn' }
              ].map((act, idx) => (
                <div key={idx} className="flex gap-3 items-start text-xs border-b border-slate-50 pb-3 last:border-0 last:pb-0">
                  <div className={`w-2 h-2 rounded-full shrink-0 mt-1.5 ${
                    act.type === 'success' ? 'bg-emerald-500' :
                    act.type === 'warn' ? 'bg-amber-500' : 'bg-blue-500'
                  }`} />
                  <div className="flex-1">
                    <div className="font-extrabold text-slate-800 leading-snug">{act.action}</div>
                    <div className="text-[10px] text-slate-400 font-medium">{act.desc}</div>
                  </div>
                  <span className="text-[9px] font-bold text-slate-400 text-right shrink-0">{act.time}</span>
                </div>
              ))}
            </div>

            <button 
              onClick={() => setTab('historico')}
              className="w-full mt-4 py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all text-slate-700 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <History size={12} />
              Ver Toda Actividade
            </button>
          </div>

        </div>

        {/* Right Column */}
        <div className="lg:col-span-2 space-y-6 text-left">

          {/* INFORMAÇÕES PESSOAIS Card */}
          <div className="bg-white border border-slate-200 rounded-[32px] p-6 md:p-8 space-y-6 text-left shadow-sm">
            <div className="border-b border-slate-100 pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="font-black text-slate-950 text-xl uppercase tracking-tight">Informações Pessoais</h2>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-0.5">Ficha civil do cidadão titular sincronizada nacionalmente</p>
              </div>
              <button 
                onClick={() => {
                  setIsPrefsOpen(true);
                  setPrefSubTab('geral');
                }}
                className="px-4 py-2.5 bg-slate-900 hover:bg-slate-850 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <Settings size={14} />
                Actualizar Informações
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { label: 'Nome Completo', value: profileName, type: 'text' },
                { label: 'B.I. (Nº Bilhete de Identidade)', value: bi, type: 'mono' },
                { label: 'Email Registado', value: derivedEmail, type: 'email', verified: true },
                { label: 'Telemóvel Registado', value: phone, type: 'phone', verified: true },
                { label: 'Morada Residencial', value: 'Rua do Papel, 45, Luanda, Angola', type: 'text', colSpan: 'md:col-span-2' },
                { label: 'Registo do Sistema Central', value: 'Conta criada em: 16 de Junho de 2025', type: 'text', colSpan: 'md:col-span-2', subtle: true }
              ].map((field, index) => (
                <div 
                  key={index}
                  className={`bg-slate-50/50 border border-slate-150 p-4 rounded-2xl flex flex-col justify-center ${field.colSpan || ''}`}
                >
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider mb-1">{field.label}</span>
                  <div className="flex items-center justify-between gap-2">
                    <span className={`text-xs font-bold text-slate-800 ${field.type === 'mono' ? 'font-mono' : ''}`}>
                      {field.value}
                    </span>
                    {field.verified && (
                      <span className="flex items-center gap-1 text-[8px] font-black text-emerald-700 bg-emerald-50 border border-emerald-150 px-1.5 py-0.5 rounded-md uppercase tracking-wider shrink-0">
                        <Check size={10} strokeWidth={3} />
                        Verificado
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bento Grid: 4 Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* 1. SEGURANÇA */}
            <div className="bg-white border border-slate-200 rounded-[32px] p-6 text-left shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2.5 mb-2 border-b border-slate-50 pb-3">
                  <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center shrink-0 border border-orange-100">
                    <Lock size={16} />
                  </div>
                  <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest">Segurança</h4>
                </div>
                
                <div className="divide-y divide-slate-50">
                  {[
                    { title: 'Alterar Palavra-passe', action: () => setIsConfiguringSecurity(true) },
                    { title: 'Activar Autenticação 2FA', action: () => setIsConfiguringSecurity(true) },
                    { title: 'Gerir Sessões Activas', action: () => { setIsPrefsOpen(true); setPrefSubTab('conectividade'); } },
                    { title: 'Dispositivos Ligados', action: () => { setIsPrefsOpen(true); setPrefSubTab('conectividade'); } }
                  ].map((item, idx) => (
                    <button 
                      key={idx}
                      onClick={item.action}
                      className="w-full py-3 flex justify-between items-center text-xs font-bold text-slate-705 hover:text-primary transition-all text-left cursor-pointer"
                    >
                      <span>{item.title}</span>
                      <ChevronRight size={14} className="text-slate-400" />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* 2. CONTACTOS DE EMERGÊNCIA */}
            <div className="bg-white border border-slate-200 rounded-[32px] p-6 text-left shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2.5 mb-2 border-b border-slate-50 pb-3">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-100">
                    <Users size={16} />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest leading-none mb-0.5">Contactos de Emergência</h4>
                    <span className="text-[9px] text-slate-400 font-semibold leading-none">Pessoas de confiança</span>
                  </div>
                </div>

                <div className="space-y-4 py-2">
                  {visibleContacts.map((contact, idx) => (
                    <div key={idx} className="flex justify-between items-center bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      <div>
                        <p className="text-xs font-extrabold text-slate-800">{contact.name}</p>
                        <p className="text-[10px] text-slate-400 font-medium">{contact.relation}</p>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                        <Smartphone size={14} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <button 
                onClick={() => setTab('contatos')}
                className="w-full mt-4 py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all text-slate-700 flex items-center justify-center gap-1 cursor-pointer"
              >
                Gerir Contactos
              </button>
            </div>

            {/* 3. DOCUMENTOS DIGITAIS */}
            <div className="bg-white border border-slate-200 rounded-[32px] p-6 text-left shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2.5 mb-2 border-b border-slate-50 pb-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
                    <IdCard size={16} />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest leading-none mb-0.5">Documentos Digitais</h4>
                    <span className="text-[9px] text-slate-400 font-semibold leading-none">A sua carteira digital</span>
                  </div>
                </div>

                <div className="space-y-2 py-2">
                  {visibleDocuments.map((doc, idx) => (
                    <div key={idx} className="flex justify-between items-center bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-100 text-[11px]">
                      <span className="font-extrabold text-slate-700">{doc.name}</span>
                      <span className="flex items-center gap-1 text-[8px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded-md">
                        <Check size={8} strokeWidth={3} /> {doc.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <button 
                onClick={() => setTab('qr-code')}
                className="w-full mt-4 py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all text-slate-700 flex items-center justify-center gap-1 cursor-pointer"
              >
                Ver QR Code
              </button>
            </div>

            {/* 4. IDENTIDADE DIGITAL */}
            <div className="bg-white border border-slate-200 rounded-[32px] p-6 text-left shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2.5 mb-2 border-b border-slate-50 pb-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
                    <ShieldCheck size={16} />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest leading-none mb-0.5">Identidade Digital</h4>
                    <span className="text-[9px] text-slate-400 font-semibold leading-none">Estado do seu cadastro digital</span>
                  </div>
                </div>

                <div className="space-y-2 py-2">
                  {[
                    { check: true, text: 'Conta Verificada' },
                    { check: true, text: 'BI Validado' },
                    { check: true, text: 'Reconhecimento Facial Activo' },
                    { check: true, text: 'Contacto de Emergência Configurado' }
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs font-bold text-slate-700">
                      <CheckCircle2 size={13} className="text-emerald-500 shrink-0" />
                      <span>{item.text}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-50 flex justify-between items-center">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Nível de Confiança</span>
                <span className="text-xs font-black text-emerald-600">98% (Excelente)</span>
              </div>
            </div>

          </div>
          
        </div>
      </div>
    </section>
  );
};
