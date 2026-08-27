import React, { useState, useEffect } from 'react';
import { 
  X, 
  Printer, 
  Download, 
  Building2, 
  FileText, 
  Receipt, 
  CheckCircle2,
  ShieldCheck,
  Link2,
  ExternalLink,
  ArrowLeft,
  Check,
  Edit3,
  Save,
  Plus,
  Trash2,
  RotateCcw,
  Sparkles,
  AlertCircle,
  FileCode
} from 'lucide-react';
import { useAccounting } from '../context/AccountingContext';
import { TransactionLineItem } from '../types';

export const DocumentViewer: React.FC = () => {
  const { 
    previewDoc, 
    setPreviewDoc, 
    formatCurrency, 
    companyProfile, 
    openOriginalInvoice,
    linkTransactionToOriginalInvoice,
    updateTransaction,
    transactions,
    currentUser,
    setActiveTab,
    setSubView
  } = useAccounting();

  // Mode: view or edit
  const [isEditing, setIsEditing] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // Link invoice form modal inside viewer
  const [isLinkingOpen, setIsLinkingOpen] = useState(false);
  const [customOriginalNumber, setCustomOriginalNumber] = useState('');
  const [customOriginalDate, setCustomOriginalDate] = useState('');
  const [customOriginalAmount, setCustomOriginalAmount] = useState<number | ''>('');
  const [customOriginalMemo, setCustomOriginalMemo] = useState('');

  // Editable Form State for Invoice / Bill / Original Invoice
  const [editForm, setEditForm] = useState<{
    transactionNumber: string;
    entityName: string;
    date: string;
    dueDate: string;
    status: string;
    subsidiary: string;
    postingPeriod: string;
    memo: string;
    currency: string;
    taxRate: number; // 0.07 default
    items: Array<{
      id: string;
      description: string;
      quantity: number;
      unitPrice: number;
      taxRate: number;
      taxAmount: number;
      amount: number;
    }>;
    originalInvoiceNumber: string;
    originalInvoiceDate: string;
    originalInvoiceAmount: number | '';
    originalInvoiceMemo: string;
  }>({
    transactionNumber: '',
    entityName: '',
    date: '',
    dueDate: '',
    status: 'Draft',
    subsidiary: '',
    postingPeriod: '',
    memo: '',
    currency: 'USD',
    taxRate: 0.07,
    items: [],
    originalInvoiceNumber: '',
    originalInvoiceDate: '',
    originalInvoiceAmount: '',
    originalInvoiceMemo: '',
  });

  // Sync state when previewDoc changes
  useEffect(() => {
    if (previewDoc && previewDoc.data) {
      const d = previewDoc.data;
      const parsedItems = (d.items && d.items.length > 0)
        ? d.items.map((item: any, idx: number) => ({
            id: item.id || `item-${idx}`,
            description: item.description || '',
            quantity: item.quantity || 1,
            unitPrice: item.unitPrice || 0,
            taxRate: item.taxRate !== undefined ? item.taxRate : 0.07,
            taxAmount: item.taxAmount || 0,
            amount: item.amount || (item.quantity * item.unitPrice),
          }))
        : [
            {
              id: 'item-0',
              description: d.memo || 'General services & products',
              quantity: 1,
              unitPrice: d.subtotal || d.total || 0,
              taxRate: 0.07,
              taxAmount: d.taxTotal || 0,
              amount: d.subtotal || d.total || 0,
            }
          ];

      setEditForm({
        transactionNumber: d.transactionNumber || d.certNumber || '',
        entityName: d.entityName || d.payeeName || '',
        date: d.date || new Date().toISOString().split('T')[0],
        dueDate: d.dueDate || d.date || '',
        status: d.status || 'Draft',
        subsidiary: d.subsidiary || 'Global Operations',
        postingPeriod: d.postingPeriod || 'August 2026',
        memo: d.memo || '',
        currency: d.currency || 'USD',
        taxRate: 0.07,
        items: parsedItems,
        originalInvoiceNumber: d.originalInvoiceNumber || '',
        originalInvoiceDate: d.originalInvoiceDate || '',
        originalInvoiceAmount: d.originalInvoiceAmount || '',
        originalInvoiceMemo: d.originalInvoiceMemo || '',
      });
      setIsEditing(false);
      setIsLinkingOpen(false);
      setSaveSuccessMsg(null);
    }
  }, [previewDoc]);

  if (!previewDoc) return null;

  const { type, data, isOriginalDoc, sourceTx } = previewDoc;
  const isAdminOrAuthorized = currentUser ? (currentUser.role === 'Admin' || currentUser.role === 'Manager') : true;

  // Calculate live totals for edit form
  const computedSubtotal = editForm.items.reduce((sum, item) => sum + (Number(item.quantity || 0) * Number(item.unitPrice || 0)), 0);
  const computedTaxTotal = editForm.items.reduce((sum, item) => {
    const lineSubtotal = Number(item.quantity || 0) * Number(item.unitPrice || 0);
    return sum + (lineSubtotal * (Number(item.taxRate) || 0));
  }, 0);
  const computedTotal = computedSubtotal + computedTaxTotal;

  // Handlers for Edit Form
  const handleItemChange = (index: number, field: string, value: any) => {
    setEditForm(prev => {
      const newItems = [...prev.items];
      const item = { ...newItems[index], [field]: value };
      
      const qty = field === 'quantity' ? Number(value) : Number(item.quantity);
      const price = field === 'unitPrice' ? Number(value) : Number(item.unitPrice);
      const rate = field === 'taxRate' ? Number(value) : Number(item.taxRate || 0);
      
      const amt = qty * price;
      item.amount = amt;
      item.taxAmount = amt * rate;
      newItems[index] = item;
      return { ...prev, items: newItems };
    });
  };

  const handleAddItem = () => {
    setEditForm(prev => ({
      ...prev,
      items: [
        ...prev.items,
        {
          id: `item-${Date.now()}`,
          description: '',
          quantity: 1,
          unitPrice: 0,
          taxRate: 0.07,
          taxAmount: 0,
          amount: 0,
        }
      ]
    }));
  };

  const handleRemoveItem = (index: number) => {
    if (editForm.items.length <= 1) return;
    setEditForm(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  // Save changes to transaction and preview
  const handleSaveInvoiceChanges = (e: React.FormEvent) => {
    e.preventDefault();

    const formattedItems: TransactionLineItem[] = editForm.items.map((item, idx) => ({
      id: item.id || `line-${idx}`,
      description: item.description || 'Item description',
      quantity: Number(item.quantity) || 1,
      unitPrice: Number(item.unitPrice) || 0,
      taxRate: Number(item.taxRate) || 0,
      taxAmount: Number(item.taxAmount) || 0,
      amount: Number(item.amount) || 0,
    }));

    const updatedData = {
      ...data,
      transactionNumber: editForm.transactionNumber,
      entityName: editForm.entityName,
      date: editForm.date,
      dueDate: editForm.dueDate,
      status: editForm.status as any,
      subsidiary: editForm.subsidiary,
      postingPeriod: editForm.postingPeriod,
      memo: editForm.memo,
      items: formattedItems,
      subtotal: computedSubtotal,
      taxTotal: computedTaxTotal,
      total: computedTotal,
      balanceDue: Math.max(0, computedTotal - (data.amountPaid || 0)),
      originalInvoiceNumber: editForm.originalInvoiceNumber || undefined,
      originalInvoiceDate: editForm.originalInvoiceDate || undefined,
      originalInvoiceAmount: typeof editForm.originalInvoiceAmount === 'number' ? editForm.originalInvoiceAmount : undefined,
      originalInvoiceMemo: editForm.originalInvoiceMemo || undefined,
    };

    // If it's a real transaction in context, persist updates
    if (data.id && typeof updateTransaction === 'function') {
      updateTransaction(data.id, {
        transactionNumber: editForm.transactionNumber,
        entityName: editForm.entityName,
        date: editForm.date,
        dueDate: editForm.dueDate,
        status: editForm.status as any,
        subsidiary: editForm.subsidiary,
        postingPeriod: editForm.postingPeriod,
        memo: editForm.memo,
        items: formattedItems,
        subtotal: computedSubtotal,
        taxTotal: computedTaxTotal,
        total: computedTotal,
        originalInvoiceNumber: editForm.originalInvoiceNumber || undefined,
        originalInvoiceDate: editForm.originalInvoiceDate || undefined,
        originalInvoiceAmount: typeof editForm.originalInvoiceAmount === 'number' ? editForm.originalInvoiceAmount : undefined,
        originalInvoiceMemo: editForm.originalInvoiceMemo || undefined,
      });
    }

    // Update active document preview
    setPreviewDoc({
      ...previewDoc,
      data: updatedData
    });

    setIsEditing(false);
    setSaveSuccessMsg('Invoice & changes saved successfully!');
    setTimeout(() => setSaveSuccessMsg(null), 3500);
  };

  const handleApplyLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customOriginalNumber.trim()) return;

    const linkOpts = {
      originalInvoiceDate: customOriginalDate || data.date,
      originalInvoiceAmount: typeof customOriginalAmount === 'number' ? customOriginalAmount : data.total,
      originalInvoiceMemo: customOriginalMemo || `Original invoice linked to ${data.transactionNumber}`,
    };

    if (data.id) {
      linkTransactionToOriginalInvoice(data.id, customOriginalNumber.trim(), linkOpts);
      setPreviewDoc({
        ...previewDoc,
        data: {
          ...data,
          originalInvoiceNumber: customOriginalNumber.trim(),
          ...linkOpts
        }
      });
    }

    setEditForm(prev => ({
      ...prev,
      originalInvoiceNumber: customOriginalNumber.trim(),
      ...linkOpts
    }));

    setIsLinkingOpen(false);
    setSaveSuccessMsg(`Linked to original invoice #${customOriginalNumber.trim()}`);
    setTimeout(() => setSaveSuccessMsg(null), 3000);
  };

  // Helper to render VAT TIN digit boxes (matching official Cambodian standard)
  const renderVatTinBoxes = (tin: string) => {
    const clean = (tin || '').replace(/[^a-zA-Z0-9]/g, '');
    const prefix = clean.slice(0, 3).padEnd(3, ' ').split('');
    const suffix = clean.slice(3, 12).padEnd(9, ' ').split('');

    return (
      <div className="inline-flex items-center gap-1 font-mono text-[12px] font-bold text-gray-900">
        <div className="flex border border-gray-900 rounded-2xs overflow-hidden">
          {prefix.map((char, i) => (
            <span key={`pre-${i}`} className="w-4 h-4 flex items-center justify-center border-r last:border-r-0 border-gray-900 bg-white">
              {char !== ' ' ? char : ''}
            </span>
          ))}
        </div>
        <span className="font-bold text-gray-900">-</span>
        <div className="flex border border-gray-900 rounded-2xs overflow-hidden">
          {suffix.map((char, i) => (
            <span key={`suf-${i}`} className="w-4 h-4 flex items-center justify-center border-r last:border-r-0 border-gray-900 bg-white">
              {char !== ' ' ? char : ''}
            </span>
          ))}
        </div>
      </div>
    );
  };

  // Helper to render Date boxes (matching official Cambodian standard)
  const renderDateBoxes = (dateStr: string) => {
    const parts = (dateStr || '').split('-');
    const year = parts[0] || '2026';
    const month = parts[1] || '08';
    const day = parts[2] || '24';
    const digits = `${day}${month}${year}`.split('');

    return (
      <div className="inline-flex items-center gap-1 font-mono text-[12px] font-bold text-gray-900">
        <div className="flex border border-gray-900 rounded-2xs overflow-hidden">
          {digits.map((d, i) => (
            <span key={`date-${i}`} className="w-4 h-4 flex items-center justify-center border-r last:border-r-0 border-gray-900 bg-white">
              {d}
            </span>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-xl max-w-4xl w-full shadow-2xl overflow-hidden my-6 animate-in fade-in-50">
        
        {/* Top Modal Navigation & Action Bar */}
        <div className="bg-[#f8f9fa] px-6 py-3.5 border-b border-gray-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className={`p-2 rounded-lg ${isOriginalDoc ? 'bg-blue-100 text-blue-800' : 'bg-orange-100 text-[#d65200]'}`}>
              <FileText className="w-4 h-4" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-gray-900 text-sm">
                  {isOriginalDoc ? 'Original Source Document' : (type === 'WHT50Tawi' ? 'Section 50 Tawi WHT Certificate' : `${type} Document`)}
                </span>
                {isOriginalDoc && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-600 text-white flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    ORIGINAL INVOICE
                  </span>
                )}
                {isEditing && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-white flex items-center gap-1">
                    <Edit3 className="w-3 h-3" />
                    EDIT MODE
                  </span>
                )}
              </div>
              <div className="text-[11px] text-gray-500 font-mono">
                Document Ref: #{data.transactionNumber || data.certNumber || 'N/A'}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Return to source button if viewing original invoice */}
            {isOriginalDoc && sourceTx && (
              <button
                type="button"
                onClick={() => {
                  setPreviewDoc({
                    type: sourceTx.type === 'Invoice' ? 'Invoice' : 'Bill',
                    data: sourceTx,
                    isOriginalDoc: false
                  });
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 rounded-lg text-xs font-semibold transition"
                title="Return to originating transaction"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Return to #{sourceTx.transactionNumber}</span>
              </button>
            )}

            {/* Official Khmer/English Invoice Form File Generator */}
            {type !== 'WHT50Tawi' && (
              <button
                type="button"
                onClick={() => {
                  setPreviewDoc(null);
                  setActiveTab('documents');
                  setSubView('invoice_form');
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-lg text-xs font-bold transition shadow-2xs"
                title="Open in Official Cambodian Standard Invoice Form & File Generator"
              >
                <FileText className="w-3.5 h-3.5 text-emerald-700" />
                <span>Official Form (ទម្រង់វិក្កយបត្រ)</span>
              </button>
            )}

            {/* Admin/User Edit Mode Toggle Button */}
            {type !== 'WHT50Tawi' && (
              <button
                type="button"
                onClick={() => setIsEditing(!isEditing)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition shadow-2xs ${
                  isEditing 
                    ? 'bg-amber-600 hover:bg-amber-700 text-white' 
                    : 'bg-white hover:bg-gray-100 text-gray-800 border border-gray-300'
                }`}
                title="Edit invoice details, items, or change parameters"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>{isEditing ? 'View Mode' : 'Edit Invoice'}</span>
              </button>
            )}

            {/* Print button */}
            {!isEditing && (
              <button
                onClick={() => window.print()}
                className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg text-xs font-semibold transition"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print</span>
              </button>
            )}

            {/* Close Button */}
            <button
              onClick={() => setPreviewDoc(null)}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:bg-gray-200 hover:text-gray-900 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Success Alert Banner */}
        {saveSuccessMsg && (
          <div className="bg-emerald-50 border-b border-emerald-200 px-6 py-2 flex items-center justify-between text-xs text-emerald-800 animate-in slide-in-from-top-2">
            <span className="flex items-center gap-1.5 font-semibold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              {saveSuccessMsg}
            </span>
            <button onClick={() => setSaveSuccessMsg(null)} className="text-emerald-600 hover:text-emerald-800">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* ORIGINAL INVOICE LINKAGE BANNER (WHEN NOT IN EDIT MODE) */}
        {!isOriginalDoc && data.originalInvoiceNumber && (
          <div className="bg-blue-50/90 border-b border-blue-200 px-6 py-2.5 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 text-xs text-blue-900">
              <span className="p-1.5 bg-blue-200 text-blue-800 rounded-lg">
                <Link2 className="w-4 h-4" />
              </span>
              <div>
                <span className="font-bold">Linked to Original Invoice: </span>
                <span className="font-mono font-bold text-blue-950 px-2 py-0.5 bg-white rounded border border-blue-200 shadow-2xs">
                  #{data.originalInvoiceNumber}
                </span>
                {data.originalInvoiceDate && (
                  <span className="text-blue-700 ml-2 font-mono text-[11px]">• Dated: {data.originalInvoiceDate}</span>
                )}
                {data.originalInvoiceAmount && (
                  <span className="text-blue-700 ml-2 font-mono text-[11px]">• Total: {formatCurrency(data.originalInvoiceAmount, data.originalInvoiceCurrency || data.currency)}</span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => openOriginalInvoice(data)}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
                title="View full voucher for original invoice"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Show Original Invoice</span>
                <ExternalLink className="w-3 h-3 ml-0.5" />
              </button>
              
              <button
                type="button"
                onClick={() => {
                  setCustomOriginalNumber(data.originalInvoiceNumber || '');
                  setCustomOriginalDate(data.originalInvoiceDate || data.date || '');
                  setCustomOriginalAmount(data.originalInvoiceAmount || data.total || '');
                  setCustomOriginalMemo(data.originalInvoiceMemo || '');
                  setIsLinkingOpen(true);
                }}
                className="px-2.5 py-1.5 bg-white hover:bg-gray-100 text-gray-700 border border-blue-200 rounded-lg text-xs font-medium transition"
              >
                Change Link
              </button>
            </div>
          </div>
        )}

        {/* If NO original invoice is linked yet, offer a clear one-click button */}
        {!isOriginalDoc && !data.originalInvoiceNumber && (
          <div className="bg-amber-50/70 border-b border-amber-200 px-6 py-2.5 flex items-center justify-between gap-4 text-xs">
            <span className="text-amber-800 flex items-center gap-1.5 font-medium">
              <Link2 className="w-3.5 h-3.5 text-amber-600" />
              <span>No original source invoice linked to this document yet.</span>
            </span>
            <button
              type="button"
              onClick={() => {
                setCustomOriginalNumber('');
                setCustomOriginalDate(data.date || '');
                setCustomOriginalAmount(data.total || '');
                setCustomOriginalMemo('');
                setIsLinkingOpen(true);
              }}
              className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-2xs"
            >
              <Link2 className="w-3.5 h-3.5" />
              <span>Link to Original Invoice</span>
            </button>
          </div>
        )}

        {/* INLINE LINKING FORM POPUP / DRAWER */}
        {isLinkingOpen && (
          <form onSubmit={handleApplyLink} className="p-4 bg-gray-50 border-b border-gray-200 space-y-3 animate-in slide-in-from-top-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-gray-800 text-xs flex items-center gap-1.5">
                <Link2 className="w-3.5 h-3.5 text-[#d65200]" />
                <span>Link Original Invoice / Supplier Tax Invoice</span>
              </span>
              <button
                type="button"
                onClick={() => setIsLinkingOpen(false)}
                className="text-gray-400 hover:text-gray-600 text-xs"
              >
                Cancel
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
              <div>
                <label className="block text-gray-600 text-[11px] mb-0.5">Original Invoice Number *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. INV-2026-0801, AR-TAX-88419"
                  value={customOriginalNumber}
                  onChange={(e) => setCustomOriginalNumber(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg text-xs font-mono focus:ring-1 focus:ring-[#d65200]"
                />
              </div>

              <div>
                <label className="block text-gray-600 text-[11px] mb-0.5">Original Invoice Date</label>
                <input
                  type="date"
                  value={customOriginalDate}
                  onChange={(e) => setCustomOriginalDate(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg text-xs focus:ring-1 focus:ring-[#d65200]"
                />
              </div>

              <div>
                <label className="block text-gray-600 text-[11px] mb-0.5">Original Amount ({data.currency})</label>
                <input
                  type="number"
                  step="0.01"
                  value={customOriginalAmount}
                  onChange={(e) => setCustomOriginalAmount(e.target.value ? parseFloat(e.target.value) : '')}
                  className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg text-xs font-mono focus:ring-1 focus:ring-[#d65200]"
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-600 text-[11px] mb-0.5">Memo / Description</label>
              <input
                type="text"
                placeholder="e.g. Master contract agreement or supplier invoice ref"
                value={customOriginalMemo}
                onChange={(e) => setCustomOriginalMemo(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg text-xs focus:ring-1 focus:ring-[#d65200]"
              />
            </div>

            {/* Quick Pick from Existing System Invoices */}
            <div>
              <label className="block text-gray-500 text-[10px] uppercase font-bold mb-1">Quick Select Existing Invoice:</label>
              <div className="flex flex-wrap gap-1.5">
                {transactions
                  .filter(t => t.id !== data.id && (t.type === 'Invoice' || t.type === 'Bill'))
                  .slice(0, 6)
                  .map(txOption => (
                    <button
                      key={txOption.id}
                      type="button"
                      onClick={() => {
                        setCustomOriginalNumber(txOption.transactionNumber);
                        setCustomOriginalDate(txOption.date);
                        setCustomOriginalAmount(txOption.total);
                        setCustomOriginalMemo(`${txOption.entityName} - ${txOption.memo || ''}`);
                      }}
                      className="px-2 py-1 bg-white hover:bg-orange-50 border border-gray-200 hover:border-[#d65200] rounded text-[11px] font-mono text-gray-800 transition"
                    >
                      {txOption.transactionNumber} ({txOption.entityName.substring(0, 16)}...)
                    </button>
                  ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsLinkingOpen(false)}
                className="px-3 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-[#d65200] hover:bg-[#b84300] text-white font-bold rounded-lg text-xs transition flex items-center gap-1 shadow-xs"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Save Link</span>
              </button>
            </div>
          </form>
        )}

        {/* ========================================================================= */}
        {/* DOCUMENT CONTENT / EDITABLE FORM VIEW                                     */}
        {/* ========================================================================= */}
        <div className="p-6 md:p-8 bg-white text-gray-900 font-sans text-xs space-y-6 max-h-[75vh] overflow-y-auto">
          
          {/* CASE 1: WITHHOLDING TAX CERTIFICATE */}
          {type === 'WHT50Tawi' ? (
            <div className="border-2 border-gray-800 p-6 rounded space-y-4">
              <div className="text-center border-b-2 border-gray-800 pb-3">
                <h2 className="text-base font-bold">Withholding Tax Certificate</h2>
                <h3 className="text-sm font-semibold">Under Section 50 Bis of the Revenue Code</h3>
                <div className="mt-1 flex justify-between text-[11px] font-mono">
                  <span>Book No.: 2026/08</span>
                  <span className="font-bold text-[#d65200]">Cert No.: {data.certNumber}</span>
                </div>
              </div>

              {/* Payer */}
              <div className="border border-gray-300 p-3 rounded bg-gray-50">
                <div className="font-bold text-[11px] text-gray-700">1. Withholding Tax Payer:</div>
                <div className="font-bold text-gray-900 text-sm mt-0.5">{companyProfile.name}</div>
                <div>Tax ID: <span className="font-mono font-bold">{companyProfile.taxId}</span> (Branch {companyProfile.branchNumber || '00000'})</div>
                <div className="text-gray-600 text-[11px]">{companyProfile.address}</div>
              </div>

              {/* Payee */}
              <div className="border border-gray-300 p-3 rounded bg-gray-50">
                <div className="font-bold text-[11px] text-gray-700">2. Payee / Supplier:</div>
                <div className="font-bold text-gray-900 text-sm mt-0.5">{data.payeeName}</div>
                <div>Tax ID: <span className="font-mono font-bold">{data.payeeTaxId}</span></div>
                <div className="text-gray-600 text-[11px]">{data.payeeAddress}</div>
              </div>

              {/* Tax Table */}
              <table className="w-full border border-gray-400 text-left text-xs">
                <thead className="bg-gray-100 border-b border-gray-400 text-[11px]">
                  <tr>
                    <th className="p-2 border-r border-gray-400">Type of Income</th>
                    <th className="p-2 border-r border-gray-400 text-center">Date</th>
                    <th className="p-2 border-r border-gray-400 text-right">Base Amount</th>
                    <th className="p-2 border-r border-gray-400 text-center">Rate</th>
                    <th className="p-2 text-right">Tax Withheld</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="p-2 border-r border-gray-400 font-medium">
                      {data.incomeDescription || 'Professional & Transport Services'} ({data.incomeType})
                    </td>
                    <td className="p-2 border-r border-gray-400 text-center font-mono">{data.date}</td>
                    <td className="p-2 border-r border-gray-400 text-right font-mono">{formatCurrency(data.baseAmount)}</td>
                    <td className="p-2 border-r border-gray-400 text-center font-mono font-bold text-[#d65200]">
                      {(data.whtRate * 100).toFixed(0)}%
                    </td>
                    <td className="p-2 text-right font-mono font-bold text-gray-900">{formatCurrency(data.whtAmount)}</td>
                  </tr>
                </tbody>
                <tfoot className="border-t border-gray-400 bg-gray-50 font-bold">
                  <tr>
                    <td colSpan={2} className="p-2 border-r border-gray-400">Total Base & Tax Withheld (TOTAL)</td>
                    <td className="p-2 border-r border-gray-400 text-right font-mono">{formatCurrency(data.baseAmount)}</td>
                    <td className="p-2 border-r border-gray-400"></td>
                    <td className="p-2 text-right font-mono text-emerald-800">{formatCurrency(data.whtAmount)}</td>
                  </tr>
                </tfoot>
              </table>

              {/* Signatures */}
              <div className="pt-6 flex justify-between items-end text-center">
                <div>
                  <div className="w-40 border-b border-gray-800 pb-1 font-mono font-bold">Somchai Prasert</div>
                  <div className="text-[10px] text-gray-500 mt-1">Authorized Signature</div>
                </div>
                <div className="w-24 h-24 border border-dashed border-gray-400 rounded flex items-center justify-center text-[10px] text-gray-400">
                  (Company Stamp)
                </div>
              </div>
            </div>
          ) : isEditing ? (
            /* ================================================================ */
            /* CASE 2-A: FULL EDIT MODE (CHANGE HEADER, LINE ITEMS, AMOUNTS)    */
            /* ================================================================ */
            <form onSubmit={handleSaveInvoiceChanges} className="space-y-6">
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Edit3 className="w-5 h-5 text-amber-600" />
                  <div>
                    <h4 className="font-bold text-gray-900 text-sm">Editing Document & Original Invoice Data</h4>
                    <p className="text-[11px] text-amber-800">
                      Update numbers, line items, original invoice references, or status. Changes sync directly to the General Ledger.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-3 py-1.5 bg-white hover:bg-gray-100 border border-gray-300 text-gray-700 rounded-lg text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-[#d65200] hover:bg-[#b84300] text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save & Apply Changes</span>
                  </button>
                </div>
              </div>

              {/* Document Header Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 bg-gray-50 p-4 rounded-xl border border-gray-200">
                <div>
                  <label className="block text-gray-700 font-bold text-xs mb-1">Invoice / Ref #</label>
                  <input
                    type="text"
                    required
                    value={editForm.transactionNumber}
                    onChange={(e) => setEditForm({ ...editForm, transactionNumber: e.target.value })}
                    className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg text-xs font-mono font-bold focus:ring-2 focus:ring-[#d65200]"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-bold text-xs mb-1">Entity / Customer / Vendor</label>
                  <input
                    type="text"
                    required
                    value={editForm.entityName}
                    onChange={(e) => setEditForm({ ...editForm, entityName: e.target.value })}
                    className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-[#d65200]"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-bold text-xs mb-1">Invoice Date</label>
                  <input
                    type="date"
                    required
                    value={editForm.date}
                    onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                    className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-bold text-xs mb-1">Status</label>
                  <select
                    value={editForm.status}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                    className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg text-xs font-bold bg-white"
                  >
                    <option value="Draft">Draft</option>
                    <option value="Approved">Approved</option>
                    <option value="Paid">Paid</option>
                    <option value="Partially_Paid">Partially Paid</option>
                    <option value="Void">Void</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-gray-700 font-bold text-xs mb-1">Memo / Description</label>
                  <input
                    type="text"
                    value={editForm.memo}
                    onChange={(e) => setEditForm({ ...editForm, memo: e.target.value })}
                    placeholder="e.g. Tour package operations August 2026"
                    className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-bold text-xs mb-1">Subsidiary / Dept</label>
                  <input
                    type="text"
                    value={editForm.subsidiary}
                    onChange={(e) => setEditForm({ ...editForm, subsidiary: e.target.value })}
                    className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-bold text-xs mb-1">Posting Period</label>
                  <input
                    type="text"
                    value={editForm.postingPeriod}
                    onChange={(e) => setEditForm({ ...editForm, postingPeriod: e.target.value })}
                    className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg text-xs font-medium"
                  />
                </div>
              </div>

              {/* Linked Original Invoice Section in Editor */}
              <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-blue-900 text-xs flex items-center gap-1.5">
                    <Link2 className="w-4 h-4 text-blue-600" />
                    <span>Linked Original Invoice Settings</span>
                  </span>
                  {editForm.originalInvoiceNumber && (
                    <button
                      type="button"
                      onClick={() => setEditForm(prev => ({
                        ...prev,
                        originalInvoiceNumber: '',
                        originalInvoiceDate: '',
                        originalInvoiceAmount: '',
                        originalInvoiceMemo: ''
                      }))}
                      className="text-[11px] text-rose-600 hover:text-rose-800 underline font-medium"
                    >
                      Clear Original Link
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs">
                  <div>
                    <label className="block text-gray-600 text-[11px] mb-0.5">Original Invoice #</label>
                    <input
                      type="text"
                      placeholder="e.g. INV-2026-0801"
                      value={editForm.originalInvoiceNumber}
                      onChange={(e) => setEditForm({ ...editForm, originalInvoiceNumber: e.target.value })}
                      className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg text-xs font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-600 text-[11px] mb-0.5">Original Date</label>
                    <input
                      type="date"
                      value={editForm.originalInvoiceDate}
                      onChange={(e) => setEditForm({ ...editForm, originalInvoiceDate: e.target.value })}
                      className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-600 text-[11px] mb-0.5">Original Amount ({editForm.currency})</label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={editForm.originalInvoiceAmount}
                      onChange={(e) => setEditForm({ ...editForm, originalInvoiceAmount: e.target.value ? parseFloat(e.target.value) : '' })}
                      className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-600 text-[11px] mb-0.5">Original Memo / Note</label>
                    <input
                      type="text"
                      placeholder="e.g. Supplier source billing"
                      value={editForm.originalInvoiceMemo}
                      onChange={(e) => setEditForm({ ...editForm, originalInvoiceMemo: e.target.value })}
                      className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Line Items Table in Editor */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-gray-800 text-xs uppercase tracking-wider">Invoice Line Items</h4>
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 hover:bg-orange-50 hover:text-[#d65200] border border-gray-300 text-gray-700 rounded-lg text-xs font-bold transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Item</span>
                  </button>
                </div>

                <div className="border border-gray-300 rounded-xl overflow-hidden shadow-2xs">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-gray-100 border-b border-gray-300 text-gray-700 text-[11px] uppercase">
                      <tr>
                        <th className="p-2.5 font-bold">Description</th>
                        <th className="p-2.5 w-20 text-center font-bold">Qty</th>
                        <th className="p-2.5 w-28 text-right font-bold">Unit Price</th>
                        <th className="p-2.5 w-24 text-center font-bold">VAT Rate</th>
                        <th className="p-2.5 w-28 text-right font-bold">Line Total</th>
                        <th className="p-2.5 w-12 text-center"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {editForm.items.map((item, idx) => (
                        <tr key={item.id || idx} className="hover:bg-gray-50">
                          <td className="p-2">
                            <input
                              type="text"
                              required
                              placeholder="Item or service description"
                              value={item.description}
                              onChange={(e) => handleItemChange(idx, 'description', e.target.value)}
                              className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-[#d65200]"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="number"
                              step="any"
                              min="0.01"
                              required
                              value={item.quantity}
                              onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                              className="w-full px-2 py-1 border border-gray-300 rounded text-xs text-center font-mono"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="number"
                              step="any"
                              required
                              value={item.unitPrice}
                              onChange={(e) => handleItemChange(idx, 'unitPrice', e.target.value)}
                              className="w-full px-2 py-1 border border-gray-300 rounded text-xs text-right font-mono font-semibold"
                            />
                          </td>
                          <td className="p-2">
                            <select
                              value={item.taxRate}
                              onChange={(e) => handleItemChange(idx, 'taxRate', parseFloat(e.target.value))}
                              className="w-full px-1.5 py-1 border border-gray-300 rounded text-[11px] bg-white"
                            >
                              <option value="0.07">7% VAT</option>
                              <option value="0">0% Exempt</option>
                            </select>
                          </td>
                          <td className="p-2 text-right font-mono font-bold text-gray-900">
                            {formatCurrency(Number(item.quantity || 0) * Number(item.unitPrice || 0), editForm.currency as any)}
                          </td>
                          <td className="p-2 text-center">
                            {editForm.items.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveItem(idx)}
                                className="p-1 text-gray-400 hover:text-rose-600 rounded transition"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Totals and Save Button */}
              <div className="flex flex-col sm:flex-row items-end justify-between gap-4 pt-3 border-t border-gray-200">
                <div className="text-gray-500 text-xs font-mono">
                  * Totals are automatically computed based on line quantity, unit price, and standard 7% VAT.
                </div>

                <div className="w-full sm:w-72 space-y-1.5 text-xs bg-gray-50 p-3 rounded-xl border border-gray-200">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal:</span>
                    <span className="font-mono font-semibold">{formatCurrency(computedSubtotal, editForm.currency as any)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>VAT 7%:</span>
                    <span className="font-mono font-semibold text-orange-700">{formatCurrency(computedTaxTotal, editForm.currency as any)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold text-gray-900 pt-2 border-t border-gray-300">
                    <span>Grand Total:</span>
                    <span className="font-mono text-[#d65200]">{formatCurrency(computedTotal, editForm.currency as any)}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#d65200] hover:bg-[#b84300] text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-xs"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Invoice Changes</span>
                </button>
              </div>
            </form>
          ) : (
            /* ================================================================ */
            /* CASE 2-B: OFFICIAL BILINGUAL TAX INVOICE & RECEIPT VIEW         */
            /* ================================================================ */
            <div className="bg-white border-2 border-gray-900 p-6 md:p-8 rounded-none shadow-sm space-y-5 text-gray-900 font-sans text-xs">
              
              {/* TOP HEADER SECTION (Company Info & Dual Titles) */}
              <div className="flex flex-col md:flex-row justify-between items-start gap-4 border-b-2 border-gray-900 pb-4">
                {/* Left: Company / Seller Identity */}
                <div className="space-y-1 max-w-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-[#d65200] text-white flex items-center justify-center font-bold text-xl shadow-xs shrink-0">
                      {companyProfile.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h1 className="text-base md:text-lg font-bold text-gray-900 leading-tight">
                        {companyProfile.nameKh || 'ក្រុមហ៊ុន ហ្គ្លោបល ធួរ & ឡូជីស្ទីក ឯ.ក'}
                      </h1>
                      <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wide">
                        {companyProfile.name}
                      </h2>
                    </div>
                  </div>

                  <div className="pt-2 text-[11px] space-y-0.5 text-gray-700">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-900">លេខអត្តសញ្ញាណកម្ម អតប (VAT TIN):</span>
                      {renderVatTinBoxes(companyProfile.taxId || 'K001-902348123')}
                    </div>
                    <div className="text-gray-700">
                      <span className="font-semibold text-gray-900">អាសយដ្ឋាន (Address):</span> {companyProfile.address}
                    </div>
                    <div className="text-gray-700">
                      <span className="font-semibold text-gray-900">ទូរស័ព្ទ (Tel):</span> {companyProfile.phone || '023 888 999 / 012 345 678'}
                    </div>
                  </div>
                </div>

                {/* Right: Dual-Language Title & Meta Table */}
                <div className="w-full md:w-64 flex flex-col items-end text-right">
                  <div className="mb-2 text-center md:text-right">
                    <h2 className="text-lg md:text-xl font-extrabold text-[#d65200] tracking-tight">
                      {isOriginalDoc ? 'វិក្កយបត្រដើម' : (data.type === 'Bill' ? 'វិក្កយបត្រអ្នកផ្គត់ផ្គង់' : 'វិក្កយបត្រពន្ធ')}
                    </h2>
                    <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                      {isOriginalDoc ? 'ORIGINAL INVOICE' : (data.type === 'Bill' ? 'SUPPLIER BILL / INVOICE' : 'TAX INVOICE')}
                    </h3>
                  </div>

                  <div className="w-full border border-gray-900 text-[11px]">
                    <div className="flex border-b border-gray-900">
                      <div className="w-1/2 bg-gray-100 p-1.5 font-bold border-r border-gray-900 text-left">
                        <div>លេខវិក្កយបត្រ</div>
                        <div className="text-[9px] text-gray-600 font-normal">Invoice No.</div>
                      </div>
                      <div className="w-1/2 p-1.5 font-mono font-bold text-center text-gray-900 flex items-center justify-center">
                        #{data.transactionNumber}
                      </div>
                    </div>
                    <div className="flex">
                      <div className="w-1/2 bg-gray-100 p-1.5 font-bold border-r border-gray-900 text-left">
                        <div>កាលបរិច្ឆេទ</div>
                        <div className="text-[9px] text-gray-600 font-normal">Date (DDMMYYYY)</div>
                      </div>
                      <div className="w-1/2 p-1.5 flex items-center justify-center">
                        {renderDateBoxes(data.date)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* CUSTOMER / BUYER INFORMATION BOX */}
              <div className="border border-gray-900 p-3 bg-gray-50/50 space-y-1.5 text-[11px]">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <div>
                      <span className="font-bold text-gray-900">ឈ្មោះអតិថិជន / ក្រុមហ៊ុន (Customer Name): </span>
                      <span className="font-bold text-gray-900 text-xs">{data.entityName}</span>
                    </div>
                    <div>
                      <span className="font-bold text-gray-900">អាសយដ្ឋាន (Address): </span>
                      <span className="text-gray-700">{data.subsidiary || 'Phnom Penh, Kingdom of Cambodia'}</span>
                    </div>
                  </div>
                  <div className="space-y-1 md:text-right">
                    <div className="flex md:justify-end items-center gap-2">
                      <span className="font-bold text-gray-900">លេខអត្តសញ្ញាណកម្ម អតប (VAT TIN):</span>
                      {renderVatTinBoxes(data.taxId || data.payeeTaxId || 'K008-892341908')}
                    </div>
                    <div>
                      <span className="font-bold text-gray-900">ស្ថានភាព (Status): </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 uppercase">
                        {data.status || 'Posted'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* LINE ITEMS TABLE (OFFICIAL BILINGUAL FORMAT) */}
              <div className="border border-gray-900 overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="bg-gray-100 border-b border-gray-900 text-[11px]">
                    <tr className="text-center font-bold text-gray-900 divide-x divide-gray-900">
                      <th className="p-2 w-12">
                        <div>ល.រ</div>
                        <div className="text-[9px] font-normal text-gray-600">No.</div>
                      </th>
                      <th className="p-2 text-left">
                        <div>បរិយាយមុខទំនិញ ឬសេវាកម្ម</div>
                        <div className="text-[9px] font-normal text-gray-600">Description of Goods or Services</div>
                      </th>
                      <th className="p-2 w-20">
                        <div>បរិមាណ</div>
                        <div className="text-[9px] font-normal text-gray-600">Quantity</div>
                      </th>
                      <th className="p-2 w-28 text-right">
                        <div>ថ្លៃឯកតា</div>
                        <div className="text-[9px] font-normal text-gray-600">Unit Price ({data.currency || 'USD'})</div>
                      </th>
                      <th className="p-2 w-32 text-right">
                        <div>ថ្លៃទំនិញ/សេវា</div>
                        <div className="text-[9px] font-normal text-gray-600">Amount ({data.currency || 'USD'})</div>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-900">
                    {data.items && data.items.length > 0 ? (
                      data.items.map((item: any, idx: number) => (
                        <tr key={idx} className="divide-x divide-gray-900 hover:bg-gray-50/50">
                          <td className="p-2 text-center font-mono text-gray-600">{idx + 1}</td>
                          <td className="p-2 font-medium text-gray-900">{item.description}</td>
                          <td className="p-2 text-center font-mono">{item.quantity}</td>
                          <td className="p-2 text-right font-mono">{formatCurrency(item.unitPrice, data.currency)}</td>
                          <td className="p-2 text-right font-mono font-bold text-gray-900">{formatCurrency(item.amount, data.currency)}</td>
                        </tr>
                      ))
                    ) : (
                      <tr className="divide-x divide-gray-900">
                        <td className="p-2 text-center font-mono text-gray-600">1</td>
                        <td className="p-2 font-medium text-gray-900">{data.memo || 'Tour arrangement, ground handling & logistics services'}</td>
                        <td className="p-2 text-center font-mono">1</td>
                        <td className="p-2 text-right font-mono">{formatCurrency(data.subtotal || data.total, data.currency)}</td>
                        <td className="p-2 text-right font-mono font-bold text-gray-900">{formatCurrency(data.subtotal || data.total, data.currency)}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* CALCULATION & TOTALS SECTION (USD + KHR EXCHANGE CONVERSION) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                {/* Notes & Linked Documents */}
                <div className="space-y-3 text-[11px]">
                  <div className="p-2.5 bg-gray-50 border border-gray-300 rounded text-gray-700 space-y-1">
                    <div className="font-bold text-gray-900 flex items-center gap-1.5">
                      <FileCode className="w-3.5 h-3.5 text-[#d65200]" />
                      <span>អត្រាប្តូរប្រាក់ (GDT / NBC Exchange Rate):</span>
                    </div>
                    <div className="font-mono text-xs font-semibold text-gray-800">
                      1 USD = 4,015 KHR (ប្រាក់រៀល)
                    </div>
                    {data.memo && (
                      <div className="pt-1 text-gray-600 border-t border-gray-200 mt-1">
                        <strong>Memo / Note:</strong> {data.memo}
                      </div>
                    )}
                  </div>

                  {data.linkedDocuments && data.linkedDocuments.length > 0 && (
                    <div>
                      <span className="text-[10px] uppercase font-bold text-gray-600 block mb-1">
                        ឯកសារយោង និងសវនកម្ម (Linked Audit References):
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {data.linkedDocuments.map((ld: any) => (
                          <div key={ld.id} className="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-[10px] font-mono flex items-center gap-1.5">
                            <FileText className="w-3 h-3 text-gray-600" />
                            <span><strong>{ld.type}:</strong> {ld.number}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Totals Table */}
                <div className="border border-gray-900 text-xs">
                  <div className="flex justify-between p-2 border-b border-gray-900">
                    <div className="text-gray-700">
                      <span className="font-bold">សរុប</span> (Subtotal USD):
                    </div>
                    <div className="font-mono font-bold text-gray-900">
                      {formatCurrency(data.subtotal || (data.total - (data.taxTotal || 0)), data.currency)}
                    </div>
                  </div>
                  <div className="flex justify-between p-2 border-b border-gray-900 bg-gray-50/50">
                    <div className="text-gray-700">
                      <span className="font-bold">អាករលើតម្លៃបន្ថែម ១០%</span> (VAT 10% USD):
                    </div>
                    <div className="font-mono font-bold text-orange-700">
                      {formatCurrency(data.taxTotal || (data.total * 0.1), data.currency)}
                    </div>
                  </div>
                  <div className="flex justify-between p-2 border-b border-gray-900 bg-gray-100 font-bold text-gray-900 text-sm">
                    <div>
                      <span>សរុបរួម</span> (Grand Total USD):
                    </div>
                    <div className="font-mono text-[#d65200]">
                      {formatCurrency(data.total, data.currency)}
                    </div>
                  </div>
                  <div className="flex justify-between p-2 bg-amber-50/80 font-bold text-gray-900">
                    <div className="text-amber-900 text-[11px]">
                      <span>សរុបជាប្រាក់រៀល</span> (Grand Total KHR):
                    </div>
                    <div className="font-mono text-emerald-800 text-sm">
                      ៛ {Math.round((data.total || 0) * 4015).toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>

              {/* OFFICIAL SIGNATURE BOXES */}
              <div className="grid grid-cols-2 gap-6 pt-8 text-center text-xs">
                <div className="space-y-16">
                  <div>
                    <div className="font-bold text-gray-900">ហត្ថលេខា និងឈ្មោះអ្នកទិញ</div>
                    <div className="text-[10px] text-gray-500">Customer's Signature & Name</div>
                  </div>
                  <div className="border-t border-gray-400 mx-8 pt-1 text-[11px] text-gray-600 font-medium">
                    កាលបរិច្ឆេទ (Date): _____ / _____ / 2026
                  </div>
                </div>
                <div className="space-y-16">
                  <div>
                    <div className="font-bold text-gray-900">ហត្ថលេខា និងឈ្មោះអ្នកលក់</div>
                    <div className="text-[10px] text-gray-500">Seller's Signature & Name</div>
                  </div>
                  <div className="border-t border-gray-400 mx-8 pt-1 text-[11px] text-gray-600 font-medium">
                    កាលបរិច្ឆេទ (Date): _____ / _____ / 2026
                  </div>
                </div>
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
};
