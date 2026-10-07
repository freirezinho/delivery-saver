import React from 'react';
import { Target, Pencil } from 'lucide-react';
import { formatCurrency } from '../utils/formatters';
import type { HouseholdGoal } from '../types';

interface GoalTrackerProps {
  goal: HouseholdGoal | null;
  totalSaved: number;
  onEditGoal: () => void;
}

export const GoalTracker: React.FC<GoalTrackerProps> = ({ goal, totalSaved, onEditGoal }) => {
  const target = goal?.targetAmount || 800;
  const current = totalSaved;
  const percent = Math.min(100, Math.round((current / target) * 100));

  return (
    <div className="bg-white dark:bg-[#161B26] border border-slate-200 dark:border-[#262F40] rounded-3xl p-5 sm:p-6 shadow-xs space-y-3 transition-colors">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center">
            <Target className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
              Meta da Casa
            </span>
            <h4 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
              <span>{goal?.title || 'Definir Meta da Casa'}</span>
            </h4>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="text-right">
            <span className="text-base font-black text-emerald-600 dark:text-emerald-400 tabular-nums">
              {formatCurrency(current)}
            </span>
            <span className="text-xs text-slate-400 dark:text-slate-500"> / {formatCurrency(target)}</span>
          </div>
          <button
            onClick={onEditGoal}
            className="p-1.5 text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            title="Alterar Meta"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="w-full bg-slate-100 dark:bg-[#0F141F] h-2.5 rounded-full overflow-hidden border border-slate-200 dark:border-[#262F40]">
        <div
          className="bg-emerald-500 h-full rounded-full transition-all duration-500"
          style={{ width: `${percent}%` }}
        ></div>
      </div>

      <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
        <span>{percent}% financiado cozinhando em casa.</span>
        <button
          onClick={onEditGoal}
          className="font-semibold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
        >
          {goal ? 'Alterar valor ou título' : 'Criar meta'}
        </button>
      </div>
    </div>
  );
};
