import React, { useState, useRef, useEffect } from 'react';
import { 
  Users, 
  UserPlus, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  Trash2, 
  X, 
  Fingerprint, 
  Search,
  Mic,
  Square,
  Activity,
  Radio,
  AlertTriangle,
  Info
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { audioCaptureService } from '../services/audioCaptureService';
import { voiceActivityService } from '../services/voiceActivityService';
import { audioAnalysisService } from '../services/audioAnalysisService';

const CALIBRATION_SCRIPT = "VoiceGuard biometric enrollment: My voice is my identity passkey. I authorize voice integrity protection against unauthorized artificial cloning.";

export default function TrustedVoicesPage() {
  const { 
    trustedVoices, 
    enrollTrustedVoice, 
    deleteTrustedVoice, 
    showToast 
  } = useApp();

  const [modalOpen, setModalOpen] = useState(false);
  const [search, setSearch] = useState('');

  // Form State
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [relationship, setRelationship] = useState('Primary Identity');

  // Enrollment State
  const [enrollState, setEnrollState] = useState('IDLE'); // 'IDLE' | 'RECORDING' | 'ANALYZING' | 'SUCCESS' | 'ERROR'
  const [enrollError, setEnrollError] = useState(null);
  const [audioLevel, setAudioLevel] = useState(0);
  const [speechSeconds, setSpeechSeconds] = useState(0);
  const [voiceDetected, setVoiceDetected] = useState(false);

  const canvasRef = useRef(null);
  const animFrameRef = useRef(null);

  const filtered = trustedVoices.filter(v => 
    v.name.toLowerCase().includes(search.toLowerCase()) || 
    v.phone.includes(search)
  );

  useEffect(() => {
    return () => {
      stopEnrollmentCapture();
    };
  }, []);

  const stopEnrollmentCapture = () => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    audioCaptureService.cleanup();
  };

  /**
   * Start Live Microphone Enrollment
   */
  const handleStartEnrollment = async () => {
    setEnrollError(null);
    setAudioLevel(0);
    setSpeechSeconds(0);
    setVoiceDetected(false);
    setEnrollState('RECORDING');

    try {
      await audioCaptureService.startCapture();
      voiceActivityService.reset();

      const canvas = canvasRef.current;
      const ctx = canvas ? canvas.getContext('2d') : null;

      const loop = () => {
        if (!audioCaptureService.isRecording) return;

        const level = audioCaptureService.getAudioLevel();
        setAudioLevel(level);

        const vad = voiceActivityService.processFrame(level, 0.05);
        setSpeechSeconds(vad.speechSeconds);
        setVoiceDetected(vad.isSpeaking);

        // Render waveform
        if (canvas && ctx) {
          const timeData = audioCaptureService.getTimeDomainData();
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.beginPath();
          ctx.lineWidth = 2;
          ctx.strokeStyle = vad.isSpeaking ? 'rgb(6, 182, 212)' : 'rgba(100, 116, 139, 0.4)';

          const sliceWidth = canvas.width / timeData.length;
          let x = 0;
          for (let i = 0; i < timeData.length; i++) {
            const v = timeData[i] / 128.0;
            const y = (v * canvas.height) / 2;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
            x += sliceWidth;
          }
          ctx.stroke();
        }

        // Auto stop after 4.5s of real speech
        if (vad.speechSeconds >= 4.5) {
          handleStopAndSaveEnrollment();
          return;
        }

        animFrameRef.current = requestAnimationFrame(loop);
      };

      animFrameRef.current = requestAnimationFrame(loop);

    } catch (err) {
      console.error('Enrollment mic error:', err);
      stopEnrollmentCapture();
      setEnrollState('ERROR');
      setEnrollError('Microphone permission denied or device unavailable.');
    }
  };

  /**
   * Stop Recording, Validate Non-Silence, Extract Real Features, and Save
   */
  const handleStopAndSaveEnrollment = async () => {
    stopEnrollmentCapture();

    if (speechSeconds < 2.5) {
      setEnrollState('ERROR');
      setEnrollError('Do not enroll from silence! Please speak the calibration sentence into your microphone.');
      return;
    }

    setEnrollState('ANALYZING');

    try {
      const { audioBlob } = await audioCaptureService.stopCapture();
      if (!audioBlob || audioBlob.size === 0) {
        throw new Error('No audio data captured');
      }

      // Extract real acoustic parameters
      const features = await audioAnalysisService.extractForensicFeatures(audioBlob);

      const newProfile = {
        id: `tv-${Date.now().toString().slice(-4)}`,
        name: contactName.trim() || 'Registered Voice Profile',
        phone: contactPhone.trim() || '+91 98765 43210',
        relationship,
        fundamentalPitchHz: features.fundamentalPitchHz,
        spectralCentroidHz: features.spectralCentroidHz,
        jitterPercent: features.jitterPercent,
        shimmerPercent: features.shimmerPercent,
        harmonicsNoiseRatioDb: features.harmonicsNoiseRatioDb,
        mfccBands: features.mfccBands,
        sampleRate: features.sampleRate,
        registeredAt: new Date().toISOString()
      };

      enrollTrustedVoice(newProfile);
      setEnrollState('SUCCESS');
      setTimeout(() => {
        setModalOpen(false);
        setEnrollState('IDLE');
        setContactName('');
        setContactPhone('');
      }, 1200);

    } catch (err) {
      console.error('Enrollment extraction failed:', err);
      setEnrollState('ERROR');
      setEnrollError(`Failed to extract voice features: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-1 rounded-md bg-cyan-950 text-cyan-400 border border-cyan-800">
              <Users className="w-4 h-4" />
            </span>
            <span className="text-xs font-mono font-bold text-cyan-400 uppercase">Biometric Voice Vault</span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight mt-1">Trusted Voice Profiles</h2>
          <p className="text-xs text-slate-400">
            Enrolled acoustic parameters used to verify genuine callers and detect impersonation attempts.
          </p>
        </div>

        <button
          onClick={() => {
            setEnrollState('IDLE');
            setEnrollError(null);
            setModalOpen(true);
          }}
          className="px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow-lg shadow-cyan-600/25 flex items-center space-x-2 transition-all active:scale-95"
        >
          <UserPlus className="w-3.5 h-3.5" />
          <span>Enroll New Voice Profile</span>
        </button>
      </div>

      {/* Search bar */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search profile name or phone..."
          className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
        />
      </div>

      {/* Profiles Grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(contact => (
            <div
              key={contact.id}
              className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-slate-700 transition-all space-y-4"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-cyan-950 border border-cyan-800/60 flex items-center justify-center text-cyan-400">
                    <Fingerprint className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">{contact.name}</h4>
                    <p className="text-[11px] text-slate-400">{contact.relationship}</p>
                  </div>
                </div>

                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
                  {contact.status || 'ENROLLED'}
                </span>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5 text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-500">PHONE:</span>
                  <span className="text-white font-bold">{contact.phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">BASELINE PITCH (F0):</span>
                  <span className="text-cyan-400 font-bold">{contact.baselinePitchHz || 135} Hz</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">SPECTRAL CENTROID:</span>
                  <span className="text-slate-300">{contact.spectralCentroidHz || 2200} Hz</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">REGISTERED:</span>
                  <span className="text-slate-400">{contact.registeredAt ? contact.registeredAt.slice(0, 10) : 'Today'}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-slate-800">
                <span className="text-[10px] font-mono text-slate-500">ID: {contact.id}</span>
                <button
                  onClick={() => deleteTrustedVoice(contact.id)}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                  title="Remove Profile"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-16 text-center bg-slate-900/40 rounded-2xl border border-slate-800 space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-800 text-slate-500 flex items-center justify-center mx-auto">
            <Fingerprint className="w-6 h-6" />
          </div>
          <h4 className="text-base font-bold text-white">No Trusted Voice Profiles Enrolled</h4>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Enroll your voice or family members to establish an acoustic baseline and detect unauthorized voice cloning.
          </p>
        </div>
      )}

      {/* Real Microphone Enrollment Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#0E1526] border border-slate-700 rounded-2xl max-w-lg w-full p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <Fingerprint className="w-5 h-5 text-cyan-400" />
                <h3 className="text-base font-bold text-white">Live Microphone Voice Enrollment</h3>
              </div>
              <button 
                onClick={() => {
                  stopEnrollmentCapture();
                  setModalOpen(false);
                }}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Step 1: Contact Details */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-mono text-slate-300 mb-1">Full Name</label>
                <input
                  type="text"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  placeholder="e.g. My Primary Voice"
                  disabled={enrollState === 'RECORDING'}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white font-mono focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="block font-mono text-slate-300 mb-1">Phone Number</label>
                <input
                  type="text"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  placeholder="e.g. +91 98765 43210"
                  disabled={enrollState === 'RECORDING'}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white font-mono focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            {/* Step 2: Calibration Prompt */}
            <div className="p-4 rounded-xl bg-slate-950 border border-cyan-500/30 space-y-1.5">
              <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider block font-bold">
                PHONETIC CALIBRATION SCRIPT (READ ALOUD):
              </span>
              <p className="text-xs text-slate-200 italic leading-relaxed">
                "{CALIBRATION_SCRIPT}"
              </p>
            </div>

            {/* Step 3: Waveform & VAD Feedback */}
            <div className="h-24 bg-slate-950 rounded-xl border border-slate-800 p-2 flex flex-col justify-between">
              <div className="flex justify-between text-[10px] font-mono text-slate-400">
                <span>VAD: {voiceDetected ? '✓ SPEECH DETECTED' : 'WAITING FOR SPEECH'}</span>
                <span>SPEECH: {speechSeconds}s / 4.5s</span>
              </div>

              <div className="flex-1 flex items-center justify-center">
                <canvas 
                  ref={canvasRef} 
                  width={400} 
                  height={60} 
                  className="w-full h-full block" 
                />
              </div>

              <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-cyan-400 transition-all duration-100"
                  style={{ width: `${Math.min(100, (speechSeconds / 4.5) * 100)}%` }}
                />
              </div>
            </div>

            {/* Error Message */}
            {enrollError && (
              <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-500/50 text-rose-300 text-xs flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{enrollError}</span>
              </div>
            )}

            {/* Success */}
            {enrollState === 'SUCCESS' && (
              <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-500/50 text-emerald-300 text-xs flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>Voice Profile extracted & successfully saved to vault!</span>
              </div>
            )}

            {/* Modal Controls */}
            <div className="flex justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  stopEnrollmentCapture();
                  setModalOpen(false);
                }}
                className="px-4 py-2 text-slate-400 hover:text-white text-xs"
              >
                Cancel
              </button>

              {enrollState !== 'RECORDING' ? (
                <button
                  type="button"
                  onClick={handleStartEnrollment}
                  className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center space-x-2 shadow-lg shadow-cyan-600/30"
                >
                  <Mic className="w-4 h-4" />
                  <span>Start Recording (4.5s)</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleStopAndSaveEnrollment}
                  className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center space-x-2 shadow-lg shadow-rose-600/30 animate-pulse"
                >
                  <Square className="w-4 h-4 fill-current" />
                  <span>Stop & Save Voice Profile</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
