import React, { useState } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  AlertCircle, 
  FileText, 
  Receipt, 
  Building, 
  CheckCircle2, 
  Clock, 
  ArrowUpRight, 
  ArrowDownRight,
  PlusCircle,
  Eye,
  CreditCard,
  Percent,
  Calendar,
  Landmark,
  Wallet,
  FileSpreadsheet,
  PieChart,
  Scale,
  RefreshCw,
  FolderTree,
  X,
  Search,
  Download,
  Filter,
  ArrowRight,
  ChevronRight,
  Sparkles,
  Link2,
  Workflow
} from 'lucide-react';
import { useAccounting } from '../context/AccountingContext';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { Transaction } from '../types';

export const Dashboard: React.FC = () => {
  const { 
    formatCurrency, 
    transactions, 
    accounts, 
    tasks, 
    customers, 
    vendors, 
    whtEntries,
    setActiveTab, 
    setSubView,
    setIsQuickInvoiceOpen,
    setIsQuickJournalOpen,
    setIsQuickWhtOpen,
    setIsBankControlModalOpen,
    companyProfile,
    setPreviewDoc,
    runMonthlyDepreciation,
    setIsAccountLinkerOpen,
    setSelectedEntityForLink,
    setWorkflowViewMode
  } = useAccounting();

  // Selected month for detailed monthly transactions modal drilldown
  const [selectedMonthModal, setSelectedMonthModal] = useState<string | null>(null);
  const [modalTxFilter, setModalTxFilter] = useState<string>('All');
  const [modalSearchTerm, setModalSearchTerm] = useState<string>('');

  // Calculated metrics
  const cashAccounts = accounts.filter(a => a.type === 'Bank');
  const totalCash = cashAccounts.reduce((acc, a) => acc + (a.balance > 0 ? a.balance : 0), 0);

  const totalAR = customers.reduce((acc, c) => acc + c.balance, 0);
  const totalAP = vendors.reduce((acc, v) => acc + v.balance, 0);

  const totalRevenue = accounts
    .filter(a => a.category === 'Revenue')
    .reduce((acc, a) => acc + a.balance, 0);

  const totalExpenses = accounts
    .filter(a => a.category === 'Expense')
    .reduce((acc, a) => acc + a.balance, 0);

  const netIncome = totalRevenue - totalExpenses;

  // VAT summary for PP30
  const outputVAT = accounts.find(a => a.number === '2100')?.balance || 0;
  const inputVAT = accounts.find(a => a.number === '1250')?.balance || 0;
  const vatNetPayable = outputVAT - inputVAT;

  // Withholding Tax Liabilities (P.N.D. 3 & P.N.D. 53)
  const whtPnd3 = accounts.find(a => a.number === '2120')?.balance || 0;
  const whtPnd53 = accounts.find(a => a.number === '2130')?.balance || 0;
  const totalWhtPayable = whtPnd3 + whtPnd53;

  // Total Statutory Tax Payable
  const totalTaxPayable = Math.max(0, vatNetPayable) + totalWhtPayable;

  // Helper to extract month key
  const getMonthPrefix = (monthStr: string) => {
    if (monthStr.includes('Mar') || monthStr.includes('03')) return '2026-03';
    if (monthStr.includes('Apr') || monthStr.includes('04')) return '2026-04';
    if (monthStr.includes('May') || monthStr.includes('05')) return '2026-05';
    if (monthStr.includes('Jun') || monthStr.includes('06')) return '2026-06';
    if (monthStr.includes('Jul') || monthStr.includes('07')) return '2026-07';
    if (monthStr.includes('Aug') || monthStr.includes('08')) return '2026-08';
    return '2026-08';
  };

  // Helper to get transactions for a given month
  const getTransactionsForMonth = (monthStr: string) => {
    const prefix = getMonthPrefix(monthStr);
    const shortName = monthStr.substring(0, 3).toLowerCase();
    return transactions.filter(t => 
      t.date.startsWith(prefix) || 
      (t.postingPeriod && t.postingPeriod.toLowerCase().includes(shortName))
    );
  };

  // Chart data for Financial Performance (6 Months)
  const chartData = [
    { month: 'Mar 2026', shortKey: 'Mar 2026', Revenue: 5200000, Expenses: 4100000, NetProfit: 1100000, txCount: getTransactionsForMonth('Mar 2026').length },
    { month: 'Apr 2026', shortKey: 'Apr 2026', Revenue: 6800000, Expenses: 5200000, NetProfit: 1600000, txCount: getTransactionsForMonth('Apr 2026').length },
    { month: 'May 2026', shortKey: 'May 2026', Revenue: 7100000, Expenses: 5600000, NetProfit: 1500000, txCount: getTransactionsForMonth('May 2026').length },
    { month: 'Jun 2026', shortKey: 'Jun 2026', Revenue: 8400000, Expenses: 6400000, NetProfit: 2000000, txCount: getTransactionsForMonth('Jun 2026').length },
    { month: 'Jul 2026', shortKey: 'Jul 2026', Revenue: 9500000, Expenses: 7100000, NetProfit: 2400000, txCount: getTransactionsForMonth('Jul 2026').length },
    { month: 'Aug 2026 (MTD)', shortKey: 'Aug 2026', Revenue: totalRevenue, Expenses: totalExpenses, NetProfit: netIncome, txCount: getTransactionsForMonth('Aug 2026').length },
  ];

  const pendingTasks = tasks.filter(t => t.status !== 'Completed');

  // Month transactions when modal is open
  const currentMonthTransactions = selectedMonthModal ? getTransactionsForMonth(selectedMonthModal) : [];
  
  // Filtered transactions inside modal
  const filteredModalTransactions = currentMonthTransactions.filter(tx => {
    const matchesFilter = 
      modalTxFilter === 'All' ? true :
      modalTxFilter === 'Invoice' ? tx.type === 'Invoice' :
      modalTxFilter === 'Bill' ? tx.type === 'Bill' :
      modalTxFilter === 'Journal' ? tx.type === 'Journal_Entry' :
      modalTxFilter === 'Payment' ? (tx.type === 'Payment_Received' || tx.type === 'Bill_Payment') :
      true;

    const matchesSearch = 
      !modalSearchTerm ||
      tx.transactionNumber.toLowerCase().includes(modalSearchTerm.toLowerCase()) ||
      tx.entityName.toLowerCase().includes(modalSearchTerm.toLowerCase()) ||
      (tx.memo && tx.memo.toLowerCase().includes(modalSearchTerm.toLowerCase())) ||
      tx.total.toString().includes(modalSearchTerm);

    return matchesFilter && matchesSearch;
  });

  // Calculate monthly stats for modal
  const modalMonthRevenue = currentMonthTransactions
    .filter(t => t.type === 'Invoice')
    .reduce((sum, t) => sum + t.subtotal, 0);

  const modalMonthExpense = currentMonthTransactions
    .filter(t => t.type === 'Bill')
    .reduce((sum, t) => sum + t.subtotal, 0);

  const modalMonthTax = currentMonthTransactions.reduce((sum, t) => sum + (t.taxTotal || 0), 0);

  // Export monthly transactions CSV
  const handleExportMonthCSV = () => {
    if (!selectedMonthModal || filteredModalTransactions.length === 0) return;
    const headers = ['Date', 'Transaction Number', 'Type', 'Entity Name', 'Memo', 'Subtotal', 'Tax Total', 'Total Amount', 'Currency', 'Status'];
    const rows = filteredModalTransactions.map(t => [
      t.date,
      t.transactionNumber,
      t.type,
      `"${(t.entityName || '').replace(/"/g, '""')}"`,
      `"${(t.memo || '').replace(/"/g, '""')}"`,
      t.subtotal,
      t.taxTotal,
      t.total,
      t.currency,
      t.status
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Transactions_${selectedMonthModal.replace(/[^a-zA-Z0-9]/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner / Welcome Ribbon */}
      <div className="flex flex-col md:flex-row md:items-center justify-between bg-gradient-to-r from-[#e65c00] via-[#d65200] to-[#b84300] text-white p-4 rounded-lg shadow-sm">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="bg-white/20 text-white text-xs font-semibold px-2 py-0.5 rounded uppercase tracking-wider">
              {companyProfile.name} - Main Operating Entity
            </span>
            <span className="text-xs text-orange-200">Fiscal Period: August 2026 (Open)</span>
            <span className="text-xs bg-emerald-500/30 text-emerald-100 px-2 py-0.5 rounded font-medium border border-emerald-400/30 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              Bank Feeds Synced
            </span>
          </div>
          <h1 className="text-xl font-bold mt-1 tracking-tight">
            Financial & Management Accounting Control Center
          </h1>
          <p className="text-xs text-orange-100 mt-0.5">
            Full compliance with VAT 7%, Corporate & Personal Withholding Tax, and Double-Entry Ledger.
          </p>
        </div>

        {/* Action Button Bar */}
        <div className="flex flex-wrap items-center gap-2 mt-3 md:mt-0">
          <button
            id="dash-btn-workflow-view"
            onClick={() => setWorkflowViewMode('flowchart')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-gray-900 rounded text-xs font-bold shadow-xs transition border border-amber-300 animate-pulse"
            title="Switch to Interactive Business Process & Accounting Workflow Diagram"
          >
            <Workflow className="w-3.5 h-3.5" />
            <span>Workflow Diagram</span>
          </button>
          <button
            id="dash-btn-link-account"
            onClick={() => {
              setSelectedEntityForLink(null);
              setIsAccountLinkerOpen(true);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-[#d65200] hover:bg-orange-50 rounded text-xs font-bold shadow-xs transition border border-white/20"
            title="Link Entity / Name to Another Account in Chart of Accounts"
          >
            <Link2 className="w-3.5 h-3.5" />
            <span>Link Name to Account</span>
          </button>
          <button
            id="dash-btn-bank-control"
            onClick={() => setIsBankControlModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-bold shadow-xs transition border border-white/20"
            title="Open Bank Control & Treasury Center"
          >
            <Landmark className="w-3.5 h-3.5" />
            <span>Bank Control</span>
          </button>
          <button
            id="dash-btn-financials"
            onClick={() => { setActiveTab('reports'); setSubView('balance_sheet'); }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-bold shadow-xs transition border border-white/20"
            title="Open Statutory Financial Reports & Statements"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Financials</span>
          </button>
          <button
            id="dash-btn-coa"
            onClick={() => { setActiveTab('coa'); setSubView('coa'); }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-700 hover:bg-purple-800 text-white rounded text-xs font-bold shadow-xs transition border border-white/20"
            title="Open Chart of Accounts (COA) General Ledger"
          >
            <FolderTree className="w-3.5 h-3.5" />
            <span>Chart of Accounts</span>
          </button>
          <button
            id="dash-btn-new-invoice"
            onClick={() => setIsQuickInvoiceOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-[#d65200] hover:bg-orange-50 rounded text-xs font-bold shadow-xs transition"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>New Invoice</span>
          </button>
          <button
            id="dash-btn-new-journal"
            onClick={() => setIsQuickJournalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-700/80 hover:bg-orange-800 text-white rounded text-xs font-semibold border border-white/20 transition"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Journal Voucher</span>
          </button>
          <button
            id="dash-btn-wht-cert"
            onClick={() => setIsQuickWhtOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-700/80 hover:bg-orange-800 text-white rounded text-xs font-semibold border border-white/20 transition"
          >
            <Receipt className="w-3.5 h-3.5" />
            <span>WHT Certificate</span>
          </button>
          <button
            id="dash-btn-depr-run"
            onClick={runMonthlyDepreciation}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-gray-900 rounded text-xs font-bold transition shadow-xs"
            title="Calculate and post monthly straight-line depreciation for all fixed assets"
          >
            <Percent className="w-3.5 h-3.5" />
            <span>Post Depreciation</span>
          </button>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Cash & Bank */}
        <div 
          onClick={() => { setActiveTab('lists'); setSubView('coa'); }}
          className="bg-white border border-gray-200 rounded-lg p-4 shadow-2xs hover:border-orange-300 hover:shadow-xs transition cursor-pointer"
        >
          <div className="flex items-center justify-between text-xs text-gray-500 font-medium">
            <span>Cash & Bank Balances</span>
            <span className="p-1.5 bg-emerald-50 text-emerald-600 rounded">
              <CreditCard className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 text-2xl font-bold text-gray-900">
            {formatCurrency(totalCash)}
          </div>
          <div className="mt-1 flex items-center gap-1 text-[11px] text-emerald-600 font-medium">
            <TrendingUp className="w-3 h-3" />
            <span>Checking & USD Foreign Deposit</span>
          </div>
        </div>

        {/* Tax Payable Alert Card */}
        <div 
          onClick={() => { setActiveTab('tax'); setSubView('pp30'); }}
          className="bg-gradient-to-br from-amber-50/80 via-white to-orange-50/50 border border-amber-300 rounded-lg p-4 shadow-2xs hover:border-[#d65200] hover:shadow-xs transition cursor-pointer relative overflow-hidden group"
        >
          <div className="flex items-center justify-between text-xs text-gray-600 font-semibold">
            <div className="flex items-center gap-1.5">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#d65200]"></span>
              </span>
              <span className="text-gray-900 font-bold">Tax Payable Alert</span>
            </div>
            <span className="p-1 bg-amber-100 text-[#d65200] rounded group-hover:bg-[#d65200] group-hover:text-white transition-colors">
              <AlertCircle className="w-4 h-4" />
            </span>
          </div>

          <div className="mt-2 text-2xl font-bold text-[#b84300] font-mono tracking-tight">
            {formatCurrency(totalTaxPayable)}
          </div>

          <div className="mt-1.5 space-y-1">
            <div className="flex items-center justify-between text-[11px] text-gray-600">
              <span>VAT (P.P.30): <b className="text-gray-800">{formatCurrency(vatNetPayable)}</b></span>
              <span>WHT: <b className="text-gray-800">{formatCurrency(totalWhtPayable)}</b></span>
            </div>
            <div className="flex items-center justify-between text-[10px] text-amber-900 bg-amber-100/70 px-1.5 py-0.5 rounded font-medium">
              <span>⚠️ RD Due: 23rd Aug</span>
              <span className="font-bold underline text-[#d65200] group-hover:text-orange-900">File Returns &rarr;</span>
            </div>
          </div>
        </div>

        {/* Accounts Receivable AR */}
        <div 
          onClick={() => { setActiveTab('transactions'); setSubView('invoices'); }}
          className="bg-white border border-gray-200 rounded-lg p-4 shadow-2xs hover:border-orange-300 hover:shadow-xs transition cursor-pointer"
        >
          <div className="flex items-center justify-between text-xs text-gray-500 font-medium">
            <span>Accounts Receivable (AR)</span>
            <span className="p-1.5 bg-blue-50 text-blue-600 rounded">
              <ArrowDownRight className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 text-2xl font-bold text-blue-900">
            {formatCurrency(totalAR)}
          </div>
          <div className="mt-1 flex items-center justify-between text-[11px] text-gray-500">
            <span>{customers.length} Active Customer Accounts</span>
            <span className="text-orange-600 font-medium hover:underline">View Aging &rarr;</span>
          </div>
        </div>

        {/* Accounts Payable AP */}
        <div 
          onClick={() => { setActiveTab('transactions'); setSubView('bills'); }}
          className="bg-white border border-gray-200 rounded-lg p-4 shadow-2xs hover:border-orange-300 hover:shadow-xs transition cursor-pointer"
        >
          <div className="flex items-center justify-between text-xs text-gray-500 font-medium">
            <span>Accounts Payable (AP)</span>
            <span className="p-1.5 bg-rose-50 text-rose-600 rounded">
              <ArrowUpRight className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 text-2xl font-bold text-rose-900">
            {formatCurrency(totalAP)}
          </div>
          <div className="mt-1 flex items-center justify-between text-[11px] text-gray-500">
            <span>Suppliers & Service Providers</span>
            <span className="text-rose-600 font-medium">Due in 15-30 Days</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Reminders & Tasks vs Financial Analytics Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: NetSuite Reminders & Tax Deadlines */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* NetSuite Reminders Portlet */}
          <div className="bg-white border border-gray-200 rounded-lg shadow-2xs overflow-hidden">
            <div className="px-4 py-3 bg-[#fafafa] border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-[#d65200]" />
                <h2 className="text-xs font-bold text-gray-800 uppercase tracking-wider">
                  Reminders & Approvals
                </h2>
              </div>
              <span className="text-[10px] font-bold px-1.5 py-0.5 bg-orange-100 text-[#d65200] rounded">
                {pendingTasks.length} Action Items
              </span>
            </div>

            <div className="p-3 divide-y divide-gray-100">
              {pendingTasks.slice(0, 4).map((task) => (
                <div key={task.id} className="py-2.5 flex items-start justify-between gap-3 text-xs">
                  <div className="flex items-start gap-2">
                    <Clock className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${task.priority === 'High' ? 'text-rose-500' : 'text-amber-500'}`} />
                    <div>
                      <p className="font-medium text-gray-800 leading-snug">{task.title}</p>
                      <p className="text-[10px] text-gray-500 mt-0.5">Due: {task.dueDate} • {task.assignedTo}</p>
                    </div>
                  </div>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold shrink-0 ${task.priority === 'High' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'}`}>
                    {task.priority}
                  </span>
                </div>
              ))}

              <div className="pt-2 text-center">
                <button
                  onClick={() => { setActiveTab('activities'); setSubView('tasks'); }}
                  className="text-xs font-bold text-[#d65200] hover:underline"
                >
                  View All Action Reminders &rarr;
                </button>
              </div>
            </div>
          </div>

          {/* Quick Bank Accounts Portlet */}
          <div className="bg-white border border-gray-200 rounded-lg shadow-2xs overflow-hidden">
            <div className="px-4 py-3 bg-[#fafafa] border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building className="w-4 h-4 text-gray-600" />
                <h2 className="text-xs font-bold text-gray-800 uppercase tracking-wider">
                  Cash & Bank Accounts
                </h2>
              </div>
              <button 
                onClick={() => { setActiveTab('transactions'); setSubView('bank_rec'); }}
                className="text-[10px] text-[#d65200] font-semibold hover:underline"
              >
                Reconcile
              </button>
            </div>

            <div className="p-3 space-y-3">
              {cashAccounts.map(acc => (
                <div key={acc.id} className="flex items-center justify-between p-2 rounded bg-gray-50/70 border border-gray-100 text-xs">
                  <div>
                    <div className="font-semibold text-gray-800">{acc.name}</div>
                    <div className="text-[10px] text-gray-500 font-mono">#{acc.number} • {acc.thaiName}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-gray-900 font-mono">{formatCurrency(acc.balance, acc.currency)}</div>
                    <div className="text-[10px] text-emerald-600 font-medium">Reconciled</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right 2 Columns: Financial Performance Recharts */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Revenue vs Operating Expenses Chart */}
          <div className="bg-white border border-gray-200 rounded-lg shadow-2xs p-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-gray-100 gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-bold text-gray-900">
                    Financial Performance Trend (2026)
                  </h2>
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-orange-100 text-[#d65200] rounded-full flex items-center gap-1">
                    <Sparkles className="w-2.5 h-2.5" />
                    Click Any Month to Inspect Transactions
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">
                  Monthly Comparison of Inbound Tour Revenues vs Cost of Services & Operating Expenses (USD). Select any month below to inspect all ledger entries.
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs shrink-0">
                <span className="inline-flex items-center gap-1 text-orange-600 font-semibold">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#d65200]"></span> Revenue
                </span>
                <span className="inline-flex items-center gap-1 text-gray-500 font-semibold">
                  <span className="w-2.5 h-2.5 rounded-full bg-gray-400"></span> Cost & Exp.
                </span>
              </div>
            </div>

            {/* Interactive 6-Month Quick Selection Ribbon */}
            <div className="mt-3 pt-1">
              <div className="flex items-center justify-between mb-1.5 text-[11px] font-semibold text-gray-600">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-[#d65200]" />
                  <span>Select Month to Drill Down ({chartData.length} Periods Available):</span>
                </span>
                <span className="text-[10px] text-gray-400">Showing Invoices, Bills & Journals</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                {chartData.map((item) => {
                  const isAug = item.month.includes('Aug');
                  return (
                    <button
                      key={item.month}
                      id={`dash-month-btn-${item.shortKey.replace(/\s+/g, '-').toLowerCase()}`}
                      onClick={() => {
                        setSelectedMonthModal(item.month);
                        setModalTxFilter('All');
                        setModalSearchTerm('');
                      }}
                      className={`text-left p-2 rounded-lg border transition group relative overflow-hidden ${
                        isAug
                          ? 'bg-gradient-to-br from-orange-50/90 to-amber-50/60 border-orange-300 hover:border-[#d65200] hover:shadow-xs'
                          : 'bg-gray-50/80 border-gray-200 hover:border-orange-300 hover:bg-orange-50/30 hover:shadow-xs'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-gray-900 group-hover:text-[#d65200] transition-colors">
                          {item.shortKey}
                        </span>
                        <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full ${
                          item.txCount > 0 ? 'bg-orange-100 text-[#d65200]' : 'bg-gray-200 text-gray-600'
                        }`}>
                          {item.txCount} txs
                        </span>
                      </div>
                      <div className="mt-1 text-[11px] font-bold text-[#d65200] font-mono">
                        ${(item.Revenue / 1000000).toFixed(2)}M
                      </div>
                      <div className="text-[9px] text-gray-500 mt-0.5 flex items-center justify-between">
                        <span>Cost: ${(item.Expenses / 1000000).toFixed(2)}M</span>
                        <ChevronRight className="w-2.5 h-2.5 text-gray-400 group-hover:text-[#d65200] group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Recharts Bar Chart */}
            <div className="h-64 mt-4 w-full cursor-pointer" title="Click on any month column to inspect full monthly transactions">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart 
                  data={chartData} 
                  margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                  onClick={(state: any) => {
                    if (state && state.activePayload && state.activePayload.length > 0) {
                      const payloadMonth = state.activePayload[0].payload?.month;
                      if (payloadMonth) {
                        setSelectedMonthModal(payloadMonth);
                        setModalTxFilter('All');
                        setModalSearchTerm('');
                      }
                    }
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={(val) => `$${(val / 1000000).toFixed(1)}M`} />
                  <Tooltip 
                    formatter={(value: any) => [`$${Number(value).toLocaleString()}`, '']}
                    contentStyle={{ backgroundColor: '#fff', borderRadius: '6px', border: '1px solid #e5e7eb', fontSize: '12px' }}
                  />
                  <Bar dataKey="Revenue" fill="#d65200" radius={[4, 4, 0, 0]} className="cursor-pointer hover:opacity-85 transition-opacity" />
                  <Bar dataKey="Expenses" fill="#94a3b8" radius={[4, 4, 0, 0]} className="cursor-pointer hover:opacity-85 transition-opacity" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Sub-KPI Row below chart */}
            <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-gray-100 text-center text-xs">
              <div 
                onClick={() => setSelectedMonthModal('Aug 2026 (MTD)')}
                className="p-2 bg-orange-50/50 rounded cursor-pointer hover:bg-orange-100/60 transition group border border-transparent hover:border-orange-200"
              >
                <div className="text-gray-500 text-[11px] flex items-center justify-center gap-1">
                  <span>Total YTD Revenue</span>
                  <span className="text-[10px] text-[#d65200] opacity-0 group-hover:opacity-100 transition-opacity">&rarr;</span>
                </div>
                <div className="font-bold text-gray-900 text-sm mt-0.5">{formatCurrency(totalRevenue)}</div>
              </div>
              <div 
                onClick={() => setSelectedMonthModal('Aug 2026 (MTD)')}
                className="p-2 bg-gray-50 rounded cursor-pointer hover:bg-gray-100 transition group border border-transparent hover:border-gray-300"
              >
                <div className="text-gray-500 text-[11px] flex items-center justify-center gap-1">
                  <span>Cost of Tours & Ops</span>
                  <span className="text-[10px] text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity">&rarr;</span>
                </div>
                <div className="font-bold text-gray-900 text-sm mt-0.5">{formatCurrency(totalExpenses)}</div>
              </div>
              <div 
                onClick={() => setSelectedMonthModal('Aug 2026 (MTD)')}
                className="p-2 bg-emerald-50/60 rounded cursor-pointer hover:bg-emerald-100/70 transition group border border-transparent hover:border-emerald-200"
              >
                <div className="text-gray-500 text-[11px] flex items-center justify-center gap-1">
                  <span>Net Operating Profit</span>
                  <span className="text-[10px] text-emerald-700 opacity-0 group-hover:opacity-100 transition-opacity">&rarr;</span>
                </div>
                <div className="font-bold text-emerald-700 text-sm mt-0.5">{formatCurrency(netIncome)}</div>
              </div>
            </div>
          </div>

          {/* Recent Invoices & Billing Transactions */}
          <div className="bg-white border border-gray-200 rounded-lg shadow-2xs overflow-hidden">
            <div className="px-4 py-3 bg-[#fafafa] border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h2 className="text-xs font-bold text-gray-800 uppercase tracking-wider">
                  Recent Accounting Transactions
                </h2>
                <span className="text-[10px] font-semibold text-gray-500 bg-gray-100 border border-gray-200 px-2 py-0.5 rounded-full hidden sm:inline-flex items-center gap-1">
                  <span>💡 Double-click to see all matching {`{type}`} transactions in detail</span>
                </span>
              </div>
              <button
                onClick={() => { setActiveTab('transactions'); setSubView('all'); }}
                className="text-xs font-bold text-[#d65200] hover:underline"
              >
                View All Transactions &rarr;
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 text-gray-600 border-b border-gray-200 text-[11px] uppercase">
                  <tr>
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Doc #</th>
                    <th className="py-2.5 px-3">Type</th>
                    <th className="py-2.5 px-3">Entity / Customer / Vendor</th>
                    <th className="py-2.5 px-3 text-right">Amount</th>
                    <th className="py-2.5 px-3 text-center">Status</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {transactions.slice(0, 5).map((tx) => {
                    const subViewTarget = 
                      tx.type === 'Invoice' ? 'invoices' :
                      tx.type === 'Bill' ? 'bills' :
                      tx.type === 'Journal_Entry' ? 'journals' :
                      tx.type === 'Payment' ? 'payments' : 'all';

                    return (
                      <tr 
                        key={tx.id} 
                        onDoubleClick={() => {
                          setActiveTab('transactions');
                          setSubView(subViewTarget);
                        }}
                        className="hover:bg-orange-50/70 transition cursor-pointer select-none group"
                        title={`Double-click to view all ${tx.type.replace('_', ' ')} transactions in full detail`}
                      >
                        <td className="py-2.5 px-3 text-gray-600 font-mono text-[11px]">{tx.date}</td>
                        <td 
                          onClick={(e) => {
                            e.stopPropagation();
                            setPreviewDoc({ type: tx.type as any, data: tx });
                          }}
                          className="py-2.5 px-3 font-semibold text-[#d65200] font-mono group-hover:underline cursor-pointer hover:text-orange-700"
                          title="Click to preview document details"
                        >
                          {tx.transactionNumber}
                        </td>
                        <td className="py-2.5 px-3">
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            tx.type === 'Invoice' ? 'bg-blue-100 text-blue-700' :
                            tx.type === 'Bill' ? 'bg-purple-100 text-purple-700' :
                            'bg-amber-100 text-amber-800'
                          }`}>
                            {tx.type.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-gray-900 font-medium max-w-[200px] truncate">
                          {tx.entityName}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-gray-900">
                          {formatCurrency(tx.total, tx.currency)}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            tx.status === 'Paid' ? 'bg-emerald-100 text-emerald-800' :
                            tx.status === 'Approved' ? 'bg-blue-100 text-blue-800' :
                            tx.status === 'Partially_Paid' ? 'bg-amber-100 text-amber-800' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {tx.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveTab('transactions');
                                setSubView(subViewTarget);
                              }}
                              className="px-2 py-1 bg-orange-50 hover:bg-[#d65200] hover:text-white text-[#d65200] rounded text-[11px] font-medium transition inline-flex items-center gap-1 shadow-2xs border border-orange-200"
                              title={`View all ${tx.type.replace('_', ' ')}s in General Ledger`}
                            >
                              <span>All {tx.type === 'Journal_Entry' ? 'Journals' : tx.type + 's'}</span>
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setPreviewDoc({ type: tx.type as any, data: tx });
                              }}
                              className="px-2 py-1 bg-gray-100 hover:bg-orange-100 hover:text-[#d65200] text-gray-700 rounded text-[11px] font-medium transition inline-flex items-center gap-1 shadow-2xs"
                              title="View Document Details"
                            >
                              <Eye className="w-3 h-3" />
                              <span>Doc</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

        </div>

      </div>

      {/* Monthly Transactions Drill-down Modal */}
      {selectedMonthModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-xl shadow-2xl max-w-5xl w-full max-h-[92vh] flex flex-col border border-gray-200 overflow-hidden">
            
            {/* Modal Header with Title & Month Switcher */}
            <div className="p-4 sm:p-5 bg-gradient-to-r from-gray-900 via-[#2a2d34] to-gray-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[#d65200] text-white">
                    Monthly Ledger Inspection
                  </span>
                  <span className="text-xs text-orange-200 font-mono">
                    Posting Period: {selectedMonthModal}
                  </span>
                  <span className="text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-medium">
                    {filteredModalTransactions.length} of {currentMonthTransactions.length} Records
                  </span>
                </div>
                <h2 className="text-lg font-bold text-white mt-1 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-orange-400" />
                  <span>{selectedMonthModal} Transactions & Performance Drilldown</span>
                </h2>
              </div>

              {/* Close Button & Quick Export */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleExportMonthCSV}
                  className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded text-xs font-semibold flex items-center gap-1.5 transition border border-white/15"
                  title="Export this month's transactions as CSV"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export CSV</span>
                </button>
                <button
                  onClick={() => setSelectedMonthModal(null)}
                  className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Quick Month Switcher Pill Bar */}
            <div className="bg-gray-100/90 border-b border-gray-200 px-4 py-2.5 flex items-center gap-2 overflow-x-auto shrink-0">
              <span className="text-xs font-semibold text-gray-500 shrink-0 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> Switch Month:
              </span>
              <div className="flex items-center gap-1.5">
                {chartData.map((item) => {
                  const isSelected = selectedMonthModal === item.month;
                  return (
                    <button
                      key={item.month}
                      onClick={() => {
                        setSelectedMonthModal(item.month);
                        setModalTxFilter('All');
                        setModalSearchTerm('');
                      }}
                      className={`px-3 py-1 rounded-md text-xs font-medium transition flex items-center gap-1.5 shrink-0 ${
                        isSelected
                          ? 'bg-[#d65200] text-white font-bold shadow-xs'
                          : 'bg-white text-gray-700 hover:bg-orange-50 hover:text-[#d65200] border border-gray-200'
                      }`}
                    >
                      <span>{item.shortKey}</span>
                      <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                        isSelected ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {item.txCount}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Modal Body with Scrolling */}
            <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
              
              {/* Monthly KPI Overview Row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-orange-50/80 border border-orange-200/80 rounded-lg">
                  <div className="text-[11px] font-semibold text-orange-900 flex items-center justify-between">
                    <span>Inbound Revenue</span>
                    <TrendingUp className="w-3.5 h-3.5 text-orange-600" />
                  </div>
                  <div className="text-base sm:text-lg font-bold text-gray-900 font-mono mt-1">
                    {formatCurrency(modalMonthRevenue > 0 ? modalMonthRevenue : chartData.find(c => c.month === selectedMonthModal)?.Revenue || 0)}
                  </div>
                  <div className="text-[10px] text-orange-700 mt-0.5">B2B Tour Bookings & Packages</div>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <div className="text-[11px] font-semibold text-slate-800 flex items-center justify-between">
                    <span>Direct Costs & Ops</span>
                    <TrendingDown className="w-3.5 h-3.5 text-slate-500" />
                  </div>
                  <div className="text-base sm:text-lg font-bold text-gray-900 font-mono mt-1">
                    {formatCurrency(modalMonthExpense > 0 ? modalMonthExpense : chartData.find(c => c.month === selectedMonthModal)?.Expenses || 0)}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Hotels, Transport & Guides</div>
                </div>

                <div className="p-3 bg-emerald-50/80 border border-emerald-200/80 rounded-lg">
                  <div className="text-[11px] font-semibold text-emerald-900 flex items-center justify-between">
                    <span>Operating Margin</span>
                    <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                  </div>
                  <div className="text-base sm:text-lg font-bold text-emerald-800 font-mono mt-1">
                    {formatCurrency(chartData.find(c => c.month === selectedMonthModal)?.NetProfit || (modalMonthRevenue - modalMonthExpense))}
                  </div>
                  <div className="text-[10px] text-emerald-700 mt-0.5">Net Profit Margin for Period</div>
                </div>

                <div className="p-3 bg-blue-50/80 border border-blue-200/80 rounded-lg">
                  <div className="text-[11px] font-semibold text-blue-900 flex items-center justify-between">
                    <span>VAT & Tax Liability</span>
                    <Percent className="w-3.5 h-3.5 text-blue-600" />
                  </div>
                  <div className="text-base sm:text-lg font-bold text-blue-950 font-mono mt-1">
                    {formatCurrency(modalMonthTax > 0 ? modalMonthTax : (modalMonthRevenue * 0.07))}
                  </div>
                  <div className="text-[10px] text-blue-700 mt-0.5">VAT 7% & Statutory WHT</div>
                </div>
              </div>

              {/* Filter Tabs and Search Bar inside Modal */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                  {[
                    { key: 'All', label: 'All Entries', count: currentMonthTransactions.length },
                    { key: 'Invoice', label: 'Invoices (AR)', count: currentMonthTransactions.filter(t => t.type === 'Invoice').length },
                    { key: 'Bill', label: 'Vendor Bills (AP)', count: currentMonthTransactions.filter(t => t.type === 'Bill').length },
                    { key: 'Journal', label: 'Journals', count: currentMonthTransactions.filter(t => t.type === 'Journal_Entry').length },
                    { key: 'Payment', label: 'Payments', count: currentMonthTransactions.filter(t => t.type === 'Payment_Received' || t.type === 'Bill_Payment').length },
                  ].map(tab => (
                    <button
                      key={tab.key}
                      onClick={() => setModalTxFilter(tab.key)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                        modalTxFilter === tab.key
                          ? 'bg-gray-900 text-white shadow-2xs'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      <span>{tab.label}</span>
                      <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                        modalTxFilter === tab.key ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-700'
                      }`}>
                        {tab.count}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Search Box */}
                <div className="relative w-full sm:w-64 shrink-0">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={modalSearchTerm}
                    onChange={(e) => setModalSearchTerm(e.target.value)}
                    placeholder="Search doc #, customer, memo..."
                    className="w-full pl-8 pr-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#d65200] focus:bg-white"
                  />
                  {modalSearchTerm && (
                    <button 
                      onClick={() => setModalSearchTerm('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>

              {/* Transactions Table for the Selected Month */}
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-2xs">
                {filteredModalTransactions.length === 0 ? (
                  <div className="text-center py-10 px-4 text-gray-500">
                    <FileText className="w-10 h-10 mx-auto text-gray-300 mb-2" />
                    <p className="font-semibold text-sm text-gray-700">No transactions match your filter</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Try selecting "All Entries" or clearing your search term for {selectedMonthModal}.
                    </p>
                    {modalSearchTerm && (
                      <button
                        onClick={() => { setModalSearchTerm(''); setModalTxFilter('All'); }}
                        className="mt-3 px-3 py-1 bg-gray-100 hover:bg-gray-200 text-xs font-semibold rounded text-gray-700 transition"
                      >
                        Reset Filters
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-gray-50 text-gray-600 border-b border-gray-200 text-[11px] uppercase font-semibold">
                        <tr>
                          <th className="py-2.5 px-3">Date</th>
                          <th className="py-2.5 px-3">Doc #</th>
                          <th className="py-2.5 px-3">Type</th>
                          <th className="py-2.5 px-3">Entity / Description</th>
                          <th className="py-2.5 px-3">Department / Memo</th>
                          <th className="py-2.5 px-3 text-right">Tax (VAT/WHT)</th>
                          <th className="py-2.5 px-3 text-right">Amount (USD)</th>
                          <th className="py-2.5 px-3 text-center">Status</th>
                          <th className="py-2.5 px-3 text-right">Inspect</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 font-normal">
                        {filteredModalTransactions.map((tx) => (
                          <tr 
                            key={tx.id} 
                            onDoubleClick={() => setPreviewDoc({ type: tx.type as any, data: tx })}
                            className="hover:bg-orange-50/60 transition cursor-pointer select-none group"
                            title="Double-click to inspect full document details"
                          >
                            <td className="py-2.5 px-3 font-mono text-gray-600 whitespace-nowrap">
                              {tx.date}
                            </td>
                            <td className="py-2.5 px-3 font-mono font-bold text-[#d65200] whitespace-nowrap group-hover:underline">
                              {tx.transactionNumber}
                            </td>
                            <td className="py-2.5 px-3 whitespace-nowrap">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                tx.type === 'Invoice' ? 'bg-emerald-100 text-emerald-800' :
                                tx.type === 'Bill' ? 'bg-rose-100 text-rose-800' :
                                tx.type === 'Journal_Entry' ? 'bg-purple-100 text-purple-800' :
                                'bg-blue-100 text-blue-800'
                              }`}>
                                {tx.type.replace('_', ' ')}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 font-semibold text-gray-900 max-w-[200px] truncate">
                              {tx.entityName}
                            </td>
                            <td className="py-2.5 px-3 text-gray-600 max-w-[220px] truncate">
                              <span className="text-[11px]">{tx.memo || 'General Ledger posting'}</span>
                              {tx.department && (
                                <span className="block text-[10px] text-gray-400 font-mono">{tx.department}</span>
                              )}
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono text-gray-600 whitespace-nowrap">
                              {tx.taxTotal > 0 ? formatCurrency(tx.taxTotal, tx.currency) : '-'}
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono font-bold text-gray-900 whitespace-nowrap">
                              {formatCurrency(tx.total, tx.currency)}
                            </td>
                            <td className="py-2.5 px-3 text-center whitespace-nowrap">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                                tx.status === 'Paid' ? 'bg-emerald-100 text-emerald-800' :
                                tx.status === 'Approved' ? 'bg-blue-100 text-blue-800' :
                                tx.status === 'Partially_Paid' ? 'bg-amber-100 text-amber-800' :
                                'bg-gray-100 text-gray-700'
                              }`}>
                                {tx.status.replace('_', ' ')}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-right whitespace-nowrap">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setPreviewDoc({ type: tx.type as any, data: tx });
                                }}
                                className="px-2.5 py-1 bg-gray-100 hover:bg-orange-100 hover:text-[#d65200] text-gray-700 rounded text-[11px] font-semibold transition inline-flex items-center gap-1 shadow-2xs"
                              >
                                <Eye className="w-3 h-3" />
                                <span>Inspect</span>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-gray-50 border-t border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <span className="font-bold text-gray-800">Selected Month Summary:</span>
                <span>{filteredModalTransactions.length} Transactions Listed</span>
                <span>•</span>
                <span>Period Total: <b className="font-mono text-gray-900">{formatCurrency(filteredModalTransactions.reduce((s, t) => s + t.total, 0))}</b></span>
              </div>

              <div className="flex items-center gap-2 justify-end">
                <button
                  onClick={() => {
                    setSelectedMonthModal(null);
                    setActiveTab('transactions');
                    setSubView('all');
                  }}
                  className="px-3.5 py-1.5 bg-[#d65200] hover:bg-[#b84300] text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
                >
                  <span>Open Full Transactions Ledger</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setSelectedMonthModal(null)}
                  className="px-3.5 py-1.5 bg-white border border-gray-300 hover:bg-gray-100 text-gray-700 rounded-lg text-xs font-semibold transition"
                >
                  Close
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
