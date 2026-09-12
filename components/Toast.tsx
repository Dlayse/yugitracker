import React from 'react';
import { useStore } from '../context/StoreContext';
import { AnimatePresence, motion } from 'framer-motion';
import { RotateCcw } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { state, dispatch } = useStore();

  const handleUndo = (id: string, undoFn: () => void) => {
    undoFn();
    dispatch({ type: 'REMOVE_TOAST', payload: id });
  };

  return (
    <div className="fixed bottom-6 right-6 flex flex-col gap-3 z-[2000] pointer-events-none items-end">
      <AnimatePresence>
        {state.ui.toasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.15 } }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className={`relative overflow-hidden pointer-events-auto px-4 py-3 rounded-lg shadow-2xl border-l-4 text-white font-medium min-w-[300px] flex items-center justify-between backdrop-blur-md gap-4 ${
              t.type === 'err' 
                ? 'bg-zinc-800/95 border-red-500' 
                : 'bg-zinc-800/95 border-primary'
            }`}
          >
            {/* Progress Bar Animation for Undoable Actions */}
            {t.onUndo && (
              <motion.div 
                initial={{ width: "100%" }}
                animate={{ width: "0%" }}
                transition={{ duration: 5, ease: "linear" }}
                className={`absolute bottom-0 left-0 h-1 opacity-70 ${t.type === 'err' ? 'bg-red-500' : 'bg-primary'}`}
              />
            )}

            <span className="relative z-10">{t.msg}</span>
            {t.onUndo && (
              <button 
                onClick={() => handleUndo(t.id, t.onUndo!)}
                className="relative z-10 flex items-center gap-1 bg-white/10 hover:bg-white/20 px-2 py-1 rounded text-sm font-bold transition-colors text-primary"
              >
                <RotateCcw size={14} /> Deshacer
              </button>
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};