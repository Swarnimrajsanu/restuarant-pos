'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import AppShell from '@/components/layout/app-shell';
import { api } from '@/lib/api';
import { useTranslation } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import type { RawMaterial } from '@/types';
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  X,
  Layers,
  AlertTriangle,
  RefreshCw,
  Boxes,
  Truck,
  IndianRupee,
  AlertCircle,
  History,
  User,
  Calendar,
} from 'lucide-react';

// ─── Modal Component ────────────────────────────────────────────────────────
function Modal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />
      {/* Content */}
      <div className="relative z-10 w-full max-w-md animate-in fade-in zoom-in-95 duration-200 rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">{title}</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 cursor-pointer"
          >
            <X className="size-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ─── Confirmation Dialog ────────────────────────────────────────────────────
function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  message,
  loading,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  loading?: boolean;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-sm animate-in fade-in zoom-in-95 duration-200 rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-2 flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-full bg-red-100">
            <AlertTriangle className="size-5 text-red-500" />
          </div>
          <h2 className="text-lg font-bold text-slate-900">{title}</h2>
        </div>
        <p className="mb-6 ml-[52px] text-sm text-slate-500">{message}</p>
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose} disabled={loading} className="cursor-pointer">
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={loading}
            className="cursor-pointer"
          >
            {loading ? 'Deleting...' : 'Delete'}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Table Skeleton ─────────────────────────────────────────────────────────
function TableSkeleton() {
  return (
    <div className="space-y-3">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-center gap-4 rounded-xl bg-white p-4 border border-slate-100 animate-pulse">
          <Skeleton className="size-9 rounded-lg" />
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-5 w-32" />
          <div className="flex-1" />
          <Skeleton className="h-8 w-16" />
        </div>
      ))}
    </div>
  );
}

