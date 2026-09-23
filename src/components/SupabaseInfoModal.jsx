import React, { useState } from 'react';
import { Database, Check, Copy, ExternalLink, ShieldCheck, Sparkles, X, Layers, Key } from 'lucide-react';

export default function SupabaseInfoModal({ isOpen, onClose }) {
  const [copiedSql, setCopiedSql] = useState(false);
  const [copiedClient, setCopiedClient] = useState(false);

  if (!isOpen) return null;

  const sqlSchema = `-- 1. Table: User Voice Biometric Profiles
create table if not exists public.voice_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  fingerprint_id text not null,
  baseline_pitch text,
  formant_dispersion text,
  jitter_percent text,
  harmonics_ratio text,
  sample_storage_url text,
  created_at timestamptz default now()
);

-- 2. Table: Call Recording & Detection Audits
create table if not exists public.detection_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  caller_label text,
  duration text,
  verdict text not null, -- 'HUMAN' or 'AI_SYNTHETIC'
  confidence numeric,
  is_clone_alert boolean default false,
  similarity_score numeric,
  acoustic_pattern text,
  prosody text,
  spectral_artifacts text,
  audio_storage_url text,
  created_at timestamptz default now()
);

-- 3. Row Level Security (RLS) policies
alter table public.voice_profiles enable row level security;
alter table public.detection_history enable row level security;

create policy "Users can manage their own profile"
  on public.voice_profiles for all
  using (auth.uid() = user_id);

create policy "Users can view their own scans"
  on public.detection_history for all
  using (auth.uid() = user_id);`;

  const clientCode = `// src/utils/supabaseClient.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);`;

  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text);
    if (type === 'sql') {
      setCopiedSql(true);
      setTimeout(() => setCopiedSql(false), 2000);
    } else {
      setCopiedClient(true);
      setTimeout(() => setCopiedClient(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="glass-card rounded-3xl max-w-2xl w-full p-6 sm:p-8 border border-slate-700 shadow-2xl max-h-[90vh] overflow-y-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/40">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                Supabase Backend Integration Guide
              </h2>
              <p className="text-xs text-slate-400">
                Beginner walkthrough for adding cloud persistence & multi-device sync
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Architecture Status */}
        <div className="p-4 rounded-xl bg-cyan-950/30 border border-cyan-500/30 space-y-2">
          <div className="flex items-center space-x-2 text-cyan-300 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>Zero-Backend Demo Mode (Active)</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            As requested for this demo, VoiceGuard AI currently operates with <strong>zero external backend setup</strong>. All microphone capture, real-time waveform telemetry, biometric fingerprinting, and audit history run in the browser using the <strong>Web Audio API</strong> and <strong>LocalStorage</strong>.
          </p>
        </div>

        {/* Step-by-step for beginner */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center space-x-2">
            <Layers className="w-4 h-4 text-emerald-400" />
            <span>How to Connect Supabase (When You Are Ready)</span>
          </h3>

          <ol className="space-y-3 text-xs text-slate-300">
            <li className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 space-y-1">
              <div className="font-bold text-slate-100">Step 1: Create a free Supabase Project</div>
              <p className="text-slate-400">
                Go to <a href="https://supabase.com" target="_blank" rel="noreferrer" className="text-cyan-400 underline">supabase.com</a>, sign up for free, and click "New Project". Name it <code className="text-cyan-300">voiceguard-ai</code>.
              </p>
            </li>

            <li className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-100">Step 2: Run SQL Migration in Supabase SQL Editor</span>
                <button
                  onClick={() => copyToClipboard(sqlSchema, 'sql')}
                  className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[11px] font-mono text-cyan-400 border border-slate-700 flex items-center space-x-1"
                >
                  {copiedSql ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedSql ? 'Copied' : 'Copy SQL'}</span>
                </button>
              </div>
              <pre className="p-2.5 rounded bg-slate-950 font-mono text-[10px] text-slate-300 overflow-x-auto border border-slate-800 max-h-36">
                {sqlSchema}
              </pre>
            </li>

            <li className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-100">Step 3: Add Client Environment Variables</span>
                <button
                  onClick={() => copyToClipboard(clientCode, 'client')}
                  className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[11px] font-mono text-cyan-400 border border-slate-700 flex items-center space-x-1"
                >
                  {copiedClient ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedClient ? 'Copied' : 'Copy Code'}</span>
                </button>
              </div>
              <p className="text-slate-400 text-[11px]">
                Create a <code className="text-cyan-300">.env</code> file in the project with your Project URL and Anon API key from Project Settings → API:
              </p>
              <pre className="p-2.5 rounded bg-slate-950 font-mono text-[10px] text-slate-300 overflow-x-auto border border-slate-800">
                {`VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOi...`}
              </pre>
            </li>
          </ol>
        </div>

        {/* Close Button */}
        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition-colors"
          >
            Got it, continue demo
          </button>
        </div>
      </div>
    </div>
  );
}
