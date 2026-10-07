import React, { useState } from 'react';
import { TrendingUp, Check, ChevronRight, ChevronDown } from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundEngine } from '../utils/sound';
import { formatCurrency } from '../utils/formatters';
import type { MealRecord } from '../types';

interface MealLoggerProps {
  onAddMeal: (meal: Omit<MealRecord, 'id'>) => Promise<void>;
}

const PRESETS = [
  { name: 'Hambúrguer Smash Artesanal', takeout: 48.00, grocery: 12.00 },
  { name: 'Pizza de Calabresa Grande', takeout: 65.00, grocery: 16.00 },
  { name: 'Prato Feito Completo (PF)', takeout: 36.00, grocery: 8.50 },
  { name: 'Lámen / Yakisoba Especial', takeout: 52.00, grocery: 13.00 },
];

export const MealLogger: React.FC<MealLoggerProps> = ({ onAddMeal }) => {
  const [mealName, setMealName] = useState('');
  const [takeoutCost, setTakeoutCost] = useState('48.00');
  const [groceryCost, setGroceryCost] = useState('12.00');

  // Optional fee breakdown accordion
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [deliveryFee, setDeliveryFee] = useState('7.90');
  const [serviceTax, setServiceTax] = useState('4.50');
  const [courierTip, setCourierTip] = useState('0.00');

  const takeoutNum = parseFloat(takeoutCost) || 0;
  const groceryNum = parseFloat(groceryCost) || 0;
  const netSaved = Math.max(0, takeoutNum - groceryNum);

  const handleApplyPreset = (preset: typeof PRESETS[0]) => {
    setMealName(preset.name);
    setTakeoutCost(preset.takeout.toFixed(2));
    setGroceryCost(preset.grocery.toFixed(2));
  };

  const handleSyncFromBreakdown = () => {
    const fee = parseFloat(deliveryFee) || 0;
    const tax = parseFloat(serviceTax) || 0;
    const tip = parseFloat(courierTip) || 0;
    const baseFood = 35.60;
    setTakeoutCost((baseFood + fee + tax + tip).toFixed(2));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = mealName.trim() || 'Refeição Preparada em Casa';

    // Play acoustic cash chime
    soundEngine.playCashChime();

    // Trigger celebration confetti burst
    try {
      confetti({
        particleCount: 75,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#16A34A', '#E11D48', '#F59E0B', '#22C55E']
      });
    } catch {
      // Ignore if animation blocked
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const newMeal: Omit<MealRecord, 'id'> = {
      uuid: crypto.randomUUID ? crypto.randomUUID() : 'meal-' + Date.now(),
      name,
      takeoutCost: takeoutNum,
      groceryCost: groceryNum,
      netSaved,
      feeMarkup: (parseFloat(deliveryFee) || 0) + (parseFloat(serviceTax) || 0) + (parseFloat(courierTip) || 0),
      date: todayStr,
      timestamp: Date.now(),
      createdAt: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      mealSlot: 'Dinner',
      breakdown: {
        foodItems: takeoutNum - ((parseFloat(deliveryFee) || 0) + (parseFloat(serviceTax) || 0) + (parseFloat(courierTip) || 0)),
        deliveryFee: parseFloat(deliveryFee) || 0,
        serviceTax: parseFloat(serviceTax) || 0,
        courierTip: parseFloat(courierTip) || 0
      }
    };

    await onAddMeal(newMeal);

    // Reset meal name input for next entry
    setMealName('');
  };

  return (
    <section className="bg-white dark:bg-[#161B26] border border-slate-200 dark:border-[#262F40] rounded-3xl p-6 sm:p-8 shadow-xs transition-colors">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-lg font-extrabold tracking-tight text-slate-900 dark:text-white">
            Registrar Refeição em Casa
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Compare quanto o delivery custaria vs. quanto você gastou no mercado.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Meal Name */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
            O que você preparou?
          </label>
          <input
            type="text"
            value={mealName}
            onChange={(e) => setMealName(e.target.value)}
            placeholder="Ex: Hambúrguer Caseiro com Batata Rústica"
            required
            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-[#262F40] bg-slate-50/50 dark:bg-[#0F141F] text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500 font-medium text-sm transition"
          />

          {/* Quick Preset Chips */}
          <div className="flex flex-wrap gap-2 mt-2.5 items-center">
            <span className="text-xs text-slate-400">Sugestões:</span>
            {PRESETS.map((preset) => (
              <button
                key={preset.name}
                type="button"
                onClick={() => handleApplyPreset(preset)}
                className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-[#1E2638] dark:hover:bg-[#2D374D] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-[#2D374D] transition cursor-pointer"
              >
                {preset.name}
              </button>
            ))}
          </div>
        </div>

        {/* Two Core Numbers (Takeout vs Grocery) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Delivery Cost (Culinary Red) */}
          <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-rose-700 dark:text-rose-400 uppercase tracking-wide">
                No Delivery Custaria
              </span>
              <span className="text-[10px] font-bold bg-rose-200/80 dark:bg-rose-900/60 text-rose-800 dark:text-rose-300 px-2 py-0.5 rounded">
                App + Taxas
              </span>
            </div>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-rose-500 font-bold text-base">R$</span>
              <input
                type="number"
                step="0.50"
                value={takeoutCost}
                onChange={(e) => setTakeoutCost(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-rose-200 dark:border-rose-800/80 bg-white dark:bg-[#0B0F17] text-slate-900 dark:text-white font-bold text-lg focus:outline-none focus:ring-2 focus:ring-rose-500 transition tabular-nums"
              />
            </div>
          </div>

          {/* Grocery Ingredient Cost (Neutral Slate) */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#0F141F] border border-slate-200 dark:border-[#262F40] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-400 uppercase tracking-wide">
                Gasto no Mercado / Ingredientes
              </span>
              <span className="text-[10px] font-bold bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded">
                Aproximado
              </span>
            </div>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-base">R$</span>
              <input
                type="number"
                step="0.50"
                value={groceryCost}
                onChange={(e) => setGroceryCost(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-[#262F40] bg-white dark:bg-[#0B0F17] text-slate-900 dark:text-white font-bold text-lg focus:outline-none focus:ring-2 focus:ring-slate-400 transition tabular-nums"
              />
            </div>
          </div>
        </div>

        {/* Optional Accordion: App Fee Breakdown */}
        <div>
          <button
            type="button"
            onClick={() => setShowBreakdown(!showBreakdown)}
            className="text-xs font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 flex items-center gap-1.5 transition cursor-pointer"
          >
            {showBreakdown ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            <span>Detalhar taxa de entrega, serviço e gorjeta (opcional)</span>
          </button>

          {showBreakdown && (
            <div className="mt-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-[#0F141F] border border-slate-200 dark:border-[#262F40] grid grid-cols-3 gap-3 text-xs">
              <div>
                <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 block mb-1">Taxa de Entrega</label>
                <input
                  type="number"
                  step="0.50"
                  value={deliveryFee}
                  onChange={(e) => { setDeliveryFee(e.target.value); handleSyncFromBreakdown(); }}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-[#161B26] border border-slate-200 dark:border-[#262F40] text-slate-900 dark:text-white tabular-nums"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 block mb-1">Taxa de Serviço</label>
                <input
                  type="number"
                  step="0.50"
                  value={serviceTax}
                  onChange={(e) => { setServiceTax(e.target.value); handleSyncFromBreakdown(); }}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-[#161B26] border border-slate-200 dark:border-[#262F40] text-slate-900 dark:text-white tabular-nums"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 block mb-1">Gorjeta</label>
                <input
                  type="number"
                  step="0.50"
                  value={courierTip}
                  onChange={(e) => { setCourierTip(e.target.value); handleSyncFromBreakdown(); }}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-[#161B26] border border-slate-200 dark:border-[#262F40] text-slate-900 dark:text-white tabular-nums"
                />
              </div>
            </div>
          )}
        </div>

        {/* Dynamic Net Savings Banner (Hero Financial Green) */}
        <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 flex items-center justify-between transition-all">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-bold shadow-sm shadow-emerald-500/20">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
                Dinheiro Guardado
              </div>
              <div className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">
                Permanece diretamente na sua conta
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 tabular-nums">
              +{formatCurrency(netSaved)}
            </div>
            <div className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300">
              Economizado nesta refeição
            </div>
          </div>
        </div>

        {/* Primary Submit Button */}
        <button
          type="submit"
          className="w-full py-4 px-6 rounded-2xl bg-rose-600 hover:bg-rose-700 active:scale-[0.99] text-white font-extrabold text-sm tracking-wide flex items-center justify-center gap-2 shadow-lg shadow-rose-600/20 transition cursor-pointer"
        >
          <Check className="w-4 h-4 stroke-[3]" />
          <span>Registrar Refeição e Guardar Dinheiro</span>
        </button>
      </form>
    </section>
  );
};
