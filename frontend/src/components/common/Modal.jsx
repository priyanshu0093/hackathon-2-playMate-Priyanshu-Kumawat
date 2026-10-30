import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

export const Modal = ({ isOpen, onClose, title, subtitle, children, maxWidth = 'max-w-xl' }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-[#172338]/60 backdrop-blur-xs"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className={`relative w-full ${maxWidth} bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl shadow-2xl border border-[#E5EDF7] dark:border-slate-800 overflow-hidden my-auto z-10`}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 sm:px-6 pt-4 sm:pt-6 pb-3 sm:pb-4 border-b border-[#E5EDF7] dark:border-slate-800">
              <div className="min-w-0 pr-2">
                <h3 className="text-lg sm:text-xl font-bold text-[#172338] dark:text-white truncate">{title}</h3>
                {subtitle && <p className="text-xs text-[#687587] dark:text-slate-400 mt-0.5 truncate">{subtitle}</p>}
              </div>
              <button
                onClick={onClose}
                className="min-w-[40px] min-h-[40px] p-2 text-[#687587] dark:text-slate-400 hover:text-[#172338] dark:hover:text-white hover:bg-[#F1F5F9] dark:hover:bg-slate-800 rounded-full transition-colors flex items-center justify-center cursor-pointer shrink-0"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-4 sm:p-6 max-h-[calc(85vh-70px)] sm:max-h-[75vh] overflow-y-auto">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
