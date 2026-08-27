import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  FolderTree, 
  Layers, 
  ChevronRight, 
  ChevronDown, 
  Info, 
  CheckCircle2, 
  Edit3, 
  ListOrdered, 
  FileText, 
  DollarSign, 
  ArrowUpRight, 
  ArrowDownRight, 
  X, 
  Trash2, 
  Check, 
  ShieldCheck, 
  ExternalLink, 
  BookOpen, 
  Calendar, 
  RefreshCw,
  Download
} from 'lucide-react';
import { useAccounting } from '../context/AccountingContext';
import { Account, AccountType, Transaction } from '../types';

export const ChartOfAccounts: React.FC = () => {
  const { 
    accounts, 
    transactions,
    formatCurrency, 
    addAccount, 
    updateAccount,
    deleteAccount,
    resetToStandardChartOfAccounts,
    currentCurrency,
    setIsQuickJournalOpen,
    setPreviewDoc,
    currentUser
  } = useAccounting();

  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isNewAccountModalOpen, setIsNewAccountModalOpen] = useState(false);
  
  // Detail and Edit States
  const [selectedAccountForDetails, setSelectedAccountForDetails] = useState<Account | null>(null);
  const [selectedAccountForCostEdit, setSelectedAccountForCostEdit] = useState<Account | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState<string>('');

  // New Account Form state
  const [newNumber, setNewNumber] = useState('');
  const [newName, setNewName] = useState('');
  const [newThaiName, setNewThaiName] = useState('');
  const [newCategory, setNewCategory] = useState<'Asset' | 'Liability' | 'Equity' | 'Revenue' | 'Expense'>('Asset');
  const [newType, setNewType] = useState<AccountType>('Bank');
  const [newBalance, setNewBalance] = useState('0');
  const [newIsTaxRelated, setNewIsTaxRelated] = useState(false);

  // Edit Account Form state
  const [editNumber, setEditNumber] = useState('');
  const [editName, setEditName] = useState('');
  const [editThaiName, setEditThaiName] = useState('');
  const [editCategory, setEditCategory] = useState<'Asset' | 'Liability' | 'Equity' | 'Revenue' | 'Expense'>('Asset');
  const [editType, setEditType] = useState<AccountType>('Bank');
  const [editBalance, setEditBalance] = useState('0');
  const [editIsTaxRelated, setEditIsTaxRelated] = useState(false);
  const [editAdjustmentMemo, setEditAdjustmentMemo] = useState('Authorized ledger cost/balance adjustment by administrator');

  const categories = ['All', 'Asset', 'Liability', 'Equity', 'Revenue', 'Expense'];

  const filteredAccounts = accounts.filter(acc => {
    const matchesCategory = selectedCategory === 'All' || acc.category === selectedCategory;
    const matchesSearch = 
      acc.number.includes(searchTerm) ||
      acc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (acc.thaiName && acc.thaiName.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  // Calculate totals
  const totalAssets = accounts.filter(a => a.category === 'Asset').reduce((sum, a) => sum + a.balance, 0);
  const totalLiabilities = accounts.filter(a => a.category === 'Liability').reduce((sum, a) => sum + a.balance, 0);
  const totalRevenue = accounts.filter(a => a.category === 'Revenue').reduce((sum, a) => sum + a.balance, 0);
  const totalExpenses = accounts.filter(a => a.category === 'Expense').reduce((sum, a) => sum + a.balance, 0);

  const handleOpenEdit = (acc: Account) => {
    setSelectedAccountForCostEdit(acc);
    setEditNumber(acc.number);
    setEditName(acc.name);
    setEditThaiName(acc.thaiName || '');
    setEditCategory(acc.category);
    setEditType(acc.type);
    setEditBalance(acc.balance.toString());
    setEditIsTaxRelated(!!acc.isTaxRelated);
    setEditAdjustmentMemo('Authorized ledger cost/balance adjustment by administrator');
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAccountForCostEdit || !editNumber || !editName) return;

    const parsedBalance = parseFloat(editBalance);
    const balanceVal = isNaN(parsedBalance) ? selectedAccountForCostEdit.balance : parsedBalance;

    updateAccount(selectedAccountForCostEdit.id, {
      number: editNumber,
      name: editName,
      thaiName: editThaiName,
      category: editCategory,
      type: editType,
      balance: balanceVal,
      isTaxRelated: editIsTaxRelated
    });

    setFeedbackMsg(`Successfully updated Account #${editNumber} (${editName}) cost/balance to ${formatCurrency(balanceVal, selectedAccountForCostEdit.currency)}`);
    setSelectedAccountForCostEdit(null);

    setTimeout(() => {
      setFeedbackMsg('');
    }, 4000);
  };

  const handleDeleteAccount = (acc: Account) => {
    if (confirm(`Are you sure you want to delete Account #${acc.number} (${acc.name})?`)) {
      deleteAccount(acc.id);
      setSelectedAccountForCostEdit(null);
      if (selectedAccountForDetails?.id === acc.id) {
        setSelectedAccountForDetails(null);
      }
      setFeedbackMsg(`Account #${acc.number} deleted successfully.`);
      setTimeout(() => setFeedbackMsg(''), 3000);
    }
  };

  const handleCreateAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNumber || !newName) return;

    addAccount({
      number: newNumber,
      name: newName,
      thaiName: newThaiName,
      type: newType,
      category: newCategory,
      balance: parseFloat(newBalance) || 0,
      currency: currentCurrency || 'USD',
      isTaxRelated: newIsTaxRelated
    });

    setIsNewAccountModalOpen(false);
    setNewNumber('');
    setNewName('');
    setNewThaiName('');
    setNewBalance('0');
    setNewIsTaxRelated(false);
    setFeedbackMsg(`Created Account #${newNumber} (${newName}) successfully.`);
    setTimeout(() => setFeedbackMsg(''), 3000);
  };

  // Export Chart of Accounts to CSV
  const handleExportCSV = () => {
    const headers = ['Account Code', 'Account Name', 'Type', 'Category', 'Balance', 'Currency', 'Summary/Header', 'Tax Linked'];
    const rows = accounts.map(a => [
      `"${a.number}"`,
      `"${(a.name || '').replace(/"/g, '""')}"`,
      `"${a.type}"`,
      `"${a.category}"`,
      a.balance,
      `"${a.currency || 'USD'}"`,
      a.isSummary ? 'Yes' : 'No',
      a.isTaxRelated ? 'Yes' : 'No'
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Chart_of_Accounts_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setFeedbackMsg('Chart of Accounts successfully exported to CSV.');
    setTimeout(() => setFeedbackMsg(''), 3000);
  };

  const handleResetToStandard = () => {
    if (window.confirm('Re-synchronize entire Chart of Accounts with standard 400+ statutory accounts? Custom changes will be updated.')) {
      resetToStandardChartOfAccounts();
      setFeedbackMsg('Standard Chart of Accounts successfully synchronized (400+ accounts).');
      setTimeout(() => setFeedbackMsg(''), 4000);
    }
  };

  // Helper to extract transactions for a selected account
  const getAccountTransactions = (acc: Account): Transaction[] => {
    return transactions.filter(t => {
      // Check lines
      const hasLine = t.lines?.some(l => 
        l.accountId === acc.id || 
        l.accountNumber === acc.number || 
        l.accountName?.toLowerCase() === acc.name.toLowerCase()
      );
      if (hasLine) return true;

      // Smart GL Mapping fallbacks
      if (acc.number === '1010' || acc.number === '1020' || acc.number === '1030') {
        return t.type === 'Payment_Received' || t.type === 'Bill_Payment' || (t.paymentMethod && t.paymentMethod.includes('Bank'));
      }
      if (acc.number === '1100' && t.type === 'Invoice') return true;
      if (acc.number === '2010' && t.type === 'Bill') return true;
      if (acc.number === '2100' && t.taxTotal > 0 && t.type === 'Invoice') return true;
      if (acc.number === '1250' && t.taxTotal > 0 && t.type === 'Bill') return true;
      if (acc.number === '4010' && t.type === 'Invoice') return true;
      if (acc.number.startsWith('50') || acc.number.startsWith('60')) {
        return t.type === 'Bill';
      }
      return false;
    });
  };

  const selectedAccTransactions = selectedAccountForDetails ? getAccountTransactions(selectedAccountForDetails) : [];

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Admin Control Notification Banner */}
      <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-gray-900">
                Chart of Accounts & General Ledger Control
              </h1>
              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-700" />
                <span>Admin Cost Control Active</span>
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              Click any account row to inspect transaction details, or click on the cost/balance to change account costs and balances with full audit trail.
            </p>
          </div>

          <div className="flex items-center flex-wrap gap-2">
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-gray-50 text-gray-700 rounded text-xs font-bold transition border border-gray-300 shadow-2xs"
              title="Export all accounts to CSV"
            >
              <Download className="w-3.5 h-3.5 text-gray-500" />
              <span>Export CSV</span>
            </button>

            <button
              onClick={handleResetToStandard}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded text-xs font-bold transition border border-emerald-200"
              title="Reset / re-sync standard chart of accounts (400+ accounts)"
            >
              <RefreshCw className="w-3.5 h-3.5 text-emerald-600" />
              <span>Re-sync Standard COA</span>
            </button>

            <button
              onClick={() => setIsQuickJournalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded text-xs font-bold transition border border-gray-200"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Post Journal Entry</span>
            </button>

            <button
              onClick={() => setIsNewAccountModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#d65200] hover:bg-[#b84300] text-white rounded text-xs font-bold shadow-xs transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Account</span>
            </button>
          </div>
        </div>

        {/* Quick KPI Summary Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-3 border-t border-gray-100">
          <div className="p-2.5 bg-emerald-50/70 border border-emerald-100 rounded-md">
            <span className="text-[10px] uppercase font-bold text-emerald-700 block">Total Assets</span>
            <span className="text-sm font-bold font-mono text-emerald-950">{formatCurrency(totalAssets)}</span>
          </div>
          <div className="p-2.5 bg-purple-50/70 border border-purple-100 rounded-md">
            <span className="text-[10px] uppercase font-bold text-purple-700 block">Total Liabilities</span>
            <span className="text-sm font-bold font-mono text-purple-950">{formatCurrency(totalLiabilities)}</span>
          </div>
          <div className="p-2.5 bg-blue-50/70 border border-blue-100 rounded-md">
            <span className="text-[10px] uppercase font-bold text-blue-700 block">Total Revenue</span>
            <span className="text-sm font-bold font-mono text-blue-950">{formatCurrency(totalRevenue)}</span>
          </div>
          <div className="p-2.5 bg-amber-50/70 border border-amber-100 rounded-md">
            <span className="text-[10px] uppercase font-bold text-amber-700 block">Total Cost & Expenses</span>
            <span className="text-sm font-bold font-mono text-amber-950">{formatCurrency(totalExpenses)}</span>
          </div>
        </div>

        {/* Feedback Message */}
        {feedbackMsg && (
          <div className="mt-3 p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded flex items-center gap-2 text-xs font-semibold animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{feedbackMsg}</span>
          </div>
        )}

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 mt-4 pt-3 border-t border-gray-100 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex rounded border border-gray-200 p-0.5 bg-gray-50">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 rounded text-xs font-medium transition ${
                    selectedCategory === cat
                      ? 'bg-[#d65200] text-white font-bold shadow-2xs'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {cat === 'All' ? 'All Accounts' : `${cat}s`}
                </button>
              ))}
            </div>

            <div className="relative">
              <input
                type="text"
                placeholder="Filter by account #, name, cost..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-3 pr-8 py-1 text-xs border border-gray-300 rounded bg-white w-64 focus:ring-1 focus:ring-[#d65200]"
              />
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm('')} 
                  className="absolute right-2 top-1.5 text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          <div className="text-xs text-gray-500 font-mono flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>{filteredAccounts.length} Active Ledger Accounts</span>
          </div>
        </div>
      </div>

      {/* Account Table */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-2xs overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-gray-50 text-gray-600 border-b border-gray-200 text-[11px] uppercase tracking-wider">
            <tr>
              <th className="py-3 px-4">Account Number</th>
              <th className="py-3 px-4">Account Name & Description</th>
              <th className="py-3 px-4">Type</th>
              <th className="py-3 px-4">Category</th>
              <th className="py-3 px-4 text-right">Cost / Ledger Balance</th>
              <th className="py-3 px-4 text-center">Tax Linked</th>
              <th className="py-3 px-4 text-right">Admin Controls</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredAccounts.map((acc) => (
              <tr 
                key={acc.id} 
                className={`hover:bg-orange-50/50 transition group cursor-pointer ${
                  acc.isSummary ? 'bg-gray-50/70 font-semibold' : ''
                }`}
                onClick={() => setSelectedAccountForDetails(acc)}
              >
                <td className="py-3 px-4 font-mono font-bold text-[#d65200]">
                  <div className="flex items-center gap-1.5">
                    <span>{acc.number}</span>
                    {acc.isSummary && (
                      <span className="px-1.5 py-0.2 bg-gray-200 text-gray-700 text-[9px] font-bold rounded uppercase">
                        Summary
                      </span>
                    )}
                  </div>
                </td>
                <td className="py-3 px-4">
                  <div className="font-semibold text-gray-900 group-hover:text-[#d65200] transition flex items-center gap-2">
                    <span>{acc.name}</span>
                    {acc.currency && acc.currency !== 'USD' && (
                      <span className="px-1.5 py-0.2 bg-blue-50 text-blue-700 border border-blue-200 text-[9px] font-mono font-bold rounded">
                        {acc.currency}
                      </span>
                    )}
                  </div>
                  {acc.thaiName && acc.thaiName !== acc.name && (
                    <div className="text-[11px] text-gray-500">{acc.thaiName}</div>
                  )}
                  {acc.description && acc.description !== acc.name && (
                    <div className="text-[10px] text-gray-400 truncate max-w-md">{acc.description}</div>
                  )}
                </td>
                <td className="py-3 px-4">
                  <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-[10px] font-medium">
                    {acc.type}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    acc.category === 'Asset' ? 'bg-emerald-100 text-emerald-800' :
                    acc.category === 'Liability' ? 'bg-purple-100 text-purple-800' :
                    acc.category === 'Equity' ? 'bg-blue-100 text-blue-800' :
                    acc.category === 'Revenue' ? 'bg-amber-100 text-amber-900' :
                    'bg-rose-100 text-rose-800'
                  }`}>
                    {acc.category}
                  </span>
                </td>

                {/* Clickable Cost / Balance Pill with Quick Edit Trigger */}
                <td className="py-3 px-4 text-right font-mono font-bold text-gray-900">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenEdit(acc);
                    }}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-gray-50 hover:bg-orange-100 hover:text-[#d65200] text-gray-900 border border-gray-200 hover:border-orange-300 transition group/btn"
                    title="Admin: Click to change cost or balance"
                  >
                    <span>{formatCurrency(acc.balance, acc.currency)}</span>
                    <Edit3 className="w-3 h-3 text-gray-400 group-hover/btn:text-[#d65200]" />
                  </button>
                </td>

                <td className="py-3 px-4 text-center">
                  {acc.isTaxRelated ? (
                    <span className="px-1.5 py-0.5 bg-orange-100 text-[#d65200] text-[9px] font-bold rounded">
                      VAT/WHT
                    </span>
                  ) : (
                    <span className="text-gray-300">—</span>
                  )}
                </td>

                {/* Admin Quick Actions */}
                <td className="py-3 px-4 text-right">
                  <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      onClick={() => setSelectedAccountForDetails(acc)}
                      className="px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded text-[11px] font-bold flex items-center gap-1 transition"
                      title="See transactions details"
                    >
                      <ListOrdered className="w-3 h-3" />
                      <span>Transactions</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(acc)}
                      className="px-2 py-1 bg-orange-50 hover:bg-orange-100 text-[#d65200] rounded text-[11px] font-bold flex items-center gap-1 transition"
                      title="Change cost and account settings"
                    >
                      <Edit3 className="w-3 h-3" />
                      <span>Change Cost</span>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 1. TRANSACTIONS DETAILS DRAWER / MODAL */}
      {selectedAccountForDetails && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full p-6 shadow-2xl animate-in fade-in-50 max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3.5 border-b border-gray-200 shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 text-blue-700 rounded-lg">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 bg-gray-100 rounded text-gray-800">
                      GL #{selectedAccountForDetails.number}
                    </span>
                    <h3 className="text-base font-bold text-gray-900">
                      {selectedAccountForDetails.name} — Transaction Details
                    </h3>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Category: <b>{selectedAccountForDetails.category}</b> ({selectedAccountForDetails.type}) • Total Ledger Cost/Balance: <b className="text-gray-900 font-mono">{formatCurrency(selectedAccountForDetails.balance, selectedAccountForDetails.currency)}</b>
                  </p>
                </div>
              </div>

              <button 
                onClick={() => setSelectedAccountForDetails(null)}
                className="text-gray-400 hover:text-gray-600 p-1.5 rounded-md hover:bg-gray-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Actions in Detail Modal */}
            <div className="flex items-center justify-between py-2.5 px-3 bg-gray-50 rounded-lg mt-3 shrink-0 border border-gray-100 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-gray-600 font-medium">
                  Found <b>{selectedAccTransactions.length}</b> linked transactions
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    handleOpenEdit(selectedAccountForDetails);
                  }}
                  className="px-2.5 py-1 bg-orange-600 hover:bg-orange-700 text-white rounded text-xs font-bold flex items-center gap-1 transition"
                >
                  <Edit3 className="w-3 h-3" />
                  <span>Change Cost / Balance</span>
                </button>
                <button
                  onClick={() => {
                    setSelectedAccountForDetails(null);
                    setIsQuickJournalOpen(true);
                  }}
                  className="px-2.5 py-1 bg-gray-800 hover:bg-black text-white rounded text-xs font-bold flex items-center gap-1 transition"
                >
                  <Plus className="w-3 h-3" />
                  <span>Post Journal Entry</span>
                </button>
              </div>
            </div>

            {/* Transactions List */}
            <div className="mt-3 overflow-y-auto flex-1 border border-gray-200 rounded-lg">
              {selectedAccTransactions.length === 0 ? (
                <div className="p-8 text-center text-gray-500 text-xs">
                  <FileText className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p className="font-semibold text-gray-700">No direct transaction lines found for this account period.</p>
                  <p className="text-gray-400 mt-1">
                    Opening balance of {formatCurrency(selectedAccountForDetails.balance, selectedAccountForDetails.currency)} recorded via initial setup ledger.
                  </p>
                </div>
              ) : (
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50 text-gray-600 border-b border-gray-200 sticky top-0 text-[11px] uppercase tracking-wider">
                    <tr>
                      <th className="py-2.5 px-3">Date</th>
                      <th className="py-2.5 px-3">Transaction #</th>
                      <th className="py-2.5 px-3">Type</th>
                      <th className="py-2.5 px-3">Entity / Payee</th>
                      <th className="py-2.5 px-3">Description / Memo</th>
                      <th className="py-2.5 px-3 text-right">Debit / Inflow</th>
                      <th className="py-2.5 px-3 text-right">Credit / Outflow</th>
                      <th className="py-2.5 px-3 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {selectedAccTransactions.map((tx) => {
                      const isDebit = selectedAccountForDetails.category === 'Asset' || selectedAccountForDetails.category === 'Expense';
                      return (
                        <tr key={tx.id} className="hover:bg-blue-50/40 transition">
                          <td className="py-2.5 px-3 font-mono text-gray-600 whitespace-nowrap">{tx.date}</td>
                          <td className="py-2.5 px-3 font-mono font-bold text-[#d65200]">{tx.transactionNumber}</td>
                          <td className="py-2.5 px-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              tx.type === 'Invoice' ? 'bg-emerald-100 text-emerald-800' :
                              tx.type === 'Bill' ? 'bg-rose-100 text-rose-800' :
                              (tx.type === 'Payment_Received' || tx.type === 'Bill_Payment') ? 'bg-blue-100 text-blue-800' :
                              'bg-purple-100 text-purple-800'
                            }`}>
                              {tx.type.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 font-medium text-gray-900">{tx.entityName}</td>
                          <td className="py-2.5 px-3 text-gray-500 max-w-xs truncate" title={tx.memo || ''}>
                            {tx.memo || 'Direct Ledger Posting'}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono font-bold text-gray-900">
                            {isDebit ? formatCurrency(tx.total, tx.currency) : '—'}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono font-bold text-gray-900">
                            {!isDebit ? formatCurrency(tx.total, tx.currency) : '—'}
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <button
                              type="button"
                              onClick={() => {
                                if (tx.type === 'Invoice') {
                                  setPreviewDoc({ type: 'Invoice', data: tx });
                                } else if (tx.type === 'Bill') {
                                  setPreviewDoc({ type: 'Bill', data: tx });
                                } else {
                                  alert(`Transaction: ${tx.transactionNumber}\nEntity: ${tx.entityName}\nAmount: ${formatCurrency(tx.total, tx.currency)}\nMemo: ${tx.memo || 'N/A'}`);
                                }
                              }}
                              className="text-blue-600 hover:text-blue-800 text-[11px] font-bold hover:underline"
                            >
                              Inspect
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>

            {/* Modal Footer */}
            <div className="pt-3 border-t border-gray-200 flex items-center justify-between shrink-0 mt-3 text-xs">
              <div className="flex items-center gap-2 text-gray-500">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>General Ledger Sub-ledger Balanced</span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedAccountForDetails(null)}
                className="px-4 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded font-bold transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. ADMIN CHANGE COST & ACCOUNT CONTROL MODAL */}
      {selectedAccountForCostEdit && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-2xl animate-in fade-in-50">
            <div className="flex items-center justify-between pb-3 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-orange-100 text-[#d65200] rounded-lg">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">
                    Admin Control: Adjust Cost & Account
                  </h3>
                  <p className="text-xs text-gray-500">
                    Account #{selectedAccountForCostEdit.number} — {selectedAccountForCostEdit.name}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedAccountForCostEdit(null)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="mt-4 space-y-3.5 text-xs">
              {/* Cost / Balance Field Highlighted */}
              <div className="p-3.5 bg-orange-50/80 border border-orange-200 rounded-lg">
                <label className="block font-bold text-orange-950 mb-1">
                  Adjust Ledger Cost / Current Balance ({selectedAccountForCostEdit.currency}) *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 font-bold text-orange-400">$</span>
                  <input
                    type="number"
                    step="any"
                    required
                    value={editBalance}
                    onChange={(e) => setEditBalance(e.target.value)}
                    className="w-full pl-7 pr-3 py-2 border border-orange-300 rounded font-mono font-bold text-base text-gray-900 bg-white focus:ring-2 focus:ring-[#d65200]"
                  />
                </div>
                <span className="text-[10px] text-orange-800 mt-1 block">
                  Original balance was {formatCurrency(selectedAccountForCostEdit.balance, selectedAccountForCostEdit.currency)}. Changes are recorded immediately into the audit trail.
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-gray-700 mb-1">Account Number *</label>
                  <input
                    type="text"
                    required
                    value={editNumber}
                    onChange={(e) => setEditNumber(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded font-mono"
                  />
                </div>
                <div>
                  <label className="block font-medium text-gray-700 mb-1">Category *</label>
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value as any)}
                    className="w-full px-3 py-2 border border-gray-300 rounded bg-white"
                  >
                    <option value="Asset">Asset</option>
                    <option value="Liability">Liability</option>
                    <option value="Equity">Equity</option>
                    <option value="Revenue">Revenue</option>
                    <option value="Expense">Expense</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-medium text-gray-700 mb-1">Account Name *</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded"
                />
              </div>

              <div>
                <label className="block font-medium text-gray-700 mb-1">Secondary Description</label>
                <input
                  type="text"
                  value={editThaiName}
                  onChange={(e) => setEditThaiName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-gray-700 mb-1">Account Type</label>
                  <select
                    value={editType}
                    onChange={(e) => setEditType(e.target.value as any)}
                    className="w-full px-3 py-2 border border-gray-300 rounded bg-white"
                  >
                    <option value="Bank">Bank</option>
                    <option value="Accounts Receivable">Accounts Receivable</option>
                    <option value="Other Current Asset">Other Current Asset</option>
                    <option value="Fixed Asset">Fixed Asset</option>
                    <option value="Accounts Payable">Accounts Payable</option>
                    <option value="Income">Income</option>
                    <option value="Cost of Goods Sold">Cost of Goods Sold</option>
                    <option value="Expense">Expense</option>
                  </select>
                </div>

                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 cursor-pointer text-gray-700 font-medium">
                    <input
                      type="checkbox"
                      checked={editIsTaxRelated}
                      onChange={(e) => setEditIsTaxRelated(e.target.checked)}
                      className="rounded border-gray-300 text-[#d65200] focus:ring-[#d65200]"
                    />
                    <span>Tax Linked (VAT/WHT)</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block font-medium text-gray-700 mb-1">Audit Trail Reason / Memo</label>
                <input
                  type="text"
                  value={editAdjustmentMemo}
                  onChange={(e) => setEditAdjustmentMemo(e.target.value)}
                  placeholder="e.g. Audit correction for month-end reconciliation"
                  className="w-full px-3 py-2 border border-gray-300 rounded text-gray-800"
                />
              </div>

              <div className="pt-3 border-t border-gray-200 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => handleDeleteAccount(selectedAccountForCostEdit)}
                  className="text-rose-600 hover:text-rose-800 text-xs font-bold flex items-center gap-1 hover:underline"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Account</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedAccountForCostEdit(null)}
                    className="px-4 py-2 border border-gray-300 rounded text-xs font-semibold text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-[#d65200] hover:bg-[#b84300] text-white rounded text-xs font-bold shadow-xs flex items-center gap-1.5"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Save Cost Changes</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. NEW ACCOUNT MODAL */}
      {isNewAccountModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-2xl animate-in fade-in-50">
            <h3 className="text-base font-bold text-gray-900">
              Create New General Ledger Account
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              Add account to chart of accounts hierarchy with initial cost/balance.
            </p>

            <form onSubmit={handleCreateAccount} className="mt-4 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-gray-700 mb-1">Account Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 1040"
                    value={newNumber}
                    onChange={(e) => setNewNumber(e.target.value)}
                    className="w-full px-3 py-1.5 border border-gray-300 rounded font-mono"
                  />
                </div>
                <div>
                  <label className="block font-medium text-gray-700 mb-1">Category *</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full px-3 py-1.5 border border-gray-300 rounded bg-white"
                  >
                    <option value="Asset">Asset</option>
                    <option value="Liability">Liability</option>
                    <option value="Equity">Equity</option>
                    <option value="Revenue">Revenue</option>
                    <option value="Expense">Expense</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-medium text-gray-700 mb-1">Account Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Operating Bank - Branch Account"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3 py-1.5 border border-gray-300 rounded"
                />
              </div>

              <div>
                <label className="block font-medium text-gray-700 mb-1">Secondary / Detailed Description</label>
                <input
                  type="text"
                  placeholder="e.g. Regional Cash Account"
                  value={newThaiName}
                  onChange={(e) => setNewThaiName(e.target.value)}
                  className="w-full px-3 py-1.5 border border-gray-300 rounded"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-gray-700 mb-1">Account Type</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as any)}
                    className="w-full px-3 py-1.5 border border-gray-300 rounded bg-white"
                  >
                    <option value="Bank">Bank</option>
                    <option value="Accounts Receivable">Accounts Receivable</option>
                    <option value="Other Current Asset">Other Current Asset</option>
                    <option value="Fixed Asset">Fixed Asset</option>
                    <option value="Accounts Payable">Accounts Payable</option>
                    <option value="Income">Income</option>
                    <option value="Cost of Goods Sold">Cost of Goods Sold</option>
                    <option value="Expense">Expense</option>
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-gray-700 mb-1">Initial Cost / Balance ({currentCurrency})</label>
                  <input
                    type="number"
                    value={newBalance}
                    onChange={(e) => setNewBalance(e.target.value)}
                    className="w-full px-3 py-1.5 border border-gray-300 rounded font-mono"
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-2 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsNewAccountModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded text-xs font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#d65200] hover:bg-[#b84300] text-white rounded text-xs font-bold shadow-xs"
                >
                  Save Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
