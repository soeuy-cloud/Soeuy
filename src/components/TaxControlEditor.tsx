import React, { useState } from 'react';
import { 
  Percent, 
  Globe2, 
  Sliders, 
  Plus, 
  Trash2, 
  Edit3, 
  RotateCcw, 
  Check, 
  Info, 
  Search, 
  Calculator, 
  ShieldCheck, 
  Building, 
  Receipt,
  FileCheck,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  X,
  Crown,
  Sparkles,
  ExternalLink,
  Hotel,
  Users,
  Calendar,
  Award,
  Wallet,
  DollarSign,
  Bed,
  Layers,
  Landmark,
  FileText
} from 'lucide-react';
import { useAccounting } from '../context/AccountingContext';
import { TaxCode, CountryTaxJurisdiction, CurrencyCode, TaxCategory, TaxType } from '../types';

export const TaxControlEditor: React.FC = () => {
  const {
    taxCodes,
    addTaxCode,
    updateTaxCode,
    deleteTaxCode,
    countryJurisdictions,
    addCountryJurisdiction,
    updateCountryJurisdiction,
    deleteCountryJurisdiction,
    activeJurisdictionId,
    activeJurisdiction,
    setActiveJurisdictionId,
    applyCountryTaxPreset,
    resetTaxCodesToDefaults,
    formatCurrency,
    currentCurrency,
    currentUser,
    setCurrentUser,
    users
  } = useAccounting();

  // Admin status check
  const isAdmin = Boolean(currentUser?.isAdmin || currentUser?.role?.includes('Admin'));

  // Filters and UI states
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('ALL');
  const [selectedCountryFilter, setSelectedCountryFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [editingTaxCode, setEditingTaxCode] = useState<TaxCode | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Country Tax Jurisdiction Add/Edit Modal State
  const [isJurisdictionModalOpen, setIsJurisdictionModalOpen] = useState<boolean>(false);
  const [editingJurisdiction, setEditingJurisdiction] = useState<CountryTaxJurisdiction | null>(null);
  const [jurisdictionFormData, setJurisdictionFormData] = useState<Omit<CountryTaxJurisdiction, 'id'>>({
    countryName: '',
    countryCode: '',
    flag: '🌐',
    taxAuthority: '',
    taxSystemName: 'VAT (Value Added Tax)',
    standardVatRate: 0.10,
    defaultWhtServiceRate: 0.05,
    defaultWhtRentRate: 0.05,
    taxIdFormat: 'TAX-123456789',
    currency: 'USD',
    notes: ''
  });

  // Live simulation calculator state
  const [simRegime, setSimRegime] = useState<'INVOICE' | 'HOTEL' | 'PAYROLL' | 'CORP_INCOME'>('INVOICE');
  const [simBaseAmount, setSimBaseAmount] = useState<number>(1000);
  const [simTaxCodeId, setSimTaxCodeId] = useState<string>('');
  const [simWhtRate, setSimWhtRate] = useState<number>(0);
  
  // Hotel accommodation simulation state
  const [hotelRoomRate, setHotelRoomRate] = useState<number>(150);
  const [hotelNights, setHotelNights] = useState<number>(3);
  const [hotelIncludePLT, setHotelIncludePLT] = useState<boolean>(true);

  // Payroll salary tax simulation state
  const [payrollGrossSalary, setPayrollGrossSalary] = useState<number>(1200);
  const [payrollFringeBenefits, setPayrollFringeBenefits] = useState<number>(200);
  const [payrollIsNonResident, setPayrollIsNonResident] = useState<boolean>(false);

  // New tax code form state
  const [formData, setFormData] = useState<Omit<TaxCode, 'id'>>({
    code: '',
    name: '',
    thaiName: '',
    rate: 0.10,
    type: 'VAT_Output',
    category: 'VAT',
    country: activeJurisdiction?.countryName.split(' ')[0] || 'Cambodia',
    description: '',
    isActive: true
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Quick rate stepper for tax codes
  const handleRateStep = (taxCode: TaxCode, delta: number) => {
    const newRate = Math.max(0, Math.min(1, Math.round((taxCode.rate + delta) * 1000) / 1000));
    updateTaxCode(taxCode.id, { 
      rate: newRate,
      name: taxCode.name.replace(/\d+(\.\d+)?%/, `${(newRate * 100).toFixed(newRate % 0.01 === 0 ? 0 : 1)}%`)
    });
    showToast(`Updated ${taxCode.code} rate to ${(newRate * 100).toFixed(1)}%`);
  };

  // Direct percentage change for tax codes
  const handleDirectRateChange = (taxCode: TaxCode, percentValue: number) => {
    const rate = Math.max(0, Math.min(1, percentValue / 100));
    updateTaxCode(taxCode.id, { rate });
  };

  // Direct rate adjustment for country jurisdiction
  const handleJurisdictionRateChange = (jur: CountryTaxJurisdiction, percentValue: number) => {
    const rate = Math.max(0, Math.min(1, percentValue / 100));
    updateCountryJurisdiction(jur.id, { standardVatRate: rate });
    showToast(`Adjusted ${jur.countryName} standard rate to ${percentValue.toFixed(1)}%`);
  };

  const handleJurisdictionRateStep = (jur: CountryTaxJurisdiction, deltaPercent: number) => {
    const currentPercent = jur.standardVatRate * 100;
    const newPercent = Math.max(0, Math.min(100, Math.round((currentPercent + deltaPercent) * 10) / 10));
    handleJurisdictionRateChange(jur, newPercent);
  };

  // Open modal to add new jurisdiction
  const handleOpenAddJurisdiction = () => {
    setEditingJurisdiction(null);
    setJurisdictionFormData({
      countryName: '',
      countryCode: '',
      flag: '🌐',
      taxAuthority: '',
      taxSystemName: 'VAT (Value Added Tax)',
      standardVatRate: 0.10,
      defaultWhtServiceRate: 0.05,
      defaultWhtRentRate: 0.05,
      taxIdFormat: 'TAX-00000000',
      currency: 'USD',
      notes: ''
    });
    setIsJurisdictionModalOpen(true);
  };

  // Open modal to edit existing jurisdiction
  const handleOpenEditJurisdiction = (jur: CountryTaxJurisdiction, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingJurisdiction(jur);
    setJurisdictionFormData({
      countryName: jur.countryName,
      countryCode: jur.countryCode,
      flag: jur.flag || '🌐',
      taxAuthority: jur.taxAuthority,
      taxSystemName: jur.taxSystemName,
      standardVatRate: jur.standardVatRate,
      defaultWhtServiceRate: jur.defaultWhtServiceRate || 0.05,
      defaultWhtRentRate: jur.defaultWhtRentRate || 0.05,
      taxIdFormat: jur.taxIdFormat,
      currency: jur.currency,
      notes: jur.notes
    });
    setIsJurisdictionModalOpen(true);
  };

  // Handle save country jurisdiction
  const handleSaveJurisdiction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!jurisdictionFormData.countryName.trim()) {
      alert('Please enter a country or jurisdiction name.');
      return;
    }

    if (editingJurisdiction) {
      updateCountryJurisdiction(editingJurisdiction.id, jurisdictionFormData);
      showToast(`Updated country jurisdiction: ${jurisdictionFormData.countryName}`);
      setEditingJurisdiction(null);
    } else {
      const created = addCountryJurisdiction(jurisdictionFormData);
      applyCountryTaxPreset(created.id);
      showToast(`Created & applied country tax regime for ${jurisdictionFormData.countryName}`);
    }
    setIsJurisdictionModalOpen(false);
  };

  // Quick switch to admin user if needed
  const handleElevateToAdmin = () => {
    const adminUser = users.find(u => u.isAdmin);
    if (adminUser) {
      setCurrentUser(adminUser);
      showToast(`Switched active user to ${adminUser.name} (Administrator)`);
    }
  };

  // Handle save new or edit tax code
  const handleSaveTaxCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.code.trim() || !formData.name.trim()) return;

    if (editingTaxCode) {
      updateTaxCode(editingTaxCode.id, formData);
      showToast(`Updated tax code ${formData.code}`);
      setEditingTaxCode(null);
    } else {
      addTaxCode(formData);
      showToast(`Created tax code ${formData.code} (${(formData.rate * 100).toFixed(1)}%)`);
      setIsAddModalOpen(false);
    }

    // Reset form
    setFormData({
      code: '',
      name: '',
      thaiName: '',
      rate: 0.10,
      type: 'VAT_Output',
      category: 'VAT',
      country: activeJurisdiction?.countryName.split(' ')[0] || 'Cambodia',
      description: '',
      isActive: true
    });
  };

  // Categorize tax helper
  const getTaxCategory = (tc: TaxCode): TaxCategory => {
    if (tc.category) return tc.category;
    if (tc.type === 'VAT_Output' || tc.type === 'VAT_Input' || tc.type === 'Zero_Rated' || tc.type === 'Exempt' || tc.type === 'Sales_Tax') return 'VAT';
    if (tc.type === 'Income_Tax' || tc.type === 'Income_Prepayment' || tc.type === 'Minimum_Tax' || tc.code.includes('CIT') || tc.code.includes('MIN-TAX')) return 'Income_Tax';
    if (tc.type === 'Withholding_Tax' || tc.type === 'WHT_PND3' || tc.type === 'WHT_PND53' || tc.code.startsWith('WHT')) return 'Withholding_Tax';
    if (tc.type === 'Accommodation_Tax' || tc.type === 'Public_Lighting_Tax' || tc.code.includes('ACCOM') || tc.code.includes('PLT')) return 'Accommodation_Tax';
    if (tc.type === 'Annual_Tax' || tc.type === 'Patent_Tax' || tc.code.includes('PATENT') || tc.code.includes('ANNUAL')) return 'Annual_Tax';
    if (tc.type === 'Salary_Tax' || tc.type === 'Fringe_Benefit_Tax' || tc.code.startsWith('TOS') || tc.code.includes('FBT')) return 'Salary_Tax';
    return 'Other';
  };

  // Category counts
  const categoryCounts = {
    ALL: taxCodes.length,
    VAT: taxCodes.filter(tc => getTaxCategory(tc) === 'VAT').length,
    Income_Tax: taxCodes.filter(tc => getTaxCategory(tc) === 'Income_Tax').length,
    Withholding_Tax: taxCodes.filter(tc => getTaxCategory(tc) === 'Withholding_Tax').length,
    Accommodation_Tax: taxCodes.filter(tc => getTaxCategory(tc) === 'Accommodation_Tax').length,
    Annual_Tax: taxCodes.filter(tc => getTaxCategory(tc) === 'Annual_Tax').length,
    Salary_Tax: taxCodes.filter(tc => getTaxCategory(tc) === 'Salary_Tax').length,
  };

  // Filter tax codes
  const filteredTaxCodes = taxCodes.filter(tc => {
    const matchesSearch = 
      tc.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (tc.thaiName && tc.thaiName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (tc.description && tc.description.toLowerCase().includes(searchQuery.toLowerCase()));

    const category = getTaxCategory(tc);
    const matchesType = 
      selectedTypeFilter === 'ALL' ? true :
      selectedTypeFilter === 'VAT' ? category === 'VAT' :
      selectedTypeFilter === 'INCOME_TAX' ? category === 'Income_Tax' :
      selectedTypeFilter === 'WHT' ? category === 'Withholding_Tax' :
      selectedTypeFilter === 'ACCOMMODATION_TAX' ? category === 'Accommodation_Tax' :
      selectedTypeFilter === 'ANNUAL_TAX' ? category === 'Annual_Tax' :
      selectedTypeFilter === 'SALARY_TAX' ? category === 'Salary_Tax' :
      category === selectedTypeFilter;

    const matchesCountry = 
      selectedCountryFilter === 'ALL' ? true :
      tc.country?.toLowerCase() === selectedCountryFilter.toLowerCase() ||
      (!tc.country && selectedCountryFilter === 'Global');

    return matchesSearch && matchesType && matchesCountry;
  });

  // Calculate selected simulator code for Invoice
  const activeSimTaxCode = taxCodes.find(tc => tc.id === simTaxCodeId) || 
    taxCodes.find(tc => tc.type === 'VAT_Output' && tc.isActive) || 
    taxCodes[0];

  const simVatRate = activeSimTaxCode ? activeSimTaxCode.rate : 0.10;
  const simVatAmount = simBaseAmount * simVatRate;
  const simWhtAmount = simBaseAmount * simWhtRate;
  const simGrossTotal = simBaseAmount + simVatAmount;
  const simNetPayable = simGrossTotal - simWhtAmount;

  // Hotel accommodation calculations
  const hotelTotalRoomRevenue = hotelRoomRate * hotelNights;
  const hotelAccomTaxRate = (taxCodes.find(tc => tc.type === 'Accommodation_Tax' && tc.isActive)?.rate ?? 0.02);
  const hotelAccomTaxAmount = hotelTotalRoomRevenue * hotelAccomTaxRate;
  const hotelVatRate = activeJurisdiction.standardVatRate;
  const hotelVatAmount = hotelTotalRoomRevenue * hotelVatRate;
  const hotelPltRate = hotelIncludePLT ? (taxCodes.find(tc => tc.type === 'Public_Lighting_Tax')?.rate ?? 0.03) : 0;
  const hotelPltAmount = hotelIncludePLT ? hotelTotalRoomRevenue * hotelPltRate : 0;
  const hotelTotalGuestBill = hotelTotalRoomRevenue + hotelAccomTaxAmount + hotelVatAmount + hotelPltAmount;

  // Salary progressive tax calculation
  const calculateSalaryTax = (salary: number, isNonRes: boolean): { tax: number; effectiveRate: number; brackets: { tier: string; rate: string; taxable: number; tax: number }[] } => {
    if (isNonRes) {
      const tax = salary * 0.20;
      return {
        tax,
        effectiveRate: 0.20,
        brackets: [{ tier: 'Non-Resident Flat', rate: '20%', taxable: salary, tax }]
      };
    }

    // Cambodian Progressive Brackets (in USD equivalents approx 4000 KHR = $1 USD)
    // Tier 1: $0 - $375 (0%)
    // Tier 2: $376 - $500 (5%)
    // Tier 3: $501 - $2,125 (10%)
    // Tier 4: $2,126 - $3,125 (15%)
    // Tier 5: > $3,125 (20%)
    const tiers = [
      { max: 375, rate: 0.00, label: 'Tier 1: $0 - $375 (0% Exempt)' },
      { max: 500, rate: 0.05, label: 'Tier 2: $376 - $500 (5%)' },
      { max: 2125, rate: 0.10, label: 'Tier 3: $501 - $2,125 (10%)' },
      { max: 3125, rate: 0.15, label: 'Tier 4: $2,126 - $3,125 (15%)' },
      { max: Infinity, rate: 0.20, label: 'Tier 5: > $3,125 (20%)' }
    ];

    let remaining = salary;
    let totalTax = 0;
    let prevMax = 0;
    const bracketBreakdown = [];

    for (const tier of tiers) {
      if (salary > prevMax) {
        const taxableInTier = Math.min(salary - prevMax, tier.max - prevMax);
        const taxInTier = taxableInTier * tier.rate;
        totalTax += taxInTier;
        if (taxableInTier > 0) {
          bracketBreakdown.push({
            tier: tier.label,
            rate: `${(tier.rate * 100).toFixed(0)}%`,
            taxable: taxableInTier,
            tax: taxInTier
          });
        }
      }
      prevMax = tier.max;
    }

    return {
      tax: totalTax,
      effectiveRate: salary > 0 ? totalTax / salary : 0,
      brackets: bracketBreakdown
    };
  };

  const salaryTaxResult = calculateSalaryTax(payrollGrossSalary, payrollIsNonResident);
  const fbtRate = 0.20;
  const fbtAmount = payrollFringeBenefits * fbtRate;
  const netTakeHomeSalary = payrollGrossSalary - salaryTaxResult.tax;

  return (
    <div id="tax-control-editor-container" className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white px-4 py-2.5 rounded-lg shadow-xl text-xs font-semibold flex items-center gap-2 border border-gray-700 animate-in fade-in slide-in-from-bottom-2">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Header Card */}
      <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg bg-orange-100 text-[#d65200] flex items-center justify-center font-bold">
                <Percent className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  Country Tax Control & Statutory Rate Editor
                  <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold border border-emerald-200">
                    6 Core Statutory Taxes Active
                  </span>
                </h1>
                <p className="text-xs text-gray-500">
                  Manage VAT, Corporate Income Tax, Withholding Tax (WHT), Accommodation Tax (Hotel/Tourism), Annual Patent Tax, and Salary Tax (Payroll).
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={resetTaxCodesToDefaults}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded text-xs font-semibold transition border border-gray-300"
              title="Reset all tax codes and rates to statutory baseline defaults"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Statutory Defaults</span>
            </button>
            <button
              onClick={() => {
                setEditingTaxCode(null);
                setFormData({
                  code: '',
                  name: '',
                  thaiName: '',
                  rate: activeJurisdiction.standardVatRate,
                  type: 'VAT_Output',
                  category: 'VAT',
                  country: activeJurisdiction.countryName.split(' ')[0],
                  description: '',
                  isActive: true
                });
                setIsAddModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#d65200] hover:bg-[#bf4700] text-white rounded text-xs font-bold shadow-2xs transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Add Tax Code</span>
            </button>
          </div>
        </div>

        {/* 6 Core Tax Badges Ribbon */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 mt-5 pt-4 border-t border-gray-100">
          <div 
            onClick={() => setSelectedTypeFilter('VAT')}
            className={`p-2.5 rounded-lg border cursor-pointer transition ${
              selectedTypeFilter === 'VAT' 
                ? 'bg-blue-50 border-blue-400 ring-2 ring-blue-300' 
                : 'bg-blue-50/40 border-blue-200/80 hover:bg-blue-50'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-900">1. VAT / GST</span>
              <Receipt className="w-3.5 h-3.5 text-blue-700" />
            </div>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="text-base font-bold text-blue-700 font-mono">{(activeJurisdiction.standardVatRate * 100).toFixed(0)}%</span>
              <span className="text-[10px] text-gray-500">Output/Input</span>
            </div>
            <span className="text-[9px] text-blue-800 font-medium block truncate">Sales & Purchases</span>
          </div>

          <div 
            onClick={() => setSelectedTypeFilter('INCOME_TAX')}
            className={`p-2.5 rounded-lg border cursor-pointer transition ${
              selectedTypeFilter === 'INCOME_TAX' 
                ? 'bg-emerald-50 border-emerald-400 ring-2 ring-emerald-300' 
                : 'bg-emerald-50/40 border-emerald-200/80 hover:bg-emerald-50'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-900">2. Income Tax</span>
              <TrendingUp className="w-3.5 h-3.5 text-emerald-700" />
            </div>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="text-base font-bold text-emerald-700 font-mono">20%</span>
              <span className="text-[10px] text-gray-500">+1% Prepay</span>
            </div>
            <span className="text-[9px] text-emerald-800 font-medium block truncate">Corporate Profit & CIT</span>
          </div>

          <div 
            onClick={() => setSelectedTypeFilter('WHT')}
            className={`p-2.5 rounded-lg border cursor-pointer transition ${
              selectedTypeFilter === 'WHT' 
                ? 'bg-purple-50 border-purple-400 ring-2 ring-purple-300' 
                : 'bg-purple-50/40 border-purple-200/80 hover:bg-purple-50'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-900">3. Withholding</span>
              <ShieldCheck className="w-3.5 h-3.5 text-purple-700" />
            </div>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="text-base font-bold text-purple-700 font-mono">{((activeJurisdiction.defaultWhtServiceRate || 0.14) * 100).toFixed(0)}%</span>
              <span className="text-[10px] text-gray-500">Services</span>
            </div>
            <span className="text-[9px] text-purple-800 font-medium block truncate">14% / 10% / 15% Slabs</span>
          </div>

          <div 
            onClick={() => setSelectedTypeFilter('ACCOMMODATION_TAX')}
            className={`p-2.5 rounded-lg border cursor-pointer transition ${
              selectedTypeFilter === 'ACCOMMODATION_TAX' 
                ? 'bg-amber-50 border-amber-400 ring-2 ring-amber-300' 
                : 'bg-amber-50/40 border-amber-200/80 hover:bg-amber-50'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-900">4. Accommodation</span>
              <Hotel className="w-3.5 h-3.5 text-amber-700" />
            </div>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="text-base font-bold text-amber-700 font-mono">2%</span>
              <span className="text-[10px] text-gray-500">+3% PLT</span>
            </div>
            <span className="text-[9px] text-amber-800 font-medium block truncate">Hotel & Resort Rooms</span>
          </div>

          <div 
            onClick={() => setSelectedTypeFilter('ANNUAL_TAX')}
            className={`p-2.5 rounded-lg border cursor-pointer transition ${
              selectedTypeFilter === 'ANNUAL_TAX' 
                ? 'bg-indigo-50 border-indigo-400 ring-2 ring-indigo-300' 
                : 'bg-indigo-50/40 border-indigo-200/80 hover:bg-indigo-50'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-900">5. Annual Tax</span>
              <Calendar className="w-3.5 h-3.5 text-indigo-700" />
            </div>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="text-base font-bold text-indigo-700 font-mono">Patent</span>
              <span className="text-[10px] text-gray-500">Tiered</span>
            </div>
            <span className="text-[9px] text-indigo-800 font-medium block truncate">Patent & Annual Return</span>
          </div>

          <div 
            onClick={() => setSelectedTypeFilter('SALARY_TAX')}
            className={`p-2.5 rounded-lg border cursor-pointer transition ${
              selectedTypeFilter === 'SALARY_TAX' 
                ? 'bg-rose-50 border-rose-400 ring-2 ring-rose-300' 
                : 'bg-rose-50/40 border-rose-200/80 hover:bg-rose-50'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-900">6. Salary Tax</span>
              <Users className="w-3.5 h-3.5 text-rose-700" />
            </div>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="text-base font-bold text-rose-700 font-mono">0-20%</span>
              <span className="text-[10px] text-gray-500">+20% FBT</span>
            </div>
            <span className="text-[9px] text-rose-800 font-medium block truncate">Payroll & Expat Taxes</span>
          </div>
        </div>
      </div>

      {/* 1. COUNTRY / JURISDICTION SELECTOR PRESETS & ADMIN CONTROLS */}
      <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-2xs space-y-4 text-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <Globe2 className="w-4 h-4 text-[#d65200]" />
              <h2 className="text-sm font-bold text-gray-900">1. Country Tax Jurisdictions & Statutory Authority</h2>
              {isAdmin ? (
                <span className="px-2 py-0.5 bg-amber-100 text-amber-900 font-bold text-[10px] rounded-full flex items-center gap-1 border border-amber-300">
                  <Crown className="w-3 h-3 text-amber-600" /> Admin Mode: Real-time Tax Adjust & Add Active
                </span>
              ) : (
                <span className="px-2 py-0.5 bg-gray-100 text-gray-700 text-[10px] rounded font-medium">
                  Standard Viewer
                </span>
              )}
            </div>
            <p className="text-[11px] text-gray-500 mt-0.5">
              Select an active jurisdiction, adjust statutory tax % rates, or create new custom country regimes.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {!isAdmin && (
              <button
                type="button"
                onClick={handleElevateToAdmin}
                className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 rounded text-xs font-semibold flex items-center gap-1 transition shadow-2xs"
                title="Switch to Administrator to edit tax rates and add names"
              >
                <Crown className="w-3.5 h-3.5 text-amber-600" /> Switch to Admin
              </button>
            )}

            <button
              type="button"
              id="btn-add-country-jurisdiction"
              onClick={handleOpenAddJurisdiction}
              className="px-3 py-1.5 bg-[#d65200] hover:bg-[#bf4700] text-white rounded text-xs font-bold flex items-center gap-1.5 transition shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" /> Add New Country Jurisdiction
            </button>
          </div>
        </div>

        {/* Country Jurisdictions Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 pt-1">
          {countryJurisdictions.map((jur) => {
            const isSelected = jur.id === activeJurisdictionId;
            return (
              <div
                key={jur.id}
                onClick={() => applyCountryTaxPreset(jur.id)}
                className={`p-3.5 rounded-lg border text-left transition relative flex flex-col justify-between cursor-pointer ${
                  isSelected
                    ? 'border-[#d65200] bg-orange-50/40 ring-2 ring-[#d65200]/30 shadow-xs'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50/70 bg-white'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xl leading-none">{jur.flag || '🌐'}</span>
                      <div>
                        <div className="flex items-center gap-1">
                          <span className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-wider">{jur.countryCode}</span>
                          <span className="text-[9px] px-1 py-0.2 bg-gray-100 text-gray-600 rounded font-mono">{jur.currency}</span>
                        </div>
                        <h3 className="font-bold text-gray-900 text-sm leading-tight">{jur.countryName}</h3>
                      </div>
                    </div>
                    {isSelected && (
                      <span className="px-2 py-0.5 bg-[#d65200] text-white text-[9px] font-bold rounded-full flex items-center gap-1 shadow-2xs shrink-0">
                        <Check className="w-2.5 h-2.5" /> Active
                      </span>
                    )}
                  </div>

                  <div className="mt-2.5 space-y-1.5 text-[11px]">
                    <div className="flex justify-between text-gray-600">
                      <span>Authority:</span>
                      <span className="font-semibold text-gray-800 truncate ml-1 text-right">{jur.taxAuthority}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Tax System:</span>
                      <span className="font-mono text-gray-800 truncate ml-1">{jur.taxSystemName}</span>
                    </div>

                    {/* Interactive Standard VAT Rate Stepper */}
                    <div 
                      className="flex items-center justify-between bg-white border border-gray-200 rounded px-2 py-1 mt-1 shadow-2xs" 
                      onClick={(e) => e.stopPropagation()}
                    >
                      <span className="text-blue-900 font-bold text-[11px]">Standard VAT:</span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleJurisdictionRateStep(jur, -0.5)}
                          className="w-5 h-5 flex items-center justify-center text-gray-500 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded font-bold"
                          title="Decrease rate by 0.5%"
                        >
                          -
                        </button>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          step="0.1"
                          value={(jur.standardVatRate * 100).toFixed(1)}
                          onChange={(e) => handleJurisdictionRateChange(jur, parseFloat(e.target.value) || 0)}
                          className="w-14 px-1 py-0.5 border border-gray-300 rounded font-mono font-bold text-right text-xs text-blue-700 bg-white"
                        />
                        <span className="text-[10px] font-bold text-gray-600">%</span>
                        <button
                          type="button"
                          onClick={() => handleJurisdictionRateStep(jur, 0.5)}
                          className="w-5 h-5 flex items-center justify-center text-gray-500 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded font-bold"
                          title="Increase rate by 0.5%"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <div className="flex justify-between text-gray-600 pt-0.5">
                      <span>Default WHT Services:</span>
                      <span className="font-semibold text-gray-800 font-mono">{((jur.defaultWhtServiceRate || 0.14) * 100).toFixed(1)}%</span>
                    </div>
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-gray-100">
                  <p className="text-[10px] text-gray-500 italic line-clamp-1 mb-2">
                    {jur.notes || `Statutory tax regime for ${jur.countryName}`}
                  </p>

                  <div className="flex items-center justify-between gap-1 pt-1" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      onClick={(e) => handleOpenEditJurisdiction(jur, e)}
                      className="px-2 py-1 text-[11px] font-semibold text-gray-700 hover:text-blue-700 bg-gray-100 hover:bg-blue-50 border border-gray-200 rounded flex items-center gap-1 transition"
                      title="Edit country name and settings"
                    >
                      <Edit3 className="w-3 h-3 text-blue-600" /> Edit Details
                    </button>

                    {countryJurisdictions.length > 1 && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(`Are you sure you want to delete ${jur.countryName} jurisdiction?`)) {
                            deleteCountryJurisdiction(jur.id);
                            showToast(`Deleted ${jur.countryName} jurisdiction`);
                          }
                        }}
                        className="px-1.5 py-1 text-[11px] text-gray-400 hover:text-red-600 hover:bg-red-50 rounded border border-transparent hover:border-red-200 transition"
                        title="Delete jurisdiction"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. DYNAMIC TAX % RATE ADJUSTERS FOR ALL 6 STATUTORY TAXES */}
      <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-2xs space-y-4 text-xs">
        <div className="flex items-center justify-between border-b border-gray-100 pb-2.5">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-blue-600" />
            <h2 className="text-sm font-bold text-gray-900">2. Real-time Tax % Control Sliders & Quick Adjusters (All 6 Taxes)</h2>
          </div>
          <span className="text-[11px] text-gray-500">Fine-tune statutory percentages or configure custom enterprise rates</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Card 1: VAT / GST Output */}
          <div className="bg-blue-50/50 border border-blue-200 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                  <Receipt className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">1. VAT / GST Output Tax</h4>
                  <span className="text-[10px] text-gray-500">Standard sales tax charged on customer invoices</span>
                </div>
              </div>
            </div>

            {(() => {
              const stdCode = taxCodes.find(tc => tc.type === 'VAT_Output' && !tc.code.includes('0%') && !tc.code.includes('EXEMPT')) || taxCodes[0];
              if (!stdCode) return null;

              return (
                <div className="space-y-3 pt-1">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 font-medium">Active Code: <strong className="text-gray-900 font-mono">{stdCode.code}</strong></span>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        value={(stdCode.rate * 100).toFixed(1)}
                        onChange={(e) => handleDirectRateChange(stdCode, parseFloat(e.target.value) || 0)}
                        className="w-20 px-2 py-1 border border-gray-300 rounded font-mono font-bold text-right text-sm text-blue-700 bg-white"
                      />
                      <span className="font-bold text-gray-700 text-sm">%</span>
                    </div>
                  </div>

                  <input
                    type="range"
                    min="0"
                    max="25"
                    step="0.5"
                    value={(stdCode.rate * 100).toFixed(1)}
                    onChange={(e) => handleDirectRateChange(stdCode, parseFloat(e.target.value) || 0)}
                    className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />

                  <div className="flex items-center gap-1.5 flex-wrap pt-1">
                    <span className="text-[10px] text-gray-400">Presets:</span>
                    {[0, 7, 8, 9, 10, 12, 15, 20].map((rateVal) => (
                      <button
                        key={rateVal}
                        type="button"
                        onClick={() => handleDirectRateChange(stdCode, rateVal)}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono transition ${
                          Math.abs(stdCode.rate * 100 - rateVal) < 0.05
                            ? 'bg-blue-600 text-white'
                            : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        {rateVal}%
                      </button>
                    ))}
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Card 2: Corporate Income Tax (CIT & 1% Prepayment) */}
          <div className="bg-emerald-50/50 border border-emerald-200 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                  <TrendingUp className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">2. Income Tax (CIT & Prepayment)</h4>
                  <span className="text-[10px] text-gray-500">Corporate tax on net profits + 1% monthly turnover prepayment</span>
                </div>
              </div>
            </div>

            {(() => {
              const citCode = taxCodes.find(tc => tc.type === 'Income_Tax' || tc.code.includes('CIT')) || taxCodes[7] || taxCodes[0];
              if (!citCode) return null;

              return (
                <div className="space-y-3 pt-1">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 font-medium">CIT Rate: <strong className="text-gray-900 font-mono">{citCode.code}</strong></span>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.5"
                        value={(citCode.rate * 100).toFixed(1)}
                        onChange={(e) => handleDirectRateChange(citCode, parseFloat(e.target.value) || 0)}
                        className="w-20 px-2 py-1 border border-gray-300 rounded font-mono font-bold text-right text-sm text-emerald-700 bg-white"
                      />
                      <span className="font-bold text-gray-700 text-sm">%</span>
                    </div>
                  </div>

                  <input
                    type="range"
                    min="0"
                    max="35"
                    step="0.5"
                    value={(citCode.rate * 100).toFixed(1)}
                    onChange={(e) => handleDirectRateChange(citCode, parseFloat(e.target.value) || 0)}
                    className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                  />

                  <div className="flex items-center justify-between text-[11px] bg-white border border-emerald-200 rounded px-2.5 py-1.5">
                    <span className="text-gray-700 font-medium">Monthly Prepayment (CIT-PREPAY):</span>
                    <span className="font-bold font-mono text-emerald-800">1.0% of Gross Revenue</span>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Card 3: Withholding Tax (WHT) Slabs */}
          <div className="bg-purple-50/50 border border-purple-200 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                  <ShieldCheck className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">3. Withholding Tax (WHT) Slabs</h4>
                  <span className="text-[10px] text-gray-500">Services (14%/3%), Rental (10%/5%), Royalties (15%)</span>
                </div>
              </div>
            </div>

            {(() => {
              const whtCode = taxCodes.find(tc => tc.type === 'Withholding_Tax' || tc.code.includes('WHT-14') || tc.code.includes('WHT-3')) || taxCodes[1];
              if (!whtCode) return null;

              return (
                <div className="space-y-3 pt-1">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 font-medium">Services WHT: <strong className="text-gray-900 font-mono">{whtCode.code}</strong></span>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.5"
                        value={(whtCode.rate * 100).toFixed(1)}
                        onChange={(e) => handleDirectRateChange(whtCode, parseFloat(e.target.value) || 0)}
                        className="w-20 px-2 py-1 border border-gray-300 rounded font-mono font-bold text-right text-sm text-purple-700 bg-white"
                      />
                      <span className="font-bold text-gray-700 text-sm">%</span>
                    </div>
                  </div>

                  <input
                    type="range"
                    min="0"
                    max="25"
                    step="0.5"
                    value={(whtCode.rate * 100).toFixed(1)}
                    onChange={(e) => handleDirectRateChange(whtCode, parseFloat(e.target.value) || 0)}
                    className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                  />

                  <div className="flex items-center gap-1.5 flex-wrap pt-1">
                    <span className="text-[10px] text-gray-400">Presets:</span>
                    {[1, 2, 3, 5, 10, 14, 15].map((rateVal) => (
                      <button
                        key={rateVal}
                        type="button"
                        onClick={() => handleDirectRateChange(whtCode, rateVal)}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono transition ${
                          Math.abs(whtCode.rate * 100 - rateVal) < 0.05
                            ? 'bg-purple-600 text-white'
                            : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        {rateVal}%
                      </button>
                    ))}
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Card 4: Accommodation Tax (Hotel & Tourism) */}
          <div className="bg-amber-50/50 border border-amber-200 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                  <Hotel className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">4. Accommodation Tax (Hotel/Resort)</h4>
                  <span className="text-[10px] text-gray-500">2% room tax on hotel & guest rooms + 3% Public Lighting Tax</span>
                </div>
              </div>
            </div>

            {(() => {
              const accomCode = taxCodes.find(tc => tc.type === 'Accommodation_Tax' || tc.code.includes('ACCOM')) || taxCodes[0];
              if (!accomCode) return null;

              return (
                <div className="space-y-3 pt-1">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 font-medium">Room Tax: <strong className="text-gray-900 font-mono">{accomCode.code}</strong></span>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.5"
                        value={(accomCode.rate * 100).toFixed(1)}
                        onChange={(e) => handleDirectRateChange(accomCode, parseFloat(e.target.value) || 0)}
                        className="w-20 px-2 py-1 border border-gray-300 rounded font-mono font-bold text-right text-sm text-amber-700 bg-white"
                      />
                      <span className="font-bold text-gray-700 text-sm">%</span>
                    </div>
                  </div>

                  <input
                    type="range"
                    min="0"
                    max="15"
                    step="0.5"
                    value={(accomCode.rate * 100).toFixed(1)}
                    onChange={(e) => handleDirectRateChange(accomCode, parseFloat(e.target.value) || 0)}
                    className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
                  />

                  <div className="flex items-center justify-between text-[11px] bg-white border border-amber-200 rounded px-2.5 py-1.5">
                    <span className="text-gray-700 font-medium">Public Lighting Tax (PLT-3%):</span>
                    <span className="font-bold font-mono text-amber-800">3.0% on Hospitality Drinks</span>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Card 5: Annual Tax (Patent Tax & Return) */}
          <div className="bg-indigo-50/50 border border-indigo-200 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                  <Calendar className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">5. Annual Tax (Patent & Returns)</h4>
                  <span className="text-[10px] text-gray-500">Statutory patent certificate tax & annual tax reconciliation</span>
                </div>
              </div>
            </div>

            <div className="space-y-2 pt-1 text-xs">
              <div className="flex justify-between items-center bg-white border border-indigo-200 rounded p-2">
                <span className="text-gray-700">Large Taxpayer Patent:</span>
                <span className="font-bold font-mono text-indigo-800">$1,250 / year</span>
              </div>
              <div className="flex justify-between items-center bg-white border border-indigo-200 rounded p-2">
                <span className="text-gray-700">Medium Taxpayer Patent:</span>
                <span className="font-bold font-mono text-indigo-800">$300 / year</span>
              </div>
              <div className="flex justify-between items-center bg-white border border-indigo-200 rounded p-2">
                <span className="text-gray-700">Annual Return Due:</span>
                <span className="font-bold text-indigo-800">March 31 (Form TOP)</span>
              </div>
            </div>
          </div>

          {/* Card 6: Salary Tax (Payroll & Fringe Benefits) */}
          <div className="bg-rose-50/50 border border-rose-200 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded bg-rose-100 text-rose-700 flex items-center justify-center font-bold">
                  <Users className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">6. Salary Tax (Tax on Salary)</h4>
                  <span className="text-[10px] text-gray-500">Progressive 0% to 20% + 20% Fringe Benefits (FBT)</span>
                </div>
              </div>
            </div>

            <div className="space-y-2 pt-1 text-xs">
              <div className="flex justify-between items-center bg-white border border-rose-200 rounded p-2">
                <span className="text-gray-700">Exempt Bracket (Tier 1):</span>
                <span className="font-bold font-mono text-emerald-700">$0 - $375 (0%)</span>
              </div>
              <div className="flex justify-between items-center bg-white border border-rose-200 rounded p-2">
                <span className="text-gray-700">Top Bracket (Tier 5):</span>
                <span className="font-bold font-mono text-rose-800">&gt; $3,125 (20%)</span>
              </div>
              <div className="flex justify-between items-center bg-white border border-rose-200 rounded p-2">
                <span className="text-gray-700">Fringe Benefit Tax (FBT):</span>
                <span className="font-bold font-mono text-rose-800">20% on Allowances</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. TAX CODES MASTER TABLE */}
      <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-2xs space-y-4 text-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-3">
          <div className="flex items-center gap-2">
            <FileCheck className="w-4 h-4 text-[#d65200]" />
            <h2 className="text-sm font-bold text-gray-900">
              3. Statutory Tax Codes Master Register ({filteredTaxCodes.length} of {taxCodes.length})
            </h2>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search code, name, category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 border border-gray-300 rounded text-xs w-44 sm:w-56 focus:outline-none focus:ring-1 focus:ring-[#d65200]"
              />
            </div>

            {/* Type filter */}
            <select
              value={selectedTypeFilter}
              onChange={(e) => setSelectedTypeFilter(e.target.value)}
              className="px-2.5 py-1.5 border border-gray-300 rounded text-xs bg-white text-gray-700 font-semibold"
            >
              <option value="ALL">All 6 Tax Categories ({categoryCounts.ALL})</option>
              <option value="VAT">1. VAT / GST ({categoryCounts.VAT})</option>
              <option value="INCOME_TAX">2. Income Tax / CIT ({categoryCounts.Income_Tax})</option>
              <option value="WHT">3. Withholding Tax / WHT ({categoryCounts.Withholding_Tax})</option>
              <option value="ACCOMMODATION_TAX">4. Accommodation Tax ({categoryCounts.Accommodation_Tax})</option>
              <option value="ANNUAL_TAX">5. Annual Tax / Patent ({categoryCounts.Annual_Tax})</option>
              <option value="SALARY_TAX">6. Salary Tax / Payroll ({categoryCounts.Salary_Tax})</option>
            </select>

            {/* Country filter */}
            <select
              value={selectedCountryFilter}
              onChange={(e) => setSelectedCountryFilter(e.target.value)}
              className="px-2.5 py-1.5 border border-gray-300 rounded text-xs bg-white text-gray-700"
            >
              <option value="ALL">All Jurisdictions</option>
              <option value="Cambodia">Cambodia (GDT)</option>
              <option value="Thailand">Thailand (RD)</option>
              <option value="Singapore">Singapore (IRAS)</option>
              <option value="United States">United States (IRS)</option>
              <option value="United Kingdom">United Kingdom (HMRC)</option>
              <option value="Vietnam">Vietnam (GDT)</option>
              <option value="Global">Global / Generic</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto border border-gray-200 rounded-lg">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-[11px] text-gray-600 font-bold uppercase tracking-wider border-b border-gray-200">
                <th className="py-2.5 px-3">Tax Code</th>
                <th className="py-2.5 px-3">Statutory Name & Dual-Language</th>
                <th className="py-2.5 px-3 text-center">Country</th>
                <th className="py-2.5 px-3">Tax Category</th>
                <th className="py-2.5 px-3 text-right">Tax Rate %</th>
                <th className="py-2.5 px-3 text-center">Status</th>
                <th className="py-2.5 px-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs">
              {filteredTaxCodes.map((tc) => {
                const isSelectedJur = tc.country === activeJurisdiction.countryName.split(' ')[0];
                const category = getTaxCategory(tc);
                return (
                  <tr 
                    key={tc.id} 
                    className={`hover:bg-orange-50/30 transition ${
                      !tc.isActive ? 'opacity-60 bg-gray-50/50' : ''
                    }`}
                  >
                    <td className="py-2.5 px-3 font-mono font-bold text-gray-900">
                      <div className="flex items-center gap-1.5">
                        <span className="px-1.5 py-0.5 bg-gray-100 rounded text-gray-800">{tc.code}</span>
                        {isSelectedJur && (
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" title="Matches active country" />
                        )}
                      </div>
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="font-semibold text-gray-900">{tc.name}</div>
                      {tc.thaiName && (
                        <div className="text-[11px] text-gray-500 font-normal">{tc.thaiName}</div>
                      )}
                      {tc.description && (
                        <div className="text-[10px] text-gray-400 truncate max-w-md">{tc.description}</div>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded font-medium text-[11px]">
                        {tc.country || 'Global'}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        category === 'VAT' ? 'bg-blue-100 text-blue-800' :
                        category === 'Income_Tax' ? 'bg-emerald-100 text-emerald-800' :
                        category === 'Withholding_Tax' ? 'bg-purple-100 text-purple-800' :
                        category === 'Accommodation_Tax' ? 'bg-amber-100 text-amber-800' :
                        category === 'Annual_Tax' ? 'bg-indigo-100 text-indigo-800' :
                        category === 'Salary_Tax' ? 'bg-rose-100 text-rose-800' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {category.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-gray-900">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => handleRateStep(tc, -0.005)}
                          className="w-5 h-5 flex items-center justify-center text-gray-400 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 rounded font-bold"
                          title="Decrease rate by 0.5%"
                        >
                          -
                        </button>
                        <span className="w-14 text-right text-sm text-[#d65200]">
                          {(tc.rate * 100).toFixed(tc.rate % 0.01 === 0 ? 0 : 1)}%
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRateStep(tc, 0.005)}
                          className="w-5 h-5 flex items-center justify-center text-gray-400 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 rounded font-bold"
                          title="Increase rate by 0.5%"
                        >
                          +
                        </button>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <button
                        type="button"
                        onClick={() => updateTaxCode(tc.id, { isActive: !tc.isActive })}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold transition ${
                          tc.isActive 
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200' 
                            : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                        }`}
                      >
                        {tc.isActive ? 'Active' : 'Disabled'}
                      </button>
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingTaxCode(tc);
                            setFormData({
                              code: tc.code,
                              name: tc.name,
                              thaiName: tc.thaiName || '',
                              rate: tc.rate,
                              type: tc.type,
                              category: getTaxCategory(tc),
                              country: tc.country || 'Cambodia',
                              description: tc.description || '',
                              isActive: tc.isActive !== false
                            });
                            setIsAddModalOpen(true);
                          }}
                          className="p-1 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded"
                          title="Edit Tax Code Details"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`Delete tax code "${tc.code}"?`)) {
                              deleteTaxCode(tc.id);
                              showToast(`Deleted ${tc.code}`);
                            }
                          }}
                          className="p-1 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded"
                          title="Delete Tax Code"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredTaxCodes.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-gray-500">
                    No tax codes match your current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. LIVE MULTI-TAX SIMULATION & JOURNAL IMPACT CALCULATOR */}
      <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-2xs space-y-4 text-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-2.5">
          <div className="flex items-center gap-2">
            <Calculator className="w-4 h-4 text-emerald-600" />
            <h2 className="text-sm font-bold text-gray-900">4. Live Multi-Tax Simulator & Journal Impact</h2>
          </div>
          
          {/* Regime Switcher */}
          <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg">
            <button
              type="button"
              onClick={() => setSimRegime('INVOICE')}
              className={`px-2.5 py-1 rounded text-xs font-semibold transition ${
                simRegime === 'INVOICE' ? 'bg-white text-blue-700 shadow-2xs' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              1. Sales VAT & WHT
            </button>
            <button
              type="button"
              onClick={() => setSimRegime('HOTEL')}
              className={`px-2.5 py-1 rounded text-xs font-semibold transition ${
                simRegime === 'HOTEL' ? 'bg-white text-amber-700 shadow-2xs' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              2. Hotel Accommodation (2%)
            </button>
            <button
              type="button"
              onClick={() => setSimRegime('PAYROLL')}
              className={`px-2.5 py-1 rounded text-xs font-semibold transition ${
                simRegime === 'PAYROLL' ? 'bg-white text-rose-700 shadow-2xs' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              3. Salary Payroll Tax
            </button>
            <button
              type="button"
              onClick={() => setSimRegime('CORP_INCOME')}
              className={`px-2.5 py-1 rounded text-xs font-semibold transition ${
                simRegime === 'CORP_INCOME' ? 'bg-white text-emerald-700 shadow-2xs' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              4. Corporate CIT & Prepayment
            </button>
          </div>
        </div>

        {/* REGIME 1: INVOICE & WHT */}
        {simRegime === 'INVOICE' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3 bg-gray-50/70 p-4 rounded-lg border border-gray-200">
              <div>
                <label className="block text-gray-700 font-semibold mb-1">Invoice / Transaction Base Amount ({currentCurrency})</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-gray-400">$</span>
                  <input
                    type="number"
                    min="0"
                    step="10"
                    value={simBaseAmount}
                    onChange={(e) => setSimBaseAmount(parseFloat(e.target.value) || 0)}
                    className="w-full pl-8 pr-3 py-1.5 border border-gray-300 rounded font-mono font-bold text-sm bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">VAT / GST Output Code</label>
                  <select
                    value={simTaxCodeId}
                    onChange={(e) => setSimTaxCodeId(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-gray-300 rounded bg-white text-xs"
                  >
                    {taxCodes.filter(tc => getTaxCategory(tc) === 'VAT' && tc.isActive).map(tc => (
                      <option key={tc.id} value={tc.id}>
                        {tc.code} ({(tc.rate * 100).toFixed(1)}%) - {tc.country || 'Global'}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Withholding Tax (WHT) Rate</label>
                  <select
                    value={simWhtRate}
                    onChange={(e) => setSimWhtRate(parseFloat(e.target.value))}
                    className="w-full px-2.5 py-1.5 border border-gray-300 rounded bg-white text-xs"
                  >
                    <option value={0}>0% - No Withholding</option>
                    <option value={0.01}>1% - Transport & Cargo</option>
                    <option value={0.03}>3% - Services & Subcontractors (Thailand)</option>
                    <option value={0.05}>5% - Rental / Immovable Property</option>
                    <option value={0.10}>10% - Real Estate Rental (Cambodia)</option>
                    <option value={0.14}>14% - Non-Resident / Services (Cambodia)</option>
                    <option value={0.15}>15% - Professional & Royalties</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 text-[11px] text-gray-500">
                Active Country Rule: <strong className="text-gray-800">{activeJurisdiction.countryName} ({activeJurisdiction.taxAuthority})</strong>. Tax computation auto-adjusts upon switching country or modifying percentage rates above.
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-4 flex flex-col justify-between space-y-3">
              <div className="space-y-2">
                <h4 className="font-bold text-gray-900 text-xs border-b border-gray-100 pb-1.5 flex items-center justify-between">
                  <span>Sales Invoice Breakdown Summary</span>
                  <span className="text-[10px] font-mono text-gray-500 font-normal">{activeSimTaxCode?.code}</span>
                </h4>

                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between text-gray-600">
                    <span>Gross Services Base Amount:</span>
                    <span className="font-mono font-medium">{formatCurrency(simBaseAmount)}</span>
                  </div>
                  <div className="flex justify-between text-blue-700 font-medium">
                    <span>+ VAT / GST ({(simVatRate * 100).toFixed(1)}%):</span>
                    <span className="font-mono">+{formatCurrency(simVatAmount)}</span>
                  </div>
                  <div className="flex justify-between text-gray-900 font-bold border-t border-dashed border-gray-200 pt-1">
                    <span>Invoice Gross Total:</span>
                    <span className="font-mono">{formatCurrency(simGrossTotal)}</span>
                  </div>
                  {simWhtRate > 0 && (
                    <div className="flex justify-between text-purple-700 font-medium">
                      <span>- WHT Withheld at Source ({(simWhtRate * 100).toFixed(1)}%):</span>
                      <span className="font-mono">-{formatCurrency(simWhtAmount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm font-bold text-[#d65200] border-t border-gray-200 pt-1.5">
                    <span>Net Cash Receivable:</span>
                    <span className="font-mono">{formatCurrency(simNetPayable)}</span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded p-2.5 text-[10px] font-mono border border-gray-200 space-y-1">
                <div className="font-bold text-gray-600 uppercase text-[9px] tracking-wider mb-1">Double-Entry GL Posting Simulation</div>
                <div className="flex justify-between text-emerald-800">
                  <span>DR 1020 Cash / Bank (Net Received)</span>
                  <span>${simNetPayable.toFixed(2)}</span>
                </div>
                {simWhtRate > 0 && (
                  <div className="flex justify-between text-purple-800">
                    <span>DR 1140 Prepaid Withholding Tax Asset</span>
                    <span>${simWhtAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-800 pl-4">
                  <span>CR 4010 Sales Revenue (Gross Base)</span>
                  <span>${simBaseAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-blue-800 pl-4">
                  <span>CR 2020 VAT / GST Output Tax Payable</span>
                  <span>${simVatAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* REGIME 2: HOTEL ACCOMMODATION TAX */}
        {simRegime === 'HOTEL' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3 bg-amber-50/40 p-4 rounded-lg border border-amber-200">
              <div className="flex items-center gap-2 text-amber-900 font-bold">
                <Hotel className="w-4 h-4 text-amber-700" />
                <span>Hotel & Resort Guest Room Rate Calculator</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Room Night Rate ({currentCurrency})</label>
                  <input
                    type="number"
                    min="0"
                    step="10"
                    value={hotelRoomRate}
                    onChange={(e) => setHotelRoomRate(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-1.5 border border-gray-300 rounded font-mono font-bold text-sm bg-white"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Number of Nights</label>
                  <input
                    type="number"
                    min="1"
                    value={hotelNights}
                    onChange={(e) => setHotelNights(parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-1.5 border border-gray-300 rounded font-mono font-bold text-sm bg-white"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="include-plt"
                  checked={hotelIncludePLT}
                  onChange={(e) => setHotelIncludePLT(e.target.checked)}
                  className="rounded text-amber-600 focus:ring-amber-500"
                />
                <label htmlFor="include-plt" className="text-gray-700 font-medium cursor-pointer">
                  Include 3% Public Lighting Tax (PLT-3%) for Hospitality
                </label>
              </div>

              <div className="p-2.5 bg-white rounded border border-amber-200 text-[11px] text-gray-600">
                Statutory Rule: In Cambodia, hotels & tourist accommodations are subject to a statutory <strong>2% Accommodation Tax</strong> on room supply, in addition to standard <strong>10% VAT</strong> and <strong>3% Public Lighting Tax</strong> on hospitality beverages/tobacco.
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-4 flex flex-col justify-between space-y-3">
              <div className="space-y-2">
                <h4 className="font-bold text-gray-900 text-xs border-b border-gray-100 pb-1.5 flex items-center justify-between">
                  <span>Guest Stay Folio & Statutory Tax Breakdown</span>
                  <span className="text-[10px] font-mono text-amber-700 font-bold">ACCOM-2% + VAT-10%</span>
                </h4>

                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between text-gray-600">
                    <span>Total Room Revenue ({hotelNights} nights @ ${hotelRoomRate}/nt):</span>
                    <span className="font-mono font-medium">{formatCurrency(hotelTotalRoomRevenue)}</span>
                  </div>
                  <div className="flex justify-between text-amber-800 font-medium">
                    <span>+ Accommodation Tax ({(hotelAccomTaxRate * 100).toFixed(1)}%):</span>
                    <span className="font-mono">+{formatCurrency(hotelAccomTaxAmount)}</span>
                  </div>
                  {hotelIncludePLT && (
                    <div className="flex justify-between text-amber-700 font-medium">
                      <span>+ Public Lighting Tax PLT ({(hotelPltRate * 100).toFixed(1)}%):</span>
                      <span className="font-mono">+{formatCurrency(hotelPltAmount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-blue-700 font-medium">
                    <span>+ Standard VAT ({(hotelVatRate * 100).toFixed(1)}%):</span>
                    <span className="font-mono">+{formatCurrency(hotelVatAmount)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold text-[#d65200] border-t border-gray-200 pt-1.5">
                    <span>Total Guest Room Invoice:</span>
                    <span className="font-mono">{formatCurrency(hotelTotalGuestBill)}</span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded p-2.5 text-[10px] font-mono border border-gray-200 space-y-1">
                <div className="font-bold text-gray-600 uppercase text-[9px] tracking-wider mb-1">Hotel Folio GL Ledger Posting</div>
                <div className="flex justify-between text-emerald-800">
                  <span>DR 1020 Guest Ledger / Cash Received</span>
                  <span>${hotelTotalGuestBill.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-800 pl-4">
                  <span>CR 4010 Hotel Room Revenue</span>
                  <span>${hotelTotalRoomRevenue.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-amber-800 pl-4">
                  <span>CR 2150 Accommodation Tax Payable (2%)</span>
                  <span>${hotelAccomTaxAmount.toFixed(2)}</span>
                </div>
                {hotelIncludePLT && (
                  <div className="flex justify-between text-amber-700 pl-4">
                    <span>CR 2160 Public Lighting Tax Payable (3%)</span>
                    <span>${hotelPltAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-blue-800 pl-4">
                  <span>CR 2100 VAT Output Tax Payable (10%)</span>
                  <span>${hotelVatAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* REGIME 3: PAYROLL SALARY TAX */}
        {simRegime === 'PAYROLL' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3 bg-rose-50/40 p-4 rounded-lg border border-rose-200">
              <div className="flex items-center gap-2 text-rose-900 font-bold">
                <Users className="w-4 h-4 text-rose-700" />
                <span>Monthly Staff Payroll & Tax on Salary (TOS)</span>
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-1">Monthly Gross Base Salary ({currentCurrency})</label>
                <input
                  type="number"
                  min="0"
                  step="50"
                  value={payrollGrossSalary}
                  onChange={(e) => setPayrollGrossSalary(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-1.5 border border-gray-300 rounded font-mono font-bold text-sm bg-white"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-1">Fringe Benefits & Allowances (Housing/Car)</label>
                <input
                  type="number"
                  min="0"
                  step="25"
                  value={payrollFringeBenefits}
                  onChange={(e) => setPayrollFringeBenefits(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-1.5 border border-gray-300 rounded font-mono font-bold text-sm bg-white"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="non-resident-check"
                  checked={payrollIsNonResident}
                  onChange={(e) => setPayrollIsNonResident(e.target.checked)}
                  className="rounded text-rose-600 focus:ring-rose-500"
                />
                <label htmlFor="non-resident-check" className="text-gray-700 font-medium cursor-pointer">
                  Non-Resident Expatriate Staff (20% Flat Withholding)
                </label>
              </div>

              <div className="p-2.5 bg-white rounded border border-rose-200 text-[11px] text-gray-600 space-y-1">
                <span className="font-bold text-gray-800 block">Progressive Tax on Salary Brackets:</span>
                <div className="grid grid-cols-2 gap-1 text-[10px] font-mono">
                  <span>• $0 - $375: <strong>0% (Exempt)</strong></span>
                  <span>• $376 - $500: <strong>5%</strong></span>
                  <span>• $501 - $2,125: <strong>10%</strong></span>
                  <span>• $2,126 - $3,125: <strong>15%</strong></span>
                  <span>• &gt; $3,125: <strong>20%</strong></span>
                  <span>• Fringe Benefits: <strong>20% FBT</strong></span>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-4 flex flex-col justify-between space-y-3">
              <div className="space-y-2">
                <h4 className="font-bold text-gray-900 text-xs border-b border-gray-100 pb-1.5 flex items-center justify-between">
                  <span>Payroll Withholding & Net Salary Breakdown</span>
                  <span className="text-[10px] font-mono text-rose-700 font-bold">
                    Effective TOS: {(salaryTaxResult.effectiveRate * 100).toFixed(1)}%
                  </span>
                </h4>

                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between text-gray-600">
                    <span>Gross Contract Salary:</span>
                    <span className="font-mono font-medium">{formatCurrency(payrollGrossSalary)}</span>
                  </div>
                  <div className="flex justify-between text-rose-700 font-medium">
                    <span>- Tax on Salary (TOS Withheld):</span>
                    <span className="font-mono">-{formatCurrency(salaryTaxResult.tax)}</span>
                  </div>
                  <div className="flex justify-between text-emerald-800 font-bold border-t border-dashed border-gray-200 pt-1">
                    <span>Net Take-Home Salary to Employee:</span>
                    <span className="font-mono">{formatCurrency(netTakeHomeSalary)}</span>
                  </div>

                  {payrollFringeBenefits > 0 && (
                    <div className="pt-2 border-t border-gray-100">
                      <div className="flex justify-between text-gray-600">
                        <span>Fringe Benefits Provided:</span>
                        <span className="font-mono">{formatCurrency(payrollFringeBenefits)}</span>
                      </div>
                      <div className="flex justify-between text-rose-800 font-medium">
                        <span>+ Fringe Benefit Tax (20% FBT - Employer Borne):</span>
                        <span className="font-mono">+{formatCurrency(fbtAmount)}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-gray-50 rounded p-2.5 text-[10px] font-mono border border-gray-200 space-y-1">
                <div className="font-bold text-gray-600 uppercase text-[9px] tracking-wider mb-1">Payroll GL Journal Posting</div>
                <div className="flex justify-between text-gray-800">
                  <span>DR 6010 Staff Salary Expense</span>
                  <span>${payrollGrossSalary.toFixed(2)}</span>
                </div>
                {payrollFringeBenefits > 0 && (
                  <div className="flex justify-between text-rose-800">
                    <span>DR 6015 Fringe Benefit Tax Expense</span>
                    <span>${fbtAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-emerald-800 pl-4">
                  <span>CR 1020 Net Salary Bank Transfer</span>
                  <span>${netTakeHomeSalary.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-rose-800 pl-4">
                  <span>CR 2120 Tax on Salary Payable (GDT)</span>
                  <span>${salaryTaxResult.tax.toFixed(2)}</span>
                </div>
                {payrollFringeBenefits > 0 && (
                  <div className="flex justify-between text-rose-800 pl-4">
                    <span>CR 2125 Fringe Benefit Tax Payable</span>
                    <span>${fbtAmount.toFixed(2)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* REGIME 4: CORPORATE CIT & ANNUAL PREPAYMENT */}
        {simRegime === 'CORP_INCOME' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3 bg-emerald-50/40 p-4 rounded-lg border border-emerald-200">
              <div className="flex items-center gap-2 text-emerald-900 font-bold">
                <TrendingUp className="w-4 h-4 text-emerald-700" />
                <span>Annual Corporate Income Tax (20%) & 1% Prepayment Reconciliation</span>
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-1">Annual Gross Turnover / Revenue ({currentCurrency})</label>
                <input
                  type="number"
                  min="0"
                  step="1000"
                  defaultValue={500000}
                  id="sim-annual-turnover"
                  className="w-full px-3 py-1.5 border border-gray-300 rounded font-mono font-bold text-sm bg-white"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-1">Estimated Net Taxable Profit ({currentCurrency})</label>
                <input
                  type="number"
                  min="0"
                  step="1000"
                  defaultValue={80000}
                  id="sim-net-profit"
                  className="w-full px-3 py-1.5 border border-gray-300 rounded font-mono font-bold text-sm bg-white"
                />
              </div>

              <div className="p-2.5 bg-white rounded border border-emerald-200 text-[11px] text-gray-600 space-y-1">
                <span className="font-bold text-gray-800 block">Annual Statutory Reconciliation:</span>
                <p>
                  Enterprises pay <strong>1% monthly Prepayment of Tax on Income (TOI)</strong> on monthly gross turnover. At fiscal year-end, <strong>20% Tax on Profit (TOP / CIT)</strong> is calculated on actual net profit, and all monthly 1% prepayments are fully credited against the annual tax liability.
                </p>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-4 flex flex-col justify-between space-y-3">
              <div className="space-y-2">
                <h4 className="font-bold text-gray-900 text-xs border-b border-gray-100 pb-1.5 flex items-center justify-between">
                  <span>Fiscal Year-End Tax on Profit (TOP) Balance</span>
                  <span className="text-[10px] font-mono text-emerald-700 font-bold">CIT 20% Standard</span>
                </h4>

                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between text-gray-600">
                    <span>1% Monthly Prepayments Accumulated (1% of Turnover):</span>
                    <span className="font-mono font-medium">$5,000.00</span>
                  </div>
                  <div className="flex justify-between text-emerald-800 font-medium">
                    <span>20% Statutory Tax on Profit (20% of Net Profit):</span>
                    <span className="font-mono">$16,000.00</span>
                  </div>
                  <div className="flex justify-between text-purple-700 font-medium">
                    <span>Less Prepayments Credited:</span>
                    <span className="font-mono">-$5,000.00</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold text-[#d65200] border-t border-gray-200 pt-1.5">
                    <span>Final Net Annual Tax Balance Due (by March 31):</span>
                    <span className="font-mono">$11,000.00</span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded p-2.5 text-[10px] font-mono border border-gray-200 space-y-1">
                <div className="font-bold text-gray-600 uppercase text-[9px] tracking-wider mb-1">Fiscal Year-End Closing Entry</div>
                <div className="flex justify-between text-gray-800">
                  <span>DR 6050 Corporate Income Tax Expense</span>
                  <span>$16,000.00</span>
                </div>
                <div className="flex justify-between text-purple-800 pl-4">
                  <span>CR 1270 Prepaid Tax on Income Asset (1%)</span>
                  <span>$5,000.00</span>
                </div>
                <div className="flex justify-between text-emerald-800 pl-4">
                  <span>CR 2110 Corporate Income Tax Payable</span>
                  <span>$11,000.00</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 5. ADD / EDIT TAX CODE MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-lg max-w-lg w-full p-6 shadow-2xl animate-in fade-in-50">
            <div className="flex justify-between items-center pb-3 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <Percent className="w-5 h-5 text-[#d65200]" />
                <h3 className="text-base font-bold text-gray-900">
                  {editingTaxCode ? `Edit Tax Code: ${editingTaxCode.code}` : 'Create New Statutory Tax Code'}
                </h3>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTaxCode} className="mt-4 space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-gray-700 mb-1">Tax Code Identifier *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. VAT-10%, ACCOM-2%, TOS-10%"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-1.5 border border-gray-300 rounded font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block font-medium text-gray-700 mb-1">Percentage Rate (%) *</label>
                  <div className="relative">
                    <input
                      type="number"
                      required
                      min="0"
                      max="100"
                      step="0.1"
                      value={(formData.rate * 100).toFixed(1)}
                      onChange={(e) => setFormData({ ...formData, rate: (parseFloat(e.target.value) || 0) / 100 })}
                      className="w-full px-3 py-1.5 border border-gray-300 rounded font-mono font-bold text-right pr-7"
                    />
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 font-bold text-gray-500">%</span>
                  </div>
                </div>
              </div>

              {/* Tax Category Selector */}
              <div>
                <label className="block font-medium text-gray-700 mb-1">Tax Core Category *</label>
                <select
                  value={formData.category || 'VAT'}
                  onChange={(e) => {
                    const cat = e.target.value as TaxCategory;
                    const defaultType: TaxType = 
                      cat === 'VAT' ? 'VAT_Output' :
                      cat === 'Income_Tax' ? 'Income_Tax' :
                      cat === 'Withholding_Tax' ? 'Withholding_Tax' :
                      cat === 'Accommodation_Tax' ? 'Accommodation_Tax' :
                      cat === 'Annual_Tax' ? 'Patent_Tax' :
                      cat === 'Salary_Tax' ? 'Salary_Tax' : 'Service_Tax';
                    setFormData({ ...formData, category: cat, type: defaultType });
                  }}
                  className="w-full px-3 py-1.5 border border-gray-300 rounded bg-white font-semibold text-gray-800"
                >
                  <option value="VAT">1. VAT (Value Added Tax / GST)</option>
                  <option value="Income_Tax">2. Income Tax (Corporate Income Tax & Prepayment)</option>
                  <option value="Withholding_Tax">3. Withholding Tax (WHT - Services, Rent, Royalties)</option>
                  <option value="Accommodation_Tax">4. Accommodation Tax (2% Hotel / Tourism)</option>
                  <option value="Annual_Tax">5. Annual Tax (Patent Tax & Annual Filings)</option>
                  <option value="Salary_Tax">6. Salary Tax (Tax on Salary & Payroll)</option>
                  <option value="Other">Other Miscellaneous Tax</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-gray-700 mb-1">Official Name / Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Standard VAT Output (10%) or Accommodation Tax (2%)"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-1.5 border border-gray-300 rounded"
                />
              </div>

              <div>
                <label className="block font-medium text-gray-700 mb-1">Localized Name (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. អាករលើការស្នាក់នៅ (Accommodation Tax 2%)"
                  value={formData.thaiName || ''}
                  onChange={(e) => setFormData({ ...formData, thaiName: e.target.value })}
                  className="w-full px-3 py-1.5 border border-gray-300 rounded"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-gray-700 mb-1">Tax Classification Type *</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                    className="w-full px-3 py-1.5 border border-gray-300 rounded bg-white"
                  >
                    <option value="VAT_Output">VAT Output (Sales)</option>
                    <option value="VAT_Input">VAT Input (Purchases)</option>
                    <option value="Income_Tax">Corporate Income Tax (CIT)</option>
                    <option value="Income_Prepayment">1% Prepayment of Income Tax</option>
                    <option value="Minimum_Tax">1% Minimum Tax</option>
                    <option value="Withholding_Tax">Withholding Tax (WHT)</option>
                    <option value="Accommodation_Tax">Accommodation Tax (Hotel 2%)</option>
                    <option value="Public_Lighting_Tax">Public Lighting Tax (PLT 3%)</option>
                    <option value="Patent_Tax">Patent Tax (Annual Tier)</option>
                    <option value="Annual_Tax">Annual Tax on Profit Reconciliation</option>
                    <option value="Salary_Tax">Tax on Salary (Payroll)</option>
                    <option value="Fringe_Benefit_Tax">Fringe Benefit Tax (20%)</option>
                    <option value="Zero_Rated">Zero-Rated (0% Export)</option>
                    <option value="Exempt">Exempt / Non-Taxable</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-gray-700 mb-1">Country Jurisdiction *</label>
                  <select
                    value={formData.country || 'Cambodia'}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    className="w-full px-3 py-1.5 border border-gray-300 rounded bg-white"
                  >
                    {countryJurisdictions.map(j => (
                      <option key={j.id} value={j.countryName.split(' ')[0] || j.countryName}>
                        {j.flag || '🌐'} {j.countryName}
                      </option>
                    ))}
                    <option value="Global">🌐 Global / Generic</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-medium text-gray-700 mb-1">Statutory Description & Filing Notes</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Applicable under statutory revenue code."
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-1.5 border border-gray-300 rounded"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="modal-tax-active"
                  checked={formData.isActive !== false}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="rounded text-[#d65200] focus:ring-[#d65200]"
                />
                <label htmlFor="modal-tax-active" className="text-gray-700 font-medium">
                  Enable this tax code for live invoice and bill generation
                </label>
              </div>

              <div className="mt-5 flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded text-xs font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#d65200] hover:bg-[#bf4700] text-white rounded text-xs font-bold shadow-xs"
                >
                  {editingTaxCode ? 'Update Tax Code' : 'Create Tax Code'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. ADD / EDIT COUNTRY TAX JURISDICTION MODAL */}
      {isJurisdictionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl border border-gray-200 w-full max-w-xl overflow-hidden my-8">
            <div className="px-5 py-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-orange-100 text-[#d65200] flex items-center justify-center font-bold">
                  <Globe2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-sm">
                    {editingJurisdiction ? 'Edit Country Tax Jurisdiction & Rates' : 'Add New Country Tax Jurisdiction'}
                  </h3>
                  <p className="text-[11px] text-gray-500">
                    Configure statutory tax authority, standard VAT %, and WHT withholdings
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsJurisdictionModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-md hover:bg-gray-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveJurisdiction} className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block font-medium text-gray-700 mb-1">Country / Jurisdiction Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Germany, Australia, Vietnam, Japan"
                    value={jurisdictionFormData.countryName}
                    onChange={(e) => setJurisdictionFormData({ ...jurisdictionFormData, countryName: e.target.value })}
                    className="w-full px-3 py-1.5 border border-gray-300 rounded font-medium text-gray-900 focus:ring-1 focus:ring-[#d65200] focus:border-[#d65200]"
                  />
                </div>

                <div>
                  <label className="block font-medium text-gray-700 mb-1">Country Code *</label>
                  <input
                    type="text"
                    required
                    maxLength={3}
                    placeholder="e.g. DE, AU, VN"
                    value={jurisdictionFormData.countryCode}
                    onChange={(e) => setJurisdictionFormData({ ...jurisdictionFormData, countryCode: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-1.5 border border-gray-300 rounded font-mono font-bold uppercase text-center"
                  />
                </div>
              </div>

              {/* Flag Emoji selector & Currency */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-gray-700 mb-1">Flag Icon / Emoji</label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      value={jurisdictionFormData.flag}
                      onChange={(e) => setJurisdictionFormData({ ...jurisdictionFormData, flag: e.target.value })}
                      className="w-12 text-center text-lg py-1 border border-gray-300 rounded"
                    />
                    <div className="flex items-center gap-1 flex-wrap">
                      {['🇰🇭', '🇹🇭', '🇸🇬', '🇻🇳', '🇺🇸', '🇬🇧', '🇩🇪', '🇦🇺', '🇯🇵', '🌐'].map(emoji => (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() => setJurisdictionFormData({ ...jurisdictionFormData, flag: emoji })}
                          className="w-6 h-6 text-sm hover:bg-gray-100 rounded border border-gray-200 flex items-center justify-center transition"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block font-medium text-gray-700 mb-1">Reporting Currency</label>
                  <select
                    value={jurisdictionFormData.currency}
                    onChange={(e) => setJurisdictionFormData({ ...jurisdictionFormData, currency: e.target.value as CurrencyCode })}
                    className="w-full px-3 py-1.5 border border-gray-300 rounded bg-white font-mono"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="SGD">SGD (S$)</option>
                    <option value="THB">THB (฿)</option>
                  </select>
                </div>
              </div>

              {/* Tax Authority and System Name */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-gray-700 mb-1">Statutory Tax Authority</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. GDT, Revenue Dept, ATO, IRS, HMRC"
                    value={jurisdictionFormData.taxAuthority}
                    onChange={(e) => setJurisdictionFormData({ ...jurisdictionFormData, taxAuthority: e.target.value })}
                    className="w-full px-3 py-1.5 border border-gray-300 rounded"
                  />
                </div>

                <div>
                  <label className="block font-medium text-gray-700 mb-1">Tax System Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. VAT (Value Added Tax), GST, Sales Tax"
                    value={jurisdictionFormData.taxSystemName}
                    onChange={(e) => setJurisdictionFormData({ ...jurisdictionFormData, taxSystemName: e.target.value })}
                    className="w-full px-3 py-1.5 border border-gray-300 rounded"
                  />
                </div>
              </div>

              {/* Tax Percentage Rates */}
              <div className="p-3 bg-orange-50/50 border border-orange-200 rounded-lg space-y-3">
                <span className="font-bold text-[#d65200] block text-xs">Statutory % Tax Rates</span>
                
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block font-medium text-gray-700 mb-1">Standard VAT/GST Rate *</label>
                    <div className="relative">
                      <input
                        type="number"
                        required
                        min="0"
                        max="100"
                        step="0.1"
                        value={(jurisdictionFormData.standardVatRate * 100).toFixed(1)}
                        onChange={(e) => setJurisdictionFormData({ ...jurisdictionFormData, standardVatRate: (parseFloat(e.target.value) || 0) / 100 })}
                        className="w-full px-2 py-1.5 border border-gray-300 rounded font-mono font-bold text-right pr-6 bg-white"
                      />
                      <span className="absolute right-2 top-1/2 -translate-y-1/2 font-bold text-gray-500">%</span>
                    </div>
                  </div>

                  <div>
                    <label className="block font-medium text-gray-700 mb-1">Default WHT Services</label>
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        value={((jurisdictionFormData.defaultWhtServiceRate || 0) * 100).toFixed(1)}
                        onChange={(e) => setJurisdictionFormData({ ...jurisdictionFormData, defaultWhtServiceRate: (parseFloat(e.target.value) || 0) / 100 })}
                        className="w-full px-2 py-1.5 border border-gray-300 rounded font-mono font-bold text-right pr-6 bg-white"
                      />
                      <span className="absolute right-2 top-1/2 -translate-y-1/2 font-bold text-gray-500">%</span>
                    </div>
                  </div>

                  <div>
                    <label className="block font-medium text-gray-700 mb-1">Default WHT Property/Rent</label>
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        value={((jurisdictionFormData.defaultWhtRentRate || 0) * 100).toFixed(1)}
                        onChange={(e) => setJurisdictionFormData({ ...jurisdictionFormData, defaultWhtRentRate: (parseFloat(e.target.value) || 0) / 100 })}
                        className="w-full px-2 py-1.5 border border-gray-300 rounded font-mono font-bold text-right pr-6 bg-white"
                      />
                      <span className="absolute right-2 top-1/2 -translate-y-1/2 font-bold text-gray-500">%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tax ID format */}
              <div>
                <label className="block font-medium text-gray-700 mb-1">Tax ID / VAT Registration Format</label>
                <input
                  type="text"
                  placeholder="e.g. K009-123456789 (9 digits) or 0105542099388 (13 digits)"
                  value={jurisdictionFormData.taxIdFormat}
                  onChange={(e) => setJurisdictionFormData({ ...jurisdictionFormData, taxIdFormat: e.target.value })}
                  className="w-full px-3 py-1.5 border border-gray-300 rounded font-mono text-gray-800"
                />
              </div>

              {/* Compliance Notes */}
              <div>
                <label className="block font-medium text-gray-700 mb-1">Regulatory & Statutory Compliance Notes</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Monthly e-filing required by 20th of following month. Standard e-invoicing mandated."
                  value={jurisdictionFormData.notes}
                  onChange={(e) => setJurisdictionFormData({ ...jurisdictionFormData, notes: e.target.value })}
                  className="w-full px-3 py-1.5 border border-gray-300 rounded"
                />
              </div>

              <div className="mt-5 flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsJurisdictionModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded text-xs font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#d65200] hover:bg-[#bf4700] text-white rounded text-xs font-bold shadow-xs flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  {editingJurisdiction ? 'Save Changes' : 'Create & Apply Jurisdiction'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
