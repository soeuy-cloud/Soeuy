import React, { useState, useMemo } from 'react';
import { 
  Users, 
  Building2, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  Phone, 
  Mail, 
  MapPin, 
  FileText, 
  Receipt, 
  DollarSign, 
  Link2, 
  Check, 
  X, 
  Filter, 
  ChevronDown, 
  ChevronUp, 
  ArrowUpRight, 
  ShieldCheck, 
  CreditCard,
  Building,
  Briefcase,
  Layers,
  Sparkles,
  ExternalLink,
  Save,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useAccounting } from '../context/AccountingContext';
import { Customer, Vendor, CurrencyCode } from '../types';

export const VendorCustomerHub: React.FC = () => {
  const {
    customers,
    vendors,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    addVendor,
    updateVendor,
    deleteVendor,
    formatCurrency,
    currentCurrency,
    setIsQuickInvoiceOpen,
    setIsQuickJournalOpen,
    setIsAccountLinkerOpen,
    setSelectedEntityForLink,
    setActiveTab,
    setSubView
  } = useAccounting();

  // Active filter tab: 'all' | 'vendors' | 'customers'
  const [partnerTypeTab, setPartnerTypeTab] = useState<'all' | 'vendors' | 'customers'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const [viewLayout, setViewLayout] = useState<'grid' | 'table'>('grid');

  // Modal states for Adding & Editing
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addMode, setAddMode] = useState<'vendor' | 'customer'>('vendor');
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingPartner, setEditingPartner] = useState<{
    type: 'vendor' | 'customer';
    data: Customer | Vendor;
  } | null>(null);

  // Form State for Adding / Editing
  const [formType, setFormType] = useState<'vendor' | 'customer'>('vendor');
  const [formId, setFormId] = useState<string>('');
  const [formCode, setFormCode] = useState<string>('');
  const [formCompanyName, setFormCompanyName] = useState<string>('');
  const [formThaiName, setFormThaiName] = useState<string>('');
  const [formContactPerson, setFormContactPerson] = useState<string>('');
  const [formEmail, setFormEmail] = useState<string>('');
  const [formPhone, setFormPhone] = useState<string>('');
  const [formTaxId, setFormTaxId] = useState<string>('');
  const [formBranchNumber, setFormBranchNumber] = useState<string>('00000');
  const [formAddress, setFormAddress] = useState<string>('');
  const [formCountry, setFormCountry] = useState<string>('Thailand');
  const [formCurrency, setFormCurrency] = useState<CurrencyCode>('USD');
  const [formPaymentTerms, setFormPaymentTerms] = useState<string>('Net 30 Days');
  const [formCreditLimit, setFormCreditLimit] = useState<number>(500000);
  const [formCategory, setFormCategory] = useState<string>('Hotel Supplier');
  const [formCustomerType, setFormCustomerType] = useState<Customer['type']>('B2B Travel Agent');
  const [formSuccessAlert, setFormSuccessAlert] = useState<string | null>(null);
  const [lastSavedPartner, setLastSavedPartner] = useState<{ kind: 'vendor' | 'customer'; partner: Vendor | Customer } | null>(null);

  // Summary Metrics
  const totalVendors = vendors.length;
  const totalCustomers = customers.length;
  const totalPayables = useMemo(() => vendors.reduce((sum, v) => sum + (v.balance || 0), 0), [vendors]);
  const totalReceivables = useMemo(() => customers.reduce((sum, c) => sum + (c.balance || 0), 0), [customers]);

  // Combined and filtered partners list
  const filteredPartners = useMemo(() => {
    const list: Array<{ kind: 'vendor' | 'customer'; item: Vendor | Customer }> = [];

    if (partnerTypeTab === 'all' || partnerTypeTab === 'vendors') {
      vendors.forEach(v => list.push({ kind: 'vendor', item: v }));
    }
    if (partnerTypeTab === 'all' || partnerTypeTab === 'customers') {
      customers.forEach(c => list.push({ kind: 'customer', item: c }));
    }

    return list.filter(({ kind, item }) => {
      const q = searchQuery.toLowerCase().trim();
      const matchSearch = !q || (
        item.companyName.toLowerCase().includes(q) ||
        (item.thaiCompanyName && item.thaiCompanyName.toLowerCase().includes(q)) ||
        item.code.toLowerCase().includes(q) ||
        item.taxId.toLowerCase().includes(q) ||
        item.contactPerson.toLowerCase().includes(q) ||
        item.email.toLowerCase().includes(q) ||
        item.phone.toLowerCase().includes(q) ||
        (item.address && item.address.toLowerCase().includes(q))
      );

      if (!matchSearch) return false;

      if (selectedCategory !== 'all') {
        if (kind === 'vendor' && (item as Vendor).category !== selectedCategory) return false;
        if (kind === 'customer' && (item as Customer).type !== selectedCategory) return false;
      }

      return true;
    });
  }, [vendors, customers, partnerTypeTab, searchQuery, selectedCategory]);

  // Open Add Modal
  const handleOpenAdd = (type: 'vendor' | 'customer') => {
    setFormType(type);
    setFormId('');
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    setFormCode(type === 'vendor' ? `VEND-${randomSuffix}` : `CUST-${randomSuffix}`);
    setFormCompanyName('');
    setFormThaiName('');
    setFormContactPerson('');
    setFormEmail('');
    setFormPhone('');
    setFormTaxId('');
    setFormBranchNumber('00000');
    setFormAddress('');
    setFormCountry('Thailand');
    setFormCurrency('USD');
    setFormPaymentTerms('Net 30 Days');
    setFormCreditLimit(500000);
    setFormCategory('Hotel Supplier');
    setFormCustomerType('B2B Travel Agent');
    setIsAddModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (kind: 'vendor' | 'customer', partner: Vendor | Customer) => {
    setEditingPartner({ type: kind, data: partner });
    setFormType(kind);
    setFormId(partner.id);
    setFormCode(partner.code);
    setFormCompanyName(partner.companyName);
    setFormThaiName(partner.thaiCompanyName || '');
    setFormContactPerson(partner.contactPerson || '');
    setFormEmail(partner.email || '');
    setFormPhone(partner.phone || '');
    setFormTaxId(partner.taxId || '');
    setFormBranchNumber(partner.branchNumber || '00000');
    setFormAddress(partner.address || '');
    setFormCountry(partner.country || 'Thailand');
    setFormCurrency(partner.currency || 'USD');
    setFormPaymentTerms(partner.paymentTerms || 'Net 30 Days');
    
    if (kind === 'customer') {
      const cust = partner as Customer;
      setFormCreditLimit(cust.creditLimit || 500000);
      setFormCustomerType(cust.type || 'B2B Travel Agent');
    } else {
      const vend = partner as Vendor;
      setFormCategory(vend.category || 'Hotel Supplier');
    }

    setIsEditModalOpen(true);
  };

  // Save Add Partner
  const handleSaveAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formCompanyName.trim() || !formCode.trim()) return;

    if (formType === 'vendor') {
      const newVendData = {
        code: formCode.trim(),
        companyName: formCompanyName.trim(),
        thaiCompanyName: formThaiName.trim() || undefined,
        contactPerson: formContactPerson.trim() || 'Accounts Manager',
        email: formEmail.trim(),
        phone: formPhone.trim(),
        taxId: formTaxId.trim() || '0105500000000',
        branchNumber: formBranchNumber.trim() || '00000',
        address: formAddress.trim() || 'Bangkok, Thailand',
        country: formCountry.trim() || 'Thailand',
        currency: formCurrency,
        paymentTerms: formPaymentTerms,
        category: formCategory as Vendor['category'],
      };
      addVendor(newVendData);
      setFormSuccessAlert(`Vendor "${formCompanyName}" saved successfully!`);
    } else {
      const newCustData = {
        code: formCode.trim(),
        companyName: formCompanyName.trim(),
        thaiCompanyName: formThaiName.trim() || undefined,
        contactPerson: formContactPerson.trim() || 'Lead Contact',
        email: formEmail.trim(),
        phone: formPhone.trim(),
        taxId: formTaxId.trim() || '0105500000000',
        branchNumber: formBranchNumber.trim() || '00000',
        address: formAddress.trim() || 'Bangkok, Thailand',
        country: formCountry.trim() || 'Thailand',
        currency: formCurrency,
        creditLimit: formCreditLimit,
        paymentTerms: formPaymentTerms,
        type: formCustomerType,
      };
      addCustomer(newCustData);
      setFormSuccessAlert(`Customer "${formCompanyName}" saved successfully!`);
    }

    setIsAddModalOpen(false);
    setTimeout(() => setFormSuccessAlert(null), 5000);
  };

  // Save Edit Partner
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formId || !formCompanyName.trim()) return;

    if (formType === 'vendor') {
      updateVendor(formId, {
        code: formCode.trim(),
        companyName: formCompanyName.trim(),
        thaiCompanyName: formThaiName.trim() || undefined,
        contactPerson: formContactPerson.trim(),
        email: formEmail.trim(),
        phone: formPhone.trim(),
        taxId: formTaxId.trim(),
        branchNumber: formBranchNumber.trim(),
        address: formAddress.trim(),
        country: formCountry.trim(),
        currency: formCurrency,
        paymentTerms: formPaymentTerms,
        category: formCategory as Vendor['category'],
      });
      setFormSuccessAlert(`Vendor "${formCompanyName}" updated successfully!`);
    } else {
      updateCustomer(formId, {
        code: formCode.trim(),
        companyName: formCompanyName.trim(),
        thaiCompanyName: formThaiName.trim() || undefined,
        contactPerson: formContactPerson.trim(),
        email: formEmail.trim(),
        phone: formPhone.trim(),
        taxId: formTaxId.trim(),
        branchNumber: formBranchNumber.trim(),
        address: formAddress.trim(),
        country: formCountry.trim(),
        currency: formCurrency,
        creditLimit: formCreditLimit,
        paymentTerms: formPaymentTerms,
        type: formCustomerType,
      });
      setFormSuccessAlert(`Customer "${formCompanyName}" updated successfully!`);
    }

    setIsEditModalOpen(false);
    setEditingPartner(null);
    setTimeout(() => setFormSuccessAlert(null), 5000);
  };

  // Delete Partner Confirmation
  const handleDeletePartner = (kind: 'vendor' | 'customer', partner: Vendor | Customer) => {
    if (confirm(`Are you sure you want to delete ${kind === 'vendor' ? 'Vendor' : 'Customer'} "${partner.companyName}" (${partner.code})?`)) {
      if (kind === 'vendor') {
        deleteVendor(partner.id);
        setFormSuccessAlert(`Vendor "${partner.companyName}" deleted.`);
      } else {
        deleteCustomer(partner.id);
        setFormSuccessAlert(`Customer "${partner.companyName}" deleted.`);
      }
      setTimeout(() => setFormSuccessAlert(null), 4000);
    }
  };

  return (
    <div id="vendor-customer-management-place" className="bg-white rounded-2xl border border-gray-200/90 shadow-md overflow-hidden transition-all duration-200">
      
      {/* Success Notification Alert */}
      {formSuccessAlert && (
        <div className="bg-emerald-50 border-b border-emerald-200 px-4 py-2.5 text-xs text-emerald-900 font-bold flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{formSuccessAlert}</span>
            <span className="text-emerald-700 font-normal text-[11px] hidden sm:inline">• You can edit this record anytime using the Edit button.</span>
          </div>
          <button onClick={() => setFormSuccessAlert(null)} className="text-emerald-700 hover:text-emerald-900">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Top Banner Header & Metric Ribbons */}
      <div className="p-4 sm:p-5 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white relative">
        <div className="absolute -right-6 -bottom-6 w-52 h-52 bg-[#d65200]/15 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute right-1/3 -top-6 w-40 h-40 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-md bg-[#d65200] text-white font-bold text-[10px] tracking-wide uppercase flex items-center gap-1 shadow-2xs">
                <Users className="w-3 h-3" />
                Vendor & Customer Directory Place
              </span>
              <span className="text-xs text-gray-400 font-medium">
                • Add, Change Information & Manage AP/AR Master Records
              </span>
            </div>
            <h1 className="text-lg sm:text-xl font-black tracking-tight text-white flex items-center gap-2">
              <span>Vendors & Customers Control Center</span>
            </h1>
            <p className="text-xs text-gray-300 max-w-xl mt-0.5">
              Comprehensive directory to add new partners, edit legal tax details, update contact info, adjust balances, and link accounts.
            </p>
          </div>

          {/* Quick Add Buttons */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              id="btn-add-new-vendor"
              type="button"
              onClick={() => handleOpenAdd('vendor')}
              className="px-3.5 py-2 bg-[#d65200] hover:bg-[#b84300] text-white rounded-xl text-xs font-bold shadow-xs transition flex items-center gap-1.5 active:scale-95"
              title="Add a new Supplier / Vendor with Tax & Payment Terms"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Add Vendor</span>
            </button>

            <button
              id="btn-add-new-customer"
              type="button"
              onClick={() => handleOpenAdd('customer')}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition flex items-center gap-1.5 active:scale-95"
              title="Add a new Client / Customer with Credit Limit & Tax ID"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Add Customer</span>
            </button>

            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition flex items-center gap-1"
              title={isExpanded ? "Collapse Directory Place" : "Expand Directory Place"}
            >
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Real-time Partner Counters Ribbon */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-4 pt-4 border-t border-gray-700/60 text-xs">
          <div 
            onClick={() => setPartnerTypeTab('vendors')}
            className={`p-2.5 rounded-xl border transition cursor-pointer ${
              partnerTypeTab === 'vendors' ? 'bg-blue-500/20 border-blue-400/40 ring-1 ring-blue-400' : 'bg-white/5 border-white/5 hover:bg-white/10'
            }`}
          >
            <div className="flex items-center justify-between text-[11px] text-gray-400 font-medium">
              <span>Total Vendors</span>
              <Building2 className="w-3.5 h-3.5 text-blue-400" />
            </div>
            <span className="text-base font-black text-white font-mono mt-0.5 block">
              {totalVendors} Active Suppliers
            </span>
          </div>

          <div 
            onClick={() => setPartnerTypeTab('vendors')}
            className={`p-2.5 rounded-xl border transition cursor-pointer ${
              partnerTypeTab === 'vendors' ? 'bg-rose-500/20 border-rose-400/40 ring-1 ring-rose-400' : 'bg-white/5 border-white/5 hover:bg-white/10'
            }`}
          >
            <div className="flex items-center justify-between text-[11px] text-gray-400 font-medium">
              <span>AP Outstanding</span>
              <CreditCard className="w-3.5 h-3.5 text-rose-400" />
            </div>
            <span className="text-base font-black text-rose-300 font-mono mt-0.5 block">
              {formatCurrency(totalPayables)}
            </span>
          </div>

          <div 
            onClick={() => setPartnerTypeTab('customers')}
            className={`p-2.5 rounded-xl border transition cursor-pointer ${
              partnerTypeTab === 'customers' ? 'bg-emerald-500/20 border-emerald-400/40 ring-1 ring-emerald-400' : 'bg-white/5 border-white/5 hover:bg-white/10'
            }`}
          >
            <div className="flex items-center justify-between text-[11px] text-gray-400 font-medium">
              <span>Total Customers</span>
              <Users className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <span className="text-base font-black text-white font-mono mt-0.5 block">
              {totalCustomers} Client Accounts
            </span>
          </div>

          <div 
            onClick={() => setPartnerTypeTab('customers')}
            className={`p-2.5 rounded-xl border transition cursor-pointer ${
              partnerTypeTab === 'customers' ? 'bg-emerald-500/20 border-emerald-400/40 ring-1 ring-emerald-400' : 'bg-white/5 border-white/5 hover:bg-white/10'
            }`}
          >
            <div className="flex items-center justify-between text-[11px] text-gray-400 font-medium">
              <span>AR Outstanding</span>
              <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <span className="text-base font-black text-emerald-300 font-mono mt-0.5 block">
              {formatCurrency(totalReceivables)}
            </span>
          </div>
        </div>
      </div>

      {/* Expandable Directory Body */}
      {isExpanded && (
        <div className="p-4 sm:p-5 space-y-4">
          
          {/* Controls Bar: Tabs, Search & Layout Switcher */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-gray-50 p-2.5 rounded-xl border border-gray-200">
            
            {/* Filter Tabs */}
            <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-gray-200 shrink-0">
              <button
                type="button"
                onClick={() => setPartnerTypeTab('all')}
                className={`px-3 py-1 rounded-md text-xs font-bold transition ${
                  partnerTypeTab === 'all' ? 'bg-gray-900 text-white shadow-2xs' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                All Partners ({vendors.length + customers.length})
              </button>
              <button
                type="button"
                onClick={() => setPartnerTypeTab('vendors')}
                className={`px-3 py-1 rounded-md text-xs font-bold transition flex items-center gap-1.5 ${
                  partnerTypeTab === 'vendors' ? 'bg-[#d65200] text-white shadow-2xs' : 'text-gray-600 hover:text-[#d65200] hover:bg-orange-50'
                }`}
              >
                <Building2 className="w-3 h-3" />
                <span>Vendors ({vendors.length})</span>
              </button>
              <button
                type="button"
                onClick={() => setPartnerTypeTab('customers')}
                className={`px-3 py-1 rounded-md text-xs font-bold transition flex items-center gap-1.5 ${
                  partnerTypeTab === 'customers' ? 'bg-blue-600 text-white shadow-2xs' : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                }`}
              >
                <Users className="w-3 h-3" />
                <span>Customers ({customers.length})</span>
              </button>
            </div>

            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, local name, TIN, phone, email, code..."
                className="w-full pl-8 pr-4 py-1.5 text-xs bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#d65200] focus:border-[#d65200]"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Layout Toggle */}
            <div className="flex items-center gap-1.5 shrink-0 self-end md:self-auto">
              <span className="text-[11px] font-semibold text-gray-500 hidden sm:inline">View:</span>
              <button
                type="button"
                onClick={() => setViewLayout('grid')}
                className={`px-2.5 py-1 rounded-md text-xs font-bold border transition ${
                  viewLayout === 'grid' ? 'bg-white border-[#d65200] text-[#d65200] shadow-2xs' : 'bg-transparent border-gray-300 text-gray-600 hover:bg-white'
                }`}
              >
                Grid Cards
              </button>
              <button
                type="button"
                onClick={() => setViewLayout('table')}
                className={`px-2.5 py-1 rounded-md text-xs font-bold border transition ${
                  viewLayout === 'table' ? 'bg-white border-[#d65200] text-[#d65200] shadow-2xs' : 'bg-transparent border-gray-300 text-gray-600 hover:bg-white'
                }`}
              >
                Dense Table
              </button>
            </div>
          </div>

          {/* Partner Items View */}
          {filteredPartners.length === 0 ? (
            <div className="p-8 text-center bg-gray-50 rounded-xl border border-dashed border-gray-300">
              <Users className="w-10 h-10 text-gray-400 mx-auto mb-2 opacity-50" />
              <p className="text-xs font-bold text-gray-700">No partner records found matching your search.</p>
              <p className="text-[11px] text-gray-500 mt-0.5">Try a different keyword or create a new vendor / customer record.</p>
              <div className="flex items-center justify-center gap-2 mt-3">
                <button
                  type="button"
                  onClick={() => handleOpenAdd('vendor')}
                  className="px-3 py-1.5 bg-[#d65200] text-white rounded-lg text-xs font-bold"
                >
                  + Add Vendor
                </button>
                <button
                  type="button"
                  onClick={() => handleOpenAdd('customer')}
                  className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-bold"
                >
                  + Add Customer
                </button>
              </div>
            </div>
          ) : viewLayout === 'grid' ? (
            /* Grid Cards Layout */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {filteredPartners.map(({ kind, item }) => {
                const isVendor = kind === 'vendor';
                const vend = isVendor ? (item as Vendor) : null;
                const cust = !isVendor ? (item as Customer) : null;

                return (
                  <div 
                    key={item.id}
                    className="bg-white rounded-xl border border-gray-200 p-3.5 shadow-2xs hover:border-[#d65200]/60 hover:shadow-xs transition relative flex flex-col justify-between group"
                  >
                    {/* Card Top Pill & Actions */}
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wide flex items-center gap-1 ${
                          isVendor ? 'bg-orange-100 text-[#d65200]' : 'bg-blue-100 text-blue-700'
                        }`}>
                          {isVendor ? <Building2 className="w-3 h-3" /> : <Users className="w-3 h-3" />}
                          <span>{isVendor ? (vend?.category || 'Vendor') : (cust?.type || 'Customer')}</span>
                        </span>

                        <div className="flex items-center gap-1">
                          <span className="font-mono text-[10px] font-bold text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded border border-gray-200">
                            {item.code}
                          </span>

                          {/* Quick Edit Button */}
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(kind, item)}
                            className="p-1 rounded bg-orange-50 hover:bg-[#d65200] text-[#d65200] hover:text-white transition shadow-2xs"
                            title="Edit / Change Information"
                          >
                            <Edit3 className="w-3 h-3" />
                          </button>

                          {/* Quick Delete Button */}
                          <button
                            type="button"
                            onClick={() => handleDeletePartner(kind, item)}
                            className="p-1 rounded bg-rose-50 hover:bg-rose-600 text-rose-600 hover:text-white transition shadow-2xs"
                            title="Delete Partner Record"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      {/* Partner Name & Local Name */}
                      <h4 className="font-bold text-gray-900 text-sm leading-snug group-hover:text-[#d65200] transition-colors line-clamp-1">
                        {item.companyName}
                      </h4>
                      {item.thaiCompanyName && (
                        <p className="text-[11px] text-gray-500 font-medium truncate mt-0.5">
                          {item.thaiCompanyName}
                        </p>
                      )}

                      {/* Tax ID & Branch */}
                      <div className="mt-2 text-[11px] text-gray-600 space-y-0.5 bg-gray-50 p-2 rounded-lg border border-gray-100">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400">TIN / Tax ID:</span>
                          <span className="font-mono font-bold text-gray-800">{item.taxId || 'N/A'}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400">Branch:</span>
                          <span className="font-medium text-gray-700">{item.branchNumber === '00000' ? '00000 (Head Office)' : (item.branchNumber || 'Main')}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400">Contact Person:</span>
                          <span className="font-semibold text-gray-800 truncate max-w-[140px]">{item.contactPerson || 'General Desk'}</span>
                        </div>
                      </div>

                      {/* Contact Details */}
                      <div className="mt-2 text-[10px] text-gray-500 space-y-0.5">
                        {item.email && (
                          <div className="flex items-center gap-1.5 truncate">
                            <Mail className="w-3 h-3 text-gray-400 shrink-0" />
                            <span className="font-mono truncate">{item.email}</span>
                          </div>
                        )}
                        {item.phone && (
                          <div className="flex items-center gap-1.5">
                            <Phone className="w-3 h-3 text-gray-400 shrink-0" />
                            <span>{item.phone}</span>
                          </div>
                        )}
                        {item.address && (
                          <div className="flex items-center gap-1.5 truncate">
                            <MapPin className="w-3 h-3 text-gray-400 shrink-0" />
                            <span className="truncate">{item.address}, {item.country}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Bottom Status & Quick Action Toolbar */}
                    <div className="mt-3 pt-2.5 border-t border-gray-100 flex items-center justify-between gap-2">
                      <div>
                        <span className="text-[10px] text-gray-400 block leading-tight">
                          {isVendor ? 'AP Balance Due' : 'AR Outstanding'}
                        </span>
                        <span className={`text-xs font-bold font-mono ${
                          item.balance > 0 
                            ? (isVendor ? 'text-rose-600' : 'text-emerald-700') 
                            : 'text-gray-500'
                        }`}>
                          {formatCurrency(item.balance, item.currency)}
                        </span>
                      </div>

                      <div className="flex items-center gap-1">
                        {/* Edit Button */}
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(kind, item)}
                          className="px-2 py-1 rounded bg-gray-100 hover:bg-orange-100 text-gray-700 hover:text-[#d65200] font-bold text-[10px] flex items-center gap-1 transition"
                        >
                          <Edit3 className="w-2.5 h-2.5" />
                          <span>Edit</span>
                        </button>

                        {/* Link to Account */}
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedEntityForLink({ 
                              entityName: item.companyName, 
                              entityType: isVendor ? 'Vendor' : 'Customer' 
                            });
                            setIsAccountLinkerOpen(true);
                          }}
                          className="px-2 py-1 rounded bg-orange-50 hover:bg-[#d65200] text-[#d65200] hover:text-white font-bold text-[10px] flex items-center gap-1 transition shadow-2xs"
                          title="Link partner to General Ledger account"
                        >
                          <Link2 className="w-2.5 h-2.5" />
                          <span>Link GL</span>
                        </button>

                        {/* Quick Invoice or Bill */}
                        {isVendor ? (
                          <button
                            type="button"
                            onClick={() => setIsQuickJournalOpen(true)}
                            className="px-2 py-1 rounded bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white font-bold text-[10px] flex items-center gap-1 transition shadow-2xs"
                            title="Create a Purchase Bill / Journal for this vendor"
                          >
                            <Receipt className="w-2.5 h-2.5" />
                            <span>Bill</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setIsQuickInvoiceOpen(true)}
                            className="px-2 py-1 rounded bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white font-bold text-[10px] flex items-center gap-1 transition shadow-2xs"
                            title="Create a Sales Invoice for this customer"
                          >
                            <FileText className="w-2.5 h-2.5" />
                            <span>Invoice</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Dense Table Layout */
            <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 text-gray-600 font-bold border-b border-gray-200">
                  <tr>
                    <th className="py-2.5 px-3">Type</th>
                    <th className="py-2.5 px-3">Code</th>
                    <th className="py-2.5 px-3">Company Name / Entity</th>
                    <th className="py-2.5 px-3">Tax ID & Branch</th>
                    <th className="py-2.5 px-3">Contact & Phone</th>
                    <th className="py-2.5 px-3">Terms & Currency</th>
                    <th className="py-2.5 px-3 text-right">Balance</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredPartners.map(({ kind, item }) => {
                    const isVendor = kind === 'vendor';
                    return (
                      <tr key={item.id} className="hover:bg-orange-50/40 transition">
                        <td className="py-2 px-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            isVendor ? 'bg-orange-100 text-[#d65200]' : 'bg-blue-100 text-blue-700'
                          }`}>
                            {isVendor ? 'Vendor' : 'Customer'}
                          </span>
                        </td>
                        <td className="py-2 px-3 font-mono font-bold text-gray-600">{item.code}</td>
                        <td className="py-2 px-3">
                          <div className="font-bold text-gray-900">{item.companyName}</div>
                          {item.thaiCompanyName && <div className="text-[10px] text-gray-500">{item.thaiCompanyName}</div>}
                        </td>
                        <td className="py-2 px-3">
                          <div className="font-mono text-gray-800">{item.taxId || 'N/A'}</div>
                          <div className="text-[10px] text-gray-400">Br: {item.branchNumber || '00000'}</div>
                        </td>
                        <td className="py-2 px-3">
                          <div className="font-medium text-gray-800">{item.contactPerson || '-'}</div>
                          <div className="text-[10px] text-gray-500">{item.phone || item.email || '-'}</div>
                        </td>
                        <td className="py-2 px-3">
                          <span className="font-medium text-gray-700">{item.paymentTerms || 'Net 30'}</span>
                          <span className="text-[10px] text-gray-400 block font-mono">{item.currency}</span>
                        </td>
                        <td className="py-2 px-3 text-right">
                          <span className={`font-mono font-bold ${
                            item.balance > 0 
                              ? (isVendor ? 'text-rose-600' : 'text-emerald-700') 
                              : 'text-gray-500'
                          }`}>
                            {formatCurrency(item.balance, item.currency)}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              type="button"
                              onClick={() => handleOpenEdit(kind, item)}
                              className="p-1 rounded bg-orange-50 hover:bg-[#d65200] text-[#d65200] hover:text-white transition"
                              title="Edit information"
                            >
                              <Edit3 className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedEntityForLink({ 
                                  entityName: item.companyName, 
                                  entityType: isVendor ? 'Vendor' : 'Customer' 
                                });
                                setIsAccountLinkerOpen(true);
                              }}
                              className="p-1 rounded bg-gray-100 hover:bg-gray-800 text-gray-600 hover:text-white transition"
                              title="Link GL Account"
                            >
                              <Link2 className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeletePartner(kind, item)}
                              className="p-1 rounded bg-rose-50 hover:bg-rose-600 text-rose-600 hover:text-white transition"
                              title="Delete"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================
          ADD NEW PARTNER (VENDOR / CUSTOMER) MODAL
          ======================================================================== */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95">
            {/* Modal Header */}
            <div className="px-5 py-3.5 bg-gradient-to-r from-gray-900 to-gray-800 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-[#d65200] rounded-lg">
                  {formType === 'vendor' ? <Building2 className="w-4 h-4 text-white" /> : <Users className="w-4 h-4 text-white" />}
                </div>
                <div>
                  <h3 className="font-bold text-sm leading-tight">
                    Add New {formType === 'vendor' ? 'Vendor / Supplier' : 'Customer / Client'}
                  </h3>
                  <p className="text-[11px] text-gray-300 leading-none mt-0.5">
                    Register complete business profile, tax registration, and payment terms
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSaveAdd} className="p-5 overflow-y-auto space-y-4 text-xs flex-1">
              
              {/* Type Switcher */}
              <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg border border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setFormType('vendor');
                    setFormCode(`VEND-${Math.floor(1000 + Math.random() * 9000)}`);
                  }}
                  className={`flex-1 py-1.5 rounded-md font-bold text-xs transition flex items-center justify-center gap-1.5 ${
                    formType === 'vendor' ? 'bg-[#d65200] text-white shadow-2xs' : 'text-gray-700 hover:bg-white'
                  }`}
                >
                  <Building2 className="w-3.5 h-3.5" />
                  <span>Vendor (Accounts Payable)</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setFormType('customer');
                    setFormCode(`CUST-${Math.floor(1000 + Math.random() * 9000)}`);
                  }}
                  className={`flex-1 py-1.5 rounded-md font-bold text-xs transition flex items-center justify-center gap-1.5 ${
                    formType === 'customer' ? 'bg-blue-600 text-white shadow-2xs' : 'text-gray-700 hover:bg-white'
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Customer (Accounts Receivable)</span>
                </button>
              </div>

              {/* Section 1: Entity Name & Code */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block font-bold text-gray-700 mb-1">
                    Company / Trade Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formCompanyName}
                    onChange={(e) => setFormCompanyName(e.target.value)}
                    placeholder={formType === 'vendor' ? 'e.g. Silk Air Aviation Co., Ltd.' : 'e.g. Swiss Discovery Tours AG'}
                    className="w-full px-3 py-1.5 border border-gray-300 rounded-md font-semibold text-gray-900 focus:ring-1 focus:ring-[#d65200]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    Partner Code <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formCode}
                    onChange={(e) => setFormCode(e.target.value.toUpperCase())}
                    className="w-full px-3 py-1.5 border border-gray-300 rounded-md font-mono font-bold text-[#d65200] focus:ring-1 focus:ring-[#d65200]"
                  />
                </div>
              </div>

              {/* Section 2: Local / Thai / Khmer Name & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Local / Secondary Name (Thai / Khmer / Native)
                  </label>
                  <input
                    type="text"
                    value={formThaiName}
                    onChange={(e) => setFormThaiName(e.target.value)}
                    placeholder="e.g. บริษัท ซิลค์แอร์ จำกัด"
                    className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-gray-900 focus:ring-1 focus:ring-[#d65200]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    {formType === 'vendor' ? 'Supplier Category' : 'Customer Classification'}
                  </label>
                  {formType === 'vendor' ? (
                    <select
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value)}
                      className="w-full px-3 py-1.5 border border-gray-300 rounded-md bg-white text-gray-900 font-medium focus:ring-1 focus:ring-[#d65200]"
                    >
                      <option value="Hotel Supplier">Hotel Supplier</option>
                      <option value="Transport">Transport & Fleet</option>
                      <option value="Airline">Airline & Flight Logistics</option>
                      <option value="Tour Guide">Tour Guide & Activities</option>
                      <option value="IT & Office">IT & Office Hardware</option>
                      <option value="Legal & Audit">Legal & Audit Firm</option>
                    </select>
                  ) : (
                    <select
                      value={formCustomerType}
                      onChange={(e) => setFormCustomerType(e.target.value as Customer['type'])}
                      className="w-full px-3 py-1.5 border border-gray-300 rounded-md bg-white text-gray-900 font-medium focus:ring-1 focus:ring-[#d65200]"
                    >
                      <option value="B2B Travel Agent">B2B Travel Agent</option>
                      <option value="Corporate">Corporate Account</option>
                      <option value="FIT Tourist">FIT Individual Tourist</option>
                      <option value="MICE">MICE / Group Events</option>
                    </select>
                  )}
                </div>
              </div>

              {/* Section 3: Tax ID & Branch */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-gray-50 p-3 rounded-lg border border-gray-200">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    Tax Identification Number (TIN / 13-digit)
                  </label>
                  <input
                    type="text"
                    value={formTaxId}
                    onChange={(e) => setFormTaxId(e.target.value)}
                    placeholder="e.g. 0105558012345"
                    className="w-full px-3 py-1.5 border border-gray-300 rounded-md font-mono text-gray-900 focus:ring-1 focus:ring-[#d65200]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    Branch Identifier / Code
                  </label>
                  <input
                    type="text"
                    value={formBranchNumber}
                    onChange={(e) => setFormBranchNumber(e.target.value)}
                    placeholder="00000 (Head Office)"
                    className="w-full px-3 py-1.5 border border-gray-300 rounded-md font-mono text-gray-900 focus:ring-1 focus:ring-[#d65200]"
                  />
                </div>
              </div>

              {/* Section 4: Contact & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Primary Contact Person
                  </label>
                  <input
                    type="text"
                    value={formContactPerson}
                    onChange={(e) => setFormContactPerson(e.target.value)}
                    placeholder="e.g. Somchai Prasert"
                    className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-gray-900 focus:ring-1 focus:ring-[#d65200]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    placeholder="e.g. billing@partner.com"
                    className="w-full px-3 py-1.5 border border-gray-300 rounded-md font-mono text-gray-900 focus:ring-1 focus:ring-[#d65200]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Phone / Mobile
                  </label>
                  <input
                    type="text"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    placeholder="e.g. +66 2 123 4567"
                    className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-gray-900 focus:ring-1 focus:ring-[#d65200]"
                  />
                </div>
              </div>

              {/* Section 5: Address & Country */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-gray-700 mb-1">
                    Registered Billing Address
                  </label>
                  <input
                    type="text"
                    value={formAddress}
                    onChange={(e) => setFormAddress(e.target.value)}
                    placeholder="e.g. 128/9 Sukhumvit Rd, Khlong Toei, Bangkok"
                    className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-gray-900 focus:ring-1 focus:ring-[#d65200]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Country
                  </label>
                  <input
                    type="text"
                    value={formCountry}
                    onChange={(e) => setFormCountry(e.target.value)}
                    placeholder="Thailand"
                    className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-gray-900 focus:ring-1 focus:ring-[#d65200]"
                  />
                </div>
              </div>

              {/* Section 6: Terms, Currency & Limits */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-gray-50 p-3 rounded-lg border border-gray-200">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Payment Terms
                  </label>
                  <select
                    value={formPaymentTerms}
                    onChange={(e) => setFormPaymentTerms(e.target.value)}
                    className="w-full px-3 py-1.5 border border-gray-300 rounded-md bg-white text-gray-900 font-medium focus:ring-1 focus:ring-[#d65200]"
                  >
                    <option value="Immediate / COD">Immediate / Cash on Delivery</option>
                    <option value="Net 7 Days">Net 7 Days</option>
                    <option value="Net 15 Days">Net 15 Days</option>
                    <option value="Net 30 Days">Net 30 Days</option>
                    <option value="Net 60 Days">Net 60 Days</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Operating Currency
                  </label>
                  <select
                    value={formCurrency}
                    onChange={(e) => setFormCurrency(e.target.value as CurrencyCode)}
                    className="w-full px-3 py-1.5 border border-gray-300 rounded-md bg-white text-gray-900 font-medium focus:ring-1 focus:ring-[#d65200]"
                  >
                    <option value="USD">USD ($ - US Dollar)</option>
                    <option value="KHR">KHR (៛ - Cambodian Riel)</option>
                    <option value="THB">THB (฿ - Thai Baht)</option>
                    <option value="EUR">EUR (€ - Euro)</option>
                    <option value="GBP">GBP (£ - British Pound)</option>
                    <option value="SGD">SGD (S$ - Singapore Dollar)</option>
                  </select>
                </div>

                {formType === 'customer' ? (
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">
                      Credit Limit ($)
                    </label>
                    <input
                      type="number"
                      value={formCreditLimit}
                      onChange={(e) => setFormCreditLimit(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-1.5 border border-gray-300 rounded-md font-mono text-gray-900 focus:ring-1 focus:ring-[#d65200]"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">
                      Ledger Category
                    </label>
                    <span className="block px-3 py-1.5 bg-gray-200/80 rounded-md text-gray-700 font-mono text-xs">
                      2010 - Accounts Payable
                    </span>
                  </div>
                )}
              </div>

              {/* Modal Actions */}
              <div className="pt-3 border-t border-gray-200 flex items-center justify-end gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 font-semibold text-xs transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`px-4 py-2 text-white rounded-md font-bold text-xs shadow-xs flex items-center gap-1.5 transition ${
                    formType === 'vendor' ? 'bg-[#d65200] hover:bg-[#b84300]' : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save New {formType === 'vendor' ? 'Vendor' : 'Customer'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================
          EDIT / CHANGE INFORMATION MODAL (CAN EDIT ALL FIELDS)
          ======================================================================== */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95">
            {/* Modal Header */}
            <div className={`px-5 py-3.5 text-white flex items-center justify-between shrink-0 ${
              formType === 'vendor' ? 'bg-gradient-to-r from-[#d65200] to-orange-700' : 'bg-gradient-to-r from-blue-700 to-blue-900'
            }`}>
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-white/20 rounded-lg">
                  <Edit3 className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-sm leading-tight">
                    Edit & Change Information: {formCompanyName || 'Partner'}
                  </h3>
                  <p className="text-[11px] text-white/80 leading-none mt-0.5 font-mono">
                    {formType === 'vendor' ? 'Vendor Record' : 'Customer Record'} • Code: {formCode}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsEditModalOpen(false);
                  setEditingPartner(null);
                }}
                className="p-1 text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSaveEdit} className="p-5 overflow-y-auto space-y-4 text-xs flex-1">
              
              {/* Section 1: Entity Name & Code */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block font-bold text-gray-700 mb-1">
                    Company / Legal Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formCompanyName}
                    onChange={(e) => setFormCompanyName(e.target.value)}
                    className="w-full px-3 py-1.5 border border-gray-300 rounded-md font-semibold text-gray-900 focus:ring-1 focus:ring-[#d65200]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    Partner Code
                  </label>
                  <input
                    type="text"
                    required
                    value={formCode}
                    onChange={(e) => setFormCode(e.target.value.toUpperCase())}
                    className="w-full px-3 py-1.5 border border-gray-300 rounded-md font-mono font-bold text-[#d65200] focus:ring-1 focus:ring-[#d65200]"
                  />
                </div>
              </div>

              {/* Section 2: Local / Thai / Khmer Name & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Local / Native Name (Thai / Khmer / Secondary)
                  </label>
                  <input
                    type="text"
                    value={formThaiName}
                    onChange={(e) => setFormThaiName(e.target.value)}
                    placeholder="e.g. ชื่อบริษัทภาษาไทย / ខ្មែរ"
                    className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-gray-900 focus:ring-1 focus:ring-[#d65200]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    {formType === 'vendor' ? 'Supplier Category' : 'Customer Classification'}
                  </label>
                  {formType === 'vendor' ? (
                    <select
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value)}
                      className="w-full px-3 py-1.5 border border-gray-300 rounded-md bg-white text-gray-900 font-medium focus:ring-1 focus:ring-[#d65200]"
                    >
                      <option value="Hotel Supplier">Hotel Supplier</option>
                      <option value="Transport">Transport & Fleet</option>
                      <option value="Airline">Airline & Flight Logistics</option>
                      <option value="Tour Guide">Tour Guide & Activities</option>
                      <option value="IT & Office">IT & Office Hardware</option>
                      <option value="Legal & Audit">Legal & Audit Firm</option>
                    </select>
                  ) : (
                    <select
                      value={formCustomerType}
                      onChange={(e) => setFormCustomerType(e.target.value as Customer['type'])}
                      className="w-full px-3 py-1.5 border border-gray-300 rounded-md bg-white text-gray-900 font-medium focus:ring-1 focus:ring-[#d65200]"
                    >
                      <option value="B2B Travel Agent">B2B Travel Agent</option>
                      <option value="Corporate">Corporate Account</option>
                      <option value="FIT Tourist">FIT Individual Tourist</option>
                      <option value="MICE">MICE / Group Events</option>
                    </select>
                  )}
                </div>
              </div>

              {/* Section 3: Tax ID & Branch */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-gray-50 p-3 rounded-lg border border-gray-200">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    Tax Identification Number (TIN / 13-digit / VAT)
                  </label>
                  <input
                    type="text"
                    value={formTaxId}
                    onChange={(e) => setFormTaxId(e.target.value)}
                    className="w-full px-3 py-1.5 border border-gray-300 rounded-md font-mono font-bold text-gray-900 focus:ring-1 focus:ring-[#d65200]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    Branch Identifier / Number
                  </label>
                  <input
                    type="text"
                    value={formBranchNumber}
                    onChange={(e) => setFormBranchNumber(e.target.value)}
                    className="w-full px-3 py-1.5 border border-gray-300 rounded-md font-mono text-gray-900 focus:ring-1 focus:ring-[#d65200]"
                  />
                </div>
              </div>

              {/* Section 4: Contact & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Contact Person Name
                  </label>
                  <input
                    type="text"
                    value={formContactPerson}
                    onChange={(e) => setFormContactPerson(e.target.value)}
                    className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-gray-900 focus:ring-1 focus:ring-[#d65200]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    className="w-full px-3 py-1.5 border border-gray-300 rounded-md font-mono text-gray-900 focus:ring-1 focus:ring-[#d65200]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-gray-900 focus:ring-1 focus:ring-[#d65200]"
                  />
                </div>
              </div>

              {/* Section 5: Address & Country */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-gray-700 mb-1">
                    Official Address
                  </label>
                  <input
                    type="text"
                    value={formAddress}
                    onChange={(e) => setFormAddress(e.target.value)}
                    className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-gray-900 focus:ring-1 focus:ring-[#d65200]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Country
                  </label>
                  <input
                    type="text"
                    value={formCountry}
                    onChange={(e) => setFormCountry(e.target.value)}
                    className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-gray-900 focus:ring-1 focus:ring-[#d65200]"
                  />
                </div>
              </div>

              {/* Section 6: Payment Terms & Currency */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-gray-50 p-3 rounded-lg border border-gray-200">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Payment Terms
                  </label>
                  <select
                    value={formPaymentTerms}
                    onChange={(e) => setFormPaymentTerms(e.target.value)}
                    className="w-full px-3 py-1.5 border border-gray-300 rounded-md bg-white text-gray-900 font-medium focus:ring-1 focus:ring-[#d65200]"
                  >
                    <option value="Immediate / COD">Immediate / Cash on Delivery</option>
                    <option value="Net 7 Days">Net 7 Days</option>
                    <option value="Net 15 Days">Net 15 Days</option>
                    <option value="Net 30 Days">Net 30 Days</option>
                    <option value="Net 60 Days">Net 60 Days</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Default Currency
                  </label>
                  <select
                    value={formCurrency}
                    onChange={(e) => setFormCurrency(e.target.value as CurrencyCode)}
                    className="w-full px-3 py-1.5 border border-gray-300 rounded-md bg-white text-gray-900 font-medium focus:ring-1 focus:ring-[#d65200]"
                  >
                    <option value="USD">USD ($ - US Dollar)</option>
                    <option value="KHR">KHR (៛ - Cambodian Riel)</option>
                    <option value="THB">THB (฿ - Thai Baht)</option>
                    <option value="EUR">EUR (€ - Euro)</option>
                    <option value="GBP">GBP (£ - British Pound)</option>
                    <option value="SGD">SGD (S$ - Singapore Dollar)</option>
                  </select>
                </div>

                {formType === 'customer' ? (
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">
                      Credit Limit ($)
                    </label>
                    <input
                      type="number"
                      value={formCreditLimit}
                      onChange={(e) => setFormCreditLimit(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-1.5 border border-gray-300 rounded-md font-mono text-gray-900 focus:ring-1 focus:ring-[#d65200]"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">
                      Associated GL Account
                    </label>
                    <span className="block px-3 py-1.5 bg-gray-200/80 rounded-md text-gray-700 font-mono text-xs">
                      2010 - Accounts Payable
                    </span>
                  </div>
                )}
              </div>

              {/* Modal Actions */}
              <div className="pt-3 border-t border-gray-200 flex items-center justify-between shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    if (editingPartner) {
                      handleDeletePartner(editingPartner.type, editingPartner.data);
                      setIsEditModalOpen(false);
                    }
                  }}
                  className="px-3 py-2 bg-rose-50 hover:bg-rose-600 text-rose-600 hover:text-white rounded-md font-bold text-xs flex items-center gap-1.5 transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Record</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditModalOpen(false);
                      setEditingPartner(null);
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 font-semibold text-xs transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#d65200] hover:bg-[#b84300] text-white rounded-md font-bold text-xs shadow-xs flex items-center gap-1.5 transition"
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
