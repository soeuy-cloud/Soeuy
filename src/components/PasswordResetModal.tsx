import React, { useState } from 'react';
import { useAccounting } from '../context/AccountingContext';
import { KeyRound, Mail, CheckCircle2, ShieldCheck, ArrowRight, Eye, EyeOff, X, AlertCircle, RefreshCw, Lock, Sparkles } from 'lucide-react';
import { UserProfile } from '../types';

export const PasswordResetModal: React.FC = () => {
  const { 
    isPasswordResetModalOpen, 
    setIsPasswordResetModalOpen, 
    sendPasswordResetEmail, 
    confirmPasswordResetWithCode,
    currentUser,
    users
  } = useAccounting();

  // Step 1: Request code by email
  // Step 2: Enter code & set new password
  // Step 3: Success state
  const [step, setStep] = useState<'request' | 'verify' | 'success'>('request');
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [confirmationCode, setConfirmationCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [dispatchedEmail, setDispatchedEmail] = useState('');
  const [matchedUser, setMatchedUser] = useState<UserProfile | null>(null);
  const [devSimulatedCode, setDevSimulatedCode] = useState<string | null>(null);

  if (!isPasswordResetModalOpen) return null;

  const handleClose = () => {
    setIsPasswordResetModalOpen(false);
    // Reset internal form state
    setStep('request');
    setEmailOrUsername('');
    setConfirmationCode('');
    setNewPassword('');
    setConfirmNewPassword('');
    setErrorMessage(null);
    setSuccessMessage(null);
    setDispatchedEmail('');
    setMatchedUser(null);
    setDevSimulatedCode(null);
  };

  const handleSendEmail = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);

    setTimeout(() => {
      const result = sendPasswordResetEmail(emailOrUsername || 'Administrator');
      setLoading(false);

      if (result.success) {
        setDispatchedEmail(result.targetUser?.email || emailOrUsername);
        setMatchedUser(result.targetUser || null);
        setDevSimulatedCode(result.confirmationCode || null);
        setStep('verify');
      } else {
        setErrorMessage(result.message);
      }
    }, 600);
  };

  const handleVerifyAndReset = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (newPassword.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setErrorMessage('Passwords do not match. Please re-enter both password fields.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const result = confirmPasswordResetWithCode(confirmationCode, newPassword);
      setLoading(false);

      if (result.success) {
        setSuccessMessage(result.message);
        setStep('success');
      } else {
        setErrorMessage(result.message);
      }
    }, 600);
  };

  const handleResendCode = () => {
    setLoading(true);
    setErrorMessage(null);
    setTimeout(() => {
      const result = sendPasswordResetEmail(dispatchedEmail || emailOrUsername);
      setLoading(false);
      if (result.success) {
        setDevSimulatedCode(result.confirmationCode || null);
        setSuccessMessage(`A fresh confirmation code has been resent to ${dispatchedEmail}.`);
      } else {
        setErrorMessage(result.message);
      }
    }, 400);
  };

  const handleFillAdmin = () => {
    const admin = users.find(u => u.isAdmin || u.username?.toLowerCase() === 'admin');
    if (admin) {
      setEmailOrUsername(admin.email || admin.username || 'admin@suite.com');
      setErrorMessage(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-md text-slate-100 shadow-2xl overflow-hidden relative">
        
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-orange-600/20 text-[#f97316] flex items-center justify-center border border-orange-500/30">
              <KeyRound className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm">
                {step === 'request' && 'Reset Account Password'}
                {step === 'verify' && 'Email Confirmation Code'}
                {step === 'success' && 'Password Updated!'}
              </h3>
              <p className="text-[11px] text-slate-400">
                {step === 'request' && 'Verify identity via registered administrator email'}
                {step === 'verify' && `Verification code sent to ${dispatchedEmail}`}
                {step === 'success' && 'Your account security credentials have been updated'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4 text-xs">
          {errorMessage && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 flex items-start gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* STEP 1: REQUEST EMAIL VERIFICATION */}
          {step === 'request' && (
            <form onSubmit={handleSendEmail} className="space-y-4">
              <p className="text-slate-300 leading-relaxed">
                Enter the administrator username or corporate email address. A 6-digit confirmation code will be dispatched to confirm your identity.
              </p>

              <div>
                <label className="block text-slate-300 font-semibold mb-1.5">Admin Username or Email *</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={emailOrUsername}
                    onChange={(e) => {
                      setEmailOrUsername(e.target.value);
                      if (errorMessage) setErrorMessage(null);
                    }}
                    placeholder="Enter admin username or email address"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-950/80 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-hidden focus:border-[#f97316] focus:ring-1 focus:ring-[#f97316] transition text-xs font-mono"
                  />
                </div>
              </div>

              {/* Verified Admin Info Box */}
              <div className="p-3 rounded-lg bg-slate-950/50 border border-slate-800 space-y-1.5">
                <div className="text-[11px] font-bold text-amber-400 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                  <span>Corporate Security Policy:</span>
                </div>
                <p className="text-[10px] text-slate-400">
                  Password changes for System Administrator accounts require email confirmation and are logged in the 256-bit tamper-proof audit trail.
                </p>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2 text-slate-400 hover:text-white rounded-lg text-xs font-medium transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2.5 bg-gradient-to-r from-[#d65200] to-[#f97316] hover:from-[#bf4700] hover:to-[#ea580c] text-white font-bold rounded-lg shadow-md shadow-orange-600/30 transition flex items-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Sending Confirmation...</span>
                    </>
                  ) : (
                    <>
                      <span>Send Confirmation Email</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* STEP 2: VERIFY CODE & SET NEW PASSWORD */}
          {step === 'verify' && (
            <form onSubmit={handleVerifyAndReset} className="space-y-4">
              
              {/* Simulated Email Dispatch Banner */}
              <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 space-y-1">
                <div className="flex items-center justify-between font-bold text-xs">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Confirmation Email Dispatched</span>
                  </span>
                  <span className="text-[10px] text-emerald-400 bg-emerald-950/60 px-1.5 py-0.2 rounded border border-emerald-800">
                    Active (15 mins)
                  </span>
                </div>
                <p className="text-[11px] text-emerald-200/90">
                  A 6-digit confirmation code was sent to <strong className="text-white font-mono">{dispatchedEmail}</strong>.
                </p>
                {devSimulatedCode && (
                  <div className="mt-2 pt-2 border-t border-emerald-500/20 flex items-center justify-between bg-emerald-950/40 p-1.5 rounded">
                    <span className="text-[10px] text-emerald-400 font-mono">Email Received Code:</span>
                    <button
                      type="button"
                      onClick={() => setConfirmationCode(devSimulatedCode)}
                      className="font-mono font-bold text-white tracking-widest text-sm bg-emerald-900/60 px-2 py-0.5 rounded hover:bg-emerald-800 transition"
                      title="Click to auto-fill"
                    >
                      {devSimulatedCode} 📋
                    </button>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1.5">
                  Enter 6-Digit Email Confirmation Code *
                </label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={confirmationCode}
                  onChange={(e) => {
                    setConfirmationCode(e.target.value);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  placeholder="e.g. 123456"
                  className="w-full px-3 py-2.5 bg-slate-950/80 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-hidden focus:border-[#f97316] focus:ring-1 focus:ring-[#f97316] transition text-center tracking-widest font-mono text-base font-bold"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1.5">
                    New Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={newPassword}
                      onChange={(e) => {
                        setNewPassword(e.target.value);
                        if (errorMessage) setErrorMessage(null);
                      }}
                      placeholder="At least 6 characters"
                      className="w-full pl-3 pr-8 py-2 bg-slate-950/80 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-hidden focus:border-[#f97316] focus:ring-1 focus:ring-[#f97316] transition text-xs font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-200"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1.5">
                    Confirm Password *
                  </label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={confirmNewPassword}
                    onChange={(e) => {
                      setConfirmNewPassword(e.target.value);
                      if (errorMessage) setErrorMessage(null);
                    }}
                    placeholder="Re-type new password"
                    className="w-full px-3 py-2 bg-slate-950/80 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-hidden focus:border-[#f97316] focus:ring-1 focus:ring-[#f97316] transition text-xs font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={handleResendCode}
                  disabled={loading}
                  className="text-[11px] text-orange-400 hover:text-orange-300 font-medium hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Resend Confirmation Email</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setStep('request')}
                    className="px-3 py-2 text-slate-400 hover:text-white rounded-lg text-xs font-medium transition cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading || confirmationCode.length < 4}
                    className="px-5 py-2.5 bg-gradient-to-r from-[#d65200] to-[#f97316] hover:from-[#bf4700] hover:to-[#ea580c] text-white font-bold rounded-lg shadow-md shadow-orange-600/30 transition flex items-center gap-2 cursor-pointer disabled:opacity-60 text-xs"
                  >
                    {loading ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Verifying...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Confirm & Change Password</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* STEP 3: SUCCESS CONFIRMATION */}
          {step === 'success' && (
            <div className="text-center py-4 space-y-4">
              <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto animate-in zoom-in-75">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <h4 className="font-bold text-white text-sm">Password Successfully Reset</h4>
                <p className="text-xs text-slate-300 mt-1">
                  Your administrator password has been updated. You can now use your new credentials to sign in to the Suite workspace.
                </p>
              </div>
              <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800 text-left font-mono text-[11px] space-y-1">
                <div className="text-slate-400">Account: <span className="text-white font-bold">{matchedUser?.name || 'Administrator'}</span></div>
                <div className="text-slate-400">Email: <span className="text-white">{dispatchedEmail || 'soeuysiemreap@gmail.com'}</span></div>
                <div className="text-slate-400">Status: <span className="text-emerald-400 font-bold">Email Verified & Active</span></div>
              </div>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleClose}
                  className="w-full py-2.5 bg-gradient-to-r from-[#d65200] to-[#f97316] text-white font-bold rounded-lg shadow-md hover:from-[#bf4700] hover:to-[#ea580c] transition cursor-pointer text-xs"
                >
                  Return to Sign In
                </button>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
