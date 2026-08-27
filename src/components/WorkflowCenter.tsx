import React, { useState } from 'react';
import { 
  FileText, 
  Package, 
  Receipt, 
  CreditCard, 
  Calculator, 
  DollarSign, 
  Send, 
  Calendar, 
  BookOpen, 
  Layers, 
  Clock, 
  Users, 
  Building2, 
  Printer, 
  CheckSquare, 
  Shield, 
  ArrowRight, 
  ArrowDown, 
  Plus, 
  Link2, 
  ExternalLink, 
  ChevronRight, 
  CheckCircle2, 
  AlertCircle, 
  Sliders, 
  Search,
  Sparkles,
  Info,
  TrendingUp,
  RefreshCw,
  Landmark,
  X,
  FileCheck,
  Percent,
  FolderOpen,
  RotateCcw,
  Eye,
  Edit3,
  Check,
  Filter,
  ArrowUpRight,
  ListFilter
} from 'lucide-react';
import { useAccounting } from '../context/AccountingContext';
import { JournalLine, Transaction } from '../types';
import { SuiteSublistPlatform, ExpenseSublistLine, ItemSublistLine } from './SuiteSublistPlatform';

export const WorkflowCenter: React.FC = () => {
  const {
    accounts,
    customers,
    vendors,
    transactions,
    addTransaction,
    formatCurrency,
    currentCurrency,
    setActiveTab,
    setSubView,
    setIsQuickInvoiceOpen,
    setIsQuickJournalOpen,
    setIsQuickWhtOpen,
    setIsBankControlModalOpen,
    setIsAccountLinkerOpen,
    setSelectedEntityForLink,
    setPreviewDoc,
    openOriginalInvoice,
    linkTransactionToOriginalInvoice,
    workflowViewMode,
    setWorkflowViewMode
  } = useAccounting();

  // Active Interactive Node Modal State
  const [activeWorkflowModal, setActiveWorkflowModal] = useState<string | null>(null);
  const [activeModalTab, setActiveModalTab] = useState<'txns' | 'expenses_platform' | 'post_journal' | 'link_account'>('txns');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [txFilterStatus, setTxFilterStatus] = useState<string>('all');
  const [expandedTxId, setExpandedTxId] = useState<string | null>(null);

  // Suite Sublist Platform State
  const [suiteVendorId, setSuiteVendorId] = useState<string>(vendors[0]?.id || '');
  const [suiteBillNumber, setSuiteBillNumber] = useState<string>(`BILL-2026-${Math.floor(1000 + Math.random() * 9000)}`);
  const [suitePostingDate, setSuitePostingDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [suiteDueDate, setSuiteDueDate] = useState<string>(new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]);
  const [suiteMemo, setSuiteMemo] = useState<string>('Hotel accommodation & ground transport direct billing');
  const [suiteExpenses, setSuiteExpenses] = useState<ExpenseSublistLine[]>([]);
  const [suiteItems, setSuiteItems] = useState<ItemSublistLine[]>([]);
  const [suiteSubtotal, setSuiteSubtotal] = useState<number>(0);
  const [suiteTaxTotal, setSuiteTaxTotal] = useState<number>(0);
  const [suiteGrossTotal, setSuiteGrossTotal] = useState<number>(0);

  // Link Invoice Modal State
  const [linkingInvoiceTx, setLinkingInvoiceTx] = useState<Transaction | null>(null);
  const [linkInvoiceNumber, setLinkInvoiceNumber] = useState('');
  const [linkInvoiceDate, setLinkInvoiceDate] = useState('');
  const [linkInvoiceAmount, setLinkInvoiceAmount] = useState<number | ''>('');
  const [linkInvoiceMemo, setLinkInvoiceMemo] = useState('');

  // Embedded Journal Posting Form State in Modal
  const [jeDate, setJeDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [jeNumber, setJeNumber] = useState<string>(`JE-2026-${Math.floor(1000 + Math.random() * 9000)}`);
  const [jeEntityName, setJeEntityName] = useState<string>(vendors[0]?.companyName || 'Vendor / Partner');
  const [jeEntityType, setJeEntityType] = useState<'Vendor' | 'Customer' | 'Employee' | 'Other'>('Vendor');
  const [jeMemo, setJeMemo] = useState<string>('Inventory purchase bill and 3-way match');
  const [jeLines, setJeLines] = useState<JournalLine[]>([
    {
      id: 'jel-1',
      accountId: accounts.find(a => a.number === '1300')?.id || accounts[0]?.id || 'acc-1300',
      accountNumber: '1300',
      accountName: 'Merchandise & Tour Inventory',
      debit: 2500,
      credit: 0,
      memo: 'Goods received against PO',
    },
    {
      id: 'jel-2',
      accountId: accounts.find(a => a.number === '2010')?.id || accounts[1]?.id || 'acc-2010',
      accountNumber: '2010',
      accountName: 'Accounts Payable (A/P)',
      debit: 0,
      credit: 2500,
      memo: 'Vendor bill payable',
    }
  ]);
  const [postSuccessMessage, setPostSuccessMessage] = useState<string | null>(null);

  // Quick stats
  const totalReceivables = transactions
    .filter(t => t.type === 'Invoice' && (t.status === 'Draft' || t.status === 'Partially_Paid' || t.status === 'Posted' || t.status === 'Approved'))
    .reduce((sum, t) => sum + (t.balanceDue || t.total), 0);

  const totalPayables = transactions
    .filter(t => (t.type === 'Bill' || t.type === 'Journal_Entry') && (t.status === 'Draft' || t.status === 'Partially_Paid' || t.status === 'Approved'))
    .reduce((sum, t) => sum + (t.balanceDue || t.total), 0);

  const totalCashBank = accounts
    .filter(a => a.type === 'Bank')
    .reduce((sum, a) => sum + a.balance, 0);

  const undepositedCount = transactions.filter(t => t.type === 'Payment_Received' || t.type === 'Invoice').length % 3 + 2;

  // Open Linker for a specific Node
  const handleOpenLinkerForNode = (name: string, type: string, defaultAccId?: string) => {
    setSelectedEntityForLink({
      entityName: name,
      entityType: type,
      currentAccountId: defaultAccId
    });
    setIsAccountLinkerOpen(true);
  };

  // Open Workflow Modal for a node with pre-seeded context
  const handleOpenNodeModal = (nodeTitle: string, defaultTab: 'txns' | 'expenses_platform' | 'post_journal' = 'txns') => {
    setActiveWorkflowModal(nodeTitle);
    setActiveModalTab(defaultTab);
    setPostSuccessMessage(null);
    setJeNumber(`JE-2026-${Math.floor(1000 + Math.random() * 9000)}`);
    setSuiteBillNumber(`BILL-2026-${Math.floor(1000 + Math.random() * 9000)}`);

    // Contextualize Journal Form based on Node clicked
    if (nodeTitle === 'Enter Bills Against Inventory' || nodeTitle === 'Enter Bills') {
      setJeMemo(`${nodeTitle} - 3-Way Match Vendor Bill`);
      setJeEntityType('Vendor');
      setJeEntityName(vendors[0]?.companyName || 'Dusit Thani Hotels & Resorts');
      setSuiteVendorId(vendors[0]?.id || '');
      setSuiteMemo('Vendor Bill - 3-Way Match Accommodation & Inventory Purchases');
      const accInv = accounts.find(a => a.number === '1300' || a.number === '5010') || accounts[0];
      const accAp = accounts.find(a => a.number === '2010') || accounts[1];
      setJeLines([
        {
          id: `jel-${Date.now()}-1`,
          accountId: accInv.id,
          accountNumber: accInv.number,
          accountName: accInv.name,
          debit: 1500,
          credit: 0,
          memo: 'Inventory purchase bill debit',
        },
        {
          id: `jel-${Date.now()}-2`,
          accountId: accAp.id,
          accountNumber: accAp.number,
          accountName: accAp.name,
          debit: 0,
          credit: 1500,
          memo: 'A/P vendor bill liability credit',
        }
      ]);
    } else if (nodeTitle === 'Purchase Orders' || nodeTitle === 'Receive Inventory') {
      setJeMemo(`Goods Receipt & Purchase Order Matching`);
      setJeEntityType('Vendor');
      setJeEntityName(vendors[1]?.companyName || 'Siam Logistics Co., Ltd.');
      setSuiteVendorId(vendors[1]?.id || vendors[0]?.id || '');
    } else if (nodeTitle === 'Create Invoices' || nodeTitle === 'Sales Orders' || nodeTitle === 'Estimates') {
      setJeMemo(`Sales Revenue Recognition - ${nodeTitle}`);
      setJeEntityType('Customer');
      setJeEntityName(customers[0]?.companyName || 'Global Travel Group LLC');
      const accAr = accounts.find(a => a.number === '1100') || accounts[0];
      const accRev = accounts.find(a => a.number === '4010') || accounts[1];
      setJeLines([
        {
          id: `jel-${Date.now()}-1`,
          accountId: accAr.id,
          accountNumber: accAr.number,
          accountName: accAr.name,
          debit: 2800,
          credit: 0,
          memo: 'Customer AR Debit',
        },
        {
          id: `jel-${Date.now()}-2`,
          accountId: accRev.id,
          accountNumber: accRev.number,
          accountName: accRev.name,
          debit: 0,
          credit: 2800,
          memo: 'Sales Tour Revenue Credit',
        }
      ]);
    } else if (nodeTitle.includes('Payroll') || nodeTitle.includes('Employees')) {
      setJeMemo(`Payroll Journal Entry - Salaries & Withholding`);
      setJeEntityType('Employee');
      setJeEntityName('All Full-time Staff');
      const accSal = accounts.find(a => a.number === '6010') || accounts[0];
      const accBank = accounts.find(a => a.number === '1020') || accounts[1];
      setJeLines([
        {
          id: `jel-${Date.now()}-1`,
          accountId: accSal.id,
          accountNumber: accSal.number,
          accountName: accSal.name,
          debit: 3500,
          credit: 0,
          memo: 'Salary & Wage Expense',
        },
        {
          id: `jel-${Date.now()}-2`,
          accountId: accBank.id,
          accountNumber: accBank.number,
          accountName: accBank.name,
          debit: 0,
          credit: 3500,
          memo: 'Cash Bank Payout',
        }
      ]);
    }
  };

  // Save Suite Bill from Expenses & Items Sublist Platform
  const handleSaveSuiteBill = (e: React.FormEvent) => {
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

    setPostSuccessMessage(`Successfully saved & posted Vendor Bill ${createdTx.transactionNumber} (${formatCurrency(createdTx.total)}) to General Ledger!`);
    setTimeout(() => {
      setActiveModalTab('txns');
    }, 1200);
  };

  // Journal Line Handlers
  const handleAddJeLine = () => {
    const defaultAcc = accounts[0] || { id: 'acc-default', number: '1000', name: 'General Account' };
    setJeLines([
      ...jeLines,
      {
        id: `jel-${Date.now()}`,
        accountId: defaultAcc.id,
        accountNumber: defaultAcc.number,
        accountName: defaultAcc.name,
        debit: 0,
        credit: 0,
        memo: jeMemo || 'Journal line entry',
      }
    ]);
  };

  const handleRemoveJeLine = (index: number) => {
    if (jeLines.length <= 2) return;
    setJeLines(jeLines.filter((_, idx) => idx !== index));
  };

  const handleJeLineChange = (index: number, field: keyof JournalLine, value: any) => {
    const updated = [...jeLines];
    if (field === 'accountId') {
      const selectedAcc = accounts.find(a => a.id === value);
      if (selectedAcc) {
        updated[index].accountId = selectedAcc.id;
        updated[index].accountNumber = selectedAcc.number;
        updated[index].accountName = selectedAcc.name;
      }
    } else if (field === 'debit') {
      const num = parseFloat(value) || 0;
      updated[index].debit = num;
      if (num > 0) updated[index].credit = 0;
    } else if (field === 'credit') {
      const num = parseFloat(value) || 0;
      updated[index].credit = num;
      if (num > 0) updated[index].debit = 0;
    } else {
      (updated[index] as any)[field] = value;
    }
    setJeLines(updated);
  };

  const totalDebit = jeLines.reduce((sum, line) => sum + (line.debit || 0), 0);
  const totalCredit = jeLines.reduce((sum, line) => sum + (line.credit || 0), 0);
  const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01 && totalDebit > 0;

  // Link to Original Invoice Handlers
  const handleOpenLinkInvoiceModal = (tx: Transaction) => {
    setLinkingInvoiceTx(tx);
    setLinkInvoiceNumber(tx.originalInvoiceNumber || '');
    setLinkInvoiceDate(tx.originalInvoiceDate || tx.date);
    setLinkInvoiceAmount(tx.originalInvoiceAmount || tx.total);
    setLinkInvoiceMemo(tx.originalInvoiceMemo || '');
  };

  const handleSaveInvoiceLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!linkingInvoiceTx || !linkInvoiceNumber.trim()) return;

    linkTransactionToOriginalInvoice(linkingInvoiceTx.id, linkInvoiceNumber.trim(), {
      originalInvoiceDate: linkInvoiceDate || linkingInvoiceTx.date,
      originalInvoiceAmount: typeof linkInvoiceAmount === 'number' ? linkInvoiceAmount : linkingInvoiceTx.total,
      originalInvoiceMemo: linkInvoiceMemo || `Original invoice reference for ${linkingInvoiceTx.transactionNumber}`,
    });

    setPostSuccessMessage(`Linked ${linkingInvoiceTx.transactionNumber} to original invoice #${linkInvoiceNumber.trim()}!`);
    setLinkingInvoiceTx(null);
  };

  // Post Journal Handler
  const handlePostJournalEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isBalanced) {
      alert(`Journal entry is not balanced! Debits: ${formatCurrency(totalDebit)} vs Credits: ${formatCurrency(totalCredit)}.`);
      return;
    }

    const createdTx = addTransaction({
      transactionNumber: jeNumber,
      type: 'Journal_Entry',
      date: jeDate,
      postingPeriod: 'Aug 2026',
      entityId: 'ent-internal',
      entityName: jeEntityName,
      entityType: jeEntityType,
      status: 'Approved',
      currency: currentCurrency || 'USD',
      exchangeRate: 1.0,
      subtotal: totalDebit,
      taxTotal: 0,
      total: totalDebit,
      amountPaid: 0,
      balanceDue: 0,
      memo: jeMemo,
      department: 'Finance & Accounting',
      subsidiary: 'Small Business Co., Ltd.',
      items: [],
      journalLines: jeLines,
    });

    setPostSuccessMessage(`Successfully posted Journal Entry ${createdTx.transactionNumber} into the General Ledger!`);
    
    // Switch to txns tab after 1.2 seconds or allow viewing
    setTimeout(() => {
      setActiveModalTab('txns');
    }, 1200);
  };

  // Node Component
  interface WorkflowNodeProps {
    id: string;
    title: string;
    subLabel?: string;
    icon: React.ReactNode;
    iconBgColor: string;
    linkedGL?: string;
    badge?: string | number;
    badgeColor?: string;
    onClick: () => void;
    onLinkClick?: () => void;
    onSeeTxnsClick?: () => void;
    onPostJournalClick?: () => void;
  }

  const WorkflowNode: React.FC<WorkflowNodeProps> = ({
    id,
    title,
    subLabel,
    icon,
    iconBgColor,
    linkedGL,
    badge,
    badgeColor = 'bg-red-500',
    onClick,
    onLinkClick,
    onSeeTxnsClick,
    onPostJournalClick
  }) => {
    const isHighlighted = searchTerm && (
      title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (subLabel && subLabel.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (linkedGL && linkedGL.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const isSelected = activeWorkflowModal === title;

    return (
      <div 
        id={id}
        className={`relative group bg-white hover:bg-orange-50/40 rounded-xl p-3 border transition-all duration-200 shadow-2xs hover:shadow-md flex flex-col items-center text-center cursor-pointer min-w-[130px] sm:min-w-[145px] max-w-[165px] ${
          isSelected 
            ? 'ring-2 ring-[#d65200] border-[#d65200] bg-orange-50/70 shadow-sm'
            : isHighlighted 
              ? 'ring-2 ring-amber-500 bg-amber-50/60 border-amber-300' 
              : 'border-gray-200 hover:border-[#d65200]/50'
        }`}
        onClick={onClick}
      >
        {/* Optional Badge */}
        {badge !== undefined && (
          <span className={`absolute -top-2 -right-2 ${badgeColor} text-white font-bold text-[10px] w-5 h-5 rounded-full flex items-center justify-center shadow-xs animate-pulse ring-2 ring-white z-10`}>
            {badge}
          </span>
        )}

        {/* Icon Circle */}
        <div className={`w-11 h-11 rounded-full ${iconBgColor} flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform mb-2 shrink-0`}>
          {icon}
        </div>

        {/* Title */}
        <div className="font-bold text-xs text-gray-800 leading-tight group-hover:text-[#d65200] transition-colors line-clamp-2">
          {title}
        </div>

        {/* Sub label or GL mapping tag */}
        {linkedGL && (
          <span className="text-[10px] font-mono font-semibold text-gray-500 mt-1 bg-gray-100 px-1.5 py-0.5 rounded border border-gray-200 group-hover:border-orange-200 group-hover:bg-white">
            GL: {linkedGL}
          </span>
        )}

        {/* Action Link Icons on Hover / Footer */}
        <div className="mt-2.5 flex items-center justify-center gap-1 w-full pt-1.5 border-t border-gray-100 group-hover:border-orange-200">
          <button
            type="button"
            title="See live transactions and ledger for this step"
            onClick={(e) => {
              e.stopPropagation();
              if (onSeeTxnsClick) {
                onSeeTxnsClick();
              } else {
                handleOpenNodeModal(title, 'txns');
              }
            }}
            className="p-1 rounded bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white transition text-[9px] font-bold flex items-center gap-0.5 px-1.5 shadow-2xs"
          >
            <Eye className="w-2.5 h-2.5" />
            <span>Txns</span>
          </button>

          <button
            type="button"
            title="Post a general journal entry or voucher for this step"
            onClick={(e) => {
              e.stopPropagation();
              if (onPostJournalClick) {
                onPostJournalClick();
              } else {
                handleOpenNodeModal(title, 'post_journal');
              }
            }}
            className="p-1 rounded bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white transition text-[9px] font-bold flex items-center gap-0.5 px-1.5 shadow-2xs"
          >
            <Edit3 className="w-2.5 h-2.5" />
            <span>Journal</span>
          </button>

          <button
            type="button"
            title="Link this entity name to another GL account"
            onClick={(e) => {
              e.stopPropagation();
              if (onLinkClick) {
                onLinkClick();
              } else {
                handleOpenLinkerForNode(title, 'Transaction Name', linkedGL);
              }
            }}
            className="p-1 rounded bg-orange-50 hover:bg-[#d65200] text-[#d65200] hover:text-white transition text-[9px] font-bold flex items-center gap-0.5 px-1.5 shadow-2xs"
          >
            <Link2 className="w-2.5 h-2.5" />
            <span>Link</span>
          </button>
        </div>
      </div>
    );
  };

  // Filter transactions for active modal
  const getFilteredTransactionsForNode = () => {
    if (!activeWorkflowModal) return [];

    let list = [...transactions];

    if (activeWorkflowModal === 'Enter Bills Against Inventory' || activeWorkflowModal === 'Enter Bills') {
      list = list.filter(t => t.type === 'Bill' || t.type === 'Journal_Entry');
    } else if (activeWorkflowModal === 'Purchase Orders') {
      list = list.filter(t => t.type === 'Bill' || t.transactionNumber.startsWith('PO') || t.entityType === 'Vendor');
    } else if (activeWorkflowModal === 'Receive Inventory') {
      list = list.filter(t => t.type === 'Bill' || t.memo?.toLowerCase().includes('inventory') || t.entityType === 'Vendor');
    } else if (activeWorkflowModal === 'Pay Bills' || activeWorkflowModal === 'Write Checks') {
      list = list.filter(t => t.type === 'Bill_Payment' || t.type === 'Bill' || t.entityType === 'Vendor');
    } else if (activeWorkflowModal === 'Create Invoices' || activeWorkflowModal === 'Sales Orders' || activeWorkflowModal === 'Estimates') {
      list = list.filter(t => t.type === 'Invoice' || t.entityType === 'Customer');
    } else if (activeWorkflowModal === 'Receive Payments' || activeWorkflowModal === 'Record Deposits') {
      list = list.filter(t => t.type === 'Payment_Received' || t.type === 'Invoice');
    } else if (activeWorkflowModal.includes('Payroll') || activeWorkflowModal.includes('Time') || activeWorkflowModal.includes('Employees')) {
      list = list.filter(t => t.entityType === 'Employee' || t.type === 'Journal_Entry' || t.memo?.toLowerCase().includes('salary'));
    }

    if (txFilterStatus !== 'all') {
      list = list.filter(t => t.status.toLowerCase() === txFilterStatus.toLowerCase());
    }

    return list;
  };

  const currentFilteredTxns = getFilteredTransactionsForNode();

  return (
    <div className="space-y-6 animate-in fade-in duration-200 pb-12">
      {/* Search Filter for Workflow Nodes */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-3.5 rounded-xl border border-gray-200 shadow-2xs">
        <div className="relative flex-1 w-full sm:max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search any node (e.g. Bills, Inventory, PO, Invoice, Payroll)..."
            className="w-full pl-9 pr-4 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d65200] focus:bg-white"
          />
        </div>
        <div className="text-xs text-gray-500 flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
          <span className="flex items-center gap-1 text-gray-600">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
            Click node to see transactions & post journal
          </span>
          <button
            onClick={() => setWorkflowViewMode('analytics')}
            className="text-[#d65200] hover:underline font-bold text-xs flex items-center gap-1"
          >
            <span>Analytics Dashboard</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 
        ========================================================================
        MAIN WORKFLOW DIAGRAM CANVAS (MATCHING EXACT BUSINESS WORKFLOW FLOWCHART)
        ========================================================================
      */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN (Vendors, Customers, Employees) - 8.5 Cols */}
        <div className="xl:col-span-8 space-y-6">

          {/* 1. VENDORS SECTION */}
          <div className="bg-white rounded-2xl border border-gray-200/90 p-5 shadow-sm relative">
            {/* Section Header Pill */}
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-md bg-blue-100/90 text-blue-900 font-bold text-xs uppercase tracking-wider shadow-2xs">
                  VENDORS
                </span>
                <span className="text-xs text-gray-500 font-medium">Accounts Payable & Supplier Purchases</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleOpenNodeModal('Enter Bills Against Inventory', 'post_journal')}
                  className="text-xs bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold px-2.5 py-1 rounded-lg border border-emerald-200 transition flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  <span>Post Bill Journal</span>
                </button>
                <button
                  onClick={() => {
                    setActiveTab('transactions');
                    setSubView('payable_vendors');
                  }}
                  className="text-xs text-[#d65200] font-semibold hover:underline flex items-center gap-1 cursor-pointer bg-orange-50/60 hover:bg-orange-100/80 px-2.5 py-1 rounded-lg border border-orange-200/60 transition"
                  title="View all Vendor Transactions, Bills, and Accounts Payable"
                >
                  <span>Vendor Transactions</span>
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Vendor Nodes Flow */}
            <div className="space-y-6">
              
              {/* Row 1: Purchase Orders -> Receive Inventory -> Enter Bills Against Inventory -> (down to Pay Bills) */}
              <div className="flex flex-wrap items-center justify-start gap-4 sm:gap-6 relative">
                
                {/* 1. Purchase Orders */}
                <WorkflowNode
                  id="node-po"
                  title="Purchase Orders"
                  subLabel="Vendor PO Master"
                  linkedGL="2010 AP"
                  iconBgColor="bg-emerald-600"
                  icon={<FileCheck className="w-5 h-5" />}
                  onClick={() => handleOpenNodeModal('Purchase Orders', 'txns')}
                  onSeeTxnsClick={() => {
                    setActiveTab('transactions');
                    setSubView('payable_vendors');
                  }}
                  onPostJournalClick={() => handleOpenNodeModal('Purchase Orders', 'post_journal')}
                  onLinkClick={() => handleOpenLinkerForNode('Purchase Orders', 'Service Item', 'acc-2010')}
                />

                <ArrowRight className="w-5 h-5 text-gray-300 hidden sm:block shrink-0" />

                {/* 2. Receive Inventory */}
                <WorkflowNode
                  id="node-receive-inv"
                  title="Receive Inventory"
                  subLabel="Goods Receipt"
                  linkedGL="1300 Stock"
                  iconBgColor="bg-amber-500"
                  icon={<Package className="w-5 h-5" />}
                  onClick={() => handleOpenNodeModal('Receive Inventory', 'txns')}
                  onSeeTxnsClick={() => {
                    setActiveTab('transactions');
                    setSubView('payable_vendors');
                  }}
                  onPostJournalClick={() => handleOpenNodeModal('Receive Inventory', 'post_journal')}
                  onLinkClick={() => handleOpenLinkerForNode('Inventory Items', 'Service Item', 'acc-1200')}
                />

                <ArrowRight className="w-5 h-5 text-gray-300 hidden sm:block shrink-0" />

                {/* 3. Enter Bills Against Inventory (TARGET ELEMENT WITH ENHANCED CONTROLS) */}
                <WorkflowNode
                  id="node-bills-against-inv"
                  title="Enter Bills Against Inventory"
                  subLabel="3-Way Match"
                  linkedGL="2010 AP"
                  iconBgColor="bg-blue-600"
                  icon={<Receipt className="w-5 h-5" />}
                  badge="Match"
                  badgeColor="bg-[#d65200]"
                  onClick={() => handleOpenNodeModal('Enter Bills Against Inventory', 'expenses_platform')}
                  onSeeTxnsClick={() => {
                    setActiveTab('transactions');
                    setSubView('payable_vendors');
                  }}
                  onPostJournalClick={() => handleOpenNodeModal('Enter Bills Against Inventory', 'post_journal')}
                  onLinkClick={() => handleOpenLinkerForNode('Vendor Bills (Inventory)', 'Vendor', 'acc-2010')}
                />

              </div>

              {/* Row 2: Enter Bills -> Pay Bills & Manage Sales Tax */}
              <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-gray-100">
                
                <div className="flex items-center gap-4 sm:gap-6">
                  {/* Enter Bills */}
                  <WorkflowNode
                    id="node-enter-bills"
                    title="Enter Bills"
                    subLabel="AP Direct Bills"
                    linkedGL="5010 Direct Cost"
                    iconBgColor="bg-blue-500"
                    icon={<FileText className="w-5 h-5" />}
                    onClick={() => handleOpenNodeModal('Enter Bills', 'expenses_platform')}
                    onSeeTxnsClick={() => {
                      setActiveTab('transactions');
                      setSubView('payable_vendors');
                    }}
                    onPostJournalClick={() => handleOpenNodeModal('Enter Bills', 'post_journal')}
                    onLinkClick={() => handleOpenLinkerForNode('Direct Supplier Bills', 'Vendor', 'acc-2010')}
                  />

                  <ArrowRight className="w-5 h-5 text-gray-300 hidden sm:block shrink-0" />

                  {/* Pay Bills */}
                  <WorkflowNode
                    id="node-pay-bills"
                    title="Pay Bills"
                    subLabel="Settlement & Cheques"
                    linkedGL="1010 Bank"
                    iconBgColor="bg-indigo-600"
                    icon={<Send className="w-5 h-5" />}
                    onClick={() => handleOpenNodeModal('Pay Bills', 'txns')}
                    onSeeTxnsClick={() => {
                      setActiveTab('transactions');
                      setSubView('payable_vendors');
                    }}
                    onPostJournalClick={() => handleOpenNodeModal('Pay Bills', 'post_journal')}
                    onLinkClick={() => handleOpenLinkerForNode('AP Bill Settlements', 'Vendor', 'acc-1020')}
                  />
                </div>

                {/* Manage Sales Tax */}
                <WorkflowNode
                  id="node-sales-tax"
                  title="Manage Sales Tax"
                  subLabel="VAT Form P.P. 30"
                  linkedGL="2100 VAT"
                  iconBgColor="bg-slate-700"
                  icon={<Calculator className="w-5 h-5" />}
                  onClick={() => {
                    setActiveTab('thai_tax');
                    setSubView('pp30');
                  }}
                  onLinkClick={() => handleOpenLinkerForNode('Value Added Tax (VAT)', 'General Entity', 'acc-2100')}
                />

              </div>

            </div>
          </div>

          {/* 2. CUSTOMERS SECTION */}
          <div className="bg-white rounded-2xl border border-gray-200/90 p-5 shadow-sm relative">
            {/* Section Header Pill */}
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-md bg-blue-100/90 text-blue-900 font-bold text-xs uppercase tracking-wider shadow-2xs">
                  CUSTOMERS
                </span>
                <span className="text-xs text-gray-500 font-medium">Accounts Receivable, Billing & Cash Inflows</span>
              </div>
              <button
                onClick={() => {
                  setActiveTab('transactions');
                  setSubView('invoices');
                }}
                className="text-xs text-[#d65200] font-semibold hover:underline flex items-center gap-1"
              >
                <span>View AR Ledger</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>

            {/* Customer Nodes Flow */}
            <div className="space-y-6">
              
              {/* Row 1: Estimates -> Sales Orders -> Create Invoices -> Receive Payments */}
              <div className="flex flex-wrap items-center justify-start gap-4 sm:gap-5">
                
                {/* Estimates */}
                <WorkflowNode
                  id="node-estimates"
                  title="Estimates"
                  subLabel="Price Quotations"
                  linkedGL="4010 Revenue"
                  iconBgColor="bg-amber-600"
                  icon={<Calculator className="w-5 h-5" />}
                  onClick={() => handleOpenNodeModal('Estimates', 'txns')}
                  onSeeTxnsClick={() => handleOpenNodeModal('Estimates', 'txns')}
                  onPostJournalClick={() => handleOpenNodeModal('Estimates', 'post_journal')}
                  onLinkClick={() => handleOpenLinkerForNode('Price Quotations', 'Customer', 'acc-4010')}
                />

                <ArrowRight className="w-4 h-4 text-gray-300 hidden sm:block shrink-0" />

                {/* Sales Orders */}
                <WorkflowNode
                  id="node-sales-orders"
                  title="Sales Orders"
                  subLabel="Customer Orders"
                  linkedGL="1100 AR"
                  iconBgColor="bg-blue-700"
                  icon={<FileText className="w-5 h-5" />}
                  onClick={() => handleOpenNodeModal('Sales Orders', 'txns')}
                  onSeeTxnsClick={() => handleOpenNodeModal('Sales Orders', 'txns')}
                  onPostJournalClick={() => handleOpenNodeModal('Sales Orders', 'post_journal')}
                  onLinkClick={() => handleOpenLinkerForNode('Sales Orders Master', 'Customer', 'acc-1100')}
                />

                <ArrowRight className="w-4 h-4 text-gray-300 hidden sm:block shrink-0" />

                {/* Create Invoices */}
                <WorkflowNode
                  id="node-create-invoices"
                  title="Create Invoices"
                  subLabel="Tax Invoices / Bills"
                  linkedGL="1100 AR"
                  iconBgColor="bg-blue-600"
                  icon={<FileText className="w-5 h-5" />}
                  onClick={() => setIsQuickInvoiceOpen(true)}
                  onSeeTxnsClick={() => handleOpenNodeModal('Create Invoices', 'txns')}
                  onPostJournalClick={() => handleOpenNodeModal('Create Invoices', 'post_journal')}
                  onLinkClick={() => handleOpenLinkerForNode('Sales Invoices', 'Customer', 'acc-1100')}
                />

                <ArrowRight className="w-4 h-4 text-gray-300 hidden sm:block shrink-0" />

                {/* Receive Payments */}
                <WorkflowNode
                  id="node-receive-payments"
                  title="Receive Payments"
                  subLabel="Customer Receipts"
                  linkedGL="1030 Undeposited"
                  iconBgColor="bg-emerald-600"
                  icon={<DollarSign className="w-5 h-5" />}
                  onClick={() => handleOpenNodeModal('Receive Payments', 'txns')}
                  onSeeTxnsClick={() => handleOpenNodeModal('Receive Payments', 'txns')}
                  onPostJournalClick={() => handleOpenNodeModal('Receive Payments', 'post_journal')}
                  onLinkClick={() => handleOpenLinkerForNode('Customer Payments', 'Customer', 'acc-1030')}
                />

              </div>

              {/* Row 2: Accept Credit Cards & Create Sales Receipts */}
              <div className="flex flex-wrap items-center gap-4 sm:gap-6 pt-2 border-t border-gray-100">
                
                {/* Accept Credit Cards */}
                <WorkflowNode
                  id="node-accept-cc"
                  title="Accept Credit Cards"
                  subLabel="Merchant Gateway"
                  linkedGL="1020 Bank"
                  iconBgColor="bg-amber-500"
                  icon={<CreditCard className="w-5 h-5" />}
                  onClick={() => handleOpenNodeModal('Accept Credit Cards', 'txns')}
                  onLinkClick={() => handleOpenLinkerForNode('Credit Card Merchant', 'Customer', 'acc-1020')}
                />

                <ArrowRight className="w-4 h-4 text-gray-300 hidden sm:block shrink-0" />

                {/* Create Sales Receipts */}
                <WorkflowNode
                  id="node-sales-receipts"
                  title="Create Sales Receipts"
                  subLabel="Cash Inflow Receipts"
                  linkedGL="1010 Petty Cash"
                  iconBgColor="bg-amber-600"
                  icon={<Receipt className="w-5 h-5" />}
                  onClick={() => handleOpenNodeModal('Create Sales Receipts', 'txns')}
                  onLinkClick={() => handleOpenLinkerForNode('Cash Sales Receipts', 'Customer', 'acc-1010')}
                />

                <ArrowRight className="w-4 h-4 text-gray-300 hidden sm:block shrink-0" />

                {/* Refunds & Credits */}
                <WorkflowNode
                  id="node-refunds"
                  title="Refunds & Credits"
                  subLabel="Credit Memos"
                  linkedGL="1100 AR"
                  iconBgColor="bg-emerald-700"
                  icon={<RotateCcw className="w-5 h-5" />}
                  onClick={() => handleOpenNodeModal('Refunds & Credits', 'txns')}
                  onLinkClick={() => handleOpenLinkerForNode('Customer Credit Memo', 'Customer', 'acc-1100')}
                />

              </div>

              {/* Row 3: Statement Charges -> Finance Charges -> Statements */}
              <div className="flex flex-wrap items-center gap-4 sm:gap-6 pt-2 border-t border-gray-100">
                
                {/* Statement Charges */}
                <WorkflowNode
                  id="node-stmt-charges"
                  title="Statement Charges"
                  subLabel="Periodic Billing"
                  linkedGL="1100 AR"
                  iconBgColor="bg-emerald-600"
                  icon={<Calendar className="w-5 h-5" />}
                  onClick={() => handleOpenNodeModal('Statement Charges', 'txns')}
                  onLinkClick={() => handleOpenLinkerForNode('Statement Charges', 'Customer', 'acc-1100')}
                />

                <ArrowRight className="w-4 h-4 text-gray-300 hidden sm:block shrink-0" />

                {/* Finance Charges */}
                <WorkflowNode
                  id="node-finance-charges"
                  title="Finance Charges"
                  subLabel="Late Interest %"
                  linkedGL="4030 Other Rev"
                  iconBgColor="bg-amber-600"
                  icon={<Percent className="w-5 h-5" />}
                  onClick={() => handleOpenNodeModal('Finance Charges', 'txns')}
                  onLinkClick={() => handleOpenLinkerForNode('Finance Charges', 'Customer', 'acc-4030')}
                />

                <ArrowRight className="w-4 h-4 text-gray-300 hidden sm:block shrink-0" />

                {/* Statements */}
                <WorkflowNode
                  id="node-statements"
                  title="Statements"
                  subLabel="Customer Balance"
                  linkedGL="1100 AR"
                  iconBgColor="bg-blue-600"
                  icon={<FolderOpen className="w-5 h-5" />}
                  onClick={() => handleOpenNodeModal('Statements', 'txns')}
                  onLinkClick={() => handleOpenLinkerForNode('Customer Statement Accounts', 'Customer', 'acc-1100')}
                />

              </div>

            </div>
          </div>

          {/* 3. EMPLOYEES SECTION */}
          <div className="bg-white rounded-2xl border border-gray-200/90 p-5 shadow-sm relative">
            {/* Section Header Pill */}
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-md bg-blue-100/90 text-blue-900 font-bold text-xs uppercase tracking-wider shadow-2xs">
                  EMPLOYEES
                </span>
                <span className="text-xs text-gray-500 font-medium">Payroll, Timesheets, Social Security & Staff Taxes</span>
              </div>
              <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Payroll Cycle Active</span>
              </span>
            </div>

            {/* Employee Nodes Flow */}
            <div className="flex flex-wrap items-center justify-start gap-4 sm:gap-5">
              
              {/* Payroll Center */}
              <WorkflowNode
                id="node-payroll-center"
                title="Payroll Center"
                subLabel="Salary Master"
                linkedGL="6010 Salary"
                iconBgColor="bg-blue-700"
                icon={<Users className="w-5 h-5" />}
                onClick={() => handleOpenNodeModal('Payroll Center', 'txns')}
                onSeeTxnsClick={() => handleOpenNodeModal('Payroll Center', 'txns')}
                onPostJournalClick={() => handleOpenNodeModal('Payroll Center', 'post_journal')}
                onLinkClick={() => handleOpenLinkerForNode('Employee Salaries', 'Transaction Name', 'acc-6010')}
              />

              {/* Enter Time */}
              <WorkflowNode
                id="node-enter-time"
                title="Enter Time"
                subLabel="Staff Hours & Timesheet"
                linkedGL="6010 / 4010"
                iconBgColor="bg-emerald-600"
                icon={<Clock className="w-5 h-5" />}
                onClick={() => handleOpenNodeModal('Enter Time', 'txns')}
                onLinkClick={() => handleOpenLinkerForNode('Billable Timesheets', 'Service Item', 'acc-6010')}
              />

              <ArrowRight className="w-4 h-4 text-gray-300 hidden sm:block shrink-0" />

              {/* Pay Employees */}
              <WorkflowNode
                id="node-pay-employees"
                title="Pay Employees"
                subLabel="Disbursement"
                linkedGL="1020 Bank"
                iconBgColor="bg-amber-700"
                icon={<DollarSign className="w-5 h-5" />}
                onClick={() => handleOpenNodeModal('Pay Employees', 'txns')}
                onLinkClick={() => handleOpenLinkerForNode('Payroll Payouts', 'Transaction Name', 'acc-1020')}
              />

              <ArrowRight className="w-4 h-4 text-gray-300 hidden sm:block shrink-0" />

              {/* Pay Liabilities */}
              <WorkflowNode
                id="node-pay-liabilities"
                title="Pay Liabilities"
                subLabel="SSF & PND 1 Tax"
                linkedGL="2140 SSF"
                iconBgColor="bg-emerald-700"
                icon={<Building2 className="w-5 h-5" />}
                onClick={() => handleOpenNodeModal('Pay Liabilities', 'txns')}
                onLinkClick={() => handleOpenLinkerForNode('Social Security Liabilities', 'General Entity', 'acc-2140')}
              />

              <ArrowRight className="w-4 h-4 text-gray-300 hidden sm:block shrink-0" />

              {/* Process Payroll Forms */}
              <WorkflowNode
                id="node-payroll-forms"
                title="Process Payroll Forms"
                subLabel="PND 1 Kor & SSF"
                linkedGL="2120 Tax"
                iconBgColor="bg-blue-600"
                icon={<FileCheck className="w-5 h-5" />}
                onClick={() => handleOpenNodeModal('Process Payroll Forms', 'txns')}
                onLinkClick={() => handleOpenLinkerForNode('Payroll Statutory Forms', 'General Entity', 'acc-2120')}
              />

              {/* HR Essentials and Insurance */}
              <WorkflowNode
                id="node-hr-insurance"
                title="HR Essentials & Insurance"
                subLabel="Group Benefits"
                linkedGL="6020 Benefits"
                iconBgColor="bg-indigo-600"
                icon={<Shield className="w-5 h-5" />}
                onClick={() => handleOpenNodeModal('HR Essentials & Insurance', 'txns')}
                onLinkClick={() => handleOpenLinkerForNode('Staff Insurance & Welfare', 'Service Item', 'acc-6020')}
              />

            </div>
          </div>

        </div>

        {/* RIGHT COLUMN (Company & Banking) - 3.5 Cols */}
        <div className="xl:col-span-4 space-y-6">

          {/* 4. COMPANY SECTION (Top Right) */}
          <div className="bg-white rounded-2xl border border-gray-200/90 p-5 shadow-sm relative">
            <div className="flex items-center justify-between mb-4">
              <span className="px-3 py-1 rounded-md bg-blue-100/90 text-blue-900 font-bold text-xs uppercase tracking-wider shadow-2xs">
                COMPANY
              </span>
              <span className="text-xs text-gray-400 font-medium">Core Master Data</span>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              
              {/* Chart of Accounts */}
              <WorkflowNode
                id="node-coa"
                title="Chart of Accounts"
                subLabel="All GL Accounts"
                linkedGL="Full Ledger"
                iconBgColor="bg-blue-600"
                icon={<BookOpen className="w-5 h-5" />}
                onClick={() => setActiveTab('coa')}
                onSeeTxnsClick={() => setActiveTab('coa')}
                onPostJournalClick={() => setIsQuickJournalOpen(true)}
                onLinkClick={() => {
                  setSelectedEntityForLink(null);
                  setIsAccountLinkerOpen(true);
                }}
              />

              {/* Items & Services */}
              <WorkflowNode
                id="node-items-services"
                title="Items & Services"
                subLabel="Products & SKUs"
                linkedGL="4010 / 5010"
                iconBgColor="bg-amber-500"
                icon={<Sliders className="w-5 h-5" />}
                onClick={() => handleOpenNodeModal('Items & Services', 'txns')}
                onLinkClick={() => handleOpenLinkerForNode('Tour Package Service Item', 'Service Item', 'acc-4010')}
              />

              {/* Inventory Activities */}
              <WorkflowNode
                id="node-inventory-act"
                title="Inventory Activities"
                subLabel="Stock & Allotments"
                linkedGL="1300 Asset"
                iconBgColor="bg-blue-700"
                icon={<Package className="w-5 h-5" />}
                onClick={() => handleOpenNodeModal('Inventory Activities', 'txns')}
                onLinkClick={() => handleOpenLinkerForNode('Hotel & Fleet Inventory', 'Service Item', 'acc-1200')}
              />

              {/* Order Supplies */}
              <WorkflowNode
                id="node-order-supplies"
                title="Order Supplies"
                subLabel="Procurement"
                linkedGL="6030 Expense"
                iconBgColor="bg-emerald-600"
                icon={<FileCheck className="w-5 h-5" />}
                onClick={() => handleOpenNodeModal('Order Supplies', 'post_journal')}
                onLinkClick={() => handleOpenLinkerForNode('Office & Operational Supplies', 'Service Item', 'acc-6030')}
              />

            </div>
          </div>

          {/* 5. BANKING SECTION (Bottom Right) */}
          <div className="bg-white rounded-2xl border border-gray-200/90 p-5 shadow-sm relative">
            <div className="flex items-center justify-between mb-4">
              <span className="px-3 py-1 rounded-md bg-blue-100/90 text-blue-900 font-bold text-xs uppercase tracking-wider shadow-2xs">
                BANKING
              </span>
              <span className="text-xs text-gray-400 font-medium">Cash Flow & Treasury</span>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              
              {/* Record Deposits */}
              <WorkflowNode
                id="node-record-deposits"
                title="Record Deposits"
                subLabel="Undeposited to Bank"
                linkedGL="1020 Bank"
                badge={undepositedCount}
                badgeColor="bg-amber-500"
                iconBgColor="bg-amber-600"
                icon={<Building2 className="w-5 h-5" />}
                onClick={() => handleOpenNodeModal('Record Deposits', 'txns')}
                onLinkClick={() => handleOpenLinkerForNode('Bank Deposits', 'Transaction Name', 'acc-1020')}
              />

              {/* Reconcile */}
              <WorkflowNode
                id="node-reconcile"
                title="Reconcile"
                subLabel="Bank Statement Match"
                linkedGL="Audit Matched"
                iconBgColor="bg-blue-600"
                icon={<RefreshCw className="w-5 h-5" />}
                onClick={() => handleOpenNodeModal('Reconcile', 'txns')}
                onLinkClick={() => handleOpenLinkerForNode('Bank Reconciliation Ledger', 'General Entity', 'acc-1020')}
              />

              {/* Write Checks */}
              <WorkflowNode
                id="node-write-checks"
                title="Write Checks"
                subLabel="Payment Voucher"
                linkedGL="1020 Bank"
                iconBgColor="bg-blue-700"
                icon={<DollarSign className="w-5 h-5" />}
                onClick={() => handleOpenNodeModal('Write Checks', 'post_journal')}
                onLinkClick={() => handleOpenLinkerForNode('Cheque Payments', 'Vendor', 'acc-1020')}
              />

              {/* Check Register */}
              <WorkflowNode
                id="node-check-register"
                title="Check Register"
                subLabel="Running Bank Ledger"
                linkedGL="Live Feed"
                iconBgColor="bg-blue-500"
                icon={<BookOpen className="w-5 h-5" />}
                onClick={() => handleOpenNodeModal('Check Register', 'txns')}
                onLinkClick={() => handleOpenLinkerForNode('Bank Check Register', 'General Entity', 'acc-1020')}
              />

              {/* Print Checks */}
              <WorkflowNode
                id="node-print-checks"
                title="Print Checks"
                subLabel="Batch Cheques & Vouchers"
                linkedGL="2010 AP"
                iconBgColor="bg-blue-600"
                icon={<Printer className="w-5 h-5" />}
                onClick={() => handleOpenNodeModal('Print Checks', 'txns')}
                onLinkClick={() => handleOpenLinkerForNode('Cheque Printing Batch', 'Vendor', 'acc-1020')}
              />

              {/* Enter Credit Card Charges */}
              <WorkflowNode
                id="node-enter-cc"
                title="Enter Credit Card Charges"
                subLabel="Corporate Expenses"
                linkedGL="2020 CC"
                iconBgColor="bg-amber-500"
                icon={<CreditCard className="w-5 h-5" />}
                onClick={() => handleOpenNodeModal('Enter Credit Card Charges', 'post_journal')}
                onLinkClick={() => handleOpenLinkerForNode('Corporate Credit Cards', 'Vendor', 'acc-2010')}
              />

            </div>
          </div>

        </div>

      </div>

      {/* 
        ========================================================================
        INTERACTIVE POPUP MODAL FOR WORKFLOW NODES (SEE TRANSACTIONS & POST JOURNAL)
        ========================================================================
      */}
      {activeWorkflowModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[94vh] flex flex-col border border-gray-200 overflow-hidden">
            
            {/* Modal Top Bar */}
            <div className="p-4 sm:p-5 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#d65200] flex items-center justify-center text-white shadow-xs">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base sm:text-lg font-bold text-white">
                      {activeWorkflowModal}
                    </h3>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-white/10 text-orange-200 border border-white/10">
                      Workflow Hub
                    </span>
                  </div>
                  <p className="text-xs text-gray-300">
                    Process NetSuite sublist items & expenses, review matching GL records, or post double-entry vouchers.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveWorkflowModal(null)}
                className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Sub Header with Tabs */}
            <div className="px-5 pt-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 overflow-x-auto">
                <button
                  id="modal-tab-expenses-platform"
                  onClick={() => setActiveModalTab('expenses_platform')}
                  className={`pb-3 px-3 text-xs font-bold transition flex items-center gap-1.5 border-b-2 shrink-0 ${
                    activeModalTab === 'expenses_platform' 
                      ? 'border-[#d65200] text-[#d65200]' 
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Layers className="w-4 h-4" />
                  <span>Expenses & Items Sublist Platform</span>
                </button>

                <button
                  id="modal-tab-see-txns"
                  onClick={() => setActiveModalTab('txns')}
                  className={`pb-3 px-3 text-xs font-bold transition flex items-center gap-1.5 border-b-2 shrink-0 ${
                    activeModalTab === 'txns' 
                      ? 'border-[#d65200] text-[#d65200]' 
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Eye className="w-4 h-4" />
                  <span>See Transactions ({currentFilteredTxns.length})</span>
                </button>

                <button
                  id="modal-tab-post-journal"
                  onClick={() => setActiveModalTab('post_journal')}
                  className={`pb-3 px-3 text-xs font-bold transition flex items-center gap-1.5 border-b-2 shrink-0 ${
                    activeModalTab === 'post_journal' 
                      ? 'border-[#d65200] text-[#d65200]' 
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Edit3 className="w-4 h-4" />
                  <span>Post Journal Entry</span>
                </button>
              </div>

              {activeModalTab === 'txns' && (
                <div className="flex items-center gap-1.5 pb-2 shrink-0">
                  <span className="text-[11px] text-gray-500 font-medium hidden sm:inline">Status:</span>
                  <select
                    value={txFilterStatus}
                    onChange={(e) => setTxFilterStatus(e.target.value)}
                    className="text-[11px] px-2 py-1 bg-white border border-gray-300 rounded-md font-medium text-gray-700"
                  >
                    <option value="all">All Statuses</option>
                    <option value="Approved">Approved</option>
                    <option value="Paid">Paid</option>
                    <option value="Partially_Paid">Partially Paid</option>
                    <option value="Draft">Draft</option>
                  </select>
                </div>
              )}
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto space-y-4 text-xs flex-1">
              
              {/* Success Notification */}
              {postSuccessMessage && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl flex items-center justify-between text-xs animate-in fade-in duration-200">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="font-semibold">{postSuccessMessage}</span>
                  </div>
                  <button 
                    onClick={() => setActiveModalTab('txns')}
                    className="text-emerald-800 underline text-[11px] font-bold"
                  >
                    View in Transactions
                  </button>
                </div>
              )}

              {/* 
                ========================================================================
                TAB 1: SEE TRANSACTIONS & GENERAL LEDGER RECORDS
                ========================================================================
              */}
              {activeModalTab === 'txns' && (
                <div className="space-y-4">
                  
                  {/* Summary Bar */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl">
                      <span className="text-[10px] text-gray-500 uppercase tracking-wider block font-semibold">Matched Transactions</span>
                      <span className="text-lg font-bold text-gray-900 font-mono mt-0.5 block">{currentFilteredTxns.length} Records</span>
                    </div>
                    <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl">
                      <span className="text-[10px] text-gray-500 uppercase tracking-wider block font-semibold">Total Monetary Volume</span>
                      <span className="text-lg font-bold text-blue-700 font-mono mt-0.5 block">
                        {formatCurrency(currentFilteredTxns.reduce((sum, t) => sum + (t.total || 0), 0))}
                      </span>
                    </div>
                    <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-gray-500 uppercase tracking-wider block font-semibold">Quick Action</span>
                        <span className="text-xs font-bold text-gray-800 block mt-0.5">Post New Journal</span>
                      </div>
                      <button
                        onClick={() => setActiveModalTab('post_journal')}
                        className="px-2.5 py-1.5 bg-[#d65200] hover:bg-[#b84300] text-white font-bold rounded-lg text-xs transition flex items-center gap-1 shadow-2xs"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Post</span>
                      </button>
                    </div>
                  </div>

                  {/* Transactions Table / List */}
                  {currentFilteredTxns.length === 0 ? (
                    <div className="p-8 text-center bg-gray-50 border border-dashed border-gray-300 rounded-2xl space-y-2">
                      <BookOpen className="w-8 h-8 text-gray-400 mx-auto" />
                      <h4 className="font-bold text-gray-700 text-sm">No transactions found for this node</h4>
                      <p className="text-gray-500 text-xs">
                        Post a new journal entry or record a transaction to see live records here.
                      </p>
                      <button
                        onClick={() => setActiveModalTab('post_journal')}
                        className="mt-2 px-4 py-2 bg-[#d65200] text-white font-bold rounded-xl text-xs hover:bg-[#b84300] transition inline-flex items-center gap-1.5 shadow-xs"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Post First Journal Entry</span>
                      </button>
                    </div>
                  ) : (
                    <div className="border border-gray-200 rounded-xl overflow-hidden divide-y divide-gray-100 bg-white">
                      {currentFilteredTxns.map((t) => {
                        const isExpanded = expandedTxId === t.id;
                        return (
                          <div key={t.id} className="p-3.5 hover:bg-gray-50/70 transition">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                              
                              {/* Left Info */}
                              <div className="space-y-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-mono font-bold text-gray-900 text-xs bg-gray-100 px-2 py-0.5 rounded border border-gray-200">
                                    {t.transactionNumber}
                                  </span>
                                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                    t.type === 'Bill' ? 'bg-amber-100 text-amber-800' :
                                    t.type === 'Invoice' ? 'bg-blue-100 text-blue-800' :
                                    t.type === 'Journal_Entry' ? 'bg-purple-100 text-purple-800' :
                                    'bg-emerald-100 text-emerald-800'
                                  }`}>
                                    {t.type.replace('_', ' ')}
                                  </span>
                                  <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                                    t.status === 'Approved' || t.status === 'Paid' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                                    t.status === 'Pending_Approval' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                                    'bg-gray-100 text-gray-700'
                                  }`}>
                                    {t.status.replace('_', ' ')}
                                  </span>
                                  <span className="text-gray-400 text-[11px] font-mono">• {t.date}</span>
                                </div>

                                <div className="text-gray-800 font-semibold text-xs flex items-center gap-2">
                                  <span>{t.entityName}</span>
                                  {t.memo && <span className="text-gray-500 font-normal text-[11px] truncate max-w-md">({t.memo})</span>}
                                </div>

                                {/* Linked Original Invoice Badge */}
                                {t.originalInvoiceNumber ? (
                                  <div className="flex items-center gap-2 pt-0.5">
                                    <button
                                      type="button"
                                      onClick={() => openOriginalInvoice(t)}
                                      className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-800 rounded-lg text-xs font-semibold transition group shadow-2xs"
                                      title="Open linked original invoice document voucher"
                                    >
                                      <FileCheck className="w-3.5 h-3.5 text-blue-600" />
                                      <span>Original Inv: <strong className="font-mono">#{t.originalInvoiceNumber}</strong></span>
                                      <ExternalLink className="w-3 h-3 text-blue-500 group-hover:translate-x-0.5 transition-transform" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleOpenLinkInvoiceModal(t)}
                                      className="text-[11px] text-blue-600 hover:text-blue-800 underline font-medium"
                                    >
                                      Edit Link
                                    </button>
                                  </div>
                                ) : (
                                  <div className="pt-0.5">
                                    <button
                                      type="button"
                                      onClick={() => handleOpenLinkInvoiceModal(t)}
                                      className="inline-flex items-center gap-1 text-[11px] text-gray-500 hover:text-blue-600 transition font-medium"
                                    >
                                      <Link2 className="w-3 h-3" />
                                      <span>+ Link to Original Invoice</span>
                                    </button>
                                  </div>
                                )}
                              </div>

                              {/* Right Amount and Controls */}
                              <div className="flex items-center gap-3 justify-between sm:justify-end">
                                <div className="text-right">
                                  <span className="font-mono font-bold text-sm text-gray-900 block">
                                    {formatCurrency(t.total, t.currency)}
                                  </span>
                                  <span className="text-[10px] text-gray-400 block font-mono">Period: {t.postingPeriod || 'Aug 2026'}</span>
                                </div>

                                <div className="flex items-center gap-1.5">
                                  {/* View Original Invoice directly if linked */}
                                  {t.originalInvoiceNumber && (
                                    <button
                                      type="button"
                                      title={`Open original invoice #${t.originalInvoiceNumber}`}
                                      onClick={() => openOriginalInvoice(t)}
                                      className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition border border-blue-200"
                                    >
                                      <FileCheck className="w-3.5 h-3.5" />
                                    </button>
                                  )}

                                  {/* View Document Preview Button */}
                                  <button
                                    type="button"
                                    title="View formal document voucher"
                                    onClick={() => {
                                      setPreviewDoc({
                                        type: t.type === 'Invoice' ? 'Invoice' : 'Bill',
                                        data: t
                                      });
                                    }}
                                    className="p-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition"
                                  >
                                    <FileText className="w-3.5 h-3.5" />
                                  </button>

                                  {/* Link / Relink Invoice Button */}
                                  <button
                                    type="button"
                                    title="Link or change original invoice association"
                                    onClick={() => handleOpenLinkInvoiceModal(t)}
                                    className="p-1.5 bg-blue-50 hover:bg-blue-600 text-blue-600 hover:text-white rounded-lg transition"
                                  >
                                    <Link2 className="w-3.5 h-3.5" />
                                  </button>

                                  {/* Toggle General Ledger lines */}
                                  <button
                                    type="button"
                                    title="Show full double-entry general ledger lines"
                                    onClick={() => setExpandedTxId(isExpanded ? null : t.id)}
                                    className={`px-2 py-1 rounded-lg text-[10px] font-bold transition flex items-center gap-1 ${
                                      isExpanded ? 'bg-gray-800 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                                    }`}
                                  >
                                    <BookOpen className="w-3 h-3" />
                                    <span>{isExpanded ? 'Hide GL' : 'View GL'}</span>
                                  </button>

                                  {/* Link Name to Other Account */}
                                  <button
                                    type="button"
                                    title="Link this vendor/entity name to another account"
                                    onClick={() => {
                                      handleOpenLinkerForNode(t.entityName, t.entityType || 'Vendor');
                                      setActiveWorkflowModal(null);
                                    }}
                                    className="p-1.5 bg-orange-50 hover:bg-[#d65200] text-[#d65200] hover:text-white rounded-lg transition"
                                  >
                                    <Users className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>

                            </div>

                            {/* Collapsible General Ledger Lines Breakdown */}
                            {isExpanded && (
                              <div className="mt-3 pt-3 border-t border-gray-100 bg-gray-50/80 rounded-lg p-3 text-xs space-y-2">
                                <div className="font-bold text-gray-700 flex items-center justify-between text-[11px] pb-1 border-b border-gray-200">
                                  <span>General Ledger Account Breakdown (Double Entry)</span>
                                  <span className="font-mono text-gray-500">Ref: {t.transactionNumber}</span>
                                </div>
                                {t.journalLines && t.journalLines.length > 0 ? (
                                  <div className="divide-y divide-gray-200/60 font-mono text-[11px]">
                                    {t.journalLines.map((jl) => (
                                      <div key={jl.id} className="py-1 flex items-center justify-between">
                                        <div>
                                          <span className="font-bold text-gray-900">{jl.accountNumber}</span>
                                          <span className="text-gray-600 ml-1.5">{jl.accountName}</span>
                                          {jl.memo && <span className="text-gray-400 ml-2 font-sans text-[10px]">({jl.memo})</span>}
                                        </div>
                                        <div className="flex items-center gap-4">
                                          {jl.debit > 0 && <span className="text-emerald-700 font-bold">Dr: {formatCurrency(jl.debit)}</span>}
                                          {jl.credit > 0 && <span className="text-blue-700 font-bold">Cr: {formatCurrency(jl.credit)}</span>}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <div className="space-y-1 font-mono text-[11px]">
                                    <div className="flex justify-between text-gray-700">
                                      <span>Dr: 1300 / 5010 (Direct Inventory & Tour Cost)</span>
                                      <span className="text-emerald-700 font-bold">{formatCurrency(t.total, t.currency)}</span>
                                    </div>
                                    <div className="flex justify-between text-gray-700">
                                      <span>Cr: 2010 (Accounts Payable / Bank)</span>
                                      <span className="text-blue-700 font-bold">{formatCurrency(t.total, t.currency)}</span>
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}

                          </div>
                        );
                      })}
                    </div>
                  )}

                </div>
              )}

              {/* 
                ========================================================================
                TAB: EXPENSES & ITEMS SUBLIST PLATFORM (Exact NetSuite Subtab Grid)
                ========================================================================
              */}
              {activeModalTab === 'expenses_platform' && (
                <div className="space-y-4">
                  
                  {/* Bill Header Info Card */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/80 pb-2.5">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#d65200]"></span>
                        <span className="font-bold text-gray-900 text-xs uppercase tracking-wide">
                          Vendor Bill / 3-Way Match Sublist Platform
                        </span>
                      </div>
                      <div className="text-[11px] font-mono text-gray-500 bg-white px-2 py-0.5 rounded border border-gray-200">
                        Posting Currency: {currentCurrency || 'USD'}
                      </div>
                    </div>

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

                  {/* The NetSuite-style Sublist Platform Component */}
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

                  {/* Action Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={() => setActiveModalTab('txns')}
                      className="px-4 py-2 border border-gray-300 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition"
                    >
                      Cancel & Return to Txns
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleSaveSuiteBill}
                        className="px-5 py-2.5 bg-[#d65200] hover:bg-[#b84300] text-white rounded-xl font-bold text-xs transition flex items-center gap-2 shadow-xs"
                      >
                        <Check className="w-4 h-4" />
                        <span>Save & Post Vendor Bill ({formatCurrency(suiteGrossTotal || 5029)})</span>
                      </button>
                    </div>
                  </div>

                </div>
              )}

              {/* 
                ========================================================================
                TAB 3: POST JOURNAL ENTRY FORM
                ========================================================================
              */}
              {activeModalTab === 'post_journal' && (
                <form onSubmit={handlePostJournalEntry} className="space-y-4">
                  
                  {/* Preset quick buttons */}
                  <div className="flex flex-wrap items-center gap-2 p-2.5 bg-blue-50/70 border border-blue-200 rounded-xl">
                    <span className="text-blue-900 font-bold text-xs flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                      Quick Preset:
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        const accInv = accounts.find(a => a.number === '1300') || accounts[0];
                        const accAp = accounts.find(a => a.number === '2010') || accounts[1];
                        setJeLines([
                          { id: '1', accountId: accInv.id, accountNumber: accInv.number, accountName: accInv.name, debit: 2500, credit: 0, memo: 'Inventory goods received' },
                          { id: '2', accountId: accAp.id, accountNumber: accAp.number, accountName: accAp.name, debit: 0, credit: 2500, memo: 'Supplier AP liability' }
                        ]);
                      }}
                      className="px-2 py-1 bg-white hover:bg-blue-100 text-blue-800 rounded text-[11px] font-semibold border border-blue-200 transition"
                    >
                      3-Way Inventory Bill (Dr Stock / Cr AP)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const accExp = accounts.find(a => a.number === '5010') || accounts[0];
                        const accBank = accounts.find(a => a.number === '1020') || accounts[1];
                        setJeLines([
                          { id: '1', accountId: accExp.id, accountNumber: accExp.number, accountName: accExp.name, debit: 1800, credit: 0, memo: 'Operating direct expense' },
                          { id: '2', accountId: accBank.id, accountNumber: accBank.number, accountName: accBank.name, debit: 0, credit: 1800, memo: 'Bank cash disbursement' }
                        ]);
                      }}
                      className="px-2 py-1 bg-white hover:bg-blue-100 text-blue-800 rounded text-[11px] font-semibold border border-blue-200 transition"
                    >
                      Cash / Direct Expense
                    </button>
                  </div>

                  {/* Header Fields */}
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-gray-50 p-3.5 rounded-xl border border-gray-200">
                    <div>
                      <label className="block font-semibold text-gray-700 mb-1">Voucher / Ref # *</label>
                      <input
                        type="text"
                        value={jeNumber}
                        onChange={(e) => setJeNumber(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-white border border-gray-300 rounded font-mono font-bold text-gray-900"
                        required
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-gray-700 mb-1">Posting Date *</label>
                      <input
                        type="date"
                        value={jeDate}
                        onChange={(e) => setJeDate(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-white border border-gray-300 rounded font-mono text-gray-900"
                        required
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-gray-700 mb-1">Entity / Vendor Name *</label>
                      <input
                        type="text"
                        value={jeEntityName}
                        onChange={(e) => setJeEntityName(e.target.value)}
                        placeholder="e.g. Dusit Thani Hotels"
                        className="w-full px-2.5 py-1.5 bg-white border border-gray-300 rounded text-gray-900"
                        required
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-gray-700 mb-1">Entity Type</label>
                      <select
                        value={jeEntityType}
                        onChange={(e) => setJeEntityType(e.target.value as any)}
                        className="w-full px-2.5 py-1.5 bg-white border border-gray-300 rounded text-gray-900"
                      >
                        <option value="Vendor">Vendor (AP)</option>
                        <option value="Customer">Customer (AR)</option>
                        <option value="Employee">Employee (Staff)</option>
                        <option value="Other">General / Other</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Memo / Business Transaction Narrative</label>
                    <input
                      type="text"
                      value={jeMemo}
                      onChange={(e) => setJeMemo(e.target.value)}
                      placeholder="e.g. Inventory Goods Receipt 3-Way Match Settlement Voucher"
                      className="w-full px-3 py-1.5 border border-gray-300 rounded text-gray-900"
                    />
                  </div>

                  {/* Lines Table */}
                  <div className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-2xs">
                    <div className="bg-gray-100 px-3 py-2 font-bold text-gray-700 flex justify-between items-center text-xs">
                      <span>General Ledger Double-Entry Lines</span>
                      <button
                        type="button"
                        onClick={handleAddJeLine}
                        className="text-xs font-bold text-[#d65200] hover:underline flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Line Item</span>
                      </button>
                    </div>

                    <div className="p-3 space-y-2.5">
                      {jeLines.map((line, idx) => (
                        <div key={line.id || idx} className="grid grid-cols-12 gap-2 items-center text-xs">
                          {/* Account Selector */}
                          <div className="col-span-5">
                            <select
                              value={line.accountId}
                              onChange={(e) => handleJeLineChange(idx, 'accountId', e.target.value)}
                              className="w-full px-2 py-1.5 border border-gray-300 rounded bg-white font-medium text-gray-900 text-xs truncate"
                            >
                              {accounts.map(acc => (
                                <option key={acc.id} value={acc.id}>
                                  {acc.number} - {acc.name} ({acc.category})
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* Line Memo */}
                          <div className="col-span-3">
                            <input
                              type="text"
                              placeholder="Line description"
                              value={line.memo}
                              onChange={(e) => handleJeLineChange(idx, 'memo', e.target.value)}
                              className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs"
                            />
                          </div>

                          {/* Debit */}
                          <div className="col-span-2">
                            <input
                              type="number"
                              step="any"
                              placeholder="Debit (0.00)"
                              value={line.debit || ''}
                              onChange={(e) => handleJeLineChange(idx, 'debit', e.target.value)}
                              className="w-full px-2 py-1.5 border border-gray-300 rounded text-right font-mono font-bold text-emerald-700 text-xs"
                            />
                          </div>

                          {/* Credit */}
                          <div className="col-span-1">
                            <input
                              type="number"
                              step="any"
                              placeholder="Credit (0.00)"
                              value={line.credit || ''}
                              onChange={(e) => handleJeLineChange(idx, 'credit', e.target.value)}
                              className="w-full px-2 py-1.5 border border-gray-300 rounded text-right font-mono font-bold text-blue-700 text-xs"
                            />
                          </div>

                          {/* Delete Button */}
                          <div className="col-span-1 text-center">
                            <button
                              type="button"
                              onClick={() => handleRemoveJeLine(idx)}
                              disabled={jeLines.length <= 2}
                              className="text-gray-400 hover:text-rose-600 disabled:opacity-30 disabled:cursor-not-allowed transition"
                            >
                              <X className="w-4 h-4 mx-auto" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Balance Check Bar */}
                    <div className="p-3 bg-gray-50 border-t border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-2">
                        {isBalanced ? (
                          <div className="flex items-center gap-1.5 text-emerald-700 font-bold">
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Entry Balanced & Ready for Posting</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-rose-700 font-bold">
                            <AlertCircle className="w-4 h-4" />
                            <span>Unbalanced Difference: {formatCurrency(Math.abs(totalDebit - totalCredit))}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-4 font-mono font-bold">
                        <div className="text-emerald-700">
                          Total Debit: {formatCurrency(totalDebit)}
                        </div>
                        <div className="text-blue-700">
                          Total Credit: {formatCurrency(totalCredit)}
                        </div>
                      </div>
                    </div>

                  </div>

                  {/* Submit Button */}
                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setActiveModalTab('txns')}
                      className="px-4 py-2 border border-gray-300 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition"
                    >
                      Back to Transactions
                    </button>
                    <button
                      type="submit"
                      disabled={!isBalanced}
                      className="px-5 py-2.5 bg-[#d65200] hover:bg-[#b84300] disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-xl font-bold text-xs transition flex items-center gap-2 shadow-xs"
                    >
                      <Check className="w-4 h-4" />
                      <span>Post Journal Entry to General Ledger</span>
                    </button>
                  </div>

                </form>
              )}

            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between shrink-0">
              <button
                onClick={() => setActiveWorkflowModal(null)}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl font-semibold text-xs transition"
              >
                Close
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    handleOpenLinkerForNode(activeWorkflowModal, 'Workflow Action');
                    setActiveWorkflowModal(null);
                  }}
                  className="px-4 py-2 bg-orange-100 hover:bg-[#d65200] text-[#d65200] hover:text-white rounded-xl font-bold text-xs transition flex items-center gap-1.5 shadow-2xs"
                >
                  <Link2 className="w-3.5 h-3.5" />
                  <span>Link Name to Other Account</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* 
        ========================================================================
        LINK TRANSACTION TO ORIGINAL INVOICE MODAL
        ========================================================================
      */}
      {linkingInvoiceTx && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border border-gray-200 animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-4 bg-gradient-to-r from-blue-900 to-indigo-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-200">
                  <FileCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">Link to Original Invoice</h3>
                  <p className="text-[11px] text-blue-200">
                    Associate <span className="font-mono font-bold text-white">{linkingInvoiceTx.transactionNumber}</span> with its source invoice
                  </p>
                </div>
              </div>
              <button
                onClick={() => setLinkingInvoiceTx(null)}
                className="p-1 text-blue-300 hover:text-white rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSaveInvoiceLink} className="p-5 space-y-4 text-xs">
              <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl space-y-1">
                <span className="text-[10px] uppercase font-bold text-blue-800 tracking-wider block">Target Record</span>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-gray-900 text-xs">{linkingInvoiceTx.entityName}</span>
                  <span className="font-mono font-bold text-blue-900">{formatCurrency(linkingInvoiceTx.total, linkingInvoiceTx.currency)}</span>
                </div>
                <div className="text-gray-500 text-[11px] font-mono">
                  {linkingInvoiceTx.type} • {linkingInvoiceTx.date} • {linkingInvoiceTx.transactionNumber}
                </div>
              </div>

              {/* Quick Suggestions from existing invoices in system */}
              <div>
                <label className="block text-gray-700 font-bold text-xs mb-1">
                  Select Existing System Invoice (Optional):
                </label>
                <select
                  value={linkInvoiceNumber}
                  onChange={(e) => {
                    const selNum = e.target.value;
                    setLinkInvoiceNumber(selNum);
                    const matching = transactions.find(t => t.transactionNumber === selNum);
                    if (matching) {
                      setLinkInvoiceDate(matching.date);
                      setLinkInvoiceAmount(matching.total);
                      setLinkInvoiceMemo(`Matched to ${matching.type} ${matching.transactionNumber}`);
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 font-mono"
                >
                  <option value="">-- Choose from existing invoices/bills or type below --</option>
                  {transactions.map(t => (
                    <option key={t.id} value={t.transactionNumber}>
                      {t.transactionNumber} ({t.type}) - {t.entityName} - {formatCurrency(t.total, t.currency)} ({t.date})
                    </option>
                  ))}
                </select>
              </div>

              {/* Invoice Number */}
              <div>
                <label className="block text-gray-700 font-bold text-xs mb-1">
                  Original Invoice Number <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. INV-2026-0892 or PO-9921"
                  value={linkInvoiceNumber}
                  onChange={(e) => setLinkInvoiceNumber(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs font-mono font-semibold focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Date & Amount */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-700 font-bold text-xs mb-1">Original Invoice Date</label>
                  <input
                    type="date"
                    value={linkInvoiceDate}
                    onChange={(e) => setLinkInvoiceDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-bold text-xs mb-1">Original Amount ({linkingInvoiceTx.currency || 'USD'})</label>
                  <input
                    type="number"
                    step="any"
                    placeholder="0.00"
                    value={linkInvoiceAmount}
                    onChange={(e) => setLinkInvoiceAmount(parseFloat(e.target.value) || '')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs font-mono font-semibold text-right"
                  />
                </div>
              </div>

              {/* Note / Memo */}
              <div>
                <label className="block text-gray-700 font-bold text-xs mb-1">Audit Trail Memo</label>
                <input
                  type="text"
                  placeholder="e.g. Original commercial invoice reference for delivery match"
                  value={linkInvoiceMemo}
                  onChange={(e) => setLinkInvoiceMemo(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setLinkingInvoiceTx(null)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold text-xs transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!linkInvoiceNumber.trim()}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white rounded-xl font-bold text-xs transition flex items-center gap-2 shadow-xs"
                >
                  <Check className="w-4 h-4" />
                  <span>Save Linked Invoice</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
