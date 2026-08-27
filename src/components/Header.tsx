import React, { useState, useRef, useEffect } from 'react';
import { 
  Search, 
  Plus, 
  HelpCircle, 
  MessageSquare, 
  History, 
  Star, 
  Home, 
  ChevronDown, 
  FileText, 
  Receipt, 
  BookOpen, 
  BarChart3, 
  Building2, 
  Settings, 
  Truck, 
  Layers, 
  ShieldCheck, 
  Sparkles,
  Calendar,
  CheckCircle,
  Globe2,
  DollarSign,
  UserPlus,
  Users,
  Check,
  Shield,
  UserCheck,
  Lock,
  Unlock,
  Key,
  Sliders,
  LogOut,
  FolderTree,
  Edit3,
  UserCog,
  Palette,
  Save,
  X
} from 'lucide-react';
import { useAccounting, NavigationTab, FX_RATES } from '../context/AccountingContext';
import { CurrencyCode, UserProfile } from '../types';

export const Header: React.FC = () => {
  const { 
    activeTab, 
    setActiveTab, 
    subView,
    setSubView,
    searchQuery, 
    setSearchQuery, 
    accounts,
    currentCurrency, 
    setCurrentCurrency,
    setIsQuickInvoiceOpen,
    setIsQuickJournalOpen,
    setIsQuickWhtOpen,
    companyProfile,
    updateCompanyProfile,
    setIsCompanySetupModalOpen,
    setIsEntityModalOpen,
    users,
    currentUser,
    setCurrentUser,
    updateUser,
    setIsUserModalOpen,
    setIsAccessControlModalOpen,
    setSelectedUserForEdit,
    hasPermission,
    setIsPasswordResetModalOpen,
    logout
  } = useAccounting();

  const [activeDropdown, setActiveDropdown] = useState<NavigationTab | null>(null);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [isCurrencyDropdownOpen, setIsCurrencyDropdownOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isSelfProfileModalOpen, setIsSelfProfileModalOpen] = useState(false);
  const [selfName, setSelfName] = useState(currentUser?.name || '');
  const [selfEmail, setSelfEmail] = useState(currentUser?.email || '');
  const [selfDepartment, setSelfDepartment] = useState(currentUser?.department || '');
  const [selfRole, setSelfRole] = useState(currentUser?.role || 'System Administrator');
  const [selfColor, setSelfColor] = useState(currentUser?.avatarColor || 'bg-[#d65200]');
  const [selfStatus, setSelfStatus] = useState<'Online' | 'Away' | 'Busy'>(currentUser?.status || 'Online');
  const [selfInitials, setSelfInitials] = useState(currentUser?.initials || 'AD');

  // Keep self profile state in sync when currentUser changes
  useEffect(() => {
    if (currentUser) {
      setSelfName(currentUser.name);
      setSelfEmail(currentUser.email);
      setSelfDepartment(currentUser.department);
      setSelfRole(currentUser.role);
      setSelfColor(currentUser.avatarColor || 'bg-[#d65200]');
      setSelfStatus(currentUser.status || 'Online');
      setSelfInitials(currentUser.initials || 'AD');
    }
  }, [currentUser]);

  const handleSaveSelfProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    const initials = selfName.trim().split(' ').length >= 2 
      ? `${selfName.trim().split(' ')[0][0]}${selfName.trim().split(' ')[1][0]}`.toUpperCase()
      : (selfInitials || selfName.substring(0, 2).toUpperCase() || 'US');

    updateUser(currentUser.id, {
      name: selfName.trim(),
      email: selfEmail.trim(),
      department: selfDepartment.trim(),
      role: selfRole,
      avatarColor: selfColor,
      status: selfStatus,
      initials
    });

    setIsSelfProfileModalOpen(false);
  };
  const dropdownRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
        setIsQuickAddOpen(false);
        setIsCurrencyDropdownOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navMenuItems: { id: NavigationTab; label: string; icon?: any; badge?: string; subItems?: { label: string; subView: string; action?: () => void }[] }[] = [
    {
      id: 'activities',
      label: 'Activities',
      subItems: [
        { label: 'Tasks & Financial Deadlines', subView: 'tasks' },
        { label: 'System Audit Trail', subView: 'audit' },
        { label: 'Accounting Approvals Queue', subView: 'approvals' },
      ]
    },
    {
      id: 'tax',
      label: 'Tax Reports',
      badge: 'Tax Compliance',
      subItems: [
        { label: 'Form P.P. 30 (VAT 7% Return)', subView: 'pp30' },
        { label: 'Form P.N.D. 53 (Corporate WHT)', subView: 'pnd53' },
        { label: 'Form P.N.D. 3 (Individual WHT)', subView: 'pnd3' },
        { label: 'WHT Section 50 Bis Certificates', subView: '50tawi' },
        { label: 'Input Tax Report (VAT Input Register)', subView: 'input_tax' },
        { label: 'Output Tax Report (VAT Output Register)', subView: 'output_tax' },
        { label: 'Tax Control & Jurisdiction % Rate Editor', subView: 'tax_control' },
      ]
    },
    {
      id: 'transactions',
      label: 'Transactions',
      subItems: [
        { label: 'Expenses & Items Sublist Platform', subView: 'suite_platform' },
        { label: 'Payable to Vendors', subView: 'payable_vendors' },
        { label: 'Bank', subView: 'bank' },
        { label: 'Sale', subView: 'sale' },
        { label: 'General Journal Entries', subView: 'journal_entries' },
      ]
    },
    {
      id: 'lists',
      label: 'Lists',
      subItems: [
        { label: 'Chart of Accounts (COA)', subView: 'coa' },
        { label: 'Customers / B2B Tour Agents', subView: 'customers' },
        { label: 'Vendors / Hotels & Transports', subView: 'vendors' },
        { label: 'Tax Codes & VAT Rates', subView: 'tax_codes' },
      ]
    },
    {
      id: 'reports',
      label: 'Reports',
      subItems: [
        { label: 'Balance Sheet (Statement of Financial Position)', subView: 'balance_sheet' },
        { label: 'Income Statement / P&L (Profit & Loss)', subView: 'pnl' },
        { label: 'Trial Balance (General Ledger Balances)', subView: 'trial_balance' },
        { label: 'Statement of Cash Flows (Cash Flow Statement)', subView: 'cash_flow' },
        { label: 'General Ledger Detail Report', subView: 'gl_detail' },
        { label: 'AR & AP Aging Analysis', subView: 'aging' },
      ]
    },
    {
      id: 'analytics',
      label: 'Analytics',
      subItems: [
        { label: 'Executive Financial KPIs', subView: 'kpis' },
        { label: 'Profitability by Tour Destination', subView: 'destinations' },
        { label: 'Cost Structure & Margin Trends', subView: 'margins' },
      ]
    },
    {
      id: 'documents',
      label: 'Invoice Form',
      subItems: [
        { label: 'Official Cambodian Invoice Form (ទម្រង់វិក្កយបត្រ)', subView: 'invoice_form' },
        { label: 'Tax Invoice Repository (Invoices & Receipts)', subView: 'tax_invoices' },
        { label: 'Withholding Tax Slips (WHT Certificates)', subView: 'wht_docs' },
        { label: 'Payment Vouchers & Receipts', subView: 'receipts' },
      ]
    },
    {
      id: 'fixed_assets',
      label: 'Fixed Assets',
      subItems: [
        { label: 'Fixed Asset Register', subView: 'register' },
        { label: 'Monthly Depreciation Schedule', subView: 'depreciation' },
        { label: 'Asset Acquisitions & Disposals', subView: 'acquisitions' },
      ]
    },
    {
      id: 'suiteapps',
      label: 'SuiteApps',
      badge: 'AI Active',
      subItems: [
        { label: 'e-Tax Invoice & e-Receipt Sync', subView: 'etax' },
        { label: 'AI OCR Invoice Reader & Auto-Cat', subView: 'ocr' },
        { label: 'Multi-Currency Real-time FX Rates', subView: 'fx' },
      ]
    },
    {
      id: 'setup',
      label: 'Setup',
      subItems: [
        { label: `Company Setup: ${companyProfile.name}`, subView: 'company', action: () => setIsCompanySetupModalOpen(true) },
        { label: 'Fiscal Year & Accounting Periods', subView: 'periods' },
        { label: 'Multi-subsidiary & Operating Entities', subView: 'subsidiaries', action: () => setIsEntityModalOpen(true) },
      ]
    },
    {
      id: 'support',
      label: 'Support',
      subItems: [
        { label: 'System Accounting Guidelines', subView: 'guide' },
        { label: 'Statutory Revenue Code Helpdesk', subView: 'revenue_code' },
      ]
    }
  ];

  const handleNavClick = (tabId: NavigationTab, defaultSubView = 'overview') => {
    setActiveTab(tabId);
    if (tabId === 'transactions' && defaultSubView === 'overview') {
      setSubView('payable_vendors');
    } else {
      setSubView(defaultSubView);
    }
    setActiveDropdown(null);
  };

  return (
    <header className="w-full bg-white shadow-sm border-b border-gray-200 select-none z-40 sticky top-0" ref={dropdownRef}>
      {/* Top Bar: Brand, Search, Tools, Profile */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#f8f9fa] border-b border-gray-200">
        
        {/* Left: Suite Brand Identity */}
        <div className="flex items-center gap-4">
          <div 
            className="flex items-center gap-3 cursor-pointer group relative"
            onClick={() => handleNavClick('dashboard')}
            title={currentUser?.isAdmin ? "Click logo to go to dashboard or click Edit Branding" : "Go to Dashboard"}
          >
            {/* Suite Text Logo */}
            <div className="flex flex-col leading-tight">
              <span className="text-[10px] tracking-wider font-semibold text-gray-500 uppercase">
                {companyProfile.systemEdition || 'Enterprise'}
              </span>
              <span className="text-lg font-bold text-gray-900 tracking-tight flex items-center">
                {companyProfile.shortName || 'Suite'}
              </span>
            </div>

            <div className="h-6 w-px bg-gray-300 mx-1"></div>

            {/* Suite Financial ERP Custom Identity */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-md bg-[#e65c00] flex items-center justify-center text-white shadow-xs font-black text-sm uppercase">
                {companyProfile.logoInitial || (companyProfile.shortName ? companyProfile.shortName.charAt(0).toUpperCase() : 'S')}
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-black text-[#d65200] tracking-tight uppercase font-sans leading-none">
                  {companyProfile.shortName || 'Suite'}
                </span>
                <span className="text-[9px] font-medium text-gray-500 uppercase tracking-widest leading-none mt-0.5">
                  {companyProfile.systemSubtitle || 'Accounting & ERP'}
                </span>
              </div>
            </div>

            {/* Admin Quick Edit Branding Button */}
            {currentUser?.isAdmin && (
              <button
                id="header-edit-branding-btn"
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsCompanySetupModalOpen(true);
                }}
                className="opacity-0 group-hover:opacity-100 transition-opacity ml-1 px-1.5 py-0.5 rounded bg-orange-100 hover:bg-orange-200 text-[#d65200] text-[10px] font-bold flex items-center gap-1 border border-orange-300 shadow-2xs"
                title="Admin: Edit Header Title, Monogram & Company Details"
              >
                <Edit3 className="w-3 h-3" />
                <span className="hidden sm:inline">Edit Branding</span>
              </button>
            )}
          </div>
        </div>

        {/* Center: Omni-Search Bar */}
        <div className="flex-1 max-w-xl mx-6">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              id="netsuite-global-search"
              type="text"
              placeholder="Search Invoices, Accounts, Tax Forms, Customers, Vouchers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-1.5 text-xs bg-white border border-gray-300 rounded shadow-inner text-gray-800 placeholder-gray-400 focus:outline-hidden focus:ring-1 focus:ring-[#e65c00] focus:border-[#e65c00] transition"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-xs text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            )}

            {/* Quick Omni-Search Dropdown */}
            {searchQuery.trim().length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-2xl z-50 text-xs divide-y divide-gray-100 max-h-80 overflow-y-auto animate-in fade-in-50">
                {/* Navigation Shortcuts matching query */}
                {('chart of accounts'.includes(searchQuery.toLowerCase()) || 'coa'.includes(searchQuery.toLowerCase()) || 'account'.includes(searchQuery.toLowerCase())) && (
                  <button
                    onClick={() => {
                      handleNavClick('coa', 'coa');
                      setSearchQuery('');
                    }}
                    className="w-full px-3 py-2 text-left hover:bg-orange-50 flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-2">
                      <FolderTree className="w-4 h-4 text-[#d65200]" />
                      <div>
                        <span className="font-bold text-gray-900 group-hover:text-[#d65200]">Chart of Accounts (COA)</span>
                        <span className="text-[10px] text-gray-500 block">General Ledger Accounts, Balances & Hierarchy</span>
                      </div>
                    </div>
                    <span className="text-[10px] bg-orange-100 text-[#d65200] font-bold px-1.5 py-0.5 rounded">Lists &rarr; COA</span>
                  </button>
                )}

                {/* Filter Accounts */}
                {accounts.filter(a => 
                  a.number.toLowerCase().includes(searchQuery.toLowerCase()) || 
                  a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  (a.thaiName && a.thaiName.toLowerCase().includes(searchQuery.toLowerCase()))
                ).slice(0, 5).map(acc => (
                  <button
                    key={acc.id}
                    onClick={() => {
                      handleNavClick('coa', 'coa');
                      setSearchQuery('');
                    }}
                    className="w-full px-3 py-2 text-left hover:bg-orange-50 flex items-center justify-between text-xs group"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded group-hover:bg-orange-200 group-hover:text-orange-900">
                        {acc.number}
                      </span>
                      <div>
                        <span className="font-semibold text-gray-900">{acc.name}</span>
                        {acc.thaiName && <span className="text-[10px] text-gray-400 block">{acc.thaiName}</span>}
                      </div>
                    </div>
                    <span className="text-[11px] font-mono text-gray-600 font-bold">{acc.category}</span>
                  </button>
                ))}

                {/* Additional modules matching query */}
                {'balance sheet'.includes(searchQuery.toLowerCase()) && (
                  <button
                    onClick={() => { handleNavClick('reports', 'balance_sheet'); setSearchQuery(''); }}
                    className="w-full px-3 py-2 text-left hover:bg-orange-50 flex items-center justify-between text-xs text-gray-800"
                  >
                    <span className="font-bold">Balance Sheet (Financial Statement)</span>
                    <span className="text-[10px] text-gray-400">Reports</span>
                  </button>
                )}

                {'income statement profit loss pnl'.includes(searchQuery.toLowerCase()) && (
                  <button
                    onClick={() => { handleNavClick('reports', 'pnl'); setSearchQuery(''); }}
                    className="w-full px-3 py-2 text-left hover:bg-orange-50 flex items-center justify-between text-xs text-gray-800"
                  >
                    <span className="font-bold">Income Statement / P&L</span>
                    <span className="text-[10px] text-gray-400">Reports</span>
                  </button>
                )}

                {'vat pp30 tax'.includes(searchQuery.toLowerCase()) && (
                  <button
                    onClick={() => { handleNavClick('tax', 'pp30'); setSearchQuery(''); }}
                    className="w-full px-3 py-2 text-left hover:bg-orange-50 flex items-center justify-between text-xs text-gray-800"
                  >
                    <span className="font-bold">Form P.P. 30 (VAT 7% Return)</span>
                    <span className="text-[10px] text-gray-400">Tax Reports</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Tools: Currency Selector, Quick Add (+), Help, User Role */}
        <div className="flex items-center gap-3">
          
            {/* Currency Toggle with 1$ = ... rates */}
            <div className="relative">
              <button
                onClick={() => setIsCurrencyDropdownOpen(!isCurrencyDropdownOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 shadow-2xs"
                title="Active Currency & NBC Exchange Rates"
              >
                <Globe2 className="w-3.5 h-3.5 text-gray-500" />
                <span>{currentCurrency} ({FX_RATES[currentCurrency].symbol})</span>
                <ChevronDown className="w-3 h-3 text-gray-400" />
              </button>

              {isCurrencyDropdownOpen && (
                <div className="absolute right-0 mt-1 w-64 bg-white border border-gray-200 rounded-md shadow-xl py-1 z-50 text-xs animate-in fade-in-50">
                  <div className="px-3 py-1.5 text-[10px] uppercase font-bold text-gray-500 border-b border-gray-100 flex items-center justify-between">
                    <span>Select Ledger Currency</span>
                    <span className="text-[#d65200]">1$ = ...</span>
                  </div>
                  <div className="max-h-64 overflow-y-auto divide-y divide-gray-50">
                    {(Object.keys(FX_RATES) as CurrencyCode[]).map((curr) => {
                      const item = FX_RATES[curr];
                      const rateDisplay = curr === 'USD' 
                        ? 'Base ($1.00)' 
                        : curr === 'KHR' 
                        ? `1$ = ${item.usdRate.toLocaleString()} ៛` 
                        : curr === 'VND' 
                        ? `1$ = ${item.usdRate.toLocaleString()} ₫`
                        : `1$ = ${item.usdRate.toFixed(curr === 'JPY' || curr === 'THB' ? 2 : 4)} ${item.symbol}`;

                      return (
                        <button
                          key={curr}
                          onClick={() => {
                            setCurrentCurrency(curr);
                            setIsCurrencyDropdownOpen(false);
                          }}
                          className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-orange-50 transition ${currentCurrency === curr ? 'bg-orange-100/60 font-semibold text-[#d65200]' : 'text-gray-700'}`}
                        >
                          <div className="flex flex-col">
                            <span className="font-semibold text-xs text-gray-900">{item.name}</span>
                            <span className="text-[10px] text-gray-500">{curr} ({item.symbol})</span>
                          </div>
                          <div className="text-right font-mono text-[11px] font-bold text-[#d65200]">
                            {rateDisplay}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* NBC Official Reference Footer Link */}
                  <div className="p-2 border-t border-gray-100 bg-blue-50/60">
                    <a
                      href="https://www.nbc.gov.kh/english/economic_research/exchange_rate.php"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between text-[10px] text-blue-700 hover:text-blue-900 font-bold"
                    >
                      <span className="flex items-center gap-1">
                        <span>🇰🇭 NBC Daily Rates</span>
                      </span>
                      <span className="flex items-center gap-0.5">
                        nbc.gov.kh ↗
                      </span>
                    </a>
                  </div>
                </div>
              )}
            </div>

          {/* Quick Create (+) */}
          <div className="relative">
            <button
              id="header-quick-add-btn"
              onClick={() => setIsQuickAddOpen(!isQuickAddOpen)}
              title="Create New Record"
              className="w-7 h-7 flex items-center justify-center rounded border border-gray-300 bg-white text-gray-700 hover:bg-gray-100 shadow-2xs transition"
            >
              <Plus className="w-4 h-4 text-[#e65c00]" />
            </button>

            {isQuickAddOpen && (
              <div className="absolute right-0 mt-1 w-56 bg-white border border-gray-200 rounded-md shadow-xl py-1 z-50 text-xs">
                <div className="px-3 py-1.5 font-bold text-gray-500 text-[10px] uppercase border-b border-gray-100">
                  Quick Create
                </div>
                <button
                  onClick={() => { setActiveTab('documents'); setSubView('invoice_form'); setIsQuickAddOpen(false); }}
                  className="w-full text-left px-3 py-2 flex items-center gap-2 hover:bg-orange-50 text-gray-700 hover:text-[#d65200] font-semibold text-emerald-700"
                >
                  <FileText className="w-4 h-4 text-emerald-600" />
                  <span>Official Invoice Form (ទម្រង់វិក្កយបត្រ)</span>
                </button>
                <button
                  onClick={() => { setIsQuickInvoiceOpen(true); setIsQuickAddOpen(false); }}
                  className="w-full text-left px-3 py-2 flex items-center gap-2 hover:bg-orange-50 text-gray-700 hover:text-[#d65200]"
                >
                  <FileText className="w-4 h-4 text-orange-600" />
                  <span>New Sales Invoice (AR)</span>
                </button>
                <button
                  onClick={() => { setIsQuickJournalOpen(true); setIsQuickAddOpen(false); }}
                  className="w-full text-left px-3 py-2 flex items-center gap-2 hover:bg-orange-50 text-gray-700 hover:text-[#d65200]"
                >
                  <BookOpen className="w-4 h-4 text-blue-600" />
                  <span>New Journal Entry (GL)</span>
                </button>
                <button
                  onClick={() => { setIsQuickWhtOpen(true); setIsQuickAddOpen(false); }}
                  className="w-full text-left px-3 py-2 flex items-center gap-2 hover:bg-orange-50 text-gray-700 hover:text-[#d65200]"
                >
                  <Receipt className="w-4 h-4 text-emerald-600" />
                  <span>New WHT Certificate (50 Tawi)</span>
                </button>
              </div>
            )}
          </div>


          {/* Help & Documentation */}
          <button 
            onClick={() => handleNavClick('support', 'guide')}
            className="flex items-center gap-1 text-xs text-gray-600 hover:text-gray-900 px-2 py-1 rounded hover:bg-gray-100"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Help</span>
          </button>

          {/* User & Subsidiary Profile (Multi-User Switcher & Admin Control) */}
          <div className="relative" ref={userMenuRef}>
            <button
              id="header-user-profile-btn"
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center gap-2.5 pl-3 pr-2.5 py-1.5 border-l border-gray-300 text-xs hover:bg-orange-50/90 active:bg-orange-100/80 rounded-lg transition-all duration-150 text-left cursor-pointer group shadow-2xs hover:shadow-xs focus:outline-hidden focus:ring-2 focus:ring-orange-500/40 bg-white/90"
              title={currentUser?.isAdmin ? `Administrator (${currentUser?.email || 'soeuysiemreap@gmail.com'}) - Click to manage users, reset password or switch profile` : `${currentUser?.name} - Click to switch profile`}
            >
              <div className={`w-8 h-8 rounded-full ${currentUser?.avatarColor || 'bg-[#d65200]'} text-white font-bold flex items-center justify-center text-xs shadow-xs relative ring-2 ring-white`}>
                {currentUser?.initials || 'AD'}
                <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white ${currentUser?.status === 'Online' ? 'bg-emerald-500' : currentUser?.status === 'Away' ? 'bg-amber-400' : 'bg-rose-500'}`} />
              </div>
              <div className="flex flex-col text-left leading-tight">
                <span className="font-bold text-slate-900 flex items-center gap-1.5 group-hover:text-[#d65200] tracking-tight text-[12.5px] transition-colors duration-150">
                  <span className="truncate max-w-[130px] font-semibold">{currentUser?.name || 'Administrator'}</span>
                  {currentUser?.isAdmin && (
                    <span className="text-[11px] text-amber-500 drop-shadow-xs select-none" title="System Administrator">👑</span>
                  )}
                  <ChevronDown className="w-3.5 h-3.5 text-gray-400 group-hover:text-[#d65200] group-hover:translate-y-0.5 transition-all duration-150 shrink-0" />
                </span>
                <span className="text-[10px] text-gray-500 flex items-center gap-1 mt-0.5">
                  {currentUser?.isAdmin ? (
                    <span className="text-amber-900 font-bold bg-amber-100/90 px-1.5 py-0.2 rounded border border-amber-300/70 text-[9.5px]">
                      Admin Access
                    </span>
                  ) : (
                    <span className="text-gray-600 font-medium">{currentUser?.role || 'Staff User'}</span>
                  )}
                </span>
              </div>
            </button>

            {/* Multi-User Switcher & Management Popover */}
            {isUserMenuOpen && (
              <div className="absolute right-0 mt-1.5 w-84 bg-white border border-gray-200 rounded-lg shadow-2xl py-2 z-50 text-xs divide-y divide-gray-100 animate-in fade-in zoom-in-95 duration-100">
                
                {/* Active Logged-In User Profile Card */}
                <div className={`px-3.5 py-2.5 ${currentUser?.isAdmin ? 'bg-gradient-to-b from-amber-50/80 to-white' : 'bg-gradient-to-b from-blue-50/60 to-white'}`}>
                  <div className="flex items-center justify-between pb-1">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-gray-500 flex items-center gap-1">
                      {currentUser?.isAdmin ? (
                        <>
                          <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                          <span className="text-amber-900">Administrator Authority</span>
                        </>
                      ) : (
                        <>
                          <Lock className="w-3 h-3 text-blue-600" />
                          <span className="text-blue-900">Limited Access Account</span>
                        </>
                      )}
                    </span>
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-semibold bg-emerald-100 text-emerald-800">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      {currentUser?.status || 'Online'}
                    </span>
                  </div>

                  <div className="flex items-start gap-2.5 mt-1.5">
                    <div className={`w-9 h-9 rounded-full ${currentUser?.avatarColor || 'bg-[#d65200]'} text-white font-bold flex items-center justify-center text-sm shadow-xs shrink-0`}>
                      {currentUser?.initials || 'SP'}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-gray-900 text-xs truncate flex items-center gap-1">
                          {currentUser?.name}
                          {currentUser?.isAdmin && <span className="text-amber-600" title="System Administrator">👑</span>}
                        </h4>
                        <button
                          type="button"
                          onClick={() => {
                            setIsSelfProfileModalOpen(true);
                            setIsUserMenuOpen(false);
                          }}
                          className="px-1.5 py-0.5 rounded bg-white hover:bg-orange-50 text-[#d65200] border border-orange-200 text-[10px] font-bold flex items-center gap-1 shadow-2xs transition"
                          title="Edit Your Display Name, Email & Avatar"
                        >
                          <Edit3 className="w-2.5 h-2.5" />
                          <span>Edit</span>
                        </button>
                      </div>
                      <p className="text-[10px] text-gray-500 truncate font-mono">{currentUser?.email}</p>
                      <div className="mt-1 flex items-center gap-1.5 flex-wrap">
                        <span className={`px-1.5 py-0.5 rounded font-bold text-[9px] ${
                          currentUser?.isAdmin ? 'bg-amber-100 text-amber-900' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {currentUser?.role}
                        </span>
                        <span className="text-[10px] text-gray-400">•</span>
                        <span className="text-[10px] text-gray-600 truncate">{currentUser?.department}</span>
                      </div>
                    </div>
                  </div>

                  {/* Permissions Chips */}
                  {currentUser?.permissions && currentUser.permissions.length > 0 && (
                    <div className="mt-2.5 pt-2 border-t border-gray-100">
                      <div className="text-[9px] font-semibold text-gray-500 uppercase mb-1 flex items-center justify-between">
                        <span>{currentUser.isAdmin ? 'Full Granted Authorities:' : 'Permitted Access Scope:'}</span>
                        {currentUser.isAdmin && (
                          <span className="text-amber-700 font-bold text-[9px]">Unrestricted</span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {currentUser.permissions.slice(0, 3).map((perm, idx) => (
                          <span key={idx} className="text-[9px] px-1.5 py-0.5 bg-gray-100 text-gray-700 rounded font-medium">
                            ✓ {perm}
                          </span>
                        ))}
                        {currentUser.permissions.length > 3 && (
                          <span className="text-[9px] px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded font-medium">
                            +{currentUser.permissions.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Team Members List (Multi-User Switcher) */}
                <div className="py-2">
                  <div className="px-3.5 py-1 text-[10px] font-bold uppercase tracking-wider text-gray-400 flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3 text-gray-500" />
                      Switch User Profile ({users.length})
                    </span>
                    <span className="text-[9px] text-gray-400 font-normal">Click to switch</span>
                  </div>

                  <div className="max-h-48 overflow-y-auto divide-y divide-gray-50 mt-1">
                    {users.map((user) => {
                      const isActive = user.id === currentUser?.id;
                      return (
                        <div
                          key={user.id}
                          className={`w-full px-3.5 py-2 flex items-center justify-between hover:bg-orange-50/80 transition group ${
                            isActive ? 'bg-orange-50/90 font-semibold' : ''
                          }`}
                        >
                          <button
                            type="button"
                            onClick={() => {
                              setCurrentUser(user);
                              setIsUserMenuOpen(false);
                            }}
                            className="flex items-center gap-2.5 min-w-0 flex-1 text-left"
                          >
                            <div className={`w-7 h-7 rounded-full ${user.avatarColor || 'bg-gray-500'} text-white font-bold flex items-center justify-center text-[10px] shrink-0`}>
                              {user.initials}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className={`text-xs truncate ${isActive ? 'text-[#d65200] font-bold' : 'text-gray-800'}`}>
                                  {user.name}
                                </span>
                                {user.isAdmin && (
                                  <span className="text-amber-600 text-[10px]" title="Administrator">👑</span>
                                )}
                                {isActive && (
                                  <span className="text-[9px] px-1 py-0.2 rounded bg-[#d65200] text-white font-bold">
                                    Active
                                  </span>
                                )}
                              </div>
                              <div className="text-[10px] text-gray-500 truncate flex items-center gap-1">
                                <span>{user.role}</span>
                                <span>•</span>
                                <span className="font-mono text-gray-400">{user.email}</span>
                              </div>
                            </div>
                          </button>

                          <div className="flex items-center gap-1 shrink-0 pl-2">
                            {/* If current user is Admin, allow clicking Sliders to edit permissions for this user */}
                            {currentUser?.isAdmin && (
                              <button
                                type="button"
                                title={`Edit limited access for ${user.name}`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedUserForEdit(user);
                                  setIsAccessControlModalOpen(true);
                                  setIsUserMenuOpen(false);
                                }}
                                className="p-1 text-gray-400 hover:text-[#d65200] hover:bg-orange-100 rounded transition"
                              >
                                <Sliders className="w-3.5 h-3.5" />
                              </button>
                            )}

                            {isActive ? (
                              <Check className="w-4 h-4 text-[#d65200]" />
                            ) : (
                              <span className={`w-2 h-2 rounded-full ${user.status === 'Online' ? 'bg-emerald-500' : user.status === 'Away' ? 'bg-amber-400' : 'bg-slate-400'}`} />
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Admin & Profile Management Actions Toolbar */}
                <div className="p-2 bg-gray-50 space-y-1.5">
                  {/* Edit Profile Info Button */}
                  <button
                    onClick={() => {
                      setIsSelfProfileModalOpen(true);
                      setIsUserMenuOpen(false);
                    }}
                    className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded bg-white hover:bg-orange-50 text-[#d65200] border border-orange-300 font-bold text-xs shadow-2xs transition"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit Profile (Name, Title, Avatar)</span>
                  </button>

                  {/* If Admin: Edit System Header & Branding shortcut */}
                  {currentUser?.isAdmin && (
                    <button
                      onClick={() => {
                        setIsCompanySetupModalOpen(true);
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded bg-orange-100 hover:bg-orange-200 text-[#d65200] font-bold text-xs shadow-2xs transition"
                    >
                      <Building2 className="w-3.5 h-3.5" />
                      <span>Edit Header Branding & System Setup</span>
                    </button>
                  )}

                  {/* Admin Access Control Manager Button */}
                  <button
                    onClick={() => {
                      setSelectedUserForEdit(null);
                      setIsAccessControlModalOpen(true);
                      setIsUserMenuOpen(false);
                    }}
                    className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded bg-gray-900 hover:bg-gray-800 text-white font-bold text-xs shadow-2xs transition"
                  >
                    <Sliders className="w-3.5 h-3.5 text-amber-400" />
                    <span>Manage User Roles & Limited Access</span>
                  </button>

                  {/* Add User Button (Enabled for admin, informs non-admin) */}
                  <button
                    onClick={() => {
                      if (!currentUser?.isAdmin) {
                        alert('Administrator privileges required. Please switch to the System Administrator session to register team members.');
                        return;
                      }
                      setIsUserModalOpen(true);
                      setIsUserMenuOpen(false);
                    }}
                    className={`w-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded font-bold text-xs shadow-2xs transition ${
                      currentUser?.isAdmin 
                        ? 'bg-gray-800 hover:bg-gray-900 text-white' 
                        : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>+ Add New User / Team Member</span>
                  </button>

                  {/* Change Password via Email Confirmation */}
                  <button
                    onClick={() => {
                      setIsPasswordResetModalOpen(true);
                      setIsUserMenuOpen(false);
                    }}
                    className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded bg-amber-50 hover:bg-amber-100/90 text-amber-900 border border-amber-300 font-bold text-xs shadow-2xs transition"
                  >
                    <Key className="w-3.5 h-3.5 text-amber-700" />
                    <span>Change Admin Password (Email Confirm)</span>
                  </button>

                  <button
                    onClick={() => {
                      handleNavClick('activities', 'audit');
                      setIsUserMenuOpen(false);
                    }}
                    className="w-full flex items-center justify-center gap-1 px-3 py-1 text-gray-600 hover:text-gray-900 text-[11px] rounded hover:bg-gray-200/60 transition"
                  >
                    <History className="w-3 h-3 text-gray-400" />
                    <span>View User Action Logs & Audit Trail</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      logout();
                    }}
                    className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 text-rose-700 hover:text-rose-800 hover:bg-rose-50 text-xs font-semibold rounded border border-rose-200 transition"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out / Lock Workspace</span>
                  </button>
                </div>

              </div>
            )}
          </div>

        </div>
      </div>

      {/* Main NetSuite Orange Header Ribbon */}
      <div className="w-full bg-[#d65200] text-white flex items-stretch px-2 shadow-inner overflow-x-auto text-[12.5px] font-medium tracking-wide">
        
        {/* Navigation Action Icons (History, Star, Home) */}
        <div className="flex items-center border-r border-[#bf4700] pr-1 mr-1">
          <button
            onClick={() => handleNavClick('activities', 'audit')}
            title="Recent Records & History"
            className="px-2 py-2 hover:bg-[#bf4700] text-orange-100 hover:text-white transition flex items-center justify-center"
          >
            <History className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleNavClick('reports', 'balance_sheet')}
            title="Favorites & Shortcuts"
            className="px-2 py-2 hover:bg-[#bf4700] text-orange-100 hover:text-white transition flex items-center justify-center"
          >
            <Star className="w-4 h-4" />
          </button>
          <button
            id="header-home-btn"
            onClick={() => handleNavClick('dashboard')}
            title="Interactive ERP Workflow Diagram & Home Dashboard"
            className={`px-2 py-2 transition flex items-center justify-center ${activeTab === 'dashboard' || activeTab === 'home' ? 'bg-[#9c3800] text-white font-bold' : 'hover:bg-[#bf4700] text-orange-100 hover:text-white'}`}
          >
            <Home className="w-4 h-4" />
          </button>
        </div>

        {/* Menu Tabs */}
        <nav className="flex items-stretch whitespace-nowrap">
          {navMenuItems.map((item) => {
            const isActive = activeTab === item.id;
            const isHovered = activeDropdown === item.id;

            return (
              <div 
                key={item.id} 
                className="relative group flex items-stretch"
                onMouseEnter={() => setActiveDropdown(item.id)}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <button
                  id={`nav-tab-${item.id}`}
                  onClick={() => handleNavClick(item.id)}
                  className={`px-3 py-2 flex items-center gap-1.5 transition-colors border-r border-[#bf4700]/60 ${
                    isActive 
                      ? 'bg-[#9c3800] text-white font-bold shadow-inner' 
                      : 'hover:bg-[#bf4700] text-orange-50 hover:text-white'
                  }`}
                >
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="text-[9px] font-bold px-1.5 py-0.2 bg-orange-100 text-[#d65200] rounded-sm uppercase tracking-tighter">
                      {item.badge}
                    </span>
                  )}
                  {item.subItems && (
                    <ChevronDown className="w-2.5 h-2.5 opacity-60 group-hover:opacity-100" />
                  )}
                </button>

                {/* Dropdown Menu on hover */}
                {isHovered && item.subItems && (
                  <div className="absolute top-full left-0 w-60 bg-white text-gray-800 shadow-2xl border border-gray-200 rounded-b-md py-1 z-50 animate-in fade-in-50 duration-150">
                    <div className="px-3 py-1 font-bold text-[10px] uppercase text-[#d65200] bg-orange-50/70 border-b border-orange-100">
                      {item.label} Modules
                    </div>
                    {item.subItems.map((sub: any, idx) => (
                      <button
                        key={idx}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (sub.action) {
                            sub.action();
                            setActiveDropdown(null);
                          } else {
                            handleNavClick(item.id, sub.subView);
                          }
                        }}
                        className="w-full text-left px-3 py-1.5 text-xs text-gray-700 hover:bg-orange-50 hover:text-[#d65200] flex items-center justify-between transition-colors"
                      >
                        <span>{sub.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

      </div>

      {/* Edit Self / Admin Profile Modal */}
      {isSelfProfileModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-xl shadow-2xl border border-gray-200 w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="px-5 py-3.5 bg-gradient-to-r from-orange-600 to-[#d65200] text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-white/20 rounded-lg">
                  <UserCog className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm leading-tight">Edit Profile & Display Information</h3>
                  <p className="text-[11px] text-orange-100 leading-none mt-0.5">
                    Customize your name, email, avatar and role details
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsSelfProfileModalOpen(false)}
                className="p-1 text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Profile Live Card Preview */}
            <form onSubmit={handleSaveSelfProfile} className="p-5 space-y-4 text-xs">
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg flex items-center gap-3">
                <div className={`w-12 h-12 rounded-full ${selfColor} text-white font-bold flex items-center justify-center text-base shadow-sm ring-2 ring-white shrink-0`}>
                  {selfInitials || (selfName ? selfName.substring(0, 2).toUpperCase() : 'US')}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-gray-900 text-sm truncate">
                      {selfName || 'Your Name'}
                    </span>
                    {currentUser?.isAdmin && <span className="text-amber-500 text-xs">👑</span>}
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 font-bold ml-auto">
                      {selfStatus}
                    </span>
                  </div>
                  <div className="text-[11px] text-gray-500 font-mono truncate">{selfEmail || 'email@company.com'}</div>
                  <div className="text-[10px] text-[#d65200] font-semibold mt-0.5">{selfRole} • {selfDepartment}</div>
                </div>
              </div>

              {/* Form Fields */}
              <div className="space-y-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    Full Display Name (Shown in Top Header) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={selfName}
                    onChange={(e) => setSelfName(e.target.value)}
                    placeholder="e.g. Administrator or Soeuy Siem Reap"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md font-medium text-gray-900 focus:ring-1 focus:ring-[#d65200]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">
                      Email Address <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={selfEmail}
                      onChange={(e) => setSelfEmail(e.target.value)}
                      placeholder="e.g. admin@company.com"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md font-mono text-gray-900 focus:ring-1 focus:ring-[#d65200]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 mb-1">
                      Avatar Initials (1-2 Letters)
                    </label>
                    <input
                      type="text"
                      maxLength={3}
                      value={selfInitials}
                      onChange={(e) => setSelfInitials(e.target.value.toUpperCase())}
                      placeholder="e.g. SS or AD"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md font-mono font-bold text-center uppercase text-gray-900 focus:ring-1 focus:ring-[#d65200]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">
                      Role / Position Title
                    </label>
                    <input
                      type="text"
                      value={selfRole}
                      onChange={(e) => setSelfRole(e.target.value as any)}
                      placeholder="e.g. System Administrator, CFO"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:ring-1 focus:ring-[#d65200]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 mb-1">
                      Department / Business Unit
                    </label>
                    <input
                      type="text"
                      value={selfDepartment}
                      onChange={(e) => setSelfDepartment(e.target.value)}
                      placeholder="e.g. Executive & Finance"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:ring-1 focus:ring-[#d65200]"
                    />
                  </div>
                </div>

                {/* Avatar Color & Status */}
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block font-bold text-gray-700 mb-1.5 flex items-center gap-1">
                      <Palette className="w-3.5 h-3.5 text-[#d65200]" />
                      <span>Avatar Theme Color</span>
                    </label>
                    <div className="flex items-center gap-1.5">
                      {[
                        'bg-[#d65200]',
                        'bg-blue-600',
                        'bg-emerald-600',
                        'bg-purple-600',
                        'bg-rose-600',
                        'bg-slate-800'
                      ].map((color) => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => setSelfColor(color)}
                          className={`w-6 h-6 rounded-full ${color} transition-transform ${
                            selfColor === color ? 'scale-125 ring-2 ring-offset-2 ring-[#d65200]' : 'opacity-80 hover:opacity-100'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 mb-1">
                      Presence Status
                    </label>
                    <select
                      value={selfStatus}
                      onChange={(e) => setSelfStatus(e.target.value as any)}
                      className="w-full px-3 py-1.5 border border-gray-300 rounded-md bg-white text-gray-900 font-medium focus:ring-1 focus:ring-[#d65200]"
                    >
                      <option value="Online">🟢 Online (Active)</option>
                      <option value="Away">🟡 Away</option>
                      <option value="Busy">🔴 Busy / Do Not Disturb</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="pt-3 border-t border-gray-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsSelfProfileModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 font-semibold text-xs transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#d65200] hover:bg-[#bf4700] text-white rounded-md font-bold text-xs shadow-xs flex items-center gap-1.5 transition"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Profile Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </header>
  );
};
