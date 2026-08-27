import React, { useState, useEffect } from 'react';
import { 
  X, 
  Plus, 
  Trash2, 
  FileText, 
  BookOpen, 
  Receipt, 
  CheckCircle2, 
  AlertCircle,
  UserPlus,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Users,
  Lock,
  Unlock,
  Key,
  Check,
  Sliders,
  Sparkles
} from 'lucide-react';
import { useAccounting } from '../context/AccountingContext';
import { JournalLine, TransactionLineItem, UserRole, PermissionKey, UserProfile } from '../types';

export const Modals: React.FC = () => {
  const { 
    isQuickInvoiceOpen, 
    setIsQuickInvoiceOpen,
    isQuickJournalOpen, 
    setIsQuickJournalOpen,
    isQuickWhtOpen, 
    setIsQuickWhtOpen,
    isUserModalOpen,
    setIsUserModalOpen,
    isAccessControlModalOpen,
    setIsAccessControlModalOpen,
    selectedUserForEdit,
    setSelectedUserForEdit,
    users,
    currentUser,
    setCurrentUser,
    addUser,
    deleteUser,
    updateUser,
    updateUserAccess,
    customers,
    vendors,
    accounts,
    taxCodes,
    activeJurisdiction,
    addTransaction,
    addWhtEntry,
    formatCurrency,
    currentCurrency
  } = useAccounting();

  // ----------------------------------------------------
  // 0. NEW USER MODAL STATE
  // ----------------------------------------------------
  const [newUserName, setNewUserName] = useState('');
  const [newUserUsername, setNewUserUsername] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('Admin123');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState<UserRole>('AR Specialist');
  const [newUserIsAdmin, setNewUserIsAdmin] = useState(false);
  const [newUserDepartment, setNewUserDepartment] = useState('Commercial & Sales');
  const [newUserStatus, setNewUserStatus] = useState<'Online' | 'Away' | 'Busy'>('Online');
  const [newUserColor, setNewUserColor] = useState('bg-blue-600');
  const [autoSwitchUser, setAutoSwitchUser] = useState(false);

  const getInitials = (name: string) => {
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.substring(0, 2).toUpperCase() || 'U';
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserEmail.trim() || !newUserUsername.trim()) return;

    let permissions: string[] = ['Standard Application Access', 'View Ledgers'];
    let accessKeys: PermissionKey[] = ['gl_journal_posting'];

    if (newUserIsAdmin || newUserRole === 'System Administrator') {
      permissions = [
        'Full Administrator Privileges',
        'Manage Users & Limited Access Roles',
        'Full General Ledger Posting',
        'Tax & Revenue Compliance Filing',
        'Audit Trail & System Setup'
      ];
      accessKeys = [
        'admin_manage_users',
        'gl_journal_posting',
        'ar_invoicing',
        'ap_bills',
        'tax_compliance',
        'financial_reports',
        'fixed_assets',
        'setup_entities',
        'audit_trail'
      ];
    } else if (newUserRole === 'Chief Accountant') {
      permissions = ['Full GL Posting', 'Tax Approval', 'Period Close', 'Audit Trail Access'];
      accessKeys = ['gl_journal_posting', 'ar_invoicing', 'ap_bills', 'tax_compliance', 'financial_reports', 'fixed_assets', 'audit_trail'];
    } else if (newUserRole === 'Financial Director (CFO)') {
      permissions = ['Executive Financial Statements', 'Treasury & Bank Approval', 'Consolidation Control'];
      accessKeys = ['financial_reports', 'audit_trail', 'setup_entities', 'gl_journal_posting'];
    } else if (newUserRole === 'AR Specialist') {
      permissions = ['Limited Access: Sales Invoices & Credit Notes', 'Record Customer Receipts & Settlements', 'Customer Credit Limits'];
      accessKeys = ['ar_invoicing'];
    } else if (newUserRole === 'AP & Tax Specialist') {
      permissions = ['Limited Access: Vendor Bills & Expense Vouchers', 'Withholding Tax 50 Bis Issuance', 'VAT Form P.P. 30 Tax Compliance'];
      accessKeys = ['ap_bills', 'tax_compliance'];
    } else if (newUserRole === 'Senior Auditor') {
      permissions = ['Limited Access: Read-Only GL Verification', 'Audit Trail & Change Logs Inspection', 'Trial Balance Review'];
      accessKeys = ['financial_reports', 'audit_trail'];
    } else {
      permissions = ['Limited Access: General Ledger Entry', 'Document Upload', 'Transaction Review'];
      accessKeys = ['gl_journal_posting'];
    }

    const createdUser: Omit<UserProfile, 'id'> = {
      name: newUserName.trim(),
      username: newUserUsername.trim().toLowerCase(),
      password: newUserPassword,
      initials: getInitials(newUserName),
      email: newUserEmail.trim(),
      role: newUserIsAdmin ? 'System Administrator' : newUserRole,
      isAdmin: newUserIsAdmin,
      department: newUserDepartment.trim(),
      avatarColor: newUserColor,
      status: newUserStatus,
      permissions,
      accessKeys
    };

    addUser(createdUser);

    if (autoSwitchUser) {
      setCurrentUser({
        ...createdUser,
        id: `usr-temp-${Date.now()}`
      });
    }

    // Reset form
    setNewUserName('');
    setNewUserUsername('');
    setNewUserPassword('password123');
    setNewUserEmail('');
    setNewUserIsAdmin(false);
    setNewUserRole('AR Specialist');
    setNewUserDepartment('Commercial & Sales');
    setIsUserModalOpen(false);
  };

  // ----------------------------------------------------
  // ACCESS CONTROL & LIMITED PERMISSION MANAGER STATE
  // ----------------------------------------------------
  const [editingUserId, setEditingUserId] = useState<string>('');
  const [editName, setEditName] = useState('');
  const [editUsername, setEditUsername] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editRole, setEditRole] = useState<UserRole>('AR Specialist');
  const [editIsAdmin, setEditIsAdmin] = useState(false);
  const [editDepartment, setEditDepartment] = useState('');
  const [editAccessKeys, setEditAccessKeys] = useState<PermissionKey[]>([]);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState(false);

  // Sync selected user when modal opens or selection changes
  useEffect(() => {
    const target = selectedUserForEdit || users.find(u => u.id === editingUserId) || users[0];
    if (target) {
      setEditingUserId(target.id);
      setEditName(target.name || '');
      setEditUsername(target.username || '');
      setEditPassword(target.password || '');
      setEditEmail(target.email || '');
      setEditRole(target.role);
      setEditIsAdmin(Boolean(target.isAdmin));
      setEditDepartment(target.department);
      setEditAccessKeys(target.accessKeys || []);
    }
  }, [selectedUserForEdit, isAccessControlModalOpen, users]);

  const handleSelectUserToEdit = (userId: string) => {
    const target = users.find(u => u.id === userId);
    if (target) {
      setEditingUserId(target.id);
      setEditName(target.name || '');
      setEditUsername(target.username || '');
      setEditPassword(target.password || '');
      setEditEmail(target.email || '');
      setEditRole(target.role);
      setEditIsAdmin(Boolean(target.isAdmin));
      setEditDepartment(target.department);
      setEditAccessKeys(target.accessKeys || []);
      setSaveSuccessMsg(false);
    }
  };

  const toggleAccessKey = (key: PermissionKey) => {
    if (editIsAdmin) return; // Admins have full access
    setEditAccessKeys(prev => 
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  const applyPreset = (presetType: 'admin' | 'ar' | 'ap_tax' | 'auditor' | 'cfo' | 'bookkeeper') => {
    if (presetType === 'admin') {
      setEditIsAdmin(true);
      setEditRole('System Administrator');
      setEditAccessKeys([
        'admin_manage_users',
        'gl_journal_posting',
        'ar_invoicing',
        'ap_bills',
        'tax_compliance',
        'financial_reports',
        'fixed_assets',
        'setup_entities',
        'audit_trail'
      ]);
    } else if (presetType === 'ar') {
      setEditIsAdmin(false);
      setEditRole('AR Specialist');
      setEditAccessKeys(['ar_invoicing']);
    } else if (presetType === 'ap_tax') {
      setEditIsAdmin(false);
      setEditRole('AP & Tax Specialist');
      setEditAccessKeys(['ap_bills', 'tax_compliance']);
    } else if (presetType === 'auditor') {
      setEditIsAdmin(false);
      setEditRole('Senior Auditor');
      setEditAccessKeys(['financial_reports', 'audit_trail']);
    } else if (presetType === 'cfo') {
      setEditIsAdmin(false);
      setEditRole('Financial Director (CFO)');
      setEditAccessKeys(['financial_reports', 'audit_trail', 'setup_entities', 'gl_journal_posting']);
    } else {
      setEditIsAdmin(false);
      setEditRole('Bookkeeper / Staff Accountant');
      setEditAccessKeys(['gl_journal_posting', 'ar_invoicing', 'ap_bills']);
    }
  };

  const handleSaveAccessControl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUserId) return;

    let permissions: string[] = [];
    if (editIsAdmin) {
      permissions = [
        'Full Administrator Privileges',
        'Manage Users & Limited Access Roles',
        'Full General Ledger Posting',
        'Tax & Revenue Compliance Filing',
        'Audit Trail & System Setup'
      ];
    } else {
      permissions = editAccessKeys.map(k => {
        switch (k) {
          case 'ar_invoicing': return 'Limited: Sales Invoices & Debtors';
          case 'ap_bills': return 'Limited: Vendor Bills & Creditors';
          case 'tax_compliance': return 'Limited: Tax & 50 Bis Withholding Tax';
          case 'financial_reports': return 'Limited: Financial Statements & Reports';
          case 'fixed_assets': return 'Limited: Fixed Assets Register';
          case 'setup_entities': return 'Limited: Company Setup';
          case 'gl_journal_posting': return 'Limited: General Ledger & Journals';
          case 'audit_trail': return 'Limited: Audit Logs Review';
          default: return 'Limited Application Access';
        }
      });
    }

    const targetUser = users.find(u => u.id === editingUserId);
    if (targetUser) {
      updateUser(editingUserId, {
        name: editName.trim() || targetUser.name,
        username: editUsername.trim().toLowerCase() || targetUser.username,
        password: editPassword || targetUser.password,
        email: editEmail.trim() || targetUser.email,
        role: editRole,
        isAdmin: editIsAdmin,
        department: editDepartment,
        accessKeys: editIsAdmin ? [
          'admin_manage_users',
          'gl_journal_posting',
          'ar_invoicing',
          'ap_bills',
          'tax_compliance',
          'financial_reports',
          'fixed_assets',
          'setup_entities',
          'audit_trail'
        ] : editAccessKeys,
        permissions
      });
    }

    setSaveSuccessMsg(true);
    setTimeout(() => {
      setSaveSuccessMsg(false);
    }, 2500);
  };

  const handleDeleteCurrentEditingUser = () => {
    if (!editingUserId) return;
    const target = users.find(u => u.id === editingUserId);
    if (!target) return;

    if (users.length <= 1) {
      alert('Cannot delete the last remaining user in the system.');
      return;
    }

    if (target.isAdmin && users.filter(u => u.isAdmin).length <= 1) {
      alert('Cannot delete the sole Administrator. Promote another user to Admin first.');
      return;
    }

    const confirmDelete = window.confirm(`Are you sure you want to permanently delete user account "${target.name}" (${target.username || target.email})?`);
    if (!confirmDelete) return;

    deleteUser(editingUserId);
    const remaining = users.filter(u => u.id !== editingUserId);
    if (remaining.length > 0) {
      handleSelectUserToEdit(remaining[0].id);
    } else {
      setIsAccessControlModalOpen(false);
    }
  };

  // ----------------------------------------------------
  // 1. INVOICE MODAL STATE
  // ----------------------------------------------------
  const [customerId, setCustomerId] = useState(customers[0]?.id || '');
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
  const [invoiceDueDate, setInvoiceDueDate] = useState('2026-09-20');
  const [invoiceMemo, setInvoiceMemo] = useState('');
  const [invoiceLines, setInvoiceLines] = useState<TransactionLineItem[]>([
    {
      id: 'line-1',
      accountId: 'acc-4010',
      accountNumber: '4010',
      accountName: 'Inbound Package Tour Revenue',
      description: 'Classic Discovery Package 10D/9N',
      quantity: 10,
      unitPrice: 25000,
      amount: 250000,
      taxCodeId: 'tax-vat-7',
      taxRate: 0.07,
      taxAmount: 17500,
    }
  ]);

  const defaultVatRate = (activeJurisdiction?.standardVatRate ?? 7) / 100;
  const defaultTaxCode = taxCodes.find(t => t.countryCode === activeJurisdiction?.countryCode && t.rate > 0) || taxCodes[0];

  const handleAddInvoiceLine = () => {
    setInvoiceLines(prev => [
      ...prev,
      {
        id: `line-${Date.now()}`,
        accountId: 'acc-4010',
        accountNumber: '4010',
        accountName: 'Professional Services / Deliverables',
        description: 'Commercial Consulting & Execution Services',
        quantity: 1,
        unitPrice: 15000,
        amount: 15000,
        taxCodeId: defaultTaxCode?.id || 'tax-vat-7',
        taxRate: defaultTaxCode ? defaultTaxCode.rate : defaultVatRate,
        taxAmount: (defaultTaxCode ? defaultTaxCode.rate : defaultVatRate) * 15000,
      }
    ]);
  };

  const handleRemoveInvoiceLine = (idx: number) => {
    if (invoiceLines.length === 1) return;
    setInvoiceLines(prev => prev.filter((_, i) => i !== idx));
  };

  const handleInvoiceLineChange = (idx: number, field: keyof TransactionLineItem, value: any) => {
    setInvoiceLines(prev => prev.map((item, i) => {
      if (i !== idx) return item;
      const updated = { ...item, [field]: value };
      if (field === 'taxCodeId') {
        const found = taxCodes.find(t => t.id === value);
        if (found) {
          updated.taxRate = found.rate;
        }
      }
      if (field === 'quantity' || field === 'unitPrice' || field === 'taxCodeId' || field === 'taxRate') {
        const qty = field === 'quantity' ? parseFloat(value) || 0 : item.quantity;
        const price = field === 'unitPrice' ? parseFloat(value) || 0 : item.unitPrice;
        const rate = field === 'taxRate' ? parseFloat(value) || 0 : (updated.taxRate ?? defaultVatRate);
        updated.amount = qty * price;
        updated.taxRate = rate;
        updated.taxAmount = rate * updated.amount;
      }
      return updated;
    }));
  };

  const invoiceSubtotal = invoiceLines.reduce((sum, item) => sum + item.amount, 0);
  const invoiceTaxTotal = invoiceLines.reduce((sum, item) => sum + (item.taxAmount || 0), 0);
  const invoiceGrandTotal = invoiceSubtotal + invoiceTaxTotal;

  const handleSaveInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    const cust = customers.find(c => c.id === customerId);
    if (!cust) return;

    const nextDocNum = `INV-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    addTransaction({
      transactionNumber: nextDocNum,
      type: 'Invoice',
      date: invoiceDate,
      dueDate: invoiceDueDate,
      postingPeriod: 'Aug 2026',
      entityId: cust.id,
      entityName: cust.companyName,
      entityType: 'Customer',
      status: 'Approved',
      currency: currentCurrency || 'USD',
      exchangeRate: 1.0,
      subtotal: invoiceSubtotal,
      taxTotal: invoiceTaxTotal,
      total: invoiceGrandTotal,
      amountPaid: 0,
      balanceDue: invoiceGrandTotal,
      memo: invoiceMemo || invoiceLines[0]?.description,
      taxInvoiceNumber: `TAX-${nextDocNum}`,
      taxInvoiceDate: invoiceDate,
      department: 'Inbound Operations',
      subsidiary: 'Small Business Co., Ltd.',
      items: invoiceLines,
    });

    setIsQuickInvoiceOpen(false);
  };

  // ----------------------------------------------------
  // 2. JOURNAL ENTRY MODAL STATE
  // ----------------------------------------------------
  const [jeDate, setJeDate] = useState(new Date().toISOString().split('T')[0]);
  const [jeMemo, setJeMemo] = useState('Monthly Accrual / Adjustment');
  const [jeLines, setJeLines] = useState<JournalLine[]>([
    {
      id: 'jl-1',
      accountId: 'acc-6010',
      accountNumber: '6010',
      accountName: 'Staff Salaries & Operational Wages',
      debit: 50000,
      credit: 0,
      memo: 'Bonus and overtime wages accrual',
    },
    {
      id: 'jl-2',
      accountId: 'acc-1020',
      accountNumber: '1020',
      accountName: 'Main Operating Bank Account (USD)',
      debit: 0,
      credit: 50000,
      memo: 'Bank transfer for salary disbursement',
    }
  ]);

  const handleAddJeLine = () => {
    setJeLines(prev => [
      ...prev,
      {
        id: `jl-${Date.now()}`,
        accountId: accounts[0]?.id || '',
        accountNumber: accounts[0]?.number || '1010',
        accountName: accounts[0]?.name || '',
        debit: 0,
        credit: 0,
        memo: '',
      }
    ]);
  };

  const handleJeLineChange = (idx: number, field: keyof JournalLine, value: any) => {
    setJeLines(prev => prev.map((l, i) => {
      if (i !== idx) return l;
      const updated = { ...l, [field]: value };
      if (field === 'accountId') {
        const found = accounts.find(a => a.id === value);
        if (found) {
          updated.accountNumber = found.number;
          updated.accountName = found.name;
        }
      }
      return updated;
    }));
  };

  const totalDebit = jeLines.reduce((sum, l) => sum + (parseFloat(l.debit as any) || 0), 0);
  const totalCredit = jeLines.reduce((sum, l) => sum + (parseFloat(l.credit as any) || 0), 0);
  const isJeBalanced = Math.abs(totalDebit - totalCredit) < 0.01 && totalDebit > 0;

  const handleSaveJournal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isJeBalanced) {
      alert('Debit and Credit must be equal to save the Journal Entry.');
      return;
    }

    const nextJeNum = `JE-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    addTransaction({
      transactionNumber: nextJeNum,
      type: 'Journal_Entry',
      date: jeDate,
      postingPeriod: 'Aug 2026',
      entityId: 'internal',
      entityName: 'General Ledger Adjustment',
      entityType: 'Other',
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

    setIsQuickJournalOpen(false);
  };

  // ----------------------------------------------------
  // 3. WHT 50 TAWI MODAL STATE
  // ----------------------------------------------------
  const [whtFormType, setWhtFormType] = useState<'PND53' | 'PND3'>('PND53');
  const [payeeName, setPayeeName] = useState(vendors[0]?.companyName || '');
  const [payeeTaxId, setPayeeTaxId] = useState(vendors[0]?.taxId || '');
  const [payeeAddress, setPayeeAddress] = useState(vendors[0]?.address || '');
  const [incomeType, setIncomeType] = useState<'Services' | 'Transportation' | 'Rent' | 'Advertising'>('Services');
  const [baseAmount, setBaseAmount] = useState('100000');
  const [whtRate, setWhtRate] = useState(0.03);

  const calculatedWhtAmount = (parseFloat(baseAmount) || 0) * whtRate;

  const handleSaveWht = (e: React.FormEvent) => {
    e.preventDefault();
    if (!payeeName || !payeeTaxId) return;

    const certNo = `WHT-${whtFormType === 'PND53' ? '53' : '03'}-2026-${Math.floor(100 + Math.random() * 900)}`;

    addWhtEntry({
      certNumber: certNo,
      date: new Date().toISOString().split('T')[0],
      formType: whtFormType,
      payerName: 'Small Business Co., Ltd.',
      payerTaxId: '0105542099388',
      payerAddress: '9th Floor, Vanit Building II, 1126/2 New Petchburi Rd, Bangkok 10400',
      payeeName,
      payeeTaxId,
      payeeAddress,
      incomeType,
      incomeDescription: `${incomeType} fee for Small Business operations`,
      baseAmount: parseFloat(baseAmount) || 0,
      whtRate,
      whtAmount: calculatedWhtAmount,
      status: 'Submitted',
    });

    setIsQuickWhtOpen(false);
  };

  return (
    <>
      {/* 1. SALES INVOICE MODAL */}
      {isQuickInvoiceOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-lg max-w-3xl w-full p-6 shadow-2xl my-8 animate-in fade-in-50">
            <div className="flex justify-between items-center pb-3 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#d65200]" />
                <h3 className="text-base font-bold text-gray-900">Create Sales Invoice (AR)</h3>
              </div>
              <button onClick={() => setIsQuickInvoiceOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveInvoice} className="mt-4 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-medium text-gray-700 mb-1">Customer (B2B Agent) *</label>
                  <select
                    value={customerId}
                    onChange={(e) => setCustomerId(e.target.value)}
                    className="w-full px-3 py-1.5 border border-gray-300 rounded bg-white"
                  >
                    {customers.map(c => (
                      <option key={c.id} value={c.id}>{c.companyName} ({c.code})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-gray-700 mb-1">Invoice Date *</label>
                  <input
                    type="date"
                    value={invoiceDate}
                    onChange={(e) => setInvoiceDate(e.target.value)}
                    className="w-full px-3 py-1.5 border border-gray-300 rounded font-mono"
                  />
                </div>
                <div>
                  <label className="block font-medium text-gray-700 mb-1">Due Date *</label>
                  <input
                    type="date"
                    value={invoiceDueDate}
                    onChange={(e) => setInvoiceDueDate(e.target.value)}
                    className="w-full px-3 py-1.5 border border-gray-300 rounded font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-gray-700 mb-1">Memo / Tour Package Name</label>
                <input
                  type="text"
                  placeholder="e.g. 14-Day Discovery Overland Tour Group"
                  value={invoiceMemo}
                  onChange={(e) => setInvoiceMemo(e.target.value)}
                  className="w-full px-3 py-1.5 border border-gray-300 rounded"
                />
              </div>

              {/* Line Items Table */}
              <div className="border border-gray-200 rounded overflow-hidden">
                <div className="bg-gray-50 px-3 py-2 font-bold text-gray-700 flex justify-between items-center">
                  <span>Line Items</span>
                  <button
                    type="button"
                    onClick={handleAddInvoiceLine}
                    className="text-xs font-semibold text-[#d65200] hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" /> Add Line
                  </button>
                </div>

                <div className="p-2 space-y-2">
                  {invoiceLines.map((line, idx) => (
                    <div key={line.id} className="grid grid-cols-12 gap-2 items-center text-xs">
                      <div className="col-span-4">
                        <input
                          type="text"
                          placeholder="Item description"
                          value={line.description}
                          onChange={(e) => handleInvoiceLineChange(idx, 'description', e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded"
                        />
                      </div>
                      <div className="col-span-2">
                        <select
                          value={line.taxCodeId || defaultTaxCode?.id}
                          onChange={(e) => handleInvoiceLineChange(idx, 'taxCodeId', e.target.value)}
                          className="w-full px-1.5 py-1 border border-gray-300 rounded text-[11px] bg-white font-medium text-gray-700"
                        >
                          {taxCodes.map(tc => (
                            <option key={tc.id} value={tc.id}>
                              {tc.code} ({(tc.rate * 100).toFixed(0)}%)
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="col-span-1">
                        <input
                          type="number"
                          placeholder="Qty"
                          value={line.quantity}
                          onChange={(e) => handleInvoiceLineChange(idx, 'quantity', e.target.value)}
                          className="w-full px-1 py-1 border border-gray-300 rounded text-center font-mono"
                        />
                      </div>
                      <div className="col-span-2">
                        <input
                          type="number"
                          placeholder="Unit Price"
                          value={line.unitPrice}
                          onChange={(e) => handleInvoiceLineChange(idx, 'unitPrice', e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-right font-mono"
                        />
                      </div>
                      <div className="col-span-2 font-mono font-bold text-right text-gray-800">
                        {formatCurrency(line.amount)}
                      </div>
                      <div className="col-span-1 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveInvoiceLine(idx)}
                          className="text-gray-400 hover:text-rose-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total Calculation */}
              <div className="flex justify-end pt-2">
                <div className="w-64 space-y-1 text-xs">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal:</span>
                    <span className="font-mono font-medium">{formatCurrency(invoiceSubtotal)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span className="flex items-center gap-1">
                      <span>{activeJurisdiction?.flagEmoji} {activeJurisdiction?.name || 'Tax'} ({((invoiceSubtotal > 0 ? (invoiceTaxTotal / invoiceSubtotal) * 100 : activeJurisdiction?.standardVatRate ?? 7)).toFixed(1)}%):</span>
                    </span>
                    <span className="font-mono font-medium text-orange-700">{formatCurrency(invoiceTaxTotal)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-sm text-gray-900 pt-1 border-t border-gray-200">
                    <span>Total ({currentCurrency}):</span>
                    <span className="font-mono text-[#d65200]">{formatCurrency(invoiceGrandTotal)}</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-2 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsQuickInvoiceOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded text-xs font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#d65200] hover:bg-[#b84300] text-white rounded text-xs font-bold shadow-xs"
                >
                  Approve & Issue Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. JOURNAL ENTRY MODAL */}
      {isQuickJournalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-lg max-w-3xl w-full p-6 shadow-2xl my-8 animate-in fade-in-50">
            <div className="flex justify-between items-center pb-3 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-bold text-gray-900">New Double-Entry Journal Voucher</h3>
              </div>
              <button onClick={() => setIsQuickJournalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveJournal} className="mt-4 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-gray-700 mb-1">Entry Date *</label>
                  <input
                    type="date"
                    value={jeDate}
                    onChange={(e) => setJeDate(e.target.value)}
                    className="w-full px-3 py-1.5 border border-gray-300 rounded font-mono"
                  />
                </div>
                <div>
                  <label className="block font-medium text-gray-700 mb-1">Journal Description / Memo *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Month-end payroll and bank fee adjustment"
                    value={jeMemo}
                    onChange={(e) => setJeMemo(e.target.value)}
                    className="w-full px-3 py-1.5 border border-gray-300 rounded"
                  />
                </div>
              </div>

              {/* Double-entry lines */}
              <div className="border border-gray-200 rounded overflow-hidden">
                <div className="bg-gray-50 px-3 py-2 font-bold text-gray-700 flex justify-between items-center">
                  <span>General Ledger Accounts & Balancing</span>
                  <button
                    type="button"
                    onClick={handleAddJeLine}
                    className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" /> Add Entry Row
                  </button>
                </div>

                <div className="p-3 space-y-2">
                  {jeLines.map((line, idx) => (
                    <div key={line.id} className="grid grid-cols-12 gap-2 items-center text-xs">
                      <div className="col-span-5">
                        <select
                          value={line.accountId}
                          onChange={(e) => handleJeLineChange(idx, 'accountId', e.target.value)}
                          className="w-full px-2 py-1.5 border border-gray-300 rounded bg-white text-[11px]"
                        >
                          {accounts.map(acc => (
                            <option key={acc.id} value={acc.id}>
                              {acc.number} - {acc.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="col-span-3">
                        <input
                          type="text"
                          placeholder="Memo / Sub-ledger"
                          value={line.memo}
                          onChange={(e) => handleJeLineChange(idx, 'memo', e.target.value)}
                          className="w-full px-2 py-1.5 border border-gray-300 rounded text-[11px]"
                        />
                      </div>
                      <div className="col-span-2">
                        <input
                          type="number"
                          placeholder="Debit"
                          value={line.debit || ''}
                          onChange={(e) => handleJeLineChange(idx, 'debit', parseFloat(e.target.value) || 0)}
                          className="w-full px-2 py-1.5 border border-gray-300 rounded text-right font-mono font-semibold"
                        />
                      </div>
                      <div className="col-span-2">
                        <input
                          type="number"
                          placeholder="Credit"
                          value={line.credit || ''}
                          onChange={(e) => handleJeLineChange(idx, 'credit', parseFloat(e.target.value) || 0)}
                          className="w-full px-2 py-1.5 border border-gray-300 rounded text-right font-mono font-semibold"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Balancing footer */}
                <div className="bg-gray-100 p-3 border-t border-gray-200 flex items-center justify-between font-bold text-xs">
                  <div className="flex items-center gap-2">
                    {isJeBalanced ? (
                      <span className="flex items-center gap-1 text-emerald-700">
                        <CheckCircle2 className="w-4 h-4" /> Balanced
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-rose-600">
                        <AlertCircle className="w-4 h-4" /> Difference: {formatCurrency(Math.abs(totalDebit - totalCredit))}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-6 font-mono">
                    <span>Total Debit: {formatCurrency(totalDebit)}</span>
                    <span>Total Credit: {formatCurrency(totalCredit)}</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-2 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsQuickJournalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded text-xs font-semibold text-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!isJeBalanced}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded text-xs font-bold"
                >
                  Post Journal Voucher
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. WHT SECTION 50 BIS MODAL */}
      {isQuickWhtOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-lg max-w-lg w-full p-6 shadow-2xl my-8 animate-in fade-in-50">
            <div className="flex justify-between items-center pb-3 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-bold text-gray-900">Issue WHT Certificate (Section 50 Bis)</h3>
              </div>
              <button onClick={() => setIsQuickWhtOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveWht} className="mt-4 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-gray-700 mb-1">Form Type *</label>
                  <select
                    value={whtFormType}
                    onChange={(e) => setWhtFormType(e.target.value as any)}
                    className="w-full px-3 py-1.5 border border-gray-300 rounded bg-white"
                  >
                    <option value="PND53">Form PND 53 (Corporate)</option>
                    <option value="PND3">Form PND 3 (Individual / Freelancer)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-gray-700 mb-1">Income Category *</label>
                  <select
                    value={incomeType}
                    onChange={(e) => {
                      const val = e.target.value as any;
                      setIncomeType(val);
                      if (val === 'Transportation') setWhtRate(0.01);
                      else if (val === 'Advertising') setWhtRate(0.02);
                      else if (val === 'Services') setWhtRate(0.03);
                      else if (val === 'Rent') setWhtRate(0.05);
                    }}
                    className="w-full px-3 py-1.5 border border-gray-300 rounded bg-white"
                  >
                    <option value="Services">Services (3%)</option>
                    <option value="Transportation">Transportation (1%)</option>
                    <option value="Rent">Rent / Lease (5%)</option>
                    <option value="Advertising">Advertising (2%)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-medium text-gray-700 mb-1">Payee Name *</label>
                <input
                  type="text"
                  required
                  value={payeeName}
                  onChange={(e) => setPayeeName(e.target.value)}
                  className="w-full px-3 py-1.5 border border-gray-300 rounded"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-gray-700 mb-1">Payee Tax ID (13 Digits) *</label>
                  <input
                    type="text"
                    required
                    value={payeeTaxId}
                    onChange={(e) => setPayeeTaxId(e.target.value)}
                    className="w-full px-3 py-1.5 border border-gray-300 rounded font-mono"
                  />
                </div>
                <div>
                  <label className="block font-medium text-gray-700 mb-1">WHT Rate</label>
                  <div className="px-3 py-1.5 border border-gray-200 rounded bg-gray-50 font-mono font-bold text-[#d65200]">
                    {(whtRate * 100).toFixed(0)}%
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-medium text-gray-700 mb-1">Taxable Service Base Amount ({currentCurrency}) *</label>
                <input
                  type="number"
                  required
                  value={baseAmount}
                  onChange={(e) => setBaseAmount(e.target.value)}
                  className="w-full px-3 py-1.5 border border-gray-300 rounded font-mono font-bold"
                />
              </div>

              <div className="p-3 bg-emerald-50 rounded border border-emerald-100 flex justify-between items-center text-xs">
                <span className="font-bold text-emerald-900">Withholding Tax to Deduct:</span>
                <span className="font-mono font-extrabold text-sm text-emerald-800">
                  {formatCurrency(calculatedWhtAmount)}
                </span>
              </div>

              <div className="mt-6 flex justify-end gap-2 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsQuickWhtOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded text-xs font-semibold text-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-bold"
                >
                  Generate 50 Bis Certificate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* 4. NEW USER / TEAM MEMBER REGISTRATION MODAL                        */}
      {/* ------------------------------------------------------------------ */}
      {isUserModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-lg w-full overflow-hidden border border-gray-300 animate-in fade-in zoom-in duration-150 text-xs">
            
            {/* Modal Header */}
            <div className="bg-[#d65200] text-white px-5 py-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5" />
                <span className="font-bold text-sm">Add Team Member / Multi-User Profile</span>
              </div>
              <button 
                onClick={() => setIsUserModalOpen(false)}
                className="hover:bg-white/20 p-1 rounded transition text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleCreateUser} className="p-5 space-y-4">
              <div className="p-3 bg-orange-50 border border-orange-200 rounded-md text-gray-700 text-xs leading-relaxed flex items-start gap-2">
                <Shield className="w-4 h-4 text-[#d65200] shrink-0 mt-0.5" />
                <div>
                  Add an authorized team member to <strong>Small Business Co., Ltd.</strong> Only <strong>System Administrators</strong> have authority to provision users and configure limited access privileges.
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-gray-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Thanaporn Suksamran"
                    value={newUserName}
                    onChange={(e) => setNewUserName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-[#d65200] focus:border-[#d65200] text-xs font-medium"
                  />
                </div>
                <div>
                  <label className="block font-medium text-gray-700 mb-1">Username (Login ID) *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. thanaporn.s"
                    value={newUserUsername}
                    onChange={(e) => setNewUserUsername(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-[#d65200] focus:border-[#d65200] text-xs font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-gray-700 mb-1">Password *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. password123"
                    value={newUserPassword}
                    onChange={(e) => setNewUserPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-[#d65200] focus:border-[#d65200] text-xs font-medium"
                  />
                </div>
                <div>
                  <label className="block font-medium text-gray-700 mb-1">Corporate Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. thanaporn.s@suite.internal"
                    value={newUserEmail}
                    onChange={(e) => setNewUserEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-[#d65200] focus:border-[#d65200] text-xs font-medium"
                  />
                </div>
              </div>

              {/* Admin Privileges Toggle */}
              <div className="p-3 rounded-lg border border-amber-200 bg-amber-50/70 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Key className="w-4 h-4 text-amber-700" />
                  <div>
                    <span className="font-bold text-amber-900 block text-xs">Grant Full Administrator Authority</span>
                    <span className="text-[10px] text-amber-700">Admin can add, modify, and assign limited access to other users</span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  id="admin-check-new"
                  checked={newUserIsAdmin}
                  onChange={(e) => {
                    setNewUserIsAdmin(e.target.checked);
                    if (e.target.checked) {
                      setNewUserRole('System Administrator');
                    } else {
                      setNewUserRole('AR Specialist');
                    }
                  }}
                  className="w-4 h-4 rounded text-[#d65200] focus:ring-[#d65200]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-gray-700 mb-1">System Role *</label>
                  <select
                    value={newUserRole}
                    onChange={(e) => {
                      const val = e.target.value as UserRole;
                      setNewUserRole(val);
                      if (val === 'System Administrator') setNewUserIsAdmin(true);
                      else setNewUserIsAdmin(false);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded text-xs bg-white"
                  >
                    <option value="System Administrator">🛡️ System Administrator (Full Access)</option>
                    <option value="Chief Accountant">Chief Accountant</option>
                    <option value="Financial Director (CFO)">Financial Director (CFO)</option>
                    <option value="AR Specialist">AR Specialist (Limited: Invoices)</option>
                    <option value="AP & Tax Specialist">AP & Tax Specialist (Limited: Bills/Tax)</option>
                    <option value="Senior Auditor">Senior Auditor (Limited: Read-Only)</option>
                    <option value="Bookkeeper / Staff Accountant">Bookkeeper / Staff Accountant</option>
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-gray-700 mb-1">Department</label>
                  <input
                    type="text"
                    value={newUserDepartment}
                    onChange={(e) => setNewUserDepartment(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-gray-700 mb-1">Initial Status</label>
                  <select
                    value={newUserStatus}
                    onChange={(e) => setNewUserStatus(e.target.value as any)}
                    className="w-full px-3 py-2 border border-gray-300 rounded text-xs bg-white"
                  >
                    <option value="Online">🟢 Online (Active)</option>
                    <option value="Away">🟡 Away</option>
                    <option value="Busy">🔴 Busy</option>
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-gray-700 mb-1">Avatar Theme</label>
                  <div className="flex items-center gap-2 pt-1">
                    {[
                      { color: 'bg-[#d65200]', label: 'Orange' },
                      { color: 'bg-purple-600', label: 'Purple' },
                      { color: 'bg-blue-600', label: 'Blue' },
                      { color: 'bg-emerald-600', label: 'Emerald' },
                      { color: 'bg-slate-700', label: 'Slate' },
                      { color: 'bg-rose-600', label: 'Rose' },
                    ].map((c) => (
                      <button
                        type="button"
                        key={c.color}
                        onClick={() => setNewUserColor(c.color)}
                        className={`w-6 h-6 rounded-full ${c.color} border-2 ${newUserColor === c.color ? 'border-gray-900 scale-110 ring-2 ring-orange-300' : 'border-white'} transition shadow-xs`}
                        title={c.label}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-gray-100 flex items-center gap-2">
                <input
                  type="checkbox"
                  id="auto-switch"
                  checked={autoSwitchUser}
                  onChange={(e) => setAutoSwitchUser(e.target.checked)}
                  className="rounded text-[#d65200] focus:ring-[#d65200]"
                />
                <label htmlFor="auto-switch" className="text-gray-700 select-none cursor-pointer">
                  Switch to this user session immediately upon creation
                </label>
              </div>

              <div className="mt-5 flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsUserModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded text-xs font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#d65200] hover:bg-[#bf4700] text-white rounded text-xs font-bold shadow-xs transition"
                >
                  Create User Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* 5. ADMIN ACCESS CONTROL & LIMITED PERMISSION MANAGER MODAL          */}
      {/* ------------------------------------------------------------------ */}
      {isAccessControlModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full overflow-hidden border border-gray-300 animate-in fade-in zoom-in duration-150 text-xs flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="bg-[#1e293b] text-white px-5 py-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-amber-400" />
                <div>
                  <span className="font-bold text-sm block">Administrator Access Control & Role Permissions</span>
                  <span className="text-[10px] text-gray-300">Grant admin privileges and customize limited module access for team members</span>
                </div>
              </div>
              <button 
                onClick={() => setIsAccessControlModalOpen(false)}
                className="hover:bg-white/20 p-1 rounded transition text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Non-Admin Security Notice Banner */}
            {!currentUser?.isAdmin && (
              <div className="p-3 bg-rose-50 border-b border-rose-200 text-rose-800 text-xs flex items-center gap-2 font-medium">
                <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
                <span>Read-Only View: You are signed in as a Limited Access user. Only <strong>System Administrators</strong> can change user roles and permissions.</span>
              </div>
            )}

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto space-y-4 flex-1">
              
              {/* User Selection Toolbar */}
              <div>
                <label className="block font-bold text-gray-800 mb-1.5 flex items-center justify-between">
                  <span>Select Team Member to Configure:</span>
                  <span className="text-[10px] font-normal text-gray-500">Total Users: {users.length}</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {users.map(u => {
                    const isSelected = u.id === editingUserId;
                    return (
                      <button
                        key={u.id}
                        type="button"
                        onClick={() => handleSelectUserToEdit(u.id)}
                        className={`p-2 rounded-md border text-left flex items-center gap-2 transition ${
                          isSelected 
                            ? 'border-[#d65200] bg-orange-50/80 ring-1 ring-orange-300' 
                            : 'border-gray-200 bg-white hover:bg-gray-50'
                        }`}
                      >
                        <div className={`w-7 h-7 rounded-full ${u.avatarColor || 'bg-gray-500'} text-white font-bold flex items-center justify-center text-[10px] shrink-0`}>
                          {u.initials}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="font-semibold text-gray-900 text-xs truncate flex items-center gap-1">
                            {u.name}
                            {u.isAdmin && <span className="text-amber-600 font-bold" title="Administrator">👑</span>}
                          </div>
                          <div className="text-[10px] text-gray-500 truncate">{u.role}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Admin vs Limited Status Banner */}
              <div className={`p-3.5 rounded-lg border flex items-center justify-between ${
                editIsAdmin 
                  ? 'bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200 text-amber-950' 
                  : 'bg-blue-50/60 border-blue-200 text-blue-950'
              }`}>
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-base ${
                    editIsAdmin ? 'bg-amber-500 text-white shadow-xs' : 'bg-blue-600 text-white'
                  }`}>
                    {editIsAdmin ? '👑' : <Lock className="w-4 h-4" />}
                  </div>
                  <div>
                    <h4 className="font-bold text-xs">
                      {editIsAdmin ? 'System Administrator (Unrestricted Access)' : 'Limited Access User Account'}
                    </h4>
                    <p className="text-[10px] text-gray-600">
                      {editIsAdmin 
                        ? 'This user has full authority to view all ledgers, post entries, file taxes, and manage other users.'
                        : 'Access is restricted strictly to checked accounting modules below.'
                      }
                    </p>
                  </div>
                </div>

                {currentUser?.isAdmin && (
                  <button
                    type="button"
                    onClick={() => {
                      if (editIsAdmin) {
                        applyPreset('ar');
                      } else {
                        applyPreset('admin');
                      }
                    }}
                    className={`px-3 py-1.5 rounded text-xs font-bold transition shadow-xs ${
                      editIsAdmin 
                        ? 'bg-white border border-amber-300 text-amber-800 hover:bg-amber-100' 
                        : 'bg-amber-500 hover:bg-amber-600 text-white'
                    }`}
                  >
                    {editIsAdmin ? 'Demote to Limited Access' : 'Make System Admin'}
                  </button>
                )}
              </div>

              {/* Quick Preset Templates */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-gray-700 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-[#d65200]" />
                    Quick Role & Limited Access Presets:
                  </span>
                  <span className="text-[10px] text-gray-400">One-click permission templates</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { id: 'admin', label: '👑 Administrator (Full Access)', color: 'border-amber-300 text-amber-900 bg-amber-50/50' },
                    { id: 'ar', label: '💼 Limited: AR Invoicing', color: 'border-blue-200 text-blue-900 bg-blue-50/50' },
                    { id: 'ap_tax', label: '🧾 Limited: AP Bills & Tax (50 Bis)', color: 'border-emerald-200 text-emerald-900 bg-emerald-50/50' },
                    { id: 'auditor', label: '🔍 Limited: Senior Auditor (Read-Only)', color: 'border-slate-300 text-slate-800 bg-slate-100' },
                    { id: 'cfo', label: '📊 Limited: CFO / Executive', color: 'border-purple-200 text-purple-900 bg-purple-50/50' },
                    { id: 'bookkeeper', label: '📝 Limited: Bookkeeper', color: 'border-gray-200 text-gray-800 bg-gray-50' },
                  ].map(preset => (
                    <button
                      key={preset.id}
                      type="button"
                      disabled={!currentUser?.isAdmin}
                      onClick={() => applyPreset(preset.id as any)}
                      className={`px-2.5 py-1 rounded text-[11px] font-medium border hover:scale-102 transition ${preset.color} disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Granular Module Permission Checkboxes */}
              <div className="space-y-2">
                <div className="font-bold text-gray-800 flex items-center justify-between border-b border-gray-100 pb-1">
                  <span>Granular Module Access Privileges:</span>
                  <span className="text-[10px] font-mono text-gray-500">
                    {editIsAdmin ? 'ALL MODULES GRANTED (Admin)' : `${editAccessKeys.length} of 9 permissions granted`}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[
                    {
                      key: 'ar_invoicing' as PermissionKey,
                      name: 'Sales & Invoicing (AR)',
                      desc: 'Create and issue customer invoices, credit notes, receipts & debtor ledgers.',
                      icon: '💼'
                    },
                    {
                      key: 'ap_bills' as PermissionKey,
                      name: 'Bills & Expenses (AP)',
                      desc: 'Enter vendor bills, expense vouchers, approve supplier settlements.',
                      icon: '🧾'
                    },
                    {
                      key: 'tax_compliance' as PermissionKey,
                      name: 'Tax & Compliance Management',
                      desc: 'Generate Form 50 Bis Withholding Tax and VAT P.P. 30 monthly filings.',
                      icon: '🏛️'
                    },
                    {
                      key: 'gl_journal_posting' as PermissionKey,
                      name: 'General Ledger & Manual Journals',
                      desc: 'Post standard journal entries, debit/credit vouchers and maintain Chart of Accounts.',
                      icon: '📋'
                    },
                    {
                      key: 'financial_reports' as PermissionKey,
                      name: 'Financial Statements & Reports',
                      desc: 'View Balance Sheet, Income Statement (P&L), Cash Flow & Aging Reports.',
                      icon: '📊'
                    },
                    {
                      key: 'fixed_assets' as PermissionKey,
                      name: 'Fixed Assets Register',
                      desc: 'Register capital assets and execute monthly straight-line depreciation.',
                      icon: '🏢'
                    },
                    {
                      key: 'setup_entities' as PermissionKey,
                      name: 'Company Setup & Multi-Entities',
                      desc: 'Manage subsidiary entities, FX currency rates, OCR and database controls.',
                      icon: '⚙️'
                    },
                    {
                      key: 'audit_trail' as PermissionKey,
                      name: 'Audit Trail & Security Logs',
                      desc: 'Inspect tamper-evident system logs, user activity timestamps and record diffs.',
                      icon: '📜'
                    },
                    {
                      key: 'admin_manage_users' as PermissionKey,
                      name: 'User & Access Administration',
                      desc: 'Authority to add new users, change roles and modify limited access permissions.',
                      icon: '🛡️',
                      requiresAdmin: true
                    },
                  ].map(perm => {
                    const isChecked = editIsAdmin || editAccessKeys.includes(perm.key);
                    return (
                      <label
                        key={perm.key}
                        className={`p-2.5 rounded-lg border flex items-start gap-2.5 transition cursor-pointer select-none ${
                          isChecked 
                            ? 'bg-orange-50/40 border-orange-200 text-gray-900' 
                            : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                        } ${!currentUser?.isAdmin ? 'opacity-70 pointer-events-none' : ''}`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          disabled={editIsAdmin || !currentUser?.isAdmin || perm.requiresAdmin}
                          onChange={() => toggleAccessKey(perm.key)}
                          className="mt-0.5 rounded text-[#d65200] focus:ring-[#d65200] disabled:opacity-60"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="font-bold text-xs flex items-center gap-1.5">
                            <span>{perm.icon}</span>
                            <span>{perm.name}</span>
                            {perm.requiresAdmin && (
                              <span className="text-[9px] px-1 py-0.2 bg-amber-100 text-amber-800 rounded font-bold">
                                Admin Only
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-gray-500 mt-0.5 leading-snug">{perm.desc}</p>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* User Account Details & Credentials Customization */}
              <div className="pt-3 border-t border-gray-200 space-y-3">
                <div className="font-bold text-gray-800 text-xs flex items-center justify-between">
                  <span>User Account Credentials & Organization:</span>
                  <span className="text-[10px] text-gray-500 font-normal">Used for sign-in & audit identification</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-medium text-gray-700 mb-1">Full Name *</label>
                    <input
                      type="text"
                      disabled={!currentUser?.isAdmin}
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full px-3 py-1.5 border border-gray-300 rounded text-xs disabled:bg-gray-100 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-gray-700 mb-1">Username (Login ID) *</label>
                    <input
                      type="text"
                      disabled={!currentUser?.isAdmin}
                      value={editUsername}
                      onChange={(e) => setEditUsername(e.target.value)}
                      className="w-full px-3 py-1.5 border border-gray-300 rounded text-xs disabled:bg-gray-100 font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-medium text-gray-700 mb-1">Password *</label>
                    <input
                      type="text"
                      disabled={!currentUser?.isAdmin}
                      value={editPassword}
                      onChange={(e) => setEditPassword(e.target.value)}
                      className="w-full px-3 py-1.5 border border-gray-300 rounded text-xs disabled:bg-gray-100 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-gray-700 mb-1">Email Address</label>
                    <input
                      type="email"
                      disabled={!currentUser?.isAdmin}
                      value={editEmail}
                      onChange={(e) => setEditEmail(e.target.value)}
                      className="w-full px-3 py-1.5 border border-gray-300 rounded text-xs disabled:bg-gray-100"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-medium text-gray-700 mb-1">Title / Designation *</label>
                    <input
                      type="text"
                      disabled={!currentUser?.isAdmin}
                      value={editRole}
                      onChange={(e) => setEditRole(e.target.value as any)}
                      className="w-full px-3 py-1.5 border border-gray-300 rounded text-xs disabled:bg-gray-100"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-gray-700 mb-1">Department</label>
                    <input
                      type="text"
                      disabled={!currentUser?.isAdmin}
                      value={editDepartment}
                      onChange={(e) => setEditDepartment(e.target.value)}
                      className="w-full px-3 py-1.5 border border-gray-300 rounded text-xs disabled:bg-gray-100"
                    />
                  </div>
                </div>
              </div>

              {/* Success Notification Alert */}
              {saveSuccessMsg && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-md flex items-center gap-2 font-bold animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>User account and permissions successfully updated!</span>
                </div>
              )}

            </div>

            {/* Modal Footer */}
            <div className="px-5 py-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
              <div>
                {currentUser?.isAdmin && users.length > 1 && (
                  <button
                    type="button"
                    onClick={handleDeleteCurrentEditingUser}
                    className="px-3 py-1.5 text-rose-700 hover:text-white hover:bg-rose-600 border border-rose-300 rounded text-xs font-semibold transition flex items-center gap-1.5 shadow-2xs"
                    title="Permanently remove this user account"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete User Account</span>
                  </button>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsAccessControlModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded text-xs font-semibold text-gray-700 hover:bg-white"
                >
                  Close
                </button>
                {currentUser?.isAdmin && (
                  <button
                    type="button"
                    onClick={handleSaveAccessControl}
                    className="px-4 py-2 bg-[#d65200] hover:bg-[#bf4700] text-white rounded text-xs font-bold shadow-xs transition flex items-center gap-1.5"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Save User & Permissions</span>
                  </button>
                )}
              </div>
            </div>

          </div>
        </div>
      )}
    </>
  );
};
