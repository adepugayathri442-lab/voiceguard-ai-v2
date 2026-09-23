import React, { useState } from 'react';
import { 
  ShieldCheck, 
  PhoneForwarded, 
  UserX, 
  PhoneOff, 
  AlertTriangle, 
  Check, 
  Lock,
  Flame,
  ArrowRight
} from 'lucide-react';
import { useApp } from '../context/AppContext';

/**
 * ActionableInterventions
 * Security response panel offering 4 instant, high-impact defense actions.
 */
export default function ActionableInterventions({ call }) {
  const { 
    triggerSecondaryMFA, 
    requestCallback, 
    escalateToSupervisor, 
    terminateCall 
  } = useApp();

  const [lastAction, setLastAction] = useState(null);
  const [confirmTerminate, setConfirmTerminate] = useState(false);

  const handleAction = (actionFn, actionName) => {
    actionFn(call?.id);
    setLastAction(actionName);
    setTimeout(() => setLastAction(null), 3500);
  };

  const isTerminated = call?.status === 'TERMINATED';

  return (
    <div className="p-4 rounded-2xl bg-[#0B0F19]/90 border border-slate-800/90 shadow-xl backdrop-blur-md space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
        <div className="flex items-center space-x-2">
          <Lock className="w-4 h-4 text-cyan-400" />
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200">
            Actionable Threat Interventions
          </h3>
        </div>
        <span className="text-[10px] font-mono text-emerald-400 flex items-center space-x-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>SOC CONTROLS READY</span>
        </span>
      </div>

      {lastAction && (
        <div className="p-2.5 rounded-xl bg-cyan-950/60 border border-cyan-500/50 text-cyan-300 text-xs font-mono flex items-center space-x-2 animate-in fade-in duration-200">
          <Check className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>Action executed: <strong>{lastAction}</strong></span>
        </div>
      )}

      {/* Grid of 4 Action Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {/* Action 1: Trigger Secondary MFA */}
        <button
          onClick={() => handleAction(triggerSecondaryMFA, 'Secondary MFA Challenge Dispatched')}
          disabled={isTerminated}
          className="p-3 rounded-xl bg-slate-900/80 hover:bg-slate-800/90 border border-slate-800 hover:border-cyan-500/40 text-left transition-all group disabled:opacity-50 disabled:pointer-events-none"
        >
          <div className="flex items-center space-x-2.5 mb-1">
            <div className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-400 group-hover:scale-110 transition-transform">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold font-mono text-slate-200 group-hover:text-cyan-300">
              Trigger Secondary MFA
            </span>
          </div>
          <p className="text-[10.5px] text-slate-400 font-sans leading-tight">
            Send out-of-band biometric prompt to enrolled device.
          </p>
        </button>

        {/* Action 2: Request Callback */}
        <button
          onClick={() => handleAction(requestCallback, 'Out-of-Band Callback Enforced')}
          disabled={isTerminated}
          className="p-3 rounded-xl bg-slate-900/80 hover:bg-slate-800/90 border border-slate-800 hover:border-blue-500/40 text-left transition-all group disabled:opacity-50 disabled:pointer-events-none"
        >
          <div className="flex items-center space-x-2.5 mb-1">
            <div className="p-1.5 rounded-lg bg-blue-500/20 text-blue-400 group-hover:scale-110 transition-transform">
              <PhoneForwarded className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold font-mono text-slate-200 group-hover:text-blue-300">
              Request Callback
            </span>
          </div>
          <p className="text-[10.5px] text-slate-400 font-sans leading-tight">
            Force verification via registered corporate PSTN trunk.
          </p>
        </button>

        {/* Action 3: Escalate to Fraud Supervisor */}
        <button
          onClick={() => handleAction(escalateToSupervisor, 'Escalated to Tier-2 Fraud Ops')}
          disabled={isTerminated}
          className="p-3 rounded-xl bg-slate-900/80 hover:bg-slate-800/90 border border-slate-800 hover:border-amber-500/40 text-left transition-all group disabled:opacity-50 disabled:pointer-events-none"
        >
          <div className="flex items-center space-x-2.5 mb-1">
            <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 group-hover:scale-110 transition-transform">
              <UserX className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold font-mono text-slate-200 group-hover:text-amber-300">
              Escalate to Supervisor
            </span>
          </div>
          <p className="text-[10.5px] text-slate-400 font-sans leading-tight">
            Freeze associated funds and dispatch Tier-2 fraud investigator.
          </p>
        </button>

        {/* Action 4: Terminate Call (With Confirmation) */}
        {!confirmTerminate ? (
          <button
            onClick={() => setConfirmTerminate(true)}
            disabled={isTerminated}
            className="p-3 rounded-xl bg-rose-950/30 hover:bg-rose-900/40 border border-rose-600/40 hover:border-rose-500 text-left transition-all group disabled:opacity-50 disabled:pointer-events-none"
          >
            <div className="flex items-center space-x-2.5 mb-1">
              <div className="p-1.5 rounded-lg bg-rose-500/20 text-rose-400 group-hover:scale-110 transition-transform">
                <PhoneOff className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold font-mono text-rose-300 group-hover:text-rose-200">
                {isTerminated ? 'Trunk Disconnected' : 'Terminate Call'}
              </span>
            </div>
            <p className="text-[10.5px] text-rose-400/80 font-sans leading-tight">
              {isTerminated ? 'SIP session already terminated.' : 'Immediately sever SIP trunk & blacklist caller.'}
            </p>
          </button>
        ) : (
          <div className="p-3 rounded-xl bg-rose-950 border border-rose-500 flex flex-col justify-between space-y-2 animate-in zoom-in-95 duration-150">
            <div className="flex items-center space-x-2 text-rose-200 text-xs font-mono font-bold">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>Confirm SIP Disconnect?</span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => {
                  handleAction(terminateCall, 'SIP Trunk Terminated');
                  setConfirmTerminate(false);
                }}
                className="flex-1 py-1 px-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-[11px] font-mono font-bold transition-all"
              >
                Yes, Disconnect
              </button>
              <button
                onClick={() => setConfirmTerminate(false)}
                className="py-1 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-mono transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
