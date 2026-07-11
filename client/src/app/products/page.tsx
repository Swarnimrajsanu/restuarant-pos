'use client';

import { useEffect, useState, useCallback } from 'react';
import AppShell from '@/components/layout/app-shell';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { Product, ProductCategory } from '@/types';
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  X,
  Package,
  AlertTriangle,
} from 'lucide-react';

const CATEGORIES: ProductCategory[] = [
  'Snacks',
  'Beverages',
  'Sweets',
  'Main Course',
  'Breads',
  'Desserts',
  'Other',
];

// Category badge color mapping
const categoryColors: Record<string, string> = {
  Snacks: 'bg-orange-100 text-orange-700',
  Beverages: 'bg-blue-100 text-blue-700',
  Sweets: 'bg-pink-100 text-pink-700',
  'Main Course': 'bg-emerald-100 text-emerald-700',
  Breads: 'bg-amber-100 text-amber-700',
  Desserts: 'bg-purple-100 text-purple-700',
  Other: 'bg-slate-100 text-slate-600',
};

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
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />
      {/* Content */}
      <div className="relative z-10 w-full max-w-md animate-in fade-in zoom-in-95 rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
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
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-sm animate-in fade-in zoom-in-95 rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-2 flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-full bg-red-100">
            <AlertTriangle className="size-5 text-red-500" />
          </div>
          <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
        </div>
        <p className="mb-6 ml-[52px] text-sm text-slate-500">{message}</p>
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? 'Deleting...' : 'Delete'}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Toggle Switch (simple custom version) ──────────────────────────────────
function ToggleSwitch({
  checked,
  onChange,
  disabled,
}: {
  checked: boolean;
  onChange: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      disabled={disabled}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
        checked ? 'bg-emerald-500' : 'bg-slate-200'
      }`}
    >
      <span
        className={`pointer-events-none inline-block size-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
          checked ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  );
}

// ─── Products Table Skeleton ────────────────────────────────────────────────
function ProductsSkeleton() {
  return (
    <div className="space-y-3">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="flex items-center gap-4 rounded-xl bg-white p-4">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-5 w-20" />
        </div>
      ))}
    </div>
  );
}

