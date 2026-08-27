import React, { useState, useEffect, useRef } from 'react';
import { 
  Printer, 
  Download, 
  FileText, 
  Save, 
  Plus, 
  Trash2, 
  Edit3, 
  Eye, 
  RefreshCw, 
  CheckCircle2, 
  Share2, 
  Copy, 
  ArrowLeft,
  Sliders,
  DollarSign,
  Building,
  Upload,
  FileCode,
  FileSpreadsheet,
  Check,
  Sparkles,
  RotateCcw,
  ShieldCheck,
  Zap,
  Layers,
  ArrowRight
} from 'lucide-react';
import { useAccounting } from '../context/AccountingContext';
import { Transaction } from '../types';

interface InvoiceLine {
  id: string;
  no: number;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

export const OfficialInvoiceForm: React.FC<{
  initialData?: any;
  onClose?: () => void;
}> = ({ initialData, onClose }) => {
  const { 
    companyProfile, 
    transactions, 
    addTransaction, 
    updateTransaction,
    customers,
    formatCurrency,
    setActiveTab,
    setPreviewDoc,
    activeJurisdiction
  } = useAccounting();

  // Selected Transaction selector
  const [selectedTxId, setSelectedTxId] = useState<string>(initialData?.id || '');
  const [autoSyncToOriginal, setAutoSyncToOriginal] = useState<boolean>(true);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);

  // Form Mode: Preview vs Interactive Editing
  const [isEditMode, setIsEditMode] = useState<boolean>(!initialData);
  const [copyType, setCopyType] = useState<'Original' | 'Copied'>('Original'); // ច្បាប់ដើម vs ច្បាប់ចម្លង
  const [docTypeTitle, setDocTypeTitle] = useState<'Invoice' | 'Tax Invoice'>('Invoice'); // វិក្កយបត្រ vs វិក្កយបត្រពន្ធ
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // Seller / Company Information
  const [companyNameKh, setCompanyNameKh] = useState<string>('ឈ្មោះក្រុមហ៊ុន ឯ.ក');
  const [companyNameEn, setCompanyNameEn] = useState<string>(companyProfile?.name || 'GLOBAL TOUR & LOGISTICS CO., LTD.');
  const [sellerVatTin, setSellerVatTin] = useState<string>('K001-902348123');
  const [houseNo, setHouseNo] = useState<string>('១២');
  const [streetNo, setStreetNo] = useState<string>('ផ្លូវ ២១៤');
  const [commune, setCommune] = useState<string>('បឹងរាំង');
  const [khan, setKhan] = useState<string>('ដូនពេញ');
  const [city, setCity] = useState<string>('រាជធានីភ្នំពេញ');
  const [telephone, setTelephone] = useState<string>('023 888 999 / 012 345 678');
  const [logoUrl, setLogoUrl] = useState<string>('');

  // Invoice Meta
  const [invoiceNumber, setInvoiceNumber] = useState<string>(`INV-2026-${Math.floor(1000 + Math.random() * 9000)}`);
  const [invoiceDate, setInvoiceDate] = useState<string>(new Date().toISOString().split('T')[0]);

  // Customer Information
  const [customerNameKh, setCustomerNameKh] = useState<string>('ក្រុមហ៊ុន ទេសចរណ៍ និងបដិសណ្ឋារកិច្ច អន្តរជាតិ');
  const [customerNameEn, setCustomerNameEn] = useState<string>('Angkor Discovery Journeys Co., Ltd.');
  const [customerAddress, setCustomerAddress] = useState<string>('No. 45, Preah Sihanouk Blvd, Tonle Bassac, Chamkarmon, Phnom Penh');
  const [customerPhone, setCustomerPhone] = useState<string>('023 999 888');
  const [customerVatTin, setCustomerVatTin] = useState<string>('K008-892341908');

  // Exchange rate & Tax
  const [exchangeRate, setExchangeRate] = useState<number>(4015); // Standard Cambodian NBC/GDT rate (e.g. 4015 KHR / USD)
  const [vatRatePercent, setVatRatePercent] = useState<number>(10); // Standard 10% VAT in Cambodia

  // Line items
  const [lines, setLines] = useState<InvoiceLine[]>([
    {
      id: '1',
      no: 1,
      description: 'FHD-FXRD Luxury Tour Package - Angkor Wat Sunrise & Mekong Cruise',
      quantity: 1,
      unitPrice: 1100.00,
      amount: 1100.00
    }
  ]);

  // Original tx object reference
  const selectedOriginalTx = transactions.find(t => t.id === selectedTxId);

  // Sync if initialData is provided
  useEffect(() => {
    if (initialData) {
      loadFromTransaction(initialData);
    }
  }, [initialData]);

  // Load from an existing transaction
  const loadFromTransaction = (tx: any) => {
    if (!tx) return;
    setSelectedTxId(tx.id);
    setInvoiceNumber(tx.transactionNumber || invoiceNumber);
    setInvoiceDate(tx.date || invoiceDate);
    setCustomerNameEn(tx.entityName || customerNameEn);
    
    if (tx.memo) {
      setCustomerNameKh(tx.memo.includes('(') ? tx.memo : customerNameKh);
    }

    if (tx.items && tx.items.length > 0) {
      setLines(tx.items.map((item: any, idx: number) => ({
        id: item.id || `line-${idx}`,
        no: idx + 1,
        description: item.description || `Item #${idx + 1}`,
        quantity: Number(item.quantity) || 1,
        unitPrice: Number(item.unitPrice) || 0,
        amount: Number(item.amount) || (Number(item.quantity) * Number(item.unitPrice))
      })));
    } else if (tx.total) {
      const sub = tx.subtotal || tx.total;
      setLines([
        {
          id: '1',
          no: 1,
          description: tx.memo || 'Services and operations',
          quantity: 1,
          unitPrice: sub,
          amount: sub
        }
      ]);
    }

    setLastSyncTime(new Date().toLocaleTimeString());
  };

  // Compute live amounts
  const subtotalUSD = lines.reduce((sum, line) => sum + (Number(line.quantity || 0) * Number(line.unitPrice || 0)), 0);
  const vatAmountUSD = subtotalUSD * (vatRatePercent / 100);
  const grandTotalUSD = subtotalUSD + vatAmountUSD;
  const grandTotalKHR = Math.round(grandTotalUSD * exchangeRate);

