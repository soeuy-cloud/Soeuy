import React from 'react';
import { AccountingProvider, useAccounting } from './context/AccountingContext';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { WorkflowCenter } from './components/WorkflowCenter';
import { ThaiTaxReports } from './components/ThaiTaxReports';
import { TransactionsList } from './components/TransactionsList';
import { ChartOfAccounts } from './components/ChartOfAccounts';
import { FinancialReports } from './components/FinancialReports';
import { FixedAssets } from './components/FixedAssets';
import { MasterLists } from './components/MasterLists';
import { AnalyticsView } from './components/AnalyticsView';
import { ActivitiesView } from './components/ActivitiesView';
import { SetupAndApps } from './components/SetupAndApps';
import { OfficialInvoiceForm } from './components/OfficialInvoiceForm';
import { DocumentViewer } from './components/DocumentViewer';
import { Modals } from './components/Modals';
import { CompanySetupModal } from './components/CompanySetupModal';
import { OperatingEntityModal } from './components/OperatingEntityModal';
import { BankControlModal } from './components/BankControlModal';
import { AccountLinkerModal } from './components/AccountLinkerModal';
import { PasswordResetModal } from './components/PasswordResetModal';
import { LoginPage } from './components/LoginPage';
import { ChevronRight, Home, Shield, Bell } from 'lucide-react';

const MainLayout: React.FC = () => {
  const { activeTab, setActiveTab, subView, isAuthenticated, workflowViewMode } = useAccounting();

  if (!isAuthenticated) {
    return (
      <>
        <LoginPage />
        <PasswordResetModal />
      </>
    );
  }

  // Tab title mapping
  const getTabLabel = (tab: string) => {
    switch (tab) {
      case 'home': 
      case 'dashboard': 
        return workflowViewMode === 'flowchart' ? 'Interactive Workflow Diagram' : 'Executive Dashboard & Metrics';
      case 'tax': return 'Tax Compliance (VAT & WHT)';
      case 'transactions': return 'Transactions & General Ledger';
      case 'reports': return 'Financial Statements & Reports';
      case 'coa': return 'Chart of Accounts';
      case 'fixed_assets': return 'Fixed Assets & Depreciation';
      case 'lists': return 'Master Lists & Entities';
      case 'analytics': return 'Financial Analytics & Margins';
      case 'activities': return 'Activities & Audit Trail';
      case 'documents': return 'Official Cambodian Invoice Form (ទម្រង់វិក្កយបត្រ)';
      case 'setup': return 'System Setup';
      case 'suiteapps': return 'SuiteApps & AI OCR';
      case 'support': return 'Support & User Guide';
      default: return tab;
    }
  };

  return (
    <div className="min-h-screen bg-[#f3f4f6] text-gray-800 flex flex-col font-sans">
      {/* Top Suite Header */}
      <Header />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6">
        {(activeTab === 'home' || activeTab === 'dashboard') && (
          workflowViewMode === 'flowchart' ? <WorkflowCenter /> : <Dashboard />
        )}
        {activeTab === 'tax' && <ThaiTaxReports />}
        {activeTab === 'transactions' && <TransactionsList />}
        {activeTab === 'reports' && <FinancialReports />}
        {(activeTab === 'coa' || (activeTab === 'lists' && subView === 'coa')) && <ChartOfAccounts />}
        {activeTab === 'fixed_assets' && <FixedAssets />}
        {activeTab === 'lists' && subView !== 'coa' && <MasterLists />}
        {activeTab === 'analytics' && <AnalyticsView />}
        {activeTab === 'activities' && <ActivitiesView />}
        {activeTab === 'documents' && <OfficialInvoiceForm />}
        {(activeTab === 'setup' || activeTab === 'suiteapps' || activeTab === 'support') && <SetupAndApps />}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-3 px-4 text-center text-xs text-gray-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#d65200]">Suite</span>
            <span>Financial ERP & Accounting System</span>
            <span className="text-gray-300">|</span>
            <span>Tax Compliant & Multi-Currency Ready (VAT & WHT)</span>
          </div>
          <div className="text-[11px] text-gray-400 font-mono">
            Suite Enterprise Edition • v2026.2
          </div>
        </div>
      </footer>

      {/* Global Modals & Document Viewer */}
      <Modals />
      <CompanySetupModal />
      <OperatingEntityModal />
      <BankControlModal />
      <AccountLinkerModal />
      <PasswordResetModal />
      <DocumentViewer />
    </div>
  );
};

export default function App() {
  return (
    <AccountingProvider>
      <MainLayout />
    </AccountingProvider>
  );
}