// ─── Main Products Page ─────────────────────────────────────────────────────
export default function ProductsPage() {
  useAuth(); // ensure auth context is active

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('');

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({ name: '', category: 'Snacks', price: '', imageUrl: '' });
  const [saving, setSaving] = useState(false);

  // Delete state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Toggling availability
  const [togglingId, setTogglingId] = useState<string | null>(null);

  // Fetch products
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getProducts({
        search: search || undefined,
        category: filterCategory || undefined,
      });
      setProducts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load products');
    } finally {
      setLoading(false);
    }
  }, [search, filterCategory]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Debounced search
  const [searchInput, setSearchInput] = useState('');
  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchInput), 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Open add modal
  const openAddModal = () => {
    setEditingProduct(null);
    setFormData({ name: '', category: 'Snacks', price: '', imageUrl: '' });
    setModalOpen(true);
  };

  // Open edit modal
  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      category: product.category,
      price: product.price.toString(),
      imageUrl: product.imageUrl || '',
    });
    setModalOpen(true);
  };

  // Save product (create or update)
  const handleSave = async () => {
    if (!formData.name.trim() || !formData.price) return;

    try {
      setSaving(true);
      const payload = {
        name: formData.name.trim(),
        category: formData.category,
        price: parseFloat(formData.price),
        imageUrl: formData.imageUrl.trim() || undefined,
      };

      if (editingProduct) {
        await api.updateProduct(editingProduct._id, payload);
      } else {
        await api.createProduct(payload);
      }

      setModalOpen(false);
      fetchProducts();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  // Toggle availability
  const handleToggle = async (product: Product) => {
    try {
      setTogglingId(product._id);
      await api.toggleProduct(product._id);
      // Update local state optimistically
      setProducts((prev) =>
        prev.map((p) =>
          p._id === product._id ? { ...p, available: !p.available } : p
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to toggle availability');
    } finally {
      setTogglingId(null);
    }
  };

  // Delete product
  const handleDelete = async () => {
    if (!deletingProduct) return;
    try {
      setDeleting(true);
      await api.deleteProduct(deletingProduct._id);
      setDeleteDialogOpen(false);
      setDeletingProduct(null);
      fetchProducts();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete product');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <AppShell>
      <div className="p-4 sm:p-6 lg:p-8">
        {/* Page header */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Products</h1>
            <p className="mt-1 text-sm text-slate-500">
              Manage your menu items and availability
            </p>
          </div>
          <Button onClick={openAddModal} className="gap-2 self-start bg-amber-500 hover:bg-amber-600">
            <Plus className="size-4" />
            Add Product
          </Button>
        </div>

        {/* Search & Filter bar */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Search products..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="h-8 rounded-lg border border-input bg-white px-3 text-sm text-slate-700 outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <option value="">All Categories</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600">
            {error}
            <button onClick={() => setError(null)} className="ml-2 font-medium underline">
              Dismiss
            </button>
          </div>
        )}

        {/* Loading */}
        {loading && <ProductsSkeleton />}

        {/* Products Table */}
        {!loading && (
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/80">
                    <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 w-16">
                      Image
                    </th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Name
                    </th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Category
                    </th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Price
                    </th>
                    <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Status
                    </th>
                    <th className="px-5 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {products.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-5 py-16 text-center">
                        <Package className="mx-auto mb-3 size-10 text-slate-300" />
                        <p className="text-sm text-slate-500">No products found</p>
                        <p className="mt-1 text-xs text-slate-400">
                          Add your first product to get started
                        </p>
                      </td>
                    </tr>
                  ) : (
                    products.map((product) => (
                      <tr
                        key={product._id}
                        className="transition-colors hover:bg-slate-50/80"
                      >
                        <td className="px-5 py-3.5">
                          <div className="size-10 rounded-lg overflow-hidden border border-slate-100 bg-slate-50 shrink-0">
                            <img
                              src={product.imageUrl || '/images/snacks.png'}
                              alt={product.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = '/images/snacks.png';
                              }}
                            />
                          </div>
                        </td>
                        <td className="px-5 py-3.5 font-medium text-slate-900">
                          {product.name}
                        </td>
                        <td className="px-5 py-3.5">
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
                              categoryColors[product.category] || categoryColors['Other']
                            }`}
                          >
                            {product.category}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 font-medium text-slate-700">
                          ₹{product.price.toLocaleString('en-IN')}
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2">
                            <ToggleSwitch
                              checked={product.available}
                              onChange={() => handleToggle(product)}
                              disabled={togglingId === product._id}
                            />
                            <span
                              className={`text-xs font-medium ${
                                product.available
                                  ? 'text-emerald-600'
                                  : 'text-slate-400'
                              }`}
                            >
                              {product.available ? 'Available' : 'Unavailable'}
                            </span>
                          </div>
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => openEditModal(product)}
                              className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-amber-50 hover:text-amber-600"
                              title="Edit"
                            >
                              <Pencil className="size-4" />
                            </button>
                            <button
                              onClick={() => {
                                setDeletingProduct(product);
                                setDeleteDialogOpen(true);
                              }}
                              className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-500"
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

        {/* Product count */}
        {!loading && products.length > 0 && (
          <p className="mt-4 text-sm text-slate-400">
            Showing {products.length} product{products.length !== 1 ? 's' : ''}
          </p>
        )}
      </div>

      {/* Add/Edit Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingProduct ? 'Edit Product' : 'Add New Product'}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSave();
          }}
          className="space-y-4"
        >
          <div className="space-y-2">
            <Label htmlFor="name">Product Name</Label>
            <Input
              id="name"
              placeholder="e.g. Samosa, Chai, Paneer Tikka..."
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <select
              id="category"
              value={formData.category}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, category: e.target.value }))
              }
              className="h-8 w-full rounded-lg border border-input bg-white px-2.5 text-sm text-slate-700 outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="price">Price (₹)</Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={formData.price}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, price: e.target.value }))
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="imageUrl">Product Image URL (Optional)</Label>
            <Input
              id="imageUrl"
              placeholder="e.g. /images/samosa.png or https://example.com/image.jpg"
              value={formData.imageUrl}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, imageUrl: e.target.value }))
              }
            />
            <p className="text-[10px] text-slate-400">
              Leave blank to auto-use category defaults like /images/snacks.png
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setModalOpen(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={saving || !formData.name.trim() || !formData.price}
              className="bg-amber-500 hover:bg-amber-600"
            >
              {saving
                ? 'Saving...'
                : editingProduct
                ? 'Update Product'
                : 'Add Product'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setDeletingProduct(null);
        }}
        onConfirm={handleDelete}
        title="Delete Product"
        message={`Are you sure you want to delete "${deletingProduct?.name}"? This action cannot be undone.`}
        loading={deleting}
      />
    </AppShell>
  );
}
