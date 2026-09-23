import React, { useState, useRef } from 'react';
import { 
  LineChart, 
  Upload, 
  Mic, 
  Download, 
  KeyRound, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  Play, 
  Pause,
  RotateCcw,
  Activity,
  Cpu
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { audioAnalysisService } from '../services/audioAnalysisService';
import { speakerVerificationService } from '../services/speakerVerificationService';
import { PitchContourChart, MFCCBars, SpectrogramHeatmap } from '../components/ForensicCharts';
import RiskGauge from '../components/RiskGauge';
import DeepfakeSignalBreakdown from '../components/DeepfakeSignalBreakdown';
import { analyzeVoice } from '../services/voiceDetectionService';

export default function VoiceAnalysisPage() {
  const { 
    lastDetection, 
    recordDetectionEvent, 
    handleStartIndependentVerification, 
    handleSaveEvidence,
    showToast 
  } = useApp();

  const [currentAnalysis, setCurrentAnalysis] = useState(lastDetection);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const fileInputRef = useRef(null);
  const audioPlayerRef = useRef(null);

  /**
   * Handle Audio File Upload and Offline Decoding Analysis
   */
  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate mime type or extension
    const validTypes = ['audio/wav', 'audio/mpeg', 'audio/mp3', 'audio/ogg', 'audio/webm', 'audio/x-m4a', 'audio/mp4'];
    const validExts = ['.wav', '.mp3', '.m4a', '.webm', '.ogg', '.aac'];
    const hasValidExt = validExts.some(ext => file.name.toLowerCase().endsWith(ext));

    if (!validTypes.includes(file.type) && !hasValidExt) {
      setUploadError('Invalid audio format. Please upload a standard audio file (.wav, .mp3, .m4a, .webm, .ogg).');
      showToast('Unsupported audio file format.', 'error');
      return;
    }

    setUploadError(null);
    setIsProcessing(true);

    try {
      const previewUrl = URL.createObjectURL(file);
      setAudioUrl(previewUrl);

      // Run unified audio and probabilistic deepfake analysis
      const report = await analyzeVoice(file, { 
        name: 'Uploaded Audio Evidence', 
        number: file.name 
      });

      setCurrentAnalysis(report);
      recordDetectionEvent(report);
      showToast(`File analyzed: ${report.classification} (${report.confidence}% confidence)`, 'info');

    } catch (err) {
      console.error('File upload analysis error:', err);
      setUploadError(`Failed to decode and analyze audio: ${err.message}`);
      showToast('Audio decoding failed.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const toggleAudio = () => {
    if (!audioPlayerRef.current) return;
    if (isPlaying) {
      audioPlayerRef.current.pause();
      setIsPlaying(false);
    } else {
      audioPlayerRef.current.play();
      setIsPlaying(true);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-1 rounded-md bg-cyan-950 text-cyan-400 border border-cyan-800">
              <LineChart className="w-4 h-4" />
            </span>
            <span className="text-xs font-mono font-bold text-cyan-400 uppercase">Forensic Audio Inspection</span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight mt-1">Multi-Band Voice Analysis Lab</h2>
          <p className="text-xs text-slate-400">
            Inspect physical glottal pulses, pitch F0 contours, spectral flatness, and vocoder phase anomalies.
          </p>
        </div>

        {/* Action: Upload File */}
        <div className="flex items-center space-x-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="audio/*,.wav,.mp3,.m4a,.webm,.ogg"
            className="hidden"
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isProcessing}
            className="px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow-lg shadow-cyan-600/25 flex items-center space-x-2 transition-all disabled:opacity-50"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload Audio File</span>
          </button>

          {currentAnalysis && (
            <button
              onClick={() => handleSaveEvidence(currentAnalysis)}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center space-x-1.5 transition-all"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              <span>Export JSON Report</span>
            </button>
          )}
        </div>
      </div>

      {/* Upload Error Banner */}
      {uploadError && (
        <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/50 flex items-start space-x-3">
          <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div className="text-xs text-rose-200">
            <p className="font-bold">{uploadError}</p>
          </div>
        </div>
      )}

      {/* Processing Spinner */}
      {isProcessing && (
        <div className="p-12 text-center bg-slate-900/40 rounded-2xl border border-slate-800 space-y-3">
          <div className="w-10 h-10 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-mono text-cyan-400">Preprocessing audio, encoding 16kHz PCM bytes, and running real AI model inference...</p>
        </div>
      )}

      {/* Active Analysis Dashboard */}
      {!isProcessing && currentAnalysis ? (
        <div className="space-y-6">
          {/* Main Inspection Card */}
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left 2 Cols: Key Metrics */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div>
                  <span className="text-[10px] font-mono text-slate-500 uppercase">CASE ID: {currentAnalysis.id}</span>
                  <h3 className="text-lg font-bold text-white mt-0.5">{currentAnalysis.caller}</h3>
                </div>
                <span className={`px-2.5 py-1 rounded text-xs font-mono font-bold uppercase ${
                  currentAnalysis.riskScore >= 70 ? 'bg-rose-950 text-rose-400 border border-rose-800' :
                  currentAnalysis.riskScore >= 30 ? 'bg-amber-950 text-amber-400 border border-amber-800' :
                  'bg-emerald-950 text-emerald-400 border border-emerald-800'
                }`}>
                  {currentAnalysis.classification}
                </span>
              </div>

              {/* Physical Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 font-mono text-xs">
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">FUNDAMENTAL PITCH (F0)</span>
                  <p className="text-base font-bold text-white mt-1">
                    {currentAnalysis.features?.fundamentalPitchHz} Hz
                  </p>
                  <span className="text-[10px] text-slate-400">Std Dev: ±{currentAnalysis.features?.pitchStdDev} Hz</span>
                </div>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">MICRO-JITTER</span>
                  <p className="text-base font-bold text-white mt-1">
                    {currentAnalysis.features?.jitterPercent}%
                  </p>
                  <span className="text-[10px] text-slate-400">Shimmer: {currentAnalysis.features?.shimmerPercent}%</span>
                </div>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">SPECTRAL CENTROID</span>
                  <p className="text-base font-bold text-white mt-1">
                    {currentAnalysis.features?.spectralCentroidHz} Hz
                  </p>
                  <span className="text-[10px] text-slate-400">Flatness: {currentAnalysis.features?.spectralFlatness}</span>
                </div>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">ZERO CROSSING RATE</span>
                  <p className="text-base font-bold text-white mt-1">
                    {currentAnalysis.features?.zeroCrossingRate}
                  </p>
                  <span className="text-[10px] text-slate-400">Sample Rate: {currentAnalysis.features?.sampleRate} Hz</span>
                </div>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">SPEAKER MATCH</span>
                  <p className="text-base font-bold text-cyan-400 mt-1">
                    {currentAnalysis.speakerMatch ? `${currentAnalysis.speakerMatch}%` : 'Not Enrolled'}
                  </p>
                  <span className="text-[10px] text-slate-400">{currentAnalysis.speakerVerification?.label || 'Vault Check'}</span>
                </div>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">SIGNAL QUALITY</span>
                  <p className="text-base font-bold text-emerald-400 mt-1">
                    {currentAnalysis.features?.signalQuality}%
                  </p>
                  <span className="text-[10px] text-slate-400">Voice Activity: {currentAnalysis.features?.voiceActivityRatio}%</span>
                </div>
              </div>

              {/* Indicator List */}
              <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5">
                <span className="text-[10px] font-mono uppercase text-slate-400 font-bold">Forensic Telemetry Findings:</span>
                {currentAnalysis.indicators?.map((ind, i) => (
                  <div key={i} className="flex items-start space-x-2 text-xs text-slate-300">
                    <span className="text-cyan-400">▶</span>
                    <span>{ind}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Col: Gauge */}
            <div className="flex flex-col justify-center">
              <RiskGauge 
                score={currentAnalysis.riskScore} 
                confidence={currentAnalysis.confidence}
                status={currentAnalysis.riskScore >= 70 ? 'AI_CLONE' : currentAnalysis.riskScore >= 30 ? 'SUSPICIOUS' : 'HUMAN'}
              />
            </div>
          </div>

          {/* Real AI Deepfake Voice Detection & Contributing Signal Breakdown */}
          {currentAnalysis && (
            <DeepfakeSignalBreakdown 
              detectionResult={currentAnalysis} 
              onFlagFeedback={() => showToast('Audit feedback saved for model verification', 'success')}
            />
          )}

          {/* Deep Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <PitchContourChart scenario={currentAnalysis.riskScore >= 70 ? 'AI_CLONE' : currentAnalysis.riskScore >= 30 ? 'SUSPICIOUS' : 'HUMAN'} />
            <MFCCBars scenario={currentAnalysis.riskScore >= 70 ? 'AI_CLONE' : currentAnalysis.riskScore >= 30 ? 'SUSPICIOUS' : 'HUMAN'} />
          </div>

          <div className="grid grid-cols-1 gap-6">
            <SpectrogramHeatmap scenario={currentAnalysis.riskScore >= 70 ? 'AI_CLONE' : currentAnalysis.riskScore >= 30 ? 'SUSPICIOUS' : 'HUMAN'} />
          </div>
        </div>
      ) : (
        /* Empty State */
        <div className="p-16 text-center bg-slate-900/40 rounded-2xl border border-slate-800 space-y-4">
          <div className="w-14 h-14 rounded-full bg-slate-800 text-slate-500 flex items-center justify-center mx-auto">
            <LineChart className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-white">No Audio Sample Currently Selected</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Upload any recorded voice audio file (.wav, .mp3, .m4a) to calculate complete forensic features, or perform a live voice analysis from the Live Detection console.
          </p>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold font-mono transition-all inline-flex items-center space-x-2 shadow-lg shadow-cyan-600/25"
          >
            <Upload className="w-4 h-4" />
            <span>Select Audio File to Analyze</span>
          </button>
        </div>
      )}
    </div>
  );
}
