import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Check, 
  X, 
  Globe, 
  Mail, 
  Phone, 
  FileText, 
  ShieldCheck, 
  Save, 
  RotateCcw,
  CheckCircle2,
  Calendar,
  Layers,
  MapPin
} from 'lucide-react';
import { useAccounting } from '../context/AccountingContext';
import { CompanyProfile, CurrencyCode } from '../types';
import { INITIAL_COMPANY_PROFILE } from '../data/mockAccountingData';

export const CompanySetupModal: React.FC = () => {
  const { 
    companyProfile, 
    updateCompanyProfile, 
    isCompanySetupModalOpen, 
    setIsCompanySetupModalOpen,
    currentUser
  } = useAccounting();

  const [formData, setFormData] = useState<CompanyProfile>(companyProfile);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (isCompanySetupModalOpen) {
      setFormData(companyProfile);
      setSaveSuccess(false);
    }
  }, [isCompanySetupModalOpen, companyProfile]);

  if (!isCompanySetupModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('Company Registered Name is required.');
      return;
    }
    if (!formData.taxId.trim()) {
      alert('Tax Identification Number is required.');
      return;
    }

    updateCompanyProfile(formData);
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      setIsCompanySetupModalOpen(false);
    }, 1000);
  };

  const handleResetToDefaults = () => {
    if (window.confirm('Reset company profile parameters to system default settings?')) {
      setFormData(INITIAL_COMPANY_PROFILE);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full p-6 shadow-2xl animate-in fade-in-50 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-gray-200">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-orange-100 text-[#d65200] rounded-lg">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">
                Company Legal Entity Setup & Configuration
              </h3>
              <p className="text-xs text-gray-500 font-sans">
                Manage registered corporate information, Tax ID, branch identifiers, and statutory preferences
              </p>
            </div>
          </div>
          <button 
            onClick={() => setIsCompanySetupModalOpen(false)}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-md hover:bg-gray-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {saveSuccess && (
          <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-md flex items-center gap-2 font-semibold text-xs animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Company setup parameters successfully updated and synced across all modules!</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
          {/* Header Brand & System Display Customization */}
          <div className="bg-gradient-to-r from-orange-50/60 to-amber-50/40 p-3.5 rounded-lg border border-orange-200 space-y-3">
            <div className="flex items-center justify-between border-b border-orange-200/80 pb-2">
              <div className="flex items-center gap-1.5 text-gray-900 font-bold text-xs">
                <Building2 className="w-4 h-4 text-[#d65200]" />
                <span>Header Brand & System Title Configuration</span>
              </div>
              <span className="text-[10px] font-semibold text-[#d65200] bg-orange-100 px-2 py-0.5 rounded">
                Admin Customizable
              </span>
            </div>

            {/* Live Visual Header Preview Box */}
            <div className="bg-white p-2.5 rounded-md border border-gray-200 shadow-2xs">
              <div className="text-[10px] uppercase font-bold text-gray-400 mb-1.5 flex items-center justify-between">
                <span>Live Header Identity Preview:</span>
                <span className="text-[9px] text-gray-500 font-normal">Updates top bar instantly</span>
              </div>
              <div className="flex items-center gap-3 bg-[#f8f9fa] p-2 rounded border border-gray-200 select-none">
                <div className="flex flex-col leading-tight">
                  <span className="text-[10px] tracking-wider font-semibold text-gray-500 uppercase">
                    {formData.systemEdition || 'Enterprise'}
                  </span>
                  <span className="text-lg font-bold text-gray-900 tracking-tight flex items-center">
                    {formData.shortName || 'Suite'}
                  </span>
                </div>

                <div className="h-6 w-px bg-gray-300 mx-1"></div>

                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-md bg-[#e65c00] flex items-center justify-center text-white shadow-xs font-black text-sm uppercase">
                    {formData.logoInitial || (formData.shortName ? formData.shortName.charAt(0).toUpperCase() : 'S')}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-black text-[#d65200] tracking-tight uppercase font-sans leading-none">
                      {formData.shortName || 'Suite'}
                    </span>
                    <span className="text-[9px] font-medium text-gray-500 uppercase tracking-widest leading-none mt-0.5">
                      {formData.systemSubtitle || 'Accounting & ERP'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Brand / App Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.shortName || ''}
                  onChange={(e) => setFormData({ ...formData, shortName: e.target.value })}
                  placeholder="e.g. Suite"
                  className="w-full px-3 py-1.5 border border-gray-300 rounded font-bold text-gray-900 focus:ring-1 focus:ring-[#d65200]"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  System Edition Label
                </label>
                <input
                  type="text"
                  value={formData.systemEdition || ''}
                  onChange={(e) => setFormData({ ...formData, systemEdition: e.target.value })}
                  placeholder="e.g. Enterprise"
                  className="w-full px-3 py-1.5 border border-gray-300 rounded font-medium text-gray-900 focus:ring-1 focus:ring-[#d65200]"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Header Subtitle / Tagline
                </label>
                <input
                  type="text"
                  value={formData.systemSubtitle || ''}
                  onChange={(e) => setFormData({ ...formData, systemSubtitle: e.target.value })}
                  placeholder="e.g. Accounting & ERP"
                  className="w-full px-3 py-1.5 border border-gray-300 rounded font-medium text-gray-900 focus:ring-1 focus:ring-[#d65200]"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Logo Initial / Monogram
                </label>
                <input
                  type="text"
                  maxLength={3}
                  value={formData.logoInitial || ''}
                  onChange={(e) => setFormData({ ...formData, logoInitial: e.target.value.toUpperCase() })}
                  placeholder="e.g. S"
                  className="w-full px-3 py-1.5 border border-gray-300 rounded font-bold text-center uppercase font-mono text-gray-900 focus:ring-1 focus:ring-[#d65200]"
                />
              </div>
            </div>
          </div>

          {/* Section 1: Legal Registration */}
          <div className="bg-gray-50/80 p-3.5 rounded-lg border border-gray-200 space-y-3">
            <div className="flex items-center gap-1.5 text-gray-800 font-bold border-b border-gray-200 pb-1.5 text-xs">
              <FileText className="w-4 h-4 text-[#d65200]" />
              <span>Legal Registration & Entity Identity</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Registered Legal Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Suite Co., Ltd."
                  className="w-full px-3 py-1.5 border border-gray-300 rounded font-medium text-gray-900 focus:ring-1 focus:ring-[#d65200]"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Tax Identification Number (13 Digits / TIN) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.taxId}
                  onChange={(e) => setFormData({ ...formData, taxId: e.target.value })}
                  placeholder="e.g. 0105542099388"
                  className="w-full px-3 py-1.5 border border-gray-300 rounded font-mono font-bold text-[#d65200] focus:ring-1 focus:ring-[#d65200]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Branch Code / Headquarter Identifier
                </label>
                <input
                  type="text"
                  value={formData.branchNumber}
                  onChange={(e) => setFormData({ ...formData, branchNumber: e.target.value })}
                  placeholder="e.g. 00000 (Headquarters)"
                  className="w-full px-3 py-1.5 border border-gray-300 rounded font-mono text-gray-900 focus:ring-1 focus:ring-[#d65200]"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Commercial Registration No.
                </label>
                <input
                  type="text"
                  value={formData.registrationNumber}
                  onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value })}
                  placeholder="e.g. 0105542099388"
                  className="w-full px-3 py-1.5 border border-gray-300 rounded font-mono text-gray-900 focus:ring-1 focus:ring-[#d65200]"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">
                Industry / Business Classification
              </label>
              <input
                type="text"
                value={formData.industry}
                onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                placeholder="e.g. Enterprise Services & Financial Operations"
                className="w-full px-3 py-1.5 border border-gray-300 rounded text-gray-900 focus:ring-1 focus:ring-[#d65200]"
              />
            </div>
          </div>

          {/* Section 2: Address & Contact */}
          <div className="bg-gray-50/80 p-3.5 rounded-lg border border-gray-200 space-y-3">
            <div className="flex items-center gap-1.5 text-gray-800 font-bold border-b border-gray-200 pb-1.5 text-xs">
              <MapPin className="w-4 h-4 text-blue-600" />
              <span>Registered Headquarters Address & Contact Details</span>
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">
                Official Registered Address (Appears on Tax Invoices & Reports) <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={2}
                required
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Building, Street, District, Province, Postal Code, Country"
                className="w-full px-3 py-1.5 border border-gray-300 rounded text-gray-900 focus:ring-1 focus:ring-[#d65200]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Telephone / Switchboard
                </label>
                <div className="relative">
                  <Phone className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2" />
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+66 2 655 8900"
                    className="w-full pl-8 pr-3 py-1.5 border border-gray-300 rounded text-gray-900 focus:ring-1 focus:ring-[#d65200]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Accounting Email
                </label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="accounting@company.com"
                    className="w-full pl-8 pr-3 py-1.5 border border-gray-300 rounded text-gray-900 focus:ring-1 focus:ring-[#d65200]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Company Website
                </label>
                <div className="relative">
                  <Globe className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2" />
                  <input
                    type="text"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    placeholder="https://company.com"
                    className="w-full pl-8 pr-3 py-1.5 border border-gray-300 rounded text-gray-900 focus:ring-1 focus:ring-[#d65200]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Financial & Statutory Preferences */}
          <div className="bg-gray-50/80 p-3.5 rounded-lg border border-gray-200 space-y-3">
            <div className="flex items-center gap-1.5 text-gray-800 font-bold border-b border-gray-200 pb-1.5 text-xs">
              <Calendar className="w-4 h-4 text-emerald-600" />
              <span>Accounting & Fiscal Policy Preferences</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Fiscal Year End
                </label>
                <select
                  value={formData.fiscalYearEnd}
                  onChange={(e) => setFormData({ ...formData, fiscalYearEnd: e.target.value })}
                  className="w-full px-3 py-1.5 border border-gray-300 rounded bg-white font-medium text-gray-900 focus:ring-1 focus:ring-[#d65200]"
                >
                  <option value="31 December">31 December (Calendar Year)</option>
                  <option value="31 March">31 March</option>
                  <option value="30 June">30 June</option>
                  <option value="30 September">30 September</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Functional Base Ledger Currency
                </label>
                <select
                  value={formData.baseCurrency}
                  onChange={(e) => setFormData({ ...formData, baseCurrency: e.target.value as CurrencyCode })}
                  className="w-full px-3 py-1.5 border border-gray-300 rounded bg-white font-medium text-gray-900 focus:ring-1 focus:ring-[#d65200]"
                >
                  <option value="USD">USD ($) - US Dollar (Default Primary)</option>
                  <option value="EUR">EUR (€) - Euro</option>
                  <option value="GBP">GBP (£) - British Pound</option>
                  <option value="SGD">SGD (S$) - Singapore Dollar</option>
                  <option value="THB">THB (฿) - Thai Baht</option>
                </select>
              </div>
            </div>
          </div>

          {/* Modal Actions */}
          <div className="pt-3 border-t border-gray-200 flex items-center justify-between">
            <button
              type="button"
              onClick={handleResetToDefaults}
              className="px-3 py-1.5 border border-gray-300 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded text-xs font-semibold flex items-center gap-1 transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Defaults</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsCompanySetupModalOpen(false)}
                className="px-4 py-1.5 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 font-semibold text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-[#d65200] hover:bg-[#bf4700] text-white rounded font-bold shadow-xs text-xs flex items-center gap-1.5 transition"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Company Setup</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
