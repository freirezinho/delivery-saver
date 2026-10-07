import React from 'react';
import { Trash2, X, AlertTriangle } from 'lucide-react';
import type { MealRecord } from '../types';
import { formatCurrency } from '../utils/formatters';

interface ConfirmDeleteModalProps {
  mealToDelete: MealRecord | null;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

export const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
  mealToDelete,
  onClose,
  onConfirm
}) => {
  if (!mealToDelete) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#161B26] border border-slate-200 dark:border-[#262F40] rounded-3xl max-w-sm w-full p-6 space-y-5 shadow-2xl relative transition-colors">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
            <Trash2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
              Excluir Refeição?
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              O valor economizado será recalculado.
            </p>
          </div>
        </div>

        {/* Meal Details */}
        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#0F141F] border border-slate-200 dark:border-[#262F40] space-y-1 text-xs">
          <p className="font-bold text-slate-900 dark:text-white">
            {mealToDelete.name}
          </p>
          <div className="flex justify-between text-slate-500 dark:text-slate-400">
            <span>Economia registrada:</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400">
              +{formatCurrency(mealToDelete.netSaved)}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-[11px] text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 p-2.5 rounded-xl border border-amber-200/80 dark:border-amber-900/50">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>Esta ação não pode ser desfeita.</span>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#1E2638] dark:hover:bg-[#2D374D] text-slate-700 dark:text-slate-300 font-bold text-xs transition cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md shadow-rose-600/20 transition flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            <span>Excluir</span>
          </button>
        </div>
      </div>
    </div>
  );
};
