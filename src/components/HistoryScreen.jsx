import React, { useState, useEffect, useRef } from 'react';
import { 
  History, 
  Trash2, 
  Search, 
  Filter, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldAlert, 
  ShieldCheck, 
  Volume2, 
  Play, 
  Pause, 
  Download, 
  Calendar, 
  Clock, 
  ArrowUpRight,
  Sparkles,
  Info,
  Phone,
  UserCheck,
  Cpu,
  Radio,
  AlertCircle,
  FileText,
  Activity,
  Waves,
  X
} from 'lucide-react';
import { getStoredHistory, clearStoredHistory, removeHistoryEntry } from '../utils/storage';
import { getAudioObjectUrl } from '../utils/indexedDBStorage';
import { INITIAL_HISTORY_SEED } from '../utils/mockData';

export default function HistoryScreen({ onSelectRecord }) {
  const [history, setHistory] = useState([]);
  const [filter, setFilter] = useState('ALL'); // 'ALL' | 'HUMAN' | 'AI_SYNTHETIC' | 'CLONE_ALERT'
  const [searchNumber, setSearchNumber] = useState('');
  const [playingId, setPlayingId] = useState(null);
  const [audioUrls, setAudioUrls] = useState({});
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [modalPlaying, setModalPlaying] = useState(false);
  const audioRefs = useRef({});
  const modalAudioRef = useRef(null);

  // Normalize record attributes for backwards compatibility
  const normalizeRecord = (item) => {
    const isClone = item.isCloneAlert || item.state === 'STATE_3_AI_CLONE_ATTACK' || item.state === 'STATE_3_AI_VOICE_CLONE' || item.identityResult?.includes('CLONE');
    const isAi = item.verdict === 'AI_SYNTHETIC';
    const isGenuine = item.state === 'STATE_1_GENUINE_USER' || item.identityResult?.includes('GENUINE');
    
    let riskScore = item.riskScore;
    if (riskScore === undefined || riskScore === null) {
      if (isClone) riskScore = 94;
      else if (isAi) riskScore = 70;
      else if (isGenuine) riskScore = 12;
      else riskScore = 35;
    }
    
    let riskLevel = item.riskLevel;
    if (!riskLevel) {
      if (riskScore >= 76) riskLevel = 'CRITICAL';
      else if (riskScore >= 51) riskLevel = 'HIGH';
      else if (riskScore >= 21) riskLevel = 'MODERATE';
      else riskLevel = 'LOW';
    }

    let finalVerdict = item.finalVerdict;
    if (!finalVerdict) {
      if (isClone) finalVerdict = '🚨 VOICE CLONE DETECTED';
      else if (isGenuine) finalVerdict = '✅ GENUINE VOICE';
      else if (isAi) finalVerdict = '🚨 AI-GENERATED VOICE';
      else finalVerdict = '⚠️ UNKNOWN VOICE';
    }

    let antiSpoofScore = item.antiSpoofScore;
    if (antiSpoofScore === undefined) {
      antiSpoofScore = isAi ? 18 : 86;
    }

    return {
      ...item,
      riskScore,
      riskLevel,
      finalVerdict,
      antiSpoofScore,
    };
  };

  useEffect(() => {
    let list = getStoredHistory();
    if (!list || list.length === 0) {
      list = INITIAL_HISTORY_SEED;
      localStorage.setItem('voiceguard_call_history_v2', JSON.stringify(INITIAL_HISTORY_SEED));
    }
    const normalized = list.map(normalizeRecord);
    setHistory(normalized);

    // Load available audio object URLs from IndexedDB
    normalized.forEach(async (item) => {
      const url = await getAudioObjectUrl(item.id || item.callId);
      if (url) {
        setAudioUrls((prev) => ({ ...prev, [item.id]: url }));
      }
    });
  }, []);

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to clear all call audit logs?')) {
      clearStoredHistory();
      setHistory([]);
      setAudioUrls({});
      setSelectedRecord(null);
    }
  };

  const handleDeleteItem = (id, e) => {
    e.stopPropagation();
    const updated = removeHistoryEntry(id);
    setHistory(updated.map(normalizeRecord));
    if (selectedRecord?.id === id) {
      setSelectedRecord(null);
    }
  };

  const togglePlayAudio = async (id, fallbackUrl, e) => {
    if (e) e.stopPropagation();
    let url = audioUrls[id] || fallbackUrl;
    
    // If not cached, try fetching from IndexedDB
    if (!url) {
      url = await getAudioObjectUrl(id);
      if (url) {
        setAudioUrls((prev) => ({ ...prev, [id]: url }));
      }
    }

    if (!url) {
      alert('Audio recording for this demo item was generated dynamically and does not have an audio buffer stored.');
      return;
    }

    if (playingId === id) {
      audioRefs.current[id]?.pause();
      setPlayingId(null);
    } else {
      if (playingId && audioRefs.current[playingId]) {
        audioRefs.current[playingId].pause();
      }
      if (audioRefs.current[id]) {
        audioRefs.current[id].play();
        setPlayingId(id);
      }
    }
  };

  const toggleModalAudio = async (record) => {
    const id = record.id || record.callId;
    let url = audioUrls[id] || record.audioUrl;
    if (!url) {
      url = await getAudioObjectUrl(id);
      if (url) {
        setAudioUrls((prev) => ({ ...prev, [id]: url }));
      }
    }

    if (!url) {
      alert('Audio recording for this mock item does not have a raw audio buffer saved in IndexedDB.');
      return;
    }

    if (modalPlaying) {
      modalAudioRef.current?.pause();
      setModalPlaying(false);
    } else {
      modalAudioRef.current?.play();
      setModalPlaying(true);
    }
  };

  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(history, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `voiceguard-call-audit-${new Date().toISOString().slice(0,10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Filter and Search by phone number
  const filteredHistory = history.filter(item => {
    if (searchNumber.trim()) {
      const q = searchNumber.replace(/\s+/g, '');
      const itemNum = (item.callerNumber || '').replace(/\s+/g, '');
      if (!itemNum.includes(q)) return false;
    }

    if (filter === 'ALL') return true;
    if (filter === 'HUMAN') return item.verdict === 'HUMAN';
    if (filter === 'AI_SYNTHETIC') return item.verdict === 'AI_SYNTHETIC' && !item.isCloneAlert;
    if (filter === 'CLONE_ALERT') return item.isCloneAlert === true;
    return true;
  });

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <History className="w-6 h-6 text-cyan-400" />
            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              Call Audit & Detection History
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Persistent forensic log associating every incoming call with caller number, AI detection, voice clone verification, and risk scoring.
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-2">
          {history.length > 0 && (
            <>
              <button
                onClick={handleExportJSON}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 flex items-center space-x-1.5 transition-colors"
                title="Export JSON"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Log</span>
              </button>

              <button
                onClick={handleClearAll}
                className="px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-medium border border-rose-500/30 flex items-center space-x-1.5 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear All</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Category Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              filter === 'ALL'
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 shadow-sm'
                : 'bg-slate-900/60 text-slate-400 border border-slate-800 hover:text-slate-200'
            }`}
          >
            All Calls ({history.length})
          </button>

          <button
            onClick={() => setFilter('HUMAN')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center space-x-1.5 ${
              filter === 'HUMAN'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-sm'
                : 'bg-slate-900/60 text-slate-400 border border-slate-800 hover:text-slate-200'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>Human Calls</span>
          </button>

          <button
            onClick={() => setFilter('AI_SYNTHETIC')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center space-x-1.5 ${
              filter === 'AI_SYNTHETIC'
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40 shadow-sm'
                : 'bg-slate-900/60 text-slate-400 border border-slate-800 hover:text-slate-200'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-amber-400"></span>
            <span>AI Synthetics</span>
          </button>

          <button
            onClick={() => setFilter('CLONE_ALERT')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center space-x-1.5 ${
              filter === 'CLONE_ALERT'
                ? 'bg-rose-600/30 text-rose-300 border border-rose-500 shadow-md shadow-rose-950'
                : 'bg-slate-900/60 text-slate-400 border border-slate-800 hover:text-slate-200'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
            <span>Clone Warnings</span>
          </button>
        </div>

        {/* Search by Phone Number */}
        <div className="relative max-w-xs w-full">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={searchNumber}
            onChange={(e) => setSearchNumber(e.target.value)}
            placeholder="Search by phone number..."
            className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
          />
        </div>
      </div>

      {/* History Items List */}
      {filteredHistory.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center space-y-3">
          <History className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-slate-300">No Call Logs Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            No call records match the search filter. Use the Call Monitor to record and classify incoming calls.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredHistory.map((item) => {
            const isAi = item.verdict === 'AI_SYNTHETIC';
            const isClone = item.isCloneAlert || item.state === 'STATE_3_AI_CLONE_ATTACK' || item.state === 'STATE_3_AI_VOICE_CLONE';
            const isGenuine = item.state === 'STATE_1_GENUINE_USER';
            const isGenericAi = item.state === 'STATE_2_GENERIC_AI_VOICE';
            
            const formattedDate = new Date(item.timestamp).toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            });
            const formattedTime = new Date(item.timestamp).toLocaleTimeString(undefined, {
              hour: '2-digit',
              minute: '2-digit'
            });

            return (
              <div
                key={item.id || item.callId}
                onClick={() => {
                  setSelectedRecord(item);
                  setModalPlaying(false);
                }}
                className={`p-4 rounded-xl border transition-all cursor-pointer hover:scale-[1.005] ${
                  isClone
                    ? 'bg-rose-950/25 border-rose-500/50 hover:border-rose-400 shadow-md shadow-rose-950/40'
                    : isGenuine
                    ? 'bg-emerald-950/20 border-emerald-500/30 hover:border-emerald-400'
                    : isGenericAi
                    ? 'bg-amber-950/20 border-amber-500/30 hover:border-amber-400'
                    : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  {/* Left: Indicator & Verdict */}
                  <div className="flex items-start sm:items-center space-x-3.5">
                    {/* Status Icon */}
                    <div className={`p-2.5 rounded-xl flex-shrink-0 ${
                      isClone
                        ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40 animate-pulse'
                        : isGenuine
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : isGenericAi
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                    }`}>
                      {isClone ? (
                        <ShieldAlert className="w-5 h-5" />
                      ) : isGenuine ? (
                        <CheckCircle2 className="w-5 h-5" />
                      ) : isGenericAi ? (
                        <Cpu className="w-5 h-5" />
                      ) : (
                        <Phone className="w-5 h-5" />
                      )}
                    </div>

                    {/* Titles */}
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        {/* Caller Number */}
                        <span className="text-sm font-bold font-mono text-white flex items-center space-x-1">
                          <Phone className="w-3 h-3 text-cyan-400" />
                          <span>{item.callerNumber || '+91 98765 43210'}</span>
                        </span>

                        {/* Known caller tag */}
                        {item.knownCallerInfo?.isKnown && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-amber-500/15 text-amber-400 border border-amber-500/30">
                            KNOWN CALLER ({item.knownCallerInfo.previousCallCount})
                          </span>
                        )}

                        {/* State Badge */}
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-extrabold ${
                          isClone 
                            ? 'bg-rose-600 text-white animate-pulse shadow-sm shadow-rose-900' 
                            : isGenuine 
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' 
                            : isGenericAi
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                            : 'bg-slate-800 text-slate-300 border border-slate-700'
                        }`}>
                          {item.finalVerdict || (isClone ? '🚨 VOICE CLONE DETECTED' : isGenuine ? '✅ GENUINE VOICE' : isGenericAi ? '🚨 AI-GENERATED VOICE' : '⚠️ UNKNOWN VOICE')}
                        </span>

                        {/* AI / Human classification tag */}
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                          isAi ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30' : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                        }`}>
                          {isAi ? `AI SYNTHETIC (${item.confidence}%)` : `HUMAN (${item.confidence}%)`}
                        </span>

                        {/* Voice Similarity % */}
                        <span className="text-xs font-mono text-slate-400">
                          Match: <strong className="text-slate-200">{item.voiceSimilarity || item.cloneComparison?.similarity || 0}%</strong>
                        </span>
                      </div>

                      {/* Caller Label & Rationale */}
                      <p className="text-xs text-slate-400 line-clamp-1">
                        {item.callerLabel}
                      </p>
                    </div>
                  </div>

                  {/* Right: Risk Score Gauge, Timestamp, Audio, and Delete */}
                  <div className="flex items-center space-x-3 self-end sm:self-center">
                    {/* RISK SCORE DISPLAY (0 - 100) */}
                    <div className="text-right px-3 py-1 rounded-lg bg-slate-950/80 border border-slate-800 flex flex-col items-end">
                      <span className="text-[9px] font-mono uppercase text-slate-500 font-bold">RISK SCORE</span>
                      <div className="flex items-center space-x-1.5">
                        <span className={`text-sm font-black font-mono ${
                          item.riskLevel === 'CRITICAL' ? 'text-rose-400' :
                          item.riskLevel === 'HIGH' ? 'text-amber-400' :
                          item.riskLevel === 'MODERATE' ? 'text-blue-400' :
                          'text-emerald-400'
                        }`}>
                          {item.riskScore !== undefined ? item.riskScore : (isClone ? 94 : isAi ? 70 : isGenuine ? 12 : 35)}/100
                        </span>
                        <span className={`text-[10px] font-bold font-mono px-1.5 py-0.2 rounded ${
                          item.riskLevel === 'CRITICAL' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
                          item.riskLevel === 'HIGH' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                          item.riskLevel === 'MODERATE' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                          'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        }`}>
                          {item.riskLevel || 'LOW'}
                        </span>
                      </div>
                    </div>

                    {/* Timestamp & Duration */}
                    <div className="text-right text-[11px] font-mono text-slate-500 hidden md:block">
                      <div>{formattedDate} {formattedTime}</div>
                      <div className="text-slate-400">Duration: {item.duration}</div>
                    </div>

                    {/* Quick Play Audio Player */}
                    <button
                      onClick={(e) => togglePlayAudio(item.id || item.callId, item.audioUrl, e)}
                      className="p-2 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/30 text-cyan-400 border border-cyan-500/30 transition-colors"
                      title="Play Recording"
                    >
                      {playingId === (item.id || item.callId) ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 ml-0.5" />}
                    </button>

                    {/* Audio hidden element */}
                    {audioUrls[item.id] && (
                      <audio
                        ref={(el) => (audioRefs.current[item.id] = el)}
                        src={audioUrls[item.id]}
                        onEnded={() => setPlayingId(null)}
                        className="hidden"
                      />
                    )}

                    {/* Delete Item */}
                    <button
                      onClick={(e) => handleDeleteItem(item.id || item.callId, e)}
                      className="p-2 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                      title="Delete log"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 7-SECTION DETAILED FORENSIC CALL INSPECTION MODAL */}
      {/* ========================================================================= */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="glass-card rounded-2xl max-w-2xl w-full p-6 border border-slate-700 space-y-5 max-h-[92vh] overflow-y-auto custom-scrollbar shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2.5">
                <FileText className="w-5 h-5 text-cyan-400" />
                <div>
                  <h3 className="text-base font-extrabold text-white">Forensic Call Audit Report</h3>
                  <span className="text-[11px] font-mono text-slate-400">ID: {selectedRecord.callId || selectedRecord.id}</span>
                </div>
              </div>
              <button
                onClick={() => {
                  setSelectedRecord(null);
                  if (modalPlaying && modalAudioRef.current) {
                    modalAudioRef.current.pause();
                    setModalPlaying(false);
                  }
                }}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* ----------------------------------------------------------------- */}
              {/* SECTION 1: CALL DETAILS */}
              {/* ----------------------------------------------------------------- */}
              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                  <span className="font-mono text-[11px] font-bold text-cyan-400 uppercase tracking-wider flex items-center space-x-1.5">
                    <Phone className="w-3.5 h-3.5" />
                    <span>1. Call Details</span>
                  </span>
                  <span className="font-mono text-[11px] text-slate-400">
                    {new Date(selectedRecord.timestamp).toLocaleString()}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1">
                  <div>
                    <span className="text-[10px] font-mono text-slate-500 uppercase block">Caller Phone Number</span>
                    <span className="text-sm font-bold font-mono text-white">{selectedRecord.callerNumber || '+91 98765 43210'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-slate-500 uppercase block">Call Duration</span>
                    <span className="text-sm font-bold font-mono text-white">{selectedRecord.duration}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-slate-500 uppercase block">Call Category</span>
                    <span className="text-xs font-bold text-slate-300">{selectedRecord.callerLabel}</span>
                  </div>
                </div>

                {/* Known Caller & Spoofing Advisory Alert */}
                {selectedRecord.knownCallerInfo?.isKnown && (
                  <div className="mt-2 p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 space-y-1">
                    <div className="flex items-center space-x-1.5 font-bold">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                      <span>Known Contact ({selectedRecord.knownCallerInfo.previousCallCount} previous calls logged)</span>
                    </div>
                    <p className="text-[11px] text-amber-200/80 leading-relaxed font-sans">
                      {selectedRecord.knownCallerInfo.spoofingAdvisory || 'VoIP caller IDs can be spoofed by attackers. Always verify caller identity through voice biometrics rather than caller ID alone.'}
                    </p>
                  </div>
                )}
              </div>

              {/* ----------------------------------------------------------------- */}
              {/* SECTION 2: AI VOICE ANALYSIS */}
              {/* ----------------------------------------------------------------- */}
              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                  <span className="font-mono text-[11px] font-bold text-cyan-400 uppercase tracking-wider flex items-center space-x-1.5">
                    <Cpu className="w-3.5 h-3.5" />
                    <span>2. AI Voice Analysis (Synthetic Detection)</span>
                  </span>
                  <span className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold ${
                    selectedRecord.verdict === 'AI_SYNTHETIC' 
                      ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40' 
                      : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                  }`}>
                    {selectedRecord.verdict === 'AI_SYNTHETIC' ? 'AI-GENERATED / SYNTHETIC' : 'BIOLOGICAL HUMAN SPEECH'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-[10px] font-mono text-slate-500 uppercase block">AI Confidence Score</span>
                    <span className="text-base font-extrabold font-mono text-white">
                      {selectedRecord.confidence}%
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-slate-500 uppercase block">Speech Generation Mode</span>
                    <span className="text-xs font-semibold text-slate-300">
                      {selectedRecord.verdict === 'AI_SYNTHETIC' ? 'Neural Vocoder Synthesis (TTS)' : 'Natural Biological Vocalization'}
                    </span>
                  </div>
                </div>

                {/* Acoustic & Spectral Signatures */}
                <div className="space-y-1.5 pt-1 text-[11px]">
                  <div className="p-2 rounded bg-slate-900/80 border border-slate-800/80">
                    <span className="text-slate-400 font-medium">Acoustic Phase Pattern: </span>
                    <span className="text-slate-200 font-semibold">{selectedRecord.acousticPattern}</span>
                  </div>
                  <div className="p-2 rounded bg-slate-900/80 border border-slate-800/80">
                    <span className="text-slate-400 font-medium">Prosody & Cadence: </span>
                    <span className="text-slate-200 font-semibold">{selectedRecord.prosody}</span>
                  </div>
                  <div className="p-2 rounded bg-slate-900/80 border border-slate-800/80">
                    <span className="text-slate-400 font-medium">Spectral Envelope: </span>
                    <span className="text-slate-200 font-semibold">{selectedRecord.spectralArtifacts}</span>
                  </div>
                </div>
              </div>

              {/* ----------------------------------------------------------------- */}
              {/* SECTION 3: VOICE IDENTITY ANALYSIS */}
              {/* ----------------------------------------------------------------- */}
              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                  <span className="font-mono text-[11px] font-bold text-cyan-400 uppercase tracking-wider flex items-center space-x-1.5">
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>3. Voice Identity Analysis (Biometric Comparison)</span>
                  </span>
                  <span className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold ${
                    selectedRecord.isCloneAlert 
                      ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40' 
                      : selectedRecord.identityResult?.includes('GENUINE') 
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' 
                      : 'bg-slate-800 text-slate-300 border border-slate-700'
                  }`}>
                    {selectedRecord.identityResult || 'UNSPECIFIED'}
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Similarity to Registered Voice Profile:</span>
                    <span className="font-mono font-bold text-white text-sm">
                      {selectedRecord.voiceSimilarity || selectedRecord.cloneComparison?.similarity || 0}%
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all ${
                        selectedRecord.isCloneAlert ? 'bg-rose-500' :
                        selectedRecord.identityResult?.includes('GENUINE') ? 'bg-emerald-500' :
                        'bg-cyan-500'
                      }`}
                      style={{ width: `${Math.min(100, selectedRecord.voiceSimilarity || selectedRecord.cloneComparison?.similarity || 0)}%` }}
                    />
                  </div>

                  <p className="text-[11px] text-slate-400 leading-relaxed font-sans pt-1">
                    {selectedRecord.cloneComparison?.note || (
                      selectedRecord.isCloneAlert 
                        ? 'Vocal tract resonance closely mimics registered user profile, but generative neural TTS signatures identify this as an impersonation attack.'
                        : selectedRecord.identityResult?.includes('GENUINE')
                        ? 'Acoustic pitch and formant dispersion confirm authentic identity matching the registered baseline voice.'
                        : 'Acoustic parameters indicate a third-party voice with no biometric correlation to the registered user profile.'
                    )}
                  </p>
                </div>
              </div>

              {/* ----------------------------------------------------------------- */}
              {/* SECTION 4: ANTI-SPOOF ANALYSIS */}
              {/* ----------------------------------------------------------------- */}
              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                  <span className="font-mono text-[11px] font-bold text-cyan-400 uppercase tracking-wider flex items-center space-x-1.5">
                    <Activity className="w-3.5 h-3.5" />
                    <span>4. Anti-Spoof & Glottal Analysis</span>
                  </span>
                  <span className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold ${
                    (selectedRecord.antiSpoofScore >= 55)
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                      : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                  }`}>
                    {selectedRecord.antiSpoofScore >= 55 ? 'AUTHENTICITY PASSED' : 'ANTI-SPOOF FAILED'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-[10px] font-mono text-slate-500 uppercase block">Authenticity Score</span>
                    <span className={`text-base font-extrabold font-mono ${
                      selectedRecord.antiSpoofScore >= 55 ? 'text-emerald-400' : 'text-rose-400'
                    }`}>
                      {selectedRecord.antiSpoofScore !== undefined ? `${selectedRecord.antiSpoofScore}/100` : '85/100'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-slate-500 uppercase block">Micro-Tremor Natural Variance</span>
                    <span className="text-xs font-semibold text-slate-300">
                      {selectedRecord.antiSpoofScore >= 55 ? 'Natural Glottal Dynamics Verified' : 'Robotic Quantization / Phase Artifacts'}
                    </span>
                  </div>
                </div>
              </div>

              {/* ----------------------------------------------------------------- */}
              {/* SECTION 5: RISK ASSESSMENT */}
              {/* ----------------------------------------------------------------- */}
              <div className={`p-4 rounded-xl border space-y-2.5 ${
                selectedRecord.riskLevel === 'CRITICAL' ? 'bg-rose-950/30 border-rose-500/40' :
                selectedRecord.riskLevel === 'HIGH' ? 'bg-amber-950/30 border-amber-500/40' :
                selectedRecord.riskLevel === 'MODERATE' ? 'bg-blue-950/30 border-blue-500/40' :
                'bg-emerald-950/30 border-emerald-500/40'
              }`}>
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <span className="font-mono text-[11px] font-bold uppercase tracking-wider flex items-center space-x-1.5 text-white">
                    <ShieldAlert className="w-3.5 h-3.5 text-cyan-400" />
                    <span>5. Threat Risk Assessment</span>
                  </span>
                  <span className={`px-2.5 py-0.5 rounded font-mono text-[10px] font-black ${
                    selectedRecord.riskLevel === 'CRITICAL' ? 'bg-rose-500 text-white animate-pulse' :
                    selectedRecord.riskLevel === 'HIGH' ? 'bg-amber-500 text-black' :
                    selectedRecord.riskLevel === 'MODERATE' ? 'bg-blue-500 text-white' :
                    'bg-emerald-500 text-black'
                  }`}>
                    {selectedRecord.riskLevel} RISK
                  </span>
                </div>

                <div className="flex items-baseline justify-between">
                  <span className="text-slate-300 font-medium">Deterministic Risk Score:</span>
                  <span className={`text-2xl font-black font-mono ${
                    selectedRecord.riskLevel === 'CRITICAL' ? 'text-rose-400' :
                    selectedRecord.riskLevel === 'HIGH' ? 'text-amber-400' :
                    selectedRecord.riskLevel === 'MODERATE' ? 'text-blue-400' :
                    'text-emerald-400'
                  }`}>
                    {selectedRecord.riskScore !== undefined ? selectedRecord.riskScore : (selectedRecord.isCloneAlert ? 94 : 12)}/100
                  </span>
                </div>

                {/* Visual Risk Bar */}
                <div className="w-full bg-black/40 h-2.5 rounded-full overflow-hidden p-0.5 border border-white/10">
                  <div
                    className={`h-full rounded-full transition-all ${
                      selectedRecord.riskLevel === 'CRITICAL' ? 'bg-gradient-to-r from-amber-500 to-rose-600' :
                      selectedRecord.riskLevel === 'HIGH' ? 'bg-gradient-to-r from-yellow-500 to-amber-600' :
                      selectedRecord.riskLevel === 'MODERATE' ? 'bg-gradient-to-r from-slate-500 to-blue-500' :
                      'bg-gradient-to-r from-teal-500 to-emerald-500'
                    }`}
                    style={{ width: `${selectedRecord.riskScore || (selectedRecord.isCloneAlert ? 94 : 12)}%` }}
                  />
                </div>

                <p className="text-[11px] text-slate-300 leading-relaxed font-sans">
                  {selectedRecord.riskLevel === 'CRITICAL' && (
                    'Critical Risk: High probability of targeted impersonation fraud. The caller mimics the registered user voice using generative AI neural synthesis.'
                  )}
                  {selectedRecord.riskLevel === 'HIGH' && (
                    'High Risk: Automated synthetic AI speech detected. Caller is not biological human, posing risks of robocall fraud or AI social engineering.'
                  )}
                  {selectedRecord.riskLevel === 'MODERATE' && (
                    'Moderate Risk: Natural biological human speech from an unregistered third party. No direct impersonation signature, but identity must be confirmed.'
                  )}
                  {selectedRecord.riskLevel === 'LOW' && (
                    'Low Risk: Biometric vocal parameters and anti-spoof checks confirm authentic registered genuine user voice.'
                  )}
                </p>
              </div>

              {/* ----------------------------------------------------------------- */}
              {/* SECTION 6: FINAL SECURITY DECISION */}
              {/* ----------------------------------------------------------------- */}
              <div className={`p-4 rounded-xl border space-y-2.5 ${
                selectedRecord.isCloneAlert ? 'bg-rose-950/40 border-rose-500 text-rose-200' :
                selectedRecord.state === 'STATE_1_GENUINE_USER' || selectedRecord.identityResult?.includes('GENUINE') ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200' :
                selectedRecord.verdict === 'AI_SYNTHETIC' ? 'bg-amber-950/30 border-amber-500/40 text-amber-200' :
                'bg-slate-900/80 border-slate-700 text-slate-200'
              }`}>
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <span className="font-mono text-[11px] font-bold uppercase tracking-wider flex items-center space-x-1.5 text-white">
                    <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                    <span>6. Final Security Decision & Action</span>
                  </span>
                  <span className="font-mono text-[10px] text-slate-400">DECISION ENGINE VERDICT</span>
                </div>

                <div className="text-base font-black tracking-wide text-white flex items-center space-x-2">
                  <span>{selectedRecord.finalVerdict || (selectedRecord.isCloneAlert ? '🚨 VOICE CLONE DETECTED' : 'DECISION RECORDED')}</span>
                </div>

                {/* Recommended Security Protocols */}
                <div className="space-y-1.5 pt-1 text-[11px]">
                  <span className="font-bold text-white uppercase text-[10px] font-mono block">Recommended Security Protocol:</span>
                  {selectedRecord.isCloneAlert ? (
                    <ul className="list-disc list-inside space-y-1 text-rose-200">
                      <li><strong>TERMINATE CALL IMMEDIATELY.</strong> Do not engage or discuss sensitive credentials.</li>
                      <li>Do not authorize wire transfers, banking OTPs, or password resets.</li>
                      <li>Call the registered user back on a verified secondary out-of-band channel.</li>
                    </ul>
                  ) : selectedRecord.verdict === 'AI_SYNTHETIC' ? (
                    <ul className="list-disc list-inside space-y-1 text-amber-200">
                      <li>Automated AI robocall detected. Do not interact with automated prompts.</li>
                      <li>Add phone number to spam/telemarketing intercept list.</li>
                    </ul>
                  ) : selectedRecord.state === 'STATE_1_GENUINE_USER' || selectedRecord.identityResult?.includes('GENUINE') ? (
                    <ul className="list-disc list-inside space-y-1 text-emerald-200">
                      <li>Biometric voice identity matches registered profile. Authorized for standard communications.</li>
                    </ul>
                  ) : (
                    <ul className="list-disc list-inside space-y-1 text-slate-300">
                      <li>Third-party human voice. Follow standard multi-factor verification protocols before disclosing sensitive information.</li>
                    </ul>
                  )}
                </div>
              </div>

              {/* ----------------------------------------------------------------- */}
              {/* SECTION 7: AUDIO RECORDING & FORENSIC PLAYBACK */}
              {/* ----------------------------------------------------------------- */}
              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                  <span className="font-mono text-[11px] font-bold text-cyan-400 uppercase tracking-wider flex items-center space-x-1.5">
                    <Waves className="w-3.5 h-3.5" />
                    <span>7. Audio Recording & Forensic Playback</span>
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">INDEXEDDB STORAGE</span>
                </div>

                {/* Audio controls */}
                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-900/80 border border-slate-800">
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => toggleModalAudio(selectedRecord)}
                      className="p-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold transition-transform active:scale-95 flex items-center space-x-1.5"
                    >
                      {modalPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                      <span className="text-xs font-mono">{modalPlaying ? 'PAUSE' : 'PLAY'}</span>
                    </button>

                    <div className="space-y-0.5">
                      <span className="text-xs font-mono font-bold text-white block">
                        Call Recording ({selectedRecord.duration})
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">
                        {audioUrls[selectedRecord.id] || selectedRecord.audioUrl 
                          ? 'Available in IndexedDB cache' 
                          : 'Sample audio track'}
                      </span>
                    </div>
                  </div>

                  {/* Animated Wave Indicator when playing */}
                  {modalPlaying && (
                    <div className="flex items-center space-x-1 pr-2">
                      <span className="w-1 h-3 bg-cyan-400 animate-pulse"></span>
                      <span className="w-1 h-6 bg-cyan-400 animate-pulse delay-75"></span>
                      <span className="w-1 h-4 bg-cyan-400 animate-pulse delay-150"></span>
                      <span className="w-1 h-5 bg-cyan-400 animate-pulse delay-100"></span>
                    </div>
                  )}

                  {/* Modal hidden audio element */}
                  <audio
                    ref={modalAudioRef}
                    src={audioUrls[selectedRecord.id] || selectedRecord.audioUrl || ''}
                    onEnded={() => setModalPlaying(false)}
                    className="hidden"
                  />
                </div>
              </div>
            </div>

            {/* Modal Close Action */}
            <div className="pt-2">
              <button
                onClick={() => {
                  setSelectedRecord(null);
                  if (modalPlaying && modalAudioRef.current) {
                    modalAudioRef.current.pause();
                    setModalPlaying(false);
                  }
                }}
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold font-mono transition-colors uppercase tracking-wider"
              >
                Close Forensic Audit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
