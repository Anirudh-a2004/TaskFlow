import { motion } from 'framer-motion';
import { ArrowRight, BarChart3, Bell, CalendarDays, ChevronRight, FolderKanban, KanbanSquare, MessageSquare, ShieldCheck, Sparkles, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } }
};

const stagger = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } }
};

const features = [
  {
    title: 'Portfolio clarity',
    text: 'Track project health, priority, members, and deadlines from a focused command center.',
    icon: FolderKanban,
    tone: 'from-blue-500 to-cyan-400'
  },
  {
    title: 'Execution rhythm',
    text: 'Move work across a responsive Kanban board with clear ownership and delivery context.',
    icon: KanbanSquare,
    tone: 'from-violet-500 to-fuchsia-400'
  },
  {
    title: 'Team signal',
    text: 'Notifications, timelines, and collaboration cues keep everyone aligned without noise.',
    icon: Bell,
    tone: 'from-emerald-500 to-teal-400'
  },
  {
    title: 'Enterprise controls',
    text: 'Role-aware flows, profile settings, admin views, and secure workspace access stay built in.',
    icon: ShieldCheck,
    tone: 'from-amber-500 to-orange-400'
  }
];

const stats = [
  { label: 'Faster planning cycles', value: '42%' },
  { label: 'Tasks visible in one board', value: '100%' },
  { label: 'Team updates centralized', value: '3x' },
  { label: 'Workspace uptime focus', value: '24/7' }
];

const testimonials = [
  {
    quote: 'TaskFlow gives our product, design, and engineering leads the same operating picture without another status meeting.',
    name: 'Maya Chen',
    role: 'VP Product'
  },
  {
    quote: 'The board feels fast, the timeline is obvious, and our managers can finally see ownership without digging through tabs.',
    name: 'Arjun Mehta',
    role: 'Delivery Lead'
  },
  {
    quote: 'It has the polish of a premium SaaS workspace with the practical controls our internal teams need every day.',
    name: 'Nora Williams',
    role: 'Operations Director'
  }
];

function LogoMark() {
  return (
    <div className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-blue-500 via-indigo-500 to-fuchsia-500 text-white shadow-lg shadow-blue-500/25 ring-1 ring-white/20">
      <KanbanSquare size={22} />
    </div>
  );
}

