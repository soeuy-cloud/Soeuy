import React, { useState, useEffect } from 'react';
import { 
  X, 
  Link2, 
  Search, 
  Building2, 
  Users, 
  FileText, 
  Package, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle,
  FolderTree,
  DollarSign,
  Sparkles,
  BookOpen
} from 'lucide-react';
import { useAccounting } from '../context/AccountingContext';

export const AccountLinkerModal: React.FC = () => {
  const {
    isAccountLinkerOpen,
    setIsAccountLinkerOpen,
    selectedEntityForLink,
    setSelectedEntityForLink,
    accounts,
    customers,
    vendors,
    transactions,
    linkEntityNameToAccount,
    formatCurrency
  } = useAccounting();

  // Search & selections
  const [entitySearch, setEntitySearch] = useState('');
  const [selectedEntityName, setSelectedEntityName] = useState('');
  const [selectedEntityType, setSelectedEntityType] = useState<'Customer' | 'Vendor' | 'Service Item' | 'Transaction Name' | 'General Entity'>('Customer');
  const [targetAccountId, setTargetAccountId] = useState('');
  const [accountCategoryFilter, setAccountCategoryFilter] = useState<string>('All');
  const [accountSearch, setAccountSearch] = useState('');
  
  // Feedback
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Initialize from selectedEntityForLink when opened
  useEffect(() => {
    if (selectedEntityForLink) {
      setSelectedEntityName(selectedEntityForLink.entityName || '');
      if (selectedEntityForLink.entityType) {
        setSelectedEntityType(selectedEntityForLink.entityType as any);
      }
      if (selectedEntityForLink.currentAccountId) {
        setTargetAccountId(selectedEntityForLink.currentAccountId);
      }
    } else if (customers.length > 0 && !selectedEntityName) {
      setSelectedEntityName(customers[0].companyName);
      setSelectedEntityType('Customer');
    }
  }, [selectedEntityForLink, customers]);

  if (!isAccountLinkerOpen) return null;

  // Build entity suggestions list
  const customerList = customers.map(c => ({ name: c.companyName, type: 'Customer' as const, sub: c.code }));
  const vendorList = vendors.map(v => ({ name: v.companyName, type: 'Vendor' as const, sub: v.code }));
  const serviceList = [
    { name: 'Inbound Tour Package Revenue', type: 'Service Item' as const, sub: 'Item #SRV-TOUR-01' },
    { name: 'Hotel Accommodation Allotment', type: 'Service Item' as const, sub: 'Item #HTL-ALLOT-02' },
    { name: 'Tour Coach Fleet & Transport', type: 'Service Item' as const, sub: 'Item #TRN-COACH-03' },
    { name: 'Licensed Tour Guide Services', type: 'Service Item' as const, sub: 'Item #GDE-SRV-04' },
    { name: 'Flight & Ferry Ticketing', type: 'Service Item' as const, sub: 'Item #TCK-FLT-05' },
    { name: 'National Park & Museum Admissions', type: 'Service Item' as const, sub: 'Item #ENT-ADM-06' },
  ];

  const allEntities = [...customerList, ...vendorList, ...serviceList];
  const filteredEntities = allEntities.filter(e => 
    !entitySearch || 
    e.name.toLowerCase().includes(entitySearch.toLowerCase()) || 
    e.sub.toLowerCase().includes(entitySearch.toLowerCase())
  );

  // Filter accounts
  const filteredAccounts = accounts.filter(acc => {
    const matchesCategory = accountCategoryFilter === 'All' || acc.category === accountCategoryFilter;
    const matchesSearch = 
      !accountSearch || 
      acc.number.toLowerCase().includes(accountSearch.toLowerCase()) ||
      acc.name.toLowerCase().includes(accountSearch.toLowerCase()) ||
      (acc.thaiName && acc.thaiName.toLowerCase().includes(accountSearch.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  // Calculate matching transactions for selected entity name
  const matchingTransactions = transactions.filter(tx => {
    if (!selectedEntityName) return false;
    const nameLower = selectedEntityName.toLowerCase();
    return (
      (tx.entityName && tx.entityName.toLowerCase().includes(nameLower)) ||
      (tx.memo && tx.memo.toLowerCase().includes(nameLower)) ||
      tx.lineItems.some(li => 
        (li.description && li.description.toLowerCase().includes(nameLower)) ||
        (li.accountName && li.accountName.toLowerCase().includes(nameLower))
      )
    );
  });

  const selectedTargetAccount = accounts.find(a => a.id === targetAccountId || a.number === targetAccountId);

  const handleApplyLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEntityName.trim()) {
      setStatusMessage({ type: 'error', text: 'Please select or enter an Entity or Item Name to link.' });
      return;
    }
    if (!targetAccountId) {
      setStatusMessage({ type: 'error', text: 'Please select a destination GL Account from the Chart of Accounts.' });
      return;
    }

    const result = linkEntityNameToAccount(selectedEntityName, targetAccountId, selectedEntityType);
    if (result.success) {
      setStatusMessage({ 
        type: 'success', 
        text: `${result.message} (${result.affectedCount} transaction entries updated)` 
      });
      setTimeout(() => {
        // Clear message after 3 seconds
        setStatusMessage(null);
      }, 4000);
    } else {
      setStatusMessage({ type: 'error', text: result.message });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 z-50 animate-in fade-in duration-150">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col border border-gray-200 overflow-hidden">
        
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#d65200] flex items-center justify-center text-white shadow-xs">
              <Link2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white">
                  Link Name to Other Account
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 bg-orange-500/30 text-orange-200 border border-orange-400/30 rounded-full">
                  GL Mapping Tool
                </span>
              </div>
              <p className="text-xs text-gray-300 mt-0.5">
                Map any customer, vendor, service item, or transaction name to another account in the Chart of Accounts
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setIsAccountLinkerOpen(false);
              setSelectedEntityForLink(null);
            }}
            className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Notification */}
        {statusMessage && (
          <div className={`px-4 py-2.5 flex items-center gap-2 text-xs font-semibold shrink-0 ${
            statusMessage.type === 'success' 
              ? 'bg-emerald-50 text-emerald-800 border-b border-emerald-200' 
              : 'bg-rose-50 text-rose-800 border-b border-rose-200'
          }`}>
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{statusMessage.text}</span>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-5">
          <form onSubmit={handleApplyLink} className="space-y-5">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              
              {/* Left Column: Select Entity / Name */}
              <div className="bg-gray-50/80 border border-gray-200 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#d65200]"></span>
                    1. Select Name / Entity to Link
                  </label>
                  <span className="text-[10px] text-gray-500">Source Entity</span>
                </div>

                {/* Direct Name Input */}
                <div>
                  <label className="text-[11px] font-semibold text-gray-700 block mb-1">
                    Entity / Item / Transaction Name:
                  </label>
                  <input
                    type="text"
                    required
                    value={selectedEntityName}
                    onChange={(e) => setSelectedEntityName(e.target.value)}
                    placeholder="e.g. Exo Travel Group, Tour Accommodation, etc."
                    className="w-full px-3 py-2 text-xs bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d65200] font-semibold text-gray-900 shadow-2xs"
                  />
                </div>

                {/* Entity Type Picker */}
                <div>
                  <label className="text-[11px] font-semibold text-gray-700 block mb-1">
                    Entity Type / Classification:
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {(['Customer', 'Vendor', 'Service Item', 'Transaction Name', 'General Entity'] as const).map(type => (
                      <button
                        type="button"
                        key={type}
                        onClick={() => setSelectedEntityType(type)}
                        className={`px-2 py-1.5 rounded text-[11px] font-semibold transition truncate ${
                          selectedEntityType === type
                            ? 'bg-[#d65200] text-white shadow-xs'
                            : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Quick Pick from Master List */}
                <div className="pt-2 border-t border-gray-200">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] font-semibold text-gray-600 flex items-center gap-1">
                      <Search className="w-3 h-3 text-gray-400" /> Or Choose from Master Records:
                    </span>
                  </div>
                  
                  <input
                    type="text"
                    value={entitySearch}
                    onChange={(e) => setEntitySearch(e.target.value)}
                    placeholder="Search customers, vendors, items..."
                    className="w-full px-2.5 py-1 text-xs bg-white border border-gray-200 rounded mb-2"
                  />

                  <div className="max-h-36 overflow-y-auto divide-y divide-gray-100 border border-gray-200 rounded bg-white text-xs">
                    {filteredEntities.map((ent, idx) => {
                      const isSelected = selectedEntityName === ent.name;
                      return (
                        <button
                          type="button"
                          key={idx}
                          onClick={() => {
                            setSelectedEntityName(ent.name);
                            setSelectedEntityType(ent.type);
                          }}
                          className={`w-full px-3 py-1.5 text-left flex items-center justify-between hover:bg-orange-50/70 transition ${
                            isSelected ? 'bg-orange-100/70 font-bold text-[#d65200]' : 'text-gray-700'
                          }`}
                        >
                          <div className="truncate pr-2">
                            <span className="font-medium">{ent.name}</span>
                            <span className="text-[10px] text-gray-400 block font-mono">{ent.sub}</span>
                          </div>
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 font-bold uppercase shrink-0">
                            {ent.type}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

              </div>

              {/* Right Column: Select Target Account */}
              <div className="bg-gray-50/80 border border-gray-200 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                    2. Select Target GL Account to Link
                  </label>
                  <span className="text-[10px] text-gray-500">Destination Account</span>
                </div>

                {/* Category Tabs for Accounts */}
                <div className="flex items-center gap-1 overflow-x-auto pb-1">
                  {['All', 'Asset', 'Liability', 'Revenue', 'Expense'].map(cat => (
                    <button
                      type="button"
                      key={cat}
                      onClick={() => setAccountCategoryFilter(cat)}
                      className={`px-2.5 py-1 rounded text-[11px] font-semibold transition shrink-0 ${
                        accountCategoryFilter === cat
                          ? 'bg-gray-900 text-white'
                          : 'bg-white text-gray-600 hover:bg-gray-200 border border-gray-200'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {/* Account Search */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={accountSearch}
                    onChange={(e) => setAccountSearch(e.target.value)}
                    placeholder="Search account number, name, category..."
                    className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#d65200]"
                  />
                </div>

                {/* Account Selector List */}
                <div className="max-h-52 overflow-y-auto divide-y divide-gray-100 border border-gray-200 rounded-lg bg-white text-xs shadow-2xs">
                  {filteredAccounts.map(acc => {
                    const isSelected = targetAccountId === acc.id || targetAccountId === acc.number;
                    return (
                      <button
                        type="button"
                        key={acc.id}
                        onClick={() => setTargetAccountId(acc.id)}
                        className={`w-full px-3 py-2 text-left flex items-center justify-between hover:bg-orange-50/70 transition ${
                          isSelected ? 'bg-orange-100/90 font-bold text-[#d65200] border-l-4 border-[#d65200]' : 'text-gray-700'
                        }`}
                      >
                        <div className="min-w-0 pr-2">
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-xs font-bold text-gray-900">{acc.number}</span>
                            <span className="truncate">{acc.name}</span>
                          </div>
                          {acc.thaiName && (
                            <span className="text-[10px] text-gray-400 truncate block">{acc.thaiName}</span>
                          )}
                        </div>
                        <div className="text-right shrink-0">
                          <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                            acc.category === 'Revenue' ? 'bg-emerald-100 text-emerald-800' :
                            acc.category === 'Expense' ? 'bg-rose-100 text-rose-800' :
                            acc.category === 'Asset' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {acc.category}
                          </span>
                          <div className="text-[10px] font-mono text-gray-500 mt-0.5">
                            {formatCurrency(acc.balance, acc.currency)}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Selected Target Summary */}
                {selectedTargetAccount && (
                  <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-xs flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <div>
                        <span className="text-emerald-900 font-bold">Target Account:</span>
                        <span className="text-emerald-800 font-mono ml-1">#{selectedTargetAccount.number} - {selectedTargetAccount.name}</span>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                      {selectedTargetAccount.type}
                    </span>
                  </div>
                )}

              </div>

            </div>

            {/* Impact & Matching Transactions Preview */}
            <div className="bg-amber-50/70 border border-amber-200/80 rounded-lg p-4 text-xs space-y-2">
              <div className="flex items-center justify-between font-bold text-amber-900">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <span>Mapping Preview for "{selectedEntityName || 'Selected Name'}"</span>
                </span>
                <span className="text-[11px] bg-amber-200/60 text-amber-900 px-2 py-0.5 rounded font-mono">
                  {matchingTransactions.length} matching transactions found
                </span>
              </div>
              <p className="text-[11px] text-amber-800">
                Applying this link will automatically associate all current and future transactions for <b>{selectedEntityName}</b> to GL Account <b>{selectedTargetAccount ? `#${selectedTargetAccount.number} (${selectedTargetAccount.name})` : '(No account chosen yet)'}</b> in the General Ledger.
              </p>

              {matchingTransactions.length > 0 && (
                <div className="mt-2 max-h-24 overflow-y-auto divide-y divide-amber-200/60 border border-amber-200 rounded bg-white text-[11px]">
                  {matchingTransactions.slice(0, 5).map(t => (
                    <div key={t.id} className="p-2 flex items-center justify-between text-gray-700">
                      <span className="font-mono font-bold text-gray-900">{t.transactionNumber}</span>
                      <span className="truncate max-w-[200px]">{t.entityName}</span>
                      <span className="font-mono text-gray-900">{formatCurrency(t.total, t.currency)}</span>
                      <span className="text-gray-400">{t.date}</span>
                    </div>
                  ))}
                  {matchingTransactions.length > 5 && (
                    <div className="p-1.5 text-center text-gray-500 font-semibold bg-gray-50 text-[10px]">
                      + {matchingTransactions.length - 5} more transactions will be updated
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-gray-200">
              <div className="text-xs text-gray-500">
                Ready to link name to account
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsAccountLinkerOpen(false);
                    setSelectedEntityForLink(null);
                  }}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-semibold transition"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={!selectedEntityName || !targetAccountId}
                  className={`px-5 py-2 rounded-lg text-xs font-bold text-white transition flex items-center gap-1.5 shadow-sm ${
                    !selectedEntityName || !targetAccountId
                      ? 'bg-gray-400 cursor-not-allowed opacity-60'
                      : 'bg-[#d65200] hover:bg-[#b84300] hover:shadow-md'
                  }`}
                >
                  <Link2 className="w-3.5 h-3.5" />
                  <span>Apply Link to Account</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

          </form>
        </div>

      </div>
    </div>
  );
};
