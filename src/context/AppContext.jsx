import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { getStoredProfile, saveStoredProfile, deleteStoredProfile } from '../utils/storage';
import { 
  INITIAL_ACTIVE_CALLS, 
  INITIAL_POLICY_RULES, 
  INITIAL_COMPLIANCE_DATA, 
  INITIAL_AUDIT_LOG 
} from '../data/mockData';

const AppContext = createContext();

const DEFAULT_SETTINGS = {
  realTimeDetection: true,
  sensitivity: 'HIGH', // LOW, MEDIUM, HIGH
  speechThreshold: 12,
  riskThreshold: 70,
  autoAlertOnHighRisk: true,
  monitorIncoming: true,
  protectionMode: 'AUTO_DEFENSE',
  soundAlerts: true,
  demoMode: false,
};

export function AppProvider({ children }) {
  // Navigation State
  const [activeTab, setActiveTab] = useState('landing'); // Default to VoiceGuard AI Landing Page
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Persistent History
  const [history, setHistory] = useState(() => {
    try {
      const saved = localStorage.getItem('voiceguard_history_v4');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Persistent Alerts
  const [alerts, setAlerts] = useState(() => {
    try {
      const saved = localStorage.getItem('voiceguard_alerts_v4');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Enrolled Trusted Voices
  const [trustedVoices, setTrustedVoices] = useState(() => {
    try {
      const profile = getStoredProfile();
      if (profile) {
        return [{
          id: profile.id || profile.voiceFingerprintId || 'tv-primary',
          name: profile.name || 'Primary User (Registered Voice)',
          phone: profile.phone || '+91 98765 43210',
          relationship: 'Primary Identity',
          status: 'ENROLLED',
          baselinePitchHz: profile.baselinePitchHz || profile.fundamentalPitchHz || 135,
          spectralCentroidHz: profile.spectralCentroidHz || 2200,
          registeredAt: profile.registeredAt || new Date().toISOString(),
          mfccBands: profile.mfccBands || []
        }];
      }
      const saved = localStorage.getItem('voiceguard_trusted_v4');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Settings
  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('voiceguard_settings_v4');
      return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  // Enterprise SOC Active Call Feed & Simulation Stream
  const [activeCallFeed, setActiveCallFeed] = useState(() => {
    try {
      const saved = localStorage.getItem('voiceguard_active_feed_v4');
      return saved ? JSON.parse(saved) : INITIAL_ACTIVE_CALLS;
    } catch {
      return INITIAL_ACTIVE_CALLS;
    }
  });

  const [selectedCallId, setSelectedCallId] = useState(INITIAL_ACTIVE_CALLS[0].id);
  const [isSimulatingStream, setIsSimulatingStream] = useState(false);
  const [liveRiskScore, setLiveRiskScore] = useState(INITIAL_ACTIVE_CALLS[0].riskScore);
  const [highRiskAlertActive, setHighRiskAlertActive] = useState(INITIAL_ACTIVE_CALLS[0].riskScore >= 75);

  const [policyRules, setPolicyRules] = useState(() => {
    try {
      const saved = localStorage.getItem('voiceguard_policy_rules_v4');
      return saved ? { ...INITIAL_POLICY_RULES, ...JSON.parse(saved) } : INITIAL_POLICY_RULES;
    } catch {
      return INITIAL_POLICY_RULES;
    }
  });

  const [complianceData, setComplianceData] = useState(() => {
    try {
      const saved = localStorage.getItem('voiceguard_compliance_v4');
      return saved ? { ...INITIAL_COMPLIANCE_DATA, ...JSON.parse(saved) } : INITIAL_COMPLIANCE_DATA;
    } catch {
      return INITIAL_COMPLIANCE_DATA;
    }
  });

  const [auditLog, setAuditLog] = useState(() => {
    try {
      const saved = localStorage.getItem('voiceguard_audit_log_v4');
      return saved ? JSON.parse(saved) : INITIAL_AUDIT_LOG;
    } catch {
      return INITIAL_AUDIT_LOG;
    }
  });

  // Live Runtime States
  const [currentCall, setCurrentCall] = useState(null);
  const [lastDetection, setLastDetection] = useState(null);
  const [activeSecurityAlert, setActiveSecurityAlert] = useState(null);
  const [verificationModalOpen, setVerificationModalOpen] = useState(false);
  const [verificationTarget, setVerificationTarget] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  // Selected Call Object
  const selectedCall = useMemo(() => {
    return activeCallFeed.find(c => c.id === selectedCallId) || activeCallFeed[0];
  }, [activeCallFeed, selectedCallId]);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('voiceguard_history_v4', JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    localStorage.setItem('voiceguard_alerts_v4', JSON.stringify(alerts));
  }, [alerts]);

  useEffect(() => {
    localStorage.setItem('voiceguard_trusted_v4', JSON.stringify(trustedVoices));
  }, [trustedVoices]);

  useEffect(() => {
    localStorage.setItem('voiceguard_settings_v4', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('voiceguard_active_feed_v4', JSON.stringify(activeCallFeed));
  }, [activeCallFeed]);

  useEffect(() => {
    localStorage.setItem('voiceguard_policy_rules_v4', JSON.stringify(policyRules));
  }, [policyRules]);

  useEffect(() => {
    localStorage.setItem('voiceguard_compliance_v4', JSON.stringify(complianceData));
  }, [complianceData]);

  useEffect(() => {
    localStorage.setItem('voiceguard_audit_log_v4', JSON.stringify(auditLog));
  }, [auditLog]);

  // Dynamic duration increment for active telephony calls
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveCallFeed(prev => prev.map(call => {
        if (call.status === 'TERMINATED') return call;
        return { ...call, durationSeconds: call.durationSeconds + 1 };
      }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Sync risk score when selected call changes
  useEffect(() => {
    if (selectedCall) {
      setLiveRiskScore(selectedCall.riskScore);
      setHighRiskAlertActive(selectedCall.riskScore >= (policyRules.highRiskAlertThreshold || 75));
    }
  }, [selectedCallId, policyRules.highRiskAlertThreshold]);

  // Derived Analytics Strictly from History & Active Calls
  const analytics = useMemo(() => {
    const total = history.length + activeCallFeed.length;
    const highRisk = history.filter(h => h.riskScore >= 70 || h.riskLevel === 'HIGH').length + activeCallFeed.filter(c => c.riskScore >= 70).length;
    const mediumRisk = history.filter(h => (h.riskScore >= 30 && h.riskScore < 70) || h.riskLevel === 'MEDIUM').length + activeCallFeed.filter(c => c.riskScore >= 30 && c.riskScore < 70).length;
    const lowRisk = history.filter(h => h.riskScore < 30 || h.riskLevel === 'LOW').length + activeCallFeed.filter(c => c.riskScore < 30).length;
    const authentic = history.filter(h => h.classification === 'AUTHENTIC / HUMAN' || h.voiceType === 'HUMAN').length + activeCallFeed.filter(c => c.waveformType === 'HUMAN_CLEARED').length;
    const suspicious = history.filter(h => h.classification === 'SUSPICIOUS' || h.voiceType === 'SUSPICIOUS').length + activeCallFeed.filter(c => c.waveformType === 'HYBRID_SUSPICIOUS').length;
    const clones = history.filter(h => h.classification?.includes('CLONE') || h.classification?.includes('SYNTHETIC') || h.voiceType === 'AI_CLONE').length + activeCallFeed.filter(c => c.waveformType === 'CLONE_ATTACK').length;

    const avgRisk = total > 0 
      ? Math.round(([...history, ...activeCallFeed].reduce((acc, h) => acc + (h.riskScore || 0), 0)) / total) 
      : 42;

    return {
      callsMonitored: total,
      highRisk,
      mediumRisk,
      lowRisk,
      humanVerified: authentic,
      suspiciousCalls: suspicious,
      aiDetected: clones,
      threatsPrevented: highRisk,
      avgRiskScore: avgRisk,
      totalAlerts: alerts.length,
      unreadAlerts: alerts.filter(a => !a.read).length
    };
  }, [history, alerts, activeCallFeed]);

  const showToast = (msg, type = 'info') => {
    setToastMessage({ msg, type, id: Date.now() });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Enterprise SOC Actions & Simulation
  const selectCall = (callId) => {
    setSelectedCallId(callId);
    const target = activeCallFeed.find(c => c.id === callId);
    if (target) {
      setLiveRiskScore(target.riskScore);
      setHighRiskAlertActive(target.riskScore >= (policyRules.highRiskAlertThreshold || 75));
      showToast(`Telemetry channel focused on: ${target.callerName} (${target.callerId})`, 'info');
    }
  };

  /**
   * Simulate Live Call:
   * Generates dynamic fluctuating mock audio data, updates the risk score in real-time,
   * and triggers the high-risk banner if > 75%.
   */
  const simulateLiveCall = () => {
    setIsSimulatingStream(true);
    showToast('Simulating live SIP audio stream & neural vocoder scanning...', 'info');

    // Cycle between attack and safe call
    const targetCall = selectedCall.riskScore > 50
      ? activeCallFeed.find(c => c.riskScore < 30) || activeCallFeed[1]
      : activeCallFeed.find(c => c.riskScore > 70) || activeCallFeed[0];

    setSelectedCallId(targetCall.id);

    let current = 25;
    const target = targetCall.riskScore;
    const step = target > current ? 14 : -10;

    const interval = setInterval(() => {
      current += step;
      if ((step > 0 && current >= target) || (step < 0 && current <= target)) {
        current = target;
        clearInterval(interval);
        setIsSimulatingStream(false);

        if (target >= (policyRules.highRiskAlertThreshold || 75)) {
          setHighRiskAlertActive(true);
          showToast(`🚨 High Impersonation Risk (${target}%) detected! Warning Banner Active.`, 'error');
        } else {
          setHighRiskAlertActive(false);
          showToast(`✅ Voice Biometric Authenticity Verified (${target}% Risk). Call Cleared.`, 'success');
        }
      }
      setLiveRiskScore(current);
    }, 150);
  };

  const triggerSecondaryMFA = (callId) => {
    const target = activeCallFeed.find(c => c.id === (callId || selectedCallId)) || selectedCall;
    showToast(`Out-of-Band Biometric Challenge dispatched to ${target.callerId}`, 'success');

    const newEntry = {
      incidentId: `INC-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      callerId: target.callerId,
      claimedIdentity: target.callerName,
      callContext: target.context,
      riskScore: target.riskScore,
      threatLevel: target.threatLevel,
      verdict: target.status === 'ACTIVE_SUSPICIOUS' ? 'AI CLONE SUSPECTED' : 'ELEVATED RISK',
      transcriptSnippet: target.transcript,
      actionTaken: 'Triggered Secondary MFA Challenge',
      operator: 'SOC Tier 1 Analyst'
    };
    setAuditLog(prev => [newEntry, ...prev]);
  };

  const requestCallback = (callId) => {
    const target = activeCallFeed.find(c => c.id === (callId || selectedCallId)) || selectedCall;
    showToast(`Initiating Out-of-Band Callback to registered corporate phone for ${target.callerName}`, 'info');
    const newEntry = {
      incidentId: `INC-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      callerId: target.callerId,
      claimedIdentity: target.callerName,
      callContext: target.context,
      riskScore: target.riskScore,
      threatLevel: target.threatLevel,
      verdict: 'CALL CHALLENGED',
      transcriptSnippet: target.transcript,
      actionTaken: 'Enforced Out-of-Band Callback',
      operator: 'SOC Tier 1 Analyst'
    };
    setAuditLog(prev => [newEntry, ...prev]);
  };

  const escalateToSupervisor = (callId) => {
    const target = activeCallFeed.find(c => c.id === (callId || selectedCallId)) || selectedCall;
    showToast(`Escalated to Fraud Operations Supervisor (Tier 2 Queue)`, 'error');
    const newEntry = {
      incidentId: `INC-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      callerId: target.callerId,
      claimedIdentity: target.callerName,
      callContext: target.context,
      riskScore: target.riskScore,
      threatLevel: 'CRITICAL',
      verdict: 'ESCALATED FOR FRAUD INTERVENTION',
      transcriptSnippet: target.transcript,
      actionTaken: 'Escalated to Fraud Supervisor & Freezing Wire Transfer',
      operator: 'SOC Supervisor Dispatched'
    };
    setAuditLog(prev => [newEntry, ...prev]);
  };

  const terminateCall = (callId) => {
    const targetId = callId || selectedCallId;
    const target = activeCallFeed.find(c => c.id === targetId) || selectedCall;
    showToast(`SIP Trunk Terminated! Call disconnected for ${target.callerId}`, 'error');

    setActiveCallFeed(prev => prev.map(c => c.id === targetId ? { ...c, status: 'TERMINATED', riskScore: 99 } : c));
    setHighRiskAlertActive(false);

    const newEntry = {
      incidentId: `INC-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      callerId: target.callerId,
      claimedIdentity: target.callerName,
      callContext: target.context,
      riskScore: target.riskScore,
      threatLevel: 'CRITICAL',
      verdict: 'IMPERSONATION DETECTED - CALL KILLED',
      transcriptSnippet: target.transcript,
      actionTaken: 'Terminated Call & Blocked Originating SIP Trunk',
      operator: 'Autonomous Defense Engine'
    };
    setAuditLog(prev => [newEntry, ...prev]);
  };

  const updatePolicyRules = (newRules) => {
    setPolicyRules(prev => ({ ...prev, ...newRules }));
    showToast('Enterprise Policy Thresholds updated successfully.', 'success');
  };

  const updateCompliance = (newData) => {
    setComplianceData(prev => ({ ...prev, ...newData }));
    showToast('Privacy & Compliance configuration synchronized.', 'success');
  };

  const dismissHighRiskAlert = () => {
    setHighRiskAlertActive(false);
  };

  /**
   * Cascade a new REAL detection event
   */
  const recordDetectionEvent = (result) => {
    setLastDetection(result);
    setHistory(prev => [result, ...prev]);

    const threshold = policyRules.highRiskAlertThreshold || 75;
    if (result.riskScore >= threshold || result.requiresAlert) {
      const isClone = result.classification?.includes('CLONE') || result.voiceType === 'AI_CLONE';
      const newAlert = {
        id: `alt-${Date.now().toString().slice(-4)}`,
        type: 'CRITICAL',
        title: isClone ? 'High-Risk Voice Clone Impersonation Detected' : 'High Acoustic Anomaly Alert',
        caller: result.caller,
        callerName: result.callerName,
        timestamp: 'Just now',
        riskScore: result.riskScore,
        confidence: result.confidence,
        reason: result.indicators?.[0] || 'Vocal anomalies exceeding security tolerance threshold.',
        read: false,
        resolved: false,
        action: 'Threat Flagged'
      };
      setAlerts(prev => [newAlert, ...prev]);
      setActiveSecurityAlert(result);
      setHighRiskAlertActive(true);
    }
  };

  const enrollTrustedVoice = (profileData) => {
    saveStoredProfile(profileData);
    const newEntry = {
      id: profileData.id || `tv-${Date.now().toString().slice(-4)}`,
      name: profileData.name || 'Primary User Voice',
      phone: profileData.phone || '+91 98765 43210',
      relationship: profileData.relationship || 'Self / Primary',
      status: 'ENROLLED',
      baselinePitchHz: profileData.fundamentalPitchHz || 135,
      spectralCentroidHz: profileData.spectralCentroidHz || 2200,
      jitterPercent: profileData.jitterPercent || 0.55,
      registeredAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      mfccBands: profileData.mfccBands || []
    };
    setTrustedVoices(prev => [newEntry, ...prev.filter(p => p.id !== newEntry.id)]);
    showToast(`Voice Profile "${newEntry.name}" saved to biometric vault.`, 'success');
  };

  const deleteTrustedVoice = (id) => {
    deleteStoredProfile();
    setTrustedVoices(prev => prev.filter(v => v.id !== id));
    showToast('Voice profile removed from biometric vault.', 'info');
  };

  const clearAllData = () => {
    localStorage.removeItem('voiceguard_history_v4');
    localStorage.removeItem('voiceguard_alerts_v4');
    localStorage.removeItem('voiceguard_active_feed_v4');
    setHistory([]);
    setAlerts([]);
    setActiveCallFeed(INITIAL_ACTIVE_CALLS);
    setLastDetection(null);
    setCurrentCall(null);
    setActiveSecurityAlert(null);
    setHighRiskAlertActive(false);
    showToast('All detection logs and active feeds reset to baseline.', 'info');
  };

  const handleEndCall = () => {
    setCurrentCall(null);
    setActiveSecurityAlert(null);
    showToast('Audio stream terminated and disconnected.', 'error');
  };

  const handleBlockCaller = (caller) => {
    setCurrentCall(null);
    setActiveSecurityAlert(null);
    showToast(`Caller ${caller} added to threat blacklist.`, 'error');
  };

  const handleReportThreat = () => {
    showToast('Incident report compiled and dispatched to National Cyber Crime portal.', 'success');
  };

  const handleNotifyTrustedContact = () => {
    showToast('Security notification dispatched to registered emergency contact.', 'success');
  };

  const handleSaveEvidence = (item) => {
    const reportData = {
      caseId: item?.id || 'VG-REPORT',
      timestamp: item?.timestamp || new Date().toISOString(),
      riskScore: item?.riskScore,
      riskLevel: item?.riskLevel,
      classification: item?.classification || item?.voiceType,
      features: item?.features,
      indicators: item?.indicators,
      speakerMatch: item?.speakerMatch
    };
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `voiceguard-forensic-${item?.id || 'audit'}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Forensic audit JSON telemetry packet downloaded.', 'info');
  };

  const handleStartIndependentVerification = (target) => {
    setVerificationTarget(target || lastDetection);
    setVerificationModalOpen(true);
  };

  const handleCompleteVerification = (verified) => {
    setVerificationModalOpen(false);
    if (verified) {
      showToast('Independent Out-of-band Verification SUCCESSFUL.', 'success');
      if (activeSecurityAlert) setActiveSecurityAlert(null);
      setHistory(prev => prev.map(item =>
        item.id === verificationTarget?.id
          ? { ...item, status: 'VERIFIED', actionTaken: 'Passed Independent Challenge' }
          : item
      ));
    } else {
      showToast('Independent Verification FAILED! Threat blocked.', 'error');
      handleEndCall();
      if (verificationTarget) {
        setHistory(prev => prev.map(item =>
          item.id === verificationTarget?.id
            ? { ...item, status: 'BLOCKED', actionTaken: 'Failed Independent Challenge - Blocked' }
            : item
        ));
      }
    }
  };

  return (
    <AppContext.Provider value={{
      activeTab,
      setActiveTab,
      sidebarOpen,
      setSidebarOpen,
      history,
      setHistory,
      alerts,
      setAlerts,
      trustedVoices,
      setTrustedVoices,
      enrollTrustedVoice,
      deleteTrustedVoice,
      settings,
      setSettings,
      analytics,
      currentCall,
      setCurrentCall,
      lastDetection,
      setLastDetection,
      recordDetectionEvent,
      clearAllData,
      activeSecurityAlert,
      setActiveSecurityAlert,
      verificationModalOpen,
      setVerificationModalOpen,
      verificationTarget,
      handleStartIndependentVerification,
      handleCompleteVerification,
      handleEndCall,
      handleBlockCaller,
      handleReportThreat,
      handleNotifyTrustedContact,
      handleSaveEvidence,
      toastMessage,
      showToast,

      // Enterprise SOC additions
      activeCallFeed,
      setActiveCallFeed,
      selectedCallId,
      setSelectedCallId,
      selectedCall,
      selectCall,
      isSimulatingStream,
      liveRiskScore,
      highRiskAlertActive,
      dismissHighRiskAlert,
      policyRules,
      updatePolicyRules,
      complianceData,
      updateCompliance,
      auditLog,
      setAuditLog,
      simulateLiveCall,
      triggerSecondaryMFA,
      requestCallback,
      escalateToSupervisor,
      terminateCall
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}