function DashboardMockup({ compact = false }) {
  const columns = [
    { label: 'Todo', count: 8, color: 'from-slate-400 to-slate-600' },
    { label: 'In Progress', count: 5, color: 'from-blue-400 to-cyan-400' },
    { label: 'Review', count: 3, color: 'from-amber-400 to-orange-400' },
    { label: 'Complete', count: 14, color: 'from-emerald-400 to-teal-400' }
  ];

  return (
    <div className={`relative overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950/80 shadow-2xl shadow-black/40 backdrop-blur-2xl ${compact ? 'p-3' : 'p-4 sm:p-5'}`}>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(59,130,246,.18),transparent_30%),radial-gradient(circle_at_80%_0%,rgba(217,70,239,.12),transparent_28%)]" />
      <div className="relative">
        <div className="mb-4 flex items-center justify-between gap-3 border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <LogoMark />
            <div>
              <p className="text-sm font-black text-white">TaskFlow</p>
              <p className="text-xs font-semibold text-slate-500">Workspace overview</p>
            </div>
          </div>
          <div className="hidden items-center gap-2 sm:flex">
            <span className="h-2 w-2 rounded-full bg-emerald-300 shadow-[0_0_16px_rgba(110,231,183,.75)]" />
            <span className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Live</span>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-4">
          {stats.map((item) => (
            <div key={item.label} className="rounded-2xl border border-white/10 bg-white/[0.055] p-3">
              <p className="text-lg font-black text-white">{item.value}</p>
              <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">{item.label}</p>
            </div>
          ))}
        </div>

        <div className="mt-4 grid gap-3 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3 sm:p-4">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-300">Execution board</p>
                <h3 className="mt-1 text-lg font-black text-white">Delivery pipeline</h3>
              </div>
              <BarChart3 size={20} className="text-cyan-300" />
            </div>
            <div className="grid gap-3 sm:grid-cols-4">
              {columns.map((column) => (
                <div key={column.label} className="min-h-40 rounded-2xl border border-white/10 bg-slate-950/55 p-3">
                  <div className={`mb-3 h-1.5 rounded-full bg-gradient-to-r ${column.color}`} />
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-black text-white">{column.label}</p>
                    <span className="rounded-lg bg-white/10 px-2 py-1 text-xs font-black text-slate-300">{column.count}</span>
                  </div>
                  <div className="mt-3 grid gap-2">
                    <div className="rounded-xl bg-white/[0.065] p-2">
                      <div className="h-2 w-4/5 rounded-full bg-white/25" />
                      <div className="mt-2 h-2 w-1/2 rounded-full bg-white/10" />
                    </div>
                    <div className="rounded-xl bg-white/[0.045] p-2">
                      <div className="h-2 w-2/3 rounded-full bg-white/20" />
                      <div className="mt-2 h-2 w-3/5 rounded-full bg-white/10" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-3">
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <div className="mb-4 flex items-center gap-2">
                <CalendarDays size={18} className="text-fuchsia-300" />
                <p className="text-sm font-black text-white">Priority timeline</p>
              </div>
              {['Launch billing flow', 'Review onboarding copy', 'QA calendar sync'].map((item, index) => (
                <div key={item} className="flex items-center gap-3 border-t border-white/10 py-3 first:border-t-0 first:pt-0">
                  <div className="grid h-8 w-8 place-items-center rounded-xl bg-white/10 text-xs font-black text-white">{index + 1}</div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-white">{item}</p>
                    <p className="text-xs font-semibold text-slate-500">Owner assigned</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-cyan-500/10 to-fuchsia-500/10 p-4">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-300">Team pulse</p>
              <p className="mt-2 text-2xl font-black text-white">18 updates</p>
              <p className="mt-1 text-sm font-semibold text-slate-400">Comments, assignments, and deadlines in one activity stream.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Landing() {
  const { user } = useAuth();
  const workspacePath = '/dashboard';
  const primaryTo = user ? workspacePath : '/signup';
  const secondaryTo = user ? workspacePath : '/login';

  return (
    <div className="min-h-screen overflow-hidden bg-slate-950 text-white">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_20%_10%,rgba(59,130,246,.24),transparent_28%),radial-gradient(circle_at_85%_5%,rgba(20,184,166,.16),transparent_24%),radial-gradient(circle_at_45%_75%,rgba(217,70,239,.14),transparent_28%)]" />

      <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/72 backdrop-blur-2xl">
        <nav className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <Link to="/landing" className="flex items-center gap-3">
            <LogoMark />
            <div>
              <p className="text-lg font-black tracking-tight">TaskFlow</p>
              <p className="hidden text-xs font-semibold text-slate-500 sm:block">Enterprise task command</p>
            </div>
          </Link>

          <div className="hidden items-center gap-6 text-sm font-bold text-slate-400 md:flex">
            <a href="#features" className="transition hover:text-white">Features</a>
            <a href="#preview" className="transition hover:text-white">Preview</a>
            <a href="#teams" className="transition hover:text-white">Teams</a>
          </div>

          <div className="flex items-center gap-2">
            <Link to={secondaryTo} className="btn-secondary hidden !py-2.5 sm:inline-flex">
              {user ? 'Dashboard' : 'Login'}
            </Link>
            <Link to={primaryTo} className="btn-primary !py-2.5">
              {user ? 'Open workspace' : 'Start free'}
              <ArrowRight size={16} />
            </Link>
          </div>
        </nav>
      </header>

      <main>
        <section className="relative min-h-[calc(100vh-76px)] overflow-hidden">
          <div className="absolute inset-x-0 bottom-0 top-20 mx-auto w-[min(1180px,94vw)] opacity-70 blur-[1px]">
            <DashboardMockup compact />
          </div>
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/20 via-slate-950/72 to-slate-950" />

          <motion.div initial="hidden" animate="show" variants={stagger} className="relative mx-auto flex min-h-[calc(100vh-76px)] max-w-7xl flex-col items-center justify-center px-4 py-20 text-center sm:px-6 lg:px-8">
            <motion.div variants={fadeUp} className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.07] px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-cyan-200 shadow-xl shadow-black/20 backdrop-blur-2xl">
              <Sparkles size={15} />
              Built for high-velocity teams
            </motion.div>
            <motion.h1 variants={fadeUp} className="max-w-5xl text-5xl font-black leading-[0.96] tracking-tight text-white sm:text-6xl lg:text-7xl">
              The premium task workspace for modern product teams.
            </motion.h1>
            <motion.p variants={fadeUp} className="mt-6 max-w-2xl text-base font-semibold leading-8 text-slate-300 sm:text-lg">
              TaskFlow brings projects, Kanban execution, deadlines, notifications, and team management into one fast, secure, dark SaaS command center.
            </motion.p>
            <motion.div variants={fadeUp} className="mt-8 flex w-full flex-col justify-center gap-3 sm:w-auto sm:flex-row">
              <Link to={primaryTo} className="btn-primary px-6 py-4">
                {user ? 'Open workspace' : 'Create workspace'}
                <ArrowRight size={18} />
              </Link>
              <a href="#preview" className="btn-secondary px-6 py-4">
                View product
                <ChevronRight size={18} />
              </a>
            </motion.div>
          </motion.div>
        </section>

        <motion.section id="features" initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }} variants={stagger} className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <motion.div variants={fadeUp} className="max-w-3xl">
            <p className="text-xs font-black uppercase tracking-[0.24em] text-cyan-300">Feature system</p>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-white sm:text-5xl">Everything your team needs to move work from idea to shipped.</h2>
          </motion.div>
          <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {features.map(({ title, text, icon: Icon, tone }) => (
              <motion.article key={title} variants={fadeUp} whileHover={{ y: -6 }} className="card group p-5 transition duration-300 hover:border-cyan-300/30 hover:bg-white/[0.085]">
                <div className={`grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br ${tone} text-white shadow-lg shadow-blue-500/20`}>
                  <Icon size={21} />
                </div>
                <h3 className="mt-5 text-lg font-black text-white">{title}</h3>
                <p className="mt-3 text-sm font-semibold leading-6 text-slate-400">{text}</p>
              </motion.article>
            ))}
          </div>
        </motion.section>

        <motion.section id="preview" initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.18 }} variants={stagger} className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <motion.div variants={fadeUp} className="mb-8 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.24em] text-fuchsia-300">Dashboard preview</p>
              <h2 className="mt-3 text-3xl font-black tracking-tight text-white sm:text-5xl">A workspace that feels calm under pressure.</h2>
            </div>
            <p className="max-w-xl text-sm font-semibold leading-7 text-slate-400">
              Clear hierarchy, compact controls, live activity, and glassmorphism surfaces designed for repeated daily use.
            </p>
          </motion.div>
          <motion.div variants={fadeUp}>
            <DashboardMockup />
          </motion.div>
        </motion.section>

        <motion.section initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }} variants={stagger} className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="premium-card overflow-hidden p-5 sm:p-7">
            <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
              <motion.div variants={fadeUp}>
                <p className="text-xs font-black uppercase tracking-[0.24em] text-cyan-300">Productivity metrics</p>
                <h2 className="mt-3 text-3xl font-black tracking-tight text-white sm:text-4xl">Designed to reduce coordination drag.</h2>
                <p className="mt-4 text-sm font-semibold leading-7 text-slate-400">
                  Give every team a shared source of truth for what matters now, what is blocked, and what is ready to ship.
                </p>
              </motion.div>
              <div className="grid gap-3 sm:grid-cols-2">
                {stats.map((stat) => (
                  <motion.div key={stat.label} variants={fadeUp} whileHover={{ y: -4 }} className="rounded-2xl border border-white/10 bg-white/[0.045] p-5 transition hover:bg-white/[0.08]">
                    <p className="text-4xl font-black text-white">{stat.value}</p>
                    <p className="mt-2 text-sm font-bold uppercase tracking-[0.16em] text-slate-500">{stat.label}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </motion.section>

        <motion.section id="teams" initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.18 }} variants={stagger} className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <motion.div variants={fadeUp} className="mx-auto max-w-3xl text-center">
            <p className="text-xs font-black uppercase tracking-[0.24em] text-fuchsia-300">Team collaboration</p>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-white sm:text-5xl">Loved by teams that need speed and accountability.</h2>
          </motion.div>
          <div className="mt-10 grid gap-4 lg:grid-cols-3">
            {testimonials.map((item) => (
              <motion.article key={item.name} variants={fadeUp} whileHover={{ y: -5 }} className="card p-5 transition duration-300 hover:border-fuchsia-300/25 hover:bg-white/[0.08]">
                <MessageSquare className="text-cyan-300" size={22} />
                <p className="mt-5 text-sm font-semibold leading-7 text-slate-300">"{item.quote}"</p>
                <div className="mt-6 flex items-center gap-3">
                  <div className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-500 to-fuchsia-500 text-sm font-black text-white">
                    {item.name[0]}
                  </div>
                  <div>
                    <p className="font-black text-white">{item.name}</p>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{item.role}</p>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        </motion.section>

        <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-blue-600/15 via-indigo-600/10 to-fuchsia-600/15 p-6 text-center shadow-2xl backdrop-blur-2xl sm:p-10">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-3xl bg-white/10 text-cyan-300">
              <Zap size={24} />
            </div>
            <h2 className="mx-auto mt-5 max-w-2xl text-3xl font-black tracking-tight text-white sm:text-4xl">Start operating with more clarity today.</h2>
            <p className="mx-auto mt-3 max-w-xl text-sm font-semibold leading-7 text-slate-400">
              Bring planning, execution, deadlines, and collaboration into one premium workspace.
            </p>
            <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
              <Link to={primaryTo} className="btn-primary px-6 py-4">
                {user ? 'Open TaskFlow' : 'Create workspace'}
                <ArrowRight size={18} />
              </Link>
              <Link to={secondaryTo} className="btn-secondary px-6 py-4">
                {user ? 'Go to dashboard' : 'Login'}
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/10 bg-slate-950/80">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
          <div className="flex items-center gap-3">
            <LogoMark />
            <div>
              <p className="font-black text-white">TaskFlow</p>
              <p className="text-sm font-semibold text-slate-500">Modern team task manager</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-sm font-semibold text-slate-500">
            <a href="#features" className="transition hover:text-white">Features</a>
            <a href="#preview" className="transition hover:text-white">Preview</a>
            <a href="#teams" className="transition hover:text-white">Teams</a>
            <span>2026 TaskFlow</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
