'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { useTranslation } from '@/lib/i18n';
import { api } from '@/lib/api';
import { UtensilsCrossed, User as UserIcon, Lock, LogIn, Loader2, Users } from 'lucide-react';

export default function LoginPage() {
  // Tabs: 'worker' | 'owner'
  const [loginRole, setLoginRole] = useState<'worker' | 'owner'>('worker');

  // Owner login state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Worker login state
  const [workersList, setWorkersList] = useState<any[]>([]);
  const [selectedWorkerId, setSelectedWorkerId] = useState('');
  const [inputWorkerId, setInputWorkerId] = useState('');
  const [loadingWorkers, setLoadingWorkers] = useState(false);

  // General state
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { user, loading: authLoading, login, loginAsWorker } = useAuth();
  const { language, setLanguage, t } = useTranslation();
  const router = useRouter();

  // Redirect if already logged in
  useEffect(() => {
    if (!authLoading && user) {
      if (user.role === 'owner') {
        router.push('/dashboard');
      } else {
        router.push('/billing');
      }
    }
  }, [user, authLoading, router]);

  // Fetch public workers list on mount for worker dropdown
  useEffect(() => {
    async function fetchPublicWorkers() {
      try {
        setLoadingWorkers(true);
        const data = await api.getPublicWorkers();
        setWorkersList(data || []);
      } catch (err) {
        console.error('Error fetching workers list:', err);
      } finally {
        setLoadingWorkers(false);
      }
    }
    fetchPublicWorkers();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (loginRole === 'owner') {
      if (!email.trim() || !password.trim()) {
        setError(language === 'en' ? 'Please enter both Email and password' : 'कृपया ईमेल और पासवर्ड दोनों दर्ज करें');
        return;
      }

      setLoading(true);
      try {
        await login(email, password);
      } catch (err: any) {
        setError(err.message || (language === 'en' ? 'Invalid credentials' : 'गलत ईमेल या पासवर्ड'));
      } finally {
        setLoading(false);
      }
    } else {
      if (!selectedWorkerId) {
        setError(language === 'en' ? 'Please select your name' : 'कृपया अपना नाम चुनें');
        return;
      }
      if (!inputWorkerId.trim()) {
        setError(language === 'en' ? 'Please enter your Worker ID' : 'कृपया अपनी कर्मचारी आईडी दर्ज करें');
        return;
      }

      setLoading(true);
      try {
        await loginAsWorker(selectedWorkerId, inputWorkerId);
      } catch (err: any) {
        setError(err.message || (language === 'en' ? 'Incorrect Worker ID' : 'गलत कर्मचारी आईडी'));
      } finally {
        setLoading(false);
      }
    }
  };

  // Show nothing while checking auth status
  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="size-8 animate-spin text-amber-500" />
          <p className="text-sm text-slate-500">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render login form if already logged in (waiting for redirect)
  if (user) return null;

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
      {/* Top right language switcher */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-1 bg-white/70 backdrop-blur-xs rounded-lg p-0.5 border border-slate-200 shadow-sm">
        <button
          type="button"
          onClick={() => setLanguage('en')}
          className={`px-2.5 py-1 text-xs font-bold rounded transition-all cursor-pointer ${
            language === 'en'
              ? 'bg-white text-amber-600 shadow-xs'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          EN
        </button>
        <button
          type="button"
          onClick={() => setLanguage('hi')}
          className={`px-2.5 py-1 text-xs font-bold rounded transition-all cursor-pointer ${
            language === 'hi'
              ? 'bg-white text-amber-600 shadow-xs'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          हिन्दी
        </button>
      </div>

      {/* Animated background decorations */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* Floating circles */}
        <div className="absolute -top-20 -left-20 size-80 rounded-full bg-amber-200/30 blur-3xl animate-pulse-subtle" />
        <div className="absolute -bottom-32 -right-32 size-96 rounded-full bg-orange-200/25 blur-3xl animate-pulse-subtle" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/3 right-1/4 size-48 rounded-full bg-yellow-200/20 blur-2xl animate-pulse-subtle" style={{ animationDelay: '2s' }} />

        {/* Subtle grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              'radial-gradient(circle, #92400e 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        />
      </div>

      {/* Login card */}
      <div className="relative z-10 w-full max-w-md px-4 animate-slide-up">
        <div className="rounded-2xl border border-white/60 bg-white/85 p-8 shadow-xl backdrop-blur-sm sm:p-10">
          {/* Branding header */}
          <div className="mb-6 flex flex-col items-center text-center">
            <div className="mb-3 flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg shadow-amber-500/25">
              <UtensilsCrossed className="size-7 text-white" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              {t('appName')}
            </h1>
            <p className="mt-0.5 text-xs text-slate-500">
              {language === 'en' ? 'Restaurant Payment Management' : 'रेस्टोरेंट भुगतान प्रबंधन प्रणाली'}
            </p>
          </div>

          {/* Role selection tabs */}
          <div className="mb-6 flex bg-slate-100 rounded-xl p-1 border border-slate-200/50">
            <button
              type="button"
              onClick={() => {
                setLoginRole('worker');
                setError('');
              }}
              className={`flex-1 py-2 text-center text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                loginRole === 'worker'
                  ? 'bg-white text-amber-700 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Users className="size-3.5" />
              {language === 'en' ? 'Worker Login' : 'कर्मचारी लॉगिन'}
            </button>
            <button
              type="button"
              onClick={() => {
                setLoginRole('owner');
                setError('');
              }}
              className={`flex-1 py-2 text-center text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                loginRole === 'owner'
                  ? 'bg-white text-amber-700 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <UserIcon className="size-3.5" />
              {language === 'en' ? 'Owner Login' : 'मालिक लॉगिन'}
            </button>
          </div>

          {/* Error message */}
          {error && (
            <div className="mb-5 animate-fade-in rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-xs text-red-700 font-medium">
              <p className="flex items-center gap-2">
                <span>⚠️</span>
                {error}
              </p>
            </div>
          )}

          {/* Login form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {loginRole === 'worker' ? (
              <>
                {/* Worker Dropdown list */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="workerNameSelect"
                    className="block text-xs font-bold text-slate-600 uppercase tracking-wider"
                  >
                    {language === 'en' ? 'Select Your Name' : 'अपना नाम चुनें'}
                  </label>
                  <div className="relative">
                    <select
                      id="workerNameSelect"
                      value={selectedWorkerId}
                      onChange={(e) => setSelectedWorkerId(e.target.value)}
                      disabled={loading || loadingWorkers}
                      className="
                        block w-full rounded-lg border border-slate-200 bg-white
                        py-2.5 px-3 text-sm text-slate-900 outline-none
                        focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20
                        disabled:cursor-not-allowed disabled:opacity-60
                      "
                    >
                      <option value="">
                        {loadingWorkers
                          ? (language === 'en' ? 'Loading workers...' : 'सूची लोड हो रही है...')
                          : (language === 'en' ? 'Select your name...' : 'अपना नाम चुनें...')}
                      </option>
                      {workersList.map((w) => (
                        <option key={w._id} value={w._id}>
                          {w.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Worker ID / PIN field (masked for privacy) */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="workerIdField"
                    className="block text-xs font-bold text-slate-600 uppercase tracking-wider"
                  >
                    {t('workerIdLabel')}
                  </label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <Lock className="size-4 text-slate-400" />
                    </div>
                    <input
                      id="workerIdField"
                      type="password"
                      value={inputWorkerId}
                      onChange={(e) => setInputWorkerId(e.target.value)}
                      placeholder={language === 'en' ? 'Enter Worker ID / PIN' : 'अपनी कर्मचारी आईडी दर्ज करें'}
                      disabled={loading}
                      className="
                        block w-full rounded-lg border border-slate-200 bg-white
                        py-2.5 pl-10 pr-4 text-sm text-slate-900
                        placeholder:text-slate-400
                        transition-colors
                        focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/20
                        disabled:cursor-not-allowed disabled:opacity-60
                      "
                    />
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* Owner Email field */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="email"
                    className="block text-xs font-bold text-slate-600 uppercase tracking-wider"
                  >
                    {language === 'en' ? 'Owner Email' : 'मालिक ईमेल'}
                  </label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <UserIcon className="size-4 text-slate-400" />
                    </div>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="owner@restaurant.com"
                      autoComplete="email"
                      disabled={loading}
                      className="
                        block w-full rounded-lg border border-slate-200 bg-white
                        py-2.5 pl-10 pr-4 text-sm text-slate-900
                        placeholder:text-slate-400
                        transition-colors
                        focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/20
                        disabled:cursor-not-allowed disabled:opacity-60
                      "
                    />
                  </div>
                </div>

                {/* Owner Password field */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="password"
                    className="block text-xs font-bold text-slate-600 uppercase tracking-wider"
                  >
                    {t('passwordLabel')}
                  </label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <Lock className="size-4 text-slate-400" />
                    </div>
                    <input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      autoComplete="current-password"
                      disabled={loading}
                      className="
                        block w-full rounded-lg border border-slate-200 bg-white
                        py-2.5 pl-10 pr-4 text-sm text-slate-900
                        placeholder:text-slate-400
                        transition-colors
                        focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/20
                        disabled:cursor-not-allowed disabled:opacity-60
                      "
                    />
                  </div>
                </div>
              </>
            )}

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className="
                mt-2 flex w-full items-center justify-center gap-2 rounded-lg
                bg-gradient-to-r from-amber-500 to-orange-500
                px-4 py-2.5 text-sm font-semibold text-white
                shadow-md shadow-amber-500/25
                transition-all duration-200
                hover:from-amber-600 hover:to-orange-600 hover:shadow-lg hover:shadow-amber-500/30
                focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:ring-offset-2
                active:scale-[0.98] cursor-pointer
                disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:shadow-md
              "
            >
              {loading ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  {t('signingIn')}
                </>
              ) : (
                <>
                  <LogIn className="size-4" />
                  {t('signInBtn')}
                </>
              )}
            </button>
          </form>

          {/* Footer hint */}
          <div className="mt-6 text-center">
            <p className="text-xs text-slate-400">
              🍽️ {language === 'en' ? 'Secure access for restaurant staff' : 'कर्मचारियों के लिए सुरक्षित लॉगिन'}
            </p>
          </div>
        </div>

        {/* Bottom branding */}
        <p className="mt-6 text-center text-xs text-slate-400 font-medium">
          Manoj Vaishnav Hotel & Mishthan Bhandar v1.0
        </p>
      </div>
    </div>
  );
}
