import React, { useState } from 'react';
import { Target, X, Check } from 'lucide-react';
import type { HouseholdGoal } from '../types';

interface GoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentGoal: HouseholdGoal | null;
  onSaveGoal: (goal: HouseholdGoal) => Promise<void>;
}

const GOAL_SUGGESTIONS = [
  { title: 'Viagem de Fim de Semana', amount: 800 },
  { title: 'Air Fryer ou Panela Elétrica', amount: 450 },
  { title: 'Reserva Familiar', amount: 1500 },
  { title: 'Jantar Romântico Especial', amount: 250 }
];

export const GoalModal: React.FC<GoalModalProps> = ({
  isOpen,
  onClose,
  currentGoal,
  onSaveGoal
}) => {
  const [title, setTitle] = useState(currentGoal?.title || 'Viagem de Fim de Semana');
  const [targetAmount, setTargetAmount] = useState(currentGoal?.targetAmount?.toString() || '800');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(targetAmount) || 500;
    await onSaveGoal({
      id: currentGoal?.id || 'primary-goal',
      title: title.trim() || 'Meta da Casa',
      targetAmount: amount,
      currentAmount: currentGoal?.currentAmount || 0,
      isCompleted: false
    });
    onClose();
  };

  const handleApplySuggestion = (s: typeof GOAL_SUGGESTIONS[0]) => {
    setTitle(s.title);
    setTargetAmount(s.amount.toString());
  };

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
          <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
              Definir Meta de Economia
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              O que você quer conquistar com o dinheiro que deixou de gastar em delivery?
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
              Nome da Meta
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Viagem de Fim de Semana"
              required
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-[#262F40] bg-slate-50/50 dark:bg-[#0F141F] text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
              Valor Alvo (R$)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">R$</span>
              <input
                type="number"
                step="50"
                min="10"
                value={targetAmount}
                onChange={(e) => setTargetAmount(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-[#262F40] bg-slate-50/50 dark:bg-[#0F141F] text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold tabular-nums"
              />
            </div>
          </div>

          {/* Quick suggestions */}
          <div>
            <span className="text-[11px] font-semibold text-slate-400 block mb-1.5">Sugestões:</span>
            <div className="flex flex-wrap gap-1.5">
              {GOAL_SUGGESTIONS.map((s) => (
                <button
                  key={s.title}
                  type="button"
                  onClick={() => handleApplySuggestion(s)}
                  className="text-[11px] px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-[#1E2638] dark:hover:bg-[#2D374D] text-slate-700 dark:text-slate-300 transition cursor-pointer"
                >
                  {s.title}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2 flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#1E2638] dark:hover:bg-[#2D374D] text-slate-700 dark:text-slate-300 font-bold text-xs transition cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Salvar Meta</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
