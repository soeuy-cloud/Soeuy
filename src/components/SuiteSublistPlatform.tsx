import React, { useState, useEffect } from 'react';
import { 
  Check, 
  X, 
  Copy, 
  Plus, 
  Trash2, 
  ChevronDown, 
  Layers, 
  Columns, 
  Maximize2,
  Calendar,
  AlertCircle,
  FileText,
  Building,
  User,
  MessageSquare,
  Info,
  Sliders,
  BookOpen,
  CheckCircle,
  Sparkles,
  Search
} from 'lucide-react';
import { useAccounting } from '../context/AccountingContext';
import { CurrencyCode } from '../types';

export interface ExpenseSublistLine {
  id: string;
  category: string;
  accountId: string;
  accountNumber: string;
  accountName: string;
  amount: number;
  taxCodeId: string;
  taxRate: number;
  taxAmount: number;
  grossAmount: number;
  memo: string;
  department: string;
  serviceType: string;
  branch: string;
  amortizationSchedule: string;
  amortizationStart: string;
  amortizationEnd: string;
  residual: number;
  relatedAsset: string;
}

export interface ItemSublistLine {
  id: string;
  itemCode: string;
  itemName: string;
  quantity: number;
  units: string;
  rate: number;
  amount: number;
  taxCodeId: string;
  taxRate: number;
  taxAmount: number;
  grossAmount: number;
  memo: string;
  department: string;
  serviceType: string;
  branch: string;
}

interface SuiteSublistPlatformProps {
  initialExpenses?: ExpenseSublistLine[];
  initialItems?: ItemSublistLine[];
  onChangeExpenses?: (lines: ExpenseSublistLine[]) => void;
  onChangeItems?: (lines: ItemSublistLine[]) => void;
  onSubtotalChange?: (subtotal: number, taxTotal: number, grossTotal: number) => void;
  currency?: CurrencyCode;
}

