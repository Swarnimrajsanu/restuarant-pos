'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { useTranslation } from '@/lib/i18n';
import { Badge } from '@/components/ui/badge';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  LayoutDashboard,
  Package,
  ClipboardList,
  BarChart3,
  ShoppingCart,
  ListOrdered,
  LogOut,
  Menu,
  UtensilsCrossed,
  ChevronRight,
  Globe,
  Users,
  Boxes,
  ArrowUpRight,
  Settings,
} from 'lucide-react';

// ─── Navigation Configuration ──────────────────────────────────

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

const ownerNavItems: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Products', href: '/products', icon: Package },
  { label: 'Orders', href: '/orders', icon: ClipboardList },
  { label: 'Inventory', href: '/inventory', icon: Boxes },
  { label: 'Reports', href: '/reports', icon: BarChart3 },
  { label: 'Workers', href: '/workers', icon: Users },
  { label: 'Settings', href: '/profile', icon: Settings },
];

const workerNavItems: NavItem[] = [
  { label: 'New Order', href: '/billing', icon: ShoppingCart },
  { label: 'My Orders', href: '/my-orders', icon: ListOrdered },
  { label: 'Take Stock', href: '/take-stock', icon: ArrowUpRight },
];

// ─── Sidebar Navigation Link ──────────────────────────────────

function NavLink({
  item,
  isActive,
  onClick,
}: {
  item: NavItem;
  isActive: boolean;
  onClick?: () => void;
}) {
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      onClick={onClick}
      className={`
        group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium
        transition-all duration-200
        ${
          isActive
            ? 'bg-amber-50 text-amber-700 shadow-sm'
            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
        }
      `}
    >
      <Icon
        className={`size-5 shrink-0 transition-colors ${
          isActive
            ? 'text-amber-500'
            : 'text-slate-400 group-hover:text-slate-600'
        }`}
      />
      <span className="flex-1">{item.label}</span>
      {isActive && (
        <ChevronRight className="size-4 text-amber-400" />
      )}
    </Link>
  );
}

// ─── Sidebar Content (shared between desktop and mobile) ──────

