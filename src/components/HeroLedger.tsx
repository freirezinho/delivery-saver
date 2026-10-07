import React from 'react';
import type { PeriodFilter } from '../types';
import { formatCurrency } from '../utils/formatters';

interface HeroLedgerProps {
  totalSaved: number;
  totalGroceries: number;
  ordersAvoidedCount: number;
  currentPeriod: PeriodFilter;
  onSelectPeriod: (period: PeriodFilter) => void;
}

export const HeroLedger: React.FC<HeroLedgerProps> = ({
  totalSaved,
  totalGroceries,
  ordersAvoidedCount,
  currentPeriod,
  onSelectPeriod
}) => {
  const grandTotal = totalSaved + totalGroceries;
  const hasData = grandTotal > 0 && ordersAvoidedCount > 0;
  const savedPercent = hasData ? Math.round((totalSaved / grandTotal) * 100) : 0;
  const groceryPercent = hasData ? 100 - savedPercent : 0;

  return (
    <section className="relative overflow-hidden bg-white dark:bg-[#161B26] border border-slate-200 dark:border-[#262F40] rounded-3xl p-6 sm:p-8 shadow-xs transition-colors">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              Guardado
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              {ordersAvoidedCount === 0
                ? 'Nenhum pedido de delivery evitado ainda'
                : `${ordersAvoidedCount} ${ordersAvoidedCount === 1 ? 'pedido evitado' : 'pedidos evitados'}`}
            </span>
          </div>

          <div className="flex items-baseline gap-2">
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-emerald-600 dark:text-emerald-400 tabular-nums">
              +{formatCurrency(totalSaved)}
            </h1>
            <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">
              {hasData ? 'ficou com você' : 'acumulados'}
            </span>
          </div>
        </div>

        {/* Period Selector */}
        <div className="flex bg-slate-100 dark:bg-[#0F141F] p-1 rounded-xl self-start md:self-center border border-slate-200 dark:border-[#262F40]">
          <button
            onClick={() => onSelectPeriod('today')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${currentPeriod === 'today'
                ? 'bg-white dark:bg-[#1E2638] text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
          >
            Hoje
          </button>
          <button
            onClick={() => onSelectPeriod('week')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${currentPeriod === 'week'
                ? 'bg-white dark:bg-[#1E2638] text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
          >
            Semana
          </button>
          <button
            onClick={() => onSelectPeriod('month')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${currentPeriod === 'month'
                ? 'bg-white dark:bg-[#1E2638] text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
          >
            Mês
          </button>
          <button
            onClick={() => onSelectPeriod('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${currentPeriod === 'all'
                ? 'bg-white dark:bg-[#1E2638] text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
          >
            Tudo
          </button>
        </div>
      </div>

      {/* Ratio Health Bar (with elegant empty state) */}
      <div className="mt-6 pt-5 border-t border-slate-100 dark:border-[#262F40]">
        {hasData ? (
          <>
            <div className="flex justify-between items-center text-xs font-semibold mb-2">
              <span className="text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Economia: {formatCurrency(totalSaved)} ({savedPercent}%)
              </span>
              <span className="text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> Mercado: {formatCurrency(totalGroceries)} ({groceryPercent}%)
              </span>
            </div>
            <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-[#0F141F] overflow-hidden flex border border-slate-200 dark:border-[#262F40]">
              <div
                className="h-full bg-emerald-500 transition-all duration-500"
                style={{ width: `${savedPercent}%` }}
              ></div>
              <div
                className="h-full bg-rose-500 transition-all duration-500"
                style={{ width: `${groceryPercent}%` }}
              ></div>
            </div>
          </>
        ) : (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-400 dark:text-slate-500 gap-1">
            <span>Aguardando seu primeiro registro para calcular a proporção de economia.</span>
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">Preencha ao lado para começar!</span>
          </div>
        )}
      </div>
    </section>
  );
};
