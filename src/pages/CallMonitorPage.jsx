import React, { useState } from 'react';
import { 
  PhoneCall, 
  Shield, 
  Activity, 
  Radio, 
  Zap, 
  FileText, 
  Lock, 
  RefreshCw,
  AlertOctagon,
  Volume2,
  Mic,
  Sliders
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import ActiveCallFeed from '../components/ActiveCallFeed';
import LiveCallWaveform from '../components/LiveCallWaveform';
import DynamicRiskGauge from '../components/DynamicRiskGauge';
import MultiLayerAnalysis from '../components/MultiLayerAnalysis';
import ActionableInterventions from '../components/ActionableInterventions';
import HighRiskAlertBanner from '../components/HighRiskAlertBanner';

/**
 * CallMonitorPage
 * Live Call Monitor & Threat Detection View (Core Screen).
 * Enterprise SOC operations center for real-time voice cloning and synthetic speech detection.
 */
export default function CallMonitorPage() {
  const { 
    selectedCall, 
    isSimulatingStream, 
    simulateLiveCall, 
    liveRiskScore,
    setActiveTab
  } = useApp();

  const [activeTabSub, setActiveTabSub] = useState('TRANSCRIPT'); // 'TRANSCRIPT' | 'SIP_SIGNALING'

  return (
    <div className="space-y-5 pb-12 animate-in fade-in duration-200">
      {/* High-Risk Sliding Warning Alert Banner */}
      <HighRiskAlertBanner />

      {/* Top SOC Action & Header Bar */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#0B0F19]/90 border border-slate-800/90 shadow-xl backdrop-blur-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">
              Enterprise Voice Security Operations Center (SOC)
            </span>
            <span className="text-slate-600">|</span>
            <span className="text-xs font-mono text-slate-400">TRUNKS MONITORED: 16/16</span>
          </div>
          <h2 className="text-2xl font-black text-white font-mono tracking-tight mt-1">
            Live Call Threat Monitor & Acoustic Telemetry
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Zero-latency deepfake synthesis inspection, neural vocoder artifact analysis, and voice biometric validation.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={simulateLiveCall}
            disabled={isSimulatingStream}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-mono font-bold text-xs flex items-center space-x-2 shadow-lg shadow-cyan-600/30 active:scale-95 transition-all disabled:opacity-50"
            title="Simulate mock streaming audio and dynamic threat assessment"
          >
            <Zap className={`w-4 h-4 ${isSimulatingStream ? 'animate-spin text-amber-300' : 'text-cyan-200'}`} />
            <span>{isSimulatingStream ? 'SIMULATING STREAM...' : '⚡ SIMULATE LIVE CALL'}</span>
          </button>

          <button
            onClick={() => setActiveTab('policy-config')}
            className="px-3 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 font-mono text-xs flex items-center space-x-1.5 transition-all"
            title="Configure Security Thresholds"
          >
            <Sliders className="w-4 h-4 text-slate-400" />
            <span className="hidden sm:inline">Policies</span>
          </button>
        </div>
      </div>

      {/* Main 3-Column SOC Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Left Column: Active Call Feed (3 cols) */}
        <div className="lg:col-span-3">
          <ActiveCallFeed />
        </div>

        {/* Center Column: Waveform, Telemetry & Live Transcript (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Live Waveform Visualizer */}
          <LiveCallWaveform 
            call={selectedCall} 
            isSimulating={isSimulatingStream} 
            liveRiskScore={liveRiskScore}
          />

          {/* Transcript & Signaling Telemetry Box */}
          <div className="p-4 rounded-2xl bg-[#0B0F19]/90 border border-slate-800/90 shadow-xl backdrop-blur-md space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4 text-cyan-400" />
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200">
                  Live Stream Transcript & Forensic Annotations
                </h3>
              </div>
              <div className="flex items-center space-x-1 bg-slate-950 p-0.5 rounded-lg border border-slate-800 text-[10px] font-mono">
                <button
                  onClick={() => setActiveTabSub('TRANSCRIPT')}
                  className={`px-2 py-0.5 rounded ${activeTabSub === 'TRANSCRIPT' ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-400'}`}
                >
                  Transcript
                </button>
                <button
                  onClick={() => setActiveTabSub('SIP_SIGNALING')}
                  className={`px-2 py-0.5 rounded ${activeTabSub === 'SIP_SIGNALING' ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-400'}`}
                >
                  SIP Headers
                </button>
              </div>
            </div>

            {activeTabSub === 'TRANSCRIPT' ? (
              <div className="space-y-2">
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 text-xs font-mono leading-relaxed text-slate-200">
                  <div className="text-[10px] text-cyan-400 mb-1 flex items-center justify-between">
                    <span>CALLER SPEECH RECOGNITION (STT ENGINE)</span>
                    <span className="text-slate-500">CONFIDENCE: 98.4%</span>
                  </div>
                  "{selectedCall?.transcript || 'No active speech audio detected on line.'}"
                </div>

                {/* Key Forensic Flag */}
                {selectedCall?.riskScore >= 70 ? (
                  <div className="p-2.5 rounded-xl bg-rose-950/30 border border-rose-600/30 text-[11px] font-mono text-rose-300 flex items-start space-x-2">
                    <span className="font-bold text-rose-400 shrink-0">FORENSIC FLAG:</span>
                    <span>
                      High-frequency energy anomalies detected near 3.8kHz consonant boundaries. Speech timing shows robotic micro-cadence consistency matching HiFi-GAN synthesis.
                    </span>
                  </div>
                ) : (
                  <div className="p-2.5 rounded-xl bg-emerald-950/30 border border-emerald-600/30 text-[11px] font-mono text-emerald-300 flex items-start space-x-2">
                    <span className="font-bold text-emerald-400 shrink-0">FORENSIC CLEARANCE:</span>
                    <span>
                      Natural biological glottal air pulses and breathing acoustics verified. Speaker embedding matches enrolled voice profile with 98.2% similarity.
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 font-mono text-[11px] text-slate-300 space-y-1 overflow-x-auto">
                <div><span className="text-cyan-400">INVITE</span> sip:{selectedCall?.callerId}@sbc-inbound.voiceguard.bank SIP/2.0</div>
                <div><span className="text-slate-500">Via:</span> SIP/2.0/TLS 198.51.100.42:5061;branch=z9hG4bK-74829</div>
                <div><span className="text-slate-500">From:</span> "{selectedCall?.callerName}" &lt;sip:{selectedCall?.callerId}&gt;;tag=8923a1</div>
                <div><span className="text-slate-500">To:</span> &lt;sip:transfers@voiceguard.bank&gt;</div>
                <div><span className="text-slate-500">Call-ID:</span> {selectedCall?.id}-4829104-vg@sbc01</div>
                <div><span className="text-slate-500">User-Agent:</span> VoiceGuard-SIP-Gateway/4.2-Secure</div>
                <div><span className="text-slate-500">Content-Type:</span> application/sdp (Audio: PCMU/8000 + Opus/48000)</div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Risk Gauge, Multi-Layer Breakdown & Interventions (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Dynamic Circular Risk Gauge */}
          <DynamicRiskGauge 
            riskScore={liveRiskScore} 
            call={selectedCall} 
            isSimulating={isSimulatingStream}
          />

          {/* Actionable Interventions Panel */}
          <ActionableInterventions call={selectedCall} />

          {/* Multi-Layer Forensic Telemetry Breakdown */}
          <MultiLayerAnalysis 
            call={selectedCall} 
            liveRiskScore={liveRiskScore}
          />
        </div>

      </div>
    </div>
  );
}
