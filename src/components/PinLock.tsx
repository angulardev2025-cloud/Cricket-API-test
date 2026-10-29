import React, { useState, useRef, useEffect } from 'react';
import { Lock, ShieldCheck, AlertCircle } from 'lucide-react';

interface PinLockProps {
  onSuccess: () => void;
}

export const PinLock: React.FC<PinLockProps> = ({ onSuccess }) => {
  const [pin, setPin] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const handleChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, '').slice(-1);
    const newPin = [...pin];
    newPin[index] = digit;
    setPin(newPin);
    setError(false);

    // Auto advance focus
    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Check if complete
    if (newPin.every((d) => d !== '')) {
      const enteredPin = newPin.join('');
      if (enteredPin === '999999') {
        const now = Date.now().toString();
        localStorage.setItem('bharat_iptv_auth_time', now);
        onSuccess();
      } else {
        setError(true);
        setShake(true);
        setTimeout(() => setShake(false), 500);
        setPin(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !pin[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex items-center justify-center p-4">
      <div
        className={`glass-panel w-full max-w-md p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-2xl transition-transform ${
          shake ? 'animate-bounce border-red-500' : ''
        }`}
      >
        <div className="text-center mb-8">
          <div className="h-16 w-16 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center justify-center mx-auto mb-4 text-amber-400">
            <Lock className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-extrabold text-white mb-2">Secure Access</h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Please enter the 6-digit security PIN to access the Global IPTV Player.
          </p>
        </div>

        <div className="flex justify-center gap-2 sm:gap-3 mb-6">
          {pin.map((digit, idx) => (
            <input
              key={idx}
              ref={(el) => (inputRefs.current[idx] = el)}
              type="password"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(idx, e.target.value)}
              onKeyDown={(e) => handleKeyDown(idx, e)}
              className={`w-11 h-12 sm:w-12 sm:h-14 text-center text-xl sm:text-2xl font-extrabold bg-slate-950 border rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all ${
                error ? 'border-red-500 text-red-400' : 'border-slate-800'
              }`}
            />
          ))}
        </div>

        {error && (
          <div className="flex items-center justify-center gap-2 text-red-400 text-xs font-semibold mb-6 bg-red-950/30 p-2.5 rounded-xl border border-red-900/50">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>Incorrect PIN. Please try again. (999999)</span>
          </div>
        )}

        <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
          <ShieldCheck className="h-4 w-4 text-emerald-500" />
          <span>Session remains active for 24 hours</span>
        </div>
      </div>
    </div>
  );
};