function SidebarContent({
  navItems,
  pathname,
  onNavigate,
}: {
  navItems: NavItem[];
  pathname: string;
  onNavigate?: () => void;
}) {
  const { user, logout } = useAuth();
  const { t } = useTranslation();

  // Translate nav items labels dynamically
  const translatedNavItems = navItems.map((item) => {
    let translationKey: any;
    if (item.href === '/dashboard') translationKey = 'dashboard';
    else if (item.href === '/products') translationKey = 'products';
    else if (item.href === '/orders') translationKey = 'orders';
    else if (item.href === '/reports') translationKey = 'reports';
    else if (item.href === '/inventory') translationKey = 'inventory';
    else if (item.href === '/take-stock') translationKey = 'takeStock';
    else if (item.href === '/workers') translationKey = 'workers';
    else if (item.href === '/billing') translationKey = 'newOrder';
    else if (item.href === '/my-orders') translationKey = 'myOrders';

    return {
      ...item,
      label: translationKey ? t(translationKey) : item.label,
    };
  });

  return (
    <div className="flex h-full flex-col bg-white">
      {/* Logo / Brand */}
      <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-5">
        <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-sm shadow-amber-500/20">
          <UtensilsCrossed className="size-5 text-white" />
        </div>
        <div>
          <h1 className="text-lg font-bold tracking-tight text-slate-900">
            {t('appName')}
          </h1>
          <p className="text-[10px] font-medium tracking-wide uppercase text-slate-400">
            {user?.role === 'owner' ? t('roleOwner') : t('roleWorker')}
          </p>
        </div>
      </div>

      {/* Navigation links */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          Menu
        </p>
        {translatedNavItems.map((item) => (
          <NavLink
            key={item.href}
            item={item}
            isActive={pathname === item.href || pathname.startsWith(item.href + '/')}
            onClick={onNavigate}
          />
        ))}
      </nav>

      {/* User info & logout at bottom */}
      <div className="border-t border-slate-100 p-4 bg-slate-50/50">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="flex size-9 items-center justify-center rounded-full bg-gradient-to-br from-amber-100 to-orange-100 text-sm font-semibold text-amber-700">
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-slate-800">
              {user?.name || 'User'}
            </p>
            <p className="truncate text-xs text-slate-400">
              {user?.role === 'owner' ? t('roleOwner') : t('roleWorker')}
            </p>
          </div>
        </div>
        <button
          onClick={() => {
            onNavigate?.();
            logout();
          }}
          className="
            mt-3 flex w-full items-center justify-center gap-2 rounded-lg
            border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold
            text-slate-600 transition-all duration-200
            hover:border-red-200 hover:bg-red-50 hover:text-red-600
            active:scale-[0.98] cursor-pointer
          "
        >
          <LogOut className="size-4" />
          {t('logout')}
        </button>
      </div>
    </div>
  );
}

// ─── App Shell ─────────────────────────────────────────────────

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const { language, setLanguage, t } = useTranslation();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Determine nav items based on user role
  const navItems = user?.role === 'owner' ? ownerNavItems : workerNavItems;

  // Current page title key from nav
  const currentPage = navItems.find(
    (item) => pathname === item.href || pathname.startsWith(item.href + '/')
  );

  let currentPageKey: any = 'appName';
  if (currentPage?.href === '/dashboard') currentPageKey = 'dashboard';
  else if (currentPage?.href === '/products') currentPageKey = 'products';
  else if (currentPage?.href === '/orders') currentPageKey = 'orders';
  else if (currentPage?.href === '/reports') currentPageKey = 'reports';
  else if (currentPage?.href === '/inventory') currentPageKey = 'inventory';
  else if (currentPage?.href === '/take-stock') currentPageKey = 'takeStock';
  else if (currentPage?.href === '/workers') currentPageKey = 'workers';
  else if (currentPage?.href === '/billing') currentPageKey = 'newOrder';
  else if (currentPage?.href === '/my-orders') currentPageKey = 'myOrders';

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {/* ── Desktop Sidebar ──────────────────────────────────── */}
      <aside className="hidden w-64 shrink-0 border-r border-slate-200 bg-white lg:block">
        <SidebarContent navItems={navItems} pathname={pathname} />
      </aside>

      {/* ── Mobile Sidebar (Sheet) ───────────────────────────── */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-72 p-0">
          <SheetHeader className="sr-only">
            <SheetTitle>Navigation Menu</SheetTitle>
          </SheetHeader>
          <SidebarContent
            navItems={navItems}
            pathname={pathname}
            onNavigate={() => setMobileOpen(false)}
          />
        </SheetContent>
      </Sheet>

      {/* ── Main Content Area ────────────────────────────────── */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Header Bar */}
        <header className="flex h-14 shrink-0 items-center gap-3 border-b border-slate-200 bg-white px-4 lg:px-6 shadow-2xs">
          {/* Mobile menu trigger */}
          <button
            className="inline-flex size-9 items-center justify-center rounded-lg text-slate-600 transition-colors hover:bg-slate-100 lg:hidden cursor-pointer"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="size-5" />
            <span className="sr-only">Open menu</span>
          </button>

          {/* Page title */}
          <div className="flex-1">
            <h2 className="text-sm font-bold text-slate-800 lg:text-base">
              {t(currentPageKey)}
            </h2>
          </div>

          {/* Language Switcher */}
          <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-0.5 border border-slate-200 mr-2 shrink-0">
            <button
              onClick={() => setLanguage('en')}
              className={`px-2 py-1 text-xs font-bold rounded transition-all cursor-pointer ${
                language === 'en'
                  ? 'bg-white text-amber-600 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              EN
            </button>
            <button
              onClick={() => setLanguage('hi')}
              className={`px-2 py-1 text-xs font-bold rounded transition-all cursor-pointer ${
                language === 'hi'
                  ? 'bg-white text-amber-600 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              हिन्दी
            </button>
          </div>

          {/* User info (desktop) */}
          <div className="hidden items-center gap-3 sm:flex">
            <Badge
              variant="secondary"
              className={`
                text-xs capitalize font-semibold shadow-2xs
                ${
                  user?.role === 'owner'
                    ? 'bg-amber-100 text-amber-700 border-amber-200'
                    : 'bg-blue-100 text-blue-700 border-blue-200'
                }
              `}
            >
              {user?.role === 'owner' ? t('roleOwner') : t('roleWorker')}
            </Badge>
            <div className="flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-full bg-gradient-to-br from-amber-100 to-orange-100 text-xs font-bold text-amber-700">
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <span className="text-sm font-medium text-slate-700">
                {user?.name || 'User'}
              </span>
            </div>
          </div>
        </header>

        {/* Scrollable content area */}
        <main className="flex-1 overflow-y-auto bg-slate-50">
          {children}
        </main>
      </div>
    </div>
  );
}
