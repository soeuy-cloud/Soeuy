import React, { useState, useEffect } from 'react';
import { 
  Globe2, 
  X, 
  Check, 
  Trash2, 
  Plus, 
  Edit3, 
  ShieldCheck, 
  Building2, 
  Layers, 
  Star, 
  AlertTriangle,
  Save,
  CheckCircle2
} from 'lucide-react';
import { useAccounting } from '../context/AccountingContext';
import { OperatingEntity, CurrencyCode } from '../types';

export const OperatingEntityModal: React.FC = () => {
  const {
    operatingEntities,
    addOperatingEntity,
    updateOperatingEntity,
    deleteOperatingEntity,
    setPrimaryEntity,
    isEntityModalOpen,
    setIsEntityModalOpen,
    selectedEntityForEdit,
    setSelectedEntityForEdit,
    currentUser,
    hasPermission
  } = useAccounting();

  const [isAddingNew, setIsAddingNew] = useState(false);
  const [formData, setFormData] = useState<{
    name: string;
    code: string;
    type: OperatingEntity['type'];
    description: string;
    currency: CurrencyCode;
    taxId: string;
    status: OperatingEntity['status'];
  }>({
    name: '',
    code: '',
    type: 'Branch Office',
    description: '',
    currency: 'USD',
    taxId: '',
    status: 'Connected'
  });

  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string>('');

  useEffect(() => {
    if (selectedEntityForEdit) {
      setIsAddingNew(false);
      setFormData({
        name: selectedEntityForEdit.name,
        code: selectedEntityForEdit.code,
        type: selectedEntityForEdit.type,
        description: selectedEntityForEdit.description,
        currency: selectedEntityForEdit.currency,
        taxId: selectedEntityForEdit.taxId || '',
        status: selectedEntityForEdit.status
      });
    } else {
      setIsAddingNew(false);
      setFormData({
        name: '',
        code: `ENT-0${operatingEntities.length + 1}`,
        type: 'Branch Office',
        description: '',
        currency: 'USD',
        taxId: '',
        status: 'Connected'
      });
    }
  }, [selectedEntityForEdit, operatingEntities.length, isEntityModalOpen]);

  if (!isEntityModalOpen) return null;

  const handleStartAddNew = () => {
    setSelectedEntityForEdit(null);
    setIsAddingNew(true);
    setFormData({
      name: '',
      code: `BR-0${operatingEntities.length + 1}`,
      type: 'Branch Office',
      description: '',
      currency: 'USD',
      taxId: '',
      status: 'Connected'
    });
  };

  const handleSelectToEdit = (ent: OperatingEntity) => {
    setIsAddingNew(false);
    setSelectedEntityForEdit(ent);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('Entity name is required.');
      return;
    }
    if (!formData.code.trim()) {
      alert('Entity code is required.');
      return;
    }

    if (isAddingNew) {
      addOperatingEntity({
        name: formData.name,
        code: formData.code,
        type: formData.type,
        description: formData.description,
        currency: formData.currency,
        taxId: formData.taxId,
        status: formData.status
      });
      setSuccessMsg(`Operating entity "${formData.name}" added successfully.`);
      setIsAddingNew(false);
    } else if (selectedEntityForEdit) {
      updateOperatingEntity(selectedEntityForEdit.id, {
        name: formData.name,
        code: formData.code,
        type: formData.type,
        description: formData.description,
        currency: formData.currency,
        taxId: formData.taxId,
        status: formData.status
      });
      setSuccessMsg(`Entity "${formData.name}" updated successfully.`);
    }

    setTimeout(() => {
      setSuccessMsg('');
    }, 2500);
  };

  const handleDelete = (id: string) => {
    const success = deleteOperatingEntity(id);
    if (success) {
      if (selectedEntityForEdit?.id === id) {
        setSelectedEntityForEdit(null);
      }
      setDeleteConfirmId(null);
      setSuccessMsg('Operating entity deleted.');
      setTimeout(() => setSuccessMsg(''), 2500);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full p-6 shadow-2xl animate-in fade-in-50 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-gray-200 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-100 text-blue-700 rounded-lg">
              <Globe2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">
                Operating Entities & Subsidiaries Setup
              </h3>
              <p className="text-xs text-gray-500 font-sans">
                Configure corporate legal branches, business units, multi-entity currencies, and primary ledgers
              </p>
            </div>
          </div>
          <button 
            onClick={() => setIsEntityModalOpen(false)}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-md hover:bg-gray-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {successMsg && (
          <div className="mt-3 p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-md flex items-center gap-2 font-semibold text-xs animate-in fade-in shrink-0">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Content Layout: 2 Columns (List on Left, Form/Editor on Right) */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mt-4 overflow-y-auto flex-1 pr-1">
          {/* Left Column: Entities List */}
          <div className="md:col-span-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                Configured Entities ({operatingEntities.length})
              </span>
              <button
                type="button"
                onClick={handleStartAddNew}
                className="flex items-center gap-1 px-2.5 py-1 bg-[#d65200] hover:bg-[#b84300] text-white rounded text-xs font-bold shadow-2xs transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Entity</span>
              </button>
            </div>

            <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
              {operatingEntities.map((ent) => {
                const isSelected = (!isAddingNew && selectedEntityForEdit?.id === ent.id);
                return (
                  <div
                    key={ent.id}
                    onClick={() => handleSelectToEdit(ent)}
                    className={`p-3 rounded-lg border text-xs cursor-pointer transition flex flex-col justify-between gap-2 ${
                      isSelected
                        ? 'border-[#d65200] bg-orange-50/60 ring-1 ring-[#d65200]/30'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="font-bold text-gray-900 flex items-center gap-1.5">
                          <span>{ent.name}</span>
                          {ent.status === 'Primary' && (
                            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded">
                              <Star className="w-2.5 h-2.5 fill-emerald-600 text-emerald-600" />
                              <span>Primary</span>
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-gray-500 font-mono mt-0.5">
                          Code: {ent.code} • {ent.type}
                        </div>
                        <div className="text-[11px] text-gray-600 mt-1 line-clamp-1">
                          {ent.description || 'No description entered.'}
                        </div>
                      </div>

                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded shrink-0 ${
                        ent.status === 'Primary' ? 'bg-emerald-100 text-emerald-800' :
                        ent.status === 'Connected' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {ent.status}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-[11px] text-gray-500">
                      <span className="font-mono font-medium">Currency: {ent.currency}</span>
                      <div className="flex items-center gap-2">
                        {ent.status !== 'Primary' && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setPrimaryEntity(ent.id);
                            }}
                            className="text-[#d65200] hover:underline font-semibold text-[10px]"
                            title="Make this the Primary Ledger entity"
                          >
                            Set Primary
                          </button>
                        )}
                        {ent.status !== 'Primary' && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteConfirmId(ent.id);
                            }}
                            className="text-gray-400 hover:text-rose-600 p-0.5"
                            title="Delete entity"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Entity Details & Edit Form */}
          <div className="md:col-span-7 bg-gray-50/70 p-4 rounded-lg border border-gray-200 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-gray-200 pb-2.5 mb-3.5">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-orange-100 text-[#d65200] rounded">
                    <Edit3 className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-gray-900">
                      {isAddingNew ? 'Create New Operating Entity' : (selectedEntityForEdit ? `Edit Entity: ${selectedEntityForEdit.name}` : 'Select an Entity to Edit')}
                    </h4>
                    <span className="text-[11px] text-gray-500">
                      {isAddingNew ? 'Add a new corporate business unit or branch' : 'Modify legal entity metadata & ledger preferences'}
                    </span>
                  </div>
                </div>

                {!isAddingNew && selectedEntityForEdit && selectedEntityForEdit.status !== 'Primary' && (
                  <button
                    type="button"
                    onClick={() => setPrimaryEntity(selectedEntityForEdit.id)}
                    className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded text-[11px] font-bold flex items-center gap-1 transition"
                  >
                    <Star className="w-3 h-3 fill-emerald-600 text-emerald-600" />
                    <span>Make Primary Ledger</span>
                  </button>
                )}
              </div>

              <form id="entity-edit-form" onSubmit={handleSave} className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">
                      Entity Legal / Display Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Suite Regional Branch"
                      className="w-full px-3 py-1.5 border border-gray-300 rounded font-medium text-gray-900 focus:ring-1 focus:ring-[#d65200]"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">
                      Entity Code / ID <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                      placeholder="e.g. BR-02"
                      className="w-full px-3 py-1.5 border border-gray-300 rounded font-mono font-bold text-gray-900 focus:ring-1 focus:ring-[#d65200]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">
                      Entity Classification / Type
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value as OperatingEntity['type'] })}
                      className="w-full px-3 py-1.5 border border-gray-300 rounded bg-white font-medium text-gray-900 focus:ring-1 focus:ring-[#d65200]"
                    >
                      <option value="Headquarters">Headquarters (Main Central)</option>
                      <option value="Branch Office">Branch Office (Domestic/Regional)</option>
                      <option value="Digital Services">Digital Services & E-Commerce</option>
                      <option value="Subsidiary">Subsidiary / Subsidiary Company</option>
                      <option value="Regional Unit">Regional Unit & Representative Office</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">
                      Operating Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as OperatingEntity['status'] })}
                      className="w-full px-3 py-1.5 border border-gray-300 rounded bg-white font-medium text-gray-900 focus:ring-1 focus:ring-[#d65200]"
                    >
                      <option value="Primary">Primary (Central Ledger)</option>
                      <option value="Connected">Connected (Active Intercompany)</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">
                      Operating Base Currency
                    </label>
                    <select
                      value={formData.currency}
                      onChange={(e) => setFormData({ ...formData, currency: e.target.value as CurrencyCode })}
                      className="w-full px-3 py-1.5 border border-gray-300 rounded bg-white font-medium text-gray-900 focus:ring-1 focus:ring-[#d65200]"
                    >
                      <option value="USD">USD ($) - US Dollar</option>
                      <option value="EUR">EUR (€) - Euro</option>
                      <option value="GBP">GBP (£) - British Pound</option>
                      <option value="SGD">SGD (S$) - Singapore Dollar</option>
                      <option value="THB">THB (฿) - Thai Baht</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">
                      Branch Tax ID / Extension
                    </label>
                    <input
                      type="text"
                      value={formData.taxId}
                      onChange={(e) => setFormData({ ...formData, taxId: e.target.value })}
                      placeholder="e.g. 0105542099388-00001"
                      className="w-full px-3 py-1.5 border border-gray-300 rounded font-mono text-gray-900 focus:ring-1 focus:ring-[#d65200]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Description & Operating Scope
                  </label>
                  <textarea
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Brief description of operations, branch location, commercial activity..."
                    className="w-full px-3 py-1.5 border border-gray-300 rounded text-gray-900 focus:ring-1 focus:ring-[#d65200]"
                  />
                </div>
              </form>
            </div>

            {/* Bottom Actions */}
            <div className="pt-3 border-t border-gray-200 flex items-center justify-between mt-4">
              {selectedEntityForEdit && !isAddingNew && selectedEntityForEdit.status !== 'Primary' ? (
                <button
                  type="button"
                  onClick={() => setDeleteConfirmId(selectedEntityForEdit.id)}
                  className="text-rose-600 hover:text-rose-700 font-semibold text-xs flex items-center gap-1 hover:bg-rose-50 px-2 py-1 rounded transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Entity</span>
                </button>
              ) : <div />}

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsEntityModalOpen(false)}
                  className="px-3.5 py-1.5 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 font-semibold text-xs"
                >
                  Close
                </button>
                <button
                  form="entity-edit-form"
                  type="submit"
                  className="px-4 py-1.5 bg-[#d65200] hover:bg-[#bf4700] text-white rounded font-bold shadow-xs text-xs flex items-center gap-1.5 transition"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{isAddingNew ? 'Create Entity' : 'Save Entity Changes'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Delete Confirmation Modal Overlay */}
        {deleteConfirmId && (
          <div className="fixed inset-0 bg-black/60 z-60 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-5 shadow-2xl animate-in fade-in-50">
              <div className="flex items-center gap-3 text-rose-600 mb-3">
                <div className="p-2 bg-rose-100 rounded-full">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-gray-900">
                  Delete Operating Entity
                </h4>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed">
                Are you sure you want to remove this operating entity? Associated transactions will remain in the general ledger but will no longer show this entity in active filters.
              </p>
              <div className="mt-4 flex justify-end gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setDeleteConfirmId(null)}
                  className="px-3 py-1.5 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(deleteConfirmId)}
                  className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded font-bold"
                >
                  Confirm Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
