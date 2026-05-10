import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { KanbanSquare, Lock, Mail, User } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../utils/api.js';

export default function Auth({ mode = 'login' }) {
  const navigate = useNavigate();
  const { login, signup } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '', inviteCode: '' });
  const [busy, setBusy] = useState(false);
  const [forgot, setForgot] = useState(false);
  const isSignup = mode === 'signup';

  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    try {
      if (!form.email.trim()) throw new Error('Please enter a valid email address.');
      if (!forgot && !form.password.trim()) throw new Error('Please enter your password.');
      if (isSignup && !form.name.trim()) throw new Error('Please enter your name.');

      if (forgot) {
        await api('/auth/forgot-password', { method: 'POST', body: { email: form.email } });
        toast.success('Reset instructions sent if the account exists.');
        setForgot(false);
      } else {
        await (isSignup ? signup(form) : login(form));
        navigate('/');
      }
    } catch (error) {
      toast.error(error.message || 'Unable to complete authentication.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="app-shell min-h-screen bg-slate-950 text-white">
      <div className="app-backdrop absolute inset-0" />
      <main className="relative mx-auto grid min-h-screen w-full max-w-7xl items-center gap-10 px-5 py-10 lg:grid-cols-[1.25fr_480px]">
        <motion.section initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
          <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-100 shadow-xl shadow-black/10 backdrop-blur-xl">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-blue-500 via-indigo-500 to-fuchsia-500 text-white shadow-lg shadow-blue-500/20">
              <KanbanSquare size={20} />
            </span>
            <span>Focused workflow for ambitious teams.</span>
          </div>

          <div className="max-w-2xl space-y-6">
            <h1 className="text-5xl font-black tracking-tight sm:text-6xl">Build clarity, speed, and collaboration in one beautiful workspace.</h1>
          </div>
        </motion.section>

        <motion.form initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }} onSubmit={submit} className="glass rounded-[2.5rem] border border-white/10 p-8 text-white shadow-[0_40px_120px_-50px_rgba(15,23,42,0.9)] ring-1 ring-white/10">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-3xl font-black">{forgot ? 'Reset password' : isSignup ? 'Sign up' : 'Sign in'}</h2>
              <p className="mt-2 text-sm font-semibold text-slate-500">{forgot ? 'Recover access to your workspace.' : isSignup ? 'Create your team account securely.' : 'Enter your credentials to continue.'}</p>
            </div>
            <span className="rounded-3xl bg-slate-900/60 px-4 py-2 text-xs uppercase tracking-[0.24em] text-slate-400 shadow-inner shadow-black/20">Secure</span>
          </div>

          <div className="mt-8 grid gap-4">
            {isSignup && !forgot && (
              <label className="grid gap-2 text-sm font-semibold text-slate-300">
                Full name
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input className="input pl-11" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Your full name" />
                </div>
              </label>
            )}
            {isSignup && !forgot && (
              <label className="grid gap-2 text-sm font-semibold text-slate-300">
                Admin invite code
                <input className="input" placeholder="Enter invite code if applicable" value={form.inviteCode} onChange={(e) => setForm({ ...form, inviteCode: e.target.value })} />
                <p className="text-xs font-semibold text-slate-500">Optional: valid invite code is required only for Admin access.</p>
              </label>
            )}
            <label className="grid gap-2 text-sm font-semibold text-slate-300">
              Email address
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input className="input pl-11" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="name@company.com" />
              </div>
            </label>
            {!forgot && (
              <label className="grid gap-2 text-sm font-semibold text-slate-300">
                Password
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input className="input pl-11" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="••••••••" />
                </div>
              </label>
            )}
          </div>

          <button disabled={busy} className="btn-primary mt-8 w-full">{busy ? 'Processing...' : forgot ? 'Send reset link' : isSignup ? 'Create account' : 'Login'}</button>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 text-sm font-semibold text-slate-500">
            <button type="button" onClick={() => setForgot(!forgot)} className="hover:text-blue-400">{forgot ? 'Back to login' : 'Forgot password?'}</button>
            {!forgot && <Link className="hover:text-blue-400" to={isSignup ? '/login' : '/signup'}>{isSignup ? 'Already have an account?' : 'Create a new account'}</Link>}
          </div>

        </motion.form>
      </main>
    </div>
  );
}
