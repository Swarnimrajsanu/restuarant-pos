'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import AppShell from '@/components/layout/app-shell';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { useTranslation } from '@/lib/i18n';
import type { Product, CartItem, PaymentMethod } from '@/types';
import {
  Search,
  Plus,
  Minus,
  X,
  ShoppingCart,
  Banknote,
  Smartphone,
  CreditCard,
  Trash2,
  CheckCircle2,
  Loader2,
  Package,
  Printer,
  Pencil,
} from 'lucide-react';

// Category filter options
const CATEGORIES = [
  'All',
  'Snacks',
  'Beverages',
  'Sweets',
  'Main Course',
  'Breads',
  'Desserts',
] as const;

// ─── Loading Skeleton ────────────────────────────────────────────────
function ProductSkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 gap-3">
      {Array.from({ length: 9 }).map((_, i) => (
        <div
          key={i}
          className="bg-white rounded-xl p-3 shadow-sm border border-slate-100 animate-pulse"
        >
          <div className="aspect-video bg-slate-100 rounded-lg w-full mb-2.5" />
          <div className="h-4 bg-slate-200 rounded w-3/4 mb-2" />
          <div className="h-4 bg-slate-100 rounded w-1/4" />
        </div>
      ))}
    </div>
  );
}

// ─── Product Card ────────────────────────────────────────────────────
function ProductCard({
  product,
  onAdd,
}: {
  product: Product;
  onAdd: (product: Product) => void;
}) {
  const { t } = useTranslation();

  // Dynamically translate category name
  const translatedCategory = product.category === 'Other' 
    ? t('categoryOther') 
    : t(`category${product.category.replace(' ', '')}` as any);

  return (
    <button
      onClick={() => onAdd(product)}
      disabled={!product.available}
      className={`group relative w-full text-left bg-white rounded-xl p-2.5 shadow-sm border border-slate-100 transition-all duration-150 flex flex-col ${
        product.available
          ? 'hover:shadow-md hover:scale-[1.01] hover:border-amber-200 active:scale-[0.99] cursor-pointer'
          : 'opacity-50 cursor-not-allowed'
      }`}
    >
      {/* Image container */}
      <div className="relative aspect-[4/3] w-full rounded-lg overflow-hidden bg-slate-50 mb-2 shrink-0">
        <img
          src={product.imageUrl || '/images/snacks.png'}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        {/* Category badge floating */}
        <span className="absolute top-1.5 left-1.5 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded-md bg-white/90 text-amber-700 shadow-sm backdrop-blur-[2px]">
          {translatedCategory}
        </span>

        {/* Status display overlay */}
        {!product.available && (
          <div className="absolute inset-0 bg-slate-900/40 flex items-center justify-center backdrop-blur-[1px]">
            <span className="px-2 py-1 text-[10px] font-bold rounded bg-red-600 text-white shadow-sm uppercase tracking-wider">
              {t('soldOut')}
            </span>
          </div>
        )}
      </div>

      {/* Product info */}
      <div className="flex-1 min-w-0 px-0.5">
        <h3 className="font-semibold text-slate-800 text-sm leading-tight mb-1 truncate group-hover:text-amber-700 transition-colors">
          {product.name}
        </h3>
        <p className="text-sm font-bold text-amber-600">
          ₹{product.price.toLocaleString('en-IN')}
        </p>
      </div>

      {/* Touch helper bottom plus button */}
      {product.available && (
        <div className="absolute bottom-2.5 right-2.5 size-7 rounded-full bg-amber-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-amber-600 shadow-sm">
          <Plus className="size-4" />
        </div>
      )}
    </button>
  );
}