export const SuiteSublistPlatform: React.FC<SuiteSublistPlatformProps> = ({
  initialExpenses,
  initialItems,
  onChangeExpenses,
  onChangeItems,
  onSubtotalChange,
  currency = 'USD'
}) => {
  const { 
    accounts, 
    taxCodes, 
    activeJurisdiction, 
    formatCurrency, 
    companyProfile,
    users 
  } = useAccounting();

  // Top Primary Subtab
  const [activeMainTab, setActiveMainTab] = useState<
    'expenses_items' | 
    'billing' | 
    'relationships' | 
    'communication' | 
    'system_info' | 
    'custom' | 
    'accounting_books' | 
    'approver_list' | 
    'gl_matching'
  >('expenses_items');

  // Secondary Subtab under "Expenses and Items"
  const [activeSubTab, setActiveSubTab] = useState<'expenses' | 'items'>('expenses');

  // Default Tax Code
  const defaultTaxCode = taxCodes.find(t => t.countryCode === activeJurisdiction?.countryCode && t.rate > 0) || taxCodes[0];
  const defaultRate = defaultTaxCode?.rate ?? 0.07;

  // ----------------------------------------------------
  // EXPENSE LINES STATE
  // ----------------------------------------------------
  const [expenseLines, setExpenseLines] = useState<ExpenseSublistLine[]>(
    initialExpenses || [
      {
        id: 'exp-1',
        category: 'Accommodation & Lodging',
        accountId: 'acc-5010',
        accountNumber: '5010',
        accountName: 'Direct Tour Operating Costs',
        amount: 3500.00,
        taxCodeId: defaultTaxCode?.id || 'tax-vat-7',
        taxRate: defaultRate,
        taxAmount: 3500.00 * defaultRate,
        grossAmount: 3500.00 * (1 + defaultRate),
        memo: 'Dusit Thani Bangkok Luxury Suite Reservations',
        department: 'Tour Operations',
        serviceType: 'Hotel Supplier',
        branch: 'Head Office (00000)',
        amortizationSchedule: 'None',
        amortizationStart: '',
        amortizationEnd: '',
        residual: 0,
        relatedAsset: 'None',
      },
      {
        id: 'exp-2',
        category: 'Transportation & Logistics',
        accountId: 'acc-5020',
        accountNumber: '5020',
        accountName: 'Vehicle Fleet & Fuel Costs',
        amount: 1200.00,
        taxCodeId: defaultTaxCode?.id || 'tax-vat-7',
        taxRate: defaultRate,
        taxAmount: 1200.00 * defaultRate,
        grossAmount: 1200.00 * (1 + defaultRate),
        memo: 'VIP Mercedes Sprinter Airport Transfers',
        department: 'Logistics & Fleet',
        serviceType: 'Transport Provider',
        branch: 'Head Office (00000)',
        amortizationSchedule: 'None',
        amortizationStart: '',
        amortizationEnd: '',
        residual: 0,
        relatedAsset: 'None',
      }
    ]
  );

  // Active Draft Expense Line for Inline Editor
  const [draftExpense, setDraftExpense] = useState<ExpenseSublistLine>({
    id: `draft-exp-${Date.now()}`,
    category: 'Sightseeing & Excursions',
    accountId: accounts.find(a => a.type === 'Expense')?.id || accounts[0]?.id || '',
    accountNumber: accounts.find(a => a.type === 'Expense')?.number || accounts[0]?.number || '5010',
    accountName: accounts.find(a => a.type === 'Expense')?.name || accounts[0]?.name || 'Operating Expenses',
    amount: 0,
    taxCodeId: defaultTaxCode?.id || 'tax-vat-7',
    taxRate: defaultRate,
    taxAmount: 0,
    grossAmount: 0,
    memo: '',
    department: 'Tour Operations',
    serviceType: 'Sightseeing / Ticket',
    branch: 'Head Office (00000)',
    amortizationSchedule: 'None',
    amortizationStart: '',
    amortizationEnd: '',
    residual: 0,
    relatedAsset: 'None',
  });

  const [selectedExpenseIndex, setSelectedExpenseIndex] = useState<number | null>(null);

  // ----------------------------------------------------
  // ITEM LINES STATE
  // ----------------------------------------------------
  const [itemLines, setItemLines] = useState<ItemSublistLine[]>(
    initialItems || [
      {
        id: 'item-1',
        itemCode: 'TOUR-PKG-DX',
        itemName: 'Angkor Wat Sunrise & Tonle Sap Discovery 5D/4N',
        quantity: 10,
        units: 'Pax',
        rate: 850.00,
        amount: 8500.00,
        taxCodeId: defaultTaxCode?.id || 'tax-vat-7',
        taxRate: defaultRate,
        taxAmount: 8500.00 * defaultRate,
        grossAmount: 8500.00 * (1 + defaultRate),
        memo: 'B2B Wholesale Group Booking',
        department: 'Tour Operations',
        serviceType: 'Inbound Package',
        branch: 'Head Office (00000)',
      }
    ]
  );

  const [draftItem, setDraftItem] = useState<ItemSublistLine>({
    id: `draft-item-${Date.now()}`,
    itemCode: '',
    itemName: '',
    quantity: 1,
    units: 'Unit',
    rate: 0,
    amount: 0,
    taxCodeId: defaultTaxCode?.id || 'tax-vat-7',
    taxRate: defaultRate,
    taxAmount: 0,
    grossAmount: 0,
    memo: '',
    department: 'Tour Operations',
    serviceType: 'Inbound Package',
    branch: 'Head Office (00000)',
  });

  const [selectedItemIndex, setSelectedItemIndex] = useState<number | null>(null);

  // ----------------------------------------------------
  // TOTALS CALCULATION
  // ----------------------------------------------------
  const totalExpenseAmount = expenseLines.reduce((sum, line) => sum + (line.amount || 0), 0);
  const totalExpenseTax = expenseLines.reduce((sum, line) => sum + (line.taxAmount || 0), 0);
  const totalExpenseGross = expenseLines.reduce((sum, line) => sum + (line.grossAmount || 0), 0);

  const totalItemAmount = itemLines.reduce((sum, line) => sum + (line.amount || 0), 0);
  const totalItemTax = itemLines.reduce((sum, line) => sum + (line.taxAmount || 0), 0);
  const totalItemGross = itemLines.reduce((sum, line) => sum + (line.grossAmount || 0), 0);

  const combinedSubtotal = totalExpenseAmount + totalItemAmount;
  const combinedTax = totalExpenseTax + totalItemTax;
  const combinedGross = totalExpenseGross + totalItemGross;

  useEffect(() => {
    if (onChangeExpenses) onChangeExpenses(expenseLines);
    if (onChangeItems) onChangeItems(itemLines);
    if (onSubtotalChange) onSubtotalChange(combinedSubtotal, combinedTax, combinedGross);
  }, [expenseLines, itemLines]);

  // Handle Expense Draft Calculations
  const updateDraftExpenseField = (field: keyof ExpenseSublistLine, value: any) => {
    setDraftExpense(prev => {
      const next = { ...prev, [field]: value };
      
      if (field === 'accountId') {
        const acc = accounts.find(a => a.id === value);
        if (acc) {
          next.accountNumber = acc.number;
          next.accountName = acc.name;
        }
      }

      if (field === 'taxCodeId') {
        const tc = taxCodes.find(t => t.id === value);
        if (tc) {
          next.taxRate = tc.rate;
        }
      }

      if (field === 'amount' || field === 'taxCodeId' || field === 'taxRate') {
        const amt = field === 'amount' ? (parseFloat(value) || 0) : next.amount;
        const rate = next.taxRate;
        next.amount = amt;
        next.taxAmount = amt * rate;
        next.grossAmount = amt + (amt * rate);
      }

      return next;
    });
  };

  // Add / Save Expense Line
  const handleAddExpenseLine = () => {
    if (!draftExpense.accountId || draftExpense.amount <= 0) {
      alert('Please select an Account and enter an Amount greater than zero.');
      return;
    }

    if (selectedExpenseIndex !== null) {
      // Update existing
      setExpenseLines(prev => prev.map((l, i) => i === selectedExpenseIndex ? draftExpense : l));
      setSelectedExpenseIndex(null);
    } else {
      // Append new
      setExpenseLines(prev => [...prev, { ...draftExpense, id: `exp-${Date.now()}` }]);
    }

    // Reset draft
    resetDraftExpense();
  };

  const resetDraftExpense = () => {
    const defaultAcc = accounts.find(a => a.type === 'Expense') || accounts[0];
    setDraftExpense({
      id: `draft-exp-${Date.now()}`,
      category: 'General Operations',
      accountId: defaultAcc?.id || '',
      accountNumber: defaultAcc?.number || '5010',
      accountName: defaultAcc?.name || 'Operating Expenses',
      amount: 0,
      taxCodeId: defaultTaxCode?.id || 'tax-vat-7',
      taxRate: defaultRate,
      taxAmount: 0,
      grossAmount: 0,
      memo: '',
      department: 'Tour Operations',
      serviceType: 'Sightseeing / Ticket',
      branch: 'Head Office (00000)',
      amortizationSchedule: 'None',
      amortizationStart: '',
      amortizationEnd: '',
      residual: 0,
      relatedAsset: 'None',
    });
    setSelectedExpenseIndex(null);
  };

  const handleClearAllExpenseLines = () => {
    if (window.confirm('Are you sure you want to clear all expense lines?')) {
      setExpenseLines([]);
      resetDraftExpense();
    }
  };

  const handleSelectExpenseLine = (idx: number) => {
    setSelectedExpenseIndex(idx);
    setDraftExpense({ ...expenseLines[idx] });
  };

  const handleRemoveExpenseLine = (idx: number) => {
    setExpenseLines(prev => prev.filter((_, i) => i !== idx));
    if (selectedExpenseIndex === idx) {
      resetDraftExpense();
    }
  };

  // Copy Previous Line
  const handleCopyPreviousExpense = () => {
    if (expenseLines.length > 0) {
      const lastLine = expenseLines[expenseLines.length - 1];
      setDraftExpense({
        ...lastLine,
        id: `draft-exp-${Date.now()}`,
        memo: `${lastLine.memo} (Copy)`
      });
    }
  };

  return (
    <div className="w-full bg-white rounded-lg border border-gray-300 shadow-sm overflow-hidden text-xs font-sans">
      
      {/* 
        ========================================================================
        1. PRIMARY ORANGE SUBTABS BAR (NETSUITE / SUITE ENTERPRISE STYLE)
        ========================================================================
      */}
      <div className="bg-[#eb6b20] px-2 pt-1 flex items-center justify-between overflow-x-auto select-none border-b border-[#d65200]">
        <div className="flex items-end gap-1 shrink-0">
          
          {/* Expenses and Items Subtab */}
          <button
            type="button"
            onClick={() => setActiveMainTab('expenses_items')}
            className={`px-3.5 py-1.5 text-xs font-bold transition flex items-center gap-1 relative ${
              activeMainTab === 'expenses_items'
                ? 'bg-transparent text-white border-b-2 border-white'
                : 'text-white/80 hover:text-white hover:bg-white/10 rounded-t'
            }`}
          >
            <span>Expenses and Items</span>
            {activeMainTab === 'expenses_items' && (
              <span className="absolute bottom-[-1px] left-1/2 -translate-x-1/2 w-0 h-0 border-x-4 border-x-transparent border-b-4 border-b-[#fdf1ea]"></span>
            )}
          </button>

          {/* Billing Subtab */}
          <button
            type="button"
            onClick={() => setActiveMainTab('billing')}
            className={`px-3 py-1.5 text-xs font-semibold transition ${
              activeMainTab === 'billing'
                ? 'text-white border-b-2 border-white'
                : 'text-white/80 hover:text-white hover:bg-white/10 rounded-t'
            }`}
          >
            Billing
          </button>

          {/* Relationships */}
          <button
            type="button"
            onClick={() => setActiveMainTab('relationships')}
            className={`px-3 py-1.5 text-xs font-semibold transition ${
              activeMainTab === 'relationships'
                ? 'text-white border-b-2 border-white'
                : 'text-white/80 hover:text-white hover:bg-white/10 rounded-t'
            }`}
          >
            Relationships
          </button>

          {/* Communication */}
          <button
            type="button"
            onClick={() => setActiveMainTab('communication')}
            className={`px-3 py-1.5 text-xs font-semibold transition ${
              activeMainTab === 'communication'
                ? 'text-white border-b-2 border-white'
                : 'text-white/80 hover:text-white hover:bg-white/10 rounded-t'
            }`}
          >
            Communication
          </button>

          {/* System Information */}
          <button
            type="button"
            onClick={() => setActiveMainTab('system_info')}
            className={`px-3 py-1.5 text-xs font-semibold transition ${
              activeMainTab === 'system_info'
                ? 'text-white border-b-2 border-white'
                : 'text-white/80 hover:text-white hover:bg-white/10 rounded-t'
            }`}
          >
            System Information
          </button>

          {/* Custom */}
          <button
            type="button"
            onClick={() => setActiveMainTab('custom')}
            className={`px-3 py-1.5 text-xs font-semibold transition ${
              activeMainTab === 'custom'
                ? 'text-white border-b-2 border-white'
                : 'text-white/80 hover:text-white hover:bg-white/10 rounded-t'
            }`}
          >
            Custom
          </button>

          {/* Accounting Books */}
          <button
            type="button"
            onClick={() => setActiveMainTab('accounting_books')}
            className={`px-3 py-1.5 text-xs font-semibold transition ${
              activeMainTab === 'accounting_books'
                ? 'text-white border-b-2 border-white'
                : 'text-white/80 hover:text-white hover:bg-white/10 rounded-t'
            }`}
          >
            Accounting Books
          </button>

          {/* Approver List */}
          <button
            type="button"
            onClick={() => setActiveMainTab('approver_list')}
            className={`px-3 py-1.5 text-xs font-semibold transition ${
              activeMainTab === 'approver_list'
                ? 'text-white border-b-2 border-white'
                : 'text-white/80 hover:text-white hover:bg-white/10 rounded-t'
            }`}
          >
            Approver List
          </button>

          {/* GL Matching */}
          <button
            type="button"
            onClick={() => setActiveMainTab('gl_matching')}
            className={`px-3 py-1.5 text-xs font-semibold transition ${
              activeMainTab === 'gl_matching'
                ? 'text-white border-b-2 border-white'
                : 'text-white/80 hover:text-white hover:bg-white/10 rounded-t'
            }`}
          >
            GL Matching
          </button>
        </div>

        {/* Right Corner Window Split Icon */}
        <div className="flex items-center gap-1 text-white pr-2 shrink-0">
          <button title="Toggle View Density" className="p-1 hover:bg-white/20 rounded transition">
            <div className="w-3.5 h-3.5 border-2 border-white flex flex-col justify-between p-0.5">
              <div className="w-full h-0.5 bg-white"></div>
              <div className="w-full h-0.5 bg-white"></div>
            </div>
          </button>
        </div>
      </div>

      {/* 
        ========================================================================
        2. SECONDARY SUBTAB BAR: EXPENSES 0.00 / ITEMS 0.00
        ========================================================================
      */}
      {activeMainTab === 'expenses_items' && (
        <div className="bg-[#fdf1ea] px-3 py-1 border-b border-[#f3d9ca] flex items-center justify-between">
          <div className="flex items-center gap-4 text-xs font-bold">
            
            {/* Expenses Subtab button with Live Total Counter */}
            <button
              type="button"
              onClick={() => setActiveSubTab('expenses')}
              className={`py-1 px-1 transition flex items-center gap-1 relative ${
                activeSubTab === 'expenses'
                  ? 'text-[#d65200] font-bold border-b-2 border-[#d65200]'
                  : 'text-gray-600 hover:text-gray-900 font-normal'
              }`}
            >
              <span>Expenses</span>
              <span className="font-mono">{totalExpenseAmount.toFixed(2)}</span>
            </button>

            {/* Items Subtab button with Live Total Counter */}
            <button
              type="button"
              onClick={() => setActiveSubTab('items')}
              className={`py-1 px-1 transition flex items-center gap-1 relative ${
                activeSubTab === 'items'
                  ? 'text-[#d65200] font-bold border-b-2 border-[#d65200]'
                  : 'text-gray-600 hover:text-gray-900 font-normal'
              }`}
            >
              <span>Items</span>
              <span className="font-mono">{totalItemAmount.toFixed(2)}</span>
            </button>
          </div>

          <div className="text-[11px] text-gray-500 font-mono">
            <span>Currency: <strong>{currency}</strong></span>
          </div>
        </div>
      )}

      {/* 
        ========================================================================
        3. EXPENSES VIEW: CLEAR ALL LINES & SUBLIST TABLE GRID
        ========================================================================
      */}
      {activeMainTab === 'expenses_items' && activeSubTab === 'expenses' && (
        <div className="p-3 space-y-3">
          
          {/* Top Actions: Clear All Lines */}
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={handleClearAllExpenseLines}
              className="px-3 py-1 bg-white hover:bg-gray-50 border border-gray-300 rounded text-xs font-semibold text-gray-700 shadow-2xs transition"
            >
              Clear All Lines
            </button>

            <div className="flex items-center gap-2 text-xs">
              <span className="text-gray-500 font-medium">Lines: <strong>{expenseLines.length}</strong></span>
              <span className="text-gray-300">|</span>
              <span className="text-gray-700 font-semibold">Subtotal: <strong className="font-mono text-gray-900">{formatCurrency(totalExpenseAmount)}</strong></span>
            </div>
          </div>

          {/* Sublist Grid Container with Horizontal Scroll */}
          <div className="border border-gray-300 rounded overflow-x-auto bg-white shadow-2xs">
            <table className="w-full text-left border-collapse min-w-[1300px]">
              
              {/* Header Row with Light Gray NetSuite-style layout */}
              <thead>
                <tr className="bg-[#ececec] border-b border-gray-300 text-[10px] uppercase font-bold text-gray-700 tracking-wider">
                  <th className="py-2 px-2.5 border-r border-gray-300 min-w-[140px]">
                    CATEGORY
                  </th>
                  <th className="py-2 px-2.5 border-r border-gray-300 min-w-[180px]">
                    ACCOUNT <span className="text-[#eb6b20] font-bold">*</span>
                  </th>
                  <th className="py-2 px-2.5 border-r border-gray-300 min-w-[100px] text-right">
                    AMOUNT <span className="text-[#eb6b20] font-bold">*</span>
                  </th>
                  <th className="py-2 px-2.5 border-r border-gray-300 min-w-[110px]">
                    TAX CODE <span className="text-[#eb6b20] font-bold">*</span>
                  </th>
                  <th className="py-2 px-2.5 border-r border-gray-300 min-w-[80px] text-center">
                    TAX RATE
                  </th>
                  <th className="py-2 px-2.5 border-r border-gray-300 min-w-[90px] text-right">
                    TAX AMT
                  </th>
                  <th className="py-2 px-2.5 border-r border-gray-300 min-w-[100px] text-right">
                    GROSS AMT
                  </th>
                  <th className="py-2 px-2.5 border-r border-gray-300 min-w-[160px]">
                    MEMO
                  </th>
                  <th className="py-2 px-2.5 border-r border-gray-300 min-w-[130px]">
                    DEPARTMENT <span className="text-[#eb6b20] font-bold">*</span>
                  </th>
                  <th className="py-2 px-2.5 border-r border-gray-300 min-w-[130px]">
                    SERVICE TYPE <span className="text-[#eb6b20] font-bold">*</span>
                  </th>
                  <th className="py-2 px-2.5 border-r border-gray-300 min-w-[130px]">
                    BRANCH <span className="text-[#eb6b20] font-bold">*</span>
                  </th>
                  <th className="py-2 px-2.5 border-r border-gray-300 min-w-[130px]">
                    AMORTIZATION SCHEDULE
                  </th>
                  <th className="py-2 px-2.5 border-r border-gray-300 min-w-[110px]">
                    AMORTIZATION START
                  </th>
                  <th className="py-2 px-2.5 border-r border-gray-300 min-w-[110px]">
                    AMORTIZATION END
                  </th>
                  <th className="py-2 px-2.5 border-r border-gray-300 min-w-[90px] text-right">
                    RESIDUAL
                  </th>
                  <th className="py-2 px-2.5 min-w-[110px]">
                    RELATED ASSET
                  </th>
                </tr>
              </thead>

              <tbody>
                {/* 1. Existing Saved Lines */}
                {expenseLines.map((line, idx) => {
                  const isSelected = selectedExpenseIndex === idx;
                  return (
                    <tr 
                      key={line.id} 
                      onClick={() => handleSelectExpenseLine(idx)}
                      className={`border-b border-gray-200 text-xs transition cursor-pointer hover:bg-blue-50/50 ${
                        isSelected ? 'bg-blue-50 ring-1 ring-blue-400' : (idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/40')
                      }`}
                    >
                      <td className="py-1.5 px-2.5 border-r border-gray-200 font-medium text-gray-800">
                        {line.category}
                      </td>
                      <td className="py-1.5 px-2.5 border-r border-gray-200 font-mono text-[11px] text-gray-900">
                        <strong>{line.accountNumber}</strong> {line.accountName}
                      </td>
                      <td className="py-1.5 px-2.5 border-r border-gray-200 font-mono font-bold text-right text-gray-900">
                        {line.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-1.5 px-2.5 border-r border-gray-200 text-gray-700">
                        {taxCodes.find(t => t.id === line.taxCodeId)?.code || line.taxCodeId}
                      </td>
                      <td className="py-1.5 px-2.5 border-r border-gray-200 text-center font-mono text-gray-600 bg-gray-50/60">
                        {(line.taxRate * 100).toFixed(0)}%
                      </td>
                      <td className="py-1.5 px-2.5 border-r border-gray-200 font-mono text-right text-orange-700">
                        {line.taxAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-1.5 px-2.5 border-r border-gray-200 font-mono font-bold text-right text-gray-900">
                        {line.grossAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-1.5 px-2.5 border-r border-gray-200 text-gray-600 truncate max-w-[180px]">
                        {line.memo || '—'}
                      </td>
                      <td className="py-1.5 px-2.5 border-r border-gray-200 text-gray-700">
                        {line.department}
                      </td>
                      <td className="py-1.5 px-2.5 border-r border-gray-200 text-gray-700">
                        {line.serviceType}
                      </td>
                      <td className="py-1.5 px-2.5 border-r border-gray-200 text-gray-700">
                        {line.branch}
                      </td>
                      <td className="py-1.5 px-2.5 border-r border-gray-200 text-gray-500">
                        {line.amortizationSchedule || 'None'}
                      </td>
                      <td className="py-1.5 px-2.5 border-r border-gray-200 font-mono text-[11px] text-gray-500">
                        {line.amortizationStart || '—'}
                      </td>
                      <td className="py-1.5 px-2.5 border-r border-gray-200 font-mono text-[11px] text-gray-500">
                        {line.amortizationEnd || '—'}
                      </td>
                      <td className="py-1.5 px-2.5 border-r border-gray-200 font-mono text-right text-gray-500">
                        {line.residual ? line.residual.toFixed(2) : '0.00'}
                      </td>
                      <td className="py-1.5 px-2.5 text-gray-500">
                        {line.relatedAsset || 'None'}
                      </td>
                    </tr>
                  );
                })}

                {/* 2. Active Inline Entry Editor Row */}
                <tr className="bg-white border-b-2 border-blue-500 shadow-sm">
                  {/* Category Dropdown */}
                  <td className="p-1 border-r border-gray-300">
                    <div className="relative">
                      <select
                        value={draftExpense.category}
                        onChange={(e) => updateDraftExpenseField('category', e.target.value)}
                        className="w-full px-2 py-1 bg-white border border-gray-300 rounded text-[11px] focus:outline-none focus:ring-1 focus:ring-blue-500 appearance-none pr-5 font-medium"
                      >
                        <option value="Accommodation & Lodging">Accommodation & Lodging</option>
                        <option value="Transportation & Logistics">Transportation & Logistics</option>
                        <option value="Sightseeing & Excursions">Sightseeing & Excursions</option>
                        <option value="Tour Guide & Field Staff">Tour Guide & Field Staff</option>
                        <option value="Meals & Catering (F&B)">Meals & Catering (F&B)</option>
                        <option value="Airfare & Domestic Flight">Airfare & Domestic Flight</option>
                        <option value="Office & Administration">Office & Administration</option>
                        <option value="Legal & Professional Fees">Legal & Professional Fees</option>
                      </select>
                      <ChevronDown className="w-3 h-3 text-gray-500 absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </td>

                  {/* Account Selector */}
                  <td className="p-1 border-r border-gray-300">
                    <select
                      value={draftExpense.accountId}
                      onChange={(e) => updateDraftExpenseField('accountId', e.target.value)}
                      className="w-full px-2 py-1 bg-white border border-gray-300 rounded text-[11px] font-mono focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      {accounts.map(a => (
                        <option key={a.id} value={a.id}>
                          {a.number} - {a.name}
                        </option>
                      ))}
                    </select>
                  </td>

                  {/* Amount Input */}
                  <td className="p-1 border-r border-gray-300">
                    <input
                      type="number"
                      placeholder="0.00"
                      value={draftExpense.amount || ''}
                      onChange={(e) => updateDraftExpenseField('amount', e.target.value)}
                      className="w-full px-2 py-1 bg-white border border-gray-300 rounded text-[11px] font-mono font-bold text-right focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </td>

                  {/* Tax Code Selector */}
                  <td className="p-1 border-r border-gray-300">
                    <select
                      value={draftExpense.taxCodeId}
                      onChange={(e) => updateDraftExpenseField('taxCodeId', e.target.value)}
                      className="w-full px-1.5 py-1 bg-white border border-gray-300 rounded text-[11px] focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      {taxCodes.map(t => (
                        <option key={t.id} value={t.id}>
                          {t.code} ({(t.rate * 100).toFixed(0)}%)
                        </option>
                      ))}
                    </select>
                  </td>

                  {/* Tax Rate (Auto - Diagonal Hatched Pattern Cell) */}
                  <td className="p-1 border-r border-gray-300 text-center font-mono font-semibold text-gray-700 bg-[repeating-linear-gradient(45deg,#f3f4f6,#f3f4f6_4px,#e5e7eb_4px,#e5e7eb_8px)]">
                    {(draftExpense.taxRate * 100).toFixed(0)}%
                  </td>

                  {/* Tax Amt (Auto) */}
                  <td className="p-1 border-r border-gray-300 font-mono text-right text-orange-700 bg-gray-50/50 px-2 font-medium">
                    {draftExpense.taxAmount.toFixed(2)}
                  </td>

                  {/* Gross Amt (Auto) */}
                  <td className="p-1 border-r border-gray-300 font-mono text-right font-bold text-gray-900 bg-gray-50/50 px-2">
                    {draftExpense.grossAmount.toFixed(2)}
                  </td>

                  {/* Memo */}
                  <td className="p-1 border-r border-gray-300">
                    <input
                      type="text"
                      placeholder="Line memo..."
                      value={draftExpense.memo}
                      onChange={(e) => updateDraftExpenseField('memo', e.target.value)}
                      className="w-full px-2 py-1 bg-white border border-gray-300 rounded text-[11px] focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </td>

                  {/* Department */}
                  <td className="p-1 border-r border-gray-300">
                    <select
                      value={draftExpense.department}
                      onChange={(e) => updateDraftExpenseField('department', e.target.value)}
                      className="w-full px-1.5 py-1 bg-white border border-gray-300 rounded text-[11px] focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="Tour Operations">Tour Operations</option>
                      <option value="Logistics & Fleet">Logistics & Fleet</option>
                      <option value="Commercial & Sales">Commercial & Sales</option>
                      <option value="Finance & Accounting">Finance & Accounting</option>
                      <option value="Management & Admin">Management & Admin</option>
                    </select>
                  </td>

                  {/* Service Type */}
                  <td className="p-1 border-r border-gray-300">
                    <select
                      value={draftExpense.serviceType}
                      onChange={(e) => updateDraftExpenseField('serviceType', e.target.value)}
                      className="w-full px-1.5 py-1 bg-white border border-gray-300 rounded text-[11px] focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="Hotel Supplier">Hotel Supplier</option>
                      <option value="Transport Provider">Transport Provider</option>
                      <option value="Tour Guide / Freelancer">Tour Guide / Freelancer</option>
                      <option value="Sightseeing / Ticket">Sightseeing / Ticket</option>
                      <option value="Restaurant / F&B">Restaurant / F&B</option>
                      <option value="Flight / Air Carrier">Flight / Air Carrier</option>
                      <option value="General Vendor">General Vendor</option>
                    </select>
                  </td>

                  {/* Branch */}
                  <td className="p-1 border-r border-gray-300">
                    <select
                      value={draftExpense.branch}
                      onChange={(e) => updateDraftExpenseField('branch', e.target.value)}
                      className="w-full px-1.5 py-1 bg-white border border-gray-300 rounded text-[11px] focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="Head Office (00000)">Head Office (00000)</option>
                      <option value="Siem Reap Hub (00001)">Siem Reap Hub (00001)</option>
                      <option value="Phuket Marine Branch (00002)">Phuket Marine Branch (00002)</option>
                      <option value="Chiang Mai Branch (00003)">Chiang Mai Branch (00003)</option>
                    </select>
                  </td>

                  {/* Amortization Schedule */}
                  <td className="p-1 border-r border-gray-300">
                    <select
                      value={draftExpense.amortizationSchedule}
                      onChange={(e) => updateDraftExpenseField('amortizationSchedule', e.target.value)}
                      className="w-full px-1.5 py-1 bg-white border border-gray-300 rounded text-[11px] focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="None">None</option>
                      <option value="12 Months Straight Line">12 Months Straight Line</option>
                      <option value="24 Months Straight Line">24 Months Straight Line</option>
                      <option value="36 Months Straight Line">36 Months Straight Line</option>
                    </select>
                  </td>

                  {/* Amortization Start */}
                  <td className="p-1 border-r border-gray-300">
                    <input
                      type="date"
                      value={draftExpense.amortizationStart}
                      onChange={(e) => updateDraftExpenseField('amortizationStart', e.target.value)}
                      className="w-full px-1 py-1 bg-white border border-gray-300 rounded text-[10px] font-mono"
                    />
                  </td>

                  {/* Amortization End */}
                  <td className="p-1 border-r border-gray-300">
                    <input
                      type="date"
                      value={draftExpense.amortizationEnd}
                      onChange={(e) => updateDraftExpenseField('amortizationEnd', e.target.value)}
                      className="w-full px-1 py-1 bg-white border border-gray-300 rounded text-[10px] font-mono"
                    />
                  </td>

                  {/* Residual */}
                  <td className="p-1 border-r border-gray-300">
                    <input
                      type="number"
                      placeholder="0.00"
                      value={draftExpense.residual || ''}
                      onChange={(e) => updateDraftExpenseField('residual', parseFloat(e.target.value) || 0)}
                      className="w-full px-1.5 py-1 bg-white border border-gray-300 rounded text-[11px] font-mono text-right"
                    />
                  </td>

                  {/* Related Asset */}
                  <td className="p-1">
                    <select
                      value={draftExpense.relatedAsset}
                      onChange={(e) => updateDraftExpenseField('relatedAsset', e.target.value)}
                      className="w-full px-1.5 py-1 bg-white border border-gray-300 rounded text-[11px]"
                    >
                      <option value="None">None</option>
                      <option value="AST-2026-001 (Van VIP)">AST-2026-001 (Van VIP)</option>
                      <option value="AST-2026-002 (Speedboat)">AST-2026-002 (Speedboat)</option>
                      <option value="AST-2026-003 (Office PC)">AST-2026-003 (Office PC)</option>
                    </select>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* 
            ========================================================================
            4. INLINE ACTION BUTTON BAR DIRECTLY UNDERNEATH ACTIVE ROW
            ========================================================================
          */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            {/* ✔ Add / Save Button */}
            <button
              type="button"
              onClick={handleAddExpenseLine}
              className="px-3.5 py-1.5 bg-[#0070d2] hover:bg-[#005fb2] text-white font-bold rounded flex items-center gap-1.5 shadow-xs transition"
            >
              <Check className="w-3.5 h-3.5 stroke-[3]" />
              <span>{selectedExpenseIndex !== null ? 'Update Line' : 'Add'}</span>
            </button>

            {/* ✖ Cancel Button */}
            <button
              type="button"
              onClick={resetDraftExpense}
              className="px-3 py-1.5 bg-white hover:bg-gray-100 border border-gray-300 text-gray-700 font-semibold rounded flex items-center gap-1 shadow-2xs transition"
            >
              <X className="w-3.5 h-3.5" />
              <span>Cancel</span>
            </button>

            {/* Copy Previous Button */}
            <button
              type="button"
              onClick={handleCopyPreviousExpense}
              disabled={expenseLines.length === 0}
              className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 border border-gray-300 text-gray-700 font-medium rounded flex items-center gap-1 transition"
            >
              <Copy className="w-3.5 h-3.5 text-gray-500" />
              <span>Copy Previous</span>
            </button>

            {/* + Insert Button */}
            <button
              type="button"
              onClick={handleAddExpenseLine}
              className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 border border-gray-300 text-gray-700 font-medium rounded flex items-center gap-1 transition"
            >
              <Plus className="w-3.5 h-3.5 text-gray-500" />
              <span>Insert</span>
            </button>

            {/* 🗑 Remove Button */}
            <button
              type="button"
              onClick={() => {
                if (selectedExpenseIndex !== null) {
                  handleRemoveExpenseLine(selectedExpenseIndex);
                } else if (expenseLines.length > 0) {
                  handleRemoveExpenseLine(expenseLines.length - 1);
                }
              }}
              disabled={expenseLines.length === 0}
              className="px-3 py-1.5 bg-gray-100 hover:bg-rose-50 disabled:opacity-50 border border-gray-300 text-gray-700 hover:text-rose-700 font-medium rounded flex items-center gap-1 transition"
            >
              <Trash2 className="w-3.5 h-3.5 text-gray-500" />
              <span>Remove</span>
            </button>
          </div>

        </div>
      )}

      {/* 
        ========================================================================
        5. ITEMS VIEW: ITEM SUBLIST GRID
        ========================================================================
      */}
      {activeMainTab === 'expenses_items' && activeSubTab === 'items' && (
        <div className="p-3 space-y-3">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setItemLines([])}
              className="px-3 py-1 bg-white hover:bg-gray-50 border border-gray-300 rounded text-xs font-semibold text-gray-700 shadow-2xs transition"
            >
              Clear All Lines
            </button>

            <div className="flex items-center gap-2 text-xs">
              <span className="text-gray-500 font-medium">Items: <strong>{itemLines.length}</strong></span>
              <span className="text-gray-300">|</span>
              <span className="text-gray-700 font-semibold">Total: <strong className="font-mono text-gray-900">{formatCurrency(totalItemAmount)}</strong></span>
            </div>
          </div>

          <div className="border border-gray-300 rounded overflow-x-auto bg-white shadow-2xs">
            <table className="w-full text-left border-collapse min-w-[1100px]">
              <thead>
                <tr className="bg-[#ececec] border-b border-gray-300 text-[10px] uppercase font-bold text-gray-700 tracking-wider">
                  <th className="py-2 px-2.5 border-r border-gray-300 min-w-[130px]">ITEM CODE *</th>
                  <th className="py-2 px-2.5 border-r border-gray-300 min-w-[220px]">DESCRIPTION</th>
                  <th className="py-2 px-2.5 border-r border-gray-300 min-w-[70px] text-center">QTY *</th>
                  <th className="py-2 px-2.5 border-r border-gray-300 min-w-[80px]">UNITS</th>
                  <th className="py-2 px-2.5 border-r border-gray-300 min-w-[90px] text-right">RATE *</th>
                  <th className="py-2 px-2.5 border-r border-gray-300 min-w-[100px] text-right">AMOUNT *</th>
                  <th className="py-2 px-2.5 border-r border-gray-300 min-w-[100px]">TAX CODE *</th>
                  <th className="py-2 px-2.5 border-r border-gray-300 min-w-[80px] text-center">TAX RATE</th>
                  <th className="py-2 px-2.5 border-r border-gray-300 min-w-[90px] text-right">TAX AMT</th>
                  <th className="py-2 px-2.5 border-r border-gray-300 min-w-[100px] text-right">GROSS AMT</th>
                  <th className="py-2 px-2.5 min-w-[140px]">DEPARTMENT</th>
                </tr>
              </thead>
              <tbody>
                {itemLines.map((line, idx) => (
                  <tr key={line.id} className="border-b border-gray-200 text-xs hover:bg-blue-50/50 transition">
                    <td className="py-1.5 px-2.5 border-r border-gray-200 font-mono font-bold text-gray-900">{line.itemCode}</td>
                    <td className="py-1.5 px-2.5 border-r border-gray-200 text-gray-800">{line.itemName}</td>
                    <td className="py-1.5 px-2.5 border-r border-gray-200 text-center font-mono">{line.quantity}</td>
                    <td className="py-1.5 px-2.5 border-r border-gray-200 text-gray-600">{line.units}</td>
                    <td className="py-1.5 px-2.5 border-r border-gray-200 font-mono text-right">{line.rate.toFixed(2)}</td>
                    <td className="py-1.5 px-2.5 border-r border-gray-200 font-mono font-bold text-right text-gray-900">{line.amount.toFixed(2)}</td>
                    <td className="py-1.5 px-2.5 border-r border-gray-200 text-gray-700">{line.taxCodeId}</td>
                    <td className="py-1.5 px-2.5 border-r border-gray-200 text-center font-mono text-gray-600">{(line.taxRate * 100).toFixed(0)}%</td>
                    <td className="py-1.5 px-2.5 border-r border-gray-200 font-mono text-right text-orange-700">{line.taxAmount.toFixed(2)}</td>
                    <td className="py-1.5 px-2.5 border-r border-gray-200 font-mono font-bold text-right">{line.grossAmount.toFixed(2)}</td>
                    <td className="py-1.5 px-2.5 text-gray-700">{line.department}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 
        ========================================================================
        6. OTHER SUBTABS (BILLING, RELATIONSHIPS, COMMUNICATION, ETC.)
        ========================================================================
      */}
      {activeMainTab === 'billing' && (
        <div className="p-4 space-y-4 bg-gray-50/50">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-3.5 rounded border border-gray-200 shadow-2xs space-y-2">
              <h4 className="font-bold text-gray-900 text-xs flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-[#d65200]" />
                <span>Payment Terms & Credit</span>
              </h4>
              <div className="space-y-1.5 text-[11px]">
                <div className="flex justify-between text-gray-600">
                  <span>Terms:</span>
                  <span className="font-semibold text-gray-900">Net 30 Days</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Credit Limit:</span>
                  <span className="font-mono font-semibold text-emerald-700">$50,000.00</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Currency:</span>
                  <span className="font-mono font-semibold">{currency}</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-3.5 rounded border border-gray-200 shadow-2xs space-y-2">
              <h4 className="font-bold text-gray-900 text-xs flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-blue-600" />
                <span>Bill-To Address</span>
              </h4>
              <p className="text-[11px] text-gray-600 leading-relaxed">
                9th Floor, Vanit Building II, 1126/2 New Petchburi Road, Makkasan, Ratchathewi, Bangkok 10400 Thailand
              </p>
            </div>

            <div className="bg-white p-3.5 rounded border border-gray-200 shadow-2xs space-y-2">
              <h4 className="font-bold text-gray-900 text-xs flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-purple-600" />
                <span>Tax Registration</span>
              </h4>
              <div className="space-y-1 text-[11px]">
                <div className="flex justify-between text-gray-600">
                  <span>Tax ID (TIN):</span>
                  <span className="font-mono font-bold text-gray-900">0105542099388</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Branch:</span>
                  <span className="font-semibold text-gray-900">Head Office (00000)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeMainTab === 'relationships' && (
        <div className="p-4 space-y-3 bg-gray-50/50">
          <div className="bg-white p-4 rounded border border-gray-200 shadow-2xs space-y-3">
            <h4 className="font-bold text-gray-900 text-xs flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-[#d65200]" />
              <span>Authorized Entity Contacts & Assignees</span>
            </h4>
            <div className="divide-y divide-gray-100 text-[11px]">
              <div className="py-2 flex items-center justify-between">
                <div>
                  <strong className="text-gray-900 block">Thanaporn Suksamran</strong>
                  <span className="text-gray-500">Chief Accountant • thanaporn.s@suite.internal</span>
                </div>
                <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-semibold text-[10px]">Primary Contact</span>
              </div>
              <div className="py-2 flex items-center justify-between">
                <div>
                  <strong className="text-gray-900 block">Kosal Sok</strong>
                  <span className="text-gray-500">Finance & Settlement Officer • kosal.s@suite.internal</span>
                </div>
                <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-700 font-medium text-[10px]">Billing Assignee</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeMainTab === 'communication' && (
        <div className="p-4 space-y-3 bg-gray-50/50">
          <div className="bg-white p-4 rounded border border-gray-200 shadow-2xs space-y-3">
            <h4 className="font-bold text-gray-900 text-xs flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-[#d65200]" />
              <span>Transaction Activity & Electronic Communication Trail</span>
            </h4>
            <div className="space-y-2 text-[11px]">
              <div className="p-2 bg-gray-50 rounded border border-gray-200 flex justify-between items-center">
                <span className="text-gray-700">System generated purchase invoice voucher for supplier matching.</span>
                <span className="font-mono text-gray-400 text-[10px]">Today, 18:24</span>
              </div>
              <div className="p-2 bg-gray-50 rounded border border-gray-200 flex justify-between items-center">
                <span className="text-gray-700">Email notification dispatched to Accounts Payable inbox.</span>
                <span className="font-mono text-gray-400 text-[10px]">Today, 18:20</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeMainTab === 'system_info' && (
        <div className="p-4 space-y-3 bg-gray-50/50">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-3.5 rounded border border-gray-200 shadow-2xs space-y-2 text-[11px]">
              <h4 className="font-bold text-gray-900 text-xs">System Notes & Audit Meta</h4>
              <div className="space-y-1 text-gray-600">
                <div className="flex justify-between"><span>Created By:</span> <span className="font-semibold text-gray-900">Administrator (System)</span></div>
                <div className="flex justify-between"><span>Date Created:</span> <span className="font-mono text-gray-900">2026-08-26 18:25:00</span></div>
                <div className="flex justify-between"><span>Last Modified By:</span> <span className="font-semibold text-gray-900">Thanaporn S. (Chief Accountant)</span></div>
                <div className="flex justify-between"><span>Active Context:</span> <span className="font-mono text-emerald-700 font-bold">PRODUCTION_ERP_UI</span></div>
              </div>
            </div>

            <div className="bg-white p-3.5 rounded border border-gray-200 shadow-2xs space-y-2 text-[11px]">
              <h4 className="font-bold text-gray-900 text-xs">Transaction State & Locking</h4>
              <div className="space-y-1 text-gray-600">
                <div className="flex justify-between"><span>Posting Status:</span> <span className="font-bold text-emerald-700">POSTED / LOCKED</span></div>
                <div className="flex justify-between"><span>Fiscal Period:</span> <span className="font-mono text-gray-900">Aug 2026 (FY2026-Q3)</span></div>
                <div className="flex justify-between"><span>Subsidiary:</span> <span className="font-semibold text-gray-900">{companyProfile.name}</span></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeMainTab === 'accounting_books' && (
        <div className="p-4 space-y-3 bg-gray-50/50">
          <div className="bg-white p-4 rounded border border-gray-200 shadow-2xs space-y-3">
            <h4 className="font-bold text-gray-900 text-xs flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-[#d65200]" />
              <span>Multi-Book General Ledger Consolidation</span>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px]">
              <div className="p-3 bg-blue-50/60 rounded border border-blue-200">
                <strong className="text-blue-900 block font-bold">Primary Accounting Book (Base USD)</strong>
                <span className="text-gray-600">Operating base currency ledger with automatic VAT & WHT accrual.</span>
              </div>
              <div className="p-3 bg-purple-50/60 rounded border border-purple-200">
                <strong className="text-purple-900 block font-bold">Secondary Local Statutory Book (THB / KHR)</strong>
                <span className="text-gray-600">Statutory Tax Revenue Department compliant ledger representation.</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeMainTab === 'approver_list' && (
        <div className="p-4 space-y-3 bg-gray-50/50">
          <div className="bg-white p-4 rounded border border-gray-200 shadow-2xs space-y-3">
            <h4 className="font-bold text-gray-900 text-xs flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
              <span>Sequential Multi-Tier Approval Workflow Matrix</span>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-[11px]">
              <div className="p-3 bg-emerald-50 rounded border border-emerald-200">
                <span className="text-[10px] font-bold uppercase text-emerald-800">Tier 1: Review</span>
                <strong className="text-gray-900 block mt-1">Bookkeeper / AP Clerk</strong>
                <span className="text-emerald-700 text-[10px] font-semibold">✔ Approved</span>
              </div>
              <div className="p-3 bg-emerald-50 rounded border border-emerald-200">
                <span className="text-[10px] font-bold uppercase text-emerald-800">Tier 2: Verification</span>
                <strong className="text-gray-900 block mt-1">Chief Accountant</strong>
                <span className="text-emerald-700 text-[10px] font-semibold">✔ Verified</span>
              </div>
              <div className="p-3 bg-blue-50 rounded border border-blue-200">
                <span className="text-[10px] font-bold uppercase text-blue-800">Tier 3: Authorization</span>
                <strong className="text-gray-900 block mt-1">Finance Director (CFO)</strong>
                <span className="text-blue-700 text-[10px] font-semibold">● Active Authorization</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeMainTab === 'gl_matching' && (
        <div className="p-4 space-y-3 bg-gray-50/50">
          <div className="bg-white p-4 rounded border border-gray-200 shadow-2xs space-y-3">
            <h4 className="font-bold text-gray-900 text-xs flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#d65200]" />
              <span>3-Way General Ledger & Inventory Reconciliation Match</span>
            </h4>
            <div className="p-3 bg-gray-50 rounded border border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <div>
                <span className="font-bold text-gray-900 block">Purchase Order → Item Receipt → Vendor Bill 3-Way Match</span>
                <span className="text-gray-500 text-[11px]">No variance detected between purchase quantity and billed line amounts.</span>
              </div>
              <span className="px-3 py-1 bg-emerald-100 text-emerald-900 rounded font-bold text-xs border border-emerald-300">
                MATCHED 100%
              </span>
            </div>
          </div>
        </div>
      )}

      {activeMainTab === 'custom' && (
        <div className="p-4 space-y-3 bg-gray-50/50">
          <div className="bg-white p-4 rounded border border-gray-200 shadow-2xs space-y-3 text-[11px]">
            <h4 className="font-bold text-gray-900 text-xs flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-[#d65200]" />
              <span>Custom Classification & Dimensional Segment Fields</span>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-gray-600 mb-1">Tour Group Code:</label>
                <input type="text" readOnly value="GRP-BANGKOK-2026-FHD" className="w-full px-2 py-1 bg-gray-50 border border-gray-200 rounded font-mono" />
              </div>
              <div>
                <label className="block text-gray-600 mb-1">Project Code:</label>
                <input type="text" readOnly value="PRJ-LUX-INBOUND" className="w-full px-2 py-1 bg-gray-50 border border-gray-200 rounded font-mono" />
              </div>
              <div>
                <label className="block text-gray-600 mb-1">Statutory Reference:</label>
                <input type="text" readOnly value="GDT-VAT-COMPLIANT-2026" className="w-full px-2 py-1 bg-gray-50 border border-gray-200 rounded font-mono" />
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
