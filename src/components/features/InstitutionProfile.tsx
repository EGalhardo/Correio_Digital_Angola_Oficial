import React from "react";
import { 
  Settings, 
  Lock, 
  Laptop, 
  Languages, 
  History, 
  Check 
} from "lucide-react";

interface InstitutionProfileProps {
  userProfilePhoto: string;
  setIsPrefsOpen: (open: boolean) => void;
  setPrefSubTab: (tab: string) => void;
  setIsConfiguringSecurity: (configuring: boolean) => void;
  setTab: (tab: string) => void;
  profileName: string;
  nif: string;
  showSensitiveData: boolean;
  phone?: string;
  bi?: string;
  email?: string;
  role?: string;
  department?: string;
  institution?: string;
  lastAccess?: string;
}

export const InstitutionProfile: React.FC<InstitutionProfileProps> = ({
  userProfilePhoto,
  setIsPrefsOpen,
  setPrefSubTab,
  setIsConfiguringSecurity,
  setTab,
  profileName,
  nif,
  showSensitiveData,
  phone = '+244 923 111 222',
  bi = '123456789',
  email,
  role = 'Gestor de Contas Digital',
  department = 'Direcção de Atendimento e Fiscalização Digital',
  institution = 'Administração Geral Tributária (AGT)',
  lastAccess = 'Hoje às 18:45',
}) => {
  const normalizedInstitution = institution || 'Administração Geral Tributária (AGT)';
  const institutionAcronymMatch = normalizedInstitution.match(/\(([^)]+)\)/);
  const institutionAcronym = institutionAcronymMatch?.[1] || normalizedInstitution.split(' ').map(word => word[0]).join('').slice(0, 8).toUpperCase();
  const institutionalDomain = institutionAcronym.toLowerCase() === 'agt' ? 'agt.gov.ao' : `${institutionAcronym.toLowerCase()}.gov.ao`;
  const derivedEmail = email || `${profileName.toLowerCase().replace(/\s+/g, '.')}@${institutionalDomain}`;
  const derivedPersonalEmail = `${profileName.toLowerCase().replace(/\s+/g, '.')}@gmail.com`;

  return (
    <section className="space-y-6 text-slate-950 animate-fade-in font-sans">
      
      {/* Header row as seen in screenshot 2 */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-100 pb-5 mb-2 gap-4">
        <div>
          <span className="text-xs uppercase font-bold tracking-widest text-slate-400">Minha Conta</span>
          <h1 className="text-2xl md:text-3xl font-black text-slate-950 tracking-tight">Perfil do Utilizador</h1>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-0.5">Gerencie suas informações pessoais e preferências de acesso</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-[#f0f4ff] border border-blue-150 rounded-full text-blue-700 font-extrabold text-[11px] uppercase tracking-wider">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-505 bg-emerald-500 animate-pulse" />
          <span>Online & Autenticado</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column */}
        <div className="lg:col-span-1 bg-white border border-slate-200 rounded-[32px] p-6 flex flex-col items-center text-center relative overflow-hidden shadow-sm text-left">
          <div className="absolute top-0 inset-x-0 h-2 bg-slate-900" />
          
          <div className="relative mt-4 mb-4">
            <div className="w-32 h-32 md:w-36 md:h-36 rounded-[28px] border border-slate-150 p-1 bg-white relative">
              <img 
                src={userProfilePhoto} 
                alt={profileName} 
                className="w-full h-full rounded-[22px] object-cover animate-fade-in"
                referrerPolicy="no-referrer"
              />
              <div className="absolute -bottom-1 -right-1 text-white p-1.5 rounded-xl border-2 border-white bg-emerald-500 shadow-md">
                <Check size={16} strokeWidth={3} />
              </div>
            </div>
          </div>

          <h3 className="text-xl font-black text-slate-950 tracking-tight text-center uppercase mb-1">{profileName}</h3>
          <p className="text-[#2563eb] font-extrabold text-[10px] uppercase text-center tracking-wider mb-2 leading-none">{role}</p>
          
          <div className="inline-flex mx-auto items-center gap-1 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-[9px] font-black uppercase tracking-wider mb-6 border border-emerald-100">
            <Check size={10} strokeWidth={3} />
            Conta Ativa
          </div>

          <div className="w-full border-t border-slate-100 my-2" />

          {/* Utilizador details stack */}
          <div className="w-full space-y-4 text-left p-2">
            {[
              { label: 'ID do Utilizador', value: `CDA-${institutionAcronym}-2026-${bi.slice(-4)}`, type: 'mono' },
              { label: 'Departamento', value: department, type: 'text' },
              { label: 'Cargo Oficial', value: role, type: 'text' },
              { label: 'Email Institucional', value: derivedEmail, type: 'text' },
              { label: 'Telefone do Estado', value: phone, type: 'mono' },
              { label: 'Data de Adesão', value: '12 de Março de 2024', type: 'text' },
              { label: 'Último Acesso', value: lastAccess, type: 'text', bold: true }
            ].map((detail, idx) => (
              <div key={idx} className="border-b border-slate-50 pb-2.5 last:border-0 last:pb-0">
                <span className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{detail.label}</span>
                <span className={`text-[11px] block font-bold ${detail.bold ? 'text-[#2563eb]' : 'text-slate-800'} ${detail.type === 'mono' ? 'font-mono' : ''}`}>
                  {detail.value}
                </span>
              </div>
            ))}
          </div>

          <button 
            onClick={() => {
              setIsPrefsOpen(true);
              setPrefSubTab('geral');
            }}
            className="w-full mt-4 py-3 bg-slate-900 border border-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-850 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm shadow-slate-900/10"
          >
            <Settings size={13} />
            Editar Perfil
          </button>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-2 space-y-6 text-left">
          
          {/* INFORMAÇÕES DA CONTA */}
          <div className="bg-white border border-slate-200 rounded-[32px] p-6 md:p-8 space-y-6 shadow-sm">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="font-black text-slate-950 text-xl uppercase tracking-tight">Informações da Conta</h3>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-0.5">Credenciais funcionais e sector público</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { label: 'Nome Completo', value: profileName },
                { label: 'Função no Sistema', value: role },
                { label: 'Nível de Acesso', value: 'Padrão', highlight: true },
                { label: 'Perfil de Permissões', value: 'Operacional' },
                { label: 'Instituição Sincronizada', value: institution, colSpan: 'md:col-span-2' },
                { label: 'Departamento / Repartição', value: department, colSpan: 'md:col-span-2' },
                { label: 'Email Alternativo (Pessoal)', value: derivedPersonalEmail },
                { label: 'Telefone Pessoal', value: phone }
              ].map((field, idx) => (
                <div key={idx} className={`bg-slate-50/50 border border-slate-150 p-4 rounded-2xl flex flex-col justify-center ${field.colSpan || ''}`}>
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider mb-1">{field.label}</span>
                  <div className="flex items-center gap-2">
                    {field.highlight ? (
                      <span className="text-xs font-black bg-blue-100 text-blue-800 border border-blue-200 px-2 py-0.5 rounded-md uppercase tracking-wider">
                        {field.value}
                      </span>
                    ) : (
                      <span className="text-xs font-bold text-slate-800">
                        {field.value}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 3 Lower Bento Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* A. SEGURANÇA DA CONTA */}
            <div className="bg-white border border-slate-200 rounded-[32px] p-6 text-left shadow-sm flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-50 pb-3">
                  <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center shrink-0 border border-orange-100">
                    <Lock size={15} />
                  </div>
                  <div>
                    <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-widest leading-none">Segurança da Conta</h4>
                  </div>
                </div>

                <div className="space-y-2 text-[11px]">
                  <div className="flex justify-between py-1 border-b border-slate-50">
                    <span className="text-slate-500 font-medium">Autenticação 2FA</span>
                    <span className="font-extrabold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 border border-emerald-100 rounded-md">Ativo</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-50">
                    <span className="text-slate-500 font-medium">Dispositivos Ligados</span>
                    <span className="font-bold text-slate-800">3 dispositivos</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500 font-medium">Sessões Ativas</span>
                    <span className="font-bold text-slate-800">1 sessão</span>
                  </div>
                </div>
              </div>

              <button 
                onClick={() => setIsConfiguringSecurity(true)}
                className="w-full mt-4 py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all text-slate-700 flex items-center justify-center gap-1 cursor-pointer"
              >
                Alterar Senha & 2FA
              </button>
            </div>

            {/* B. DISPOSITIVOS E ACESSOS */}
            <div className="bg-white border border-slate-200 rounded-[32px] p-6 text-left shadow-sm flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-50 pb-3">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-100">
                    <Laptop size={15} />
                  </div>
                  <div>
                    <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-widest leading-none">Dispositivos</h4>
                  </div>
                </div>

                <div className="space-y-2 text-[10px]">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-slate-800">Windows &bull; Chrome</span>
                    <span className="text-[8px] font-black uppercase text-emerald-700 bg-emerald-50 px-1 rounded">Atual</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-700">Android &bull; Chrome</span>
                    <span className="text-slate-400">Ativo</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-slate-500">iPhone &bull; Safari</span>
                    <span className="text-slate-400">Inativo</span>
                  </div>
                </div>
              </div>

              <button 
                onClick={() => { setIsPrefsOpen(true); setPrefSubTab('conectividade'); }}
                className="w-full mt-4 py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all text-slate-700 flex items-center justify-center gap-1 cursor-pointer"
              >
                Gerir Dispositivos
              </button>
            </div>

            {/* C. PREFERÊNCIAS */}
            <div className="bg-white border border-slate-200 rounded-[32px] p-6 text-left shadow-sm flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-50 pb-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
                    <Languages size={15} />
                  </div>
                  <div>
                    <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-widest leading-none">Preferências</h4>
                  </div>
                </div>

                <div className="space-y-2 text-[11px]">
                  <div className="flex justify-between pb-1 border-b border-slate-50">
                    <span className="text-slate-500 font-medium">Idioma</span>
                    <span className="font-bold text-slate-800">Português</span>
                  </div>
                  <div className="flex justify-between pb-1 border-b border-slate-50">
                    <span className="text-slate-500 font-medium">Notificações</span>
                    <span className="font-extrabold text-emerald-600">Ativas</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Tema</span>
                    <span className="font-bold text-slate-600">Claro</span>
                  </div>
                </div>
              </div>

              <button 
                onClick={() => { setIsPrefsOpen(true); setPrefSubTab('geral'); }}
                className="w-full mt-4 py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all text-slate-700 flex items-center justify-center gap-1 cursor-pointer"
              >
                Gerir Preferências
              </button>
            </div>

          </div>

          {/* ATIVIDADE RECENTE NA CONTA */}
          <div className="bg-white border border-slate-200 rounded-[32px] p-6 md:p-8 text-left shadow-sm space-y-4">
            <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
              <div>
                <h3 className="font-black text-slate-950 text-sm uppercase tracking-widest">Atividade Recente na Conta</h3>
              </div>
              <span className="w-2.5 h-2.5 rounded-full bg-[#2563eb] shrink-0" />
            </div>

            <div className="overflow-x-auto">
              <table className="mobile-data-table w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 font-black text-slate-400 uppercase tracking-wider text-[9px]">
                    <th className="py-3 pr-4">Actividade</th>
                    <th className="py-3 px-4">Dispositivo</th>
                    <th className="py-3 px-4">Data & Local</th>
                    <th className="py-3 pl-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 font-medium text-slate-700">
                  <tr>
                    <td className="py-3.5 pr-4 font-bold text-slate-900">Login no sistema</td>
                    <td className="py-3.5 px-4 font-mono text-[11px]">Windows &bull; Chrome</td>
                    <td className="py-3.5 px-4">Hoje às 18:45 &bull; Luanda, AO</td>
                    <td className="py-3.5 pl-4 text-right">
                      <span className="text-[9px] font-black bg-emerald-50 text-emerald-700 border border-emerald-100 px-2 py-0.5 rounded-md uppercase">Sucesso</span>
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3.5 pr-4 font-bold text-slate-900">Visualização de correspondência</td>
                    <td className="py-3.5 px-4 font-mono text-[11px]">Windows &bull; Chrome</td>
                    <td className="py-3.5 px-4">Hoje às 16:30 &bull; Protocolo: CD-2026-0001254</td>
                    <td className="py-3.5 pl-4 text-right">
                      <span className="text-[9px] font-black bg-emerald-50 text-emerald-700 border border-emerald-100 px-2 py-0.5 rounded-md uppercase">Sucesso</span>
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3.5 pr-4 font-bold text-slate-900">Download de documento</td>
                    <td className="py-3.5 px-4 font-mono text-[11px]">Windows &bull; Chrome</td>
                    <td className="py-3.5 px-4">Hoje às 15:10 &bull; Alvará da instituição</td>
                    <td className="py-3.5 pl-4 text-right">
                      <span className="text-[9px] font-black bg-emerald-50 text-emerald-700 border border-emerald-100 px-2 py-0.5 rounded-md uppercase">Sucesso</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <button 
              onClick={() => setTab('historico')}
              className="w-full mt-4 py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all text-slate-700 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <History size={12} />
              Ver Toda Atividade
            </button>
          </div>

        </div>
      </div>
    </section>
  );
};
