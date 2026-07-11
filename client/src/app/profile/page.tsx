'use client';

import { useState } from 'react';
import AppShell from '@/components/layout/app-shell';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { useTranslation } from '@/lib/i18n';
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Loader2,
  Save,
} from 'lucide-react';

// ─── Password Input with toggle ───────────────────────────────────────────
function PasswordInput({
  id,
  placeholder,
  value,
  onChange,
  disabled,
}: {
  id: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
}) {
  const [show, setShow] = useState(false);

  return (
    <div className="relative">
      <input
        id={id}
        type={show ? 'text' : 'password'}
        autoComplete="new-password"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="
          block w-full rounded-lg border border-slate-200 bg-white
          py-2.5 px-3 pr-10 text-sm text-slate-900 outline-none
          placeholder:text-slate-400
          focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20
          disabled:cursor-not-allowed disabled:opacity-60
        "
      />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
        tabIndex={-1}
      >
        {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
      </button>
    </div>
  );
}

// ─── Section Card ─────────────────────────────────────────────────────────
function SectionCard({
  icon,
  title,
  description,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
      <div className="border-b border-slate-100 bg-slate-50/60 px-6 py-4 flex items-center gap-3">
        <div className="flex size-9 items-center justify-center rounded-xl bg-amber-500 text-white shadow-sm shadow-amber-500/25">
          {icon}
        </div>
        <div>
          <h2 className="font-bold text-slate-800 text-sm">{title}</h2>
          <p className="text-xs text-slate-500 mt-0.5">{description}</p>
        </div>
      </div>
      <div className="px-6 py-5">{children}</div>
    </div>
  );
}

// ─── Alert Banner ─────────────────────────────────────────────────────────
function Alert({
  type,
  message,
}: {
  type: 'success' | 'error';
  message: string;
}) {
  return (
    <div
      className={`flex items-start gap-2.5 rounded-xl border px-4 py-3 text-sm font-medium animate-in slide-in-from-top-2 duration-200 ${
        type === 'success'
          ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
          : 'border-red-200 bg-red-50 text-red-700'
      }`}
    >
      {type === 'success' ? (
        <CheckCircle2 className="size-4.5 shrink-0 mt-0.5 text-emerald-600" />
      ) : (
        <AlertCircle className="size-4.5 shrink-0 mt-0.5 text-red-600" />
      )}
      {message}
    </div>
  );
}

// ─── Main Profile Page ────────────────────────────────────────────────────
export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const { language } = useTranslation();

  const t = (en: string, hi: string) => (language === 'en' ? en : hi);

  // ── Name form state ──
  const [name, setName] = useState(user?.name || '');
  const [savingName, setSavingName] = useState(false);
  const [nameAlert, setNameAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // ── Email form state ──
  const [email, setEmail] = useState(user?.email || '');
  const [emailPassword, setEmailPassword] = useState('');
  const [savingEmail, setSavingEmail] = useState(false);
  const [emailAlert, setEmailAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // ── Password form state ──
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordAlert, setPasswordAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // ── Save Name ──
  const handleSaveName = async (e: React.FormEvent) => {
    e.preventDefault();
    setNameAlert(null);
    if (!name.trim()) {
      setNameAlert({ type: 'error', message: t('Name cannot be empty', 'नाम खाली नहीं हो सकता') });
      return;
    }
    try {
      setSavingName(true);
      const result = await api.updateProfile({ name: name.trim() });
      updateUser?.(result.user);
      setNameAlert({ type: 'success', message: t('Name updated successfully!', 'नाम सफलतापूर्वक बदला गया!') });
    } catch (err: any) {
      setNameAlert({ type: 'error', message: err.message || t('Failed to update name', 'नाम बदलने में विफल') });
    } finally {
      setSavingName(false);
    }
  };

  // ── Save Email ──
  const handleSaveEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailAlert(null);
    if (!email.trim()) {
      setEmailAlert({ type: 'error', message: t('Email cannot be empty', 'ईमेल खाली नहीं हो सकता') });
      return;
    }
    if (!emailPassword) {
      setEmailAlert({ type: 'error', message: t('Enter your current password to confirm email change', 'ईमेल बदलने के लिए वर्तमान पासवर्ड दर्ज करें') });
      return;
    }
    try {
      setSavingEmail(true);
      const result = await api.updateProfile({ email: email.trim(), currentPassword: emailPassword });
      updateUser?.(result.user);
      setEmailPassword('');
      setEmailAlert({ type: 'success', message: t('Email updated successfully!', 'ईमेल सफलतापूर्वक बदला गया!') });
    } catch (err: any) {
      setEmailAlert({ type: 'error', message: err.message || t('Failed to update email', 'ईमेल बदलने में विफल') });
    } finally {
      setSavingEmail(false);
    }
  };

  // ── Save Password ──
  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordAlert(null);
    if (!currentPassword) {
      setPasswordAlert({ type: 'error', message: t('Enter your current password', 'वर्तमान पासवर्ड दर्ज करें') });
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      setPasswordAlert({ type: 'error', message: t('New password must be at least 6 characters', 'नया पासवर्ड कम से कम 6 अक्षर का होना चाहिए') });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordAlert({ type: 'error', message: t('New passwords do not match', 'नए पासवर्ड मेल नहीं खाते') });
      return;
    }
    try {
      setSavingPassword(true);
      await api.updateProfile({ currentPassword, newPassword });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordAlert({ type: 'success', message: t('Password changed successfully!', 'पासवर्ड सफलतापूर्वक बदला गया!') });
    } catch (err: any) {
      setPasswordAlert({ type: 'error', message: err.message || t('Failed to change password', 'पासवर्ड बदलने में विफल') });
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <AppShell>
      <div className="p-4 sm:p-6 lg:p-8 max-w-2xl mx-auto space-y-6">

        {/* Page header */}
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {t('Account Settings', 'खाता सेटिंग')}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {t('Update your login credentials and display name', 'अपनी लॉगिन जानकारी और नाम बदलें')}
          </p>
        </div>

        {/* Current user info banner */}
        <div className="flex items-center gap-4 bg-gradient-to-r from-amber-500 to-amber-600 rounded-2xl px-6 py-4 text-white shadow-lg shadow-amber-500/20">
          <div className="flex size-12 items-center justify-center rounded-xl bg-white/20 shrink-0">
            <User className="size-6" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-base leading-tight">{user?.name}</p>
            <p className="text-amber-100 text-sm mt-0.5">{user?.email}</p>
          </div>
          <div className="flex items-center gap-1.5 bg-white/20 rounded-lg px-3 py-1 text-xs font-bold uppercase tracking-wider">
            <ShieldCheck className="size-3.5" />
            Owner
          </div>
        </div>

        {/* ─── Section 1: Change Display Name ─── */}
        <SectionCard
          icon={<User className="size-4.5" />}
          title={t('Display Name', 'प्रदर्शन नाम')}
          description={t('Change the name shown in the app', 'ऐप में दिखने वाला नाम बदलें')}
        >
          <form onSubmit={handleSaveName} className="space-y-4">
            {nameAlert && <Alert type={nameAlert.type} message={nameAlert.message} />}
            <div className="space-y-1.5">
              <label htmlFor="displayName" className="block text-xs font-semibold text-slate-600 uppercase tracking-wider">
                {t('Full Name', 'पूरा नाम')}
              </label>
              <input
                id="displayName"
                type="text"
                placeholder={t('e.g. Ramesh Kumar', 'जैसे: रमेश कुमार')}
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={savingName}
                className="
                  block w-full rounded-lg border border-slate-200 bg-white
                  py-2.5 px-3 text-sm text-slate-900 outline-none
                  placeholder:text-slate-400
                  focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20
                  disabled:cursor-not-allowed disabled:opacity-60
                "
              />
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={savingName || name.trim() === user?.name}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-sm shadow-amber-500/25"
              >
                {savingName ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
                {t('Save Name', 'नाम सहेजें')}
              </button>
            </div>
          </form>
        </SectionCard>

        {/* ─── Section 2: Change Email ─── */}
        <SectionCard
          icon={<Mail className="size-4.5" />}
          title={t('Login Email', 'लॉगिन ईमेल')}
          description={t('Change the email used to log in as owner', 'ओनर लॉगिन के लिए उपयोग किया जाने वाला ईमेल बदलें')}
        >
          <form onSubmit={handleSaveEmail} className="space-y-4">
            {emailAlert && <Alert type={emailAlert.type} message={emailAlert.message} />}
            <div className="space-y-1.5">
              <label htmlFor="loginEmail" className="block text-xs font-semibold text-slate-600 uppercase tracking-wider">
                {t('New Email Address', 'नया ईमेल पता')}
              </label>
              <input
                id="loginEmail"
                type="email"
                autoComplete="email"
                placeholder="owner@restaurant.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={savingEmail}
                className="
                  block w-full rounded-lg border border-slate-200 bg-white
                  py-2.5 px-3 text-sm text-slate-900 outline-none
                  placeholder:text-slate-400
                  focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20
                  disabled:cursor-not-allowed disabled:opacity-60
                "
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="emailConfirmPassword" className="block text-xs font-semibold text-slate-600 uppercase tracking-wider">
                {t('Confirm with Current Password', 'वर्तमान पासवर्ड से कन्फर्म करें')}
              </label>
              <PasswordInput
                id="emailConfirmPassword"
                placeholder={t('Enter current password', 'वर्तमान पासवर्ड दर्ज करें')}
                value={emailPassword}
                onChange={setEmailPassword}
                disabled={savingEmail}
              />
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={savingEmail}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-sm shadow-amber-500/25"
              >
                {savingEmail ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
                {t('Update Email', 'ईमेल अपडेट करें')}
              </button>
            </div>
          </form>
        </SectionCard>

        {/* ─── Section 3: Change Password ─── */}
        <SectionCard
          icon={<Lock className="size-4.5" />}
          title={t('Change Password', 'पासवर्ड बदलें')}
          description={t('Keep your account secure with a strong password', 'एक मजबूत पासवर्ड से अपना खाता सुरक्षित रखें')}
        >
          <form onSubmit={handleSavePassword} className="space-y-4">
            {passwordAlert && <Alert type={passwordAlert.type} message={passwordAlert.message} />}

            <div className="space-y-1.5">
              <label htmlFor="currentPwd" className="block text-xs font-semibold text-slate-600 uppercase tracking-wider">
                {t('Current Password', 'वर्तमान पासवर्ड')}
              </label>
              <PasswordInput
                id="currentPwd"
                placeholder={t('Enter current password', 'वर्तमान पासवर्ड दर्ज करें')}
                value={currentPassword}
                onChange={setCurrentPassword}
                disabled={savingPassword}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="newPwd" className="block text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  {t('New Password', 'नया पासवर्ड')}
                </label>
                <PasswordInput
                  id="newPwd"
                  placeholder={t('Min. 6 characters', 'कम से कम 6 अक्षर')}
                  value={newPassword}
                  onChange={setNewPassword}
                  disabled={savingPassword}
                />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="confirmPwd" className="block text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  {t('Confirm New Password', 'नया पासवर्ड दोबारा')}
                </label>
                <PasswordInput
                  id="confirmPwd"
                  placeholder={t('Repeat new password', 'नया पासवर्ड दोबारा दर्ज करें')}
                  value={confirmPassword}
                  onChange={setConfirmPassword}
                  disabled={savingPassword}
                />
              </div>
            </div>

            {/* Password strength hint */}
            {newPassword.length > 0 && (
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4].map((level) => {
                  let strength = 0;
                  if (newPassword.length >= 6) strength++;
                  if (newPassword.length >= 10) strength++;
                  if (/[0-9]/.test(newPassword)) strength++;
                  if (/[^a-zA-Z0-9]/.test(newPassword)) strength++;
                  return (
                    <div
                      key={level}
                      className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                        level <= strength
                          ? strength <= 1
                            ? 'bg-red-400'
                            : strength <= 2
                              ? 'bg-amber-400'
                              : strength <= 3
                                ? 'bg-emerald-400'
                                : 'bg-emerald-500'
                          : 'bg-slate-200'
                      }`}
                    />
                  );
                })}
                <span className="text-xs text-slate-400 shrink-0">
                  {(() => {
                    let s = 0;
                    if (newPassword.length >= 6) s++;
                    if (newPassword.length >= 10) s++;
                    if (/[0-9]/.test(newPassword)) s++;
                    if (/[^a-zA-Z0-9]/.test(newPassword)) s++;
                    return s <= 1 ? t('Weak', 'कमज़ोर') : s <= 2 ? t('Fair', 'ठीक') : s <= 3 ? t('Good', 'अच्छा') : t('Strong', 'मज़बूत');
                  })()}
                </span>
              </div>
            )}

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={savingPassword}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-sm shadow-amber-500/25"
              >
                {savingPassword ? <Loader2 className="size-4 animate-spin" /> : <Lock className="size-4" />}
                {t('Change Password', 'पासवर्ड बदलें')}
              </button>
            </div>
          </form>
        </SectionCard>

      </div>
    </AppShell>
  );
}
