import React from 'react';
import { Flame, Smartphone, Moon, Sun, Volume2, VolumeX, RotateCcw } from 'lucide-react';
import { soundEngine } from '../utils/sound';

interface NavbarProps {
  onOpenDeviceModal: () => void;
  onOpenResetModal: () => void;
  isDark: boolean;
  onToggleTheme: () => void;
  streakDays: number;
  isSyncEnabled: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenDeviceModal,
  onOpenResetModal,
  isDark,
  onToggleTheme,
  streakDays,
  isSyncEnabled
}) => {
  const [isMuted, setIsMuted] = React.useState(soundEngine.getIsMuted());

  const handleToggleSound = () => {
    const next = !isMuted;
    soundEngine.setMuted(next);
    setIsMuted(next);
    if (!next) {
      soundEngine.playCashChime();
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 dark:bg-[#0B0F17]/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center shadow-md shadow-rose-600/20 font-bold">
            <span className="text-base tracking-tighter">DS</span>
          </div>
          <div>
            <span className="text-base font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-1">
              Delivery<span className="text-rose-600">Saver</span>
            </span>
            <span className="hidden sm:inline-block text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Economia Doméstica
            </span>
          </div>
        </div>

        {/* Actions & Streak */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Streak Badge */}
          <div className="flex items-center gap-1.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-900/60 px-3 py-1.5 rounded-full">
            <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
            <span className="text-xs font-bold text-amber-900 dark:text-amber-300">
              {streakDays}
            </span>
          </div>

          {/* Audio Mute/Unmute Toggle */}
          <button
            onClick={handleToggleSound}
            className="p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition cursor-pointer"
            title={isMuted ? 'Ativar efeito sonoro' : 'Silenciar efeito sonoro'}
          >
            {isMuted ? <VolumeX className="w-5 h-5 text-slate-400" /> : <Volume2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />}
          </button>

          {/* Link Device (QR Code / Smartphone) */}
          <button
            onClick={onOpenDeviceModal}
            className="relative p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition cursor-pointer"
            title={isSyncEnabled ? 'Sincronização Ativa (Conectar Aparelhos)' : 'Conectar Celular ou Tablet (Sincronização Desativada)'}
          >
            <Smartphone className="w-5 h-5" />
            {isSyncEnabled && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-[#0B0F17]" />
            )}
          </button>

          {/* Theme Toggle (Light / Dark) */}
          <button
            onClick={onToggleTheme}
            className="p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition cursor-pointer"
            title={isDark ? 'Mudar para Modo Claro' : 'Mudar para Modo Escuro'}
          >
            {isDark ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
          </button>

          {/* Reset Data / Clean Slate */}
          <button
            onClick={onOpenResetModal}
            className="p-2 text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition cursor-pointer"
            title="Reiniciar histórico (Começar do zero)"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
