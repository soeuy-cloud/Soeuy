import React, { useState } from 'react';
import { 
  Plus, 
  Percent, 
  Truck, 
  Laptop, 
  Building, 
  Calculator, 
  CheckCircle2, 
  History,
  AlertCircle
} from 'lucide-react';
import { useAccounting } from '../context/AccountingContext';
import { FixedAsset } from '../types';

export const FixedAssets: React.FC = () => {
  const { fixedAssets, formatCurrency, addFixedAsset, runMonthlyDepreciation, currentCurrency } = useAccounting();

  const [isNewAssetModalOpen, setIsNewAssetModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Form states
  const [name, setName] = useState('');
  const [category, setCategory] = useState<FixedAsset['category']>('Vehicles');
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split('T')[0]);
  const [cost, setCost] = useState('');
  const [salvageValue, setSalvageValue] = useState('0');
  const [usefulLifeYears, setUsefulLifeYears] = useState('5');
  const [location, setLocation] = useState('Bangkok Fleet Garage');
  const [department, setDepartment] = useState('Transport & Fleet Operations');
  const [serialNumber, setSerialNumber] = useState('');

  const totalOriginalCost = fixedAssets.reduce((sum, a) => sum + a.cost, 0);
  const totalAccumDepr = fixedAssets.reduce((sum, a) => sum + a.accumulatedDepreciation, 0);
  const totalNetBookValue = fixedAssets.reduce((sum, a) => sum + a.netBookValue, 0);

  const filteredAssets = fixedAssets.filter(a => {
    if (selectedCategory === 'All') return true;
    return a.category === selectedCategory;
  });

  const handleCreateAsset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !cost) return;

    const parsedCost = parseFloat(cost) || 0;
    const parsedSalvage = parseFloat(salvageValue) || 0;
    const parsedYears = parseInt(usefulLifeYears) || 5;

    const nextCode = `FA-${category.substring(0, 3).toUpperCase()}-${(fixedAssets.length + 1).toString().padStart(3, '0')}`;

    addFixedAsset({
      assetCode: nextCode,
      name,
      category,
      purchaseDate,
      cost: parsedCost,
      salvageValue: parsedSalvage,
      usefulLifeYears: parsedYears,
      depreciationMethod: 'Straight-Line',
      status: 'Active',
      location,
      department,
      serialNumber,
    });

    setIsNewAssetModalOpen(false);
    setName('');
    setCost('');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              Fixed Asset Register & Depreciation Management
            </h1>
            <p className="text-xs text-gray-500">
              Straight-line asset depreciation for VIP tour buses, executive fleet, ERP servers, and fixtures.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={runMonthlyDepreciation}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-gray-900 rounded text-xs font-bold shadow-xs transition"
            >
              <Calculator className="w-3.5 h-3.5" />
              <span>Run Monthly Depreciation Batch</span>
            </button>
            <button
              onClick={() => setIsNewAssetModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#d65200] hover:bg-[#b84300] text-white rounded text-xs font-bold shadow-xs transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Acquire Asset</span>
            </button>
          </div>
        </div>

        {/* Metric Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 pt-3 border-t border-gray-100 text-xs">
          <div className="p-3 bg-gray-50 rounded border border-gray-200">
            <span className="text-gray-500">Total Historical Acquisition Cost</span>
            <div className="text-lg font-bold font-mono text-gray-900 mt-1">{formatCurrency(totalOriginalCost)}</div>
          </div>
          <div className="p-3 bg-rose-50 rounded border border-rose-100">
            <span className="text-rose-700 font-medium">Accumulated Depreciation</span>
            <div className="text-lg font-bold font-mono text-rose-900 mt-1">-{formatCurrency(totalAccumDepr)}</div>
          </div>
          <div className="p-3 bg-emerald-50 rounded border border-emerald-100">
            <span className="text-emerald-700 font-medium">Net Book Value</span>
            <div className="text-lg font-bold font-mono text-emerald-900 mt-1">{formatCurrency(totalNetBookValue)}</div>
          </div>
        </div>
      </div>

      {/* Assets Grid / Table */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-2xs overflow-hidden">
        <div className="p-3 bg-gray-50/80 border-b border-gray-200 flex items-center justify-between">
          <div className="flex rounded border border-gray-200 p-0.5 bg-white text-xs">
            {['All', 'Vehicles', 'IT Equipment', 'Office Furniture'].map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded transition ${selectedCategory === cat ? 'bg-[#d65200] text-white font-bold' : 'text-gray-600'}`}
              >
                {cat}
              </button>
            ))}
          </div>
          <span className="text-xs font-mono text-gray-500">{filteredAssets.length} Assets Registered</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-gray-600 border-b border-gray-200 text-[11px] uppercase">
              <tr>
                <th className="py-3 px-3">Asset Code</th>
                <th className="py-3 px-3">Asset Description</th>
                <th className="py-3 px-3">Category</th>
                <th className="py-3 px-3">Acquired Date</th>
                <th className="py-3 px-3 text-right">Original Cost</th>
                <th className="py-3 px-3 text-right">Accum. Depr.</th>
                <th className="py-3 px-3 text-right">Net Book Value</th>
                <th className="py-3 px-3 text-center">Life (Yrs)</th>
                <th className="py-3 px-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredAssets.map(asset => (
                <tr key={asset.id} className="hover:bg-orange-50/30 transition">
                  <td className="py-3 px-3 font-mono font-bold text-[#d65200]">{asset.assetCode}</td>
                  <td className="py-3 px-3">
                    <div className="font-semibold text-gray-900">{asset.name}</div>
                    <div className="text-[10px] text-gray-500 font-mono">Location: {asset.location} • Dept: {asset.department}</div>
                  </td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-[10px] font-medium">
                      {asset.category}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-mono text-gray-600">{asset.purchaseDate}</td>
                  <td className="py-3 px-3 text-right font-mono font-medium">{formatCurrency(asset.cost)}</td>
                  <td className="py-3 px-3 text-right font-mono text-rose-600 font-medium">
                    -{formatCurrency(asset.accumulatedDepreciation)}
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-gray-900">
                    {formatCurrency(asset.netBookValue)}
                  </td>
                  <td className="py-3 px-3 text-center font-mono">{asset.usefulLifeYears} yrs</td>
                  <td className="py-3 px-3 text-center">
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-full">
                      {asset.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Asset Modal */}
      {isNewAssetModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-lg w-full p-6 shadow-2xl animate-in fade-in-50">
            <h3 className="text-base font-bold text-gray-900">
              Acquire New Fixed Asset
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              Add capital expenditure asset to the Small Business asset register.
            </p>

            <form onSubmit={handleCreateAsset} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="block font-medium text-gray-700 mb-1">Asset Name & Model *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Scania VIP 45-Seat Luxury Coach"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-1.5 border border-gray-300 rounded"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-gray-700 mb-1">Category *</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full px-3 py-1.5 border border-gray-300 rounded bg-white"
                  >
                    <option value="Vehicles">Vehicles</option>
                    <option value="IT Equipment">IT Equipment</option>
                    <option value="Office Furniture">Office Furniture</option>
                    <option value="Buildings">Buildings & Leaseholds</option>
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-gray-700 mb-1">Purchase Date *</label>
                  <input
                    type="date"
                    required
                    value={purchaseDate}
                    onChange={(e) => setPurchaseDate(e.target.value)}
                    className="w-full px-3 py-1.5 border border-gray-300 rounded font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-medium text-gray-700 mb-1">Cost ({currentCurrency}) *</label>
                  <input
                    type="number"
                    required
                    placeholder="4500000"
                    value={cost}
                    onChange={(e) => setCost(e.target.value)}
                    className="w-full px-3 py-1.5 border border-gray-300 rounded font-mono"
                  />
                </div>
                <div>
                  <label className="block font-medium text-gray-700 mb-1">Salvage Value</label>
                  <input
                    type="number"
                    value={salvageValue}
                    onChange={(e) => setSalvageValue(e.target.value)}
                    className="w-full px-3 py-1.5 border border-gray-300 rounded font-mono"
                  />
                </div>
                <div>
                  <label className="block font-medium text-gray-700 mb-1">Useful Life (Yrs)</label>
                  <input
                    type="number"
                    value={usefulLifeYears}
                    onChange={(e) => setUsefulLifeYears(e.target.value)}
                    className="w-full px-3 py-1.5 border border-gray-300 rounded font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-gray-700 mb-1">Location</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full px-3 py-1.5 border border-gray-300 rounded"
                  />
                </div>
                <div>
                  <label className="block font-medium text-gray-700 mb-1">Serial Number / Chassis #</label>
                  <input
                    type="text"
                    placeholder="e.g. CHASSIS-88912"
                    value={serialNumber}
                    onChange={(e) => setSerialNumber(e.target.value)}
                    className="w-full px-3 py-1.5 border border-gray-300 rounded font-mono"
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-2 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsNewAssetModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded text-xs font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#d65200] hover:bg-[#b84300] text-white rounded text-xs font-bold shadow-xs"
                >
                  Save Fixed Asset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