  // Synchronize edits directly to original transaction
  const performSyncToOriginal = () => {
    if (!selectedTxId) return;

    const formattedItems = lines.map((line, idx) => ({
      id: line.id || `item-${idx}`,
      accountId: '4000',
      accountNumber: '4000',
      accountName: 'Sales Revenue',
      description: line.description,
      quantity: Number(line.quantity) || 1,
      unitPrice: Number(line.unitPrice) || 0,
      amount: Number(line.amount) || 0,
      taxRate: vatRatePercent / 100,
      taxAmount: (Number(line.amount) || 0) * (vatRatePercent / 100)
    }));

    updateTransaction(selectedTxId, {
      transactionNumber: invoiceNumber,
      date: invoiceDate,
      entityName: customerNameEn,
      memo: customerNameKh ? `${customerNameKh} (${customerNameEn})` : customerNameEn,
      items: formattedItems,
      subtotal: subtotalUSD,
      taxTotal: vatAmountUSD,
      total: grandTotalUSD,
      exchangeRate: exchangeRate,
    });

    const now = new Date().toLocaleTimeString();
    setLastSyncTime(now);
    setSaveSuccessMsg(`Changes synchronized to original transaction #${invoiceNumber} & General Ledger (${now})`);
    setTimeout(() => setSaveSuccessMsg(null), 3500);
  };

  // Revert back to original record
  const handleRevertToOriginal = () => {
    if (selectedOriginalTx) {
      loadFromTransaction(selectedOriginalTx);
      setSaveSuccessMsg(`Reverted back to original record #${selectedOriginalTx.transactionNumber}`);
      setTimeout(() => setSaveSuccessMsg(null), 3000);
    }
  };

  // Auto-sync debounced trigger when autoSyncToOriginal is enabled
  useEffect(() => {
    if (!autoSyncToOriginal || !selectedTxId) return;

    const timer = setTimeout(() => {
      const formattedItems = lines.map((line, idx) => ({
        id: line.id || `item-${idx}`,
        accountId: '4000',
        accountNumber: '4000',
        accountName: 'Sales Revenue',
        description: line.description,
        quantity: Number(line.quantity) || 1,
        unitPrice: Number(line.unitPrice) || 0,
        amount: Number(line.amount) || 0,
        taxRate: vatRatePercent / 100,
        taxAmount: (Number(line.amount) || 0) * (vatRatePercent / 100)
      }));

      updateTransaction(selectedTxId, {
        transactionNumber: invoiceNumber,
        date: invoiceDate,
        entityName: customerNameEn,
        memo: customerNameKh ? `${customerNameKh} (${customerNameEn})` : customerNameEn,
        items: formattedItems,
        subtotal: subtotalUSD,
        taxTotal: vatAmountUSD,
        total: grandTotalUSD,
        exchangeRate: exchangeRate,
      });

      setLastSyncTime(new Date().toLocaleTimeString());
    }, 600);

    return () => clearTimeout(timer);
  }, [
    autoSyncToOriginal, 
    selectedTxId, 
    lines, 
    invoiceNumber, 
    invoiceDate, 
    customerNameEn, 
    customerNameKh, 
    subtotalUSD, 
    vatAmountUSD, 
    grandTotalUSD, 
    exchangeRate
  ]);

  // Line Item Handlers
  const handleLineChange = (index: number, field: keyof InvoiceLine, value: any) => {
    setLines(prev => {
      const next = [...prev];
      const line = { ...next[index], [field]: value };
      if (field === 'quantity' || field === 'unitPrice') {
        const qty = field === 'quantity' ? Number(value) : Number(line.quantity);
        const price = field === 'unitPrice' ? Number(value) : Number(line.unitPrice);
        line.amount = qty * price;
      }
      next[index] = line;
      return next;
    });
  };

  const handleAddLine = () => {
    setLines(prev => [
      ...prev,
      {
        id: `line-${Date.now()}`,
        no: prev.length + 1,
        description: '',
        quantity: 1,
        unitPrice: 0,
        amount: 0
      }
    ]);
  };

  const handleRemoveLine = (index: number) => {
    if (lines.length <= 1) return;
    setLines(prev => {
      const filtered = prev.filter((_, i) => i !== index);
      return filtered.map((l, idx) => ({ ...l, no: idx + 1 }));
    });
  };

  // Helper to render VAT TIN digit boxes
  const renderVatTinBoxes = (tin: string) => {
    const clean = (tin || '').replace(/[^a-zA-Z0-9]/g, '');
    const prefix = clean.slice(0, 3).padEnd(3, ' ').split('');
    const suffix = clean.slice(3, 12).padEnd(9, ' ').split('');

    return (
      <div className="inline-flex items-center gap-1 font-mono text-[13px] font-bold text-gray-900">
        <div className="flex border border-gray-900 rounded-2xs overflow-hidden">
          {prefix.map((char, i) => (
            <span key={`pre-${i}`} className="w-5 h-5 flex items-center justify-center border-r last:border-r-0 border-gray-900 bg-white">
              {char !== ' ' ? char : ''}
            </span>
          ))}
        </div>
        <span className="font-bold text-gray-900">-</span>
        <div className="flex border border-gray-900 rounded-2xs overflow-hidden">
          {suffix.map((char, i) => (
            <span key={`suf-${i}`} className="w-5 h-5 flex items-center justify-center border-r last:border-r-0 border-gray-900 bg-white">
              {char !== ' ' ? char : ''}
            </span>
          ))}
        </div>
      </div>
    );
  };

  // Helper to render Date boxes
  const renderDateBoxes = (dateStr: string) => {
    // dateStr in YYYY-MM-DD
    const parts = dateStr.split('-');
    const year = parts[0] || '2026';
    const month = parts[1] || '08';
    const day = parts[2] || '24';
    const digits = `${day}${month}${year}`.split('');

    return (
      <div className="inline-flex items-center gap-1 font-mono text-[13px] font-bold text-gray-900">
        <div className="flex border border-gray-900 rounded-2xs overflow-hidden">
          {digits.map((d, i) => (
            <span key={`date-${i}`} className="w-5 h-5 flex items-center justify-center border-r last:border-r-0 border-gray-900 bg-white">
              {d}
            </span>
          ))}
        </div>
      </div>
    );
  };

  // Save to System
  const handleSaveToSystem = () => {
    const formattedItems = lines.map((line, idx) => ({
      id: line.id || `item-${idx}`,
      accountId: '4000',
      accountNumber: '4000',
      accountName: 'Sales Revenue',
      description: line.description,
      quantity: Number(line.quantity) || 1,
      unitPrice: Number(line.unitPrice) || 0,
      amount: Number(line.amount) || 0,
      taxRate: vatRatePercent / 100,
      taxAmount: (Number(line.amount) || 0) * (vatRatePercent / 100)
    }));

    if (selectedTxId) {
      updateTransaction(selectedTxId, {
        transactionNumber: invoiceNumber,
        date: invoiceDate,
        entityName: customerNameEn,
        memo: customerNameKh ? `${customerNameKh} (${customerNameEn})` : customerNameEn,
        items: formattedItems,
        subtotal: subtotalUSD,
        taxTotal: vatAmountUSD,
        total: grandTotalUSD,
        exchangeRate: exchangeRate,
      });
      setSaveSuccessMsg(`Updated transaction #${invoiceNumber} in General Ledger!`);
    } else {
      addTransaction({
        transactionNumber: invoiceNumber,
        type: 'Invoice',
        date: invoiceDate,
        postingPeriod: 'August 2026',
        entityId: 'CUST-GEN',
        entityName: customerNameEn,
        entityType: 'Customer',
        status: 'Approved',
        currency: 'USD',
        exchangeRate: exchangeRate,
        subtotal: subtotalUSD,
        taxTotal: vatAmountUSD,
        total: grandTotalUSD,
        amountPaid: 0,
        balanceDue: grandTotalUSD,
        memo: customerNameKh ? `${customerNameKh} - ${lines[0]?.description || 'Invoice'}` : (lines[0]?.description || 'Invoice'),
        items: formattedItems,
        department: 'Operations',
        subsidiary: 'Global Operations'
      });
      setSaveSuccessMsg(`Saved new invoice #${invoiceNumber} to Accounting Records!`);
    }

    setTimeout(() => setSaveSuccessMsg(null), 4000);
  };

