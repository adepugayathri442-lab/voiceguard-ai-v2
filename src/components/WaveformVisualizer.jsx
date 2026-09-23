import React, { useEffect, useRef } from 'react';
import { audioManager } from '../utils/audioUtils';

export default function WaveformVisualizer({ 
  isRecording = false, 
  theme = 'cyan', // 'cyan' | 'green' | 'red'
  height = 160 
}) {
  const canvasRef = useRef(null);
  const animationFrameId = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let phase = 0;

    // Handle high DPI displays
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    const render = () => {
      const width = rect.width;
      ctx.clearRect(0, 0, width, height);

      // Color scheme based on theme
      let primaryColor = 'rgb(6, 182, 212)'; // Cyan
      let secondaryColor = 'rgba(56, 189, 248, 0.4)';
      let glowColor = 'rgba(6, 182, 212, 0.3)';

      if (theme === 'green') {
        primaryColor = 'rgb(16, 185, 129)';
        secondaryColor = 'rgba(52, 211, 153, 0.4)';
        glowColor = 'rgba(16, 185, 129, 0.3)';
      } else if (theme === 'red') {
        primaryColor = 'rgb(244, 63, 94)';
        secondaryColor = 'rgba(251, 113, 133, 0.4)';
        glowColor = 'rgba(244, 63, 94, 0.35)';
      }

      // Draw subtle grid lines
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
      ctx.lineWidth = 1;
      const centerY = height / 2;
      
      ctx.beginPath();
      ctx.moveTo(0, centerY);
      ctx.lineTo(width, centerY);
      ctx.stroke();

      if (isRecording) {
        // Try getting real time-domain and frequency data from audioManager
        const timeData = audioManager.getTimeDomainData();
        const freqData = audioManager.getFrequencyData();

        // 1. Draw dynamic background frequency equalizer bars
        if (freqData && freqData.length > 0) {
          const barCount = 48;
          const barWidth = (width / barCount) - 3;
          const step = Math.floor(freqData.length / barCount);

          for (let i = 0; i < barCount; i++) {
            const val = freqData[i * step] || 0;
            const barHeight = Math.max(4, (val / 255) * (height * 0.45));
            const x = i * (barWidth + 3) + 2;

            const grad = ctx.createLinearGradient(0, centerY - barHeight, 0, centerY + barHeight);
            grad.addColorStop(0, primaryColor);
            grad.addColorStop(0.5, secondaryColor);
            grad.addColorStop(1, primaryColor);

            ctx.fillStyle = grad;
            // Draw mirrored rounded bars
            ctx.beginPath();
            ctx.roundRect(x, centerY - barHeight, barWidth, barHeight * 2, 2);
            ctx.fill();
          }
        }

        // 2. Draw smooth oscilloscope sine wave
        ctx.beginPath();
        ctx.lineWidth = 2.5;
        ctx.strokeStyle = primaryColor;
        ctx.shadowColor = glowColor;
        ctx.shadowBlur = 14;

        const sliceWidth = width / 128;
        let x = 0;

        for (let i = 0; i < 128; i++) {
          let v = 128;
          if (timeData && timeData.length > 0) {
            const dataIndex = Math.floor((i / 128) * timeData.length);
            v = timeData[dataIndex];
          } else {
            // Synthetic wave fallback if no mic data yet
            v = 128 + Math.sin(i * 0.15 + phase) * 25 + Math.cos(i * 0.08 - phase) * 15;
          }

          const normalized = (v - 128) / 128;
          const y = centerY + normalized * (height * 0.42);

          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
          x += sliceWidth;
        }
        ctx.stroke();

        // Secondary smooth harmonic line
        ctx.beginPath();
        ctx.lineWidth = 1.2;
        ctx.strokeStyle = secondaryColor;
        ctx.shadowBlur = 4;
        let x2 = 0;
        for (let i = 0; i < 128; i++) {
          const v = 128 + Math.sin(i * 0.22 - phase * 1.5) * 18 * Math.sin(i * 0.04);
          const y = centerY + ((v - 128) / 128) * (height * 0.35);
          if (i === 0) ctx.moveTo(x2, y);
          else ctx.lineTo(x2, y);
          x2 += sliceWidth;
        }
        ctx.stroke();

        ctx.shadowBlur = 0; // reset
        phase += 0.08;
      } else {
        // Idle state: Subtle breathing ambient cyber wave
        ctx.beginPath();
        ctx.lineWidth = 1.8;
        ctx.strokeStyle = 'rgba(6, 182, 212, 0.4)';
        ctx.shadowColor = 'rgba(6, 182, 212, 0.2)';
        ctx.shadowBlur = 8;

        const points = 80;
        const slice = width / points;
        for (let i = 0; i <= points; i++) {
          const progress = i / points;
          // Taper at ends
          const envelope = Math.sin(progress * Math.PI);
          const y = centerY + Math.sin(i * 0.12 + phase) * 12 * envelope;
          if (i === 0) ctx.moveTo(0, y);
          else ctx.lineTo(i * slice, y);
        }
        ctx.stroke();
        ctx.shadowBlur = 0;
        phase += 0.03;
      }

      animationFrameId.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [isRecording, theme, height]);

  return (
    <div className="w-full relative overflow-hidden rounded-xl bg-slate-950/70 border border-slate-800/80 p-2">
      <canvas 
        ref={canvasRef} 
        className="w-full block" 
        style={{ height: `${height}px` }}
      />
      
      {/* Visualizer Status Overlays */}
      <div className="absolute top-3 left-4 flex items-center space-x-2 pointer-events-none">
        <span className={`h-2 w-2 rounded-full ${
          isRecording 
            ? 'bg-rose-500 animate-ping' 
            : 'bg-cyan-500/60'
        }`}></span>
        <span className="text-[10px] font-mono tracking-wider uppercase text-slate-400">
          {isRecording ? 'LIVE AUDIO SPECTRUM — 48kHz' : 'SPECTRAL STANDBY'}
        </span>
      </div>

      <div className="absolute bottom-2.5 right-4 pointer-events-none">
        <span className="text-[10px] font-mono text-slate-500">
          FFT: 256 BINS | 16-BIT PCM
        </span>
      </div>
    </div>
  );
}
