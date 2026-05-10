import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, Calendar, CheckCircle2, Clock, FolderKanban, Sparkles, TrendingUp, TriangleAlert, Users } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import Skeleton from '../components/Skeleton.jsx';
import { api } from '../utils/api.js';
import { useAuth } from '../context/AuthContext.jsx';

const cards = [
  { key: 'projects', label: 'Active Projects', icon: FolderKanban, gradient: 'from-blue-500 to-cyan-500', trend: '+2.5%' },
  { key: 'completed', label: 'Completed Tasks', icon: CheckCircle2, gradient: 'from-emerald-500 to-teal-500', trend: '+12.3%' },
  { key: 'pending', label: 'Pending Work', icon: Clock, gradient: 'from-amber-500 to-orange-500', trend: '-3.1%' },
  { key: 'overdue', label: 'Overdue Items', icon: TriangleAlert, gradient: 'from-rose-500 to-red-500', trend: '-5.2%' }
];

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1
    }
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' }
  }
};

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [timeRange, setTimeRange] = useState('week');

  useEffect(() => {
    api('/dashboard').then(setData);
  }, []);

  if (!data) {
    return (
      <div className="grid gap-6">
        <Skeleton className="h-32 rounded-[2rem]" />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-[2rem]" />
          ))}
        </div>
        <Skeleton className="h-96 rounded-[2rem]" />
      </div>
    );
  }

  return (
    <motion.div initial="hidden" animate="show" className="grid gap-8">
      {/* Welcome Section */}
      <motion.div
        variants={cardVariants}
        className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-gradient-to-br from-blue-600/15 via-indigo-600/10 to-fuchsia-600/15 p-8 shadow-2xl backdrop-blur-2xl"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-transparent to-fuchsia-500/10" />
        <div className="relative flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-center">
          <div className="flex items-center gap-4">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="grid h-16 w-16 place-items-center rounded-3xl bg-gradient-to-br from-blue-600 via-indigo-500 to-fuchsia-500 shadow-lg shadow-blue-500/30 ring-2 ring-white/10"
            >
              <span className="text-2xl font-black text-white">{user?.name?.[0] || 'U'}</span>
            </motion.div>
            <div>
              <h2 className="text-3xl font-black tracking-tight text-white">Welcome back, {user?.name?.split(' ')[0]}</h2>
              <p className="mt-2 text-sm font-semibold text-slate-400">Ready to make an impact today?</p>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-fuchsia-600 px-6 py-3 font-black text-white shadow-lg shadow-blue-600/25 transition hover:shadow-lg hover:shadow-fuchsia-600/30"
          >
            <Sparkles size={18} />
            Get Started
          </motion.button>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div variants={containerVariants} className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map(({ key, label, icon: Icon, gradient, trend }, index) => (
          <motion.article key={key} variants={cardVariants} className="group card overflow-hidden p-6">
            <div className="flex items-start justify-between gap-3">
              <div className={`grid h-14 w-14 place-items-center rounded-3xl bg-gradient-to-br ${gradient} shadow-lg`}>
                <Icon size={22} className="text-white" />
              </div>
              <motion.div
                whileHover={{ scale: 1.1 }}
                className={`text-sm font-black ${trend.startsWith('+') ? 'text-emerald-400' : 'text-rose-400'}`}
              >
                {trend}
              </motion.div>
            </div>
            <p className="mt-4 text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">{label}</p>
            <motion.p
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 + index * 0.1 }}
              className="mt-3 text-4xl font-black text-white"
            >
              {data.cards[key]}
            </motion.p>
            <motion.div className="mt-4 h-1 rounded-full bg-white/10">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(data.cards[key] * 15, 100)}%` }}
                transition={{ delay: 0.3 + index * 0.1, duration: 0.8 }}
                className={`h-1 rounded-full bg-gradient-to-r ${gradient}`}
              />
            </motion.div>
          </motion.article>
        ))}
      </motion.div>

      {/* Analytics Section */}
      <div className="grid gap-6 xl:grid-cols-3">
        {/* Productivity Chart */}
        <motion.div
          variants={cardVariants}
          className="col-span-full rounded-[2rem] border border-white/10 bg-white/[0.055] p-6 shadow-2xl backdrop-blur-2xl xl:col-span-2"
        >
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-300">Productivity</p>
              <h3 className="mt-2 text-2xl font-black text-white">Weekly analytics</h3>
            </div>
            <div className="flex gap-2">
              {['day', 'week', 'month'].map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`rounded-lg px-3 py-1 text-xs font-semibold uppercase transition ${
                    timeRange === range ? 'bg-blue-600 text-white' : 'bg-white/10 text-slate-400 hover:bg-white/15'
                  }`}
                >
                  {range}
                </button>
              ))}
            </div>
          </div>
          <div className="h-96">
            <ResponsiveContainer>
              <BarChart data={data.productivity} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="grad1" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#60a5fa" />
                    <stop offset="100%" stopColor="#3b82f6" />
                  </linearGradient>
                  <linearGradient id="grad2" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#6366f1" />
                    <stop offset="100%" stopColor="#4f46e5" />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="rgba(148,163,184,.1)" />
                <XAxis dataKey="day" stroke="#94a3b8" tickLine={false} axisLine={false} style={{ fontSize: '12px' }} />
                <YAxis allowDecimals={false} stroke="#94a3b8" tickLine={false} axisLine={false} style={{ fontSize: '12px' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#020617',
                    borderRadius: '16px',
                    border: '1px solid rgba(148,163,184,0.18)',
                    boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
                  }}
                  labelStyle={{ color: '#fff' }}
                />
                <Bar dataKey="created" fill="url(#grad1)" radius={[12, 12, 0, 0]} />
                <Bar dataKey="completed" fill="url(#grad2)" radius={[12, 12, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Task Status Pie */}
        <motion.div
          variants={cardVariants}
          className="rounded-[2rem] border border-white/10 bg-white/[0.055] p-6 shadow-2xl backdrop-blur-2xl"
        >
          <div className="mb-6">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-blue-300">Distribution</p>
            <h3 className="mt-2 text-2xl font-black text-white">Task status</h3>
          </div>
          <div className="h-80">
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={data.statusCounts}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={60}
                  outerRadius={110}
                  paddingAngle={6}
                  startAngle={90}
                  endAngle={-270}
                >
                  {['#94a3b8', '#06b6d4', '#8b5cf6', '#22c55e'].map((color) => (
                    <Cell key={color} fill={color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#020617',
                    borderRadius: '16px',
                    border: '1px solid rgba(148,163,184,0.18)',
                    boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
                  }}
                  labelStyle={{ color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Bottom Section */}
      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        {/* Upcoming Calendar */}
        <motion.div
          variants={cardVariants}
          className="rounded-[2rem] border border-white/10 bg-white/[0.055] p-6 shadow-2xl backdrop-blur-2xl"
        >
          <div className="mb-6 flex items-center gap-3">
            <Calendar className="text-blue-400" size={22} />
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">Schedule</p>
              <h3 className="text-lg font-black text-white">Upcoming tasks</h3>
            </div>
          </div>
          <div className="space-y-3">
            {data.calendar.slice(0, 6).map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.08 }}
                className="group flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 transition hover:bg-white/[0.08]"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-white">{item.title}</p>
                  <p className="text-xs text-slate-500">{item.project}</p>
                </div>
                <span className="pill ml-2 flex-shrink-0 bg-cyan-500/10 text-cyan-200">
                  {new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Activity Timeline */}
        <motion.div
          variants={cardVariants}
          className="rounded-[2rem] border border-white/10 bg-white/[0.055] p-6 shadow-2xl backdrop-blur-2xl"
        >
          <div className="mb-6 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <TrendingUp className="text-fuchsia-400" size={22} />
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">Activity</p>
                <h3 className="text-lg font-black text-white">Team timeline</h3>
              </div>
            </div>
            <span className="pill bg-white/10 text-slate-200">Today</span>
          </div>
          <div className="relative space-y-5 pl-8">
            <div className="absolute left-5 top-0 h-full w-px bg-gradient-to-b from-cyan-400/50 via-cyan-400/25 to-transparent" />
            {data.recentActivity.slice(0, 5).map((item, index) => (
              <motion.div
                key={item._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="group relative"
              >
                <motion.div
                  whileHover={{ scale: 1.2 }}
                  className="absolute left-[-10px] top-2 h-5 w-5 rounded-full bg-gradient-to-br from-cyan-400 to-blue-400 shadow-[0_0_0_8px_rgba(6,182,212,0.1)]"
                />
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 transition hover:border-cyan-300/30 hover:bg-white/[0.08]">
                  <p className="text-sm font-black text-white">
                    {item.actor?.name || 'System'} <span className="font-semibold text-cyan-300">{item.action}</span>
                  </p>
                  <p className="mt-1 text-xs leading-5 text-slate-400">{item.detail}</p>
                  <p className="mt-2 text-xs uppercase tracking-[0.2em] text-slate-600">
                    {new Date(item.createdAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div
        variants={cardVariants}
        className="rounded-[2rem] border border-white/10 bg-gradient-to-r from-blue-600/10 via-indigo-600/10 to-fuchsia-600/10 p-6 shadow-2xl backdrop-blur-2xl"
      >
        <p className="mb-4 text-sm font-semibold uppercase tracking-[0.24em] text-slate-400">Quick Actions</p>
        <div className="grid gap-3 md:grid-cols-3">
          {[
            { label: 'Create Project', icon: FolderKanban },
            { label: 'Add Task', icon: CheckCircle2 },
            { label: 'Invite Team', icon: Users }
          ].map((action, idx) => {
            const Icon = action.icon;
            return (
              <motion.button
                key={idx}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center justify-center gap-2 rounded-2xl bg-white/[0.08] px-4 py-3 font-semibold text-white transition hover:bg-white/[0.12]"
              >
                <Icon size={18} />
                {action.label}
              </motion.button>
            );
          })}
        </div>
      </motion.div>
    </motion.div>
  );
}