  // Generate Standalone HTML File for Download
  const handleDownloadHtmlFile = () => {
    const htmlContent = `<!DOCTYPE html>
<html lang="km">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${docTypeTitle} - ${invoiceNumber}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Battambang:wght@400;700&family=Kantumruy+Pro:ital,wght@0,400;0,600;0,700;1,400&family=Inter:wght@400;600;700&display=swap');
    
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Kantumruy Pro', 'Battambang', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      color: #111827;
      background: #f3f4f6;
      padding: 24px;
      font-size: 12px;
      line-height: 1.4;
    }
    .invoice-container {
      max-width: 800px;
      margin: 0 auto;
      background: #ffffff;
      padding: 32px 36px;
      border: 1px solid #d1d5db;
      box-shadow: 0 4px 12px rgba(0,0,0,0.08);
      position: relative;
    }
    .watermark {
      position: absolute;
      top: 16px;
      right: 20px;
      font-size: 11px;
      font-weight: bold;
      color: #4b5563;
      border: 1px dashed #9ca3af;
      padding: 2px 8px;
      border-radius: 4px;
    }
    .header-grid {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 8px;
    }
    .logo-box {
      width: 140px;
      height: 60px;
      border: 1px dashed #9ca3af;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 11px;
      color: #6b7280;
      background: #f9fafb;
    }
    .logo-img {
      max-width: 140px;
      max-height: 60px;
      object-fit: contain;
    }
    .company-title {
      text-align: center;
      flex: 1;
    }
    .company-name-kh {
      font-size: 16px;
      font-weight: 700;
      color: #111827;
      margin-bottom: 2px;
    }
    .company-name-en {
      font-size: 13px;
      font-weight: 700;
      letter-spacing: 0.5px;
    }
    .tin-row {
      display: flex;
      align-items: center;
      gap: 6px;
      margin-top: 6px;
      font-size: 11px;
    }
    .box-group {
      display: inline-flex;
      border: 1px solid #111827;
    }
    .tin-box {
      width: 18px;
      height: 18px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border-right: 1px solid #111827;
      font-family: monospace;
      font-weight: bold;
      font-size: 11px;
    }
    .tin-box:last-child { border-right: none; }
    .address-section {
      font-size: 11px;
      color: #374151;
      margin-top: 6px;
      line-height: 1.5;
    }
    .divider {
      border-bottom: 2px solid #111827;
      margin: 12px 0 16px 0;
    }
    .doc-title {
      text-align: center;
      margin-bottom: 16px;
    }
    .doc-title h1 {
      font-size: 18px;
      font-weight: 700;
    }
    .doc-title h2 {
      font-size: 14px;
      font-weight: 700;
      color: #374151;
    }
    .meta-grid {
      display: flex;
      justify-content: space-between;
      margin-bottom: 16px;
      gap: 16px;
    }
    .customer-info {
      flex: 1;
      font-size: 11px;
      line-height: 1.6;
    }
    .dotted-line {
      border-bottom: 1px dotted #6b7280;
      display: inline-block;
      min-width: 160px;
      font-weight: 600;
      color: #111827;
    }
    .invoice-meta {
      text-align: right;
      font-size: 11px;
      line-height: 1.8;
    }
    table.items-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 0px;
    }
    table.items-table th, table.items-table td {
      border: 1px solid #111827;
      padding: 6px 8px;
    }
    table.items-table th {
      background: #f3f4f6;
      font-weight: 700;
      text-align: center;
      font-size: 11px;
    }
    .totals-wrapper {
      display: flex;
      justify-content: space-between;
      border: 1px solid #111827;
      border-top: none;
    }
    .exchange-rate-box {
      padding: 10px 14px;
      font-size: 11px;
      display: flex;
      align-items: center;
    }
    .totals-table {
      width: 320px;
      border-collapse: collapse;
      border-left: 1px solid #111827;
    }
    .totals-table td {
      padding: 5px 8px;
      border-bottom: 1px solid #111827;
      font-size: 11px;
    }
    .totals-table tr:last-child td {
      border-bottom: none;
    }
    .signatures-grid {
      display: flex;
      justify-content: space-between;
      margin-top: 48px;
      text-align: center;
    }
    .sig-col {
      width: 220px;
    }
    .sig-line {
      border-bottom: 1px dotted #111827;
      margin-bottom: 8px;
      height: 40px;
    }
    .footer-note {
      margin-top: 24px;
      font-size: 10px;
      color: #374151;
      border-top: 1px solid #e5e7eb;
      padding-top: 8px;
    }
    @media print {
      body { background: #ffffff; padding: 0; }
      .invoice-container { box-shadow: none; border: none; padding: 12px; }
      .no-print { display: none !important; }
    }
  </style>
</head>
<body>
  <div class="invoice-container">
    <div class="watermark">${copyType === 'Original' ? 'ច្បាប់ដើម (Original)' : 'ច្បាប់ចម្លង (Copy)'}</div>

    <!-- Header -->
    <div class="header-grid">
      <div class="logo-box">
        ${logoUrl ? `<img src="${logoUrl}" class="logo-img" alt="Logo" />` : `<span>Company's logo</span>`}
      </div>
      <div class="company-title">
        <div class="company-name-kh">${companyNameKh}</div>
        <div class="company-name-en">${companyNameEn}</div>
      </div>
    </div>

    <!-- VAT TIN -->
    <div class="tin-row" style="justify-content: center;">
      <span>លេខអត្តសញ្ញាណកម្ម អតប (VAT TIN) :</span>
      <span style="font-weight: bold; font-family: monospace;">${sellerVatTin}</span>
    </div>

    <!-- Address -->
    <div class="address-section" style="text-align: center;">
      <div>អាសយដ្ឋាន៖ ផ្ទះលេខ ${houseNo} ផ្លូវលេខ ៖ ${streetNo} ឃុំ / សង្កាត់ ៖ ${commune}</div>
      <div>ក្រុង / ស្រុក / ខណ្ឌ ៖ ${khan} ខេត្ត / រាជធានី ៖ ${city} ទូរស័ព្ទ ៖ ${telephone}</div>
      <div style="font-size: 10px; color: #6b7280;">Town / District / Khan: ${khan} Province / City: ${city} Telephone: ${telephone}</div>
    </div>

    <div class="divider"></div>

    <!-- Title -->
    <div class="doc-title">
      <h1>${docTypeTitle === 'Tax Invoice' ? 'វិក្កយបត្រពន្ធ' : 'វិក្កយបត្រ'}</h1>
      <h2>${docTypeTitle === 'Tax Invoice' ? 'Tax Invoice' : 'Invoice'}</h2>
    </div>

    <!-- Meta & Customer -->
    <div class="meta-grid">
      <div class="customer-info">
        <div style="font-weight: bold; margin-bottom: 2px;">អតិថិជន / Customer:</div>
        <div>ឈ្មោះក្រុមហ៊ុន ឬអតិថិជន ៖ <span class="dotted-line">${customerNameKh} / ${customerNameEn}</span></div>
        <div>អាសយដ្ឋាន ៖ <span class="dotted-line">${customerAddress}</span></div>
        <div>ទូរស័ព្ទលេខ ៖ <span class="dotted-line">${customerPhone}</span></div>
        <div style="margin-top: 4px;">លេខអត្តសញ្ញាណកម្ម អតប (VAT TIN) ៖ <strong style="font-family: monospace;">${customerVatTin}</strong></div>
      </div>

      <div class="invoice-meta">
        <div>លេខរៀងវិក្កយបត្រ / Invoice Nº: <strong>${invoiceNumber}</strong></div>
        <div>កាលបរិច្ឆេទ / Date: <strong>${invoiceDate}</strong></div>
      </div>
    </div>

    <!-- Items Table -->
    <table class="items-table">
      <thead>
        <tr>
          <th style="width: 40px;">ល.រ<br><span style="font-weight: normal;">No</span></th>
          <th>បរិយាយមុខទំនិញ<br><span style="font-weight: normal;">Description</span></th>
          <th style="width: 70px;">បរិមាណ<br><span style="font-weight: normal;">Quantity</span></th>
          <th style="width: 100px;">ថ្លៃឯកតា<br><span style="font-weight: normal;">Unit Price</span></th>
          <th style="width: 110px;">ថ្លៃទំនិញ<br><span style="font-weight: normal;">Amount</span></th>
        </tr>
      </thead>
      <tbody>
        ${lines.map(line => `
          <tr>
            <td style="text-align: center;">${line.no}</td>
            <td>${line.description}</td>
            <td style="text-align: center;">${line.quantity}</td>
            <td style="text-align: right; font-family: monospace;">$ ${Number(line.unitPrice).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
            <td style="text-align: right; font-family: monospace; font-weight: bold;">$ ${Number(line.amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>

    <!-- Totals Table -->
    <div class="totals-wrapper">
      <div class="exchange-rate-box">
        <div>
          <div><strong>អត្រាប្តូរប្រាក់ ៖</strong> ${exchangeRate} KHR / USD</div>
          <div style="font-size: 10px; color: #6b7280;">Exchange Rate: ${exchangeRate}</div>
        </div>
      </div>
      <table class="totals-table">
        <tr>
          <td><strong>សរុប</strong> / Sub Total :</td>
          <td style="text-align: right; font-family: monospace;">$ ${subtotalUSD.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
        </tr>
        <tr>
          <td><strong>អាករលើតម្លៃបន្ថែម (${vatRatePercent}%)</strong> / VAT ${vatRatePercent}% :</td>
          <td style="text-align: right; font-family: monospace;">$ ${vatAmountUSD.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
        </tr>
        <tr style="background: #f9fafb;">
          <td><strong>សរុបរួម</strong> / Grand Total :</td>
          <td style="text-align: right; font-family: monospace; font-weight: bold; font-size: 12px;">$ ${grandTotalUSD.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
        </tr>
        <tr style="background: #f3f4f6;">
          <td><strong>សរុបរួមជារៀល</strong> / Total (KHR) :</td>
          <td style="text-align: right; font-family: monospace; font-weight: bold; color: #047857;">${grandTotalKHR.toLocaleString('en-US')} ៛</td>
        </tr>
      </table>
    </div>

    <!-- Signatures -->
    <div class="signatures-grid">
      <div class="sig-col">
        <div class="sig-line"></div>
        <div style="font-weight: bold;">ហត្ថលេខានិងឈ្មោះអ្នកទិញ</div>
        <div style="font-size: 10px; color: #4b5563;">Customer's Signature & Name</div>
      </div>
      <div class="sig-col">
        <div class="sig-line"></div>
        <div style="font-weight: bold;">ហត្ថលេខានិងឈ្មោះអ្នកលក់</div>
        <div style="font-size: 10px; color: #4b5563;">Seller's Signature & Name</div>
      </div>
    </div>

    <!-- Footer Note -->
    <div class="footer-note">
      <div><strong>សម្គាល់ ៖</strong> ច្បាប់ដើមសម្រាប់អ្នកទិញ ច្បាប់ចម្លងសម្រាប់អ្នកលក់</div>
      <div><strong>Note:</strong> Original Invoice for customer , Copied Invoice for seller</div>
    </div>
  </div>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Invoice-${invoiceNumber}-${copyType}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Export as JSON File
  const handleDownloadJsonFile = () => {
    const payload = {
      invoiceNumber,
      invoiceDate,
      docTypeTitle,
      copyType,
      seller: {
        nameKh: companyNameKh,
        nameEn: companyNameEn,
        vatTin: sellerVatTin,
        houseNo,
        streetNo,
        commune,
        khan,
        city,
        telephone
      },
      customer: {
        nameKh: customerNameKh,
        nameEn: customerNameEn,
        address: customerAddress,
        phone: customerPhone,
        vatTin: customerVatTin
      },
      exchangeRate,
      vatRatePercent,
      items: lines,
      summary: {
        subtotalUSD,
        vatAmountUSD,
        grandTotalUSD,
        grandTotalKHR
      },
      exportedAt: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Invoice-${invoiceNumber}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-gray-100 min-h-full p-4 sm:p-6 text-gray-900 font-sans space-y-6">
      {/* Top Action Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-200 flex items-center justify-center text-[#d65200]">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-gray-900 text-base">ទម្រង់វិក្កយបត្រស្តង់ដារ (Official Cambodian Standard Invoice Form)</h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                GDT / Tax Form Ready
              </span>
            </div>
            <p className="text-xs text-gray-500">
              Bilingual Khmer & English format with VAT TIN digit grids, 10% VAT, dual currency ($ USD & ៛ KHR), and full file export.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Toggle Edit vs View Mode */}
          <button
            type="button"
            onClick={() => setIsEditMode(!isEditMode)}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-2xs ${
              isEditMode 
                ? 'bg-amber-600 hover:bg-amber-700 text-white' 
                : 'bg-white hover:bg-gray-100 text-gray-800 border border-gray-300'
            }`}
          >
            {isEditMode ? <Eye className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
            <span>{isEditMode ? 'Preview Document' : 'Edit Invoice Data'}</span>
          </button>

          {/* Download Standalone HTML File */}
          <button
            type="button"
            onClick={handleDownloadHtmlFile}
            className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-2xs"
            title="Download complete standalone offline invoice HTML file"
          >
            <FileCode className="w-4 h-4" />
            <span>Download as HTML File</span>
          </button>

          {/* Download JSON Data File */}
          <button
            type="button"
            onClick={handleDownloadJsonFile}
            className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-2xs"
            title="Download JSON structured data file"
          >
            <Download className="w-4 h-4" />
            <span>Export JSON</span>
          </button>

          {/* Print / PDF */}
          <button
            type="button"
            onClick={() => window.print()}
            className="px-3 py-2 bg-gray-800 hover:bg-gray-900 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-2xs"
          >
            <Printer className="w-4 h-4" />
            <span>Print / PDF</span>
          </button>

          {/* Save to System */}
          <button
            type="button"
            onClick={handleSaveToSystem}
            className="px-4 py-2 bg-[#d65200] hover:bg-[#b84300] text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-2xs"
          >
            <Save className="w-4 h-4" />
            <span>Save to Ledger</span>
          </button>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-semibold"
            >
              Close
            </button>
          )}
        </div>
      </div>

      {/* Success Banner */}
      {saveSuccessMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-2.5 rounded-xl text-xs flex items-center justify-between animate-in fade-in">
          <span className="flex items-center gap-2 font-semibold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            {saveSuccessMsg}
          </span>
          <button onClick={() => setSaveSuccessMsg(null)} className="text-emerald-600 hover:text-emerald-800">
            &times;
          </button>
        </div>
      )}