// ─── Main Inventory Page ───────────────────────────────────────────────────
export default function InventoryPage() {
  const { t, language } = useTranslation();

  // Active view: 'list' (Stock List) | 'usage' (Usage logs)
  const [activeTab, setActiveTab] = useState<'list' | 'usage'>('list');

  // Materials & Logs States
  const [materials, setMaterials] = useState<RawMaterial[]>([]);
  const [usageLogs, setUsageLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  // Form modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<RawMaterial | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    quantity: '',
    unit: 'Kg',
    sellerName: '',
    price: '',
    minStockLevel: '5',
    notes: '',
  });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Delete dialog states
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingMaterial, setDeletingMaterial] = useState<RawMaterial | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Fetch Inventory items
  const fetchInventory = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);
      const data = await api.getRawMaterials();
      setMaterials(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load raw materials');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Fetch Inventory dispatch usage logs
  const fetchUsageLogs = useCallback(async () => {
    try {
      setLoadingLogs(true);
      const logs = await api.getInventoryLogs();
      setUsageLogs(logs || []);
    } catch (err: any) {
      console.error('Error loading consumption logs:', err);
    } finally {
      setLoadingLogs(false);
    }
  }, []);

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  // React to tab switching
  useEffect(() => {
    if (activeTab === 'usage') {
      fetchUsageLogs();
    } else {
      fetchInventory();
    }
  }, [activeTab, fetchInventory, fetchUsageLogs]);

  // Client-side filtering by search name or seller (for stock list) or workerName (for logs)
  const filteredMaterials = useMemo(() => {
    return materials.filter((m) =>
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.sellerName.toLowerCase().includes(search.toLowerCase())
    );
  }, [materials, search]);

  const filteredLogs = useMemo(() => {
    return usageLogs.filter((log) =>
      log.materialName.toLowerCase().includes(search.toLowerCase()) ||
      log.workerName.toLowerCase().includes(search.toLowerCase()) ||
      (log.notes && log.notes.toLowerCase().includes(search.toLowerCase()))
    );
  }, [usageLogs, search]);

  // Inventory analytics / Stats calculation
  const stats = useMemo(() => {
    let totalCost = 0;
    let lowStockCount = 0;
    const uniqueSellers = new Set<string>();

    materials.forEach((m) => {
      totalCost += m.price * m.quantity;
      if (m.quantity <= m.minStockLevel) {
        lowStockCount++;
      }
      if (m.sellerName) {
        uniqueSellers.add(m.sellerName.trim().toLowerCase());
      }
    });

    return {
      totalCost,
      lowStockCount,
      totalSellers: uniqueSellers.size,
      totalItems: materials.length,
    };
  }, [materials]);

  // Open Add modal
  const openAddModal = () => {
    setEditingMaterial(null);
    setFormError(null);
    setFormData({
      name: '',
      quantity: '',
      unit: 'Kg',
      sellerName: '',
      price: '',
      minStockLevel: '5',
      notes: '',
    });
    setModalOpen(true);
  };

  // Open Edit modal
  const openEditModal = (material: RawMaterial) => {
    setEditingMaterial(material);
    setFormError(null);
    setFormData({
      name: material.name,
      quantity: material.quantity.toString(),
      unit: material.unit || 'Kg',
      sellerName: material.sellerName,
      price: material.price.toString(),
      minStockLevel: material.minStockLevel.toString(),
      notes: material.notes || '',
    });
    setModalOpen(true);
  };

  // Save Item (Create/Update)
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Validation
    if (!formData.name.trim()) return setFormError('Material name is required');
    if (!formData.quantity.trim() || isNaN(Number(formData.quantity))) return setFormError('Please enter a valid quantity');
    if (!formData.sellerName.trim()) return setFormError('Seller name is required');
    if (!formData.price.trim() || isNaN(Number(formData.price))) return setFormError('Please enter a valid price');
    if (!formData.minStockLevel.trim() || isNaN(Number(formData.minStockLevel))) return setFormError('Please enter a valid stock threshold');

    try {
      setSaving(true);
      const payload = {
        name: formData.name.trim(),
        quantity: Number(formData.quantity),
        unit: formData.unit.trim(),
        sellerName: formData.sellerName.trim(),
        price: Number(formData.price),
        minStockLevel: Number(formData.minStockLevel),
        notes: formData.notes.trim() || undefined,
      };

      if (editingMaterial) {
        await api.updateRawMaterial(editingMaterial._id, payload);
      } else {
        await api.createRawMaterial(payload);
      }

      setModalOpen(false);
      fetchInventory();
    } catch (err: any) {
      setFormError(err.message || 'Failed to save inventory item');
    } finally {
      setSaving(false);
    }
  };

  // Delete Item
  const handleDelete = async () => {
    if (!deletingMaterial) return;
    try {
      setDeleting(true);
      await api.deleteRawMaterial(deletingMaterial._id);
      setDeleteDialogOpen(false);
      setDeletingMaterial(null);
      fetchInventory();
    } catch (err: any) {
      setError(err.message || 'Failed to delete inventory item');
    } finally {
      setDeleting(false);
    }
  };

  const handleRefresh = () => {
    if (activeTab === 'usage') {
      fetchUsageLogs();
    } else {
      fetchInventory(true);
    }
  };

  return (
    <AppShell>
      <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-6">
        {/* Page Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{t('inventory')}</h1>
            <p className="mt-1 text-sm text-slate-500">{t('manageInventory')}</p>
          </div>
          <div className="flex gap-2 self-start">
            <button
              onClick={handleRefresh}
              disabled={refreshing || loadingLogs}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-colors disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className={`size-4 ${refreshing || loadingLogs ? 'animate-spin' : ''}`} />
              {t('refresh')}
            </button>
            {activeTab === 'list' && (
              <Button
                onClick={openAddModal}
                className="gap-2 bg-amber-500 hover:bg-amber-600 text-white font-semibold cursor-pointer shadow-sm shadow-amber-500/25 animate-in fade-in"
              >
                <Plus className="size-4" />
                {t('addMaterial')}
              </Button>
            )}
          </div>
        </div>

        {/* ─── Stats Dashboard grid ─── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in slide-in-from-top-3 duration-250">
          {/* Card 1: Total Inventory Value */}
          <div className="bg-white rounded-2xl border border-slate-200/60 p-4 lg:p-5 flex items-center gap-4 shadow-2xs hover:shadow-sm transition-all">
            <div className="flex size-11 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <IndianRupee className="size-5 font-bold" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{t('totalInventoryCost')}</p>
              <h3 className="text-lg lg:text-xl font-bold text-slate-900 mt-0.5">
                ₹{stats.totalCost.toLocaleString('en-IN')}
              </h3>
            </div>
          </div>

          {/* Card 2: Low Stock Alerts */}
          <div className="bg-white rounded-2xl border border-slate-200/60 p-4 lg:p-5 flex items-center gap-4 shadow-2xs hover:shadow-sm transition-all">
            <div className={`flex size-11 items-center justify-center rounded-xl ${stats.lowStockCount > 0 ? 'bg-red-50 text-red-600 animate-pulse' : 'bg-emerald-50 text-emerald-600'}`}>
              <AlertCircle className="size-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{t('lowStockAlerts')}</p>
              <h3 className="text-lg lg:text-xl font-bold text-slate-900 mt-0.5">
                {stats.lowStockCount}
              </h3>
            </div>
          </div>

          {/* Card 3: Total Materials */}
          <div className="bg-white rounded-2xl border border-slate-200/60 p-4 lg:p-5 flex items-center gap-4 shadow-2xs hover:shadow-sm transition-all">
            <div className="flex size-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <Boxes className="size-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{language === 'en' ? 'Total Materials' : 'कुल सामग्रियां'}</p>
              <h3 className="text-lg lg:text-xl font-bold text-slate-900 mt-0.5">
                {stats.totalItems}
              </h3>
            </div>
          </div>

          {/* Card 4: Total Sellers */}
          <div className="bg-white rounded-2xl border border-slate-200/60 p-4 lg:p-5 flex items-center gap-4 shadow-2xs hover:shadow-sm transition-all">
            <div className="flex size-11 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
              <Truck className="size-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{t('totalSuppliers')}</p>
              <h3 className="text-lg lg:text-xl font-bold text-slate-900 mt-0.5">
                {stats.totalSellers}
              </h3>
            </div>
          </div>
        </div>

        {/* ─── Tabs (List vs Usage Logs) ─── */}
        <div className="flex border-b border-slate-200 bg-slate-100/50 rounded-xl p-1 shrink-0 max-w-md">
          <button
            type="button"
            onClick={() => setActiveTab('list')}
            className={`flex-1 py-2 text-center text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'list'
                ? 'bg-white text-amber-700 shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Boxes className="size-3.5" />
            {t('stockList')}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('usage')}
            className={`flex-1 py-2 text-center text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'usage'
                ? 'bg-white text-amber-700 shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <History className="size-3.5" />
            {t('usageLogs')}
          </button>
        </div>

        {/* Search bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder={
              activeTab === 'usage'
                ? (language === 'en' ? 'Search consumption by worker name, material name or remarks...' : 'सामग्री, कर्मचारी या विवरण खोजें...')
                : (language === 'en' ? 'Search by material name or supplier name...' : 'सामग्री या सप्लायर का नाम खोजें...')
            }
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 shadow-2xs focus:ring-amber-500/25"
          />
        </div>

        {/* Error alert */}
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600 flex justify-between items-center">
            <span>{error}</span>
            <button
              onClick={() => fetchInventory()}
              className="font-semibold underline hover:no-underline text-red-700 ml-4 cursor-pointer"
            >
              Try again
            </button>
          </div>
        )}

        {/* Dynamic Table Rendering */}
        {activeTab === 'list' ? (
          loading ? (
            <TableSkeleton />
          ) : (
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm animate-in fade-in">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/80">
                      <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 w-12">
                        #
                      </th>
                      <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                        {t('materialNameLabel')}
                      </th>
                      <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                        {t('quantityLabel')}
                      </th>
                      <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                        {language === 'en' ? 'Unit Price' : 'इकाई मूल्य'}
                      </th>
                      <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                        {language === 'en' ? 'Seller Name' : 'विक्रेता का नाम'}
                      </th>
                      <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                        {t('tableStatus')}
                      </th>
                      <th className="px-5 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                        {t('tableActions')}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredMaterials.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-5 py-16 text-center">
                          <Layers className="mx-auto mb-3 size-10 text-slate-300" />
                          <p className="text-sm text-slate-500">No raw material items found</p>
                        </td>
                      </tr>
                    ) : (
                      filteredMaterials.map((material, idx) => {
                        const isLowStock = material.quantity <= material.minStockLevel;
                        const isOutOfStock = material.quantity === 0;

                        return (
                          <tr key={material._id} className="transition-colors hover:bg-slate-50/50">
                            <td className="px-5 py-3.5 text-slate-400 font-medium">
                              {idx + 1}
                            </td>
                            <td className="px-5 py-3.5">
                              <span className="font-semibold text-slate-900 block leading-tight">
                                {material.name}
                              </span>
                              {material.notes && (
                                <span className="text-[11px] text-slate-400 truncate block max-w-xs mt-0.5" title={material.notes}>
                                  {material.notes}
                                </span>
                              )}
                            </td>
                            <td className="px-5 py-3.5 font-bold text-slate-800">
                              {material.quantity.toLocaleString('en-IN')} <span className="text-xs font-medium text-slate-400">{material.unit}</span>
                            </td>
                            <td className="px-5 py-3.5 font-semibold text-slate-900">
                              ₹{material.price.toLocaleString('en-IN')}
                            </td>
                            <td className="px-5 py-3.5 text-slate-700 font-medium">
                              {material.sellerName}
                            </td>
                            <td className="px-5 py-3.5">
                              {isOutOfStock ? (
                                <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800 border border-red-200">
                                  {t('outOfStock')}
                                </span>
                              ) : isLowStock ? (
                                <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200 animate-pulse">
                                  {t('lowStock')}
                                </span>
                              ) : (
                                <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                  {t('inStock')}
                                </span>
                              )}
                            </td>
                            <td className="px-5 py-3.5">
                              <div className="flex items-center justify-end gap-1">
                                <button
                                  onClick={() => openEditModal(material)}
                                  className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-amber-50 hover:text-amber-600 cursor-pointer"
                                  title="Edit"
                                >
                                  <Pencil className="size-4" />
                                </button>
                                <button
                                  onClick={() => {
                                    setDeletingMaterial(material);
                                    setDeleteDialogOpen(true);
                                  }}
                                  className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-500 cursor-pointer"
                                  title="Delete"
                                >
                                  <Trash2 className="size-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )
        ) : (
          /* Usage logs View */
          loadingLogs ? (
            <TableSkeleton />
          ) : (
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm animate-in fade-in">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/80">
                      <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Date & Time
                      </th>
                      <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                        {t('materialNameLabel')}
                      </th>
                      <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                        {t('quantityLabel')}
                      </th>
                      <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                        {t('dispatchedBy')}
                      </th>
                      <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                        {language === 'en' ? 'Remarks / Notes' : 'विवरण (Notes)'}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredLogs.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-5 py-16 text-center">
                          <History className="mx-auto mb-3 size-10 text-slate-300" />
                          <p className="text-sm text-slate-500">No consumption logs recorded yet</p>
                        </td>
                      </tr>
                    ) : (
                      filteredLogs.map((log) => (
                        <tr key={log._id} className="transition-colors hover:bg-slate-50/50">
                          <td className="px-5 py-3.5 text-xs text-slate-500 font-medium">
                            <span className="flex items-center gap-1">
                              <Calendar className="size-3.5 text-slate-400" />
                              {new Date(log.createdAt).toLocaleString('en-IN', {
                                day: 'numeric',
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 font-semibold text-slate-900">
                            {log.materialName}
                          </td>
                          <td className="px-5 py-3.5 font-bold text-red-600">
                            − {log.quantity.toLocaleString('en-IN')} <span className="text-xs font-medium text-slate-400">{log.unit}</span>
                          </td>
                          <td className="px-5 py-3.5">
                            <span className="inline-flex items-center gap-1 text-slate-700 font-medium text-xs bg-slate-100 rounded-md px-2 py-0.5 border border-slate-200/50">
                              <User className="size-3 text-slate-500" />
                              {log.workerName}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 text-slate-500 italic text-xs">
                            {log.notes || '—'}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )
        )}
      </div>

      {/* Add / Edit Form Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingMaterial ? t('editMaterial') : t('addNewMaterial')}
      >
        <form onSubmit={handleSave} className="space-y-4">
          {formError && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-2.5 text-xs text-red-600 font-medium">
              {formError}
            </div>
          )}

          {/* Material Name */}
          <div className="space-y-1">
            <Label htmlFor="matName">{t('materialNameLabel')}</Label>
            <Input
              id="matName"
              placeholder="e.g. Sugar, Amul Milk 1L, Tea Leaves"
              value={formData.name}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              required
              disabled={saving}
            />
          </div>

          {/* Quantity & Unit */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="matQty">{t('quantityLabel')}</Label>
              <Input
                id="matQty"
                type="number"
                min="0"
                step="any"
                placeholder="e.g. 20"
                value={formData.quantity}
                onChange={(e) => setFormData((prev) => ({ ...prev, quantity: e.target.value }))}
                required
                disabled={saving}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="matUnit">{language === 'en' ? 'Unit' : 'इकाई (Unit)'}</Label>
              <select
                id="matUnit"
                value={formData.unit}
                onChange={(e) => setFormData((prev) => ({ ...prev, unit: e.target.value }))}
                disabled={saving}
                className="
                  block w-full rounded-lg border border-slate-200 bg-white
                  py-2.5 px-3 text-sm text-slate-900 outline-none
                  focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20
                "
              >
                <option value="Kg">Kg</option>
                <option value="Liters">Liters</option>
                <option value="Packets">Packets</option>
                <option value="Bags">Bags</option>
                <option value="Grams">Grams</option>
                <option value="Pcs">Pcs</option>
              </select>
            </div>
          </div>

          {/* Price (cost price) & Threshold */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="matPrice">{language === 'en' ? 'Cost Price per Unit (₹)' : 'इकाई लागत (₹)'}</Label>
              <Input
                id="matPrice"
                type="number"
                min="0"
                step="any"
                placeholder="e.g. 60"
                value={formData.price}
                onChange={(e) => setFormData((prev) => ({ ...prev, price: e.target.value }))}
                required
                disabled={saving}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="matThreshold">{t('minStockLabel')}</Label>
              <Input
                id="matThreshold"
                type="number"
                min="0"
                placeholder="e.g. 5"
                value={formData.minStockLevel}
                onChange={(e) => setFormData((prev) => ({ ...prev, minStockLevel: e.target.value }))}
                required
                disabled={saving}
              />
            </div>
          </div>

          {/* Supplier / Seller Name */}
          <div className="space-y-1">
            <Label htmlFor="matSeller">{t('sellerNameLabel')}</Label>
            <Input
              id="matSeller"
              placeholder="e.g. Metro Wholesale, Local Dairy"
              value={formData.sellerName}
              onChange={(e) => setFormData((prev) => ({ ...prev, sellerName: e.target.value }))}
              required
              disabled={saving}
            />
          </div>

          {/* Notes */}
          <div className="space-y-1">
            <Label htmlFor="matNotes">{t('notesLabel')}</Label>
            <Input
              id="matNotes"
              placeholder="Used for making Masala Chai, Sweets..."
              value={formData.notes}
              onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
              disabled={saving}
            />
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setModalOpen(false)}
              disabled={saving}
              className="cursor-pointer"
            >
              {t('cancelBtn')}
            </Button>
            <Button
              type="submit"
              disabled={saving}
              className="bg-amber-500 hover:bg-amber-600 text-white font-semibold cursor-pointer"
            >
              {saving ? t('updatingBtn') : t('saveBtn')}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete confirmation dialog */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setDeletingMaterial(null);
        }}
        onConfirm={handleDelete}
        title={t('deleteMaterialTitle')}
        message={`${t('deleteMaterialConfirm')} "${deletingMaterial?.name}"${t('deleteConfirmSuffix')}`}
        loading={deleting}
      />
    </AppShell>
  );
}