// ─── Cart Item Row ───────────────────────────────────────────────────
function CartItemRow({
  item,
  onUpdateQty,
  onRemove,
}: {
  item: CartItem;
  onUpdateQty: (productId: string, delta: number) => void;
  onRemove: (productId: string) => void;
}) {
  return (
    <div className="flex items-center gap-3 py-3 px-1 border-b border-slate-100 last:border-0 animate-in fade-in slide-in-from-right-2 duration-200">
      {/* Item info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-900 truncate">{item.name}</p>
        <p className="text-xs text-slate-500">
          ₹{item.price.toLocaleString('en-IN')} × {item.quantity}
        </p>
      </div>

      {/* Quantity controls */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => onUpdateQty(item.productId, -1)}
          className="size-7 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-colors active:scale-95 cursor-pointer"
        >
          <Minus className="size-3.5" />
        </button>
        <span className="w-7 text-center text-sm font-semibold text-slate-900">
          {item.quantity}
        </span>
        <button
          onClick={() => onUpdateQty(item.productId, 1)}
          className="size-7 rounded-lg bg-amber-100 hover:bg-amber-200 flex items-center justify-center text-amber-700 transition-colors active:scale-95 cursor-pointer"
        >
          <Plus className="size-3.5" />
        </button>
      </div>

      {/* Subtotal */}
      <p className="w-16 text-right text-sm font-semibold text-slate-900">
        ₹{(item.price * item.quantity).toLocaleString('en-IN')}
      </p>

      {/* Remove */}
      <button
        onClick={() => onRemove(item.productId)}
        className="size-7 rounded-lg hover:bg-red-50 flex items-center justify-center text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
      >
        <X className="size-4" />
      </button>
    </div>
  );
}

