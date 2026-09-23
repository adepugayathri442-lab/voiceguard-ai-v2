import React from 'react';
import { 
  PhoneCall, 
  SlidersHorizontal, 
  Lock, 
  LayoutDashboard, 
  Mic, 
  LineChart, 
  History, 
  BellRing, 
  BarChart3, 
  Users, 
  Settings, 
  HelpCircle,
  Sparkles
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function Sidebar() {
  const { activeTab, setActiveTab, sidebarOpen, alerts, settings } = useApp();
  const unreadAlerts = alerts.filter(a => !a.read).length;

  const navSections = [
    {
      title: 'CORE SOC OPERATIONS',
      items: [
        { id: 'call-monitor', label: 'Live Call Monitor', icon: PhoneCall, highlight: true },
        { id: 'policy-config', label: 'Policy Configuration', icon: SlidersHorizontal },
        { id: 'privacy-compliance', label: 'Privacy & Compliance', icon: Lock },
      ]
    },
    {
      title: 'ANALYTICS & INVESTIGATION',
      items: [
        { id: 'dashboard', label: 'SOC Dashboard', icon: LayoutDashboard },
        { id: 'live-detection', label: 'Live Mic Detection', icon: Mic },
        { id: 'voice-analysis', label: 'Spectrogram Lab', icon: LineChart },
        { id: 'history', label: 'Call History', icon: History },
        { id: 'alerts', label: 'Security Alerts', icon: BellRing, badge: unreadAlerts > 0 ? unreadAlerts : null },
        { id: 'analytics', label: 'Threat Analytics', icon: BarChart3 },
      ]
    },
    {
      title: 'VAULT & ADMINISTRATION',
      items: [
        { id: 'trusted-voices', label: 'Voiceprint Vault', icon: Users },
        { id: 'settings', label: 'System Settings', icon: Settings },
        { id: 'help', label: 'Help & Docs', icon: HelpCircle },
      ]
    }
  ];

  if (!sidebarOpen) return null;

  return (
    <aside className="w-64 shrink-0 bg-[#0A0F1D]/95 border-r border-slate-800/80 flex flex-col justify-between p-3.5 transition-all duration-200">
      <div className="space-y-4">
        {navSections.map((sec, sIdx) => (
          <div key={sIdx} className="space-y-1">
            <div className="px-3 py-1 text-[10px] font-mono tracking-wider text-slate-500 uppercase">
              {sec.title}
            </div>

            <nav className="space-y-0.5">
              {sec.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium font-mono transition-all ${
                      isActive
                        ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/40 shadow-sm shadow-cyan-500/10'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'} ${item.highlight && !isActive ? 'text-cyan-400 animate-pulse' : ''}`} />
                      <span>{item.label}</span>
                    </div>

                    {item.badge && (
                      <span className="px-1.5 py-0.5 text-[9px] font-bold rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        ))}
      </div>

      {/* Developer Test Bench notice */}
      {settings.demoMode && (
        <div className="mt-4 p-3 rounded-xl bg-gradient-to-b from-amber-950/20 to-slate-950 border border-amber-500/30 space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-amber-300">
            <div className="flex items-center space-x-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Demo Test Bench</span>
            </div>
            <span className="text-[9px] font-mono bg-amber-500/20 text-amber-300 px-1 py-0.5 rounded">DEV</span>
          </div>
          <p className="text-[10.5px] text-slate-400 leading-tight">
            Developer simulation mode is active.
          </p>
        </div>
      )}
    </aside>
  );
}
