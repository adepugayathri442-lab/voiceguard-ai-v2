import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import SecurityAlertModal from './components/SecurityAlertModal';
import IndependentVerificationModal from './components/IndependentVerificationModal';

// Pages
import LandingPage from './pages/LandingPage';
import DashboardPage from './pages/DashboardPage';
import LiveDetectionPage from './pages/LiveDetectionPage';
import CallMonitorPage from './pages/CallMonitorPage';
import PolicyConfigPage from './pages/PolicyConfigPage';
import PrivacyCompliancePage from './pages/PrivacyCompliancePage';
import VoiceAnalysisPage from './pages/VoiceAnalysisPage';
import HistoryPage from './pages/HistoryPage';
import AlertsPage from './pages/AlertsPage';
import AnalyticsPage from './pages/AnalyticsPage';
import TrustedVoicesPage from './pages/TrustedVoicesPage';
import SettingsPage from './pages/SettingsPage';
import HelpPage from './pages/HelpPage';

function MainLayout() {
  const { activeTab, toastMessage } = useApp();

  return (
    <div className="min-h-screen flex flex-col bg-[#070B14] text-slate-100 font-sans selection:bg-cyan-500 selection:text-black">
      {/* Top Cyber Glow Line */}
      <div className="h-1 w-full bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500 shadow-sm shadow-cyan-500/50"></div>

      {/* Top Navbar */}
      <Navbar />

      {/* Landing page or Dashboard with Sidebar */}
      {activeTab === 'landing' ? (
        <main className="flex-1 w-full overflow-y-auto">
          <LandingPage />
        </main>
      ) : (
        <div className="flex-1 flex overflow-hidden">
          {/* Collapsible Sidebar */}
          <Sidebar />

          {/* Main Content Area */}
          <main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="max-w-7xl mx-auto">
              {activeTab === 'call-monitor' && <CallMonitorPage />}
              {activeTab === 'policy-config' && <PolicyConfigPage />}
              {activeTab === 'privacy-compliance' && <PrivacyCompliancePage />}
              {activeTab === 'dashboard' && <DashboardPage />}
              {activeTab === 'live-detection' && <LiveDetectionPage />}
              {activeTab === 'voice-analysis' && <VoiceAnalysisPage />}
              {activeTab === 'history' && <HistoryPage />}
              {activeTab === 'alerts' && <AlertsPage />}
              {activeTab === 'analytics' && <AnalyticsPage />}
              {activeTab === 'trusted-voices' && <TrustedVoicesPage />}
              {activeTab === 'settings' && <SettingsPage />}
              {activeTab === 'help' && <HelpPage />}
            </div>
          </main>
        </div>
      )}

      {/* Global Modals */}
      <SecurityAlertModal />
      <IndependentVerificationModal />

      {/* Toast Notification */}
      {toastMessage && (
        <div className={`fixed bottom-5 right-5 z-50 px-4 py-3 rounded-xl border shadow-2xl backdrop-blur-md text-xs font-mono flex items-center space-x-2 animate-in slide-in-from-bottom-3 duration-200 ${
          toastMessage.type === 'error'
            ? 'bg-rose-950/90 border-rose-600/80 text-rose-200'
            : toastMessage.type === 'success'
            ? 'bg-emerald-950/90 border-emerald-600/80 text-emerald-200'
            : 'bg-slate-900/95 border-cyan-500/60 text-cyan-300'
        }`}>
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          <span>{toastMessage.msg}</span>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
