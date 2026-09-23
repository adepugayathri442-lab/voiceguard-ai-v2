import React from 'react';
import { 
  Shield, 
  Activity, 
  Zap, 
  Bell, 
  Menu, 
  X, 
  Radio, 
  Cpu, 
  SlidersHorizontal,
  Lock
} from 'lucide-react';
import { useApp } from '../context/AppContext';

/**
 * Navbar
 * High-end Enterprise SOC sticky navigation header with live system health and telemetry indicators.
 */
export default function Navbar() {
  const { 
    activeTab, 
    setActiveTab, 
    sidebarOpen, 
    setSidebarOpen, 
    alerts, 
    simulateLiveCall, 
    isSimulatingStream,
    activeCallFeed 
  } = useApp();

  const unreadAlerts = alerts.filter(a => !a.read).length;
  const activeTrunkCount = activeCallFeed.filter(c => c.status !== 'TERMINATED').length;

  return (
    <header className="sticky top-0 z-40 w-full bg-[#070B14]/95 backdrop-blur-md border-b border-slate-800/90 px-4 lg:px-6 py-2.5">
      <div className="flex items-center justify-between">
        
        {/* Left: Sidebar Toggle & Brand */}
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-slate-800/60 transition-colors focus:outline-none focus:ring-1 focus:ring-cyan-500"
            title="Toggle Sidebar"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <button 
            onClick={() => setActiveTab('landing')}
            className="flex items-center space-x-2.5 text-left group"
          >
            <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-600 via-blue-600 to-indigo-600 p-0.5 shadow-lg shadow-cyan-500/20">
              <div className="w-full h-full bg-[#070B14] rounded-[10px] flex items-center justify-center">
                <Shield className="w-5 h-5 text-cyan-400 group-hover:scale-110 transition-transform" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-extrabold text-lg tracking-tight text-white font-mono">VOICE<span className="text-cyan-400">GUARD</span></span>
                <span className="px-1.5 py-0.2 text-[9px] font-mono font-bold tracking-wide uppercase rounded bg-cyan-950 text-cyan-400 border border-cyan-800/50">ENTERPRISE SOC</span>
              </div>
              <p className="text-[10px] text-slate-400 font-mono -mt-0.5 hidden sm:block">Real-Time Impersonation & Clone Defense</p>
            </div>
          </button>
        </div>

        {/* Center: System Health Telemetry Pill */}
        <div className="hidden xl:flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-slate-700/60 shadow-inner font-mono text-xs">
          <div className="flex items-center space-x-1.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-semibold text-emerald-400 tracking-wider">TELEMETRY: ONLINE</span>
          </div>

          <span className="text-slate-600">|</span>
          <span className="text-slate-300">LATENCY: <strong className="text-cyan-400">42ms</strong></span>

          <span className="text-slate-600">|</span>
          <span className="text-slate-300">SIP TRUNKS: <strong className="text-cyan-400">{activeTrunkCount}/16</strong></span>

          <span className="text-slate-600">|</span>
          <span className="text-slate-400">MODEL: <strong className="text-indigo-300">ResNet-BiLSTM v4.2</strong></span>
        </div>

        {/* Right: Actions & Status */}
        <div className="flex items-center space-x-2.5">
          {/* Simulate Live Call Button */}
          <button
            onClick={simulateLiveCall}
            disabled={isSimulatingStream}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 text-xs font-mono font-bold rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-md shadow-cyan-600/30 transition-all active:scale-95 disabled:opacity-50"
            title="Trigger mock streaming call to test dynamic detection and alert banner"
          >
            <Zap className={`w-3.5 h-3.5 ${isSimulatingStream ? 'animate-spin text-amber-300' : 'fill-current'}`} />
            <span className="hidden sm:inline">{isSimulatingStream ? 'Simulating...' : '⚡ Simulate Live Call'}</span>
          </button>

          {/* Policy Configuration Button */}
          <button
            onClick={() => setActiveTab('policy-config')}
            className={`p-2 rounded-xl border transition-colors ${
              activeTab === 'policy-config'
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60 border-slate-800'
            }`}
            title="Enterprise Policies & Rules"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>

          {/* Privacy & Compliance Button */}
          <button
            onClick={() => setActiveTab('privacy-compliance')}
            className={`p-2 rounded-xl border transition-colors ${
              activeTab === 'privacy-compliance'
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60 border-slate-800'
            }`}
            title="Privacy & Compliance Dashboard"
          >
            <Lock className="w-4 h-4" />
          </button>

          {/* Alerts button */}
          <button
            onClick={() => setActiveTab('alerts')}
            className={`relative p-2 rounded-xl border transition-colors ${
              activeTab === 'alerts'
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60 border-slate-800'
            }`}
            title="Security Alerts"
          >
            <Bell className="w-4 h-4" />
            {unreadAlerts > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow">
                {unreadAlerts}
              </span>
            )}
          </button>

          {/* User profile / System tag */}
          <div className="hidden lg:flex items-center pl-2 border-l border-slate-800 text-[11px] text-slate-400 font-mono">
            <span className="inline-block w-2 h-2 rounded-full bg-cyan-400 mr-2"></span>
            NODE-MUMBAI-01
          </div>
        </div>

      </div>
    </header>
  );
}
