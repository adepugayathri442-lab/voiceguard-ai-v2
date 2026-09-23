import React from 'react';
import { 
  HelpCircle, 
  ShieldCheck, 
  Cpu, 
  Activity, 
  KeyRound, 
  AlertTriangle, 
  FileText, 
  Volume2, 
  CheckCircle2, 
  Fingerprint, 
  Lock,
  Mic
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function HelpPage() {
  const { setActiveTab } = useApp();

  return (
    <div className="space-y-8 pb-16 max-w-4xl mx-auto">
      {/* Top Header */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
        <div className="inline-flex items-center space-x-2 px-2.5 py-1 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800 text-xs font-mono">
          <HelpCircle className="w-3.5 h-3.5" />
          <span>VOICEGUARD AI • USER & SYSTEM DOCUMENTATION</span>
        </div>
        <h2 className="text-3xl font-black text-white tracking-tight">System Knowledge Base & Guide</h2>
        <p className="text-sm text-slate-400 leading-relaxed">
          Learn how VoiceGuard AI detects voice cloning, how risk scoring works, and how to verify callers through biometric speaker verification.
        </p>
      </div>

      {/* Core Topics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
        
        {/* Topic 1 */}
        <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-2.5">
          <div className="flex items-center space-x-2 text-cyan-400">
            <Activity className="w-4 h-4" />
            <h3 className="text-sm font-bold text-white">What VoiceGuard AI Does</h3>
          </div>
          <p className="text-slate-300 leading-relaxed">
            VoiceGuard AI is an audio cybersecurity prototype built to combat telephone fraud, digital arrest scams, and impersonation attacks powered by generative AI voice cloning. It analyzes raw incoming speech in real time to differentiate authentic biological human voices from synthetic text-to-speech models and neural vocoders.
          </p>
        </div>

        {/* Topic 2 */}
        <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-2.5">
          <div className="flex items-center space-x-2 text-indigo-400">
            <Cpu className="w-4 h-4" />
            <h3 className="text-sm font-bold text-white">How Real-Time Voice Detection Works</h3>
          </div>
          <p className="text-slate-300 leading-relaxed">
            When microphone capture starts, Voice Activity Detection (VAD) monitors RMS energy. Once the user speaks, audio frames are buffered. After 3.5 seconds of valid speech, the audio buffer is processed to extract fundamental frequency (F0 pitch), micro-jitter, shimmer, spectral centroid, and spectral flatness.
          </p>
        </div>

        {/* Topic 3 */}
        <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-2.5">
          <div className="flex items-center space-x-2 text-rose-400">
            <AlertTriangle className="w-4 h-4" />
            <h3 className="text-sm font-bold text-white">What the Risk Score (0-100) Means</h3>
          </div>
          <p className="text-slate-300 leading-relaxed">
            The composite risk score measures synthetic and impersonation risk:
          </p>
          <ul className="space-y-1 text-slate-400 font-mono">
            <li>• <strong className="text-emerald-400">0–29 (LOW RISK):</strong> Natural biological vocal cords, organic pitch dynamics.</li>
            <li>• <strong className="text-amber-400">30–69 (MEDIUM RISK):</strong> Borderline acoustic stability or unknown speaker with normal biological properties.</li>
            <li>• <strong className="text-rose-400">70–100 (HIGH RISK):</strong> Synthetic vocoder indicators or high similarity to enrolled user with robotic artifacts.</li>
          </ul>
        </div>

        {/* Topic 4 */}
        <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-2.5">
          <div className="flex items-center space-x-2 text-emerald-400">
            <Fingerprint className="w-4 h-4" />
            <h3 className="text-sm font-bold text-white">Speaker Verification vs Voice Cloning</h3>
          </div>
          <p className="text-slate-300 leading-relaxed">
            A low speaker match is <strong>not</strong> automatically a voice clone. If an unfamiliar biological human speaks, VoiceGuard classifies them as an <strong className="text-white">UNKNOWN SPEAKER</strong> with moderate risk. An <strong className="text-rose-400">AI VOICE CLONE</strong> alert is only raised when high speaker similarity coincides with synthetic neural vocoder artifacts.
          </p>
        </div>

        {/* Topic 5 */}
        <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-2.5">
          <div className="flex items-center space-x-2 text-cyan-400">
            <Mic className="w-4 h-4" />
            <h3 className="text-sm font-bold text-white">How to Enroll a Trusted Voice</h3>
          </div>
          <p className="text-slate-300 leading-relaxed">
            Navigate to <strong>Trusted Voices</strong> and click <strong>"Enroll New Voice Profile"</strong>. Read the phonetic calibration sentence clearly into your microphone for 4.5 seconds. VoiceGuard extracts your baseline F0 pitch, spectral centroid, and timbre parameters and persists them in your local browser vault.
          </p>
        </div>

        {/* Topic 6 */}
        <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-2.5">
          <div className="flex items-center space-x-2 text-amber-400">
            <Lock className="w-4 h-4" />
            <h3 className="text-sm font-bold text-white">Microphone Permissions & Privacy</h3>
          </div>
          <p className="text-slate-300 leading-relaxed">
            Microphone capture is only activated when you click "Start Voice Detection". Audio processing is handled locally within your browser via the Web Audio API. No audio recordings are secretly uploaded or sold.
          </p>
        </div>
      </div>

      {/* Honest Engineering Disclosure */}
      <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 text-xs text-slate-400">
        <h4 className="font-bold text-white font-mono uppercase">Limitations of Heuristic Analysis:</h4>
        <p className="leading-relaxed">
          Local client-side acoustic heuristics evaluate physical acoustic properties (glottal pulse variations, harmonic roll-offs, and spectral flatness). While highly effective at exposing typical vocoder flatlines and robotic speech, state-of-the-art zero-shot voice cloning can occasionally mimic prosodic variations. For enterprise mission-critical defense, the application architecture includes swappable REST service hooks (<code className="text-cyan-400">VITE_ML_API_URL</code>) to connect to server-side deep learning models (e.g. AASIST / RawNet2 on ASVspoof datasets).
        </p>
      </div>
    </div>
  );
}
