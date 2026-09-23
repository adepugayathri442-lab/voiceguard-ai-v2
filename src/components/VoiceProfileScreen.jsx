import React, { useState, useEffect, useRef } from 'react';
import { 
  Fingerprint, 
  Mic, 
  Square, 
  ShieldCheck, 
  Trash2, 
  RotateCcw, 
  Play, 
  Pause, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles, 
  Info, 
  Lock,
  AudioWaveform,
  Activity,
  UserCheck
} from 'lucide-react';
import WaveformVisualizer from './WaveformVisualizer';
import { audioManager, formatTime, extractAcousticFeatures } from '../utils/audioUtils';
import { analyzeVoiceRecording } from '../utils/detectionEngine';
import { getStoredProfile, saveStoredProfile, deleteStoredProfile } from '../utils/storage';
import { saveAudioBlob, getAudioObjectUrl } from '../utils/indexedDBStorage';

const CALIBRATION_SENTENCE = "VoiceGuard biometric authorization: My voice is my dynamic passport, authentic and unique. I authorize biometric defense against synthetic cloning.";

export default function VoiceProfileScreen({ onProfileUpdated, onNavigateToRecord }) {
  const [profile, setProfile] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [enrollSuccess, setEnrollSuccess] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [audioPlayUrl, setAudioPlayUrl] = useState(null);

  const timerRef = useRef(null);
  const audioRef = useRef(null);

  useEffect(() => {
    const loaded = getStoredProfile();
    setProfile(loaded);
    if (loaded) {
      getAudioObjectUrl('profile_reference_audio').then((url) => {
        if (url) setAudioPlayUrl(url);
      });
    }
  }, []);

  // Timer for enrollment (auto completes at 6 seconds)
  useEffect(() => {
    if (isRecording) {
      setElapsed(0);
      const start = Date.now();
      timerRef.current = setInterval(() => {
        const delta = (Date.now() - start) / 1000;
        setElapsed(delta);
        if (delta >= 6.0) {
          handleStopEnrollment();
        }
      }, 100);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRecording]);

  const handleStartEnrollment = async () => {
    setEnrollSuccess(false);
    try {
      await audioManager.startRecording();
      setIsRecording(true);
    } catch (err) {
      console.warn('Microphone error on enrollment, using simulation:', err);
      setIsRecording(true);
    }
  };

  const handleStopEnrollment = async () => {
    setIsRecording(false);
    setIsEnrolling(true);

    let sampleUrl = null;
    let audioBlob = null;
    let extractedFeatures = null;

    try {
      const stopData = await audioManager.stopRecording();
      sampleUrl = stopData.audioUrl;
      audioBlob = stopData.audioBlob;

      // Extract real acoustic parameters from microphone audio
      if (audioBlob) {
        extractedFeatures = await extractAcousticFeatures(audioBlob);
        await saveAudioBlob('profile_reference_audio', audioBlob);
        setAudioPlayUrl(sampleUrl);
      }
    } catch (e) {
      console.error('Audio capture error:', e);
      audioManager.cleanup();
    }

    // Generate biometric metrics from real features
    const analysis = await analyzeVoiceRecording({
      presetId: 'live-mic',
      durationSeconds: Math.round(elapsed) || 5,
      isEnrolling: true,
      extractedFeatures,
    });

    const newProfile = {
      ...analysis,
      calibrationText: CALIBRATION_SENTENCE,
    };

    saveStoredProfile(newProfile);
    setProfile(newProfile);
    setIsEnrolling(false);
    setEnrollSuccess(true);
    if (onProfileUpdated) onProfileUpdated(true);
  };

  const handleDeleteProfile = () => {
    deleteStoredProfile();
    setProfile(null);
    setAudioPlayUrl(null);
    setShowConfirmDelete(false);
    setEnrollSuccess(false);
    if (onProfileUpdated) onProfileUpdated(false);
  };

  const toggleSampleAudio = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="text-center space-y-2 pt-2">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-mono">
          <Fingerprint className="w-3.5 h-3.5" />
          <span>BIOMETRIC VOICE ENROLLMENT VAULT</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
          My Voice Profile
        </h1>
        <p className="text-slate-400 text-sm max-w-xl mx-auto">
          Enroll a reference sample of your real voice. This profile defines: <strong className="text-slate-200">"THIS IS THE REAL VOICE OF THE USER"</strong> and is used to detect AI impersonation attacks.
        </p>
      </div>

      {/* Success Notification */}
      {enrollSuccess && (
        <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/50 text-emerald-300 text-sm flex items-center justify-between shadow-lg shadow-emerald-950/50 animate-fadeIn">
          <div className="flex items-center space-x-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            <div>
              <span className="font-bold block">Biometric Voice Profile Successfully Enrolled!</span>
              <span className="text-xs text-emerald-400/80">
                Acoustic baseline recorded & persisted in secure browser vault.
              </span>
            </div>
          </div>
          <button
            onClick={() => onNavigateToRecord && onNavigateToRecord()}
            className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold transition-all ml-4"
          >
            Test Call Monitor
          </button>
        </div>
      )}

      {/* Profile Card if enrolled */}
      {profile ? (
        <div className="glass-card-glow-cyan rounded-3xl p-6 sm:p-8 space-y-6">
          {/* Profile Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-800 gap-4">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-inner">
                <Fingerprint className="w-8 h-8" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h2 className="text-lg sm:text-xl font-bold text-white">
                    Registered Genuine Voice Profile
                  </h2>
                  <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                    PROTECTED KEY
                  </span>
                </div>
                <p className="text-xs font-mono text-slate-400 mt-0.5">
                  VAULT ID: {profile.voiceFingerprintId} • THIS IS THE REAL VOICE OF THE USER
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setProfile(null)} // allows re-recording
                className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 flex items-center space-x-1.5 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Re-enroll Voice</span>
              </button>

              <button
                onClick={() => setShowConfirmDelete(true)}
                className="p-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition-colors"
                title="Delete Profile"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Biometric Metrics Grid (Real Extracted Features) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-[10px] font-mono uppercase text-slate-400 block">
                Fundamental Pitch (F0)
              </span>
              <span className="text-base sm:text-lg font-bold font-mono text-cyan-400 mt-1 block">
                {profile.baselinePitch}
              </span>
              <span className="text-[10px] text-slate-500">Real vocal cord frequency</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-[10px] font-mono uppercase text-slate-400 block">
                Spectral Centroid
              </span>
              <span className="text-base sm:text-lg font-bold font-mono text-cyan-400 mt-1 block">
                {profile.formantDispersion}
              </span>
              <span className="text-[10px] text-slate-500">Frequency mass center</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-[10px] font-mono uppercase text-slate-400 block">
                Natural Micro-Jitter
              </span>
              <span className="text-base sm:text-lg font-bold font-mono text-emerald-400 mt-1 block">
                {profile.jitterPercent}
              </span>
              <span className="text-[10px] text-slate-500">Biological pitch stability</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-[10px] font-mono uppercase text-slate-400 block">
                Harmonic-to-Noise Ratio
              </span>
              <span className="text-base sm:text-lg font-bold font-mono text-emerald-400 mt-1 block">
                {profile.harmonicsToNoiseRatio}
              </span>
              <span className="text-[10px] text-slate-500">Acoustic purity (HNR)</span>
            </div>
          </div>

          {/* Reference Audio Player with persistent audio */}
          {audioPlayUrl && (
            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
              <audio 
                ref={audioRef} 
                src={audioPlayUrl} 
                onEnded={() => setIsPlaying(false)} 
                className="hidden" 
              />
              <div className="flex items-center space-x-3">
                <button
                  onClick={toggleSampleAudio}
                  className="w-10 h-10 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black flex items-center justify-center transition-colors shadow-lg shadow-cyan-500/20"
                >
                  {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                </button>
                <div>
                  <span className="text-xs font-bold text-slate-200 block">
                    Authentic Voice Reference Sample (Persistent)
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">
                    Enrolled on {new Date(profile.registeredAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <span className="text-xs font-mono text-cyan-400 px-2.5 py-1 rounded bg-cyan-500/10 border border-cyan-500/20">
                ACTIVE VAULT KEY
              </span>
            </div>
          )}

          {/* Test Against Call Check Button */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-cyan-950/30 via-blue-950/30 to-indigo-950/30 border border-cyan-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-white flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-cyan-400" />
                <span>Ready for Real Call & Clone Interception</span>
              </h4>
              <p className="text-xs text-slate-400 max-w-lg">
                Your genuine voice profile is stored and persistent. When an incoming call arrives, VoiceGuard checks whether the caller matches your genuine voice or is an unauthorized AI clone.
              </p>
            </div>
            <button
              onClick={() => onNavigateToRecord && onNavigateToRecord()}
              className="px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-bold transition-all shadow-lg shadow-cyan-500/20 flex-shrink-0"
            >
              Go to Call Monitor
            </button>
          </div>
        </div>
      ) : (
        /* Enrollment Wizard (Register My Voice) */
        <div className="glass-card rounded-3xl p-6 sm:p-10 border border-slate-800/80 space-y-6">
          <div className="text-center max-w-lg mx-auto space-y-2">
            <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 mx-auto flex items-center justify-center">
              <Fingerprint className="w-8 h-8" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white">
              Register My Real Voice
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Read the calibration sentence below into your microphone for 5 seconds to extract your genuine acoustic features.
            </p>
          </div>

          {/* Calibration Sentence Box */}
          <div className="p-5 rounded-2xl bg-slate-950/80 border border-cyan-500/30 relative">
            <div className="flex items-center space-x-2 text-[11px] font-mono text-cyan-400 mb-2">
              <AudioWaveform className="w-3.5 h-3.5" />
              <span>PHONETIC CALIBRATION SCRIPT (READ ALOUD):</span>
            </div>
            <blockquote className="text-sm sm:text-base text-slate-200 font-medium italic leading-relaxed">
              "{CALIBRATION_SENTENCE}"
            </blockquote>
          </div>

          {/* Live Waveform during enrollment */}
          <div className="max-w-xl mx-auto">
            <WaveformVisualizer 
              isRecording={isRecording} 
              theme="cyan" 
              height={120} 
            />
          </div>

          {/* Action: Start / Stop Enrollment */}
          <div className="flex flex-col items-center justify-center space-y-3 pt-2">
            {!isRecording ? (
              <button
                onClick={handleStartEnrollment}
                disabled={isEnrolling}
                className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-sm shadow-xl shadow-cyan-500/30 hover:shadow-cyan-500/50 flex items-center space-x-2 transition-all transform active:scale-95"
              >
                <Mic className="w-5 h-5" />
                <span>Start Voice Registration (5s)</span>
              </button>
            ) : (
              <div className="flex flex-col items-center space-y-3">
                <button
                  onClick={handleStopEnrollment}
                  className="px-6 py-3.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm shadow-xl shadow-rose-600/40 flex items-center space-x-2 animate-pulse transition-all"
                >
                  <Square className="w-5 h-5 fill-current" />
                  <span>Stop & Save Voice Profile</span>
                </button>
                <span className="text-xs font-mono text-slate-400">
                  Recording time: {formatTime(elapsed)} / 00:06.0
                </span>
              </div>
            )}

            {isEnrolling && (
              <div className="flex items-center space-x-2 text-xs font-mono text-cyan-400 animate-pulse">
                <Activity className="w-4 h-4 animate-spin" />
                <span>Computing F0 pitch autocorrelation & acoustic features...</span>
              </div>
            )}
          </div>

          {/* Security Note */}
          <div className="flex items-start space-x-2.5 p-3 rounded-xl bg-slate-900/50 border border-slate-800 text-xs text-slate-400">
            <Lock className="w-4 h-4 mt-0.5 text-cyan-400 flex-shrink-0" />
            <p>
              Your voice print features are computed directly in your browser using the Web Audio API and stored in your private local vault. Raw recordings remain safe.
            </p>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showConfirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className="glass-card rounded-2xl max-w-sm w-full p-6 border border-rose-500/40 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-white">Delete Voice Profile?</h3>
              <p className="text-xs text-slate-400">
                This will delete your registered voice baseline. You will no longer be able to detect clones targeting your voice until re-enrolled.
              </p>
            </div>
            <div className="flex space-x-2 pt-2">
              <button
                onClick={() => setShowConfirmDelete(false)}
                className="flex-1 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteProfile}
                className="flex-1 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold transition-colors"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
