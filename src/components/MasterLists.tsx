import React, { useState } from 'react';
import { 
  Users, 
  Building2, 
  Receipt, 
  Globe2, 
  Plus, 
  Search, 
  Mail, 
  Phone, 
  MapPin,
  FileCheck,
  Edit3,
  Trash2,
  Save,
  X,
  CheckCircle2
} from 'lucide-react';
import { useAccounting } from '../context/AccountingContext';
import { Customer, Vendor, TaxCode } from '../types';

export const MasterLists: React.FC = () => {
  const { 
    customers, 
    vendors, 
    taxCodes, 
    formatCurrency, 
    subView, 
    setSubView, 
    setActiveTab: setNavTab,
    addCustomer, 
    updateCustomer,
    deleteCustomer,
    addVendor,
    updateVendor,
    deleteVendor
  } = useAccounting();

  const [activeTab, setActiveTab] = useState<string>(
    subView === 'customers' ? 'cust' :
    subView === 'vendors' ? 'vend' :
    subView === 'tax_codes' ? 'tax' : 'cust'
  );

  const [searchTerm, setSearchTerm] = useState('');
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [isVendorModalOpen, setIsVendorModalOpen] = useState(false);

  // Edit states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingKind, setEditingKind] = useState<'customer' | 'vendor'>('customer');
  const [editingId, setEditingId] = useState<string>('');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form Fields (used for add and edit)
  const [formCode, setFormCode] = useState('');
  const [formName, setFormName] = useState('');
  const [formThaiName, setFormThaiName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formTaxId, setFormTaxId] = useState('');
  const [formBranchNumber, setFormBranchNumber] = useState('00000');
  const [formAddress, setFormAddress] = useState('');
  const [formCountry, setFormCountry] = useState('Thailand');
  const [formContactPerson, setFormContactPerson] = useState('');
  const [formPaymentTerms, setFormPaymentTerms] = useState('Net 30 Days');
  const [formCustType, setFormCustType] = useState<Customer['type']>('B2B Travel Agent');
  const [formCreditLimit, setFormCreditLimit] = useState<number>(500000);
  const [formVendCategory, setFormVendCategory] = useState<Vendor['category']>('Hotel Supplier');

  const handleOpenAddCustomer = () => {
    setEditingKind('customer');
    setEditingId('');
    setFormCode(`CUST-${Math.floor(1000 + Math.random() * 9000)}`);
    setFormName('');
    setFormThaiName('');
    setFormEmail('');
    setFormPhone('');
    setFormTaxId('0105500000000');
    setFormBranchNumber('00000');
    setFormAddress('');
    setFormCountry('Thailand');
    setFormContactPerson('Lead Tour Coordinator');
    setFormPaymentTerms('Net 30 Days');
    setFormCustType('B2B Travel Agent');
    setFormCreditLimit(500000);
    setIsCustomerModalOpen(true);
  };

  const handleOpenAddVendor = () => {
    setEditingKind('vendor');
    setEditingId('');
    setFormCode(`VEND-${Math.floor(1000 + Math.random() * 9000)}`);
    setFormName('');
    setFormThaiName('');
    setFormEmail('');
    setFormPhone('');
    setFormTaxId('0105500000000');
    setFormBranchNumber('00000');
    setFormAddress('');
    setFormCountry('Thailand');
    setFormContactPerson('Accounts Desk');
    setFormPaymentTerms('Net 30 Days');
    setFormVendCategory('Hotel Supplier');
    setIsVendorModalOpen(true);
  };

  const handleOpenEdit = (kind: 'customer' | 'vendor', item: Customer | Vendor) => {
    setEditingKind(kind);
    setEditingId(item.id);
    setFormCode(item.code);
    setFormName(item.companyName);
    setFormThaiName(item.thaiCompanyName || '');
    setFormEmail(item.email || '');
    setFormPhone(item.phone || '');
    setFormTaxId(item.taxId || '');
    setFormBranchNumber(item.branchNumber || '00000');
    setFormAddress(item.address || '');
    setFormCountry(item.country || 'Thailand');
    setFormContactPerson(item.contactPerson || '');
    setFormPaymentTerms(item.paymentTerms || 'Net 30 Days');

    if (kind === 'customer') {
      const cust = item as Customer;
      setFormCustType(cust.type || 'B2B Travel Agent');
      setFormCreditLimit(cust.creditLimit || 500000);
    } else {
      const vend = item as Vendor;
      setFormVendCategory(vend.category || 'Hotel Supplier');
    }

    setIsEditModalOpen(true);
  };

  const handleCreateCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formCode || !formName) return;

    addCustomer({
      code: formCode.trim(),
      companyName: formName.trim(),
      thaiCompanyName: formThaiName.trim() || undefined,
      contactPerson: formContactPerson.trim() || 'Lead Tour Coordinator',
      email: formEmail.trim(),
      phone: formPhone.trim(),
      taxId: formTaxId.trim() || '0105500000000',
      branchNumber: formBranchNumber.trim() || '00000',
      address: formAddress.trim() || 'Bangkok, Thailand',
      country: formCountry.trim() || 'Thailand',
      currency: 'USD',
      creditLimit: formCreditLimit,
      paymentTerms: formPaymentTerms,
      type: formCustType
    });

    setIsCustomerModalOpen(false);
    setSuccessMsg(`Customer "${formName}" created successfully! Click "Edit" anytime to adjust.`);
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  const handleCreateVendor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formCode || !formName) return;

    addVendor({
      code: formCode.trim(),
      companyName: formName.trim(),
      thaiCompanyName: formThaiName.trim() || undefined,
      contactPerson: formContactPerson.trim() || 'Accounts Desk',
      email: formEmail.trim(),
      phone: formPhone.trim(),
      taxId: formTaxId.trim() || '0105500000000',
      branchNumber: formBranchNumber.trim() || '00000',
      address: formAddress.trim() || 'Bangkok, Thailand',
      country: formCountry.trim() || 'Thailand',
      currency: 'USD',
      paymentTerms: formPaymentTerms,
      category: formVendCategory
    });

    setIsVendorModalOpen(false);
    setSuccessMsg(`Vendor "${formName}" created successfully! Click "Edit" anytime to adjust.`);
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId || !formName.trim()) return;

    if (editingKind === 'customer') {
      updateCustomer(editingId, {
        code: formCode.trim(),
        companyName: formName.trim(),
        thaiCompanyName: formThaiName.trim() || undefined,
        contactPerson: formContactPerson.trim(),
        email: formEmail.trim(),
        phone: formPhone.trim(),
        taxId: formTaxId.trim(),
        branchNumber: formBranchNumber.trim(),
        address: formAddress.trim(),
        country: formCountry.trim(),
        paymentTerms: formPaymentTerms,
        type: formCustType,
        creditLimit: formCreditLimit
      });
      setSuccessMsg(`Customer "${formName}" updated successfully!`);
    } else {
      updateVendor(editingId, {
        code: formCode.trim(),
        companyName: formName.trim(),
        thaiCompanyName: formThaiName.trim() || undefined,
        contactPerson: formContactPerson.trim(),
        email: formEmail.trim(),
        phone: formPhone.trim(),
        taxId: formTaxId.trim(),
        branchNumber: formBranchNumber.trim(),
        address: formAddress.trim(),
        country: formCountry.trim(),
        paymentTerms: formPaymentTerms,
        category: formVendCategory
      });
      setSuccessMsg(`Vendor "${formName}" updated successfully!`);
    }

    setIsEditModalOpen(false);
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  const handleDelete = (kind: 'customer' | 'vendor', id: string, name: string) => {
    if (confirm(`Are you sure you want to delete ${kind} "${name}"?`)) {
      if (kind === 'customer') {
        deleteCustomer(id);
      } else {
        deleteVendor(id);
      }
      setIsEditModalOpen(false);
      setSuccessMsg(`${kind === 'customer' ? 'Customer' : 'Vendor'} "${name}" deleted.`);
      setTimeout(() => setSuccessMsg(null), 3000);
    }
  };

  const filteredCustomers = customers.filter(c => 
    !searchTerm || 
    c.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.thaiCompanyName && c.thaiCompanyName.toLowerCase().includes(searchTerm.toLowerCase())) ||
    c.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.taxId && c.taxId.includes(searchTerm))
  );

  const filteredVendors = vendors.filter(v => 
    !searchTerm || 
    v.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (v.thaiCompanyName && v.thaiCompanyName.toLowerCase().includes(searchTerm.toLowerCase())) ||
    v.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (v.taxId && v.taxId.includes(searchTerm))
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Alert */}
      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl flex items-center justify-between text-xs text-emerald-800 font-bold shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg(null)} className="text-emerald-600 hover:text-emerald-900">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              Master Lists & Directories
            </h1>
            <p className="text-xs text-gray-500">
              Global B2B Tour Operators, Hotel Suppliers, Transport Fleets, and Tax Code Master. Edit and change details anytime.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {activeTab === 'cust' && (
              <button
                onClick={handleOpenAddCustomer}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#d65200] hover:bg-[#b84300] text-white rounded-lg text-xs font-bold shadow-xs transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ New Customer</span>
              </button>
            )}
            {activeTab === 'vend' && (
              <button
                onClick={handleOpenAddVendor}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#d65200] hover:bg-[#b84300] text-white rounded-lg text-xs font-bold shadow-xs transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ New Vendor</span>
              </button>
            )}
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-2 border-b border-gray-200 mt-4 pt-2 text-xs font-medium overflow-x-auto">
          <button
            onClick={() => { setNavTab('coa'); setSubView('coa'); }}
            className="pb-2 px-3 border-b-2 border-transparent text-gray-600 hover:text-[#d65200] hover:border-orange-300 font-semibold transition flex items-center gap-1.5"
          >
            <span>Chart of Accounts (COA)</span>
            <span className="text-[10px] bg-orange-100 text-[#d65200] px-1.5 py-0.2 rounded font-bold">GL</span>
          </button>
          <button
            onClick={() => setActiveTab('cust')}
            className={`pb-2 px-3 border-b-2 transition ${
              activeTab === 'cust'
                ? 'border-[#d65200] text-[#d65200] font-bold'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Customers ({customers.length})
          </button>
          <button
            onClick={() => setActiveTab('vend')}
            className={`pb-2 px-3 border-b-2 transition ${
              activeTab === 'vend'
                ? 'border-[#d65200] text-[#d65200] font-bold'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Vendors ({vendors.length})
          </button>
          <button
            onClick={() => setActiveTab('tax')}
            className={`pb-2 px-3 border-b-2 transition ${
              activeTab === 'tax'
                ? 'border-[#d65200] text-[#d65200] font-bold'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Tax Codes ({taxCodes.length})
          </button>
        </div>
      </div>

      {/* CUSTOMERS LIST */}
      {activeTab === 'cust' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredCustomers.map((cust) => (
            <div key={cust.id} className="bg-white border border-gray-200 rounded-xl p-4 shadow-2xs hover:border-[#d65200]/50 transition space-y-3 relative group">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-[#d65200] bg-orange-50 px-2 py-0.5 rounded border border-orange-200">
                      {cust.code}
                    </span>
                    <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-bold rounded">
                      {cust.type}
                    </span>
                  </div>
                  <h3 className="font-bold text-gray-900 text-sm mt-1">{cust.companyName}</h3>
                  {cust.thaiCompanyName && <p className="text-xs text-gray-500">{cust.thaiCompanyName}</p>}
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleOpenEdit('customer', cust)}
                    className="p-1.5 bg-orange-50 hover:bg-[#d65200] text-[#d65200] hover:text-white rounded-lg transition font-bold text-xs flex items-center gap-1 shadow-2xs"
                    title="Edit Customer info"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete('customer', cust.id, cust.companyName)}
                    className="p-1.5 bg-rose-50 hover:bg-rose-600 text-rose-600 hover:text-white rounded-lg transition"
                    title="Delete Customer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="text-xs space-y-1 text-gray-600 pt-2 border-t border-gray-100">
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-gray-400" />
                  <span>{cust.email || '-'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-gray-400" />
                  <span>{cust.phone || '-'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <FileCheck className="w-3.5 h-3.5 text-gray-400" />
                  <span className="font-mono">TIN: {cust.taxId || 'N/A'} (Branch: {cust.branchNumber || '00000'})</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-gray-400" />
                  <span className="truncate">{cust.address || 'Thailand'}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-gray-100 flex justify-between items-center text-xs">
                <div>
                  <span className="text-gray-400 text-[10px] block">Current AR Balance</span>
                  <span className="font-bold font-mono text-blue-900">{formatCurrency(cust.balance)}</span>
                </div>
                <div className="text-right">
                  <span className="text-gray-400 text-[10px] block">Payment Terms</span>
                  <span className="font-medium text-gray-700">{cust.paymentTerms || 'Net 30'}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* VENDORS LIST */}
      {activeTab === 'vend' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredVendors.map((vend) => (
            <div key={vend.id} className="bg-white border border-gray-200 rounded-xl p-4 shadow-2xs hover:border-[#d65200]/50 transition space-y-3 relative group">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                      {vend.code}
                    </span>
                    <span className="px-2 py-0.5 bg-purple-50 text-purple-700 text-[10px] font-bold rounded">
                      {vend.category}
                    </span>
                  </div>
                  <h3 className="font-bold text-gray-900 text-sm mt-1">{vend.companyName}</h3>
                  {vend.thaiCompanyName && <p className="text-xs text-gray-500">{vend.thaiCompanyName}</p>}
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleOpenEdit('vendor', vend)}
                    className="p-1.5 bg-orange-50 hover:bg-[#d65200] text-[#d65200] hover:text-white rounded-lg transition font-bold text-xs flex items-center gap-1 shadow-2xs"
                    title="Edit Vendor info"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete('vendor', vend.id, vend.companyName)}
                    className="p-1.5 bg-rose-50 hover:bg-rose-600 text-rose-600 hover:text-white rounded-lg transition"
                    title="Delete Vendor"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="text-xs space-y-1 text-gray-600 pt-2 border-t border-gray-100">
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-gray-400" />
                  <span>{vend.email || '-'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-gray-400" />
                  <span>{vend.phone || '-'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <FileCheck className="w-3.5 h-3.5 text-gray-400" />
                  <span className="font-mono">Tax ID: {vend.taxId} (Branch: {vend.branchNumber || '00000'})</span>
                </div>
              </div>

              <div className="pt-2 border-t border-gray-100 flex justify-between items-center text-xs">
                <div>
                  <span className="text-gray-400 text-[10px] block">Outstanding AP Balance</span>
                  <span className="font-bold font-mono text-rose-900">{formatCurrency(vend.balance)}</span>
                </div>
                <div className="text-right">
                  <span className="text-gray-400 text-[10px] block">Payment Terms</span>
                  <span className="font-medium text-gray-700">{vend.paymentTerms || 'Net 30'}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAX CODES */}
      {activeTab === 'tax' && (
        <div className="bg-white border border-gray-200 rounded-xl shadow-2xs overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-gray-600 border-b border-gray-200 text-[11px] uppercase">
              <tr>
                <th className="py-3 px-4">Tax Code</th>
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4 text-center">Standard Rate</th>
                <th className="py-3 px-4">Statutory Type</th>
                <th className="py-3 px-4">Statutory Tax Application</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {taxCodes.map((tc) => (
                <tr key={tc.id} className="hover:bg-orange-50/30">
                  <td className="py-3 px-4 font-mono font-bold text-[#d65200]">{tc.code}</td>
                  <td className="py-3 px-4">
                    <div className="font-semibold text-gray-900">{tc.name}</div>
                    <div className="text-[11px] text-gray-500">{tc.thaiName}</div>
                  </td>
                  <td className="py-3 px-4 text-center font-mono font-bold text-gray-900">
                    {(tc.rate * 100).toFixed(0)}%
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-[10px] font-medium">
                      {tc.type}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-600">{tc.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* =========================================================================
          ADD CUSTOMER MODAL
          ========================================================================= */}
      {isCustomerModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl animate-in fade-in-50">
            <div className="flex items-center justify-between border-b pb-3 mb-4">
              <h3 className="text-base font-bold text-gray-900">Add B2B Tour Operator / Customer</h3>
              <button onClick={() => setIsCustomerModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateCustomer} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-gray-700 mb-1">Customer Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. CUST-005"
                    value={formCode}
                    onChange={(e) => setFormCode(e.target.value.toUpperCase())}
                    className="w-full px-3 py-1.5 border border-gray-300 rounded font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-medium text-gray-700 mb-1">Country</label>
                  <input
                    type="text"
                    value={formCountry}
                    onChange={(e) => setFormCountry(e.target.value)}
                    className="w-full px-3 py-1.5 border border-gray-300 rounded"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-gray-700 mb-1">Company Legal Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dertouristik Suisse AG"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3 py-1.5 border border-gray-300 rounded font-semibold"
                />
              </div>

              <div>
                <label className="block font-medium text-gray-700 mb-1">Local Name (Thai / Khmer / Native)</label>
                <input
                  type="text"
                  placeholder="e.g. บริษัท นานาชาติ ทัวร์ จำกัด"
                  value={formThaiName}
                  onChange={(e) => setFormThaiName(e.target.value)}
                  className="w-full px-3 py-1.5 border border-gray-300 rounded"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    placeholder="ops@travelpartner.com"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    className="w-full px-3 py-1.5 border border-gray-300 rounded font-mono"
                  />
                </div>
                <div>
                  <label className="block font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="text"
                    placeholder="+41 22 890 1200"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    className="w-full px-3 py-1.5 border border-gray-300 rounded"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-gray-700 mb-1">Tax ID / TIN</label>
                  <input
                    type="text"
                    placeholder="0105559812441"
                    value={formTaxId}
                    onChange={(e) => setFormTaxId(e.target.value)}
                    className="w-full px-3 py-1.5 border border-gray-300 rounded font-mono"
                  />
                </div>
                <div>
                  <label className="block font-medium text-gray-700 mb-1">Branch Number</label>
                  <input
                    type="text"
                    placeholder="00000"
                    value={formBranchNumber}
                    onChange={(e) => setFormBranchNumber(e.target.value)}
                    className="w-full px-3 py-1.5 border border-gray-300 rounded font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-gray-700 mb-1">Address</label>
                <input
                  type="text"
                  placeholder="e.g. 128/9 Sukhumvit Rd, Bangkok"
                  value={formAddress}
                  onChange={(e) => setFormAddress(e.target.value)}
                  className="w-full px-3 py-1.5 border border-gray-300 rounded"
                />
              </div>

              <div className="mt-6 flex justify-end gap-2 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsCustomerModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#d65200] hover:bg-[#b84300] text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Customer</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          ADD VENDOR MODAL
          ========================================================================= */}
      {isVendorModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl animate-in fade-in-50">
            <div className="flex items-center justify-between border-b pb-3 mb-4">
              <h3 className="text-base font-bold text-gray-900">Add Supplier / Hotel / Transport Vendor</h3>
              <button onClick={() => setIsVendorModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateVendor} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-gray-700 mb-1">Vendor Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. VEND-006"
                    value={formCode}
                    onChange={(e) => setFormCode(e.target.value.toUpperCase())}
                    className="w-full px-3 py-1.5 border border-gray-300 rounded font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-medium text-gray-700 mb-1">Category *</label>
                  <select
                    value={formVendCategory}
                    onChange={(e) => setFormVendCategory(e.target.value as any)}
                    className="w-full px-3 py-1.5 border border-gray-300 rounded bg-white"
                  >
                    <option value="Hotel Supplier">Hotel Supplier</option>
                    <option value="Transport">Transport / Coach Fleet</option>
                    <option value="Airline">Airline / Flight Tickets</option>
                    <option value="Tour Guide">Licensed Tour Guide</option>
                    <option value="Legal & Audit">Legal & Audit</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-medium text-gray-700 mb-1">Vendor Company Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Shangri-La Hotel Bangkok"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3 py-1.5 border border-gray-300 rounded font-semibold"
                />
              </div>

              <div>
                <label className="block font-medium text-gray-700 mb-1">Local Name (Thai / Khmer / Native)</label>
                <input
                  type="text"
                  placeholder="e.g. โรงแรมแชงกรี-ลา กรุงเทพฯ"
                  value={formThaiName}
                  onChange={(e) => setFormThaiName(e.target.value)}
                  className="w-full px-3 py-1.5 border border-gray-300 rounded"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-gray-700 mb-1">Tax ID (13 Digits) *</label>
                  <input
                    type="text"
                    required
                    placeholder="0105531011883"
                    value={formTaxId}
                    onChange={(e) => setFormTaxId(e.target.value)}
                    className="w-full px-3 py-1.5 border border-gray-300 rounded font-mono"
                  />
                </div>
                <div>
                  <label className="block font-medium text-gray-700 mb-1">Branch Number</label>
                  <input
                    type="text"
                    placeholder="00000"
                    value={formBranchNumber}
                    onChange={(e) => setFormBranchNumber(e.target.value)}
                    className="w-full px-3 py-1.5 border border-gray-300 rounded font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    placeholder="billing@hotel.com"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    className="w-full px-3 py-1.5 border border-gray-300 rounded font-mono"
                  />
                </div>
                <div>
                  <label className="block font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="text"
                    placeholder="+66 2 236 7777"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    className="w-full px-3 py-1.5 border border-gray-300 rounded"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-gray-700 mb-1">Address</label>
                <input
                  type="text"
                  placeholder="e.g. 89 Soi Wat Suan Phlu, Bang Rak, Bangkok"
                  value={formAddress}
                  onChange={(e) => setFormAddress(e.target.value)}
                  className="w-full px-3 py-1.5 border border-gray-300 rounded"
                />
              </div>

              <div className="mt-6 flex justify-end gap-2 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsVendorModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#d65200] hover:bg-[#b84300] text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Vendor</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          EDIT MODAL (EDIT ANY FIELD AFTER SAVING)
          ========================================================================= */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl animate-in zoom-in-95 overflow-hidden">
            <div className={`px-5 py-3.5 text-white flex items-center justify-between shrink-0 ${
              editingKind === 'vendor' ? 'bg-[#d65200]' : 'bg-blue-600'
            }`}>
              <div className="flex items-center gap-2">
                <Edit3 className="w-4 h-4" />
                <h3 className="text-sm font-bold">
                  Edit {editingKind === 'vendor' ? 'Vendor' : 'Customer'} Information
                </h3>
              </div>
              <button onClick={() => setIsEditModalOpen(false)} className="text-white/80 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-5 overflow-y-auto space-y-3.5 text-xs flex-1">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Code *</label>
                  <input
                    type="text"
                    required
                    value={formCode}
                    onChange={(e) => setFormCode(e.target.value.toUpperCase())}
                    className="w-full px-3 py-1.5 border border-gray-300 rounded-md font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    {editingKind === 'vendor' ? 'Category' : 'Customer Type'}
                  </label>
                  {editingKind === 'vendor' ? (
                    <select
                      value={formVendCategory}
                      onChange={(e) => setFormVendCategory(e.target.value as any)}
                      className="w-full px-3 py-1.5 border border-gray-300 rounded-md bg-white font-medium"
                    >
                      <option value="Hotel Supplier">Hotel Supplier</option>
                      <option value="Transport">Transport</option>
                      <option value="Airline">Airline</option>
                      <option value="Tour Guide">Tour Guide</option>
                      <option value="Legal & Audit">Legal & Audit</option>
                    </select>
                  ) : (
                    <select
                      value={formCustType}
                      onChange={(e) => setFormCustType(e.target.value as any)}
                      className="w-full px-3 py-1.5 border border-gray-300 rounded-md bg-white font-medium"
                    >
                      <option value="B2B Travel Agent">B2B Travel Agent</option>
                      <option value="Corporate">Corporate</option>
                      <option value="FIT Tourist">FIT Tourist</option>
                      <option value="MICE">MICE</option>
                    </select>
                  )}
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Company / Legal Name *</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3 py-1.5 border border-gray-300 rounded-md font-semibold text-gray-900"
                />
              </div>

              <div>
                <label className="block font-medium text-gray-700 mb-1">Local / Thai / Native Name</label>
                <input
                  type="text"
                  value={formThaiName}
                  onChange={(e) => setFormThaiName(e.target.value)}
                  className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-gray-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Tax ID / TIN</label>
                  <input
                    type="text"
                    value={formTaxId}
                    onChange={(e) => setFormTaxId(e.target.value)}
                    className="w-full px-3 py-1.5 border border-gray-300 rounded-md font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Branch Number</label>
                  <input
                    type="text"
                    value={formBranchNumber}
                    onChange={(e) => setFormBranchNumber(e.target.value)}
                    className="w-full px-3 py-1.5 border border-gray-300 rounded-md font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-gray-700 mb-1">Contact Person</label>
                  <input
                    type="text"
                    value={formContactPerson}
                    onChange={(e) => setFormContactPerson(e.target.value)}
                    className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-gray-900"
                  />
                </div>
                <div>
                  <label className="block font-medium text-gray-700 mb-1">Payment Terms</label>
                  <select
                    value={formPaymentTerms}
                    onChange={(e) => setFormPaymentTerms(e.target.value)}
                    className="w-full px-3 py-1.5 border border-gray-300 rounded-md bg-white font-medium"
                  >
                    <option value="Immediate / COD">Immediate / COD</option>
                    <option value="Net 7 Days">Net 7 Days</option>
                    <option value="Net 15 Days">Net 15 Days</option>
                    <option value="Net 30 Days">Net 30 Days</option>
                    <option value="Net 60 Days">Net 60 Days</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    className="w-full px-3 py-1.5 border border-gray-300 rounded-md font-mono"
                  />
                </div>
                <div>
                  <label className="block font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="text"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    className="w-full px-3 py-1.5 border border-gray-300 rounded-md"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block font-medium text-gray-700 mb-1">Address</label>
                  <input
                    type="text"
                    value={formAddress}
                    onChange={(e) => setFormAddress(e.target.value)}
                    className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-gray-900"
                  />
                </div>
                <div>
                  <label className="block font-medium text-gray-700 mb-1">Country</label>
                  <input
                    type="text"
                    value={formCountry}
                    onChange={(e) => setFormCountry(e.target.value)}
                    className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-gray-900"
                  />
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => handleDelete(editingKind, editingId, formName)}
                  className="px-3 py-2 bg-rose-50 hover:bg-rose-600 text-rose-600 hover:text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#d65200] hover:bg-[#b84300] text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs transition"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Changes</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

