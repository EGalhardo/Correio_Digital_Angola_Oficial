/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Users, Plus, Search, ShieldCheck, Trash2, Info, Edit, User, CreditCard, CheckCircle, X, Check, Bell } from 'lucide-react';
import { Contact } from '../../types';

interface ContactsContentProps {
  contacts: Contact[];
  filteredContacts: Contact[];
  searchContact: string;
  setSearchContact: (search: string) => void;
  setIsAddingContact: (isAdding: boolean) => void;
  setContactToDelete: (contact: Contact) => void;
  onUpdateContactType?: (id: number, newType: 'Normal' | 'Emergência') => void;
}

export function ContactsContent({
  contacts,
  filteredContacts,
  searchContact,
  setSearchContact,
  setIsAddingContact,
  setContactToDelete,
  onUpdateContactType,
}: ContactsContentProps) {
  const [selectedClassification, setSelectedClassification] = useState<'Todos' | 'Emergência' | 'Normal'>('Todos');
  const [editingContact, setEditingContact] = useState<Contact | null>(null);

  const handleUpdateProtocol = (type: 'Normal' | 'Emergência') => {
    if (editingContact && onUpdateContactType) {
      onUpdateContactType(editingContact.id, type);
      setEditingContact({ ...editingContact, type });
    }
  };

  const finalContacts = filteredContacts.filter(contact => {
    if (selectedClassification === 'Todos') return true;
    const type = contact.type || 'Normal';
    return type === selectedClassification;
  });
  return (
    <section className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
            <Users size={24} />
          </div>
          <div>
            <h3 className="text-lg md:text-2xl font-black text-primary leading-tight">Círculo de Confiança</h3>
            <p className="text-[10px] md:text-sm text-slate-800 font-black uppercase tracking-widest">{contacts.length} Contactos Registados</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setIsAddingContact(true)}
            className="bg-primary text-white rounded-2xl px-4 md:px-6 py-3 md:py-3.5 flex items-center justify-center gap-2.5 md:gap-3 shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all text-xs md:text-sm font-black"
          >
            <Plus size={18} className="md:w-5 md:h-5" />
            Adicionar
          </button>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-[32px] p-2 shadow-sm flex flex-col md:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={16} />
          <input 
            type="text"
            placeholder="Pesquisar no círculo de confiança..."
            value={searchContact}
            onChange={(e) => setSearchContact(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-2xl pl-12 pr-4 py-3 md:py-3.5 text-xs md:text-sm font-bold text-slate-900 focus:ring-4 focus:ring-primary/5 focus:bg-white focus:border-primary/20 transition-all outline-none placeholder:text-slate-500"
          />
        </div>
        <div className="hidden lg:flex items-center gap-2 px-4 py-1 border-l border-slate-200 text-slate-600">
          <ShieldCheck size={16} />
          <span className="text-[10px] font-black uppercase tracking-widest">Protocolo Familiar Activo</span>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-[32px] p-6 md:p-8 shadow-sm space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 pb-6 border-b border-slate-100">
          <div>
            <h4 className="font-black text-slate-900 text-lg md:text-xl italic uppercase tracking-tight flex items-center gap-2">
              <Users size={20} className="text-primary" />
              Círculo de Confiança: Registos Autorizados
            </h4>
            <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider mt-1">
              Lista autenticada de familiares, dependentes e contactos oficiais sincronizados
            </p>
          </div>

          {/* Tabbar para filtro de classificação */}
          <div className="flex bg-white p-1 rounded-2xl border border-slate-250 self-start lg:self-center shrink-0 shadow-3xs">
            {(['Todos', 'Emergência', 'Normal'] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setSelectedClassification(tab)}
                className={`relative px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                  selectedClassification === tab
                    ? tab === 'Emergência'
                      ? 'bg-red-600 text-white shadow-sm'
                      : 'bg-primary text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {finalContacts.length > 0 ? (
          <div className="overflow-auto rounded-[24px] border border-slate-100 bg-slate-50/20 custom-scrollbar max-h-[500px]">
            <table className="mobile-data-table w-full text-left border-collapse min-w-[700px]">
              <thead className="sticky top-0 z-10 bg-primary">
                <tr className="bg-primary text-white text-[10px] font-black uppercase tracking-wider">
                  <th className="py-4 px-5 rounded-l-2xl">Contacto / Relação</th>
                  <th className="py-4 px-5">Identidade BI</th>
                  <th className="py-4 px-5">Vínculo Família</th>
                  <th className="py-4 px-5">Estado de Vínculo</th>
                  <th className="py-4 px-5 text-center rounded-r-2xl">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <AnimatePresence mode="popLayout">
                  {finalContacts.map((contact, index) => (
                    <motion.tr 
                      layout
                      key={contact.id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      transition={{ delay: index * 0.03 }}
                      className="text-xs text-slate-800 hover:bg-slate-50/70 transition-colors"
                    >
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-primary font-black text-sm border border-slate-200 shadow-3xs uppercase">
                            {(() => {
                              const initials = (contact?.name || 'C').split(' ').map((n: string) => n?.[0] || '').join('').substring(0, 2);
                              return (initials === 'MD' || initials === 'md') ? (
                                <Users size={16} className="text-primary" />
                              ) : (
                                initials
                              );
                            })()}
                          </div>
                          <div>
                            <span className="font-extrabold text-slate-900 text-sm block uppercase italic tracking-tight">{contact.name}</span>
                            <span className="text-[9px] font-black text-slate-450 uppercase tracking-widest block mt-0.5">{contact.relation}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-5 font-mono font-bold text-slate-700 tracking-wider">
                        {contact.bi}
                      </td>
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-1.5 text-indigo-705 font-mono text-[9px] font-black mb-1 border-b border-indigo-50 pb-0.5 max-w-[120px]">
                          <ShieldCheck size={11} className="text-indigo-500" />
                          <span>Protocolo Activo</span>
                        </div>
                        <div className="inline-flex mt-1">
                          {(contact.type || 'Normal') === 'Emergência' ? (
                            <span className="px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest bg-red-50 text-red-700 border border-red-200 shadow-3xs">
                              Emergência
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-3xs">
                              Normal
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-5">
                        <span className={`inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-wider ${
                          contact.status === 'Confirmado' 
                            ? 'text-emerald-600' 
                            : 'text-orange-700'
                        }`}>
                          {contact.status}
                        </span>
                      </td>
                      <td className="py-4 px-5 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button 
                            onClick={() => setEditingContact(contact)}
                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all border-0 bg-transparent cursor-pointer"
                            title="Editar contacto e protocolo"
                          >
                            <Edit size={14} />
                          </button>
                          <button 
                            onClick={() => setContactToDelete(contact)}
                            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all border-0 bg-transparent cursor-pointer"
                            title="Remover contacto"
                          >
                            <Trash2 size={14} />
                          </button>
                          <button 
                            onClick={() => setEditingContact(contact)}
                            className="p-2 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-xl transition-all border-0 bg-transparent cursor-pointer"
                            title="Informações de Vínculo"
                          >
                            <Info size={14} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-12 md:py-20 text-center bg-slate-50 border-2 border-dashed border-slate-200 rounded-[32px] md:rounded-[40px] space-y-3 md:space-y-4">
            <div className="w-16 h-16 md:w-20 md:h-20 bg-white rounded-full flex items-center justify-center mx-auto shadow-sm text-slate-200">
              <Users size={32} className="md:w-10 md:h-10" />
            </div>
            <div>
              <h4 className="text-base md:text-lg font-black text-slate-400">Sem contactos à vista</h4>
              <p className="text-xs md:text-sm text-slate-400 font-medium">
                {searchContact 
                  ? `Nenhum resultado para "${searchContact}"` 
                  : selectedClassification !== 'Todos'
                    ? `Nenhum contacto classificado como "${selectedClassification}" encontrado.`
                    : 'Comece a construir o seu círculo de confiança digital.'}
              </p>
            </div>
            {searchContact && (
              <button 
                onClick={() => setSearchContact('')}
                className="text-primary font-black text-[10px] md:text-xs uppercase tracking-widest hover:underline"
              >
                Limpar Pesquisa
              </button>
            )}
          </div>
        )}
      </div>

      <AnimatePresence>
        {editingContact && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-[28px] p-6 md:p-8 max-w-md w-full shadow-2xl border border-slate-100 space-y-6 text-left"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-4 relative">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100 shadow-sm">
                    <Edit size={18} className="text-blue-600" />
                  </div>
                  <div>
                    <h2 className="font-black text-[#0c2340] text-base md:text-lg uppercase tracking-tight leading-none italic">Editar Contacto</h2>
                    <p className="text-[10px] text-blue-600 font-extrabold uppercase tracking-widest mt-1">Vínculo de Confiança</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setEditingContact(null)}
                  className="p-1.5 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-700 transition-colors border-0 bg-transparent cursor-pointer"
                  aria-label="Fechar"
                >
                  <X size={18} />
                </button>
              </div>

              {/* General Contact Info / Contacto de Confiança */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-indigo-700 font-bold uppercase tracking-wider text-xs">
                  <User size={16} />
                  <span>Contacto de Confiança</span>
                </div>

                <div className="flex items-center gap-4 bg-slate-50/55 p-4 rounded-2xl border border-slate-100">
                  <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-800 font-black flex items-center justify-center text-base uppercase tracking-wider shadow-inner shrink-0">
                    {(() => {
                      const names = editingContact.name?.split(' ') || [];
                      if (names.length >= 2) {
                        return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
                      }
                      return (editingContact.name?.substring(0, 2) || 'CO').toUpperCase();
                    })()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <span id="contact-name" className="block text-sm font-black text-slate-900 uppercase tracking-tight truncate">
                      {editingContact.name}
                    </span>
                    <span className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-widest mt-0.5">
                      Relação: {editingContact.relation}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white p-3.5 rounded-2xl border border-slate-200">
                    <small className="block text-[8.5px] font-black text-slate-400 uppercase tracking-wider mb-1.5">Cédula / Identidade BI</small>
                    <div className="flex items-center gap-1.5">
                      <CreditCard size={12} className="text-slate-400" />
                      <span className="font-mono text-[11px] font-bold text-slate-800 tracking-wider block shrink-0">{editingContact.bi}</span>
                    </div>
                  </div>
                  <div className="bg-white p-3.5 rounded-2xl border border-slate-200">
                    <small className="block text-[8.5px] font-black text-slate-400 uppercase tracking-wider mb-1.5">Estado do Vínculo</small>
                    <div className="flex items-center gap-1">
                      <CheckCircle size={13} className="text-[#10b981]" />
                      <span className="text-[10px] font-black block uppercase tracking-wide text-[#10b981]">
                        {editingContact.status || 'Confirmado'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Switch active protocol */}
                <div className="space-y-2 pt-2">
                  <div className="flex items-center gap-2 text-indigo-700 font-bold uppercase tracking-wider text-xs">
                    <ShieldCheck size={16} />
                    <span>Protocolo Activo de Comunicação</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3.5">
                    {(['Normal', 'Emergência'] as const).map((t) => {
                      const isCurrent = (editingContact.type || 'Normal') === t;
                      return (
                        <button
                          key={t}
                          type="button"
                          onClick={() => handleUpdateProtocol(t)}
                          className={`flex flex-col items-center justify-center p-3.5 rounded-2xl border gap-1.5 transition-all cursor-pointer ${
                            isCurrent
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300 ring-4 ring-emerald-50/50 font-black'
                              : 'bg-white text-slate-450 border-slate-200 hover:text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <ShieldCheck size={16} className={isCurrent ? 'text-emerald-500' : 'text-slate-300'} />
                          <span className="text-[10px] uppercase font-black tracking-widest">{t}</span>
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-[10px] text-slate-500 italic font-semibold mt-1.5 leading-normal pl-1">
                    * O protocolo regulamenta canais de transmissão prioritária de dados e notificações urgentes no âmbito estatal.
                  </p>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingContact(null)}
                  className="flex-1 bg-white border border-slate-200 text-slate-700 py-3.5 rounded-full font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 cursor-pointer hover:bg-slate-50 transition-all"
                >
                  <X size={14} />
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={() => setEditingContact(null)}
                  className="flex-[2] bg-[#0c2340] hover:bg-[#152e4d] text-white py-3.5 rounded-full font-black text-xs uppercase tracking-widest shadow-lg flex items-center justify-center gap-2.5 transition-all duration-300 cursor-pointer active:scale-98"
                >
                  <Check size={14} />
                  Confirmar e Fechar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
