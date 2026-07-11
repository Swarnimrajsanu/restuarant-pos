'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import AppShell from '@/components/layout/app-shell';
import { api } from '@/lib/api';
import { useTranslation } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ArrowUpRight,
  RefreshCw,
  Boxes,
  CheckCircle2,
  Loader2,
  Calendar,
  AlertCircle,
  FileText,
  History,
} from 'lucide-react';

export default function TakeStockPage() {
  const { t, language } = useTranslation();

  // Inventory & logs state
  const [materials, setMaterials] = useState<any[]>([]);
  const [personalLogs, setPersonalLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [selectedMaterialId, setSelectedMaterialId] = useState('');
  const [inputQuantity, setInputQuantity] = useState('');
  const [inputNotes, setInputNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Fetch materials list
  const fetchMaterials = useCallback(async () => {
    try {
      setError(null);
      const data = await api.getRawMaterials();
      setMaterials(data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load inventory items');
    }
  }, []);

  // Fetch logs for this worker only (server-filtered by workerId)
  const fetchPersonalLogs = useCallback(async () => {
    try {
      setLoadingLogs(true);
      const logs = await api.getMyInventoryLogs();
      setPersonalLogs(logs || []);
    } catch (err) {
      console.error('Error fetching logs:', err);
    } finally {
      setLoadingLogs(false);
    }
  }, []);

  // Load page data
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      await Promise.all([fetchMaterials(), fetchPersonalLogs()]);
      setLoading(false);
    }
    loadData();
  }, [fetchMaterials, fetchPersonalLogs]);

  // Selected material helper
  const selectedMaterial = useMemo(() => {
    return materials.find((m) => m._id === selectedMaterialId);
  }, [materials, selectedMaterialId]);

  // Handle Form Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSuccessMsg(null);

    if (!selectedMaterialId) {
      setFormError(language === 'en' ? 'Please select a raw material' : 'कृपया कच्ची सामग्री चुनें');
      return;
    }

    const quantityNum = parseFloat(inputQuantity);
    if (isNaN(quantityNum) || quantityNum <= 0) {
      setFormError(language === 'en' ? 'Please enter a valid quantity greater than 0' : 'कृपया 0 से अधिक मात्रा दर्ज करें');
      return;
    }

    if (selectedMaterial && selectedMaterial.quantity < quantityNum) {
      setFormError(
        language === 'en'
          ? `Insufficient stock! Current stock is only ${selectedMaterial.quantity} ${selectedMaterial.unit}`
          : `स्टॉक कम है! वर्तमान में केवल ${selectedMaterial.quantity} ${selectedMaterial.unit} उपलब्ध है`
      );
      return;
    }

    try {
      setSubmitting(true);
      await api.dispatchRawMaterial({
        materialId: selectedMaterialId,
        quantity: quantityNum,
        notes: inputNotes.trim() || undefined,
      });

      // Clear input fields
      setInputQuantity('');
      setInputNotes('');
      setSuccessMsg(t('dispatchSuccess'));

      // Refresh list to show updated quantities
      await Promise.all([fetchMaterials(), fetchPersonalLogs()]);

      // Auto-hide success message after 4s
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      setFormError(err.message || 'Failed to dispatch material');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppShell>
      <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{t('takeStock')}</h1>
            <p className="mt-1 text-sm text-slate-500">
              {language === 'en'
                ? 'Deduct raw materials from stock when preparing food items'
                : 'भोजन तैयार करते समय स्टॉक से कच्ची सामग्री दर्ज करें'}
            </p>
          </div>
          <button
            onClick={() => {
              fetchMaterials();
              fetchPersonalLogs();
            }}
            disabled={loading || submitting}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-colors disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`size-4 ${(loading || submitting) ? 'animate-spin' : ''}`} />
            {t('refresh')}
          </button>
        </div>

        {/* Dynamic Alert Banner */}
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600 flex justify-between items-center animate-in fade-in">
            <span>{error}</span>
            <button
              onClick={() => { fetchMaterials(); fetchPersonalLogs(); }}
              className="font-semibold underline hover:no-underline text-red-700 ml-4 cursor-pointer"
            >
              Try again
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          {/* ─── Left Panel: Dispatch Input Form (3/5) ─── */}
          <div className="md:col-span-3 space-y-6">
            <Card className="shadow-2xs border-slate-200/80 rounded-2xl bg-white overflow-hidden">
              <CardHeader className="border-b border-slate-100 bg-slate-50/50 py-4 px-5 flex flex-row items-center gap-2.5">
                <div className="flex size-9 items-center justify-center rounded-xl bg-amber-500 text-white shadow-sm shadow-amber-500/20">
                  <ArrowUpRight className="size-4.5" />
                </div>
                <div>
                  <CardTitle className="text-base font-bold text-slate-800">{t('dispatchTitle')}</CardTitle>
                  <CardDescription className="text-[11px] text-slate-500 leading-tight">
                    {language === 'en' ? 'Record items taken for restaurant use' : 'रेस्टोरेंट में उपयोग की जाने वाली सामग्रियां दर्ज करें'}
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="p-5 space-y-4">
                {/* Form success banner */}
                {successMsg && (
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-3 text-xs text-emerald-800 font-semibold flex items-center gap-2 animate-in slide-in-from-top-2">
                    <CheckCircle2 className="size-4.5 text-emerald-600 shrink-0" />
                    <span>{successMsg}</span>
                  </div>
                )}

                {/* Form error banner */}
                {formError && (
                  <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700 font-semibold flex items-center gap-2 animate-in slide-in-from-top-2">
                    <AlertCircle className="size-4.5 text-red-600 shrink-0" />
                    <span>{formError}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Select Material dropdown */}
                  <div className="space-y-1.5">
                    <Label htmlFor="materialDropdown">{t('materialLabel')}</Label>
                    <select
                      id="materialDropdown"
                      value={selectedMaterialId}
                      onChange={(e) => {
                        setSelectedMaterialId(e.target.value);
                        setFormError(null);
                      }}
                      disabled={loading || submitting}
                      className="
                        block w-full rounded-lg border border-slate-200 bg-white
                        py-2.5 px-3 text-sm text-slate-900 outline-none
                        focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20
                        disabled:cursor-not-allowed disabled:opacity-60
                      "
                    >
                      <option value="">
                        {language === 'en' ? 'Select raw material...' : 'कच्ची सामग्री चुनें...'}
                      </option>
                      {materials.map((m) => (
                        <option key={m._id} value={m._id} disabled={m.quantity === 0}>
                          {m.name} ({language === 'en' ? 'Available' : 'उपलब्ध'}: {m.quantity} {m.unit}) {m.quantity === 0 ? ' [OUT OF STOCK]' : ''}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Quantity Input */}
                  <div className="space-y-1.5">
                    <Label htmlFor="dispatchQty">
                      {t('dispatchQtyLabel')}
                      {selectedMaterial && (
                        <span className="text-xs text-slate-400 ml-1.5">
                          ({language === 'en' ? 'Unit' : 'इकाई'}: {selectedMaterial.unit})
                        </span>
                      )}
                    </Label>
                    <div className="relative">
                      <Input
                        id="dispatchQty"
                        type="number"
                        min="0"
                        step="any"
                        placeholder="e.g. 5"
                        value={inputQuantity}
                        onChange={(e) => {
                          setInputQuantity(e.target.value);
                          setFormError(null);
                        }}
                        disabled={loading || submitting || !selectedMaterialId}
                        className="pr-16"
                      />
                      {selectedMaterial && (
                        <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-xs font-bold text-slate-400">
                          {selectedMaterial.unit}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Remarks Notes */}
                  <div className="space-y-1.5">
                    <Label htmlFor="dispatchNotes">{t('notesLabel')}</Label>
                    <Input
                      id="dispatchNotes"
                      placeholder="e.g. For making rabri, tea, etc."
                      value={inputNotes}
                      onChange={(e) => setInputNotes(e.target.value)}
                      disabled={loading || submitting || !selectedMaterialId}
                    />
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    disabled={loading || submitting || !selectedMaterialId}
                    className="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold cursor-pointer shadow-md shadow-amber-500/25 mt-2"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="size-4 animate-spin mr-2" />
                        {language === 'en' ? 'Processing...' : 'प्रक्रिया जारी है...'}
                      </>
                    ) : (
                      <>
                        <ArrowUpRight className="size-4.5 mr-2" />
                        {language === 'en' ? 'Confirm Stock Dispatch' : 'कच्चा माल निकालना कन्फर्म करें'}
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* ─── Right Panel: Material details card (2/5) ─── */}
          <div className="md:col-span-2 space-y-6">
            <Card className="shadow-2xs border-slate-200/80 rounded-2xl bg-white overflow-hidden h-full flex flex-col">
              <CardHeader className="border-b border-slate-100 bg-slate-50/50 py-4 px-5">
                <CardTitle className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  {language === 'en' ? 'Material Details' : 'सामग्री विवरण'}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 flex-1 flex flex-col justify-center items-center text-center">
                {selectedMaterial ? (
                  <div className="space-y-4 w-full animate-in fade-in zoom-in-95 duration-200">
                    <div className="flex size-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 mx-auto">
                      <Boxes className="size-7" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 text-lg leading-tight">{selectedMaterial.name}</h4>
                      <p className="text-xs text-slate-500 mt-1">{selectedMaterial.sellerName}</p>
                    </div>

                    <div className="border-t border-slate-100 my-4" />

                    <div className="grid grid-cols-2 gap-4 text-left">
                      <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                          {language === 'en' ? 'Current Stock' : 'वर्तमान स्टॉक'}
                        </span>
                        <span className="text-sm font-bold text-slate-800 block mt-1">
                          {selectedMaterial.quantity} {selectedMaterial.unit}
                        </span>
                      </div>
                      <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                          {t('minStockLabel').split(' ')[0]}
                        </span>
                        <span className="text-sm font-bold text-slate-800 block mt-1">
                          {selectedMaterial.minStockLevel} {selectedMaterial.unit}
                        </span>
                      </div>
                    </div>

                    {selectedMaterial.notes && (
                      <div className="bg-amber-50/40 border border-amber-200/50 rounded-xl p-3 text-left">
                        <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider flex items-center gap-1">
                          <FileText className="size-3" />
                          Remarks
                        </span>
                        <p className="text-xs text-slate-600 mt-1 leading-normal italic">
                          "{selectedMaterial.notes}"
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-slate-400 flex flex-col items-center py-8">
                    <Boxes className="size-10 text-slate-200 mb-3" />
                    <p className="text-sm leading-snug">{language === 'en' ? 'Select a raw material to view details' : 'विवरण देखने के लिए कच्ची सामग्री का चयन करें'}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* ─── Bottom Section: Personal dispatch logs today ─── */}
        <div className="space-y-3">
          <h3 className="text-lg font-bold text-slate-900">{t('dispatchHistory')}</h3>
          {loading ? (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full rounded-xl" />
              <Skeleton className="h-10 w-full rounded-xl" />
            </div>
          ) : personalLogs.length === 0 ? (
            <Card className="border border-dashed border-slate-200/80 rounded-2xl bg-white shadow-2xs">
              <CardContent className="p-8 text-center text-slate-400">
                <History className="size-8 text-slate-200 mx-auto mb-2" />
                <p className="text-sm leading-snug">{language === 'en' ? 'No stock dispatches logged by you yet' : 'आपके द्वारा अभी तक कोई स्टॉक नहीं निकाला गया है'}</p>
              </CardContent>
            </Card>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xs">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/80 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      <th className="px-5 py-3 text-left">Time</th>
                      <th className="px-5 py-3 text-left">Material Name</th>
                      <th className="px-5 py-3 text-left">Quantity Dispatched</th>
                      <th className="px-5 py-3 text-left">Remarks</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {personalLogs.map((log) => (
                      <tr key={log._id} className="transition-colors hover:bg-slate-50/50">
                        <td className="px-5 py-3 text-xs text-slate-500 font-medium">
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
                        <td className="px-5 py-3 font-semibold text-slate-900">
                          {log.materialName}
                        </td>
                        <td className="px-5 py-3 font-bold text-amber-600">
                          − {log.quantity.toLocaleString('en-IN')} <span className="text-xs font-medium text-slate-400">{log.unit}</span>
                        </td>
                        <td className="px-5 py-3 text-slate-500 italic text-xs">
                          {log.notes || '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
