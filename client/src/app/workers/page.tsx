'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import AppShell from '@/components/layout/app-shell';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { useTranslation } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  X,
  Users,
  AlertTriangle,
  UserCheck,
  RefreshCw,
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

// ─── Workers Table Skeleton ────────────────────────────────────────────────
function WorkersSkeleton() {
  return (
    <div className="space-y-3">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-center gap-4 rounded-xl bg-white p-4 border border-slate-100 animate-pulse">
          <Skeleton className="size-10 rounded-full" />
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

// ─── Main Workers Page ─────────────────────────────────────────────────────
export default function WorkersPage() {
  const { user } = useAuth();
  const { t } = useTranslation();

  const [workers, setWorkers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  // Modal forms state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingWorker, setEditingWorker] = useState<any | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    workerId: '',
    email: '',
    password: '',
  });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingWorker, setDeletingWorker] = useState<any | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Fetch workers
  const fetchWorkers = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);
      const data = await api.getWorkers();
      setWorkers(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load workers list');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchWorkers();
  }, [fetchWorkers]);

  // Client-side filtering by search
  const filteredWorkers = useMemo(() => {
    return workers.filter((w) =>
      w.name.toLowerCase().includes(search.toLowerCase()) ||
      (w.workerId && w.workerId.toLowerCase().includes(search.toLowerCase())) ||
      (w.email && w.email.toLowerCase().includes(search.toLowerCase()))
    );
  }, [workers, search]);

  // Open add modal
  const openAddModal = () => {
    setEditingWorker(null);
    setFormError(null);
    setFormData({ name: '', workerId: '', email: '', password: '' });
    setModalOpen(true);
  };

  // Open edit modal
  const openEditModal = (worker: any) => {
    setEditingWorker(worker);
    setFormError(null);
    setFormData({
      name: worker.name,
      workerId: worker.workerId || '',
      email: worker.email || '',
      password: '', // leave empty unless resetting password
    });
    setModalOpen(true);
  };

  // Save worker (create or update)
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formData.name.trim()) {
      setFormError('Name is required');
      return;
    }

    if (!formData.workerId.trim() && !formData.email.trim()) {
      setFormError('Please provide either a Worker ID or an Email');
      return;
    }

    if (!editingWorker && !formData.password) {
      setFormError('Password is required for new workers');
      return;
    }

    if (formData.password && formData.password.length < 6) {
      setFormError('Password must be at least 6 characters long');
      return;
    }

    try {
      setSaving(true);
      const payload = {
        name: formData.name.trim(),
        workerId: formData.workerId.trim() || undefined,
        email: formData.email.trim() || undefined,
        password: formData.password || undefined,
      };

      if (editingWorker) {
        await api.updateWorker(editingWorker._id, payload);
      } else {
        await api.registerWorker(payload);
      }

      setModalOpen(false);
      fetchWorkers();
    } catch (err: any) {
      setFormError(err.message || 'Error saving worker account');
    } finally {
      setSaving(false);
    }
  };

  // Delete worker
  const handleDelete = async () => {
    if (!deletingWorker) return;
    try {
      setDeleting(true);
      await api.deleteWorker(deletingWorker._id);
      setDeleteDialogOpen(false);
      setDeletingWorker(null);
      fetchWorkers();
    } catch (err: any) {
      setError(err.message || 'Failed to delete worker');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <AppShell>
      <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
        {/* Page Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{t('workers')}</h1>
            <p className="mt-1 text-sm text-slate-500">{t('manageWorkers')}</p>
          </div>
          <div className="flex gap-2 self-start">
            <button
              onClick={() => fetchWorkers(true)}
              disabled={refreshing}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-colors disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className={`size-4 ${refreshing ? 'animate-spin' : ''}`} />
              {t('refresh')}
            </button>
            <Button
              onClick={openAddModal}
              className="gap-2 bg-amber-500 hover:bg-amber-600 text-white font-semibold cursor-pointer shadow-sm shadow-amber-500/25"
            >
              <Plus className="size-4" />
              {t('addWorker')}
            </Button>
          </div>
        </div>

        {/* Search bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder={t('searchProductsPlaceholder')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Global Error Notice */}
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600 flex justify-between items-center">
            <span>{error}</span>
            <button
              onClick={() => fetchWorkers()}
              className="font-semibold underline hover:no-underline text-red-700 ml-4 cursor-pointer"
            >
              Try again
            </button>
          </div>
        )}

        {/* Workers List Table */}
        {loading ? (
          <WorkersSkeleton />
        ) : (
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/80">
                    <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 w-16">
                      Avatar
                    </th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Name
                    </th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Worker ID
                    </th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Email
                    </th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Registered
                    </th>
                    <th className="px-5 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredWorkers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-5 py-16 text-center">
                        <Users className="mx-auto mb-3 size-10 text-slate-300" />
                        <p className="text-sm text-slate-500">No workers found</p>
                        <p className="mt-1 text-xs text-slate-400">
                          Create cashiers to allow them to log into the billing terminal
                        </p>
                      </td>
                    </tr>
                  ) : (
                    filteredWorkers.map((worker) => (
                      <tr key={worker._id} className="transition-colors hover:bg-slate-50/50">
                        <td className="px-5 py-3.5">
                          <div className="flex size-9 items-center justify-center rounded-full bg-gradient-to-br from-amber-100 to-orange-100 text-sm font-bold text-amber-700">
                            {worker.name.charAt(0).toUpperCase()}
                          </div>
                        </td>
                        <td className="px-5 py-3.5 font-semibold text-slate-900">
                          {worker.name}
                        </td>
                        <td className="px-5 py-3.5">
                          {worker.workerId ? (
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 font-bold border border-amber-200/50 text-xs">
                              {worker.workerId}
                            </span>
                          ) : (
                            <span className="text-xs text-slate-400">—</span>
                          )}
                        </td>
                        <td className="px-5 py-3.5 text-slate-600">
                          {worker.email || <span className="text-xs text-slate-400">—</span>}
                        </td>
                        <td className="px-5 py-3.5 text-xs text-slate-500">
                          {new Date(worker.createdAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => openEditModal(worker)}
                              className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-amber-50 hover:text-amber-600 cursor-pointer"
                              title="Edit"
                            >
                              <Pencil className="size-4" />
                            </button>
                            <button
                              onClick={() => {
                                setDeletingWorker(worker);
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
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Worker count */}
        {!loading && filteredWorkers.length > 0 && (
          <p className="text-sm text-slate-400 mt-2">
            Showing {filteredWorkers.length} worker{filteredWorkers.length !== 1 ? 's' : ''}
          </p>
        )}
      </div>

      {/* Add / Edit Worker Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingWorker ? t('editWorker') : t('addNewWorker')}
      >
        <form onSubmit={handleSave} className="space-y-4">
          {formError && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-600 animate-in fade-in duration-100">
              {formError}
            </div>
          )}

          <div className="space-y-1">
            <Label htmlFor="workerName">{t('workerNameLabel')}</Label>
            <Input
              id="workerName"
              placeholder="e.g. Rahul Kumar"
              value={formData.name}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              required
              disabled={saving}
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="workerIdField">{t('workerIdLabel')}</Label>
            <Input
              id="workerIdField"
              placeholder="e.g. rahul123 or W-01"
              value={formData.workerId}
              onChange={(e) => setFormData((prev) => ({ ...prev, workerId: e.target.value }))}
              disabled={saving}
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="workerEmail">{t('workerEmailLabel')}</Label>
            <Input
              id="workerEmail"
              type="email"
              placeholder="e.g. rahul@restaurant.com"
              value={formData.email}
              onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
              disabled={saving}
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="workerPassword">
              {editingWorker ? 'Password (Leave blank to keep same)' : t('workerPasswordLabel')}
            </Label>
            <Input
              id="workerPassword"
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
              required={!editingWorker}
              disabled={saving}
            />
          </div>

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

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setDeletingWorker(null);
        }}
        onConfirm={handleDelete}
        title={t('deleteWorkerTitle')}
        message={`${t('deleteWorkerConfirm')} "${deletingWorker?.name}"${t('deleteConfirmSuffix')}`}
        loading={deleting}
      />
    </AppShell>
  );
}
