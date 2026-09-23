import React, { useState } from 'react';
import { 
  History, 
  Search, 
  Filter, 
  Trash2, 
  ArrowUpDown, 
  ExternalLink, 
  ShieldAlert, 
  ShieldCheck, 
  AlertTriangle,
  RotateCcw,
  X,
  Play
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function HistoryPage() {
  const { 
    history, 
    setHistory, 
    setActiveTab, 
    setLastDetection, 
    showToast 
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('ALL');
  const [sortField, setSortField] = useState('timestamp');
  const [sortAsc, setSortAsc] = useState(false);
  const [selectedEventModal, setSelectedEventModal] = useState(null);

  // Filter & Search
  const filtered = history.filter(item => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = 
      (item.caller && item.caller.toLowerCase().includes(term)) ||
      (item.callerName && item.callerName.toLowerCase().includes(term)) ||
      (item.id && item.id.toLowerCase().includes(term)) ||
      (item.classification && item.classification.toLowerCase().includes(term));
    
    if (filterType === 'ALL') return matchesSearch;
    if (filterType === 'HIGH') return matchesSearch && (item.riskScore >= 70 || item.riskLevel === 'HIGH');
    if (filterType === 'MEDIUM') return matchesSearch && (item.riskScore >= 30 && item.riskScore < 70);
    if (filterType === 'LOW') return matchesSearch && (item.riskScore < 30 || item.riskLevel === 'LOW');
    return matchesSearch;
  });

  // Sort
  const sorted = [...filtered].sort((a, b) => {
    let valA = a[sortField];
    let valB = b[sortField];
    if (sortField === 'riskScore' || sortField === 'confidence') {
      valA = Number(valA) || 0;
      valB = Number(valB) || 0;
    }
    if (valA < valB) return sortAsc ? -1 : 1;
    if (valA > valB) return sortAsc ? 1 : -1;
    return 0;
  });

  const handleDeleteItem = (id, e) => {
    e.stopPropagation();
    setHistory(prev => prev.filter(item => item.id !== id));
    showToast('Record removed from local history store.', 'info');
  };

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to clear all detection history?')) {
      setHistory([]);
      showToast('All detection history cleared.', 'info');
    }
  };

  const handleViewAnalysis = (item) => {
    setLastDetection(item);
    setActiveTab('voice-analysis');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-1 rounded-md bg-cyan-950 text-cyan-400 border border-cyan-800">
              <History className="w-4 h-4" />
            </span>
            <span className="text-xs font-mono font-bold text-cyan-400 uppercase">Audit Record Log</span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight mt-1">Detection Event History</h2>
          <p className="text-xs text-slate-400">
            Persistent log of all completed voice sessions, risk assessments, and forensic decisions.
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={handleClearAll}
            disabled={history.length === 0}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-rose-950 hover:border-rose-700 text-rose-300 border border-slate-700 text-xs font-semibold flex items-center space-x-1.5 transition-all disabled:opacity-40"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear History</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="p-4 bg-slate-900/60 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search speaker, phone, or ID..."
            className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
          />
        </div>

        {/* Filter Badges */}
        <div className="flex items-center space-x-1.5 self-start sm:self-auto overflow-x-auto">
          {[
            { id: 'ALL', label: 'All Records' },
            { id: 'HIGH', label: 'High Risk (>=70)' },
            { id: 'MEDIUM', label: 'Medium Risk' },
            { id: 'LOW', label: 'Low Risk' }
          ].map((type) => (
            <button
              key={type.id}
              onClick={() => setFilterType(type.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all ${
                filterType === type.id
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50'
                  : 'text-slate-400 hover:text-white bg-slate-950 border border-slate-800'
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>
      </div>

      {/* History Table */}
      <div className="bg-slate-900/60 rounded-2xl border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 font-mono text-[11px] border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Date / Time</th>
                <th className="py-3 px-4">Target / Audio</th>
                <th className="py-3 px-4">Classification</th>
                <th 
                  className="py-3 px-4 cursor-pointer hover:text-white"
                  onClick={() => {
                    setSortField('riskScore');
                    setSortAsc(!sortAsc);
                  }}
                >
                  <div className="flex items-center space-x-1">
                    <span>Risk Score</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-4">Pitch (F0)</th>
                <th className="py-3 px-4">Speaker Match</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {sorted.length > 0 ? (
                sorted.map((item) => {
                  const isHigh = item.riskScore >= 70 || item.riskLevel === 'HIGH';
                  const isMed = item.riskScore >= 30 && item.riskScore < 70;

                  return (
                    <tr 
                      key={item.id} 
                      onClick={() => setSelectedEventModal(item)}
                      className="hover:bg-slate-800/40 cursor-pointer transition-colors"
                    >
                      <td className="py-3 px-4 font-mono text-slate-300 whitespace-nowrap">
                        {item.timestamp}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="font-mono font-bold text-white">{item.caller}</div>
                        <div className="text-[10px] text-slate-500">ID: {item.id}</div>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                          isHigh 
                            ? 'bg-rose-950 text-rose-300 border border-rose-800' 
                            : isMed 
                            ? 'bg-amber-950 text-amber-300 border border-amber-800' 
                            : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        }`}>
                          {item.classification || item.voiceType}
                        </span>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap font-mono font-bold">
                        <span className={isHigh ? 'text-rose-400' : isMed ? 'text-amber-400' : 'text-emerald-400'}>
                          {item.riskScore} <span className="text-[10px] text-slate-500 font-normal">/100</span>
                        </span>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap font-mono text-slate-300">
                        {item.features?.fundamentalPitchHz ? `${item.features.fundamentalPitchHz} Hz` : '--'}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap font-mono text-slate-300">
                        {item.speakerMatch ? `${item.speakerMatch}%` : 'Not Enrolled'}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-950 text-slate-300 border border-slate-700">
                          {item.status || 'LOGGED'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end space-x-1.5" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => handleViewAnalysis(item)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-400"
                            title="View Full Forensics"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={(e) => handleDeleteItem(item.id, e)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-400"
                            title="Delete Record"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500 font-mono">
                    No detection audit records in history. Run a live voice analysis to record data.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Details Modal on row click */}
      {selectedEventModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0E1526] border border-slate-700 rounded-2xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white font-mono">Session Audit: {selectedEventModal.id}</h3>
              <button 
                onClick={() => setSelectedEventModal(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs font-mono">
              <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800">
                <span className="text-slate-500">TARGET:</span>
                <p className="text-white font-bold">{selectedEventModal.caller}</p>
                <p className="text-slate-400 text-[10px]">{selectedEventModal.timestamp}</p>
              </div>
              <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800">
                <span className="text-slate-500">RISK SCORE:</span>
                <p className="text-rose-400 font-bold text-base">{selectedEventModal.riskScore}/100</p>
                <p className="text-slate-400 text-[10px]">{selectedEventModal.classification}</p>
              </div>
            </div>

            <div>
              <h5 className="text-[11px] font-mono text-slate-400 uppercase mb-1">Detected Acoustic Indicators:</h5>
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-1 text-xs text-slate-300">
                {selectedEventModal.indicators?.map((ind, i) => (
                  <p key={i}>• {ind}</p>
                ))}
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                onClick={() => {
                  handleViewAnalysis(selectedEventModal);
                  setSelectedEventModal(null);
                }}
                className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold font-mono"
              >
                Open Full Forensic Lab View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
