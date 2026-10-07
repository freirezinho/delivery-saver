import React, { useState, useEffect, useRef } from 'react';
import { Smartphone, Check, X, Link2, Copy, Wifi, ShieldCheck, Power } from 'lucide-react';
import QRCode from 'qrcode';
import { syncClient } from '../utils/sync';

interface DeviceModalProps {
  isOpen: boolean;
  onClose: () => void;
  isSyncEnabled: boolean;
  onToggleSync: (enabled: boolean) => void;
}

export const DeviceModal: React.FC<DeviceModalProps> = ({
  isOpen,
  onClose,
  isSyncEnabled,
  onToggleSync
}) => {
  const [roomCode] = useState(syncClient.getRoomCode());
  const [inputCode, setInputCode] = useState('');
  const [isLinked, setIsLinked] = useState(false);
  const [copied, setCopied] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Real pairing URL readable by smartphone camera
  const pairingUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/?room=${roomCode}`
    : `http://localhost:5173/?room=${roomCode}`;

  useEffect(() => {
    if (isOpen && isSyncEnabled && canvasRef.current) {
      QRCode.toCanvas(
        canvasRef.current,
        pairingUrl,
        {
          width: 176,
          margin: 1,
          color: {
            dark: '#0F172A',
            light: '#FFFFFF'
          }
        },
        (error) => {
          if (error) console.error('Error generating QR code:', error);
        }
      );
    }
  }, [isOpen, isSyncEnabled, pairingUrl]);

  if (!isOpen) return null;

  const handleLinkOtherDevice = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = inputCode.replace(/\D/g, '');
    if (clean.length === 6) {
      syncClient.setRoomCode(clean);
      setIsLinked(true);
      setTimeout(() => {
        onClose();
      }, 1200);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(pairingUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#161B26] border border-slate-200 dark:border-[#262F40] rounded-3xl max-w-sm w-full p-6 text-center space-y-5 shadow-2xl relative transition-colors max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="w-12 h-12 mx-auto rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
          <Smartphone className="w-6 h-6" />
        </div>

        <div>
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
            Conectar Celular ou Tablet
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Sincronize sua economia entre aparelhos em tempo real.
          </p>
        </div>

        {/* Sync Feature Toggle Control */}
        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#0F141F] border border-slate-200 dark:border-[#262F40] flex items-center justify-between text-left">
          <div className="pr-3">
            <span className="text-xs font-bold text-slate-900 dark:text-white block">
              Sincronização entre Aparelhos
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              {isSyncEnabled ? 'Ativada (transmissão em tempo real)' : 'Desativada (modo 100% local)'}
            </span>
          </div>

          <button
            type="button"
            role="switch"
            aria-checked={isSyncEnabled}
            onClick={() => onToggleSync(!isSyncEnabled)}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              isSyncEnabled ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-700'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                isSyncEnabled ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Conditional Content based on Sync Toggle */}
        {!isSyncEnabled ? (
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-[#0F141F] border border-dashed border-slate-300 dark:border-[#262F40] space-y-3 text-left">
            <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200 font-bold text-xs">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>Privacidade Total & Modo Offline</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              Com a sincronização desativada, nenhum dado sai deste navegador. Todas as refeições e economias ficam gravadas apenas na memória deste dispositivo.
            </p>
            <button
              onClick={() => onToggleSync(true)}
              className="w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Power className="w-3.5 h-3.5" />
              <span>Ativar Sincronização Agora</span>
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Real Dynamically Generated QR Code */}
            <div className="bg-white p-3 rounded-2xl border border-slate-200 inline-block mx-auto shadow-xs">
              <canvas ref={canvasRef} className="rounded-xl block"></canvas>
            </div>

            {/* Copyable Link */}
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={handleCopyLink}
                className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-[#0F141F] hover:bg-slate-200 dark:hover:bg-[#1E2638] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-[#262F40] transition flex items-center gap-1.5 cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Link Copiado!' : 'Copiar Link de Conexão'}</span>
              </button>
            </div>

            {/* 6-Digit Room Code */}
            <div className="bg-slate-50 dark:bg-[#0F141F] p-3 rounded-xl border border-slate-200 dark:border-[#262F40]">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-0.5">
                Ou digite este código de pareamento
              </span>
              <span className="text-xl font-black tracking-widest text-slate-900 dark:text-white tabular-nums">
                {roomCode.slice(0, 3)} - {roomCode.slice(3, 6)}
              </span>
            </div>

            {/* Manual Code Input Form */}
            <form onSubmit={handleLinkOtherDevice} className="space-y-2 pt-1 border-t border-slate-100 dark:border-[#262F40]">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 block text-left font-medium">
                Já tem um código de outro aparelho?
              </span>
              <div className="flex gap-2">
                <input
                  type="text"
                  maxLength={7}
                  value={inputCode}
                  onChange={(e) => setInputCode(e.target.value)}
                  placeholder="Ex: 829410"
                  className="flex-1 px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-[#0F141F] border border-slate-200 dark:border-[#262F40] text-slate-900 dark:text-white placeholder-slate-400 text-center font-mono focus:outline-none focus:ring-1 focus:ring-rose-500"
                />
                <button
                  type="submit"
                  className="px-3 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold hover:opacity-90 transition flex items-center gap-1 cursor-pointer"
                >
                  <Link2 className="w-3.5 h-3.5" />
                  <span>Conectar</span>
                </button>
              </div>
              {isLinked && (
                <p className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center justify-center gap-1">
                  <Check className="w-3.5 h-3.5" /> Pareado com sucesso!
                </p>
              )}
            </form>

            {/* Real-time Sync Status */}
            <div className="flex items-center justify-center gap-1.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
              <Wifi className="w-3.5 h-3.5" />
              <span>Sincronização em tempo real ativa</span>
            </div>
          </div>
        )}

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#1E2638] dark:hover:bg-[#2D374D] text-slate-800 dark:text-slate-200 font-bold text-xs transition cursor-pointer"
        >
          Fechar
        </button>
      </div>
    </div>
  );
};
