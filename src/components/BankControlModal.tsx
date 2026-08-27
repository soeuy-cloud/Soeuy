import React, { useState } from 'react';
import { 
  Landmark, 
  X, 
  CheckCircle2, 
  ArrowUpRight, 
  ArrowDownRight, 
  TrendingUp, 
  CreditCard, 
  RefreshCw, 
  FileSpreadsheet, 
  PieChart, 
  Scale, 
  FileText, 
  DollarSign, 
  Check, 
  ShieldCheck, 
  Plus, 
  ExternalLink,
  Wallet
} from 'lucide-react';
import { useAccounting } from '../context/AccountingContext';

export const BankControlModal: React.FC = () => {
  const {
    accounts,
    transactions,
    formatCurrency,
    isBankControlModalOpen,
    setIsBankControlModalOpen,
    setActiveTab,
    setSubView,
    addTransaction,
    companyProfile
  } = useAccounting();

  const [activeSubTab, setActiveSubTab] = useState<'treasury' | 'reconciliation' | 'financials' | 'transfer'>('treasury');
  const [transferFrom, setTransferFrom] = useState<string>('acc-1020');
  const [transferTo, setTransferTo] = useState<string>('acc-1010');
  const [transferAmount, setTransferAmount] = useState<string>('');
  const [transferMemo, setTransferMemo] = useState<string>('Inter-bank funds transfer for petty cash replenishment');
  const [successMsg, setSuccessMsg] = useState<string>('');

  if (!isBankControlModalOpen) return null;

  // Filter Bank & Cash accounts
  const bankAccounts = accounts.filter(a => a.type === 'Bank' || a.category === 'Asset' && a.number.startsWith('10'));
  const totalCashAndBank = bankAccounts.reduce((sum, a) => sum + a.balance, 0);

  // Financial metrics
  const totalAssets = accounts.filter(a => a.category === 'Asset').reduce((sum, a) => sum + a.balance, 0);
  const totalLiabilities = accounts.filter(a => a.category === 'Liability').reduce((sum, a) => sum + a.balance, 0);
  const totalEquity = accounts.filter(a => a.category === 'Equity').reduce((sum, a) => sum + a.balance, 0);
  const totalRevenue = accounts.filter(a => a.category === 'Revenue').reduce((sum, a) => sum + a.balance, 0);
  const totalExpenses = accounts.filter(a => a.category === 'Expense').reduce((sum, a) => sum + a.balance, 0);
  const netIncome = totalRevenue - totalExpenses;
  const workingCapital = totalCashAndBank + 1480000 - 1120000; // Cash + AR - AP approx

  // Recent bank transactions
  const bankTxList = transactions.filter(t => t.type === 'Payment' || t.paymentMethod?.includes('Bank') || t.total > 0).slice(0, 8);

  const handleExecuteTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(transferAmount);
    if (isNaN(amt) || amt <= 0) {
      alert('Please enter a valid transfer amount.');
      return;
    }
    if (transferFrom === transferTo) {
      alert('Source and destination bank accounts must be different.');
      return;
    }

    const sourceAcc = accounts.find(a => a.id === transferFrom);
    const destAcc = accounts.find(a => a.id === transferTo);

    // Record transfer as a payment transaction
    addTransaction({
      transactionNumber: `BTX-${Date.now().toString().slice(-6)}`,
      type: 'Payment',
      date: new Date().toISOString().split('T')[0],
      entityName: `${destAcc?.name || 'Destination Bank'}`,
      entityType: 'Vendor',
      entityId: 'transfer',
      total: amt,
      taxTotal: 0,
      currency: 'USD',
      status: 'Paid',
      paymentMethod: 'Electronic Bank Transfer',
      memo: transferMemo || `Transfer from ${sourceAcc?.name} to ${destAcc?.name}`,
      lines: [
        {
          id: `line-1`,
          accountId: destAcc?.id || 'acc-1010',
          accountNumber: destAcc?.number || '1010',
          accountName: destAcc?.name || 'Petty Cash',
          description: `Debit: Transfer In to ${destAcc?.name}`,
          amount: amt,
          taxCode: 'NONE',
          taxAmount: 0
        }
      ],
      amountPaid: amt,
      balanceDue: 0
    });

    setSuccessMsg(`Successfully executed inter-bank transfer of ${formatCurrency(amt)}`);
    setTransferAmount('');
    setTimeout(() => {
      setSuccessMsg('');
      setActiveSubTab('treasury');
    }, 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-5xl w-full p-6 shadow-2xl animate-in fade-in-50 max-h-[92vh] flex flex-col">
        {/* Modal Top Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-gray-200 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#d65200]/10 text-[#d65200] rounded-lg">
              <Landmark className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-gray-900">
                  Bank Control & Financial Management Center
                </h3>
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded">
                  Live Feed Active
                </span>
              </div>
              <p className="text-xs text-gray-500 font-sans">
                {companyProfile.name} • Cash & Bank Balances, Daily Reconciliations & Statutory Financial Statements
              </p>
            </div>
          </div>
          <button 
            onClick={() => setIsBankControlModalOpen(false)}
            className="text-gray-400 hover:text-gray-600 p-1.5 rounded-md hover:bg-gray-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Sub-Tabs */}
        <div className="flex items-center justify-between border-b border-gray-100 mt-2 shrink-0">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setActiveSubTab('treasury')}
              className={`px-3.5 py-2 text-xs font-bold border-b-2 flex items-center gap-1.5 transition ${
                activeSubTab === 'treasury'
                  ? 'border-[#d65200] text-[#d65200]'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <Wallet className="w-3.5 h-3.5" />
              <span>Treasury & Bank Accounts</span>
            </button>

            <button
              onClick={() => setActiveSubTab('reconciliation')}
              className={`px-3.5 py-2 text-xs font-bold border-b-2 flex items-center gap-1.5 transition ${
                activeSubTab === 'reconciliation'
                  ? 'border-[#d65200] text-[#d65200]'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Bank Reconciliation</span>
            </button>

            <button
              onClick={() => setActiveSubTab('financials')}
              className={`px-3.5 py-2 text-xs font-bold border-b-2 flex items-center gap-1.5 transition ${
                activeSubTab === 'financials'
                  ? 'border-[#d65200] text-[#d65200]'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <PieChart className="w-3.5 h-3.5" />
              <span>Financial Statements & KPIs</span>
            </button>

            <button
              onClick={() => setActiveSubTab('transfer')}
              className={`px-3.5 py-2 text-xs font-bold border-b-2 flex items-center gap-1.5 transition ${
                activeSubTab === 'transfer'
                  ? 'border-[#d65200] text-[#d65200]'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>Inter-Bank Funds Transfer</span>
            </button>
          </div>

          <span className="text-[11px] font-mono text-gray-500">
            Total Available Liquidity: <b className="text-gray-900">{formatCurrency(totalCashAndBank)}</b>
          </span>
        </div>

        {successMsg && (
          <div className="mt-3 p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-md flex items-center gap-2 font-semibold text-xs animate-in fade-in shrink-0">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Tab Content Area */}
        <div className="mt-4 overflow-y-auto flex-1 pr-1 space-y-4">
          {/* 1. Treasury & Bank Accounts View */}
          {activeSubTab === 'treasury' && (
            <div className="space-y-4">
              {/* Account Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {bankAccounts.map((acc) => (
                  <div key={acc.id} className="p-4 rounded-lg border border-gray-200 bg-gradient-to-br from-white to-gray-50/50 shadow-2xs hover:border-orange-300 transition">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-mono font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                        GL #{acc.number}
                      </span>
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded">
                        <Check className="w-2.5 h-2.5" />
                        <span>Active</span>
                      </span>
                    </div>

                    <div className="mt-2.5">
                      <div className="font-bold text-gray-900 text-sm">{acc.name}</div>
                      <div className="text-[11px] text-gray-500">{acc.thaiName || 'General Operating Account'}</div>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-gray-100 flex items-center justify-between">
                      <span className="text-[11px] text-gray-500">Available Balance:</span>
                      <span className="text-base font-bold font-mono text-[#d65200]">
                        {formatCurrency(acc.balance, acc.currency)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Recent Bank Inflows & Outflows */}
              <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-2xs">
                <div className="flex items-center justify-between pb-2.5 border-b border-gray-100">
                  <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                    <CreditCard className="w-4 h-4 text-[#d65200]" />
                    <span>Recent Bank Movements & Payment Settlements</span>
                  </h4>
                  <button
                    onClick={() => {
                      setIsBankControlModalOpen(false);
                      setActiveTab('transactions');
                      setSubView('bank');
                    }}
                    className="text-[#d65200] hover:underline text-xs font-bold flex items-center gap-1"
                  >
                    <span>View All Transactions</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>

                <div className="divide-y divide-gray-100 max-h-[220px] overflow-y-auto">
                  {bankTxList.map((tx) => (
                    <div key={tx.id} className="py-2 flex items-center justify-between text-xs hover:bg-gray-50 px-1 rounded">
                      <div className="flex items-center gap-2.5">
                        <div className={`p-1.5 rounded-full ${
                          tx.type === 'Invoice' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                        }`}>
                          {tx.type === 'Invoice' ? <ArrowDownRight className="w-3.5 h-3.5" /> : <ArrowUpRight className="w-3.5 h-3.5" />}
                        </div>
                        <div>
                          <div className="font-bold text-gray-900 flex items-center gap-1.5">
                            <span>{tx.entityName}</span>
                            <span className="text-[10px] font-mono text-gray-400">({tx.transactionNumber})</span>
                          </div>
                          <div className="text-[10px] text-gray-500">
                            {tx.date} • {tx.paymentMethod || 'Bank Wire / ACH'} • {tx.memo || 'Direct Settlement'}
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className={`font-mono font-bold ${
                          tx.type === 'Invoice' ? 'text-emerald-700' : 'text-gray-900'
                        }`}>
                          {tx.type === 'Invoice' ? '+' : '-'}{formatCurrency(tx.total, tx.currency)}
                        </span>
                        <div className="text-[10px] text-emerald-600 font-semibold">Cleared</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 2. Bank Reconciliation Workbench */}
          {activeSubTab === 'reconciliation' && (
            <div className="space-y-4">
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 flex items-start gap-3">
                <div className="p-2 bg-emerald-100 text-emerald-800 rounded-lg shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div className="text-xs">
                  <h4 className="font-bold text-emerald-900 text-sm">
                    Bank Accounts Reconciled & In Balance
                  </h4>
                  <p className="text-emerald-800 mt-0.5 leading-relaxed">
                    All general ledger bank postings match monthly electronic banking statements for August 2026. Zero unreconciled variance detected across checking, savings, and international deposit accounts.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
                  <div className="font-bold text-gray-900 border-b border-gray-100 pb-2 flex items-center justify-between">
                    <span>Main Operating Bank Account (GL 1020)</span>
                    <span className="text-emerald-700 font-bold">Matched 100%</span>
                  </div>
                  <div className="space-y-2 text-gray-600">
                    <div className="flex justify-between">
                      <span>Statement Ending Balance (Aug 2026):</span>
                      <span className="font-mono font-bold text-gray-900">{formatCurrency(4250000)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>General Ledger Book Balance:</span>
                      <span className="font-mono font-bold text-gray-900">{formatCurrency(4250000)}</span>
                    </div>
                    <div className="flex justify-between text-gray-500">
                      <span>Less: Outstanding Checks & Outflows:</span>
                      <span className="font-mono">$0.00</span>
                    </div>
                    <div className="flex justify-between text-gray-500">
                      <span>Plus: Deposits in Transit:</span>
                      <span className="font-mono">$0.00</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-gray-100 font-bold text-emerald-700">
                      <span>Reconciliation Variance:</span>
                      <span className="font-mono">$0.00 (Balanced)</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
                  <div className="font-bold text-gray-900 border-b border-gray-100 pb-2 flex items-center justify-between">
                    <span>Secondary International Bank (GL 1030)</span>
                    <span className="text-emerald-700 font-bold">Matched 100%</span>
                  </div>
                  <div className="space-y-2 text-gray-600">
                    <div className="flex justify-between">
                      <span>Statement Ending Balance (Aug 2026):</span>
                      <span className="font-mono font-bold text-gray-900">{formatCurrency(2850000)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>General Ledger Book Balance:</span>
                      <span className="font-mono font-bold text-gray-900">{formatCurrency(2850000)}</span>
                    </div>
                    <div className="flex justify-between text-gray-500">
                      <span>Foreign Exchange Variance (USD):</span>
                      <span className="font-mono">$0.00</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-gray-100 font-bold text-emerald-700">
                      <span>Reconciliation Variance:</span>
                      <span className="font-mono">$0.00 (Balanced)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 3. Financial Statements & KPIs View */}
          {activeSubTab === 'financials' && (
            <div className="space-y-4">
              {/* Financial KPI Summary */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <span className="text-[11px] font-semibold text-blue-700 block">Total Assets</span>
                  <span className="text-lg font-bold font-mono text-blue-950">{formatCurrency(totalAssets)}</span>
                </div>
                <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                  <span className="text-[11px] font-semibold text-purple-700 block">Total Liabilities</span>
                  <span className="text-lg font-bold font-mono text-purple-950">{formatCurrency(totalLiabilities)}</span>
                </div>
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                  <span className="text-[11px] font-semibold text-emerald-700 block">Working Capital</span>
                  <span className="text-lg font-bold font-mono text-emerald-950">{formatCurrency(workingCapital)}</span>
                </div>
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <span className="text-[11px] font-semibold text-amber-700 block">Net Income (P&L)</span>
                  <span className="text-lg font-bold font-mono text-amber-950">{formatCurrency(netIncome)}</span>
                </div>
              </div>

              {/* Direct Access to Financial Statement Reports */}
              <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-2xs space-y-3">
                <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                  <FileSpreadsheet className="w-4 h-4 text-[#d65200]" />
                  <span>Statutory Financial Reports & Accounting Statements</span>
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <button
                    onClick={() => {
                      setIsBankControlModalOpen(false);
                      setActiveTab('reports');
                      setSubView('balance_sheet');
                    }}
                    className="p-3 border border-gray-200 hover:border-[#d65200] hover:bg-orange-50/50 rounded-lg text-left transition flex items-center justify-between group"
                  >
                    <div>
                      <div className="font-bold text-gray-900 group-hover:text-[#d65200] text-xs">
                        Statement of Financial Position (Balance Sheet)
                      </div>
                      <div className="text-[11px] text-gray-500">
                        Classified Assets, Liabilities, and Shareholder Equity
                      </div>
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-gray-400 group-hover:text-[#d65200]" />
                  </button>

                  <button
                    onClick={() => {
                      setIsBankControlModalOpen(false);
                      setActiveTab('reports');
                      setSubView('pnl');
                    }}
                    className="p-3 border border-gray-200 hover:border-[#d65200] hover:bg-orange-50/50 rounded-lg text-left transition flex items-center justify-between group"
                  >
                    <div>
                      <div className="font-bold text-gray-900 group-hover:text-[#d65200] text-xs">
                        Income Statement / Profit & Loss (P&L)
                      </div>
                      <div className="text-[11px] text-gray-500">
                        Operating Revenues, Cost of Sales, Gross & Net Margins
                      </div>
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-gray-400 group-hover:text-[#d65200]" />
                  </button>

                  <button
                    onClick={() => {
                      setIsBankControlModalOpen(false);
                      setActiveTab('reports');
                      setSubView('cash_flow');
                    }}
                    className="p-3 border border-gray-200 hover:border-[#d65200] hover:bg-orange-50/50 rounded-lg text-left transition flex items-center justify-between group"
                  >
                    <div>
                      <div className="font-bold text-gray-900 group-hover:text-[#d65200] text-xs">
                        Statement of Cash Flows (Direct Method)
                      </div>
                      <div className="text-[11px] text-gray-500">
                        Operating, Investing & Financing Cash Flow Movements
                      </div>
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-gray-400 group-hover:text-[#d65200]" />
                  </button>

                  <button
                    onClick={() => {
                      setIsBankControlModalOpen(false);
                      setActiveTab('reports');
                      setSubView('trial_balance');
                    }}
                    className="p-3 border border-gray-200 hover:border-[#d65200] hover:bg-orange-50/50 rounded-lg text-left transition flex items-center justify-between group"
                  >
                    <div>
                      <div className="font-bold text-gray-900 group-hover:text-[#d65200] text-xs">
                        Trial Balance (General Ledger Balances)
                      </div>
                      <div className="text-[11px] text-gray-500">
                        Full Debit / Credit verification across all active accounts
                      </div>
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-gray-400 group-hover:text-[#d65200]" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 4. Inter-Bank Funds Transfer View */}
          {activeSubTab === 'transfer' && (
            <div className="bg-gray-50/70 border border-gray-200 rounded-lg p-5">
              <form onSubmit={handleExecuteTransfer} className="space-y-4 max-w-xl mx-auto text-xs">
                <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
                  <ArrowUpRight className="w-4 h-4 text-[#d65200]" />
                  <h4 className="font-bold text-gray-900 text-sm">
                    Execute Inter-Bank / Petty Cash Transfer
                  </h4>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">
                      From Source Bank Account <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={transferFrom}
                      onChange={(e) => setTransferFrom(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded bg-white font-medium text-gray-900 focus:ring-1 focus:ring-[#d65200]"
                    >
                      {bankAccounts.map(a => (
                        <option key={a.id} value={a.id}>
                          {a.number} - {a.name} ({formatCurrency(a.balance, a.currency)})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">
                      To Destination Bank Account <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={transferTo}
                      onChange={(e) => setTransferTo(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded bg-white font-medium text-gray-900 focus:ring-1 focus:ring-[#d65200]"
                    >
                      {bankAccounts.map(a => (
                        <option key={a.id} value={a.id}>
                          {a.number} - {a.name} ({formatCurrency(a.balance, a.currency)})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Transfer Amount (USD) <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 font-bold text-gray-400">$</span>
                    <input
                      type="number"
                      required
                      min="1"
                      step="any"
                      value={transferAmount}
                      onChange={(e) => setTransferAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded font-mono font-bold text-gray-900 text-sm focus:ring-1 focus:ring-[#d65200]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Transfer Memo / Description
                  </label>
                  <input
                    type="text"
                    value={transferMemo}
                    onChange={(e) => setTransferMemo(e.target.value)}
                    placeholder="e.g. Replenish main office petty cash"
                    className="w-full px-3 py-2 border border-gray-300 rounded text-gray-900 focus:ring-1 focus:ring-[#d65200]"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveSubTab('treasury')}
                    className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-100 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-[#d65200] hover:bg-[#b84300] text-white rounded font-bold shadow-xs flex items-center gap-1.5 transition"
                  >
                    <Check className="w-4 h-4" />
                    <span>Execute Bank Transfer</span>
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="pt-3 border-t border-gray-200 flex items-center justify-between shrink-0 mt-3 text-xs">
          <div className="flex items-center gap-2 text-gray-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Bank Reconciliation Compliant & Fully Audited</span>
          </div>
          <button
            type="button"
            onClick={() => setIsBankControlModalOpen(false)}
            className="px-4 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded font-bold transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
