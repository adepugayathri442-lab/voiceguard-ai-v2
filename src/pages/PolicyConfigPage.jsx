import React, { useState } from 'react';
import { 
  Sliders, 
  ShieldAlert, 
  SlidersHorizontal, 
  ToggleLeft, 
  ToggleRight, 
  Search, 
  Filter, 
  Download, 
  CheckCircle2, 
  AlertTriangle, 
  PhoneOff, 
  ShieldCheck, 
  FileSpreadsheet, 
  RefreshCw 
} from 'lucide-react';
import { useApp } from '../context/AppContext';

/**
 * PolicyConfigPage
 * Enterprise Alerting & Policy Configuration View.
 * Provides fine-grained security threshold sliders, defense toggles, and incident audit log table.
 */
export default function PolicyConfigPage() {
  const { 
    policyRules, 
    updatePolicyRules, 
    auditLog, 
    showToast 
  } = useApp();

  const [rules, setRules] = useState(policyRules);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterThreat, setFilterThreat] = useState('ALL'); // 'ALL' | 'CRITICAL' | 'ELEVATED' | 'CLEARED'
  const [selectedIncident, setSelectedIncident] = useState(null);

  const handleSliderChange = (field, val) => {
    const updated = { ...rules, [field]: Number(val) };
    setRules(updated);
    updatePolicyRules({ [field]: Number(val) });
  };

  const handleToggle = (field) => {
    const updated = { ...rules, [field]: !rules[field] };
    setRules(updated);
    updatePolicyRules({ [field]: !rules[field] });
  };

  const handleExportCSV = () => {
    const headers = ['Incident ID', 'Timestamp', 'Caller ID', 'Identity', 'Context', 'Risk Score', 'Verdict', 'Action Taken', 'Operator'];
    const rows = auditLog.map(log => [
      log.incidentId,
      log.timestamp,
      `"${log.callerId}"`,
      `"${log.claimedIdentity}"`,
      `"${log.callContext}"`,
      log.riskScore,
      `"${log.verdict}"`,
      `"${log.actionTaken}"`,
      `"${log.operator}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `voiceguard-soc-audit-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Audit Log exported to CSV successfully.', 'success');
  };

  // Filtered audit log rows
  const filteredAuditLog = auditLog.filter(log => {
    const matchesSearch = 
      log.callerId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.claimedIdentity?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.incidentId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.transcriptSnippet?.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (filterThreat === 'CRITICAL') return log.threatLevel === 'CRITICAL' || log.riskScore >= 70;
    if (filterThreat === 'ELEVATED') return log.threatLevel === 'MEDIUM' || (log.riskScore >= 30 && log.riskScore < 70);
    if (filterThreat === 'CLEARED') return log.threatLevel === 'LOW' || log.riskScore < 30;

    return true;
  });

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="p-5 rounded-2xl bg-[#0B0F19]/90 border border-slate-800/90 shadow-xl backdrop-blur-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <SlidersHorizontal className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">
              Governance & Prevention Matrix
            </span>
          </div>
          <h2 className="text-2xl font-black text-white font-mono tracking-tight mt-1">
            Enterprise Alerting & Policy Configuration
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Calibrate automated defense thresholds, autonomous SIP call termination, and review historical forensic audit logs.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleExportCSV}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-200 font-mono text-xs flex items-center space-x-2 transition-all"
          >
            <Download className="w-4 h-4 text-cyan-400" />
            <span>EXPORT AUDIT CSV</span>
          </button>
        </div>
      </div>

      {/* Section 1: Dynamic Threshold Sliders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Sliders Card */}
        <div className="p-5 rounded-2xl bg-[#0B0F19]/90 border border-slate-800/90 shadow-xl backdrop-blur-md space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
            <div className="flex items-center space-x-2">
              <Sliders className="w-4 h-4 text-cyan-400" />
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200">
                Transaction Risk Thresholds (%)
              </h3>
            </div>
            <span className="text-[10px] font-mono text-cyan-400">REAL-TIME ENFORCEMENT</span>
          </div>

          <div className="space-y-4">
            {/* Slider 1: High-Value Wire Transfers */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-200 font-bold">High-Value Wire Transfers (&gt;$50k)</span>
                <span className="text-rose-400 font-bold">{rules.wireTransferThreshold}% Risk Trigger</span>
              </div>
              <input
                type="range"
                min="30"
                max="95"
                value={rules.wireTransferThreshold}
                onChange={(e) => handleSliderChange('wireTransferThreshold', e.target.value)}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-rose-500"
              />
              <p className="text-[10.5px] text-slate-400 leading-tight">
                Any call requesting capital movement exceeding this risk index is automatically flagged for supervisor review.
              </p>
            </div>

            {/* Slider 2: Credential & MFA Reset */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-200 font-bold">Credential & Biometric Reset Inquiries</span>
                <span className="text-amber-400 font-bold">{rules.credentialResetThreshold}% Risk Trigger</span>
              </div>
              <input
                type="range"
                min="30"
                max="95"
                value={rules.credentialResetThreshold}
                onChange={(e) => handleSliderChange('credentialResetThreshold', e.target.value)}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
              <p className="text-[10.5px] text-slate-400 leading-tight">
                Calls attempting VIP account password/device recovery require secondary out-of-band challenge.
              </p>
            </div>

            {/* Slider 3: Standard Customer Support */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-200 font-bold">General Telephony Inquiries</span>
                <span className="text-emerald-400 font-bold">{rules.supportInquiryThreshold}% Risk Trigger</span>
              </div>
              <input
                type="range"
                min="40"
                max="95"
                value={rules.supportInquiryThreshold}
                onChange={(e) => handleSliderChange('supportInquiryThreshold', e.target.value)}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
              <p className="text-[10.5px] text-slate-400 leading-tight">
                Lower sensitivity threshold for general inquiries to reduce false positives for customers.
              </p>
            </div>

            {/* Slider 4: Autonomous SIP Disconnect */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-200 font-bold">Autonomous SIP Disconnect Kill-Switch</span>
                <span className="text-rose-500 font-bold">{rules.autoDisconnectThreshold}% Risk Trigger</span>
              </div>
              <input
                type="range"
                min="70"
                max="99"
                value={rules.autoDisconnectThreshold}
                onChange={(e) => handleSliderChange('autoDisconnectThreshold', e.target.value)}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-red-600"
              />
              <p className="text-[10.5px] text-slate-400 leading-tight">
                Autonomous SIP BYE packet sent directly to trunk if synthetic vocoder confidence breaches threshold.
              </p>
            </div>
          </div>
        </div>

        {/* Autonomous Defense Toggles Card */}
        <div className="p-5 rounded-2xl bg-[#0B0F19]/90 border border-slate-800/90 shadow-xl backdrop-blur-md space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200">
                Autonomous Defense Rules & Interceptors
              </h3>
            </div>
            <span className="text-[10px] font-mono text-emerald-400">ACTIVE CONTROLS</span>
          </div>

          <div className="space-y-3">
            {[
              {
                id: 'autoTriggerMFA',
                label: 'Auto-Trigger Secondary MFA Challenge',
                desc: 'Automatically dispatches biometric push notification when risk score > 70% without agent prompt.'
              },
              {
                id: 'outOfBandCallback',
                label: 'Enforce Out-of-Band Callback for Wire Transfers',
                desc: 'Terminates inbound call and rings customer registered corporate number via separate PSTN route.'
              },
              {
                id: 'vocoderPhaseScan',
                label: 'Deep Neural Vocoder Phase Scanning',
                desc: 'Runs intensive STFT phase-inversion analysis to detect HiFi-GAN, WaveGrad, and DiffWave resynthesis.'
              },
              {
                id: 'strictSpectralFilter',
                label: 'Strict Spectral Comb Filtering',
                desc: 'Blocks calls showing artificial frequency comb notches characteristic of voice conversion pipelines.'
              },
              {
                id: 'supervisorEscalation',
                label: 'Tier-2 Fraud Operations Auto-Escalation',
                desc: 'Routes high-risk audio stream directly to Fraud Center supervisor queue with synchronized telemetry.'
              },
              {
                id: 'silentListeningTelemetry',
                label: 'Silent Telemetry Surveillance Mode',
                desc: 'Operates in passive evaluation mode without notifying caller or call center agent.'
              }
            ].map(item => (
              <div key={item.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-900/50 border border-slate-800/70">
                <div className="pr-4">
                  <span className="text-xs font-bold font-mono text-slate-200 block">
                    {item.label}
                  </span>
                  <span className="text-[10.5px] text-slate-400 font-sans leading-tight block mt-0.5">
                    {item.desc}
                  </span>
                </div>
                <button
                  onClick={() => handleToggle(item.id)}
                  className={`p-1 rounded-lg transition-colors shrink-0 ${
                    rules[item.id] ? 'text-cyan-400' : 'text-slate-600'
                  }`}
                >
                  {rules[item.id] ? (
                    <ToggleRight className="w-8 h-8" />
                  ) : (
                    <ToggleLeft className="w-8 h-8" />
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Section 2: Audit Log & Incident Table */}
      <div className="p-5 rounded-2xl bg-[#0B0F19]/90 border border-slate-800/90 shadow-xl backdrop-blur-md space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
          <div className="flex items-center space-x-2">
            <FileSpreadsheet className="w-4 h-4 text-cyan-400" />
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200">
              SOC Incident Audit Log & Forensics Archive ({filteredAuditLog.length} Records)
            </h3>
          </div>

          {/* Search & Filter Controls */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Incident, Caller or Text..."
                className="pl-8 pr-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 w-56"
              />
            </div>

            {/* Filter Pills */}
            <div className="flex items-center space-x-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-[11px] font-mono">
              {['ALL', 'CRITICAL', 'ELEVATED', 'CLEARED'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setFilterThreat(tab)}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    filterThreat === tab 
                      ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40' 
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Incident Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                <th className="py-2.5 px-3">Incident ID</th>
                <th className="py-2.5 px-3">Timestamp</th>
                <th className="py-2.5 px-3">Caller & Context</th>
                <th className="py-2.5 px-3">Threat & Risk</th>
                <th className="py-2.5 px-3">Impersonation Verdict</th>
                <th className="py-2.5 px-3">Action Taken</th>
                <th className="py-2.5 px-3">Operator</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredAuditLog.length > 0 ? (
                filteredAuditLog.map((log) => {
                  const isHigh = log.riskScore >= 70;
                  const isMed = log.riskScore >= 30 && log.riskScore < 70;

                  return (
                    <tr 
                      key={log.incidentId}
                      onClick={() => setSelectedIncident(log)}
                      className="hover:bg-slate-800/40 cursor-pointer transition-colors"
                    >
                      <td className="py-3 px-3 font-bold text-cyan-400 whitespace-nowrap">
                        {log.incidentId}
                      </td>
                      <td className="py-3 px-3 text-slate-400 whitespace-nowrap text-[11px]">
                        {log.timestamp}
                      </td>
                      <td className="py-3 px-3 max-w-[200px]">
                        <span className="font-bold text-slate-200 block truncate">{log.claimedIdentity}</span>
                        <span className="text-[10.5px] text-slate-400 block truncate">{log.callerId} • {log.callContext}</span>
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          isHigh ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40' :
                          isMed ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' :
                          'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                        }`}>
                          {log.riskScore}% ({log.threatLevel})
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-200 font-bold whitespace-nowrap">
                        {log.verdict}
                      </td>
                      <td className="py-3 px-3 text-slate-300 text-[11px] max-w-[180px] truncate">
                        {log.actionTaken}
                      </td>
                      <td className="py-3 px-3 text-slate-400 text-[10.5px] whitespace-nowrap">
                        {log.operator}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-slate-500">
                    No incidents match your search filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Incident Detail Modal */}
      {selectedIncident && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-lg rounded-2xl bg-[#0B0F19] border border-cyan-500/40 p-6 space-y-4 shadow-2xl shadow-cyan-950">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <ShieldAlert className="w-5 h-5 text-rose-400" />
                <h3 className="text-base font-bold font-mono text-white">
                  Incident Forensics: {selectedIncident.incidentId}
                </h3>
              </div>
              <button
                onClick={() => setSelectedIncident(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div className="grid grid-cols-2 gap-2 text-slate-300">
                <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="text-[10px] text-slate-500 uppercase block">Caller</span>
                  <span className="font-bold">{selectedIncident.claimedIdentity}</span>
                  <span className="text-[11px] text-slate-400 block">{selectedIncident.callerId}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="text-[10px] text-slate-500 uppercase block">Verdict</span>
                  <span className="font-bold text-rose-400">{selectedIncident.verdict}</span>
                  <span className="text-[11px] text-slate-400 block">Risk: {selectedIncident.riskScore}%</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-cyan-400 uppercase block mb-1">Captured Audio Transcript Snippet</span>
                <p className="font-sans text-slate-300 leading-relaxed italic">
                  "{selectedIncident.transcriptSnippet}"
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-400">Action Enforced:</span>
                  <span className="font-bold text-emerald-400">{selectedIncident.actionTaken}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Authorized Operator:</span>
                  <span className="text-slate-200">{selectedIncident.operator}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Timestamp:</span>
                  <span className="text-slate-200">{selectedIncident.timestamp}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setSelectedIncident(null)}
              className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-mono text-xs font-bold transition-all"
            >
              Close Incident Dossier
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
