import React, { useRef, useEffect, useState } from 'react';
import { Activity, Radio, Cpu, Wifi, Zap, Volume2, Maximize2 } from 'lucide-react';

/**
 * LiveCallWaveform
 * High-performance 60fps HTML5 Canvas dual-channel visualizer.
 * Renders live oscilloscope trace, 32-band FFT spectral bars, and SIP network telemetry.
 */
export default function LiveCallWaveform({ 
  call, 
  isSimulating = false,
  liveRiskScore = 0
}) {
  const canvasRef = useRef(null);
  const [activeMode, setActiveMode] = useState('DUAL_CHANNEL'); // 'DUAL_CHANNEL' | 'FFT_SPECTRUM' | 'PHASE_LISSAJOUS'
  const animFrameId = useRef(null);

  // Derive waveform characteristics based on threat level / call type
  const isAttack = call?.waveformType === 'CLONE_ATTACK' || liveRiskScore >= 70;
  const isSuspicious = call?.waveformType === 'HYBRID_SUSPICIOUS' || (liveRiskScore >= 30 && liveRiskScore < 70);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let phase = 0;

    const render = () => {
      // Resize canvas to match display size
      const width = canvas.width = canvas.parentElement?.clientWidth || 700;
      const height = canvas.height = 240;

      // Clear with deep SOC slate background
      ctx.fillStyle = '#080D1A';
      ctx.fillRect(0, 0, width, height);

      // Draw subtle background grid
      ctx.strokeStyle = 'rgba(30, 41, 59, 0.45)';
      ctx.lineWidth = 1;
      const gridSize = 24;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Center baseline divider
      ctx.strokeStyle = 'rgba(51, 65, 85, 0.6)';
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(0, height / 2);
      ctx.lineTo(width, height / 2);
      ctx.stroke();
      ctx.setLineDash([]);

      const speed = isSimulating ? 0.08 : 0.035;
      phase += speed;

      if (activeMode === 'DUAL_CHANNEL') {
        // Channel A (Top half): Incoming Telephony Signal
        const channelACenter = height * 0.32;
        const channelBCenter = height * 0.72;

        // Trace Channel A (Cyan/Crimson depending on attack)
        ctx.beginPath();
        ctx.lineWidth = 2.2;
        ctx.strokeStyle = isAttack ? '#F43F5E' : isSuspicious ? '#FBBF24' : '#06B6D4';
        ctx.shadowBlur = 10;
        ctx.shadowColor = isAttack ? 'rgba(244, 63, 94, 0.6)' : isSuspicious ? 'rgba(251, 191, 36, 0.5)' : 'rgba(6, 182, 212, 0.6)';

        for (let x = 0; x < width; x++) {
          const normX = x / width;
          // Complex harmonic synthesis to simulate real voice or synthetic glitches
          let amp = Math.sin(normX * 18 + phase * 2) * 22;
          amp += Math.cos(normX * 42 - phase * 3.5) * 12;
          amp += Math.sin(normX * 85 + phase * 5) * 6;

          // If AI Clone Attack, inject sharp phase discontinuities and comb glitches
          if (isAttack) {
            if (Math.sin(normX * 60 + phase) > 0.85) {
              amp += (Math.random() - 0.5) * 26; // High frequency vocoder noise
            }
          }

          const y = channelACenter + amp;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
        ctx.shadowBlur = 0; // reset

        // Trace Channel B (Bottom half): Biometric Baseline / Liveness Reference
        ctx.beginPath();
        ctx.lineWidth = 1.8;
        ctx.strokeStyle = isAttack ? '#A855F7' : '#10B981';
        ctx.shadowBlur = 8;
        ctx.shadowColor = isAttack ? 'rgba(168, 85, 247, 0.5)' : 'rgba(16, 185, 129, 0.5)';

        for (let x = 0; x < width; x++) {
          const normX = x / width;
          // Smooth, natural organic biological vibration
          let amp = Math.sin(normX * 14 + phase * 1.5) * 18;
          amp += Math.sin(normX * 36 - phase * 2.2) * 8;
          amp += Math.cos(normX * 4 + phase * 0.8) * 6;

          const y = channelBCenter + amp;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Channel Labels on Canvas
        ctx.font = '10px JetBrains Mono, monospace';
        ctx.fillStyle = isAttack ? '#FDA4AF' : '#67E8F9';
        ctx.fillText('CH-1: INCOMING CALLER RX (48kHz)', 12, 22);

        ctx.fillStyle = isAttack ? '#D8B4FE' : '#6EE7B7';
        ctx.fillText('CH-2: BIOMETRIC LIVENESS VAULT (REF)', 12, height / 2 + 20);

      } else if (activeMode === 'FFT_SPECTRUM') {
        // 36-band FFT Audio Spectrum Visualizer
        const numBars = 36;
        const barWidth = (width - (numBars * 4)) / numBars;

        for (let i = 0; i < numBars; i++) {
          const normI = i / numBars;
          let barHeight = Math.sin(normI * 6 + phase * 2) * 60 + 80;
          barHeight += Math.cos(normI * 14 - phase * 3) * 35;
          if (isAttack && normI > 0.6) {
            // Vocoder high-frequency energy artifact
            barHeight += Math.sin(phase * 8 + i) * 45;
          }
          barHeight = Math.max(12, Math.min(height - 40, barHeight));

          const x = 12 + i * (barWidth + 4);
          const y = height - barHeight - 12;

          // Gradient bar
          const grad = ctx.createLinearGradient(0, y, 0, height);
          if (isAttack) {
            grad.addColorStop(0, '#F43F5E');
            grad.addColorStop(0.5, '#E11D48');
            grad.addColorStop(1, '#881337');
          } else {
            grad.addColorStop(0, '#06B6D4');
            grad.addColorStop(0.6, '#0284C7');
            grad.addColorStop(1, '#0F172A');
          }
          ctx.fillStyle = grad;
          ctx.fillRect(x, y, barWidth, barHeight);

          // Peak cap
          ctx.fillStyle = isAttack ? '#FFE4E6' : '#E0F2FE';
          ctx.fillRect(x, y - 2, barWidth, 2);
        }

        ctx.font = '10px JetBrains Mono, monospace';
        ctx.fillStyle = '#94A3B8';
        ctx.fillText('SPECTRAL FFT TRANSFORM (0 Hz — 24,000 Hz)', 12, 22);

      } else {
        // PHASE_LISSAJOUS (Cross-correlation orbit)
        const centerX = width / 2;
        const centerY = height / 2;
        const radius = Math.min(centerX, centerY) - 28;

        ctx.beginPath();
        ctx.strokeStyle = isAttack ? '#F43F5E' : '#10B981';
        ctx.lineWidth = 2;
        ctx.shadowBlur = 12;
        ctx.shadowColor = isAttack ? 'rgba(244, 63, 94, 0.7)' : 'rgba(16, 185, 129, 0.7)';

        const points = 240;
        for (let i = 0; i <= points; i++) {
          const t = (i / points) * Math.PI * 2;
          const a = isAttack ? 3 : 1;
          const b = isAttack ? 4 : 2;
          const delta = phase;
          const x = centerX + radius * Math.sin(a * t + delta) * (0.8 + 0.2 * Math.sin(t * 3));
          const y = centerY + radius * Math.sin(b * t);
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
        ctx.shadowBlur = 0;

        ctx.font = '10px JetBrains Mono, monospace';
        ctx.fillStyle = '#94A3B8';
        ctx.fillText('LISSAJOUS PHASE ORBIT (ACOUSTIC COHERENCE)', 12, 22);
      }

      animFrameId.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
    };
  }, [call, isSimulating, activeMode, isAttack, isSuspicious, liveRiskScore]);

  const telemetry = call?.audioTelemetry || {
    sampleRate: '48000 Hz',
    codec: 'WebRTC Opus HD',
    bitrate: '128 kbps',
    jitterMs: '0.24 ms',
    packetLoss: '0.0%',
    spectralCentroid: '2,450 Hz'
  };

  return (
    <div className="rounded-2xl bg-[#0B0F19]/90 border border-slate-800/90 shadow-xl overflow-hidden backdrop-blur-md">
      {/* Visualizer Top Bar */}
      <div className="px-4 py-3 bg-slate-900/80 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-2.5">
          <div className={`p-1.5 rounded-lg ${isAttack ? 'bg-rose-500/20 text-rose-400' : 'bg-cyan-500/20 text-cyan-400'}`}>
            <Activity className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200">
                Real-Time Audio Waveform & Frequency Telemetry
              </span>
              {isSimulating && (
                <span className="px-2 py-0.5 text-[9px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 rounded-full animate-pulse">
                  LIVE STREAM SIMULATION
                </span>
              )}
            </div>
            <p className="text-[11px] font-mono text-slate-400">
              60 FPS Dual-Channel Ingestion Tap • SIP Trunk Audio Stream
            </p>
          </div>
        </div>

        {/* Mode Selector Tabs */}
        <div className="flex items-center space-x-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-[11px] font-mono">
          <button
            onClick={() => setActiveMode('DUAL_CHANNEL')}
            className={`px-2.5 py-1 rounded-lg transition-all ${
              activeMode === 'DUAL_CHANNEL'
                ? 'bg-cyan-600/30 text-cyan-300 border border-cyan-500/40 shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Dual Oscilloscope
          </button>
          <button
            onClick={() => setActiveMode('FFT_SPECTRUM')}
            className={`px-2.5 py-1 rounded-lg transition-all ${
              activeMode === 'FFT_SPECTRUM'
                ? 'bg-cyan-600/30 text-cyan-300 border border-cyan-500/40 shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            FFT Spectrum
          </button>
          <button
            onClick={() => setActiveMode('PHASE_LISSAJOUS')}
            className={`px-2.5 py-1 rounded-lg transition-all ${
              activeMode === 'PHASE_LISSAJOUS'
                ? 'bg-cyan-600/30 text-cyan-300 border border-cyan-500/40 shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Phase Orbit
          </button>
        </div>
      </div>

      {/* Canvas Stream Container */}
      <div className="relative w-full h-[240px] bg-[#080D1A]">
        <canvas ref={canvasRef} className="w-full h-full block" />

        {/* Overlay Telemetry Badges */}
        <div className="absolute top-3 right-3 flex items-center space-x-2 pointer-events-none font-mono text-[10px]">
          <span className="px-2 py-0.5 rounded bg-slate-900/90 text-cyan-400 border border-cyan-500/30 backdrop-blur-md">
            SAMPLE: {telemetry.sampleRate}
          </span>
          <span className="px-2 py-0.5 rounded bg-slate-900/90 text-emerald-400 border border-emerald-500/30 backdrop-blur-md">
            CODEC: {telemetry.codec}
          </span>
        </div>
      </div>

      {/* Bottom Telemetry Footer Grid */}
      <div className="p-3 bg-slate-950/90 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2 text-center font-mono">
        <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800/60">
          <span className="text-[9px] text-slate-500 block uppercase">Sampling Rate</span>
          <span className="text-xs font-bold text-cyan-300">{telemetry.sampleRate}</span>
        </div>
        <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800/60">
          <span className="text-[9px] text-slate-500 block uppercase">Audio Codec</span>
          <span className="text-xs font-bold text-slate-200">{telemetry.codec}</span>
        </div>
        <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800/60">
          <span className="text-[9px] text-slate-500 block uppercase">Audio Bitrate</span>
          <span className="text-xs font-bold text-slate-200">{telemetry.bitrate}</span>
        </div>
        <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800/60">
          <span className="text-[9px] text-slate-500 block uppercase">Jitter Delay</span>
          <span className="text-xs font-bold text-emerald-400">{telemetry.jitterMs}</span>
        </div>
        <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800/60">
          <span className="text-[9px] text-slate-500 block uppercase">Packet Loss</span>
          <span className="text-xs font-bold text-emerald-400">{telemetry.packetLoss}</span>
        </div>
        <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800/60">
          <span className="text-[9px] text-slate-500 block uppercase">Spectral Centroid</span>
          <span className="text-xs font-bold text-amber-300">{telemetry.spectralCentroid}</span>
        </div>
      </div>
    </div>
  );
}
