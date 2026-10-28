import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const Toast = () => {
  const { toast } = useApp();

  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -15, scale: 0.95 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="fixed top-5 right-5 z-50 max-w-md w-full bg-white rounded-2xl shadow-2xl border border-[#E5EDF7] p-4 flex items-start gap-3.5 backdrop-blur-md"
        >
          <div className="shrink-0 mt-0.5">
            {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-[#20B486]" />}
            {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-red-500" />}
            {toast.type === 'info' && <Info className="w-5 h-5 text-[#2F80ED]" />}
          </div>

          <div className="flex-1 pr-2">
            <h4 className="text-sm font-semibold text-[#172338]">{toast.title}</h4>
            <p className="text-xs text-[#687587] mt-0.5 leading-relaxed">{toast.message}</p>
          </div>

          <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#D9EAFE] overflow-hidden rounded-b-2xl">
            <motion.div
              initial={{ width: '100%' }}
              animate={{ width: '0%' }}
              transition={{ duration: 4, ease: 'linear' }}
              className="h-full bg-[#2F80ED]"
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
