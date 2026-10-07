import React from 'react';
import { Utensils, Trash2, Calendar, Sparkles } from 'lucide-react';
import type { MealRecord, PeriodFilter } from '../types';
import { formatCurrency, formatDateTimeBR } from '../utils/formatters';

interface ActivityFeedProps {
  meals: MealRecord[];
  currentPeriod: PeriodFilter;
  onSelectPeriod: (period: PeriodFilter) => void;
  onRequestDelete: (meal: MealRecord) => void;
}

const PERIOD_LABELS: Record<PeriodFilter, string> = {
  today: 'Hoje',
  week: 'Últimos 7 dias',
  month: 'Este Mês',
  all: 'Todo o Histórico'
};

export const ActivityFeed: React.FC<ActivityFeedProps> = ({
  meals,
  currentPeriod,
  onSelectPeriod,
  onRequestDelete
}) => {
  return (
    <section className="space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1">
        <div>
          <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Atividade Recente
          </h3>
          <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500 flex items-center gap-1 mt-0.5">
            <Calendar className="w-3 h-3" />
            <span>Exibindo: <strong className="text-slate-600 dark:text-slate-300">{PERIOD_LABELS[currentPeriod]}</strong> ({meals.length})</span>
          </span>
        </div>

        {/* Quick filter switcher */}
        <div className="flex bg-slate-100 dark:bg-[#0F141F] p-0.5 rounded-lg border border-slate-200 dark:border-[#262F40] self-start sm:self-auto text-[11px]">
          {(['today', 'week', 'month', 'all'] as PeriodFilter[]).map((p) => (
            <button
              key={p}
              onClick={() => onSelectPeriod(p)}
              className={`px-2 py-1 rounded-md font-semibold transition cursor-pointer ${
                currentPeriod === p
                  ? 'bg-white dark:bg-[#1E2638] text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              {p === 'today' ? 'Hoje' : p === 'week' ? 'Semana' : p === 'month' ? 'Mês' : 'Tudo'}
            </button>
          ))}
        </div>
      </div>

      {meals.length === 0 ? (
        <div className="p-8 text-center bg-white dark:bg-[#161B26] border border-dashed border-slate-300 dark:border-[#262F40] rounded-3xl space-y-3 shadow-xs">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 flex items-center justify-center text-amber-600 dark:text-amber-400">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              Sua cozinha está pronta para economizar!
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs mx-auto">
              Quando você cozinhar em casa em vez de pedir delivery, registre no formulário ao lado para ver seu dinheiro guardado acumular.
            </p>
          </div>
          <div className="pt-1">
            <span className="inline-block text-[11px] font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 px-3 py-1 rounded-full">
              ← Preencha sua primeira refeição ao lado
            </span>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {meals.map((meal) => (
            <div
              key={meal.uuid || meal.id}
              className="bg-white dark:bg-[#161B26] border border-slate-200 dark:border-[#262F40] rounded-2xl p-4 flex items-center justify-between shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-[#0F141F] border border-slate-200 dark:border-[#262F40] flex items-center justify-center text-slate-700 dark:text-slate-300">
                  <Utensils className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                    {meal.name}
                  </h4>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 flex flex-wrap items-center gap-1.5">
                    <span>{formatDateTimeBR(meal.timestamp)}</span>
                    <span>•</span>
                    <span className="text-rose-600 dark:text-rose-400 font-medium">
                      Delivery {formatCurrency(meal.takeoutCost)}
                    </span>
                    <span>•</span>
                    <span>Mercado {formatCurrency(meal.groceryCost)}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 tabular-nums">
                  +{formatCurrency(meal.netSaved)}
                </span>
                <button
                  onClick={() => onRequestDelete(meal)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                  title="Excluir refeição"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};