// ─── Print Bill Utility ───────────────────────────────────────────────
function printBill({
  orderNumber,
  items,
  cartTotal,
  extraChargeValue,
  extraChargeLabel,
  grandTotal,
  paymentMethod,
  workerName,
  language,
}: {
  orderNumber: string;
  items: CartItem[];
  cartTotal: number;
  extraChargeValue: number;
  extraChargeLabel: string;
  grandTotal: number;
  paymentMethod: PaymentMethod;
  workerName: string;
  language: 'en' | 'hi';
}) {
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  const timeStr = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

  const paymentLabels: Record<PaymentMethod, string> = {
    cash: language === 'en' ? 'Cash' : 'नकद',
    upi: 'UPI',
    card: language === 'en' ? 'Card' : 'कार्ड',
  };

  const appName = language === 'en' ? 'Manoj Vaishnav Hotel & Mishthan Bhandar' : 'मनोज वैष्णव होटल & मिष्ठान भंडार';
  const address = language === 'en' 
    ? 'Gaushala Chowk, Gausala Rd, nearby Hanuman Mandir, Chakmahila, Sitamarhi, Bihar 843302' 
    : 'गौशाला चौक, गौशाला रोड, हनुमान मंदिर के पास, चकमहिला, सीतामढ़ी, बिहार 843302';
  const mobile = '9199056693';

  const itemsHtml = items
    .map(
      (item) => `
      <tr>
        <td style="padding:4px 0;">${item.name}</td>
        <td style="text-align:center;padding:4px 6px;">${item.quantity}</td>
        <td style="text-align:right;padding:4px 0;">&#8377;${(item.price).toLocaleString('en-IN')}</td>
        <td style="text-align:right;padding:4px 0;">&#8377;${(item.price * item.quantity).toLocaleString('en-IN')}</td>
      </tr>`
    )
    .join('');

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Bill - ${orderNumber}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Inter', sans-serif;
      font-size: 11px;
      color: #1e293b;
      background: white;
      padding: 12px;
      max-width: 300px;
      margin: 0 auto;
    }
    .header { text-align: center; border-bottom: 1px dashed #cbd5e1; padding-bottom: 8px; margin-bottom: 8px; }
    .restaurant-name { font-size: 15px; font-weight: 700; letter-spacing: -0.5px; line-height: 1.2; margin-bottom: 3px; }
    .address { font-size: 10px; color: #64748b; line-height: 1.3; margin: 3px 0; }
    .mobile { font-size: 10px; color: #475569; font-weight: 600; margin-bottom: 4px; }
    .tagline { font-size: 10px; color: #64748b; margin-top: 2px; font-style: italic; }
    .meta { font-size: 10px; color: #64748b; margin-top: 6px; border-top: 1px solid #f1f5f9; padding-top: 4px; text-align: left; }
    .section-label { font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px; color: #94a3b8; margin: 10px 0 4px; }
    table { width: 100%; border-collapse: collapse; }
    thead tr { border-bottom: 1px solid #e2e8f0; }
    thead th { font-size: 9px; text-transform: uppercase; letter-spacing: 0.5px; color: #94a3b8; padding: 4px 0; text-align: left; }
    thead th:nth-child(2) { text-align: center; }
    thead th:nth-child(3), thead th:nth-child(4) { text-align: right; }
    tbody tr td { font-size: 11px; vertical-align: top; }
    .totals { border-top: 1px dashed #cbd5e1; margin-top: 8px; padding-top: 8px; }
    .total-row { display: flex; justify-content: space-between; margin-bottom: 3px; font-size: 10px; color: #475569; }
    .grand-total { font-size: 14px; font-weight: 700; color: #1e293b; margin-top: 6px; border-top: 1px solid #1e293b; padding-top: 6px; }
    .payment-badge { display: inline-block; background: #f1f5f9; border: 1px solid #e2e8f0; border-radius: 4px; padding: 2px 8px; font-size: 9px; font-weight: 600; margin-top: 8px; }
    .footer { text-align: center; margin-top: 14px; border-top: 1px dashed #cbd5e1; padding-top: 10px; font-size: 10px; color: #94a3b8; }
    @media print {
      body { padding: 0; }
      button { display: none !important; }
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="restaurant-name">🍽 ${appName}</div>
    <div class="address">${address}</div>
    <div class="mobile">${language === 'en' ? 'Mob:' : 'मोबाइल:'} ${mobile}</div>
    <div class="tagline">${language === 'en' ? 'Thank you for your visit!' : 'आपकी यात्रा के लिए धन्यवाद!'}</div>
    <div class="meta">
      <div>${language === 'en' ? 'Order' : 'ऑर्डर'}: <strong>${orderNumber}</strong></div>
      <div>${dateStr} &nbsp;|&nbsp; ${timeStr}</div>
      <div>${language === 'en' ? 'Staff' : 'कर्मचारी'}: ${workerName}</div>
    </div>
  </div>

  <div class="section-label">${language === 'en' ? 'Items' : 'सामग्री सूची'}</div>
  <table>
    <thead>
      <tr>
        <th>${language === 'en' ? 'Item' : 'सामग्री'}</th>
        <th>${language === 'en' ? 'Qty' : 'मात्रा'}</th>
        <th>${language === 'en' ? 'Price' : 'दर'}</th>
        <th>${language === 'en' ? 'Total' : 'कुल'}</th>
      </tr>
    </thead>
    <tbody>${itemsHtml}</tbody>
  </table>

  <div class="totals">
    <div class="total-row"><span>${language === 'en' ? 'Subtotal' : 'कुल योग'}</span><span>&#8377;${cartTotal.toLocaleString('en-IN')}</span></div>
    ${extraChargeValue > 0 ? `<div class="total-row"><span>${extraChargeLabel || (language === 'en' ? 'Extra' : 'अन्य शुल्क')}</span><span>+ &#8377;${extraChargeValue.toLocaleString('en-IN')}</span></div>` : ''}
    <div class="total-row grand-total"><span>${language === 'en' ? 'TOTAL' : 'कुल देय'}</span><span>&#8377;${grandTotal.toLocaleString('en-IN')}</span></div>
    <div><span class="payment-badge">${language === 'en' ? 'Paid via' : 'भुगतान माध्यम'}: ${paymentLabels[paymentMethod]}</span></div>
  </div>

  <div class="footer">
    <p>${language === 'en' ? 'Visit us again! 😊' : 'फिर पधारें! 😊'}</p>
    <p style="margin-top:4px">${language === 'en' ? 'Powered by' : 'द्वारा संचालित'} ${appName}</p>
  </div>

  <script>
    window.onload = function() { window.print(); }
  <\/script>
</body>
</html>`;

  const win = window.open('', '_blank', 'width=360,height=600');
  if (win) {
    win.document.write(html);
    win.document.close();
  }
}

// ─── Success Overlay ─────────────────────────────────────────────────
function SuccessOverlay({
  orderNumber,
  printData,
  onDismiss,
}: {
  orderNumber: string;
  printData: Parameters<typeof printBill>[0];
  onDismiss: () => void;
}) {
  const { t } = useTranslation();

  useEffect(() => {
    const timer = setTimeout(onDismiss, 8000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl p-8 shadow-2xl text-center max-w-sm mx-4 animate-in zoom-in-95 duration-300">
        <div className="flex items-center justify-center size-16 rounded-full bg-emerald-100 mx-auto mb-4">
          <CheckCircle2 className="size-9 text-emerald-500" />
        </div>
        <h3 className="text-xl font-bold text-slate-900 mb-1">{t('orderPlaced')}</h3>
        <p className="text-slate-500 text-sm mb-4">{t('orderNum')}{orderNumber}</p>

        {/* Print Bill Button */}
        <button
          type="button"
          onClick={() => printBill(printData)}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold text-sm transition-colors cursor-pointer shadow-md shadow-amber-500/20 mb-3"
        >
          <Printer className="size-4" />
          Print Bill
        </button>

        <button
          type="button"
          onClick={onDismiss}
          className="text-xs text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
        >
          Close
        </button>
      </div>
    </div>
  );
}

// ─── Main Billing Page ───────────────────────────────────────────────
export default function BillingPage() {
  const { user } = useAuth();
  const { t, language } = useTranslation();

  // Products state
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter state
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  // Cart state
  const [cart, setCart] = useState<CartItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [placing, setPlacing] = useState(false);
  const [successOrder, setSuccessOrder] = useState<string | null>(null);
  // Store last placed order data for printing
  const [lastOrderPrintData, setLastOrderPrintData] = useState<Parameters<typeof printBill>[0] | null>(null);

  // Custom total override state
  const [customTotal, setCustomTotal] = useState<string>('');
  const [isEditingTotal, setIsEditingTotal] = useState<boolean>(false);

  // Extra / Miscellaneous charges state
  const [extraCharge, setExtraCharge] = useState<string>('');
  const [extraChargeLabel, setExtraChargeLabel] = useState<string>('');
  const [showExtraCharge, setShowExtraCharge] = useState<boolean>(false);

  // Mobile layout state
  const [activeMobileTab, setActiveMobileTab] = useState<'products' | 'cart'>('products');

  // Fetch products on mount
  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true);
        setError(null);
        const data = await api.getProducts();
        setProducts(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load products');
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  // Filter products by search and category (client-side for speed)
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = activeCategory === 'All' || p.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [products, search, activeCategory]);

  // ─── Cart Operations ────────────────────────────────────────────
  const addToCart = useCallback((product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.productId === product._id);
      if (existing) {
        return prev.map((item) =>
          item.productId === product._id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [
        ...prev,
        {
          productId: product._id,
          name: product.name,
          price: product.price,
          quantity: 1,
        },
      ];
    });
  }, []);

  const updateQuantity = useCallback((productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.productId === productId
            ? { ...item, quantity: item.quantity + delta }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    setCart((prev) => prev.filter((item) => item.productId !== productId));
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  // Cart total
  const cartTotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [cart]);

  const cartItemCount = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  }, [cart]);

  // Extra charge numerical value
  const extraChargeValue = useMemo(() => {
    const parsed = parseFloat(extraCharge);
    return isNaN(parsed) || parsed < 0 ? 0 : parsed;
  }, [extraCharge]);

  // Grand total including extra charge
  const grandTotal = useMemo(() => {
    return cartTotal + extraChargeValue;
  }, [cartTotal, extraChargeValue]);

  // Final total after custom override if present
  const finalTotal = useMemo(() => {
    const parsed = parseFloat(customTotal);
    if (customTotal.trim() !== '' && !isNaN(parsed) && parsed >= 0) {
      return parsed;
    }
    return grandTotal;
  }, [grandTotal, customTotal]);

  // ─── Place Order ─────────────────────────────────────────────────
  const placeOrder = async () => {
    if (cart.length === 0 || placing) return;

    try {
      setPlacing(true);
      const orderItems = cart.map((item) => ({
        productId: item.productId,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
      }));

      const result = await api.createOrder({
        items: orderItems,
        total: finalTotal,
        paymentMethod,
        extraCharge: extraChargeValue,
        extraChargeLabel: extraChargeLabel.trim() || t('extraCharge'),
      });

      const orderNum = result.orderNumber || result._id || 'OK';

      // Save print data BEFORE clearing cart
      setLastOrderPrintData({
        orderNumber: orderNum,
        items: [...cart],
        cartTotal,
        extraChargeValue,
        extraChargeLabel: extraChargeLabel.trim() || t('extraCharge'),
        grandTotal: finalTotal,
        paymentMethod,
        workerName: user?.name || 'Staff',
        language,
      });

      // Show success
      setSuccessOrder(orderNum);
      setCart([]);
      setPaymentMethod('cash');
      setExtraCharge('');
      setExtraChargeLabel('');
      setCustomTotal('');
      setIsEditingTotal(false);
      setShowExtraCharge(false);
      setActiveMobileTab('products'); // Reset back to products list on mobile
    } catch (err: any) {
      alert(err.message || 'Failed to place order. Please try again.');
    } finally {
      setPlacing(false);
    }
  };

  return (
    <AppShell>
      {/* Success overlay with Print Bill */}
      {successOrder && lastOrderPrintData && (
        <SuccessOverlay
          orderNumber={successOrder}
          printData={lastOrderPrintData}
          onDismiss={() => setSuccessOrder(null)}
        />
      )}

      <div className="flex flex-col h-full bg-slate-50">
        {/* Mobile Tab Navigation Bar */}
        <div className="flex shrink-0 border-b border-slate-200 bg-white lg:hidden">
          <button
            type="button"
            onClick={() => setActiveMobileTab('products')}
            className={`flex-1 py-3 text-center text-sm font-semibold transition-all border-b-2 cursor-pointer ${
              activeMobileTab === 'products'
                ? 'border-amber-500 text-amber-600'
                : 'border-transparent text-slate-500'
            }`}
          >
            {t('newOrder')}
          </button>
          <button
            type="button"
            onClick={() => setActiveMobileTab('cart')}
            className={`flex-1 py-3 text-center text-sm font-semibold transition-all border-b-2 relative cursor-pointer ${
              activeMobileTab === 'cart'
                ? 'border-amber-500 text-amber-600'
                : 'border-transparent text-slate-500'
            }`}
          >
            {t('cart')}
            {cartItemCount > 0 && (
              <span className="absolute top-2.5 right-4 flex items-center justify-center size-5 rounded-full bg-amber-500 text-white text-[10px] font-bold">
                {cartItemCount}
              </span>
            )}
          </button>
        </div>

        {/* Content body split / toggle */}
        <div className="flex flex-1 flex-col lg:flex-row overflow-hidden min-h-0">
          {/* ─── Left Panel: Products (Visible if 'products' tab active on mobile, always on desktop) ─── */}
          <div
            className={`flex-1 flex flex-col p-4 lg:p-6 overflow-hidden min-h-0 ${
              activeMobileTab === 'products' ? 'flex' : 'hidden lg:flex'
            }`}
          >
            {/* Header */}
            <div className="mb-4">
              <h1 className="text-xl lg:text-2xl font-bold text-slate-900">
                {t('newOrder')}
              </h1>
              <p className="text-xs lg:text-sm text-slate-500 mt-0.5">
                {t('hiUser')} {user?.name?.split(' ')[0] ?? ''}, {t('selectItemsDesc')}
              </p>
            </div>

            {/* Search bar */}
            <div className="relative mb-4 shrink-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
              <input
                type="text"
                placeholder={t('searchProducts')}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-400 transition-all"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="size-4" />
                </button>
              )}
            </div>

            {/* Category pills */}
            <div className="flex gap-2 mb-4 overflow-x-auto pb-1 shrink-0 scrollbar-hide">
              {CATEGORIES.map((cat) => {
                const categoryLabel = cat === 'All' 
                  ? t('allCategories') 
                  : t(`category${cat.replace(' ', '')}` as any);
                return (
                  <button
                    type="button"
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xs lg:text-sm font-medium transition-all cursor-pointer ${
                      activeCategory === cat
                        ? 'bg-amber-500 text-white shadow-sm'
                        : 'bg-white text-slate-600 border border-slate-200 hover:border-amber-300 hover:text-amber-700'
                    }`}
                  >
                    {categoryLabel}
                  </button>
                );
              })}
            </div>

            {/* Product grid */}
            <div className="flex-1 overflow-y-auto pr-1 min-h-0 pb-16 lg:pb-0">
              {loading ? (
                <ProductSkeleton />
              ) : error ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="size-12 rounded-full bg-red-50 flex items-center justify-center mb-3">
                    <X className="size-6 text-red-400" />
                  </div>
                  <p className="text-sm text-red-600 font-medium mb-1">Failed to load products</p>
                  <p className="text-xs text-slate-500 mb-3">{error}</p>
                  <button
                    type="button"
                    onClick={() => window.location.reload()}
                    className="text-sm text-amber-600 hover:text-amber-700 font-medium"
                  >
                    Try again
                  </button>
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="size-12 rounded-full bg-slate-100 flex items-center justify-center mb-3">
                    <Package className="size-6 text-slate-400" />
                  </div>
                  <p className="text-sm text-slate-600 font-medium">{t('noProductsFound')}</p>
                  <p className="text-xs text-slate-400 mt-1">{t('tryDifferentSearch')}</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 gap-3">
                  {filteredProducts.map((product) => (
                    <ProductCard
                      key={product._id}
                      product={product}
                      onAdd={addToCart}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ─── Right Panel: Cart (Visible if 'cart' tab active on mobile, always on desktop) ─── */}
          <div
            className={`lg:w-[40%] lg:max-w-md bg-white border-t lg:border-t-0 lg:border-l border-slate-200 flex flex-col shadow-sm min-h-0 ${
              activeMobileTab === 'cart' ? 'flex' : 'hidden lg:flex'
            }`}
          >
            {/* Cart header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 shrink-0">
              <div className="flex items-center gap-2">
                <ShoppingCart className="size-5 text-amber-600" />
                <h2 className="font-bold text-slate-900">{t('cart')}</h2>
                {cartItemCount > 0 && (
                  <span className="flex items-center justify-center size-5 rounded-full bg-amber-500 text-white text-[10px] font-bold">
                    {cartItemCount}
                  </span>
                )}
              </div>
              {cart.length > 0 && (
                <button
                  type="button"
                  onClick={clearCart}
                  className="flex items-center gap-1 text-xs font-medium text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
                >
                  <Trash2 className="size-3.5" />
                  {t('clear')}
                </button>
              )}
            </div>

            {/* Cart items list */}
            <div className="flex-1 overflow-y-auto px-4 min-h-0">
              {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <ShoppingCart className="size-10 text-slate-200 mb-3" />
                  <p className="text-sm text-slate-400">{t('cartEmpty')}</p>
                  <p className="text-xs text-slate-300 mt-1">{t('cartEmptyDesc')}</p>
                </div>
              ) : (
                <div className="py-1">
                  {cart.map((item) => (
                    <CartItemRow
                      key={item.productId}
                      item={item}
                      onUpdateQty={updateQuantity}
                      onRemove={removeFromCart}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Cart footer — payment + total */}
            <div className="border-t border-slate-100 px-5 py-4 space-y-4 shrink-0 bg-white">
              {/* Extra Charges Section */}
              {cart.length > 0 && (
                <div className="space-y-2 border-b border-slate-100 pb-3">
                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setShowExtraCharge(!showExtraCharge)}
                      className="text-xs font-semibold text-amber-600 hover:text-amber-700 flex items-center gap-1 cursor-pointer"
                    >
                      {showExtraCharge ? t('hideExtraCharge') : t('addExtraCharge')}
                    </button>
                    {extraChargeValue > 0 && (
                      <span className="text-xs font-medium text-slate-500">
                        ₹{extraChargeValue.toLocaleString('en-IN')} ({extraChargeLabel || t('extraCharge')})
                      </span>
                    )}
                  </div>

                  {showExtraCharge && (
                    <div className="grid grid-cols-2 gap-2 animate-in slide-in-from-top-2 duration-150">
                      <div>
                        <input
                          type="text"
                          placeholder={t('labelExtraCharge')}
                          value={extraChargeLabel}
                          onChange={(e) => setExtraChargeLabel(e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-amber-500"
                        />
                      </div>
                      <div>
                        <input
                          type="number"
                          placeholder={t('amountExtraCharge')}
                          min="0"
                          step="any"
                          value={extraCharge}
                          onChange={(e) => setExtraCharge(e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-amber-500"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Total */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-500">{t('subtotal')}</span>
                <span className="text-sm font-semibold text-slate-700">
                  ₹{cartTotal.toLocaleString('en-IN')}
                </span>
              </div>

              {extraChargeValue > 0 && (
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>{extraChargeLabel.trim() || t('extraCharge')}</span>
                  <span>+ ₹{extraChargeValue.toLocaleString('en-IN')}</span>
                </div>
              )}

              <div className="flex flex-col gap-1 border-t border-slate-100 pt-2 animate-in fade-in duration-150">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-bold text-slate-900">{t('totalBill')}</span>
                    {customTotal.trim() !== '' && !isNaN(parseFloat(customTotal)) && (
                      <span className="text-[9px] font-bold bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded-md uppercase tracking-wider">
                        {language === 'en' ? 'Edited' : 'संपादित'}
                      </span>
                    )}
                  </div>
                  
                  {isEditingTotal ? (
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        min="0"
                        step="any"
                        placeholder={grandTotal.toString()}
                        value={customTotal}
                        onChange={(e) => setCustomTotal(e.target.value)}
                        className="w-20 px-2 py-1 text-right text-xs font-bold rounded-lg border border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={() => setIsEditingTotal(false)}
                        className="px-2 py-1 text-[10px] font-bold bg-amber-500 hover:bg-amber-600 text-white rounded-md cursor-pointer transition-colors"
                      >
                        {language === 'en' ? 'OK' : 'ठीक'}
                      </button>
                      {customTotal !== '' && (
                        <button
                          type="button"
                          onClick={() => {
                            setCustomTotal('');
                            setIsEditingTotal(false);
                          }}
                          className="text-[10px] font-bold text-red-500 hover:text-red-700 hover:underline cursor-pointer"
                        >
                          {language === 'en' ? 'Reset' : 'रीसेट'}
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      {customTotal.trim() !== '' && !isNaN(parseFloat(customTotal)) && (
                        <span className="text-xs text-slate-400 line-through">
                          ₹{grandTotal.toLocaleString('en-IN')}
                        </span>
                      )}
                      <span
                        onClick={() => setIsEditingTotal(true)}
                        className="text-xl lg:text-2xl font-bold text-amber-600 hover:text-amber-700 transition-colors cursor-pointer hover:underline"
                        title="Click to edit final price"
                      >
                        ₹{finalTotal.toLocaleString('en-IN')}
                      </span>
                      <button
                        type="button"
                        onClick={() => setIsEditingTotal(true)}
                        className="text-slate-400 hover:text-amber-500 transition-colors p-1"
                        title="Edit price"
                      >
                        <Pencil className="size-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Payment method buttons */}
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  {t('paymentMethod')}
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {/* Cash */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('cash')}
                    className={`flex flex-col items-center gap-1.5 py-2.5 rounded-xl border-2 text-xs lg:text-sm font-medium transition-all cursor-pointer ${
                      paymentMethod === 'cash'
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-700 ring-2 ring-emerald-500/20'
                        : 'border-slate-200 text-slate-500 hover:border-emerald-300 hover:text-emerald-600'
                    }`}
                  >
                    <Banknote className="size-4 lg:size-5" />
                    {t('cash')}
                  </button>
                  {/* UPI */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('upi')}
                    className={`flex flex-col items-center gap-1.5 py-2.5 rounded-xl border-2 text-xs lg:text-sm font-medium transition-all cursor-pointer ${
                      paymentMethod === 'upi'
                        ? 'border-violet-500 bg-violet-50 text-violet-700 ring-2 ring-violet-500/20'
                        : 'border-slate-200 text-slate-500 hover:border-violet-300 hover:text-violet-600'
                    }`}
                  >
                    <Smartphone className="size-4 lg:size-5" />
                    {t('upi')}
                  </button>
                  {/* Card */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('card')}
                    className={`flex flex-col items-center gap-1.5 py-2.5 rounded-xl border-2 text-xs lg:text-sm font-medium transition-all cursor-pointer ${
                      paymentMethod === 'card'
                        ? 'border-blue-500 bg-blue-50 text-blue-700 ring-2 ring-blue-500/20'
                        : 'border-slate-200 text-slate-500 hover:border-blue-300 hover:text-blue-600'
                    }`}
                  >
                    <CreditCard className="size-4 lg:size-5" />
                    {t('card')}
                  </button>
                </div>
              </div>

              {/* Action buttons row */}
              <div className="flex gap-2">
                {/* Print last bill shortcut (when last order data is available and no new order pending) */}
                {lastOrderPrintData && cart.length === 0 && (
                  <button
                    type="button"
                    onClick={() => printBill(lastOrderPrintData!)}
                    className="flex items-center justify-center gap-1.5 px-3 py-3 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300 text-sm font-semibold transition-all cursor-pointer shrink-0"
                    title="Reprint last bill"
                  >
                    <Printer className="size-4" />
                  </button>
                )}

                {/* Place Order button */}
                <button
                  type="button"
                  onClick={placeOrder}
                  disabled={cart.length === 0 || placing}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                    cart.length === 0
                      ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                      : placing
                        ? 'bg-amber-400 text-white cursor-wait'
                        : 'bg-amber-500 hover:bg-amber-600 text-white shadow-lg shadow-amber-500/25 active:scale-[0.98]'
                  }`}
                >
                  {placing ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      {t('placingOrder')}
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="size-4" />
                      {t('placeOrder')} — ₹{finalTotal.toLocaleString('en-IN')}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Floating Quick Cart Summary Bar on Mobile (when Menu is active and has items) */}
        {activeMobileTab === 'products' && cartItemCount > 0 && (
          <div className="fixed bottom-4 left-4 right-4 z-40 lg:hidden">
            <button
              type="button"
              onClick={() => setActiveMobileTab('cart')}
              className="w-full bg-amber-500 text-white py-3 px-5 rounded-xl font-bold shadow-lg flex items-center justify-between active:scale-[0.97] transition-all"
            >
              <div className="flex items-center gap-2">
                <span className="flex items-center justify-center size-5 rounded-full bg-white text-amber-600 text-[10px] font-bold">
                  {cartItemCount}
                </span>
                <span>{t('viewOrderMobile')}</span>
              </div>
              <span className="flex items-center gap-1 text-sm font-semibold">
                ₹{finalTotal.toLocaleString('en-IN')}
                <span className="opacity-70 ml-1">→</span>
              </span>
            </button>
          </div>
        )}
      </div>
    </AppShell>
  );
}
