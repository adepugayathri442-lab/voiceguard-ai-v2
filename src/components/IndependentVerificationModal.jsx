import React, { useState } from 'react';
import { KeyRound, ShieldCheck, ShieldAlert, CheckCircle, XCircle, RefreshCw, X, MessageSquare, PhoneForwarded } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function IndependentVerificationModal() {
  const { 
    verificationModalOpen, 
    setVerificationModalOpen, 
    verificationTarget, 
    handleCompleteVerification 
  } = useApp();

  const [otpInput, setOtpInput] = useState('');
  const [method, setMethod] = useState('OTP'); // 'OTP' | 'PHRASE' | 'CALLBACK'
  const [simulatedExpectedOtp] = useState('7492');
  const [simulatedSecretPhrase] = useState('BLUE FALCON 88');
  const [phraseInput, setPhraseInput] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  if (!verificationModalOpen) return null;

  const targetCaller = verificationTarget?.caller || '+91 98490 23145';

  const handleVerify = (forceSuccess = null) => {
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      if (forceSuccess !== null) {
        handleCompleteVerification(forceSuccess);
        return;
      }

      if (method === 'OTP') {
        const isMatch = otpInput.trim() === simulatedExpectedOtp;
        handleCompleteVerification(isMatch);
      } else if (method === 'PHRASE') {
        const isMatch = phraseInput.trim().toUpperCase() === simulatedSecretPhrase;
        handleCompleteVerification(isMatch);
      } else {
        // Callback
        handleCompleteVerification(false);
      }
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#0E1526] border border-amber-500/50 rounded-2xl shadow-2xl shadow-amber-950/40 p-6 overflow-hidden">
        {/* Protocol header line */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Independent Out-of-Band Verification</h3>
              <p className="text-xs text-amber-400/80 font-mono">SIH Flowchart Protocol • Zero-Trust Step</p>
            </div>
          </div>
          <button 
            onClick={() => setVerificationModalOpen(false)}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Info Box */}
        <div className="my-4 p-3 bg-slate-900/80 rounded-xl border border-slate-800 text-xs text-slate-300">
          <p className="leading-relaxed">
            Because our AI detection engine flagged this call with <span className="text-rose-400 font-bold font-mono">High Risk (92/100)</span>, VoiceGuard AI initiates an out-of-band challenge before allowing or blocking.
          </p>
          <div className="mt-2 flex items-center justify-between text-[11px] font-mono text-slate-400 bg-slate-950/80 p-2 rounded-lg">
            <span>CHALLENGING TARGET:</span>
            <span className="text-cyan-400 font-bold">{targetCaller}</span>
          </div>
        </div>

        {/* Method Switcher */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <button
            onClick={() => setMethod('OTP')}
            className={`py-2 px-2 text-xs font-semibold rounded-lg border transition-all ${
              method === 'OTP'
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/60'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
          >
            SMS OTP Challenge
          </button>
          <button
            onClick={() => setMethod('PHRASE')}
            className={`py-2 px-2 text-xs font-semibold rounded-lg border transition-all ${
              method === 'PHRASE'
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/60'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
          >
            Secret Passphrase
          </button>
          <button
            onClick={() => setMethod('CALLBACK')}
            className={`py-2 px-2 text-xs font-semibold rounded-lg border transition-all ${
              method === 'CALLBACK'
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/60'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
          >
            Reverse Callback
          </button>
        </div>

        {/* Method Input Body */}
        {method === 'OTP' && (
          <div className="space-y-3">
            <label className="block text-xs text-slate-300">
              Enter 4-digit code sent to genuine registered subscriber phone:
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                maxLength={6}
                value={otpInput}
                onChange={(e) => setOtpInput(e.target.value)}
                placeholder="e.g. 7492"
                className="flex-1 px-3 py-2.5 rounded-lg bg-slate-950 border border-slate-700 text-white font-mono text-center tracking-widest text-lg focus:outline-none focus:border-amber-500"
              />
              <button
                onClick={() => setOtpInput(simulatedExpectedOtp)}
                className="text-xs px-2.5 py-2.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white border border-slate-700"
                title="Fill correct OTP for demo"
              >
                Auto-fill (7492)
              </button>
            </div>
            <p className="text-[11px] text-slate-400">
              (In a real clone attack, the attacker will fail this step because the genuine phone receives the SMS token).
            </p>
          </div>
        )}

        {method === 'PHRASE' && (
          <div className="space-y-3">
            <label className="block text-xs text-slate-300">
              Pre-agreed Family Emergency Duress / Secret Phrase:
            </label>
            <input
              type="text"
              value={phraseInput}
              onChange={(e) => setPhraseInput(e.target.value)}
              placeholder="e.g. BLUE FALCON 88"
              className="w-full px-3 py-2.5 rounded-lg bg-slate-950 border border-slate-700 text-white font-mono text-center tracking-wider text-sm focus:outline-none focus:border-amber-500"
            />
            <button
              onClick={() => setPhraseInput(simulatedSecretPhrase)}
              className="text-xs text-cyan-400 hover:underline"
            >
              Fill correct family phrase
            </button>
          </div>
        )}

        {method === 'CALLBACK' && (
          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-xs text-slate-300 space-y-2">
            <p>
              VoiceGuard AI disconnects this incoming SIP stream and immediately dials the verified registered GSM number for {targetCaller}.
            </p>
            <div className="text-amber-400 font-mono text-xs">
              Direct PSTN loopback bypasses VoIP spoofing relays.
            </div>
          </div>
        )}

        {/* Demo Shortcut Bar for Judges */}
        <div className="mt-5 p-2.5 rounded-lg bg-slate-950/90 border border-slate-800">
          <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1.5 flex justify-between">
            <span>Judge Demo Testing Shortcuts</span>
            <span className="text-cyan-400">Simulate Both Branches</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleVerify(true)}
              disabled={isVerifying}
              className="py-2 px-3 rounded-lg bg-emerald-600/30 hover:bg-emerald-600/40 border border-emerald-500/50 text-emerald-300 text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Simulate Verified [Allow]</span>
            </button>

            <button
              onClick={() => handleVerify(false)}
              disabled={isVerifying}
              className="py-2 px-3 rounded-lg bg-rose-600/30 hover:bg-rose-600/40 border border-rose-500/50 text-rose-300 text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors"
            >
              <XCircle className="w-4 h-4" />
              <span>Simulate Failed [Block]</span>
            </button>
          </div>
        </div>

        {/* Action button */}
        <div className="mt-4 flex justify-end space-x-2">
          <button
            onClick={() => setVerificationModalOpen(false)}
            className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white rounded-lg"
          >
            Cancel
          </button>
          <button
            onClick={() => handleVerify()}
            disabled={isVerifying}
            className="px-5 py-2 text-xs font-bold text-white bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 rounded-lg shadow-lg shadow-amber-600/20 flex items-center space-x-1.5"
          >
            {isVerifying ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Checking...</span>
              </>
            ) : (
              <span>Confirm Verification</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
