import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  CheckCircle, 
  DollarSign, 
  Calendar, 
  FileText, 
  BookOpen, 
  Receipt,
  Download,
  CheckCircle2,
  Clock,
  Ban,
  Edit3,
  Trash2,
  ShieldCheck,
  AlertTriangle,
  X,
  Check,
  TrendingUp,
  Scale,
  CheckSquare,
  Square,
  Sliders,
  ChevronLeft,
  ChevronRight,
  ListChecks,
  CheckCheck,
  Layers
} from 'lucide-react';
import { useAccounting } from '../context/AccountingContext';
import { Transaction, TransactionType, TransactionStatus } from '../types';
import { SuiteSublistPlatform, ExpenseSublistLine, ItemSublistLine } from './SuiteSublistPlatform';

export const TransactionsList: React.FC = () => {
  const { 
    transactions, 
    formatCurrency, 
    activeTab,
    setActiveTab,
    subView, 
    setSubView, 
    searchQuery, 
    setIsQuickInvoiceOpen, 
    setIsQuickJournalOpen, 
    setPreviewDoc,
    recordPayment,
    updateTransactionStatus,
    updateTransaction,
    deleteTransaction,
    currentUser,
    hasPermission,
    vendors,
    accounts,
    addTransaction,
    currentCurrency
  } = useAccounting();

  // Suite Sublist Modal State
  const [isSuiteSublistModalOpen, setIsSuiteSublistModalOpen] = useState<boolean>(false);
  const [suiteVendorId, setSuiteVendorId] = useState<string>(vendors[0]?.id || '');
  const [suiteBillNumber, setSuiteBillNumber] = useState<string>(`BILL-2026-${Math.floor(1000 + Math.random() * 9000)}`);
  const [suitePostingDate, setSuitePostingDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [suiteDueDate, setSuiteDueDate] = useState<string>(new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]);
  const [suiteMemo, setSuiteMemo] = useState<string>('Vendor Bill with Expenses & Items breakdown');
  const [suiteExpenses, setSuiteExpenses] = useState<ExpenseSublistLine[]>([]);
  const [suiteItems, setSuiteItems] = useState<ItemSublistLine[]>([]);
  const [suiteSubtotal, setSuiteSubtotal] = useState<number>(0);
  const [suiteTaxTotal, setSuiteTaxTotal] = useState<number>(0);
  const [suiteGrossTotal, setSuiteGrossTotal] = useState<number>(0);

  const handleOpenSuiteModal = () => {
    setSuiteBillNumber(`BILL-2026-${Math.floor(1000 + Math.random() * 9000)}`);
    setSuiteVendorId(vendors[0]?.id || '');
    setIsSuiteSublistModalOpen(true);
  };

  const handleSaveSuiteBillFromList = (e: React.FormEvent) => {
    e.preventDefault();
    const vendor = vendors.find(v => v.id === suiteVendorId) || vendors[0];
    if (!vendor) return;

    const finalSubtotal = suiteSubtotal > 0 ? suiteSubtotal : 4700;
    const finalTax = suiteTaxTotal > 0 ? suiteTaxTotal : (finalSubtotal * 0.07);
    const finalGross = suiteGrossTotal > 0 ? suiteGrossTotal : (finalSubtotal + finalTax);

    const createdTx = addTransaction({
      transactionNumber: suiteBillNumber,
      type: 'Bill',
      date: suitePostingDate,
      dueDate: suiteDueDate,
      postingPeriod: 'Aug 2026',
      entityId: vendor.id,
      entityName: vendor.companyName,
      entityType: 'Vendor',
      status: 'Approved',
      currency: currentCurrency || 'USD',
      exchangeRate: 1.0,
      subtotal: finalSubtotal,
      taxTotal: finalTax,
      total: finalGross,
      amountPaid: 0,
      balanceDue: finalGross,
      memo: suiteMemo,
      department: suiteExpenses[0]?.department || 'Tour Operations',
      subsidiary: 'Small Business Co., Ltd.',
      items: [
        ...suiteExpenses.map(exp => ({
          id: exp.id,
          description: `[${exp.category}] ${exp.memo || exp.accountName}`,
          quantity: 1,
          unitPrice: exp.amount,
          amount: exp.amount,
          taxCodeId: exp.taxCodeId,
          taxRate: exp.taxRate,
          taxAmount: exp.taxAmount,
          grossAmount: exp.grossAmount,
          accountNumber: exp.accountNumber,
          department: exp.department,
          serviceType: exp.serviceType,
          branch: exp.branch
        })),
        ...suiteItems.map(item => ({
          id: item.id,
          description: `${item.itemCode} - ${item.itemName}`,
          quantity: item.quantity,
          unitPrice: item.rate,
          amount: item.amount,
          taxCodeId: item.taxCodeId,
          taxRate: item.taxRate,
          taxAmount: item.taxAmount,
          grossAmount: item.grossAmount,
          department: item.department,
          serviceType: item.serviceType,
          branch: item.branch
        }))
      ],
      journalLines: [
        ...suiteExpenses.map(exp => ({
          id: `jl-exp-${exp.id}`,
          accountId: exp.accountId,
          accountNumber: exp.accountNumber,
          accountName: exp.accountName,
          debit: exp.amount,
          credit: 0,
          memo: exp.memo || exp.category
        })),
        ...(finalTax > 0 ? [{
          id: `jl-tax-${Date.now()}`,
          accountId: accounts.find(a => a.number === '1150')?.id || accounts[0].id,
          accountNumber: '1150',
          accountName: 'Input VAT Receivable (7%)',
          debit: finalTax,
          credit: 0,
          memo: 'Input VAT on vendor purchase bill'
        }] : []),
        {
          id: `jl-ap-${Date.now()}`,
          accountId: accounts.find(a => a.number === '2010')?.id || accounts[1].id,
          accountNumber: '2010',
          accountName: 'Accounts Payable (A/P)',
          debit: 0,
          credit: finalGross,
          memo: `A/P liability to ${vendor.companyName}`
        }
      ]
    });

    setIsSuiteSublistModalOpen(false);
    setBatchToastMessage(`Successfully posted Bill ${createdTx.transactionNumber} (${formatCurrency(createdTx.total)})`);
    setTimeout(() => setBatchToastMessage(null), 3500);
  };

  const [filterType, setFilterType] = useState<string>('All');
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [filterMonth, setFilterMonth] = useState<string>('All');
  const [selectedTxForPayment, setSelectedTxForPayment] = useState<Transaction | null>(null);
  const [payAmount, setPayAmount] = useState<string>('');

  // Selected Transactions State
  const [selectedTxIds, setSelectedTxIds] = useState<string[]>([]);
  const [isBatchEditOpen, setIsBatchEditOpen] = useState<boolean>(false);
  const [batchEditTab, setBatchEditTab] = useState<'batch' | 'step'>('batch');
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [batchDeleteConfirmOpen, setBatchDeleteConfirmOpen] = useState<boolean>(false);

  // Batch Form State
  const [batchStatus, setBatchStatus] = useState<string>('no_change');
  const [batchDate, setBatchDate] = useState<string>('');
  const [batchDueDate, setBatchDueDate] = useState<string>('');
  const [batchMemoAction, setBatchMemoAction] = useState<'no_change' | 'replace' | 'append'>('no_change');
  const [batchMemoText, setBatchMemoText] = useState<string>('');
  const [batchToastMessage, setBatchToastMessage] = useState<string | null>(null);

  // Admin / Individual Edit Transaction Modal State
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [editFormData, setEditFormData] = useState<{
    transactionNumber: string;
    entityName: string;
    date: string;
    dueDate: string;
    memo: string;
    total: number;
    taxTotal: number;
    status: TransactionStatus;
    originalInvoiceNumber: string;
    originalInvoiceDate: string;
    originalInvoiceAmount: number | '';
    originalInvoiceMemo: string;
  }>({
    transactionNumber: '',
    entityName: '',
    date: '',
    dueDate: '',
    memo: '',
    total: 0,
    taxTotal: 0,
    status: 'Approved',
    originalInvoiceNumber: '',
    originalInvoiceDate: '',
    originalInvoiceAmount: '',
    originalInvoiceMemo: '',
  });

  // Admin Delete Confirmation Modal State
  const [deletingTx, setDeletingTx] = useState<Transaction | null>(null);

  const isAdminOrAuthorized = Boolean(
    currentUser?.isAdmin || 
    hasPermission('admin_manage_users') || 
    hasPermission('gl_journal_posting')
  );

  React.useEffect(() => {
    if (subView === 'suite_platform') {
      setIsSuiteSublistModalOpen(true);
    }
  }, [subView]);

  // Sync with subView if requested from dropdown
  const effectiveType = 
    (subView === 'payable_vendors' || subView === 'bills') ? 'Bill' :
    (subView === 'sale' || subView === 'invoices') ? 'Invoice' :
    (subView === 'journal_entries' || subView === 'journals') ? 'Journal_Entry' :
    (subView === 'bank' || subView === 'payments') ? 'Payment' :
    filterType;

  const filtered = transactions.filter(t => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = 
      t.transactionNumber.toLowerCase().includes(q) ||
      t.entityName.toLowerCase().includes(q) ||
      (t.memo && t.memo.toLowerCase().includes(q)) ||
      t.items?.some(i => (i.accountNumber && i.accountNumber.includes(q)) || (i.description && i.description.toLowerCase().includes(q))) ||
      t.journalLines?.some(jl => (jl.accountNumber && jl.accountNumber.includes(q)) || (jl.accountName && jl.accountName.toLowerCase().includes(q)) || (jl.memo && jl.memo.toLowerCase().includes(q)));

    const matchesType = effectiveType === 'All' || t.type === effectiveType;
    const matchesStatus = filterStatus === 'All' || t.status === filterStatus;
    
    const matchesMonth = 
      filterMonth === 'All' ? true :
      filterMonth === '2026-03' ? (t.date.startsWith('2026-03') || (t.postingPeriod && t.postingPeriod.includes('Mar'))) :
      filterMonth === '2026-04' ? (t.date.startsWith('2026-04') || (t.postingPeriod && t.postingPeriod.includes('Apr'))) :
      filterMonth === '2026-05' ? (t.date.startsWith('2026-05') || (t.postingPeriod && t.postingPeriod.includes('May'))) :
      filterMonth === '2026-06' ? (t.date.startsWith('2026-06') || (t.postingPeriod && t.postingPeriod.includes('Jun'))) :
      filterMonth === '2026-07' ? (t.date.startsWith('2026-07') || (t.postingPeriod && t.postingPeriod.includes('Jul'))) :
      filterMonth === '2026-08' ? (t.date.startsWith('2026-08') || (t.postingPeriod && t.postingPeriod.includes('Aug'))) :
      true;

    return matchesSearch && matchesType && matchesStatus && matchesMonth;
  });

  // Selected transactions object list
  const selectedTransactions = transactions.filter(t => selectedTxIds.includes(t.id));

  // Selection handlers
  const handleToggleSelectAll = () => {
    if (selectedTxIds.length === filtered.length && filtered.length > 0) {
      setSelectedTxIds([]);
    } else {
      setSelectedTxIds(filtered.map(t => t.id));
    }
  };

  const handleToggleSelectRow = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSelectedTxIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleOpenPayment = (tx: Transaction) => {
    setSelectedTxForPayment(tx);
    setPayAmount(tx.balanceDue.toString());
  };

  const handleConfirmPayment = () => {
    if (!selectedTxForPayment) return;
    const amt = parseFloat(payAmount);
    if (isNaN(amt) || amt <= 0) {
      alert('Please enter a valid payment amount');
      return;
    }
    recordPayment(selectedTxForPayment.id, amt, 'Settled via Operating Bank Account (USD)');
    setSelectedTxForPayment(null);
  };

  const handleOpenEditModal = (tx: Transaction) => {
    setEditingTx(tx);
    setEditFormData({
      transactionNumber: tx.transactionNumber,
      entityName: tx.entityName,
      date: tx.date,
      dueDate: tx.dueDate || '',
      memo: tx.memo || '',
      total: tx.total,
      taxTotal: tx.taxTotal || 0,
      status: tx.status,
      originalInvoiceNumber: tx.originalInvoiceNumber || '',
      originalInvoiceDate: tx.originalInvoiceDate || '',
      originalInvoiceAmount: tx.originalInvoiceAmount || '',
      originalInvoiceMemo: tx.originalInvoiceMemo || '',
    });
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTx) return;

    if (!editFormData.entityName.trim()) {
      alert('Entity/Customer/Vendor name is required.');
      return;
    }

    if (editFormData.total <= 0) {
      alert('Total amount must be greater than 0.');
      return;
    }

    updateTransaction(editingTx.id, {
      transactionNumber: editFormData.transactionNumber,
      entityName: editFormData.entityName,
      date: editFormData.date,
      dueDate: editFormData.dueDate,
      memo: editFormData.memo,
      total: editFormData.total,
      taxTotal: editFormData.taxTotal,
      status: editFormData.status,
      originalInvoiceNumber: editFormData.originalInvoiceNumber || undefined,
      originalInvoiceDate: editFormData.originalInvoiceDate || undefined,
      originalInvoiceAmount: typeof editFormData.originalInvoiceAmount === 'number' ? editFormData.originalInvoiceAmount : undefined,
      originalInvoiceMemo: editFormData.originalInvoiceMemo || undefined,
    });

    setEditingTx(null);
    setBatchToastMessage(`Transaction #${editFormData.transactionNumber} updated and synced with original source ledger.`);
    setTimeout(() => setBatchToastMessage(null), 3000);
  };

  // Open Edit for Selected Transactions
  const handleEditSelected = () => {
    if (selectedTxIds.length === 0) return;
    if (selectedTxIds.length === 1) {
      const tx = transactions.find(t => t.id === selectedTxIds[0]);
      if (tx) handleOpenEditModal(tx);
    } else {
      setIsBatchEditOpen(true);
      setBatchEditTab('batch');
      setCurrentStepIndex(0);
      setBatchStatus('no_change');
      setBatchDate('');
      setBatchDueDate('');
      setBatchMemoAction('no_change');
      setBatchMemoText('');
    }
  };

  // Save Batch Edits
  const handleSaveBatchEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedTxIds.length === 0) return;

    let updatedCount = 0;
    selectedTxIds.forEach(id => {
      const tx = transactions.find(t => t.id === id);
      if (!tx) return;

      const updates: Partial<Transaction> = {};

      if (batchStatus !== 'no_change') {
        updates.status = batchStatus as TransactionStatus;
      }
      if (batchDate) {
        updates.date = batchDate;
      }
      if (batchDueDate) {
        updates.dueDate = batchDueDate;
      }
      if (batchMemoAction === 'replace') {
        updates.memo = batchMemoText;
      } else if (batchMemoAction === 'append') {
        updates.memo = tx.memo ? `${tx.memo} | ${batchMemoText}` : batchMemoText;
      }

      if (Object.keys(updates).length > 0) {
        updateTransaction(id, updates);
        updatedCount++;
      }
    });

    setIsBatchEditOpen(false);
    setBatchToastMessage(`Successfully updated ${updatedCount} transactions.`);
    setTimeout(() => setBatchToastMessage(null), 3500);
  };

  // Step-by-step editor for selected transactions
  const handleSaveCurrentStepTx = () => {
    const currentTx = selectedTransactions[currentStepIndex];
    if (!currentTx) return;

    updateTransaction(currentTx.id, {
      transactionNumber: editFormData.transactionNumber,
      entityName: editFormData.entityName,
      date: editFormData.date,
      dueDate: editFormData.dueDate,
      memo: editFormData.memo,
      total: editFormData.total,
      taxTotal: editFormData.taxTotal,
      status: editFormData.status,
      originalInvoiceNumber: editFormData.originalInvoiceNumber || undefined,
      originalInvoiceDate: editFormData.originalInvoiceDate || undefined,
      originalInvoiceAmount: typeof editFormData.originalInvoiceAmount === 'number' ? editFormData.originalInvoiceAmount : undefined,
      originalInvoiceMemo: editFormData.originalInvoiceMemo || undefined,
    });

    setBatchToastMessage(`Saved changes for #${editFormData.transactionNumber}`);
    setTimeout(() => setBatchToastMessage(null), 2500);

    if (currentStepIndex < selectedTransactions.length - 1) {
      loadStepTx(currentStepIndex + 1);
    } else {
      setIsBatchEditOpen(false);
    }
  };

  const loadStepTx = (index: number) => {
    setCurrentStepIndex(index);
    const tx = selectedTransactions[index];
    if (tx) {
      setEditFormData({
        transactionNumber: tx.transactionNumber,
        entityName: tx.entityName,
        date: tx.date,
        dueDate: tx.dueDate || '',
        memo: tx.memo || '',
        total: tx.total,
        taxTotal: tx.taxTotal || 0,
        status: tx.status,
        originalInvoiceNumber: tx.originalInvoiceNumber || '',
        originalInvoiceDate: tx.originalInvoiceDate || '',
        originalInvoiceAmount: tx.originalInvoiceAmount || '',
        originalInvoiceMemo: tx.originalInvoiceMemo || '',
      });
    }
  };

  // Batch status update helper from floating bar
  const handleQuickBatchStatus = (newStatus: TransactionStatus) => {
    selectedTxIds.forEach(id => {
      updateTransaction(id, { status: newStatus });
    });
    setBatchToastMessage(`Marked ${selectedTxIds.length} transactions as ${newStatus}.`);
    setTimeout(() => setBatchToastMessage(null), 3000);
  };

  // Batch delete handler
  const handleBatchDelete = () => {
    selectedTxIds.forEach(id => {
      deleteTransaction(id);
    });
    setBatchToastMessage(`Permanently deleted ${selectedTxIds.length} transactions.`);
    setSelectedTxIds([]);
    setBatchDeleteConfirmOpen(false);
    setTimeout(() => setBatchToastMessage(null), 3500);
  };

  const handleConfirmDelete = () => {
    if (!deletingTx) return;
    deleteTransaction(deletingTx.id);
    setSelectedTxIds(prev => prev.filter(id => id !== deletingTx.id));
    setDeletingTx(null);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Toast feedback notification */}
      {batchToastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-gray-900 text-white text-xs font-semibold px-4 py-2.5 rounded-lg shadow-xl flex items-center gap-2 border border-gray-700 animate-in fade-in slide-in-from-top-2">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span>{batchToastMessage}</span>
          <button 
            onClick={() => setBatchToastMessage(null)}
            className="ml-2 text-gray-400 hover:text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Header & Controls */}
      <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-gray-900">
                Transactions & General Ledger
              </h1>
              {isAdminOrAuthorized && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded text-[11px] font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Admin Full Access: Edit & Delete Enabled</span>
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-2 flex-wrap">
              <span>Double-entry sales invoices, vendor bills, customer receipts, and adjusting journal entries.</span>
              <span className="text-[10px] font-semibold text-gray-500 bg-gray-100 border border-gray-200 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                <span>💡 Select checkboxes or double-click any row to edit</span>
              </span>
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => {
                setActiveTab('reports');
                setSubView('pnl');
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 hover:bg-orange-100 text-[#d65200] border border-orange-200 rounded text-xs font-bold shadow-2xs transition"
              title="Open 12-Month Profit & Loss Statement"
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>12-Mo P&L</span>
            </button>
            <button
              onClick={() => {
                setActiveTab('reports');
                setSubView('balance_sheet');
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 rounded text-xs font-bold shadow-2xs transition"
              title="Open 12-Month Balance Sheet"
            >
              <Scale className="w-3.5 h-3.5" />
              <span>Balance Sheet</span>
            </button>
            <button
              onClick={() => {
                setActiveTab('reports');
                setSubView('trial_balance');
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 rounded text-xs font-bold shadow-2xs transition"
              title="Open Trial Balance"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Trial Balance</span>
            </button>
            <button
              onClick={() => {
                setActiveTab('documents');
                setSubView('invoice_form');
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-bold shadow-xs transition"
              title="Open Cambodian Official Standard Invoice Form Generator"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Invoice Form</span>
            </button>
            <button
              onClick={handleOpenSuiteModal}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded text-xs font-bold shadow-xs transition"
              title="Open Expenses & Items Sublist Platform (NetSuite-Style)"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Expenses & Items</span>
            </button>
            <button
              onClick={() => setIsQuickInvoiceOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#d65200] hover:bg-[#b84300] text-white rounded text-xs font-bold shadow-xs transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Invoice</span>
            </button>
            <button
              onClick={() => setIsQuickJournalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-800 hover:bg-black text-white rounded text-xs font-bold shadow-xs transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Journal</span>
            </button>
          </div>
        </div>

        {/* Filters Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 mt-4 pt-3 border-t border-gray-100 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            {/* Type buttons */}
            <div className="flex rounded border border-gray-200 p-0.5 bg-gray-50">
              {[
                { key: 'Bill', label: 'Payable to Vendors' },
                { key: 'Invoice', label: 'Sale' },
                { key: 'Journal_Entry', label: 'Journal Entries' },
                { key: 'All', label: 'All Types' }
              ].map((item) => (
                <button
                  key={item.key}
                  onClick={() => {
                    setFilterType(item.key);
                    setSubView(item.key === 'Bill' ? 'payable_vendors' : item.key === 'Invoice' ? 'sale' : item.key === 'Journal_Entry' ? 'journal_entries' : 'all');
                  }}
                  className={`px-3 py-1 rounded text-xs font-medium transition ${
                    effectiveType === item.key 
                      ? 'bg-[#d65200] text-white font-bold shadow-2xs' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* Status Select */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-2.5 py-1 text-xs border border-gray-300 rounded bg-white font-medium text-gray-700"
            >
              <option value="All">All Statuses</option>
              <option value="Approved">Approved</option>
              <option value="Partially_Paid">Partially Paid</option>
              <option value="Paid">Paid</option>
              <option value="Draft">Draft</option>
              <option value="Pending_Approval">Pending Approval</option>
              <option value="Void">Void</option>
            </select>

            {/* Month Filter Select */}
            <select
              value={filterMonth}
              onChange={(e) => setFilterMonth(e.target.value)}
              className="px-2.5 py-1 text-xs border border-orange-300 rounded bg-orange-50/50 font-semibold text-gray-800 focus:ring-1 focus:ring-[#d65200]"
            >
              <option value="All">All Months / Periods</option>
              <option value="2026-08">August 2026 (MTD)</option>
              <option value="2026-07">July 2026</option>
              <option value="2026-06">June 2026</option>
              <option value="2026-05">May 2026</option>
              <option value="2026-04">April 2026</option>
              <option value="2026-03">March 2026</option>
            </select>
          </div>

          <div className="flex items-center gap-3">
            {selectedTxIds.length > 0 && (
              <span className="text-xs font-bold text-[#d65200] bg-orange-50 px-2.5 py-1 rounded-md border border-orange-200 flex items-center gap-1.5">
                <CheckSquare className="w-3.5 h-3.5" />
                {selectedTxIds.length} Selected
              </span>
            )}
            <div className="text-xs text-gray-500 font-mono">
              Showing {filtered.length} of {transactions.length} transactions
            </div>
          </div>
        </div>
      </div>

      {/* FLOATING / STICKY SELECTION ACTIONS BAR */}
      {selectedTxIds.length > 0 && (
        <div className="sticky top-2 z-40 bg-gray-900 text-white rounded-xl shadow-xl p-3 border border-gray-700 flex flex-wrap items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-orange-600 text-white px-3 py-1 rounded-lg text-xs font-bold shadow-xs">
              <ListChecks className="w-4 h-4" />
              <span>{selectedTxIds.length} {selectedTxIds.length === 1 ? 'Transaction' : 'Transactions'} Selected</span>
            </div>
            <span className="text-xs text-gray-300 hidden md:inline">
              Choose an action to edit, update status, or manage selected transactions:
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Edit Selected Button */}
            <button
              onClick={handleEditSelected}
              className="px-3 py-1.5 bg-[#d65200] hover:bg-[#b84300] text-white rounded-lg text-xs font-bold shadow-xs flex items-center gap-1.5 transition"
              title="Edit selected transaction details & batch modify fields"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>{selectedTxIds.length === 1 ? 'Edit Transaction' : `Batch Edit (${selectedTxIds.length})`}</span>
            </button>

            {/* Quick Status Buttons */}
            <div className="hidden sm:flex items-center bg-gray-800 rounded-lg p-0.5 border border-gray-700">
              <button
                onClick={() => handleQuickBatchStatus('Approved')}
                className="px-2.5 py-1 text-[11px] font-semibold text-emerald-400 hover:bg-gray-700 rounded transition"
                title="Mark all selected as Approved"
              >
                ✓ Approve
              </button>
              <button
                onClick={() => handleQuickBatchStatus('Paid')}
                className="px-2.5 py-1 text-[11px] font-semibold text-blue-400 hover:bg-gray-700 rounded transition"
                title="Mark all selected as Paid"
              >
                Mark Paid
              </button>
              <button
                onClick={() => handleQuickBatchStatus('Draft')}
                className="px-2.5 py-1 text-[11px] font-semibold text-gray-300 hover:bg-gray-700 rounded transition"
                title="Mark all selected as Draft"
              >
                Set Draft
              </button>
            </div>

            {/* Batch Delete Button */}
            <button
              onClick={() => setBatchDeleteConfirmOpen(true)}
              className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold shadow-xs flex items-center gap-1.5 transition"
              title="Delete all selected transactions"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete</span>
            </button>

            {/* Deselect / Clear */}
            <button
              onClick={() => setSelectedTxIds([])}
              className="px-2 py-1.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg text-xs font-medium transition flex items-center gap-1"
              title="Clear selection"
            >
              <X className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
          </div>
        </div>
      )}

      {/* Transactions Table */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-gray-600 border-b border-gray-200 text-[11px] uppercase tracking-wider">
              <tr>
                <th className="py-3 px-3 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={filtered.length > 0 && selectedTxIds.length === filtered.length}
                    onChange={handleToggleSelectAll}
                    className="rounded border-gray-300 text-[#d65200] focus:ring-[#d65200] cursor-pointer w-4 h-4"
                    title={selectedTxIds.length === filtered.length ? "Deselect all visible" : "Select all visible transactions"}
                  />
                </th>
                <th className="py-3 px-3">Date</th>
                <th className="py-3 px-3">Tx #</th>
                <th className="py-3 px-3">Type</th>
                <th className="py-3 px-3">Entity / Customer / Account</th>
                <th className="py-3 px-3">Memo / Description</th>
                <th className="py-3 px-3 text-right">Tax Total</th>
                <th className="py-3 px-3 text-right">Total Amount</th>
                <th className="py-3 px-3 text-right">Balance Due</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-normal">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-8 text-center text-gray-400 font-sans text-xs">
                    No transactions match the selected filters.
                  </td>
                </tr>
              ) : (
                filtered.map((tx) => {
                  const isSelected = selectedTxIds.includes(tx.id);
                  return (
                    <tr 
                      key={tx.id} 
                      onClick={() => handleToggleSelectRow(tx.id)}
                      onDoubleClick={() => setPreviewDoc({ type: tx.type as any, data: tx })}
                      className={`transition group cursor-pointer select-none ${
                        isSelected 
                          ? 'bg-orange-50/90 font-medium' 
                          : 'hover:bg-orange-50/40'
                      }`}
                      title="Click to select/deselect • Double-click to open document preview"
                    >
                      {/* Checkbox Column */}
                      <td 
                        className="py-3 px-3 text-center w-10" 
                        onClick={(e) => e.stopPropagation()}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelectRow(tx.id)}
                          className="rounded border-gray-300 text-[#d65200] focus:ring-[#d65200] cursor-pointer w-4 h-4"
                        />
                      </td>
                      <td className="py-3 px-3 text-gray-600 font-mono text-[11px] whitespace-nowrap">
                        {tx.date}
                      </td>
                      <td className="py-3 px-3 font-semibold text-[#d65200] font-mono whitespace-nowrap group-hover:underline">
                        {tx.transactionNumber}
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          tx.type === 'Invoice' ? 'bg-blue-100 text-blue-800' :
                          tx.type === 'Bill' ? 'bg-purple-100 text-purple-800' :
                          tx.type === 'Journal_Entry' ? 'bg-amber-100 text-amber-900' :
                          'bg-emerald-100 text-emerald-800'
                        }`}>
                          {tx.type.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-gray-900 font-medium max-w-[200px] truncate">
                        <div>{tx.entityName}</div>
                        {tx.subsidiary && <span className="text-[10px] text-gray-500">{tx.subsidiary}</span>}
                      </td>
                      <td className="py-3 px-3 text-gray-600 max-w-[220px] truncate">
                        {tx.memo || (tx.items?.[0]?.description) || '—'}
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-gray-600">
                        {tx.taxTotal > 0 ? formatCurrency(tx.taxTotal, tx.currency) : '—'}
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-gray-900">
                        {formatCurrency(tx.total, tx.currency)}
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-bold">
                        {tx.balanceDue > 0 ? (
                          <span className="text-rose-600">{formatCurrency(tx.balanceDue, tx.currency)}</span>
                        ) : (
                          <span className="text-gray-400 font-normal">{formatCurrency(0, tx.currency)}</span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          tx.status === 'Paid' ? 'bg-emerald-100 text-emerald-800' :
                          tx.status === 'Approved' ? 'bg-blue-100 text-blue-800' :
                          tx.status === 'Partially_Paid' ? 'bg-amber-100 text-amber-800' :
                          tx.status === 'Void' ? 'bg-rose-100 text-rose-800' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {tx.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          {/* Direct Edit Button */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenEditModal(tx);
                            }}
                            title="Edit Transaction Details"
                            className="px-2 py-1 bg-gray-100 hover:bg-[#d65200] hover:text-white text-gray-700 rounded text-[11px] font-semibold transition inline-flex items-center gap-1 border border-gray-200"
                          >
                            <Edit3 className="w-3 h-3" />
                            <span>Edit</span>
                          </button>

                          {/* View Preview Button */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setPreviewDoc({ type: tx.type as any, data: tx });
                            }}
                            title="View Document Details"
                            className="px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded text-[11px] font-medium transition inline-flex items-center gap-1"
                          >
                            <Eye className="w-3 h-3" />
                            <span>View</span>
                          </button>

                          {/* Pay Settlement Button */}
                          {tx.balanceDue > 0 && (
                            <button
                              onClick={(e) => {
                              e.stopPropagation();
                              handleOpenPayment(tx);
                            }}
                            title="Record Settlement"
                            className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded text-[11px] font-semibold transition"
                          >
                            Pay
                          </button>
                        )}

                        {/* Admin Delete Button */}
                        {isAdminOrAuthorized && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeletingTx(tx);
                            }}
                            title="Delete Transaction (Admin)"
                            className="p-1 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>

    {/* BATCH & MULTI-TRANSACTION EDIT MODAL */}
    {isBatchEditOpen && (
      <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
        <div className="bg-white rounded-xl max-w-2xl w-full p-6 shadow-2xl my-auto space-y-5 border border-gray-200">
          <div className="flex items-center justify-between pb-3 border-b border-gray-200">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-orange-100 text-[#d65200] rounded-lg">
                <Sliders className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900">
                  Edit Selected Transactions ({selectedTxIds.length})
                </h3>
                <span className="text-xs text-gray-500">
                  Batch update fields across all selected items or edit each selected transaction in sequence
                </span>
              </div>
            </div>
            <button 
              onClick={() => setIsBatchEditOpen(false)}
              className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Mode Tabs */}
          <div className="flex border-b border-gray-200 gap-4 text-xs font-bold">
            <button
              type="button"
              onClick={() => setBatchEditTab('batch')}
              className={`pb-2 border-b-2 transition flex items-center gap-1.5 ${
                batchEditTab === 'batch' 
                  ? 'border-[#d65200] text-[#d65200]' 
                  : 'border-transparent text-gray-500 hover:text-gray-900'
              }`}
            >
              <ListChecks className="w-4 h-4" />
              <span>Batch Update All ({selectedTxIds.length})</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setBatchEditTab('step');
                loadStepTx(0);
              }}
              className={`pb-2 border-b-2 transition flex items-center gap-1.5 ${
                batchEditTab === 'step' 
                  ? 'border-[#d65200] text-[#d65200]' 
                  : 'border-transparent text-gray-500 hover:text-gray-900'
              }`}
            >
              <Edit3 className="w-4 h-4" />
              <span>Step-by-Step Individual Editor</span>
            </button>
          </div>

          {/* Tab 1: Batch Field Update */}
          {batchEditTab === 'batch' && (
            <form onSubmit={handleSaveBatchEdit} className="space-y-4 text-xs">
              {/* Selected List Summary */}
              <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 max-h-36 overflow-y-auto">
                <div className="text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-2">
                  Selected Transactions ({selectedTransactions.length}):
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {selectedTransactions.map(t => (
                    <div key={t.id} className="flex items-center justify-between bg-white px-2 py-1 rounded border border-gray-200 text-[11px]">
                      <span className="font-mono font-bold text-[#d65200]">{t.transactionNumber}</span>
                      <span className="text-gray-700 truncate max-w-[120px]">{t.entityName}</span>
                      <span className="font-mono text-gray-600 font-semibold">{formatCurrency(t.total, t.currency)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Status Update */}
              <div className="space-y-1.5">
                <label className="font-bold text-gray-700">Update Status for All:</label>
                <select
                  value={batchStatus}
                  onChange={(e) => setBatchStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white font-medium text-gray-900 focus:ring-1 focus:ring-[#d65200]"
                >
                  <option value="no_change">-- Keep Existing Statuses (No Change) --</option>
                  <option value="Approved">Approved</option>
                  <option value="Paid">Paid</option>
                  <option value="Partially_Paid">Partially Paid</option>
                  <option value="Pending_Approval">Pending Approval</option>
                  <option value="Draft">Draft</option>
                  <option value="Void">Void</option>
                </select>
              </div>

              {/* Date Updates */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-bold text-gray-700">Set Posting Date (Optional):</label>
                  <input
                    type="date"
                    value={batchDate}
                    onChange={(e) => setBatchDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-1 focus:ring-[#d65200]"
                  />
                  <span className="text-[10px] text-gray-400">Leave blank to keep existing dates</span>
                </div>
                <div className="space-y-1.5">
                  <label className="font-bold text-gray-700">Set Due Date (Optional):</label>
                  <input
                    type="date"
                    value={batchDueDate}
                    onChange={(e) => setBatchDueDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-1 focus:ring-[#d65200]"
                  />
                  <span className="text-[10px] text-gray-400">Leave blank to keep existing due dates</span>
                </div>
              </div>

              {/* Memo Updates */}
              <div className="space-y-1.5">
                <label className="font-bold text-gray-700">Memo / Description Batch Action:</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setBatchMemoAction('no_change')}
                    className={`py-1.5 px-2 rounded-lg font-medium border text-center transition ${
                      batchMemoAction === 'no_change'
                        ? 'bg-[#d65200] text-white border-[#d65200]'
                        : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    Keep Existing
                  </button>
                  <button
                    type="button"
                    onClick={() => setBatchMemoAction('append')}
                    className={`py-1.5 px-2 rounded-lg font-medium border text-center transition ${
                      batchMemoAction === 'append'
                        ? 'bg-[#d65200] text-white border-[#d65200]'
                        : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    Append to Memo
                  </button>
                  <button
                    type="button"
                    onClick={() => setBatchMemoAction('replace')}
                    className={`py-1.5 px-2 rounded-lg font-medium border text-center transition ${
                      batchMemoAction === 'replace'
                        ? 'bg-[#d65200] text-white border-[#d65200]'
                        : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    Replace Memo
                  </button>
                </div>
                {batchMemoAction !== 'no_change' && (
                  <input
                    type="text"
                    required
                    placeholder={batchMemoAction === 'append' ? "e.g. Reviewed by Auditor" : "e.g. Q3 Reclassified Transaction"}
                    value={batchMemoText}
                    onChange={(e) => setBatchMemoText(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 mt-2 focus:ring-1 focus:ring-[#d65200]"
                  />
                )}
              </div>

              {/* Actions */}
              <div className="pt-4 border-t border-gray-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsBatchEditOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#d65200] hover:bg-[#b84300] text-white rounded-lg font-bold shadow-xs flex items-center gap-1.5"
                >
                  <CheckCheck className="w-4 h-4" />
                  <span>Apply Batch Changes ({selectedTxIds.length})</span>
                </button>
              </div>
            </form>
          )}

          {/* Tab 2: Step-by-Step Individual Editor */}
          {batchEditTab === 'step' && (
            <div className="space-y-4 text-xs">
              {/* Stepper Header */}
              <div className="flex items-center justify-between bg-orange-50 p-3 rounded-lg border border-orange-200">
                <div>
                  <span className="text-[11px] font-bold text-[#d65200] uppercase tracking-wider">
                    Editing Item {currentStepIndex + 1} of {selectedTransactions.length}
                  </span>
                  <div className="text-sm font-bold font-mono text-gray-900">
                    {selectedTransactions[currentStepIndex]?.transactionNumber} • {selectedTransactions[currentStepIndex]?.type}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    disabled={currentStepIndex === 0}
                    onClick={() => loadStepTx(currentStepIndex - 1)}
                    className="p-1.5 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40 transition"
                    title="Previous Transaction"
                  >
                    <ChevronLeft className="w-4 h-4 text-gray-700" />
                  </button>
                  <button
                    type="button"
                    disabled={currentStepIndex === selectedTransactions.length - 1}
                    onClick={() => loadStepTx(currentStepIndex + 1)}
                    className="p-1.5 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40 transition"
                    title="Next Transaction"
                  >
                    <ChevronRight className="w-4 h-4 text-gray-700" />
                  </button>
                </div>
              </div>

              {/* Form for Current Selected Item */}
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Transaction #</label>
                    <input
                      type="text"
                      required
                      value={editFormData.transactionNumber}
                      onChange={(e) => setEditFormData({ ...editFormData, transactionNumber: e.target.value })}
                      className="w-full px-3 py-1.5 border border-gray-300 rounded-lg font-mono font-medium text-gray-900 focus:ring-1 focus:ring-[#d65200]"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Status</label>
                    <select
                      value={editFormData.status}
                      onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value as TransactionStatus })}
                      className="w-full px-3 py-1.5 border border-gray-300 rounded-lg bg-white font-medium text-gray-900 focus:ring-1 focus:ring-[#d65200]"
                    >
                      <option value="Approved">Approved</option>
                      <option value="Draft">Draft</option>
                      <option value="Pending_Approval">Pending Approval</option>
                      <option value="Partially_Paid">Partially Paid</option>
                      <option value="Paid">Paid</option>
                      <option value="Void">Void</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Entity / Customer / Vendor Name</label>
                  <input
                    type="text"
                    required
                    value={editFormData.entityName}
                    onChange={(e) => setEditFormData({ ...editFormData, entityName: e.target.value })}
                    className="w-full px-3 py-1.5 border border-gray-300 rounded-lg font-medium text-gray-900 focus:ring-1 focus:ring-[#d65200]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Posting Date</label>
                    <input
                      type="date"
                      required
                      value={editFormData.date}
                      onChange={(e) => setEditFormData({ ...editFormData, date: e.target.value })}
                      className="w-full px-3 py-1.5 border border-gray-300 rounded-lg font-mono text-gray-900 focus:ring-1 focus:ring-[#d65200]"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Due Date</label>
                    <input
                      type="date"
                      value={editFormData.dueDate}
                      onChange={(e) => setEditFormData({ ...editFormData, dueDate: e.target.value })}
                      className="w-full px-3 py-1.5 border border-gray-300 rounded-lg font-mono text-gray-900 focus:ring-1 focus:ring-[#d65200]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Total Amount ({selectedTransactions[currentStepIndex]?.currency})</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={editFormData.total}
                      onChange={(e) => setEditFormData({ ...editFormData, total: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-1.5 border border-gray-300 rounded-lg font-mono font-bold text-gray-900 focus:ring-1 focus:ring-[#d65200]"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Tax Total ({selectedTransactions[currentStepIndex]?.currency})</label>
                    <input
                      type="number"
                      step="0.01"
                      value={editFormData.taxTotal}
                      onChange={(e) => setEditFormData({ ...editFormData, taxTotal: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-1.5 border border-gray-300 rounded-lg font-mono text-gray-900 focus:ring-1 focus:ring-[#d65200]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Memo / Description</label>
                  <textarea
                    rows={2}
                    value={editFormData.memo}
                    onChange={(e) => setEditFormData({ ...editFormData, memo: e.target.value })}
                    className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-gray-900 focus:ring-1 focus:ring-[#d65200]"
                  />
                </div>
              </div>

              {/* Step Navigation Actions */}
              <div className="pt-4 border-t border-gray-200 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setIsBatchEditOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-semibold"
                >
                  Close
                </button>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleSaveCurrentStepTx}
                    className="px-5 py-2 bg-[#d65200] hover:bg-[#b84300] text-white rounded-lg font-bold shadow-xs flex items-center gap-1.5"
                  >
                    <Check className="w-4 h-4" />
                    <span>
                      {currentStepIndex < selectedTransactions.length - 1 ? 'Save & Next Transaction' : 'Save & Finish'}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    )}

    {/* BATCH DELETE CONFIRMATION MODAL */}
    {batchDeleteConfirmOpen && (
      <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
        <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl animate-in fade-in duration-200 space-y-4">
          <div className="flex items-center gap-3 text-rose-600">
            <div className="p-2 bg-rose-100 rounded-full">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-gray-900">
              Delete {selectedTxIds.length} Selected Transactions?
            </h3>
          </div>

          <p className="text-xs text-gray-600 leading-relaxed">
            Are you sure you want to permanently delete all <span className="font-bold text-gray-900">{selectedTxIds.length} selected transactions</span>?
          </p>

          <div className="bg-gray-50 p-2.5 rounded-lg border border-gray-200 max-h-32 overflow-y-auto space-y-1 text-[11px] font-mono">
            {selectedTransactions.map(t => (
              <div key={t.id} className="flex justify-between text-gray-700">
                <span className="font-bold text-[#d65200]">#{t.transactionNumber}</span>
                <span className="truncate max-w-[150px]">{t.entityName}</span>
                <span>{formatCurrency(t.total, t.currency)}</span>
              </div>
            ))}
          </div>

          <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-[11px] text-amber-800">
            <b>Audit Reversal:</b> Corresponding double-entry ledger journals and counterparty balances will be automatically reversed.
          </div>

          <div className="flex justify-end gap-2 pt-2 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setBatchDeleteConfirmOpen(false)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleBatchDelete}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold shadow-xs flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete All {selectedTxIds.length}</span>
            </button>
          </div>
        </div>
      </div>
    )}

      {/* Admin Edit Transaction Modal */}
      {editingTx && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-lg w-full p-6 shadow-2xl animate-in fade-in-50">
            <div className="flex items-center justify-between pb-3 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-blue-50 text-blue-700 rounded">
                  <Edit3 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">
                    Edit Transaction #{editingTx.transactionNumber}
                  </h3>
                  <span className="text-xs text-gray-500 font-mono">
                    Type: {editingTx.type} • Admin Override
                  </span>
                </div>
              </div>
              <button 
                onClick={() => setEditingTx(null)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="mt-4 space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Transaction #
                  </label>
                  <input
                    type="text"
                    required
                    value={editFormData.transactionNumber}
                    onChange={(e) => setEditFormData({ ...editFormData, transactionNumber: e.target.value })}
                    className="w-full px-3 py-1.5 border border-gray-300 rounded font-mono font-medium text-gray-900 focus:ring-1 focus:ring-[#d65200]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={editFormData.status}
                    onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value as TransactionStatus })}
                    className="w-full px-3 py-1.5 border border-gray-300 rounded bg-white font-medium text-gray-900 focus:ring-1 focus:ring-[#d65200]"
                  >
                    <option value="Approved">Approved</option>
                    <option value="Draft">Draft</option>
                    <option value="Pending_Approval">Pending Approval</option>
                    <option value="Partially_Paid">Partially Paid</option>
                    <option value="Paid">Paid</option>
                    <option value="Void">Void</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Entity / Customer / Vendor Name
                </label>
                <input
                  type="text"
                  required
                  value={editFormData.entityName}
                  onChange={(e) => setEditFormData({ ...editFormData, entityName: e.target.value })}
                  className="w-full px-3 py-1.5 border border-gray-300 rounded font-medium text-gray-900 focus:ring-1 focus:ring-[#d65200]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Posting Date
                  </label>
                  <input
                    type="date"
                    required
                    value={editFormData.date}
                    onChange={(e) => setEditFormData({ ...editFormData, date: e.target.value })}
                    className="w-full px-3 py-1.5 border border-gray-300 rounded font-mono text-gray-900 focus:ring-1 focus:ring-[#d65200]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={editFormData.dueDate}
                    onChange={(e) => setEditFormData({ ...editFormData, dueDate: e.target.value })}
                    className="w-full px-3 py-1.5 border border-gray-300 rounded font-mono text-gray-900 focus:ring-1 focus:ring-[#d65200]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Total Amount ({editingTx.currency})
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={editFormData.total}
                    onChange={(e) => setEditFormData({ ...editFormData, total: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-1.5 border border-gray-300 rounded font-mono font-bold text-gray-900 focus:ring-1 focus:ring-[#d65200]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Tax Total ({editingTx.currency})
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={editFormData.taxTotal}
                    onChange={(e) => setEditFormData({ ...editFormData, taxTotal: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-1.5 border border-gray-300 rounded font-mono text-gray-900 focus:ring-1 focus:ring-[#d65200]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Memo / Description
                </label>
                <textarea
                  rows={2}
                  value={editFormData.memo}
                  onChange={(e) => setEditFormData({ ...editFormData, memo: e.target.value })}
                  placeholder="Notes, line descriptions, reference notes..."
                  className="w-full px-3 py-1.5 border border-gray-300 rounded text-gray-900 focus:ring-1 focus:ring-[#d65200]"
                />
              </div>

              {/* Linked Original Invoice / Source Voucher Sync */}
              <div className="p-3 bg-orange-50/60 rounded-lg border border-orange-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-gray-800 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Sync with Original Source Document & Double-Entry Ledger</span>
                  </span>
                  <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                    Live Sync Active
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-semibold text-gray-600 mb-0.5">Original Doc #</label>
                    <input
                      type="text"
                      placeholder="e.g. INV-2026-001"
                      value={editFormData.originalInvoiceNumber}
                      onChange={(e) => setEditFormData({ ...editFormData, originalInvoiceNumber: e.target.value })}
                      className="w-full px-2.5 py-1 border border-gray-300 rounded text-xs font-mono bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-gray-600 mb-0.5">Original Date</label>
                    <input
                      type="date"
                      value={editFormData.originalInvoiceDate}
                      onChange={(e) => setEditFormData({ ...editFormData, originalInvoiceDate: e.target.value })}
                      className="w-full px-2.5 py-1 border border-gray-300 rounded text-xs font-mono bg-white"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-gray-200 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => {
                    setPreviewDoc({ type: editingTx.type as any, data: editingTx });
                    setEditingTx(null);
                  }}
                  className="text-xs text-[#d65200] hover:underline font-semibold flex items-center gap-1"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Open Full Invoice Itemizer</span>
                </button>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingTx(null)}
                    className="px-3.5 py-1.5 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-[#d65200] hover:bg-[#b84300] text-white rounded font-bold shadow-xs flex items-center gap-1"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Save & Sync Changes</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Admin Delete Confirmation Modal */}
      {deletingTx && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-2xl animate-in fade-in-50">
            <div className="flex items-center gap-3 text-rose-600 mb-3">
              <div className="p-2 bg-rose-100 rounded-full">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-gray-900">
                Confirm Transaction Deletion
              </h3>
            </div>

            <p className="text-xs text-gray-600 leading-relaxed">
              Are you sure you want to permanently delete transaction{' '}
              <span className="font-mono font-bold text-gray-900">#{deletingTx.transactionNumber}</span> (
              <span className="font-semibold text-gray-900">{deletingTx.entityName}</span>) of amount{' '}
              <span className="font-mono font-bold text-gray-900">{formatCurrency(deletingTx.total, deletingTx.currency)}</span>?
            </p>

            <div className="mt-3 p-3 bg-amber-50 rounded border border-amber-200 text-[11px] text-amber-800">
              <b>Audit Notice:</b> This action will reverse ledger entries and adjust the counterparty's outstanding balance accordingly.
            </div>

            <div className="mt-5 flex justify-end gap-2 text-xs">
              <button
                type="button"
                onClick={() => setDeletingTx(null)}
                className="px-3.5 py-1.5 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded font-bold shadow-xs flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Permanently</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Settlement Modal */}
      {selectedTxForPayment && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-2xl animate-in fade-in-50">
            <h3 className="text-base font-bold text-gray-900">
              Record Payment Settlement
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              Doc #{selectedTxForPayment.transactionNumber} • {selectedTxForPayment.entityName}
            </p>

            <div className="mt-4 space-y-3 text-xs">
              <div className="p-3 bg-gray-50 rounded border border-gray-200 flex justify-between">
                <span className="text-gray-600">Total Transaction Amount:</span>
                <span className="font-bold font-mono">{formatCurrency(selectedTxForPayment.total, selectedTxForPayment.currency)}</span>
              </div>

              <div className="p-3 bg-rose-50 rounded border border-rose-100 flex justify-between text-rose-800">
                <span>Current Outstanding Due:</span>
                <span className="font-bold font-mono">{formatCurrency(selectedTxForPayment.balanceDue, selectedTxForPayment.currency)}</span>
              </div>

              <div>
                <label className="block font-medium text-gray-700 mb-1">
                  Payment Amount to Settle ({selectedTxForPayment.currency}):
                </label>
                <input
                  type="number"
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded font-mono font-bold text-gray-900 focus:ring-1 focus:ring-[#d65200]"
                />
              </div>

              <div>
                <label className="block font-medium text-gray-700 mb-1">
                  Deposit / Clearing Bank Account:
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded bg-white text-gray-800">
                  <option>1020 - Main Operating Bank Account (USD)</option>
                  <option>1030 - Secondary International Bank (USD)</option>
                  <option>1010 - Petty Cash - Bangkok HQ (USD)</option>
                </select>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setSelectedTxForPayment(null)}
                className="px-4 py-2 border border-gray-300 rounded text-xs font-semibold text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmPayment}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-bold"
              >
                Confirm Settlement
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Expenses & Items Sublist Platform Full Modal */}
      {isSuiteSublistModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[94vh] flex flex-col border border-gray-200 overflow-hidden">
            
            {/* Top Modal Bar */}
            <div className="p-4 sm:p-5 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#d65200] flex items-center justify-center text-white shadow-xs">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base sm:text-lg font-bold text-white">
                      Expenses and Items Platform
                    </h3>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-white/10 text-orange-200 border border-white/10">
                      NetSuite Subtab Engine
                    </span>
                  </div>
                  <p className="text-xs text-gray-300">
                    Dual sublist grid for categorizing direct line expenses and inventory purchase items with full tax & GL accounting.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsSuiteSublistModalOpen(false)}
                className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto space-y-4 text-xs flex-1">
              
              {/* Header Info */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-700 mb-1">Vendor / Entity *</label>
                    <select
                      value={suiteVendorId}
                      onChange={(e) => setSuiteVendorId(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-gray-300 rounded text-xs text-gray-900 font-medium"
                    >
                      {vendors.map(v => (
                        <option key={v.id} value={v.id}>{v.companyName}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-gray-700 mb-1">Bill Reference # *</label>
                    <input
                      type="text"
                      value={suiteBillNumber}
                      onChange={(e) => setSuiteBillNumber(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-gray-300 rounded font-mono font-bold text-xs text-gray-900"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-gray-700 mb-1">Posting Date *</label>
                    <input
                      type="date"
                      value={suitePostingDate}
                      onChange={(e) => setSuitePostingDate(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-gray-300 rounded font-mono text-xs text-gray-900"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-gray-700 mb-1">Due Date</label>
                    <input
                      type="date"
                      value={suiteDueDate}
                      onChange={(e) => setSuiteDueDate(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-gray-300 rounded font-mono text-xs text-gray-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 mb-1">Memo / Description</label>
                  <input
                    type="text"
                    value={suiteMemo}
                    onChange={(e) => setSuiteMemo(e.target.value)}
                    placeholder="e.g. Flight ticket settlement, hotel bookings, tour equipment inventory"
                    className="w-full px-2.5 py-1.5 bg-white border border-gray-300 rounded text-xs text-gray-900"
                  />
                </div>
              </div>

              {/* Sublist Platform */}
              <SuiteSublistPlatform
                initialExpenses={suiteExpenses}
                initialItems={suiteItems}
                currency={currentCurrency || 'USD'}
                onChangeExpenses={setSuiteExpenses}
                onChangeItems={setSuiteItems}
                onSubtotalChange={(sub, tax, gross) => {
                  setSuiteSubtotal(sub);
                  setSuiteTaxTotal(tax);
                  setSuiteGrossTotal(gross);
                }}
              />

            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between shrink-0">
              <button
                onClick={() => setIsSuiteSublistModalOpen(false)}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl font-semibold text-xs transition"
              >
                Close
              </button>

              <button
                onClick={handleSaveSuiteBillFromList}
                className="px-5 py-2.5 bg-[#d65200] hover:bg-[#b84300] text-white rounded-xl font-bold text-xs transition flex items-center gap-2 shadow-xs"
              >
                <Check className="w-4 h-4" />
                <span>Save & Post Bill ({formatCurrency(suiteGrossTotal || 5029)})</span>
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};
