import React, { useState } from 'react';
import { 
  Building2, 
  Sparkles, 
  HelpCircle, 
  ShieldCheck, 
  Globe2, 
  CheckCircle2, 
  Upload, 
  FileText,
  Layers,
  Settings,
  RefreshCw,
  Users,
  UserPlus,
  Shield,
  Check,
  Lock,
  Sliders,
  Key,
  Edit3,
  Mail,
  Phone,
  Globe,
  MapPin,
  Percent,
  ExternalLink,
  DollarSign,
  ArrowRightLeft,
  TrendingUp,
  Clock,
  Coins,
  X,
  Search,
  Eye,
  Filter,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { useAccounting, FX_RATES } from '../context/AccountingContext';
import { CurrencyCode } from '../types';
export const SetupAndApps: React.FC = () => {
  const { 
    activeTab, 
    setActiveTab,
    subView, 
    setSubView, 
    resetDatabase, 
    formatCurrency, 
    currentCurrency,
    setCurrentCurrency,
    companyProfile,
    setIsCompanySetupModalOpen,
    operatingEntities,
    setIsEntityModalOpen,
    setSelectedEntityForEdit,
    users,
    currentUser,
    setCurrentUser,
    setIsUserModalOpen,
    setIsAccessControlModalOpen,
    setSelectedUserForEdit,
    transactions,
    setPreviewDoc
  } = useAccounting();

  // Active sub-section within Setup
  const [setupSection, setSetupSection] = useState<'entities' | 'users'>(
    subView === 'users' ? 'users' : 'entities'
  );

  // Sync subView if set from header dropdown
  React.useEffect(() => {
    if (subView === 'users') {
      setSetupSection('users');
    } else if (subView === 'company' || subView === 'subsidiaries' || subView === 'periods' || subView === 'entities') {
      setSetupSection('entities');
    }
  }, [subView]);

  // OCR state
  const [isScanning, setIsScanning] = useState(false);
  const [ocrResult, setOcrResult] = useState<any>(null);

  // Currency & NBC Exchange Rate state
  const [khrRate, setKhrRate] = useState<number>(4050); // 1 USD = 4,050 KHR (NBC Official Daily Rate)
  const [thbRate, setThbRate] = useState<number>(35.71); // 1 USD = 35.71 THB
  const [eurRate, setEurRate] = useState<number>(0.9259); // 1 USD = 0.9259 EUR
  const [gbpRate, setGbpRate] = useState<number>(0.7813); // 1 USD = 0.7813 GBP
  const [sgdRate, setSgdRate] = useState<number>(1.3333); // 1 USD = 1.3333 SGD
  const [cnyRate, setCnyRate] = useState<number>(7.2450); // 1 USD = 7.2450 CNY
  const [jpyRate, setJpyRate] = useState<number>(155.40); // 1 USD = 155.40 JPY
  const [vndRate, setVndRate] = useState<number>(25420); // 1 USD = 25,420 VND
  const [calcUsdInput, setCalcUsdInput] = useState<number>(1);
  const [isSyncingRates, setIsSyncingRates] = useState<boolean>(false);
  const [syncSuccessMsg, setSyncSuccessMsg] = useState<string | null>(null);
  const [lastSyncTime, setLastSyncTime] = useState<string>('Live NBC Standard');

  // Double-click currency transactions modal state
  const [selectedCurrencyModal, setSelectedCurrencyModal] = useState<CurrencyCode | null>(null);
  const [currencyModalFilter, setCurrencyModalFilter] = useState<'All' | 'Invoice' | 'Bill' | 'Journal'>('All');
  const [currencySearchQuery, setCurrencySearchQuery] = useState<string>('');

  const handleCurrencyDoubleClick = (code: CurrencyCode) => {
    setCurrentCurrency(code);
    setSelectedCurrencyModal(code);
  };

  const handleSyncNbcRates = () => {
    setIsSyncingRates(true);
    setSyncSuccessMsg(null);
    setTimeout(() => {
      setIsSyncingRates(false);
      setKhrRate(4050); // Standard latest NBC rate
      setLastSyncTime(`Synced ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} (NBC Official)`);
      setSyncSuccessMsg('Exchange rates updated to latest NBC daily standard.');
      setTimeout(() => setSyncSuccessMsg(null), 3000);
    }, 800);
  };

  const handleScanSample = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      setOcrResult({
        vendorName: 'Marriott Resort Phuket',
        taxId: '0105548019921',
        total: 145000,
        vatAmount: 10150,
        whtRate: 0.03,
        confidence: 99.4,
      });
    }, 1200);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* 1. SETUP TAB */}
      {activeTab === 'setup' && (
        <div className="space-y-6">
          {/* Render Active Section */}
          {setupSection === 'entities' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSetupSection('entities')}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold bg-white text-blue-700 shadow-2xs border border-gray-200"
                  >
                    Legal Entities & Subsidiaries
                  </button>
                  <button
                    type="button"
                    onClick={() => setSetupSection('users')}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  >
                    User Access ({users.length})
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Company Info */}
                <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-2xs space-y-4 text-xs">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                    <div className="flex items-center gap-2 text-sm font-bold text-gray-900">
                      <Building2 className="w-4 h-4 text-[#d65200]" />
                      <span>Legal Entity Information</span>
                    </div>
                    <button
                      onClick={() => setIsCompanySetupModalOpen(true)}
                      className="flex items-center gap-1 px-2.5 py-1 bg-orange-50 hover:bg-orange-100 text-[#d65200] rounded text-xs font-bold transition border border-orange-200 shadow-2xs"
                      title="Edit Company Legal Profile & Setup"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit Setup</span>
                    </button>
                  </div>
                  <div className="space-y-2.5">
                    <div>
                      <span className="text-gray-500 block text-[11px]">Company Registered Legal Name:</span>
                      <span className="font-bold text-gray-900 text-sm">{companyProfile.name}</span>
                      {companyProfile.shortName && (
                        <span className="ml-2 px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded text-[10px] font-semibold">
                          {companyProfile.shortName}
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-gray-500 block text-[11px]">Tax Identification Number (13 Digits):</span>
                        <span className="font-mono font-bold text-[#d65200]">{companyProfile.taxId}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 block text-[11px]">Branch Identifier:</span>
                        <span className="font-mono text-gray-800 font-semibold">{companyProfile.branchNumber || '00000 (Headquarters)'}</span>
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-500 block text-[11px]">Headquarters Registered Address:</span>
                      <span className="text-gray-800 leading-relaxed">{companyProfile.address}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 pt-1 border-t border-gray-50 text-[11px]">
                      <div>
                        <span className="text-gray-500 block">Phone:</span>
                        <span className="text-gray-800 font-medium">{companyProfile.phone || '—'}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 block">Accounting Email:</span>
                        <span className="text-gray-800 font-medium">{companyProfile.email || '—'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Operating Subsidiaries & Business Units */}
                <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-2xs space-y-4 text-xs">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                    <div className="flex items-center gap-2 text-sm font-bold text-gray-900">
                      <Globe2 className="w-4 h-4 text-blue-600" />
                      <span>Suite Operating Entities ({operatingEntities.length})</span>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedEntityForEdit(null);
                        setIsEntityModalOpen(true);
                      }}
                      className="flex items-center gap-1 px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded text-xs font-bold transition border border-blue-200 shadow-2xs"
                      title="Configure & Edit Operating Entities"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit Entities</span>
                    </button>
                  </div>
                  <div className="divide-y divide-gray-100 max-h-[220px] overflow-y-auto pr-1">
                    {operatingEntities.map((ent) => (
                      <div 
                        key={ent.id} 
                        onClick={() => {
                          setSelectedEntityForEdit(ent);
                          setIsEntityModalOpen(true);
                        }}
                        className="py-2.5 flex justify-between items-center hover:bg-blue-50/40 px-2 rounded -mx-2 transition cursor-pointer group"
                      >
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-gray-900 group-hover:text-blue-700 transition-colors">{ent.name}</span>
                            <span className="text-[10px] text-gray-400 font-mono">({ent.code})</span>
                          </div>
                          <span className="text-[10px] text-gray-500 block font-mono">
                            {ent.type} • {ent.currency} {ent.taxId ? `• Tax: ${ent.taxId}` : ''}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                            ent.status === 'Primary' ? 'bg-emerald-100 text-emerald-800' :
                            ent.status === 'Connected' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-600'
                          }`}>
                            {ent.status === 'Primary' ? 'Primary Ledger' : ent.status}
                          </span>
                          <span className="opacity-0 group-hover:opacity-100 transition-opacity text-blue-600">
                            <Edit3 className="w-3 h-3" />
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {setupSection === 'users' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSetupSection('entities')}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  >
                    Legal Entities & Subsidiaries
                  </button>
                  <button
                    type="button"
                    onClick={() => setSetupSection('users')}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold bg-white text-purple-700 shadow-2xs border border-gray-200"
                  >
                    User Access ({users.length})
                  </button>
                </div>
              </div>
              {/* Multi-User & Access Control Management */}
              <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-2xs space-y-4 text-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-100 pb-3 gap-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-orange-100 text-[#d65200] flex items-center justify-center font-bold">
                      <Users className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-gray-900">User Access & Role Administration ({users.length})</h3>
                      <p className="text-[11px] text-gray-500">System Administrators can configure granular limited module access per team member</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setSelectedUserForEdit(null);
                        setIsAccessControlModalOpen(true);
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-900 hover:bg-gray-800 text-white font-bold rounded text-xs shadow-2xs transition"
                    >
                      <Sliders className="w-3.5 h-3.5 text-amber-400" />
                      <span>Manage Access & Permissions</span>
                    </button>
                    <button
                      onClick={() => {
                        if (!currentUser?.isAdmin) {
                          alert('Administrator privileges required. Please switch to the System Administrator session to register team members.');
                          return;
                        }
                        setIsUserModalOpen(true);
                      }}
                      className={`flex items-center gap-1.5 px-3 py-1.5 font-bold rounded text-xs shadow-2xs transition ${
                        currentUser?.isAdmin 
                          ? 'bg-[#d65200] hover:bg-[#bf4700] text-white' 
                          : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>+ Add Team Member</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {users.map((user) => {
                    const isActive = user.id === currentUser?.id;
                    return (
                      <div
                        key={user.id}
                        className={`p-3.5 rounded-lg border transition flex flex-col justify-between ${
                          isActive ? 'border-[#d65200] bg-orange-50/40 ring-1 ring-orange-200' : 'border-gray-200 bg-white hover:border-gray-300'
                        }`}
                      >
                        <div>
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className={`w-9 h-9 rounded-full ${user.avatarColor || 'bg-gray-500'} text-white font-bold flex items-center justify-center text-xs shadow-xs shrink-0`}>
                                {user.initials}
                              </div>
                              <div className="min-w-0">
                                <div className="font-bold text-gray-900 flex items-center gap-1 truncate">
                                  <span>{user.name}</span>
                                  {user.isAdmin && (
                                    <span className="text-amber-600 text-xs" title="System Administrator">👑</span>
                                  )}
                                  {isActive && (
                                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#d65200] text-white font-bold shrink-0">
                                      Current
                                    </span>
                                  )}
                                </div>
                                <div className="text-[10px] text-gray-500 font-mono truncate">{user.email}</div>
                              </div>
                            </div>

                            {/* Admin quick access button */}
                            {currentUser?.isAdmin && (
                              <button
                                type="button"
                                title={`Configure access for ${user.name}`}
                                onClick={() => {
                                  setSelectedUserForEdit(user);
                                  setIsAccessControlModalOpen(true);
                                }}
                                className="p-1 text-gray-400 hover:text-[#d65200] hover:bg-orange-100 rounded transition shrink-0"
                              >
                                <Sliders className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>

                          {/* Access Scope / Permission Badges */}
                          <div className="mt-2.5 space-y-1">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className={`px-1.5 py-0.5 rounded font-bold text-[9px] ${
                                user.isAdmin ? 'bg-amber-100 text-amber-900 border border-amber-200' : 'bg-blue-100 text-blue-800'
                              }`}>
                                {user.isAdmin ? '👑 System Administrator' : user.role}
                              </span>
                              <span className="text-[10px] text-gray-400">•</span>
                              <span className="text-[10px] text-gray-600">{user.department}</span>
                            </div>

                            {/* Granted Module Chips */}
                            <div className="pt-1 flex flex-wrap gap-1">
                              {user.isAdmin ? (
                                <span className="text-[9px] px-1.5 py-0.5 bg-amber-50 text-amber-800 rounded border border-amber-200 font-medium">
                                  Full Enterprise Access (All Modules)
                                </span>
                              ) : (
                                user.accessKeys && user.accessKeys.length > 0 ? (
                                  user.accessKeys.slice(0, 3).map((key, idx) => (
                                    <span key={idx} className="text-[9px] px-1.5 py-0.5 bg-gray-100 text-gray-700 rounded font-medium">
                                      ✓ {key.replace('_', ' ')}
                                    </span>
                                  ))
                                ) : (
                                  <span className="text-[9px] px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded">
                                    Standard View
                                  </span>
                                )
                              )}
                              {!user.isAdmin && user.accessKeys && user.accessKeys.length > 3 && (
                                <span className="text-[9px] px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded font-medium">
                                  +{user.accessKeys.length - 3} more
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="mt-3 pt-2 border-t border-gray-100 flex items-center justify-between">
                          <div className="flex items-center gap-1 text-[10px] text-gray-500">
                            <span className={`w-2 h-2 rounded-full ${user.status === 'Online' ? 'bg-emerald-500' : user.status === 'Away' ? 'bg-amber-400' : 'bg-slate-400'}`} />
                            <span>{user.status}</span>
                          </div>
                          {!isActive ? (
                            <button
                              onClick={() => setCurrentUser(user)}
                              className="px-2.5 py-1 bg-white border border-gray-300 hover:border-orange-400 hover:text-[#d65200] text-gray-700 rounded font-semibold text-[10px] transition"
                            >
                              Switch User
                            </button>
                          ) : (
                            <span className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1">
                              <Check className="w-3 h-3" /> Active Session
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Database Reset Option */}
          <div className="bg-rose-50/50 border border-rose-200 rounded-lg p-4 flex items-center justify-between text-xs">
            <div>
              <h4 className="font-bold text-rose-900">Reset Demo Ledger Database</h4>
              <p className="text-rose-700">Restore all Chart of Accounts, sample transactions, and tax entries to initial state.</p>
            </div>
            <button
              onClick={() => {
                if (confirm('Are you sure you want to reset all accounts and transactions to initial demo state?')) {
                  resetDatabase();
                }
              }}
              className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded shadow-xs"
            >
              Reset Data
            </button>
          </div>
        </div>
      )}

      {/* 2. SUITEAPPS TAB */}
      {activeTab === 'suiteapps' && (
        <div className="space-y-6">
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-2xs">
            <h1 className="text-xl font-bold text-gray-900">
              Suite SuiteApps & Smart AI Connectors
            </h1>
            <p className="text-xs text-gray-500">
              Automated extensions for Electronic Invoicing, AI Document Processing, and Live FX Rates.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* App 1: e-Tax Invoice Connector */}
            <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-2xs space-y-3 text-xs">
              <div className="flex justify-between items-start">
                <span className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                  <ShieldCheck className="w-5 h-5" />
                </span>
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded">
                  Connected
                </span>
              </div>
              <h3 className="font-bold text-gray-900 text-sm">e-Tax Invoice by Email & API</h3>
              <p className="text-gray-600">
                Direct integration with electronic invoice XML signature validation & PDF signing.
              </p>
              <div className="pt-2 border-t border-gray-100 text-[11px] text-gray-500">
                Status: <span className="text-emerald-700 font-semibold">Active & Syncing</span>
              </div>
            </div>

            {/* App 2: AI OCR Invoice Scanner */}
            <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-2xs space-y-3 text-xs">
              <div className="flex justify-between items-start">
                <span className="p-2 bg-orange-50 text-[#d65200] rounded-lg">
                  <Sparkles className="w-5 h-5" />
                </span>
                <span className="px-2 py-0.5 bg-orange-100 text-[#d65200] text-[10px] font-bold rounded">
                  Gemini Vision
                </span>
              </div>
              <h3 className="font-bold text-gray-900 text-sm">AI Invoice & Receipt OCR</h3>
              <p className="text-gray-600">
                Scan paper hotel invoices or receipts to automatically extract Tax ID, 7% VAT, and WHT deduction.
              </p>
              <button
                onClick={handleScanSample}
                disabled={isScanning}
                className="w-full py-1.5 bg-[#d65200] hover:bg-[#b84300] text-white rounded font-bold shadow-xs transition flex items-center justify-center gap-1.5"
              >
                {isScanning ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Scanning Document...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-3.5 h-3.5" />
                    <span>Test AI OCR Scan</span>
                  </>
                )}
              </button>

              {ocrResult && (
                <div className="p-2.5 bg-orange-50/70 border border-orange-200 rounded text-[11px] space-y-1">
                  <div className="font-bold text-[#d65200]">OCR Match ({ocrResult.confidence}%)</div>
                  <div>Vendor: <b>{ocrResult.vendorName}</b></div>
                  <div>Tax ID: <span className="font-mono">{ocrResult.taxId}</span></div>
                  <div>Extracted: <b>${ocrResult.total.toLocaleString()}</b> (VAT 7%: ${ocrResult.vatAmount.toLocaleString()})</div>
                </div>
              )}
            </div>

            {/* App 3: National Bank of Cambodia (NBC) Official Exchange Rates & Multi-Currency FX */}
            <div className="bg-white border border-blue-200 rounded-lg p-5 shadow-2xs space-y-4 text-xs">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <span className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                    <Globe2 className="w-5 h-5" />
                  </span>
                  <div>
                    <h3 className="font-bold text-gray-900 text-sm leading-tight">
                      NBC Official Exchange Rates (1$ = ...)
                    </h3>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-[10px] text-gray-500 font-medium">
                        National Bank of Cambodia
                      </span>
                      <span className="text-[10px] text-gray-300">•</span>
                      <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-0.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        {lastSyncTime}
                      </span>
                    </div>
                  </div>
                </div>
                <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-[10px] font-bold rounded">
                  NBC Official Feed
                </span>
              </div>

              {/* Official NBC Portal Link Card */}
              <div className="p-2.5 bg-gradient-to-r from-blue-50/80 to-indigo-50/80 border border-blue-200 rounded-md">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <Building2 className="w-4 h-4 text-blue-700 shrink-0" />
                    <div className="min-w-0">
                      <div className="text-[11px] font-bold text-blue-900 truncate">
                        ធនាគារជាតិនៃកម្ពុជា (NBC)
                      </div>
                      <div className="text-[10px] text-blue-700 truncate">
                        Official Daily Exchange Rate Portal
                      </div>
                    </div>
                  </div>
                  <a
                    href="https://www.nbc.gov.kh/english/economic_research/exchange_rate.php"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-[10px] font-bold shadow-xs transition shrink-0"
                    title="Open National Bank of Cambodia Exchange Rate Website"
                  >
                    <span>nbc.gov.kh</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              {/* Primary 1$ = ... Currency Rates List */}
              <div className="space-y-1.5 bg-gray-50/80 p-3 rounded-lg border border-gray-200">
                <div className="text-[10px] uppercase font-bold text-gray-500 tracking-wider flex items-center justify-between pb-1 border-b border-gray-200">
                  <div className="flex items-center gap-1.5">
                    <span>Base: 1 US Dollar ($)</span>
                    <span className="text-[9px] bg-orange-100 text-[#d65200] font-bold px-1.5 py-0.5 rounded-full hidden sm:inline-flex items-center gap-1">
                      💡 Double-click to view transactions
                    </span>
                  </div>
                  <span className="text-[#d65200]">Target Equivalent</span>
                </div>

                {/* 1. Cambodian Riel (NBC Flagship) */}
                <div 
                  id="fx-row-khr"
                  onClick={() => setCurrentCurrency('KHR')}
                  onDoubleClick={() => handleCurrencyDoubleClick('KHR')}
                  title="Double-click to open full transaction ledger details converted to Cambodian Riel (KHR)"
                  className={`flex items-center justify-between py-1.5 px-2.5 rounded border transition cursor-pointer select-none group ${
                    currentCurrency === 'KHR' 
                      ? 'bg-amber-100/80 border-[#d65200] shadow-xs' 
                      : 'bg-amber-50/70 border-amber-200 hover:bg-amber-100/90 hover:border-[#d65200] hover:shadow-2xs'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <span className="text-base group-hover:scale-110 transition-transform">🇰🇭</span>
                    <div>
                      <div className="flex items-center gap-1">
                        <span className="font-bold text-gray-900 group-hover:text-[#d65200] transition-colors">1$ =</span>
                        <span className="text-[10px] text-gray-600 font-sans font-medium">Cambodian Riel (រៀល)</span>
                        {currentCurrency === 'KHR' && (
                          <span className="text-[9px] bg-[#d65200] text-white px-1 py-0.2 rounded font-bold">Active</span>
                        )}
                      </div>
                      <div className="text-[9px] text-gray-400 font-medium hidden sm:block">
                        Double-click for transaction details
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold font-mono text-xs text-[#d65200] group-hover:underline">
                      {khrRate.toLocaleString()} ៛ KHR
                    </span>
                    <span className="text-[9px] bg-amber-200/80 text-amber-900 px-1 rounded font-bold">NBC</span>
                  </div>
                </div>

                {/* 2. Thai Baht */}
                <div 
                  id="fx-row-thb"
                  onClick={() => setCurrentCurrency('THB')}
                  onDoubleClick={() => handleCurrencyDoubleClick('THB')}
                  title="Double-click to open full transaction ledger details converted to Thai Baht (THB)"
                  className={`flex items-center justify-between py-1 px-2.5 rounded border transition cursor-pointer select-none group ${
                    currentCurrency === 'THB'
                      ? 'bg-orange-50 border-[#d65200] shadow-xs'
                      : 'border-transparent hover:border-orange-300 hover:bg-orange-50/60'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <span className="text-base group-hover:scale-110 transition-transform">🇹🇭</span>
                    <div className="flex items-center gap-1">
                      <span className="font-semibold text-gray-800 group-hover:text-[#d65200] transition-colors">1$ =</span>
                      <span className="text-[10px] text-gray-600 font-sans">Thai Baht (บาท)</span>
                      {currentCurrency === 'THB' && (
                        <span className="text-[9px] bg-[#d65200] text-white px-1 py-0.2 rounded font-bold">Active</span>
                      )}
                    </div>
                  </div>
                  <span className="font-bold font-mono text-gray-900 group-hover:text-[#d65200] group-hover:underline text-xs">
                    {thbRate.toFixed(2)} ฿ THB
                  </span>
                </div>

                {/* 3. Euro */}
                <div 
                  id="fx-row-eur"
                  onClick={() => setCurrentCurrency('EUR')}
                  onDoubleClick={() => handleCurrencyDoubleClick('EUR')}
                  title="Double-click to open full transaction ledger details converted to Euro (EUR)"
                  className={`flex items-center justify-between py-1 px-2.5 rounded border transition cursor-pointer select-none group ${
                    currentCurrency === 'EUR'
                      ? 'bg-orange-50 border-[#d65200] shadow-xs'
                      : 'border-transparent hover:border-orange-300 hover:bg-orange-50/60'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <span className="text-base group-hover:scale-110 transition-transform">🇪🇺</span>
                    <div className="flex items-center gap-1">
                      <span className="font-semibold text-gray-800 group-hover:text-[#d65200] transition-colors">1$ =</span>
                      <span className="text-[10px] text-gray-600 font-sans">Euro (€)</span>
                      {currentCurrency === 'EUR' && (
                        <span className="text-[9px] bg-[#d65200] text-white px-1 py-0.2 rounded font-bold">Active</span>
                      )}
                    </div>
                  </div>
                  <span className="font-bold font-mono text-gray-900 group-hover:text-[#d65200] group-hover:underline text-xs">
                    {eurRate.toFixed(4)} € EUR
                  </span>
                </div>

                {/* 4. British Pound */}
                <div 
                  id="fx-row-gbp"
                  onClick={() => setCurrentCurrency('GBP')}
                  onDoubleClick={() => handleCurrencyDoubleClick('GBP')}
                  title="Double-click to open full transaction ledger details converted to British Pound (GBP)"
                  className={`flex items-center justify-between py-1 px-2.5 rounded border transition cursor-pointer select-none group ${
                    currentCurrency === 'GBP'
                      ? 'bg-orange-50 border-[#d65200] shadow-xs'
                      : 'border-transparent hover:border-orange-300 hover:bg-orange-50/60'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <span className="text-base group-hover:scale-110 transition-transform">🇬🇧</span>
                    <div className="flex items-center gap-1">
                      <span className="font-semibold text-gray-800 group-hover:text-[#d65200] transition-colors">1$ =</span>
                      <span className="text-[10px] text-gray-600 font-sans">British Pound (£)</span>
                      {currentCurrency === 'GBP' && (
                        <span className="text-[9px] bg-[#d65200] text-white px-1 py-0.2 rounded font-bold">Active</span>
                      )}
                    </div>
                  </div>
                  <span className="font-bold font-mono text-gray-900 group-hover:text-[#d65200] group-hover:underline text-xs">
                    {gbpRate.toFixed(4)} £ GBP
                  </span>
                </div>

                {/* 5. Singapore Dollar */}
                <div 
                  id="fx-row-sgd"
                  onClick={() => setCurrentCurrency('SGD')}
                  onDoubleClick={() => handleCurrencyDoubleClick('SGD')}
                  title="Double-click to open full transaction ledger details converted to Singapore Dollar (SGD)"
                  className={`flex items-center justify-between py-1 px-2.5 rounded border transition cursor-pointer select-none group ${
                    currentCurrency === 'SGD'
                      ? 'bg-orange-50 border-[#d65200] shadow-xs'
                      : 'border-transparent hover:border-orange-300 hover:bg-orange-50/60'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <span className="text-base group-hover:scale-110 transition-transform">🇸🇬</span>
                    <div className="flex items-center gap-1">
                      <span className="font-semibold text-gray-800 group-hover:text-[#d65200] transition-colors">1$ =</span>
                      <span className="text-[10px] text-gray-600 font-sans">Singapore Dollar</span>
                      {currentCurrency === 'SGD' && (
                        <span className="text-[9px] bg-[#d65200] text-white px-1 py-0.2 rounded font-bold">Active</span>
                      )}
                    </div>
                  </div>
                  <span className="font-bold font-mono text-gray-900 group-hover:text-[#d65200] group-hover:underline text-xs">
                    {sgdRate.toFixed(4)} S$ SGD
                  </span>
                </div>

                {/* 6. Chinese Yuan */}
                <div 
                  id="fx-row-cny"
                  onClick={() => setCurrentCurrency('CNY')}
                  onDoubleClick={() => handleCurrencyDoubleClick('CNY')}
                  title="Double-click to open full transaction ledger details converted to Chinese Yuan (CNY)"
                  className={`flex items-center justify-between py-1 px-2.5 rounded border transition cursor-pointer select-none group ${
                    currentCurrency === 'CNY'
                      ? 'bg-orange-50 border-[#d65200] shadow-xs'
                      : 'border-transparent hover:border-orange-300 hover:bg-orange-50/60'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <span className="text-base group-hover:scale-110 transition-transform">🇨🇳</span>
                    <div className="flex items-center gap-1">
                      <span className="font-semibold text-gray-800 group-hover:text-[#d65200] transition-colors">1$ =</span>
                      <span className="text-[10px] text-gray-600 font-sans">Chinese Yuan (人民币)</span>
                      {currentCurrency === 'CNY' && (
                        <span className="text-[9px] bg-[#d65200] text-white px-1 py-0.2 rounded font-bold">Active</span>
                      )}
                    </div>
                  </div>
                  <span className="font-bold font-mono text-gray-900 group-hover:text-[#d65200] group-hover:underline text-xs">
                    {cnyRate.toFixed(4)} ¥ CNY
                  </span>
                </div>

                {/* 7. Japanese Yen */}
                <div 
                  id="fx-row-jpy"
                  onClick={() => setCurrentCurrency('JPY')}
                  onDoubleClick={() => handleCurrencyDoubleClick('JPY')}
                  title="Double-click to open full transaction ledger details converted to Japanese Yen (JPY)"
                  className={`flex items-center justify-between py-1 px-2.5 rounded border transition cursor-pointer select-none group ${
                    currentCurrency === 'JPY'
                      ? 'bg-orange-50 border-[#d65200] shadow-xs'
                      : 'border-transparent hover:border-orange-300 hover:bg-orange-50/60'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <span className="text-base group-hover:scale-110 transition-transform">🇯🇵</span>
                    <div className="flex items-center gap-1">
                      <span className="font-semibold text-gray-800 group-hover:text-[#d65200] transition-colors">1$ =</span>
                      <span className="text-[10px] text-gray-600 font-sans">Japanese Yen (円)</span>
                      {currentCurrency === 'JPY' && (
                        <span className="text-[9px] bg-[#d65200] text-white px-1 py-0.2 rounded font-bold">Active</span>
                      )}
                    </div>
                  </div>
                  <span className="font-bold font-mono text-gray-900 group-hover:text-[#d65200] group-hover:underline text-xs">
                    {jpyRate.toFixed(2)} ¥ JPY
                  </span>
                </div>

                {/* 8. Vietnamese Dong */}
                <div 
                  id="fx-row-vnd"
                  onClick={() => setCurrentCurrency('VND')}
                  onDoubleClick={() => handleCurrencyDoubleClick('VND')}
                  title="Double-click to open full transaction ledger details converted to Vietnamese Dong (VND)"
                  className={`flex items-center justify-between py-1 px-2.5 rounded border transition cursor-pointer select-none group ${
                    currentCurrency === 'VND'
                      ? 'bg-orange-50 border-[#d65200] shadow-xs'
                      : 'border-transparent hover:border-orange-300 hover:bg-orange-50/60'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <span className="text-base group-hover:scale-110 transition-transform">🇻🇳</span>
                    <div className="flex items-center gap-1">
                      <span className="font-semibold text-gray-800 group-hover:text-[#d65200] transition-colors">1$ =</span>
                      <span className="text-[10px] text-gray-600 font-sans">Vietnamese Dong</span>
                      {currentCurrency === 'VND' && (
                        <span className="text-[9px] bg-[#d65200] text-white px-1 py-0.2 rounded font-bold">Active</span>
                      )}
                    </div>
                  </div>
                  <span className="font-bold font-mono text-gray-900 group-hover:text-[#d65200] group-hover:underline text-xs">
                    {vndRate.toLocaleString()} ₫ VND
                  </span>
                </div>
              </div>

              {/* Quick Rate Stepper & NBC Adjuster */}
              <div className="pt-2 border-t border-gray-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-gray-700">
                    Adjust Active NBC Rate (1$ = ... ៛):
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setKhrRate(prev => prev - 5)}
                      className="px-1.5 py-0.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded text-[10px] font-mono font-bold"
                      title="Decrease by 5 Riel"
                    >
                      -5
                    </button>
                    <input
                      type="number"
                      value={khrRate}
                      onChange={(e) => setKhrRate(Number(e.target.value) || 4050)}
                      className="w-16 px-1.5 py-0.5 text-center font-mono font-bold text-xs bg-white border border-gray-300 rounded text-[#d65200]"
                    />
                    <button
                      type="button"
                      onClick={() => setKhrRate(prev => prev + 5)}
                      className="px-1.5 py-0.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded text-[10px] font-mono font-bold"
                      title="Increase by 5 Riel"
                    >
                      +5
                    </button>
                  </div>
                </div>

                {/* Quick Presets for NBC */}
                <div className="flex items-center gap-1.5">
                  <span className="text-[9px] text-gray-400 font-medium">Presets:</span>
                  {[4025, 4050, 4080, 4100].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setKhrRate(preset)}
                      className={`px-1.5 py-0.5 rounded text-[10px] font-mono transition ${
                        khrRate === preset
                          ? 'bg-[#d65200] text-white font-bold'
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                      }`}
                    >
                      1$={preset}៛
                    </button>
                  ))}
                </div>
              </div>

              {/* Interactive Currency Converter Calculator */}
              <div className="p-2.5 bg-blue-50/50 border border-blue-100 rounded-md space-y-1.5">
                <div className="flex items-center justify-between text-[10px] font-bold text-blue-900">
                  <span className="flex items-center gap-1">
                    <ArrowRightLeft className="w-3 h-3 text-blue-600" /> Quick 1$ Converter
                  </span>
                  <span className="font-mono text-blue-700">1$ = {khrRate.toLocaleString()} ៛</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 relative">
                    <span className="absolute inset-y-0 left-0 pl-2 flex items-center text-gray-400 font-bold text-xs">$</span>
                    <input
                      type="number"
                      min="1"
                      value={calcUsdInput}
                      onChange={(e) => setCalcUsdInput(Math.max(0, Number(e.target.value) || 0))}
                      className="w-full pl-5 pr-2 py-1 text-xs bg-white border border-gray-300 rounded font-mono font-bold text-gray-800"
                      placeholder="USD Amount"
                    />
                  </div>
                  <span className="text-gray-400 font-bold">=</span>
                  <div className="flex-1 px-2 py-1 bg-white border border-gray-300 rounded text-xs font-mono font-bold text-[#d65200] text-right truncate">
                    {(calcUsdInput * khrRate).toLocaleString()} ៛
                  </div>
                </div>
              </div>

              {/* Action Buttons: Sync with NBC + Open Link */}
              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSyncNbcRates}
                  disabled={isSyncingRates}
                  className="flex-1 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded font-bold shadow-xs transition flex items-center justify-center gap-1.5 text-xs"
                >
                  {isSyncingRates ? (
                    <>
                      <RefreshCw className="w-3 h-3 animate-spin" />
                      <span>Syncing with NBC...</span>
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-3 h-3" />
                      <span>Sync NBC Daily Rate</span>
                    </>
                  )}
                </button>
                <a
                  href="https://www.nbc.gov.kh/english/economic_research/exchange_rate.php"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300 rounded font-bold transition flex items-center gap-1 text-xs"
                  title="Visit National Bank of Cambodia official exchange rate webpage"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">NBC Web</span>
                </a>
              </div>

              {syncSuccessMsg && (
                <div className="p-2 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded text-[10px] font-semibold flex items-center gap-1.5">
                  <Check className="w-3 h-3 text-emerald-600" />
                  <span>{syncSuccessMsg}</span>
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {/* 3. SUPPORT / HELP TAB */}
      {activeTab === 'support' && (
        <div className="space-y-6">
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-2xs">
            <h1 className="text-xl font-bold text-gray-900">
              Suite Accounting Support & Tax Guide
            </h1>
            <p className="text-xs text-gray-500">
              Reference guide for statutory filings, VAT 7%, and Withholding Tax rules.
            </p>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-2xs space-y-6 text-xs text-gray-700">
            <div>
              <h2 className="text-sm font-bold text-[#d65200]">1. Value Added Tax (VAT 7%)</h2>
              <p className="mt-1 leading-relaxed">
                Businesses registered for VAT calculate Output Tax from sales and deduct Input Tax from legitimate invoices. The net tax is filed monthly.
              </p>
            </div>

            <div>
              <h2 className="text-sm font-bold text-[#d65200]">2. Withholding Tax Rates</h2>
              <ul className="mt-2 space-y-1.5 list-disc list-inside">
                <li><b>1% Withholding:</b> Transportation & Freight services (e.g. coach fleet, inland logistics).</li>
                <li><b>2% Withholding:</b> Advertising, overseas marketing, exhibition booths.</li>
                <li><b>3% Withholding:</b> General corporate services, hotel conference rooms, professional services.</li>
                <li><b>5% Withholding:</b> Rent and lease of real estate or office premises.</li>
              </ul>
            </div>

            <div>
              <h2 className="text-sm font-bold text-[#d65200]">3. Tax Withholding Certificate</h2>
              <p className="mt-1 leading-relaxed">
                When paying a supplier with tax deduction, the payer issues a <b>Withholding Tax Certificate</b> containing the Tax ID, payment date, taxable base, and withheld amount.
              </p>
            </div>
          </div>
        </div>
      )}
      {/* Currency Detailed Transactions Drilldown Modal */}
      {selectedCurrencyModal && (() => {
        const curConfig = FX_RATES[selectedCurrencyModal] || { code: selectedCurrencyModal, symbol: '$', name: selectedCurrencyModal, rateToUSD: 1, usdRate: 1, officialSource: 'Suite Standard' };
        const rateMultiplier = selectedCurrencyModal === 'KHR' 
          ? khrRate 
          : (selectedCurrencyModal === 'THB' ? thbRate : (selectedCurrencyModal === 'EUR' ? eurRate : (selectedCurrencyModal === 'GBP' ? gbpRate : (selectedCurrencyModal === 'SGD' ? sgdRate : (selectedCurrencyModal === 'CNY' ? cnyRate : (selectedCurrencyModal === 'JPY' ? jpyRate : (selectedCurrencyModal === 'VND' ? vndRate : 1)))))));

        const filteredCurrencyTxs = transactions.filter(tx => {
          if (currencyModalFilter !== 'All' && tx.type !== currencyModalFilter) return false;
          if (currencySearchQuery.trim()) {
            const q = currencySearchQuery.toLowerCase();
            return (
              tx.transactionNumber.toLowerCase().includes(q) ||
              tx.entityName.toLowerCase().includes(q) ||
              (tx.memo && tx.memo.toLowerCase().includes(q)) ||
              tx.items.some(i => i.description.toLowerCase().includes(q))
            );
          }
          return true;
        });

        const totalInvoicedUSD = transactions.filter(t => t.type === 'Invoice').reduce((s, t) => s + t.total, 0);
        const totalBillsUSD = transactions.filter(t => t.type === 'Bill').reduce((s, t) => s + t.total, 0);
        const totalNetUSD = totalInvoicedUSD - totalBillsUSD;

        const totalInvoicedConverted = totalInvoicedUSD * rateMultiplier;
        const totalBillsConverted = totalBillsUSD * rateMultiplier;
        const totalNetConverted = totalNetUSD * rateMultiplier;

        const getFlag = (code: string) => {
          switch(code) {
            case 'KHR': return '🇰🇭';
            case 'THB': return '🇹🇭';
            case 'EUR': return '🇪🇺';
            case 'GBP': return '🇬🇧';
            case 'SGD': return '🇸🇬';
            case 'CNY': return '🇨🇳';
            case 'JPY': return '🇯🇵';
            case 'VND': return '🇻🇳';
            default: return '💵';
          }
        };

        return (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-in fade-in duration-200">
            <div className="bg-white rounded-xl shadow-2xl border border-gray-200 max-w-5xl w-full max-h-[92vh] flex flex-col overflow-hidden my-auto">
              
              {/* Modal Header */}
              <div className="px-5 py-4 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white flex items-center justify-between border-b border-gray-700">
                <div className="flex items-center gap-3">
                  <span className="text-2xl p-1.5 bg-white/10 rounded-lg">{getFlag(selectedCurrencyModal)}</span>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-base font-bold text-white tracking-tight">
                        {curConfig.name} ({curConfig.code}) Transactions Ledger
                      </h2>
                      <span className="text-[10px] font-bold px-2 py-0.5 bg-[#d65200] text-white rounded-full font-mono">
                        1 USD = {rateMultiplier.toLocaleString()} {curConfig.symbol} {curConfig.code}
                      </span>
                    </div>
                    <p className="text-xs text-gray-300 mt-0.5">
                      Converted accounting transaction ledger & details at active foreign exchange rate.
                    </p>
                  </div>
                </div>
                
                <button
                  onClick={() => setSelectedCurrencyModal(null)}
                  className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition"
                  title="Close Dialog"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Converted KPI Summary Cards */}
              <div className="p-4 bg-gray-50/90 border-b border-gray-200 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 bg-white border border-gray-200 rounded-lg shadow-2xs">
                  <div className="text-[11px] font-semibold text-gray-500 flex items-center justify-between">
                    <span>Total Sales Invoiced</span>
                    <ArrowDownRight className="w-3.5 h-3.5 text-blue-600" />
                  </div>
                  <div className="mt-1 text-base font-bold text-blue-700 font-mono">
                    {formatCurrency(totalInvoicedUSD, selectedCurrencyModal)}
                  </div>
                  <div className="text-[10px] text-gray-400 font-mono">
                    Base: ${totalInvoicedUSD.toLocaleString()} USD
                  </div>
                </div>

                <div className="p-3 bg-white border border-gray-200 rounded-lg shadow-2xs">
                  <div className="text-[11px] font-semibold text-gray-500 flex items-center justify-between">
                    <span>Total Expenses & Bills</span>
                    <ArrowUpRight className="w-3.5 h-3.5 text-rose-600" />
                  </div>
                  <div className="mt-1 text-base font-bold text-rose-700 font-mono">
                    {formatCurrency(totalBillsUSD, selectedCurrencyModal)}
                  </div>
                  <div className="text-[10px] text-gray-400 font-mono">
                    Base: ${totalBillsUSD.toLocaleString()} USD
                  </div>
                </div>

                <div className="p-3 bg-white border border-gray-200 rounded-lg shadow-2xs">
                  <div className="text-[11px] font-semibold text-gray-500 flex items-center justify-between">
                    <span>Net Operating Position</span>
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                  </div>
                  <div className="mt-1 text-base font-bold text-emerald-700 font-mono">
                    {formatCurrency(totalNetUSD, selectedCurrencyModal)}
                  </div>
                  <div className="text-[10px] text-gray-400 font-mono">
                    Base: ${totalNetUSD.toLocaleString()} USD
                  </div>
                </div>
              </div>

              {/* Filters & Search Toolbar */}
              <div className="px-4 py-3 bg-white border-b border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-2.5">
                <div className="flex items-center gap-1 w-full sm:w-auto overflow-x-auto">
                  {(['All', 'Invoice', 'Bill', 'Journal'] as const).map(type => (
                    <button
                      key={type}
                      onClick={() => setCurrencyModalFilter(type)}
                      className={`px-2.5 py-1 text-xs font-semibold rounded-md transition ${
                        currencyModalFilter === type
                          ? 'bg-[#d65200] text-white shadow-xs'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {type === 'All' ? `All (${transactions.length})` : `${type}s (${transactions.filter(t => t.type === type).length})`}
                    </button>
                  ))}
                </div>

                <div className="relative w-full sm:w-64">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={currencySearchQuery}
                    onChange={(e) => setCurrencySearchQuery(e.target.value)}
                    placeholder="Search tx #, customer, memo..."
                    className="w-full pl-8 pr-3 py-1 text-xs bg-gray-50 border border-gray-300 rounded-md focus:bg-white focus:border-[#d65200] outline-none"
                  />
                  {currencySearchQuery && (
                    <button 
                      onClick={() => setCurrencySearchQuery('')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs"
                    >
                      ×
                    </button>
                  )}
                </div>
              </div>

              {/* Transactions Table */}
              <div className="flex-1 overflow-y-auto min-h-[300px]">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-[#f8f9fa] border-b border-gray-200 text-[11px] font-bold text-gray-600 uppercase tracking-wider sticky top-0 z-10 shadow-2xs">
                    <tr>
                      <th className="py-2.5 px-3">Date</th>
                      <th className="py-2.5 px-3">Tx Number</th>
                      <th className="py-2.5 px-3">Type</th>
                      <th className="py-2.5 px-3">Entity / Customer / Vendor</th>
                      <th className="py-2.5 px-3 text-right">Base USD</th>
                      <th className="py-2.5 px-3 text-right font-bold text-[#d65200]">
                        Converted ({selectedCurrencyModal})
                      </th>
                      <th className="py-2.5 px-3 text-center">Status</th>
                      <th className="py-2.5 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredCurrencyTxs.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="text-center py-10 text-gray-400 text-xs">
                          No transactions found matching the filter.
                        </td>
                      </tr>
                    ) : (
                      filteredCurrencyTxs.map(tx => (
                        <tr 
                          key={tx.id}
                          onDoubleClick={() => setPreviewDoc({ type: tx.type as any, data: tx })}
                          className="hover:bg-orange-50/60 transition cursor-pointer select-none group"
                          title="Double-click to open full transaction document details"
                        >
                          <td className="py-2.5 px-3 text-gray-600 font-mono text-[11px] whitespace-nowrap">
                            {tx.date}
                          </td>
                          <td className="py-2.5 px-3 font-semibold text-[#d65200] font-mono whitespace-nowrap group-hover:underline">
                            {tx.transactionNumber}
                          </td>
                          <td className="py-2.5 px-3 whitespace-nowrap">
                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              tx.type === 'Invoice' ? 'bg-blue-100 text-blue-700' :
                              tx.type === 'Bill' ? 'bg-amber-100 text-amber-700' :
                              tx.type === 'Payment' ? 'bg-emerald-100 text-emerald-700' :
                              'bg-purple-100 text-purple-700'
                            }`}>
                              {tx.type}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 font-medium text-gray-800 max-w-[200px] truncate">
                            {tx.entityName}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono text-gray-600 whitespace-nowrap">
                            ${tx.total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono font-bold text-gray-900 whitespace-nowrap group-hover:text-[#d65200]">
                            {formatCurrency(tx.total, selectedCurrencyModal)}
                          </td>
                          <td className="py-2.5 px-3 text-center whitespace-nowrap">
                            <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                              tx.status === 'Paid' ? 'bg-emerald-100 text-emerald-700' :
                              tx.status === 'Open' ? 'bg-blue-100 text-blue-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {tx.status}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-right whitespace-nowrap">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setPreviewDoc({ type: tx.type as any, data: tx });
                              }}
                              className="px-2 py-1 bg-gray-100 hover:bg-orange-100 hover:text-[#d65200] text-gray-700 rounded text-[11px] font-semibold transition inline-flex items-center gap-1 shadow-2xs"
                              title="Inspect full document"
                            >
                              <Eye className="w-3 h-3" />
                              <span>View</span>
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Modal Footer */}
              <div className="px-5 py-3.5 bg-gray-50 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="text-xs text-gray-500 flex items-center gap-2">
                  <span className="font-semibold text-gray-700">{filteredCurrencyTxs.length} Transactions</span>
                  <span>•</span>
                  <span>Double-click any row to view document voucher</span>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => {
                      setCurrentCurrency(selectedCurrencyModal);
                      setActiveTab('transactions');
                      setSubView('all');
                      setSelectedCurrencyModal(null);
                    }}
                    className="flex-1 sm:flex-none px-4 py-2 bg-[#d65200] hover:bg-[#b84300] text-white rounded-lg text-xs font-bold transition shadow-xs flex items-center justify-center gap-1.5"
                  >
                    <span>Open in Full Ledger ({selectedCurrencyModal})</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setSelectedCurrencyModal(null)}
                    className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg text-xs font-semibold transition"
                  >
                    Close
                  </button>
                </div>
              </div>

            </div>
          </div>
        );
      })()}
    </div>
  );
};