      {/* Quick Select from Existing Records */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-gray-500" />
          <span className="font-bold text-gray-700">Load Existing Invoice from System:</span>
        </div>
        <div className="flex-1 max-w-md">
          <select
            value={selectedTxId}
            onChange={(e) => {
              const id = e.target.value;
              setSelectedTxId(id);
              const tx = transactions.find(t => t.id === id);
              if (tx) loadFromTransaction(tx);
            }}
            className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-xs font-mono bg-gray-50 focus:bg-white"
          >
            <option value="">-- Choose an invoice or bill to populate --</option>
            {transactions
              .filter(t => t.type === 'Invoice' || t.type === 'Bill')
              .map(t => (
                <option key={t.id} value={t.id}>
                  {t.transactionNumber} - {t.entityName} - {formatCurrency(t.total, t.currency)} ({t.date})
                </option>
              ))}
          </select>
        </div>

        {/* Copy Type & Doc Type Selector */}
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border border-gray-300 overflow-hidden text-xs">
            <button
              type="button"
              onClick={() => setCopyType('Original')}
              className={`px-2.5 py-1 font-semibold ${copyType === 'Original' ? 'bg-blue-600 text-white' : 'bg-gray-50 text-gray-700'}`}
            >
              ច្បាប់ដើម (Original)
            </button>
            <button
              type="button"
              onClick={() => setCopyType('Copied')}
              className={`px-2.5 py-1 font-semibold ${copyType === 'Copied' ? 'bg-blue-600 text-white' : 'bg-gray-50 text-gray-700'}`}
            >
              ច្បាប់ចម្លង (Copy)
            </button>
          </div>

          <div className="flex rounded-lg border border-gray-300 overflow-hidden text-xs">
            <button
              type="button"
              onClick={() => setDocTypeTitle('Invoice')}
              className={`px-2.5 py-1 font-semibold ${docTypeTitle === 'Invoice' ? 'bg-[#d65200] text-white' : 'bg-gray-50 text-gray-700'}`}
            >
              Invoice
            </button>
            <button
              type="button"
              onClick={() => setDocTypeTitle('Tax Invoice')}
              className={`px-2.5 py-1 font-semibold ${docTypeTitle === 'Tax Invoice' ? 'bg-[#d65200] text-white' : 'bg-gray-50 text-gray-700'}`}
            >
              Tax Invoice
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Editing Drawer on Left (if edit mode) + Document Canvas on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* INTERACTIVE CONTROLS FORM (SHOWN IN EDIT MODE) */}
        {isEditMode && (
          <div className="lg:col-span-4 bg-white p-5 rounded-2xl border border-orange-200/90 shadow-sm space-y-5 text-xs">
            {/* Header & Sync Status */}
            <div className="border-b border-gray-200 pb-3 space-y-2.5">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-gray-900 text-sm flex items-center gap-1.5">
                  <div className="w-6 h-6 rounded-lg bg-orange-100 text-[#d65200] flex items-center justify-center">
                    <Edit3 className="w-3.5 h-3.5" />
                  </div>
                  <span>Adjust & Edit Invoice</span>
                </h3>
                {selectedOriginalTx ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span>Synced to #{selectedOriginalTx.transactionNumber}</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                    <Sparkles className="w-3 h-3 text-amber-500" />
                    <span>New / Standalone</span>
                  </span>
                )}
              </div>

              {/* Sync Configuration Box */}
              <div className="p-3 bg-orange-50/70 border border-orange-200 rounded-xl space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={autoSyncToOriginal}
                      onChange={(e) => setAutoSyncToOriginal(e.target.checked)}
                      className="w-4 h-4 text-[#d65200] rounded focus:ring-[#d65200]"
                    />
                    <span className="font-bold text-gray-800 text-[11px]">
                      Auto-sync edits to original record
                    </span>
                  </label>
                  {lastSyncTime && (
                    <span className="text-[10px] text-emerald-800 bg-emerald-100/80 px-1.5 py-0.5 rounded font-mono font-medium">
                      Synced {lastSyncTime}
                    </span>
                  )}
                </div>

                {/* Quick adjustments bar */}
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold text-gray-600">Quick Adjust VAT:</span>
                  {[0, 10, 7].map((rate) => (
                    <button
                      key={rate}
                      type="button"
                      onClick={() => setVatRatePercent(rate)}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold border transition ${
                        vatRatePercent === rate
                          ? 'bg-[#d65200] text-white border-[#d65200]'
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {rate}%
                    </button>
                  ))}
                  <span className="text-gray-300 mx-0.5">|</span>
                  <span className="text-[10px] font-bold text-gray-600">Rate:</span>
                  {[4000, 4015, 4100].map((rate) => (
                    <button
                      key={rate}
                      type="button"
                      onClick={() => setExchangeRate(rate)}
                      className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold border transition ${
                        exchangeRate === rate
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {rate}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2 pt-1 border-t border-orange-200/60">
                  {selectedOriginalTx ? (
                    <>
                      <button
                        type="button"
                        onClick={performSyncToOriginal}
                        className="flex-1 px-2.5 py-1.5 bg-[#d65200] hover:bg-[#b84300] text-white rounded-lg font-bold text-[11px] flex items-center justify-center gap-1 shadow-2xs transition"
                      >
                        <Zap className="w-3 h-3" />
                        <span>Sync Now</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleRevertToOriginal}
                        className="px-2.5 py-1.5 bg-white hover:bg-gray-100 text-gray-700 border border-gray-300 rounded-lg font-semibold text-[11px] flex items-center gap-1 transition"
                        title="Revert modifications to original transaction values"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Revert</span>
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSaveToSystem}
                      className="w-full px-2.5 py-1.5 bg-[#d65200] hover:bg-[#b84300] text-white rounded-lg font-bold text-[11px] flex items-center justify-center gap-1 shadow-2xs transition"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Post as New Original Invoice in ERP</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Company / Seller Info */}
            <div className="space-y-2.5">
              <span className="font-bold text-gray-800 uppercase tracking-wider text-[10px] block">
                1. Seller / Company Info
              </span>
              <div>
                <label className="block text-gray-600 mb-0.5">Company Name (Khmer)</label>
                <input
                  type="text"
                  value={companyNameKh}
                  onChange={(e) => setCompanyNameKh(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-[#d65200]/20 focus:border-[#d65200]"
                />
              </div>
              <div>
                <label className="block text-gray-600 mb-0.5">Company Name (English)</label>
                <input
                  type="text"
                  value={companyNameEn}
                  onChange={(e) => setCompanyNameEn(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-[#d65200]/20 focus:border-[#d65200]"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-gray-600 mb-0.5">VAT TIN</label>
                  <input
                    type="text"
                    value={sellerVatTin}
                    onChange={(e) => setSellerVatTin(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg text-xs font-mono font-bold focus:ring-2 focus:ring-[#d65200]/20 focus:border-[#d65200]"
                  />
                </div>
                <div>
                  <label className="block text-gray-600 mb-0.5">Telephone</label>
                  <input
                    type="text"
                    value={telephone}
                    onChange={(e) => setTelephone(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-[#d65200]/20 focus:border-[#d65200]"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-gray-600 mb-0.5">House No & Street</label>
                  <input
                    type="text"
                    value={`${houseNo}, ${streetNo}`}
                    onChange={(e) => {
                      const val = e.target.value;
                      setHouseNo(val.split(',')[0] || val);
                      if (val.includes(',')) setStreetNo(val.split(',')[1] || '');
                    }}
                    className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-[#d65200]/20 focus:border-[#d65200]"
                  />
                </div>
                <div>
                  <label className="block text-gray-600 mb-0.5">Khan & City</label>
                  <input
                    type="text"
                    value={`${khan}, ${city}`}
                    onChange={(e) => {
                      const val = e.target.value;
                      setKhan(val.split(',')[0] || val);
                      if (val.includes(',')) setCity(val.split(',')[1] || '');
                    }}
                    className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-[#d65200]/20 focus:border-[#d65200]"
                  />
                </div>
              </div>
            </div>

            {/* Customer Information */}
            <div className="space-y-2.5 pt-3 border-t border-gray-200">
              <span className="font-bold text-gray-800 uppercase tracking-wider text-[10px] block">
                2. Customer Information
              </span>
              <div>
                <label className="block text-gray-600 mb-0.5">Customer Name (Khmer)</label>
                <input
                  type="text"
                  value={customerNameKh}
                  onChange={(e) => setCustomerNameKh(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-[#d65200]/20 focus:border-[#d65200]"
                />
              </div>
              <div>
                <label className="block text-gray-600 mb-0.5">Customer Name (English)</label>
                <input
                  type="text"
                  value={customerNameEn}
                  onChange={(e) => setCustomerNameEn(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-[#d65200]/20 focus:border-[#d65200]"
                />
              </div>
              <div>
                <label className="block text-gray-600 mb-0.5">Customer Address</label>
                <input
                  type="text"
                  value={customerAddress}
                  onChange={(e) => setCustomerAddress(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-[#d65200]/20 focus:border-[#d65200]"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-gray-600 mb-0.5">Customer VAT TIN</label>
                  <input
                    type="text"
                    value={customerVatTin}
                    onChange={(e) => setCustomerVatTin(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg text-xs font-mono font-bold focus:ring-2 focus:ring-[#d65200]/20 focus:border-[#d65200]"
                  />
                </div>
                <div>
                  <label className="block text-gray-600 mb-0.5">Customer Phone</label>
                  <input
                    type="text"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-[#d65200]/20 focus:border-[#d65200]"
                  />
                </div>
              </div>
            </div>

            {/* Exchange Rate & Tax Settings */}
            <div className="space-y-2.5 pt-3 border-t border-gray-200">
              <span className="font-bold text-gray-800 uppercase tracking-wider text-[10px] block">
                3. Tax & Exchange Rate
              </span>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-gray-600 mb-0.5">Exchange Rate (KHR/USD)</label>
                  <input
                    type="number"
                    value={exchangeRate}
                    onChange={(e) => setExchangeRate(Number(e.target.value) || 4015)}
                    className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg text-xs font-mono font-bold focus:ring-2 focus:ring-[#d65200]/20 focus:border-[#d65200]"
                  />
                </div>
                <div>
                  <label className="block text-gray-600 mb-0.5">VAT Rate (%)</label>
                  <input
                    type="number"
                    value={vatRatePercent}
                    onChange={(e) => setVatRatePercent(Number(e.target.value) || 0)}
                    className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg text-xs font-mono font-bold focus:ring-2 focus:ring-[#d65200]/20 focus:border-[#d65200]"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-gray-600 mb-0.5">Invoice #</label>
                  <input
                    type="text"
                    value={invoiceNumber}
                    onChange={(e) => setInvoiceNumber(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg text-xs font-mono font-bold focus:ring-2 focus:ring-[#d65200]/20 focus:border-[#d65200]"
                  />
                </div>
                <div>
                  <label className="block text-gray-600 mb-0.5">Date</label>
                  <input
                    type="date"
                    value={invoiceDate}
                    onChange={(e) => setInvoiceDate(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-[#d65200]/20 focus:border-[#d65200]"
                  />
                </div>
              </div>
            </div>

            {/* Edit Line Items */}
            <div className="space-y-2 pt-3 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <span className="font-bold text-gray-800 uppercase tracking-wider text-[10px]">
                  4. Line Items ({lines.length})
                </span>
                <button
                  type="button"
                  onClick={handleAddLine}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-[#d65200] hover:underline"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add Line</span>
                </button>
              </div>

              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {lines.map((line, idx) => (
                  <div key={line.id || idx} className="p-2.5 bg-gray-50 rounded-lg border border-gray-200 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-gray-700 text-[11px]">#{line.no}</span>
                      {lines.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveLine(idx)}
                          className="text-gray-400 hover:text-rose-600 p-0.5"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                    <input
                      type="text"
                      placeholder="Item description"
                      value={line.description}
                      onChange={(e) => handleLineChange(idx, 'description', e.target.value)}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:ring-2 focus:ring-[#d65200]/20 focus:border-[#d65200]"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] text-gray-500">Qty</label>
                        <input
                          type="number"
                          step="any"
                          value={line.quantity}
                          onChange={(e) => handleLineChange(idx, 'quantity', e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-xs font-mono text-center focus:ring-2 focus:ring-[#d65200]/20 focus:border-[#d65200]"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-gray-500">Unit Price ($)</label>
                        <input
                          type="number"
                          step="any"
                          value={line.unitPrice}
                          onChange={(e) => handleLineChange(idx, 'unitPrice', e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-xs font-mono text-right font-semibold focus:ring-2 focus:ring-[#d65200]/20 focus:border-[#d65200]"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* DOCUMENT PAPER CANVAS (FAITHFUL REPRODUCTION OF CAMBODIAN INVOICE FORM)   */}
        {/* ========================================================================= */}
        <div className={`${isEditMode ? 'lg:col-span-8' : 'lg:col-span-12'} flex justify-center`}>
          <div className="bg-white w-full max-w-[820px] p-8 sm:p-10 border border-gray-300 shadow-xl rounded-sm text-gray-900 font-sans relative print:shadow-none print:border-none print:p-0">
            
            {/* Watermark / Copy Stamp on top right */}
            <div className="absolute top-4 right-4 print:right-2 text-[11px] font-bold text-gray-600 border border-dashed border-gray-400 px-2 py-0.5 rounded">
              {copyType === 'Original' ? 'ច្បាប់ដើម (Original)' : 'ច្បាប់ចម្លង (Copied Invoice)'}
            </div>

            {/* 1. Header Grid */}
            <div className="flex items-start justify-between gap-4 mb-2">
              {/* Left Logo Box */}
              <div className="w-36 h-16 border border-dashed border-gray-400 bg-gray-50 flex items-center justify-center text-xs text-gray-400 shrink-0">
                {logoUrl ? (
                  <img src={logoUrl} alt="Logo" className="max-w-full max-h-full object-contain" />
                ) : (
                  <span>Company&apos;s logo</span>
                )}
              </div>

              {/* Center Company Title */}
              <div className="flex-1 text-center pr-12">
                <h1 className="text-base sm:text-lg font-bold text-gray-900 tracking-wide font-serif">
                  {companyNameKh}
                </h1>
                <h2 className="text-xs sm:text-sm font-bold text-gray-800 tracking-wider font-mono">
                  {companyNameEn}
                </h2>
              </div>
            </div>

            {/* 2. VAT TIN & Addresses */}
            <div className="text-center space-y-1 my-2">
              <div className="flex items-center justify-center gap-2 text-xs">
                <span className="font-semibold text-gray-800">លេខអត្តសញ្ញាណកម្ម អតប (VAT TIN) :</span>
                {renderVatTinBoxes(sellerVatTin)}
              </div>

              <div className="text-[11px] text-gray-700 leading-relaxed">
                <div>
                  <span className="font-semibold">អាសយដ្ឋាន៖ </span> 
                  ផ្ទះលេខ <span className="font-medium">{houseNo}</span> ផ្លូវលេខ ៖ <span className="font-medium">{streetNo}</span> ឃុំ / សង្កាត់ ៖ <span className="font-medium">{commune}</span>
                </div>
                <div className="text-[10px] text-gray-500 font-mono">
                  Address: Street: Commune / Sangkat:
                </div>
                <div>
                  ក្រុង / ស្រុក / ខណ្ឌ ៖ <span className="font-medium">{khan}</span> ខេត្ត / រាជធានី ៖ <span className="font-medium">{city}</span> ទូរស័ព្ទ ៖ <span className="font-medium">{telephone}</span>
                </div>
                <div className="text-[10px] text-gray-500 font-mono">
                  Town / District / Khan: {khan} Province / City: {city} Telephone: {telephone}
                </div>
              </div>
            </div>

            {/* Solid Divider Line */}
            <div className="border-b-2 border-gray-900 my-3"></div>

            {/* 3. Document Title */}
            <div className="text-center my-3">
              <h2 className="text-lg sm:text-xl font-extrabold text-gray-900 tracking-wide">
                {docTypeTitle === 'Tax Invoice' ? 'វិក្កយបត្រពន្ធ' : 'វិក្កយបត្រ'}
              </h2>
              <h3 className="text-sm font-bold text-gray-700 tracking-wider">
                {docTypeTitle === 'Tax Invoice' ? 'Tax Invoice' : 'Invoice'}
              </h3>
            </div>

            {/* 4. Customer Info & Invoice Meta */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 text-xs mb-3">
              
              {/* Left Customer Info */}
              <div className="sm:col-span-7 space-y-1 text-[11px]">
                <div className="font-bold text-gray-900 text-xs">
                  អតិថិជន/ Customer:
                </div>
                <div>
                  <span>ឈ្មោះក្រុមហ៊ុន ឬអតិថិជន៖ </span>
                  <span className="border-b border-dotted border-gray-800 font-semibold text-gray-900 inline-block min-w-44 px-1">
                    {customerNameKh} / {customerNameEn}
                  </span>
                </div>
                <div className="text-[10px] text-gray-500">Company / Customer Name:</div>

                <div className="pt-0.5">
                  <span>អាសយដ្ឋាន៖ </span>
                  <span className="border-b border-dotted border-gray-800 font-semibold text-gray-900 inline-block min-w-56 px-1">
                    {customerAddress}
                  </span>
                </div>
                <div className="text-[10px] text-gray-500">Address:</div>

                <div className="pt-0.5">
                  <span>ទូរស័ព្ទលេខ៖ </span>
                  <span className="border-b border-dotted border-gray-800 font-semibold text-gray-900 inline-block min-w-40 px-1">
                    {customerPhone}
                  </span>
                </div>
                <div className="text-[10px] text-gray-500">Telephone No.:</div>

                <div className="flex items-center gap-2 pt-1">
                  <span>លេខអត្តសញ្ញាណកម្ម អតប (VAT TIN)៖</span>
                  {renderVatTinBoxes(customerVatTin)}
                </div>
              </div>

              {/* Right Invoice Number & Date */}
              <div className="sm:col-span-5 text-right space-y-2 text-[11px]">
                <div>
                  <div className="flex items-center justify-end gap-1">
                    <span>លេខរៀងវិក្កយបត្រ៖ </span>
                    <span className="font-mono font-bold text-gray-900 border-b border-dotted border-gray-800 px-2">
                      {invoiceNumber}
                    </span>
                  </div>
                  <div className="text-[10px] text-gray-500">Invoice Nº</div>
                </div>

                <div>
                  <div className="flex items-center justify-end gap-1.5">
                    <span>កាលបរិច្ឆេទ៖ </span>
                    {renderDateBoxes(invoiceDate)}
                  </div>
                  <div className="text-[10px] text-gray-500">D a t e :</div>
                </div>
              </div>
            </div>

            {/* 5. Items Table */}
            <div className="border border-gray-900 overflow-hidden">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="border-b border-gray-900 bg-gray-50 text-[11px] font-bold text-gray-900 text-center">
                  <tr>
                    <th className="p-2 border-r border-gray-900 w-12">
                      ល.រ<br />
                      <span className="font-normal text-[10px]">No</span>
                    </th>
                    <th className="p-2 border-r border-gray-900 text-center">
                      បរិយាយមុខទំនិញ<br />
                      <span className="font-normal text-[10px] tracking-wide">D e s c r i p t i o n</span>
                    </th>
                    <th className="p-2 border-r border-gray-900 w-20 text-center">
                      បរិមាណ<br />
                      <span className="font-normal text-[10px] tracking-wide">Q u a n t i t y</span>
                    </th>
                    <th className="p-2 border-r border-gray-900 w-28 text-center">
                      ថ្លៃឯកតា<br />
                      <span className="font-normal text-[10px] tracking-wide">U n i t P r i c e</span>
                    </th>
                    <th className="p-2 w-32 text-center">
                      ថ្លៃទំនិញ<br />
                      <span className="font-normal text-[10px] tracking-wide">A m o u n t</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-900 text-[11px]">
                  {lines.map((line) => (
                    <tr key={line.id} className="min-h-8">
                      <td className="p-2 border-r border-gray-900 text-center font-mono">{line.no}</td>
                      <td className="p-2 border-r border-gray-900 font-medium">{line.description}</td>
                      <td className="p-2 border-r border-gray-900 text-center font-mono">{line.quantity}</td>
                      <td className="p-2 border-r border-gray-900 text-right font-mono">
                        $ {Number(line.unitPrice).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="p-2 text-right font-mono font-bold">
                        $ {Number(line.amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                  {/* Empty filler rows for authentic layout appearance if only 1 item */}
                  {lines.length < 3 && Array.from({ length: 3 - lines.length }).map((_, idx) => (
                    <tr key={`fill-${idx}`} className="h-6 opacity-30">
                      <td className="p-2 border-r border-gray-900"></td>
                      <td className="p-2 border-r border-gray-900"></td>
                      <td className="p-2 border-r border-gray-900"></td>
                      <td className="p-2 border-r border-gray-900"></td>
                      <td className="p-2"></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 6. Summary Totals Box */}
            <div className="border-x border-b border-gray-900 flex justify-between items-stretch">
              {/* Left Exchange Rate box */}
              <div className="p-3 flex items-center text-xs">
                <div>
                  <div className="font-bold text-gray-900 text-xs">
                    អត្រាប្តូរប្រាក់ ៖ <span className="font-mono text-sm">{exchangeRate}</span>
                  </div>
                  <div className="text-[10px] text-gray-500 font-mono">Exchange Rate: {exchangeRate} KHR / USD</div>
                </div>
              </div>

              {/* Right Totals Table */}
              <div className="w-72 border-l border-gray-900 text-xs">
                <div className="flex justify-between p-2 border-b border-gray-900">
                  <div className="text-right flex-1 pr-2">
                    <span className="font-bold">សរុប ៖</span><br />
                    <span className="text-[10px] text-gray-500 font-mono">S u b T o t a l :</span>
                  </div>
                  <div className="font-mono font-semibold text-right min-w-28 flex items-center justify-end">
                    $ {subtotalUSD.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                </div>

                <div className="flex justify-between p-2 border-b border-gray-900">
                  <div className="text-right flex-1 pr-2">
                    <span className="font-bold">អាករលើតម្លៃបន្ថែម ({vatRatePercent}%) ៖</span><br />
                    <span className="text-[10px] text-gray-500 font-mono">V A T {vatRatePercent}%</span>
                  </div>
                  <div className="font-mono font-semibold text-right min-w-28 flex items-center justify-end">
                    $ {vatAmountUSD.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                </div>

                <div className="flex justify-between p-2 border-b border-gray-900 bg-gray-50">
                  <div className="text-right flex-1 pr-2">
                    <span className="font-bold">សរុបរួម ៖</span><br />
                    <span className="text-[10px] text-gray-500 font-mono">G r a n d T o t a l :</span>
                  </div>
                  <div className="font-mono font-bold text-right text-sm min-w-28 flex items-center justify-end">
                    $ {grandTotalUSD.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                </div>

                <div className="flex justify-between p-2 bg-emerald-50/70">
                  <div className="text-right flex-1 pr-2">
                    <span className="font-bold text-emerald-950">សរុបរួមជារៀល ៖</span>
                  </div>
                  <div className="font-mono font-bold text-right text-emerald-900 min-w-28 flex items-center justify-end">
                    {grandTotalKHR.toLocaleString('en-US')} ៛
                  </div>
                </div>
              </div>
            </div>

            {/* 7. Signatures */}
            <div className="grid grid-cols-2 gap-8 mt-12 text-center text-xs">
              <div>
                <div className="border-b border-dotted border-gray-900 h-10 w-48 mx-auto mb-2"></div>
                <div className="font-bold text-gray-900">ហត្ថលេខានិងឈ្មោះអ្នកទិញ</div>
                <div className="text-[10px] text-gray-600 font-mono">Customer&apos;s Signature &amp; Name</div>
              </div>
              <div>
                <div className="border-b border-dotted border-gray-900 h-10 w-48 mx-auto mb-2"></div>
                <div className="font-bold text-gray-900">ហត្ថលេខានិងឈ្មោះអ្នកលក់</div>
                <div className="text-[10px] text-gray-600 font-mono">Seller&apos;s Signature &amp; Name</div>
              </div>
            </div>

            {/* 8. Footer Note */}
            <div className="mt-8 pt-3 border-t border-gray-200 text-[10px] text-gray-700 leading-relaxed">
              <div>
                <strong>សម្គាល់ ៖</strong> ច្បាប់ដើមសម្រាប់អ្នកទិញ ច្បាប់ចម្លងសម្រាប់អ្នកលក់
              </div>
              <div className="text-gray-500 font-mono">
                <strong>Note:</strong> Original Invoice for customer , Copied Invoice for seller
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
