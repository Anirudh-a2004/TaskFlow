import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CalendarDays, CheckCircle2, Clock, FolderKanban, TrendingUp, TriangleAlert } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import Skeleton from '../components/Skeleton.jsx';
import { api } from '../utils/api.js';

const cards = [
  ['projects', 'Projects', FolderKanban, 'from-blue-500 to-cyan-500'],
  ['completed', 'Completed', CheckCircle2, 'from-emerald-500 to-teal-500'],
  ['pending', 'Pending', Clock, 'from-amber-500 to-orange-500'],
  ['overdue', 'Overdue', TriangleAlert, 'from-rose-500 to-red-500']
];

export default function Dashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    api('/dashboard').then(setData);
  }, []);

  if (!data) {
    return (
      <div className="grid gap-6">
        <Skeleton className="h-28 rounded-[2rem]" />
        <Skeleton className="h-96 rounded-[2rem]" />
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      <div className="space-y-3">
        <div className="inline-flex items-center gap-3 rounded-full bg-white/[0.06] px-4 py-2 text-sm font-semibold uppercase tracking-[0.24em] text-cyan-200 shadow-inner shadow-black/10">
          Product update
        </div>
        <div>
          <p className="text-sm font-black uppercase text-fuchsia-300">Command center</p>
          <h1 className="mt-1 text-3xl font-black tracking-tight sm:text-4xl">Dashboard</h1>
          <p className="mt-3 max-w-2xl text-sm text-slate-400">Monitor performance, discover team momentum, and stay on top of the most important work across your organization.</p>
        </div>
      </div>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map(([key, label, Icon, gradient], index) => (
          <motion.article
            key={key}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="card overflow-hidden p-5"
          >
            <div className={`mb-5 grid h-14 w-14 place-items-center rounded-3xl bg-gradient-to-br ${gradient} text-white shadow-lg shadow-slate-900/20`}>
              <Icon size={20} />
            </div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">{label}</p>
            <p className="mt-3 text-4xl font-black text-white">{data.cards[key]}</p>
            <p className="mt-4 text-sm leading-6 text-slate-400">A quick view of your current team workload and task progress.</p>
          </motion.article>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="card min-w-0 p-6">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-300">Productivity</p>
              <h2 className="mt-2 text-2xl font-black">Weekly performance</h2>
            </div>
            <span className="pill bg-slate-800/70 text-slate-200">Live insights</span>
          </div>
          <div className="h-80 min-w-0">
            <ResponsiveContainer>
              <BarChart data={data.productivity}>
                <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="rgba(148,163,184,.18)" />
                <XAxis dataKey="day" stroke="#94a3b8" tickLine={false} axisLine={false} />
                <YAxis allowDecimals={false} stroke="#94a3b8" tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#020617', borderRadius: 18, border: '1px solid rgba(148,163,184,0.18)' }} />
                <Bar dataKey="created" fill="#60a5fa" radius={[12, 12, 0, 0]} />
                <Bar dataKey="completed" fill="#6366f1" radius={[12, 12, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.08 }} className="card min-w-0 p-6">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-blue-300">Task status</p>
              <h2 className="mt-2 text-2xl font-black">Status breakdown</h2>
            </div>
            <span className="pill bg-white/10 text-slate-200">Balanced view</span>
          </div>
          <div className="h-80 min-w-0">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={data.statusCounts} dataKey="value" nameKey="name" innerRadius={70} outerRadius={110} paddingAngle={6}>
                  {['#94a3b8', '#06b6d4', '#8b5cf6', '#22c55e'].map((color) => <Cell key={color} fill={color} />)}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#020617', borderRadius: 18, border: '1px solid rgba(148,163,184,0.18)' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.75fr_1.25fr]">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.12 }} className="card p-6">
          <div className="mb-5 flex items-center gap-3">
            <CalendarDays className="text-blue-500" />
            <h2 className="text-xl font-black">Upcoming schedule</h2>
          </div>
          <div className="grid gap-4">
            {data.calendar.slice(0, 7).map((item) => (
              <div key={item.id} className="group flex items-center justify-between gap-4 rounded-3xl border border-white/10 bg-white/[0.04] p-4 transition hover:border-cyan-300/20 hover:bg-white/[0.08]">
                <div>
                  <p className="font-bold text-white">{item.title}</p>
                  <p className="mt-1 text-sm text-slate-400">{item.project}</p>
                </div>
                <span className="pill bg-cyan-500/10 text-cyan-200">{new Date(item.date).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.14 }} className="card p-6">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-fuchsia-300">Activity timeline</p>
              <h2 className="mt-2 text-xl font-black">Team actions</h2>
            </div>
            <span className="pill bg-white/10 text-slate-200">Recent</span>
          </div>
          <div className="relative space-y-6 pl-8">
            <div className="absolute left-5 top-0 h-full w-px bg-white/10" />
            {data.recentActivity.slice(0, 6).map((item) => (
              <div key={item._id} className="relative rounded-3xl border border-white/10 bg-white/[0.04] p-4 shadow-inner shadow-black/5">
                <div className="absolute left-[-10px] top-5 h-4 w-4 rounded-full bg-cyan-400 shadow-[0_0_0_6px_rgba(6,182,212,0.08)]" />
                <p className="text-sm font-black text-white">{item.actor?.name || 'System'} <span className="font-semibold text-cyan-200">{item.action}</span></p>
                <p className="mt-2 text-sm leading-6 text-slate-400">{item.detail}</p>
                <p className="mt-3 text-xs uppercase tracking-[0.25em] text-slate-500">{new Date(item.createdAt).toLocaleString()}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </section>
    </div>
  );
}
