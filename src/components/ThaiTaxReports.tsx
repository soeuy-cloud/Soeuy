import React, { useState } from 'react';
import { 
  Receipt, 
  FileText, 
  Download, 
  Printer, 
  Calendar, 
  CheckCircle, 
  AlertCircle, 
  Filter, 
  Plus, 
  Eye, 
  ExternalLink,
  ShieldCheck,
  Percent
} from 'lucide-react';
import { useAccounting } from '../context/AccountingContext';
import { ThaiWHTEntry } from '../types';
import { TaxControlEditor } from './TaxControlEditor';

export const ThaiTaxReports: React.FC = () => {
  const { 
    subView, 
    setSubView, 
    transactions, 
    whtEntries, 
    taxCodes, 
    formatCurrency, 
    setIsQuickWhtOpen, 
    setPreviewDoc,
    companyProfile
  } = useAccounting();

  const [selectedMonth, setSelectedMonth] = useState('2026-08');
  const [selectedFormType, setSelectedFormType] = useState<'All' | 'PND3' | 'PND53'>('All');

  // Input Tax (Purchases with 7% VAT)
  const inputTaxItems = transactions
    .filter(t => t.type === 'Bill')
    .flatMap(t => 
      t.items.filter(i => i.taxAmount && i.taxAmount > 0).map(i => ({
        docNo: t.transactionNumber,
        taxInvoiceNo: t.taxInvoiceNumber || `TAX-${t.transactionNumber}`,
        date: t.taxInvoiceDate || t.date,
        vendorName: t.entityName,
        taxId: '0105537029881',
        branch: '00000',
        description: i.description,
        baseAmount: i.amount,
        vatAmount: i.taxAmount || 0,
      }))
    );

  // Output Tax (Sales with 7% VAT)
  const outputTaxItems = transactions
    .filter(t => t.type === 'Invoice')
    .flatMap(t => 
      t.items.filter(i => i.taxAmount && i.taxAmount > 0).map(i => ({
        docNo: t.transactionNumber,
        taxInvoiceNo: t.taxInvoiceNumber || `TAX-${t.transactionNumber}`,
        date: t.taxInvoiceDate || t.date,
        customerName: t.entityName,
        taxId: '0105558129381',
        branch: '00000',
        description: i.description,
        baseAmount: i.amount,
        vatAmount: i.taxAmount || 0,
      }))
    );

  const totalInputBase = inputTaxItems.reduce((sum, item) => sum + item.baseAmount, 0);
  const totalInputVAT = inputTaxItems.reduce((sum, item) => sum + item.vatAmount, 0);

  const totalOutputBase = outputTaxItems.reduce((sum, item) => sum + item.baseAmount, 0);
  const totalOutputVAT = outputTaxItems.reduce((sum, item) => sum + item.vatAmount, 0);

  const netVATPayable = totalOutputVAT - totalInputVAT;

  // Filtered WHT
  const filteredWHT = whtEntries.filter(w => {
    if (selectedFormType === 'All') return true;
    return w.formType === selectedFormType;
  });

  const totalWHTBase = filteredWHT.reduce((sum, w) => sum + w.baseAmount, 0);
  const totalWHTAmount = filteredWHT.reduce((sum, w) => sum + w.whtAmount, 0);

  return (
    <div className="space-y-6 pb-12">
      {/* Sub Header & Navigation */}
      <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-orange-100 text-[#d65200] text-[11px] font-bold rounded uppercase">
                Statutory Revenue Standard
              </span>
              <span className="text-xs text-gray-500 font-medium">Compliance Module</span>
            </div>
            <h1 className="text-xl font-bold text-gray-900 mt-1">
              Tax & Statutory Compliance Reports
            </h1>
            <p className="text-xs text-gray-600">
              Generate official Form P.P. 30 (VAT Return), Withholding Tax Returns (PND 3 / PND 53), and Section 50 Bis Certificates.
            </p>
          </div>

          {/* Action Tools */}
          <div className="flex items-center gap-2">
            <input 
              type="month" 
              value={selectedMonth} 
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="px-2.5 py-1.5 text-xs border border-gray-300 rounded shadow-2xs font-mono text-gray-700 bg-white"
            />
            <button
              onClick={() => setIsQuickWhtOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#d65200] hover:bg-[#b84300] text-white rounded text-xs font-bold shadow-xs transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Issue WHT Section 50 Bis</span>
            </button>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-2 border-b border-gray-200 mt-4 pt-2 text-xs font-medium">
          <button
            onClick={() => setSubView('pp30')}
            className={`pb-2 px-3 border-b-2 transition ${
              subView === 'pp30' || subView === 'overview'
                ? 'border-[#d65200] text-[#d65200] font-bold'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Form P.P. 30 (VAT 7%)
          </button>
          <button
            onClick={() => setSubView('wht_returns')}
            className={`pb-2 px-3 border-b-2 transition ${
              subView === 'wht_returns' || subView === 'pnd53' || subView === 'pnd3'
                ? 'border-[#d65200] text-[#d65200] font-bold'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Withholding Tax (PND 3 / PND 53)
          </button>
          <button
            onClick={() => setSubView('50tawi')}
            className={`pb-2 px-3 border-b-2 transition ${
              subView === '50tawi'
                ? 'border-[#d65200] text-[#d65200] font-bold'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Section 50 Bis Certificates Register
          </button>
          <button
            onClick={() => setSubView('tax_invoices')}
            className={`pb-2 px-3 border-b-2 transition ${
              subView === 'tax_invoices' || subView === 'input_tax' || subView === 'output_tax'
                ? 'border-[#d65200] text-[#d65200] font-bold'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Input / Output Tax Registers
          </button>
          <button
            onClick={() => setSubView('tax_control')}
            className={`pb-2 px-3 border-b-2 transition flex items-center gap-1.5 ${
              subView === 'tax_control'
                ? 'border-[#d65200] text-[#d65200] font-bold'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <Percent className="w-3.5 h-3.5" />
            <span>Tax Control & % Rates</span>
          </button>
        </div>
      </div>

      {/* VIEW 0: Tax Control & % Rates */}
      {subView === 'tax_control' && (
        <TaxControlEditor />
      )}

      {/* VIEW 1: Form P.P. 30 */}
      {(subView === 'pp30' || subView === 'overview') && (
        <div className="space-y-6">
          {/* Statutory Header Box */}
          <div className="bg-white border border-gray-300 rounded-lg p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-gray-200 pb-4">
              <div>
                <span className="text-xs font-mono font-bold text-gray-500 uppercase">Form P.P. 30</span>
                <h2 className="text-lg font-bold text-gray-900">
                  Value Added Tax Return (Form P.P. 30)
                </h2>
                <p className="text-xs text-gray-600 mt-0.5">
                  Tax Filing Period: <span className="font-semibold text-gray-800">August 2026</span> • Filing Due Date: <span className="font-semibold text-rose-600">September 15, 2026</span>
                </p>
              </div>
              <div className="mt-3 sm:mt-0 flex items-center gap-2">
                <button 
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded text-xs font-semibold"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Form P.P. 30</span>
                </button>
                <button 
                  onClick={() => alert("Form P.P. 30 export format (e-Filing text format) generated successfully.")}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-semibold"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>e-Filing RDPrep Export</span>
                </button>
              </div>
            </div>

            {/* Payer Identification */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4 text-xs border-b border-gray-200 bg-gray-50/50 p-3 rounded mt-4">
              <div>
                <div className="font-bold text-gray-800">Taxpayer Name:</div>
                <div className="text-gray-900 font-semibold">{companyProfile.name}</div>
                <div className="text-gray-600 mt-1">{companyProfile.address}</div>
              </div>
              <div className="md:text-right">
                <div><span className="font-bold text-gray-700">Tax ID: </span><span className="font-mono font-bold text-gray-900">{companyProfile.taxId}</span></div>
                <div><span className="font-bold text-gray-700">Branch: </span><span className="font-mono font-bold text-gray-900">{companyProfile.branchNumber || '00000 (Head Office)'}</span></div>
                <div><span className="font-bold text-gray-700">VAT Registration: </span><span className="text-emerald-700 font-semibold">P.P. 20 Approved</span></div>
              </div>
            </div>

            {/* Section Breakdown Grid */}
            <div className="mt-6 space-y-4 text-xs">
              
              {/* Output Tax (Sales) */}
              <div className="border border-gray-200 rounded overflow-hidden">
                <div className="bg-orange-50/80 px-4 py-2 font-bold text-gray-800 flex justify-between">
                  <span>1. Sales and Output Tax</span>
                  <span>Rate 7%</span>
                </div>
                <div className="p-3 divide-y divide-gray-100">
                  <div className="py-1.5 flex justify-between">
                    <span className="text-gray-600">Item 1: Total Sales Volume subject to VAT</span>
                    <span className="font-mono font-semibold">{formatCurrency(totalOutputBase)}</span>
                  </div>
                  <div className="py-1.5 flex justify-between">
                    <span className="text-gray-600">Item 2: Sales subject to 0% Tax (Zero-rated International Inbound)</span>
                    <span className="font-mono font-semibold">{formatCurrency(0)}</span>
                  </div>
                  <div className="py-1.5 flex justify-between bg-orange-50/30 px-2 rounded font-bold">
                    <span className="text-gray-900">Item 5: Output Tax This Period (7%)</span>
                    <span className="font-mono text-[#d65200]">{formatCurrency(totalOutputVAT)}</span>
                  </div>
                </div>
              </div>

              {/* Input Tax (Purchases) */}
              <div className="border border-gray-200 rounded overflow-hidden">
                <div className="bg-blue-50/80 px-4 py-2 font-bold text-gray-800 flex justify-between">
                  <span>2. Purchases and Input Tax</span>
                  <span>Rate 7%</span>
                </div>
                <div className="p-3 divide-y divide-gray-100">
                  <div className="py-1.5 flex justify-between">
                    <span className="text-gray-600">Item 6: Purchases eligible for Input Tax deduction</span>
                    <span className="font-mono font-semibold">{formatCurrency(totalInputBase)}</span>
                  </div>
                  <div className="py-1.5 flex justify-between bg-blue-50/30 px-2 rounded font-bold">
                    <span className="text-gray-900">Item 7: Input Tax This Period (7%)</span>
                    <span className="font-mono text-blue-800">{formatCurrency(totalInputVAT)}</span>
                  </div>
                </div>
              </div>

              {/* Net Tax Summary */}
              <div className="border-2 border-orange-200 rounded-lg p-4 bg-orange-50/20">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-gray-700 uppercase">Item 8 / 9: Net VAT Settlement Calculation</span>
                    <p className="text-xs text-gray-500">Output Tax minus Input Tax</p>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-semibold text-gray-600">Net Tax Payable This Period</div>
                    <div className="text-2xl font-black text-[#d65200] font-mono">
                      {formatCurrency(netVATPayable)}
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: Withholding Tax Returns (PND 3 & PND 53) */}
      {(subView === 'wht_returns' || subView === 'pnd53' || subView === 'pnd3') && (
        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-200 gap-3">
              <div>
                <h2 className="text-base font-bold text-gray-900">
                  Withholding Tax Summary & Returns (P.N.D. 3 and P.N.D. 53)
                </h2>
                <p className="text-xs text-gray-500">
                  Tax withheld from Hotel service providers (3%), Transport fleets (1%), and freelance licensed guides (3%).
                </p>
              </div>

              {/* Filter Form Type */}
              <div className="flex items-center gap-2">
                <div className="flex rounded border border-gray-200 p-0.5 bg-gray-50 text-xs">
                  <button
                    onClick={() => setSelectedFormType('All')}
                    className={`px-3 py-1 rounded font-medium ${selectedFormType === 'All' ? 'bg-[#d65200] text-white font-bold' : 'text-gray-600'}`}
                  >
                    All WHT
                  </button>
                  <button
                    onClick={() => setSelectedFormType('PND53')}
                    className={`px-3 py-1 rounded font-medium ${selectedFormType === 'PND53' ? 'bg-[#d65200] text-white font-bold' : 'text-gray-600'}`}
                  >
                    Form PND 53 (Corporate)
                  </button>
                  <button
                    onClick={() => setSelectedFormType('PND3')}
                    className={`px-3 py-1 rounded font-medium ${selectedFormType === 'PND3' ? 'bg-[#d65200] text-white font-bold' : 'text-gray-600'}`}
                  >
                    Form PND 3 (Individual)
                  </button>
                </div>
              </div>
            </div>

            {/* Metric Banner */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-4">
              <div className="p-3 bg-gray-50 rounded border border-gray-200 text-xs">
                <div className="text-gray-500">Total Taxable Service Amount</div>
                <div className="text-lg font-bold font-mono text-gray-900 mt-1">{formatCurrency(totalWHTBase)}</div>
              </div>
              <div className="p-3 bg-orange-50 rounded border border-orange-200 text-xs">
                <div className="text-orange-800 font-semibold">Total Tax Withheld (Remittance Due)</div>
                <div className="text-lg font-bold font-mono text-[#d65200] mt-1">{formatCurrency(totalWHTAmount)}</div>
              </div>
              <div className="p-3 bg-emerald-50 rounded border border-emerald-200 text-xs">
                <div className="text-emerald-800 font-semibold">Filing Deadline</div>
                <div className="text-sm font-bold text-emerald-900 mt-1">7th of Next Month (Online: 15th)</div>
              </div>
            </div>

            {/* WHT List */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 text-gray-600 border-b border-gray-200 text-[11px] uppercase">
                  <tr>
                    <th className="py-2.5 px-3">Cert #</th>
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Form</th>
                    <th className="py-2.5 px-3">Payee / Vendor</th>
                    <th className="py-2.5 px-3">Income Type</th>
                    <th className="py-2.5 px-3 text-right">Base Amount</th>
                    <th className="py-2.5 px-3 text-center">Rate</th>
                    <th className="py-2.5 px-3 text-right">Withheld Tax</th>
                    <th className="py-2.5 px-3 text-center">Status</th>
                    <th className="py-2.5 px-3 text-right">Cert</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredWHT.map((wht) => (
                    <tr key={wht.id} className="hover:bg-orange-50/30">
                      <td className="py-2.5 px-3 font-mono font-semibold text-[#d65200]">{wht.certNumber}</td>
                      <td className="py-2.5 px-3 text-gray-600 font-mono text-[11px]">{wht.date}</td>
                      <td className="py-2.5 px-3">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${wht.formType === 'PND53' ? 'bg-indigo-100 text-indigo-700' : 'bg-teal-100 text-teal-700'}`}>
                          {wht.formType}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-medium text-gray-900">
                        <div>{wht.payeeName}</div>
                        <div className="text-[10px] text-gray-500 font-mono">Tax ID: {wht.payeeTaxId}</div>
                      </td>
                      <td className="py-2.5 px-3 text-gray-600">{wht.incomeType} ({wht.incomeDescription})</td>
                      <td className="py-2.5 px-3 text-right font-mono font-medium">{formatCurrency(wht.baseAmount)}</td>
                      <td className="py-2.5 px-3 text-center font-mono font-bold text-[#d65200]">{(wht.whtRate * 100).toFixed(0)}%</td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-gray-900">{formatCurrency(wht.whtAmount)}</td>
                      <td className="py-2.5 px-3 text-center">
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-full">
                          {wht.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <button
                          onClick={() => setPreviewDoc({ type: 'WHT50Tawi', data: wht })}
                          className="px-2 py-1 bg-gray-100 hover:bg-orange-100 hover:text-[#d65200] text-gray-700 rounded text-[11px] font-medium transition inline-flex items-center gap-1"
                        >
                          <Eye className="w-3 h-3" />
                          <span>Cert</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 3: Section 50 Bis Certificates Register */}
      {subView === '50tawi' && (
        <div className="space-y-4">
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-2xs">
            <div className="flex items-center justify-between pb-4 border-b border-gray-200">
              <div>
                <h2 className="text-base font-bold text-gray-900">
                  Section 50 Bis Certificates Register
                </h2>
                <p className="text-xs text-gray-500">
                  Official certificates issued to suppliers and individuals for withholding tax reporting under Section 50 Bis.
                </p>
              </div>
              <button
                onClick={() => setIsQuickWhtOpen(true)}
                className="px-3 py-1.5 bg-[#d65200] text-white rounded text-xs font-bold hover:bg-[#b84300]"
              >
                + Issue New 50 Bis Cert
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              {whtEntries.map((wht) => (
                <div key={wht.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50/50 hover:border-orange-300 transition">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 bg-orange-100 text-[#d65200] rounded">
                        Form {wht.formType}
                      </span>
                      <h3 className="font-bold text-gray-900 text-sm mt-1">{wht.payeeName}</h3>
                      <p className="text-xs text-gray-500">Tax ID: {wht.payeeTaxId}</p>
                    </div>
                    <span className="font-mono text-xs font-bold text-[#d65200] bg-white px-2 py-1 border border-gray-200 rounded">
                      {wht.certNumber}
                    </span>
                  </div>

                  <div className="mt-3 pt-3 border-t border-gray-200 grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <span className="text-gray-400 text-[10px] block">Base Amount</span>
                      <span className="font-bold font-mono">{formatCurrency(wht.baseAmount)}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 text-[10px] block">WHT Rate</span>
                      <span className="font-bold font-mono text-[#d65200]">{(wht.whtRate * 100).toFixed(0)}%</span>
                    </div>
                    <div>
                      <span className="text-gray-400 text-[10px] block">Tax Withheld</span>
                      <span className="font-bold font-mono text-emerald-700">{formatCurrency(wht.whtAmount)}</span>
                    </div>
                  </div>

                  <div className="mt-4 flex justify-end">
                    <button
                      onClick={() => setPreviewDoc({ type: 'WHT50Tawi', data: wht })}
                      className="px-3 py-1 bg-white border border-gray-300 text-gray-700 hover:bg-orange-50 hover:text-[#d65200] rounded text-xs font-semibold transition flex items-center gap-1.5"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Preview Official Slip</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* VIEW 4: Input / Output Tax Register */}
      {(subView === 'tax_invoices' || subView === 'input_tax' || subView === 'output_tax') && (
        <div className="space-y-6">
          
          {/* Output Tax Register */}
          <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-2xs">
            <h2 className="text-sm font-bold text-gray-900 pb-2 border-b border-gray-200 flex items-center justify-between">
              <span>Output Tax Register (VAT 7%)</span>
              <span className="text-xs font-mono font-bold text-[#d65200]">Total Output VAT: {formatCurrency(totalOutputVAT)}</span>
            </h2>
            <div className="overflow-x-auto mt-2">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 text-gray-600 text-[11px] uppercase">
                  <tr>
                    <th className="py-2 px-3">Date</th>
                    <th className="py-2 px-3">Tax Invoice #</th>
                    <th className="py-2 px-3">Customer Name</th>
                    <th className="py-2 px-3">Tax ID</th>
                    <th className="py-2 px-3 text-right">Taxable Base</th>
                    <th className="py-2 px-3 text-right">VAT 7%</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {outputTaxItems.map((item, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="py-2 px-3 font-mono">{item.date}</td>
                      <td className="py-2 px-3 font-mono font-semibold text-[#d65200]">{item.taxInvoiceNo}</td>
                      <td className="py-2 px-3 font-medium">{item.customerName}</td>
                      <td className="py-2 px-3 font-mono text-gray-500">{item.taxId}</td>
                      <td className="py-2 px-3 text-right font-mono">{formatCurrency(item.baseAmount)}</td>
                      <td className="py-2 px-3 text-right font-mono font-bold text-[#d65200]">{formatCurrency(item.vatAmount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Input Tax Register */}
          <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-2xs">
            <h2 className="text-sm font-bold text-gray-900 pb-2 border-b border-gray-200 flex items-center justify-between">
              <span>Input Tax Register (VAT 7%)</span>
              <span className="text-xs font-mono font-bold text-blue-700">Total Input VAT: {formatCurrency(totalInputVAT)}</span>
            </h2>
            <div className="overflow-x-auto mt-2">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 text-gray-600 text-[11px] uppercase">
                  <tr>
                    <th className="py-2 px-3">Date</th>
                    <th className="py-2 px-3">Supplier Tax Invoice #</th>
                    <th className="py-2 px-3">Supplier / Hotel Name</th>
                    <th className="py-2 px-3">Tax ID</th>
                    <th className="py-2 px-3 text-right">Taxable Base</th>
                    <th className="py-2 px-3 text-right">Input VAT 7%</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {inputTaxItems.map((item, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="py-2 px-3 font-mono">{item.date}</td>
                      <td className="py-2 px-3 font-mono font-semibold text-blue-700">{item.taxInvoiceNo}</td>
                      <td className="py-2 px-3 font-medium">{item.vendorName}</td>
                      <td className="py-2 px-3 font-mono text-gray-500">{item.taxId}</td>
                      <td className="py-2 px-3 text-right font-mono">{formatCurrency(item.baseAmount)}</td>
                      <td className="py-2 px-3 text-right font-mono font-bold text-blue-700">{formatCurrency(item.vatAmount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}
    </div>
  );
};
