/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BadgeCheck, ShieldAlert, Info, X, ExternalLink } from 'lucide-react';
import { AppNotification } from '../../types';
import { useLanguage } from '../../hooks/useLanguage';

interface NotificationDetailModalProps {
  notification: AppNotification | null;
  onClose: () => void;
  onNavigateToTab?: (tab: string) => void;
}

export function NotificationDetailModal({
  notification,
  onClose,
  onNavigateToTab
}: NotificationDetailModalProps) {
  const { t } = useLanguage();

  if (!notification) return null;

  const getTypeStyles = () => {
    switch (notification.type) {
      case 'success':
        return {
          icon: <BadgeCheck size={28} className="text-emerald-600" />,
          bg: 'bg-emerald-50 border-emerald-100',
          titleColor: 'text-emerald-950',
          badgeText: t('Sucesso'),
          badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-200'
        };
      case 'warning':
        return {
          icon: <ShieldAlert size={28} className="text-amber-600" />,
          bg: 'bg-amber-50 border-amber-100',
          titleColor: 'text-amber-950',
          badgeText: t('Alerta'),
          badgeClass: 'bg-amber-100 text-amber-800 border-amber-205'
        };
      case 'info':
      default:
        return {
          icon: <Info size={28} className="text-blue-600" />,
          bg: 'bg-blue-50 border-blue-105',
          titleColor: 'text-blue-950',
          badgeText: t('Informação'),
          badgeClass: 'bg-blue-100 text-blue-800 border-blue-200'
        };
    }
  };

  const styles = getTypeStyles();

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
        {/* Backdrop overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        />

        {/* Modal body */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-md bg-white border border-slate-200 rounded-[32px] shadow-2xl p-6 overflow-hidden z-10"
        >
          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-5 right-5 p-1.5 rounded-full text-slate-400 hover:text-slate-605 hover:bg-slate-100/50 transition-all cursor-pointer"
          >
            <X size={18} />
          </button>

          {/* Icon and Type Header */}
          <div className="flex items-center gap-3.5 mb-5 mt-1">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border shrink-0 ${styles.bg}`}>
              {styles.icon}
            </div>
            <div>
              <span className={`inline-block px-2.5 py-0.5 border text-[8.5px] font-black uppercase tracking-widest rounded-full leading-none ${styles.badgeClass}`}>
                {styles.badgeText}
              </span>
              <span className="block text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest mt-1">
                {t("Sincronizado:")} {notification.time}
              </span>
            </div>
          </div>

          {/* Notification Title & Details */}
          <div className="space-y-4 text-left">
            <h3 className={`text-base md:text-lg font-black uppercase tracking-tight leading-snug ${styles.titleColor}`}>
              {t(notification.title)}
            </h3>
            
            <div className="bg-slate-50 border border-slate-150 rounded-2xl p-4">
              <p className="text-xs md:text-sm text-slate-705 leading-relaxed font-semibold">
                {t(notification.message)}
              </p>
            </div>
          </div>

          {/* Footer Action Buttons */}
          <div className="grid grid-cols-2 gap-3 mt-6 border-t border-slate-100 pt-5">
            <button
              type="button"
              onClick={onClose}
              className="w-full py-3 bg-slate-100 text-slate-700 hover:bg-slate-200 font-black text-[10px] md:text-xs uppercase tracking-widest rounded-2xl transition-all cursor-pointer border-0"
            >
              {t("Fechar")}
            </button>
            <button
              type="button"
              onClick={() => {
                onClose();
                if (onNavigateToTab) {
                  onNavigateToTab(notification.targetTab);
                }
              }}
              className="w-full py-3 bg-slate-950 text-white hover:bg-slate-800 font-black text-[10px] md:text-xs uppercase tracking-widest rounded-2xl transition-all flex items-center justify-center gap-1.5 cursor-pointer border-0 shadow-sm"
            >
              <span>{t("Aceder")}</span>
              <ExternalLink size={13} strokeWidth={2.5} />
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
